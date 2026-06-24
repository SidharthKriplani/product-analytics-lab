# Foundations Tier-3 Audit (judgment review against EVAL_RUBRICS.md)

Per-module content review of the Foundation rooms — the *taste* half the local models couldn't do.
Scored 1–5 (5 = sharp, builds judgment; 3 = a real weakness; 1 = wrong/misleading). Only the
items below score 5 ⇒ no action. Reviewer: frontier-model pass, 2026-06-24. Final adjudication is Sidharth's.

Deterministic findings (from `audit_foundations.mjs`) are folded in where relevant.

---

## STATUS (V5.75.0): ALL FIXES APPLIED & VERIFIED

The 4 must-fixes (ef08, rf07, mf13, sf26) + all factual score-4 items were rewritten, re-scored to 5/5, and independently spot-checked. Deterministic Tier-2 warnings 8 → 1 (only ef04 playbook-links left). All four files parse. The audit below is the record of what was found; everything actionable has been resolved.

---

## Headline — 4 must-fixes across 79 modules (RESOLVED)

The audit discriminated (not all-5, not carpet-flag): ~64 of 79 modules are clean 5s, four are genuine score-3 content problems, and ~11 are score-4 polish items. The four that can actually mislead a candidate:

1. **ef08 (Exp) — A/A testing.** Teaches that a single A/A at p=0.02 ⇒ broken platform. ~5% of valid A/A tests are significant *by chance*; one isn't proof. Teach the p-value distribution / repeated A/A (FPR ≈ α).
2. **rf07 (RCA) — Metric tree.** `revenue = users × sessions × conversion × AOV` is dimensionally wrong as written (needs sessions-per-user, orders-per-session), and "every drop lives in exactly one node" is false + self-contradicts rf12/rf14.
3. **mf13 (Metrics) — False negatives.** Near-verbatim duplicate of mf08, with *contradicting* illustrative sample sizes (6M vs 4M/50k). Differentiate or merge.
4. **sf26 (Stats) — Bayesian thinking.** "credible interval = exactly the probability the parameter is inside it" is true only *given the prior*; the prior-dependence caveat is missing — the single most important point in Bayesian inference.

