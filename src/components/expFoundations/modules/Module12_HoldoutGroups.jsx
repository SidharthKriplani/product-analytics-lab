import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox as SharedInsightBox, NextBtn as SharedNextBtn, MCQOption, CheckBtn as SharedCheckBtn, InstructionBox as SharedInstructionBox } from '../../shared/FoundationPrimitives.jsx';

function InsightBox(props) { return <SharedInsightBox color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)' {...props} />; }
function NextBtn(props) { return <SharedNextBtn color='var(--accent)' {...props} />; }
function CheckBtn(props) { return <SharedCheckBtn color='var(--accent)' {...props} />; }
function InstructionBox(props) { return <SharedInstructionBox color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)' {...props} />; }

function saveEFState(id, state) { try { localStorage.setItem('pal-ef-' + id + '-v1', JSON.stringify(state)); } catch(e) {} }
function loadEFState(id) { try { var raw = localStorage.getItem('pal-ef-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; } }
function shuffleEF(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

export function Module_EF12({ onComplete }) {
  const _saved12 = useMemo(function() { return loadEFState('ef12'); }, []);
  const [showLift, setShowLift] = useState(_saved12 ? _saved12.showLift : false);
  const [answer, setAnswer] = useState(_saved12 ? _saved12.answer : null);
  const [revealed, setRevealed] = useState(_saved12 ? _saved12.revealed : false);

  useEffect(function() { saveEFState('ef12', { showLift: showLift, answer: answer, revealed: revealed }); }, [showLift, answer, revealed]);

  // Deterministic 28-day trajectory (no Math.random)
  var days = 28;
  var W = 460; var H = 145;
  var padL = 32; var padR = 16; var padT = 12; var padB = 26;
  var innerW = W - padL - padR; var innerH = H - padT - padB;
  var yMin = 98; var yMax = 118;

  function xOf(i) { return padL + (i / (days - 1)) * innerW; }
  function yOf(v) { return padT + innerH - ((v - yMin) / (yMax - yMin)) * innerH; }

  // Holdout: slow linear growth + gentle sine noise
  function holdoutVal(i) { return 100 + i * 0.28 + Math.sin(i * 0.9) * 0.4; }
  // Treated: faster growth + compounding
  function treatedVal(i) { return 100 + i * 0.58 + Math.sin(i * 0.7) * 0.3; }

  var holdoutPts = Array.from({ length: days }, function(_, i) { return holdoutVal(i); });
  var treatedPts = Array.from({ length: days }, function(_, i) { return treatedVal(i); });

  var holdoutPath = holdoutPts.map(function(v, i) { return (i === 0 ? 'M' : 'L') + ' ' + xOf(i) + ' ' + yOf(v); }).join(' ');
  var treatedPath = treatedPts.map(function(v, i) { return (i === 0 ? 'M' : 'L') + ' ' + xOf(i) + ' ' + yOf(v); }).join(' ');

  var holdoutEnd = holdoutVal(days - 1);
  var treatedEnd = treatedVal(days - 1);

  var mcqOptions = [
    { label: 'A. To control for novelty effects in individual A/B tests.', correct: false },
    { label: 'B. To measure the cumulative causal impact of an entire feature launch program.', correct: true },
    { label: 'C. To replace individual A/B tests when experiment traffic is limited.', correct: false },
    { label: 'D. To detect Hawthorne effects by permanently excluding some users.', correct: false },
  ];

  return (
    <div>
      {/* ── Causal chain prose ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          Your team ran forty experiments last year. Thirty-two showed positive results and were shipped. Your conversion rate improved, but by only 4% — much less than the sum of individual experiment lifts would have predicted. Each experiment showed a 0.5–2% lift. Summing them suggested the year should have produced roughly a 15% improvement. Where did the rest go?
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The answer is not that the experiments were wrong. It's that individual experiment lifts don't stack additively in the real world. Features interact. A personalization change and a notification change may each show a 2% lift independently, but when both are in production simultaneously, some of the same users respond to both, and the aggregate lift is less than 4%. Some features cannibalize each other's effect. Some novelty decays. Some gains from one experiment are offset by regressions in a metric the experiment wasn't designed to track.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          Standard experiments measure the marginal impact of one change, all else being equal. They cannot measure the cumulative impact of your entire portfolio of changes over time. Individual experiment lifts are measured in isolation — feature A's lift assumes B, C, and D are not present. When you ship all four, the interaction effects between them change the aggregate outcome. The sum of marginal effects is not the total effect.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          What you need is a group of users who experienced none of the changes — not just the most recent one, but all of them — against whom you can compare the fully-treated population. That comparison gives you the true cumulative causal impact of the entire launch program. This is a holdout group: a fixed percentage of users (typically 2–10%) excluded from all new features, all experiment treatments, and all product changes for an extended period — often six to twelve months. Comparing holdout to non-holdout gives you the cumulative treatment effect of everything shipped during the period.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginTop: '1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>If a team ships 30 experiments in a year, each showing a 1% lift in isolation, why might the actual cumulative effect be less than 30%? What specific mechanisms cause individual experiment lifts not to stack?</p>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, margin: '1rem 0' }}>
        Individual A/B tests answer one question: did this feature move the metric? But they cannot
        answer: are all our feature launches adding up to real business value? A holdout group answers
        the second question by keeping a small user slice permanently excluded from all new launches.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Try It: Study the holdout trajectory and spot the sum-of-parts paradox</div>

      <InstructionBox>
        Study the 28-day engagement trajectories below. Then click the button to see the sum-of-parts paradox.
      </InstructionBox>

      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>
          28-day engagement: holdout vs. fully treated
        </div>
        <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" style={{ display: 'block' }}>
          <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="var(--border)" strokeWidth="1" />
          <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="var(--border)" strokeWidth="1" />
          {[100, 105, 110, 115].map(function(v) {
            return <line key={v} x1={padL} y1={yOf(v)} x2={W - padR} y2={yOf(v)} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />;
          })}
          <path d={holdoutPath} fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="5 3" />
          <path d={treatedPath} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
          <line x1={xOf(days - 1)} y1={yOf(holdoutEnd)} x2={xOf(days - 1)} y2={yOf(treatedEnd)} stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="2 2" />
          <text x={xOf(days - 1) - 52} y={yOf(treatedEnd) - 5} fontSize="8" fill="var(--accent)" fontWeight="700">Treated</text>
          <text x={xOf(days - 1) - 52} y={yOf(holdoutEnd) + 13} fontSize="8" fill="var(--text-muted)">Holdout</text>
          <text x={padL - 3} y={yOf(100) + 4} textAnchor="end" fontSize="8" fill="var(--text-muted)">100</text>
          <text x={padL - 3} y={yOf(110) + 4} textAnchor="end" fontSize="8" fill="var(--text-muted)">110</text>
          <text x={xOf(0)} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">Day 1</text>
          <text x={xOf(days - 1)} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">Day 28</text>
        </svg>
      </div>

      <button
        onClick={function() { setShowLift(true); }}
        disabled={showLift}
        style={{
          padding: '0.5rem 1.1rem', marginBottom: '1rem',
          background: showLift ? 'var(--surface-2)' : 'var(--accent)',
          color: showLift ? 'var(--text-muted)' : '#fff',
          border: '1px solid ' + (showLift ? 'var(--border)' : 'var(--accent)'),
          borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.85rem',
          cursor: showLift ? 'default' : 'pointer',
        }}
      >
        Show sum-of-parts paradox
      </button>

      {showLift && (
        <div className="pal-reveal-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Sum of individual lifts</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.2rem' }}>+4.0%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Feature A +1.5%, B +0.8%, C +1.7%</div>
          </div>
          <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Holdout gap (28 days)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.2rem' }}>+11.2%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>True compound effect measured</div>
          </div>
        </div>
      )}

      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.85rem', marginTop: '0.5rem' }}>
        What is the primary purpose of a holdout group?
      </div>

      <InstructionBox>
        Select the answer that best captures why a holdout group is kept separate from all launches,
        then click Check. Think about what question the holdout gap answers that individual A/B tests
        cannot.
      </InstructionBox>

      {mcqOptions.map(function(opt, i) {
        return (
          <MCQOption
            key={i}
            label={opt.label}
            selected={answer === i}
            correct={opt.correct}
            revealed={revealed}
            onClick={function() { if (!revealed) setAnswer(i); }}
          />
        );
      })}

      {answer !== null && !revealed && <CheckBtn onClick={function() { setRevealed(true); }} />}

      {revealed && (
        <div className="pal-reveal-in">
          <div style={{
            marginTop: '0.5rem', padding: '0.65rem 0.85rem',
            background: mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-bg)' : 'var(--red-bg)',
            border: '1px solid ' + (mcqOptions[answer] && mcqOptions[answer].correct ? 'var(--teal-border)' : 'var(--red-border)'),
            borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
          }}>
            Individual A/B tests measure the impact of one change at a time — but they run in a world where other features are also shipping. A holdout group removes this confound entirely: the holdout trajectory shows what would have happened with no new launches, and the gap to the treated group measures the true cumulative effect of everything shipped.
          </div>

          {/* What you should have confirmed */}
          <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Individual experiment lifts are measured in the counterfactual where only that one change exists. When multiple changes coexist in production, they affect overlapping user behaviors. The same user can only convert once; the same session can only be engaged once. Interaction effects — both positive and negative — mean the cumulative result diverges from the sum of marginals. Holdouts measure the aggregate directly and bypass the estimation problem.</p>
          </div>

          {/* Analyst Move */}
          <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginTop: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> If your organization ships more than ten experiments per quarter, advocate for a long-term holdout group. Without it, the only way to measure cumulative impact is to sum individual experiment ledgers — which systematically overestimates or underestimates the true impact depending on interaction effects. This matters for annual planning, where teams need to justify roadmap investment against measured outcome.</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> Holdout groups degrade over time. Establish explicit rules at the start: which changes are exempt from the holdout (safety, compliance, infrastructure), and which are included. The cleaner the holdout protocol, the more interpretable the year-end comparison.</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> When reporting annual performance, present both the individual experiment ledger estimate and the holdout-measured estimate side by side. The gap between them is itself informative — a large positive gap suggests beneficial interaction effects; a large negative gap suggests cannibalization or novelty decay. Understanding the gap is more strategically valuable than either number alone.</p>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <InsightBox>
              The sum of individual experiment lifts (e.g. +4%) rarely equals the holdout gap (e.g. +11%) because features interact, compound, and change user behavior in ways individual tests cannot capture. Holdouts catch both positive compounding and negative interference between features.
            </InsightBox>
          </div>
        </div>
      )}
    </div>
  );
}
