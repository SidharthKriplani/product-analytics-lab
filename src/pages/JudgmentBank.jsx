import { useState } from 'react';
import { scenarios } from '../data/scenarios.js';
import { designScenarios } from '../data/designScenarios.js';
import { statsModules } from '../data/statsModules.js';
import { metricCases } from '../data/metricCases.js';
import { rcaCases } from '../data/rcaCases.js';
import { businessCases } from '../data/businessCases.js';
import { plannedScenarios, SCENARIO_FAMILIES } from '../data/scenarioBank.js';

const DIFFICULTY_COLORS = {
  foundational: { color: 'var(--blue-text)', bg: 'var(--blue-bg)', border: 'var(--blue-border)' },
  analyst:      { color: 'var(--blue-text)', bg: 'var(--blue-bg)', border: 'var(--blue-border)' },
  senior:       { color: 'var(--yellow)',    bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  staff:        { color: 'var(--purple)',    bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
};

function DiffBadge({ difficulty }) {
  const c = DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.analyst;
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: c.color, background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
    }}>{difficulty}</span>
  );
}

function PairedBadge() {
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
      color: 'var(--accent)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
      borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
    }}>◆ Paired</span>
  );
}

function PlannedCard({ scenario }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px dashed var(--border)',
      borderRadius: 'var(--radius)',
      padding: '0.95rem 1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.855rem', color: 'var(--text-secondary)', lineHeight: 1.3, flex: 1 }}>
          {scenario.title}
        </span>
        <span style={{
          flexShrink: 0, fontSize: '0.68rem', fontWeight: 600,
          color: 'var(--text-dim)', background: 'var(--surface-2)',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
          padding: '0.1rem 0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>Roadmap</span>
      </div>
      <p style={{ fontSize: '0.775rem', color: 'var(--text-dim)', margin: '0 0 0.55rem', lineHeight: 1.5, fontStyle: 'italic' }}>
        {scenario.teaser}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
        <DiffBadge difficulty={scenario.difficulty} />
        <span style={{
          fontSize: '0.68rem', color: 'var(--text-dim)',
          background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
        }}>{scenario.industry}</span>
      </div>
    </div>
  );
}

function ReviewCard({ scenario, onClick }) {
  return (
    <div
      onClick={() => onClick(scenario.id)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '0.95rem 1rem',
        cursor: 'pointer',
        transition: 'border-color 0.13s, box-shadow 0.13s',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-bg)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-2px)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.3, flex: 1 }}>
          {scenario.title}
        </span>
        <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, color: '#fff',
            background: scenario.isFree ? 'var(--accent)' : 'var(--teal)',
            borderRadius: 'var(--radius-sm)', padding: '0.12rem 0.4rem',
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>{scenario.isFree ? 'Free' : 'Beta'}</span>
        </div>
      </div>
      <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '0 0 0.55rem', lineHeight: 1.5 }}>
        {scenario.subtitle}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center' }}>
        <DiffBadge difficulty={scenario.difficulty} />
        <span style={{
          fontSize: '0.68rem', color: 'var(--text-dim)',
          background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
        }}>{scenario.industry}</span>
        {scenario.pairedDesignScenarioId && <PairedBadge />}
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700 }}>▶ Review</span>
      </div>
    </div>
  );
}

function DesignCard({ scenario, onClick }) {
  return (
    <div
      onClick={() => onClick(scenario.id)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '0.95rem 1rem',
        cursor: 'pointer',
        transition: 'border-color 0.13s, box-shadow 0.13s',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--teal)';
        e.currentTarget.style.boxShadow = '0 0 0 3px var(--teal-bg)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-2px)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.3, flex: 1 }}>
          {scenario.title}
        </span>
        <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, color: '#fff',
            background: scenario.isFree ? 'var(--accent)' : 'var(--teal)',
            borderRadius: 'var(--radius-sm)', padding: '0.12rem 0.4rem',
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>{scenario.isFree ? 'Free' : 'Beta'}</span>
        </div>
      </div>
      <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '0 0 0.55rem', lineHeight: 1.5 }}>
        {scenario.subtitle}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center' }}>
        <DiffBadge difficulty={scenario.difficulty} />
        <span style={{
          fontSize: '0.68rem', color: 'var(--text-dim)',
          background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
        }}>{scenario.industry}</span>
        {scenario.pairedReviewScenarioId && <PairedBadge />}
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--teal)', fontWeight: 700 }}>✏ Design</span>
      </div>
    </div>
  );
}

