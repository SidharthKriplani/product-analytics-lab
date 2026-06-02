import { useState, useEffect } from 'react';
import { learningPaths } from '../data/learningPaths.js';
import { Icon } from '../components/shared/Icon.jsx';

const BRIEFS = [
  {
    id: 'brief-01',
    concept: 'Statistical Power',
    tldr: 'The probability your test detects a real effect when one exists. Low power = missed signals.',
    depth: 'Power depends on sample size, effect size, and α. Most A/B tests are underpowered — teams run them too short and then ship a null result that was actually a weak positive. Rule of thumb: aim for 80% power minimum. Use a sample size calculator before launching.',
    example: 'You run an A/B test for 3 days and see p=0.15. Do you stop? Not necessarily — if your expected effect is 2% lift on a 1M DAU product, you likely needed 2 weeks of data.',
    tags: ['statistics', 'a/b testing', 'experimentation'],
    learnMore: 'stat-foundations',
  },
  {
    id: 'brief-02',
    concept: 'North Star Metric',
    tldr: 'One metric that best captures the value your product delivers to users.',
    depth: 'NSM should reflect user value (not revenue), be measurable, and predict long-term growth. Common mistake: choosing DAU as NSM when DAU doesn\'t mean users got value — "messages sent" (Slack), "nights booked" (Airbnb), "hours watched" (Netflix) are better.',
    example: 'Facebook chose "10 friends in 10 days" as their early activation NSM. It predicted retention better than DAU because it proxied real social connection.',
    tags: ['product analytics', 'metrics', 'strategy'],
    learnMore: 'metrics',
  },
  {
    id: 'brief-03',
    concept: 'Cohort Retention',
    tldr: 'Tracking the same group of users over time to see how many stay active.',
    depth: 'Cross-sectional retention (all users on day N) is misleading — it mixes acquisition cohorts with different quality. Cohort retention isolates signal. A flattening retention curve = product has found its engaged core. A slope that never flattens = you have a leaky bucket.',
    example: 'Jan cohort: 1000 users, Day-7 = 400 (40%), Day-30 = 180 (18%), Day-90 = 120 (12%). The flattening from 18%→12% over 60 days suggests a sticky 12% core.',
    tags: ['retention', 'cohorts', 'growth analytics'],
    learnMore: 'growth-analytics',
  },
  {
    id: 'brief-04',
    concept: 'Simpson\'s Paradox',
    tldr: 'A trend appears in several groups but disappears or reverses when groups are combined.',
    depth: 'Classic in A/B testing: Treatment wins overall but loses in every segment. This happens when groups have different sizes and baseline rates. Always segment your results. Common culprit: device type (mobile converts lower, treatment skews mobile-heavy).',
    example: 'Overall: Control 15% conversion, Treatment 14%. But: Desktop Control 20% vs Treatment 22%. Mobile Control 10% vs Treatment 11%. Treatment actually wins in both segments — the aggregate reversal is a composition artifact.',
    tags: ['statistics', 'segmentation', 'a/b testing'],
    learnMore: 'stat-foundations',
  },
  {
    id: 'brief-05',
    concept: 'P-value Misconceptions',
    tldr: 'p < 0.05 does NOT mean there\'s a 95% chance your hypothesis is true.',
    depth: 'p-value = probability of seeing data this extreme IF the null is true. It says nothing about the probability the null IS true. Common error: "we have 95% confidence the treatment is better." Correct: "if the null were true, we\'d see this data only 5% of the time."',
    example: 'p=0.03 with n=50 and effect size 0.02%? Likely noise. p=0.03 with n=100,000 and effect size 2%? Worth shipping. p-value without effect size and sample size is almost meaningless.',
    tags: ['statistics', 'hypothesis testing'],
    learnMore: 'stat-foundations',
  },
  {
    id: 'brief-06',
    concept: 'DAU/MAU Ratio (Stickiness)',
    tldr: 'The fraction of monthly active users who return daily — a core engagement signal.',
    depth: 'DAU/MAU of 50%+ means roughly half of monthly users return daily. Benchmark varies by app type: social (50%+), tools (20-30%), e-commerce (5-10%). Watch out: if you inflate MAU with re-engagement campaigns, stickiness looks worse.',
    example: 'WhatsApp ~70% DAU/MAU. News apps ~15-20%. B2B tools ~25-40%. Your product\'s benchmark depends on its use case and cadence of natural need.',
    tags: ['engagement', 'growth analytics', 'metrics'],
    learnMore: 'growth-analytics',
  },
  {
    id: 'brief-07',
    concept: 'Regression to the Mean',
    tldr: 'Extreme measurements tend to move toward average on remeasurement — not due to intervention.',
    depth: 'If you pick your worst-performing cohort and "treat" them, they\'ll likely improve — not because of your treatment, but because they were extreme by chance. Common in product: A/B tests on pages that had an unusually bad week.',
    example: 'You notice Feature X had a terrible day-7 retention for the Dec cohort. You add an onboarding change. Jan cohort looks better. Was it the change? Maybe — or maybe Dec was just a bad acquisition month.',
    tags: ['statistics', 'experimentation'],
    learnMore: 'stat-foundations',
  },
  {
    id: 'brief-08',
    concept: 'Funnel Analysis',
    tldr: 'Tracking what fraction of users complete each sequential step toward a goal.',
    depth: 'Funnels reveal where drop-off is highest (opportunity) vs. where retention is already good. Key: define the funnel steps based on user intent, not just clicks. Time-bound your funnel (conversion within N days) or you conflate intent with timing.',
    example: 'Signup funnel: 10,000 visit → 4,000 click signup → 2,000 complete form → 1,500 verify email → 900 complete profile. The email verification step (2000→1500) is your biggest drop — that\'s where to focus.',
    tags: ['funnel', 'conversion', 'product analytics'],
    learnMore: 'growth-analytics',
  },
  {
    id: 'brief-09',
    concept: 'LTV / CAC Ratio',
    tldr: 'Lifetime value vs. customer acquisition cost — the unit economics health check.',
    depth: 'LTV:CAC > 3x is the common benchmark for sustainable growth. But LTV depends heavily on your payback period assumption and churn rate. A 3x ratio with an 18-month payback period means you\'re cash-flow negative for a year and a half per customer.',
    example: 'SaaS: ARPU $100/mo, churn 5%/mo, LTV = 100/0.05 = $2000. If CAC = $500, ratio = 4x. But if CAC = $800, ratio = 2.5x — borderline. Focus on reducing churn before scaling acquisition.',
    tags: ['growth analytics', 'unit economics', 'ltv'],
    learnMore: 'growth-analytics',
  },
  {
    id: 'brief-10',
    concept: 'Network Effects',
    tldr: 'The product becomes more valuable as more people use it.',
    depth: 'Direct network effects (social): more users → better for each user directly. Indirect (marketplace): more sellers → better for buyers → attracts more sellers. Data network effects: more usage → better ML → better product → more usage.',
    example: 'Slack: team communication value grows with teammates. But Slack also has "same-side" negative effects within a workspace — too many channels = noise. Strong product teams manage network density, not just growth.',
    tags: ['strategy', 'growth', 'product design'],
    learnMore: 'product-design',
  },
  {
    id: 'brief-11',
    concept: 'Selection Bias',
    tldr: 'Your sample isn\'t representative of the population you\'re drawing conclusions about.',
    depth: 'Survivorship bias is the most common form: you only see users who stayed, reviews that were written, features that shipped. Volunteer bias: surveys get answered by engaged users, skewing NPS up.',
    example: 'Your NPS survey goes to users who opened the app in the last 7 days. You get 42. But 40% of users haven\'t opened in 30 days — they\'d probably score you 10-15. Your real NPS is much lower.',
    tags: ['statistics', 'bias', 'research'],
    learnMore: 'stat-foundations',
  },
  {
    id: 'brief-12',
    concept: 'Jobs To Be Done',
    tldr: 'Users "hire" products to accomplish a specific job in their lives.',
    depth: 'JTBD reframes product design: instead of "who is this user" (demographics), ask "what job are they hiring this for." The same person might hire Uber for convenience at night but hire a rental car for a road trip — different jobs, different competitors.',
    example: 'People hire a milkshake for a morning commute job (thick, keeps them full, one-handed) — not as a dessert. Competitor is a banana, not a smoothie. Understanding the job reveals the right product decisions.',
    tags: ['product design', 'strategy', 'user research'],
    learnMore: 'product-design',
  },
  {
    id: 'brief-13',
    concept: 'Multiple Testing Problem',
    tldr: 'Run enough tests and you\'ll find a "significant" result by chance.',
    depth: 'At α=0.05, if you run 20 independent tests, you expect 1 false positive by chance. Solution: Bonferroni correction (divide α by number of tests), Benjamini-Hochberg (controls FDR), or pre-register your primary metric before peeking at results.',
    example: 'You test 10 button color variants. Color #7 hits p=0.04. Before shipping: how many colors did you test? At α=0.05 and 10 tests, you\'d expect a false positive 40% of the time. Color #7 is probably noise.',
    tags: ['statistics', 'multiple testing', 'experimentation'],
    learnMore: 'stat-foundations',
  },
  {
    id: 'brief-14',
    concept: 'Activation Metrics',
    tldr: 'The specific actions that predict whether a new user will become retained.',
    depth: 'Activation is the moment a user experiences the core value proposition. Facebook\'s "7 friends in 10 days" was their activation threshold — users who hit it were 3x more likely to be retained at 90 days.',
    example: 'Slack: sending a certain number of messages in week 1. Dropbox: uploading a file. Airbnb: completing your first booking. Find the "aha moment" through cohort analysis — what did retained users do that churned users didn\'t?',
    tags: ['growth analytics', 'retention', 'product analytics'],
    learnMore: 'growth-analytics',
  },
  {
    id: 'brief-15',
    concept: 'Novelty Effect',
    tldr: 'Users engage with a new feature because it\'s new, not because it\'s better.',
    depth: 'Common A/B test trap: treatment shows +8% click rate for 2 weeks, you ship it, engagement returns to baseline. The treatment "won" only because of novelty. Mitigation: run tests longer, look at holdout tests over months, measure repeat usage vs first-touch.',
    example: 'A new UI layout test shows 12% more time spent in week 1. But users in treatment in weeks 3-4 (novelty worn off) showed only 1% more time. You should not have shipped on week-1 data alone.',
    tags: ['experimentation', 'a/b testing', 'bias'],
    learnMore: 'stat-foundations',
  },
  {
    id: 'brief-16',
    concept: 'Metric Trees',
    tldr: 'Decomposing a top-line metric into its multiplicative or additive components.',
    depth: 'Revenue = Users × Conversion Rate × ARPU. Each node can be further split. This is how you diagnose: "revenue dropped 10%" becomes "was it users? conversion? ARPU? which segment?" Without metric trees you\'re guessing.',
    example: 'DAU dropped 5%. Metric tree: DAU = New users + Retained users + Resurrected users - Churned users. Drill: New users flat. Retained users down 8%. Root cause: a retention issue, not acquisition.',
    tags: ['metrics', 'product analytics', 'diagnosis'],
    learnMore: 'metrics',
  },
  {
    id: 'brief-17',
    concept: 'Confidence Intervals',
    tldr: 'A range of values that likely contains the true parameter — more useful than p-values alone.',
    depth: 'A 95% CI means: if you repeated the experiment 100 times, 95 CIs would contain the true value. CIs give you effect size + uncertainty together. A CI of [+0.1%, +3.2%] tells you more than p=0.02 alone.',
    example: 'Treatment: +1.5% conversion rate, 95% CI [+0.2%, +2.8%]. Real effect, but the true lift could be as small as 0.2%. Compare to CI [-0.3%, +3.3%] — null is in range, don\'t ship.',
    tags: ['statistics', 'experimentation', 'inference'],
    learnMore: 'stat-foundations',
  },
  {
    id: 'brief-18',
    concept: 'Growth Accounting',
    tldr: 'Decomposing user growth into New, Retained, Resurrected, and Churned users.',
    depth: 'MAU(t) = New(t) + Retained(t) + Resurrected(t) - Churned(t). This framework lets you see whether growth comes from acquisition or retention. A product with high new user acquisition but low retention is a leaky bucket.',
    example: 'MAU grew 5%: New +15%, Retained +2%, Resurrected +3%, Churned -15%. Growth is almost entirely acquisition-driven — retention is weak. Competing product: MAU grew 5% with Retained +10% — far healthier compounding.',
    tags: ['growth analytics', 'retention', 'diagnosis'],
    learnMore: 'growth-analytics',
  },
  {
    id: 'brief-19',
    concept: 'Bayesian vs Frequentist Testing',
    tldr: 'Two different frameworks for interpreting experimental data with different tradeoffs.',
    depth: 'Frequentist (p-values): assumes a fixed true effect, asks "is data this extreme unlikely under null?" Bayesian: starts with a prior belief, updates with data, gives you "probability treatment is better." Bayesian is more intuitive for business decisions but requires choosing a prior.',
    example: 'Frequentist says: p=0.04, reject null. Bayesian says: 92% probability treatment > control, expected lift = 1.8%. The Bayesian framing lets you make expected-value decisions — if expected lift × traffic × revenue > cost → ship.',
    tags: ['statistics', 'experimentation', 'bayesian'],
    learnMore: 'stat-foundations',
  },
  {
    id: 'brief-20',
    concept: 'Instrumentation & Logging',
    tldr: 'The foundation of any analytics system — garbage in, garbage out.',
    depth: 'Most analytics failures are instrumentation failures. Key properties: completeness (every event logged), consistency (same event schema across platforms), timeliness (near-real-time for operational metrics), and immutability (don\'t backfill raw logs).',
    example: 'You run an A/B test and the treatment group has 15% fewer logged events per user. That\'s not a real drop — it\'s a logging bug in the treatment code path. Always validate instrumentation before interpreting results.',
    tags: ['data engineering', 'analytics', 'fundamentals'],
    learnMore: 'stats',
  },
  {
    id: 'brief-21',
    concept: 'Practical vs Statistical Significance',
    tldr: 'A result can be statistically significant but too small to matter — or vice versa.',
    depth: 'With large samples, even a 0.001% conversion lift is statistically significant. But is it worth shipping? Practical significance depends on business context: implementation cost, opportunity cost, user experience tradeoff.',
    example: '+0.05% conversion rate on checkout, p=0.001, n=2M. Statistically significant. But at $50 AOV and 5% margin, that\'s $25K/year. If the change requires 2 engineering weeks, it\'s probably not worth it.',
    tags: ['statistics', 'decision making', 'experimentation'],
    learnMore: 'stat-foundations',
  },
];

