import { useState, useEffect } from 'react';
import { loadSFState, saveSFState } from '../../../utils/statsFoundationsState.js';

const CONDITIONS = [
  {
    id: 'relevance',
    label: 'Relevance',
    description: 'The instrument (Z) is correlated with the treatment (D).',
    question: 'Does the instrument actually affect treatment take-up?',
    example: 'Draft lottery number affects military service probability (F-stat >> 10).',
    testable: true,
    testNote: 'Testable: run first-stage regression Z → D. F-stat < 10 = weak instrument.',
    options: [
      { id: 'yes', label: 'Yes — Z predicts D (F-stat = 42, p < 0.001)', correct: true },
      { id: 'no', label: 'No — Z is uncorrelated with D (F-stat = 0.8)', correct: false },
      { id: 'weak', label: 'Weakly — Z slightly predicts D (F-stat = 3.2)', correct: false },
    ],
  },
  {
    id: 'exogeneity',
    label: 'Exogeneity',
    description: 'The instrument (Z) is as-good-as-random — not caused by confounders.',
    question: 'Is the instrument independent of unmeasured confounders?',
    example: 'Draft lottery is randomized — not driven by socioeconomic status or ability.',
    testable: false,
    testNote: 'Not directly testable — requires institutional knowledge / design argument. Partially assessed via balance tests.',
    options: [
      { id: 'random', label: 'Yes — Z is randomized / as-good-as-random', correct: true },
      { id: 'correlated', label: 'No — Z is correlated with confounders', correct: false },
      { id: 'partial', label: 'Partially — Z is self-selected by participants', correct: false },
    ],
  },
  {
    id: 'exclusion',
    label: 'Exclusion Restriction',
    description: 'Z affects the outcome (Y) only through D — no direct path Z → Y.',
    question: 'Does the instrument affect the outcome only via treatment?',
    example: 'Lottery number affects earnings only via military service, not directly.',
    testable: false,
    testNote: 'Not directly testable — requires theoretical justification. Violations are the most common IV failure.',
    options: [
      { id: 'only', label: 'Yes — Z affects Y only through D', correct: true },
      { id: 'direct', label: 'No — Z has a direct effect on Y beyond D', correct: false },
      { id: 'partial', label: 'Partially — Z affects Y through D and one other path', correct: false },
    ],
  },
];

