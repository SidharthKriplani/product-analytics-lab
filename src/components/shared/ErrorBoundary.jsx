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
    console.error('PAL ErrorBoundary caught:', error, info)
    // 2026-07-23 auto-heal (ported from GSL): the in-place highlighter wraps text
    // nodes in <mark> elements — DOM React didn't author. When React later
    // reconciles that subtree structurally it can throw insertBefore/removeChild
    // "not a child" errors (seen live on GSL seq-parallel and MSL). The boundary
    // catch already unmounts the subtree, so an automatic retry mounts a FRESH
    // tree and recovers — same as the manual reset, minus the user seeing it.
    // Capped at 2 heals / 15s so genuinely broken renders still surface.
    const msg = String(error && error.message || '')
    if (/insertBefore|removeChild|not a child of this node|NotFoundError/i.test(msg) && (this._heals || 0) < 2) {
      this._heals = (this._heals || 0) + 1
      try {
        document.querySelectorAll('mark[data-hl-id]').forEach(m => {
          const parent = m.parentNode; if (!parent) return
          while (m.firstChild) parent.insertBefore(m.firstChild, m)
          parent.removeChild(m)
          parent.normalize()
        })
      } catch { /* best-effort */ }
      setTimeout(() => this.setState({ hasError: false }), 0)
      setTimeout(() => { this._heals = 0 }, 15000)
    }
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
