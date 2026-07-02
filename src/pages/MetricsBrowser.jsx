import { Icon } from '../components/shared/Icon.jsx';
import { useState } from 'react';

// ── Metric Universe Atlas data ────────────────────────────────────────────────
const ATLAS_CATEGORIES = [
  {
    id: 'growth',
    label: 'Growth',
    color: 'var(--accent)',
    metrics: [
      {
        name: 'DAU / WAU / MAU',
        formula: 'COUNT(DISTINCT user_id) per day/week/month with at least 1 qualifying event',
        decomposition: 'New + Retained + Resurrected users',
        guardrails: ['Define "active" explicitly — one event type, not all events', 'Watch for mix-shift: MAU growth driven by low-stickiness cohorts deflates DAU/MAU ratio'],
        interviewAngles: ['Why did DAU drop while MAU held?', 'DAU/MAU fell — is this a retention problem or a mix-shift artifact?'],
      },
      {
        name: 'D7 / D30 Retention',
        formula: 'Users active on day N / users who first opened on day 0 (same cohort)',
        decomposition: 'By acquisition channel, device, cohort vintage',
        guardrails: ['Denominator must be the DAY-0 cohort, not all users', 'D7 can look strong if most churn happens day 8-14'],
        interviewAngles: ['D7 retention improved — is it real or did the acquisition cohort change?', 'What does the retention curve shape tell you?'],
      },
      {
        name: 'Stickiness (DAU/MAU)',
        formula: 'DAU / MAU — percentage of monthly users who return daily',
        decomposition: 'Segment by power users vs. casual users',
        guardrails: ['Composite metric — can fall without any user getting worse (mix shift)', 'Power-user stickiness vs. aggregate stickiness can diverge'],
        interviewAngles: ['Stickiness fell 3pp — is this engagement regression or cohort mix shift?', 'What is an acceptable stickiness target for this product type?'],
      },
    ],
  },
  {
    id: 'conversion',
    label: 'Conversion & Funnel',
    color: 'var(--yellow)',
    metrics: [
      {
        name: 'Conversion Rate (CVR)',
        formula: 'Orders / Sessions (or Users) — specify grain explicitly',
        decomposition: 'Session CVR vs. user CVR; by device, channel, segment',
        guardrails: ['Session CVR inflated by power users with many sessions', 'User CVR hides session-level funnel issues'],
        interviewAngles: ['CVR dropped — where in the funnel is the breakpoint?', 'Session CVR up but user CVR flat — what does that mean?'],
      },
      {
        name: 'Add-to-Cart Rate',
        formula: 'ATC events / Product Detail Page views',
        decomposition: 'By product category, price tier, device, new vs. returning',
        guardrails: ['A proxy for intent, not purchase — ATC rate can improve while CVR falls', 'Category mix shift changes aggregate ATC rate without any product change'],
        interviewAngles: ['ATC up but orders flat — what is the abandonment point?', 'Should ATC rate be a primary or guardrail metric?'],
      },
      {
        name: 'Funnel Falloff Rate',
        formula: '(Users at step N − Users at step N+1) / Users at step N per stage',
        decomposition: 'Per stage: browse → PDP → ATC → checkout → payment → order',
        guardrails: ['Multi-step attribution loses users to multi-session journeys', 'Absolute drop counts matter more than percentages at low-volume stages'],
        interviewAngles: ['Which funnel stage explains the most absolute order loss?', 'How do you distinguish a UX problem from a pricing problem at the PDP→ATC step?'],
      },
    ],
  },
  {
    id: 'revenue',
    label: 'Revenue & Monetization',
    color: 'var(--green)',
    metrics: [
      {
        name: 'GMV (Gross Merchandise Value)',
        formula: 'SUM(order_value) — before returns, cancellations, and platform fees',
        decomposition: 'GMV = Orders × AOV; segment by category, cohort, geography',
        guardrails: ['GMV is gross — cancellations and returns inflate it vs. net revenue', 'AOV and orders can offset: watch both, not just GMV'],
        interviewAngles: ['GMV up but net revenue flat — what changed?', 'Is GMV the right north star for a marketplace?'],
      },
      {
        name: 'Take Rate / Platform Fee',
        formula: 'Net revenue / GMV — percentage the platform retains',
        decomposition: 'By seller tier, category, promotional activity',
        guardrails: ['Discounts and incentives reduce effective take rate even if nominal rate is unchanged', 'Category mix shift changes blended take rate without any pricing change'],
        interviewAngles: ['Take rate fell 1pp — is this mix shift or pricing erosion?', 'What is the right take rate for a two-sided marketplace?'],
      },
      {
        name: 'Contribution Margin per Order',
        formula: 'Revenue per order − COGS − logistics − discount − returns cost',
        decomposition: 'Positive vs. negative margin orders by segment; margin-at-risk from RTO',
        guardrails: ['Optimize CVR without this and you fill the funnel with negative-margin orders', 'Discount campaigns can improve CVR while destroying contribution margin'],
        interviewAngles: ['CVR up but contribution margin down — what is the mechanism?', 'What guardrail prevents search optimization from degrading margin?'],
      },
    ],
  },
  {
    id: 'marketplace',
    label: 'Marketplace Health',
    color: 'var(--purple)',
    metrics: [
      {
        name: 'Fill Rate',
        formula: 'Orders successfully fulfilled / Orders placed — tracks supply-side delivery ability',
        decomposition: 'By seller tier, category, geography',
        guardrails: ['Low fill rate signals catalog thinness or seller reliability problems, not demand issues', 'Fill rate can look healthy in aggregate while a specific category is broken'],
        interviewAngles: ['Fill rate dropped — supply-side or demand-side problem?', 'What is the causal chain from fill rate to buyer LTV?'],
      },
      {
        name: 'Seller Health Score',
        formula: 'Composite of: response time, order fill rate, listing quality, return rate, ratings',
        decomposition: 'By seller vintage, GMV tier, category',
        guardrails: ['Composite scores hide which dimension is driving change', 'Gaming risk: sellers optimize for the score, not for actual quality'],
        interviewAngles: ['How do you weight the components of a seller health score?', 'Seller health improved — did buyer experience improve too?'],
      },
      {
        name: 'Catalog Depth / OOS Rate',
        formula: 'Active SKUs available vs. out-of-stock SKUs; OOS = unavailable / total listed',
        decomposition: 'By category, season, price tier',
        guardrails: ['High SKU count with low-quality listings is worse than fewer quality listings', 'OOS rate spikes can cause CVR drops that look like product problems'],
        interviewAngles: ['Sessions flat, orders down — is OOS rate a suspect?', 'How does catalog depth drive search zero-result rate?'],
      },
    ],
  },
  {
    id: 'quality',
    label: 'Quality, Trust & Returns',
    color: 'var(--red)',
    metrics: [
      {
        name: 'Return Rate',
        formula: 'Items returned / Items sold — track by category, seller, channel',
        decomposition: 'Reason codes: wrong item, quality defect, changed mind, never arrived',
        guardrails: ['High-consideration categories (furniture, apparel) have structurally higher return rates', 'Easy checkout can inflate return rate by reducing purchase consideration'],
        interviewAngles: ['CVR improved but return rate spiked — is the checkout change causing impulse buys?', 'What is an acceptable return rate for this product category?'],
      },
      {
        name: 'RTO Rate (Return to Origin)',
        formula: 'Orders returned to seller undelivered / Orders shipped — Indian e-commerce KPI',
        decomposition: 'By city tier, carrier, COD vs. prepaid, delivery attempt count',
        guardrails: ['COD orders have structurally higher RTO than prepaid', 'Carrier quality varies by tier; aggregate RTO hides carrier-level problems'],
        interviewAngles: ['RTO up in Tier 2/3 — carrier problem or buyer behavior shift?', 'What is the unit economics impact of a 1pp RTO increase?'],
      },
      {
        name: 'Fraud Rate',
        formula: 'Fraudulent orders / Total orders; or chargebacks / Total payment volume',
        decomposition: 'By payment method, device, geography, user vintage',
        guardrails: ['Fraud rate is a lagging indicator — current fraud is detected weeks later', 'Reducing fraud aggressively can increase false positive rate and harm legitimate buyers'],
        interviewAngles: ['Fraud rate tripled in 72 hours — what is your first investigation step?', 'False positive rate vs. fraud rate: how do you set the right threshold?'],
      },
    ],
  },
  {
    id: 'engagement',
    label: 'Engagement',
    color: 'var(--teal)',
    metrics: [
      {
        name: 'Session Depth / Pages per Session',
        formula: 'AVG(page_views or events per session) — measures within-session engagement',
        decomposition: 'By entry point, device, new vs. returning user',
        guardrails: ['More pages per session can mean better engagement OR harder navigation', 'Session depth and session duration can diverge — specify which you mean'],
        interviewAngles: ['Session depth increased after a redesign — is this engagement or confusion?', 'What is the relationship between session depth and conversion in this product?'],
      },
      {
        name: 'Feature Adoption Rate',
        formula: 'Users who triggered feature at least once / Total active users in period',
        decomposition: 'By cohort, segment; track adoption curve over weeks',
        guardrails: ['One-time adoption ≠ habit formation — track weekly active feature users, not ever-used', 'Novelty effect inflates adoption in weeks 1-2; stable adoption is the real signal'],
        interviewAngles: ['Feature adoption is high but retention is flat — is the feature adding real value?', 'How do you distinguish novelty-driven adoption from genuine utility?'],
      },
      {
        name: 'Notification Engagement',
        formula: 'Open rate = opens / sent; effective rate = downstream action / sent',
        decomposition: 'By notification type, timing, user segment, permission status',
        guardrails: ['Open rate is a proxy — optimize for it and you send at 6am when users pick up phones, not when they engage', 'Opt-out rate and uninstall rate are the correct guardrails; track them pre-declared'],
        interviewAngles: ['Open rate up but session rate flat — what is the diagnosis?', 'How do you set the guardrails before running a notification timing experiment?'],
      },
    ],
  },
];

