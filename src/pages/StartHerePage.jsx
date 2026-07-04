// StartHerePage — the front door. Orientation, not marketing (that's About's job).
// (a) An interactive level x timeline picker that maps to a concrete first PAL room.
// (b) A compact map of PAL's main surfaces, each with a nav button.
// (c) A short note on how Progress, Review, and My Tracks work.
// (d) A jump-in callout with primary CTAs.
// PAL theme: --accent / --surface / --border / --text CSS vars. English only, no emojis.

import { useState } from 'react';

// Where are you? — three entry levels.
const LEVELS = [
  { key: 'new',  label: 'New to DS interviews', sub: 'building the foundation' },
  { key: 'some', label: 'Some prep done',        sub: 'sharpening judgment' },
  { key: 'exp',  label: 'Experienced',           sub: 'depth + edge cases' },
];

// Timeline? — three horizons.
const TIMELINES = [
  { key: 'week',  label: 'Interview this week', sub: 'highest-leverage only' },
  { key: 'month', label: 'Within a month',      sub: 'targeted prep' },
  { key: 'long',  label: '3+ months',           sub: 'no deadline' },
];

// Recommendation matrix — every (level x timeline) maps to a concrete PAL room.
// nav = the page id navigate() understands (matches Sidebar item ids).
const RECS = {
  'new-week':   { title: 'Stat Foundations, then RCA', nav: 'stat-foundations', cta: 'Open Stat Foundations',
    why: 'With days to go, lock the fundamentals interviewers assume you know. Work Stat Foundations in order, then run a few RCA cases — the two highest-frequency signals in an analyst loop.' },
  'new-month':  { title: 'Stat Foundations → RCA Foundations', nav: 'stat-foundations', cta: 'Open Stat Foundations',
    why: 'A month is enough to build real depth. Take Stat and RCA Foundations in order, then move into the RCA and Metrics judgment rooms once the concepts are cold.' },
  'new-long':   { title: 'All four Foundation rooms, in order', nav: 'foundations', cta: 'Open Foundations',
    why: 'No deadline means you can build the whole base. Work Stats, Metrics, RCA, and A/B Foundations end to end, then start layering judgment rooms on top of each.' },
  'some-week':  { title: 'RCA and Metrics judgment rooms', nav: 'rca', cta: 'Open RCA',
    why: 'You have the basics. This week, drill the two rooms that decide most analyst interviews — diagnose a metric drop in RCA, then defend a metric design in Metrics. Use Describe mode.' },
  'some-month': { title: 'RCA → A/B Judgment → Metrics', nav: 'rca', cta: 'Open RCA',
    why: 'Rotate through the core judgment rooms. RCA for diagnostic instinct, A/B Judgment for experiment reads, Metrics for design under pressure — the trio senior IC loops lean on.' },
  'some-long':  { title: 'Analytics Cases + Cross-Room Challenges', nav: 'cases', cta: 'Open Analytics Cases',
    why: 'With runway, push past single-skill drills. Analytics Cases chain multiple competencies; Challenges force you to switch modes mid-problem — the closest thing to a real onsite.' },
  'exp-week':   { title: 'Mock Interview, then patch gaps', nav: 'simulator', cta: 'Open Mock Interview',
    why: 'You know the material. Run a timed Mock to surface your actual weak spots under pressure, then spend the rest of the week in whichever room it exposes. Check Review daily.' },
  'exp-month':  { title: 'Company Tracks + Spot the Flaw', nav: 'company-tracks', cta: 'Open Company Tracks',
    why: 'Target the specific loop. Company Tracks give you a round-by-round pack; Spot the Flaw sharpens the critique reflex interviewers probe for at senior and staff level.' },
  'exp-long':   { title: 'Staff-level cases + Cross-Room Challenges', nav: 'challenges', cta: 'Open Challenges',
    why: 'Spend your time where the ceiling is. Filter rooms to Staff difficulty and run Cross-Room Challenges — trade-off calls with incomplete information and forward-looking recommendations.' },
};

// What each section is for — the rooms, grouped by the KNOW/DO/JUDGE/LIVE loop.
const SURFACES = [
  { group: 'Learn (KNOW)', items: [
    { nav: 'foundations',      label: 'Foundations',      desc: 'Four rooms — Stats, Metrics, RCA, A/B — that build and check the fundamentals.' },
    { nav: 'library',          label: 'Library',          desc: 'Reference articles and deep dives when you need the concept, not the drill.' },
  ]},
  { group: 'Practice (DO)', items: [
    { nav: 'sql-lab',          label: 'SQL Lab',          desc: '300+ problems on real in-browser Postgres, from a guided intro to Forensic.' },
  ]},
  { group: 'Judgment (JUDGE)', items: [
    { nav: 'rca',              label: 'RCA',              desc: 'Diagnose a metric drop — what do you check first, and why.' },
    { nav: 'metrics',          label: 'Metrics',          desc: 'Design and defend metrics under realistic business pressure.' },
    { nav: 'browser',          label: 'A/B Judgment',     desc: 'Read messy experiment results and make the call.' },
    { nav: 'cases',            label: 'Analytics Cases',  desc: 'Multi-step cases that chain several competencies together.' },
    { nav: 'challenges',       label: 'Challenges',       desc: 'Cross-room problems that force you to switch modes mid-answer.' },
  ]},
  { group: 'Interview (LIVE)', items: [
    { nav: 'simulator',        label: 'Mock Interview',   desc: 'A timed onsite simulation to pressure-test what you actually know.' },
    { nav: 'company-tracks',   label: 'Company Tracks',   desc: 'Round-by-round prep packs targeted at a specific company loop.' },
  ]},
];

