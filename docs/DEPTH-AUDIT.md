# PAL Depth Audit — 2026-06-24

Post-consolidation depth check of every practice/content component, against EVAL_RUBRICS.md. Counts are exact (grep of `id:` per data file). Verdict = THIN / OK / RICH on content depth (volume + richness per case), not whether the component should exist (that's PAL-PRODUCT-RUBRIC.md).

## Counts + verdict

| Component | Data file | Count | Verdict |
|---|---|---|---|
| SQL Lab | sqlLabProblems.js | 182 | RICH |
| Stat Foundations | statsFoundationsModules.js | 32 | RICH |
| RCA Cases | rcaCases.js | 92 | RICH |
| Analytics Cases | businessCases.js | 89 | RICH |
| Claim Checks (Stats) | statsModules.js | 80 | OK |
| Readouts (A/B Judgment) | scenarios.js | 60 | OK |
| Metrics | metricCases.js | 36 | OK |
| Estimation | estimationProblems.js | 30 | OK |
| Product Design | productDesignScenarios.js | 24 | OK |
| Metrics Foundations | metricsFoundationModules.js | 17 | OK |
| RCA Foundations | rcaFoundationModules.js | 15 | OK |
| A/B (Exp) Foundations | expFoundationModules.js | 15 | OK |
| Challenges | challengesCases.js | 16 | OK |
| Full Loop | fullLoopCases.js | 10 | OK |
| Company Tracks | companyTracks.js | 23 (was 15) | OK |
| **A/B Design** | designScenarios.js | **8** | **THIN** |
| **Spot the Flaw** | spotTheFlawCases.js | **17** | **THIN** |
| **Growth Analytics** | growthAnalyticsCases.js | **12** | **THIN** |
| **Instrumentation** | instrumentationCases.js | **12** | **THIN** |
| **Prioritization** | prioritizationScenarios.js | **12** | **THIN-ish** |
| **Interview Q&A** | interviewQA.js | **26** | **THIN** |
| **Analytics Failures** | (FailuresCatalog) | **25** | **THIN** |
| **Deep Dives (blog)** | (BlogBrowser) | **12 written / ~41 listed** | **THIN — 29 stubs** |
| MCQ Trainer | trainerMCQ.js | 36 | recall-only by design |

## The acute gaps (deferred content work — "hold depth, do UI first" decision 2026-06-24)

1. **A/B Design — 8 cases** for the most complex room in PAL. Needs ~12-15 more (metric conflicts, randomization-unit choice, guardrail tradeoffs, sample-size/power calls).
2. **Deep Dives — 29 of 41 are stubs.** This is why the Library felt empty. Fix: write the 29, OR hide/mark them "coming soon" in BlogBrowser so the page isn't 71% placeholder. (Landing now shows the honest written count, 12.)
3. **Instrumentation — 12 cases.** Needs ~10-15 (schema-design errors, ETL breakage, event validation, cross-platform tracking).
4. **Spot the Flaw — 17 brief keyed items.** Needs theory intros + 2-3 progressively harder cases per flaw family (SRM, peeking, novelty, SUTVA).
5. **Growth Analytics — 12 cases.** Needs ~8-12 more cohort/funnel/retention-decomposition scenarios.
6. Softer: Prioritization (→18-20), Interview Q&A (→40-50 with deeper answers), Analytics Failures (→40-50, ~8/category).

## Done this round (UI-first)
- Instrumentation moved DO → JUDGE/Analytics (pillar correction).
- Simulator: full rebuild (structured role rounds, model-answer self-grade, blended scorecard, control-room UI).
- Company Tracks: card visual rebuild + 8 new companies (15 → 23).
- Library: landing rebuilt (icons, honest counts). Deep Dives stub-hiding still pending (content pass).
