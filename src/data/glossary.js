// Product Analytics Lab — Hover/tap glossary data
//
// Seed set (v1): ~19 terms pulled from 8 already-solid foundation modules across
// all 4 families (rca-foundations, stats-foundations, exp-foundations,
// metrics-foundations). Each definition is a lightly trimmed version of the
// sentence that first explains the term in that module's own JSX prose or its
// `keyInsight`/`recap` fields in the sibling `*FoundationModules.js` data file —
// no new facts, numbers, or claims were introduced.
//
// Shape: keys are lowercase match strings (the exact surface form to look for
// in rendered prose, matched whole-word/whole-phrase, case-insensitive).
// `family` is the hash-routing slug used by src/utils/hashRouting.js
// (stats-foundations | metrics-foundations | rca-foundations | exp-foundations)
// so the "Full lesson" pointer can link via `#/<family>/<sourceModuleId>`.

export const GLOSSARY = {
  'root cause analysis': {
    term: 'Root Cause Analysis (RCA)',
    def: 'The structured, four-layer process for diagnosing why a metric moved — check data quality, then external factors, then product changes, then user behaviour, in that order.',
    sourceModuleId: 'rf01',
    family: 'rca-foundations',
    moduleTitle: 'The RCA Framework',
  },
  'rca': {
    term: 'RCA',
    def: 'Short for Root Cause Analysis — the structured four-layer sequence (data quality → external factors → product changes → user behaviour) for diagnosing a metric drop.',
    sourceModuleId: 'rf01',
    family: 'rca-foundations',
    moduleTitle: 'The RCA Framework',
  },
  'data quality': {
    term: 'Data Quality (layer)',
    def: 'The first and cheapest RCA layer to check — whether tracking, a pipeline, or logging broke, before assuming the product or users changed.',
    sourceModuleId: 'rf01',
    family: 'rca-foundations',
    moduleTitle: 'The RCA Framework',
  },
  'decomposition': {
    term: 'Decomposition',
    def: "Breaking an aggregate metric into its components (e.g. new, retained, and resurrected users) before naming a cause — done first, always, in RCA.",
    sourceModuleId: 'rf02',
    family: 'rca-foundations',
    moduleTitle: 'Decompose Before You Diagnose',
  },
  'mix shift': {
    term: 'Mix Shift',
    def: 'A composition effect where every segment is unchanged but the relative weight of each segment shifts, moving the aggregate metric even though nothing got better or worse within any segment.',
    sourceModuleId: 'rf05',
    family: 'rca-foundations',
    moduleTitle: 'When the Aggregate Lies',
  },
  "simpson's paradox": {
    term: "Simpson's Paradox",
    def: 'The extreme form of a mix shift, where the aggregate metric moves in the opposite direction from every individual segment.',
    sourceModuleId: 'rf05',
    family: 'rca-foundations',
    moduleTitle: 'When the Aggregate Lies',
  },
  'numerical variable': {
    term: 'Numerical Variable',
    def: 'A variable measured on a numeric scale (e.g. revenue per user, session length) — analyzed as a continuous quantity rather than a proportion.',
    sourceModuleId: 'sf01',
    family: 'stats-foundations',
    moduleTitle: 'What is Data?',
  },
  'categorical variable': {
    term: 'Categorical Variable',
    def: 'A variable with discrete category values (e.g. converted-or-not, clicked-or-not) — summarized and tested as a proportion.',
    sourceModuleId: 'sf01',
    family: 'stats-foundations',
    moduleTitle: 'What is Data?',
  },
  'mean': {
    term: 'Mean',
    def: 'The arithmetic average of a set of values — the number most experiment dashboards report, but easily inflated by a handful of outlier users.',
    sourceModuleId: 'sf02',
    family: 'stats-foundations',
    moduleTitle: 'Mean, Median, Mode',
  },
  'median': {
    term: 'Median',
    def: 'The middle value of a sorted dataset — more robust than the mean in right-skewed data like revenue, session length, or spend.',
    sourceModuleId: 'sf02',
    family: 'stats-foundations',
    moduleTitle: 'Mean, Median, Mode',
  },
  'right-skewed': {
    term: 'Right-Skewed',
    def: 'A distribution with a long tail on the high side (most users spend little, a few spend a lot) — the more skewed the data, the more the mean and median diverge.',
    sourceModuleId: 'sf02',
    family: 'stats-foundations',
    moduleTitle: 'Mean, Median, Mode',
  },
  'standard deviation': {
    term: 'Standard Deviation',
    def: 'The typical distance of data points from the mean — the denominator of almost every significance test, so more spread means more noise and more data needed to trust a signal.',
    sourceModuleId: 'sf03',
    family: 'stats-foundations',
    moduleTitle: 'Variance & Standard Deviation',
  },
  'variance': {
    term: 'Variance',
    def: 'The average squared distance from the mean — standard deviation is its square root, expressed back in the original units.',
    sourceModuleId: 'sf03',
    family: 'stats-foundations',
    moduleTitle: 'Variance & Standard Deviation',
  },
  'correlation': {
    term: 'Correlation',
    def: 'Two variables moving together without one necessarily causing the other — observational data can only ever show this, never causation.',
    sourceModuleId: 'ef01',
    family: 'exp-foundations',
    moduleTitle: 'Why We Experiment',
  },
  'random assignment': {
    term: 'Random Assignment',
    def: 'Randomly splitting users into groups so the only systematic difference between them is the treatment — the one mechanism that turns a correlation into a causal estimate.',
    sourceModuleId: 'ef01',
    family: 'exp-foundations',
    moduleTitle: 'Why We Experiment',
  },
  'observational data': {
    term: 'Observational Data',
    def: 'Data where you did not control who got the treatment — the treated and untreated groups may already differ in unmeasured ways, so any difference between them can be selection, not causation.',
    sourceModuleId: 'ef01',
    family: 'exp-foundations',
    moduleTitle: 'Why We Experiment',
  },
  'confound': {
    term: 'Confound',
    def: 'A hidden variable (like user motivation) that drives both the supposed cause and the effect, making an observational correlation look causal when it is not.',
    sourceModuleId: 'ef01',
    family: 'exp-foundations',
    moduleTitle: 'Why We Experiment',
  },
  'north star metric': {
    term: 'North Star Metric',
    def: "The single metric that answers \"are we winning?\" for the whole product — directionally important, but too slow-moving to serve as an A/B test's primary metric.",
    sourceModuleId: 'mf01',
    family: 'metrics-foundations',
    moduleTitle: 'The Metrics Hierarchy',
  },
  'guardrail metric': {
    term: 'Guardrail Metric',
    def: 'A metric tracked alongside a primary metric to answer "what are we breaking?" — it does not need to improve, it just needs to not get worse.',
    sourceModuleId: 'mf01',
    family: 'metrics-foundations',
    moduleTitle: 'The Metrics Hierarchy',
  },
};
