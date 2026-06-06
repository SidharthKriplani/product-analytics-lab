import { useState } from 'react';
import { interviewQA } from '../data/interviewQA.js';
import { Icon } from '../components/shared/Icon.jsx';
import { DifficultyChips } from '../components/shared/DifficultyChips.jsx';

const CAT_CONFIG = {
  'Experimentation': { color: 'var(--accent)',  bg: 'var(--accent-bg)',  border: 'var(--accent-border)' },
  'Metrics':         { color: 'var(--green)',   bg: 'var(--green-bg)',   border: 'var(--green-border)' },
  'RCA':             { color: 'var(--yellow)',  bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
  'Product Sense':   { color: 'var(--purple)',  bg: 'var(--purple-bg)',  border: 'var(--purple-border)' },
  'Statistics':      { color: 'var(--teal)',    bg: 'var(--teal-bg)',    border: 'var(--teal-border)' },
  'SQL':             { color: 'var(--accent)',  bg: 'var(--accent-bg)',  border: 'var(--accent-border)' },
  'Growth':          { color: 'var(--green)',   bg: 'var(--green-bg)',   border: 'var(--green-border)' },
  'BI':              { color: 'var(--yellow)',  bg: 'var(--yellow-bg)',  border: 'var(--yellow-border)' },
  'Instrumentation': { color: 'var(--teal)',    bg: 'var(--teal-bg)',    border: 'var(--teal-border)' },
};

const DIFF_CONFIG = {
  analyst: { label: 'Analyst',  color: 'var(--accent)' },
  senior:  { label: 'Senior',   color: 'var(--teal)' },
  staff:   { label: 'Staff',    color: 'var(--yellow)' },
};

const TIER_LABEL = { analyst: 'Analyst', senior: 'Senior', staff: 'Staff' };
const TIER_COLOR = { analyst: 'var(--accent)', senior: 'var(--teal)', staff: 'var(--yellow)' };

function QuestionCard({ qa, onSelect }) {
  const cat = CAT_CONFIG[qa.category] || CAT_CONFIG['Metrics'];
  const diff = DIFF_CONFIG[qa.difficulty] || DIFF_CONFIG.analyst;
  return (
    <button
      onClick={() => onSelect(qa)}
      className="pal-card-hover"
      style={{
        width: '100%', textAlign: 'left', background: 'var(--surface)',
        border: '1px solid var(--border)', borderLeft: '3px solid ' + cat.color,
        borderRadius: 'var(--radius)', padding: '1rem 1.1rem',
        cursor: 'pointer', transition: 'all 0.12s',
      }}
    >
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: cat.color, background: cat.bg, border: '1px solid ' + cat.border, borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.45rem' }}>
          {qa.category}
        </span>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: diff.color, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.45rem' }}>
          {diff.label}
        </span>
        {!qa.isFree && (
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>Premium</span>
        )}
      </div>
      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>
        {qa.question}
      </p>
      <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
        {qa.context}
      </p>
    </button>
  );
}

function QuestionViewer({ qa, onBack, unlocked }) {
  const [tier, setTier] = useState('analyst');
  const [revealed, setRevealed] = useState(false);
  const cat = CAT_CONFIG[qa.category] || CAT_CONFIG['Metrics'];

  function handleTierChange(t) {
    setTier(t);
    setRevealed(false);
  }

  return (
    <div className="pal-page-enter" style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1rem' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: 0, marginBottom: '1.5rem' }}>
        ← Back to Q&A Bank
      </button>

      {/* Question */}
      <div style={{ background: cat.bg, border: '1px solid ' + cat.border, borderLeft: '3px solid ' + cat.color, borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: cat.color, marginBottom: '0.5rem' }}>
          {qa.category} · {DIFF_CONFIG[qa.difficulty]?.label}
        </div>
        <h2 style={{ margin: '0 0 0.6rem', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.4, letterSpacing: '-0.01em' }}>
          {qa.question}
        </h2>
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55, fontStyle: 'italic' }}>
          {qa.context}
        </p>
      </div>

      {/* Think first */}
      {!revealed && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Think through your answer first
          </div>
          <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Before revealing the model answer, try to answer out loud or in writing. What would you say to the interviewer?
          </p>
          <button
            onClick={() => setRevealed(true)}
            className="pal-glow-pulse"
            style={{ background: cat.color, color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.55rem 1.25rem', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Reveal model answers →
          </button>
        </div>
      )}

      {/* Model answers */}
      {revealed && (
        <div className="pal-reveal-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Model answers
          </div>

          {/* Tier selector */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {Object.entries(TIER_LABEL).map(([key, label]) => {
              const active = tier === key;
              if (key === 'staff' && !unlocked) return null;
              return (
                <button
                  key={key}
                  onClick={() => handleTierChange(key)}
                  style={{
                    background: active ? 'var(--surface-2)' : 'var(--surface)',
                    border: active ? '2px solid ' + TIER_COLOR[key] : '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.9rem',
                    fontSize: '0.8rem', fontWeight: active ? 700 : 500,
                    color: active ? TIER_COLOR[key] : 'var(--text-muted)', cursor: 'pointer',
                    transition: 'all 0.1s',
                  }}
                >
                  {label}
                </button>
              );
            })}
            {!unlocked && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', alignSelf: 'center', marginLeft: '0.25rem' }}>
                Staff answer locked
              </span>
            )}
          </div>

          {/* Answer */}
          <div style={{ borderLeft: '3px solid ' + TIER_COLOR[tier], paddingLeft: '1rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: TIER_COLOR[tier], marginBottom: '0.5rem' }}>
              {TIER_LABEL[tier]}-level answer
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.75 }}>
              {qa.answers[tier]}
            </p>
          </div>

          {/* What makes this tier */}
          <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            {tier === 'analyst' && 'Analyst: Gets the call right. Knows the framework. May miss the mechanism or edge cases.'}
            {tier === 'senior' && 'Senior: Correct decision with correct reasoning. Names the failure mode, specifies next steps, handles edge cases.'}
            {tier === 'staff' && 'Staff: Adds precision, forward-looking framing, and stakeholder-aware language. Reframes the question before answering it.'}
          </div>
        </div>
      )}
    </div>
  );
}

