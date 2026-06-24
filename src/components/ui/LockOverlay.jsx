import { Icon } from '../shared/Icon.jsx';

export function LockOverlay({ onUnlock }) {
  return (
    <div className="pal-slide-up" style={{
      position: 'absolute', inset: 0, zIndex: 10,
      background: 'var(--overlay)',
      backdropFilter: 'blur(4px)',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '2rem', display: 'flex' }}><Icon name='lock' size={32} color='currentColor' /></div>
      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>Private Beta</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '260px' }}>
        This scenario is part of the paid tier. Paid access coming soon — unlock code enabled for private beta.
      </div>
      <button
        onClick={onUnlock}
        style={{
          marginTop: '0.5rem',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '0.5rem 1.25rem',
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: 'pointer',
        }}
      >
        Enter Unlock Code
      </button>
    </div>
  );
}
