import { BrandMark } from '../shared/BrandMark.jsx';

export function Footer({ onNavigate }) {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      padding: '1.5rem',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        {/* Slot 6 — Footer brand: full lockup (break⌇labs · Product Analytics, D-19).
            The master wordmark carries the "part of BreakLabs" family tie inherently, so the
            full lockup is used instead of wordmark + redundant "part of BreakLabs" text. */}
        <BrandMark variant='full' descriptor='Product Analytics' size={15} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            Works offline · Private by design · No account required
          </span>
          {onNavigate && (
            <button
              onClick={() => onNavigate('qa')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--border)', fontSize: '0.68rem',
                fontFamily: 'monospace', padding: '0',
                transition: 'color 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-dim)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--border)'}
              title="QA Dashboard"
            >qa</button>
          )}
        </div>
      </div>
    </footer>
  );
}