export function InterviewQABrowser({ unlocked, onBack }) {
  const [catFilter, setCatFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const categories = ['All', ...Array.from(new Set(interviewQA.map(q => q.category)))];
  const displayed = interviewQA.filter(q => {
    const catMatch = catFilter === 'All' || q.category === catFilter;
    const diffMatch = diffFilter === 'all' || q.difficulty === diffFilter;
    return catMatch && diffMatch;
  });

  if (selected) {
    return <QuestionViewer qa={selected} onBack={() => setSelected(null)} unlocked={unlocked} />;
  }

  return (
    <div className="pal-page-enter" style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--purple-bg)', border: '1px solid var(--purple-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="message-square" size={18} color="var(--purple)" />
          </span>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--purple)', marginBottom: '0.15rem' }}>
              Learn
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              Interview Q&A Bank
            </h1>
          </div>
        </div>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '560px' }}>
          Analytical PA/PM interview questions with model answers at three tiers — Analyst, Senior, and Staff. Not behavioral STAR questions. The calls, the frameworks, and the thinking that separates levels.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--purple)', background: 'var(--purple-bg)', border: '1px solid var(--purple-border)', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.55rem' }}>
            {interviewQA.length} Questions
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>7 categories · 3 answer tiers</span>
        </div>
      </div>

      {/* Category filter + count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.75rem',
            fontSize: '0.8rem', color: catFilter !== 'All' ? 'var(--text)' : 'var(--text-muted)',
            cursor: 'pointer', fontWeight: catFilter !== 'All' ? 600 : 400,
            outline: 'none',
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
          ))}
        </select>
        {catFilter !== 'All' && (
          <button onClick={() => setCatFilter('All')} style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--text-dim)', cursor: 'pointer', padding: 0 }}>
            Clear ×
          </button>
        )}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
          {displayed.length} of {interviewQA.length}
        </span>
      </div>
      {/* DifficultyChips for level */}
      <DifficultyChips
        value={diffFilter}
        onChange={setDiffFilter}
        counts={{
          all: interviewQA.filter(q => catFilter === 'All' || q.category === catFilter).length,
          analyst: interviewQA.filter(q => (catFilter === 'All' || q.category === catFilter) && q.difficulty === 'analyst').length,
          senior:  interviewQA.filter(q => (catFilter === 'All' || q.category === catFilter) && q.difficulty === 'senior').length,
          staff:   interviewQA.filter(q => (catFilter === 'All' || q.category === catFilter) && q.difficulty === 'staff').length,
        }}
      />

      {/* Practice path nudge */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderLeft: '3px solid var(--purple)', borderRadius: 'var(--radius)',
        padding: '0.75rem 1rem', marginBottom: '1.25rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
            Practice path — step 2 of 3
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Use <strong style={{ color: 'var(--text)' }}>MCQ Quiz</strong> first to build fluency, then study model answers here, then test yourself under real conditions in <strong style={{ color: 'var(--text)' }}>Mock Interview</strong>.
          </div>
        </div>
      </div>

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {displayed.map(qa => (
          <QuestionCard key={qa.id} qa={qa} onSelect={setSelected} />
        ))}
        {displayed.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No questions match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
