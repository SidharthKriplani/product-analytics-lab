import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';
import { loadRFState, saveRFState } from '../../../utils/rcaFoundationsState.js';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--teal)'} />; }

function shuffleArr(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

function MetricTree({ highlighted }) {
  const nodes = [
    { id: 'dau',   label: 'DAU', x: 200, y: 20,  w: 80,  color: 'var(--teal)',   desc: null },
    { id: 'new',   label: 'New users', x: 60,  y: 100, w: 100, color: 'var(--teal)',   desc: '= New installs × Activation rate' },
    { id: 'ret',   label: 'Retained', x: 190, y: 100, w: 100, color: 'var(--accent)', desc: '= Day-N users × Retention rate' },
    { id: 'res',   label: 'Resurrected', x: 320, y: 100, w: 110, color: 'var(--purple)', desc: '= Lapsed users × Re-engagement rate' },
    { id: 'inst',  label: 'Installs', x: 20,  y: 190, w: 80,  color: 'var(--teal)',   desc: 'App store + referral + paid' },
    { id: 'activ', label: 'Activation %', x: 110, y: 190, w: 95,  color: 'var(--teal)',   desc: 'Users who complete onboarding' },
    { id: 'dayn',  label: 'Day-N users', x: 175, y: 190, w: 95,  color: 'var(--accent)', desc: 'Cohort that reached Day-N' },
    { id: 'retpct',label: 'Retention %', x: 280, y: 190, w: 90,  color: 'var(--accent)', desc: 'Rate of returning after Day-N' },
  ];

  const edges = [
    ['dau', 'new'], ['dau', 'ret'], ['dau', 'res'],
    ['new', 'inst'], ['new', 'activ'],
    ['ret', 'dayn'], ['ret', 'retpct'],
  ];

  const H = 250;
  const nodeH = 28;

  function cx(n) { return n.x + n.w / 2; }

  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  return (
    <svg viewBox={'0 0 420 ' + H} style={{ width: '100%', display: 'block', overflow: 'visible' }}>
      {/* Edges */}
      {edges.map(([from, to]) => {
        const fn = nodeMap[from];
        const tn = nodeMap[to];
        const x1 = cx(fn); const y1 = fn.y + nodeH;
        const x2 = cx(tn); const y2 = tn.y;
        const my = (y1 + y2) / 2;
        return (
          <path
            key={from + '-' + to}
            d={'M ' + x1 + ' ' + y1 + ' C ' + x1 + ' ' + my + ' ' + x2 + ' ' + my + ' ' + x2 + ' ' + y2}
            fill="none"
            stroke={highlighted === tn.id ? tn.color : 'var(--border-strong)'}
            strokeWidth={highlighted === tn.id ? 2 : 1.5}
            strokeDasharray={highlighted === tn.id ? 'none' : '4,2'}
            opacity={highlighted && highlighted !== tn.id && highlighted !== fn.id ? 0.3 : 1}
          />
        );
      })}
      {/* Nodes */}
      {nodes.map(n => {
        const isHL = highlighted === n.id;
        const isDim = highlighted && !isHL && n.id !== 'dau';
        return (
          <g key={n.id} opacity={isDim ? 0.3 : 1}>
            <rect
              x={n.x} y={n.y} width={n.w} height={nodeH} rx={5}
              fill={isHL ? n.color : 'var(--surface-2)'}
              stroke={isHL ? n.color : 'var(--border)'}
              strokeWidth={isHL ? 2 : 1}
            />
            <text
              x={n.x + n.w / 2} y={n.y + nodeH / 2 + 4}
              textAnchor="middle"
              fontSize="10"
              fontWeight={isHL ? '700' : '400'}
              fill={isHL ? '#fff' : 'var(--text-secondary)'}
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const RF07_QUESTIONS = [
  {
    id: 'q1',
    prompt: 'DAU fell 15%. Your metric tree shows: New users -2%, Retained users -18%, Resurrected users -5%. Where do you focus first?',
    options: [
      'New users — a new-user drop compounds over time as each cohort feeds future retained users',
      'Retained users — the largest absolute contributor to the drop',
      'Resurrected users — their -5% drop has the highest relative severity compared to their small base, so fixing it yields the highest marginal ROI',
      'New users first — they are the leading indicator; retained user drops are a lagging consequence of earlier acquisition weakness',
    ],
    correct: 'Retained users — the largest absolute contributor to the drop',
    explanation: 'Retained users make up the bulk of DAU at any mature product. An 18% drop in that branch dwarfs the 2% new-user fall in absolute terms. Option A (new users compound) is true in theory but misleading in triage — compounding effects matter over weeks, not for the immediate drop. Option C (resurrected users have highest relative severity) confuses relative percentage drop with absolute contribution — a 5% drop on a small segment moves fewer users than an 18% drop on the largest segment. Option D (new users as leading indicator) sounds analytical but reverses the priority — you investigate the largest current contributor first, then trace upstream causes.',
  },
  {
    id: 'q2',
    prompt: 'Retained users = Day-N users x Retention rate. Retention rate held completely flat. What does that tell you?',
    options: [
      'Retention rate is the core health signal — if it held flat, the product experience is working and the drop is in acquisition channels upstream',
      'The issue is in the denominator — fewer users reached Day-N, meaning the new-user cohort from N days ago was smaller or lower quality',
      'The numerator (active retained users) must have dropped independently — flat retention rate can mask a real product regression if the denominator also shrank proportionally',
      'Flat retention rate means the drop is evenly distributed across all user segments, so segmentation will not help narrow the cause',
    ],
    correct: 'The issue is in the denominator — fewer users reached Day-N, meaning the new-user cohort from N days ago was smaller or lower quality',
    explanation: 'If Retained users = Day-N users x Retention rate, and Retention rate is flat, then the only explanation is that Day-N users fell. Option A jumps to the right conclusion (acquisition) but for the wrong reason — flat retention does not mean "the product is fine," it means the product experience held constant while the input population shrank. Option C confuses the math — if retention rate is flat and the total dropped, the numerator and denominator both dropped proportionally, meaning the root issue is the denominator (Day-N users), not an independent numerator drop. Option D contradicts the premise — if retention rate held flat, numerator and denominator moved together, not independently in offsetting directions.',
  },
  {
    id: 'q3',
    prompt: 'Which of the following would NOT appear in a DAU metric tree?',
    options: [
      'Day-7 retention rate',
      'New installs converting to activated users',
      'Revenue per user',
      'Churned user re-activation rate',
    ],
    correct: 'Revenue per user',
    explanation: 'Revenue per user belongs in a revenue tree, not a DAU tree. DAU = New users + Retained users + Resurrected users, decomposed further by activation, retention, and re-engagement rates. Revenue is a separate dimension. A common interview mistake is conflating engagement trees with monetization trees.',
  },
];

const RF07_HIGHLIGHT = { q1: 'ret', q2: 'dayn', q3: null };

export function Module_RF07({ onComplete }) {
  const _saved07 = useMemo(function() { return loadRFState('rf07'); }, []);
  const [qIdx, setQIdx] = useState(function() { return _saved07 && _saved07.qIdx != null ? _saved07.qIdx : 0; });
  const [selections, setSelections] = useState(function() { return _saved07 && _saved07.selections ? _saved07.selections : {}; });
  const [revealed, setRevealed] = useState(function() { return _saved07 && _saved07.revealed ? _saved07.revealed : {}; });

  useEffect(function() { saveRFState('rf07', { qIdx: qIdx, selections: selections, revealed: revealed }); }, [qIdx, selections, revealed]);

  const currentQ = RF07_QUESTIONS[qIdx];
  const currentSelected = selections[currentQ.id] || null;
  const currentRevealed = revealed[currentQ.id] || false;
  const allDone = qIdx >= RF07_QUESTIONS.length - 1 && currentRevealed;
  const highlightNode = RF07_HIGHLIGHT[currentQ.id] || null;

  function handleSelect(opt) {
    if (!currentRevealed) {
      setSelections(function(prev) {
        const next = Object.assign({}, prev);
        next[currentQ.id] = opt;
        return next;
      });
    }
  }

  function handleCheck() {
    if (currentSelected !== null) {
      setRevealed(function(prev) {
        const next = Object.assign({}, prev);
        next[currentQ.id] = true;
        return next;
      });
    }
  }

  function handleNext() {
    if (qIdx < RF07_QUESTIONS.length - 1) setQIdx(qIdx + 1);
  }

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* === CAUSAL CHAIN PROSE === */}
      <div style={sectionGap}>
        <p style={prose}>
          Revenue is down 8% and three people in the room have three different theories. The head of product thinks it&apos;s conversion rate — the new checkout flow degraded. The head of growth thinks it&apos;s new user acquisition — the paid channels are underperforming. Finance thinks it&apos;s average order value — the discount campaign is pulling it down. All three hypotheses are plausible. All three are guesses. Without a shared analytical structure, the meeting becomes a debate between people with different instincts rather than a systematic investigation.
        </p>
        <p style={prose}>
          A metric tree ends this debate before it starts. Revenue is not a single thing. It&apos;s the product of multiple constituent quantities: Revenue = Users × Sessions per User × Orders per Session × Average Order Value. This is not a model or an approximation — it&apos;s a mathematical identity. The tree does not tell you which node dropped. It tells you which nodes to measure. Once you&apos;ve measured each node across the time period of interest, the arithmetic shows you which ones changed and by how much.
        </p>
        <p style={prose}>
          The naive approach is to build the tree after the hypothesis. But if you let your prior hypothesis determine the structure, you build a tree that confirms the hypothesis — and miss the node that actually moved. The tree must be constructed from the mathematical identity of the metric, not from what you think happened. If conversion is in the tree because the math requires it, and conversion turns out to be flat, that&apos;s evidence that rules out the hypothesis.
        </p>
        <p style={prose}>
          A drop can also live in more than one node. A single deploy can simultaneously depress conversion rate and reduce average session length. Don&apos;t assume the tree has one broken branch — the initial query is which branches moved, and more than one can be the answer. The tree didn&apos;t give you the answer. It gave you the structure to find it.
        </p>
      </div>

      {/* === HOLD THIS QUESTION BOX === */}
      <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>You build a metric tree for Revenue = Users × Conversion Rate × AOV. Revenue is down 10%. Conversion rate is down 15%. Users are up 8%. What does that imply about AOV before you query it?</p>
      </div>

      {/* === TRY IT LABEL === */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* === INTERACTIVE JSX === */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
          A metric tree makes RCA exhaustive — every drop lives in exactly one branch. The tree below is live: the highlighted node shows which branch each question is about. Answer each question, then advance.
        </p>

        {/* Live SVG tree */}
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
            DAU metric tree — highlighted node is the focus of the current question
          </div>
          <MetricTree highlighted={highlightNode} />
          {highlightNode && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {highlightNode === 'ret' && 'Current focus: Retained users branch'}
              {highlightNode === 'dayn' && 'Current focus: Day-N users (the denominator of the Retained branch)'}
            </div>
          )}
        </div>

        {/* Question card */}
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.1rem' }}>
          <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
            <strong>What to do:</strong> Read the tree, then select the best answer — advance through all three questions before completing.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Question {qIdx + 1} of {RF07_QUESTIONS.length}
            </div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {RF07_QUESTIONS.map(function(_q, i) {
                return (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: i < qIdx || (i === qIdx && currentRevealed) ? 'var(--teal)' : i === qIdx ? 'var(--teal-border)' : 'var(--border)',
                  }} />
                );
              })}
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
            {currentQ.prompt}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.75rem' }}>
            {currentQ.options.map(function(opt) {
              return (
                <MCQOption
                  key={opt}
                  label={opt}
                  selected={currentSelected === opt}
                  correct={opt === currentQ.correct}
                  revealed={currentRevealed}
                  onClick={function() { handleSelect(opt); }}
                />
              );
            })}
          </div>

          {!currentRevealed && (
            <button
              onClick={handleCheck}
              disabled={currentSelected === null}
              style={{
                padding: '0.5rem 1.1rem', borderRadius: 'var(--radius-sm)', border: 'none',
                background: currentSelected !== null ? 'var(--teal)' : 'var(--border)',
                color: currentSelected !== null ? '#fff' : 'var(--text-muted)',
                fontWeight: 700, fontSize: '0.85rem',
                cursor: currentSelected !== null ? 'pointer' : 'default',
              }}
            >Check answer</button>
          )}

          {currentRevealed && (
            <div style={{
              marginTop: '0.75rem',
              background: currentSelected === currentQ.correct ? 'var(--teal-bg)' : 'var(--red-bg)',
              border: '1px solid ' + (currentSelected === currentQ.correct ? 'var(--teal-border)' : 'var(--red-border)'),
              borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
              fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55,
            }}>
              <strong>{currentSelected === currentQ.correct ? 'Correct. ' : 'Not quite. '}</strong>{currentQ.explanation}
            </div>
          )}

          {currentRevealed && qIdx < RF07_QUESTIONS.length - 1 && (
            <button
              onClick={handleNext}
              style={{
                marginTop: '0.85rem', padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-sm)', border: 'none',
                background: 'var(--teal)', color: '#fff',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              }}
            >Next question →</button>
          )}
        </div>
      </div>

      {/* === WHAT YOU SHOULD HAVE CONFIRMED === */}
      {allDone && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>The arithmetic closes approximately if AOV is up ~1%. Revenue = Users × CVR × AOV → 0.90 = 1.08 × 0.85 × AOV → AOV ≈ 0.98. Nearly flat. So the primary driver is conversion rate, users are actually helping, and AOV is essentially not the problem. You&apos;ve isolated the node before running a single additional query. The tree makes implied values computable — and computable means testable.</p>
        </div>
      )}

      {/* === THE ANALYST MOVE === */}
      {allDone && (
        <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.85rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Build the metric tree before the investigation, not during it. The tree is derived from the metric&apos;s mathematical structure — that structure doesn&apos;t depend on what happened. Having a pre-built tree means that when an alert fires, you&apos;re measuring nodes, not arguing about what the structure should be.</p>
            <p style={prose}><strong>Two.</strong> The tree is a communication tool as much as a diagnostic one. Presenting a tree in the investigation call gives everyone a shared reference. Disagreements about cause become disagreements about which node to query first — a productive, resolvable disagreement rather than a debate between instincts.</p>
            <p style={prose}><strong>Three.</strong> Check that your tree&apos;s arithmetic closes. If you multiply all the nodes and don&apos;t get back to the original metric, the factorization is wrong. A wrong factorization means the nodes are not truly separable — one is implicitly including another. This is worth the five-minute algebra check before the investigation starts.</p>
          </div>
        </div>
      )}

      {/* === NEXT BUTTON === */}
      {allDone && <NextBtn onClick={onComplete} />}
    </div>
  );
}