// Progress / Review / My Tracks — how the tracking layer works.
const SYSTEMS = [
  { nav: 'progress',      label: 'My Progress', desc: 'Completion by room, a practice heatmap, your readiness countdown, and what to do next.' },
  { nav: 'review-queue',  label: 'Review',      desc: 'Spaced repetition — it resurfaces the exact cases you got wrong, spaced over time so they stick.' },
  { nav: 'my-tracks',     label: 'My Tracks',   desc: 'Save any case, module, or note into custom study lists to build your own prep path.' },
];

export function StartHerePage({ onNavigate }) {
  const go = (id) => { if (onNavigate && id) onNavigate(id); };
  const [level, setLevel] = useState(null);
  const [timeline, setTimeline] = useState(null);

  const rec = level && timeline ? RECS[`${level}-${timeline}`] : null;

  const card = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
  };
  const pill = (active) => ({
    flex: 1, minWidth: 150, textAlign: 'left', cursor: 'pointer',
    padding: '0.65rem 0.85rem', borderRadius: 'var(--radius)',
    background: active ? 'var(--accent-bg)' : 'var(--surface-2)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    transition: 'border-color var(--transition), background var(--transition)',
  });
  const sectionLabel = {
    fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: 'var(--accent)', margin: '0 0 0.8rem',
  };

  return (
    <div className='pal-page-enter' style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: '0.4rem' }}>
          Getting started
        </p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)',
          margin: '0 0 0.55rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Start Here
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.65, maxWidth: 560 }}>
          PAL is a judgment gym for product and data analyst interviews. Tell it where you are and how much
          time you have, and it points you at a concrete first room — then this page maps the rest of the lab.
        </p>
      </div>

      {/* (a) Interactive picker */}
      <h2 style={sectionLabel}>Find your starting point</h2>
      <div style={{ ...card, padding: '1.1rem 1.2rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text)', marginBottom: '0.55rem', fontWeight: 600 }}>Where are you?</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.15rem' }}>
          {LEVELS.map(o => (
            <button key={o.key} onClick={() => setLevel(o.key)} style={pill(level === o.key)}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: level === o.key ? 'var(--text)' : 'var(--text-secondary)' }}>{o.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{o.sub}</div>
            </button>
          ))}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text)', marginBottom: '0.55rem', fontWeight: 600 }}>What is your timeline?</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {TIMELINES.map(o => (
            <button key={o.key} onClick={() => setTimeline(o.key)} style={pill(timeline === o.key)}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: timeline === o.key ? 'var(--text)' : 'var(--text-secondary)' }}>{o.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{o.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recommendation card */}
      {rec ? (
        <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)',
          borderRadius: 'var(--radius-lg)', padding: '1.15rem 1.3rem', marginBottom: '2.4rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.07em', color: 'var(--accent)', marginBottom: '0.5rem' }}>
            Your starting point
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.35rem' }}>
            {rec.title}
          </div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: '0 0 1rem', lineHeight: 1.6 }}>
            {rec.why}
          </p>
          <button onClick={() => go(rec.nav)}
            style={{ background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: '0.82rem',
              border: 'none', borderRadius: 'var(--radius)', padding: '0.6rem 1.2rem', cursor: 'pointer' }}>
            {rec.cta} &rarr;
          </button>
        </div>
      ) : (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 2.4rem', fontStyle: 'italic' }}>
          Pick your level and timeline above to get a recommended first room.
        </p>
      )}

      {/* (b) What each section is for */}
      <h2 style={sectionLabel}>What each section is for</h2>
      <div style={{ marginBottom: '2.4rem' }}>
        {SURFACES.map(g => (
          <div key={g.group} style={{ marginBottom: '1.1rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em',
              color: 'var(--text-secondary)', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
              {g.group}
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {g.items.map(it => (
                <button key={it.nav} onClick={() => go(it.nav)}
                  style={{ ...card, padding: '0.75rem 0.95rem', textAlign: 'left', cursor: 'pointer',
                    borderRadius: 'var(--radius)', transition: 'border-color var(--transition)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{it.label} &rarr;</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: 1.5 }}>{it.desc}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* (c) How Progress, Review, My Tracks work */}
      <h2 style={sectionLabel}>How Progress, Review, and My Tracks work</h2>
      <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '2.4rem' }}>
        {SYSTEMS.map(s => (
          <button key={s.nav} onClick={() => go(s.nav)}
            style={{ ...card, padding: '0.75rem 0.95rem', textAlign: 'left', cursor: 'pointer',
              borderRadius: 'var(--radius)', transition: 'border-color var(--transition)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{s.label} &rarr;</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: 1.5 }}>{s.desc}</div>
          </button>
        ))}
      </div>

      {/* (d) Jump-in callout */}
      <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
        borderRadius: 'var(--radius-lg)', padding: '1.4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.4rem' }}>
          That is the loop.
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1.1rem',
          lineHeight: 1.6, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
          Build the base in Foundations, get fluent in SQL Lab, make the calls in the judgment rooms, then
          rehearse under pressure. Start where you are weakest.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => go(rec ? rec.nav : 'foundations')}
            style={{ background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: '0.82rem',
              border: 'none', borderRadius: 'var(--radius)', padding: '0.6rem 1.2rem', cursor: 'pointer' }}>
            {rec ? rec.cta : 'Open Foundations'} &rarr;
          </button>
          <button onClick={() => go('sql-lab')}
            style={{ background: 'var(--surface-2)', color: 'var(--text)', fontWeight: 700, fontSize: '0.82rem',
              border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.6rem 1.2rem', cursor: 'pointer' }}>
            Open SQL Lab &rarr;
          </button>
        </div>
      </div>

    </div>
  );
}

export default StartHerePage;
