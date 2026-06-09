import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from 'recharts';

const AGG_DATA = [
  { name: 'Treatment', conversion: 8.2, fill: 'var(--accent)' },
  { name: 'Control', conversion: 9.1, fill: 'var(--teal)' },
];

const SEGMENT_DATA = [
  {
    segment: 'Mobile',
    treatment: 6.1, treatmentN: 8200,
    control: 5.8, controlN: 2100,
  },
  {
    segment: 'Desktop',
    treatment: 12.4, treatmentN: 1800,
    control: 11.9, controlN: 7900,
  },
];

const segChartData = SEGMENT_DATA.map(s => ({
  name: s.segment,
  Treatment: s.treatment,
  Control: s.control,
}));

function WinnerBadge({ winner }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em',
      background: winner === 'Treatment' ? 'var(--accent-bg)' : 'var(--teal-bg, var(--surface-2))',
      border: `1px solid ${winner === 'Treatment' ? 'var(--accent-border)' : 'var(--teal-border, var(--border))'}`,
      color: winner === 'Treatment' ? 'var(--accent)' : 'var(--teal)',
    }}>
      {winner} wins
    </span>
  );
}

export function Module15_SimpsonsParadox({ module, onNext }) {
  const [view, setView] = useState('aggregated');

  const btnBase = {
    padding: '0.45rem 1.1rem', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.15s',
  };
  const activeBtn = {
    ...btnBase,
    background: 'var(--accent)', border: '1.5px solid var(--accent)',
    color: '#fff', fontWeight: 800,
  };
  const inactiveBtn = {
    ...btnBase,
    background: 'var(--surface)', color: 'var(--text-muted)',
  };

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Scenario */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Every region improved its conversion rate this quarter, but the national conversion rate went down. Your VP is confused and thinks someone made a data error. They didn\'t — this is Simpson\'s Paradox, and it happens when the mix of subgroups shifts between periods.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          It\'s one of the most dangerous traps in A/B testing and metric reporting. A treatment can win in every segment but lose overall because the segments have different sizes and different baseline rates. The example below shows exactly how this happens with a checkout flow experiment.
        </p>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Try It: Unpack the Paradox</div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        <strong>Simpson's Paradox</strong> occurs when a trend present in each subgroup of data disappears — or
        reverses — when those groups are combined. It's one of the most dangerous traps in A/B test analysis.
      </p>

      {/* Scenario card */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Scenario: New Checkout Flow A/B Test</div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          You ran an A/B test on a new checkout flow. Treatment group got the new design, control got the old one.
          Aggregated conversion rate says Control wins. But when you break it down by device type, Treatment wins on <em>every</em> segment.
        </p>
      </div>

      {/* Instruction */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> Start with the aggregated view and note which group wins. Then toggle to the segment view. The result should reverse — treatment wins on every segment. Think about why the aggregated view was misleading before reading the explanation below.
      </div>

      {/* Toggle */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button style={view === 'aggregated' ? activeBtn : inactiveBtn} onClick={() => setView('aggregated')}>
          View Aggregated
        </button>
        <button style={view === 'segment' ? activeBtn : inactiveBtn} onClick={() => setView('segment')}>
          View by Segment
        </button>
      </div>

      {/* Chart area */}
      {view === 'aggregated' && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Aggregated: Overall Conversion Rate
            </div>
            <WinnerBadge winner="Control" />
          </div>

          <BarChart width={440} height={240} data={AGG_DATA} style={{ maxWidth: '100%' }}
            margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: '0.75rem' }} />
            <YAxis domain={[0, 14]} unit="%" tick={{ fill: 'var(--text-muted)', fontSize: '0.72rem' }} />
            <Tooltip formatter={v => `${v}%`} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }} />
            <Bar dataKey="conversion" name="Conversion Rate" radius={[4, 4, 0, 0]}>
              {AGG_DATA.map((entry, i) => (
                <Cell key={i} fill={i === 0 ? 'var(--accent)' : 'var(--teal)'} />
              ))}
            </Bar>
          </BarChart>

          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 140, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '0.7rem 1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>Treatment</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent)' }}>8.2%</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>10,000 users total</div>
            </div>
            <div style={{ flex: 1, minWidth: 140, background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '0.7rem 1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', marginBottom: 4 }}>Control</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--green)' }}>9.1%</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>10,000 users total</div>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 'var(--radius)', padding: '0.65rem 1rem', fontSize: '0.83rem', color: 'var(--red)' }}>
            Aggregated result: <strong>Control wins</strong> by +0.9 pp. You'd ship the old checkout. But wait — toggle to segment view.
          </div>
        </div>
      )}

      {view === 'segment' && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              By Segment: Mobile &amp; Desktop
            </div>
            <WinnerBadge winner="Treatment" />
          </div>

          <BarChart width={440} height={240} data={segChartData} style={{ maxWidth: '100%' }}
            margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: '0.75rem' }} />
            <YAxis domain={[0, 16]} unit="%" tick={{ fill: 'var(--text-muted)', fontSize: '0.72rem' }} />
            <Tooltip formatter={v => `${v}%`} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }} />
            <Legend wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} />
            <Bar dataKey="Treatment" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Control" fill="var(--teal)" radius={[4, 4, 0, 0]} />
          </BarChart>

          {/* Segment detail table */}
          <div style={{ marginTop: '0.85rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface)', borderBottom: '1.5px solid var(--border)' }}>
                  {['Segment', 'Treat. Conv.', 'Treat. N', 'Ctrl. Conv.', 'Ctrl. N', 'Winner'].map(h => (
                    <th key={h} style={{ padding: '0.45rem 0.65rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SEGMENT_DATA.map(s => (
                  <tr key={s.segment} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.5rem 0.65rem', fontWeight: 700, color: 'var(--text)' }}>{s.segment}</td>
                    <td style={{ padding: '0.5rem 0.65rem', color: 'var(--accent)', fontWeight: 700 }}>{s.treatment}%</td>
                    <td style={{ padding: '0.5rem 0.65rem', color: 'var(--text-muted)' }}>{s.treatmentN.toLocaleString()}</td>
                    <td style={{ padding: '0.5rem 0.65rem', color: 'var(--teal)', fontWeight: 700 }}>{s.control}%</td>
                    <td style={{ padding: '0.5rem 0.65rem', color: 'var(--text-muted)' }}>{s.controlN.toLocaleString()}</td>
                    <td style={{ padding: '0.5rem 0.65rem' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.78rem' }}>Treatment ✓</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '0.75rem', background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius)', padding: '0.65rem 1rem', fontSize: '0.83rem', color: 'var(--green)', lineHeight: 1.55 }}>
            <strong>Segment result: Treatment wins on both Mobile (+0.3 pp) and Desktop (+0.5 pp).</strong> The aggregated "Control wins" result was an artifact: Treatment got 82% mobile users (low baseline), Control got 79% desktop users (high baseline). The mix created the illusion.
          </div>
        </div>
      )}

      {/* Why this happens */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Why this happens</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          The paradox arises when two conditions hold simultaneously:
        </div>
        <ol style={{ margin: '0.6rem 0 0', paddingLeft: '1.4rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <li><strong>Groups have different baseline rates</strong> — mobile converts at ~6%, desktop at ~12%.</li>
          <li><strong>Treatment assignment is unequal across groups</strong> — Treatment has 82% mobile, Control has 79% desktop.</li>
        </ol>
        <div style={{ marginTop: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          The aggregate mixes high-converting desktop users into Control more than Treatment, making Control look better even though it loses in every fair comparison.
        </div>
      </div>

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>
          {module?.keyInsight || "Always segment before concluding. When groups differ in both the treatment assignment and the outcome baseline, aggregated comparisons lie."}
        </div>
      </div>

      {/* Connection */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || "Critical for A/B test analysis: if randomization creates unequal segment distributions (e.g., more mobile users in treatment), aggregated conversion rates will be confounded."}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="pal-glow-pulse"
          onClick={onNext}
          style={{ padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
        >
          Next concept →
        </button>
      </div>
    </div>
  );
}
