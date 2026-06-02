export function About() {
  const sections = [
    {
      title: 'What this is',
      body: `Product Analytics Lab (PAL) is an interactive judgment gym for product analysts, data analysts, and PMs who want to practice the analytical decisions that decide real interviews — not recall frameworks from a textbook.

The gap PAL fills: most prep resources teach you what A/B testing, RCA, and metric design are. Very few give you practice making judgment calls under realistic business pressure with messy, ambiguous data. PAL puts you in the decision, not the definition.

17 rooms. 150+ cases. SQL Lab with 130 problems. Foundation modules across Stats, Experimentation, RCA, and Metrics. Every case tests judgment, not recall.`,
    },
    {
      title: "Who it's for",
      body: `Product analysts, data analysts, business analysts, and PMs preparing for senior IC and leadership-track interviews.

If you are transitioning into product analytics from technical operations, consulting, or engineering — start with the Foundation rooms. They build the mental models the practice rooms assume.

If you already know what a p-value, SRM, and metric tree are — jump directly into the practice rooms and use Defense Strategy to build a targeted prep plan from your actual job description.`,
    },
    {
      title: 'How it differs from DataLemur, StrataScratch, Exponent',
      body: `DataLemur and StrataScratch: excellent SQL and Python question banks. PAL is not a question bank — it is a judgment system. The cases are not "write a query that returns X." They are "here is a metric that dropped 18% — what do you check first and why?"

Exponent: case interview coaching with community and mock interviews. PAL is asynchronous, self-directed, and structured around specific analytical failure modes rather than coaching rubrics.

The specific gap PAL targets: experiment analysis judgment (not just stats formulas), RCA diagnostic instinct (not just framework recitation), and metric design under business pressure (not just definitions). These are the skills that decide senior PA interviews that existing tools do not systematically practice.`,
    },
    {
      title: 'How to use PAL',
      body: `New to product analytics or transitioning from another field:
→ Start with Stat Foundations + RCA Foundations. Read every module in order. Then try 3 cases in the Stats Room and RCA Room before moving on.

Already familiar with the core concepts, prepping for a specific interview:
→ Start with Defense Strategy (under Tools). Paste your job description, self-rate your gaps, pick your time horizon. Your personalized day plan tells you which rooms to hit in what order.

Practicing specific skills:
→ Use Global Search (/) to find cases by topic. SQL Lab is the structured SQL/Python problem bank — 130 problems ordered by difficulty with hints and a timer. MCQ Trainer for fast recall drilling.

Tracking progress:
→ Progress page shows completion by room, role readiness score, a practice heatmap, and recommended next steps.`,
    },
    {
      title: 'The rooms',
      body: `Foundation rooms (free, start here if new):
— Stat Foundations: 25 interactive modules on statistical thinking for experimentation
— RCA Foundations: 12 modules on structured root cause analysis
— Metrics Foundations: 13 modules on metric design, hierarchy, and sensitivity
— Exp Foundations: 15 modules on A/B test design, validity, and advanced methods

Core analytics practice rooms:
— Stats Room: evaluate stakeholder claims about experiment data — valid, directionally reasonable, not supported, or inconclusive
— Metrics Room: define primary metrics, diagnostics, and guardrails for a given product context
— Experiment Design Room: design an experiment before you see the data — metric, unit, guardrails, trust checks
— Experiment Review Room: make the ship/rollback/investigate call on a messy readout with conflicting signals
— RCA Room: step through a structured diagnosis of a metric movement
— Cases Room: work a business question from executive ask through to recommendation
— Growth Analytics Room: analyze growth metrics, cohort curves, and supply-demand dynamics
— BI & Reporting Room: interpret dashboards, surface insights, recommend actions
— Spot the Flaw Room: identify the methodological error in an analysis that looks correct
— Analytics Instrumentation Room: design event schemas and debug tracking failures

Practice tools:
— SQL Lab: 130 graded problems (50 Analyst / 40 Senior / 25 Staff / 15 Master Vault)
— Code Room: Python + SQL execution environment
— MCQ Trainer: 40 multiple-choice questions across core concepts
— Interview Simulator: timed practice sessions with role-specific question banks
— Cross-Room Challenges: multi-room scenarios that integrate skills

Prep tools:
— Defense Strategy: paste your JD → gap score → personalized day-by-day plan
— Company Tracks: round-by-round prep packs for specific companies
— Deep Dives: long-form Playbook articles on every major concept`,
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
      body: `Fully static React + Vite SPA. No backend, no database, no API calls. All case content ships as JavaScript data files. Progress is stored in your browser's localStorage. Nothing leaves your device.

SQL Lab runs SQLite in the browser via sql.js (WASM). Python Code Lab runs via Pyodide. Both are fully in-browser — no server-side execution.

Deployed on Vercel. Works offline once loaded. Free to use with access code; full access via one-time unlock.`,
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
    </div>
  );
}
