// RoomHeader — shared room-browser header for the "Monochrome Instrument"
// design system. One clean header used by every room: a small icon tile, an
// uppercase muted eyebrow, the room title, a one-line blurb, and a slim
// progress meter ("X / Y · Z%") rendered as a thin bar.
//
// Design rules:
//   - Hairline neutral borders only. The accent appears ONLY on the icon tile
//     glyph + tile tint and the progress bar fill — used sparingly.
//   - No colored rail/strip. Mobile-safe (wraps, no fixed widths).
//
// Props:
//   icon    — <Icon> name string (e.g. 'calculator')
//   accent  — CSS color var name WITHOUT var() wrapper, e.g. 'teal' | 'accent'
//             | 'green'. Drives icon tint + progress fill. Defaults to 'accent'.
//   eyebrow — small uppercase label above the title (e.g. 'Estimation Room')
//   title   — room title (h1)
//   blurb   — one-line description under the title
//   solved  — number of items completed (optional; meter hidden if total falsy)
//   total   — total number of items

import { Icon } from './Icon.jsx';

export function RoomHeader({ icon, accent = 'accent', eyebrow, title, blurb, solved = 0, total = 0 }) {
  const accentColor = `var(--${accent})`;
  const accentBg = `var(--${accent}-bg)`;
  const accentBorder = `var(--${accent}-border)`;
  const pct = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      {/* Icon tile + eyebrow + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: blurb ? '0.55rem' : '0.4rem' }}>
        {icon && (
          <span
            style={{
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: accentBg, border: `1px solid ${accentBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name={icon} size={18} color={accentColor} />
          </span>
        )}
        <div style={{ minWidth: 0 }}>
          {eyebrow && (
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.15rem',
            }}>
              {eyebrow}
            </div>
          )}
          <h1 style={{
            fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)',
            margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2,
          }}>
            {title}
          </h1>
        </div>
      </div>

      {/* Blurb */}
      {blurb && (
        <p style={{
          color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6,
          margin: '0 0 0.85rem', maxWidth: '640px',
        }}>
          {blurb}
        </p>
      )}

      {/* Slim progress meter */}
      {total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{ width: 120, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: accentColor, borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
            {solved} / {total} · {pct}%
          </span>
        </div>
      )}
    </div>
  );
}

export default RoomHeader;
