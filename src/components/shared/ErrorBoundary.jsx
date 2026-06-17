import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('PAL ErrorBoundary caught:', error, info);
  }

  // Reset whenever the page key changes (App.jsx passes resetKey={page})
  static getDerivedStateFromProps(props, state) {
    if (state.hasError && props.resetKey !== state.lastResetKey) {
      return { hasError: false, lastResetKey: props.resetKey };
    }
    if (!state.hasError) {
      return { lastResetKey: props.resetKey };
    }
    return null;
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', padding: '2rem', textAlign: 'center',
        }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '2rem 2.5rem', maxWidth: '420px',
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
              Something went wrong
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.55 }}>
              An unexpected error occurred. Your progress is saved — refreshing will restore it.
            </div>
            <button
              onClick={() => { window.location.reload(); }}
              style={{
                padding: '0.55rem 1.4rem', background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700,
                fontSize: '0.9rem', cursor: 'pointer',
              }}
            >
              Go home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
