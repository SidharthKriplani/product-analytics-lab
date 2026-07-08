import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';
import { loadRFState, saveRFState } from '../../../utils/rcaFoundationsState.js';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--teal)'} />; }

function shuffleArr(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

const SCENARIOS_RF14 = [
  {
    id: 0,
    context: 'Revenue is down 15% WoW. It decomposes as: Revenue = Users \xd7 CVR \xd7 AOV.',
    components: [
      { id: 'users', label: 'Users',                       change: '-2%',   dominant: false },
      { id: 'cvr',   label: 'CVR (conversion rate)',       change: '-1%',   dominant: false },
      { id: 'aov',   label: 'AOV (average order value)',   change: '-13%',  dominant: true  },
    ],
    branches: [
      { id: 'pricing',  label: 'Pricing or discount policy changes',          relevant: true  },
      { id: 'mix',      label: 'Product mix shift toward lower-priced items', relevant: true  },
      { id: 'bundles',  label: 'Upsell and bundle promotion changes',         relevant: true  },
      { id: 'paid',     label: 'Paid acquisition campaign performance',       relevant: false },
      { id: 'checkout', label: 'Checkout flow UX changes',                    relevant: false },
    ],
    pruneNote: 'Users and CVR are nearly flat — acquisition funnels, onboarding, and checkout UX are off the table entirely. Every investigation hour goes to the AOV branch.',
  },
  {
    id: 1,
    context: 'DAU is down 20% WoW. It decomposes as: DAU = New + Retained + Resurrected.',
    components: [
      { id: 'new',   label: 'New users',         change: '-2%',  dominant: false },
      { id: 'ret',   label: 'Retained users',    change: '-19%', dominant: true  },
      { id: 'resur', label: 'Resurrected users', change: '-3%',  dominant: false },
    ],
    branches: [
      { id: 'product',  label: 'Product quality regressions or feature removals', relevant: true  },
      { id: 'notif',    label: 'Push notification opt-in or delivery changes',     relevant: true  },
      { id: 'cohort',   label: 'D7/D30 retention cohort analysis',                 relevant: true  },
      { id: 'acqui',    label: 'Paid acquisition spend and channel mix',            relevant: false },
      { id: 'reengag',  label: 'Re-engagement campaign for lapsed users',           relevant: false },
    ],
    pruneNote: 'New users (-2%) and resurrected users (-3%) are noise. Acquisition and re-engagement branches are off the table. Focus entirely on why existing users stopped returning.',
  },
  {
    id: 2,
    context: 'Checkout CVR dropped 12%. It decomposes as: CVR = Visit-to-cart \xd7 Cart-to-checkout \xd7 Checkout-to-purchase.',
    components: [
      { id: 'vtc', label: 'Visit-to-cart rate',        change: '-0.5%',  dominant: false },
      { id: 'ctc', label: 'Cart-to-checkout rate',     change: '-0.3%',  dominant: false },
      { id: 'ctp', label: 'Checkout-to-purchase rate', change: '-11.5%', dominant: true  },
    ],
    branches: [
      { id: 'payment', label: 'Payment gateway errors or declined transactions',    relevant: true  },
      { id: 'ux',      label: 'Checkout UI or form changes',                        relevant: true  },
      { id: 'trust',   label: 'Trust signals, security badges, or promo code bugs', relevant: true  },
      { id: 'search',  label: 'Product search ranking changes',                     relevant: false },
      { id: 'pdp',     label: 'Product detail page or image quality changes',       relevant: false },
    ],
    pruneNote: 'Visit-to-cart and cart-to-checkout are nearly flat — discovery, browsing, and product experience branches are irrelevant. The break is at the final payment step.',
  },
];

export function Module_RF14({ onComplete }) {
  var _saved14 = useMemo(function() { return loadRFState('rf14'); }, []);
  var [scenarioIdx, setScenarioIdx] = useState(function() { return _saved14 && _saved14.scenarioIdx != null ? _saved14.scenarioIdx : 0; });
  var [leverSel, setLeverSel] = useState(function() { return _saved14 ? _saved14.leverSel : null; });
  var [leverRevealed, setLeverRevealed] = useState(function() { return _saved14 ? !!_saved14.leverRevealed : false; });
  var [branchSels, setBranchSels] = useState(function() { return new Set(_saved14 && _saved14.branchSels ? _saved14.branchSels : []); });
  var [branchRevealed, setBranchRevealed] = useState(function() { return _saved14 ? !!_saved14.branchRevealed : false; });
  var [allDone, setAllDone] = useState(function() { return _saved14 ? !!_saved14.allDone : false; });

  useEffect(function() {
    saveRFState('rf14', { scenarioIdx: scenarioIdx, leverSel: leverSel, leverRevealed: leverRevealed, branchSels: Array.from(branchSels), branchRevealed: branchRevealed, allDone: allDone });
  }, [scenarioIdx, leverSel, leverRevealed, branchSels, branchRevealed, allDone]);

  var scenario = SCENARIOS_RF14[scenarioIdx];

  function advanceScenario() {
    if (scenarioIdx < SCENARIOS_RF14.length - 1) {
      setScenarioIdx(scenarioIdx + 1);
      setLeverSel(null);
      setLeverRevealed(false);
      setBranchSels(new Set());
      setBranchRevealed(false);
    } else {
      setAllDone(true);
    }
  }

  function toggleBranch(id) {
    if (branchRevealed) return;
    setBranchSels(function(prev) {
      var n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* === CAUSAL CHAIN PROSE === */}
      <div style={sectionGap}>
        <p style={prose}>Revenue is down 8%. You build the metric tree: users, sessions per user, conversion rate, average order value. You measure each node. Users: down 2%. Sessions per user: flat. Conversion rate: down 7%. Average order value: down 1%. Now someone in the room says &quot;let&apos;s look at the acquisition funnel and the checkout UX and the pricing page.&quot; Three workstreams launched simultaneously, covering three nodes of the tree. Stop. Two of those three workstreams are irrelevant.</p>
        <p style={prose}>Users are down 2% and AOV is down 1%. These are small contributors — together they account for roughly 3 points of an 8-point decline. The arithmetic is clear: the dominant lever is conversion rate, which is down 7% and explains the bulk of the movement. The acquisition funnel (users) and pricing page (AOV) did not produce this drop. Investigating them is scattered effort that will produce findings unrelated to the incident.</p>
        <p style={prose}>The dominant lever is the component that explains the majority of the observed change. Once you identify it, every other component should be pruned from the active investigation. Pruned means: deprioritized, set aside, not investigated this week. The pruning criterion should be stated explicitly: we are investigating nodes whose contribution to the metric decline exceeds a meaningful threshold. Nodes below that threshold are set aside — and that decision is communicated clearly so the team doesn&apos;t re-open them individually.</p>
        <p style={prose}>The pruning is recursive. At every level of decomposition, identify the dominant lever and prune the rest. The investigation narrows at each level rather than expanding. An investigation that might have spawned eight workstreams runs as one. The time from alert to confirmed cause: three hours instead of twenty.</p>
      </div>

      {/* === HOLD THIS QUESTION BOX === */}
      <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>Revenue is down 8%. After decomposing, you find conversion rate is down 9% and average order value is up 4%. Users are flat. What is the dominant lever, and does the up-movement in AOV change whether you prune it from the investigation?</p>
      </div>

      {/* === TRY IT LABEL === */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
        Decomposing a metric tells you which component moved. The next step — the one most analysts skip — is to prune every investigation branch that is unrelated to that component. Scattered thinking is the primary failure mode of smart analysts.
      </p>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> For each scenario, first identify the dominant lever — the component that explains the drop. Then select only the investigation branches that are relevant to that lever.
      </div>

      {!allDone && (
        <div>
          {/* Progress indicator */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
            {SCENARIOS_RF14.map(function(s, i) {
              var isDone = i < scenarioIdx;
              var isCurrent = i === scenarioIdx;
              return (
                <div key={s.id} style={{ flex: 1, height: 4, borderRadius: 2, background: isDone ? 'var(--teal)' : isCurrent ? 'var(--teal-border)' : 'var(--border)' }} />
              );
            })}
          </div>

          {/* Scenario card */}
          <div style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
              Scenario {scenarioIdx + 1} of {SCENARIOS_RF14.length}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '0.9rem' }}>
              {scenario.context}
            </div>

            {/* Component table */}
            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                Component breakdown
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {scenario.components.map(function(c) {
                  var isSelected = leverSel === c.id;
                  var isCorrect = leverRevealed && c.dominant;
                  var isWrong = leverRevealed && isSelected && !c.dominant;
                  return (
                    <button
                      key={c.id}
                      onClick={function() { if (!leverRevealed) setLeverSel(c.id); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.55rem 0.85rem', textAlign: 'left', width: '100%', minHeight: 40, boxSizing: 'border-box',
                        background: isCorrect ? 'var(--teal-bg)' : isWrong ? 'var(--red-bg)' : isSelected ? 'var(--surface-raised)' : 'var(--surface)',
                        border: '1.5px solid ' + (isCorrect ? 'var(--teal-border)' : isWrong ? 'var(--red-border)' : isSelected ? 'var(--border-strong)' : 'var(--border)'),
                        borderRadius: 'var(--radius-sm)', cursor: leverRevealed ? 'default' : 'pointer', transition: 'all 0.1s',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.86rem', color: isCorrect ? 'var(--teal)' : isWrong ? 'var(--red)' : 'var(--text)', flex: 1 }}>{c.label}</span>
                      <span style={{
                        fontSize: '0.82rem', fontWeight: 700, minWidth: '3.5rem', textAlign: 'right',
                        color: isCorrect ? 'var(--teal)' : isWrong ? 'var(--red)' : 'var(--text-muted)',
                      }}>{c.change}</span>
                      {leverRevealed && c.dominant && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)' }}>DOMINANT</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {!leverRevealed && (
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Click the component that is the dominant lever — the one whose movement explains the drop.
                </div>
                {leverSel && (
                  <button onClick={function() { setLeverRevealed(true); }} style={{ padding: '0.45rem 1rem', minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                    Check lever
                  </button>
                )}
              </div>
            )}

            {leverRevealed && !branchRevealed && (
              <div>
                <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.8rem', marginBottom: '0.8rem', fontSize: '0.82rem', color: 'var(--teal)', lineHeight: 1.5 }}>
                  Correct. Now apply the pruning rule — select only the branches worth investigating given this dominant lever.
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  Which branches to investigate?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {scenario.branches.map(function(b) {
                    var isSel = branchSels.has(b.id);
                    return (
                      <button key={b.id} onClick={function() { toggleBranch(b.id); }} style={{
                        textAlign: 'left', padding: '0.55rem 0.8rem', width: '100%', minHeight: 40, boxSizing: 'border-box',
                        display: 'flex', alignItems: 'center',
                        background: isSel ? 'var(--accent-bg)' : 'var(--surface)',
                        border: '1.5px solid ' + (isSel ? 'var(--accent-border)' : 'var(--border)'),
                        borderRadius: 'var(--radius-sm)', color: isSel ? 'var(--accent)' : 'var(--text)',
                        fontSize: '0.84rem', cursor: 'pointer', fontWeight: isSel ? 600 : 400, transition: 'all 0.1s',
                      }}>{b.label}</button>
                    );
                  })}
                </div>
                {branchSels.size > 0 && (
                  <button onClick={function() { setBranchRevealed(true); }} style={{ padding: '0.45rem 1rem', minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                    Check branches
                  </button>
                )}
              </div>
            )}

            {branchRevealed && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {scenario.branches.map(function(b) {
                    var isSel = branchSels.has(b.id);
                    var isCorrect = b.relevant;
                    var bg = isCorrect ? 'var(--teal-bg)' : (isSel ? 'var(--red-bg)' : 'var(--surface)');
                    var border = isCorrect ? 'var(--teal-border)' : (isSel ? 'var(--red-border)' : 'var(--border)');
                    var color = isCorrect ? 'var(--teal)' : (isSel ? 'var(--red)' : 'var(--text-muted)');
                    return (
                      <div key={b.id} style={{ padding: '0.55rem 0.8rem', background: bg, border: '1.5px solid ' + border, borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', color: color, fontWeight: isCorrect ? 600 : 400, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{b.label}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{isCorrect ? 'Investigate' : 'Prune'}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55, fontStyle: 'italic', marginBottom: '0.85rem' }}>
                  {scenario.pruneNote}
                </div>
                <button onClick={advanceScenario} style={{ padding: '0.45rem 1.1rem', minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--teal)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}>
                  {scenarioIdx < SCENARIOS_RF14.length - 1 ? 'Next scenario →' : 'See summary →'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {allDone && (
        <div>
          {/* Pruning rule reference */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.65rem' }}>
              The pruning rule
            </div>
            {[
              { lever: 'AOV dropped', prune: 'Acquisition branches, onboarding branches, checkout friction' },
              { lever: 'CVR dropped', prune: 'Supply-side, pricing, product quality — focus on tech/UX/funnel' },
              { lever: 'New users dropped', prune: 'Retention branches, product quality, re-engagement' },
              { lever: 'Retained users dropped', prune: 'Acquisition, referral, re-engagement campaigns' },
              { lever: 'One funnel step failed', prune: 'All other funnel steps — investigate only the broken step' },
            ].map(function(row, i) {
              return (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.45rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--teal)', minWidth: '11rem', flexShrink: 0 }}>{row.lever}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Prune: {row.prune}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === WHAT YOU SHOULD HAVE CONFIRMED === */}
      {allDone && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>The dominant lever is conversion rate — it&apos;s the only node moving in the wrong direction by a material amount. AOV is up 4%, which is moving in the opposite direction from the revenue drop and is likely a consequence of the conversion change (lower-intent users who would have bought smaller items are the ones failing to convert, which mechanically increases the average order value of those who do complete). AOV should not be pruned from awareness — its upward movement is a diagnostic signal — but it should not be a separate investigation workstream. It&apos;s a consequence, not a cause.</p>
        </div>
      )}

      {/* === THE ANALYST MOVE === */}
      {allDone && (
        <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.85rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> After you measure all nodes in the metric tree, write the dominant lever explicitly on the whiteboard before opening any investigation workstream. &quot;We are investigating conversion rate. Users and AOV are set aside.&quot; Say this out loud in the meeting. Silence the workstreams that shouldn&apos;t start.</p>
            <p style={prose}><strong>Two.</strong> The most common form of investigation sprawl is treating all downward movements as equally suspicious. A 1% users decline and a 7% conversion decline are not equal clues. The arithmetic tells you where the impact is — trust the arithmetic over the instinct to be thorough.</p>
            <p style={prose}><strong>Three.</strong> Pruned doesn&apos;t mean never. After the dominant lever investigation closes and the fix is deployed, check whether the smaller nodes recovered proportionally. If users were down 2% before the fix and are still down 2% after the fix, users may have an independent cause that is now visible. The pruning is investigation-phase discipline, not permanent dismissal.</p>
          </div>
        </div>
      )}

      {/* === NEXT BUTTON === */}
      {allDone && <NextBtn onClick={onComplete} />}
    </div>
  );
}
