// Product Analytics Lab — Experiment Design Room Scenario Data
// V1.2 — 4 scenarios, all paired with Review Room counterparts

export const designScenarios = [

  // ─────────────────────────────────────────────
  // D01 — Design the Checkout Test (FREE · Analyst)
  // Paired with: s01-checkout-trap
  // Core trap: metric selection — picking conversion rate without defining revenue protection
  // ─────────────────────────────────────────────
  {
    id: 'd01-checkout-test',
    title: 'Design the Checkout Test',
    subtitle: 'Crestline Home wants to remove their checkout upsell widget. Design the experiment.',
    isFree: true,

    guestPreview: true,
    difficulty: 'analyst',
    industry: 'ecommerce',
    scenarioFamily: 'metric_conflict',
    pairedReviewScenarioId: 's01-checkout-trap',

    context: {
      company: 'Crestline Home',
      product: 'Direct-to-consumer e-commerce storefront — premium home goods, ~$55M ARR',
      team: 'Growth & Conversion team',
      background: 'Crestline\'s checkout page has a "complete your look" upsell carousel widget that fires after cart add. The design team believes it\'s friction. Merchandising believes it drives revenue. Engineering has capacity to A/B test removing it. Your job: design the experiment before any data is collected.',
      featureProposal: 'Remove the upsell widget from the checkout flow. Hypothesis: friction reduction improves checkout completion enough to offset any lost upsell revenue.',
      businessPressure: 'Q4 starts in 3 weeks. The Head of Growth wants a fast test. The VP of E-commerce wants a clean decision before the holiday campaign launches.',
      constraints: [
        '14-day maximum runtime before the Q4 freeze',
        'All checkout traffic is eligible — no major cohort exclusions needed',
        '~42,000 users reach checkout per day',
        'Engineering can support a standard 50/50 split',
      ],
    },

    designPhases: [
      {
        id: 'framing',
        label: 'Framing',
        hint: 'What are you testing and why?',
        fields: [
          {
            id: 'businessDecision',
            label: 'What business decision will this experiment inform?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'bd-a',
                label: 'Whether to permanently remove the upsell widget from checkout',
                scoreValue: 2,
                rationale: 'Correct. The decision is binary and clearly framed: keep or remove. This scopes the test correctly and makes the pre-committed decision rule straightforward.',
              },
              {
                id: 'bd-b',
                label: 'Whether the checkout UX needs improvement',
                scoreValue: 0,
                rationale: 'Too vague. "Needs improvement" is not a decision — it\'s a hypothesis. A test that can only tell you "yes, something is suboptimal" has no clear ship/no-ship output.',
              },
              {
                id: 'bd-c',
                label: 'Whether conversion rate is the right metric for checkout optimization',
                scoreValue: 0,
                rationale: 'This is a meta-question about measurement, not the business decision the experiment is designed to answer. You answer this question before designing the test.',
              },
              {
                id: 'bd-d',
                label: 'Whether removing the widget or redesigning it is the better path',
                scoreValue: 1,
                rationale: 'Reasonable framing — but this experiment only tests removal, not a redesign. You can\'t decide between two variants if only one is tested. Incomplete.',
              },
            ],
          },
          {
            id: 'hypothesis',
            label: 'Select the strongest hypothesis formulation',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'hyp-a',
                label: 'Removing the upsell widget will increase checkout conversion rate by reducing friction, and the conversion lift will exceed the revenue lost from removing the widget.',
                scoreValue: 2,
                rationale: 'Strong. Directional, mechanism-specified, and includes the key tradeoff (conversion gain vs. revenue loss). This is a testable, decision-informing hypothesis.',
              },
              {
                id: 'hyp-b',
                label: 'Users who see the upsell widget are less likely to complete checkout.',
                scoreValue: 1,
                rationale: 'Correct direction and testable, but incomplete. It only covers the friction side of the hypothesis — it doesn\'t address whether the revenue tradeoff is worth it, which is what the business actually cares about.',
              },
              {
                id: 'hyp-c',
                label: 'Removing friction from checkout will improve the user experience.',
                scoreValue: 0,
                rationale: 'Not a useful hypothesis. "Improves user experience" is not measurable. There\'s no clear metric, direction, or mechanism. This would make any experimental outcome ambiguous.',
              },
              {
                id: 'hyp-d',
                label: 'Checkout conversion rate will increase by at least 2% if the upsell widget is removed.',
                scoreValue: 1,
                rationale: 'Specific and testable, but only covers one metric. A checkout test that ignores revenue, AOV, and refund rate is incomplete — you might get the 2% lift and still make the business worse.',
              },
            ],
          },
        ],
      },
      {
        id: 'setup',
        label: 'Setup',
        hint: 'Who gets treated, and how?',
        fields: [
          {
            id: 'eligiblePopulation',
            label: 'Who should be included in the experiment?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'ep-a',
                label: 'All users who reach the checkout page during the test window',
                scoreValue: 2,
                rationale: 'Correct. The feature lives on the checkout page and affects all users who reach it. Restricting eligibility further would reduce power without improving validity.',
              },
              {
                id: 'ep-b',
                label: 'Only new users, to avoid confounding repeat purchase behavior',
                scoreValue: 0,
                rationale: 'This would invalidate external validity for returning customers — a significant segment in an e-commerce site. The widget is shown to all users; restricting to new users produces a result that doesn\'t generalize.',
              },
              {
                id: 'ep-c',
                label: 'Only users with cart values above $50, since they\'re most likely to respond to upsells',
                scoreValue: 0,
                rationale: 'Restricting to high-cart-value users would bias the test toward users where upsell revenue loss is highest. This inflates apparent harm and doesn\'t reflect the true average effect.',
              },
              {
                id: 'ep-d',
                label: 'All users who reach checkout, excluding those who arrived via paid ad campaigns',
                scoreValue: 1,
                rationale: 'Reasonable if paid users have different intent, but adds complexity without clear justification. Unless there\'s a specific reason to believe paid traffic responds differently, excluding them reduces generalizability.',
              },
            ],
          },
          {
            id: 'randomizationUnit',
            label: 'What should be the randomization unit?',
            type: 'single_select',
            conceptLinks: ['randomization-unit'],
            options: [
              {
                id: 'ru-a',
                label: 'User (cookie/account)',
                scoreValue: 2,
                rationale: 'Correct. User-level randomization ensures each person consistently sees one version. This respects the durable nature of the checkout experience and maintains independence between observations.',
              },
              {
                id: 'ru-b',
                label: 'Session',
                scoreValue: 0,
                rationale: 'Session-level randomization means the same user could see both versions. This violates independence, inflates apparent sample size, and produces biased estimates — especially harmful for a checkout flow where user expectations may carry across sessions.',
              },
              {
                id: 'ru-c',
                label: 'Cart (each cart gets independently assigned)',
                scoreValue: 1,
                rationale: 'Slightly better than session-level but still problematic. A user can have multiple carts. Multiple exposures for one user violates the independence assumption unless cart history is definitively isolated.',
              },
              {
                id: 'ru-d',
                label: 'Device',
                scoreValue: 0,
                rationale: 'Device-level assignment causes contamination for users who shop on multiple devices — common in e-commerce. The same user could see different versions, polluting both arms.',
              },
            ],
          },
          {
            id: 'unitOfAnalysis',
            label: 'What is the unit of analysis for computing metrics?',
            type: 'single_select',
            conceptLinks: ['unit-of-analysis'],
            options: [
              {
                id: 'ua-a',
                label: 'User — compute conversion rate as users who completed checkout / total users assigned',
                scoreValue: 2,
                rationale: 'Correct. User-level analysis matches user-level randomization. Computing the metric at the same level avoids the variance deflation that comes from treating sessions from the same user as independent.',
              },
              {
                id: 'ua-b',
                label: 'Session — compute conversion rate as sessions that converted / total sessions',
                scoreValue: 0,
                rationale: 'Mismatches the randomization unit. Sessions from the same user are correlated — treating them as independent deflates standard errors and produces overconfident p-values. This is a common mistake that makes results look more significant than they are.',
              },
              {
                id: 'ua-c',
                label: 'Order — compute metrics at the individual order level',
                scoreValue: 0,
                rationale: 'Order-level analysis is even more mismatched. Users can have multiple orders. Treating each order as independent introduces serious correlation structure that standard t-tests can\'t handle.',
              },
            ],
          },
        ],
      },
      {
        id: 'metrics',
        label: 'Metrics',
        hint: 'What will you measure?',
        fields: [
          {
            id: 'primaryMetric',
            label: 'What is the primary metric for this experiment?',
            type: 'single_select',
            conceptLinks: ['primary-metric'],
            options: [
              {
                id: 'pm-a',
                label: 'Checkout conversion rate (users who completed checkout / users who reached checkout)',
                scoreValue: 1,
                rationale: 'Reasonable but incomplete as a standalone primary. This is the natural friction metric, but it ignores revenue. A test that ships on conversion alone can miss the business outcome entirely — which is exactly what The Checkout Trap reveals.',
              },
              {
                id: 'pm-b',
                label: 'Revenue per user session (total revenue / users who reached checkout)',
                scoreValue: 2,
                rationale: 'Stronger primary. This captures both sides of the tradeoff: conversion gains and revenue losses from removing the upsell. A 2% conversion lift with a -3% revenue per session is a business failure. This metric reflects that.',
              },
              {
                id: 'pm-c',
                label: 'Net revenue impact (total treatment revenue minus total control revenue)',
                scoreValue: 2,
                rationale: 'Also strong. Directly answers the business question: is this change net positive or negative in revenue terms? Slightly less normalized than revenue per user, but the correct spirit.',
              },
              {
                id: 'pm-d',
                label: 'Click-through rate on the upsell widget (as a proxy for engagement)',
                scoreValue: 0,
                rationale: 'Wrong direction entirely. If the widget is removed from treatment, there\'s nothing to click. This metric only measures control behavior. It cannot be a primary metric for a removal test.',
              },
            ],
          },
          {
            id: 'guardrailMetrics',
            label: 'Which metrics should be guardrails? (Select all that apply)',
            type: 'multi_select',
            conceptLinks: ['guardrail-metric'],
            options: [
              {
                id: 'gm-a',
                label: 'Average order value (AOV)',
                scoreValue: 1,
                rationale: 'Good guardrail. AOV captures the upsell contribution directly. If AOV drops significantly, the widget was contributing meaningfully and removal is harmful.',
              },
              {
                id: 'gm-b',
                label: '7-day refund rate',
                scoreValue: 1,
                rationale: 'Important guardrail that many analysts miss. If removing the widget causes more impulsive purchases (by reducing consideration time), refund rates could spike. This is a downstream signal of product-market fit for individual orders.',
              },
              {
                id: 'gm-c',
                label: 'Page load time / latency',
                scoreValue: 0,
                rationale: 'Removing a widget should improve latency, not harm it. This is not a meaningful guardrail — it\'s more of an engineering health metric that should improve in treatment.',
              },
              {
                id: 'gm-d',
                label: 'Customer support contact rate',
                scoreValue: 0,
                rationale: 'Too lagging and too noisy for a 14-day experiment. Support contacts related to this feature would be a tiny fraction of total contacts. The signal-to-noise is too low to be meaningful as a guardrail.',
              },
            ],
          },
          {
            id: 'diagnosticMetrics',
            label: 'Which metrics should be tracked as diagnostics (informational only)?',
            type: 'multi_select',
            conceptLinks: [],
            options: [
              {
                id: 'dm-a',
                label: 'Cart abandonment rate at the checkout step',
                scoreValue: 1,
                rationale: 'Good diagnostic. Directly measures the friction mechanism the hypothesis claims to address. If conversion rate improves but cart abandonment doesn\'t move, the mechanism is wrong.',
              },
              {
                id: 'dm-b',
                label: 'Time from cart add to purchase completion',
                scoreValue: 1,
                rationale: 'Good diagnostic for understanding the friction mechanism. Faster checkout without the widget would confirm the hypothesis about friction reduction.',
              },
              {
                id: 'dm-c',
                label: 'Upsell widget CTR (in control only)',
                scoreValue: 1,
                rationale: 'Valid diagnostic for understanding the baseline widget engagement and sizing the revenue at stake.',
              },
              {
                id: 'dm-d',
                label: '30-day repeat purchase rate',
                scoreValue: 0,
                rationale: 'Too long-horizon for a 14-day test. 30-day repeat purchase behavior cannot be measured within the test window. Including it as a diagnostic creates confusion without providing signal.',
              },
            ],
          },
        ],
      },
      {
        id: 'logistics',
        label: 'Logistics',
        hint: 'How long, how large, how attributed?',
        fields: [
          {
            id: 'runtime',
            label: 'How long should this experiment run?',
            type: 'single_select',
            conceptLinks: ['novelty-effect', 'mde'],
            options: [
              {
                id: 'rt-a',
                label: '14 days — maximum allowed before Q4 freeze',
                scoreValue: 2,
                rationale: 'Correct given constraints. 14 days at ~42k users/day gives ~588k users — well powered for a 1.5% lift on conversion. Importantly, 14 days captures a full week-over-week cycle and reduces novelty effect risk.',
              },
              {
                id: 'rt-b',
                label: '7 days — enough traffic to get significance quickly',
                scoreValue: 1,
                rationale: 'Possible if statistical power is sufficient, but risky. 7 days may catch a day-of-week effect (weekdays vs. weekends have different checkout behavior). The full 14 days is safer and uses the available window.',
              },
              {
                id: 'rt-c',
                label: '3 days — fast decision, enough signal for a major feature',
                scoreValue: 0,
                rationale: 'Too short for a checkout test. Three days doesn\'t capture the full weekly purchase cycle. Day-of-week effects will contaminate the result, and refund rates (a key guardrail) won\'t have time to manifest.',
              },
              {
                id: 'rt-d',
                label: 'Run until significance — stop as soon as p < 0.05',
                scoreValue: 0,
                rationale: 'Classic peeking problem. Stopping early when the result looks good inflates Type I error significantly. This guarantees an over-confident result and may miss guardrail signals that take longer to emerge.',
              },
            ],
          },
          {
            id: 'attributionWindow',
            label: 'What attribution window should apply to revenue metrics?',
            type: 'single_select',
            conceptLinks: ['right-censoring'],
            options: [
              {
                id: 'aw-a',
                label: 'Same-session only — revenue from the checkout session',
                scoreValue: 2,
                rationale: 'Correct for a checkout flow experiment. The mechanism (upsell removal) acts during the checkout session. Cross-session attribution introduces noise from behavior unrelated to the widget.',
              },
              {
                id: 'aw-b',
                label: '7-day post-exposure window to capture follow-up purchases',
                scoreValue: 1,
                rationale: 'Reasonable if you believe removing the widget changes subsequent purchase intent, but this adds complexity and introduces confounding from non-experiment-related purchases in the 7-day window.',
              },
              {
                id: 'aw-c',
                label: '30-day window to capture LTV impact',
                scoreValue: 0,
                rationale: 'The test only runs 14 days — a 30-day attribution window can\'t be fully observed within the test period. This is a right-censoring problem: most users won\'t have completed their 30-day window before the test ends.',
              },
            ],
          },
          {
            id: 'sampleSizeConcern',
            label: 'What is the main sample size / power concern for this experiment?',
            type: 'single_select',
            conceptLinks: ['power', 'mde', 'confidence-interval'],
            options: [
              {
                id: 'ss-a',
                label: 'None — 42k users/day × 14 days = ~580k users is more than sufficient for any reasonable MDE',
                scoreValue: 1,
                rationale: 'Partially correct. The experiment is well-powered for conversion rate lifts of 1-2%. However, guardrail metrics (especially refund rate) may have much lower base rates, requiring more users to detect meaningful changes. Don\'t assume all metrics are equally powered.',
              },
              {
                id: 'ss-b',
                label: 'Primary metric is well-powered, but guardrail metrics with low base rates (e.g. refund rate) may require careful interpretation',
                scoreValue: 2,
                rationale: 'Correct and complete. High-traffic tests have high power on common metrics, but rare events (refunds, errors) may still be underpowered for small effects. Checking the MDE for each metric separately is the right approach.',
              },
              {
                id: 'ss-c',
                label: 'The test needs more traffic — 14 days is not enough to detect a real effect',
                scoreValue: 0,
                rationale: 'Incorrect. 580k users is very large. Most reasonable effect sizes (even 0.5% on conversion) are detectable at this sample size. The constraint is time (Q4 freeze), not traffic.',
              },
            ],
          },
        ],
      },
      {
        id: 'risks',
        label: 'Risks & Decision Rule',
        hint: 'What could invalidate this, and what will you do with the result?',
        fields: [
          {
            id: 'trustChecks',
            label: 'Which trust checks should you run before interpreting results? (Select all)',
            type: 'multi_select',
            conceptLinks: ['srm'],
            options: [
              {
                id: 'tc-a',
                label: 'SRM check — verify assignment counts match the intended 50/50 split',
                scoreValue: 2,
                rationale: 'Essential. Always the first check. An SRM on a checkout flow could indicate a redirect issue, a logging gap, or an eligibility bug. All of these would invalidate causal inference.',
              },
              {
                id: 'tc-b',
                label: 'Pre-experiment AA test to verify the randomization system is working',
                scoreValue: 1,
                rationale: 'Best practice, especially for a new experiment infrastructure or a high-stakes test. Confirms the randomization is producing comparable groups before the real test runs.',
              },
              {
                id: 'tc-c',
                label: 'Check that pre-experiment conversion rates are comparable between arms',
                scoreValue: 1,
                rationale: 'Good sanity check if pre-experiment data is available. Comparable baselines increase confidence that the randomization produced balanced groups.',
              },
              {
                id: 'tc-d',
                label: 'Check that refund rates are below 5% in both arms — if above, pause the test',
                scoreValue: 0,
                rationale: 'Refund rate is a guardrail metric, not a trust check. Trust checks verify the experiment mechanism; guardrails measure treatment effects. Conflating them muddies the analysis.',
              },
            ],
          },
          {
            id: 'validityRisks',
            label: 'What are the main validity risks for this experiment? (Select all)',
            type: 'multi_select',
            conceptLinks: ['novelty-effect', 'sutva'],
            options: [
              {
                id: 'vr-a',
                label: 'Novelty effect — users may explore the "new" checkout more than they would long-term',
                scoreValue: 1,
                rationale: 'Lower risk here than for content features — users don\'t typically explore checkout pages. But worth monitoring week-over-week to confirm the effect is stable.',
              },
              {
                id: 'vr-b',
                label: 'Holiday period confounding — Q4 traffic may behave differently than the test-period traffic',
                scoreValue: 2,
                rationale: 'High risk. Q4 starts during the test window. Holiday-season shoppers have different intent, basket sizes, and return rates. Results may not generalize to normal traffic. This should be noted explicitly as a limitation.',
              },
              {
                id: 'vr-c',
                label: 'SUTVA violation — users in different arms may influence each other through social sharing',
                scoreValue: 0,
                rationale: 'Very low risk for a checkout widget removal test. Users don\'t typically discuss checkout UX with each other in ways that would affect purchasing behavior. SUTVA is not a meaningful threat here.',
              },
              {
                id: 'vr-d',
                label: 'Metric gaming — the team might optimize the widget\'s loading to make the test look better',
                scoreValue: 0,
                rationale: 'Not a validity concern for this test — the treatment is simply removing the widget, and the team isn\'t measuring widget performance in treatment. There\'s no gaming vector here.',
              },
            ],
          },
          {
            id: 'decisionRule',
            label: 'What is the pre-committed decision rule?',
            type: 'single_select',
            conceptLinks: ['p-value', 'guardrail-metric', 'multiple-testing'],
            options: [
              {
                id: 'dr-a',
                label: 'Ship if primary metric is significant AND neither guardrail is significantly negative. Hold if either guardrail breaches threshold. Investigate if primary is null but guardrails are clean.',
                scoreValue: 2,
                rationale: 'This is the correct structure. It forces explicit commitment before seeing data, it treats guardrail breaches as blocking (not advisory), and it has a path for null results. This is senior-level decision discipline.',
              },
              {
                id: 'dr-b',
                label: 'Ship if primary metric shows p < 0.05. Review other metrics contextually.',
                scoreValue: 0,
                rationale: 'The word "contextually" is a red flag. It means the team will rationalize whatever they see. A pre-committed rule must specify what "other metrics" means and under what conditions they block shipping.',
              },
              {
                id: 'dr-c',
                label: 'Ship if at least two metrics improve significantly.',
                scoreValue: 0,
                rationale: 'This is a multiple testing problem. Testing multiple metrics without adjustment inflates the false positive rate. "At least two" is an ad hoc threshold with no statistical justification.',
              },
              {
                id: 'dr-d',
                label: 'Ship if primary metric is significant AND all secondary metrics trend positive, even if not significant.',
                scoreValue: 1,
                rationale: 'Better than pure single-metric shipping, but "trend positive" is too weak for guardrails. A guardrail should have a specific threshold, not just a directional requirement.',
              },
            ],
          },
        ],
      },
    ],

    scoringRubric: {
      dimensions: [
        {
          id: 'metric_selection',
          label: 'Metric selection',
          weight: 0.30,
          fieldIds: ['primaryMetric', 'guardrailMetrics'],
        },
        {
          id: 'design_validity',
          label: 'Design validity',
          weight: 0.35,
          fieldIds: ['randomizationUnit', 'unitOfAnalysis', 'trustChecks', 'validityRisks'],
        },
        {
          id: 'decision_discipline',
          label: 'Decision discipline',
          weight: 0.20,
          fieldIds: ['decisionRule', 'sampleSizeConcern'],
        },
        {
          id: 'hypothesis_framing',
          label: 'Hypothesis framing',
          weight: 0.15,
          fieldIds: ['hypothesis', 'businessDecision'],
        },
      ],
      levels: {
        incomplete:    { minScore: 0,    label: 'Incomplete' },
        analyst_ready: { minScore: 0.45, label: 'Analyst-Ready' },
        senior_ready:  { minScore: 0.68, label: 'Senior-Ready' },
        staff_level:   { minScore: 0.85, label: 'Staff-Level' },
      },
    },

    seniorDesign: {
      rationale: 'The most important decision in this design is the primary metric. Checkout conversion rate is the intuitive choice — it\'s what the hypothesis is about. But it\'s the wrong primary metric for a business decision. Revenue per checkout user captures both sides of the tradeoff: the conversion lift and the upsell revenue loss. A test that ships on conversion alone can miss the actual business outcome entirely.\n\nThe second critical decision is the decision rule. Pre-committing before the data arrives is what separates analytical discipline from rationalization. The rule must specify: what constitutes a guardrail breach, what happens when guardrails and primary conflict, and what the null-result path looks like. Without this, every outcome becomes negotiable.\n\nOn trust checks: SRM is always first. A checkout flow with a redirect step or eligibility gate has obvious SRM failure modes. Running the analysis without an SRM check is leaving a trapdoor open.\n\nThe Q4 confound is the sleeper risk. The test window overlaps with holiday season behavioral shifts. Any result should be interpreted with the caveat that Q4 intent and basket sizes may not generalize to steady-state behavior.',
      commonMistakes: [
        {
          mistake: 'Choosing checkout conversion rate as the primary metric',
          consequence: 'You get a significant lift, ship the feature, and discover three weeks later that revenue per session declined. The guardrail you needed was the primary metric.',
          conceptLink: 'primary-metric',
        },
        {
          mistake: 'Using "review contextually" as the decision rule',
          consequence: 'This is not a decision rule. It\'s a permission structure for post-hoc rationalization. You will ship on whatever looks good after the data arrives.',
          conceptLink: 'p-value',
        },
        {
          mistake: 'Not checking for SRM before reading metric effects',
          consequence: 'If there\'s a logging issue or redirect bug affecting assignment balance, every metric is biased. An SRM check takes minutes and prevents hours of invalid analysis.',
          conceptLink: 'srm',
        },
      ],
      failureMode: {
        weakAnswer: 'The candidate chooses checkout conversion rate as the primary metric, sets "review results at end of test" as the decision rule with no pre-committed thresholds, and skips the SRM check. They design an experiment that will produce a number but cannot make a defensible ship or no-ship decision.',
        interviewerFollowUp: '"You chose checkout conversion rate as your primary metric and said you\'ll review contextually at the end. The test results show +4.2% conversion and -3.1% average order value. With no pre-committed rule, what decision do you make — and how do you prevent that decision from being post-hoc rationalization?"',
      },
    },

    pairedScenarioPrompt: {
      toReview: 'You designed this test. Now read what actually happened when Crestline ran it.',
      fromReview: 'You read the result. Want to go back and design this experiment from scratch?',
    },
  },

  // ─────────────────────────────────────────────
  // D02 — Design the Onboarding Assignment (FREE · Analyst)
  // Paired with: s02-ghost-assignment
  // Core trap: randomization unit (session vs user) + missing trust checks (SRM)
  // ─────────────────────────────────────────────
  {
    id: 'd02-onboarding-assignment',
    title: 'Design the Onboarding Assignment',
    subtitle: 'Threadline wants to test AI-powered user persona assignment in onboarding. Design the experiment.',
    isFree: true,
    difficulty: 'analyst',
    industry: 'saas',
    scenarioFamily: 'srm',
    pairedReviewScenarioId: 's02-ghost-assignment',

    context: {
      company: 'Threadline',
      product: 'B2C project management tool, ~120k MAU, primarily SMB teams',
      team: 'Growth & Activation team',
      background: 'Threadline\'s onboarding asks new users to self-select their use case (personal, team, company). The team has built an ML-powered "persona assignment" feature that skips the self-selection step and assigns users to templates automatically based on signup signals. The hypothesis: faster onboarding with better template matching improves week-1 activation.',
      featureProposal: 'Replace the self-selection onboarding step with AI persona assignment. Control: existing self-selection flow. Treatment: auto-assigned persona based on ML model.',
      businessPressure: 'The ML team has been working on this for 3 months. The CPO wants to ship it before the end of the quarter. Activation rate (week-1 core action completion) is a top company OKR.',
      constraints: [
        'Only new signups are eligible — existing users are unaffected',
        '~800-1200 new signups per day',
        'The onboarding flow has a step-by-step funnel with separate logging for each step',
        'The ML assignment happens server-side on signup; the user never sees the selection screen in treatment',
      ],
    },

    designPhases: [
      {
        id: 'framing',
        label: 'Framing',
        hint: 'What are you testing and why?',
        fields: [
          {
            id: 'businessDecision',
            label: 'What business decision will this experiment inform?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'bd-a',
                label: 'Whether to replace self-selection onboarding with AI persona assignment for all new users',
                scoreValue: 2,
                rationale: 'Correct. Clear binary decision with obvious ship/no-ship interpretation. The scope is appropriately limited to new signups.',
              },
              {
                id: 'bd-b',
                label: 'Whether the ML model predicts user personas accurately',
                scoreValue: 0,
                rationale: 'This is an ML model evaluation question, not an experiment design question. Model accuracy is a necessary but not sufficient condition — you also need to know whether accurate assignment improves activation. These are separate questions.',
              },
              {
                id: 'bd-c',
                label: 'Whether onboarding improvements should be prioritized over other activation investments',
                scoreValue: 0,
                rationale: 'Too broad and not answerable by this experiment. This is a roadmap prioritization question, not a treatment-effect question.',
              },
              {
                id: 'bd-d',
                label: 'Whether to invest in further ML model improvements for persona assignment',
                scoreValue: 1,
                rationale: 'Partially correct — the experiment can inform this. But the primary decision is simpler: ship vs. not ship the current version. Framing it as an investment decision understates the immediate binary nature of the choice.',
              },
            ],
          },
          {
            id: 'hypothesis',
            label: 'Select the strongest hypothesis formulation',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'hyp-a',
                label: 'AI persona assignment will increase week-1 activation rate by reducing onboarding friction and improving template relevance, with no meaningful increase in early churn.',
                scoreValue: 2,
                rationale: 'Strong. Specifies the mechanism (friction reduction + better relevance), the primary direction (activation up), and the key guardrail condition (early churn not harmed). Well-formed.',
              },
              {
                id: 'hyp-b',
                label: 'Users assigned templates by AI will complete the onboarding flow faster.',
                scoreValue: 1,
                rationale: 'Testable and directional but too narrow. Speed is a mechanism, not the business outcome. If users complete onboarding faster but don\'t become activated, speed is irrelevant.',
              },
              {
                id: 'hyp-c',
                label: 'The ML model\'s template assignments will be more accurate than user self-selection.',
                scoreValue: 0,
                rationale: 'Not testable as a pure A/B outcome without ground truth labels for "correct" assignment. And even if testable, accuracy doesn\'t directly measure activation — the business outcome the OKR cares about.',
              },
              {
                id: 'hyp-d',
                label: 'Removing the self-selection step will increase onboarding completion rate.',
                scoreValue: 1,
                rationale: 'Testable but incomplete. Completing onboarding is a step metric, not the activation metric. Users can complete onboarding and not become activated if the templates are wrong for them.',
              },
            ],
          },
        ],
      },
      {
        id: 'setup',
        label: 'Setup',
        hint: 'Who gets treated, and how?',
        fields: [
          {
            id: 'eligiblePopulation',
            label: 'Who should be included in the experiment?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'ep-a',
                label: 'All new signups during the test window',
                scoreValue: 2,
                rationale: 'Correct. The treatment only affects new users (the self-selection step is in onboarding). Including all new signups maximizes power and produces the most generalizable result.',
              },
              {
                id: 'ep-b',
                label: 'New signups from organic channels only — exclude paid acquisition to reduce intent variance',
                scoreValue: 1,
                rationale: 'Reduces confounding from acquisition channel differences but also reduces sample size and external validity. Unless paid acquisition behavior is very different and you\'re specifically designing for organic, including all channels is usually better.',
              },
              {
                id: 'ep-c',
                label: 'New signups who complete email verification — exclude incomplete signups',
                scoreValue: 1,
                rationale: 'Reasonable if unverified signups are clearly noise (bots, spam). But you need to verify this exclusion applies equally to both treatment and control — otherwise it can introduce SRM.',
              },
              {
                id: 'ep-d',
                label: 'All users, including existing users switching workspaces',
                scoreValue: 0,
                rationale: 'Incorrect. The treatment is in the onboarding flow, which existing users never see. Including existing users would dilute the treatment effect toward zero and make the result uninterpretable.',
              },
            ],
          },
          {
            id: 'randomizationUnit',
            label: 'What should be the randomization unit?',
            type: 'single_select',
            conceptLinks: ['randomization-unit'],
            options: [
              {
                id: 'ru-a',
                label: 'User (each new signup is assigned once, persistently)',
                scoreValue: 2,
                rationale: 'Correct. New users go through onboarding exactly once. User-level assignment ensures each person has a consistent, complete experience in one arm. This is the natural unit for an onboarding test.',
              },
              {
                id: 'ru-b',
                label: 'Session (each onboarding session gets independently assigned)',
                scoreValue: 0,
                rationale: 'Critical mistake for this test. If a user starts onboarding, abandons, and comes back, they could see both versions. This contaminates both arms. More importantly, for a server-side ML assignment, session-level randomization would create inconsistent persona assignments — a user could get one persona on session 1 and a different one on session 2.',
              },
              {
                id: 'ru-c',
                label: 'Company/team (all users from the same company get the same version)',
                scoreValue: 1,
                rationale: 'Worth considering if team members discuss onboarding experiences. But for a tool where onboarding is largely individual, company-level clustering adds complexity without clear benefit and reduces effective sample size.',
              },
            ],
          },
          {
            id: 'unitOfAnalysis',
            label: 'What is the unit of analysis?',
            type: 'single_select',
            conceptLinks: ['unit-of-analysis'],
            options: [
              {
                id: 'ua-a',
                label: 'User — activation rate = users who completed the core action in week 1 / total assigned users',
                scoreValue: 2,
                rationale: 'Correct. User-level analysis matches user-level randomization. This is the clean, valid approach.',
              },
              {
                id: 'ua-b',
                label: 'Onboarding session — completion rate = sessions that completed onboarding / all onboarding sessions',
                scoreValue: 0,
                rationale: 'Mismatch. A user may have multiple onboarding sessions if they abandon and return. Sessions from the same user are correlated. This inflates sample size and deflates standard errors.',
              },
              {
                id: 'ua-c',
                label: 'Onboarding step — step completion rate per step in the funnel',
                scoreValue: 0,
                rationale: 'Step-level analysis is useful as a diagnostic, not as the primary unit of analysis. Steps from the same user are completely correlated — they\'re not independent observations.',
              },
            ],
          },
        ],
      },
      {
        id: 'metrics',
        label: 'Metrics',
        hint: 'What will you measure?',
        fields: [
          {
            id: 'primaryMetric',
            label: 'What is the primary metric?',
            type: 'single_select',
            conceptLinks: ['primary-metric'],
            options: [
              {
                id: 'pm-a',
                label: 'Week-1 activation rate (users who completed the core activation action within 7 days of signup)',
                scoreValue: 2,
                rationale: 'Correct. This is the company OKR and directly measures whether the hypothesis (better template matching → more activation) is true. It\'s the right level of abstraction — above onboarding mechanics, tied to business outcome.',
              },
              {
                id: 'pm-b',
                label: 'Onboarding completion rate (users who reached the "setup complete" screen)',
                scoreValue: 1,
                rationale: 'Reasonable step metric, but a proxy. Completing onboarding is not the same as becoming activated. If AI-assigned personas are wrong, users will complete onboarding and then not engage. This metric would show a win while the actual outcome is neutral or negative.',
              },
              {
                id: 'pm-c',
                label: 'Time to complete onboarding flow',
                scoreValue: 0,
                rationale: 'Too mechanical. Faster onboarding is a means, not an end. A user who completes onboarding in 30 seconds but never returns is not a success.',
              },
              {
                id: 'pm-d',
                label: 'Day-1 return rate (users who log in again within 24 hours)',
                scoreValue: 1,
                rationale: 'Useful early signal but possibly too early for a persona-matching hypothesis. A user who returns on day 1 but finds the template unhelpful will churn by day 14. Week-1 activation captures the medium-term signal better.',
              },
            ],
          },
          {
            id: 'guardrailMetrics',
            label: 'Which metrics should be guardrails?',
            type: 'multi_select',
            conceptLinks: ['guardrail-metric'],
            options: [
              {
                id: 'gm-a',
                label: '7-day churn rate (users who never return after onboarding)',
                scoreValue: 2,
                rationale: 'Critical guardrail. If AI assignment gives the wrong persona to many users, they\'ll immediately churn after finding the template irrelevant. This is the biggest downstream risk of the ML approach.',
              },
              {
                id: 'gm-b',
                label: '30-day paid conversion rate',
                scoreValue: 1,
                rationale: 'Important business metric but too lagging for a short experiment. If the test runs 3-4 weeks, 30-day conversion data won\'t be complete for most users. Better as a follow-up metric after the test.',
              },
              {
                id: 'gm-c',
                label: 'Onboarding abandonment rate at the persona step',
                scoreValue: 0,
                rationale: 'In treatment, the persona step doesn\'t exist — there\'s nothing to abandon. This metric can only be computed for control. It\'s not a valid guardrail for the treatment arm.',
              },
              {
                id: 'gm-d',
                label: 'Support ticket rate in first 7 days',
                scoreValue: 1,
                rationale: 'Useful signal that the assigned persona is confusing users (they contact support when the template doesn\'t match their needs). But noisy and possibly too slow to detect within the experiment window.',
              },
            ],
          },
          {
            id: 'diagnosticMetrics',
            label: 'Which metrics should be tracked as diagnostics?',
            type: 'multi_select',
            conceptLinks: [],
            options: [
              {
                id: 'dm-a',
                label: 'Onboarding step completion funnel (control only — treatment has a different funnel)',
                scoreValue: 1,
                rationale: 'Good diagnostic for understanding where control users drop off, which helps interpret why treatment might do better or worse.',
              },
              {
                id: 'dm-b',
                label: 'Template switch rate in week 1 (users who changed their assigned template)',
                scoreValue: 2,
                rationale: 'High-value diagnostic. If treatment users switch templates frequently, the ML assignment is wrong for many users — even if week-1 activation looks okay. This is the mechanism check for the hypothesis.',
              },
              {
                id: 'dm-c',
                label: 'Feature engagement breadth (number of distinct features used in week 1)',
                scoreValue: 1,
                rationale: 'Good proxy for whether the template is helping users discover value vs. just completing a task. But secondary to the primary activation metric.',
              },
            ],
          },
        ],
      },
      {
        id: 'logistics',
        label: 'Logistics',
        hint: 'How long, how large, how attributed?',
        fields: [
          {
            id: 'runtime',
            label: 'How long should this experiment run?',
            type: 'single_select',
            conceptLinks: ['power', 'mde'],
            options: [
              {
                id: 'rt-a',
                label: '3 weeks (21 days) — gives enough time to observe week-1 activation for most users in the window',
                scoreValue: 2,
                rationale: 'Correct. With ~1000 signups/day, 21 days gives ~21k users. To observe week-1 activation, you need to run long enough that even late-window signups have had 7 days. A 21-day window means users who signed up in week 3 won\'t have full week-1 data — so effectively you\'re analyzing 14 days of complete data from a 21-day enrollment window.',
              },
              {
                id: 'rt-b',
                label: '1 week — enough traffic for a quick read',
                scoreValue: 0,
                rationale: 'Critical problem: week-1 activation requires users to have had 7 days. A 1-week test means the last users enrolled have 0 days of observation. You cannot measure the primary metric from a 7-day window.',
              },
              {
                id: 'rt-c',
                label: '2 weeks with a trailing 1-week observation window',
                scoreValue: 2,
                rationale: 'Also valid. Enroll for 2 weeks, then observe the final cohort for a further week before reading results. Effectively the same as a 3-week enrollment window — pick whichever is cleaner to implement.',
              },
              {
                id: 'rt-d',
                label: '6 weeks — needed to observe 30-day paid conversion',
                scoreValue: 0,
                rationale: '30-day conversion is not the primary metric. Running 6 weeks to observe it delays the decision and exposes more users to a possibly worse experience without clear benefit.',
              },
            ],
          },
          {
            id: 'attributionWindow',
            label: 'What attribution window should apply to the primary metric?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'aw-a',
                label: '7 days post-signup — measure activation in the first 7 days after each user signs up',
                scoreValue: 2,
                rationale: 'Correct and matches the metric definition. Week-1 activation is measured from the day of signup, so each user gets exactly 7 days of observation regardless of when in the enrollment window they signed up.',
              },
              {
                id: 'aw-b',
                label: 'Calendar week — measure activation in the same calendar week as signup',
                scoreValue: 0,
                rationale: 'Creates unequal observation windows. A user who signs up on Monday gets 7 days; a user who signs up on Friday gets 3. This introduces systematic bias based on signup day.',
              },
              {
                id: 'aw-c',
                label: '1 day post-signup — quick read on early engagement',
                scoreValue: 0,
                rationale: 'Too short for an activation metric. Day-1 return doesn\'t capture whether users actually got value from the template — just whether they came back once.',
              },
            ],
          },
          {
            id: 'sampleSizeConcern',
            label: 'What is the main power concern?',
            type: 'single_select',
            conceptLinks: ['power', 'mde'],
            options: [
              {
                id: 'ss-a',
                label: 'Low traffic (~1000 signups/day) means the MDE is large — only big effects are detectable in a reasonable window',
                scoreValue: 2,
                rationale: 'Correct and important. At 1000 signups/day, a 3-week test yields ~21k users. To detect a 5% relative lift on activation (e.g., 40% → 42%) at 80% power requires roughly 8k per arm — achievable. But a 2% lift would require ~50k per arm, which takes 50 days. Be explicit about what effect size is detectable.',
              },
              {
                id: 'ss-b',
                label: 'No concern — 21k users over 3 weeks is sufficient for any effect size',
                scoreValue: 0,
                rationale: 'Incorrect. The MDE depends on the base rate and variance of the primary metric. 21k users may not be sufficient to detect small but real activation improvements. You need to compute the MDE before running.',
              },
              {
                id: 'ss-c',
                label: 'The test should be stopped early if activation rate drops below baseline in the first week',
                scoreValue: 0,
                rationale: 'Sequential testing without a formal stopping rule inflates Type I error. You can\'t apply an informal early-stopping rule without adjusting the significance threshold.',
              },
            ],
          },
        ],
      },
      {
        id: 'risks',
        label: 'Risks & Decision Rule',
        hint: 'What could invalidate this, and what will you do with the result?',
        fields: [
          {
            id: 'trustChecks',
            label: 'Which trust checks should you run?',
            type: 'multi_select',
            conceptLinks: ['srm'],
            options: [
              {
                id: 'tc-a',
                label: 'SRM check on signup counts — verify treatment and control arms have the expected 50/50 ratio',
                scoreValue: 2,
                rationale: 'Essential. For a server-side assignment triggered at signup, SRM can arise from eligibility filtering bugs (e.g., the ML model failing silently and excluding some users from assignment), logging delays, or email verification timing. Always check first.',
              },
              {
                id: 'tc-b',
                label: 'Verify the ML model is actually being called and returning persona assignments (not silently failing)',
                scoreValue: 2,
                rationale: 'Critical instrumentation check specific to this test. If the ML model fails silently and returns a fallback persona, treatment users get a degraded experience that\'s neither the intended treatment nor the control. This would bias results toward the null.',
              },
              {
                id: 'tc-c',
                label: 'Check pre-experiment equivalence on user acquisition channel mix',
                scoreValue: 1,
                rationale: 'Good practice. If the randomization produced arms with different channel compositions (e.g., more paid users in one arm), this could confound activation rates. A quick check prevents false positives from pre-existing differences.',
              },
              {
                id: 'tc-d',
                label: 'Verify all users in both arms complete the signup email verification step at equal rates',
                scoreValue: 1,
                rationale: 'Good specific check for this product. Email verification is often a dropout point. If treatment affects verification rate (unlikely but possible if persona assignment changes post-signup messaging), it would introduce an SRM at the verification step.',
              },
            ],
          },
          {
            id: 'validityRisks',
            label: 'What are the main validity risks?',
            type: 'multi_select',
            conceptLinks: ['novelty-effect'],
            options: [
              {
                id: 'vr-a',
                label: 'ML model warm-up period — model performance may improve over time as it processes more signups',
                scoreValue: 2,
                rationale: 'Real risk. If the ML model improves during the test (due to online learning or periodic retraining), treatment users later in the window get a better model than users earlier. This violates the stable treatment assumption and biases results upward over time.',
              },
              {
                id: 'vr-b',
                label: 'Novelty effect in onboarding — users may engage more with the "new" flow simply because it\'s different',
                scoreValue: 1,
                rationale: 'Lower risk here than in feature tests — users don\'t know they\'re in a "new" flow. But worth monitoring week-over-week engagement to confirm it\'s stable.',
              },
              {
                id: 'vr-c',
                label: 'Self-selection bias in persona matching — if the ML model systematically misassigns a subgroup, that subgroup\'s results will be masked in the average treatment effect',
                scoreValue: 2,
                rationale: 'Important validity concern specific to this test. If the model is poor for a specific signup type (e.g., enterprise users), those users\' negative experience is averaged out. Check activation by persona type as a diagnostic.',
              },
              {
                id: 'vr-d',
                label: 'SUTVA violation — treatment users might influence control users through referrals',
                scoreValue: 0,
                rationale: 'Very low risk. Onboarding experiences are private. A user who goes through AI onboarding is unlikely to causally affect the activation rate of users who don\'t. SUTVA is not a meaningful threat here.',
              },
            ],
          },
          {
            id: 'decisionRule',
            label: 'What is the pre-committed decision rule?',
            type: 'single_select',
            conceptLinks: ['p-value', 'guardrail-metric'],
            options: [
              {
                id: 'dr-a',
                label: 'Ship if week-1 activation is significantly positive AND 7-day churn is not significantly worse. Investigate if activation is null but churn is clean. Rollback if churn worsens significantly regardless of activation.',
                scoreValue: 2,
                rationale: 'Correct structure. Activation positive + churn clean = ship. Activation null = investigate, not discard. Churn worsening = rollback regardless of activation. This covers the three meaningful outcome combinations.',
              },
              {
                id: 'dr-b',
                label: 'Ship if week-1 activation is positive and the ML team confirms model performance is improving.',
                scoreValue: 0,
                rationale: 'The ML team\'s assessment of model performance is not a valid decision input for a product A/B test. The decision should be based on user outcomes (activation, churn), not model metrics.',
              },
              {
                id: 'dr-c',
                label: 'Ship if any activation metric improves significantly.',
                scoreValue: 0,
                rationale: '"Any activation metric" with multiple metrics measured creates a multiple testing problem. The threshold for significance needs to account for the number of tests.',
              },
              {
                id: 'dr-d',
                label: 'Ship if week-1 activation is significant (p < 0.05) and template switch rate is below 30%.',
                scoreValue: 1,
                rationale: 'Reasonable attempt but the 30% threshold for template switch rate is ad hoc. Decision rules should be based on pre-specified statistical thresholds for pre-defined guardrails, not informal thresholds for diagnostic metrics.',
              },
            ],
          },
        ],
      },
    ],

    scoringRubric: {
      dimensions: [
        { id: 'metric_selection', label: 'Metric selection', weight: 0.30, fieldIds: ['primaryMetric', 'guardrailMetrics'] },
        { id: 'design_validity', label: 'Design validity', weight: 0.35, fieldIds: ['randomizationUnit', 'unitOfAnalysis', 'trustChecks', 'validityRisks'] },
        { id: 'decision_discipline', label: 'Decision discipline', weight: 0.20, fieldIds: ['decisionRule', 'sampleSizeConcern'] },
        { id: 'hypothesis_framing', label: 'Hypothesis framing', weight: 0.15, fieldIds: ['hypothesis', 'businessDecision'] },
      ],
      levels: {
        incomplete:    { minScore: 0,    label: 'Incomplete' },
        analyst_ready: { minScore: 0.45, label: 'Analyst-Ready' },
        senior_ready:  { minScore: 0.68, label: 'Senior-Ready' },
        staff_level:   { minScore: 0.85, label: 'Staff-Level' },
      },
    },

    seniorDesign: {
      rationale: 'The most important trust check for this test is not SRM (though SRM is essential) — it\'s verifying the ML model is actually working. A server-side ML assignment that silently fails is a silent validity threat. The test will appear to run, the SRM check might pass, and the results will be biased toward the null by the degraded treatment experience.\n\nOn randomization: session-level assignment is a critical mistake for any test where the treatment happens at signup. Users who abandon and return would see different versions, creating contamination in both arms. User-level assignment is the only valid choice.\n\nThe ML warm-up risk is underappreciated. If the model retrains during the experiment, later treatment users get a better model than earlier users. This creates a time trend in the treatment effect that standard analysis won\'t detect.\n\nThe decision rule needs to separate the activation result from the churn result. A feature that improves week-1 activation by creating a compelling but misleading first experience — causing users to explore, then churn — is not a win. Treat week-1 churn as a blocking guardrail, not an advisory metric.',
      commonMistakes: [
        {
          mistake: 'Session-level randomization',
          consequence: 'Users who restart onboarding see both versions. The ML assignment is inconsistent across sessions. Assignment counts per user can\'t be tracked, making SRM diagnosis impossible.',
          conceptLink: 'randomization-unit',
        },
        {
          mistake: 'Not verifying ML model instrumentation before calling the test valid',
          consequence: 'Silent model failures corrupt the treatment arm without triggering any visible alert. You run a 3-week test and discover halfway through that the model was returning a fallback persona for 30% of users.',
          conceptLink: 'srm',
        },
        {
          mistake: 'Setting a 1-week runtime for a test measuring week-1 activation',
          consequence: 'Users who enroll in the last day of a 7-day window have 0 days of observation on the primary metric. The test can\'t measure what it\'s designed to measure.',
          conceptLink: 'mde',
        },
      ],
      failureMode: {
        weakAnswer: 'The candidate uses session-level randomization because "it\'s simpler to implement," sets week-1 activation as primary with a 7-day runtime, and adds no verification step for ML model instrumentation. They have a test that will complete and produce a number — but a silent ML failure could invalidate the entire treatment arm without any alert.',
        interviewerFollowUp: '"You set session-level randomization and a 7-day runtime to measure week-1 activation. A user who abandons onboarding and returns the next day would see a different version. How does that affect the assignment you\'re trying to measure — and what does your treatment group actually contain?"',
      },
    },

    pairedScenarioPrompt: {
      toReview: 'You designed this test. Now read what happened when Threadline ran it.',
      fromReview: 'You read the result. Want to go back and design this experiment from scratch?',
    },
  },

  // ─────────────────────────────────────────────
  // D03 — Design the Mobile Feature Test (BETA · Senior)
  // Paired with: s05-mobile-winners
  // Core trap: subgroup pre-registration — mobile vs. desktop split
  // ─────────────────────────────────────────────
  {
    id: 'd03-mobile-feature-test',
    title: 'Design the Mobile Feature Test',
    subtitle: 'Vantage Analytics wants to test a redesigned mobile dashboard. Design the experiment — and decide upfront how you\'ll handle the mobile subgroup.',
    isFree: true,
    difficulty: 'senior',
    industry: 'saas',
    scenarioFamily: 'hte_subgroups',
    pairedReviewScenarioId: 's05-mobile-winners',

    context: {
      company: 'Vantage Analytics',
      product: 'B2B analytics platform, 8,400 paying accounts, ~60% of sessions from desktop, ~40% mobile',
      team: 'Product Analytics team',
      background: 'Vantage rebuilt their mobile dashboard from scratch — new layout, faster load times, and a redesigned chart drill-down pattern. The desktop experience is unchanged. Engineering believes mobile engagement has been suppressed by the old layout and expects the new design to lift mobile weekly active usage. Product leadership expects a cross-platform engagement improvement.',
      featureProposal: 'Roll out the redesigned mobile dashboard to 50% of users. Control: existing mobile layout. Treatment: new mobile layout. Desktop experience is identical in both arms.',
      businessPressure: 'The mobile redesign took 4 months. The CEO wants to announce the new mobile experience at next month\'s customer event. The Product team expects the test to show a clean win.',
      constraints: [
        'Account-level metrics matter (renewal decisions are made at account level)',
        'Users have strong cross-device usage patterns — the same user often uses both mobile and desktop',
        '~8,400 accounts, ~42,000 users total',
        'Randomization infrastructure supports both user-level and account-level assignment',
      ],
    },

    designPhases: [
      {
        id: 'framing',
        label: 'Framing',
        hint: 'What are you testing and why?',
        fields: [
          {
            id: 'businessDecision',
            label: 'What business decision will this experiment inform?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'bd-a',
                label: 'Whether to ship the redesigned mobile dashboard to all users',
                scoreValue: 2,
                rationale: 'Correct. Clear binary decision. The experiment should answer this specific question, not broader questions about mobile strategy.',
              },
              {
                id: 'bd-b',
                label: 'Whether mobile is an important surface for Vantage customers',
                scoreValue: 0,
                rationale: 'This is a discovery question, not a treatment effect question. You already know 40% of sessions are mobile — that\'s evidence that mobile matters. This is the wrong framing for a redesign test.',
              },
              {
                id: 'bd-c',
                label: 'Whether to invest more in mobile product development going forward',
                scoreValue: 1,
                rationale: 'This will be informed by the test, but it\'s a broader strategic question than this test can definitively answer. The immediate decision is about this specific redesign.',
              },
            ],
          },
          {
            id: 'hypothesis',
            label: 'Select the strongest hypothesis',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'hyp-a',
                label: 'The redesigned mobile dashboard will increase overall weekly active users across both mobile and desktop, with mobile WAU showing the largest improvement.',
                scoreValue: 2,
                rationale: 'Strong. Sets the overall direction (WAU up), specifies the expected subgroup pattern (mobile > desktop), and implicitly commits to evaluating both overall and subgroup effects. This enables meaningful interpretation of a mobile-only effect without it being post-hoc.',
              },
              {
                id: 'hyp-b',
                label: 'Mobile WAU will increase among users who primarily use the mobile app.',
                scoreValue: 1,
                rationale: 'Directional and testable, but defines "primarily mobile" post-hoc. If you don\'t pre-define "primarily mobile," you\'ll define it as whoever showed the strongest treatment effect, which is circular.',
              },
              {
                id: 'hyp-c',
                label: 'Users will prefer the new mobile design.',
                scoreValue: 0,
                rationale: '"Prefer" is not measurable without a satisfaction survey. Even if it were, preference doesn\'t translate directly to behavioral outcomes. This is not a useful experimental hypothesis.',
              },
              {
                id: 'hyp-d',
                label: 'The redesigned mobile dashboard will increase weekly dashboard views on mobile, with no degradation to desktop usage.',
                scoreValue: 2,
                rationale: 'Also strong. Specific metric (mobile dashboard views), directional, and includes a guardrail condition (desktop not harmed). The mechanism check (mobile views up) is appropriate for a mobile layout change.',
              },
            ],
          },
        ],
      },
      {
        id: 'setup',
        label: 'Setup',
        hint: 'Who gets treated, and how?',
        fields: [
          {
            id: 'eligiblePopulation',
            label: 'Who is eligible?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'ep-a',
                label: 'All current users across both mobile and desktop',
                scoreValue: 2,
                rationale: 'Correct. The treatment changes mobile for everyone in the treatment arm. Restricting eligibility to mobile-only users would exclude the cross-device usage pattern and bias the result toward users who only use mobile — not the average customer.',
              },
              {
                id: 'ep-b',
                label: 'Only users who have used the mobile app at least once in the past 30 days',
                scoreValue: 1,
                rationale: 'Restricts to active mobile users, which increases power for detecting mobile effects. But excludes users who might return to mobile if the experience improves — missing a potential re-engagement effect.',
              },
              {
                id: 'ep-c',
                label: 'Only mobile-primary users (>70% of sessions from mobile)',
                scoreValue: 0,
                rationale: 'Too restrictive. Reduces sample dramatically and selects for a subgroup that may not represent the average user. Results won\'t generalize to the full user base.',
              },
            ],
          },
          {
            id: 'randomizationUnit',
            label: 'What should be the randomization unit?',
            type: 'single_select',
            conceptLinks: ['randomization-unit', 'sutva'],
            options: [
              {
                id: 'ru-a',
                label: 'User level',
                scoreValue: 2,
                rationale: 'Correct for most purposes. User-level randomization ensures consistent experience across sessions and devices for individual users. Given cross-device usage patterns, this is the natural unit.',
              },
              {
                id: 'ru-b',
                label: 'Account level',
                scoreValue: 2,
                rationale: 'Also defensible and arguably better for a B2B product. Account-level randomization prevents contamination within teams (if team members discuss the new design). Given that renewal decisions are account-level, account-level metrics are more business-relevant. Either user or account level is senior-level thinking here.',
              },
              {
                id: 'ru-c',
                label: 'Session level',
                scoreValue: 0,
                rationale: 'Critical mistake. The same user would see different dashboard designs across sessions. For a redesign that requires learning a new layout, session-level assignment creates a confusing and invalid experience.',
              },
              {
                id: 'ru-d',
                label: 'Device level (mobile devices get treatment, desktop devices get control)',
                scoreValue: 0,
                rationale: 'The same user has both a mobile and desktop device. They\'d see treatment on mobile and control on desktop — which is actually what\'s happening in reality. But device-level assignment means you can\'t separate user-level effects from device-level effects, making the causal inference messy.',
              },
            ],
          },
          {
            id: 'unitOfAnalysis',
            label: 'What is the unit of analysis?',
            type: 'single_select',
            conceptLinks: ['unit-of-analysis'],
            options: [
              {
                id: 'ua-a',
                label: 'User — compute WAU as users active in a given week / total users assigned',
                scoreValue: 2,
                rationale: 'Correct for user-level randomization. Clean match between randomization and analysis.',
              },
              {
                id: 'ua-b',
                label: 'Account — compute account-level WAU as accounts with at least one active user per week',
                scoreValue: 2,
                rationale: 'Correct for account-level randomization. Better aligns with B2B business outcomes since renewal decisions are made at account level.',
              },
              {
                id: 'ua-c',
                label: 'Session — compute engagement as sessions per user per week',
                scoreValue: 1,
                rationale: 'Acceptable as a secondary metric but not the primary unit of analysis. Sessions per user are correlated within users — treating them as independent observations inflates power.',
              },
            ],
          },
        ],
      },
      {
        id: 'metrics',
        label: 'Metrics',
        hint: 'What will you measure?',
        fields: [
          {
            id: 'primaryMetric',
            label: 'What is the primary metric?',
            type: 'single_select',
            conceptLinks: ['primary-metric'],
            options: [
              {
                id: 'pm-a',
                label: 'Overall weekly active users (WAU) — combines mobile and desktop activity',
                scoreValue: 2,
                rationale: 'Correct. Overall WAU is the right primary metric because: (1) the product goal is engagement improvement broadly, not mobile-specific; (2) a mobile design that cannibalizes desktop usage is not a win; (3) cross-device users\' total engagement is what matters for account health.',
              },
              {
                id: 'pm-b',
                label: 'Mobile WAU only — the treatment only affects mobile',
                scoreValue: 1,
                rationale: 'Narrower but defensible if you believe desktop is unaffected. The risk: if users shift from desktop to mobile without increasing total engagement, mobile WAU goes up but the business isn\'t better off. Overall WAU captures this.',
              },
              {
                id: 'pm-c',
                label: 'Mobile dashboard view count per week',
                scoreValue: 1,
                rationale: 'Reasonable mechanism metric but too granular for a primary. Count of views doesn\'t distinguish between more users engaging vs. the same users engaging more. WAU is cleaner.',
              },
            ],
          },
          {
            id: 'guardrailMetrics',
            label: 'Which metrics should be guardrails?',
            type: 'multi_select',
            conceptLinks: ['guardrail-metric'],
            options: [
              {
                id: 'gm-a',
                label: 'Desktop WAU — verify the mobile redesign doesn\'t cannibalize desktop usage',
                scoreValue: 2,
                rationale: 'Critical guardrail. If mobile improves but desktop declines proportionally (users shift channel but don\'t increase total engagement), the overall WAU result masks a neutral outcome. Desktop WAU as a guardrail catches this.',
              },
              {
                id: 'gm-b',
                label: 'Account-level churn rate during the test period',
                scoreValue: 1,
                rationale: 'Important longer-term metric but likely too lagging for a test window. Short-term churn rates are noisy. Better tracked as a follow-on metric post-ship.',
              },
              {
                id: 'gm-c',
                label: 'Mobile app crash rate',
                scoreValue: 2,
                rationale: 'Essential technical guardrail. A new mobile layout has higher crash risk. Even if engagement looks good, increased crashes would be a product quality signal that blocks shipping.',
              },
              {
                id: 'gm-d',
                label: 'Time spent per session on mobile',
                scoreValue: 0,
                rationale: 'Ambiguous direction. More time could mean the new layout is confusing (users spend longer finding things) or more engaging (users do more). This metric is not actionable as a guardrail because you can\'t distinguish the interpretations without deeper analysis.',
              },
            ],
          },
          {
            id: 'diagnosticMetrics',
            label: 'Which metrics should be tracked as diagnostics? Pre-register any planned subgroup splits.',
            type: 'multi_select',
            conceptLinks: ['p-value'],
            options: [
              {
                id: 'dm-a',
                label: 'Mobile WAU vs. desktop WAU by arm (pre-registered subgroup split)',
                scoreValue: 2,
                rationale: 'This is the most important decision in this design. Pre-registering the mobile/desktop subgroup split before the test runs transforms what would be a post-hoc fishing expedition into a legitimate pre-specified analysis. If you don\'t pre-register it, a mobile-only effect is just a hypothesis for the next test.',
              },
              {
                id: 'dm-b',
                label: 'WAU by mobile-primary vs. cross-device users (pre-registered)',
                scoreValue: 2,
                rationale: 'Another valuable pre-registered subgroup. Mobile-primary users may respond differently to a mobile redesign than cross-device users. Pre-registering this split before seeing data is the only way to legitimately report it.',
              },
              {
                id: 'dm-c',
                label: 'Chart drill-down click-through rate on mobile (mechanism check)',
                scoreValue: 1,
                rationale: 'Good mechanism check for the specific redesign feature (new chart drill-down pattern). If the primary metric improves but drill-down CTR doesn\'t move, the mechanism hypothesis is wrong.',
              },
              {
                id: 'dm-d',
                label: 'All subgroup effects across plan tier, geography, and company size',
                scoreValue: 0,
                rationale: 'This is a fishing expedition. Analyzing every possible subgroup without pre-registration means you\'ll find something significant by chance. Subgroup analyses should be limited to those pre-specified in the design document.',
              },
            ],
          },
        ],
      },
      {
        id: 'logistics',
        label: 'Logistics',
        hint: 'How long, how large, how attributed?',
        fields: [
          {
            id: 'runtime',
            label: 'How long should this experiment run?',
            type: 'single_select',
            conceptLinks: ['novelty-effect', 'mde'],
            options: [
              {
                id: 'rt-a',
                label: '4 weeks — captures full weekly cycles and reduces novelty effect risk for a UX redesign',
                scoreValue: 2,
                rationale: 'Correct for a UX redesign. New layouts often show a novelty engagement spike in week 1 that decays as users adapt. 4 weeks allows week-over-week effect analysis to distinguish novelty from genuine improvement. Also enough time to observe stable WAU patterns.',
              },
              {
                id: 'rt-b',
                label: '2 weeks — enough for statistical significance at this traffic level',
                scoreValue: 1,
                rationale: 'Statistically possible but risks novelty contamination. A 2-week WAU result for a UX redesign is dominated by the first-contact experience. You don\'t know if the effect persists. Senior analysts push for longer windows on redesigns.',
              },
              {
                id: 'rt-c',
                label: '1 week — mobile usage patterns are stable enough to read quickly',
                scoreValue: 0,
                rationale: 'Too short for a WAU metric. WAU by definition requires a week of observation per data point. A 1-week experiment gives you 1 WAU measurement — not enough to assess weekly patterns or week-over-week trends.',
              },
            ],
          },
          {
            id: 'attributionWindow',
            label: 'What attribution window applies?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'aw-a',
                label: 'Rolling 7-day window — WAU measured continuously throughout the experiment',
                scoreValue: 2,
                rationale: 'Standard for WAU metrics. Each user\'s weekly active status is computed from their activity in any 7-day window, which allows for stable weekly comparisons throughout the test.',
              },
              {
                id: 'aw-b',
                label: 'Calendar week — WAU computed by calendar week (Mon-Sun)',
                scoreValue: 1,
                rationale: 'Also valid, but introduces edge effects for users assigned near week boundaries. Rolling 7-day is slightly cleaner.',
              },
            ],
          },
          {
            id: 'sampleSizeConcern',
            label: 'What is the key power concern?',
            type: 'single_select',
            conceptLinks: ['power', 'mde'],
            options: [
              {
                id: 'ss-a',
                label: 'The overall WAU test is well-powered, but the mobile-only subgroup (40% of users) has lower power — the MDE for the mobile subgroup analysis is roughly 1.6x larger than for the overall test',
                scoreValue: 2,
                rationale: 'Exactly right and the most important power consideration for this design. Subgroup analyses have lower power by definition because they use a subset of the sample. If you\'re pre-registering a mobile subgroup analysis, you need to verify the MDE is still meaningful for that subset.',
              },
              {
                id: 'ss-b',
                label: 'No concern — 42k users is more than enough for any subgroup analysis',
                scoreValue: 0,
                rationale: 'Incorrect. 40% mobile users = ~17k users per arm. The MDE for a subgroup of this size is larger than for the full sample. Whether it\'s "enough" depends on the minimum effect size you care about.',
              },
              {
                id: 'ss-c',
                label: 'The test should use account-level randomization to increase effective sample size',
                scoreValue: 0,
                rationale: 'Account-level randomization doesn\'t increase sample size — it usually reduces effective sample size (8,400 accounts vs. 42,000 users). It changes the estimand (account-level vs. user-level effect), not the power.',
              },
            ],
          },
        ],
      },
      {
        id: 'risks',
        label: 'Risks & Decision Rule',
        hint: 'What could invalidate this, and what will you do with the result?',
        fields: [
          {
            id: 'trustChecks',
            label: 'Which trust checks should you run?',
            type: 'multi_select',
            conceptLinks: ['srm'],
            options: [
              {
                id: 'tc-a',
                label: 'SRM check on user counts (overall and within the pre-registered mobile/desktop subgroup)',
                scoreValue: 2,
                rationale: 'Run SRM checks on both the overall assignment and within the pre-registered subgroups. An SRM within the mobile subgroup would indicate differential dropout or logging issues on mobile devices.',
              },
              {
                id: 'tc-b',
                label: 'Verify pre-experiment mobile WAU is comparable between arms',
                scoreValue: 2,
                rationale: 'Critical for a test where the subgroup split (mobile vs. desktop) is a key pre-registered analysis. If the arms have different baseline mobile usage rates, the subgroup comparison is confounded.',
              },
              {
                id: 'tc-c',
                label: 'Verify crash rates are at baseline in the first 48 hours after rollout',
                scoreValue: 2,
                rationale: 'For a mobile redesign, this is an essential early instrumentation check. A new layout that crashes frequently will both harm users and corrupt the WAU measurement (users who crash can\'t engage).',
              },
            ],
          },
          {
            id: 'validityRisks',
            label: 'What are the main validity risks?',
            type: 'multi_select',
            conceptLinks: ['novelty-effect', 'sutva'],
            options: [
              {
                id: 'vr-a',
                label: 'Novelty effect — mobile WAU may spike in week 1 as users explore the new layout',
                scoreValue: 2,
                rationale: 'High risk for a visual redesign. Users often explore new layouts in the first week, inflating early engagement. 4-week runtime with weekly breakdowns lets you diagnose this.',
              },
              {
                id: 'vr-b',
                label: 'Cross-device contamination — users may discuss the new design with colleagues in the same account',
                scoreValue: 2,
                rationale: 'Real risk for a B2B product. If a treatment user shows their manager the new layout, the manager (in control) may change their behavior in response. Account-level randomization eliminates this. User-level randomization accepts this risk.',
              },
              {
                id: 'vr-c',
                label: 'Post-hoc subgroup fishing if mobile effect is not pre-registered',
                scoreValue: 2,
                rationale: 'The most important validity risk specific to this scenario. If the overall WAU result is null but mobile WAU is positive, and you didn\'t pre-register the mobile subgroup analysis, you cannot legitimately report the mobile result as a finding. This is the core trap of this scenario — and why pre-registration of the subgroup is a key design decision.',
              },
            ],
          },
          {
            id: 'decisionRule',
            label: 'What is the pre-committed decision rule?',
            type: 'single_select',
            conceptLinks: ['p-value', 'guardrail-metric'],
            options: [
              {
                id: 'dr-a',
                label: 'Ship if overall WAU is significantly positive AND desktop WAU is not significantly negative AND crash rate is clean. If overall WAU is null but pre-registered mobile WAU is significantly positive, investigate further before shipping to all.',
                scoreValue: 2,
                rationale: 'Correct. This rule (1) treats guardrails as blocking, (2) allows a mobile-only subgroup result if pre-registered, but doesn\'t automatically ship on it, (3) is specific enough to prevent post-hoc rationalization. Investigating a mobile-only result is appropriate — it might warrant a mobile-targeted rollout.',
              },
              {
                id: 'dr-b',
                label: 'Ship if overall WAU is positive. Report mobile subgroup results for context.',
                scoreValue: 1,
                rationale: 'Acceptable but incomplete. Doesn\'t specify what happens when guardrails breach. "For context" framing for the mobile subgroup suggests it wasn\'t pre-registered — which makes the subgroup result exploratory only.',
              },
              {
                id: 'dr-c',
                label: 'Ship if mobile WAU is significantly positive, even if overall WAU is neutral.',
                scoreValue: 0,
                rationale: 'Only acceptable if mobile WAU is the pre-registered primary metric. If overall WAU is the primary and mobile is a subgroup, this decision rule is post-hoc — you\'re choosing the metric after seeing which one moved.',
              },
            ],
          },
        ],
      },
    ],

    scoringRubric: {
      dimensions: [
        { id: 'metric_selection', label: 'Metric selection', weight: 0.30, fieldIds: ['primaryMetric', 'guardrailMetrics'] },
        { id: 'design_validity', label: 'Design validity', weight: 0.35, fieldIds: ['randomizationUnit', 'unitOfAnalysis', 'trustChecks', 'validityRisks'] },
        { id: 'decision_discipline', label: 'Decision discipline', weight: 0.20, fieldIds: ['decisionRule', 'sampleSizeConcern'] },
        { id: 'hypothesis_framing', label: 'Hypothesis framing', weight: 0.15, fieldIds: ['hypothesis', 'businessDecision'] },
      ],
      levels: {
        incomplete:    { minScore: 0,    label: 'Incomplete' },
        analyst_ready: { minScore: 0.45, label: 'Analyst-Ready' },
        senior_ready:  { minScore: 0.68, label: 'Senior-Ready' },
        staff_level:   { minScore: 0.85, label: 'Staff-Level' },
      },
    },

    seniorDesign: {
      rationale: 'The central design decision is whether to pre-register the mobile subgroup analysis. This is not a detail — it\'s the difference between a legitimate finding and a post-hoc narrative. If you design the experiment with overall WAU as the primary, and you don\'t pre-register the mobile/desktop subgroup split, then a mobile-only treatment effect is exploratory at best and a finding to report at worst.\n\nThe correct design pre-registers: (1) overall WAU as the primary, (2) the mobile vs. desktop subgroup split as a pre-specified secondary analysis, (3) the expected direction (mobile > desktop). This means if the overall effect is null but mobile is positive, you can legitimately interpret the pre-registered subgroup result — with appropriate caveats about lower power.\n\nAccount-level vs. user-level randomization is also a real decision here. B2B products with team-level discussion of new features should consider account-level randomization to prevent within-team contamination. Either is defensible, but the choice should be explicit.\n\nNovelty effect is the main runtime risk. 4 weeks with weekly breakdowns is the minimum to diagnose a decaying novelty effect vs. a sustained engagement improvement on a UX redesign.',
      commonMistakes: [
        {
          mistake: 'Not pre-registering the mobile subgroup analysis',
          consequence: 'Overall WAU is null. Mobile WAU is positive. The team reports a mobile win. This is a post-hoc fishing finding — the mobile subgroup was not pre-specified, so a positive result has a much higher false positive probability than the nominal alpha.',
          conceptLink: 'p-value',
        },
        {
          mistake: 'Running 2 weeks on a UX redesign and calling the result conclusive',
          consequence: 'Week-1 novelty engagement inflates the treatment effect. The "significant improvement" decays in weeks 3-4. You ship a feature whose real-world effect is much smaller than the test suggested.',
          conceptLink: 'novelty-effect',
        },
      ],
      failureMode: {
        weakAnswer: 'The candidate runs a 2-week test with overall WAU as the primary and reports "the result is statistically significant." They never pre-register the mobile subgroup analysis and, when overall WAU is null but mobile WAU is positive at week 2, pivot to declaring the mobile result the primary finding — turning a pre-planned test into a post-hoc fishing exercise.',
        interviewerFollowUp: '"Overall WAU was null. You\'re reporting the mobile subgroup as the win. You didn\'t pre-register this subgroup. Given that you\'re now running a test within a test — why does the nominal alpha of 0.05 no longer apply to the mobile result, and what would you need to do to make this finding publishable?"',
      },
    },

    pairedScenarioPrompt: {
      toReview: 'You designed this test. Now read the result — and see if your pre-registration decision changes how you interpret it.',
      fromReview: 'You read the Mobile Winners result. Go back and design this experiment — decide before seeing the data whether to pre-register the mobile subgroup.',
    },
  },

  // ─────────────────────────────────────────────
  // D04 — Design the Multi-Metric Launch (BETA · Senior)
  // Paired with: s06-five-metrics
  // Core trap: multiple testing — how many co-primaries, pre-registration discipline
  // ─────────────────────────────────────────────
  {
    id: 'd04-multi-metric-launch',
    title: 'Design the Multi-Metric Launch',
    subtitle: 'Loopwise is testing a redesigned notification center. Design the experiment — and decide how many metrics count as "success."',
    isFree: false,
    difficulty: 'senior',
    industry: 'saas',
    scenarioFamily: 'multiple_testing',
    pairedReviewScenarioId: 's06-five-metrics-problem',

    context: {
      company: 'Loopwise',
      product: 'B2B workflow automation platform, ~28,000 MAU, teams use it for cross-functional project tracking',
      team: 'Core Product team',
      background: 'Loopwise rebuilt their notification center — smarter grouping, priority ranking, and a new "snooze" feature. The team believes the current notification center is overwhelming users and causing notification fatigue. The redesign aims to surface more relevant alerts while reducing noise. The PM has a list of 6 metrics she wants to see improve.',
      featureProposal: 'Roll out the redesigned notification center (with smart grouping, priority ranking, and snooze) to 50% of users. The PM\'s desired outcome: "All 6 metrics should improve."',
      businessPressure: 'This feature is the centerpiece of the Q2 roadmap. The CEO is presenting it at an all-hands in 6 weeks. The PM has committed to demonstrating improvement on notification engagement, response time, and retention metrics.',
      constraints: [
        'The PM has pre-identified 6 metrics she cares about: (1) notification open rate, (2) notification response rate, (3) time-to-first-response, (4) notification fatigue score (survey-based), (5) 7-day retention, (6) weekly active usage',
        'Survey-based metrics have 2-week collection lag',
        '~28,000 MAU, good traffic for most metrics',
        'Engineering instrumentation tracks all 6 metrics already',
      ],
    },

    designPhases: [
      {
        id: 'framing',
        label: 'Framing',
        hint: 'What are you testing and why?',
        fields: [
          {
            id: 'businessDecision',
            label: 'What business decision will this experiment inform?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'bd-a',
                label: 'Whether to ship the redesigned notification center to all users',
                scoreValue: 2,
                rationale: 'Correct. Binary, clear, scoped. The experiment should tell you ship or not ship.',
              },
              {
                id: 'bd-b',
                label: 'Whether the notification center is causing user fatigue',
                scoreValue: 0,
                rationale: 'This is a diagnostic question, not a decision framing. Whether the current design is bad is not the decision — it\'s the justification for testing the redesign. The test is about whether the redesign is better.',
              },
              {
                id: 'bd-c',
                label: 'Which of the 6 metrics the PM cares about will improve with the redesign',
                scoreValue: 0,
                rationale: 'This frames the experiment as exploratory (which metrics improve?) rather than confirmatory (does the redesign achieve the desired outcome?). This framing explicitly creates a multiple testing problem.',
              },
            ],
          },
          {
            id: 'hypothesis',
            label: 'Select the strongest hypothesis',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'hyp-a',
                label: 'The redesigned notification center will increase 7-day retention by reducing notification fatigue, with no degradation in notification response rate.',
                scoreValue: 2,
                rationale: 'Strong. One primary metric (7-day retention — the business outcome), mechanism specified (fatigue reduction), and a guardrail condition (response rate not harmed). This forces the team to commit to what "success" means before data arrives.',
              },
              {
                id: 'hyp-b',
                label: 'All 6 metrics the PM identified will improve significantly with the redesigned notification center.',
                scoreValue: 0,
                rationale: 'This is not a hypothesis — it\'s a wish list. Testing 6 metrics for simultaneous significance with no correction means you need all 6 to pass an already inflated false positive rate. And "will improve significantly" is a post-hoc standard if the threshold isn\'t specified beforehand.',
              },
              {
                id: 'hyp-c',
                label: 'The notification redesign will reduce time-to-first-response and increase notification open rate.',
                scoreValue: 1,
                rationale: 'Two primary metrics creates an implicit multiple testing issue. Which one defines success if they disagree? The hypothesis needs one primary outcome.',
              },
              {
                id: 'hyp-d',
                label: 'The redesigned notification center will improve weekly active usage by making notifications more actionable.',
                scoreValue: 2,
                rationale: 'Also strong. WAU is a business-level outcome metric, mechanism is specified (more actionable notifications), and it\'s single. The limitation vs. the 7-day retention option is that WAU may be a less sensitive short-term signal.',
              },
            ],
          },
        ],
      },
      {
        id: 'setup',
        label: 'Setup',
        hint: 'Who gets treated, and how?',
        fields: [
          {
            id: 'eligiblePopulation',
            label: 'Who is eligible?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'ep-a',
                label: 'All current MAU — the notification center is used across the product',
                scoreValue: 2,
                rationale: 'Correct. The notification center is a cross-product feature. All active users interact with it. Restricting eligibility would reduce power without improving validity.',
              },
              {
                id: 'ep-b',
                label: 'Only users who receive more than 10 notifications per week — focus on power users of the feature',
                scoreValue: 1,
                rationale: 'Makes intuitive sense for detecting notification fatigue effects, but reduces generalizability. If the redesign helps moderate users too, you\'d miss that. The test should be designed for the average user, not just power users.',
              },
              {
                id: 'ep-c',
                label: 'Only new users — avoid confounding from existing notification habits',
                scoreValue: 0,
                rationale: 'The notification center is relevant for all users. New users haven\'t developed habits yet — the test would miss the re-engagement and fatigue-reduction effects among existing users, which is the main hypothesis.',
              },
            ],
          },
          {
            id: 'randomizationUnit',
            label: 'What should be the randomization unit?',
            type: 'single_select',
            conceptLinks: ['randomization-unit'],
            options: [
              {
                id: 'ru-a',
                label: 'User level',
                scoreValue: 2,
                rationale: 'Correct. Notification preferences and fatigue are individual-level phenomena. User-level randomization ensures a consistent notification experience and maintains independence between observations.',
              },
              {
                id: 'ru-b',
                label: 'Account/team level',
                scoreValue: 2,
                rationale: 'Also defensible. In a B2B workflow tool, team members\' notification behavior is interdependent — if one person gets smart grouping, their response patterns affect the notifications their teammates receive. Account-level randomization eliminates within-team contamination. Either is acceptable; explicitly choosing is senior-level discipline.',
              },
              {
                id: 'ru-c',
                label: 'Session level',
                scoreValue: 0,
                rationale: 'Critical mistake. Notification centers require consistent experience across sessions — if a user sees smart grouping in one session and the old design in the next, the experience is incoherent and the data is uninformative.',
              },
            ],
          },
          {
            id: 'unitOfAnalysis',
            label: 'What is the unit of analysis?',
            type: 'single_select',
            conceptLinks: ['unit-of-analysis'],
            options: [
              {
                id: 'ua-a',
                label: 'User — all metrics computed per user',
                scoreValue: 2,
                rationale: 'Correct for user-level randomization. Clean match.',
              },
              {
                id: 'ua-b',
                label: 'Notification — open rate = notifications opened / notifications sent per arm',
                scoreValue: 1,
                rationale: 'Acceptable for notification-level metrics (open rate, response rate) but notifications from the same user are highly correlated. User-level aggregation is cleaner — compute per-user notification open rate, then average across users.',
              },
            ],
          },
        ],
      },
      {
        id: 'metrics',
        label: 'Metrics',
        hint: 'What will you measure? This is the most important design decision for this experiment.',
        fields: [
          {
            id: 'primaryMetric',
            label: 'What is the ONE primary metric for this experiment?',
            type: 'single_select',
            conceptLinks: ['primary-metric', 'multiple-testing'],
            options: [
              {
                id: 'pm-a',
                label: '7-day retention rate — the ultimate signal that the redesign is creating genuine product value',
                scoreValue: 2,
                rationale: 'Best primary metric. Retention is the business outcome that the notification redesign ultimately should serve. A notification system that improves engagement metrics but doesn\'t improve retention has a weaker case for shipping. It\'s also hard to game — users either return or they don\'t.',
              },
              {
                id: 'pm-b',
                label: 'Notification response rate — the most direct measure of notification quality',
                scoreValue: 1,
                rationale: 'Reasonable as a mechanism metric, but it\'s a proxy for the business outcome. A higher response rate to less important notifications is not a win. The downstream outcome (does responding to notifications create product value?) matters more.',
              },
              {
                id: 'pm-c',
                label: 'All 6 metrics the PM identified are co-primary — the feature succeeds if all improve',
                scoreValue: 0,
                rationale: 'This creates an unmanageable multiple testing problem. Six co-primary metrics at α = 0.05 means the per-test significance threshold should be α/6 ≈ 0.008 under Bonferroni. More critically: what happens if 5 improve and 1 doesn\'t? There\'s no pre-committed rule for this case.',
              },
              {
                id: 'pm-d',
                label: 'Weekly active usage — weekly engagement as the main behavioral outcome',
                scoreValue: 2,
                rationale: 'Also strong. WAU is a business-level metric that downstream captures engagement improvement. The tradeoff vs. retention: WAU is easier to observe within a short test window; retention has higher business impact.',
              },
            ],
          },
          {
            id: 'guardrailMetrics',
            label: 'Which metrics should be guardrails?',
            type: 'multi_select',
            conceptLinks: ['guardrail-metric', 'bonferroni'],
            options: [
              {
                id: 'gm-a',
                label: 'Notification unsubscribe/mute rate — signals that users are more overwhelmed, not less',
                scoreValue: 2,
                rationale: 'Critical guardrail. If the redesign increases unsubscribes, it\'s making the fatigue problem worse despite potentially improving open rates. This is the direction-of-harm guardrail.',
              },
              {
                id: 'gm-b',
                label: 'Notification volume per user — ensure the system isn\'t sending more notifications in treatment',
                scoreValue: 1,
                rationale: 'Worth checking as a sanity metric — if the redesign accidentally increases notification volume, any engagement improvement is confounded. Not a true guardrail but a validity check.',
              },
              {
                id: 'gm-c',
                label: 'All 5 remaining PM metrics should be treated as guardrails (anything negative blocks shipping)',
                scoreValue: 0,
                rationale: 'Converting the PM\'s wish list into guardrails is a way of smuggling in multiple testing without adjustment. If 5 metrics are "guardrails" that all must be clean, you have 5 tests at α = 0.05 each — the FWER for "all clean" is ~23% false negative rate even with no real effect.',
              },
              {
                id: 'gm-d',
                label: 'Time-to-first-response — response latency shouldn\'t worsen with the new design',
                scoreValue: 2,
                rationale: 'Good guardrail. Smart grouping and priority ranking could theoretically cause users to respond later (if notifications are de-emphasized). Ensuring response latency doesn\'t worsen is a meaningful blocking condition.',
              },
            ],
          },
          {
            id: 'diagnosticMetrics',
            label: 'Which of the PM\'s 6 metrics should be secondaries/diagnostics (informational only)?',
            type: 'multi_select',
            conceptLinks: ['multiple-testing', 'bonferroni'],
            options: [
              {
                id: 'dm-a',
                label: 'Notification open rate — informational, not decision-making',
                scoreValue: 2,
                rationale: 'Correct classification. Open rate is a mechanism metric — it tells you whether the design change is visible. But it\'s not the business outcome. Treating it as informational keeps it out of the multiple testing problem.',
              },
              {
                id: 'dm-b',
                label: 'Notification fatigue score (survey) — interesting signal but lagging and noisy',
                scoreValue: 2,
                rationale: 'Correct classification. Survey metrics have collection lag, lower sample sizes (not all users respond), and higher variance. Valuable for understanding the mechanism but not reliable enough for a primary or guardrail.',
              },
              {
                id: 'dm-c',
                label: 'All 6 PM metrics should remain as secondary metrics tracked with equal weight',
                scoreValue: 0,
                rationale: '"Equal weight" with no primary creates the same multiple testing problem as "6 co-primaries." Secondaries should be tracked for mechanism understanding, not for equal-weight decision-making.',
              },
              {
                id: 'dm-d',
                label: 'Snooze feature usage rate — mechanism check for the new snooze functionality',
                scoreValue: 1,
                rationale: 'Good diagnostic. Snooze adoption tells you whether users are engaging with the new feature or ignoring it. High snooze adoption with neutral retention might mean the feature is used defensively (to dismiss notifications) rather than productively.',
              },
            ],
          },
        ],
      },
      {
        id: 'logistics',
        label: 'Logistics',
        hint: 'How long, how large, how attributed?',
        fields: [
          {
            id: 'runtime',
            label: 'How long should this experiment run?',
            type: 'single_select',
            conceptLinks: ['mde', 'power'],
            options: [
              {
                id: 'rt-a',
                label: '4 weeks — captures behavioral adjustment period and gives enough data for 7-day retention analysis',
                scoreValue: 2,
                rationale: 'Correct. Notification habits take time to form or change. A 4-week window allows: (1) week-over-week effect analysis to detect novelty decay, (2) enough users with complete 7-day retention observations, (3) time for the survey-based metric to be collected.',
              },
              {
                id: 'rt-b',
                label: '6 weeks — the survey metric has a 2-week lag, so we need more time',
                scoreValue: 1,
                rationale: 'The survey metric is informational — it doesn\'t need to be fully collected before making the decision. 4 weeks is sufficient for the primary and guardrails. 6 weeks is acceptable but delays the decision unnecessarily.',
              },
              {
                id: 'rt-c',
                label: '2 weeks — fast read, then decide',
                scoreValue: 0,
                rationale: 'Risky for a notification behavior test. Users need time to adjust to new notification patterns. Week-1 behavior reflects novelty response to a changed interface, not long-term behavioral equilibrium.',
              },
            ],
          },
          {
            id: 'attributionWindow',
            label: 'What attribution window applies?',
            type: 'single_select',
            conceptLinks: ['right-censoring'],
            options: [
              {
                id: 'aw-a',
                label: '7-day window from first exposure for retention; same-day window for notification metrics',
                scoreValue: 2,
                rationale: 'Correct — different metrics need different windows. Retention is measured 7 days out from signup/first exposure. Notification metrics (open rate, response rate) are measured on the day they occur. Applying a single window to all metrics is analytically wrong.',
              },
              {
                id: 'aw-b',
                label: '30-day window for all metrics to capture long-term effects',
                scoreValue: 0,
                rationale: 'The test window is 4 weeks. A 30-day window means most users don\'t have complete observations. This is a right-censoring problem — you can\'t measure 30-day retention from a 4-week test without survival analysis.',
              },
              {
                id: 'aw-c',
                label: 'Same-day window for all metrics — measure immediately to avoid confounding',
                scoreValue: 0,
                rationale: 'Appropriate for notification-level metrics but completely wrong for retention. 7-day retention cannot be measured same-day — it requires 7 days of observation by definition.',
              },
            ],
          },
          {
            id: 'sampleSizeConcern',
            label: 'What is the key power consideration?',
            type: 'single_select',
            conceptLinks: ['power', 'mde', 'multiple-testing'],
            options: [
              {
                id: 'ss-a',
                label: 'With multiple metrics, the effective per-metric significance threshold is lower after multiple testing correction — I should verify the MDE is achievable at the adjusted alpha, not nominal α = 0.05',
                scoreValue: 2,
                rationale: 'Correct and important. If you apply Bonferroni across 2 guardrails and 1 primary, your effective per-test alpha is lower. The MDE at α = 0.017 (Bonferroni for 3 tests) is larger than at α = 0.05. Verify power at the correct threshold.',
              },
              {
                id: 'ss-b',
                label: '28,000 MAU is sufficient for all 6 metrics at standard significance levels',
                scoreValue: 0,
                rationale: 'This ignores the multiple testing adjustment needed when tracking multiple metrics and treats all metrics as equally powered. Some metrics (e.g., survey-based fatigue score with low response rate) will have far less power than notification metrics with high observation rates.',
              },
              {
                id: 'ss-c',
                label: 'No power concern — use adaptive stopping (stop when any metric hits p < 0.05)',
                scoreValue: 0,
                rationale: 'Adaptive stopping on any metric is the worst possible approach for a multiple testing scenario. It inflates the false positive rate massively and makes the result completely unreliable.',
              },
            ],
          },
        ],
      },
      {
        id: 'risks',
        label: 'Risks & Decision Rule',
        hint: 'What could invalidate this, and what will you do with the result?',
        fields: [
          {
            id: 'trustChecks',
            label: 'Which trust checks should you run?',
            type: 'multi_select',
            conceptLinks: ['srm'],
            options: [
              {
                id: 'tc-a',
                label: 'SRM check on user assignment',
                scoreValue: 2,
                rationale: 'Always first. Notification system changes often involve eligibility logic that can subtly affect assignment distribution.',
              },
              {
                id: 'tc-b',
                label: 'Verify notification volume is equal in both arms (treatment isn\'t sending more or fewer notifications)',
                scoreValue: 2,
                rationale: 'Critical for this specific test. If the smart grouping algorithm sends fewer notifications in treatment, any engagement changes are confounded with notification volume, not just quality. Must be a validity check, not just a diagnostic.',
              },
              {
                id: 'tc-c',
                label: 'Verify pre-experiment engagement metrics are equivalent in both arms',
                scoreValue: 1,
                rationale: 'Good practice. For notification engagement metrics, pre-experiment equivalence confirms the randomization produced comparable arms.',
              },
            ],
          },
          {
            id: 'validityRisks',
            label: 'What are the main validity risks?',
            type: 'multi_select',
            conceptLinks: ['novelty-effect', 'multiple-testing'],
            options: [
              {
                id: 'vr-a',
                label: 'Multiple testing inflation — if you test all 6 PM metrics for significance, expect ~26% false positive rate across the set',
                scoreValue: 2,
                rationale: 'The most important validity risk for this design. The PM\'s desire for all 6 metrics to improve creates a reporting problem: if you run 6 tests at α = 0.05, you expect ~1.3 false positives by chance alone. Pre-committing to one primary and applying correction is the only solution.',
              },
              {
                id: 'vr-b',
                label: 'Novelty exploration of the snooze feature inflating early engagement metrics',
                scoreValue: 2,
                rationale: 'Real risk. The snooze feature is new. Users may interact with it heavily in week 1 (out of curiosity) and then stop using it in week 3. Weekly breakdowns will diagnose this.',
              },
              {
                id: 'vr-c',
                label: 'Hawthorne effect — users in treatment may be more engaged because they know they\'re in a test',
                scoreValue: 0,
                rationale: 'Users don\'t know they\'re in an experiment. Hawthorne effect is not a meaningful threat in standard product A/B tests where treatment/control assignment is invisible to users.',
              },
              {
                id: 'vr-d',
                label: 'Business pressure creating post-hoc cherry-picking — the PM commits to "6 metrics improve" but will accept if "most" improve after seeing data',
                scoreValue: 2,
                rationale: 'The most important organizational risk. The PM\'s "all 6 metrics" framing creates political pressure to find wins. Without a pre-committed primary metric and decision rule, the readout becomes a post-hoc exercise in finding positive metrics. This is a validity risk that must be addressed before the test starts.',
              },
            ],
          },
          {
            id: 'decisionRule',
            label: 'What is the pre-committed decision rule?',
            type: 'single_select',
            conceptLinks: ['p-value', 'guardrail-metric', 'multiple-testing', 'bonferroni'],
            options: [
              {
                id: 'dr-a',
                label: 'Ship if the pre-committed primary metric (7-day retention or WAU) is significantly positive at the alpha-adjusted threshold AND no guardrails breach. Secondary metrics are reported for context but do not change the decision.',
                scoreValue: 2,
                rationale: 'Correct structure. One primary, alpha-adjusted, guardrails as blocking conditions, secondaries as informational. This is the only pre-committed rule that prevents post-hoc cherry-picking from 6 metrics.',
              },
              {
                id: 'dr-b',
                label: 'Ship if the majority (4+) of the PM\'s 6 metrics improve significantly.',
                scoreValue: 0,
                rationale: '"Majority of 6 metrics" is an ad hoc threshold with no statistical justification. It\'s essentially running 6 tests and selecting a post-hoc rule. The effective false positive rate is not α = 0.05 — it\'s much higher.',
              },
              {
                id: 'dr-c',
                label: 'Ship if any core engagement metric (open rate, response rate, or retention) is significantly positive.',
                scoreValue: 0,
                rationale: '"Any of three" is a multiple testing problem. The probability of at least one false positive across three tests at α = 0.05 is ~14%. This is three times the nominal rate.',
              },
              {
                id: 'dr-d',
                label: 'Ship if 7-day retention improves significantly AND notification unsubscribe rate doesn\'t significantly increase AND response time doesn\'t significantly worsen. Apply Bonferroni correction across these three tests.',
                scoreValue: 2,
                rationale: 'Also correct and more precise. Explicitly applies Bonferroni correction to the set of decision-relevant tests. This is staff-level precision — most analysts get the spirit right but don\'t specify the correction method.',
              },
            ],
          },
        ],
      },
    ],

    scoringRubric: {
      dimensions: [
        { id: 'metric_selection', label: 'Metric selection', weight: 0.30, fieldIds: ['primaryMetric', 'guardrailMetrics'] },
        { id: 'design_validity', label: 'Design validity', weight: 0.35, fieldIds: ['randomizationUnit', 'unitOfAnalysis', 'trustChecks', 'validityRisks'] },
        { id: 'decision_discipline', label: 'Decision discipline', weight: 0.20, fieldIds: ['decisionRule', 'sampleSizeConcern'] },
        { id: 'hypothesis_framing', label: 'Hypothesis framing', weight: 0.15, fieldIds: ['hypothesis', 'businessDecision'] },
      ],
      levels: {
        incomplete:    { minScore: 0,    label: 'Incomplete' },
        analyst_ready: { minScore: 0.45, label: 'Analyst-Ready' },
        senior_ready:  { minScore: 0.68, label: 'Senior-Ready' },
        staff_level:   { minScore: 0.85, label: 'Staff-Level' },
      },
    },

    seniorDesign: {
      rationale: 'The central problem in this design is the PM\'s framing. "All 6 metrics should improve" is not a hypothesis — it\'s a wish. Letting it stand as the success definition means the readout will become a post-hoc exercise in finding which metrics moved in the right direction, and calling that success.\n\nThe analyst\'s job before this test starts is to get a pre-committed primary metric agreed upon. That means going back to the PM and asking: "If exactly one of these six metrics moves in the right direction, is that a success? Which one would it be?" That conversation is analytically essential, not politically optional.\n\nThe multiple testing correction is not optional either. If you track 6 metrics without correction, you will report false positives. The structure is: one primary (retention or WAU), one or two guardrails (unsubscribe rate, response time), the rest informational. Bonferroni or Benjamini-Hochberg across the primary + guardrails is appropriate.\n\nThe notification volume check is the most important trust check specific to this design. If the smart grouping algorithm reduces notification volume, any engagement change is partially explained by volume, not quality. That confound must be verified before interpreting results.',
      commonMistakes: [
        {
          mistake: 'Treating all 6 PM metrics as co-equal primaries',
          consequence: 'With 6 tests at α = 0.05, you expect ~1.3 false positives. When the readout arrives, you\'ll find 2-3 "significant" results and call it a win — but some of those wins are noise. You ship a feature whose real effect is smaller or zero.',
          conceptLink: 'multiple-testing',
        },
        {
          mistake: 'Not verifying notification volume equivalence before the test',
          consequence: 'Smart grouping reduces notification volume by 20% in treatment. Notification engagement metrics (open rate, response rate) improve partly because there are fewer, higher-quality notifications. The effect is real but confounded — it\'s partly a volume effect, not purely a quality effect.',
          conceptLink: 'srm',
        },
        {
          mistake: 'Allowing "all 6 metrics should improve" to remain as the success definition',
          consequence: 'The business pressure creates post-hoc cherry-picking. 4 metrics improve, 2 don\'t. The team negotiates down to "most metrics improved" as success. The experiment has no pre-committed rule to prevent this.',
          conceptLink: 'p-value',
        },
      ],
      failureMode: {
        weakAnswer: 'The candidate accepts all 6 metrics as co-equal primaries, runs the test, and at readout reports "4 of 6 metrics improved, so the feature is a success." They apply no multiple testing correction, never resolve the success definition with the PM before launch, and allow the post-hoc "most metrics improved" framing to stand.',
        interviewerFollowUp: '"4 of your 6 metrics improved, 2 didn\'t. With 6 metrics at α=0.05 and no multiple testing correction, how many false positives would you expect by chance alone — and if the answer is ~1.3, does \'4 out of 6 improved\' actually tell you anything about whether the notification redesign works?"',
      },
    },

    pairedScenarioPrompt: {
      toReview: 'You designed this test — and pre-committed to a decision rule. Now read what happened when Loopwise ran it.',
      fromReview: 'You read the Five Metrics Problem. Go back and design this experiment — decide before seeing the data how many metrics can count as "success."',
    },
  },

  // ─────────────────────────────────────────────
  // D05 — Design the Search Ranking Test (BETA · Analyst)
  // Paired with: s09-clickbait-ranking-win
  // Core trap: CTR as primary metric is gameable; downstream quality metrics are the real signal
  // ─────────────────────────────────────────────
  {
    id: 'd05-search-ranking-test',
    title: 'Design the Search Ranking Test',
    subtitle: 'Vela wants to test a new ML search ranking algorithm. Design the experiment before the team locks in CTR as the primary metric.',
    isFree: false,
    difficulty: 'analyst',
    industry: 'ecommerce',
    scenarioFamily: 'proxy_metric',
    pairedReviewScenarioId: 's09-clickbait-ranking-win',

    context: {
      company: 'Vela',
      product: 'B2C e-commerce marketplace — handmade and independent goods, ~$80M GMV',
      team: 'Search & Discovery team',
      background: 'Vela\'s current search ranking uses a rule-based algorithm built three years ago. The team has spent a quarter training a new ML model that boosts results with higher historical click-through rates. Early offline evaluation looks promising. Engineering is ready to ship a staged rollout. The PM is enthusiastic: "We built CTR into the training objective — we should use it as the primary metric."',
      featureProposal: 'Replace the rule-based search ranking with the new ML model. Hypothesis: ML-ranked results will be more relevant to user intent and improve discovery of matching products.',
      businessPressure: 'The ML team has been working on this for a quarter. The Head of Product wants to show an "AI win" for the roadmap review next month. The PM has already drafted a CTR-based success metric into the project tracker.',
      constraints: [
        '~190,000 search queries per day across ~60,000 daily active searchers',
        '14–21 day runtime target before the next sprint planning',
        'User-level assignment is feasible; query-level is not recommended by engineering due to caching',
        'Purchase and add-to-cart events are attributed to specific search sessions in the data warehouse',
      ],
    },

    designPhases: [
      {
        id: 'framing',
        label: 'Framing',
        hint: 'What decision does this experiment inform? What is the real hypothesis?',
        fields: [
          {
            id: 'businessDecision',
            label: 'What is the business decision this experiment informs?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'bd-a',
                label: 'Whether to replace the rule-based ranking with the ML model platform-wide',
                scoreValue: 2,
                rationale: 'Correct. The decision is binary and specific: deploy or don\'t deploy this particular model. This scopes the test and makes the ship/hold decision rule straightforward.',
              },
              {
                id: 'bd-b',
                label: 'Whether the ML model produces better click-through rates than the rule-based system',
                scoreValue: 0,
                rationale: 'CTR is a metric, not a business decision. A model could produce dramatically higher CTR while degrading product quality (clickbait results). The business decision is about value delivery, not a single proxy metric.',
              },
              {
                id: 'bd-c',
                label: 'Whether search ranking is a worthwhile area to invest ML resources in',
                scoreValue: 0,
                rationale: 'Too broad. This question was already answered by the team\'s decision to build the model. The experiment\'s job is to evaluate this specific model — not re-litigate the investment decision.',
              },
              {
                id: 'bd-d',
                label: 'Whether the ML model or a future iteration of it should be deployed',
                scoreValue: 1,
                rationale: 'Reasonable framing of uncertainty, but slightly too broad. This experiment tests this model. A future iteration would need its own test. The decision at hand is the current model vs. current baseline.',
              },
            ],
          },
          {
            id: 'hypothesis',
            label: 'Select the strongest hypothesis formulation',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'hyp-a',
                label: 'The ML model will increase click-through rate on search results by surfacing more engaging listings first.',
                scoreValue: 0,
                rationale: 'This is only one side of the story. CTR optimized by ML can be gamed by clickbait titles. A hypothesis that only covers CTR ignores whether users actually find and purchase what they searched for.',
              },
              {
                id: 'hyp-b',
                label: 'The ML ranking will improve search success rate (add-to-cart or purchase from search) and reduce reformulation rate, because users find more relevant results without needing to refine their query.',
                scoreValue: 2,
                rationale: 'Strong. This captures the real business outcome (successful search = user found what they wanted) and includes a mechanism check (reformulation rate = user had to rephrase, suggesting initial results failed). Both metrics are hard to game and reflect genuine quality.',
              },
              {
                id: 'hyp-c',
                label: 'The ML model will outperform the rule-based system on at least one search quality metric.',
                scoreValue: 0,
                rationale: '"At least one metric" is not a hypothesis — it\'s a hope. This formulation allows the team to declare success on any convenient metric after data arrives. Pre-commit to the most important metric before seeing results.',
              },
              {
                id: 'hyp-d',
                label: 'The ML model will improve conversion from search without increasing zero-result or reformulation rates.',
                scoreValue: 1,
                rationale: 'Good direction — includes the quality constraint. But "conversion from search" is slightly ambiguous. Adding clarity about what counts as conversion (add-to-cart? purchase?) and stating the mechanism more explicitly would strengthen it.',
              },
            ],
          },
        ],
      },
      {
        id: 'setup',
        label: 'Setup',
        hint: 'Who gets treated and at what level?',
        fields: [
          {
            id: 'eligiblePopulation',
            label: 'Who should be included in this experiment?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'ep-a',
                label: 'All users who perform at least one search query during the test window',
                scoreValue: 2,
                rationale: 'Correct. The treatment applies to all search results. Restricting to a subgroup (power users, new users) would limit generalizability and the result wouldn\'t hold across the full user base.',
              },
              {
                id: 'ep-b',
                label: 'Only users who perform more than 5 searches per day, as they drive most search GMV',
                scoreValue: 0,
                rationale: 'High-volume searchers may already be sophisticated enough to find results under the old system. The ML model may have a larger impact on casual searchers who rely more on ranking quality. Restricting to power users underestimates the full deployment effect.',
              },
              {
                id: 'ep-c',
                label: 'New users only — fresh users have no pre-formed expectations about search quality',
                scoreValue: 0,
                rationale: 'Restricting to new users produces a result that can\'t be generalized to the full user base. Ranking quality for returning users (who may search for specific sellers or categories) is different. This also reduces power significantly.',
              },
              {
                id: 'ep-d',
                label: 'All users except those in active seller promotions, to avoid confounding with promoted listings',
                scoreValue: 1,
                rationale: 'Reasonable precaution — promoted listings interfere with organic ranking signals. But excluding these users may reduce power and may not be necessary if promoted listings are ranked separately in both arms. Clarify whether the ML model applies to promoted positions before deciding.',
              },
            ],
          },
          {
            id: 'randomizationUnit',
            label: 'What should the randomization unit be?',
            type: 'single_select',
            conceptLinks: ['randomization-unit'],
            options: [
              {
                id: 'ru-a',
                label: 'User (each user consistently sees one ranking system)',
                scoreValue: 2,
                rationale: 'Correct. User-level assignment ensures consistent experience — the same user won\'t see ML-ranked results for one query and rule-based for another. This also avoids within-user contamination and is technically feasible given engineering constraints.',
              },
              {
                id: 'ru-b',
                label: 'Query (each search query is independently ranked by one system)',
                scoreValue: 0,
                rationale: 'Query-level randomization means the same user sees different ranking systems in the same session. This creates within-user contamination (user learns what the ML ranking shows, forms expectations, then sees old system). Engineering also flagged caching issues with query-level assignment.',
              },
              {
                id: 'ru-c',
                label: 'Session (each session uses one ranking system)',
                scoreValue: 1,
                rationale: 'Better than query-level — at least one session is consistent. But within-user sessions are correlated. If a user has 3 sessions (ML, rule-based, ML), the observed effect is attenuated and standard errors are underestimated. User-level is cleaner.',
              },
              {
                id: 'ru-d',
                label: 'Seller (treat the seller\'s listings in one system, control in another)',
                scoreValue: 0,
                rationale: 'Wrong unit. The ranking experience is a buyer-side feature. Sellers don\'t experience the ranking — buyers do. Seller-level randomization would expose the same buyer to both systems (treatment sellers appearing in search alongside control sellers), which is not a valid design.',
              },
            ],
          },
          {
            id: 'unitOfAnalysis',
            label: 'What is the unit of analysis for computing metrics?',
            type: 'single_select',
            conceptLinks: ['unit-of-analysis'],
            options: [
              {
                id: 'ua-a',
                label: 'User — compute success rate as users with at least one successful search / total users assigned',
                scoreValue: 2,
                rationale: 'Matches the randomization unit. Computing at the user level avoids the inflation from treating multiple queries per user as independent observations.',
              },
              {
                id: 'ua-b',
                label: 'Query — compute success rate as converting queries / total queries',
                scoreValue: 0,
                rationale: 'Mismatches the user-level randomization. Queries from the same user are correlated — treating them as independent deflates standard errors and overstates confidence. A user who performs 20 searches contributes 20 "units" but was only randomized once.',
              },
              {
                id: 'ua-c',
                label: 'Session — compute success as converting sessions / total sessions',
                scoreValue: 1,
                rationale: 'Slightly better than query-level, but still mismatches user-level randomization. One user can have many sessions. Use delta method or cluster at the user level for session-based metrics if needed for specific analyses.',
              },
            ],
          },
        ],
      },
      {
        id: 'metrics',
        label: 'Metrics',
        hint: 'What actually measures successful search — not just activity?',
        fields: [
          {
            id: 'primaryMetric',
            label: 'What is the primary metric for this experiment?',
            type: 'single_select',
            conceptLinks: ['primary-metric', 'proxy-metric'],
            options: [
              {
                id: 'pm-a',
                label: 'Click-through rate on search results (clicks / impressions)',
                scoreValue: 0,
                rationale: 'The ML model was trained on CTR — optimizing for CTR in the test validates the training signal, not the quality of the product. CTR can be gamed by listings with compelling thumbnails and misleading titles. A ranking that maximizes CTR while degrading purchase conversion is a bad ranking.',
              },
              {
                id: 'pm-b',
                label: 'Search-to-add-to-cart rate (users adding to cart from a search session / users who searched)',
                scoreValue: 2,
                rationale: 'Strong. This captures whether users actually find and want the products the search returns. Add-to-cart is downstream of CTR — it requires both clicking and deciding the product is relevant. Harder to game by clickbait than pure CTR.',
              },
              {
                id: 'pm-c',
                label: 'Revenue per searcher (total GMV from users who searched / total users who searched)',
                scoreValue: 2,
                rationale: 'Also strong. Captures the downstream business value of better search. A ranking that improves CTR but doesn\'t convert to purchases doesn\'t help Vela. Revenue per searcher makes the business case directly.',
              },
              {
                id: 'pm-d',
                label: 'Number of search sessions per user (more searching = more engagement)',
                scoreValue: 0,
                rationale: 'Wrong direction. More search sessions per user could mean users are failing to find what they want and retrying. Bad search quality often increases query volume. This metric conflates success with failure.',
              },
            ],
          },
          {
            id: 'guardrailMetrics',
            label: 'Which metrics should be pre-committed guardrails? (Select all that apply)',
            type: 'multi_select',
            conceptLinks: ['guardrail-metric'],
            options: [
              {
                id: 'gm-a',
                label: 'Query reformulation rate (user rewrites query after seeing initial results)',
                scoreValue: 2,
                rationale: 'Critical guardrail. Reformulation is a direct signal of search failure — the user found the results unsatisfactory and tried again. A ranking that increases CTR while increasing reformulations is showing attractive but wrong results.',
              },
              {
                id: 'gm-b',
                label: 'Zero-result rate (searches returning no results)',
                scoreValue: 1,
                rationale: 'Good guardrail. An ML model could narrow the ranking in ways that increase zero-result queries (filtering out low-CTR-history listings that would have been valid results). Zero-result rate should not increase.',
              },
              {
                id: 'gm-c',
                label: 'Post-purchase seller review score',
                scoreValue: 0,
                rationale: 'Too lagging. Post-purchase review scores take days or weeks to accrue. A 14–21 day test won\'t have sufficient review volume to make this a reliable guardrail. Track it as a long-run diagnostic after deployment, not as an in-experiment guardrail.',
              },
              {
                id: 'gm-d',
                label: 'Search bounce rate (user clicks a result and immediately returns to search)',
                scoreValue: 1,
                rationale: 'Useful signal of result quality — if users click but immediately return, the listing was deceptive. This complements reformulation rate and CTR. Worth including as a guardrail or secondary metric.',
              },
            ],
          },
          {
            id: 'diagnosticMetrics',
            label: 'Which metrics should be tracked as diagnostics (informational only)?',
            type: 'multi_select',
            conceptLinks: [],
            options: [
              {
                id: 'dm-a',
                label: 'CTR on search results (treatment vs control)',
                scoreValue: 1,
                rationale: 'Good diagnostic. CTR is the ML training signal — understanding whether it moves (and whether it leads to conversion) explains the mechanism. Include it as diagnostic, not primary.',
              },
              {
                id: 'dm-b',
                label: 'Position of first-click listing (is the ML model surfacing relevant results higher?)',
                scoreValue: 1,
                rationale: 'Useful mechanism check. If the ML model improves ranking quality, users should find what they want at higher positions — fewer clicks to find the right listing.',
              },
              {
                id: 'dm-c',
                label: '30-day seller repeat listing rate',
                scoreValue: 0,
                rationale: 'Too lagging and too indirect. Seller listing behavior is affected by many factors beyond search quality. This metric won\'t yield actionable insight within the experiment window.',
              },
            ],
          },
        ],
      },
      {
        id: 'logistics',
        label: 'Logistics',
        hint: 'How long, how attributed, and what are the power concerns?',
        fields: [
          {
            id: 'runtime',
            label: 'How long should this experiment run?',
            type: 'single_select',
            conceptLinks: ['novelty-effect'],
            options: [
              {
                id: 'rt-a',
                label: '14 days',
                scoreValue: 1,
                rationale: 'Acceptable minimum. 14 days captures full week cycles and gives reasonable stabilization for search behavior. But 21 days is safer — novelty effects in new search experiences can take 1–2 weeks to decay. If 14 days is the hard constraint, acknowledge the novelty risk.',
              },
              {
                id: 'rt-b',
                label: '21 days',
                scoreValue: 2,
                rationale: 'Correct. Three weeks ensures full week-over-week comparison, enough time for search behavior to stabilize, and adequate time for novelty effects to decay. Search habits take longer to settle than single-session features.',
              },
              {
                id: 'rt-c',
                label: '7 days',
                scoreValue: 0,
                rationale: 'Too short. Search behavior is influenced heavily by day-of-week effects (weekend vs. weekday query intent differs). 7 days does not capture a full behavioral cycle and is high-risk for novelty effects inflating week-1 CTR.',
              },
              {
                id: 'rt-d',
                label: 'Run until p < 0.05 on CTR',
                scoreValue: 0,
                rationale: 'Classic peeking problem. Stopping when CTR reaches significance without checking conversion and guardrails captures the most favorable point in the novelty window. Pre-commit the runtime before launch.',
              },
            ],
          },
          {
            id: 'attributionWindow',
            label: 'What attribution window should apply to conversion metrics?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'aw-a',
                label: 'Same search session (search → purchase within the session)',
                scoreValue: 2,
                rationale: 'Correct for search quality. Search intent is immediate — a user searching for a product either finds it and buys it in that session, or doesn\'t. Cross-session attribution conflates search quality with factors like email reminders and retargeting.',
              },
              {
                id: 'aw-b',
                label: '7-day post-search window (any purchase within 7 days of a search)',
                scoreValue: 1,
                rationale: 'Reasonable for some product categories (considered purchases), but introduces confounding from non-search-related sessions. The longer the window, the more noise. Use same-session as primary and 7-day as a secondary diagnostic.',
              },
              {
                id: 'aw-c',
                label: '30-day post-search window to capture consideration purchases',
                scoreValue: 0,
                rationale: 'Too wide. A 30-day window can\'t be fully observed within a 21-day experiment. And search influence on a 30-day purchase is very weak — the user has had many other sessions, other entry points, and other signals. This attribution is too noisy to be meaningful.',
              },
            ],
          },
          {
            id: 'sampleSizeConcern',
            label: 'What is the main power concern for this experiment?',
            type: 'single_select',
            conceptLinks: ['power', 'mde'],
            options: [
              {
                id: 'ss-a',
                label: 'None — 60k daily searchers is plenty for any reasonable MDE',
                scoreValue: 0,
                rationale: 'Overconfident. 60k daily searchers gives power on the primary metric, but guardrail metrics like reformulation rate (a relatively rare event for most users) and zero-result rate may have lower base rates that require verification. Always check MDE for each metric separately.',
              },
              {
                id: 'ss-b',
                label: 'The primary metric is well-powered, but rare events (zero-result rate, reformulation rate) may have low base rates requiring careful MDE verification per metric',
                scoreValue: 2,
                rationale: 'Correct. Primary metric power at 60k/day is high. But guardrail metrics with low base rates may be underpowered for small effects. Run power calculations for each metric before launch — especially for the guardrails you\'ve pre-committed as blocking conditions.',
              },
              {
                id: 'ss-c',
                label: 'The experiment needs more traffic before running — search quality tests require millions of queries',
                scoreValue: 0,
                rationale: 'Incorrect. 60k daily searchers × 21 days = ~1.26M user-days. That is more than sufficient for user-level metrics at reasonable effect sizes. Search quality tests don\'t inherently require millions of users.',
              },
            ],
          },
        ],
      },
      {
        id: 'risks',
        label: 'Risks & Decision Rule',
        hint: 'What invalidates this experiment, and what will you do with the result?',
        fields: [
          {
            id: 'trustChecks',
            label: 'Which trust checks should you run before interpreting results? (Select all)',
            type: 'multi_select',
            conceptLinks: ['srm'],
            options: [
              {
                id: 'tc-a',
                label: 'SRM check on user assignment counts',
                scoreValue: 2,
                rationale: 'Always first. Search experiments with caching layers and session-based eligibility checks are common sources of SRM. Verify assignment counts before reading any metric.',
              },
              {
                id: 'tc-b',
                label: 'Verify query distribution is balanced between arms (category, query length, user intent)',
                scoreValue: 2,
                rationale: 'Important for search. If treatment users happened to submit more high-intent queries (e.g., more specific product searches), the apparent improvement may reflect query mix, not ranking quality. Check at minimum: query length distribution, category distribution.',
              },
              {
                id: 'tc-c',
                label: 'Check that pre-experiment CTR is comparable between arms',
                scoreValue: 1,
                rationale: 'Good baseline check if pre-experiment data is available. Comparable pre-experiment CTR confirms the arms were balanced on the most sensitive metric before treatment started.',
              },
              {
                id: 'tc-d',
                label: 'Verify that promoted listing inventory is identical in both arms',
                scoreValue: 1,
                rationale: 'Valid concern. If the ML model affects where promoted listings appear, the commercial value of promotions could be different between arms. Worth checking that promoted listing exposure is consistent.',
              },
            ],
          },
          {
            id: 'validityRisks',
            label: 'What are the main validity risks for this experiment? (Select all)',
            type: 'multi_select',
            conceptLinks: ['novelty-effect', 'proxy-metric'],
            options: [
              {
                id: 'vr-a',
                label: 'Novelty effect — users may click more on new-looking results in the first week before behavior stabilizes',
                scoreValue: 2,
                rationale: 'High risk for search. New ranking layouts and result ordering trigger novelty-driven curiosity clicks. Week-1 CTR will likely overstate the steady-state effect. The 21-day runtime and week-over-week monitoring help control for this.',
              },
              {
                id: 'vr-b',
                label: 'Proxy metric gaming — ML model may have learned to optimize CTR at the cost of result quality',
                scoreValue: 2,
                rationale: 'The core risk of this experiment. The ML model was trained on CTR — which is exactly the metric the PM wants to use as primary. This creates circularity: a model that is good at getting clicks will look good on CTR even if the underlying results are misleading. Downstream metrics (conversion, reformulation) break this circularity.',
              },
              {
                id: 'vr-c',
                label: 'SUTVA violation — buyers and sellers interact through shared listings',
                scoreValue: 0,
                rationale: 'Lower risk here. Search ranking affects buyer experience, but the mechanism isn\'t through buyer-to-buyer interference. Sellers don\'t change their listing behavior based on which ranking algorithm a buyer sees. Unlike a marketplace incentive experiment, SUTVA is not a major concern for a buyer-side ranking test.',
              },
              {
                id: 'vr-d',
                label: 'Day-of-week confounding — search intent differs on weekends vs. weekdays',
                scoreValue: 1,
                rationale: 'Real concern if the test runs an odd number of days. A 21-day test covers three full weeks — this is handled. A 14-day test also covers two full cycles. Any runtime shorter than 7 days creates day-of-week bias.',
              },
            ],
          },
          {
            id: 'decisionRule',
            label: 'What is the pre-committed decision rule?',
            type: 'single_select',
            conceptLinks: ['p-value', 'guardrail-metric'],
            options: [
              {
                id: 'dr-a',
                label: 'Ship if CTR is significantly positive. Review conversion results "for context."',
                scoreValue: 0,
                rationale: '"For context" means the conversion and guardrail data will be rationalized away if CTR looks good. This is the exact failure mode in the paired Review scenario. A decision rule that uses a proxy metric as primary and treats quality metrics as optional context is not a decision rule.',
              },
              {
                id: 'dr-b',
                label: 'Ship if primary metric (search-to-cart rate or revenue per searcher) is significantly positive AND reformulation rate does not increase significantly AND zero-result rate does not increase. Hold if any guardrail breaches.',
                scoreValue: 2,
                rationale: 'Correct. This rule pre-commits to quality-based outcomes as the ship trigger, treats guardrail breaches as blocking, and leaves no room for post-hoc CTR rationalization. This is senior-level decision discipline.',
              },
              {
                id: 'dr-c',
                label: 'Ship if at least 3 of 5 metrics show positive trend.',
                scoreValue: 0,
                rationale: 'Multiple testing problem. "At least 3 of 5" is not pre-committed — it\'s a threshold chosen to match whatever the data shows. If 2 guardrails breach and 3 positive secondaries appear, this rule would ship. That\'s wrong.',
              },
              {
                id: 'dr-d',
                label: 'Ship if primary metric is positive AND at least one guardrail is clean. Tolerate one guardrail breach if the primary effect size is large.',
                scoreValue: 1,
                rationale: 'Better than no rule, but "tolerate one guardrail breach" introduces post-hoc negotiation. Guardrails should be blocking. If you want the ability to override, define the override condition before the test (e.g., "primary must be ≥X% and breach must be ≤Y%").',
              },
            ],
          },
        ],
      },
    ],

    scoringRubric: {
      dimensions: [
        { id: 'metric_selection', label: 'Metric selection', weight: 0.35, fieldIds: ['primaryMetric', 'guardrailMetrics'] },
        { id: 'design_validity', label: 'Design validity', weight: 0.30, fieldIds: ['randomizationUnit', 'unitOfAnalysis', 'trustChecks', 'validityRisks'] },
        { id: 'decision_discipline', label: 'Decision discipline', weight: 0.20, fieldIds: ['decisionRule', 'sampleSizeConcern'] },
        { id: 'hypothesis_framing', label: 'Hypothesis framing', weight: 0.15, fieldIds: ['hypothesis', 'businessDecision'] },
      ],
      levels: {
        incomplete:    { minScore: 0,    label: 'Incomplete' },
        analyst_ready: { minScore: 0.45, label: 'Analyst-Ready' },
        senior_ready:  { minScore: 0.68, label: 'Senior-Ready' },
        staff_level:   { minScore: 0.85, label: 'Staff-Level' },
      },
    },

    seniorDesign: {
      rationale: 'The central problem in this design is the PM\'s proposal to use CTR as the primary metric. The ML model was trained to optimize CTR — using CTR to evaluate it creates a circular test that can only validate whether the model learned its training signal. It cannot tell you whether the model improves user outcomes.\n\nThe right primary metric is downstream of the click: search-to-add-to-cart rate or revenue per searcher. These measure whether users actually found and wanted what the search returned. They are much harder to game by clickbait titles and misleading thumbnails.\n\nReformulation rate is the single most important guardrail. A user who rewrites their query after seeing results is directly telling you the first results failed. If reformulation rate rises while CTR rises, the ML model learned to surface clickbait — results that attract attention but don\'t match intent.\n\nThe 21-day runtime matters. Search ranking novelty effects are real: users click new result arrangements out of curiosity. Week-1 CTR will overstate steady-state quality. Build week-over-week monitoring into the analysis plan.',
      commonMistakes: [
        {
          mistake: 'Using CTR as the primary metric for a model trained on CTR',
          consequence: 'The test validates the training signal, not user outcomes. A model that maximizes CTR by learning which listing thumbnails are most compelling will look like a huge win while potentially degrading purchase quality.',
          conceptLink: 'proxy-metric',
        },
        {
          mistake: 'Query-level or session-level randomization',
          consequence: 'The same user sees different ranking systems across sessions, creating within-user contamination. Results appear to show a larger, more significant effect than actually exists.',
          conceptLink: 'randomization-unit',
        },
        {
          mistake: 'Treating novelty-driven CTR as steady-state quality signal',
          consequence: 'Week-1 CTR for a new ranking system is elevated because users explore unfamiliar result ordering. If the experiment ships on week-1 data, the deployed product may show substantially lower CTR than the test suggested.',
          conceptLink: 'novelty-effect',
        },
      ],
      failureMode: {
        weakAnswer: 'The candidate agrees with the PM that CTR is the right primary metric "since that\'s what the model optimizes for," runs the test for 14 days, reads a +11% CTR lift as a success, and recommends shipping. They never add add-to-cart or purchase as guardrail metrics and never flag the circular validation problem of using the training objective as the evaluation metric.',
        interviewerFollowUp: '"CTR is up 11%. You\'re recommending ship. If the ML model learned to surface listings with misleading thumbnails that get clicked but rarely purchased, how would your experiment catch that — and what specific metric would show the problem that your current design doesn\'t track?"',
      },
    },

    pairedScenarioPrompt: {
      toReview: 'You designed this search experiment. Now see what happened when Vela ran it — with CTR as the primary metric.',
      fromReview: 'You read the clickbait ranking result. Go back and redesign this experiment to catch the proxy metric trap before data exists.',
    },
  },

  // ─────────────────────────────────────────────
  // D06 — Design the Notification Timing Test (BETA · Analyst)
  // Paired with: s10-push-open-rate-trap
  // Core trap: optimizing for open rate, not retention — over-notification harms trust
  // ─────────────────────────────────────────────
  {
    id: 'd06-notification-timing-test',
    title: 'Design the Notification Timing Test',
    subtitle: 'Orion wants to test ML-personalized push notification timing. Design the experiment before the team locks in open rate as the win condition.',
    isFree: false,
    difficulty: 'analyst',
    industry: 'mobile',
    scenarioFamily: 'proxy_metric',
    pairedReviewScenarioId: 's10-push-open-rate-trap',

    context: {
      company: 'Orion',
      product: 'Consumer habit and task tracking app — 2.1M MAU, daily notification-driven re-engagement',
      team: 'Growth & Engagement team',
      background: 'Orion currently sends push notifications at fixed times (8am, 12pm, 7pm). The new proposal: use ML to personalize notification send time for each user based on their historical open patterns. The team believes this will increase engagement. The PM\'s success metric is notification open rate.',
      featureProposal: 'Replace fixed notification timing with ML-personalized timing per user. Hypothesis: sending at each user\'s historically high-open time will increase engagement.',
      businessPressure: 'DAU/MAU has been declining. The Head of Growth wants to show an engagement improvement this sprint. The PM has booked a "launch day" announcement for the feature.',
      constraints: [
        '~620,000 users with notifications enabled',
        'Notification volume is fixed per user per day (1 per day) — the test only changes the send time',
        'Opt-out and uninstall events are logged in real time',
        'A 14–21 day window is available before the next sprint planning',
      ],
    },

    designPhases: [
      {
        id: 'framing',
        label: 'Framing',
        hint: 'What is the right goal? More opens, or better engagement?',
        fields: [
          {
            id: 'businessDecision',
            label: 'What business decision does this experiment inform?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'bd-a',
                label: 'Whether to deploy ML-personalized notification timing to all users with notifications enabled',
                scoreValue: 2,
                rationale: 'Correct. The decision is binary and specific: keep fixed timing or deploy personalized timing. Clear scope, clear ship/hold path.',
              },
              {
                id: 'bd-b',
                label: 'Whether notification open rate can be improved using ML',
                scoreValue: 0,
                rationale: 'Open rate is a proxy. A model that sends at the exact moment someone picks up their phone to do something else might spike opens without improving task completion or retention. The business decision is about durable engagement, not raw opens.',
              },
              {
                id: 'bd-c',
                label: 'Whether push notifications are an effective re-engagement channel at all',
                scoreValue: 0,
                rationale: 'Too broad. The channel\'s effectiveness is already validated — the question is whether timing personalization improves outcomes. Re-litigating the channel decision is out of scope for this experiment.',
              },
              {
                id: 'bd-d',
                label: 'Whether ML-personalized timing should replace fixed timing or be offered as a user preference setting',
                scoreValue: 1,
                rationale: 'Interesting framing of the downstream decision, but this experiment can\'t answer both simultaneously. The test should evaluate the ML model vs. fixed timing. How to deploy (forced vs. optional) is a product decision that comes after, not during, the experiment.',
              },
            ],
          },
          {
            id: 'hypothesis',
            label: 'Select the strongest hypothesis formulation',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'hyp-a',
                label: 'ML-personalized timing will increase notification open rate by reaching users when they are most likely to engage.',
                scoreValue: 0,
                rationale: 'Open rate is the proxy. A timing model could trivially improve opens by sending at times users are already opening their phones — without improving task completion, habit formation, or retention.',
              },
              {
                id: 'hyp-b',
                label: 'ML-personalized timing will improve 7-day active session rate without increasing opt-out or uninstall rate, by making notifications feel timely rather than intrusive.',
                scoreValue: 2,
                rationale: 'Strong. This is the right hypothesis — it specifies the outcome that matters (retention/session quality), includes the harm constraint (opt-out/uninstall), and describes the mechanism (timeliness vs. intrusiveness).',
              },
              {
                id: 'hyp-c',
                label: 'ML timing will increase both open rate and 7-day retention.',
                scoreValue: 1,
                rationale: 'Better than open-rate-only, but "and" introduces ambiguity in the decision rule. If open rate rises but retention doesn\'t — or vice versa — what\'s the decision? Pre-commit to a primary.',
              },
              {
                id: 'hyp-d',
                label: 'By sending fewer low-engagement notifications, ML timing will reduce opt-outs.',
                scoreValue: 1,
                rationale: 'Interesting framing but the wrong direction — the test doesn\'t reduce notification volume, it changes timing. If opt-out reduction is the hypothesis, reducing volume is the mechanism, not timing.',
              },
            ],
          },
        ],
      },
      {
        id: 'setup',
        label: 'Setup',
        hint: 'Who gets treated, and should you segment by notification behavior?',
        fields: [
          {
            id: 'eligiblePopulation',
            label: 'Who should be included in this experiment?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'ep-a',
                label: 'All users with push notifications enabled',
                scoreValue: 2,
                rationale: 'Correct. The treatment is the timing model — it applies to all users who receive notifications. Restricting to a subgroup reduces generalizability and may exclude segments most affected by timing (e.g., users who receive notifications at suboptimal times currently).',
              },
              {
                id: 'ep-b',
                label: 'Only highly active users (opened at least 5 notifications in the past 30 days)',
                scoreValue: 0,
                rationale: 'Restricting to active openers underestimates the value of the timing model for users who currently ignore notifications. The ML model may have the largest effect on users who have been getting notifications at the wrong time — excluding them misses the point.',
              },
              {
                id: 'ep-c',
                label: 'Exclude users who signed up in the last 7 days',
                scoreValue: 1,
                rationale: 'Reasonable precaution. New users have no notification history for the ML model to train on, so they\'d get effectively random timing rather than personalized timing. Excluding them avoids a diluted treatment effect for new users.',
              },
              {
                id: 'ep-d',
                label: 'Only users who have opted into notifications within the last 30 days',
                scoreValue: 0,
                rationale: 'No reason to restrict to recent opt-ins. Long-standing notification users are exactly the population the ML model should benefit — they have the richest open history for the model to use.',
              },
            ],
          },
          {
            id: 'randomizationUnit',
            label: 'What should the randomization unit be?',
            type: 'single_select',
            conceptLinks: ['randomization-unit'],
            options: [
              {
                id: 'ru-a',
                label: 'User (each user consistently receives either fixed or personalized timing)',
                scoreValue: 2,
                rationale: 'Correct. The treatment is a user-specific experience — personalized timing is based on each user\'s history. A consistent assignment ensures the ML model\'s benefit is measured cleanly across each user\'s full notification sequence.',
              },
              {
                id: 'ru-b',
                label: 'Notification (each notification independently assigned to fixed or personalized timing)',
                scoreValue: 0,
                rationale: 'Notification-level randomization means the same user sometimes gets personalized, sometimes fixed timing. This creates within-user contamination and makes it impossible to measure habit formation or cumulative opt-out behavior correctly.',
              },
              {
                id: 'ru-c',
                label: 'Day (each day uses either fixed or personalized timing for all users)',
                scoreValue: 0,
                rationale: 'Day-level randomization is a switchback design — valid for some contexts but complex to analyze correctly. For this test, user-level is cleaner and sufficient. Day-level would also confound with day-of-week effects.',
              },
            ],
          },
          {
            id: 'unitOfAnalysis',
            label: 'What is the unit of analysis?',
            type: 'single_select',
            conceptLinks: ['unit-of-analysis'],
            options: [
              {
                id: 'ua-a',
                label: 'User — compute open rate as notifications opened / notifications received per user, then aggregate',
                scoreValue: 2,
                rationale: 'Correct. User-level analysis matches user-level randomization. Aggregating open rate at the user level first, then comparing arms, avoids treating each notification as independent when notifications from the same user are correlated.',
              },
              {
                id: 'ua-b',
                label: 'Notification — compute open rate as total opened / total sent across all users',
                scoreValue: 0,
                rationale: 'This treats each notification as independent, but notifications from the same user are highly correlated (a user who opens morning notifications almost always will, regardless of treatment). This inflates power artificially and produces overconfident p-values.',
              },
            ],
          },
        ],
      },
      {
        id: 'metrics',
        label: 'Metrics',
        hint: 'What measures genuine re-engagement — not just a momentary open?',
        fields: [
          {
            id: 'primaryMetric',
            label: 'What is the primary metric for this experiment?',
            type: 'single_select',
            conceptLinks: ['primary-metric', 'proxy-metric'],
            options: [
              {
                id: 'pm-a',
                label: 'Notification open rate (notifications opened / notifications sent)',
                scoreValue: 0,
                rationale: 'The training signal, not the outcome. Open rate measures whether the timing model achieved its ML objective — not whether users got value from the notification or stayed in the app longer. A user who opens a notification and immediately closes the app is counted as a win.',
              },
              {
                id: 'pm-b',
                label: '7-day active session rate (users with ≥1 active session per day over the following week, per arm)',
                scoreValue: 2,
                rationale: 'Strong. This measures whether notifications are driving real re-engagement that persists. A timing model that improves opens without improving sessions isn\'t creating value — it\'s just catching users at moments of idle phone-checking.',
              },
              {
                id: 'pm-c',
                label: 'Task completion rate per notification (user completes a task within 10 minutes of opening notification)',
                scoreValue: 2,
                rationale: 'Also strong. This measures whether notifications are driving the app\'s core value. If personalized timing gets users to actually use the app (not just open it), this metric captures that better than open rate or session count.',
              },
              {
                id: 'pm-d',
                label: 'Click-to-session rate (users who open notification and start a session within 60 seconds)',
                scoreValue: 1,
                rationale: 'Better than raw open rate — it ties the notification to a session. But it doesn\'t measure session quality or whether the user accomplished anything. Task completion or weekly session rate is more meaningful.',
              },
            ],
          },
          {
            id: 'guardrailMetrics',
            label: 'Which metrics should be pre-committed guardrails? (Select all)',
            type: 'multi_select',
            conceptLinks: ['guardrail-metric'],
            options: [
              {
                id: 'gm-a',
                label: 'Notification opt-out rate',
                scoreValue: 2,
                rationale: 'Critical. If personalized timing sends at intrusive moments, opt-outs will rise. Opt-out is irreversible — once a user turns off notifications, re-engagement through this channel is lost. Pre-commit a maximum tolerable opt-out increase before the test.',
              },
              {
                id: 'gm-b',
                label: '14-day uninstall rate',
                scoreValue: 2,
                rationale: 'Essential. Notifications that feel spammy or disruptive drive uninstalls. A timing model that improves engagement in week 1 but increases uninstalls in week 2 is a net loss. The 14-day window is important to see delayed churn.',
              },
              {
                id: 'gm-c',
                label: 'Notification mute rate (user silences app notifications without opting out)',
                scoreValue: 1,
                rationale: 'Useful leading indicator of notification fatigue. Muting is a softer signal than opt-out but still indicates user dissatisfaction with the notification experience.',
              },
              {
                id: 'gm-d',
                label: 'App store rating',
                scoreValue: 0,
                rationale: 'Too noisy and too lagging for a 14–21 day experiment. App store rating is affected by many factors unrelated to notification timing. The signal would not be attributable to this change within the test window.',
              },
            ],
          },
          {
            id: 'diagnosticMetrics',
            label: 'Which metrics are diagnostics only?',
            type: 'multi_select',
            conceptLinks: [],
            options: [
              {
                id: 'dm-a',
                label: 'Notification open rate (by time of day — does the ML model actually send at better times?)',
                scoreValue: 1,
                rationale: 'Good mechanism check. If the ML model is working, open rates should be higher during the personalized send windows. This verifies the ML model is doing what it was designed to do.',
              },
              {
                id: 'dm-b',
                label: 'Average time between notification receipt and session start',
                scoreValue: 1,
                rationale: 'Useful diagnostic for understanding whether personalized timing creates faster-to-engage sessions — suggesting the notifications are reaching users at receptive moments.',
              },
              {
                id: 'dm-c',
                label: 'User-reported notification satisfaction (post-test survey)',
                scoreValue: 0,
                rationale: 'Surveys during an A/B test are operationally difficult and prone to bias (treated users may rate notifications differently simply because they\'re being asked). Don\'t include as a primary diagnostic.',
              },
            ],
          },
        ],
      },
      {
        id: 'logistics',
        label: 'Logistics',
        hint: 'How long to run, and what are the power concerns for rare harm events?',
        fields: [
          {
            id: 'runtime',
            label: 'How long should this experiment run?',
            type: 'single_select',
            conceptLinks: ['novelty-effect'],
            options: [
              {
                id: 'rt-a',
                label: '7 days',
                scoreValue: 0,
                rationale: 'Too short. Opt-out and uninstall rates accumulate over time — 7 days may not reveal delayed churn driven by notification fatigue. Weekly session rate also requires at least 7 days of post-notification observation per user.',
              },
              {
                id: 'rt-b',
                label: '14 days',
                scoreValue: 1,
                rationale: 'Acceptable. 14 days is enough to observe two full week cycles, initial opt-out behavior, and some uninstall signal. But 21 days gives better stability for the rare-event guardrails.',
              },
              {
                id: 'rt-c',
                label: '21 days',
                scoreValue: 2,
                rationale: 'Best. Three weeks of data gives a stable view of opt-out and uninstall behavior, which may lag the notification experience by several days. It also captures any novelty-driven engagement spike in the first week vs. stabilized behavior in week 3.',
              },
              {
                id: 'rt-d',
                label: 'Run until the primary metric is significant, then stop',
                scoreValue: 0,
                rationale: 'Peeking problem. Stopping when the session metric looks good will miss delayed opt-out and uninstall accumulation, which are the most important harm signals for this experiment.',
              },
            ],
          },
          {
            id: 'sampleSizeConcern',
            label: 'What is the main power concern for this experiment?',
            type: 'single_select',
            conceptLinks: ['power', 'mde'],
            options: [
              {
                id: 'ss-a',
                label: 'None — 620,000 users is more than enough for any metric',
                scoreValue: 0,
                rationale: 'Overconfident on the harm metrics. Uninstall rate is a rare event (maybe 0.5–2% in any 21-day window). At this rate, the MDE for detecting a meaningful uninstall increase (e.g., 20% relative increase in 1% base = 0.2pp absolute) may require verification. Run the MDE calculation for uninstalls specifically.',
              },
              {
                id: 'ss-b',
                label: 'Primary metric is well-powered, but uninstall rate is a rare event with low base rate — verify MDE for this guardrail specifically',
                scoreValue: 2,
                rationale: 'Correct. Uninstall rates are rare events. The absolute base rate determines how much power you have to detect a meaningful increase. Check the MDE for uninstall rate before treating it as a reliable blocking guardrail.',
              },
              {
                id: 'ss-c',
                label: 'The experiment needs more users — engagement metrics require very large samples',
                scoreValue: 0,
                rationale: 'Incorrect. 620,000 users is more than adequate for session-level engagement metrics. The concern is for rare harm events, not the primary metric.',
              },
            ],
          },
        ],
      },
      {
        id: 'risks',
        label: 'Risks & Decision Rule',
        hint: 'What could invalidate this, and when do you hold?',
        fields: [
          {
            id: 'trustChecks',
            label: 'Which trust checks should you run before reading results? (Select all)',
            type: 'multi_select',
            conceptLinks: ['srm'],
            options: [
              {
                id: 'tc-a',
                label: 'SRM check on user assignment counts',
                scoreValue: 2,
                rationale: 'Always first. Notification systems with per-user opt-in state have subtle SRM failure modes (e.g., users who opt out before receiving any notification in treatment may be logged differently).',
              },
              {
                id: 'tc-b',
                label: 'Verify notification volume equivalence between arms (same number of notifications per user per day)',
                scoreValue: 2,
                rationale: 'Critical. If the ML model sends a different number of notifications in addition to changing timing, the open rate and engagement changes are confounded by volume. The test should isolate timing only.',
              },
              {
                id: 'tc-c',
                label: 'Check pre-experiment session rates are comparable between arms',
                scoreValue: 1,
                rationale: 'Good baseline check. If treatment and control had different session rates before treatment started, something went wrong with the assignment.',
              },
            ],
          },
          {
            id: 'validityRisks',
            label: 'What are the main validity risks? (Select all)',
            type: 'multi_select',
            conceptLinks: ['novelty-effect'],
            options: [
              {
                id: 'vr-a',
                label: 'Novelty effect — users may be more attentive to notifications from an app that suddenly "knows" their preferred time',
                scoreValue: 1,
                rationale: 'Moderate risk. Personalized timing may initially feel more relevant, driving engagement that decays as it becomes normalized. Week-over-week monitoring can detect this.',
              },
              {
                id: 'vr-b',
                label: 'Delayed harm accumulation — opt-out and uninstall rates may not peak within the 21-day window',
                scoreValue: 2,
                rationale: 'High risk. Notification fatigue-driven churn often has a delayed fuse — users tolerate increasing intrusiveness for a few weeks before breaking point. A 21-day window may still underestimate cumulative harm. Flag this limitation in the analysis.',
              },
              {
                id: 'vr-c',
                label: 'Segment heterogeneity — users in different time zones or with different usage patterns may respond very differently to the ML model',
                scoreValue: 1,
                rationale: 'Real concern. A global ML timing model may optimize for the average user while harming specific segments (e.g., early morning users who the model misclassifies). Pre-specify a segment check by time zone and activity pattern.',
              },
            ],
          },
          {
            id: 'decisionRule',
            label: 'What is the pre-committed decision rule?',
            type: 'single_select',
            conceptLinks: ['p-value', 'guardrail-metric'],
            options: [
              {
                id: 'dr-a',
                label: 'Ship if open rate is significantly positive.',
                scoreValue: 0,
                rationale: 'The exact trap in the paired Review scenario. Open rate is the proxy. This rule allows shipping a model that harms retention and drives opt-outs, as long as the notifications were opened more often.',
              },
              {
                id: 'dr-b',
                label: 'Ship if the primary metric (7-day session rate or task completion) is significantly positive AND opt-out rate does not increase significantly AND uninstall rate does not increase significantly. Hold if either guardrail breaches.',
                scoreValue: 2,
                rationale: 'Correct. This rule uses a quality outcome as the decision trigger, treats harm guardrails as blocking, and avoids open rate as the determining factor. This is the design that the paired Review scenario lacked.',
              },
              {
                id: 'dr-c',
                label: 'Ship if open rate improves and no guardrail increases by more than 10%.',
                scoreValue: 0,
                rationale: '"10% relative" is too weak as a guardrail threshold and the primary metric is still open rate. If base opt-out rate is 2%, a 10% relative increase = 2.2% — but whether 0.2pp is meaningful depends on the base rate and business tolerance. Pre-commit the threshold in absolute terms.',
              },
              {
                id: 'dr-d',
                label: 'Ship if open rate and at least one retention metric improve. Review opt-out trend post-launch.',
                scoreValue: 1,
                rationale: '"Review post-launch" makes the opt-out guardrail advisory, not blocking. In a consumer app where opt-outs are irreversible, advisory guardrails are insufficient. Pre-commit to a blocking threshold before the test.',
              },
            ],
          },
        ],
      },
    ],

    scoringRubric: {
      dimensions: [
        { id: 'metric_selection', label: 'Metric selection', weight: 0.35, fieldIds: ['primaryMetric', 'guardrailMetrics'] },
        { id: 'design_validity', label: 'Design validity', weight: 0.30, fieldIds: ['randomizationUnit', 'unitOfAnalysis', 'trustChecks', 'validityRisks'] },
        { id: 'decision_discipline', label: 'Decision discipline', weight: 0.20, fieldIds: ['decisionRule', 'sampleSizeConcern'] },
        { id: 'hypothesis_framing', label: 'Hypothesis framing', weight: 0.15, fieldIds: ['hypothesis', 'businessDecision'] },
      ],
      levels: {
        incomplete:    { minScore: 0,    label: 'Incomplete' },
        analyst_ready: { minScore: 0.45, label: 'Analyst-Ready' },
        senior_ready:  { minScore: 0.68, label: 'Senior-Ready' },
        staff_level:   { minScore: 0.85, label: 'Staff-Level' },
      },
    },

    seniorDesign: {
      rationale: 'The notification timing test is a proxy metric trap dressed up as an engagement experiment. The ML model was trained to maximize open rate. Using open rate as the primary metric is circular — it validates the training signal, not the user outcome.\n\nThe business question is: does personalized timing increase genuine re-engagement? That means sessions, task completions, or weekly activity — not a tap on a notification. A user who opens a notification while commuting and immediately closes the app has been "engaged" by the open rate metric and not engaged at all by any meaningful definition.\n\nOpt-out and uninstall are the most important harm signals. They are irreversible. A timing model that improves engagement for 5% of users while driving 2% more opt-outs is a net negative — you\'ve permanently lost the notification channel for a meaningful portion of your user base. These must be blocking guardrails, not observations to review post-launch.\n\nThe delayed harm accumulation risk is underappreciated. Notification fatigue builds slowly. A 21-day test may still underestimate long-term opt-out effects. Flag this limitation explicitly in the analysis.',
      commonMistakes: [
        {
          mistake: 'Using notification open rate as the primary metric for a model trained on open rate',
          consequence: 'The test validates the ML training objective, not user engagement. A model that learns to send at moments of idle phone-checking will look like a massive win on opens with no improvement in sessions or task completions.',
          conceptLink: 'proxy-metric',
        },
        {
          mistake: 'Treating opt-out as an advisory metric rather than a blocking guardrail',
          consequence: 'Opt-outs are irreversible. If the timing model ships and opt-outs rise, you\'ve permanently degraded the notification channel for those users. Post-launch monitoring doesn\'t undo this.',
          conceptLink: 'guardrail-metric',
        },
        {
          mistake: 'Not verifying notification volume equivalence between arms',
          consequence: 'If the ML system sends a different count of notifications per user (not just at different times), the test measures volume + timing vs. fixed timing, not timing alone. The mechanism is confounded.',
          conceptLink: 'srm',
        },
      ],
      failureMode: {
        weakAnswer: 'The candidate uses notification open rate as the primary metric "because that\'s the engagement signal the team cares about," runs 14 days, reads a +19% open rate lift, and recommends shipping. Opt-out rate is noted as a metric to watch post-launch but is not a blocking guardrail. They never distinguish between opens that lead to sessions and opens that lead to app closes.',
        interviewerFollowUp: '"Open rate is up 19% and you\'re recommending ship. If the ML model learned to send notifications at moments of idle phone-checking — when users tap to dismiss rather than engage — how would your experiment tell the difference between an open that drives a session and an open that drives an immediate app close?"',
      },
    },

    pairedScenarioPrompt: {
      toReview: 'You designed this experiment. Now see what happened when Orion ran it — with open rate as the success metric.',
      fromReview: 'You read the push open rate result. Go back and redesign this test to catch the proxy metric trap before the data arrives.',
    },
  },

  // ─────────────────────────────────────────────
  // D07 — Design the Seller Incentive Test (BETA · Senior)
  // Paired with: s11-seller-speed-spillover
  // Core trap: seller-level A/B in a two-sided marketplace creates SUTVA violation
  // ─────────────────────────────────────────────
  {
    id: 'd07-seller-incentive-test',
    title: 'Design the Seller Incentive Test',
    subtitle: 'Crafted wants to incentivize faster seller response times. Design the experiment — including whether a standard A/B is even valid here.',
    isFree: false,
    difficulty: 'senior',
    industry: 'marketplace',
    scenarioFamily: 'sutva',
    pairedReviewScenarioId: 's11-seller-speed-spillover',

    context: {
      company: 'Crafted',
      product: 'Two-sided handmade goods marketplace — ~40,000 active sellers, ~850,000 monthly buyers',
      team: 'Seller Success team',
      background: 'Crafted\'s data shows that buyers who receive a seller response within 2 hours are 31% more likely to complete a purchase than those who wait longer. A new proposal: introduce a "Fast Responder" badge and algorithmic search boost for sellers who maintain a <2h median response time. Sellers who qualify will be visibly highlighted to buyers.',
      featureProposal: 'Launch the Fast Responder incentive program. Hypothesis: incentivizing faster responses will increase platform-wide buyer-to-purchase conversion by reducing drop-off during the consideration phase.',
      businessPressure: 'The Head of Marketplace wants to show a GMV lift before the end of the quarter. The Seller Success team has been building this for 2 months. The PM wants a 14-day A/B test to "validate it quickly."',
      constraints: [
        '~40,000 active sellers eligible for the test',
        'Buyers interact with multiple sellers per purchase consideration',
        'Seller response time and buyer inquiry data are logged in real time',
        'Engineering recommends seller-level randomization as the simplest implementation',
        '30-day observation window preferred for conversion metrics',
      ],
    },

    designPhases: [
      {
        id: 'framing',
        label: 'Framing',
        hint: 'What is this experiment actually measuring — seller behavior or platform health?',
        fields: [
          {
            id: 'businessDecision',
            label: 'What business decision does this experiment inform?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'bd-a',
                label: 'Whether to launch the Fast Responder incentive program platform-wide',
                scoreValue: 2,
                rationale: 'Correct scope. The decision is whether this specific program (badge + algorithmic boost) should be deployed to all eligible sellers.',
              },
              {
                id: 'bd-b',
                label: 'Whether faster seller response times improve buyer conversion',
                scoreValue: 1,
                rationale: 'This is the underlying causal question, but it was already answered observationally (31% correlation). The experiment\'s job is to test whether the incentive program causally improves conversion at the platform level — including potential interference effects.',
              },
              {
                id: 'bd-c',
                label: 'Whether sellers will respond to badge incentives at all',
                scoreValue: 0,
                rationale: 'Too narrow. Whether sellers respond to the badge is a mechanism check, not the business decision. The decision is about platform-level GMV, not seller behavior in isolation.',
              },
            ],
          },
          {
            id: 'hypothesis',
            label: 'Select the strongest hypothesis formulation',
            type: 'single_select',
            conceptLinks: ['sutva'],
            options: [
              {
                id: 'hyp-a',
                label: 'Sellers receiving the Fast Responder incentive will respond to buyers faster, and their conversion rate will improve.',
                scoreValue: 0,
                rationale: 'Measures treatment seller behavior in isolation. This ignores platform-level dynamics — treatment sellers responding faster may absorb buyer demand away from control sellers. A valid hypothesis must account for spillover.',
              },
              {
                id: 'hyp-b',
                label: 'The Fast Responder program will improve platform-level buyer-to-purchase conversion by reducing response latency in the buyer consideration phase, without displacing demand from non-participating sellers.',
                scoreValue: 2,
                rationale: 'Strong. This includes the spillover constraint explicitly. A program that improves treatment seller conversion by diverting buyers from control sellers is not a platform-level improvement — and this hypothesis pre-commits to measuring both sides.',
              },
              {
                id: 'hyp-c',
                label: 'The badge incentive will improve seller response speed by 40% and reduce buyer inquiry abandonment.',
                scoreValue: 0,
                rationale: 'Mechanism-level hypothesis — it tests whether the badge changes seller behavior, not whether that change improves platform outcomes. The 40% target is arbitrary and not connected to the business decision.',
              },
            ],
          },
        ],
      },
      {
        id: 'setup',
        label: 'Setup',
        hint: 'Seller-level A/B sounds simple — but is it valid in a two-sided marketplace?',
        fields: [
          {
            id: 'eligiblePopulation',
            label: 'Who should be in the experiment?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'ep-a',
                label: 'All active sellers with at least 5 completed transactions in the past 90 days',
                scoreValue: 2,
                rationale: 'Appropriate eligibility threshold. Sellers with transaction history have behavioral baselines for response time measurement. Very new sellers may not yet have stable response patterns.',
              },
              {
                id: 'ep-b',
                label: 'All active sellers regardless of transaction history',
                scoreValue: 0,
                rationale: 'Including sellers with no transaction history means you\'re measuring the badge effect on sellers who have no established buyer relationships. The treatment mechanism (badge improves response speed → improves conversion) can\'t operate on sellers with no inquiries.',
              },
              {
                id: 'ep-c',
                label: 'Only sellers currently responding within 4 hours — those closest to the 2h threshold',
                scoreValue: 0,
                rationale: 'Too narrow. The program should be tested on the full eligible population. Restricting to "close to threshold" sellers produces a result that doesn\'t generalize to sellers who currently respond in 12–24 hours.',
              },
            ],
          },
          {
            id: 'randomizationUnit',
            label: 'What randomization unit do you recommend, and why?',
            type: 'single_select',
            conceptLinks: ['randomization-unit', 'sutva'],
            options: [
              {
                id: 'ru-a',
                label: 'Seller-level — treatment sellers get the badge and boost, control sellers don\'t',
                scoreValue: 1,
                rationale: 'Feasible and simple — but structurally flawed for a two-sided marketplace. Buyers interact with both treatment and control sellers simultaneously. A buyer who is "won" by a faster treatment seller might have purchased from a control seller otherwise. This creates demand displacement, not additive platform GMV.',
              },
              {
                id: 'ru-b',
                label: 'Geographic market (city/region) — entire markets get the full program or serve as holdout',
                scoreValue: 2,
                rationale: 'Correct for this type of experiment. Geographic isolation ensures that treatment and control markets have independent supply and demand. Treatment market sellers and buyers interact only with each other. This prevents the demand displacement problem inherent in seller-level A/B. The downside: fewer independent units and reduced power. But it\'s the only design that can measure platform-level effects cleanly.',
              },
              {
                id: 'ru-c',
                label: 'Buyer-level — buyers see either Fast Responder badges or no badges',
                scoreValue: 0,
                rationale: 'Misaligned with the treatment. The incentive changes seller behavior, not buyer perception. If sellers in the badge program respond faster regardless of whether the buyer can see the badge, buyer-level randomization doesn\'t isolate the incentive effect.',
              },
              {
                id: 'ru-d',
                label: 'Category-level — certain product categories get the program, others serve as control',
                scoreValue: 1,
                rationale: 'Better than seller-level — at least buyers searching in one category can\'t easily substitute to the other. But category-level randomization still has cross-contamination if buyers browse multiple categories. Geographic is cleaner.',
              },
            ],
          },
          {
            id: 'unitOfAnalysis',
            label: 'What is the right unit of analysis for platform-level metrics?',
            type: 'single_select',
            conceptLinks: ['unit-of-analysis'],
            options: [
              {
                id: 'ua-a',
                label: 'Buyer — compute conversion rate as buyers who purchased / buyers who submitted at least one inquiry',
                scoreValue: 2,
                rationale: 'Correct. The business outcome is buyer conversion. Measuring at the buyer level captures whether buyers who entered the consideration phase were more likely to complete a purchase — which is the platform-level effect you care about.',
              },
              {
                id: 'ua-b',
                label: 'Transaction — compute conversion rate as completed transactions / total inquiries',
                scoreValue: 1,
                rationale: 'Close, but treats each inquiry as independent when buyers submit multiple inquiries. A buyer who sends 5 inquiries and converts on 2 is a different kind of "success" than one who sends 1 and converts. User-level is cleaner.',
              },
              {
                id: 'ua-c',
                label: 'Seller — compute conversion rate as treatment seller conversions vs. control seller conversions',
                scoreValue: 0,
                rationale: 'Seller-level analysis measures treatment seller performance, not platform health. In the presence of demand displacement, treatment sellers look better specifically because they took demand from control sellers — not because total platform conversion improved.',
              },
            ],
          },
        ],
      },
      {
        id: 'metrics',
        label: 'Metrics',
        hint: 'What measures platform-level value — not just treatment seller success?',
        fields: [
          {
            id: 'primaryMetric',
            label: 'What is the primary metric?',
            type: 'single_select',
            conceptLinks: ['primary-metric'],
            options: [
              {
                id: 'pm-a',
                label: 'Treatment seller response time (median hours from inquiry to first response)',
                scoreValue: 0,
                rationale: 'This is the mechanism metric, not the business outcome. Response time is what the incentive is supposed to change, not the reason you care. Improving response time is only valuable if it improves conversion. This metric answers "did the badge work?" not "should we ship this?"',
              },
              {
                id: 'pm-b',
                label: 'Platform-level buyer-to-purchase conversion rate (buyers who purchased / buyers who submitted at least one inquiry)',
                scoreValue: 2,
                rationale: 'Correct. This measures the real outcome: did more buyers complete purchases? At the platform level (with geographic holdout design), this is the metric that distinguishes "treatment sellers win more" from "total platform GMV increases."',
              },
              {
                id: 'pm-c',
                label: 'Treatment seller GMV (total revenue from treatment sellers)',
                scoreValue: 0,
                rationale: 'Measuring only treatment seller GMV in a seller-level A/B will show a win even if the platform is flat — it just means treatment sellers took GMV from control sellers. This metric is only valid with geographic holdout design.',
              },
            ],
          },
          {
            id: 'guardrailMetrics',
            label: 'Which guardrails should be pre-committed? (Select all)',
            type: 'multi_select',
            conceptLinks: ['guardrail-metric'],
            options: [
              {
                id: 'gm-a',
                label: 'Control seller conversion rate (should not decline significantly)',
                scoreValue: 2,
                rationale: 'Critical in seller-level A/B design. If control seller conversion falls while treatment sellers rise, it\'s a zero-sum reallocation. Platform GMV hasn\'t improved — demand has just shifted. This guardrail reveals the interference effect.',
              },
              {
                id: 'gm-b',
                label: 'Order cancellation rate',
                scoreValue: 1,
                rationale: 'Good quality guardrail. Sellers gaming response time (sending auto-responses immediately, then taking longer to fulfill) may increase cancellations. Fast response should not come at the cost of order quality.',
              },
              {
                id: 'gm-c',
                label: 'Seller quality score (post-transaction buyer ratings)',
                scoreValue: 1,
                rationale: 'Useful downstream guardrail. If the badge incentivizes speed at the cost of quality — sellers rushing to respond without properly evaluating orders — quality ratings may decline.',
              },
              {
                id: 'gm-d',
                label: 'New seller sign-up rate',
                scoreValue: 0,
                rationale: 'Not a relevant guardrail for a response time incentive. New seller acquisition is driven by marketing and seller economics, not response time badge programs. Too distal to be causally linked to this treatment.',
              },
            ],
          },
          {
            id: 'diagnosticMetrics',
            label: 'What diagnostic metrics should you track?',
            type: 'multi_select',
            conceptLinks: [],
            options: [
              {
                id: 'dm-a',
                label: 'Seller response time distribution (treatment vs. control) — mechanism check',
                scoreValue: 2,
                rationale: 'Essential mechanism check. If treatment sellers are not responding faster, the incentive didn\'t work and any outcome differences have alternative explanations.',
              },
              {
                id: 'dm-b',
                label: 'Buyer inquiry volume per seller (are buyers preferentially contacting faster responders?)',
                scoreValue: 1,
                rationale: 'Useful for understanding the demand displacement mechanism. If treatment sellers receive more inquiries (buyers use the badge to filter), that\'s the channel through which displacement operates.',
              },
              {
                id: 'dm-c',
                label: '30-day seller retention (do incentivized sellers continue to maintain fast response after the experiment ends?)',
                scoreValue: 0,
                rationale: 'Important long-run question, but not measureable within the test window. Flag as a post-launch monitoring metric rather than a within-experiment diagnostic.',
              },
            ],
          },
        ],
      },
      {
        id: 'logistics',
        label: 'Logistics',
        hint: 'Marketplace dynamics take time to stabilize — what is the right window?',
        fields: [
          {
            id: 'runtime',
            label: 'How long should this experiment run?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'rt-a',
                label: '14 days',
                scoreValue: 0,
                rationale: 'Too short for a marketplace incentive. Sellers need time to adapt their behavior to the badge criteria, buyers need time to discover and respond to the badges, and marketplace dynamics (supply reallocation) need time to reach a new equilibrium. 14 days measures early response, not steady state.',
              },
              {
                id: 'rt-b',
                label: '21 days',
                scoreValue: 1,
                rationale: 'Better than 14 days, but still short for marketplace dynamics. The 30-day attribution window for conversion metrics can\'t be fully observed within 21 days.',
              },
              {
                id: 'rt-c',
                label: '30–42 days (4–6 weeks)',
                scoreValue: 2,
                rationale: 'Correct for a marketplace test. The 30-day attribution window requires at least 30 days to observe. Marketplace dynamics (seller behavior change, buyer discovery of badges) need 4+ weeks to reach equilibrium. A 6-week runtime is the minimum for credible causal inference here.',
              },
              {
                id: 'rt-d',
                label: 'Run for 7 days and extrapolate to 30-day conversion using existing funnel rates',
                scoreValue: 0,
                rationale: 'Extrapolation from early funnel data is not valid for a test with delayed conversion effects and marketplace dynamics. The 30-day window must be observed, not estimated.',
              },
            ],
          },
          {
            id: 'sampleSizeConcern',
            label: 'What is the main power concern for this experiment?',
            type: 'single_select',
            conceptLinks: ['power', 'mde'],
            options: [
              {
                id: 'ss-a',
                label: '40,000 sellers is plenty — power is not a concern',
                scoreValue: 0,
                rationale: 'Wrong. With geographic holdout design, the randomization unit is the market/region, not the seller. The number of independent geographic markets may be far smaller than 40,000. Each market becomes one "observation." Power depends on the number of markets, not sellers.',
              },
              {
                id: 'ss-b',
                label: 'With geographic holdout design, power depends on the number of independent markets, not seller count — may need to limit the holdout region carefully',
                scoreValue: 2,
                rationale: 'Correct. Geographic holdout designs are power-constrained by the number of comparable market units. If Crafted operates in 30 cities, you may only have 15–15 treatment-control pairs. Power analysis must be done at the market level, and the MDE may be larger than you\'d like.',
              },
              {
                id: 'ss-c',
                label: 'Power is constrained by buyer inquiry volume, not seller count',
                scoreValue: 1,
                rationale: 'Partially right — buyer inquiry volume within each geographic market is relevant. But the key insight is that the randomization unit is the market, so market-level power analysis is what matters.',
              },
            ],
          },
        ],
      },
      {
        id: 'risks',
        label: 'Risks & Decision Rule',
        hint: 'SUTVA is the core risk here — how do you flag it and what is the decision rule?',
        fields: [
          {
            id: 'trustChecks',
            label: 'Which trust checks should you run? (Select all)',
            type: 'multi_select',
            conceptLinks: ['srm'],
            options: [
              {
                id: 'tc-a',
                label: 'SRM check on seller assignment counts per market',
                scoreValue: 2,
                rationale: 'Standard first check. Verify treatment and control markets have comparable seller counts after assignment.',
              },
              {
                id: 'tc-b',
                label: 'Verify buyer inquiry volume is balanced between treatment and control markets before test start',
                scoreValue: 2,
                rationale: 'Critical for geographic holdout. If treatment markets have significantly higher pre-experiment inquiry volume, post-experiment conversion differences may reflect market characteristics, not the treatment.',
              },
              {
                id: 'tc-c',
                label: 'Check that pre-experiment seller response times are comparable between treatment and control markets',
                scoreValue: 1,
                rationale: 'Important baseline check. If treatment markets started with faster-responding sellers, the post-test improvement in response time is smaller than it appears.',
              },
              {
                id: 'tc-d',
                label: 'Monitor for "badge gaming" — sellers setting auto-responses to meet the <2h threshold artificially',
                scoreValue: 1,
                rationale: 'Real risk. Fast initial responses that don\'t actually engage the buyer will inflate the mechanism metric (response time) without improving the outcome (conversion). Monitor response quality, not just speed.',
              },
            ],
          },
          {
            id: 'validityRisks',
            label: 'What are the main validity risks? (Select all)',
            type: 'multi_select',
            conceptLinks: ['sutva'],
            options: [
              {
                id: 'vr-a',
                label: 'SUTVA violation in seller-level A/B — treatment sellers absorb demand from control sellers through shared buyer pool',
                scoreValue: 2,
                rationale: 'The central risk. In any seller-level A/B test in a marketplace, buyers contact both treatment and control sellers. Treatment sellers winning more conversions may simply be taking demand from control sellers rather than adding platform GMV. Geographic holdout is the mitigation.',
              },
              {
                id: 'vr-b',
                label: 'Seller gaming — sellers send auto-responses to qualify for badge without improving genuine service quality',
                scoreValue: 2,
                rationale: 'Real behavioral risk. Incentive programs in marketplaces frequently surface gaming behaviors. Auto-responses that game the response time metric without actually helping buyers will inflate the mechanism metric without improving outcomes.',
              },
              {
                id: 'vr-c',
                label: 'Novelty effect — buyers initially prefer Fast Responder sellers out of curiosity, not because of genuine quality',
                scoreValue: 1,
                rationale: 'Moderate risk. Buyers may click on Fast Responder badges out of curiosity in the first week. This would inflate early conversion rates for treatment sellers and inflate the apparent treatment effect.',
              },
            ],
          },
          {
            id: 'decisionRule',
            label: 'What is the pre-committed decision rule?',
            type: 'single_select',
            conceptLinks: ['p-value', 'guardrail-metric', 'sutva'],
            options: [
              {
                id: 'dr-a',
                label: 'Ship if treatment seller conversion rate improves significantly.',
                scoreValue: 0,
                rationale: 'This is the exact trap in the paired Review scenario. Treatment seller conversion improving while control seller conversion falls is not a platform win — it\'s demand displacement. This rule ignores the interference effect entirely.',
              },
              {
                id: 'dr-b',
                label: 'Ship if platform-level buyer conversion improves significantly in treatment markets AND control seller conversion rate does not decline significantly. Hold if evidence of demand displacement exists (treatment lifts while control declines).',
                scoreValue: 2,
                rationale: 'Correct. This rule pre-commits to measuring platform health (not just treatment seller health), explicitly tests for displacement via the control seller guardrail, and blocks the ship decision if interference is detected. This is the design that makes the experiment interpretable.',
              },
              {
                id: 'dr-c',
                label: 'Ship if treatment sellers show faster response times AND higher GMV.',
                scoreValue: 0,
                rationale: 'Both metrics are treatment-seller-level. GMV from treatment sellers can increase entirely through demand displacement from control sellers. This rule cannot distinguish additive platform growth from zero-sum reallocation.',
              },
            ],
          },
        ],
      },
    ],

    scoringRubric: {
      dimensions: [
        { id: 'metric_selection', label: 'Metric selection', weight: 0.30, fieldIds: ['primaryMetric', 'guardrailMetrics'] },
        { id: 'design_validity', label: 'Design validity', weight: 0.40, fieldIds: ['randomizationUnit', 'unitOfAnalysis', 'trustChecks', 'validityRisks'] },
        { id: 'decision_discipline', label: 'Decision discipline', weight: 0.20, fieldIds: ['decisionRule', 'sampleSizeConcern'] },
        { id: 'hypothesis_framing', label: 'Hypothesis framing', weight: 0.10, fieldIds: ['hypothesis', 'businessDecision'] },
      ],
      levels: {
        incomplete:    { minScore: 0,    label: 'Incomplete' },
        analyst_ready: { minScore: 0.45, label: 'Analyst-Ready' },
        senior_ready:  { minScore: 0.68, label: 'Senior-Ready' },
        staff_level:   { minScore: 0.85, label: 'Staff-Level' },
      },
    },

    seniorDesign: {
      rationale: 'This scenario is explicitly about recognizing that standard A/B testing is structurally invalid in certain marketplace contexts. The proposed seller-level A/B test has a SUTVA problem that cannot be fixed by adjusting the analysis — it requires a different design.\n\nThe interference mechanism is specific: buyers contact multiple sellers simultaneously. A buyer who is "won" by a treatment seller (fast response, badge, algorithmic boost) is potentially a buyer who would have purchased from a control seller in the counterfactual. Treatment seller conversion increases through reallocation, not through additive platform GMV.\n\nThe only design that can measure a platform-level effect is geographic holdout: entire markets get the full program or serve as holdout. Within each market, supply and demand are isolated together, so there is no cross-contamination.\n\nThe tradeoff is power: the number of independent geographic markets may be small, making the MDE relatively large. This is a design constraint you must acknowledge, not a reason to fall back to seller-level A/B.\n\nThe decision rule must explicitly check for demand displacement: if treatment markets lift while control markets decline, the program is redistributing GMV, not creating it. Block the ship decision on this evidence.',
      commonMistakes: [
        {
          mistake: 'Running seller-level A/B without acknowledging marketplace interference',
          consequence: 'Treatment sellers appear to win more conversions. The team ships the program. Platform-level GMV is flat because treatment sellers absorbed demand from sellers outside the program. The "lift" was always a reallocation artifact.',
          conceptLink: 'sutva',
        },
        {
          mistake: 'Using treatment seller GMV as the primary metric',
          consequence: 'Treatment seller GMV increases even in a zero-sum reallocation scenario. This metric cannot distinguish additive growth from displacement. Platform-level or control-seller metrics are required.',
          conceptLink: 'primary-metric',
        },
        {
          mistake: 'Running only 14 days and extrapolating to 30-day conversion',
          consequence: 'Marketplace behavior (seller adaptation, buyer discovery, algorithmic boost propagation) takes weeks to stabilize. Early conversion effects overstate steady-state impact.',
          conceptLink: 'novelty-effect',
        },
      ],
      failureMode: {
        weakAnswer: 'The candidate accepts seller-level randomization as proposed by engineering, runs a 14-day A/B, and reports that treatment sellers show +18% conversion rate — recommending the program be shipped. They never flag the SUTVA violation: buyers interact with both treatment and control sellers simultaneously, so control sellers lose demand to treatment sellers and the measured lift is reallocation, not additive growth.',
        interviewerFollowUp: '"Your treatment sellers show +18% conversion and you\'re recommending ship. But a buyer who messaged a treatment seller (fast responder, badge, boosted in search) instead of a control seller — did you just create new demand, or did you redirect an existing buyer away from a control seller? How does your experiment design distinguish those two outcomes?"',
      },
    },

    pairedScenarioPrompt: {
      toReview: 'You designed this marketplace experiment. Now see what the data showed when Crafted ran a seller-level A/B instead.',
      fromReview: 'You read the spillover result. Go back and design this experiment to correctly handle the marketplace interference problem.',
    },
  },

  // ─────────────────────────────────────────────
  // D08 — Design the Onboarding Checklist Test (BETA · Analyst)
  // Paired with: s12-checklist-completion-illusion
  // Core trap: checklist completion as primary metric; durable activation is the real signal
  // ─────────────────────────────────────────────
  {
    id: 'd08-onboarding-checklist-test',
    title: 'Design the Onboarding Checklist Test',
    subtitle: 'Loopwise wants to add an onboarding checklist for new users. Design the experiment before checklist completion becomes the success metric.',
    isFree: false,
    difficulty: 'analyst',
    industry: 'saas',
    scenarioFamily: 'proxy_metric',
    pairedReviewScenarioId: 's12-checklist-completion-illusion',

    context: {
      company: 'Loopwise',
      product: 'B2B project management SaaS — 14k paying accounts, strong SMB segment',
      team: 'Activation & Onboarding team',
      background: 'Loopwise has low week-1 activation. Only 38% of new users complete 3+ core actions (create project, add task, invite teammate) in their first week. The new proposal: add an in-product onboarding checklist with 7 guided steps. The PM\'s proposed success metric is "checklist completion rate."',
      featureProposal: 'Add a 7-step in-product onboarding checklist to the new user experience. Steps include: creating a project, adding a first task, setting a due date, inviting a teammate, using a template, enabling notifications, and setting personal preferences.',
      businessPressure: 'The Head of Product has this as a Q3 priority. The checklist has been built and the team wants to ship. The PM is framing the test as a "validation" — they expect checklist completion to be a proxy for activation.',
      constraints: [
        '~220 new user accounts per week (B2B SaaS with longer sales cycles)',
        'New users are defined as accounts in their first 7 days',
        'Week-1 activation and 30-day retention are tracked in the data warehouse',
        'Team accounts have multiple users — randomize at the account level to avoid mixed experiences within a team',
      ],
    },

    designPhases: [
      {
        id: 'framing',
        label: 'Framing',
        hint: 'What does the business actually need to know? Is checklist completion the right answer?',
        fields: [
          {
            id: 'businessDecision',
            label: 'What is the business decision this experiment informs?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'bd-a',
                label: 'Whether the onboarding checklist improves meaningful week-1 activation and should be deployed to all new users',
                scoreValue: 2,
                rationale: 'Correct. The decision is whether this checklist produces real activation improvement — not whether users will complete it. "Meaningful activation" is the key qualifier: it means durable product adoption, not checkbox completion.',
              },
              {
                id: 'bd-b',
                label: 'Whether users prefer a checklist-based onboarding over the current unguided experience',
                scoreValue: 0,
                rationale: 'Preference is not the business outcome. Users may prefer checklists (they feel like progress) even if they don\'t lead to better product adoption. Preference metrics are notoriously misleading when disconnected from behavior outcomes.',
              },
              {
                id: 'bd-c',
                label: 'Whether checklist completion rates can reach 60% or above',
                scoreValue: 0,
                rationale: 'This is a product health metric, not a business decision. Checklist completion is the mechanism, not the goal. You could reach 80% checklist completion with 0% improvement in meaningful activation if users rush through low-value steps.',
              },
            ],
          },
          {
            id: 'hypothesis',
            label: 'Select the strongest hypothesis',
            type: 'single_select',
            conceptLinks: ['proxy-metric'],
            options: [
              {
                id: 'hyp-a',
                label: 'The onboarding checklist will improve checklist completion rate and reduce time-to-first-value.',
                scoreValue: 0,
                rationale: 'Checklist completion rate as the primary outcome is the trap. "Time-to-first-value" is better but vague — first value at what? The hypothesis needs to specify what "value" means in terms of durable product usage.',
              },
              {
                id: 'hyp-b',
                label: 'The onboarding checklist will improve week-1 meaningful activation (creating a project, adding a task, and inviting a teammate) and 30-day retention by guiding users to core value faster than the unguided experience.',
                scoreValue: 2,
                rationale: 'Strong. This specifies the activation definition concretely (not just any 3 actions — specifically the ones tied to product stickiness), includes the retention outcome, and explains the mechanism (guidance to core value).',
              },
              {
                id: 'hyp-c',
                label: 'Users who complete the checklist will show higher 30-day retention than users who don\'t.',
                scoreValue: 0,
                rationale: 'This is not a hypothesis for the experiment — it\'s a hypothesis about checklist completers vs. non-completers, which is an observational question. Completers and non-completers self-select, so this comparison is confounded by user quality. The experiment compares users who had access to a checklist vs. those who didn\'t.',
              },
            ],
          },
        ],
      },
      {
        id: 'setup',
        label: 'Setup',
        hint: 'B2B SaaS has team accounts — how does that affect randomization?',
        fields: [
          {
            id: 'eligiblePopulation',
            label: 'Who should be included in this experiment?',
            type: 'single_select',
            conceptLinks: [],
            options: [
              {
                id: 'ep-a',
                label: 'New accounts in their first 7 days — all team members within a new account included',
                scoreValue: 2,
                rationale: 'Correct. The treatment is an account-level onboarding experience. All users within a team should see the same version — you can\'t have some team members see the checklist and others not within the same account.',
              },
              {
                id: 'ep-b',
                label: 'Individual new users within existing accounts who haven\'t been active in 30+ days',
                scoreValue: 0,
                rationale: 'These are dormant existing users, not new users. The onboarding checklist is designed for first-time activation. The treatment mechanism doesn\'t apply to previously inactive users in the same way.',
              },
              {
                id: 'ep-c',
                label: 'Only new accounts with 2+ team members, to ensure the "invite a teammate" step is testable',
                scoreValue: 0,
                rationale: 'Too restrictive. Solo users are a significant B2B SaaS segment. Excluding them produces a result that doesn\'t generalize to all new accounts. "Invite a teammate" can be adapted to solo users or excluded from their checklist.',
              },
            ],
          },
          {
            id: 'randomizationUnit',
            label: 'What should the randomization unit be?',
            type: 'single_select',
            conceptLinks: ['randomization-unit'],
            options: [
              {
                id: 'ru-a',
                label: 'Account (all users in the same account see either checklist or no checklist)',
                scoreValue: 2,
                rationale: 'Correct. In B2B SaaS, team members within an account collaborate and influence each other\'s behavior. If some team members see a checklist and others don\'t, you get contamination within the account. Account-level randomization avoids this.',
              },
              {
                id: 'ru-b',
                label: 'User (each new user independently sees checklist or no checklist)',
                scoreValue: 0,
                rationale: 'User-level randomization in a team product creates contamination. If a team admin sees the checklist and invites teammates who don\'t, the admin\'s behavior is influenced by the checklist while teammates see an inconsistent onboarding experience. This violates independence within the account.',
              },
              {
                id: 'ru-c',
                label: 'Cohort week (all new users in a given week see the same experience)',
                scoreValue: 0,
                rationale: 'Time-based assignment is not a valid A/B design. Users in different weeks may differ systematically (seasonality, marketing channel mix, sales team activity). This is not random assignment — it\'s a pre-post comparison with selection effects.',
              },
            ],
          },
          {
            id: 'unitOfAnalysis',
            label: 'What is the unit of analysis?',
            type: 'single_select',
            conceptLinks: ['unit-of-analysis'],
            options: [
              {
                id: 'ua-a',
                label: 'Account — compute activation rate as accounts that achieved meaningful activation / total accounts assigned',
                scoreValue: 2,
                rationale: 'Correct. The randomization unit is account, and activation is an account-level outcome (did the team start using the product meaningfully?). User-level analysis within accounts would require clustering to avoid inflated power.',
              },
              {
                id: 'ua-b',
                label: 'User — compute activation rate as users who activated / total users who signed up',
                scoreValue: 0,
                rationale: 'Mismatches the account-level randomization. Users within the same account are correlated — treating them as independent observations inflates effective sample size and produces overconfident p-values.',
              },
            ],
          },
        ],
      },
      {
        id: 'metrics',
        label: 'Metrics',
        hint: 'What proves that users are getting real value — not just completing tasks?',
        fields: [
          {
            id: 'primaryMetric',
            label: 'What is the primary metric?',
            type: 'single_select',
            conceptLinks: ['primary-metric', 'proxy-metric'],
            options: [
              {
                id: 'pm-a',
                label: 'Checklist completion rate (accounts that completed all 7 steps / total accounts assigned)',
                scoreValue: 0,
                rationale: 'The exact trap. Checklist completion measures whether users went through the motions — not whether they got value. Users can complete all 7 steps in 3 minutes without retaining any of the behaviors. The review scenario shows exactly what happens when this is the primary metric.',
              },
              {
                id: 'pm-b',
                label: 'Week-1 meaningful activation rate (accounts that created a project, added a task, and invited a teammate within 7 days of signup)',
                scoreValue: 2,
                rationale: 'Strong. These three actions are the behaviors Loopwise data shows predict 30-day retention. Unlike checklist completion, this metric requires the user to actually use the product in the intended workflow — not just click through a setup experience.',
              },
              {
                id: 'pm-c',
                label: '30-day account retention rate',
                scoreValue: 1,
                rationale: 'Important outcome, but too lagging as a primary metric for an experiment with limited new account volume. The 30-day window means you need 30+ days of observation per account after assignment — which requires a long runtime and large sample. Use as a secondary/confirmatory metric.',
              },
              {
                id: 'pm-d',
                label: 'Time-to-first-task (hours between signup and creating the first task)',
                scoreValue: 0,
                rationale: 'Speed to first action is not activation. The checklist may dramatically reduce time-to-first-task simply by making the prompt more visible — without improving whether the user persists in the product. This is a vanity metric for this experiment.',
              },
            ],
          },
          {
            id: 'guardrailMetrics',
            label: 'Which guardrails should be pre-committed? (Select all)',
            type: 'multi_select',
            conceptLinks: ['guardrail-metric'],
            options: [
              {
                id: 'gm-a',
                label: '14-day account retention rate',
                scoreValue: 2,
                rationale: 'Critical. If the checklist produces checklist completion but not durable engagement, 14-day retention should be flat or worse despite activation improvements. This is the early signal that "activation" was artificial.',
              },
              {
                id: 'gm-b',
                label: 'Support ticket rate in the first 7 days',
                scoreValue: 1,
                rationale: 'Good usability guardrail. If the checklist is confusing, overwhelming, or misleading, support contacts will rise. A checklist that drives up support load while improving completion is not a net positive.',
              },
              {
                id: 'gm-c',
                label: 'Trial-to-paid conversion rate (for accounts on free trial)',
                scoreValue: 1,
                rationale: 'Useful downstream guardrail for free-trial accounts. If the checklist improves week-1 activation but does nothing for conversion, its business value is limited. Include as a secondary if trial accounts are a significant segment.',
              },
              {
                id: 'gm-d',
                label: 'Number of checklist steps completed per account (regardless of order)',
                scoreValue: 0,
                rationale: 'This is a diagnostic, not a guardrail. It measures how far accounts got in the checklist — useful for understanding drop-off patterns, but not a guardrail that should block shipping.',
              },
            ],
          },
          {
            id: 'diagnosticMetrics',
            label: 'Which metrics are diagnostics?',
            type: 'multi_select',
            conceptLinks: [],
            options: [
              {
                id: 'dm-a',
                label: 'Checklist completion rate and step-by-step funnel (where do users drop off?)',
                scoreValue: 2,
                rationale: 'Essential diagnostic. If the primary metric (meaningful activation) improves, understanding which checklist steps drove it helps optimize the experience. If activation doesn\'t improve, the drop-off analysis reveals where the checklist is failing.',
              },
              {
                id: 'dm-b',
                label: 'Time spent per checklist step vs. equivalent actions in control group',
                scoreValue: 1,
                rationale: 'Useful for understanding whether the checklist guides users through steps more efficiently than the unguided experience. Faster time-per-step may suggest the checklist is a helpful nudge, not just a gamification wrapper.',
              },
              {
                id: 'dm-c',
                label: 'Feature usage heatmap (which features do treatment vs. control users explore in week 1?)',
                scoreValue: 1,
                rationale: 'Good product intelligence diagnostic. If the checklist directs users to specific features, it shapes what they discover. Understanding whether checklist-directed discovery leads to better or worse product patterns is useful for future iteration.',
              },
            ],
          },
        ],
      },
      {
        id: 'logistics',
        label: 'Logistics',
        hint: 'B2B SaaS has low new-account volume — how do you get sufficient power?',
        fields: [
          {
            id: 'runtime',
            label: 'How long should this experiment run?',
            type: 'single_select',
            conceptLinks: ['power', 'mde'],
            options: [
              {
                id: 'rt-a',
                label: '14 days',
                scoreValue: 0,
                rationale: 'At 220 new accounts per week, 14 days gives only ~440 accounts total (~220 per arm). This is likely underpowered for week-1 activation rate changes of meaningful size (e.g., 5pp lift on 38% base). Check power calculations before committing to 14 days.',
              },
              {
                id: 'rt-b',
                label: '4–6 weeks, based on power calculation for the required sample size',
                scoreValue: 2,
                rationale: 'Correct. B2B SaaS experiments have low new account volume. At 220/week, 6 weeks gives ~1,320 accounts (~660 per arm) — sufficient for moderate effect sizes. Run the power calculation with the specific base rate and MDE before committing to runtime.',
              },
              {
                id: 'rt-c',
                label: 'Run until p < 0.05',
                scoreValue: 0,
                rationale: 'Peeking problem. With low volume, you\'re especially susceptible to false positives if you stop when significance is reached. Pre-commit to the sample size based on a power calculation, not on when the p-value happens to cross 0.05.',
              },
              {
                id: 'rt-d',
                label: '90 days, to ensure we see the 30-day retention outcome',
                scoreValue: 0,
                rationale: 'Too long for an experiment the PM wants to use for sprint planning. A 90-day runtime is justified for 30-day retention as primary — but if you use week-1 activation as primary and 30-day retention as a secondary/post-test metric, you can run for 6 weeks and still be informative.',
              },
            ],
          },
          {
            id: 'sampleSizeConcern',
            label: 'What is the main power concern for this experiment?',
            type: 'single_select',
            conceptLinks: ['power', 'mde'],
            options: [
              {
                id: 'ss-a',
                label: 'Power is not a concern — checklist effects tend to be large',
                scoreValue: 0,
                rationale: 'Unfounded assumption. Onboarding changes frequently show smaller activation effects than anticipated, especially when users already know how to find the core features without a checklist. Do not assume large effects.',
              },
              {
                id: 'ss-b',
                label: 'Low new-account volume (~220/week) means the experiment may be underpowered for small-to-moderate activation effects — run explicit power calculation and set MDE before launch',
                scoreValue: 2,
                rationale: 'Correct. At ~220 accounts/week, the experiment is power-constrained. The MDE at 6 weeks (~660 accounts/arm) on a 38% activation base is roughly 5–7pp at 80% power. If the real effect is 2–3pp, the experiment will be underpowered. Set the MDE honestly before the test and don\'t extend it post-hoc.',
              },
              {
                id: 'ss-c',
                label: 'Power is sufficient since checklist completion will show large differences between arms',
                scoreValue: 0,
                rationale: 'Checklist completion is only a diagnostic — it\'s not the primary metric. Large differences in checklist completion (which you\'d expect trivially, since control has no checklist) do not indicate adequate power for meaningful activation differences.',
              },
            ],
          },
        ],
      },
      {
        id: 'risks',
        label: 'Risks & Decision Rule',
        hint: 'The biggest risk is shipping on the wrong metric — how do you prevent it?',
        fields: [
          {
            id: 'trustChecks',
            label: 'Which trust checks should you run before reading results? (Select all)',
            type: 'multi_select',
            conceptLinks: ['srm'],
            options: [
              {
                id: 'tc-a',
                label: 'SRM check on account assignment counts',
                scoreValue: 2,
                rationale: 'Standard first check. Verify assignment counts match the intended split. Onboarding experiments with eligibility logic (first 7 days only) are common SRM sources.',
              },
              {
                id: 'tc-b',
                label: 'Exclude staff/demo accounts from analysis',
                scoreValue: 2,
                rationale: 'Important for SaaS. Internal test accounts and demo accounts created by sales teams will behave differently. Including them inflates completion rates and biases results. Exclude by email domain or account type before analysis.',
              },
              {
                id: 'tc-c',
                label: 'Verify pre-experiment week-1 activation rates are comparable between arms',
                scoreValue: 1,
                rationale: 'Good baseline check. If treatment and control accounts had different pre-experiment activation patterns, randomization may have failed.',
              },
            ],
          },
          {
            id: 'validityRisks',
            label: 'What are the main validity risks? (Select all)',
            type: 'multi_select',
            conceptLinks: ['novelty-effect', 'proxy-metric'],
            options: [
              {
                id: 'vr-a',
                label: 'Checklist gaming — users rush through low-value steps to clear the checklist badge without genuinely engaging with the product',
                scoreValue: 2,
                rationale: 'The central risk. Checklists activate completion psychology (gamification effect) which drives step completion independent of actual value. Users will complete "set personal preferences" in 10 seconds to see the progress bar move. This is exactly the failure mode in the paired Review scenario.',
              },
              {
                id: 'vr-b',
                label: 'Novelty effect — treatment users are more engaged simply because the onboarding is new and different, regardless of checklist quality',
                scoreValue: 1,
                rationale: 'Moderate risk. New onboarding experiences prompt exploration that decays over time. Week-1 activation may be inflated by novelty that doesn\'t translate to week-4 retention.',
              },
              {
                id: 'vr-c',
                label: 'Low statistical power — small effect sizes on a modest new-account volume may not reach significance',
                scoreValue: 1,
                rationale: 'Real risk, especially if the true activation effect is 2–3pp on a 38% base. An underpowered experiment risks both false negatives (missing real activation improvement) and the temptation to ship on checklist completion instead.',
              },
            ],
          },
          {
            id: 'decisionRule',
            label: 'What is the pre-committed decision rule?',
            type: 'single_select',
            conceptLinks: ['p-value', 'guardrail-metric'],
            options: [
              {
                id: 'dr-a',
                label: 'Ship if checklist completion rate improves significantly.',
                scoreValue: 0,
                rationale: 'Explicitly wrong. Checklist completion is a diagnostic in this design. Shipping on completion rate alone is the paired Review scenario failure mode — high completion, flat or negative activation.',
              },
              {
                id: 'dr-b',
                label: 'Ship if week-1 meaningful activation rate is significantly positive AND 14-day retention is not significantly worse. Do not ship if activation improves but retention declines — that would indicate checklist gaming.',
                scoreValue: 2,
                rationale: 'Correct. This rule uses the right primary metric, explicitly guards against the checklist-gaming failure mode (activation up, retention down), and treats the retention guardrail as blocking. This is the decision structure that separates real activation improvement from gamified completion.',
              },
              {
                id: 'dr-c',
                label: 'Ship if week-1 activation rate and checklist completion both improve significantly.',
                scoreValue: 0,
                rationale: 'Using checklist completion as a co-condition is not meaningful — of course completion will be higher in treatment (the control has no checklist). This adds no signal and dilutes the decision rule.',
              },
              {
                id: 'dr-d',
                label: 'Ship if any activation metric improves without a significant guardrail breach.',
                scoreValue: 1,
                rationale: '"Any activation metric" introduces multiple testing without a pre-committed primary. Better to pre-commit to one activation metric (week-1 meaningful activation) and treat the others as secondary.',
              },
            ],
          },
        ],
      },
    ],

    scoringRubric: {
      dimensions: [
        { id: 'metric_selection', label: 'Metric selection', weight: 0.35, fieldIds: ['primaryMetric', 'guardrailMetrics'] },
        { id: 'design_validity', label: 'Design validity', weight: 0.30, fieldIds: ['randomizationUnit', 'unitOfAnalysis', 'trustChecks', 'validityRisks'] },
        { id: 'decision_discipline', label: 'Decision discipline', weight: 0.20, fieldIds: ['decisionRule', 'sampleSizeConcern'] },
        { id: 'hypothesis_framing', label: 'Hypothesis framing', weight: 0.15, fieldIds: ['hypothesis', 'businessDecision'] },
      ],
      levels: {
        incomplete:    { minScore: 0,    label: 'Incomplete' },
        analyst_ready: { minScore: 0.45, label: 'Analyst-Ready' },
        senior_ready:  { minScore: 0.68, label: 'Senior-Ready' },
        staff_level:   { minScore: 0.85, label: 'Staff-Level' },
      },
    },

    seniorDesign: {
      rationale: 'The central design challenge is defining what activation actually means. "Checklist completion" is not activation — it\'s a proxy for it, and a gameable one. The 7-step checklist includes "set personal preferences" — a step users can complete in 10 seconds with no product engagement. If completion is the success metric, the team will ship a checklist that teaches users to clear a progress bar, not use the product.\n\nThe right primary metric is the specific set of behaviors that Loopwise data shows predict 30-day retention: creating a project, adding a task, and inviting a teammate. All three, in the first 7 days. These require actual product engagement, not just UI interaction.\n\nThe retention guardrail is the most important signal for catching checklist gaming. If treatment accounts show higher week-1 activation but flat or worse 14-day retention, users went through the checklist motions without forming product habits. That is a false positive. The decision rule must block shipping in this case.\n\nB2B SaaS volume constraint: at 220 new accounts per week, you need 6+ weeks for adequate power at reasonable effect sizes. Be honest about this upfront — don\'t start the experiment with a 14-day timeline and then extend post-hoc.',
      commonMistakes: [
        {
          mistake: 'Using checklist completion as the primary metric',
          consequence: 'Users optimize for progress bars, not product value. High checklist completion coexists with flat activation. The team ships a feature that looks good in the experiment and produces no long-term retention improvement.',
          conceptLink: 'proxy-metric',
        },
        {
          mistake: 'User-level rather than account-level randomization in B2B team product',
          consequence: 'Team members within the same account see inconsistent onboarding experiences. The admin sees a checklist; their teammate doesn\'t. Within-account correlation inflates apparent power and contaminates the treatment effect.',
          conceptLink: 'randomization-unit',
        },
        {
          mistake: 'Running only 14 days given low new-account volume',
          consequence: 'Sample is too small to detect realistic 5pp activation improvements at 80% power. The experiment returns null result. Team ships on checklist completion as consolation prize.',
          conceptLink: 'power',
        },
      ],
      failureMode: {
        weakAnswer: 'The candidate accepts checklist completion as the primary metric, runs the test for 14 days, reads a +34% completion rate lift, and recommends shipping. They never check whether checklist completers show higher 14-day retention, never flag that completion is gameable by trivial steps like "set personal preferences," and declare the feature a success based entirely on the progress bar metric.',
        interviewerFollowUp: '"Checklist completion is up 34%. Before you recommend ship, I want to see one number: what is the 14-day retention rate for users who completed the checklist versus those who didn\'t — and if it\'s flat or worse in the treatment arm, what does that tell you about what the checklist actually taught users to do?"',
      },
    },

    pairedScenarioPrompt: {
      toReview: 'You designed this experiment. Now see what the data showed when Loopwise ran the checklist test with completion as the primary metric.',
      fromReview: 'You read the checklist completion illusion. Go back and design this experiment to avoid shipping on the wrong metric.',
    },
  },
];

export const designScenariosById = Object.fromEntries(designScenarios.map(s => [s.id, s]));