const DRILL_POOL = [
  { room: 'stats', id: 'stat01-pvalue-decision', title: 'p < 0.05. Ship it?', subtitle: 'Stats' },
  { room: 'rca', id: 'RCA01', title: 'Checkout Conversion Dropped Overnight', subtitle: 'RCA' },
  { room: 'metrics', id: 'M01', title: 'What Defines a Successful Search?', subtitle: 'Metrics' },
  { room: 'growth-analytics', id: 'GA01', title: 'DAU Dropped 8% — What\'s Driving It?', subtitle: 'Growth' },
  { room: 'estimation', id: 'EST01', title: 'Uber Rides in NYC Right Now', subtitle: 'Estimation' },
  { room: 'behavioral', id: 'BEH05', title: 'Getting Engineering Buy-In Without Escalation', subtitle: 'Behavioral' },
  { room: 'cases', id: 'C01', title: 'Should We Launch Same-Day Delivery?', subtitle: 'Cases' },
  { room: 'stats', id: 'stat04-srm-first', title: 'Check This First.', subtitle: 'Stats' },
  { room: 'rca', id: 'RCA05', title: 'Revenue Up, Margin Down', subtitle: 'RCA' },
  { room: 'growth-analytics', id: 'GA04', title: '13% Purchase Conversion', subtitle: 'Growth' },
  { room: 'metrics', id: 'M05', title: 'Revenue vs GMV vs ARPU', subtitle: 'Metrics' },
  { room: 'estimation', id: 'EST03', title: 'Gmail Storage Used Daily', subtitle: 'Estimation' },
  { room: 'behavioral', id: 'BEH03', title: 'A Metric That Misled a Team', subtitle: 'Behavioral' },
  { room: 'cases', id: 'C02', title: 'Why Did Our Retention Fall?', subtitle: 'Cases' },
];

