// moduleTiers.js — interview-frequency tier for every PAL Foundation module,
// for a SENIOR PRODUCT / DATA ANALYST loop. S = always asked, A = shows up
// often, B = the depth that makes you unbreakable (default). Powers the tier
// badges on foundation cards and the one-click "Build S/A/B tracks" action.
// Keyed by foundation module id (sf* stats, ef* A/B, mf* metrics, rf* RCA).
// Edit these two lists to re-tier.

export const TIER_S = [
  // Stats Foundations
  'sf09', // Central Limit Theorem
  'sf10', // Confidence Intervals
  'sf11', // Hypothesis Testing
  'sf12', // Power & Effect Size
  'sf13', // Experiment Design Lab
  'sf15', // Simpson's Paradox
  'sf17', // Multiple Testing & Corrections
  'sf18', // Regression to the Mean
  'sf19', // Selection Bias & Survivorship
  'sf20', // Practical vs Statistical Significance
  // A/B (Experiment) Foundations
  'ef01', // Why We Experiment
  'ef02', // The Unit of Randomization
  'ef03', // Statistical Power and MDE
  'ef04', // p-values, Confidence Intervals, and What They Actually Mean
  'ef05', // Sample Ratio Mismatch
  'ef06', // Novelty Effects and Long-Run Validity
  'ef07', // Multiple Testing and Experiment Guardrails
  // Metrics Foundations
  'mf01', // The Metrics Hierarchy
  'mf02', // What Makes a Good Metric?
  'mf04', // Metric Decomposition
  'mf05', // Counter Metrics and Guardrails
  'mf07', // Designing a North Star Metric
  'mf09', // Funnel Metrics
  // RCA Foundations
  'rf01', // The RCA Framework
  'rf02', // Decompose Before You Diagnose
  'rf03', // Data Quality First
  'rf05', // When the Aggregate Lies
  'rf06', // From Diagnosis to Recommendation
];

export const TIER_A = [
  // Stats Foundations
  'sf03', // Variance & Standard Deviation
  'sf04', // The Normal Distribution
  'sf05', // Z-Scores
  'sf06', // Areas Under the Curve
  'sf07', // Sampling
  'sf08', // Standard Error
  'sf14', // Correlation & Covariance
  'sf16', // Skewness & Log-Normal Distributions
  // A/B (Experiment) Foundations
  'ef08', // A/A Testing
  'ef09', // CUPED / Variance Reduction
  'ef10', // Sequential Testing
  'ef12', // Holdout Groups
  // Metrics Foundations
  'mf03', // Ratio Metrics and Their Traps
  'mf06', // Leading vs Lagging Indicators
  'mf08', // Metric Sensitivity and Trade-offs
  'mf10', // When a Flat Rate Is the Lie
  'mf11', // Composite Metrics
  'mf12', // Guardrail Metrics
  'mf14', // Cohort Metrics and Retention Curves
  'mf15', // Engagement Depth
  'mf16', // Unit Economics
  'mf17', // Growth Accounting
  // RCA Foundations
  'rf04', // Seasonality and External Factors
  'rf07', // Metric Tree Construction
  'rf08', // SQL Diagnosis Patterns
  'rf09', // Seasonality and Trend Separation
  'rf10', // Instrumentation Failure Patterns
  'rf11', // External Factor Identification
  'rf12', // Multi-Level RCA
  'rf13', // The Routing Gate
  'rf14', // Dominant Lever and Pruning
  'rf15', // Hypothesis Ranking
];

const _S = new Set(TIER_S);
const _A = new Set(TIER_A);

// Everything not in S or A is B (the unbreakable-depth layer).
export function tierOf(moduleId) {
  return _S.has(moduleId) ? 'S' : _A.has(moduleId) ? 'A' : 'B';
}

// Teal-friendly PAL palette. S = teal (the room accent), A = amber, B = muted.
export const TIER_STYLE = {
  S: { label: 'S', color: 'var(--teal)',       bg: 'var(--teal-bg)',                    border: 'var(--teal-border)' },
  A: { label: 'A', color: 'var(--yellow)',     bg: 'var(--yellow-bg)',                  border: 'var(--yellow-border)' },
  B: { label: 'B', color: 'var(--text-muted)', bg: 'var(--surface-2)',                  border: 'var(--border)' },
};
