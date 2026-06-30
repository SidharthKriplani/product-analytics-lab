import { useState, useEffect } from 'react';
import { loadSFState, saveSFState } from '../../../utils/statsFoundationsState.js';
import { Icon } from '../../shared/Icon.jsx';

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

const prose = {
  color: 'var(--text-secondary)',
  lineHeight: 1.75,
  margin: 0,
  fontSize: '0.92rem',
};

const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

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

      {/* ── Causal chain prose ── */}
      <div style={sectionGap}>
        <p style={prose}>
          You want to know whether being contacted by your sales team causes users to convert. Simple comparison: contacted users convert at 18%; non-contacted at 6%. Is that 12pp gap causal? Almost certainly not all of it. Sales teams contact engaged users — people who have already shown intent signals. Those users were probably going to convert at higher rates even without the call.
        </p>
        <p style={prose}>
          You can't randomize sales contact, can't run an RD, and DiD doesn't apply directly. What you need is a source of variation in sales contact that is not correlated with user intent.
        </p>
        <p style={prose}>
          Imagine salespeople have territories, and whether a user's company is in a high-density territory determines their probability of being contacted. This geographic variation is as good as random with respect to user intent. This is an <strong style={{ color: 'var(--text)' }}>instrumental variable (IV)</strong> — a variable that affects the treatment (sales contact) without directly affecting the outcome (conversion) except through the treatment.
        </p>
        <p style={prose}>
          The method is two-stage least squares (2SLS). Stage 1: regress sales contact on territory density to get predicted contact probability. Stage 2: regress conversion on the predicted contact probability from stage 1. The coefficient from stage 2 is the IV estimate. It works because the predicted contact probability contains only the clean, geography-driven variation — the confounded part driven by intent is not in the predicted values.
        </p>
        <p style={prose}>
          Three assumptions must hold. <strong style={{ color: 'var(--text)' }}>Relevance</strong>: the instrument must actually affect the treatment (testable — F-stat below ~10 means weak instrument). <strong style={{ color: 'var(--text)' }}>Exclusion restriction</strong>: the instrument must not affect the outcome except through the treatment (not testable — requires domain argument). <strong style={{ color: 'var(--text)' }}>Independence</strong>: the instrument must not be correlated with confounders. The IV estimate is always a Local Average Treatment Effect — the causal effect for compliers only.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          You're evaluating an IV for estimating the effect of app notifications on daily active use. Your proposed instrument is whether the user's device was manufactured before a certain date (older devices don't support rich notifications). What would you check to evaluate whether this is a valid instrument?
        </p>
      </div>

      {/* ── Interactive ── */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It: Match the IV Conditions</div>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> For each of the three IV conditions, read the description and the example, then select the option that correctly satisfies that condition. You will see immediate feedback with the testability note. Try to distinguish which conditions can actually be tested versus which require theoretical justification.
      </div>

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
                    {isCorrect ? <><Icon name='check' size={15} color='currentColor' /> Correct —</> : <><Icon name='x' size={15} color='currentColor' /> Not quite —</>}
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

      {/* What you should have confirmed */}
      {allDone && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            You'd check relevance (do older devices have meaningfully lower notification engagement? First-stage F-stat), exclusion restriction (do older devices affect DAU through any mechanism other than notifications? Possibly — older devices might have worse performance overall, affecting DAU directly, violating the exclusion restriction), and independence (are older-device users systematically different in ways that affect DAU?). This instrument likely fails the exclusion restriction. The condition cards show how the confounded path makes the IV estimate inconsistent.
          </p>
        </div>
      )}

      {/* ── Analyst Move ── */}
      <div style={{ background: 'var(--yellow-bg)', border: '1.5px solid var(--yellow-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> When a proposed instrument is on the table, immediately test its first stage. If the F-statistic is below 10, stop. A weak instrument produces IV estimates that are worse than the biased OLS estimate you started with — biased in the same direction and with much more variance. Strong first stage is a prerequisite, not a check.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> The exclusion restriction is always the hard part. It can't be tested statistically — it requires an argument about causal mechanisms. Build that argument explicitly: why can't Z affect Y except through X? What are the ways Z could affect Y directly? If any plausible direct pathway exists, the instrument is invalid. This argument belongs in the analysis writeup, not just in your head.</p>
          <p style={{ ...prose, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> When someone cites an IV study as evidence, ask: what's the instrument, what's the first stage strength, and what's the argument for the exclusion restriction? These three questions cover the three assumptions. If any are unanswered, the study's causal claim isn't established. IV results are often presented with more certainty than the underlying assumptions warrant.</p>
        </div>
      </div>

      {/* ── Connection ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Connects to Experiments</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {module?.connection || 'IV is a tool for causal estimation when randomization is impossible. In experiment design, when you can\'t randomly assign the treatment itself, look for a variable that shifts assignment probability cleanly — that variable is your instrument, and 2SLS recovers the causal effect.'}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="pal-glow-pulse" onClick={onNext} style={{ padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--yellow)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
          Next concept →
        </button>
      </div>
    </div>
  );
}
