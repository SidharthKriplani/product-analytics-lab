import { useState, useRef } from 'react';
import { statsFoundationsModules } from '../data/statsFoundationsModules.js';
import { growthAnalyticsCases } from '../data/growthAnalyticsCases.js';
import { trainerMCQ } from '../data/trainerMCQ.js';
import { Icon } from '../components/shared/Icon.jsx';

// ─── Static article index ──────────────────────────────────────────────────
const ARTICLE_INDEX = [
  { id: 'end-to-end-experiment', title: 'End-to-End A/B Testing', tags: ['experimentation', 'a/b testing', 'statistics'], summary: 'Complete walkthrough of running an A/B test from hypothesis to ship decision' },
  { id: 'srm-and-trust', title: 'Sample Ratio Mismatch', tags: ['srm', 'experimentation', 'trust'], summary: 'How to detect and fix SRM in A/B tests' },
  { id: 'metric-sensitivity', title: 'Metric Sensitivity', tags: ['metrics', 'experimentation', 'power'], summary: 'Making metrics more sensitive for faster experiments' },
  { id: 'north-star-metric', title: 'North Star Metric', tags: ['metrics', 'strategy', 'product'], summary: 'How to choose and operationalize a North Star metric' },
  { id: 'growth-accounting', title: 'Growth Accounting Framework', tags: ['growth', 'retention', 'dau', 'mau'], summary: 'Decomposing user growth into New/Retained/Resurrected/Churned' },
  { id: 'cohort-retention-curves', title: 'Cohort Retention Curves', tags: ['retention', 'cohorts', 'growth'], summary: 'Reading and acting on cohort retention data' },
  { id: 'funnel-analysis-framework', title: 'Funnel Analysis', tags: ['funnel', 'conversion', 'analytics'], summary: 'Step-by-step funnel analysis from data to insight' },
  { id: 'ltv-payback-period', title: 'LTV and Payback Period', tags: ['ltv', 'cac', 'unit economics', 'growth'], summary: 'Calculating and interpreting LTV/CAC ratio' },
  { id: 'acquisition-quality', title: 'Acquisition Quality', tags: ['acquisition', 'growth', 'channels'], summary: 'Measuring quality of user acquisition by channel' },
  { id: 'notification-driven-dau', title: 'Notification-Driven DAU', tags: ['notifications', 'dau', 'engagement', 'growth'], summary: 'When DAU gains from notifications mask underlying churn' },
  { id: 'organic-growth-quality', title: 'Organic vs Paid Growth', tags: ['organic', 'paid', 'acquisition', 'growth'], summary: 'Distinguishing sustainable organic growth from paid inflation' },
  { id: 'causal-inference-primer', title: 'Causal Inference Primer', tags: ['causal', 'did', 'regression discontinuity', 'iv'], summary: 'When and how to use causal inference methods beyond A/B tests' },
  { id: 'did-explainer', title: 'Difference-in-Differences', tags: ['did', 'causal', 'quasi-experiment'], summary: 'DiD methodology for natural experiments' },
  { id: 'rice-prioritization', title: 'RICE Prioritization', tags: ['prioritization', 'rice', 'product management'], summary: 'Using RICE to score and rank product bets' },
  { id: 'product-sense-framework', title: 'Product Sense Framework', tags: ['product design', 'pm', 'frameworks'], summary: 'Structured approach to product design interview questions' },
  { id: 'sql-window-functions', title: 'SQL Window Functions', tags: ['sql', 'analytics', 'code'], summary: 'RANK, ROW_NUMBER, LAG/LEAD for analytics queries' },
  { id: 'dau-mau-stickiness', title: 'DAU/MAU Stickiness', tags: ['dau', 'mau', 'engagement', 'metrics'], summary: 'Interpreting stickiness ratios and benchmarks by app type' },
  { id: 'metric-tree-decomposition', title: 'Metric Trees', tags: ['metrics', 'decomposition', 'diagnosis'], summary: 'Breaking down North Star metrics to find root causes' },
  { id: 'segmentation-strategy', title: 'User Segmentation', tags: ['segmentation', 'analytics', 'product'], summary: 'Behavioral and demographic segmentation for analytics' },
  { id: 'bayesian-testing', title: 'Bayesian A/B Testing', tags: ['bayesian', 'experimentation', 'statistics'], summary: 'Bayesian approach to interpreting experiment results' },
  { id: 'power-analysis', title: 'Power Analysis & MDE', tags: ['power', 'mde', 'sample size', 'experimentation'], summary: 'Computing required sample size for A/B tests' },
  { id: 'cuped-variance-reduction', title: 'CUPED Variance Reduction', tags: ['cuped', 'variance reduction', 'experimentation'], summary: 'Using pre-experiment covariates to improve experiment sensitivity' },
  { id: 'p-value-misconceptions', title: 'P-value Misconceptions', tags: ['p-value', 'statistics', 'hypothesis testing'], summary: 'What p-values do and do not tell you' },
  { id: 'confidence-intervals', title: 'Confidence Intervals', tags: ['confidence interval', 'statistics', 'inference'], summary: 'Correct interpretation and use of CIs in product analytics' },
  { id: 'novelty-effect', title: 'Novelty Effect in A/B Tests', tags: ['novelty', 'experimentation', 'bias'], summary: 'Detecting and mitigating novelty effect in experiments' },
  { id: 'guardrail-metrics', title: 'Guardrail Metrics', tags: ['guardrail', 'experimentation', 'metrics'], summary: 'Setting and monitoring guardrail metrics in A/B tests' },
  { id: 'network-effects-products', title: 'Network Effects', tags: ['network effects', 'growth', 'product strategy'], summary: 'Types of network effects and how to measure them' },
  { id: 'jobs-to-be-done', title: 'Jobs to Be Done', tags: ['jtbd', 'product design', 'user research'], summary: 'JTBD framework for product decisions' },
  { id: 'activation-metrics', title: 'Activation Metrics', tags: ['activation', 'onboarding', 'growth', 'retention'], summary: 'Finding the aha moment and activation threshold' },
  { id: 'simpson-paradox', title: "Simpson's Paradox", tags: ['simpson', 'paradox', 'statistics', 'segmentation'], summary: 'How aggregate trends can reverse in segments and what to do about it' },
];