// ── MetricAtlasPanel component ────────────────────────────────────────────────
function MetricAtlasPanel({ activeCategory, onSetCategory, onClose }) {
  const [expanded, setExpanded] = useState(null);
  const cat = ATLAS_CATEGORIES.find(c => c.id === activeCategory) || ATLAS_CATEGORIES[0];

  return (
    <div style={{
      width: 300, flexShrink: 0,
      borderLeft: '1px solid var(--border)',
      background: 'var(--surface)',
      borderRadius: '10px',
      padding: '1.1rem',
      maxHeight: 'calc(100vh - 6rem)',
      overflowY: 'auto',
      position: 'sticky',
      top: '1.5rem',
      alignSelf: 'flex-start',
    }}>
      {/* Panel header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--green)' }}>
          Metric Atlas
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.1rem 0.3rem', fontSize: '1rem', lineHeight: 1 }}>×</button>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.9rem' }}>
        {ATLAS_CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => { onSetCategory(c.id); setExpanded(null); }}
            style={{
              fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.55rem',
              borderRadius: '4px', border: '1px solid ' + (c.id === activeCategory ? c.color : 'var(--border)'),
              background: c.id === activeCategory ? 'var(--surface-2)' : 'none',
              color: c.id === activeCategory ? c.color : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Metric cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {cat.metrics.map((m, i) => (
          <div
            key={i}
            style={{
              border: '1px solid var(--border)', borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {/* Card header — always visible */}
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              style={{
                width: '100%', textAlign: 'left', background: 'var(--surface-2)',
                border: 'none', cursor: 'pointer', padding: '0.6rem 0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>{m.name}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', transform: expanded === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
            </button>

            {/* Card body — expanded */}
            {expanded === i && (
              <div style={{ padding: '0.65rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {/* Formula */}
                <div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Formula</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.5 }}>{m.formula}</div>
                </div>
                {/* Decomposition */}
                <div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Decomposition</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.5 }}>{m.decomposition}</div>
                </div>
                {/* Guardrails */}
                <div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Guardrails</div>
                  {m.guardrails.map((g, j) => (
                    <div key={j} style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5, paddingLeft: '0.6rem', borderLeft: '2px solid var(--border)', marginBottom: j < m.guardrails.length - 1 ? '0.25rem' : 0 }}>
                      {g}
                    </div>
                  ))}
                </div>
                {/* Interview angles */}
                <div style={{ background: 'var(--surface-2)', borderRadius: '6px', padding: '0.5rem 0.6rem' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--green)', marginBottom: '0.25rem' }}>Interview angles</div>
                  {m.interviewAngles.map((a, j) => (
                    <div key={j} style={{ fontSize: '0.76rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: j < m.interviewAngles.length - 1 ? '0.2rem' : 0, fontStyle: 'italic' }}>
                      "{a}"
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
import { metricCases } from '../data/metricCases.js';
import { growthAnalyticsCases } from '../data/growthAnalyticsCases.js';
import { SegmentedTabs } from '../components/shared/SegmentedTabs.jsx';
import { getMetricsProgress } from '../utils/metricsProgress.js';
import { getGrowthAnalyticsProgress } from '../utils/growthAnalyticsProgress.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { FoundationNudgeCard } from '../components/shared/FoundationNudgeCard.jsx';
import { RoomHeader } from '../components/shared/RoomHeader.jsx';
import { FilterBar } from '../components/shared/FilterBar.jsx';
import { CaseCard } from '../components/shared/CaseCard.jsx';
import { AddTrackBtn } from '../components/tracks/AddToTrackPopover.jsx';

const LEVEL_CFG = {
  staff:   { label: 'Staff-level',   color: 'var(--purple)',    bg: 'var(--purple-bg)',  border: 'var(--purple-border)' },
  senior:  { label: 'Senior-ready',  color: 'var(--teal)',      bg: 'var(--teal-bg)',    border: 'var(--teal-border)' },
  analyst: { label: 'Analyst-ready', color: 'var(--blue-text)', bg: 'var(--blue-bg)',    border: 'var(--blue-border)' },
  junior:  { label: 'Junior miss',   color: 'var(--yellow)',    bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
};

const DIFF_ORDER = { analyst: 0, foundational: 0, intermediate: 1, senior: 1, advanced: 2, staff: 2 };

// Growth Analytics cases — analyst/senior/staff, surfaced as a tagged section
// inside the Metrics room (cohorts/funnels/growth metrics overlap metric work).
const sortedGrowth = [...growthAnalyticsCases].sort((a, b) => {
  const order = { analyst: 0, senior: 1, staff: 2 };
  return (order[a.difficulty] ?? 9) - (order[b.difficulty] ?? 9);
});

// Derive Metrics-section filter dimensions from data (so 'advanced' etc. surface).
const METRIC_DIFFICULTIES = (() => {
  const set = new Set();
  metricCases.forEach(c => { if (c.difficulty) set.add(c.difficulty); });
  return Array.from(set).sort((a, b) => (DIFF_ORDER[a] ?? 9) - (DIFF_ORDER[b] ?? 9) || a.localeCompare(b));
})();

const METRIC_DOMAINS = (() => {
  const set = new Set();
  metricCases.forEach(c => { if (c.domain) set.add(c.domain); });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
})();

export function MetricsBrowser({ onSelectCase, onSelectGrowth, unlocked, onUnlock, onOpenArticle, onNavigate }) {
  const [section, setSection] = useState('metrics');
  const [sortBy, setSortBy] = useState('default');
  const [theoryActive, setTheoryActive] = useState(false);
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [activeDomain, setActiveDomain] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [atlasCategory, setAtlasCategory] = useState('growth');

  const completedMetricIds = new Set(metricCases.filter(c => getMetricsProgress(c.id)).map(c => c.id));
  const completedCount = completedMetricIds.size;

  // AND logic across all active Metrics-section filters.
  let displayCases = metricCases.filter(c => {
    const diffMatch = activeDifficulty === 'All' || c.difficulty === activeDifficulty;
    const domainMatch = activeDomain === 'All' || c.domain === activeDomain;
    const isDone = completedMetricIds.has(c.id);
    const statusMatch =
      activeStatus === 'All' ||
      (activeStatus === 'solved' && isDone) ||
      (activeStatus === 'unsolved' && !isDone);
    return diffMatch && domainMatch && statusMatch;
  });

  if (sortBy === 'difficulty') {
    displayCases = [...displayCases].sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 1) - (DIFF_ORDER[b.difficulty] ?? 1));
  }

  const firstUnstartedId = metricCases.find(mc => !getMetricsProgress(mc.id))?.id;

  const metricFilters = [
    {
      id: 'difficulty',
      label: 'Difficulty',
      value: activeDifficulty,
      onChange: setActiveDifficulty,
      options: [
        { value: 'All', label: 'All' },
        ...METRIC_DIFFICULTIES.map(d => ({
          value: d,
          label: d.charAt(0).toUpperCase() + d.slice(1),
          count: metricCases.filter(c => c.difficulty === d).length,
        })),
      ],
    },
    {
      id: 'domain',
      label: 'Domain',
      value: activeDomain,
      onChange: setActiveDomain,
      options: [
        { value: 'All', label: 'All' },
        ...METRIC_DOMAINS.map(d => ({
          value: d,
          label: d,
          count: metricCases.filter(c => c.domain === d).length,
        })),
      ],
    },
    {
      id: 'status',
      label: 'Status',
      value: activeStatus,
      onChange: setActiveStatus,
      options: [
        { value: 'All', label: 'All' },
        { value: 'unsolved', label: 'Unsolved', count: metricCases.length - completedCount },
        { value: 'solved', label: 'Solved', count: completedCount },
      ],
    },
  ];

  const metricSort = {
    id: 'sort',
    label: 'Sort',
    value: sortBy,
    onChange: setSortBy,
    options: [
      { value: 'default', label: 'Default' },
      { value: 'difficulty', label: 'By Difficulty' },
    ],
  };

  const clearMetricFilters = () => {
    setActiveDifficulty('All');
    setActiveDomain('All');
    setActiveStatus('All');
  };

  return (
    <div className="pal-page-enter" style={{ maxWidth: atlasOpen ? '1160px' : '800px', margin: '0 auto', padding: '2rem 1rem', transition: 'max-width 0.2s' }}>
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
    <div style={{ flex: 1, minWidth: 0 }}>

      {/* Header */}
      <RoomHeader
        icon='bar-chart'
        accent='green'
        eyebrow='Metrics Room'
        title='Metric Design'
        blurb={'The most common interview failure is picking the obvious metric and defending it under pressure — but interviewers want to see you spot the metric that games, the denominator that shifts, the guardrail you forgot. This room trains the full decision: not just what to measure, but why that specific metric and what breaks if you get it wrong.'}
        solved={completedCount}
        total={metricCases.length}
      />

      {/* Metric Atlas toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', marginTop: '-0.75rem' }}>
        <button
          onClick={() => setAtlasOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            background: atlasOpen ? 'var(--green-bg)' : 'var(--surface-2)',
            border: '1px solid ' + (atlasOpen ? 'var(--green-border)' : 'var(--border)'),
            borderRadius: '6px', padding: '0.28rem 0.65rem',
            fontSize: '0.73rem', fontWeight: 600,
            color: atlasOpen ? 'var(--green)' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <Icon name='book-open' size={12} color={atlasOpen ? 'var(--green)' : 'var(--text-muted)'} />
          Metric Atlas
        </button>
      </div>

      {/* Foundation nudge */}
      {onNavigate && (
        <FoundationNudgeCard foundationRoom="metrics-foundations" foundationLabel="Metrics Foundations" onNavigate={onNavigate} />
      )}

      {/* Section segmented tabs — Metrics | Growth Analytics (one section at a time) */}
      <SegmentedTabs
        accent='green'
        value={section}
        onChange={setSection}
        tabs={[
          { id: 'metrics', label: 'Metrics', count: metricCases.length },
          { id: 'growth', label: 'Growth Analytics', count: growthAnalyticsCases.length },
        ]}
      />

      {section === 'metrics' && (
      <>
      {/* Theory / Cases tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['Cases', 'Theory'].map(tab => {
          const active = tab === 'Theory' ? theoryActive : !theoryActive;
          return (
            <button
              key={tab}
              onClick={() => setTheoryActive(tab === 'Theory')}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid ' + (active ? 'var(--accent-border)' : 'var(--border)'),
                background: active ? 'var(--accent-bg)' : 'none',
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: active ? 600 : 400,
                fontSize: '0.82rem', cursor: 'pointer',
              }}
            >{tab}</button>
          );
        })}
      </div>

      {/* Dropdown filter row */}
      {!theoryActive && (
        <FilterBar filters={metricFilters} sort={metricSort} />
      )}

      {/* Case cards */}
      {!theoryActive && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {displayCases.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No cases match those filters.{' '}
            <button onClick={clearMetricFilters} style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}>
              Clear filters
            </button>
          </div>
        )}

        {displayCases.map(mc => {
          const progress = getMetricsProgress(mc.id);
          const levelCfg = progress?.bestLevel ? LEVEL_CFG[progress.bestLevel] : null;
          const isLocked = !mc.isFree && !unlocked;
          const isDone = completedMetricIds.has(mc.id);
          const isNextUnstarted = mc.id === firstUnstartedId;

          const tags = [mc.domain].filter(Boolean);

          let meta;
          if (levelCfg) {
            meta = levelCfg.label;
          } else if (progress) {
            meta = `${progress.attempts} attempt${progress.attempts !== 1 ? 's' : ''}`;
          }

          const nextBadge = isNextUnstarted ? (
            <span style={{
              fontSize: '0.66rem', fontWeight: 700,
              color: 'var(--green)', background: 'var(--green-bg)',
              border: '1px solid var(--green-border)',
              borderRadius: 4, padding: '0.08rem 0.4rem',
            }}>
              Next
            </span>
          ) : null;

          return (
            <CaseCard
              key={mc.id}
              id={mc.id}
              title={mc.title}
              subtitle={mc.subtitle || mc.context?.trap}
              tags={tags}
              difficulty={mc.difficulty}
              accent='green'
              status={isDone ? 'solved' : undefined}
              locked={isLocked}
              meta={meta}
              badge={nextBadge}
              onClick={() => (isLocked ? (onUnlock && onUnlock()) : onSelectCase(mc.id))}
              addBtn={<AddTrackBtn itemType='metrics' itemId={String(mc.id)} label={mc.title} itemMeta={{ difficulty: mc.difficulty }} />}
            />
          );
        })}
      </div>
      )}

      {theoryActive && (
        <div>
          <div style={{ marginBottom: '1rem', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
            Read the theory, then practice it in the cases above.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: '0.75rem' }}>
            {FOUNDATION_DOMAINS['metrics'].articles.map(a => (
              <button
                key={a.id}
                onClick={() => onOpenArticle && onOpenArticle(a.id)}
                style={{
                  textAlign: 'left', background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: '10px',
                  padding: '0.9rem 1rem', cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{a.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.35rem', fontWeight: 500 }}>Read article →</div>
              </button>
            ))}
          </div>
        </div>
      )}
      </>
      )}

      {/* ── Growth Analytics — cohorts, funnels & growth metrics (own tab section) ── */}
      {section === 'growth' && (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name='trending-up' size={15} color='var(--teal)' />
          </span>
          <div>
            <div style={{
              fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--teal)', marginBottom: '0.1rem',
            }}>
              Cohorts · Funnels · Growth Accounting
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              Growth Analytics
            </h2>
          </div>
        </div>

        <p style={{
          color: 'var(--text-muted)', fontSize: '0.9rem',
          margin: '0 0 1.1rem', maxWidth: '640px', lineHeight: 1.6,
        }}>
          Growth decomposition, retention curves, loop analysis, and the acquisition-vs-retention calls that define senior growth analyst interviews. These cases live alongside metric design because the levers — cohorts, funnels, stickiness — are the same.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sortedGrowth.map(m => {
            const prog = getGrowthAnalyticsProgress(m.id);
            const isLocked = !m.isFree && !unlocked;
            const tags = ['Growth Analytics', m.domain].filter(Boolean);
            const meta = prog ? `${prog.attempts} attempt${prog.attempts !== 1 ? 's' : ''}` : undefined;

            return (
              <CaseCard
                key={m.id}
                id={m.id}
                title={m.title}
                subtitle={m.subtitle}
                tags={tags}
                difficulty={m.difficulty}
                accent='teal'
                status={prog ? 'solved' : undefined}
                locked={isLocked}
                meta={meta}
                onClick={() => (isLocked ? (onUnlock && onUnlock()) : onSelectGrowth?.(m.id))}
              />
            );
          })}
        </div>
      </div>
      )}

    </div>{/* end main content column */}

    {/* Metric Atlas Panel */}
    {atlasOpen && (
      <MetricAtlasPanel
        activeCategory={atlasCategory}
        onSetCategory={setAtlasCategory}
        onClose={() => setAtlasOpen(false)}
      />
    )}

    </div>
  </div>
  );
}