function getTodaysCase() {
  const dayIndex = Math.floor(Date.now() / 86400000);
  return DRILL_POOL[dayIndex % DRILL_POOL.length];
}

function getLastVisited(roomKey) {
  const keyMap = {
    'stats': 'pal-stats-progress-v1',
    'metrics': 'pal-metrics-progress-v2',
    'rca': 'pal-rca-progress-v1',
    'cases': 'pal-cases-progress-v1',
    'growth-analytics': 'pal-growth-analytics-progress-v1',
    'behavioral': 'pal-behavioral-progress-v1',
    'estimation': 'pal-estimation-progress-v1',
    'stat-foundations': 'pal-stat-foundations-progress-v1',
    'design': 'pal-design-progress-v1',
    'rca-v2': 'pal-rca-progress-v2',
    'cases-v2': 'pal-cases-progress-v2',
    'bi': 'pal-bi-progress-v1',
    'instrumentation': 'pal-instrumentation-progress-v1',
  };
  const key = keyMap[roomKey];
  if (!key) return null;
  try {
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    const timestamps = Object.values(data)
      .map(e => e.completedAt || e.lastCompletedAt)
      .filter(Boolean)
      .map(t => new Date(t).getTime());
    if (!timestamps.length) return null;
    const latest = Math.max(...timestamps);
    const daysAgo = Math.floor((Date.now() - latest) / 86400000);
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return 'Yesterday';
    return daysAgo + 'd ago';
  } catch { return null; }
}

