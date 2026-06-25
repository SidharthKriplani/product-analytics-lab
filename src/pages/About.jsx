export function About() {
  const sections = [
    {
      title: 'What this is',
      body: `Product Analytics Lab (PAL) is an interactive judgment gym for product analysts, data analysts, and PMs who want to practice the analytical decisions that decide real interviews — not recall frameworks from a textbook.

The gap PAL fills: most prep resources teach you what A/B testing, RCA, and metric design are. Very few give you practice making judgment calls under realistic business pressure with messy, ambiguous data. PAL puts you in the decision, not the definition.

Foundations, a 300+ problem SQL Lab, a deck of judgment rooms, a spaced-repetition Review queue, a timed Mock Interview, and a community Feed — organised so you always know what to do next.`,
    },
    {
      title: 'The four things interviews test',
      body: `PAL is part of BreakLabs, built around the four competencies every technical interview — and the job itself — actually tests:

Recall — do you know the concepts cold? Definitions, formulas, what SRM or CUPED is. (In PAL: the Library and Foundations.)
Depth — do you understand why they work, well enough to reason past the textbook? (The four Foundation rooms.)
Fluency — can you execute without fighting the tools — write the SQL, the transform? (SQL Lab here; Programming Lab, the sibling SWE-for-data app, for code.)
Judgment — given messy, ambiguous data and real stakes, do you make the right call? (The judgment rooms — the whole point.)

Most prep tools drill recall and fluency. Judgment is the part that actually decides senior interviews — and it's the reason PAL exists.`,
    },
    {
      title: 'How the lab is organised',
      body: `PAL groups its rooms into four stages — the loop you move through as you prep:

KNOW — build and check the fundamentals. Four Foundation rooms (Stats, Experimentation, RCA, Metrics) plus the Library of reference articles.

DO — get fluent with the tools. SQL Lab spans a guided beginner walkthrough through Easy, Medium, Hard, Master, and Forensic problems. Programming Lab (the sibling app) handles code fluency.

JUDGE — the heart of PAL. A/B Design, A/B Judgment, Spot the Flaw, Metrics, RCA, Analytics Cases, Instrumentation, Product Design, Prioritization, Estimation, and Cross-Room Challenges. Every case puts you in a decision under realistic pressure.

LIVE — practice under interview conditions. Review (spaced repetition that resurfaces what you got wrong), Mock Interview (timed onsite simulation), Defense Strategy (a plan built from your JD), Company Tracks (round-by-round packs), and the community Feed.`,
    },
    {
      title: 'Answer the way interviewers ask',
      body: `Every judgment room runs in two modes. Options mode gives you multiple-choice calls for fast, keyed practice when you are warming up or drilling. Describe mode hides the options and asks you to write your reasoning first — the way a real interviewer makes you commit before revealing the answer.

The debrief is the point: every case explains not just the right call but the reasoning behind it and the failure modes that trap most candidates.`,
    },
    {
      title: 'Community, leaderboard & profiles',
      body: `PAL is more than a solo grind. The Feed is a community space where people share wins, questions, and what they're working through — and earn points for contributing.

Your profile carries your current role and company (with logo), LinkedIn, an optional résumé link, your avatar, your leaderboard rank, a per-room breakdown, and your feed points. Add your LinkedIn and résumé so recruiters browsing the leaderboard can actually find and reach you.

Progress and the readiness countdown live on the Progress page — completion by room, a practice heatmap, your role-readiness level, and recommended next steps.`,
    },
    {
      title: 'How to use PAL',
      body: `New to product analytics, or transitioning from another field:
→ Start in KNOW. Work Stat Foundations and RCA Foundations in order, then try a few cases in the Stats and RCA rooms before moving on.

Prepping for a specific interview:
→ Open Defense Strategy. Paste the job description, self-rate your gaps, pick your time horizon, and get a personalized day-by-day plan pointing you at the right rooms.

Keeping skills sharp:
→ Check Review daily — it resurfaces the exact cases you got wrong, spaced over time. Use Global Search (/) to jump to any topic, and run a Mock Interview when you want the full timed onsite.

Tracking where you stand:
→ The Progress page shows your readiness countdown, completion by room, a practice heatmap, and what to do next.`,
    },
    {
      title: 'How it differs from DataLemur, StrataScratch, Exponent',
      body: `DataLemur and StrataScratch: excellent SQL and Python question banks. PAL is not a question bank — it is a judgment system. The cases are not "write a query that returns X." They are "here is a metric that dropped 18% — what do you check first and why?"

Exponent: case-interview coaching with community and mock interviews. PAL is self-directed and structured around specific analytical failure modes rather than coaching rubrics — with its own Mock Interview, Review queue, and Feed built in.

The specific gap PAL targets: experiment-analysis judgment (not just stats formulas), RCA diagnostic instinct (not just framework recitation), and metric design under business pressure (not just definitions). These are the skills that decide senior PA interviews that existing tools do not systematically practice.`,
    },
    {
      title: 'Difficulty levels',
      body: `Every case and problem in PAL is tagged with a difficulty level:

Analyst — the entry point for practiced analysts. Requires knowing the concept; tests whether you can apply it correctly in a business context. Good for warming up or drilling a weak area.

Senior — requires chaining concepts or handling a data trap. The level most senior IC interviews operate at. This is where most PAL prep time should be spent.

Staff — requires judgment calls with incomplete information, trade-off decisions, and forward-looking recommendations beyond the immediate technical answer. Used for staff+ interview prep and the SQL Lab Master Vault.

Filter by difficulty in any room browser using the chips above the case list.`,
    },
    {
      title: 'Technical details',
      body: `React + Vite SPA. Case content ships as JavaScript data files and your progress is stored in your browser's localStorage. Sign in (optional) to sync across devices, post to the Feed, and appear on the leaderboard.

SQL Lab runs real Postgres in the browser via pglite (WASM) — no server-side execution. Code fluency lives in Programming Lab, a separate BreakLabs app.

Deployed on Vercel. Works offline once loaded. Currently in beta — free with an access code.`,
    },
  ];

  return (
    <div className="pal-page-enter" style={{ maxWidth: '760px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{
          fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)',
          letterSpacing: '-0.025em', marginBottom: '0.4rem',
        }}>
          About PAL
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
          What it is, how it works, and how to get value from it.
        </p>
      </div>

      {sections.map((section, i) => (
        <div key={i} style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)',
            marginBottom: '0.65rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid var(--border)',
          }}>
            {section.title}
          </h2>
          <div style={{
            fontSize: '0.875rem', color: 'var(--text-secondary)',
            lineHeight: 1.75, whiteSpace: 'pre-line',
          }}>
            {section.body}
          </div>
        </div>
      ))}

      {/* Feedback & contact */}
      <div style={{
        marginTop: '0.5rem', padding: '1.3rem 1.45rem',
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px',
      }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
          Feedback, issues & suggestions
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 1.1rem' }}>
          PAL is built and maintained by Sidharth Kriplani. Found a bug, have feedback, or want to
          suggest a problem or a room? Reach out — every message is read.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <a
            href="mailto:sidharthkriplani@gmail.com"
            style={{
              display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1rem',
              background: 'var(--accent)', color: '#fff', borderRadius: '8px',
              fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
            }}
          >Email Sidharth</a>
          <a
            href="https://www.linkedin.com/in/sidharth-kriplani"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1rem',
              background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)',
              borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
            }}
          >Connect on LinkedIn</a>
          <a
            href="https://chat.whatsapp.com/JbIaqV87fwh8Ym3ufH5CFx?mode=gi_t"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1rem',
              background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)',
              borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
            }}
          >Join the community</a>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.9rem 0 0' }}>
          sidharthkriplani@gmail.com · linkedin.com/in/sidharth-kriplani
        </p>
      </div>
    </div>
  );
}
