// The in-app Python Lab graduated into its own BreakLabs app (Programming Lab).
// This landing catches every internal route to 'python-lab' — sidebar uses a direct
// external link, but RoomMap, learning paths, search, and deep links land here.

const PROGRAMMING_LAB_URL = 'https://programming-lab.vercel.app/#/pylab';

export function ProgrammingLabMoved() {
  return (
    <div className="pal-page-enter" style={{ maxWidth: '620px', margin: '0 auto', padding: '4rem 1.5rem' }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px',
        padding: '2.25rem 2rem', textAlign: 'center',
      }}>
        <div style={{
          fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
          color: 'var(--text-muted)', marginBottom: '0.6rem',
        }}>
          Now its own app
        </div>
        <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.025em', margin: '0 0 0.6rem' }}>
          Programming Lab
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 0.4rem' }}>
          PAL's Python practice has graduated into a standalone BreakLabs app — the SWE-for-data
          fluency lab.
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0 0 1.6rem' }}>
          Predict the output, watch it break, keep the reflex.
        </p>
        <a
          href={PROGRAMMING_LAB_URL}
          target="_blank" rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
            padding: '0.65rem 1.4rem', background: 'var(--teal)', color: '#fff',
            borderRadius: '9px', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none',
          }}
        >
          Open Programming Lab <span aria-hidden="true">↗</span>
        </a>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '1.1rem 0 0' }}>
          Opens in a new tab · programming-lab.vercel.app
        </p>
      </div>
    </div>
  );
}
