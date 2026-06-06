import { useState, useEffect } from 'react';
import { Icon } from '../shared/Icon.jsx';
import { signOut } from '../../utils/auth.js';

const ROOM_SUBGROUPS = [
  {
    id: 'experiments',
    label: 'Experiments',
    items: [
      { id: 'stats',         label: 'Stats' },
      { id: 'design',        label: 'A/B Design' },
      { id: 'browser',       label: 'A/B Review' },
      { id: 'spot-the-flaw', label: 'Spot the Flaw' },
      { id: 'ab-interpreter', label: 'Stats Calc' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      { id: 'metrics',          label: 'Metrics' },
      { id: 'rca',              label: 'RCA' },
      { id: 'cases',            label: 'Cases' },
      { id: 'growth-analytics', label: 'Growth Analytics' },
      { id: 'bi',               label: 'BI & Reporting' },
      { id: 'instrumentation',  label: 'Instrumentation' },
      { id: 'code',             label: 'Code Lab' },
      { id: 'sql-lab',          label: 'SQL Lab' },
    ],
  },
  {
    id: 'product',
    label: 'Product',
    items: [
      { id: 'product-design',  label: 'Product Design' },
      { id: 'prioritization',  label: 'Prioritization' },
      { id: 'behavioral',      label: 'Behavioral' },
      { id: 'estimation',      label: 'Estimation' },
    ],
  },
];

const FLAT_GROUPS = [
  {
    label: 'DRILLS',
    items: [
      { id: 'benchmark',  label: 'Judgment Benchmark', icon: 'target' },
      { id: 'challenges', label: 'Challenges',          icon: 'zap' },
      { id: 'simulator',  label: 'Mock Interview',      icon: 'mic' },
    ],
  },
  {
    label: 'LEARN',
    items: [
      { id: 'blog',         label: 'Deep Dives',        icon: 'book-open' },
      { id: 'playbook',     label: 'Frameworks',        icon: 'layout' },
      { id: 'interview-qa', label: 'Interview Q&A',     icon: 'message-square' },
      { id: 'failures',     label: 'Analytics Failures', icon: 'alert-triangle' },
    ],
  },
  {
    label: 'TOOLS',
    items: [
      { id: 'trainer',        label: 'MCQ Quiz',         icon: 'target' },
      { id: 'company-tracks', label: 'Company Tracks',   icon: 'building-2' },
      { id: 'defense-doc',    label: 'Defense Strategy', icon: 'shield' },
      { id: 'bookmarks',      label: 'Saved',            icon: 'bookmark' },
    ],
  },
  {
    label: 'TRACK',
    items: [
      { id: 'profile',  label: 'Profile',  icon: 'user' },
      { id: 'progress', label: 'Progress', icon: 'bar-chart' },
      { id: 'plans',    label: 'Plans',    icon: 'credit-card' },
    ],
  },
];

function getIsActive(itemId, currentPage) {
  return currentPage === itemId
    || (itemId === 'stats'           && currentPage === 'stats-runner')
    || (itemId === 'metrics'         && currentPage === 'metrics-runner')
    || (itemId === 'design'          && currentPage === 'design-runner')
    || (itemId === 'browser'         && currentPage === 'runner')
    || (itemId === 'rca'             && currentPage === 'rca-runner')
    || (itemId === 'cases'           && currentPage === 'cases-runner')
    || (itemId === 'code'            && currentPage === 'code-runner')
    || (itemId === 'product-design'  && currentPage === 'product-design-runner')
    || (itemId === 'prioritization'  && currentPage === 'prioritization-runner')
    || (itemId === 'behavioral'      && currentPage === 'behavioral-runner')
    || (itemId === 'estimation'      && currentPage === 'estimation-runner')
    || (itemId === 'stat-foundations' && currentPage === 'stat-foundations-runner')
    || (itemId === 'growth-analytics' && currentPage === 'growth-analytics-runner')
    || (itemId === 'simulator'       && currentPage === 'simulator')
    || (itemId === 'ab-interpreter'  && currentPage === 'ab-interpreter')
    || (itemId === 'search'          && currentPage === 'search')
    || (itemId === 'bookmarks'       && currentPage === 'bookmarks')
    || (itemId === 'consult'         && currentPage === 'consult')
    || (itemId === 'trainer'         && currentPage === 'trainer')
    || (itemId === 'interview-qa'    && currentPage === 'interview-qa')
    || (itemId === 'failures'        && currentPage === 'failures')
    || (itemId === 'company-tracks'  && currentPage === 'company-tracks')
    || (itemId === 'challenges'      && (currentPage === 'challenges' || currentPage === 'challenges-runner'))
    || (itemId === 'bi'              && (currentPage === 'bi' || currentPage === 'bi-runner'))
    || (itemId === 'spot-the-flaw'   && (currentPage === 'spot-the-flaw' || currentPage === 'stf-runner'))
    || (itemId === 'take-home'       && (currentPage === 'take-home' || currentPage === 'takehome-runner'))
    || (itemId === 'defense-doc'     && currentPage === 'defense-doc')
    || (itemId === 'instrumentation' && (currentPage === 'instrumentation' || currentPage === 'instrumentation-runner'))
    || (itemId === 'foundations'     && currentPage === 'foundations')
    || (itemId === 'metrics-foundations' && (currentPage === 'metrics-foundations' || currentPage === 'metrics-foundations-runner'))
    || (itemId === 'rca-foundations'     && (currentPage === 'rca-foundations' || currentPage === 'rca-foundations-runner'))
    || (itemId === 'exp-foundations'     && (currentPage === 'exp-foundations' || currentPage === 'exp-foundations-runner'))
    || (itemId === 'sql-lab'             && currentPage === 'sql-lab');
}

function getActiveSubGroup(currentPage) {
  for (const sg of ROOM_SUBGROUPS) {
    if (sg.items.some(item => getIsActive(item.id, currentPage))) return sg.id;
  }
  return null;
}

export function Sidebar({ currentPage, onNavigate, unlockedStatus, theme, onToggleTheme, isOpen, onClose, user, onShowAuth }) {
  const [expandedSubGroups, setExpandedSubGroups] = useState(() => {
    const active = getActiveSubGroup(currentPage);
    return new Set(active ? [active] : ['experiments']);
  });

  useEffect(() => {
    const active = getActiveSubGroup(currentPage);
    if (active) {
      setExpandedSubGroups(prev => {
        if (prev.has(active)) return prev;
        const next = new Set(prev);
        next.add(active);
        return next;
      });
    }
  }, [currentPage]);

  function handleNav(id) {
    onNavigate(id);
    onClose();
  }

  function toggleSubGroup(id) {
    setExpandedSubGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function NavItem({ id, indent }) {
    const isActive = getIsActive(id, currentPage);
    const allItems = [
      ...ROOM_SUBGROUPS.flatMap(sg => sg.items),
      { id: 'stat-foundations',      label: 'Stat Foundations' },
      { id: 'metrics-foundations',   label: 'Metrics Foundations' },
      { id: 'rca-foundations',       label: 'RCA Foundations' },
      { id: 'exp-foundations',       label: 'A/B Foundations' },
      { id: 'foundations',           label: 'Theory Hub' },
      ...FLAT_GROUPS.flatMap(g => g.items),
    ];
    const item = allItems.find(i => i.id === id);
    const label = item?.label || id;
    const icon = item?.icon;

    return (
      <button
        onClick={() => handleNav(id)}
        className={isActive ? (indent ? 'sidebar-nav-active-sub' : 'sidebar-nav-active') : ''}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.45rem',
          width: '100%', textAlign: 'left',
          padding: indent ? '0.3rem 0.65rem 0.3rem 1.1rem' : '0.34rem 0.65rem',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          background: isActive ? undefined : 'transparent',
          color: isActive ? undefined : 'var(--text-muted)',
          fontWeight: isActive ? undefined : 400,
          fontSize: indent ? '0.795rem' : '0.825rem',
          cursor: 'pointer',
          transition: 'background var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast)',
          lineHeight: 1.5,
          letterSpacing: '-0.005em',
        }}
        onMouseEnter={e => {
          if (!isActive) {
            e.currentTarget.style.background = 'var(--surface-2)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }
        }}
      >
        {icon && <Icon name={icon} size={13} color="currentColor" style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }} />}
        <span>{label}</span>
      </button>
    );
  }

  function SectionLabel({ label }) {
    return (
      <div style={{
        fontSize: '0.595rem', fontWeight: 700, letterSpacing: '0.11em',
        color: 'var(--text-muted)', opacity: 0.48,
        padding: '0.65rem 0.6rem 0.2rem',
        textTransform: 'uppercase', userSelect: 'none',
      }}>
        {label}
      </div>
    );
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'var(--overlay)',
            zIndex: 49,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside className={`app-sidebar${isOpen ? ' open' : ''}`}>

        {/* ── Logo + theme toggle ── */}
        <div style={{
          padding: '1rem 0.8rem 0.65rem',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: '0.4rem',
        }}>
          <button
            onClick={() => handleNav(user ? 'progress' : 'home')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.3rem 0.25rem',
              borderRadius: 'var(--radius-sm)',
              flex: 1,
              transition: 'opacity var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.75'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            <div style={{
              width: 26, height: 26, flexShrink: 0,
              background: 'var(--gradient-accent)',
              borderRadius: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(99,102,241,0.4)',
            }}><svg width="16" height="16" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                <g stroke="#ffffff" strokeLinecap="round" strokeWidth="1.6">
                  <line x1="4" y1="13" x2="22" y2="13"/>
                  <line x1="4" y1="8"  x2="4"  y2="18"/>
                  <line x1="22" y1="8" x2="22" y2="18"/>
                </g>
                <circle cx="13" cy="13" r="2.2" fill="#ffffff"/>
              </svg></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
              <span style={{
                fontWeight: 900,
                fontSize: '0.92rem',
                color: 'var(--text)',
                letterSpacing: '-0.035em',
                lineHeight: 1.1,
              }}>
                Product Analytics
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--text-dim)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                Lab
              </span>
            </div>
          </button>

          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.27rem 0.52rem',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              lineHeight: 1,
              flexShrink: 0,
              transition: 'border-color var(--transition), background var(--transition)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-strong)';
              e.currentTarget.style.background = 'var(--surface-2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'none';
            }}
          >
            {theme === 'dark' ? '☀' : '🌙'}
          </button>
        </div>

        {/* ── Nav ── */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0.1rem 0.5rem 0.75rem', scrollbarWidth: 'none' }}>

          {/* TRACK — conditional on auth state */}
          <div style={{ marginBottom: '0.1rem' }}>
            <SectionLabel label="TRACK" />

            {!user ? (
              <>
                {/* Sign In */}
                <button
                  onClick={() => { onShowAuth(); onClose(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.45rem',
                    width: '100%', textAlign: 'left',
                    padding: '0.34rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none', background: 'transparent',
                    color: 'var(--text-muted)', fontWeight: 400,
                    fontSize: '0.825rem', cursor: 'pointer',
                    transition: 'background var(--transition-fast), color var(--transition-fast)',
                    letterSpacing: '-0.005em',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <Icon name="user" size={13} color="currentColor" style={{ opacity: 0.7, flexShrink: 0 }} />
                  <span>Sign In</span>
                </button>
                <NavItem id="plans" />
              </>
            ) : (
              <>
                {/* Profile with avatar */}
                {(() => {
                  const isActive = getIsActive('profile', currentPage);
                  return (
                    <button
                      onClick={() => handleNav('profile')}
                      className={isActive ? 'sidebar-nav-active' : ''}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.45rem',
                        width: '100%', textAlign: 'left',
                        padding: '0.34rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: isActive ? undefined : 'transparent',
                        color: isActive ? undefined : 'var(--text-muted)',
                        fontWeight: isActive ? undefined : 400,
                        fontSize: '0.825rem', cursor: 'pointer',
                        transition: 'background var(--transition-fast), color var(--transition-fast)',
                        letterSpacing: '-0.005em',
                      }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
                    >
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt=""
                          style={{ width: 15, height: 15, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, opacity: isActive ? 1 : 0.8 }}
                        />
                      ) : (
                        <div style={{
                          width: 15, height: 15, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--accent-bg, var(--surface-2))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.52rem', fontWeight: 800, color: 'var(--accent)',
                        }}>
                          {user.email?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <span>Profile</span>
                    </button>
                  );
                })()}
                <NavItem id="plans" />
              </>
            )}
          </div>

          {/* FOUNDATIONS */}
          <SectionLabel label="FOUNDATIONS" />
          <NavItem id="stat-foundations" />
          <NavItem id="metrics-foundations" />
          <NavItem id="rca-foundations" />
          <NavItem id="exp-foundations" />

          {/* ROOMS (accordion) */}
          <SectionLabel label="ROOMS" />
          {ROOM_SUBGROUPS.map(sg => {
            const isExpanded = expandedSubGroups.has(sg.id);
            const hasActive = sg.items.some(item => getIsActive(item.id, currentPage));
            return (
              <div key={sg.id}>
                <button
                  onClick={() => toggleSubGroup(sg.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', textAlign: 'left',
                    padding: '0.3rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: 'none',
                    color: hasActive ? 'var(--text-secondary)' : 'var(--text-muted)',
                    fontWeight: hasActive ? 600 : 500,
                    fontSize: '0.825rem',
                    letterSpacing: '-0.005em',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast), color var(--transition-fast)',
                    opacity: hasActive ? 1 : 0.68,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--surface-2)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = hasActive ? 'var(--text-secondary)' : 'var(--text-muted)';
                    e.currentTarget.style.opacity = hasActive ? '1' : '0.68';
                  }}
                >
                  <span>{sg.label}</span>
                  <span style={{
                    fontSize: '0.68rem',
                    opacity: 0.4,
                    flexShrink: 0,
                    display: 'inline-block',
                    transition: 'transform var(--transition)',
                    transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                  }}>
                    ▾
                  </span>
                </button>

                {isExpanded && (
                  <div style={{
                    borderLeft: '1px solid var(--border)',
                    marginLeft: '0.9rem',
                    paddingLeft: '0.1rem',
                    marginBottom: '0.1rem',
                  }}>
                    {sg.items.map(item => (
                      <NavItem key={item.id} id={item.id} indent />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* FLAT GROUPS (PRACTICE, LEARN, TOOLS — TRACK is rendered above Foundations) */}
          {FLAT_GROUPS.filter(g => g.label !== 'TRACK').map(group => (
            <div key={group.label} style={{ marginBottom: '0.1rem' }}>
              <SectionLabel label={group.label} />
              {group.items.map(item => (
                <NavItem key={item.id} id={item.id} />
              ))}
            </div>
          ))}

        </nav>

        {/* ── Bottom: search ── */}
        <div style={{
          padding: '0.65rem 0.8rem',
          borderTop: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          <button
            onClick={() => handleNav('search')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              width: '100%', textAlign: 'left',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.42rem 0.7rem',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'border-color var(--transition), color var(--transition), box-shadow var(--transition)',
              letterSpacing: '-0.005em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent-border)';
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Icon name="search" size={14} color="currentColor" style={{ opacity: 0.65, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>Search</span>
            <kbd style={{
              fontSize: '0.68rem', padding: '0.12rem 0.35rem',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)',
              fontFamily: 'inherit',
            }}>/</kbd>
          </button>
        </div>

      </aside>
    </>
  );
}
