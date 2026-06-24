import { useState, useEffect, useRef } from 'react';
import { Icon } from '../shared/Icon.jsx';
import { BrandMark } from '../shared/BrandMark.jsx';
import { signOut } from '../../utils/auth.js';

// ─── Four-frame IA (HQ DESIGN-STANDARD "THE SIDEBAR STANDARD" + COMPETENCE-MODEL DEC-15) ───
// KNOW · DO · BUILD · JUDGE are the frames; LIVE is a PAL section; EXTRAS is a quiet
// bottom catch-all. Domains survive only as sub-groups inside KNOW and JUDGE.
// See docs/NAV-REFRAME-SPEC.md for the full mapping + rationale.
const NAV_FRAMES = [
  {
    id: 'know', label: 'KNOW', icon: 'book-open',
    subs: [
      {
        id: 'foundations', label: 'Foundations',
        items: [
          { id: 'stat-foundations',    label: 'Stat Foundations' },
          { id: 'metrics-foundations', label: 'Metrics Foundations' },
          { id: 'rca-foundations',     label: 'RCA Foundations' },
          { id: 'exp-foundations',     label: 'A/B Foundations' },
        ],
      },
      {
        id: 'learn', label: 'Learn',
        items: [
          { id: 'library', label: 'Library' },
        ],
      },
    ],
  },
  {
    id: 'do', label: 'DO', icon: 'terminal',
    items: [
      { id: 'sql-lab',              label: 'SQL Lab' },
      { id: 'python-lab',           label: 'Programming Lab', href: 'https://programming-lab.vercel.app/' },
    ],
  },
  {
    id: 'judge', label: 'JUDGE', icon: 'scale',
    subs: [
      {
        id: 'experiments', label: 'Experiments',
        items: [
          { id: 'design',         label: 'A/B Design' },
          { id: 'browser',        label: 'A/B Judgment' },
          { id: 'spot-the-flaw',  label: 'Spot the Flaw' },
        ],
      },
      {
        id: 'analytics', label: 'Analytics',
        items: [
          { id: 'metrics',          label: 'Metrics' },
          { id: 'rca',              label: 'RCA' },
          { id: 'cases',            label: 'Analytics Cases' },
          { id: 'instrumentation',  label: 'Instrumentation' },
        ],
      },
      {
        id: 'product', label: 'Product',
        items: [
          { id: 'product-design', label: 'Product Design' },
          { id: 'prioritization', label: 'Prioritization' },
          { id: 'estimation',     label: 'Estimation' },
        ],
      },
    ],
    items: [
      { id: 'challenges',     label: 'Challenges' },
    ],
  },
  {
    id: 'live', label: 'LIVE', icon: 'mic',
    items: [
      { id: 'simulator',      label: 'Mock Interview' },
      { id: 'defense-doc',    label: 'Defense Strategy' },
      { id: 'company-tracks', label: 'Company Tracks' },
    ],
  },
];

// EXTRAS — quiet bottom catch-all (not a frame). Parked / leftover surfaces.
const EXTRAS_ITEMS = [
  { id: 'bookmarks',   label: 'Saved' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'about',       label: 'About' },
];

// External community (WhatsApp) — opens in a new tab, not an in-app page.
const COMMUNITY_URL = 'https://chat.whatsapp.com/JbIaqV87fwh8Ym3ufH5CFx?mode=gi_t';

// ─── Derived active-state (replaces the old 40-line getIsActive ||-chain) ───
// A runner sub-page maps back to its base tab id. Most strip the '-runner' suffix;
// a few don't and need an explicit exception.
const RUNNER_EXCEPTIONS = {
  'runner': 'browser',
  'stats-runner': 'browser', // Stats claim-checks now live inside A/B Judgment
  'stf-runner': 'spot-the-flaw',
  'takehome-runner': 'take-home',
};

function pageToTab(page) {
  if (!page) return page;
  if (RUNNER_EXCEPTIONS[page]) return RUNNER_EXCEPTIONS[page];
  if (page.endsWith('-runner')) return page.slice(0, -7);
  return page;
}

// Resolve a tab id to its { frame, sub } home by scanning NAV_FRAMES.
function findFrameAndSub(tab) {
  for (const f of NAV_FRAMES) {
    if (f.subs) {
      for (const s of f.subs) {
        if (s.items.some(i => i.id === tab)) return { frame: f.id, sub: s.id };
      }
    }
    if (f.items && f.items.some(i => i.id === tab)) return { frame: f.id, sub: null };
  }
  return { frame: null, sub: null };
}

