import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';
import { loadRFState, saveRFState } from '../../../utils/rcaFoundationsState.js';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--teal)'} />; }

function shuffleArr(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

const ITEMS_RF01 = [
  { text: 'Event logging stopped firing on iOS 17.2', layer: 'dq' },
  { text: 'Christmas week — all consumer apps see a traffic spike', layer: 'ext' },
  { text: 'Pushed a nav redesign that buried the share button', layer: 'prod' },
  { text: 'New paid-acquisition cohort has lower baseline engagement', layer: 'beh' },
  { text: 'Data warehouse pipeline had a 6-hour backfill delay', layer: 'dq' },
  { text: 'Competitor launched a free tier matching our core feature set', layer: 'ext' },
];

export function Module_RF01({ onComplete }) {
  const LAYERS = [
    {
      id: 'dq', label: 'Data Quality', num: 1,
      desc: 'Did tracking or a pipeline change? Is this a real signal?',
      why: 'Cheapest to rule out — check pipeline logs, SDK version, event counts by platform. Takes 10 minutes. The most common false alarm.',
      time: '~10 min', color: 'var(--red)', timeBg: 'var(--red-bg)', timeBorder: 'var(--red-border)',
    },
    {
      id: 'ext', label: 'External / Seasonal', num: 2,
      desc: 'Holiday? Competitor launch? Platform outage? Day-of-week?',
      why: 'Free data — calendars, public announcements, app store changelogs. Rules out an entire class of causes without touching any internal system.',
      time: '~30 min', color: 'var(--yellow)', timeBg: 'var(--yellow-bg)', timeBorder: 'var(--yellow-border)',
    },
    {
      id: 'prod', label: 'Product Change', num: 3,
      desc: 'Did we ship something? A/B test? Infra change? Ranking algorithm?',
      why: 'Deployment logs and experiment records are internal — queryable but require cross-team coordination. More investigative.',
      time: '1–2 h', color: 'var(--accent)', timeBg: 'var(--accent-bg)', timeBorder: 'var(--accent-border)',
    },
    {
      id: 'beh', label: 'User Behaviour Shift', num: 4,
      desc: 'Cohort mix change? Organic behaviour evolution? Market saturation?',
      why: 'Hardest to confirm. Requires longitudinal cohort analysis and external benchmarks. Takes days to weeks to establish confidently.',
      time: 'Days–weeks', color: 'var(--purple)', timeBg: 'var(--purple-bg)', timeBorder: 'var(--purple-border)',
    },
  ];

  const _saved01 = useMemo(function() { return loadRFState('rf01'); }, []);
  const [items01] = useState(function() { return _saved01 && _saved01.items ? _saved01.items : shuffleArr(ITEMS_RF01); });
  const [assignments, setAssignments] = useState(function() { return _saved01 && _saved01.assignments ? _saved01.assignments : {}; });
  const [revealed, setRevealed] = useState(function() { return _saved01 ? !!_saved01.revealed : false; });
  const [expanded, setExpanded] = useState(null);

  useEffect(function() { saveRFState('rf01', { items: items01, assignments: assignments, revealed: revealed }); }, [items01, assignments, revealed]);

  function assign(itemIdx, layerId) {
    if (revealed) return;
    setAssignments(prev => ({ ...prev, [itemIdx]: layerId }));
  }

  const allAssigned = items01.every((_, i) => assignments[i]);
  const correctCount = items01.filter((item, i) => assignments[i] === item.layer).length;

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* === CAUSAL CHAIN PROSE === */}
      <div style={sectionGap}>
        <p style={prose}>
          Your PM pings you at 9 AM: DAU dropped 18% overnight. Leadership standup is in two hours. The room is already speculating — someone thinks it&apos;s the new onboarding flow, someone else blames the Android build, a third person is pulling marketing spend data. Twenty minutes in, three separate Slack threads have started and nobody has agreed on what to look at first.
        </p>
        <p style={prose}>
          This is the default failure mode of every metric drop investigation. The problem isn&apos;t effort. Everyone is working hard. The problem is that without a shared investigation structure, the team runs parallel guessing loops — and the ones that get louder or find something suggestive first win the narrative, regardless of whether they found the actual cause.
        </p>
        <p style={prose}>
          A metric can drop for many reasons. Tracking broke. An external event shifted behavior. A product change degraded experience. User composition shifted. These don&apos;t all live in the same place, and they don&apos;t all have the same fix. Jumping to any one of them without a structure is guessing — and a lucky guess is indistinguishable from a wrong guess until it&apos;s too late to matter.
        </p>
        <p style={prose}>
          What you actually need is a decision procedure that tells you where to look first without requiring you to guess. That procedure exists, and its logic is forced by one observation: different categories of cause are differently costly to rule out. A data pipeline failure takes five minutes to check. A product regression takes two hours of bisection. Given that, the only rational sequence is cheapest-to-rule-out first — data quality, then external and seasonal factors, then product changes, then user behavior shifts.
        </p>
      </div>

      {/* === HOLD THIS QUESTION BOX === */}
      <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>An alert fires showing checkout events down 35% in the last four hours. Before you touch anything else, what is the first question you ask — and what does the answer tell you about which layer to investigate?</p>
      </div>

      {/* === TRY IT LABEL === */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      {/* === INTERACTIVE JSX === */}
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          RCA — Root Cause Analysis — is how analysts answer the question: &quot;Our key metric dropped. Why?&quot; It is the most common ambiguity problem in product analytics interviews and one of the highest-leverage skills in a working analyst&apos;s toolkit. Every metric movement belongs to one of four diagnostic layers. The order is not arbitrary — it is sorted by investigation cost and frequency of false alarms. Data quality is the most common false alarm and takes 10 minutes to rule out. User behaviour shifts can take weeks. Work top-to-bottom, always.
        </p>

        {/* Visual ordered framework */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.65rem' }}>
            The four-layer investigation sequence — click any layer to expand
          </div>
          {LAYERS.map((layer, i) => {
            const isOpen = expanded === layer.id;
            return (
              <div key={layer.id}>
                <div
                  onClick={() => setExpanded(isOpen ? null : layer.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.7rem 1rem',
                    background: isOpen ? 'var(--surface-raised)' : 'var(--surface-2)',
                    border: '1.5px solid ' + (isOpen ? layer.color : 'var(--border)'),
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer', transition: 'all 0.15s',
                    userSelect: 'none',
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: layer.color, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: '#fff',
                  }}>
                    {layer.num}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: layer.color }}>{layer.label}</span>
                      <span style={{
                        fontSize: '0.67rem', fontWeight: 700, padding: '0.1rem 0.4rem',
                        borderRadius: 3, background: layer.timeBg,
                        border: '1px solid ' + layer.timeBorder, color: layer.color,
                      }}>
                        {layer.time}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginTop: '0.15rem' }}>
                      {layer.desc}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
                </div>
                {isOpen && (
                  <div style={{
                    padding: '0.7rem 1rem 0.7rem 3.25rem',
                    background: 'var(--surface-2)',
                    borderLeft: '1.5px solid ' + layer.color,
                    borderRight: '1.5px solid ' + layer.color,
                    borderBottom: '1.5px solid ' + layer.color,
                    borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
                    marginTop: -2,
                    fontSize: '0.81rem', color: 'var(--text-secondary)', lineHeight: 1.55,
                    fontStyle: 'italic',
                  }}>
                    {layer.why}
                  </div>
                )}
                {i < LAYERS.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '1.15rem', padding: '0.15rem 0 0.15rem 1.15rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>↓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Instruction */}
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: '0.84rem', color: 'var(--teal)', lineHeight: 1.5 }}>
          <strong>What to do:</strong> For each signal below, pick the layer that best explains it. Assign all six, then check.
        </div>

        {/* Item list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          {items01.map((item, i) => {
            const asgn = assignments[i];
            const aLayer = LAYERS.find(l => l.id === asgn);
            const isCorrect = revealed && asgn === item.layer;
            const isWrong = revealed && asgn && asgn !== item.layer;
            const correctLayer = LAYERS.find(l => l.id === item.layer);
            return (
              <div key={i} style={{
                padding: '0.65rem 0.9rem',
                background: isCorrect ? 'var(--teal-bg)' : isWrong ? 'var(--red-bg)' : asgn ? 'var(--surface-raised)' : 'var(--surface-2)',
                border: '1.5px solid ' + (isCorrect ? 'var(--teal-border)' : isWrong ? 'var(--red-border)' : asgn ? 'var(--border-strong)' : 'var(--border)'),
                borderRadius: 'var(--radius-sm)', transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: '0.85rem', color: isCorrect ? 'var(--teal)' : isWrong ? 'var(--red)' : 'var(--text)', lineHeight: 1.5, marginBottom: asgn || !revealed ? '0.4rem' : 0 }}>
                  {item.text}
                </div>
                {!revealed && (
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {LAYERS.map(layer => (
                      <button key={layer.id} onClick={() => assign(i, layer.id)} style={{
                        fontSize: '0.72rem', padding: '0.2rem 0.55rem', minHeight: 40, minWidth: 40,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        background: asgn === layer.id ? layer.color : 'var(--surface)',
                        border: '1px solid ' + (asgn === layer.id ? layer.color : 'var(--border)'),
                        borderRadius: 3, color: asgn === layer.id ? '#fff' : 'var(--text-muted)',
                        cursor: 'pointer', fontWeight: asgn === layer.id ? 700 : 400, transition: 'all 0.1s',
                      }}>
                        {layer.label}
                      </button>
                    ))}
                  </div>
                )}
                {revealed && (
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isCorrect ? 'var(--teal)' : 'var(--red)' }}>
                    {isCorrect
                      ? <>{aLayer.label} <Icon name='check' size={12} color='currentColor' /></>
                      : 'Correct: ' + correctLayer.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!revealed && allAssigned && (
          <button onClick={() => setRevealed(true)} style={{
            padding: '0.55rem 1.2rem', minHeight: 40, background: 'var(--teal)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.88rem', cursor: 'pointer',
          }}>
            Check answers
          </button>
        )}

        {revealed && (
          <div>
            <div style={{
              padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginTop: '0.75rem', marginBottom: '1.25rem',
              background: correctCount === items01.length ? 'var(--teal-bg)' : 'var(--yellow-bg)',
              border: '1px solid ' + (correctCount === items01.length ? 'var(--teal-border)' : 'var(--yellow-border)'),
              color: correctCount === items01.length ? 'var(--teal)' : 'var(--yellow)',
              fontWeight: 700, fontSize: '0.88rem',
            }}>
              {correctCount}/{items01.length} correct{correctCount < items01.length ? ' — review the highlighted items' : ' — perfect'}
            </div>

            {/* Why this order — compact cost table */}
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>
                Why this order matters
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {LAYERS.map(layer => (
                  <div key={layer.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: layer.color, flexShrink: 0, marginTop: '0.35rem' }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: layer.color }}>{layer.label}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>({layer.time})</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginLeft: '0.4rem' }}>
                        — {layer.why.split('.')[0].toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* === WHAT YOU SHOULD HAVE CONFIRMED === */}
      {revealed && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>The first question is whether other correlated metrics are also down. If sessions are down 35% and purchases are down 35% proportionally, the drop is likely real — both signals move together. If only checkout events are down while sessions are flat, the drop may be a logging failure for that specific event rather than a real behavior change. The answer to that one question routes the entire subsequent investigation.</p>
        </div>
      )}

      {/* === THE ANALYST MOVE === */}
      {revealed && (
        <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.85rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Before touching a deploy log or a cohort, run a sixty-second data quality check first. Is the event count for related metrics also down? Is the drop isolated to one event type, one platform, or one region? These questions take under a minute and will close a third of your investigations before you&apos;ve written a single SQL query.</p>
            <p style={prose}><strong>Two.</strong> Write down your current layer when you hand off an investigation. &quot;We&apos;ve cleared data quality and confirmed it&apos;s real. We&apos;ve ruled out seasonality — this day last year was up 4%. We&apos;re now in layer three: looking at deploys.&quot; Without this, the next person who joins re-checks everything you already cleared.</p>
            <p style={prose}><strong>Three.</strong> Resist the pull of the most recent change. The most recent change is salient but not necessarily the cause. The framework overrides your intuition about where to look — and that override is the entire point.</p>
          </div>
        </div>
      )}

      {/* === NEXT BUTTON === */}
      {revealed && <NextBtn onClick={onComplete} />}
    </div>
  );
}
