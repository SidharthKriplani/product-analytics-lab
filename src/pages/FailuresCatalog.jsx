import { useState } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { AddTrackBtn } from '../components/tracks/AddToTrackPopover.jsx';

const FAILURES = [
  // ─── Measurement & Instrumentation ─────────────────────────────────────────
  {
    id: 'f01',
    name: 'Bad Event Taxonomy',
    category: 'Instrumentation',
    severity: 'high',
    summary: 'Events named inconsistently or too broadly to be analytically useful.',
    symptom: 'Dashboard shows "button_click" accounting for 40% of all events. Analyst can\'t determine what was actually clicked.',
    cause: 'Engineers instrument what\'s easy to track (generic click handlers) rather than what analysts need to answer questions.',
    detection: 'Query events by name — if the top events are generic (click, view, action) rather than specific (checkout_complete, add_to_cart), the taxonomy is broken.',
    fix: 'Define an event naming convention before instrumentation: object_verb (cart_added, checkout_completed). Requires a tracking plan reviewed by analytics before engineering ships.',
    room: 'instrumentation',
  },
  {
    id: 'f02',
    name: 'Silent Data Pipeline Failure',
    category: 'Instrumentation',
    severity: 'critical',
    summary: 'Events stop flowing but no alert fires. Metrics appear normal because they\'re built on stale data.',
    symptom: 'DAU looks healthy for 3 days. On day 4, you realize the SDK stopped sending events on day 1.',
    cause: 'No data freshness check, no row-count SLA, no comparison to expected event volumes.',
    detection: 'Set up a monitoring query: alert if today\'s event count is <70% of the 7-day rolling average for the same weekday.',
    fix: 'Implement data freshness monitoring. Any pipeline older than 4 hours should alert. Row count variance >30% from baseline should alert.',
    room: 'instrumentation',
  },
  {
    id: 'f03',
    name: 'Double-Counting Sessions',
    category: 'Measurement',
    severity: 'high',
    summary: 'Session count is inflated because the same session is recorded multiple times.',
    symptom: 'Session counts are 2x what backend server logs show. Average session length is half of what it should be.',
    cause: 'Client-side SDK retries on network failure without deduplicating. Each retry generates a new session_start event.',
    detection: 'Compare client-side session count with server-side session count for the same time window. >10% gap warrants investigation.',
    fix: 'Use idempotency keys on session_start events. Server-side deduplication on session_id with a time window.',
    room: 'instrumentation',
  },
  {
    id: 'f04',
    name: 'Integer Division Truncation',
    category: 'SQL',
    severity: 'medium',
    summary: 'A conversion rate calculation returns 0 or a wrong integer because SQL integer division truncates.',
    symptom: 'Your SQL query returns conversion_rate = 0 for all rows even though conversions exist.',
    cause: '`SELECT conversions / sessions` in SQL performs integer division when both columns are integers. 2/100 = 0, not 0.02.',
    detection: 'Check your rate calculation: if both numerator and denominator are INT types, the result will be truncated.',
    fix: 'Cast to float: `CAST(conversions AS FLOAT) / sessions` or `conversions * 1.0 / sessions`.',
    room: 'sql-lab',
  },
  {
    id: 'f05',
    name: 'Duplicate Join Inflation',
    category: 'SQL',
    severity: 'high',
    summary: 'Joining tables without accounting for one-to-many relationships inflates row counts.',
    symptom: 'Revenue figure after joining orders to order_items is 3x the actual revenue. Row count doesn\'t match expectations.',
    cause: 'Each order has multiple order_items. Joining on order_id creates one row per item, then summing price gives inflated revenue.',
    detection: 'Check distinct order_id count before and after the join. If it changes, you have fan-out.',
    fix: 'Aggregate before joining: first SUM at the order_item level, then join to orders. Or use a subquery/CTE to collapse the many side first.',
    room: 'sql-lab',
  },

  // ─── Experiment Design & Analysis ──────────────────────────────────────────
  {
    id: 'f06',
    name: 'Peeking at Results Early',
    category: 'Experimentation',
    severity: 'high',
    summary: 'Stopping an experiment when results look good inflates the false positive rate.',
    symptom: 'Test is significant at day 5 of a planned 14-day run. PM wants to ship. Effect disappears or reverses by day 14.',
    cause: 'With multiple looks at the data, the probability of finding a spurious significant result increases. At 5 looks, the real alpha is ~14%, not 5%.',
    detection: 'If you\'re checking experiment results more than once during the planned runtime, you\'re peeking.',
    fix: 'Pre-commit to a fixed runtime or use sequential testing (mSPRT, group sequential methods) which adjusts alpha for multiple looks.',
    room: 'stats',
  },
  {
    id: 'f07',
    name: 'Novelty Effect Inflation',
    category: 'Experimentation',
    severity: 'medium',
    summary: 'A positive treatment effect exists only in the first few days because users are exploring something new.',
    symptom: 'Feature shows +15% engagement in week 1. By week 3 the lift is +2%. Team already shipped.',
    cause: 'Users naturally explore new features. Initial engagement doesn\'t reflect long-term behavior change.',
    detection: 'Plot treatment effect by day. If the lift is front-loaded (high on days 1-3, declining after), suspect novelty.',
    fix: 'Run experiments long enough to see the effect stabilize — typically 2+ weeks. Monitor post-ship with a holdout group.',
    room: 'design',
  },
  {
    id: 'f08',
    name: 'SUTVA Violation in Marketplace',
    category: 'Experimentation',
    severity: 'high',
    summary: 'User-level randomization in a two-sided marketplace creates interference between treatment and control.',
    symptom: 'Experiment shows a small positive effect on buyers. Sellers in the treatment arm are receiving more orders — affecting the supply available to control buyers.',
    cause: 'Buyer-level randomization violates SUTVA: treatment users compete with control users for the same supply (sellers, inventory, driver capacity).',
    detection: 'If your product has a shared resource (supply, inventory, drivers), user-level randomization is suspect.',
    fix: 'Use geo holdout, cluster randomization (by market/city), or switchback design to avoid cross-arm contamination.',
    room: 'design',
  },
  {
    id: 'f09',
    name: 'Post-Hoc Subgroup Fishing',
    category: 'Experimentation',
    severity: 'high',
    summary: 'Reporting a subgroup positive result as the primary finding when the overall experiment was null.',
    symptom: 'Overall experiment: p=0.42. Mobile users: p=0.03. Report says "mobile users show strong lift." Team ships to mobile.',
    cause: 'With 10 subgroups, 1 will be significant at p<0.1 by chance alone. Treating a post-hoc finding as confirmatory evidence is a logical error.',
    detection: 'Was the subgroup analysis pre-registered before the experiment launched? If not, it\'s exploratory, not confirmatory.',
    fix: 'Apply multiple testing correction to subgroup analyses. Treat post-hoc subgroup results as hypotheses for a follow-up experiment, not as evidence to act on.',
    room: 'stats',
  },
  {
    id: 'f10',
    name: 'Metric Gaming via Optimization',
    category: 'Metrics',
    severity: 'high',
    summary: 'A team optimizes a metric so hard that it improves the number while degrading the underlying reality.',
    symptom: 'Session count is up 40%. Session length is down 60%. Users are opening and closing the app rapidly to trigger notifications.',
    cause: 'The team optimized for session starts (the metric) without guardrails on session quality (the underlying value).',
    detection: 'Check the metric in combination with adjacent metrics. A metric moving while its correlates don\'t, or while user satisfaction falls, suggests gaming.',
    fix: 'Pair every primary metric with a guardrail that captures the quality dimension. "Sessions" needs "session quality" or "post-session return rate."',
    room: 'metrics',
  },
  {
    id: 'f11',
    name: 'Survivorship Bias in Cohort Analysis',
    category: 'Analysis',
    severity: 'medium',
    summary: 'Analyzing only the users who stayed makes the product look healthier than it is.',
    symptom: 'D30 retention of "engaged users" is 85%. Overall D30 retention is 22%. The "engaged users" analysis excluded churned users from the denominator.',
    cause: 'Filtering on a behavior that only retained users exhibit (e.g., "users who completed onboarding") removes churned users from the analysis.',
    detection: 'Check whether your cohort filter is applied before or after the retention calculation. If filtering on a post-acquisition behavior, you may have survivorship bias.',
    fix: 'Always define cohorts at the time of acquisition (signup date, first session) rather than on a behavior that requires survival.',
    room: 'rca',
  },
  {
    id: 'f12',
    name: 'Attribution Window Mismatch',
    category: 'Analysis',
    severity: 'medium',
    summary: 'Conversions are attributed to the wrong channel because the attribution window doesn\'t match the actual purchase cycle.',
    symptom: 'Email channel appears to have 10x ROI. Closer inspection: most email-attributed purchases happen 14+ days after the email, after the user also saw a retargeting ad.',
    cause: 'Last-touch attribution with a 30-day window credits email for conversions where multiple channels contributed.',
    detection: 'Compare last-touch attribution to a time-decay or data-driven model. Large discrepancies reveal multi-touch reality.',
    fix: 'Use incrementality testing (holdout groups per channel) rather than attribution modeling. Attribution tells you who touched the user, not who caused the conversion.',
    room: 'growth-analytics',
  },
  {
    id: 'f13',
    name: 'Simpson\'s Paradox in Segmentation',
    category: 'Analysis',
    severity: 'high',
    summary: 'An aggregate metric trend reverses when you segment by a confounding variable.',
    symptom: 'Overall conversion rate fell from 8% to 7%. But conversion rate improved in every individual segment. The aggregate drop is entirely explained by mix shift to a lower-converting segment.',
    cause: 'A compositional change (more users from a low-converting channel) masks segment-level improvement in the aggregate.',
    detection: 'When aggregate and segment-level trends diverge, check if the segment mix changed over the same period.',
    fix: 'Report segment-level metrics alongside aggregate metrics for any trend analysis. Always ask: did the mix of segments change?',
    room: 'rca',
  },
  {
    id: 'f14',
    name: 'Stale Feature Flags in Experiments',
    category: 'Experimentation',
    severity: 'medium',
    summary: 'An experiment\'s treatment group continues to receive the treatment after the experiment is "ended."',
    symptom: 'The experiment was called off 2 weeks ago. Usage of the experimental feature is still 50% of baseline — the feature flag was never cleaned up.',
    cause: 'Engineers forget to remove feature flags after experiment conclusion. Treatment users continue on the variant indefinitely.',
    detection: 'Audit active feature flags quarterly. Any flag that\'s been enabled for >60 days without a ship decision should be flagged.',
    fix: 'Feature flags must have a defined expiry when created. Ship decision or removal should be required before expiry.',
    room: 'design',
  },
  {
    id: 'f15',
    name: 'Selection Bias in Survey Analysis',
    category: 'Analysis',
    severity: 'high',
    summary: 'Survey respondents are systematically different from the population you\'re trying to understand.',
    symptom: 'Post-cancellation survey shows 40% of churned users say "too expensive." Leadership cuts price. Churn doesn\'t improve.',
    cause: 'Users who respond to cancellation surveys are not representative of all churned users — highly dissatisfied users disproportionately respond. "Too expensive" is also a socially acceptable excuse that masks the real reason (the product wasn\'t valuable enough).',
    detection: 'Compare respondent demographics to the full churn cohort. Low response rates (<30%) virtually guarantee selection bias.',
    fix: 'Weight survey responses by inverse response probability. Use passively observed behavior data to triangulate. Don\'t make pricing decisions from surveys alone.',
    room: 'rca',
  },
  {
    id: 'f16',
    name: 'Metric Definition Drift',
    category: 'Measurement',
    severity: 'high',
    summary: 'The same metric means different things to different teams because the definition changed without documentation.',
    symptom: 'Finance reports MAU = 4.2M. Product reports MAU = 5.1M. Both are "right" by their team\'s definition. Leadership doesn\'t know which to trust.',
    cause: 'MAU was originally defined as "any login," then product changed it to "any meaningful action" without updating the finance calculation.',
    detection: 'Two teams reporting different numbers for the same metric name is the primary signal. Track who owns each metric definition.',
    fix: 'Establish a metric catalog with versioned definitions, ownership, and calculation logic. Any change to a metric definition requires a migration plan for historical data.',
    room: 'instrumentation',
  },
  {
    id: 'f17',
    name: 'Confounding in Observational Analysis',
    category: 'Analysis',
    severity: 'high',
    summary: 'A correlation between two variables is explained by a third variable that wasn\'t controlled for.',
    symptom: 'Users who use the premium feature have 3x higher LTV. Decision: promote premium feature adoption aggressively. LTV doesn\'t improve.',
    cause: 'Premium feature users are already high-intent, high-engagement users. They have high LTV because of who they are, not because of the feature.',
    detection: 'Match premium feature users to similar non-users on observable pre-treatment characteristics. If the LTV gap shrinks to near-zero after matching, confounding explains the effect.',
    fix: 'Use causal inference methods (propensity score matching, DiD, instrumental variables) before claiming a feature drives an outcome.',
    room: 'stats',
  },
  {
    id: 'f18',
    name: 'NULL Propagation in Aggregates',
    category: 'SQL',
    severity: 'medium',
    summary: 'A NULL value in a join silently removes rows from an aggregate, causing understated counts.',
    symptom: 'Order revenue sum from a LEFT JOIN to users is 15% lower than the finance system shows. Investigation reveals orders with NULL user_id (guest checkouts) are excluded.',
    cause: 'LEFT JOIN produced NULLs for orders without matching users. Those NULLs were then filtered by a WHERE clause on a user column, converting the LEFT JOIN to an INNER JOIN.',
    detection: 'Check row counts before and after each JOIN. If they decrease significantly on a LEFT JOIN, NULL propagation via WHERE filtering is the likely cause.',
    fix: 'Move conditions on right-side join columns into the ON clause rather than the WHERE clause. `WHERE user.tier = \'premium\'` becomes `ON orders.user_id = users.id AND users.tier = \'premium\'`.',
    room: 'sql-lab',
  },
  {
    id: 'f19',
    name: 'Off-by-One in Date Ranges',
    category: 'SQL',
    severity: 'medium',
    summary: 'Date range filters include or exclude an extra day due to timestamp vs. date comparison.',
    symptom: 'Your "last 7 days" query returns 8 days of data when compared to the dashboard.',
    cause: '`WHERE created_at >= DATEADD(day, -7, GETDATE())` includes partial data from today. If the dashboard uses `DATE(created_at) >= date_sub(today, 7)`, the boundary differs.',
    detection: 'Compare the MIN and MAX dates returned by your query to the expected range.',
    fix: 'Be explicit about boundary inclusion: `WHERE DATE(created_at) >= \'2024-01-01\' AND DATE(created_at) < \'2024-01-08\'`. Never use `<=` for end dates with timestamps.',
    room: 'sql-lab',
  },
  {
    id: 'f20',
    name: 'Seasonality Misread as Trend',
    category: 'Analysis',
    severity: 'medium',
    summary: 'A recurring seasonal pattern is interpreted as a new trend, leading to incorrect root cause analysis.',
    symptom: 'DAU drops 15% every Sunday. New analyst flags it as a product regression. Investigation consumes 2 days of engineering time.',
    cause: 'No year-over-year or week-over-week baseline was checked. Sunday DAU has always been lower than weekday DAU.',
    detection: 'Before flagging any metric movement as anomalous, compare to the same period in prior weeks and prior year. A 7-day rolling average reveals true trend vs. seasonal pattern.',
    fix: 'Always compare metric changes to the same weekday prior week and prior year. Build seasonality-adjusted baselines into monitoring alerts.',
    room: 'rca',
  },
  {
    id: 'f21',
    name: 'Vanity Metric as North Star',
    category: 'Metrics',
    severity: 'high',
    summary: 'A metric looks good and grows easily but doesn\'t predict business health or user value.',
    symptom: 'App downloads growing 30% QoQ. Team is celebrating. D30 retention is 3%. Most downloads are non-activating.',
    cause: 'Downloads are easy to inflate (app store ads, viral loops) and hard to connect to real value. They measure acquisition interest, not value delivery.',
    detection: 'Test whether the north star metric predicts revenue at 6 and 12 months. If the correlation is weak, it\'s a vanity metric.',
    fix: 'North star metrics must be leading indicators of long-term value. Replace downloads with "activated users" or "users who completed core action in first 7 days."',
    room: 'metrics',
  },
  {
    id: 'f22',
    name: 'Cross-Device Identity Fragmentation',
    category: 'Measurement',
    severity: 'medium',
    summary: 'The same user is counted as multiple users because their identity isn\'t unified across devices.',
    symptom: 'DAU is 500k. Internal data team estimates real users at 320k. The gap is cross-device duplication — users who use both mobile and desktop are counted twice.',
    cause: 'Anonymous session IDs are assigned per device. Without a logged-in identifier that persists across devices, cross-device users appear as distinct users.',
    detection: 'Compare email-linked (authenticated) user counts to total user counts. Large gaps indicate cross-device inflation.',
    fix: 'Use a persistent identity layer: log users in, use email as the canonical identifier, and stitch anonymous pre-login events to the authenticated profile.',
    room: 'instrumentation',
  },
  {
    id: 'f23',
    name: 'Underpowered A/B Test',
    category: 'Experimentation',
    severity: 'high',
    summary: 'An experiment is designed with insufficient statistical power to detect the effect size it was designed to find.',
    symptom: 'Experiment runs 5 days and shows no significant effect. PM concludes "feature doesn\'t work." In reality, the test had 30% power — 70% chance of missing a real effect.',
    cause: 'Sample size wasn\'t calculated before launch. 5 days at current traffic gives less than 2,000 users per arm, enough to detect only a 15% lift.',
    detection: 'Post-hoc power analysis: given the effect size you were looking for and the sample you achieved, what was your power? <70% is unacceptably low.',
    fix: 'Always run a sample size calculation before launching. If sufficient power can\'t be achieved in reasonable runtime, reconsider whether the experiment is worth running.',
    room: 'stats',
  },
  {
    id: 'f24',
    name: 'Carryover in Switchback Experiments',
    category: 'Experimentation',
    severity: 'medium',
    summary: 'In a switchback experiment, the effect of one period bleeds into the next, biasing results.',
    symptom: 'Switchback experiment alternates algorithm A and algorithm B every 12 hours. Results show A is better, but B\'s periods that follow A\'s periods are systematically worse.',
    cause: 'Behavior changed during algorithm A\'s period (drivers repositioned, users formed habits) persists into algorithm B\'s periods, making B look worse than it is.',
    detection: 'Compare B\'s performance when it follows A versus when it follows itself. If there\'s a gap, carryover is present.',
    fix: 'Add washout periods between treatment arms. Use longer switchback periods (24-48 hours) to reduce carryover. Model carryover as a covariate in the analysis.',
    room: 'design',
  },
  {
    id: 'f25',
    name: 'Denominator Instability',
    category: 'Metrics',
    severity: 'medium',
    summary: 'A rate metric appears to change but the real change is in the denominator, not the numerator.',
    symptom: 'Error rate jumped from 0.5% to 2.1% overnight. Engineering investigates the error. In reality, total requests dropped 75% due to an outage — the error count was stable.',
    cause: 'Error rate = errors / requests. If requests (denominator) drops sharply, error rate rises even with constant error count.',
    detection: 'Always plot numerator and denominator separately alongside the rate. A rate change with a stable numerator and changing denominator is a denominator artifact.',
    fix: 'Monitor absolute counts and rates simultaneously. Alert on both. Never use a rate alert without a corresponding absolute count check.',
    room: 'metrics',
  },
];

