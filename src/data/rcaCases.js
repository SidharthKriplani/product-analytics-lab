// Product Analytics Lab — RCA Room Case Data

export const rcaCases = [
  {
    id: 'RCA01',
    title: 'Checkout Conversion Dropped Overnight',
    subtitle: 'Crestline Home · E-Commerce · Payment Flow',
    difficulty: 'analyst',
    isFree: true,

    guestPreview: true,
    companies: ['Stripe', 'PayPal', 'Shopify'],
    domain: 'growth',
    linkedConceptIds: ['funnel-decomposition', 'segmentation', 'data-quality-check'],
    context: {
      metricMovement: 'Checkout conversion rate dropped from 62.4% to 57.1% (-5.3pp) overnight',
      businessImpact: '~$140k in daily revenue at risk if sustained',
      timeWindow: 'Drop observed at 11pm Tuesday, sustained through Wednesday morning',
      knownFacts: [
        'A new payment provider was integrated on Tuesday afternoon',
        'Drop is NOT seen in the app (mobile) — only web',
        'Payment error logs show a 4x spike in "invalid card" errors for Visa cards on web',
        'No A/B test was running at the time of drop',
        'The payment UI was not changed — only the backend provider'
      ]
    },
    diagnosisSteps: [
      {
        id: 'system_check',
        stepNumber: 1,
        label: 'System / Data Check',
        prompt: 'Before diagnosing user behavior, you need to determine if this drop is real or a data/system artifact. What do you do first?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Check payment error logs and provider error rates — a deployment just happened',
            isCorrect: true,
            level: 'strong',
            feedback: 'A backend deployment occurred hours before the drop — this is the most likely candidate and error logs will confirm or rule it out in minutes. Checking provider error rates first gives you a fast, high-signal answer without any analysis work. This is the right instinct: when a system change coincides with a metric drop, check the system before checking the users.'
          },
          {
            id: 'b',
            label: 'Check analytics instrumentation for tracking gaps or missing events',
            isCorrect: false,
            level: 'partial',
            feedback: 'Instrumentation checks are a valid first step when there is no known deployment, but here a payment provider change happened the same afternoon. Ruling out a real system issue first is faster and more targeted. Instrumentation gaps are still worth checking if error logs come back clean.'
          },
          {
            id: 'c',
            label: 'Assume it is real and start analyzing user checkout behavior',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Jumping to user behavior analysis before checking for system causes wastes time and often leads to false conclusions. A known backend deployment just happened — you must rule that out first. Analysts who skip system checks frequently "find" behavioral explanations for problems that are actually engineering bugs.'
          }
        ]
      },
      {
        id: 'decompose',
        stepNumber: 2,
        label: 'Metric Decomposition',
        prompt: 'You have confirmed the drop is real. Now break the checkout conversion metric into its component steps. Which decomposition is most useful here?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Decompose the checkout funnel step-by-step: cart → payment page → payment submit → confirmation',
            isCorrect: true,
            level: 'strong',
            feedback: 'Breaking the funnel at each step immediately reveals where users are dropping — whether it is reaching the payment page, submitting payment, or receiving confirmation. This narrows the problem from "checkout conversion dropped" to a specific step, making subsequent segmentation faster and more targeted. Given the known Visa error spike, you expect to see the drop at the payment submit step.'
          },
          {
            id: 'b',
            label: 'Compare overall checkout conversion rate this week vs. last week',
            isCorrect: false,
            level: 'partial',
            feedback: 'Week-over-week comparison confirms the drop is real and gives you a baseline, but it does not tell you where in the funnel users are dropping. You already know there is a drop — decomposing the funnel steps is far more actionable for diagnosis. This approach answers "how bad" but not "where or why."'
          },
          {
            id: 'c',
            label: 'Look at overall conversion rate across the entire site',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Zooming out to total site conversion dilutes the signal and mixes unrelated user journeys. The problem is specifically in the checkout flow, and broadening scope adds noise without revealing the mechanism. This is a common mistake when analysts feel uncertain — widening the view instead of narrowing to the affected component.'
          }
        ]
      },
      {
        id: 'segment',
        stepNumber: 3,
        label: 'Segmentation',
        prompt: 'Funnel decomposition shows the drop is at payment submission. Now segment to find where it is concentrated. Which segmentation finds the root cause fastest?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Segment by payment method (Visa vs. other cards vs. PayPal) + platform (web vs. app) + card network',
            isCorrect: true,
            level: 'strong',
            feedback: 'You already know from the known facts that Visa error logs spiked on web — segmenting by payment method and platform confirms this signal with conversion data and quantifies the impact precisely. This lets you attribute the full drop to a specific technical failure mode. Cross-referencing card network with platform also reveals whether it is Visa-specific or broader.'
          },
          {
            id: 'b',
            label: 'Segment by device type (desktop vs. mobile vs. tablet)',
            isCorrect: false,
            level: 'partial',
            feedback: 'Device segmentation is directionally useful since the drop is web-only, but it does not get you to the payment method or card network dimension where the actual failure is. You would see "desktop is down" but still not know if it is a Visa issue or something broader. Payment method segmentation is the more targeted cut given the evidence available.'
          },
          {
            id: 'c',
            label: 'Segment by acquisition channel (organic vs. paid vs. email)',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Acquisition channel segmentation makes sense when the hypothesis is a traffic quality shift, but here the evidence points to a payment processing failure, not a demand-side issue. Segmenting by acquisition channel would find nothing useful and wastes diagnostic time. Always match your segmentation choice to the most likely failure mode given the known facts.'
          }
        ]
      },
      {
        id: 'hypothesis',
        stepNumber: 4,
        label: 'Root Cause Hypothesis',
        prompt: 'You have confirmed: drop is at payment submit, concentrated in Visa on web. Which hypothesis best explains the root cause?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'New payment provider integration has a bug processing Visa cards on web, causing payment failures',
            isCorrect: true,
            level: 'strong',
            feedback: 'This hypothesis is supported by three converging signals: the timing (drop started after deployment), the specificity (Visa on web only, not app), and the error logs (4x spike in "invalid card" errors for Visa). A hypothesis this well-evidenced should be treated as the likely cause pending provider-level confirmation. The specificity to one card network on one platform is a hallmark of an integration bug, not a user behavior change.'
          },
          {
            id: 'b',
            label: 'User behavior changed due to external factors (holiday, news event) causing higher checkout abandonment',
            isCorrect: false,
            level: 'partial',
            feedback: 'Behavioral explanations are valid hypotheses in the absence of system changes, but here a known deployment happened and error logs already show a Visa failure spike. Attributing the drop to behavior without a behavioral signal is premature. This is a common analyst mistake: reaching for demand-side explanations when supply-side (technical) causes are already evident.'
          },
          {
            id: 'c',
            label: 'A UI design change caused user confusion at the payment step',
            isCorrect: false,
            level: 'wrong',
            feedback: 'The known facts explicitly state the payment UI was not changed — only the backend provider. A UI confusion hypothesis directly contradicts the available evidence and would send the team on a false investigation. Always anchor your hypothesis to the known facts before introducing new variables.'
          }
        ]
      },
      {
        id: 'validate',
        stepNumber: 5,
        label: 'Validation Approach',
        prompt: 'Your hypothesis is a payment provider bug causing Visa failures on web. How do you confirm this before escalating to engineering?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Pull provider error API to get failure rate by card type, confirm Visa failure rate pre/post deploy, and cross-check provider dashboard for incident flags',
            isCorrect: true,
            level: 'strong',
            feedback: 'This validation approach directly tests the hypothesis at the source: the provider\'s own error data will show whether Visa failures spiked at the time of the deployment. Comparing pre/post deploy failure rates gives you a clean causal window, and the provider dashboard may already have an incident flag saving you hours of investigation. Specific data sources + a causal window + third-party confirmation is a complete validation.'
          },
          {
            id: 'b',
            label: 'Run a user survey asking checkout dropouts why they did not complete their purchase',
            isCorrect: false,
            level: 'partial',
            feedback: 'Surveys can surface user perception but take hours or days and will likely return vague answers ("it didn\'t work") that you already know. When server-side error logs are available, they provide faster and higher-fidelity confirmation than user self-report. Reserve surveys for hypotheses that are not directly observable in system logs.'
          },
          {
            id: 'c',
            label: 'Run a new A/B test on the checkout flow to measure the impact',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Running an experiment when you believe a known deployment caused the issue is the wrong tool entirely — it delays resolution and exposes more users to a broken payment experience. Experiments are for testing improvements, not diagnosing active technical incidents. When a system failure is suspected, the correct path is validation through error logs and rollback, not experimentation.'
          }
        ]
      }
    ],
    sqlStep: {
      prompt: 'You\'ve confirmed the hypothesis: Visa payment failures spiked on web immediately after the new payment provider was deployed Tuesday afternoon.\n\nWrite a SQL query that validates this by comparing the Visa payment success rate on web versus app, before and after the 3pm deployment window — segmented by card network and platform.',
      hints: [
        'Use a CASE WHEN to create a pre/post deployment flag around the Tuesday 3pm cutoff',
        'Segment by platform (web vs. app) AND card_network (Visa vs. others) — the bug is specific to both dimensions',
        'Your success rate = successful_payments / total_payment_attempts, not total orders',
        'Include a row count per bucket so you can confirm statistical significance of the drop'
      ],
      modelQuery: 'SELECT\n  -- Deployment window: before vs. after Tuesday 3pm\n  CASE\n    WHEN attempted_at < \'2024-01-16 15:00:00\' THEN \'pre_deploy\'\n    ELSE \'post_deploy\'\n  END AS deploy_window,\n\n  platform,          -- \'web\' | \'app\'\n  card_network,      -- \'visa\' | \'mastercard\' | \'amex\' | \'other\'\n\n  COUNT(*)                                          AS total_attempts,\n  SUM(CASE WHEN status = \'success\' THEN 1 ELSE 0 END) AS successful_payments,\n\n  -- Success rate as percentage\n  ROUND(\n    100.0 * SUM(CASE WHEN status = \'success\' THEN 1 ELSE 0 END)\n    / NULLIF(COUNT(*), 0),\n    2\n  ) AS success_rate_pct,\n\n  -- Error breakdown for diagnostics\n  SUM(CASE WHEN error_code = \'invalid_card\' THEN 1 ELSE 0 END) AS invalid_card_errors\n\nFROM payments\nWHERE attempted_at BETWEEN \'2024-01-16 12:00:00\' AND \'2024-01-17 12:00:00\'\n  -- 12-hour window bracketing the deployment for clean pre/post comparison\n\nGROUP BY 1, 2, 3\nORDER BY deploy_window, platform, card_network;',
      annotation: 'Line-by-line explanation:\n\nCASE WHEN attempted_at < Tuesday 3pm → creates a clean pre/post deployment flag. The 12-hour window (noon-to-noon) avoids mixing previous-day traffic into "pre" while giving enough pre-deploy volume for comparison.\n\nplatform + card_network → the two segmentation dimensions where the bug is known to be concentrated. Without both, you\'d see the Visa drop diluted by app traffic (where Visa works fine).\n\nsuccess_rate_pct → the key metric: you expect to see ~62% pre-deploy dropping to ~45-50% post-deploy, but ONLY in the web × Visa cell.\n\ninvalid_card_errors → the specific error code from the known facts. If your hypothesis is correct, this count spikes sharply in the post-deploy × web × Visa row.\n\nNULLIF(COUNT(*), 0) → prevents division-by-zero if a bucket has no rows (e.g., no Amex attempts on app in that window).\n\nExpected output: post_deploy / web / visa row will show significantly lower success_rate_pct and much higher invalid_card_errors compared to all other rows — that\'s your confirmation.'
    },
    seniorDiagnosis: {
      likelyCause: 'Payment provider integration bug causing Visa card failures on web',
      reasoning: 'The timing, specificity, and error log evidence all point to the same cause: the new payment provider integration introduced a bug in Visa card processing that only manifests on web (not app, likely because the app uses a different integration path or SDK version). The 4x spike in "invalid card" errors is a direct symptom of the provider mishandling Visa card tokenization or authorization calls. The fact that the drop is isolated to web and to Visa — rather than all cards or all platforms — is a strong indicator of an integration-specific failure rather than any user behavior change. At -5.3pp conversion and $140k daily revenue impact, this is a P1 incident requiring immediate engineering escalation, not further analysis. The validation path is through the provider\'s error API and their incident dashboard, not through user analytics.',
      validationPlan: [
        'Pull payment provider error API: get failure rate by card network (Visa vs. Mastercard vs. Amex) for the 24 hours before and after deployment',
        'Cross-reference internal payment logs: confirm "invalid card" error rate for Visa on web spiked at exactly the time of provider deployment',
        'Check provider incident dashboard and contact provider support to determine if this is a known issue on their end',
        'Confirm app payment flow uses a separate integration path or SDK — explains why app is not affected'
      ],
      recommendation: 'Escalate immediately to engineering for rollback of the payment provider integration or emergency hotfix for Visa routing. Do not wait for more analysis — $140k/day and the error evidence are sufficient to act. After rollback, confirm conversion rate recovers before closing the incident.',
      commonMistakes: [
        'Starting with user behavior analysis before checking server-side error logs',
        'Running an A/B test to "measure the impact" instead of rolling back the known bad deployment',
        'Attributing the drop to seasonality or demand without ruling out the concurrent deployment first',
        'Segmenting by acquisition channel when the failure is in the payment processing layer'
      ],
      interviewPhrase: 'When a metric drops the same day as a deployment, the deployment is guilty until proven innocent — I check error logs before I open the analytics dashboard.'
    },
    leadershipNote: 'Staff analysts separate the data quality question from the product question immediately. The Visa error spike on web-only is almost certainly a payment provider misconfiguration — not a product regression. The staff move is to get payment engineering on a call within the hour, not to run further segmentation. The business impact framing matters: $140k/day means every hour of delay has a dollar value, and that number belongs in the escalation message. In an interview, \'I would look at the payment data\' is not an answer. The standard is specificity: name the table, the filter, and the expected signal — \'I would query payment_transactions filtered to platform=web and method=Visa for the past 24 hours, group by error_code, and compare the error rate to the prior 7-day baseline\' is a complete next step.',
    spokenSummary: 'CVR dropped but only on web, only for Visa — that\'s a platform-method intersection, not a product regression. My hypothesis is a payment provider misconfiguration on the web checkout path. I\'d query payment_transactions for web Visa in the past 24 hours, group by error_code, and compare the error rate to the prior 7-day baseline. If error rate spiked, I\'m calling payment engineering immediately — not running more segmentation. At $140k per day, every hour of delay has a dollar value, and that number belongs in the escalation message.',
  },

  {
    id: 'RCA02',
    title: 'Zero-Result Rate Spiked After Catalog Update',
    subtitle: 'Vela · B2C Marketplace · Search Quality',
    difficulty: 'analyst',
    isFree: true,
    companies: ['Amazon', 'Airbnb', 'Etsy'],
    domain: 'search',
    linkedConceptIds: ['data-quality-check', 'segmentation', 'funnel-decomposition'],
    context: {
      metricMovement: 'Zero-result rate in search jumped from 4.2% to 11.8% (+7.6pp)',
      businessImpact: 'Users who get zero results have 3x lower purchase conversion — this threatens $2M/month in search-driven GMV',
      timeWindow: 'Spike observed this morning after a scheduled catalog re-ingestion job',
      knownFacts: [
        'A catalog re-ingestion pipeline ran at 2am — quarterly update to add new categories',
        'The spike is only in the "Home & Garden" and "Electronics" categories',
        'Synonym mapping for new subcategories was NOT updated before ingestion',
        'Search query volume is normal — this isn\'t a demand change',
        'The search index shows 23% of queries in those categories return no results vs 4% in others'
      ]
    },
    diagnosisSteps: [
      {
        id: 'system_check',
        stepNumber: 1,
        label: 'System / Data Check',
        prompt: 'Zero-result rate spiked this morning after a catalog pipeline ran. What is your first check?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Verify the catalog ingestion pipeline completed successfully and that the search index is fully updated',
            isCorrect: true,
            level: 'strong',
            feedback: 'A pipeline ran hours before the spike — confirming it completed without errors rules out a partial index state or ingestion failure as the cause. If the pipeline failed mid-run, the index could be in an inconsistent state that causes false zero-results. Checking pipeline completion logs is fast and directly tests the most proximate cause before any deeper analysis.'
          },
          {
            id: 'b',
            label: 'Check search query volume trends over the past 7 days',
            isCorrect: false,
            level: 'partial',
            feedback: 'Query volume is worth checking to rule out a sudden demand surge toward uncommon terms, but the known facts already state query volume is normal. This check is redundant given the evidence and does not address the pipeline-related cause. It is the right second check, not the first.'
          },
          {
            id: 'c',
            label: 'Assume user demand shifted to uncommon queries and investigate seasonal trends',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Jumping to demand-side explanations when a pipeline ran at 2am is a classic misdirection. Catalog pipelines can corrupt or incompletely update search indexes, and that is a far more likely cause of a sudden zero-result spike than an overnight demand shift. Always check system changes before behavioral hypotheses.'
          }
        ]
      },
      {
        id: 'decompose',
        stepNumber: 2,
        label: 'Metric Decomposition',
        prompt: 'Pipeline ran cleanly. Now break the zero-result rate to understand what type of queries are failing. What is the right decomposition?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Break zero-result rate by category, query type (navigational vs. categorical), and new vs. previously-indexed terms',
            isCorrect: true,
            level: 'strong',
            feedback: 'This decomposition directly tests whether the spike is concentrated in newly-added catalog terms (which would point to indexing or synonym gaps) vs. existing terms (which would point to a broader index regression). Knowing that it is new terms in specific categories is the critical insight that drives the synonym hypothesis. Category-level decomposition also matches the already-known signal that Home & Garden and Electronics are affected.'
          },
          {
            id: 'b',
            label: 'Compare total search volume and zero-result count before and after the pipeline ran',
            isCorrect: false,
            level: 'partial',
            feedback: 'Before/after comparison confirms the pipeline timing and quantifies the total impact, but it does not tell you which queries are failing or why. You already know zero-results spiked — the question is which query types are driving it. Decomposition by query characteristics is a more diagnostic next step.'
          },
          {
            id: 'c',
            label: 'Look at overall site traffic and bounce rate to understand user impact',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Overall site traffic is too broad to diagnose a search-layer problem. Bounce rate changes are downstream effects, not root cause indicators. This approach would show you that something is wrong but provide no signal about what search-specific mechanism is failing. Stay in the search layer to diagnose a search problem.'
          }
        ]
      },
      {
        id: 'segment',
        stepNumber: 3,
        label: 'Segmentation',
        prompt: 'Decomposition confirms the spike is in new-category queries in Home & Garden and Electronics. Which segmentation finds the exact failure mode?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Segment by category + query term (new subcategory terms vs. existing terms) and extract the specific zero-result query strings',
            isCorrect: true,
            level: 'strong',
            feedback: 'Extracting the actual zero-result query strings from the new subcategories lets you directly compare them against the synonym table and the new catalog terms — you can see exactly which terms are missing mappings. This is the definitive confirmation step for the synonym hypothesis. Specific query strings are the unit of analysis in search quality diagnosis.'
          },
          {
            id: 'b',
            label: 'Segment by device type (desktop vs. mobile) to see if the issue is platform-specific',
            isCorrect: false,
            level: 'partial',
            feedback: 'Device segmentation is worth a quick check but is unlikely to be diagnostic here — synonym mapping gaps affect all devices equally. If the zero-result rate were device-specific, it would suggest a rendering or query-submission bug rather than an indexing issue. This segmentation does not move you toward the root cause.'
          },
          {
            id: 'c',
            label: 'Segment by user cohort (new vs. returning users) to see if new users are searching differently',
            isCorrect: false,
            level: 'wrong',
            feedback: 'User cohort segmentation is useful for behavioral hypotheses, but this is an index/catalog issue, not a user behavior issue. New and returning users searching the same terms would hit the same zero-result wall. Segmenting by user cohort would show both groups affected equally and provide no diagnostic value here.'
          }
        ]
      },
      {
        id: 'hypothesis',
        stepNumber: 4,
        label: 'Root Cause Hypothesis',
        prompt: 'Zero-result queries are concentrated in new subcategory terms in Home & Garden and Electronics. What is the most likely root cause?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Synonym mappings for new subcategory terms added in the catalog update were not created, so queries for those terms return nothing',
            isCorrect: true,
            level: 'strong',
            feedback: 'This hypothesis is directly supported by the known fact that synonym mapping was not updated before ingestion. When a catalog adds new subcategory terms and the synonym table does not include those terms (or their common user-facing equivalents), search queries using those terms will find no indexed results. The category-specific nature of the spike — only Home & Garden and Electronics — matches exactly where new subcategories were added.'
          },
          {
            id: 'b',
            label: 'User demand shifted toward uncommon or niche queries in those categories',
            isCorrect: false,
            level: 'partial',
            feedback: 'A demand shift is a valid hypothesis when query volume changes, but the known facts state query volume is normal. Demand shifts also tend to be gradual rather than overnight spikes. The simultaneous pipeline run and the synonym gap evidence make a catalog/indexing explanation far more plausible than a sudden behavioral shift.'
          },
          {
            id: 'c',
            label: 'The search ranking algorithm regressed and is mis-scoring results for those categories',
            isCorrect: false,
            level: 'wrong',
            feedback: 'A ranking regression would cause worse results or lower-quality matches, but zero results means no items were returned at all — this is an index coverage issue, not a ranking issue. Ranking regressions manifest as clicks on poor results or low conversion on search, not as zero-result rates. Distinguishing between "bad results" and "no results" is a critical diagnostic distinction in search quality.'
          }
        ]
      },
      {
        id: 'validate',
        stepNumber: 5,
        label: 'Validation Approach',
        prompt: 'Your hypothesis is missing synonym mappings for new catalog terms. How do you confirm this before asking engineering to fix it?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Pull the top 50 zero-result query strings, cross-reference against new catalog terms from the ingestion, and check the synonym table for gaps',
            isCorrect: true,
            level: 'strong',
            feedback: 'This validation directly tests the mechanism: if the zero-result queries map to newly-ingested catalog terms that are absent from the synonym table, the root cause is confirmed with specificity. You can hand engineering an exact list of missing synonym entries, which accelerates the fix. Concrete query strings + catalog diff + synonym table comparison is a complete and actionable validation.'
          },
          {
            id: 'b',
            label: 'Survey users who received zero results to ask what they were looking for',
            isCorrect: false,
            level: 'partial',
            feedback: 'User surveys take time and will produce noisy data when you can directly inspect the query logs and synonym table. For a search quality issue with clear system-side evidence, structured query log analysis is faster and more precise than user self-report. Use surveys when you lack quantitative signal, not when the signal is already in your logs.'
          },
          {
            id: 'c',
            label: 'Run a new ML ranking experiment to improve coverage for the affected categories',
            isCorrect: false,
            level: 'wrong',
            feedback: 'A ranking experiment is the wrong tool for a zero-result problem — ranking only applies when results exist. Running an experiment here would test a fix that doesn\'t address the actual cause and would delay resolution. The fix is operational (add synonym mappings), not algorithmic, and should be validated and deployed without an experiment cycle.'
          }
        ]
      }
    ],
    sqlStep: {
      prompt: 'You\'ve identified the hypothesis: the catalog re-ingestion added new subcategory terms in Home & Garden and Electronics, but synonym mappings for those terms were never created — so user queries return zero results.\n\nWrite a SQL query that extracts the top zero-result query strings from those two categories since the pipeline ran, so you can cross-reference them against the synonym table and confirm the missing mappings.',
      hints: [
        'Filter to searches with result_count = 0 and only after the 2am pipeline run timestamp',
        'Limit to the two affected categories: Home & Garden and Electronics',
        'Group by search_query to find the most frequently searched zero-result terms',
        'Order by frequency descending — the highest-volume zero-result queries are the ones to fix first'
      ],
      modelQuery: 'SELECT\n  sq.search_query,\n  sq.category,\n  COUNT(*)                        AS zero_result_count,\n  COUNT(DISTINCT sq.user_id)      AS unique_users_affected,\n\n  -- Check if this term exists anywhere in the synonym table\n  CASE\n    WHEN st.canonical_term IS NOT NULL THEN \'has_synonym\'\n    ELSE \'NO SYNONYM — MISSING\'\n  END AS synonym_status,\n\n  -- Check if the term was added in the catalog update\n  CASE\n    WHEN ct.term IS NOT NULL THEN \'new_catalog_term\'\n    ELSE \'pre-existing_term\'\n  END AS catalog_status\n\nFROM search_queries sq\n\n-- Left join to synonym table to identify gaps\nLEFT JOIN synonym_table st\n  ON LOWER(sq.search_query) = LOWER(st.user_query)\n\n-- Left join to new catalog terms added in the 2am pipeline\nLEFT JOIN catalog_terms ct\n  ON LOWER(sq.search_query) = LOWER(ct.term)\n  AND ct.ingested_at >= \'2024-01-17 02:00:00\'  -- Only terms from today\'s run\n\nWHERE sq.result_count = 0\n  AND sq.searched_at >= \'2024-01-17 02:00:00\'  -- After the pipeline ran\n  AND sq.category IN (\'Home & Garden\', \'Electronics\')\n\nGROUP BY 1, 2, 5, 6\nORDER BY zero_result_count DESC\nLIMIT 50;',
      annotation: 'Line-by-line explanation:\n\nresult_count = 0 → filters to only zero-result searches. This is the population we\'re investigating.\n\nsearched_at >= 2am pipeline run → ensures we\'re only looking at queries that happened after the catalog update, not pre-existing zero-result terms.\n\ncategory IN (\'Home & Garden\', \'Electronics\') → scopes to the two affected categories from the known facts, keeping the result set focused.\n\nLEFT JOIN synonym_table → if synonym_status = \'NO SYNONYM — MISSING\', this row is a confirmed gap. The JOIN maps user query terms against the canonical synonym entries.\n\nLEFT JOIN catalog_terms → the \'new_catalog_term\' flag confirms which zero-result queries correspond to terms literally added in the 2am pipeline. The most actionable rows are: zero_result_count HIGH + synonym_status \'NO SYNONYM\' + catalog_status \'new_catalog_term\'.\n\nCOUNT(DISTINCT user_id) → shows how many unique users were affected, not just query count. A term searched by 500 different users is higher priority than one searched 500 times by the same user.\n\nExpected output: top rows will show new catalog terms with \'NO SYNONYM — MISSING\' status and high unique user counts. Hand this list to engineering — each row is a synonym entry that needs to be created.'
    },
    seniorDiagnosis: {
      likelyCause: 'Missing synonym mappings for new subcategory terms added in the catalog re-ingestion',
      reasoning: 'When the catalog pipeline added new subcategories in Home & Garden and Electronics, the search synonym table was not updated to include the new terms or their user-facing equivalents. As a result, user queries using those new category terms return zero results because the index has the items but the query terms do not match the indexed identifiers. The scope — 23% zero-result rate in affected categories vs. 4% elsewhere — and the timing alignment with the pipeline run make this a near-certain operational gap, not an algorithmic issue. This type of failure is common in catalog-driven search systems: new taxonomy additions break search coverage whenever synonym and keyword mapping pipelines are not run in sync with catalog ingestion. The fix is operational (add synonyms and re-index), and the validation is a direct inspection of query strings against the synonym table.',
      validationPlan: [
        'Export the top 100 zero-result query strings from the affected categories (Home & Garden, Electronics) since the pipeline ran',
        'Compare those query strings against the list of new subcategory terms added in the 2am ingestion to confirm overlap',
        'Inspect the synonym table for each matching new term to confirm the synonym entries are absent',
        'Spot-test: manually add synonym mappings for 5 high-volume zero-result terms and confirm search returns results'
      ],
      recommendation: 'Add missing synonym mappings for all new subcategory terms from the catalog update and trigger a re-index for the affected categories. Implement a pre-ingestion validation check that flags new catalog terms with no synonym coverage to prevent recurrence on future quarterly updates.',
      commonMistakes: [
        'Diagnosing as a ranking regression when zero results indicates an index coverage gap, not a ranking issue',
        'Investigating demand shifts when the pipeline timing is the obvious starting point',
        'Attempting to fix with an ML experiment instead of an operational synonym update',
        'Failing to add a pre-ingestion synonym coverage check to prevent recurrence'
      ],
      interviewPhrase: 'Zero results is a coverage problem, not a ranking problem — before touching the algorithm, I check whether the index even has the items the query is looking for.'
    },
    leadershipNote: 'Staff analysts treat a post-ingestion search degradation as an indexing integrity question first, not a query behavior question. The synonym mapping gap in new categories is a systemic process failure — it means no pre-launch search coverage check exists in the catalog pipeline. The forward-looking ask is not just a fix but a guardrail: every catalog update should gate on synonym coverage before the index goes live.',
    spokenSummary: 'Zero-result rate spiked the same day as a catalog ingestion — that\'s a coverage problem, not a ranking problem. I\'d query zero-result rate by category and compare pre- versus post-ingestion. If it\'s concentrated in newly added categories, the ingestion pipeline didn\'t carry over the synonym mappings. Fix is operational: rebuild the index for those categories with synonym coverage. The structural fix is a pre-ingestion gate — no catalog update goes live without a synonym coverage check.',
  },

  {
    id: 'RCA03',
    title: 'Buyer Cancellations Up 40% in Three Cities',
    subtitle: 'Crafted · Two-Sided Marketplace · Fulfillment',
    difficulty: 'analyst',
    isFree: true,
    companies: ['Airbnb', 'DoorDash', 'Uber Eats'],
    domain: 'marketplace',
    linkedConceptIds: ['segmentation', 'marketplace-interference', 'funnel-decomposition'],
    context: {
      metricMovement: 'Buyer cancellation rate increased from 3.1% to 4.3% overall, but up 40% in NYC, Chicago, and LA',
      businessImpact: 'Cancellations trigger refunds and seller disputes — sustained increase would erode both sides of the marketplace',
      timeWindow: 'Increase started 10 days ago, coinciding with a new seller onboarding cohort',
      knownFacts: [
        'A new seller onboarding batch was activated 10 days ago — 380 new sellers, concentrated in those 3 cities',
        'Cancellation reason codes show "item not as described" up 3x in those cities',
        '"Seller unresponsive" cancellation reason is up 2x',
        'Star rating for new sellers (cohort) averages 3.8 vs. 4.6 for existing sellers',
        'No product changes were deployed in this period'
      ]
    },
    diagnosisSteps: [
      {
        id: 'system_check',
        stepNumber: 1,
        label: 'System / Data Check',
        prompt: 'Cancellation rate spiked 10 days ago. Before assuming buyer behavior changed, what do you check first?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Verify cancellation tracking logic and refund attribution have not changed — confirm the data definition is consistent',
            isCorrect: true,
            level: 'strong',
            feedback: 'If the cancellation tracking code or attribution logic changed around the same time as the spike, you could be measuring more cancellations simply because you are capturing more of them. Confirming data consistency is the first step in any metric investigation — a real 40% increase in cancellation rate has significant business implications, so you want to be certain before acting. No product changes were deployed, but data pipeline or tracking changes can happen independently.'
          },
          {
            id: 'b',
            label: 'Check overall GMV trends for anomalies that might indicate instrumentation problems',
            isCorrect: false,
            level: 'partial',
            feedback: 'GMV trends can signal data issues but are not the most direct check for cancellation tracking accuracy. A targeted look at the cancellation event tracking code and refund pipeline is faster and more specific. GMV is a useful corroboration step after you have confirmed cancellation data integrity.'
          },
          {
            id: 'c',
            label: 'Accept the data as accurate and immediately start analyzing buyer behavior in those cities',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Skipping the data integrity check is risky when the metric moved significantly and a data pipeline may have changed. In two-sided marketplace analytics, cancellation tracking can be affected by changes in how refunds are attributed, how partial cancellations are counted, or how reason codes are classified. Validate the measurement before acting on it.'
          }
        ]
      },
      {
        id: 'decompose',
        stepNumber: 2,
        label: 'Metric Decomposition',
        prompt: 'Data is confirmed accurate. Now decompose the cancellation rate metric to find what is driving the increase. Which decomposition is most revealing?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Break cancellations by reason code + seller cohort (new vs. existing sellers) + geography',
            isCorrect: true,
            level: 'strong',
            feedback: 'This three-dimensional decomposition directly tests the seller cohort hypothesis: if new sellers are driving cancellations, the reason codes and geography will line up with the new onboarding batch. Reason code analysis tells you the mechanism (listing accuracy vs. responsiveness), seller cohort tells you the supply-side source, and geography confirms the concentration matches the new seller batch locations. Together these are a complete diagnostic picture.'
          },
          {
            id: 'b',
            label: 'Compare total cancellation rate this week vs. last week across the entire marketplace',
            isCorrect: false,
            level: 'partial',
            feedback: 'Week-over-week comparison at the aggregate level confirms the trend but does not reveal the driver. You already know cancellations are up — the question is why and in which segment. Aggregate comparison is a monitoring step, not a diagnostic step; decomposition by seller cohort and reason code is far more actionable.'
          },
          {
            id: 'c',
            label: 'Look at total order volume to see if demand increased and overwhelmed fulfillment',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Total order volume would help if the hypothesis were a demand surge overwhelming supply, but the reason codes point to listing quality and seller responsiveness — not capacity. Looking at aggregate order volume here would distract from the seller cohort signal that is already visible in the known facts.'
          }
        ]
      },
      {
        id: 'segment',
        stepNumber: 3,
        label: 'Segmentation',
        prompt: 'Decomposition confirms reason codes "item not as described" and "seller unresponsive" are concentrated in those three cities. Which segmentation confirms the seller cohort hypothesis?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Segment by new vs. established sellers + cancellation reason code + city to compare cancellation rates directly between cohorts',
            isCorrect: true,
            level: 'strong',
            feedback: 'Comparing cancellation rates between new and established sellers in those three cities with reason code breakdown is the definitive test of the seller quality hypothesis. If new sellers have 3-4x the cancellation rate of established sellers on the same reason codes, the cohort is confirmed as the driver. The seller rating differential (3.8 vs. 4.6) already suggests quality gap — this segmentation quantifies it with outcome data.'
          },
          {
            id: 'b',
            label: 'Segment by product category to see if specific item types are driving cancellations',
            isCorrect: false,
            level: 'partial',
            feedback: 'Category segmentation is a useful secondary check — if new sellers are concentrated in specific categories, category and cohort effects will overlap. However, category is a downstream attribute of sellers, not the root cause variable. The seller cohort is the primary segmentation given the timing and known seller rating differential.'
          },
          {
            id: 'c',
            label: 'Segment by buyer cohort (new vs. returning buyers) to see if behavior changed',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Buyer cohort segmentation tests whether buyers changed their behavior, but the reason codes point to supply-side failures (inaccurate listings, unresponsive sellers). If new buyers were cancelling more due to behavior changes, the reason codes would reflect different patterns. The evidence already points to the seller side — segment there.'
          }
        ]
      },
      {
        id: 'hypothesis',
        stepNumber: 4,
        label: 'Root Cause Hypothesis',
        prompt: 'New sellers in those cities have 3.8 average rating vs. 4.6 for existing sellers, and "not as described" cancellations are 3x higher. What is the root cause hypothesis?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'New seller onboarding cohort has lower listing quality and slower response times, driving "not as described" and "seller unresponsive" cancellations in cities where they are concentrated',
            isCorrect: true,
            level: 'strong',
            feedback: 'The hypothesis aligns with all the known signals: new sellers rated 3.8 vs. 4.6 (quality gap), cancellation reasons pointing to listing accuracy and responsiveness (operational gap), and geographic concentration matching where the new batch was onboarded. Two-sided marketplace quality problems often originate with seller onboarding batches — the platform scales supply faster than quality assurance can keep up with. The mechanism is clear: new sellers post inaccurate listings and respond slowly, buyers cancel.'
          },
          {
            id: 'b',
            label: 'Demand spike in those cities overwhelmed supply, forcing sellers to cancel or fulfill late',
            isCorrect: false,
            level: 'partial',
            feedback: 'A demand surge is a plausible marketplace hypothesis but is not supported by the specific reason codes ("not as described" and "seller unresponsive"). A demand surge would produce "out of stock" or "long wait" cancellations, not listing inaccuracy cancellations. The reason code evidence is the key distinguishing factor here.'
          },
          {
            id: 'c',
            label: 'Buyers in those cities developed different shopping behavior or higher expectations',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Attributing a marketplace quality problem to buyer behavior without behavioral evidence is a supply-side exoneration fallacy. The cancellation reason codes explicitly point to seller failures (inaccurate listings, unresponsiveness), not buyer preferences. When reason codes are available, they are more reliable than demographic hypotheses about buyer behavior changes.'
          }
        ]
      },
      {
        id: 'validate',
        stepNumber: 5,
        label: 'Validation Approach',
        prompt: 'Your hypothesis is new seller cohort quality driving cancellations. How do you confirm this and quantify the impact?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Pull cancellation rate by seller cohort (new vs. existing) in those cities, cross-reference listing accuracy scores and response time metrics for the new cohort',
            isCorrect: true,
            level: 'strong',
            feedback: 'This validation tests the mechanism directly: if new sellers show 2-3x higher cancellation rates and their listing accuracy scores and response times are below threshold, the quality gap is confirmed with actionable data. Listing accuracy score and response time are the operational inputs that explain the reason code outputs ("not as described," "unresponsive"). This gives marketplace ops a specific cohort to retrain or off-board.'
          },
          {
            id: 'b',
            label: 'Send an NPS survey to buyers who cancelled to understand their experience',
            isCorrect: false,
            level: 'partial',
            feedback: 'NPS surveys can surface qualitative context but are slow and produce self-reported data when you already have reason codes, ratings, and cohort data available. The quantitative evidence chain from seller cohort to listing accuracy to cancellation reason to outcome is already available in your platform data. Reserve surveys for issues where the quantitative signal is ambiguous.'
          },
          {
            id: 'c',
            label: 'Run a promotional campaign in those cities to offset cancellation rates',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Running a promotional campaign does not validate a hypothesis — it attempts to mask the symptom without confirming the cause. If the root cause is seller quality, a promotion would temporarily reduce cancellation rates while the underlying quality problem persists and compounds. Always validate before intervening, and choose interventions that address the root cause.'
          }
        ]
      }
    ],
    sqlStep: {
      prompt: 'You\'ve hypothesized that the new seller onboarding cohort (380 sellers activated 10 days ago) has lower listing quality and slower response times, causing the buyer cancellation spike in NYC, Chicago, and LA.\n\nWrite a SQL query that compares cancellation rates between the new seller cohort and established sellers in those three cities, broken out by cancellation reason code — to confirm the cohort is the driver and quantify the quality gap.',
      hints: [
        'Join orders to sellers to get the seller cohort (activated_at date for new vs. established)',
        'Filter geography to NYC, Chicago, LA using a city column or zip-to-city mapping',
        'Break out cancellation reason codes: group by reason_code to compare "item_not_as_described" and "seller_unresponsive" specifically',
        'Calculate cancellation rate as cancelled_orders / total_orders per cohort to normalize for different cohort sizes'
      ],
      modelQuery: 'WITH seller_cohorts AS (\n  -- Label sellers as new (activated in last 14 days) vs. established\n  SELECT\n    seller_id,\n    city,\n    average_rating,\n    CASE\n      WHEN activated_at >= CURRENT_DATE - INTERVAL \'14 days\' THEN \'new_cohort\'\n      ELSE \'established\'\n    END AS seller_cohort\n  FROM sellers\n  WHERE city IN (\'New York\', \'Chicago\', \'Los Angeles\')\n),\n\norder_outcomes AS (\n  SELECT\n    o.order_id,\n    o.seller_id,\n    o.city,\n    o.status,\n    o.cancellation_reason,   -- \'item_not_as_described\' | \'seller_unresponsive\' | \'buyer_changed_mind\' | etc.\n    sc.seller_cohort,\n    sc.average_rating\n  FROM orders o\n  INNER JOIN seller_cohorts sc ON o.seller_id = sc.seller_id\n  WHERE o.created_at >= CURRENT_DATE - INTERVAL \'14 days\'\n)\n\nSELECT\n  seller_cohort,\n  cancellation_reason,\n\n  COUNT(*)                                          AS total_orders,\n  SUM(CASE WHEN status = \'cancelled\' THEN 1 ELSE 0 END) AS cancelled_orders,\n\n  ROUND(\n    100.0 * SUM(CASE WHEN status = \'cancelled\' THEN 1 ELSE 0 END)\n    / NULLIF(COUNT(*), 0),\n    2\n  ) AS cancellation_rate_pct,\n\n  ROUND(AVG(average_rating), 2)                    AS avg_seller_rating\n\nFROM order_outcomes\nGROUP BY 1, 2\nORDER BY seller_cohort, cancellation_rate_pct DESC;',
      annotation: 'Line-by-line explanation:\n\nseller_cohorts CTE → separates sellers into new (activated in last 14 days, matching the onboarding batch) vs. established. The 14-day window captures the batch activated "10 days ago" with some buffer.\n\ncity IN (\'New York\', \'Chicago\', \'Los Angeles\') → scopes to the three geographies where the cancellation spike is confirmed.\n\norder_outcomes CTE → joins orders to sellers, pulling cancellation_reason. This is the key field — we need to see "item_not_as_described" and "seller_unresponsive" broken out by cohort.\n\ncancellation_rate_pct → normalizes by total orders so you\'re comparing rates, not raw counts. New sellers may have fewer total orders, making raw count comparison misleading.\n\navg_seller_rating → included per row to confirm the 3.8 vs. 4.6 rating gap alongside the cancellation rate gap.\n\nExpected output: new_cohort rows will show significantly higher cancellation_rate_pct on "item_not_as_described" and "seller_unresponsive" reason codes specifically (3x and 2x respectively per the known facts), while the established seller rows will show lower rates on the same reasons. This is your definitive confirmation.'
    },
    seniorDiagnosis: {
      likelyCause: 'New seller onboarding cohort has lower listing quality and slower response times, driving cancellations in concentrated cities',
      reasoning: 'The 10-day timeline, the geographic concentration in cities where the new seller batch was onboarded, and the specific reason codes all point to a supply quality problem from the new seller cohort. The 380 new sellers onboarded 10 days ago introduced a supply expansion that was not matched by adequate quality controls — their listings contain inaccuracies and their response times are slow relative to established sellers. The 3.8 vs. 4.6 star rating differential is a leading indicator that was visible before this analysis but was not flagged as a risk. In two-sided marketplaces, rapid seller supply expansion without quality gates is a recurring failure mode: the platform optimizes for supply growth but the quality assurance process does not scale at the same rate. This is a supply quality problem, not a demand problem, and the fix is operational — retrain, constrain, or off-board the underperforming new sellers.',
      validationPlan: [
        'Pull cancellation rate for new seller cohort vs. established sellers in NYC, Chicago, and LA for the past 10 days',
        'Extract listing accuracy score (% of listings flagged for description mismatch) and median response time for the new cohort vs. established sellers',
        'Cross-reference seller star ratings with cancellation rates at the individual seller level to confirm quality-outcome correlation',
        'Check whether the 380 new sellers went through the same quality review process as previous batches — determine if the onboarding process changed'
      ],
      recommendation: 'Identify the specific new sellers with cancellation rates above threshold and either place them in a quality improvement program or suspend listings until listings are corrected. Implement a 14-day post-onboarding quality monitoring window for all new seller batches with automatic flagging when cancellation rate exceeds 2x the cohort average.',
      commonMistakes: [
        'Attributing cancellations to buyer behavior before examining seller-side quality signals',
        'Running a promotion to offset the symptom instead of diagnosing the supply quality cause',
        'Segmenting by product category rather than seller cohort when timing points to a cohort-level issue',
        'Not using reason codes as primary diagnostic evidence — they directly name the mechanism'
      ],
      interviewPhrase: 'In marketplace cancellation analysis, reason codes are your fastest diagnostic tool — "not as described" tells you this is a supply quality problem, not a demand problem, before you pull a single additional query.'
    },
    leadershipNote: 'Staff analysts ask who is losing when a marketplace metric breaks — buyer or seller, demand or supply. The cancellation spike concentrated in three high-density cities is a supply quality problem, not a demand problem, and reason codes tell that story before any additional segmentation. The stakeholder communication challenge is framing this to the seller operations team without triggering defensiveness — the ask is operational improvement, not blame assignment. Never say \'I would investigate the cancellations further\' — always specify the query: \'I would pull order_cancellations grouped by cancellation_reason_code, filtered to the three flagged cities, versus the prior 4-week baseline in those same cities.\' Reason code distribution is the single data point that routes the entire investigation.',
    spokenSummary: 'Cancellations spiked in three cities but buyer traffic is flat — so this is supply-side, not demand-side. My first move is reason codes: pull order_cancellations grouped by cancellation_reason_code for those cities versus the prior 4-week baseline. If I see \'not as described\' or \'wrong item\' dominating, this is a seller catalog quality problem. The fix is a targeted seller quality audit in those three cities — not a platform-wide policy change. When framing it to seller ops, the ask is operational improvement, not blame.',
  },

  {
    id: 'RCA04',
    title: 'D7 Retention Fell Despite High Open Rates',
    subtitle: 'Orion · Consumer Mobile · Re-engagement',
    difficulty: 'senior',
    isFree: false,
    companies: ['Spotify', 'Netflix', 'TikTok'],
    domain: 'retention',
    linkedConceptIds: ['proxy-metric', 'metric-gaming', 'cohort-analysis'],
    context: {
      metricMovement: 'D7 retention dropped from 41% to 36% (-5pp) for the cohort that received a new re-engagement push campaign',
      businessImpact: 'D7 retention drop of 5pp predicts ~12% lower 30-day LTV for affected cohort',
      timeWindow: 'Drop observed in cohorts acquired in the last 3 weeks who received the new push campaign',
      knownFacts: [
        'New re-engagement push campaign launched 3 weeks ago — 4 push notifications per day (up from 1)',
        'Notification open rate for the new campaign: 34% (vs. 12% baseline)',
        'Push opt-out rate for campaign cohort: 18% (baseline: 4%)',
        'App uninstall rate for campaign cohort: 6.2% (baseline: 1.8%)',
        'Task completion per session for campaign cohort: -8% versus non-campaign cohort'
      ]
    },
    diagnosisSteps: [
      {
        id: 'system_check',
        stepNumber: 1,
        label: 'System / Data Check',
        prompt: 'D7 retention dropped for the campaign cohort. Before concluding the campaign caused the drop, what do you verify?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Verify the campaign cohort definition and retention measurement methodology have not changed — confirm the cohort is being measured consistently',
            isCorrect: true,
            level: 'strong',
            feedback: 'Retention measurement can be affected by how the cohort is defined (install date vs. first engagement), how "return" is measured (any open vs. task completion), and whether the campaign cohort inadvertently selects a different user mix than the baseline. Confirming the measurement is consistent before attributing the drop to the campaign is essential — a 5pp retention drop at the cohort level has significant LTV implications and warrants careful measurement validation.'
          },
          {
            id: 'b',
            label: 'Check whether new acquisition sources changed in the last 3 weeks that might explain user quality differences',
            isCorrect: false,
            level: 'partial',
            feedback: 'Acquisition mix shift is a valid confound to check — if the campaign cohort acquired users through lower-quality channels, the retention drop could reflect user quality rather than campaign impact. This is worth investigating as a secondary check, but confirming the cohort measurement definition comes first since it is faster to verify and more directly tests data integrity.'
          },
          {
            id: 'c',
            label: 'Assume the drop is seasonal and compare to the same period last year',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Seasonal comparison ignores the campaign launch which is the most proximate and specific change. Seasonal effects would affect the non-campaign cohort equally, but the drop is concentrated in the campaign cohort. When a specific intervention is launched and a metric moves in the affected group, the intervention is the primary hypothesis, not seasonality.'
          }
        ]
      },
      {
        id: 'decompose',
        stepNumber: 2,
        label: 'Metric Decomposition',
        prompt: 'Measurement is confirmed accurate. Now decompose the retention metric to understand where in the engagement funnel the drop occurs. What decomposition do you run?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Break retention by campaign cohort vs. non-campaign cohort, and within the campaign cohort by notification frequency exposure bucket (1/day vs. 2/day vs. 4/day)',
            isCorrect: true,
            level: 'strong',
            feedback: 'Comparing campaign vs. non-campaign cohort isolates the campaign effect from organic retention trends. Breaking the campaign cohort by frequency bucket tests the dose-response relationship: if retention drops more sharply with higher notification frequency, that is strong evidence of notification fatigue rather than any other campaign variable. Frequency buckets are the precise lever that was changed in this campaign.'
          },
          {
            id: 'b',
            label: 'Compare overall DAU week-over-week and look for the inflection point',
            isCorrect: false,
            level: 'partial',
            feedback: 'DAU trends can show the aggregate impact of retention decline but do not isolate the campaign cohort or reveal the frequency-retention relationship. Cohort-level analysis is the correct instrument for retention diagnosis — DAU is a lagging aggregate that mixes too many cohorts to be diagnostic here.'
          },
          {
            id: 'c',
            label: 'Look at total new user signups and install volume trends',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Install volume is an acquisition metric, not a retention metric. Retention diagnosis requires looking at what happens to users after they install — specifically, whether they return. Looking at install trends would address a different question (are we acquiring users?) rather than the current question (why are acquired users not returning?).'
          }
        ]
      },
      {
        id: 'segment',
        stepNumber: 3,
        label: 'Segmentation',
        prompt: 'Decomposition shows the retention gap is largest in the highest-frequency notification bucket. Which segmentation reveals the behavioral mechanism?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Segment campaign cohort by opt-out status, uninstall timing, task completion depth per session, and notification frequency received',
            isCorrect: true,
            level: 'strong',
            feedback: 'This segmentation tests the notification fatigue mechanism at the behavioral level: users who opted out or uninstalled early would show near-zero D7 retention, driving the aggregate drop. Task completion per session (-8%) already suggests users who stayed are less engaged — cross-referencing this with opt-out timing and frequency exposure reveals whether the damage is from churned users or degraded engagement among retained users. Both dimensions are important.'
          },
          {
            id: 'b',
            label: 'Segment by device OS (iOS vs. Android) to see if notification behavior differs by platform',
            isCorrect: false,
            level: 'partial',
            feedback: 'Platform segmentation is relevant if you suspect notification delivery or opt-out mechanics differ between iOS and Android (which they do — iOS requires explicit opt-in). However, the primary question is whether notification volume is driving fatigue, not whether the effect differs by platform. OS segmentation is a useful third-level check after the frequency-fatigue relationship is established.'
          },
          {
            id: 'c',
            label: 'Segment by acquisition channel to see if paid users respond differently to push campaigns',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Acquisition channel segmentation tests a user selection hypothesis, but the high opt-out rate (18% vs. 4%) and uninstall rate (6.2% vs. 1.8%) suggest the campaign is creating negative reactions regardless of acquisition source. The behavioral signals already point to a campaign design problem, not a user selection problem. Segmenting by channel would not reveal the notification fatigue mechanism.'
          }
        ]
      },
      {
        id: 'hypothesis',
        stepNumber: 4,
        label: 'Root Cause Hypothesis',
        prompt: '18% opt-out rate, 6.2% uninstall rate, -8% task completion per session, and high open rate. What is the root cause hypothesis?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Notification fatigue: 4x frequency increase annoyed users into opting out and uninstalling. High open rate reflects involuntary phone pickups, not genuine intent',
            isCorrect: true,
            level: 'strong',
            feedback: 'This is a classic proxy metric misinterpretation: open rate was used as a success signal, but it conflates genuine engagement with reactive taps on intrusive notifications. The 4.5x increase in opt-outs (4% to 18%) and the 3.4x increase in uninstalls (1.8% to 6.2%) are direct behavioral signals that users found the increased frequency aversive. Task completion per session declining -8% confirms that opens are not translating to meaningful engagement. High open rates with low task completion and high churn is the diagnostic fingerprint of notification fatigue.'
          },
          {
            id: 'b',
            label: 'D7 retention drop is seasonal — the acquisition period coincides with a low-quality user cycle',
            isCorrect: false,
            level: 'partial',
            feedback: 'Seasonality is worth ruling out, but a seasonal effect would affect both campaign and non-campaign cohorts equally. Since the drop is concentrated in the campaign cohort, a campaign-specific mechanism is far more likely. The 4.5x increase in opt-outs in the campaign cohort vs. baseline is too large to attribute to seasonality alone.'
          },
          {
            id: 'c',
            label: 'App bugs introduced at the same time as the campaign are causing session drops and reducing retention',
            isCorrect: false,
            level: 'wrong',
            feedback: 'An app bug would affect all users, not just the campaign cohort. The retention drop is specifically concentrated in users who received the new push campaign, which makes the campaign the far more parsimonious explanation. App bugs also typically manifest as crashes or errors, not as opt-out spikes — the opt-out behavior is a deliberate user response to the notification experience.'
          }
        ]
      },
      {
        id: 'validate',
        stepNumber: 5,
        label: 'Validation Approach',
        prompt: 'Your hypothesis is notification fatigue from 4x frequency increase. How do you confirm the causal mechanism before recommending changes?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Compare D7 retention by notification frequency bucket, cross-reference opt-out timing with retention drop, and check task completion for opted-out vs. active users',
            isCorrect: true,
            level: 'strong',
            feedback: 'This validation tests the dose-response relationship (more notifications = lower retention), the behavioral mechanism (opt-outs as the retention drain), and the engagement quality (whether retained users are actually engaging more deeply or just opening). If retention decreases monotonically with frequency and opted-out users show the steepest retention drop, the fatigue mechanism is confirmed with enough precision to drive a specific recommendation: reduce frequency.'
          },
          {
            id: 'b',
            label: 'Plan a future A/B test on notification frequency to measure the causal impact',
            isCorrect: false,
            level: 'partial',
            feedback: 'A future A/B test on frequency is the right long-term approach for optimizing notification cadence, but it does not help you diagnose the current retention drop quickly. You already have the data from the current campaign — analyzing frequency buckets within the existing cohort gives you directional evidence faster. Run the analysis first, then design a cleaner experiment to optimize the frequency ceiling.'
          },
          {
            id: 'c',
            label: 'Survey opted-out users to understand why they disabled notifications',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Opted-out users are hard to reach (they have already signaled disengagement) and will largely say "too many notifications" — which you already infer from the 4x frequency increase. The quantitative data (opt-out rate, uninstall rate, task completion, frequency buckets) is more actionable and faster to analyze. Surveys are valuable when the behavioral signal is ambiguous; here it is not.'
          }
        ]
      }
    ],
    sqlStep: {
      prompt: 'You\'ve hypothesized notification fatigue: the 4x frequency increase (from 1 to 4 pushes/day) is annoying users into opting out and uninstalling, which directly suppresses D7 retention. The high open rate is a misleading proxy — it conflates genuine engagement with reactive phone pickups.\n\nWrite a SQL query that shows D7 retention by notification frequency bucket, so you can confirm the dose-response relationship: the more notifications a user received per day, the lower their D7 retention.',
      hints: [
        'Create frequency buckets: 1/day, 2/day, 3/day, 4/day (or use ranges like 1-2 vs. 3-4)',
        'D7 retention = users who had any app session on day 7 after install / total users in that cohort',
        'Only include users from cohorts acquired since the campaign launched (3 weeks ago)',
        'Include opt_out_rate and uninstall_rate per bucket to confirm the fatigue mechanism alongside retention'
      ],
      modelQuery: 'WITH user_notification_exposure AS (\n  -- Calculate average daily push notifications received per user\n  -- for the first 7 days after install\n  SELECT\n    u.user_id,\n    u.install_date,\n    u.cohort_type,   -- \'campaign\' | \'control\'\n    COUNT(n.notification_id) / 7.0  AS avg_daily_notifications,\n\n    -- Bucket users by frequency received\n    CASE\n      WHEN COUNT(n.notification_id) / 7.0 < 1.5  THEN \'1/day\'\n      WHEN COUNT(n.notification_id) / 7.0 < 2.5  THEN \'2/day\'\n      WHEN COUNT(n.notification_id) / 7.0 < 3.5  THEN \'3/day\'\n      ELSE \'4/day\'\n    END AS frequency_bucket,\n\n    MAX(CASE WHEN n.event_type = \'opt_out\'   THEN 1 ELSE 0 END) AS did_opt_out,\n    MAX(CASE WHEN n.event_type = \'uninstall\' THEN 1 ELSE 0 END) AS did_uninstall\n\n  FROM users u\n  LEFT JOIN notification_events n\n    ON u.user_id = n.user_id\n    AND n.event_date BETWEEN u.install_date AND u.install_date + INTERVAL \'7 days\'\n  WHERE u.install_date >= CURRENT_DATE - INTERVAL \'21 days\'  -- Last 3 weeks (campaign period)\n  GROUP BY 1, 2, 3\n),\n\nd7_sessions AS (\n  -- Flag users who had any session on day 7 (D7 = retained)\n  SELECT DISTINCT user_id\n  FROM app_sessions\n  WHERE DATE(session_start) = (\n    SELECT install_date + INTERVAL \'7 days\'\n    FROM users u2\n    WHERE u2.user_id = app_sessions.user_id\n    LIMIT 1\n  )\n)\n\nSELECT\n  une.frequency_bucket,\n  une.cohort_type,\n  COUNT(*)                                                  AS total_users,\n  SUM(CASE WHEN ds.user_id IS NOT NULL THEN 1 ELSE 0 END)  AS d7_retained_users,\n\n  ROUND(\n    100.0 * SUM(CASE WHEN ds.user_id IS NOT NULL THEN 1 ELSE 0 END)\n    / NULLIF(COUNT(*), 0), 2\n  )                                                         AS d7_retention_pct,\n\n  ROUND(100.0 * AVG(une.did_opt_out),    2)                AS opt_out_rate_pct,\n  ROUND(100.0 * AVG(une.did_uninstall),  2)                AS uninstall_rate_pct\n\nFROM user_notification_exposure une\nLEFT JOIN d7_sessions ds ON une.user_id = ds.user_id\n\nGROUP BY 1, 2\nORDER BY frequency_bucket, cohort_type;',
      annotation: 'Line-by-line explanation:\n\navg_daily_notifications = COUNT / 7.0 → normalizes to a daily rate. Some users may have received the campaign for fewer than 7 days depending on install timing.\n\nfrequency_bucket CASE WHEN → groups users into 4 buckets matching the frequency levels. This creates the dose-response variable.\n\ndid_opt_out / did_uninstall MAX flags → captures whether each user opted out or uninstalled at any point in days 1-7. These are the behavioral mechanisms driving retention suppression.\n\ninstall_date >= CURRENT_DATE - 21 days → scopes to campaign-period cohorts only, so you\'re not mixing in pre-campaign users who had different notification exposure.\n\nd7_sessions CTE → defines D7 retention as "had any app session exactly on day 7." Some teams use "within day 7" — adjust based on your company\'s retention definition.\n\nExpected output: D7 retention_pct should decrease monotonically as frequency_bucket increases (1/day highest retention → 4/day lowest), while opt_out_rate_pct and uninstall_rate_pct increase in the same direction. That monotonic relationship is your dose-response confirmation of the fatigue mechanism.'
    },
    seniorDiagnosis: {
      likelyCause: 'Notification fatigue from 4x frequency increase driving opt-outs and uninstalls that suppress D7 retention',
      reasoning: 'The campaign optimized for open rate — a proxy metric that measures whether users tapped the notification, not whether they engaged meaningfully. The 34% open rate looked like a success signal, but it was masking a destructive user experience: users were picking up their phone because of relentless notifications, not because they wanted to use the app. The 4.5x opt-out increase (4% to 18%) and 3.4x uninstall increase (1.8% to 6.2%) are direct evidence of aversion, and these churned users mechanically suppress D7 retention. Task completion per session declining -8% confirms that even retained users are engaging less purposefully — they open but do not complete. This is a textbook proxy metric trap: the metric the team optimized (open rate) moved in the right direction while the metric that matters (D7 retention and LTV) moved in the wrong direction. Senior analysts recognize that high open rates with high churn is the diagnostic signature of notification fatigue, not campaign success.',
      validationPlan: [
        'Pull D7 retention by notification frequency bucket (users who received 1/day vs. 2/day vs. 4/day) — confirm retention decreases monotonically with frequency',
        'Calculate the contribution of opted-out and uninstalled users to the aggregate D7 retention drop — quantify how much of the 5pp drop is attributable to those groups',
        'Compare task completion per session for high-frequency users vs. low-frequency users within the campaign cohort to confirm engagement quality degradation',
        'Calculate the LTV impact: model 30-day LTV difference between campaign and non-campaign cohort using the 5pp retention gap'
      ],
      recommendation: 'Immediately reduce push notification frequency to 1-2 per day maximum and implement a fatigue cap. Redefine campaign success metrics to include opt-out rate, uninstall rate, and task completion per session alongside open rate. Run a proper frequency optimization experiment (1/day vs. 2/day vs. 3/day) with retention as the primary metric before scaling any re-engagement campaign.',
      commonMistakes: [
        'Treating high open rate as a success signal without checking downstream engagement and retention metrics',
        'Not calculating the opt-out and uninstall contribution to the retention drop',
        'Planning a new A/B test instead of analyzing frequency-bucket data already available in the current campaign',
        'Attributing retention drop to acquisition quality or seasonality without ruling out the campaign cohort effect'
      ],
      interviewPhrase: 'Open rate is a proxy — when I see high open rates and declining retention, I immediately check opt-out rate and task completion per session, because the campaign might be training users to ignore the app, not return to it.'
    },
    leadershipNote: 'Staff analysts treat open rate as a vanity metric when session depth and retention tell the opposite story. High open rates on a re-engagement campaign with declining D7 retention means the notifications are being used as a dismiss reflex, not as genuine re-engagement triggers. The forward implication is a campaign design rule: every notification strategy must have an opt-out rate and session-depth guardrail before it scales.',
    spokenSummary: 'Open rate is up but D7 retention is down — that\'s the contradiction I\'d focus on. High opens with low retention means users are tapping the notification to dismiss it, not to actually use the app. I\'d segment by notification frequency bucket: users getting 3+ notifications per day almost certainly show higher opt-out rates and lower session depth than users getting 1. The fix is frequency reduction, not better copy. Guardrail going forward: any notification campaign needs an opt-out rate ceiling and a session-depth minimum — not just open rate.',
  },

  {
    id: 'RCA05',
    title: 'Revenue Grew 18% But Margin Compressed',
    subtitle: 'Vantage Analytics · B2B SaaS · Commercial Health',
    difficulty: 'senior',
    isFree: false,
    companies: ['Salesforce', 'HubSpot', 'Databricks'],
    domain: 'revenue',
    linkedConceptIds: ['funnel-decomposition', 'segmentation'],
    context: {
      metricMovement: 'Revenue grew 18% QoQ but gross margin compressed from 71% to 64%',
      businessImpact: 'At scale, 7pp margin compression on SaaS revenue threatens contribution margin and fundraising multiple',
      timeWindow: 'Compression observed over the last full quarter — gradual, not sudden',
      knownFacts: [
        'A new volume discount tier was launched mid-quarter for 5+ seat contracts',
        'New customer mix shifted toward SMB (shorter contracts, lower ACV)',
        'Hosting/infrastructure costs grew 28% despite only 18% revenue growth',
        'Professional services/onboarding cost per account grew 35% for new SMB accounts',
        'Net revenue retention (NRR) for enterprise accounts: 118%. For SMB accounts: 89%'
      ]
    },
    diagnosisSteps: [
      {
        id: 'system_check',
        stepNumber: 1,
        label: 'System / Data Check',
        prompt: 'Margin compressed 7pp over a full quarter. Before diagnosing business causes, what do you verify?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Verify revenue and cost attribution are consistent QoQ — confirm no accounting methodology or cost allocation changes occurred',
            isCorrect: true,
            level: 'strong',
            feedback: 'Gross margin is computed from both revenue recognition and cost allocation, and either can change without reflecting a real business deterioration. In B2B SaaS, revenue recognition methodology changes (e.g., moving from cash to accrual, changing deferred revenue treatment) or cost reclassifications can move gross margin by several percentage points. Confirming methodology consistency is table stakes before attributing the compression to business factors.'
          },
          {
            id: 'b',
            label: 'Check if new contracts are being recognized in the correct period',
            isCorrect: false,
            level: 'partial',
            feedback: 'Revenue recognition timing for new contracts is worth checking — particularly for multi-year deals where front-loaded recognition can inflate revenue — but this is one specific accounting check within the broader methodology consistency review. A targeted single-item check is less thorough than confirming the overall methodology has not changed.'
          },
          {
            id: 'c',
            label: 'Accept the margin compression as real and immediately analyze discount program impact',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Jumping to business analysis before validating the measurement is premature when the compression is gradual over a full quarter and could reflect accounting changes, cost reclassifications, or changes in how professional services costs are allocated to gross margin. A 7pp margin compression is material enough to warrant a data validation step before the business discussion.'
          }
        ]
      },
      {
        id: 'decompose',
        stepNumber: 2,
        label: 'Metric Decomposition',
        prompt: 'Accounting methodology is confirmed consistent. Now decompose gross margin to find which revenue or cost driver is most responsible. What is the right decomposition?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Break margin by revenue type (new ARR, expansion, renewal) × customer segment (enterprise vs. SMB) × cost category (hosting, professional services, support)',
            isCorrect: true,
            level: 'strong',
            feedback: 'This multi-dimensional decomposition exposes the three potential drivers simultaneously: revenue mix shift (enterprise vs. SMB), pricing impact (discounts on expansion revenue), and cost structure (hosting and PS cost growth). Without this decomposition you cannot tell whether margin compression is primarily a revenue problem (lower ACV per seat) or a cost problem (higher cost per account). Both dimensions matter and they compound.'
          },
          {
            id: 'b',
            label: 'Compare total operating expenses as a percentage of revenue QoQ',
            isCorrect: false,
            level: 'partial',
            feedback: 'OpEx-to-revenue ratio is a useful high-level signal but it mixes gross margin costs with below-the-line costs and obscures the specific drivers within COGS. Gross margin compression is specifically a cost-of-revenue issue, and you need to decompose hosting, professional services, and support separately to find where the cost growth is concentrated. Aggregate OpEx analysis dilutes the signal.'
          },
          {
            id: 'c',
            label: 'Look at total contract count and average contract value to understand volume vs. price dynamics',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Contract count and ACV give you a top-line lens but do not touch the cost side of margin. You need both revenue composition and cost composition to explain margin compression — looking at only the revenue side would lead you to discount impacts while missing the infrastructure and PS cost overruns that are likely contributing equally.'
          }
        ]
      },
      {
        id: 'segment',
        stepNumber: 3,
        label: 'Segmentation',
        prompt: 'Decomposition shows hosting costs grew faster than revenue and PS costs grew faster for new accounts. Which segmentation reveals the margin by business unit?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Segment gross margin by account tier (enterprise vs. SMB), discount tier, and new vs. existing contracts',
            isCorrect: true,
            level: 'strong',
            feedback: 'This segmentation will show starkly different gross margins between enterprise and SMB accounts, confirming the mix shift impact. Segmenting by discount tier quantifies how much the volume discount eroded per-seat revenue. New vs. existing contract segmentation reveals whether the PS cost growth is concentrated in new SMB onboarding (as the known facts suggest). Together these three cuts isolate all three contributing factors.'
          },
          {
            id: 'b',
            label: 'Segment by geographic region to see if certain markets have higher cost structures',
            isCorrect: false,
            level: 'partial',
            feedback: 'Regional segmentation can reveal geographic cost differences (particularly for professional services with on-site delivery) and is a reasonable secondary check. However, the primary drivers — SMB mix shift, discount impact, and infrastructure cost per account — are not primarily geographic and would not be surfaced by this segmentation first. Segment by business variable before geographic variable.'
          },
          {
            id: 'c',
            label: 'Segment by deal size (ACV) only to find where revenue concentration has shifted',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Segmenting by deal size only addresses the revenue side of margin and misses the cost-per-account dynamics that the known facts already flag (PS cost +35% for SMB, hosting +28%). Margin is revenue minus cost — a segmentation that only looks at the revenue dimension will systematically under-diagnose the cost drivers that are compounding the margin compression.'
          }
        ]
      },
      {
        id: 'hypothesis',
        stepNumber: 4,
        label: 'Root Cause Hypothesis',
        prompt: 'SMB mix shift, volume discount program, and 28% infrastructure cost growth are all present. What is the root cause hypothesis?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Three compounding factors: (a) SMB mix shift brings lower ACV and higher PS cost per account, (b) volume discount eroded per-seat revenue, (c) infrastructure costs grew faster than revenue due to SMB inefficiency',
            isCorrect: true,
            level: 'strong',
            feedback: 'Margin compression that develops gradually over a quarter almost always reflects multiple compounding factors rather than a single cause. Each factor individually might produce 2-3pp compression, but together they produce the observed 7pp. The NRR differential (118% enterprise vs. 89% SMB) confirms that SMB accounts also erode faster, making the mix shift a compounding problem over time. Senior analysts recognize this as a unit economics breakdown, not a pricing or sales problem in isolation.'
          },
          {
            id: 'b',
            label: 'The volume discount program alone is causing the margin compression',
            isCorrect: false,
            level: 'partial',
            feedback: 'Discounting is one contributing factor but cannot explain the full 7pp compression alone, especially since infrastructure costs grew 28% vs. 18% revenue growth — that gap contributes independently of discounting. Attributing the entire margin compression to one factor when three compounding factors are visible in the data is an incomplete diagnosis that would lead to an incomplete fix.'
          },
          {
            id: 'c',
            label: 'Revenue recognition change is masking true margin by front-loading revenue from new contracts',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Revenue recognition was already confirmed as unchanged in the data check step. Returning to a hypothesis that was already ruled out wastes analytical cycles and suggests insufficient discipline in the diagnosis process. When a data quality check rules out an explanation, it should be removed from the hypothesis list, not recycled at the hypothesis stage.'
          }
        ]
      },
      {
        id: 'validate',
        stepNumber: 5,
        label: 'Validation Approach',
        prompt: 'Three compounding factors are identified. How do you build the business case that quantifies each driver?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Build a cohort P&L by segment (enterprise vs. SMB) showing revenue per seat, hosting cost per seat, PS cost per account, gross margin, and NRR — cross-reference to isolate each driver\'s contribution',
            isCorrect: true,
            level: 'strong',
            feedback: 'A cohort-level P&L with the full cost breakdown is the gold standard for margin diagnosis in B2B SaaS. Showing gross margin per segment with all cost inputs attributed makes each driver\'s contribution explicit and defensible. Cross-referencing NRR by segment extends the analysis to lifetime margin, not just single-quarter margin — critical for a fundraising conversation. This analysis directly translates into unit economics talking points.'
          },
          {
            id: 'b',
            label: 'Review the total discount amount given in the quarter and compare to prior quarter',
            isCorrect: false,
            level: 'partial',
            feedback: 'Discount volume is one input worth quantifying, but it only covers one of three compounding factors. A complete margin diagnosis needs to quantify all three drivers (mix shift, discounting, cost growth) so leadership can prioritize which lever to pull. Reviewing only discounts would lead to an incomplete recommendation.'
          },
          {
            id: 'c',
            label: 'Reduce all discounts immediately to recover margin',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Taking action before completing the validation is premature and risky — reducing discounts without understanding the sales pipeline impact could churn new SMB prospects and worsen the mix shift problem. Validation exists to inform the right intervention: in this case, the answer may be to price SMB differently, cap discount tiers, and optimize infrastructure efficiency simultaneously, not just to eliminate discounts.'
          }
        ]
      }
    ],
    sqlStep: {
      prompt: 'You\'ve identified three compounding factors behind the margin compression: (a) SMB mix shift brings lower ACV and higher cost-to-serve, (b) the volume discount program eroded per-seat revenue, (c) infrastructure costs grew 28% vs. 18% revenue growth.\n\nWrite a SQL query that builds a per-segment cohort P&L — enterprise vs. SMB — showing gross margin per account alongside hosting cost, professional services cost, and revenue per seat. This is the analysis you\'d present to the CFO.',
      hints: [
        'Join contracts to accounts to get segment (enterprise vs. SMB) and contract_value',
        'Join to hosting_costs and ps_costs tables to get cost per account (not per user)',
        'Gross margin = (revenue - hosting_cost - ps_cost) / revenue × 100',
        'Include NRR or churn flag per segment to extend the story to LTV, not just quarterly margin'
      ],
      modelQuery: 'WITH account_revenue AS (\n  SELECT\n    a.account_id,\n    a.segment,            -- \'enterprise\' | \'smb\'\n    a.acquisition_quarter,\n    c.contract_value_arr,\n    c.seat_count,\n    c.has_volume_discount,\n    c.discounted_seat_price,\n    c.list_seat_price,\n\n    -- Effective revenue per seat (reflects discount impact)\n    ROUND(c.contract_value_arr / NULLIF(c.seat_count, 0), 2) AS revenue_per_seat,\n\n    -- Discount erosion: revenue lost per seat due to volume discount\n    ROUND(c.list_seat_price - c.discounted_seat_price, 2)    AS discount_erosion_per_seat\n\n  FROM accounts a\n  INNER JOIN contracts c ON a.account_id = c.account_id\n  WHERE c.contract_start_date >= DATE_TRUNC(\'quarter\', CURRENT_DATE - INTERVAL \'3 months\')\n    AND c.status = \'active\'\n),\n\naccount_costs AS (\n  SELECT\n    account_id,\n    SUM(monthly_hosting_cost) * 3    AS quarterly_hosting_cost,  -- 3 months\n    SUM(ps_hours * ps_hourly_rate)   AS quarterly_ps_cost\n  FROM (\n    SELECT account_id, monthly_hosting_cost, 0 AS ps_hours, 0 AS ps_hourly_rate\n    FROM infrastructure_costs\n    WHERE month >= DATE_TRUNC(\'quarter\', CURRENT_DATE - INTERVAL \'3 months\')\n    UNION ALL\n    SELECT account_id, 0, hours_logged, hourly_rate\n    FROM professional_services_engagements\n    WHERE engagement_date >= DATE_TRUNC(\'quarter\', CURRENT_DATE - INTERVAL \'3 months\')\n  ) costs\n  GROUP BY 1\n),\n\nretention_flags AS (\n  -- NRR proxy: did the account expand, renew flat, or churn/contract this quarter?\n  SELECT\n    account_id,\n    CASE\n      WHEN arr_change_pct > 0.05  THEN \'expansion\'\n      WHEN arr_change_pct > -0.05 THEN \'flat_renewal\'\n      ELSE \'contraction_or_churn\'\n    END AS nrr_bucket\n  FROM account_arr_changes\n  WHERE quarter = DATE_TRUNC(\'quarter\', CURRENT_DATE - INTERVAL \'3 months\')\n)\n\nSELECT\n  ar.segment,\n  ar.has_volume_discount,\n  rf.nrr_bucket,\n\n  COUNT(*)                                        AS account_count,\n  ROUND(AVG(ar.contract_value_arr), 0)            AS avg_arr,\n  ROUND(AVG(ar.revenue_per_seat), 2)              AS avg_revenue_per_seat,\n  ROUND(AVG(ar.discount_erosion_per_seat), 2)     AS avg_discount_erosion_per_seat,\n  ROUND(AVG(ac.quarterly_hosting_cost), 0)        AS avg_quarterly_hosting_cost,\n  ROUND(AVG(ac.quarterly_ps_cost), 0)             AS avg_quarterly_ps_cost,\n\n  -- Gross margin per account: (revenue - COGS) / revenue\n  ROUND(\n    100.0 * (\n      AVG(ar.contract_value_arr / 4.0)   -- Quarterly ARR\n      - AVG(ac.quarterly_hosting_cost)\n      - AVG(ac.quarterly_ps_cost)\n    ) / NULLIF(AVG(ar.contract_value_arr / 4.0), 0),\n    1\n  ) AS gross_margin_pct\n\nFROM account_revenue ar\nLEFT JOIN account_costs ac ON ar.account_id = ac.account_id\nLEFT JOIN retention_flags rf ON ar.account_id = rf.account_id\n\nGROUP BY 1, 2, 3\nORDER BY segment, has_volume_discount, nrr_bucket;',
      annotation: 'Line-by-line explanation:\n\naccount_revenue CTE → pulls contract-level data including the discounted vs. list price per seat. The discount_erosion_per_seat column quantifies how much revenue the volume discount is removing per seat — if this is $50/seat × 10,000 seats, you have the dollar impact.\n\naccount_costs CTE → UNION ALL pattern merges hosting and professional services into a single cost per account. This is critical because PS cost is often excluded from gross margin calculations that focus only on infrastructure.\n\nquarterly_hosting_cost = monthly × 3 → annualizes to quarterly for apples-to-apples comparison with ARR.\n\nretention_flags CTE → proxies NRR by looking at ARR change direction. Not a true NRR calculation (which would need prior-period comparison) but sufficient to confirm the enterprise expansion vs. SMB contraction pattern.\n\ngross_margin_pct → the headline metric. Expected output: enterprise / no_discount rows will show ~71% gross margin (matching pre-compression baseline), while smb / has_discount rows will show significantly lower margins — likely 55-60% range — directly decomposing where the 7pp compression is coming from.'
    },
    seniorDiagnosis: {
      likelyCause: 'Three compounding factors: SMB mix shift, volume discount margin erosion, and infrastructure cost outpacing revenue growth',
      reasoning: 'The margin compression developed gradually over a full quarter because three factors were compounding simultaneously rather than any single event driving a sudden change. The SMB mix shift introduced a structurally lower-margin customer segment — SMB accounts have lower ACV, higher professional services cost per account (+35%), and an NRR of 89% vs. 118% for enterprise, meaning they also erode over time. The volume discount program reduced per-seat revenue on 5+ seat contracts without a corresponding reduction in infrastructure cost (the cost savings from larger contracts did not materialize). Infrastructure costs growing 28% vs. 18% revenue growth suggests SMB accounts are more infrastructure-intensive per dollar of revenue — likely due to more frequent onboarding, shorter sessions with heavier data loading, or less efficient usage patterns. These three factors individually might each compress margin 2-3pp; together they explain the full 7pp. The NRR differential is the most alarming long-term signal: a business growing on 89% NRR customers while its high-NRR enterprise base represents a shrinking share of new growth is building a structurally declining margin profile.',
      validationPlan: [
        'Build a per-segment cohort P&L (enterprise vs. SMB, new vs. existing) with revenue per seat, COGS per account (hosting + PS + support), and gross margin — calculate each segment\'s contribution to the total margin change',
        'Quantify the discount program impact: calculate average revenue per seat with and without the volume discount for 5+ seat contracts, measure total revenue impact of discounts given in the quarter',
        'Analyze infrastructure cost per account by segment: confirm SMB accounts are more infrastructure-intensive per dollar of revenue, and quantify the efficiency gap',
        'Model 12-month forward margin under current mix trajectory vs. a re-balanced mix with enterprise growth targets and SMB pricing adjustments'
      ],
      recommendation: 'Address all three drivers with targeted interventions: (a) introduce SMB-specific pricing that reflects true cost-to-serve including higher PS and infrastructure cost per account, (b) restructure the volume discount tier to require minimum contract length that enables infrastructure efficiency, (c) set enterprise growth targets to rebalance the mix. Present cohort P&L to leadership to make the unit economics of the SMB segment transparent before the next fundraise.',
      commonMistakes: [
        'Attributing the full margin compression to discounting alone and missing the cost-side drivers',
        'Not connecting NRR differential to long-term margin trajectory — 89% SMB NRR is a structural margin erosion risk',
        'Recommending immediate discount elimination without quantifying the sales pipeline impact first',
        'Stopping at revenue-side analysis without building a cost-per-account breakdown by segment'
      ],
      interviewPhrase: 'Revenue growth with margin compression usually means you are selling to the wrong mix of customers or the right customers at the wrong price — I build a cohort P&L to see the unit economics by segment before I recommend any pricing or cost changes.'
    },
    leadershipNote: 'Staff analysts read revenue growth with margin compression as a customer mix story first, not a cost story. The question juniors miss is: which segment is growing fastest, and what is its contribution margin? The forward implication for leadership is a tiered pricing review — because if the fastest-growing segment has the worst margin, scaling it is actively destroying value and the board will ask why no one caught it sooner.',
  },

  {
    id: 'RCA06',
    title: 'Bot Deflection Looks Good — But Escalations Are Climbing',
    subtitle: 'Threadline · B2B SaaS · AI Support Quality',
    difficulty: 'senior',
    isFree: false,
    companies: ['Intercom', 'Zendesk', 'Slack'],
    domain: 'genai',
    linkedConceptIds: ['proxy-metric', 'metric-gaming', 'data-quality-check'],
    context: {
      metricMovement: 'Deflection rate (tickets not escalated to human) held at 68%, but human escalation volume increased 22% and repeat contact rate rose from 8% to 19%',
      businessImpact: 'Repeat contacts and escalation volume are rising — true resolution quality is degrading despite flat deflection',
      timeWindow: 'Trend observed over 6 weeks since GenAI bot rollout to full production',
      knownFacts: [
        'GenAI support bot replaced Tier 1 human agents 6 weeks ago — handles billing, account, and feature questions',
        'Deflection rate (tickets not escalated): 68% vs. 70% target — appears fine',
        'But human escalation VOLUME is up 22% despite deflection rate being stable',
        'Repeat contact rate (same issue re-opened within 7 days): 8% to 19%',
        'CSAT score for bot-handled tickets: 3.1/5 vs. 4.2/5 for human-handled',
        'Hallucination flag rate (answer factually wrong per QA review): 11%'
      ]
    },
    diagnosisSteps: [
      {
        id: 'system_check',
        stepNumber: 1,
        label: 'System / Data Check',
        prompt: 'Deflection rate looks fine at 68%, but escalation volume and repeat contacts are rising. What is your first check?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Verify what "deflected" means in the measurement — confirm it means "not escalated," not "issue resolved"',
            isCorrect: true,
            level: 'strong',
            feedback: 'Deflection is a notoriously ambiguous metric in AI support systems: it typically measures whether a ticket was closed or not escalated, not whether the user\'s issue was actually resolved. If "deflected" is defined as "ticket closed without escalation," it includes users who gave up, accepted a wrong answer, or closed the ticket out of frustration. Clarifying the operational definition of deflection is the critical first check — a 68% "deflection" rate that masks a 19% repeat contact rate is measuring the wrong thing.'
          },
          {
            id: 'b',
            label: 'Check whether total ticket volume has increased since the bot launched, which might explain higher escalation volume',
            isCorrect: false,
            level: 'partial',
            feedback: 'Total ticket volume is worth checking since higher escalation volume with a stable deflection rate could indicate more tickets in total rather than a quality degradation. However, the repeat contact rate rising from 8% to 19% is a quality signal that does not depend on total volume — it indicates that 19% of contacts require a follow-up within 7 days, which reflects resolution failure regardless of overall volume.'
          },
          {
            id: 'c',
            label: 'Assume deflection equals resolution and report the bot as performing near target',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Treating deflection rate as equivalent to resolution rate is the core measurement error in AI support systems. The 19% repeat contact rate explicitly refutes the idea that "not escalated" means "resolved." Reporting the bot as near target when resolution quality signals are clearly degrading would give leadership a false picture of the bot\'s performance and delay necessary intervention.'
          }
        ]
      },
      {
        id: 'decompose',
        stepNumber: 2,
        label: 'Metric Decomposition',
        prompt: 'Confirmed: "deflected" means not escalated, not resolved. Now decompose support outcomes to understand what is actually happening to tickets. What decomposition do you run?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Break support contacts by outcome (resolved, escalated, abandoned, re-opened) × intent type (billing, feature, account, bug) × bot confidence score',
            isCorrect: true,
            level: 'strong',
            feedback: 'This four-way outcome classification reveals what is hidden by the deflection metric: "deflected" tickets are being split between truly resolved and abandoned/re-opened, and the re-opened category is driving the 19% repeat contact rate. Crossing with intent type will show which categories the bot handles competently vs. poorly, and bot confidence score will reveal whether the bot knows when it does not know — a critical GenAI quality signal. This decomposition transforms a single vanity metric into a complete resolution quality picture.'
          },
          {
            id: 'b',
            label: 'Compare total ticket volume before and after bot launch to isolate the volume effect',
            isCorrect: false,
            level: 'partial',
            feedback: 'Volume comparison helps isolate whether escalation count growth reflects more tickets overall vs. a higher escalation rate, but it does not address the quality question. The repeat contact rate is already a rate (not a count), so volume effects do not explain the 8% to 19% increase. Outcome decomposition is the more informative next step.'
          },
          {
            id: 'c',
            label: 'Look at total bot session count and average session duration to understand usage patterns',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Session count and duration are engagement metrics, not resolution quality metrics. A bot can have high session counts and long sessions and still be failing to resolve issues — users might be in long sessions precisely because the bot is not giving them satisfactory answers. Engagement metrics are a proxy for usage, not a proxy for resolution quality.'
          }
        ]
      },
      {
        id: 'segment',
        stepNumber: 3,
        label: 'Segmentation',
        prompt: 'Decomposition shows repeat contacts and hallucinations are concentrated in specific intent types. Which segmentation pinpoints the failure mode?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Segment by intent category (billing vs. feature vs. account vs. bug), user tier (enterprise vs. SMB), and bot confidence bucket (high vs. medium vs. low confidence)',
            isCorrect: true,
            level: 'strong',
            feedback: 'Intent category segmentation will reveal whether the 11% hallucination rate is concentrated in specific question types (e.g., billing questions requiring account-specific data, or feature questions about recent product changes the bot was not trained on). User tier segmentation matters because enterprise customers with complex account configurations are more likely to receive wrong answers than SMB customers with standard setups. Bot confidence segmentation tests whether the bot knows when it should escalate — low-confidence answers that are not escalated are a key failure mode to identify and fix.'
          },
          {
            id: 'b',
            label: 'Segment by account age (new vs. established accounts) to see if newer accounts have more questions',
            isCorrect: false,
            level: 'partial',
            feedback: 'Account age segmentation could reveal whether newer accounts are generating more complex questions, but it does not get to the resolution quality question. An established account can receive a hallucinated answer just as easily as a new account. The intent type and confidence segmentation is more directly tied to the bot\'s quality failure modes.'
          },
          {
            id: 'c',
            label: 'Segment by which human support agent handled escalated tickets',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Human agent performance is irrelevant to the bot quality diagnosis — the question is why tickets are being escalated or re-opened, not how agents are handling escalations once they receive them. Focusing on agent-level segmentation deflects attention from the bot quality failures that are the actual root cause. This would be appropriate only if you were diagnosing human agent performance, not bot quality.'
          }
        ]
      },
      {
        id: 'hypothesis',
        stepNumber: 4,
        label: 'Root Cause Hypothesis',
        prompt: '19% repeat contact rate, 11% hallucination rate, 3.1/5 CSAT for bot tickets. What is the root cause hypothesis?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Bot is deflecting tickets by giving low-quality or wrong answers that do not resolve issues — users accept or abandon, then re-contact. Deflection rate measures non-escalation, not resolution',
            isCorrect: true,
            level: 'strong',
            feedback: 'This hypothesis explains all three signals simultaneously: the flat deflection rate (bot is closing tickets), the rising repeat contacts (issues are not actually resolved), and the high hallucination rate (11% of answers are factually wrong per QA). The 3.1/5 CSAT vs. 4.2/5 for human-handled tickets confirms users feel the bot is providing lower quality support. The mechanism is that escalation friction (effort required to reach a human) leads users to accept a bad bot answer and then re-contact later rather than escalating immediately. Deflection as a success metric actively masks this failure mode.'
          },
          {
            id: 'b',
            label: 'Total ticket volume increased due to product issues unrelated to the bot, generating more escalations',
            isCorrect: false,
            level: 'partial',
            feedback: 'Volume increase is worth ruling out, but the repeat contact rate rising from 8% to 19% is a rate-based quality signal independent of total volume. Even if ticket volume grew, that would not explain why 19% of contacts require re-opening within 7 days — that pattern points to resolution failure, not demand increase. A volume-driven hypothesis would not predict rising repeat contact rate without also predicting declining per-ticket quality.'
          },
          {
            id: 'c',
            label: 'Human agents are causing the escalation spike by failing to resolve escalated tickets efficiently',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Human agents are handling escalated tickets with 4.2/5 CSAT vs. 3.1/5 for the bot — this directly contradicts the hypothesis that human agents are causing the quality degradation. The quality gap runs in the opposite direction: human resolution is outperforming bot resolution. Attributing the escalation volume increase to human agent failure when the CSAT data points to bot quality failure is an evidence inversion.'
          }
        ]
      },
      {
        id: 'validate',
        stepNumber: 5,
        label: 'Validation Approach',
        prompt: 'Your hypothesis is that deflected tickets are not being resolved. How do you confirm this and quantify the failure modes?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Sample 100 deflected-but-re-contacted tickets, classify failure mode (wrong answer, incomplete answer, hallucination, no answer), and cross-reference with CSAT and hallucination rate by intent type',
            isCorrect: true,
            level: 'strong',
            feedback: 'Sampling deflected tickets that resulted in repeat contact gives you the ground truth for what "deflection without resolution" looks like in practice. Classifying the failure mode (wrong answer vs. hallucination vs. abandonment) with a 100-ticket sample is enough to produce a statistically meaningful distribution. Cross-referencing CSAT by intent type and the 11% hallucination rate by category gives you the specific areas where the bot is failing, enabling targeted retraining or escalation routing changes.'
          },
          {
            id: 'b',
            label: 'Run a CSAT survey for all bot interactions to measure satisfaction at scale',
            isCorrect: false,
            level: 'partial',
            feedback: 'CSAT surveys at scale will confirm that bot satisfaction is lower than human satisfaction, which you already know (3.1 vs. 4.2). Surveys take time, have low response rates, and will not give you the specific failure modes (wrong answer, hallucination, incomplete) that you need to fix the bot. Qualitative ticket review is faster and more diagnostic for root cause analysis of AI quality failures.'
          },
          {
            id: 'c',
            label: 'Increase escalation friction to reduce escalation volume and bring the rate closer to the 70% target',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Increasing escalation friction when resolution quality is already degrading would make the problem worse, not better: users who cannot easily escalate would accept more wrong answers, re-contact even more frequently, and have even lower CSAT. This intervention optimizes the deflection proxy metric while directly harming resolution quality and user trust. It is the wrong direction entirely — the correct fix is to improve bot answer quality and lower the escalation barrier for low-confidence answers.'
          }
        ]
      }
    ],
    sqlStep: {
      prompt: 'You\'ve confirmed the core issue: the bot\'s deflection metric measures "ticket closed without escalation," not "issue resolved." The 19% repeat contact rate proves that nearly 1 in 5 deflected contacts returns within 7 days — meaning the bot closed the ticket but didn\'t solve the problem.\n\nWrite a SQL query that calculates the true resolution rate: deflected tickets that did NOT result in a re-contact within 7 days. Then break it by intent category and bot confidence score to show where the failure is concentrated.',
      hints: [
        'A "true resolution" = ticket was deflected (not escalated) AND no re-open or new ticket from same user within 7 days',
        'Use a LEFT JOIN to re_contacts table on user_id and ticket_open_date to flag re-contacts',
        'Break out by intent_category (billing, feature, account, bug) to find where hallucinations are concentrated',
        'Include bot_confidence_score bucket (high/medium/low) to show whether the bot knows when it\'s unsure'
      ],
      modelQuery: 'WITH deflected_tickets AS (\n  -- All tickets that were closed without human escalation\n  SELECT\n    t.ticket_id,\n    t.user_id,\n    t.opened_at,\n    t.closed_at,\n    t.intent_category,           -- \'billing\' | \'feature\' | \'account\' | \'bug\'\n    t.bot_confidence_score,      -- 0.0 to 1.0\n    t.csat_score,                -- 1-5 post-resolution survey (nullable)\n    t.hallucination_flagged,     -- Boolean: flagged in QA review\n\n    -- Confidence bucket\n    CASE\n      WHEN t.bot_confidence_score >= 0.80 THEN \'high_confidence\'\n      WHEN t.bot_confidence_score >= 0.50 THEN \'medium_confidence\'\n      ELSE \'low_confidence\'\n    END AS confidence_bucket\n\n  FROM support_tickets t\n  WHERE t.resolution_type = \'deflected\'   -- Bot handled, not escalated\n    AND t.opened_at >= CURRENT_DATE - INTERVAL \'42 days\'  -- 6-week bot rollout period\n),\n\nre_contacts AS (\n  -- Tickets re-opened or new tickets from same user within 7 days\n  SELECT DISTINCT dt.ticket_id AS original_ticket_id\n  FROM deflected_tickets dt\n  INNER JOIN support_tickets follow_up\n    ON follow_up.user_id = dt.user_id\n    AND follow_up.ticket_id != dt.ticket_id\n    AND follow_up.opened_at BETWEEN dt.opened_at AND dt.opened_at + INTERVAL \'7 days\'\n)\n\nSELECT\n  dt.intent_category,\n  dt.confidence_bucket,\n\n  COUNT(*)                                                        AS deflected_tickets,\n\n  -- True resolutions: no re-contact within 7 days\n  SUM(CASE WHEN rc.original_ticket_id IS NULL THEN 1 ELSE 0 END) AS truly_resolved,\n  SUM(CASE WHEN rc.original_ticket_id IS NOT NULL THEN 1 ELSE 0 END) AS re_contacted,\n\n  ROUND(\n    100.0 * SUM(CASE WHEN rc.original_ticket_id IS NULL THEN 1 ELSE 0 END)\n    / NULLIF(COUNT(*), 0), 1\n  )                                                               AS true_resolution_rate_pct,\n\n  ROUND(\n    100.0 * SUM(CASE WHEN rc.original_ticket_id IS NOT NULL THEN 1 ELSE 0 END)\n    / NULLIF(COUNT(*), 0), 1\n  )                                                               AS repeat_contact_rate_pct,\n\n  -- Quality signals\n  ROUND(AVG(dt.csat_score), 2)                                    AS avg_csat,\n  ROUND(100.0 * AVG(dt.hallucination_flagged::int), 1)            AS hallucination_rate_pct\n\nFROM deflected_tickets dt\nLEFT JOIN re_contacts rc ON dt.ticket_id = rc.original_ticket_id\n\nGROUP BY 1, 2\nORDER BY intent_category, confidence_bucket;',
      annotation: 'Line-by-line explanation:\n\ndeflected_tickets CTE → scopes to only bot-handled tickets (resolution_type = \'deflected\'), filtering to the 6-week rollout period. Confidence bucket divides bot answers into high/medium/low to test whether the bot escalates appropriately when uncertain.\n\nre_contacts CTE → the critical definition: any ticket from the same user within 7 days of the original deflected ticket. This flags re-contacts whether the user re-opened the original ticket or opened a new one for the same unresolved issue.\n\nLEFT JOIN re_contacts → NULL on the right side means no re-contact → "truly resolved." Not NULL means re-contact → resolution failure.\n\ntrue_resolution_rate_pct → this is the metric that should replace (or complement) deflection rate. Expected value: overall ~81% (since we know 19% re-contact within 7 days).\n\nhallucination_rate_pct broken by intent_category + confidence_bucket → expected to show: billing and feature questions have the highest hallucination rates (they require account-specific or recently-updated information the bot may not have), and low_confidence answers have the highest re-contact rates. These two patterns together tell engineering exactly where to focus retraining.'
    },
    seniorDiagnosis: {
      likelyCause: 'GenAI bot is deflecting (closing) tickets without resolving them — deflection metric measures non-escalation, not resolution quality',
      reasoning: 'The core failure here is a metric definition problem that became a product quality problem: "deflection rate" was defined as "not escalated" and treated as equivalent to "resolved," which it is not. The bot closes tickets by giving answers — whether correct, incomplete, or hallucinated — and users who lack the energy to escalate accept those answers and re-contact later. The 8% to 19% repeat contact rate is the clearest signal: nearly one in five contacts is a re-contact within 7 days, which is definitional evidence of resolution failure. The 11% hallucination rate from QA review confirms the bot is generating factually wrong answers at a non-trivial rate, and the 3.1/5 CSAT vs. 4.2/5 for human-handled tickets confirms users notice the quality difference. The escalation volume growing 22% while deflection rate holds stable is mathematically explained by total support ticket volume growing (more users) while the bot handles a constant 68% proportion — the absolute count of escalations grows even if the rate does not. Senior analysts working on GenAI product metrics must distinguish between engagement metrics (deflection rate), satisfaction metrics (CSAT), and outcome metrics (repeat contact rate, resolution rate) — and recognize that the last category is the only one that tells you whether the AI is actually working.',
      validationPlan: [
        'Pull all tickets from the past 6 weeks classified as "deflected" (not escalated) and cross-reference with the repeat contact log — calculate the true resolution rate: deflected tickets that did NOT re-contact within 7 days',
        'Sample 100 deflected-but-re-contacted tickets and manually classify failure mode: wrong answer (hallucination), incomplete answer, irrelevant answer, or user confusion',
        'Break hallucination flag rate (11%) by intent category to identify the specific question types where the bot is most likely to generate incorrect answers',
        'Calculate the true cost of non-resolution: deflected ticket + re-contact = 2 support touches instead of 1, likely at higher cost than a direct human escalation would have been'
      ],
      recommendation: 'Redefine success metrics for the bot to include resolution rate (no re-contact within 7 days) as the primary KPI, with deflection rate demoted to a secondary efficiency metric. Implement a low-confidence escalation path where the bot automatically offers human escalation when its confidence is below threshold. Retrain the bot on the specific intent categories with highest hallucination rates. Report bot performance to leadership with the full resolution quality picture, not just deflection rate.',
      commonMistakes: [
        'Equating deflection rate with resolution rate — these are categorically different measurements',
        'Recommending increased escalation friction to hit deflection targets when quality is already degrading',
        'Accepting 11% hallucination rate without connecting it to the repeat contact rate and CSAT signals',
        'Reporting bot performance as "near target" based on deflection rate alone when three quality signals are flashing red'
      ],
      interviewPhrase: 'For any AI support system, I always ask: does our deflection metric measure non-escalation or actual resolution? Because if it\'s the former, we\'re probably celebrating the bot closing tickets the user didn\'t feel were worth escalating — not tickets that were actually resolved.'
    },
    leadershipNote: 'Staff analysts ask what the metric is actually measuring before declaring it healthy. Deflection rate measures non-escalation, not resolution — a bot can deflect by exhausting users into abandonment, which is not a product success. The escalation to leadership should include a proposed metric redefinition: replace deflection rate with resolution-confirmed rate, and set a repeat-contact rate ceiling as the primary quality guardrail.',
  },

  {
    id: 'RCA07',
    title: 'Seller Fraud Rate Tripled in 72 Hours',
    subtitle: 'Crafted · Marketplace · Trust & Safety',
    difficulty: 'senior',
    isFree: false,
    companies: ['Meta', 'Twitter', 'eBay'],
    domain: 'marketplace',
    linkedConceptIds: ['segmentation', 'data-quality-check', 'funnel-decomposition'],
    context: {
      metricMovement: 'Seller fraud rate spiked from 0.8% to 3.1% of orders flagged fraudulent (+2.3pp) in 72 hours',
      businessImpact: '~$85k in chargebacks at risk; sustained rate could trigger payment processor risk escalation and higher processing fees',
      timeWindow: 'Spike began 4 days ago, coinciding with the Express Seller onboarding tier launch',
      knownFacts: [
        'A new "Express Seller" onboarding tier launched 4 days ago with reduced identity verification steps',
        '89% of fraudulent orders are from sellers onboarded in the last 5 days',
        'Fraudulent orders concentrated in high-value categories: Electronics and Collectibles',
        'Buyer accounts placing these orders are 1-3 days old',
        'No change to buyer-side verification or fraud detection models',
      ],
    },
    diagnosisSteps: [
      {
        id: 'system_check',
        stepNumber: 1,
        label: 'System / Data Check',
        prompt: 'Before diagnosing, what do you check first?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Verify fraud flag definition is unchanged — confirm the payment processor has not altered its flagging thresholds or model',
            isCorrect: true,
            level: 'strong',
            feedback: 'Fraud rate spikes can be real increases in fraud or an artifact of a changed detection threshold. If the payment processor updated its risk model or lowered its flagging threshold 4 days ago, you would see a rate spike with no actual increase in fraudulent behavior. Confirming the flag definition is unchanged is the fastest way to establish whether you are looking at a real fraud increase or a measurement shift — and it takes minutes to verify with the processor or your payments team.',
          },
          {
            id: 'b',
            label: 'Pull chargeback volumes from the finance team to validate the processor flag data',
            isCorrect: false,
            level: 'partial',
            feedback: 'Chargeback volume is useful corroborating evidence that the fraud is real, but chargebacks lag fraud flags by days to weeks. Waiting for chargebacks to confirm the flag data delays response time significantly. Verifying the flag definition itself is faster and more direct as a first check.',
          },
          {
            id: 'c',
            label: 'Immediately pause Express Seller onboarding to stop new fraudulent sellers from joining',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Taking action before confirming the measurement is valid risks shutting down a legitimate product feature based on a potential false alarm. If the fraud flag definition changed, pausing onboarding would harm the business unnecessarily. Always validate the data before escalating to an operational response.',
          },
        ],
      },
      {
        id: 'decompose',
        stepNumber: 2,
        label: 'Metric Decomposition',
        prompt: 'Fraud flag definition confirmed unchanged — the spike is real. How do you decompose the fraud rate metric?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Decompose fraud rate by seller cohort age (0-7 days, 8-30 days, 30+ days) to isolate whether fraud is concentrated in new vs. established sellers',
            isCorrect: true,
            level: 'strong',
            feedback: 'Given that 89% of flagged orders come from sellers onboarded in the last 5 days, decomposing by seller cohort age will confirm this concentration immediately. This decomposition separates the new-seller fraud signal from the established-seller baseline, quantifying exactly how much of the rate increase is attributable to new accounts. It also tells you whether the problem is growing (if new cohorts each week show increasing fraud) or was a one-time entry.',
          },
          {
            id: 'b',
            label: 'Decompose by product category to find which categories have the highest fraud rates',
            isCorrect: false,
            level: 'partial',
            feedback: 'Category decomposition is relevant — and you already know Electronics and Collectibles are the concentrated categories — but category alone does not identify who is committing the fraud or how they got onto the platform. Seller cohort decomposition directly connects to the onboarding change that happened simultaneously with the spike, making it the more diagnostic first cut.',
          },
          {
            id: 'c',
            label: 'Compare total order volume before and after the Express Seller launch to see if volume growth explains the spike',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Fraud rate is already a percentage of orders, so volume growth does not explain a rate increase — if total orders doubled and fraud doubled proportionally, the rate would stay flat. The question is why the rate changed, not whether volume changed. Volume analysis would not surface the seller-cohort mechanism driving the spike.',
          },
        ],
      },
      {
        id: 'segment',
        stepNumber: 3,
        label: 'Segmentation',
        prompt: 'Cohort decomposition confirms fraud is concentrated in sellers onboarded in the last 5 days. Which segmentation finds the root cause fastest?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Cross-segment by seller onboarding tier (Express vs. Standard) × product category × buyer account age',
            isCorrect: true,
            level: 'strong',
            feedback: 'This three-way segmentation tests the full fraud ring hypothesis in one pass: Express Seller tier identifies the low-friction entry point, category identifies the high-value targets, and buyer account age identifies the synthetic buyer accounts. If fraud rate is concentrated almost entirely in Express × Electronics/Collectibles × buyer accounts <7 days old, you have confirmed a coordinated fraud pattern using all three vectors simultaneously — that level of specificity is sufficient to act on.',
          },
          {
            id: 'b',
            label: 'Segment by seller geographic location to check if fraud is concentrated in specific regions',
            isCorrect: false,
            level: 'partial',
            feedback: 'Geographic segmentation can reveal fraud rings that operate from specific locations, but it is a secondary cut. Geographic clustering may be present, but the primary mechanism here is the onboarding tier change — which is platform-internal and does not require geographic analysis to identify. Start with the variable that changed (onboarding tier) before adding geographic dimensions.',
          },
          {
            id: 'c',
            label: 'Segment by payment method used in fraudulent orders',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Payment method segmentation is useful for payment fraud investigations but does not address the seller-supply-side attack vector here. The fraud is being committed by fraudulent sellers, not payment credential theft. Payment method analysis would tell you how the fraud is being executed, not why the fraud rate increased — which is the root cause question.',
          },
        ],
      },
      {
        id: 'hypothesis',
        stepNumber: 4,
        label: 'Root Cause Hypothesis',
        prompt: 'Fraud is concentrated in Express Seller accounts (0-5 days old) × Electronics/Collectibles × buyers with accounts <3 days old. Which hypothesis best explains the root cause?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Coordinated fraud ring exploiting Express Seller tier: fraudsters created thin seller accounts under reduced verification and paired them with synthetic buyer accounts to process high-value fraudulent orders',
            isCorrect: true,
            level: 'strong',
            feedback: 'The three-way concentration pattern — new sellers, new buyers, high-value categories — is the diagnostic signature of a coordinated account-takeover or synthetic identity fraud ring, not organic fraud. Individual opportunistic fraudsters do not create buyer and seller accounts simultaneously; organized rings do. The Express Seller tier reduced friction enough that the ring could spin up accounts at scale within 72 hours of the tier launching — suggesting they were monitoring for low-friction onboarding opportunities. This hypothesis explains the speed and concentration of the spike.',
          },
          {
            id: 'b',
            label: 'New sellers are inexperienced and accidentally triggering fraud flags by mishandling orders',
            isCorrect: false,
            level: 'partial',
            feedback: 'Inexperienced sellers might generate higher dispute rates, but accidental order mishandling does not explain the concentration in the most lucrative categories (Electronics, Collectibles) with brand-new buyer accounts. Legitimate new sellers sell across a variety of categories and their buyers are not disproportionately 1-3 days old. The category and buyer age pattern is inconsistent with accidental fraud and consistent with intentional coordinated activity.',
          },
          {
            id: 'c',
            label: 'The fraud detection model has a bias against new accounts that flags legitimate new-seller transactions at a higher rate',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Model bias was already ruled out in step 1 by confirming the flag definition is unchanged. Even if model recency bias existed, it would produce a gradual, diffuse elevation in new-seller flags across all categories — not the sharp concentration in Electronics/Collectibles with buyer accounts under 3 days old. The specificity of the signal contradicts a model bias explanation.',
          },
        ],
      },
      {
        id: 'validate',
        stepNumber: 5,
        label: 'Validation Approach',
        prompt: 'Your hypothesis is a coordinated fraud ring using Express Seller accounts. How do you confirm this?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Graph the seller account creation timestamps vs. paired buyer account creation timestamps, and check for shared device fingerprints, IP addresses, or payment credentials across flagged accounts',
            isCorrect: true,
            level: 'strong',
            feedback: 'Coordinated fraud rings leave infrastructure traces: shared IP addresses, device fingerprints, or payment credential clusters that reveal accounts created by the same actors. Plotting account creation timestamps will show whether the seller and buyer accounts were created in tight temporal clusters — a hallmark of coordinated ring operations. If 30 seller accounts and 30 buyer accounts were created in the same 4-hour window from the same IP range, you have confirmation sufficient to act and to share with law enforcement or your payment processor.',
          },
          {
            id: 'b',
            label: 'Contact a sample of new Express Sellers directly to verify their identity and the legitimacy of their orders',
            isCorrect: false,
            level: 'partial',
            feedback: 'Direct outreach to suspected fraudulent accounts will likely go unanswered or return false identity information — fraudsters do not respond honestly to identity verification requests. Infrastructure analysis (device, IP, timing) is faster and more reliable. Outreach is appropriate for borderline-suspicious accounts, not for confirming an active fraud ring where you already have strong data signals.',
          },
          {
            id: 'c',
            label: 'Run a holdout experiment where half of Express Seller applicants get full verification and compare fraud rates',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Running an experiment on active fraud is dangerous: you would be deliberately allowing additional fraud in the holdout group to generate data you already effectively have. The existing data — fraud rate 3.1% vs. 0.8% baseline, 89% of fraud from sellers onboarded in the last 5 days under the new tier — is already sufficient evidence that the Express tier is the entry vector. Experimentation is for optimization, not for confirming active security incidents.',
          },
        ],
      },
    ],
    sqlStep: {
      prompt: 'You\'ve confirmed that 89% of fraudulent orders come from Express Seller accounts created in the last 5 days, concentrated in Electronics and Collectibles, with buyer accounts under 3 days old.\n\nWrite a SQL query that compares fraud rates by seller onboarding tier and seller account age bucket, cross-referenced with buyer account age, to quantify the full scope of the coordinated fraud and identify which seller cohorts need immediate action.',
      hints: [
        'Bucket seller account age into: 0-5 days, 6-14 days, 15-30 days, 30+ days',
        'Join orders to sellers and buyers tables to get account creation dates for both sides',
        'Calculate fraud rate as fraudulent_orders / total_orders per bucket',
        'Include avg_order_value per bucket — high-value orders in new-account buckets strengthen the coordinated fraud signal',
      ],
      modelQuery: 'WITH seller_cohorts AS (\n  -- Classify each seller by onboarding tier and account age at time of order\n  SELECT\n    s.seller_id,\n    s.onboarding_tier,          -- \'express\' | \'standard\'\n    s.created_at                AS seller_created_at,\n\n    CASE\n      WHEN CURRENT_DATE - s.created_at::date <= 5  THEN \'0-5_days\'\n      WHEN CURRENT_DATE - s.created_at::date <= 14 THEN \'6-14_days\'\n      WHEN CURRENT_DATE - s.created_at::date <= 30 THEN \'15-30_days\'\n      ELSE \'30plus_days\'\n    END AS seller_age_bucket\n\n  FROM sellers s\n),\n\norder_fraud_flags AS (\n  -- Join orders with seller and buyer account metadata\n  SELECT\n    o.order_id,\n    o.seller_id,\n    o.buyer_id,\n    o.order_value,\n    o.product_category,\n    o.is_fraud_flagged,         -- Boolean from payment processor\n\n    sc.onboarding_tier,\n    sc.seller_age_bucket,\n\n    -- Buyer account age at time of order\n    CASE\n      WHEN o.created_at - b.created_at <= INTERVAL \'3 days\'  THEN \'0-3_days\'\n      WHEN o.created_at - b.created_at <= INTERVAL \'7 days\'  THEN \'4-7_days\'\n      ELSE \'7plus_days\'\n    END AS buyer_age_at_order\n\n  FROM orders o\n  INNER JOIN seller_cohorts sc  ON o.seller_id = sc.seller_id\n  INNER JOIN buyers b           ON o.buyer_id  = b.buyer_id\n  WHERE o.created_at >= CURRENT_DATE - INTERVAL \'10 days\'  -- Window spanning pre/post Express launch\n)\n\nSELECT\n  onboarding_tier,\n  seller_age_bucket,\n  buyer_age_at_order,\n\n  COUNT(*)                                                          AS total_orders,\n  SUM(is_fraud_flagged::int)                                        AS fraud_flagged_orders,\n\n  ROUND(\n    100.0 * SUM(is_fraud_flagged::int) / NULLIF(COUNT(*), 0), 2\n  )                                                                 AS fraud_rate_pct,\n\n  ROUND(AVG(order_value), 2)                                        AS avg_order_value,\n\n  -- High-value fraud concentration\n  SUM(CASE WHEN is_fraud_flagged AND order_value > 200 THEN 1 ELSE 0 END) AS high_value_fraud_orders\n\nFROM order_fraud_flags\n\nGROUP BY 1, 2, 3\nORDER BY onboarding_tier, seller_age_bucket, buyer_age_at_order;',
      annotation: 'seller_cohorts CTE bucktes each seller by account age and onboarding tier, creating the primary segmentation variable that connects to the Express Seller launch.\n\norder_fraud_flags CTE computes buyer account age at the exact time of the order — this is the right calculation, not buyer account age today. A buyer who created their account 2 days ago and ordered immediately is the synthetic buyer pattern; a buyer who created their account 2 days ago but ordered last week is a coincidence.\n\nfraud_rate_pct is the headline metric per cell. Expected output: the express / 0-5_days / 0-3_days row should show a dramatically elevated fraud rate (10-20%+) vs. the baseline standard / 30plus_days / 7plus_days row at ~0.8%.\n\nhigh_value_fraud_orders confirms the category concentration signal without requiring a category join — high ACV fraud in new-account cells is the fingerprint of a deliberate high-value-category targeting strategy by the fraud ring.',
    },
    seniorDiagnosis: {
      likelyCause: 'Coordinated fraud ring exploiting Express Seller reduced-verification onboarding by creating synthetic seller and buyer account pairs for high-value category fraud',
      reasoning: 'The 72-hour spike timeline aligned exactly with the Express Seller launch suggests the fraud ring was monitoring the platform for new low-friction onboarding paths. Organized fraud rings routinely test new account creation flows within hours of launch to identify exploitable gaps before platform defenses adapt. The 89% concentration of fraud in accounts under 5 days old, paired with buyer accounts under 3 days old transacting in the highest-value categories available (Electronics, Collectibles), is the unmistakable signature of a synthetic identity ring rather than opportunistic individual fraud. Individual fraudsters do not coordinate buyer and seller account creation simultaneously at this scale and speed. The Express Seller tier reduced verification friction enough to make account creation economically viable for the ring — standard verification was their prior deterrent. The $85k chargeback exposure understates the risk: payment processors have risk thresholds at which they escalate merchant categories or increase reserve requirements, which would have broader platform cost implications.',
      validationPlan: [
        'Extract all Express Seller accounts created in the last 5 days and perform device fingerprint and IP address clustering — identify shared infrastructure across seller and buyer accounts',
        'Map the temporal clustering: plot seller account creation time and paired buyer account creation time to confirm they were created in tight windows by the same actors',
        'Cross-reference flagged seller accounts with any existing fraud watchlists or shared-email-domain patterns',
        'Calculate total chargeback exposure: sum order_value for all flagged Express Seller orders to give finance the full liability estimate',
      ],
      recommendation: 'Immediately pause Express Seller onboarding pending a security review and restore standard verification requirements. Freeze all Express Seller accounts created in the last 5 days pending manual review, prioritizing those with flagged orders. Share device fingerprint and IP clusters with the payment processor to flag the fraud ring at the network level. Redesign Express Seller tier to include lightweight but harder-to-spoof verification (e.g., phone verification, bank account linkage) before re-launching.',
      commonMistakes: [
        'Treating the spike as individual opportunistic fraud and responding with incremental rule tightening rather than recognizing the coordinated ring pattern',
        'Running an experiment to confirm the onboarding tier is the vector instead of acting on already sufficient evidence',
        'Focusing only on seller-side verification without addressing the synthetic buyer account creation that is the other half of the fraud mechanism',
        'Reporting the fraud rate spike without connecting it to the payment processor escalation risk threshold',
      ],
      interviewPhrase: 'When fraud spikes simultaneously with a new low-friction onboarding flow, I assume an organized ring found the gap before we did — my first question is whether seller and buyer accounts were created in the same infrastructure cluster, not whether individual orders look suspicious.',
    },
    leadershipNote: 'Staff analysts read a 3x fraud spike in 72 hours as a coordinated attack signal, not individual bad actors — the velocity alone rules out opportunistic fraud. Juniors segment by order characteristics; Staff analysts immediately ask whether the new onboarding flow created an exploitable registration gap and check for infrastructure clustering. The payment processor escalation risk is the business-critical framing: sustained elevated fraud rates can trigger processing fee increases or account suspension, making this a finance conversation, not just a trust-and-safety ticket. The specificity rule applies to every fraud investigation step: \'I would look at the fraud data\' is never sufficient. \'I would query orders placed in the past 72 hours where seller_created_at > Express Seller launch date, group by device_fingerprint and ip_subnet, and flag any subnet with 3+ flagged orders\' is the correct level of precision for an interview answer.',
  },

  {
    id: 'RCA08',
    title: 'DAU Dropped 8% After Auto-Play Feature Launched',
    subtitle: 'Prism · Short-Form Video · Engagement',
    difficulty: 'senior',
    isFree: false,
    companies: ['Netflix', 'YouTube', 'TikTok'],
    domain: 'growth',
    linkedConceptIds: ['proxy-metric', 'funnel-decomposition', 'segmentation'],
    context: {
      metricMovement: 'DAU dropped 8.2% (from 4.1M to 3.77M) over 5 days after Auto-Play Series feature launched at 100% rollout',
      businessImpact: '~$180k daily revenue impact at current monetization rate; sustained DAU decline compounds into creator and advertiser loss',
      timeWindow: 'Drop began the day of Auto-Play Series launch, sustained across 5 days',
      knownFacts: [
        'Auto-Play Series launched as a full 100% rollout — no A/B test was run',
        'Session length increased 12% — users are watching more content per visit',
        'Notification opt-out rate increased 28% in the same 5-day window',
        'Day-1 retention (D1) dropped from 41% to 36% for new users acquired after launch',
        'Users who completed 3+ auto-play sessions have higher 7-day retention than non-auto-play users',
      ],
    },
    diagnosisSteps: [
      {
        id: 'system_check',
        stepNumber: 1,
        label: 'System / Data Check',
        prompt: 'Before diagnosing user behavior, what do you check first?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Verify DAU tracking definition has not changed — confirm the session event and daily active definition are unchanged post-launch',
            isCorrect: true,
            level: 'strong',
            feedback: 'Auto-Play changes how users interact with the app: a user may previously have opened the app twice (two separate DAU-qualifying sessions) but now opens it once for a longer session. If the DAU tracking logic changed to require a different event trigger, or if session merging changed how unique daily users are counted, the apparent DAU drop could be a measurement artifact. Confirming the tracking definition is unchanged eliminates this confound in minutes before any behavioral analysis begins.',
          },
          {
            id: 'b',
            label: 'Check whether a concurrent marketing campaign ended at the same time as the launch, reducing new user acquisition',
            isCorrect: false,
            level: 'partial',
            feedback: 'A campaign ending simultaneously with the launch is a legitimate alternative hypothesis worth ruling out, but it would show up as a new-user volume decline rather than a retention-driven DAU drop. Checking marketing spend is a valid secondary step after confirming tracking integrity. The D1 retention signal already suggests returning users are behaving differently, not just that acquisition dropped.',
          },
          {
            id: 'c',
            label: 'Immediately attribute the drop to the Auto-Play feature since the timing is obvious',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Assuming causation from temporal correlation without a controlled comparison is the most common analyst mistake in full-rollout scenarios. Because there was no A/B test, you cannot directly compare auto-play users vs. non-auto-play users contemporaneously. You must at minimum verify the measurement is valid and rule out external factors before concluding the feature caused the DAU drop.',
          },
        ],
      },
      {
        id: 'decompose',
        stepNumber: 2,
        label: 'Metric Decomposition',
        prompt: 'Tracking confirmed unchanged. Now decompose DAU into its components. What decomposition is most useful?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Decompose DAU into new users (first session ever) vs. returning users (had sessions in prior days) to identify which population is driving the drop',
            isCorrect: true,
            level: 'strong',
            feedback: 'DAU = new users + returning users. If new user volume is stable and returning user DAU is dropping, the feature is damaging retention of existing users. If new user volume dropped, acquisition is the cause. The D1 retention signal in the known facts already hints at returning-user suppression — but decomposing by new vs. returning confirms which population to focus on and prevents mixing two different causal stories. This decomposition is the fastest path to the correct root cause.',
          },
          {
            id: 'b',
            label: 'Decompose DAU by platform (iOS vs. Android vs. web) to check if the drop is platform-specific',
            isCorrect: false,
            level: 'partial',
            feedback: 'Platform segmentation is useful if the feature launched on only one platform or if there is a known platform-specific bug, but there is no evidence of a platform-specific issue here. The DAU drop appears to be a behavioral effect across all users, not a technical failure on one platform. Platform decomposition is a reasonable secondary check but not the most informative primary decomposition.',
          },
          {
            id: 'c',
            label: 'Look at total video views and engagement rate to confirm users are still engaging',
            isCorrect: false,
            level: 'wrong',
            feedback: 'You already know from the known facts that session length increased 12% — engagement per visit is up, not down. Re-confirming engagement metrics adds no new diagnostic information. The question is why more engagement per session is not translating into more daily active users, which requires a retention-focused decomposition, not an engagement metric review.',
          },
        ],
      },
      {
        id: 'segment',
        stepNumber: 3,
        label: 'Segmentation',
        prompt: 'Decomposition shows returning-user DAU is down while new-user volume is stable. Which segmentation identifies the mechanism?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Segment D1 and D7 retention rates by pre-launch cohorts vs. post-launch cohorts, and cross-reference with notification opt-out behavior',
            isCorrect: true,
            level: 'strong',
            feedback: 'Comparing retention cohorts (pre-launch vs. post-launch) isolates the feature effect on habitual return behavior: if D1 dropped from 41% to 36% and that drop maps precisely to post-launch cohorts, the feature is damaging the return loop. Crossing with notification opt-out behavior tests whether users who opted out of notifications — likely because they feel "done" after a long auto-play session — are the ones not returning. Together these cuts confirm the session-exhaustion mechanism rather than any alternative explanation.',
          },
          {
            id: 'b',
            label: 'Segment by content category to see if certain video types are causing disengagement',
            isCorrect: false,
            level: 'partial',
            feedback: 'Content category analysis is relevant for understanding what users watch, but it does not address the core question of why users are not returning the next day. The auto-play feature affects return behavior regardless of category — it is the depth-vs.-frequency trade-off that matters, not which specific content is being auto-played. Category analysis would be useful after confirming the behavioral mechanism.',
          },
          {
            id: 'c',
            label: 'Segment by user age demographic to see if older users are less comfortable with auto-play',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Demographic segmentation might show differential feature adoption, but the core mechanism — session exhaustion reducing return frequency — would manifest across demographic groups. Without a specific hypothesis that older or younger users are categorically different in their auto-play response, demographic segmentation is exploratory rather than diagnostic. Retention cohort analysis is far more targeted.',
          },
        ],
      },
      {
        id: 'hypothesis',
        stepNumber: 4,
        label: 'Root Cause Hypothesis',
        prompt: 'D1 retention dropped 5pp, notification opt-outs are up 28%, session length is up 12%. Which hypothesis best explains the DAU drop?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Auto-play creates session exhaustion: longer sessions leave users feeling "done," reducing return frequency the next day — the feature trades session depth for habitual daily return visits',
            isCorrect: true,
            level: 'strong',
            feedback: 'This hypothesis is the only one that explains all four signals simultaneously: session length up (users watch more per visit), D1 retention down (they return less the next day), notification opt-outs up (they do not want to be pulled back in as urgently), and DAU down (the net effect of fewer daily return visits outweighs the per-session engagement gain). The tension between depth and frequency is a well-documented engagement trade-off in content platforms. Auto-play was optimized for depth metrics without measuring its effect on return frequency, and the habitual return loop — the core driver of daily active usage — was damaged.',
          },
          {
            id: 'b',
            label: 'Auto-play is surfacing low-quality content in the series, causing users to have negative experiences and churn',
            isCorrect: false,
            level: 'partial',
            feedback: 'Content quality degradation could cause DAU decline, but the known facts show that users who complete 3+ auto-play sessions have higher 7-day retention — if content quality were poor, completing more auto-play sessions would not produce better outcomes. The positive relationship between auto-play completion and 7-day retention contradicts a content quality hypothesis.',
          },
          {
            id: 'c',
            label: 'The 100% rollout had a technical bug that prevented some users from opening the app normally',
            isCorrect: false,
            level: 'wrong',
            feedback: 'A technical bug causing app opening failures would show up in crash rates, error logs, and session start failures — not in session length increasing 12%. If users could not open the app, session length would not increase. The behavioral signature (longer sessions, lower return frequency) is inconsistent with a technical access failure and consistent with a product behavioral effect.',
          },
        ],
      },
      {
        id: 'validate',
        stepNumber: 5,
        label: 'Validation Approach',
        prompt: 'Your hypothesis is session exhaustion reducing return frequency. How do you confirm this without an A/B test (since the feature went to 100%)?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Use pre/post cohort comparison: compare D1-D7 retention for users acquired in the 2 weeks before launch vs. 2 weeks after launch, controlling for day-of-week effects',
            isCorrect: true,
            level: 'strong',
            feedback: 'A pre/post cohort comparison is the best available substitute for an A/B test when the feature went to 100%. Comparing retention curves for pre-launch vs. post-launch acquisition cohorts — controlling for day-of-week and seasonal effects — gives a quasi-experimental estimate of the feature effect. If post-launch D1/D7 retention is persistently lower across multiple weekly cohorts, the feature is the most plausible explanation. This approach is transparent about its limitations (no control group) while providing actionable directional evidence.',
          },
          {
            id: 'b',
            label: 'Survey users who have opted out of notifications to ask why they reduced their usage',
            isCorrect: false,
            level: 'partial',
            feedback: 'Surveying opted-out users can provide qualitative color on the exhaustion hypothesis, but notification opt-outs are not perfectly correlated with DAU decline, and self-reported behavior is less reliable than observed behavioral data. The pre/post cohort retention comparison gives stronger causal evidence faster. Use survey data as supplementary qualitative support, not as the primary validation.',
          },
          {
            id: 'c',
            label: 'Run a new A/B test where 50% of users get auto-play removed to measure the causal effect',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Turning off a feature for half your users after a full rollout is a product regression experiment that requires significant product and engineering alignment — it is not an analyst\'s unilateral call and would take days to set up properly. More importantly, you have behavioral data available right now (pre-launch cohorts as the natural control group) that can give you directional evidence quickly. Use the data you have before proposing expensive experimental infrastructure.',
          },
        ],
      },
    ],
    sqlStep: {
      prompt: 'Your hypothesis is session exhaustion: Auto-Play Series creates longer sessions per visit but damages the habitual daily return loop, suppressing DAU.\n\nWrite a SQL query that compares D1 and D7 retention for user cohorts acquired before the Auto-Play launch vs. after, and also shows the relationship between auto-play session completion count and retention — to confirm both the pre/post retention drop and the depth-vs.-frequency trade-off.',
      hints: [
        'Use install_date to separate pre-launch cohorts (before launch_date) from post-launch cohorts',
        'D1 retention = user had a session on day 1 after install; D7 = session on day 7',
        'Count auto_play_completions per user in their first 7 days and bucket (0, 1-2, 3+)',
        'Control for day-of-week by grouping cohorts by install_week, not install_day',
      ],
      modelQuery: 'WITH user_cohorts AS (\n  -- Classify users as pre-launch or post-launch based on install date\n  SELECT\n    u.user_id,\n    u.install_date,\n    DATE_TRUNC(\'week\', u.install_date)  AS install_week,\n\n    CASE\n      WHEN u.install_date < \'2024-03-15\'  THEN \'pre_launch\'   -- Auto-Play launch date\n      ELSE \'post_launch\'\n    END AS cohort_group\n\n  FROM users u\n  WHERE u.install_date >= \'2024-03-01\'  -- 2 weeks pre-launch + post-launch period\n),\n\nauto_play_usage AS (\n  -- Count auto-play series completions per user in first 7 days\n  SELECT\n    e.user_id,\n    COUNT(CASE WHEN e.event_type = \'autoplay_series_completed\' THEN 1 END) AS autoplay_completions,\n\n    CASE\n      WHEN COUNT(CASE WHEN e.event_type = \'autoplay_series_completed\' THEN 1 END) = 0  THEN \'0_completions\'\n      WHEN COUNT(CASE WHEN e.event_type = \'autoplay_series_completed\' THEN 1 END) <= 2 THEN \'1-2_completions\'\n      ELSE \'3plus_completions\'\n    END AS autoplay_bucket\n\n  FROM events e\n  INNER JOIN user_cohorts uc ON e.user_id = uc.user_id\n  WHERE e.event_date BETWEEN uc.install_date AND uc.install_date + INTERVAL \'7 days\'\n  GROUP BY 1\n),\n\nretention_flags AS (\n  -- Flag D1 and D7 sessions for each user\n  SELECT\n    uc.user_id,\n    uc.cohort_group,\n    uc.install_week,\n\n    MAX(CASE\n      WHEN DATE(s.session_start) = uc.install_date + INTERVAL \'1 day\' THEN 1 ELSE 0\n    END) AS retained_d1,\n\n    MAX(CASE\n      WHEN DATE(s.session_start) = uc.install_date + INTERVAL \'7 days\' THEN 1 ELSE 0\n    END) AS retained_d7\n\n  FROM user_cohorts uc\n  LEFT JOIN app_sessions s ON uc.user_id = s.user_id\n  GROUP BY 1, 2, 3\n)\n\nSELECT\n  rf.cohort_group,\n  rf.install_week,\n  COALESCE(ap.autoplay_bucket, \'0_completions\')  AS autoplay_bucket,\n\n  COUNT(*)                                        AS users,\n\n  ROUND(100.0 * AVG(rf.retained_d1), 1)          AS d1_retention_pct,\n  ROUND(100.0 * AVG(rf.retained_d7), 1)          AS d7_retention_pct\n\nFROM retention_flags rf\nLEFT JOIN auto_play_usage ap ON rf.user_id = ap.user_id\n\nGROUP BY 1, 2, 3\nORDER BY cohort_group, install_week, autoplay_bucket;',
      annotation: 'user_cohorts CTE creates the quasi-experimental comparison groups using install_date relative to the Auto-Play launch date. install_week grouping controls for day-of-week seasonality in new user acquisition and retention patterns.\n\nauto_play_usage CTE counts completions per user within their first 7 days — this is the depth metric. The bucket creates the dose-response variable: does more auto-play completion predict higher or lower retention?\n\nretention_flags CTE defines D1 and D7 as sessions on the exact day (not "within" the day range) — adjust to your team\'s retention definition if you use a different window.\n\nExpected output: the pre_launch rows should show D1 ~41% and D7 higher; post_launch rows should show D1 ~36% and D7 lower — confirming the retention regression. Within post-launch, the 3plus_completions bucket should show higher D7 retention than 0_completions, confirming that deep auto-play engagement is a positive signal, but the product is not getting most users into that state.',
    },
    seniorDiagnosis: {
      likelyCause: 'Auto-Play Series damages the habitual daily return loop by creating session exhaustion — users watch more per visit but return less the next day, suppressing DAU',
      reasoning: 'The feature was evaluated on the wrong success metric before launch: session length is an engagement depth metric, not a return frequency metric, and these two can move in opposite directions. Auto-Play Series optimized for depth (12% session length increase) while inadvertently undermining frequency (5pp D1 retention drop, 28% notification opt-out increase). The habitual return loop is the engine of DAU on short-form video platforms — users need to feel there is always more to discover when they return, which requires moderate session "appetite" remaining after each visit. Auto-play can satisfy that appetite so completely in one session that users feel less pull to return the next day. The irony is that users who do complete 3+ auto-play sessions show higher 7-day retention, suggesting the feature works well for already-engaged power users but is counterproductive for the majority who get over-served in a single session. The 100% rollout without an A/B test means you cannot quantify the counterfactual cleanly — this is also a process failure.',
      validationPlan: [
        'Run pre/post cohort retention analysis comparing D1-D7 retention curves for 2 weeks pre-launch vs. 2 weeks post-launch cohorts, controlling for install week',
        'Segment auto-play completion count (0, 1-2, 3+) vs. D7 retention to confirm the depth-frequency trade-off and identify whether there is an optimal completion count',
        'Measure the contribution of notification opt-outs to the DAU decline: calculate DAU suppression attributable to the 28% increase in opt-out rate (users who opt out receive fewer re-engagement nudges)',
        'Model the DAU trajectory under three scenarios: no change, auto-play disabled, auto-play with session caps (max 2 consecutive auto-plays before a pause prompt)',
      ],
      recommendation: 'Add a session break prompt after 2-3 consecutive auto-plays (e.g., "You\'ve watched 3 in a row — come back tomorrow for more") to preserve the return appetite. Redefine feature success metrics to include D1 and D7 retention alongside session length — a feature that increases session length while reducing return frequency is net negative for DAU-based businesses. Retroactively set up a 5% holdout group to generate a clean causal estimate of the feature effect for future launch decisions.',
      commonMistakes: [
        'Celebrating session length increase as a success signal without checking its effect on return frequency',
        'Not recognizing the depth-vs.-frequency trade-off as the diagnostic frame for content platform engagement drops',
        'Proposing a new A/B test to measure the effect instead of using the pre/post cohort analysis already available',
        'Launching a major engagement feature at 100% without a holdout group, eliminating the ability to measure causal impact cleanly',
      ],
      interviewPhrase: 'On content platforms, I always track session depth and return frequency together — a feature that increases one while suppressing the other is a trade-off, not a win, and session length without D1 retention is a vanity metric.',
    },
    leadershipNote: 'Staff analysts distinguish between engagement depth and engagement frequency — a feature that increases session length while suppressing return rate is a trade-off, not a win, and DAU-based businesses always pay that cost eventually. The launch governance failure here is equally important: a 100% rollout with no holdout group means the causal effect can only be estimated, not measured cleanly. The forward implication is a launch policy: any feature touching session behavior requires a retained holdout for at least 14 days.',
  },

  {
    id: 'RCA09',
    title: 'MRR Growth Slowed to Near-Zero Over One Quarter',
    subtitle: 'Threadline · B2B SaaS · Revenue Health',
    difficulty: 'senior',
    isFree: false,
    companies: ['Slack', 'Notion', 'Linear'],
    domain: 'saas',
    linkedConceptIds: ['funnel-decomposition', 'segmentation', 'proxy-metric'],
    context: {
      metricMovement: 'MRR growth slowed from +4.2% MoM to +0.8% MoM over the past quarter and is now trending toward negative',
      businessImpact: 'If current trend holds, MRR will peak within 2 months and begin declining — critical risk ahead of a planned fundraise',
      timeWindow: 'Gradual deceleration over 3 months; no single point of inflection',
      knownFacts: [
        'New MRR from new customers has held flat at ~$85k/month throughout the quarter',
        'Expansion MRR (seat additions, tier upgrades) dropped from $42k to $18k/month',
        'Contraction MRR (downgrades, seat reductions) increased from $12k to $28k/month',
        'Churn MRR (full cancellations) held flat at ~$25k/month',
        'Enterprise accounts (ACV > $20k) show 118% NRR; SMB accounts show 82% NRR',
      ],
    },
    diagnosisSteps: [
      {
        id: 'system_check',
        stepNumber: 1,
        label: 'System / Data Check',
        prompt: 'MRR growth decelerated gradually over a full quarter. Before attributing this to business causes, what do you verify?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Verify the MRR waterfall definition — confirm new, expansion, contraction, and churn buckets are categorized consistently and that no accounts were reclassified between segments',
            isCorrect: true,
            level: 'strong',
            feedback: 'MRR waterfall metrics are highly sensitive to categorization methodology: a single reclassification rule change can shift revenue between expansion and new MRR, or between contraction and churn, making trends appear that are purely definitional. In B2B SaaS, mid-quarter changes to how seat additions are categorized (new contract vs. expansion) are common. Confirming no methodology change occurred is the first step before treating the MRR trend as a real business signal.',
          },
          {
            id: 'b',
            label: 'Check if the sales team closed fewer deals this quarter compared to last quarter',
            isCorrect: false,
            level: 'partial',
            feedback: 'Sales volume is worth checking, but the known facts show new MRR is flat — not declining — so the sales pipeline is not the primary problem. The issue is in the existing customer base (expansion collapsing, contraction rising), not in acquisition. A narrow focus on new bookings would miss the core revenue health story.',
          },
          {
            id: 'c',
            label: 'Accept the trend as real and immediately analyze which product features are underperforming',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Jumping to product analysis before validating the MRR waterfall definition risks attributing a definitional change to a product problem. Gradual MRR deceleration over a quarter is exactly the scenario where accounting methodology changes can create a false trend. Validate the measurement before diagnosing the cause.',
          },
        ],
      },
      {
        id: 'decompose',
        stepNumber: 2,
        label: 'Metric Decomposition',
        prompt: 'MRR waterfall definition confirmed consistent. Now decompose the MRR movement to find which component is most responsible for the deceleration. What decomposition do you run?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Build a full MRR waterfall: net MRR change = new MRR + expansion MRR − contraction MRR − churn MRR, and calculate each bucket\'s contribution to the deceleration vs. the prior period',
            isCorrect: true,
            level: 'strong',
            feedback: 'The MRR waterfall decomposition is the standard diagnostic framework for SaaS revenue health. You already have directional clues from the known facts (expansion dropped, contraction rose), but calculating each bucket\'s precise dollar contribution to the net MRR change makes the priority order explicit. Expansion dropping $24k/month and contraction rising $16k/month explains a $40k/month net MRR headwind — quantifying this precisely is the starting point for a defensible recommendation to leadership.',
          },
          {
            id: 'b',
            label: 'Calculate month-over-month growth rate for total revenue and compare to industry benchmarks',
            isCorrect: false,
            level: 'partial',
            feedback: 'Industry benchmarking gives context but does not diagnose the cause within Threadline\'s specific revenue mix. A company with the same growth rate as its peer group could still have a structurally deteriorating expansion engine — you need the waterfall decomposition to find the internal driver before benchmarking makes sense as a framing tool.',
          },
          {
            id: 'c',
            label: 'Look at total contract count and average ACV to determine if the product is being underpriced',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Pricing analysis is not indicated by the available signals — there is no evidence that price is wrong, and the NRR differential (118% enterprise vs. 82% SMB) suggests the issue is segment-specific customer health, not pricing structure. Investigating pricing without first establishing where the MRR compression is coming from is unfocused and would likely return inconclusive results.',
          },
        ],
      },
      {
        id: 'segment',
        stepNumber: 3,
        label: 'Segmentation',
        prompt: 'Waterfall shows expansion MRR collapsed and contraction MRR doubled. Which segmentation identifies which accounts are responsible?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Segment expansion and contraction MRR by account size (SMB vs. enterprise) and account cohort (acquisition quarter) to find where NRR is failing',
            isCorrect: true,
            level: 'strong',
            feedback: 'The NRR differential in the known facts — 118% enterprise vs. 82% SMB — directly tells you to segment by account size. Applying this segmentation to the expansion and contraction buckets will confirm that nearly all of the contraction MRR is coming from SMB accounts and nearly all of the expansion collapse is an SMB problem. Cohort analysis adds a time dimension: if SMB accounts acquired 6-12 months ago are now contracting, you can forecast when the current acquisition cohort will hit the same wall. This segmentation produces an actionable and complete diagnosis.',
          },
          {
            id: 'b',
            label: 'Segment by industry vertical to find which market segments have the weakest NRR',
            isCorrect: false,
            level: 'partial',
            feedback: 'Industry vertical segmentation is a valid secondary cut, particularly if Threadline serves distinct verticals with different retention profiles. However, the NRR differential by account size is already given in the known facts and is a stronger prior than vertical segmentation. Start with the variable whose effect you already have evidence for before adding new dimensions.',
          },
          {
            id: 'c',
            label: 'Segment by customer success manager (CSM) to find if specific account managers are associated with higher churn',
            isCorrect: false,
            level: 'wrong',
            feedback: 'CSM-level segmentation is appropriate when the hypothesis is service quality variation, but there is no evidence of that here. The 82% NRR for the entire SMB segment suggests a systematic business-model problem with that customer type, not individual CSM performance. Segmenting by CSM would add noise without addressing the structural segment economics that are the actual driver.',
          },
        ],
      },
      {
        id: 'hypothesis',
        stepNumber: 4,
        label: 'Root Cause Hypothesis',
        prompt: 'Segmentation confirms SMB accounts have 82% NRR (contracting and not expanding) while enterprise has 118% NRR. Which hypothesis best explains the MRR growth collapse?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'SMB segment NRR failure: downgrades and seat reductions are concentrated in SMB, expansion has collapsed in SMB, and the revenue growth engine is failing at the SMB layer while enterprise remains healthy',
            isCorrect: true,
            level: 'strong',
            feedback: 'This hypothesis explains the full pattern: net MRR growth = new MRR ($85k flat) + expansion MRR ($18k, down $24k) − contraction MRR ($28k, up $16k) − churn MRR ($25k flat). The $40k/month net headwind is entirely explained by SMB accounts contracting rather than expanding. An 82% NRR means SMB accounts are on average generating 18% less revenue 12 months after signing — they are shrinking customers, not growing ones. The expansion collapse is the other side: SMB accounts are not adding seats or upgrading tiers, suggesting they are not getting enough product value to justify investing more.',
          },
          {
            id: 'b',
            label: 'The company has reached market saturation — it has signed most available customers and growth is naturally slowing',
            isCorrect: false,
            level: 'partial',
            feedback: 'Market saturation would manifest as declining new MRR, not stable new MRR with collapsing expansion. New MRR is flat at $85k, meaning acquisition is still working. The problem is in the existing customer base — specifically SMB accounts contracting rather than growing. Market saturation is the wrong diagnosis for a revenue problem driven by NRR, not acquisition.',
          },
          {
            id: 'c',
            label: 'Product quality has declined, causing customers across all segments to reduce usage',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Enterprise NRR at 118% directly contradicts a broad product quality decline — enterprise customers are expanding, not contracting. If product quality had declined, you would expect NRR to fall across both segments. The segment-specific pattern (SMB 82% vs. enterprise 118%) points to a segment economics problem, not a universal product failure.',
          },
        ],
      },
      {
        id: 'validate',
        stepNumber: 5,
        label: 'Validation Approach',
        prompt: 'Your hypothesis is SMB NRR failure. How do you quantify and validate the business impact before presenting to leadership?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Build a segment-level MRR waterfall (SMB vs. enterprise) showing each bucket\'s contribution — new, expansion, contraction, churn — for each of the past 3 months',
            isCorrect: true,
            level: 'strong',
            feedback: 'A segment-level waterfall is the definitive analysis for this scenario: it makes explicit which segment is contributing positively (enterprise: high expansion, low churn) and which is dragging (SMB: high contraction, low expansion). Showing 3 months of history also reveals whether the SMB NRR deterioration is accelerating, stable, or recovering — a critical dimension for the fundraise narrative. This analysis is directly presentable to a CFO or board and translates into specific intervention points.',
          },
          {
            id: 'b',
            label: 'Survey churned and downgraded SMB customers to understand why they reduced spending',
            isCorrect: false,
            level: 'partial',
            feedback: 'Customer surveys provide qualitative texture on the SMB contraction drivers and are useful supplementary input, but they take time and have low response rates from churned accounts. The quantitative waterfall analysis gives you the financial story you need to act — surveys can complement the analysis but should not replace or precede it when you need to move quickly ahead of a fundraise.',
          },
          {
            id: 'c',
            label: 'Calculate the blended NRR for the whole business and report it as the headline metric',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Blended NRR averaging enterprise and SMB together obscures the exact problem you are trying to surface: the segment divergence. A blended NRR of ~100% looks acceptable but hides the fact that the SMB engine is structurally declining. Reporting blended NRR to leadership in this scenario would understate the risk and prevent the focused intervention the SMB segment requires.',
          },
        ],
      },
    ],
    sqlStep: {
      prompt: 'You\'ve confirmed SMB NRR is 82% and is driving the MRR growth collapse through expansion collapse and contraction increases.\n\nWrite a SQL query that builds a monthly MRR waterfall by segment (SMB vs. enterprise), showing new MRR, expansion MRR, contraction MRR, churn MRR, and net MRR change for each segment over the past 3 months.',
      hints: [
        'Compare each account\'s MRR in month M vs. month M-1 to classify the movement type',
        'New = account did not exist in M-1; Expansion = MRR increased; Contraction = MRR decreased but still active; Churn = account gone in M',
        'Segment by account_size (enterprise: ACV > $20k, SMB: ACV <= $20k)',
        'Use a LAG window function or self-join to get prior month MRR per account',
      ],
      modelQuery: 'WITH monthly_mrr AS (\n  -- Get each account\'s MRR for each month in the past 4 months\n  -- (4 months to enable 3-month MoM comparison)\n  SELECT\n    a.account_id,\n    a.segment,                  -- \'enterprise\' | \'smb\'\n    DATE_TRUNC(\'month\', m.month_date)   AS mrr_month,\n    m.mrr_amount\n\n  FROM accounts a\n  INNER JOIN account_mrr_monthly m ON a.account_id = m.account_id\n  WHERE m.month_date >= DATE_TRUNC(\'month\', CURRENT_DATE - INTERVAL \'4 months\')\n),\n\nmrr_with_prior AS (\n  -- Attach prior month MRR to each account-month\n  SELECT\n    curr.account_id,\n    curr.segment,\n    curr.mrr_month,\n    curr.mrr_amount                                         AS current_mrr,\n    LAG(curr.mrr_amount) OVER (\n      PARTITION BY curr.account_id ORDER BY curr.mrr_month\n    )                                                       AS prior_mrr\n\n  FROM monthly_mrr curr\n),\n\nmrr_waterfall AS (\n  -- Classify each account-month into a MRR movement bucket\n  SELECT\n    account_id,\n    segment,\n    mrr_month,\n    current_mrr,\n    prior_mrr,\n\n    CASE\n      WHEN prior_mrr IS NULL                         THEN \'new\'\n      WHEN current_mrr IS NULL AND prior_mrr > 0     THEN \'churn\'\n      WHEN current_mrr > prior_mrr                   THEN \'expansion\'\n      WHEN current_mrr < prior_mrr AND current_mrr > 0 THEN \'contraction\'\n      ELSE \'flat\'\n    END AS mrr_movement_type,\n\n    -- Dollar contribution to net MRR change\n    CASE\n      WHEN prior_mrr IS NULL                           THEN current_mrr\n      WHEN current_mrr IS NULL AND prior_mrr > 0       THEN -prior_mrr\n      WHEN current_mrr IS NOT NULL AND prior_mrr IS NOT NULL THEN current_mrr - prior_mrr\n      ELSE 0\n    END AS mrr_delta\n\n  FROM mrr_with_prior\n  -- Exclude accounts that were flat or absent in both months\n  WHERE NOT (current_mrr = prior_mrr AND current_mrr IS NOT NULL)\n)\n\nSELECT\n  segment,\n  mrr_month,\n  mrr_movement_type,\n\n  COUNT(DISTINCT account_id)      AS account_count,\n  ROUND(SUM(mrr_delta), 0)        AS mrr_contribution\n\nFROM mrr_waterfall\nWHERE mrr_month >= DATE_TRUNC(\'month\', CURRENT_DATE - INTERVAL \'3 months\')\n  AND mrr_movement_type != \'flat\'\n\nGROUP BY 1, 2, 3\nORDER BY segment, mrr_month, mrr_movement_type;',
      annotation: 'monthly_mrr CTE pulls MRR per account per month for a 4-month window. The extra month (4 vs. 3) is needed so LAG() has a prior-period value for the first month you want to report.\n\nLAG() window function in mrr_with_prior attaches the prior month\'s MRR to each row. PARTITION BY account_id ensures the lag is within each account\'s own time series, not across accounts.\n\nmrr_movement_type CASE WHEN is the waterfall classification logic. The churn case handles accounts that appear in prior months but not in the current month (current_mrr IS NULL after a LEFT JOIN or when an account closes).\n\nmrr_delta calculates each account-month\'s dollar contribution to net MRR change. Summing this by segment × movement_type gives you the exact dollar contribution of SMB contraction vs. enterprise expansion.\n\nExpected output: the SMB / contraction rows will show large negative mrr_contribution ($20-28k/month) while the enterprise / expansion rows will show strong positive contributions. The net SMB MRR movement will visibly be negative or near-zero, directly explaining the overall growth deceleration.',
    },
    seniorDiagnosis: {
      likelyCause: 'SMB segment NRR failure: expansion MRR collapsed and contraction MRR doubled among SMB accounts, overwhelming the flat new-customer acquisition engine',
      reasoning: 'The MRR growth deceleration is a net effect of three simultaneous movements: expansion dropping $24k/month, contraction increasing $16k/month, and churn holding flat. These movements are almost entirely attributable to the SMB segment, which shows 82% NRR — meaning every cohort of SMB accounts is on average 18% smaller 12 months later. The enterprise segment at 118% NRR is actually a healthy expanding book of business; it is the SMB segment that is dragging net growth toward zero. The lack of a single inflection point indicates this is structural, not event-driven — SMB accounts are systematically not getting enough product value to maintain or grow their spending, and the expansion that previously masked this dynamic ($42k/month) has stopped. Ahead of a fundraise, this is the most dangerous possible pattern: headline MRR growth is near zero and trending negative, but the underlying enterprise segment is healthy, meaning the fix requires a clear SMB strategy change rather than broad cost cuts or product pivots.',
      validationPlan: [
        'Build a segment-level MRR waterfall (SMB vs. enterprise) for the past 3 months confirming that net SMB MRR is negative and net enterprise MRR is positive',
        'Calculate SMB cohort NRR: take every quarterly SMB acquisition cohort from 12 months ago and measure their MRR today vs. at acquisition — confirm the 82% NRR figure and trend direction',
        'Identify the top 20 SMB contraction accounts and review their usage data — are they reducing seats because of low engagement, budget constraints, or competitive switching?',
        'Model 12-month forward MRR under current trajectory vs. a scenario where SMB NRR improves to 95% — quantify the fundraise impact of each scenario',
      ],
      recommendation: 'Treat SMB NRR as a top-3 company metric alongside new MRR and enterprise NRR. Launch an SMB success program targeting the 3-6 month tenure window (before contraction begins) with automated health scoring and proactive CSM outreach. Evaluate whether the current SMB pricing model captures enough value relative to cost-to-serve — an 82% NRR SMB segment may require a higher entry price point with lower seat expansion friction.',
      commonMistakes: [
        'Reporting blended NRR without segmenting by account size, which hides the enterprise vs. SMB divergence',
        'Diagnosing the MRR growth problem as a sales or acquisition problem when new MRR is flat — the issue is clearly in the existing customer base',
        'Treating the $42k-to-$18k expansion collapse as a minor line item rather than the primary revenue engine failure',
        'Not connecting the 82% SMB NRR to a forward trajectory — at 82% NRR the SMB book halves in value every 4 years',
      ],
      interviewPhrase: 'When MRR growth decelerates without a drop in new bookings, I go straight to the waterfall — expansion and contraction tell you whether your existing customers believe in the product, and NRR by segment tells you which part of your business is structurally sound.',
    },
    leadershipNote: 'Staff analysts immediately decompose MRR into new, expansion, contraction, and churn when growth decelerates — because flat new MRR with declining net retention means the existing book is eroding, not the top of the funnel. The segment-level NRR split is the key move juniors miss: blended NRR hides the structural difference between a healthy enterprise book and a structurally declining SMB book. The leadership framing is forward trajectory — at 82% SMB NRR, that segment loses half its value in four years, which belongs in the board update.',
  },

  {
    id: 'RCA10',
    title: 'Monthly Churn Rate More Than Doubled in One Month',
    subtitle: 'Threadline · B2B SaaS · Retention',
    difficulty: 'analyst',
    isFree: false,
    companies: ['Slack', 'Asana', 'Monday.com'],
    domain: 'saas',
    linkedConceptIds: ['segmentation', 'data-quality-check', 'funnel-decomposition'],
    context: {
      metricMovement: 'Monthly account churn rate increased from 1.8% to 4.1% in a single month — a 2.3x increase',
      businessImpact: 'At 4.1% monthly churn, annualized ARR loss to churn would reach $3.9M — approaching total new ARR generation and threatening net growth',
      timeWindow: 'Spike observed in the billing month that followed a pricing change implemented 6 weeks ago',
      knownFacts: [
        'A pricing change was implemented 6 weeks ago: annual contracts unchanged, but month-to-month price increased 25%',
        '78% of churned accounts in the spike month were on month-to-month billing',
        'Churned accounts had average tenure of 8 months and ACV of $3,200',
        'Exit survey responses (n=41): "price too high" cited by 67%, "found alternative" cited by 29%',
        'No product changes or service quality incidents occurred in the relevant period',
      ],
    },
    diagnosisSteps: [
      {
        id: 'system_check',
        stepNumber: 1,
        label: 'System / Data Check',
        prompt: 'Churn rate doubled in a single month. What do you verify first?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Verify the churn definition and attribution window have not changed — confirm "churned" accounts are cancellations in the same period and not a batch of delayed processings hitting the same month',
            isCorrect: true,
            level: 'strong',
            feedback: 'Churn rate spikes that appear in a single month are frequently caused by batch processing artifacts: a backlog of pending cancellations processed together, or a change in when cancellations are attributed (end-of-contract vs. notice date vs. billing date). A sudden 2.3x increase in a single month is a red flag for a data attribution change rather than a real behavioral shift. Confirming the churn definition and processing logic is unchanged eliminates the most common false-positive before any business analysis.',
          },
          {
            id: 'b',
            label: 'Pull the exit survey data immediately to understand why customers are leaving',
            isCorrect: false,
            level: 'partial',
            feedback: 'Exit survey data is valuable evidence — and it is already available in the known facts with a clear "price too high" signal. However, reading survey results before confirming the churn measurement is valid risks building an analysis on faulty data. Verify the measurement first, then interpret the qualitative signals.',
          },
          {
            id: 'c',
            label: 'Assume the churn spike is real and immediately roll back the pricing change',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Rolling back a pricing change before confirming whether the churn spike is real — or whether it is caused by the pricing change specifically rather than by other factors — is premature and potentially costly. Pricing rollbacks have their own revenue impact and signal instability to customers. Validate the measurement and segment the churn before recommending any action.',
          },
        ],
      },
      {
        id: 'decompose',
        stepNumber: 2,
        label: 'Metric Decomposition',
        prompt: 'Churn measurement confirmed accurate. How do you decompose the churn rate to identify the primary driver?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Decompose churn by billing type (month-to-month vs. annual) to test whether the price increase on month-to-month contracts is the mechanism',
            isCorrect: true,
            level: 'strong',
            feedback: 'The pricing change affected only month-to-month customers, and 78% of churned accounts were on month-to-month billing. Decomposing by billing type will directly confirm or refute whether the churn spike is concentrated in the affected population. If monthly-contract churn spiked dramatically while annual churn held flat, the pricing change is the cause. This decomposition is the single fastest path to a definitive root cause with the evidence available.',
          },
          {
            id: 'b',
            label: 'Compare churn rate by product feature usage to find which features churn correlates with',
            isCorrect: false,
            level: 'partial',
            feedback: 'Feature usage correlation is a useful long-term churn predictor, but it does not explain why churn spiked in a specific month immediately following a pricing change. Feature usage patterns change gradually — they do not create sudden single-month churn spikes. The pricing change is the timing-matched event, and billing type is the direct segmentation variable to test it.',
          },
          {
            id: 'c',
            label: 'Look at total ARR lost to churn and compare to new ARR won in the same month',
            isCorrect: false,
            level: 'wrong',
            feedback: 'ARR comparison between churn and new bookings measures net revenue impact but does not diagnose why churn spiked. You already know the dollar impact is significant ($3.9M annualized). The diagnostic question is the cause of the spike, which requires decomposing the churned population by the variable that changed (billing type), not aggregating to a net revenue figure.',
          },
        ],
      },
      {
        id: 'segment',
        stepNumber: 3,
        label: 'Segmentation',
        prompt: 'Billing type decomposition confirms month-to-month churn drove the spike. Which additional segmentation quantifies the risk and finds any secondary patterns?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Segment churned month-to-month accounts by account tenure bucket (0-3 months, 4-9 months, 10-18 months, 18+ months) and ACV',
            isCorrect: true,
            level: 'strong',
            feedback: 'Tenure and ACV segmentation answers two critical follow-up questions: (1) which tenure band is most price-sensitive (shorter-tenure accounts have lower switching costs and less product investment, making them more likely to churn on a price increase), and (2) what is the financial composition of the churned accounts (low-ACV churn at high volume vs. a few large accounts churning). The known facts already indicate churned accounts averaged 8 months tenure and $3,200 ACV — mid-tenure, low-ACV SMB accounts are the most price-elastic segment and the most vulnerable to a 25% increase.',
          },
          {
            id: 'b',
            label: 'Segment by geographic region to see if churn is concentrated in markets with stronger competitive alternatives',
            isCorrect: false,
            level: 'partial',
            feedback: '29% of exit survey respondents cited "found alternative," which makes competitive dynamics a relevant secondary consideration. However, a geographically segmented competitive response would not produce a single-month spike — it would show gradual regional trends. The spike timing is precisely aligned with the pricing change, making billing type and price sensitivity the primary segmentation, with competitive geography as a secondary follow-up.',
          },
          {
            id: 'c',
            label: 'Segment by the customer success manager responsible for each churned account',
            isCorrect: false,
            level: 'wrong',
            feedback: 'CSM segmentation is only relevant when service quality is a plausible cause, and the known facts explicitly state no service quality incidents occurred. When 67% of exit respondents cite price and a 25% price increase just happened, the service quality hypothesis is already contradicted by the evidence. Attributing the spike to CSM performance would be an evidence inversion.',
          },
        ],
      },
      {
        id: 'hypothesis',
        stepNumber: 4,
        label: 'Root Cause Hypothesis',
        prompt: '78% of churn is month-to-month, 67% of exit surveys say price, pricing change was 25% on month-to-month contracts. What is the root cause?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'The 25% month-to-month price increase directly triggered churn among price-sensitive shorter-tenure SMB accounts — month-to-month customers have high price elasticity and low switching costs',
            isCorrect: true,
            level: 'strong',
            feedback: 'Three independent signals converge on the same cause: the timing (spike follows pricing change by 6 weeks — one billing cycle), the population (78% of churn is month-to-month, the exact segment affected), and the self-report (67% say price too high). Month-to-month customers are structurally more price-elastic than annual customers: they have already opted for flexibility over commitment, they renew every 30 days which creates a recurring price evaluation, and they typically have lower product investment (shorter tenure, lower ACV). A 25% increase is above most customers\' tolerance threshold for a productivity tool they were already paying a premium for (monthly pricing is typically 20-30% higher than annual to begin with).',
          },
          {
            id: 'b',
            label: 'A competitor launched a new product 6 weeks ago that is pulling price-sensitive customers away',
            isCorrect: false,
            level: 'partial',
            feedback: 'Competitive switching (29% of exit surveys) is a contributing factor but not the root cause. Competitors launching at the same time as the pricing change is possible, but the primary trigger is clearly the price increase — 67% say price vs. 29% citing an alternative. Competitors benefited from the pricing change by being the viable alternative once Threadline raised prices, but they did not initiate the churn spike.',
          },
          {
            id: 'c',
            label: 'Product value has declined for SMB accounts due to feature gaps that were not addressed in the past 6 months',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Feature gap issues produce gradual churn elevation over many months, not a single-month 2.3x spike. The no-product-changes known fact also directly contradicts this hypothesis. When you have a precisely timed pricing change, a billing-type-concentrated churn spike, and self-reported price complaints from 67% of surveyed churners, a feature gap hypothesis is the least parsimonious explanation available.',
          },
        ],
      },
      {
        id: 'validate',
        stepNumber: 5,
        label: 'Validation Approach',
        prompt: 'Your hypothesis is direct price elasticity: the 25% increase triggered churn among month-to-month price-sensitive accounts. How do you validate and quantify?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Calculate churn rate for month-to-month vs. annual accounts in 30-day windows before and after the pricing change, and model the revenue impact at different price increase scenarios',
            isCorrect: true,
            level: 'strong',
            feedback: 'This validation directly tests the price elasticity mechanism: if month-to-month churn rate jumped from its baseline after the pricing change while annual churn held flat, you have a clean before/after comparison that isolates the price effect. Modeling revenue impact at different price increase magnitudes (10%, 15%, 20%, 25%) gives leadership the data to evaluate whether a lower price increase would have retained more accounts with the same revenue uplift — the standard pricing elasticity trade-off analysis.',
          },
          {
            id: 'b',
            label: 'Conduct 1:1 win-back calls with churned accounts to understand if they would return at the original price',
            isCorrect: false,
            level: 'partial',
            feedback: 'Win-back calls can generate useful qualitative insight and potentially recover a small percentage of churned accounts, but they are a retention tactic rather than a validation method. Quantitative before/after churn rate comparison by billing type is faster, more scalable, and provides the evidence needed for a pricing decision. Conduct win-back calls after the analysis, not instead of it.',
          },
          {
            id: 'c',
            label: 'Run a new A/B test offering the old price to 50% of month-to-month customers to measure churn differential',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Testing two different prices simultaneously for the same product tier is legally and contractually complex and would require communications that telegraph the pricing change inconsistency to customers — potentially accelerating churn. More importantly, you already have the pre/post natural experiment: churn before the pricing change vs. after. Use the existing data rather than creating a new experiment that carries operational and reputational risk.',
          },
        ],
      },
    ],
    sqlStep: {
      prompt: 'You\'ve confirmed that the 25% month-to-month price increase directly triggered the churn spike, concentrated among short-to-mid tenure SMB accounts.\n\nWrite a SQL query that shows churn rate by billing_type × account_tenure_bucket in 30-day windows before and after the pricing change, so you can present the clean before/after price elasticity evidence.',
      hints: [
        'Define tenure buckets: 0-3 months, 4-9 months, 10-18 months, 18+ months at time of churn',
        'Pricing change date: 6 weeks ago — create a pre/post flag based on cancellation_date',
        'Churn rate = accounts_churned / accounts_active_at_start_of_window per bucket',
        'Include avg_acv per bucket to show the revenue composition of the churn',
      ],
      modelQuery: 'WITH account_windows AS (\n  -- Classify each account into its billing type and tenure bucket\n  -- as of the start of each 30-day window\n  SELECT\n    a.account_id,\n    a.billing_type,             -- \'monthly\' | \'annual\'\n    a.acv,\n\n    -- Tenure at the time of each window start\n    CASE\n      WHEN DATEDIFF(\'month\', a.created_at, w.window_start) <= 3   THEN \'0-3_months\'\n      WHEN DATEDIFF(\'month\', a.created_at, w.window_start) <= 9   THEN \'4-9_months\'\n      WHEN DATEDIFF(\'month\', a.created_at, w.window_start) <= 18  THEN \'10-18_months\'\n      ELSE \'18plus_months\'\n    END AS tenure_bucket,\n\n    w.window_start,\n    w.period_label,             -- \'pre_pricing_change\' | \'post_pricing_change\'\n\n    -- Was this account active at the start of the window?\n    CASE WHEN a.cancelled_at IS NULL OR a.cancelled_at > w.window_start THEN 1 ELSE 0 END AS active_at_window_start,\n\n    -- Did this account churn within this 30-day window?\n    CASE\n      WHEN a.cancelled_at >= w.window_start\n       AND a.cancelled_at  < w.window_start + INTERVAL \'30 days\' THEN 1 ELSE 0\n    END AS churned_in_window\n\n  FROM accounts a\n  CROSS JOIN (\n    -- Two 30-day windows: one pre and one post pricing change\n    SELECT DATE(\'2024-01-01\') AS window_start, \'pre_pricing_change\'  AS period_label\n    UNION ALL\n    SELECT DATE(\'2024-02-12\') AS window_start, \'post_pricing_change\' AS period_label\n    -- Pricing change implemented 6 weeks ago; post window starts at that point\n  ) w\n  WHERE a.created_at < w.window_start  -- Account must predate the window\n)\n\nSELECT\n  period_label,\n  billing_type,\n  tenure_bucket,\n\n  SUM(active_at_window_start)                                      AS accounts_at_risk,\n  SUM(churned_in_window)                                           AS churned_accounts,\n\n  ROUND(\n    100.0 * SUM(churned_in_window) / NULLIF(SUM(active_at_window_start), 0),\n    2\n  )                                                                AS churn_rate_pct,\n\n  ROUND(AVG(CASE WHEN churned_in_window = 1 THEN acv END), 0)     AS avg_churned_acv,\n  ROUND(SUM(CASE WHEN churned_in_window = 1 THEN acv ELSE 0 END), 0) AS total_arr_lost\n\nFROM account_windows\n\nGROUP BY 1, 2, 3\nORDER BY period_label DESC, billing_type, tenure_bucket;',
      annotation: 'CROSS JOIN to a two-row windows subquery is an efficient pattern for creating before/after comparisons without duplicating query logic. Each account appears once per window — once in the pre period and once in the post period.\n\nactive_at_window_start determines the denominator for churn rate: accounts that were still active when each window opened. This is the correct churn rate calculation — accounts that had already churned before the window should not inflate the denominator.\n\nchurned_in_window flags cancellations within the specific 30-day window, enabling the apples-to-apples comparison of churn rates in the same calendar-month-length window before and after the pricing change.\n\nExpected output: the post_pricing_change / monthly / 4-9_months row should show dramatically higher churn_rate_pct than its pre_pricing_change counterpart. Annual accounts should show minimal change in both windows, confirming the price elasticity is specific to month-to-month billing. The total_arr_lost column quantifies the revenue cost of the price increase by segment.',
    },
    seniorDiagnosis: {
      likelyCause: 'The 25% month-to-month price increase directly triggered churn among price-elastic, shorter-tenure SMB accounts who had low switching costs and were already paying a flexibility premium',
      reasoning: 'Month-to-month customers are structurally the most price-sensitive segment in any SaaS business: they have already demonstrated a preference for flexibility over commitment, they re-evaluate the price-to-value ratio every 30 days, and they have zero switching cost friction from an annual contract. A 25% increase on top of a pricing tier that was already 20-30% higher than annual (the standard month-to-month premium) pushed the total price to a level that exceeded the perceived value for mid-tenure, lower-ACV accounts that had not deeply integrated the product. The 6-week lag between the pricing change and the churn spike is the billing cycle effect: monthly accounts churned at their next renewal, not immediately. The 67% exit survey response citing price is unusually high for a SaaS exit survey — typically price is over-cited as a polite exit reason — but the alignment with the pricing change timing and the billing-type concentration confirms the causal mechanism. The 29% competitive response confirms that competitors were positioned as affordable alternatives once Threadline raised prices, amplifying the elasticity effect.',
      validationPlan: [
        'Calculate month-to-month vs. annual churn rate in the 30 days before and after the pricing change — confirm the spike is isolated to monthly accounts',
        'Build a price elasticity estimate: total churn-related revenue loss vs. total incremental revenue from the 25% increase on retained accounts — determine the net revenue impact of the pricing change',
        'Segment the retained month-to-month accounts by feature engagement depth to estimate how much deeper product integration protects against price elasticity',
        'Model 3 scenarios: full rollback to original pricing, partial increase (10-15%), and current pricing with win-back offers for churned accounts',
      ],
      recommendation: 'Evaluate a tiered price increase: instead of a flat 25% increase across all month-to-month accounts, apply a differentiated increase based on tenure and usage depth. Highly engaged, longer-tenure accounts can absorb a larger increase; shallow-engagement, short-tenure accounts are the price-sensitive churners. Consider a "convert to annual" offer to at-risk month-to-month accounts before the price change takes effect — trading one-time churn risk for lock-in. Present the net revenue analysis (incremental revenue from retained customers vs. lost ARR from churned accounts) to determine whether the 25% increase was net positive or negative.',
      commonMistakes: [
        'Attributing the churn spike to product quality or competitive pressure without testing the billing-type segmentation first',
        'Treating exit survey "found alternative" responses as the primary cause rather than recognizing that competitive switching was enabled by the price increase',
        'Proposing a full pricing rollback without first modeling whether the incremental revenue from retained accounts exceeds the churn-related ARR loss',
        'Not accounting for the 6-week billing-cycle lag between the pricing change and the churn spike, which can cause analysts to look for causes 6 weeks prior rather than at the change itself',
      ],
      interviewPhrase: 'When churn spikes in a single month, I immediately check whether a pricing change just hit a billing cycle — the 30-day renewal cadence creates a predictable lag between price changes and churn events that analysts often miss.',
    },
    leadershipNote: 'Staff analysts know that pricing changes create a predictable churn lag tied to billing cycle renewal dates — a 2x churn spike six weeks after a price increase is the billing cycle firing, not a sudden product failure. Juniors look for causes in the week of the spike; Staff analysts look six weeks back. The recommendation to leadership requires a price elasticity model: the question is not whether to roll back the price increase but whether the incremental revenue from retained accounts at the old price exceeds the ARR lost to churn at the new price.',
  },

  {
    id: 'RCA11',
    title: 'Ad Revenue Per DAU Dropped 22% in Three Weeks',
    subtitle: 'Spark · Social Feed · Ad Monetization',
    difficulty: 'senior',
    isFree: false,
    domain: 'growth',
    linkedConceptIds: ['funnel-decomposition', 'segmentation', 'data-quality-check'],
    context: {
      metricMovement: 'Ad revenue per DAU dropped from $0.18 to $0.14 (−22%) over 3 weeks',
      businessImpact: '~$175M annual revenue impact if sustained at current 12M DAU; fill rate collapse is the primary driver',
      timeWindow: 'Decline began 3 weeks ago, precisely when a new content safety filter was deployed',
      knownFacts: [
        'Fill rate (percentage of ad slots filled with a paying ad) dropped from 91% to 74%',
        'CPM on filled slots is actually up 4% — advertisers are paying more per filled impression',
        'A new content safety filter was deployed 3 weeks ago, flagging "brand safety risk" content and suppressing ads on flagged posts',
        'The filter is triggering on 19% of feed impressions, far above the expected 2-3%',
        'Categories most flagged: "creator challenges," "reaction content," and "trending sounds" — all high-engagement content types',
      ],
    },
    diagnosisSteps: [
      {
        id: 'system_check',
        stepNumber: 1,
        label: 'System / Data Check',
        prompt: 'Ad revenue per DAU dropped 22% over 3 weeks. What do you verify first?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Verify that ad revenue tracking and impression counting methodology have not changed — confirm the revenue per DAU metric is computed identically before and after the filter deployment',
            isCorrect: true,
            level: 'strong',
            feedback: 'Ad revenue per DAU is a composite metric: any change in how total ad revenue is counted (currency conversion, revenue recognition timing, partner revenue share adjustments) or how DAU is defined can move the metric without reflecting a real change in monetization efficiency. With a system deployment 3 weeks ago, checking that both the numerator (ad revenue) and denominator (DAU) are measured consistently eliminates measurement artifacts before the business diagnosis begins.',
          },
          {
            id: 'b',
            label: 'Immediately inspect the content safety filter logs to see which posts are being flagged',
            isCorrect: false,
            level: 'partial',
            feedback: 'Filter log inspection is the right second step and will quickly surface the over-triggering issue, but doing so before confirming measurement integrity could mean spending time on the filter while the actual cause is a revenue reporting change. The 19% triggering rate vs. 2-3% expected is a strong signal the filter is the cause, but validate measurement first.',
          },
          {
            id: 'c',
            label: 'Contact the major advertisers to see if they reduced their campaign budgets',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Advertiser budget reduction would show up as lower CPMs, not lower fill rates — advertisers compete on price for available inventory, and if they reduced budgets, you would see CPMs fall. The known facts show CPM is actually up 4%, which directly contradicts a demand-side explanation. The problem is supply-side: available inventory being removed from the auction, not advertiser demand declining.',
          },
        ],
      },
      {
        id: 'decompose',
        stepNumber: 2,
        label: 'Metric Decomposition',
        prompt: 'Tracking confirmed unchanged. Now decompose ad revenue per DAU into its component drivers. What decomposition reveals the mechanism?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Decompose ad revenue per DAU = (total impressions per DAU) × (fill rate) × (CPM per filled impression) — identify which component changed',
            isCorrect: true,
            level: 'strong',
            feedback: 'Ad revenue per DAU is driven by three levers: how many ad slots are shown per user (impression volume), what fraction of those slots are filled with paying ads (fill rate), and how much advertisers pay for each filled slot (CPM). You already know from the known facts that CPM is up 4% — so CPM is not the problem. Decomposing this formula will isolate fill rate as the broken component, pointing you directly at the content safety filter as the mechanism suppressing inventory.',
          },
          {
            id: 'b',
            label: 'Compare daily ad revenue trend line to DAU trend line to check if they diverged at the same time',
            isCorrect: false,
            level: 'partial',
            feedback: 'Trend line comparison confirms the timing of the divergence and is useful for establishing when the problem started, but it does not explain the mechanism. You already know the timing matches the filter deployment. The decomposition into impressions × fill rate × CPM moves faster from "what happened" to "why it happened."',
          },
          {
            id: 'c',
            label: 'Look at total ad spend from the top 10 advertisers to confirm demand is still present',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Demand analysis is the wrong direction when fill rate has dropped 17pp and CPM is up — rising CPM with falling fill rate is the exact signature of a supply constraint, not a demand collapse. Advertisers are bidding higher prices for the available inventory precisely because less inventory is available. Checking advertiser demand would confirm demand is healthy but would not identify the fill rate suppression mechanism.',
          },
        ],
      },
      {
        id: 'segment',
        stepNumber: 3,
        label: 'Segmentation',
        prompt: 'Decomposition confirms fill rate dropped from 91% to 74% — impression volume and CPM are stable. Which segmentation finds the root cause fastest?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Segment fill rate by content_safety_flag status (flagged vs. not flagged) and content category to confirm the filter is over-triggering on high-engagement content',
            isCorrect: true,
            level: 'strong',
            feedback: 'This segmentation directly tests the filter over-triggering hypothesis: if fill rate for flagged content is near 0% (no ads shown) and the filter is triggering on 19% of impressions, then approximately 19% of all ad slots are being suppressed. Crossing with content category will confirm that creator challenges, reaction content, and trending sounds — all high-engagement categories — are the over-flagged population. This segmentation produces the exact evidence needed to tell the trust and safety team that their filter thresholds are too aggressive.',
          },
          {
            id: 'b',
            label: 'Segment by ad format (video ads vs. static vs. interstitial) to check if a specific format is underperforming',
            isCorrect: false,
            level: 'partial',
            feedback: 'Ad format analysis could reveal if a specific format type is involved in the fill rate decline, but the content safety filter operates at the post level, not the ad format level — it suppresses all ad formats on flagged posts equally. Format segmentation would not surface the content safety mechanism and would add analysis time without identifying the cause.',
          },
          {
            id: 'c',
            label: 'Segment by user demographics (age, location) to check if the drop is concentrated in specific user groups',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Demographic segmentation makes sense when the hypothesis involves differential user behavior or advertiser targeting preferences, but the content safety filter applies to post-level content classification, not user demographics. A demographic segmentation would find a diffuse effect across all groups (since high-engagement content is consumed by all demographics) and would not surface the filter over-triggering mechanism.',
          },
        ],
      },
      {
        id: 'hypothesis',
        stepNumber: 4,
        label: 'Root Cause Hypothesis',
        prompt: 'Fill rate dropped 17pp, filter triggers on 19% of impressions (vs. 2-3% expected), flagged categories are highest-engagement content. Which hypothesis best explains the root cause?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Content safety filter is over-triggering: its threshold is too aggressive and is incorrectly flagging high-engagement content that is not actually brand-unsafe, removing high-CPM inventory from the ad auction',
            isCorrect: true,
            level: 'strong',
            feedback: 'The arithmetic is clear: if the filter was designed to flag 2-3% of impressions but is flagging 19%, it is over-triggering by roughly 7-8x. The categories being flagged — creator challenges, reaction content, trending sounds — are precisely the content that drives the highest engagement on short-form video platforms, and engaged users are exactly the premium inventory advertisers pay CPM premiums for. The filter is not just suppressing ads — it is suppressing the most valuable ads on the platform. The CPM increase on remaining filled slots confirms that the suppressed inventory was high-quality: advertisers are competing harder for the reduced premium inventory that remains.',
          },
          {
            id: 'b',
            label: 'Major advertisers have added brand safety requirements that prevent them from running on a wider range of content',
            isCorrect: false,
            level: 'partial',
            feedback: 'Advertiser-side brand safety restrictions could cause fill rate decline if advertisers expanded their exclusion lists. However, this would show up as a demand-side change (lower advertiser bid rates, more unsold inventory) and would likely not be as sudden or as precisely timed as a system deployment. The known facts explicitly state a new content safety filter was deployed 3 weeks ago — the more parsimonious explanation is that the platform\'s own filter, not advertiser requirements, is the primary driver.',
          },
          {
            id: 'c',
            label: 'Total content volume has declined, reducing the number of available ad slots per DAU',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Impression volume per DAU is stable, which directly contradicts a content volume decline. If total content decreased, you would see fewer impressions per user session, not a fill rate decline. Fill rate is the fraction of existing slots filled, and it dropped independently of impression volume — confirming that the supply of slots is unchanged but the fraction being monetized is shrinking due to the filter.',
          },
        ],
      },
      {
        id: 'validate',
        stepNumber: 5,
        label: 'Validation Approach',
        prompt: 'Your hypothesis is filter over-triggering on high-CPM inventory. How do you confirm and quantify the revenue impact?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Pull fill rate and CPM for flagged vs. unflagged content pre/post filter deployment, and calculate the annual revenue impact of the 17pp fill rate gap attributable to over-triggering',
            isCorrect: true,
            level: 'strong',
            feedback: 'This validation directly quantifies the filter\'s revenue cost: fill rate for flagged content will be near 0% (ads suppressed) while unflagged content fill rate will be at historical levels. The revenue impact calculation — (flagged impressions) × (expected fill rate) × (CPM) × (365 days) — gives you the dollar cost of the over-triggering that you can bring to the trust and safety team and leadership. This is also the analysis that will justify recalibrating the filter threshold.',
          },
          {
            id: 'b',
            label: 'Manually review a sample of flagged posts to assess whether they are genuinely brand-unsafe',
            isCorrect: false,
            level: 'partial',
            feedback: 'Manual review of flagged posts provides qualitative confirmation that the filter is misclassifying content, and it is worth doing as part of the trust and safety team\'s response. However, a 100-post manual sample is supplementary evidence, not the primary quantification. The revenue impact calculation using fill rate and CPM data is faster, scales to millions of impressions, and is the evidence format that will move a leadership decision.',
          },
          {
            id: 'c',
            label: 'Run an A/B test where 50% of users see ads on flagged content to measure the brand safety risk',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Running a controlled experiment that serves ads on potentially brand-unsafe content to measure risk is not the right validation approach — it exposes the platform to the very brand safety risk the filter was designed to prevent. The correct path is to recalibrate the filter threshold using the existing flagging data and a manual content review sample, not to serve ads on flagged content as a test. Safety controls should not be temporarily disabled to generate experiment data.',
          },
        ],
      },
    ],
    sqlStep: {
      prompt: 'You\'ve confirmed the content safety filter is over-triggering, suppressing ads on 19% of feed impressions — 7-8x the expected 2-3% rate — and disproportionately affecting high-engagement, high-CPM content categories.\n\nWrite a SQL query that shows fill rate and CPM by content_safety_flag status and content_category for the 3 weeks before and after filter deployment, so you can quantify the revenue suppression per category.',
      hints: [
        'Create a pre/post flag based on the filter deployment date (3 weeks ago)',
        'Fill rate = filled_impressions / total_impressions per content_category × flag_status bucket',
        'Include avg_cpm for filled impressions to confirm the CPM premium on high-engagement categories',
        'Calculate estimated_revenue_lost = suppressed_impressions × expected_fill_rate × avg_cpm',
      ],
      modelQuery: 'WITH impression_data AS (\n  -- Join feed impressions to content safety flag status and category\n  SELECT\n    i.impression_id,\n    i.post_id,\n    i.impression_date,\n    i.ad_filled,                      -- Boolean: was an ad served on this impression?\n    i.revenue_earned,                  -- Revenue from this impression (0 if not filled)\n    i.cpm_if_filled,                   -- CPM at which the ad was sold (null if not filled)\n\n    p.content_category,               -- \'creator_challenge\' | \'reaction\' | \'trending_sound\' | \'other\'\n    p.content_safety_flagged,         -- Boolean: flagged by new content safety filter\n\n    -- Pre/post filter deployment window\n    CASE\n      WHEN i.impression_date < \'2024-02-20\' THEN \'pre_filter\'   -- Filter deployed 3 weeks ago\n      ELSE \'post_filter\'\n    END AS deployment_window\n\n  FROM feed_impressions i\n  INNER JOIN posts p ON i.post_id = p.post_id\n  WHERE i.impression_date >= \'2024-01-27\'   -- 3 weeks pre-deployment for comparison\n    AND i.impression_date <= CURRENT_DATE\n)\n\nSELECT\n  deployment_window,\n  content_safety_flagged,\n  content_category,\n\n  COUNT(*)                                                       AS total_impressions,\n  SUM(ad_filled::int)                                            AS filled_impressions,\n\n  ROUND(\n    100.0 * SUM(ad_filled::int) / NULLIF(COUNT(*), 0), 1\n  )                                                              AS fill_rate_pct,\n\n  ROUND(AVG(CASE WHEN ad_filled THEN cpm_if_filled END), 2)     AS avg_cpm_filled,\n\n  ROUND(SUM(revenue_earned), 0)                                  AS total_revenue,\n\n  -- Estimated revenue suppressed by the filter (post-deployment, flagged content only)\n  -- Assumes pre-deployment fill rate as the expected fill rate\n  ROUND(\n    SUM(CASE WHEN deployment_window = \'post_filter\' AND content_safety_flagged THEN 1 ELSE 0 END)\n    * 0.91   -- Pre-filter fill rate baseline\n    * AVG(CASE WHEN ad_filled THEN cpm_if_filled END) / 1000.0,  -- CPM to per-impression revenue\n    0\n  )                                                              AS est_suppressed_revenue\n\nFROM impression_data\n\nGROUP BY 1, 2, 3\nORDER BY deployment_window DESC, content_safety_flagged DESC, content_category;',
      annotation: 'impression_data CTE joins feed impressions to post metadata to get the content_safety_flagged flag and content_category for each impression. The pre/post window is defined relative to the filter deployment date.\n\nfill_rate_pct is the core metric: the post_filter / flagged rows will show near-0% fill rate (ads suppressed on flagged content), while the pre_filter rows show 91% historical fill rate for all categories.\n\navg_cpm_filled for flagged categories will likely show that creator challenges, reaction content, and trending sounds had above-average CPMs pre-filter, confirming that the filter is suppressing the most valuable inventory on the platform.\n\nest_suppressed_revenue applies the pre-filter fill rate (0.91) to post-filter flagged impressions, then multiplies by avg CPM to estimate the dollar value being lost per category per day. Annualizing this figure gives the $175M impact estimate.\n\nExpected key finding: the post_filter / flagged / creator_challenge and post_filter / flagged / reaction rows will have fill_rate_pct near 0% with the highest avg_cpm_filled values — confirming the filter is removing the highest-value inventory from the auction.',
    },
    seniorDiagnosis: {
      likelyCause: 'Content safety filter is over-triggering at 7-8x the expected rate, incorrectly flagging high-engagement, high-CPM content and suppressing it from the ad auction — causing a 17pp fill rate decline',
      reasoning: 'The fill rate collapse from 91% to 74% is directly explained by the filter suppressing 19% of impressions when 2-3% was expected: 91% × (1 − 0.19) ≈ 74%, which matches the observed fill rate almost exactly. The CPM increase on remaining inventory confirms that the suppressed content was premium: advertisers are bidding harder for the reduced pool of available impressions, driving up prices on what remains. The categories being flagged — creator challenges, reaction content, trending sounds — are canonically the highest-engagement content types on short-form video platforms, and they are precisely what brand-safety filters most commonly misclassify because their language and audio patterns superficially resemble riskier content. The filter is likely using a keyword or audio-similarity model that conflates energy and excitement with unsafe content. The $175M annual revenue estimate understates the true cost because it does not account for the creator retention effect: if high-engagement creator content stops getting ad impressions, creators see lower earnings, which over time degrades the content supply.',
      validationPlan: [
        'Pull fill rate and CPM by content_safety_flagged × content_category for 3 weeks pre and post deployment — confirm that flagged categories have near-0% fill rate post-deployment and above-average CPMs pre-deployment',
        'Calculate the dollar cost of over-triggering: (post-filter flagged impressions) × (pre-filter fill rate) × (avg CPM) × 365 = annual revenue suppressed',
        'Manual QA sample: have a human reviewer assess 200 randomly sampled flagged posts in the top 3 over-flagged categories — measure what fraction are genuinely brand-unsafe',
        'Review the filter model\'s classification criteria with the trust and safety team to identify why high-engagement content patterns are triggering brand-safety flags',
      ],
      recommendation: 'Work with the trust and safety team to recalibrate the filter threshold — raise the confidence threshold required to suppress an impression, reducing false positives. Implement a tiered suppression approach: high-confidence flags suppress ads, medium-confidence flags exclude specific advertiser categories (rather than all ads), and low-confidence flags are reviewed manually. Set a filter performance KPI of less than 3% impression suppression rate and fill rate above 88%, with weekly monitoring. Also implement a fast-path review queue for content in the top-performing categories (creator challenges, trending sounds) to prevent false positive suppression on the most valuable inventory.',
      commonMistakes: [
        'Diagnosing the fill rate decline as a demand-side problem when CPM is increasing — rising CPM with falling fill rate is a supply constraint, not a demand collapse',
        'Not connecting the filter deployment timing to the fill rate decline because the trust and safety team operates independently of ad monetization',
        'Treating the revenue impact as purely an ad ops problem without recognizing the creator ecosystem consequence of reduced earnings on high-engagement content',
        'Proposing to disable the filter entirely rather than recalibrating the threshold — brand safety is a real requirement and the solution is precision, not removal',
      ],
      interviewPhrase: 'When fill rate drops and CPM rises simultaneously, I know supply is being removed from the auction — I look for any recent content classification, filtering, or policy change that could be suppressing inventory before I look at advertiser demand.',
    },
    leadershipNote: 'Staff analysts read CPM up with revenue down as a supply constraint signature — advertisers are bidding harder on less available inventory, which is the opposite of demand softening. The cross-functional implication is the key move: a trust-and-safety filter deployment that happened without ad monetization sign-off is a governance gap, not just a bug. The forward recommendation is a cross-functional impact review requirement for any content policy change that touches monetizable inventory.',
  },

  {
    id: 'RCA12',
    title: 'New Creator 7-Day Retention Dropped 30% Over Six Weeks',
    subtitle: 'Prism · Short-Form Video · Creator Supply',
    difficulty: 'senior',
    isFree: false,
    domain: 'growth',
    linkedConceptIds: ['segmentation', 'funnel-decomposition', 'proxy-metric'],
    context: {
      metricMovement: 'New creator 7-day retention (posting at least once in week 2 after joining) dropped from 38% to 27% over 6 weeks',
      businessImpact: 'Creator supply is the core content constraint — a 30% retention drop will compress the content catalog and lag into DAU decline in 4-8 weeks',
      timeWindow: 'Decline began 7 weeks ago, one week after a ranking algorithm update',
      knownFacts: [
        'A ranking algorithm update 7 weeks ago shifted primary ranking signal from "likes + shares" to "completion rate"',
        'New creator median completion rate in week 1 is 34% vs. established creator median of 67%',
        'New creator impression volume in week 1 fell 41% after the algorithm change (algorithm down-ranks low-completion content)',
        'Creator survey (n=200 churned new creators): "my videos got no views" cited by 71%',
        'Established creator retention is unchanged at 84%',
      ],
    },
    diagnosisSteps: [
      {
        id: 'system_check',
        stepNumber: 1,
        label: 'System / Data Check',
        prompt: 'New creator 7-day retention dropped from 38% to 27% over 6 weeks. What do you verify first?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Verify the creator retention definition has not changed — confirm week 2 posting is being measured consistently and the creator onboarding cohort definition is unchanged',
            isCorrect: true,
            level: 'strong',
            feedback: 'Creator retention metrics are sensitive to definitional changes: if the cohort window changed (e.g., from "any post in week 2" to "at least 2 posts in week 2"), or if the creator onboarding definition changed (e.g., stricter criteria for who counts as a "new creator"), the metric could move without reflecting a real behavioral change. Confirming the retention definition is unchanged eliminates this before you build a business case around a measurement artifact.',
          },
          {
            id: 'b',
            label: 'Check whether new creator acquisition volume dropped (fewer new creators joining, affecting the base rate)',
            isCorrect: false,
            level: 'partial',
            feedback: 'Creator acquisition volume affects the absolute count of retained creators but not the retention rate itself, since retention is defined as a percentage of a cohort. However, if the definition of "new creator" changed in a way that captured a more casual or less committed cohort, the rate could be affected. Acquisition volume check is a reasonable secondary verification after confirming the retention definition.',
          },
          {
            id: 'c',
            label: 'Accept the drop as real since the algorithm change timing is obvious and immediately recommend reverting it',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Recommending an algorithm revert before validating the measurement or understanding the full causal chain is premature. Algorithm changes often have complex trade-offs — established creator engagement may have improved with the completion rate signal. You need to confirm the measurement is valid and understand the full impact before recommending a revert that could degrade other platform metrics.',
          },
        ],
      },
      {
        id: 'decompose',
        stepNumber: 2,
        label: 'Metric Decomposition',
        prompt: 'Retention definition confirmed unchanged. How do you decompose the retention drop to isolate the mechanism?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Decompose creator retention by cohort type (new vs. established) and week-1 impression volume bucket to identify the distribution mechanism',
            isCorrect: true,
            level: 'strong',
            feedback: 'The known facts already show established creator retention is unchanged at 84% — so the retention collapse is exclusively in new creators. Decomposing by week-1 impression volume bucket tests the causal chain: if new creators who received high week-1 impressions retained at rates similar to established creators, but new creators who received low impressions churned at high rates, then distribution (not content quality) is the mechanism. This decomposition translates the algorithm hypothesis into a directly testable behavioral prediction.',
          },
          {
            id: 'b',
            label: 'Compare new creator posting frequency in week 1 vs. week 2 to see if the drop is about effort rather than impressions',
            isCorrect: false,
            level: 'partial',
            feedback: 'Posting frequency analysis could reveal if creators are reducing effort before quitting, but effort is a symptom of low impressions, not an independent cause. Creators who post in week 1 but see no views post less in week 2 and then not at all in week 3. Decomposing by impression volume gets to the upstream cause faster than looking at week-2 posting behavior.',
          },
          {
            id: 'c',
            label: 'Look at overall content volume on the platform to check if total supply is growing or declining',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Total content volume is a downstream consequence of creator retention, not a diagnostic input for understanding why creator retention dropped. If new creator retention is falling, total content supply will lag behind. Measuring content volume does not explain the mechanism behind the retention change.',
          },
        ],
      },
      {
        id: 'segment',
        stepNumber: 3,
        label: 'Segmentation',
        prompt: 'New creator impression volume fell 41% post-algorithm change. Which segmentation confirms this is the causal mechanism for retention failure?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Segment new creator W2 posting rate by W1 impression volume quintile (lowest 20% impressions to highest 20%) and by pre/post algorithm cohort',
            isCorrect: true,
            level: 'strong',
            feedback: 'Segmenting retention by impression volume quintile produces a direct dose-response relationship: if W2 posting rate increases monotonically with W1 impression volume — lowest impressions = lowest retention, highest impressions = highest retention — you have confirmed that distribution is the causal mechanism for creator retention. Crossing with pre/post algorithm cohorts confirms that the relationship became stronger after the algorithm change, proving the algorithm shifted the impression distribution in a way that suppressed new creator retention specifically.',
          },
          {
            id: 'b',
            label: 'Segment by video content quality proxy (video length, production effort indicators) to see if new creators are posting lower-quality content',
            isCorrect: false,
            level: 'partial',
            feedback: 'Content quality analysis is worth exploring as a secondary check, but the 71% survey response citing "my videos got no views" is a distribution signal, not a quality signal. If quality were the primary issue, creators would get some views but low engagement — but they are reporting near-zero views, which is a distribution problem. The algorithm change that penalizes low-completion content (which new creators structurally have) is the more proximate mechanism.',
          },
          {
            id: 'c',
            label: 'Segment by creator demographics (age, location, device type) to identify if certain creator groups are disproportionately affected',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Demographic segmentation could reveal differential access patterns but does not address the algorithmic cold-start problem. The completion rate disadvantage for new creators is structural — any new creator\'s first videos will have lower completion rates than established creators regardless of demographics. Demographic analysis would add noise without identifying the algorithm-driven mechanism.',
          },
        ],
      },
      {
        id: 'hypothesis',
        stepNumber: 4,
        label: 'Root Cause Hypothesis',
        prompt: 'New creators have 34% median completion rates vs. 67% for established creators, and 41% fewer impressions in week 1 after the algorithm change. Which hypothesis best explains the retention drop?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Algorithm-induced cold-start failure: by ranking on completion rate, the algorithm systematically disadvantages new creators whose early content has lower completion rates, reducing their week-1 impressions and eliminating the feedback loop needed to grow and improve',
            isCorrect: true,
            level: 'strong',
            feedback: 'This hypothesis explains the full pattern: the algorithm change created a self-reinforcing disadvantage for new creators. New creators\' first videos naturally have lower completion rates (less refined content, smaller initial following, no algorithmic trust signals) — the algorithm down-ranks low-completion content — fewer impressions result — the creator sees no views and infers their content is bad — they quit before completing the learning curve. Established creators are immune because their historical completion rates are high and their algorithmic trust is already earned. The 71% "no views" survey response and the 41% impression volume decline are convergent confirmations of the distribution failure, not the content quality failure.',
          },
          {
            id: 'b',
            label: 'New creator content quality declined because the platform attracted less talented creators in recent cohorts',
            isCorrect: false,
            level: 'partial',
            feedback: 'Content quality shifts develop gradually over many months and would not produce a 6-week retention collapse. More importantly, the algorithm change provides a precise timing explanation that is far more parsimonious — the retention drop began one week after the algorithm launched. If creator quality had declined, you would expect impression volume to hold steady while engagement metrics fell. Instead, impressions fell 41%, which is a distribution change, not a quality change.',
          },
          {
            id: 'c',
            label: 'New creators are being outcompeted for attention by established creators who benefited from the algorithm change',
            isCorrect: false,
            level: 'wrong',
            feedback: 'This hypothesis is partially true mechanically — established creators with high completion rates did receive relatively more distribution after the algorithm change — but framing it as competition obscures the structural problem. The issue is not that established creators are winning; it is that the algorithm has no mechanism for bootstrapping new creators through their low-completion-rate phase. Fixing the "competition" framing would lead to incorrectly targeting established creators, when the right fix is a new-creator distribution carve-out or a separate ranking model for first-week content.',
          },
        ],
      },
      {
        id: 'validate',
        stepNumber: 5,
        label: 'Validation Approach',
        prompt: 'Your hypothesis is algorithm-induced cold-start failure suppressing new creator impressions and breaking the retention loop. How do you validate this?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Run a cohort analysis comparing W1 impression volume and W2 posting rate for new creator cohorts from 4 weeks pre-algorithm change vs. 4 weeks post, segmented by impression volume quintile',
            isCorrect: true,
            level: 'strong',
            feedback: 'This pre/post cohort analysis creates a natural quasi-experiment: new creator cohorts from before the algorithm change experienced the old distribution model, and post-change cohorts experienced the new one. If W1 impression volume shifted downward for post-change cohorts and W2 posting rate declined in the same direction, you have strong evidence that the algorithm change is the cause. Segmenting by impression quintile confirms the dose-response relationship — lowest-impression creators have lowest W2 retention — and gives engineering a specific threshold to target for a new-creator boost policy.',
          },
          {
            id: 'b',
            label: 'Survey new creators who are still posting in week 2 to understand what kept them engaged',
            isCorrect: false,
            level: 'partial',
            feedback: 'Surveying retained new creators provides useful qualitative insights about what worked for them, and you might find that the few retained new creators had unusually high week-1 completion rates or viral content. However, this is supplementary evidence — the cohort retention analysis using behavioral data is faster and more statistically robust than a survey of a self-selected retained population.',
          },
          {
            id: 'c',
            label: 'Revert the algorithm change immediately and observe whether new creator retention recovers within two weeks',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Reverting the algorithm without validating the hypothesis first risks disrupting established creator performance for an uncertain return. The algorithm change likely improved engagement quality for established content — reverting it could worsen platform-wide completion rates and DAU. Validate the mechanism using the available historical data first, then propose a targeted fix (new-creator boost) rather than a full revert that trades one problem for another.',
          },
        ],
      },
    ],
    sqlStep: {
      prompt: 'You\'ve confirmed the algorithm cold-start hypothesis: the completion-rate ranking signal systematically suppresses new creator week-1 impressions, breaking the feedback loop needed for new creators to learn and stay.\n\nWrite a SQL query that compares new creator week-1 impression volume and week-2 posting rate by cohort (pre vs. post algorithm change), split by creator account age bucket, to confirm the dose-response relationship between impressions and retention.',
      hints: [
        'Define new creator as a creator whose first post was within 7 days of the analysis window start',
        'Week-1 impressions = total impressions on the creator\'s posts in days 1-7 after first post',
        'Week-2 posting = did the creator post at least once in days 8-14 after first post (retention flag)',
        'Bucket creators by W1 impression volume quintile to show the dose-response relationship',
      ],
      modelQuery: 'WITH new_creator_cohorts AS (\n  -- Identify new creators by first_post_date and classify by algorithm era\n  SELECT\n    c.creator_id,\n    c.first_post_date,\n\n    CASE\n      WHEN c.first_post_date < \'2024-01-22\' THEN \'pre_algorithm\'   -- Algorithm launched 7 weeks ago\n      ELSE \'post_algorithm\'\n    END AS algorithm_cohort\n\n  FROM creators c\n  WHERE c.first_post_date >= \'2024-01-01\'   -- Covers pre and post algorithm window\n    AND c.first_post_date <= CURRENT_DATE - INTERVAL \'14 days\'  -- Need 14 days to measure W2\n),\n\nweek1_impressions AS (\n  -- Total impressions on creator\'s content in days 1-7 after first post\n  SELECT\n    ncc.creator_id,\n    ncc.algorithm_cohort,\n    ncc.first_post_date,\n    COALESCE(SUM(i.impression_count), 0)  AS w1_total_impressions\n\n  FROM new_creator_cohorts ncc\n  LEFT JOIN post_impressions i\n    ON i.creator_id = ncc.creator_id\n    AND i.impression_date BETWEEN ncc.first_post_date\n                               AND ncc.first_post_date + INTERVAL \'6 days\'\n  GROUP BY 1, 2, 3\n),\n\nweek2_retention AS (\n  -- Flag: did creator post at least once in days 8-14 after first post?\n  SELECT\n    ncc.creator_id,\n    MAX(CASE\n      WHEN p.post_date BETWEEN ncc.first_post_date + INTERVAL \'7 days\'\n                           AND ncc.first_post_date + INTERVAL \'13 days\' THEN 1 ELSE 0\n    END) AS posted_in_week2\n\n  FROM new_creator_cohorts ncc\n  LEFT JOIN posts p ON p.creator_id = ncc.creator_id\n  GROUP BY 1\n),\n\nimpression_quintiles AS (\n  -- Assign W1 impression quintile within each algorithm cohort\n  SELECT\n    wi.creator_id,\n    wi.algorithm_cohort,\n    wi.w1_total_impressions,\n    NTILE(5) OVER (\n      PARTITION BY wi.algorithm_cohort\n      ORDER BY wi.w1_total_impressions\n    ) AS impression_quintile   -- 1 = lowest impressions, 5 = highest\n\n  FROM week1_impressions wi\n)\n\nSELECT\n  iq.algorithm_cohort,\n  iq.impression_quintile,\n\n  COUNT(*)                                        AS creator_count,\n  ROUND(AVG(iq.w1_total_impressions), 0)          AS avg_w1_impressions,\n\n  SUM(wr.posted_in_week2)                         AS w2_retained_creators,\n  ROUND(\n    100.0 * SUM(wr.posted_in_week2) / NULLIF(COUNT(*), 0), 1\n  )                                               AS w2_retention_rate_pct\n\nFROM impression_quintiles iq\nINNER JOIN week2_retention wr ON iq.creator_id = wr.creator_id\n\nGROUP BY 1, 2\nORDER BY algorithm_cohort, impression_quintile;',
      annotation: 'new_creator_cohorts CTE identifies creators by first_post_date and applies the pre/post algorithm label. The 14-day lookback ensures all creators in the analysis have had time to either post or not post in week 2.\n\nweek1_impressions uses a date range join (LEFT JOIN to avoid dropping creators who received zero impressions) to count impressions in days 1-7. COALESCE ensures creators who received zero impressions appear with 0 rather than NULL.\n\nNTILE(5) in impression_quintiles partitions creators within each algorithm cohort into 5 equal groups by impression volume. Partitioning by cohort ensures pre and post quintiles are comparable within each era rather than mixing impression distributions across algorithm regimes.\n\nExpected output: for post_algorithm cohorts, quintile 1 (fewest impressions) should show dramatically lower w2_retention_rate_pct than quintile 5 (most impressions), confirming the dose-response relationship. Comparing the same quintile pattern for pre_algorithm cohorts vs. post_algorithm cohorts will show that the bottom quintile got much worse after the algorithm change — confirming that the algorithm compressed new creator impression distribution downward.',
    },
    seniorDiagnosis: {
      likelyCause: 'Algorithm cold-start failure: the completion-rate ranking signal structurally disadvantages new creators whose early content is down-ranked, suppressing week-1 impressions and eliminating the feedback loop that motivates continued posting',
      reasoning: 'The completion-rate ranking signal is a high-quality engagement metric for optimizing established content, but it creates a cold-start trap for new creators. New creators\' first videos have structurally lower completion rates — they have not learned the format, have no audience trust, and receive fewer algorithmic distribution boosts that increase completion from engaged followers. The algorithm down-ranks their content, reducing impressions by 41%, and creators who see near-zero views have no signal to improve and no motivation to continue. The 34% vs. 67% median completion rate gap between new and established creators is not a content quality gap — it is a bootstrapping gap that the algorithm has no mechanism to bridge. The 71% survey response citing "no views" confirms that creators are experiencing the distribution failure, not a quality mismatch with their audience. Established creator retention at 84% (unchanged) confirms the algorithm is working well for the majority of the creator base — the problem is narrowly specific to the cold-start phase and requires a targeted fix, not an algorithm revert.',
      validationPlan: [
        'Run pre/post cohort retention analysis for new creators: compare W1 impression volume and W2 posting rate for cohorts from 4 weeks before vs. 4 weeks after the algorithm change',
        'Plot a dose-response curve: W2 retention rate by W1 impression quintile within post-algorithm cohorts — confirm that retention increases monotonically with impressions',
        'Identify the minimum W1 impression threshold for acceptable W2 retention (e.g., creators with 500+ W1 impressions retain at 45%+ vs. 15% for sub-100 impression creators)',
        'Estimate the forward DAU impact: model content supply decline from the 11pp creator retention drop and estimate the lag time before it suppresses consumer DAU',
      ],
      recommendation: 'Implement a new-creator distribution boost: for creators in their first 14 days, temporarily override the completion-rate ranking signal with a diversified distribution policy that gives their content a minimum guaranteed impression floor (e.g., 500-1,000 impressions per post). After day 14, gradually transition to the standard completion-rate ranking as the creator accumulates a performance history. This is the standard cold-start solution used by content platforms. Monitor new creator W2 retention as the primary success metric for the boost policy, with a 35%+ target.',
      commonMistakes: [
        'Recommending a full algorithm revert without recognizing that the completion-rate signal is working for established creators and reverting it would degrade platform-wide content quality',
        'Interpreting the new-creator completion rate gap (34% vs. 67%) as a content quality problem rather than a bootstrapping problem — new creators structurally cannot achieve established-creator completion rates in week 1',
        'Not quantifying the lagged DAU impact of creator supply compression — creator retention problems take 4-8 weeks to manifest in consumer DAU, by which time the damage is harder to reverse',
        'Treating the 71% survey response as self-report bias rather than as corroborating evidence for the impression volume data',
      ],
      interviewPhrase: 'Ranking algorithms optimized for engagement quality create cold-start traps for new supply — any new creator, seller, or contributor starts with structurally worse signals than incumbents, so my first question when new-side retention drops is always whether a ranking change just made the gap bigger.',
    },
    leadershipNote: 'Staff analysts distinguish between an algorithm that is broken and an algorithm that is working correctly but penalizing a cold-start population. New creators structurally cannot match established-creator completion rates in week one — a ranking change that rewards completion creates a bootstrapping trap for new supply. The business-critical forward implication is a lagged DAU consequence: creator supply compression takes four to eight weeks to manifest in consumer DAU, so the damage is already compounding by the time it becomes visible in top-line metrics.',
  },

  // ─────────────────────────────────────────────
  // RCA13 — Push Notification CTR Collapsed
  // ─────────────────────────────────────────────
  {
    id: 'RCA13',
    title: 'Push Notification CTR Dropped 40% in One Week',
    subtitle: 'Orion · Consumer Mobile · Re-engagement',
    difficulty: 'analyst',
    isFree: false,
    domain: 'engagement',
    linkedConceptIds: ['segmentation', 'data-quality-check', 'funnel-decomposition'],
    context: {
      metricMovement: 'Push notification CTR dropped from 8.2% to 4.9% (-3.3pp) over 7 days',
      businessImpact: 'Re-engagement is a primary D30 retention driver; CTR decline puts 15% of weekly re-engaged users at risk',
      timeWindow: 'Gradual decline over 7 days, not overnight',
      knownFacts: [
        'No changes to notification content or send logic in the past 30 days',
        'Send volume is up 12% (more notifications being sent)',
        'The iOS permission prompt was updated 10 days ago to a new consent flow',
        'Android CTR is flat; iOS CTR dropped 55%',
        'New user cohorts (registered last 14 days) have 40% lower notification opt-in rate than historical baseline'
      ]
    },
    diagnosisSteps: [
      {
        id: 'platform_split',
        stepNumber: 1,
        label: 'Platform Segmentation',
        prompt: 'CTR dropped platform-wide but the clues point to a platform-specific cause. What is your first move?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Segment CTR by platform (iOS vs. Android) to confirm whether the drop is concentrated on one platform',
            isCorrect: true,
            level: 'strong',
            feedback: 'The known facts already contain the answer: Android is flat and iOS dropped 55%. Confirming this segmentation first is the right move because it immediately narrows the investigation to iOS-specific causes — eliminating content quality, send logic, and server-side issues as candidates. A platform-specific drop in the same week as an iOS permission flow change has an obvious candidate cause.'
          },
          {
            id: 'b',
            label: 'Investigate notification content quality — perhaps personalization degraded',
            isCorrect: false,
            level: 'wrong',
            feedback: 'If content quality degraded, you would expect both platforms to show declines. Android is flat. This means the cause is iOS-specific. Investigating content at this stage wastes diagnostic time and points away from the real cause.'
          },
          {
            id: 'c',
            label: 'Check send volume and send timing — maybe over-sending is suppressing CTR',
            isCorrect: false,
            level: 'partial',
            feedback: 'Send volume did increase 12%, which could dilute CTR on its own. But it increased for all users, so Android should also show a CTR impact. Android is flat. The platform asymmetry rules out send volume as the primary driver.'
          }
        ]
      },
      {
        id: 'permission_diagnosis',
        stepNumber: 2,
        label: 'Root Cause Identification',
        prompt: 'iOS CTR dropped 55% the same week the iOS permission prompt was updated. What is the most likely root cause, and how do you confirm it?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'The new permission flow lowered opt-in rate — new users are not granting push permission, so the notification-eligible user pool is shrinking while the denominator keeps growing',
            isCorrect: true,
            level: 'strong',
            feedback: 'Correct. The known fact confirms this: new user opt-in rate dropped 40% after the permission flow change. When opt-in rate falls, new users are still counted in the active user denominator for CTR but generate zero clicks (they never receive notifications). This inflates the denominator without a corresponding numerator, collapsing CTR. Confirm by computing CTR separately for users who were opted-in before the permission change vs. after.'
          },
          {
            id: 'b',
            label: 'iOS pushed a background app refresh policy change that is suppressing notification delivery',
            isCorrect: false,
            level: 'partial',
            feedback: 'Plausible but the permission flow change correlating with a 40% opt-in rate drop is the more direct explanation. An OS-level delivery change would affect all opted-in users uniformly, not new user opt-in rates specifically.'
          },
          {
            id: 'c',
            label: 'Notification content became irrelevant to iOS users due to a personalization model change',
            isCorrect: false,
            level: 'wrong',
            feedback: 'No content changes occurred in the past 30 days. A content issue affecting iOS but not Android with no code change is implausible.'
          }
        ]
      },
      {
        id: 'fix',
        stepNumber: 3,
        label: 'Remediation Path',
        prompt: 'The root cause is confirmed: the new iOS permission flow lowers opt-in rate. What is the right fix?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Redesign the permission flow to show value before the OS prompt — pre-prime users with a custom in-app screen explaining notification benefits',
            isCorrect: true,
            level: 'strong',
            feedback: 'The optimal iOS permission strategy is two-step: custom in-app pre-prime → OS permission prompt. Users who see value before being asked opt in at significantly higher rates. This addresses root cause, not symptom.'
          },
          {
            id: 'b',
            label: 'Revert the permission flow to the old version immediately',
            isCorrect: false,
            level: 'partial',
            feedback: 'Reverting stops the bleeding but doesn\'t improve the old flow. Design an improved version and A/B test it. Revert may be appropriate as a temporary measure.'
          },
          {
            id: 'c',
            label: 'Increase notification send frequency to compensate for the lower opt-in pool',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Over-sending to the remaining opted-in base accelerates opt-out, shrinking the pool further. Never compensate for consent attrition with volume.'
          }
        ]
      }
    ],
    debrief: {
      rootCause: 'New iOS permission consent flow lowered opt-in rate 40% for new users. Active user denominator kept growing with new users who had not opted in, while numerator (clicks) stagnated — collapsing the rate.',
      lessonsLearned: [
        'Platform-specific drops always point to platform-specific causes — segment first',
        'Permission flow changes should always include pre/post opt-in rate measurement as primary success metric',
        'CTR denominator definition matters — including non-opted-in users makes CTR a mixed metric',
        'Two-step iOS permission flows consistently outperform direct OS prompts in opt-in rate'
      ],
      interviewPhrase: '"Segment by platform first. Android flat, iOS down 55% the same week we changed the permission flow — I\'d check new-user opt-in rate before and after the flow change, then compute CTR separately for pre- and post-change cohorts." **Weak answer pattern:** The candidate says "send more push notifications to compensate for the lower CTR" — treating the denominator problem (non-opted-in users inflating it) as a content quality problem, which means they\'ve identified neither the cause nor the mechanism. **Interviewer follow-up that exposes it:** "Android CTR is flat, iOS CTR is down 55% — if the notification content and send frequency are identical on both platforms, what does that isolation tell you about where to look?"'
    }
  },

  // ─────────────────────────────────────────────
  // RCA14 — API Error Rate Spike Post-Deploy
  // ─────────────────────────────────────────────
  {
    id: 'RCA14',
    title: 'API Error Rate Tripled After a Routine Deploy',
    subtitle: 'Nexus · B2B SaaS · API Reliability',
    difficulty: 'analyst',
    isFree: false,
    domain: 'platform',
    linkedConceptIds: ['data-quality-check', 'funnel-decomposition', 'segmentation'],
    context: {
      metricMovement: 'API error rate (5xx) jumped from 0.3% to 0.9% immediately after deploy at 14:00',
      businessImpact: '3 enterprise customers have opened P1 support tickets',
      timeWindow: 'Error rate jump at 14:00, sustained 90 minutes',
      knownFacts: [
        'Deploy at 14:00 was a backend refactor — no new features, no schema changes',
        'Error rate concentrated in /integrations/webhook endpoint (4.8% error rate vs. 0.1% on others)',
        'Deploy included connection pool configuration change for the integrations database',
        'Error logs show "connection pool exhausted" for the webhook endpoint',
        'Traffic volume on webhook endpoint is normal — no traffic spike'
      ]
    },
    diagnosisSteps: [
      {
        id: 'endpoint_isolation',
        stepNumber: 1,
        label: 'Error Isolation',
        prompt: 'Error rate jumped but is concentrated in one endpoint. What is your first diagnostic move?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Inspect error logs for /integrations/webhook and cross-reference with the deploy changelog',
            isCorrect: true,
            level: 'strong',
            feedback: 'Endpoint-specific concentration + deploy timing + connection pool config change + "connection pool exhausted" in logs = direct diagnosis. You already have all the information needed. Connect the facts.'
          },
          {
            id: 'b',
            label: 'Check for a traffic spike on the webhook endpoint',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Traffic volume is explicitly noted as normal. A capacity problem from traffic would require increased traffic.'
          },
          {
            id: 'c',
            label: 'Roll back the deploy immediately before investigating',
            isCorrect: false,
            level: 'partial',
            feedback: 'Rollback is a valid emergency response, but diagnosing first means you can make a targeted config fix rather than a full rollback — faster and safer. If P1 tickets remain unresolved after 15 minutes of diagnosis, rollback while continuing to diagnose.'
          }
        ]
      },
      {
        id: 'root_cause',
        stepNumber: 2,
        label: 'Root Cause Confirmation',
        prompt: 'Logs confirm "connection pool exhausted" on webhook endpoint. Deploy changed pool config. What is the precise root cause?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Pool size was reduced in the refactor, leaving insufficient connections for the webhook endpoint\'s burst concurrency pattern',
            isCorrect: true,
            level: 'strong',
            feedback: '"Connection pool exhausted" with no traffic increase after a pool config change = pool size reduced below the concurrency requirement. Webhook endpoints have burst concurrency (many integrations firing simultaneously) that requires larger pool headroom than average endpoints.'
          },
          {
            id: 'b',
            label: 'A memory leak prevents connections from being released back to the pool',
            isCorrect: false,
            level: 'partial',
            feedback: 'Memory leaks cause gradual exhaustion over hours, not an immediate post-deploy jump. The immediate timing points to configuration, not a new code bug.'
          },
          {
            id: 'c',
            label: 'The database is under heavy load from the deploy, causing slow queries that hold connections',
            isCorrect: false,
            level: 'partial',
            feedback: 'Slow queries can contribute but the deploy had no query changes. The pool size reduction is the more direct causal link.'
          }
        ]
      },
      {
        id: 'remediation',
        stepNumber: 3,
        label: 'Fix and Prevention',
        prompt: 'Pool size reduced from 50 to 20 in the refactor. What is the right fix and prevention?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Immediate: restore pool size via config change (no full rollback needed). Prevention: add connection pool saturation as a deployment canary metric',
            isCorrect: true,
            level: 'strong',
            feedback: 'Config-only change restores pool size faster than a full code rollback. Pool saturation as a canary would have caught this within minutes of deploy, not 90 minutes later.'
          },
          {
            id: 'b',
            label: 'Roll back the full deploy. Prevention: require manual testing of connection pool behavior before every deploy',
            isCorrect: false,
            level: 'partial',
            feedback: 'Full rollback is slower than a targeted config fix. Manual testing is expensive and doesn\'t catch production-specific load patterns as reliably as automated canary monitoring.'
          },
          {
            id: 'c',
            label: 'Scale up webhook endpoint capacity. Prevention: document connection pool requirements',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Scaling treats the symptom. Documentation is a weak prevention measure compared to automated monitoring.'
          }
        ]
      }
    ],
    debrief: {
      rootCause: 'Backend refactor reduced connection pool size from 50 to 20. Webhook endpoint burst concurrency exhausted the reduced pool, causing 5xx errors for requests that could not acquire a connection within timeout.',
      lessonsLearned: [
        '"Routine refactors" with config changes are not risk-free',
        'Connection pool saturation should be a standard deployment canary metric',
        'Config-only hotfixes are faster and safer than full rollbacks — preserve this as an incident response tool'
      ],
      interviewPhrase: '"Pool exhaustion errors after a pool config change in a refactor — that\'s a near-certain cause. Immediate fix is a config rollback of just the pool size, not a full code rollback. Prevention is automated pool saturation monitoring as a deployment canary." **Weak answer pattern:** The candidate recommends "a full code rollback of the deploy" without first checking whether only the /integrations/webhook endpoint is affected and whether a config-only fix is available — treating all deploys as monolithic when the error is scoped to a single endpoint that changed one config value. **Interviewer follow-up that exposes it:** "The error is concentrated in /integrations/webhook specifically — before doing a full rollback, what would you check to see if there\'s a faster, lower-risk fix available?"'
    }
  },

  // ─────────────────────────────────────────────
  // RCA15 — Revenue Declining Despite Growing Signups
  // ─────────────────────────────────────────────
  {
    id: 'RCA15',
    title: 'Revenue Declining Even Though Signups Are at an All-Time High',
    subtitle: 'Threadline · B2B SaaS · Revenue Paradox',
    difficulty: 'senior',
    isFree: false,
    domain: 'revenue',
    linkedConceptIds: ['funnel-decomposition', 'segmentation', 'cohort-analysis'],
    context: {
      metricMovement: 'MRR growth rate slowed from 8% MoM to 2% MoM over 3 months despite record signup volume',
      businessImpact: 'Investor expectations for 8%+ MoM growth; miss will affect Series B terms',
      timeWindow: 'Gradual 3-month deceleration',
      knownFacts: [
        'New signup volume is up 35% YoY — highest ever',
        'New signups predominantly from a self-serve free trial channel launched 6 months ago',
        'Free trial conversion rate to paid: 9%, down from 14% six months ago',
        'Average contract value (ACV) for new paid customers down 22% YoY',
        'Net revenue retention (NRR) for cohorts older than 12 months stable at 108%'
      ]
    },
    diagnosisSteps: [
      {
        id: 'revenue_decomp',
        stepNumber: 1,
        label: 'Revenue Decomposition',
        prompt: 'MRR growth slowing while signups grow. What is the right first decomposition?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Decompose MRR into: new MRR + expansion MRR + contraction MRR + churned MRR, and track each component over 3 months',
            isCorrect: true,
            level: 'strong',
            feedback: 'MRR growth is a net of four components. NRR stability for old cohorts tells you retention/expansion is fine. The problem is in new MRR quality: lower conversion and lower ACV from the new self-serve channel. The decomposition confirms this and prevents misdiagnosing a new-customer economics problem as a retention problem.'
          },
          {
            id: 'b',
            label: 'Compare total signup count this quarter vs. last quarter',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Signup count is already confirmed as all-time high. The problem is quality and conversion, not volume.'
          },
          {
            id: 'c',
            label: 'Investigate whether a product regression is causing trial cancellations',
            isCorrect: false,
            level: 'partial',
            feedback: 'NRR stability for older cohorts suggests the product works for converted customers. The problem is upstream in trial quality or conversion, not product experience after conversion.'
          }
        ]
      },
      {
        id: 'root_cause',
        stepNumber: 2,
        label: 'Root Cause Identification',
        prompt: 'Free trial conversion dropped from 14% to 9% and new ACV is down 22%. What is the most likely root cause?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'The self-serve free trial channel is acquiring lower-intent, lower-fit users — the signup mix shifted to a segment that converts less and pays less',
            isCorrect: true,
            level: 'strong',
            feedback: 'The evidence points to mix shift. Free trial volume up 35% but conversion down 5pp and ACV down 22% — the marginal new trial user is lower-fit than average 6 months ago. Likely SMB/individuals rather than the enterprise accounts the sales-led channel generated. Stable NRR confirms the product delivers value for the right customer — the problem is acquiring them.'
          },
          {
            id: 'b',
            label: 'Onboarding degraded after the self-serve channel launched, causing lower conversion across all signups',
            isCorrect: false,
            level: 'partial',
            feedback: 'If onboarding degraded universally, converted customers would show lower activation or earlier churn. NRR stability for old cohorts rules this out. The ACV decline points to who is signing up, not how they are onboarded.'
          },
          {
            id: 'c',
            label: 'The sales team is offering larger discounts to hit quarterly targets',
            isCorrect: false,
            level: 'partial',
            feedback: 'Discounting could explain ACV decline but not the free trial conversion rate drop, which is a self-serve flow. Both happening simultaneously would require corroborating evidence.'
          }
        ]
      },
      {
        id: 'fix',
        stepNumber: 3,
        label: 'Remediation',
        prompt: 'Root cause: self-serve channel is acquiring lower-fit user mix. What is the right strategic response?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Add qualification in signup flow: route SMB signups to a lighter tier, route enterprise-fit signals to sales',
            isCorrect: true,
            level: 'strong',
            feedback: 'A qualification layer identifies fit at signup and routes accordingly — high-fit users get a sales touch or enterprise trial, low-fit get a lighter tier or honest redirect. This improves conversion rate by ensuring the trial funnel contains primarily high-fit prospects without reducing top-of-funnel reach.'
          },
          {
            id: 'b',
            label: 'Reduce free trial marketing spend to lower signup volume',
            isCorrect: false,
            level: 'partial',
            feedback: 'Volume reduction would improve conversion rate as a metric without improving the business. Route and qualify users rather than excluding them.'
          },
          {
            id: 'c',
            label: 'Extend the free trial period to give lower-fit users more time to find value',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Low-fit users are not converting because the product doesn\'t solve their problem — not because they ran out of time to discover that it does.'
          }
        ]
      }
    ],
    debrief: {
      rootCause: 'Self-serve free trial channel acquired high signup volume but lower-fit user mix (SMB vs. enterprise). Free trial conversion dropped from 14% to 9% and new ACV fell 22%, creating a new MRR quality problem that offset record signup volume. NRR stability for existing customers confirmed this is a new customer mix problem, not a product or retention problem.',
      lessonsLearned: [
        'Volume metrics and quality metrics (conversion rate, ACV) must both be tracked — volume without quality context is misleading',
        'A new acquisition channel changes user mix and the economics of every downstream conversion metric',
        'NRR stability for older cohorts rules out product problems and points to acquisition mix issues',
        'MRR growth decomposition is essential before diagnosing growth deceleration'
      ],
      interviewPhrase: '"Decompose MRR first. NRR stability for old cohorts tells me the product works. Conversion drop and ACV decline both coinciding with the self-serve channel launch points to mix shift — lower-fit users converting less and paying less. Fix is a qualification layer at signup, not a product fix." **Weak answer pattern:** The candidate recommends "extending the free trial from 14 to 30 days to improve conversion" — treating the 9% conversion rate as a product problem when the NRR stability of existing cohorts has already ruled out a product issue, and the 22% ACV decline has already pointed to mix shift rather than user friction. **Interviewer follow-up that exposes it:** "Existing customer NRR is stable at 108% — what does that tell you about whether this is a product problem or a customer selection problem?"'
    }
  },

  // ─────────────────────────────────────────────
  // RCA16 — Search Quality Degraded After Index Rebuild
  // ─────────────────────────────────────────────
  {
    id: 'RCA16',
    title: 'Search Relevance Degraded 3 Days After Catalog Index Rebuild',
    subtitle: 'Vela · B2C Marketplace · Search Quality',
    difficulty: 'senior',
    isFree: false,
    domain: 'search',
    linkedConceptIds: ['data-quality-check', 'segmentation', 'funnel-decomposition'],
    context: {
      metricMovement: 'Search-to-purchase conversion dropped 11% over 3 days; zero-result rate unchanged',
      businessImpact: 'Search drives 62% of GMV; 11% conversion drop = ~$340k/day',
      timeWindow: '3-day gradual decline starting the day after a full catalog index rebuild',
      knownFacts: [
        'Full catalog index rebuild completed the day before the decline started',
        'Zero-result rate unchanged — all searches still return results',
        'CTR on search results down 18%',
        'Add-to-cart rate from search results down 24%',
        'Post-click bounce rate (back to search) up 30%',
        '"Boost by recency" feature enabled during the index rebuild to surface newer listings'
      ]
    },
    diagnosisSteps: [
      {
        id: 'result_quality',
        stepNumber: 1,
        label: 'Relevance vs. Availability',
        prompt: 'Zero-result rate is flat but conversion is down. What does this tell you?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'The problem is result quality (relevance), not availability — buyers see results but don\'t click or convert on them',
            isCorrect: true,
            level: 'strong',
            feedback: 'Zero-result flat = index can find listings. CTR down 18% + post-click bounce up 30% = buyers see results, skip most, and return to search immediately after clicking. Classic relevance degradation signature: results exist but are not the right results.'
          },
          {
            id: 'b',
            label: 'The problem is in the checkout funnel — post-search conversion dropped but pre-search behavior is normal',
            isCorrect: false,
            level: 'wrong',
            feedback: 'CTR on the search results page is down 18% — this happens before the checkout funnel.'
          },
          {
            id: 'c',
            label: 'The problem is seasonal — buyer intent dropped for this period',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Seasonal drops reduce search volume, not specifically CTR while leaving zero-result rate unchanged.'
          }
        ]
      },
      {
        id: 'recency_boost',
        stepNumber: 2,
        label: 'Feature Attribution',
        prompt: '"Boost by recency" was enabled during the rebuild. How does this explain the relevance degradation?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Recency boost surfaces newer but lower-quality listings above higher-quality established ones — buyers click, immediately bounce, and convert less',
            isCorrect: true,
            level: 'strong',
            feedback: 'New listings have fewer reviews, lower ratings, and less proven conversion. Recency boost ranks them above established high-quality listings. Buyers click (they\'re at the top), immediately see a product that doesn\'t match expectations, and return to search. Post-click bounce rate +30% is the definitive signal.'
          },
          {
            id: 'b',
            label: 'The index rebuild introduced a bug where certain categories are incorrectly indexed',
            isCorrect: false,
            level: 'partial',
            feedback: 'Category indexing bugs would show in zero-result rates or category-specific conversion drops. Zero-result rate is flat.'
          },
          {
            id: 'c',
            label: 'The index took too long and shows out-of-stock listings at the top of results',
            isCorrect: false,
            level: 'partial',
            feedback: 'The rebuild is described as completed. The recency boost feature is the more direct explanation.'
          }
        ]
      },
      {
        id: 'fix',
        stepNumber: 3,
        label: 'Remediation',
        prompt: 'Root cause: recency boost ranks lower-quality new listings over high-quality established ones. What is the right fix?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Disable pure recency boost; instead add a quality floor — new listings get boosted only above a minimum review/rating threshold',
            isCorrect: true,
            level: 'strong',
            feedback: 'Quality-gated recency signal preserves the goal of surfacing fresh inventory while protecting buyer experience from unrated low-quality listings. Simple on/off is too blunt — the goal was valid, the calibration was wrong.'
          },
          {
            id: 'b',
            label: 'Roll back the full index rebuild',
            isCorrect: false,
            level: 'partial',
            feedback: 'Full rebuild rollback is a large operation when the fix is a specific ranking signal that can be toggled.'
          },
          {
            id: 'c',
            label: 'Keep recency boost but reduce its weight by 50%',
            isCorrect: false,
            level: 'partial',
            feedback: 'Halving the weight may not fix the problem if zero-review listings are still ranking above 200-review listings. A quality floor is more precise than weight reduction.'
          }
        ]
      }
    ],
    debrief: {
      rootCause: '"Boost by recency" surfaced newly-listed, low-review items at the top of search results. Buyers clicked fewer results (-18% CTR) and bounced back to search immediately (+30% bounce rate), creating a conversion collapse without any change in result availability.',
      lessonsLearned: [
        'Relevance degradation signature: zero-result flat + CTR down + post-click bounce up',
        'Ranking signal changes need quality guardrails — recency without a quality floor degrades marketplaces with uneven listing quality',
        'Post-click bounce rate is one of the highest-signal metrics for search relevance'
      ],
      interviewPhrase: '"Zero-result flat but CTR and add-to-cart down with post-click bounce up — relevance problem, not coverage. Connect that to recency boost: surfacing newer but lower-quality listings. Fix: quality-gated recency — boost only listings above a minimum quality threshold." **Weak answer pattern:** The candidate says "zero-result rate is unchanged so search is working fine" and pivots to investigating demand trends — failing to recognize that zero-result flat with post-click bounce up is the specific diagnostic signature of results existing but being irrelevant. **Interviewer follow-up that exposes it:** "Zero-result rate didn\'t change, but buyers are bouncing back to search immediately after clicking — what does that pattern tell you about whether the problem is result availability or result quality?"'
    }
  },

  // ─────────────────────────────────────────────
  // RCA17 — D7 Retention Dropped After Onboarding Redesign
  // ─────────────────────────────────────────────
  {
    id: 'RCA17',
    title: 'D7 Retention Fell 8pp After Onboarding Redesign',
    subtitle: 'Spark · Consumer Social · New User Retention',
    difficulty: 'senior',
    isFree: false,
    domain: 'retention',
    linkedConceptIds: ['funnel-decomposition', 'cohort-analysis', 'segmentation'],
    context: {
      metricMovement: 'D7 retention dropped from 38% to 30% for new user cohorts registered after the onboarding redesign',
      businessImpact: 'D7 retention predicts D30 and D90; 8pp drop compounds into significant long-run DAU loss',
      timeWindow: 'Drop cleanly attributable to post-redesign cohorts; pre-redesign cohorts stable',
      knownFacts: [
        'New onboarding flow shipped 3 weeks ago — A/B test ran 2 weeks then fully ramped',
        'A/B test showed +12% improvement in onboarding completion rate',
        'Average time-to-first-post dropped from 8 to 4 minutes with new flow',
        'New flow removed "follow 5 friends" step (replaced with "follow 5 interests")',
        'Notification permission opt-in rate down 15% with new flow',
        'New flow users have lower follow counts (avg 3.2 vs. 6.8 in old flow)'
      ]
    },
    diagnosisSteps: [
      {
        id: 'paradox_resolution',
        stepNumber: 1,
        label: 'A/B Test Paradox',
        prompt: 'A/B test showed better onboarding completion but real-world D7 retention is worse. Why was the test misleading?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Completion rate is a proxy metric — completing onboarding faster doesn\'t mean users are better set up for long-term retention. The test optimized for the wrong outcome.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Classic proxy metric trap. The test measured completion (did users finish all steps?) and time-to-first-post. Both improved. But neither correlates with what drives retention: the quality of the social graph built during onboarding. "Follow 5 friends" was friction-heavy but seeded the social connections that make the feed valuable on days 2–7.'
          },
          {
            id: 'b',
            label: 'The A/B test had flawed randomization',
            isCorrect: false,
            level: 'partial',
            feedback: 'Randomization issues are worth checking, but the behavioral mechanism is more direct: fewer follows = sparser feed = fewer reasons to return. Start here before investigating statistical methodology.'
          },
          {
            id: 'c',
            label: 'The A/B test ran during an unrepresentative time period',
            isCorrect: false,
            level: 'wrong',
            feedback: 'The cohort comparison is clean (pre vs. post redesign). Timing would need to affect treatment group specifically — a time-of-year effect would hurt both arms equally.'
          }
        ]
      },
      {
        id: 'mechanism',
        stepNumber: 2,
        label: 'Retention Mechanism',
        prompt: 'New users have lower follow counts (3.2 vs. 6.8) and lower notification opt-in. Which factor primarily explains the D7 drop?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Lower follow count is primary — fewer social connections means a sparser, less personalized feed with fewer reasons to return',
            isCorrect: true,
            level: 'strong',
            feedback: 'At 6.8 follows, users have multiple connections creating content that brings them back. At 3.2 follows, the feed is sparse and dominated by interests rather than social signals. Notification opt-in decline is a compounding factor, but social graph quality affects every session, not just re-engagement prompts.'
          },
          {
            id: 'b',
            label: 'Notification opt-in decline is primary — users are not being reminded to return',
            isCorrect: false,
            level: 'partial',
            feedback: 'Notifications can only re-engage users who found value in their first few sessions. If the feed is too sparse for a good first-session experience, successful re-engagement just accelerates recognition that the product isn\'t worth using.'
          },
          {
            id: 'c',
            label: 'Faster onboarding means less investment in the platform and easier churn',
            isCorrect: false,
            level: 'partial',
            feedback: 'The sunk cost theory of retention is weaker than the content relevance mechanism: fewer follows = sparser feed = fewer compelling posts = fewer reasons to return.'
          }
        ]
      },
      {
        id: 'fix',
        stepNumber: 3,
        label: 'Fix Without Regressing Completion',
        prompt: 'The new flow improved completion (+12%) but hurt retention. You cannot simply revert. What is the right redesign?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Keep the streamlined flow but restore a social connection step — make "follow 3 people you know" required after interests, with a contact import option to reduce friction',
            isCorrect: true,
            level: 'strong',
            feedback: 'Interests setup (low friction) + minimum social graph seeding (high retention value, lower friction via contact import). Contact import achieves 5+ follows in 60 seconds vs. the old flow\'s 3+ minutes of manual search.'
          },
          {
            id: 'b',
            label: 'Revert to the old flow and accept lower completion rate',
            isCorrect: false,
            level: 'partial',
            feedback: 'Reverts retention but accepts a proven 12% lower completion rate — also a retention problem. Improve both, not choose between them.'
          },
          {
            id: 'c',
            label: 'Invest in better notification content to compensate for the sparse social graph',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Notifications cannot create the social content that makes re-engagement rewarding. Fix the product experience before investing in re-engagement mechanics.'
          }
        ]
      }
    ],
    debrief: {
      rootCause: 'Onboarding redesign removed "follow 5 friends" step, reducing new user follow counts from 6.8 to 3.2 average. Sparse social graphs produce lower feed quality and fewer compelling posts — the primary D7 retention mechanism in a social product. A/B test measured completion and speed instead of downstream retention, declaring a win on the wrong metric.',
      lessonsLearned: [
        'Onboarding A/B tests must measure D7/D14 retention as primary metric, not completion rate',
        'Social graph seeding is a retention mechanism, not just a setup step — removing it trades short-run completion for long-run retention',
        'When a proxy metric improves while the business outcome worsens, the test selected the wrong success metric'
      ],
      interviewPhrase: '"The A/B test optimized the wrong metric — completion rate is a proxy. Right primary metric for onboarding is D7 retention. Trace the mechanism: fewer follows → sparser feed → less reason to return. Fix: keep the streamlined flow but restore a mandatory social connection step, using contact import to lower friction." **Weak answer pattern:** The candidate accepts the A/B test result at face value since "it showed +12% completion rate improvement" and recommends shipping, without questioning whether completion rate is the right success metric for an onboarding change that aims to drive D7 retention. **Interviewer follow-up that exposes it:** "The A/B test showed +12% onboarding completion rate — is that sufficient evidence to ship, and what would you want to see in the data before approving the change?"'
    }
  },

  // ─────────────────────────────────────────────
  // RCA18 — Ad Revenue Drop During Holiday
  // ─────────────────────────────────────────────
  {
    id: 'RCA18',
    title: 'Ad Revenue Dropped 22% During the Holiday Season',
    subtitle: 'Prism · Short-Form Video · Ad Monetization',
    difficulty: 'senior',
    isFree: false,
    domain: 'monetization',
    linkedConceptIds: ['funnel-decomposition', 'segmentation', 'data-quality-check'],
    context: {
      metricMovement: 'Ad revenue dropped 22% in first week of January vs. last week of December',
      businessImpact: '22% is outside normal seasonal bounds',
      timeWindow: '7-day period starting January 2nd',
      knownFacts: [
        'Ad impression volume down 18%',
        'Average CPM down 5%',
        'Video consumption (DAU × sessions × session length) UP 8% in the same period',
        'Ad fill rate dropped from 92% to 71% — 21pp decline',
        'Top-5 advertiser Q4 holiday campaigns ended January 1',
        'New ad frequency cap (max 3 ads/session) deployed December 28'
      ]
    },
    diagnosisSteps: [
      {
        id: 'decompose_revenue',
        stepNumber: 1,
        label: 'Revenue Decomposition',
        prompt: 'Ad revenue = impressions × CPM / 1000. Both are down, but video consumption is UP. What is the key anomaly?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Why are impressions down 18% when video consumption is up 8%? The gap between content consumption and ad delivery is the anomaly.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Content up but ad impressions down = problem in ad inventory creation or fill, not in demand or content. Fill rate dropped from 92% to 71% — more video sessions are happening but fewer are being filled with ads. Both the frequency cap (fewer slots per session) and Q4 budget exhaustion (fewer ads available) compound to produce this.'
          },
          {
            id: 'b',
            label: 'Why did CPM drop 5%? Advertiser demand is soft.',
            isCorrect: false,
            level: 'partial',
            feedback: 'A 5% CPM drop explains only 5% of the 22% revenue decline. The primary driver is the 18% impression volume decline despite higher consumption.'
          },
          {
            id: 'c',
            label: 'CPM dropped 5% and Q4 advertiser budgets ended January 1 — the anomaly is a demand-side shortfall that compressed both CPM and impression volume together.',
            isCorrect: false,
            level: 'wrong',
            feedback: 'This conflates two different signals. CPM is down 5% and impressions are down 18% — but video consumption is UP 8%. A demand-side shortfall would reduce CPM and fill rate, but it cannot explain why impressions fell sharply while consumption rose. The key anomaly is the divergence: more users watching more content, yet fewer ads served. That divergence points to a supply-side inventory constraint (fill rate, frequency cap), not advertiser demand.'
          }
        ]
      },
      {
        id: 'fill_rate',
        stepNumber: 2,
        label: 'Fill Rate Diagnosis',
        prompt: 'Fill rate dropped 21pp. Q4 advertiser budgets ended January 1 AND frequency cap deployed December 28. Which is the primary driver?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Both factors compound — advertiser budget exhaustion reduced demand-side supply while frequency capping reduced inventory per session',
            isCorrect: true,
            level: 'strong',
            feedback: 'Fill rate = demand / inventory slots. Both inputs degraded simultaneously. In a supply-demand system, compounding constraints produce non-linear drops — a 15% demand decline and 12% slot reduction can produce a 25%+ fill rate collapse. This is why the 21pp fill rate drop is larger than either change alone would predict.'
          },
          {
            id: 'b',
            label: 'The frequency cap is the primary driver — it directly reduced ad slots per session',
            isCorrect: false,
            level: 'partial',
            feedback: 'Frequency cap was deployed December 28 but the fill rate collapsed January 2+ — aligning more with the Q4 budget end date. The cap amplifies but is not the sole driver.'
          },
          {
            id: 'c',
            label: 'Q4 advertiser budget exhaustion is the primary driver — January is always soft',
            isCorrect: false,
            level: 'partial',
            feedback: '22% vs. normal seasonal bounds means this is larger than usual January softness. The frequency cap is the amplifier that made a normal seasonal decline abnormally large.'
          }
        ]
      },
      {
        id: 'fix',
        stepNumber: 3,
        label: 'Remediation',
        prompt: 'Both factors compound. What is the right fix and long-term structural change?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Short-term: temporarily raise frequency cap floor for January. Long-term: model caps dynamically by fill rate — tighten when demand is strong, relax when fill rate is low.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Dynamic frequency capping is the right structure. A static cap calibrated for 92% fill rate creates over-restriction at 71% fill rate. When demand is soft, cap is the binding constraint — relaxing it recovers impressions without adding user experience cost (few ads available anyway). This is how sophisticated ad platforms manage seasonal cycles.'
          },
          {
            id: 'b',
            label: 'Remove the frequency cap entirely.',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Frequency caps protect user experience. The problem is a static cap that doesn\'t adapt to demand conditions.'
          },
          {
            id: 'c',
            label: 'Accelerate Q1 advertiser deals to refill demand.',
            isCorrect: false,
            level: 'partial',
            feedback: 'Demand development has a long sales cycle. Doesn\'t address the immediate January crisis. Frequency cap adjustment is deployable in days.'
          }
        ]
      }
    ],
    debrief: {
      rootCause: 'Q4 advertiser budget exhaustion (demand-side) compounded with a static frequency cap (supply-side restriction calibrated for peak demand) to collapse fill rate from 92% to 71%, dropping ad impressions 18% despite 8% higher content consumption.',
      lessonsLearned: [
        'Ad revenue RCA: decompose impressions × CPM. Consumption up but impressions down = delivery problem, not audience problem',
        'Static system parameters calibrated for peak conditions fail systematically in off-peak — build adaptive controls',
        'Fill rate is the highest-signal health metric for ad systems — a >5pp drop requires immediate investigation'
      ],
      interviewPhrase: '"Content up but impressions down — delivery problem, not audience. Fill rate dropped 21pp from two compounding factors: Q4 budget exhaustion and the frequency cap reducing per-session inventory. Fix: dynamic cap that relaxes when fill rate is low, not a static cap calibrated for peak demand." **Weak answer pattern:** The candidate says "content consumption is up 8% so the platform is healthy and the revenue drop is just seasonal" — treating January seasonality as the complete explanation without checking whether ad impressions moved opposite to content consumption, which is the diagnostic signal that separates a demand-side seasonal dip from a delivery-side constraint. **Interviewer follow-up that exposes it:** "Content views are up 8% but ad revenue is down 22% — does that combination make seasonality a complete explanation, or does it point to a specific delivery mechanism you\'d want to investigate?"'
    }
  },

  // ─────────────────────────────────────────────
  // RCA19 — Activation Half Baseline in New Market
  // ─────────────────────────────────────────────
  {
    id: 'RCA19',
    title: 'Activation Rate Half the Global Baseline in New Market',
    subtitle: 'Loopwise · B2B SaaS · International Expansion',
    difficulty: 'analyst',
    isFree: false,
    domain: 'growth',
    linkedConceptIds: ['funnel-decomposition', 'segmentation', 'data-quality-check'],
    context: {
      metricMovement: 'New user activation rate in Southeast Asia (SEA) launch: 12% vs. 24% global baseline',
      businessImpact: '12% activation rate makes unit economics negative — CAC recovery requires 40%+ activation',
      timeWindow: '6 weeks since SEA launch',
      knownFacts: [
        'Product is in English only; SEA market includes Indonesia, Vietnam, Thailand — non-English speakers',
        'Onboarding email sequence in English only',
        'Step 1→Step 2 (workspace setup) dropout: 68% in SEA vs. 31% globally',
        'Support ticket volume from SEA is 3x global rate — top category is "I don\'t know what to do next"',
        'All SEA acquisitions came through paid performance channel targeting English-search keywords',
        'Mobile-first users: 78% of SEA signups vs. 31% globally; product has no mobile app'
      ]
    },
    diagnosisSteps: [
      {
        id: 'funnel_step',
        stepNumber: 1,
        label: 'Funnel Step Isolation',
        prompt: 'Step 1→2 dropout is 68% in SEA vs. 31% globally. What does this tell you?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'The activation problem is concentrated in the first onboarding step — workspace setup. This is the highest-leverage intervention point.',
            isCorrect: true,
            level: 'strong',
            feedback: '68% dropout at the first substantive step means most SEA users never experience the core product. Fixing activation for users who pass Step 2 is less impactful than recovering the 68% who never reach it. Workspace setup involves understanding what the product does — a comprehension challenge for non-English users.'
          },
          {
            id: 'b',
            label: 'The activation problem is distributed across the entire onboarding flow',
            isCorrect: false,
            level: 'wrong',
            feedback: '68% vs. 31% Step 1→2 dropout is a concentrated, specific problem. The biggest lever is this step.'
          },
          {
            id: 'c',
            label: 'The activation problem is in user intent — SEA users are lower-intent signups from the paid channel',
            isCorrect: false,
            level: 'partial',
            feedback: '"I don\'t know what to do next" support tickets point to comprehension failure, not low intent. Users who don\'t understand are not the same as users who don\'t want to.'
          }
        ]
      },
      {
        id: 'root_cause',
        stepNumber: 2,
        label: 'Multi-Factor Root Cause',
        prompt: 'Language barriers, mobile-only users without an app, and English-search acquisition all present. Which combination drives the problem?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'All three are active contributors: language barrier prevents comprehension; 78% mobile-first users hit a web-only product; English-search acquisition selects for unrepresentative higher-English-proficiency users',
            isCorrect: true,
            level: 'strong',
            feedback: 'Multi-root-cause RCA. Language barrier explains "don\'t know what to do" and workspace setup dropout. Mobile-without-app explains why 78% of SEA users have a fundamentally broken experience. English-search acquisition means the 12% activation rate is optimistic — if they reached broader audiences, it would be worse.'
          },
          {
            id: 'b',
            label: 'Language barrier is the only real cause — fix localization and activation will recover',
            isCorrect: false,
            level: 'partial',
            feedback: 'Localization is the highest-leverage single fix, but ignoring mobile leaves a permanent gap — 78% of SEA users on a non-mobile-optimized experience.'
          },
          {
            id: 'c',
            label: 'The acquisition channel is the root cause — SEA users from English-search campaigns are the wrong profile',
            isCorrect: false,
            level: 'partial',
            feedback: 'Channel is a contributing factor but not root cause. Even with better acquisition, the product and onboarding would still fail non-English mobile users.'
          }
        ]
      },
      {
        id: 'priority',
        stepNumber: 3,
        label: 'Remediation Priority',
        prompt: 'Three contributing factors. How do you prioritize?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'P1: localize onboarding (UI + emails). P2: launch mobile-first experience. P3: shift acquisition to native-language channels.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Localization is fastest (weeks) with broadest impact. Mobile experience is larger engineering investment but necessary for long-run SEA success. Acquisition channel shift should happen after the product can actually convert the users it acquires — investing in more users before the product works is wasteful.'
          },
          {
            id: 'b',
            label: 'P1: pause SEA paid acquisition. P2: fix everything. P3: relaunch.',
            isCorrect: false,
            level: 'partial',
            feedback: '"Fix everything then relaunch" is not a priority sequence. Some fixes (localization) can ship in weeks and be tested with ongoing traffic.'
          },
          {
            id: 'c',
            label: 'P1: improve CS capacity for SEA. P2: create English-language tutorial videos.',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Scaling support for a broken product treats symptoms. Tutorial videos in English don\'t solve a language barrier for non-English speakers.'
          }
        ]
      }
    ],
    debrief: {
      rootCause: 'Three compounding factors: English-only product causing comprehension failure; 78% mobile-first usage with no mobile app; English-search acquisition selecting for higher English proficiency than the actual market.',
      lessonsLearned: [
        'International expansion activation problems are almost always multi-factor: language, device/platform, acquisition channel',
        '"I don\'t know what to do next" support tickets are a localization and UX signal, not an intent signal',
        'Check mobile vs. desktop usage split immediately in any new international market'
      ],
      interviewPhrase: '"68% dropout at workspace setup with \'don\'t know what to do\' support tickets — comprehension failure. Three factors: English-only product, no mobile app for 78% mobile-first users, and English-search acquisition over-indexing on English proficiency. Prioritize: localization first, then mobile experience, then acquisition channel." **Weak answer pattern:** The candidate recommends "hiring more SEA-based customer success staff" to resolve the 3x support ticket volume — treating comprehension failure as a staffing problem rather than a product localization problem, which would scale support costs without reducing the underlying dropout rate. **Interviewer follow-up that exposes it:** "68% of users are dropping out at workspace setup — is that a support capacity problem, a product comprehension problem, or something else entirely, and how does your answer change your recommendation?"'
    }
  },

  // ─────────────────────────────────────────────
  // RCA20 — Gross Margin Compressed Despite Revenue Growth
  // ─────────────────────────────────────────────
  {
    id: 'RCA20',
    title: 'Gross Margin Compressed 8pp Despite 25% Revenue Growth',
    subtitle: 'Vantage Analytics · B2B SaaS · Unit Economics',
    difficulty: 'staff',
    isFree: false,
    domain: 'financial',
    linkedConceptIds: ['funnel-decomposition', 'segmentation', 'cohort-analysis'],
    context: {
      metricMovement: 'Gross margin dropped from 74% to 66% over two quarters while ARR grew 25%',
      businessImpact: 'Investor deck targets 75%+ gross margin; trajectory puts Series C valuation at risk',
      timeWindow: '6-month trend',
      knownFacts: [
        'Revenue grew 25% — primarily net new customers, not expansion',
        'COGS grew 48% — significantly faster than revenue',
        'Cloud infrastructure costs grew 62%',
        'New enterprise tier launched 5 months ago with significantly higher data processing requirements',
        'Enterprise tier: 18% of customers, 41% of compute costs',
        'Enterprise tier priced at 3× standard but costs 8× more to serve',
        'CS headcount grew 35% to support enterprise onboarding'
      ]
    },
    diagnosisSteps: [
      {
        id: 'cogs_decomp',
        stepNumber: 1,
        label: 'COGS Decomposition',
        prompt: 'COGS grew 48% while revenue grew 25%. How do you decompose COGS?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Break COGS into: infrastructure, Customer Success personnel, third-party data/API, professional services — compare each growth rate to revenue',
            isCorrect: true,
            level: 'strong',
            feedback: 'Infrastructure grew 62%, CS grew 35% — both significantly faster than revenue. The decomposition immediately reveals which component is primary and prevents attributing a multi-factor problem to a single cause.'
          },
          {
            id: 'b',
            label: 'Compare gross margin year-over-year',
            isCorrect: false,
            level: 'wrong',
            feedback: 'You already know gross margin is compressed. The RCA asks why — you need to decompose COGS components.'
          },
          {
            id: 'c',
            label: 'Audit revenue recognition methodology',
            isCorrect: false,
            level: 'partial',
            feedback: 'Worth a secondary check for accounting artifacts, but infrastructure costs growing 62% is a real cost increase, not an accounting artifact.'
          }
        ]
      },
      {
        id: 'enterprise_unit_economics',
        stepNumber: 2,
        label: 'Segment Unit Economics',
        prompt: 'Enterprise tier: 3× price, 8× cost, 18% of customers, 41% of compute. What is the precise unit economics problem?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Enterprise tier has ~31% gross margin (3× price / 8× cost). Growing enterprise share compresses blended margin from 74%.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Math: standard tier at 74% margin → cost = 0.26R. Enterprise cost = 8 × 0.26R = 2.08R. Enterprise revenue = 3R. Enterprise margin = (3R - 2.08R) / 3R = 31%. As enterprise grows from 18% of customers, blended margin falls toward 31%. The pricing did not model compute cost at scale.'
          },
          {
            id: 'b',
            label: 'Enterprise is profitable — 3× price covers 8× cost because enterprise contracts are larger in absolute value',
            isCorrect: false,
            level: 'wrong',
            feedback: '3× does not cover 8×. Enterprise margin is ~31%, well below the 74% standard tier and 75% investor target.'
          },
          {
            id: 'c',
            label: 'CS headcount growth is the primary margin driver',
            isCorrect: false,
            level: 'partial',
            feedback: 'CS at +35% contributes, but infrastructure grew 62% and represents a larger COGS share for a SaaS company. Both need to be in the analysis but infrastructure is primary.'
          }
        ]
      },
      {
        id: 'fix',
        stepNumber: 3,
        label: 'Margin Recovery',
        prompt: 'Enterprise tier is structurally below-margin and growing as a share of revenue. What is the right response?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Reprice enterprise tier to reflect actual cost structure (or cap data processing per tier) + invest in architecture to reduce per-unit compute costs',
            isCorrect: true,
            level: 'strong',
            feedback: 'Two levers: repricing aligns incentives correctly and captures real cost. Architecture investment lowers the per-unit cost curve. Both are needed — repricing alone slows growth, cost reduction alone leaves the margin gap for the existing base. Target: enterprise pricing should achieve minimum 65%+ tier-level gross margin.'
          },
          {
            id: 'b',
            label: 'Stop selling enterprise tier to recover margin',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Enterprise customers have higher ACV and typically higher NRR. The problem is pricing and cost structure, not whether to serve them.'
          },
          {
            id: 'c',
            label: 'Accelerate revenue growth to dilute the margin impact through scale efficiency',
            isCorrect: false,
            level: 'partial',
            feedback: 'Infrastructure costs here are variable (62% growth correlating with enterprise growth), not fixed. Scaling revenue with a negative-unit-economics product makes the problem worse in absolute terms.'
          }
        ]
      }
    ],
    debrief: {
      rootCause: 'Enterprise tier pricing (3×) did not cover enterprise compute costs (8×), resulting in ~31% gross margin for enterprise vs. 74% for standard. As enterprise grew to 18% of customers and 41% of compute costs, blended gross margin fell from 74% to 66%.',
      lessonsLearned: [
        'Tier pricing must be grounded in unit cost modeling — "enterprise features cost more to build" is insufficient; model compute costs per tier at scale',
        'Gross margin decomposition by customer segment is required when launching a new tier',
        'Variable compute costs in SaaS do not dilute with volume — "grow your way out" only works for fixed costs',
        'Pricing constraint: set the floor at minimum acceptable tier-level gross margin (60%+), then price above that for business value'
      ],
      interviewPhrase: '"Decompose COGS by category — infrastructure at 62% growth vs. 25% revenue is the headline. Then per-tier unit economics: 3× price for 8× cost = ~31% enterprise gross margin, dragging blended average as enterprise share grows. Fix: reprice to a 65% margin floor and invest in architecture to reduce per-unit compute costs." **Weak answer pattern:** The candidate recommends "reducing infrastructure costs by optimizing code efficiency" without first computing per-tier unit economics — treating this as an engineering efficiency problem when the diagnosis requires confirming that the enterprise tier is priced at 3× but costs 8× to serve, a pricing structure problem that engineering optimization alone cannot fix. **Interviewer follow-up that exposes it:** "Infrastructure costs grew 62% while revenue grew 25% — before recommending any action, how would you figure out whether this is a cost efficiency problem or a pricing structure problem?"'
    }
  },

  // ─────────────────────────────────────────────
  // RCA21 — Feature Engagement Spiked Then Crashed
  // ─────────────────────────────────────────────
  {
    id: 'RCA21',
    title: 'New Feature Had 60% Engagement Week 1, Crashed to 8% by Week 6',
    subtitle: 'Spark · Consumer Social · Feature Durability',
    difficulty: 'senior',
    isFree: false,
    domain: 'engagement',
    linkedConceptIds: ['novelty-effect', 'cohort-analysis', 'segmentation'],
    context: {
      metricMovement: 'Audio Rooms feature: W1 engagement 62%, W6 engagement 8%',
      businessImpact: 'Feature budgeted as a DAU driver; W6 engagement below 20% target used to justify investment',
      timeWindow: '6-week post-launch measurement window',
      knownFacts: [
        'Feature launched with push notifications and home feed placement in week 1',
        'Home feed placement deprioritized in week 3 (replaced by new feed ranking test)',
        'Push notifications for Audio Rooms capped at 1/week from week 2',
        '12% of users (power users) have 61% engagement in week 6; 88% of users have 2% engagement',
        'Users who hosted a room at least once have 55% ongoing engagement; attendees-only have 6%',
        'Average room quality (attendee retention within room) stable week over week'
      ]
    },
    diagnosisSteps: [
      {
        id: 'novelty_vs_distribution',
        stepNumber: 1,
        label: 'Novelty vs. Distribution',
        prompt: 'Engagement dropped from 62% to 8% over 6 weeks. How do you determine if this is novelty effect or distribution loss?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Segment engaged users: if power users are still highly engaged while casual users dropped off, it is a distribution/discovery problem for casual users',
            isCorrect: true,
            level: 'strong',
            feedback: 'Power users maintaining 61% engagement at week 6 rules out novelty effect — they have not gotten bored. The aggregate drop is casual users losing discovery pathways after notification caps and feed deprioritization. Distribution problem, not feature quality problem.'
          },
          {
            id: 'b',
            label: 'Compare to other features historically to establish a novelty decay baseline',
            isCorrect: false,
            level: 'partial',
            feedback: 'Historical comparison can help, but the user segmentation data is more directly informative. Power users at 61% is a clean signal of feature health.'
          },
          {
            id: 'c',
            label: 'Check room quality metrics to see if content quality is declining',
            isCorrect: false,
            level: 'partial',
            feedback: 'Room quality is explicitly stable. The problem is discovery, not content.'
          }
        ]
      },
      {
        id: 'host_vs_attendee',
        stepNumber: 2,
        label: 'Participation Mode Analysis',
        prompt: 'Hosts have 55% ongoing engagement vs. 6% for attendees-only. What does this tell you?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'The feature retains through creation, not consumption — growing the host base is the compound interest mechanism for long-run engagement',
            isCorrect: true,
            level: 'strong',
            feedback: 'Hosts have social investment (audience, reputation) creating return-visit motivation. Attendees-only have no stakes — if they miss a week, nothing is lost. Long-run engagement depends on growing the host base. Every new host brings their network, growing supply quality and reach simultaneously.'
          },
          {
            id: 'b',
            label: 'The feature is only for power users — reposition as niche',
            isCorrect: false,
            level: 'partial',
            feedback: 'Most successful participatory features have a power-user creation layer and a broad consumption layer. Goal: grow the creator/host base so the consumption layer has more compelling content.'
          },
          {
            id: 'c',
            label: 'Attendee engagement (6%) is a tracking problem',
            isCorrect: false,
            level: 'wrong',
            feedback: 'The host vs. attendee split is based on explicit participation mode. The 55% vs. 6% is a real behavioral difference.'
          }
        ]
      },
      {
        id: 'intervention',
        stepNumber: 3,
        label: 'Recovery Strategy',
        prompt: 'Feature health is strong for power users but weak in discovery and host acquisition. What is the right intervention?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Restore contextual discovery (feed placement triggered by active rooms) + build host onboarding path to convert high-engagement attendees to first-time hosts',
            isCorrect: true,
            level: 'strong',
            feedback: 'Contextual discovery (not a blanket notification blast) creates relevant discovery moments. Host conversion funnel targets high-engagement attendees (attended 3+ rooms) with structured first-host support. These two together address both distribution and supply growth.'
          },
          {
            id: 'b',
            label: 'Increase push notification frequency back to week-1 levels',
            isCorrect: false,
            level: 'wrong',
            feedback: 'High notification frequency was reduced for a reason. Restoring blast notifications produces a short-term bump then accelerated opt-out. The underlying problem is discovery and host acquisition, not notification volume.'
          },
          {
            id: 'c',
            label: 'Remove Audio Rooms from the home feed permanently and let it become organic niche discovery',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Participatory features with no established user base will die without active distribution. Without hosts, attendees disappear; without attendees, hosts stop creating — a death spiral.'
          }
        ]
      }
    ],
    debrief: {
      rootCause: 'Distribution problem, not novelty decay. Week-1 discovery driven by full feed placement and unrestricted notifications. When both were reduced (notification cap, feed deprioritization in week 3), casual users lost discovery pathways. Power users and hosts maintained high engagement, confirming genuine long-run value.',
      lessonsLearned: [
        'Always segment post-launch engagement by user type to distinguish novelty decay from distribution loss',
        'Participatory features retain through creation — host conversion is the highest-ROI retention strategy',
        'Week-1 engagement metrics are inflated by launch promotional activity — evaluate feature health at W4+ using segmented cohorts',
        'Discovery infrastructure is not free — removing it from a feature that hasn\'t built organic loops collapses engagement'
      ],
      interviewPhrase: '"Segment first. Power users at 61% week 6 means real value — not novelty decay. The aggregate drop is casual users losing discovery access. Hosts at 55% vs. attendees at 6% tells me the retention mechanism is creation-led. Two interventions: contextual discovery restoration when quality rooms are live, and a host conversion funnel targeting high-engagement attendees." **Weak answer pattern:** The candidate concludes "the feature failed due to novelty decay" and recommends "sunsetting Audio Rooms" — treating the aggregate 8% engagement as the full story, without segmenting to see that 12% of users still have 61% engagement in week 6, which falsifies a novelty decay diagnosis. **Interviewer follow-up that exposes it:** "Overall engagement dropped to 8%, but 12% of users have 61% engagement in week 6 — does that distribution support novelty decay, and what does it tell you about whether the feature has real value?"'
    }
  },

  // ─────────────────────────────────────────────
  // RCA22 — Payment Success Rate Collapsed in One Country
  // ─────────────────────────────────────────────
  {
    id: 'RCA22',
    title: 'Payment Success Rate Collapsed in Brazil Overnight',
    subtitle: 'Crafted · Marketplace · Cross-Border Payments',
    difficulty: 'analyst',
    isFree: false,
    domain: 'payments',
    linkedConceptIds: ['segmentation', 'data-quality-check', 'funnel-decomposition'],
    context: {
      metricMovement: 'Payment success rate in Brazil dropped from 88% to 47% overnight',
      businessImpact: 'Brazil is 14% of GMV; $280k/day at risk',
      timeWindow: 'Drop overnight, detected at 06:00 UTC',
      knownFacts: [
        'Brazil is the only affected country',
        '71% of Brazil payments use Pix (Brazil\'s instant payment system)',
        'Pix payment success rate: 28%; card payment success rate: 92% (unchanged)',
        'No code deploy in past 48 hours',
        'Brazil Central Bank issued a routine API update notification for Pix providers two days ago',
        'Pix error logs show: "API version mismatch — expected v2, received v1 response format"'
      ]
    },
    diagnosisSteps: [
      {
        id: 'payment_method_split',
        stepNumber: 1,
        label: 'Payment Method Isolation',
        prompt: 'Overall Brazil success rate collapsed but card payments are unchanged. First move?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Segment by payment method to confirm Pix-specific failure, then check Pix API error logs',
            isCorrect: true,
            level: 'strong',
            feedback: 'Card payments at 92% confirm payment infrastructure is healthy — the problem is Pix-specific. "API version mismatch" in error logs is the precise root cause: the Pix provider updated their API two days ago and the integration is sending/expecting the wrong version.'
          },
          {
            id: 'b',
            label: 'Check for a Brazil-specific code deploy or feature flag change',
            isCorrect: false,
            level: 'partial',
            feedback: 'No code deploy in 48 hours. The API update notification is the stronger lead.'
          },
          {
            id: 'c',
            label: 'Escalate to the Pix payment provider immediately before investigating',
            isCorrect: false,
            level: 'partial',
            feedback: 'Escalation should happen in parallel, but you need the specific error ("your v2 API is returning v1 responses for our integration") not a generic escalation. Specific evidence-backed escalations resolve faster.'
          }
        ]
      },
      {
        id: 'api_version',
        stepNumber: 2,
        label: 'Root Cause Confirmation',
        prompt: '"API version mismatch" in logs. Central Bank issued an API update notice 2 days ago. Precise root cause?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Pix provider deployed the API v2 update; Crafted\'s integration hasn\'t been updated to handle v2 response format — all v2 responses fail parsing',
            isCorrect: true,
            level: 'strong',
            feedback: 'Classic third-party API version break. The provider switched v1→v2. Crafted\'s integration parses v1 — v2 responses fail parsing, payment marked as failed. Country-specific + method-specific + API update notice = direct causal chain.'
          },
          {
            id: 'b',
            label: 'The API update notice was a scheduled downtime',
            isCorrect: false,
            level: 'wrong',
            feedback: '"API version mismatch" is not a downtime error pattern. Downtime shows connection refused or timeout errors.'
          },
          {
            id: 'c',
            label: 'Crafted\'s Pix credentials were invalidated by the API update',
            isCorrect: false,
            level: 'partial',
            feedback: 'Credential expiration produces "authentication failed" errors, not "API version mismatch" errors. Different error types, different root causes.'
          }
        ]
      },
      {
        id: 'fix',
        stepNumber: 3,
        label: 'Immediate Fix and Prevention',
        prompt: 'Pix API v2 migration broke Crafted\'s integration. Immediate fix and prevention?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Immediate: update Pix integration to handle v2 format (or request provider maintain v1 endpoint during transition). Prevention: API version monitoring alert via synthetic test transaction.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Integration fix is urgent at $280k/day. V1 endpoint maintenance request can stop bleeding while full v2 migration completes. Automated synthetic test transactions would catch response format changes within minutes of deployment — vs. 8 hours of manual detection here.'
          },
          {
            id: 'b',
            label: 'Immediate: disable Pix as a payment method until provider fixes their API',
            isCorrect: false,
            level: 'partial',
            feedback: 'Disabling Pix removes 71% of Brazilian payment options. Appropriate only if fix takes >24 hours, not as first response.'
          },
          {
            id: 'c',
            label: 'Immediate: refund all failed Pix payments and retry automatically',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Retrying through the broken parser produces the same failures. Fix the integration first, then process retries.'
          }
        ]
      }
    ],
    debrief: {
      rootCause: 'Brazil Central Bank\'s Pix provider deployed v1→v2 response format migration. Crafted\'s integration, built against v1, failed to parse v2 responses. Card payments (different provider, no change) unaffected.',
      lessonsLearned: [
        'Country-specific + method-specific payment failure always points to third-party provider change',
        'Error log message type is the fastest diagnostic: "API version mismatch" vs. "auth failed" vs. "timeout" point to different root causes',
        'Synthetic test transaction monitoring catches response format changes before production failures'
      ],
      interviewPhrase: '"Brazil only, Pix specifically, same day as an API update notice — segment by payment method first, check Pix error logs. \'API version mismatch\' = provider updated their format and our integration is still parsing the old one. Immediate fix: update the parser. Prevention: automated synthetic test transactions to catch format changes before production failures." **Weak answer pattern:** The candidate investigates "whether Brazilian users\' fraud risk increased" or "whether there was a network outage" — diagnosing payment failure as a demand or infrastructure problem rather than immediately cross-referencing the Brazil Central Bank\'s API update notice with the Pix-specific 28% success rate (vs. 92% for cards). **Interviewer follow-up that exposes it:** "Card payments are still 92% successful in Brazil, only Pix is failing — what does that specificity tell you about whether this is a network problem, a fraud problem, or an integration problem?"'
    }
  },

  // ─────────────────────────────────────────────
  // RCA23 — NPS Dropped Despite Healthy Product Metrics
  // ─────────────────────────────────────────────
  {
    id: 'RCA23',
    title: 'All Product Metrics Look Healthy But NPS Dropped 12 Points',
    subtitle: 'Threadline · B2B SaaS · Satisfaction Divergence',
    difficulty: 'staff',
    isFree: false,
    domain: 'satisfaction',
    linkedConceptIds: ['segmentation', 'cohort-analysis', 'proxy-metric'],
    context: {
      metricMovement: 'NPS dropped from 42 to 30 over 6 months; all product engagement metrics flat or up',
      businessImpact: 'NPS is a leading indicator of enterprise renewal — 12-point drop historically precedes churn acceleration by 2-3 quarters',
      timeWindow: 'Gradual 6-month decline',
      knownFacts: [
        'DAU, feature adoption, retention metrics flat or slightly up',
        'NPS drop concentrated in enterprise accounts (>100 seats): down 18 points; SMB: down 3 points',
        'Top NPS verbatim themes: "too many features we don\'t use", "AI features feel bolted on", "support response time worse", "we need EU data residency"',
        '14 new features shipped over 6 months — 11 targeting enterprise deals',
        'Customer Success headcount flat despite 25% enterprise customer growth',
        'Average support ticket resolution time increased from 4 hours to 11 hours'
      ]
    },
    diagnosisSteps: [
      {
        id: 'metric_divergence',
        stepNumber: 1,
        label: 'Metric Divergence Analysis',
        prompt: 'Product metrics are up but NPS is down. What does this divergence tell you?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Product metrics measure what users DO; NPS measures how they FEEL. Divergence means usage continues from switching costs or inertia while satisfaction declines — a classic pre-churn signal.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Enterprise B2B products can have high usage and declining satisfaction simultaneously because switching costs are high. Users continue because leaving is expensive, not because they are satisfied. NPS captures the sentiment product metrics miss. Flat DAU + declining NPS = locked in, not loyal.'
          },
          {
            id: 'b',
            label: 'NPS measurement is unreliable — the survey methodology may have changed',
            isCorrect: false,
            level: 'partial',
            feedback: 'Worth verifying, but the verbatim themes align consistently with operational data (support time up, feature velocity high, CS capacity flat). Multiple independent signals reduce the likelihood of measurement artifact.'
          },
          {
            id: 'c',
            label: 'The product metrics are measuring the wrong things',
            isCorrect: false,
            level: 'wrong',
            feedback: 'The question is why NPS and product metrics diverged, not whether product metrics have imperfections. The NPS verbatims and support data provide converging evidence for operational issues.'
          }
        ]
      },
      {
        id: 'verbatim_analysis',
        stepNumber: 2,
        label: 'Root Cause Multi-Factor Analysis',
        prompt: 'Verbatim themes: feature bloat, AI quality, support degradation, EU data residency. Which two factors have highest leverage on enterprise NPS?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Support degradation (4→11hr resolution) and feature complexity (14 features shipped rapidly) — both directly affect the IT/admin persona who responds to enterprise NPS surveys',
            isCorrect: true,
            level: 'strong',
            feedback: 'In enterprise B2B, the NPS respondent is often the IT admin. Their experience is dominated by support quality and platform manageability. Support resolution tripling from 4 to 11 hours is severe. 14 features shipped without consolidation creates operational complexity for IT managing permissions, training, and security reviews. These directly cause the score drop over 6 months.'
          },
          {
            id: 'b',
            label: 'Missing EU data residency and AI feature quality',
            isCorrect: false,
            level: 'partial',
            feedback: 'Data residency is a compliance blocker for European customers. AI quality is a product perception issue. Both matter, but data residency is binary (you have it or don\'t, not gradual) and AI quality concerns would show in usage metrics. The gradual 6-month decline aligns better with support degradation timeline.'
          },
          {
            id: 'c',
            label: 'Feature complexity alone is the driver',
            isCorrect: false,
            level: 'partial',
            feedback: 'Feature bloat is contributing but rarely drives 12-point NPS drops alone. Support response time tripling is more acute and directly experienced by IT admins repeatedly.'
          }
        ]
      },
      {
        id: 'intervention',
        stepNumber: 3,
        label: 'Remediation',
        prompt: 'Support degradation from CS flat vs. 25% account growth. Feature complexity from rapid roadmap execution. Right fix?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Support: hire CS to match enterprise growth ratio + invest in self-service to reduce ticket volume. Features: "depth over breadth" roadmap policy — for every new feature shipped, improve or consolidate one existing feature.',
            isCorrect: true,
            level: 'strong',
            feedback: 'CS headcount flat with 25% account growth is a ratio problem — hire proportionally or reduce per-account burden through self-service. "Depth over breadth" creates a forcing function to improve existing features and reduce complexity creep. Both address root causes.'
          },
          {
            id: 'b',
            label: 'Set an internal SLA of 4 hours without hiring. Communicate features better through release notes.',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Setting an SLA without capacity doesn\'t resolve tickets faster. Better release notes address communication, not complexity.'
          },
          {
            id: 'c',
            label: 'Escalate all enterprise tickets to a named CS rep. Pause the roadmap for one quarter.',
            isCorrect: false,
            level: 'partial',
            feedback: 'Named rep escalation doesn\'t scale without headcount. Roadmap pause addresses symptom without establishing a structural process for managing it.'
          }
        ]
      }
    ],
    debrief: {
      rootCause: 'Two compounding factors: (1) CS capacity flat while enterprise customers grew 25%, tripling support resolution time. (2) 14 new features shipped in 6 months without consolidation, creating IT complexity. Product usage metrics missed this because switching costs maintained behavioral engagement while satisfaction eroded.',
      lessonsLearned: [
        'Product engagement and NPS can diverge in enterprise B2B — switching costs maintain usage independent of satisfaction',
        'Support resolution time is a leading indicator of enterprise NPS — a 3× increase precedes churn by 1-2 quarters',
        'CS capacity must scale with enterprise account growth, not headcount budget cycles'
      ],
      interviewPhrase: '"Product up, NPS down in enterprise — that\'s switching costs masking satisfaction erosion. Support at 11hr vs. 4hr is the most acute operational issue. CS flat with 25% more accounts is a capacity math problem. Fix CS ratio first, then depth-over-breadth roadmap policy." **Weak answer pattern:** The candidate says "product metrics are healthy so NPS must be measuring something subjective or noisy" and recommends "improving NPS survey methodology" — dismissing the divergence between engagement metrics and satisfaction as a measurement artifact rather than recognizing that B2B enterprise switching costs sustain product usage independently of satisfaction. **Interviewer follow-up that exposes it:** "DAU and feature adoption are flat or up, but NPS dropped 12 points — in a B2B enterprise product specifically, how can those two signals both be true at the same time?"'
    }
  },

  // ─────────────────────────────────────────────
  // RCA24 — Recommendation CTR Dropped Post-ML Update
  // ─────────────────────────────────────────────
  {
    id: 'RCA24',
    title: 'Recommendation CTR Dropped 19% After ML Model Update',
    subtitle: 'Prism · Short-Form Video · Personalization',
    difficulty: 'staff',
    isFree: false,
    domain: 'ml-systems',
    linkedConceptIds: ['data-quality-check', 'segmentation', 'proxy-metric'],
    context: {
      metricMovement: 'Recommendation engine CTR dropped from 8.4% to 6.8% (-19%) within 24 hours of ML model update',
      businessImpact: 'Recommendations drive 45% of total video views; 19% CTR drop = ~8% total view reduction',
      timeWindow: '36 hours post-deploy',
      knownFacts: [
        'ML update added new features: watch completion rate, share rate, social graph proximity',
        'Offline A/B test showed +12% estimated CTR improvement in evaluation set',
        'Online CTR dropped 19% in production — 31pp gap vs. offline estimates',
        'CTR drop concentrated in new users (<30 days): down 34%. Power users (>6 months): down 8%.',
        'Social graph proximity has null values for 67% of new users',
        'Content diversity score dropped 41% — recommendations concentrated in narrow trending topics'
      ]
    },
    diagnosisSteps: [
      {
        id: 'offline_online_gap',
        stepNumber: 1,
        label: 'Offline-Online Gap',
        prompt: 'Offline showed +12% but production shows -19%. A 31pp gap indicates systemic failure. Most likely cause?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Training data distribution mismatch: evaluation set over-represented power users (who have social graphs). In production, 67% of new users have null social graph data.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Canonical offline-online gap failure mode. Evaluation set dominated by power users with social graphs → misleadingly positive CTR. In full production population with 67% new users having null social data, the model either falls back to a worse behavior or handles nulls poorly. Offline test measured the right metric on the wrong population.'
          },
          {
            id: 'b',
            label: 'The model is overfitting to historical training data',
            isCorrect: false,
            level: 'partial',
            feedback: 'Generic overfitting explanation doesn\'t explain why new users specifically are more impacted than power users. The null social graph data is a more specific and direct explanation.'
          },
          {
            id: 'c',
            label: 'The diversity collapse indicates the model is overfit to trending content',
            isCorrect: false,
            level: 'partial',
            feedback: 'The diversity collapse is a real consequence but secondary to the offline-online gap. The primary cause is null social graph handling for new users.'
          }
        ]
      },
      {
        id: 'null_handling',
        stepNumber: 2,
        label: 'Technical Root Cause',
        prompt: 'Social graph proximity is null for 67% of new users. How is this causing the CTR drop?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Null social graph values trigger a suboptimal fallback behavior (likely popularity-based ranking) for new users — less personalized, lower-CTR, diversity-collapsing recommendations',
            isCorrect: true,
            level: 'strong',
            feedback: 'When a required feature is null, models route to a fallback — often popularity ranking. New users get served viral/trending content rather than personalized recommendations. This explains both the CTR drop (popular content resonates less than personalized) and the diversity collapse (popularity fallback concentrates recommendations in trending topics).'
          },
          {
            id: 'b',
            label: 'Social graph proximity has extreme values causing numerical instability',
            isCorrect: false,
            level: 'partial',
            feedback: 'Numerical instability shows as NaN errors and model prediction failures, not a smooth 19% CTR reduction. The pattern (new users specifically impacted, null values for new users) points to null handling, not instability.'
          },
          {
            id: 'c',
            label: 'Social graphs need warm-up time before recommendations improve',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Warm-up effects produce gradual improvement over days. The CTR dropped immediately and has been stable at the lower level for 36 hours — a structural failure, not a temporary lag.'
          }
        ]
      },
      {
        id: 'fix',
        stepNumber: 3,
        label: 'Fix and Prevention',
        prompt: 'Null social graph handling causes suboptimal fallback for 67% of new users. Immediate fix and structural prevention?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Immediate: segment-specific rollback (restore previous model for new users, keep new model for power users). Prevention: add population segment evaluation to offline A/B test protocol — report performance for new users and power users separately.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Segment-specific rollback is more targeted than full rollback — keep the new model for power users where degradation is modest (-8%), restore previous for new users where degradation is severe (-34%). Structural prevention: offline evaluation must explicitly measure by population segment. A model that performs well in aggregate but fails for a 67% population segment would have been caught before deployment.'
          },
          {
            id: 'b',
            label: 'Immediate: retrain with more new user data',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Retraining takes days-weeks — not appropriate for a 36-hour production degradation. Segment-specific rollback is deployable in hours.'
          },
          {
            id: 'c',
            label: 'Immediate: full rollback. Prevention: production testing before full deployment.',
            isCorrect: false,
            level: 'partial',
            feedback: 'Full rollback is appropriate if segment-specific rollback is complex. But production testing alone wouldn\'t catch this without explicit new-user segment monitoring. The root fix is segment-specific offline evaluation reporting.'
          }
        ]
      }
    ],
    debrief: {
      rootCause: 'Offline evaluation set over-represented power users with social graphs. In production, null social graph data for 67% of new users triggered suboptimal fallback behavior, causing 34% CTR drop for new users and 41% diversity collapse across all users.',
      lessonsLearned: [
        'Offline-online gaps >10pp signal training data distribution mismatch — compare evaluation set composition to production user distribution before deployment',
        'Features null for a large user segment require explicit null handling design, not just model-level fallbacks',
        'Offline A/B evaluation must report performance by key user segments, not just aggregate metrics',
        'Content diversity is an emergent property of recommendation quality — a 41% collapse is a leading indicator of session length decline'
      ],
      interviewPhrase: '"31pp offline-online gap = training data distribution mismatch. Evaluation set over-represented power users with social graphs. In production, 67% of new users have null social data — hits a popularity fallback that collapses CTR and diversity. Fix: segment-specific rollback for new users. Prevention: always report offline eval performance by user segment." **Weak answer pattern:** The candidate says "the offline A/B test showed +12% CTR so the model is correct and the production drop must be a deployment or infrastructure bug" — accepting the offline evaluation at face value without asking whether the evaluation set population matches the production user distribution, which is the 31pp offline-online gap. **Interviewer follow-up that exposes it:** "Offline showed +12% but production shows -19% — before looking at the deployment pipeline, what would you check about the offline evaluation setup itself to explain a 31-percentage-point discrepancy?"'
    }
  },

  {
    id: 'RCA25',
    title: 'Seller Active Rate Declined, Buyer Traffic Flat',
    difficulty: 'senior',
    tags: ['marketplace', 'supply-side RCA', 'seller churn', 'T&S', 'unit economics'],
    context: {
      businessContext: 'Two-sided marketplace. Monthly health review flagged seller active rate declining while buyer-side metrics are stable.',
      metricMovement: 'Seller active rate (sellers with ≥1 fulfilled order in past 30 days) dropped 14% MoM. New seller registrations: flat.',
      businessImpact: 'Supply compression takes 6–8 weeks to manifest in buyer CVR. If the drop is structural, catalog quality and search relevance will degrade next quarter.',
      timeWindow: '30-day rolling window vs prior 30-day period.',
      knownFacts: [
        'Buyer traffic, GMV, and CVR are flat — no buyer-side signal yet',
        'New seller registrations are flat — the drop is in active rate, not registration',
        'A Trust & Safety enforcement sweep ran 45 days ago, removing policy-violating accounts',
        'No fulfillment fee or commission changes in the period',
        'No new competing marketplace launched in the primary categories'
      ]
    },
    diagnosisSteps: [
      {
        id: 'decomp',
        stepNumber: 1,
        label: 'First Decomposition',
        prompt: 'Seller active rate dropped 14% MoM. New registrations are flat. What is your first decomposition?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Decompose by seller vintage: new sellers (0–3 months) vs established sellers (3+ months). Compare drop rates by cohort — they signal completely different root causes.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Correct framing. A new seller drop signals an onboarding or early-activation failure. An established seller drop signals economics or platform policy friction. Running both in aggregate obscures which problem you have — and the fix is different for each.'
          },
          {
            id: 'b',
            label: 'Compare GMV per seller before and after to understand if economics worsened — sellers may find the platform less profitable.',
            isCorrect: false,
            level: 'partial',
            feedback: 'Useful but secondary. GMV per seller tells you whether remaining active sellers are doing more or less volume — it does not tell you why inactive sellers stopped. Start with the cohort decomposition to separate the churn population, then look at their economics.'
          },
          {
            id: 'c',
            label: 'Check if buyer demand dropped in specific categories where sellers may have exited — attribute seller drop-off to demand softening.',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Buyer traffic and GMV are explicitly flat in the known facts. Demand softening is ruled out. Starting here wastes investigation time on a signal that does not exist in the data.'
          }
        ]
      },
      {
        id: 'ts_context',
        stepNumber: 2,
        label: 'T&S Context',
        prompt: 'A T&S enforcement sweep ran 45 days ago. How does this change your diagnosis?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Confirm what % of the 14% drop is accounted for by enforcement-removed accounts. If those accounts were already low-GMV and policy-violating, this is healthy churn — not a structural problem.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Correct. The timing match is strong enough to be the primary hypothesis, but timing alone is not confirmation. Pull the list of removed accounts, check their overlap with the churned-active-seller population, and check their GMV contribution. If 80% of the drop is enforcement-driven and those sellers were low-GMV violators, the headline metric drop is misleading — the platform is healthier, not weaker.'
          },
          {
            id: 'b',
            label: 'The timing is obvious — assume the drop is entirely T&S-driven and close the investigation.',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Timing is a hypothesis, not a conclusion. If 40% of the drop is not enforcement-driven, you have missed a genuine structural problem. Always quantify the T&S overlap before closing the investigation.'
          },
          {
            id: 'c',
            label: 'Escalate to T&S to reverse the enforcement action and restore churned sellers.',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Premature and backwards. The sellers removed were policy violators. Reversing enforcement to recover a vanity metric is the wrong direction. Validate the cause first — if it is T&S, the "problem" may be intentional.'
          }
        ]
      },
      {
        id: 'residual',
        stepNumber: 3,
        label: 'Residual Drop',
        prompt: '40% of the drop is not explained by T&S removal. What is the most likely remaining cause and how do you validate?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Mid-tier sellers (50–200 orders/month) facing economics pressure — high RTO burden on COD at their volume erodes margin. Pull orders per seller and RTO rate for this cohort vs prior period.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Correct target. Mid-tier sellers have high enough volume to be affected by RTO economics but not enough scale to absorb reverse logistics costs. If their per-order contribution margin went negative or near-zero, exit is rational. This is a fee or RTO policy conversation, not a product fix.'
          },
          {
            id: 'b',
            label: 'New seller onboarding funnel broke — check listing completion rate and time-to-first-order for cohorts joining in the past 2 months.',
            isCorrect: false,
            level: 'partial',
            feedback: 'Valid hypothesis but lower likelihood here. New registrations are flat, which means the top of the onboarding funnel is working. If the onboarding funnel broke, you would expect new registrations to decline or time-to-first-order to increase for recent cohorts. Worth a quick check but not the primary hypothesis.'
          },
          {
            id: 'c',
            label: 'Run a seller survey to understand why they reduced activity.',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Surveys are slow, have low response rates among churned users, and produce self-reported data that may not reflect actual behavior drivers. You have order-level data — pull the economics story directly before resorting to a survey.'
          }
        ]
      }
    ],
    seniorDiagnosis: {
      reasoning: 'The T&S enforcement sweep 45 days ago is the primary hypothesis and must be quantified before drawing any other conclusion. Context-matching timing is a basic investigation discipline. For the residual unexplained drop, mid-tier seller economics is the most likely structural cause: COD return rates erode per-order margin for sellers who do not have the volume to absorb it. This is a unit economics problem, not a product problem — the conversation belongs with the pricing and fee policy team.',
      commonMistakes: [
        'Treating all seller decline as a product problem without checking T&S enforcement context',
        'Jumping to acquisition solutions (more onboarding incentives) when the problem is in retention economics',
        'Not separating new vs established seller cohorts — the diagnosis and fix are completely different',
        'Treating the headline metric drop as alarming before quantifying what fraction is healthy enforcement churn'
      ],
      interviewPhrase: 'When seller active rate drops, I ask two questions before anything else: was there a T&S action in the past 60 days, and is the drop concentrated in new or established sellers? The answer to those two questions determines whether this is a health signal or a platform problem.'
    },
    leadershipNote: 'Staff analysts know that seller active rate is a leading indicator of buyer CVR with a 6–8 week lag — supply compression does not show up in buyer metrics immediately. The T&S context question is the most important data read: if enforcement drove the drop, it is intentional and healthy. If mid-tier seller economics drove the rest, that opens a fee and RTO policy review conversation with leadership, not a product fix. The key framing is: are we losing the sellers we want to keep?',
    spokenSummary: 'Seller active rate down 14% while buyer traffic is flat. First move: decompose by vintage — new vs established sellers tell completely different stories. Second: a T&S sweep ran 45 days ago, so I\'d quantify what fraction of the churned accounts were enforcement-removed. If that explains 80%, this is healthy churn and the headline metric is misleading. For the residual, I\'d check mid-tier seller economics — orders per seller and RTO burden for the 50–200 orders/month cohort versus prior period. Guardrail: don\'t launch blanket retention incentives before ruling out T&S as the driver.',
  },

  {
    id: 'RCA26',
    title: 'Net Revenue Declined Despite Stable Order Volume',
    difficulty: 'senior',
    tags: ['unit economics', 'per-order P&L', 'revenue decomposition', 'discount burn', 'RTO', 'marketplace'],
    context: {
      businessContext: 'E-commerce marketplace, monthly revenue review. Volume growth is on track but finance flagged a net revenue miss.',
      metricMovement: 'Net revenue down 18% MoM. Gross orders: +1% MoM (essentially flat). AOV down 8% (Rs 298 → Rs 274).',
      businessImpact: 'Unit economics deterioration at this scale is material. A sustained 18% net revenue miss with flat orders means per-order profitability is eroding.',
      timeWindow: 'Current month vs prior month.',
      knownFacts: [
        'Gross orders: +1% MoM',
        'AOV: down 8% (Rs 298 → Rs 274)',
        'A new coupon campaign launched this month targeting first-time repeat buyers',
        'No fulfillment fee or commission rate changes',
        'COD share: 72% (stable)',
        'Logistics cost per order: flat'
      ]
    },
    diagnosisSteps: [
      {
        id: 'formula',
        stepNumber: 1,
        label: 'Revenue Formula Decomposition',
        prompt: 'Net revenue is down 18% but orders are flat. What is the right first decomposition?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Revenue per order = Fulfillment fee + Ad revenue − Logistics cost − Discount − RTO loss. Pull per-order P&L for current vs prior month and identify which component changed.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Correct. This is the only decomposition that separates the levers. Orders are flat, so the problem is entirely in revenue per order. Decomposing the P&L directly names the mechanism — you will know within one query whether this is discount burn, RTO cost, fee compression, or a combination.'
          },
          {
            id: 'b',
            label: 'Decompose by category to find where revenue declined most — if one category is driving it, investigate that category\'s pricing.',
            isCorrect: false,
            level: 'partial',
            feedback: 'Category segmentation is a useful second step but not the first decomposition. It tells you where the problem is concentrated geographically, not what mechanism is causing it. Pull the P&L formula first, then slice by category to identify concentration.'
          },
          {
            id: 'c',
            label: 'Calculate total GMV trend since AOV is down 8% — use GMV movement to explain the revenue decline.',
            isCorrect: false,
            level: 'wrong',
            feedback: 'GMV declining with orders flat is a symptom, not a root cause. It tells you that revenue per transaction is down — which you already know. The P&L decomposition tells you why.'
          }
        ]
      },
      {
        id: 'drivers',
        stepNumber: 2,
        label: 'Isolate the Driver',
        prompt: 'Per-order P&L shows: avg discount per order doubled this month, RTO rate up 3pp (18% → 21%), logistics cost flat. What do you investigate first?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Discount burn first — it doubled and a new coupon campaign launched this month. Pull discount_amount grouped by coupon_code to confirm the campaign is driving it.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Correct prioritization. Discount doubling with a concurrent campaign launch is a near-certain causal link — one query on coupon_code confirms it in minutes. This is your dominant lever. RTO up 3pp is material but secondary — it takes longer to diagnose and the discount explanation is already in front of you.'
          },
          {
            id: 'b',
            label: 'RTO rate first — a 3pp increase at this order volume is always material in absolute cost.',
            isCorrect: false,
            level: 'partial',
            feedback: 'True that 3pp RTO increase is material at scale. But discount per order doubled with a known campaign trigger — that is a stronger, faster-to-confirm signal. Sequence your investigation by Impact × Ease: discount is equally high impact and faster to validate. Investigate RTO as the second step, not the first.'
          },
          {
            id: 'c',
            label: 'Logistics cost — even flat per-order logistics matters when order volume is this high.',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Logistics cost per order is explicitly stated as flat in the known facts. Investigating a flat metric when two other metrics are moving is a waste of investigation time.'
          }
        ]
      },
      {
        id: 'recommendation',
        stepNumber: 3,
        label: 'Recommendation',
        prompt: 'Discount burn confirmed as primary driver (campaign-driven). RTO up 3pp is secondary. What is the right recommendation?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Tighten coupon eligibility — cap redemptions per user per month and limit to genuinely new repeat buyers. Model conversion impact before cutting. Separately, investigate RTO by pincode and payment method, and run prepaid nudges in high-RTO zones.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Correct structure: fix the primary driver with a conversion model (not a blind cut), and address RTO as a parallel workstream. The guardrail is critical — price-sensitive COD users may churn if discount disappears entirely. The model answers: what is the net contribution margin impact if conversion drops X% but discount burn drops Y%?'
          },
          {
            id: 'b',
            label: 'Pause the coupon campaign immediately to stop the discount burn.',
            isCorrect: false,
            level: 'partial',
            feedback: 'Stops the bleeding but incomplete. No conversion impact model means you might be cutting revenue and users as well as cost. And the RTO increase gets no action. A pause without a model and without addressing RTO is a reactive fix, not a recommendation.'
          },
          {
            id: 'c',
            label: 'Raise fulfillment fees to recover the margin compressed by discount burn — sellers absorb the cost.',
            isCorrect: false,
            level: 'wrong',
            feedback: 'This shifts the problem rather than fixing it. Higher fulfillment fees hurt seller economics, which reduces supply, which hurts buyer CVR. It also does nothing to reduce discount burn or RTO costs — those are still being incurred. This is a cost-shifting move disguised as a recommendation.'
          }
        ]
      }
    ],
    seniorDiagnosis: {
      reasoning: 'Net revenue declining with orders flat is always a per-order economics story. The P&L formula decomposition immediately isolates the mechanism. Discount doubling with a concurrent campaign launch is the clearest signal — one coupon_code query confirms it. The RTO increase is a parallel concern: 3pp at this volume is hundreds of crores annually in reverse logistics, and it warrants its own investigation and prepaid nudge program.',
      commonMistakes: [
        'Treating AOV decline as the root cause rather than a symptom of discount burn',
        'Not decomposing the full P&L formula — jumping to category or channel segmentation before identifying the mechanism',
        'Recommending a discount cut without modeling conversion impact on price-sensitive COD users',
        'Missing that discount burn and RTO can compound — a discounted order that also returns incurs both costs simultaneously'
      ],
      interviewPhrase: 'Orders stable, net revenue down 18% — this is per-order economics. Revenue per order equals fee plus ad revenue minus logistics, discount, and RTO loss. Discount doubled and a campaign launched — one query on coupon_code tells me if the campaign is the cause before I open any other table.'
    },
    leadershipNote: 'Staff analysts read net revenue declining with orders stable as a P&L mechanics problem and go straight to the formula. The coupon campaign is the obvious hypothesis but it must be confirmed with data — campaign launches and metric changes co-occurring are sometimes coincidental. The RTO increase is the second concern: 3pp sounds small but at scale it is material, and it compounds with discount burn on the same orders. The leadership framing is unit economics trajectory — is this a one-month campaign overspend (fixable) or a structural mix shift toward lower-margin orders (strategic)?',
    spokenSummary: 'Orders are flat but net revenue is down 18% — so this is a per-order economics problem. Revenue per order equals fulfillment fee plus ad revenue minus logistics, discount, and RTO loss. Logistics is flat, so I\'m looking at discount burn and RTO. Discount per order doubled and a coupon campaign just launched this month — I\'d pull discount by coupon_code to confirm the campaign is driving it. RTO up 3pp is secondary but material at scale. Fix: tighten coupon eligibility with a conversion impact model, and run prepaid nudges in high-RTO pincodes. Guardrail: don\'t cut discounts without modeling what happens to conversion for COD users.',
  },

  // ─────────────────────────────────────────────
  // RCA27 — Orders down, sessions stable
  // ─────────────────────────────────────────────
  {
    id: 'RCA27',
    title: 'Orders Down 14% — Sessions Flat',
    subtitle: 'Crafted · Marketplace · Conversion Funnel',
    difficulty: 'senior',
    isFree: false,
    domain: 'marketplace',
    context: {
      metricMovement: 'Orders dropped 14% WoW. Sessions are flat. No experiment running.',
      businessImpact: 'A sustained 14% order decline at current session volume represents a significant GMV loss if the CVR drop is structural rather than temporary.',
      timeWindow: 'Drop observed over the past 7 days vs the prior 7-day baseline.',
      knownFacts: [
        'Sessions: flat WoW across all platforms',
        'Orders: down 14% WoW',
        'No A/B test or product release in the past 10 days',
        'A platform-wide seller fee restructuring went live 10 days ago',
        'GMV per item is up approximately 12% — sellers appear to have raised prices'
      ]
    },
    diagnosisSteps: [
      {
        id: 'decomp',
        stepNumber: 1,
        label: 'Decompose the Funnel',
        prompt: 'Sessions are flat but orders are down 14%. What is the right first decomposition?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Break CVR by funnel stage: browse → PDP → Add-to-Cart → checkout → payment. Sessions stable means CVR is the driver — find the stage where the drop-off increased.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Correct. Sessions flat + orders down = CVR drop. The funnel-stage decomposition immediately localises the breakpoint. Once you find which stage dropped, the mechanism narrows significantly: PDP-to-ATC drop implies a demand or price problem; ATC-to-checkout drop implies a UX or friction problem; checkout-to-payment drop implies a payment or trust problem.'
          },
          {
            id: 'b',
            label: 'Segment orders by category to find which category lost volume most.',
            isCorrect: false,
            level: 'partial',
            feedback: 'Category segmentation is useful as a second step to understand concentration — but it skips the funnel decomposition. Without knowing where in the funnel the drop occurred, you don\'t know whether the category view tells you about demand shifts or a product/pricing issue. Do the funnel decomposition first, then slice by category to confirm concentration.'
          },
          {
            id: 'c',
            label: 'Check for a data pipeline issue — a 14% drop with flat sessions could be a logging anomaly.',
            isCorrect: false,
            level: 'partial',
            feedback: 'Data quality checks matter, but this is too cautious given that we have corroborating signal: GMV per item is up 12%, which is consistent with a real behavioral change (price increase → lower conversion), not a logging artifact. A logging anomaly would not also show GMV per item rising. Funnel decomposition is the right first move.'
          }
        ]
      },
      {
        id: 'isolate',
        stepNumber: 2,
        label: 'Isolate the Driver',
        prompt: 'Funnel analysis shows PDP-to-ATC dropped 9pp on mobile. ATC-to-checkout is flat. Three hypotheses: (a) product page quality degraded, (b) price shift — seller fee restructuring prompted sellers to raise prices 8–15%, (c) inventory thinning in top categories. Which hypothesis is most supported by available evidence?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Price shift — the seller fee restructuring 10 days ago and the 12% GMV-per-item increase together indicate sellers raised prices, reducing buyer willingness to add to cart.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Correct. The timing is exact: fee restructuring 10 days ago, order drop starts around the same time, GMV per item up 12%. That is a coherent price-elasticity story. Buyers are landing on PDPs but not adding to cart because prices are higher. This is not a product quality or inventory problem — it is demand responding to a price change. Confirm by segmenting ATC rate by item price tier: if premium-tier items show the biggest ATC drop, price elasticity is the mechanism.'
          },
          {
            id: 'b',
            label: 'Product page quality degraded — PDP-to-ATC drops usually signal content issues like images or descriptions.',
            isCorrect: false,
            level: 'partial',
            feedback: 'PDP content degradation is a plausible hypothesis in isolation, but it does not explain the timing (correlated with fee restructuring) or the GMV-per-item increase (content issues don\'t raise GMV per item). When a stronger, better-timed hypothesis is available, the weaker one requires additional evidence. The price shift hypothesis accounts for all three signals simultaneously.'
          },
          {
            id: 'c',
            label: 'Inventory thinning — top categories may have less selection, reducing buyer ability to find items they want.',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Inventory thinning would show up as a browse-to-PDP decline (buyers can\'t find the right item) or a longer session-to-ATC time, not a PDP-to-ATC drop. If buyers are reaching PDPs at the same rate and then not adding to cart, the problem is at the decision point — price or perceived value — not at the discovery stage.'
          }
        ]
      },
      {
        id: 'recommendation',
        stepNumber: 3,
        label: 'Recommendation',
        prompt: 'Price elasticity is the most likely mechanism. Sellers raised prices following the fee restructuring. What is the right recommendation?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Segment ATC drop by item price tier to confirm price elasticity. Share conversion benchmarks with sellers showing impact by price band. Monitor for 2 more weeks before any product intervention — this is a seller behaviour response, not a product bug.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Correct framing. This is not a product bug — it is a demand response to a pricing change. The right action is: (1) confirm the mechanism with price-tier segmentation, (2) give sellers data so they can make informed repricing decisions, and (3) avoid premature product intervention that treats a price signal as a UX problem. If sellers see that the 12% price increase is causing a 9pp ATC drop, many will self-correct.'
          },
          {
            id: 'b',
            label: 'Launch an A/B test on the product page to recover ATC rate — test new layouts, image size, and social proof elements.',
            isCorrect: false,
            level: 'wrong',
            feedback: 'This is the failure mode the case is testing for. Running a product page A/B test when the mechanism is a price shift wastes experimentation cycles and delays the real fix. The drop is not caused by page layout — it is caused by buyers being unwilling to pay higher prices. No UX change will recover demand that was lost to a price increase.'
          },
          {
            id: 'c',
            label: 'Roll back the seller fee restructuring to restore original pricing dynamics and recover CVR.',
            isCorrect: false,
            level: 'partial',
            feedback: 'Rolling back fee restructuring is an overreaction before confirming the mechanism. First, the connection between the fee change and the CVR drop is still a hypothesis (though a strong one). Second, fee restructuring is a platform-level business decision — reversing it based on a 7-day CVR drop without modelling the economics would be premature. Confirm the mechanism first, share data with sellers, and let the market adjust before considering structural policy changes.'
          }
        ]
      }
    ],
    leadershipNote: 'The weak answer is "CVR dropped, let\'s A/B test the product page." The right answer names the mechanism before prescribing a fix — price shift changed demand, not product quality. Never say you\'d look at the data; say you\'d pull ATC rate by GMV tier to confirm price elasticity is the mechanism. Senior analysts distinguish between a product bug (you fix the product) and a price signal (you give sellers data and let the market respond).',
    spokenSummary: 'Orders down 14%, sessions flat — this is a CVR problem, not a traffic problem. Funnel breakpoint is PDP-to-ATC, and it tracked exactly with the seller fee restructuring 10 days ago. Sellers raised prices, buyers are adding to cart less. Not a product bug — a price elasticity signal. Next step: segment ATC drop by item price tier to confirm, then share conversion benchmarks with sellers.',
  },

  // ─────────────────────────────────────────────
  // RCA28 — RTO spike in Tier 2/3 cities
  // ─────────────────────────────────────────────
  {
    id: 'RCA28',
    title: 'RTO Spike in Tier 2/3 Cities',
    subtitle: 'Crafted · Marketplace · Logistics & Delivery',
    difficulty: 'senior',
    isFree: false,
    domain: 'marketplace',
    context: {
      metricMovement: 'Return-to-origin (RTO) rate — orders shipped but never delivered, returned to seller — spiked from 18% to 27% in Tier 2/3 cities over 3 weeks.',
      businessImpact: 'A 9pp RTO increase in Tier 2/3 cities adds significant reverse logistics cost and reduces seller trust. At scale, sustained RTO above 25% causes sellers to limit inventory in those cities.',
      timeWindow: '3-week trend. Tier 1 cities (Mumbai, Delhi, Bangalore) are flat at 16%.',
      knownFacts: [
        'Tier 1 RTO rate: 16% — flat over the same 3 weeks',
        'Tier 2/3 RTO rate: 18% → 27% over 3 weeks',
        'Crafted uses 3 logistics partners; Carrier B handles 70% of Tier 2/3 volume',
        'No new seller fee or COD policy changes in the past 30 days',
        'COD orders represent 74% of Tier 2/3 order volume'
      ]
    },
    diagnosisSteps: [
      {
        id: 'decomp',
        stepNumber: 1,
        label: 'Geographic Decomposition',
        prompt: 'RTO is up only in Tier 2/3 cities. Tier 1 is flat. What is the right first decomposition to understand whether this is a geography problem or an operations problem?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Pull RTO rate by carrier × city tier. Carrier B handles 70% of Tier 2/3 — if Carrier B\'s RTO rate spiked and Carrier A\'s did not in the same cities, this is a carrier operations problem, not a market demand problem.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Correct. Geographic segmentation alone tells you where — carrier segmentation tells you why. If Carrier B has high RTO and Carrier A has flat RTO in the same Tier 2/3 cities, the geography is a coincidence of carrier coverage, not a demand signal. One query on RTO rate grouped by carrier × city tier resolves the diagnosis in minutes.'
          },
          {
            id: 'b',
            label: 'Segment RTO by product category — some categories (fashion, electronics) have structural return propensity and may explain the Tier 2/3 spike.',
            isCorrect: false,
            level: 'partial',
            feedback: 'Category segmentation is a valid second step, but it skips the carrier decomposition. If Carrier B is driving the spike, no category segmentation will explain it — the mix shift would need to be specifically in categories Carrier B handles. Start with the carrier split, which is the most structural variable given that Carrier B handles 70% of the affected volume.'
          },
          {
            id: 'c',
            label: 'Tier 2/3 buyers are structurally different — lower trust, higher COD refusal, lower digital adoption. Attribute to market characteristics.',
            isCorrect: false,
            level: 'wrong',
            feedback: 'Attributing a 3-week spike to structural market characteristics is a failure of diagnosis. Market characteristics don\'t change in 3 weeks — logistics operations do. If Tier 2/3 buyers were structurally high-RTO, the rate would have been 27% historically, not 18%. The spike needs an operational explanation, not a demographic one.'
          }
        ]
      },
      {
        id: 'isolate',
        stepNumber: 2,
        label: 'Isolate the Mechanism',
        prompt: 'Carrier B RTO rate in Tier 2/3 went from 19% to 31%. Carrier A in the same cities: flat at 17%. Carrier B\'s RTO reason codes: "address not found" up 40%, "buyer refused delivery" up 25%, "out-for-delivery exceeded SLA" up 18%. Which reason code is most actionable?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: '"Buyer refused delivery" — up 25%. This is the most actionable signal: buyer refusal at door is often driven by COD amount disputes or wrong-expectation setting, which can be addressed directly rather than through carrier ops.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Correct prioritization. "Buyer refused delivery" is a demand-side signal — the buyer was present but chose not to accept the order. This typically means either (a) the COD amount at door was higher than expected, (b) the buyer changed their mind (impulse orders), or (c) a product quality concern. Each hypothesis is addressable: cross-check with recent COD disclosure changes, look at COD share in Carrier B Tier 2/3 vs baseline, and check if refused-delivery orders correlate with specific price points.'
          },
          {
            id: 'b',
            label: '"Address not found" — up 40%, the largest percentage increase. Fix address matching before the others.',
            isCorrect: false,
            level: 'partial',
            feedback: '"Address not found" is a real ops/tech problem worth fixing, but it is slower to address (requires geocoding improvements, address verification at checkout) and has a longer feedback loop. "Buyer refused delivery" can be investigated and addressed faster — if it\'s a COD amount disclosure issue, a checkout copy change can be tested in days. Sequence by actionability, not just magnitude.'
          },
          {
            id: 'c',
            label: '"Out-for-delivery exceeded SLA" — if Carrier B is losing SLA compliance, that explains all the other metrics cascading.',
            isCorrect: false,
            level: 'wrong',
            feedback: 'SLA breach can contribute to buyer refusal (buyer is no longer home or has already reordered elsewhere), but it does not cause "address not found" to rise. These are operationally distinct failure modes. SLA breach at 18% increase is the smallest of the three signals and is the least directly actionable for RTO reduction in the near term.'
          }
        ]
      },
      {
        id: 'recommendation',
        stepNumber: 3,
        label: 'Recommendation',
        prompt: 'Carrier B is the primary driver. "Buyer refused delivery" is the most actionable signal, likely COD-related. What is the right recommendation?',
        type: 'single',
        options: [
          {
            id: 'a',
            label: 'Two parallel tracks: (1) Investigate COD fee disclosure in Carrier B Tier 2/3 flows immediately — if COD amount at door diverges from checkout estimate, fix the disclosure. Run prepaid nudge for repeat-RTO buyer cohort with a small incentive. (2) Escalate Carrier B "address not found" as a separate ops workstream with geocoding improvements.',
            isCorrect: true,
            level: 'strong',
            feedback: 'Correct structure. Two operationally distinct problems require two tracks. The COD disclosure track is fast (checkout copy + nudge experiment) and addresses the most actionable signal. The address-not-found track is slower (geocoding, address verification at entry) but is the largest volume problem. Running them in parallel avoids the false choice of fixing one and ignoring the other.'
          },
          {
            id: 'b',
            label: 'Replace Carrier B in Tier 2/3 cities with Carrier A to eliminate the operational problem.',
            isCorrect: false,
            level: 'partial',
            feedback: 'Carrier switching is a blunt instrument that may not be feasible in 3 weeks and does not address the underlying issues (COD disputes, address quality) that will affect any carrier. If COD amount disclosure is the root cause, Carrier A would face the same refusal rate in Tier 2/3. Escalating within Carrier B with specific SLA and reason code targets is a faster and more targeted intervention.'
          },
          {
            id: 'c',
            label: 'Require prepaid-only orders in Tier 2/3 cities to eliminate COD-related refusals.',
            isCorrect: false,
            level: 'wrong',
            feedback: 'COD represents 74% of Tier 2/3 volume. Eliminating COD would destroy the majority of that market\'s order volume — the cure is far worse than the disease. The goal is to reduce COD refusals, not eliminate COD access. A targeted prepaid nudge for repeat-RTO buyers is the proportionate intervention.'
          }
        ]
      }
    ],
    leadershipNote: 'Don\'t jump to "Tier 2/3 buyers behave differently." The data shows carrier-specific, not geography-specific behavior — Carrier B is the variable, not the market. Senior analysts name the variable before attributing to culture or region. The carrier split is a single query; running it before hypothesizing about buyer behavior is the professional discipline.',
    spokenSummary: 'RTO up 9pp in Tier 2/3 — geographic signal, but it\'s actually a carrier signal. Carrier B handles 70% of that volume and its RTO went from 19% to 31%. Carrier A, same cities, flat. Within Carrier B: buyer refusal at door up 25%, tracking to COD amount disputes. Two tracks: (1) immediately investigate COD fee disclosure in Carrier B flows, (2) run prepaid nudge for repeat-RTO buyer cohort. Escalate address-not-found as a parallel ops workstream.',
  }
];

export const rcaCasesById = Object.fromEntries(rcaCases.map(c => [c.id, c]));