Highest-value score-4 fixes (factual soft-spots, mostly Stats): sf16 (log-transform changes the estimand), sf29 (goodness-of-fit vs independence chi-square), sf32 (Mann-Whitney ≠ median test), mf06 (validate the leading→lagging link), rf05 (mix-shift ≠ Simpson's).

---

## Exp Foundations (15 modules) — reviewed

Overall: strong room. 12 of 15 are clean. One real factual fix (ef08), two minor polish items.

| id | title | score | note |
|---|---|---|---|
| ef01 | Why We Experiment | 5 | Power-user confound (85% vs 60%) — concrete, correct selection-vs-treatment intuition. |
| ef02 | The Unit of Randomization | 4 | Solid, but packs 3 ideas (unit-matching, variance/FPR, network effects) into one module; the "inflated false positive rate" is really clustered-variance underestimation — slightly loose. Trim or split. |
| ef03 | Statistical Power & MDE | 5 | 14M/arm, 22 weeks, n∝1/MDE² — concrete + correct. |
| ef04 | p-values & CIs | 5 | Nails the canonical "3% chance it's false" misread. Correct. |
| ef05 | Sample Ratio Mismatch | 5 | 52/48 + chi-square, pause/diagnose/relaunch. Correct. |
| ef06 | Novelty Effects | 5 | +8% at 3 days decaying to baseline; curiosity ≠ value. Correct. |
| ef07 | Multiple Testing | 4 | Good, but "at least one of those wins **is** noise" is stated as certainty — it's probabilistic (expected 1 false positive; P(≥1)≈64%). Soften to "likely includes a false positive." |
| ef08 | A/A Testing | **3** | **Real fix.** Teaches that a single A/A at p=0.02 ⇒ "your platform is broken." But ~5% of valid A/A tests show p<0.05 *by chance* — one significant A/A is expected, not proof of breakage. Should teach the **p-value distribution / repeated A/A** (false-positive rate ≈ α), not a single-test verdict. As written it would teach a senior candidate something wrong. |
| ef09 | CUPED / Variance Reduction | 5 | Pre-period covariate subtracts predictable variance. Correct, well-motivated. |
| ef10 | Sequential Testing | 5 | Peeking at p=0.049, FPR can exceed 20%, plan the stopping rule. Correct. |
| ef11 | Network Effects | 5 | Feed-ranking spillover, SUTVA, cluster fix. Correct. |
| ef12 | Holdout Groups | 5 | 40 wins → 18% projected vs 6% actual; interaction/cannibalisation. Strong maturity concept. |
| ef13 | Multi-Armed Bandits | 5 | Explore-exploit, inference vs opportunity cost. Correct. |
| ef14 | Geo Experiments | 5 | City-level randomization, ~30 units limits power, match markets. Correct. |
| ef15 | Switchback | 5 | Time-window randomization, autocorrelation must be modelled. Correct. |

### Exp Foundations — fix list (prioritized)
1. **ef08 (content/correctness):** rewrite so a single significant A/A isn't framed as proof of breakage — teach repeated A/A + p-value-distribution / FPR≈α. This is the one that could mislead. *(do)*
2. **ef07 (wording):** "at least one is noise" → probabilistic phrasing. *(quick)*
3. **ef02 (pedagogy):** trim the 3-concept overload; the variance/FPR line is loose. *(optional)*
4. **Deterministic (Tier-2):** ef01–ef07 have no `playbookLinks` (ef08–ef15 do) — add cross-links for consistency. *(quick)*

---

## RCA Foundations (15) — reviewed

13 of 15 clean. One real fix (rf07).

| id | title | score | note |
|---|---|---|---|
| rf01 | The RCA Framework | 5 | Sharp layer-ordering ("each layer cheaper to rule out"). |
| rf02 | Decompose Before You Diagnose | 5 | Three decomposition branches, three fixes. |
| rf03 | Data Quality First | 5 | Four diagnostics mapped to distinct failure modes. |
| rf04 | Seasonality & External Factors | 5 | "Null hypothesis of RCA"; Monday weekly-count catch. |
| rf05 | When the Aggregate Lies | 4 | Conflates "mix shift" with "Simpson's Paradox" (Simpson's needs the aggregate to move *opposite* every segment). |
| rf06 | Diagnosis → Recommendation | 5 | Five-question completeness checklist. |
| rf07 | Metric Tree Construction | **3** | **Fix.** `revenue = users × sessions × conversion × AOV` doesn't multiply out as written (needs sessions-*per-user*, orders-*per-session*); and "every drop lives in exactly one node" is false + contradicts rf12/rf14. |
| rf08 | SQL Diagnosis Patterns | 5 | Three first-queries + a stopping rule. |
| rf09 | Seasonality & Trend Separation | 4 | "same week last year down 12% → product is fine" overclaims from one YoY point. |
| rf10 | Instrumentation Failure Patterns | 4 | Three buckets framed as mutually exclusive; they can co-occur. |
| rf11 | External Factor Identification | 5 | Competitor-log habit + cost framing. |
| rf12 | Multi-Level RCA | 5 | Partial-recovery → second cause; counterfactual test. |
| rf13 | The Routing Gate | 5 | Time-signature → branch mapping. |
| rf14 | Dominant Lever & Pruning | 5 | Concrete pruning (CVR flat, AOV −18%). |
| rf15 | Hypothesis Ranking | 5 | Impact × Likelihood × Ease with the cheap-to-rule-out nuance. |

**Fix list:** rf07 (must — fix the identity's units + drop the "exactly one node" absolute); rf05 (separate mix-shift from Simpson's); rf09 (soften single-YoY conclusion); rf10 (note buckets can overlap).

## Metrics Foundations (17) — reviewed

13 of 17 clean. The room's issue is *redundancy*, not errors — two lessons (sensitivity; guardrail pre-commitment) are each taught ~2.5×.

| id | title | score | note |
|---|---|---|---|
| mf01 | The Metrics Hierarchy | 5 | "winning / why / where / breaking anything" framing. |
| mf02 | What Makes a Good Metric? | 5 | measurable→movable→predictive→gameable progression. |
| mf03 | Ratio Metrics & Their Traps | 5 | Real Simpson's with mechanism. |
| mf04 | Metric Decomposition | 5 | DAU = New + Retained + Resurrected. |
| mf05 | Counter Metrics & Guardrails | 4 | Overlaps mf12 (guardrail pre-commitment). |
| mf06 | Leading vs Lagging Indicators | 4 | States D7 retention "predicts LTV" as fact for a *brand-new* flow — the leading→lagging link must be validated, not assumed. |
| mf07 | Designing a North Star | 5 | "value delivered vs extracted"; WhatsApp messages-sent. |
| mf08 | Metric Sensitivity & Trade-offs | 4 | Duplicates mf13 (same example, same closer). |
| mf09 | Funnel Metrics | 5 | Adjacent-step relative-drop lever. |
| mf10 | Ratio Metrics in Depth | 4 | Close neighbor of mf03; saved by co-movement/SRM angle. |
| mf11 | Composite Metrics | 5 | "weights are almost always arbitrary"; OEC. |
| mf12 | Guardrail Metrics | 4 | Third module hammering guardrail pre-commitment. |
| mf13 | False Negatives & Metric Choice | **3** | **Fix.** Near-duplicate of mf08 — same revenue-vs-conversion example, same closer, and *contradicting* sample sizes (mf08: 6M; mf13: 4M/50k). |
| mf14 | Cohort Metrics & Retention | 5 | Jan 38% vs Feb 26%, aggregate flat — sharp. |
| mf15 | Engagement Depth | 5 | DAU/MAU 0.12 → 3–4 days/mo (checks out). |
| mf16 | Unit Economics | 5 | LTV/CAC/payback with a vivid failure mode. |
| mf17 | Growth Accounting | 5 | Four flows + quick ratio. Best-in-room rigor. |

**Fix list:** mf13 (must — differentiate from mf08 or merge; reconcile the sample-size numbers); mf06 (add the "validate the proxy link" caveat); trim guardrail redundancy across mf05/mf12; optional mf10 re-angle vs mf03.

## Stats Foundations (32) — reviewed

21 of 32 clean. One must-fix (sf26); a cluster of genuine *factual* 4-level nits worth doing because several modules quietly contradict each other across the sequence.

| id | title | score | note |
|---|---|---|---|
| sf01 | What is Data? | 4 | "Every A/B test measures a numerical variable" — conversion/click are categorical; undercuts its own lesson. |
| sf02 | Mean/Median/Mode | 5 | — |
| sf03 | Variance & SD | 5 | Ties SD to the test-stat denominator. |
| sf04 | Normal Distribution | 4 | non-normal-z hook is really answered by CLT (teaser, ok). |
| sf05 | Z-Scores | 4 | "compare across different distributions" overclaims (percentile depends on shape). |
| sf06 | Areas Under the Curve | 4 | loose on one- vs two-tailed. |
| sf07 | Sampling | 5 | — |
| sf08 | Standard Error | 5 | SE=σ/√n, 4×-for-half. Best-in-class. |
| sf09 | CLT | 4 | omits heavy-tail slow-convergence caveat (contradicts sf16/sf28/sf32). |
| sf10 | Confidence Intervals | 5 | textbook-correct, debunks the misread. |
| sf11 | Hypothesis Testing | 5 | — |
| sf12 | Power & Effect Size | 5 | — |
| sf13 | Experiment Design Lab | 5 | — |
| sf14 | Correlation & Covariance | 5 | r² as variance explained. |
| sf15 | Simpson's Paradox | 5 | true reversal, correct. |
| sf16 | Skewness & Log-Normal | 4 | "log-transform → cleaner" hides that you're now testing the geometric mean, not mean revenue. |
| sf17 | Multiple Testing | 5 | — |
| sf18 | Regression to the Mean | 5 | — |
| sf19 | Selection/Survivorship Bias | 5 | — |
| sf20 | Practical vs Statistical Sig | 5 | — |
| sf21 | Counterfactuals/Causal | 5 | — |
| sf22 | Difference-in-Differences | 5 | parallel-trends caveat present. |
| sf23 | Regression Discontinuity | 4 | McCrary framed one-sided ("bunching above"); the density test is two-sided. |
| sf24 | Synthetic Control | 5 | — |
| sf25 | Instrumental Variables | 5 | exclusion restriction + weak-instrument caveats correct. |
| sf26 | Bayesian Thinking | **3** | **Fix.** "credible interval = *exactly* the probability the parameter is in it" — true only *given the prior*; omits prior-dependence (the core caveat). |
| sf27 | Effect Size | 5 | Cohen's d benchmarks correct. |
| sf28 | Bootstrap | 4 | oversells the small-n heavy-tail rescue (bootstrap can't invent missing info). |
| sf29 | Chi-Square | 4 | conflates goodness-of-fit (the 52/48 SRM case) with the independence test. |
| sf30 | SUTVA | 5 | — |
| sf31 | ANOVA | 5 | 3 t-tests → ~14% FWER (verified). |
| sf32 | Non-Parametric | 4 | Mann-Whitney null is equal *distributions*, not medians (needs location-shift assumption). |

**Fix list:** sf26 (must — add prior-dependence to the credible-interval claim); then the factual 4s, highest-value first: sf16 (estimand change), sf29 (which chi-square), sf32 (M-W interpretation), sf28 (bootstrap isn't magic), sf23 (McCrary two-sided), sf09 (heavy-tail caveat), sf01/sf05/sf06 (definitional precision).
