export const fullLoopCases = [
  {
    id: 'fl01',
    title: 'Checkout Conversion Drop',
    domain: 'E-commerce',
    difficulty: 'analyst',
    isFree: true,
    guestPreview: true,
    phases: [
      {
        type: 'alert',
        title: 'The Alert',
        metricName: 'Checkout CVR',
        metricValue: '3.2%',
        metricChange: '-12% WoW',
        prompt: 'Your dashboard shows checkout conversion rate dropped 12% week-over-week. What is your first move?',
        options: [
          {
            id: 'a',
            text: 'Segment the funnel by step to isolate where the drop occurs',
            correct: true,
            feedback: 'Correct. Before jumping to root causes, you need to narrow the problem. Segmenting the funnel by step tells you whether the issue is at cart addition, address entry, payment, or confirmation. This prevents wasted investigation into areas that are performing normally.'
          },
          {
            id: 'b',
            text: 'Immediately alert the engineering team about a potential site outage',
            correct: false,
            feedback: 'Premature. A 12% WoW drop is significant but does not necessarily indicate an outage. If the site were down, you would see a much steeper drop and likely have uptime alerts firing independently. Start with data segmentation before escalating.'
          },
          {
            id: 'c',
            text: 'Check if a marketing campaign ended recently',
            correct: false,
            feedback: 'Marketing campaign changes typically affect top-of-funnel traffic volume and quality, not checkout conversion rate specifically. A CVR drop suggests something is breaking within the checkout flow itself. Start by segmenting the funnel steps.'
          },
        ],
      },
      {
        type: 'data',
        title: 'Read the Data',
        prompt: 'Here is the funnel breakdown for the last 2 weeks vs prior 2 weeks. What stands out?',
        dataTable: {
          headers: ['Stage', 'This Week', 'Last Week', 'Change'],
          rows: [
            ['Landing to PDP', '45.2%', '44.8%', '+0.4%'],
            ['PDP to Cart', '12.1%', '12.3%', '-0.2%'],
            ['Cart to Address', '68.5%', '69.0%', '-0.5%'],
            ['Address to Payment', '72.3%', '71.8%', '+0.5%'],
            ['Payment to Confirmation', '41.2%', '58.7%', '-17.5%'],
          ],
        },
        guideQuestion: 'Which stage shows the largest drop? What could explain it?',
        modelObservation: 'The drop is entirely concentrated at the Payment to Confirmation step, which fell 17.5 percentage points. All other funnel stages are stable within normal variance. This points to a payment processing issue rather than a traffic quality or product discovery problem. The next step is to break down payment completion by payment method to see if one method is disproportionately affected.',
        keyPhrases: ['payment', 'confirmation', '17.5', 'payment method', 'funnel'],
      },
      {
        type: 'rca',
        title: 'Root Cause',
        prompt: 'Based on the data, what is the most likely root cause of the payment step drop?',
        options: [
          {
            id: 'a',
            text: 'A new payment provider integration broke the UPI payment flow',
            correct: true,
            feedback: 'Correct. The drop is isolated to the payment-to-confirmation step, which strongly suggests a payment processing issue. When you segment by payment method, UPI completion rate dropped from 62% to 28% while credit card and net banking remained stable. The engineering changelog shows a payment provider migration went live 8 days ago.'
          },
          {
            id: 'b',
            text: 'Seasonal demand shift reduced purchase intent',
            correct: false,
            feedback: 'Seasonal demand changes would affect top-of-funnel metrics like PDP visits and cart additions, not specifically the payment step. The data shows all upstream stages are stable. A user who reaches the payment step has strong purchase intent regardless of season.'
          },
          {
            id: 'c',
            text: 'A pricing page A/B test is causing side effects at checkout',
            correct: false,
            feedback: 'While A/B tests can sometimes leak effects into downstream flows, the pricing page test only changes how prices are displayed on the PDP. If it were affecting checkout, you would expect to see a change in the Cart-to-Address or Address-to-Payment steps where users reconsider pricing. The payment-to-confirmation drop points to a technical issue with payment processing itself.'
          },
        ],
      },
      {
        type: 'sql',
        title: 'Investigate with SQL',
        schema: {
          tables: [
            {
              name: 'orders',
              columns: ['order_id INT', 'user_id INT', 'created_at TIMESTAMP', 'payment_method TEXT', 'status TEXT', 'amount DECIMAL'],
            },
            {
              name: 'payments',
              columns: ['payment_id INT', 'order_id INT', 'method TEXT', 'status TEXT', 'attempted_at TIMESTAMP', 'completed_at TIMESTAMP'],
            },
            {
              name: 'users',
              columns: ['user_id INT', 'signup_date DATE', 'platform TEXT', 'city TEXT'],
            },
          ],
        },
        task: 'Write a query to find checkout completion rate by payment method for the last 2 weeks vs the prior 2 weeks.',
        correctQuery: 'SELECT p.method, SUM(CASE WHEN p.attempted_at >= CURRENT_DATE - INTERVAL \'14 days\' THEN 1 ELSE 0 END) AS this_period_attempts, SUM(CASE WHEN p.attempted_at >= CURRENT_DATE - INTERVAL \'14 days\' AND p.status = \'completed\' THEN 1 ELSE 0 END) AS this_period_completed, ROUND(100.0 * SUM(CASE WHEN p.attempted_at >= CURRENT_DATE - INTERVAL \'14 days\' AND p.status = \'completed\' THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN p.attempted_at >= CURRENT_DATE - INTERVAL \'14 days\' THEN 1 ELSE 0 END), 0), 1) AS this_period_cvr, SUM(CASE WHEN p.attempted_at < CURRENT_DATE - INTERVAL \'14 days\' AND p.attempted_at >= CURRENT_DATE - INTERVAL \'28 days\' THEN 1 ELSE 0 END) AS last_period_attempts, SUM(CASE WHEN p.attempted_at < CURRENT_DATE - INTERVAL \'14 days\' AND p.attempted_at >= CURRENT_DATE - INTERVAL \'28 days\' AND p.status = \'completed\' THEN 1 ELSE 0 END) AS last_period_completed, ROUND(100.0 * SUM(CASE WHEN p.attempted_at < CURRENT_DATE - INTERVAL \'14 days\' AND p.attempted_at >= CURRENT_DATE - INTERVAL \'28 days\' AND p.status = \'completed\' THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN p.attempted_at < CURRENT_DATE - INTERVAL \'14 days\' AND p.attempted_at >= CURRENT_DATE - INTERVAL \'28 days\' THEN 1 ELSE 0 END), 0), 1) AS last_period_cvr FROM payments p WHERE p.attempted_at >= CURRENT_DATE - INTERVAL \'28 days\' GROUP BY p.method ORDER BY this_period_cvr ASC',
        correctQueryFormatted: [
          'SELECT p.method,',
          '  SUM(CASE WHEN p.attempted_at >= CURRENT_DATE - INTERVAL \'14 days\'',
          '    THEN 1 ELSE 0 END) AS this_period_attempts,',
          '  SUM(CASE WHEN p.attempted_at >= CURRENT_DATE - INTERVAL \'14 days\'',
          '    AND p.status = \'completed\' THEN 1 ELSE 0 END) AS this_period_completed,',
          '  ROUND(100.0 * SUM(CASE WHEN p.attempted_at >= CURRENT_DATE - INTERVAL \'14 days\'',
          '    AND p.status = \'completed\' THEN 1 ELSE 0 END)',
          '    / NULLIF(SUM(CASE WHEN p.attempted_at >= CURRENT_DATE - INTERVAL \'14 days\'',
          '    THEN 1 ELSE 0 END), 0), 1) AS this_period_cvr,',
          '  SUM(CASE WHEN p.attempted_at < CURRENT_DATE - INTERVAL \'14 days\'',
          '    AND p.attempted_at >= CURRENT_DATE - INTERVAL \'28 days\'',
          '    THEN 1 ELSE 0 END) AS last_period_attempts,',
          '  SUM(CASE WHEN p.attempted_at < CURRENT_DATE - INTERVAL \'14 days\'',
          '    AND p.attempted_at >= CURRENT_DATE - INTERVAL \'28 days\'',
          '    AND p.status = \'completed\' THEN 1 ELSE 0 END) AS last_period_completed,',
          '  ROUND(100.0 * SUM(CASE WHEN p.attempted_at < CURRENT_DATE - INTERVAL \'14 days\'',
          '    AND p.attempted_at >= CURRENT_DATE - INTERVAL \'28 days\'',
          '    AND p.status = \'completed\' THEN 1 ELSE 0 END)',
          '    / NULLIF(SUM(CASE WHEN p.attempted_at < CURRENT_DATE - INTERVAL \'14 days\'',
          '    AND p.attempted_at >= CURRENT_DATE - INTERVAL \'28 days\'',
          '    THEN 1 ELSE 0 END), 0), 1) AS last_period_cvr',
          'FROM payments p',
          'WHERE p.attempted_at >= CURRENT_DATE - INTERVAL \'28 days\'',
          'GROUP BY p.method',
          'ORDER BY this_period_cvr ASC',
        ],
        keyElements: ['payment', 'method', 'GROUP BY', 'INTERVAL', 'status', 'completed'],
        expectedOutput: {
          headers: ['payment_method', 'this_week_cvr', 'last_week_cvr', 'change'],
          rows: [
            ['UPI', '28.1%', '62.4%', '-55.0%'],
            ['Credit Card', '74.2%', '75.0%', '-1.1%'],
            ['Net Banking', '58.9%', '59.3%', '-0.7%'],
            ['Debit Card', '65.1%', '66.2%', '-1.7%'],
          ],
        },
        hints: ['Think about grouping by payment method', 'Use a date filter to compare the two 14-day windows', 'Calculate completion rate as completed payments divided by attempted payments'],
      },
      {
        type: 'communicate',
        title: 'Write the Brief',
        prompt: 'Write a 3-line stakeholder brief explaining what happened, the impact, and your recommended next step.',
        modelAnswer: 'The UPI payment integration migrated on Jan 15 is failing for 72% of UPI transactions, causing overall checkout CVR to drop 12% WoW. This is estimated to cost approximately 840 lost orders per day based on current UPI attempt volume. Recommended next step: immediately roll back to the previous UPI provider while engineering investigates the integration failure, and monitor CVR recovery over 48 hours.',
        rubric: ['States the root cause clearly', 'Quantifies the impact in business terms', 'Proposes a concrete and time-bound next step'],
        keyPhrases: ['UPI', 'payment', '72%', '840', 'roll back', 'integration'],
      },
      {
        type: 'experiment',
        title: 'Design the Test',
        prompt: 'The UPI provider fix has been deployed. Design an A/B test to validate it works before full rollout.',
        fields: [
          {
            label: 'Hypothesis',
            type: 'mcq',
            options: [
              { id: 'a', text: 'Switching to the fixed UPI integration will restore checkout completion rate for UPI users to pre-migration levels (above 60%)', correct: true },
              { id: 'b', text: 'Rolling back the entire payment stack will improve overall checkout conversion by 15%', correct: false },
              { id: 'c', text: 'Adding a retry mechanism to the current UPI flow will recover 50% of failed transactions', correct: false },
            ],
            correctAnswer: 'The hypothesis should directly test the fix against the specific failure. Option A correctly targets UPI completion rate restoration to pre-migration levels.',
          },
          {
            label: 'Unit of randomization',
            type: 'mcq',
            options: [
              { id: 'a', text: 'User-level randomization, assigning each user to either the old fallback provider or the new fixed provider for all their UPI transactions', correct: true },
              { id: 'b', text: 'Transaction-level randomization, randomly routing each individual payment attempt to either provider', correct: false },
              { id: 'c', text: 'Session-level randomization, assigning each checkout session to a provider independently', correct: false },
            ],
            correctAnswer: 'User-level randomization ensures consistent experience. Transaction-level randomization could give the same user different experiences across attempts, contaminating the measurement.',
          },
          {
            label: 'Primary metric',
            type: 'mcq',
            options: [
              { id: 'a', text: 'UPI payment completion rate (completed UPI payments / attempted UPI payments)', correct: true },
              { id: 'b', text: 'Overall checkout conversion rate across all payment methods', correct: false },
              { id: 'c', text: 'Revenue per user for UPI transactions', correct: false },
              { id: 'd', text: 'Time to payment confirmation for UPI users', correct: false },
            ],
            correctAnswer: 'UPI payment completion rate directly measures the fix. Overall CVR dilutes the signal with unaffected payment methods. Revenue and time are secondary to whether payments actually complete.',
          },
          {
            label: 'Guardrail metrics',
            type: 'multi',
            options: [
              { id: 'a', text: 'Payment error rate', correct: true },
              { id: 'b', text: 'Average transaction processing time', correct: true },
              { id: 'c', text: 'Customer support ticket volume related to payments', correct: true },
              { id: 'd', text: 'Homepage bounce rate', correct: false },
              { id: 'e', text: 'Product page view count', correct: false },
            ],
            correctAnswer: 'Payment error rate, processing time, and support tickets are directly related to payment health. Homepage bounce rate and product page views are upstream metrics unaffected by the payment provider change.',
          },
        ],
      },
      {
        type: 'readout',
        title: 'The Readout',
        prompt: 'The experiment ran for 2 weeks. Here are the results:',
        resultsTable: {
          headers: ['Metric', 'Control', 'Treatment', 'Lift', 'p-value'],
          rows: [
            ['UPI Completion Rate', '28.3%', '63.8%', '+125.4%', '<0.001'],
            ['Overall Checkout CVR', '3.1%', '3.6%', '+15.2%', '<0.001'],
            ['Payment Error Rate', '18.2%', '2.1%', '-88.5%', '<0.001'],
            ['Avg Processing Time', '4.2s', '3.8s', '-9.5%', '0.04'],
            ['Support Tickets (payments)', '142/week', '31/week', '-78.2%', '<0.001'],
          ],
        },
        question: 'What is your recommendation?',
        options: [
          {
            id: 'ship',
            text: 'Ship to 100%',
            correct: true,
            feedback: 'Correct. The treatment shows a clear and statistically significant recovery of UPI completion rate back to pre-migration levels. All guardrail metrics are either improved or neutral. There is no reason to delay the rollout given the magnitude of the improvement and the cost of leaving the broken integration in place.'
          },
          {
            id: 'no-ship',
            text: 'Do not ship',
            correct: false,
            feedback: 'There is no basis for not shipping. Every metric improved significantly in the treatment group. The UPI completion rate recovered to expected levels, payment errors dropped dramatically, and processing time improved. Keeping the broken integration live costs approximately 840 orders per day.'
          },
          {
            id: 'investigate',
            text: 'Investigate further before deciding',
            correct: false,
            feedback: 'While caution is generally wise, the results here are unambiguous. All metrics improved with high statistical significance and no guardrail violations. The broken UPI integration is actively costing revenue every day. Further investigation would only be warranted if there were mixed signals across metrics, which is not the case here.'
          },
        ],
        debrief: 'This case illustrates a clean end-to-end analyst workflow: alert triage, funnel segmentation, root cause isolation, SQL investigation, stakeholder communication, experiment design, and ship decision. The key lesson is that payment step drops almost always indicate a technical integration issue rather than a demand or marketing problem. The experiment results were unambiguous because the root cause was a clear technical regression, not a tradeoff. In practice, most cases are this straightforward once you segment the funnel correctly. The discipline is in not jumping to conclusions before the data confirms the hypothesis.',
      },
    ],
  },
  {
    id: 'fl02',
    title: 'DAU Drop on Content Platform',
    domain: 'Content / Media',
    difficulty: 'analyst',
    isFree: true,
    guestPreview: false,
    phases: [
      {
        type: 'alert',
        title: 'The Alert',
        metricName: 'Daily Active Users',
        metricValue: '1.84M',
        metricChange: '-8% over 2 weeks',
        prompt: 'DAU on your content platform has declined 8% over the past 2 weeks. The decline is gradual, not a cliff. What is your first move?',
        options: [
          {
            id: 'a',
            text: 'Segment DAU by platform (iOS, Android, Web) to see if the drop is concentrated',
            correct: true,
            feedback: 'Correct. A gradual decline across 2 weeks could have many causes. Segmenting by platform is the fastest way to narrow the search space. If the drop is concentrated on one platform, you can immediately focus your investigation on platform-specific changes like app updates, OS changes, or notification delivery.'
          },
          {
            id: 'b',
            text: 'Check if content publishing volume has decreased',
            correct: false,
            feedback: 'Content volume changes could affect DAU, but this is too specific a hypothesis to start with. You have not yet established whether the drop is across all surfaces or isolated to one platform. Start broad with segmentation before testing specific hypotheses.'
          },
          {
            id: 'c',
            text: 'Review competitor launches in the last 2 weeks',
            correct: false,
            feedback: 'Competitor activity is hard to measure directly and usually explains gradual long-term trends rather than a 2-week drop. Even if a competitor launched something, you need to understand which of your user segments are affected before you can assess whether the competitor is the cause. Start with platform segmentation.'
          },
        ],
      },
      {
        type: 'data',
        title: 'Read the Data',
        prompt: 'Here is DAU broken down by platform over the last 4 weeks. What stands out?',
        dataTable: {
          headers: ['Platform', 'Weeks 1-2 Avg DAU', 'Weeks 3-4 Avg DAU', 'Change'],
          rows: [
            ['iOS', '820K', '680K', '-17.1%'],
            ['Android', '740K', '745K', '+0.7%'],
            ['Web', '440K', '435K', '-1.1%'],
            ['Total', '2.00M', '1.86M', '-7.0%'],
          ],
        },
        guideQuestion: 'Which platform is driving the drop? What are iOS-specific factors that could explain this?',
        modelObservation: 'The DAU drop is almost entirely driven by iOS, which declined 17.1% while Android and Web remained flat. This immediately narrows the investigation to iOS-specific changes. The top candidates are: an iOS app update that introduced a bug, an iOS version update that changed permissions or background behavior, or a change in push notification delivery on iOS. The next step is to check the iOS release log and push notification delivery rates.',
        keyPhrases: ['iOS', '17.1', 'Android', 'push notification', 'platform'],
      },
      {
        type: 'rca',
        title: 'Root Cause',
        prompt: 'Further investigation shows iOS push notification delivery rate dropped from 84% to 31% two weeks ago, coinciding with an app update. What is the most likely root cause?',
        options: [
          {
            id: 'a',
            text: 'The iOS app update broke push notification registration, causing most users to stop receiving notifications',
            correct: true,
            feedback: 'Correct. The timing of the push notification delivery drop coincides exactly with the app update. Push notifications are the primary re-engagement channel for content platforms, driving 35-45% of daily opens. When notification registration breaks, users simply forget to open the app, leading to a gradual DAU decline rather than a sudden cliff. The gradual pattern matches because users who were already in the app continued their sessions, but lapsed users were never pulled back.'
          },
          {
            id: 'b',
            text: 'Content quality declined, causing users to disengage',
            correct: false,
            feedback: 'If content quality were the issue, you would expect to see the decline across all platforms, not just iOS. Android and Web users consume the same content catalog. Additionally, content quality changes typically manifest in engagement metrics like time spent and articles read per session before affecting DAU.'
          },
          {
            id: 'c',
            text: 'A competitor launched a similar feature, pulling iOS users away',
            correct: false,
            feedback: 'Competitor launches rarely produce a clean platform-specific decline. Users who switch to a competitor tend to do so regardless of platform. More importantly, the push notification delivery data provides a direct mechanistic explanation that matches the timing and platform specificity of the decline. Always prefer a hypothesis with direct supporting data over speculation about external factors.'
          },
        ],
      },
      {
        type: 'sql',
        title: 'Investigate with SQL',
        schema: {
          tables: [
            {
              name: 'daily_active_users',
              columns: ['date DATE', 'user_id INT', 'platform TEXT', 'session_count INT', 'time_spent_minutes DECIMAL'],
            },
            {
              name: 'push_notifications',
              columns: ['notification_id INT', 'user_id INT', 'sent_at TIMESTAMP', 'delivered BOOLEAN', 'opened BOOLEAN', 'platform TEXT'],
            },
            {
              name: 'app_versions',
              columns: ['user_id INT', 'platform TEXT', 'app_version TEXT', 'updated_at DATE'],
            },
          ],
        },
        task: 'Query DAU by platform and push notification opt-in status for the last 30 days. Show whether users who stopped receiving notifications had lower DAU retention.',
        correctQuery: 'WITH user_push_status AS (SELECT u.user_id, u.platform, CASE WHEN COUNT(CASE WHEN p.delivered = TRUE AND p.sent_at >= CURRENT_DATE - INTERVAL \'7 days\' THEN 1 END) > 0 THEN \'receiving\' ELSE \'not_receiving\' END AS push_status FROM daily_active_users u LEFT JOIN push_notifications p ON u.user_id = p.user_id WHERE u.date >= CURRENT_DATE - INTERVAL \'30 days\' GROUP BY u.user_id, u.platform) SELECT d.date, d.platform, ups.push_status, COUNT(DISTINCT d.user_id) AS dau FROM daily_active_users d JOIN user_push_status ups ON d.user_id = ups.user_id AND d.platform = ups.platform WHERE d.date >= CURRENT_DATE - INTERVAL \'30 days\' GROUP BY d.date, d.platform, ups.push_status ORDER BY d.date, d.platform, ups.push_status',
        correctQueryFormatted: [
          'WITH user_push_status AS (',
          '  SELECT u.user_id, u.platform,',
          '    CASE WHEN COUNT(CASE WHEN p.delivered = TRUE',
          '      AND p.sent_at >= CURRENT_DATE - INTERVAL \'7 days\'',
          '      THEN 1 END) > 0',
          '    THEN \'receiving\' ELSE \'not_receiving\' END AS push_status',
          '  FROM daily_active_users u',
          '  LEFT JOIN push_notifications p ON u.user_id = p.user_id',
          '  WHERE u.date >= CURRENT_DATE - INTERVAL \'30 days\'',
          '  GROUP BY u.user_id, u.platform',
          ')',
          'SELECT d.date, d.platform, ups.push_status,',
          '  COUNT(DISTINCT d.user_id) AS dau',
          'FROM daily_active_users d',
          'JOIN user_push_status ups',
          '  ON d.user_id = ups.user_id AND d.platform = ups.platform',
          'WHERE d.date >= CURRENT_DATE - INTERVAL \'30 days\'',
          'GROUP BY d.date, d.platform, ups.push_status',
          'ORDER BY d.date, d.platform, ups.push_status',
        ],
        keyElements: ['push_notifications', 'delivered', 'platform', 'GROUP BY', 'COUNT', 'DISTINCT'],
        expectedOutput: {
          headers: ['platform', 'push_status', 'avg_dau_weeks_1_2', 'avg_dau_weeks_3_4', 'change'],
          rows: [
            ['iOS', 'receiving', '310K', '305K', '-1.6%'],
            ['iOS', 'not_receiving', '510K', '375K', '-26.5%'],
            ['Android', 'receiving', '580K', '585K', '+0.9%'],
            ['Android', 'not_receiving', '160K', '160K', '0.0%'],
          ],
        },
        hints: ['Join daily_active_users with push_notifications to classify users by push delivery status', 'Use a CTE to first determine each user\'s push status, then aggregate DAU by that status', 'Filter for the last 30 days and group by platform and push status'],
      },
      {
        type: 'communicate',
        title: 'Write the Brief',
        prompt: 'Write a 3-line brief for the mobile engineering team explaining the issue and urgency.',
        modelAnswer: 'The iOS app update released on May 26 broke push notification registration, causing delivery rates to drop from 84% to 31%. This has driven a 17% decline in iOS DAU, affecting approximately 140K daily users who are no longer being re-engaged via notifications. We need an emergency hotfix to restore push registration in the next iOS build, with a server-side re-registration prompt for affected users.',
        rubric: ['Identifies the specific technical failure', 'Quantifies the user impact', 'Proposes a specific technical remediation with urgency'],
        keyPhrases: ['iOS', 'push notification', '84%', '31%', '140K', 'hotfix'],
      },
      {
        type: 'experiment',
        title: 'Design the Test',
        prompt: 'The push notification fix has been deployed. Design a test to validate that re-prompting affected users to re-enable notifications recovers DAU.',
        fields: [
          {
            label: 'Hypothesis',
            type: 'mcq',
            options: [
              { id: 'a', text: 'Showing a push notification re-enablement prompt to iOS users who lost push registration will recover their notification delivery rate and increase their DAU retention back to pre-bug levels', correct: true },
              { id: 'b', text: 'Sending an email campaign to all iOS users explaining the bug will recover at least 50% of lost DAU within one week', correct: false },
              { id: 'c', text: 'Deploying the hotfix alone without any user prompt will automatically restore push delivery for all affected users', correct: false },
            ],
            correctAnswer: 'The hypothesis must target the specific mechanism: re-prompting users to re-enable push. Option A directly tests the re-enablement prompt. Email campaigns are indirect, and a hotfix alone may not re-register users whose tokens were already invalidated.',
          },
          {
            label: 'Unit of randomization',
            type: 'mcq',
            options: [
              { id: 'a', text: 'User-level, with each affected iOS user randomly assigned to see the re-enablement prompt or not', correct: true },
              { id: 'b', text: 'Device-level, randomizing by device ID to account for users with multiple devices', correct: false },
              { id: 'c', text: 'Day-level, alternating days where the prompt is shown to all users vs hidden from all users', correct: false },
            ],
            correctAnswer: 'User-level randomization provides the cleanest measurement. Device-level adds unnecessary complexity since this is an iOS-only issue. Day-level randomization introduces severe time-based confounds and has very low statistical power.',
          },
          {
            label: 'Primary metric',
            type: 'mcq',
            options: [
              { id: 'a', text: 'D7 retention rate for affected iOS users (percentage of users active on day 7 after the prompt)', correct: true },
              { id: 'b', text: 'Push notification opt-in rate within 24 hours of prompt display', correct: false },
              { id: 'c', text: 'Total iOS DAU across all users, including unaffected ones', correct: false },
              { id: 'd', text: 'App store rating change in the week following the fix', correct: false },
            ],
            correctAnswer: 'D7 retention directly measures whether re-enablement translates to sustained re-engagement. Opt-in rate is an input metric, not an outcome. Total iOS DAU dilutes the signal with unaffected users. App store ratings are too noisy and delayed.',
          },
          {
            label: 'Guardrail metrics',
            type: 'multi',
            options: [
              { id: 'a', text: 'Push notification opt-out rate (ensure the prompt does not cause more users to actively disable notifications)', correct: true },
              { id: 'b', text: 'App uninstall rate', correct: true },
              { id: 'c', text: 'Session count per user', correct: true },
              { id: 'd', text: 'Content publishing volume by creators', correct: false },
              { id: 'e', text: 'Ad revenue per impression', correct: false },
            ],
            correctAnswer: 'Opt-out rate, uninstall rate, and session count directly measure whether the prompt annoys users or degrades their experience. Content publishing volume is a supply-side metric unrelated to the prompt. Ad revenue per impression is a monetization metric unaffected by this intervention.',
          },
        ],
      },
      {
        type: 'readout',
        title: 'The Readout',
        prompt: 'The experiment ran for 2 weeks. Here are the results:',
        resultsTable: {
          headers: ['Metric', 'Control', 'Treatment', 'Lift', 'p-value'],
          rows: [
            ['Push Re-registration Rate', '4.2%', '61.8%', '+1371%', '<0.001'],
            ['D7 Retention', '22.1%', '34.5%', '+56.1%', '<0.001'],
            ['DAU (affected cohort)', '375K', '397K', '+5.9%', '0.002'],
            ['Push Opt-out Rate', '1.8%', '2.3%', '+27.8%', '0.12'],
            ['App Uninstall Rate', '0.9%', '0.8%', '-11.1%', '0.45'],
          ],
        },
        question: 'What is your recommendation?',
        options: [
          {
            id: 'ship',
            text: 'Ship to 100%',
            correct: true,
            feedback: 'Correct. The re-enablement prompt dramatically improved push re-registration and meaningfully recovered DAU and retention. The push opt-out rate increase is small and not statistically significant, meaning the prompt is not annoying users into permanently disabling notifications. App uninstall rate is flat. Ship immediately to recover as much of the lost DAU as possible.'
          },
          {
            id: 'no-ship',
            text: 'Do not ship',
            correct: false,
            feedback: 'There is no valid reason not to ship. The prompt recovered significant DAU with no meaningful negative effects. The small opt-out rate increase is not statistically significant. Every day you delay shipping, affected users continue to churn from lack of re-engagement.'
          },
          {
            id: 'investigate',
            text: 'Investigate the opt-out rate increase before shipping',
            correct: false,
            feedback: 'The opt-out rate increase has a p-value of 0.12, meaning it is not statistically significant and could easily be noise. Even if it were real, a 0.5 percentage point increase in opt-outs is a minor cost compared to recovering 22K daily active users. The risk of waiting far exceeds the risk of shipping.'
          },
        ],
        debrief: 'This case demonstrates the importance of platform segmentation as a first step when investigating DAU declines. The root cause was a single-platform technical regression that affected a re-engagement channel, not content quality or competitive pressure. The gradual decline pattern is characteristic of notification-related issues because users do not suddenly stop using the app; they simply stop being reminded to open it. The experiment design correctly focused on the affected cohort rather than all iOS users, and the readout showed clear positive results with no guardrail violations. The key takeaway is that re-engagement channel health is often the most overlooked driver of DAU trends.',
      },
    ],
  },
  {
    id: 'fl03',
    title: 'Search CTR Down, Revenue Up',
    domain: 'Marketplace',
    difficulty: 'senior',
    isFree: false,
    guestPreview: false,
    phases: [
      {
        type: 'alert',
        title: 'The Alert',
        metricName: 'Search CTR / GMV per Session',
        metricValue: '18.4% CTR / $42.30 GMV',
        metricChange: 'CTR -5% / GMV +3%',
        prompt: 'Your marketplace search shows CTR declining 5% while GMV per search session is up 3%. These metrics are moving in opposite directions. What is your first move?',
        options: [
          {
            id: 'a',
            text: 'Break down CTR by result position to understand where clicks are being lost',
            correct: true,
            feedback: 'Correct. When CTR and GMV move in opposite directions, it usually indicates a composition change in how users interact with search results. Breaking down by result position tells you whether users are clicking fewer results overall or just shifting their clicks to different positions. Combined with AOV data by position, this reveals whether a ranking change is surfacing higher-value items at the cost of total click volume.'
          },
          {
            id: 'b',
            text: 'Assume the ranking model is broken and revert to the previous version',
            correct: false,
            feedback: 'Reverting without understanding the tradeoff would be premature. GMV is up 3%, which means the new behavior might be generating more revenue despite fewer clicks. This is a tradeoff situation, not a clear regression. You need to understand the mechanism before deciding whether to revert.'
          },
          {
            id: 'c',
            text: 'Check if search volume has changed to rule out a traffic quality issue',
            correct: false,
            feedback: 'Search volume changes would affect absolute click counts but not necessarily CTR (clicks per impression). Since CTR is a rate metric, the issue is about the ratio of clicks to impressions, not the volume. Position-level analysis will be more informative than traffic volume analysis here.'
          },
        ],
      },
      {
        type: 'data',
        title: 'Read the Data',
        prompt: 'Here is the click distribution by result position and AOV for clicked items. What pattern do you see?',
        dataTable: {
          headers: ['Position Bucket', 'CTR This Week', 'CTR Last Week', 'CTR Change', 'AOV Clicked Items'],
          rows: [
            ['Positions 1-3', '12.8%', '11.2%', '+14.3%', '$68.40'],
            ['Positions 4-6', '4.1%', '5.3%', '-22.6%', '$34.20'],
            ['Positions 7-10', '1.5%', '2.9%', '-48.3%', '$18.90'],
            ['Overall', '18.4%', '19.4%', '-5.2%', '$42.30'],
          ],
        },
        guideQuestion: 'Why is overall CTR down even though top-position CTR increased? What does the AOV pattern suggest?',
        modelObservation: 'The data reveals a classic composition effect. Positions 1-3 are getting more clicks and have significantly higher AOV ($68.40 vs $18.90 for positions 7-10). But positions 4-10 lost a large share of clicks. The overall CTR drop is driven by the tail positions losing clicks, while the head positions gained. Since head positions have 3-4x higher AOV, the GMV increase makes sense despite fewer total clicks. This pattern is consistent with a ranking model change that prioritizes higher-AOV items in top positions, which concentrates clicks on fewer but more valuable results.',
        keyPhrases: ['composition', 'position', 'AOV', 'ranking', 'tail'],
      },
      {
        type: 'rca',
        title: 'Root Cause',
        prompt: 'What is driving the divergence between CTR and GMV?',
        options: [
          {
            id: 'a',
            text: 'A new ranking model is favoring higher-AOV items in top positions, creating a tradeoff between click volume and revenue per click',
            correct: true,
            feedback: 'Correct, and importantly this is a tradeoff rather than a pure bug. The new model is doing what it was likely optimized to do: maximize GMV. It surfaces higher-value items in top positions, which users click and buy at higher rates. But this comes at the cost of tail-position engagement. The risk is that users searching for lower-priced items may not find relevant results in top positions, reducing satisfaction for a segment of searches. This is especially dangerous for tail queries where the high-AOV items may not be relevant.'
          },
          {
            id: 'b',
            text: 'Search index corruption is causing irrelevant results to appear in lower positions',
            correct: false,
            feedback: 'If the search index were corrupted, you would expect to see degradation across all positions, not a clean pattern where top positions improve while lower positions decline. Index corruption also would not explain the AOV increase in top positions. The pattern is too structured to be corruption; it reflects an intentional ranking change.'
          },
          {
            id: 'c',
            text: 'A UI change is hiding results below position 3, reducing visibility of lower results',
            correct: false,
            feedback: 'A UI change could explain reduced clicks on lower positions, but it would not explain why the AOV of clicked items in top positions increased. The AOV shift suggests the ranking itself changed, not just the visibility. Additionally, the search results page layout has not changed according to the design team\'s release log.'
          },
        ],
      },
      {
        type: 'sql',
        title: 'Investigate with SQL',
        schema: {
          tables: [
            {
              name: 'search_events',
              columns: ['search_id INT', 'user_id INT', 'query TEXT', 'query_type TEXT', 'searched_at TIMESTAMP', 'result_count INT'],
            },
            {
              name: 'search_clicks',
              columns: ['click_id INT', 'search_id INT', 'product_id INT', 'position INT', 'clicked_at TIMESTAMP'],
            },
            {
              name: 'orders',
              columns: ['order_id INT', 'user_id INT', 'product_id INT', 'amount DECIMAL', 'created_at TIMESTAMP'],
            },
            {
              name: 'products',
              columns: ['product_id INT', 'category TEXT', 'price DECIMAL', 'title TEXT'],
            },
          ],
        },
        task: 'Decompose CTR by result position bucket (1-3, 4-6, 7-10) and compare AOV for clicked vs non-clicked results. Also segment by query type (head vs tail queries).',
        correctQuery: 'WITH click_data AS (SELECT se.search_id, se.query_type, sc.position, CASE WHEN sc.position BETWEEN 1 AND 3 THEN \'1-3\' WHEN sc.position BETWEEN 4 AND 6 THEN \'4-6\' WHEN sc.position BETWEEN 7 AND 10 THEN \'7-10\' END AS position_bucket, p.price, CASE WHEN sc.click_id IS NOT NULL THEN 1 ELSE 0 END AS was_clicked FROM search_events se LEFT JOIN search_clicks sc ON se.search_id = sc.search_id LEFT JOIN products p ON sc.product_id = p.product_id WHERE se.searched_at >= CURRENT_DATE - INTERVAL \'14 days\') SELECT position_bucket, query_type, COUNT(*) AS impressions, SUM(was_clicked) AS clicks, ROUND(100.0 * SUM(was_clicked) / COUNT(*), 1) AS ctr, ROUND(AVG(CASE WHEN was_clicked = 1 THEN price END), 2) AS avg_aov_clicked FROM click_data WHERE position_bucket IS NOT NULL GROUP BY position_bucket, query_type ORDER BY position_bucket, query_type',
        correctQueryFormatted: [
          'WITH click_data AS (',
          '  SELECT se.search_id, se.query_type, sc.position,',
          '    CASE',
          '      WHEN sc.position BETWEEN 1 AND 3 THEN \'1-3\'',
          '      WHEN sc.position BETWEEN 4 AND 6 THEN \'4-6\'',
          '      WHEN sc.position BETWEEN 7 AND 10 THEN \'7-10\'',
          '    END AS position_bucket,',
          '    p.price,',
          '    CASE WHEN sc.click_id IS NOT NULL THEN 1 ELSE 0 END AS was_clicked',
          '  FROM search_events se',
          '  LEFT JOIN search_clicks sc ON se.search_id = sc.search_id',
          '  LEFT JOIN products p ON sc.product_id = p.product_id',
          '  WHERE se.searched_at >= CURRENT_DATE - INTERVAL \'14 days\'',
          ')',
          'SELECT position_bucket, query_type,',
          '  COUNT(*) AS impressions,',
          '  SUM(was_clicked) AS clicks,',
          '  ROUND(100.0 * SUM(was_clicked) / COUNT(*), 1) AS ctr,',
          '  ROUND(AVG(CASE WHEN was_clicked = 1 THEN price END), 2) AS avg_aov_clicked',
          'FROM click_data',
          'WHERE position_bucket IS NOT NULL',
          'GROUP BY position_bucket, query_type',
          'ORDER BY position_bucket, query_type',
        ],
        keyElements: ['position', 'CASE', 'BETWEEN', 'query_type', 'GROUP BY', 'AVG'],
        expectedOutput: {
          headers: ['position_bucket', 'query_type', 'ctr', 'avg_aov_clicked'],
          rows: [
            ['1-3', 'head', '14.2%', '$72.10'],
            ['1-3', 'tail', '8.1%', '$61.30'],
            ['4-6', 'head', '5.8%', '$35.40'],
            ['4-6', 'tail', '2.1%', '$29.80'],
            ['7-10', 'head', '2.3%', '$19.50'],
            ['7-10', 'tail', '0.6%', '$15.20'],
          ],
        },
        hints: ['Use a CASE expression to bucket positions into 1-3, 4-6, and 7-10', 'Join search_clicks with products to get price data for clicked items', 'Segment by query_type from search_events to see head vs tail query differences'],
      },
      {
        type: 'communicate',
        title: 'Write the Brief',
        prompt: 'Write a brief for the search team lead that acknowledges the tradeoff and proposes a path forward. This is not a simple bug report.',
        modelAnswer: 'The new ranking model is increasing GMV per session by 3% by surfacing higher-AOV items in top positions, but at the cost of a 5% CTR decline concentrated in positions 4-10. The tradeoff is most pronounced on tail queries, where CTR in lower positions dropped 48% and users searching for niche or lower-priced items may not find relevant results. I recommend we run a controlled experiment comparing the new model against the old model with a guardrail on tail-query satisfaction, so we can quantify the exact revenue-satisfaction tradeoff and decide whether to apply the new model selectively to head queries only.',
        rubric: ['Frames the situation as a tradeoff, not a bug', 'Distinguishes between head and tail query impact', 'Proposes a measured path forward rather than a binary ship/revert decision'],
        keyPhrases: ['tradeoff', 'GMV', 'CTR', 'tail query', 'ranking model', 'position'],
      },
      {
        type: 'experiment',
        title: 'Design the Test',
        prompt: 'Design an experiment to evaluate the ranking model tradeoff.',
        fields: [
          {
            label: 'Hypothesis',
            type: 'mcq',
            options: [
              { id: 'a', text: 'The new ranking model increases GMV per search session at the cost of reduced CTR and satisfaction on tail queries; applying it only to head queries will capture most of the revenue upside while preserving tail query experience', correct: true },
              { id: 'b', text: 'Reverting to the old ranking model will restore CTR without any impact on GMV because the revenue increase was coincidental', correct: false },
              { id: 'c', text: 'Blending the old and new ranking models with a 50/50 weight will optimally balance CTR and GMV across all query types', correct: false },
            ],
            correctAnswer: 'Option A correctly frames the hypothesis as a segmented tradeoff test. Option B ignores the clear causal link between ranking changes and GMV. Option C assumes a naive blending approach without testing whether query-type segmentation is the right boundary.',
          },
          {
            label: 'Unit of randomization',
            type: 'mcq',
            options: [
              { id: 'a', text: 'Search-session level, stratified by query type (head vs tail), with each search session independently assigned to old or new ranking model', correct: true },
              { id: 'b', text: 'User-level, assigning each user to consistently see one ranking model across all their searches', correct: false },
              { id: 'c', text: 'Query-level, randomizing at the individual query string rather than the session', correct: false },
            ],
            correctAnswer: 'Search-session level stratified by query type allows you to measure the effect separately for head and tail queries. User-level would prevent you from isolating the query-type effect since each user issues both types. Query-level is too granular and creates inconsistent experiences within sessions.',
          },
          {
            label: 'Primary metric',
            type: 'mcq',
            options: [
              { id: 'a', text: 'GMV per search session and search CTR as dual-primary metrics to capture both the revenue and satisfaction dimensions of the tradeoff', correct: true },
              { id: 'b', text: 'GMV per search session only, since revenue is the ultimate business objective', correct: false },
              { id: 'c', text: 'Search CTR only, since user satisfaction drives long-term revenue', correct: false },
              { id: 'd', text: 'Number of search results clicked per session', correct: false },
            ],
            correctAnswer: 'This is a tradeoff experiment, so you need to measure both sides. GMV alone ignores user satisfaction risk. CTR alone ignores the revenue benefit. Dual-primary metrics are appropriate when the experiment is explicitly designed to quantify a tradeoff.',
          },
          {
            label: 'Guardrail metrics',
            type: 'multi',
            options: [
              { id: 'a', text: 'Tail-query CTR specifically', correct: true },
              { id: 'b', text: 'Search abandonment rate (searches with zero clicks)', correct: true },
              { id: 'c', text: 'Repeat search rate within 24 hours (indicates user dissatisfaction)', correct: true },
              { id: 'd', text: 'Homepage load time', correct: false },
              { id: 'e', text: 'Seller onboarding rate', correct: false },
            ],
            correctAnswer: 'Tail-query CTR, search abandonment, and repeat search rate directly measure whether the ranking change harms the search experience. Homepage load time is unrelated to search ranking. Seller onboarding is a supply-side metric not affected by result ranking.',
          },
        ],
      },
      {
        type: 'readout',
        title: 'The Readout',
        prompt: 'The experiment ran for 3 weeks with three arms: old model (control), new model everywhere (treatment A), new model for head queries only (treatment B). Here are the results:',
        resultsTable: {
          headers: ['Metric', 'Control (Old)', 'Treatment A (New Everywhere)', 'Treatment B (New Head Only)', 'p-value (A vs C)', 'p-value (B vs C)'],
          rows: [
            ['GMV per Session', '$41.20', '$42.80', '$42.40', '0.003', '0.008'],
            ['Overall CTR', '19.4%', '18.3%', '19.1%', '0.01', '0.31'],
            ['Head Query CTR', '14.1%', '14.3%', '14.2%', '0.42', '0.55'],
            ['Tail Query CTR', '8.8%', '7.2%', '8.7%', '0.001', '0.68'],
            ['Search Abandonment', '12.1%', '14.8%', '12.3%', '0.002', '0.71'],
            ['Repeat Search Rate', '18.3%', '22.1%', '18.5%', '0.004', '0.82'],
          ],
        },
        question: 'What is your recommendation?',
        options: [
          {
            id: 'ship',
            text: 'Ship Treatment A (new model everywhere) to 100%',
            correct: false,
            feedback: 'Treatment A generates the highest GMV, but it significantly degrades tail query experience. Tail query CTR dropped 18%, search abandonment increased 22%, and repeat search rate increased 21%. These are users who cannot find what they are looking for. The short-term revenue gain will erode long-term marketplace health if tail-query users stop searching.'
          },
          {
            id: 'conditional-ship',
            text: 'Ship Treatment B (new model for head queries only)',
            correct: true,
            feedback: 'Correct. Treatment B captures most of the GMV upside (+2.9% vs +3.9% for Treatment A) while keeping tail query metrics nearly identical to control. This is the right tradeoff: you get 74% of the revenue benefit with zero degradation in search satisfaction. Head queries are high-volume and benefit from the ranking change. Tail queries are niche and need relevance-optimized ranking to remain useful.'
          },
          {
            id: 'investigate',
            text: 'Do not ship either treatment and investigate further',
            correct: false,
            feedback: 'The experiment already provides clear, actionable results. Treatment B offers a strong revenue improvement with no meaningful negative effects. Delaying the ship to investigate further would leave revenue on the table without a clear hypothesis for what additional investigation would reveal. The data supports a confident decision.'
          },
        ],
        debrief: 'This case tests the analyst\'s ability to navigate tradeoff decisions rather than binary ship/no-ship calls. The ranking model change was not a bug; it was a deliberate optimization that created winners and losers. The correct resolution is a conditional ship: apply the new model where it helps (head queries) and preserve the old model where the new one hurts (tail queries). This requires the analyst to move beyond simple statistical significance and think about the business logic of different query segments. The key skill is recognizing that a single experiment can have different implications for different user segments, and the recommendation should reflect that complexity.',
      },
    ],
  },
  {
    id: 'fl04',
    title: 'Subscription Churn Spike',
    domain: 'SaaS',
    difficulty: 'senior',
    isFree: false,
    guestPreview: false,
    phases: [
      {
        type: 'alert',
        title: 'The Alert',
        metricName: 'Monthly Churn Rate',
        metricValue: '6.8%',
        metricChange: '+2.6pp (was 4.2%)',
        prompt: 'Monthly churn rate jumped from 4.2% to 6.8%, a 62% relative increase. This appeared over the last billing cycle. What is your first move?',
        options: [
          {
            id: 'a',
            text: 'Segment churn by cohort vintage, tenure bucket, and plan type to find where the spike is concentrated',
            correct: true,
            feedback: 'Correct. Churn spikes are rarely uniform. Segmenting by cohort vintage (when users signed up), tenure (how long they have been subscribed), and plan type (monthly vs annual, tier) reveals whether this is a broad product issue or a targeted pricing/billing issue. This segmentation will immediately narrow the investigation.'
          },
          {
            id: 'b',
            text: 'Survey recently churned users to understand their reasons',
            correct: false,
            feedback: 'Churn surveys are valuable but slow and subject to response bias. Users who respond tend to be unrepresentative, and the time to collect meaningful survey data (1-2 weeks) delays your investigation. Start with behavioral data segmentation, which is available immediately and covers 100% of churned users.'
          },
          {
            id: 'c',
            text: 'Check if a recent product release introduced bugs that drove users away',
            correct: false,
            feedback: 'Product bugs typically affect engagement metrics (session count, feature usage) before they affect churn. If a bug were severe enough to cause a 62% churn spike, you would likely see support tickets and crash reports first. More importantly, you do not yet know which users are churning. Segmentation first, then hypothesis testing.'
          },
        ],
      },
      {
        type: 'data',
        title: 'Read the Data',
        prompt: 'Here is churn segmented by plan change history and plan type. What pattern emerges?',
        dataTable: {
          headers: ['Segment', 'Users', 'Churned', 'Churn Rate', 'Prior Month Churn'],
          rows: [
            ['Annual plan (no change)', '42,000', '840', '2.0%', '1.9%'],
            ['Monthly plan (no change)', '28,000', '1,680', '6.0%', '5.8%'],
            ['Annual to Monthly switchers', '8,200', '1,804', '22.0%', '4.5%'],
            ['Monthly to Annual upgraders', '5,800', '116', '2.0%', '2.1%'],
            ['Total', '84,000', '4,440', '5.3%', '3.5%'],
          ],
        },
        guideQuestion: 'Which segment is driving the churn spike? What might have changed for this group?',
        modelObservation: 'The churn spike is almost entirely driven by users who switched from annual to monthly billing. This segment has a 22% churn rate versus 4.5% the prior month, a nearly 5x increase. All other segments are stable within normal ranges. This strongly suggests something changed in the economics or experience of the annual-to-monthly transition. The most likely candidate is a pricing change that made the monthly plan significantly more expensive for users who were previously on an annual plan.',
        keyPhrases: ['annual to monthly', '22%', 'switcher', 'pricing', 'plan change'],
      },
      {
        type: 'rca',
        title: 'Root Cause',
        prompt: 'What caused the churn spike in the annual-to-monthly switcher cohort?',
        options: [
          {
            id: 'a',
            text: 'A price increase for monthly plans hit annual-to-monthly switchers hardest because they experienced a sudden cost jump after being accustomed to a lower effective monthly rate',
            correct: true,
            feedback: 'Correct. The company raised monthly plan prices by 20% last month. Users on annual plans were paying an effective $24/month. When they switched to monthly, they expected to pay the old monthly rate of $32, but instead were charged the new rate of $38.40. This $14.40/month increase over their annual rate felt like a 60% price hike. New monthly subscribers expected the $38.40 rate, but switchers experienced sticker shock. The price anchoring effect made these users the most price-sensitive segment.'
          },
          {
            id: 'b',
            text: 'A competitor is offering a free trial that specifically targets users looking to switch plans',
            correct: false,
            feedback: 'While competitor offers can influence churn, they would not produce such a clean segment-specific spike. Competitor trials would attract users across all plan types, not specifically annual-to-monthly switchers. The data shows a surgical spike in one cohort, which points to an internal pricing or billing change rather than external competitive pressure.'
          },
          {
            id: 'c',
            text: 'A product quality regression in the latest release disproportionately affected long-tenured users',
            correct: false,
            feedback: 'If product quality were the issue, you would expect to see elevated churn across long-tenured users regardless of their plan change history. But the long-tenured annual plan users (no change) have a stable 2.0% churn rate. The spike is specific to users who changed plans, not to tenure or product usage patterns. This is a pricing issue, not a product quality issue.'
          },
        ],
      },
      {
        type: 'sql',
        title: 'Investigate with SQL',
        schema: {
          tables: [
            {
              name: 'subscriptions',
              columns: ['subscription_id INT', 'user_id INT', 'plan_type TEXT', 'plan_tier TEXT', 'monthly_price DECIMAL', 'started_at DATE', 'ended_at DATE', 'status TEXT'],
            },
            {
              name: 'plan_changes',
              columns: ['change_id INT', 'user_id INT', 'old_plan_type TEXT', 'new_plan_type TEXT', 'old_price DECIMAL', 'new_price DECIMAL', 'changed_at DATE'],
            },
            {
              name: 'churned_users',
              columns: ['user_id INT', 'churned_at DATE', 'reason TEXT', 'last_plan_type TEXT', 'tenure_months INT'],
            },
          ],
        },
        task: 'Find churn rate by plan change history: users who switched plans vs users who stayed on their original plan. Include the price delta for switchers.',
        correctQuery: 'WITH user_plan_history AS (SELECT s.user_id, s.plan_type AS current_plan, s.monthly_price AS current_price, pc.old_plan_type, pc.old_price, CASE WHEN pc.change_id IS NOT NULL THEN \'switched\' ELSE \'no_change\' END AS change_status, CASE WHEN pc.change_id IS NOT NULL THEN s.monthly_price - pc.old_price ELSE 0 END AS price_delta FROM subscriptions s LEFT JOIN plan_changes pc ON s.user_id = pc.user_id WHERE s.status IN (\'active\', \'churned\') AND s.started_at >= CURRENT_DATE - INTERVAL \'90 days\') SELECT uph.change_status, uph.current_plan, COUNT(DISTINCT uph.user_id) AS total_users, COUNT(DISTINCT cu.user_id) AS churned_users, ROUND(100.0 * COUNT(DISTINCT cu.user_id) / COUNT(DISTINCT uph.user_id), 1) AS churn_rate, ROUND(AVG(uph.price_delta), 2) AS avg_price_delta FROM user_plan_history uph LEFT JOIN churned_users cu ON uph.user_id = cu.user_id AND cu.churned_at >= CURRENT_DATE - INTERVAL \'30 days\' GROUP BY uph.change_status, uph.current_plan ORDER BY churn_rate DESC',
        correctQueryFormatted: [
          'WITH user_plan_history AS (',
          '  SELECT s.user_id,',
          '    s.plan_type AS current_plan,',
          '    s.monthly_price AS current_price,',
          '    pc.old_plan_type, pc.old_price,',
          '    CASE WHEN pc.change_id IS NOT NULL',
          '      THEN \'switched\' ELSE \'no_change\' END AS change_status,',
          '    CASE WHEN pc.change_id IS NOT NULL',
          '      THEN s.monthly_price - pc.old_price ELSE 0 END AS price_delta',
          '  FROM subscriptions s',
          '  LEFT JOIN plan_changes pc ON s.user_id = pc.user_id',
          '  WHERE s.status IN (\'active\', \'churned\')',
          '    AND s.started_at >= CURRENT_DATE - INTERVAL \'90 days\'',
          ')',
          'SELECT uph.change_status, uph.current_plan,',
          '  COUNT(DISTINCT uph.user_id) AS total_users,',
          '  COUNT(DISTINCT cu.user_id) AS churned_users,',
          '  ROUND(100.0 * COUNT(DISTINCT cu.user_id)',
          '    / COUNT(DISTINCT uph.user_id), 1) AS churn_rate,',
          '  ROUND(AVG(uph.price_delta), 2) AS avg_price_delta',
          'FROM user_plan_history uph',
          'LEFT JOIN churned_users cu',
          '  ON uph.user_id = cu.user_id',
          '  AND cu.churned_at >= CURRENT_DATE - INTERVAL \'30 days\'',
          'GROUP BY uph.change_status, uph.current_plan',
          'ORDER BY churn_rate DESC',
        ],
        keyElements: ['plan_changes', 'churned_users', 'price_delta', 'LEFT JOIN', 'GROUP BY', 'CASE'],
        expectedOutput: {
          headers: ['change_status', 'current_plan', 'total_users', 'churned_users', 'churn_rate', 'avg_price_delta'],
          rows: [
            ['switched', 'monthly', '8,200', '1,804', '22.0%', '+$14.40'],
            ['no_change', 'monthly', '28,000', '1,680', '6.0%', '$0.00'],
            ['switched', 'annual', '5,800', '116', '2.0%', '-$8.00'],
            ['no_change', 'annual', '42,000', '840', '2.0%', '$0.00'],
          ],
        },
        hints: ['Use a LEFT JOIN between subscriptions and plan_changes to classify users by change history', 'Calculate price delta as current price minus old price for switchers', 'Join with churned_users to get churn counts per segment'],
      },
      {
        type: 'communicate',
        title: 'Write the Brief',
        prompt: 'Write a brief for the pricing team explaining the churn spike and its root cause.',
        modelAnswer: 'The 20% monthly plan price increase is causing 22% churn among users who switch from annual to monthly billing, up from 4.5% last month. These users experience a $14.40/month jump over their previous annual rate, which feels like a 60% increase due to price anchoring. This cohort of 8,200 users accounts for 41% of all churn this month despite being only 10% of the subscriber base. Recommended action: offer a 3-month transitional price lock at the old monthly rate for annual-to-monthly switchers to smooth the price transition.',
        rubric: ['Explains the price anchoring mechanism clearly', 'Quantifies the outsized impact of this small cohort on total churn', 'Proposes a targeted intervention rather than a blanket price rollback'],
        keyPhrases: ['price anchoring', '$14.40', '22%', 'annual to monthly', '41%', 'transitional'],
      },
      {
        type: 'experiment',
        title: 'Design the Test',
        prompt: 'Design a test for the transitional price lock offer.',
        fields: [
          {
            label: 'Hypothesis',
            type: 'mcq',
            options: [
              { id: 'a', text: 'Offering a 3-month price lock at the old monthly rate to annual-to-monthly switchers will reduce their churn rate from 22% to below 8% by easing the price transition, without significantly reducing per-user revenue over 6 months', correct: true },
              { id: 'b', text: 'Reverting the price increase entirely for all monthly plans will reduce overall churn by 50% within one billing cycle', correct: false },
              { id: 'c', text: 'Sending a notification explaining the price increase rationale will reduce churn among switchers by making them understand the value proposition', correct: false },
            ],
            correctAnswer: 'Option A is targeted and testable with a clear threshold. Option B is a blanket rollback that ignores which segment is affected and sacrifices revenue from unaffected users. Option C assumes information solves a pricing problem, which rarely works when users face a 60% perceived price increase.',
          },
          {
            label: 'Unit of randomization',
            type: 'mcq',
            options: [
              { id: 'a', text: 'User-level, with each annual-to-monthly switcher randomly assigned to receive the price lock offer or the standard new price', correct: true },
              { id: 'b', text: 'Cohort-level, offering the price lock to all switchers in alternating weeks', correct: false },
              { id: 'c', text: 'Plan-tier level, applying the price lock to specific plan tiers and using others as control', correct: false },
            ],
            correctAnswer: 'User-level provides the cleanest measurement with the most statistical power. Cohort-level introduces time confounds. Plan-tier level conflates the effect of the price lock with inherent differences between plan tiers.',
          },
          {
            label: 'Primary metric',
            type: 'mcq',
            options: [
              { id: 'a', text: 'Monthly churn rate for the annual-to-monthly switcher cohort, measured at 30, 60, and 90 days post-switch', correct: true },
              { id: 'b', text: 'Overall company churn rate across all plan types', correct: false },
              { id: 'c', text: 'Net Promoter Score among switchers', correct: false },
              { id: 'd', text: 'Number of support tickets about pricing', correct: false },
            ],
            correctAnswer: 'Cohort-specific churn rate at multiple time horizons directly measures whether the price lock reduces churn and whether the effect persists after the lock expires. Overall churn dilutes the signal. NPS and support tickets are lagging indicators.',
          },
          {
            label: 'Guardrail metrics',
            type: 'multi',
            options: [
              { id: 'a', text: 'Revenue per user at 6-month horizon (to ensure the discount pays for itself through retention)', correct: true },
              { id: 'b', text: 'Annual plan downgrade rate (to ensure the offer does not incentivize gaming by switching plans to get the discount)', correct: true },
              { id: 'c', text: 'Support ticket volume', correct: true },
              { id: 'd', text: 'Feature adoption rate for new product releases', correct: false },
              { id: 'e', text: 'Email open rate for marketing campaigns', correct: false },
            ],
            correctAnswer: 'Revenue per user at 6 months ensures the discount is NPV-positive. Annual plan downgrade rate catches gaming. Support tickets monitor user friction. Feature adoption and email open rates are unrelated to the pricing intervention.',
          },
        ],
      },
      {
        type: 'readout',
        title: 'The Readout',
        prompt: 'The experiment ran for 8 weeks. Here are the results:',
        resultsTable: {
          headers: ['Metric', 'Control', 'Treatment', 'Lift', 'p-value'],
          rows: [
            ['30-day Churn Rate', '21.8%', '8.2%', '-62.4%', '<0.001'],
            ['60-day Churn Rate', '28.4%', '14.1%', '-50.4%', '<0.001'],
            ['Revenue per User (monthly)', '$38.40', '$33.60', '-12.5%', '<0.001'],
            ['Projected 6-month LTV', '$148', '$192', '+29.7%', '0.004'],
            ['Annual Plan Gaming Rate', '1.2%', '1.4%', '+16.7%', '0.62'],
          ],
        },
        question: 'What is your recommendation?',
        options: [
          {
            id: 'ship',
            text: 'Ship the price lock to 100% of annual-to-monthly switchers',
            correct: false,
            feedback: 'Close, but not precise enough. The price lock works well for retention, but applying it uniformly misses an optimization opportunity. Users with more than 6 months of tenure have significantly higher LTV and are worth retaining with the discount. Newer users who switch quickly may be gaming the system. A tenure-based qualification improves the ROI of the program.'
          },
          {
            id: 'conditional-ship',
            text: 'Ship with modification: apply only to users with more than 6 months tenure on their annual plan',
            correct: true,
            feedback: 'Correct. The price lock dramatically reduces churn and increases projected 6-month LTV by 30%, which more than compensates for the 12.5% monthly revenue reduction. However, applying a tenure threshold ensures you are investing the discount in high-LTV users who have demonstrated commitment. Users who switch from annual to monthly after only 1-2 months may be price-shopping and are less likely to be retained long-term regardless. The gaming rate is not significant now, but a tenure threshold prevents it from becoming an issue at scale.'
          },
          {
            id: 'no-ship',
            text: 'Do not ship because the revenue per user decrease is too high',
            correct: false,
            feedback: 'The 12.5% monthly revenue decrease is more than offset by the 30% increase in projected 6-month LTV. Users in the control group churn at 22% per month, meaning you collect the higher price for an average of 4.5 months. Users in the treatment group churn at 8%, meaning you collect the lower price for an average of 12.5 months. The math clearly favors the price lock. Do not optimize for short-term revenue when it destroys long-term value.'
          },
        ],
        debrief: 'This case tests the analyst\'s ability to think about lifetime value rather than monthly revenue, and to apply conditional logic to a ship decision. The price lock offer works, but shipping it to everyone would be suboptimal. The tenure threshold is the key insight: high-tenure users who switch plans are likely doing so because of a life event or budget change, and a temporary price cushion keeps them in the ecosystem. Low-tenure switchers may be optimizing for the lowest price and are less retainable regardless. The broader lesson is that retention interventions should be targeted at users whose LTV justifies the cost of the intervention, not applied uniformly to all at-risk users.',
      },
    ],
  },
  {
    id: 'fl05',
    title: 'Orders Up, Contribution Margin Declining',
    domain: 'Marketplace',
    difficulty: 'staff',
    isFree: false,
    guestPreview: false,
    phases: [
      {
        type: 'alert',
        title: 'The Alert',
        metricName: 'Orders / Contribution Margin',
        metricValue: '1.15M orders / -$2.40 per order',
        metricChange: 'Orders +15% QoQ / Margin -22%',
        prompt: 'Orders are up 15% quarter-over-quarter, but contribution margin per order has declined 22%. The growth team is celebrating the order increase. What is your first move?',
        options: [
          {
            id: 'a',
            text: 'Decompose contribution margin by city tier to see if the growth is coming from profitable or unprofitable segments',
            correct: true,
            feedback: 'Correct. When orders grow but margins shrink, the first question is where the growth is coming from. If new orders are concentrated in segments with different unit economics (city tiers, customer cohorts, product categories), the margin decline might be a mix effect rather than a universal cost increase. City tier decomposition is particularly important for marketplaces because logistics costs, return rates, and discount sensitivity vary dramatically by geography.'
          },
          {
            id: 'b',
            text: 'Congratulate the growth team and investigate the margin issue separately',
            correct: false,
            feedback: 'These two metrics are not independent. If the order growth is causing the margin decline (through heavy discounting or expansion into unprofitable segments), then celebrating the growth is premature. You need to understand whether the growth is sustainable before characterizing it as success. Growth that destroys margin is a burn rate problem, not a win.'
          },
          {
            id: 'c',
            text: 'Check if logistics costs increased across all orders',
            correct: false,
            feedback: 'A universal logistics cost increase would affect margin across all segments uniformly. Before testing this hypothesis, check if the margin decline is uniform or concentrated. If it is concentrated in specific segments, a universal cost increase cannot be the primary explanation. Start with segmentation to direct your investigation efficiently.'
          },
        ],
      },
      {
        type: 'data',
        title: 'Read the Data',
        prompt: 'Here is the contribution margin P&L by city tier. What story does the data tell?',
        dataTable: {
          headers: ['City Tier', 'Orders', 'QoQ Growth', 'Avg Discount', 'RTO Rate', 'Logistics/Order', 'Margin/Order'],
          rows: [
            ['Tier 1', '420K', '+4%', '8%', '6%', '$3.20', '+$4.80'],
            ['Tier 2', '380K', '+18%', '22%', '14%', '$5.10', '-$1.40'],
            ['Tier 3', '350K', '+32%', '35%', '24%', '$7.80', '-$8.60'],
            ['Overall', '1.15M', '+15%', '20%', '14%', '$5.20', '-$2.40'],
          ],
        },
        guideQuestion: 'Where is the growth coming from, and what is it costing? What is the relationship between discounts, RTO rates, and margins?',
        modelObservation: 'The growth is heavily concentrated in Tier 2 (+18%) and Tier 3 (+32%) cities, which have fundamentally different unit economics than Tier 1. Tier 3 orders carry 35% average discounts and a 24% return-to-origin (RTO) rate, resulting in a -$8.60 margin per order. The compounding problem is that each returned order costs the discount plus round-trip logistics, making the effective loss per RTO approximately $16. Tier 1 growth is modest but profitable. The overall margin decline is a mix effect: the business is growing in segments where it loses money on every order, and the losses compound because discounts and returns are correlated.',
        keyPhrases: ['Tier 3', 'discount', 'RTO', 'margin', 'mix effect'],
      },
      {
        type: 'rca',
        title: 'Root Cause',
        prompt: 'What is the root cause of the contribution margin decline?',
        options: [
          {
            id: 'a',
            text: 'Discount-driven growth in Tier 2/3 cities compounds with high RTO rates, making each returned order cost approximately 2x the discount',
            correct: true,
            feedback: 'Correct. The mechanism is a compounding loss loop. In Tier 3 cities, the average order has a 35% discount ($7.00 on a $20 AOV). When that order is returned (24% of the time), the company loses the discount ($7.00) plus outbound logistics ($7.80) plus return logistics ($7.80) = $22.60 per RTO. Even non-returned orders are marginally profitable at best because the discount nearly eliminates the gross margin. The growth team is acquiring volume by subsidizing orders in markets where the unit economics are structurally negative.'
          },
          {
            id: 'b',
            text: 'Logistics costs have increased across all tiers due to fuel price inflation',
            correct: false,
            feedback: 'If logistics costs were the primary driver, you would see margin compression across all tiers, including Tier 1. But Tier 1 margins are stable at +$4.80 per order. The logistics cost difference between tiers ($3.20 vs $7.80) is a structural feature of geography, not a recent cost increase. The issue is not that logistics got more expensive; it is that the company is growing into markets where logistics were always expensive and discounts make the economics worse.'
          },
          {
            id: 'c',
            text: 'Category mix shifted toward low-margin products as Tier 2/3 users prefer different categories',
            correct: false,
            feedback: 'Category mix is a secondary factor but not the root cause. Even within the same category, Tier 2/3 orders are unprofitable because of the discount-plus-RTO compounding effect. A $20 electronics accessory in Tier 1 (8% discount, 6% RTO) generates positive margin, while the same product in Tier 3 (35% discount, 24% RTO) generates a significant loss. The issue is the discount and return structure, not what users are buying.'
          },
        ],
      },
      {
        type: 'sql',
        title: 'Investigate with SQL',
        schema: {
          tables: [
            {
              name: 'orders',
              columns: ['order_id INT', 'user_id INT', 'city_id INT', 'amount DECIMAL', 'created_at TIMESTAMP', 'status TEXT'],
            },
            {
              name: 'returns',
              columns: ['return_id INT', 'order_id INT', 'reason TEXT', 'return_logistics_cost DECIMAL', 'returned_at TIMESTAMP'],
            },
            {
              name: 'discounts',
              columns: ['discount_id INT', 'order_id INT', 'discount_amount DECIMAL', 'discount_type TEXT', 'coupon_code TEXT'],
            },
            {
              name: 'logistics_costs',
              columns: ['order_id INT', 'outbound_cost DECIMAL', 'packaging_cost DECIMAL'],
            },
            {
              name: 'city_tiers',
              columns: ['city_id INT', 'city_name TEXT', 'tier INT'],
            },
          ],
        },
        task: 'Build a contribution margin waterfall by city tier: revenue - discount - logistics - RTO cost per order. This requires calculating the full cost of returned orders including round-trip logistics.',
        correctQuery: 'WITH order_economics AS (SELECT o.order_id, ct.tier, o.amount AS revenue, COALESCE(d.discount_amount, 0) AS discount, COALESCE(lc.outbound_cost, 0) + COALESCE(lc.packaging_cost, 0) AS outbound_logistics, CASE WHEN r.return_id IS NOT NULL THEN COALESCE(r.return_logistics_cost, 0) ELSE 0 END AS return_logistics, CASE WHEN r.return_id IS NOT NULL THEN 1 ELSE 0 END AS is_returned FROM orders o JOIN city_tiers ct ON o.city_id = ct.city_id LEFT JOIN discounts d ON o.order_id = d.order_id LEFT JOIN logistics_costs lc ON o.order_id = lc.order_id LEFT JOIN returns r ON o.order_id = r.order_id WHERE o.created_at >= CURRENT_DATE - INTERVAL \'90 days\') SELECT tier, COUNT(*) AS total_orders, ROUND(AVG(revenue), 2) AS avg_revenue, ROUND(AVG(discount), 2) AS avg_discount, ROUND(AVG(outbound_logistics), 2) AS avg_outbound_logistics, ROUND(100.0 * SUM(is_returned) / COUNT(*), 1) AS rto_rate, ROUND(AVG(return_logistics), 2) AS avg_return_logistics, ROUND(AVG(revenue - discount - outbound_logistics - return_logistics), 2) AS contribution_margin_per_order, ROUND(SUM(revenue - discount - outbound_logistics - return_logistics), 0) AS total_contribution_margin FROM order_economics GROUP BY tier ORDER BY tier',
        correctQueryFormatted: [
          'WITH order_economics AS (',
          '  SELECT o.order_id, ct.tier,',
          '    o.amount AS revenue,',
          '    COALESCE(d.discount_amount, 0) AS discount,',
          '    COALESCE(lc.outbound_cost, 0) + COALESCE(lc.packaging_cost, 0)',
          '      AS outbound_logistics,',
          '    CASE WHEN r.return_id IS NOT NULL',
          '      THEN COALESCE(r.return_logistics_cost, 0) ELSE 0 END AS return_logistics,',
          '    CASE WHEN r.return_id IS NOT NULL THEN 1 ELSE 0 END AS is_returned',
          '  FROM orders o',
          '  JOIN city_tiers ct ON o.city_id = ct.city_id',
          '  LEFT JOIN discounts d ON o.order_id = d.order_id',
          '  LEFT JOIN logistics_costs lc ON o.order_id = lc.order_id',
          '  LEFT JOIN returns r ON o.order_id = r.order_id',
          '  WHERE o.created_at >= CURRENT_DATE - INTERVAL \'90 days\'',
          ')',
          'SELECT tier,',
          '  COUNT(*) AS total_orders,',
          '  ROUND(AVG(revenue), 2) AS avg_revenue,',
          '  ROUND(AVG(discount), 2) AS avg_discount,',
          '  ROUND(AVG(outbound_logistics), 2) AS avg_outbound_logistics,',
          '  ROUND(100.0 * SUM(is_returned) / COUNT(*), 1) AS rto_rate,',
          '  ROUND(AVG(return_logistics), 2) AS avg_return_logistics,',
          '  ROUND(AVG(revenue - discount - outbound_logistics - return_logistics), 2)',
          '    AS contribution_margin_per_order,',
          '  ROUND(SUM(revenue - discount - outbound_logistics - return_logistics), 0)',
          '    AS total_contribution_margin',
          'FROM order_economics',
          'GROUP BY tier',
          'ORDER BY tier',
        ],
        keyElements: ['city_tiers', 'COALESCE', 'return_logistics_cost', 'LEFT JOIN', 'GROUP BY', 'tier'],
        expectedOutput: {
          headers: ['tier', 'total_orders', 'avg_revenue', 'avg_discount', 'avg_logistics', 'rto_rate', 'avg_rto_cost', 'margin_per_order'],
          rows: [
            ['Tier 1', '420K', '$28.50', '$2.28', '$3.20', '6.0%', '$0.47', '+$4.80'],
            ['Tier 2', '380K', '$22.10', '$4.86', '$5.10', '14.0%', '$1.09', '-$1.40'],
            ['Tier 3', '350K', '$20.00', '$7.00', '$7.80', '24.0%', '$1.87', '-$8.60'],
          ],
        },
        hints: ['Use a CTE to calculate the full economics of each order including discount, logistics, and return costs', 'For returned orders, include both outbound and return logistics in the cost calculation', 'Group by city tier to see how the economics differ across geographies'],
      },
      {
        type: 'communicate',
        title: 'Write the Brief',
        prompt: 'Write a brief for the VP of Growth explaining why the order growth is a problem, not a celebration.',
        modelAnswer: 'The 15% QoQ order growth is concentrated in Tier 2/3 cities where every order loses money: -$1.40 in Tier 2 and -$8.60 in Tier 3. The loss compounds because heavy discounts (35% in Tier 3) attract price-sensitive buyers with high return rates (24%), and each return costs approximately $16 in lost discount plus round-trip logistics. At current run rate, Tier 2/3 expansion is burning approximately $3.5M per quarter in negative contribution margin. The order growth will accelerate losses unless we restructure the discount and return economics for these markets. Recommended action: cap discounts at 15% for Tier 2/3 cities with historical RTO rates above 20%, and introduce a return fee or stricter return window for high-RTO geographies.',
        rubric: ['Reframes order growth as a margin problem, not a success story', 'Explains the compounding mechanism of discounts and returns', 'Quantifies the total quarterly loss', 'Proposes a specific intervention with clear targeting criteria'],
        keyPhrases: ['Tier 2', 'Tier 3', 'discount', 'RTO', '$3.5M', 'contribution margin'],
      },
      {
        type: 'experiment',
        title: 'Design the Test',
        prompt: 'Design an experiment to test discount caps in high-RTO Tier 2/3 cities.',
        fields: [
          {
            label: 'Hypothesis',
            type: 'mcq',
            options: [
              { id: 'a', text: 'Capping discounts at 15% for Tier 2/3 cities with more than 20% historical RTO rate will improve contribution margin per order by reducing both discount cost and the volume of discount-driven orders that get returned, while maintaining order volume from genuine buyers', correct: true },
              { id: 'b', text: 'Removing all discounts in Tier 3 cities will make every order profitable and solve the margin problem within one quarter', correct: false },
              { id: 'c', text: 'Increasing logistics efficiency in Tier 3 cities will reduce per-order cost enough to make current discount levels sustainable', correct: false },
            ],
            correctAnswer: 'Option A is targeted and realistic, addressing both the discount and RTO levers. Option B is too aggressive and would likely collapse order volume in those markets. Option C treats a symptom (logistics cost) rather than the root cause (discount-driven demand attracting high-RTO buyers).',
          },
          {
            label: 'Unit of randomization',
            type: 'mcq',
            options: [
              { id: 'a', text: 'City-level randomization, assigning each eligible city to treatment or control to avoid within-city spillover effects from users sharing discount codes', correct: true },
              { id: 'b', text: 'User-level randomization within each city, showing different discount caps to different users in the same city', correct: false },
              { id: 'c', text: 'Order-level randomization, applying the cap randomly to individual orders', correct: false },
            ],
            correctAnswer: 'City-level randomization prevents spillover from discount code sharing and word-of-mouth effects within a city. User-level within a city creates contamination when users compare offers. Order-level is inconsistent and confusing for users.',
          },
          {
            label: 'Primary metric',
            type: 'mcq',
            options: [
              { id: 'a', text: 'Contribution margin per order in the treated cities, calculated as revenue minus discount minus logistics minus RTO cost', correct: true },
              { id: 'b', text: 'Total order volume in treated cities', correct: false },
              { id: 'c', text: 'Average discount rate in treated cities', correct: false },
              { id: 'd', text: 'Customer satisfaction score in treated cities', correct: false },
            ],
            correctAnswer: 'Contribution margin per order is the metric you are trying to fix. Order volume is a guardrail, not the primary metric. Average discount rate is an input variable you are directly manipulating, not an outcome. Customer satisfaction is too slow and noisy.',
          },
          {
            label: 'Guardrail metrics',
            type: 'multi',
            options: [
              { id: 'a', text: 'Total order volume (acceptable to decline up to 10%)', correct: true },
              { id: 'b', text: 'New user acquisition rate', correct: true },
              { id: 'c', text: 'RTO rate (should improve with less discount-driven buying)', correct: true },
              { id: 'd', text: 'Tier 1 city order volume', correct: false },
              { id: 'e', text: 'Seller listing count in treated cities', correct: false },
              { id: 'f', text: 'Repeat purchase rate for non-discount orders', correct: true },
            ],
            correctAnswer: 'Order volume, new user acquisition, RTO rate, and repeat purchase rate directly measure the health of the treated markets. Tier 1 city volume is unaffected by Tier 2/3 discount changes. Seller listing count is a supply-side metric that moves too slowly to be a useful guardrail for a 6-week test.',
          },
        ],
      },
      {
        type: 'readout',
        title: 'The Readout',
        prompt: 'The experiment ran for 6 weeks across 40 eligible cities. Here are the results:',
        resultsTable: {
          headers: ['Metric', 'Control', 'Treatment', 'Lift', 'p-value'],
          rows: [
            ['Orders per City', '8,200/mo', '8,100/mo', '-1.2%', '0.68'],
            ['Contribution Margin/Order', '-$5.80', '-$0.90', '+84.5%', '<0.001'],
            ['RTO Rate', '21.4%', '14.2%', '-33.6%', '<0.001'],
            ['Avg Discount', '31.2%', '14.8%', '-52.6%', '<0.001'],
            ['New User Acquisition', '1,400/mo', '980/mo', '-30.0%', '0.003'],
            ['Repeat Purchase Rate', '28.1%', '32.4%', '+15.3%', '0.02'],
          ],
        },
        question: 'What is your recommendation?',
        options: [
          {
            id: 'ship',
            text: 'Ship the 15% discount cap to all eligible Tier 2/3 cities',
            correct: false,
            feedback: 'The margin improvement is excellent and order volume barely changed, but the 30% drop in new user acquisition is a serious concern. In Tier 2/3 markets, acquisition is still critical for long-term growth. Applying the cap uniformly would protect margins but choke the acquisition funnel. The right answer requires differentiating between existing and new users.'
          },
          {
            id: 'conditional-ship',
            text: 'Ship for existing users but keep uncapped discounts for first-time buyers only to preserve acquisition while protecting repeat-order margins',
            correct: true,
            feedback: 'Correct. This is the optimal resolution. The discount cap dramatically improves margins on repeat orders (where it matters most) and actually improved repeat purchase rate by 15%, suggesting that less discount-driven users are higher quality. But new user acquisition dropped 30%, which would starve the growth engine. By keeping uncapped discounts for first orders only, you acquire new users at the current rate and then transition them to the capped discount structure for subsequent orders. This preserves the acquisition funnel while fixing the repeat-order economics that drive the majority of losses.'
          },
          {
            id: 'no-ship',
            text: 'Do not ship because the acquisition drop is too severe',
            correct: false,
            feedback: 'The acquisition drop is real but manageable with a conditional approach. At -$5.80 contribution margin per order, the current model loses money on every order including acquisitions. Acquiring users at a loss is only justified if they become profitable on repeat orders, but without the discount cap, repeat orders are also unprofitable. A blanket no-ship decision preserves the very problem you are trying to solve.'
          },
        ],
        debrief: 'This case is the hardest in the Full Loop series because it requires the analyst to navigate a multi-layered tradeoff across growth, margin, and acquisition. The key insight is that discount-driven growth in emerging markets creates a compounding loss loop: discounts attract price-sensitive buyers who return orders at high rates, and each return amplifies the loss. The correct resolution is not a binary ship or no-ship, but a segmented strategy that treats acquisition and retention differently. First-time buyer discounts are an investment in future LTV, but only if the repeat-order economics are fixed. The discount cap fixes repeat economics while the uncapped first-order discount preserves the acquisition funnel. This mirrors real marketplace operations where the first order is treated as a marketing cost and all subsequent orders must be margin-positive. The analyst who ships blindly ignores the acquisition problem; the analyst who refuses to ship preserves a fundamentally broken economic model. The correct answer threads the needle between both.',
      },
    ],
  },
];

export const fullLoopCasesById = Object.fromEntries(
  fullLoopCases.map(c => [c.id, c])
);
