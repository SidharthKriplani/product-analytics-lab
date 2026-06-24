import { useState } from 'react';
import { signOut } from '../../utils/auth.js';

// NOTE: This component is not currently rendered. Navigation is handled by Sidebar.jsx.
// Kept as a reference/alternative desktop nav. Do not import without updating App.jsx routing.

export function Header({ currentPage, onNavigate, unlockedStatus, theme, onToggleTheme, user, onShowAuth }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navGroups = [
    {
      label: 'ROOMS',
      items: [
        { id: 'stat-foundations', label: 'Foundations' },
        { id: 'stats', label: 'Stats' },
        { id: 'metrics', label: 'Metrics' },
        { id: 'design', label: 'Design' },
        { id: 'browser', label: 'Review' },
        { id: 'rca', label: 'RCA' },
        { id: 'cases', label: 'Cases' },
        { id: 'code', label: 'Programming Lab' },
        { id: 'product-design', label: 'PM Design' },
        { id: 'prioritization', label: 'Prioritize' },
        { id: 'behavioral', label: 'Behavioral' },
        { id: 'estimation', label: 'Estimation' },
        { id: 'growth-analytics', label: 'Growth' },
        { id: 'bi', label: 'BI' },
        { id: 'instrumentation', label: 'Instrumentation' },
      ],
    },
    {
      label: 'PRACTICE',
      items: [
        { id: 'challenges', label: 'Challenges' },
        { id: 'spot-the-flaw', label: 'Spot Flaw' },
        { id: 'take-home', label: 'Take-Home' },
        { id: 'simulator', label: 'Simulate' },
        { id: 'ab-interpreter', label: 'A/B Tool' },
      ],
    },
    {
      label: 'TOOLS',
      items: [
        { id: 'search', label: 'Search' },
        { id: 'trainer', label: 'Trainer' },
        { id: 'company-tracks', label: 'Companies' },
        { id: 'defense-doc', label: 'Defense' },
        { id: 'bookmarks', label: 'Saved' },
      ],
    },
    {
      label: 'LEARN',
      items: [
        { id: 'blog', label: 'Learn' },
        { id: 'playbook', label: 'Playbook' },
      ],
    },
    {
      label: 'TRACK',
      items: [
        { id: 'pricing', label: 'Pricing' },
        { id: 'progress', label: 'Progress' },
      ],
    },
  ];

  function getIsActive(itemId) {
    return currentPage === itemId
      || (itemId === 'stats' && currentPage === 'stats-runner')
      || (itemId === 'metrics' && currentPage === 'metrics-runner')
      || (itemId === 'design' && currentPage === 'design-runner')
      || (itemId === 'browser' && currentPage === 'runner')
      || (itemId === 'rca' && currentPage === 'rca-runner')
      || (itemId === 'cases' && currentPage === 'cases-runner')
      || (itemId === 'code' && currentPage === 'code-runner')
      || (itemId === 'product-design' && currentPage === 'product-design-runner')
      || (itemId === 'prioritization' && currentPage === 'prioritization-runner')
      || (itemId === 'behavioral' && currentPage === 'behavioral-runner')
      || (itemId === 'estimation' && currentPage === 'estimation-runner')
      || (itemId === 'stat-foundations' && currentPage === 'stat-foundations-runner')
      || (itemId === 'growth-analytics' && currentPage === 'growth-analytics-runner')
      || (itemId === 'simulator' && currentPage === 'simulator')
      || (itemId === 'ab-interpreter' && currentPage === 'ab-interpreter')
      || (itemId === 'search' && currentPage === 'search')
      || (itemId === 'bookmarks' && currentPage === 'bookmarks')
      || (itemId === 'consult' && currentPage === 'consult')
      || (itemId === 'trainer' && currentPage === 'trainer')
      || (itemId === 'company-tracks' && currentPage === 'company-tracks')
      || (itemId === 'challenges' && (currentPage === 'challenges' || currentPage === 'challenges-runner'))
      || (itemId === 'bi' && (currentPage === 'bi' || currentPage === 'bi-runner'))
      || (itemId === 'spot-the-flaw' && (currentPage === 'spot-the-flaw' || currentPage === 'stf-runner'))
      || (itemId === 'take-home' && (currentPage === 'take-home' || currentPage === 'takehome-runner'))
      || (itemId === 'defense-doc' && currentPage === 'defense-doc')
      || (itemId === 'instrumentation' && (currentPage === 'instrumentation' || currentPage === 'instrumentation-runner'));
  }

  const groupLabelStyle = {
    fontSize: '0.68rem',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
    opacity: 0.7,
    fontWeight: 600,
    marginBottom: '1px',
    userSelect: 'none',
  };

  const dividerStyle = {
    width: '1px',
    alignSelf: 'stretch',
    background: 'var(--border)',
    margin: '0 8px',
    flexShrink: 0,
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--header-bg)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0 1.5rem',
    }}>
      <style>{`
        @media (max-width: 600px) {
          .nav-group-label { display: none !important; }
        }
      `}</style>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '54px',
      }}>
        {/* Logo */}
        <button
          onClick={() => onNavigate('home')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: 0, flexShrink: 0,
          }}
        >
          <div style={{
            width: '24px', height: '24px',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--purple) 100%)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', flexShrink: 0,
          }}>⚗</div>
          <span style={{
            fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)',
            letterSpacing: '-0.02em', whiteSpace: 'nowrap',
          }}>
            Analytics Lab
          </span>
        </button>

        {/* Nav */}
        <nav style={{
          display: 'flex', alignItems: 'stretch', gap: '0',
          overflowX: 'auto', flexShrink: 1, minWidth: 0,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
          marginLeft: '1.5rem',
        }}>
          {navGroups.map((group, groupIndex) => (
            <div key={group.label} style={{ display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
              {/* Divider before each group except the first */}
              {groupIndex > 0 && <div style={dividerStyle} />}

              {/* Group column: label + items row */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div
                  className="nav-group-label"
                  style={groupLabelStyle}
                >
                  {group.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.05rem' }}>
                  {group.items.map(item => {
                    const isActive = getIsActive(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        style={{
                          background: isActive ? 'var(--surface-2)' : 'none',
                          border: 'none',
                          borderRadius: '5px',
                          padding: '0.3rem 0.55rem',
                          color: isActive ? 'var(--text)' : 'var(--text-muted)',
                          fontWeight: isActive ? 600 : 400,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          transition: 'color 0.12s, background 0.12s',
                          whiteSpace: 'nowrap',
                          minHeight: '28px',
                          flexShrink: 0,
                        }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          <div style={{ width: '1px', alignSelf: 'stretch', background: 'var(--border)', margin: '0 8px', flexShrink: 0 }} />

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '5px',
              padding: '0.3rem 0.5rem',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              lineHeight: 1,
              flexShrink: 0,
              alignSelf: 'center',
            }}
          >
            {theme === 'dark' ? '☀' : '🌙'}
          </button>

          {/* Auth: sign in button or user avatar */}
          {!user && (
            <button
              onClick={() => onShowAuth && onShowAuth()}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '5px',
                padding: '0.3rem 0.6rem',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                marginLeft: '0.15rem',
                flexShrink: 0,
                alignSelf: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              Sign in
            </button>
          )}
          {user && (
            <div style={{ position: 'relative', marginLeft: '0.15rem', alignSelf: 'center', flexShrink: 0 }}>
              <button
                onClick={() => setShowUserMenu(v => !v)}
                title={user.email}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--accent-bg, var(--surface-2))',
                  border: '1px solid var(--border)',
                  color: 'var(--accent)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  textTransform: 'uppercase',
                }}
              >
                {user.email ? user.email[0] : '?'}
              </button>
              {showUserMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    boxShadow: 'var(--shadow-md)',
                    minWidth: '180px',
                    zIndex: 200,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '0.6rem 0.85rem', fontSize: '0.78rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', wordBreak: 'break-all' }}>
                    {user.email}
                  </div>
                  <button
                    onClick={async () => {
                      setShowUserMenu(false);
                      await signOut();
                    }}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '0.6rem 0.85rem',
                      textAlign: 'left',
                      fontSize: '0.82rem',
                      color: 'var(--text)',
                      cursor: 'pointer',
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          {!unlockedStatus && (
            <button
              onClick={() => onNavigate('unlock')}
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '5px',
                padding: '0.3rem 0.65rem',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                marginLeft: '0.15rem',
                flexShrink: 0,
                alignSelf: 'center',
              }}
            >
              🔒 Beta
            </button>
          )}
          {unlockedStatus && (
            <span style={{
              fontSize: '0.72rem', fontWeight: 600,
              padding: '0.3rem 0.65rem',
              color: 'var(--green)',
              background: 'var(--green-bg)',
              border: '1px solid var(--green-border)',
              borderRadius: '5px',
              marginLeft: '0.15rem',
              alignSelf: 'center',
              flexShrink: 0,
            }}>✓ Beta</span>
          )}
        </nav>
      </div>
    </header>
  );
}
