// StartHerePage — onboarding skeleton. Content TBD.
// Wired into the sidebar below Profile. Fill in content later.

export function StartHerePage({ onNavigate }) {
  return (
    <div className='pal-page-enter' style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: '0.4rem' }}>
          Getting started
        </p>
        <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text)',
          margin: '0 0 0.55rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Start Here
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, maxWidth: 500 }}>
          New to Product Analytics Lab? This guide covers the lab structure
          and recommends a path based on your experience level.
        </p>
      </div>

      {/* Placeholder sections */}
      {[
        { label: 'What is this lab?',       desc: 'Overview of the lab structure: Foundations, Practice Rooms, and Cases.' },
        { label: 'Pick your starting point', desc: 'Beginner, analyst, or senior? Find your entry level here.' },
        { label: 'Recommended path',         desc: 'A suggested order through Stats → Metrics → Experimentation → Cases.' },
        { label: 'Tracking your progress',   desc: 'How to use My Tracks and the progress dashboard.' },
      ].map(({ label, desc }) => (
        <div key={label} style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '1rem 1.1rem', marginBottom: '0.65rem',
        }}>
          <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.25rem' }}>
            {label}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            {desc}
          </p>
        </div>
      ))}

      <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.5 }}>
        Content coming soon.
      </p>
    </div>
  );
}

export default StartHerePage;
