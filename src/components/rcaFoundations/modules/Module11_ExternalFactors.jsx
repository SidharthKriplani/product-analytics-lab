import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../../shared/Icon.jsx';
import { InsightBox, NextBtn as SharedNextBtn, MCQOption } from '../../shared/FoundationPrimitives.jsx';
import { loadRFState, saveRFState } from '../../../utils/rcaFoundationsState.js';

function NextBtn(props) { return <SharedNextBtn {...props} color={props.color || 'var(--teal)'} />; }

function shuffleArr(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; } return a; }

const EVENTS_RF11 = [
  {
    id: 0,
    text: 'DAU drops every Sunday vs Saturday consistently across 12 weeks',
    correct: 'Seasonal',
    explanation: 'Predictable, repeating calendar pattern — day-of-week seasonality. No external event required.',
  },
  {
    id: 1,
    text: 'A competitor launched a feature identical to your core product last Tuesday',
    correct: 'Competitor',
    explanation: 'A one-off market event outside your control. Check product news and app store reviews around the launch date.',
  },
  {
    id: 2,
    text: 'App Store rejected your update last week, reducing new install volume',
    correct: 'Platform',
    explanation: 'A platform policy or review decision — not a product regression, not seasonal. Check your App Store Connect dashboard.',
  },
  {
    id: 3,
    text: 'Central bank raised interest rates — users in your fintech app are reducing discretionary spend',
    correct: 'Macro',
    explanation: 'Macroeconomic shifts affect user behavior across the whole market. No product fix exists — this requires monitoring and potentially an adjusted forecast.',
  },
  {
    id: 4,
    text: 'Revenue drops every December 25-26 on your B2B productivity tool',
    correct: 'Seasonal',
    explanation: 'A predictable holiday pattern. B2B tools always see drops when businesses are closed. Expected and not actionable.',
  },
];

const CATEGORIES = ['Seasonal', 'Competitor', 'Platform', 'Macro'];
const CAT_COLORS = {
  'Seasonal':   { bg: 'var(--green-bg)',  border: 'var(--green-border)',  text: 'var(--green)' },
  'Competitor': { bg: 'var(--yellow-bg)', border: 'var(--yellow-border)', text: 'var(--yellow)' },
  'Platform':   { bg: 'var(--accent-bg)', border: 'var(--accent-border)', text: 'var(--accent)' },
  'Macro':      { bg: 'var(--red-bg)',    border: 'var(--red-border)',    text: 'var(--red)' },
};

const RF11_MCQ = {
  question: 'A major competitor launched a clone of your core feature 3 days before your A/B test result read-out. What should you do?',
  options: [
    'Discard the results and rerun the experiment from scratch — any external event during the test window invalidates the causal inference',
    'Ignore the competitor launch — both treatment and control were equally exposed, so randomization controls for it and the results remain valid',
    'Note the confound in the writeup, extend or rerun the test if the effect size was borderline, and treat the current result with documented caution',
    'Analyze treatment and control separately for behavioral shifts after the launch — if both groups shifted equally, the relative effect is still valid',
  ],
  correct: 2,
  explanation: 'A competitor launch during an experiment window is a confound. Option A (discard and rerun) is too aggressive — not every external event invalidates results, and rerunning has its own cost. Option B is the classic misconception: randomization controls for pre-existing differences, not for external events that may interact differently with treatment vs. control. Option D sounds analytical but assumes you can cleanly isolate pre/post behavior within the test window — in practice, user behavior shifts are gradual and the sub-period analysis introduces its own noise. The correct response is to document the confound, assess whether the effect size was decisive enough to survive it, and flag uncertainty in the writeup.',
};