// ─── Suggested topics (empty state) ──────────────────────────────────────
const SUGGESTED_TOPICS = [
  { label: 'Experiment Design', icon: '', query: 'How do I run an A/B test?' },
  { label: 'Metric Diagnosis', icon: '', query: 'How do I diagnose a DAU drop?' },
  { label: 'Product Sense', icon: '', query: 'How do I approach product design questions?' },
  { label: 'Growth Analytics', icon: '', query: 'What is growth accounting and how does it work?' },
  { label: 'SQL & Code', icon: '', query: 'How do SQL window functions work?' },
  { label: 'Behavioral', icon: '', query: 'How do I answer behavioral interview questions?' },
];

// ─── Example questions ────────────────────────────────────────────────────
const EXAMPLE_QUESTIONS = [
  'How do I interpret p-values?',
  "What is Simpson's Paradox?",
  'How do I diagnose a DAU drop?',
  "What's the difference between LTV and CAC?",
  'How do I run an A/B test?',
  'What is RICE prioritization?',
];

// ─── Matching logic ───────────────────────────────────────────────────────
function scoreMatch(query, item, textFields) {
  const q = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (q.length === 0) return 0;
  let score = 0;
  for (const field of textFields) {
    const val = item[field];
    if (!val) continue;
    const text = Array.isArray(val) ? val.join(' ').toLowerCase() : String(val).toLowerCase();
    for (const word of q) {
      if (text.includes(word)) score += field === 'title' ? 3 : field === 'tags' ? 2 : 1;
    }
  }
  // Also check tags array explicitly
  if (Array.isArray(item.tags)) {
    for (const word of q) {
      if (item.tags.some(t => t.toLowerCase().includes(word))) score += 2;
    }
  }
  return score;
}

