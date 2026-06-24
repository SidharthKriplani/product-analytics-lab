import { ConceptChip, ConceptsSection } from '../concepts/ConceptChip.jsx';
import { Icon } from '../shared/Icon.jsx';

// Senior analyst read + concept links + related room CTAs

export function StatsConceptPanel({
  module, selectedOption,
  onOpenConcept,
  onGoToReview,   // navigate to a paired review scenario
  onGoToDesign,   // navigate to a paired design scenario
  onRetry,
}) {
  const sr = module.seniorRead;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* Senior read */}
      <section>
        <SectionLabel>Senior analyst read</SectionLabel>

        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
          borderLeft: '3px solid var(--teal)',
          borderRadius: 'var(--radius-sm)', padding: '0.9rem 1rem',
          marginBottom: '0.75rem',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)', marginBottom: '0.3rem' }}>Short answer</div>
          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>{sr.shortAnswer}</p>
        </div>

        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)', padding: '0.9rem 1rem',
          marginBottom: '0.75rem',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>Why</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{sr.why}</p>
        </div>

        <div style={{
          background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem 0.9rem',
          marginBottom: '0.75rem',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--yellow)', marginBottom: '0.3rem' }}>Common mistake</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{sr.commonMistake}</p>
        </div>

        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
          borderLeft: '3px solid var(--teal)',
          borderRadius: 'var(--radius-sm)', padding: '0.75rem 0.9rem',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)', marginBottom: '0.3rem' }}>Interview phrasing</div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>{sr.interviewPhrase}</p>
        </div>
      </section>

      {/* Concept links */}
      {module.linkedConceptIds?.length > 0 && (
        <ConceptsSection
          conceptIds={module.linkedConceptIds}
          onOpen={onOpenConcept}
          title="Concepts in this module"
        />
      )}

      {/* Related room CTAs */}
      {(module.linkedScenarioIds?.length > 0 || module.linkedDesignIds?.length > 0) && (
        <section>
          <SectionLabel>Practice this concept further</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {module.linkedScenarioIds?.length > 0 && onGoToReview && (
              <div style={{
                background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                borderRadius: 'var(--radius-sm)', padding: '0.75rem 0.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--accent)', marginBottom: '0.2rem' }}>Review Room</div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>Read a messy experiment where this concept determines the call.</p>
                </div>
                <button
                  onClick={() => onGoToReview(module.linkedScenarioIds[0])}
                  style={{
                    padding: '0.45rem 0.85rem', background: 'var(--accent)', color: '#fff',
                    border: 'none', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                  }}
                >Go →</button>
              </div>
            )}
            {module.linkedDesignIds?.length > 0 && onGoToDesign && (
              <div style={{
                background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
                borderRadius: 'var(--radius-sm)', padding: '0.75rem 0.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--teal)', marginBottom: '0.2rem' }}>Design Room</div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>Design an experiment where this concept is the key decision.</p>
                </div>
                <button
                  onClick={() => onGoToDesign(module.linkedDesignIds[0])}
                  style={{
                    padding: '0.45rem 0.85rem', background: 'var(--teal)', color: '#fff',
                    border: 'none', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                  }}
                >Go →</button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Retry */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={onRetry}
          style={{
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.85rem',
            color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer',
            transition: 'all 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <Icon name='rotate-ccw' size={12} color='currentColor' /> Try again
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '0.65rem',
    }}>{children}</div>
  );
}