export function Module25_IV({ module, onNext }) {
  var _saved = loadSFState('sf25');
  const [answers, setAnswers] = useState(function() { return _saved ? (_saved.answers || {}) : {}; });
  const [revealed, setRevealed] = useState(function() { return _saved ? (_saved.revealed || {}) : {}; });

  useEffect(function() {
    saveSFState('sf25', { answers: answers, revealed: revealed });
  }, [answers, revealed]);

  function handleAnswer(condId, optId) {
    if (revealed[condId]) return;
    setAnswers(prev => ({ ...prev, [condId]: optId }));
    setRevealed(prev => ({ ...prev, [condId]: true }));
  }

  const allDone = CONDITIONS.every(c => revealed[c.id]);
  const allCorrect = CONDITIONS.every(c => {
    const chosen = CONDITIONS.find(x => x.id === c.id).options.find(o => o.id === answers[c.id]);
    return chosen?.correct;
  });

  return (
    <div className="pal-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Scenario */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>The Scenario</div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, fontSize: '0.9rem' }}>
          Users who opt into your premium coaching feature have 30% higher retention. But they self-selected — maybe they were already more motivated. You can\'t randomize access for ethical and business reasons. So you look for an instrument: something that nudged users toward the feature but couldn\'t directly affect retention.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0.6rem 0 0', fontSize: '0.9rem' }}>
          Instrumental Variables isolates the variation in treatment that\'s essentially random — like being shown a promotional banner due to a random UI experiment. The banner affects whether users adopt the feature but has no direct path to retention. If the instrument is valid, you can estimate the true causal effect despite self-selection. Match the three IV conditions below.
        </p>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Try It: Match the IV Conditions</div>

      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontSize: '0.95rem' }}>
        Instrumental Variables (IV) uses a third variable — the <strong>instrument</strong> — that causes
        the treatment but has no direct effect on the outcome. This isolates the variation in treatment
        that is essentially random. IV is valid only when all three conditions below hold. Select the
        correct description for each.
      </p>

      {/* Diagram */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', overflowX: 'auto' }}>
        <svg viewBox="0 0 420 90" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}>
          {/* Nodes */}
          {[
            { x: 40, y: 45, label: 'Z', sublabel: 'Instrument', color: 'var(--teal)', bg: 'var(--teal-bg)', border: 'var(--teal-border)' },
            { x: 210, y: 45, label: 'D', sublabel: 'Treatment', color: 'var(--accent)', bg: 'var(--accent-bg)', border: 'var(--accent-border)' },
            { x: 380, y: 45, label: 'Y', sublabel: 'Outcome', color: 'var(--green)', bg: 'var(--green-bg)', border: 'var(--green-border)' },
          ].map(n => (
            <g key={n.label}>
              <rect x={n.x - 30} y={n.y - 20} width={60} height={40} rx={6} fill={n.bg} stroke={n.border} strokeWidth={1.5} />
              <text x={n.x} y={n.y - 4} textAnchor="middle" fontSize={13} fontWeight={800} fill={n.color}>{n.label}</text>
              <text x={n.x} y={n.y + 11} textAnchor="middle" fontSize={7} fill={n.color}>{n.sublabel}</text>
            </g>
          ))}
          {/* Z → D arrow (relevance) */}
          <line x1={70} y1={45} x2={178} y2={45} stroke="var(--teal)" strokeWidth={2} markerEnd="url(#arr-teal)" />
          {/* D → Y arrow */}
          <line x1={242} y1={45} x2={348} y2={45} stroke="var(--accent)" strokeWidth={2} markerEnd="url(#arr-accent)" />
          {/* Z ⇸ Y cross (exclusion restriction) */}
          <line x1={70} y1={30} x2={348} y2={30} stroke="var(--red)" strokeWidth={1} strokeDasharray="4,3" opacity={0.6} />
          <text x={209} y={26} textAnchor="middle" fontSize={8} fill="var(--red)" opacity={0.8}>✗ no direct path</text>
          {/* Confounders box */}
          <rect x={155} y={60} width={110} height={22} rx={4} fill="var(--yellow-bg)" stroke="var(--yellow-border)" strokeWidth={1} />
          <text x={210} y={75} textAnchor="middle" fontSize={8} fill="var(--yellow-text)">Unmeasured confounders</text>
          {/* Confounder arrows */}
          <line x1={210} y1={60} x2={210} y2={48} stroke="var(--yellow-text)" strokeWidth={1} strokeDasharray="3,2" />
          <defs>
            <marker id="arr-teal" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--teal)" />
            </marker>
            <marker id="arr-accent" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Instruction */}
      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> For each of the three IV conditions, read the description and the example, then select the option that correctly satisfies that condition. You will see immediate feedback with the testability note. Try to distinguish which conditions can actually be tested versus which require theoretical justification.
      </div>

      {/* Condition cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {CONDITIONS.map((cond, idx) => {
          const isRevealed = revealed[cond.id];
          const chosen = cond.options.find(o => o.id === answers[cond.id]);
          const isCorrect = chosen?.correct;

          return (
            <div key={cond.id} style={{
              border: `1.5px solid ${!isRevealed ? 'var(--border)' : isCorrect ? 'var(--green-border)' : 'var(--red-border)'}`,
              borderRadius: 'var(--radius)',
              background: !isRevealed ? 'var(--surface)' : isCorrect ? 'var(--green-bg)' : 'var(--red-bg)',
              padding: '1rem 1.25rem',
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                  {idx + 1}/3
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{cond.label}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 2 }}>{cond.description}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                Example: {cond.example}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                {cond.question}
              </div>

              {!isRevealed ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {cond.options.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswer(cond.id, opt.id)}
                      style={{
                        textAlign: 'left', padding: '0.45rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem',
                        border: '1px solid var(--border)', background: 'var(--surface-2)',
                        color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                  <span style={{ fontWeight: 700, color: isCorrect ? 'var(--green)' : 'var(--red)', marginRight: 6 }}>
                    {isCorrect ? '✓ Correct —' : '✗ Not quite —'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {isCorrect
                      ? cond.testNote
                      : `The correct answer: "${cond.options.find(o => o.correct)?.label ?? '—'}". ${cond.testNote}`}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Score */}
      {allDone && (
        <div className="pal-reveal-in" style={{
          background: allCorrect ? 'var(--green-bg)' : 'var(--yellow-bg)',
          border: `1px solid ${allCorrect ? 'var(--green-border)' : 'var(--yellow-border)'}`,
          borderRadius: 'var(--radius)', padding: '0.9rem 1.25rem',
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: allCorrect ? 'var(--green)' : 'var(--yellow-text)' }}>
            {allCorrect
              ? '3/3 — You know the IV conditions. In practice, exogeneity and exclusion are the hard ones — they require institutional knowledge, not just statistics.'
              : 'Review the explanations above. The exclusion restriction is the condition that most often quietly breaks in real-world IVs.'}
          </div>
        </div>
      )}

      {/* Key Insight */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Key Insight</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--yellow-text)', lineHeight: 1.6 }}>{module?.keyInsight}</div>
      </div>

      {/* Connection */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{module?.connection}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="pal-glow-pulse" onClick={onNext} style={{ padding: '0.7rem 1.75rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--green)', color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', boxShadow: 'var(--shadow)', letterSpacing: '0.02em' }}>
          Complete ✓
        </button>
      </div>
    </div>
  );
}