function searchArticles(query) {
  return ARTICLE_INDEX
    .map(a => ({ ...a, _score: scoreMatch(query, a, ['title', 'tags', 'summary']) }))
    .filter(a => a._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 5);
}

function searchCases(query) {
  const gaResults = growthAnalyticsCases.map(c => ({
    ...c,
    room: 'growth-analytics',
    _score: scoreMatch(query, c, ['title', 'subtitle', 'tags', 'domain']),
  }));
  const sfResults = statsFoundationsModules.map(m => ({
    ...m,
    room: 'stat-foundations',
    _score: scoreMatch(query, m, ['title', 'subtitle', 'tags']),
  }));
  return [...gaResults, ...sfResults]
    .filter(x => x._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 5);
}

function searchMCQ(query) {
  return trainerMCQ
    .map(q => ({ ...q, _score: scoreMatch(query, q, ['question', 'tags', 'category']) }))
    .filter(q => q._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 3);
}

// ─── LocalStorage history ─────────────────────────────────────────────────
const HISTORY_KEY = 'pal-consult-history-v1';

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(queries) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(queries.slice(0, 5)));
  } catch {}
}

// ─── Category badge colors ────────────────────────────────────────────────
const CATEGORY_COLOR = {
  statistics:      { color: 'var(--blue-text)', bg: 'var(--blue-bg)', border: 'var(--blue-border)' },
  metrics:         { color: 'var(--green)',     bg: 'var(--green-bg)', border: 'var(--green-border)' },
  growth:          { color: 'var(--teal)',      bg: 'var(--teal-bg)', border: 'var(--teal-border)' },
  product:         { color: 'var(--purple)',    bg: 'var(--purple-bg)', border: 'var(--purple-border)' },
  experimentation: { color: 'var(--yellow)',    bg: 'var(--yellow-bg)', border: 'var(--yellow-border)' },
  behavioral:      { color: 'var(--text-muted)', bg: 'var(--surface)', border: 'var(--border)' },
  estimation:      { color: 'var(--text-muted)', bg: 'var(--surface)', border: 'var(--border)' },
};

