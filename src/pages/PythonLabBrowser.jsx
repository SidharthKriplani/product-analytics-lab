export function PythonLabBrowser({ onNavigate }) {
  const modules = [
    { area: 'Core pandas',        topics: ['groupby + agg', 'merge safety', 'pivot_table cohorts', 'apply vs np.select', 'data cleaning pipeline'] },
    { area: 'Time Series',        topics: ['rolling averages', 'resample + WoW growth', 'pct_change pitfalls', 'date arithmetic'] },
    { area: 'NumPy & Stats',      topics: ['percentile distributions', 'weighted averages', 'array operations', 'bootstrap in numpy'] },
    { area: 'Python stdlib',      topics: ['collections.Counter', 'defaultdict patterns', 'itertools for analytics', 'functools.reduce'] },
    { area: 'End-to-End Tasks',   topics: ['funnel in pandas', 'cohort LTV', 'user classification', 'retention matrix'] },
    { area: 'Interview Patterns', topics: ['explain your approach before coding', 'catch silent bugs (merge inflation, unsorted pct_change)', 'validate output row counts', 'narrate trade-offs'] },
  ];

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: 860, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Python Lab
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
          Structured Python practice for analysts — pandas, numpy, collections, and end-to-end
          interview tasks. Every problem is set in a real product context (Swiggy, Flipkart,
          Zepto, Meesho) with pre-defined DataFrames so you focus on the analysis, not setup.
        </p>
      </div>

      {/* Status banner */}
      <div style={{
        background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
        borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
        marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      }}>
        <div style={{ fontSize: '1.1rem', marginTop: '0.05rem' }}>🔧</div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--yellow)', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
            In development
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            Python Lab will ship as a standalone room with a live Pyodide execution environment,
            graded output validation, and 30+ problems. Until then, Python problems are available
            in the <button
              onClick={() => onNavigate && onNavigate('code')}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, padding: 0, fontSize: '0.85rem' }}
            >Code Lab</button> — filter by Python track.
          </div>
        </div>
      </div>

      {/* Planned curriculum */}
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
          Planned curriculum
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(360px, 100%), 1fr))', gap: '0.75rem' }}>
          {modules.map((m, i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                {m.area}
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 1rem', listStyle: 'disc' }}>
                {m.topics.map((t, j) => (
                  <li key={j} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ marginTop: '2rem', padding: '1rem 1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          10 Python modules available now in Code Lab (filter by Python)
        </div>
        <button
          onClick={() => onNavigate && onNavigate('code')}
          style={{
            padding: '0.5rem 1.25rem', background: 'var(--accent)', border: 'none',
            borderRadius: 'var(--radius-sm)', color: '#fff', fontWeight: 700,
            fontSize: '0.85rem', cursor: 'pointer',
          }}
        >
          Go to Code Lab →
        </button>
      </div>
    </div>
  );
}
