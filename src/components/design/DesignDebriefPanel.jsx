import { useState } from 'react';
import { ConceptChip, ConceptsSection } from '../concepts/ConceptChip.jsx';

// Debrief panel: shown after score reveal
// Sections: senior design rationale, per-field answer review, common mistakes, paired CTA

export function DesignDebriefPanel({
  scenario, answers, result,
  onOpenConcept,
  onGoToReview,   // navigate to the paired Review Room scenario
  onRetry,        // clear progress and re-attempt
  onNext,         // navigate to the next design scenario
}) {
  const [seeResultHovered, setSeeResultHovered] = useState(false);
  const [retryHovered, setRetryHovered] = useState(false);
  const [nextHovered, setNextHovered] = useState(false);
  const allFields = scenario.designPhases.flatMap(p => p.fields);
  const fieldsById = Object.fromEntries(allFields.map(f => [f.id, f]));

  // Collect all concept links from answered fields
  const allConceptIds = [...new Set(
    allFields.flatMap(f => f.conceptLinks || [])
  )];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Senior design rationale */}
      <section>
        <SectionLabel>Senior analyst rationale</SectionLabel>
        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
          borderLeft: '3px solid var(--teal)',
          borderRadius: 'var(--radius-sm)', padding: '0.9rem 1rem',
        }}>
          <p style={{
            fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0,
            whiteSpace: 'pre-wrap',
          }}>
            {scenario.seniorDesign.rationale}
          </p>
        </div>
      </section>

      {/* Answer review — phase by phase */}
      <section>
        <SectionLabel>Your answers reviewed</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {scenario.designPhases.map(phase => (
            <div key={phase.id}>
              <div style={{
                fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                color: 'var(--text-dim)', marginBottom: '0.6rem',
              }}>
                {phase.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {phase.fields.map(field => {
                  const answer = answers[field.id];
                  if (!answer || (Array.isArray(answer) && answer.length === 0)) {
                    return (
                      <AnswerRow
                        key={field.id}
                        field={field}
                        label="Not answered"
                        scoreValue={null}
                        rationale={null}
                        skipped
                        onOpenConcept={onOpenConcept}
                      />
                    );
                  }
                  if (field.type === 'single_select') {
                    const opt = field.options.find(o => o.id === answer);
                    return (
                      <AnswerRow
                        key={field.id}
                        field={field}
                        label={opt?.label}
                        scoreValue={opt?.scoreValue}
                        maxValue={Math.max(...field.options.map(o => o.scoreValue))}
                        rationale={opt?.rationale}
                        onOpenConcept={onOpenConcept}
                      />
                    );
                  }
                  // multi_select
                  const selected = Array.isArray(answer) ? answer : [answer];
                  const opts = selected.map(id => field.options.find(o => o.id === id)).filter(Boolean);
                  const totalEarned = opts.reduce((s, o) => s + o.scoreValue, 0);
                  const maxValue = Math.max(...field.options.map(o => o.scoreValue)) * selected.length;
                  return (
                    <MultiAnswerRow
                      key={field.id}
                      field={field}
                      opts={opts}
                      totalEarned={totalEarned}
                      maxValue={maxValue}
                      onOpenConcept={onOpenConcept}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Common mistakes */}
      <section>
        <SectionLabel>Common mistakes on this scenario</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {scenario.seniorDesign.commonMistakes.map((m, i) => (
            <div key={i} style={{
              background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
              borderRadius: 'var(--radius-sm)', padding: '0.75rem 0.9rem',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                marginBottom: '0.35rem', flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--yellow)' }}>
                  ⚠ {m.mistake}
                </span>
                {m.conceptLink && (
                  <ConceptChip id={m.conceptLink} onOpen={onOpenConcept} variant="inline" />
                )}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                {m.consequence}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Failure mode */}
      {scenario.seniorDesign.failureMode && (
        <section>
          <SectionLabel>Common failure mode</SectionLabel>
          <div style={{
            background: 'var(--red-bg, rgba(239,68,68,0.08))', border: '1px solid var(--red-border, rgba(239,68,68,0.25))',
            borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem',
            display: 'flex', flexDirection: 'column', gap: '0.6rem',
          }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.55, margin: 0 }}>
              <span style={{ fontWeight: 700, color: 'var(--red)' }}>Weak answer: </span>
              {scenario.seniorDesign.failureMode.weakAnswer}
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.55, margin: 0 }}>
              <span style={{ fontWeight: 700, color: 'var(--red)' }}>Interviewer follow-up: </span>
              <em>{scenario.seniorDesign.failureMode.interviewerFollowUp}</em>
            </p>
          </div>
        </section>
      )}

      {/* Concepts in this scenario */}
      {allConceptIds.length > 0 && (
        <ConceptsSection
          conceptIds={allConceptIds}
          onOpen={onOpenConcept}
          title="Concepts in this scenario"
        />
      )}

      {/* Paired scenario CTA */}
      {scenario.pairedReviewScenarioId && onGoToReview && (
        <section style={{
          background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
          borderRadius: 'var(--radius)', padding: '1rem 1.1rem',
        }}>
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: 'var(--accent)', marginBottom: '0.4rem',
          }}>
            You designed this test. Now see what happened.
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 0.75rem' }}>
            {scenario.pairedScenarioPrompt?.toReview || 'The results are in — messy, real, and under business pressure. How do you read them?'}
          </p>
          <button
            onClick={onGoToReview}
            style={{
              padding: '0.6rem 1.1rem',
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
              transition: 'opacity 0.1s',
              opacity: seeResultHovered ? 0.88 : 1,
            }}
            onMouseEnter={() => setSeeResultHovered(true)}
            onMouseLeave={() => setSeeResultHovered(false)}
          >
            See the result in Review Room →
          </button>
        </section>
      )}

      {/* Next scenario + Retry row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={onRetry}
          style={{
            background: 'none',
            border: '1px solid ' + (retryHovered ? 'var(--accent-border)' : 'var(--border)'),
            borderRadius: 'var(--radius-sm)', padding: '0.45rem 0.9rem',
            color: retryHovered ? 'var(--accent)' : 'var(--text-muted)',
            fontSize: '0.78rem', cursor: 'pointer',
            transition: 'all 0.12s',
          }}
          onMouseEnter={() => setRetryHovered(true)}
          onMouseLeave={() => setRetryHovered(false)}
        >
          ↺ Try again from scratch
        </button>
        {onNext && (
          <button
            onClick={onNext}
            className="pal-glow-pulse"
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius-sm)', padding: '0.5rem 1.1rem',
              fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
              transition: 'opacity 0.1s',
              opacity: nextHovered ? 0.88 : 1,
            }}
            onMouseEnter={() => setNextHovered(true)}
            onMouseLeave={() => setNextHovered(false)}
          >
            Next scenario →
          </button>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
      color: 'var(--text-dim)', marginBottom: '0.65rem',
    }}>
      {children}
    </div>
  );
}

function ScorePip({ scoreValue, maxValue }) {
  if (scoreValue === null || scoreValue === undefined) return null;
  const ratio = maxValue > 0 ? scoreValue / maxValue : 0;
  const color = ratio >= 0.85 ? 'var(--teal)' : ratio >= 0.5 ? 'var(--accent)' : 'var(--yellow)';
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700,
      color, background: 'var(--surface-2)',
      border: `1px solid ${color}`,
      borderRadius: 'var(--radius-sm)', padding: '0.05rem 0.35rem',
    }}>
      {scoreValue}/{maxValue}
    </span>
  );
}

function AnswerRow({ field, label, scoreValue, maxValue, rationale, skipped, onOpenConcept }) {
  return (
    <div style={{
      background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.8rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)' }}>
            {field.label}
          </span>
          {field.conceptLinks?.map(id => (
            <ConceptChip key={id} id={id} onOpen={onOpenConcept} variant="inline" />
          ))}
        </div>
        {!skipped && <ScorePip scoreValue={scoreValue} maxValue={maxValue} />}
      </div>
      {skipped ? (
        <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: 0, fontStyle: 'italic' }}>Not answered</p>
      ) : (
        <>
          <p style={{ fontSize: '0.84rem', color: 'var(--text)', margin: '0 0 0.4rem', fontWeight: 500 }}>
            "{label}"
          </p>
          {rationale && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>
              {rationale}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function MultiAnswerRow({ field, opts, totalEarned, maxValue, onOpenConcept }) {
  return (
    <div style={{
      background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.8rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)' }}>{field.label}</span>
          {field.conceptLinks?.map(id => (
            <ConceptChip key={id} id={id} onOpen={onOpenConcept} variant="inline" />
          ))}
        </div>
        <ScorePip scoreValue={totalEarned} maxValue={maxValue} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {opts.map(opt => (
          <div key={opt.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <span style={{
              fontSize: '0.68rem', fontWeight: 700, color: opt.scoreValue >= 2 ? 'var(--teal)' : opt.scoreValue === 1 ? 'var(--accent)' : 'var(--yellow)',
              marginTop: '0.1rem', flexShrink: 0,
            }}>
              {opt.scoreValue >= 2 ? '✓' : opt.scoreValue === 1 ? '~' : '✕'}
            </span>
            <div>
              <p style={{ fontSize: '0.83rem', color: 'var(--text)', margin: '0 0 0.2rem', fontWeight: 500 }}>"{opt.label}"</p>
              <p style={{ fontSize: '0.79rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{opt.rationale}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
