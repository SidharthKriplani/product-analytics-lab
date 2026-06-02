// Reusable difficulty filter chip bar for room browsers.
// Usage:
//   import { DifficultyChips } from '../components/shared/DifficultyChips.jsx';
//   const [diffFilter, setDiffFilter] = useState('all');
//   cases filtered by: diffFilter === 'all' || c.difficulty === diffFilter
//   <DifficultyChips value={diffFilter} onChange={setDiffFilter} counts={countsByDiff} />
//
// countsByDiff = { all: N, analyst: N, senior: N, staff: N }

const CHIP_CFG = {
  all:     { label: 'All',      color: 'var(--text-muted)',   bg: 'var(--surface-2)',  border: 'var(--border)' },
  analyst: { label: 'Analyst',  color: 'var(--accent)',       bg: 'var(--accent-bg)',  border: 'var(--accent-border)' },
  junior:  { label: 'Analyst',  color: 'var(--accent)',       bg: 'var(--accent-bg)',  border: 'var(--accent-border)' },
  senior:  { label: 'Senior',   color: 'var(--teal)',         bg: 'var(--teal-bg)',    border: 'var(--teal-border)' },
  staff:   { label: 'Staff',    color: 'var(--yellow)',       bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
};

export function DifficultyChips({ value, onChange, counts = {} }) {
  const tiers = ['all', 'analyst', 'senior', 'staff'].filter(t => t === 'all' || (counts[t] ?? 0) > 0);

  return (
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
      {tiers.map(tier => {
        const cfg = CHIP_CFG[tier] || CHIP_CFG.all;
        const active = value === tier;
        const count = tier === 'all' ? counts.all : counts[tier];
        return (
          <button
            key={tier}
            onClick={() => onChange(tier)}
            style={{
              fontSize: '0.75rem', fontWeight: active ? 700 : 500,
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${active ? cfg.border : 'var(--border)'}`,
              background: active ? cfg.bg : 'transparent',
              color: active ? cfg.color : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.12s',
            }}
          >
            {cfg.label}{count !== undefined ? ` (${count})` : ''}
          </button>
        );
      })}
    </div>
  );
}
