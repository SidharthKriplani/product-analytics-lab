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
import { DifficultyChips } from '../components/shared/DifficultyChips.jsx';
import { SegmentedTabs } from '../components/shared/SegmentedTabs.jsx';
import { getMetricsProgress } from '../utils/metricsProgress.js';
import { getGrowthAnalyticsProgress } from '../utils/growthAnalyticsProgress.js';
import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { FoundationNudgeCard } from '../components/shared/FoundationNudgeCard.jsx';

const DIFF_CFG = {
  foundational: { label: 'Foundational', color: 'var(--blue-text)', bg: 'var(--blue-bg)',   border: 'var(--blue-border)' },
  analyst:      { label: 'Analyst',      color: 'var(--blue-text)', bg: 'var(--blue-bg)',   border: 'var(--blue-border)' },
  intermediate: { label: 'Intermediate', color: 'var(--yellow)',    bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  senior:       { label: 'Senior',       color: 'var(--yellow)',    bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  advanced:     { label: 'Advanced',     color: 'var(--purple)',    bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
  staff:        { label: 'Staff',        color: 'var(--teal)',      bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
};

const LEVEL_CFG = {
  staff:   { label: 'Staff-level',   color: 'var(--purple)',    bg: 'var(--purple-bg)',  border: 'var(--purple-border)' },
  senior:  { label: 'Senior-ready',  color: 'var(--teal)',      bg: 'var(--teal-bg)',    border: 'var(--teal-border)' },
  analyst: { label: 'Analyst-ready', color: 'var(--blue-text)', bg: 'var(--blue-bg)',    border: 'var(--blue-border)' },
  junior:  { label: 'Junior miss',   color: 'var(--yellow)',    bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
};

const DIFF_ORDER = { analyst: 0, foundational: 0, intermediate: 1, senior: 1, advanced: 2, staff: 2 };

// Growth Analytics cases — analyst/senior/staff, surfaced as a tagged section
// inside the Metrics room (cohorts/funnels/growth metrics overlap metric work).
const GA_DIFF_CFG = {
  analyst: { label: 'Analyst', color: 'var(--teal)',   bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  senior:  { label: 'Senior',  color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  staff:   { label: 'Staff',   color: 'var(--red)',    bg: 'var(--red-bg)',    border: 'var(--red-border)' },
};

const sortedGrowth = [...growthAnalyticsCases].sort((a, b) => {
  const order = { analyst: 0, senior: 1, staff: 2 };
  return (order[a.difficulty] ?? 9) - (order[b.difficulty] ?? 9);
});

export function MetricsBrowser({ onSelectCase, onSelectGrowth, unlocked, onUnlock, onOpenArticle, onNavigate }) {
  const [section, setSection] = useState('metrics');
  const [sortBy, setSortBy] = useState('default');
  const [theoryActive, setTheoryActive] = useState(false);
  const [diffFilter, setDiffFilter] = useState('all');
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [atlasCategory, setAtlasCategory] = useState('growth');
  const completedCount = metricCases.filter(c => getMetricsProgress(c.id)).length;

  const diffCounts = {
    all: metricCases.length,
    analyst: metricCases.filter(c => c.difficulty === 'analyst').length,
    senior: metricCases.filter(c => c.difficulty === 'senior').length,
    staff: metricCases.filter(c => c.difficulty === 'staff').length,
  };

  const baseCases = sortBy === 'difficulty'
    ? [...metricCases].sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 1) - (DIFF_ORDER[b.difficulty] ?? 1))
    : metricCases;

  const displayCases = baseCases.filter(c => diffFilter === 'all' || c.difficulty === diffFilter);

  const firstUnstartedId = metricCases.find(mc => !getMetricsProgress(mc.id))?.id;

  return (
    <div className="pal-page-enter" style={{ maxWidth: atlasOpen ? '1160px' : '800px', margin: '0 auto', padding: '2rem 1rem', transition: 'max-width 0.2s' }}>
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
    <div style={{ flex: 1, minWidth: 0 }}>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--green-bg)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name='bar-chart' size={18} color='var(--green)' />
          </span>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--green)', marginBottom: '0.15rem' }}>
              Metrics Room
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              Metric Design
            </h1>
          </div>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem', lineHeight: 1.6, maxWidth: '540px' }}>
          The most common interview failure is picking the obvious metric and defending it under pressure — but interviewers want to see you spot the metric that games, the denominator that shifts, the guardrail you forgot. This room trains the full decision: not just what to measure, but why that specific metric and what breaks if you get it wrong.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
          <RoomBadge />
          <button
            onClick={() => setAtlasOpen(o => !o)}
            style={{
              marginLeft: 'auto',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 96, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.round(completedCount / metricCases.length * 100))}%`, background: 'var(--green)', borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{completedCount}/{metricCases.length}</span>
          </div>
        </div>
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

      {/* Sort controls */}
      {!theoryActive && (
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, justifyContent: 'flex-end' }}>
        {['default', 'difficulty'].map(opt => (
          <button key={opt} onClick={() => setSortBy(opt)} className={`pal-sort-btn${sortBy === opt ? ' active' : ''}`}>{opt === 'default' ? 'Default' : 'By Difficulty'}</button>
        ))}
      </div>
      )}

      {/* Difficulty filter chips */}
      {!theoryActive && (
        <DifficultyChips value={diffFilter} onChange={setDiffFilter} counts={diffCounts} />
      )}

      {/* Case cards grid */}
      {!theoryActive && (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
        gap: '0.85rem',
      }}>
        {displayCases.map((mc, index) => {
          const progress = getMetricsProgress(mc.id);
          const levelCfg = progress?.bestLevel ? LEVEL_CFG[progress.bestLevel] : null;
          const diffCfg = DIFF_CFG[mc.difficulty] || DIFF_CFG.analyst;
          const isLocked = !mc.isFree && !unlocked;
          const isNextUnstarted = mc.id === firstUnstartedId;

          return (
            <div
              key={mc.id}
              className="pal-card-enter pal-card-hover"
              role="button"
              tabIndex={0}
              onClick={() => isLocked ? (onUnlock && onUnlock()) : onSelectCase(mc.id)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); isLocked ? (onUnlock && onUnlock()) : onSelectCase(mc.id); } }}
              style={{
                animationDelay: (Math.min(index * 28, 400)) + 'ms',
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                borderLeft: isNextUnstarted ? '3px solid var(--green)' : '1.5px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
                display: 'flex', flexDirection: 'column', gap: '0.6rem',
                position: 'relative',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--green-border)';
                e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {isNextUnstarted && (
                <span style={{
                  position: 'absolute', top: '0.6rem', right: '0.7rem',
                  fontSize: '0.68rem', fontWeight: 700,
                  color: 'var(--green)', background: 'var(--green-bg)',
                  border: '1px solid var(--green-border)',
                  borderRadius: 4, padding: '0.1rem 0.4rem',
                }}>
                  Next →
                </span>
              )}
              {/* Badges row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: diffCfg.color, background: diffCfg.bg, border: `1px solid ${diffCfg.border}`,
                  borderRadius: 'var(--radius-sm)', padding: '0.08rem 0.35rem',
                }}>{diffCfg.label}</span>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', padding: '0.08rem 0.35rem',
                }}>{mc.domain}</span>
                {levelCfg && (
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: levelCfg.color, background: levelCfg.bg, border: `1px solid ${levelCfg.border}`,
                    borderRadius: 'var(--radius-sm)', padding: '0.08rem 0.35rem',
                  }}>✓ {levelCfg.label}</span>
                )}
              </div>

              {/* Title + subtitle */}
              <div>
                <h3 style={{ fontSize: '0.97rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.2rem', letterSpacing: '-0.01em', lineHeight: 1.35 }}>
                  {mc.title}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                  {mc.subtitle}
                </p>
              </div>

              {/* Context trap hint */}
              <p style={{
                fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5,
                borderLeft: '2px solid var(--border-subtle)', paddingLeft: '0.6rem',
              }}>
                {mc.context.trap}
              </p>

              {/* Bottom row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                {progress ? (
                  <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                    {progress.attempts} attempt{progress.attempts !== 1 ? 's' : ''} · Resume →
                  </span>
                ) : (
                  <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>Not started</span>
                )}
                {!isLocked && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600 }}>→</span>
                )}
              </div>
            </div>
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

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
          gap: '0.85rem',
        }}>
          {sortedGrowth.map((m, index) => {
            const prog = getGrowthAnalyticsProgress(m.id);
            const isLocked = !m.isFree && !unlocked;
            const diffCfg = GA_DIFF_CFG[m.difficulty] || GA_DIFF_CFG.analyst;

            return (
              <div
                key={m.id}
                className="pal-card-enter pal-card-hover"
                role="button"
                tabIndex={0}
                onClick={() => isLocked ? (onUnlock && onUnlock()) : onSelectGrowth?.(m.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    isLocked ? (onUnlock && onUnlock()) : onSelectGrowth?.(m.id);
                  }
                }}
                style={{
                  animationDelay: String(Math.min(index * 28, 400)) + 'ms',
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  borderLeft: '3px solid var(--teal)',
                  borderRadius: 'var(--radius)',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
                  opacity: isLocked ? 0.7 : 1,
                  display: 'flex', flexDirection: 'column', gap: '0.6rem',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--teal-border)';
                  e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Badges row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: 'var(--teal)', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
                    borderRadius: 'var(--radius-sm)', padding: '0.08rem 0.35rem',
                  }}>Growth Analytics</span>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: diffCfg.color, background: diffCfg.bg, border: `1px solid ${diffCfg.border}`,
                    borderRadius: 'var(--radius-sm)', padding: '0.08rem 0.35rem',
                  }}>{diffCfg.label}</span>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', padding: '0.08rem 0.35rem',
                  }}>{m.domain}</span>
                  {isLocked && <span style={{ fontSize: '0.8rem', marginLeft: 'auto' }}>🔒</span>}
                  {prog && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', marginLeft: 'auto' }}>✓</span>
                  )}
                </div>

                {/* Title + subtitle */}
                <div>
                  <h3 style={{ fontSize: '0.97rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.2rem', letterSpacing: '-0.01em', lineHeight: 1.35 }}>
                    {m.title}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    {m.subtitle}
                  </p>
                </div>

                {/* Bottom row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  {prog ? (
                    <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                      {prog.attempts} attempt{prog.attempts !== 1 ? 's' : ''} · Resume →
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>Not started</span>
                  )}
                  {!isLocked && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--teal)', fontWeight: 600 }}>→</span>
                  )}
                </div>
              </div>
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

function RoomBadge() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
      background: 'var(--green-bg)', border: '1px solid var(--green-border)',
      borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.6rem',
      fontSize: '0.75rem', color: 'var(--green)', fontWeight: 700,
    }}>
      Metrics · {metricCases.length} Cases
    </div>
  );
}

function StatPill({ n, label, color }) {
  return (
    <div style={{
      background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.7rem',
      display: 'flex', alignItems: 'baseline', gap: '0.3rem',
    }}>
      <span style={{ fontSize: '1rem', fontWeight: 800, color: color || 'var(--green)', lineHeight: 1 }}>{n}</span>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{label}</span>
    </div>
  );
}
