// Full Loop — 5-Phase Investigation Cases
// Single quotes only. No backticks. Apostrophes escaped as \'.
// V2: 5-phase format (problem -> decomposition -> schemaDesign -> queryChain -> synthesis)

export var fullLoopCases = [
  {
    id: 'fl01',
    title: 'Checkout Conversion Drop',
    domain: 'E-commerce',
    difficulty: 'analyst',
    isFree: true,
    guestPreview: true,

    problem: {
      context: 'Your e-commerce platform processes roughly 80,000 checkout attempts per week. The payments team recently migrated UPI payment processing to a new provider. The dashboard alert fired this morning showing a sharp decline in checkout completion.',
      metric: {
        name: 'Checkout Conversion Rate',
        current: '3.2%',
        previous: '3.6%',
        change: '-12%',
        period: 'Week-over-week',
        direction: 'down',
      },
      question: 'Your dashboard shows checkout conversion rate dropped 12% week-over-week. What is your first move?',
      options: [
        { id: 'a', text: 'Segment the funnel by step to isolate where the drop occurs', correct: true },
        { id: 'b', text: 'Immediately alert the engineering team about a potential site outage', correct: false },
        { id: 'c', text: 'Check if a marketing campaign ended recently', correct: false },
      ],
      explanation: 'Before jumping to root causes, segment the funnel by step. This tells you whether the issue is at cart addition, address entry, payment, or confirmation. A 12% WoW drop is significant but does not indicate an outage. Marketing campaign changes typically affect top-of-funnel traffic, not checkout conversion specifically.',
    },

    decomposition: {
      prompt: 'Break down the checkout conversion rate drop into a MECE framework. Identify all the possible layers where this drop could originate before looking at any data.',
      keyElements: [
        'funnel step isolation',
        'payment method segmentation',
        'platform or device split',
        'traffic source quality',
        'new vs returning users',
        'geographic region',
      ],
      modelAnswer: 'A MECE decomposition of checkout CVR starts with funnel step analysis: Landing-to-PDP, PDP-to-Cart, Cart-to-Address, Address-to-Payment, Payment-to-Confirmation. For the affected step, decompose further by: (1) Payment method (UPI, credit card, debit card, net banking) to isolate provider-specific issues. (2) Platform (mobile web, desktop, iOS app, Android app) to catch device-specific regressions. (3) User type (new vs returning) to separate onboarding friction from checkout bugs. (4) Geography (region, city tier) to catch localized payment provider outages. (5) Traffic source (organic, paid, referral) to rule out traffic quality shifts. This framework ensures you cover both technical (step, method, platform) and behavioral (user type, source) dimensions without overlap.',
    },

    schemaDesign: {
      prompt: 'Design the data schema you would need to investigate a checkout conversion drop. Name the key tables and columns that would let you trace a user from landing through payment confirmation.',
      keyElements: [
        'users table with user_id, platform, city',
        'orders table with order_id, user_id, created_at, payment_method, status, amount',
        'payments table with payment_id, order_id, method, status, attempted_at, completed_at',
        'funnel_events for step-level tracking',
      ],
      modelAnswer: 'Core tables: (1) users (user_id, signup_date, platform, city) for user-level segmentation. (2) orders (order_id, user_id, created_at, payment_method, status, amount) linking users to purchase attempts. (3) payments (payment_id, order_id, method, status, attempted_at, completed_at) tracking each payment attempt with timestamps and outcome. The payments table is critical because one order can have multiple payment attempts across different methods. The status field on payments distinguishes attempted, completed, and failed states. Joining orders to payments on order_id and filtering by payment status gives you the completion rate per method. Adding the users table lets you slice by platform and geography.',
    },

    queryChain: [
      {
        prompt: 'Write a query to calculate the checkout funnel conversion rate by step for the current week versus the prior week. Identify which step shows the largest drop.',
        hints: [
          'Use the payments table to compare attempted vs completed by period',
          'Create a period flag using date comparison to split current vs prior week',
        ],
        referenceQuery: 'SELECT\n  p.method,\n  SUM(CASE WHEN p.attempted_at >= CURRENT_DATE - INTERVAL \'7 days\'\n    THEN 1 ELSE 0 END) AS this_week_attempts,\n  SUM(CASE WHEN p.attempted_at >= CURRENT_DATE - INTERVAL \'7 days\'\n    AND p.status = \'completed\' THEN 1 ELSE 0 END) AS this_week_completed,\n  ROUND(100.0 * SUM(CASE WHEN p.attempted_at >= CURRENT_DATE - INTERVAL \'7 days\'\n    AND p.status = \'completed\' THEN 1 ELSE 0 END)\n    / NULLIF(SUM(CASE WHEN p.attempted_at >= CURRENT_DATE - INTERVAL \'7 days\'\n    THEN 1 ELSE 0 END), 0), 1) AS this_week_cvr,\n  SUM(CASE WHEN p.attempted_at < CURRENT_DATE - INTERVAL \'7 days\'\n    AND p.attempted_at >= CURRENT_DATE - INTERVAL \'14 days\'\n    THEN 1 ELSE 0 END) AS last_week_attempts,\n  ROUND(100.0 * SUM(CASE WHEN p.attempted_at < CURRENT_DATE - INTERVAL \'7 days\'\n    AND p.attempted_at >= CURRENT_DATE - INTERVAL \'14 days\'\n    AND p.status = \'completed\' THEN 1 ELSE 0 END)\n    / NULLIF(SUM(CASE WHEN p.attempted_at < CURRENT_DATE - INTERVAL \'7 days\'\n    AND p.attempted_at >= CURRENT_DATE - INTERVAL \'14 days\'\n    THEN 1 ELSE 0 END), 0), 1) AS last_week_cvr\nFROM payments p\nWHERE p.attempted_at >= CURRENT_DATE - INTERVAL \'14 days\'\nGROUP BY p.method\nORDER BY this_week_cvr ASC;',
        correctQuerySqlite: 'SELECT\n  p.method,\n  SUM(CASE WHEN p.attempted_at >= date(\'2026-06-02\')\n    THEN 1 ELSE 0 END) AS this_week_attempts,\n  SUM(CASE WHEN p.attempted_at >= date(\'2026-06-02\')\n    AND p.status = \'completed\' THEN 1 ELSE 0 END) AS this_week_completed,\n  ROUND(100.0 * SUM(CASE WHEN p.attempted_at >= date(\'2026-06-02\')\n    AND p.status = \'completed\' THEN 1 ELSE 0 END)\n    / MAX(SUM(CASE WHEN p.attempted_at >= date(\'2026-06-02\')\n    THEN 1 ELSE 0 END), 1), 1) AS this_week_cvr,\n  SUM(CASE WHEN p.attempted_at < date(\'2026-06-02\')\n    AND p.attempted_at >= date(\'2026-05-26\')\n    THEN 1 ELSE 0 END) AS last_week_attempts,\n  ROUND(100.0 * SUM(CASE WHEN p.attempted_at < date(\'2026-06-02\')\n    AND p.attempted_at >= date(\'2026-05-26\')\n    AND p.status = \'completed\' THEN 1 ELSE 0 END)\n    / MAX(SUM(CASE WHEN p.attempted_at < date(\'2026-06-02\')\n    AND p.attempted_at >= date(\'2026-05-26\')\n    THEN 1 ELSE 0 END), 1), 1) AS last_week_cvr\nFROM payments p\nWHERE p.attempted_at >= date(\'2026-05-26\')\nGROUP BY p.method\nORDER BY this_week_cvr ASC;',
        insight: 'The Payment-to-Confirmation step dropped 17.5 percentage points while all other funnel stages are stable. This isolates the problem to payment processing, not traffic quality or product discovery.',
      },
      {
        prompt: 'Now drill into the payment step. Write a query to break down payment completion rate by payment method for the current week to identify which method is failing.',
        hints: [
          'Group by p.method and calculate completed / attempted ratio',
          'Filter for the current week only to focus on the active problem',
        ],
        referenceQuery: 'SELECT\n  p.method,\n  COUNT(*) AS attempts,\n  SUM(CASE WHEN p.status = \'completed\' THEN 1 ELSE 0 END) AS completed,\n  ROUND(100.0 * SUM(CASE WHEN p.status = \'completed\' THEN 1 ELSE 0 END)\n    / COUNT(*), 1) AS completion_rate\nFROM payments p\nWHERE p.attempted_at >= CURRENT_DATE - INTERVAL \'7 days\'\nGROUP BY p.method\nORDER BY completion_rate ASC;',
        correctQuerySqlite: 'SELECT\n  p.method,\n  COUNT(*) AS attempts,\n  SUM(CASE WHEN p.status = \'completed\' THEN 1 ELSE 0 END) AS completed,\n  ROUND(100.0 * SUM(CASE WHEN p.status = \'completed\' THEN 1 ELSE 0 END)\n    * 1.0 / COUNT(*), 1) AS completion_rate\nFROM payments p\nWHERE p.attempted_at >= date(\'2026-06-02\')\nGROUP BY p.method\nORDER BY completion_rate ASC;',
        insight: 'UPI completion rate crashed from 62% to 28% while credit card, debit card, and net banking remain stable. The problem is isolated to UPI payment processing.',
      },
      {
        prompt: 'Confirm whether the UPI failure is platform-specific or cross-platform by breaking down UPI completion rate by user platform.',
        hints: [
          'Join payments with users on order_id -> orders -> users to get platform',
          'Filter for method = UPI and the current week',
        ],
        referenceQuery: 'SELECT\n  u.platform,\n  COUNT(*) AS upi_attempts,\n  SUM(CASE WHEN p.status = \'completed\' THEN 1 ELSE 0 END) AS upi_completed,\n  ROUND(100.0 * SUM(CASE WHEN p.status = \'completed\' THEN 1 ELSE 0 END)\n    / COUNT(*), 1) AS upi_completion_rate\nFROM payments p\nJOIN orders o ON p.order_id = o.order_id\nJOIN users u ON o.user_id = u.user_id\nWHERE p.method = \'upi\'\n  AND p.attempted_at >= CURRENT_DATE - INTERVAL \'7 days\'\nGROUP BY u.platform\nORDER BY upi_completion_rate ASC;',
        correctQuerySqlite: 'SELECT\n  u.platform,\n  COUNT(*) AS upi_attempts,\n  SUM(CASE WHEN p.status = \'completed\' THEN 1 ELSE 0 END) AS upi_completed,\n  ROUND(100.0 * SUM(CASE WHEN p.status = \'completed\' THEN 1 ELSE 0 END)\n    * 1.0 / COUNT(*), 1) AS upi_completion_rate\nFROM payments p\nJOIN orders o ON p.order_id = o.order_id\nJOIN users u ON o.user_id = u.user_id\nWHERE p.method = \'upi\'\n  AND p.attempted_at >= date(\'2026-06-02\')\nGROUP BY u.platform\nORDER BY upi_completion_rate ASC;',
        insight: 'UPI failure rate is consistent across all platforms (mobile web, iOS, Android, desktop), confirming this is a provider-side issue with the new UPI integration, not a client-side bug.',
      },
    ],

    synthesis: {
      prompt: 'Write a stakeholder brief summarizing what happened, the root cause, business impact, and your recommended next steps.',
      keyElements: [
        'UPI payment integration failure',
        'provider migration root cause',
        'estimated lost orders per day',
        'rollback recommendation',
        'monitoring plan',
        'timeline for resolution',
      ],
      modelAnswer: 'The UPI payment integration migrated 8 days ago is failing for 72% of UPI transactions, causing overall checkout CVR to drop 12% WoW. The failure is cross-platform, confirming a provider-side issue rather than a client bug. This is estimated to cost approximately 840 lost orders per day based on current UPI attempt volume. Recommended immediate action: roll back to the previous UPI provider while engineering investigates the integration failure. Monitor CVR recovery over 48 hours post-rollback. Once the new provider issue is resolved, re-deploy with a staged rollout (10% -> 50% -> 100%) and an automated alerting threshold on UPI completion rate at 55%.',
      rubric: [
        'States the root cause clearly with evidence',
        'Quantifies the business impact in orders or revenue',
        'Proposes a concrete remediation with timeline',
        'Includes a monitoring or validation plan for the fix',
      ],
    },

    takeaway: 'Payment step drops almost always indicate a technical integration issue rather than a demand or marketing problem. Segment the funnel first, then drill into the broken step by method and platform to isolate the root cause.',
  },

  {
    id: 'fl02',
    title: 'DAU Drop on Content Platform',
    domain: 'Content / Media',
    difficulty: 'analyst',
    isFree: false,
    guestPreview: false,

    problem: {
      context: 'Your content platform has 2M daily active users across iOS, Android, and web. The product team recently shipped an iOS app update (v3.2) that included push notification framework changes. DAU has been declining gradually over the past two weeks.',
      metric: {
        name: 'Daily Active Users',
        current: '1.64M',
        previous: '2.00M',
        change: '-18%',
        period: 'Week-over-week',
        direction: 'down',
      },
      question: 'DAU fell 18% week-over-week. The decline is gradual, not a cliff. What is your first move?',
      options: [
        { id: 'a', text: 'Segment DAU by app version to see if the drop correlates with the v3.2 release', correct: true },
        { id: 'b', text: 'Check if content publishing volume decreased', correct: false },
        { id: 'c', text: 'Review competitor launches in the last 2 weeks', correct: false },
      ],
      explanation: 'A gradual decline coinciding with an app update points to a version-specific regression. Content volume changes would affect all platforms equally. Competitor launches rarely produce clean version-correlated drops. Start by segmenting DAU by app version.',
    },

    decomposition: {
      prompt: 'Decompose the DAU decline into a MECE framework covering all possible drivers before looking at data.',
      keyElements: [
        'app version segmentation',
        'platform split (iOS, Android, web)',
        'engagement channel health (push, email, organic)',
        'session quality (crashes, errors)',
        'content supply vs demand',
        'user cohort vintage',
      ],
      modelAnswer: 'MECE framework for DAU decline: (1) Platform layer: iOS vs Android vs Web to isolate platform-specific regressions. (2) Version layer: v3.2 vs prior versions on the affected platform to test whether the update is the cause. (3) Re-engagement channel layer: Push notification delivery rate, email open rate, and organic return rate to identify which re-engagement mechanism broke. (4) Session quality layer: Crash rate, ANR rate, and error rate by version to catch stability issues. (5) Content supply layer: Publishing volume, content freshness, and feed quality scores. (6) User cohort layer: New vs returning, high-frequency vs low-frequency users. This framework separates technical causes (version, crashes, channels) from product causes (content, engagement) without overlap.',
    },

    schemaDesign: {
      prompt: 'Design the tables you need to investigate a DAU drop that might be driven by an app update breaking push notifications.',
      keyElements: [
        'app_versions table with user_id, platform, app_version, updated_at',
        'daily_active_users table with date, user_id, platform, session_count',
        'push_notifications table with notification_id, user_id, sent_at, delivered, opened, platform',
      ],
      modelAnswer: 'Core tables: (1) app_versions (user_id, platform, app_version, updated_at) tracking which version each user is on and when they updated. (2) daily_active_users (date, user_id, platform, session_count, time_spent_minutes) recording daily activity for DAU calculation. (3) push_notifications (notification_id, user_id, sent_at, delivered, opened, platform) tracking the full notification funnel from send to open. The key join is app_versions to daily_active_users on user_id to compare DAU retention across versions. Then push_notifications joined on user_id lets you correlate push delivery failures with DAU drops per version.',
    },

    queryChain: [
      {
        prompt: 'Write a query to compare DAU by app version for the last 14 days. Show which version is driving the decline.',
        hints: [
          'Join daily_active_users with app_versions on user_id',
          'Group by date and app_version, count distinct users',
        ],
        referenceQuery: 'SELECT\n  av.app_version,\n  COUNT(DISTINCT CASE WHEN dau.date >= CURRENT_DATE - INTERVAL \'7 days\'\n    THEN dau.user_id END) AS this_week_dau,\n  COUNT(DISTINCT CASE WHEN dau.date < CURRENT_DATE - INTERVAL \'7 days\'\n    AND dau.date >= CURRENT_DATE - INTERVAL \'14 days\'\n    THEN dau.user_id END) AS last_week_dau\nFROM daily_active_users dau\nJOIN app_versions av ON dau.user_id = av.user_id\nWHERE dau.date >= CURRENT_DATE - INTERVAL \'14 days\'\nGROUP BY av.app_version\nORDER BY this_week_dau DESC;',
        correctQuerySqlite: 'SELECT\n  av.app_version,\n  COUNT(DISTINCT CASE WHEN dau.date >= date(\'2026-06-02\')\n    THEN dau.user_id END) AS this_week_dau,\n  COUNT(DISTINCT CASE WHEN dau.date < date(\'2026-06-02\')\n    AND dau.date >= date(\'2026-05-26\')\n    THEN dau.user_id END) AS last_week_dau\nFROM daily_active_users dau\nJOIN app_versions av ON dau.user_id = av.user_id\nWHERE dau.date >= date(\'2026-05-26\')\nGROUP BY av.app_version\nORDER BY this_week_dau DESC;',
        insight: 'Users on v3.2 show a 35% DAU decline while users still on v3.1 and earlier are stable. The drop is entirely concentrated on the new app version.',
      },
      {
        prompt: 'Now check session-level data by version. Write a query to compare average session count and crash rate by app version for the current week.',
        hints: [
          'Calculate avg session_count grouped by app_version',
          'If there is an error or crash event type, count those as well',
        ],
        referenceQuery: 'SELECT\n  av.app_version,\n  COUNT(DISTINCT dau.user_id) AS active_users,\n  ROUND(AVG(dau.session_count), 2) AS avg_sessions,\n  ROUND(AVG(dau.time_spent_minutes), 1) AS avg_time_spent\nFROM daily_active_users dau\nJOIN app_versions av ON dau.user_id = av.user_id\nWHERE dau.date >= CURRENT_DATE - INTERVAL \'7 days\'\nGROUP BY av.app_version\nORDER BY av.app_version;',
        correctQuerySqlite: 'SELECT\n  av.app_version,\n  COUNT(DISTINCT dau.user_id) AS active_users,\n  ROUND(AVG(dau.session_count), 2) AS avg_sessions,\n  ROUND(AVG(dau.time_spent_minutes), 1) AS avg_time_spent\nFROM daily_active_users dau\nJOIN app_versions av ON dau.user_id = av.user_id\nWHERE dau.date >= date(\'2026-06-02\')\nGROUP BY av.app_version\nORDER BY av.app_version;',
        insight: 'V3.2 users who do open the app have similar session counts and time spent as v3.1 users. The issue is not in-app engagement quality but rather users not opening the app at all, pointing to a re-engagement channel failure.',
      },
      {
        prompt: 'Check push notification delivery by app version. Write a query comparing push delivery rate and open rate by version for the past 7 days.',
        hints: [
          'Join push_notifications with app_versions on user_id',
          'Calculate delivered/sent ratio and opened/delivered ratio by version',
        ],
        referenceQuery: 'SELECT\n  av.app_version,\n  COUNT(*) AS notifications_sent,\n  SUM(CASE WHEN pn.delivered = TRUE THEN 1 ELSE 0 END) AS delivered,\n  ROUND(100.0 * SUM(CASE WHEN pn.delivered = TRUE THEN 1 ELSE 0 END)\n    / COUNT(*), 1) AS delivery_rate,\n  SUM(CASE WHEN pn.opened = TRUE THEN 1 ELSE 0 END) AS opened,\n  ROUND(100.0 * SUM(CASE WHEN pn.opened = TRUE THEN 1 ELSE 0 END)\n    / NULLIF(SUM(CASE WHEN pn.delivered = TRUE THEN 1 ELSE 0 END), 0), 1) AS open_rate\nFROM push_notifications pn\nJOIN app_versions av ON pn.user_id = av.user_id\nWHERE pn.sent_at >= CURRENT_DATE - INTERVAL \'7 days\'\nGROUP BY av.app_version\nORDER BY delivery_rate ASC;',
        correctQuerySqlite: 'SELECT\n  av.app_version,\n  COUNT(*) AS notifications_sent,\n  SUM(CASE WHEN pn.delivered = 1 THEN 1 ELSE 0 END) AS delivered,\n  ROUND(100.0 * SUM(CASE WHEN pn.delivered = 1 THEN 1 ELSE 0 END)\n    * 1.0 / COUNT(*), 1) AS delivery_rate,\n  SUM(CASE WHEN pn.opened = 1 THEN 1 ELSE 0 END) AS opened,\n  ROUND(100.0 * SUM(CASE WHEN pn.opened = 1 THEN 1 ELSE 0 END)\n    * 1.0 / MAX(SUM(CASE WHEN pn.delivered = 1 THEN 1 ELSE 0 END), 1), 1) AS open_rate\nFROM push_notifications pn\nJOIN app_versions av ON pn.user_id = av.user_id\nWHERE pn.sent_at >= date(\'2026-06-02\')\nGROUP BY av.app_version\nORDER BY delivery_rate ASC;',
        insight: 'Push notification delivery rate on v3.2 dropped from 84% to 31% while v3.1 remains at 83%. The v3.2 update broke push notification registration, causing most users to stop receiving re-engagement notifications.',
      },
    ],

    synthesis: {
      prompt: 'Write a brief for the mobile engineering team explaining the root cause, user impact, and recommended fix.',
      keyElements: [
        'v3.2 push notification registration broken',
        'delivery rate drop from 84% to 31%',
        'DAU impact quantified',
        'hotfix recommendation',
        're-registration prompt for affected users',
        'monitoring plan',
      ],
      modelAnswer: 'The v3.2 iOS app update broke push notification registration, causing delivery rates to drop from 84% to 31% for users on the new version. Since push notifications drive 35-45% of daily opens, this has resulted in an 18% DAU decline affecting approximately 360K daily users. The gradual pattern matches because users who were already active continued their sessions, but lapsed users were never pulled back. Recommended fix: ship an emergency hotfix to restore push registration in the next build, and send a server-side re-registration prompt to all v3.2 users. Monitor push delivery rate recovery and DAU for the v3.2 cohort over 7 days post-fix.',
      rubric: [
        'Identifies the specific technical failure with version and mechanism',
        'Quantifies the user impact in DAU and affected users',
        'Proposes a concrete remediation with re-registration step',
        'Includes a monitoring and recovery timeline',
      ],
    },

    takeaway: 'When DAU declines gradually rather than suddenly, suspect a re-engagement channel failure. Push notification health is the most overlooked driver of DAU trends on mobile platforms.',
  },

  {
    id: 'fl03',
    title: 'Search CTR Down, Revenue Up',
    domain: 'Marketplace',
    difficulty: 'senior',
    isFree: false,
    guestPreview: false,

    problem: {
      context: 'Your marketplace search team recently deployed a new ranking model optimized for GMV. Search handles 4M queries per day across head and tail queries. The metrics dashboard now shows two metrics moving in opposite directions.',
      metric: {
        name: 'Search CTR / GMV per Session',
        current: '18.4% CTR / $42.30 GMV',
        previous: '19.4% CTR / $41.10 GMV',
        change: 'CTR -5% / GMV +3%',
        period: 'Week-over-week',
        direction: 'down',
      },
      question: 'Search CTR is declining 5% while GMV per session is up 3%. These metrics are moving in opposite directions. What is your first move?',
      options: [
        { id: 'a', text: 'Break down CTR by result position to understand where clicks are being lost', correct: true },
        { id: 'b', text: 'Assume the ranking model is broken and revert to the previous version', correct: false },
        { id: 'c', text: 'Check if search volume changed to rule out a traffic quality issue', correct: false },
      ],
      explanation: 'When CTR and GMV move in opposite directions, it usually indicates a composition change in how users interact with search results. Breaking down by result position reveals whether clicks are shifting to different positions. Reverting without understanding the tradeoff is premature since GMV is up. Search volume changes affect absolute counts, not CTR as a rate.',
    },

    decomposition: {
      prompt: 'Decompose the CTR-down-GMV-up paradox into a MECE framework. What are all the possible explanations for these metrics diverging?',
      keyElements: [
        'ranking model change effect',
        'position-level click distribution',
        'AOV by result position',
        'head vs tail query segmentation',
        'organic vs paid/ad result mix',
        'user intent segmentation',
      ],
      modelAnswer: 'MECE decomposition of CTR-GMV divergence: (1) Ranking composition: The ranking model may be surfacing higher-AOV items in top positions, concentrating clicks on fewer but more valuable results. (2) Position-level analysis: CTR by position bucket (1-3, 4-6, 7-10) reveals whether head positions gained at the expense of tail positions. (3) Query type split: Head queries (high volume, generic) vs tail queries (low volume, specific) may respond differently to ranking changes. (4) Ad mix shift: If the share of sponsored/paid results in top positions increased, organic CTR may decline while monetization improves. (5) User intent: Browse-mode users vs buy-mode users clicking different result types. (6) Category mix: Shifts in query category distribution toward higher-AOV categories could explain the GMV increase.',
    },

    schemaDesign: {
      prompt: 'Design the schema to investigate a search ranking tradeoff between CTR and revenue.',
      keyElements: [
        'search_events table with search_id, user_id, query, query_type, searched_at',
        'search_results table with search_id, product_id, position, is_sponsored',
        'search_clicks table linking clicks to positions',
        'orders table with product_id and amount',
      ],
      modelAnswer: 'Core tables: (1) search_events (search_id, user_id, query, query_type, searched_at, result_count) capturing each search with query classification. (2) search_results (search_id, product_id, position, is_sponsored) mapping every result shown with its position and organic/paid flag. (3) search_clicks (click_id, search_id, product_id, position, clicked_at) recording which results were clicked and their position. (4) orders (order_id, user_id, product_id, amount, created_at) linking clicks to purchases for revenue attribution. Joining search_clicks to orders via product_id connects click behavior to revenue. The query_type field on search_events lets you split head vs tail queries.',
    },

    queryChain: [
      {
        prompt: 'Write a query to calculate CTR by result position bucket (1-3, 4-6, 7-10) comparing this week to last week.',
        hints: [
          'Use a CASE expression to bucket positions into ranges',
          'CTR = clicks / impressions for each position bucket',
        ],
        referenceQuery: 'SELECT\n  CASE\n    WHEN sr.position BETWEEN 1 AND 3 THEN \'1-3\'\n    WHEN sr.position BETWEEN 4 AND 6 THEN \'4-6\'\n    WHEN sr.position BETWEEN 7 AND 10 THEN \'7-10\'\n  END AS position_bucket,\n  CASE WHEN se.searched_at >= CURRENT_DATE - INTERVAL \'7 days\'\n    THEN \'this_week\' ELSE \'last_week\' END AS period,\n  COUNT(*) AS impressions,\n  COUNT(sc.click_id) AS clicks,\n  ROUND(100.0 * COUNT(sc.click_id) / COUNT(*), 1) AS ctr\nFROM search_events se\nJOIN search_results sr ON se.search_id = sr.search_id\nLEFT JOIN search_clicks sc ON sr.search_id = sc.search_id\n  AND sr.position = sc.position\nWHERE se.searched_at >= CURRENT_DATE - INTERVAL \'14 days\'\nGROUP BY position_bucket, period\nORDER BY position_bucket, period;',
        correctQuerySqlite: 'SELECT\n  CASE\n    WHEN sr.position BETWEEN 1 AND 3 THEN \'1-3\'\n    WHEN sr.position BETWEEN 4 AND 6 THEN \'4-6\'\n    WHEN sr.position BETWEEN 7 AND 10 THEN \'7-10\'\n  END AS position_bucket,\n  CASE WHEN se.searched_at >= date(\'2026-06-02\')\n    THEN \'this_week\' ELSE \'last_week\' END AS period,\n  COUNT(*) AS impressions,\n  COUNT(sc.click_id) AS clicks,\n  ROUND(100.0 * COUNT(sc.click_id) * 1.0 / COUNT(*), 1) AS ctr\nFROM search_events se\nJOIN search_results sr ON se.search_id = sr.search_id\nLEFT JOIN search_clicks sc ON sr.search_id = sc.search_id\n  AND sr.position = sc.position\nWHERE se.searched_at >= date(\'2026-05-26\')\nGROUP BY position_bucket, period\nORDER BY position_bucket, period;',
        insight: 'Positions 1-3 CTR increased 14% while positions 4-6 dropped 23% and positions 7-10 dropped 48%. The overall CTR decline is driven by tail positions losing clicks while head positions gained.',
      },
      {
        prompt: 'Now calculate the AOV of clicked items by position bucket to explain the revenue increase despite fewer total clicks.',
        hints: [
          'Join search_clicks to orders via product_id to get purchase amounts',
          'Average the order amount by position bucket',
        ],
        referenceQuery: 'SELECT\n  CASE\n    WHEN sc.position BETWEEN 1 AND 3 THEN \'1-3\'\n    WHEN sc.position BETWEEN 4 AND 6 THEN \'4-6\'\n    WHEN sc.position BETWEEN 7 AND 10 THEN \'7-10\'\n  END AS position_bucket,\n  COUNT(*) AS clicks,\n  ROUND(AVG(o.amount), 2) AS avg_order_value,\n  ROUND(SUM(o.amount), 0) AS total_revenue\nFROM search_clicks sc\nJOIN orders o ON sc.product_id = o.product_id\n  AND o.created_at >= sc.clicked_at\n  AND o.created_at < sc.clicked_at + INTERVAL \'1 day\'\nWHERE sc.clicked_at >= CURRENT_DATE - INTERVAL \'7 days\'\nGROUP BY position_bucket\nORDER BY position_bucket;',
        correctQuerySqlite: 'SELECT\n  CASE\n    WHEN sc.position BETWEEN 1 AND 3 THEN \'1-3\'\n    WHEN sc.position BETWEEN 4 AND 6 THEN \'4-6\'\n    WHEN sc.position BETWEEN 7 AND 10 THEN \'7-10\'\n  END AS position_bucket,\n  COUNT(*) AS clicks,\n  ROUND(AVG(o.amount), 2) AS avg_order_value,\n  ROUND(SUM(o.amount), 0) AS total_revenue\nFROM search_clicks sc\nJOIN orders o ON sc.product_id = o.product_id\n  AND o.created_at >= sc.clicked_at\n  AND o.created_at < date(sc.clicked_at, \'+1 day\')\nWHERE sc.clicked_at >= date(\'2026-06-02\')\nGROUP BY position_bucket\nORDER BY position_bucket;',
        insight: 'Top-position clicks have an AOV of $68.40 vs $18.90 for positions 7-10. The new ranking model surfaces higher-value items in top positions, so fewer total clicks generate more revenue per click.',
      },
      {
        prompt: 'Split the analysis by query type (head vs tail) to see if the ranking change impacts different query types differently.',
        hints: [
          'Use se.query_type to separate head and tail queries',
          'Calculate CTR and AOV for each query_type and position_bucket combination',
        ],
        referenceQuery: 'SELECT\n  se.query_type,\n  CASE\n    WHEN sc.position BETWEEN 1 AND 3 THEN \'1-3\'\n    WHEN sc.position BETWEEN 4 AND 6 THEN \'4-6\'\n    WHEN sc.position BETWEEN 7 AND 10 THEN \'7-10\'\n  END AS position_bucket,\n  COUNT(*) AS impressions,\n  COUNT(sc.click_id) AS clicks,\n  ROUND(100.0 * COUNT(sc.click_id) / COUNT(*), 1) AS ctr,\n  ROUND(AVG(CASE WHEN sc.click_id IS NOT NULL THEN p.price END), 2) AS avg_aov\nFROM search_events se\nJOIN search_results sr ON se.search_id = sr.search_id\nLEFT JOIN search_clicks sc ON sr.search_id = sc.search_id\n  AND sr.position = sc.position\nLEFT JOIN products p ON sc.product_id = p.product_id\nWHERE se.searched_at >= CURRENT_DATE - INTERVAL \'7 days\'\nGROUP BY se.query_type, position_bucket\nORDER BY se.query_type, position_bucket;',
        correctQuerySqlite: 'SELECT\n  se.query_type,\n  CASE\n    WHEN sc.position BETWEEN 1 AND 3 THEN \'1-3\'\n    WHEN sc.position BETWEEN 4 AND 6 THEN \'4-6\'\n    WHEN sc.position BETWEEN 7 AND 10 THEN \'7-10\'\n  END AS position_bucket,\n  COUNT(*) AS impressions,\n  COUNT(sc.click_id) AS clicks,\n  ROUND(100.0 * COUNT(sc.click_id) * 1.0 / COUNT(*), 1) AS ctr,\n  ROUND(AVG(CASE WHEN sc.click_id IS NOT NULL THEN p.price END), 2) AS avg_aov\nFROM search_events se\nJOIN search_results sr ON se.search_id = sr.search_id\nLEFT JOIN search_clicks sc ON sr.search_id = sc.search_id\n  AND sr.position = sc.position\nLEFT JOIN products p ON sc.product_id = p.product_id\nWHERE se.searched_at >= date(\'2026-06-02\')\nGROUP BY se.query_type, position_bucket\nORDER BY se.query_type, position_bucket;',
        insight: 'Tail query CTR in lower positions dropped 48% while head query CTR is relatively stable. The new ranking model hurts tail queries the most because high-AOV items surfaced in top positions are less relevant for niche searches.',
      },
    ],

    synthesis: {
      prompt: 'Write a brief for the search team lead that acknowledges the tradeoff and proposes a path forward. This is not a simple bug report.',
      keyElements: [
        'frames as tradeoff not bug',
        'head vs tail query divergence',
        'GMV benefit quantified',
        'tail query satisfaction risk',
        'conditional model deployment proposal',
        'experiment design for validation',
      ],
      modelAnswer: 'The new ranking model increases GMV per session by 3% by surfacing higher-AOV items in top positions, but at the cost of a 5% CTR decline concentrated in positions 4-10. The tradeoff is most pronounced on tail queries, where CTR in lower positions dropped 48% and users searching for niche or lower-priced items may not find relevant results. I recommend running a controlled experiment comparing the new model against the old with three arms: old model (control), new model everywhere (treatment A), and new model for head queries only (treatment B). The dual-primary metrics should be GMV per session and search CTR, with tail-query satisfaction as a guardrail. This lets us capture the revenue upside on head queries while preserving relevance for tail queries.',
      rubric: [
        'Frames the situation as a tradeoff, not a bug',
        'Quantifies both the revenue benefit and the satisfaction cost',
        'Proposes a segmented approach rather than binary ship/revert',
        'Specifies experiment design with clear metrics',
      ],
    },

    takeaway: 'When two metrics move in opposite directions, look for a composition change. The correct resolution for tradeoff situations is often a conditional ship: apply the optimization where it helps and preserve the old behavior where it hurts.',
  },

  {
    id: 'fl04',
    title: 'Subscription Churn Spike',
    domain: 'SaaS',
    difficulty: 'senior',
    isFree: false,
    guestPreview: false,

    problem: {
      context: 'Your B2B SaaS platform serves 84,000 subscribers across monthly and annual plans at three tiers (Starter, Pro, Enterprise). The pricing team raised monthly plan prices by 20% last month. Churn has spiked sharply in the latest billing cycle.',
      metric: {
        name: 'Monthly Churn Rate',
        current: '6.8%',
        previous: '4.2%',
        change: '+62%',
        period: 'Month-over-month',
        direction: 'up',
      },
      question: 'Monthly churn rate jumped from 4.2% to 6.8%, a 62% relative increase. This appeared over the last billing cycle. What is your first move?',
      options: [
        { id: 'a', text: 'Segment churn by plan change history, plan type, and tenure to find where the spike is concentrated', correct: true },
        { id: 'b', text: 'Survey recently churned users to understand their reasons', correct: false },
        { id: 'c', text: 'Check if a recent product release introduced bugs that drove users away', correct: false },
      ],
      explanation: 'Churn spikes are rarely uniform. Segmenting by plan change history (who switched plans), plan type (monthly vs annual), and tenure reveals whether this is a pricing issue, product issue, or onboarding issue. Surveys are slow and biased. Product bugs would show in engagement metrics before churn.',
    },

    decomposition: {
      prompt: 'Decompose the churn spike into a MECE framework. Consider all possible drivers of a 62% churn increase in a single billing cycle.',
      keyElements: [
        'plan change history (switchers vs non-switchers)',
        'plan type (monthly vs annual)',
        'tenure cohort analysis',
        'pricing change impact',
        'feature usage pre-churn',
        'support ticket correlation',
      ],
      modelAnswer: 'MECE decomposition of churn spike: (1) Plan dynamics: Segment by plan change history to separate users who switched plans from those who stayed put. Switchers (annual-to-monthly, monthly-to-annual, tier changes) may have different churn drivers than stable subscribers. (2) Pricing exposure: Which users were exposed to the price increase? Annual plan users are shielded until renewal; monthly users see it immediately; switchers experience the delta between old and new rates. (3) Tenure analysis: New users (<3 months) vs mid-tenure (3-12 months) vs long-tenure (12+) to catch onboarding vs value-realization vs renewal timing issues. (4) Feature engagement: Usage patterns in the 30 days pre-churn to identify whether low-engagement users churn more. (5) Support signal: Billing-related support tickets correlated with churn to identify complaint-driven cancellations.',
    },

    schemaDesign: {
      prompt: 'Design the schema to investigate a churn spike potentially driven by a pricing change affecting plan switchers.',
      keyElements: [
        'subscriptions table with plan_type, monthly_price, status, dates',
        'plan_changes table tracking old and new plan with price delta',
        'feature_usage table for pre-churn engagement',
        'support_tickets table for billing complaints',
      ],
      modelAnswer: 'Core tables: (1) subscriptions (subscription_id, user_id, plan_type, plan_tier, monthly_price, started_at, ended_at, status) tracking each subscription lifecycle. (2) plan_changes (change_id, user_id, old_plan_type, new_plan_type, old_price, new_price, changed_at) recording every plan switch with the price delta. (3) feature_usage (user_id, feature_name, usage_count, last_used_at) for engagement analysis. (4) support_tickets (ticket_id, user_id, category, created_at, resolved_at) to correlate billing complaints with churn. The critical join is subscriptions LEFT JOIN plan_changes to classify users as switchers vs non-switchers, then compare churn rates across these groups.',
    },

    queryChain: [
      {
        prompt: 'Write a query to calculate churn rate by plan change status (switched vs no change) and current plan type for the last 30 days.',
        hints: [
          'LEFT JOIN subscriptions with plan_changes to classify users',
          'A user who churned has status = churned and ended_at in the last 30 days',
        ],
        referenceQuery: 'WITH user_segments AS (\n  SELECT\n    s.user_id,\n    s.plan_type,\n    s.status,\n    CASE WHEN pc.change_id IS NOT NULL THEN \'switched\'\n      ELSE \'no_change\' END AS change_status,\n    CASE WHEN pc.change_id IS NOT NULL\n      THEN s.monthly_price - pc.old_price ELSE 0 END AS price_delta\n  FROM subscriptions s\n  LEFT JOIN plan_changes pc ON s.user_id = pc.user_id\n  WHERE s.started_at >= CURRENT_DATE - INTERVAL \'90 days\'\n)\nSELECT\n  change_status,\n  plan_type,\n  COUNT(*) AS total_users,\n  SUM(CASE WHEN status = \'churned\' THEN 1 ELSE 0 END) AS churned,\n  ROUND(100.0 * SUM(CASE WHEN status = \'churned\' THEN 1 ELSE 0 END)\n    / COUNT(*), 1) AS churn_rate,\n  ROUND(AVG(price_delta), 2) AS avg_price_delta\nFROM user_segments\nGROUP BY change_status, plan_type\nORDER BY churn_rate DESC;',
        correctQuerySqlite: 'WITH user_segments AS (\n  SELECT\n    s.user_id,\n    s.plan_type,\n    s.status,\n    CASE WHEN pc.change_id IS NOT NULL THEN \'switched\'\n      ELSE \'no_change\' END AS change_status,\n    CASE WHEN pc.change_id IS NOT NULL\n      THEN s.monthly_price - pc.old_price ELSE 0 END AS price_delta\n  FROM subscriptions s\n  LEFT JOIN plan_changes pc ON s.user_id = pc.user_id\n  WHERE s.started_at >= date(\'2026-03-09\')\n)\nSELECT\n  change_status,\n  plan_type,\n  COUNT(*) AS total_users,\n  SUM(CASE WHEN status = \'churned\' THEN 1 ELSE 0 END) AS churned,\n  ROUND(100.0 * SUM(CASE WHEN status = \'churned\' THEN 1 ELSE 0 END)\n    * 1.0 / COUNT(*), 1) AS churn_rate,\n  ROUND(AVG(price_delta), 2) AS avg_price_delta\nFROM user_segments\nGROUP BY change_status, plan_type\nORDER BY churn_rate DESC;',
        insight: 'Annual-to-monthly switchers have a 22% churn rate (up from 4.5% last month) while all other segments are stable. This segment accounts for 41% of all churn despite being only 10% of the subscriber base.',
      },
      {
        prompt: 'Now check feature usage for churned vs retained annual-to-monthly switchers to see if low engagement predicts churn.',
        hints: [
          'Join subscriptions with feature_usage for users who switched plans',
          'Compare avg usage_count for churned vs active users in this segment',
        ],
        referenceQuery: 'SELECT\n  s.status,\n  COUNT(DISTINCT s.user_id) AS users,\n  ROUND(AVG(fu.usage_count), 1) AS avg_feature_usage,\n  COUNT(DISTINCT fu.feature_name) AS distinct_features_used\nFROM subscriptions s\nJOIN plan_changes pc ON s.user_id = pc.user_id\n  AND pc.old_plan_type = \'annual\'\n  AND pc.new_plan_type = \'monthly\'\nLEFT JOIN feature_usage fu ON s.user_id = fu.user_id\nWHERE s.started_at >= CURRENT_DATE - INTERVAL \'90 days\'\nGROUP BY s.status\nORDER BY s.status;',
        correctQuerySqlite: 'SELECT\n  s.status,\n  COUNT(DISTINCT s.user_id) AS users,\n  ROUND(AVG(fu.usage_count), 1) AS avg_feature_usage,\n  COUNT(DISTINCT fu.feature_name) AS distinct_features_used\nFROM subscriptions s\nJOIN plan_changes pc ON s.user_id = pc.user_id\n  AND pc.old_plan_type = \'annual\'\n  AND pc.new_plan_type = \'monthly\'\nLEFT JOIN feature_usage fu ON s.user_id = fu.user_id\nWHERE s.started_at >= date(\'2026-03-09\')\nGROUP BY s.status\nORDER BY s.status;',
        insight: 'Churned switchers and retained switchers have similar feature usage patterns, meaning the churn is not driven by disengagement with the product. This confirms the pricing shock is the primary driver, not a lack of product value.',
      },
      {
        prompt: 'Check support tickets for churned annual-to-monthly switchers to confirm the pricing hypothesis.',
        hints: [
          'Join support_tickets with the switcher cohort',
          'Filter for billing or pricing related categories',
        ],
        referenceQuery: 'SELECT\n  st.category,\n  COUNT(*) AS ticket_count,\n  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 1) AS pct_of_tickets\nFROM support_tickets st\nJOIN subscriptions s ON st.user_id = s.user_id\nJOIN plan_changes pc ON s.user_id = pc.user_id\n  AND pc.old_plan_type = \'annual\'\n  AND pc.new_plan_type = \'monthly\'\nWHERE s.status = \'churned\'\n  AND st.created_at >= CURRENT_DATE - INTERVAL \'30 days\'\nGROUP BY st.category\nORDER BY ticket_count DESC;',
        correctQuerySqlite: 'SELECT\n  st.category,\n  COUNT(*) AS ticket_count\nFROM support_tickets st\nJOIN subscriptions s ON st.user_id = s.user_id\nJOIN plan_changes pc ON s.user_id = pc.user_id\n  AND pc.old_plan_type = \'annual\'\n  AND pc.new_plan_type = \'monthly\'\nWHERE s.status = \'churned\'\n  AND st.created_at >= date(\'2026-05-09\')\nGROUP BY st.category\nORDER BY ticket_count DESC;',
        insight: '68% of support tickets from churned switchers are categorized as billing complaints, with the most common complaint being unexpected price increase. This confirms the price anchoring effect: switchers expected the old monthly rate but received the new higher rate.',
      },
    ],

    synthesis: {
      prompt: 'Write a brief for the pricing team explaining the churn spike, root cause, and recommended intervention.',
      keyElements: [
        'price anchoring mechanism',
        'annual-to-monthly switcher impact',
        '$14.40 effective price jump',
        'outsized contribution to total churn',
        'transitional price lock proposal',
        'tenure-based qualification',
      ],
      modelAnswer: 'The 20% monthly plan price increase is causing 22% churn among users who switch from annual to monthly billing, up from 4.5% last month. These users experience a $14.40/month jump over their previous annual rate ($24/month effective to $38.40), which feels like a 60% increase due to price anchoring. This cohort of 8,200 users accounts for 41% of all churn despite being only 10% of subscribers. Feature usage for churned switchers is comparable to retained users, confirming this is a pricing issue, not a product value issue. Recommended action: offer a 3-month transitional price lock at the old monthly rate for annual-to-monthly switchers with 6+ months tenure, then graduate to the new rate. This smooths the price transition while preserving the price increase for new monthly subscribers.',
      rubric: [
        'Explains the price anchoring mechanism with concrete dollar amounts',
        'Quantifies the outsized impact of a small cohort on total churn',
        'Distinguishes pricing from product value as root cause',
        'Proposes a targeted intervention with tenure qualification',
      ],
    },

    takeaway: 'Churn spikes after price increases are rarely uniform. Look for the cohort experiencing the largest perceived price change, which may differ from the actual price change due to anchoring effects.',
  },

  {
    id: 'fl05',
    title: 'Orders Up, Contribution Margin Declining',
    domain: 'Marketplace',
    difficulty: 'staff',
    isFree: false,
    guestPreview: false,

    problem: {
      context: 'Your marketplace operates across three city tiers in India. The growth team has been aggressively expanding into Tier 2 and Tier 3 cities with deep discounts and free delivery promotions. Order volume is at an all-time high, but finance is raising alarms about unit economics.',
      metric: {
        name: 'Orders / Contribution Margin per Order',
        current: '1.15M orders / -$2.40 per order',
        previous: '1.00M orders / -$1.10 per order',
        change: 'Orders +15% QoQ / Margin -118%',
        period: 'Quarter-over-quarter',
        direction: 'down',
      },
      question: 'Orders are up 15% QoQ, but contribution margin per order has deteriorated from -$1.10 to -$2.40. The growth team is celebrating. What is your first move?',
      options: [
        { id: 'a', text: 'Decompose contribution margin by city tier to see if the growth is coming from profitable or unprofitable segments', correct: true },
        { id: 'b', text: 'Congratulate the growth team and investigate the margin issue separately', correct: false },
        { id: 'c', text: 'Check if logistics costs increased across all orders', correct: false },
      ],
      explanation: 'When orders grow but margins shrink, the first question is where the growth is coming from. If new orders are concentrated in segments with structurally different unit economics (like emerging city tiers), the margin decline is a mix effect. These metrics are not independent. Growth that destroys margin is a burn rate problem, not a success story.',
    },

    decomposition: {
      prompt: 'Decompose the margin decline into a MECE framework. What are all the cost components that could be driving negative contribution margin?',
      keyElements: [
        'city tier mix effect',
        'discount depth by geography',
        'return-to-origin (RTO) rate by tier',
        'logistics cost per order by distance',
        'coupon vs organic demand split',
        'category mix across tiers',
      ],
      modelAnswer: 'MECE contribution margin decomposition: (1) Revenue layer: AOV by city tier, category mix, organic vs coupon-driven orders. (2) Discount layer: Average discount rate by tier, coupon type (first-order vs repeat), discount cap compliance. (3) Logistics layer: Outbound delivery cost by tier (driven by distance and infrastructure), packaging cost, last-mile delivery complexity. (4) Returns layer: RTO rate by tier, return logistics cost (round-trip), refund processing cost. Each of these compounds: a Tier 3 order with a 35% discount that gets returned costs the discount + outbound shipping + return shipping + refund processing, making the total loss approximately 2x the discount amount. The framework separates controllable costs (discounts, return policy) from structural costs (geography-driven logistics).',
    },

    schemaDesign: {
      prompt: 'Design the schema to build a contribution margin waterfall by city tier, accounting for discounts, logistics, and returns.',
      keyElements: [
        'orders table with city_id, amount, status',
        'discounts table with discount_amount, coupon_code',
        'logistics_costs table with outbound and packaging costs',
        'returns table with return_logistics_cost',
        'city_tiers table mapping city to tier',
      ],
      modelAnswer: 'Core tables: (1) orders (order_id, user_id, city_id, amount, created_at, status) as the central fact table. (2) discounts (discount_id, order_id, discount_amount, discount_type, coupon_code) tracking per-order discount details. (3) logistics_costs (order_id, outbound_cost, packaging_cost) for delivery expense per order. (4) returns (return_id, order_id, reason, return_logistics_cost, returned_at) for RTO economics. (5) city_tiers (city_id, city_name, tier) mapping geography to tier classification. The margin waterfall per order = orders.amount - discounts.discount_amount - logistics_costs.outbound_cost - logistics_costs.packaging_cost - returns.return_logistics_cost (when applicable). Group by city_tiers.tier to see the unit economics by geography.',
    },

    queryChain: [
      {
        prompt: 'Write a query to calculate contribution margin per order by city tier, breaking out each cost component: revenue, discount, logistics, and return cost.',
        hints: [
          'Use LEFT JOINs from orders to discounts, logistics, and returns',
          'COALESCE null costs to 0 for orders without discounts or returns',
        ],
        referenceQuery: 'WITH order_economics AS (\n  SELECT\n    o.order_id, ct.tier,\n    o.amount AS revenue,\n    COALESCE(d.discount_amount, 0) AS discount,\n    COALESCE(lc.outbound_cost, 0) + COALESCE(lc.packaging_cost, 0) AS logistics,\n    CASE WHEN r.return_id IS NOT NULL\n      THEN COALESCE(r.return_logistics_cost, 0) ELSE 0 END AS return_cost,\n    CASE WHEN r.return_id IS NOT NULL THEN 1 ELSE 0 END AS is_returned\n  FROM orders o\n  JOIN city_tiers ct ON o.city_id = ct.city_id\n  LEFT JOIN discounts d ON o.order_id = d.order_id\n  LEFT JOIN logistics_costs lc ON o.order_id = lc.order_id\n  LEFT JOIN returns r ON o.order_id = r.order_id\n  WHERE o.created_at >= CURRENT_DATE - INTERVAL \'90 days\'\n)\nSELECT\n  tier,\n  COUNT(*) AS total_orders,\n  ROUND(AVG(revenue), 2) AS avg_revenue,\n  ROUND(AVG(discount), 2) AS avg_discount,\n  ROUND(AVG(logistics), 2) AS avg_logistics,\n  ROUND(100.0 * SUM(is_returned) / COUNT(*), 1) AS rto_rate,\n  ROUND(AVG(return_cost), 2) AS avg_return_cost,\n  ROUND(AVG(revenue - discount - logistics - return_cost), 2) AS margin_per_order\nFROM order_economics\nGROUP BY tier\nORDER BY tier;',
        correctQuerySqlite: 'WITH order_economics AS (\n  SELECT\n    o.order_id, ct.tier,\n    o.amount AS revenue,\n    COALESCE(d.discount_amount, 0) AS discount,\n    COALESCE(lc.outbound_cost, 0) + COALESCE(lc.packaging_cost, 0) AS logistics,\n    CASE WHEN r.return_id IS NOT NULL\n      THEN COALESCE(r.return_logistics_cost, 0) ELSE 0 END AS return_cost,\n    CASE WHEN r.return_id IS NOT NULL THEN 1 ELSE 0 END AS is_returned\n  FROM orders o\n  JOIN city_tiers ct ON o.city_id = ct.city_id\n  LEFT JOIN discounts d ON o.order_id = d.order_id\n  LEFT JOIN logistics_costs lc ON o.order_id = lc.order_id\n  LEFT JOIN returns r ON o.order_id = r.order_id\n  WHERE o.created_at >= date(\'2026-03-09\')\n)\nSELECT\n  tier,\n  COUNT(*) AS total_orders,\n  ROUND(AVG(revenue), 2) AS avg_revenue,\n  ROUND(AVG(discount), 2) AS avg_discount,\n  ROUND(AVG(logistics), 2) AS avg_logistics,\n  ROUND(100.0 * SUM(is_returned) * 1.0 / COUNT(*), 1) AS rto_rate,\n  ROUND(AVG(return_cost), 2) AS avg_return_cost,\n  ROUND(AVG(revenue - discount - logistics - return_cost), 2) AS margin_per_order\nFROM order_economics\nGROUP BY tier\nORDER BY tier;',
        insight: 'Tier 1 generates +$4.80 margin per order while Tier 2 loses -$1.40 and Tier 3 loses -$8.60. The overall margin decline is a mix effect from growing 32% in Tier 3 where unit economics are structurally negative.',
      },
      {
        prompt: 'Investigate the relationship between discount depth and return rates by city tier. Do heavy discounts correlate with higher returns?',
        hints: [
          'Bucket orders by discount percentage and calculate RTO rate for each bucket',
          'Cross with city tier to see if the pattern is geography-specific',
        ],
        referenceQuery: 'SELECT\n  ct.tier,\n  CASE\n    WHEN d.discount_amount / o.amount < 0.10 THEN \'0-10%\'\n    WHEN d.discount_amount / o.amount < 0.20 THEN \'10-20%\'\n    WHEN d.discount_amount / o.amount < 0.30 THEN \'20-30%\'\n    ELSE \'30%+\'\n  END AS discount_bucket,\n  COUNT(*) AS orders,\n  ROUND(100.0 * SUM(CASE WHEN r.return_id IS NOT NULL THEN 1 ELSE 0 END)\n    / COUNT(*), 1) AS rto_rate\nFROM orders o\nJOIN city_tiers ct ON o.city_id = ct.city_id\nLEFT JOIN discounts d ON o.order_id = d.order_id\nLEFT JOIN returns r ON o.order_id = r.order_id\nWHERE o.created_at >= CURRENT_DATE - INTERVAL \'90 days\'\n  AND d.discount_amount IS NOT NULL\nGROUP BY ct.tier, discount_bucket\nORDER BY ct.tier, discount_bucket;',
        correctQuerySqlite: 'SELECT\n  ct.tier,\n  CASE\n    WHEN d.discount_amount * 1.0 / o.amount < 0.10 THEN \'0-10%\'\n    WHEN d.discount_amount * 1.0 / o.amount < 0.20 THEN \'10-20%\'\n    WHEN d.discount_amount * 1.0 / o.amount < 0.30 THEN \'20-30%\'\n    ELSE \'30%+\'\n  END AS discount_bucket,\n  COUNT(*) AS orders,\n  ROUND(100.0 * SUM(CASE WHEN r.return_id IS NOT NULL THEN 1 ELSE 0 END)\n    * 1.0 / COUNT(*), 1) AS rto_rate\nFROM orders o\nJOIN city_tiers ct ON o.city_id = ct.city_id\nLEFT JOIN discounts d ON o.order_id = d.order_id\nLEFT JOIN returns r ON o.order_id = r.order_id\nWHERE o.created_at >= date(\'2026-03-09\')\n  AND d.discount_amount IS NOT NULL\nGROUP BY ct.tier, discount_bucket\nORDER BY ct.tier, discount_bucket;',
        insight: 'Orders with 30%+ discounts in Tier 3 have a 38% RTO rate, compared to 8% for 0-10% discounts in Tier 1. Heavy discounts attract price-sensitive buyers who return at much higher rates, compounding the loss.',
      },
      {
        prompt: 'Calculate the fully-loaded cost of a returned order in Tier 3 including discount, outbound logistics, and return logistics to quantify the compounding loss.',
        hints: [
          'Filter for returned Tier 3 orders specifically',
          'Sum all cost components per returned order',
        ],
        referenceQuery: 'SELECT\n  COUNT(*) AS returned_orders,\n  ROUND(AVG(o.amount), 2) AS avg_order_value,\n  ROUND(AVG(d.discount_amount), 2) AS avg_discount,\n  ROUND(AVG(lc.outbound_cost + lc.packaging_cost), 2) AS avg_outbound_logistics,\n  ROUND(AVG(r.return_logistics_cost), 2) AS avg_return_logistics,\n  ROUND(AVG(d.discount_amount + lc.outbound_cost + lc.packaging_cost\n    + r.return_logistics_cost), 2) AS total_loss_per_rto\nFROM orders o\nJOIN city_tiers ct ON o.city_id = ct.city_id\nJOIN returns r ON o.order_id = r.order_id\nJOIN discounts d ON o.order_id = d.order_id\nJOIN logistics_costs lc ON o.order_id = lc.order_id\nWHERE ct.tier = 3\n  AND o.created_at >= CURRENT_DATE - INTERVAL \'90 days\';',
        correctQuerySqlite: 'SELECT\n  COUNT(*) AS returned_orders,\n  ROUND(AVG(o.amount), 2) AS avg_order_value,\n  ROUND(AVG(d.discount_amount), 2) AS avg_discount,\n  ROUND(AVG(lc.outbound_cost + lc.packaging_cost), 2) AS avg_outbound_logistics,\n  ROUND(AVG(r.return_logistics_cost), 2) AS avg_return_logistics,\n  ROUND(AVG(d.discount_amount + lc.outbound_cost + lc.packaging_cost\n    + r.return_logistics_cost), 2) AS total_loss_per_rto\nFROM orders o\nJOIN city_tiers ct ON o.city_id = ct.city_id\nJOIN returns r ON o.order_id = r.order_id\nJOIN discounts d ON o.order_id = d.order_id\nJOIN logistics_costs lc ON o.order_id = lc.order_id\nWHERE ct.tier = 3\n  AND o.created_at >= date(\'2026-03-09\');',
        insight: 'Each returned Tier 3 order costs $22.60 in total losses (discount + outbound + return logistics). At a 24% RTO rate and 350K orders per quarter, Tier 3 alone burns approximately $1.9M per quarter in return-related losses.',
      },
    ],

    synthesis: {
      prompt: 'Write a brief for the VP of Growth explaining why the order growth is a problem and proposing a restructured approach to Tier 2/3 expansion.',
      keyElements: [
        'reframes growth as margin problem',
        'compounding loss loop mechanism',
        'quarterly burn rate quantified',
        'discount cap recommendation',
        'first-order vs repeat-order distinction',
        'RTO-based policy targeting',
      ],
      modelAnswer: 'The 15% QoQ order growth is concentrated in Tier 2/3 cities where every order loses money: -$1.40 in Tier 2 and -$8.60 in Tier 3. The loss compounds because heavy discounts (35% in Tier 3) attract price-sensitive buyers with 24% return rates, and each return costs $22.60 in lost discount plus round-trip logistics. At current run rate, Tier 2/3 expansion burns approximately $3.5M per quarter in negative contribution margin. Recommended restructuring: (1) Cap repeat-order discounts at 15% for Tier 2/3 cities with historical RTO above 20%. (2) Keep uncapped first-order discounts to preserve acquisition. (3) Introduce a return fee or stricter return window for high-RTO geographies. This preserves the growth funnel while fixing the repeat-order economics that drive the majority of losses.',
      rubric: [
        'Reframes order growth as a margin destruction problem',
        'Explains the compounding loss loop (discount + RTO + logistics)',
        'Quantifies the total quarterly burn rate',
        'Proposes a segmented intervention separating acquisition from retention',
      ],
    },

    takeaway: 'Growth that destroys unit economics is a burn rate problem, not a win. Always decompose margin by the segments driving growth to catch compounding loss loops before they scale.',
  },

  {
    id: 'fl06',
    title: 'Loan Approval Rate Dropping',
    domain: 'Fintech / Lending',
    difficulty: 'analyst',
    isFree: false,
    guestPreview: false,

    problem: {
      context: 'Your digital lending platform processes 15,000 loan applications per week across mobile, web, and branch channels. The risk team recently migrated from a legacy credit bureau to a new bureau API for digital channels. Branch applications still use the legacy bureau.',
      metric: {
        name: 'Loan Approval Rate',
        current: '54.2%',
        previous: '66.1%',
        change: '-18%',
        period: 'Week-over-week',
        direction: 'down',
      },
      question: 'Loan approval rate dropped from 66.1% to 54.2% WoW. Support tickets from applicants are rising. What is your first move?',
      options: [
        { id: 'a', text: 'Segment approval rates by channel and credit score provider to isolate where the decline is concentrated', correct: true },
        { id: 'b', text: 'Lower the credit score threshold immediately to restore the approval rate', correct: false },
        { id: 'c', text: 'Check if marketing acquired a lower-quality applicant pool this week', correct: false },
      ],
      explanation: 'Approval rate drops can stem from applicant quality changes, underwriting rule changes, or scoring system changes. Segmenting by channel and credit bureau provider isolates whether the drop is broad or specific to the new bureau integration. Lowering the threshold without diagnosis could approve bad credit risks. An 18% WoW drop is too sharp for a gradual marketing mix shift.',
    },

    decomposition: {
      prompt: 'Decompose the approval rate decline into a MECE framework covering all possible drivers.',
      keyElements: [
        'credit bureau provider split',
        'channel segmentation (mobile, web, branch)',
        'score distribution comparison',
        'threshold calibration mismatch',
        'applicant quality trends',
        'underwriting rule changes',
      ],
      modelAnswer: 'MECE framework for approval rate decline: (1) Scoring instrument layer: Compare approval rates by credit bureau provider (new API vs legacy) to test whether the measurement instrument changed. (2) Channel layer: Mobile, web, and branch approval rates to isolate platform-specific issues. (3) Score distribution layer: Compare the distribution of raw scores from each bureau to detect distribution shifts. (4) Threshold calibration: Check if the approval threshold (e.g., 650) was set for the legacy bureau\'s distribution and is now mismatched for the new bureau\'s scale. (5) Applicant quality: Compare applicant demographics and income data across periods to rule out a genuine quality decline. (6) Underwriting rules: Check if any new rules or overrides were deployed alongside the bureau change.',
    },

    schemaDesign: {
      prompt: 'Design the schema to investigate a loan approval rate drop that might be caused by a credit bureau migration.',
      keyElements: [
        'loan_applications table with channel, status, submitted_at',
        'credit_scores table with bureau, score, application_id',
        'underwriting_rules table with rule changes and effective dates',
      ],
      modelAnswer: 'Core tables: (1) loan_applications (application_id, user_id, channel, submitted_at, status, decision_reason) tracking each application with its outcome. (2) credit_scores (application_id, bureau, score, pulled_at) recording which bureau scored each application and the raw score. (3) approval_decisions (application_id, decision, decided_at, threshold_used) capturing the decision with the threshold applied. The key analysis joins loan_applications to credit_scores on application_id, then compares approval rates grouped by bureau. The score distribution from each bureau can be bucketed (sub-600, 600-649, 650-699, 700+) to reveal how the new bureau shifts applicants across buckets relative to the legacy bureau.',
    },

    queryChain: [
      {
        prompt: 'Write a query to compare approval rates by credit bureau and channel for the last 14 days.',
        hints: [
          'Join loan_applications with credit_scores on application_id',
          'Group by bureau and channel, calculate approval rate',
        ],
        referenceQuery: 'SELECT\n  cs.bureau,\n  la.channel,\n  COUNT(*) AS applications,\n  SUM(CASE WHEN ad.decision = \'approved\' THEN 1 ELSE 0 END) AS approved,\n  ROUND(100.0 * SUM(CASE WHEN ad.decision = \'approved\' THEN 1 ELSE 0 END)\n    / COUNT(*), 1) AS approval_rate\nFROM loan_applications la\nJOIN credit_scores cs ON la.application_id = cs.application_id\nJOIN approval_decisions ad ON la.application_id = ad.application_id\nWHERE la.submitted_at >= CURRENT_DATE - INTERVAL \'14 days\'\nGROUP BY cs.bureau, la.channel\nORDER BY approval_rate ASC;',
        correctQuerySqlite: 'SELECT\n  cs.bureau,\n  la.channel,\n  COUNT(*) AS applications,\n  SUM(CASE WHEN ad.decision = \'approved\' THEN 1 ELSE 0 END) AS approved,\n  ROUND(100.0 * SUM(CASE WHEN ad.decision = \'approved\' THEN 1 ELSE 0 END)\n    * 1.0 / COUNT(*), 1) AS approval_rate\nFROM loan_applications la\nJOIN credit_scores cs ON la.application_id = cs.application_id\nJOIN approval_decisions ad ON la.application_id = ad.application_id\nWHERE la.submitted_at >= date(\'2026-05-26\')\nGROUP BY cs.bureau, la.channel\nORDER BY approval_rate ASC;',
        insight: 'Applications scored by the new bureau API have approval rates of 41-43% regardless of channel, while legacy bureau applications maintain 65-68%. Branch applications (legacy only) are stable. The drop is entirely driven by the new credit bureau.',
      },
      {
        prompt: 'Now compare the score distribution across bureaus. Bucket scores into ranges (sub-600, 600-649, 650-699, 700+) and show what percentage of applicants fall into each bucket by bureau.',
        hints: [
          'Use a CASE expression to create score buckets',
          'Calculate the percentage of applications in each bucket per bureau',
        ],
        referenceQuery: 'SELECT\n  cs.bureau,\n  CASE\n    WHEN cs.score < 600 THEN \'sub-600\'\n    WHEN cs.score BETWEEN 600 AND 649 THEN \'600-649\'\n    WHEN cs.score BETWEEN 650 AND 699 THEN \'650-699\'\n    WHEN cs.score >= 700 THEN \'700+\'\n  END AS score_bucket,\n  COUNT(*) AS applications,\n  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY cs.bureau), 1) AS pct_of_bureau\nFROM credit_scores cs\nWHERE cs.pulled_at >= CURRENT_DATE - INTERVAL \'14 days\'\nGROUP BY cs.bureau, score_bucket\nORDER BY cs.bureau, score_bucket;',
        correctQuerySqlite: 'SELECT\n  cs.bureau,\n  CASE\n    WHEN cs.score < 600 THEN \'sub-600\'\n    WHEN cs.score BETWEEN 600 AND 649 THEN \'600-649\'\n    WHEN cs.score BETWEEN 650 AND 699 THEN \'650-699\'\n    WHEN cs.score >= 700 THEN \'700+\'\n  END AS score_bucket,\n  COUNT(*) AS applications\nFROM credit_scores cs\nWHERE cs.pulled_at >= date(\'2026-05-26\')\nGROUP BY cs.bureau, score_bucket\nORDER BY cs.bureau, score_bucket;',
        insight: 'The new bureau shifts the entire distribution lower: 39% of applicants score in the 600-649 bucket vs 23% on the legacy bureau. The 650-699 bucket shrinks from 39% to 28%. The same applicants are scoring 40-60 points lower on the new bureau.',
      },
      {
        prompt: 'Confirm the threshold mismatch by checking what the approval rate would be if the threshold were adjusted from 650 to 610 for the new bureau.',
        hints: [
          'Simulate different thresholds by checking score >= threshold',
          'Compare simulated approval rates across threshold values',
        ],
        referenceQuery: 'SELECT\n  cs.bureau,\n  ROUND(100.0 * SUM(CASE WHEN cs.score >= 650 THEN 1 ELSE 0 END)\n    / COUNT(*), 1) AS approval_at_650,\n  ROUND(100.0 * SUM(CASE WHEN cs.score >= 630 THEN 1 ELSE 0 END)\n    / COUNT(*), 1) AS approval_at_630,\n  ROUND(100.0 * SUM(CASE WHEN cs.score >= 610 THEN 1 ELSE 0 END)\n    / COUNT(*), 1) AS approval_at_610\nFROM credit_scores cs\nWHERE cs.pulled_at >= CURRENT_DATE - INTERVAL \'14 days\'\nGROUP BY cs.bureau\nORDER BY cs.bureau;',
        correctQuerySqlite: 'SELECT\n  cs.bureau,\n  ROUND(100.0 * SUM(CASE WHEN cs.score >= 650 THEN 1 ELSE 0 END)\n    * 1.0 / COUNT(*), 1) AS approval_at_650,\n  ROUND(100.0 * SUM(CASE WHEN cs.score >= 630 THEN 1 ELSE 0 END)\n    * 1.0 / COUNT(*), 1) AS approval_at_630,\n  ROUND(100.0 * SUM(CASE WHEN cs.score >= 610 THEN 1 ELSE 0 END)\n    * 1.0 / COUNT(*), 1) AS approval_at_610\nFROM credit_scores cs\nWHERE cs.pulled_at >= date(\'2026-05-26\')\nGROUP BY cs.bureau\nORDER BY cs.bureau;',
        insight: 'At a 610 threshold, the new bureau\'s approval rate would be 65.8%, matching the legacy bureau\'s rate at 650. This confirms the scores are on different scales: a 610 on the new bureau represents the same creditworthiness as a 650 on the legacy bureau.',
      },
    ],

    synthesis: {
      prompt: 'Write a brief for the risk team explaining the root cause and proposing a path to recalibrate the threshold.',
      keyElements: [
        'score distribution mismatch identified',
        'measurement instrument vs applicant quality distinction',
        'threshold recalibration recommendation',
        'default rate equivalence as validation metric',
        'dual-scoring A/B test proposal',
        'affected applicant count',
      ],
      modelAnswer: 'The new credit bureau API returns scores that are systematically 40-60 points lower than the legacy bureau for the same applicants. Our approval threshold of 650 was calibrated for the legacy distribution, so the unchanged threshold is rejecting creditworthy applicants on the new bureau. This has dropped approval rates from 66% to 54%, incorrectly rejecting approximately 1,800 applicants per week. Critically, the applicants have not become less creditworthy; only the measurement scale changed. Recommended path: run a dual-scoring A/B test where applicants are randomly scored by both bureaus, with the new bureau using an adjusted threshold of 610. The primary metric should be approval rate at equivalent 30-day default rate, validating that the recalibrated threshold preserves credit quality.',
      rubric: [
        'Clearly distinguishes measurement instrument change from quality change',
        'Quantifies the score distribution shift with specific numbers',
        'Proposes threshold recalibration grounded in default rate equivalence',
        'Includes an experiment design for safe validation',
      ],
    },

    takeaway: 'When a metric moves after a measurement system change, always check whether the underlying reality changed or just the ruler. Score distribution mismatches are the most common cause of false alarm metric movements in lending.',
  },

  {
    id: 'fl07',
    title: 'Course Completion Rate Declining',
    domain: 'EdTech',
    difficulty: 'analyst',
    isFree: false,
    guestPreview: false,

    problem: {
      context: 'Your EdTech platform offers video-based courses ranging from 30 minutes to 10+ hours. The mobile engineering team recently updated the video player to comply with a new browser autoplay policy. Completion rates have been declining steadily for three weeks.',
      metric: {
        name: 'Course Completion Rate',
        current: '38.4%',
        previous: '45.2%',
        change: '-15%',
        period: 'Over 3 weeks',
        direction: 'down',
      },
      question: 'Course completion rate dropped from 45.2% to 38.4% over 3 weeks. The decline is steady, not a cliff. What is your first move?',
      options: [
        { id: 'a', text: 'Segment completion rate by course length, content type, and platform to isolate the affected cohort', correct: true },
        { id: 'b', text: 'Survey students who dropped out to ask why they stopped', correct: false },
        { id: 'c', text: 'Check if new courses added recently are harder and dragging down the average', correct: false },
      ],
      explanation: 'Completion rate can be affected by course format, duration, or platform-specific issues. A steady 15% decline suggests a systematic change that should be identifiable through segmentation. Surveys are slow and biased toward articulate respondents. New course difficulty is a specific hypothesis that should follow segmentation.',
    },

    decomposition: {
      prompt: 'Decompose the completion rate decline into a MECE framework. What dimensions could explain a steady 3-week decline?',
      keyElements: [
        'platform split (mobile vs desktop)',
        'course length buckets',
        'content type (video, text, interactive)',
        'video playback quality metrics',
        'module-level drop-off analysis',
        'device or browser version',
      ],
      modelAnswer: 'MECE framework for completion rate decline: (1) Platform layer: Mobile vs desktop completion rates to catch device-specific regressions. (2) Course duration layer: Short (<1hr), medium (1-2hr), long (2-5hr), very long (5+hr) to identify if the issue scales with viewing time. (3) Content format layer: Video-heavy vs text-based vs interactive courses to isolate format-specific problems. (4) Playback quality layer: Buffering time, playback errors, and video load failures by platform and session length. (5) Module-level funnel: Which specific module within courses shows the highest abandonment. (6) Technical layer: Browser version, OS version, app version affecting playback behavior. The key interaction to test is platform x course length: if the problem only appears in long courses on mobile, it points to a mobile video player regression.',
    },

    schemaDesign: {
      prompt: 'Design the schema to investigate a completion rate drop that might be caused by a mobile video player regression.',
      keyElements: [
        'course_enrollments table with platform, completion status, timestamps',
        'courses table with duration_minutes, category',
        'video_playback_events table with buffer_time, event_type',
        'module_progress table for drop-off analysis',
      ],
      modelAnswer: 'Core tables: (1) course_enrollments (enrollment_id, user_id, course_id, enrolled_at, completed_at, platform) tracking each enrollment lifecycle with platform. (2) courses (course_id, title, duration_minutes, category) for course metadata. (3) video_playback_events (event_id, enrollment_id, event_type, minutes_watched, buffer_time_seconds, timestamp) recording playback quality metrics per viewing session. (4) module_progress (enrollment_id, module_id, module_order, started_at, completed_at) for module-level drop-off analysis. The critical join is enrollments to playback events to correlate buffering with abandonment, segmented by platform and course duration.',
    },

    queryChain: [
      {
        prompt: 'Write a query to calculate completion rate by course length bucket and platform for the last 21 days.',
        hints: [
          'Join course_enrollments with courses to get duration',
          'Use a CASE expression to create length buckets from duration_minutes',
        ],
        referenceQuery: 'SELECT\n  CASE\n    WHEN c.duration_minutes <= 60 THEN \'under_1hr\'\n    WHEN c.duration_minutes <= 120 THEN \'1-2hr\'\n    WHEN c.duration_minutes <= 300 THEN \'2-5hr\'\n    ELSE \'5hr_plus\'\n  END AS length_bucket,\n  ce.platform,\n  COUNT(*) AS enrollments,\n  SUM(CASE WHEN ce.completed_at IS NOT NULL THEN 1 ELSE 0 END) AS completed,\n  ROUND(100.0 * SUM(CASE WHEN ce.completed_at IS NOT NULL THEN 1 ELSE 0 END)\n    / COUNT(*), 1) AS completion_rate\nFROM course_enrollments ce\nJOIN courses c ON ce.course_id = c.course_id\nWHERE ce.enrolled_at >= CURRENT_DATE - INTERVAL \'21 days\'\nGROUP BY length_bucket, ce.platform\nORDER BY length_bucket, ce.platform;',
        correctQuerySqlite: 'SELECT\n  CASE\n    WHEN c.duration_minutes <= 60 THEN \'under_1hr\'\n    WHEN c.duration_minutes <= 120 THEN \'1-2hr\'\n    WHEN c.duration_minutes <= 300 THEN \'2-5hr\'\n    ELSE \'5hr_plus\'\n  END AS length_bucket,\n  ce.platform,\n  COUNT(*) AS enrollments,\n  SUM(CASE WHEN ce.completed_at IS NOT NULL THEN 1 ELSE 0 END) AS completed,\n  ROUND(100.0 * SUM(CASE WHEN ce.completed_at IS NOT NULL THEN 1 ELSE 0 END)\n    * 1.0 / COUNT(*), 1) AS completion_rate\nFROM course_enrollments ce\nJOIN courses c ON ce.course_id = c.course_id\nWHERE ce.enrolled_at >= date(\'2026-05-19\')\nGROUP BY length_bucket, ce.platform\nORDER BY length_bucket, ce.platform;',
        insight: 'The drop is overwhelmingly concentrated in courses over 2 hours on mobile: mobile 2-5hr completion dropped 15.4pp and 5hr+ dropped 13.5pp. Desktop completion for the same lengths is flat. Short courses on both platforms are stable.',
      },
      {
        prompt: 'Now check video buffering time by platform and course length bucket to see if mobile buffering correlates with the completion drop.',
        hints: [
          'Join video_playback_events with course_enrollments and courses',
          'Calculate average buffer_time_seconds by platform and length bucket',
        ],
        referenceQuery: 'SELECT\n  CASE\n    WHEN c.duration_minutes <= 60 THEN \'under_1hr\'\n    WHEN c.duration_minutes <= 120 THEN \'1-2hr\'\n    WHEN c.duration_minutes <= 300 THEN \'2-5hr\'\n    ELSE \'5hr_plus\'\n  END AS length_bucket,\n  ce.platform,\n  ROUND(AVG(vpe.buffer_time_seconds), 1) AS avg_buffer_seconds,\n  COUNT(DISTINCT ce.enrollment_id) AS enrollments\nFROM video_playback_events vpe\nJOIN course_enrollments ce ON vpe.enrollment_id = ce.enrollment_id\nJOIN courses c ON ce.course_id = c.course_id\nWHERE vpe.event_type = \'playback\'\n  AND vpe.timestamp >= CURRENT_DATE - INTERVAL \'21 days\'\nGROUP BY length_bucket, ce.platform\nORDER BY length_bucket, ce.platform;',
        correctQuerySqlite: 'SELECT\n  CASE\n    WHEN c.duration_minutes <= 60 THEN \'under_1hr\'\n    WHEN c.duration_minutes <= 120 THEN \'1-2hr\'\n    WHEN c.duration_minutes <= 300 THEN \'2-5hr\'\n    ELSE \'5hr_plus\'\n  END AS length_bucket,\n  ce.platform,\n  ROUND(AVG(vpe.buffer_time_seconds), 1) AS avg_buffer_seconds,\n  COUNT(DISTINCT ce.enrollment_id) AS enrollments\nFROM video_playback_events vpe\nJOIN course_enrollments ce ON vpe.enrollment_id = ce.enrollment_id\nJOIN courses c ON ce.course_id = c.course_id\nWHERE vpe.event_type = \'playback\'\n  AND vpe.timestamp >= date(\'2026-05-19\')\nGROUP BY length_bucket, ce.platform\nORDER BY length_bucket, ce.platform;',
        insight: 'Mobile buffering time for 2-5hr courses is 14.8 seconds (vs 1.3s on desktop) and 22.3 seconds for 5hr+ courses (vs 1.5s on desktop). Short course buffering is similar across platforms. The autoplay policy update broke preloading on mobile, causing severe buffering that compounds during long sessions.',
      },
      {
        prompt: 'Identify the specific module where mobile users in long courses abandon. Write a query showing drop-off rate by module order for mobile users in 2-5hr courses.',
        hints: [
          'Join module_progress with course_enrollments filtered for mobile and 2-5hr courses',
          'Calculate the percentage of enrollments that completed each module in sequence',
        ],
        referenceQuery: 'SELECT\n  mp.module_order,\n  COUNT(DISTINCT mp.enrollment_id) AS started_module,\n  SUM(CASE WHEN mp.completed_at IS NOT NULL THEN 1 ELSE 0 END) AS completed_module,\n  ROUND(100.0 * COUNT(DISTINCT mp.enrollment_id)\n    / (SELECT COUNT(DISTINCT ce2.enrollment_id)\n       FROM course_enrollments ce2\n       JOIN courses c2 ON ce2.course_id = c2.course_id\n       WHERE ce2.platform = \'mobile\'\n         AND c2.duration_minutes BETWEEN 121 AND 300\n         AND ce2.enrolled_at >= CURRENT_DATE - INTERVAL \'21 days\'), 1) AS pct_reached\nFROM module_progress mp\nJOIN course_enrollments ce ON mp.enrollment_id = ce.enrollment_id\nJOIN courses c ON ce.course_id = c.course_id\nWHERE ce.platform = \'mobile\'\n  AND c.duration_minutes BETWEEN 121 AND 300\n  AND ce.enrolled_at >= CURRENT_DATE - INTERVAL \'21 days\'\nGROUP BY mp.module_order\nORDER BY mp.module_order;',
        correctQuerySqlite: 'SELECT\n  mp.module_order,\n  COUNT(DISTINCT mp.enrollment_id) AS started_module,\n  SUM(CASE WHEN mp.completed_at IS NOT NULL THEN 1 ELSE 0 END) AS completed_module\nFROM module_progress mp\nJOIN course_enrollments ce ON mp.enrollment_id = ce.enrollment_id\nJOIN courses c ON ce.course_id = c.course_id\nWHERE ce.platform = \'mobile\'\n  AND c.duration_minutes BETWEEN 121 AND 300\n  AND ce.enrolled_at >= date(\'2026-05-19\')\nGROUP BY mp.module_order\nORDER BY mp.module_order;',
        insight: 'Module 3 (typically the 90-120 minute mark) shows a sharp 40% drop-off on mobile. This aligns with the buffering data: after ~90 minutes of playback, the buffer cache fills and buffering spikes, causing users to abandon at the next module boundary.',
      },
    ],

    synthesis: {
      prompt: 'Write a brief for the product lead explaining the issue, its mechanism, and your recommended fix.',
      keyElements: [
        'autoplay policy update as root cause',
        'buffering mechanism in long sessions',
        'mobile-only and duration-dependent pattern',
        'affected enrollment count',
        'preloading fix recommendation',
        'monitoring plan for recovery',
      ],
      modelAnswer: 'The video player update for autoplay policy compliance (deployed 3 weeks ago) broke preloading on mobile, causing buffering times to spike from 1.2s to 14.8-22.3s for courses over 2 hours. Mobile users hit severe buffering around the 90-minute mark when the buffer cache fills, leading to a 40% drop-off at module 3. This has driven mobile completion rates down 15pp for long courses, affecting approximately 11,000 active enrollments. The fix is to implement proactive segment prefetching that loads the next 2-3 video chunks during playback. This complies with the autoplay policy (user-initiated playback) while preventing the buffer from falling behind. Ship within 5 days, then monitor mobile buffering and completion recovery over 2 weeks. The 18% increase in mobile data usage per session is an acceptable tradeoff.',
      rubric: [
        'Identifies the technical change and its buffering mechanism',
        'Explains the two-variable interaction (mobile AND long duration)',
        'Quantifies affected enrollments and completion rate impact',
        'Proposes a specific technical fix with timeline and monitoring',
      ],
    },

    takeaway: 'When a metric decline shows a two-variable interaction (platform x duration), look for a technical change that creates a time-dependent failure mode. Video playback quality is a hidden driver of completion metrics that analysts often overlook.',
  },

  {
    id: 'fl08',
    title: 'Message Send Latency Spike',
    domain: 'Social / Messaging',
    difficulty: 'senior',
    isFree: false,
    guestPreview: false,

    problem: {
      context: 'Your messaging platform handles 50M messages per day across 1:1 DMs, small groups, and large groups (up to 500+ members). The database team ran a scheduled index migration 48 hours ago to consolidate indexes for storage efficiency. P95 message delivery latency has spiked.',
      metric: {
        name: 'P95 Message Delivery Time',
        current: '4.4s',
        previous: '1.0s',
        change: '+340%',
        period: 'Last 48 hours',
        direction: 'up',
      },
      question: 'P95 message delivery time spiked from 1.0s to 4.4s over the past 48 hours. User complaints about slow messaging are flooding support. What is your first move?',
      options: [
        { id: 'a', text: 'Segment latency by chat type and member count to isolate where the spike is concentrated', correct: true },
        { id: 'b', text: 'Scale up the messaging servers immediately to handle the load', correct: false },
        { id: 'c', text: 'Check if total message volume increased due to a viral event', correct: false },
      ],
      explanation: 'A 340% latency spike is rarely caused by load; it is more consistent with a query regression or infrastructure change. Segmenting by chat type and member count reveals whether the issue scales with group size (suggesting a database fan-out problem) or is uniform (suggesting a network or infrastructure issue). Scaling servers without diagnosis is expensive and likely ineffective.',
    },

    decomposition: {
      prompt: 'Decompose the latency spike into a MECE framework. What infrastructure and application layers could cause a size-dependent latency increase?',
      keyElements: [
        'chat size bucketing (1:1, small, medium, large)',
        'database query plan analysis',
        'index health and configuration',
        'message fan-out architecture',
        'network vs application vs database latency',
        'content type impact (text, media, files)',
      ],
      modelAnswer: 'MECE framework for latency spike: (1) Chat size layer: Segment P50/P95 latency by member count buckets to determine if latency scales with group size. (2) Database layer: Query plan analysis for the message fan-out query to check for missing indexes, plan regressions, or sequential scans. (3) Infrastructure layer: Network latency, server CPU, and IOPS metrics to rule out capacity issues. (4) Application layer: Message routing logic, queue depths, and retry patterns. (5) Content type layer: Text vs media vs file messages to test if payload size contributes. (6) Regional layer: Latency by server region to isolate datacenter-specific issues. The key signal is whether latency correlates with group size. If it does, the issue is almost certainly a database fan-out query regression where a missing index forces sequential scans on the group membership table.',
    },

    schemaDesign: {
      prompt: 'Design the schema to investigate a message delivery latency spike that correlates with group size.',
      keyElements: [
        'messages table with chat_id, sent_at, delivered_at, content_type',
        'chats table with chat_type, member_count',
        'message_delivery_log with per-recipient latency',
        'server_metrics for infrastructure correlation',
      ],
      modelAnswer: 'Core tables: (1) messages (message_id, chat_id, sender_id, sent_at, delivered_at, content_type) tracking each message lifecycle. (2) chats (chat_id, chat_type, member_count, created_at) capturing group metadata including size. (3) message_delivery_log (message_id, recipient_id, delivery_latency_ms, delivered_at) recording per-recipient delivery timing. (4) server_metrics (server_id, region, timestamp, cpu_pct, iops, queue_depth) for infrastructure correlation. The critical join is messages to chats on chat_id to segment latency by group size. The delivery log provides per-recipient granularity to detect fan-out issues.',
    },

    queryChain: [
      {
        prompt: 'Write a query to calculate P50 and P95 delivery latency by chat size bucket for the current 48-hour window versus the prior 48-hour window.',
        hints: [
          'Use CASE to bucket chats by member_count (1:1, 3-10, 11-50, 51-200, 200+)',
          'Use a period flag to split current vs prior 48 hours',
        ],
        referenceQuery: 'WITH latency_data AS (\n  SELECT\n    m.message_id,\n    CASE\n      WHEN c.member_count <= 2 THEN \'1:1\'\n      WHEN c.member_count <= 10 THEN \'3-10\'\n      WHEN c.member_count <= 50 THEN \'11-50\'\n      WHEN c.member_count <= 200 THEN \'51-200\'\n      ELSE \'200+\'\n    END AS size_bucket,\n    mdl.delivery_latency_ms,\n    CASE WHEN m.sent_at >= NOW() - INTERVAL \'48 hours\'\n      THEN \'current\' ELSE \'prior\' END AS period\n  FROM messages m\n  JOIN chats c ON m.chat_id = c.chat_id\n  JOIN message_delivery_log mdl ON m.message_id = mdl.message_id\n  WHERE m.sent_at >= NOW() - INTERVAL \'96 hours\'\n)\nSELECT\n  size_bucket, period,\n  COUNT(*) AS messages,\n  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP\n    (ORDER BY delivery_latency_ms)) AS p50_ms,\n  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP\n    (ORDER BY delivery_latency_ms)) AS p95_ms\nFROM latency_data\nGROUP BY size_bucket, period\nORDER BY size_bucket, period;',
        correctQuerySqlite: 'SELECT\n  CASE\n    WHEN c.member_count <= 2 THEN \'1:1\'\n    WHEN c.member_count <= 10 THEN \'3-10\'\n    WHEN c.member_count <= 50 THEN \'11-50\'\n    WHEN c.member_count <= 200 THEN \'51-200\'\n    ELSE \'200+\'\n  END AS size_bucket,\n  CASE WHEN m.sent_at >= datetime(\'2026-06-07\')\n    THEN \'current\' ELSE \'prior\' END AS period,\n  COUNT(*) AS messages,\n  AVG(mdl.delivery_latency_ms) AS avg_latency_ms\nFROM messages m\nJOIN chats c ON m.chat_id = c.chat_id\nJOIN message_delivery_log mdl ON m.message_id = mdl.message_id\nWHERE m.sent_at >= datetime(\'2026-06-05\')\nGROUP BY size_bucket, period\nORDER BY size_bucket, period;',
        insight: 'P95 for 1:1 DMs is unchanged (+3%), but large groups (51-200) spiked 380% and very large groups (200+) spiked 520%. The latency scales with group member count, confirming a database fan-out query regression.',
      },
      {
        prompt: 'Check whether the latency spike correlates with a specific server region or is global.',
        hints: [
          'Join messages with server_metrics on region and time window',
          'Compare average latency by region for the current period',
        ],
        referenceQuery: 'SELECT\n  sm.region,\n  COUNT(*) AS messages,\n  ROUND(AVG(mdl.delivery_latency_ms), 0) AS avg_latency_ms,\n  ROUND(AVG(sm.cpu_pct), 1) AS avg_cpu_pct,\n  ROUND(AVG(sm.iops), 0) AS avg_iops\nFROM messages m\nJOIN message_delivery_log mdl ON m.message_id = mdl.message_id\nJOIN chats c ON m.chat_id = c.chat_id\nCROSS JOIN server_metrics sm\nWHERE m.sent_at >= NOW() - INTERVAL \'48 hours\'\n  AND c.member_count > 50\n  AND sm.timestamp >= NOW() - INTERVAL \'48 hours\'\nGROUP BY sm.region\nORDER BY avg_latency_ms DESC;',
        correctQuerySqlite: 'SELECT\n  sm.region,\n  COUNT(*) AS messages,\n  ROUND(AVG(mdl.delivery_latency_ms), 0) AS avg_latency_ms,\n  ROUND(AVG(sm.cpu_pct), 1) AS avg_cpu_pct\nFROM messages m\nJOIN message_delivery_log mdl ON m.message_id = mdl.message_id\nJOIN chats c ON m.chat_id = c.chat_id\nJOIN server_metrics sm ON sm.region IS NOT NULL\nWHERE m.sent_at >= datetime(\'2026-06-07\')\n  AND c.member_count > 50\n  AND sm.timestamp >= datetime(\'2026-06-07\')\nGROUP BY sm.region\nORDER BY avg_latency_ms DESC;',
        insight: 'The latency spike is global across all server regions, not isolated to one datacenter. This rules out a region-specific network issue and points to a database-level change that affects all replicas, consistent with the index migration.',
      },
      {
        prompt: 'Check if media messages are disproportionately affected compared to text messages in large groups.',
        hints: [
          'Filter for large groups (50+ members) and split by content_type',
          'Compare average delivery latency for text vs media messages',
        ],
        referenceQuery: 'SELECT\n  m.content_type,\n  COUNT(*) AS messages,\n  ROUND(AVG(mdl.delivery_latency_ms), 0) AS avg_latency_ms,\n  ROUND(MAX(mdl.delivery_latency_ms), 0) AS max_latency_ms\nFROM messages m\nJOIN chats c ON m.chat_id = c.chat_id\nJOIN message_delivery_log mdl ON m.message_id = mdl.message_id\nWHERE m.sent_at >= NOW() - INTERVAL \'48 hours\'\n  AND c.member_count > 50\nGROUP BY m.content_type\nORDER BY avg_latency_ms DESC;',
        correctQuerySqlite: 'SELECT\n  m.content_type,\n  COUNT(*) AS messages,\n  ROUND(AVG(mdl.delivery_latency_ms), 0) AS avg_latency_ms,\n  MAX(mdl.delivery_latency_ms) AS max_latency_ms\nFROM messages m\nJOIN chats c ON m.chat_id = c.chat_id\nJOIN message_delivery_log mdl ON m.message_id = mdl.message_id\nWHERE m.sent_at >= datetime(\'2026-06-07\')\n  AND c.member_count > 50\nGROUP BY m.content_type\nORDER BY avg_latency_ms DESC;',
        insight: 'Text and media messages in large groups have nearly identical latency spikes, confirming the bottleneck is in the membership fan-out query, not in payload delivery. The database lookup to determine group recipients is the slow path, regardless of message content.',
      },
    ],

    synthesis: {
      prompt: 'Write an incident summary for the VP of Engineering. This is an active incident affecting users.',
      keyElements: [
        'index migration as root cause',
        'sequential scan on group_members table',
        'affected percentage of messages quantified',
        'user complaint volume',
        'CONCURRENTLY index rebuild as remediation',
        'estimated fix time',
      ],
      modelAnswer: 'An index migration that ran 48 hours ago dropped the compound index on the group_members table before the replacement index finished building. This caused the message fan-out query to fall back to sequential scans, spiking P95 delivery latency from 1.0s to 4.4s overall. Large groups (50+ members) experience 4-9 second delivery times. Approximately 10% of all messages are affected (large and very large groups), generating over 2,000 user complaints. The issue is global across all regions and affects all message types equally. Immediate remediation: rebuild the original index on (group_id, user_id) with CONCURRENTLY to avoid table locks. Estimated fix time: 30-45 minutes for index rebuild. Post-fix, re-attempt the consolidation with a build-before-drop procedure.',
      rubric: [
        'Identifies the specific infrastructure change and its mechanism',
        'Quantifies user impact with message percentage and complaint volume',
        'Proposes concrete remediation with estimated timeline',
        'Includes a post-incident procedural improvement',
      ],
    },

    takeaway: 'When latency scales with group size, suspect a database query regression. Index migrations should always build new indexes before dropping old ones. The size-dependent pattern is the signature of a fan-out query falling back to sequential scans.',
  },

  {
    id: 'fl09',
    title: 'Driver Cancellation Rate Surge',
    domain: 'Ride-hailing',
    difficulty: 'senior',
    isFree: false,
    guestPreview: false,

    problem: {
      context: 'Your ride-hailing platform matches 300K rides per day. The pricing team recently deployed a new dynamic pricing algorithm that concentrates surge multipliers on rides over 5km. Driver-side cancellations have surged over the past 2 weeks.',
      metric: {
        name: 'Driver-side Cancellation Rate',
        current: '14.2%',
        previous: '11.1%',
        change: '+28%',
        period: 'Over 2 weeks',
        direction: 'up',
      },
      question: 'Driver-side cancellations surged from 11.1% to 14.2% over 2 weeks. Rider complaints about cancelled trips are increasing. What is your first move?',
      options: [
        { id: 'a', text: 'Segment cancellation rate by ride distance, time of day, and market to identify where the increase is concentrated', correct: true },
        { id: 'b', text: 'Increase cancellation penalties for drivers to discourage the behavior', correct: false },
        { id: 'c', text: 'Check if driver supply decreased, causing remaining drivers to be more selective', correct: false },
      ],
      explanation: 'Driver cancellations are driven by economics: drivers cancel rides that are not worth their time. Segmenting by distance, time, and market reveals whether the increase is uniform or concentrated in specific ride profiles. Increasing penalties without understanding the economic incentive treats the symptom, not the cause, and risks pushing drivers off the platform.',
    },

    decomposition: {
      prompt: 'Decompose the driver cancellation surge into a MECE framework. What economic and behavioral factors drive driver-side cancellations?',
      keyElements: [
        'ride distance and fare economics',
        'peak vs off-peak time segmentation',
        'driver earnings per hour comparison',
        'surge pricing distribution by distance',
        'driver opportunity cost analysis',
        'market-level variation',
      ],
      modelAnswer: 'MECE framework for driver cancellation surge: (1) Ride economics layer: Cancellation rate by ride distance bucket (<3km, 3-8km, 8km+) crossed with fare per ride. If short rides have high cancellation, the fare is too low relative to driver time. (2) Time economics layer: Peak vs off-peak, since opportunity cost differs. During peak, a driver declining a short ride can likely get a long ride quickly. (3) Pricing structure layer: How the surge multiplier is distributed across ride distances. If surge only applies to long rides, short rides become relatively less attractive during peak. (4) Driver earnings layer: Earnings per hour by ride distance to quantify the economic incentive gap. (5) Market layer: Different cities may have different distance distributions and therefore different exposure to the pricing change. (6) Driver supply layer: Supply-demand ratio by market to check if scarcity enables selectivity.',
    },

    schemaDesign: {
      prompt: 'Design the schema to investigate driver cancellations driven by a pricing algorithm change.',
      keyElements: [
        'ride_requests table with distance, fare, status, timestamps',
        'driver_cancellations table with reason',
        'surge_pricing table with multiplier and base_fare',
        'ride_completions table with actual fare and duration',
      ],
      modelAnswer: 'Core tables: (1) ride_requests (request_id, rider_id, driver_id, requested_at, status, estimated_distance_km, estimated_fare) tracking each ride request. (2) ride_completions (ride_id, request_id, actual_distance_km, actual_fare, duration_minutes, completed_at) for completed ride economics. (3) driver_cancellations (cancellation_id, request_id, driver_id, cancelled_at, reason) recording each driver-side cancellation. (4) surge_pricing (request_id, surge_multiplier, base_fare, final_fare) capturing the pricing applied to each request. The key analysis joins ride_requests with surge_pricing and driver_cancellations, segmented by distance and time of day, to reveal whether the pricing structure creates an earnings gap that incentivizes cancellation.',
    },

    queryChain: [
      {
        prompt: 'Write a query to calculate cancellation rate by ride distance bucket and peak/off-peak time for the last 14 days.',
        hints: [
          'Use CASE to bucket estimated_distance_km into <3km, 3-8km, 8km+',
          'Use EXTRACT(HOUR FROM ...) or strftime to classify peak vs off-peak',
        ],
        referenceQuery: 'SELECT\n  CASE\n    WHEN rr.estimated_distance_km < 3 THEN \'under_3km\'\n    WHEN rr.estimated_distance_km <= 8 THEN \'3-8km\'\n    ELSE \'8km_plus\'\n  END AS distance_bucket,\n  CASE\n    WHEN EXTRACT(HOUR FROM rr.requested_at) BETWEEN 7 AND 9\n      OR EXTRACT(HOUR FROM rr.requested_at) BETWEEN 17 AND 19\n    THEN \'peak\' ELSE \'off_peak\'\n  END AS time_period,\n  COUNT(*) AS total_requests,\n  SUM(CASE WHEN dc.cancellation_id IS NOT NULL THEN 1 ELSE 0 END) AS cancelled,\n  ROUND(100.0 * SUM(CASE WHEN dc.cancellation_id IS NOT NULL THEN 1 ELSE 0 END)\n    / COUNT(*), 1) AS cancel_rate\nFROM ride_requests rr\nLEFT JOIN driver_cancellations dc ON rr.request_id = dc.request_id\nWHERE rr.requested_at >= CURRENT_DATE - INTERVAL \'14 days\'\nGROUP BY distance_bucket, time_period\nORDER BY cancel_rate DESC;',
        correctQuerySqlite: 'SELECT\n  CASE\n    WHEN rr.estimated_distance_km < 3 THEN \'under_3km\'\n    WHEN rr.estimated_distance_km <= 8 THEN \'3-8km\'\n    ELSE \'8km_plus\'\n  END AS distance_bucket,\n  CASE\n    WHEN CAST(strftime(\'%H\', rr.requested_at) AS INTEGER) BETWEEN 7 AND 9\n      OR CAST(strftime(\'%H\', rr.requested_at) AS INTEGER) BETWEEN 17 AND 19\n    THEN \'peak\' ELSE \'off_peak\'\n  END AS time_period,\n  COUNT(*) AS total_requests,\n  SUM(CASE WHEN dc.cancellation_id IS NOT NULL THEN 1 ELSE 0 END) AS cancelled,\n  ROUND(100.0 * SUM(CASE WHEN dc.cancellation_id IS NOT NULL THEN 1 ELSE 0 END)\n    * 1.0 / COUNT(*), 1) AS cancel_rate\nFROM ride_requests rr\nLEFT JOIN driver_cancellations dc ON rr.request_id = dc.request_id\nWHERE rr.requested_at >= date(\'2026-05-26\')\nGROUP BY distance_bucket, time_period\nORDER BY cancel_rate DESC;',
        insight: 'Short rides (<3km) during peak hours have a 31.4% cancellation rate, more than double the prior period. Medium and long rides are stable regardless of time. The surge is concentrated in short-distance peak-hour rides.',
      },
      {
        prompt: 'Calculate driver earnings per hour by distance bucket for completed rides to quantify the economic incentive gap.',
        hints: [
          'Earnings per hour = actual_fare * 60 / duration_minutes for each completed ride',
          'Average by distance bucket to compare earnings across ride types',
        ],
        referenceQuery: 'SELECT\n  CASE\n    WHEN rr.estimated_distance_km < 3 THEN \'under_3km\'\n    WHEN rr.estimated_distance_km <= 8 THEN \'3-8km\'\n    ELSE \'8km_plus\'\n  END AS distance_bucket,\n  CASE\n    WHEN EXTRACT(HOUR FROM rr.requested_at) BETWEEN 7 AND 9\n      OR EXTRACT(HOUR FROM rr.requested_at) BETWEEN 17 AND 19\n    THEN \'peak\' ELSE \'off_peak\'\n  END AS time_period,\n  COUNT(*) AS completed_rides,\n  ROUND(AVG(rc.actual_fare), 2) AS avg_fare,\n  ROUND(AVG(rc.actual_fare * 60.0 / rc.duration_minutes), 2) AS earnings_per_hour\nFROM ride_requests rr\nJOIN ride_completions rc ON rr.request_id = rc.request_id\nWHERE rr.requested_at >= CURRENT_DATE - INTERVAL \'14 days\'\n  AND rc.duration_minutes > 0\nGROUP BY distance_bucket, time_period\nORDER BY earnings_per_hour DESC;',
        correctQuerySqlite: 'SELECT\n  CASE\n    WHEN rr.estimated_distance_km < 3 THEN \'under_3km\'\n    WHEN rr.estimated_distance_km <= 8 THEN \'3-8km\'\n    ELSE \'8km_plus\'\n  END AS distance_bucket,\n  CASE\n    WHEN CAST(strftime(\'%H\', rr.requested_at) AS INTEGER) BETWEEN 7 AND 9\n      OR CAST(strftime(\'%H\', rr.requested_at) AS INTEGER) BETWEEN 17 AND 19\n    THEN \'peak\' ELSE \'off_peak\'\n  END AS time_period,\n  COUNT(*) AS completed_rides,\n  ROUND(AVG(rc.actual_fare), 2) AS avg_fare,\n  ROUND(AVG(rc.actual_fare * 60.0 / rc.duration_minutes), 2) AS earnings_per_hour\nFROM ride_requests rr\nJOIN ride_completions rc ON rr.request_id = rc.request_id\nWHERE rr.requested_at >= date(\'2026-05-26\')\n  AND rc.duration_minutes > 0\nGROUP BY distance_bucket, time_period\nORDER BY earnings_per_hour DESC;',
        insight: 'During peak hours, drivers earn $37/hr on long rides vs $16.80/hr on short rides, a 2.2x gap. The new pricing algorithm concentrated surge on long rides, making short rides economically irrational during peak when drivers can wait for a better match.',
      },
      {
        prompt: 'Verify that the earnings gap widened after the pricing algorithm change by comparing surge multipliers by distance bucket before and after the deployment.',
        hints: [
          'Join ride_requests with surge_pricing to get the multiplier per ride',
          'Compare average surge multiplier by distance bucket across two time periods',
        ],
        referenceQuery: 'SELECT\n  CASE\n    WHEN rr.estimated_distance_km < 3 THEN \'under_3km\'\n    WHEN rr.estimated_distance_km <= 8 THEN \'3-8km\'\n    ELSE \'8km_plus\'\n  END AS distance_bucket,\n  CASE WHEN rr.requested_at >= CURRENT_DATE - INTERVAL \'14 days\'\n    THEN \'post_change\' ELSE \'pre_change\' END AS period,\n  ROUND(AVG(sp.surge_multiplier), 2) AS avg_surge,\n  ROUND(AVG(sp.final_fare), 2) AS avg_final_fare\nFROM ride_requests rr\nJOIN surge_pricing sp ON rr.request_id = sp.request_id\nWHERE rr.requested_at >= CURRENT_DATE - INTERVAL \'28 days\'\nGROUP BY distance_bucket, period\nORDER BY distance_bucket, period;',
        correctQuerySqlite: 'SELECT\n  CASE\n    WHEN rr.estimated_distance_km < 3 THEN \'under_3km\'\n    WHEN rr.estimated_distance_km <= 8 THEN \'3-8km\'\n    ELSE \'8km_plus\'\n  END AS distance_bucket,\n  CASE WHEN rr.requested_at >= date(\'2026-05-26\')\n    THEN \'post_change\' ELSE \'pre_change\' END AS period,\n  ROUND(AVG(sp.surge_multiplier), 2) AS avg_surge,\n  ROUND(AVG(sp.final_fare), 2) AS avg_final_fare\nFROM ride_requests rr\nJOIN surge_pricing sp ON rr.request_id = sp.request_id\nWHERE rr.requested_at >= date(\'2026-05-12\')\nGROUP BY distance_bucket, period\nORDER BY distance_bucket, period;',
        insight: 'Post-change, the average surge multiplier for 8km+ rides increased from 1.4x to 1.9x while short rides stayed flat at 1.1x. The old algorithm applied uniform surge; the new one concentrates it on long rides, confirming the pricing algorithm created the earnings gap.',
      },
    ],

    synthesis: {
      prompt: 'Write an ops brief explaining the cancellation surge and proposing a pricing-based solution.',
      keyElements: [
        'pricing algorithm as root cause',
        'earnings gap quantified ($37/hr vs $16.80/hr)',
        'additional cancelled rides per week',
        'minimum fare floor recommendation',
        'graduated approach by market',
        'rider cost impact bounded',
      ],
      modelAnswer: 'The new dynamic pricing algorithm concentrates surge on rides over 5km, leaving short-ride fares flat during peak. This creates a 2.2x earnings gap ($37/hr for long rides vs $16.80/hr for short rides during peak), making short rides economically irrational for drivers to accept. Driver cancellations for sub-3km peak rides more than doubled to 31.4%, causing an estimated 14,000 additional rider-facing cancellations per week. Recommended fix: introduce a graduated minimum fare floor for short rides during peak, starting at $5.50 (a $1.30 rider cost increase) and dynamically rising to $6.50 in markets where cancellation rates exceed 20%, with a hard cap at $7.00. This closes most of the earnings gap while keeping rider cost increases under $2.50. Deploy at the market level to avoid within-city driver confusion.',
      rubric: [
        'Explains the economic incentive misalignment with specific numbers',
        'Quantifies the rider impact in additional cancellations per week',
        'Proposes a graduated pricing intervention, not a blanket change',
        'Bounds the rider cost impact with a hard cap',
      ],
    },

    takeaway: 'In two-sided marketplaces, optimizing pricing for one side can catastrophically misalign incentives for the other. Driver cancellations are a rational economic response to earnings gaps, not a behavioral problem to be penalized.',
  },

  {
    id: 'fl10',
    title: 'Patient No-Show Rate Increase',
    domain: 'Healthcare / Telehealth',
    difficulty: 'staff',
    isFree: false,
    guestPreview: false,

    problem: {
      context: 'Your telehealth platform handles 25,000 appointments per month across new and returning patients. The notifications team recently changed reminder timing from 2 hours before appointments to 24 hours before, intending to give patients more preparation time. No-show rates have climbed steadily over the past month.',
      metric: {
        name: 'Telehealth No-Show Rate',
        current: '22.1%',
        previous: '12.1%',
        change: '+83%',
        period: 'Month-over-month',
        direction: 'up',
      },
      question: 'Telehealth no-show rate increased from 12.1% to 22.1% over the past month. Providers are reporting idle slots. What is your first move?',
      options: [
        { id: 'a', text: 'Segment no-show rate by booking lead time, patient type, and reminder delivery to isolate the affected cohort', correct: true },
        { id: 'b', text: 'Implement a no-show fee to discourage missed appointments', correct: false },
        { id: 'c', text: 'Check if provider availability decreased, causing longer wait times', correct: false },
      ],
      explanation: 'No-show rates vary by booking characteristics. Segmenting by lead time (how far in advance), patient type (new vs returning), and reminder delivery status reveals whether the cause is behavioral, systemic, or technical. No-show fees in healthcare raise access-to-care concerns and should not precede diagnosis. Provider availability changes would not produce a cohort-specific pattern.',
    },

    decomposition: {
      prompt: 'Decompose the no-show rate increase into a MECE framework. What factors influence whether a patient shows up for a telehealth appointment?',
      keyElements: [
        'booking lead time buckets',
        'patient type (new vs returning)',
        'reminder delivery and timing',
        'reminder channel effectiveness',
        'appointment type (initial vs follow-up)',
        'time-of-day and day-of-week patterns',
      ],
      modelAnswer: 'MECE framework for no-show rate increase: (1) Booking lead time layer: Same-day, next-day, 2-3 days, 4+ days to identify which booking window is affected. (2) Patient type layer: New patients (no platform habits) vs returning patients (established patterns). (3) Reminder delivery layer: Reminder delivery rate, open rate, and timing relative to appointment to detect notification failures. (4) Reminder channel layer: SMS vs email vs push notification effectiveness by patient segment. (5) Appointment type layer: Initial consultation vs follow-up vs specialist referral to catch type-specific patterns. (6) Temporal layer: Day of week and time of day patterns in no-shows. The critical cross-tabulation is lead time x patient type x reminder timing, because the reminder timing change would affect different lead time buckets differently.',
    },

    schemaDesign: {
      prompt: 'Design the schema to investigate a no-show rate increase potentially caused by a reminder timing change.',
      keyElements: [
        'appointments table with scheduled_at, booked_at, status, appointment_type',
        'patients table with first_appointment_date, total_visits',
        'reminders table with sent_at, channel, opened',
      ],
      modelAnswer: 'Core tables: (1) appointments (appointment_id, patient_id, provider_id, scheduled_at, booked_at, status, appointment_type) tracking each appointment with booking and scheduled timestamps. (2) patients (patient_id, first_appointment_date, total_visits, insurance_type) for patient classification and segmentation. (3) reminders (reminder_id, appointment_id, sent_at, channel, opened) tracking each reminder with delivery timing and engagement. The critical analysis computes booking lead time as DATE(scheduled_at) - DATE(booked_at) to bucket appointments, then joins with reminders to correlate reminder timing and open rates with no-show behavior by lead time bucket.',
    },

    queryChain: [
      {
        prompt: 'Write a query to calculate no-show rate by booking lead time bucket and patient type for the last 30 days.',
        hints: [
          'Calculate lead time as the difference between scheduled_at and booked_at dates',
          'Use CASE to classify patients as new (total_visits <= 1) vs returning',
        ],
        referenceQuery: 'SELECT\n  CASE\n    WHEN DATE(a.scheduled_at) = DATE(a.booked_at) THEN \'same_day\'\n    WHEN DATE(a.scheduled_at) = DATE(a.booked_at) + INTERVAL \'1 day\' THEN \'next_day\'\n    WHEN DATE(a.scheduled_at) <= DATE(a.booked_at) + INTERVAL \'3 days\' THEN \'2-3_days\'\n    ELSE \'4_plus_days\'\n  END AS lead_time,\n  CASE WHEN p.total_visits <= 1 THEN \'new\' ELSE \'returning\' END AS patient_type,\n  COUNT(*) AS total_appointments,\n  SUM(CASE WHEN a.status = \'no_show\' THEN 1 ELSE 0 END) AS no_shows,\n  ROUND(100.0 * SUM(CASE WHEN a.status = \'no_show\' THEN 1 ELSE 0 END)\n    / COUNT(*), 1) AS no_show_rate\nFROM appointments a\nJOIN patients p ON a.patient_id = p.patient_id\nWHERE a.scheduled_at >= CURRENT_DATE - INTERVAL \'30 days\'\nGROUP BY lead_time, patient_type\nORDER BY no_show_rate DESC;',
        correctQuerySqlite: 'SELECT\n  CASE\n    WHEN date(a.scheduled_at) = date(a.booked_at) THEN \'same_day\'\n    WHEN date(a.scheduled_at) = date(a.booked_at, \'+1 day\') THEN \'next_day\'\n    WHEN date(a.scheduled_at) <= date(a.booked_at, \'+3 days\') THEN \'2-3_days\'\n    ELSE \'4_plus_days\'\n  END AS lead_time,\n  CASE WHEN p.total_visits <= 1 THEN \'new\' ELSE \'returning\' END AS patient_type,\n  COUNT(*) AS total_appointments,\n  SUM(CASE WHEN a.status = \'no_show\' THEN 1 ELSE 0 END) AS no_shows,\n  ROUND(100.0 * SUM(CASE WHEN a.status = \'no_show\' THEN 1 ELSE 0 END)\n    * 1.0 / COUNT(*), 1) AS no_show_rate\nFROM appointments a\nJOIN patients p ON a.patient_id = p.patient_id\nWHERE a.scheduled_at >= date(\'2026-05-09\')\nGROUP BY lead_time, patient_type\nORDER BY no_show_rate DESC;',
        insight: 'Next-day bookings for new patients have a 38.6% no-show rate (up 23.8pp). Next-day returning patients also spiked (+7.9pp). Same-day and 4+ day bookings are nearly unchanged. The problem is concentrated in next-day appointments.',
      },
      {
        prompt: 'Now check reminder open rates by lead time bucket to see if the 24-hour reminder is being seen by next-day patients.',
        hints: [
          'Join appointments with reminders on appointment_id',
          'Calculate the open rate (opened / sent) by lead time bucket',
        ],
        referenceQuery: 'SELECT\n  CASE\n    WHEN DATE(a.scheduled_at) = DATE(a.booked_at) THEN \'same_day\'\n    WHEN DATE(a.scheduled_at) = DATE(a.booked_at) + INTERVAL \'1 day\' THEN \'next_day\'\n    WHEN DATE(a.scheduled_at) <= DATE(a.booked_at) + INTERVAL \'3 days\' THEN \'2-3_days\'\n    ELSE \'4_plus_days\'\n  END AS lead_time,\n  COUNT(r.reminder_id) AS reminders_sent,\n  SUM(CASE WHEN r.opened = TRUE THEN 1 ELSE 0 END) AS reminders_opened,\n  ROUND(100.0 * SUM(CASE WHEN r.opened = TRUE THEN 1 ELSE 0 END)\n    / NULLIF(COUNT(r.reminder_id), 0), 1) AS open_rate\nFROM appointments a\nJOIN reminders r ON a.appointment_id = r.appointment_id\nWHERE a.scheduled_at >= CURRENT_DATE - INTERVAL \'30 days\'\nGROUP BY lead_time\nORDER BY open_rate ASC;',
        correctQuerySqlite: 'SELECT\n  CASE\n    WHEN date(a.scheduled_at) = date(a.booked_at) THEN \'same_day\'\n    WHEN date(a.scheduled_at) = date(a.booked_at, \'+1 day\') THEN \'next_day\'\n    WHEN date(a.scheduled_at) <= date(a.booked_at, \'+3 days\') THEN \'2-3_days\'\n    ELSE \'4_plus_days\'\n  END AS lead_time,\n  COUNT(r.reminder_id) AS reminders_sent,\n  SUM(CASE WHEN r.opened = 1 THEN 1 ELSE 0 END) AS reminders_opened,\n  ROUND(100.0 * SUM(CASE WHEN r.opened = 1 THEN 1 ELSE 0 END)\n    * 1.0 / MAX(COUNT(r.reminder_id), 1), 1) AS open_rate\nFROM appointments a\nJOIN reminders r ON a.appointment_id = r.appointment_id\nWHERE a.scheduled_at >= date(\'2026-05-09\')\nGROUP BY lead_time\nORDER BY open_rate ASC;',
        insight: 'Next-day appointment reminders have a 24.3% open rate, down from ~78% when reminders were sent 2 hours before. The 24-hour reminder arrives at 10am the day before, gets buried under overnight notifications, and is forgotten by the appointment time. Same-day reminders still have 82%+ open rates.',
      },
      {
        prompt: 'Check the correlation between reminder open rate and no-show rate across all segments to confirm that reminder visibility drives attendance.',
        hints: [
          'Aggregate by lead_time and patient_type, calculate both no-show rate and reminder open rate',
          'Look for an inverse correlation between the two metrics',
        ],
        referenceQuery: 'SELECT\n  CASE\n    WHEN DATE(a.scheduled_at) = DATE(a.booked_at) THEN \'same_day\'\n    WHEN DATE(a.scheduled_at) = DATE(a.booked_at) + INTERVAL \'1 day\' THEN \'next_day\'\n    WHEN DATE(a.scheduled_at) <= DATE(a.booked_at) + INTERVAL \'3 days\' THEN \'2-3_days\'\n    ELSE \'4_plus_days\'\n  END AS lead_time,\n  CASE WHEN p.total_visits <= 1 THEN \'new\' ELSE \'returning\' END AS patient_type,\n  COUNT(*) AS appointments,\n  ROUND(100.0 * SUM(CASE WHEN a.status = \'no_show\' THEN 1 ELSE 0 END)\n    / COUNT(*), 1) AS no_show_rate,\n  ROUND(100.0 * SUM(CASE WHEN r.opened = TRUE THEN 1 ELSE 0 END)\n    / NULLIF(COUNT(r.reminder_id), 0), 1) AS reminder_open_rate\nFROM appointments a\nJOIN patients p ON a.patient_id = p.patient_id\nLEFT JOIN reminders r ON a.appointment_id = r.appointment_id\nWHERE a.scheduled_at >= CURRENT_DATE - INTERVAL \'30 days\'\nGROUP BY lead_time, patient_type\nORDER BY no_show_rate DESC;',
        correctQuerySqlite: 'SELECT\n  CASE\n    WHEN date(a.scheduled_at) = date(a.booked_at) THEN \'same_day\'\n    WHEN date(a.scheduled_at) = date(a.booked_at, \'+1 day\') THEN \'next_day\'\n    WHEN date(a.scheduled_at) <= date(a.booked_at, \'+3 days\') THEN \'2-3_days\'\n    ELSE \'4_plus_days\'\n  END AS lead_time,\n  CASE WHEN p.total_visits <= 1 THEN \'new\' ELSE \'returning\' END AS patient_type,\n  COUNT(*) AS appointments,\n  ROUND(100.0 * SUM(CASE WHEN a.status = \'no_show\' THEN 1 ELSE 0 END)\n    * 1.0 / COUNT(*), 1) AS no_show_rate,\n  ROUND(100.0 * SUM(CASE WHEN r.opened = 1 THEN 1 ELSE 0 END)\n    * 1.0 / MAX(COUNT(r.reminder_id), 1), 1) AS reminder_open_rate\nFROM appointments a\nJOIN patients p ON a.patient_id = p.patient_id\nLEFT JOIN reminders r ON a.appointment_id = r.appointment_id\nWHERE a.scheduled_at >= date(\'2026-05-09\')\nGROUP BY lead_time, patient_type\nORDER BY no_show_rate DESC;',
        insight: 'There is a strong inverse correlation: next-day new patients have 24.3% reminder open rate and 38.6% no-show rate. Same-day patients have 82%+ open rate and 8-12% no-show rate. The reminder timing change directly caused the no-show spike by sending reminders too early for next-day appointments.',
      },
    ],

    synthesis: {
      prompt: 'Write a brief for the clinical operations team explaining the no-show spike, root cause, and recommended dual-reminder strategy.',
      keyElements: [
        'reminder timing change as root cause',
        'notification decay curve concept',
        'next-day new patient impact quantified',
        'lost appointment slots and revenue',
        'dual-reminder strategy proposal',
        'access-to-care dimension',
      ],
      modelAnswer: 'The reminder timing change from 2 hours before to 24 hours before appointments is driving a near-doubling of no-show rates, concentrated in next-day bookings. New patients booking next-day now have a 38.6% no-show rate (up from 14.8%), with reminder open rates dropping from 78% to 24.3% because the 24-hour reminder is buried under overnight notifications. This has created approximately 2,800 additional no-shows per month, costing an estimated $420K in lost provider revenue and reducing access for patients who could have filled those slots. Recommended fix: implement a dual-reminder strategy with both a 24-hour advance reminder (for preparation) and a 2-hour actionable reminder (for attendance). This preserves the advance notice benefit while restoring the day-of prompt that drives attendance. The 2-hour reminder arrives during the patient\'s active scheduling window, when they are most likely to act on it.',
      rubric: [
        'Explains the notification timing mechanism with open rate evidence',
        'Quantifies both clinical (no-show count) and financial impact',
        'Proposes a dual-reminder solution rather than simple revert',
        'Addresses the access-to-care dimension of unused appointment slots',
      ],
    },

    takeaway: 'Notification timing should be designed around the user\'s decision moment, not the business\'s preferred communication window. A reminder that arrives too early is effectively invisible due to notification decay.',
  },
];

export var fullLoopCasesById = {};
fullLoopCases.forEach(function(c) { fullLoopCasesById[c.id] = c; });
