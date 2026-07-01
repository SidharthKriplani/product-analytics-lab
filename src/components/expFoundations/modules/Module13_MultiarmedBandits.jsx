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

export function Module_EF13({ onComplete }) {
  const _saved13 = useMemo(function() { return loadEFState('ef13'); }, []);
  const [round, setRound] = useState(_saved13 ? _saved13.round : 0);
  const [answer, setAnswer] = useState(_saved13 ? _saved13.answer : null);
  const [revealed, setRevealed] = useState(_saved13 ? _saved13.revealed : false);

  useEffect(function() { saveEFState('ef13', { round: round, answer: answer, revealed: revealed }); }, [round, answer, revealed]);

  // Pre-computed epsilon-greedy allocation after each round (deterministic)
  // 3 variants: A, B, C. B is the winner. Starts equal, converges toward B.
  var allRounds = [
    [33, 34, 33],   // round 0 (start)
    [30, 42, 28],   // round 1
    [25, 52, 23],   // round 2
    [20, 61, 19],   // round 3
    [16, 69, 15],   // round 4
    [13, 76, 11],   // round 5 (converged)
  ];

  var BAR_W = 420; var BAR_H = 110;

  var variantColors = ['var(--text-muted)', 'var(--accent)', 'var(--teal)'];
  var variantNames = ['Variant A', 'Variant B', 'Variant C'];
  var current = allRounds[round];
  var maxAlloc = 100;
  var barH = 28;
  var barGap = 10;
  var labelW = 78;

  var mcqOptions = [
    { label: 'A. When you need a statistically clean causal estimate of the treatment effect.', correct: false },
    { label: 'B. When you have unlimited experiment duration and traffic.', correct: false },
    { label: 'C. When the cost of showing users a losing variant during the experiment is high and you can tolerate less statistical precision.', correct: true },
    { label: 'D. When your metric has high variance and low coefficient of variation.', correct: false },
  ];

  return (
    <div>
      {/* ── Causal chain prose ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          You're testing five button copy variants for a pricing page upgrade CTA. Your power calculation says you need six weeks at standard A/B split (20% each) to reach significance. Three of the five variants are performing clearly worse from the very first week. You're continuing to show clearly inferior copy to 60% of your users for five more weeks in order to satisfy a statistical requirement.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          Standard A/B tests fix the traffic split for the duration of the experiment. This maximizes measurement quality — you accumulate data on all variants at a predetermined rate, which gives the cleanest statistical inference. But it also means you pay the full opportunity cost of the inferior variants for the entire experiment duration. Early stopping without a pre-specified stopping rule inflates false positive rates. And "looks clearly better" is not a statistical criterion — it's a feeling.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          What you actually need is a framework that does two things simultaneously: shifts traffic toward better-performing variants as evidence accumulates, and does so in a principled way that doesn't abandon exploration entirely. This is the explore-exploit tradeoff. Bandit algorithms formalize it. Epsilon-greedy assigns a random variant with probability ε (exploration) and the current best with probability 1 − ε (exploitation). Thompson sampling maintains a probability distribution over each variant's true performance and assigns probabilistically based on current uncertainty — as evidence accumulates, the winner's distribution narrows and it gets assigned more often.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' }}>
          The fundamental tradeoff: bandits minimize the opportunity cost of running losers during the experiment. But they sacrifice inference quality. Traffic concentrates on apparent winners, leaving losers with small samples — which means you can't estimate their performance as precisely, and you can't run a clean hypothesis test at the end. Bandits are optimization engines, not measurement devices. Use them when minimizing opportunity cost is the primary objective. Use fixed A/B when you need a precise causal estimate.
        </p>
      </div>

      {/* ── Hold this question ── */}
      <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginTop: '1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hold this question</span>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>If Thompson sampling concentrates traffic on the apparent winner as evidence accumulates, why might this actually make it harder to determine which variant truly won? What property of good statistical inference does traffic concentration undermine?</p>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, margin: '1rem 0' }}>
        A fixed A/B test splits traffic equally and waits — it optimizes for measurement. A multi-armed
        bandit shifts traffic toward better-performing variants in real time — it optimizes for reward
        during the experiment. The tradeoff is statistical precision vs. opportunity cost.
      </p>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Try It: Run the epsilon-greedy bandit and watch traffic allocation shift</div>

      <InstructionBox>
        Click &quot;Run round&quot; to advance the epsilon-greedy bandit. Watch how traffic allocation shifts toward Variant B as the algorithm learns it performs best.
      </InstructionBox>

      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>
          Traffic allocation — Round {round} {round === allRounds.length - 1 ? '(converged)' : ''}
        </div>
        <svg viewBox={'0 0 ' + BAR_W + ' ' + BAR_H} width="100%" style={{ display: 'block' }}>
          {variantNames.map(function(name, vi) {
            var pct = current[vi];
            var y = vi * (barH + barGap);
            var bw = ((pct / maxAlloc) * (BAR_W - labelW - 60));
            return (
              <g key={vi}>
                <text x="0" y={y + barH / 2 + 5} fontSize="11" fill="var(--text-muted)" fontWeight="600">{name}</text>
                <rect x={labelW} y={y} width={bw} height={barH} rx="4" fill={variantColors[vi]} opacity={vi === 1 ? '1' : '0.5'} style={{ transition: 'width 0.4s ease' }} />
                <text x={labelW + bw + 6} y={y + barH / 2 + 5} fontSize="11" fill={variantColors[vi]} fontWeight="700">{pct}%</text>
              </g>
            );
          })}
        </svg>

        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={function() { if (round < allRounds.length - 1) setRound(function(r) { return r + 1; }); }}
            disabled={round >= allRounds.length - 1}
            style={{
              padding: '0.45rem 1rem',
              background: round >= allRounds.length - 1 ? 'var(--surface)' : 'var(--accent)',
              color: round >= allRounds.length - 1 ? 'var(--text-muted)' : '#fff',
              border: '1px solid ' + (round >= allRounds.length - 1 ? 'var(--border)' : 'var(--accent)'),
              borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.82rem',
              cursor: round >= allRounds.length - 1 ? 'default' : 'pointer',
            }}
          >
            Run round
          </button>
          {round > 0 && (
            <button onClick={function() { setRound(0); }} style={{ padding: '0.45rem 0.9rem', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Reset
            </button>
          )}
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {round === 0 ? 'Equal split — no learning yet' : round < allRounds.length - 1 ? 'Learning in progress...' : 'Converged — most traffic now goes to the winner'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { title: 'A/B test advantage', items: ['Clean causal estimate', 'Known false positive rate', 'Unbiased treatment effect'] },
          { title: 'Bandit advantage', items: ['Lower regret during experiment', 'Adapts as user behavior shifts', 'Good for short-lived promotions'] },
        ].map(function(card) {
          return (
            <div key={card.title} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{card.title}</div>
              {card.items.map(function(item, i) {
                return <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.5, marginBottom: '0.2rem' }}>{item}</div>;
              })}
            </div>
          );
        })}
      </div>

      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.85rem' }}>
        When does a multi-armed bandit outperform a fixed A/B test?
      </div>

      <InstructionBox>
        Select the scenario where a bandit is the better choice, then click Check. Use the tradeoff
        table above — focus on when the cost of showing users a losing variant outweighs the need for
        a clean causal estimate.
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
            Bandits shine when the regret of showing users a losing variant during the experiment is costly — short promotions, high-stakes UX, or volatile conditions. The price is that traffic imbalance makes causal inference noisy. If you need a clean statistical estimate for a product decision that compounds over time, a fixed A/B test is almost always the right choice.
          </div>

          {/* What you should have confirmed */}
          <div className="pal-reveal-in" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you should have confirmed</span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Traffic concentration on the winner means the losers accumulate small samples. With small samples, the estimates of loser performance are noisy — you can't be confident whether loser B truly underperformed or just had an unlucky early run. This is why bandits are optimization engines but poor measurement devices. If you need to know the true effect of each variant, a fixed A/B gives more reliable estimates.</p>
          </div>

          {/* Analyst Move */}
          <div style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginTop: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>The Analyst Move</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>One.</strong> Before choosing a bandit over a fixed A/B test, answer two questions explicitly: (1) Is minimizing the opportunity cost of losers the primary objective, or is getting a precise causal estimate? (2) How many variants are there? Bandits are most compelling with many variants and high opportunity costs. For two-variant tests where the primary goal is a causal estimate, a fixed A/B is almost always better.</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Two.</strong> Bandits do not eliminate the need for a stopping rule. Thompson sampling will eventually converge, but "looks like it converged" is not a stopping criterion. Set a maximum runtime or a minimum traffic threshold for the leading variant before the experiment starts, and hold to it. Otherwise you're peeking under a different name.</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.86rem' }}><strong style={{ color: 'var(--text)' }}>Three.</strong> Never use a bandit result as if it were a fixed A/B result. The effect size estimate from a bandit is biased — the winner was shown to more users because it looked good early, which may have been partly noise. Report bandit outcomes as "deployed variant" decisions, not as causal effect estimates. If you need the causal estimate, follow up with a two-arm fixed A/B test comparing the bandit winner against control.</p>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <InsightBox>
              The explore-exploit tradeoff is the core concept: exploration (equal traffic) maximizes information quality; exploitation (shift to winner) minimizes opportunity cost. Bandits find the middle ground dynamically, but they never fully solve either goal — interviewers test this distinction at senior PM and DS levels.
            </InsightBox>
          </div>
        </div>
      )}
    </div>
  );
}
