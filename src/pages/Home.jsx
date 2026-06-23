import { createPortal } from 'react-dom';
import { BrandMark } from '../components/shared/BrandMark.jsx';

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
          background: 'radial-gradient(circle, rgba(36,87,214,0.09) 0%, transparent 70%)',
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
          {/* Slot 4 — signed-out hero, brand-forward (BrandMark wordmark, D-19) */}
          <BrandMark variant='wordmark' size={22} />
        </div>

        {/* Headline */}
        <h1
          className="pal-landing-el"
          style={{
            animationDelay: '120ms',
            fontSize: 'clamp(1.9rem, 5vw, 2.85rem)',
            fontWeight: 900,
            lineHeight: 1.12,
            letterSpacing: '-0.04em',
            color: 'var(--text)',
            margin: '0 0 0.3rem',
          }}
        >
          Practice product analytics
        </h1>
        <h1
          className="pal-landing-el"
          style={{
            animationDelay: '200ms',
            fontSize: 'clamp(1.9rem, 5vw, 2.85rem)',
            fontWeight: 900,
            lineHeight: 1.12,
            letterSpacing: '-0.04em',
            color: 'var(--accent)',
            margin: '0 0 1.5rem',
          }}
        >
          interviews beyond SQL.
        </h1>

        {/* Subtext */}
        <p
          className="pal-landing-el"
          style={{
            animationDelay: '340ms',
            fontSize: '0.975rem',
            lineHeight: 1.7,
            color: 'var(--text-muted)',
            margin: '0 0 1.25rem',
            maxWidth: 440,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Train on ambiguous metrics, A/B tests, RCA, instrumentation gaps, and ship/no-ship decisions —
          with structured cases and rubric-based feedback.
        </p>

        {/* Role chips */}
        <div
          className="pal-landing-el"
          style={{ animationDelay: '420ms', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.4rem', marginBottom: '2rem' }}
        >
          {['Product Analyst', 'Growth Analyst', 'DA moving to product', 'Senior Analyst'].map(role => (
            <span key={role} style={{
              fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '999px', padding: '0.2rem 0.7rem',
            }}>
              {role}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div
          className="pal-landing-el"
          style={{ animationDelay: '540ms', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}
        >
          <button
            onClick={() => onNavigate && onNavigate('benchmark')}
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
            Take the Judgment Benchmark →
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
            Explore Free Cases →
          </button>
        </div>

        {/* Social proof + footer note */}
        <p
          className="pal-landing-el"
          style={{ animationDelay: '680ms', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-dim, var(--text-muted))', opacity: 0.65, lineHeight: 1.6 }}
        >
          37 beta sign-ins in the first 48 hours of informal testing.
          <br />No account needed for the benchmark.
        </p>

        {/* What this tests */}
        <div
          className="pal-landing-el"
          style={{
            animationDelay: '740ms',
            marginTop: '1.75rem',
            textAlign: 'left',
            maxWidth: 440,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <h3 style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '0.6rem',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}>
            What this tests
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}>
            {[
              'Metric definition and trade-off judgment',
              'A/B test interpretation under ambiguity',
              'Root cause analysis on real-looking data',
              'Instrumentation and event design',
              'Ship / no-ship product decisions',
            ].map(item => (
              <li key={item} style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                paddingLeft: '1rem',
                position: 'relative',
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: 'var(--accent)',
                  fontWeight: 700,
                }}>{'—'}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Testimonials — outside the 560px wrapper so 1x4 has room */}
      {/* FULL QUOTES PRESERVED — restore if switching back to 2x2 card layout:
          Amaya:    "As a complete beginner in Statistics, PAL gave me a clear, structured path — I always knew exactly what to focus on next. The progression has been genuinely helpful, and I feel like I'm building a real foundation, not just memorising concepts."
          Jatin:    "The RCA framework on PAL gave me a structured diagnostic approach I could actually practise — not just read about. PAL helped me test whether I truly understood it and surface exactly where my gaps were."
          Debasrija:"The way PAL explains p-values actually clicked for me. Being able to tweak parameters and simulate experiments made it tangible — not just theoretical. The scenarios felt closer to real interview questions than anything I've seen."
          Swapnil:  "As a Data Scientist, I assumed I already understood product analytics — PAL showed me the gaps. The cases on metric diagnosis, funnel drops, and A/B interpretation forced me to think like a PM, not just run numbers. The debrief format is what makes it stick."
      */}
      <div
        className="pal-landing-el"
        style={{
          position: 'relative', zIndex: 1,
          animationDelay: '780ms',
          marginTop: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(190px, 100%), 1fr))',
          gap: '0.75rem',
          width: '100%',
          maxWidth: '860px',
          textAlign: 'left',
          padding: '0 1.5rem',
          boxSizing: 'border-box',
        }}
      >
        {[
          {
            quote: "PAL gave me a structured path — I always knew exactly what to focus on next.",
            name: 'Amaya Bhuyan',
            href: 'https://www.linkedin.com/in/amaya-bhuyan-91986119b/',
            img: '/testimonials/amaya.jpg',
            role: 'Statistics track',
          },
          {
            quote: "PAL doesn't let you passively scroll through — the format forces you to actively think, which is exactly what makes it stick.",
            name: 'Meghana Joshi',
            href: 'https://www.linkedin.com/in/meghana-joshi-82199537/',
            img: '/testimonials/meghana.jpg',
            role: 'Analyst & Educator',
          },
          {
            quote: "The p-value simulation made it tangible — closer to real interview questions than anything I've seen.",
            name: 'Debasrija Mondal',
            href: 'https://www.linkedin.com/in/debasrijamondal/',
            img: '/testimonials/debasrija.jpg',
            role: 'Stats & Design tracks',
          },
          {
            quote: "The cases forced me to think like a PM, not just run numbers.",
            name: 'Swapnil Pattanshetty',
            href: 'https://www.linkedin.com/in/swapnil-pattanshetty/',
            img: '/testimonials/swapnil.jpg',
            role: 'Data Scientist',
          },
        ].map(t => (
          <div key={t.name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.6, margin: '0 0 0.875rem', fontStyle: 'italic', flex: 1 }}>
              "{t.quote}"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src={t.img} alt={t.name} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              <div>
                <a href={t.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text)', textDecoration: 'none' }}>{t.name}</a>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