const CAT_CONFIG = {
  'Instrumentation': { color: 'var(--teal)',   bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  'SQL':             { color: 'var(--accent)',  bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
  'Experimentation': { color: 'var(--purple)',  bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
  'Analysis':        { color: 'var(--yellow)',  bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  'Metrics':         { color: 'var(--green)',   bg: 'var(--green-bg)',  border: 'var(--green-border)' },
  'Measurement':     { color: 'var(--blue-text)', bg: 'var(--blue-bg)', border: 'var(--blue-border)' },
};

const SEV_COLOR = { critical: 'var(--red)', high: 'var(--yellow)', medium: 'var(--text-muted)' };

export function FailuresCatalog({ onNavigate, initialFailureId, onOpenFailure }) {
  const [catFilter, setCatFilter] = useState('All');
  const [selected, setSelected] = useState(() => initialFailureId ? (FAILURES.find(f => f.id === initialFailureId) || null) : null);
  // Select a failure AND report it up so the URL hash is deep-linkable.
  const selectFailure = (f) => { setSelected(f); if (onOpenFailure) onOpenFailure(f ? f.id : null); };

  const categories = ['All', ...Array.from(new Set(FAILURES.map(f => f.category)))];
  const displayed = catFilter === 'All' ? FAILURES : FAILURES.filter(f => f.category === catFilter);

  if (selected) {
    const f = selected;
    const cfg = CAT_CONFIG[f.category] || {};
    return (
      <div className="pal-page-enter" style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1rem' }}>
        <button onClick={() => selectFailure(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', padding: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          ← Failures Catalog
        </button>
        <div style={{ background: cfg.bg || 'var(--surface)', border: '1px solid ' + (cfg.border || 'var(--border)'), borderLeft: '4px solid ' + (cfg.color || 'var(--border)'), borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: cfg.color || 'var(--text-muted)', background: 'var(--surface)', border: '1px solid ' + (cfg.border || 'var(--border)'), borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.45rem' }}>{f.category}</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: SEV_COLOR[f.severity] }}>{f.severity}</span>
          </div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.01em' }}>{f.name}</h2>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.summary}</p>
        </div>
        {[
          { label: 'How it shows up', text: f.symptom },
          { label: 'Root cause', text: f.cause },
          { label: 'How to detect it', text: f.detection },
          { label: 'How to fix it', text: f.fix },
        ].map(({ label, text }) => (
          <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem', marginBottom: '0.65rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{label}</div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.7 }}>{text}</p>
          </div>
        ))}
        {f.room && onNavigate && (
          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => onNavigate(f.room)} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', cursor: 'pointer' }}>
              Practice this in PAL →
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pal-page-enter" style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--red-bg)', border: '1px solid var(--red-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="alert-triangle" size={18} color="var(--red)" />
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Analytics Failures</h1>
        </div>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '580px' }}>
          25 named failure patterns from real production analytics work. Each one shows you what breaks, why it breaks, how to detect it, and how to fix it.
        </p>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--red)', background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.55rem' }}>
          {FAILURES.length} failure patterns
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {categories.map(cat => {
          const active = catFilter === cat;
          const cfg = cat !== 'All' ? (CAT_CONFIG[cat] || {}) : {};
          return (
            <button key={cat} onClick={() => setCatFilter(cat)} style={{ background: active ? (cfg.bg || 'var(--surface-2)') : 'var(--surface)', border: active ? '2px solid ' + (cfg.color || 'var(--border)') : '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontWeight: active ? 700 : 500, color: active ? (cfg.color || 'var(--text)') : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.1s' }}>
              {cat}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: '0.65rem' }}>
        {displayed.map((f, i) => {
          const cfg = CAT_CONFIG[f.category] || {};
          return (
            <div key={f.id} onClick={() => selectFailure(f)} role="button" className="pal-card-hover" style={{ textAlign: 'left', background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid ' + (cfg.color || 'var(--border)'), borderRadius: 'var(--radius)', padding: '0.9rem 1rem', cursor: 'pointer', animationDelay: (i * 25) + 'ms' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: cfg.color, background: cfg.bg, border: '1px solid ' + (cfg.border || cfg.color), borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem' }}>{f.category}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: SEV_COLOR[f.severity], textTransform: 'uppercase' }}>{f.severity}</span>
                <span style={{ marginLeft: 'auto', display: 'inline-flex' }} onClick={e => e.stopPropagation()}>
                  <AddTrackBtn itemType="failure" itemId={f.id} label={f.name} itemMeta={{ category: f.category }} />
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)', marginBottom: '0.3rem' }}>{f.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{f.summary}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
