// BrandMark.jsx — canonical BreakLabs lockup (D-19, HQ/BRANDMARK-ROLLOUT.md).
// House rule: single quotes. Constant across all labs: seam red + wordmark.
// Per lab: descriptor text + accent. PAL uses its OWN signature blue (var(--accent)) for the
// descriptor — a deliberate override of HQ's assigned indigo track accent (Sidharth's call).
// PAL token map (spec → PAL CSS vars): --ink-hi → --text, --ink-low → --text-dim,
// --rim → --border, --surface and --font-mono are used as-is.
const SEAM = '#FB5247';          // brand red — the fault-glyph (CONSTANT — do not change)
const PAL_ACCENT = 'var(--accent)'; // PAL signature blue — descriptor only (seam stays red)

function Seam({ h = 28 }) {
  const w = Math.round(h * 0.32);
  return (
    <svg width={w} height={h} viewBox='0 0 11 34' aria-hidden='true' style={{ margin: '0 1px', flex: '0 0 auto' }}>
      <path d='M6 2 L3 11 L9 17 L3 23 L6 32' fill='none' stroke={SEAM} strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

// variant: 'full' (wordmark + descriptor) | 'wordmark' | 'monogram'
// accent: descriptor colour — defaults to PAL indigo; pass another lab's track accent if reused.
export function BrandMark({ variant = 'full', descriptor = '', accent = PAL_ACCENT, size = 28 }) {
  if (variant === 'monogram') {
    return (
      <span aria-label='BreakLabs' style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, borderRadius: Math.round(size * 0.24),
        background: 'var(--surface, #15171A)', border: '1px solid var(--border, #2A2D31)' }}>
        <Seam h={Math.round(size * 0.62)} />
      </span>
    );
  }
  if (variant === 'stacked') {
    // wordmark on top, descriptor stacked below (for narrow rails like the sidebar)
    return (
      <span aria-label={descriptor ? 'BreakLabs ' + descriptor : 'BreakLabs'}
        style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', fontFamily: 'var(--font-mono)', lineHeight: 1.12 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--text, #F2F3F5)', fontSize: size }}>
          break<Seam h={size} />labs
        </span>
        {descriptor && (
          <span style={{ color: accent, fontSize: Math.round(size * 0.52), fontWeight: 600, letterSpacing: '0.02em', marginTop: '0.12em' }}>
            {descriptor}
          </span>
        )}
      </span>
    );
  }
  return (
    <span aria-label={descriptor ? 'BreakLabs ' + descriptor : 'BreakLabs'}
      style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-mono)',
        fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--text, #F2F3F5)', fontSize: size }}>
      break<Seam h={size} />labs
      {variant === 'full' && descriptor && (
        <>
          <span style={{ color: 'var(--text-dim, #5F5E5A)', margin: '0 0.4em' }}>·</span>
          <span style={{ color: accent }}>{descriptor}</span>
        </>
      )}
    </span>
  );
}