function StatsCard({ module, onClick }) {
  return (
    <div
      onClick={() => onClick(module.id)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '0.95rem 1rem',
        cursor: 'pointer',
        transition: 'border-color 0.13s, box-shadow 0.13s',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--blue-border)';
        e.currentTarget.style.boxShadow = '0 0 0 3px var(--blue-bg)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-2px)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.3, flex: 1 }}>
          {module.title}
        </span>
        <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, color: '#fff',
            background: module.isFree ? 'var(--accent)' : 'var(--teal)',
            borderRadius: 'var(--radius-sm)', padding: '0.12rem 0.4rem',
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>{module.isFree ? 'Free' : 'Beta'}</span>
        </div>
      </div>
      <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '0 0 0.55rem', lineHeight: 1.5 }}>
        {module.situation?.context?.length > 90
          ? module.situation.context.slice(0, 90) + '…'
          : module.situation?.context}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center' }}>
        <DiffBadge difficulty={module.difficulty} />
        <span style={{
          fontSize: '0.68rem', color: 'var(--text-dim)',
          background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
          textTransform: 'uppercase', letterSpacing: '0.03em',
        }}>{module.concept}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--blue-text)', fontWeight: 700 }}>⊕ Stats</span>
      </div>
    </div>
  );
}

function MetricsCard({ metricCase, onClick }) {
  return (
    <div
      onClick={() => onClick(metricCase.id)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '0.95rem 1rem',
        cursor: 'pointer',
        transition: 'border-color 0.13s, box-shadow 0.13s',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--green)';
        e.currentTarget.style.boxShadow = '0 0 0 3px var(--green-bg)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-2px)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.3, flex: 1 }}>
          {metricCase.title}
        </span>
        <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, color: '#fff',
            background: metricCase.isFree ? 'var(--accent)' : 'var(--teal)',
            borderRadius: 'var(--radius-sm)', padding: '0.12rem 0.4rem',
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>{metricCase.isFree ? 'Free' : 'Beta'}</span>
        </div>
      </div>
      <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '0 0 0.55rem', lineHeight: 1.5 }}>
        {metricCase.subtitle}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center' }}>
        <DiffBadge difficulty={metricCase.difficulty} />
        <span style={{
          fontSize: '0.68rem', color: 'var(--text-dim)',
          background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
        }}>{metricCase.domain}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--green)', fontWeight: 700 }}>⊗ Metrics</span>
      </div>
    </div>
  );
}

function RCACard({ rcaCase, onClick }) {
  return (
    <div
      onClick={() => onClick(rcaCase.id)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '0.95rem 1rem',
        cursor: 'pointer',
        transition: 'border-color 0.13s, box-shadow 0.13s',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--yellow-border)';
        e.currentTarget.style.boxShadow = '0 0 0 3px var(--yellow-bg)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-2px)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.3, flex: 1 }}>
          {rcaCase.title}
        </span>
        <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, color: '#fff',
            background: rcaCase.isFree ? 'var(--accent)' : 'var(--teal)',
            borderRadius: 'var(--radius-sm)', padding: '0.12rem 0.4rem',
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>{rcaCase.isFree ? 'Free' : 'Beta'}</span>
        </div>
      </div>
      <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '0 0 0.55rem', lineHeight: 1.5 }}>
        {rcaCase.context?.metricMovement
          ? rcaCase.context.metricMovement.length > 85
            ? rcaCase.context.metricMovement.slice(0, 85) + '…'
            : rcaCase.context.metricMovement
          : rcaCase.subtitle}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center' }}>
        <DiffBadge difficulty={rcaCase.difficulty} />
        <span style={{
          fontSize: '0.68rem', color: 'var(--text-dim)',
          background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
        }}>{rcaCase.domain}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--yellow)', fontWeight: 700 }}>⊘ RCA</span>
      </div>
    </div>
  );
}

