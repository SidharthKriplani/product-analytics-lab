// ResourcesPage — canonical Resources surface: in-lab jumps + external references
// grouped by topic + sister labs + a copyable interview-practice prompt.
// PAL theme: --accent / --surface / --border / --text CSS vars. English only, no emojis.

import { useState } from 'react';

// In-lab quick jumps — key PAL rooms, reachable via onNavigate.
const IN_LAB = [
  { id: 'foundations',    label: 'Foundations',      desc: 'Stats, Metrics, RCA, and A/B fundamentals.' },
  { id: 'sql-lab',        label: 'SQL Lab',          desc: '300+ problems on real in-browser Postgres.' },
  { id: 'rca',            label: 'RCA',              desc: 'Diagnose metric drops under pressure.' },
  { id: 'metrics',        label: 'Metrics',          desc: 'Design and defend metrics.' },
  { id: 'cases',          label: 'Analytics Cases',  desc: 'Multi-step, multi-competency cases.' },
  { id: 'simulator',      label: 'Mock Interview',   desc: 'A timed onsite simulation.' },
];

// External references — high-signal, reputable sources, grouped by topic.
const REFERENCES = [
  { group: 'Product analytics', links: [
    { name: 'Amplitude — Product Analytics Playbook', url: 'https://amplitude.com/blog/product-analytics' },
    { name: 'Reforge — Analytics & data content', url: 'https://www.reforge.com/blog' },
    { name: 'Lenny Rachitsky — Product & growth newsletter', url: 'https://www.lennysnewsletter.com/' },
  ]},
  { group: 'SQL', links: [
    { name: 'Mode — SQL Tutorial', url: 'https://mode.com/sql-tutorial/' },
    { name: 'PostgreSQL — Official documentation', url: 'https://www.postgresql.org/docs/current/' },
    { name: 'Use The Index, Luke — SQL indexing & performance', url: 'https://use-the-index-luke.com/' },
  ]},
  { group: 'Experimentation', links: [
    { name: 'Kohavi, Tang & Xu — Trustworthy Online Controlled Experiments', url: 'https://experimentguide.com/' },
    { name: 'Microsoft — ExP Experimentation Platform', url: 'https://www.microsoft.com/en-us/research/group/experimentation-platform-exp/' },
    { name: 'Airbnb — Experimentation & Metrics (engineering blog)', url: 'https://medium.com/airbnb-engineering/experimentation-measurement/home' },
  ]},
  { group: 'Metrics', links: [
    { name: 'Amplitude — The North Star Playbook', url: 'https://amplitude.com/books/north-star' },
    { name: 'Sean Ellis — Growth & activation metrics', url: 'https://growthhackers.com/' },
    { name: 'Stripe — Metrics that matter (blog)', url: 'https://stripe.com/blog' },
  ]},
  { group: 'Interview prep', links: [
    { name: 'DataLemur — SQL & DS interview questions', url: 'https://datalemur.com/' },
    { name: 'StrataScratch — Data science interview practice', url: 'https://www.stratascratch.com/' },
    { name: 'Exponent — Product & analytics interview prep', url: 'https://www.tryexponent.com/' },
  ]},
];

// Sister labs — the BreakLabs family (URLs/labels match GSL & MSL Resources).
const SIBLINGS = [
  { name: 'ML Systems Lab',      url: 'https://ml-systems-lab.vercel.app',     desc: 'Classical ML, deep learning, and ML system design.' },
  { name: 'GenAI Systems Lab',   url: 'https://genai-systems-lab.vercel.app',  desc: 'LLMs, retrieval, agents, evaluation, and GenAI systems.' },
  { name: 'Programming Lab',     url: 'https://programming-lab.vercel.app',    desc: 'SWE-for-data fluency — predict the output, keep the reflex.' },
];

// Copyable interview-practice prompt — a concise PAL-flavored trainer prompt.
const TRAINER_PROMPT = `You are my dedicated product-analytics interview-prep trainer. Run my prep as a structured system, not a Q&A. You own the plan; I answer one drill at a time.

INTERVIEW CONTEXT
Ask me up front (or infer from anything I paste): company, role, round type, time until interview, and my known weak areas. If I already gave you this, do not re-ask — begin.

WHAT TO DRILL
Rotate across the case types product-analytics loops actually test:
- Root-cause analysis (a metric moved — diagnose it)
- Metric design (define and defend the right metric)
- Experiment design and readout (A/B tests, guardrails, interpreting messy results)
- Product sense and prioritization
- SQL reasoning (what does this query return / how would you write it)
- Estimation / sizing
Pick the next drill yourself based on my weakest area and the highest-probability topic for my target loop. Only ask me to choose when two drills are equally important.

HOW EACH DRILL RUNS
1. Ask one question. Make me commit to an answer before you reveal anything.
2. Require me to time myself. Target: 60-90 seconds spoken for most cases. If I skip timing, ask me to retry with a duration.
3. Score my answer out of 10. Below 7 is not interview-safe; 8.5+ is strong; 9+ is a confident pass.
4. Tell me plainly: what was strong, what was weak, WHY it was weak, and the exact spine I should have said.
5. Ask one pressure follow-up if my answer had a gap.
6. Track my score and time trend, then tell me the next drill.

RULES
- Be direct and strict on structure, metric clarity, trade-offs, and the final recommendation. Judge my logic before punishing natural spoken imperfection.
- Cap each case at ~3 attempts per session so I improve instead of memorizing.
- Keep the prep bounded: define a small "minimum sufficient" set of cases that makes me dangerous for this specific interview, and track coverage against it.
- After meaningful updates, show a compact dashboard: cases attempted, cases at target, rough readiness estimate, and the next best drill.

Start now: confirm my context, build the case set, and give me the first drill.`;