function CategoryBadge({ label }) {
  const cfg = CATEGORY_COLOR[label?.toLowerCase()] || CATEGORY_COLOR.behavioral;
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px',
      borderRadius: '20px', textTransform: 'capitalize', letterSpacing: '0.03em',
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>
      {label}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────
export function ConsultationSpace({ onBack, onNavigate }) {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState(loadHistory);
  const textareaRef = useRef(null);
  const resultsRef = useRef(null);

  function handleSubmit() {
    const q = query.trim();
    if (!q) return;

    const articles = searchArticles(q);
    const cases = searchCases(q);
    const mcqs = searchMCQ(q);

    setResults({ articles, cases, mcqs, query: q });
    setSubmitted(true);

    // Update history
    const newHistory = [q, ...history.filter(h => h !== q)].slice(0, 5);
    setHistory(newHistory);
    saveHistory(newHistory);

    // Scroll to results after render
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  }

  function prefill(q) {
    setQuery(q);
    textareaRef.current?.focus();
  }

  const hasAnyResults = results && (
    results.articles.length > 0 || results.cases.length > 0 || results.mcqs.length > 0
  );

  return (
    <div className="pal-page-enter" style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '0.85rem',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0 0 1.5rem', marginLeft: '-2px',
        }}
      >
        ← Back
      </button>

      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'var(--purple-bg)', border: '1px solid var(--purple-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.15rem', flexShrink: 0,
          }}>
            <Icon name='message-circle' size={18} color='currentColor' />
          </span>
          <div>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--purple)', marginBottom: '0.15rem',
            }}>
              Consultation Space
            </div>
            <h1 style={{
              fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)',
              margin: 0, letterSpacing: '-0.02em',
            }}>
              Ask the Lab
            </h1>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, maxWidth: '560px', lineHeight: 1.6 }}>
          Ask anything about DS/PM interviews — PAL finds the relevant content
        </p>
      </div>

      {/* Recent history chips (after first search) */}
      {submitted && history.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            Recent
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => prefill(h)}
                style={{
                  fontSize: '0.78rem', padding: '3px 10px', borderRadius: '20px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.color = 'var(--purple)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Example questions chips */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          Try asking
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {EXAMPLE_QUESTIONS.map((eq, i) => (
            <button
              key={i}
              onClick={() => prefill(eq)}
              style={{
                fontSize: '0.78rem', padding: '4px 11px', borderRadius: '20px',
                background: 'var(--purple-bg)', border: '1px solid var(--purple-border)',
                color: 'var(--purple)', cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.75'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {eq}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div style={{ marginBottom: '1.5rem' }}>
        <textarea
          ref={textareaRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question…"
          style={{
            width: '100%', minHeight: '80px', boxSizing: 'border-box',
            padding: '0.75rem 1rem', borderRadius: '10px',
            border: '1.5px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text)', fontSize: '0.95rem', lineHeight: 1.55,
            resize: 'vertical', outline: 'none', fontFamily: 'inherit',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--purple)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            onClick={handleSubmit}
            disabled={!query.trim()}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.88rem',
              fontWeight: 600, cursor: query.trim() ? 'pointer' : 'not-allowed',
              background: query.trim() ? 'var(--purple)' : 'var(--surface)',
              color: query.trim() ? '#fff' : 'var(--text-dim)',
              border: `1.5px solid ${query.trim() ? 'var(--purple)' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}
          >
            Find Answers →
          </button>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.25rem', textAlign: 'right' }}>
          Tip: <Icon name='command' size={12} color='currentColor' />+Enter to search
        </div>
      </div>

      {/* ── Empty state: suggested topics ── */}
      {!submitted && (
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            Explore by topic
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '0.75rem' }}>
            {SUGGESTED_TOPICS.map((t, i) => (
              <button
                key={i}
                onClick={() => prefill(t.query)}
                style={{
                  padding: '1rem 1.1rem', borderRadius: '10px', textAlign: 'left',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  cursor: 'pointer', transition: 'border-color 0.15s, transform 0.1s',
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {submitted && results && (
        <div ref={resultsRef}>
          {/* Results heading */}
          <div style={{ marginBottom: '1.5rem', paddingTop: '0.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              Results for
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
              "{results.query}"
            </div>
          </div>

          {/* No results */}
          {!hasAnyResults && (
            <div style={{
              padding: '2rem', borderRadius: '10px', textAlign: 'center',
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6,
            }}>
              No matches found — try different keywords or{' '}
              <button
                onClick={() => onNavigate && onNavigate('playbook')}
                style={{ background: 'none', border: 'none', color: 'var(--purple)', cursor: 'pointer', fontWeight: 600, padding: 0, fontSize: 'inherit' }}
              >
                browse the Playbook
              </button>
            </div>
          )}

          {/* Section 1: Articles */}
          {results.articles.length > 0 && (
            <ResultSection title="Playbook Articles" count={results.articles.length}>
              {results.articles.map(article => (
                <ArticleCard key={article.id} article={article} onNavigate={onNavigate} />
              ))}
            </ResultSection>
          )}

          {/* Section 2: Cases */}
          {results.cases.length > 0 && (
            <ResultSection title="Practice Cases" count={results.cases.length}>
              {results.cases.map(item => (
                <CaseCard key={`${item.room}-${item.id}`} item={item} onNavigate={onNavigate} />
              ))}
            </ResultSection>
          )}

          {/* Section 3: MCQs */}
          {results.mcqs.length > 0 && (
            <ResultSection title="MCQ Questions to Test Yourself" count={results.mcqs.length}>
              {results.mcqs.map(mcq => (
                <MCQCard key={mcq.id} mcq={mcq} onNavigate={onNavigate} />
              ))}
            </ResultSection>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────

function ResultSection({ title, count, children }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: '0.5rem',
        marginBottom: '0.75rem',
      }}>
        <h2 style={{
          fontSize: '0.9rem', fontWeight: 700, color: 'var(--purple)',
          margin: 0, letterSpacing: '-0.01em',
        }}>
          {title}
        </h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          {count} result{count !== 1 ? 's' : ''}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {children}
      </div>
    </div>
  );
}

function ArticleCard({ article, onNavigate }) {
  return (
    <div style={{
      padding: '0.9rem 1rem', borderRadius: '10px',
      background: 'var(--surface)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.2rem' }}>
          {article.title}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {article.summary}
        </div>
        {article.tags && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
            {article.tags.slice(0, 3).map((tag, i) => (
              <span key={i} style={{
                fontSize: '0.68rem', padding: '1px 7px', borderRadius: '20px',
                background: 'var(--purple-bg)', border: '1px solid var(--purple-border)',
                color: 'var(--purple)',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => onNavigate && onNavigate('playbook', article.id)}
        style={{
          flexShrink: 0, padding: '5px 12px', borderRadius: '7px',
          fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
          background: 'var(--purple-bg)', border: '1px solid var(--purple-border)',
          color: 'var(--purple)', whiteSpace: 'nowrap',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.75'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        Read →
      </button>
    </div>
  );
}

const ROOM_LABEL = {
  'growth-analytics': { label: 'Growth Analytics', color: 'var(--teal)', bg: 'var(--teal-bg)', border: 'var(--teal-border)' },
  'stat-foundations':  { label: 'Stat Foundations', color: 'var(--blue-text)', bg: 'var(--blue-bg)', border: 'var(--blue-border)' },
};

function CaseCard({ item, onNavigate }) {
  const roomCfg = ROOM_LABEL[item.room] || { label: item.room, color: 'var(--text-muted)', bg: 'var(--surface)', border: 'var(--border)' };
  const subtitle = item.subtitle || '';
  return (
    <div style={{
      padding: '0.9rem 1rem', borderRadius: '10px',
      background: 'var(--surface)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)' }}>{item.title}</span>
          <span style={{
            fontSize: '0.68rem', fontWeight: 600, padding: '1px 7px', borderRadius: '20px',
            color: roomCfg.color, background: roomCfg.bg, border: `1px solid ${roomCfg.border}`,
          }}>
            {roomCfg.label}
          </span>
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subtitle}</div>
        )}
        {item.tags && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
            {item.tags.slice(0, 3).map((tag, i) => (
              <span key={i} style={{
                fontSize: '0.68rem', padding: '1px 7px', borderRadius: '20px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--text-dim)',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => onNavigate && onNavigate(item.room, item.id)}
        style={{
          flexShrink: 0, padding: '5px 12px', borderRadius: '7px',
          fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
          background: roomCfg.bg, border: `1px solid ${roomCfg.border}`,
          color: roomCfg.color, whiteSpace: 'nowrap',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.75'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        Practice →
      </button>
    </div>
  );
}

function MCQCard({ mcq, onNavigate }) {
  return (
    <div style={{
      padding: '0.9rem 1rem', borderRadius: '10px',
      background: 'var(--surface)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
          <CategoryBadge label={mcq.category} />
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.55 }}>
          {mcq.question}
        </div>
      </div>
      <button
        onClick={() => onNavigate && onNavigate('trainer')}
        style={{
          flexShrink: 0, padding: '5px 12px', borderRadius: '7px',
          fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
          background: 'var(--purple-bg)', border: '1px solid var(--purple-border)',
          color: 'var(--purple)', whiteSpace: 'nowrap',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.75'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        Test yourself →
      </button>
    </div>
  );
}