function getSavedRole() {
  try { return localStorage.getItem('pal-role-toggle') || 'both'; } catch { return 'both'; }
}

function saveRole(role) {
  try { localStorage.setItem('pal-role-toggle', role); } catch {}
}

const todaysBrief = BRIEFS[Math.floor(Date.now() / 86400000) % BRIEFS.length];

const ALL_ROOM_DEFS = [
  { id: 'stat-foundations', label: 'Stat Foundations', nav: 'stat-foundations', color: 'var(--teal)' },
  { id: 'stats', label: 'Stats Room', nav: 'stats', color: 'var(--blue-text)' },
  { id: 'metrics', label: 'Metrics Room', nav: 'metrics', color: 'var(--green)' },
  { id: 'design', label: 'Design Room', nav: 'design', color: 'var(--teal)' },
  { id: 'rca', label: 'RCA Room', nav: 'rca', color: 'var(--yellow)' },
  { id: 'cases', label: 'Cases Room', nav: 'cases', color: 'var(--purple)' },
  { id: 'growth-analytics', label: 'Growth Analytics', nav: 'growth-analytics', color: 'var(--accent)' },
  { id: 'behavioral', label: 'Behavioral', nav: 'behavioral', color: 'var(--accent)' },
  { id: 'estimation', label: 'Estimation', nav: 'estimation', color: 'var(--teal)' },
  { id: 'bi', label: 'BI & Reporting', nav: 'bi', color: 'var(--yellow)' },
  { id: 'instrumentation', label: 'Instrumentation', nav: 'instrumentation', color: 'var(--teal)' },
];