export function ResourcesPage({ onNavigate }) {
  const go = (id) => { if (onNavigate && id) onNavigate(id); };
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(TRAINER_PROMPT).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  const card = { background: 'var(--surface)', border: '1px solid var(--border)' };
  const sectionLabel = {
    fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: 'var(--accent)', margin: '0 0 0.9rem',
  };

  return (
    <div className='pal-page-enter' style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2.2rem' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: '0.4rem' }}>
          Resources
        </p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)',
          margin: '0 0 0.55rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Resources
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.65, maxWidth: 560 }}>
          Quick jumps into the lab, a short shelf of high-signal external references, the sister labs,
          and a copyable interview-practice prompt you can take anywhere.
        </p>
      </div>

      {/* In-lab quick jumps */}
      <h2 style={sectionLabel}>Jump into the lab</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.5rem', marginBottom: '2.4rem' }}>
        {IN_LAB.map(it => (
          <button key={it.id} onClick={() => go(it.id)}
            style={{ ...card, padding: '0.75rem 0.95rem', textAlign: 'left', cursor: 'pointer',
              borderRadius: 'var(--radius)', transition: 'border-color var(--transition)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{it.label} &rarr;</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: 1.5 }}>{it.desc}</div>
          </button>
        ))}
      </div>

      {/* External references */}
      <h2 style={sectionLabel}>External references</h2>
      <div style={{ marginBottom: '2.4rem' }}>
        {REFERENCES.map(sec => (
          <div key={sec.group} style={{ marginBottom: '1.3rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 0.5rem' }}>
              {sec.group}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.3rem' }}>
              {sec.links.map(l => (
                <li key={l.url}>
                  <a href={l.url} target='_blank' rel='noopener noreferrer'
                    style={{ fontSize: '0.85rem', color: 'var(--text)', textDecoration: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; e.currentTarget.style.color = 'var(--text)'; }}>
                    {l.name} <span style={{ color: 'var(--text-muted)' }}>&#8599;</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Sister labs */}
      <h2 style={sectionLabel}>Sister labs</h2>
      <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '2.4rem' }}>
        {SIBLINGS.map(s => (
          <a key={s.url} href={s.url} target='_blank' rel='noopener noreferrer'
            style={{ ...card, padding: '0.75rem 0.95rem', textDecoration: 'none', display: 'block',
              borderRadius: 'var(--radius)', transition: 'border-color var(--transition)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{s.name} <span style={{ color: 'var(--text-muted)' }}>&#8599;</span></div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: 1.5 }}>{s.desc}</div>
          </a>
        ))}
      </div>

      {/* Prompts & downloadables */}
      <h2 style={sectionLabel}>Prompts &amp; downloadables</h2>
      <div style={{ ...card, borderRadius: 'var(--radius-lg)', padding: '1.2rem 1.3rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.4rem' }}>
              Interview-practice prompt
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.6rem', lineHeight: 1.6 }}>
              Paste this into Claude or ChatGPT with your resume and the job description. It runs your prep as
              a structured system — picks the next drill, scores each timed answer, and tells you exactly what
              to fix. You focus on one answer at a time. No account needed.
            </p>
          </div>
          <button onClick={handleCopy}
            style={{
              flexShrink: 0, alignSelf: 'flex-start', padding: '0.55rem 1.1rem', fontSize: '0.8rem', fontWeight: 700,
              background: copied ? 'var(--accent-bg)' : 'var(--surface-2)',
              border: `1px solid ${copied ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)', color: copied ? 'var(--accent)' : 'var(--text)',
              cursor: 'pointer', transition: 'all var(--transition)', whiteSpace: 'nowrap',
            }}>
            {copied ? 'Copied' : 'Copy prompt'}
          </button>
        </div>
        <pre style={{
          marginTop: '0.9rem', marginBottom: 0, padding: '0.9rem 1rem',
          background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.55,
          whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 260, overflowY: 'auto',
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        }}>
          {TRAINER_PROMPT}
        </pre>
      </div>

    </div>
  );
}

export default ResourcesPage;
