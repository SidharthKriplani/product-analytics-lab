export const STUDY_CARDS = [
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is a p-value and what does it not tell you?",
    "back": "\u2022 p-value \u2014 probability of observing data at least as extreme as yours, assuming the null is true. \u2022 Does NOT tell you \u2014 probability that the null is true, probability that the alternative is true, effect size, practical significance. \u2022 p < 0.05 is a convention, not a law. \u2022 Common trap \u2014 p-value depends on sample size \u2014 large n makes tiny effects significant.",
    "source": "viltrumite",
    "priority": 1,
    "id": 1
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is statistical power and what factors increase it?",
    "back": "\u2022 Power = P(reject null. \u2022 null is false) = 1 \u2212 \u03b2. \u2022 Increases with \u2014 larger sample size, larger true effect size, lower \u03c3 (noise), higher \u03b1. \u2022 Low power \u2192 high false negative rate \u2014 you miss real effects. \u2022 Underpowered studies \u2014 common in analytics \u2014 too small n to detect meaningful MDE. \u2022 Power is set before the experiment, not computed after.",
    "source": "viltrumite",
    "priority": 1,
    "id": 2
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is the Central Limit Theorem and when does it fail?",
    "back": "\u2022 CLT \u2014 sum (or mean) of n independent, identically distributed RVs \u2192 normally distributed as n \u2192 \u221e. \u2022 Enables use of z-tests and t-tests on non-normal data with large n. \u2022 Fails when \u2014 data is heavy-tailed (variance infinite), data is not independent, n is small and distribution is very skewed. \u2022 Practical rule \u2014 n \u2265 30 for reasonable approximation for many distributions.",
    "source": "viltrumite",
    "priority": 1,
    "id": 3
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is the difference between confidence interval and credible interval?",
    "back": "\u2022 CI (frequentist) \u2014 if you repeated the experiment many times, 95% of constructed intervals would contain the true parameter \u2014 says nothing about this specific interval. \u2022 Credible interval (Bayesian) \u2014 95% probability that the parameter lies in this interval, given the data and prior. \u2022 Common trap \u2014 saying \"there is 95% probability the true value is in this CI\" \u2014 this is the Bayesian interpretation, not the frequentist one.",
    "source": "viltrumite",
    "priority": 1,
    "id": 4
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is the Law of Large Numbers?",
    "back": "\u2022 LLN \u2014 as sample size grows, sample mean converges to population mean. \u2022 Weak LLN \u2014 convergence in probability. \u2022 Strong LLN \u2014 almost sure convergence. \u2022 Enables empirical estimation of expectations. \u2022 Common trap \u2014 does not apply with infinite-variance distributions (e.g., Cauchy).",
    "source": "viltrumite",
    "priority": 1,
    "id": 5
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is Simpson's Paradox and what causes it?",
    "back": "\u2022 A trend present in all subgroups reverses when data is aggregated. \u2022 Caused by a confounding variable that affects both group membership and the outcome. \u2022 Classic example \u2014 drug appears harmful overall but helpful in every subgroup separately. \u2022 How to fix it \u2014 stratify by the confounder; do not aggregate without checking composition. \u2022 Always check whether subgroup proportions differ between groups being compared.",
    "source": "viltrumite",
    "priority": 1,
    "id": 6
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is Bayes' theorem and what are its components?",
    "back": "\u2022 P(A. \u2022 B) = P(B. \u2022 A) \u00d7 P(A) / P(B). \u2022 P(A) \u2014 prior \u2014 belief before evidence. \u2022 P(B. \u2022 A) \u2014 likelihood \u2014 probability of evidence given hypothesis. \u2022 P(A. \u2022 B) \u2014 posterior \u2014 updated belief after evidence. \u2022 P(B) \u2014 marginal likelihood / normalizing constant. \u2022 Used in spam filters, naive Bayes, Bayesian updating, medical diagnostics.",
    "source": "viltrumite",
    "priority": 1,
    "id": 7
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is the difference between standard deviation and standard error?",
    "back": "\u2022 SD \u2014 measures spread of individual observations around the mean. \u2022 SE \u2014 measures uncertainty in the sample mean = SD / \u221an. \u2022 SE shrinks with more data; SD does not. \u2022 Common trap \u2014 reporting SE instead of SD makes precision look artificially high. \u2022 Use SE when discussing the mean estimate; use SD when describing the data distribution.",
    "source": "viltrumite",
    "priority": 1,
    "id": 8
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is covariance vs correlation and when is correlation misleading?",
    "back": "\u2022 Covariance \u2014 measures joint variability of two variables \u2014 scale-dependent. \u2022 Correlation \u2014 standardized covariance, range [\u22121, 1] \u2014 scale-free. \u2022 Pearson correlation measures linear association only. \u2022 Misleading when \u2014 relationship is non-linear, outliers are present (one outlier can dominate), Anscombe&#x27;s quartet. \u2022 Zero correlation does not imply independence (unless jointly normal).",
    "source": "viltrumite",
    "priority": 1,
    "id": 9
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is a t-test and when should you use Welch's t-test?",
    "back": "\u2022 t-test \u2014 tests whether means of two groups differ significantly. \u2022 Student&#x27;s t-test \u2014 assumes equal variance across groups. \u2022 Welch&#x27;s t-test \u2014 does not assume equal variance \u2014 adjusts degrees of freedom. \u2022 Use Welch&#x27;s by default \u2014 no penalty when variances are equal, but protects when they aren&#x27;t. \u2022 Common trap \u2014 using Student&#x27;s t-test when group variances differ \u2192 inflated Type I error.",
    "source": "viltrumite",
    "priority": 1,
    "id": 10
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is the multiple comparisons problem and how is it corrected?",
    "back": "\u2022 Testing k hypotheses at \u03b1 each \u2192 probability of \u2265 1 false positive = 1 \u2212 (1\u2212\u03b1)^k. \u2022 At \u03b1=0.05, 20 tests \u2192 ~64% chance of a false positive. \u2022 Bonferroni correction \u2014 \u03b1_adjusted = \u03b1 / k \u2014 conservative but simple. \u2022 Benjamini-Hochberg (FDR) \u2014 controls false discovery rate \u2014 less conservative, better for large k. \u2022 Common trap \u2014 choosing which tests to report based on results is a form of multiple testing.",
    "source": "viltrumite",
    "priority": 1,
    "id": 11
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is a null hypothesis and what are its two possible outcomes?",
    "back": "\u2022 Null hypothesis (H\u2080) \u2014 default assumption \u2014 typically \"no effect\" or \"no difference\". \u2022 Outcomes \u2014 reject H\u2080 (evidence against null) or fail to reject H\u2080 (insufficient evidence). \u2022 Failing to reject \u2260 accepting the null \u2014 absence of evidence \u2260 evidence of absence. \u2022 Common trap \u2014 saying \"we proved there is no effect\" after a non-significant result.",
    "source": "viltrumite",
    "priority": 1,
    "id": 12
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is the difference between parametric and non-parametric statistical tests?",
    "back": "\u2022 Parametric \u2014 assume data follows a distribution (usually normal) \u2014 t-test, ANOVA, Pearson. \u2022 Non-parametric \u2014 no distributional assumption \u2014 Mann-Whitney U, Wilcoxon, Spearman. \u2022 Non-parametric tests use ranks rather than raw values. \u2022 Use non-parametric when \u2014 small sample, heavy tails, ordinal data, distributional assumptions violated. \u2022 Tradeoff \u2014 non-parametric tests have lower power when parametric assumptions are actually met.",
    "source": "viltrumite",
    "priority": 1,
    "id": 13
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is the expected value and how does linearity of expectation work?",
    "back": "\u2022 E[X] \u2014 weighted average of all possible values \u2014 sum(x \u00d7 P(x)). \u2022 Linearity \u2014 E[aX + bY] = aE[X] + bE[Y] \u2014 holds even if X and Y are dependent. \u2022 Useful for computing expectations of complex sums without knowing joint distribution. \u2022 Applies to \u2014 random algorithms, hashing, estimation problems.",
    "source": "viltrumite",
    "priority": 1,
    "id": 14
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is a z-score and how is it used for anomaly detection?",
    "back": "\u2022 z-score = (x \u2212 \u03bc) / \u03c3 \u2014 number of standard deviations from the mean. \u2022 . \u2022 z. \u2022 > 2 \u2014 ~5% of data under normality. \u2022 . \u2022 z. \u2022 > 3 \u2014 ~0.3% of data \u2014 common anomaly threshold. \u2022 Trap on seasonal data \u2014 comparing to wrong baseline inflates false positives. \u2022 How to fix it \u2014 compute z-score within day-of-week cohort or rolling window.",
    "source": "viltrumite",
    "priority": 1,
    "id": 15
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is variance and why is E[X\u00b2] \u2260 (E[X])\u00b2?",
    "back": "\u2022 Variance = E[(X \u2212 \u03bc)\u00b2] = E[X\u00b2] \u2212 (E[X])\u00b2. \u2022 The gap between E[X\u00b2] and (E[X])\u00b2 measures how spread out X is. \u2022 Var(X) = 0 iff X is a constant. \u2022 Var(aX + b) = a\u00b2Var(X) \u2014 shifting does not change variance, scaling does. \u2022 Var(X + Y) = Var(X) + Var(Y) + 2Cov(X,Y).",
    "source": "viltrumite",
    "priority": 1,
    "id": 16
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is a heavy-tailed distribution and why does it matter?",
    "back": "\u2022 Heavy-tailed \u2014 probability of extreme values decays slower than exponential. \u2022 Examples \u2014 Pareto, log-normal, power law. \u2022 Sample mean has high variance \u2014 CLT converges slowly or not at all (infinite-variance case). \u2022 Common in \u2014 revenue, social network connections, internet traffic. \u2022 Common trap \u2014 applying normal-distribution tools to heavy-tailed data underestimates tail risk.",
    "source": "viltrumite",
    "priority": 1,
    "id": 17
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is the difference between MLE and method of moments?",
    "back": "\u2022 MLE \u2014 choose parameters that maximize likelihood of observed data. \u2022 Method of moments \u2014 set theoretical moments equal to sample moments and solve. \u2022 MLE is asymptotically efficient (achieves Cram\u00e9r-Rao lower bound) \u2014 preferred when n is large. \u2022 Method of moments \u2014 simpler to compute, less efficient. \u2022 For some distributions (e.g., beta, gamma), both give closed-form solutions.",
    "source": "viltrumite",
    "priority": 1,
    "id": 18
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is a sufficient statistic?",
    "back": "\u2022 A statistic T(X) is sufficient for \u03b8 if P(X. \u2022 T(X)) does not depend on \u03b8. \u2022 Contains all information in the data about the parameter \u2014 no information lost by reducing to T. \u2022 Example \u2014 sample mean is sufficient for \u03bc in a normal distribution with known \u03c3. \u2022 Fisher-Neyman factorization theorem: formal condition for sufficiency. \u2022 Used to justify why summary statistics capture everything needed for inference.",
    "source": "viltrumite",
    "priority": 1,
    "id": 19
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is overfitting in a statistical model vs a machine learning model?",
    "back": "\u2022 Both \u2014 model fits noise in training data \u2014 high in-sample fit, poor out-of-sample performance. \u2022 Statistical framing \u2014 model has too many parameters relative to sample size. \u2022 ML framing \u2014 model has too high capacity relative to data complexity. \u2022 Detection \u2014 large train-test gap; validation curve peaks then degrades. \u2022 Fix (stats) \u2014 fewer parameters, regularization, cross-validation, information criteria (AIC, BIC).",
    "source": "viltrumite",
    "priority": 1,
    "id": 20
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is AIC and BIC and when does each favor simpler models?",
    "back": "\u2022 AIC = 2k \u2212 2ln(L\u0302) \u2014 penalizes model complexity, selects model that balances fit and parsimony. \u2022 BIC = k\u00d7ln(n) \u2212 2ln(L\u0302) \u2014 stronger penalty as n grows. \u2022 BIC selects simpler models than AIC when n is large. \u2022 Use AIC when \u2014 prediction is the goal; use BIC when: identifying the true model is the goal. \u2022 Both reward fit and penalize parameters \u2014 minimize to select.",
    "source": "viltrumite",
    "priority": 1,
    "id": 21
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is the difference between frequentist and Bayesian inference philosophically?",
    "back": "\u2022 Frequentist \u2014 probability = long-run frequency of events; parameters are fixed, unknown constants. \u2022 Bayesian \u2014 probability = degree of belief; parameters have distributions; prior + likelihood \u2192 posterior. \u2022 Frequentist \u2014 can&#x27;t assign probability to a single hypothesis being true. \u2022 Bayesian \u2014 naturally handles small samples, sequential updating, and prior knowledge. \u2022 Both are valid frameworks with different assumptions and outputs.",
    "source": "viltrumite",
    "priority": 1,
    "id": 22
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is the law of total expectation?",
    "back": "\u2022 E[X] = E[E[X. \u2022 Y]] \u2014 the expectation of X equals the expectation of its conditional expectation given Y. \u2022 Useful for \u2014 computing expectations by conditioning on a simpler RV. \u2022 Example \u2014 E[revenue] = E[E[revenue. \u2022 user_segment]] \u2014 compute per segment then average. \u2022 Also known as the tower property or law of iterated expectations.",
    "source": "viltrumite",
    "priority": 1,
    "id": 23
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is heteroscedasticity and why does it violate OLS assumptions?",
    "back": "\u2022 Heteroscedasticity \u2014 variance of residuals is not constant across observations. \u2022 OLS assumes homoscedasticity (constant variance). \u2022 Effect \u2014 OLS estimates remain unbiased but standard errors are wrong \u2014 hypothesis tests invalid. \u2022 Detection \u2014 plot residuals vs fitted values; Breusch-Pagan test. \u2022 How to fix it \u2014 robust standard errors (HC estimators) or transform the outcome variable.",
    "source": "viltrumite",
    "priority": 1,
    "id": 24
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is a bootstrap and when is it useful?",
    "back": "\u2022 Bootstrap \u2014 repeatedly resample (with replacement) from data, compute statistic each time, use distribution for inference. \u2022 Useful when \u2014 analytical distribution of statistic is unknown, sample is small. \u2022 Provides empirical SE and CI without distributional assumptions. \u2022 Common trap \u2014 does not add information \u2014 if original sample is biased, bootstrap inherits that bias. \u2022 Computational cost \u2014 needs many iterations (1000\u201310000 typical).",
    "source": "viltrumite",
    "priority": 1,
    "id": 25
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is the Cram\u00e9r-Rao lower bound?",
    "back": "\u2022 Lower bound on the variance of any unbiased estimator of \u03b8. \u2022 Var(\u03b8\u0302) \u2265 1 / I(\u03b8) where I(\u03b8) is the Fisher information. \u2022 An estimator achieving this bound is called efficient. \u2022 MLE is asymptotically efficient \u2014 achieves CRLB as n \u2192 \u221e. \u2022 Tells you the best possible precision any unbiased estimator can achieve.",
    "source": "viltrumite",
    "priority": 1,
    "id": 26
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is a minimum detectable effect (MDE) and how is it used before an experiment?",
    "back": "\u2022 MDE \u2014 smallest true effect the experiment can reliably detect at given power and \u03b1. \u2022 Computed from \u2014 baseline metric variance, sample size, \u03b1, desired power. \u2022 If business-meaningful effect < MDE \u2192 experiment is underpowered before it starts. \u2022 Purpose \u2014 sanity-check that the experiment is worth running. \u2022 Common trap \u2014 computing MDE after results arrive is post-hoc rationalization.",
    "source": "viltrumite",
    "priority": 0,
    "id": 27
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is CUPED and what statistical property makes it work?",
    "back": "\u2022 CUPED \u2014 Controlled-experiment Using Pre-Experiment Data. \u2022 Adjusts metric \u2014 Y_cuped = Y \u2212 \u03b8(X \u2212 E[X]) where X is a pre-experiment covariate. \u2022 \u03b8 = Cov(Y, X) / Var(X) \u2014 removes variance explained by pre-existing user differences. \u2022 Works because \u2014 Y_cuped has same expected value as Y but lower variance. \u2022 Variance reduction \u2014 typically 20\u201350% \u2192 narrower CIs \u2192 smaller sample needed.",
    "source": "viltrumite",
    "priority": 0,
    "id": 28
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is the peeking problem and what is the correct fix?",
    "back": "\u2022 Peeking \u2014 running a significance test repeatedly and stopping when p < \u03b1. \u2022 Each check is an additional test \u2014 family-wise error rate inflates. \u2022 14 daily checks at \u03b1=0.05 \u2192 actual FPR \u2248 51%, not 5%. \u2022 Fix 1 \u2014 pre-specify n and evaluate once at experiment end. \u2022 Fix 2 \u2014 sequential testing (mSPRT, e-values) \u2014 provides always-valid p-values under repeated testing.",
    "source": "viltrumite",
    "priority": 0,
    "id": 29
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is a guardrail metric and how does it affect experiment decisions?",
    "back": "\u2022 Guardrail metric \u2014 one where harm is asymmetric \u2014 even small negative impact is unacceptable. \u2022 Examples \u2014 page load time, error rate, unsubscribe rate. \u2022 A guardrail violation \u2192 experiment held regardless of primary metric result. \u2022 Guardrail check \u2014 CI for guardrail metric must not include negative effect beyond tolerance. \u2022 Common trap \u2014 only checking primary metric and shipping experiments that silently degrade latency.",
    "source": "viltrumite",
    "priority": 0,
    "id": 30
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is network effect contamination in A/B testing (SUTVA violation)?",
    "back": "\u2022 SUTVA \u2014 Stable Unit Treatment Value Assumption \u2014 one unit&#x27;s outcome unaffected by others&#x27; treatment. \u2022 Violated when \u2014 users interact (social network, marketplace, messaging). \u2022 Treatment group users affect control group behavior \u2192 both groups contaminated. \u2022 How to fix it \u2014 cluster-based randomization (randomize at group level, not user level). \u2022 Common trap \u2014 any social/collaborative product is at risk \u2014 often overlooked.",
    "source": "viltrumite",
    "priority": 0,
    "id": 31
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is a novelty effect in experiments and how do you detect it?",
    "back": "\u2022 Novelty effect \u2014 metric improves in week 1 purely because the feature is new, not because it is better. \u2022 Decay \u2014 improvement diminishes as novelty wears off in weeks 2\u20133. \u2022 Detection \u2014 weekly cohort analysis \u2014 compare week 1 lift to week 2\u20133 lift. \u2022 If week-1 lift > 2\u00d7 week-2 lift, flag as potential novelty. \u2022 How to fix it \u2014 run experiment long enough for novelty to decay before evaluating.",
    "source": "viltrumite",
    "priority": 0,
    "id": 32
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is the difference between a primary metric and a secondary metric in an experiment?",
    "back": "\u2022 Primary metric \u2014 the single metric the experiment is designed to move \u2014 drives the ship/hold decision. \u2022 Secondary metrics \u2014 directional indicators \u2014 provide context but do not drive decision alone. \u2022 Only primary metric undergoes the pre-specified significance test. \u2022 Multiple testing correction applies if multiple metrics are tested for significance simultaneously. \u2022 Common trap \u2014 deciding which metric is \"primary\" after seeing results \u2014 HARKing.",
    "source": "viltrumite",
    "priority": 0,
    "id": 33
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is an A/A test and why is it run?",
    "back": "\u2022 A/A test \u2014 two identical groups \u2014 no treatment difference. \u2022 Purpose \u2014 validate that randomization is correct and false positive rate matches \u03b1. \u2022 Expected \u2014 ~5% of A/A tests should show p < 0.05 by chance. \u2022 If A/A produces consistent significant results: randomization is broken or system bug. \u2022 Also used to measure baseline variance for sample size planning.",
    "source": "viltrumite",
    "priority": 0,
    "id": 34
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is stratified randomization and why is it better than pure random assignment?",
    "back": "\u2022 Stratified \u2014 ensure treatment/control groups are balanced on key dimensions (country, platform, user tenure). \u2022 Pure random \u2014 can produce imbalanced groups by chance, especially with small n. \u2022 Imbalanced groups \u2192 confounded results \u2014 group difference drives metric, not treatment. \u2022 Stratification reduces variance in the treatment effect estimate. \u2022 Must be pre-specified \u2014 post-hoc balancing checks are not the same.",
    "source": "viltrumite",
    "priority": 0,
    "id": 35
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is the difference between within-subject and between-subject experimental design?",
    "back": "\u2022 Within-subject \u2014 same unit receives both treatment and control (crossover design). \u2022 Between-subject \u2014 different units in treatment vs control. \u2022 Within-subject \u2014 higher statistical power (removes between-unit variance), but order effects and carryover are risks. \u2022 Between-subject \u2014 cleaner causal isolation, no carryover, but needs more units. \u2022 Most online experiments are between-subject.",
    "source": "viltrumite",
    "priority": 0,
    "id": 36
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is Bonferroni correction and when is it too conservative?",
    "back": "\u2022 Bonferroni \u2014 \u03b1_adjusted = \u03b1 / k for k simultaneous tests. \u2022 Controls family-wise error rate (FWER) \u2014 probability of any false positive. \u2022 Very conservative when k is large: if testing 100 metrics, \u03b1 per test = 0.0005. \u2022 Too conservative when \u2014 tests are correlated, or when controlling individual FDR is sufficient. \u2022 Alternative \u2014 Benjamini-Hochberg (BH) controls FDR \u2014 less conservative for large k.",
    "source": "viltrumite",
    "priority": 0,
    "id": 37
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is the difference between statistical significance and practical significance?",
    "back": "\u2022 Statistical significance \u2014 p < \u03b1 \u2014 result is unlikely under null hypothesis. \u2022 Practical significance \u2014 effect size is large enough to matter for the business. \u2022 Large n makes tiny effects statistically significant \u2014 a 0.01% conversion lift can have p < 0.001. \u2022 Both are necessary before shipping \u2014 statistical significance alone is not enough. \u2022 Report effect size with CI, not just p-value.",
    "source": "viltrumite",
    "priority": 0,
    "id": 38
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is a holdout group and how is it different from a control group?",
    "back": "\u2022 Control group \u2014 receives no treatment in a specific experiment. \u2022 Holdout group \u2014 permanently excluded from all experiments \u2014 measures long-term baseline. \u2022 Holdout enables estimating cumulative experiment impact over time. \u2022 Without holdout \u2014 experiment effects compound, hard to measure true baseline drift. \u2022 Expensive \u2014 holdout means withholding potentially good features from those users.",
    "source": "viltrumite",
    "priority": 0,
    "id": 39
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is variance reduction and why does it matter for experiment sensitivity?",
    "back": "\u2022 Variance reduction \u2014 lowering noise in the metric estimate \u2192 narrower CIs \u2192 same n detects smaller effects. \u2022 Methods \u2014 CUPED (pre-experiment covariate), stratification, delta method for ratio metrics. \u2022 Halving variance \u2192 can detect same MDE with half the sample, or detect 1/\u221a2 \u00d7 MDE with same sample. \u2022 Practical impact \u2014 faster experiments, smaller required n, more experiments per quarter. \u2022 Common trap \u2014 using post-experiment data as covariate \u2014 this is leakage.",
    "source": "viltrumite",
    "priority": 0,
    "id": 40
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is a ratio metric and what is the delta method?",
    "back": "\u2022 Ratio metric \u2014 Y = A/B where both A and B are random (e.g., revenue per user, CTR). \u2022 Naive variance \u2014 treating ratio as a single value ignores correlation between A and B. \u2022 Delta method \u2014 approximates Var(A/B) using first-order Taylor expansion. \u2022 Var(A/B) \u2248 (1/\u03bc_B)\u00b2Var(A) + (\u03bc_A/\u03bc_B\u00b2)\u00b2Var(B) \u2212 2(\u03bc_A/\u03bc_B\u00b3)Cov(A,B). \u2022 Common trap \u2014 standard t-test on ratio metrics without delta method \u2192 incorrect standard errors.",
    "source": "viltrumite",
    "priority": 0,
    "id": 41
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is HARKing and why is it a threat to experiment validity?",
    "back": "\u2022 HARKing \u2014 Hypothesizing After Results are Known. \u2022 Example \u2014 experiment finishes, you look at 20 metrics, find 2 significant, then write hypothesis around those 2. \u2022 Produces inflated false positive rate \u2014 post-hoc hypothesis matching is not confirmatory. \u2022 How to fix it \u2014 pre-register hypothesis, primary metric, and analysis plan before experiment starts. \u2022 Common in analytics \u2014 \"we looked at segments and found that mobile users in India improved significantly\".",
    "source": "viltrumite",
    "priority": 0,
    "id": 42
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is a sequential test (mSPRT) and how does it differ from a fixed-horizon test?",
    "back": "\u2022 Fixed-horizon \u2014 sample size decided upfront; test once at the end \u2014 valid but inflexible. \u2022 Sequential (mSPRT) \u2014 test at any time during the experiment \u2014 p-values remain valid under repeated testing. \u2022 mSPRT uses a mixture sequential probability ratio test \u2014 controls Type I error at any stopping point. \u2022 E-values \u2014 alternative formulation; composable and easier to reason about. \u2022 Tradeoff \u2014 sequential tests have slightly lower power than fixed-horizon at the predetermined n.",
    "source": "viltrumite",
    "priority": 0,
    "id": 43
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is experiment interaction and how does running simultaneous experiments cause problems?",
    "back": "\u2022 Interaction \u2014 two simultaneous experiments affect the same users and their effects are not independent. \u2022 If experiment A increases engagement and experiment B tests a feature that depends on engagement, results are confounded. \u2022 How to fix it \u2014 experiment isolation via mutual exclusion layers; or test for interaction effects explicitly. \u2022 Mutual exclusion reduces available traffic per experiment \u2014 tradeoff with speed.",
    "source": "viltrumite",
    "priority": 0,
    "id": 44
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is the difference between intention-to-treat (ITT) and per-protocol analysis?",
    "back": "\u2022 ITT \u2014 analyze all users as assigned, regardless of whether they actually received treatment. \u2022 Per-protocol \u2014 analyze only users who complied with their assignment. \u2022 ITT \u2014 conservative, avoids selection bias from non-compliance \u2014 preferred for most online experiments. \u2022 Per-protocol \u2014 can estimate effect among compliers but introduces selection bias. \u2022 Common trap \u2014 switching to per-protocol when ITT shows no effect to rescue a null result.",
    "source": "viltrumite",
    "priority": 0,
    "id": 45
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is a trigger condition in experimentation and why does it matter for statistical validity?",
    "back": "\u2022 Trigger condition \u2014 rule that determines which users are exposed to the experiment. \u2022 Only users who can be meaningfully affected by the treatment should be in the analysis. \u2022 Including non-triggered users dilutes the effect \u2014 reduces power and distorts estimates. \u2022 Common trap \u2014 defining trigger condition post-hoc to include/exclude subsets based on results. \u2022 Must be pre-specified and applied consistently to treatment and control.",
    "source": "viltrumite",
    "priority": 0,
    "id": 46
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is the fundamental problem of causal inference?",
    "back": "\u2022 You can never observe both potential outcomes Y(1) and Y(0) for the same unit. \u2022 ATE = E[Y(1) \u2212 Y(0)] is unobservable at individual level. \u2022 Randomization makes E[Y(0). \u2022 T=1] = E[Y(0). \u2022 T=0] in expectation \u2014 identifies ATE. \u2022 All causal methods are workarounds for this missing counterfactual problem. \u2022 Without identification assumption, no method recovers causal effect.",
    "source": "viltrumite",
    "priority": 1,
    "id": 47
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is selection bias in causal estimation?",
    "back": "\u2022 Selection bias \u2014 units select into treatment non-randomly based on factors related to outcome. \u2022 Makes treated and untreated groups systematically different \u2014 naive comparison biased. \u2022 Example \u2014 users who opt into a new feature are already more engaged. \u2022 How to fix it \u2014 RCT (randomization removes selection bias), or observational methods that model selection. \u2022 Common trap \u2014 observational data is almost always subject to selection bias.",
    "source": "viltrumite",
    "priority": 1,
    "id": 48
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is the difference between ATE, ATT, and LATE?",
    "back": "\u2022 ATE \u2014 Average Treatment Effect \u2014 causal effect averaged over the full population. \u2022 ATT \u2014 Average Treatment Effect on the Treated \u2014 causal effect among those who received treatment. \u2022 LATE \u2014 Local Average Treatment Effect \u2014 effect among compliers (those induced by instrument to switch). \u2022 ATT \u2260 ATE when treatment effect is heterogeneous and selection is non-random. \u2022 LATE is what IV identifies \u2014 not always the policy-relevant parameter.",
    "source": "viltrumite",
    "priority": 1,
    "id": 49
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is the difference-in-differences estimator and what does it assume?",
    "back": "\u2022 DiD \u2014 compares change in outcome for treatment group to change in control group over time. \u2022 DiD estimate = (treated post \u2212 treated pre) \u2212 (control post \u2212 control pre). \u2022 Key assumption \u2014 parallel trends \u2014 without treatment, both groups would have evolved identically. \u2022 Parallel trends is untestable in the post-period; assessed via pre-period trend comparison. \u2022 Fails when \u2014 confounding trends differ, treatment timing is endogenous.",
    "source": "viltrumite",
    "priority": 1,
    "id": 50
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is an instrumental variable and when is it valid?",
    "back": "\u2022 IV \u2014 variable Z that affects treatment T but affects outcome Y only through T. \u2022 Relevance \u2014 Z must be correlated with T (testable). \u2022 Exclusion restriction \u2014 Z affects Y only via T \u2014 untestable, requires domain argument. \u2022 IV estimate identifies LATE (effect among compliers). \u2022 Classic examples \u2014 draft lottery for military service, distance to college for education returns.",
    "source": "viltrumite",
    "priority": 1,
    "id": 51
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is a confounder and how does it bias causal estimates?",
    "back": "\u2022 Confounder \u2014 variable that causes both treatment and outcome. \u2022 Creates spurious correlation between treatment and outcome in observational data. \u2022 Example \u2014 healthier people exercise more AND have better outcomes \u2014 health status confounds exercise \u2192 outcome. \u2022 How to fix it \u2014 control for confounder in regression, match on it, or use RCT that breaks confounding. \u2022 Unobserved confounders cannot be controlled for \u2014 requires IV or other design.",
    "source": "viltrumite",
    "priority": 1,
    "id": 52
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is regression discontinuity design (RDD) and what is its key assumption?",
    "back": "\u2022 RDD \u2014 compare outcomes just above and just below a threshold that determines treatment. \u2022 Assumes \u2014 units just above and just below threshold are similar on all dimensions except treatment. \u2022 Sharp RDD \u2014 treatment deterministically assigned at threshold. \u2022 Fuzzy RDD \u2014 treatment probability jumps at threshold \u2014 use IV methods. \u2022 Validity threats \u2014 manipulation of the running variable, other policies changing at the same threshold.",
    "source": "viltrumite",
    "priority": 1,
    "id": 53
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is propensity score matching and what are its limitations?",
    "back": "\u2022 Propensity score \u2014 P(T=1. \u2022 X) \u2014 probability of treatment given covariates. \u2022 Matching \u2014 pair treated and control units with similar propensity scores. \u2022 Removes selection bias on observed covariates. \u2022 Limitation 1 \u2014 unobserved confounders not addressed \u2014 only controls for what&#x27;s measured. \u2022 Limitation 2 \u2014 overlap assumption \u2014 must have treated and control units at all propensity score values. \u2022 Common trap \u2014 large covariate sets \u2192 propensity score well-estimated but overlap fails.",
    "source": "viltrumite",
    "priority": 1,
    "id": 54
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is a DAG (Directed Acyclic Graph) and how is it used in causal reasoning?",
    "back": "\u2022 DAG \u2014 nodes are variables, directed edges are causal relationships, no cycles. \u2022 Used to \u2014 identify confounders, colliders, and mediators formally. \u2022 d-separation \u2014 determines which variables are conditionally independent. \u2022 Backdoor criterion \u2014 which set of variables to condition on to remove confounding. \u2022 Common trap \u2014 conditioning on a collider opens a spurious association \u2014 the collider trap.",
    "source": "viltrumite",
    "priority": 1,
    "id": 55
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is the collider trap in causal inference?",
    "back": "\u2022 Collider \u2014 variable C where both X and Y point into C (X \u2192 C \u2190 Y). \u2022 Conditioning on C creates a spurious association between X and Y \u2014 even if X and Y are independent. \u2022 Example \u2014 conditioning on hospitalization (collider) can make two unrelated diseases appear negatively correlated. \u2022 Common trap \u2014 controlling for a variable just because it&#x27;s correlated with both treatment and outcome. \u2022 Need a DAG to determine what to control for \u2014 not just correlation.",
    "source": "viltrumite",
    "priority": 1,
    "id": 56
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is synthetic control and when is it used?",
    "back": "\u2022 Synthetic control \u2014 create a weighted combination of control units that matches pre-treatment trend of treated unit. \u2022 Used when \u2014 only one treated unit (e.g., a policy applied to one country/state). \u2022 Weights chosen to minimize pre-period distance between synthetic and actual treated unit. \u2022 Validity \u2014 requires good pre-period fit and no treatment contamination in control units. \u2022 Common trap \u2014 over-fitting the pre-period weights \u2192 biased post-period counterfactual.",
    "source": "viltrumite",
    "priority": 1,
    "id": 57
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is the backdoor criterion?",
    "back": "\u2022 Defines which variables to condition on to block all backdoor paths from T to Y. \u2022 Backdoor path \u2014 any path T \u2190 ... \u2192 Y (through a common ancestor \u2014 confounder). \u2022 Condition on a set S that blocks all backdoor paths without opening new paths (no collider conditioning). \u2022 If backdoor criterion is satisfied, regression of Y on T conditioned on S gives unbiased causal effect. \u2022 Requires a valid DAG \u2014 wrong DAG \u2192 wrong conditioning set.",
    "source": "viltrumite",
    "priority": 1,
    "id": 58
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is the exclusion restriction in IV and why is it untestable?",
    "back": "\u2022 Exclusion restriction \u2014 the instrument Z affects outcome Y only through treatment T \u2014 no direct effect. \u2022 Untestable because \u2014 we cannot observe what outcome would be in a world where Z \u2260 0 but T is fixed. \u2022 Must be justified with domain knowledge and theory, not data. \u2022 If violated \u2014 IV estimate is inconsistent \u2014 can produce more biased estimate than OLS. \u2022 Relevance (first stage) is testable; exclusion is not.",
    "source": "viltrumite",
    "priority": 1,
    "id": 59
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is the difference between mediation and moderation?",
    "back": "\u2022 Mediation \u2014 T affects Y through an intermediate variable M (T \u2192 M \u2192 Y). \u2022 Moderation \u2014 the effect of T on Y depends on the level of another variable W (interaction). \u2022 Mediation analysis asks \u2014 how much of the effect goes through M? (direct vs indirect effect). \u2022 Moderation analysis asks \u2014 for whom or when is the effect larger or smaller? \u2022 Common trap \u2014 controlling for a mediator removes part of the causal effect \u2014 biases total effect estimate.",
    "source": "viltrumite",
    "priority": 1,
    "id": 60
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is the stable unit treatment value assumption (SUTVA) and when does it fail?",
    "back": "\u2022 SUTVA \u2014 one unit&#x27;s outcome depends only on its own treatment, not others&#x27; treatment. \u2022 Required for ATE to be well-defined. \u2022 Fails when \u2014 network effects, marketplace spillovers, herd behavior, contagion. \u2022 Example \u2014 vaccination \u2014 vaccinating one person reduces others&#x27; infection probability (spillover). \u2022 How to fix it \u2014 cluster randomization, two-sided market designs, or network experiment methods.",
    "source": "viltrumite",
    "priority": 1,
    "id": 61
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is regression to the mean and why is it a causal inference trap?",
    "back": "\u2022 Extreme values tend to be less extreme on subsequent measurement due to random noise. \u2022 Pre-selecting units based on high/low values \u2192 post-measurement appears to change, even without intervention. \u2022 Example \u2014 students who score very low on a test improve on retest \u2014 not because of any intervention. \u2022 Common trap \u2014 observational studies targeting \"high-risk\" groups will show apparent improvement by regression alone. \u2022 How to fix it \u2014 control group with same selection criterion but no treatment.",
    "source": "viltrumite",
    "priority": 1,
    "id": 62
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "What is a JOIN type in SQL and when should you use each?",
    "back": "\u2022 INNER JOIN \u2014 only rows with matching keys in both tables. \u2022 LEFT JOIN \u2014 all rows from left, NULL for non-matching right \u2014 use for optional relationships. \u2022 RIGHT JOIN \u2014 same as LEFT but reversed \u2014 prefer LEFT JOIN for readability. \u2022 FULL OUTER JOIN \u2014 all rows from both, NULLs where no match. \u2022 CROSS JOIN \u2014 cartesian product \u2014 every combination \u2014 use only when intentional; extremely expensive on large tables.",
    "source": "viltrumite",
    "priority": 1,
    "id": 63
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "What is a window function and when is it used?",
    "back": "\u2022 Window function \u2014 performs calculation across a set of rows related to current row without collapsing them. \u2022 Unlike GROUP BY \u2014 retains individual rows. \u2022 Common \u2014 ROW_NUMBER(), RANK(), LAG(), LEAD(), SUM() OVER(), AVG() OVER(). \u2022 PARTITION BY \u2014 defines the group; ORDER BY: defines order within group. \u2022 Use \u2014 running totals, rankings, lead/lag comparisons, deduplication with ROW_NUMBER().",
    "source": "viltrumite",
    "priority": 1,
    "id": 64
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "What is a CTE and how does it differ from a subquery?",
    "back": "\u2022 CTE (WITH clause) \u2014 named, reusable query block defined before main query. \u2022 Subquery \u2014 inline query embedded in FROM or WHERE clause. \u2022 CTE \u2014 improves readability; can be recursive (for tree/graph traversal); may or may not be materialized (planner-dependent). \u2022 Subquery \u2014 may be optimized more aggressively by planner (pushed down, collapsed). \u2022 Common trap \u2014 assuming CTEs are always materialized in Postgres \u2014 they are now inlined by default unless marked MATERIALIZED.",
    "source": "viltrumite",
    "priority": 1,
    "id": 65
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "What is a north star metric and what makes one good vs bad?",
    "back": "\u2022 North star \u2014 single metric that best captures long-term product value delivered to users. \u2022 Good \u2014 directly tied to user value (not company value), predictive of long-term retention and revenue, actionable by teams. \u2022 Bad \u2014 vanity metric (pageviews, downloads), easy to game, not causally tied to user value. \u2022 Example of good \u2014 \"weekly active users completing core action\" vs bad: \"total registered users\". \u2022 Common trap \u2014 optimizing for a metric that diverges from actual user value \u2192 Goodhart&#x27;s Law.",
    "source": "viltrumite",
    "priority": 0,
    "id": 66
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "What is Goodhart's Law and where does it apply?",
    "back": "\u2022 Goodhart&#x27;s Law \u2014 when a measure becomes a target, it ceases to be a good measure. \u2022 Metric becomes an objective \u2192 people optimize the metric directly rather than the underlying construct. \u2022 Examples \u2014 click-through rate \u2192 clickbait; code coverage \u2192 trivial tests; session length \u2192 addictive dark patterns. \u2022 How to fix it \u2014 use multiple metrics with guardrails; separate the measurement metric from the optimization target. \u2022 Applies everywhere \u2014 OKRs, ML model metrics, product analytics, HR evaluations.",
    "source": "viltrumite",
    "priority": 0,
    "id": 67
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "What is the difference between a leading and lagging indicator?",
    "back": "\u2022 Lagging \u2014 measures outcome after the fact \u2014 revenue, churn, NPS. \u2022 Leading \u2014 measures activity that predicts future outcomes \u2014 daily active users, activation rate, feature engagement. \u2022 Lagging \u2014 accurate but too slow to act on \u2014 a revenue drop tells you something already went wrong. \u2022 Leading \u2014 actionable early but may not perfectly predict outcomes. \u2022 Good system \u2014 define which leading metrics predict lagging outcomes \u2014 with evidence.",
    "source": "viltrumite",
    "priority": 0,
    "id": 68
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "What is denominator choice and why is it the most important decision in metric design?",
    "back": "\u2022 Denominator defines the population the metric is computed over. \u2022 Wrong denominator \u2014 \"conversion rate\" = orders / users who ordered \u2192 always 100%. \u2022 Right denominator \u2014 orders / users who visited checkout \u2192 meaningful rate. \u2022 Denominator determines \u2014 what question is being answered, who is in scope, what change looks like. \u2022 Common trap \u2014 using the easiest available count as denominator without questioning what the metric should measure.",
    "source": "viltrumite",
    "priority": 0,
    "id": 69
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "What is a guardrail metric and what role does it play in product decisions?",
    "back": "\u2022 Guardrail \u2014 metric where any degradation beyond a threshold vetoes the decision, regardless of primary metric. \u2022 Examples \u2014 page load time (p95 must not increase > 100ms), error rate, unsubscribe rate. \u2022 Purpose \u2014 prevent optimizing one metric by harming another. \u2022 In experiments \u2014 guardrail violation \u2192 hold/investigate, even if primary metric is positive. \u2022 Common trap \u2014 only defining guardrails after an incident \u2014 design them before experiments run.",
    "source": "viltrumite",
    "priority": 0,
    "id": 70
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "What is survivorship bias in analytics?",
    "back": "\u2022 Survivorship bias \u2014 analyzing only entities that \"survived\" a process \u2014 ignores dropouts and failures. \u2022 Example \u2014 measuring average revenue of retained users ignores churned users entirely. \u2022 Leads to \u2014 overoptimistic estimates, wrong attribution. \u2022 Example in ML \u2014 training on users who continued to use the product \u2192 model never learned patterns of those who left. \u2022 How to fix it \u2014 include all entities that entered the funnel in the denominator, not just those who completed it.",
    "source": "viltrumite",
    "priority": 0,
    "id": 71
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "What is the difference between ratio metrics and count metrics in analytics?",
    "back": "\u2022 Count \u2014 absolute number (total purchases, total users) \u2014 doesn&#x27;t normalize for exposure. \u2022 Ratio \u2014 numerator / denominator (purchase rate, CTR) \u2014 normalizes for exposure. \u2022 Count metrics \u2014 misleading when denominator changes (more users \u2192 more events naturally). \u2022 Ratio metrics \u2014 more interpretable for change analysis. \u2022 Common trap \u2014 mixing count and ratio metrics in comparisons without normalization \u2014 apple-to-orange.",
    "source": "viltrumite",
    "priority": 0,
    "id": 72
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "What is a Type I vs Type II error in a business decision context?",
    "back": "\u2022 Type I (false positive) \u2014 conclude there is an effect when there isn&#x27;t \u2014 ship a change that doesn&#x27;t work. \u2022 Type II (false negative) \u2014 conclude there is no effect when there is \u2014 miss a change that would have helped. \u2022 Business asymmetry \u2014 in most product decisions, Type I costs are low (ship something neutral); in safety/fraud decisions, Type I costs are very high. \u2022 Threshold adjustment \u2014 lower \u03b1 (stricter) reduces Type I; higher power reduces Type II. \u2022 Design your threshold based on the asymmetric cost, not convention.",
    "source": "viltrumite",
    "priority": 0,
    "id": 73
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "What is cohort analysis and what insight does it provide that aggregate metrics miss?",
    "back": "\u2022 Cohort analysis \u2014 group users by a common characteristic (signup date, first purchase month) and track behavior over time for each group. \u2022 Insight \u2014 reveals retention curves, lifetime value patterns, whether product quality is improving. \u2022 Aggregate metrics hide \u2014 a declining retention rate masked by growing new user acquisitions. \u2022 Example \u2014 DAU growing but 30-day retention dropping \u2192 new users offset by accelerating churn from older cohorts. \u2022 Common trap \u2014 measuring retention on all users at once mixes cohorts with different histories.",
    "source": "viltrumite",
    "priority": 0,
    "id": 74
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "What is selection bias in analytics and how does it affect conclusions?",
    "back": "\u2022 Selection bias \u2014 analyzed population is not representative of the target population. \u2022 Example \u2014 survey sent to existing users \u2192 captures only non-churned users \u2192 overestimates satisfaction. \u2022 Product analytics trap \u2014 analyzing only users who completed onboarding \u2192 misses those who dropped off. \u2022 How to fix it \u2014 define population at entry point of the funnel, not completion point. \u2022 Applies to \u2014 NPS surveys, user interviews, A/B test population selection.",
    "source": "viltrumite",
    "priority": 0,
    "id": 75
  },
  {
    "topic": "product",
    "subtopic": "product_workflow",
    "front": "What is the difference between output and outcome in product design?",
    "back": "\u2022 Output \u2014 what was built or shipped (feature, page, report) \u2014 under the team&#x27;s control. \u2022 Outcome \u2014 change in user or business behavior resulting from the output \u2014 what actually matters. \u2022 Teams often track outputs (features shipped) when they should track outcomes (retention improved). \u2022 Product teams should be accountable for outcomes, not just outputs. \u2022 Common trap \u2014 measuring team success by features shipped \u2014 Goodhart&#x27;s Law applied to product.",
    "source": "viltrumite",
    "priority": 1,
    "id": 76
  },
  {
    "topic": "product",
    "subtopic": "product_workflow",
    "front": "What is a human-in-the-loop system and when is it necessary?",
    "back": "\u2022 Human-in-the-loop \u2014 humans review, approve, or override automated system decisions at key points. \u2022 Necessary when \u2014 decisions have high stakes (credit, medical, legal), model confidence is low, errors are hard to reverse, accountability is required by regulation. \u2022 Design \u2014 surface decision with confidence score and rationale; require override reason; log all decisions. \u2022 Common trap \u2014 automating fully when humans add genuine value \u2014 false efficiency, real accountability gap. \u2022 Common trap \u2014 requiring human review for every low-stakes decision \u2014 bottleneck with no value.",
    "source": "viltrumite",
    "priority": 1,
    "id": 77
  },
  {
    "topic": "product",
    "subtopic": "product_workflow",
    "front": "What is alert fatigue and how is it addressed in operational systems?",
    "back": "\u2022 Alert fatigue \u2014 so many alerts fire that operators stop trusting or responding to them. \u2022 Caused by \u2014 low precision (many false positives), insufficient threshold tuning, no severity tiers. \u2022 Consequences \u2014 real incidents missed, on-call burnout, reactive culture. \u2022 How to fix it \u2014 track alert precision (what fraction of alerts are real?), tier alerts by severity, reduce noise before adding new alerts. \u2022 Rule \u2014 every alert should be actionable \u2014 if you can&#x27;t act on it, it shouldn&#x27;t page.",
    "source": "viltrumite",
    "priority": 1,
    "id": 78
  },
  {
    "topic": "product",
    "subtopic": "product_workflow",
    "front": "What is the difference between qualitative and quantitative user research?",
    "back": "\u2022 Quantitative \u2014 numeric, statistical \u2014 surveys, analytics, A/B tests \u2014 answers \"how many\" and \"how much\". \u2022 Qualitative \u2014 exploratory, narrative \u2014 interviews, usability tests, diary studies \u2014 answers \"why\" and \"how\". \u2022 Quantitative tells you what is happening; qualitative tells you why. \u2022 Best practice \u2014 use quantitative to find anomalies; qualitative to explain them. \u2022 Common trap \u2014 building entirely on quantitative data \u2014 misses nuanced motivations and unmet needs.",
    "source": "viltrumite",
    "priority": 1,
    "id": 79
  },
  {
    "topic": "product",
    "subtopic": "product_workflow",
    "front": "What is progressive disclosure in UX and why does it matter for data products?",
    "back": "\u2022 Progressive disclosure \u2014 surface only the information needed at each decision point; reveal more detail on demand. \u2022 Reduces cognitive load \u2014 users aren&#x27;t overwhelmed by all possible information at once. \u2022 In data products \u2014 show summary metric, allow drill-down to segment \u2192 root cause \u2192 raw data. \u2022 Common trap \u2014 showing all data by default \u2014 users can&#x27;t find the signal in the noise. \u2022 Key design principle \u2014 high-level view must be actionable without clicking deeper.",
    "source": "viltrumite",
    "priority": 1,
    "id": 80
  },
  {
    "topic": "product",
    "subtopic": "product_workflow",
    "front": "What is an SLA, SLO, and SLI in reliability engineering?",
    "back": "\u2022 SLI (Service Level Indicator): specific metric measuring service behavior (p99 latency, error rate). \u2022 SLO (Service Level Objective): target value for an SLI (p99 latency < 200ms, 99.9% availability). \u2022 SLA (Service Level Agreement): contractual commitment with consequences for violation. \u2022 SLO is internal; SLA is external \u2014 SLO should be stricter than SLA to provide buffer. \u2022 Common trap \u2014 setting SLO = SLA \u2014 no buffer means first SLI degradation immediately violates external contract.",
    "source": "viltrumite",
    "priority": 1,
    "id": 81
  },
  {
    "topic": "product",
    "subtopic": "product_workflow",
    "front": "What is an error budget in reliability engineering?",
    "back": "\u2022 Error budget \u2014 1 \u2212 SLO target \u2014 allowed \"downtime\" or degradation before SLO is violated. \u2022 99.9% SLO = 0.1% error budget = ~8.7 hours per year. \u2022 When budget is consumed \u2014 freeze feature releases until reliability improves. \u2022 When budget is ample \u2014 ship faster, take more risks. \u2022 Aligns incentives \u2014 product and engineering share accountability for reliability vs velocity tradeoff.",
    "source": "viltrumite",
    "priority": 1,
    "id": 82
  },
  {
    "topic": "product",
    "subtopic": "product_workflow",
    "front": "What is feature flagging and what does it enable?",
    "back": "\u2022 Feature flag \u2014 conditional code path that can be enabled/disabled at runtime without deployment. \u2022 Enables \u2014 dark launches (deploy code, enable for 0% users), gradual rollout, kill switch for broken features, A/B testing at code level. \u2022 Decouples deploy from release \u2014 code can be in production but invisible to users. \u2022 Common trap \u2014 accumulating stale feature flags that are never cleaned up \u2014 adds code complexity and tech debt.",
    "source": "viltrumite",
    "priority": 1,
    "id": 83
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Pearson correlation \u2014 what does it measure, when do you use it, and when does it fail?",
    "back": "\u2022 Pearson correlation measures the strength and direction of a linear relationship on a unit-free scale from -1 to +1. \u2022 It is basically normalized covariance, so you can compare associations across variable pairs even when units differ. \u2022 Use it for EDA, collinearity checks, and linear feature screening. \u2022 It can be near 0 even when a strong non-linear relationship exists. \u2022 It is sensitive to outliers. \u2022 Do not interpret r as proportion of variance explained \u2014 that is r\u00b2, not r.",
    "source": "viltrumite",
    "priority": 1,
    "id": 84
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Standard deviation \u2014 what is it useful for, and what are its limits?",
    "back": "\u2022 Standard deviation puts variance back in the original units, so spread is easier to interpret next to the mean. \u2022 Use it for communicating variability, z-scoring, and confidence intervals like mean \u00b1 z\u00b7\u03c3/\u221an. \u2022 Bigger SD means the data is more spread out around the mean. \u2022 But SD is sensitive to extreme values, so skewed or heavy-tailed data can make it misleading. \u2022 Do not treat SD as a \u201csafe range\u201d unless the data is roughly normal.",
    "source": "viltrumite",
    "priority": 1,
    "id": 85
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "How do you interpret A/B test results before making a launch decision?",
    "back": "\u2022 1. First check SRM. If SRM fails, I do not trust the experiment. \u2022 2. Check primary metric lift: absolute and relative. \u2022 3. Check statistical significance with the right test, plus p-value and confidence interval. \u2022 4. Guardrails. \u2022 5. Check key pre-defined segments to see whether the direction is consistent and whether any important segment is meaningfully harmed. \u2022 6. Decide: roll out, ramp, segment-rollout, rollback, or iterate.",
    "source": "viltrumite",
    "priority": 0,
    "id": 86
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Interpreting experiment results \u2014 what commonly goes wrong?",
    "back": "\u2022 Do not decide from p-value alone. \u2022 Do not ignore guardrail failures because the primary metric looks good. \u2022 Do not trust results with SRM or peeking. \u2022 Do not assume the average effect applies to every segment. \u2022 Do not over-generalize beyond the tested population or time period. \u2022 Checkout test: p = 0.03, conversion +1.8%, guardrails clean, SRM clean.",
    "source": "viltrumite",
    "priority": 0,
    "id": 87
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What makes a good experiment metric?",
    "back": "\u2022 1. Valid = actually measures the outcome the treatment is meant to affect \u2022 2. Sensitive = moves if the treatment truly works \u2022 3. Stable = low enough variance to detect realistic effects \u2022 4. Aligned to business value = improvement should matter to the business \u2022 5. Must be measurable at the randomization unit \u2022 6. Must be measurable within the experiment window",
    "source": "viltrumite",
    "priority": 0,
    "id": 88
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is SRM, and why is it a mandatory experiment check?",
    "back": "\u2022 SRM means the observed split between control and treatment does not match the intended randomization ratio. \u2022 Example: expected 50/50, observed 48/52. \u2022 SRM usually means a bug in assignment, logging, filtering, or routing \u2014 not a real treatment effect. \u2022 It is a pre-analysis validity check: if SRM exists, the experiment result is not trustworthy. \u2022 Test was meant to be 50/50, but counts are 48,200 vs 51,800. \u2022 SRM check fails. Investigation finds a redirect bug dropping mobile users from treatment.",
    "source": "viltrumite",
    "priority": 0,
    "id": 89
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "SRM \u2014 what do you do if you detect it, and how do you check it?",
    "back": "\u2022 Do not continue outcome analysis if SRM is present. \u2022 Even a small imbalance can mean systematic bias, not random noise. \u2022 Check SRM with a chi-square goodness-of-fit test on assignment counts. \u2022 Also check it by platform, country, browser, or key segment, because a global pass can hide a segment-level failure. \u2022 Typical rule: p \u2022 Fix the assignment / logging bug and re-run the experiment.",
    "source": "viltrumite",
    "priority": 0,
    "id": 90
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is the unit of randomization, and how do you choose it?",
    "back": "\u2022 The unit of randomization is the entity assigned to control or treatment: user, session, device, account, market, etc. \u2022 Choose the unit so assignment is stable, users do not see both experiences, and interference is minimized. \u2022 In most product tests, randomize at the user level if the user can return multiple times. \u2022 Do not randomize at a coarser level than needed, because that usually reduces power. \u2022 Feed ranking test: randomize by user, not session, so each user sees one consistent ranking system.",
    "source": "viltrumite",
    "priority": 0,
    "id": 91
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What is the alternative hypothesis (H1), and how do you choose one-tailed vs two-tailed?",
    "back": "\u2022 H1 is the claim you want evidence for if H0 is false \u2014 that a real difference or effect exists. \u2022 It also determines whether the test is one-tailed or two-tailed. \u2022 One-tailed: use only when you care about one direction only and would ignore the other direction. \u2022 Two-tailed: safer default when either increase or decrease matters. \u2022 Do not switch tails after seeing results \u2014 that is p-hacking. \u2022 H1 is not the MDE: H1 says an effect exists; MDE says how big an effect the test is powered to detect.",
    "source": "viltrumite",
    "priority": 0,
    "id": 92
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Type I vs Type II error \u2014 how should you interpret them in practice, and what commonly goes wrong?",
    "back": "\u2022 Type I = your accepted false positive risk. \u2022 Type II = your missed detection risk. \u2022 Do not say a non-significant result proves \u201cno effect\u201d \u2014 it may just be underpowered. \u2022 Correct phrasing: \u201cwe did not detect an effect at this sample size / MDE / alpha.\u201d \u2022 Do not confuse alpha with the overall chance that a significant result is false \u2014 the base rate of true nulls matters. \u2022 If most tested ideas truly do nothing, even alpha = 0.05 can still produce many false discoveries among \u201csignificant\u201d wins.",
    "source": "viltrumite",
    "priority": 0,
    "id": 93
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Outcome window \u2014 what is it, and what mistakes break it?",
    "back": "\u2022 Outcome window is the time period after treatment assignment during which you measure the metric. \u2022 Examples: 7-day conversion, 30-day retention. \u2022 Define it before the experiment so users get a fair and consistent chance to show the outcome. \u2022 Do not extend the window after seeing results \u2014 that is p-hacking. \u2022 Do not include outcomes that happen before treatment could realistically act. \u2022 Do not make the window so short that most users never had a chance to convert.",
    "source": "viltrumite",
    "priority": 0,
    "id": 94
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "How do sample size and variance affect confidence intervals and MDE?",
    "back": "\u2022 Statistical precision is driven mainly by sample size n and metric variance \u03c3 2 \u2022 SE = \u03c3 2 /n 1/2 \u2022 Larger n \u2192 smaller standard error \u2192 narrower confidence intervals and smaller MDE. \u2022 Higher variance \u2192 larger standard error \u2192 wider confidence intervals and larger MDE. \u2022 Doubling nnn does not halve uncertainty. To cut MDE roughly in half, you need about 4x the sample.",
    "source": "viltrumite",
    "priority": 0,
    "id": 95
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "GROUP BY \u2014 what does it do, and when do you use it?",
    "back": "\u2022 GROUP BY collapses rows with the same key(s) into one row per group. \u2022 Then you apply aggregates like COUNT, SUM, AVG, MIN, MAX per group. \u2022 Use it for per-entity summaries: revenue per customer, DAU per day, orders per seller. \u2022 SELECT date, COUNT(DISTINCT user_id) AS dau FROM events GROUP BY date \u2022 This gives one row per date with daily active users.",
    "source": "viltrumite",
    "priority": 1,
    "id": 96
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "What does an INNER JOIN do, and when should you use it?",
    "back": "\u2022 INNER JOIN keeps only rows where the join key matches in both tables. \u2022 Use it when you want only matched records. \u2022 Good for cases like orders with valid customers or payments with valid transactions. \u2022 Join orders to products on product_id. \u2022 If an order\u2019s product_id is missing in products, that order is dropped from the result.",
    "source": "viltrumite",
    "priority": 1,
    "id": 97
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "What does ROW_NUMBER() do, and when do you use it?",
    "back": "\u2022 ROW_NUMBER() assigns a unique sequential number to each row within a partition, based on the specified order. \u2022 Use it to deduplicate, pick the latest / earliest row per entity, or do pagination / top-1 per group. \u2022 It is best when you want exactly one row per group after sorting. \u2022 Keep the most recent event per user: partition by user_id, order by event_timestamp DESC, then keep rn = 1.",
    "source": "viltrumite",
    "priority": 1,
    "id": 98
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "LAG vs LEAD \u2014 what do they do, when do you use them, and what can go wrong?",
    "back": "\u2022 LAG(col, k) returns the value from k rows before within the same partition; default k = 1. \u2022 LEAD(col, k) returns the value from k rows after within the same partition; default k = 1. \u2022 Use them for period-over-period comparisons, state transitions, time-to-next-event, previous vs current status, and next order / next session logic. \u2022 Example uses: current revenue vs previous month, next order date, previous order status vs current. \u2022 Always use ORDER BY inside the window \u2014 otherwise previous/next row is undefined. \u2022 They do not fix missing time periods: if a month is missing, LAG gives the previous available row, not necessarily the previous calendar month.",
    "source": "viltrumite",
    "priority": 1,
    "id": 99
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Top-N per group \u2014 what is it, and how do you do it correctly?",
    "back": "\u2022 It returns the top N rows within each group without collapsing the result. \u2022 Use it for top products per category, latest N events per user, best campaigns per channel. \u2022 Usually do it with ROW_NUMBER() OVER (PARTITION BY group ORDER BY metric DESC), then filter in an outer query / CTE. \u2022 Do not use ROW_NUMBER if ties should all be kept \u2014 use RANK or DENSE_RANK instead. \u2022 ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) \u2192 keep rows where rn <= 2 to get each customer\u2019s latest 2 orders.",
    "source": "viltrumite",
    "priority": 1,
    "id": 100
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "CTE \u2014 what is it, when do you use it, and what is the performance trap?",
    "back": "A CTE is a named temporary result set defined with WITH before the main query. Use it to break a complex query into clear logical steps, avoid repeating a long subquery, or write recursive queries. It improves readability, not necessarily performance. In many databases, a normal CTE is not materialized by default and may be re-executed each time it is referenced. If the same expensive CTE is used multiple times, prefer a temp table or a materialized CTE where supported.",
    "source": "viltrumite",
    "priority": 1,
    "id": 101
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "INNER JOIN \u2014 what commonly goes wrong, and how do you check it?",
    "back": "Biggest risk: silent row loss when keys do not match. NULL keys do not match other NULLs, so those rows also get dropped. After the join, compare row count before vs after against the driving table. If counts dropped, check whether that was expected or caused by missing / bad keys. Closest alternative: LEFT JOIN when you want to keep all rows from the left table even if no match exists. Concrete rule: Need only matched rows \u2192 INNER JOIN Need to preserve all left-table rows \u2192 LEFT JOIN",
    "source": "viltrumite",
    "priority": 1,
    "id": 102
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "INNER JOIN: What does an INNER JOIN do, and when should you use it?",
    "back": "INNER JOIN keeps only rows where the join key matches in both tables. Use it when you want only matched records. Good for cases like orders with valid customers or payments with valid transactions. Business example: Join orders to products on product_id. If an order\u2019s product_id is missing in products, that order is dropped from the result.",
    "source": "viltrumite",
    "priority": 1,
    "id": 103
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "ROW NUMBER: What does ROW_NUMBER() do, and when do you use it?",
    "back": "ROW_NUMBER() assigns a unique sequential number to each row within a partition, based on the specified order. Use it to deduplicate, pick the latest / earliest row per entity, or do pagination / top-1 per group. It is best when you want exactly one row per group after sorting. Business example: Keep the most recent event per user: partition by user_id, order by event_timestamp DESC, then keep rn = 1.",
    "source": "viltrumite",
    "priority": 1,
    "id": 104
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "ROW_NUMBER() \u2014 what commonly goes wrong, and what are the alternatives?",
    "back": "If the ORDER BY is not unique, tie-breaking is arbitrary / non-deterministic. So for dedup, always add a tiebreaker column if ties are possible. Without PARTITION BY, it ranks the entire dataset as one group. Use RANK() if ties should share rank and gaps are okay. Use DENSE_RANK() if ties should share rank and gaps are not okay. Concrete rule: Need one unique row per group \u2192 ROW_NUMBER() Need tied rows to share rank \u2192 RANK() / DENSE_RANK()",
    "source": "viltrumite",
    "priority": 1,
    "id": 105
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Running totals \u2014 what are they, when do you use them, and what commonly goes wrong?",
    "back": "A running total is a cumulative sum ordered by a sequence, usually time. In SQL, do it with SUM(...) OVER (PARTITION BY ... ORDER BY ... ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW). Use it for cumulative revenue by date, cumulative signups, cumulative spend per user, quota tracking. Use ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for strict row-by-row accumulation. Do not use RANGE when the ORDER BY column has duplicate values \u2014 it pulls in all ties at once and causes jumps instead of true row-by-row running totals.",
    "source": "viltrumite",
    "priority": 1,
    "id": 106
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "Business significance vs statistical significance \u2014 what is the difference?",
    "back": "Statistical significance asks: is the effect unlikely to be zero? Business significance asks: is the effect large enough to matter? A result can be statistically significant but business-trivial if n is huge and the lift is tiny. A result can be business-relevant but not statistically significant if the test is underpowered. Always translate effect size into business units: uplift \u00d7 traffic \u00d7 conversion value = impact. Do not treat \u201cnon-significant\u201d as \u201cnothing happened\u201d without checking the CI and whether the test could detect the target MDE.",
    "source": "viltrumite",
    "priority": 0,
    "id": 107
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "How would you defend the cost weights, especially false approval = 5x?",
    "back": "Situation/Goal: The exact ratio is an assumption, but the asymmetry is not. Action: I would say false approvals are far costlier because they create credit loss, collections cost, and capital write-off, whereas rejecting a good applicant is lost revenue and more recoverable. So the 5x is a reasonable policy assumption used for the simulation. Result + scope: The mature answer is to defend the direction strongly and the exact number modestly. In production, I would validate the weight with finance and risk stakeholders. Interviewer lens: They want judgment, not fake precision. Contrast: directionally defensible assumption vs pretending the 5x came from empirical finance data Do not say: \u201cThe data proved 5x was the exact business cost.\u201d",
    "source": "viltrumite",
    "priority": 0,
    "id": 108
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "What does the review band achieve operationally?",
    "back": "Situation/Goal: Binary cutoff forces automated decisions in the highest-uncertainty zone. Action: Use the 0.08\u20130.25 band to route borderline applicants to human underwriters. Result + scope: Automation on confident tails, human judgment in the ambiguous middle. Contrast: forced binary decision vs uncertainty-aware routing.",
    "source": "viltrumite",
    "priority": 0,
    "id": 109
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "What happens operationally to applicants in the review band?",
    "back": "Situation/Goal: The review band only makes sense if it maps to a concrete operating action. Action: Applicants in the middle band route to manual underwriting. I also modeled multiple review-capacity scenarios so the policy could be tuned against operational headcount rather than assuming infinite manual review bandwidth. Result + scope: That makes the review band an operations-aware design choice instead of a purely academic threshold gap. Interviewer lens: Can you connect model outputs to human workflow? Contrast: review as real ops constraint vs review as vague buffer zone Do not say: A vague answer that never says who actually reviews the cases.",
    "source": "viltrumite",
    "priority": 0,
    "id": 110
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "Why not just use the F1-optimal threshold operationally?",
    "back": "Situation/Goal: F1 assumes false positives and false negatives matter symmetrically, which is not true in credit underwriting. Action: I treated the 0.18 threshold as the best binary cutoff for an evaluation sweep, then designed a separate cost-weighted policy with approve and reject thresholds plus a review band. Result + scope: That is more operationally faithful because false approvals were penalized 5x harsh rejects, and the review band lets the system handle uncertainty instead of forcing a binary call on every applicant. Interviewer lens: They want to know whether you can separate evaluation convenience from business policy. Contrast: single F1 cutoff vs asymmetric-cost routing Do not say: \u201cF1 was highest, so that\u2019s what I used in production logic.\u201d",
    "source": "viltrumite",
    "priority": 0,
    "id": 111
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "Why use a three-way policy instead of binary approve/reject?",
    "back": "Situation/Goal: Forcing a binary decision in the model\u2019s uncertainty zone is bad risk management. Action: Added a review band between approve and reject so borderline applicants route to manual underwriting instead of being forced into an automated tail decision. Result + scope: The policy captures uncertainty operationally. It is still a notebook simulation, but it is directionally aligned with real decisioning systems where automated tails and manual review are separated. Interviewer lens: Do you understand operations, not just metrics? Contrast: binary cutoff vs approve/review/reject routing Do not say: \u201cI wanted to try something different.\u201d",
    "source": "viltrumite",
    "priority": 0,
    "id": 112
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "How do you use sample size vs variance in experiment design, and what commonly goes wrong?",
    "back": "Use this relationship to decide whether to run longer / get more users or reduce variance with a better metric or CUPED. If variance is much higher than assumed, the test is underpowered and CIs become wider than expected. If observations are clustered / dependent but treated as independent, variance is underestimated and CIs look falsely tight. Don\u2019t pick a metric just because it is easy to measure \u2014 pick one that is in the causal path of the intervention. Business example: DAU may have very high variance and need 8 weeks. A lower-variance per-user session metric may cut that to 2 weeks. CUPED is another lever: reduce variance first, instead of only asking for more traffic.",
    "source": "viltrumite",
    "priority": 0,
    "id": 113
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Power \u2014 what commonly goes wrong?",
    "back": "Do not run an underpowered test and then say \u201cthere is no effect.\u201d A null result may only mean the test was too weak to detect it. Do not confuse power with confidence level \u2014 power is about Type 2 error, not alpha. Power is not a fixed property of a test; it depends on effect size, alpha, variance, and sample size. Do not do post-hoc power analysis on the observed result \u2014 it is usually not useful. Concrete rule: If traffic is too low for the MDE you care about, either run longer, reduce variance, or accept a larger MDE.",
    "source": "viltrumite",
    "priority": 0,
    "id": 114
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Primary metric \u2014 what is it, and what mistakes break an experiment?",
    "back": "The primary metric is the pre-specified metric that answers the business question and drives the ship / no-ship decision. It is the metric the experiment is typically powered on, so it also drives sample size. Keep it to one, or at most two, and define it before the experiment starts. Do not declare many co-primary metrics without multiple-comparison correction \u2014 that inflates Type I error. Do not switch the primary metric mid-experiment or post-hoc just because another metric turned significant. Business rule: if the primary metric moves in the desired direction at the pre-specified alpha, the test succeeded by design.",
    "source": "viltrumite",
    "priority": 0,
    "id": 115
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "SRM: What is it, and why is it a mandatory experiment check?",
    "back": "SRM means the observed split between control and treatment does not match the intended randomization ratio. Example: expected 50/50, observed 48/52. SRM usually means a bug in assignment, logging, filtering, or routing \u2014 not a real treatment effect. It is a pre-analysis validity check: if SRM exists, the experiment result is not trustworthy. Business example: Test was meant to be 50/50, but counts are 48,200 vs 51,800. SRM check fails. Investigation finds a redirect bug dropping mobile users from treatment.",
    "source": "viltrumite",
    "priority": 0,
    "id": 116
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Unit of Randomization: How will you evaluate whether the unit of randomisation is correct?",
    "back": "Check no unit appears in both arms \u2014 for example, the same user ID should not show up in both control and treatment. Check assignment is stable over time \u2014 for example, a user assigned to treatment on day 1 should still be in treatment on day 5, not switch arms.",
    "source": "viltrumite",
    "priority": 0,
    "id": 117
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Unit of Randomization: What is the unit of randomization, and how do you choose it?",
    "back": "The unit of randomization is the entity assigned to control or treatment: user, session, device, account, market, etc. Choose the unit so assignment is stable, users do not see both experiences, and interference is minimized. In most product tests, randomize at the user level if the user can return multiple times. Do not randomize at a coarser level than needed, because that usually reduces power. Business example: Feed ranking test: randomize by user, not session, so each user sees one consistent ranking system.",
    "source": "viltrumite",
    "priority": 0,
    "id": 118
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Bayes\u2019 theorem \u2014 what does it do, and why does the base rate matter?",
    "back": "Bayes\u2019 theorem updates a prior belief with new evidence to get a posterior probability. Formula: P(A|B) = P(B|A) \u00d7 P(A) / P(B). Use it when you know the likelihood and the base rate, and want the actual probability after observing evidence. Common uses: medical testing, fraud detection, spam filtering. Main trap: do not ignore the base rate and do not confuse P(B|A) with P(A|B). Example: even a 99% sensitive fraud test can produce mostly false positives if fraud prevalence is 1 in 10,000.",
    "source": "viltrumite",
    "priority": 1,
    "id": 119
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Central Limit Theorem (CLT) \u2014 what does it say, and when do you use it?",
    "back": "If you draw random samples of size n from a population with finite mean and variance, the distribution of sample means approaches normal as n grows, regardless of the underlying population shape. That is what lets us use t-tests and z-tests on non-normal data. Use it for confidence intervals, hypothesis tests, and standard errors for means. That is why t-tests can still work reasonably well on non-normal data when sample size is large enough.",
    "source": "viltrumite",
    "priority": 1,
    "id": 120
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Central Limit Theorem (CLT) \u2014 when does it fail or get unreliable?",
    "back": "It gets unreliable with small n + heavy skew / heavy tails. It can fail when observations are not independent. It does not fix biased sampling. Do not blindly apply it to dependent data like autocorrelated time series. Extreme cases like Cauchy / infinite-variance distributions break the usual CLT.",
    "source": "viltrumite",
    "priority": 1,
    "id": 121
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Covariance \u2014 what does it tell you, and when should you not use it?",
    "back": "Covariance tells you the direction of the linear relationship between two numeric variables. Positive covariance \u2192 they tend to move together; negative covariance \u2192 they tend to move oppositely. It is often used as an intermediate quantity in PCA, regression, and portfolio variance, not as a final business-facing metric. Raw magnitude is hard to interpret because it is in the product of the two variables\u2019 units. Do not compare covariance across variable pairs with different scales \u2014 use correlation for comparable strength.",
    "source": "viltrumite",
    "priority": 1,
    "id": 122
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Null hypothesis (H0) \u2014 what is it, and how should you interpret it?",
    "back": "H0 is the default assumption the test is designed to challenge. It is usually no effect, no difference, or no change, stated precisely, e.g. \u03bccontrol = \u03bctreatment Every hypothesis test needs an explicit H0 because the p-value is computed under it. Do not say \u201cwe accepted H0\u201d \u2014 you only failed to reject it. Do not put what you want to prove in H0 \u2014 that belongs in H1 / alternative.",
    "source": "viltrumite",
    "priority": 1,
    "id": 123
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Statistical Power: What is it, and how do you use it?",
    "back": "Power is the probability of detecting a real effect of a given size if that effect truly exists. Power = 1 \u2212 beta. If power is 80%, the test has a 20% chance of missing a true effect of the target size. Use power analysis before the experiment to solve for required sample size, given alpha, MDE, and variance. Business example: If you want to detect a 2pp retention lift, power analysis tells you whether your planned traffic is enough or whether the test is too small to answer that question.",
    "source": "viltrumite",
    "priority": 1,
    "id": 124
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What does high model variance mean?",
    "back": "Model variance means how much predictions change if you retrain on a different sample from the same population. High variance = overfitting: the model is learning noise, so train performance looks good but test performance drops. In logistic regression, this usually shows up with many features, weak regularization, or too little data. Adding more features without control increases variance; more data and regularization reduce it.",
    "source": "viltrumite",
    "priority": 1,
    "id": 125
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is statistical variance, and when do you use it?",
    "back": "Statistical variance measures spread around the mean: average squared deviation from the mean. It is mainly used as an input to standard deviation, standard error, ANOVA, and regression. Because it is in squared units, it is usually not reported directly to business stakeholders. It is sensitive to outliers, so for heavy-tailed data it can be misleading or unstable.",
    "source": "viltrumite",
    "priority": 1,
    "id": 126
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Z Score Outlier method: What is it, and when does it work?",
    "back": "Z-score flags points that are many standard deviations away from the mean: z = (x \u2212 mean) / std. Common rule: flag |z| > 3 as an outlier. Use it when the feature is roughly normal and you want a quick univariate outlier check. It works best as a simple EDA method, not as a universal outlier detector. Business example: If age is roughly normal, very high absolute z-scores can flag suspicious ages.",
    "source": "viltrumite",
    "priority": 1,
    "id": 127
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Z Test: What is a z-test, when do you use it, and when should you avoid it?",
    "back": "A z-test checks whether a mean or proportion difference is statistically significant when variance is known or sample size is large enough for CLT. Common use: large-sample A/B tests on conversion rate or CTR. Use it when observations are IID and sample size is large. Avoid it for small samples with unknown variance \u2014 use a t-test instead. Also avoid it when data is clustered / dependent, because variance will be underestimated. Business example: Compare landing-page conversion rates for two variants with 50k users per arm \u2192 two-proportion z-test is fine.",
    "source": "viltrumite",
    "priority": 1,
    "id": 128
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Alpha (Significance Level) \u2014 Core answer vlt_clean_0004",
    "back": "The pre-specified maximum acceptable probability of rejecting H0 when it is actually true (Type 1 error rate). It defines the decision threshold: reject H0 if p <= alpha. Standard values are 0.05 (5% false positive rate) and 0.01 (stricter).",
    "source": "viltrumite",
    "priority": 0,
    "id": 129
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Alpha (Significance Level) \u2014 Failure vlt_clean_0005",
    "back": "Don't lower alpha post-hoc because the result is marginal. Don't apply the same alpha to 20 simultaneous tests without correction \u2014 with alpha=0.05 and 20 tests, you expect 1 false positive by chance even under all true nulls.",
    "source": "viltrumite",
    "priority": 0,
    "id": 130
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Alpha (Significance Level) \u2014 Use vlt_clean_0006",
    "back": "Set alpha based on the cost of a false positive in the business context. Use 0.05 as default; use 0.01 when launching a wrong feature is costly; consider 0.10 for low-stakes early exploration.",
    "source": "viltrumite",
    "priority": 0,
    "id": 131
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Alternative Hypothesis (H1) \u2014 Core answer vlt_clean_0007",
    "back": "Specifies the effect or difference you are trying to detect \u2014 what you expect to be true if H0 is false. H1 determines whether the test is one-tailed (directional: delta > 0) or two-tailed (non-directional: delta \u2260 0).",
    "source": "viltrumite",
    "priority": 0,
    "id": 132
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Alternative Hypothesis (H1) \u2014 Failure vlt_clean_0008",
    "back": "Don't switch from two-tailed to one-tailed after seeing results to halve the p-value \u2014 that is p-hacking. Don't confuse H1 with the MDE \u2014 H1 says a difference exists, not how large it is.",
    "source": "viltrumite",
    "priority": 0,
    "id": 133
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Alternative Hypothesis (H1) \u2014 Use vlt_clean_0009",
    "back": "Always paired with H0. One-tailed H1 is appropriate when you only care about improvement (e.g., a new feature can only help, never hurt). Two-tailed is the safe default when direction is uncertain.",
    "source": "viltrumite",
    "priority": 0,
    "id": 134
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Bayes' Theorem \u2014 Core answer vlt_clean_0029",
    "back": "Inverts a conditional probability: given P(B|A), base rate P(A), and likelihood P(B), it derives P(A|B). Specifically: P(A|B) = P(B|A)\u00b7P(A) / P(B). This allows updating a prior belief with new evidence to get a posterior belief.",
    "source": "viltrumite",
    "priority": 1,
    "id": 135
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Bayes' Theorem \u2014 Failure vlt_clean_0030",
    "back": "Don't ignore the base rate \u2014 even a test with 99% sensitivity gives mostly false positives if the base rate is 1 in 10,000. Bayes forces you to account for this. Don't assume P(B|A) = P(A|B).",
    "source": "viltrumite",
    "priority": 1,
    "id": 136
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Bayes' Theorem \u2014 Use vlt_clean_0031",
    "back": "When you know the likelihood (test sensitivity/specificity) and the base rate, and need the posterior (actual probability of the condition given the test result). Fraud scoring, spam filtering, A/B decision frameworks, medical testing.",
    "source": "viltrumite",
    "priority": 1,
    "id": 137
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Business Significance vs Statistical Significance \u2014 Core answer vlt_clean_0040",
    "back": "Statistical significance answers: \"Is the effect unlikely to be zero?\" Business significance answers: \"Is the effect large enough to justify acting on?\" These are independent. A result can be statistically significant and business-insignificant (tiny effect, large n) or statistically non-significant and potentially business-significant (real effect, underpowered test).",
    "source": "viltrumite",
    "priority": 0,
    "id": 138
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Business Significance vs Statistical Significance \u2014 Failure vlt_clean_0041",
    "back": "Don't equate statistical significance with business value. Don't dismiss a non-significant result as \"nothing happened\" without reporting the CI and checking whether the test was powered to detect the business-relevant MDE.",
    "source": "viltrumite",
    "priority": 0,
    "id": 139
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Business Significance vs Statistical Significance \u2014 Use vlt_clean_0042",
    "back": "Apply this distinction to every experiment readout. Business significance assessment requires translating effect size into business units: +X% conversion \u00d7 daily traffic \u00d7 revenue per conversion = annual impact.",
    "source": "viltrumite",
    "priority": 0,
    "id": 140
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "CASE WHEN \u2014 Core answer vlt_clean_0043",
    "back": "A conditional expression that evaluates a list of conditions in order and returns the value of the first condition that is TRUE. Equivalent to if/else logic inside a SQL expression. Can be used in SELECT, WHERE, GROUP BY, ORDER BY, and aggregate functions.",
    "source": "viltrumite",
    "priority": 1,
    "id": 141
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "CASE WHEN \u2014 Failure vlt_clean_0044",
    "back": "Do not omit ELSE when NULL results would be incorrect \u2014 missing ELSE silently returns NULL for unmatched rows. Do not use for row filtering \u2014 that belongs in WHERE. Do not nest CASE WHEN excessively \u2014 use a lookup table or CTE instead.",
    "source": "viltrumite",
    "priority": 1,
    "id": 142
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "CASE WHEN \u2014 Use vlt_clean_0045",
    "back": "Use for: creating derived categorical columns (bucketing ages, flagging status), conditional aggregation (SUM(CASE WHEN status='paid' THEN amount ELSE 0 END)), pivoting rows to columns, applying different logic per segment in a single query.",
    "source": "viltrumite",
    "priority": 1,
    "id": 143
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "CTE \u2014 Core answer vlt_clean_0046",
    "back": "A Common Table Expression (CTE) is a named temporary result set defined with WITH before the main query. It makes complex queries readable by breaking them into named, reusable logical steps. In most databases, a CTE is not materialized by default \u2014 it may be re-executed each time it is referenced.",
    "source": "viltrumite",
    "priority": 1,
    "id": 144
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "CTE \u2014 Failure vlt_clean_0047",
    "back": "In most databases (PostgreSQL, Snowflake, BigQuery), a non-materialized CTE is re-evaluated every time it is referenced \u2014 if referenced twice, it runs twice. This is a performance pitfall. Use a temp table or materialized CTE (WITH cte AS MATERIALIZED ...) when reuse is expensive.",
    "source": "viltrumite",
    "priority": 1,
    "id": 145
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "CTE \u2014 Use vlt_clean_0048",
    "back": "Use CTEs to: break a multi-step transformation into named stages for readability, avoid repeating a subquery used multiple times, write recursive queries (org charts, path traversal), stage intermediate results in a readable sequence.",
    "source": "viltrumite",
    "priority": 1,
    "id": 146
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Central Limit Theorem (CLT) \u2014 Breaks if vlt_clean_0049",
    "back": "Non-finite variance distributions like Cauchy or heavy-tailed Pareto break CLT. Extreme skew with small n. Correlated observations violate the IID assumption and slow convergence.",
    "source": "viltrumite",
    "priority": 0,
    "id": 147
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Central Limit Theorem (CLT) \u2014 Core answer vlt_clean_0050",
    "back": "If you draw random samples of size n from a population with finite mean and variance, the distribution of sample means approaches normal as n grows, regardless of the underlying population shape. That is what lets us use t-tests and z-tests on non-normal data.",
    "source": "viltrumite",
    "priority": 0,
    "id": 148
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Central Limit Theorem (CLT) \u2014 Evaluation vlt_clean_0051",
    "back": "Simulate the sampling distribution by bootstrapping: draw 1,000 bootstrap samples, compute the mean each time, and check whether the distribution looks approximately normal. If it does, CLT has kicked in.",
    "source": "viltrumite",
    "priority": 0,
    "id": 149
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Central Limit Theorem (CLT) \u2014 Failure vlt_clean_0052",
    "back": "CLT applies to means, not arbitrary statistics \u2014 medians and quantiles have their own sampling distributions. CLT does not fix bias in your sample. And do not apply it to sums of dependent observations like autocorrelated time series.",
    "source": "viltrumite",
    "priority": 0,
    "id": 150
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Central Limit Theorem (CLT) \u2014 Use vlt_clean_0053",
    "back": "Constructing confidence intervals for means, justifying t-tests on non-normal populations, any inference about a sample mean where n is large enough.",
    "source": "viltrumite",
    "priority": 0,
    "id": 151
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Confidence Intervals \u2014 Breaks if vlt_clean_0062",
    "back": "small sample size, Non IID",
    "source": "viltrumite",
    "priority": 0,
    "id": 152
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Confidence Intervals \u2014 Core answer vlt_clean_0063",
    "back": "A range of plausible values for the population parameter (e.g., true treatment effect) consistent with the observed data at a specified confidence level. A 95% CI means: if we repeated this experiment many times, 95% of the constructed intervals would contain the true parameter. It does NOT mean there is a 95% probability the true value lies in this specific interval.",
    "source": "viltrumite",
    "priority": 0,
    "id": 153
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Confidence Intervals \u2014 Evaluation vlt_clean_0064",
    "back": "An experiment is well-executed if: SRM check passes, experiment ran for the pre-planned duration, primary metric decision aligns with pre-specified alpha, and guardrail metrics were checked before shipping.",
    "source": "viltrumite",
    "priority": 0,
    "id": 154
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Confidence Intervals \u2014 Failure vlt_clean_0065",
    "back": "Don't say \"95% probability the true value is in this interval\" \u2014 the true value is fixed, not random; only the interval is random. Don't use CI as a standalone decision tool without also reporting effect size and business significance.",
    "source": "viltrumite",
    "priority": 0,
    "id": 155
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Confidence Intervals \u2014 Use vlt_clean_0066",
    "back": "Report alongside p-value to communicate both statistical significance and effect magnitude. A CI that excludes zero is equivalent to rejecting H0 (two-tailed, alpha = 1 \u2212 confidence level).",
    "source": "viltrumite",
    "priority": 0,
    "id": 156
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Covariance \u2014 Core answer vlt_clean_0070",
    "back": "Measures the direction of the linear relationship between two numeric variables \u2014 positive means they tend to move together, negative means they move oppositely. Magnitude is in the product of the two variables' units, making raw values hard to interpret.",
    "source": "viltrumite",
    "priority": 1,
    "id": 157
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Covariance \u2014 Failure vlt_clean_0071",
    "back": "Never use covariance to compare relationships across variable pairs with different scales \u2014 a covariance of 500 between revenue and page views vs 0.003 between two probability variables says nothing about relative strength. Use correlation instead.",
    "source": "viltrumite",
    "priority": 1,
    "id": 158
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Covariance \u2014 Use vlt_clean_0072",
    "back": "As an intermediate calculation (e.g., in portfolio variance, regression coefficients, PCA). Rarely reported directly because magnitude isn't interpretable across different variable scales.",
    "source": "viltrumite",
    "priority": 1,
    "id": 159
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Group By \u2014 Breaks if vlt_clean_0105",
    "back": "NULLs all group together as a single group in GROUP BY, unlike in JOIN conditions. Adding a non-aggregated column to SELECT without grouping on it produces an error in strict SQL or an arbitrary value in MySQL.",
    "source": "viltrumite",
    "priority": 1,
    "id": 160
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Group By \u2014 Core answer vlt_clean_0106",
    "back": "Collapses rows that share the same value in the specified column into a single output row so aggregate functions like COUNT, SUM, and AVG can be computed per group.",
    "source": "viltrumite",
    "priority": 1,
    "id": 161
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Group By \u2014 Evaluation vlt_clean_0107",
    "back": "Precision-recall AUC, F1/F-beta on the minority class, confusion matrix at the operational threshold. Do not report overall accuracy as a primary metric.",
    "source": "viltrumite",
    "priority": 1,
    "id": 162
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Group By \u2014 Failure vlt_clean_0108",
    "back": "Do not include non-aggregated columns in SELECT without adding them to GROUP BY \u2014 that either errors or returns arbitrary values. Do not GROUP BY high-cardinality columns unless the large result set is intentional.",
    "source": "viltrumite",
    "priority": 1,
    "id": 163
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Group By \u2014 Use vlt_clean_0109",
    "back": "Whenever you need a per-entity summary: revenue per customer, orders per day, sessions per user per week.",
    "source": "viltrumite",
    "priority": 1,
    "id": 164
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Guardrail Metrics \u2014 Breaks if vlt_clean_0110",
    "back": "A guardrail not defined before the experiment is just exploratory analysis \u2014 it provides no protection guarantee. A threshold set too loosely lets harmful features slip through.",
    "source": "viltrumite",
    "priority": 0,
    "id": 165
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Guardrail Metrics \u2014 Core answer vlt_clean_0111",
    "back": "Pre-specified metrics that must not be harmed by the treatment. They define the floor below which a winning primary metric result still leads to a no-ship decision. They protect against treatments that improve the primary metric at an unacceptable cost elsewhere.",
    "source": "viltrumite",
    "priority": 0,
    "id": 166
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Guardrail Metrics \u2014 Evaluation vlt_clean_0112",
    "back": "Compare AUC and precision-recall AUC on the same validation set. Also compare calibration (reliability diagram or Brier score) since tree models often need Platt scaling or isotonic regression to produce calibrated probabilities.",
    "source": "viltrumite",
    "priority": 0,
    "id": 167
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Guardrail Metrics \u2014 Failure vlt_clean_0113",
    "back": "Do not treat guardrail metrics as secondary metrics to ignore if the primary looks good. Do not set guardrail thresholds too loose \u2014 a guardrail that never triggers provides no real protection.",
    "source": "viltrumite",
    "priority": 0,
    "id": 168
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Guardrail Metrics \u2014 Use vlt_clean_0114",
    "back": "Always define alongside primary metrics before the experiment launches. Typical guardrails are latency, error rate, revenue per user if testing a non-revenue feature, or customer support contact rate.",
    "source": "viltrumite",
    "priority": 0,
    "id": 169
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Heteroscedasticity \u2014 Core answer vlt_clean_0115",
    "back": "The condition where the variance of regression residuals is not constant across levels of the fitted values or predictors; violates OLS assumption of homoscedasticity; solves the problem of identifying when OLS standard errors are incorrect",
    "source": "viltrumite",
    "priority": 1,
    "id": 170
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Heteroscedasticity \u2014 Failure vlt_clean_0116",
    "back": "Don't ignore heteroscedasticity and report OLS p-values as valid \u2014 they are wrong (usually too small, leading to false positives); don't assume heteroscedasticity implies model misspecification (it can occur even with correct functional form)",
    "source": "viltrumite",
    "priority": 1,
    "id": 171
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Inner Join \u2014 Breaks if vlt_clean_0149",
    "back": "If the join key has NULLs, NULL does not equal NULL in SQL \u2014 rows with NULL keys will never match and are silently dropped from both sides.",
    "source": "viltrumite",
    "priority": 1,
    "id": 172
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Inner Join \u2014 Core answer vlt_clean_0150",
    "back": "Returns only rows where the join condition is satisfied in both tables. Rows with no match in either table are excluded entirely.",
    "source": "viltrumite",
    "priority": 1,
    "id": 173
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Inner Join \u2014 Evaluation vlt_clean_0151",
    "back": "Construct the confusion matrix at the operational threshold. Report PR-AUC. Compute expected net value per flagged case = TPR \u00d7 benefit_TP \u2212 FPR \u00d7 cost_FP. If cost data is available, compute total expected value of the model vs the no-model baseline. Monitor precision and recall on rolling labeled production data to detect distribution shift.",
    "source": "viltrumite",
    "priority": 1,
    "id": 174
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Inner Join \u2014 Failure vlt_clean_0152",
    "back": "Do not use when the left table has rows you want to keep regardless of whether a match exists \u2014 you will silently lose those rows with no error or warning.",
    "source": "viltrumite",
    "priority": 1,
    "id": 175
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Inner Join \u2014 Use vlt_clean_0153",
    "back": "When you only want records that exist in both tables \u2014 for example, orders joined to customers where you only want orders with a valid customer record.",
    "source": "viltrumite",
    "priority": 1,
    "id": 176
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Interpreting Experiment Results \u2014 Breaks if vlt_clean_0154",
    "back": "Peeking corrupts the p-value. SRM corrupts effect estimates. Segment heterogeneity means the average effect masks winners and losers. A novelty effect means short-term results may not predict long-term.",
    "source": "viltrumite",
    "priority": 0,
    "id": 177
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Interpreting Experiment Results \u2014 Core answer vlt_clean_0155",
    "back": "Translating statistical outputs \u2014 p-value, confidence interval, effect size \u2014 into a business decision. You need to check: is the effect statistically significant, is it practically meaningful, did guardrails hold, is there SRM, and is the result consistent across key segments?",
    "source": "viltrumite",
    "priority": 0,
    "id": 178
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Interpreting Experiment Results \u2014 Evaluation vlt_clean_0156",
    "back": "For each segment: compute precision, recall, AUC; compare to overall metric and to each other; flag segments where performance drops below a pre-specified threshold; investigate root cause (sparse data, covariate shift, label noise)",
    "source": "viltrumite",
    "priority": 0,
    "id": 179
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Interpreting Experiment Results \u2014 Failure vlt_clean_0157",
    "back": "Do not base the ship decision on p-value alone. Do not ignore a significant guardrail violation because the primary metric looks good. Do not extrapolate results beyond the tested population without validation.",
    "source": "viltrumite",
    "priority": 0,
    "id": 180
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Interpreting Experiment Results \u2014 Use vlt_clean_0158",
    "back": "After every experiment. A rigorous interpretation covers significance, effect size and CI, guardrail status, segment consistency, and whether the effect is business-meaningful.",
    "source": "viltrumite",
    "priority": 0,
    "id": 181
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "LAG \u2014 Core answer vlt_clean_0167",
    "back": "Returns the value of a specified column from a previous row within the same partition, based on a defined offset (default offset = 1 = immediately preceding row). Used to compare a current row's value to a prior row's value without a self-join.",
    "source": "viltrumite",
    "priority": 1,
    "id": 182
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "LAG \u2014 Failure vlt_clean_0168",
    "back": "Do not use LAG without ORDER BY \u2014 the \"previous row\" is undefined without an ordering. Do not assume LAG handles gaps in time series \u2014 if there is a missing month, LAG returns the value two months ago, not NULL.",
    "source": "viltrumite",
    "priority": 1,
    "id": 183
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "LAG \u2014 Use vlt_clean_0169",
    "back": "Use for period-over-period comparisons: revenue vs. previous month, current session length vs. previous session, day-over-day change in active users. Also used for identifying state transitions (e.g., previous order status vs. current).",
    "source": "viltrumite",
    "priority": 1,
    "id": 184
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "LEAD \u2014 Core answer vlt_clean_0170",
    "back": "Returns the value of a specified column from a future row within the same partition, based on a defined offset (default offset = 1 = immediately following row). Symmetric to LAG but looks forward.",
    "source": "viltrumite",
    "priority": 1,
    "id": 185
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "LEAD \u2014 Failure vlt_clean_0171",
    "back": "Same pitfalls as LAG: gaps in time series make the \"next\" row not the logically next time period. Do not use without ORDER BY.",
    "source": "viltrumite",
    "priority": 1,
    "id": 186
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "LEAD \u2014 Use vlt_clean_0172",
    "back": "Use to compute time-to-next-event, next session start time, next order date, or to identify whether a user churned after a given event (LEAD on next_order_date IS NULL = no further order).",
    "source": "viltrumite",
    "priority": 1,
    "id": 187
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Lasso Regression \u2014 Core answer vlt_clean_0175",
    "back": "OLS linear regression with an L1 penalty (\u03bb * sum of |coefficients|) added to the loss function; solves overfitting and performs automatic feature selection by shrinking some coefficients exactly to zero",
    "source": "viltrumite",
    "priority": 1,
    "id": 188
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Lasso Regression \u2014 Failure vlt_clean_0176",
    "back": "Don't use when all features are expected to be relevant (Ridge is better); don't use when correlated feature groups should be selected together (Elastic Net is better \u2014 Lasso arbitrarily selects one from each group)",
    "source": "viltrumite",
    "priority": 1,
    "id": 189
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Lasso Regression \u2014 Use vlt_clean_0177",
    "back": "When you want both regularization and built-in feature selection; when you have many features and expect only a subset to be truly predictive; for producing interpretable sparse models",
    "source": "viltrumite",
    "priority": 1,
    "id": 190
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Left Join \u2014 Core answer vlt_clean_0178",
    "back": "Returns all rows from the left table, plus matching rows from the right table. Where no match exists, right-table columns are filled with NULL.",
    "source": "viltrumite",
    "priority": 1,
    "id": 191
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Left Join \u2014 Failure vlt_clean_0179",
    "back": "Do not add a WHERE clause on a right-table column without accounting for NULLs \u2014 WHERE right.col = 'X' turns a Left Join into an Inner Join by dropping non-matching rows. This is one of the most common SQL bugs.",
    "source": "viltrumite",
    "priority": 1,
    "id": 192
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Left Join \u2014 Use vlt_clean_0180",
    "back": "Use when you want to keep all records from the primary/driving table and optionally enrich with right-table data: users with their most recent order (some users may have no orders), products with or without reviews.",
    "source": "viltrumite",
    "priority": 1,
    "id": 193
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "MDE \u2014 Breaks if vlt_clean_0189",
    "back": "If metric variance is higher than assumed, the actual MDE is larger than planned and the experiment is underpowered. If sample size drops due to SRM or early stop, MDE rises.",
    "source": "viltrumite",
    "priority": 0,
    "id": 194
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "MDE \u2014 Core answer vlt_clean_0190",
    "back": "The smallest true effect size that your experiment design \u2014 sample size, alpha, power \u2014 can reliably detect. It is not the expected effect. It is the threshold below which the test is essentially blind.",
    "source": "viltrumite",
    "priority": 0,
    "id": 195
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "MDE \u2014 Evaluation vlt_clean_0191",
    "back": "Check for data leakage by verifying all date features are computable at prediction time; validate cyclical features with sin/cos encoding (hour 23 and hour 0 should be close, not far apart); test whether adding date features improves validation performance",
    "source": "viltrumite",
    "priority": 0,
    "id": 196
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "MDE \u2014 Failure vlt_clean_0192",
    "back": "Do not set MDE post-hoc based on what your sample produced \u2014 that is the observed power fallacy. Do not confuse MDE with the expected effect size. If your MDE is 5% but you realistically expect 1%, the experiment will almost certainly return a null result.",
    "source": "viltrumite",
    "priority": 0,
    "id": 197
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "MDE \u2014 Use vlt_clean_0193",
    "back": "Use MDE to sanity-check experiment feasibility before launch. If the MDE implied by your sample size is 10 percentage points but the business only cares about a 1 percentage point change, the experiment cannot answer the question. Also use it to set stakeholder expectations.",
    "source": "viltrumite",
    "priority": 0,
    "id": 198
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Metric Design \u2014 Breaks if vlt_clean_0194",
    "back": "An insensitive metric makes the experiment underpowered by design. A gameable metric means the treatment optimizes the number without delivering real value \u2014 that is Goodhart's Law in action.",
    "source": "viltrumite",
    "priority": 0,
    "id": 199
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Metric Design \u2014 Core answer vlt_clean_0195",
    "back": "Choosing and defining the specific numeric quantity that an experiment will measure and optimize. A good metric is sensitive \u2014 it moves when the treatment works \u2014 stable enough to detect, valid in the sense that it is causally connected to the intervention, and aligned with long-term business value.",
    "source": "viltrumite",
    "priority": 0,
    "id": 200
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Metric Design \u2014 Evaluation vlt_clean_0196",
    "back": "Verify output column order (ColumnTransformer reorders columns \u2014 confirm feature names via get_feature_names_out()); check that numeric and categorical columns are correctly partitioned; validate no columns are accidentally dropped",
    "source": "viltrumite",
    "priority": 0,
    "id": 201
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Metric Design \u2014 Failure vlt_clean_0197",
    "back": "Do not use a metric that can be trivially gamed \u2014 like measuring raw clicks when the treatment adds a misleading button. Do not use a metric with a very long measurement window for a short experiment \u2014 use validated short-term proxies instead.",
    "source": "viltrumite",
    "priority": 0,
    "id": 202
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Metric Design \u2014 Use vlt_clean_0198",
    "back": "At experiment design time, before power analysis. Metric choice determines the power calculation, the MDE, and the validity of everything that follows.",
    "source": "viltrumite",
    "priority": 0,
    "id": 203
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Normal Distribution \u2014 Core answer vlt_clean_0205",
    "back": "Models continuous symmetric bell-shaped phenomena; mathematically convenient because sums of many independent random variables converge to it (CLT), and many statistical procedures assume it.",
    "source": "viltrumite",
    "priority": 1,
    "id": 204
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Normal Distribution \u2014 Failure vlt_clean_0206",
    "back": "Not for counts (use Poisson/NB), bounded proportions (use Beta), right-skewed positives (use log-normal or exponential). Never use for heavy-tailed phenomena like financial returns without checking kurtosis.",
    "source": "viltrumite",
    "priority": 1,
    "id": 205
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Normal Distribution \u2014 Use vlt_clean_0207",
    "back": "Modeling measurement errors, residuals in regression, test statistics when CLT applies, generating features under certain ML assumptions.",
    "source": "viltrumite",
    "priority": 1,
    "id": 206
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Null Hypothesis (H0) \u2014 Core answer vlt_clean_0211",
    "back": "Defines the default assumption the test is designed to challenge \u2014 typically that there is no effect, no difference, or no change. It is what you assume to be true before seeing data, and it must be falsifiable and precisely stated (e.g., mu_control = mu_treatment, not just \"no effect\").",
    "source": "viltrumite",
    "priority": 0,
    "id": 207
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Null Hypothesis (H0) \u2014 Failure vlt_clean_0212",
    "back": "Don't say \"we accepted H0\" \u2014 failing to reject H0 only means insufficient evidence against it, not that it is true. Don't set H0 as the thing you want to prove (that's H1).",
    "source": "viltrumite",
    "priority": 0,
    "id": 208
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Null Hypothesis (H0) \u2014 Use vlt_clean_0213",
    "back": "Always. Every hypothesis test requires an explicit H0. It anchors the null distribution from which the p-value is computed.",
    "source": "viltrumite",
    "priority": 0,
    "id": 209
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Outcome window \u2014 Core answer vlt_clean_0222",
    "back": "The time period after treatment assignment during which outcome metrics are measured; solves the problem of defining when and how long to observe the effect of a treatment",
    "source": "viltrumite",
    "priority": 0,
    "id": 210
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Outcome window \u2014 Failure vlt_clean_0223",
    "back": "Don't extend the outcome window after peeking at results (p-hacking via window extension); don't include outcomes that happen before treatment takes effect; don't measure conversion so early that most users haven't had a chance to convert",
    "source": "viltrumite",
    "priority": 0,
    "id": 211
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Outcome window \u2014 Use vlt_clean_0224",
    "back": "Specifying the measurement window (e.g., 7-day conversion, 30-day retention) before running the experiment; ensuring consistent exposure time per user",
    "source": "viltrumite",
    "priority": 0,
    "id": 212
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "P-Value \u2014 Core answer vlt_clean_0225",
    "back": "The probability of observing a test statistic as extreme as or more extreme than the one computed, assuming H0 is true.",
    "source": "viltrumite",
    "priority": 0,
    "id": 213
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "P-Value \u2014 Failure vlt_clean_0226",
    "back": "Never interpret p-value as P(H0 is true) or P(result is a fluke). A small p-value does not mean a large or practically important effect. A large p-value does not prove H0. p-value is not the probability you made an error.",
    "source": "viltrumite",
    "priority": 0,
    "id": 214
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "P-Value \u2014 Use vlt_clean_0227",
    "back": "As the decision threshold input: if p <= alpha, reject H0. Use alongside effect size and CI \u2014 never in isolation.",
    "source": "viltrumite",
    "priority": 0,
    "id": 215
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Pearson Correlation \u2014 Core answer vlt_clean_0233",
    "back": "Normalises covariance to a dimensionless \u22121 to +1 scale so the strength of a linear relationship is comparable across variable pairs regardless of units.",
    "source": "viltrumite",
    "priority": 1,
    "id": 216
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Pearson Correlation \u2014 Failure vlt_clean_0234",
    "back": "Non-linear relationships: Pearson r can be ~0 even with a strong non-linear association (e.g., quadratic). Outliers distort it. Don't interpret r as proportion of variance explained \u2014 that's r\u00b2 (coefficient of determination).",
    "source": "viltrumite",
    "priority": 1,
    "id": 217
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Pearson Correlation \u2014 Use vlt_clean_0235",
    "back": "When you want to quantify and compare the strength of linear associations \u2014 feature selection, collinearity diagnosis, EDA.",
    "source": "viltrumite",
    "priority": 1,
    "id": 218
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Power \u2014 Breaks if vlt_clean_0236",
    "back": "An underpowered test means a true effect exists but the test misses it \u2014 Type 2 error. If the real effect is smaller than your MDE, the test will correctly show no significant result but the effect goes undetected.",
    "source": "viltrumite",
    "priority": 0,
    "id": 219
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Power \u2014 Core answer vlt_clean_0237",
    "back": "The probability of correctly rejecting the null when the alternative is true \u2014 the probability of detecting a real effect of a specified size. Power equals 1 minus beta. At 80% power you have a 20% chance of missing a true effect of the specified MDE.",
    "source": "viltrumite",
    "priority": 0,
    "id": 220
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Power \u2014 Evaluation vlt_clean_0238",
    "back": "Check whether sample mean has stabilized by plotting cumulative mean over increasing n; large variance populations converge more slowly",
    "source": "viltrumite",
    "priority": 0,
    "id": 221
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Power \u2014 Failure vlt_clean_0239",
    "back": "Do not run underpowered experiments and then conclude there is no effect \u2014 an underpowered null result only means you could not detect it, not that it does not exist. Do not confuse power with confidence level.",
    "source": "viltrumite",
    "priority": 0,
    "id": 222
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Power \u2014 Use vlt_clean_0240",
    "back": "Run a power analysis before the experiment to determine the required sample size. Given alpha, desired power, and MDE, solve for n. Higher power requires larger n.",
    "source": "viltrumite",
    "priority": 0,
    "id": 223
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Primary Metrics \u2014 Core answer vlt_clean_0249",
    "back": "The one (or at most two) pre-specified outcome metrics that the experiment is powered to detect an effect on and that directly answer the business question. The primary metric determines sample size and is the basis for the go/no-go decision.",
    "source": "viltrumite",
    "priority": 0,
    "id": 224
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Primary Metrics \u2014 Failure vlt_clean_0250",
    "back": "Don't designate multiple metrics as co-primary without applying multiple comparison correction \u2014 this inflates Type 1 error. Don't switch the primary metric mid-experiment or post-hoc based on which metric happened to be significant.",
    "source": "viltrumite",
    "priority": 0,
    "id": 225
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Primary Metrics \u2014 Use vlt_clean_0251",
    "back": "Use to make the binary ship/no-ship decision. If the primary metric moves in the desired direction at the pre-specified alpha, the experiment is a success by design.",
    "source": "viltrumite",
    "priority": 0,
    "id": 226
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "RANK \u2014 Core answer vlt_clean_0252",
    "back": "Assigns a rank to each row within a partition based on ORDER BY values. Tied rows receive the same rank. The next rank after a tie skips numbers equal to the count of tied rows (e.g., 1, 2, 2, 4 \u2014 rank 3 is skipped).",
    "source": "viltrumite",
    "priority": 1,
    "id": 227
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "RANK \u2014 Failure vlt_clean_0253",
    "back": "Do not use when consecutive rank numbers are required (use DENSE_RANK). Do not use for deduplication (use ROW_NUMBER).",
    "source": "viltrumite",
    "priority": 1,
    "id": 228
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "ROW NUMBER \u2014 Breaks if vlt_clean_0265",
    "back": "If the ORDER BY values are not unique and you add no tiebreaker, two rows with identical order values can non-deterministically get row numbers 1 and 2 \u2014 your dedup queries can return different rows on different runs.",
    "source": "viltrumite",
    "priority": 1,
    "id": 229
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "ROW NUMBER \u2014 Core answer vlt_clean_0266",
    "back": "Assigns a unique sequential integer to each row within a partition, ordered by a specified column. No ties \u2014 every row gets a distinct number even if the ORDER BY values are equal.",
    "source": "viltrumite",
    "priority": 1,
    "id": 230
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "ROW NUMBER \u2014 Failure vlt_clean_0267",
    "back": "Do not use when ties should share the same rank \u2014 ROW_NUMBER always breaks ties arbitrarily. Do not use for ranking where business logic requires shared rank positions for equal values.",
    "source": "viltrumite",
    "priority": 1,
    "id": 231
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "ROW NUMBER \u2014 Use vlt_clean_0268",
    "back": "Deduplication where you keep the row with ROW_NUMBER equals 1 per group, pagination, or selecting the single most recent record per entity.",
    "source": "viltrumite",
    "priority": 1,
    "id": 232
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Ridge Regression \u2014 Core answer vlt_clean_0281",
    "back": "OLS linear regression with an L2 penalty (\u03bb * sum of squared coefficients) added to the loss function; solves multicollinearity and overfitting by shrinking coefficients toward zero without eliminating them",
    "source": "viltrumite",
    "priority": 1,
    "id": 233
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Ridge Regression \u2014 Failure vlt_clean_0282",
    "back": "Don't use when you need feature selection (Ridge never zeros out coefficients \u2014 use Lasso or Elastic Net); don't forget to scale features before applying Ridge (unscaled features get unfair penalty)",
    "source": "viltrumite",
    "priority": 1,
    "id": 234
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Ridge Regression \u2014 Use vlt_clean_0283",
    "back": "When features are correlated (multicollinearity), when p is large relative to n, when you want to regularize but keep all features in the model; standard choice before trying Lasso",
    "source": "viltrumite",
    "priority": 1,
    "id": 235
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Running totals \u2014 Core answer vlt_clean_0284",
    "back": "A running total is a cumulative sum of a numeric column ordered by a sequence (usually time), computed using SUM() OVER (PARTITION BY ... ORDER BY ... ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW).",
    "source": "viltrumite",
    "priority": 1,
    "id": 236
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Running totals \u2014 Failure vlt_clean_0285",
    "back": "Do not use RANGE frame when the ORDER BY column has duplicate values \u2014 RANGE will include all ties in the current step, producing jumps in the running total instead of row-by-row accumulation. Use ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for strict row-level accumulation.",
    "source": "viltrumite",
    "priority": 1,
    "id": 237
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Running totals \u2014 Use vlt_clean_0286",
    "back": "Use for cumulative revenue by date, cumulative signups, cumulative spend per user, progress toward a quota.",
    "source": "viltrumite",
    "priority": 1,
    "id": 238
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "SRM \u2014 Breaks if vlt_clean_0287",
    "back": "Users are systematically missing from one arm due to a logging bug, bot filtering, or redirect error. Results are biased in an unknown direction and cannot be trusted.",
    "source": "viltrumite",
    "priority": 0,
    "id": 239
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "SRM \u2014 Core answer vlt_clean_0288",
    "back": "Sample Ratio Mismatch \u2014 when the observed split between control and treatment differs significantly from the intended split. It indicates a bug in randomization, logging, or assignment \u2014 not a real treatment effect.",
    "source": "viltrumite",
    "priority": 0,
    "id": 240
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "SRM \u2014 Evaluation vlt_clean_0289",
    "back": "Verify that ELSE covers all unmatched cases. Check for NULL results in output where ELSE was omitted. Confirm that conditions are mutually exclusive when ordering matters.",
    "source": "viltrumite",
    "priority": 0,
    "id": 241
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "SRM \u2014 Failure vlt_clean_0290",
    "back": "Never proceed to analyze outcomes when SRM is present. Never assume a small imbalance is harmless \u2014 even 1 to 2 percent can introduce systematic bias if the missing users are non-random.",
    "source": "viltrumite",
    "priority": 0,
    "id": 242
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "SRM \u2014 Use vlt_clean_0291",
    "back": "Run it as a mandatory pre-analysis check before interpreting any experiment results. If SRM is detected, stop the analysis. The experiment is invalid regardless of what the p-value says.",
    "source": "viltrumite",
    "priority": 0,
    "id": 243
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Standard Deviation \u2014 Core answer vlt_clean_0303",
    "back": "Converts variance back to the original units of the data, making spread interpretable alongside the mean.",
    "source": "viltrumite",
    "priority": 1,
    "id": 244
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Standard Deviation \u2014 Failure vlt_clean_0304",
    "back": "Skewed or heavy-tailed data: SD is still dominated by extreme values. Don't conflate SD with a \"safe range\" \u2014 that only holds if data are approximately normal.",
    "source": "viltrumite",
    "priority": 1,
    "id": 245
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Standard Deviation \u2014 Use vlt_clean_0305",
    "back": "Communicating spread to stakeholders; constructing confidence intervals (mean \u00b1 z\u00b7\u03c3/\u221an); z-scoring features for ML. (",
    "source": "viltrumite",
    "priority": 1,
    "id": 246
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Type 1 Error \u2014 Core answer vlt_clean_0321",
    "back": "Rejecting H0 when it is actually true \u2014 a false positive. The probability of this is alpha (the significance level). In practice: concluding a feature works when it actually has no effect, and shipping it.",
    "source": "viltrumite",
    "priority": 0,
    "id": 247
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Type 1 Error \u2014 Failure vlt_clean_0322",
    "back": "Don't conflate Type 1 error with overall decision error \u2014 the base rate of true nulls matters. If 90% of tested features truly have no effect, even a 5% alpha means nearly all \"significant\" results could be false positives (base rate fallacy).",
    "source": "viltrumite",
    "priority": 0,
    "id": 248
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Type 1 Error \u2014 Use vlt_clean_0323",
    "back": "Understand as the baseline false positive rate you're accepting. In business: Type 1 error = launching a feature that does nothing (or is harmful), wasting engineering/product resources.",
    "source": "viltrumite",
    "priority": 0,
    "id": 249
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Type 2 Error \u2014 Core answer vlt_clean_0324",
    "back": "Failing to reject H0 when H1 is actually true \u2014 a false negative. The probability of this is beta. In practice: concluding a feature has no effect when it actually does, and not shipping a beneficial change.",
    "source": "viltrumite",
    "priority": 0,
    "id": 250
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Type 2 Error \u2014 Failure vlt_clean_0325",
    "back": "Don't conclude \"the feature doesn't work\" from a non-significant result in an underpowered test. The correct statement is \"we did not detect an effect at the specified MDE with the available sample.\" Not the same thing.",
    "source": "viltrumite",
    "priority": 0,
    "id": 251
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Type 2 Error \u2014 Use vlt_clean_0326",
    "back": "Understand as the missed detection rate. In business: Type 2 error = not shipping a feature that genuinely improves a metric, leaving real value unrealised.",
    "source": "viltrumite",
    "priority": 0,
    "id": 252
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Unit of randomization \u2014 Breaks if vlt_clean_0327",
    "back": "Session-level randomization for a pricing test means the same user can see different prices in different sessions \u2014 user confusion, invalid control, and inflated noise.",
    "source": "viltrumite",
    "priority": 0,
    "id": 253
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Unit of randomization \u2014 Core answer vlt_clean_0328",
    "back": "The entity \u2014 user, session, device, market \u2014 at which random assignment to treatment or control is made. The right choice ensures assignment is independent and minimizes interference between units.",
    "source": "viltrumite",
    "priority": 0,
    "id": 254
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Unit of randomization \u2014 Evaluation vlt_clean_0329",
    "back": "Build a correlation heatmap; flag pairs with |r| > 0.9; check SHAP values of each correlated feature to identify which carries more unique signal; validate model performance before and after dropping one of each pair",
    "source": "viltrumite",
    "priority": 0,
    "id": 255
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Unit of randomization \u2014 Failure vlt_clean_0330",
    "back": "Do not randomize at the session level if users can see both experiences across sessions \u2014 that creates within-user contamination. Do not randomize at a coarser level than necessary, that reduces power.",
    "source": "viltrumite",
    "priority": 0,
    "id": 256
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "Unit of randomization \u2014 Use vlt_clean_0331",
    "back": "This is a key decision you make before launching any A/B test. It directly affects statistical power, interference risk, and how interpretable the results are.",
    "source": "viltrumite",
    "priority": 0,
    "id": 257
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "Variance \u2014 Failure vlt_clean_0336",
    "back": "Never report variance as a standalone metric to non-technical audiences \u2014 units are squared. Don't use when distribution is heavy-tailed; variance may not even be finite (e.g., Pareto-tailed distributions).",
    "source": "viltrumite",
    "priority": 1,
    "id": 258
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What Can Go Wrong: Novelty Effect Peeking Bad Randomisation Biased Metrics \u2014 Core answer vlt_clean_0339",
    "back": "Four distinct failure modes: (1) Novelty effect: users engage with any change temporarily \u2014 short experiments overestimate the true steady-state effect. (2) Peeking: checking significance repeatedly inflates Type 1 error beyond alpha. (3) Bad randomisation: SRM or correlated assignment creates non-comparable groups. (4) Biased metrics: the metric moves for reasons other than the treatment's intended mechanism.",
    "source": "viltrumite",
    "priority": 0,
    "id": 259
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What Can Go Wrong: Novelty Effect Peeking Bad Randomisation Biased Metrics \u2014 Failure vlt_clean_0340",
    "back": "Don't dismiss experiment results as invalid without identifying which failure mode occurred. Don't assume all confounds are captured by randomisation \u2014 biased metrics can corrupt results even with perfect randomisation.",
    "source": "viltrumite",
    "priority": 0,
    "id": 260
  },
  {
    "topic": "experimentation",
    "subtopic": "experimentation",
    "front": "What Can Go Wrong: Novelty Effect Peeking Bad Randomisation Biased Metrics \u2014 Use vlt_clean_0341",
    "back": "Know all four and diagnose them: novelty effect diagnosis requires running the experiment longer and checking if the effect decays; peeking requires checking whether early stopping occurred; bad randomisation requires SRM test; biased metrics require checking the metric causal chain.",
    "source": "viltrumite",
    "priority": 0,
    "id": 261
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "What are the three operational buckets and what do they mean? vlt_clean_0345",
    "back": "Situation/Goal: Convert raw risk scores into decisions a lender can act on. Action: Approve if score < 0.08; Review if 0.08 \u2264 score < 0.25; Reject if score \u2265 0.25. Result + scope: Low-risk tail auto-approved, uncertain middle sent to human review, high-risk tail auto-rejected. Contrast: raw score vs routed action.",
    "source": "viltrumite",
    "priority": 0,
    "id": 262
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "What exact cost weights drove the decision policy, and why do they matter? vlt_clean_0352",
    "back": "Situation/Goal: Policy should reflect asymmetric business cost, not just F1. Action: Used false approval = 5.0, harsh reject = 1.0, review = 0.25 per applicant in a grid over approve/reject thresholds. Result + scope: Thresholds reflect business loss asymmetry and review-capacity economics, not arbitrary cutoffs. Contrast: metric-optimal threshold vs cost-weighted policy.",
    "source": "viltrumite",
    "priority": 0,
    "id": 263
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "What is the difference between 0.18 and 0.08 / 0.25? vlt_clean_0354",
    "back": "Situation/Goal: There are two threshold concepts in this project, and candidates often blur them. Action: 0.18 was the best single binary cutoff from a threshold sweep on calibrated scores, where F1 peaked at 0.323 with precision 0.263 and recall 0.420. The 0.08 and 0.25 thresholds came later from the cost-weighted policy grid. Result + scope: Those policy thresholds define approve, review, and reject. So 0.18 is the best binary operating point, while 0.08/0.25 are business-policy cutoffs for three-way routing. Interviewer lens: This tests precision of thought under pressure. Contrast: F1-optimal binary threshold vs cost-weighted policy thresholds Do not say: \u201c0.18 was the project threshold.\u201d",
    "source": "viltrumite",
    "priority": 0,
    "id": 264
  },
  {
    "topic": "product",
    "subtopic": "product_workflow",
    "front": "What's the most honest way to describe this project? vlt_clean_0359",
    "back": "S: easy to overclaim maturity on RAG-style projects; interview risk is truthfulness, not buzzwords T: frame the project accurately without underselling the real work A: describe it as retrieval-first grounded knowledge system; mention standalone LM Studio synthesis path; qualify what is not fully proven R: credible description: portfolio-grade, not productionized; strongest proof is retrieval pipeline + standalone synthesis, not enterprise serving maturity Follow-ups \u2022 What would be an overclaim here? (production platform / fully integrated serving) \u2022 What is the strongest honest claim? (grounded QA with demonstrated standalone local synthesis)",
    "source": "viltrumite",
    "priority": 1,
    "id": 265
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Where \u2014 Core answer vlt_clean_0363",
    "back": "rows based filtering applied on non aggregated features",
    "source": "viltrumite",
    "priority": 1,
    "id": 266
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "Where \u2014 Failure vlt_clean_0364",
    "back": "where won't filter on agg column results, where won't filer on a select alias",
    "source": "viltrumite",
    "priority": 1,
    "id": 267
  },
  {
    "topic": "product",
    "subtopic": "product_workflow",
    "front": "Why not build more\u2014auth, Docker, agents? vlt_clean_0369",
    "back": "S: many portfolio projects inflate scope and become fake-full-stack demos T: justify scope reduction as a principled decision, not a time excuse A: focused effort on retrieval reliability, auditability, and truthful control plane; avoided pretending ops maturity that was not validated R: smaller but defensible system; stronger interview story because the hard part was made real instead of broad but shallow Follow-ups \u2022 So was it a time issue or a choice? (choice to prioritize truthful core) \u2022 What would you add first next? (main-path synthesis integration + logging)",
    "source": "viltrumite",
    "priority": 1,
    "id": 268
  },
  {
    "topic": "product",
    "subtopic": "product_workflow",
    "front": "Why these design choices instead of the obvious alternatives? vlt_clean_0373",
    "back": "S: good ownership includes being able to argue against your own design T: summarize the comparative logic cleanly A: fixed-size chunks over recursive for predictability; MiniLM over larger hosted models for local speed and zero API dependency; IndexFlatIP over HNSW for exact search at demo scale; standalone LM Studio over cloud endpoint for local-first synthesis proof R: coherent design philosophy: local, honest, small-scale, testable, and easier to defend under scrutiny Follow-ups \u2022 What unifies these choices? (truthful scope + local-first simplicity) \u2022 What would change first if scope expanded? (hybrid retrieval, ANN, stronger service path)",
    "source": "viltrumite",
    "priority": 1,
    "id": 269
  },
  {
    "topic": "metrics",
    "subtopic": "metrics",
    "front": "[TRAP] Why is 0.08 your approve threshold and not 0.05 or 0.12? vlt_clean_0382",
    "back": "Situation/Goal: The key issue is whether the threshold was chosen by feel or by objective. Action: I ran a cost-weighted grid over approve/reject threshold pairs with false approvals weighted 5x, harsh rejects 1x, and manual review 0.25x per applicant. Result + scope: Under that objective, 0.08 was the grid-selected approve threshold. So the answer is not \u2018it looked right on the distribution\u2019; it was tied to a policy objective and review-band feasibility. Interviewer lens: This catches arbitrary-threshold storytelling immediately. Contrast: grid-selected threshold vs eyeballed threshold Do not say: \u201c0.08 just looked like a good conservative cutoff.\u201d",
    "source": "viltrumite",
    "priority": 0,
    "id": 270
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "date functions \u2014 Core answer vlt_clean_0417",
    "back": "SQL date functions extract, truncate, compare, and compute differences between date/datetime values. Core operations: truncating to a period (DATE_TRUNC), extracting a component (EXTRACT / DATEPART), computing differences (DATEDIFF), adding/subtracting intervals (DATE_ADD / DATEADD), and getting the current timestamp (CURRENT_DATE, NOW(), GETDATE()).",
    "source": "viltrumite",
    "priority": 1,
    "id": 271
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "date functions \u2014 Failure vlt_clean_0418",
    "back": "Do not compare DATE to TIMESTAMP without casting \u2014 implicit conversion can produce off-by-one errors at midnight boundaries. Do not assume DATEDIFF counts full calendar units the same way across databases (SQL Server DATEDIFF counts boundary crossings, not elapsed time).",
    "source": "viltrumite",
    "priority": 1,
    "id": 272
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "date functions \u2014 Use vlt_clean_0419",
    "back": "Use for: grouping events by week/month/quarter, computing user tenure (days since signup), computing days between events (time-to-convert, time-to-churn), filtering to a rolling window (WHERE event_date >= CURRENT_DATE - INTERVAL '30 days').",
    "source": "viltrumite",
    "priority": 1,
    "id": 273
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "duplicates / deduping logic \u2014 Core answer vlt_clean_0425",
    "back": "Deduplication identifies and removes redundant rows from a dataset, where \"redundant\" is defined by a key (all columns equal, or a subset of columns equal with a tie-breaking rule for which row to keep).",
    "source": "viltrumite",
    "priority": 1,
    "id": 274
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "duplicates / deduping logic \u2014 Failure vlt_clean_0426",
    "back": "Do not deduplicate before understanding why duplicates exist \u2014 they may indicate a data pipeline bug that should be fixed upstream, or they may be legitimate repeated events. Deduplication masks the root cause if applied blindly.",
    "source": "viltrumite",
    "priority": 1,
    "id": 275
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "duplicates / deduping logic \u2014 Use vlt_clean_0427",
    "back": "Use dedup logic when: a fact table has repeated event rows from ETL errors, a user table has multiple records per user from different signup sources, or you need one row per entity for a join.",
    "source": "viltrumite",
    "priority": 1,
    "id": 276
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "null handling \u2014 Core answer vlt_clean_0450",
    "back": "NULL in SQL is the absence of a value, not zero or empty string. Any arithmetic or comparison involving NULL returns NULL. NULL = NULL is FALSE \u2014 NULLs must be tested with IS NULL or IS NOT NULL. Aggregate functions (SUM, AVG, COUNT) ignore NULLs except COUNT(*).",
    "source": "viltrumite",
    "priority": 1,
    "id": 277
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "null handling \u2014 Failure vlt_clean_0451",
    "back": "Do not use WHERE col = NULL \u2014 this always returns zero rows. Do not assume AVG ignores NULLs harmlessly \u2014 if NULLs are not random, AVG is biased. Do not assume COALESCE and IFNULL are interchangeable across all databases (IFNULL is MySQL/SQLite only; COALESCE is ANSI SQL standard).",
    "source": "viltrumite",
    "priority": 1,
    "id": 278
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "null handling \u2014 Use vlt_clean_0452",
    "back": "Handle NULLs explicitly whenever: joining on nullable columns, aggregating a column with NULLs, filtering on nullable columns, computing ratios or differences. Use COALESCE(col, default) to replace NULLs with a fallback. Use NULLIF(a, b) to produce NULL when a = b (safe division: val / NULLIF(denominator, 0)).",
    "source": "viltrumite",
    "priority": 1,
    "id": 279
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "top-N per group \u2014 Core answer vlt_clean_0505",
    "back": "Retrieves the top N rows within each partition of a dataset, ordered by a specified metric, without collapsing the result \u2014 e.g., top 3 products by revenue per category, most recent 2 orders per customer.",
    "source": "viltrumite",
    "priority": 1,
    "id": 280
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "top-N per group \u2014 Failure vlt_clean_0506",
    "back": "Do not use ROW_NUMBER when ties should return more than N rows \u2014 ROW_NUMBER breaks ties arbitrarily and may exclude a row that is tied for Nth place. Do not filter window functions in the same WHERE clause as their SELECT \u2014 you must wrap in a subquery or CTE first.",
    "source": "viltrumite",
    "priority": 1,
    "id": 281
  },
  {
    "topic": "sql",
    "subtopic": "analytics_sql",
    "front": "top-N per group \u2014 Use vlt_clean_0507",
    "back": "Use for: top-N product recommendations per user, most recent N events per session, highest-performing campaigns per channel, identifying the top churners per cohort.",
    "source": "viltrumite",
    "priority": 1,
    "id": 282
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is an A/B test in the context of product experimentation?",
    "back": "An A/B test is a randomized controlled experiment where users are split into a control group (A, sees current experience) and a treatment group (B, sees the new feature or change). By randomizing assignment and measuring outcomes for each group simultaneously, we isolate the causal effect of the change from other factors, enabling data-driven product decisions.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 283
  },
  {
    "topic": "experimentation",
    "subtopic": "ab_basics",
    "front": "What is the null hypothesis and alternative hypothesis in an A/B test?",
    "back": "Null hypothesis (H0): the treatment has no effect \u2014 any observed difference is due to random chance (e.g., conversion rates are equal: \u03bcA = \u03bcB). Alternative hypothesis (H1): the treatment has a real effect (\u03bcA \u2260 \u03bcB for two-sided, or \u03bcB > \u03bcA for one-sided). We test whether the data provides enough evidence to reject H0 in favor of H1.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 284
  },
  {
    "topic": "experimentation",
    "subtopic": "ab_basics",
    "front": "What is the randomization unit in an A/B test and why does the choice matter?",
    "back": "The randomization unit is the entity assigned to control or treatment (user, session, request, device). Choosing user-level randomization ensures a single user always sees the same variant, preventing within-user contamination. Session-level is used when sessions are independent. Request-level works for stateless APIs. Mismatched units (randomize by user but analyze by session) inflate false positives due to within-unit correlation.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 285
  },
  {
    "topic": "experimentation",
    "subtopic": "ab_basics",
    "front": "What is the SUTVA assumption in A/B testing and when is it violated?",
    "back": "SUTVA (Stable Unit Treatment Value Assumption): each unit's outcome depends only on its own treatment assignment, not on others'. Violated by: network effects (user A's outcome depends on whether their friends are in treatment), shared resources (one group's heavy usage slows the other), or marketplace interference (treatment users compete with control users for limited supply). Violations invalidate standard A/B test p-values.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 286
  },
  {
    "topic": "experimentation",
    "subtopic": "ab_basics",
    "front": "What is an A/A test and why do you run one?",
    "back": "An A/A test splits users into two groups that both receive the identical experience. Purpose: validate the experimentation infrastructure. A correctly implemented system should show no statistically significant difference between A and A groups (p-values should be uniformly distributed, ~5% of A/A tests significant at \u03b1=0.05 by chance). Consistently significant A/A results indicate a bug in randomization, logging, or metric computation.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 287
  },
  {
    "topic": "experimentation",
    "subtopic": "ab_basics",
    "front": "What is the difference between the control group and the treatment group in an experiment?",
    "back": "Control group: receives the current, unchanged experience (baseline). Treatment group: receives the new feature, change, or intervention being tested. The treatment effect is estimated as the difference in outcome metrics between groups. The control group's metrics serve as the counterfactual \u2014 what would have happened to treatment users had they not received the treatment.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 288
  },
  {
    "topic": "experimentation",
    "subtopic": "ab_basics",
    "front": "What is exposure logging in an experiment and why is it critical?",
    "back": "Exposure logging records a timestamped event when a user is actually exposed to the treatment (e.g., sees the new UI element). This is separate from assignment logging (when the user was bucketed). Analysis should be restricted to exposed users \u2014 including assigned-but-not-exposed users dilutes the treatment effect (intention-to-treat dilution). Missing exposure logs make it impossible to calculate accurate exposure rates or diagnose dilution.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 289
  },
  {
    "topic": "experimentation",
    "subtopic": "sample_size_power",
    "front": "What is dilution in an A/B experiment and how does it affect results?",
    "back": "Dilution occurs when users assigned to the treatment group do not actually receive the treatment (e.g., they never triggered the feature). Their outcomes are counted as treatment outcomes even though they experienced the control. Dilution shrinks the measured treatment effect toward zero, reducing statistical power. Fix: analyze only exposed users (per-exposure analysis) or use an intent-to-treat analysis with awareness of the dilution factor.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 290
  },
  {
    "topic": "experimentation",
    "subtopic": "ab_basics",
    "front": "How does Bernoulli randomization work in A/B test assignment?",
    "back": "Bernoulli randomization: each user is independently assigned to treatment with probability p (e.g., p=0.5 for 50/50 split). It is the simplest assignment scheme \u2014 flip a coin per user. Advantage: easy to implement. Disadvantage: group sizes are random (may deviate from 50/50 by chance). For controlled splits, use modular hashing. Bernoulli randomization satisfies independence but can produce unequal group sizes in small experiments.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 291
  },
  {
    "topic": "experimentation",
    "subtopic": "ab_basics",
    "front": "How does hash-based assignment ensure a user always sees the same variant across sessions?",
    "back": "Hash-based assignment computes a deterministic hash of (user_id + experiment_id), maps the hash to a bucket (0\u201399), and assigns treatment if bucket < traffic_split percentage. Since the hash is deterministic, the same user always falls in the same bucket for the same experiment, ensuring consistent exposure across sessions and page loads without storing assignment state in a database.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 292
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is the correct definition of a p-value in a hypothesis test?",
    "back": "The p-value is the probability of observing a test statistic at least as extreme as the one computed from the data, assuming the null hypothesis is true. It is NOT the probability that H0 is true, nor the probability the result occurred by chance. A small p-value means the data is unlikely under H0, providing evidence against H0, but it says nothing about effect size or practical significance.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 293
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is a Type I error in hypothesis testing?",
    "back": "A Type I error (false positive) occurs when you reject the null hypothesis when it is actually true \u2014 concluding the treatment has an effect when it does not. The probability of a Type I error is \u03b1 (significance level, typically 0.05). Running many tests without correction increases the family-wise Type I error rate above \u03b1.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 294
  },
  {
    "topic": "experimentation",
    "subtopic": "sample_size_power",
    "front": "What is a Type II error and how is it related to statistical power?",
    "back": "A Type II error (false negative) occurs when you fail to reject the null hypothesis when it is actually false \u2014 missing a real treatment effect. The probability of a Type II error is \u03b2. Statistical power = 1 \u2212 \u03b2 = probability of correctly detecting a true effect. Under-powered experiments have high \u03b2, frequently missing real improvements and leading to wrong ship/no-ship decisions.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 295
  },
  {
    "topic": "experimentation",
    "subtopic": "sample_size_power",
    "front": "What is statistical power and what factors determine it?",
    "back": "Statistical power is the probability of correctly rejecting H0 when H1 is true (= 1 \u2212 \u03b2). Determined by: (1) effect size \u03b4 \u2014 larger effect, higher power; (2) sample size n \u2014 more data, higher power; (3) variance \u03c3\u00b2 \u2014 lower variance, higher power; (4) significance level \u03b1 \u2014 looser \u03b1, higher power. Standard target: 80% power (\u03b2=0.20). Power analysis before an experiment determines required sample size.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 296
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What are the key assumptions of a two-sample t-test?",
    "back": "Two-sample t-test assumes: (1) Independence \u2014 observations within and across groups are independent (violated by clustering or network effects). (2) Normality \u2014 metric is approximately normally distributed within each group (relaxed by CLT for large n). (3) Homoscedasticity \u2014 equal variances in both groups (Welch's t-test relaxes this). Violating independence is the most serious failure in A/B tests with social network effects.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 297
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "When should you use the Mann-Whitney U test instead of a t-test in an A/B experiment?",
    "back": "Use Mann-Whitney U (Wilcoxon rank-sum) when the metric is heavily skewed and sample size is too small for CLT to guarantee normality (typically n < 200 per group). Common cases: revenue per user (heavy right tail with many zeros and few large purchases), page load time (right-skewed). Mann-Whitney tests whether one distribution is stochastically greater than another \u2014 it is a non-parametric alternative that does not assume normality.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 298
  },
  {
    "topic": "experimentation",
    "subtopic": "sample_size_power",
    "front": "When should you use a one-sided test versus a two-sided test for an A/B experiment?",
    "back": "Two-sided test: tests whether treatment differs from control in either direction (H1: \u03bcB \u2260 \u03bcA). Use when the treatment could harm or help, and you care about detecting either direction. One-sided test: tests only one direction (H1: \u03bcB > \u03bcA). Has more power for that direction, but misses regressions. Use one-sided only when a negative effect is logically impossible and pre-registered. Default to two-sided in practice to catch unexpected regressions.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 299
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What does a 95% confidence interval mean for an estimated treatment effect?",
    "back": "A 95% CI means: if we repeated the experiment many times and computed a 95% CI each time, 95% of those intervals would contain the true parameter. For a single experiment, it is wrong to say 'there is a 95% chance the true effect is in this interval' \u2014 the true effect is fixed, not random. Practically, a 95% CI that excludes zero is consistent with statistical significance at \u03b1=0.05 (two-sided).",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 300
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is the interview trap of treating p < 0.05 as proof that the treatment works?",
    "back": "P < 0.05 only means the data is unlikely under H0 \u2014 it does not confirm H1, does not prove causation, and does not indicate the effect is large enough to matter. Traps: (1) p-value depends on sample size \u2014 huge n makes trivially small effects significant; (2) false positive rate is 5% by design; (3) statistical significance \u2260 practical significance. Always report effect size and CI alongside p-values.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 301
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is Cohen's d and what values indicate small, medium, and large effect sizes?",
    "back": "Cohen's d = (\u03bc_treatment \u2212 \u03bc_control) / \u03c3_pooled. It expresses the treatment effect in standard deviation units. Benchmarks: d=0.2 (small \u2014 often practically insignificant), d=0.5 (medium), d=0.8 (large). Cohen's d is useful for comparing effect sizes across different metrics and experiments. Small d with large n can be statistically significant but practically irrelevant.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 302
  },
  {
    "topic": "statistics",
    "subtopic": "statistics",
    "front": "What is the difference between standard error and standard deviation in the context of an A/B test?",
    "back": "Standard deviation (\u03c3): spread of individual observations around the mean within a group. Standard error (SE) = \u03c3 / \u221an: spread of the sample mean across repeated samples \u2014 quantifies uncertainty in the estimated mean. In an A/B test, we use SE of the difference in means to build confidence intervals and compute t-statistics. Larger n shrinks SE (more precise estimate) but does not change \u03c3.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 303
  },
  {
    "topic": "experimentation",
    "subtopic": "sample_size_power",
    "front": "What is the variance formula for a binary conversion metric in an A/B test?",
    "back": "For a binary metric with conversion rate p (0 or 1 per user), the variance per user is p*(1-p). The variance of the sample mean for n users is p*(1-p)/n. The variance is maximized at p=0.5 (\u03c3\u00b2=0.25) and decreases as p approaches 0 or 1. Use this to compute the standard error and the required sample size for a given MDE and power.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 304
  },
  {
    "topic": "experimentation",
    "subtopic": "sample_size_power",
    "front": "What is the sample size formula for a two-sample test with equal group sizes?",
    "back": "n = 2 * \u03c3\u00b2 * (z_\u03b1/2 + z_\u03b2)\u00b2 / \u03b4\u00b2 per group. Where \u03c3\u00b2 is the metric variance (p*(1-p) for binary), \u03b4 is the MDE (minimum detectable effect), z_\u03b1/2 is the critical z for significance (1.96 for \u03b1=0.05 two-sided), and z_\u03b2 is the critical z for power (0.84 for 80% power, 1.28 for 90%). Total experiment size = 2n users.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 305
  },
  {
    "topic": "experimentation",
    "subtopic": "sample_size_power",
    "front": "What is the Minimum Detectable Effect (MDE) in a power analysis?",
    "back": "MDE is the smallest true treatment effect that the experiment is designed to detect with the specified power (e.g., 80%). If the true effect is smaller than the MDE, the experiment will miss it (Type II error) more than \u03b2% of the time. MDE is set before the experiment based on the minimum business-meaningful effect \u2014 e.g., a 0.5% lift in conversion if smaller effects would not justify engineering cost.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 306
  },
  {
    "topic": "experimentation",
    "subtopic": "sample_size_power",
    "front": "What are the steps of a power analysis before launching an A/B test?",
    "back": "1. Choose primary metric and compute its baseline mean and variance (\u03c3\u00b2). 2. Define MDE: minimum effect size worth detecting. 3. Set \u03b1 (typically 0.05) and desired power (typically 0.80). 4. Plug into sample size formula: n = 2\u03c3\u00b2(z_\u03b1/2 + z_\u03b2)\u00b2/\u03b4\u00b2. 5. Estimate days needed = 2n / (daily active users \u00d7 traffic allocation). 6. Check if runtime is feasible; if not, adjust MDE or increase traffic allocation.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 307
  },
  {
    "topic": "experimentation",
    "subtopic": "sample_size_power",
    "front": "What is the risk of running an underpowered experiment?",
    "back": "An underpowered experiment (low power, e.g., 30%) has high Type II error \u2014 it will likely miss real treatment effects. Consequences: (1) Shipping decisions are made on noisy, inconclusive data. (2) Real improvements get killed as 'no effect detected.' (3) Teams often peek early and stop on a nominally significant result that is actually a false positive. Underpowered experiments waste engineering resources without reliable insights.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 308
  },
  {
    "topic": "experimentation",
    "subtopic": "sample_size_power",
    "front": "Why is it important to run power analysis before starting an experiment rather than after?",
    "back": "Post-hoc power analysis (after seeing results) is circular and misleading \u2014 power computed from observed data is determined by the p-value, not by an independent assessment. Pre-experiment power analysis defines a required sample size commitment, preventing early stopping when results look significant (p-hacking), ensuring the experiment runs long enough to detect real effects, and enabling honest interpretation of null results.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 309
  },
  {
    "topic": "experimentation",
    "subtopic": "sample_size_power",
    "front": "How does the baseline conversion rate affect the required sample size for a binary metric?",
    "back": "Required sample size is proportional to variance = p*(1-p). Variance is maximized at p=0.5 (\u03c3\u00b2=0.25) and smaller near 0 or 1. An experiment on a 50% baseline conversion requires more users than one on a 5% baseline for the same absolute MDE. However, detecting the same relative lift (e.g., 10% relative) at a 5% baseline requires detecting \u03b4=0.005 absolute, which may require even more users than the 50% baseline case.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 310
  },
  {
    "topic": "experimentation",
    "subtopic": "sample_size_power",
    "front": "What is variance reduction in A/B testing and how does it reduce required sample size?",
    "back": "Variance reduction techniques (CUPED, stratification, regression adjustment) decrease \u03c3\u00b2 of the outcome metric, directly reducing required sample size (n \u221d \u03c3\u00b2/\u03b4\u00b2). Example: CUPED can reduce variance by 20\u201350% using pre-experiment data, cutting required sample size by the same proportion. Smaller required n means shorter experiment runtime for the same power, enabling faster iteration.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 311
  },
  {
    "topic": "experimentation",
    "subtopic": "sample_size_power",
    "front": "What are two ways to reduce the MDE without changing the statistical parameters \u03b1 and \u03b2?",
    "back": "1. Increase traffic allocation: more users in the experiment per day reduces required runtime for a given n, effectively letting you run longer and detect smaller effects. 2. Reduce metric variance (CUPED, stratification, covariate adjustment): lower \u03c3\u00b2 means smaller effects are detectable with the same n. Both approaches make the experiment more sensitive, enabling detection of smaller but still practically meaningful effects.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 312
  },
  {
    "topic": "experimentation",
    "subtopic": "multiple_testing",
    "front": "What is the multiple comparisons problem in A/B testing?",
    "back": "When testing multiple hypotheses simultaneously (multiple metrics, multiple segments, multiple variants), the probability of at least one false positive grows. With k independent tests each at \u03b1=0.05, the family-wise error rate (FWER) = 1 \u2212 (1\u22120.05)^k. At k=20, FWER \u2248 64% \u2014 you expect ~1 false positive even if all nulls are true. Failing to account for multiple comparisons inflates false discovery rates.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 313
  },
  {
    "topic": "experimentation",
    "subtopic": "multiple_testing",
    "front": "What is the Bonferroni correction and what is its main limitation?",
    "back": "Bonferroni correction: divide the significance threshold \u03b1 by the number of tests k (\u03b1_adjusted = \u03b1/k). Guarantees family-wise error rate \u2264 \u03b1. Example: 10 tests at \u03b1=0.05 \u2192 test each at 0.005. Limitation: it is very conservative \u2014 it controls FWER even if tests are correlated (not independent), leading to many missed true effects (high Type II error rate). Better alternatives: Holm-Bonferroni or FDR control for correlated tests.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 314
  },
  {
    "topic": "experimentation",
    "subtopic": "multiple_testing",
    "front": "What is the difference between FWER control and FDR control in multiple testing?",
    "back": "FWER (Family-Wise Error Rate): probability of any false positive across all tests. Conservative \u2014 keeps false positives near zero but misses many real effects. FDR (False Discovery Rate): expected proportion of rejections that are false positives. Less conservative \u2014 allows some false positives, maintaining higher power. FDR control (e.g., Benjamini-Hochberg at FDR=10%) is preferred when testing many hypotheses and some false positives are acceptable.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 315
  },
  {
    "topic": "experimentation",
    "subtopic": "multiple_testing",
    "front": "How does the Benjamini-Hochberg procedure control the FDR?",
    "back": "BH procedure: (1) Sort p-values p(1) \u2264 p(2) \u2264 ... \u2264 p(m). (2) Find the largest k such that p(k) \u2264 (k/m) * q, where q is the target FDR level. (3) Reject all hypotheses H(1) through H(k). Under independence, BH controls FDR at level q. It is less conservative than Bonferroni and rejects more hypotheses, trading some false positives for higher power.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 316
  },
  {
    "topic": "experimentation",
    "subtopic": "multiple_testing",
    "front": "If you test 20 independent metrics at p < 0.05, how many false positives do you expect?",
    "back": "With 20 independent tests each at \u03b1=0.05, and assuming all null hypotheses are true, expected false positives = 20 \u00d7 0.05 = 1. The probability of at least one false positive = 1 \u2212 0.95^20 \u2248 64%. This is the multiple comparisons problem \u2014 testing more metrics dramatically increases the chance of finding a spuriously significant result and claiming a false win.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 317
  },
  {
    "topic": "experimentation",
    "subtopic": "multiple_testing",
    "front": "What is pre-registration of a primary metric and how does it prevent p-hacking?",
    "back": "Pre-registration: declare the primary metric, hypothesis direction, sample size, and analysis plan before the experiment starts. P-hacking occurs when analysts test many metrics and report only significant ones, inflating false positive rates. Pre-registration creates a public commitment to the primary analysis, making it transparent if the team later reports only favorable secondary metrics. It is the strongest protection against inadvertent p-hacking.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 318
  },
  {
    "topic": "experimentation",
    "subtopic": "sample_size_power",
    "front": "What is CUPED and what problem does it solve?",
    "back": "CUPED (Controlled-experiment Using Pre-Experiment Data) reduces variance in the treatment effect estimate by using a correlated pre-experiment metric (covariate X). It adjusts the outcome Y to remove variance explained by X, yielding a lower-variance estimator that requires fewer users for the same power \u2014 often reducing required sample size by 20\u201350%.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 319
  },
  {
    "topic": "experimentation",
    "subtopic": "advanced_methods",
    "front": "What is the CUPED adjustment formula and what is \u03b8?",
    "back": "Y_cuped = Y \u2212 \u03b8 * (X \u2212 E[X]). \u03b8 = Cov(Y, X) / Var(X) (OLS coefficient of Y on X). X is the pre-experiment value of the same metric (or a correlated metric). E[X] is the population mean of X. The adjustment subtracts the part of Y that is predictable from X, reducing residual variance without introducing bias (E[X \u2212 E[X]] = 0 on average).",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 320
  },
  {
    "topic": "experimentation",
    "subtopic": "advanced_methods",
    "front": "What is stratified randomization and how does it differ from simple randomization?",
    "back": "Stratified randomization divides the population into strata (e.g., by country, device type, user tenure) and randomizes independently within each stratum. This ensures balance on stratification variables by construction, reducing variance in the treatment effect estimate. Simple randomization can by chance produce imbalanced groups on key covariates (especially in small experiments). Stratification is most valuable when strata strongly predict the outcome.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 321
  },
  {
    "topic": "experimentation",
    "subtopic": "advanced_methods",
    "front": "What is a switchback experiment and when is it used?",
    "back": "A switchback experiment (also called time-based A/B test) alternates treatment and control assignments across time windows (e.g., treatment for 30 minutes, control for 30 minutes, cycling repeatedly). Used in marketplace/supply-constrained settings where user-level randomization violates SUTVA (e.g., ride-sharing dispatch, ads auction pricing). Analyzes treatment effect by comparing outcomes in treatment windows vs control windows.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 322
  },
  {
    "topic": "experimentation",
    "subtopic": "sample_size_power",
    "front": "What is interleaving in ranking experiments and why is it more sensitive than an A/B test?",
    "back": "Interleaving combines ranked lists from two rankers (A and B) for a single user's query \u2014 items from each ranker are merged in a balanced way. User engagement (clicks, purchases) on A-items vs B-items directly compares the rankers. Because both rankers compete within the same user session, position bias cancels out, and the test needs 10\u2013100x fewer users than a standard A/B test for the same statistical power. Used for recommendation and search ranking experiments.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 323
  },
  {
    "topic": "experimentation",
    "subtopic": "advanced_methods",
    "front": "What is a difference-in-differences (DiD) design and when is it used?",
    "back": "DiD compares the change in outcomes over time for a treated group vs a control group: DiD estimator = (Y_treated_post \u2212 Y_treated_pre) \u2212 (Y_control_post \u2212 Y_control_pre). It controls for time-invariant confounders (fixed effects) and common time trends. Used when randomization is impossible \u2014 e.g., a policy change applied to certain regions. Relies on the parallel trends assumption: absent treatment, both groups would have followed the same trend.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 324
  },
  {
    "topic": "experimentation",
    "subtopic": "advanced_methods",
    "front": "What is the synthetic control method and when does it outperform DiD?",
    "back": "Synthetic control constructs a weighted average of control units to match the pre-treatment trajectory of the treated unit. The weights are chosen to minimize pre-treatment prediction error. Outperforms DiD when: only one treated unit exists (e.g., one country launched a feature), the parallel trends assumption is implausible, or control units have different trends. The synthetic counterfactual is the post-treatment trajectory the treated unit would have followed without treatment.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 325
  },
  {
    "topic": "experimentation",
    "subtopic": "advanced_methods",
    "front": "What is a regression discontinuity design and what assumption does it rely on?",
    "back": "RDD exploits a discontinuity in treatment assignment at a threshold of a running variable (e.g., users above a score of 50 get treatment). The local average treatment effect is estimated by comparing outcomes just below vs just above the threshold \u2014 units near the threshold are assumed to be similar except for treatment status. Relies on: no manipulation of the running variable at the threshold and continuity of potential outcomes.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 326
  },
  {
    "topic": "experimentation",
    "subtopic": "sample_size_power",
    "front": "What is a matched pairs experiment and what advantage does it have?",
    "back": "Matched pairs pairs each treatment unit with the most similar control unit (on covariates like user tenure, historical activity, demographics) before randomization. Within each pair, one is assigned treatment and one control. Advantage: reduces variance by controlling for matched covariates, similar to stratification but applied at the individual level. Increases statistical power for the same total n, especially when covariates are strongly predictive of the outcome.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 327
  },
  {
    "topic": "experimentation",
    "subtopic": "advanced_methods",
    "front": "What is a holdout group and how is it used to measure long-term effects?",
    "back": "A holdout group is a permanently withheld control group \u2014 a small percentage of users (e.g., 5%) who never receive a feature, even after it is shipped to everyone else. By comparing holdout users to the full population over months, you measure the long-term incremental effect of the feature, separating novelty effects from sustained impact. Important for features suspected of novelty inflation or network effects that grow over time.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 328
  },
  {
    "topic": "experimentation",
    "subtopic": "product_ds",
    "front": "What is a metric tree and how does it help prioritize experiments?",
    "back": "A metric tree decomposes a top-level business metric into sub-metrics multiplicatively. Example: Revenue = Active Users \u00d7 Sessions/User \u00d7 Conversion Rate \u00d7 AOV. This decomposition identifies which lever (traffic, engagement, conversion, order value) drives revenue, helping teams prioritize experiments. A significant change to a high-leverage node (Conversion Rate) produces larger revenue impact than the same relative change to a smaller node (AOV).",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 329
  },
  {
    "topic": "experimentation",
    "subtopic": "product_ds",
    "front": "What is a guardrail metric in experimentation and how is it used in ship/no-ship decisions?",
    "back": "A guardrail metric is a metric that must not meaningfully regress due to a treatment, even if the primary metric improves. Examples: page load time, crash rate, customer service contact rate. In ship decisions: a treatment must show (1) significant improvement on primary metric AND (2) no statistically significant regression on guardrails. A treatment that improves conversion but increases crash rate by 10% should not ship.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 330
  },
  {
    "topic": "experimentation",
    "subtopic": "product_ds",
    "front": "What is the novelty effect in A/B testing and why is it a bias?",
    "back": "The novelty effect is a temporary lift in engagement or conversion caused by users' curiosity about a new feature, not its true long-term value. The treatment group shows a short-term spike that fades as users habituate. Experiments run during the novelty phase overestimate the true treatment effect. Detection: segment by user tenure in the experiment \u2014 the lift should be concentrated in early days and decay over time.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 331
  },
  {
    "topic": "experimentation",
    "subtopic": "product_ds",
    "front": "How can seasonality confound an A/B experiment and how do you mitigate it?",
    "back": "If treatment and control groups experience different time periods (e.g., one group is measured on weekdays and the other on weekends), seasonality confounds the treatment effect. Mitigation: (1) always run concurrent control and treatment groups (simultaneous randomization); (2) run experiments for at least 1\u20132 full business cycles (1\u20132 weeks); (3) check for day-of-week effects in metric time series. Pre/post comparisons without concurrent controls are especially vulnerable to seasonality.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 332
  },
  {
    "topic": "experimentation",
    "subtopic": "product_ds",
    "front": "How do network effects violate SUTVA in social platform experiments?",
    "back": "On social platforms, a treatment user's behavior affects control users \u2014 e.g., a treatment user sends more messages, increasing engagement for their control-group friends. This interference means control users' outcomes are influenced by treatment assignment of others, violating SUTVA. The measured treatment effect is biased: it underestimates the true effect (dilution via spillover) or creates spurious effects. Solutions: cluster randomization (randomize by social graph clusters instead of individuals).",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 333
  },
  {
    "topic": "experimentation",
    "subtopic": "product_ds",
    "front": "What makes marketplace experiments challenging and what design strategies address this?",
    "back": "Marketplace experiments (e.g., Uber, Airbnb) have two-sided markets where treating buyers affects sellers and vice versa, violating SUTVA. A pricing experiment on the buyer side changes demand, affecting supply availability for control buyers. Strategies: (1) geographic/time-based randomization (switchback) to contain interference; (2) separate buyer-side and seller-side experiments; (3) equilibrium modeling to account for market-wide effects when individual-level randomization is used.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 334
  },
  {
    "topic": "experimentation",
    "subtopic": "product_ds",
    "front": "What is a surrogate metric and when do you use it instead of the primary metric?",
    "back": "A surrogate metric is a short-term, measurable signal that is correlated with a long-term primary metric that takes too long to observe in an experiment. Example: 7-day retention as a surrogate for 12-month LTV. Use when the primary metric requires months to accumulate (e.g., revenue, LTV, churn). Risk: the surrogate may not perfectly predict the primary \u2014 shipping based on a surrogate can be wrong if the correlation is imperfect or changes over time.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 335
  },
  {
    "topic": "experimentation",
    "subtopic": "product_ds",
    "front": "What is experiment instrumentation and what events must be logged for a valid experiment?",
    "back": "Experiment instrumentation is the logging infrastructure that records every event needed for analysis. Minimum events: (1) assignment event \u2014 user ID, experiment ID, variant, timestamp at bucketing; (2) exposure event \u2014 user ID, experiment ID, variant, timestamp when user actually sees the treatment; (3) outcome events \u2014 user ID, metric events (purchase, click, error) with timestamps. Missing any layer creates analysis gaps (unknown dilution, unattributable outcomes).",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 336
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is the key difference between an observational study and a randomized experiment?",
    "back": "Randomized experiment (RCT): treatment assignment is controlled by the researcher, independent of all user characteristics. This breaks confounding, enabling causal inference. Observational study: treatment is self-selected or assigned by factors outside researcher control. Users who choose treatment may differ systematically from non-users (selection bias), making it hard to isolate the treatment effect from pre-existing differences.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 337
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is a confounding variable and why does it bias treatment effect estimates?",
    "back": "A confounder is a variable that causes both the treatment and the outcome. Example: older users are more likely to use premium features (treatment) AND more likely to convert (outcome) \u2014 age confounds the feature-conversion relationship. If you naively compare treatment vs control without controlling for age, you attribute age's effect on conversion to the feature, biasing the estimate upward.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 338
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is an instrumental variable and when is it used for causal inference?",
    "back": "An instrumental variable (IV) is a variable Z that: (1) is correlated with treatment T (relevance), (2) affects the outcome Y only through T and not directly (exclusion restriction), (3) is independent of confounders. IV estimator isolates exogenous variation in T. Example: random assignment to a feature email reminder as IV for feature adoption \u2014 the email affects Y only through whether users adopt the feature. Used when RCT is infeasible and confounders exist.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 339
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is selection bias in observational ML evaluation and why is it dangerous?",
    "back": "Selection bias occurs when the sample used for evaluation is not representative of the target population due to how data was collected. Example: evaluating a recommendation model only on users who clicked (surviving items) ignores items that were never shown or never clicked. The model appears to perform well on the biased sample but fails in deployment. Detection: compare feature distributions between evaluation set and production traffic.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 340
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "What is a causal DAG (Directed Acyclic Graph) and what does it represent?",
    "back": "A causal DAG is a directed graph where nodes are variables and edges represent direct causal relationships (X \u2192 Y means X directly causes Y). It encodes the researcher's causal assumptions. Used to: (1) identify confounders (common causes of treatment and outcome); (2) identify valid adjustment sets (backdoor criterion); (3) detect collider variables that should NOT be controlled for. The do-calculus formalizes how to read interventional distributions from a DAG.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 341
  },
  {
    "topic": "causal_inference",
    "subtopic": "causal_inference",
    "front": "Why can correlations in ML model predictions not be used to infer causal relationships?",
    "back": "ML models learn correlations from observational data. A model that predicts churn from features like 'called customer support' may have high accuracy, but calling support is a symptom of dissatisfaction (confounder) \u2014 not a cause of churn. Acting on this prediction by suppressing support calls would be counterproductive. ML models identify predictive associations; causal structure requires explicit experimentation or causal modeling with domain knowledge.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 342
  },
  {
    "topic": "experimentation",
    "subtopic": "readout_interpretation",
    "front": "What is the standard structure of an experiment readout?",
    "back": "Standard readout structure: (1) Experiment setup summary (hypothesis, randomization unit, traffic %, runtime, sample size). (2) Primary metric result \u2014 point estimate, 95% CI, p-value. (3) Guardrail metrics \u2014 any statistically significant regressions. (4) Secondary metrics \u2014 directional signals, not used for ship decision. (5) Segment analysis \u2014 heterogeneous treatment effects across key segments. (6) Ship recommendation with rationale.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 343
  },
  {
    "topic": "experimentation",
    "subtopic": "readout_interpretation",
    "front": "Why might you choose not to ship a treatment that shows a statistically significant positive result?",
    "back": "Reasons to not ship despite statistical significance: (1) Effect size is below the business MDE threshold (too small to justify cost). (2) A guardrail metric (e.g., latency, error rate) shows significant regression. (3) The result is driven by a narrow segment inconsistent with the target population. (4) Experiment ran during an unrepresentative period (holiday, outage). (5) Sample ratio mismatch detected \u2014 randomization was broken.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 344
  },
  {
    "topic": "experimentation",
    "subtopic": "sample_size_power",
    "front": "What is heterogeneous treatment effect analysis and why is it important in experiment readouts?",
    "back": "Heterogeneous treatment effect (HTE) analysis segments the experiment population and estimates treatment effects within each segment (e.g., by platform, country, user tenure, power users vs casual users). Importance: (1) Identifies sub-populations that benefit or are harmed differently. (2) Informs targeted rollout decisions. (3) Surfaces interaction effects that a single average treatment effect masks. Note: segment analysis requires multiple testing correction to avoid false positives.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 345
  },
  {
    "topic": "experimentation",
    "subtopic": "readout_interpretation",
    "front": "What is the complete shipment decision framework for an A/B test result?",
    "back": "Ship if ALL of: (1) Primary metric is statistically significant (p = MDE). (2) No guardrail metric shows statistically significant regression. (3) Sample ratio mismatch test passes (actual split \u2248 intended split). (4) Experiment ran for sufficient duration (>= 1 business cycle, novelty effect not suspected). (5) Segment analysis shows no unexpected harm to critical user groups.",
    "source": "lane8_experimentation",
    "priority": 0,
    "id": 346
  }
];