export function Module_RF11({ onComplete }) {
  const _saved11 = useMemo(function() { return loadRFState('rf11'); }, []);
  const [events11] = useState(function() { return _saved11 && _saved11.events ? _saved11.events : shuffleArr(EVENTS_RF11); });
  const [selections, setSelections] = useState(function() { return _saved11 && _saved11.selections ? _saved11.selections : {}; });
  const [revealed, setRevealed] = useState(function() { return _saved11 && _saved11.revealed ? _saved11.revealed : {}; });
  const [mcqSel, setMcqSel] = useState(function() { return _saved11 && _saved11.mcqSel != null ? _saved11.mcqSel : null; });
  const [mcqRevealed, setMcqRevealed] = useState(function() { return _saved11 ? !!_saved11.mcqRevealed : false; });

  useEffect(function() { saveRFState('rf11', { events: events11, selections: selections, revealed: revealed, mcqSel: mcqSel, mcqRevealed: mcqRevealed }); }, [events11, selections, revealed, mcqSel, mcqRevealed]);

  const allRevealed = events11.every(function(e) { return !!revealed[e.id]; });

  function selectCat(id, cat) {
    if (revealed[id]) return;
    setSelections(function(prev) { return Object.assign({}, prev, { [id]: cat }); });
  }

  function checkEvent(id) {
    setRevealed(function(prev) { return Object.assign({}, prev, { [id]: true }); });
  }

  const prose = { color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: '0.92rem' };
  const sectionGap = { display: 'flex', flexDirection: 'column', gap: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* === CAUSAL CHAIN PROSE === */}
      <div style={sectionGap}>
        <p style={prose}>Three weeks into an investigation, someone mentions in passing that a major competitor relaunched their free tier the same week your retention started dropping. Nobody had flagged it. The data team spent eighteen engineering hours auditing internal cohort behavior and a product team scoped a three-sprint optimization roadmap — all pointed at the wrong cause.</p>
        <p style={prose}>The cause was external. The fix was in the pricing team&apos;s court. But the investigation discovered this three weeks late, because nobody had built the habit of checking external context before diving into internal data.</p>
        <p style={prose}>External factors are consistently underweighted in RCA because the analyst&apos;s default workspace is internal data. You open your event tables. You query your dashboards. You look at your product&apos;s own behavior. External context requires a different kind of effort: scanning competitor activity, reading platform policy announcements, checking marketing spend, monitoring macroeconomic signals. It doesn&apos;t feel like analysis. It doesn&apos;t produce a query result. But it needs to happen early, before the internal investigation starts consuming hours.</p>
        <p style={prose}>The discipline is a structured external context check at the start of every investigation. It covers five signal categories: competitor activity, platform changes, marketing activity, macroeconomic and news events, and regulatory or policy changes. The habit is to run this checklist as a ten-minute scan at the start of an investigation, not to wait for it to come up organically. The best analysts maintain a running log — a shared document updated weekly — so that when an investigation starts, the context is already documented.</p>
      </div>

      {/* === HOLD THIS QUESTION BOX === */}
      <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.45rem 0' }}>Hold this question</p>
        <p style={{ ...prose, color: 'var(--text)' }}>Your retention starts declining six weeks ago. The internal investigation finds nothing. What are the four external signal categories you check, and which one can you eliminate immediately if your product has no paid acquisition?</p>
      </div>

      {/* === TRY IT LABEL === */}
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try It</div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
        External factors explain a large share of metric movements that have no product fix. Classifying them correctly stops engineering teams from chasing non-existent regressions. Classify each event below into one of four categories.
      </p>

      {/* Category legend */}
      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
        {CATEGORIES.map(function(cat) {
          const c = CAT_COLORS[cat];
          return (
            <span key={cat} style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '4px', background: c.bg, border: '1px solid ' + c.border, color: c.text }}>
              {cat}
            </span>
          );
        })}
      </div>

      <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
        <strong>What to do:</strong> For each event below, select the category that best explains it — Seasonal, Competitor, Platform, or Macro — then click Check to confirm your classification.
      </div>

      {events11.map(function(ev) {
        const sel = selections[ev.id];
        const isRevealed = !!revealed[ev.id];
        const isCorrect = sel === ev.correct;
        return (
          <div key={ev.id} style={{
            background: 'var(--surface-2)',
            border: '1px solid ' + (isRevealed ? (isCorrect ? 'var(--teal-border)' : 'var(--red-border)') : 'var(--border)'),
            borderRadius: 'var(--radius)', padding: '0.85rem 1rem',
          }}>
            <div style={{ fontSize: '0.86rem', color: 'var(--text)', lineHeight: 1.6, marginBottom: '0.65rem' }}>{ev.text}</div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {CATEGORIES.map(function(cat) {
                const c = CAT_COLORS[cat];
                const isSelected = sel === cat;
                const isCorrCat = cat === ev.correct;
                let bg = 'var(--surface)';
                let border = 'var(--border)';
                let color = 'var(--text-muted)';
                if (isRevealed) {
                  if (isCorrCat) { bg = c.bg; border = c.border; color = c.text; }
                  else if (isSelected && !isCorrCat) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
                } else if (isSelected) {
                  bg = c.bg; border = c.border; color = c.text;
                }
                return (
                  <button
                    key={cat}
                    onClick={function() { selectCat(ev.id, cat); }}
                    disabled={isRevealed}
                    style={{
                      padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid ' + border, background: bg, color,
                      fontSize: '0.78rem', fontWeight: isSelected || (isRevealed && isCorrCat) ? 700 : 400,
                      cursor: isRevealed ? 'default' : 'pointer', transition: 'all 0.15s',
                    }}
                  >{cat}</button>
                );
              })}
            </div>
            {sel && !isRevealed && (
              <button
                onClick={function() { checkEvent(ev.id); }}
                style={{ padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--teal)', color: '#fff', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
              >Check</button>
            )}
            {isRevealed && (
              <div style={{ marginTop: '0.4rem', padding: '0.5rem 0.75rem', background: isCorrect ? 'var(--teal-bg)' : 'var(--red-bg)', border: '1px solid ' + (isCorrect ? 'var(--teal-border)' : 'var(--red-border)'), borderRadius: 'var(--radius-sm)', fontSize: '0.81rem', color: isCorrect ? 'var(--teal)' : 'var(--red)', lineHeight: 1.5 }}>
                <strong>{isCorrect ? 'Correct. ' : 'Not quite — the answer is ' + ev.correct + '. '}</strong>{ev.explanation}
              </div>
            )}
          </div>
        );
      })}

      {allRevealed && (
        <div>
          <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.9rem', marginBottom: '0.65rem', fontSize: '0.83rem', color: 'var(--teal)', lineHeight: 1.5 }}>
            <strong>What to do:</strong> Select the answer that correctly describes how to handle an external confound discovered during an A/B test window, then click Check.
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.65rem' }}>{RF11_MCQ.question}</div>
          {RF11_MCQ.options.map(function(opt, oi) {
            return (
              <MCQOption
                key={oi}
                label={opt}
                selected={mcqSel === oi}
                correct={oi === RF11_MCQ.correct}
                revealed={mcqRevealed}
                onClick={function() { if (!mcqRevealed) setMcqSel(oi); }}
              />
            );
          })}
          {mcqSel !== null && !mcqRevealed && (
            <button
              onClick={function() { setMcqRevealed(true); }}
              style={{ marginTop: '0.4rem', padding: '0.45rem 1rem', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--teal)', color: '#fff', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer' }}
            >Check</button>
          )}
          {mcqRevealed && (
            <div style={{ marginTop: '0.5rem', padding: '0.65rem 0.85rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.55 }}>
              {RF11_MCQ.explanation}
            </div>
          )}
        </div>
      )}

      {/* === WHAT YOU SHOULD HAVE CONFIRMED === */}
      {mcqRevealed && (
        <div style={sectionGap}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What you should have confirmed</p>
          <p style={prose}>The four categories are competitor activity, platform changes, marketing spend shifts, and macro or regulatory events. If the product has no paid acquisition, the marketing spend category is not fully eliminated — organic channel algorithms (app store, search) still count as platform-dependent acquisition, and those can change without any internal marketing action. Marketing spend can be cleared only if the product has no marketing investment at all and no organic channel dependencies. Even &quot;no paid spend&quot; doesn&apos;t mean marketing is irrelevant.</p>
        </div>
      )}

      {/* === THE ANALYST MOVE === */}
      {mcqRevealed && (
        <div style={{ background: 'var(--teal-bg)', border: '1.5px solid var(--teal-border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.85rem 0' }}>The Analyst Move</p>
          <div style={sectionGap}>
            <p style={prose}><strong>One.</strong> Start every investigation with the external context scan before opening your data warehouse. Ten minutes of scanning competitor blogs, the app store developer changelog, and your marketing team&apos;s spend summary will save hours of internal querying when the cause is external. Calendar it as the first step, not an afterthought.</p>
            <p style={prose}><strong>Two.</strong> Create a shared external context document and update it weekly. Assign ownership — one person on the analytics team maintains it. When an investigation starts, the log is the first reference. Incidents that arrive with context already documented resolve faster.</p>
            <p style={prose}><strong>Three.</strong> When you&apos;ve confirmed a product root cause internally, do an external check anyway before closing. A product regression and an external event can be simultaneous and compound each other. The investigation that finds the product cause first and stops there may be writing an incomplete RCA. The question is: even with the product cause fixed, would the metric have fully recovered?</p>
          </div>
        </div>
      )}

      {/* === NEXT BUTTON === */}
      {mcqRevealed && <NextBtn onClick={onComplete} />}
    </div>
  );
}