function CasesCard({ businessCase, onClick }) {
  return (
    <div
      onClick={() => onClick(businessCase.id)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '0.95rem 1rem',
        cursor: 'pointer',
        transition: 'border-color 0.13s, box-shadow 0.13s',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--purple-border)';
        e.currentTarget.style.boxShadow = '0 0 0 3px var(--purple-bg)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-2px)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.3, flex: 1 }}>
          {businessCase.title}
        </span>
        <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, color: '#fff',
            background: businessCase.isFree ? 'var(--accent)' : 'var(--teal)',
            borderRadius: 'var(--radius-sm)', padding: '0.12rem 0.4rem',
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>{businessCase.isFree ? 'Free' : 'Beta'}</span>
        </div>
      </div>
      <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '0 0 0.55rem', lineHeight: 1.5 }}>
        {businessCase.subtitle}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center' }}>
        <DiffBadge difficulty={businessCase.difficulty} />
        <span style={{
          fontSize: '0.68rem', color: 'var(--text-dim)',
          background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
        }}>{businessCase.domain}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--purple)', fontWeight: 700 }}>◈ Cases</span>
      </div>
    </div>
  );
}

export function JudgmentBank({ onNavigate }) {
  const [roomFilter, setRoomFilter] = useState('all');
  const [familyFilter, setFamilyFilter] = useState('all');
  const [diffFilter, setDiffFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Enrich review scenarios with pairedDesignScenarioId for badge lookup
  const designIdByReview = Object.fromEntries(
    designScenarios
      .filter(d => d.pairedReviewScenarioId)
      .map(d => [d.pairedReviewScenarioId, d.id])
  );

  const reviewCards = scenarios.map(s => ({
    ...s,
    status: 'playable',
    room: 'review',
    scenarioFamily: s.theme,
    pairedDesignScenarioId: designIdByReview[s.id] || null,
  }));

  const designCards = designScenarios.map(s => ({
    ...s,
    status: 'playable',
    room: 'design',
  }));

  const statsCards = statsModules.map(m => ({
    ...m,
    status: 'playable',
    room: 'stats',
    scenarioFamily: m.concept,
    subtitle: m.situation?.context?.slice(0, 90) + '…',
  }));

  const metricsCards = metricCases.map(c => ({
    ...c,
    status: 'playable',
    room: 'metrics',
  }));

  const rcaCards = rcaCases.map(c => ({
    ...c,
    status: 'playable',
    room: 'rca',
  }));

  const casesCards = businessCases.map(c => ({
    ...c,
    status: 'playable',
    room: 'cases',
  }));

  const allPlayable = [...statsCards, ...metricsCards, ...reviewCards, ...designCards, ...rcaCards, ...casesCards];
  const allCards = [...allPlayable, ...plannedScenarios.map(s => ({ ...s, room: 'planned' }))];

  const filtered = allCards.filter(s => {
    if (roomFilter !== 'all' && roomFilter !== 'planned' && s.room !== roomFilter) return false;
    if (roomFilter === 'planned' && s.room !== 'planned') return false;
    if (statusFilter === 'playable' && s.status !== 'playable') return false;
    if (statusFilter === 'planned' && s.status !== 'planned') return false;
    if (diffFilter !== 'all' && s.difficulty !== diffFilter) return false;
    if (familyFilter !== 'all' && s.scenarioFamily !== familyFilter) return false;
    return true;
  });

  const familiesInUse = [...new Set(allCards.map(s => s.scenarioFamily))].filter(Boolean).sort();

  const FilterBtn = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{
      background: active ? 'var(--accent)' : 'var(--surface)',
      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-sm)', padding: '0.28rem 0.65rem',
      color: active ? '#fff' : 'var(--text-muted)',
      fontWeight: active ? 700 : 400, fontSize: '0.78rem', cursor: 'pointer',
      transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
    }}>{children}</button>
  );

  function handleCardClick(card) {
    if (card.room === 'stats') onNavigate('stats');
    else if (card.room === 'review') onNavigate('browser');
    else if (card.room === 'design') onNavigate('design');
    else if (card.room === 'metrics') onNavigate('metrics');
    else if (card.room === 'rca') onNavigate('rca');
    else if (card.room === 'cases') onNavigate('cases');
  }

  return (
    <div className="pal-page-enter" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '720px', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
          Judgment Bank
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '0.75rem' }}>
          The gap between analyst and senior is not knowledge — it is the quality of the call when conditions are ambiguous. The Judgment Bank puts all 6 rooms in one view, organized by decision trap, so you can work across domains deliberately: see the same mistake show up in stats, then in metrics, then in an RCA, until the pattern is automatic rather than effortful.
        </p>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderLeft: '3px solid var(--accent)', borderRadius: 'var(--radius)',
          padding: '0.7rem 0.875rem',
          fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--text)', fontWeight: 600 }}>44 playable now</strong>
          {' '}— 8 Stats + 6 Metrics + 12 Review + 8 Design + 6 RCA + 4 Cases.
          {' '}Paired scenarios (◆) appear in both Design and Review rooms.
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>

        {/* Room filter */}
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          <FilterBtn active={roomFilter === 'all'} onClick={() => setRoomFilter('all')}>All rooms</FilterBtn>
          <FilterBtn active={roomFilter === 'stats'} onClick={() => setRoomFilter('stats')}>⊕ Stats ({statsCards.length})</FilterBtn>
          <FilterBtn active={roomFilter === 'metrics'} onClick={() => setRoomFilter('metrics')}>⊗ Metrics ({metricsCards.length})</FilterBtn>
          <FilterBtn active={roomFilter === 'review'} onClick={() => setRoomFilter('review')}>▶ Review ({reviewCards.length})</FilterBtn>
          <FilterBtn active={roomFilter === 'design'} onClick={() => setRoomFilter('design')}>✏ Design ({designCards.length})</FilterBtn>
          <FilterBtn active={roomFilter === 'rca'} onClick={() => setRoomFilter('rca')}>⊘ RCA ({rcaCards.length})</FilterBtn>
          <FilterBtn active={roomFilter === 'cases'} onClick={() => setRoomFilter('cases')}>◈ Cases ({casesCards.length})</FilterBtn>
          <FilterBtn active={roomFilter === 'planned'} onClick={() => setRoomFilter('planned')}>Roadmap ({plannedScenarios.length})</FilterBtn>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

        {/* Difficulty */}
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          <FilterBtn active={diffFilter === 'all'} onClick={() => setDiffFilter('all')}>All levels</FilterBtn>
          <FilterBtn active={diffFilter === 'analyst'} onClick={() => setDiffFilter('analyst')}>Analyst</FilterBtn>
          <FilterBtn active={diffFilter === 'senior'} onClick={() => setDiffFilter('senior')}>Senior</FilterBtn>
          <FilterBtn active={diffFilter === 'staff'} onClick={() => setDiffFilter('staff')}>Staff</FilterBtn>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

        {/* Family dropdown */}
        <select
          value={familyFilter}
          onChange={e => setFamilyFilter(e.target.value)}
          style={{
            background: 'var(--input-bg)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '0.28rem 0.65rem',
            color: familyFilter !== 'all' ? 'var(--text)' : 'var(--text-muted)',
            fontSize: '0.78rem', cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="all">All families</option>
          {familiesInUse.map(f => (
            <option key={f} value={f}>{SCENARIO_FAMILIES[f] || f}</option>
          ))}
        </select>
      </div>

      {/* Results label */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
        {filtered.length} item{filtered.length !== 1 ? 's' : ''}
        {familyFilter !== 'all' ? ` · ${SCENARIO_FAMILIES[familyFilter] || familyFilter}` : ''}
        {diffFilter !== 'all' ? ` · ${diffFilter}` : ''}
      </div>

      {/* ── Card grid ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(290px, 100%), 1fr))',
        gap: '0.65rem',
        marginBottom: '3rem',
      }}>
        {filtered.map((s, index) => {
          const cardDelay = { animationDelay: (Math.min(index * 28, 400)) + 'ms' };
          if (s.room === 'stats') return <div key={`stats-${s.id}`} className="pal-card-enter pal-card-hover" style={cardDelay}><StatsCard module={s} onClick={() => onNavigate('stats')} /></div>;
          if (s.room === 'metrics') return <div key={`metrics-${s.id}`} className="pal-card-enter pal-card-hover" style={cardDelay}><MetricsCard metricCase={s} onClick={() => onNavigate('metrics')} /></div>;
          if (s.room === 'design') return <div key={`design-${s.id}`} className="pal-card-enter pal-card-hover" style={cardDelay}><DesignCard scenario={s} onClick={() => onNavigate('design')} /></div>;
          if (s.room === 'review') return <div key={`review-${s.id}`} className="pal-card-enter pal-card-hover" style={cardDelay}><ReviewCard scenario={s} onClick={() => onNavigate('browser')} /></div>;
          if (s.room === 'rca') return <div key={`rca-${s.id}`} className="pal-card-enter pal-card-hover" style={cardDelay}><RCACard rcaCase={s} onClick={() => onNavigate('rca')} /></div>;
          if (s.room === 'cases') return <div key={`cases-${s.id}`} className="pal-card-enter pal-card-hover" style={cardDelay}><CasesCard businessCase={s} onClick={() => onNavigate('cases')} /></div>;
          return <div key={`planned-${s.id}`} className="pal-card-enter" style={cardDelay}><PlannedCard scenario={s} /></div>;
        })}
        {filtered.length === 0 && (
          <div style={{
            gridColumn: '1/-1', textAlign: 'center', padding: '3rem',
            color: 'var(--text-dim)', fontSize: '0.875rem',
          }}>
            No items match this filter.
          </div>
        )}
      </div>

      {/* ── Family legend ───────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem',
      }}>
        <div className="label-caps" style={{ marginBottom: '0.875rem' }}>
          Scenario Families
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(230px, 100%), 1fr))', gap: '0.3rem' }}>
          {Object.entries(SCENARIO_FAMILIES).map(([key, label]) => {
            const count = allCards.filter(s => s.scenarioFamily === key).length;
            const playableCount = allPlayable.filter(s => s.scenarioFamily === key).length;
            const active = familyFilter === key;
            return (
              <button
                key={key}
                onClick={() => setFamilyFilter(active ? 'all' : key)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: active ? 'var(--accent-bg)' : 'transparent',
                  border: `1px solid ${active ? 'var(--accent-border)' : 'transparent'}`,
                  borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.5rem',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  fontSize: '0.775rem', cursor: 'pointer', textAlign: 'left', gap: '0.5rem',
                  transition: 'all 0.1s',
                }}
              >
                <span>{label}</span>
                <span style={{
                  fontSize: '0.68rem', flexShrink: 0,
                  color: playableCount > 0 ? 'var(--green)' : 'var(--text-dim)',
                }}>
                  {playableCount > 0 ? `${playableCount}▶ ` : ''}{count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
