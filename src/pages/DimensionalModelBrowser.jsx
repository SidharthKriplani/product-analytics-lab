import { Icon } from '../components/shared/Icon.jsx';

export function DimensionalModelBrowser({ onNavigate }) {
  const clusters = [
    {
      area: 'Star Schema Design',
      topics: ['fact vs dimension tables', 'grain definition', 'surrogate keys', 'slowly changing dimensions (SCD1/2)', 'degenerate dimensions'],
    },
    {
      area: 'Schema Critique',
      topics: ['spot normalisation mistakes', 'missing grain clarity', 'wrong foreign key placement', 'over-aggregated fact tables', 'NULL handling in dimensions'],
    },
    {
      area: 'Flipkart / E-commerce Models',
      topics: ['orders fact + product dim + seller dim', 'returns modelling', 'GMV vs net revenue fact split', 'funnel events schema', 'inventory snapshot fact'],
    },
    {
      area: 'Swiggy / Delivery Models',
      topics: ['delivery events fact', 'restaurant + rider dimensions', 'late delivery flag grain', 'city/zone geography dim', 'session-level funnel fact'],
    },
    {
      area: 'BI & Reporting Patterns',
      topics: ['slowly changing dimensions in practice', 'bridge tables for many-to-many', 'role-playing dimensions', 'conformed dimensions across marts', 'Kimball vs Inmon trade-offs'],
    },
    {
      area: 'Interview Patterns',
      topics: ['define the grain before anything else', 'justify denormalisation choices', 'handle late-arriving facts', 'explain trade-offs to a non-technical PM', 'validate schema against a sample query'],
    },
  ];

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: 860, margin: '0 auto', fontFamily: 'var(--font-sans)' }} className="pal-page-enter">

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Dimensional Modeling
          </h1>
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--yellow)',
            background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
            borderRadius: 4, padding: '2px 8px',
          }}>
            Coming Soon
          </span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
          Schema design and critique practice for data analysts and PMs. You'll see real-world
          warehouse models — e-commerce, delivery, BI reporting — and practice spotting flaws,
          defining grain, and justifying design decisions the way interviewers at Flipkart, Swiggy,
          and Meesho actually ask.
        </p>
      </div>

      {/* Status banner */}
      <div style={{
        background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
        borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
        marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      }}>
        <div style={{ marginTop: '0.05rem' }}><Icon name='wrench' size={18} color='var(--yellow)' /></div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--yellow)', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
            In development
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            Dimensional Modeling will ship as a standalone room with schema diagrams, critique
            exercises, and graded debrief. Until then, schema-related RCA and SQL problems are
            available in{' '}
            <button
              onClick={() => onNavigate && onNavigate('rca')}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, padding: 0, fontSize: '0.85rem' }}
            >RCA Room</button>
            {' '}and{' '}
            <button
              onClick={() => onNavigate && onNavigate('sql-lab')}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, padding: 0, fontSize: '0.85rem' }}
            >SQL Lab</button>.
          </div>
        </div>
      </div>

      {/* Why this matters */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginBottom: '2rem',
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
          Why this matters for Bangalore roles
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
          Flipkart DA, Swiggy DA, and Meesho PA rounds consistently include a schema design or
          critique question — either as a standalone problem or embedded in a case. Interviewers
          expect you to define grain, distinguish fact from dimension, justify SCD choices, and
          catch common mistakes (many-to-many without a bridge, NULL in a dimension key, wrong
          aggregation level on a fact). This is the 5-10% of coverage PAL does not yet build.
        </p>
      </div>

      {/* Planned curriculum */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
        Planned curriculum
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(360px, 100%), 1fr))', gap: '0.75rem' }}>
        {clusters.map((c, i) => (
          <div
            key={i}
            className="pal-card-enter"
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
              animationDelay: (i * 0.05) + 's',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
              {c.area}
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 1rem', listStyle: 'disc' }}>
              {c.topics.map((t, j) => (
                <li key={j} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

    </div>
  );
}
