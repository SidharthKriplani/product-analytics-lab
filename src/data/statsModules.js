// Product Analytics Lab — Stats Room Module Data
// V1.5 — 8 modules. Every module starts with a product situation.
// No textbook definitions. No formula drills. Every concept lives inside a call.

export const statsModules = [

  // ─────────────────────────────────────────────
  // STAT01 — P-value Is Not the Decision (FREE · Foundational)
  // Trap: p < 0.05 but CI spans near-zero and guardrail is degraded
  // ─────────────────────────────────────────────
  {
    id: 'stat01-pvalue-decision',
    title: 'p < 0.05. Ship it?',
    subtitle: 'Experiment significance vs product decision',
    concept: 'p-value',
    difficulty: 'analyst',
    isFree: true,

    guestPreview: true,
    companies: ['Meta', 'Google', 'Airbnb'],
    linkedConceptIds: ['p-value', 'confidence-interval', 'guardrail-metric'],
    linkedScenarioIds: ['s01-checkout-trap'],
    linkedDesignIds: ['d01-checkout-test'],
    leadershipNote: 'A Staff analyst reframes the question before anyone looks at the p-value: what was our pre-committed decision rule, and does this readout meet it? They\'d flag that p=0.03 with a degraded guardrail and a CI spanning near-zero is a weak evidential signal, not a launch decision. The staff move is to hold the line on decision quality even when Q4 pressure says ship — and to document the pre-committed criteria so the post-mortem isn\'t a negotiation.',
    sfPrerequisites: [{ id: 'sf11', title: 'Hypothesis Testing' }, { id: 'sf10', title: 'Confidence Intervals' }],

    situation: {
      company: 'Crestline Home',
      product: 'E-commerce checkout — $55M ARR, ~42k daily checkout users',
      context: 'The team ran a 14-day test removing the upsell widget from checkout. The PM is in your Slack: "p = 0.03, we\'re significant, can we ship end of day?"',
      decisionPressure: 'Q4 starts in 72 hours. The head of growth wants a clean decision before the holiday campaign launches.',
    },

    setup: {
      metric: 'Checkout conversion rate (primary)',
      baseline: '62.4%',
      observedResult: 'Treatment: 63.8% (+1.4pp, +2.2%)',
      sampleInfo: 'n = 294,000 users per arm. p = 0.031. 95% CI: [+0.1%, +4.3%]',
      caveat: 'Secondary metric: revenue per checkout user. Treatment: $48.20 vs control $51.10 (–$2.90, p = 0.008). Page load time: treatment +340ms (p < 0.001).',
    },

    question: 'Evaluate this claim.',
    claim: '"p = 0.031 — we cleared our significance threshold. The conversion improvement is statistically confirmed and we should ship end of day."',

    options: [
      {
        id: 'a',
        label: 'Valid — p = 0.031 clears our threshold and the conversion improvement is real. Ship it.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'Statistical significance on the primary metric is one input, not the full decision. This claim ignores revenue per user (–$2.90, significantly negative) and a +340ms latency breach. Both are guardrail-level concerns that override a green primary metric. p < 0.05 tells you the effect is real — not that it\'s worth the tradeoffs. Senior analysts treat the primary metric as a filter, not a verdict: it tells you something moved, not whether the business came out ahead.',
      },
      {
        id: 'b',
        label: 'Directionally reasonable but incomplete — the conversion lift is real, but the claim doesn\'t address the revenue and latency data.',
        isCorrect: false,
        level: 'partial',
        feedback: 'The incompleteness here isn\'t just framing — it changes the decision. Revenue per user is significantly negative, meaning the upsell revenue lost outweighs the conversion gain. And the latency breach alone would block ship on its own. Calling the claim "incomplete" understates it: the missing data doesn\'t just add nuance, it fully inverts the conclusion. A ship decision made on this basis is a ship decision made on the wrong metric.',
      },
      {
        id: 'c',
        label: 'Not supported — statistical significance on conversion rate doesn\'t override a significantly negative revenue result and a +340ms latency guardrail breach.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. p < 0.05 on the primary metric means the conversion effect is real — it says nothing about whether the full decision is a ship. Revenue per checkout user captures both the conversion gain and the lost upsell revenue, and it is significantly negative. The latency breach is a separate guardrail failure with well-documented effects on checkout abandonment. Two guardrail violations mean this test fails regardless of the primary, and a clean no-ship is the right call. The business question was never "did conversion improve?" — it was "are we better off?"',
      },
      {
        id: 'd',
        label: 'Cannot conclude — conflicting signals make it impossible to evaluate this claim without more data.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'The data is not ambiguous — it is directionally clear on what matters. Revenue per user is down significantly. Latency is up significantly. These are not conflicting signals requiring more data; they are clean negative signals on the metrics that actually drive the business. "Cannot conclude" is the wrong frame when you have statistically significant evidence pointing in a clear direction. Hiding behind uncertainty is its own kind of analytical failure.',
      },
    ],

    seniorRead: {
      shortAnswer: 'Do not ship. Revenue per user is the correct primary metric for this decision, and it is significantly negative.',
      why: 'A checkout test that removes an upsell widget has two financial effects: conversion lift (people complete checkout more) and revenue loss (fewer upsells). Checkout conversion rate only measures one side. Revenue per checkout user captures both. The correct primary metric was always revenue per user — and that metric is telling you the tradeoff is not worth it.\n\nThe latency degradation is a separate concern that would trigger a no-ship on its own. +340ms on checkout is not a minor UX cost — it has well-documented effects on abandonment rates at every percentile of the speed distribution.\n\np = 0.03 on the conversion rate is correct. But statistical significance on the wrong metric is analytically meaningless for the business decision. The principle is: choose your primary metric to reflect the full value change, not just the dimension your feature was designed to move.',
      commonMistake: 'Treating "p < 0.05 on the primary metric" as the decision. Statistical significance tells you the effect is real. It says nothing about whether the effect is worth the tradeoffs. You need to read the full metric picture — including guardrails — before making a ship call. **Weak answer pattern:** The candidate says "p = 0.031 clears our threshold so the experiment succeeded" and recommends shipping without mentioning the -$2.90 revenue per user result — reading the primary metric as the full verdict rather than as one input in a multi-metric decision framework. **Interviewer follow-up that exposes it:** "Revenue per checkout user is down $2.90 with p = 0.008 — that\'s also statistically significant. Which result should drive the ship decision, and how do you reconcile two statistically significant results that point in opposite directions?"',
      interviewPhrase: '"p < 0.05 means the conversion effect is statistically distinguishable from noise — not that we should ship. I\'d look at the full revenue picture and guardrail metrics before making the call. Here, revenue per user is down significantly, which is the real business outcome."',
      connectsTo: ['design', 'review'],
    },
  },

  // ─────────────────────────────────────────────
  // STAT02 — Confidence Interval Reality Check (FREE · Foundational)
  // Trap: point estimate looks good, but CI lower bound is near zero
  // ─────────────────────────────────────────────
  {
    id: 'stat02-ci-reality',
    title: 'The +3.2% That Might Be Nothing',
    subtitle: 'Confidence intervals and downside risk',
    concept: 'confidence-interval',
    difficulty: 'analyst',
    isFree: true,
    companies: ['Airbnb', 'Booking.com', 'Stripe'],
    linkedConceptIds: ['confidence-interval', 'p-value', 'mde'],
    linkedScenarioIds: ['s01-checkout-trap'],
    linkedDesignIds: [],
    sfPrerequisites: [{ id: 'sf10', title: 'Confidence Intervals' }, { id: 'sf08', title: 'Standard Error' }],
    leadershipNote: 'Staff analysts focus on the CI lower bound first, not the point estimate. A +3.2% lift with a CI of [+0.1%, +6.3%] means the realistic downside scenario is near-zero impact — and they\'d ask whether near-zero is acceptable given the rollout risk and opportunity cost. They\'d also push for a business magnitude framing: what does +0.1% actually mean in revenue terms, and is that worth the engineering maintenance of this feature?',

    situation: {
      company: 'Meridian Health',
      product: 'Patient appointment scheduling app — 280k monthly active users',
      context: 'The team shipped a redesigned appointment booking flow two weeks ago. The PM is presenting the results to the VP: "We saw a +3.2% improvement in booking completion rate. Strong result — recommending we roll this to all users."',
      decisionPressure: 'The VP wants to announce this as a win in the quarterly all-hands next week. The PM has already drafted the announcement.',
    },

    setup: {
      metric: 'Appointment booking completion rate',
      baseline: '71.4%',
      observedResult: 'Treatment: 74.6% (+3.2pp, +4.5%)',
      sampleInfo: 'n = 18,200 users per arm. p = 0.041. 95% CI: [+0.1pp, +6.3pp]',
      caveat: 'MDE set pre-experiment at 3.0pp. Experiment ran 14 days.',
    },

    question: 'Evaluate this claim.',
    claim: '"We saw a +3.2% improvement in booking completion rate. Strong result — recommending we roll this to all users."',

    options: [
      {
        id: 'a',
        label: 'Valid — p = 0.041 is significant and the point estimate exceeds the pre-set MDE of 3.0pp. The rollout recommendation is justified.',
        isCorrect: false,
        level: 'partial',
        feedback: 'The significance and MDE framing is correct, but "strong result" materially overstates the precision. The 95% CI is [+0.1pp, +6.3pp] — the true effect could be near-zero or could be substantial. Rollout may be justified, but presenting "+3.2pp" as a precise, reliable estimate to the VP hides uncertainty that affects how much confidence leadership should carry into the all-hands announcement. The word "strong" implies stability of effect that the data does not support.',
      },
      {
        id: 'b',
        label: 'Directionally reasonable but incomplete — the effect is real and positive, but the claim presents the point estimate as more definitive than the 95% CI [+0.1pp, +6.3pp] supports.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. The direction is clear, significance is real, and rollout is defensible. But "strong result" for a CI that spans near-zero to +6.3pp oversells the precision of the estimate. The right framing for the VP: the direction is confirmed, the magnitude is genuinely uncertain (anywhere from nearly nothing to +6pp), and you\'re recommending rollout with monitoring rather than declaring a definitive win. Leaders make better downstream decisions when they understand the confidence level they\'re operating with, not just the headline number.',
      },
      {
        id: 'c',
        label: 'Not supported — a CI lower bound near zero means the effect isn\'t large enough to meaningfully impact the business. Rolling out isn\'t justified.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'Too conservative. A CI of [+0.1pp, +6.3pp] is statistically significant and the probability-weighted outcome is positive — the most likely effect is in the middle of that range, near the MDE. The MDE was 3.0pp and the point estimate is 3.2pp. "Not supported" implies rollout is unjustified, but the data clearly supports a positive, real effect in the expected direction. The issue is precision framing and communication, not the rollout decision itself.',
      },
      {
        id: 'd',
        label: 'Cannot conclude — the CI width is too large to draw any recommendation from this data.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'A wide CI is uncertainty about magnitude, not a barrier to making any recommendation. The result is statistically significant and the direction is clear. The CI tells you the effect could be small or could be large — but probability-weighted, it is positive and justifies rollout with monitoring. "Cannot conclude" is the wrong frame when you have a significant result, a positive direction, and no guardrail harms. Uncertainty about effect size is not uncertainty about whether the effect exists.',
      },
    ],

    seniorRead: {
      shortAnswer: 'Significant, directionally positive, but uncertain in magnitude. Present the full CI, not just the point estimate.',
      why: 'A 95% CI of [+0.1pp, +6.3pp] tells you: the true effect is somewhere in this range with 95% confidence. The point estimate (+3.2pp) is your best single guess, but the range captures the actual uncertainty. The lower bound being near zero means you could plausibly have a near-negligible effect. The upper bound of +6.3pp means you could have a meaningful one.\n\nThe right framing depends on who you\'re talking to and what decision they\'re making. For a VP announcing a quarterly win, the distinction between "strong result" and "positive but uncertain result" changes how they characterize the intervention to the organization. For a rollout decision, probability-weighted outcomes are positive and there is no guardrail evidence of harm — so the action is defensible. But the communication should match the uncertainty.\n\nThe principle: always report the CI alongside the point estimate. Decision-makers are entitled to understand the range, not just the middle.',
      commonMistake: 'Presenting only the point estimate. "+3.2% improvement" without the CI hides the uncertainty from decision-makers. They make decisions based on what you tell them — if you only give them the optimistic number, they will calibrate their confidence at the wrong level. **Weak answer pattern:** The candidate says "the +3.2pp improvement is strong and statistically significant at p = 0.041 — this confirms the redesign works and we should roll out" without surfacing the CI [+0.1pp, +6.3pp] to leadership, leaving them to announce a "strong result" at all-hands with far more confidence than the data warrants. **Interviewer follow-up that exposes it:** "You\'re presenting to the VP who wants to announce this at all-hands — how would you describe the magnitude of this improvement in a way that accurately reflects what the data tells us?"',
      interviewPhrase: '"Before calling this a strong result, I\'d report the full CI, not just the point estimate. A 95% CI of [+0.1pp, +6.3pp] means the effect is real but its size is genuinely uncertain. I\'d recommend rollout with monitoring rather than claiming a definitive win."',
      connectsTo: ['review'],
    },
  },

  // ─────────────────────────────────────────────
  // STAT03 — Power and MDE (FREE · Foundational)
  // Trap: "no effect" from underpowered test, team wants to rollback
  // ─────────────────────────────────────────────
  {
    id: 'stat03-power-mde',
    title: 'No Effect Found. Roll Back?',
    subtitle: 'Power, MDE, and false "no effect" reads',
    concept: 'power',
    difficulty: 'analyst',
    isFree: true,
    companies: ['Meta', 'LinkedIn', 'Google'],
    linkedConceptIds: ['power', 'mde', 'confidence-interval'],
    linkedScenarioIds: ['s08-false-rigor'],
    linkedDesignIds: [],
    sfPrerequisites: [{ id: 'sf12', title: 'Power & Effect Size' }, { id: 'sf13', title: 'Experiment Design Lab' }],
    leadershipNote: 'The staff move here is to ask the power question before the experiment runs, not after. An underpowered null result is noise, not information — and rolling back based on it is a policy error. Staff analysts also think about the opportunity cost of waiting: if the effect size is genuinely small (below MDE), the right question is whether the feature is worth maintaining regardless of significance, not whether it worked in this underpowered window.',

    situation: {
      company: 'Loopwise',
      product: 'B2B project management SaaS — 14k paying accounts',
      context: 'The team ran a 10-day test of a new in-app onboarding checklist. p = 0.21. The engineering lead wants to roll the feature back: "No significant effect after 10 days — it doesn\'t work, let\'s move on."',
      decisionPressure: 'The PM agrees. The sprint retro is tomorrow and they want to close this ticket as "no impact, deprioritized."',
    },

    setup: {
      metric: 'Week-1 activation rate (completed ≥3 core actions)',
      baseline: '38%',
      observedResult: 'Treatment: 40.1% (+2.1pp). p = 0.21. 95% CI: [–1.2pp, +5.4pp]',
      sampleInfo: 'n = 820 users per arm over 10 days.',
      caveat: 'Pre-experiment power analysis: to detect a 3pp lift at 80% power requires n = 3,200 users per arm. Current sample is 820 per arm. MDE at current sample size: ~8pp.',
    },

    question: 'Evaluate this claim.',
    claim: '"p = 0.21 — no significant effect after 10 days. The checklist feature doesn\'t work. We should roll back and move on."',

    options: [
      {
        id: 'a',
        label: 'Valid — p = 0.21 fails our significance threshold. No effect detected; rolling back is the correct call.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'This is "absence of evidence is evidence of absence" — one of the most common analytical mistakes in product work. p = 0.21 means we failed to reject the null, not that the null is true. The test ran for 10 days with n = 820 per arm — the MDE at that sample size is ~8pp. If the true effect is +2–3pp, this test was structurally incapable of detecting it, regardless of how long it ran. "No effect detected" is not the same as "no effect exists," and rolling back a feature based on an underpowered test destroys work that may actually deliver value.',
      },
      {
        id: 'b',
        label: 'Directionally reasonable but incomplete — p = 0.21 is indeed not significant, but the claim skips the power analysis that explains why.',
        isCorrect: false,
        level: 'partial',
        feedback: 'Better than treating p = 0.21 as a definitive negative, but "incomplete" understates the problem here. This claim drives a rollback decision based on a test that was never designed to detect the effect size in question. The observed +2.1pp is in the expected direction but well below the ~8pp detection threshold at this sample size. Calling it "incomplete" implies the claim could be salvaged with one more piece of information — but the actual situation is that the claim inverts the right conclusion.',
      },
      {
        id: 'c',
        label: 'Not supported — the test was underpowered. MDE at n = 820 is ~8pp, but we\'re looking for a ~3pp lift. p = 0.21 is inconclusive, not negative. Rolling back is premature.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. A power analysis is the first thing you do before interpreting a null result. The test needed 3,200 users per arm to detect a 3pp lift at 80% power. It ran with 820 — roughly a quarter of the required sample. The MDE at 820 users per arm is ~8pp, meaning any true effect smaller than 8pp is nearly invisible to this test. The 95% CI [–1.2pp, +5.4pp] is wide precisely because the test is underpowered, and that width is itself diagnostic. This is an inconclusive result, not a negative one. The right action is to re-run with n = 3,200, not discard the feature.',
      },
      {
        id: 'd',
        label: 'Cannot conclude — the sample is too small to say anything in either direction.',
        isCorrect: false,
        level: 'partial',
        feedback: '"Cannot conclude" is directionally closer to right than "roll back" — you are correctly identifying insufficient evidence. But the framing leaves the next step ambiguous. The stronger version names the mechanism: the test was underpowered for the effect size we care about, and the fix is specific. "Cannot conclude, need n = 3,200 per arm and a proper pre-registered power analysis" is the actionable version that actually helps the team know what to do next.',
      },
    ],

    seniorRead: {
      shortAnswer: 'This is an underpowered test. p = 0.21 is inconclusive, not negative. Do not roll back — re-run with adequate sample.',
      why: 'Statistical power is the probability of detecting a real effect if one exists. At 80% power with n = 3,200 per arm, you would detect a true +3pp lift 80% of the time and miss it 20% of the time. At n = 820, you are operating far below that power level — the probability of detecting a +2-3pp effect is very low even if it is real.\n\nThe MDE at the current sample size is ~8pp. The observed effect is +2.1pp. If the true effect were exactly +2.1pp, this test would miss it the overwhelming majority of the time. The "null result" is completely explained by insufficient power — it is not evidence that the feature does not work.\n\nThe CI [–1.2pp, +5.4pp] encapsulates the problem: the range is so wide that +3pp (the effect size that would justify the feature) is comfortably inside it. That width is the signature of underpowering. Senior analysts always check power before interpreting null results.',
      commonMistake: '"No significant effect" means we failed to reject the null — not that the null is true. These are not the same thing, and confusing them leads to discarding features and de-prioritizing work that may actually deliver value. **Weak answer pattern:** The candidate says "p = 0.21, no significant effect, the feature doesn\'t work — we should roll back" without checking whether the test had sufficient power to detect the effect size we actually care about, treating the null result as a negative result. **Interviewer follow-up that exposes it:** "n = 820 users per arm and p = 0.21 — before concluding the feature doesn\'t work, how many users would you need to detect a 3pp activation lift at 80% power, and why does that number matter for your interpretation?"',
      interviewPhrase: '"Before interpreting a null result, I check whether the test was powered to detect the effect size we care about. Here, the MDE at the current sample is ~8pp — we were looking for a 3pp lift. The test couldn\'t have found it even if it existed. This is an inconclusive result, not a negative one."',
      connectsTo: ['design', 'review'],
    },
  },

  // ─────────────────────────────────────────────
  // STAT04 — SRM Before Results (FREE · Foundational)
  // Trap: assignment imbalance but team wants to read lift anyway
  // ─────────────────────────────────────────────
  {
    id: 'stat04-srm-first',
    title: 'The Numbers Look Great. Check This First.',
    subtitle: 'Sample ratio mismatch before outcome reads',
    concept: 'srm',
    difficulty: 'analyst',
    isFree: true,
    companies: ['Meta', 'Airbnb', 'Microsoft'],
    linkedConceptIds: ['srm', 'randomization-unit', 'unit-of-analysis'],
    linkedScenarioIds: ['s02-ghost-assignment'],
    linkedDesignIds: ['d02-onboarding-assignment'],
    sfPrerequisites: [{ id: 'sf07', title: 'Sampling' }, { id: 'sf11', title: 'Hypothesis Testing' }],

    situation: {
      company: 'Threadline',
      product: 'B2B productivity SaaS — teams of 5–50 users, 120k seats',
      context: 'The team ran a 2-week test of a new onboarding flow. Results came in. Before reading the metrics, you\'re reviewing the assignment logs. Control: 14,820 users. Treatment: 16,340 users. The planned split was 50/50.',
      decisionPressure: 'The PM already saw the summary dashboard. Treatment shows +11% week-1 activation. They\'re in your calendar for an hour from now to discuss shipping.',
    },

    setup: {
      metric: 'Week-1 activation rate (primary)',
      baseline: '41%',
      observedResult: 'Treatment: 45.5% (+4.5pp, +11%). p = 0.001.',
      sampleInfo: 'Planned: 50/50. Actual: Control 14,820 / Treatment 16,340. Chi-square test on assignment counts: p < 0.0001.',
      caveat: 'Ratio: treatment is 52.4% of assigned users vs. expected 50.0%. Absolute SRM: +4.8pp over-assignment to treatment.',
    },

    question: 'Evaluate this claim.',
    claim: '"Treatment shows +11% week-1 activation with p = 0.001. The assignment difference is a minor data quality note, but the effect is too strong to ignore. We should ship."',

    options: [
      {
        id: 'a',
        label: 'Valid — p = 0.001 with +11% lift is strong enough that the assignment imbalance doesn\'t change the conclusion.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'Effect size does not override validity. An SRM means the assignment mechanism broke — treatment and control groups are structurally not comparable before you even look at outcomes. The +11% lift could be entirely explained by selection bias: if higher-intent users systematically ended up in treatment due to a logging bug, a redirect, or eligibility logic change, you would see exactly this pattern. A large effect from a broken experiment is not evidence of a large real effect — it is evidence of how badly selection bias can confound an estimate.',
      },
      {
        id: 'b',
        label: 'Directionally reasonable but incomplete — the activation lift looks strong, but the SRM needs investigation before the causal estimate can be trusted.',
        isCorrect: false,
        level: 'partial',
        feedback: '"Needs investigation" is the right direction, but describing SRM as a "minor data quality note" while letting the ship recommendation stand reveals a fundamental misunderstanding of what SRM means. SRM is not a data quality note — it is a validity failure that means causal inference from any metric in this experiment is structurally compromised. The right response is not "investigate and probably ship" — it is "stop reading metrics entirely until the cause of the mismatch is identified and understood."',
      },
      {
        id: 'c',
        label: 'Not supported — SRM invalidates causal inference. The +11% lift cannot be attributed to the treatment when assignment is broken. Calling this a "minor note" mischaracterizes a validity failure.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. SRM is the trust check that comes before any outcome reading. Chi-square p < 0.0001 on assignment counts is not ambiguous — the assignment mechanism failed in a statistically unmistakable way. Common causes in onboarding experiments: session-level vs. user-level assignment (same user hits the assignment code multiple times), a redirect step that fires differently for each arm, eligibility logic changes mid-experiment, or bot/spam filtering applied unequally. Until the cause is identified and understood, every metric in this experiment has an unknown confound baked in. The correct protocol: stop, diagnose, then decide whether to re-run.',
      },
      {
        id: 'd',
        label: 'Cannot conclude — the SRM makes it impossible to interpret any metrics from this experiment.',
        isCorrect: false,
        level: 'partial',
        feedback: '"Cannot conclude" reaches the right outcome but leaves the response passive and incomplete. The stronger framing explains why the claim is wrong and what action follows: SRM is an active validity failure that requires diagnosis, not just suspended judgment. A good answer to the PM includes why you cannot read the experiment (the randomization mechanism broke), what the likely causes are to investigate, and what the decision process looks like once the cause is identified.',
      },
    ],

    seniorRead: {
      shortAnswer: 'SRM is a stop sign. Read nothing. Diagnose the cause first.',
      why: 'An SRM means the randomization mechanism failed. The most common causes in onboarding experiments: session-level vs. user-level assignment (the same user hits the assignment code multiple times and ends up in both arms, creating log-level over-representation), a redirect step that only fires for one arm, eligibility logic that changed mid-experiment, or bot/spam traffic filtering applied unequally.\n\nUntil you know why the split is wrong, you do not know whether users in treatment and control are otherwise comparable on the dimensions that matter for your outcome metric. Every metric you read has an unknown confound. The +11% activation lift is as likely to be a selection artifact as a real effect — and there is no principled way to separate those two interpretations without fixing the randomization.\n\nThe senior analyst instinct: always run the SRM check before opening results dashboards. Make it the first row in the experiment QA checklist.',
      commonMistake: 'Treating SRM as a footnote or a minor data quality issue. "We\'ll just note it in the limitations." An SRM is not a limitation — it is a validity failure. The experiment did not run as designed, and any metric it produced cannot be causally interpreted. **Weak answer pattern:** The candidate says "the effect is strong at +11% with p = 0.001, so the SRM is a minor concern that doesn\'t change the conclusion" — treating a large observed effect as a reason to dismiss a validity failure rather than recognizing that an SRM is exactly how selection bias produces large spurious effects. **Interviewer follow-up that exposes it:** "You see a +11% activation lift and an SRM with p < 0.0001 in the same experiment — is it possible for both of those things to be caused by the same underlying problem, and what would that problem be?"',
      interviewPhrase: '"Before reading any metric, I run a chi-square test on the assignment counts. If SRM is confirmed, I stop there — I won\'t interpret treatment effects from a mismatched sample until I know why the split broke."',
      connectsTo: ['design', 'review'],
    },
  },

  // ─────────────────────────────────────────────
  // STAT05 — Multiple Testing Trap (BETA · Analyst)
  // Trap: 1 metric wins out of 7 without hierarchy; team celebrates
  // ─────────────────────────────────────────────
  {
    id: 'stat05-multiple-testing',
    title: 'One of Seven Metrics Is Significant',
    subtitle: 'Multiple testing and false positives',
    concept: 'multiple-testing',
    difficulty: 'analyst',
    isFree: false,
    companies: ['Meta', 'Google', 'Netflix'],
    linkedConceptIds: ['multiple-testing', 'bonferroni', 'primary-metric'],
    linkedScenarioIds: ['s06-five-metrics'],
    linkedDesignIds: ['d04-multi-metric-launch'],
    sfPrerequisites: [{ id: 'sf17', title: 'Multiple Testing' }, { id: 'sf11', title: 'Hypothesis Testing' }],

    situation: {
      company: 'Loopwise',
      product: 'B2B project management SaaS — quarterly OKR: improve 7-day retention',
      context: 'The team ran a 3-week test of a new "daily digest" email feature. Results came in. The PM sent to Slack: "Revenue per seat is significant at p = 0.04! Declaring a win — this clearly works."',
      decisionPressure: 'Board review is Friday. The PM wants to include this in the quarterly results presentation as an example of retention-driving work.',
    },

    setup: {
      metric: 'Pre-registered primary: 7-day retention. 6 secondary metrics also tracked.',
      baseline: '7-day retention: 61%',
      observedResult: 'Results across all 7 metrics: 7-day retention: +0.8pp (p=0.31), DAU/MAU: +0.4pp (p=0.44), Feature adoption: +1.1% (p=0.19), Support tickets: –2.1% (p=0.38), Session length: +22s (p=0.12), Email opens: +14% (p=0.003), Revenue per seat: +1.8% (p=0.04).',
      sampleInfo: 'n = 4,800 accounts per arm. 7 metrics tested. Primary was pre-registered as 7-day retention.',
      caveat: 'No pre-registered threshold for secondary metrics. Bonferroni correction for 7 tests: α = 0.0071 per test.',
    },

    question: 'Evaluate this claim.',
    claim: '"Revenue per seat was significant at p = 0.04. The experiment worked — one of our metrics proved the daily digest drives value."',

    options: [
      {
        id: 'a',
        label: 'Valid — revenue per seat is significant at p = 0.04 and the daily digest demonstrably drove measurable business value.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'This accepts the result at face value without accounting for the testing context. With 7 metrics tested at α = 0.05, the family-wise error rate — the probability of at least one false positive by chance alone — is approximately 30%. Revenue per seat at p = 0.04 is squarely in the range you would expect from random variation across this many tests. More critically, the pre-registered primary metric was 7-day retention, and it is not significant. A secondary metric lighting up does not rescue an experiment that failed on its stated hypothesis.',
      },
      {
        id: 'b',
        label: 'Directionally reasonable but incomplete — revenue per seat is significant, but the claim doesn\'t address whether that result survives multiple testing correction.',
        isCorrect: false,
        level: 'partial',
        feedback: 'Flagging the multiple testing gap is the right instinct, but \"incomplete\" undersells the structural problem. Revenue per seat at p = 0.04 does not survive Bonferroni correction for 7 tests, which requires α = 0.0071 per test. The pre-registered primary metric — 7-day retention — is not significant. This is not a claim that needs a footnote or a caveat. It is a claim that inverts the correct conclusion, and cherry-picking a secondary is the precise mechanism by which false wins enter the product roadmap.',
      },
      {
        id: 'c',
        label: 'Not supported — cherry-picking a secondary metric from 7 tests without correction is exactly what produces false wins by chance. The pre-registered primary (7-day retention) is not significant.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. With 7 metrics at α = 0.05, you expect roughly 0.35 false positives per experiment by chance alone — meaning in every three experiments like this, about one will produce a spurious secondary win purely from noise. Revenue per seat at p = 0.04 does not survive Bonferroni correction (threshold: α = 0.0071). The pre-registered primary, 7-day retention, was the pre-committed success criterion, and it failed cleanly at p = 0.31. A secondary metric that lights up without correction is a hypothesis for the next experiment, not evidence that the feature works. Building the board presentation on this finding would be analytically indefensible.',
      },
      {
        id: 'd',
        label: 'Cannot conclude — with conflicting signals across 7 metrics, the data is too noisy to evaluate whether the daily digest drove value.',
        isCorrect: false,
        level: 'wrong',
        feedback: '\"Cannot conclude\" is the wrong frame here — the evidence is directionally clear once you apply the right framework. The pre-registered primary (7-day retention) is not significant. The one secondary metric that crossed p = 0.05 does not survive correction for multiple tests. The signals are not conflicting; they are consistent with the experiment failing on its stated hypothesis. Saying \"cannot conclude\" implies we need more data, when the real answer is that we need to stop treating a cherry-picked p = 0.04 as meaningful evidence.',
      },
    ],

    seniorRead: {
      shortAnswer: 'The experiment failed. The pre-registered primary metric is not significant. A single secondary result at p=0.04 across 7 tests is noise.',
      why: 'Multiple testing is one of the most reliable sources of false wins in product experimentation, precisely because it produces results that look like genuine findings. With 7 metrics at α=0.05, the family-wise error rate is approximately 1 − (0.95)^7 ≈ 30%. Revenue per seat at p=0.04 is exactly what chance noise looks like in this setup.\n\nThe solution is not to test fewer metrics — good experiment instrumentation tracks many things. The solution is pre-registration: commit to one primary metric before the data is unblinded. If the primary fails, the experiment fails. Secondary metrics that light up are hypotheses for the next experiment, logged and tracked, but never shipped on.\n\nThe Bonferroni correction for 7 tests is α=0.0071 per test. Revenue per seat at p=0.04 fails that threshold by a factor of 5. The board presentation would be built on a statistically indefensible claim.',
      commonMistake: '"We saw a significant result across our metrics" treats one finding among many as evidence of effectiveness. The more metrics you measure, the higher the probability that at least one will cross the significance threshold by chance. This is why pre-registering the primary metric is essential, not optional. **Weak answer pattern:** The candidate says "revenue per seat is statistically significant at p = 0.04 and the experiment showed the daily digest creates real business value" — cherry-picking from 7 tested metrics without correcting for multiple comparisons or noting that the pre-registered primary (7-day retention) was not significant. **Interviewer follow-up that exposes it:** "You tested 7 metrics and the pre-registered primary didn\'t move — how does that affect your interpretation of revenue per seat being significant at p = 0.04, and what\'s the family-wise error rate across those 7 tests?"',
      interviewPhrase: '"I\'d pre-register one primary metric before the test runs. If the primary isn\'t significant, the experiment failed, regardless of what the secondaries show. A secondary result is a hypothesis for the next experiment."',
      connectsTo: ['design', 'review'],
    },
  },

  // ─────────────────────────────────────────────
  // STAT06 — Guardrail Breach (BETA · Analyst)
  // Trap: primary wins, PM wants to ship, guardrail is degraded
  // ─────────────────────────────────────────────
  {
    id: 'stat06-guardrail-breach',
    title: 'The Primary Won. The Guardrail Didn\'t.',
    subtitle: 'Primary wins blocked by guardrail harm',
    concept: 'guardrail-metric',
    difficulty: 'analyst',
    isFree: false,
    companies: ['Spotify', 'Uber', 'LinkedIn'],
    linkedConceptIds: ['guardrail-metric', 'p-value', 'primary-metric'],
    linkedScenarioIds: ['s03-slow-tax'],
    linkedDesignIds: [],
    sfPrerequisites: [{ id: 'sf11', title: 'Hypothesis Testing' }, { id: 'sf20', title: 'Practical vs Statistical Significance' }],

    situation: {
      company: 'Vantage Analytics',
      product: 'B2B analytics platform — 8,200 paying users, enterprise contracts',
      context: 'The team tested a new AI-powered dashboard generation feature. Primary metric: report creation rate (reports created per active user per week). Pre-committed guardrails: p99 load time (threshold: no degradation beyond +200ms), error rate (threshold: no increase).',
      decisionPressure: 'The PM is excited: "Primary metric is up +18%, p < 0.001. This is our biggest win this quarter. Ship it."',
    },

    setup: {
      metric: 'Report creation rate (primary) + pre-committed guardrails',
      baseline: 'Report creation rate: 2.1 reports/user/week. p99 load time: 1,840ms. Error rate: 0.4%.',
      observedResult: 'Report creation rate: +18.3% (p < 0.001). 95% CI: [+13.1%, +23.5%]. p99 load time: 2,390ms (+550ms, p < 0.001). Error rate: 0.6% (+0.2pp, p = 0.031).',
      sampleInfo: 'n = 3,800 users per arm. 21-day test.',
      caveat: 'Pre-committed guardrail thresholds: load time ≤ +200ms, error rate no increase (any degradation blocks ship). Both guardrails are breached.',
    },

    question: 'Evaluate this claim.',
    claim: '"The primary metric improved +18%, which is large enough that the performance impact is acceptable. We should ship."',

    options: [
      {
        id: 'a',
        label: 'Valid — a +18% primary improvement is large enough that absorbing a performance cost is a reasonable product tradeoff.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'This treats guardrail thresholds as part of a cost-benefit negotiation, which is exactly what pre-committed thresholds are designed to prevent. The +200ms load time threshold and zero-error-rate-increase threshold were committed before the experiment ran — meaning the team already made the tradeoff judgment in advance and encoded it as a hard rule. P99 load time is up +550ms (2.75x the threshold) and error rate is significantly higher. Both conditions pre-defined as blocking are breached, and the primary metric size does not change that. The purpose of pre-commitment is precisely to protect decisions from being rationalized away after a compelling primary result appears.',
      },
      {
        id: 'b',
        label: 'Directionally reasonable but incomplete — the primary metric win is real, but the claim doesn\'t acknowledge that both guardrails were pre-committed as blocking conditions.',
        isCorrect: false,
        level: 'partial',
        feedback: 'The incompleteness here is not a framing issue — it changes the decision entirely. Pre-committed guardrails are not observations to weigh against primary metrics; they are conditions that, if breached, block ship regardless of the primary result. Calling this "incomplete" implies the decision is still open to further deliberation. It is not. Both guardrails are breached beyond threshold, and the analytical job is to name that clearly and explain what needs to happen before a ship decision is revisited.',
      },
      {
        id: 'c',
        label: 'Not supported — pre-committed guardrails are blocking conditions, not cost-benefit inputs. Both are breached well beyond threshold: p99 load time +550ms vs. +200ms limit, error rate statistically significantly higher.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. The logic of the claim — that the primary metric win is "large enough" to accept performance degradation — fundamentally misunderstands what guardrails are for. They are pre-committed precisely so that compelling primary results cannot rationalize them away. A +550ms p99 regression in an enterprise B2B platform is a material reliability failure for the worst-served users, and enterprise technical buyers will notice. An increased error rate creates SLA exposure that compounds over time. The feature direction is validated by the +18% primary result; the feature itself requires performance engineering work before ship. This is a clear no-ship with a defined remediation path, not an ambiguous tradeoff decision.',
      },
      {
        id: 'd',
        label: 'Cannot conclude — the conflicting signals between primary improvement and guardrail degradation make this too close to call without more context.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'The signals are not conflicting — they are decisive once you understand what guardrails are. Pre-committed blocking thresholds exist so that "cannot conclude" is never the correct response when they are breached. Both thresholds were violated. The answer is not ambiguity — it is a clear no-ship with a defined and actionable path forward: fix the performance regression and error rate, then re-run the evaluation. Framing this as "too close to call" is exactly the kind of analytical equivocation that guardrails are designed to prevent.',
      },
    ],

    seniorRead: {
      shortAnswer: 'Do not ship. Pre-committed guardrails are blocking conditions, not suggestions. Both are breached.',
      why: 'Guardrails exist to protect the things you would regret losing even if the primary metric wins. A +30% p99 load time degradation in an enterprise B2B tool is a significant reliability regression — enterprise technical buyers notice latency changes and often have contractual SLA expectations. An increased error rate, even 0.2pp, is a quality signal that compounds into support volume and churn risk over time.\n\nThe feature direction is validated — users create more reports when the AI tool is available. The business judgment: invest in performance optimization, then ship. The primary result is not going anywhere while engineering addresses the latency. Do not let the pressure to declare a win short-circuit the quality bar that the team set before the data existed. That quality bar was set at a moment of clear judgment, before incentives pushed toward shipping.',
      commonMistake: 'Treating guardrails as suggestions when the primary metric is compelling. "The effect is big enough to absorb some performance cost" is exactly the rationalization guardrails are designed to prevent. Pre-committed thresholds have no meaning if they can be overridden whenever the primary looks good. The value of the guardrail is precisely that it removes the negotiation from the post-hoc analysis. **Weak answer pattern:** The candidate says "a +18% report creation rate is large enough that we can accept some performance cost — we should ship with a plan to fix the latency in the next sprint" — treating the pre-committed guardrail threshold as a starting point for negotiation rather than a hard stop, and proposing to ship with known violations against the team\'s own pre-experiment commitments. **Interviewer follow-up that exposes it:** "You pre-committed to no load time degradation beyond +200ms before the experiment ran — now it\'s +550ms. Why did you set that threshold before the experiment, and does that reasoning still apply now that you can see the primary metric result?"',
      interviewPhrase: '"A guardrail breach changes the decision, not just the confidence level. I defined this threshold before the data existed. Both guardrails are breached — I won\'t override that because the primary looks good."',
      connectsTo: ['design', 'review'],
    },
  },

  // ─────────────────────────────────────────────
  // STAT07 — Novelty Effect (BETA · Analyst)
  // Trap: early lift fades by week two, team wants to ship on week-1 data
  // ─────────────────────────────────────────────
  {
    id: 'stat07-novelty-effect',
    title: 'The Feature That Peaked on Day One',
    subtitle: 'Novelty effects and durability risk',
    concept: 'novelty-effect',
    difficulty: 'analyst',
    isFree: false,
    companies: ['TikTok', 'Instagram', 'Twitter'],
    linkedConceptIds: ['novelty-effect', 'confidence-interval', 'right-censoring'],
    linkedScenarioIds: ['s04-week-two-drop'],
    linkedDesignIds: [],
    sfPrerequisites: [{ id: 'sf18', title: 'Regression to the Mean' }, { id: 'sf11', title: 'Hypothesis Testing' }],

    situation: {
      company: 'Pulse Social',
      product: 'Consumer social platform — 4.2M MAU, content engagement focus',
      context: 'The team tested a new "Reactions 2.0" feature — 12 emoji reactions replacing the previous 5. After 7 days, the PM flagged it: "Engagement is through the roof — +22% reaction rate. Let\'s ship before we lose momentum."',
      decisionPressure: 'A competitor launched a similar feature last month. The CEO is asking why we haven\'t shipped yet. The PM wants to call this a win and move fast.',
    },

    setup: {
      metric: 'Reaction rate (reactions per post viewed)',
      baseline: '8.4 reactions per 100 post views',
      observedResult: 'Week 1: Treatment +22.1% (p < 0.001). Week 2 (first 4 days): Treatment +6.8% (p = 0.041).',
      sampleInfo: 'n = 280,000 users per arm. 11 days of data. Week 1: days 1–7. Week 2 partial: days 8–11.',
      caveat: 'Week-over-week treatment effect: Day 1–3: +31%. Day 4–7: +18%. Day 8–11: +7%. Trend is clearly declining. No week-3 data yet.',
    },

    question: 'Evaluate this claim.',
    claim: '"Week 1 shows +22% reaction rate, statistically significant at p < 0.001. This proves the Reactions 2.0 feature creates durable engagement."',

    options: [
      {
        id: 'a',
        label: 'Valid — p < 0.001 on week 1 with n = 280,000 per arm is definitive. Reactions 2.0 creates durable engagement.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'Statistical significance tells you the week-1 aggregate effect is real — not that it will persist. The week-over-week breakdown is the actual diagnostic: Day 1–3 at +31%, Day 4–7 at +18%, Day 8–11 at +7%. This is a steep and consistent novelty decay curve, not evidence of durable behavior change. If the trend continues at this rate, week 3 could be near zero. Large n and p < 0.001 mean the measurement is precise — they say nothing about whether the effect is durable. Precision and durability are entirely different properties, and conflating them is a common source of premature ships.',
      },
      {
        id: 'b',
        label: 'Directionally reasonable but incomplete — the reaction rate is up, but "durable" cannot be concluded from 7-day data with a steep week-over-week decay pattern.',
        isCorrect: false,
        level: 'partial',
        feedback: 'Identifying that "durable" is unproven is the right instinct. But the decay pattern is not just a gap in the evidence — it is actively inconsistent with the durability claim. Day 1–3 at +31% declining to Day 8–11 at +7% in 11 days is the textbook signature of novelty-driven engagement, not behavioral adoption. The claim isn\'t incomplete; it makes a positive assertion ("proves durable") that the observed decay pattern directly contradicts. This is stronger than a framing problem: it is a claim that the available data falsifies.',
      },
      {
        id: 'c',
        label: 'Not supported — the declining week-over-week pattern (Day 1–3: +31%, Day 4–7: +18%, Day 8–11: +7%) is inconsistent with durable behavior. Week 1 aggregate masks novelty decay.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. "Durable engagement" requires that users adopt a genuinely new behavioral pattern, not just explore a new feature out of curiosity. The decay curve — +31% to +18% to +7% over 11 days — is the classic novelty arc. Week-1 aggregate hides this decay by averaging the high-novelty early days with the declining later ones, making the feature look stronger than its sustained effect warrants. Without at least 3–4 weeks of data showing the treatment effect stabilizing at a positive, statistically significant level, the durability claim is not supported. The direction of the effect may be positive long-run, but "proves durable" is a categorically higher evidentiary bar than "showed a lift in week 1."',
      },
      {
        id: 'd',
        label: 'Cannot conclude — 11 days of data is insufficient to evaluate whether engagement is durable or not.',
        isCorrect: false,
        level: 'wrong',
        feedback: '\"Cannot conclude\" understates what the data shows. Eleven days of declining week-over-week data is not just insufficient for a positive conclusion — it is active evidence against the durability claim specifically. The decay pattern is observable and interpretable right now. The right framing is not "we don\'t know yet" but rather "the pattern we see is inconsistent with durable engagement, and we need more time to determine whether it stabilizes at a meaningful positive level." That is a more specific and more actionable claim that tells the PM exactly what to monitor and when to revisit.',
      },
    ],

    seniorRead: {
      shortAnswer: 'Novelty effect. The declining week-over-week pattern is the story. Run 2–3 more weeks before deciding.',
      why: 'Novelty effects are one of the most common and most dangerous traps in engagement feature experimentation. Users engage more with anything new — the curiosity behavior is well-documented in behavioral literature and in product analytics practice. The decay pattern here (+31% → +18% → +7% over 11 days) is steep, consistent, and structurally incompatible with the interpretation that users are forming new habits.\n\nFor an engagement feature on a social platform, the fundamental question is: does this feature create new behavioral patterns that persist, or does it just satisfy a curiosity impulse that extinguishes quickly? Habits take 3–6 weeks to form. Week-1 data on an engagement feature is almost always contaminated by novelty, and treating it as representative of the long-run effect is a systematic bias toward false wins.\n\nThe right approach: plot treatment effect by week from exposure. If the effect stabilizes above baseline at weeks 3–4, that stable level is your long-run effect estimate. If it continues declining, you have a novelty effect. The week-1 aggregate is a misleading summary statistic for features in the behavioral-change category.',
      commonMistake: 'Treating week-1 aggregate results as the effect estimate for engagement or habit-forming features. Aggregate data obscures temporal decay — the week-1 average combines the high-novelty first days with the declining later days, producing an inflated estimate. Always plot treatment effect by week-of-exposure for engagement tests. If you see consistent week-over-week decay, wait for stabilization before declaring a result. **Weak answer pattern:** The candidate says "p < 0.001 with n = 280,000 — the +22% reaction rate is a definitively confirmed result and proves durable engagement" without looking at the week-over-week breakdown, treating statistical precision as evidence of durability. **Interviewer follow-up that exposes it:** "Day 1-3 shows +31%, Day 4-7 shows +18%, Day 8-11 shows +7% — what does that pattern tell you about the week-1 aggregate of +22%, and what additional data would you need before claiming the feature creates durable engagement?"',
      interviewPhrase: '"For engagement features, I\'d look at the week-over-week treatment effect, not just the aggregate. A decaying pattern is diagnostic of novelty. The real test is: what does the effect look like in week 3 and 4?"',
      connectsTo: ['review'],
    },
  },

  // ─────────────────────────────────────────────
  // STAT08 — Interference / SUTVA (BETA · Senior)
  // Trap: marketplace treatment affects control through shared supply
  // ─────────────────────────────────────────────
  {
    id: 'stat08-sutva-interference',
    title: 'The Experiment That Contaminated Itself',
    subtitle: 'Interference and contaminated control groups',
    concept: 'sutva',
    difficulty: 'senior',
    isFree: false,
    companies: ['Uber', 'Lyft', 'DoorDash'],
    linkedConceptIds: ['sutva', 'randomization-unit', 'unit-of-analysis'],
    linkedScenarioIds: ['s07-two-sided-spill'],
    linkedDesignIds: [],
    sfPrerequisites: [{ id: 'sf07', title: 'Sampling' }, { id: 'sf19', title: 'Selection Bias & Survivorship' }],

    situation: {
      company: 'Fareway',
      product: 'Two-sided home services marketplace — connects homeowners (demand) with service providers (supply)',
      context: 'The team tested a new "Instant Book" feature for buyers that eliminates the back-and-forth scheduling step. 50% of buyers got Instant Book. Results: treatment buyers completed 18% more bookings. The team wants to ship.',
      decisionPressure: 'The booking rate improvement is the largest ever seen on the platform. Growth team is eager. CEO is asking if this can be announced at the next all-hands.',
    },

    setup: {
      metric: 'Booking completion rate per buyer (primary)',
      baseline: '34% of initiated conversations ended in a booking',
      observedResult: 'Treatment buyers: 40.1% booking rate (+18%). p < 0.001. 95% CI: [+14%, +22%]. Treatment-side sellers (serving treatment buyers): 48.2% inquiry-to-booking conversion (+19% vs. 40.5% for control-side sellers). Control-side sellers: −11.4% booking conversion vs. pre-test. Platform-level booking rate: 36.9% (+2.8%, p = 0.41, not significant).',
      sampleInfo: 'n = 22,000 buyers per arm. 21-day test. Buyer-level randomization. Sellers were not randomized — all sellers saw both treatment and control buyers.',
      caveat: 'Average seller utilization in treatment arm during test: 87% (near capacity). In control arm: 71%. Pre-test seller utilization: ~74%. Treatment-side sellers received +28% more buyer inquiries than control-side sellers during the test.',
    },

    question: 'Evaluate this claim.',
    claim: '"Treatment sellers showed +19% conversion lift versus control sellers. The incentive feature caused the improvement."',

    options: [
      {
        id: 'a',
        label: 'Valid — treatment sellers demonstrated +19% higher conversion than control sellers. The incentive feature caused the improvement.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'The +19% treatment seller lift is real as a measured difference — but the causal claim requires that treatment and control sellers were independent. They weren\'t. Buyers were routed preferentially toward treatment sellers, and control sellers simultaneously saw a -11.4% conversion decline. Platform-level conversion is up only +2.8% and not significant. The "improvement" in treatment is substantially displacement from control, not net value creation.',
      },
      {
        id: 'b',
        label: 'Directionally reasonable but incomplete — treatment sellers did perform better, but the claim doesn\'t acknowledge that control sellers were negatively impacted.',
        isCorrect: false,
        level: 'partial',
        feedback: 'Noting the control seller decline is a step in the right direction, but the core problem runs deeper than an incomplete accounting. SUTVA is violated because buyers were shared between treatment and control sellers — meaning the two groups weren\'t independent units. The treatment seller lift and control seller drop are two sides of the same reallocation. The platform-level result (+2.8%, not significant) is the only uncontaminated signal, and it shows no meaningful improvement.',
      },
      {
        id: 'c',
        label: 'Not supported — the treatment seller lift looks strong, but control seller conversion dropped -11.4% simultaneously. This pattern indicates buyer displacement, not a causal feature effect.',
        isCorrect: false,
        level: 'partial',
        feedback: 'Identifying the displacement signal is good analytical instinct. But the stronger framing names the mechanism: this is a SUTVA violation. Buyers were randomized at the buyer level while sellers served both arms — meaning treatment and control units weren\'t independent. The causal inference framework requires stable unit treatment values, which breaks down when shared supply mediates outcomes. This isn\'t just a confound to note; it invalidates the causal claim entirely.',
      },
      {
        id: 'd',
        label: 'Cannot conclude — SUTVA is violated because treatment and control sellers shared the same buyer pool. Treatment gained conversions because buyers were routed away from control. The lift is displacement, not a causal platform effect.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. The Stable Unit Treatment Value Assumption requires that a unit\'s outcome is unaffected by other units\' treatment assignment. Here, buyers flowed between treatment and control sellers — violating independence. Treatment sellers got more buyer inquiries (+28.1%), consumed more of the shared buyer pool, and control sellers were left with fewer engaged buyers. The platform-level result (+2.8%, not significant) is the uncontaminated signal: no meaningful net improvement. Causal inference requires a design that isolates supply — geo-holdout or switchback.',
      },
    ],

    seniorRead: {
      shortAnswer: 'SUTVA violated. Sellers served both arms, creating supply spillover. The +18% is not a valid platform-level estimate.',
      why: 'The Stable Unit Treatment Value Assumption requires that one unit\'s outcome is unaffected by another unit\'s treatment assignment. In a two-sided marketplace, this almost never holds when only one side is randomized — because the two sides share a resource (seller capacity) that transmits treatment effects across arms.\n\nHere: treatment buyers booked faster → they consumed more seller capacity → control buyers competed for depleted capacity → control booking rate was suppressed. The \"treatment effect\" is partly a between-arm supply redistribution, not a net platform gain. The seller utilization gap (87% treatment vs. 71% control) directly quantifies the interference mechanism — treatment buyers absorbed 16pp more of seller availability.\n\nAt platform scale — where all buyers are in treatment — seller utilization returns to a single baseline level, and the booking rate for all buyers would be somewhere between the two arms\' observed rates. The experiment simultaneously inflates the treatment estimate and suppresses the control estimate.\n\nValid designs for two-sided marketplace experiments: geo-holdout (randomize by geography so supply and demand are isolated within each cell), switchback/time-series design (alternate all buyers between treatment and control in time blocks so seller capacity is shared equally across conditions), or cluster-level randomization by seller with holdout DiD.',
      commonMistake: 'Running buyer-side user-level A/B tests in two-sided marketplaces and interpreting the arm-level result as a platform-level causal effect. When buyers share seller capacity across treatment and control arms, the treatment estimate is inflated and the control is suppressed simultaneously — the experiment measures supply redistribution, not net value creation. Two-sided markets with shared supply require designs that isolate the two sides from each other. **Weak answer pattern:** The candidate says "treatment sellers showed +19% conversion which confirms the Instant Book feature drives genuine seller quality improvement" without checking whether control sellers declined simultaneously — interpreting the treated group\'s improvement as evidence of net platform value creation when it may be entirely displacement. **Interviewer follow-up that exposes it:** "Control-side sellers (serving control buyers) saw -11.4% booking conversion during the same experiment — what does that tell you about the +19% treatment seller lift, and why does it matter that sellers served both treatment and control buyers?"',
      interviewPhrase: '"In a two-sided marketplace, user-level A/B testing on the demand side is structurally compromised if supply isn\'t isolated. Treatment buyers consuming more seller capacity depresses the control. I\'d use geo-holdouts or switchback design instead."',
      connectsTo: ['review'],
    },
  },

  // ─────────────────────────────────────────────
  // STAT09 — CUPED / Variance Reduction (Advanced)
  // Trap: post-hoc CUPED on a failed test reframes p=0.12 as p=0.031
  // ─────────────────────────────────────────────
  {
    id: 'stat09-cuped-variance',
    title: 'Same Experiment, Half the Sample Size Needed',
    subtitle: 'CUPED and variance reduction',
    concept: 'cuped',
    difficulty: 'staff',
    isFree: false,
    companies: ['Booking.com', 'Airbnb', 'Shopify'],
    linkedConceptIds: ['cuped', 'variance-reduction', 'p-value', 'pre-registration'],

    situation: {
      company: 'Fenwick Commerce',
      product: 'E-commerce recommendation widget — A/B testing revenue per user',
      context: 'The experiment team ran a 4-week test on the recommendation widget and got p = 0.12 — not significant. A senior analyst suggests re-analyzing with CUPED using pre-experiment revenue as a covariate. After the CUPED adjustment, p = 0.031 on the same data. The team is excited.',
      decisionPressure: 'The head of product wants to declare this a win and ship the widget. The analyst says the CUPED result is the right one to use.',
    },

    setup: {
      metric: '7-day revenue per user (primary)',
      baseline: '$12.40',
      observedResult: 'Treatment: $12.91 (+4.1%). p_raw = 0.12. p_cuped = 0.031.',
      sampleInfo: 'n = 45,000 per arm. Pre-experiment revenue correlation with test-period revenue: 0.68.',
      caveat: 'CUPED was applied after the raw result was known. No pre-registered analysis plan specifying CUPED was filed before the experiment launched.',
    },

    question: 'Evaluate this claim.',
    claim: '"CUPED found a significant effect that the raw analysis missed. The recommendation widget is working — we should ship."',

    options: [
      {
        id: 'a',
        label: 'Valid — CUPED is a legitimate variance reduction technique and p = 0.031 is significant. Ship it.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'CUPED is legitimate, but the claim skips the most important question: was it pre-specified? Applying CUPED after seeing p = 0.12 is a form of post-hoc analysis shopping — you are choosing your analysis method based on which one gives you significance. With a correlation of 0.68 between pre- and post-period revenue, CUPED reduces variance by roughly 46%, which is why the p-value shifted so dramatically. That power increase is only valid if the method was committed to before the data was unblinded. Using it retrospectively inflates Type I error in exactly the same way that peeking at results does.',
      },
      {
        id: 'b',
        label: 'Valid with caveat — CUPED is a sound technique, but applying it post-hoc to a failed test requires pre-registration or strong methodological justification to avoid inflated Type I error.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. CUPED is not cherry-picking — it is a principled variance reduction method with a solid theoretical foundation. The correlation of 0.68 between pre- and post-period revenue makes it exceptionally powerful here, reducing variance by ~46% and explaining the dramatic p-value shift from 0.12 to 0.031. If the analysis plan specified CUPED before launch, this is a clean result and the ship decision is defensible. If it was applied after seeing the raw result, the p-value is no longer calibrated — you have introduced researcher degrees of freedom and the result needs holdout validation or external review before acting on it.',
      },
      {
        id: 'c',
        label: 'Invalid — switching analysis methods after seeing results always inflates Type I error regardless of which method you switch to.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'This is too absolute. CUPED that was pre-registered before the experiment launched is completely valid — the method of analysis does not inherently inflate error, only the timing of the decision to use it. If a team always applies CUPED to revenue experiments as a standing policy, applying it here is not inflation. The problem is specifically retrospective selection: choosing CUPED because it produced significance. The method itself is not the issue; the decision process is.',
      },
      {
        id: 'd',
        label: 'Cannot determine — need to see the CUPED formula applied correctly before evaluating this claim.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'The issue here is methodological and procedural, not computational. Whether the CUPED math was executed correctly is not the primary question — the question is whether applying a more powerful analysis after observing a non-significant result is a valid practice. Asking to verify the formula sidesteps the core concern entirely. Even perfectly executed CUPED, chosen after seeing p = 0.12, does not give you a calibrated p-value.',
      },
    ],

    seniorRead: {
      shortAnswer: 'CUPED is a variance reduction technique, not a second chance at significance. The key question is whether it was pre-specified.',
      why: 'CUPED (Controlled-experiment Using Pre-Experiment Data) works by regressing out variance in the outcome metric that is explained by a pre-period covariate. With a pre-to-post correlation of 0.68, the variance reduction is approximately 1 − 0.68² ≈ 46%. That is why p drops from 0.12 to 0.031 — it is equivalent to having run the experiment with roughly double the effective sample size. This is a legitimate and widely used technique at companies like Microsoft, Netflix, and Booking.com. The power gain is real and correct when pre-specified.\n\nThe danger is using it as an analytical escape hatch. If your standing practice is to run CUPED on revenue experiments, document that before the experiment launches. If a senior analyst proposes it after seeing the raw result fail, you have a researcher-degree-of-freedom problem — you are selecting your method based on the outcome it produces. The p-value of 0.031 in that scenario is not calibrated to α = 0.05.\n\nThe right path forward: if CUPED was not pre-specified, treat p = 0.031 as an exploratory finding. Run a holdout on a separate cohort using CUPED as the pre-registered analysis method. If that replicates, you have a valid result. If the team wants to ship on the current data, they need to acknowledge the methodological limitation explicitly and accept the elevated false positive risk.',
      commonMistake: 'Treating CUPED as a "better" analysis that supersedes the pre-registered method. Variance reduction is only valid when the choice of whether to apply it was made independently of the data. Post-hoc method switching is p-hacking with extra steps, regardless of how principled the method itself is. **Weak answer pattern:** The candidate says "CUPED is a legitimate and widely used variance reduction technique, the correlation of 0.68 is strong, and the p-value is now significant — we should ship" without flagging that the CUPED was applied after seeing the raw result fail, which means the significance threshold is no longer calibrated. **Interviewer follow-up that exposes it:** "If the team always ran CUPED on every revenue experiment from the start, would this result be valid? And does your answer change if the team only decided to run CUPED after seeing p = 0.12?"',
      interviewPhrase: '"CUPED is a powerful and legitimate tool when pre-specified. The correlation of 0.68 here means roughly 46% variance reduction — that\'s why the p-value moved so much. But if we applied it after seeing p = 0.12, the result needs holdout validation before we ship on it."',
      connectsTo: ['design', 'review'],
    },
  },

  // ─────────────────────────────────────────────
  // STAT10 — Novelty Effect (Intermediate)
  // Trap: +8% in week 1 collapses to +1.2% (p=0.21) by week 4
  // ─────────────────────────────────────────────
  {
    id: 'stat10-novelty-effect',
    title: 'Week 1: +8%. Week 4: +1.2%. What Happened?',
    subtitle: 'Novelty effect and long-run metric stability',
    concept: 'novelty-effect',
    difficulty: 'senior',
    isFree: false,
    companies: ['Netflix', 'YouTube', 'Duolingo'],
    linkedConceptIds: ['novelty-effect', 'confidence-interval', 'p-value'],
    linkedScenarioIds: [],
    linkedDesignIds: [],
    sfPrerequisites: [{ id: 'sf21', title: 'Counterfactuals & Causal Inference' }, { id: 'sf11', title: 'Hypothesis Testing' }],

    situation: {
      company: 'Prism Learning',
      product: 'Edtech platform — personalized lesson recommendation feature',
      context: 'The team ran a new personalized lesson recommendation feature. Week 1 showed +8% completion rate with p < 0.001. The team was about to ship when a senior analyst said "wait — let\'s see week 4." Week 4 shows +1.2%, p = 0.21. The PM wants to know what happened and whether to ship.',
      decisionPressure: 'The PM is frustrated. The week-1 result looked like a clear win. Stakeholders were briefed. The analyst is now blocking the ship based on week-4 data.',
    },

    setup: {
      metric: 'Lesson completion rate (primary)',
      baseline: '31%',
      observedResult: 'Week 1 treatment: 33.5% (+8%, p < 0.001). Week 4 treatment: 31.4% (+1.2%, p = 0.21).',
      sampleInfo: 'n = 28,000 per arm per week.',
      caveat: 'Week-over-week treatment effect is declining consistently from week 1 through week 4.',
    },

    question: 'Evaluate this claim.',
    claim: '"The feature had a real positive effect in week 1. The week 4 result just means users adapted and the effect normalized — we should ship since there\'s still a directional positive trend."',

    options: [
      {
        id: 'a',
        label: 'Valid — any positive directional trend supports shipping.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'A directional positive trend is not a sufficient basis for shipping when the statistical test cannot distinguish that direction from zero. p = 0.21 at week 4 means that a +1.2% result is well within the range of noise. With n = 28,000 per arm, this experiment has sufficient power to detect meaningful effects — if the effect were real and persistent at +1.2%, you would expect a tighter p-value. "Directional" is not a substitute for "real."',
      },
      {
        id: 'b',
        label: 'Valid with caution — the week 1 effect was real, but the week 4 result (p = 0.21) means we cannot distinguish +1.2% from zero. The novelty hypothesis needs more investigation before shipping.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. The week 1 result is real — p < 0.001 with large sample size is not noise. The question is what it measured. A sharp decline from +8% to +1.2% over four weeks, ending at a non-significant result, is the hallmark pattern of novelty-driven engagement: users interact more with new features out of curiosity, then revert toward baseline as the novelty wears off. The week 4 result being non-significant means the long-run effect is statistically indistinguishable from zero. Shipping on the assumption that the week-4 effect is "real but small" requires evidence that the effect has stabilized, which you do not have.',
      },
      {
        id: 'c',
        label: 'Invalid — the true long-run effect is zero since week 4 is not significant.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'Too definitive in the opposite direction. p = 0.21 means you cannot reject the null — it does not prove the null is true. The true long-run effect could be small but nonzero, or it could be zero. The wide CI at week 4 captures this uncertainty. The correct framing is that you lack sufficient evidence to distinguish +1.2% from zero, not that the effect is proven to be zero. Absence of statistical significance is not absence of effect.',
      },
      {
        id: 'd',
        label: 'Valid — +1.2% at scale has real business value even if not statistically significant.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'This confuses practical significance with statistical noise. At n = 28,000 per arm, a p-value of 0.21 means the +1.2% observed result is well within sampling variability — you cannot confidently attribute it to the feature. Practical significance arguments are only meaningful when the effect is statistically distinguishable from zero. Citing scale to justify shipping a non-significant result is a form of motivated reasoning that bypasses the evidential standard the experiment was designed to enforce.',
      },
    ],

    seniorRead: {
      shortAnswer: 'Classic novelty effect. The week-1 lift was real but measured user curiosity, not durable behavioral change. Week 4 non-significance means the long-run effect cannot be distinguished from zero.',
      why: 'Novelty effects are one of the most dangerous traps in experimentation, precisely because week-1 data looks like strong evidence. Users interact differently with new features — they explore them, they engage out of curiosity, they spend time understanding them. This produces genuine statistical significance on short-run metrics that has nothing to do with lasting behavioral change.\n\nThe signature of a novelty effect is a declining treatment effect week over week, converging toward zero. Going from +8% (p < 0.001) to +1.2% (p = 0.21) over four weeks is a textbook decay curve. The week-4 result being non-significant is the more important signal: it tells you the sustained effect of this feature on lesson completion is statistically indistinguishable from zero.\n\nThe right framework for features that might have novelty effects: track the treatment effect by cohort week and look for stabilization. If the effect is still declining in week 4, you need more time, not a ship decision. If it stabilizes at a meaningful and significant level, that is your long-run effect estimate. Shipping on week-1 data for an edtech feature — where long-run learning outcomes are the actual value — is particularly risky.',
      commonMistake: 'Using week-1 aggregate results as the effect estimate for features that change habitual behavior. Novelty effects are invisible in aggregate data — you have to plot week-over-week treatment effects to see the decay. Always do this for engagement and behavior-change features before declaring a result. **Weak answer pattern:** The candidate says "week-1 showed +8% with p < 0.001 and that\'s a confirmed positive result — the week-4 data just shows users adapted to the new recommendations and the effect normalized at a lower but still positive level" — rationalizing a declining treatment effect as "adaptation" rather than novelty decay, and treating a non-significant week-4 result as still directionally valid. **Interviewer follow-up that exposes it:** "The treatment effect went from +8% to +1.2% over four weeks and is now non-significant — is that pattern consistent with \'users adapted\', or is it consistent with novelty decay, and how would you tell the difference?"',
      interviewPhrase: '"For this type of feature, I\'d look at treatment effect by cohort week, not the aggregate. The decay from +8% to +1.2% over four weeks is the story — that\'s a novelty curve, not a feature effect. I wouldn\'t ship until I see stabilization at a significant level."',
      connectsTo: ['review', 'design'],
    },
  },

  // ─────────────────────────────────────────────
  // STAT11 — Bayesian Stopping Rules (Advanced)
  // Trap: P(treatment > control) = 0.96 after 8 days, PM wants to stop early
  // ─────────────────────────────────────────────
  {
    id: 'stat11-bayesian-stopping',
    title: 'We Hit 95% Probability. Can We Stop?',
    subtitle: 'Bayesian stopping rules and optional stopping',
    concept: 'bayesian-ab-testing',
    difficulty: 'staff',
    isFree: false,
    companies: ['Stripe', 'PayPal', 'Revolut'],
    linkedConceptIds: ['bayesian-ab-testing', 'optional-stopping', 'pre-registration'],
    linkedScenarioIds: [],
    linkedDesignIds: [],
    sfPrerequisites: [{ id: 'sf11', title: 'Hypothesis Testing' }, { id: 'sf12', title: 'Power & Effect Size' }],

    situation: {
      company: 'Volta Fintech',
      product: 'Loan application flow — A/B testing a redesigned completion funnel',
      context: 'Volta is using a Bayesian framework with a beta-binomial model on application completion rate. After 8 days of a planned 14-day experiment, the dashboard shows P(treatment > control) = 0.96. The PM wants to stop early and ship.',
      decisionPressure: 'The PM argues that Bayesian methods are specifically designed to allow early stopping — that\'s the whole point. The team planned to run 14 days but the probability threshold has been hit.',
    },

    setup: {
      metric: 'Loan application completion rate (primary)',
      baseline: 'Control: 22.4%',
      observedResult: 'Treatment: 24.1% (+7.6%). P(treatment > control) = 0.96.',
      sampleInfo: 'n = 18,000 per arm at day 8. Planned n = 35,000 per arm.',
      caveat: 'No written experiment plan specifying the stopping rule was filed before the experiment launched. The 95% threshold was set informally.',
    },

    question: 'Evaluate this claim.',
    claim: '"We\'ve hit our 95% probability threshold. Bayesian methods allow stopping when you\'ve hit the threshold — there\'s no need to wait for the full sample size."',

    options: [
      {
        id: 'a',
        label: 'Valid — 96% probability exceeds the threshold and Bayesian rules allow early stopping.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'This is the most common Bayesian experimentation misconception: that reaching a probability threshold automatically justifies stopping, regardless of when or how the threshold was set. A Bayesian stopping rule is only valid when it is pre-specified — including the threshold level, the prior, and the model. If you look at the dashboard, see P = 0.96, and decide now to use that as a stopping criterion, you are doing optional stopping. The probability threshold gives you false comfort because it sounds principled, but the calibration depends entirely on the rule being committed to before the data was observed.',
      },
      {
        id: 'b',
        label: 'Valid if and only if this stopping rule was pre-specified before the experiment started. Ad-hoc stopping when the probability looks good reintroduces the same inflation issues as frequentist peeking.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. Bayesian stopping rules are valid when pre-specified. The experiment plan should have stated: "We will stop when P(treatment > control) > 0.95 OR when we reach n = 35,000 per arm, whichever comes first." If that plan existed and was filed before launch, stopping at day 8 with P = 0.96 is clean and defensible — this is one of the genuine advantages of Bayesian experimentation. If the threshold was set informally or the decision to stop was made after observing the probability, the same inflation problem that affects frequentist peeking applies here. The mathematical framework does not protect you from researcher degrees of freedom.',
      },
      {
        id: 'c',
        label: 'Invalid — Bayesian methods do not allow early stopping under any circumstances.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'This is incorrect in the opposite direction. Pre-specified Bayesian stopping rules are one of the genuinely useful features of the Bayesian framework for experimentation. Companies like VWO and Optimizely have built their testing platforms around exactly this capability. When the stopping criterion is defined before the experiment launches — including the prior, model, and threshold — reaching that threshold is a valid basis for stopping. The problem is not Bayesian stopping per se; it is optional stopping without pre-specification.',
      },
      {
        id: 'd',
        label: 'Cannot determine — need the prior distribution to evaluate whether this claim is valid.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'The prior matters for calibrating the probability estimate, but it is not the main issue here. The primary concern is whether the stopping rule was pre-specified — and the answer to that question does not depend on the prior. Even with a well-chosen, documented prior, stopping ad-hoc when the dashboard looks good is methodologically problematic. The prior is a secondary consideration; the pre-specification question is the critical one.',
      },
    ],

    seniorRead: {
      shortAnswer: 'Bayesian stopping rules are valid when pre-specified. The intuition that "Bayesian = peek anytime" is a widespread misconception that leads to inflated false positive rates.',
      why: 'The Bayesian framework does not eliminate the optional stopping problem — it reframes it. In a frequentist context, peeking at p-values and stopping when p < 0.05 inflates the Type I error rate because the p-value distribution shifts under repeated testing. In a Bayesian context, looking at a posterior probability and stopping when P(B > A) > 0.95 has the same inflation property when the decision to check is correlated with the result.\n\nThe mathematical resolution is identical to the frequentist case: pre-specification. A valid Bayesian stopping rule looks like this in the experiment plan: "Using a Beta(1,1) prior on both arms, we will stop when P(treatment > control) > 0.95 or when n = 35,000 per arm, whichever occurs first." This makes the stopping criterion fixed and independent of the observed data at any given moment. If a team builds this into their experiment infrastructure and follows it consistently, early stopping is a genuine advantage — it reduces opportunity cost when effects are large.\n\nThe failure mode is treating Bayesian probability as a live decision criterion that you can invoke whenever it feels right. A PM who sees P = 0.96 on day 8 and decides "now is a good time to stop" is doing optional stopping regardless of the mathematical framework. The correct response: check whether the stopping rule was pre-specified. If yes, stopping is valid. If no, run to the planned sample size.',
      commonMistake: '"Bayesian methods let you stop whenever the probability threshold is hit." This is true only when the threshold, prior, and model were committed to before the experiment launched. Retrospective invocation of a probability threshold is optional stopping with a Bayesian aesthetic. **Weak answer pattern:** The candidate says "Bayesian methods are specifically designed to allow early stopping when you have enough evidence — we\'ve hit 96% probability which exceeds the threshold, so stopping is justified" without asking whether the stopping rule was pre-specified, accepting the PM\'s description of Bayesian inference as permission to stop whenever the dashboard looks favorable. **Interviewer follow-up that exposes it:** "If the team had set the stopping threshold at 95% probability before the experiment launched in a written plan, would your answer change compared to the current situation where the threshold was set informally?"',
      interviewPhrase: '"Bayesian stopping rules are valid when pre-specified. If the experiment plan said stop at P > 0.95 before we launched, we can stop now. If we\'re looking at the dashboard and deciding to use that threshold because it looks good, we need to run to the planned n."',
      connectsTo: ['design', 'review'],
    },
  },

  // ─────────────────────────────────────────────
  // STAT12 — Long-run vs Short-run Metric Divergence (Advanced)
  // Trap: CTR primary metric +6.2% significant, 30-day retention -0.8% (non-sig)
  // ─────────────────────────────────────────────
  {
    id: 'stat12-longrun-shortrun',
    title: 'The Metric We Optimized Moved. The One We Care About Didn\'t.',
    subtitle: 'Metric hierarchy and long-run vs short-run divergence',
    concept: 'metric-hierarchy',
    difficulty: 'staff',
    isFree: false,
    companies: ['Netflix', 'Spotify', 'Hulu'],
    linkedConceptIds: ['metric-hierarchy', 'proxy-metric', 'guardrail-metric', 'p-value'],
    linkedScenarioIds: [],
    linkedDesignIds: [],
    sfPrerequisites: [{ id: 'sf21', title: 'Counterfactuals & Causal Inference' }, { id: 'sf11', title: 'Hypothesis Testing' }],

    situation: {
      company: 'Orbit Streaming',
      product: 'Content recommendation algorithm — A/B testing a new personalization model',
      context: 'The team A/B tested a new content recommendation algorithm. The primary experiment metric — next-session click-through rate (CTR) — is up +6.2% with p < 0.001. But 30-day retention, which drives subscription revenue, is -0.8% with p = 0.31. The head of product says CTR is the north star for algorithm experiments and wants to ship.',
      decisionPressure: 'The algo team\'s quarterly OKR is CTR improvement. The head of product has been pushing for a meaningful algo win for two quarters. The 30-day follow-up data is available but deprioritized.',
    },

    setup: {
      metric: 'CTR (primary, pre-specified): +6.2%, p < 0.001. 30-day retention: -0.8%, p = 0.31. Revenue per user at day 30: -1.1%, p = 0.19.',
      baseline: 'CTR baseline: not specified. 30-day retention baseline: implicit from control arm.',
      observedResult: 'CTR: +6.2% (p < 0.001). 30-day retention: -0.8% (p = 0.31). Day-30 revenue per user: -1.1% (p = 0.19).',
      sampleInfo: 'n = 85,000 per arm. 30-day follow-up available.',
      caveat: 'Both retention and revenue signals are directionally negative, even if not statistically significant at conventional thresholds.',
    },

    question: 'Evaluate this claim.',
    claim: '"CTR is our pre-specified primary metric for algorithm experiments. It moved significantly and in the right direction. The retention result is noisy and could be positive or negative. We should ship."',

    options: [
      {
        id: 'a',
        label: 'Valid — pre-specified primary metrics should be respected, and CTR moved significantly.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'Respecting pre-specified primary metrics is a sound principle, but it assumes the primary metric is the right proxy for business value. CTR is a short-run behavioral measure — it tells you users clicked. It does not tell you whether what they watched was satisfying, whether they returned, or whether they renewed their subscription. With 30-day retention directionally negative and day-30 revenue directionally negative, there is real evidence that CTR optimization here may be actively working against the long-run outcome the business cares about. Pre-specification is a methodological tool, not a reason to ignore a directionally negative signal from the metric that actually drives revenue.',
      },
      {
        id: 'b',
        label: 'Valid if CTR is truly the right north star for this decision — but the data suggests it may not be. A 30-day retention signal that is directionally negative (even if not significant) should trigger a longer follow-up before shipping.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. The methodological discipline of pre-specifying CTR as the primary metric is sound — it prevents post-hoc metric shopping. But a primary metric is only as good as its validity as a proxy for business value. In streaming, CTR optimizes for the initial decision to watch something. If the algorithm is serving clickable-but-ultimately-unsatisfying content, CTR goes up while long-run engagement erodes. The fact that both 30-day retention and day-30 revenue are directionally negative — even with n = 85,000 per arm and 30 days of follow-up — is a meaningful warning signal. The right call is a longer follow-up, not a ship based on a short-run proxy that may be misaligned.',
      },
      {
        id: 'c',
        label: 'Invalid — 30-day retention not moving means the CTR lift has no business value.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'This overclaims in the opposite direction. The 30-day retention result is -0.8% with p = 0.31 — that is a non-significant result, not proof of zero effect. The true retention impact could be negative, zero, or small positive. It would be equally wrong to declare the feature definitively harmful as to declare it definitively helpful. The appropriate response is uncertainty, not a confident negative conclusion. The question is whether the CTR north star is valid, not whether retention is proven to be zero.',
      },
      {
        id: 'd',
        label: 'Cannot determine — the experiment ran too short to measure true retention impact.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'The experiment actually has 30-day follow-up data, which is the relevant window for retention measurement on a streaming platform. The issue is not that the experiment ran too short — it is that the pre-specified primary metric (CTR) may not be the right north star for the ship decision, given that the downstream metrics it is meant to proxy are directionally negative. "Cannot determine" framing deflects from the core question: should CTR, a short-run click metric, be the basis for shipping an algorithm change when 30-day retention and revenue are directionally negative?',
      },
    ],

    seniorRead: {
      shortAnswer: 'CTR optimizes for clicks, not for what happens after the click. Do not ship. Run a longer follow-up and validate whether CTR is actually a good proxy for retention on this platform.',
      why: 'In streaming, a recommendation algorithm that serves clickable-but-ultimately-unsatisfying content will reliably boost next-session CTR. Users click on thumbnails that catch attention — but if what they watch is not satisfying, they disengage more quickly, return less often, and eventually churn. The short-run CTR metric captures the first behavior; the long-run retention and revenue metrics capture the cumulative consequence of all those behaviors over a subscription period.\n\nThe directionally negative retention and revenue signals here are not noise to dismiss. With n = 85,000 per arm and 30 days of follow-up, the confidence intervals on those metrics are not wide because of insufficient data — they are non-significant because the effect sizes are small. But -0.8% retention and -1.1% revenue per user, even if not significant, are consistent with a scenario where the algorithm trades long-run satisfaction for short-run click appeal. At scale on a subscription business, -0.8% retention compounds meaningfully over 12 months.\n\nThe right action is not to ignore the CTR result — it is to validate whether CTR is genuinely a leading indicator of retention on this platform. That is an empirical question. If historically CTR gains have been followed by retention gains, this experiment is probably fine. If CTR gains have been uncorrelated or negatively correlated with retention historically, the pre-specification of CTR as the north star needs to be revisited before the next algorithm experiment.',
      commonMistake: 'Treating "primary metric moved significantly" as sufficient for a ship decision when the primary metric is a behavioral proxy with uncertain relationship to business value. Proxy validity is not guaranteed — it has to be established empirically and re-verified when the algorithm or product context changes significantly. **Weak answer pattern:** The candidate says "CTR is the pre-specified primary metric and it moved significantly — we should respect the pre-experiment commitment and ship" without questioning whether a short-run click metric is actually a valid proxy for the long-run retention outcome the business cares about. **Interviewer follow-up that exposes it:** "30-day retention is directionally negative with n = 85,000 per arm — what does that tell you about whether CTR is the right north star for an algorithm change on a subscription streaming platform, and does pre-specification of CTR prevent you from raising that question?"',
      interviewPhrase: '"CTR moving significantly tells me users clicked more. It doesn\'t tell me the algorithm is improving long-run retention. With 30-day retention directionally negative and 30-day revenue directionally negative, I\'d want to understand the CTR-retention correlation historically before treating this CTR lift as a win."',
      connectsTo: ['design', 'review', 'metrics', 'rca'],
    },
  },

  {
    id: 'stat13-did-parallel-trends',
    title: 'DiD Without Parallel Trends',
    subtitle: 'Difference-in-differences assumption violation',
    concept: 'diff-in-diff',
    difficulty: 'senior',
    isFree: false,
    companies: ['Airbnb', 'Amazon', 'Walmart'],
    linkedConceptIds: ['diff-in-diff', 'parallel-trends', 'selection-bias', 'causal-inference'],
    linkedScenarioIds: [],
    linkedDesignIds: [],
    sfPrerequisites: [{ id: 'sf21', title: 'Counterfactuals & Causal Inference' }, { id: 'sf22', title: 'Difference-in-Differences' }],

    situation: {
      company: 'Crafted',
      product: 'Peer-to-peer artisan marketplace, ~$180M annualized GMV across 40 US cities',
      context: 'Crafted rolled out a new seller verification badge in NYC, LA, and Chicago last quarter — not as a randomized experiment, just an operational launch in the cities where the ops team had bandwidth to verify sellers. A PM just Slacked you: "I ran a DiD on GMV for badge cities vs. the 37 control cities. Badge cities are up 18% relative to controls after the rollout. Verification is clearly working — can you help me write up a national rollout case?"',
      decisionPressure: 'The ops team is scoping the cost of national verification rollout. Leadership wants a data-backed go/no-go by end of week.',
    },

    setup: {
      metric: 'Gross Merchandise Value (GMV) per city, weekly',
      baseline: 'Badge cities averaged $4.2M GMV/week pre-rollout. Control cities averaged $1.1M GMV/week.',
      observedResult: 'Badge cities GMV grew 31% post-rollout. Control cities GMV grew 11% post-rollout. DiD estimate: +18pp relative lift attributed to the badge.',
      sampleInfo: '3 treated cities, 37 control cities. 8 weeks pre-rollout, 8 weeks post-rollout. Standard DiD regression with city and time fixed effects.',
      caveat: 'Badge cities (NYC, LA, Chicago) were the three highest-GMV cities and had been growing faster than control cities for at least 12 weeks before the rollout — a fact not surfaced in the PM\'s write-up.',
    },

    question: 'Evaluate this claim.',
    claim: '"The DiD analysis shows verification badges cause an 18% GMV lift — we should roll out nationally."',

    options: [
      {
        id: 'a',
        label: 'Valid — DiD controls for fixed city-level differences, so pre-existing size differences between badge cities and control cities do not matter.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'DiD with city and time fixed effects does control for time-invariant differences between cities — it accounts for the fact that NYC is always larger than Boise. But it does not control for differential pre-treatment trends. If badge cities were already on a steeper growth trajectory before the rollout, the post-treatment divergence captures both the badge effect and the continuation of that pre-existing trend. Fixed effects absorb levels, not slopes. The parallel trends assumption requires that, absent the badge, treated and control cities would have followed the same growth trajectory — and that assumption needs to be tested explicitly.',
      },
      {
        id: 'b',
        label: 'Partially valid — the 18% estimate is probably real, but should be validated with a longer post-treatment window before committing to national rollout.',
        isCorrect: false,
        level: 'partial',
        feedback: 'Extending the post-treatment window would improve precision, but the fundamental problem here is not statistical power — it is identification. If the pre-treatment trends were not parallel, a longer observation period does not fix the confounding; it just gives you a more precisely estimated biased number. The correct intervention is to go back and plot pre-treatment trends by city group before drawing any causal conclusions from the DiD estimate.',
      },
      {
        id: 'c',
        label: 'Invalid — DiD requires parallel pre-treatment trends, and if badge cities were already growing faster before the rollout, the 18% estimate conflates the badge effect with differential trend continuation.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. The parallel trends assumption is the identifying assumption of DiD: absent treatment, treated and control units would have followed the same trend. If badge cities were on a faster growth trajectory for 12 weeks before the rollout, that trajectory will continue post-rollout regardless of the badge, inflating the DiD estimate. The 18% figure cannot be causally attributed to the badge without first verifying that pre-treatment trends were parallel. You must plot pre-period GMV growth by group and run a formal pre-trend test before any causal claim is valid.',
      },
      {
        id: 'd',
        label: 'Invalid — with only 3 treated cities, the sample is too small for any DiD analysis to be statistically meaningful.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'Small treated-unit counts do create inference problems in DiD (standard errors may be understated, and you should use cluster-robust standard errors at the city level), but the primary issue here is not statistical power — it is that the identifying assumption of DiD has likely been violated. Even with 300 treated cities, a DiD that violates parallel trends produces a biased estimate of the causal effect. The small-N problem is real but secondary to the confounding from differential pre-trends.',
      },
    ],

    seniorRead: {
      shortAnswer: 'DiD is only identified if parallel trends holds. Badge cities were already growing faster before rollout — the 18% estimate is likely confounded. Plot pre-treatment trends before making any causal claim.',
      why: 'Difference-in-differences estimates the Average Treatment Effect on the Treated (ATT) by comparing the change in outcomes for treated units before and after treatment to the change for control units over the same period. The intuition is clean: the control group tells you what would have happened to the treated group in the absence of treatment, so differencing removes both time-invariant unit heterogeneity and aggregate time shocks.\n\nThe critical assumption that makes this work is parallel trends: in the counterfactual world where treated units were never treated, their outcome trajectory would have been parallel to the control group\'s trajectory. This assumption cannot be directly tested (the counterfactual is unobservable), but it can be falsified by examining pre-treatment data. If treated and control units were trending differently before treatment began, there is no reason to believe they would have converged absent treatment — the control group is not a valid counterfactual.\n\nIn this case, Crafted chose badge cities based on operational readiness, which in practice meant the largest, most developed markets — NYC, LA, and Chicago. These are structurally different from the control cities not just in level but in trajectory: mature marketplace cities often exhibit faster organic GMV growth because they have deeper network effects, more repeat buyers, and higher seller density. If badge cities were growing 3-4pp faster per quarter before the rollout, a simple DiD will attribute that pre-existing growth differential to the badge, producing an inflated ATT estimate.\n\nThe diagnostic is straightforward: plot average weekly GMV growth for badge cities and control cities across the 8 pre-rollout weeks and run a test for pre-trend differences (regress the outcome on a group-time interaction in the pre-period; the coefficient should be statistically indistinguishable from zero if trends are parallel). If trends are not parallel, DiD is not identified. Alternatives include synthetic control — constructing a weighted combination of control cities that matches the pre-treatment GMV trend of badge cities as closely as possible — or selecting matched control cities (e.g., cities with similar pre-treatment GMV levels and growth rates) before running DiD.',
      commonMistake: 'Analysts running DiD often check that treated and control groups are similar in levels at baseline (a balance check) but skip the parallel trends test. Balance in levels does not imply parallel trends in growth rates — those are independent properties that must both be verified. **Weak answer pattern:** The candidate says "DiD with city and time fixed effects controls for the fact that NYC is always bigger than other cities, so the pre-existing size difference doesn\'t affect the estimate" — confusing fixed effects controlling for level differences with fixed effects controlling for trend differences, which they do not. **Interviewer follow-up that exposes it:** "DiD controls for the fact that NYC is always larger than other cities — does it also control for the fact that NYC might have been growing faster than other cities before the badge rollout?"',
      interviewPhrase: '"Before I can call this a causal 18% lift, I need to see the pre-treatment trend plot. If badge cities were already on a steeper GMV growth curve before the rollout — which I\'d expect given these are your three largest markets — the DiD estimate is picking up that differential trend, not the badge effect. Let\'s verify parallel trends first."',
      connectsTo: ['stats', 'design'],
    },
  },

  {
    id: 'stat14-rd-manipulation',
    title: 'RD With Running Variable Manipulation',
    subtitle: 'Regression discontinuity density test failure',
    concept: 'regression-discontinuity',
    difficulty: 'senior',
    isFree: false,
    companies: ['Uber', 'Lyft', 'DoorDash'],
    linkedConceptIds: ['regression-discontinuity', 'mccrary-test', 'late', 'manipulation-bias'],
    linkedScenarioIds: [],
    linkedDesignIds: [],
    sfPrerequisites: [{ id: 'sf21', title: 'Counterfactuals & Causal Inference' }, { id: 'sf23', title: 'Regression Discontinuity' }],

    situation: {
      company: 'Volta',
      product: 'Consumer lending fintech offering personal loans; ~$2.1B in annual originations',
      context: 'Volta prices loans using a credit score cutoff: borrowers with a score of 680 or above receive a 8.9% APR, while borrowers below 680 receive 11.4% APR. A DS just sent you their analysis: "I ran an RD on 30-day default rates across the 680 threshold. Borrowers just above the cutoff (680-700) have a 4.2 percentage point lower 30-day default rate than borrowers just below (660-679). This is clean evidence that the lower interest rate reduces defaults — we should consider lowering the APR cutoff to help more borrowers."',
      decisionPressure: 'The product team wants to use this finding to pitch a rate restructuring to the credit committee next month.',
    },

    setup: {
      metric: '30-day default rate (primary); credit score as running variable; interest rate tier as treatment',
      baseline: 'Borrowers just below 680: 9.1% 30-day default rate. Borrowers just above 680: 4.9% 30-day default rate.',
      observedResult: 'RD estimate: -4.2pp default rate at the 680 threshold (lower rate causes fewer defaults), p < 0.01. Bandwidth: 20 credit score points on each side.',
      sampleInfo: 'n = 12,400 borrowers within the 660-700 bandwidth over 18 months. Estimate uses local linear regression on each side of cutoff.',
      caveat: 'A histogram of credit scores near the cutoff shows an unusually high density of borrowers at 681-685 relative to what a smooth distribution would predict — and an unusual dip at 675-679. The McCrary density test is significant (p = 0.003).',
    },

    question: 'Evaluate this claim.',
    claim: '"RD analysis shows lower interest rates causally reduce default rates by 4.2pp at the 680 credit score threshold."',

    options: [
      {
        id: 'a',
        label: 'Valid — RD is one of the most credible quasi-experimental designs, and the local randomization near the cutoff makes this causally identified.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'RD is credible precisely because near the cutoff, assignment to treatment is effectively as-good-as-random — borrowers just above and just below a threshold should be similar on all characteristics except the treatment. But that near-random assignment breaks down entirely if individuals can manipulate their running variable to end up on the preferred side of the cutoff. The McCrary test shows significant bunching above 680, indicating that is exactly what is happening here. The local randomization assumption — which is what makes RD credible — is violated when the running variable is manipulated.',
      },
      {
        id: 'b',
        label: 'Partially valid — the estimate is directionally right, but the bandwidth choice of 20 points may be too wide and should be narrowed.',
        isCorrect: false,
        level: 'partial',
        feedback: 'Bandwidth selection is a legitimate concern in RD analysis — a bandwidth that is too wide includes borrowers who are less comparable, increasing bias, while a bandwidth that is too narrow reduces sample size and increases variance. But narrowing the bandwidth does not fix the manipulation problem here. If borrowers at 681-685 are selectively different from borrowers at 675-679 because the former group actively managed their scores to cross the threshold, the comparison is invalid regardless of how narrow the bandwidth is. The density test failure is the primary problem.',
      },
      {
        id: 'c',
        label: 'Invalid — the McCrary density test shows significant bunching just above the cutoff, indicating running variable manipulation. When assignment can be manipulated, the RD estimate is not causally identified.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. The identifying assumption of RD is that the running variable is not manipulated around the threshold — specifically, that individuals cannot precisely control which side of the cutoff they land on. The McCrary density test (p = 0.003) is a direct test of this: it checks whether the density of the running variable is smooth through the cutoff. Significant bunching above 680 and a corresponding dip below indicates that some borrowers (or intermediaries acting on their behalf) are pushing scores just over the cutoff. If only certain types of borrowers can do this — e.g., those who are more financially sophisticated or have access to credit repair services — the group just above the cutoff is systematically different from the group just below in ways that affect default risk, independent of the interest rate.',
      },
      {
        id: 'd',
        label: 'Invalid — 30-day default rate is too short a window to measure the effect of interest rate on repayment behavior.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'Measurement window is a design consideration worth debating, but it is not the primary invalidating issue here. A 30-day default rate captures early payment failure, which is a legitimate outcome for a lending study focused on immediate repayment capacity. The fundamental problem is that the running variable has been manipulated — changing the outcome measurement window to 60 or 90 days would not resolve the fact that the comparison group is contaminated by selective score manipulation.',
      },
    ],

    seniorRead: {
      shortAnswer: 'The McCrary test is significant — running variable manipulation is present. When borrowers can manipulate their credit score to cross the threshold, the local randomization that makes RD valid breaks down and the estimate is biased.',
      why: 'Regression discontinuity identifies a Local Average Treatment Effect (LATE) at the cutoff: the causal effect of treatment for units whose running variable places them right at the threshold. The design exploits the fact that, near a threshold, whether a unit ends up just above or just below is essentially arbitrary — small measurement differences or random variation in the running variable determine treatment assignment, making the comparison as credible as a randomized experiment for units near the cutoff.\n\nThis logic requires one critical assumption: individuals cannot precisely control which side of the threshold they land on. If they can, the units just above and just below are no longer comparable. In a credit score context, this means borrowers who end up at 681 should be similar to borrowers at 679 in all respects except that they drew a slightly higher score. If borrowers or credit bureaus can engineer a score just above 680 — through selective timing of credit inquiries, rapid payoff of small balances, dispute resolution, or credit repair interventions — then the group at 681-685 is systematically more financially sophisticated, more motivated, and likely lower risk than the group at 675-679, independent of any interest rate effect.\n\nThe McCrary density test formalizes this check. Under no manipulation, the density of the running variable should be smooth through the cutoff — the histogram should look approximately continuous. A statistically significant break in density at the threshold (bunching above, depletion below) is evidence that units are sorting, and the local randomization assumption fails. In this case, p = 0.003 is strong evidence of sorting.\n\nWhen manipulation is present, the options are: (1) acknowledge the RD is not valid and seek an alternative identification strategy; (2) attempt to instrument for the "true" credit score using other signals, though this is difficult in practice; or (3) restrict analysis to only the hard "cliff" segment where score manipulation is mechanically impossible — but that subgroup is often too small and too specific to generalize. The honest answer here is that the RD estimate should not be taken to the credit committee as causal evidence.',
      commonMistake: 'Running an RD without checking the density of the running variable near the threshold. Plotting the McCrary density test histogram takes five minutes and is mandatory before interpreting any RD estimate — many analysts skip it because they are focused on the discontinuity in the outcome rather than the validity of the design. **Weak answer pattern:** The candidate says "the sharp discontinuity at 680 is exactly what RD is designed to detect and the effect size is large — the lower interest rate clearly reduces defaults and we should lower the APR cutoff" without noticing that the 680 cutoff is a known threshold that borrowers can try to reach by applying later or disputing entries, violating the no-manipulation assumption. **Interviewer follow-up that exposes it:** "The 680 threshold is published and borrowers can see it — what would you check in the credit score distribution near 680 to determine whether the RD design is valid?"',
      interviewPhrase: '"Before I can trust this RD, I need to see the histogram of credit scores at the threshold. If there\'s bunching just above 680, borrowers are sorting themselves across the cutoff — and then the people just above and just below are no longer comparable. That\'s not a 4.2pp causal estimate anymore, it\'s a selection artifact."',
      connectsTo: ['stats', 'design'],
    },
  },

  {
    id: 'stat15-synthetic-control-donor-pool',
    title: 'Synthetic Control With a Contaminated Donor Pool',
    subtitle: 'Donor pool validity and pre-treatment fit requirements',
    concept: 'synthetic-control',
    difficulty: 'senior',
    isFree: false,
    companies: ['Google', 'Apple', 'Microsoft'],
    linkedConceptIds: ['synthetic-control', 'sutva', 'donor-pool', 'pre-treatment-fit', 'counterfactual'],
    linkedScenarioIds: [],
    linkedDesignIds: [],
    sfPrerequisites: [{ id: 'sf21', title: 'Counterfactuals & Causal Inference' }, { id: 'sf24', title: 'Synthetic Control' }],

    situation: {
      company: 'Spark',
      product: 'Short-form social feed app, 85M monthly active users in the US, also present in Canada, UK, and Australia',
      context: 'Spark replaced its US chronological feed with an AI-curated feed last quarter. The change was not run as an A/B test — it was a hard cutover for all US users simultaneously. A senior DS on the growth team has proposed a synthetic control analysis using Canada, UK, and Australia as donor countries and says: "I constructed a synthetic US using weighted combinations of these three markets. Pre-period trends fit well. Post-cutover, the synthetic US underperforms actual US by 11% in DAU — proof the algorithm change caused an 11% lift." They are presenting this to the CEO next week.',
      decisionPressure: 'The CEO wants to know whether to push for a similar feed overhaul in international markets. This analysis is the primary evidence being used.',
    },

    setup: {
      metric: 'Daily Active Users (DAU) normalized by market size',
      baseline: 'US DAU index: 100 (normalized). Synthetic US DAU (from donor pool): 100 (pre-period, by construction).',
      observedResult: 'Post-cutover: Actual US DAU index rises to ~111. Synthetic US DAU index stays at ~100. Implied causal effect: +11% DAU.',
      sampleInfo: 'Pre-period: 26 weeks. Post-period: 12 weeks. Donor pool: Canada, UK, Australia. Weights not reported. Pre-period fit R² = 0.91.',
      caveat: 'All three donor countries are English-speaking, culturally proximate to the US, and follow similar content consumption trends — meaning they may experience correlated shocks to social app usage independent of the feed algorithm. No pre-treatment fit plot was shared, only the R² statistic.',
    },

    question: 'Evaluate this claim.',
    claim: '"Synthetic control estimates a causal 11% DAU lift from the algorithm change."',

    options: [
      {
        id: 'a',
        label: 'Valid — synthetic control is the gold standard for single-unit policy evaluation, and an R² of 0.91 confirms excellent pre-period fit.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'Synthetic control is a powerful method for single-unit causal inference, but it has strict requirements that R² alone cannot confirm. First, donor units must not have been affected by the treatment (SUTVA). If Canada, UK, and Australia are heavily influenced by the same content trends as the US — which is likely for an English-language app with globally shared creator content — they do not provide an independent counterfactual. Second, R² as a global fit statistic can mask local fit failures; you need to see the full pre-period trajectory plot, not just a summary statistic. A high R² achieved by overfitting to a few influential weeks is very different from a tight, consistent pre-period match.',
      },
      {
        id: 'b',
        label: 'Partially valid — the analysis is directionally informative, but the donor pool should include more geographically diverse countries to reduce cultural correlation.',
        isCorrect: false,
        level: 'partial',
        feedback: 'Geographic diversity in the donor pool is the right instinct, but framing this as "partially valid" understates the severity of the problem. If the current donor pool is contaminated by correlated exposure to the same trends affecting the US, the synthetic counterfactual is not measuring what would have happened to the US absent the algorithm change — it is measuring what happened to markets with similar structural exposure to the same shocks. Additionally, the absence of a pre-period fit plot is a methodological gap that must be addressed before any result is presented to leadership.',
      },
      {
        id: 'c',
        label: 'Not yet credible — donor pool SUTVA may be violated if donor countries share content trends with the US, and no pre-treatment fit plot has been shown. The 11% estimate cannot be presented as causal without these checks.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. Synthetic control requires two things to be credible: (1) donor units that were not affected by the treatment — SUTVA — so they form a valid counterfactual, and (2) a good pre-treatment fit, which must be demonstrated visually with a time-series plot, not just summarized with R². If all three donor countries are culturally similar English-speaking markets that share content creators, trending topics, and seasonal social app behavior with the US, they may not be independent of whatever trends are driving US DAU — and they may have indirectly benefited from algorithm-driven creator behavior originating in the US. The 11% estimate needs both a SUTVA defense and a visible pre-treatment fit plot before it is presentable as causal evidence.',
      },
      {
        id: 'd',
        label: 'Invalid — synthetic control cannot be used for platform algorithm changes because user behavior is too heterogeneous across countries.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'Cross-country heterogeneity is a legitimate concern in synthetic control (it is related to the interpolation bias problem), but it does not categorically invalidate the method for platform algorithms. Synthetic control has been applied credibly across markets with meaningful differences when the pre-treatment fit is good and donor units are truly unaffected by the treatment. The problems here are more specific: potential SUTVA violation from culturally correlated donor markets, and the absence of a pre-period fit visualization. Broad category invalidation is the wrong frame.',
      },
    ],

    seniorRead: {
      shortAnswer: 'Synthetic control requires an uncontaminated donor pool and a demonstrated pre-treatment fit. Neither has been properly established here. The 11% estimate is not yet credible as a causal claim.',
      why: 'Synthetic control constructs a weighted combination of control units (the "donor pool") that matches the pre-treatment trajectory of the treated unit as closely as possible. The resulting synthetic unit serves as the counterfactual: what the treated unit would have looked like absent the treatment. Post-treatment, any divergence between the actual and synthetic series is attributed to the treatment effect. The method is particularly well-suited to settings with a single treated unit and a long pre-treatment period — exactly the situation Spark faces with a hard US-only cutover.\n\nThe method rests on two requirements. First, SUTVA (Stable Unit Treatment Value Assumption): donor units must not have been affected by the treatment, directly or indirectly. If Spark\'s US algorithm change made certain creator formats trend more heavily in the US, and those formats then spilled over into Canadian and UK content consumption because creators are shared across markets, then Canada and the UK are not unaffected controls — their DAU is partially influenced by the treatment. The synthetic US would then understate the counterfactual (because donor DAU grew too, partially due to spillover), making the treatment effect look larger than it actually was.\n\nSecond, pre-treatment fit must be demonstrated visually over the full pre-period. R² = 0.91 is a summary statistic that can hide significant mismatches in specific weeks — a particularly good fit in months 1-4 but poor fit in months 5-6 would still produce a high R², but a synthetic control fitted on a mismatched pre-period is not a valid counterfactual. The standard practice in any synthetic control paper or analysis is to plot the actual and synthetic series together for the entire pre-period and allow readers to see the fit directly. Without this plot, the claim cannot be evaluated.\n\nFor this analysis to be credible, the DS needs to: (1) defend why Canada, UK, and Australia are not exposed to US content trends (or quantify the spillover and correct for it), (2) add geographically uncorrelated donor candidates (e.g., Brazil, Germany, Japan) where the content ecosystem is more independent, and (3) show the full pre-period fit plot rather than reporting only R². Only then can an 11% estimate be offered to the CEO as causal evidence.',
      commonMistake: 'Summarizing synthetic control pre-treatment fit with a single statistic (R², RMSPE) rather than plotting the full pre-period series. A number cannot convey whether the fit is consistently good across time or driven by a small number of well-fitted periods. Always show the plot. **Weak answer pattern:** The candidate says "R² = 0.91 shows excellent pre-treatment fit and the synthetic control estimate of +11% DAU is valid" without asking to see the actual pre-period fit plot or questioning whether Canada, UK, and Australia share content trends with the US through shared creators, which would contaminate the donor pool. **Interviewer follow-up that exposes it:** "R² = 0.91 summarizes the pre-period fit in one number — what could still go wrong with the fit that wouldn\'t show up in R², and what would you want to see before presenting this as causal evidence to the CEO?"',
      interviewPhrase: '"I need to see two things before I\'ll call this causal. First, show me the pre-period fit plot — not just R², the actual time series overlay. Second, walk me through why Canada, UK, and Australia are valid donor markets given they share creator content with the US. If they\'re picking up spill-over from the algorithm change itself, they\'re not a valid counterfactual."',
      connectsTo: ['stats', 'design'],
    },
  },

  {
    id: 'stat16-iv-exclusion-restriction',
    title: 'IV With Exclusion Restriction Violation',
    subtitle: 'Instrumental variables instrument validity',
    concept: 'instrumental-variables',
    difficulty: 'senior',
    isFree: false,
    companies: ['Meta', 'Snap', 'Twitter'],
    linkedConceptIds: ['instrumental-variables', 'exclusion-restriction', 'late', 'instrument-validity', 'confounding'],
    linkedScenarioIds: [],
    linkedDesignIds: [],
    sfPrerequisites: [{ id: 'sf21', title: 'Counterfactuals & Causal Inference' }, { id: 'sf25', title: 'Instrumental Variables' }],

    situation: {
      company: 'Prism',
      product: 'Short-form video platform, 60M creators, ~$900M annualized revenue from creator monetization fees',
      context: 'Prism wants to understand whether enabling creator monetization causes a decline in content quality. Observational data is confounded — better creators may be more likely to monetize, biasing naive comparisons. A DS proposes an instrumental variables approach: "We ran an early access program where we randomly invited a subset of creators to enable monetization. I\'ll use whether a creator received an invite as the instrument for their monetization status. My IV estimate is that monetization causes a 19% reduction in content completion rate." You dig into the invite criteria and find that the early access invites were sent to creators who had uploaded at least 30 videos in the past 60 days — a high-velocity threshold.',
      decisionPressure: 'The policy team is drafting a proposal to delay monetization unlock for new creators based on this estimate. The DS is presenting to leadership tomorrow.',
    },

    setup: {
      metric: 'Content completion rate (% of video watched to end), averaged per creator over 90 days post-monetization',
      baseline: 'Non-monetized creators: 61% average completion rate. Monetized creators (observational): 52% average completion rate.',
      observedResult: 'IV estimate (using invite as instrument): monetization causes -19pp completion rate. First stage F-statistic: 87 (strong instrument). Reduced form: invited creators have 11pp lower completion rates than non-invited creators.',
      sampleInfo: 'n = 24,000 creators in early access cohort and matched non-invited creators. Instrument is binary (received invite or not). Compliance rate: 58% of invited creators enabled monetization.',
      caveat: 'The early access invite was restricted to creators who uploaded 30+ videos in 60 days. High upload velocity is independently associated with lower completion rates — creators who post very frequently tend to produce lower-quality individual pieces.',
    },

    question: 'Evaluate this claim.',
    claim: '"The IV estimate using early-access invite as instrument shows monetization causally reduces content quality by 19%."',

    options: [
      {
        id: 'a',
        label: 'Valid — the invite was randomly assigned among eligible creators, satisfying the exogeneity requirement for a valid instrument.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'Random assignment among eligible creators ensures that conditional on eligibility (30+ uploads in 60 days), the instrument is uncorrelated with unobserved confounders. But a valid instrument requires more than exogeneity — it also requires the exclusion restriction: the instrument affects the outcome only through the treatment, with no direct effect on the outcome. Here, invitation eligibility selects for high-velocity creators. If high upload velocity independently predicts lower content quality (which the data suggests), then the instrument has a direct path to completion rate that bypasses monetization status. Exogeneity alone is not enough.',
      },
      {
        id: 'b',
        label: 'Partially valid — the first-stage F-statistic of 87 confirms a strong instrument, which addresses the weak instrument problem. The estimate is probably reliable.',
        isCorrect: false,
        level: 'partial',
        feedback: 'A strong first stage (F > 10, here F = 87) is necessary to avoid the weak instrument problem — an instrument that only weakly predicts treatment produces IV estimates with enormous standard errors and severe finite-sample bias. But instrument strength addresses only the relevance condition of IV validity. The exclusion restriction is an entirely separate assumption that the first-stage F-statistic says nothing about. You can have a very strong instrument that badly violates exclusion — and that is exactly the situation here. High velocity creators were selected for the invite, and high velocity predicts quality decline on its own.',
      },
      {
        id: 'c',
        label: 'Invalid — the exclusion restriction is violated because the invite was sent to high-velocity creators, and upload velocity independently predicts content quality decline, creating a direct path from instrument to outcome that bypasses the monetization treatment.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. The exclusion restriction requires that the instrument affects the outcome only through its effect on the treatment — there is no direct pathway from instrument to outcome. Here, being invited to early access monetization is correlated with being a high-velocity uploader (the eligibility criterion). High-velocity uploading independently predicts lower content completion rates (more frequent posting tends to reduce per-video quality). This means the instrument has two paths to the outcome: (1) through monetization status (the intended channel) and (2) directly through the selection of high-velocity creators who would have shown quality decline regardless of monetization. The IV estimate absorbs both effects and is therefore biased. The -19pp estimate cannot be interpreted as the pure effect of monetization.',
      },
      {
        id: 'd',
        label: 'Invalid — a 58% compliance rate is too low for IV to produce reliable estimates. Only randomized experiments with full compliance are valid.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'Partial compliance is the norm in IV applications, not a disqualifier. IV with a binary instrument and partial compliance estimates the Local Average Treatment Effect (LATE) — the effect of treatment for compliers (creators who were invited and chose to monetize). A compliance rate of 58% is perfectly reasonable for an IV design. The critical problem here is not compliance rate — it is that the exclusion restriction is violated because the instrument selection criterion (high upload velocity) creates a direct path to the outcome. That is a fundamental validity problem, not a statistical power problem.',
      },
    ],

    seniorRead: {
      shortAnswer: 'The exclusion restriction is violated — invite eligibility selected high-velocity creators, and velocity independently predicts quality decline. The IV estimate conflates the effect of monetization with the effect of being a high-volume poster. The -19pp figure is not a valid causal estimate.',
      why: 'Instrumental variables estimation requires three conditions to be satisfied simultaneously. The relevance condition requires that the instrument is meaningfully correlated with the treatment — a weak instrument produces unreliable estimates, and is tested with the first-stage F-statistic. The exogeneity condition requires that the instrument is uncorrelated with unobserved confounders — it must be as good as randomly assigned conditional on observables. The exclusion restriction requires that the instrument affects the outcome only through the treatment — there is no direct pathway from instrument to outcome that bypasses the endogenous treatment variable.\n\nThe first two conditions can be partially tested. Relevance is assessed with the first-stage F-statistic (F = 87 here is strong). Exogeneity can be partially examined by checking balance on observable characteristics between instrument groups, though it ultimately relies on the design (randomization within eligible creators here supports conditional exogeneity). The exclusion restriction, however, is fundamentally untestable from the data alone — it is a structural assumption about the data-generating process that requires logical and domain reasoning to defend or falsify.\n\nHere, the exclusion restriction fails at the design level. The early access invite was gatekept by upload velocity — only creators who posted 30+ videos in 60 days were eligible. This is not a random sample of creators; it is a selected sample with a specific behavioral characteristic. High-velocity posting is itself a plausible cause of quality decline: when a creator posts every other day, the average production value per video tends to fall, completion rates tend to drop, and the channel mix shifts toward quantity over quality. The instrument therefore has a direct pathway to the outcome (instrument → velocity → quality) that exists independently of the monetization pathway (instrument → monetization → quality). The IV estimate absorbs both pathways and is upwardly biased in its estimate of the monetization effect.\n\nThe practical fix is either to find an instrument that is not correlated with velocity — for example, truly random assignment among all creators regardless of activity level — or to condition on upload velocity in the analysis to partial out its effect. But conditioning on a post-instrument variable introduces its own complications (bad control problem). The cleanest solution would have been to randomize the invite within a more representative population from the start. As it stands, the estimate should not be used to set policy without acknowledging this confound explicitly.',
      commonMistake: 'Validating IV only on the first-stage F-statistic and stopping there. Many analysts check relevance carefully (because it produces a testable number) but treat the exclusion restriction as a formality or assume it is satisfied by design. The exclusion restriction requires active scrutiny of every pathway by which the instrument could affect the outcome directly — it is an argument, not a calculation. **Weak answer pattern:** The candidate says "the early-access invite is randomly assigned and the first-stage F-statistic is 87, so the IV is valid and the -19pp content quality reduction is a causal estimate" without asking whether high upload velocity (the invite eligibility criterion) independently affects completion rate through a direct pathway — which it does, violating the exclusion restriction. **Interviewer follow-up that exposes it:** "The invite was only sent to creators who uploaded 30+ videos in 60 days — does that eligibility criterion affect the exclusion restriction, and why?"',
      interviewPhrase: '"The F-stat tells me the instrument is strong, but that\'s only one of three conditions. The exclusion restriction is the hard one — does the invite affect completion rate only through monetization? If you selected invitees based on upload velocity, and velocity independently drives quality down, then no: you\'ve got a direct path from instrument to outcome that has nothing to do with monetization. That invalidates the estimate."',
      connectsTo: ['stats', 'design'],
    },
  },

  // ─────────────────────────────────────────────
  // STAT17 — Difference-in-Differences (Senior)
  // Trap: reading treatment group change as the causal effect, ignoring secular trend
  // ─────────────────────────────────────────────
  {
    id: 'stat17-did',
    title: 'Is +7pp the Onboarding Uplift?',
    subtitle: 'Diff-in-diff vs. raw treatment group change',
    concept: 'diff-in-diff',
    difficulty: 'analyst',
    isFree: false,
    companies: ['Amazon', 'Walmart', 'Target'],
    linkedConceptIds: ['diff-in-diff', 'counterfactual', 'causal-inference'],
    linkedScenarioIds: [],
    linkedDesignIds: [],
    sfPrerequisites: [{ id: 'sf22', title: 'Difference-in-Differences' }],

    situation: {
      company: 'Threadline',
      product: 'B2B SaaS project management platform',
      context: 'Threadline launched a redesigned onboarding flow in three cities (Chicago, Austin, Denver) as a phased regional rollout — not a randomized A/B test. After 4 weeks the analytics team compares cities that received the new onboarding against the rest of the US. Treatment cities (new onboarding): activation rate moved from 62% to 71% (+9pp... wait — read the setup). The analyst in your review writes: "New onboarding improved activation by 7pp — that\'s what we should report to the product team."',
      decisionPressure: 'The VP of Product wants to green-light a nationwide rollout before Q2 planning. The analyst\'s 7pp figure is the number in the deck.',
    },

    setup: {
      metric: 'User activation rate (% of signups completing core setup within 7 days)',
      baseline: 'Pre-period (Jan 2024): Treatment cities 64%, Control cities 62%',
      observedResult: 'Post-period (Feb 2024): Treatment cities 71% (+7pp), Control cities 66% (+4pp)',
      sampleInfo: 'Treatment: Chicago, Austin, Denver (new onboarding). Control: remaining US cities (old onboarding). 4-week observation window.',
      caveat: 'February is historically a strong month for SaaS signups following end-of-January budget approvals. Control cities also improved by 4pp over the same period.',
    },

    question: 'Evaluate this claim.',
    claim: '"The new onboarding improved activation by 7pp — that\'s the uplift we should report to the product team."',

    options: [
      {
        id: 'a',
        label: 'Correct — the treatment cities gained 7pp so the new onboarding caused 7pp of improvement.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'This reads the raw treatment group change as the causal effect. But some or all of the 7pp gain may have happened regardless of the new onboarding — the control cities also improved by 4pp over the same period, likely due to seasonal trends or platform-wide changes. Without subtracting the counterfactual trend, the 7pp estimate is inflated.',
      },
      {
        id: 'b',
        label: 'Partially right — 7pp is a valid upper bound on the effect, but the true effect is probably lower once you account for noise.',
        isCorrect: false,
        level: 'partial',
        feedback: 'Calling 7pp an "upper bound" frames this as a statistical noise problem, but the issue is methodological: there\'s a systematic upward bias from the secular trend, not just sampling variation. The control group\'s 4pp gain is the signal that a trend was happening across all cities. Diff-in-diff removes this trend, giving 3pp — not a confidence interval around 7pp.',
      },
      {
        id: 'c',
        label: 'Wrong — the diff-in-diff estimate is 3pp (7pp minus the 4pp control group trend), not 7pp. The 4pp control gain reflects secular trends that would have lifted treatment cities regardless.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. Diff-in-diff isolates the causal effect by subtracting what would have happened anyway (the counterfactual trend) from the treatment group\'s change. Here: DiD = (71% − 64%) − (66% − 62%) = 7pp − 4pp = 3pp. The 4pp control group improvement captures platform-wide or seasonal effects that elevated activation across all cities. Reporting 7pp overstates the effect of the new onboarding by more than 2x.',
      },
      {
        id: 'd',
        label: 'The analysis is invalid because this wasn\'t a randomized experiment — regional rollouts can never be used for causal inference.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'Randomization is not a prerequisite for causal inference — it\'s one way to satisfy the assumption of comparable counterfactuals. Diff-in-diff is specifically designed for non-randomized rollouts. The key assumption is parallel trends: treatment and control cities must have trended similarly before the rollout. If pre-period trends were parallel, DiD yields a valid causal estimate. The regional rollout here is a legitimate DiD setup, provided you verify the pre-trend.',
      },
    ],

    seniorRead: {
      shortAnswer: 'The DiD estimate is 3pp, not 7pp. The 4pp control group gain reflects a secular trend that would have lifted treatment cities regardless of the new onboarding — subtracting it is the entire point of diff-in-diff.',
      why: 'Diff-in-diff identifies causal effects in non-randomized settings by comparing the change in the treatment group against the change in a control group over the same period. The control group\'s change is the counterfactual: what would have happened to the treatment group absent the intervention. The causal estimate is (treatment post − treatment pre) − (control post − control pre). Here that is 7pp − 4pp = 3pp. The key assumption — parallel trends — requires that treatment and control cities would have moved together in the absence of the new onboarding. You validate this by plotting pre-period trends for both groups: if they were running in parallel before the rollout, the assumption is credible.',
      commonMistake: 'Reading the treatment group\'s raw pre-to-post change as the causal effect. This ignores that external forces (seasonality, product releases, macro trends) affect all groups simultaneously. The control group exists precisely to measure those background forces so you can subtract them out. **Weak answer pattern:** The candidate says "treatment cities gained 7pp activation rate after the new onboarding and that\'s the causal effect — we should present this as a 7pp improvement in the business case" without subtracting the control group\'s 4pp gain during the same period, attributing the full pre-to-post change to the intervention. **Interviewer follow-up that exposes it:** "Control cities also gained 4pp over the same period without the new onboarding — does that change your estimate of the causal effect, and how?"',
      interviewPhrase: '"The 7pp is what treatment cities gained — but control cities also gained 4pp during the same period without the new onboarding. That 4pp is the trend that would have happened anyway. The diff-in-diff estimate is 7 minus 4, which is 3pp. That\'s the number for the deck."',
      connectsTo: ['review', 'design'],
    },
  },

  // ─────────────────────────────────────────────
  // STAT18 — Regression Discontinuity (Senior)
  // Trap: accepting the RD estimate without manipulation check, and misapplying LATE to policy
  // ─────────────────────────────────────────────
  {
    id: 'stat18-rdd',
    title: 'Does the Badge Drive $830 More GMV?',
    subtitle: 'Regression discontinuity — threshold effects vs. policy extrapolation',
    concept: 'regression-discontinuity',
    difficulty: 'senior',
    isFree: false,
    companies: ['Airbnb', 'Etsy', 'eBay'],
    linkedConceptIds: ['regression-discontinuity', 'causal-inference', 'selection-bias'],
    linkedScenarioIds: [],
    linkedDesignIds: [],
    sfPrerequisites: [{ id: 'sf23', title: 'Regression Discontinuity' }],

    situation: {
      company: 'Crafted',
      product: 'Handmade goods marketplace — seller-side GMV optimization',
      context: 'Crafted awards sellers a "Top Seller" badge when they accumulate 100 reviews. An analyst looks at the last 6 months of data: sellers with 95–104 reviews show a sharp jump in monthly GMV at exactly the 100-review threshold. The analyst writes: "The Top Seller badge causes $830/month GMV uplift — we should lower the threshold to 80 reviews to give more sellers the badge and grow total GMV."',
      decisionPressure: 'The growth team wants to lower the badge threshold before the holiday season. The analyst\'s $830 figure is the projected per-seller GMV gain in the business case.',
    },

    setup: {
      metric: 'Monthly GMV per seller',
      baseline: 'Sellers with 95–99 reviews: $2,800/month average GMV',
      observedResult: 'Sellers with 100–104 reviews: $3,650/month average GMV — a $850 jump at the 100-review threshold',
      sampleInfo: '6-month window, sellers in the 95–104 review band. Sharp discontinuity at exactly 100 reviews.',
      caveat: 'Review counts cluster noticeably at 100 — there are more sellers with exactly 100 reviews than you would expect from a smooth distribution. The $830 estimate uses a wide bandwidth (95–104 reviews).',
    },

    question: 'Evaluate this claim.',
    claim: '"The Top Seller badge causes $830/month GMV uplift — we should lower the threshold to 80 reviews to give more sellers the badge and grow GMV."',

    options: [
      {
        id: 'a',
        label: 'Correct — the sharp discontinuity at 100 reviews is exactly what RD is designed to detect. The $830 estimate is valid and the policy recommendation follows directly.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'The RD design is appropriate for estimating the badge effect at the threshold, but two serious problems remain before the estimate can be used for policy. First, the clustering of sellers at exactly 100 reviews is a red flag for manipulation — sellers may be soliciting reviews to cross the threshold, which violates the RD assumption that units cannot precisely control their score. Second, even if the $830 estimate is valid at threshold = 100, it does not tell you what the effect would be at threshold = 80 — that is an out-of-sample extrapolation.',
      },
      {
        id: 'b',
        label: 'The RD estimate is the right approach, but $830 may be biased by the wide bandwidth — a narrower bandwidth around 100 would give a more precise local estimate.',
        isCorrect: false,
        level: 'partial',
        feedback: 'Bandwidth choice does matter — using 95–104 (a ±5 band) risks including sellers who differ from threshold-crossers in systematic ways. A narrower bandwidth (98–102 or 99–101) would tighten the local comparison. But bandwidth is not the most critical issue here. The manipulation check (bunching at 100) and the external validity problem (the policy changes the threshold to 80) are more fundamental flaws in the analyst\'s argument.',
      },
      {
        id: 'c',
        label: 'The RD estimate needs a manipulation check first — the clustering at 100 reviews suggests sellers may be gaming the threshold. And even if $830 is valid at threshold = 100, lowering the threshold to 80 is an out-of-sample extrapolation that the estimate doesn\'t support.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct on both counts. The McCrary density test checks whether there is statistically significant bunching just above the threshold — if sellers can solicit reviews to hit exactly 100, the groups just below and just above are no longer comparable, and the RD estimate is biased. Separately, RD estimates a Local Average Treatment Effect at the threshold. The effect of the badge for sellers who organically reach 100 reviews says nothing about the effect for sellers who would receive the badge at 80 — those are different populations with different baseline quality and customer trust. The policy recommendation requires an entirely separate analysis.',
      },
      {
        id: 'd',
        label: 'RD cannot be used here at all because review counts are not randomly assigned — only randomized experiments can estimate badge effects.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'RD does not require random assignment — it exploits a threshold rule to create a locally valid comparison. The key assumption is that sellers cannot precisely control whether they end up just below or just above the threshold (the no-manipulation assumption), not that review counts are random. If the no-manipulation assumption holds, sellers near the cutoff are comparable and the discontinuity is causal. The question here is whether that assumption actually holds, given the bunching at 100.',
      },
    ],

    seniorRead: {
      shortAnswer: 'The RD design is valid in principle, but the estimate needs a manipulation (McCrary) test before it can be trusted. And even a clean $830 estimate applies only at the current threshold — it cannot be extrapolated to justify moving the threshold to 80.',
      why: 'Regression discontinuity identifies causal effects by exploiting a sharp rule: units just below a threshold are used as the counterfactual for units just above. The key assumption is no manipulation — units cannot precisely sort themselves to one side of the cutoff. If sellers are gaming the review count to hit exactly 100, the groups on either side differ systematically (manipulators vs. non-manipulators), and the discontinuity reflects selection, not the badge effect. The McCrary density test checks for this by looking for a statistically significant spike in the density of the running variable (review count) just above the cutoff. Separately, RD estimates a Local Average Treatment Effect at the specific threshold studied. Changing the threshold changes the population of marginal crossers, invalidating any extrapolation.',
      commonMistake: 'Accepting the RD estimate without running the manipulation test, and then treating the threshold-local effect as the effect of the policy change. Both are errors: the first questions the estimate\'s internal validity; the second questions its external validity. **Weak answer pattern:** The candidate says "the sharp $830 discontinuity at exactly 100 reviews proves the badge causes the GMV lift and we should lower the threshold to 80 reviews to expand the effect" — accepting the RD estimate as a causal policy lever without checking for review clustering at 100 (which would indicate gaming) or recognizing that the LATE applies only at the threshold, not at a new threshold of 80. **Interviewer follow-up that exposes it:** "There are more sellers with exactly 100 reviews than you\'d expect from the distribution — what does that pattern suggest about the RD assumption, and what would you check?"',
      interviewPhrase: '"The jump at 100 reviews looks like a clean discontinuity, but before I use that number I\'d check for bunching — plot the review count distribution and run a McCrary test. If sellers are soliciting reviews to hit 100, the RD estimate is biased. And even if it\'s clean, the $830 applies to sellers crossing 100 organically. That doesn\'t tell you anything about what happens if you give the badge at 80 — that\'s a different population."',
      connectsTo: ['review', 'design'],
    },
  },

  // ─────────────────────────────────────────────
  // STAT19 — Synthetic Control (Senior)
  // Trap: using the most convenient single-country comparison without checking pre-trend fit
  // ─────────────────────────────────────────────
  {
    id: 'stat19-synthetic-control',
    title: 'Is the US a Good Counterfactual for Canada?',
    subtitle: 'Synthetic control vs. convenience comparison',
    concept: 'synthetic-control',
    difficulty: 'senior',
    isFree: false,
    companies: ['Apple', 'Google', 'Spotify'],
    linkedConceptIds: ['synthetic-control', 'diff-in-diff', 'counterfactual', 'causal-inference'],
    linkedScenarioIds: [],
    linkedDesignIds: [],
    sfPrerequisites: [{ id: 'sf24', title: 'Synthetic Control' }],

    situation: {
      company: 'Spark',
      product: 'Social feed app — 12M DAU globally',
      context: 'Spark launched a "collaborative playlist" feature in Canada only (a country-level rollout, not an A/B test). Eight weeks later: Canadian DAU/user is up 14%. The US — which did not receive the feature — is up 3% over the same period. The analytics team writes: "The collaborative playlist feature drove 11pp DAU/user improvement in Canada (14% minus 3% US comparison)."',
      decisionPressure: 'The feature team wants to use the 11pp figure to justify a global rollout in the next sprint planning session.',
    },

    setup: {
      metric: 'DAU/user (daily active users divided by total registered users, expressed as a percentage)',
      baseline: '8-week pre-period: Canada and US tracked each other loosely but Canada had slightly higher baseline engagement',
      observedResult: 'Post-launch 8 weeks: Canada +14%, US +3% over the same period',
      sampleInfo: 'Country-level rollout. Canada = treated unit. US used as single control. Other comparable markets (Australia, UK, NZ, Ireland) available but not used.',
      caveat: 'The US is structurally larger, has different content consumption patterns, and showed diverging engagement trends from Canada in the 3 weeks prior to the Canadian launch.',
    },

    question: 'Evaluate this claim.',
    claim: '"The collaborative playlist feature drove 11pp DAU/user improvement in Canada (14% minus 3% US comparison)."',

    options: [
      {
        id: 'a',
        label: 'Correct — the US is the natural comparison for Canada. The 11pp difference is a valid diff-in-diff estimate.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'The US is geographically convenient but not necessarily a good counterfactual for Canada. A valid diff-in-diff requires that the control unit (US) would have trended like Canada in the absence of the feature — the parallel trends assumption. If Canada and the US had diverging pre-period trends (which the caveat describes), the simple 14% − 3% subtraction absorbs those structural differences and does not isolate the feature effect.',
      },
      {
        id: 'b',
        label: 'Directionally plausible, but the US is a weak single-country counterfactual. A synthetic control using a weighted mix of comparable markets would give a more credible estimate.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. When a single clean control unit does not exist, synthetic control constructs a weighted combination of donor units — here, Australia, UK, NZ, Ireland — that best replicates Canada\'s pre-period DAU/user trend. The quality of the synthetic control is measured by how closely it matches Canada\'s pre-period outcomes (R² of pre-period fit). If the synthetic control implies 5% expected growth in Canada absent the feature, the causal estimate is 9pp, not 11pp. The US-only comparison is directionally useful as a sanity check but insufficient as the primary estimate.',
      },
      {
        id: 'c',
        label: 'Invalid — country-level rollouts can never support causal inference because there is only one treated unit.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'Single treated-unit studies are challenging but not impossible for causal inference. Synthetic control was specifically developed for exactly this setting — one treated unit, multiple potential control units. The method builds a counterfactual for the treated unit by weighting donor countries to match its pre-treatment trajectory. The validity depends on the quality of the pre-period fit, not on having multiple treated units.',
      },
      {
        id: 'd',
        label: 'The 11pp estimate is biased upward because the US is much larger than Canada, so the comparison is not apples-to-apples.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'Population size alone does not invalidate a comparison — DAU/user is already normalized per registered user, so scale differences are removed. The problem with the US as a counterfactual is not its size but its pre-period trend divergence from Canada. A large country can be a valid synthetic control donor if it tracks the treated unit\'s pre-period outcomes well. Synthetic control weights donors precisely to match pre-period trends regardless of their absolute size.',
      },
    ],

    seniorRead: {
      shortAnswer: 'The 11pp estimate uses the US as a convenience counterfactual without verifying that US and Canada trended in parallel before the launch. Synthetic control — a weighted mix of Australia, UK, NZ, and Ireland that best matches Canada\'s pre-period — would give a more defensible causal estimate.',
      why: 'Synthetic control addresses the fundamental problem of single treated units: there is no natural control group. The method constructs one by finding a weighted combination of donor units (comparable countries, states, or markets) that best replicates the treated unit\'s pre-treatment outcome trajectory. Validity is assessed by the pre-period fit: if the synthetic Canada closely tracks actual Canada before the feature launch (high R²), the synthetic control is credible as a counterfactual. Key assumptions: no spillover from Canada to donor markets (Canadian users are not influencing Australian behavior through the playlist feature), and the donor units themselves are not treated. The US fails on pre-period fit if the two markets were diverging before the launch.',
      commonMistake: 'Defaulting to the most geographically or culturally familiar single country as the control without testing whether it actually tracks the treated unit\'s pre-period trend. The pre-period parallel trend is the assumption that must be verified, not assumed. **Weak answer pattern:** The candidate says "the synthetic control estimate is directionally informative and the pre-period fit looks good — this is enough evidence to present a causal 11% lift to the CEO" without demanding to see the pre-period fit as a time series plot or questioning whether Canada and the UK share US content trends through shared creators. **Interviewer follow-up that exposes it:** "Canada and the UK are geographically and culturally similar to the US and also use the same English-language creator content — why might that similarity create a problem for synthetic control, and what would a valid donor pool look like?"',
      interviewPhrase: '"Before I use the US as the counterfactual I\'d plot Canada and US DAU/user for the 8 weeks before the launch. If they were diverging, the 11pp estimate is absorbing that pre-existing divergence. Synthetic control — using a weighted mix of Australia, UK, New Zealand, Ireland — gives us a counterfactual that actually fits Canada\'s pre-period trajectory. The estimate shifts depending on how well that synthetic fits."',
      connectsTo: ['review', 'design'],
    },
  },

  // ─────────────────────────────────────────────
  // STAT20 — Instrumental Variables (Selection Bias in OLS) (Senior)
  // Trap: accepting OLS coefficient as causal when treatment is self-selected
  // ─────────────────────────────────────────────
  {
    id: 'stat20-iv-selection',
    title: 'Is $1,200 the Causal Effect of Featured Placement?',
    subtitle: 'IV vs. OLS — selection bias and the LATE',
    concept: 'instrumental-variables',
    difficulty: 'senior',
    isFree: false,
    companies: ['Amazon', 'Shopify', 'Stripe'],
    linkedConceptIds: ['instrumental-variables', 'selection-bias', 'causal-inference', 'endogeneity'],
    linkedScenarioIds: [],
    linkedDesignIds: [],
    sfPrerequisites: [{ id: 'sf25', title: 'Instrumental Variables' }],

    situation: {
      company: 'Crafted',
      product: 'Handmade goods marketplace — seller promotions program',
      context: 'Crafted runs a promotions program where sellers who opt in receive featured placement on category pages. An analyst runs an OLS regression of "received featured placement (0/1)" on "monthly GMV" and finds a $1,200/month coefficient. A senior analyst pushes back: "Sellers who opt into promotions are already higher quality — the OLS estimate is biased." The analyst responds: "The regression controls for reviews and category, so the estimate is clean."',
      decisionPressure: 'The promotions team wants to use the $1,200 figure to calculate ROI and expand the program budget in the next planning cycle.',
    },

    setup: {
      metric: 'Monthly GMV per seller',
      baseline: 'Non-promoted sellers average $2,400/month GMV',
      observedResult: 'OLS coefficient on featured placement = +$1,200/month (p < 0.001, controls for review count and category)',
      sampleInfo: 'All active sellers over 6 months. ~18% opted into the promotions program. Promotion email invites were A/B tested — 50% of eligible sellers received an invite, 50% did not.',
      caveat: 'Sellers self-select into the program. The A/B tested email invite (which randomly determined who received the invitation) was not used in the OLS regression.',
    },

    question: 'Evaluate this claim.',
    claim: '"The regression estimate of $1,200/month GMV uplift from featured placement is the causal effect of the promotion program."',

    options: [
      {
        id: 'a',
        label: 'Correct — the regression controls for review count and category, which are the main confounders. The $1,200 estimate is causal.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'Controlling for observable confounders (reviews, category) does not remove selection bias from unobservables. Sellers who opt into promotions likely differ from non-participants in ways that are hard to measure: motivation, product quality, pricing strategy, customer service responsiveness. These unobserved characteristics independently drive higher GMV. Including review count and category in the regression does not close these backdoor paths — it only adjusts for the variables you happened to include.',
      },
      {
        id: 'b',
        label: 'Partially right — OLS is biased, but the direction is unclear. Promoted sellers might be lower quality if only struggling sellers opt in for a boost.',
        isCorrect: false,
        level: 'partial',
        feedback: 'The direction of selection bias requires domain reasoning, not just statistical skepticism. In most marketplace settings, promotion opt-in is positively correlated with seller quality: higher-quality sellers have more to gain from visibility, understand the platform better, and are more engaged. The bias is likely upward — the OLS coefficient overstates the causal effect. While the direction could theoretically go either way, the prior here strongly suggests upward bias, and the setup confirms this is the senior analyst\'s concern.',
      },
      {
        id: 'c',
        label: 'Wrong — OLS is biased by selection. The A/B tested email invite is a valid instrument: it affects whether sellers received the promotion but has no direct effect on GMV. The IV estimate (invite → GMV) / (invite → take-up rate) gives the LATE for compliers, not the ATE.',
        isCorrect: true,
        level: 'strong',
        feedback: 'Correct. The randomly assigned email invite satisfies the three IV conditions: relevance (receiving the invite increases take-up probability — check with the first-stage F-statistic), exogeneity (random assignment means the invite is uncorrelated with unobserved seller quality), and exclusion restriction (the invite affects GMV only through whether the seller enters the promotions program — not through any direct channel). The IV estimate = (ITT effect on GMV) / (first-stage take-up rate) — this is the Local Average Treatment Effect for compliers: sellers who took up the promotion because they received the invite. This is narrower than the ATE for all sellers, but it is causal.',
      },
      {
        id: 'd',
        label: 'Invalid — even IV cannot solve the selection problem here because the instrument (email invite) was only sent to eligible sellers, not all sellers.',
        isCorrect: false,
        level: 'wrong',
        feedback: 'Restricting the instrument to an eligible subset is standard practice in IV — it does not invalidate the design. The IV estimate applies to compliers within the eligible population, which is a well-defined subgroup. The relevant question is whether random assignment within the eligible pool is credible (yes, it was explicitly A/B tested) and whether the exclusion restriction holds (receiving an invite email should not directly affect GMV through any channel other than program participation). The eligibility restriction narrows the LATE to eligible compliers but does not break the IV logic.',
      },
    ],

    seniorRead: {
      shortAnswer: 'OLS is biased upward because promoted sellers self-select based on unobserved quality. The randomly assigned email invite is a valid instrument — use it. The IV estimate gives the LATE for sellers who joined the program because of the invite, which is more honest and more actionable than the biased OLS coefficient.',
      why: 'Endogeneity arises when the treatment variable (featured placement) is correlated with the error term — here, with unobserved seller quality. OLS cannot distinguish "featured placement drives GMV" from "high-quality sellers both opt into promotions and earn more GMV." Instrumental variables break this link by using a variable — the randomly assigned email invite — that shifts treatment assignment without being correlated with the unobservable confounder. The IV estimator is the ratio of the reduced-form effect (invite → GMV) to the first-stage effect (invite → take-up). This gives the LATE: the causal effect of the promotion for sellers who were induced to participate by the invite (compliers). Importantly, LATE is not the same as ATE — it excludes always-takers (sellers who would join regardless of invite) and never-takers (sellers who would not join even with an invite).',
      commonMistake: 'Assuming that adding control variables to OLS removes all confounding. Observed controls only close backdoor paths through the variables you measured. Unobserved confounders — seller motivation, product quality, pricing discipline — remain open paths unless you use a design-based solution like IV, matching on a richer covariate set, or a randomized experiment. **Weak answer pattern:** The candidate says "the OLS regression controls for review count and category which are the main drivers of GMV, so the $1,200 estimate should be considered causal" — treating control variables as a substitute for a valid identification strategy and missing that sellers who opt into promotions are systematically different from non-participants on unobservable dimensions like motivation and pricing discipline. **Interviewer follow-up that exposes it:** "The regression controls for reviews and category — what characteristics of a seller who opts into the promotions program might still be correlated with higher GMV that you can\'t observe or control for?"',
      interviewPhrase: '"The OLS estimate is almost certainly biased upward — sellers who opt into promotions are not a random sample, they\'re the engaged, higher-quality sellers who would earn more GMV anyway. But you have a clean instrument sitting unused: the email invite was A/B tested. Use that. The IV estimate divides the invite\'s effect on GMV by its effect on take-up, and that gives you the causal effect for the sellers who actually responded to the program."',
      connectsTo: ['review', 'design'],
    },
  },
];

export const statsModulesById = Object.fromEntries(statsModules.map(m => [m.id, m]));
