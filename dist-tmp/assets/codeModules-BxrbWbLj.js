var e=[{id:`code01-funnel-sql`,title:`Write a Funnel Query`,subtitle:`SQL · Funnel Analysis · Conversion Rates`,track:`sql`,difficulty:`analyst`,isFree:!0,tags:[`funnel`,`conversion`,`window functions`],scenario:{company:`Crestline Home`,context:`Checkout conversion dropped 5pp overnight. You've confirmed it's real. Now the head of product wants a query that shows step-by-step funnel conversion rates for the 7 days before and after Tuesday's deployment — so she can see exactly where in the checkout flow users are dropping.`,schema:[{table:`funnel_events`,description:`One row per user per funnel step`,columns:[`user_id`,`session_id`,`event_name`,`event_ts`,`platform`]},{table:`—`,description:`event_name values: "viewed_cart", "viewed_payment", "submitted_payment", "order_confirmed"`,columns:[]}],task:`Write a SQL query that shows the conversion rate at each funnel step (users who reached step N / users who started checkout), split by pre- and post-deployment period.`},hints:[`Use COUNT(DISTINCT user_id) at each step — not COUNT(*), which double-counts session restarts`,`A CASE WHEN on event_ts creates the pre/post deployment flag`,`Funnel step rate = users at step N / users at step 1 (not step N / step N-1)`,`Use conditional aggregation: SUM(CASE WHEN event_name = '...' THEN 1 ELSE 0 END)`],partialCode:`SELECT
  deploy_period,
  COUNT(DISTINCT CASE WHEN event_name = 'viewed_cart' THEN user_id END) AS step1_cart,
  -- TODO: add step2 (viewed_payment), step3 (submitted_payment), step4 (order_confirmed)

  -- TODO: compute conversion rates from step1 to each step
  -- payment_page_rate = step2 / step1
  -- payment_submit_rate = step3 / step1
  -- order_confirmed_rate = step4 / step1

FROM (
  SELECT
    user_id,
    event_name,
    -- TODO: create deploy_period column: 'pre_deploy' vs 'post_deploy'
    -- Deployment was Tuesday 2024-01-16 at 3pm
    CASE
      WHEN event_ts < '2024-01-16 15:00:00' THEN ___
      ELSE ___
    END AS deploy_period
  FROM funnel_events
  WHERE event_ts BETWEEN '2024-01-09' AND '2024-01-23'  -- 7 days each side
) base
GROUP BY 1
ORDER BY deploy_period;`,modelAnswer:`SELECT
  deploy_period,

  -- Step counts (unique users who reached each step)
  COUNT(DISTINCT CASE WHEN event_name = 'viewed_cart'         THEN user_id END) AS step1_cart,
  COUNT(DISTINCT CASE WHEN event_name = 'viewed_payment'      THEN user_id END) AS step2_payment_page,
  COUNT(DISTINCT CASE WHEN event_name = 'submitted_payment'   THEN user_id END) AS step3_payment_submit,
  COUNT(DISTINCT CASE WHEN event_name = 'order_confirmed'     THEN user_id END) AS step4_confirmed,

  -- Conversion rates (each step / step 1 = overall funnel depth)
  ROUND(
    100.0 * COUNT(DISTINCT CASE WHEN event_name = 'viewed_payment'    THEN user_id END)
    / NULLIF(COUNT(DISTINCT CASE WHEN event_name = 'viewed_cart'      THEN user_id END), 0),
    1
  ) AS payment_page_rate_pct,

  ROUND(
    100.0 * COUNT(DISTINCT CASE WHEN event_name = 'submitted_payment' THEN user_id END)
    / NULLIF(COUNT(DISTINCT CASE WHEN event_name = 'viewed_cart'      THEN user_id END), 0),
    1
  ) AS payment_submit_rate_pct,

  ROUND(
    100.0 * COUNT(DISTINCT CASE WHEN event_name = 'order_confirmed'   THEN user_id END)
    / NULLIF(COUNT(DISTINCT CASE WHEN event_name = 'viewed_cart'      THEN user_id END), 0),
    1
  ) AS checkout_conversion_rate_pct

FROM (
  SELECT
    user_id,
    event_name,
    CASE
      WHEN event_ts < '2024-01-16 15:00:00' THEN 'pre_deploy'
      ELSE 'post_deploy'
    END AS deploy_period
  FROM funnel_events
  WHERE event_ts BETWEEN '2024-01-09' AND '2024-01-23'
) base

GROUP BY 1
ORDER BY deploy_period;`,keyInsights:[`COUNT(DISTINCT CASE WHEN event_name = '...' THEN user_id END) — this pattern counts unique users who reached a step in a single pass over the table, no subquery needed`,`Funnel rates use step1 as the denominator, not step N-1. This measures "what % of cart viewers completed checkout", which is more meaningful than step-to-step dropout rate`,`NULLIF prevents division-by-zero if a deploy_period bucket has no cart views`,`Expected output: payment_submit_rate_pct drops notably in post_deploy — confirming the drop is at the payment submission step, not at page view`]},{id:`code02-retention-sql`,title:`Build a Retention Cohort Table`,subtitle:`SQL · Cohort Analysis · Window Functions`,track:`sql`,difficulty:`analyst`,isFree:!0,tags:[`retention`,`cohort analysis`,`window functions`,`DATE_DIFF`],scenario:{company:`Orion · Consumer Mobile App`,context:`D7 retention fell 5pp for the cohort that received a new re-engagement push campaign. The PM wants a cohort table showing Day 1, Day 7, and Day 30 retention for install cohorts over the past 8 weeks — to see if the drop is recent or if it predates the campaign.`,schema:[{table:`users`,description:`One row per user`,columns:[`user_id`,`install_date`,`cohort_type`]},{table:`app_sessions`,description:`One row per session`,columns:[`user_id`,`session_date`]}],task:`Write a SQL query that produces a retention cohort table: one row per install week, with D1, D7, and D30 retention rates as columns.`},hints:[`A CTE for "install cohort" + a CTE for "return sessions" keeps things readable`,`Use DATE_DIFF(session_date, install_date, DAY) to compute days since install`,`D7 retention = users with any session on days 6-8 (±1 day tolerance is industry standard) / users who installed that week`,`Use a LEFT JOIN from cohorts to sessions so install weeks with 0 retention still appear`],partialCode:`WITH install_cohorts AS (
  -- Weekly install cohorts
  SELECT
    user_id,
    install_date,
    DATE_TRUNC('week', install_date) AS install_week
  FROM users
  WHERE install_date >= CURRENT_DATE - INTERVAL '56 days'  -- 8 weeks
),

return_events AS (
  SELECT
    ic.user_id,
    ic.install_week,
    DATE_DIFF(s.session_date, ic.install_date, DAY) AS days_since_install
  FROM install_cohorts ic
  -- TODO: join to app_sessions on user_id
  -- TODO: only include sessions after install date
),

cohort_retention AS (
  SELECT
    install_week,
    COUNT(DISTINCT user_id) AS cohort_size,

    -- TODO: count users retained on D1 (day 1 ± tolerance)
    COUNT(DISTINCT CASE WHEN days_since_install BETWEEN ___ AND ___ THEN user_id END) AS d1_retained,

    -- TODO: count D7 retained users (days 6-8)

    -- TODO: count D30 retained users (days 29-31)
  FROM return_events
  GROUP BY 1
)

SELECT
  install_week,
  cohort_size,
  d1_retained,
  -- TODO: compute D1, D7, D30 retention rates as percentages
FROM cohort_retention
ORDER BY install_week;`,modelAnswer:`WITH install_cohorts AS (
  SELECT
    user_id,
    install_date,
    DATE_TRUNC('week', install_date) AS install_week
  FROM users
  WHERE install_date >= CURRENT_DATE - INTERVAL '56 days'
),

return_events AS (
  -- Every session for each installed user, with days since install
  SELECT
    ic.user_id,
    ic.install_week,
    ic.install_date,
    DATE_DIFF(s.session_date, ic.install_date, DAY) AS days_since_install
  FROM install_cohorts ic
  LEFT JOIN app_sessions s
    ON ic.user_id = s.user_id
    AND s.session_date > ic.install_date  -- Exclude the install day itself
),

cohort_retention AS (
  SELECT
    install_week,
    COUNT(DISTINCT user_id)                                                     AS cohort_size,
    COUNT(DISTINCT CASE WHEN days_since_install BETWEEN 1  AND 2  THEN user_id END) AS d1_retained,
    COUNT(DISTINCT CASE WHEN days_since_install BETWEEN 6  AND 8  THEN user_id END) AS d7_retained,
    COUNT(DISTINCT CASE WHEN days_since_install BETWEEN 29 AND 31 THEN user_id END) AS d30_retained
  FROM return_events
  GROUP BY 1
)

SELECT
  install_week,
  cohort_size,
  d1_retained,
  d7_retained,
  d30_retained,

  ROUND(100.0 * d1_retained  / NULLIF(cohort_size, 0), 1) AS d1_retention_pct,
  ROUND(100.0 * d7_retained  / NULLIF(cohort_size, 0), 1) AS d7_retention_pct,
  ROUND(100.0 * d30_retained / NULLIF(cohort_size, 0), 1) AS d30_retention_pct

FROM cohort_retention
ORDER BY install_week;`,keyInsights:[`Day ±1 tolerance (days 6-8 for D7) is industry standard — many apps don't require users to open on exactly day 7, so a 3-day window avoids undercounting`,`LEFT JOIN from install_cohorts to app_sessions ensures cohorts with zero return events still appear in the output with NULL/0 retention`,`COUNT(DISTINCT user_id) in the CASE WHEN pattern counts each user once per retention bucket, even if they had multiple sessions in that window`,`This query produces the exact table the PM asked for — one row per install week, D1/D7/D30 as columns. You can now scan down the install_week column and see if the D7 drop started the week the campaign launched`]},{id:`code03-ab-test-python`,title:`Run an A/B Test Significance Check`,subtitle:`Python · scipy.stats · Confidence Intervals`,track:`python`,difficulty:`analyst`,isFree:!0,tags:[`A/B testing`,`scipy`,`confidence intervals`,`hypothesis testing`],scenario:{company:`Crestline Home · Checkout A/B Test`,context:`The new payment provider experiment ran for 14 days. You have the results: control (old provider) had 62.4% checkout conversion on 294,000 users. Treatment (new provider) had 63.8% conversion on 292,000 users. The PM asks: "Is this significant? What's the 95% CI on the lift?"`,schema:[{table:`Python variables already defined:`,description:``,columns:[]},{table:`—`,description:`control_users = 294000, control_conversions = 183456`,columns:[]},{table:`—`,description:`treatment_users = 292000, treatment_conversions = 186216`,columns:[]}],task:`Write Python code that computes: (1) conversion rates for both arms, (2) the absolute lift, (3) a two-proportion z-test p-value, and (4) a 95% confidence interval on the lift.`},hints:[`Use scipy.stats.proportions_ztest for the two-proportion z-test`,`The 95% CI on a proportion difference can be computed with the standard error: SE = sqrt(p1*(1-p1)/n1 + p2*(1-p2)/n2)`,`z* for 95% CI is 1.96`,`Report lift in both absolute (pp) and relative (%) terms — PMs understand both`],partialCode:`import numpy as np
from scipy import stats

# Given data
control_users       = 294_000
control_conversions = 183_456
treatment_users     = 292_000
treatment_conversions = 186_216

# 1. Compute conversion rates
control_rate   = ___
treatment_rate = ___
abs_lift_pp    = ___          # Absolute lift in percentage points
rel_lift_pct   = ___          # Relative lift as a %

print(f"Control:   {control_rate:.2%}")
print(f"Treatment: {treatment_rate:.2%}")
print(f"Lift:      {abs_lift_pp:+.2f}pp  ({rel_lift_pct:+.1f}% relative)")

# 2. Two-proportion z-test
# H0: treatment_rate == control_rate
stat, p_value = stats.proportions_ztest(
    count=___,    # [treatment_conversions, control_conversions]
    nobs=___,     # [treatment_users, control_users]
    alternative='two-sided'
)
print(f"\\np-value: {p_value:.4f}")
print(f"Significant at 0.05: {p_value < 0.05}")

# 3. 95% Confidence interval on the lift
z_star = 1.96
se = ___   # Standard error of the difference
ci_lower = ___
ci_upper = ___
print(f"\\n95% CI: [{ci_lower:+.2f}pp, {ci_upper:+.2f}pp]")`,modelAnswer:`import numpy as np
from scipy import stats

# Given data
control_users         = 294_000
control_conversions   = 183_456
treatment_users       = 292_000
treatment_conversions = 186_216

# 1. Conversion rates and lift
control_rate   = control_conversions   / control_users
treatment_rate = treatment_conversions / treatment_users
abs_lift_pp    = (treatment_rate - control_rate) * 100   # In percentage points
rel_lift_pct   = (treatment_rate - control_rate) / control_rate * 100

print(f"Control:   {control_rate:.2%}")
print(f"Treatment: {treatment_rate:.2%}")
print(f"Lift:      {abs_lift_pp:+.2f}pp  ({rel_lift_pct:+.1f}% relative)")

# 2. Two-proportion z-test
stat, p_value = stats.proportions_ztest(
    count=[treatment_conversions, control_conversions],
    nobs=[treatment_users, control_users],
    alternative='two-sided'
)
print(f"\\nZ-statistic: {stat:.3f}")
print(f"p-value:      {p_value:.4f}")
print(f"Significant at α=0.05: {p_value < 0.05}")

# 3. 95% Confidence interval on the absolute lift
z_star = 1.96
se = np.sqrt(
    (treatment_rate * (1 - treatment_rate) / treatment_users) +
    (control_rate   * (1 - control_rate)   / control_users)
)
ci_lower = abs_lift_pp - z_star * se * 100
ci_upper = abs_lift_pp + z_star * se * 100
print(f"\\n95% CI on lift: [{ci_lower:+.2f}pp, {ci_upper:+.2f}pp]")
print(f"\\nInterpretation: Treatment conversion is {abs_lift_pp:+.2f}pp higher.")
print(f"We're 95% confident the true lift is between {ci_lower:.2f}pp and {ci_upper:.2f}pp.")`,keyInsights:[`proportions_ztest takes count= (conversions) and nobs= (total users) as lists — [treatment, control] order`,`The SE formula sqrt(p1*(1-p1)/n1 + p2*(1-p2)/n2) uses each arm's own rate — not the pooled rate — for the CI (use pooled for the test statistic itself, which scipy handles internally)`,`Report absolute lift (pp) for product decisions, relative lift (%) for percentage context — PMs care about both`,`With n=~290k per arm, almost any real effect will be significant. Always check the CI width — a 95% CI of [+0.1pp, +2.7pp] is very different from [+1.2pp, +1.6pp] in business terms`]},{id:`code04-cuped-python`,title:`Implement CUPED Variance Reduction`,subtitle:`Python · Pandas · Pre-experiment Covariate`,track:`python`,difficulty:`senior`,isFree:!1,tags:[`CUPED`,`variance reduction`,`pandas`,`OLS regression`,`experimentation`],scenario:{company:`Vantage Analytics · B2B SaaS`,context:`Your A/B test on a new onboarding flow is underpowered — you only have 12,000 users and need 20,000 to reach 80% power at your expected effect size. The stats team suggests applying CUPED using each user's pre-experiment revenue (last 30 days before the experiment) as the covariate. You have the experiment data in a DataFrame.`,schema:[{table:`DataFrame: df`,description:`One row per user`,columns:[`user_id`,`variant`,`post_revenue`,`pre_revenue`]},{table:`—`,description:`variant: "control" | "treatment"`,columns:[]},{table:`—`,description:`post_revenue: revenue during the experiment period (outcome)`,columns:[]},{table:`—`,description:`pre_revenue: revenue in the 30 days before the experiment (covariate)`,columns:[]}],task:`Implement CUPED: regress post_revenue on pre_revenue to estimate theta, compute the CUPED-adjusted outcome, then run a t-test comparing adjusted treatment vs. control. Report the variance reduction achieved.`},hints:[`CUPED adjusted metric: Y_adj = Y - theta * (X - mean(X))`,`theta = Cov(Y, X) / Var(X) — this is the OLS regression coefficient of Y on X`,`Use numpy.cov or just fit a simple OLS with scipy.stats.linregress to get theta`,`Variance reduction = (1 - Var(Y_adj) / Var(Y)) * 100 — the higher this is, the more power you gained`],partialCode:`import pandas as pd
import numpy as np
from scipy import stats

# Assume df is already loaded with columns: user_id, variant, post_revenue, pre_revenue

# 1. Estimate theta — the regression coefficient of post_revenue on pre_revenue
#    theta = Cov(Y, X) / Var(X)
theta = ___

print(f"Theta (covariate coefficient): {theta:.4f}")

# 2. Compute the global mean of pre_revenue (used to center the covariate)
pre_mean = ___

# 3. Apply CUPED adjustment
#    Y_adj = Y - theta * (X - mean(X))
df['post_revenue_cuped'] = ___

# 4. Run t-test on CUPED-adjusted outcomes
control_adj   = df.loc[df['variant'] == 'control',   'post_revenue_cuped']
treatment_adj = df.loc[df['variant'] == 'treatment', 'post_revenue_cuped']

t_stat, p_value = stats.ttest_ind(treatment_adj, control_adj)
lift = treatment_adj.mean() - control_adj.mean()

print(f"\\nCUPED-adjusted lift: \${lift:.2f}")
print(f"p-value: {p_value:.4f}")

# 5. Report variance reduction
var_original = ___   # Variance of unadjusted post_revenue
var_adjusted = ___   # Variance of CUPED-adjusted post_revenue
variance_reduction = ___
print(f"\\nVariance reduction: {variance_reduction:.1f}%")
print(f"Equivalent sample size multiplier: {1 / (1 - variance_reduction/100):.2f}x")`,modelAnswer:`import pandas as pd
import numpy as np
from scipy import stats

# 1. Estimate theta using numpy covariance matrix
cov_matrix = np.cov(df['post_revenue'], df['pre_revenue'])
theta = cov_matrix[0, 1] / cov_matrix[1, 1]   # Cov(Y,X) / Var(X)

print(f"Theta (covariate coefficient): {theta:.4f}")

# 2. Global mean of pre_revenue (centering the covariate)
pre_mean = df['pre_revenue'].mean()

# 3. Apply CUPED adjustment: Y_adj = Y - theta * (X - mean(X))
df['post_revenue_cuped'] = df['post_revenue'] - theta * (df['pre_revenue'] - pre_mean)

# 4. T-test on CUPED-adjusted outcomes
control_adj   = df.loc[df['variant'] == 'control',   'post_revenue_cuped']
treatment_adj = df.loc[df['variant'] == 'treatment', 'post_revenue_cuped']

t_stat, p_value = stats.ttest_ind(treatment_adj, control_adj)
lift           = treatment_adj.mean() - control_adj.mean()

print(f"\\nCUPED-adjusted lift:  \${lift:.2f}")
print(f"T-statistic:          {t_stat:.3f}")
print(f"p-value:              {p_value:.4f}")

# 5. Variance reduction
var_original       = df['post_revenue'].var()
var_adjusted       = df['post_revenue_cuped'].var()
variance_reduction = (1 - var_adjusted / var_original) * 100

print(f"\\nOriginal variance:    {var_original:.2f}")
print(f"Adjusted variance:    {var_adjusted:.2f}")
print(f"Variance reduction:   {variance_reduction:.1f}%")

# Equivalent sample size multiplier: 1 / (1 - VR) tells you how much "more data" CUPED simulated
# A 50% variance reduction is equivalent to doubling sample size
equiv_multiplier = 1 / (1 - variance_reduction / 100)
print(f"Sample size multiplier: {equiv_multiplier:.2f}x  (CUPED simulated {equiv_multiplier:.2f}x your actual n)")`,keyInsights:[`theta = Cov(Y,X) / Var(X) is exactly the OLS coefficient from regressing post_revenue on pre_revenue — numpy.cov gives you the 2×2 covariance matrix, and [0,1]/[1,1] extracts it`,`Centering the covariate (X - mean(X)) ensures the adjustment doesn't shift the mean of Y — only reduces variance`,`A 50% variance reduction is equivalent to doubling your sample size. With high correlation between pre and post revenue (typical in SaaS: r ≈ 0.7-0.85), you often achieve 40-70% variance reduction`,`CUPED does not change the point estimate of the lift — only the standard error, making the same lift more statistically detectable`]},{id:`code05-srm-sql`,title:`Detect a Sample Ratio Mismatch`,subtitle:`SQL · Chi-squared Test · Experiment Integrity`,track:`sql`,difficulty:`senior`,isFree:!1,tags:[`SRM`,`chi-squared`,`experiment integrity`,`data quality`],scenario:{company:`Threadline · B2B SaaS`,context:`You're reviewing the assignment logs for a 50/50 experiment that ran for 14 days. The platform engineer tells you the split "looks roughly right." Before trusting any results, you need to run an SRM check — a chi-squared test to determine whether the assignment ratio is statistically consistent with the expected 50/50 split.`,schema:[{table:`experiment_assignments`,description:`One row per user assignment`,columns:[`user_id`,`experiment_id`,`variant`,`assigned_at`]}],task:`Write a SQL query that computes the observed assignment counts per variant, the expected counts (assuming perfect 50/50), and the chi-squared statistic. Flag whether an SRM is detected at α = 0.05 (chi-squared critical value: 3.841 for 1 degree of freedom).`},hints:[`Chi-squared = SUM((observed - expected)^2 / expected) across variants`,`Expected count = total_users * expected_proportion (0.5 for each arm in a 50/50 split)`,`You can compute this entirely in SQL using window functions for the total`,`Flag SRM: chi_sq > 3.841 means p < 0.05 — the assignment ratio is significantly non-random`],partialCode:`WITH assignment_counts AS (
  SELECT
    variant,
    COUNT(DISTINCT user_id) AS observed_count
  FROM experiment_assignments
  WHERE experiment_id = 'exp_onboarding_v2'
    AND assigned_at BETWEEN '2024-01-01' AND '2024-01-14'
  GROUP BY 1
),

totals AS (
  SELECT SUM(observed_count) AS total_users
  FROM assignment_counts
),

chi_sq_components AS (
  SELECT
    ac.variant,
    ac.observed_count,
    t.total_users,

    -- Expected count for a 50/50 split
    ___ AS expected_count,

    -- Chi-squared component: (O - E)^2 / E
    ___ AS chi_sq_component

  FROM assignment_counts ac
  CROSS JOIN totals t
)

SELECT
  -- Show per-variant breakdown
  variant,
  observed_count,
  ROUND(expected_count, 0)               AS expected_count,
  ROUND(100.0 * observed_count / SUM(observed_count) OVER (), 2) AS observed_pct,
  ROUND(chi_sq_component, 4)             AS chi_sq_component,

  -- Total chi-squared statistic
  ROUND(SUM(chi_sq_component) OVER (), 4) AS chi_sq_total,

  -- SRM flag: chi_sq > 3.841 => p < 0.05
  CASE WHEN SUM(chi_sq_component) OVER () > ___ THEN 'SRM DETECTED ⚠️' ELSE 'No SRM ✓' END AS srm_status

FROM chi_sq_components
ORDER BY variant;`,modelAnswer:`WITH assignment_counts AS (
  SELECT
    variant,
    COUNT(DISTINCT user_id) AS observed_count
  FROM experiment_assignments
  WHERE experiment_id = 'exp_onboarding_v2'
    AND assigned_at BETWEEN '2024-01-01' AND '2024-01-14'
  GROUP BY 1
),

totals AS (
  SELECT SUM(observed_count) AS total_users
  FROM assignment_counts
),

chi_sq_components AS (
  SELECT
    ac.variant,
    ac.observed_count,
    t.total_users,

    -- Expected count: total * 0.5 for a 50/50 split
    t.total_users * 0.5                                        AS expected_count,

    -- Chi-squared component per variant: (O - E)^2 / E
    POWER(ac.observed_count - t.total_users * 0.5, 2)
    / NULLIF(t.total_users * 0.5, 0)                          AS chi_sq_component

  FROM assignment_counts ac
  CROSS JOIN totals t
)

SELECT
  variant,
  observed_count,
  ROUND(expected_count, 0)                                       AS expected_count,
  ROUND(100.0 * observed_count / SUM(observed_count) OVER (), 2) AS observed_pct,
  ROUND(chi_sq_component, 4)                                     AS chi_sq_component,

  -- Sum across all variants using window function (no GROUP BY needed)
  ROUND(SUM(chi_sq_component) OVER (), 4)                       AS chi_sq_total,

  -- Critical value for df=1 at α=0.05 is 3.841
  CASE
    WHEN SUM(chi_sq_component) OVER () > 3.841
    THEN 'SRM DETECTED ⚠️  — do not trust results'
    ELSE 'No SRM ✓  — assignment looks clean'
  END AS srm_status

FROM chi_sq_components
ORDER BY variant;`,keyInsights:[`SUM(...) OVER () is a window function that computes the total chi-squared across all variant rows without collapsing them — you get one row per variant with the total displayed on each`,`POWER(O - E, 2) / E is the per-variant chi-squared component. Sum these across all k variants to get the test statistic`,`For a 2-variant (1 df) experiment, the chi-squared critical value at α=0.05 is 3.841. Any value above this means p < 0.05 — the assignment is statistically non-random`,`An SRM doesn't tell you what caused the imbalance — it tells you something went wrong in assignment (bots, caching, early stopping). You must pause the experiment and investigate before trusting any metric results`]},{id:`code06-mix-shift-sql`,title:`Decompose a Mix Shift`,subtitle:`SQL · Shift-Share Analysis · Business Decomposition`,track:`sql`,difficulty:`senior`,isFree:!1,tags:[`mix shift`,`shift-share`,`business decomposition`,`margin analysis`],scenario:{company:`Vantage Analytics · B2B SaaS`,context:`Overall gross margin compressed from 71% to 64% last quarter. The CFO asks: "How much of this is because our customer mix changed (more SMB, less enterprise) vs. each segment's margin actually getting worse?" This is a mix shift decomposition — separating mix effect from rate effect.`,schema:[{table:`segment_margin_history`,description:`Quarterly margin by segment`,columns:[`quarter`,`segment`,`revenue`,`gross_profit`]},{table:`—`,description:`quarter: "2024_Q2" | "2024_Q3". segment: "enterprise" | "smb"`,columns:[]}],task:`Write a SQL query that decomposes the 7pp margin compression into (a) mix effect — how much compression is explained by the shift toward SMB — and (b) rate effect — how much compression came from each segment's own margin changing.`},hints:[`Mix effect = change in segment weight × prior period margin rate (if the rate stayed constant, how much would mix alone move the needle?)`,`Rate effect = prior period weight × change in segment margin rate`,`Total change ≈ mix effect + rate effect (interaction term is small and usually omitted)`,`This is a shift-share decomposition — the same logic used in economic regional analysis`],partialCode:`WITH quarterly_margins AS (
  SELECT
    quarter,
    segment,
    revenue,
    gross_profit,
    ROUND(100.0 * gross_profit / NULLIF(revenue, 0), 2) AS margin_rate
  FROM segment_margin_history
),

-- Pivot to get Q2 and Q3 side by side per segment
pivoted AS (
  SELECT
    segment,
    MAX(CASE WHEN quarter = '2024_Q2' THEN revenue    END) AS q2_revenue,
    MAX(CASE WHEN quarter = '2024_Q2' THEN margin_rate END) AS q2_margin,
    MAX(CASE WHEN quarter = '2024_Q3' THEN revenue    END) AS q3_revenue,
    MAX(CASE WHEN quarter = '2024_Q3' THEN margin_rate END) AS q3_margin
  FROM quarterly_margins
  GROUP BY 1
),

-- Compute total revenue per period for weight calculation
totals AS (
  SELECT
    SUM(q2_revenue) AS total_q2_rev,
    SUM(q3_revenue) AS total_q3_rev
  FROM pivoted
),

decomposition AS (
  SELECT
    p.segment,
    p.q2_revenue, p.q2_margin,
    p.q3_revenue, p.q3_margin,

    -- Segment weight in each period
    ___ AS q2_weight,   -- q2_revenue / total_q2_rev
    ___ AS q3_weight,   -- q3_revenue / total_q3_rev

    -- Mix effect: (q3_weight - q2_weight) * q2_margin
    ___ AS mix_effect_pp,

    -- Rate effect: q2_weight * (q3_margin - q2_margin)
    ___ AS rate_effect_pp

  FROM pivoted p CROSS JOIN totals t
)

SELECT
  segment,
  ROUND(q2_weight * 100, 1) AS q2_weight_pct,
  ROUND(q3_weight * 100, 1) AS q3_weight_pct,
  ROUND(q2_margin, 1) AS q2_margin_pct,
  ROUND(q3_margin, 1) AS q3_margin_pct,
  ROUND(mix_effect_pp,  2) AS mix_effect_pp,
  ROUND(rate_effect_pp, 2) AS rate_effect_pp,
  ROUND(mix_effect_pp + rate_effect_pp, 2) AS total_explained_pp
FROM decomposition
ORDER BY segment;`,modelAnswer:`WITH quarterly_margins AS (
  SELECT
    quarter,
    segment,
    revenue,
    gross_profit,
    ROUND(100.0 * gross_profit / NULLIF(revenue, 0), 2) AS margin_rate
  FROM segment_margin_history
),

pivoted AS (
  SELECT
    segment,
    MAX(CASE WHEN quarter = '2024_Q2' THEN revenue    END) AS q2_revenue,
    MAX(CASE WHEN quarter = '2024_Q2' THEN margin_rate END) AS q2_margin,
    MAX(CASE WHEN quarter = '2024_Q3' THEN revenue    END) AS q3_revenue,
    MAX(CASE WHEN quarter = '2024_Q3' THEN margin_rate END) AS q3_margin
  FROM quarterly_margins
  GROUP BY 1
),

totals AS (
  SELECT
    SUM(q2_revenue) AS total_q2_rev,
    SUM(q3_revenue) AS total_q3_rev
  FROM pivoted
),

decomposition AS (
  SELECT
    p.segment,
    p.q2_revenue, p.q2_margin,
    p.q3_revenue, p.q3_margin,

    -- Segment weights
    p.q2_revenue / t.total_q2_rev  AS q2_weight,
    p.q3_revenue / t.total_q3_rev  AS q3_weight,

    -- Mix effect: weight shift × prior-period rate
    -- "If rates hadn't changed, how much would the mix shift move overall margin?"
    (p.q3_revenue / t.total_q3_rev - p.q2_revenue / t.total_q2_rev) * p.q2_margin
      AS mix_effect_pp,

    -- Rate effect: prior-period weight × rate change
    -- "If the mix hadn't changed, how much would the rate change move overall margin?"
    (p.q2_revenue / t.total_q2_rev) * (p.q3_margin - p.q2_margin)
      AS rate_effect_pp

  FROM pivoted p CROSS JOIN totals t
)

SELECT
  segment,
  ROUND(q2_weight * 100, 1)             AS q2_weight_pct,
  ROUND(q3_weight * 100, 1)             AS q3_weight_pct,
  ROUND(q2_margin, 1)                   AS q2_margin_pct,
  ROUND(q3_margin, 1)                   AS q3_margin_pct,
  ROUND(mix_effect_pp,  2)              AS mix_effect_pp,
  ROUND(rate_effect_pp, 2)              AS rate_effect_pp,
  ROUND(mix_effect_pp + rate_effect_pp, 2) AS total_explained_pp

FROM decomposition
ORDER BY segment;`,keyInsights:[`Mix effect = weight change × prior rate: answers "if segment margins had stayed flat, how much would the compositional shift alone change overall margin?"`,`Rate effect = prior weight × rate change: answers "if the mix hadn't changed, how much would each segment's own margin movement have caused?"`,`If mix_effect_pp for SMB is negative (larger SMB weight × lower SMB margin), that's the mix drag. If rate_effect_pp for SMB is also negative, SMB's margin got worse within the quarter too`,`Sum the mix_effect + rate_effect across both segments to reconstruct the total observed margin change — the two components should add up to approximately -7pp`]},{id:`code07-cuped-sql`,title:`Apply CUPED Variance Reduction in SQL`,subtitle:`SQL · CUPED · Pre-experiment Covariate · CTEs`,track:`sql`,difficulty:`senior`,isFree:!1,tags:[`CUPED`,`variance reduction`,`CTEs`,`experimentation`,`covariate adjustment`],scenario:{company:`Ardent Commerce`,context:`Ardent Commerce ran a two-week A/B test on a new recommendations widget. The head of experimentation flags that the test is slightly underpowered on revenue — there's a real effect, but the p-value is hovering around 0.07. She asks you to apply CUPED using last week's revenue (pre-experiment) as the covariate. You have the raw assignment and orders tables in the warehouse. Do the full CUPED adjustment entirely in SQL.`,schema:[{table:`experiment_assignments`,description:`One row per user, assigned at experiment start`,columns:[`user_id`,`variant`,`assigned_at`]},{table:`orders`,description:`One row per order`,columns:[`user_id`,`order_ts`,`revenue`]},{table:`—`,description:`Experiment ran 2024-01-15 to 2024-01-28. Pre-experiment window: 2024-01-08 to 2024-01-14.`,columns:[]}],task:`Write a SQL query that computes CUPED-adjusted revenue per user. Steps: (1) aggregate pre-experiment revenue per user as covariate X, (2) aggregate experiment-period revenue per user as outcome Y, (3) compute theta = Cov(Y, X) / Var(X) using SQL aggregate functions, (4) compute Y_cuped = Y - theta * (X - mean_X) for each user.`},hints:[`Cov(Y, X) in SQL: AVG(Y * X) - AVG(Y) * AVG(X) — the definitional formula works cleanly as window or subquery aggregates`,`Var(X) in SQL: AVG(X * X) - AVG(X) * AVG(X) — same pattern as covariance but both columns are X`,`theta is a single scalar — compute it in one CTE, then cross-join it into the per-user CTE so every row can use it`,`Users with zero pre-experiment revenue still get a CUPED adjustment (X=0, so the correction is -theta * (0 - mean_X) = +theta * mean_X)`],partialCode:`WITH pre_revenue AS (
  -- Covariate X: revenue per user in the week BEFORE the experiment
  SELECT
    ea.user_id,
    ea.variant,
    COALESCE(SUM(o.revenue), 0) AS pre_rev
  FROM experiment_assignments ea
  LEFT JOIN orders o
    ON ea.user_id = o.user_id
    AND o.order_ts BETWEEN '2024-01-08' AND '2024-01-14'
  GROUP BY 1, 2
),

exp_revenue AS (
  -- Outcome Y: revenue per user DURING the experiment
  SELECT
    ea.user_id,
    COALESCE(SUM(o.revenue), 0) AS exp_rev
  FROM experiment_assignments ea
  LEFT JOIN orders o
    ON ea.user_id = o.user_id
    -- TODO: filter order_ts to the experiment window (2024-01-15 to 2024-01-28)
  GROUP BY 1
),

combined AS (
  SELECT
    pr.user_id,
    pr.variant,
    pr.pre_rev   AS x,   -- covariate
    er.exp_rev   AS y    -- outcome
  FROM pre_revenue pr
  JOIN exp_revenue er ON pr.user_id = er.user_id
),

theta_calc AS (
  -- theta = Cov(Y, X) / Var(X)
  -- TODO: compute cov_yx = AVG(y * x) - AVG(y) * AVG(x)
  -- TODO: compute var_x  = AVG(x * x) - AVG(x) * AVG(x)
  -- TODO: theta = cov_yx / NULLIF(var_x, 0)
  SELECT
    ___ AS mean_x,
    ___ AS cov_yx,
    ___ AS var_x,
    ___ AS theta
  FROM combined
)

SELECT
  c.user_id,
  c.variant,
  c.y                                                        AS raw_revenue,
  -- TODO: compute cuped_revenue = y - theta * (x - mean_x)
  ___                                                        AS cuped_revenue,
  t.theta,
  t.mean_x
FROM combined c
CROSS JOIN theta_calc t
ORDER BY c.user_id;`,modelAnswer:`WITH pre_revenue AS (
  -- Covariate X: revenue per user in the week before the experiment
  SELECT
    ea.user_id,
    ea.variant,
    COALESCE(SUM(o.revenue), 0) AS pre_rev
  FROM experiment_assignments ea
  LEFT JOIN orders o
    ON ea.user_id = o.user_id
    AND o.order_ts BETWEEN '2024-01-08' AND '2024-01-14'
  GROUP BY 1, 2
),

exp_revenue AS (
  -- Outcome Y: revenue per user during the experiment period
  SELECT
    ea.user_id,
    COALESCE(SUM(o.revenue), 0) AS exp_rev
  FROM experiment_assignments ea
  LEFT JOIN orders o
    ON ea.user_id = o.user_id
    AND o.order_ts BETWEEN '2024-01-15' AND '2024-01-28'
  GROUP BY 1
),

combined AS (
  SELECT
    pr.user_id,
    pr.variant,
    pr.pre_rev  AS x,   -- covariate (pre-experiment revenue)
    er.exp_rev  AS y    -- outcome (experiment-period revenue)
  FROM pre_revenue pr
  JOIN exp_revenue er ON pr.user_id = er.user_id
),

theta_calc AS (
  -- Compute theta = Cov(Y, X) / Var(X) using the definitional formulas
  -- Cov(Y, X) = E[YX] - E[Y]*E[X]
  -- Var(X)    = E[X^2] - E[X]^2
  SELECT
    AVG(x)                                                         AS mean_x,
    AVG(y * x) - AVG(y) * AVG(x)                                  AS cov_yx,
    AVG(x * x) - AVG(x) * AVG(x)                                  AS var_x,
    (AVG(y * x) - AVG(y) * AVG(x))
      / NULLIF(AVG(x * x) - AVG(x) * AVG(x), 0)                  AS theta
  FROM combined
)

-- Final output: CUPED-adjusted revenue per user
-- Y_cuped = Y - theta * (X - mean_X)
SELECT
  c.user_id,
  c.variant,
  c.y                                                              AS raw_revenue,
  c.y - t.theta * (c.x - t.mean_x)                               AS cuped_revenue,
  c.x                                                              AS pre_revenue_covariate,
  ROUND(t.theta,  4)                                               AS theta,
  ROUND(t.mean_x, 4)                                               AS mean_pre_revenue

FROM combined c
CROSS JOIN theta_calc t
ORDER BY c.user_id;

-- To get per-variant summary after this, wrap in another CTE:
-- SELECT variant, AVG(cuped_revenue) AS mean_cuped_rev, VARIANCE(cuped_revenue) AS var_cuped
-- FROM (...above...) GROUP BY variant`,keyInsights:[`theta = Cov(Y,X) / Var(X) is the OLS regression coefficient of Y on X. In SQL, Cov(Y,X) = AVG(Y*X) - AVG(Y)*AVG(X) and Var(X) = AVG(X^2) - AVG(X)^2 — the definitional formula computes cleanly as aggregate expressions`,`CROSS JOIN theta_calc distributes the single scalar theta and mean_x to every row without a correlated subquery — this is the idiomatic SQL pattern for broadcasting a global statistic into per-row calculations`,`CUPED works best when pre-experiment and experiment-period revenue are highly correlated (r > 0.5). For e-commerce, weekly revenue typically has r ≈ 0.6–0.8, giving 35–65% variance reduction`,`Users with no pre-experiment orders get x=0. Their adjustment becomes -theta*(0 - mean_x) = +theta*mean_x, slightly shifting their adjusted revenue upward — this is correct behavior, not a bug`]},{id:`code08-bootstrap-python`,title:`Compute a Bootstrap Confidence Interval`,subtitle:`Python · Bootstrap · Skewed Distributions · Resampling`,track:`python`,difficulty:`senior`,isFree:!1,tags:[`bootstrap`,`confidence intervals`,`numpy`,`skewed distributions`,`A/B testing`],scenario:{company:`Loopwise`,context:`Loopwise ran an A/B test on a new onboarding flow for 21 days. The metric is 30-day revenue per user. The distribution is highly skewed: 74% of users pay nothing, and a small fraction drives the bulk of revenue. A standard normal-theory confidence interval assumes the sampling distribution of the mean is approximately normal — an assumption that breaks down with this kind of zero-inflated, heavy-tailed data at moderate sample sizes. The senior analyst asks you to compute a 95% bootstrap CI for the treatment effect (mean revenue difference) using 10,000 bootstrap samples.`,schema:[{table:`DataFrame: df`,description:`One row per user`,columns:[`user_id`,`variant`,`revenue_30d`]},{table:`—`,description:`variant: "control" | "treatment". revenue_30d: float, many zeros`,columns:[]}],task:`Write Python code that: (1) separates control and treatment revenue arrays, (2) runs 10,000 bootstrap iterations — sampling with replacement from each arm and recording the mean difference — (3) computes the 2.5th and 97.5th percentiles of the bootstrap delta distribution as the 95% CI, (4) prints the observed lift, the CI, and whether the CI excludes zero.`},hints:[`np.random.choice(arr, size=len(arr), replace=True) draws a bootstrap sample of the same size as the original`,`Compute the delta for each bootstrap iteration as: np.mean(boot_treatment) - np.mean(boot_control)`,`The percentile CI is np.percentile(deltas, [2.5, 97.5]) — no normal approximation needed`,`Set np.random.seed(42) for reproducibility before the loop`],partialCode:`import numpy as np
import pandas as pd

# Assume df is loaded with columns: user_id, variant, revenue_30d
np.random.seed(42)

# 1. Separate the two arms into numpy arrays
control_rev   = df.loc[df['variant'] == 'control',   'revenue_30d'].values
treatment_rev = df.loc[df['variant'] == 'treatment', 'revenue_30d'].values

# Observed lift (point estimate)
observed_lift = treatment_rev.mean() - control_rev.mean()
print(f"Observed lift: \${observed_lift:.4f}")
print(f"Control mean:   \${control_rev.mean():.4f}  (n={len(control_rev):,})")
print(f"Treatment mean: \${treatment_rev.mean():.4f}  (n={len(treatment_rev):,})")

# 2. Bootstrap loop — 10,000 iterations
n_boot = 10_000
boot_deltas = np.zeros(n_boot)

for i in range(n_boot):
    # TODO: draw a bootstrap sample from control_rev (same size, with replacement)
    boot_control   = ___

    # TODO: draw a bootstrap sample from treatment_rev (same size, with replacement)
    boot_treatment = ___

    # TODO: store the mean difference in boot_deltas[i]
    boot_deltas[i] = ___

# 3. Compute the 95% percentile CI
# TODO: use np.percentile to get the 2.5th and 97.5th percentiles
ci_lower, ci_upper = ___

print(f"\\n95% Bootstrap CI: [\${ci_lower:.4f}, \${ci_upper:.4f}]")
print(f"CI excludes zero (significant): {ci_lower > 0 or ci_upper < 0}")`,modelAnswer:`import numpy as np
import pandas as pd

# Assume df is loaded with columns: user_id, variant, revenue_30d
np.random.seed(42)

# 1. Separate arms
control_rev   = df.loc[df['variant'] == 'control',   'revenue_30d'].values
treatment_rev = df.loc[df['variant'] == 'treatment', 'revenue_30d'].values

observed_lift = treatment_rev.mean() - control_rev.mean()
print(f"Observed lift:  \${observed_lift:.4f}")
print(f"Control mean:   \${control_rev.mean():.4f}  (n={len(control_rev):,})")
print(f"Treatment mean: \${treatment_rev.mean():.4f}  (n={len(treatment_rev):,})")
print(f"\\nRevenue distribution (% zero-revenue users):")
print(f"  Control:   {(control_rev == 0).mean():.1%} zeros")
print(f"  Treatment: {(treatment_rev == 0).mean():.1%} zeros")

# 2. Bootstrap loop
n_boot = 10_000
boot_deltas = np.zeros(n_boot)

for i in range(n_boot):
    # Sample with replacement — same size as each arm's original n
    boot_control   = np.random.choice(control_rev,   size=len(control_rev),   replace=True)
    boot_treatment = np.random.choice(treatment_rev, size=len(treatment_rev), replace=True)
    boot_deltas[i] = boot_treatment.mean() - boot_control.mean()

# 3. Percentile CI — no normal approximation, reads directly from the bootstrap distribution
ci_lower, ci_upper = np.percentile(boot_deltas, [2.5, 97.5])

print(f"\\n95% Bootstrap CI: [\${ci_lower:.4f}, \${ci_upper:.4f}]")
print(f"Observed lift:    \${observed_lift:.4f}")
print(f"CI excludes zero (significant at 95%): {ci_lower > 0 or ci_upper < 0}")

# 4. Bootstrap distribution summary
print(f"\\nBootstrap delta distribution:")
print(f"  Mean of bootstrap deltas: \${boot_deltas.mean():.4f}  (should ≈ observed lift)")
print(f"  Std of bootstrap deltas:  \${boot_deltas.std():.4f}   (bootstrap SE)")
print(f"  Skewness of deltas: {((boot_deltas - boot_deltas.mean())**3).mean() / boot_deltas.std()**3:.3f}")`,keyInsights:[`The percentile bootstrap CI is non-parametric — it makes no assumption about the sampling distribution shape. This matters for zero-inflated revenue where the CLT convergence is slow at moderate sample sizes (n < 50k per arm)`,`np.random.choice(arr, size=len(arr), replace=True) is the canonical bootstrap sample. The key is replace=True and size equal to the original n — drawing fewer or more changes the variance estimate`,`10,000 iterations is the practical standard: it gives stable CI estimates (bootstrap SE of the CI endpoint is small) without being computationally expensive. For production use, 1,000 iterations is often enough; 100,000 adds precision but rarely changes decisions`,`The bootstrap delta distribution mean should closely match the observed lift — if it doesn't, check that you're sampling from the right arrays. The standard deviation of boot_deltas is the bootstrap standard error of the lift estimate`]},{id:`code09-funnel-viz-python`,title:`Visualize Funnel Conversion Rates`,subtitle:`Python · Matplotlib · Horizontal Bar Chart · Annotations`,track:`python`,difficulty:`analyst`,isFree:!1,tags:[`matplotlib`,`funnel`,`visualization`,`bar chart`,`annotations`],scenario:{company:`Crestline Home`,context:`The same checkout funnel from the SQL module. The PM has already run the SQL query and has pre-computed conversion rates for pre- vs post-deployment in a DataFrame. Now she needs a clean horizontal bar chart to drop into the all-hands deck — one that shows both periods side by side at each funnel step, with the delta annotated so the audience can immediately see where the drop happened. She wants it to look polished, not like a default matplotlib output.`,schema:[{table:`DataFrame: df`,description:`Pre-computed funnel conversion rates`,columns:[`step`,`pre_rate`,`post_rate`]},{table:`—`,description:`step: e.g. "Cart Viewed", "Payment Page", "Payment Submitted", "Order Confirmed"`,columns:[]},{table:`—`,description:`pre_rate, post_rate: conversion rate as a percentage float, e.g. 78.4`,columns:[]}],task:`Write Python/matplotlib code that produces a horizontal bar chart: y-axis = funnel steps, x-axis = conversion rate (%), two bars per step (pre-deploy in blue, post-deploy in orange), with a delta annotation (e.g. "▼ 3.2pp") displayed to the right of the longer bar for each step.`},hints:[`Use ax.barh() twice — once for pre_rate and once for post_rate. Offset the y positions by bar_height/2 to create the side-by-side layout`,`Enumerate the steps with np.arange(len(df)) for numeric y positions, then set ax.set_yticks and ax.set_yticklabels to label them`,`For each step, compute delta = post_rate - pre_rate. Use "▲" if positive, "▼" if negative`,`ax.text(x, y, label, va="center") places the annotation. Use max(pre_rate, post_rate) + 1 as the x position to place it just past the longer bar`],partialCode:`import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

# Sample data — replace with your actual df
import pandas as pd
df = pd.DataFrame({
    'step':      ['Cart Viewed', 'Payment Page', 'Payment Submitted', 'Order Confirmed'],
    'pre_rate':  [100.0, 78.4, 61.2, 54.7],
    'post_rate': [100.0, 77.1, 55.3, 48.9],
})

# Chart setup
fig, ax = plt.subplots(figsize=(10, 5))
bar_height = 0.35
y = np.arange(len(df))

# TODO: draw the pre_rate bars (blue, label='Pre-deploy')
# Hint: ax.barh(y + bar_height/2, df['pre_rate'], height=bar_height, ...)
bars_pre  = ___

# TODO: draw the post_rate bars (orange, label='Post-deploy')
bars_post = ___

# TODO: annotate each step with the delta
# For each i, compute delta = post - pre, choose arrow symbol, call ax.text(...)
for i, row in df.iterrows():
    delta = ___
    arrow = ___   # '▲' if delta > 0 else '▼'
    label = ___   # e.g. '▼ 3.2pp'
    x_pos = ___   # just past the longer of the two bars
    # TODO: call ax.text to place the annotation

# Axis labels and formatting
ax.set_xlabel('Conversion Rate (%)', fontsize=12)
ax.set_title('Checkout Funnel: Pre vs Post Deployment', fontsize=14, fontweight='bold')

# TODO: set y-tick positions and labels (use y and df['step'])
ax.set_yticks(___)
ax.set_yticklabels(___)

ax.set_xlim(0, 115)
ax.legend(handles=[bars_pre, bars_post], loc='lower right')
ax.spines[['top', 'right']].set_visible(False)

plt.tight_layout()
plt.show()`,modelAnswer:`import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import pandas as pd

# Sample data
df = pd.DataFrame({
    'step':      ['Cart Viewed', 'Payment Page', 'Payment Submitted', 'Order Confirmed'],
    'pre_rate':  [100.0, 78.4, 61.2, 54.7],
    'post_rate': [100.0, 77.1, 55.3, 48.9],
})

fig, ax = plt.subplots(figsize=(10, 5))
bar_height = 0.35
y = np.arange(len(df))

# Draw bars — offset by half bar_height to create side-by-side layout
bars_pre  = ax.barh(y + bar_height / 2, df['pre_rate'],  height=bar_height,
                    color='#4C72B0', label='Pre-deploy',  alpha=0.85)
bars_post = ax.barh(y - bar_height / 2, df['post_rate'], height=bar_height,
                    color='#DD8452', label='Post-deploy', alpha=0.85)

# Annotate each step with the delta
for i, row in df.iterrows():
    delta  = row['post_rate'] - row['pre_rate']
    arrow  = '▲' if delta > 0 else '▼'
    color  = '#2ca02c' if delta > 0 else '#d62728'
    label  = f'{arrow} {abs(delta):.1f}pp'
    x_pos  = max(row['pre_rate'], row['post_rate']) + 1.5
    ax.text(x_pos, y[i], label, va='center', ha='left',
            fontsize=10, color=color, fontweight='bold')

# Axis formatting
ax.set_xlabel('Conversion Rate (%)', fontsize=12)
ax.set_title('Checkout Funnel: Pre vs Post Deployment', fontsize=14, fontweight='bold')
ax.set_yticks(y)
ax.set_yticklabels(df['step'], fontsize=11)
ax.set_xlim(0, 120)
ax.axvline(x=100, color='grey', linestyle='--', linewidth=0.8, alpha=0.5)

# Legend
ax.legend(handles=[bars_pre, bars_post], loc='lower right', fontsize=10)
ax.spines[['top', 'right']].set_visible(False)
ax.tick_params(axis='x', labelsize=10)

plt.tight_layout()
plt.show()`,keyInsights:[`Horizontal bar charts are preferred over vertical for funnel steps because the step labels are long strings — horizontal layout gives them natural reading space on the y-axis without rotation or truncation`,`The side-by-side layout uses y + bar_height/2 for one series and y - bar_height/2 for the other. This centers the pair of bars on the tick mark. bar_height = 0.35 leaves a small gap between pairs, making the grouping visually clear`,`Delta annotations use ax.text() positioned at max(pre_rate, post_rate) + 1.5 so the label always clears the longer bar regardless of which period is higher. Color-coding green/red makes the direction immediately scannable`,`ax.spines[['top', 'right']].set_visible(False) is a single line that removes the two chart borders that add no information, giving the chart a cleaner, more presentation-ready look`]},{id:`code10-retention-heatmap`,title:`Build a Cohort Retention Heatmap`,subtitle:`Python · Seaborn · Cohort Analysis · Pivot Tables`,track:`python`,difficulty:`senior`,isFree:!1,tags:[`retention`,`cohort analysis`,`seaborn`,`heatmap`,`pivot_table`],scenario:{company:`Threadline · B2B SaaS`,context:`Threadline's growth team wants to understand long-term retention by signup cohort. They need a classic cohort retention heatmap: rows are weekly signup cohorts (e.g. "2024-W01"), columns are weeks since signup (W0 through W12), and each cell shows the percentage of that cohort still active in that week. The raw data is a long-format DataFrame with one row per user per week they were active. You need to pivot it into the cohort × week matrix, normalize by cohort size, and render it as a seaborn heatmap.`,schema:[{table:`DataFrame: df`,description:`One row per user per week they were active`,columns:[`user_id`,`signup_week`,`activity_week`]},{table:`—`,description:`signup_week: ISO week string like "2024-W01"`,columns:[]},{table:`—`,description:`activity_week: ISO week string like "2024-W03" (can be any week on or after signup_week)`,columns:[]}],task:`Write Python code that: (1) computes weeks_since_signup for each row, (2) counts distinct active users per cohort × week-offset cell, (3) divides by cohort size to get retention rates (0–100%), (4) renders the result as a seaborn heatmap with percentage annotations. Handle the NaN triangle (future cohorts have no data for later weeks) gracefully.`},hints:[`Convert signup_week and activity_week to actual dates using pd.to_datetime(df["signup_week"] + "-1", format="%G-W%V-%u") to get Monday of each ISO week`,`weeks_since_signup = (activity_week_dt - signup_week_dt).dt.days // 7`,`Use df.pivot_table(index="signup_week", columns="weeks_since_signup", values="user_id", aggfunc="nunique", fill_value=0) to get the activity counts matrix`,`Divide each row by cohort_sizes (a Series indexed by signup_week) using retention_matrix.div(cohort_sizes, axis=0) then multiply by 100`],partialCode:`import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

# Assume df is loaded with columns: user_id, signup_week, activity_week
# Example signup_week values: '2024-W01', '2024-W02', ...

# 1. Convert ISO week strings to dates (Monday of each week)
df['signup_week_dt']   = pd.to_datetime(df['signup_week']   + '-1', format='%G-W%V-%u')
df['activity_week_dt'] = pd.to_datetime(df['activity_week'] + '-1', format='%G-W%V-%u')

# 2. Compute weeks since signup
df['weeks_since_signup'] = (df['activity_week_dt'] - df['signup_week_dt']).dt.days // 7

# 3. Cohort sizes: distinct users per signup_week
cohort_sizes = df.groupby('signup_week')['user_id'].nunique()
print("Cohort sizes:")
print(cohort_sizes)

# 4. Pivot: rows = signup_week, columns = weeks_since_signup, values = distinct active users
# TODO: use pd.pivot_table with aggfunc='nunique' and fill_value=0
activity_matrix = ___

# 5. Normalize by cohort size to get retention rates (0–100%)
# TODO: divide activity_matrix by cohort_sizes (align on signup_week index) and multiply by 100
retention_matrix = ___

# 6. Keep only W0 through W12
retention_matrix = retention_matrix.loc[:, 0:12]

# 7. Render heatmap
fig, ax = plt.subplots(figsize=(14, 7))

# TODO: call sns.heatmap with annot=True, fmt='.0f', cmap='Blues_r'
# Hint: use mask=retention_matrix.isna() to leave the NaN triangle blank
___

ax.set_title('Weekly Cohort Retention Heatmap (%)', fontsize=14, fontweight='bold', pad=12)
ax.set_xlabel('Weeks Since Signup', fontsize=11)
ax.set_ylabel('Signup Week', fontsize=11)
plt.tight_layout()
plt.show()`,modelAnswer:`import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt

# Assume df is loaded with columns: user_id, signup_week, activity_week

# 1. Convert ISO week strings to Monday dates
df['signup_week_dt']   = pd.to_datetime(df['signup_week']   + '-1', format='%G-W%V-%u')
df['activity_week_dt'] = pd.to_datetime(df['activity_week'] + '-1', format='%G-W%V-%u')

# 2. Weeks since signup (integer offset)
df['weeks_since_signup'] = (df['activity_week_dt'] - df['signup_week_dt']).dt.days // 7

# 3. Cohort sizes — distinct users who signed up each week
cohort_sizes = df.groupby('signup_week')['user_id'].nunique()

# 4. Activity counts matrix: unique users active in each cohort × week-offset cell
activity_matrix = df.pivot_table(
    index='signup_week',
    columns='weeks_since_signup',
    values='user_id',
    aggfunc='nunique',
    fill_value=0
)

# 5. Retention rates: divide by cohort size, convert to percentage
#    .div(cohort_sizes, axis=0) aligns on the signup_week index
retention_matrix = activity_matrix.div(cohort_sizes, axis=0) * 100

# 6. Trim to W0–W12 (filter out negative offsets or beyond W12)
cols_to_keep = [c for c in range(0, 13) if c in retention_matrix.columns]
retention_matrix = retention_matrix[cols_to_keep]

# 7. Build the NaN mask: future cohorts have no data for later weeks
#    Any cell where the cohort hasn't had enough time is already 0 from fill_value.
#    Re-apply NaN for cells where activity was truly impossible (week offset > cohort age).
cohort_age = {
    week: (retention_matrix.columns.max() - i)
    for i, week in enumerate(retention_matrix.index)
}
mask = pd.DataFrame(False, index=retention_matrix.index, columns=retention_matrix.columns)
for i, week in enumerate(retention_matrix.index):
    max_observable_week = len(retention_matrix.index) - 1 - i
    for col in retention_matrix.columns:
        if col > max_observable_week:
            mask.loc[week, col] = True
            retention_matrix.loc[week, col] = np.nan

# 8. Heatmap
fig, ax = plt.subplots(figsize=(14, 7))

sns.heatmap(
    retention_matrix,
    annot=True,
    fmt='.0f',
    cmap='Blues_r',           # Reversed Blues: darker = better retention
    mask=mask,
    linewidths=0.4,
    linecolor='#e0e0e0',
    vmin=0,
    vmax=100,
    cbar_kws={'label': 'Retention %', 'shrink': 0.6},
    ax=ax
)

ax.set_title('Weekly Cohort Retention Heatmap (%)', fontsize=14, fontweight='bold', pad=12)
ax.set_xlabel('Weeks Since Signup', fontsize=11)
ax.set_ylabel('Signup Week', fontsize=11)
ax.tick_params(axis='both', labelsize=9)

plt.tight_layout()
plt.show()`,keyInsights:[`The pivot_table pattern (index=cohort, columns=week_offset, aggfunc='nunique') is the core of cohort analysis. fill_value=0 ensures cohorts with zero activity in a week show 0 not NaN — you separately apply NaN only to the future triangle where data is structurally impossible`,`Dividing by cohort_sizes with .div(cohort_sizes, axis=0) normalizes each row by its own cohort's starting size. Critically, this uses absolute cohort size as the denominator throughout — not the previous week's active users — so W8 retention is always "% of original cohort", not "% of W7 survivors"`,`The NaN triangle arises because recent cohorts simply haven't existed long enough to have W8, W9, ... data. Masking these cells (mask=True in sns.heatmap) leaves them blank in the heatmap, preventing them from being misread as zero retention`,`cmap='Blues_r' (reversed) maps high retention to dark blue and low retention to light/white. This is the convention for retention heatmaps — the visual gradient flows naturally from the dense dark diagonal (W0 = 100%) outward`]},{id:`code11-second-purchase-sql`,title:`Find Each User's Second Purchase Date`,subtitle:`SQL · Window Functions · ROW_NUMBER · CTEs`,track:`sql`,difficulty:`senior`,isFree:!1,tags:[`ROW_NUMBER`,`window functions`,`e-commerce`,`CTEs`,`self-join`],scenario:{company:`Crestline Home`,context:`You're in a product analytics interview at Crestline Home, an e-commerce company. The interviewer says: "We want to understand how quickly users come back after their first purchase — that gap is a strong signal of product-market fit in our category." You have an orders table with one row per order. Your goal is to find the second purchase date for each user and compute the number of days between their first and second purchase.`,schema:[{table:`orders`,description:`One row per order placed on the platform`,columns:[`order_id`,`user_id`,`created_at`,`order_total`]},{table:`—`,description:`created_at is a TIMESTAMP. A single user can have multiple rows (one per order).`,columns:[]},{table:`—`,description:`Only include users who have placed at least 2 orders. Users with exactly 1 order should be excluded from the result.`,columns:[]}],task:`Return one row per user showing: user_id, first_purchase_date, second_purchase_date, and days_to_second_purchase. Only include users with at least 2 orders.`},hints:[`Use ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) to rank each user's orders chronologically — rn=1 is first purchase, rn=2 is second`,`Compute this in a CTE, then filter for rn IN (1, 2) to keep only the first two orders per user`,`Use a second CTE or a CASE-based pivot to get first and second purchase on the same row per user — MAX(CASE WHEN rn=1 THEN ...) is a clean pattern`,`Use ROW_NUMBER not RANK — if two orders share the exact same timestamp, RANK would assign both rn=1 and skip rn=2, which would break the filter logic`],partialCode:`WITH ranked_orders AS (
  -- Rank each user's orders chronologically
  SELECT
    order_id,
    user_id,
    created_at,
    -- TODO: assign a row number per user ordered by created_at ascending
    ROW_NUMBER() OVER (___) AS rn
  FROM orders
),

first_two AS (
  -- Keep only the first and second order per user
  SELECT
    user_id,
    created_at,
    rn
  FROM ranked_orders
  -- TODO: filter to only rn = 1 or rn = 2
  WHERE ___
),

pivoted AS (
  -- Pivot to get first and second purchase on the same row
  SELECT
    user_id,
    -- TODO: use MAX(CASE WHEN ...) to get first_purchase_date
    MAX(CASE WHEN rn = 1 THEN created_at END) AS first_purchase_date,
    -- TODO: use MAX(CASE WHEN ...) to get second_purchase_date
    ___ AS second_purchase_date
  FROM first_two
  GROUP BY user_id
)

SELECT
  user_id,
  first_purchase_date,
  second_purchase_date,
  -- TODO: compute days_to_second_purchase (cast or use DATE_DIFF depending on dialect)
  ___ AS days_to_second_purchase
FROM pivoted
-- TODO: exclude users who never had a second purchase
WHERE ___
ORDER BY days_to_second_purchase ASC;`,modelAnswer:`WITH ranked_orders AS (
  -- Assign a sequential rank to each order per user, oldest first
  -- ROW_NUMBER (not RANK) ensures ties at the same timestamp get distinct ranks
  SELECT
    order_id,
    user_id,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) AS rn
  FROM orders
),

first_two AS (
  -- Retain only each user's 1st and 2nd order rows
  SELECT
    user_id,
    created_at,
    rn
  FROM ranked_orders
  WHERE rn IN (1, 2)
),

pivoted AS (
  -- Pivot: bring first and second purchase onto one row per user
  -- MAX() with CASE is the standard SQL pivot idiom — only one row per rn value
  -- will be non-NULL, so MAX() safely extracts it
  SELECT
    user_id,
    MAX(CASE WHEN rn = 1 THEN created_at END) AS first_purchase_date,
    MAX(CASE WHEN rn = 2 THEN created_at END) AS second_purchase_date
  FROM first_two
  GROUP BY user_id
)

SELECT
  user_id,
  DATE(first_purchase_date)  AS first_purchase_date,
  DATE(second_purchase_date) AS second_purchase_date,
  -- DATEDIFF or DATE_PART depending on SQL dialect; this version is ANSI-compatible
  DATE_PART('day', second_purchase_date - first_purchase_date)::INT
    AS days_to_second_purchase
FROM pivoted
WHERE second_purchase_date IS NOT NULL  -- exclude users with only 1 order
ORDER BY days_to_second_purchase ASC;`,keyInsights:[`ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) is the canonical approach: it assigns a per-user sequential rank that correctly handles any number of orders without needing self-joins or subquery correlated aggregations`,`The MAX(CASE WHEN rn=1 THEN ...) pivot pattern is more readable and performant than a self-join on user_id — a self-join doubles the scan and requires a join predicate that can produce duplicates if timestamps are equal`,`Using RANK() instead of ROW_NUMBER() is the classic mistake here: if two orders share the exact same created_at timestamp, RANK assigns rn=1 to both and skips rn=2, so the WHERE rn=2 filter returns nothing for that user`,`In the interview, mention that you'd also check for duplicate order_id values before running this — if the orders table has duplication bugs, ROW_NUMBER gives an arbitrary "second order" that may actually be the same logical purchase`]},{id:`code12-rolling-3month-retention-sql`,title:`Compute Rolling 3-Month Consecutive Retention`,subtitle:`SQL · Rolling Retention · DATE_TRUNC · Window Functions`,track:`sql`,difficulty:`senior`,isFree:!1,tags:[`retention`,`DATE_TRUNC`,`rolling window`,`CTEs`,`growth analytics`],scenario:{company:`Spark`,context:`You're interviewing at Spark, a social app with 12M daily active users. The interviewer says: "Our VP of Growth wants a metric that catches users who are genuinely habitual — not just people who spiked in one month. She wants to see how many users were active in three consecutive months." You need to write a query showing, for each month in 2024, the count of users active in that month AND each of the two prior months — a rolling 3-month consecutive retention count.`,schema:[{table:`user_activity`,description:`One row per user per day they performed any action in the app`,columns:[`user_id`,`activity_date`,`activity_type`]},{table:`users`,description:`One row per registered user`,columns:[`user_id`,`signup_date`,`country`]},{table:`—`,description:`activity_date is a DATE column. There can be multiple rows per user per day (different activity_type values).`,columns:[]}],task:`For each month in 2024 (starting from March, since you need 2 prior months), return the month and the count of distinct users who were active in that month, the prior month, AND the month before that — all three consecutive months.`},hints:[`Use DATE_TRUNC('month', activity_date) to collapse daily activity into monthly buckets, then DISTINCT on user_id + month to get one row per user per active month`,`Self-join the monthly active users table three times (or use a LAG-based approach) to enforce that the same user appears in month M, month M-1, and month M-2`,`The self-join approach is most readable: alias the monthly CTE as m0, m1, m2; join on user_id with month conditions m1.month = m0.month - interval '1 month' etc.`,`A common mistake is using BETWEEN on the activity date — that checks activity within a range, not activity in all 3 individual months. A user active only in January and March would pass a BETWEEN check but should not count as 3-month consecutive.`],partialCode:`WITH monthly_active AS (
  -- Collapse to one row per user per calendar month they were active
  -- Use DISTINCT to de-duplicate multiple activity events in the same month
  SELECT DISTINCT
    user_id,
    -- TODO: truncate activity_date to month granularity
    DATE_TRUNC('month', activity_date) AS activity_month
  FROM user_activity
  WHERE activity_date >= '2024-01-01'
    AND activity_date <  '2025-01-01'
),

three_month_active AS (
  -- For each month M, find users active in M, M-1, and M-2
  -- Self-join the CTE three times on user_id with offset month conditions
  SELECT
    m0.activity_month AS month,
    m0.user_id
  FROM monthly_active m0
  -- TODO: join monthly_active m1 on same user_id, one month earlier
  JOIN monthly_active m1
    ON m1.user_id = m0.user_id
    AND m1.activity_month = ___   -- m0's month minus 1 month
  -- TODO: join monthly_active m2 on same user_id, two months earlier
  JOIN monthly_active m2
    ON m2.user_id = m0.user_id
    AND m2.activity_month = ___   -- m0's month minus 2 months
)

SELECT
  month,
  -- TODO: count distinct users who appear in all three months
  COUNT(DISTINCT user_id) AS consecutive_3month_users
FROM three_month_active
-- Limit to months starting from March 2024 (first month with 2 prior months available)
WHERE month >= '2024-03-01'
GROUP BY 1
ORDER BY 1;`,modelAnswer:`WITH monthly_active AS (
  -- One row per user per calendar month they were active
  -- DISTINCT collapses multiple events on the same day/month to a single presence signal
  SELECT DISTINCT
    user_id,
    DATE_TRUNC('month', activity_date) AS activity_month
  FROM user_activity
  WHERE activity_date >= '2024-01-01'
    AND activity_date <  '2025-01-01'
),

three_month_active AS (
  -- Enforce consecutive 3-month presence via self-joins
  -- m0 = target month, m1 = one month prior, m2 = two months prior
  -- A user must have a row in ALL THREE months to appear in the result
  SELECT
    m0.activity_month AS month,
    m0.user_id
  FROM monthly_active m0
  JOIN monthly_active m1
    ON  m1.user_id       = m0.user_id
    AND m1.activity_month = m0.activity_month - INTERVAL '1 month'
  JOIN monthly_active m2
    ON  m2.user_id       = m0.user_id
    AND m2.activity_month = m0.activity_month - INTERVAL '2 months'
)

SELECT
  TO_CHAR(month, 'YYYY-MM')             AS month,
  COUNT(DISTINCT user_id)               AS consecutive_3month_users
FROM three_month_active
WHERE month >= '2024-03-01'  -- March is the first month with 2 full prior months in 2024
GROUP BY 1
ORDER BY 1;`,keyInsights:[`The self-join approach (m0, m1, m2 all referencing the same monthly_active CTE) is more explicit and less error-prone than using LAG() — it directly encodes "user must exist in month M AND M-1 AND M-2" as three independent join conditions`,`DATE_TRUNC('month', activity_date) collapses the daily grain to monthly, enabling the month arithmetic (- INTERVAL '1 month'). Operating on the raw date column with BETWEEN would check presence in a date range, not presence in all three individual months`,`The critical mistake is using BETWEEN activity_date AND activity_date - 90: this would include a user active in January and March but not February — a "zombie" user who appears retained but actually lapsed. The self-join enforces each month independently.`,`In the interview, distinguish this from cohort retention: rolling 3-month retention asks "who is habitually active right now?" whereas cohort retention asks "of users who joined in month X, how many are still around in month X+N?" — different questions, different business uses`]},{id:`code13-longest-login-streak-sql`,title:`Find Each User's Longest Login Streak`,subtitle:`SQL · Gaps and Islands · ROW_NUMBER · Date Arithmetic`,track:`sql`,difficulty:`senior`,isFree:!1,tags:[`gaps and islands`,`ROW_NUMBER`,`consecutive dates`,`CTEs`,`window functions`],scenario:{company:`Prism`,context:`You're interviewing at Prism, a content platform. The interviewer says: "We want to reward power users — specifically, users with the longest streaks of consecutive daily logins. Can you write a query that finds each user's longest streak?" The logins table has already been de-duplicated: there is at most one row per user per day. You need to find the length of each user's longest consecutive daily login streak, along with the start and end dates of that streak.`,schema:[{table:`logins`,description:`One row per user per day they logged in. Already de-duplicated — no duplicate (user_id, login_date) rows.`,columns:[`user_id`,`login_date`]},{table:`—`,description:`login_date is a DATE column. Consecutive means login_date and login_date + 1 are both present — no gaps.`,columns:[]}],task:`Return one row per user showing: user_id, longest_streak (number of days), streak_start (DATE), streak_end (DATE). If a user has multiple streaks of equal maximum length, return the earliest one.`},hints:[`The classic "gaps and islands" trick: ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) gives a sequential integer rn. Then login_date - rn gives the same date value for all consecutive dates in a streak — that value is the "island key".`,`Walk through an example: logins on days 1,2,3,5,6 get rn=1,2,3,4,5. Day-rn = 0,0,0,1,1. Days 1-3 share island key 0; days 5-6 share island key 1. Each unique (user_id, island_key) pair is one streak.`,`Group by (user_id, island_key) to get streak_start = MIN(login_date), streak_end = MAX(login_date), streak_length = COUNT(*)`,`After computing all streaks, use RANK() OVER (PARTITION BY user_id ORDER BY streak_length DESC, streak_start ASC) to pick the longest (earliest if tied) streak per user`],partialCode:`WITH numbered_logins AS (
  -- Assign a sequential row number per user, ordered by login date
  SELECT
    user_id,
    login_date,
    -- TODO: ROW_NUMBER() partitioned by user_id, ordered by login_date
    ROW_NUMBER() OVER (___) AS rn
  FROM logins
),

islands AS (
  -- The gaps-and-islands trick:
  -- login_date - rn yields the same "island key" for all consecutive dates
  -- because consecutive dates increment login_date by 1 AND rn by 1 simultaneously
  SELECT
    user_id,
    login_date,
    -- TODO: compute island_key = login_date - rn (use INTERVAL or integer cast depending on dialect)
    (login_date - rn * INTERVAL '1 day')::DATE AS island_key
  FROM numbered_logins
),

streaks AS (
  -- Aggregate each contiguous island into a streak with start, end, and length
  SELECT
    user_id,
    island_key,
    MIN(login_date)  AS streak_start,
    MAX(login_date)  AS streak_end,
    -- TODO: count the number of days in this streak
    COUNT(*)         AS streak_length
  FROM islands
  GROUP BY user_id, island_key
),

ranked_streaks AS (
  -- Rank streaks per user: longest first, earliest start as tiebreaker
  SELECT
    user_id,
    streak_start,
    streak_end,
    streak_length,
    -- TODO: RANK() to pick the longest streak per user
    RANK() OVER (PARTITION BY user_id ORDER BY ___ DESC, ___ ASC) AS rnk
  FROM streaks
)

SELECT
  user_id,
  streak_length   AS longest_streak,
  streak_start,
  streak_end
FROM ranked_streaks
WHERE rnk = 1
ORDER BY longest_streak DESC, user_id;`,modelAnswer:`WITH numbered_logins AS (
  -- Sequential row number per user ordered by login date
  -- This is the setup for the gaps-and-islands date subtraction trick
  SELECT
    user_id,
    login_date,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date ASC) AS rn
  FROM logins
),

islands AS (
  -- Key insight: for consecutive dates, login_date and rn both increase by 1 each row,
  -- so (login_date - rn) stays constant within a streak — it is the "island key".
  -- Example: logins on Jan 1,2,3 get rn=1,2,3. Jan1-1=Dec31, Jan2-2=Dec31, Jan3-3=Dec31.
  -- Same island key. A gap on Jan 4 (rn=4 next time user appears on Jan 5) gives Jan5-4=Jan1 (different key).
  SELECT
    user_id,
    login_date,
    (login_date - (rn - 1) * INTERVAL '1 day')::DATE AS island_key
    -- Subtract (rn-1) to anchor the key to the streak's first date — a cosmetic choice; rn works equally well
  FROM numbered_logins
),

streaks AS (
  -- Aggregate each island: min date = start, max date = end, count = streak length
  SELECT
    user_id,
    MIN(login_date)  AS streak_start,
    MAX(login_date)  AS streak_end,
    COUNT(*)         AS streak_length
  FROM islands
  GROUP BY user_id, island_key
),

ranked_streaks AS (
  -- Pick the longest streak per user; use streak_start ASC as tiebreaker for ties
  SELECT
    user_id,
    streak_start,
    streak_end,
    streak_length,
    RANK() OVER (
      PARTITION BY user_id
      ORDER BY streak_length DESC, streak_start ASC
    ) AS rnk
  FROM streaks
)

SELECT
  user_id,
  streak_length  AS longest_streak,
  streak_start,
  streak_end
FROM ranked_streaks
WHERE rnk = 1
ORDER BY longest_streak DESC, user_id;`,keyInsights:[`The date minus row_number trick works because consecutive calendar dates and sequential row numbers both increase by exactly 1 per step — their difference is constant within a streak and changes at every gap. This is the expected elegant solution; any other approach is significantly more complex.`,`Grouping by (user_id, island_key) with MIN/MAX/COUNT collapses each streak island into a single summary row in one aggregation step — no recursion, no self-join, no looping. The entire gaps-and-islands problem reduces to a two-step CTE.`,`Using LAG() to detect breaks (WHERE login_date != LAG(login_date) + 1) finds gap boundaries but does not directly give streak lengths — you then need a cumulative sum to assign group IDs, which is more code and harder to explain clearly in an interview.`,`Walk through the arithmetic explicitly in the interview: "If I log in Monday, Tuesday, Wednesday — row numbers 1, 2, 3 — then Monday minus 1 day, Tuesday minus 2 days, Wednesday minus 3 days all equal the same date. That common date is my streak identifier." Interviewers want to see that you understand why it works, not just that you know the trick.`]},{id:`code14-nday-retention-cohort-sql`,title:`Build a Day-1 / Day-7 / Day-30 Retention Cohort Table`,subtitle:`SQL · Cohort Retention · DATE_TRUNC · LEFT JOIN · Pivoting`,track:`sql`,difficulty:`senior`,isFree:!1,tags:[`cohort analysis`,`retention`,`LEFT JOIN`,`DATE_TRUNC`,`fintech`],scenario:{company:`Volta`,context:`You're interviewing at Volta, a fintech app. The interviewer says: "Our growth team tracks Day 1, Day 7, and Day 30 retention as key health metrics. Can you write a query that builds the full retention table broken out by weekly signup cohort for Q1 2024?" Each cell in the table should show the percentage of users from that signup week who had a session on exactly Day N after signup — not within N days, but on that specific day.`,schema:[{table:`users`,description:`One row per registered user`,columns:[`user_id`,`signup_date`]},{table:`sessions`,description:`One row per app session`,columns:[`user_id`,`session_date`]},{table:`—`,description:`signup_date and session_date are DATE columns. Q1 2024 = Jan 1 through Mar 31, 2024.`,columns:[]},{table:`—`,description:`Day 1 = signup_date + 1, Day 7 = signup_date + 7, Day 30 = signup_date + 30. "Exactly on that day" — not within a window.`,columns:[]}],task:`Return one row per weekly signup cohort (signup week, cohort_size, day_1_retention_pct, day_7_retention_pct, day_30_retention_pct). Only include Q1 2024 cohorts.`},hints:[`Use DATE_TRUNC('week', signup_date) to bucket users into weekly cohorts. Cohort size = COUNT(DISTINCT user_id) per cohort.`,`For each retention day, LEFT JOIN the sessions table filtered to exactly session_date = signup_date + N (use INTERVAL or integer addition depending on dialect).`,`LEFT JOIN (not INNER JOIN) is essential — users who did not return on Day N should count as 0 in the denominator, not be excluded from the cohort entirely.`,`Divide retained users by cohort size using NULLIF to avoid division by zero: ROUND(100.0 * COUNT(DISTINCT s1.user_id) / NULLIF(COUNT(DISTINCT u.user_id), 0), 1).`],partialCode:`WITH cohorts AS (
  -- Assign each user to their weekly signup cohort
  -- Cohort key = Monday of their signup week
  SELECT
    user_id,
    signup_date,
    -- TODO: truncate signup_date to the week level
    DATE_TRUNC('week', signup_date)::DATE AS signup_week
  FROM users
  WHERE signup_date >= '2024-01-01'
    AND signup_date <  '2024-04-01'  -- Q1 2024 only
)

SELECT
  c.signup_week,
  COUNT(DISTINCT c.user_id)                                           AS cohort_size,

  -- Day 1 retention: users who had a session exactly on signup_date + 1
  ROUND(
    100.0 * COUNT(DISTINCT s1.user_id)
      / NULLIF(COUNT(DISTINCT c.user_id), 0),
    1
  )                                                                   AS day_1_retention_pct,

  -- TODO: Day 7 retention (same pattern, session_date = signup_date + 7)
  ROUND(
    100.0 * COUNT(DISTINCT ___)
      / NULLIF(COUNT(DISTINCT c.user_id), 0),
    1
  )                                                                   AS day_7_retention_pct,

  -- TODO: Day 30 retention (session_date = signup_date + 30)
  ___                                                                 AS day_30_retention_pct

FROM cohorts c

-- LEFT JOIN for Day 1: only match sessions on exactly signup_date + 1
LEFT JOIN sessions s1
  ON s1.user_id      = c.user_id
  -- TODO: add the date condition for Day 1
  AND s1.session_date = ___

-- TODO: LEFT JOIN sessions s7 for Day 7 retention
___

-- TODO: LEFT JOIN sessions s30 for Day 30 retention
___

GROUP BY 1
ORDER BY 1;`,modelAnswer:`WITH cohorts AS (
  -- Assign each Q1 2024 user to their Monday-anchored weekly signup cohort
  SELECT
    user_id,
    signup_date,
    DATE_TRUNC('week', signup_date)::DATE AS signup_week
  FROM users
  WHERE signup_date >= '2024-01-01'
    AND signup_date <  '2024-04-01'
)

SELECT
  c.signup_week,
  COUNT(DISTINCT c.user_id)                                           AS cohort_size,

  -- Day 1 retention: % of cohort with a session on EXACTLY signup_date + 1
  -- LEFT JOIN ensures users with no Day-1 session are still in the denominator
  ROUND(
    100.0 * COUNT(DISTINCT s1.user_id)
           / NULLIF(COUNT(DISTINCT c.user_id), 0),
    1
  )                                                                   AS day_1_retention_pct,

  -- Day 7 retention: % of cohort with a session on EXACTLY signup_date + 7
  ROUND(
    100.0 * COUNT(DISTINCT s7.user_id)
           / NULLIF(COUNT(DISTINCT c.user_id), 0),
    1
  )                                                                   AS day_7_retention_pct,

  -- Day 30 retention: % of cohort with a session on EXACTLY signup_date + 30
  -- Note: recent cohorts may not have reached Day 30 yet — their cell will show 0.0
  ROUND(
    100.0 * COUNT(DISTINCT s30.user_id)
           / NULLIF(COUNT(DISTINCT c.user_id), 0),
    1
  )                                                                   AS day_30_retention_pct

FROM cohorts c

-- Day 1: LEFT JOIN filters to exactly one day after signup
LEFT JOIN sessions s1
  ON  s1.user_id      = c.user_id
  AND s1.session_date = c.signup_date + INTERVAL '1 day'

-- Day 7: LEFT JOIN filters to exactly seven days after signup
LEFT JOIN sessions s7
  ON  s7.user_id      = c.user_id
  AND s7.session_date = c.signup_date + INTERVAL '7 days'

-- Day 30: LEFT JOIN filters to exactly thirty days after signup
LEFT JOIN sessions s30
  ON  s30.user_id      = c.user_id
  AND s30.session_date = c.signup_date + INTERVAL '30 days'

GROUP BY 1
ORDER BY 1;`,keyInsights:[`Three separate LEFT JOINs on the sessions table — each filtered to a specific day offset — is the cleanest way to compute multi-day retention in a single pass. Each join is independent, so session_date = signup_date + N is an exact point-in-time filter, not a window.`,`LEFT JOIN is mandatory, not optional: with an INNER JOIN, users who didn't return on Day N would be excluded from the cohort count entirely, inflating the retention rate. LEFT JOIN preserves all cohort members in the denominator regardless of whether they matched the session filter.`,`The critical distinction is "on exactly Day N" vs "within N days of signup." BETWEEN signup_date AND signup_date + N measures cumulative retention (did they ever return?) — a different, weaker metric. Exact Day N is a stricter habituation signal. Always clarify this with the interviewer.`,`Cohort dilution is real: cohorts from late March 2024 haven't had 30 days to reach Day 30 by the time you run the query, so their day_30_retention_pct will be 0.0, not missing data — mention this in the interview so the reviewer doesn't misinterpret it as poor retention`]},{id:`code15-users-x-not-y-sql`,title:`Users Who Watched But Never Shared`,subtitle:`SQL · Anti-Join · Set Difference · Interview Classic`,track:`sql`,difficulty:`analyst`,isFree:!1,tags:[`anti-join`,`set difference`,`NOT EXISTS`,`LEFT JOIN`,`interview-sql`],scenario:{company:`Prism`,context:`You're in a Prism data interview. The interviewer says: "We want to identify users who are consuming content but not sharing it — a signal we use to prioritize share-nudge experiments. Write a query that returns all users who watched at least 3 videos but never shared any video in the last 30 days."`,schema:[{table:`events`,description:`One row per user event`,columns:[`user_id`,`event_type`,`event_ts`,`video_id`]},{table:`—`,description:`event_type values: "video_watched" | "video_shared"`,columns:[]}],task:`Return user_ids who had ≥ 3 video_watched events AND zero video_shared events in the last 30 days. Show two approaches: LEFT JOIN anti-join and NOT EXISTS.`},hints:[`The anti-join pattern: LEFT JOIN the events table filtered to video_shared, then WHERE that join produced NULL — meaning no share event matched.`,`Count only video_watched events in HAVING — use a conditional COUNT or filter in a subquery before joining.`,`NOT EXISTS is an alternative: correlated subquery that checks whether any video_shared event exists for the user in the window.`,`Date filter: event_ts >= CURRENT_DATE - INTERVAL '30 days' (or equivalent). Apply this filter consistently for both watched and shared event counts.`],partialCode:`-- Schema reminder:
-- events(user_id, event_type, event_ts, video_id)
-- event_type: 'video_watched' | 'video_shared'

-- TODO: Return user_ids with >= 3 video_watched events
-- and zero video_shared events in the last 30 days.
-- Show the LEFT JOIN anti-join approach.

SELECT  w.user_id
FROM    /* your query here */
`,modelAnswer:`-- ─────────────────────────────────────────────────────────
-- APPROACH 1: LEFT JOIN anti-join (most common, generally efficient)
-- ─────────────────────────────────────────────────────────

SELECT  w.user_id
FROM (
  -- Step 1: aggregate watched events per user in the last 30 days
  SELECT  user_id,
          COUNT(*) AS watch_count
  FROM    events
  WHERE   event_type = 'video_watched'
    AND   event_ts  >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY user_id
  HAVING  COUNT(*) >= 3          -- keep only users with >= 3 watches
) w

-- Step 2: anti-join — LEFT JOIN to share events, keep rows where join is NULL
LEFT JOIN (
  SELECT DISTINCT user_id
  FROM   events
  WHERE  event_type = 'video_shared'
    AND  event_ts  >= CURRENT_DATE - INTERVAL '30 days'
) s ON s.user_id = w.user_id

WHERE s.user_id IS NULL;         -- NULL means no share event matched = never shared


-- ─────────────────────────────────────────────────────────
-- APPROACH 2: NOT EXISTS (correlated subquery — same result, different style)
-- ─────────────────────────────────────────────────────────

SELECT  user_id
FROM    events
WHERE   event_type = 'video_watched'
  AND   event_ts  >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_id
HAVING  COUNT(*) >= 3
  AND   NOT EXISTS (
          -- correlated subquery: is there ANY share from this user in the window?
          SELECT 1
          FROM   events e2
          WHERE  e2.user_id   = events.user_id
            AND  e2.event_type = 'video_shared'
            AND  e2.event_ts  >= CURRENT_DATE - INTERVAL '30 days'
        );


-- ─────────────────────────────────────────────────────────
-- WHY NOT NOT IN?
-- NOT IN (SELECT user_id FROM ... WHERE event_type = 'video_shared')
-- Pitfall: if the subquery returns ANY NULL, NOT IN returns no rows.
-- Safer to use LEFT JOIN IS NULL or NOT EXISTS.
-- ─────────────────────────────────────────────────────────`,keyInsights:[`The anti-join pattern (LEFT JOIN + IS NULL on the right side) is the most readable and typically most performant way to find "rows in A with no match in B." It is the preferred form in most query optimizers.`,`NOT EXISTS is equivalent and sometimes preferred when the correlated subquery is simple — the optimizer often executes it identically to a LEFT JOIN anti-join in modern engines (Postgres, BigQuery, Snowflake).`,`Avoid NOT IN when the subquery could return NULLs: SQL's three-value logic means "x NOT IN (1, 2, NULL)" evaluates to UNKNOWN, silently returning zero rows. This is one of the most common silent bugs in SQL.`,`Apply the date filter consistently to both the watched and shared events. A common mistake is filtering the watched events but not the shared events, which would exclude users who shared before the 30-day window — they should count as "never shared in the window."`]},{id:`code16-rolling-7day-dau-sql`,title:`Rolling 7-Day Active Users by Date`,subtitle:`SQL · Rolling Window · Date Spine · R7DAU · Interview Classic`,track:`sql`,difficulty:`senior`,isFree:!1,tags:[`rolling window`,`date spine`,`R7DAU`,`self-join`,`interview-sql`],scenario:{company:`Spark`,context:`You're interviewing at Spark. The PM asks: "Can you write a query that shows me rolling 7-day active users (R7DAU) for every date in the last 30 days? R7DAU on a given date = the count of distinct users who were active on any of the 7 days ending on that date." This is a standard product health metric.`,schema:[{table:`user_activity`,description:`One row per user per active date (deduplicated — at most one row per user_id + activity_date)`,columns:[`user_id`,`activity_date`]},{table:`—`,description:`activity_date is a DATE column. Assume today is the reference date.`,columns:[]}],task:`Return one row per date for the last 30 days, with the count of distinct users active on any of the 7 days ending on (and including) that date. Explain why a window function with COUNT(DISTINCT) does not work here and what the correct approach is.`},hints:[`You need a date spine — a complete list of all dates in the last 30 days — so dates with zero activity still appear in the result.`,`Self-join the activity table: for each spine date d, join activity rows where activity_date BETWEEN d - 6 AND d. Then COUNT(DISTINCT user_id).`,`Window functions like SUM() OVER (... ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) work for additive metrics but COUNT(DISTINCT ...) is not supported inside window frames in most SQL engines.`,`Generate the date spine with a recursive CTE, generate_series() (Postgres), or UNNEST(GENERATE_DATE_ARRAY()) (BigQuery).`],partialCode:`-- Schema reminder:
-- user_activity(user_id, activity_date DATE)

-- TODO: Return one row per date for the last 30 days.
-- Each row: date, rolling_7day_active_users
-- (distinct users active on any of the 7 days ending on that date)
`,modelAnswer:`-- ─────────────────────────────────────────────────────────
-- APPROACH 1: Date spine + self-join (works in all SQL dialects)
-- ─────────────────────────────────────────────────────────

WITH date_spine AS (
  -- Generate every date in the last 30 days
  -- Postgres / Redshift syntax:
  SELECT CAST(generate_series AS DATE) AS spine_date
  FROM   generate_series(
           CURRENT_DATE - INTERVAL '29 days',
           CURRENT_DATE,
           INTERVAL '1 day'
         )
  -- BigQuery alternative:
  -- SELECT date FROM UNNEST(GENERATE_DATE_ARRAY(DATE_SUB(CURRENT_DATE(), INTERVAL 29 DAY), CURRENT_DATE())) AS date
)

SELECT
  d.spine_date                    AS date,
  COUNT(DISTINCT a.user_id)       AS rolling_7day_active_users
FROM   date_spine d

-- For each spine date, include all activity in the 7-day window ending on that date
LEFT JOIN user_activity a
  ON  a.activity_date BETWEEN d.spine_date - INTERVAL '6 days'
                          AND d.spine_date

GROUP BY d.spine_date
ORDER BY d.spine_date;


-- ─────────────────────────────────────────────────────────
-- WHY WINDOW FUNCTIONS DON'T WORK FOR COUNT(DISTINCT)
-- ─────────────────────────────────────────────────────────
-- This looks tempting but is NOT valid in most engines:
--
-- COUNT(DISTINCT user_id) OVER (
--   ORDER BY activity_date
--   ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
-- )
--
-- COUNT(DISTINCT) inside a window frame is not supported in
-- Postgres, Snowflake, Redshift, or BigQuery (as of 2024).
-- The self-join approach above is the correct solution.
--
-- If the table already has one row per user per date (deduplicated),
-- COUNT(*) in a window frame would work for non-distinct counts —
-- but the moment you need distinct users across an overlapping window,
-- you need the self-join.
-- ─────────────────────────────────────────────────────────`,keyInsights:[`Rolling window aggregations over distinct users require a date spine + self-join, not a window function. COUNT(DISTINCT ...) is not supported inside window frames (ROWS BETWEEN N PRECEDING AND CURRENT ROW) in Postgres, Snowflake, Redshift, or BigQuery — this is a common interview trap.`,`The date spine is essential: without it, dates with zero activity simply disappear from the result. A product health chart with missing dates is misleading. Always generate a complete date series and LEFT JOIN activity onto it.`,`The self-join condition (activity_date BETWEEN spine_date - 6 AND spine_date) creates an expanding set of matched rows for each spine date. COUNT(DISTINCT user_id) on that set gives the correct rolling 7-day unique user count.`,`In BigQuery, APPROX_COUNT_DISTINCT() is sometimes used with HyperLogLog sketch aggregation across sliding windows as a performance optimization at scale — but for interview purposes, the exact self-join answer is what the interviewer is looking for.`]},{id:`code17-top-n-per-group-sql`,title:`Top 3 Sellers by GMV Per Category`,subtitle:`SQL · DENSE_RANK · Window Functions · Top-N Per Group · Interview Classic`,track:`sql`,difficulty:`analyst`,isFree:!1,tags:[`ranking`,`DENSE_RANK`,`window functions`,`CTE`,`top-N per group`,`interview-sql`],scenario:{company:`Crafted`,context:`You're interviewing at Crafted. The interviewer says: "Our category managers want to see a leaderboard — for each product category, show me the top 3 sellers by total GMV in the last 90 days. Include their rank, total GMV, and handle ties correctly."`,schema:[{table:`orders`,description:`One row per completed order`,columns:[`order_id`,`seller_id`,`category`,`gmv`,`order_date`]},{table:`—`,description:`gmv is a numeric column in USD. order_date is a DATE. Multiple orders can exist per seller per category.`,columns:[]}],task:`Return seller_id, category, total_gmv, and rank within category for the top 3 sellers per category in the last 90 days. Use DENSE_RANK and explain when you would choose RANK vs DENSE_RANK vs ROW_NUMBER.`},hints:[`Step 1: aggregate orders to (seller_id, category, SUM(gmv)) for the last 90 days.`,`Step 2: apply DENSE_RANK() OVER (PARTITION BY category ORDER BY total_gmv DESC) on the aggregated result — in a CTE.`,`Step 3: filter the CTE WHERE rank <= 3.`,`You cannot use WHERE on a window function in the same SELECT — wrap it in a CTE or subquery first.`],partialCode:`-- Schema reminder:
-- orders(order_id, seller_id, category, gmv, order_date)

-- TODO: Return the top 3 sellers per category by total GMV
-- in the last 90 days. Include rank. Handle ties with DENSE_RANK.
`,modelAnswer:`-- ─────────────────────────────────────────────────────────
-- STEP 1: Aggregate GMV per seller per category (last 90 days)
-- STEP 2: Rank within each category using DENSE_RANK
-- STEP 3: Filter to top 3 ranks
-- ─────────────────────────────────────────────────────────

WITH seller_gmv AS (
  -- Aggregate total GMV per seller per category in the last 90 days
  SELECT
    seller_id,
    category,
    SUM(gmv)  AS total_gmv
  FROM   orders
  WHERE  order_date >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY seller_id, category
),

ranked_sellers AS (
  -- Rank sellers within each category by total GMV (highest = rank 1)
  -- DENSE_RANK: ties share the same rank, no ranks are skipped
  -- e.g., two sellers tied for 1st both get rank 1, next seller gets rank 2
  SELECT
    seller_id,
    category,
    total_gmv,
    DENSE_RANK() OVER (
      PARTITION BY category
      ORDER BY total_gmv DESC
    ) AS gmv_rank
  FROM seller_gmv
)

-- STEP 3: Keep only ranks 1, 2, 3 per category
-- NOTE: Cannot apply WHERE on window function in the same query level —
-- must wrap in CTE or subquery first
SELECT
  category,
  gmv_rank,
  seller_id,
  total_gmv
FROM   ranked_sellers
WHERE  gmv_rank <= 3
ORDER BY category, gmv_rank;


-- ─────────────────────────────────────────────────────────
-- RANK vs DENSE_RANK vs ROW_NUMBER — when to use each:
-- ─────────────────────────────────────────────────────────
--
-- RANK():        Tied rows get the same rank. Next rank SKIPS.
--                Sellers with $5k, $5k, $3k → ranks 1, 1, 3
--                Use when: "position in a leaderboard with gaps"
--
-- DENSE_RANK():  Tied rows get the same rank. Next rank does NOT skip.
--                Sellers with $5k, $5k, $3k → ranks 1, 1, 2
--                Use when: "top N per group" — preferred here, because
--                WHERE rank <= 3 would exclude the $3k seller with RANK()
--                if there are two tied at rank 1 (they'd be 1,1,3 — rank 3 > 3 cutoff?
--                Actually rank 3 = 3, it passes — but if THREE sellers tie at 1st,
--                rank 4 is skipped and the 4th seller is invisible with WHERE rank <= 3)
--
-- ROW_NUMBER():  Unique rank for every row — ties broken arbitrarily.
--                Sellers with $5k, $5k, $3k → ranks 1, 2, 3 (arbitrary for tie)
--                Use when: deduplication, pagination, "pick exactly one row per group"
-- ─────────────────────────────────────────────────────────`,keyInsights:[`You cannot filter on a window function in the same SELECT level — this is the single most common SQL interview mistake with ranking queries. The window function must be computed in a CTE or subquery, then filtered in the outer query.`,`DENSE_RANK is the right choice for top-N-per-group problems because it never skips ranks on ties. With RANK(), if three sellers tie for 1st, the 4th seller gets rank 4 — and WHERE rank <= 3 might include or exclude unexpected sellers depending on how many ties exist at the boundary.`,`ROW_NUMBER is correct when you need exactly one row per group with no ties (e.g., deduplication: keep the most recent record per user). It assigns arbitrary but unique ranks, so two equal-GMV sellers would get different row numbers with no guarantee of which one comes first.`,`Always aggregate first, then rank — do not try to nest SUM(gmv) inside the window function directly. A CTE per step (aggregate → rank → filter) is the clearest structure and easiest to debug in an interview setting.`]},{id:`code18-sessionization-sql`,title:`Sessionize an Events Table`,subtitle:`SQL · LAG · Session Detection · Cumulative Sum · Interview Classic`,track:`sql`,difficulty:`senior`,isFree:!1,tags:[`sessionization`,`LAG`,`cumulative sum`,`window functions`,`interview-sql`],scenario:{company:`Prism`,context:`You're in a senior data interview at Prism. The interviewer says: "We need to sessionize our events table. Define a session as a sequence of events from the same user where no gap between consecutive events exceeds 30 minutes. Write a query that (1) assigns a session_id to each event, and (2) counts distinct sessions per user per day."`,schema:[{table:`events`,description:`One row per user event`,columns:[`user_id`,`event_ts`,`event_type`]},{table:`—`,description:`event_ts is a TIMESTAMP. Events are not deduplicated — a user can have many events per minute.`,columns:[]}],task:`Write a SQL query that assigns a session_id to each event (events within 30 minutes of the previous event from the same user belong to the same session), then counts distinct sessions per user per day.`},hints:[`Step 1: Use LAG(event_ts) OVER (PARTITION BY user_id ORDER BY event_ts) to get the previous event's timestamp for the same user.`,`Step 2: Flag session starts — a new session begins when the gap from the previous event exceeds 30 minutes (or when it's the user's first event).`,`Step 3: SUM(is_new_session) OVER (PARTITION BY user_id ORDER BY event_ts) gives a monotonically increasing session counter per user — this is the session_id.`,`Step 4: Group by user_id, DATE(event_ts), session_id and count distinct sessions per user per day.`],partialCode:`-- Schema reminder:
-- events(user_id, event_ts TIMESTAMP, event_type)

-- TODO: Sessionize events. A new session starts when the gap
-- between consecutive events from the same user exceeds 30 minutes.
-- Return: user_id, event_date, sessions_that_day
`,modelAnswer:`-- ─────────────────────────────────────────────────────────
-- SESSIONIZATION IN THREE CTE STEPS
-- Pattern: LAG → gap flag → cumulative sum = session_id
-- ─────────────────────────────────────────────────────────

WITH events_with_prev AS (
  -- STEP 1: For each event, get the timestamp of the previous event
  -- from the same user, ordered by time
  SELECT
    user_id,
    event_ts,
    event_type,
    LAG(event_ts) OVER (
      PARTITION BY user_id
      ORDER BY event_ts
    ) AS prev_event_ts
  FROM events
),

session_flags AS (
  -- STEP 2: Flag the start of a new session
  -- A new session begins when:
  --   (a) there is no previous event (first event for the user), OR
  --   (b) the gap from the previous event exceeds 30 minutes
  SELECT
    user_id,
    event_ts,
    event_type,
    CASE
      WHEN prev_event_ts IS NULL THEN 1   -- first event ever for this user
      WHEN event_ts - prev_event_ts > INTERVAL '30 minutes' THEN 1  -- gap > 30 min
      ELSE 0
    END AS is_new_session
    -- Postgres/Redshift: event_ts - prev_event_ts gives an INTERVAL, compare directly
    -- BigQuery: TIMESTAMP_DIFF(event_ts, prev_event_ts, MINUTE) > 30
    -- Snowflake: DATEDIFF('minute', prev_event_ts, event_ts) > 30
  FROM events_with_prev
),

sessionized AS (
  -- STEP 3: Cumulative sum of session-start flags = monotonically increasing
  -- session counter per user. This is the session_id.
  -- User's 1st session = 1, 2nd = 2, etc.
  SELECT
    user_id,
    event_ts,
    event_type,
    is_new_session,
    SUM(is_new_session) OVER (
      PARTITION BY user_id
      ORDER BY event_ts
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS session_id   -- unique per user (not globally unique across users)
  FROM session_flags
)

-- STEP 4: Count distinct sessions per user per day
-- Each (user_id, session_id) pair is one session.
-- We group by user + date + session_id to get one row per session,
-- then count those rows per user per day.
SELECT
  user_id,
  DATE(event_ts)          AS event_date,
  COUNT(DISTINCT session_id) AS sessions_that_day
FROM   sessionized
GROUP BY user_id, DATE(event_ts)
ORDER BY user_id, event_date;


-- ─────────────────────────────────────────────────────────
-- NOTES FOR INTERVIEW DISCUSSION:
-- ─────────────────────────────────────────────────────────
-- 1. session_id is unique within a user, not globally.
--    If you need a globally unique session_id, use:
--    CONCAT(user_id, '-', session_id) or ROW_NUMBER() OVER () on sessionized.
--
-- 2. The cumulative SUM trick works because is_new_session is 0 or 1 —
--    each new session increments the counter by 1 for all subsequent
--    events until the next session boundary. No recursion needed.
--
-- 3. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is the default
--    for SUM with ORDER BY in most engines, but writing it explicitly
--    is clearer and avoids dialect-specific default behavior surprises.
--
-- 4. This does NOT require recursive CTEs or stored procedures —
--    pure window functions handle it in O(n log n) sort time.
-- ─────────────────────────────────────────────────────────`,keyInsights:[`The sessionization pattern is three steps: LAG to get the previous event timestamp, a CASE statement to flag session starts (gap > threshold or first event), and a cumulative SUM of that flag as the session_id. Memorize this pattern — it appears in a majority of senior product analytics interviews.`,`The cumulative sum trick works because the session-start flag is binary (0 or 1). Every time a new session begins, the running sum increments by 1, and all subsequent events in that session share the same counter value until the next increment.`,`This approach does not require recursive CTEs, UDFs, or procedural logic — it is pure standard SQL that runs efficiently on columnar engines (BigQuery, Snowflake, Redshift). Point this out in the interview to signal you understand execution models.`,`Session_id is user-scoped, not globally unique. If downstream queries need to join sessions across users, you must compose a globally unique key: CONCAT(user_id, '-', session_id) or assign a row number over the entire sessionized table partitioned by (user_id, session_id).`]},{id:`code19-bayesian-ab-python`,title:`Bayesian A/B Test Analysis`,subtitle:`Python · Beta Distribution · Posterior Sampling · Credible Intervals`,track:`python`,difficulty:`senior`,isFree:!1,tags:[`Bayesian`,`A/B testing`,`beta distribution`,`scipy`,`posterior`,`credible interval`],scenario:{company:`Helix Health · Onboarding Experiment`,context:`Helix ran a 3-week A/B test on a new onboarding checklist feature. You have the conversion counts for both arms. The stats team wants a Bayesian analysis instead of a frequentist p-value — specifically: (1) the posterior distribution of the true conversion rate for each arm, (2) a 95% credible interval for the difference, and (3) the probability that treatment is better than control (P(θ_T > θ_C)).`,schema:[{table:`Python variables already defined:`,description:``,columns:[]},{table:`—`,description:`n_control = 12400, conv_control = 1860  (15.0% conversion)`,columns:[]},{table:`—`,description:`n_treatment = 12600, conv_treatment = 2079  (16.5% conversion)`,columns:[]}],task:`Using a Beta-Binomial model with a uniform Beta(1,1) prior, compute the posterior Beta distributions for each arm, draw 100,000 samples to estimate P(treatment > control), and report the 95% credible interval on the lift.`},hints:[`With a Beta(1,1) prior and n observations with k conversions, the posterior is Beta(1 + k, 1 + n - k)`,`scipy.stats.beta.rvs(a, b, size=N) draws N samples from a Beta(a,b) distribution`,`P(treatment > control) = mean(samples_treatment > samples_control) over 100,000 draws`,`Credible interval on the lift: take the 2.5th and 97.5th percentiles of (samples_treatment - samples_control)`],partialCode:`import numpy as np
from scipy import stats

np.random.seed(42)

# Given data
n_control        = 12_400
conv_control     = 1_860
n_treatment      = 12_600
conv_treatment   = 2_079

# 1. Posterior parameters using Beta(1,1) prior
# Posterior: Beta(1 + conversions, 1 + non-conversions)
alpha_c = ___   # 1 + conv_control
beta_c  = ___   # 1 + (n_control - conv_control)
alpha_t = ___
beta_t  = ___

print(f"Posterior Beta params — Control:   Beta({alpha_c}, {beta_c})")
print(f"Posterior Beta params — Treatment: Beta({alpha_t}, {beta_t})")

# 2. Posterior means (the Bayesian point estimates)
post_mean_c = ___   # alpha / (alpha + beta)
post_mean_t = ___
print(f"\\nPosterior mean — Control:   {post_mean_c:.4f}")
print(f"Posterior mean — Treatment: {post_mean_t:.4f}")

# 3. Sample from posteriors
n_samples = 100_000
samples_c = ___   # draw n_samples from Beta(alpha_c, beta_c)
samples_t = ___   # draw n_samples from Beta(alpha_t, beta_t)

# 4. P(treatment > control)
p_treatment_better = ___
print(f"\\nP(Treatment > Control): {p_treatment_better:.4f}")

# 5. 95% Credible interval on the lift (treatment - control)
lift_samples = samples_t - samples_c
ci_lower, ci_upper = ___
print(f"95% Credible Interval on lift: [{ci_lower:+.4f}, {ci_upper:+.4f}]")
print(f"Expected lift: {lift_samples.mean():+.4f}  ({lift_samples.mean()*100:+.2f}pp)")`,modelAnswer:`import numpy as np
from scipy import stats

np.random.seed(42)

# Given data
n_control        = 12_400
conv_control     = 1_860
n_treatment      = 12_600
conv_treatment   = 2_079

# 1. Posterior parameters: Beta(1,1) prior + binomial likelihood → Beta posterior
# Posterior: Beta(1 + conversions, 1 + non-conversions)
alpha_c = 1 + conv_control
beta_c  = 1 + (n_control - conv_control)
alpha_t = 1 + conv_treatment
beta_t  = 1 + (n_treatment - conv_treatment)

print(f"Posterior Beta params — Control:   Beta({alpha_c}, {beta_c})")
print(f"Posterior Beta params — Treatment: Beta({alpha_t}, {beta_t})")

# 2. Posterior means (the MAP point estimates)
post_mean_c = alpha_c / (alpha_c + beta_c)
post_mean_t = alpha_t / (alpha_t + beta_t)
print(f"\\nPosterior mean — Control:   {post_mean_c:.4f}  ({post_mean_c:.2%})")
print(f"Posterior mean — Treatment: {post_mean_t:.4f}  ({post_mean_t:.2%})")
print(f"Expected lift (posterior means): {(post_mean_t - post_mean_c)*100:+.2f}pp")

# 3. Draw 100,000 samples from each posterior
n_samples = 100_000
samples_c = stats.beta.rvs(alpha_c, beta_c, size=n_samples)
samples_t = stats.beta.rvs(alpha_t, beta_t, size=n_samples)

# 4. P(treatment > control) — fraction of samples where treatment rate > control rate
p_treatment_better = np.mean(samples_t > samples_c)
print(f"\\nP(Treatment > Control): {p_treatment_better:.4f}  ({p_treatment_better:.2%})")

# 5. Credible interval on the lift
lift_samples = samples_t - samples_c
ci_lower, ci_upper = np.percentile(lift_samples, [2.5, 97.5])

print(f"\\n95% Credible Interval on lift: [{ci_lower*100:+.2f}pp, {ci_upper*100:+.2f}pp]")
print(f"Expected lift: {lift_samples.mean()*100:+.2f}pp")

# 6. Summary interpretation
print("\\n--- Interpretation ---")
print(f"There is a {p_treatment_better:.1%} probability that the treatment has a higher")
print(f"conversion rate than control. The 95% credible interval on the lift is")
print(f"[{ci_lower*100:+.2f}pp, {ci_upper*100:+.2f}pp] — we are 95% confident the")
print(f"true lift lies in this range given our prior and the observed data.")

# 7. Sanity check: compare to frequentist result
from scipy.stats import proportions_ztest
_, p_freq = proportions_ztest(
    count=[conv_treatment, conv_control],
    nobs=[n_treatment, n_control],
    alternative='two-sided'
)
print(f"\\nFrequentist p-value (two-sided z-test): {p_freq:.6f}")
print(f"(Bayesian P(T>C) ≈ 1 - frequentist one-sided p/2 when sample is large — consistent)")`,keyInsights:[`The Beta-Binomial conjugate model is the simplest Bayesian A/B test. With a Beta(α,β) prior and n trials with k successes, the posterior is Beta(α+k, β+n-k) — closed form, no MCMC needed.`,`P(treatment > control) via sampling is straightforward: draw N samples from each posterior and compute mean(samples_T > samples_C). With 100,000 samples, this estimate is stable to ±0.1% or better.`,`A 95% Bayesian credible interval has a more intuitive interpretation than a frequentist CI: "there is a 95% probability the true lift is in this range (given the prior and data)" vs. the frequentist "95% of intervals constructed this way would contain the true parameter."`,`With n ≈ 12,000 per arm and a Beta(1,1) uninformative prior, the prior has negligible impact — the posterior is dominated by the data. The Bayesian and frequentist conclusions will be nearly identical at this sample size.`]},{id:`code20-cohort-ltv-python`,title:`Cohort LTV Projection`,subtitle:`Python · Retention Curve · Exponential Decay · Discounted LTV`,track:`python`,difficulty:`senior`,isFree:!1,tags:[`LTV`,`cohort analysis`,`retention`,`exponential decay`,`pandas`,`numpy`],scenario:{company:`Meridian SaaS · Growth Team`,context:`Meridian has 6 months of retention data for its January 2024 signup cohort. The growth team wants to project 12-month LTV. You'll fit an exponential decay curve to months 1-6 and extrapolate to month 12, then compute discounted LTV using a monthly discount rate (reflecting cost of capital) and ARPU.`,schema:[{table:`Python variables already defined:`,description:``,columns:[]},{table:`—`,description:`retention = [1.0, 0.72, 0.58, 0.49, 0.43, 0.38, 0.35]  (M0 through M6)`,columns:[]},{table:`—`,description:`arpu = 45.0  (average revenue per user per month, $)`,columns:[]},{table:`—`,description:`monthly_discount_rate = 0.01  (1% per month ≈ 12.7% annually)`,columns:[]}],task:`Fit an exponential decay model (R(t) = a * exp(-b*t)) to the observed retention data, project retention for months 7-12, and compute 12-month discounted LTV as sum of (ARPU × R(t) / (1 + discount_rate)^t) for t=0 to 12.`},hints:[`Use scipy.optimize.curve_fit to fit an exponential model. Define a function: def exp_decay(t, a, b): return a * np.exp(-b * t)`,`Initial guess for parameters: a=1.0 (M0 retention starts at 100%), b=0.1 (a decay constant around 10%/month)`,`Once you have fitted a, b: project months 7-12 as exp_decay(t, a, b) for t in range(7, 13)`,`LTV = sum over all months of ARPU × retention(t) / (1 + monthly_discount_rate)^t`],partialCode:`import numpy as np
from scipy.optimize import curve_fit
import matplotlib.pyplot as plt

# Observed data: M0 through M6
months_observed = np.array([0, 1, 2, 3, 4, 5, 6])
retention       = np.array([1.0, 0.72, 0.58, 0.49, 0.43, 0.38, 0.35])

arpu                  = 45.0   # $ per user per month
monthly_discount_rate = 0.01   # 1% per month

# 1. Define the exponential decay model
def exp_decay(t, a, b):
    return ___

# 2. Fit the model to observed data
popt, pcov = curve_fit(___, months_observed, retention, p0=[1.0, 0.1])
a_fit, b_fit = popt
print(f"Fitted model: R(t) = {a_fit:.4f} * exp(-{b_fit:.4f} * t)")

# 3. Project months 7-12
months_projected = np.array([7, 8, 9, 10, 11, 12])
retention_projected = ___

# Combine observed + projected retention
months_all    = np.concatenate([months_observed, months_projected])
retention_all = np.concatenate([retention, retention_projected])

print("\\nRetention projection:")
for t, r in zip(months_all, retention_all):
    label = "(observed)" if t <= 6 else "(projected)"
    print(f"  Month {t:2d}: {r:.3f}  {label}")

# 4. Compute 12-month discounted LTV
# LTV = sum of ARPU * retention(t) / (1 + r)^t for t = 0 to 12
ltv_12m = ___
print(f"\\n12-Month Discounted LTV: \${ltv_12m:.2f}")

# 5. Compare with undiscounted LTV
ltv_undiscounted = ___
print(f"12-Month Undiscounted LTV: \${ltv_undiscounted:.2f}")`,modelAnswer:`import numpy as np
from scipy.optimize import curve_fit
import matplotlib.pyplot as plt

# Observed data: M0 through M6
months_observed = np.array([0, 1, 2, 3, 4, 5, 6])
retention       = np.array([1.0, 0.72, 0.58, 0.49, 0.43, 0.38, 0.35])

arpu                  = 45.0   # $ per user per month
monthly_discount_rate = 0.01   # 1% per month

# 1. Exponential decay model
def exp_decay(t, a, b):
    return a * np.exp(-b * t)

# 2. Fit to observed data (months 0-6)
popt, pcov = curve_fit(exp_decay, months_observed, retention, p0=[1.0, 0.1])
a_fit, b_fit = popt
print(f"Fitted model: R(t) = {a_fit:.4f} * exp(-{b_fit:.4f} * t)")
print(f"Implied monthly churn rate ≈ {1 - np.exp(-b_fit):.2%}")

# 3. Project months 7-12
months_projected    = np.array([7, 8, 9, 10, 11, 12])
retention_projected = exp_decay(months_projected, a_fit, b_fit)

# Full 13-month timeline (M0 through M12)
months_all    = np.concatenate([months_observed, months_projected])
retention_all = np.concatenate([retention, retention_projected])

print("\\nRetention projection:")
for t, r in zip(months_all, retention_all):
    label = "(observed)" if t <= 6 else "(projected)"
    print(f"  Month {t:2d}: {r:.3f}  {label}")

# 4. 12-Month Discounted LTV
# LTV = sum_{t=0}^{12} ARPU * R(t) / (1 + r)^t
discount_factors = np.array([(1 + monthly_discount_rate)**(-t) for t in months_all])
ltv_12m = np.sum(arpu * retention_all * discount_factors)

print(f"\\n12-Month Discounted LTV:   \${ltv_12m:.2f}")

# 5. Undiscounted LTV (no time value of money)
ltv_undiscounted = np.sum(arpu * retention_all)
print(f"12-Month Undiscounted LTV: \${ltv_undiscounted:.2f}")
print(f"Discount impact: \${ltv_undiscounted - ltv_12m:.2f} ({(ltv_undiscounted - ltv_12m)/ltv_undiscounted:.1%} reduction)")

# 6. LTV at each month (cumulative) — useful for CAC payback analysis
print("\\nCumulative LTV by month:")
cumulative_ltv = 0
for t, r, df in zip(months_all, retention_all, discount_factors):
    cumulative_ltv += arpu * r * df
    print(f"  Month {t:2d}: cumulative LTV = \${cumulative_ltv:.2f}")

# 7. Optional: visualize retention observed vs fitted
fig, ax = plt.subplots(figsize=(9, 4))
t_smooth = np.linspace(0, 12, 100)
ax.plot(months_observed, retention * 100, 'o', label='Observed', markersize=8, color='#4C72B0')
ax.plot(t_smooth, exp_decay(t_smooth, a_fit, b_fit) * 100, '-', label='Fitted (exp decay)', color='#4C72B0', alpha=0.6)
ax.axvline(6.5, color='grey', linestyle='--', linewidth=0.8, label='Projection boundary')
ax.set_xlabel('Month')
ax.set_ylabel('Retention (%)')
ax.set_title('Cohort Retention: Observed + Projected (Exponential Decay Fit)')
ax.legend()
ax.spines[['top', 'right']].set_visible(False)
plt.tight_layout()
plt.show()`,keyInsights:[`The exponential decay model R(t) = a·exp(-b·t) is the simplest parametric retention model. The constant b is the instantaneous churn rate; the implied monthly churn is 1 - exp(-b). With only 6 observed months, more complex models (power law, shifted-Beta-Geometric) are under-constrained — exponential is defensible.`,`Discounting matters for LTV calculations at longer time horizons. A 1%/month discount rate (≈12.7% annual) reduces 12-month LTV by ~6-8% relative to undiscounted. At higher discount rates or longer horizons, the effect is substantial.`,`The cumulative LTV curve is more useful than the 12-month point estimate for CAC payback analysis — it tells you at what month cumulative revenue recouped the acquisition cost.`,`Projection confidence narrows rapidly beyond observed data. Report a range (optimistic/base/pessimistic) using ±1 standard deviation of the fitted parameters (pcov from curve_fit gives parameter uncertainty).`]},{id:`code21-anomaly-detection-python`,title:`Metric Anomaly Detection with Rolling Z-Score`,subtitle:`Python · Pandas · Rolling Statistics · Z-Score · Alerting`,track:`python`,difficulty:`senior`,isFree:!1,tags:[`anomaly detection`,`rolling z-score`,`pandas`,`time series`,`alerting`,`DAU`],scenario:{company:`Stratos · Data Science Team`,context:`Stratos tracks Daily Active Users (DAU) as its north star metric. The on-call analyst needs an automated anomaly detection script to flag days where DAU deviated significantly from recent trends. You'll implement a rolling z-score approach: for each day, compute how many standard deviations it falls from the trailing 7-day mean, and flag days where the absolute z-score exceeds 2.5.`,schema:[{table:`DataFrame: df`,description:`One row per day`,columns:[`date`,`dau`]},{table:`—`,description:`date: datetime, sorted ascending. dau: integer, 90 days of data.`,columns:[]},{table:`—`,description:`Example: dates from 2024-01-01 to 2024-03-30, DAU ranging 180k–240k`,columns:[]}],task:`Compute a 7-day rolling mean and standard deviation for DAU. Calculate the z-score for each day as (dau - rolling_mean) / rolling_std. Flag all days where abs(z_score) > 2.5 as anomalies. Print the anomaly dates with their z-scores and DAU values.`},hints:[`Use df["dau"].rolling(window=7, min_periods=3).mean() for the rolling mean. min_periods=3 avoids NaN for the first few rows.`,`Rolling std: df["dau"].rolling(window=7, min_periods=3).std() — note this is a sample std (ddof=1) by default.`,`z_score = (dau - rolling_mean) / rolling_std. Be careful with division by zero if rolling_std is 0.`,`Flag anomalies: df["is_anomaly"] = df["z_score"].abs() > 2.5. Then filter to only anomaly rows.`],partialCode:`import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Simulate 90 days of DAU data (replace with real df in production)
np.random.seed(42)
dates = pd.date_range('2024-01-01', periods=90, freq='D')
base_dau = 200_000
# Inject 3 anomalies: a spike on day 30, a drop on day 55, spike on day 75
dau_values = (base_dau + np.random.normal(0, 8_000, 90)).astype(int)
dau_values[30] += 45_000   # anomaly: marketing campaign spike
dau_values[55] -= 35_000   # anomaly: infrastructure outage
dau_values[75] += 30_000   # anomaly: viral moment

df = pd.DataFrame({'date': dates, 'dau': dau_values})

# 1. Rolling mean and std (7-day trailing window)
df['rolling_mean'] = ___
df['rolling_std']  = ___

# 2. Z-score: how many std devs is today's DAU from the 7-day average?
# Guard against zero std (use np.where or fillna)
df['z_score'] = ___

# 3. Flag anomalies
THRESHOLD = 2.5
df['is_anomaly'] = ___

# 4. Print anomaly report
anomalies = df[df['is_anomaly']].copy()
print(f"Anomaly Detection Report (threshold: ±{THRESHOLD}σ)")
print(f"Total anomaly days: {len(anomalies)} out of {len(df)} days\\n")
print(f"{'Date':<14} {'DAU':>10} {'Rolling Mean':>14} {'Z-Score':>10}")
print("-" * 52)
for _, row in anomalies.iterrows():
    direction = "SPIKE" if row['z_score'] > 0 else "DROP "
    print(f"{str(row['date'].date()):<14} {row['dau']:>10,} {row['rolling_mean']:>14,.0f} {row['z_score']:>+9.2f}  [{direction}]")`,modelAnswer:`import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Simulate 90 days of DAU data
np.random.seed(42)
dates = pd.date_range('2024-01-01', periods=90, freq='D')
base_dau = 200_000
dau_values = (base_dau + np.random.normal(0, 8_000, 90)).astype(int)
dau_values[30] += 45_000   # anomaly: marketing campaign spike
dau_values[55] -= 35_000   # anomaly: infrastructure outage
dau_values[75] += 30_000   # anomaly: viral moment

df = pd.DataFrame({'date': dates, 'dau': dau_values})

# 1. Rolling 7-day mean and std (trailing, min 3 observations to avoid early NaNs)
df['rolling_mean'] = df['dau'].rolling(window=7, min_periods=3).mean()
df['rolling_std']  = df['dau'].rolling(window=7, min_periods=3).std()

# 2. Z-score — guard against zero std with np.where
df['z_score'] = np.where(
    df['rolling_std'] > 0,
    (df['dau'] - df['rolling_mean']) / df['rolling_std'],
    0.0
)

# 3. Flag anomalies
THRESHOLD = 2.5
df['is_anomaly'] = df['z_score'].abs() > THRESHOLD

# 4. Print anomaly report
anomalies = df[df['is_anomaly']].copy()
print(f"Anomaly Detection Report  (threshold: ±{THRESHOLD}σ, 7-day rolling window)")
print(f"Detected {len(anomalies)} anomaly day(s) out of {len(df)} days\\n")
print(f"{'Date':<14} {'DAU':>10} {'Rolling Mean':>14} {'Z-Score':>10}  {'Type':<8}")
print("-" * 60)
for _, row in anomalies.iterrows():
    direction = "SPIKE" if row['z_score'] > 0 else "DROP"
    print(
        f"{str(row['date'].date()):<14} "
        f"{row['dau']:>10,} "
        f"{row['rolling_mean']:>14,.0f} "
        f"{row['z_score']:>+9.2f}  "
        f"[{direction}]"
    )

# 5. Summary statistics
print(f"\\nZ-score distribution (non-anomaly days):")
normal_z = df.loc[~df['is_anomaly'], 'z_score'].dropna()
print(f"  Mean:   {normal_z.mean():.3f}")
print(f"  Std:    {normal_z.std():.3f}")
print(f"  Min/Max: {normal_z.min():.2f} / {normal_z.max():.2f}")

# 6. Visualize
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 7), sharex=True)

# Top panel: DAU with anomaly markers
ax1.plot(df['date'], df['dau'], linewidth=1.5, color='#4C72B0', label='DAU')
ax1.plot(df['date'], df['rolling_mean'], '--', color='orange', linewidth=1.2, label='7-day rolling mean')
ax1.scatter(anomalies['date'], anomalies['dau'], color='red', zorder=5, s=60, label='Anomaly')
ax1.set_ylabel('DAU')
ax1.set_title('DAU with Anomaly Detection (Rolling Z-Score)')
ax1.legend(fontsize=9)
ax1.spines[['top', 'right']].set_visible(False)

# Bottom panel: Z-scores
ax2.bar(df['date'], df['z_score'], color=np.where(df['is_anomaly'], '#d62728', '#aec7e8'), width=0.8)
ax2.axhline(THRESHOLD,  color='red', linestyle='--', linewidth=0.9, label=f'+{THRESHOLD}σ')
ax2.axhline(-THRESHOLD, color='red', linestyle='--', linewidth=0.9, label=f'-{THRESHOLD}σ')
ax2.axhline(0, color='grey', linewidth=0.5)
ax2.set_ylabel('Z-Score')
ax2.set_xlabel('Date')
ax2.legend(fontsize=9)
ax2.spines[['top', 'right']].set_visible(False)

plt.tight_layout()
plt.show()`,keyInsights:[`Rolling z-score is a simple but effective baseline anomaly detector for slowly-varying metrics like DAU. It detects deviations from recent local trends rather than from a global mean, making it robust to gradual growth or seasonality.`,`The 7-day rolling window captures a full week of history, smoothing weekly seasonality (e.g., lower DAU on Mondays). For metrics with strong weekly cycles, using a 7-day window is important to avoid flagging every weekend as an anomaly.`,`Guard against division by zero: if DAU is perfectly constant for 7 days, rolling_std = 0, and the z-score is undefined. np.where or pd.Series.where handles this cleanly by setting z_score = 0 in that case.`,`A 2.5σ threshold corresponds to ~1.2% false positive rate under a normal distribution. In practice, metric distributions are heavier-tailed, so you will see somewhat more anomalies than expected. Tune the threshold based on your tolerance for false alarms vs. missed detections.`]},{id:`code22-funnel-segment-chisq`,title:`Funnel Conversion by Segment with Significance Testing`,subtitle:`Python + SQL · Funnel Analysis · Chi-Square Test · Segment Comparison`,track:`python`,difficulty:`staff`,isFree:!1,tags:[`funnel`,`segment analysis`,`chi-square`,`scipy`,`SQL`,`statistical significance`,`staff`],scenario:{company:`Orbis Commerce · Checkout Team`,context:`Orbis wants to know if checkout conversion differs significantly between mobile and desktop users, and at which funnel step the gap is largest. You'll write SQL to extract step-level funnel counts by segment, then use Python to compute per-step conversion rates and run a chi-square test at each step to determine if the segment differences are statistically significant.`,schema:[{table:`events`,description:`One row per user per funnel event`,columns:[`user_id`,`event_name`,`platform`,`event_ts`]},{table:`—`,description:`event_name: "checkout_start", "payment_page", "payment_submit", "order_complete"`,columns:[]},{table:`—`,description:`platform: "mobile" | "desktop"`,columns:[]}],task:`Part 1 (SQL): Write a query to count distinct users at each funnel step by platform. Part 2 (Python): Load the results into a DataFrame, compute conversion rates, and run a chi-square test at each step comparing mobile vs. desktop.`},hints:[`SQL: Use COUNT(DISTINCT CASE WHEN event_name = '...' THEN user_id END) per platform to get users at each funnel step`,`Python: For each step, the contingency table is [[mobile_reached, mobile_not_reached], [desktop_reached, desktop_not_reached]] where "reached" means completed this step`,`scipy.stats.chi2_contingency([[a,b],[c,d]]) returns (chi2, p_value, dof, expected)`,`The chi-square test at each step is conditional: it tests whether the proportion who reached this step (out of those who reached the previous step) differs by platform`],partialCode:`# ─── PART 1: SQL ──────────────────────────────────────────
# Write a SQL query that returns:
# platform | users_checkout_start | users_payment_page | users_payment_submit | users_order_complete
# One row per platform (mobile, desktop)

sql_query = """
SELECT
    platform,
    COUNT(DISTINCT CASE WHEN event_name = 'checkout_start'   THEN user_id END) AS users_checkout_start,
    -- TODO: add users_payment_page, users_payment_submit, users_order_complete
    ___
FROM events
WHERE event_ts >= '2024-01-01'
GROUP BY platform
ORDER BY platform;
"""

# ─── PART 2: Python ──────────────────────────────────────────
import pandas as pd
import numpy as np
from scipy.stats import chi2_contingency

# Simulated result from the SQL query above
data = {
    'platform': ['desktop', 'mobile'],
    'users_checkout_start':   [45_200, 61_800],
    'users_payment_page':     [38_420, 44_500],
    'users_payment_submit':   [32_180, 33_400],
    'users_order_complete':   [28_950, 26_720],
}
df = pd.DataFrame(data)
df = df.set_index('platform')

steps = ['users_payment_page', 'users_payment_submit', 'users_order_complete']
prev  = ['users_checkout_start', 'users_payment_page',  'users_payment_submit']

print(f"{'Step':<26} {'Desktop Rate':>14} {'Mobile Rate':>13} {'Chi2 p-value':>14}  {'Significant?':>14}")
print("-" * 90)

for step, prior in zip(steps, prev):
    # Compute conversion rate at this step (reached step / reached previous step)
    desktop_rate = ___
    mobile_rate  = ___

    # Build 2x2 contingency table
    # [[desktop_reached_step, desktop_not_reached], [mobile_reached_step, mobile_not_reached]]
    desktop_reached = df.loc['desktop', step]
    desktop_prior   = df.loc['desktop', prior]
    mobile_reached  = df.loc['mobile',  step]
    mobile_prior    = df.loc['mobile',  prior]

    contingency = ___   # 2x2 table
    chi2, p, dof, expected = chi2_contingency(contingency)

    sig = "YES ***" if p < 0.05 else "no"
    step_label = step.replace('users_', '').replace('_', ' ').title()
    print(f"{step_label:<26} {desktop_rate:>13.1%} {mobile_rate:>13.1%} {p:>14.4f}  {sig:>14}")`,modelAnswer:`# ─── PART 1: SQL ─────────────────────────────────────────────────────────────
# Returns one row per platform with user counts at each funnel step.

sql_query = """
SELECT
    platform,
    COUNT(DISTINCT CASE WHEN event_name = 'checkout_start'   THEN user_id END) AS users_checkout_start,
    COUNT(DISTINCT CASE WHEN event_name = 'payment_page'     THEN user_id END) AS users_payment_page,
    COUNT(DISTINCT CASE WHEN event_name = 'payment_submit'   THEN user_id END) AS users_payment_submit,
    COUNT(DISTINCT CASE WHEN event_name = 'order_complete'   THEN user_id END) AS users_order_complete
FROM events
WHERE event_ts >= '2024-01-01'
GROUP BY platform
ORDER BY platform;
-- Note: COUNT DISTINCT per step naturally handles users who skip steps (if that's possible in your schema).
-- If users must reach step N before step N+1, this is equivalent to a strict funnel filter.
"""

# ─── PART 2: Python ───────────────────────────────────────────────────────────
import pandas as pd
import numpy as np
from scipy.stats import chi2_contingency

# Simulated SQL result
data = {
    'platform': ['desktop', 'mobile'],
    'users_checkout_start':   [45_200, 61_800],
    'users_payment_page':     [38_420, 44_500],
    'users_payment_submit':   [32_180, 33_400],
    'users_order_complete':   [28_950, 26_720],
}
df = pd.DataFrame(data).set_index('platform')

# Define the step-to-prior mapping for step-over-step conversion rates
steps_labels = ['Payment Page', 'Payment Submit', 'Order Complete']
steps = ['users_payment_page', 'users_payment_submit', 'users_order_complete']
prev  = ['users_checkout_start', 'users_payment_page',  'users_payment_submit']

print("Funnel Conversion Rate by Platform — Orbis Commerce")
print(f"{'Step':<22} {'Desktop Rate':>14} {'Mobile Rate':>13} {'p-value':>10}  {'Significant':>12}")
print("=" * 76)

results = []
for label, step, prior in zip(steps_labels, steps, prev):
    desktop_prior   = df.loc['desktop', prior]
    desktop_reached = df.loc['desktop', step]
    mobile_prior    = df.loc['mobile',  prior]
    mobile_reached  = df.loc['mobile',  step]

    # Step-over-step conversion rates
    desktop_rate = desktop_reached / desktop_prior
    mobile_rate  = mobile_reached  / mobile_prior

    # 2x2 contingency table for chi-square test
    # Row 1: desktop — [reached_this_step, did_not_reach]
    # Row 2: mobile  — [reached_this_step, did_not_reach]
    contingency = [
        [desktop_reached, desktop_prior - desktop_reached],
        [mobile_reached,  mobile_prior  - mobile_reached ],
    ]
    chi2, p, dof, expected = chi2_contingency(contingency)

    sig    = "YES ***" if p < 0.001 else ("YES *" if p < 0.05 else "no")
    lift   = mobile_rate - desktop_rate
    results.append({
        'step': label, 'desktop_rate': desktop_rate,
        'mobile_rate': mobile_rate, 'lift_mobile_vs_desktop': lift,
        'chi2': chi2, 'p_value': p,
    })
    print(f"{label:<22} {desktop_rate:>13.1%} {mobile_rate:>13.1%} {p:>10.4f}  {sig:>12}")

# Summary
print()
results_df = pd.DataFrame(results)
worst_step = results_df.loc[results_df['lift_mobile_vs_desktop'].idxmin(), 'step']
print(f"Largest mobile deficit vs desktop: '{worst_step}'")
print(f"  Mobile rate at that step: {results_df[results_df['step']==worst_step]['mobile_rate'].values[0]:.1%}")
print(f"  Desktop rate at that step: {results_df[results_df['step']==worst_step]['desktop_rate'].values[0]:.1%}")

# Overall (end-to-end) funnel conversion
overall_desktop = df.loc['desktop', 'users_order_complete'] / df.loc['desktop', 'users_checkout_start']
overall_mobile  = df.loc['mobile',  'users_order_complete'] / df.loc['mobile',  'users_checkout_start']
print(f"\\nEnd-to-end funnel conversion:")
print(f"  Desktop: {overall_desktop:.1%}  |  Mobile: {overall_mobile:.1%}")
print(f"  Mobile lags desktop by {(overall_desktop - overall_mobile)*100:.1f}pp overall")

# Overall chi-square test on end-to-end conversion
contingency_overall = [
    [df.loc['desktop','users_order_complete'], df.loc['desktop','users_checkout_start'] - df.loc['desktop','users_order_complete']],
    [df.loc['mobile', 'users_order_complete'], df.loc['mobile', 'users_checkout_start'] - df.loc['mobile', 'users_order_complete']],
]
chi2_overall, p_overall, _, _ = chi2_contingency(contingency_overall)
print(f"  Overall chi-square p-value: {p_overall:.2e}  ({'significant' if p_overall < 0.05 else 'not significant'})")`,keyInsights:[`The chi-square test for funnel segments uses a 2×2 contingency table: [users_who_reached_step, users_who_did_not_reach_step] for each segment. This correctly tests whether the step-over-step conversion proportion is different between segments.`,`Always run step-over-step conversion rates (step N / step N-1), not step N / top-of-funnel, when testing at each individual step. The question is: "of users who reached the previous step, did fewer mobile users proceed to the next step?" — not "what fraction of all checkout-starters reached payment_submit?"`,`With sample sizes of 30k-60k per segment, almost any real effect will be statistically significant. The p-value tells you if an effect exists; the magnitude (desktop 84.9% vs. mobile 75.1% payment_page rate) tells you if it matters. Always report both.`,`This pattern — SQL to extract counts → Python to compute rates and run tests — is the standard workflow in product analytics. The SQL does the data aggregation; Python does the statistical inference. Keep these concerns separated for clarity and reproducibility.`]}];Object.fromEntries(e.map(e=>[e.id,e]));export{e as t};