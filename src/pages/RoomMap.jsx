/**
 * RoomMap — Visual learning arc for PAL
 * Shows three tracks: Analytics, SQL, PM/Judgment
 * Each node shows: room name, type (foundation/practice/simulation), estimated time
 */

export function RoomMap({ onNavigate }) {
  const tracks = [
    {
      id: 'analytics',
      label: 'Analytics Track',
      color: 'var(--teal)',
      bg: 'var(--teal-bg)',
      border: 'var(--teal-border)',
      description: 'The core product analyst workflow — from statistical foundations to experiment design to root cause analysis.',
      nodes: [
        { id: 'stat-foundations', label: 'Stat Foundations', type: 'foundation', time: '~3 hrs', note: 'Start here — builds the statistical intuition everything else assumes' },
        { id: 'stats', label: 'Stats Room', type: 'practice', time: '~2 hrs', note: 'Evaluate statistical claims in realistic experiment scenarios' },
        { id: 'rca-foundations', label: 'RCA Foundations', type: 'foundation', time: '~2 hrs', note: 'Builds the diagnostic framework before you see messy cases' },
        { id: 'rca', label: 'RCA Room', type: 'practice', time: '~3 hrs', note: '12 root cause analysis cases with SQL validation step' },
        { id: 'metrics-foundations', label: 'Metrics Foundations', type: 'foundation', time: '~2 hrs', note: 'North star, guardrails, sensitivity — before the cases' },
        { id: 'metrics', label: 'Metrics Room', type: 'practice', time: '~2 hrs', note: 'Define success metrics for ambiguous product contexts' },
        { id: 'design', label: 'A/B Design', type: 'practice', time: '~2 hrs', note: 'Design experiments before reading their results' },
        { id: 'browser', label: 'A/B Review', type: 'practice', time: '~3 hrs', note: '16 experiment readouts — Ship / Rollback / Investigate' },
        { id: 'growth-analytics', label: 'Growth Analytics', type: 'practice', time: '~2 hrs', note: 'Growth accounting, LTV/CAC, cohort retention, funnels' },
      ],
    },
    {
      id: 'sql',
      label: 'SQL Track',
      color: 'var(--accent)',
      bg: 'var(--accent-bg)',
      border: 'var(--accent-border)',
      description: 'Self-contained SQL practice — beginner to Master difficulty, all business-context framing.',
      nodes: [
        { id: 'sql-lab', label: 'SQL Lab', type: 'practice', time: '10–30 hrs', note: '130 problems across 12 datamarts — Easy to Master, stakeholder-framed prompts' },
        { id: 'code', label: 'Programming Lab', type: 'practice', time: '~2 hrs', note: 'Now a standalone BreakLabs app — opens separately' },
      ],
    },
    {
      id: 'pm',
      label: 'PM / Judgment Track',
      color: 'var(--purple)',
      bg: 'var(--purple-bg)',
      border: 'var(--purple-border)',
      description: 'Product sense, prioritization, behavioral, estimation — the PM-facing interview surface.',
      nodes: [
        { id: 'product-design', label: 'Product Design', type: 'practice', time: '~3 hrs', note: 'How would you build X — 5-phase structured format with scoring' },
        { id: 'prioritization', label: 'Prioritization', type: 'practice', time: '~2 hrs', note: 'RICE, effort-impact, OKR conflicts, stakeholder alignment' },
        { id: 'cases', label: 'Cases Room', type: 'practice', time: '~2 hrs', note: 'Business case analysis — opportunity sizing, make-vs-buy, feature evaluation' },
        { id: 'behavioral', label: 'Behavioral', type: 'practice', time: '~3 hrs', note: '30 leadership questions with full STAR answers and strong-signal markers' },
        { id: 'estimation', label: 'Estimation', type: 'practice', time: '~2 hrs', note: '30 Fermi estimation problems with arithmetic walkthroughs' },
      ],
    },
  ];

  const tools = [
    { id: 'defense-doc', label: 'Defense Strategy', note: 'Paste a JD → personalized study plan' },
    { id: 'company-tracks', label: 'Company Tracks', note: 'Curated prep packs by company' },
    { id: 'trainer', label: 'MCQ Trainer', note: '40 questions, 4 categories, weakness heatmap' },
    { id: 'simulator', label: 'Interview Simulator', note: 'Timed mock sessions with full debrief' },
    { id: 'search', label: 'Search', note: 'Find anything across all rooms instantly' },
  ];

  const TYPE_STYLE = {
    foundation: { label: 'Foundation', color: 'var(--teal)', bg: 'var(--teal-bg)' },
    practice:   { label: 'Practice',   color: 'var(--accent)', bg: 'var(--accent-bg)' },
    simulation: { label: 'Simulation', color: 'var(--purple)', bg: 'var(--purple-bg)' },
  };

  return (
    <div className="pal-page-enter" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem 5rem', boxSizing: 'border-box' }}>

      {/* Header */}
      <button onClick={() => onNavigate('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: 0, marginBottom: '1.5rem' }}>
        ← Home
      </button>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', margin: '0 0 0.5rem', letterSpacing: '-0.03em' }}>Room Map</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0, lineHeight: 1.6, maxWidth: '560px' }}>
          How PAL rooms connect. Three tracks — Analytics, SQL, PM/Judgment. Start with foundations, move to practice, use the tools layer for your interview plan.
        </p>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        {Object.entries(TYPE_STYLE).map(([key, s]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 700, color: s.color }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
            {s.label}
          </div>
        ))}
      </div>

      {/* Tracks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginBottom: '2.5rem' }}>
        {tracks.map(track => (
          <div key={track.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: track.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: track.color }}>{track.label}</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 1rem', lineHeight: 1.55, paddingLeft: '1.4rem' }}>{track.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', paddingLeft: '1.4rem' }}>
              {track.nodes.map((node, i) => {
                const ts = TYPE_STYLE[node.type] || TYPE_STYLE.practice;
                return (
                  <button
                    key={node.id}
                    onClick={() => onNavigate(node.id)}
                    className="pal-card-hover"
                    style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderTop: '2px solid ' + track.color,
                      borderRadius: 'var(--radius)', padding: '0.7rem 0.9rem',
                      cursor: 'pointer', textAlign: 'left', minWidth: '160px',
                      flex: '1 1 160px', maxWidth: '220px',
                      animationDelay: (i * 40) + 'ms',
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>{node.label}</div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: ts.color, background: ts.bg, borderRadius: '99px', padding: '0.1rem 0.45rem' }}>{ts.label}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{node.time}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{node.note}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Tools layer */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Tools layer — cross-track
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 0.9rem', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.1rem' }}>{tool.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tool.note}</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
