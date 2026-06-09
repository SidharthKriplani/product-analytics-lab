import { Icon } from './Icon.jsx';

/**
 * BeginnerOnboardingTrack — 4-step learning path for career-switchers
 * Add to Home.jsx after hero closes (after line 501) and before "Today" section
 * Usage: <BeginnerOnboardingTrack onNavigate={onNavigate} />
 */
export function BeginnerOnboardingTrack({ onNavigate }) {
  const steps = [
    {
      num: 1,
      title: 'Stat Foundations',
      desc: 'Learn what p-values, confidence intervals, and power really mean.',
      color: 'var(--blue)',
      bgColor: 'var(--blue-bg)',
      borderColor: 'var(--blue-border)',
      onClick: () => onNavigate('stat-foundations'),
    },
    {
      num: 2,
      title: 'RCA Foundations',
      desc: 'Master the 4-layer framework for diagnosing metric drops.',
      color: 'var(--teal)',
      bgColor: 'var(--teal-bg)',
      borderColor: 'var(--teal-border)',
      onClick: () => onNavigate('rca-foundations'),
    },
    {
      num: 3,
      title: '3 Easy Stats Cases',
      desc: 'Apply what you learned to real interview scenarios.',
      color: 'var(--green)',
      bgColor: 'var(--green-bg)',
      borderColor: 'var(--green-border)',
      onClick: () => onNavigate('stats'),
    },
    {
      num: 4,
      title: 'Defense Strategy',
      desc: 'Build a personalized interview prep plan for your role.',
      color: 'var(--purple)',
      bgColor: 'var(--purple-bg)',
      borderColor: 'var(--purple-border)',
      onClick: () => onNavigate('defense-doc'),
    },
  ];

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{
          fontSize: '1.1rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: 'var(--text)',
          margin: 0,
          marginBottom: '0.35rem',
        }}>
          New to product analytics?
        </h2>
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          Start here — a 4-step path designed for career-switchers and complete beginners.
        </p>
      </div>

      {/* Steps grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
        gap: '1rem',
      }}>
        {steps.map((step, idx) => (
          <div
            key={step.num}
            onClick={step.onClick}
            style={{
              padding: '1rem',
              background: step.bgColor,
              border: `1px solid ${step.borderColor}`,
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Step number badge */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: step.color,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9rem',
              }}
            >
              {step.num}
            </div>

            {/* Title */}
            <div style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--text)',
              lineHeight: 1.3,
            }}>
              {step.title}
            </div>

            {/* Description */}
            <div style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              lineHeight: 1.4,
              flex: 1,
            }}>
              {step.desc}
            </div>

            {/* Arrow CTA */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: step.color,
              fontWeight: 600,
              fontSize: '0.85rem',
              marginTop: '0.25rem',
            }}>
              Start <Icon name="chevron-right" size={14} color={step.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Connector lines (visual — optional) */}
      {/* Could add SVG lines connecting steps, but keeping it simple for now */}
    </div>
  );
}
