// Product Analytics Lab — Code Room Module Data
// V3.1 — Analytics SQL + Python/Pandas in product context.
// Not generic coding. Every module presents a product scenario and a real analyst task.

export const codeModules = [

  // ─────────────────────────────────────────────
  // CODE01 — Funnel Conversion Rate by Cohort (SQL · FREE)
  // ─────────────────────────────────────────────
  {
    id: 'code01-funnel-sql',
    title: 'Write a Funnel Query',
    subtitle: 'SQL · Funnel Analysis · Conversion Rates',
    track: 'sql',
    difficulty: 'analyst',
    isFree: true,

    guestPreview: true,
    tags: ['funnel', 'conversion', 'window functions'],

    scenario: {
      company: 'Crestline Home',
      context: 'Checkout conversion dropped 5pp overnight. You\'ve confirmed it\'s real. Now the head of product wants a query that shows step-by-step funnel conversion rates for the 7 days before and after Tuesday\'s deployment — so she can see exactly where in the checkout flow users are dropping.',
      schema: [
        { table: 'funnel_events', description: 'One row per user per funnel step', columns: ['user_id', 'session_id', 'event_name', 'event_ts', 'platform'] },
        { table: '—', description: 'event_name values: "viewed_cart", "viewed_payment", "submitted_payment", "order_confirmed"', columns: [] },
      ],
      task: 'Write a SQL query that shows the conversion rate at each funnel step (users who reached step N / users who started checkout), split by pre- and post-deployment period.',
    },

    hints: [
      'Use COUNT(DISTINCT user_id) at each step — not COUNT(*), which double-counts session restarts',
      'A CASE WHEN on event_ts creates the pre/post deployment flag',
      'Funnel step rate = users at step N / users at step 1 (not step N / step N-1)',
      'Use conditional aggregation: SUM(CASE WHEN event_name = \'...\' THEN 1 ELSE 0 END)',
    ],

    partialCode: 'SELECT\n  deploy_period,\n  COUNT(DISTINCT CASE WHEN event_name = \'viewed_cart\' THEN user_id END) AS step1_cart,\n  -- TODO: add step2 (viewed_payment), step3 (submitted_payment), step4 (order_confirmed)\n\n  -- TODO: compute conversion rates from step1 to each step\n  -- payment_page_rate = step2 / step1\n  -- payment_submit_rate = step3 / step1\n  -- order_confirmed_rate = step4 / step1\n\nFROM (\n  SELECT\n    user_id,\n    event_name,\n    -- TODO: create deploy_period column: \'pre_deploy\' vs \'post_deploy\'\n    -- Deployment was Tuesday 2024-01-16 at 3pm\n    CASE\n      WHEN event_ts < \'2024-01-16 15:00:00\' THEN ___\n      ELSE ___\n    END AS deploy_period\n  FROM funnel_events\n  WHERE event_ts BETWEEN \'2024-01-09\' AND \'2024-01-23\'  -- 7 days each side\n) base\nGROUP BY 1\nORDER BY deploy_period;',

    modelAnswer: 'SELECT\n  deploy_period,\n\n  -- Step counts (unique users who reached each step)\n  COUNT(DISTINCT CASE WHEN event_name = \'viewed_cart\'         THEN user_id END) AS step1_cart,\n  COUNT(DISTINCT CASE WHEN event_name = \'viewed_payment\'      THEN user_id END) AS step2_payment_page,\n  COUNT(DISTINCT CASE WHEN event_name = \'submitted_payment\'   THEN user_id END) AS step3_payment_submit,\n  COUNT(DISTINCT CASE WHEN event_name = \'order_confirmed\'     THEN user_id END) AS step4_confirmed,\n\n  -- Conversion rates (each step / step 1 = overall funnel depth)\n  ROUND(\n    100.0 * COUNT(DISTINCT CASE WHEN event_name = \'viewed_payment\'    THEN user_id END)\n    / NULLIF(COUNT(DISTINCT CASE WHEN event_name = \'viewed_cart\'      THEN user_id END), 0),\n    1\n  ) AS payment_page_rate_pct,\n\n  ROUND(\n    100.0 * COUNT(DISTINCT CASE WHEN event_name = \'submitted_payment\' THEN user_id END)\n    / NULLIF(COUNT(DISTINCT CASE WHEN event_name = \'viewed_cart\'      THEN user_id END), 0),\n    1\n  ) AS payment_submit_rate_pct,\n\n  ROUND(\n    100.0 * COUNT(DISTINCT CASE WHEN event_name = \'order_confirmed\'   THEN user_id END)\n    / NULLIF(COUNT(DISTINCT CASE WHEN event_name = \'viewed_cart\'      THEN user_id END), 0),\n    1\n  ) AS checkout_conversion_rate_pct\n\nFROM (\n  SELECT\n    user_id,\n    event_name,\n    CASE\n      WHEN event_ts < \'2024-01-16 15:00:00\' THEN \'pre_deploy\'\n      ELSE \'post_deploy\'\n    END AS deploy_period\n  FROM funnel_events\n  WHERE event_ts BETWEEN \'2024-01-09\' AND \'2024-01-23\'\n) base\n\nGROUP BY 1\nORDER BY deploy_period;',

    keyInsights: [
      'COUNT(DISTINCT CASE WHEN event_name = \'...\' THEN user_id END) — this pattern counts unique users who reached a step in a single pass over the table, no subquery needed',
      'Funnel rates use step1 as the denominator, not step N-1. This measures "what % of cart viewers completed checkout", which is more meaningful than step-to-step dropout rate',
      'NULLIF prevents division-by-zero if a deploy_period bucket has no cart views',
      'Expected output: payment_submit_rate_pct drops notably in post_deploy — confirming the drop is at the payment submission step, not at page view',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE02 — Retention Cohort Query (SQL · Analyst)
  // ─────────────────────────────────────────────
  {
    id: 'code02-retention-sql',
    title: 'Build a Retention Cohort Table',
    subtitle: 'SQL · Cohort Analysis · Window Functions',
    track: 'sql',
    difficulty: 'analyst',
    isFree: true,
    tags: ['retention', 'cohort analysis', 'window functions', 'DATE_DIFF'],

    scenario: {
      company: 'Orion · Consumer Mobile App',
      context: 'D7 retention fell 5pp for the cohort that received a new re-engagement push campaign. The PM wants a cohort table showing Day 1, Day 7, and Day 30 retention for install cohorts over the past 8 weeks — to see if the drop is recent or if it predates the campaign.',
      schema: [
        { table: 'users', description: 'One row per user', columns: ['user_id', 'install_date', 'cohort_type'] },
        { table: 'app_sessions', description: 'One row per session', columns: ['user_id', 'session_date'] },
      ],
      task: 'Write a SQL query that produces a retention cohort table: one row per install week, with D1, D7, and D30 retention rates as columns.',
    },

    hints: [
      'A CTE for "install cohort" + a CTE for "return sessions" keeps things readable',
      'Use DATE_DIFF(session_date, install_date, DAY) to compute days since install',
      'D7 retention = users with any session on days 6-8 (±1 day tolerance is industry standard) / users who installed that week',
      'Use a LEFT JOIN from cohorts to sessions so install weeks with 0 retention still appear',
    ],

    partialCode: 'WITH install_cohorts AS (\n  -- Weekly install cohorts\n  SELECT\n    user_id,\n    install_date,\n    DATE_TRUNC(\'week\', install_date) AS install_week\n  FROM users\n  WHERE install_date >= CURRENT_DATE - INTERVAL \'56 days\'  -- 8 weeks\n),\n\nreturn_events AS (\n  SELECT\n    ic.user_id,\n    ic.install_week,\n    DATE_DIFF(s.session_date, ic.install_date, DAY) AS days_since_install\n  FROM install_cohorts ic\n  -- TODO: join to app_sessions on user_id\n  -- TODO: only include sessions after install date\n),\n\ncohort_retention AS (\n  SELECT\n    install_week,\n    COUNT(DISTINCT user_id) AS cohort_size,\n\n    -- TODO: count users retained on D1 (day 1 ± tolerance)\n    COUNT(DISTINCT CASE WHEN days_since_install BETWEEN ___ AND ___ THEN user_id END) AS d1_retained,\n\n    -- TODO: count D7 retained users (days 6-8)\n\n    -- TODO: count D30 retained users (days 29-31)\n  FROM return_events\n  GROUP BY 1\n)\n\nSELECT\n  install_week,\n  cohort_size,\n  d1_retained,\n  -- TODO: compute D1, D7, D30 retention rates as percentages\nFROM cohort_retention\nORDER BY install_week;',

    modelAnswer: 'WITH install_cohorts AS (\n  SELECT\n    user_id,\n    install_date,\n    DATE_TRUNC(\'week\', install_date) AS install_week\n  FROM users\n  WHERE install_date >= CURRENT_DATE - INTERVAL \'56 days\'\n),\n\nreturn_events AS (\n  -- Every session for each installed user, with days since install\n  SELECT\n    ic.user_id,\n    ic.install_week,\n    ic.install_date,\n    DATE_DIFF(s.session_date, ic.install_date, DAY) AS days_since_install\n  FROM install_cohorts ic\n  LEFT JOIN app_sessions s\n    ON ic.user_id = s.user_id\n    AND s.session_date > ic.install_date  -- Exclude the install day itself\n),\n\ncohort_retention AS (\n  SELECT\n    install_week,\n    COUNT(DISTINCT user_id)                                                     AS cohort_size,\n    COUNT(DISTINCT CASE WHEN days_since_install BETWEEN 1  AND 2  THEN user_id END) AS d1_retained,\n    COUNT(DISTINCT CASE WHEN days_since_install BETWEEN 6  AND 8  THEN user_id END) AS d7_retained,\n    COUNT(DISTINCT CASE WHEN days_since_install BETWEEN 29 AND 31 THEN user_id END) AS d30_retained\n  FROM return_events\n  GROUP BY 1\n)\n\nSELECT\n  install_week,\n  cohort_size,\n  d1_retained,\n  d7_retained,\n  d30_retained,\n\n  ROUND(100.0 * d1_retained  / NULLIF(cohort_size, 0), 1) AS d1_retention_pct,\n  ROUND(100.0 * d7_retained  / NULLIF(cohort_size, 0), 1) AS d7_retention_pct,\n  ROUND(100.0 * d30_retained / NULLIF(cohort_size, 0), 1) AS d30_retention_pct\n\nFROM cohort_retention\nORDER BY install_week;',

    keyInsights: [
      'Day ±1 tolerance (days 6-8 for D7) is industry standard — many apps don\'t require users to open on exactly day 7, so a 3-day window avoids undercounting',
      'LEFT JOIN from install_cohorts to app_sessions ensures cohorts with zero return events still appear in the output with NULL/0 retention',
      'COUNT(DISTINCT user_id) in the CASE WHEN pattern counts each user once per retention bucket, even if they had multiple sessions in that window',
      'This query produces the exact table the PM asked for — one row per install week, D1/D7/D30 as columns. You can now scan down the install_week column and see if the D7 drop started the week the campaign launched',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE03 — A/B Test Significance in Python (Python · Analyst)
  // ─────────────────────────────────────────────
  {
    id: 'code03-ab-test-python',
    title: 'Run an A/B Test Significance Check',
    subtitle: 'Python · scipy.stats · Confidence Intervals',
    track: 'python',
    difficulty: 'analyst',
    isFree: true,
    tags: ['A/B testing', 'scipy', 'confidence intervals', 'hypothesis testing'],

    scenario: {
      company: 'Crestline Home · Checkout A/B Test',
      context: 'The new payment provider experiment ran for 14 days. You have the results: control (old provider) had 62.4% checkout conversion on 294,000 users. Treatment (new provider) had 63.8% conversion on 292,000 users. The PM asks: "Is this significant? What\'s the 95% CI on the lift?"',
      schema: [
        { table: 'Python variables already defined:', description: '', columns: [] },
        { table: '—', description: 'control_users = 294000, control_conversions = 183456', columns: [] },
        { table: '—', description: 'treatment_users = 292000, treatment_conversions = 186216', columns: [] },
      ],
      task: 'Write Python code that computes: (1) conversion rates for both arms, (2) the absolute lift, (3) a two-proportion z-test p-value, and (4) a 95% confidence interval on the lift.',
    },

    hints: [
      'Use scipy.stats.proportions_ztest for the two-proportion z-test',
      'The 95% CI on a proportion difference can be computed with the standard error: SE = sqrt(p1*(1-p1)/n1 + p2*(1-p2)/n2)',
      'z* for 95% CI is 1.96',
      'Report lift in both absolute (pp) and relative (%) terms — PMs understand both',
    ],

    partialCode: 'import numpy as np\nfrom scipy import stats\n\n# Given data\ncontrol_users       = 294_000\ncontrol_conversions = 183_456\ntreatment_users     = 292_000\ntreatment_conversions = 186_216\n\n# 1. Compute conversion rates\ncontrol_rate   = ___\ntreatment_rate = ___\nabs_lift_pp    = ___          # Absolute lift in percentage points\nrel_lift_pct   = ___          # Relative lift as a %\n\nprint(f"Control:   {control_rate:.2%}")\nprint(f"Treatment: {treatment_rate:.2%}")\nprint(f"Lift:      {abs_lift_pp:+.2f}pp  ({rel_lift_pct:+.1f}% relative)")\n\n# 2. Two-proportion z-test\n# H0: treatment_rate == control_rate\nstat, p_value = stats.proportions_ztest(\n    count=___,    # [treatment_conversions, control_conversions]\n    nobs=___,     # [treatment_users, control_users]\n    alternative=\'two-sided\'\n)\nprint(f"\\np-value: {p_value:.4f}")\nprint(f"Significant at 0.05: {p_value < 0.05}")\n\n# 3. 95% Confidence interval on the lift\nz_star = 1.96\nse = ___   # Standard error of the difference\nci_lower = ___\nci_upper = ___\nprint(f"\\n95% CI: [{ci_lower:+.2f}pp, {ci_upper:+.2f}pp]")',

    modelAnswer: 'import numpy as np\nfrom scipy import stats\n\n# Given data\ncontrol_users         = 294_000\ncontrol_conversions   = 183_456\ntreatment_users       = 292_000\ntreatment_conversions = 186_216\n\n# 1. Conversion rates and lift\ncontrol_rate   = control_conversions   / control_users\ntreatment_rate = treatment_conversions / treatment_users\nabs_lift_pp    = (treatment_rate - control_rate) * 100   # In percentage points\nrel_lift_pct   = (treatment_rate - control_rate) / control_rate * 100\n\nprint(f"Control:   {control_rate:.2%}")\nprint(f"Treatment: {treatment_rate:.2%}")\nprint(f"Lift:      {abs_lift_pp:+.2f}pp  ({rel_lift_pct:+.1f}% relative)")\n\n# 2. Two-proportion z-test\nstat, p_value = stats.proportions_ztest(\n    count=[treatment_conversions, control_conversions],\n    nobs=[treatment_users, control_users],\n    alternative=\'two-sided\'\n)\nprint(f"\\nZ-statistic: {stat:.3f}")\nprint(f"p-value:      {p_value:.4f}")\nprint(f"Significant at α=0.05: {p_value < 0.05}")\n\n# 3. 95% Confidence interval on the absolute lift\nz_star = 1.96\nse = np.sqrt(\n    (treatment_rate * (1 - treatment_rate) / treatment_users) +\n    (control_rate   * (1 - control_rate)   / control_users)\n)\nci_lower = abs_lift_pp - z_star * se * 100\nci_upper = abs_lift_pp + z_star * se * 100\nprint(f"\\n95% CI on lift: [{ci_lower:+.2f}pp, {ci_upper:+.2f}pp]")\nprint(f"\\nInterpretation: Treatment conversion is {abs_lift_pp:+.2f}pp higher.")\nprint(f"We\'re 95% confident the true lift is between {ci_lower:.2f}pp and {ci_upper:.2f}pp.")',

    keyInsights: [
      'proportions_ztest takes count= (conversions) and nobs= (total users) as lists — [treatment, control] order',
      'The SE formula sqrt(p1*(1-p1)/n1 + p2*(1-p2)/n2) uses each arm\'s own rate — not the pooled rate — for the CI (use pooled for the test statistic itself, which scipy handles internally)',
      'Report absolute lift (pp) for product decisions, relative lift (%) for percentage context — PMs care about both',
      'With n=~290k per arm, almost any real effect will be significant. Always check the CI width — a 95% CI of [+0.1pp, +2.7pp] is very different from [+1.2pp, +1.6pp] in business terms',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE04 — CUPED Variance Reduction (Python · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code04-cuped-python',
    title: 'Implement CUPED Variance Reduction',
    subtitle: 'Python · Pandas · Pre-experiment Covariate',
    track: 'python',
    difficulty: 'senior',
    isFree: false,
    tags: ['CUPED', 'variance reduction', 'pandas', 'OLS regression', 'experimentation'],

    scenario: {
      company: 'Vantage Analytics · B2B SaaS',
      context: 'Your A/B test on a new onboarding flow is underpowered — you only have 12,000 users and need 20,000 to reach 80% power at your expected effect size. The stats team suggests applying CUPED using each user\'s pre-experiment revenue (last 30 days before the experiment) as the covariate. You have the experiment data in a DataFrame.',
      schema: [
        { table: 'DataFrame: df', description: 'One row per user', columns: ['user_id', 'variant', 'post_revenue', 'pre_revenue'] },
        { table: '—', description: 'variant: "control" | "treatment"', columns: [] },
        { table: '—', description: 'post_revenue: revenue during the experiment period (outcome)', columns: [] },
        { table: '—', description: 'pre_revenue: revenue in the 30 days before the experiment (covariate)', columns: [] },
      ],
      task: 'Implement CUPED: regress post_revenue on pre_revenue to estimate theta, compute the CUPED-adjusted outcome, then run a t-test comparing adjusted treatment vs. control. Report the variance reduction achieved.',
    },

    hints: [
      'CUPED adjusted metric: Y_adj = Y - theta * (X - mean(X))',
      'theta = Cov(Y, X) / Var(X) — this is the OLS regression coefficient of Y on X',
      'Use numpy.cov or just fit a simple OLS with scipy.stats.linregress to get theta',
      'Variance reduction = (1 - Var(Y_adj) / Var(Y)) * 100 — the higher this is, the more power you gained',
    ],

    partialCode: 'import pandas as pd\nimport numpy as np\nfrom scipy import stats\n\n# Assume df is already loaded with columns: user_id, variant, post_revenue, pre_revenue\n\n# 1. Estimate theta — the regression coefficient of post_revenue on pre_revenue\n#    theta = Cov(Y, X) / Var(X)\ntheta = ___\n\nprint(f"Theta (covariate coefficient): {theta:.4f}")\n\n# 2. Compute the global mean of pre_revenue (used to center the covariate)\npre_mean = ___\n\n# 3. Apply CUPED adjustment\n#    Y_adj = Y - theta * (X - mean(X))\ndf[\'post_revenue_cuped\'] = ___\n\n# 4. Run t-test on CUPED-adjusted outcomes\ncontrol_adj   = df.loc[df[\'variant\'] == \'control\',   \'post_revenue_cuped\']\ntreatment_adj = df.loc[df[\'variant\'] == \'treatment\', \'post_revenue_cuped\']\n\nt_stat, p_value = stats.ttest_ind(treatment_adj, control_adj)\nlift = treatment_adj.mean() - control_adj.mean()\n\nprint(f"\\nCUPED-adjusted lift: ${lift:.2f}")\nprint(f"p-value: {p_value:.4f}")\n\n# 5. Report variance reduction\nvar_original = ___   # Variance of unadjusted post_revenue\nvar_adjusted = ___   # Variance of CUPED-adjusted post_revenue\nvariance_reduction = ___\nprint(f"\\nVariance reduction: {variance_reduction:.1f}%")\nprint(f"Equivalent sample size multiplier: {1 / (1 - variance_reduction/100):.2f}x")',

    modelAnswer: 'import pandas as pd\nimport numpy as np\nfrom scipy import stats\n\n# 1. Estimate theta using numpy covariance matrix\ncov_matrix = np.cov(df[\'post_revenue\'], df[\'pre_revenue\'])\ntheta = cov_matrix[0, 1] / cov_matrix[1, 1]   # Cov(Y,X) / Var(X)\n\nprint(f"Theta (covariate coefficient): {theta:.4f}")\n\n# 2. Global mean of pre_revenue (centering the covariate)\npre_mean = df[\'pre_revenue\'].mean()\n\n# 3. Apply CUPED adjustment: Y_adj = Y - theta * (X - mean(X))\ndf[\'post_revenue_cuped\'] = df[\'post_revenue\'] - theta * (df[\'pre_revenue\'] - pre_mean)\n\n# 4. T-test on CUPED-adjusted outcomes\ncontrol_adj   = df.loc[df[\'variant\'] == \'control\',   \'post_revenue_cuped\']\ntreatment_adj = df.loc[df[\'variant\'] == \'treatment\', \'post_revenue_cuped\']\n\nt_stat, p_value = stats.ttest_ind(treatment_adj, control_adj)\nlift           = treatment_adj.mean() - control_adj.mean()\n\nprint(f"\\nCUPED-adjusted lift:  ${lift:.2f}")\nprint(f"T-statistic:          {t_stat:.3f}")\nprint(f"p-value:              {p_value:.4f}")\n\n# 5. Variance reduction\nvar_original       = df[\'post_revenue\'].var()\nvar_adjusted       = df[\'post_revenue_cuped\'].var()\nvariance_reduction = (1 - var_adjusted / var_original) * 100\n\nprint(f"\\nOriginal variance:    {var_original:.2f}")\nprint(f"Adjusted variance:    {var_adjusted:.2f}")\nprint(f"Variance reduction:   {variance_reduction:.1f}%")\n\n# Equivalent sample size multiplier: 1 / (1 - VR) tells you how much "more data" CUPED simulated\n# A 50% variance reduction is equivalent to doubling sample size\nequiv_multiplier = 1 / (1 - variance_reduction / 100)\nprint(f"Sample size multiplier: {equiv_multiplier:.2f}x  (CUPED simulated {equiv_multiplier:.2f}x your actual n)")',

    keyInsights: [
      'theta = Cov(Y,X) / Var(X) is exactly the OLS coefficient from regressing post_revenue on pre_revenue — numpy.cov gives you the 2×2 covariance matrix, and [0,1]/[1,1] extracts it',
      'Centering the covariate (X - mean(X)) ensures the adjustment doesn\'t shift the mean of Y — only reduces variance',
      'A 50% variance reduction is equivalent to doubling your sample size. With high correlation between pre and post revenue (typical in SaaS: r ≈ 0.7-0.85), you often achieve 40-70% variance reduction',
      'CUPED does not change the point estimate of the lift — only the standard error, making the same lift more statistically detectable',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE05 — SRM Detection in SQL (SQL · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code05-srm-sql',
    title: 'Detect a Sample Ratio Mismatch',
    subtitle: 'SQL · Chi-squared Test · Experiment Integrity',
    track: 'sql',
    difficulty: 'senior',
    isFree: false,
    tags: ['SRM', 'chi-squared', 'experiment integrity', 'data quality'],

    scenario: {
      company: 'Threadline · B2B SaaS',
      context: 'You\'re reviewing the assignment logs for a 50/50 experiment that ran for 14 days. The platform engineer tells you the split "looks roughly right." Before trusting any results, you need to run an SRM check — a chi-squared test to determine whether the assignment ratio is statistically consistent with the expected 50/50 split.',
      schema: [
        { table: 'experiment_assignments', description: 'One row per user assignment', columns: ['user_id', 'experiment_id', 'variant', 'assigned_at'] },
      ],
      task: 'Write a SQL query that computes the observed assignment counts per variant, the expected counts (assuming perfect 50/50), and the chi-squared statistic. Flag whether an SRM is detected at α = 0.05 (chi-squared critical value: 3.841 for 1 degree of freedom).',
    },

    hints: [
      'Chi-squared = SUM((observed - expected)^2 / expected) across variants',
      'Expected count = total_users * expected_proportion (0.5 for each arm in a 50/50 split)',
      'You can compute this entirely in SQL using window functions for the total',
      'Flag SRM: chi_sq > 3.841 means p < 0.05 — the assignment ratio is significantly non-random',
    ],

    partialCode: 'WITH assignment_counts AS (\n  SELECT\n    variant,\n    COUNT(DISTINCT user_id) AS observed_count\n  FROM experiment_assignments\n  WHERE experiment_id = \'exp_onboarding_v2\'\n    AND assigned_at BETWEEN \'2024-01-01\' AND \'2024-01-14\'\n  GROUP BY 1\n),\n\ntotals AS (\n  SELECT SUM(observed_count) AS total_users\n  FROM assignment_counts\n),\n\nchi_sq_components AS (\n  SELECT\n    ac.variant,\n    ac.observed_count,\n    t.total_users,\n\n    -- Expected count for a 50/50 split\n    ___ AS expected_count,\n\n    -- Chi-squared component: (O - E)^2 / E\n    ___ AS chi_sq_component\n\n  FROM assignment_counts ac\n  CROSS JOIN totals t\n)\n\nSELECT\n  -- Show per-variant breakdown\n  variant,\n  observed_count,\n  ROUND(expected_count, 0)               AS expected_count,\n  ROUND(100.0 * observed_count / SUM(observed_count) OVER (), 2) AS observed_pct,\n  ROUND(chi_sq_component, 4)             AS chi_sq_component,\n\n  -- Total chi-squared statistic\n  ROUND(SUM(chi_sq_component) OVER (), 4) AS chi_sq_total,\n\n  -- SRM flag: chi_sq > 3.841 => p < 0.05\n  CASE WHEN SUM(chi_sq_component) OVER () > ___ THEN \'SRM DETECTED ⚠️\' ELSE \'No SRM ✓\' END AS srm_status\n\nFROM chi_sq_components\nORDER BY variant;',

    modelAnswer: 'WITH assignment_counts AS (\n  SELECT\n    variant,\n    COUNT(DISTINCT user_id) AS observed_count\n  FROM experiment_assignments\n  WHERE experiment_id = \'exp_onboarding_v2\'\n    AND assigned_at BETWEEN \'2024-01-01\' AND \'2024-01-14\'\n  GROUP BY 1\n),\n\ntotals AS (\n  SELECT SUM(observed_count) AS total_users\n  FROM assignment_counts\n),\n\nchi_sq_components AS (\n  SELECT\n    ac.variant,\n    ac.observed_count,\n    t.total_users,\n\n    -- Expected count: total * 0.5 for a 50/50 split\n    t.total_users * 0.5                                        AS expected_count,\n\n    -- Chi-squared component per variant: (O - E)^2 / E\n    POWER(ac.observed_count - t.total_users * 0.5, 2)\n    / NULLIF(t.total_users * 0.5, 0)                          AS chi_sq_component\n\n  FROM assignment_counts ac\n  CROSS JOIN totals t\n)\n\nSELECT\n  variant,\n  observed_count,\n  ROUND(expected_count, 0)                                       AS expected_count,\n  ROUND(100.0 * observed_count / SUM(observed_count) OVER (), 2) AS observed_pct,\n  ROUND(chi_sq_component, 4)                                     AS chi_sq_component,\n\n  -- Sum across all variants using window function (no GROUP BY needed)\n  ROUND(SUM(chi_sq_component) OVER (), 4)                       AS chi_sq_total,\n\n  -- Critical value for df=1 at α=0.05 is 3.841\n  CASE\n    WHEN SUM(chi_sq_component) OVER () > 3.841\n    THEN \'SRM DETECTED ⚠️  — do not trust results\'\n    ELSE \'No SRM ✓  — assignment looks clean\'\n  END AS srm_status\n\nFROM chi_sq_components\nORDER BY variant;',

    keyInsights: [
      'SUM(...) OVER () is a window function that computes the total chi-squared across all variant rows without collapsing them — you get one row per variant with the total displayed on each',
      'POWER(O - E, 2) / E is the per-variant chi-squared component. Sum these across all k variants to get the test statistic',
      'For a 2-variant (1 df) experiment, the chi-squared critical value at α=0.05 is 3.841. Any value above this means p < 0.05 — the assignment is statistically non-random',
      'An SRM doesn\'t tell you what caused the imbalance — it tells you something went wrong in assignment (bots, caching, early stopping). You must pause the experiment and investigate before trusting any metric results',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE06 — Mix Shift Decomposition in SQL (SQL · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code06-mix-shift-sql',
    title: 'Decompose a Mix Shift',
    subtitle: 'SQL · Shift-Share Analysis · Business Decomposition',
    track: 'sql',
    difficulty: 'senior',
    isFree: false,
    tags: ['mix shift', 'shift-share', 'business decomposition', 'margin analysis'],

    scenario: {
      company: 'Vantage Analytics · B2B SaaS',
      context: 'Overall gross margin compressed from 71% to 64% last quarter. The CFO asks: "How much of this is because our customer mix changed (more SMB, less enterprise) vs. each segment\'s margin actually getting worse?" This is a mix shift decomposition — separating mix effect from rate effect.',
      schema: [
        { table: 'segment_margin_history', description: 'Quarterly margin by segment', columns: ['quarter', 'segment', 'revenue', 'gross_profit'] },
        { table: '—', description: 'quarter: "2024_Q2" | "2024_Q3". segment: "enterprise" | "smb"', columns: [] },
      ],
      task: 'Write a SQL query that decomposes the 7pp margin compression into (a) mix effect — how much compression is explained by the shift toward SMB — and (b) rate effect — how much compression came from each segment\'s own margin changing.',
    },

    hints: [
      'Mix effect = change in segment weight × prior period margin rate (if the rate stayed constant, how much would mix alone move the needle?)',
      'Rate effect = prior period weight × change in segment margin rate',
      'Total change ≈ mix effect + rate effect (interaction term is small and usually omitted)',
      'This is a shift-share decomposition — the same logic used in economic regional analysis',
    ],

    partialCode: 'WITH quarterly_margins AS (\n  SELECT\n    quarter,\n    segment,\n    revenue,\n    gross_profit,\n    ROUND(100.0 * gross_profit / NULLIF(revenue, 0), 2) AS margin_rate\n  FROM segment_margin_history\n),\n\n-- Pivot to get Q2 and Q3 side by side per segment\npivoted AS (\n  SELECT\n    segment,\n    MAX(CASE WHEN quarter = \'2024_Q2\' THEN revenue    END) AS q2_revenue,\n    MAX(CASE WHEN quarter = \'2024_Q2\' THEN margin_rate END) AS q2_margin,\n    MAX(CASE WHEN quarter = \'2024_Q3\' THEN revenue    END) AS q3_revenue,\n    MAX(CASE WHEN quarter = \'2024_Q3\' THEN margin_rate END) AS q3_margin\n  FROM quarterly_margins\n  GROUP BY 1\n),\n\n-- Compute total revenue per period for weight calculation\ntotals AS (\n  SELECT\n    SUM(q2_revenue) AS total_q2_rev,\n    SUM(q3_revenue) AS total_q3_rev\n  FROM pivoted\n),\n\ndecomposition AS (\n  SELECT\n    p.segment,\n    p.q2_revenue, p.q2_margin,\n    p.q3_revenue, p.q3_margin,\n\n    -- Segment weight in each period\n    ___ AS q2_weight,   -- q2_revenue / total_q2_rev\n    ___ AS q3_weight,   -- q3_revenue / total_q3_rev\n\n    -- Mix effect: (q3_weight - q2_weight) * q2_margin\n    ___ AS mix_effect_pp,\n\n    -- Rate effect: q2_weight * (q3_margin - q2_margin)\n    ___ AS rate_effect_pp\n\n  FROM pivoted p CROSS JOIN totals t\n)\n\nSELECT\n  segment,\n  ROUND(q2_weight * 100, 1) AS q2_weight_pct,\n  ROUND(q3_weight * 100, 1) AS q3_weight_pct,\n  ROUND(q2_margin, 1) AS q2_margin_pct,\n  ROUND(q3_margin, 1) AS q3_margin_pct,\n  ROUND(mix_effect_pp,  2) AS mix_effect_pp,\n  ROUND(rate_effect_pp, 2) AS rate_effect_pp,\n  ROUND(mix_effect_pp + rate_effect_pp, 2) AS total_explained_pp\nFROM decomposition\nORDER BY segment;',

    modelAnswer: 'WITH quarterly_margins AS (\n  SELECT\n    quarter,\n    segment,\n    revenue,\n    gross_profit,\n    ROUND(100.0 * gross_profit / NULLIF(revenue, 0), 2) AS margin_rate\n  FROM segment_margin_history\n),\n\npivoted AS (\n  SELECT\n    segment,\n    MAX(CASE WHEN quarter = \'2024_Q2\' THEN revenue    END) AS q2_revenue,\n    MAX(CASE WHEN quarter = \'2024_Q2\' THEN margin_rate END) AS q2_margin,\n    MAX(CASE WHEN quarter = \'2024_Q3\' THEN revenue    END) AS q3_revenue,\n    MAX(CASE WHEN quarter = \'2024_Q3\' THEN margin_rate END) AS q3_margin\n  FROM quarterly_margins\n  GROUP BY 1\n),\n\ntotals AS (\n  SELECT\n    SUM(q2_revenue) AS total_q2_rev,\n    SUM(q3_revenue) AS total_q3_rev\n  FROM pivoted\n),\n\ndecomposition AS (\n  SELECT\n    p.segment,\n    p.q2_revenue, p.q2_margin,\n    p.q3_revenue, p.q3_margin,\n\n    -- Segment weights\n    p.q2_revenue / t.total_q2_rev  AS q2_weight,\n    p.q3_revenue / t.total_q3_rev  AS q3_weight,\n\n    -- Mix effect: weight shift × prior-period rate\n    -- "If rates hadn\'t changed, how much would the mix shift move overall margin?"\n    (p.q3_revenue / t.total_q3_rev - p.q2_revenue / t.total_q2_rev) * p.q2_margin\n      AS mix_effect_pp,\n\n    -- Rate effect: prior-period weight × rate change\n    -- "If the mix hadn\'t changed, how much would the rate change move overall margin?"\n    (p.q2_revenue / t.total_q2_rev) * (p.q3_margin - p.q2_margin)\n      AS rate_effect_pp\n\n  FROM pivoted p CROSS JOIN totals t\n)\n\nSELECT\n  segment,\n  ROUND(q2_weight * 100, 1)             AS q2_weight_pct,\n  ROUND(q3_weight * 100, 1)             AS q3_weight_pct,\n  ROUND(q2_margin, 1)                   AS q2_margin_pct,\n  ROUND(q3_margin, 1)                   AS q3_margin_pct,\n  ROUND(mix_effect_pp,  2)              AS mix_effect_pp,\n  ROUND(rate_effect_pp, 2)              AS rate_effect_pp,\n  ROUND(mix_effect_pp + rate_effect_pp, 2) AS total_explained_pp\n\nFROM decomposition\nORDER BY segment;',

    keyInsights: [
      'Mix effect = weight change × prior rate: answers "if segment margins had stayed flat, how much would the compositional shift alone change overall margin?"',
      'Rate effect = prior weight × rate change: answers "if the mix hadn\'t changed, how much would each segment\'s own margin movement have caused?"',
      'If mix_effect_pp for SMB is negative (larger SMB weight × lower SMB margin), that\'s the mix drag. If rate_effect_pp for SMB is also negative, SMB\'s margin got worse within the quarter too',
      'Sum the mix_effect + rate_effect across both segments to reconstruct the total observed margin change — the two components should add up to approximately -7pp',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE07 — CUPED Variance Reduction in SQL (SQL · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code07-cuped-sql',
    title: 'Apply CUPED Variance Reduction in SQL',
    subtitle: 'SQL · CUPED · Pre-experiment Covariate · CTEs',
    track: 'sql',
    difficulty: 'senior',
    isFree: false,
    tags: ['CUPED', 'variance reduction', 'CTEs', 'experimentation', 'covariate adjustment'],

    scenario: {
      company: 'Ardent Commerce',
      context: 'Ardent Commerce ran a two-week A/B test on a new recommendations widget. The head of experimentation flags that the test is slightly underpowered on revenue — there\'s a real effect, but the p-value is hovering around 0.07. She asks you to apply CUPED using last week\'s revenue (pre-experiment) as the covariate. You have the raw assignment and orders tables in the warehouse. Do the full CUPED adjustment entirely in SQL.',
      schema: [
        { table: 'experiment_assignments', description: 'One row per user, assigned at experiment start', columns: ['user_id', 'variant', 'assigned_at'] },
        { table: 'orders', description: 'One row per order', columns: ['user_id', 'order_ts', 'revenue'] },
        { table: '—', description: 'Experiment ran 2024-01-15 to 2024-01-28. Pre-experiment window: 2024-01-08 to 2024-01-14.', columns: [] },
      ],
      task: 'Write a SQL query that computes CUPED-adjusted revenue per user. Steps: (1) aggregate pre-experiment revenue per user as covariate X, (2) aggregate experiment-period revenue per user as outcome Y, (3) compute theta = Cov(Y, X) / Var(X) using SQL aggregate functions, (4) compute Y_cuped = Y - theta * (X - mean_X) for each user.',
    },

    hints: [
      'Cov(Y, X) in SQL: AVG(Y * X) - AVG(Y) * AVG(X) — the definitional formula works cleanly as window or subquery aggregates',
      'Var(X) in SQL: AVG(X * X) - AVG(X) * AVG(X) — same pattern as covariance but both columns are X',
      'theta is a single scalar — compute it in one CTE, then cross-join it into the per-user CTE so every row can use it',
      'Users with zero pre-experiment revenue still get a CUPED adjustment (X=0, so the correction is -theta * (0 - mean_X) = +theta * mean_X)',
    ],

    partialCode: 'WITH pre_revenue AS (\n  -- Covariate X: revenue per user in the week BEFORE the experiment\n  SELECT\n    ea.user_id,\n    ea.variant,\n    COALESCE(SUM(o.revenue), 0) AS pre_rev\n  FROM experiment_assignments ea\n  LEFT JOIN orders o\n    ON ea.user_id = o.user_id\n    AND o.order_ts BETWEEN \'2024-01-08\' AND \'2024-01-14\'\n  GROUP BY 1, 2\n),\n\nexp_revenue AS (\n  -- Outcome Y: revenue per user DURING the experiment\n  SELECT\n    ea.user_id,\n    COALESCE(SUM(o.revenue), 0) AS exp_rev\n  FROM experiment_assignments ea\n  LEFT JOIN orders o\n    ON ea.user_id = o.user_id\n    -- TODO: filter order_ts to the experiment window (2024-01-15 to 2024-01-28)\n  GROUP BY 1\n),\n\ncombined AS (\n  SELECT\n    pr.user_id,\n    pr.variant,\n    pr.pre_rev   AS x,   -- covariate\n    er.exp_rev   AS y    -- outcome\n  FROM pre_revenue pr\n  JOIN exp_revenue er ON pr.user_id = er.user_id\n),\n\ntheta_calc AS (\n  -- theta = Cov(Y, X) / Var(X)\n  -- TODO: compute cov_yx = AVG(y * x) - AVG(y) * AVG(x)\n  -- TODO: compute var_x  = AVG(x * x) - AVG(x) * AVG(x)\n  -- TODO: theta = cov_yx / NULLIF(var_x, 0)\n  SELECT\n    ___ AS mean_x,\n    ___ AS cov_yx,\n    ___ AS var_x,\n    ___ AS theta\n  FROM combined\n)\n\nSELECT\n  c.user_id,\n  c.variant,\n  c.y                                                        AS raw_revenue,\n  -- TODO: compute cuped_revenue = y - theta * (x - mean_x)\n  ___                                                        AS cuped_revenue,\n  t.theta,\n  t.mean_x\nFROM combined c\nCROSS JOIN theta_calc t\nORDER BY c.user_id;',

    modelAnswer: 'WITH pre_revenue AS (\n  -- Covariate X: revenue per user in the week before the experiment\n  SELECT\n    ea.user_id,\n    ea.variant,\n    COALESCE(SUM(o.revenue), 0) AS pre_rev\n  FROM experiment_assignments ea\n  LEFT JOIN orders o\n    ON ea.user_id = o.user_id\n    AND o.order_ts BETWEEN \'2024-01-08\' AND \'2024-01-14\'\n  GROUP BY 1, 2\n),\n\nexp_revenue AS (\n  -- Outcome Y: revenue per user during the experiment period\n  SELECT\n    ea.user_id,\n    COALESCE(SUM(o.revenue), 0) AS exp_rev\n  FROM experiment_assignments ea\n  LEFT JOIN orders o\n    ON ea.user_id = o.user_id\n    AND o.order_ts BETWEEN \'2024-01-15\' AND \'2024-01-28\'\n  GROUP BY 1\n),\n\ncombined AS (\n  SELECT\n    pr.user_id,\n    pr.variant,\n    pr.pre_rev  AS x,   -- covariate (pre-experiment revenue)\n    er.exp_rev  AS y    -- outcome (experiment-period revenue)\n  FROM pre_revenue pr\n  JOIN exp_revenue er ON pr.user_id = er.user_id\n),\n\ntheta_calc AS (\n  -- Compute theta = Cov(Y, X) / Var(X) using the definitional formulas\n  -- Cov(Y, X) = E[YX] - E[Y]*E[X]\n  -- Var(X)    = E[X^2] - E[X]^2\n  SELECT\n    AVG(x)                                                         AS mean_x,\n    AVG(y * x) - AVG(y) * AVG(x)                                  AS cov_yx,\n    AVG(x * x) - AVG(x) * AVG(x)                                  AS var_x,\n    (AVG(y * x) - AVG(y) * AVG(x))\n      / NULLIF(AVG(x * x) - AVG(x) * AVG(x), 0)                  AS theta\n  FROM combined\n)\n\n-- Final output: CUPED-adjusted revenue per user\n-- Y_cuped = Y - theta * (X - mean_X)\nSELECT\n  c.user_id,\n  c.variant,\n  c.y                                                              AS raw_revenue,\n  c.y - t.theta * (c.x - t.mean_x)                               AS cuped_revenue,\n  c.x                                                              AS pre_revenue_covariate,\n  ROUND(t.theta,  4)                                               AS theta,\n  ROUND(t.mean_x, 4)                                               AS mean_pre_revenue\n\nFROM combined c\nCROSS JOIN theta_calc t\nORDER BY c.user_id;\n\n-- To get per-variant summary after this, wrap in another CTE:\n-- SELECT variant, AVG(cuped_revenue) AS mean_cuped_rev, VARIANCE(cuped_revenue) AS var_cuped\n-- FROM (...above...) GROUP BY variant',

    keyInsights: [
      'theta = Cov(Y,X) / Var(X) is the OLS regression coefficient of Y on X. In SQL, Cov(Y,X) = AVG(Y*X) - AVG(Y)*AVG(X) and Var(X) = AVG(X^2) - AVG(X)^2 — the definitional formula computes cleanly as aggregate expressions',
      'CROSS JOIN theta_calc distributes the single scalar theta and mean_x to every row without a correlated subquery — this is the idiomatic SQL pattern for broadcasting a global statistic into per-row calculations',
      'CUPED works best when pre-experiment and experiment-period revenue are highly correlated (r > 0.5). For e-commerce, weekly revenue typically has r ≈ 0.6–0.8, giving 35–65% variance reduction',
      'Users with no pre-experiment orders get x=0. Their adjustment becomes -theta*(0 - mean_x) = +theta*mean_x, slightly shifting their adjusted revenue upward — this is correct behavior, not a bug',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE08 — Bootstrap Confidence Interval in Python (Python · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code08-bootstrap-python',
    title: 'Compute a Bootstrap Confidence Interval',
    subtitle: 'Python · Bootstrap · Skewed Distributions · Resampling',
    track: 'python',
    difficulty: 'senior',
    isFree: false,
    tags: ['bootstrap', 'confidence intervals', 'numpy', 'skewed distributions', 'A/B testing'],

    scenario: {
      company: 'Loopwise',
      context: 'Loopwise ran an A/B test on a new onboarding flow for 21 days. The metric is 30-day revenue per user. The distribution is highly skewed: 74% of users pay nothing, and a small fraction drives the bulk of revenue. A standard normal-theory confidence interval assumes the sampling distribution of the mean is approximately normal — an assumption that breaks down with this kind of zero-inflated, heavy-tailed data at moderate sample sizes. The senior analyst asks you to compute a 95% bootstrap CI for the treatment effect (mean revenue difference) using 10,000 bootstrap samples.',
      schema: [
        { table: 'DataFrame: df', description: 'One row per user', columns: ['user_id', 'variant', 'revenue_30d'] },
        { table: '—', description: 'variant: "control" | "treatment". revenue_30d: float, many zeros', columns: [] },
      ],
      task: 'Write Python code that: (1) separates control and treatment revenue arrays, (2) runs 10,000 bootstrap iterations — sampling with replacement from each arm and recording the mean difference — (3) computes the 2.5th and 97.5th percentiles of the bootstrap delta distribution as the 95% CI, (4) prints the observed lift, the CI, and whether the CI excludes zero.',
    },

    hints: [
      'np.random.choice(arr, size=len(arr), replace=True) draws a bootstrap sample of the same size as the original',
      'Compute the delta for each bootstrap iteration as: np.mean(boot_treatment) - np.mean(boot_control)',
      'The percentile CI is np.percentile(deltas, [2.5, 97.5]) — no normal approximation needed',
      'Set np.random.seed(42) for reproducibility before the loop',
    ],

    partialCode: 'import numpy as np\nimport pandas as pd\n\n# Assume df is loaded with columns: user_id, variant, revenue_30d\nnp.random.seed(42)\n\n# 1. Separate the two arms into numpy arrays\ncontrol_rev   = df.loc[df[\'variant\'] == \'control\',   \'revenue_30d\'].values\ntreatment_rev = df.loc[df[\'variant\'] == \'treatment\', \'revenue_30d\'].values\n\n# Observed lift (point estimate)\nobserved_lift = treatment_rev.mean() - control_rev.mean()\nprint(f"Observed lift: ${observed_lift:.4f}")\nprint(f"Control mean:   ${control_rev.mean():.4f}  (n={len(control_rev):,})")\nprint(f"Treatment mean: ${treatment_rev.mean():.4f}  (n={len(treatment_rev):,})")\n\n# 2. Bootstrap loop — 10,000 iterations\nn_boot = 10_000\nboot_deltas = np.zeros(n_boot)\n\nfor i in range(n_boot):\n    # TODO: draw a bootstrap sample from control_rev (same size, with replacement)\n    boot_control   = ___\n\n    # TODO: draw a bootstrap sample from treatment_rev (same size, with replacement)\n    boot_treatment = ___\n\n    # TODO: store the mean difference in boot_deltas[i]\n    boot_deltas[i] = ___\n\n# 3. Compute the 95% percentile CI\n# TODO: use np.percentile to get the 2.5th and 97.5th percentiles\nci_lower, ci_upper = ___\n\nprint(f"\\n95% Bootstrap CI: [${ci_lower:.4f}, ${ci_upper:.4f}]")\nprint(f"CI excludes zero (significant): {ci_lower > 0 or ci_upper < 0}")',

    modelAnswer: 'import numpy as np\nimport pandas as pd\n\n# Assume df is loaded with columns: user_id, variant, revenue_30d\nnp.random.seed(42)\n\n# 1. Separate arms\ncontrol_rev   = df.loc[df[\'variant\'] == \'control\',   \'revenue_30d\'].values\ntreatment_rev = df.loc[df[\'variant\'] == \'treatment\', \'revenue_30d\'].values\n\nobserved_lift = treatment_rev.mean() - control_rev.mean()\nprint(f"Observed lift:  ${observed_lift:.4f}")\nprint(f"Control mean:   ${control_rev.mean():.4f}  (n={len(control_rev):,})")\nprint(f"Treatment mean: ${treatment_rev.mean():.4f}  (n={len(treatment_rev):,})")\nprint(f"\\nRevenue distribution (% zero-revenue users):")\nprint(f"  Control:   {(control_rev == 0).mean():.1%} zeros")\nprint(f"  Treatment: {(treatment_rev == 0).mean():.1%} zeros")\n\n# 2. Bootstrap loop\nn_boot = 10_000\nboot_deltas = np.zeros(n_boot)\n\nfor i in range(n_boot):\n    # Sample with replacement — same size as each arm\'s original n\n    boot_control   = np.random.choice(control_rev,   size=len(control_rev),   replace=True)\n    boot_treatment = np.random.choice(treatment_rev, size=len(treatment_rev), replace=True)\n    boot_deltas[i] = boot_treatment.mean() - boot_control.mean()\n\n# 3. Percentile CI — no normal approximation, reads directly from the bootstrap distribution\nci_lower, ci_upper = np.percentile(boot_deltas, [2.5, 97.5])\n\nprint(f"\\n95% Bootstrap CI: [${ci_lower:.4f}, ${ci_upper:.4f}]")\nprint(f"Observed lift:    ${observed_lift:.4f}")\nprint(f"CI excludes zero (significant at 95%): {ci_lower > 0 or ci_upper < 0}")\n\n# 4. Bootstrap distribution summary\nprint(f"\\nBootstrap delta distribution:")\nprint(f"  Mean of bootstrap deltas: ${boot_deltas.mean():.4f}  (should ≈ observed lift)")\nprint(f"  Std of bootstrap deltas:  ${boot_deltas.std():.4f}   (bootstrap SE)")\nprint(f"  Skewness of deltas: {((boot_deltas - boot_deltas.mean())**3).mean() / boot_deltas.std()**3:.3f}")',

    keyInsights: [
      'The percentile bootstrap CI is non-parametric — it makes no assumption about the sampling distribution shape. This matters for zero-inflated revenue where the CLT convergence is slow at moderate sample sizes (n < 50k per arm)',
      'np.random.choice(arr, size=len(arr), replace=True) is the canonical bootstrap sample. The key is replace=True and size equal to the original n — drawing fewer or more changes the variance estimate',
      '10,000 iterations is the practical standard: it gives stable CI estimates (bootstrap SE of the CI endpoint is small) without being computationally expensive. For production use, 1,000 iterations is often enough; 100,000 adds precision but rarely changes decisions',
      'The bootstrap delta distribution mean should closely match the observed lift — if it doesn\'t, check that you\'re sampling from the right arrays. The standard deviation of boot_deltas is the bootstrap standard error of the lift estimate',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE09 — Funnel Visualization with Matplotlib (Python · Analyst)
  // ─────────────────────────────────────────────
  {
    id: 'code09-funnel-viz-python',
    title: 'Visualize Funnel Conversion Rates',
    subtitle: 'Python · Matplotlib · Horizontal Bar Chart · Annotations',
    track: 'python',
    difficulty: 'analyst',
    isFree: false,
    tags: ['matplotlib', 'funnel', 'visualization', 'bar chart', 'annotations'],

    scenario: {
      company: 'Crestline Home',
      context: 'The same checkout funnel from the SQL module. The PM has already run the SQL query and has pre-computed conversion rates for pre- vs post-deployment in a DataFrame. Now she needs a clean horizontal bar chart to drop into the all-hands deck — one that shows both periods side by side at each funnel step, with the delta annotated so the audience can immediately see where the drop happened. She wants it to look polished, not like a default matplotlib output.',
      schema: [
        { table: 'DataFrame: df', description: 'Pre-computed funnel conversion rates', columns: ['step', 'pre_rate', 'post_rate'] },
        { table: '—', description: 'step: e.g. "Cart Viewed", "Payment Page", "Payment Submitted", "Order Confirmed"', columns: [] },
        { table: '—', description: 'pre_rate, post_rate: conversion rate as a percentage float, e.g. 78.4', columns: [] },
      ],
      task: 'Write Python/matplotlib code that produces a horizontal bar chart: y-axis = funnel steps, x-axis = conversion rate (%), two bars per step (pre-deploy in blue, post-deploy in orange), with a delta annotation (e.g. "▼ 3.2pp") displayed to the right of the longer bar for each step.',
    },

    hints: [
      'Use ax.barh() twice — once for pre_rate and once for post_rate. Offset the y positions by bar_height/2 to create the side-by-side layout',
      'Enumerate the steps with np.arange(len(df)) for numeric y positions, then set ax.set_yticks and ax.set_yticklabels to label them',
      'For each step, compute delta = post_rate - pre_rate. Use "▲" if positive, "▼" if negative',
      'ax.text(x, y, label, va="center") places the annotation. Use max(pre_rate, post_rate) + 1 as the x position to place it just past the longer bar',
    ],

    partialCode: 'import matplotlib.pyplot as plt\nimport matplotlib.patches as mpatches\nimport numpy as np\n\n# Sample data — replace with your actual df\nimport pandas as pd\ndf = pd.DataFrame({\n    \'step\':      [\'Cart Viewed\', \'Payment Page\', \'Payment Submitted\', \'Order Confirmed\'],\n    \'pre_rate\':  [100.0, 78.4, 61.2, 54.7],\n    \'post_rate\': [100.0, 77.1, 55.3, 48.9],\n})\n\n# Chart setup\nfig, ax = plt.subplots(figsize=(10, 5))\nbar_height = 0.35\ny = np.arange(len(df))\n\n# TODO: draw the pre_rate bars (blue, label=\'Pre-deploy\')\n# Hint: ax.barh(y + bar_height/2, df[\'pre_rate\'], height=bar_height, ...)\nbars_pre  = ___\n\n# TODO: draw the post_rate bars (orange, label=\'Post-deploy\')\nbars_post = ___\n\n# TODO: annotate each step with the delta\n# For each i, compute delta = post - pre, choose arrow symbol, call ax.text(...)\nfor i, row in df.iterrows():\n    delta = ___\n    arrow = ___   # \'▲\' if delta > 0 else \'▼\'\n    label = ___   # e.g. \'▼ 3.2pp\'\n    x_pos = ___   # just past the longer of the two bars\n    # TODO: call ax.text to place the annotation\n\n# Axis labels and formatting\nax.set_xlabel(\'Conversion Rate (%)\', fontsize=12)\nax.set_title(\'Checkout Funnel: Pre vs Post Deployment\', fontsize=14, fontweight=\'bold\')\n\n# TODO: set y-tick positions and labels (use y and df[\'step\'])\nax.set_yticks(___)\nax.set_yticklabels(___)\n\nax.set_xlim(0, 115)\nax.legend(handles=[bars_pre, bars_post], loc=\'lower right\')\nax.spines[[\'top\', \'right\']].set_visible(False)\n\nplt.tight_layout()\nplt.show()',

    modelAnswer: 'import matplotlib.pyplot as plt\nimport matplotlib.patches as mpatches\nimport numpy as np\nimport pandas as pd\n\n# Sample data\ndf = pd.DataFrame({\n    \'step\':      [\'Cart Viewed\', \'Payment Page\', \'Payment Submitted\', \'Order Confirmed\'],\n    \'pre_rate\':  [100.0, 78.4, 61.2, 54.7],\n    \'post_rate\': [100.0, 77.1, 55.3, 48.9],\n})\n\nfig, ax = plt.subplots(figsize=(10, 5))\nbar_height = 0.35\ny = np.arange(len(df))\n\n# Draw bars — offset by half bar_height to create side-by-side layout\nbars_pre  = ax.barh(y + bar_height / 2, df[\'pre_rate\'],  height=bar_height,\n                    color=\'#4C72B0\', label=\'Pre-deploy\',  alpha=0.85)\nbars_post = ax.barh(y - bar_height / 2, df[\'post_rate\'], height=bar_height,\n                    color=\'#DD8452\', label=\'Post-deploy\', alpha=0.85)\n\n# Annotate each step with the delta\nfor i, row in df.iterrows():\n    delta  = row[\'post_rate\'] - row[\'pre_rate\']\n    arrow  = \'▲\' if delta > 0 else \'▼\'\n    color  = \'#2ca02c\' if delta > 0 else \'#d62728\'\n    label  = f\'{arrow} {abs(delta):.1f}pp\'\n    x_pos  = max(row[\'pre_rate\'], row[\'post_rate\']) + 1.5\n    ax.text(x_pos, y[i], label, va=\'center\', ha=\'left\',\n            fontsize=10, color=color, fontweight=\'bold\')\n\n# Axis formatting\nax.set_xlabel(\'Conversion Rate (%)\', fontsize=12)\nax.set_title(\'Checkout Funnel: Pre vs Post Deployment\', fontsize=14, fontweight=\'bold\')\nax.set_yticks(y)\nax.set_yticklabels(df[\'step\'], fontsize=11)\nax.set_xlim(0, 120)\nax.axvline(x=100, color=\'grey\', linestyle=\'--\', linewidth=0.8, alpha=0.5)\n\n# Legend\nax.legend(handles=[bars_pre, bars_post], loc=\'lower right\', fontsize=10)\nax.spines[[\'top\', \'right\']].set_visible(False)\nax.tick_params(axis=\'x\', labelsize=10)\n\nplt.tight_layout()\nplt.show()',

    keyInsights: [
      'Horizontal bar charts are preferred over vertical for funnel steps because the step labels are long strings — horizontal layout gives them natural reading space on the y-axis without rotation or truncation',
      'The side-by-side layout uses y + bar_height/2 for one series and y - bar_height/2 for the other. This centers the pair of bars on the tick mark. bar_height = 0.35 leaves a small gap between pairs, making the grouping visually clear',
      'Delta annotations use ax.text() positioned at max(pre_rate, post_rate) + 1.5 so the label always clears the longer bar regardless of which period is higher. Color-coding green/red makes the direction immediately scannable',
      'ax.spines[[\'top\', \'right\']].set_visible(False) is a single line that removes the two chart borders that add no information, giving the chart a cleaner, more presentation-ready look',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE10 — Retention Heatmap in Python (Python · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code10-retention-heatmap',
    title: 'Build a Cohort Retention Heatmap',
    subtitle: 'Python · Seaborn · Cohort Analysis · Pivot Tables',
    track: 'python',
    difficulty: 'senior',
    isFree: false,
    tags: ['retention', 'cohort analysis', 'seaborn', 'heatmap', 'pivot_table'],

    scenario: {
      company: 'Threadline · B2B SaaS',
      context: 'Threadline\'s growth team wants to understand long-term retention by signup cohort. They need a classic cohort retention heatmap: rows are weekly signup cohorts (e.g. "2024-W01"), columns are weeks since signup (W0 through W12), and each cell shows the percentage of that cohort still active in that week. The raw data is a long-format DataFrame with one row per user per week they were active. You need to pivot it into the cohort × week matrix, normalize by cohort size, and render it as a seaborn heatmap.',
      schema: [
        { table: 'DataFrame: df', description: 'One row per user per week they were active', columns: ['user_id', 'signup_week', 'activity_week'] },
        { table: '—', description: 'signup_week: ISO week string like "2024-W01"', columns: [] },
        { table: '—', description: 'activity_week: ISO week string like "2024-W03" (can be any week on or after signup_week)', columns: [] },
      ],
      task: 'Write Python code that: (1) computes weeks_since_signup for each row, (2) counts distinct active users per cohort × week-offset cell, (3) divides by cohort size to get retention rates (0–100%), (4) renders the result as a seaborn heatmap with percentage annotations. Handle the NaN triangle (future cohorts have no data for later weeks) gracefully.',
    },

    hints: [
      'Convert signup_week and activity_week to actual dates using pd.to_datetime(df["signup_week"] + "-1", format="%G-W%V-%u") to get Monday of each ISO week',
      'weeks_since_signup = (activity_week_dt - signup_week_dt).dt.days // 7',
      'Use df.pivot_table(index="signup_week", columns="weeks_since_signup", values="user_id", aggfunc="nunique", fill_value=0) to get the activity counts matrix',
      'Divide each row by cohort_sizes (a Series indexed by signup_week) using retention_matrix.div(cohort_sizes, axis=0) then multiply by 100',
    ],

    partialCode: 'import pandas as pd\nimport numpy as np\nimport seaborn as sns\nimport matplotlib.pyplot as plt\nimport matplotlib.ticker as mticker\n\n# Assume df is loaded with columns: user_id, signup_week, activity_week\n# Example signup_week values: \'2024-W01\', \'2024-W02\', ...\n\n# 1. Convert ISO week strings to dates (Monday of each week)\ndf[\'signup_week_dt\']   = pd.to_datetime(df[\'signup_week\']   + \'-1\', format=\'%G-W%V-%u\')\ndf[\'activity_week_dt\'] = pd.to_datetime(df[\'activity_week\'] + \'-1\', format=\'%G-W%V-%u\')\n\n# 2. Compute weeks since signup\ndf[\'weeks_since_signup\'] = (df[\'activity_week_dt\'] - df[\'signup_week_dt\']).dt.days // 7\n\n# 3. Cohort sizes: distinct users per signup_week\ncohort_sizes = df.groupby(\'signup_week\')[\'user_id\'].nunique()\nprint("Cohort sizes:")\nprint(cohort_sizes)\n\n# 4. Pivot: rows = signup_week, columns = weeks_since_signup, values = distinct active users\n# TODO: use pd.pivot_table with aggfunc=\'nunique\' and fill_value=0\nactivity_matrix = ___\n\n# 5. Normalize by cohort size to get retention rates (0–100%)\n# TODO: divide activity_matrix by cohort_sizes (align on signup_week index) and multiply by 100\nretention_matrix = ___\n\n# 6. Keep only W0 through W12\nretention_matrix = retention_matrix.loc[:, 0:12]\n\n# 7. Render heatmap\nfig, ax = plt.subplots(figsize=(14, 7))\n\n# TODO: call sns.heatmap with annot=True, fmt=\'.0f\', cmap=\'Blues_r\'\n# Hint: use mask=retention_matrix.isna() to leave the NaN triangle blank\n___\n\nax.set_title(\'Weekly Cohort Retention Heatmap (%)\', fontsize=14, fontweight=\'bold\', pad=12)\nax.set_xlabel(\'Weeks Since Signup\', fontsize=11)\nax.set_ylabel(\'Signup Week\', fontsize=11)\nplt.tight_layout()\nplt.show()',

    modelAnswer: 'import pandas as pd\nimport numpy as np\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\n# Assume df is loaded with columns: user_id, signup_week, activity_week\n\n# 1. Convert ISO week strings to Monday dates\ndf[\'signup_week_dt\']   = pd.to_datetime(df[\'signup_week\']   + \'-1\', format=\'%G-W%V-%u\')\ndf[\'activity_week_dt\'] = pd.to_datetime(df[\'activity_week\'] + \'-1\', format=\'%G-W%V-%u\')\n\n# 2. Weeks since signup (integer offset)\ndf[\'weeks_since_signup\'] = (df[\'activity_week_dt\'] - df[\'signup_week_dt\']).dt.days // 7\n\n# 3. Cohort sizes — distinct users who signed up each week\ncohort_sizes = df.groupby(\'signup_week\')[\'user_id\'].nunique()\n\n# 4. Activity counts matrix: unique users active in each cohort × week-offset cell\nactivity_matrix = df.pivot_table(\n    index=\'signup_week\',\n    columns=\'weeks_since_signup\',\n    values=\'user_id\',\n    aggfunc=\'nunique\',\n    fill_value=0\n)\n\n# 5. Retention rates: divide by cohort size, convert to percentage\n#    .div(cohort_sizes, axis=0) aligns on the signup_week index\nretention_matrix = activity_matrix.div(cohort_sizes, axis=0) * 100\n\n# 6. Trim to W0–W12 (filter out negative offsets or beyond W12)\ncols_to_keep = [c for c in range(0, 13) if c in retention_matrix.columns]\nretention_matrix = retention_matrix[cols_to_keep]\n\n# 7. Build the NaN mask: future cohorts have no data for later weeks\n#    Any cell where the cohort hasn\'t had enough time is already 0 from fill_value.\n#    Re-apply NaN for cells where activity was truly impossible (week offset > cohort age).\ncohort_age = {\n    week: (retention_matrix.columns.max() - i)\n    for i, week in enumerate(retention_matrix.index)\n}\nmask = pd.DataFrame(False, index=retention_matrix.index, columns=retention_matrix.columns)\nfor i, week in enumerate(retention_matrix.index):\n    max_observable_week = len(retention_matrix.index) - 1 - i\n    for col in retention_matrix.columns:\n        if col > max_observable_week:\n            mask.loc[week, col] = True\n            retention_matrix.loc[week, col] = np.nan\n\n# 8. Heatmap\nfig, ax = plt.subplots(figsize=(14, 7))\n\nsns.heatmap(\n    retention_matrix,\n    annot=True,\n    fmt=\'.0f\',\n    cmap=\'Blues_r\',           # Reversed Blues: darker = better retention\n    mask=mask,\n    linewidths=0.4,\n    linecolor=\'#e0e0e0\',\n    vmin=0,\n    vmax=100,\n    cbar_kws={\'label\': \'Retention %\', \'shrink\': 0.6},\n    ax=ax\n)\n\nax.set_title(\'Weekly Cohort Retention Heatmap (%)\', fontsize=14, fontweight=\'bold\', pad=12)\nax.set_xlabel(\'Weeks Since Signup\', fontsize=11)\nax.set_ylabel(\'Signup Week\', fontsize=11)\nax.tick_params(axis=\'both\', labelsize=9)\n\nplt.tight_layout()\nplt.show()',

    keyInsights: [
      'The pivot_table pattern (index=cohort, columns=week_offset, aggfunc=\'nunique\') is the core of cohort analysis. fill_value=0 ensures cohorts with zero activity in a week show 0 not NaN — you separately apply NaN only to the future triangle where data is structurally impossible',
      'Dividing by cohort_sizes with .div(cohort_sizes, axis=0) normalizes each row by its own cohort\'s starting size. Critically, this uses absolute cohort size as the denominator throughout — not the previous week\'s active users — so W8 retention is always "% of original cohort", not "% of W7 survivors"',
      'The NaN triangle arises because recent cohorts simply haven\'t existed long enough to have W8, W9, ... data. Masking these cells (mask=True in sns.heatmap) leaves them blank in the heatmap, preventing them from being misread as zero retention',
      'cmap=\'Blues_r\' (reversed) maps high retention to dark blue and low retention to light/white. This is the convention for retention heatmaps — the visual gradient flows naturally from the dense dark diagonal (W0 = 100%) outward',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE11 — Second Purchase Date (SQL · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code11-second-purchase-sql',
    title: 'Find Each User\'s Second Purchase Date',
    subtitle: 'SQL · Window Functions · ROW_NUMBER · CTEs',
    track: 'sql',
    difficulty: 'senior',
    isFree: false,
    tags: ['ROW_NUMBER', 'window functions', 'e-commerce', 'CTEs', 'self-join'],

    scenario: {
      company: 'Crestline Home',
      context: 'You\'re in a product analytics interview at Crestline Home, an e-commerce company. The interviewer says: "We want to understand how quickly users come back after their first purchase — that gap is a strong signal of product-market fit in our category." You have an orders table with one row per order. Your goal is to find the second purchase date for each user and compute the number of days between their first and second purchase.',
      schema: [
        { table: 'orders', description: 'One row per order placed on the platform', columns: ['order_id', 'user_id', 'created_at', 'order_total'] },
        { table: '—', description: 'created_at is a TIMESTAMP. A single user can have multiple rows (one per order).', columns: [] },
        { table: '—', description: 'Only include users who have placed at least 2 orders. Users with exactly 1 order should be excluded from the result.', columns: [] },
      ],
      task: 'Return one row per user showing: user_id, first_purchase_date, second_purchase_date, and days_to_second_purchase. Only include users with at least 2 orders.',
    },

    hints: [
      'Use ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) to rank each user\'s orders chronologically — rn=1 is first purchase, rn=2 is second',
      'Compute this in a CTE, then filter for rn IN (1, 2) to keep only the first two orders per user',
      'Use a second CTE or a CASE-based pivot to get first and second purchase on the same row per user — MAX(CASE WHEN rn=1 THEN ...) is a clean pattern',
      'Use ROW_NUMBER not RANK — if two orders share the exact same timestamp, RANK would assign both rn=1 and skip rn=2, which would break the filter logic',
    ],

    partialCode: 'WITH ranked_orders AS (\n  -- Rank each user\'s orders chronologically\n  SELECT\n    order_id,\n    user_id,\n    created_at,\n    -- TODO: assign a row number per user ordered by created_at ascending\n    ROW_NUMBER() OVER (___) AS rn\n  FROM orders\n),\n\nfirst_two AS (\n  -- Keep only the first and second order per user\n  SELECT\n    user_id,\n    created_at,\n    rn\n  FROM ranked_orders\n  -- TODO: filter to only rn = 1 or rn = 2\n  WHERE ___\n),\n\npivoted AS (\n  -- Pivot to get first and second purchase on the same row\n  SELECT\n    user_id,\n    -- TODO: use MAX(CASE WHEN ...) to get first_purchase_date\n    MAX(CASE WHEN rn = 1 THEN created_at END) AS first_purchase_date,\n    -- TODO: use MAX(CASE WHEN ...) to get second_purchase_date\n    ___ AS second_purchase_date\n  FROM first_two\n  GROUP BY user_id\n)\n\nSELECT\n  user_id,\n  first_purchase_date,\n  second_purchase_date,\n  -- TODO: compute days_to_second_purchase (cast or use DATE_DIFF depending on dialect)\n  ___ AS days_to_second_purchase\nFROM pivoted\n-- TODO: exclude users who never had a second purchase\nWHERE ___\nORDER BY days_to_second_purchase ASC;',

    modelAnswer: 'WITH ranked_orders AS (\n  -- Assign a sequential rank to each order per user, oldest first\n  -- ROW_NUMBER (not RANK) ensures ties at the same timestamp get distinct ranks\n  SELECT\n    order_id,\n    user_id,\n    created_at,\n    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) AS rn\n  FROM orders\n),\n\nfirst_two AS (\n  -- Retain only each user\'s 1st and 2nd order rows\n  SELECT\n    user_id,\n    created_at,\n    rn\n  FROM ranked_orders\n  WHERE rn IN (1, 2)\n),\n\npivoted AS (\n  -- Pivot: bring first and second purchase onto one row per user\n  -- MAX() with CASE is the standard SQL pivot idiom — only one row per rn value\n  -- will be non-NULL, so MAX() safely extracts it\n  SELECT\n    user_id,\n    MAX(CASE WHEN rn = 1 THEN created_at END) AS first_purchase_date,\n    MAX(CASE WHEN rn = 2 THEN created_at END) AS second_purchase_date\n  FROM first_two\n  GROUP BY user_id\n)\n\nSELECT\n  user_id,\n  DATE(first_purchase_date)  AS first_purchase_date,\n  DATE(second_purchase_date) AS second_purchase_date,\n  -- DATEDIFF or DATE_PART depending on SQL dialect; this version is ANSI-compatible\n  DATE_PART(\'day\', second_purchase_date - first_purchase_date)::INT\n    AS days_to_second_purchase\nFROM pivoted\nWHERE second_purchase_date IS NOT NULL  -- exclude users with only 1 order\nORDER BY days_to_second_purchase ASC;',

    keyInsights: [
      'ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) is the canonical approach: it assigns a per-user sequential rank that correctly handles any number of orders without needing self-joins or subquery correlated aggregations',
      'The MAX(CASE WHEN rn=1 THEN ...) pivot pattern is more readable and performant than a self-join on user_id — a self-join doubles the scan and requires a join predicate that can produce duplicates if timestamps are equal',
      'Using RANK() instead of ROW_NUMBER() is the classic mistake here: if two orders share the exact same created_at timestamp, RANK assigns rn=1 to both and skips rn=2, so the WHERE rn=2 filter returns nothing for that user',
      'In the interview, mention that you\'d also check for duplicate order_id values before running this — if the orders table has duplication bugs, ROW_NUMBER gives an arbitrary "second order" that may actually be the same logical purchase',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE12 — Rolling 3-Month Retention (SQL · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code12-rolling-3month-retention-sql',
    title: 'Compute Rolling 3-Month Consecutive Retention',
    subtitle: 'SQL · Rolling Retention · DATE_TRUNC · Window Functions',
    track: 'sql',
    difficulty: 'senior',
    isFree: false,
    tags: ['retention', 'DATE_TRUNC', 'rolling window', 'CTEs', 'growth analytics'],

    scenario: {
      company: 'Spark',
      context: 'You\'re interviewing at Spark, a social app with 12M daily active users. The interviewer says: "Our VP of Growth wants a metric that catches users who are genuinely habitual — not just people who spiked in one month. She wants to see how many users were active in three consecutive months." You need to write a query showing, for each month in 2024, the count of users active in that month AND each of the two prior months — a rolling 3-month consecutive retention count.',
      schema: [
        { table: 'user_activity', description: 'One row per user per day they performed any action in the app', columns: ['user_id', 'activity_date', 'activity_type'] },
        { table: 'users', description: 'One row per registered user', columns: ['user_id', 'signup_date', 'country'] },
        { table: '—', description: 'activity_date is a DATE column. There can be multiple rows per user per day (different activity_type values).', columns: [] },
      ],
      task: 'For each month in 2024 (starting from March, since you need 2 prior months), return the month and the count of distinct users who were active in that month, the prior month, AND the month before that — all three consecutive months.',
    },

    hints: [
      'Use DATE_TRUNC(\'month\', activity_date) to collapse daily activity into monthly buckets, then DISTINCT on user_id + month to get one row per user per active month',
      'Self-join the monthly active users table three times (or use a LAG-based approach) to enforce that the same user appears in month M, month M-1, and month M-2',
      'The self-join approach is most readable: alias the monthly CTE as m0, m1, m2; join on user_id with month conditions m1.month = m0.month - interval \'1 month\' etc.',
      'A common mistake is using BETWEEN on the activity date — that checks activity within a range, not activity in all 3 individual months. A user active only in January and March would pass a BETWEEN check but should not count as 3-month consecutive.',
    ],

    partialCode: 'WITH monthly_active AS (\n  -- Collapse to one row per user per calendar month they were active\n  -- Use DISTINCT to de-duplicate multiple activity events in the same month\n  SELECT DISTINCT\n    user_id,\n    -- TODO: truncate activity_date to month granularity\n    DATE_TRUNC(\'month\', activity_date) AS activity_month\n  FROM user_activity\n  WHERE activity_date >= \'2024-01-01\'\n    AND activity_date <  \'2025-01-01\'\n),\n\nthree_month_active AS (\n  -- For each month M, find users active in M, M-1, and M-2\n  -- Self-join the CTE three times on user_id with offset month conditions\n  SELECT\n    m0.activity_month AS month,\n    m0.user_id\n  FROM monthly_active m0\n  -- TODO: join monthly_active m1 on same user_id, one month earlier\n  JOIN monthly_active m1\n    ON m1.user_id = m0.user_id\n    AND m1.activity_month = ___   -- m0\'s month minus 1 month\n  -- TODO: join monthly_active m2 on same user_id, two months earlier\n  JOIN monthly_active m2\n    ON m2.user_id = m0.user_id\n    AND m2.activity_month = ___   -- m0\'s month minus 2 months\n)\n\nSELECT\n  month,\n  -- TODO: count distinct users who appear in all three months\n  COUNT(DISTINCT user_id) AS consecutive_3month_users\nFROM three_month_active\n-- Limit to months starting from March 2024 (first month with 2 prior months available)\nWHERE month >= \'2024-03-01\'\nGROUP BY 1\nORDER BY 1;',

    modelAnswer: 'WITH monthly_active AS (\n  -- One row per user per calendar month they were active\n  -- DISTINCT collapses multiple events on the same day/month to a single presence signal\n  SELECT DISTINCT\n    user_id,\n    DATE_TRUNC(\'month\', activity_date) AS activity_month\n  FROM user_activity\n  WHERE activity_date >= \'2024-01-01\'\n    AND activity_date <  \'2025-01-01\'\n),\n\nthree_month_active AS (\n  -- Enforce consecutive 3-month presence via self-joins\n  -- m0 = target month, m1 = one month prior, m2 = two months prior\n  -- A user must have a row in ALL THREE months to appear in the result\n  SELECT\n    m0.activity_month AS month,\n    m0.user_id\n  FROM monthly_active m0\n  JOIN monthly_active m1\n    ON  m1.user_id       = m0.user_id\n    AND m1.activity_month = m0.activity_month - INTERVAL \'1 month\'\n  JOIN monthly_active m2\n    ON  m2.user_id       = m0.user_id\n    AND m2.activity_month = m0.activity_month - INTERVAL \'2 months\'\n)\n\nSELECT\n  TO_CHAR(month, \'YYYY-MM\')             AS month,\n  COUNT(DISTINCT user_id)               AS consecutive_3month_users\nFROM three_month_active\nWHERE month >= \'2024-03-01\'  -- March is the first month with 2 full prior months in 2024\nGROUP BY 1\nORDER BY 1;',

    keyInsights: [
      'The self-join approach (m0, m1, m2 all referencing the same monthly_active CTE) is more explicit and less error-prone than using LAG() — it directly encodes "user must exist in month M AND M-1 AND M-2" as three independent join conditions',
      'DATE_TRUNC(\'month\', activity_date) collapses the daily grain to monthly, enabling the month arithmetic (- INTERVAL \'1 month\'). Operating on the raw date column with BETWEEN would check presence in a date range, not presence in all three individual months',
      'The critical mistake is using BETWEEN activity_date AND activity_date - 90: this would include a user active in January and March but not February — a "zombie" user who appears retained but actually lapsed. The self-join enforces each month independently.',
      'In the interview, distinguish this from cohort retention: rolling 3-month retention asks "who is habitually active right now?" whereas cohort retention asks "of users who joined in month X, how many are still around in month X+N?" — different questions, different business uses',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE13 — Longest Consecutive Login Streak (SQL · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code13-longest-login-streak-sql',
    title: 'Find Each User\'s Longest Login Streak',
    subtitle: 'SQL · Gaps and Islands · ROW_NUMBER · Date Arithmetic',
    track: 'sql',
    difficulty: 'senior',
    isFree: false,
    tags: ['gaps and islands', 'ROW_NUMBER', 'consecutive dates', 'CTEs', 'window functions'],

    scenario: {
      company: 'Prism',
      context: 'You\'re interviewing at Prism, a content platform. The interviewer says: "We want to reward power users — specifically, users with the longest streaks of consecutive daily logins. Can you write a query that finds each user\'s longest streak?" The logins table has already been de-duplicated: there is at most one row per user per day. You need to find the length of each user\'s longest consecutive daily login streak, along with the start and end dates of that streak.',
      schema: [
        { table: 'logins', description: 'One row per user per day they logged in. Already de-duplicated — no duplicate (user_id, login_date) rows.', columns: ['user_id', 'login_date'] },
        { table: '—', description: 'login_date is a DATE column. Consecutive means login_date and login_date + 1 are both present — no gaps.', columns: [] },
      ],
      task: 'Return one row per user showing: user_id, longest_streak (number of days), streak_start (DATE), streak_end (DATE). If a user has multiple streaks of equal maximum length, return the earliest one.',
    },

    hints: [
      'The classic "gaps and islands" trick: ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) gives a sequential integer rn. Then login_date - rn gives the same date value for all consecutive dates in a streak — that value is the "island key".',
      'Walk through an example: logins on days 1,2,3,5,6 get rn=1,2,3,4,5. Day-rn = 0,0,0,1,1. Days 1-3 share island key 0; days 5-6 share island key 1. Each unique (user_id, island_key) pair is one streak.',
      'Group by (user_id, island_key) to get streak_start = MIN(login_date), streak_end = MAX(login_date), streak_length = COUNT(*)',
      'After computing all streaks, use RANK() OVER (PARTITION BY user_id ORDER BY streak_length DESC, streak_start ASC) to pick the longest (earliest if tied) streak per user',
    ],

    partialCode: 'WITH numbered_logins AS (\n  -- Assign a sequential row number per user, ordered by login date\n  SELECT\n    user_id,\n    login_date,\n    -- TODO: ROW_NUMBER() partitioned by user_id, ordered by login_date\n    ROW_NUMBER() OVER (___) AS rn\n  FROM logins\n),\n\nislands AS (\n  -- The gaps-and-islands trick:\n  -- login_date - rn yields the same "island key" for all consecutive dates\n  -- because consecutive dates increment login_date by 1 AND rn by 1 simultaneously\n  SELECT\n    user_id,\n    login_date,\n    -- TODO: compute island_key = login_date - rn (use INTERVAL or integer cast depending on dialect)\n    (login_date - rn * INTERVAL \'1 day\')::DATE AS island_key\n  FROM numbered_logins\n),\n\nstreaks AS (\n  -- Aggregate each contiguous island into a streak with start, end, and length\n  SELECT\n    user_id,\n    island_key,\n    MIN(login_date)  AS streak_start,\n    MAX(login_date)  AS streak_end,\n    -- TODO: count the number of days in this streak\n    COUNT(*)         AS streak_length\n  FROM islands\n  GROUP BY user_id, island_key\n),\n\nranked_streaks AS (\n  -- Rank streaks per user: longest first, earliest start as tiebreaker\n  SELECT\n    user_id,\n    streak_start,\n    streak_end,\n    streak_length,\n    -- TODO: RANK() to pick the longest streak per user\n    RANK() OVER (PARTITION BY user_id ORDER BY ___ DESC, ___ ASC) AS rnk\n  FROM streaks\n)\n\nSELECT\n  user_id,\n  streak_length   AS longest_streak,\n  streak_start,\n  streak_end\nFROM ranked_streaks\nWHERE rnk = 1\nORDER BY longest_streak DESC, user_id;',

    modelAnswer: 'WITH numbered_logins AS (\n  -- Sequential row number per user ordered by login date\n  -- This is the setup for the gaps-and-islands date subtraction trick\n  SELECT\n    user_id,\n    login_date,\n    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date ASC) AS rn\n  FROM logins\n),\n\nislands AS (\n  -- Key insight: for consecutive dates, login_date and rn both increase by 1 each row,\n  -- so (login_date - rn) stays constant within a streak — it is the "island key".\n  -- Example: logins on Jan 1,2,3 get rn=1,2,3. Jan1-1=Dec31, Jan2-2=Dec31, Jan3-3=Dec31.\n  -- Same island key. A gap on Jan 4 (rn=4 next time user appears on Jan 5) gives Jan5-4=Jan1 (different key).\n  SELECT\n    user_id,\n    login_date,\n    (login_date - (rn - 1) * INTERVAL \'1 day\')::DATE AS island_key\n    -- Subtract (rn-1) to anchor the key to the streak\'s first date — a cosmetic choice; rn works equally well\n  FROM numbered_logins\n),\n\nstreaks AS (\n  -- Aggregate each island: min date = start, max date = end, count = streak length\n  SELECT\n    user_id,\n    MIN(login_date)  AS streak_start,\n    MAX(login_date)  AS streak_end,\n    COUNT(*)         AS streak_length\n  FROM islands\n  GROUP BY user_id, island_key\n),\n\nranked_streaks AS (\n  -- Pick the longest streak per user; use streak_start ASC as tiebreaker for ties\n  SELECT\n    user_id,\n    streak_start,\n    streak_end,\n    streak_length,\n    RANK() OVER (\n      PARTITION BY user_id\n      ORDER BY streak_length DESC, streak_start ASC\n    ) AS rnk\n  FROM streaks\n)\n\nSELECT\n  user_id,\n  streak_length  AS longest_streak,\n  streak_start,\n  streak_end\nFROM ranked_streaks\nWHERE rnk = 1\nORDER BY longest_streak DESC, user_id;',

    keyInsights: [
      'The date minus row_number trick works because consecutive calendar dates and sequential row numbers both increase by exactly 1 per step — their difference is constant within a streak and changes at every gap. This is the expected elegant solution; any other approach is significantly more complex.',
      'Grouping by (user_id, island_key) with MIN/MAX/COUNT collapses each streak island into a single summary row in one aggregation step — no recursion, no self-join, no looping. The entire gaps-and-islands problem reduces to a two-step CTE.',
      'Using LAG() to detect breaks (WHERE login_date != LAG(login_date) + 1) finds gap boundaries but does not directly give streak lengths — you then need a cumulative sum to assign group IDs, which is more code and harder to explain clearly in an interview.',
      'Walk through the arithmetic explicitly in the interview: "If I log in Monday, Tuesday, Wednesday — row numbers 1, 2, 3 — then Monday minus 1 day, Tuesday minus 2 days, Wednesday minus 3 days all equal the same date. That common date is my streak identifier." Interviewers want to see that you understand why it works, not just that you know the trick.',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE14 — N-day Retention Cohort Table (SQL · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code14-nday-retention-cohort-sql',
    title: 'Build a Day-1 / Day-7 / Day-30 Retention Cohort Table',
    subtitle: 'SQL · Cohort Retention · DATE_TRUNC · LEFT JOIN · Pivoting',
    track: 'sql',
    difficulty: 'senior',
    isFree: false,
    tags: ['cohort analysis', 'retention', 'LEFT JOIN', 'DATE_TRUNC', 'fintech'],

    scenario: {
      company: 'Volta',
      context: 'You\'re interviewing at Volta, a fintech app. The interviewer says: "Our growth team tracks Day 1, Day 7, and Day 30 retention as key health metrics. Can you write a query that builds the full retention table broken out by weekly signup cohort for Q1 2024?" Each cell in the table should show the percentage of users from that signup week who had a session on exactly Day N after signup — not within N days, but on that specific day.',
      schema: [
        { table: 'users', description: 'One row per registered user', columns: ['user_id', 'signup_date'] },
        { table: 'sessions', description: 'One row per app session', columns: ['user_id', 'session_date'] },
        { table: '—', description: 'signup_date and session_date are DATE columns. Q1 2024 = Jan 1 through Mar 31, 2024.', columns: [] },
        { table: '—', description: 'Day 1 = signup_date + 1, Day 7 = signup_date + 7, Day 30 = signup_date + 30. "Exactly on that day" — not within a window.', columns: [] },
      ],
      task: 'Return one row per weekly signup cohort (signup week, cohort_size, day_1_retention_pct, day_7_retention_pct, day_30_retention_pct). Only include Q1 2024 cohorts.',
    },

    hints: [
      'Use DATE_TRUNC(\'week\', signup_date) to bucket users into weekly cohorts. Cohort size = COUNT(DISTINCT user_id) per cohort.',
      'For each retention day, LEFT JOIN the sessions table filtered to exactly session_date = signup_date + N (use INTERVAL or integer addition depending on dialect).',
      'LEFT JOIN (not INNER JOIN) is essential — users who did not return on Day N should count as 0 in the denominator, not be excluded from the cohort entirely.',
      'Divide retained users by cohort size using NULLIF to avoid division by zero: ROUND(100.0 * COUNT(DISTINCT s1.user_id) / NULLIF(COUNT(DISTINCT u.user_id), 0), 1).',
    ],

    partialCode: 'WITH cohorts AS (\n  -- Assign each user to their weekly signup cohort\n  -- Cohort key = Monday of their signup week\n  SELECT\n    user_id,\n    signup_date,\n    -- TODO: truncate signup_date to the week level\n    DATE_TRUNC(\'week\', signup_date)::DATE AS signup_week\n  FROM users\n  WHERE signup_date >= \'2024-01-01\'\n    AND signup_date <  \'2024-04-01\'  -- Q1 2024 only\n)\n\nSELECT\n  c.signup_week,\n  COUNT(DISTINCT c.user_id)                                           AS cohort_size,\n\n  -- Day 1 retention: users who had a session exactly on signup_date + 1\n  ROUND(\n    100.0 * COUNT(DISTINCT s1.user_id)\n      / NULLIF(COUNT(DISTINCT c.user_id), 0),\n    1\n  )                                                                   AS day_1_retention_pct,\n\n  -- TODO: Day 7 retention (same pattern, session_date = signup_date + 7)\n  ROUND(\n    100.0 * COUNT(DISTINCT ___)\n      / NULLIF(COUNT(DISTINCT c.user_id), 0),\n    1\n  )                                                                   AS day_7_retention_pct,\n\n  -- TODO: Day 30 retention (session_date = signup_date + 30)\n  ___                                                                 AS day_30_retention_pct\n\nFROM cohorts c\n\n-- LEFT JOIN for Day 1: only match sessions on exactly signup_date + 1\nLEFT JOIN sessions s1\n  ON s1.user_id      = c.user_id\n  -- TODO: add the date condition for Day 1\n  AND s1.session_date = ___\n\n-- TODO: LEFT JOIN sessions s7 for Day 7 retention\n___\n\n-- TODO: LEFT JOIN sessions s30 for Day 30 retention\n___\n\nGROUP BY 1\nORDER BY 1;',

    modelAnswer: 'WITH cohorts AS (\n  -- Assign each Q1 2024 user to their Monday-anchored weekly signup cohort\n  SELECT\n    user_id,\n    signup_date,\n    DATE_TRUNC(\'week\', signup_date)::DATE AS signup_week\n  FROM users\n  WHERE signup_date >= \'2024-01-01\'\n    AND signup_date <  \'2024-04-01\'\n)\n\nSELECT\n  c.signup_week,\n  COUNT(DISTINCT c.user_id)                                           AS cohort_size,\n\n  -- Day 1 retention: % of cohort with a session on EXACTLY signup_date + 1\n  -- LEFT JOIN ensures users with no Day-1 session are still in the denominator\n  ROUND(\n    100.0 * COUNT(DISTINCT s1.user_id)\n           / NULLIF(COUNT(DISTINCT c.user_id), 0),\n    1\n  )                                                                   AS day_1_retention_pct,\n\n  -- Day 7 retention: % of cohort with a session on EXACTLY signup_date + 7\n  ROUND(\n    100.0 * COUNT(DISTINCT s7.user_id)\n           / NULLIF(COUNT(DISTINCT c.user_id), 0),\n    1\n  )                                                                   AS day_7_retention_pct,\n\n  -- Day 30 retention: % of cohort with a session on EXACTLY signup_date + 30\n  -- Note: recent cohorts may not have reached Day 30 yet — their cell will show 0.0\n  ROUND(\n    100.0 * COUNT(DISTINCT s30.user_id)\n           / NULLIF(COUNT(DISTINCT c.user_id), 0),\n    1\n  )                                                                   AS day_30_retention_pct\n\nFROM cohorts c\n\n-- Day 1: LEFT JOIN filters to exactly one day after signup\nLEFT JOIN sessions s1\n  ON  s1.user_id      = c.user_id\n  AND s1.session_date = c.signup_date + INTERVAL \'1 day\'\n\n-- Day 7: LEFT JOIN filters to exactly seven days after signup\nLEFT JOIN sessions s7\n  ON  s7.user_id      = c.user_id\n  AND s7.session_date = c.signup_date + INTERVAL \'7 days\'\n\n-- Day 30: LEFT JOIN filters to exactly thirty days after signup\nLEFT JOIN sessions s30\n  ON  s30.user_id      = c.user_id\n  AND s30.session_date = c.signup_date + INTERVAL \'30 days\'\n\nGROUP BY 1\nORDER BY 1;',

    keyInsights: [
      'Three separate LEFT JOINs on the sessions table — each filtered to a specific day offset — is the cleanest way to compute multi-day retention in a single pass. Each join is independent, so session_date = signup_date + N is an exact point-in-time filter, not a window.',
      'LEFT JOIN is mandatory, not optional: with an INNER JOIN, users who didn\'t return on Day N would be excluded from the cohort count entirely, inflating the retention rate. LEFT JOIN preserves all cohort members in the denominator regardless of whether they matched the session filter.',
      'The critical distinction is "on exactly Day N" vs "within N days of signup." BETWEEN signup_date AND signup_date + N measures cumulative retention (did they ever return?) — a different, weaker metric. Exact Day N is a stricter habituation signal. Always clarify this with the interviewer.',
      'Cohort dilution is real: cohorts from late March 2024 haven\'t had 30 days to reach Day 30 by the time you run the query, so their day_30_retention_pct will be 0.0, not missing data — mention this in the interview so the reviewer doesn\'t misinterpret it as poor retention',
    ],
  },

  // ─────────────────────────────────────────────
  // C15 — Users Who Did X But Not Y (SQL · Interview · Analyst)
  // ─────────────────────────────────────────────
  {
    id: 'code15-users-x-not-y-sql',
    title: 'Users Who Watched But Never Shared',
    subtitle: 'SQL · Anti-Join · Set Difference · Interview Classic',
    track: 'sql',
    difficulty: 'analyst',
    isFree: false,
    tags: ['anti-join', 'set difference', 'NOT EXISTS', 'LEFT JOIN', 'interview-sql'],

    scenario: {
      company: 'Prism',
      context: 'You\'re in a Prism data interview. The interviewer says: "We want to identify users who are consuming content but not sharing it — a signal we use to prioritize share-nudge experiments. Write a query that returns all users who watched at least 3 videos but never shared any video in the last 30 days."',
      schema: [
        { table: 'events', description: 'One row per user event', columns: ['user_id', 'event_type', 'event_ts', 'video_id'] },
        { table: '—', description: 'event_type values: "video_watched" | "video_shared"', columns: [] },
      ],
      task: 'Return user_ids who had ≥ 3 video_watched events AND zero video_shared events in the last 30 days. Show two approaches: LEFT JOIN anti-join and NOT EXISTS.',
    },

    hints: [
      'The anti-join pattern: LEFT JOIN the events table filtered to video_shared, then WHERE that join produced NULL — meaning no share event matched.',
      'Count only video_watched events in HAVING — use a conditional COUNT or filter in a subquery before joining.',
      'NOT EXISTS is an alternative: correlated subquery that checks whether any video_shared event exists for the user in the window.',
      'Date filter: event_ts >= CURRENT_DATE - INTERVAL \'30 days\' (or equivalent). Apply this filter consistently for both watched and shared event counts.',
    ],

    partialCode: '-- Schema reminder:\n-- events(user_id, event_type, event_ts, video_id)\n-- event_type: \'video_watched\' | \'video_shared\'\n\n-- TODO: Return user_ids with >= 3 video_watched events\n-- and zero video_shared events in the last 30 days.\n-- Show the LEFT JOIN anti-join approach.\n\nSELECT  w.user_id\nFROM    /* your query here */\n',

    modelAnswer: '-- ─────────────────────────────────────────────────────────\n-- APPROACH 1: LEFT JOIN anti-join (most common, generally efficient)\n-- ─────────────────────────────────────────────────────────\n\nSELECT  w.user_id\nFROM (\n  -- Step 1: aggregate watched events per user in the last 30 days\n  SELECT  user_id,\n          COUNT(*) AS watch_count\n  FROM    events\n  WHERE   event_type = \'video_watched\'\n    AND   event_ts  >= CURRENT_DATE - INTERVAL \'30 days\'\n  GROUP BY user_id\n  HAVING  COUNT(*) >= 3          -- keep only users with >= 3 watches\n) w\n\n-- Step 2: anti-join — LEFT JOIN to share events, keep rows where join is NULL\nLEFT JOIN (\n  SELECT DISTINCT user_id\n  FROM   events\n  WHERE  event_type = \'video_shared\'\n    AND  event_ts  >= CURRENT_DATE - INTERVAL \'30 days\'\n) s ON s.user_id = w.user_id\n\nWHERE s.user_id IS NULL;         -- NULL means no share event matched = never shared\n\n\n-- ─────────────────────────────────────────────────────────\n-- APPROACH 2: NOT EXISTS (correlated subquery — same result, different style)\n-- ─────────────────────────────────────────────────────────\n\nSELECT  user_id\nFROM    events\nWHERE   event_type = \'video_watched\'\n  AND   event_ts  >= CURRENT_DATE - INTERVAL \'30 days\'\nGROUP BY user_id\nHAVING  COUNT(*) >= 3\n  AND   NOT EXISTS (\n          -- correlated subquery: is there ANY share from this user in the window?\n          SELECT 1\n          FROM   events e2\n          WHERE  e2.user_id   = events.user_id\n            AND  e2.event_type = \'video_shared\'\n            AND  e2.event_ts  >= CURRENT_DATE - INTERVAL \'30 days\'\n        );\n\n\n-- ─────────────────────────────────────────────────────────\n-- WHY NOT NOT IN?\n-- NOT IN (SELECT user_id FROM ... WHERE event_type = \'video_shared\')\n-- Pitfall: if the subquery returns ANY NULL, NOT IN returns no rows.\n-- Safer to use LEFT JOIN IS NULL or NOT EXISTS.\n-- ─────────────────────────────────────────────────────────',

    keyInsights: [
      'The anti-join pattern (LEFT JOIN + IS NULL on the right side) is the most readable and typically most performant way to find "rows in A with no match in B." It is the preferred form in most query optimizers.',
      'NOT EXISTS is equivalent and sometimes preferred when the correlated subquery is simple — the optimizer often executes it identically to a LEFT JOIN anti-join in modern engines (Postgres, BigQuery, Snowflake).',
      'Avoid NOT IN when the subquery could return NULLs: SQL\'s three-value logic means "x NOT IN (1, 2, NULL)" evaluates to UNKNOWN, silently returning zero rows. This is one of the most common silent bugs in SQL.',
      'Apply the date filter consistently to both the watched and shared events. A common mistake is filtering the watched events but not the shared events, which would exclude users who shared before the 30-day window — they should count as "never shared in the window."',
    ],
  },

  // ─────────────────────────────────────────────
  // C16 — Rolling 7-Day Active Users (SQL · Interview · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code16-rolling-7day-dau-sql',
    title: 'Rolling 7-Day Active Users by Date',
    subtitle: 'SQL · Rolling Window · Date Spine · R7DAU · Interview Classic',
    track: 'sql',
    difficulty: 'senior',
    isFree: false,
    tags: ['rolling window', 'date spine', 'R7DAU', 'self-join', 'interview-sql'],

    scenario: {
      company: 'Spark',
      context: 'You\'re interviewing at Spark. The PM asks: "Can you write a query that shows me rolling 7-day active users (R7DAU) for every date in the last 30 days? R7DAU on a given date = the count of distinct users who were active on any of the 7 days ending on that date." This is a standard product health metric.',
      schema: [
        { table: 'user_activity', description: 'One row per user per active date (deduplicated — at most one row per user_id + activity_date)', columns: ['user_id', 'activity_date'] },
        { table: '—', description: 'activity_date is a DATE column. Assume today is the reference date.', columns: [] },
      ],
      task: 'Return one row per date for the last 30 days, with the count of distinct users active on any of the 7 days ending on (and including) that date. Explain why a window function with COUNT(DISTINCT) does not work here and what the correct approach is.',
    },

    hints: [
      'You need a date spine — a complete list of all dates in the last 30 days — so dates with zero activity still appear in the result.',
      'Self-join the activity table: for each spine date d, join activity rows where activity_date BETWEEN d - 6 AND d. Then COUNT(DISTINCT user_id).',
      'Window functions like SUM() OVER (... ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) work for additive metrics but COUNT(DISTINCT ...) is not supported inside window frames in most SQL engines.',
      'Generate the date spine with a recursive CTE, generate_series() (Postgres), or UNNEST(GENERATE_DATE_ARRAY()) (BigQuery).',
    ],

    partialCode: '-- Schema reminder:\n-- user_activity(user_id, activity_date DATE)\n\n-- TODO: Return one row per date for the last 30 days.\n-- Each row: date, rolling_7day_active_users\n-- (distinct users active on any of the 7 days ending on that date)\n',

    modelAnswer: '-- ─────────────────────────────────────────────────────────\n-- APPROACH 1: Date spine + self-join (works in all SQL dialects)\n-- ─────────────────────────────────────────────────────────\n\nWITH date_spine AS (\n  -- Generate every date in the last 30 days\n  -- Postgres / Redshift syntax:\n  SELECT CAST(generate_series AS DATE) AS spine_date\n  FROM   generate_series(\n           CURRENT_DATE - INTERVAL \'29 days\',\n           CURRENT_DATE,\n           INTERVAL \'1 day\'\n         )\n  -- BigQuery alternative:\n  -- SELECT date FROM UNNEST(GENERATE_DATE_ARRAY(DATE_SUB(CURRENT_DATE(), INTERVAL 29 DAY), CURRENT_DATE())) AS date\n)\n\nSELECT\n  d.spine_date                    AS date,\n  COUNT(DISTINCT a.user_id)       AS rolling_7day_active_users\nFROM   date_spine d\n\n-- For each spine date, include all activity in the 7-day window ending on that date\nLEFT JOIN user_activity a\n  ON  a.activity_date BETWEEN d.spine_date - INTERVAL \'6 days\'\n                          AND d.spine_date\n\nGROUP BY d.spine_date\nORDER BY d.spine_date;\n\n\n-- ─────────────────────────────────────────────────────────\n-- WHY WINDOW FUNCTIONS DON\'T WORK FOR COUNT(DISTINCT)\n-- ─────────────────────────────────────────────────────────\n-- This looks tempting but is NOT valid in most engines:\n--\n-- COUNT(DISTINCT user_id) OVER (\n--   ORDER BY activity_date\n--   ROWS BETWEEN 6 PRECEDING AND CURRENT ROW\n-- )\n--\n-- COUNT(DISTINCT) inside a window frame is not supported in\n-- Postgres, Snowflake, Redshift, or BigQuery (as of 2024).\n-- The self-join approach above is the correct solution.\n--\n-- If the table already has one row per user per date (deduplicated),\n-- COUNT(*) in a window frame would work for non-distinct counts —\n-- but the moment you need distinct users across an overlapping window,\n-- you need the self-join.\n-- ─────────────────────────────────────────────────────────',

    keyInsights: [
      'Rolling window aggregations over distinct users require a date spine + self-join, not a window function. COUNT(DISTINCT ...) is not supported inside window frames (ROWS BETWEEN N PRECEDING AND CURRENT ROW) in Postgres, Snowflake, Redshift, or BigQuery — this is a common interview trap.',
      'The date spine is essential: without it, dates with zero activity simply disappear from the result. A product health chart with missing dates is misleading. Always generate a complete date series and LEFT JOIN activity onto it.',
      'The self-join condition (activity_date BETWEEN spine_date - 6 AND spine_date) creates an expanding set of matched rows for each spine date. COUNT(DISTINCT user_id) on that set gives the correct rolling 7-day unique user count.',
      'In BigQuery, APPROX_COUNT_DISTINCT() is sometimes used with HyperLogLog sketch aggregation across sliding windows as a performance optimization at scale — but for interview purposes, the exact self-join answer is what the interviewer is looking for.',
    ],
  },

  // ─────────────────────────────────────────────
  // C17 — Top N Per Group / Ranking (SQL · Interview · Analyst)
  // ─────────────────────────────────────────────
  {
    id: 'code17-top-n-per-group-sql',
    title: 'Top 3 Sellers by GMV Per Category',
    subtitle: 'SQL · DENSE_RANK · Window Functions · Top-N Per Group · Interview Classic',
    track: 'sql',
    difficulty: 'analyst',
    isFree: false,
    tags: ['ranking', 'DENSE_RANK', 'window functions', 'CTE', 'top-N per group', 'interview-sql'],

    scenario: {
      company: 'Crafted',
      context: 'You\'re interviewing at Crafted. The interviewer says: "Our category managers want to see a leaderboard — for each product category, show me the top 3 sellers by total GMV in the last 90 days. Include their rank, total GMV, and handle ties correctly."',
      schema: [
        { table: 'orders', description: 'One row per completed order', columns: ['order_id', 'seller_id', 'category', 'gmv', 'order_date'] },
        { table: '—', description: 'gmv is a numeric column in USD. order_date is a DATE. Multiple orders can exist per seller per category.', columns: [] },
      ],
      task: 'Return seller_id, category, total_gmv, and rank within category for the top 3 sellers per category in the last 90 days. Use DENSE_RANK and explain when you would choose RANK vs DENSE_RANK vs ROW_NUMBER.',
    },

    hints: [
      'Step 1: aggregate orders to (seller_id, category, SUM(gmv)) for the last 90 days.',
      'Step 2: apply DENSE_RANK() OVER (PARTITION BY category ORDER BY total_gmv DESC) on the aggregated result — in a CTE.',
      'Step 3: filter the CTE WHERE rank <= 3.',
      'You cannot use WHERE on a window function in the same SELECT — wrap it in a CTE or subquery first.',
    ],

    partialCode: '-- Schema reminder:\n-- orders(order_id, seller_id, category, gmv, order_date)\n\n-- TODO: Return the top 3 sellers per category by total GMV\n-- in the last 90 days. Include rank. Handle ties with DENSE_RANK.\n',

    modelAnswer: '-- ─────────────────────────────────────────────────────────\n-- STEP 1: Aggregate GMV per seller per category (last 90 days)\n-- STEP 2: Rank within each category using DENSE_RANK\n-- STEP 3: Filter to top 3 ranks\n-- ─────────────────────────────────────────────────────────\n\nWITH seller_gmv AS (\n  -- Aggregate total GMV per seller per category in the last 90 days\n  SELECT\n    seller_id,\n    category,\n    SUM(gmv)  AS total_gmv\n  FROM   orders\n  WHERE  order_date >= CURRENT_DATE - INTERVAL \'90 days\'\n  GROUP BY seller_id, category\n),\n\nranked_sellers AS (\n  -- Rank sellers within each category by total GMV (highest = rank 1)\n  -- DENSE_RANK: ties share the same rank, no ranks are skipped\n  -- e.g., two sellers tied for 1st both get rank 1, next seller gets rank 2\n  SELECT\n    seller_id,\n    category,\n    total_gmv,\n    DENSE_RANK() OVER (\n      PARTITION BY category\n      ORDER BY total_gmv DESC\n    ) AS gmv_rank\n  FROM seller_gmv\n)\n\n-- STEP 3: Keep only ranks 1, 2, 3 per category\n-- NOTE: Cannot apply WHERE on window function in the same query level —\n-- must wrap in CTE or subquery first\nSELECT\n  category,\n  gmv_rank,\n  seller_id,\n  total_gmv\nFROM   ranked_sellers\nWHERE  gmv_rank <= 3\nORDER BY category, gmv_rank;\n\n\n-- ─────────────────────────────────────────────────────────\n-- RANK vs DENSE_RANK vs ROW_NUMBER — when to use each:\n-- ─────────────────────────────────────────────────────────\n--\n-- RANK():        Tied rows get the same rank. Next rank SKIPS.\n--                Sellers with $5k, $5k, $3k → ranks 1, 1, 3\n--                Use when: "position in a leaderboard with gaps"\n--\n-- DENSE_RANK():  Tied rows get the same rank. Next rank does NOT skip.\n--                Sellers with $5k, $5k, $3k → ranks 1, 1, 2\n--                Use when: "top N per group" — preferred here, because\n--                WHERE rank <= 3 would exclude the $3k seller with RANK()\n--                if there are two tied at rank 1 (they\'d be 1,1,3 — rank 3 > 3 cutoff?\n--                Actually rank 3 = 3, it passes — but if THREE sellers tie at 1st,\n--                rank 4 is skipped and the 4th seller is invisible with WHERE rank <= 3)\n--\n-- ROW_NUMBER():  Unique rank for every row — ties broken arbitrarily.\n--                Sellers with $5k, $5k, $3k → ranks 1, 2, 3 (arbitrary for tie)\n--                Use when: deduplication, pagination, "pick exactly one row per group"\n-- ─────────────────────────────────────────────────────────',

    keyInsights: [
      'You cannot filter on a window function in the same SELECT level — this is the single most common SQL interview mistake with ranking queries. The window function must be computed in a CTE or subquery, then filtered in the outer query.',
      'DENSE_RANK is the right choice for top-N-per-group problems because it never skips ranks on ties. With RANK(), if three sellers tie for 1st, the 4th seller gets rank 4 — and WHERE rank <= 3 might include or exclude unexpected sellers depending on how many ties exist at the boundary.',
      'ROW_NUMBER is correct when you need exactly one row per group with no ties (e.g., deduplication: keep the most recent record per user). It assigns arbitrary but unique ranks, so two equal-GMV sellers would get different row numbers with no guarantee of which one comes first.',
      'Always aggregate first, then rank — do not try to nest SUM(gmv) inside the window function directly. A CTE per step (aggregate → rank → filter) is the clearest structure and easiest to debug in an interview setting.',
    ],
  },

  // ─────────────────────────────────────────────
  // C18 — Sessionization (SQL · Interview · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code18-sessionization-sql',
    title: 'Sessionize an Events Table',
    subtitle: 'SQL · LAG · Session Detection · Cumulative Sum · Interview Classic',
    track: 'sql',
    difficulty: 'senior',
    isFree: false,
    tags: ['sessionization', 'LAG', 'cumulative sum', 'window functions', 'interview-sql'],

    scenario: {
      company: 'Prism',
      context: 'You\'re in a senior data interview at Prism. The interviewer says: "We need to sessionize our events table. Define a session as a sequence of events from the same user where no gap between consecutive events exceeds 30 minutes. Write a query that (1) assigns a session_id to each event, and (2) counts distinct sessions per user per day."',
      schema: [
        { table: 'events', description: 'One row per user event', columns: ['user_id', 'event_ts', 'event_type'] },
        { table: '—', description: 'event_ts is a TIMESTAMP. Events are not deduplicated — a user can have many events per minute.', columns: [] },
      ],
      task: 'Write a SQL query that assigns a session_id to each event (events within 30 minutes of the previous event from the same user belong to the same session), then counts distinct sessions per user per day.',
    },

    hints: [
      'Step 1: Use LAG(event_ts) OVER (PARTITION BY user_id ORDER BY event_ts) to get the previous event\'s timestamp for the same user.',
      'Step 2: Flag session starts — a new session begins when the gap from the previous event exceeds 30 minutes (or when it\'s the user\'s first event).',
      'Step 3: SUM(is_new_session) OVER (PARTITION BY user_id ORDER BY event_ts) gives a monotonically increasing session counter per user — this is the session_id.',
      'Step 4: Group by user_id, DATE(event_ts), session_id and count distinct sessions per user per day.',
    ],

    partialCode: '-- Schema reminder:\n-- events(user_id, event_ts TIMESTAMP, event_type)\n\n-- TODO: Sessionize events. A new session starts when the gap\n-- between consecutive events from the same user exceeds 30 minutes.\n-- Return: user_id, event_date, sessions_that_day\n',

    modelAnswer: '-- ─────────────────────────────────────────────────────────\n-- SESSIONIZATION IN THREE CTE STEPS\n-- Pattern: LAG → gap flag → cumulative sum = session_id\n-- ─────────────────────────────────────────────────────────\n\nWITH events_with_prev AS (\n  -- STEP 1: For each event, get the timestamp of the previous event\n  -- from the same user, ordered by time\n  SELECT\n    user_id,\n    event_ts,\n    event_type,\n    LAG(event_ts) OVER (\n      PARTITION BY user_id\n      ORDER BY event_ts\n    ) AS prev_event_ts\n  FROM events\n),\n\nsession_flags AS (\n  -- STEP 2: Flag the start of a new session\n  -- A new session begins when:\n  --   (a) there is no previous event (first event for the user), OR\n  --   (b) the gap from the previous event exceeds 30 minutes\n  SELECT\n    user_id,\n    event_ts,\n    event_type,\n    CASE\n      WHEN prev_event_ts IS NULL THEN 1   -- first event ever for this user\n      WHEN event_ts - prev_event_ts > INTERVAL \'30 minutes\' THEN 1  -- gap > 30 min\n      ELSE 0\n    END AS is_new_session\n    -- Postgres/Redshift: event_ts - prev_event_ts gives an INTERVAL, compare directly\n    -- BigQuery: TIMESTAMP_DIFF(event_ts, prev_event_ts, MINUTE) > 30\n    -- Snowflake: DATEDIFF(\'minute\', prev_event_ts, event_ts) > 30\n  FROM events_with_prev\n),\n\nsessionized AS (\n  -- STEP 3: Cumulative sum of session-start flags = monotonically increasing\n  -- session counter per user. This is the session_id.\n  -- User\'s 1st session = 1, 2nd = 2, etc.\n  SELECT\n    user_id,\n    event_ts,\n    event_type,\n    is_new_session,\n    SUM(is_new_session) OVER (\n      PARTITION BY user_id\n      ORDER BY event_ts\n      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n    ) AS session_id   -- unique per user (not globally unique across users)\n  FROM session_flags\n)\n\n-- STEP 4: Count distinct sessions per user per day\n-- Each (user_id, session_id) pair is one session.\n-- We group by user + date + session_id to get one row per session,\n-- then count those rows per user per day.\nSELECT\n  user_id,\n  DATE(event_ts)          AS event_date,\n  COUNT(DISTINCT session_id) AS sessions_that_day\nFROM   sessionized\nGROUP BY user_id, DATE(event_ts)\nORDER BY user_id, event_date;\n\n\n-- ─────────────────────────────────────────────────────────\n-- NOTES FOR INTERVIEW DISCUSSION:\n-- ─────────────────────────────────────────────────────────\n-- 1. session_id is unique within a user, not globally.\n--    If you need a globally unique session_id, use:\n--    CONCAT(user_id, \'-\', session_id) or ROW_NUMBER() OVER () on sessionized.\n--\n-- 2. The cumulative SUM trick works because is_new_session is 0 or 1 —\n--    each new session increments the counter by 1 for all subsequent\n--    events until the next session boundary. No recursion needed.\n--\n-- 3. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is the default\n--    for SUM with ORDER BY in most engines, but writing it explicitly\n--    is clearer and avoids dialect-specific default behavior surprises.\n--\n-- 4. This does NOT require recursive CTEs or stored procedures —\n--    pure window functions handle it in O(n log n) sort time.\n-- ─────────────────────────────────────────────────────────',

    keyInsights: [
      'The sessionization pattern is three steps: LAG to get the previous event timestamp, a CASE statement to flag session starts (gap > threshold or first event), and a cumulative SUM of that flag as the session_id. Memorize this pattern — it appears in a majority of senior product analytics interviews.',
      'The cumulative sum trick works because the session-start flag is binary (0 or 1). Every time a new session begins, the running sum increments by 1, and all subsequent events in that session share the same counter value until the next increment.',
      'This approach does not require recursive CTEs, UDFs, or procedural logic — it is pure standard SQL that runs efficiently on columnar engines (BigQuery, Snowflake, Redshift). Point this out in the interview to signal you understand execution models.',
      'Session_id is user-scoped, not globally unique. If downstream queries need to join sessions across users, you must compose a globally unique key: CONCAT(user_id, \'-\', session_id) or assign a row number over the entire sessionized table partitioned by (user_id, session_id).',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE19 — Bayesian A/B Test Analysis (Python · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code19-bayesian-ab-python',
    title: 'Bayesian A/B Test Analysis',
    subtitle: 'Python · Beta Distribution · Posterior Sampling · Credible Intervals',
    track: 'python',
    difficulty: 'senior',
    isFree: false,
    tags: ['Bayesian', 'A/B testing', 'beta distribution', 'scipy', 'posterior', 'credible interval'],

    scenario: {
      company: 'Helix Health · Onboarding Experiment',
      context: 'Helix ran a 3-week A/B test on a new onboarding checklist feature. You have the conversion counts for both arms. The stats team wants a Bayesian analysis instead of a frequentist p-value — specifically: (1) the posterior distribution of the true conversion rate for each arm, (2) a 95% credible interval for the difference, and (3) the probability that treatment is better than control (P(θ_T > θ_C)).',
      schema: [
        { table: 'Python variables already defined:', description: '', columns: [] },
        { table: '—', description: 'n_control = 12400, conv_control = 1860  (15.0% conversion)', columns: [] },
        { table: '—', description: 'n_treatment = 12600, conv_treatment = 2079  (16.5% conversion)', columns: [] },
      ],
      task: 'Using a Beta-Binomial model with a uniform Beta(1,1) prior, compute the posterior Beta distributions for each arm, draw 100,000 samples to estimate P(treatment > control), and report the 95% credible interval on the lift.',
    },

    hints: [
      'With a Beta(1,1) prior and n observations with k conversions, the posterior is Beta(1 + k, 1 + n - k)',
      'scipy.stats.beta.rvs(a, b, size=N) draws N samples from a Beta(a,b) distribution',
      'P(treatment > control) = mean(samples_treatment > samples_control) over 100,000 draws',
      'Credible interval on the lift: take the 2.5th and 97.5th percentiles of (samples_treatment - samples_control)',
    ],

    partialCode: 'import numpy as np\nfrom scipy import stats\n\nnp.random.seed(42)\n\n# Given data\nn_control        = 12_400\nconv_control     = 1_860\nn_treatment      = 12_600\nconv_treatment   = 2_079\n\n# 1. Posterior parameters using Beta(1,1) prior\n# Posterior: Beta(1 + conversions, 1 + non-conversions)\nalpha_c = ___   # 1 + conv_control\nbeta_c  = ___   # 1 + (n_control - conv_control)\nalpha_t = ___\nbeta_t  = ___\n\nprint(f"Posterior Beta params — Control:   Beta({alpha_c}, {beta_c})")\nprint(f"Posterior Beta params — Treatment: Beta({alpha_t}, {beta_t})")\n\n# 2. Posterior means (the Bayesian point estimates)\npost_mean_c = ___   # alpha / (alpha + beta)\npost_mean_t = ___\nprint(f"\\nPosterior mean — Control:   {post_mean_c:.4f}")\nprint(f"Posterior mean — Treatment: {post_mean_t:.4f}")\n\n# 3. Sample from posteriors\nn_samples = 100_000\nsamples_c = ___   # draw n_samples from Beta(alpha_c, beta_c)\nsamples_t = ___   # draw n_samples from Beta(alpha_t, beta_t)\n\n# 4. P(treatment > control)\np_treatment_better = ___\nprint(f"\\nP(Treatment > Control): {p_treatment_better:.4f}")\n\n# 5. 95% Credible interval on the lift (treatment - control)\nlift_samples = samples_t - samples_c\nci_lower, ci_upper = ___\nprint(f"95% Credible Interval on lift: [{ci_lower:+.4f}, {ci_upper:+.4f}]")\nprint(f"Expected lift: {lift_samples.mean():+.4f}  ({lift_samples.mean()*100:+.2f}pp)")',

    modelAnswer: 'import numpy as np\nfrom scipy import stats\n\nnp.random.seed(42)\n\n# Given data\nn_control        = 12_400\nconv_control     = 1_860\nn_treatment      = 12_600\nconv_treatment   = 2_079\n\n# 1. Posterior parameters: Beta(1,1) prior + binomial likelihood → Beta posterior\n# Posterior: Beta(1 + conversions, 1 + non-conversions)\nalpha_c = 1 + conv_control\nbeta_c  = 1 + (n_control - conv_control)\nalpha_t = 1 + conv_treatment\nbeta_t  = 1 + (n_treatment - conv_treatment)\n\nprint(f"Posterior Beta params — Control:   Beta({alpha_c}, {beta_c})")\nprint(f"Posterior Beta params — Treatment: Beta({alpha_t}, {beta_t})")\n\n# 2. Posterior means (the MAP point estimates)\npost_mean_c = alpha_c / (alpha_c + beta_c)\npost_mean_t = alpha_t / (alpha_t + beta_t)\nprint(f"\\nPosterior mean — Control:   {post_mean_c:.4f}  ({post_mean_c:.2%})")\nprint(f"Posterior mean — Treatment: {post_mean_t:.4f}  ({post_mean_t:.2%})")\nprint(f"Expected lift (posterior means): {(post_mean_t - post_mean_c)*100:+.2f}pp")\n\n# 3. Draw 100,000 samples from each posterior\nn_samples = 100_000\nsamples_c = stats.beta.rvs(alpha_c, beta_c, size=n_samples)\nsamples_t = stats.beta.rvs(alpha_t, beta_t, size=n_samples)\n\n# 4. P(treatment > control) — fraction of samples where treatment rate > control rate\np_treatment_better = np.mean(samples_t > samples_c)\nprint(f"\\nP(Treatment > Control): {p_treatment_better:.4f}  ({p_treatment_better:.2%})")\n\n# 5. Credible interval on the lift\nlift_samples = samples_t - samples_c\nci_lower, ci_upper = np.percentile(lift_samples, [2.5, 97.5])\n\nprint(f"\\n95% Credible Interval on lift: [{ci_lower*100:+.2f}pp, {ci_upper*100:+.2f}pp]")\nprint(f"Expected lift: {lift_samples.mean()*100:+.2f}pp")\n\n# 6. Summary interpretation\nprint("\\n--- Interpretation ---")\nprint(f"There is a {p_treatment_better:.1%} probability that the treatment has a higher")\nprint(f"conversion rate than control. The 95% credible interval on the lift is")\nprint(f"[{ci_lower*100:+.2f}pp, {ci_upper*100:+.2f}pp] — we are 95% confident the")\nprint(f"true lift lies in this range given our prior and the observed data.")\n\n# 7. Sanity check: compare to frequentist result\nfrom scipy.stats import proportions_ztest\n_, p_freq = proportions_ztest(\n    count=[conv_treatment, conv_control],\n    nobs=[n_treatment, n_control],\n    alternative=\'two-sided\'\n)\nprint(f"\\nFrequentist p-value (two-sided z-test): {p_freq:.6f}")\nprint(f"(Bayesian P(T>C) ≈ 1 - frequentist one-sided p/2 when sample is large — consistent)")',

    keyInsights: [
      'The Beta-Binomial conjugate model is the simplest Bayesian A/B test. With a Beta(α,β) prior and n trials with k successes, the posterior is Beta(α+k, β+n-k) — closed form, no MCMC needed.',
      'P(treatment > control) via sampling is straightforward: draw N samples from each posterior and compute mean(samples_T > samples_C). With 100,000 samples, this estimate is stable to ±0.1% or better.',
      'A 95% Bayesian credible interval has a more intuitive interpretation than a frequentist CI: "there is a 95% probability the true lift is in this range (given the prior and data)" vs. the frequentist "95% of intervals constructed this way would contain the true parameter."',
      'With n ≈ 12,000 per arm and a Beta(1,1) uninformative prior, the prior has negligible impact — the posterior is dominated by the data. The Bayesian and frequentist conclusions will be nearly identical at this sample size.',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE20 — Cohort LTV Projection (Python · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code20-cohort-ltv-python',
    title: 'Cohort LTV Projection',
    subtitle: 'Python · Retention Curve · Exponential Decay · Discounted LTV',
    track: 'python',
    difficulty: 'senior',
    isFree: false,
    tags: ['LTV', 'cohort analysis', 'retention', 'exponential decay', 'pandas', 'numpy'],

    scenario: {
      company: 'Meridian SaaS · Growth Team',
      context: 'Meridian has 6 months of retention data for its January 2024 signup cohort. The growth team wants to project 12-month LTV. You\'ll fit an exponential decay curve to months 1-6 and extrapolate to month 12, then compute discounted LTV using a monthly discount rate (reflecting cost of capital) and ARPU.',
      schema: [
        { table: 'Python variables already defined:', description: '', columns: [] },
        { table: '—', description: 'retention = [1.0, 0.72, 0.58, 0.49, 0.43, 0.38, 0.35]  (M0 through M6)', columns: [] },
        { table: '—', description: 'arpu = 45.0  (average revenue per user per month, $)', columns: [] },
        { table: '—', description: 'monthly_discount_rate = 0.01  (1% per month ≈ 12.7% annually)', columns: [] },
      ],
      task: 'Fit an exponential decay model (R(t) = a * exp(-b*t)) to the observed retention data, project retention for months 7-12, and compute 12-month discounted LTV as sum of (ARPU × R(t) / (1 + discount_rate)^t) for t=0 to 12.',
    },

    hints: [
      'Use scipy.optimize.curve_fit to fit an exponential model. Define a function: def exp_decay(t, a, b): return a * np.exp(-b * t)',
      'Initial guess for parameters: a=1.0 (M0 retention starts at 100%), b=0.1 (a decay constant around 10%/month)',
      'Once you have fitted a, b: project months 7-12 as exp_decay(t, a, b) for t in range(7, 13)',
      'LTV = sum over all months of ARPU × retention(t) / (1 + monthly_discount_rate)^t',
    ],

    partialCode: 'import numpy as np\nfrom scipy.optimize import curve_fit\nimport matplotlib.pyplot as plt\n\n# Observed data: M0 through M6\nmonths_observed = np.array([0, 1, 2, 3, 4, 5, 6])\nretention       = np.array([1.0, 0.72, 0.58, 0.49, 0.43, 0.38, 0.35])\n\narpu                  = 45.0   # $ per user per month\nmonthly_discount_rate = 0.01   # 1% per month\n\n# 1. Define the exponential decay model\ndef exp_decay(t, a, b):\n    return ___\n\n# 2. Fit the model to observed data\npopt, pcov = curve_fit(___, months_observed, retention, p0=[1.0, 0.1])\na_fit, b_fit = popt\nprint(f"Fitted model: R(t) = {a_fit:.4f} * exp(-{b_fit:.4f} * t)")\n\n# 3. Project months 7-12\nmonths_projected = np.array([7, 8, 9, 10, 11, 12])\nretention_projected = ___\n\n# Combine observed + projected retention\nmonths_all    = np.concatenate([months_observed, months_projected])\nretention_all = np.concatenate([retention, retention_projected])\n\nprint("\\nRetention projection:")\nfor t, r in zip(months_all, retention_all):\n    label = "(observed)" if t <= 6 else "(projected)"\n    print(f"  Month {t:2d}: {r:.3f}  {label}")\n\n# 4. Compute 12-month discounted LTV\n# LTV = sum of ARPU * retention(t) / (1 + r)^t for t = 0 to 12\nltv_12m = ___\nprint(f"\\n12-Month Discounted LTV: ${ltv_12m:.2f}")\n\n# 5. Compare with undiscounted LTV\nltv_undiscounted = ___\nprint(f"12-Month Undiscounted LTV: ${ltv_undiscounted:.2f}")',

    modelAnswer: 'import numpy as np\nfrom scipy.optimize import curve_fit\nimport matplotlib.pyplot as plt\n\n# Observed data: M0 through M6\nmonths_observed = np.array([0, 1, 2, 3, 4, 5, 6])\nretention       = np.array([1.0, 0.72, 0.58, 0.49, 0.43, 0.38, 0.35])\n\narpu                  = 45.0   # $ per user per month\nmonthly_discount_rate = 0.01   # 1% per month\n\n# 1. Exponential decay model\ndef exp_decay(t, a, b):\n    return a * np.exp(-b * t)\n\n# 2. Fit to observed data (months 0-6)\npopt, pcov = curve_fit(exp_decay, months_observed, retention, p0=[1.0, 0.1])\na_fit, b_fit = popt\nprint(f"Fitted model: R(t) = {a_fit:.4f} * exp(-{b_fit:.4f} * t)")\nprint(f"Implied monthly churn rate ≈ {1 - np.exp(-b_fit):.2%}")\n\n# 3. Project months 7-12\nmonths_projected    = np.array([7, 8, 9, 10, 11, 12])\nretention_projected = exp_decay(months_projected, a_fit, b_fit)\n\n# Full 13-month timeline (M0 through M12)\nmonths_all    = np.concatenate([months_observed, months_projected])\nretention_all = np.concatenate([retention, retention_projected])\n\nprint("\\nRetention projection:")\nfor t, r in zip(months_all, retention_all):\n    label = "(observed)" if t <= 6 else "(projected)"\n    print(f"  Month {t:2d}: {r:.3f}  {label}")\n\n# 4. 12-Month Discounted LTV\n# LTV = sum_{t=0}^{12} ARPU * R(t) / (1 + r)^t\ndiscount_factors = np.array([(1 + monthly_discount_rate)**(-t) for t in months_all])\nltv_12m = np.sum(arpu * retention_all * discount_factors)\n\nprint(f"\\n12-Month Discounted LTV:   ${ltv_12m:.2f}")\n\n# 5. Undiscounted LTV (no time value of money)\nltv_undiscounted = np.sum(arpu * retention_all)\nprint(f"12-Month Undiscounted LTV: ${ltv_undiscounted:.2f}")\nprint(f"Discount impact: ${ltv_undiscounted - ltv_12m:.2f} ({(ltv_undiscounted - ltv_12m)/ltv_undiscounted:.1%} reduction)")\n\n# 6. LTV at each month (cumulative) — useful for CAC payback analysis\nprint("\\nCumulative LTV by month:")\ncumulative_ltv = 0\nfor t, r, df in zip(months_all, retention_all, discount_factors):\n    cumulative_ltv += arpu * r * df\n    print(f"  Month {t:2d}: cumulative LTV = ${cumulative_ltv:.2f}")\n\n# 7. Optional: visualize retention observed vs fitted\nfig, ax = plt.subplots(figsize=(9, 4))\nt_smooth = np.linspace(0, 12, 100)\nax.plot(months_observed, retention * 100, \'o\', label=\'Observed\', markersize=8, color=\'#4C72B0\')\nax.plot(t_smooth, exp_decay(t_smooth, a_fit, b_fit) * 100, \'-\', label=\'Fitted (exp decay)\', color=\'#4C72B0\', alpha=0.6)\nax.axvline(6.5, color=\'grey\', linestyle=\'--\', linewidth=0.8, label=\'Projection boundary\')\nax.set_xlabel(\'Month\')\nax.set_ylabel(\'Retention (%)\')\nax.set_title(\'Cohort Retention: Observed + Projected (Exponential Decay Fit)\')\nax.legend()\nax.spines[[\'top\', \'right\']].set_visible(False)\nplt.tight_layout()\nplt.show()',

    keyInsights: [
      'The exponential decay model R(t) = a·exp(-b·t) is the simplest parametric retention model. The constant b is the instantaneous churn rate; the implied monthly churn is 1 - exp(-b). With only 6 observed months, more complex models (power law, shifted-Beta-Geometric) are under-constrained — exponential is defensible.',
      'Discounting matters for LTV calculations at longer time horizons. A 1%/month discount rate (≈12.7% annual) reduces 12-month LTV by ~6-8% relative to undiscounted. At higher discount rates or longer horizons, the effect is substantial.',
      'The cumulative LTV curve is more useful than the 12-month point estimate for CAC payback analysis — it tells you at what month cumulative revenue recouped the acquisition cost.',
      'Projection confidence narrows rapidly beyond observed data. Report a range (optimistic/base/pessimistic) using ±1 standard deviation of the fitted parameters (pcov from curve_fit gives parameter uncertainty).',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE21 — Metric Anomaly Detection (Python · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code21-anomaly-detection-python',
    title: 'Metric Anomaly Detection with Rolling Z-Score',
    subtitle: 'Python · Pandas · Rolling Statistics · Z-Score · Alerting',
    track: 'python',
    difficulty: 'senior',
    isFree: false,
    tags: ['anomaly detection', 'rolling z-score', 'pandas', 'time series', 'alerting', 'DAU'],

    scenario: {
      company: 'Stratos · Data Science Team',
      context: 'Stratos tracks Daily Active Users (DAU) as its north star metric. The on-call analyst needs an automated anomaly detection script to flag days where DAU deviated significantly from recent trends. You\'ll implement a rolling z-score approach: for each day, compute how many standard deviations it falls from the trailing 7-day mean, and flag days where the absolute z-score exceeds 2.5.',
      schema: [
        { table: 'DataFrame: df', description: 'One row per day', columns: ['date', 'dau'] },
        { table: '—', description: 'date: datetime, sorted ascending. dau: integer, 90 days of data.', columns: [] },
        { table: '—', description: 'Example: dates from 2024-01-01 to 2024-03-30, DAU ranging 180k–240k', columns: [] },
      ],
      task: 'Compute a 7-day rolling mean and standard deviation for DAU. Calculate the z-score for each day as (dau - rolling_mean) / rolling_std. Flag all days where abs(z_score) > 2.5 as anomalies. Print the anomaly dates with their z-scores and DAU values.',
    },

    hints: [
      'Use df["dau"].rolling(window=7, min_periods=3).mean() for the rolling mean. min_periods=3 avoids NaN for the first few rows.',
      'Rolling std: df["dau"].rolling(window=7, min_periods=3).std() — note this is a sample std (ddof=1) by default.',
      'z_score = (dau - rolling_mean) / rolling_std. Be careful with division by zero if rolling_std is 0.',
      'Flag anomalies: df["is_anomaly"] = df["z_score"].abs() > 2.5. Then filter to only anomaly rows.',
    ],

    partialCode: 'import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\n\n# Simulate 90 days of DAU data (replace with real df in production)\nnp.random.seed(42)\ndates = pd.date_range(\'2024-01-01\', periods=90, freq=\'D\')\nbase_dau = 200_000\n# Inject 3 anomalies: a spike on day 30, a drop on day 55, spike on day 75\ndau_values = (base_dau + np.random.normal(0, 8_000, 90)).astype(int)\ndau_values[30] += 45_000   # anomaly: marketing campaign spike\ndau_values[55] -= 35_000   # anomaly: infrastructure outage\ndau_values[75] += 30_000   # anomaly: viral moment\n\ndf = pd.DataFrame({\'date\': dates, \'dau\': dau_values})\n\n# 1. Rolling mean and std (7-day trailing window)\ndf[\'rolling_mean\'] = ___\ndf[\'rolling_std\']  = ___\n\n# 2. Z-score: how many std devs is today\'s DAU from the 7-day average?\n# Guard against zero std (use np.where or fillna)\ndf[\'z_score\'] = ___\n\n# 3. Flag anomalies\nTHRESHOLD = 2.5\ndf[\'is_anomaly\'] = ___\n\n# 4. Print anomaly report\nanomalies = df[df[\'is_anomaly\']].copy()\nprint(f"Anomaly Detection Report (threshold: ±{THRESHOLD}σ)")\nprint(f"Total anomaly days: {len(anomalies)} out of {len(df)} days\\n")\nprint(f"{\'Date\':<14} {\'DAU\':>10} {\'Rolling Mean\':>14} {\'Z-Score\':>10}")\nprint("-" * 52)\nfor _, row in anomalies.iterrows():\n    direction = "SPIKE" if row[\'z_score\'] > 0 else "DROP "\n    print(f"{str(row[\'date\'].date()):<14} {row[\'dau\']:>10,} {row[\'rolling_mean\']:>14,.0f} {row[\'z_score\']:>+9.2f}  [{direction}]")',

    modelAnswer: 'import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\n\n# Simulate 90 days of DAU data\nnp.random.seed(42)\ndates = pd.date_range(\'2024-01-01\', periods=90, freq=\'D\')\nbase_dau = 200_000\ndau_values = (base_dau + np.random.normal(0, 8_000, 90)).astype(int)\ndau_values[30] += 45_000   # anomaly: marketing campaign spike\ndau_values[55] -= 35_000   # anomaly: infrastructure outage\ndau_values[75] += 30_000   # anomaly: viral moment\n\ndf = pd.DataFrame({\'date\': dates, \'dau\': dau_values})\n\n# 1. Rolling 7-day mean and std (trailing, min 3 observations to avoid early NaNs)\ndf[\'rolling_mean\'] = df[\'dau\'].rolling(window=7, min_periods=3).mean()\ndf[\'rolling_std\']  = df[\'dau\'].rolling(window=7, min_periods=3).std()\n\n# 2. Z-score — guard against zero std with np.where\ndf[\'z_score\'] = np.where(\n    df[\'rolling_std\'] > 0,\n    (df[\'dau\'] - df[\'rolling_mean\']) / df[\'rolling_std\'],\n    0.0\n)\n\n# 3. Flag anomalies\nTHRESHOLD = 2.5\ndf[\'is_anomaly\'] = df[\'z_score\'].abs() > THRESHOLD\n\n# 4. Print anomaly report\nanomalies = df[df[\'is_anomaly\']].copy()\nprint(f"Anomaly Detection Report  (threshold: ±{THRESHOLD}σ, 7-day rolling window)")\nprint(f"Detected {len(anomalies)} anomaly day(s) out of {len(df)} days\\n")\nprint(f"{\'Date\':<14} {\'DAU\':>10} {\'Rolling Mean\':>14} {\'Z-Score\':>10}  {\'Type\':<8}")\nprint("-" * 60)\nfor _, row in anomalies.iterrows():\n    direction = "SPIKE" if row[\'z_score\'] > 0 else "DROP"\n    print(\n        f"{str(row[\'date\'].date()):<14} "\n        f"{row[\'dau\']:>10,} "\n        f"{row[\'rolling_mean\']:>14,.0f} "\n        f"{row[\'z_score\']:>+9.2f}  "\n        f"[{direction}]"\n    )\n\n# 5. Summary statistics\nprint(f"\\nZ-score distribution (non-anomaly days):")\nnormal_z = df.loc[~df[\'is_anomaly\'], \'z_score\'].dropna()\nprint(f"  Mean:   {normal_z.mean():.3f}")\nprint(f"  Std:    {normal_z.std():.3f}")\nprint(f"  Min/Max: {normal_z.min():.2f} / {normal_z.max():.2f}")\n\n# 6. Visualize\nfig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 7), sharex=True)\n\n# Top panel: DAU with anomaly markers\nax1.plot(df[\'date\'], df[\'dau\'], linewidth=1.5, color=\'#4C72B0\', label=\'DAU\')\nax1.plot(df[\'date\'], df[\'rolling_mean\'], \'--\', color=\'orange\', linewidth=1.2, label=\'7-day rolling mean\')\nax1.scatter(anomalies[\'date\'], anomalies[\'dau\'], color=\'red\', zorder=5, s=60, label=\'Anomaly\')\nax1.set_ylabel(\'DAU\')\nax1.set_title(\'DAU with Anomaly Detection (Rolling Z-Score)\')\nax1.legend(fontsize=9)\nax1.spines[[\'top\', \'right\']].set_visible(False)\n\n# Bottom panel: Z-scores\nax2.bar(df[\'date\'], df[\'z_score\'], color=np.where(df[\'is_anomaly\'], \'#d62728\', \'#aec7e8\'), width=0.8)\nax2.axhline(THRESHOLD,  color=\'red\', linestyle=\'--\', linewidth=0.9, label=f\'+{THRESHOLD}σ\')\nax2.axhline(-THRESHOLD, color=\'red\', linestyle=\'--\', linewidth=0.9, label=f\'-{THRESHOLD}σ\')\nax2.axhline(0, color=\'grey\', linewidth=0.5)\nax2.set_ylabel(\'Z-Score\')\nax2.set_xlabel(\'Date\')\nax2.legend(fontsize=9)\nax2.spines[[\'top\', \'right\']].set_visible(False)\n\nplt.tight_layout()\nplt.show()',

    keyInsights: [
      'Rolling z-score is a simple but effective baseline anomaly detector for slowly-varying metrics like DAU. It detects deviations from recent local trends rather than from a global mean, making it robust to gradual growth or seasonality.',
      'The 7-day rolling window captures a full week of history, smoothing weekly seasonality (e.g., lower DAU on Mondays). For metrics with strong weekly cycles, using a 7-day window is important to avoid flagging every weekend as an anomaly.',
      'Guard against division by zero: if DAU is perfectly constant for 7 days, rolling_std = 0, and the z-score is undefined. np.where or pd.Series.where handles this cleanly by setting z_score = 0 in that case.',
      'A 2.5σ threshold corresponds to ~1.2% false positive rate under a normal distribution. In practice, metric distributions are heavier-tailed, so you will see somewhat more anomalies than expected. Tune the threshold based on your tolerance for false alarms vs. missed detections.',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE22 — Funnel Conversion SQL + Python Chi-Square (Python+SQL · Staff)
  // ─────────────────────────────────────────────
  {
    id: 'code22-funnel-segment-chisq',
    title: 'Funnel Conversion by Segment with Significance Testing',
    subtitle: 'Python + SQL · Funnel Analysis · Chi-Square Test · Segment Comparison',
    track: 'python',
    difficulty: 'staff',
    isFree: false,
    tags: ['funnel', 'segment analysis', 'chi-square', 'scipy', 'SQL', 'statistical significance', 'staff'],

    scenario: {
      company: 'Orbis Commerce · Checkout Team',
      context: 'Orbis wants to know if checkout conversion differs significantly between mobile and desktop users, and at which funnel step the gap is largest. You\'ll write SQL to extract step-level funnel counts by segment, then use Python to compute per-step conversion rates and run a chi-square test at each step to determine if the segment differences are statistically significant.',
      schema: [
        { table: 'events', description: 'One row per user per funnel event', columns: ['user_id', 'event_name', 'platform', 'event_ts'] },
        { table: '—', description: 'event_name: "checkout_start", "payment_page", "payment_submit", "order_complete"', columns: [] },
        { table: '—', description: 'platform: "mobile" | "desktop"', columns: [] },
      ],
      task: 'Part 1 (SQL): Write a query to count distinct users at each funnel step by platform. Part 2 (Python): Load the results into a DataFrame, compute conversion rates, and run a chi-square test at each step comparing mobile vs. desktop.',
    },

    hints: [
      'SQL: Use COUNT(DISTINCT CASE WHEN event_name = \'...\' THEN user_id END) per platform to get users at each funnel step',
      'Python: For each step, the contingency table is [[mobile_reached, mobile_not_reached], [desktop_reached, desktop_not_reached]] where "reached" means completed this step',
      'scipy.stats.chi2_contingency([[a,b],[c,d]]) returns (chi2, p_value, dof, expected)',
      'The chi-square test at each step is conditional: it tests whether the proportion who reached this step (out of those who reached the previous step) differs by platform',
    ],

    partialCode: '# ─── PART 1: SQL ──────────────────────────────────────────\n# Write a SQL query that returns:\n# platform | users_checkout_start | users_payment_page | users_payment_submit | users_order_complete\n# One row per platform (mobile, desktop)\n\nsql_query = """\nSELECT\n    platform,\n    COUNT(DISTINCT CASE WHEN event_name = \'checkout_start\'   THEN user_id END) AS users_checkout_start,\n    -- TODO: add users_payment_page, users_payment_submit, users_order_complete\n    ___\nFROM events\nWHERE event_ts >= \'2024-01-01\'\nGROUP BY platform\nORDER BY platform;\n"""\n\n# ─── PART 2: Python ──────────────────────────────────────────\nimport pandas as pd\nimport numpy as np\nfrom scipy.stats import chi2_contingency\n\n# Simulated result from the SQL query above\ndata = {\n    \'platform\': [\'desktop\', \'mobile\'],\n    \'users_checkout_start\':   [45_200, 61_800],\n    \'users_payment_page\':     [38_420, 44_500],\n    \'users_payment_submit\':   [32_180, 33_400],\n    \'users_order_complete\':   [28_950, 26_720],\n}\ndf = pd.DataFrame(data)\ndf = df.set_index(\'platform\')\n\nsteps = [\'users_payment_page\', \'users_payment_submit\', \'users_order_complete\']\nprev  = [\'users_checkout_start\', \'users_payment_page\',  \'users_payment_submit\']\n\nprint(f"{\'Step\':<26} {\'Desktop Rate\':>14} {\'Mobile Rate\':>13} {\'Chi2 p-value\':>14}  {\'Significant?\':>14}")\nprint("-" * 90)\n\nfor step, prior in zip(steps, prev):\n    # Compute conversion rate at this step (reached step / reached previous step)\n    desktop_rate = ___\n    mobile_rate  = ___\n\n    # Build 2x2 contingency table\n    # [[desktop_reached_step, desktop_not_reached], [mobile_reached_step, mobile_not_reached]]\n    desktop_reached = df.loc[\'desktop\', step]\n    desktop_prior   = df.loc[\'desktop\', prior]\n    mobile_reached  = df.loc[\'mobile\',  step]\n    mobile_prior    = df.loc[\'mobile\',  prior]\n\n    contingency = ___   # 2x2 table\n    chi2, p, dof, expected = chi2_contingency(contingency)\n\n    sig = "YES ***" if p < 0.05 else "no"\n    step_label = step.replace(\'users_\', \'\').replace(\'_\', \' \').title()\n    print(f"{step_label:<26} {desktop_rate:>13.1%} {mobile_rate:>13.1%} {p:>14.4f}  {sig:>14}")',

    modelAnswer: '# ─── PART 1: SQL ─────────────────────────────────────────────────────────────\n# Returns one row per platform with user counts at each funnel step.\n\nsql_query = """\nSELECT\n    platform,\n    COUNT(DISTINCT CASE WHEN event_name = \'checkout_start\'   THEN user_id END) AS users_checkout_start,\n    COUNT(DISTINCT CASE WHEN event_name = \'payment_page\'     THEN user_id END) AS users_payment_page,\n    COUNT(DISTINCT CASE WHEN event_name = \'payment_submit\'   THEN user_id END) AS users_payment_submit,\n    COUNT(DISTINCT CASE WHEN event_name = \'order_complete\'   THEN user_id END) AS users_order_complete\nFROM events\nWHERE event_ts >= \'2024-01-01\'\nGROUP BY platform\nORDER BY platform;\n-- Note: COUNT DISTINCT per step naturally handles users who skip steps (if that\'s possible in your schema).\n-- If users must reach step N before step N+1, this is equivalent to a strict funnel filter.\n"""\n\n# ─── PART 2: Python ───────────────────────────────────────────────────────────\nimport pandas as pd\nimport numpy as np\nfrom scipy.stats import chi2_contingency\n\n# Simulated SQL result\ndata = {\n    \'platform\': [\'desktop\', \'mobile\'],\n    \'users_checkout_start\':   [45_200, 61_800],\n    \'users_payment_page\':     [38_420, 44_500],\n    \'users_payment_submit\':   [32_180, 33_400],\n    \'users_order_complete\':   [28_950, 26_720],\n}\ndf = pd.DataFrame(data).set_index(\'platform\')\n\n# Define the step-to-prior mapping for step-over-step conversion rates\nsteps_labels = [\'Payment Page\', \'Payment Submit\', \'Order Complete\']\nsteps = [\'users_payment_page\', \'users_payment_submit\', \'users_order_complete\']\nprev  = [\'users_checkout_start\', \'users_payment_page\',  \'users_payment_submit\']\n\nprint("Funnel Conversion Rate by Platform — Orbis Commerce")\nprint(f"{\'Step\':<22} {\'Desktop Rate\':>14} {\'Mobile Rate\':>13} {\'p-value\':>10}  {\'Significant\':>12}")\nprint("=" * 76)\n\nresults = []\nfor label, step, prior in zip(steps_labels, steps, prev):\n    desktop_prior   = df.loc[\'desktop\', prior]\n    desktop_reached = df.loc[\'desktop\', step]\n    mobile_prior    = df.loc[\'mobile\',  prior]\n    mobile_reached  = df.loc[\'mobile\',  step]\n\n    # Step-over-step conversion rates\n    desktop_rate = desktop_reached / desktop_prior\n    mobile_rate  = mobile_reached  / mobile_prior\n\n    # 2x2 contingency table for chi-square test\n    # Row 1: desktop — [reached_this_step, did_not_reach]\n    # Row 2: mobile  — [reached_this_step, did_not_reach]\n    contingency = [\n        [desktop_reached, desktop_prior - desktop_reached],\n        [mobile_reached,  mobile_prior  - mobile_reached ],\n    ]\n    chi2, p, dof, expected = chi2_contingency(contingency)\n\n    sig    = "YES ***" if p < 0.001 else ("YES *" if p < 0.05 else "no")\n    lift   = mobile_rate - desktop_rate\n    results.append({\n        \'step\': label, \'desktop_rate\': desktop_rate,\n        \'mobile_rate\': mobile_rate, \'lift_mobile_vs_desktop\': lift,\n        \'chi2\': chi2, \'p_value\': p,\n    })\n    print(f"{label:<22} {desktop_rate:>13.1%} {mobile_rate:>13.1%} {p:>10.4f}  {sig:>12}")\n\n# Summary\nprint()\nresults_df = pd.DataFrame(results)\nworst_step = results_df.loc[results_df[\'lift_mobile_vs_desktop\'].idxmin(), \'step\']\nprint(f"Largest mobile deficit vs desktop: \'{worst_step}\'")\nprint(f"  Mobile rate at that step: {results_df[results_df[\'step\']==worst_step][\'mobile_rate\'].values[0]:.1%}")\nprint(f"  Desktop rate at that step: {results_df[results_df[\'step\']==worst_step][\'desktop_rate\'].values[0]:.1%}")\n\n# Overall (end-to-end) funnel conversion\noverall_desktop = df.loc[\'desktop\', \'users_order_complete\'] / df.loc[\'desktop\', \'users_checkout_start\']\noverall_mobile  = df.loc[\'mobile\',  \'users_order_complete\'] / df.loc[\'mobile\',  \'users_checkout_start\']\nprint(f"\\nEnd-to-end funnel conversion:")\nprint(f"  Desktop: {overall_desktop:.1%}  |  Mobile: {overall_mobile:.1%}")\nprint(f"  Mobile lags desktop by {(overall_desktop - overall_mobile)*100:.1f}pp overall")\n\n# Overall chi-square test on end-to-end conversion\ncontingency_overall = [\n    [df.loc[\'desktop\',\'users_order_complete\'], df.loc[\'desktop\',\'users_checkout_start\'] - df.loc[\'desktop\',\'users_order_complete\']],\n    [df.loc[\'mobile\', \'users_order_complete\'], df.loc[\'mobile\', \'users_checkout_start\'] - df.loc[\'mobile\', \'users_order_complete\']],\n]\nchi2_overall, p_overall, _, _ = chi2_contingency(contingency_overall)\nprint(f"  Overall chi-square p-value: {p_overall:.2e}  ({\'significant\' if p_overall < 0.05 else \'not significant\'})")',

    keyInsights: [
      'The chi-square test for funnel segments uses a 2×2 contingency table: [users_who_reached_step, users_who_did_not_reach_step] for each segment. This correctly tests whether the step-over-step conversion proportion is different between segments.',
      'Always run step-over-step conversion rates (step N / step N-1), not step N / top-of-funnel, when testing at each individual step. The question is: "of users who reached the previous step, did fewer mobile users proceed to the next step?" — not "what fraction of all checkout-starters reached payment_submit?"',
      'With sample sizes of 30k-60k per segment, almost any real effect will be statistically significant. The p-value tells you if an effect exists; the magnitude (desktop 84.9% vs. mobile 75.1% payment_page rate) tells you if it matters. Always report both.',
      'This pattern — SQL to extract counts → Python to compute rates and run tests — is the standard workflow in product analytics. The SQL does the data aggregation; Python does the statistical inference. Keep these concerns separated for clarity and reproducibility.',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE23 — GroupBy + Aggregation (pandas · Analyst)
  // ─────────────────────────────────────────────
  {
    id: 'code23-pandas-groupby',
    title: 'Segment Performance with GroupBy',
    subtitle: 'Python · pandas · groupby · agg · Swiggy',
    track: 'python',
    difficulty: 'analyst',
    isFree: true,
    tags: ['pandas', 'groupby', 'aggregation', 'segmentation'],

    scenario: {
      company: 'Swiggy',
      context: 'The growth team suspects delivery performance varies significantly by city tier and order type. You have a DataFrame of the last 30 days of orders. The head of analytics wants a clean summary: average order value, order volume, cancellation rate, and average delivery time — broken down by city_tier and order_type.',
      schema: [
        { table: 'Python variable already defined:', description: '', columns: [] },
        { table: 'orders', description: 'DataFrame — one row per order', columns: ['order_id', 'city_tier', 'order_type', 'order_value', 'is_cancelled', 'delivery_minutes'] },
      ],
      task: 'Write pandas code that produces a grouped summary with: order_count, avg_order_value (rounded to 2dp), cancellation_rate (as %, rounded to 1dp), avg_delivery_minutes (rounded to 1dp). Sort by city_tier then order_type.',
    },

    hints: [
      'groupby([\'city_tier\', \'order_type\']) groups on two columns at once',
      'Pass a dict to .agg() to apply different functions per column: {\'col\': [\'count\', \'mean\']}',
      'cancellation_rate = is_cancelled.mean() * 100 — mean() on a boolean column gives the proportion',
      'Use .round() on the final DataFrame or per-column in agg with a lambda',
      'reset_index() after groupby turns the MultiIndex back into regular columns',
    ],

    partialCode: 'import pandas as pd\nimport numpy as np\n\n# Pre-defined DataFrame\nnp.random.seed(42)\nn = 2000\norders = pd.DataFrame({\n    \'order_id\':         range(1, n+1),\n    \'city_tier\':        np.random.choice([\'Tier1\', \'Tier2\', \'Tier3\'], n, p=[0.5, 0.3, 0.2]),\n    \'order_type\':       np.random.choice([\'food\', \'grocery\', \'instamart\'], n, p=[0.6, 0.25, 0.15]),\n    \'order_value\':      np.random.lognormal(4.2, 0.6, n).round(2),\n    \'is_cancelled\':     np.random.choice([0, 1], n, p=[0.92, 0.08]),\n    \'delivery_minutes\': np.random.normal(28, 8, n).clip(5, 90).round(1),\n})\n\n# TODO: group by city_tier and order_type\n# Compute: order_count, avg_order_value, cancellation_rate (%), avg_delivery_minutes\nsummary = orders.groupby(___).agg(\n    order_count        = (\'order_id\',         ___),\n    avg_order_value    = (\'order_value\',      ___),\n    cancellation_rate  = (\'is_cancelled\',     ___),\n    avg_delivery_mins  = (\'delivery_minutes\', ___),\n).reset_index()\n\n# TODO: round appropriately and sort\nsummary[\'avg_order_value\']   = ___\nsummary[\'cancellation_rate\'] = ___\nsummary[\'avg_delivery_mins\'] = ___\nsummary = summary.sort_values(___)\n\nprint(summary.to_string(index=False))',

    modelAnswer: 'import pandas as pd\nimport numpy as np\n\nnp.random.seed(42)\nn = 2000\norders = pd.DataFrame({\n    \'order_id\':         range(1, n+1),\n    \'city_tier\':        np.random.choice([\'Tier1\', \'Tier2\', \'Tier3\'], n, p=[0.5, 0.3, 0.2]),\n    \'order_type\':       np.random.choice([\'food\', \'grocery\', \'instamart\'], n, p=[0.6, 0.25, 0.15]),\n    \'order_value\':      np.random.lognormal(4.2, 0.6, n).round(2),\n    \'is_cancelled\':     np.random.choice([0, 1], n, p=[0.92, 0.08]),\n    \'delivery_minutes\': np.random.normal(28, 8, n).clip(5, 90).round(1),\n})\n\nsummary = orders.groupby([\'city_tier\', \'order_type\']).agg(\n    order_count        = (\'order_id\',         \'count\'),\n    avg_order_value    = (\'order_value\',       \'mean\'),\n    cancellation_rate  = (\'is_cancelled\',      \'mean\'),\n    avg_delivery_mins  = (\'delivery_minutes\',  \'mean\'),\n).reset_index()\n\nsummary[\'avg_order_value\']   = summary[\'avg_order_value\'].round(2)\nsummary[\'cancellation_rate\'] = (summary[\'cancellation_rate\'] * 100).round(1)\nsummary[\'avg_delivery_mins\'] = summary[\'avg_delivery_mins\'].round(1)\nsummary = summary.sort_values([\'city_tier\', \'order_type\']).reset_index(drop=True)\n\nprint(summary.to_string(index=False))\n\n# Insight: which tier has highest cancellation rate?\nworst = summary.loc[summary[\'cancellation_rate\'].idxmax()]\nprint(f\'\\nHighest cancellation: {worst.city_tier} / {worst.order_type} at {worst.cancellation_rate}%\')',

    keyInsights: [
      'Named aggregation syntax — agg(new_col=(\'source_col\', \'func\')) — is cleaner than dict agg and gives you direct column name control in one step.',
      'mean() on a boolean or 0/1 integer column returns the proportion. Multiply by 100 after the groupby, not inside it — applying arithmetic inside agg on a boolean column is error-prone.',
      'Always reset_index() after a multi-column groupby unless you intentionally want a MultiIndex. MultiIndex DataFrames are harder to sort, merge, and display.',
      'In interviews, always state your sort order explicitly and explain why — "sorted by city_tier then order_type so the reader can scan tiers" shows communication, not just code.',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE24 — Merge Validation (pandas · Analyst)
  // ─────────────────────────────────────────────
  {
    id: 'code24-pandas-merge-validation',
    title: 'Merge DataFrames Safely',
    subtitle: 'Python · pandas · merge · many-to-many · validation · Meesho',
    track: 'python',
    difficulty: 'analyst',
    isFree: false,
    tags: ['pandas', 'merge', 'join', 'data validation', 'many-to-many'],

    scenario: {
      company: 'Meesho',
      context: 'You\'re joining an orders table to a returns table to compute return rate by category. A colleague merged them and got a row count 3x higher than orders — a classic many-to-many inflation. You need to safely merge, detect if inflation occurred, and compute the correct return rate per category.',
      schema: [
        { table: 'Python variables already defined:', description: '', columns: [] },
        { table: 'orders', description: 'DataFrame — one row per order', columns: ['order_id', 'user_id', 'category', 'order_value'] },
        { table: 'returns', description: 'DataFrame — one row per return event (an order can have multiple return events)', columns: ['return_id', 'order_id', 'return_reason'] },
      ],
      task: 'Deduplicate returns to one row per order_id, merge with orders, validate row count matches orders, then compute return_rate per category (% of orders with at least one return).',
    },

    hints: [
      'Before merging, check returns.duplicated(\'order_id\').sum() — if > 0, the merge will inflate',
      'drop_duplicates(\'order_id\') on returns keeps only the first return event per order',
      'After merging, assert len(merged) == len(orders) — catch inflation before it silently corrupts metrics',
      'Use how=\'left\' so orders with no return still appear (with NaN in return columns)',
      'return_rate = orders_with_return / total_orders — a returned flag column makes this easy',
    ],

    partialCode: 'import pandas as pd\nimport numpy as np\n\nnp.random.seed(7)\norders = pd.DataFrame({\n    \'order_id\':    range(1, 1001),\n    \'user_id\':     np.random.randint(1, 301, 1000),\n    \'category\':    np.random.choice([\'fashion\', \'home\', \'beauty\', \'electronics\'], 1000, p=[0.4, 0.25, 0.2, 0.15]),\n    \'order_value\': np.random.lognormal(4.0, 0.7, 1000).round(2),\n})\n\n# returns has duplicates — some orders have 2 return events\nbase_returns = pd.DataFrame({\n    \'return_id\': range(1, 161),\n    \'order_id\':  np.random.choice(orders[\'order_id\'], 160),\n    \'return_reason\': np.random.choice([\'wrong_item\', \'damaged\', \'not_needed\'], 160),\n})\nreturns = base_returns  # intentionally has duplicate order_ids\n\n# STEP 1: Check for duplicates in returns\ndup_count = ___\nprint(f\'Return events with duplicate order_id: {dup_count}\')\n\n# STEP 2: Deduplicate — keep first return event per order\nreturns_deduped = ___\n\n# STEP 3: Merge orders (left join)\nmerged = ___\n\n# STEP 4: Validate row count\nassert ___, f\'Row inflation detected: {len(merged)} rows vs {len(orders)} expected\'\nprint(f\'Merge validated: {len(merged)} rows\')\n\n# STEP 5: Add a returned flag and compute return rate per category\nmerged[\'returned\'] = ___\nreturn_rate = merged.groupby(\'category\')[\'returned\'].___\nprint(\'\\nReturn rate by category (%):\') \nprint((return_rate * 100).round(1))',

    modelAnswer: 'import pandas as pd\nimport numpy as np\n\nnp.random.seed(7)\norders = pd.DataFrame({\n    \'order_id\':    range(1, 1001),\n    \'user_id\':     np.random.randint(1, 301, 1000),\n    \'category\':    np.random.choice([\'fashion\', \'home\', \'beauty\', \'electronics\'], 1000, p=[0.4, 0.25, 0.2, 0.15]),\n    \'order_value\': np.random.lognormal(4.0, 0.7, 1000).round(2),\n})\nbase_returns = pd.DataFrame({\n    \'return_id\': range(1, 161),\n    \'order_id\':  np.random.choice(orders[\'order_id\'], 160),\n    \'return_reason\': np.random.choice([\'wrong_item\', \'damaged\', \'not_needed\'], 160),\n})\nreturns = base_returns\n\n# STEP 1: Check for duplicates\ndup_count = returns.duplicated(\'order_id\').sum()\nprint(f\'Return events with duplicate order_id: {dup_count}\')\n\n# STEP 2: Deduplicate\nreturns_deduped = returns.drop_duplicates(\'order_id\', keep=\'first\')\nprint(f\'Returns after dedup: {len(returns_deduped)} rows (was {len(returns)})\')\n\n# STEP 3: Left merge\nmerged = orders.merge(returns_deduped[[\'order_id\', \'return_reason\']], on=\'order_id\', how=\'left\')\n\n# STEP 4: Validate\nassert len(merged) == len(orders), f\'Row inflation: {len(merged)} vs {len(orders)}\'\nprint(f\'Merge validated: {len(merged)} rows\')\n\n# STEP 5: Return rate\nmerged[\'returned\'] = merged[\'return_reason\'].notna().astype(int)\nreturn_rate = merged.groupby(\'category\')[\'returned\'].mean()\nprint(\'\\nReturn rate by category (%):\')\nprint((return_rate * 100).round(1).sort_values(ascending=False))\n\noverall = merged[\'returned\'].mean() * 100\nprint(f\'\\nOverall return rate: {overall:.1f}%\')',

    keyInsights: [
      'Always check for duplicate keys before merging. duplicated(\'key_col\').sum() takes one line and catches silent inflation before it corrupts every downstream metric.',
      'A left merge on a deduplicated right table preserves the left table\'s row count exactly. If len(merged) != len(left), you missed duplicates — add an assert so it fails loudly.',
      'notna() on a merged column is cleaner than fillna(0) for creating a binary flag. It reads as "did this order have a return?" not "is return_reason not missing?".',
      'In interviews, narrate the dedup decision: "I\'m keeping the first return event per order because return_rate is binary — returned or not. Multiple return events per order are operational detail, not relevant here."',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE25 — Pivot Cohort Retention Table (pandas · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code25-pandas-pivot-cohort',
    title: 'Build a Cohort Retention Table',
    subtitle: 'Python · pandas · pivot_table · cohort analysis · Zepto',
    track: 'python',
    difficulty: 'senior',
    isFree: false,
    tags: ['pandas', 'cohort', 'retention', 'pivot_table'],

    scenario: {
      company: 'Zepto',
      context: 'The PM wants a classic cohort retention table: rows = install week, columns = Week 0 / Week 1 / Week 2 / Week 4, values = retention rate (% of install cohort who placed an order that week). You have a raw events DataFrame. Build the full pivot table and show percentage retained.',
      schema: [
        { table: 'Python variable already defined:', description: '', columns: [] },
        { table: 'events', description: 'DataFrame — one row per order event', columns: ['user_id', 'install_date', 'order_date'] },
      ],
      task: 'Compute weeks_since_install for each event, pivot into a cohort table (install_week x weeks_since), fill missing as 0, divide each row by Week 0 to get retention rates, display as percentages.',
    },

    hints: [
      '(order_date - install_date).dt.days // 7 gives weeks since install as an integer',
      'install_week = install_date.dt.to_period(\'W\') groups users into weekly cohorts',
      'pivot_table with aggfunc=\'nunique\' and values=\'user_id\' counts unique users per cohort-week cell',
      'Divide each row by the Week 0 column: df.div(df[0], axis=0) — axis=0 broadcasts per row',
      'fillna(0) before dividing to avoid NaN in cells with no returning users',
    ],

    partialCode: 'import pandas as pd\nimport numpy as np\n\nnp.random.seed(99)\nusers = pd.DataFrame({\n    \'user_id\':      range(1, 801),\n    \'install_date\': pd.date_range(\'2024-01-01\', periods=800, freq=\'6H\'),\n})\n# Simulate return orders with decaying retention\nevents_list = []\nfor _, u in users.iterrows():\n    for week in range(5):\n        p_return = max(0, 0.9 - week * 0.15 + np.random.normal(0, 0.05))\n        if np.random.random() < p_return:\n            order_date = u[\'install_date\'] + pd.Timedelta(days=week*7 + np.random.randint(0, 7))\n            events_list.append({\'user_id\': u[\'user_id\'], \'install_date\': u[\'install_date\'], \'order_date\': order_date})\nevents = pd.DataFrame(events_list)\n\n# STEP 1: compute weeks_since_install\nevents[\'weeks_since_install\'] = ___\n\n# STEP 2: compute install_week (period)\nevents[\'install_week\'] = ___\n\n# STEP 3: pivot table — unique users per install_week x weeks_since\ncohort_counts = events.pivot_table(\n    index=___,\n    columns=___,\n    values=___,\n    aggfunc=___,\n).fillna(0).astype(int)\n\n# STEP 4: divide each row by Week 0 to get retention rate\nretention = ___\n\n# STEP 5: display as percentages\nprint((retention * 100).round(1))',

    modelAnswer: 'import pandas as pd\nimport numpy as np\n\nnp.random.seed(99)\nusers = pd.DataFrame({\n    \'user_id\':      range(1, 801),\n    \'install_date\': pd.date_range(\'2024-01-01\', periods=800, freq=\'6H\'),\n})\nevents_list = []\nfor _, u in users.iterrows():\n    for week in range(5):\n        p_return = max(0, 0.9 - week * 0.15 + np.random.normal(0, 0.05))\n        if np.random.random() < p_return:\n            order_date = u[\'install_date\'] + pd.Timedelta(days=week*7 + np.random.randint(0, 7))\n            events_list.append({\'user_id\': u[\'user_id\'], \'install_date\': u[\'install_date\'], \'order_date\': order_date})\nevents = pd.DataFrame(events_list)\n\n# STEP 1\nevents[\'weeks_since_install\'] = (events[\'order_date\'] - events[\'install_date\']).dt.days // 7\n\n# STEP 2\nevents[\'install_week\'] = events[\'install_date\'].dt.to_period(\'W\')\n\n# STEP 3\ncohort_counts = events.pivot_table(\n    index=\'install_week\',\n    columns=\'weeks_since_install\',\n    values=\'user_id\',\n    aggfunc=\'nunique\',\n).fillna(0).astype(int)\n\n# STEP 4\nretention = cohort_counts.div(cohort_counts[0], axis=0)\n\n# STEP 5\nprint("Cohort Retention Table (% of install cohort ordering each week)")\nprint((retention * 100).round(1))\n\n# Week 1 and Week 4 average retention\nif 1 in retention.columns:\n    print(f\'\\nAvg Week-1 retention: {(retention[1].mean()*100):.1f}%\')\nif 4 in retention.columns:\n    print(f\'Avg Week-4 retention: {(retention[4].mean()*100):.1f}%\')',

    keyInsights: [
      'pivot_table with aggfunc=\'nunique\' is the right aggregation for cohort retention — you want unique users who returned, not event count. Using \'count\' inflates if users order multiple times in a week.',
      'div(col, axis=0) broadcasts a Series (Week 0 column) across all columns row-by-row. This is the pandas idiom for "divide each row by its own denominator" and is far cleaner than a loop.',
      'dt.to_period(\'W\') groups dates into ISO week periods. It\'s more robust than dt.strftime for cohort keys because Period objects sort correctly and display cleanly.',
      'Week 0 retention will be 100% by definition — every user in the cohort placed at least one order in their install week (that\'s how they got into the dataset). If your Week 0 < 100%, you have a data quality issue upstream.',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE26 — Rolling Window + Anomaly (pandas · Analyst)
  // ─────────────────────────────────────────────
  {
    id: 'code26-pandas-rolling-window',
    title: '7-Day Rolling Average and Anomaly Detection',
    subtitle: 'Python · pandas · rolling · shift · time series · Flipkart',
    track: 'python',
    difficulty: 'analyst',
    isFree: false,
    tags: ['pandas', 'rolling', 'time series', 'anomaly', 'moving average'],

    scenario: {
      company: 'Flipkart',
      context: 'Daily GMV has been volatile. The analytics team wants a 7-day rolling average to smooth noise, plus a flag for days where actual GMV deviated from the rolling average by more than 20%. You need to find the anomalous days — these are candidates for RCA.',
      schema: [
        { table: 'Python variable already defined:', description: '', columns: [] },
        { table: 'daily', description: 'DataFrame — one row per day', columns: ['date', 'gmv_cr'] },
      ],
      task: 'Compute a 7-day rolling average of GMV. Compute the % deviation from that average. Flag days where |deviation| > 20%. Print the anomalous days sorted by deviation magnitude.',
    },

    hints: [
      'Sort by date first — rolling() processes rows in order, so unsorted dates give wrong results',
      'rolling(7, min_periods=1).mean() uses up to 7 days but works for the first 6 rows too',
      'pct deviation = (actual - rolling_avg) / rolling_avg * 100',
      'Use shift(1) on the rolling average if you want a "previous 7 days" average (no look-ahead)',
      'abs() on the deviation column lets you filter and sort by magnitude regardless of direction',
    ],

    partialCode: 'import pandas as pd\nimport numpy as np\n\nnp.random.seed(21)\ndates = pd.date_range(\'2024-01-01\', periods=90)\nbase_gmv = 500 + np.cumsum(np.random.normal(0, 8, 90))\n# Inject 4 anomalous days\nbase_gmv[15] *= 1.35\nbase_gmv[42] *= 0.72\nbase_gmv[67] *= 1.28\nbase_gmv[81] *= 0.75\ndaily = pd.DataFrame({\'date\': dates, \'gmv_cr\': base_gmv.round(1)})\n\n# STEP 1: sort by date (critical for rolling)\ndaily = ___\n\n# STEP 2: 7-day rolling average (include partial windows at start)\ndaily[\'rolling_7d_avg\'] = ___\n\n# STEP 3: % deviation from rolling average\ndaily[\'deviation_pct\'] = ___\n\n# STEP 4: flag anomalies where |deviation| > 20%\ndaily[\'is_anomaly\'] = ___\n\n# STEP 5: print anomalous days\nanomalies = daily[daily[\'is_anomaly\']].copy()\nanomalies = anomalies.sort_values(\'deviation_pct\', key=abs, ascending=False)\nprint(anomalies[[\'date\', \'gmv_cr\', \'rolling_7d_avg\', \'deviation_pct\']].to_string(index=False))',

    modelAnswer: 'import pandas as pd\nimport numpy as np\n\nnp.random.seed(21)\ndates = pd.date_range(\'2024-01-01\', periods=90)\nbase_gmv = 500 + np.cumsum(np.random.normal(0, 8, 90))\nbase_gmv[15] *= 1.35\nbase_gmv[42] *= 0.72\nbase_gmv[67] *= 1.28\nbase_gmv[81] *= 0.75\ndaily = pd.DataFrame({\'date\': dates, \'gmv_cr\': base_gmv.round(1)})\n\n# STEP 1\ndaily = daily.sort_values(\'date\').reset_index(drop=True)\n\n# STEP 2\ndaily[\'rolling_7d_avg\'] = daily[\'gmv_cr\'].rolling(7, min_periods=1).mean().round(1)\n\n# STEP 3\ndaily[\'deviation_pct\'] = ((daily[\'gmv_cr\'] - daily[\'rolling_7d_avg\']) / daily[\'rolling_7d_avg\'] * 100).round(1)\n\n# STEP 4\ndaily[\'is_anomaly\'] = daily[\'deviation_pct\'].abs() > 20\n\n# STEP 5\nanomalies = daily[daily[\'is_anomaly\']].copy()\nanomalies = anomalies.sort_values(\'deviation_pct\', key=abs, ascending=False)\nprint(f\'Anomalous days (|deviation| > 20%): {len(anomalies)}\')\nprint(anomalies[[\'date\', \'gmv_cr\', \'rolling_7d_avg\', \'deviation_pct\']].to_string(index=False))\n\n# Direction breakdown\nn_up = (anomalies[\'deviation_pct\'] > 0).sum()\nn_dn = (anomalies[\'deviation_pct\'] < 0).sum()\nprint(f\'\\nPositive spikes: {n_up}  |  Negative drops: {n_dn}\')',

    keyInsights: [
      'Always sort by date before rolling(). Rolling operates on row order — if dates are shuffled, your 7-day window is meaningless. This is a common silent bug in interview submissions.',
      'min_periods=1 prevents NaN for the first 6 rows where a full 7-day window isn\'t available. Without it, your first week has no rolling average — fine for analysis, but looks sloppy to reviewers.',
      'Use shift(1) if you want a "trailing 7-day average" that excludes today (no look-ahead bias). For anomaly detection, including today is fine since you\'re comparing actual vs average.',
      'abs() as the key in sort_values(key=abs) is a clean pandas idiom — sorts by magnitude without creating a separate absolute-value column.',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE27 — numpy Percentile Distribution (numpy · Analyst)
  // ─────────────────────────────────────────────
  {
    id: 'code27-numpy-percentile',
    title: 'Revenue Distribution with Percentiles',
    subtitle: 'Python · numpy · percentile · distribution analysis · Razorpay',
    track: 'python',
    difficulty: 'analyst',
    isFree: false,
    tags: ['numpy', 'percentile', 'distribution', 'revenue', 'statistics'],

    scenario: {
      company: 'Razorpay',
      context: 'The payments team is investigating transaction value distribution. Averages are misleading because a few large transactions dominate. You need to understand the full distribution — P50, P75, P90, P95, P99 — and determine what % of total revenue comes from transactions above P90.',
      schema: [
        { table: 'Python variable already defined:', description: '', columns: [] },
        { table: 'txn_values', description: 'numpy array — one value per transaction (INR)', columns: [] },
      ],
      task: 'Compute percentiles (P25, P50, P75, P90, P95, P99). Compute mean vs median and explain the gap. Find the P90 threshold and compute what % of total revenue comes from transactions above it.',
    },

    hints: [
      'np.percentile(arr, [25, 50, 75, 90, 95, 99]) computes multiple percentiles in one call',
      'mean vs median gap on a right-skewed distribution tells you how much the tail pulls the average up',
      'txn_values[txn_values > p90_threshold].sum() / txn_values.sum() gives the revenue share above P90',
      'np.histogram(txn_values, bins=20) gives a quick shape check — print it as a bar chart with *',
    ],

    partialCode: 'import numpy as np\n\nnp.random.seed(55)\n# Simulate payment transaction values — log-normal (right-skewed)\ntxn_values = np.concatenate([\n    np.random.lognormal(mean=6.5, sigma=1.0, size=9500),   # typical transactions\n    np.random.lognormal(mean=9.5, sigma=0.8, size=500),    # high-value transactions\n]).round(2)\n\nprint(f\'Total transactions: {len(txn_values):,}\')\nprint(f\'Total revenue: INR {txn_values.sum():,.0f}\')\n\n# STEP 1: compute percentiles P25 P50 P75 P90 P95 P99\npercentiles = ___\nlabels = [\'P25\', \'P50\', \'P75\', \'P90\', \'P95\', \'P99\']\nfor label, val in zip(labels, percentiles):\n    print(f\'  {label}: INR {val:,.0f}\')\n\n# STEP 2: mean vs median\nmean_val   = ___\nmedian_val = ___\nprint(f\'\\nMean:   INR {mean_val:,.0f}\')\nprint(f\'Median: INR {median_val:,.0f}\')\nprint(f\'Mean/Median ratio: {mean_val/median_val:.2f}x (skew indicator)\')\n\n# STEP 3: revenue share above P90\np90 = percentiles[___]  # index 3 = P90\nrevenue_above_p90 = ___\nrevenue_share = ___\nprint(f\'\\nTransactions above P90 (INR {p90:,.0f}): {(txn_values > p90).sum():,} ({(txn_values > p90).mean()*100:.1f}% of volume)\')\nprint(f\'Revenue from above-P90 transactions: {revenue_share*100:.1f}% of total\')',

    modelAnswer: 'import numpy as np\n\nnp.random.seed(55)\ntxn_values = np.concatenate([\n    np.random.lognormal(mean=6.5, sigma=1.0, size=9500),\n    np.random.lognormal(mean=9.5, sigma=0.8, size=500),\n]).round(2)\n\nprint(f\'Total transactions: {len(txn_values):,}\')\nprint(f\'Total revenue: INR {txn_values.sum():,.0f}\')\nprint()\n\n# STEP 1\npercentile_values = [25, 50, 75, 90, 95, 99]\npercentiles = np.percentile(txn_values, percentile_values)\nlabels = [\'P25\', \'P50\', \'P75\', \'P90\', \'P95\', \'P99\']\nprint("Distribution percentiles:")\nfor label, val in zip(labels, percentiles):\n    print(f\'  {label}: INR {val:,.0f}\')\n\n# STEP 2\nmean_val   = np.mean(txn_values)\nmedian_val = np.median(txn_values)\nprint(f\'\\nMean:   INR {mean_val:,.0f}\')\nprint(f\'Median: INR {median_val:,.0f}\')\nprint(f\'Mean/Median ratio: {mean_val/median_val:.2f}x  (>1.5 = significant right skew)\')\n\n# STEP 3\np90 = percentiles[3]  # index 3 = P90\nabove_p90 = txn_values[txn_values > p90]\nrevenue_share = above_p90.sum() / txn_values.sum()\nprint(f\'\\nTransactions above P90 (INR {p90:,.0f}):\')\nprint(f\'  Count:          {len(above_p90):,} ({len(above_p90)/len(txn_values)*100:.1f}% of volume)\')\nprint(f\'  Revenue share:  {revenue_share*100:.1f}% of total GMV\')\nprint(f\'  Avg txn value:  INR {above_p90.mean():,.0f}\')\n\n# Bonus: IQR\niqr = percentiles[2] - percentiles[0]  # P75 - P25\nprint(f\'\\nIQR (P75 - P25): INR {iqr:,.0f}\')\nprint(f\'This is the spread of the \'\'middle 50%\'\' of transactions — more robust than std for skewed data.\')',

    keyInsights: [
      'np.percentile(arr, [p1, p2, ...]) vectorises the computation — one call is faster and cleaner than calling it N times. The result is a numpy array you can zip with labels.',
      'Mean/Median ratio > 1.5 reliably indicates right-skew. A mean of 2x the median means the top tail is pulling the average up significantly — using mean as "typical transaction value" misleads stakeholders.',
      'The "10% of transactions = X% of revenue" framing is the Pareto analysis every fintech and e-commerce team runs. Know how to compute it: filter above percentile, sum, divide by total.',
      'For skewed financial data, always report P50 (median) as the typical value and P90/P95 for the tail. Reporting mean alone is a common analytics mistake that overstates typical transaction size.',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE28 — Resample + WoW Growth (pandas · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code28-pandas-resample-wow',
    title: 'Weekly Resampling and WoW Growth',
    subtitle: 'Python · pandas · resample · pct_change · sort order · Swiggy',
    track: 'python',
    difficulty: 'senior',
    isFree: false,
    tags: ['pandas', 'resample', 'pct_change', 'time series', 'WoW growth'],

    scenario: {
      company: 'Swiggy',
      context: 'You have daily order counts. The business wants weekly totals and week-over-week (WoW) growth. A common mistake is calling pct_change() on unsorted or unindexed data — the result is meaningless. Your job is to resample correctly, sort, compute WoW growth, and flag weeks with negative growth.',
      schema: [
        { table: 'Python variable already defined:', description: '', columns: [] },
        { table: 'daily_orders', description: 'DataFrame — one row per day, possibly unsorted', columns: ['date', 'order_count'] },
      ],
      task: 'Set date as index, resample to weekly sums, sort the index, compute WoW % change, and flag weeks where growth was negative. Print the full table.',
    },

    hints: [
      'set_index(\'date\') then resample(\'W\').sum() aggregates to week-ending Sundays',
      'Sort the index with sort_index() before pct_change() — never assume order after resample',
      'pct_change() * 100 gives % change; round to 1dp for display',
      'A boolean mask on the WoW column flags negative weeks for RCA prioritisation',
    ],

    partialCode: 'import pandas as pd\nimport numpy as np\n\nnp.random.seed(3)\n# Intentionally shuffled date order\ndates = pd.date_range(\'2024-01-01\', periods=84)  # 12 weeks\ncounts = (1000 + np.cumsum(np.random.normal(20, 40, 84))).clip(500).astype(int)\ndaily_orders = pd.DataFrame({\'date\': dates, \'order_count\': counts})\ndaily_orders = daily_orders.sample(frac=1, random_state=1)  # shuffle!\n\n# STEP 1: set date as index\ndaily_orders = ___\n\n# STEP 2: resample to weekly totals\nweekly = ___\n\n# STEP 3: sort index (critical before pct_change)\nweekly = ___\n\n# STEP 4: WoW growth %\nweekly[\'wow_growth_pct\'] = ___\n\n# STEP 5: flag negative growth weeks\nweekly[\'negative_growth\'] = ___\n\nprint(weekly.round(1).to_string())\nprint(f\'\\nWeeks with negative WoW growth: {weekly[\'negative_growth\'].sum()}\')',

    modelAnswer: 'import pandas as pd\nimport numpy as np\n\nnp.random.seed(3)\ndates = pd.date_range(\'2024-01-01\', periods=84)\ncounts = (1000 + np.cumsum(np.random.normal(20, 40, 84))).clip(500).astype(int)\ndaily_orders = pd.DataFrame({\'date\': dates, \'order_count\': counts})\ndaily_orders = daily_orders.sample(frac=1, random_state=1)\n\n# STEP 1\ndaily_orders = daily_orders.set_index(\'date\')\n\n# STEP 2\nweekly = daily_orders.resample(\'W\').sum()\n\n# STEP 3\nweekly = weekly.sort_index()\n\n# STEP 4\nweekly[\'wow_growth_pct\'] = weekly[\'order_count\'].pct_change() * 100\n\n# STEP 5\nweekly[\'negative_growth\'] = weekly[\'wow_growth_pct\'] < 0\n\nprint(weekly.round(1).to_string())\nneg_count = weekly[\'negative_growth\'].sum()\nprint(f\'\\nWeeks with negative WoW growth: {neg_count} / {len(weekly)-1} comparable weeks\')\n\n# Best and worst weeks\nbest  = weekly[\'wow_growth_pct\'].idxmax()\nworst = weekly[\'wow_growth_pct\'].idxmin()\nprint(f\'Best week:  {best.date()} at +{weekly.loc[best,  "wow_growth_pct"]:.1f}%\')\nprint(f\'Worst week: {worst.date()} at {weekly.loc[worst, "wow_growth_pct"]:.1f}%\')',

    keyInsights: [
      'pct_change() on unsorted data produces garbage — it computes change relative to the previous row in DataFrame order, not in chronological order. This is STF17 in the Spot the Flaw room. Sort before you pct_change. Always.',
      'resample(\'W\') aggregates to week-ending Sunday by default. Use resample(\'W-MON\') for Monday-ending weeks. Be explicit about the convention — different teams use different week boundaries.',
      'The first row after pct_change() will always be NaN — there\'s no prior week. Don\'t mistake this for missing data; it\'s expected and should be excluded from any summary stats.',
      'In interviews: after computing WoW, always identify the worst week and frame it as "this is the week that needs RCA." That moves the analysis from "here\'s the number" to "here\'s what to investigate."',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE29 — collections.Counter Frequency Analysis (Python · Analyst)
  // ─────────────────────────────────────────────
  {
    id: 'code29-collections-counter',
    title: 'Search Query Frequency Analysis',
    subtitle: 'Python · collections · Counter · Pareto · Flipkart',
    track: 'python',
    difficulty: 'analyst',
    isFree: false,
    tags: ['collections', 'Counter', 'frequency', 'Pareto', 'search analytics'],

    scenario: {
      company: 'Flipkart',
      context: 'The search team has a log of 50,000 raw search queries. They want to know: what are the top 20 queries by volume, and what fraction of total searches do the top 100 queries cover? This is the Pareto check — if 100 queries cover 60%+ of searches, optimising those 100 queries has outsized impact.',
      schema: [
        { table: 'Python variable already defined:', description: '', columns: [] },
        { table: 'queries', description: 'Python list of raw search strings (lowercased)', columns: [] },
      ],
      task: 'Use collections.Counter to count query frequency. Print the top 20. Compute what % of total searches the top 100 queries cover. Compute the Gini-style concentration: what\'s the smallest set of queries covering 50% of all searches?',
    },

    hints: [
      'Counter(queries) builds the frequency map in one line',
      '.most_common(n) returns top-n as [(query, count), ...] sorted by frequency',
      'sum of top-100 counts / total count = coverage fraction',
      'Iterate through most_common() accumulating count until cumulative sum >= 50% of total',
    ],

    partialCode: 'from collections import Counter\nimport numpy as np\n\nnp.random.seed(77)\n# Simulate Zipf-distributed search queries (realistic: few queries dominate)\nvocab = [\'phone\', \'laptop\', \'shoes\', \'shirt\', \'tv\', \'headphones\', \'watch\', \'bag\', \'kurta\',\n         \'charger\', \'case\', \'earphones\', \'dress\', \'jeans\', \'saree\', \'perfume\', \'camera\',\n         \'tablet\', \'keyboard\', \'mouse\'] + [f\'query_{i}\' for i in range(200)]\nzipf_weights = np.array([1/(i+1) for i in range(len(vocab))])\nzipf_weights /= zipf_weights.sum()\nqueries = list(np.random.choice(vocab, size=50000, p=zipf_weights))\n\n# STEP 1: build frequency counter\ncounter = ___\ntotal_searches = ___\nprint(f\'Total searches: {total_searches:,}  |  Unique queries: {len(counter):,}\')\n\n# STEP 2: top 20 queries\nprint(\'\\nTop 20 queries:\')\nprint(f\'{\"Query\":<20} {\"Count\":>8} {\"Share %\":>9}\')\nfor query, count in ___:\n    print(f\'{query:<20} {count:>8,} {count/total_searches*100:>8.2f}%\')\n\n# STEP 3: top-100 coverage\ntop_100_volume = ___\nprint(f\'\\nTop 100 queries cover {top_100_volume/total_searches*100:.1f}% of all searches\')\n\n# STEP 4: smallest set covering 50% of searches\ntarget = total_searches * 0.5\ncumulative = 0\nfor n_queries, (query, count) in enumerate(___, start=1):\n    cumulative += count\n    if cumulative >= target:\n        print(f\'Top {n_queries} queries cover 50% of all searches\')\n        break',

    modelAnswer: 'from collections import Counter\nimport numpy as np\n\nnp.random.seed(77)\nvocab = [\'phone\', \'laptop\', \'shoes\', \'shirt\', \'tv\', \'headphones\', \'watch\', \'bag\', \'kurta\',\n         \'charger\', \'case\', \'earphones\', \'dress\', \'jeans\', \'saree\', \'perfume\', \'camera\',\n         \'tablet\', \'keyboard\', \'mouse\'] + [f\'query_{i}\' for i in range(200)]\nzipf_weights = np.array([1/(i+1) for i in range(len(vocab))])\nzipf_weights /= zipf_weights.sum()\nqueries = list(np.random.choice(vocab, size=50000, p=zipf_weights))\n\n# STEP 1\ncounter = Counter(queries)\ntotal_searches = sum(counter.values())\nprint(f\'Total searches: {total_searches:,}  |  Unique queries: {len(counter):,}\')\n\n# STEP 2\nprint(\'\\nTop 20 queries:\')\nprint(f\'{\"Query\":<20} {\"Count\":>8} {\"Share %\":>9}\')\nfor query, count in counter.most_common(20):\n    print(f\'{query:<20} {count:>8,} {count/total_searches*100:>8.2f}%\')\n\n# STEP 3\ntop_100 = counter.most_common(100)\ntop_100_volume = sum(count for _, count in top_100)\nprint(f\'\\nTop 100 queries: {top_100_volume:,} searches = {top_100_volume/total_searches*100:.1f}% of total\')\n\n# STEP 4\ntarget = total_searches * 0.5\ncumulative = 0\nfor n_queries, (query, count) in enumerate(counter.most_common(), start=1):\n    cumulative += count\n    if cumulative >= target:\n        print(f\'Top {n_queries} queries cover 50% of all searches (Pareto threshold)\')\n        print(f\'That\'\'s {n_queries/len(counter)*100:.1f}% of the unique query vocabulary\')\n        break',

    keyInsights: [
      'Counter(iterable) is O(n) and returns a dict subclass. most_common(n) returns the top-n items in O(k log n) time. For frequency analysis on any list, this is the fastest path.',
      'sum(counter.values()) is the correct total — faster than len(original_list) if you\'ve already built the counter and don\'t have the original list anymore.',
      'The Pareto framing (top-X queries cover Y% of volume) is the standard way to prioritise search optimisation. If top-20 queries cover 40%, fix those 20 before scaling to the long tail.',
      'Counter works on any hashable: strings, tuples, event types, error codes. In interviews, reach for it any time you need frequency or mode — it\'s cleaner than a groupby on a list.',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE30 — pandas apply + User Classification (pandas · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code30-pandas-apply-classify',
    title: 'Classify Users by Behaviour',
    subtitle: 'Python · pandas · apply · np.select · user segmentation · Zepto',
    track: 'python',
    difficulty: 'senior',
    isFree: false,
    tags: ['pandas', 'apply', 'np.select', 'segmentation', 'user classification'],

    scenario: {
      company: 'Zepto',
      context: 'The retention team wants users segmented into four buckets based on order history: Champion (10+ orders, active in last 7 days), Loyal (5-9 orders, active in last 14 days), At-Risk (any orders, inactive 15-30 days), Dormant (inactive 30+ days). You need to build this classification efficiently — without a slow row-by-row loop.',
      schema: [
        { table: 'Python variable already defined:', description: '', columns: [] },
        { table: 'user_stats', description: 'DataFrame — one row per user, reference date is 2024-03-31', columns: ['user_id', 'total_orders', 'days_since_last_order'] },
      ],
      task: 'Classify each user using np.select() (vectorised, no apply loop). Compute the count and % of users in each segment. Print a summary.',
    },

    hints: [
      'np.select([cond1, cond2, cond3, cond4], [val1, val2, val3, val4], default=val5) evaluates conditions in order — first match wins',
      'Define conditions as boolean Series: (df.col > x) & (df.col < y)',
      'Order conditions from most restrictive to least — Champion before Loyal, or a Loyal user might match Champion criteria with a weaker check',
      'value_counts(normalize=True) gives segment shares directly',
    ],

    partialCode: 'import pandas as pd\nimport numpy as np\n\nnp.random.seed(13)\nn = 5000\nuser_stats = pd.DataFrame({\n    \'user_id\':              range(1, n+1),\n    \'total_orders\':        np.random.negative_binomial(3, 0.3, n).clip(1),\n    \'days_since_last_order\': np.random.exponential(20, n).astype(int).clip(0, 120),\n})\n\n# STEP 1: define conditions (order matters — most restrictive first)\ncond_champion = ___\ncond_loyal     = ___\ncond_at_risk   = ___\ncond_dormant   = ___\n\n# STEP 2: np.select — vectorised classification\nuser_stats[\'segment\'] = np.select(\n    condlist  = [cond_champion, cond_loyal, cond_at_risk, cond_dormant],\n    choicelist= [\'Champion\',    \'Loyal\',    \'At-Risk\',    \'Dormant\'],\n    default   = \'Dormant\',\n)\n\n# STEP 3: segment summary\nsummary = ___\nprint("User Segment Distribution")\nprint(summary)',

    modelAnswer: 'import pandas as pd\nimport numpy as np\n\nnp.random.seed(13)\nn = 5000\nuser_stats = pd.DataFrame({\n    \'user_id\':              range(1, n+1),\n    \'total_orders\':        np.random.negative_binomial(3, 0.3, n).clip(1),\n    \'days_since_last_order\': np.random.exponential(20, n).astype(int).clip(0, 120),\n})\n\n# STEP 1: conditions\ncond_champion = (user_stats[\'total_orders\'] >= 10) & (user_stats[\'days_since_last_order\'] <= 7)\ncond_loyal    = (user_stats[\'total_orders\'] >= 5)  & (user_stats[\'days_since_last_order\'] <= 14)\ncond_at_risk  = (user_stats[\'days_since_last_order\'] > 14) & (user_stats[\'days_since_last_order\'] <= 30)\ncond_dormant  = (user_stats[\'days_since_last_order\'] > 30)\n\n# STEP 2\nuser_stats[\'segment\'] = np.select(\n    condlist   = [cond_champion, cond_loyal, cond_at_risk, cond_dormant],\n    choicelist = [\'Champion\',    \'Loyal\',    \'At-Risk\',    \'Dormant\'],\n    default    = \'Dormant\',\n)\n\n# STEP 3\ncounts = user_stats[\'segment\'].value_counts()\nshares = user_stats[\'segment\'].value_counts(normalize=True) * 100\nsummary = pd.DataFrame({\'count\': counts, \'share_pct\': shares.round(1)})\nprint("User Segment Distribution")\nprint(summary)\nprint(f\'\\nTotal users: {n:,}\')\n\n# Avg orders per segment\nprint(\'\\nAvg orders by segment:\')\nprint(user_stats.groupby(\'segment\')[\'total_orders\'].mean().round(1).sort_values(ascending=False))',

    keyInsights: [
      'np.select() is the vectorised alternative to apply(lambda row: ...) with if/elif/else. On a 5,000-row DataFrame it is ~50x faster. On 5M rows the difference is minutes vs seconds.',
      'Condition order in np.select matters — first True condition wins. Define Champion before Loyal, or a 10-order user active in last 5 days could match the Loyal condition and get mis-classified.',
      'Boolean conditions on DataFrame columns return boolean Series — they can be combined with & (and) and | (or) but must be wrapped in parentheses because of Python operator precedence.',
      'In interview presentations, always follow a segmentation with "now what?" — Champion users get a loyalty program, At-Risk get a winback campaign. The classification is only useful if it drives action.',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE31 — Cohort LTV Calculation (pandas · Senior)
  // ─────────────────────────────────────────────
  {
    id: 'code31-pandas-cohort-ltv',
    title: 'Cohort LTV Calculation',
    subtitle: 'Python · pandas · cumulative revenue · LTV · Meesho',
    track: 'python',
    difficulty: 'senior',
    isFree: false,
    tags: ['pandas', 'LTV', 'cohort', 'cumulative revenue', 'customer value'],

    scenario: {
      company: 'Meesho',
      context: 'The growth team wants LTV (cumulative revenue per acquired user) by monthly acquisition cohort at 30, 60, and 90 days. This tells them which cohort quality is improving over time and whether payback period is improving. You have an orders table. Build the LTV cohort table.',
      schema: [
        { table: 'Python variable already defined:', description: '', columns: [] },
        { table: 'orders', description: 'DataFrame — one row per order', columns: ['user_id', 'first_order_date', 'order_date', 'order_value'] },
      ],
      task: 'For each acquisition cohort (month of first order), compute LTV30, LTV60, LTV90 = average cumulative revenue per user by day 30, 60, 90 after acquisition. Display as a pivot table.',
    },

    hints: [
      'days_since_acquisition = (order_date - first_order_date).dt.days',
      'Filter orders to days_since_acquisition <= 30/60/90 then groupby user_id + cohort to get cumulative spend',
      'Divide total spend by cohort size (unique users in that cohort) to get LTV per user',
      'Cohort size = orders.groupby(\'cohort_month\')[\'user_id\'].nunique()',
    ],

    partialCode: 'import pandas as pd\nimport numpy as np\n\nnp.random.seed(88)\nuser_ids  = np.arange(1, 2001)\ncohort_starts = pd.date_range(\'2023-10-01\', periods=6, freq=\'MS\')\nfirst_order_dates = np.repeat(cohort_starts, 2000//6)\norders_list = []\nfor uid, fod in zip(user_ids, first_order_dates):\n    n_orders = np.random.poisson(4)\n    for _ in range(max(1, n_orders)):\n        days_offset = int(np.random.exponential(25))\n        orders_list.append({\n            \'user_id\':          uid,\n            \'first_order_date\': fod,\n            \'order_date\':       fod + pd.Timedelta(days=days_offset),\n            \'order_value\':      round(float(np.random.lognormal(4.0, 0.7)), 2),\n        })\norders = pd.DataFrame(orders_list)\n\n# STEP 1: days since acquisition\norders[\'days_since_acq\'] = ___\n\n# STEP 2: acquisition cohort (month of first_order_date)\norders[\'cohort_month\'] = ___\n\n# STEP 3: cohort sizes\ncohort_sizes = ___\n\n# STEP 4: compute LTV at each horizon\ndef cohort_ltv(df, days_cutoff):\n    filtered = df[df[\'days_since_acq\'] <= days_cutoff]\n    spend    = filtered.groupby([\'cohort_month\', \'user_id\'])[\'order_value\'].sum().reset_index()\n    cohort_spend = spend.groupby(\'cohort_month\')[\'order_value\'].sum()\n    return (cohort_spend / cohort_sizes).round(2)\n\nltv = pd.DataFrame({\n    \'LTV_30d\':  cohort_ltv(orders, ___),\n    \'LTV_60d\':  cohort_ltv(orders, ___),\n    \'LTV_90d\':  cohort_ltv(orders, ___),\n})\nprint("Cohort LTV Table (INR per acquired user)")\nprint(ltv)',

    modelAnswer: 'import pandas as pd\nimport numpy as np\n\nnp.random.seed(88)\nuser_ids  = np.arange(1, 2001)\ncohort_starts = pd.date_range(\'2023-10-01\', periods=6, freq=\'MS\')\nfirst_order_dates = np.repeat(cohort_starts, 2000//6)\norders_list = []\nfor uid, fod in zip(user_ids, first_order_dates):\n    n_orders = np.random.poisson(4)\n    for _ in range(max(1, n_orders)):\n        days_offset = int(np.random.exponential(25))\n        orders_list.append({\n            \'user_id\':          uid,\n            \'first_order_date\': fod,\n            \'order_date\':       fod + pd.Timedelta(days=days_offset),\n            \'order_value\':      round(float(np.random.lognormal(4.0, 0.7)), 2),\n        })\norders = pd.DataFrame(orders_list)\n\n# STEP 1\norders[\'days_since_acq\'] = (orders[\'order_date\'] - orders[\'first_order_date\']).dt.days\n\n# STEP 2\norders[\'cohort_month\'] = orders[\'first_order_date\'].dt.to_period(\'M\')\n\n# STEP 3\ncohort_sizes = orders.groupby(\'cohort_month\')[\'user_id\'].nunique()\n\n# STEP 4\ndef cohort_ltv(df, days_cutoff):\n    filtered     = df[df[\'days_since_acq\'] <= days_cutoff]\n    spend        = filtered.groupby([\'cohort_month\', \'user_id\'])[\'order_value\'].sum().reset_index()\n    cohort_spend = spend.groupby(\'cohort_month\')[\'order_value\'].sum()\n    return (cohort_spend / cohort_sizes).round(2)\n\nltv = pd.DataFrame({\n    \'LTV_30d\': cohort_ltv(orders, 30),\n    \'LTV_60d\': cohort_ltv(orders, 60),\n    \'LTV_90d\': cohort_ltv(orders, 90),\n})\nprint("Cohort LTV Table (INR per acquired user)")\nprint(ltv)\nprint(f\'\\nLTV_90d / LTV_30d ratio (revenue multiple):\')\nprint((ltv[\'LTV_90d\'] / ltv[\'LTV_30d\']).round(2))',

    keyInsights: [
      'LTV = total cohort revenue / cohort size, NOT average order value. A user who places 5 orders contributes 5x revenue — average order value misses this. Always aggregate to user level first, then average across users.',
      'Use dt.to_period(\'M\') for cohort month keys — Period objects sort chronologically and display as "2024-01", which is cleaner than dt.strftime("%Y-%m") for pivot table row labels.',
      'The LTV_90d / LTV_30d ratio shows revenue acceleration — a ratio of 2.0 means users spend as much in days 31-90 as in the first 30 days. Declining ratios across cohorts signal engagement decay.',
      'In interviews: connect LTV to CAC. If LTV_90d = INR 800 and CAC = INR 300, payback period is somewhere under 90 days. The team needs LTV at a specific horizon to calculate this — that\'s why you compute at multiple horizons.',
    ],
  },

  // ─────────────────────────────────────────────
  // CODE32 — Data Cleaning + Validation (pandas · Analyst)
  // ─────────────────────────────────────────────
  {
    id: 'code32-pandas-data-cleaning',
    title: 'Clean and Validate a Messy Events DataFrame',
    subtitle: 'Python · pandas · data cleaning · NaN · deduplication · type casting',
    track: 'python',
    difficulty: 'analyst',
    isFree: false,
    tags: ['pandas', 'data cleaning', 'NaN', 'deduplication', 'validation'],

    scenario: {
      company: 'Generic analytics pipeline',
      context: 'A raw events DataFrame arrived from the data pipeline with known issues: duplicate events (same user + event + timestamp), NaN in critical columns, an event_value column stored as string instead of float, and some event_ts values that are clearly wrong (year 1970). Clean it and produce a validation report.',
      schema: [
        { table: 'Python variable already defined:', description: '', columns: [] },
        { table: 'raw_events', description: 'DataFrame — messy, one row per event', columns: ['event_id', 'user_id', 'event_name', 'event_ts', 'event_value', 'platform'] },
      ],
      task: 'Drop exact duplicate rows. Drop rows where user_id or event_name is null. Cast event_value to float (coerce errors to NaN, then fill with 0). Filter out events where event_ts year < 2020. Print a before/after validation report.',
    },

    hints: [
      'drop_duplicates() removes exact row duplicates across all columns',
      'dropna(subset=[\'user_id\', \'event_name\']) drops rows where any of those columns is null',
      'pd.to_numeric(col, errors=\'coerce\') converts strings to float, turning unparseable values into NaN',
      'df[df[\'event_ts\'].dt.year >= 2020] filters to valid timestamps after casting to datetime',
    ],

    partialCode: 'import pandas as pd\nimport numpy as np\n\nnp.random.seed(44)\nn = 5000\nraw_events = pd.DataFrame({\n    \'event_id\':   range(n),\n    \'user_id\':    np.where(np.random.rand(n) < 0.03, np.nan, np.random.randint(1, 1001, n)),\n    \'event_name\': np.where(np.random.rand(n) < 0.02, np.nan,\n                    np.random.choice([\'click\', \'view\', \'purchase\', \'add_to_cart\'], n)),\n    \'event_ts\':   pd.to_datetime(\n                    np.where(np.random.rand(n) < 0.01, \'1970-01-01\',\n                    pd.date_range(\'2024-01-01\', periods=n, freq=\'1min\').astype(str))),\n    \'event_value\': np.where(np.random.rand(n) < 0.04, \'bad_value\',\n                    np.random.lognormal(3, 1, n).round(2).astype(str)),\n    \'platform\':   np.random.choice([\'ios\', \'android\', \'web\'], n),\n})\n# Add 50 duplicate rows\nraw_events = pd.concat([raw_events, raw_events.sample(50, random_state=1)], ignore_index=True)\nn_raw = len(raw_events)\n\nprint(f\'Raw rows: {n_raw}\')\n\n# STEP 1: drop exact duplicates\ndf = ___\nprint(f\'After dedup: {len(df)} rows (removed {n_raw - len(df)})\')\n\n# STEP 2: drop rows with null user_id or event_name\ndf = ___\nprint(f\'After null drop: {len(df)} rows\')\n\n# STEP 3: cast event_value to float (coerce bad strings to NaN, then fill 0)\ndf[\'event_value\'] = ___\nprint(f\'event_value NaNs filled: {(df[\'event_value\'] == 0).sum()} rows set to 0\')\n\n# STEP 4: filter out 1970 timestamps\ndf = ___\nprint(f\'After timestamp filter: {len(df)} rows\')\n\n# Final report\nprint(f\'\\nCleaned: {len(df)} / {n_raw} rows retained ({len(df)/n_raw*100:.1f}%)\')\nprint(df.dtypes)',

    modelAnswer: 'import pandas as pd\nimport numpy as np\n\nnp.random.seed(44)\nn = 5000\nraw_events = pd.DataFrame({\n    \'event_id\':   range(n),\n    \'user_id\':    np.where(np.random.rand(n) < 0.03, np.nan, np.random.randint(1, 1001, n)),\n    \'event_name\': np.where(np.random.rand(n) < 0.02, np.nan,\n                    np.random.choice([\'click\', \'view\', \'purchase\', \'add_to_cart\'], n)),\n    \'event_ts\':   pd.to_datetime(\n                    np.where(np.random.rand(n) < 0.01, \'1970-01-01\',\n                    pd.date_range(\'2024-01-01\', periods=n, freq=\'1min\').astype(str))),\n    \'event_value\': np.where(np.random.rand(n) < 0.04, \'bad_value\',\n                    np.random.lognormal(3, 1, n).round(2).astype(str)),\n    \'platform\':   np.random.choice([\'ios\', \'android\', \'web\'], n),\n})\nraw_events = pd.concat([raw_events, raw_events.sample(50, random_state=1)], ignore_index=True)\nn_raw = len(raw_events)\nprint(f\'Raw rows: {n_raw}\')\n\n# STEP 1\ndf = raw_events.drop_duplicates()\nprint(f\'After dedup: {len(df)} rows (removed {n_raw - len(df)})\')\n\n# STEP 2\ndf = df.dropna(subset=[\'user_id\', \'event_name\'])\nprint(f\'After null drop: {len(df)} rows\')\n\n# STEP 3\ndf = df.copy()\ndf[\'event_value\'] = pd.to_numeric(df[\'event_value\'], errors=\'coerce\').fillna(0)\nbad_values = (df[\'event_value\'] == 0).sum()\nprint(f\'event_value NaNs filled: {bad_values} rows set to 0\')\n\n# STEP 4\ndf = df[df[\'event_ts\'].dt.year >= 2020]\nprint(f\'After timestamp filter: {len(df)} rows\')\n\nprint(f\'\\n=== Validation Report ===\')\nprint(f\'Raw rows:     {n_raw:,}\')\nprint(f\'Clean rows:   {len(df):,}\')\nprint(f\'Rows dropped: {n_raw - len(df):,} ({(n_raw-len(df))/n_raw*100:.1f}%)\')\nprint(f\'\\nFinal dtypes:\')\nprint(df[[ \'user_id\', \'event_name\', \'event_ts\', \'event_value\', \'platform\']].dtypes)',

    keyInsights: [
      'Always run a validation report — raw count in, clean count out, rows dropped by each step. This is what separates a professional pipeline from a one-off script. Reviewers notice.',
      'pd.to_numeric(col, errors=\'coerce\') is the right tool for columns that should be numeric but contain garbage strings. errors=\'coerce\' turns unparseable values into NaN silently — then you decide what to do (fill 0, fill median, drop).',
      'drop_duplicates() without specifying columns removes exact row duplicates across ALL columns. If you only want to deduplicate by key columns (e.g., user_id + event_ts), use drop_duplicates(subset=[\'user_id\', \'event_ts\']).',
      'df.copy() after chained filtering prevents SettingWithCopyWarning when you then assign to a column. It\'s a one-liner that saves confusing downstream bugs.',
    ],
  },

];

export const codeModulesById = Object.fromEntries(codeModules.map(m => [m.id, m]));