// ─── Module-scope components (hoisted so the accordion animates instead of snapping) ───
function Collapsible({ open, children }) {
  const ref = useRef(null);
  const [height, setHeight] = useState(open ? 'auto' : '0px');
  const mounted = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!mounted.current) { mounted.current = true; return; } // no animation on first mount
    let r1, r2;
    const onEnd = e => {
      if (e.target === el && e.propertyName === 'height') {
        if (open) setHeight('auto'); // snap to auto so nested toggles can grow freely
        el.removeEventListener('transitionend', onEnd);
      }
    };
    if (open) {
      setHeight(el.scrollHeight + 'px'); // 0 → measured
      el.addEventListener('transitionend', onEnd);
    } else {
      setHeight(el.scrollHeight + 'px'); // auto → px → 0
      r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setHeight('0px')); });
    }
    return () => {
      el.removeEventListener('transitionend', onEnd);
      if (r1) cancelAnimationFrame(r1);
      if (r2) cancelAnimationFrame(r2);
    };
  }, [open]);
  return (
    <div ref={ref} className="pal-collapsible" style={{ height, overflow: 'hidden', transition: 'height 0.30s cubic-bezier(0.33,1,0.68,1)', willChange: 'height' }}>
      {children}
    </div>
  );
}

function Chevron({ open }) {
  return (
    <span style={{
      fontSize: '0.68rem', opacity: 0.4, flexShrink: 0, display: 'inline-block',
      transition: 'transform var(--transition)', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
    }}>▾</span>
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

function NavItem({ id, label, icon, indent, currentPage, onNav, href }) {
  // External link (e.g. a sibling BreakLabs app) — opens in a new tab, never "active".
  const isActive = !href && pageToTab(currentPage) === id;
  const baseStyle = {
    display: 'flex', alignItems: 'center', gap: '0.45rem',
    width: '100%', textAlign: 'left', boxSizing: 'border-box',
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
    textDecoration: 'none',
  };
  const onEnter = e => { if (!isActive) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-secondary)'; } };
  const onLeave = e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } };

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={baseStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>
        {icon && <Icon name={icon} size={13} color="currentColor" style={{ opacity: 0.7, flexShrink: 0 }} />}
        <span>{label}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.55 }} aria-hidden="true">↗</span>
      </a>
    );
  }

  return (
    <button
      onClick={() => onNav(id)}
      aria-current={isActive ? 'page' : undefined}
      className={isActive ? (indent ? 'sidebar-nav-active-sub' : 'sidebar-nav-active') : ''}
      style={baseStyle}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {icon && <Icon name={icon} size={13} color="currentColor" style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }} />}
      <span>{label}</span>
    </button>
  );
}

// Accordion header for a frame (or a sub-group). One open per level.
function GroupHeader({ icon, label, open, hasActive, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-expanded={open}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.45rem',
        width: '100%', textAlign: 'left',
        padding: '0.34rem 0.65rem',
        borderRadius: 'var(--radius-sm)',
        border: 'none', background: 'none',
        color: (open || hasActive) ? 'var(--text-secondary)' : 'var(--text-muted)',
        fontWeight: (open || hasActive) ? 600 : 500,
        fontSize: '0.825rem',
        letterSpacing: '-0.005em',
        cursor: 'pointer',
        transition: 'background var(--transition-fast), color var(--transition-fast)',
        opacity: (open || hasActive) ? 1 : 0.72,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.opacity = '1'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = (open || hasActive) ? 'var(--text-secondary)' : 'var(--text-muted)'; e.currentTarget.style.opacity = (open || hasActive) ? '1' : '0.72'; }}
    >
      {icon && <Icon name={icon} size={13} color={hasActive ? 'var(--accent)' : 'currentColor'} style={{ opacity: (open || hasActive) ? 1 : 0.62, flexShrink: 0 }} />}
      <span style={{ flex: 1 }}>{label}</span>
      <Chevron open={open} />
    </button>
  );
}

