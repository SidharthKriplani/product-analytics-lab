import { createPortal } from 'react-dom';

// Ghost data snippets — analytics content hinting at what waits inside
const GHOSTS = [
  { text: 'p = 0.04', top: '12%', left: '7%',  delay: '0s',   dur: '6s'  },
  { text: 'DAU ↓ 31%', top: '22%', right: '6%', delay: '1.8s', dur: '7s'  },
  { text: 'SRM detected', top: '70%', left: '5%', delay: '3.2s', dur: '8s' },
  { text: 'retention: 67%', top: '78%', right: '7%', delay: '0.9s', dur: '6.5s' },
  { text: 'funnel drop @ step 3', top: '45%', left: '3%', delay: '2.4s', dur: '9s' },
  { text: 'novelty effect?', top: '55%', right: '4%', delay: '4s', dur: '7.5s' },
  { text: 'CUPED variance ↓18%', top: '88%', left: '12%', delay: '1.2s', dur: '8s' },
  { text: 'p-value: 0.001', top: '8%', right: '18%', delay: '3.6s', dur: '6s'  },
];

export function Home({ onNavigate, onShowAuth }) {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: 'var(--bg)',
      padding: '2rem 1.5rem',
    }}>

      {/* ── Animated background orbs ── */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '15%', left: '20%',
          width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)',
          animation: 'palLandingBgDrift 18s ease-in-out infinite',
          filter: 'blur(2px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '15%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,184,166,0.09) 0%, transparent 70%)',
          animation: 'palLandingBgDrift 24s ease-in-out infinite reverse',
          filter: 'blur(2px)',
        }} />
      </div>

      {/* ── Ghost analytics snippets ── */}
      {GHOSTS.map((g, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: g.top, left: g.left, right: g.right,
            fontFamily: 'monospace',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            opacity: 0,
            letterSpacing: '0.02em',
            animation: `palGhostFade ${g.dur} ${g.delay} ease-in-out infinite`,
            pointerEvents: 'none',
            userSelect: 'none',
            filter: 'blur(0.4px)',
          }}
        >
          {g.text}
        </div>
      ))}

      {/* ── Main content ── */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, width: '100%', textAlign: 'center' }}>

        {/* Badge */}
        <div
          className="pal-landing-el"
          style={{ animationDelay: '0ms', marginBottom: '1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <div style={{
            width: 22, height: 22, flexShrink: 0,
            background: 'var(--gradient-accent)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(99,102,241,0.35)',
          }}>
            <svg width="13" height="13" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <g stroke="#ffffff" strokeLinecap="round" strokeWidth="1.6">
                <line x1="4" y1="13" x2="22" y2="13"/>
                <line x1="4" y1="8"  x2="4"  y2="18"/>
                <line x1="22" y1="8" x2="22" y2="18"/>
              </g>
              <circle cx="13" cy="13" r="2.2" fill="#ffffff"/>
            </svg>
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Product Analytics Lab
          </span>
        </div>

        {/* Headline */}
        <h1
          className="pal-landing-el"
          style={{
            animationDelay: '120ms',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 900,
            lineHeight: 1.12,
            letterSpacing: '-0.04em',
            color: 'var(--text)',
            margin: '0 0 0.3rem',
          }}
        >
          You know the framework.
        </h1>
        <h1
          className="pal-landing-el"
          style={{
            animationDelay: '260ms',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 900,
            lineHeight: 1.12,
            letterSpacing: '-0.04em',
            color: 'var(--accent)',
            margin: '0 0 1.75rem',
          }}
        >
          Can you diagnose the drop?
        </h1>

        {/* Subtext */}
        <p
          className="pal-landing-el"
          style={{
            animationDelay: '420ms',
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--text-muted)',
            margin: '0 0 2.5rem',
            maxWidth: 440,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          The hands-on prep platform for product analysts and PMs.
          17 rooms. 140+ cases. Every skill that matters in interviews — tested on judgment, not recall.
        </p>

        {/* CTAs */}
        <div
          className="pal-landing-el"
          style={{ animationDelay: '580ms', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}
        >
          <button
            onClick={() => onShowAuth && onShowAuth()}
            className="pal-landing-glow"
            style={{
              padding: '0.85rem 2.25rem',
              fontSize: '1rem',
              fontWeight: 700,
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              fontFamily: 'inherit',
              transition: 'transform 0.15s ease, background 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'var(--accent-hover, #4f46e5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--accent)'; }}
          >
            Sign in to analyze →
          </button>

          <button
            onClick={() => onNavigate && onNavigate('foundations')}
            style={{
              padding: '0.6rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            Explore without signing in
          </button>
        </div>

        {/* Footer note */}
        <p
          className="pal-landing-el"
          style={{ animationDelay: '720ms', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-dim, var(--text-muted))', opacity: 0.7 }}
        >
          Free to start · No account required for first 3 cases per room
        </p>

      </div>
    </div>
  );
}
