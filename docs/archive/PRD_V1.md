# Product Analytics Systems Lab — PRD

**Version:** V1.1  
**Status:** Active development  
**Last updated:** 2026-05

---

## Problem Statement

Product analysts and data scientists can learn A/B testing theory from dozens of courses, books, and tutorials. What they cannot get from most of those resources: practice making the actual call when the data is messy, the PM is waiting, and the right answer isn't obvious.

The gap is judgment, not knowledge. Knowing that sample ratio mismatch is a validity threat is different from recognizing it in a real readout, understanding why it happened, deciding what to do about it, and explaining it to a stakeholder.

Experimentation Systems Lab fills that gap.

---

## Target Users

**Primary:** Product analysts and data scientists at tech companies (0–6 years of experience) who run A/B tests as part of their core work. They know the math. They need practice with the judgment layer.

**Secondary:** Senior analysts and data science managers who want a calibration tool for interviews, onboarding, or team training.

**Not for:** People who are new to statistics or A/B testing. This product assumes the basics are already internalized.

---

## Core Product Hypothesis

> Deliberate practice on synthetic but realistic experiment scenarios — with immediate expert feedback — accelerates the development of experimentation judgment faster than passive reading or course completion.

Key bets:
1. Scenario-based practice with pre-committed decisions produces better retention than passive study.
2. Expert debriefs written at the senior analyst level teach reasoning patterns, not just answers.
3. Calibrated scoring across four levels (Junior Miss → Staff-Level) gives users a meaningful signal on where they are.

---

## Platform Modules

### V1 — Experiment Review Room (current)
The core product. Synthetic experiment readouts with decision interface, flag checklist, score reveal, and senior analyst debrief.

**Input:** Scenario data (context, design, metrics, warning flags, decision options, debrief)  
**Output:** Decision submission → Score reveal → Full senior read

### V2 — Experiment Design Room (planned)
Design-your-own-test cases. Given a product goal and constraints, construct the experiment: choose randomization unit, define metrics and guardrails, set runtime, size the test. Then see an expert evaluation.

### V3 — Stats & Inference Lab (planned)
Focused exercises on statistical inference under non-ideal conditions: right-censored metrics, variance reduction (CUPED), sequential testing, geo-holdout analysis, switchback designs.

### V4 — RCA Room (planned)
Root cause analysis scenarios. Given a metric drop or anomaly, work through the diagnostic tree: instrumentation issue, external event, experiment contamination, or real product regression.

### V5 — Full Platform (planned)
Integrated learning path, team accounts, interview prep mode, custom scenario uploads.

---

## Content Architecture

**50-scenario Judgment Bank** across 15 failure-mode families:

| Family | Core trap |
|--------|-----------|
| metric_conflict | Primary green, guardrail red — what do you do? |
| srm | Validity threat from imbalanced assignment |
| guardrail_breach | Permission vs. obligation to ship |
| novelty_peeking | Temporal confounds and premature stopping |
| hte_subgroups | Post-hoc fishing vs. pre-registered analysis |
| multiple_testing | FWER/FDR under pressure to show wins |
| sutva_interference | Marketplace and network spillover |
| when_not_to_experiment | Selection bias, ethical constraints, holdouts |
| underpowered | Low power, long tails, rare events |
| cuped_variance | Sensitivity vs. coverage tradeoffs |
| geo_holdout | Non-IID units, geo confounding |
| switchback | Carryover, temporal autocorrelation |
| b2b_constraints | Small N, account-level randomization |
| right_censored | Survival metrics, LTV, churn timing |
| multi_touch | Attribution and incrementality framing |

**8 playable now.** 42 on the roadmap with architecture defined.

---

## Monetization Hypothesis

**Free tier:** 4 analyst-level scenarios. Full product experience. No account required.

**Paid tier (beta):** 4 senior/staff-level scenarios. Target price: $9–19 one-time or $4–7/month. Jobs-to-be-done: interview prep, skill calibration, onboarding.

**Team/company tier (planned V2+):** Custom scenarios, team dashboards, interview toolkits. Target: data science teams and analytics orgs.

Revenue assumptions:
- Zero distribution cost (SEO/content-driven)
- Zero operating cost (fully static, Vercel free tier)
- Conversion from free: 5–10% at current stage
- Primary channel: product analytics communities, interview prep networks

---

## Constraints and Risks

**Content quality risk:** Each scenario requires significant original work. Low-quality scenarios destroy the product's credibility. The content quality bar must be maintained strictly (see CONTENT_QUALITY_BAR.md).

**Content freshness:** Scenarios should reflect current industry practice. Failure modes evolve as tooling matures (e.g., Statsig's automated SRM detection changes what counts as "analyst-level" awareness).

**Scope creep:** The platform vision is large (V1–V5). The product is only as good as what ships. V1.1 exists because V1 worked. Nothing beyond V1.5 should be built until V1.5 validates the core.

**Static architecture ceiling:** Fully static SPA scales indefinitely for read traffic but blocks features requiring server-side logic (team accounts, custom scenarios, progress sync across devices). This is an acceptable tradeoff through V2.

---

## Success Metrics

- Scenario completion rate (submitted decisions / page loads)
- Debrief read rate (scroll to debrief / submitted decisions)
- Return visit rate (users who complete >1 scenario)
- Unlock code conversion (browser page visits → unlock attempts)
- Qualitative: do users report changed behavior in real experiment reviews?
