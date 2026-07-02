// CaseCard — the single unified card/row for every room browser in the
// "Monochrome Instrument" design system. One component, one look: an id chip,
// title, subtitle, muted tags, a small difficulty pill, an optional status tick,
// and optional right-aligned meta text.
//
// Design rules:
//   - Hairline neutral border. NO colored top/left rail or strip.
//   - The only color is the difficulty pill (subtle, room-accent or difficulty
//     tint), the status tick (green check), and a faint accent border-emphasis
//     on hover. Everything else is monochrome.
//   - Hover = subtle lift + border emphasis (handled inline to allow the
//     room accent; pal-card-hover class is also applied for shared behavior).
//   - Mobile-safe: flexible widths, wrapping rows.
//
// Props:
//   id         — short identifier shown as an uppercase chip (e.g. 'EST01')
//   title      — case title
//   subtitle   — one-line subtitle
//   tags       — array of short tag strings (muted)
//   difficulty — difficulty key; rendered as a small pill via DIFF_PILL or
//                falls back to the room accent if unknown
//   accent     — CSS color var name WITHOUT var() wrapper (e.g. 'teal').
//                Drives the difficulty pill fallback + hover border emphasis.
//                Defaults to 'accent'.
//   status     — 'solved' renders a green check tick; falsy renders nothing
//   onClick    — click / Enter / Space handler
//   meta       — optional small right-aligned text node (e.g. company, est min)
//   locked     — optional; dims the card and shows a lock glyph
//   badge      — optional small node rendered in the top-right (e.g. "Next")

import { Icon } from './Icon.jsx';

// Subtle difficulty tints. Unknown difficulties fall back to the room accent.
const DIFF_PILL = {
  foundational: { label: 'Foundational', color: 'var(--accent)', bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
  analyst:      { label: 'Analyst',      color: 'var(--accent)', bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
  junior:       { label: 'Analyst',      color: 'var(--accent)', bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
  intermediate: { label: 'Intermediate', color: 'var(--teal)',   bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  senior:       { label: 'Senior',       color: 'var(--teal)',   bg: 'var(--teal-bg)',   border: 'var(--teal-border)' },
  advanced:     { label: 'Advanced',     color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  staff:        { label: 'Staff',        color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
};

export function CaseCard({
  id, title, subtitle, tags = [], difficulty, accent = 'accent',
  status, onClick, meta, locked = false, badge, addBtn,
}) {
  const accentBorder = `var(--${accent}-border)`;
  const solved = status === 'solved';

  const diffCfg = difficulty
    ? (DIFF_PILL[difficulty] || {
        label: difficulty,
        color: `var(--${accent})`,
        bg: `var(--${accent}-bg)`,
        border: accentBorder,
      })
    : null;

  const handleKey = e => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className='pal-card-enter pal-card-hover'
      role='button'
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKey}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1.1rem 1.25rem',
        cursor: 'pointer',
        transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)',
        position: 'relative',
        opacity: locked ? 0.7 : 1,
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = accentBorder;
        e.currentTarget.style.boxShadow = 'var(--shadow)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Optional top-right badge (e.g. "Next") */}
      {badge && (
        <span style={{ position: 'absolute', top: '0.6rem', right: '0.7rem' }}>
          {badge}
        </span>
      )}

      {/* Meta row: id chip + difficulty pill + status/lock/meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
        {id && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.05em', color: 'var(--text-dim)',
          }}>
            {id}
          </span>
        )}
        {diffCfg && (
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
            color: diffCfg.color, background: diffCfg.bg, border: `1px solid ${diffCfg.border}`,
            borderRadius: 'var(--radius-sm)', padding: '0.08rem 0.4rem',
          }}>
            {diffCfg.label}
          </span>
        )}

        {/* Right-aligned cluster: meta text, lock, status tick, add-to-track btn */}
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          {meta && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
              {meta}
            </span>
          )}
          {locked && <Icon name='lock' size={13} color='var(--text-muted)' />}
          {solved && (
            <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--green)' }}>
              <Icon name='check' size={14} color='currentColor' />
            </span>
          )}
          {addBtn && (
            <span onClick={e => e.stopPropagation()} style={{ display: 'inline-flex' }}>
              {addBtn}
            </span>
          )}
        </span>
      </div>

      {/* Title + subtitle */}
      <div>
        <h3 style={{
          fontSize: '0.97rem', fontWeight: 700, color: 'var(--text)',
          margin: '0 0 0.2rem', letterSpacing: '-0.01em', lineHeight: 1.35,
        }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {tags.map(tag => (
            <span key={tag} style={{
              fontSize: '0.71rem', color: 'var(--text-dim)',
              background: 'var(--surface-2)', border: '1px solid var(--border-subtle, var(--border))',
              borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.45rem',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default CaseCard;
