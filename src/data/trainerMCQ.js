// trainerMCQ.js — 40 high-quality MCQs for the PAL Trainer feature
// Categories: statistics | metrics | growth | product | experimentation | behavioral | estimation

export const trainerMCQ = [
  // ─────────────────────────────────────────────
  // STATISTICS (mcq01 – mcq10)
  // ─────────────────────────────────────────────
  {
    id: 'mcq01',
    category: 'statistics',
    sourceRoom: 'stat-foundations',
    difficulty: 'analyst',
    question:
      'An A/B test returns p = 0.03. A stakeholder says "there is a 3% chance the null hypothesis is true." What is wrong with this statement?',
    options: [
      {
        id: 'a',
        text: 'Nothing — p = 0.03 directly gives the probability the null hypothesis is true.',
        correct: false,
      },
      {
        id: 'b',
        text: 'The p-value is the probability of observing data at least this extreme given the null is true, not the probability that the null is true.',
        correct: true,
      },
      {
        id: 'c',
        text: 'The statement should say "97% chance the null is false" instead.',
        correct: false,
      },
      {
        id: 'd',
        text: 'p-values cannot be expressed as percentages.',
        correct: false,
      },
    ],
    explanation:
      'A p-value is P(data | H₀), not P(H₀ | data). Confusing these is called the "inverse probability fallacy." To get P(H₀ | data) you need Bayes\' theorem and a prior. Options A and C both commit the same inversion error, and D is simply false.',
    tags: ['p-value', 'null-hypothesis', 'frequentist', 'common-misconception'],
  },
  {
    id: 'mcq02',
    category: 'statistics',
    sourceRoom: 'stat-foundations',
    difficulty: 'analyst',
    question:
      'A 95% confidence interval for a metric uplift is [+1.2%, +3.8%]. Which interpretation is correct?',
    options: [
      {
        id: 'a',
        text: 'There is a 95% probability the true uplift lies between 1.2% and 3.8%.',
        correct: false,
      },
      {
        id: 'b',
        text: 'If we repeated this experiment many times, about 95% of the resulting intervals would contain the true population parameter.',
        correct: true,
      },
      {
        id: 'c',
        text: '95% of individual users experienced an uplift in [1.2%, 3.8%].',
        correct: false,
      },
      {
        id: 'd',
        text: 'The experiment has 95% statistical power.',
        correct: false,
      },
    ],
    explanation:
      'A confidence interval is a property of the procedure, not of a single interval. The frequentist framing is: across repeated sampling, 95% of such constructed intervals cover the true parameter. Once computed, the interval either does or does not contain the true value — there is no probability statement about a fixed interval. Option A is the Bayesian credible-interval interpretation. Options C and D describe entirely different concepts.',
    tags: ['confidence-intervals', 'frequentist', 'interpretation'],
  },
  {
    id: 'mcq03',
    category: 'statistics',
    sourceRoom: 'stat-foundations',
    difficulty: 'senior',
    question:
      'Your experiment is underpowered (power = 40%). You observe a statistically significant result (p < 0.05). What concern should you raise?',
    options: [
      {
        id: 'a',
        text: 'Low power means you cannot trust any result, so the experiment is invalid.',
        correct: false,
      },
      {
        id: 'b',
        text: 'A significant result from an underpowered study has a high false-positive rate and likely overestimates the true effect size (winner\'s curse).',
        correct: true,
      },
      {
        id: 'c',
        text: 'Low power only affects Type II errors; a significant result is still reliable.',
        correct: false,
      },
      {
        id: 'd',
        text: 'You should increase the significance threshold α to compensate for low power.',
        correct: false,
      },
    ],
    explanation:
      'When power is low (high Type II error rate), the subset of experiments that do reach significance tends to contain a disproportionate share of false positives and inflated effect sizes — known as the winner\'s curse. The positive predictive value (probability a significant result is true) depends on both α and power. Option C is wrong because power directly affects the reliability of positive results via PPV. Option D would make the false-positive problem even worse.',
    tags: ['statistical-power', 'type-ii-error', 'winners-curse', 'ppv'],
  },
  {
    id: 'mcq04',
    category: 'statistics',
    sourceRoom: 'stat-foundations',
    difficulty: 'analyst',
    question:
      'You run 20 independent A/B tests simultaneously, each at α = 0.05, and all 20 null hypotheses are actually true. On average, how many tests will you expect to falsely declare significant?',
    options: [
      { id: 'a', text: '0', correct: false },
      { id: 'b', text: '1', correct: true },
      { id: 'c', text: '5', correct: false },
      { id: 'd', text: 'Roughly 0.95 — since each test has a 95% chance of being correct, the expected number of correct results is 20 × 0.95.', correct: false },
    ],
    explanation:
      'With α = 0.05 and all nulls true, each test has a 5% chance of a false positive. Across 20 independent tests, the expected number of false positives is 20 × 0.05 = 1. This is the multiple-testing problem: the family-wise error rate (FWER) is much higher than 5%, so corrections like Bonferroni or Benjamini-Hochberg are needed. Sample size affects power, not the expected false-positive count given all-null true hypotheses.',
    tags: ['multiple-testing', 'type-i-error', 'bonferroni', 'family-wise-error'],
  },
  {
    id: 'mcq05',
    category: 'statistics',
    sourceRoom: 'stat-foundations',
    difficulty: 'senior',
    question:
      'A university reports that admissions rates for men (44%) are higher than for women (35%), but within every individual department, women are admitted at the same rate or higher than men. What phenomenon explains this?',
    options: [
      { id: 'a', text: 'Selection bias', correct: false },
      { id: 'b', text: 'Survivorship bias', correct: false },
      { id: 'c', text: 'Simpson\'s paradox', correct: true },
      { id: 'd', text: 'Regression to the mean', correct: false },
    ],
    explanation:
      'Simpson\'s paradox occurs when a trend that appears in aggregated data reverses or disappears when the data is split into subgroups. Here, women disproportionately apply to competitive departments with lower overall acceptance rates, creating a confounding variable (department difficulty) that reverses the gender trend at the aggregate level. Selection bias refers to non-representative sampling; survivorship bias involves only observing survivors; regression to the mean is about extreme values moving toward average over time.',
    tags: ['simpsons-paradox', 'confounding', 'aggregation', 'causal-inference'],
  },
  {
    id: 'mcq06',
    category: 'statistics',
    sourceRoom: 'stat-foundations',
    difficulty: 'senior',
    question:
      'A user cohort scored in the top 10% on an engagement metric last week. This week their average score is lower, even without any product change. The most likely explanation is:',
    options: [
      {
        id: 'a',
        text: 'Selection effect — by definition only high-scoring users were selected, so the group will look worse in subsequent weeks as lower-scoring sessions occur.',
        correct: false,
      },
      {
        id: 'b',
        text: 'Regression to the mean — extreme scores naturally move closer to the population average over time.',
        correct: true,
      },
      { id: 'c', text: 'The cohort suffered attrition, removing engaged users.', correct: false },
      {
        id: 'd',
        text: 'Novelty decay — users who engaged heavily last week are now fatigued, causing a temporary dip.',
        correct: false,
      },
    ],
    explanation:
      'Regression to the mean describes the statistical phenomenon where extreme observed values tend to be followed by less extreme values on subsequent measurements, because part of the extreme score was due to random variation (luck). Selecting users based on high scores selects for both true high engagement AND temporarily lucky noise; the next measurement captures less noise. This is why control groups are essential — without them, natural regression can be mistaken for treatment effects.',
    tags: ['regression-to-mean', 'cohort-analysis', 'random-variation'],
  },
  {
    id: 'mcq07',
    category: 'statistics',
    sourceRoom: 'stat-foundations',
    difficulty: 'analyst',
    question:
      'An A/B test shows a 0.1% lift in conversion rate (95% CI: [0.09%, 0.11%], p < 0.001) on a high-traffic e-commerce site. Should this feature be shipped?',
    options: [
      {
        id: 'a',
        text: 'Yes — the result is highly statistically significant, so the feature is valuable.',
        correct: false,
      },
      {
        id: 'b',
        text: 'Not necessarily — statistical significance does not imply practical significance; the business impact must be evaluated separately.',
        correct: true,
      },
      {
        id: 'c',
        text: 'No — a 0.1% lift is always too small to matter.',
        correct: false,
      },
      {
        id: 'd',
        text: 'Yes — a narrow confidence interval indicates a reliable, large effect.',
        correct: false,
      },
    ],
    explanation:
      'Statistical significance tells you the effect is unlikely to be zero, but says nothing about whether the effect is large enough to justify shipping, the engineering cost, or potential negative second-order effects. A 0.1% lift could be worth millions at scale or negligible depending on context. Option C is wrong because at very high revenue, even 0.1% can be meaningful — the decision requires knowing the dollar value. Option D confuses precision of estimate with magnitude of effect.',
    tags: ['practical-significance', 'statistical-significance', 'business-impact', 'effect-size'],
  },
  {
    id: 'mcq08',
    category: 'statistics',
    sourceRoom: 'stat-foundations',
    difficulty: 'staff',
    question:
      'A Bayesian analyst sets a prior that a new feature has a 20% chance of improving the metric. The A/B test data yields a Bayes factor of 5 in favor of the alternative. What is the approximate posterior probability the feature is effective?',
    options: [
      { id: 'a', text: '50%', correct: false },
      { id: 'b', text: '56%', correct: true },
      { id: 'c', text: '80%', correct: false },
      { id: 'd', text: '20% — the prior is already 20%, and the Bayes factor simply confirms it.', correct: false },
    ],
    explanation:
      'Using Bayes\' theorem: posterior odds = prior odds × Bayes factor. Prior odds = 0.20/0.80 = 0.25. Posterior odds = 0.25 × 5 = 1.25. Posterior probability = 1.25 / (1 + 1.25) ≈ 0.556 or ~56%. This illustrates why priors matter: the same data that would push a 50/50 prior to ~83% only moves a skeptical 20% prior to ~56%. Option C would require a much stronger prior or higher Bayes factor.',
    tags: ['bayesian', 'bayes-factor', 'posterior-probability', 'prior'],
  },
  {
    id: 'mcq09',
    category: 'statistics',
    sourceRoom: 'stat-foundations',
    difficulty: 'senior',
    question:
      'You analyze click-through rates for a new feature and find users who opted in have a 40% CTR vs 15% for non-opted users. Can you conclude the feature causes higher CTR?',
    options: [
      {
        id: 'a',
        text: 'Yes — the 25 percentage-point difference is large enough to be causal.',
        correct: false,
      },
      {
        id: 'b',
        text: 'No — this is an observational study with self-selection bias; highly engaged users are more likely to both opt in and click.',
        correct: true,
      },
      {
        id: 'c',
        text: 'Yes — if the sample is large enough, observational data is equivalent to experimental data.',
        correct: false,
      },
      {
        id: 'd',
        text: 'No — but only because the opt-in rate is too low; with a large enough opt-in population, observational comparisons become as reliable as a randomized experiment.',
        correct: false,
      },
    ],
    explanation:
      'This is selection bias / self-selection confounding. Users who opt into a feature are systematically different from those who do not — they tend to be more engaged, tech-savvy, or interested in the product. These same traits drive higher CTR independently of the feature. Sample size does not fix confounding (Option C); it only reduces sampling error. A randomized experiment or quasi-experimental method (e.g., instrumental variables) is needed to establish causality.',
    tags: ['selection-bias', 'observational-study', 'confounding', 'causality'],
  },
  {
    id: 'mcq10',
    category: 'statistics',
    sourceRoom: 'stat-foundations',
    difficulty: 'staff',
    question:
      'Which statement best distinguishes a Type I error from a Type II error in the context of A/B testing?',
    options: [
      {
        id: 'a',
        text: 'Type I: failing to detect a real effect. Type II: detecting an effect that does not exist.',
        correct: false,
      },
      {
        id: 'b',
        text: 'Type I: concluding a feature works when it does not (false positive). Type II: concluding no effect when there is a real one (false negative).',
        correct: true,
      },
      {
        id: 'c',
        text: 'Type I errors are controlled by statistical power; Type II errors by α.',
        correct: false,
      },
      {
        id: 'd',
        text: 'Both errors decrease as sample size increases.',
        correct: false,
      },
    ],
    explanation:
      'Type I error (α) is rejecting a true null hypothesis — shipping a feature that has no real effect. Type II error (β) is failing to reject a false null — missing a feature that does work. α is controlled by the significance threshold; power (1 − β) is controlled by sample size and effect size. Option C has them reversed. Option D is partially wrong: increasing sample size reduces β (increases power) but Type I error rate α is fixed by the analyst\'s chosen threshold, not by sample size.',
    tags: ['type-i-error', 'type-ii-error', 'alpha', 'power'],
  },

  // ─────────────────────────────────────────────
  // EXPERIMENTATION (mcq11 – mcq20)
  // ─────────────────────────────────────────────
  {
    id: 'mcq11',
    category: 'experimentation',
    sourceRoom: 'experiment-design',
    difficulty: 'analyst',
    question:
      'After launching an A/B test you notice the control group has 48,200 users and the treatment group has 51,800 users, despite targeting a 50/50 split. What is this called and why does it matter?',
    options: [
      {
        id: 'a',
        text: 'Novelty effect — users are behaving differently because the feature is new.',
        correct: false,
      },
      {
        id: 'b',
        text: 'Sample ratio mismatch (SRM) — the unequal split suggests a bug in randomization or logging that may invalidate results.',
        correct: true,
      },
      {
        id: 'c',
        text: 'Network effect — treatment users are influencing control users, inflating one group.',
        correct: false,
      },
      {
        id: 'd',
        text: 'Normal sampling variance — a 3.6% deviation is within acceptable bounds.',
        correct: false,
      },
    ],
    explanation:
      'Sample ratio mismatch (SRM) occurs when the observed ratio of users differs significantly from the intended ratio, detectable with a chi-squared test. SRM indicates a systematic problem: bots being filtered only in one group, logging bugs, or assignment errors — all of which can introduce bias. Even small SRMs (~1%) can invalidate results because affected groups are no longer comparable. Option D is wrong because a deviation this large (χ² ≈ 260) is astronomically unlikely under correct randomization.',
    tags: ['srm', 'sample-ratio-mismatch', 'experiment-validity', 'randomization'],
  },
  {
    id: 'mcq12',
    category: 'experimentation',
    sourceRoom: 'experiment-design',
    difficulty: 'senior',
    question:
      'A new search algorithm shows a 15% CTR improvement in week one, but the lift fades to 3% by week four with no product change. What is the most likely explanation?',
    options: [
      { id: 'a', text: 'The experiment suffered from Simpson\'s paradox over time.', correct: false },
      {
        id: 'b',
        text: 'Novelty effect — users initially over-engaged with the new experience but reverted to baseline behavior as the novelty wore off.',
        correct: true,
      },
      {
        id: 'c',
        text: 'Survivorship bias — low-engagement users dropped off, leaving only engaged users in week four.',
        correct: false,
      },
      {
        id: 'd',
        text: 'Peeking — the analyst checked results early and the inflated early estimate regressed.',
        correct: false,
      },
    ],
    explanation:
      'The novelty effect (also called the "newness bias") occurs when users engage more with an unfamiliar UI or feature simply because it is new, not because it is genuinely better. As users habituate, behavior normalizes. The solution is to run experiments long enough to observe steady-state behavior, often 2–4 weeks for features with high novelty potential. Option C would show engagement increasing over time as low-value users leave, not decreasing. Option D (peeking) affects false-positive rate but would not cause a systematic week-over-week decay in the point estimate.',
    tags: ['novelty-effect', 'experiment-duration', 'habituation', 'bias'],
  },
  {
    id: 'mcq13',
    category: 'experimentation',
    sourceRoom: 'experiment-design',
    difficulty: 'staff',
    question:
      'You are A/B testing a referral program. Treatment users can invite friends, who may also end up in either group. Which core assumption of A/B testing does this violate?',
    options: [
      {
        id: 'a',
        text: 'Independence of observations — referred users create correlation within the treatment group, inflating the test statistic.',
        correct: false,
      },
      {
        id: 'b',
        text: 'SUTVA (Stable Unit Treatment Value Assumption) — treatment affects control-group users through referrals, creating interference.',
        correct: true,
      },
      {
        id: 'c',
        text: 'External validity — the referral dynamic means results may not generalize beyond the experiment window.',
        correct: false,
      },
      {
        id: 'd',
        text: 'Randomization balance — users who send referrals are systematically different from those who do not, violating equal group composition.',
        correct: false,
      },
    ],
    explanation:
      'SUTVA requires that one unit\'s outcome is not affected by another unit\'s treatment assignment. A referral program violates this because treatment users can recruit friends into the control group, "contaminating" control. This leads to underestimating the treatment effect (control benefit from spillover) or overestimating it (if treatment users cherry-pick recipients). Solutions include cluster-based randomization (randomize at the household/social cluster level), holdout experiments, or network-aware designs.',
    tags: ['sutva', 'interference', 'network-effects', 'experiment-design'],
  },
  {
    id: 'mcq14',
    category: 'experimentation',
    sourceRoom: 'experiment-design',
    difficulty: 'senior',
    question:
      'CUPED (Controlled-experiment Using Pre-Experiment Data) is used to reduce variance in A/B test metrics. Which of the following best describes what CUPED does?',
    options: [
      {
        id: 'a',
        text: 'It increases the sample size by resampling from historical data.',
        correct: false,
      },
      {
        id: 'b',
        text: 'It subtracts a covariate correlated with the outcome metric (e.g., pre-experiment metric value) to reduce residual variance, effectively increasing statistical power.',
        correct: true,
      },
      {
        id: 'c',
        text: 'It adjusts for multiple testing by correcting the p-value threshold.',
        correct: false,
      },
      {
        id: 'd',
        text: 'It removes outlier users who skew the metric distribution.',
        correct: false,
      },
    ],
    explanation:
      'CUPED computes an adjusted metric: Y_adjusted = Y − θ·X, where X is a pre-experiment covariate (e.g., the same metric measured before the experiment) and θ is chosen to maximize variance reduction. Because pre-experiment behavior is correlated with post-experiment behavior but unaffected by the treatment, subtracting it removes background noise without introducing bias. The result is a lower-variance estimator, equivalent to needing fewer users to achieve the same power. It is not resampling, multiple-testing correction, or outlier removal.',
    tags: ['cuped', 'variance-reduction', 'power', 'covariate-adjustment'],
  },
  {
    id: 'mcq15',
    category: 'experimentation',
    sourceRoom: 'experiment-design',
    difficulty: 'analyst',
    question:
      'An analyst checks an experiment\'s results every day and plans to stop as soon as p < 0.05. Why is this problematic?',
    options: [
      {
        id: 'a',
        text: 'It is fine as long as you only stop when the result is significant — a significant p-value is valid whenever it appears.',
        correct: false,
      },
      {
        id: 'b',
        text: 'Repeated peeking inflates the Type I error rate far above α = 0.05 because you get multiple chances to cross the threshold by chance.',
        correct: true,
      },
      {
        id: 'c',
        text: 'It is only a problem if the experiment runs longer than its pre-specified duration.',
        correct: false,
      },
      {
        id: 'd',
        text: 'Stopping early is valid if the effect is large — a strong signal does not need the full sample.',
        correct: false,
      },
    ],
    explanation:
      'Under a fixed-horizon design, the p-value threshold α applies only at the pre-specified endpoint. Checking repeatedly and stopping when p < 0.05 is equivalent to running many hypothesis tests, each with its own chance of a false positive. Simulations show that with 20 daily peeks, the effective false-positive rate can exceed 20–30% even when α = 0.05 is used each time. Solutions include sequential testing methods (e.g., always-valid p-values, mSPRT) or pre-committing to a single end-of-experiment analysis.',
    tags: ['peeking', 'sequential-testing', 'type-i-error', 'alpha-inflation'],
  },
  {
    id: 'mcq16',
    category: 'experimentation',
    sourceRoom: 'experiment-design',
    difficulty: 'senior',
    question:
      'You want to measure the long-term impact of a recommendation algorithm that has been rolled out to 100% of users. Which method would you use?',
    options: [
      { id: 'a', text: 'A standard A/B test on all current users.', correct: false },
      {
        id: 'b',
        text: 'A holdout test — keep a small percentage of users permanently on the old algorithm as a control group.',
        correct: true,
      },
      {
        id: 'c',
        text: 'A before/after analysis comparing metrics from the week before and after launch.',
        correct: false,
      },
      {
        id: 'd',
        text: 'Measure only new user cohorts since existing users are already "contaminated."',
        correct: false,
      },
    ],
    explanation:
      'When a feature is shipped to 100% of users, a standard A/B test is impossible. A holdout test withholds the feature from a small, randomly assigned control group (e.g., 1–5%) for an extended period, allowing ongoing causal measurement. Before/after analysis (Option C) is confounded by seasonality, external events, and organic trends. Option D would take months to accumulate sufficient data and only measures new-user effects, missing the full user base. Holdouts are the gold standard for measuring long-term logged-in feature value.',
    tags: ['holdout-test', 'long-term-effects', 'experiment-design', 'causal-inference'],
  },
  {
    id: 'mcq17',
    category: 'experimentation',
    sourceRoom: 'experiment-design',
    difficulty: 'staff',
    question:
      'Your North Star metric is not statistically significant (p = 0.12), but three guardrail metrics (latency, crash rate, core engagement) all show statistically significant degradations. What is the right decision?',
    options: [
      {
        id: 'a',
        text: 'Ship the feature — the North Star not reaching significance means the null hypothesis of no effect is confirmed.',
        correct: false,
      },
      {
        id: 'b',
        text: 'Do not ship — guardrail violations are hard stops that protect product health regardless of North Star results.',
        correct: true,
      },
      {
        id: 'c',
        text: 'Apply Bonferroni correction to the guardrail metrics; if they remain significant, investigate further.',
        correct: false,
      },
      {
        id: 'd',
        text: 'Extend the experiment duration to give the North Star time to reach significance.',
        correct: false,
      },
    ],
    explanation:
      'Guardrail metrics are defined exactly for this situation — they represent harm floors that cannot be violated even when the primary metric shows promise. A non-significant North Star does not prove the null (it just means insufficient evidence to reject it), but significant guardrail degradations are positive evidence of harm. Extending the experiment (Option D) would cause more users to experience the harm. Option C is wrong because guardrails are typically set conservatively and confirmed degradations should be taken at face value, not corrected away.',
    tags: ['guardrail-metrics', 'experiment-decision', 'harm-detection', 'north-star'],
  },
  {
    id: 'mcq18',
    category: 'experimentation',
    sourceRoom: 'experiment-design',
    difficulty: 'senior',
    question:
      'Minimum Detectable Effect (MDE) represents the smallest effect size an experiment is powered to detect at a given α and power. If you halve the MDE (i.e., detect effects twice as small), what happens to the required sample size?',
    options: [
      { id: 'a', text: 'It doubles.', correct: false },
      { id: 'b', text: 'It quadruples.', correct: true },
      { id: 'c', text: 'It increases by about 41% — variance scales with the square root of the effect size change.', correct: false },
      { id: 'd', text: 'It doubles per side — treatment needs twice as many users, but control stays the same.', correct: false },
    ],
    explanation:
      'Sample size for a two-sample proportion/mean test scales with 1/MDE². Halving the MDE means you need to detect an effect half as large, which requires four times the sample (n ∝ 1/δ²). This is one of the most important experiment-design tradeoffs: detecting small effects is expensive. Practically, this is why teams set MDE based on the minimum business-meaningful effect, not the minimum theoretically possible effect.',
    tags: ['mde', 'sample-size', 'power', 'effect-size'],
  },
  {
    id: 'mcq19',
    category: 'experimentation',
    sourceRoom: 'experiment-design',
    difficulty: 'analyst',
    question:
      'How long should a typical A/B test run at minimum, even if statistical significance is reached in 48 hours?',
    options: [
      {
        id: 'a',
        text: 'Stop as soon as p < 0.05 — the sample size formula already accounts for day-of-week patterns if the test was sized correctly.',
        correct: false,
      },
      {
        id: 'b',
        text: 'At least one full business cycle (usually 1–2 weeks) to account for day-of-week effects and early novelty.',
        correct: true,
      },
      {
        id: 'c',
        text: 'Exactly 30 days, regardless of significance — shorter runs introduce seasonal confounds.',
        correct: false,
      },
      {
        id: 'd',
        text: '48 hours is sufficient if statistical significance is reached — waiting longer only dilutes the novelty signal.',
        correct: false,
      },
    ],
    explanation:
      'User behavior varies significantly by day of week (e.g., Monday vs. weekend usage patterns). An experiment reaching significance in 48 hours may have sampled predominantly weekday users, making results unrepresentative of the full week. Additionally, novelty effects peak in the first few days. Running for at least one full business cycle (7 days) ensures the sample reflects the natural behavioral distribution. 30 days (Option C) is often unnecessarily long unless the metric has high intramonth variance.',
    tags: ['experiment-duration', 'day-of-week-effect', 'novelty-effect', 'seasonality'],
  },
  {
    id: 'mcq20',
    category: 'experimentation',
    sourceRoom: 'experiment-design',
    difficulty: 'staff',
    question:
      'You are running an A/B test on a social feature in a dense network (users can follow each other). The treatment group users are connected to control group users. What is the likely bias and in which direction?',
    options: [
      {
        id: 'a',
        text: 'The treatment effect is underestimated — control users benefit from treatment users\' increased activity (spillover), narrowing the apparent gap between groups.',
        correct: true,
      },
      {
        id: 'b',
        text: 'The treatment effect is overestimated — treatment users share their new experience with control users, making control look worse.',
        correct: false,
      },
      {
        id: 'c',
        text: 'No bias — network connections are randomized equally between groups.',
        correct: false,
      },
      {
        id: 'd',
        text: 'The bias direction is unknowable without knowing the feature type.',
        correct: false,
      },
    ],
    explanation:
      'In a social network, treatment users who become more active (more posts, likes, comments) generate content that their connected control-group friends see and engage with. This spillover inflates control-group metrics, making the control look better than it would in true isolation, and shrinks the measured treatment-control gap. The true causal effect of the treatment is therefore larger than the experiment measures. Cluster-based randomization at the friend-graph level is the standard solution to isolate groups and recover the true effect.',
    tags: ['network-effects', 'interference', 'sutva', 'social-experiments'],
  },

  // ─────────────────────────────────────────────
  // METRICS & GROWTH (mcq21 – mcq30)
  // ─────────────────────────────────────────────
  {
    id: 'mcq21',
    category: 'metrics',
    sourceRoom: 'metric-frameworks',
    difficulty: 'analyst',
    question:
      'A consumer app has DAU = 2M and MAU = 20M. What does the DAU/MAU ratio of 10% indicate?',
    options: [
      { id: 'a', text: 'The app has strong retention — 10% of monthly users are highly active.', correct: false },
      {
        id: 'b',
        text: 'Low stickiness — on average, an active user only opens the app about 3 days per month, suggesting weak habit formation.',
        correct: true,
      },
      { id: 'c', text: 'The app is growing rapidly — DAU is 10% of MAU.', correct: false },
      { id: 'd', text: 'The app has a 10% churn rate per month.', correct: false },
    ],
    explanation:
      'DAU/MAU stickiness measures how often monthly users engage daily. A 10% ratio means the average monthly user is active only ~3 days out of 30 — weak habit formation. Best-in-class apps (Facebook, TikTok) achieve 50–70%+ DAU/MAU. This metric does not measure growth rate (Option C) or churn (Option D). Option A misreads the ratio — high stickiness would show a high ratio, not a low one.',
    tags: ['dau-mau', 'stickiness', 'engagement', 'north-star'],
  },
  {
    id: 'mcq22',
    category: 'growth',
    sourceRoom: 'growth-accounting',
    difficulty: 'senior',
    question:
      'In a growth accounting framework, DAU_today = DAU_yesterday + New + Resurrected − Churned. Last week you had 1M DAU; this week you have 1.1M DAU. New = 200K, Resurrected = 50K, Churned = 150K. Is this healthy growth?',
    options: [
      { id: 'a', text: 'Yes — net DAU grew by 100K.', correct: false },
      {
        id: 'b',
        text: 'Partially — while net growth is positive, the high churn (150K) relative to new users (200K) indicates the retention engine needs work to sustain growth.',
        correct: true,
      },
      { id: 'c', text: 'No — resurrected users inflate the true growth rate.', correct: false },
      { id: 'd', text: 'Yes — churn rate (15% of prior DAU) is within normal SaaS benchmarks.', correct: false },
    ],
    explanation:
      'Growth accounting decomposes DAU change into its sources, revealing the health of acquisition vs. retention. Net growth of 100K looks positive, but churning 150K users per week (15% weekly churn) while acquiring only 200K is a leaky bucket: if acquisition slows, growth quickly goes negative. Sustainable growth requires improving retention (lowering churn) rather than outrunning it with acquisition. Option D applies SaaS monthly churn benchmarks to daily DAU, which is an inappropriate comparison.',
    tags: ['growth-accounting', 'churn', 'retention', 'dau'],
  },
  {
    id: 'mcq23',
    category: 'metrics',
    sourceRoom: 'metric-frameworks',
    difficulty: 'analyst',
    question:
      'A startup has LTV = $120 and CAC = $80. Their investor says this is not yet healthy enough to scale marketing. What is the likely reason?',
    options: [
      { id: 'a', text: 'LTV/CAC of 1.5 is below the commonly cited benchmark of 3:1 needed for sustainable unit economics.', correct: true },
      { id: 'b', text: 'LTV is too high relative to CAC, suggesting the product is underpriced.', correct: false },
      { id: 'c', text: 'LTV/CAC should equal 1.0 for breakeven; 1.5 means the company is overspending on CAC.', correct: false },
      { id: 'd', text: 'The 3:1 benchmark only applies to SaaS, not consumer products.', correct: false },
    ],
    explanation:
      'The widely used benchmark for sustainable growth is LTV:CAC ≥ 3:1, meaning for every $1 spent acquiring a customer, you generate at least $3 in lifetime value. This accounts for gross margin, payback period risk, and overhead. At 1.5:1, the company barely covers acquisition cost after accounting for operating expenses, making scaled marketing unprofitable. Option C misunderstands the metric — breakeven at CAC would be LTV = CAC (ratio of 1.0), and a higher ratio is always better, not a sign of overspending.',
    tags: ['ltv-cac', 'unit-economics', 'growth', 'saas-metrics'],
  },
  {
    id: 'mcq24',
    category: 'metrics',
    sourceRoom: 'metric-frameworks',
    difficulty: 'senior',
    question:
      'You are analyzing 30-day retention. A cross-sectional analysis shows 40% of all current users were active in their first 30 days. A cohort analysis of the January signup cohort shows 22% 30-day retention. Which is more accurate and why?',
    options: [
      {
        id: 'a',
        text: 'Cross-sectional — it uses more data and a larger sample.',
        correct: false,
      },
      {
        id: 'b',
        text: 'Cohort analysis — cross-sectional analysis over-represents retained users because churned users are no longer in the current user base.',
        correct: true,
      },
      {
        id: 'c',
        text: 'Both are equivalent when sample sizes are balanced.',
        correct: false,
      },
      {
        id: 'd',
        text: 'Cross-sectional analysis — cohort analysis suffers from survivorship bias in newer cohorts.',
        correct: false,
      },
    ],
    explanation:
      'Cross-sectional retention analysis is biased upward because it only observes users who are currently active — it systematically excludes users who have already churned. This is survivorship bias: you are measuring retention among survivors, not among all users who ever started. Cohort analysis follows a defined group of users from their acquisition date forward, tracking true retention regardless of whether they later become inactive. Option D confuses the direction: cohort analysis actually suffers from incomplete data for newer cohorts (they have not had time to fully churn), but this does not make cross-sectional analysis more accurate.',
    tags: ['cohort-analysis', 'cross-sectional', 'survivorship-bias', 'retention'],
  },
  {
    id: 'mcq25',
    category: 'metrics',
    sourceRoom: 'metric-frameworks',
    difficulty: 'senior',
    question:
      'Slack\'s North Star metric is "number of messages sent." What is a key weakness of this metric as a North Star?',
    options: [
      { id: 'a', text: 'Messages sent cannot be measured accurately at scale.', correct: false },
      {
        id: 'b',
        text: 'It measures activity (output) rather than value delivered — high message volume could indicate communication inefficiency rather than productive collaboration.',
        correct: true,
      },
      { id: 'c', text: 'It is a lagging indicator and cannot guide real-time decisions.', correct: false },
      { id: 'd', text: 'It conflates new and existing users, making trend analysis unreliable.', correct: false },
    ],
    explanation:
      'An ideal North Star metric captures value delivered to users, not just activity. "Messages sent" can be gamed — spam bots, unnecessary pings, or a confusing UX that forces excessive back-and-forth all increase this metric without improving outcomes. A better proxy for Slack\'s value might be "teams reaching the \'connected\' threshold" (e.g., 2,000+ messages exchanged in a workspace, historically correlated with retention). Option C is wrong because all metrics are lagging to some degree, and this is not unique to message volume.',
    tags: ['north-star-metric', 'goodharts-law', 'metric-design', 'activity-vs-value'],
  },
  {
    id: 'mcq26',
    category: 'metrics',
    sourceRoom: 'metric-frameworks',
    difficulty: 'analyst',
    question:
      'Your signup funnel shows: Homepage → 100K visitors, Sign-up page → 60K, Email verified → 30K, Profile complete → 8K. Which step has the biggest relative drop-off and deserves immediate investigation?',
    options: [
      { id: 'a', text: 'Homepage to Sign-up page (40% drop-off)', correct: false },
      { id: 'b', text: 'Email verified to Profile complete (73% drop-off)', correct: true },
      { id: 'c', text: 'Sign-up page to Email verified (50% drop-off)', correct: false },
      { id: 'd', text: 'All steps have similar drop-off rates; investigate the full funnel holistically.', correct: false },
    ],
    explanation:
      'Relative drop-off rates: Homepage→Signup = 40%; Signup→Email = 50%; Email→Profile = (30K−8K)/30K = 73%. The Email→Profile step has the highest relative drop, indicating users who have already invested in verifying their email are still abandoning before completing their profile — suggesting the profile completion step is too long, unclear, or requires information users do not have ready. Higher absolute volumes at the top of the funnel naturally have larger absolute drops, but relative drop-off pinpoints friction relative to those who reached that step.',
    tags: ['funnel-analysis', 'drop-off', 'conversion', 'onboarding'],
  },
  {
    id: 'mcq27',
    category: 'growth',
    sourceRoom: 'growth-accounting',
    difficulty: 'senior',
    question:
      'A product team wants to improve DAU. They build a daily push notification that drives users to open the app. DAU goes up 15%, but 7-day retention drops 8%. How should you interpret this?',
    options: [
      {
        id: 'a',
        text: 'Net positive — DAU improvement outweighs the retention loss.',
        correct: false,
      },
      {
        id: 'b',
        text: 'Likely negative — the notifications are force-inflating DAU by annoying users into opening the app, causing accelerated churn.',
        correct: true,
      },
      {
        id: 'c',
        text: 'Neutral — DAU and retention measure different things and should not be compared.',
        correct: false,
      },
      {
        id: 'd',
        text: 'Run a longer experiment — short-term retention drops often recover.',
        correct: false,
      },
    ],
    explanation:
      'This is a classic "vanity metric vs. health metric" conflict. Push notifications that drag reluctant users back temporarily boost DAU but may degrade the user experience, causing them to churn faster. A drop in 7-day retention is a leading indicator that long-term user lifetime is being destroyed. If retention falls enough, the DAU gain is unsustainable and will eventually reverse. The right framework is to compute the projected LTV impact: does the +15% DAU persist long enough to offset the accelerated churn from -8% retention?',
    tags: ['notification-driven-dau', 'retention', 'vanity-metrics', 'engagement-quality'],
  },
  {
    id: 'mcq28',
    category: 'metrics',
    sourceRoom: 'metric-frameworks',
    difficulty: 'staff',
    question:
      'What is the difference between an activation metric and an engagement metric?',
    options: [
      { id: 'a', text: 'Activation metrics measure revenue; engagement metrics measure usage.', correct: false },
      {
        id: 'b',
        text: 'Activation metrics measure whether a new user has reached the "aha moment" (first value experience); engagement metrics measure ongoing interaction frequency and depth for all users.',
        correct: true,
      },
      { id: 'c', text: 'Activation is a one-time metric; engagement is measured continuously — they are otherwise identical in what they measure.', correct: false },
      { id: 'd', text: 'Engagement metrics apply only to B2C products; activation metrics apply to B2B.', correct: false },
    ],
    explanation:
      'Activation is a one-time milestone in the user lifecycle: the moment a new user first experiences the core value proposition (e.g., sending a first message on Slack, completing a first ride on Uber). Activation metrics predict long-term retention — users who activate typically have 2–4x higher 30-day retention. Engagement metrics (DAU, session length, feature depth) measure ongoing behavior across the entire user base, not just new users. Treating them interchangeably leads to optimizing for the wrong stage of the funnel.',
    tags: ['activation', 'engagement', 'aha-moment', 'user-lifecycle'],
  },
  {
    id: 'mcq29',
    category: 'growth',
    sourceRoom: 'growth-accounting',
    difficulty: 'senior',
    question:
      'Which of the following is the strongest signal of product-market fit in a consumer mobile app?',
    options: [
      { id: 'a', text: 'The app has been downloaded 1 million times in the first month.', correct: false },
      {
        id: 'b',
        text: 'Organic retention curves flatten above zero (users continue using the app without re-acquisition) and NPS exceeds 40.',
        correct: true,
      },
      { id: 'c', text: 'The app has received positive press coverage in major tech publications.', correct: false },
      { id: 'd', text: 'The team has achieved a 10% week-over-week DAU growth rate.', correct: false },
    ],
    explanation:
      'Product-market fit is best evidenced by organic, unprompted retention — users keep coming back because the product solves a real need, not because of paid acquisition or notifications. Flattening retention curves (even at a modest 20–30% long-run retention) combined with high NPS (users actively recommending) indicate genuine value. Downloads (Option A) measure marketing effectiveness, not fit. Press coverage (Option C) is a vanity signal. DAU growth (Option D) can be driven by paid channels regardless of fit.',
    tags: ['product-market-fit', 'retention', 'nps', 'organic-growth'],
  },
  {
    id: 'mcq30',
    category: 'metrics',
    sourceRoom: 'metric-frameworks',
    difficulty: 'analyst',
    question:
      'In a metric tree for an e-commerce site, Revenue = Visits × Conversion Rate × Average Order Value. If revenue drops 10%, which approach best diagnoses the root cause?',
    options: [
      { id: 'a', text: 'Immediately run an A/B test on the checkout flow.', correct: false },
      {
        id: 'b',
        text: 'Decompose each component: measure whether Visits, CR, or AOV changed, then segment each by device, geography, traffic source, and user segment.',
        correct: true,
      },
      { id: 'c', text: 'Compare this week\'s revenue to last year\'s same week.', correct: false },
      { id: 'd', text: 'Check server uptime and load times first — technical issues are the most common cause.', correct: false },
    ],
    explanation:
      'A metric tree diagnosis starts by isolating which leaf node changed. If Visits are stable, CR dropped, and AOV is stable, the problem lies in conversion — then you drill into CR by segment (mobile vs. desktop, new vs. returning, checkout step drop-off). Running an A/B test (Option A) makes sense only after you know what to test. Year-over-year comparison (Option C) helps contextualize but does not identify the root cause. Technical issues (Option D) are one possible cause but should be one branch of investigation, not the first assumption.',
    tags: ['metric-trees', 'root-cause-analysis', 'decomposition', 'revenue'],
  },

  // ─────────────────────────────────────────────
  // PRODUCT & PRIORITIZATION (mcq31 – mcq40)
  // ─────────────────────────────────────────────
  {
    id: 'mcq31',
    category: 'product',
    sourceRoom: 'prioritization-frameworks',
    difficulty: 'analyst',
    question:
      'The RICE scoring model ranks initiatives by (Reach × Impact × Confidence) / Effort. Project A has scores R=500, I=3, C=80%, E=2 weeks. Project B has R=2000, I=1, C=50%, E=4 weeks. Which has a higher RICE score?',
    options: [
      { id: 'a', text: 'Project A', correct: true },
      { id: 'b', text: 'Project B', correct: false },
      { id: 'c', text: 'They are equal.', correct: false },
      { id: 'd', text: 'Cannot be determined without knowing the unit of Impact.', correct: false },
    ],
    explanation:
      'Project A: (500 × 3 × 0.80) / 2 = 1200 / 2 = 600. Project B: (2000 × 1 × 0.50) / 4 = 1000 / 4 = 250. Project A scores 600 vs. Project B\'s 250. Despite reaching fewer users, Project A wins because its higher Impact score (3 vs 1) and higher Confidence (80% vs 50%) more than compensate for the smaller reach and shorter effort. RICE helps surface high-confidence, high-impact work over speculative broad-reach ideas.',
    tags: ['rice-scoring', 'prioritization', 'frameworks'],
  },
  {
    id: 'mcq32',
    category: 'product',
    sourceRoom: 'prioritization-frameworks',
    difficulty: 'analyst',
    question:
      'The ICE framework scores features by Impact × Confidence × Ease. What is a key critique of ICE compared to RICE?',
    options: [
      {
        id: 'a',
        text: 'ICE does not account for how many users will be affected, making two features with vastly different reach score equally if I, C, and E are identical.',
        correct: true,
      },
      {
        id: 'b',
        text: 'ICE conflates implementation Ease with business value, which can push low-effort but low-impact work to the top.',
        correct: false,
      },
      {
        id: 'c',
        text: 'ICE scores are not comparable across teams because Impact is subjectively defined by each scorer.',
        correct: false,
      },
      {
        id: 'd',
        text: 'ICE double-counts Confidence since Impact estimates already encode confidence.',
        correct: false,
      },
    ],
    explanation:
      'RICE adds a Reach dimension specifically to address ICE\'s blind spot: a feature affecting 10 users and a feature affecting 10 million users can have the same Impact-per-user score, but their total business value is wildly different. Omitting Reach biases ICE toward deep improvements for small segments. Option D is a reasonable philosophical critique but not the primary weakness commonly cited. ICE is actually faster than RICE (fewer inputs), making Option B incorrect.',
    tags: ['ice-framework', 'rice-scoring', 'prioritization', 'reach'],
  },
  {
    id: 'mcq33',
    category: 'product',
    sourceRoom: 'prioritization-frameworks',
    difficulty: 'senior',
    question:
      'Jobs to be Done (JTBD) theory argues that customers "hire" products to do a job. What does this imply for product roadmap decisions?',
    options: [
      {
        id: 'a',
        text: 'Products should be built for customer demographics (age, gender, location) since those predict the jobs customers need done.',
        correct: false,
      },
      {
        id: 'b',
        text: 'Roadmap decisions should prioritize the functional, social, and emotional dimensions of the job users are trying to accomplish, not feature requests at face value.',
        correct: true,
      },
      {
        id: 'c',
        text: 'JTBD implies building the minimum feature set and never adding functionality beyond the core job.',
        correct: false,
      },
      {
        id: 'd',
        text: 'JTBD is primarily useful for B2B products where jobs are clearly defined; it does not apply well to consumer apps.',
        correct: false,
      },
    ],
    explanation:
      'JTBD, popularized by Clayton Christensen, shifts focus from "who the customer is" to "what progress they are trying to make." Users hire a milkshake for the job of "keeping them occupied during a boring commute," not because they fit a demographic profile. This implies: surface the underlying motivation behind feature requests (e.g., "add more filters" might really be "help me find relevant content faster"), ensure roadmap items address the complete job (functional + emotional + social), and look for unexpected competitive alternatives that users currently hire for the same job.',
    tags: ['jobs-to-be-done', 'jtbd', 'product-strategy', 'user-motivation'],
  },
  {
    id: 'mcq34',
    category: 'product',
    sourceRoom: 'prioritization-frameworks',
    difficulty: 'senior',
    question:
      'A two-sided marketplace (e.g., Airbnb) has strong network effects. A competitor enters with a 20% price discount. Why is this less threatening than it would be for a non-network-effect business?',
    options: [
      {
        id: 'a',
        text: 'Two-sided marketplaces have regulatory protection against new entrants.',
        correct: false,
      },
      {
        id: 'b',
        text: 'Network effects create a defensible moat: the value of the platform comes from the density of participants, which a new entrant cannot replicate quickly even with lower prices.',
        correct: true,
      },
      {
        id: 'c',
        text: 'Price competition does not affect marketplace businesses because supply and demand automatically re-equilibrate.',
        correct: false,
      },
      {
        id: 'd',
        text: 'The 20% discount is insufficient to trigger significant multi-homing by participants.',
        correct: false,
      },
    ],
    explanation:
      'Network effects mean the product becomes more valuable as more participants join (more hosts → better selection for guests → more guests → more revenue for hosts → more hosts). A new entrant with lower prices starts with an empty marketplace — a guest would pay 20% less but find far fewer listings. Overcoming the incumbent\'s liquidity requires simultaneously acquiring both sides, which is expensive and slow. This is fundamentally different from a single-sided business where switching for a price discount is frictionless. Option D may be partly true but does not explain the structural defense.',
    tags: ['network-effects', 'marketplace', 'competitive-moat', 'two-sided-platforms'],
  },
  {
    id: 'mcq35',
    category: 'product',
    sourceRoom: 'prioritization-frameworks',
    difficulty: 'analyst',
    question:
      'You want to test whether users will pay for a new premium feature before building it. Which method is most appropriate?',
    options: [
      { id: 'a', text: 'A/B test the feature with full functionality on 50% of users.', correct: false },
      {
        id: 'b',
        text: 'Fake door (painted door) test — show the premium feature as available, measure click-through, then display a "coming soon" message to gauge demand without building.',
        correct: true,
      },
      { id: 'c', text: 'Survey existing users: "Would you pay $X for this feature?"', correct: false },
      { id: 'd', text: 'Launch the feature to all users for free to measure organic adoption before deciding on pricing.', correct: false },
    ],
    explanation:
      'A fake door test measures revealed preference (actual clicks on a buy/upgrade button) rather than stated preference (survey responses), which is far more predictive of real conversion. Users often say they would pay for something but do not when it launches. Building the full feature first (Option A) wastes engineering effort if demand is low. Option C (survey) measures intent, not behavior. Option D gives away value and creates a downgrade problem when you try to charge later. The fake door surfaces demand signal at near-zero development cost.',
    tags: ['fake-door-test', 'demand-validation', 'mvp', 'product-discovery'],
  },
  {
    id: 'mcq36',
    category: 'product',
    sourceRoom: 'prioritization-frameworks',
    difficulty: 'senior',
    question:
      'When writing OKRs, which of the following is the best Key Result?',
    options: [
      { id: 'a', text: 'Improve user experience in Q3.', correct: false },
      { id: 'b', text: 'Increase 30-day retention from 28% to 35% by end of Q3.', correct: true },
      { id: 'c', text: 'Launch the new onboarding flow by August 15.', correct: false },
      { id: 'd', text: 'Achieve strong product-market fit by Q3.', correct: false },
    ],
    explanation:
      'Good Key Results are outcomes (not outputs or activities), specific, measurable, time-bound, and ambitious but achievable. Option B specifies a current baseline (28%), a target (35%), and a deadline (Q3) — all required elements. Option A is vague and unmeasurable. Option C is an output (shipping something) not an outcome (user behavior change); shipping a feature does not guarantee retention improves. Option D is unmeasurable without defining what "strong PMF" means quantitatively.',
    tags: ['okrs', 'key-results', 'goal-setting', 'measurable-outcomes'],
  },
  {
    id: 'mcq37',
    category: 'product',
    sourceRoom: 'prioritization-frameworks',
    difficulty: 'staff',
    question:
      'You are analyzing feature usage and find that 70% of active users have never used Feature X in the past 90 days, and the 30% who do use it are your most active users overall. What does this suggest, and what is the right next step?',
    options: [
      {
        id: 'a',
        text: 'Feature X is underperforming and should be deprecated immediately.',
        correct: false,
      },
      {
        id: 'b',
        text: 'Feature X may be a power-user feature correlated with high engagement rather than a cause of it; investigate whether usage predicts retention after controlling for prior engagement (reverse causality check).',
        correct: true,
      },
      {
        id: 'c',
        text: 'Feature X is highly valuable and should be promoted to all users immediately.',
        correct: false,
      },
      {
        id: 'd',
        text: 'The 30% adoption rate is a definitive sign of poor discoverability; redesign the information architecture.',
        correct: false,
      },
    ],
    explanation:
      'Correlation between feature usage and engagement does not prove causation. The most active users use more features overall — Feature X may simply be one of many features they use, not the driver of their engagement. Before promoting or deprecating, you need to establish causality: do users who adopt Feature X become more retained, controlling for prior engagement level? This can be tested with an experiment that nudges lower-engagement users to try Feature X and measures subsequent retention. Option C risks wasting promotion resources on a feature that is a symptom, not a cause.',
    tags: ['feature-analytics', 'reverse-causality', 'dead-feature-detection', 'power-users'],
  },
  {
    id: 'mcq38',
    category: 'product',
    sourceRoom: 'prioritization-frameworks',
    difficulty: 'analyst',
    question:
      'What is the core principle of an MVP (Minimum Viable Product) as defined by Eric Ries?',
    options: [
      {
        id: 'a',
        text: 'Build the smallest possible version of the product to minimize engineering cost.',
        correct: false,
      },
      {
        id: 'b',
        text: 'A version of a product with just enough features to be usable by early customers who can provide feedback to guide future development.',
        correct: true,
      },
      {
        id: 'c',
        text: 'The simplest version of a product that can be shipped without embarrassing the team — polished enough for a public launch.',
        correct: false,
      },
      {
        id: 'd',
        text: 'A fully functional product scoped down to a single use case, built to acquire the first 1,000 users before expanding.',
        correct: false,
      },
    ],
    explanation:
      'Ries\' MVP is a learning vehicle, not a minimum engineering effort. The key word is "viable" — it must be good enough that real customers will use it and provide meaningful feedback, enabling validated learning. Option A (minimize cost) misses the learning objective: a cheaper product that nobody uses generates no signal. Option C (internal prototype) is a proof-of-concept, not an MVP. The MVP is explicitly about external validation, distinguishing it from both a prototype and a feature-complete product.',
    tags: ['mvp', 'lean-startup', 'product-discovery', 'validated-learning'],
  },
  {
    id: 'mcq39',
    category: 'product',
    sourceRoom: 'prioritization-frameworks',
    difficulty: 'senior',
    question:
      'You want to understand why users are churning from your B2C subscription app. Which combination of research methods provides the most complete picture?',
    options: [
      {
        id: 'a',
        text: 'NPS survey sent to all active users.',
        correct: false,
      },
      {
        id: 'b',
        text: 'Exit survey at cancellation (attitudinal) + cohort analysis of usage patterns before churn (behavioral) + user interviews with recently churned users.',
        correct: true,
      },
      {
        id: 'c',
        text: 'A/B test of different cancellation flows to reduce involuntary churn.',
        correct: false,
      },
      {
        id: 'd',
        text: 'Heatmap analysis of the cancellation page to find friction.',
        correct: false,
      },
    ],
    explanation:
      'Understanding churn requires both attitudinal data (what users say: exit survey, interviews) and behavioral data (what users do: usage pattern analysis before churning). Exit surveys capture stated reasons; behavioral analysis reveals whether those reasons are accurate (e.g., "I did not use it enough" can be verified by declining session frequency). User interviews add depth and uncover unarticulated needs. NPS (Option A) surveys active users — the wrong population for churn diagnosis. Options C and D address only the cancellation flow, not the underlying product reasons for churn.',
    tags: ['churn-analysis', 'attitudinal-data', 'behavioral-data', 'mixed-methods'],
  },
  {
    id: 'mcq40',
    category: 'product',
    sourceRoom: 'prioritization-frameworks',
    difficulty: 'staff',
    question:
      'A PM is segmenting users for an analytics dashboard. They create segments by demographics (age, geography) rather than by behavior (feature usage, engagement level). What is the key limitation of demographic segmentation for product decisions?',
    options: [
      {
        id: 'a',
        text: 'Demographic data is a lagging indicator — it reflects who users were when they signed up, not how they currently behave.',
        correct: false,
      },
      {
        id: 'b',
        text: 'Demographic segments are internally heterogeneous in product behavior — users with different usage patterns but the same demographics require different product interventions.',
        correct: true,
      },
      {
        id: 'c',
        text: 'Demographic segments are useful for understanding the market but do not change across the user lifecycle, making them less actionable for retention campaigns.',
        correct: false,
      },
      {
        id: 'd',
        text: 'Demographic data is often self-reported and unreliable, so behavioral proxies are always more accurate.',
        correct: false,
      },
    ],
    explanation:
      'Demographic groups are heterogeneous in terms of product behavior: a 25-year-old in San Francisco can be a power user, a dormant user, or someone who signed up and never returned. Behavioral segmentation (new vs. activated vs. retained vs. churned; light vs. heavy user; used feature A vs. not) creates groups that are homogeneous in the behavior you want to change, enabling targeted interventions. JTBD theory reinforces this: the "job" a user is hiring your product for is better predicted by behavioral context than demographics. Option C is incorrect — demographic data can be used in analytics within GDPR constraints.',
    tags: ['user-segmentation', 'behavioral-segmentation', 'product-analytics', 'demographics'],
  },
];

// ─────────────────────────────────────────────
// Derived exports for fast lookup
// ─────────────────────────────────────────────

export const trainerMCQById = Object.fromEntries(
  trainerMCQ.map((q) => [q.id, q])
);

export const trainerMCQByCategory = trainerMCQ.reduce((acc, q) => {
  if (!acc[q.category]) acc[q.category] = [];
  acc[q.category].push(q);
  return acc;
}, {});