export function Sidebar({ currentPage, onNavigate, unlockedStatus, theme, onToggleTheme, isTerminal, isOpen, onClose, user, onShowAuth }) {
  const initial = findFrameAndSub(pageToTab(currentPage));
  const [openFrame, setOpenFrame] = useState(initial.frame || 'know');
  const [openSub, setOpenSub] = useState(initial.sub);

  // Follow navigation: opening a tab auto-expands its frame (and sub-group),
  // still respecting one-open-per-level.
  useEffect(() => {
    const { frame, sub } = findFrameAndSub(pageToTab(currentPage));
    if (frame) {
      setOpenFrame(frame);
      if (sub) setOpenSub(sub);
    }
  }, [currentPage]);

  function handleNav(id) {
    onNavigate(id);
    onClose();
  }

  function toggleFrame(id) {
    setOpenFrame(prev => (prev === id ? null : id));
  }
  function toggleSub(id) {
    setOpenSub(prev => (prev === id ? null : id));
  }

  const activeTab = pageToTab(currentPage);

  function frameHasActive(f) {
    if (f.subs && f.subs.some(s => s.items.some(i => i.id === activeTab))) return true;
    if (f.items && f.items.some(i => i.id === activeTab)) return true;
    return false;
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
            {/* Slot 1 — primary in-app mark (BrandMark, D-19). Stacked so the
                'Product Analytics' descriptor sits under the break⌇labs wordmark
                without overflowing the 222px rail. */}
            <BrandMark variant='stacked' descriptor='Product Analytics' size={17} />
          </button>

          {isTerminal ? (
            <div
              title="Terminal Lab uses fixed dark mode"
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.27rem 0.52rem',
                color: 'var(--text-dim)',
                fontSize: '0.72rem',
                lineHeight: 1,
                flexShrink: 0,
                cursor: 'default',
                letterSpacing: '0.02em',
                opacity: 0.6,
              }}
            >
              ◼
            </div>
          ) : (
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
              {theme === 'dark' ? <Icon name="sun" size={16} color="currentColor" /> : <Icon name="moon" size={16} color="currentColor" />}
            </button>
          )}
        </div>

        {/* ── Nav ── */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0.1rem 0.5rem 0.75rem', scrollbarWidth: 'none' }}>

          {/* TRACK — flat, always-visible (auth-conditional) */}
          <div style={{ marginBottom: '0.1rem' }}>
            <SectionLabel label="TRACK" />
            {!user ? (
              <>
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
                <NavItem id="plans" label="Plans" currentPage={currentPage} onNav={handleNav} />
                <NavItem id="progress" label="Progress" currentPage={currentPage} onNav={handleNav} />
              </>
            ) : (
              <>
                {(() => {
                  const isActive = activeTab === 'profile';
                  return (
                    <button
                      onClick={() => handleNav('profile')}
                      aria-current={isActive ? 'page' : undefined}
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
                <NavItem id="progress" label="Progress" currentPage={currentPage} onNav={handleNav} />
                <NavItem id="plans" label="Plans" currentPage={currentPage} onNav={handleNav} />
              </>
            )}
          </div>

          {/* FRAMES — KNOW · DO · BUILD · JUDGE · LIVE (accordion, one open per level) */}
          {NAV_FRAMES.map(frame => {
            const open = openFrame === frame.id;
            const hasActive = frameHasActive(frame);
            return (
              <div key={frame.id}>
                <GroupHeader
                  icon={frame.icon}
                  label={frame.label}
                  open={open}
                  hasActive={hasActive}
                  onClick={() => toggleFrame(frame.id)}
                />
                <Collapsible open={open}>
                  <div style={{ paddingBottom: '0.15rem' }}>
                    {/* Sub-groups (one open per level, recurses) */}
                    {frame.subs && frame.subs.map(sub => {
                      const subOpen = openSub === sub.id;
                      const subHasActive = sub.items.some(i => i.id === activeTab);
                      return (
                        <div key={sub.id} style={{ marginLeft: '0.4rem' }}>
                          <GroupHeader
                            label={sub.label}
                            open={subOpen}
                            hasActive={subHasActive}
                            onClick={() => toggleSub(sub.id)}
                          />
                          <Collapsible open={subOpen}>
                            <div style={{ borderLeft: '1px solid var(--border)', marginLeft: '0.9rem', paddingLeft: '0.1rem', marginBottom: '0.1rem' }}>
                              {sub.items.map(item => (
                                <NavItem key={item.id} id={item.id} label={item.label} href={item.href} indent currentPage={currentPage} onNav={handleNav} />
                              ))}
                            </div>
                          </Collapsible>
                        </div>
                      );
                    })}
                    {/* Flat items directly under the frame */}
                    {frame.items && (
                      <div style={{ marginLeft: '0.4rem' }}>
                        {frame.items.map(item => (
                          <NavItem key={item.id} id={item.id} label={item.label} href={item.href} indent currentPage={currentPage} onNav={handleNav} />
                        ))}
                      </div>
                    )}
                  </div>
                </Collapsible>
              </div>
            );
          })}

          {/* EXTRAS — quiet bottom catch-all (not a frame) */}
          <div style={{ marginTop: '0.35rem' }}>
            <SectionLabel label="EXTRAS" />
            {EXTRAS_ITEMS.map(item => (
              <NavItem key={item.id} id={item.id} label={item.label} currentPage={currentPage} onNav={handleNav} />
            ))}
            <a
              href={COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                width: '100%', boxSizing: 'border-box',
                padding: '0.34rem 0.65rem', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 400,
                textDecoration: 'none', cursor: 'pointer', lineHeight: 1.5, letterSpacing: '-0.005em',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <span>Community ↗</span>
            </a>
          </div>

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