const DS_STARTERS = ['stat-foundations', 'stats', 'metrics'];
const PM_STARTERS = ['product-design', 'prioritization', 'cases'];

export function Home({ onNavigate }) {
  const [role, setRole] = useState(getSavedRole);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem('pal-onboarded-v1'); } catch { return false; }
  });
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [briefExpanded, setBriefExpanded] = useState(false);

  useEffect(() => {
    if (!showOnboarding) return;
    const timer = setTimeout(() => {
      setShowOnboardingModal(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [showOnboarding]);

  function switchRole(r) { setRole(r); saveRole(r); }
  function dismissOnboarding() {
    localStorage.setItem('pal-onboarded-v1', '1');
    setShowOnboardingModal(false);
    setShowOnboarding(false);
  }

  const visitedRooms = ALL_ROOM_DEFS
    .map(r => ({ ...r, lastVisit: getLastVisited(r.id) }))
    .filter(r => r.lastVisit !== null)
    .slice(0, 5);

  const starterIds = role === 'pm' ? PM_STARTERS : DS_STARTERS;
  const starterRooms = starterIds.map(id => ALL_ROOM_DEFS.find(r => r.id === id)).filter(Boolean);

  const jumpRooms = visitedRooms.length > 0 ? visitedRooms : starterRooms;
  const sectionLabel = visitedRooms.length > 0 ? 'Jump back in' : 'Start here';

  const todaysCase = getTodaysCase();

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="pal-page-enter" style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem 5rem', width: '100%', boxSizing: 'border-box' }}>

      {/* ── First-visit hero (hidden once any room is opened) ─────────────── */}
      {visitedRooms.length === 0 && (
        <div style={{
          marginBottom: '2.25rem',
          padding: 'clamp(1.25rem, 4vw, 2.5rem) clamp(1rem, 4vw, 2.25rem)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Subtle bg gradient */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'var(--gradient-hero)', borderRadius: 'inherit',
          }} />

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative' }}>

            {/* LEFT: copy */}
            <div style={{ flex: '1 1 280px', minWidth: 240 }}>

              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                borderRadius: 20, padding: '0.22rem 0.8rem',
                fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)',
                marginBottom: '1.35rem', letterSpacing: '0.02em',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                150+ practice cases · Free to start
              </div>

              {/* Headline */}
              <div style={{ marginBottom: '1.1rem' }}>
                <div style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900,
                  lineHeight: 1.1, letterSpacing: '-0.04em', color: 'var(--text)',
                }}>
                  You know the framework.
                </div>
                <div style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900,
                  lineHeight: 1.1, letterSpacing: '-0.04em', color: 'var(--accent)',
                }}>
                  Can you diagnose the drop?
                </div>
              </div>

              {/* Subtitle */}
              <p style={{
                fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.65,
                maxWidth: 500, margin: '0 0 1.75rem', position: 'relative',
              }}>
                The hands-on prep platform for product analysts and PMs. Master experiment design,
                metric diagnosis, and root cause analysis — the three skills that decide every
                product analytics interview. Each scenario tests judgment, not recall.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.1rem', position: 'relative' }}>
                <button
                  onClick={() => onNavigate('stats')}
                  style={{
                    background: 'var(--accent)', color: '#fff', border: 'none',
                    borderRadius: 'var(--radius)', padding: '0.75rem 1.6rem',
                    fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(67,56,202,0.35)',
                  }}
                >
                  Start with A/B testing →
                </button>
                <button
                  onClick={() => onNavigate('pricing')}
                  style={{
                    background: 'var(--surface-2)', color: 'var(--text)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                    padding: '0.75rem 1.6rem', fontSize: '0.95rem', fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  See what's inside
                </button>
              </div>

              {/* Trust line */}
              <div style={{
                fontSize: '0.76rem', color: 'var(--text-dim)',
                display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
                alignItems: 'center', position: 'relative',
              }}>
                {['Free to start', 'No account required', 'Works offline', 'Full access $69 one-time'].map((item, i) => (
                  <span key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {i > 0 && <span style={{ opacity: 0.4 }}>·</span>}
                    {item}
                  </span>
                ))}
              </div>

            </div>

            {/* RIGHT: product preview mockup */}
            <div style={{
              flex: '0 1 300px', minWidth: 0, maxWidth: 320,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', overflow: 'hidden',
              boxShadow: 'var(--shadow)',
            }}>
              {/* Mockup header */}
              <div style={{
                background: 'var(--surface)', borderBottom: '1px solid var(--border)',
                padding: '0.6rem 0.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Stats Room · Case Preview</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--green)', background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 4, padding: '0.1rem 0.4rem', fontWeight: 700 }}>Free</span>
              </div>

              {/* Scenario question */}
              <div style={{ padding: '0.85rem 0.9rem 0' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.45, marginBottom: '0.7rem' }}>
                  p = 0.04. Your PM wants to ship. What do you check first?
                </div>

                {/* Options */}
                {[
                  { letter: 'A', text: 'Check for Sample Ratio Mismatch (SRM)', correct: true },
                  { letter: 'B', text: 'Ship — p < 0.05 is the standard threshold' },
                  { letter: 'C', text: 'Extend the test to reach 95% power' },
                  { letter: 'D', text: 'Segment results by device and OS first' },
                ].map(opt => (
                  <div key={opt.letter} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                    padding: '0.4rem 0.55rem', marginBottom: '0.28rem',
                    borderRadius: 6,
                    background: opt.correct ? 'var(--green-bg)' : 'var(--surface)',
                    border: '1px solid ' + (opt.correct ? 'var(--green-border)' : 'var(--border)'),
                  }}>
                    <span style={{ fontWeight: 800, fontSize: '0.72rem', flexShrink: 0, marginTop: 1, color: opt.correct ? 'var(--green)' : 'var(--text-muted)' }}>{opt.letter}</span>
                    <span style={{ fontSize: '0.78rem', color: opt.correct ? 'var(--green)' : 'var(--text-muted)', lineHeight: 1.4, flex: 1 }}>{opt.text}</span>
                    {opt.correct && <span style={{ color: 'var(--green)', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>✓</span>}
                  </div>
                ))}
              </div>

              {/* Debrief strip */}
              <div style={{
                margin: '0.65rem 0.9rem 0.8rem',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderLeft: '3px solid var(--green)',
                borderRadius: '0 6px 6px 0', padding: '0.5rem 0.65rem',
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Debrief</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  SRM means your randomization is broken — p-values are invalid until you rule it out. Always check SRM before interpreting any result.
                </div>
              </div>

              {/* Footer */}
              <div style={{ borderTop: '1px solid var(--border)', padding: '0.5rem 0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>1 of 25 cases in this room</span>
                <button
                  onClick={() => onNavigate('stats')}
                  style={{
                    background: 'var(--accent)', color: '#fff', border: 'none',
                    borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.8rem',
                    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Try it live →
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.75rem', paddingBottom: '1.1rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <h1 className="pal-gradient-text" style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.035em', margin: 0, display: 'inline-block' }}>
          Today
        </h1>
        <div style={{ fontSize: '0.81rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {todayDate}
        </div>
      </div>

      {/* ── Today: drill + brief ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
          Today
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch', flexWrap: 'wrap' }}>

          {/* Today's Case */}
          <div
            className="pal-card-hover"
            style={{
              flex: '0 0 calc(36% - 0.5rem)', minWidth: '180px',
              padding: '1.1rem 1.25rem',
              background: 'var(--yellow-bg)',
              border: '1px solid var(--yellow-border)',
              borderTop: '3px solid var(--yellow)',
              borderRadius: 'var(--radius)', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: '0.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}
            onClick={() => onNavigate(todaysCase.room)}
          >
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--yellow)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Icon name="zap" size={11} color="var(--yellow)" />Today's Case
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.97rem', color: 'var(--text)', lineHeight: 1.35 }}>
              {todaysCase.title}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {todaysCase.subtitle} Room
            </div>
            <div style={{ marginTop: 'auto', paddingTop: '0.6rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                background: 'var(--yellow)', color: '#1a1a1a',
                fontSize: '0.73rem', fontWeight: 800,
                padding: '0.28rem 0.65rem', borderRadius: 'var(--radius-sm)',
                border: '2px solid rgba(0,0,0,0.45)',
              }}>
                Open case <Icon name="chevron-right" size={11} color="currentColor" />
              </span>
            </div>
          </div>

          {/* The Brief */}
          <div style={{
            flex: '1 1 55%', minWidth: '240px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderTop: '3px solid var(--accent)',
            borderRadius: 'var(--radius)',
            padding: '1.1rem 1.2rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Icon name="newspaper" size={11} color="var(--accent)" />The Brief · Daily Concept
            </div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', marginBottom: 3, letterSpacing: '-0.01em' }}>
              {todaysBrief.concept}
            </div>
            <div style={{
              fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.55,
              borderLeft: '3px solid var(--accent-border)', paddingLeft: '0.65rem',
              background: 'var(--accent-bg)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
              padding: '0.45rem 0.65rem',
            }}>
              {todaysBrief.tldr}
            </div>

            {!briefExpanded && (
              <button
                onClick={() => setBriefExpanded(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, padding: 0, marginBottom: 3 }}
              >
                Read more ↓
              </button>
            )}

            {briefExpanded && (
              <div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 0.65rem' }}>
                  {todaysBrief.depth}
                </p>
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem', fontSize: '0.81rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '0.7rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)', marginRight: 4 }}>Example:</span>
                  {todaysBrief.example}
                </div>
                <button
                  onClick={() => setBriefExpanded(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 500, padding: 0 }}
                >
                  Collapse ↑
                </button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem', marginTop: 8 }}>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {todaysBrief.tags.map(tag => (
                  <span key={tag} style={{ fontSize: '0.68rem', fontWeight: 600, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-dim)', borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem', letterSpacing: '0.02em' }}>
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => onNavigate(todaysBrief.learnMore)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 700, padding: 0, whiteSpace: 'nowrap' }}
              >
                Learn more →
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Jump back in / Start here ───────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
            {sectionLabel}
          </div>
          {visitedRooms.length === 0 && (
            <div style={{ display: 'flex', gap: '0.2rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.15rem' }}>
              {[{ id: 'both', label: 'All' }, { id: 'ds', label: 'DS' }, { id: 'pm', label: 'PM' }].map(r => (
                <button
                  key={r.id}
                  onClick={() => switchRole(r.id)}
                  style={{
                    background: role === r.id ? 'var(--surface)' : 'none',
                    border: role === r.id ? '1px solid var(--border)' : '1px solid transparent',
                    borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.55rem',
                    color: role === r.id ? 'var(--text)' : 'var(--text-muted)',
                    fontWeight: role === r.id ? 600 : 400, fontSize: '0.75rem',
                    cursor: 'pointer',
                    boxShadow: role === r.id ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.1s',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.55rem' }}>
          {visitedRooms.length === 0 ? 'Rooms picked for first-timers — each takes ~10 min' : 'Continue where you left off'}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {jumpRooms.map(room => (
            <button
              key={room.id}
              onClick={() => onNavigate(room.nav)}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '0.52rem 0.95rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition), background var(--transition)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--surface-raised)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = 'var(--shadow)';
                e.currentTarget.style.borderColor = 'var(--border-strong)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--surface)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: room.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--text)', letterSpacing: '-0.01em' }}>{room.label}</span>
              {room.lastVisit && (
                <span style={{ fontSize: '0.69rem', color: 'var(--text-dim)' }}>{room.lastVisit}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── New here? Beginner pathway ──────────────────────────────────── */}
      {visitedRooms.length === 0 && (
        <div style={{
          marginBottom: '2rem',
          padding: '1rem 1.25rem',
          background: 'var(--teal-bg)',
          border: '1px solid var(--teal-border)',
          borderLeft: '3px solid var(--teal)',
          borderRadius: 'var(--radius)',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: '0.35rem' }}>
            New to product analytics?
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            If you are transitioning from another field or just starting out, begin with the Foundation rooms before jumping into cases. They build the mental models the practice rooms assume.
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { label: '1. Stat Foundations', nav: 'stat-foundations', color: 'var(--teal)' },
              { label: '2. RCA Foundations', nav: 'rca-foundations', color: 'var(--teal)' },
              { label: '3. Stats Room', nav: 'stats', color: 'var(--blue-text)' },
              { label: '4. Defense Strategy', nav: 'defense-doc', color: 'var(--accent)' },
            ].map(step => (
              <button
                key={step.nav}
                onClick={() => onNavigate(step.nav)}
                style={{
                  fontSize: '0.78rem', fontWeight: 600,
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--teal-border)',
                  background: 'var(--surface)',
                  color: step.color,
                  cursor: 'pointer',
                }}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Guided paths ────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
            Guided Paths
          </div>
          <button
            onClick={() => onNavigate('progress')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.78rem', fontWeight: 600, padding: 0 }}
          >
            View all →
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: '0.5rem' }}>
          {learningPaths.slice(0, 4).map((path, index) => (
            <div
              key={path.id}
              className="pal-card-enter pal-card-hover"
              role="button"
              tabIndex={0}
              onClick={() => onNavigate('progress')}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('progress'); } }}
              style={{
                background: 'var(--surface)', border: '1px solid ' + path.border,
                borderTop: '3px solid ' + path.color,
                borderRadius: 'var(--radius)', padding: '0.9rem 1rem',
                cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
                animationDelay: (Math.min(index * 28, 400)) + 'ms',
              }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: path.color, marginBottom: '0.25rem' }}>
                {path.sequence.length} items
              </div>
              <div style={{ fontSize: '0.87rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem', lineHeight: 1.3 }}>
                {path.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {path.subtitle}
              </div>
              {path.outcome && (
                <div style={{ fontSize: '0.69rem', color: 'var(--text-dim)', lineHeight: 1.4, marginTop: '0.5rem', fontWeight: 500 }}>
                  <span style={{ color: path.color, marginRight: '0.25rem', fontWeight: 700 }}>→</span>
                  {path.outcome}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Sister labs footer ───────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', padding: '2rem 1.5rem 1.5rem', marginTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Also by the same team:{' '}
          <a href="https://ml-systems-lab-v9xe.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>ML Systems Lab</a>
          {' · '}
          <a href="https://genai-systems-lab-ivory.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>GenAI Systems Lab</a>
        </span>
      </div>

      {/* ── Onboarding modal ──────────────────────────────────────────────── */}
      {showOnboardingModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--overlay)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2rem', maxWidth: 420, width: '90%', position: 'relative', boxShadow: 'var(--shadow-xl)' }}>
            <button
              onClick={dismissOnboarding}
              style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1, padding: '0.2rem 0.4rem', borderRadius: 'var(--radius-sm)', transition: 'color var(--transition)' }}
              aria-label="Close"
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              ×
            </button>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
              Welcome to Product Analytics Lab
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.65 }}>
              Practice cases for data analysts, product analysts, BAs, PMs, TPMs, and product leads. Where should we start?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button
                onClick={() => { dismissOnboarding(); onNavigate('stat-foundations'); }}
                className="pal-btn-primary"
                style={{ textAlign: 'left', padding: '0.7rem 1rem', fontSize: '0.9rem', borderRadius: 'var(--radius)' }}
              >
                I'm a Data / Product Analyst →
              </button>
              <button
                onClick={() => { dismissOnboarding(); onNavigate('product-design'); }}
                style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.7rem 1rem', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'background var(--transition), border-color var(--transition)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-raised)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                I'm a PM / TPM / Product Lead →
              </button>
              <button
                onClick={dismissOnboarding}
                style={{ background: 'none', color: 'var(--text-muted)', border: 'none', borderRadius: 'var(--radius)', padding: '0.5rem 1rem', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
              >
                Explore on my own
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
