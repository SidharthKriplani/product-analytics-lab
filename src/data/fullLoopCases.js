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

  {
    id: 'fl06',
    title: 'Loan Approval Rate Dropping',
    domain: 'Fintech / Lending',
    difficulty: 'analyst',
    isFree: false,
    guestPreview: false,
    phases: [
      {
        type: 'alert',
        title: 'The Alert',
        metricName: 'Loan Approval Rate',
        metricValue: '54.2%',
        metricChange: '-18% WoW',
        prompt: 'Your lending dashboard shows the loan approval rate dropped 18% week-over-week, from 66.1% to 54.2%. Support tickets from applicants are rising. What is your first move?',
        options: [
          {
            id: 'a',
            text: 'Segment approval rates by channel (mobile, web, branch) and credit score bucket to isolate where the decline is concentrated',
            correct: true,
            feedback: 'Correct. Approval rate drops can stem from applicant quality changes, underwriting rule changes, or technical issues in the scoring pipeline. Segmenting by channel and credit score bucket tells you whether the drop is broad or isolated, which immediately narrows your investigation to the right system layer.'
          },
          {
            id: 'b',
            text: 'Lower the credit score threshold immediately to restore the approval rate',
            correct: false,
            feedback: 'Adjusting the threshold without understanding the root cause is dangerous. If the scoring itself is broken, lowering the threshold could approve applicants who should be rejected, increasing default risk. You need to diagnose the problem before changing underwriting parameters.'
          },
          {
            id: 'c',
            text: 'Check if marketing acquired a lower-quality applicant pool this week',
            correct: false,
            feedback: 'Marketing mix changes could affect applicant quality, but an 18% drop in one week is unusually sharp for an acquisition channel shift. Even if the applicant pool changed, you need segmentation data to confirm the hypothesis. Start with channel and score bucket analysis before attributing the decline to marketing.'
          },
        ],
      },
      {
        type: 'data',
        title: 'Read the Data',
        prompt: 'Here is the approval rate breakdown by application channel and credit score provider. What stands out?',
        dataTable: {
          headers: ['Channel', 'Score Provider', 'Approval Rate This Week', 'Approval Rate Last Week', 'Change'],
          rows: [
            ['Mobile', 'New Bureau API', '41.3%', '64.8%', '-23.5pp'],
            ['Mobile', 'Legacy Bureau', '63.9%', '65.2%', '-1.3pp'],
            ['Web', 'New Bureau API', '43.1%', '66.0%', '-22.9pp'],
            ['Web', 'Legacy Bureau', '65.4%', '66.1%', '-0.7pp'],
            ['Branch', 'Legacy Bureau', '68.2%', '67.5%', '+0.7pp'],
          ],
        },
        guideQuestion: 'What is common across the segments showing large declines? What changed recently?',
        modelObservation: 'The approval rate decline is isolated to applications scored by the New Bureau API, regardless of channel. Mobile and web applications routed to the new credit bureau both dropped by 23 percentage points, while applications still using the legacy bureau and all branch applications (which only use the legacy bureau) are stable. This pattern points directly to the new credit score provider integration, which went live 9 days ago. The new bureau is returning systematically different scores that push more applicants below the existing approval threshold.',
        keyPhrases: ['New Bureau API', 'credit score', 'channel', 'threshold', 'integration'],
      },
      {
        type: 'rca',
        title: 'Root Cause',
        prompt: 'Based on the data, what is the most likely root cause of the approval rate drop?',
        options: [
          {
            id: 'a',
            text: 'The new credit bureau API returns scores on a stricter distribution, causing the same applicants to score 40-60 points lower than they would on the legacy bureau, pushing them below the unchanged approval threshold',
            correct: true,
            feedback: 'Correct. The new bureau uses a different scoring model with a tighter distribution. An applicant who scored 680 on the legacy bureau might score 630 on the new one. Since the approval threshold of 650 was calibrated for the legacy bureau\'s distribution, the unchanged threshold is now rejecting creditworthy applicants. The underlying creditworthiness of applicants has not changed; only the measurement instrument has.'
          },
          {
            id: 'b',
            text: 'A fraud ring is submitting synthetic identity applications through mobile and web channels',
            correct: false,
            feedback: 'Fraud-driven applications would typically show up as rejections due to identity verification failures or fraud model flags, not as credit score-based rejections. Additionally, fraud attacks do not align neatly with a credit score provider switch. The channel pattern matches the new bureau routing, not a fraud vector.'
          },
          {
            id: 'c',
            text: 'Macroeconomic conditions worsened, reducing the creditworthiness of applicants across digital channels',
            correct: false,
            feedback: 'If macroeconomic conditions were the driver, you would see approval rates decline across all channels and both score providers. Branch applications using the legacy bureau are stable, and digital applications on the legacy bureau are also stable. The decline is isolated to one scoring provider, ruling out a macro explanation.'
          },
        ],
      },
      {
        type: 'sql',
        title: 'Investigate with SQL',
        schema: {
          tables: [
            {
              name: 'loan_applications',
              columns: ['application_id INT', 'user_id INT', 'channel TEXT', 'submitted_at TIMESTAMP', 'status TEXT', 'decision_reason TEXT'],
            },
            {
              name: 'credit_scores',
              columns: ['application_id INT', 'bureau TEXT', 'score INT', 'pulled_at TIMESTAMP'],
            },
            {
              name: 'approval_decisions',
              columns: ['application_id INT', 'decision TEXT', 'decided_at TIMESTAMP', 'threshold_used INT'],
            },
          ],
        },
        task: 'Compare approval rates by credit bureau and score bucket (sub-600, 600-649, 650-699, 700+) for the last 2 weeks to show how the new bureau\'s score distribution shifts applicants across buckets.',
        correctQuery: 'SELECT cs.bureau, CASE WHEN cs.score < 600 THEN \'sub-600\' WHEN cs.score BETWEEN 600 AND 649 THEN \'600-649\' WHEN cs.score BETWEEN 650 AND 699 THEN \'650-699\' WHEN cs.score >= 700 THEN \'700+\' END AS score_bucket, COUNT(*) AS applications, SUM(CASE WHEN ad.decision = \'approved\' THEN 1 ELSE 0 END) AS approved, ROUND(100.0 * SUM(CASE WHEN ad.decision = \'approved\' THEN 1 ELSE 0 END) / COUNT(*), 1) AS approval_rate FROM loan_applications la JOIN credit_scores cs ON la.application_id = cs.application_id JOIN approval_decisions ad ON la.application_id = ad.application_id WHERE la.submitted_at >= CURRENT_DATE - INTERVAL \'14 days\' GROUP BY cs.bureau, score_bucket ORDER BY cs.bureau, score_bucket',
        correctQueryFormatted: [
          'SELECT cs.bureau,',
          '  CASE',
          '    WHEN cs.score < 600 THEN \'sub-600\'',
          '    WHEN cs.score BETWEEN 600 AND 649 THEN \'600-649\'',
          '    WHEN cs.score BETWEEN 650 AND 699 THEN \'650-699\'',
          '    WHEN cs.score >= 700 THEN \'700+\'',
          '  END AS score_bucket,',
          '  COUNT(*) AS applications,',
          '  SUM(CASE WHEN ad.decision = \'approved\'',
          '    THEN 1 ELSE 0 END) AS approved,',
          '  ROUND(100.0 * SUM(CASE WHEN ad.decision = \'approved\'',
          '    THEN 1 ELSE 0 END) / COUNT(*), 1) AS approval_rate',
          'FROM loan_applications la',
          'JOIN credit_scores cs ON la.application_id = cs.application_id',
          'JOIN approval_decisions ad ON la.application_id = ad.application_id',
          'WHERE la.submitted_at >= CURRENT_DATE - INTERVAL \'14 days\'',
          'GROUP BY cs.bureau, score_bucket',
          'ORDER BY cs.bureau, score_bucket',
        ],
        keyElements: ['credit_scores', 'bureau', 'CASE', 'BETWEEN', 'GROUP BY', 'approval'],
        expectedOutput: {
          headers: ['bureau', 'score_bucket', 'applications', 'approved', 'approval_rate'],
          rows: [
            ['legacy', 'sub-600', '1,200', '0', '0.0%'],
            ['legacy', '600-649', '3,400', '0', '0.0%'],
            ['legacy', '650-699', '5,800', '5,510', '95.0%'],
            ['legacy', '700+', '4,600', '4,554', '99.0%'],
            ['new_bureau', 'sub-600', '2,100', '0', '0.0%'],
            ['new_bureau', '600-649', '5,900', '0', '0.0%'],
            ['new_bureau', '650-699', '4,200', '3,990', '95.0%'],
            ['new_bureau', '700+', '2,800', '2,772', '99.0%'],
          ],
        },
        hints: ['Use a CASE expression to bucket credit scores into ranges', 'Join loan_applications with credit_scores and approval_decisions', 'Group by bureau and score bucket to compare distributions across providers'],
      },
      {
        type: 'communicate',
        title: 'Write the Brief',
        prompt: 'Write a brief for the risk team explaining the root cause and your recommended path forward.',
        modelAnswer: 'The new credit bureau API, integrated 9 days ago, returns scores that are systematically 40-60 points lower than the legacy bureau for the same applicants. Our approval threshold of 650 was calibrated for the legacy bureau\'s distribution, so the unchanged threshold is now rejecting creditworthy applicants who would have been approved under the legacy scoring. This has dropped approval rates from 66% to 54%, affecting approximately 1,800 applicants per week who are being incorrectly rejected. Recommended next step: run a dual-scoring A/B test comparing the old versus new credit bureau with the same default rate as the primary metric, so we can recalibrate the threshold for the new bureau\'s distribution without increasing default risk.',
        rubric: ['Explains the score distribution mismatch clearly', 'Distinguishes between applicant quality and measurement instrument', 'Proposes a calibration approach rather than a blanket threshold change'],
        keyPhrases: ['credit bureau', 'threshold', 'distribution', '40-60 points', 'calibrate', 'default risk'],
      },
      {
        type: 'experiment',
        title: 'Design the Test',
        prompt: 'Design an A/B test to validate the new credit scoring with an adjusted threshold.',
        fields: [
          {
            label: 'Hypothesis',
            type: 'mcq',
            options: [
              { id: 'a', text: 'Adjusting the approval threshold from 650 to 610 for the new bureau will restore the approval rate to pre-migration levels (above 64%) while maintaining the same 30-day default rate as the legacy bureau', correct: true },
              { id: 'b', text: 'Reverting entirely to the legacy bureau will restore approval rates and is the safest long-term solution', correct: false },
              { id: 'c', text: 'Approving all applicants above 600 on the new bureau will maximize volume without materially increasing defaults', correct: false },
            ],
            correctAnswer: 'Option A correctly targets both approval rate restoration and default rate parity. Option B avoids solving the problem and abandons potential benefits of the new bureau. Option C sets an arbitrary threshold without grounding it in default rate equivalence.',
          },
          {
            label: 'Unit of randomization',
            type: 'mcq',
            options: [
              { id: 'a', text: 'Applicant-level randomization, with each new applicant randomly assigned to be scored by the old bureau or the new bureau with adjusted threshold', correct: true },
              { id: 'b', text: 'Branch-level randomization, assigning each branch to one scoring method', correct: false },
              { id: 'c', text: 'Day-level randomization, alternating days between old and new scoring', correct: false },
            ],
            correctAnswer: 'Applicant-level randomization maximizes statistical power and avoids time-based or geography-based confounds. Branch-level is irrelevant since the issue is in digital channels. Day-level introduces temporal confounds from varying applicant quality across days.',
          },
          {
            label: 'Primary metric',
            type: 'mcq',
            options: [
              { id: 'a', text: 'Approval rate at equivalent 30-day default rate (measuring whether the adjusted threshold produces the same creditworthiness boundary)', correct: true },
              { id: 'b', text: 'Raw approval rate regardless of default outcomes', correct: false },
              { id: 'c', text: 'Total loan volume originated in dollars', correct: false },
              { id: 'd', text: 'Applicant satisfaction score', correct: false },
            ],
            correctAnswer: 'The primary metric must hold default risk constant while comparing approval rates. Raw approval rate ignores credit quality. Loan volume is a downstream metric. Satisfaction is a lagging indicator that does not measure underwriting accuracy.',
          },
          {
            label: 'Guardrail metrics',
            type: 'multi',
            options: [
              { id: 'a', text: '30-day default rate', correct: true },
              { id: 'b', text: '90-day delinquency rate', correct: true },
              { id: 'c', text: 'Fraud detection rate (ensure new bureau does not miss synthetic identities)', correct: true },
              { id: 'd', text: 'Mobile app crash rate', correct: false },
              { id: 'e', text: 'Marketing campaign click-through rate', correct: false },
            ],
            correctAnswer: 'Default rate, delinquency rate, and fraud detection directly measure whether the adjusted threshold maintains credit quality. App crash rate and marketing CTR are unrelated to the scoring change.',
          },
        ],
      },
      {
        type: 'readout',
        title: 'The Readout',
        prompt: 'The experiment ran for 4 weeks. Here are the results:',
        resultsTable: {
          headers: ['Metric', 'Control', 'Treatment', 'Lift', 'p-value'],
          rows: [
            ['Approval Rate', '54.1%', '65.8%', '+21.6%', '<0.001'],
            ['30-day Default Rate', '2.1%', '2.3%', '+9.5%', '0.38'],
            ['90-day Delinquency Rate', '4.8%', '5.0%', '+4.2%', '0.51'],
            ['Fraud Detection Rate', '98.2%', '98.5%', '+0.3%', '0.72'],
            ['Avg Processing Time', '1.8s', '1.2s', '-33.3%', '<0.001'],
          ],
        },
        question: 'What is your recommendation?',
        options: [
          {
            id: 'ship',
            text: 'Ship the new scoring with adjusted threshold to 100%',
            correct: true,
            feedback: 'Correct. The adjusted threshold restores approval rates to pre-migration levels while keeping default and delinquency rates statistically indistinguishable from the legacy bureau. Fraud detection is equivalent. The new bureau also processes scores faster, reducing applicant wait time. There is no evidence of increased credit risk, and every day with the unadjusted threshold unnecessarily rejects creditworthy applicants.'
          },
          {
            id: 'no-ship',
            text: 'Revert to the legacy bureau entirely',
            correct: false,
            feedback: 'Reverting abandons the benefits of the new bureau, including faster processing and potentially better long-term scoring accuracy. The experiment shows that with the adjusted threshold, the new bureau matches the legacy bureau on all risk metrics. There is no reason to revert when the calibrated solution works.'
          },
          {
            id: 'investigate',
            text: 'Wait for 90-day default data before deciding',
            correct: false,
            feedback: 'While 90-day data would add confidence, the 30-day default rate is the industry standard leading indicator and shows no statistically significant difference. Waiting another 60 days means rejecting approximately 5,400 creditworthy applicants. The 90-day delinquency trend from the 4-week cohort already shows no material difference. The cost of waiting outweighs the marginal information gain.'
          },
        ],
        debrief: 'This case teaches the critical distinction between a measurement instrument change and an actual quality change. The applicants did not get worse; the scoring ruler changed. The approval rate drop was not a signal of deteriorating credit quality but a calibration mismatch between the new bureau\'s score distribution and the threshold set for the old bureau. The analyst\'s job is to recognize when the metric movement reflects a real change versus an instrumentation artifact. The experiment confirmed that recalibrating the threshold restores approval rates without increasing default risk, validating that the underlying credit quality of applicants was unchanged throughout.',
      },
    ],
  },

  {
    id: 'fl07',
    title: 'Course Completion Rate Declining',
    domain: 'EdTech',
    difficulty: 'analyst',
    isFree: false,
    guestPreview: false,
    phases: [
      {
        type: 'alert',
        title: 'The Alert',
        metricName: 'Course Completion Rate',
        metricValue: '38.4%',
        metricChange: '-15% over 3 weeks',
        prompt: 'Course completion rate on your EdTech platform has dropped from 45.2% to 38.4% over the last 3 weeks. The decline is steady, not a sudden cliff. What is your first move?',
        options: [
          {
            id: 'a',
            text: 'Segment completion rate by course length, content type, and platform (mobile vs desktop) to isolate the affected cohort',
            correct: true,
            feedback: 'Correct. Completion rate can be affected by course difficulty, content format, or platform-specific issues. Segmenting across these dimensions reveals whether the drop is universal or concentrated. A 15% decline over 3 weeks that is steady suggests a systematic change rather than a random fluctuation, so the cause should be identifiable through segmentation.'
          },
          {
            id: 'b',
            text: 'Survey students who dropped out to ask why they stopped',
            correct: false,
            feedback: 'Surveys are slow and suffer from response bias. Students who dropped out are the least likely to respond, and those who do may not accurately identify the real reason (they may say the content was boring when the real issue was technical). Start with behavioral data segmentation, which covers 100% of users and is available immediately.'
          },
          {
            id: 'c',
            text: 'Check if new courses added recently are harder and dragging down the average',
            correct: false,
            feedback: 'New course additions would affect the rate if they have lower completion, but this is a specific hypothesis that should follow segmentation, not precede it. If the drop is only on mobile or only on long courses, new course difficulty is irrelevant. Let the data tell you where to look.'
          },
        ],
      },
      {
        type: 'data',
        title: 'Read the Data',
        prompt: 'Here is the completion rate breakdown by course length bucket and platform. What stands out?',
        dataTable: {
          headers: ['Course Length', 'Platform', 'Completion Rate This Period', 'Completion Rate Prior Period', 'Change'],
          rows: [
            ['Under 1 hour', 'Desktop', '72.1%', '73.0%', '-0.9pp'],
            ['Under 1 hour', 'Mobile', '68.4%', '69.1%', '-0.7pp'],
            ['1-2 hours', 'Desktop', '54.3%', '55.8%', '-1.5pp'],
            ['1-2 hours', 'Mobile', '50.1%', '51.2%', '-1.1pp'],
            ['2-5 hours', 'Desktop', '38.2%', '39.5%', '-1.3pp'],
            ['2-5 hours', 'Mobile', '21.4%', '36.8%', '-15.4pp'],
            ['5+ hours', 'Desktop', '24.6%', '25.1%', '-0.5pp'],
            ['5+ hours', 'Mobile', '9.2%', '22.7%', '-13.5pp'],
          ],
        },
        guideQuestion: 'Which combination of course length and platform shows the sharpest decline?',
        modelObservation: 'The completion rate drop is overwhelmingly concentrated in courses longer than 2 hours on mobile devices. Mobile completion for 2-5 hour courses dropped 15.4 percentage points, and 5+ hour courses dropped 13.5 points. Desktop completion for the same course lengths is essentially flat. Short courses on both platforms are also stable. This combination of mobile-only and long-course-only strongly suggests a video playback issue on mobile that manifests during longer viewing sessions. The next step is to check mobile video player metrics: buffering rates, playback errors, and session abandonment timestamps.',
        keyPhrases: ['mobile', 'long courses', '2+ hours', 'buffering', 'video player', 'playback'],
      },
      {
        type: 'rca',
        title: 'Root Cause',
        prompt: 'Mobile engineering confirms that a browser autoplay policy update went live 3 weeks ago. The video player was updated to comply with the new policy. What is the most likely root cause?',
        options: [
          {
            id: 'a',
            text: 'The autoplay policy compliance update broke video preloading on mobile, causing severe buffering after the first 30 minutes of playback as the buffer cache fills up and the player cannot prefetch ahead',
            correct: true,
            feedback: 'Correct. The autoplay policy change required the video player to stop preloading content until user interaction. The player\'s lazy loading implementation was not designed for long sessions: it loads each segment only when the user reaches it, causing buffering gaps that compound over time. For short courses, the buffer stays ahead of playback. For courses over 2 hours, the accumulated buffering pauses degrade the experience enough that users abandon. This explains the sharp threshold at 2 hours and the mobile-only pattern.'
          },
          {
            id: 'b',
            text: 'Course content quality has declined in longer courses, causing students to disengage',
            correct: false,
            feedback: 'If content quality were the issue, you would see the decline on both desktop and mobile for long courses. Desktop completion for 2-5 hour and 5+ hour courses is essentially flat. The same content plays fine on desktop but fails on mobile, which rules out a content quality explanation and points to a platform-specific technical issue.'
          },
          {
            id: 'c',
            text: 'A competitor launched a mobile app with shorter courses, pulling mobile users to a different platform',
            correct: false,
            feedback: 'Competitor dynamics would affect all course lengths on mobile, not just courses over 2 hours. Short mobile courses are stable. Additionally, a competitor launch would not produce a clean threshold effect at exactly 2 hours of course length. The pattern is too specific to be a competitive explanation.'
          },
        ],
      },
      {
        type: 'sql',
        title: 'Investigate with SQL',
        schema: {
          tables: [
            {
              name: 'course_enrollments',
              columns: ['enrollment_id INT', 'user_id INT', 'course_id INT', 'enrolled_at TIMESTAMP', 'completed_at TIMESTAMP', 'platform TEXT'],
            },
            {
              name: 'courses',
              columns: ['course_id INT', 'title TEXT', 'duration_minutes INT', 'category TEXT'],
            },
            {
              name: 'video_playback_events',
              columns: ['event_id INT', 'enrollment_id INT', 'event_type TEXT', 'minutes_watched DECIMAL', 'buffer_time_seconds DECIMAL', 'timestamp TIMESTAMP'],
            },
          ],
        },
        task: 'Calculate completion rate by course length bucket and platform, and include average buffering time per session to show the correlation between buffering and drop-off.',
        correctQuery: 'WITH course_stats AS (SELECT ce.enrollment_id, ce.platform, CASE WHEN c.duration_minutes <= 60 THEN \'under_1hr\' WHEN c.duration_minutes <= 120 THEN \'1-2hr\' WHEN c.duration_minutes <= 300 THEN \'2-5hr\' ELSE \'5hr_plus\' END AS length_bucket, CASE WHEN ce.completed_at IS NOT NULL THEN 1 ELSE 0 END AS is_completed FROM course_enrollments ce JOIN courses c ON ce.course_id = c.course_id WHERE ce.enrolled_at >= CURRENT_DATE - INTERVAL \'21 days\'), buffer_stats AS (SELECT vpe.enrollment_id, AVG(vpe.buffer_time_seconds) AS avg_buffer_seconds FROM video_playback_events vpe WHERE vpe.event_type = \'playback\' AND vpe.timestamp >= CURRENT_DATE - INTERVAL \'21 days\' GROUP BY vpe.enrollment_id) SELECT cs.length_bucket, cs.platform, COUNT(*) AS enrollments, ROUND(100.0 * SUM(cs.is_completed) / COUNT(*), 1) AS completion_rate, ROUND(AVG(bs.avg_buffer_seconds), 1) AS avg_buffer_seconds FROM course_stats cs LEFT JOIN buffer_stats bs ON cs.enrollment_id = bs.enrollment_id GROUP BY cs.length_bucket, cs.platform ORDER BY cs.length_bucket, cs.platform',
        correctQueryFormatted: [
          'WITH course_stats AS (',
          '  SELECT ce.enrollment_id, ce.platform,',
          '    CASE',
          '      WHEN c.duration_minutes <= 60 THEN \'under_1hr\'',
          '      WHEN c.duration_minutes <= 120 THEN \'1-2hr\'',
          '      WHEN c.duration_minutes <= 300 THEN \'2-5hr\'',
          '      ELSE \'5hr_plus\'',
          '    END AS length_bucket,',
          '    CASE WHEN ce.completed_at IS NOT NULL THEN 1 ELSE 0 END AS is_completed',
          '  FROM course_enrollments ce',
          '  JOIN courses c ON ce.course_id = c.course_id',
          '  WHERE ce.enrolled_at >= CURRENT_DATE - INTERVAL \'21 days\'',
          '),',
          'buffer_stats AS (',
          '  SELECT vpe.enrollment_id,',
          '    AVG(vpe.buffer_time_seconds) AS avg_buffer_seconds',
          '  FROM video_playback_events vpe',
          '  WHERE vpe.event_type = \'playback\'',
          '    AND vpe.timestamp >= CURRENT_DATE - INTERVAL \'21 days\'',
          '  GROUP BY vpe.enrollment_id',
          ')',
          'SELECT cs.length_bucket, cs.platform,',
          '  COUNT(*) AS enrollments,',
          '  ROUND(100.0 * SUM(cs.is_completed) / COUNT(*), 1) AS completion_rate,',
          '  ROUND(AVG(bs.avg_buffer_seconds), 1) AS avg_buffer_seconds',
          'FROM course_stats cs',
          'LEFT JOIN buffer_stats bs ON cs.enrollment_id = bs.enrollment_id',
          'GROUP BY cs.length_bucket, cs.platform',
          'ORDER BY cs.length_bucket, cs.platform',
        ],
        keyElements: ['course_enrollments', 'duration_minutes', 'buffer_time_seconds', 'CASE', 'GROUP BY', 'platform'],
        expectedOutput: {
          headers: ['length_bucket', 'platform', 'enrollments', 'completion_rate', 'avg_buffer_seconds'],
          rows: [
            ['under_1hr', 'desktop', '8,400', '72.1%', '0.8'],
            ['under_1hr', 'mobile', '12,200', '68.4%', '1.2'],
            ['1-2hr', 'desktop', '6,100', '54.3%', '1.1'],
            ['1-2hr', 'mobile', '9,800', '50.1%', '2.4'],
            ['2-5hr', 'desktop', '4,200', '38.2%', '1.3'],
            ['2-5hr', 'mobile', '7,600', '21.4%', '14.8'],
            ['5hr_plus', 'desktop', '2,100', '24.6%', '1.5'],
            ['5hr_plus', 'mobile', '3,400', '9.2%', '22.3'],
          ],
        },
        hints: ['Use a CASE expression to create course length buckets from duration_minutes', 'Join with video_playback_events to get buffering data per enrollment', 'Use a CTE to calculate per-enrollment buffer averages before aggregating by bucket and platform'],
      },
      {
        type: 'communicate',
        title: 'Write the Brief',
        prompt: 'Write a brief for the product lead explaining the issue, its impact, and your recommended fix.',
        modelAnswer: 'The video player update for autoplay policy compliance (deployed 3 weeks ago) broke preloading on mobile, causing buffering times to spike from 1.2 seconds to 14.8-22.3 seconds for courses over 2 hours. This has driven mobile completion rates down 15 percentage points for long courses, affecting approximately 11,000 active enrollments. The fix is to implement proactive preloading that prefetches the next 2-3 video segments during playback, which complies with the autoplay policy while preventing the buffer cache from falling behind in long sessions. Recommended timeline: ship preloading fix within 5 days, then monitor mobile buffering and completion recovery over 2 weeks.',
        rubric: ['Identifies the specific technical change that caused the issue', 'Quantifies the impact on completion rates and affected users', 'Proposes a specific technical fix with a timeline'],
        keyPhrases: ['autoplay', 'preloading', 'buffering', 'mobile', '2+ hours', 'completion rate'],
      },
      {
        type: 'experiment',
        title: 'Design the Test',
        prompt: 'Design an A/B test to validate the preloading fix before full rollout.',
        fields: [
          {
            label: 'Hypothesis',
            type: 'mcq',
            options: [
              { id: 'a', text: 'Enabling proactive preloading on mobile will reduce average buffering time to under 2 seconds for long courses and restore mobile completion rates to pre-regression levels (above 35% for 2-5 hour courses)', correct: true },
              { id: 'b', text: 'Reverting the autoplay compliance update entirely will restore completion rates without any regulatory or platform risk', correct: false },
              { id: 'c', text: 'Adding a download-before-watching feature will solve the buffering problem by moving all video to local storage', correct: false },
            ],
            correctAnswer: 'Option A directly tests the preloading fix with measurable targets. Option B creates compliance risk with browser autoplay policies. Option C is a large feature investment that solves the symptom rather than the root cause and requires significant storage on user devices.',
          },
          {
            label: 'Unit of randomization',
            type: 'mcq',
            options: [
              { id: 'a', text: 'User-level randomization, with each mobile user assigned to either the current lazy loading or the new preloading player for all their courses', correct: true },
              { id: 'b', text: 'Course-level randomization, assigning each course to one player version', correct: false },
              { id: 'c', text: 'Session-level randomization, varying the player version each time a user opens a course', correct: false },
            ],
            correctAnswer: 'User-level ensures a consistent experience. Course-level would give the same user different experiences in different courses, making it hard to attribute completion differences. Session-level creates jarring inconsistency and contaminates the measurement.',
          },
          {
            label: 'Primary metric',
            type: 'mcq',
            options: [
              { id: 'a', text: 'Course completion rate for mobile users enrolled in courses over 2 hours', correct: true },
              { id: 'b', text: 'Average buffering time across all sessions', correct: false },
              { id: 'c', text: 'Overall platform completion rate across all devices and course lengths', correct: false },
              { id: 'd', text: 'Number of video segments loaded per session', correct: false },
            ],
            correctAnswer: 'Completion rate for the affected segment (mobile, long courses) directly measures the outcome you want to improve. Buffering time is an input metric. Overall completion rate dilutes the signal with unaffected segments. Segments loaded is a technical metric that does not measure the user outcome.',
          },
          {
            label: 'Guardrail metrics',
            type: 'multi',
            options: [
              { id: 'a', text: 'Mobile data usage per session (preloading increases data consumption)', correct: true },
              { id: 'b', text: 'Battery consumption during long sessions', correct: true },
              { id: 'c', text: 'Video playback error rate', correct: true },
              { id: 'd', text: 'Desktop completion rate', correct: false },
              { id: 'e', text: 'Course enrollment rate', correct: false },
            ],
            correctAnswer: 'Data usage, battery consumption, and playback errors directly measure whether preloading introduces new costs or failures on mobile. Desktop completion is unaffected by a mobile-only change. Enrollment rate is upstream and not impacted by the player fix.',
          },
        ],
      },
      {
        type: 'readout',
        title: 'The Readout',
        prompt: 'The experiment ran for 3 weeks. Here are the results:',
        resultsTable: {
          headers: ['Metric', 'Control', 'Treatment', 'Lift', 'p-value'],
          rows: [
            ['Completion Rate (2-5hr, mobile)', '21.8%', '35.9%', '+64.7%', '<0.001'],
            ['Completion Rate (5hr+, mobile)', '9.5%', '21.4%', '+125.3%', '<0.001'],
            ['Avg Buffering Time (long courses)', '16.2s', '1.6s', '-90.1%', '<0.001'],
            ['Mobile Data per Session', '142MB', '168MB', '+18.3%', '<0.001'],
            ['Playback Error Rate', '3.1%', '1.4%', '-54.8%', '0.003'],
          ],
        },
        question: 'What is your recommendation?',
        options: [
          {
            id: 'ship',
            text: 'Ship preloading to 100% of mobile users',
            correct: true,
            feedback: 'Correct. Preloading dramatically restores completion rates and nearly eliminates buffering in long courses. The 18.3% increase in data usage is a real cost to users on metered connections, but the magnitude (26MB additional per session) is modest and the completion recovery is substantial. Playback errors also improved significantly. The data usage increase should be disclosed to users and optionally controllable in settings, but it does not block shipping.'
          },
          {
            id: 'no-ship',
            text: 'Do not ship due to the data usage increase',
            correct: false,
            feedback: 'A 26MB increase per session is a minor tradeoff for recovering completion rates that dropped 15 percentage points. Users on metered connections can be given a setting to control preloading behavior. Blocking the ship over a modest data increase while 11,000 enrollments are affected by severe buffering is not a reasonable tradeoff.'
          },
          {
            id: 'investigate',
            text: 'Investigate whether a lighter preloading strategy can reduce data usage before shipping',
            correct: false,
            feedback: 'Optimizing preloading aggressiveness is a valid follow-up, but should not block the initial ship. The current implementation solves the completion crisis. You can iterate on data efficiency after shipping. Delaying the fix to optimize a secondary metric extends the period where thousands of students cannot complete their courses.'
          },
        ],
        debrief: 'This case demonstrates how a seemingly minor technical compliance change can cascade into a significant product metric regression. The autoplay policy update was necessary, but the implementation created a hidden failure mode that only manifested in long mobile sessions. The key analytical skill is recognizing the two-variable interaction pattern: the problem required both mobile platform AND long course duration to appear, which is why a single-dimension segmentation (by platform alone or by course length alone) would have been insufficient. The experiment confirmed that preloading solves the buffering problem with an acceptable data usage tradeoff. The broader lesson is that video playback quality is a hidden driver of completion metrics that analysts often overlook in favor of content-quality explanations.',
      },
    ],
  },

  {
    id: 'fl08',
    title: 'Message Send Latency Spike',
    domain: 'Social / Messaging',
    difficulty: 'senior',
    isFree: false,
    guestPreview: false,
    phases: [
      {
        type: 'alert',
        title: 'The Alert',
        metricName: 'P95 Message Delivery Time',
        metricValue: '4.4s',
        metricChange: '+340% (was 1.0s)',
        prompt: 'The P95 message delivery time spiked from 1.0 second to 4.4 seconds over the past 48 hours. User complaints about slow messaging are flooding support. What is your first move?',
        options: [
          {
            id: 'a',
            text: 'Segment latency by chat type (1:1, small group, large group) and message volume tier to isolate where the spike is concentrated',
            correct: true,
            feedback: 'Correct. Latency spikes in messaging systems are rarely uniform. Different chat types have different query patterns, fan-out behavior, and infrastructure paths. Segmenting by chat type and size immediately reveals whether this is a broad infrastructure issue or a specific query path regression, which determines whether you need to involve the infrastructure team or the application team.'
          },
          {
            id: 'b',
            text: 'Scale up the messaging servers immediately to handle the load',
            correct: false,
            feedback: 'Scaling servers is a generic response that assumes the issue is load-related. A 340% latency spike is rarely caused by gradual load increase; it is more consistent with a query regression, infrastructure change, or configuration error. Scaling would be expensive and might not address the root cause. Diagnose first, then prescribe.'
          },
          {
            id: 'c',
            text: 'Check if total message volume increased due to a viral event or product launch',
            correct: false,
            feedback: 'Volume spikes from viral events usually affect P50 and P95 proportionally and resolve quickly. A sustained 340% P95 spike over 48 hours with stable P50 would be unusual for a volume-driven issue. Segmenting by chat type will reveal whether the latency is concentrated in a specific interaction pattern, which is more informative than overall volume analysis.'
          },
        ],
      },
      {
        type: 'data',
        title: 'Read the Data',
        prompt: 'Here is message delivery latency broken down by chat size bucket. What pattern emerges?',
        dataTable: {
          headers: ['Chat Type', 'Members', 'P50 Latency', 'P95 Latency', 'P95 Change', 'Volume Share'],
          rows: [
            ['1:1 DM', '2', '0.12s', '0.31s', '+3%', '45%'],
            ['Small Group', '3-10', '0.18s', '0.52s', '+8%', '30%'],
            ['Medium Group', '11-50', '0.24s', '0.89s', '+12%', '15%'],
            ['Large Group', '51-200', '0.41s', '4.2s', '+380%', '7%'],
            ['Very Large Group', '200+', '0.68s', '8.9s', '+520%', '3%'],
          ],
        },
        guideQuestion: 'Which chat size buckets are affected? What database or infrastructure pattern could explain a size-dependent latency spike?',
        modelObservation: 'The latency spike is almost entirely concentrated in groups with more than 50 members. P95 for large groups jumped 380% and very large groups jumped 520%, while 1:1 and small groups are nearly unchanged. This size-dependent pattern is a strong signal for a database query regression. In messaging systems, sending to large groups requires fanning out the message to many recipients, which typically involves a query that scales with group membership count. A missing or dropped index on the group membership table, or a query plan change that switched from an index scan to a sequential scan for large groups, would produce exactly this pattern.',
        keyPhrases: ['large group', '50+ members', 'fan-out', 'database', 'index', 'query plan'],
      },
      {
        type: 'rca',
        title: 'Root Cause',
        prompt: 'The database team confirms that a scheduled index migration ran 48 hours ago. What is the most likely root cause?',
        options: [
          {
            id: 'a',
            text: 'The index migration dropped or rebuilt the compound index on the group membership table, causing the message fan-out query to fall back to a sequential scan for large groups',
            correct: true,
            feedback: 'Correct. The index migration was intended to consolidate several single-column indexes into compound indexes for storage efficiency. However, the migration dropped the original index on (group_id, user_id) before the new compound index finished building. For 48 hours, the fan-out query has been doing sequential scans on the membership table. Small groups are barely affected because a sequential scan of 10 rows is fast, but scanning 200+ rows per message send creates the 4-8 second latency observed in large groups.'
          },
          {
            id: 'b',
            text: 'A sudden increase in spam messages in large groups is overloading the message queue',
            correct: false,
            feedback: 'Spam would increase message volume, but the data shows the volume share of large groups has not changed (7% and 3%). The issue is per-message latency, not message volume. Additionally, spam filtering typically runs after delivery, not during the fan-out process. The size-dependent latency pattern points to a query-level issue, not a volume issue.'
          },
          {
            id: 'c',
            text: 'The messaging service is experiencing network partition issues between data centers',
            correct: false,
            feedback: 'Network partition issues would affect all message types roughly equally, since all messages route through the same network path regardless of chat size. The fact that 1:1 messages are unaffected rules out a network-level issue. The size-dependent pattern requires a cause that scales with group membership count, which is a database query characteristic, not a network characteristic.'
          },
        ],
      },
      {
        type: 'sql',
        title: 'Investigate with SQL',
        schema: {
          tables: [
            {
              name: 'messages',
              columns: ['message_id INT', 'chat_id INT', 'sender_id INT', 'sent_at TIMESTAMP', 'delivered_at TIMESTAMP', 'content_type TEXT'],
            },
            {
              name: 'chats',
              columns: ['chat_id INT', 'chat_type TEXT', 'member_count INT', 'created_at TIMESTAMP'],
            },
            {
              name: 'message_delivery_log',
              columns: ['message_id INT', 'recipient_id INT', 'delivery_latency_ms INT', 'delivered_at TIMESTAMP'],
            },
          ],
        },
        task: 'Calculate P50 and P95 delivery latency by chat size bucket (1:1, 3-10, 11-50, 51-200, 200+) for the last 48 hours versus the prior 48 hours.',
        correctQuery: 'WITH latency_data AS (SELECT m.message_id, c.member_count, CASE WHEN c.member_count <= 2 THEN \'1:1\' WHEN c.member_count <= 10 THEN \'3-10\' WHEN c.member_count <= 50 THEN \'11-50\' WHEN c.member_count <= 200 THEN \'51-200\' ELSE \'200+\' END AS size_bucket, mdl.delivery_latency_ms, CASE WHEN m.sent_at >= NOW() - INTERVAL \'48 hours\' THEN \'current\' ELSE \'prior\' END AS period FROM messages m JOIN chats c ON m.chat_id = c.chat_id JOIN message_delivery_log mdl ON m.message_id = mdl.message_id WHERE m.sent_at >= NOW() - INTERVAL \'96 hours\') SELECT size_bucket, period, COUNT(*) AS messages, ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY delivery_latency_ms)) AS p50_ms, ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY delivery_latency_ms)) AS p95_ms FROM latency_data GROUP BY size_bucket, period ORDER BY size_bucket, period',
        correctQueryFormatted: [
          'WITH latency_data AS (',
          '  SELECT m.message_id, c.member_count,',
          '    CASE',
          '      WHEN c.member_count <= 2 THEN \'1:1\'',
          '      WHEN c.member_count <= 10 THEN \'3-10\'',
          '      WHEN c.member_count <= 50 THEN \'11-50\'',
          '      WHEN c.member_count <= 200 THEN \'51-200\'',
          '      ELSE \'200+\'',
          '    END AS size_bucket,',
          '    mdl.delivery_latency_ms,',
          '    CASE WHEN m.sent_at >= NOW() - INTERVAL \'48 hours\'',
          '      THEN \'current\' ELSE \'prior\' END AS period',
          '  FROM messages m',
          '  JOIN chats c ON m.chat_id = c.chat_id',
          '  JOIN message_delivery_log mdl ON m.message_id = mdl.message_id',
          '  WHERE m.sent_at >= NOW() - INTERVAL \'96 hours\'',
          ')',
          'SELECT size_bucket, period,',
          '  COUNT(*) AS messages,',
          '  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP',
          '    (ORDER BY delivery_latency_ms)) AS p50_ms,',
          '  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP',
          '    (ORDER BY delivery_latency_ms)) AS p95_ms',
          'FROM latency_data',
          'GROUP BY size_bucket, period',
          'ORDER BY size_bucket, period',
        ],
        keyElements: ['PERCENTILE_CONT', 'member_count', 'delivery_latency_ms', 'CASE', 'GROUP BY', 'INTERVAL'],
        expectedOutput: {
          headers: ['size_bucket', 'period', 'messages', 'p50_ms', 'p95_ms'],
          rows: [
            ['1:1', 'current', '1.2M', '120', '310'],
            ['1:1', 'prior', '1.1M', '115', '300'],
            ['3-10', 'current', '680K', '180', '520'],
            ['3-10', 'prior', '650K', '170', '480'],
            ['51-200', 'current', '180K', '410', '4,200'],
            ['51-200', 'prior', '175K', '150', '880'],
            ['200+', 'current', '72K', '680', '8,900'],
            ['200+', 'prior', '70K', '190', '1,100'],
          ],
        },
        hints: ['Use PERCENTILE_CONT to calculate P50 and P95 latency', 'Create a CASE expression to bucket chats by member count', 'Compare current 48-hour window to prior 48-hour window using a period flag'],
      },
      {
        type: 'communicate',
        title: 'Write the Brief',
        prompt: 'Write an incident summary for the VP of Engineering. This is an active incident affecting users.',
        modelAnswer: 'An index migration that ran 48 hours ago dropped the compound index on the group_members table before the replacement index finished building. This caused the message fan-out query to fall back to sequential scans, spiking P95 delivery latency from 1.0s to 4.4s overall, with large groups (50+ members) experiencing 4-9 second delivery times. Approximately 10% of all messages are affected (large and very large groups), generating over 2,000 user complaints. Immediate remediation: rebuild the original index on (group_id, user_id) with CONCURRENTLY to avoid table locks, which should restore latency within minutes of index completion. Estimated fix time: 30-45 minutes for index rebuild.',
        rubric: ['Identifies the specific infrastructure change and its mechanism', 'Quantifies the user impact with specifics', 'Proposes a concrete and time-bound remediation', 'Uses appropriate urgency for an active incident'],
        keyPhrases: ['index', 'sequential scan', 'group_members', 'fan-out', 'CONCURRENTLY', 'P95'],
      },
      {
        type: 'experiment',
        title: 'Design the Test',
        prompt: 'After rebuilding the original index as an emergency fix, the team wants to re-attempt the index consolidation safely. Design a test for the new index configuration.',
        fields: [
          {
            label: 'Hypothesis',
            type: 'mcq',
            options: [
              { id: 'a', text: 'The new consolidated compound index will maintain P95 delivery latency under 1.5 seconds for all chat sizes while reducing total index storage by 30%, provided it is built before the old index is dropped', correct: true },
              { id: 'b', text: 'Eliminating all secondary indexes and relying on primary key lookups will reduce storage costs without affecting query performance', correct: false },
              { id: 'c', text: 'Sharding the group_members table by chat_id will solve the latency problem permanently regardless of index configuration', correct: false },
            ],
            correctAnswer: 'Option A tests the specific consolidation change with a safety requirement (build before drop) and measurable targets. Option B is overly aggressive and would certainly degrade performance. Option C introduces unnecessary architectural complexity when the problem is an index configuration issue.',
          },
          {
            label: 'Unit of randomization',
            type: 'mcq',
            options: [
              { id: 'a', text: 'Database replica-level, routing a percentage of read traffic to a replica with the new index configuration while the primary retains the old indexes', correct: true },
              { id: 'b', text: 'User-level, sending some users\' queries to the new index and others to the old index', correct: false },
              { id: 'c', text: 'Message-level, randomly choosing which index to use for each individual message delivery', correct: false },
            ],
            correctAnswer: 'Replica-level testing is the standard pattern for database index changes. It isolates the new configuration on a separate replica where failures cannot affect the primary. User-level routing for index testing adds application complexity. Message-level would require query-level index hints, which is fragile.',
          },
          {
            label: 'Primary metric',
            type: 'mcq',
            options: [
              { id: 'a', text: 'P95 message delivery latency across all chat size buckets, compared between the old-index replica and new-index replica', correct: true },
              { id: 'b', text: 'Total database CPU utilization', correct: false },
              { id: 'c', text: 'Number of messages delivered per second', correct: false },
              { id: 'd', text: 'Index storage size in gigabytes', correct: false },
            ],
            correctAnswer: 'P95 latency across all chat sizes directly measures whether the new index configuration maintains the same query performance. CPU utilization is a guardrail. Throughput should be equivalent if latency is equivalent. Storage size is the goal of the consolidation, not the primary safety metric.',
          },
          {
            label: 'Guardrail metrics',
            type: 'multi',
            options: [
              { id: 'a', text: 'P99 latency for large groups (51+ members)', correct: true },
              { id: 'b', text: 'Database CPU and IOPS on the test replica', correct: true },
              { id: 'c', text: 'Query plan stability (no sequential scans on group_members)', correct: true },
              { id: 'd', text: 'User signup rate', correct: false },
              { id: 'e', text: 'Push notification delivery rate', correct: false },
            ],
            correctAnswer: 'P99 latency for large groups catches tail regression. CPU/IOPS ensures the new index is not more expensive to maintain. Query plan stability directly prevents the root cause from recurring. Signup rate and push notifications are unrelated to index configuration.',
          },
        ],
      },
      {
        type: 'readout',
        title: 'The Readout',
        prompt: 'The new index configuration was tested on a replica for 1 week. Here are the results:',
        resultsTable: {
          headers: ['Metric', 'Control', 'Treatment', 'Lift', 'p-value'],
          rows: [
            ['P95 Latency (all chats)', '0.98s', '0.91s', '-7.1%', '0.01'],
            ['P95 Latency (51-200 members)', '0.88s', '0.82s', '-6.8%', '0.03'],
            ['P99 Latency (200+ members)', '2.1s', '1.8s', '-14.3%', '0.02'],
            ['Database CPU Utilization', '62%', '58%', '-6.5%', '0.04'],
            ['Index Storage Size', '84GB', '58GB', '-31.0%', 'N/A'],
          ],
        },
        question: 'What is your recommendation?',
        options: [
          {
            id: 'ship',
            text: 'Ship the new index configuration to primary, dropping old indexes only after the new ones are confirmed active',
            correct: true,
            feedback: 'Correct. The new consolidated index matches or improves latency at every percentile across all chat sizes. CPU utilization improved, confirming the new index is more efficient. Storage savings of 31% match the target. Critically, the lesson from the original incident must be applied: drop the old indexes only after the new ones are confirmed active and serving queries. A phased rollout with monitoring at each step prevents a repeat of the original incident.'
          },
          {
            id: 'no-ship',
            text: 'Keep the old index configuration to avoid any risk of a repeat incident',
            correct: false,
            feedback: 'The old configuration wastes 26GB of storage and has higher CPU utilization. The test shows the new configuration is strictly better on all metrics. Avoiding the change out of fear of the original incident means the team learned the wrong lesson. The correct lesson is to never drop an index before its replacement is verified, not to never change indexes.'
          },
          {
            id: 'investigate',
            text: 'Run the test for another month to build more confidence',
            correct: false,
            feedback: 'One week of production-level traffic on a replica is sufficient for an index configuration test. The metrics are clear and statistically significant. Index performance is deterministic, not probabilistic, so longer testing does not add meaningful confidence. The 26GB storage cost and higher CPU utilization continue every day you delay.'
          },
        ],
        debrief: 'This case covers an infrastructure-level incident that requires the analyst to bridge product metrics (message delivery latency) with database internals (index configuration). The key analytical skill is recognizing that a size-dependent latency pattern is the signature of a query plan regression, not a load or network issue. The experiment design uses replica-level testing, which is the standard pattern for database changes and differs from the user-level randomization used in most product experiments. The ship decision emphasizes procedural safety: the original incident occurred because of a process failure (dropping before building), and the correct resolution is to fix the process, not to avoid the change. This mirrors real-world infrastructure operations where the post-mortem action item is almost always about deployment procedure, not about reversing the change itself.',
      },
    ],
  },

  {
    id: 'fl09',
    title: 'Driver Cancellation Rate Surge',
    domain: 'Ride-hailing',
    difficulty: 'senior',
    isFree: false,
    guestPreview: false,
    phases: [
      {
        type: 'alert',
        title: 'The Alert',
        metricName: 'Driver-side Cancellation Rate',
        metricValue: '14.2%',
        metricChange: '+28% (was 11.1%)',
        prompt: 'Driver-side cancellations have surged from 11.1% to 14.2% over the past 2 weeks. Rider complaints about cancelled trips are increasing, and average wait times are creeping up. What is your first move?',
        options: [
          {
            id: 'a',
            text: 'Segment cancellation rate by ride distance bucket, time of day, and market to identify where the increase is concentrated',
            correct: true,
            feedback: 'Correct. Driver cancellations are driven by economics: drivers cancel rides that are not worth their time. Segmenting by distance, time, and market reveals whether the increase is uniform or concentrated in specific ride profiles. This tells you whether the cause is a broad policy change, a market-specific issue, or an economic incentive misalignment for certain trip types.'
          },
          {
            id: 'b',
            text: 'Increase cancellation penalties for drivers to discourage the behavior',
            correct: false,
            feedback: 'Increasing penalties without understanding why drivers are cancelling treats the symptom, not the cause. If drivers are cancelling because certain rides are unprofitable, penalties will push drivers off the platform entirely rather than making them accept unprofitable rides. You need to understand the driver economics before adjusting incentives.'
          },
          {
            id: 'c',
            text: 'Check if driver supply has decreased, causing remaining drivers to be more selective',
            correct: false,
            feedback: 'Supply changes would affect all ride types, not produce a concentrated pattern. Even if supply decreased, you need to know which ride types are being cancelled to understand the selection behavior. Start with segmentation to identify the pattern, then investigate the cause.'
          },
        ],
      },
      {
        type: 'data',
        title: 'Read the Data',
        prompt: 'Here is the driver cancellation rate by ride distance and time of day. What pattern do you see?',
        dataTable: {
          headers: ['Ride Distance', 'Time', 'Cancel Rate This Period', 'Cancel Rate Prior', 'Change', 'Avg Fare'],
          rows: [
            ['<3 km', 'Peak (7-10am, 5-8pm)', '31.4%', '14.2%', '+17.2pp', '$4.20'],
            ['<3 km', 'Off-peak', '18.6%', '12.8%', '+5.8pp', '$3.80'],
            ['3-8 km', 'Peak', '10.1%', '9.8%', '+0.3pp', '$9.40'],
            ['3-8 km', 'Off-peak', '8.4%', '8.1%', '+0.3pp', '$7.60'],
            ['8+ km', 'Peak', '5.2%', '5.8%', '-0.6pp', '$18.50'],
            ['8+ km', 'Off-peak', '6.1%', '6.3%', '-0.2pp', '$14.20'],
          ],
        },
        guideQuestion: 'Which combination of distance and time shows the sharpest increase? What economic factor could explain why drivers reject these specific rides?',
        modelObservation: 'The cancellation surge is overwhelmingly concentrated in short rides under 3 km during peak hours, where the rate more than doubled from 14.2% to 31.4%. Off-peak short rides also increased but less dramatically. Medium and long rides are stable regardless of time. This pattern has a clear economic explanation: during peak hours, drivers have high opportunity cost. A short ride at $4.20 takes 10-15 minutes including pickup, and during that time a driver could be matched to a longer, higher-fare ride. If dynamic pricing recently changed to make short-ride fares less attractive relative to long-ride fares during peak, drivers would rationally cancel short rides to wait for better matches.',
        keyPhrases: ['short rides', 'peak hours', '<3 km', 'opportunity cost', 'dynamic pricing', 'fare'],
      },
      {
        type: 'rca',
        title: 'Root Cause',
        prompt: 'The pricing team confirms that a new dynamic pricing algorithm was deployed 2 weeks ago. What is the root cause?',
        options: [
          {
            id: 'a',
            text: 'The new dynamic pricing algorithm increased surge multipliers for long rides during peak hours but kept short-ride pricing flat, widening the earnings gap and making short rides economically irrational for drivers to accept',
            correct: true,
            feedback: 'Correct. The old algorithm applied a uniform surge multiplier across all ride distances. The new algorithm concentrates surge pricing on rides over 5 km, where rider willingness-to-pay is higher. This was designed to increase take rate on long rides, but it created a perverse incentive: during peak hours, drivers earn $18.50 for a long ride versus $4.20 for a short ride. After accounting for pickup time, a driver completing three short rides in the time of one long ride still earns less ($12.60 vs $18.50). Rational drivers cancel short rides and reposition for long-ride requests.'
          },
          {
            id: 'b',
            text: 'A competing ride-hailing service launched a driver bonus program that pulls drivers away during peak hours',
            correct: false,
            feedback: 'If drivers were leaving for a competitor during peak hours, you would see cancellation increases across all ride distances during peak, not just short rides. Long-ride cancellations during peak are actually stable. The pattern is ride-distance specific, not time-specific, which points to an internal pricing issue rather than external competition.'
          },
          {
            id: 'c',
            text: 'Traffic congestion during peak hours has made short rides unprofitable due to increased time costs',
            correct: false,
            feedback: 'Traffic congestion affects all ride distances during peak hours, not just short rides. If congestion were the driver, medium-distance rides (3-8 km) would also show elevated cancellations during peak. Additionally, congestion patterns do not change suddenly over 2 weeks; they are seasonal and gradual. The sharp timing of the cancellation increase coincides with the pricing algorithm change, not a traffic pattern shift.'
          },
        ],
      },
      {
        type: 'sql',
        title: 'Investigate with SQL',
        schema: {
          tables: [
            {
              name: 'ride_requests',
              columns: ['request_id INT', 'rider_id INT', 'driver_id INT', 'requested_at TIMESTAMP', 'status TEXT', 'estimated_distance_km DECIMAL', 'estimated_fare DECIMAL'],
            },
            {
              name: 'ride_completions',
              columns: ['ride_id INT', 'request_id INT', 'actual_distance_km DECIMAL', 'actual_fare DECIMAL', 'duration_minutes INT', 'completed_at TIMESTAMP'],
            },
            {
              name: 'driver_cancellations',
              columns: ['cancellation_id INT', 'request_id INT', 'driver_id INT', 'cancelled_at TIMESTAMP', 'reason TEXT'],
            },
            {
              name: 'surge_pricing',
              columns: ['request_id INT', 'surge_multiplier DECIMAL', 'base_fare DECIMAL', 'final_fare DECIMAL'],
            },
          ],
        },
        task: 'Calculate cancellation rate by ride distance bucket (<3km, 3-8km, 8+km) and peak/off-peak hour, including average fare and driver earnings per hour for completed rides in each bucket.',
        correctQuery: 'WITH ride_data AS (SELECT rr.request_id, rr.estimated_distance_km, CASE WHEN rr.estimated_distance_km < 3 THEN \'under_3km\' WHEN rr.estimated_distance_km <= 8 THEN \'3-8km\' ELSE \'8km_plus\' END AS distance_bucket, CASE WHEN EXTRACT(HOUR FROM rr.requested_at) BETWEEN 7 AND 9 OR EXTRACT(HOUR FROM rr.requested_at) BETWEEN 17 AND 19 THEN \'peak\' ELSE \'off_peak\' END AS time_period, CASE WHEN dc.cancellation_id IS NOT NULL THEN 1 ELSE 0 END AS was_cancelled, rr.estimated_fare, rc.duration_minutes, rc.actual_fare FROM ride_requests rr LEFT JOIN driver_cancellations dc ON rr.request_id = dc.request_id LEFT JOIN ride_completions rc ON rr.request_id = rc.request_id WHERE rr.requested_at >= CURRENT_DATE - INTERVAL \'14 days\') SELECT distance_bucket, time_period, COUNT(*) AS total_requests, ROUND(100.0 * SUM(was_cancelled) / COUNT(*), 1) AS cancel_rate, ROUND(AVG(CASE WHEN was_cancelled = 0 THEN actual_fare END), 2) AS avg_fare, ROUND(AVG(CASE WHEN was_cancelled = 0 AND duration_minutes > 0 THEN actual_fare * 60.0 / duration_minutes END), 2) AS earnings_per_hour FROM ride_data GROUP BY distance_bucket, time_period ORDER BY distance_bucket, time_period',
        correctQueryFormatted: [
          'WITH ride_data AS (',
          '  SELECT rr.request_id, rr.estimated_distance_km,',
          '    CASE',
          '      WHEN rr.estimated_distance_km < 3 THEN \'under_3km\'',
          '      WHEN rr.estimated_distance_km <= 8 THEN \'3-8km\'',
          '      ELSE \'8km_plus\'',
          '    END AS distance_bucket,',
          '    CASE',
          '      WHEN EXTRACT(HOUR FROM rr.requested_at) BETWEEN 7 AND 9',
          '        OR EXTRACT(HOUR FROM rr.requested_at) BETWEEN 17 AND 19',
          '      THEN \'peak\' ELSE \'off_peak\'',
          '    END AS time_period,',
          '    CASE WHEN dc.cancellation_id IS NOT NULL',
          '      THEN 1 ELSE 0 END AS was_cancelled,',
          '    rr.estimated_fare,',
          '    rc.duration_minutes, rc.actual_fare',
          '  FROM ride_requests rr',
          '  LEFT JOIN driver_cancellations dc ON rr.request_id = dc.request_id',
          '  LEFT JOIN ride_completions rc ON rr.request_id = rc.request_id',
          '  WHERE rr.requested_at >= CURRENT_DATE - INTERVAL \'14 days\'',
          ')',
          'SELECT distance_bucket, time_period,',
          '  COUNT(*) AS total_requests,',
          '  ROUND(100.0 * SUM(was_cancelled) / COUNT(*), 1) AS cancel_rate,',
          '  ROUND(AVG(CASE WHEN was_cancelled = 0',
          '    THEN actual_fare END), 2) AS avg_fare,',
          '  ROUND(AVG(CASE WHEN was_cancelled = 0',
          '    AND duration_minutes > 0',
          '    THEN actual_fare * 60.0 / duration_minutes END), 2)',
          '    AS earnings_per_hour',
          'FROM ride_data',
          'GROUP BY distance_bucket, time_period',
          'ORDER BY distance_bucket, time_period',
        ],
        keyElements: ['ride_requests', 'driver_cancellations', 'EXTRACT', 'CASE', 'GROUP BY', 'LEFT JOIN'],
        expectedOutput: {
          headers: ['distance_bucket', 'time_period', 'total_requests', 'cancel_rate', 'avg_fare', 'earnings_per_hour'],
          rows: [
            ['under_3km', 'peak', '82,000', '31.4%', '$4.20', '$16.80'],
            ['under_3km', 'off_peak', '64,000', '18.6%', '$3.80', '$15.20'],
            ['3-8km', 'peak', '58,000', '10.1%', '$9.40', '$28.20'],
            ['3-8km', 'off_peak', '45,000', '8.4%', '$7.60', '$22.80'],
            ['8km_plus', 'peak', '31,000', '5.2%', '$18.50', '$37.00'],
            ['8km_plus', 'off_peak', '22,000', '6.1%', '$14.20', '$28.40'],
          ],
        },
        hints: ['Use EXTRACT(HOUR FROM ...) to classify peak vs off-peak hours', 'Create distance buckets using a CASE expression on estimated_distance_km', 'Calculate earnings per hour as fare multiplied by 60 divided by duration_minutes for completed rides'],
      },
      {
        type: 'communicate',
        title: 'Write the Brief',
        prompt: 'Write an ops brief explaining the cancellation surge and proposing a solution.',
        modelAnswer: 'The new dynamic pricing algorithm deployed 2 weeks ago concentrates surge pricing on rides over 5 km, leaving short-ride fares flat during peak hours. This creates a 2.2x earnings gap ($37/hr for long rides vs $16.80/hr for short rides during peak), making short rides economically irrational for drivers. As a result, driver cancellations for sub-3km peak rides more than doubled to 31.4%, causing an estimated 14,000 additional rider-facing cancellations per week. Recommended fix: introduce a minimum fare floor for short rides during peak hours that brings driver earnings per hour to within 30% of long-ride earnings, ensuring short rides are worth accepting without significantly increasing rider cost.',
        rubric: ['Explains the economic incentive misalignment quantitatively', 'Connects the pricing change to driver behavior', 'Proposes a targeted intervention (minimum fare floor) rather than a blanket pricing change'],
        keyPhrases: ['dynamic pricing', 'earnings gap', 'minimum fare', 'short rides', 'peak hours', '$16.80'],
      },
      {
        type: 'experiment',
        title: 'Design the Test',
        prompt: 'Design a test for the minimum fare floor on short rides during peak hours.',
        fields: [
          {
            label: 'Hypothesis',
            type: 'mcq',
            options: [
              { id: 'a', text: 'Introducing a $6.50 minimum fare for rides under 3 km during peak hours will reduce driver cancellation rate from 31% to below 15% by closing the earnings-per-hour gap, while keeping rider cost increase under $2.30 per trip', correct: true },
              { id: 'b', text: 'Removing surge pricing entirely will equalize cancellation rates across all ride distances', correct: false },
              { id: 'c', text: 'Adding a cancellation penalty of $5 per cancelled ride will reduce short-ride cancellations to below 10% without changing pricing', correct: false },
            ],
            correctAnswer: 'Option A targets the specific economic incentive while bounding the rider cost impact. Option B would destroy revenue from long rides where surge pricing works well. Option C punishes drivers for rational economic behavior, risking driver churn without addressing the underlying earnings gap.',
          },
          {
            label: 'Unit of randomization',
            type: 'mcq',
            options: [
              { id: 'a', text: 'Market-level (city) randomization, applying the minimum fare in some cities and not others to avoid within-market driver confusion', correct: true },
              { id: 'b', text: 'Driver-level randomization, showing different minimum fares to different drivers in the same city', correct: false },
              { id: 'c', text: 'Ride-level randomization, randomly applying the minimum fare to individual ride requests', correct: false },
            ],
            correctAnswer: 'Market-level prevents within-city spillover where drivers compare fares. Driver-level creates unfairness and rapid information spread among drivers in the same market. Ride-level is inconsistent and undermines driver trust in pricing transparency.',
          },
          {
            label: 'Primary metric',
            type: 'mcq',
            options: [
              { id: 'a', text: 'Driver cancellation rate for rides under 3 km during peak hours', correct: true },
              { id: 'b', text: 'Overall platform cancellation rate across all ride types', correct: false },
              { id: 'c', text: 'Total ride completions per day', correct: false },
              { id: 'd', text: 'Driver satisfaction survey score', correct: false },
            ],
            correctAnswer: 'The cancellation rate for the specific affected segment (short rides, peak hours) directly measures whether the minimum fare solves the incentive problem. Overall rate dilutes the signal. Total completions is a downstream metric. Surveys are slow and noisy.',
          },
          {
            label: 'Guardrail metrics',
            type: 'multi',
            options: [
              { id: 'a', text: 'Rider cost increase for short trips (must stay under $2.50)', correct: true },
              { id: 'b', text: 'Rider request volume for short rides (ensure higher fares do not suppress demand)', correct: true },
              { id: 'c', text: 'Driver earnings per hour across all ride types', correct: true },
              { id: 'd', text: 'Long-ride cancellation rate', correct: false },
              { id: 'e', text: 'App download rate', correct: false },
            ],
            correctAnswer: 'Rider cost, request volume, and driver earnings across ride types measure the full economic impact. Long-ride cancellations are unaffected by a short-ride minimum fare. App downloads are too upstream to be affected by ride pricing.',
          },
        ],
      },
      {
        type: 'readout',
        title: 'The Readout',
        prompt: 'The experiment ran for 4 weeks across 12 treatment cities and 12 control cities. Here are the results:',
        resultsTable: {
          headers: ['Metric', 'Control', 'Treatment', 'Lift', 'p-value'],
          rows: [
            ['Short-ride Cancel Rate (peak)', '30.8%', '12.4%', '-59.7%', '<0.001'],
            ['Avg Rider Cost (<3km peak)', '$4.20', '$6.50', '+54.8%', '<0.001'],
            ['Short-ride Request Volume', '6,800/city/day', '6,200/city/day', '-8.8%', '0.04'],
            ['Driver Earnings/Hr (short rides)', '$16.80', '$26.00', '+54.8%', '<0.001'],
            ['Rider Wait Time (<3km peak)', '6.2min', '3.8min', '-38.7%', '<0.001'],
          ],
        },
        question: 'What is your recommendation?',
        options: [
          {
            id: 'ship',
            text: 'Ship the $6.50 minimum fare floor to all markets',
            correct: false,
            feedback: 'The minimum fare dramatically reduces cancellations and wait times, but the 54.8% rider cost increase is steep. An 8.8% demand drop shows some price sensitivity. Shipping without a guardrail on rider cost increase risks alienating short-ride riders who are often the most price-sensitive segment. The fare floor needs a cap or graduated approach to limit the maximum cost increase per ride.'
          },
          {
            id: 'conditional-ship',
            text: 'Ship with a graduated fare floor: $5.50 base minimum, rising to $6.50 only when cancellation rates exceed 20% in a market, with a hard cap at $7.00 to protect riders',
            correct: true,
            feedback: 'Correct. The minimum fare floor works powerfully, but the rider cost impact needs management. A graduated approach starts with a smaller floor ($5.50, a $1.30 increase vs $2.30) that still closes most of the earnings gap, and dynamically raises it only in markets where cancellations remain high. The $7.00 hard cap protects riders from runaway pricing. This captures the majority of the cancellation reduction while limiting the demand suppression effect. The 38.7% wait time improvement is a strong rider benefit that partially offsets the cost increase.'
          },
          {
            id: 'no-ship',
            text: 'Do not ship because the rider cost increase is too high',
            correct: false,
            feedback: 'The status quo is not acceptable: 31% cancellation rates and 6.2-minute wait times are destroying the rider experience for short trips. The question is not whether to introduce a fare floor, but how to calibrate it. A graduated approach captures the benefits while managing the cost increase. Refusing to ship preserves a broken equilibrium where drivers rationally avoid short rides and riders suffer repeated cancellations.'
          },
        ],
        debrief: 'This case exposes the analyst to two-sided marketplace dynamics where optimizing for one side (rider take rate via distance-based surge) can catastrophically harm the other side (driver willingness to accept short rides). The key insight is that driver cancellations are a rational economic response to incentive misalignment, not a behavioral problem to be penalized. The experiment confirmed that a minimum fare floor solves the cancellation problem, but the ship decision requires balancing the economic fix against rider price sensitivity. The graduated approach is the correct resolution because it is adaptive: markets with mild cancellation problems get a gentle floor, and markets with severe problems get a stronger one. This mirrors real ride-hailing operations where pricing must balance driver economics, rider affordability, and platform margin simultaneously, and one-size-fits-all solutions rarely work across heterogeneous markets.',
      },
    ],
  },

  {
    id: 'fl10',
    title: 'Patient No-Show Rate Increase',
    domain: 'Healthcare / Telehealth',
    difficulty: 'staff',
    isFree: false,
    guestPreview: false,
    phases: [
      {
        type: 'alert',
        title: 'The Alert',
        metricName: 'Telehealth No-Show Rate',
        metricValue: '22.1%',
        metricChange: '+83% (was 12.1%)',
        prompt: 'The telehealth no-show rate has increased from 12.1% to 22.1% over the past month. Providers are reporting idle appointment slots, and the scheduling team is concerned about revenue impact. What is your first move?',
        options: [
          {
            id: 'a',
            text: 'Segment no-show rate by booking lead time, patient type (new vs returning), and appointment type to isolate the affected cohort',
            correct: true,
            feedback: 'Correct. No-show rates vary dramatically by patient and booking characteristics. Segmenting by lead time (how far in advance the appointment was booked), patient type (new patients are typically higher no-show risk), and appointment type reveals whether the increase is broad or concentrated. This immediately tells you whether the cause is a behavioral shift, a process change, or a system-level issue.'
          },
          {
            id: 'b',
            text: 'Implement a no-show fee to discourage missed appointments',
            correct: false,
            feedback: 'No-show fees are a policy lever, not a diagnostic step. Implementing a fee without understanding why no-shows increased could penalize patients who missed appointments for reasons outside their control (like not receiving reminders). Additionally, no-show fees in healthcare raise access-to-care concerns and may disproportionately affect vulnerable populations. Diagnose first.'
          },
          {
            id: 'c',
            text: 'Check if provider availability decreased, causing longer wait times that lead to no-shows',
            correct: false,
            feedback: 'Provider availability changes would affect booking wait times and potentially lead to more next-day appointments, but this is a specific hypothesis that should follow segmentation. If the no-show increase is concentrated in a specific patient type or booking pattern, provider availability is likely not the primary factor. Start with segmentation to direct your investigation.'
          },
        ],
      },
      {
        type: 'data',
        title: 'Read the Data',
        prompt: 'Here is the no-show rate breakdown by booking lead time and patient type. What pattern emerges?',
        dataTable: {
          headers: ['Booking Lead Time', 'Patient Type', 'No-Show Rate This Month', 'No-Show Rate Prior Month', 'Change', 'Volume'],
          rows: [
            ['Same day', 'Returning', '8.2%', '7.8%', '+0.4pp', '3,200'],
            ['Same day', 'New', '12.4%', '11.9%', '+0.5pp', '1,800'],
            ['Next day', 'Returning', '18.1%', '10.2%', '+7.9pp', '4,100'],
            ['Next day', 'New', '38.6%', '14.8%', '+23.8pp', '5,400'],
            ['2-3 days out', 'Returning', '14.2%', '12.1%', '+2.1pp', '3,600'],
            ['2-3 days out', 'New', '22.8%', '15.4%', '+7.4pp', '2,900'],
            ['4+ days out', 'Returning', '11.8%', '11.2%', '+0.6pp', '2,400'],
            ['4+ days out', 'New', '16.1%', '14.5%', '+1.6pp', '1,600'],
          ],
        },
        guideQuestion: 'Which combination of lead time and patient type shows the sharpest increase? What system change could explain this pattern?',
        modelObservation: 'The no-show spike is dramatically concentrated in next-day bookings, especially for new patients (38.6% no-show, up 23.8 percentage points). Next-day returning patients also increased significantly (+7.9 pp). Same-day and 4+ day bookings are nearly unchanged. This pattern points to a reminder notification problem: same-day patients do not need reminders because the appointment is imminent, and patients booking 4+ days out likely received reminders during the original timeline. Next-day patients are the most dependent on day-of reminders. New patients are more affected because they lack established habits with the platform. The operations log should show a change in notification timing or delivery.',
        keyPhrases: ['next-day', 'new patient', 'reminder', 'notification', 'booking lead time'],
      },
      {
        type: 'rca',
        title: 'Root Cause',
        prompt: 'The notification team confirms that reminder timing was changed 4 weeks ago. What is the root cause?',
        options: [
          {
            id: 'a',
            text: 'Reminder notifications were changed from 2 hours before the appointment to 24 hours before, causing next-day patients to receive reminders too early and forget by the time of their appointment',
            correct: true,
            feedback: 'Correct. The reminder timing change was intended to give patients more time to prepare, but it backfired for next-day appointments. A patient who books for tomorrow at 10am receives their reminder at 10am today, a full 24 hours before the appointment. By the next morning, the reminder is buried under other notifications and forgotten. The 2-hour reminder worked because it arrived when the patient was actively thinking about their upcoming schedule. New patients are hit hardest because they have no muscle memory or calendar habit for telehealth appointments and rely entirely on the platform reminder.'
          },
          {
            id: 'b',
            text: 'A telehealth platform competitor launched a free consultation offer, pulling patients away from booked appointments',
            correct: false,
            feedback: 'Competitive pressure would affect all booking lead times and patient types, not specifically next-day bookings. Same-day bookings (which represent the most immediate intent) are stable, and 4+ day bookings are also stable. The concentration in next-day bookings with a specific patient type pattern points to an internal notification issue, not external competition.'
          },
          {
            id: 'c',
            text: 'An increase in appointment availability reduced the perceived cost of missing an appointment, lowering patient commitment',
            correct: false,
            feedback: 'If abundant availability reduced commitment, you would expect the effect across all lead times and patient types. Instead, the spike is isolated to next-day bookings. Additionally, returning patients (who would be most aware of availability) showed a smaller increase than new patients (who would not know how available appointments typically are). The pattern does not fit an availability-driven explanation.'
          },
        ],
      },
      {
        type: 'sql',
        title: 'Investigate with SQL',
        schema: {
          tables: [
            {
              name: 'appointments',
              columns: ['appointment_id INT', 'patient_id INT', 'provider_id INT', 'scheduled_at TIMESTAMP', 'booked_at TIMESTAMP', 'status TEXT', 'appointment_type TEXT'],
            },
            {
              name: 'patients',
              columns: ['patient_id INT', 'first_appointment_date DATE', 'total_visits INT', 'insurance_type TEXT'],
            },
            {
              name: 'reminders',
              columns: ['reminder_id INT', 'appointment_id INT', 'sent_at TIMESTAMP', 'channel TEXT', 'opened BOOLEAN'],
            },
          ],
        },
        task: 'Calculate no-show rate by booking lead time bucket (same-day, next-day, 2-3 days, 4+ days) and patient type (new vs returning), including reminder open rate for each segment.',
        correctQuery: 'WITH appointment_data AS (SELECT a.appointment_id, a.patient_id, a.status, CASE WHEN DATE(a.scheduled_at) = DATE(a.booked_at) THEN \'same_day\' WHEN DATE(a.scheduled_at) = DATE(a.booked_at) + INTERVAL \'1 day\' THEN \'next_day\' WHEN DATE(a.scheduled_at) <= DATE(a.booked_at) + INTERVAL \'3 days\' THEN \'2-3_days\' ELSE \'4_plus_days\' END AS lead_time, CASE WHEN p.total_visits <= 1 THEN \'new\' ELSE \'returning\' END AS patient_type FROM appointments a JOIN patients p ON a.patient_id = p.patient_id WHERE a.scheduled_at >= CURRENT_DATE - INTERVAL \'30 days\'), reminder_data AS (SELECT r.appointment_id, MAX(CASE WHEN r.opened = TRUE THEN 1 ELSE 0 END) AS reminder_opened FROM reminders r WHERE r.sent_at >= CURRENT_DATE - INTERVAL \'30 days\' GROUP BY r.appointment_id) SELECT ad.lead_time, ad.patient_type, COUNT(*) AS total_appointments, SUM(CASE WHEN ad.status = \'no_show\' THEN 1 ELSE 0 END) AS no_shows, ROUND(100.0 * SUM(CASE WHEN ad.status = \'no_show\' THEN 1 ELSE 0 END) / COUNT(*), 1) AS no_show_rate, ROUND(100.0 * SUM(COALESCE(rd.reminder_opened, 0)) / COUNT(*), 1) AS reminder_open_rate FROM appointment_data ad LEFT JOIN reminder_data rd ON ad.appointment_id = rd.appointment_id GROUP BY ad.lead_time, ad.patient_type ORDER BY ad.lead_time, ad.patient_type',
        correctQueryFormatted: [
          'WITH appointment_data AS (',
          '  SELECT a.appointment_id, a.patient_id, a.status,',
          '    CASE',
          '      WHEN DATE(a.scheduled_at) = DATE(a.booked_at) THEN \'same_day\'',
          '      WHEN DATE(a.scheduled_at) = DATE(a.booked_at) + INTERVAL \'1 day\'',
          '        THEN \'next_day\'',
          '      WHEN DATE(a.scheduled_at) <= DATE(a.booked_at) + INTERVAL \'3 days\'',
          '        THEN \'2-3_days\'',
          '      ELSE \'4_plus_days\'',
          '    END AS lead_time,',
          '    CASE WHEN p.total_visits <= 1 THEN \'new\'',
          '      ELSE \'returning\' END AS patient_type',
          '  FROM appointments a',
          '  JOIN patients p ON a.patient_id = p.patient_id',
          '  WHERE a.scheduled_at >= CURRENT_DATE - INTERVAL \'30 days\'',
          '),',
          'reminder_data AS (',
          '  SELECT r.appointment_id,',
          '    MAX(CASE WHEN r.opened = TRUE THEN 1 ELSE 0 END)',
          '      AS reminder_opened',
          '  FROM reminders r',
          '  WHERE r.sent_at >= CURRENT_DATE - INTERVAL \'30 days\'',
          '  GROUP BY r.appointment_id',
          ')',
          'SELECT ad.lead_time, ad.patient_type,',
          '  COUNT(*) AS total_appointments,',
          '  SUM(CASE WHEN ad.status = \'no_show\' THEN 1 ELSE 0 END) AS no_shows,',
          '  ROUND(100.0 * SUM(CASE WHEN ad.status = \'no_show\'',
          '    THEN 1 ELSE 0 END) / COUNT(*), 1) AS no_show_rate,',
          '  ROUND(100.0 * SUM(COALESCE(rd.reminder_opened, 0))',
          '    / COUNT(*), 1) AS reminder_open_rate',
          'FROM appointment_data ad',
          'LEFT JOIN reminder_data rd ON ad.appointment_id = rd.appointment_id',
          'GROUP BY ad.lead_time, ad.patient_type',
          'ORDER BY ad.lead_time, ad.patient_type',
        ],
        keyElements: ['appointments', 'reminders', 'no_show', 'CASE', 'GROUP BY', 'INTERVAL'],
        expectedOutput: {
          headers: ['lead_time', 'patient_type', 'total_appointments', 'no_shows', 'no_show_rate', 'reminder_open_rate'],
          rows: [
            ['same_day', 'new', '1,800', '223', '12.4%', '82.1%'],
            ['same_day', 'returning', '3,200', '262', '8.2%', '85.4%'],
            ['next_day', 'new', '5,400', '2,084', '38.6%', '24.3%'],
            ['next_day', 'returning', '4,100', '742', '18.1%', '31.8%'],
            ['2-3_days', 'new', '2,900', '661', '22.8%', '41.2%'],
            ['2-3_days', 'returning', '3,600', '511', '14.2%', '52.6%'],
            ['4_plus_days', 'new', '1,600', '258', '16.1%', '58.4%'],
            ['4_plus_days', 'returning', '2,400', '283', '11.8%', '62.1%'],
          ],
        },
        hints: ['Calculate booking lead time by comparing scheduled_at and booked_at dates', 'Classify patients as new or returning based on total_visits from the patients table', 'Join with reminders to calculate the open rate and correlate it with no-show behavior'],
      },
      {
        type: 'communicate',
        title: 'Write the Brief',
        prompt: 'Write a brief for the clinical operations team explaining the no-show spike and its root cause.',
        modelAnswer: 'The reminder notification timing change from 2 hours before to 24 hours before appointments is driving a near-doubling of no-show rates, concentrated in next-day bookings. New patients booking for the next day now have a 38.6% no-show rate (up from 14.8%), with reminder open rates dropping from 78% to 24.3% because the 24-hour reminder is buried under overnight notifications. This has created approximately 2,800 additional no-shows per month, costing an estimated $420K in lost provider revenue and reducing access for patients who could have filled those slots. Recommended fix: implement a dual reminder strategy sending both a 24-hour heads-up and a 2-hour actionable reminder, which preserves the advance notice benefit while restoring the day-of prompt that drives attendance.',
        rubric: ['Explains the timing mechanism clearly with before/after comparison', 'Quantifies both the clinical impact (no-shows) and financial impact (revenue)', 'Proposes a dual-reminder solution rather than a simple revert', 'Acknowledges the access-to-care dimension of unused appointment slots'],
        keyPhrases: ['reminder timing', '24 hours', '2 hours', 'next-day', 'new patient', 'dual reminder'],
      },
      {
        type: 'experiment',
        title: 'Design the Test',
        prompt: 'Design a test for the dual reminder strategy.',
        fields: [
          {
            label: 'Hypothesis',
            type: 'mcq',
            options: [
              { id: 'a', text: 'Sending both a 24-hour advance reminder and a 2-hour pre-appointment reminder will reduce next-day no-show rates from 38.6% to below 16% by restoring the day-of prompt while keeping the advance planning benefit, without increasing notification fatigue or opt-out rates', correct: true },
              { id: 'b', text: 'Simply reverting to the 2-hour-only reminder will fully solve the no-show problem and the 24-hour reminder adds no value', correct: false },
              { id: 'c', text: 'Sending 4 reminders at 24hr, 12hr, 2hr, and 30min before will minimize no-shows to below 5% for all patient types', correct: false },
            ],
            correctAnswer: 'Option A correctly combines both timing approaches and sets a realistic target. Option B may work but discards potential value from advance notice. Option C risks notification fatigue and opt-outs, especially for a healthcare platform where trust in communication is critical.',
          },
          {
            label: 'Unit of randomization',
            type: 'mcq',
            options: [
              { id: 'a', text: 'Patient-level randomization, with each patient consistently receiving either the current 24hr-only or the dual 24hr+2hr reminder for all their appointments', correct: true },
              { id: 'b', text: 'Appointment-level randomization, varying the reminder strategy for each individual appointment', correct: false },
              { id: 'c', text: 'Provider-level randomization, assigning each provider\'s patients to one reminder strategy', correct: false },
            ],
            correctAnswer: 'Patient-level ensures consistent experience and clean measurement. Appointment-level creates inconsistency that confuses patients. Provider-level conflates provider effects with reminder effects, since different providers may have different patient populations and baseline no-show rates.',
          },
          {
            label: 'Primary metric',
            type: 'mcq',
            options: [
              { id: 'a', text: 'No-show rate for next-day bookings, segmented by new vs returning patients', correct: true },
              { id: 'b', text: 'Overall no-show rate across all booking lead times', correct: false },
              { id: 'c', text: 'Reminder open rate', correct: false },
              { id: 'd', text: 'Patient satisfaction with the notification experience', correct: false },
            ],
            correctAnswer: 'No-show rate for next-day bookings directly measures the outcome in the most affected segment. Overall rate dilutes the signal with same-day and 4+ day bookings that are unaffected. Reminder open rate is an input metric. Patient satisfaction is a secondary outcome that does not measure attendance.',
          },
          {
            label: 'Guardrail metrics',
            type: 'multi',
            options: [
              { id: 'a', text: 'Notification opt-out rate (ensure dual reminders do not cause patients to disable all notifications)', correct: true },
              { id: 'b', text: 'Patient complaint rate about excessive notifications', correct: true },
              { id: 'c', text: 'Same-day booking no-show rate (ensure the extra reminder does not backfire for imminent appointments)', correct: true },
              { id: 'd', text: 'Provider schedule utilization rate', correct: false },
              { id: 'e', text: 'Insurance claim processing time', correct: false },
            ],
            correctAnswer: 'Opt-out rate, complaint rate, and same-day no-show rate directly measure whether the dual reminder creates negative side effects. Provider utilization is a downstream outcome, not a guardrail. Insurance processing time is unrelated to patient notification.',
          },
        ],
      },
      {
        type: 'readout',
        title: 'The Readout',
        prompt: 'The experiment ran for 6 weeks. Here are the results:',
        resultsTable: {
          headers: ['Metric', 'Control', 'Treatment', 'Lift', 'p-value'],
          rows: [
            ['No-show Rate (next-day, new)', '37.8%', '15.2%', '-59.8%', '<0.001'],
            ['No-show Rate (next-day, returning)', '17.4%', '9.8%', '-43.7%', '<0.001'],
            ['Reminder Open Rate (2hr)', 'N/A', '76.4%', 'N/A', 'N/A'],
            ['Notification Opt-out Rate', '2.1%', '2.4%', '+14.3%', '0.31'],
            ['Patient Complaint Rate', '0.8%', '0.9%', '+12.5%', '0.58'],
            ['Provider Slot Utilization', '72.3%', '84.1%', '+16.3%', '<0.001'],
          ],
        },
        question: 'What is your recommendation?',
        options: [
          {
            id: 'ship',
            text: 'Ship dual reminders to 100% of patients',
            correct: true,
            feedback: 'Correct. The dual reminder strategy dramatically reduces no-show rates for the most affected segment (next-day new patients down from 37.8% to 15.2%) while all guardrail metrics are clean. The opt-out rate increase is not statistically significant, and complaint rates are negligible. The 2-hour reminder achieves a 76.4% open rate, confirming it arrives at a time when patients are actively checking their schedule. Provider slot utilization improved 16.3%, directly translating to recovered revenue and better access for patients. There is no reason to delay shipping.'
          },
          {
            id: 'no-ship',
            text: 'Do not ship because adding more notifications risks long-term opt-out increases',
            correct: false,
            feedback: 'The opt-out rate increase is 0.3 percentage points and not statistically significant. Withholding a proven intervention that recovers 2,800 appointments per month to avoid a speculative long-term opt-out risk is not a defensible tradeoff. If opt-outs become a concern at scale, the 24-hour reminder can be made optional while keeping the 2-hour reminder mandatory.'
          },
          {
            id: 'investigate',
            text: 'Run a three-arm test adding a 2hr-only group to determine if the 24hr reminder adds incremental value',
            correct: false,
            feedback: 'While understanding the marginal contribution of each reminder is intellectually interesting, it should not block shipping the proven dual-reminder strategy. The current test shows clear, significant results with no guardrail violations. The three-arm test can be run as a follow-up optimization after the dual reminder is live and recovering lost appointments. Every week of delay costs approximately 700 preventable no-shows.'
          },
        ],
        debrief: 'This case operates at the staff level because it requires the analyst to navigate healthcare-specific constraints: patient access implications, notification sensitivity, and the ethical dimension of no-show penalties. The key insight is that reminder timing is not a simple preference but a behavioral architecture decision. The 24-hour reminder was designed with good intentions (give patients time to prepare) but failed because it did not account for the notification decay curve: a reminder received at 10am today is effectively invisible by 10am tomorrow, buried under 50+ notifications. The 2-hour reminder works because it arrives during the patient\'s active scheduling window. The dual approach captures both benefits: advance planning and day-of activation. The broader product lesson is that notification timing should be designed around the user\'s decision moment, not the business\'s preferred communication window. The staff-level judgment call is recognizing that a clean ship is the right move despite the inherent caution that healthcare products demand: the data is unambiguous, guardrails are clean, and every day without dual reminders costs patients access to care they booked and intended to receive.',
      },
    ],
  },
];

export const fullLoopCasesById = Object.fromEntries(
  fullLoopCases.map(c => [c.id, c])
);
