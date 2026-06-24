// Experimentation Systems Lab — Scenario Data Pack
// V1 — 8 Scenarios
// Status: REVIEW DRAFT — do not build UI until scenarios are approved
//
// ─────────────────────────────────────────────
// SCHEMA V2 FIELDS (for 50-scenario scaling)
// Add these to all scenarios in V1.5 pass:
//
//   scenarioFamily: string  — one of 15 scenario families (e.g. "metric_conflict", "srm", "hte_subgroup")
//   tags: string[]          — searchable labels (e.g. ["subgroup analysis", "post-hoc", "Bonferroni"])
//   conceptTags: string[]   — concept filter tags (e.g. ["multiple comparisons", "pre-specification"])
//   nextTestIdeas: string[] — 1-2 concrete follow-up experiment ideas
//   stakeholderSummary: string — 2-3 sentence non-technical summary for PMs / leadership
//
// Examples populated on s01 and s05. Others to be filled in V1.5.
// ─────────────────────────────────────────────

export const scenarios = [

  // ─────────────────────────────────────────────
  // SCENARIO 01 — The Checkout Trap (FREE)
  // Theme: Metric Conflict
  // ─────────────────────────────────────────────
  {
    id: "s01-checkout-trap",
    title: "The Checkout Trap",
    subtitle: "Conversion is up. Revenue math is down. Everyone wants to ship.",
    isFree: true,

    guestPreview: true,
    industry: "ecommerce",
    difficulty: "analyst",
    theme: "metric_conflict",

    context: {
      company: "Crestline Home",
      product: "Direct-to-consumer e-commerce storefront (premium home goods, ~$55M ARR)",
      team: "Growth & Conversion team",
      background: 'Crestline\'s checkout flow has had the same upsell widget for three years — a "complete your look" carousel that fires after the user adds an item to cart. The design team has always thought it\'s friction. The merchandising team has always thought it drives revenue.\n\nSix weeks ago, the Growth team finally got engineering cycles to test removing it. The hypothesis: removing the upsell widget reduces friction, increases checkout completion, and the lost upsell revenue is more than offset by the conversion lift.\n\nThe experiment ran for 14 days on 100% of checkout traffic (50/50 split). SRM check came back clean. Today is the readout.',
      businessPressure: 'Q4 starts in 18 days. Head of Growth already drafted a ship announcement and shared it in the #growth Slack channel before the readout. The VP of E-commerce is in today\'s readout meeting and has made clear she wants a decision today. The engineering PR has been open for 6 weeks and the team wants to merge it.'
    },

    hypothesis: "Removing the upsell widget from the checkout page will reduce friction, increase checkout conversion rate, and result in net-positive revenue impact.",

    experimentDesign: {
      type: "a/b",
      allocation: "50/50",
      runtime: "14 days",
      targetPopulation: "All users who reached the checkout page",
      primaryMetric: "Checkout conversion rate",
      guardrailMetrics: ["Revenue per session", "7-day refund rate"],
      sampleSizeContext: "~42,000 users per arm over 14 days. Powered to detect a 1.5% relative lift on conversion at 80% power."
    },

    metricReadout: [
      {
        metric: "Checkout conversion rate",
        type: "primary",
        direction: "up",
        delta: "+2.3%",
        pValue: 0.028,
        confidenceInterval: "[+0.3%, +4.3%]",
        significant: true,
        note: "Statistically significant. This is the headline number the team is celebrating."
      },
      {
        metric: "Cart abandonment rate",
        type: "secondary",
        direction: "down",
        delta: "-3.1%",
        pValue: 0.031,
        confidenceInterval: "[-5.9%, -0.3%]",
        significant: true,
        note: "Consistent with the conversion lift. Less abandonment at checkout step."
      },
      {
        metric: "Median time to purchase",
        type: "secondary",
        direction: "down",
        delta: "-22 seconds",
        pValue: 0.004,
        confidenceInterval: "[-36s, -8s]",
        significant: true,
        note: "Users are moving through checkout faster without the widget."
      },
      {
        metric: "Revenue per session",
        type: "guardrail",
        direction: "down",
        delta: "-2.8%",
        pValue: 0.041,
        confidenceInterval: "[-5.5%, -0.1%]",
        significant: true,
        note: "GUARDRAIL BREACH. Revenue per session is down — the upsell was contributing more than the team assumed."
      },
      {
        metric: "Average order value",
        type: "secondary",
        direction: "down",
        delta: "-4.1%",
        pValue: 0.019,
        confidenceInterval: "[-7.5%, -0.7%]",
        significant: true,
        note: "AOV dropped significantly. More orders, but each order is worth less."
      },
      {
        metric: "7-day refund rate",
        type: "guardrail",
        direction: "up",
        delta: "+11.2%",
        pValue: 0.038,
        confidenceInterval: "[+0.6%, +21.8%]",
        significant: true,
        note: "GUARDRAIL BREACH. Refund rate jumped. Wide CI — effect is noisy but real. The most alarming number in this readout."
      }
    ],

    warningFlags: [
      {
        id: "wf-revenue-negative",
        label: "Revenue math is negative",
        description: "+2.3% conversion with -4.1% AOV means net revenue per 100 sessions goes down, not up. The headline metric looks good; the business outcome does not.",
        severity: "critical"
      },
      {
        id: "wf-refund-spike",
        label: "Refund spike unexplained",
        description: "An 11.2% increase in 7-day refunds is a significant signal. It may mean that the upsell widget — despite being 'friction' — was helping users buy the right product the first time. Or the cart is now being completed more impulsively.",
        severity: "critical"
      },
      {
        id: "wf-guardrail-breach",
        label: "Both guardrails breached",
        description: "Revenue per session and refund rate were declared guardrails. Both are breached. Guardrail breaches are not negotiable without explicit re-agreement from stakeholders on risk tolerance.",
        severity: "critical"
      },
      {
        id: "wf-refund-window",
        label: "7-day refund window may be too short",
        description: "The experiment ran for 14 days and uses a 7-day refund lookback. The full refund curve may not be visible yet — especially for high-value items with longer decision windows.",
        severity: "warning"
      }
    ],

    decisions: [
      {
        id: "ship",
        label: "Ship it",
        description: "Conversion is up, the result is significant, and Q4 is 18 days away. Ship the widget removal.",
        score: "junior_miss",
        feedback: "Conversion is up, but the revenue math is negative and both guardrails are breached. Shipping here means accepting a known revenue loss and an unexplained refund spike before Q4 — exactly when unit economics matter most. The p<0.05 on conversion doesn't mean the business outcome is positive. It means the conversion effect is unlikely to be noise. The business outcome is clearly negative."
      },
      {
        id: "rollback",
        label: "Roll back",
        description: "The guardrails are breached and the revenue math is negative. Do not ship. Restore the original checkout.",
        score: "analyst_ready",
        feedback: "This is the right call given the data. Both guardrails are breached, revenue per session is down, and the refund spike is unexplained. Rolling back protects the business. The one thing you'd add at a senior level: roll back *and* investigate the refund spike. Understanding *why* refunds went up is a valuable finding — it may tell you something about purchase intent or product-market fit that improves the next iteration."
      },
      {
        id: "extend",
        label: "Extend the test",
        description: "Run the experiment for another 2 weeks to get more certainty on the refund and revenue signals.",
        score: "junior_miss",
        feedback: "More data won't change the math. Revenue per session is already significant at p=0.041. The AOV decline is significant at p=0.019. The refund spike is significant at p=0.038. These aren't noisy signals that need more time — they're real effects that are pointing clearly in the wrong direction. Extending to get 'more certainty' on an already-negative result just delays the decision."
      },
      {
        id: "investigate-refunds",
        label: "Roll back and investigate the refund spike before deciding",
        description: "The refund increase is the most alarming number. Roll back, but make understanding the refund cause the priority before any redesign.",
        score: "senior_ready",
        feedback: "This is the best call. You're not just making the right decision (roll back) — you're identifying the right next question. A +11.2% refund lift is a signal that something is different about the purchase quality in the treatment group. Was the upsell widget helping users buy the right product? Were treatment users purchasing more impulsively? Was the refund window too short to see the full effect? Answering that shapes what the next experiment should test — and possibly surfaces a product quality issue that was already there, just not visible."
      },
      {
        id: "segment-rollout",
        label: "Ship to high-AOV users only",
        description: "Segment the rollout: remove the widget only for users historically likely to complete checkout without upsell assistance.",
        score: "analyst_ready",
        feedback: "This is a reasonable mitigation instinct, but it doesn't answer the refund question. If high-AOV users also show elevated refunds, you've shipped a guardrail breach to your most valuable segment. Before any partial rollout, the refund spike needs to be understood. That said, the segmentation logic here is sound — if the upsell widget is only relevant for hesitant or lower-intent users, removing it for confident purchasers is defensible."
      },
      {
        id: "redesign",
        label: "Redesign: keep widget but test a less intrusive version",
        description: "The original hypothesis (friction → bad) may have been too simple. Test a redesigned widget that's less disruptive but still surfaces upsell options.",
        score: "senior_ready",
        feedback: "Good instinct, and probably the right long-term direction. The data suggests the upsell widget was contributing real value (both to AOV and, possibly, to purchase quality / lower refunds) but also creating real friction (lower conversion, longer time-to-purchase). The right answer may not be 'remove it or keep it' — it's 'redesign it.' This decision shows you're reading the data as a product signal, not just a stat."
      }
    ],

    idealDecision: "investigate-refunds",
    secondBestDecision: "rollback",

    juniorMistake: "Ships because checkout conversion is up and p<0.05. Treats the primary metric result as the full story, ignores the revenue math, and dismisses the guardrail breaches as 'things to monitor post-ship.' Often anchored by the business pressure: 'Q4 is coming and we finally got engineering cycles for this.'",

    seniorFlags: [
      "The refund spike is the lead story, not the conversion lift. A +11.2% refund increase on a 14-day experiment using a 7-day refund window means you may not have seen the full refund curve yet — especially for higher-ticket items.",
      "Revenue math: +2.3% conversion * -4.1% AOV = net negative revenue per 100 sessions, even before the refund cost. This is checkable arithmetic, not a judgment call.",
      "Both guardrails were declared upfront for a reason. Breaching both of them is not a 'complicated tradeoff' — it's a clear signal that the hypothesis was wrong."
    ],

    staffFlags: [
      "Would have questioned whether 'checkout conversion rate' is the right primary metric when the business goal is revenue. A more honest primary metric would be 'revenue per checkout session' — which would have made the negative result immediately visible without needing to inspect guardrails.",
      "Would have flagged the 7-day refund window as potentially underpowered for this product category before the experiment launched."
    ],

    debrief: 'Okay, let\'s be honest about what happened here.\n\nThe conversion lift is real. Removing friction from checkout does make more people complete the purchase. That part worked exactly as hypothesized. But the team made a classic mistake: they defined success as conversion rate instead of revenue per session, so the moment the primary metric went green, the instinct was \'ship it.\'\n\nThe refund spike is what I can\'t get past. +11.2% in 7 days. That\'s not noise — it\'s a signal that the quality of purchases in the treatment group is different. My read: the upsell widget, as annoying as it is, was doing something useful. It was slowing users down at a moment when they were considering their purchase. When you remove it, some of those users complete the checkout more impulsively — and then return the item.\n\nSo the real question isn\'t \'did we reduce friction?\' The answer is yes. The real question is \'was that friction valuable?\' And the refund data says: for some of it, yes.\n\nThe right call here is roll back and investigate. Not extend, not ship-with-monitoring, not segment-and-hope. Roll back and actually understand why refunds went up before you touch this flow again. That investigation will probably tell you more about your customers\' purchase psychology than six months of iteration would.\n\nOne more thing: both guardrails were breached. When you declare guardrails and they breach, you don\'t get to negotiate them away in the readout meeting because the primary metric looked good. If the stakeholders want to re-evaluate the guardrail thresholds, that\'s a separate conversation — but it can\'t happen retroactively to justify a ship decision.',

    interviewTakeaway: "A significant primary metric result does not mean a positive business outcome — always do the revenue math and take guardrail breaches seriously as hard stops, not soft signals.",

    relatedConcepts: ["guardrail metric", "metric conflict", "revenue per session", "refund rate", "SRM", "statistical significance"],

    // V2 scaling fields (example)
    scenarioFamily: "metric_conflict",
    tags: ["guardrail breach", "revenue math", "refund analysis", "checkout", "ecommerce"],
    conceptTags: ["guardrail metric", "metric conflict", "statistical significance", "revenue per session"],
    nextTestIdeas: [
      "Test a redesigned upsell widget that is less visually intrusive but still surfaces relevant recommendations — targeting the friction without removing the upsell value.",
      "Investigate the refund spike: analyze browsing and purchase patterns for treatment users who refunded vs. those who didn't, to understand whether impulsive checkout completion is the mechanism."
    ],
    stakeholderSummary: "The checkout widget removal increased conversion but reduced revenue and triggered a significant refund spike. Both pre-declared guardrails were breached. The right call is to roll back and investigate why refunds increased before any redesign is deployed."
  },

  // ─────────────────────────────────────────────
  // SCENARIO 02 — The Ghost Assignment (FREE)
  // Theme: SRM Failure
  // ─────────────────────────────────────────────
  {
    id: "s02-ghost-assignment",
    title: "The Ghost Assignment",
    subtitle: "The results look great. The assignment ratio doesn't.",
    isFree: true,
    industry: "saas",
    difficulty: "analyst",
    theme: "srm",

    context: {
      company: "Stackflow",
      product: "B2B project management SaaS (~8,000 active accounts, Series C)",
      team: "Product / Onboarding team",
      background: 'Stackflow\'s onboarding completion rate has been a known problem for two years. New signups are assigned a static product tour — five modal popups that fire sequentially on first login. Internal data shows 61% of users close the tour before completing it. The onboarding PM has been advocating for an interactive tooltip-based tour for 18 months.\n\nAfter two quarters of prioritization battles, engineering shipped the new experience. The experiment went live 21 days ago: 50/50 split, all new signups. The primary metric is 7-day feature adoption (defined as using 3+ core features within the first week).\n\nToday is the readout. The PM sent a Slack message at 7am: "Numbers look incredible. Let\'s get this into the sprint for the merge."',
      businessPressure: 'The onboarding PM has been fighting for this for 18 months. This is visibly their project. The Head of Product is in the readout meeting and has already told the engineering team to be \'ready to move fast.\' The PR has been sitting open for three weeks.'
    },

    hypothesis: "An interactive, tooltip-based onboarding tour will increase 7-day feature adoption compared to the existing static modal tour, by guiding users to key features in context rather than interrupting their workflow.",

    experimentDesign: {
      type: "a/b",
      allocation: "50/50 (intended)",
      runtime: "21 days",
      targetPopulation: "All new signups",
      primaryMetric: "7-day feature adoption (3+ core features used within 7 days of signup)",
      guardrailMetrics: ["Support ticket rate (first 7 days)", "Trial-to-paid conversion (30-day, incomplete)"],
      sampleSizeContext: "~2,400 new signups over 21 days. Powered to detect a 5% relative lift in adoption at 80% power."
    },

    metricReadout: [
      {
        metric: "7-day feature adoption",
        type: "primary",
        direction: "up",
        delta: "+18.3%",
        pValue: 0.008,
        confidenceInterval: "[+5.1%, +31.5%]",
        significant: true,
        note: "Very strong lift. This is the metric that has the team excited."
      },
      {
        metric: "Median time to first value action",
        type: "secondary",
        direction: "down",
        delta: "-31%",
        pValue: 0.003,
        confidenceInterval: "[-47%, -15%]",
        significant: true,
        note: "Treatment users reach their first meaningful action significantly faster."
      },
      {
        metric: "Onboarding completion rate",
        type: "secondary",
        direction: "up",
        delta: "+29.4%",
        pValue: 0.001,
        confidenceInterval: "[+18.2%, +40.6%]",
        significant: true,
        note: "Users are completing the new tour at much higher rates."
      },
      {
        metric: "7-day support ticket rate",
        type: "guardrail",
        direction: "down",
        delta: "-8.2%",
        pValue: 0.041,
        confidenceInterval: "[-16.1%, -0.3%]",
        significant: true,
        note: "Fewer support tickets in the first week. Consistent with better onboarding."
      },
      {
        metric: "30-day trial-to-paid conversion",
        type: "guardrail",
        direction: "up",
        delta: "+5.1%",
        pValue: 0.19,
        confidenceInterval: "[-2.5%, +12.7%]",
        significant: false,
        note: "Not significant and incomplete — only 21 days of data in a 30-day window."
      },
      {
        metric: "SRM check (assignment ratio)",
        type: "diagnostic",
        direction: "up",
        delta: "Treatment: 62.4% / Control: 37.6% (expected 50/50)",
        pValue: 0.0001,
        confidenceInterval: null,
        significant: true,
        note: "Warning: SAMPLE RATIO MISMATCH. Assignment is significantly skewed. This invalidates the experiment."
      }
    ],

    warningFlags: [
      {
        id: "wf-srm",
        label: "SRM: 62/38 assignment split",
        description: "The experiment was configured for 50/50 but assignment landed at 62.4% treatment / 37.6% control. A chi-squared test on the assignment counts is highly significant (p=0.0001). This is not random variation — something went wrong in assignment logic.",
        severity: "critical"
      },
      {
        id: "wf-srm-bias",
        label: "SRM can cause directional bias",
        description: "SRM doesn't just add noise — it can create directional bias if the users who were incorrectly assigned to one group share a systematic characteristic (e.g., device type, account tier, sign-up source). You cannot tell which direction the bias runs without investigation.",
        severity: "critical"
      },
      {
        id: "wf-conversion-incomplete",
        label: "Primary conversion metric is incomplete",
        description: "Trial-to-paid conversion uses a 30-day window. The experiment is only 21 days old. The business outcome metric hasn't been observed yet.",
        severity: "warning"
      }
    ],

    decisions: [
      {
        id: "ship",
        label: "Ship it",
        description: "Three metrics are strongly significant and directionally consistent. The SRM may be a logging issue. The result is too strong to ignore.",
        score: "junior_miss",
        feedback: "This is the most common mistake on SRM scenarios. The reasoning sounds logical: 'the results are so strong, even if there's some SRM noise, the direction must be right.' But SRM doesn't just add noise — it can introduce systematic bias. If the extra 12% of users who landed in treatment share a characteristic (e.g., they came from a specific marketing channel, or they're on mobile, or they signed up on a specific day), the treatment group is no longer a random sample of new users. You're not measuring the effect of the onboarding tour — you're measuring the onboarding tour plus whatever is different about those users."
      },
      {
        id: "pause-investigate",
        label: "Pause and investigate the SRM before making any decision",
        description: "The assignment ratio is broken. No decision — ship or rollback — is valid until you know why.",
        score: "senior_ready",
        feedback: "This is the right call, and it's also the harder call to make in a room where the PM has been waiting 18 months and the Head of Product is present. But an SRM this large (62/38 on a 50/50 experiment) almost always has a root cause — client-side rendering that fires inconsistently, a bot or automated signup scraper inflating one arm, a logging bug, or an SDK version difference. Until you find it, the results are not trustworthy. The investigation also protects the team: if you ship and the result doesn't hold, you'll want to have caught the SRM rather than explaining why you ignored it."
      },
      {
        id: "rollback",
        label: "Roll back; the experiment is invalid",
        description: "SRM invalidates the results. Roll back, fix the assignment logic, and re-run.",
        score: "analyst_ready",
        feedback: "Correct diagnosis. The experiment is invalid and should not be shipped based on its current results. The only thing 'pause and investigate' adds over a clean rollback is understanding *why* the SRM happened before re-running — which matters because if the cause was a product behavior (e.g., a specific user segment not getting assigned correctly), it will recur in the re-run if not fixed."
      },
      {
        id: "ship-ignore-srm",
        label: "Note the SRM in the writeup, ship anyway",
        description: "Document the SRM as a known limitation and ship based on the strength of the other signals.",
        score: "junior_miss",
        feedback: "Documenting a known flaw and shipping anyway is not a risk mitigation — it's a paper trail for a bad decision. SRM is not a 'known limitation' in the same way that a short runtime or low power might be. It means the experiment's randomization was compromised. Noting it doesn't fix it."
      },
      {
        id: "rerun",
        label: "Re-run the experiment with correct assignment logic",
        description: "Discard this experiment. Fix whatever caused the SRM and run a clean 50/50 experiment.",
        score: "analyst_ready",
        feedback: "Correct — this is the right next step after investigating the SRM cause. The one missing piece: you should investigate the SRM before re-running, not just re-run and hope it doesn't happen again. If the cause was a client-side rendering issue with a specific browser, that needs to be fixed first. If it was a bot traffic problem, your assignment pipeline needs to filter that."
      },
      {
        id: "extend",
        label: "Extend the experiment to 42 days",
        description: "More data may stabilize the assignment ratio and give cleaner results.",
        score: "junior_miss",
        feedback: "SRM doesn't resolve itself with more data. The skewed assignment is a structural problem in the experiment's randomization logic — it will continue to produce biased results regardless of how long the experiment runs."
      }
    ],

    idealDecision: "pause-investigate",
    secondBestDecision: "rollback",

    juniorMistake: "Ships because the primary metric lift is +18.3% (p=0.008) and reasons that 'the effect is too strong to be explained by SRM alone.' Misunderstands SRM as a noise problem rather than a bias problem. Often anchored by social pressure in the room — the PM has been waiting 18 months, the results look amazing, and calling it invalid feels like being the person who kills good news.",

    seniorFlags: [
      "SRM at 62/38 on a 50/50 experiment is not marginal — it's a 24-percentage-point deviation. This almost certainly has a root cause beyond random variation. Most likely candidates: client-side JS rendering the treatment inconsistently, a cookie/session boundary issue causing users to be re-assigned, or a bot/scraper inflating one arm.",
      "The +18.3% adoption lift has a very wide confidence interval: [+5.1%, +31.5%]. Even if the result were trustworthy, the true effect could be closer to +5% than +18%. The SRM makes the estimate even less reliable.",
      "30-day trial-to-paid is the metric that actually matters for this business. It's incomplete and non-significant. Shipping on 7-day adoption while the conversion metric is still open is premature even without the SRM."
    ],

    staffFlags: [
      "SRM checks should be run at Day 3 and Day 7 of any experiment, not just at readout. If this SRM was present at Day 3, 18 days of bad data were collected unnecessarily.",
      "Would have included a pre-experiment SRM check in the experiment spec: verify assignment counts daily during the first 48 hours of rollout as a go/no-go gate before the experiment continues running."
    ],

    debrief: 'I\'ve been in this room. The PM who\'s been fighting for this for 18 months. The Head of Product looking expectant. The PR sitting open. And then someone points at the SRM number and the energy drains out of the meeting.\n\nHere\'s the thing though: the SRM is doing you a favor.\n\nIf you ship on this result and it doesn\'t hold — and with a 62/38 assignment split, there\'s a real chance it doesn\'t — you\'re going to spend the next six months trying to explain why the new onboarding that showed +18% in the experiment is showing +3% in production. That conversation is much harder than this one.\n\nThe SRM means you don\'t actually know what the effect of the new onboarding tour is. You know that something is different between the two groups, but you don\'t know if it\'s the onboarding tour or the systematic characteristic that caused the skewed assignment. Those are two completely different things.\n\nWhat I\'d do: investigate the SRM root cause first. In my experience, the most common causes at a B2B SaaS company are (1) a client-side rendering issue where the new tooltip JS doesn\'t fire for certain browser/session combinations and those users silently fall into the wrong arm, (2) a signup source effect where users from a specific channel are being routed differently, or (3) a bot/crawler inflating new signup counts. Once you find it, fix it, re-run clean, and you\'ll have an actual answer.\n\nThe onboarding work is good. The experiment just needs to be run correctly before you ship.',

    interviewTakeaway: "SRM invalidates an experiment's causal inference regardless of how strong the metric results look — it signals compromised randomization, not just added noise, and must be investigated before any ship decision.",

    relatedConcepts: ["SRM", "sample ratio mismatch", "randomization", "selection bias", "chi-squared test", "assignment pipeline"],

    // V2 scaling fields
    scenarioFamily: "srm",
    tags: ["SRM", "assignment bias", "onboarding", "B2B SaaS", "invalid experiment"],
    conceptTags: ["sample ratio mismatch", "randomization", "selection bias", "chi-squared test"],
    stakeholderSummary: "The onboarding experiment produced impressive-looking results, but the assignment was severely skewed — 62% of users ended up in the treatment group instead of the intended 50%. This breaks the experiment's causal logic: the treatment and control groups are no longer comparable. No ship or rollback decision is valid until we understand what went wrong in the assignment and fix it.",
    nextTestIdeas: [
      "Re-run the experiment with a daily SRM monitoring check built into the experiment pipeline — if assignment deviates by more than 2% from the intended split at 48 hours, pause automatically and investigate before accumulating more bad data.",
      "Before re-running, instrument the new onboarding flow with explicit assignment logging at the client-side render event, not just the server-side assignment event, to catch the most common SRM cause: JS rendering inconsistency across browser and session types.",
      "Design a parallel experiment focused solely on the 30-day trial-to-paid conversion metric — the business outcome metric that was still incomplete when this experiment was paused — using the fixed assignment pipeline."
    ],
    keyTakeaways: [
      "SRM at 62/38 on a 50/50 experiment is not noise — a 24-percentage-point deviation almost always has a concrete root cause such as client-side rendering inconsistency, bot traffic inflating one arm, or a cookie/session boundary that re-assigns users.",
      "SRM introduces directional bias, not just variance: if the extra users who silently landed in treatment share a systematic characteristic (device type, marketing channel, account tier), the treatment group is no longer a random sample and the measured effect is confounded.",
      "A +18.3% adoption lift with a CI of [+5.1%, +31.5%] is extremely wide — even if the experiment were clean, the true effect could be closer to +5% than +18%, and SRM makes that estimate even less trustworthy.",
      "The 30-day trial-to-paid conversion metric was incomplete (only 21 of 30 days observed) and non-significant — the metric that actually matters for a B2B SaaS business had not yet been observed when momentum for a ship decision was building.",
      "SRM checks should be run at Day 3 and Day 7, not only at readout — running a broken experiment for 18 additional days after a detectable SRM was already present wastes data and organizational attention."
    ]
  },

  // ─────────────────────────────────────────────
  // SCENARIO 03 — The Slow Tax (FREE)
  // Theme: Guardrail Breach
  // ─────────────────────────────────────────────
  {
    id: "s03-slow-tax",
    title: "The Slow Tax",
    subtitle: "Retention is up. Your slowest users are paying the performance cost.",
    isFree: true,
    industry: "consumer",
    difficulty: "analyst",
    theme: "guardrail",

    context: {
      company: "Driftline",
      product: "Consumer content app (guided meditation + sleep content, ~3.2M MAU, subscription)",
      team: "Personalization team",
      background: 'Driftline\'s content recommendation algorithm has been rule-based since launch: it surfaces the most-listened content in a user\'s chosen category. The Personalization team has spent two quarters building a collaborative filtering model that learns from listening behavior across the user base.\n\nThe experiment has been running for 18 days: 50/50 split across all logged-in users on iOS and Android. The new algorithm runs server-side but returns recommendations that require fetching more metadata per item — the implementation is heavier than the old rule-based system.\n\nRetention is the north star metric. The team declared page load time (p75) as a guardrail, set at a maximum of +200ms increase.',
      businessPressure: 'The Personalization team has been building this model for two quarters. The engineering lead on the project says the load time issue is "definitely fixable in the next sprint — we know exactly what\'s causing it." Product leadership has been presenting the retention improvement to the board as evidence that the personalization investment is paying off.'
    },

    hypothesis: "A collaborative filtering recommendation model will increase 7-day retention by surfacing more relevant content, compared to the current rule-based algorithm.",

    experimentDesign: {
      type: "a/b",
      allocation: "50/50",
      runtime: "18 days",
      targetPopulation: "All logged-in users (iOS and Android)",
      primaryMetric: "7-day retention",
      guardrailMetrics: ["p75 page load time (guardrail threshold: +200ms max increase)", "App store crash rate"],
      sampleSizeContext: "~180,000 users per arm. Well-powered for the primary metric. Load time guardrail was set conservatively given the model's known compute overhead."
    },

    metricReadout: [
      {
        metric: "7-day retention",
        type: "primary",
        direction: "up",
        delta: "+3.2%",
        pValue: 0.021,
        confidenceInterval: "[+0.5%, +5.9%]",
        significant: true,
        note: "Significant retention lift. Real effect."
      },
      {
        metric: "Daily sessions per user",
        type: "secondary",
        direction: "up",
        delta: "+4.1%",
        pValue: 0.018,
        confidenceInterval: "[+0.7%, +7.5%]",
        significant: true,
        note: "Users are returning more frequently. Consistent with the retention lift."
      },
      {
        metric: "Time in app per session",
        type: "secondary",
        direction: "up",
        delta: "+12.3%",
        pValue: 0.004,
        confidenceInterval: "[+4.0%, +20.6%]",
        significant: true,
        note: "Sessions are longer. Users are engaging more with recommended content."
      },
      {
        metric: "p75 page load time",
        type: "guardrail",
        direction: "up",
        delta: "+820ms",
        pValue: 0.0001,
        confidenceInterval: "[+690ms, +950ms]",
        significant: true,
        note: "GUARDRAIL BREACH. Threshold was +200ms. Actual impact is +820ms — 4x the guardrail. Tight CI means this is a reliable estimate."
      },
      {
        metric: "p50 page load time",
        type: "secondary",
        direction: "up",
        delta: "+210ms",
        pValue: 0.003,
        confidenceInterval: "[+75ms, +345ms]",
        significant: true,
        note: "The median user also sees a meaningful load time increase, but p75 tells the more important story."
      },
      {
        metric: "App store crash rate",
        type: "guardrail",
        direction: "up",
        delta: "+0.3%",
        pValue: 0.41,
        confidenceInterval: "[-0.4%, +1.0%]",
        significant: false,
        note: "Not significant. Crash rate is clean."
      },
      {
        metric: "Content completion rate (sessions)",
        type: "secondary",
        direction: "up",
        delta: "+5.8%",
        pValue: 0.012,
        confidenceInterval: "[+1.3%, +10.3%]",
        significant: true,
        note: "Users who start a recommended piece are more likely to finish it."
      }
    ],

    warningFlags: [
      {
        id: "wf-guardrail-4x",
        label: "Guardrail breached at 4x threshold",
        description: "The declared guardrail was +200ms on p75 load time. Actual impact is +820ms. This isn't a borderline breach — the actual impact is 4x the acceptable limit.",
        severity: "critical"
      },
      {
        id: "wf-mobile-older-devices",
        label: "Older/budget devices disproportionately affected",
        description: "The p75 measure captures the slowest 25% of users. For a consumer app with broad device distribution, this is disproportionately users on older Android devices and lower-end iPhones — often lower-income users who may already have higher churn risk.",
        severity: "warning"
      },
      {
        id: "wf-load-retention-lag",
        label: "Load time degradation may produce delayed churn",
        description: "18 days may be too short to see the full churn effect of a persistent +820ms load time. Users may tolerate the slowdown in weeks 1-2 and churn in weeks 3-4 when the novelty of better recommendations wears off.",
        severity: "warning"
      }
    ],

    decisions: [
      {
        id: "ship",
        label: "Ship it",
        description: "Retention, sessions, and time in app are all significantly positive. Users are clearly getting value. Performance can be fixed in the next sprint.",
        score: "junior_miss",
        feedback: "This is the 'ship and fix later' trap. The guardrail was declared precisely to prevent this reasoning. If performance is 'fixable in the next sprint,' then fix it first and re-test. Shipping a known guardrail breach with a promise to patch it later creates two problems: (1) 'the next sprint' has a way of becoming 'three months from now' under production pressure, and (2) you've now set a precedent that guardrails can be negotiated away when the primary metric looks good. That precedent will haunt your next experiment."
      },
      {
        id: "do-not-ship-fix-first",
        label: "Do not ship. Fix the performance regression, then re-test.",
        description: "The guardrail was set for a reason. Declare it breached. Fix the model's performance overhead, then re-run.",
        score: "senior_ready",
        feedback: "This is the right call. The guardrail exists to protect the users who would pay the most for the performance degradation — in this case, users on slower devices who are also likely among the most price-sensitive in your subscriber base. The retention win is real and worth pursuing, but not at the cost of +820ms to your slowest users. Fix the implementation, re-run, and you'll likely still see the retention lift without the performance penalty."
      },
      {
        id: "ship-modern-devices",
        label: "Ship only to users on modern devices (iPhone 12+, Android flagships)",
        description: "The performance hit is device-dependent. Limit rollout to users where load time impact is minimal.",
        score: "analyst_ready",
        feedback: "This is a reasonable engineering mitigation and shows you're thinking about the population distribution. The concern: you're now running personalization for a subset of your users, which complicates model training (you're serving a biased recommendation set to a segment of users). You're also making an implicit decision to deprioritize the experience of your lower-end device users — which may be fine, but should be explicit. This doesn't absolve you of fixing the performance issue for everyone."
      },
      {
        id: "extend-while-fixing",
        label: "Keep the experiment running while engineering fixes the load time",
        description: "Don't roll back — keep collecting data while the performance fix is developed. Ship after the fix is validated.",
        score: "staff_level",
        feedback: "This is the most operationally elegant solution if it's feasible. You preserve the experiment's randomization integrity, continue accumulating data on the retention signal, and ship only after the guardrail is resolved. The conditions: (1) the fix must be testable in the current experiment arm (not a new deployment that requires a fresh experiment), and (2) you need to be confident the fix doesn't change the recommendation quality in a way that affects the metric. If both are true, this is better than rolling back."
      },
      {
        id: "rollback-redesign",
        label: "Roll back and redesign the model to be less compute-intensive",
        description: "The current implementation is too heavy. Rearchitect the model to reduce metadata fetch overhead before re-testing.",
        score: "analyst_ready",
        feedback: "Correct call to not ship. The 'redesign' framing is right if the performance issue is architectural rather than a fixable implementation bug. Worth discussing with engineering whether this is a 2-day fix or a 2-month redesign — that changes the recommendation significantly."
      }
    ],

    idealDecision: "extend-while-fixing",
    secondBestDecision: "do-not-ship-fix-first",

    juniorMistake: "Ships with a plan to 'fix performance post-launch.' Reasons that the retention improvement is worth the tradeoff and that engineering can patch the load time issue quickly. Discounts the guardrail breach because the primary metric is strong.",

    seniorFlags: [
      "The p75 measure is the right guardrail — but the specific users who are at p75 matter. On a consumer app with broad device distribution, the slowest 25% of load times are concentrated on budget Android devices. These users may be among your most churn-prone — the ones who have the hardest time justifying a subscription renewal.",
      "18 days may not capture the full churn effect of a persistent +820ms degradation. The retention lift could compress or reverse in weeks 3-5 when the novelty of better recommendations wears off but the performance cost persists.",
      "+820ms with a CI of [+690ms, +950ms] is a tight estimate. This is not a noisy signal that more data might move — the load time impact is real and reliably measured."
    ],

    staffFlags: [
      "Would have flagged the performance overhead of the collaborative filtering implementation in the experiment design review before launch. The +820ms p75 cost could have been anticipated with a staging load test.",
      "Would have recommended a smaller holdout (10% treatment) for the first 72 hours specifically to catch guardrail breaches early before full 50/50 rollout."
    ],

    debrief: 'The data is telling you something that\'s actually useful if you read it correctly: the recommendation model works. The retention and engagement signals are real. But the implementation has a cost that\'s too high for your slowest users, and the guardrail was set exactly to catch this.\n\nHere\'s my issue with \'ship and fix later\': engineering says the fix is one sprint away, and I believe them. But after you ship, that sprint gets reprioritized. Three months later you\'re looking at slightly degraded retention numbers and nobody connects it to the +820ms load time that you shipped with. The guardrail exists to prevent that scenario.\n\nThe more interesting observation here is about your user base distribution. The p75 metric is telling you that your 75th-percentile user is experiencing 820ms of added latency. On a meditation app where the primary use case is someone in bed at night on whatever phone they have, that\'s your core use case, not an edge case. Slow performance at the moment someone is trying to relax before sleep is a genuinely bad user experience in a way that matters for retention.\n\nThe right path: if the fix is genuinely achievable, keep the experiment running while engineering patches the overhead. Don\'t roll back — preserve your randomized groups. Fix the implementation, validate that load time is back within guardrail, then ship. If the fix is more complex than one sprint, roll back, fix it properly, and re-run. Either way, the model is worth keeping — just not in this form.',

    interviewTakeaway: "Guardrail breaches require resolution before shipping, not post-ship fixes — and the 'we'll fix it later' promise is one of the most common ways technically correct short-term decisions become product quality problems.",

    relatedConcepts: ["guardrail metric", "p75 latency", "performance regression", "device distribution", "holdout rollout"],

    // V2 scaling fields
    scenarioFamily: "guardrail",
    tags: ["guardrail breach", "performance regression", "personalization", "consumer app", "p75 latency"],
    conceptTags: ["guardrail metric", "p75 latency", "performance regression", "device distribution"],
    stakeholderSummary: "The new recommendation algorithm genuinely improves retention and engagement — but it comes with an 820ms load time increase for the slowest 25% of users, which is four times our declared limit. On a consumer app, the slowest users are disproportionately on budget devices and already have higher churn risk. The algorithm is worth pursuing, but not in its current form — performance must be fixed before any rollout.",
    nextTestIdeas: [
      "Keep the experiment running and have engineering deploy a targeted performance fix within the current treatment arm — validate that p75 load time returns within the +200ms guardrail before proceeding to a ship decision, preserving randomization continuity.",
      "Run a device-stratified analysis on the retention lift: separate the treatment effect for users on budget Android devices (where the +820ms load time is concentrated) from users on high-end devices — this will show whether the retention signal is coming from users who also pay the performance cost.",
      "After fixing the load time issue, extend the experiment to 35 days to assess whether the retention benefit persists or decays as the novelty of better recommendations wears off for longer-tenure users."
    ],
    keyTakeaways: [
      "A guardrail threshold of +200ms was declared before the experiment launched; an actual impact of +820ms is not a borderline case requiring judgment — it is a clear, 4x breach that requires resolution before any ship decision.",
      "The p75 load time metric is the right guardrail for a consumer app, but the specific users at p75 matter: on a broad consumer device distribution, the slowest 25% of sessions are concentrated on older Android devices, often belonging to price-sensitive subscribers who are more likely to cancel than users on flagship hardware.",
      "18 days may be too short to see the full churn effect of a persistent +820ms degradation — users often tolerate performance slowdowns in weeks 1-2 and churn in weeks 3-5 when the novelty of better content wears off but the latency cost remains.",
      "The 'ship and fix later' promise has a predictable failure mode: after launch, the performance patch gets deprioritized by production realities, and six months later a retention degradation signal appears with no clear causal link to the unresolved load time regression.",
      "The most operationally sound path — keeping the experiment running while engineering deploys a targeted fix — preserves both the randomization integrity and the data continuity, avoiding a full restart while still honoring the guardrail."
    ]
  },

  // ─────────────────────────────────────────────
  // SCENARIO 04 — The Week-Two Drop (FREE)
  // Theme: Novelty Effect / Peeking
  // ─────────────────────────────────────────────
  {
    id: "s04-week-two-drop",
    title: "The Week-Two Drop",
    subtitle: "The CEO called it a win on Day 5. You have the Day 14 data.",
    isFree: true,
    industry: "consumer",
    difficulty: "analyst",
    theme: "novelty_peeking",

    context: {
      company: "Meridian",
      product: "Personal task management app (productivity, ~520K MAU, freemium)",
      team: "Growth / Engagement team",
      background: 'Meridian added a streak system: users who complete at least 3 tasks per day build a "streak." The streak counter is visible on the home screen. After 7 days, a streak badge unlocks. After 30 days, a streak reward (premium feature access for 2 weeks) unlocks. The system also sends a push notification at 8pm if the user hasn\'t completed 3 tasks yet that day.\n\nThe experiment launched 14 days ago: 50/50 split on all active users (users who had logged in at least once in the past 30 days).\n\nOn Day 5, the PM pulled a preliminary read and shared it with the exec team in the weekly business review. The CEO mentioned it as a "clear product win" to the board. On Day 10, you noticed the week-2 trend and flagged it internally. Today is Day 14 — the pre-planned readout.',
      businessPressure: 'The CEO has already described this as a win externally. The PM is asking you to "explain the week-2 numbers" rather than revisit the ship decision. There\'s pressure to find a framing that supports shipping. The streak feature is already being discussed as a headline for the next app store update.'
    },

    hypothesis: "A daily streak system with push notification reminders will increase daily task completion rates and 30-day retention by creating habitual usage patterns.",

    experimentDesign: {
      type: "a/b",
      allocation: "50/50",
      runtime: "14 days (pre-planned)",
      targetPopulation: "Active users (logged in within past 30 days)",
      primaryMetric: "Daily active use rate (3+ tasks completed / day)",
      guardrailMetrics: ["Push notification opt-out rate", "7-day uninstall rate"],
      sampleSizeContext: "~68,000 users per arm. Powered to detect a 3% relative lift on daily active use at 80% power."
    },

    metricReadout: [
      {
        metric: "Daily active use — Week 1 (Days 1–7)",
        type: "secondary",
        direction: "up",
        delta: "+14.2%",
        pValue: 0.009,
        confidenceInterval: "[+3.7%, +24.7%]",
        significant: true,
        note: "Strong week-1 signal. This is the number that was shared on Day 5."
      },
      {
        metric: "Daily active use — Week 2 (Days 8–14)",
        type: "secondary",
        direction: "up",
        delta: "+2.1%",
        pValue: 0.31,
        confidenceInterval: "[-2.0%, +6.2%]",
        significant: false,
        note: "Non-significant in week 2. The lift has nearly fully reverted."
      },
      {
        metric: "Daily active use — Full 14 days",
        type: "primary",
        direction: "up",
        delta: "+6.8%",
        pValue: 0.08,
        confidenceInterval: "[-0.9%, +14.5%]",
        significant: false,
        note: "Not significant over the full pre-planned window. The primary metric did not meet its threshold."
      },
      {
        metric: "14-day retention",
        type: "secondary",
        direction: "up",
        delta: "+1.2%",
        pValue: 0.38,
        confidenceInterval: "[-1.5%, +3.9%]",
        significant: false,
        note: "Not significant. No evidence of a retention benefit over 14 days."
      },
      {
        metric: "Push notification opt-out rate",
        type: "guardrail",
        direction: "up",
        delta: "+22.3%",
        pValue: 0.001,
        confidenceInterval: "[+9.1%, +35.5%]",
        significant: true,
        note: "GUARDRAIL BREACH. A significant increase in users opting out of push notifications in the treatment group."
      },
      {
        metric: "7-day uninstall rate",
        type: "guardrail",
        direction: "up",
        delta: "+1.8%",
        pValue: 0.14,
        confidenceInterval: "[-0.6%, +4.2%]",
        significant: false,
        note: "Not significant, but directionally concerning. Worth monitoring."
      }
    ],

    warningFlags: [
      {
        id: "wf-peeking",
        label: "Peeking: decision was pre-announced on Day 5",
        description: "The PM shared week-1 results (Day 5 of a 14-day experiment) with the exec team and the CEO announced it externally. This is peeking — making or signaling a decision before the experiment's pre-planned endpoint. It doesn't invalidate the data, but it creates organizational pressure to ignore the Day 14 result.",
        severity: "critical"
      },
      {
        id: "wf-novelty-pattern",
        label: "Classic novelty effect pattern",
        description: "Week 1: +14.2% (p=0.009). Week 2: +2.1% (p=0.31). This week-over-week decay pattern is textbook novelty effect — users engage with a new feature initially, then return to baseline as the novelty wears off.",
        severity: "critical"
      },
      {
        id: "wf-notification-optout",
        label: "Notification opt-out is a leading churn signal",
        description: "A +22.3% increase in notification opt-outs is a strong negative signal. Users are being annoyed by the streak notifications, not motivated by them. High opt-out rates predict future disengagement and are hard to reverse.",
        severity: "critical"
      },
      {
        id: "wf-primary-not-significant",
        label: "Pre-planned primary metric is not significant",
        description: "The experiment was designed and powered to measure 14-day daily active use. That metric is not significant (p=0.08). Reporting the week-1 sub-period result as the headline is selective reporting.",
        severity: "warning"
      }
    ],

    decisions: [
      {
        id: "ship-week1-data",
        label: "Ship it — use the week-1 data as the signal",
        description: "The week-1 engagement lift was real. Week 2 may stabilize once users form a habit. The 14-day window may not be long enough to capture habit formation.",
        score: "junior_miss",
        feedback: "This is post-hoc rationalization. The experiment was pre-planned for 14 days — not 7 days — for exactly this reason: to see beyond the initial novelty period. Using the week-1 sub-period as the primary result is selective reporting. You had a pre-planned endpoint, a pre-planned metric, and a non-significant result at that endpoint. The week-1 number is a data point within the experiment, not the experiment's conclusion."
      },
      {
        id: "rollback-null",
        label: "Call it a null result — do not ship",
        description: "The 14-day primary metric is not significant. The week-2 regression suggests novelty effect. Roll back.",
        score: "analyst_ready",
        feedback: "This is the statistically correct call. The pre-planned primary metric over the pre-planned window is not significant. Calling it a null result is honest and protects the team from shipping something that may produce long-term churn. The one thing you'd add at a senior level: the notification opt-out signal deserves a separate investigation — it suggests the streak notification cadence is creating friction, not motivation."
      },
      {
        id: "extend-28-days",
        label: "Extend to 28 days to see if habit forms",
        description: "Habit formation may take longer than 14 days. Extend the experiment to give the streak system more time to drive sustainable engagement.",
        score: "analyst_ready",
        feedback: "Defensible — habit formation research does suggest 21-28 days is a more realistic window for new behavioral patterns. The concern is the notification opt-out rate: if +22% of treatment users are already opting out of notifications, an extension may make the guardrail breach worse and provide no more information about sustainable engagement. The honest question before extending: is the feature still working if notifications are turned off? Because a significant fraction of your treatment group is about to find out."
      },
      {
        id: "rollback-redesign-notification",
        label: "Call it a null result, but redesign the notification logic before re-testing",
        description: "The core streak concept may be sound, but the 8pm notification is creating friction. Redesign the notification cadence and re-test.",
        score: "senior_ready",
        feedback: "This reads the data correctly at two levels: the primary metric is null, and the notification design is actively damaging. A +22.3% opt-out rate suggests the 8pm daily notification is more annoyance than motivation. The right move: don't ship the current design, but treat the notification opt-out finding as a product signal. A less aggressive notification strategy (weekly encouragement vs. daily pressure) might achieve the engagement goal without the friction cost."
      },
      {
        id: "ship-monitor",
        label: "Ship with 30-day monitoring — declare provisional success",
        description: "The directional signal is positive. Ship with intensive post-ship monitoring and a 30-day rollback trigger if engagement reverts.",
        score: "junior_miss",
        feedback: "Post-ship monitoring cannot recover the statistical integrity of a pre-planned experiment that returned a non-significant result. 'Declare provisional success' on a p=0.08 primary metric is not how statistics works. And the notification opt-out rate means you'd be shipping a guardrail breach with a plan to watch it get worse."
      }
    ],

    idealDecision: "rollback-redesign-notification",
    secondBestDecision: "rollback-null",

    juniorMistake: "Ships based on the week-1 data, citing 'early positive signal' and 'habit formation takes time.' Often framed as 'we already told the CEO this is a win, we can't reverse that now.' Completely ignores the notification opt-out rate because it wasn't the primary metric.",

    seniorFlags: [
      "The notification opt-out rate (+22.3%, p=0.001) is the most actionable finding in this readout, and nobody is talking about it. That's what happens when teams organize their analysis around the primary metric and treat guardrails as an afterthought.",
      "The week-1 / week-2 decay pattern is the clearest novelty effect signature in the data. A 14.2% → 2.1% drop over two weeks is not 'habit formation in progress' — it's the new feature smell wearing off.",
      "The peeking issue on Day 5 is a process failure, not just a statistical one. The PM sharing preliminary results with the CEO before the experiment ended created organizational lock-in that made the correct Day-14 decision politically harder. That's a real cost of peeking beyond the statistical one."
    ],

    staffFlags: [
      "Would have flagged 14 days as likely too short for a habit formation experiment at experiment design time. Streak mechanics research consistently shows 21-28 day minimums for measuring sustainable behavior change.",
      "Would have separated the notification mechanism from the streak visual/gamification in the experiment design — two separate variables, two separate tests. This experiment can't tell you whether the streak concept failed or the notification strategy failed."
    ],

    debrief: 'Let me be direct about what happened before I get to the data: peeking is a process failure that creates real organizational costs. When the PM shares week-1 numbers in the exec meeting before the experiment ended and the CEO announces it externally, you\'ve made it politically costly to report the actual 14-day result honestly. That\'s a genuine harm, separate from the statistical issues.\n\nNow the data.\n\nThe primary metric over the pre-planned 14-day window is p=0.08. Not significant. The week-1 / week-2 pattern — +14.2% then +2.1% — is as clean a novelty effect signature as I\'ve seen. Users engaged with the streak in week 1 because it was new. By week 2, it was furniture.\n\nBut the number I\'d be most concerned about is the notification opt-out rate: +22.3%. That\'s not a rounding error. That\'s more than one in five treatment users actively removing the streak notification from their phone. That\'s a direct signal that the 8pm "you haven\'t completed your tasks yet" push is creating resentment, not motivation. And once users opt out of notifications, they\'re much harder to re-engage.\n\nSo the data is actually telling you something useful: the streak concept might work, but this implementation is wrong. The notification cadence is too aggressive. An experiment that separates the visual streak gamification from the push notification pressure would give you a cleaner read on which part of the design is driving (or destroying) engagement.\n\nDon\'t ship this. But don\'t throw away the concept — there\'s a real signal worth chasing here, just with a more user-respecting notification design.',

    interviewTakeaway: "Pre-planned primary metrics at pre-planned endpoints are the only valid basis for a ship decision — week-over-week sub-period analysis is exploratory at best, and a +22% notification opt-out rate is a stronger product signal than the primary metric result.",

    relatedConcepts: ["novelty effect", "peeking", "pre-planned analysis", "notification opt-out", "habit formation", "guardrail metric"],

    // V2 scaling fields
    scenarioFamily: "novelty_peeking",
    tags: ["novelty effect", "peeking", "streak mechanics", "push notifications", "habit formation", "consumer app"],
    conceptTags: ["novelty effect", "peeking", "pre-planned analysis", "notification opt-out", "guardrail metric"],
    stakeholderSummary: "The streak feature produced an exciting week-1 result, but by week 2 the lift had nearly fully reverted — a textbook novelty effect. The pre-planned 14-day primary metric is not significant. More importantly, more than one in five users in the treatment group turned off push notifications, which is a direct signal that the daily reminder is creating resentment, not motivation. The right call is to not ship this design, but the streak concept itself is worth retesting with a less aggressive notification cadence.",
    nextTestIdeas: [
      "Redesign the notification strategy: test a weekly streak summary notification ('You're on a 5-day streak — keep it going') instead of a daily 8pm pressure reminder, and pre-specify a 28-day experiment window to capture sustainable habit formation rather than novelty-driven week-1 spikes.",
      "Run a separate experiment isolating the visual streak gamification (counter + badge on home screen) from the push notification mechanism — this experiment conflated both variables, making it impossible to know whether the streak concept failed or the notification design failed.",
      "Extend the primary metric observation window to 30 days for the next iteration and add 30-day notification opt-out rate as a co-equal guardrail alongside uninstall rate, treating a +10% opt-out rate as a hard stop regardless of engagement metrics."
    ],
    keyTakeaways: [
      "The week-1 / week-2 decay pattern (+14.2% then +2.1%) is a clean novelty effect signature — users engaged with the streak feature because it was new, not because it changed their behavior, and the 14-day experiment endpoint was designed to see past exactly this initial spike.",
      "Peeking — sharing preliminary results before the experiment endpoint — doesn't just introduce statistical risk; it creates organizational lock-in that makes the correct Day-14 decision politically costly, which is a real and underappreciated harm of early readouts.",
      "A +22.3% notification opt-out rate is the most actionable finding in this readout: once users disable notifications, re-engagement becomes much harder, and this signal predicts long-term churn better than any week-1 engagement metric.",
      "The primary metric over the pre-planned 14-day window (p=0.08) is not significant regardless of what the week-1 sub-period showed — reporting the sub-period result as the headline is selective reporting, not a reasonable adjustment for a slow-forming behavior.",
      "This experiment conflated two testable mechanisms (streak gamification vs. daily notification pressure) in a single treatment, making it impossible to diagnose which component drove the opt-out spike — good experiment design would have separated them."
    ]
  },

  // ─────────────────────────────────────────────
  // SCENARIO 05 — The Mobile Winners (PAID)
  // Theme: Heterogeneous Treatment Effect
  // ─────────────────────────────────────────────
  {
    id: "s05-mobile-winners",
    title: "The Mobile Winners",
    subtitle: "Null overall. Strong mobile signal. Was it pre-specified?",
    isFree: false,
    industry: "fintech",
    difficulty: "senior",
    theme: "hte",

    context: {
      company: "Trestle Pay",
      product: "Consumer payments app (P2P transfers, bill splitting, ~2.1M users)",
      team: "Product / Core Payments team",
      background: 'Trestle Pay\'s transaction confirmation screen has always been minimal: amount, recipient, timestamp, a green checkmark. The Product team hypothesized that adding contextual information — merchant category icon, a one-line spending insight ("You\'ve spent $340 at restaurants this month"), and a quick-access button to the transaction history — would increase repeat transaction rates by reducing the friction of reviewing past payments.\n\nThe experiment ran for 21 days: 50/50 split across all users who completed at least one transaction during the experiment window. SRM check is clean.\n\nThe experiment brief, written 3 weeks ago, listed "repeat transaction rate (7-day)" as the primary metric with no pre-specified subgroup analysis.',
      businessPressure: 'The PM for Core Payments sees the mobile subgroup result before the readout and sends a Slack: "Okay this is clearly a mobile win. Can we just ship to mobile now? Desktop is a small fraction of our users anyway." The VP of Product is in the readout meeting.'
    },

    hypothesis: "Adding contextual spending information to the transaction confirmation screen will increase 7-day repeat transaction rates by making the post-transaction experience more informative and reducing the need to navigate to transaction history.",

    experimentDesign: {
      type: "a/b",
      allocation: "50/50",
      runtime: "21 days",
      targetPopulation: "Users who completed at least one transaction during experiment window (~310,000 users per arm)",
      primaryMetric: "Repeat transaction rate (7-day): completed 2+ transactions within 7 days of any transaction",
      guardrailMetrics: ["Transaction dispute rate (7-day)", "App crash rate on confirmation screen"],
      sampleSizeContext: "Powered to detect a 2% relative lift overall at 80% power. No pre-specified subgroup power calculation was done."
    },

    metricReadout: [
      {
        metric: "Repeat transaction rate — Overall",
        type: "primary",
        direction: "up",
        delta: "+0.8%",
        pValue: 0.31,
        confidenceInterval: "[-0.8%, +2.4%]",
        significant: false,
        note: "Not significant. Null result on the primary metric."
      },
      {
        metric: "Repeat transaction rate — Mobile users",
        type: "secondary",
        direction: "up",
        delta: "+9.2%",
        pValue: 0.018,
        confidenceInterval: "[+1.6%, +16.8%]",
        significant: true,
        note: "Strong mobile subgroup signal. Wide CI — true effect could range from modest to large."
      },
      {
        metric: "Repeat transaction rate — Desktop/web users",
        type: "secondary",
        direction: "down",
        delta: "-4.1%",
        pValue: 0.09,
        confidenceInterval: "[-8.9%, +0.7%]",
        significant: false,
        note: "Directionally negative on desktop, not significant. Desktop is ~18% of active users."
      },
      {
        metric: "Repeat transaction rate — New users (<30 days)",
        type: "secondary",
        direction: "up",
        delta: "+11.4%",
        pValue: 0.014,
        confidenceInterval: "[+2.3%, +20.5%]",
        significant: true,
        note: "Strong signal among newer users. Also post-hoc."
      },
      {
        metric: "Repeat transaction rate — Returning users (>30 days)",
        type: "secondary",
        direction: "down",
        delta: "-1.8%",
        pValue: 0.44,
        confidenceInterval: "[-6.3%, +2.7%]",
        significant: false,
        note: "Flat among returning users."
      },
      {
        metric: "Transaction dispute rate",
        type: "guardrail",
        direction: "up",
        delta: "+0.3%",
        pValue: 0.52,
        confidenceInterval: "[-0.6%, +1.2%]",
        significant: false,
        note: "Clean. No dispute rate impact."
      },
      {
        metric: "Confirmation screen crash rate",
        type: "guardrail",
        direction: "flat",
        delta: "0.0%",
        pValue: 0.99,
        confidenceInterval: null,
        significant: false,
        note: "Clean."
      }
    ],

    warningFlags: [
      {
        id: "wf-posthoc-subgroup",
        label: "Subgroup analysis was not pre-specified",
        description: "The experiment brief listed only the overall primary metric. The mobile and new-user subgroups were identified after seeing the data — classic post-hoc analysis. Post-hoc subgroup findings have a high false discovery rate.",
        severity: "critical"
      },
      {
        id: "wf-multiple-comparisons",
        label: "Multiple comparisons: 4 subgroups tested",
        description: "Mobile, desktop, new users, returning users — that's 4 subgroup tests run on the same data. At α=0.05, you'd expect 1 false positive per 20 tests. With 4 tests and no correction, the threshold for 'significance' should be closer to p=0.0125 (Bonferroni), which the mobile result (p=0.018) does not meet.",
        severity: "critical"
      },
      {
        id: "wf-wide-ci-mobile",
        label: "Wide CI on mobile effect",
        description: "The mobile CI is [+1.6%, +16.8%]. The true effect could be +2% (modest) or +17% (large). The point estimate of +9.2% is imprecise. This uncertainty matters for a targeting decision.",
        severity: "warning"
      },
      {
        id: "wf-desktop-negative",
        label: "Desktop signal is directionally negative",
        description: "The desktop subgroup shows -4.1% (p=0.09). Not significant, but the direction is worth noting: the new confirmation screen may be working differently on larger screens, possibly because the layout doesn't adapt well or because desktop users have different mental models.",
        severity: "warning"
      }
    ],

    decisions: [
      {
        id: "ship-overall",
        label: "Ship the new confirmation screen to all users",
        description: "The guardrails are clean and the directional signal across multiple subgroups is positive. Ship and monitor.",
        score: "junior_miss",
        feedback: "The overall result is not significant (p=0.31). Shipping on a non-significant primary metric because subgroups 'look positive' is not a valid decision framework. You're shipping based on noise, not signal."
      },
      {
        id: "ship-mobile-posthoc",
        label: "Ship to mobile users based on the mobile subgroup result",
        description: "Mobile is the clear win. Ship to mobile only. Desktop is small and the desktop signal is negative anyway.",
        score: "junior_miss",
        feedback: "This is the most tempting wrong answer. The mobile result came from a post-hoc subgroup that wasn't powered for this analysis, wasn't pre-specified, and doesn't survive multiple-comparison correction. Shipping a feature to 80% of your user base based on a post-hoc subgroup result that wouldn't survive Bonferroni correction is statistically unjustifiable — and it sets a precedent for subgroup fishing across your experimentation program."
      },
      {
        id: "null-no-followup",
        label: "Declare a null result. Do not ship.",
        description: "The primary metric is not significant. Treat the subgroup findings as noise and move on.",
        score: "analyst_ready",
        feedback: "Correct on the primary metric interpretation. The caution: calling the subgroup findings 'noise' and moving on misses something. The mobile/new-user pattern is strong enough to be worth a confirmatory test. Treating all post-hoc subgroup findings as noise is as problematic as treating all of them as confirmed effects. The right move is to treat them as hypotheses and test them properly — not to ignore them."
      },
      {
        id: "null-confirmatory-mobile",
        label: "Declare overall null. Run a confirmatory experiment targeting mobile users and new users, with the subgroup as the pre-specified population.",
        description: "The overall result is null. But the mobile/new-user pattern is strong enough to justify a follow-up experiment with these segments as the pre-specified primary population.",
        score: "senior_ready",
        feedback: "This is the right call. You're correctly calling the primary metric null, correctly treating the subgroup as exploratory (not confirmed), and correctly identifying the path forward: a pre-specified confirmatory test where mobile users are the stated primary population, powered appropriately for that subgroup. If the mobile effect replicates in a confirmatory experiment, you have a real finding. Until then, it's a hypothesis."
      },
      {
        id: "bonferroni-correction",
        label: "Apply Bonferroni correction to the subgroup tests. Note that the mobile result (p=0.018) does not survive correction at α=0.0125. Declare null across all analyses.",
        description: "With 4 subgroup tests, the corrected threshold is p=0.0125. Mobile (p=0.018) and new users (p=0.014) do not survive. Declare null.",
        score: "staff_level",
        feedback: "Technically rigorous and statistically correct. With four subgroup tests, Bonferroni sets the corrected threshold at α/4 = 0.0125. Both the mobile result (p=0.018) and the new-user result (p=0.014) fail that threshold — neither survives correction. The post-hoc nature of the analysis means the correction isn't just procedural; it's addressing a genuine search-pattern problem. In practice, the 'null-confirmatory-mobile' decision reaches the same conclusion and is slightly more actionable because it names the right follow-up experiment."
      }
    ],

    idealDecision: "null-confirmatory-mobile",
    secondBestDecision: "bonferroni-correction",

    juniorMistake: "Ships to mobile because 'the mobile numbers are strong and it's a targeted rollout, so what's the risk?' The risk is that post-hoc subgroup findings have a high false discovery rate, and systematically shipping on them trains the organization to fish for significant subgroups rather than design experiments with clear pre-specified hypotheses.",

    seniorFlags: [
      "The mobile CI [+1.6%, +16.8%] is wide. Even if the effect is real, you don't know if it's +2% or +17%. Powering a confirmatory mobile experiment correctly requires taking this uncertainty seriously.",
      "The new-user / returning-user pattern may be the more theoretically coherent finding: the spending context information is more valuable to users who are still learning the app than to experienced users who already know their transaction patterns. That's a testable hypothesis worth designing around.",
      "Desktop at -4.1% (p=0.09) is worth watching. If a confirmatory mobile experiment is launched, consider explicitly excluding desktop users or running a separate desktop-specific design."
    ],

    staffFlags: [
      "The absence of subgroup pre-specification in the experiment brief is a process gap, not just a statistical problem. At a mature experimentation organization, subgroups of interest are declared in the experiment design before data is collected — with power calculations for each. This experiment brief should have been returned for revision.",
      "The mobile vs. desktop difference may be a rendering/UX issue, not a genuine heterogeneous treatment effect. The confirmation screen layout may look different on mobile vs. desktop. That's worth investigating before attributing the difference to user behavior."
    ],

    debrief: 'The PM\'s Slack message — "can we just ship to mobile now?" — is the exact situation this product was built to practice.\n\nHere\'s the honest read: the overall experiment is null. The pre-planned primary metric over the pre-planned window did not reach significance. That\'s the answer the experiment was designed to produce, and it produced it.\n\nThe mobile subgroup result is interesting but untrustworthy as a ship signal. Why? Three reasons. First, it wasn\'t pre-specified — you found it by looking at the data after you saw the overall result, which means you already knew the overall was null when you went looking for the subgroup. That search pattern produces false positives. Second, it doesn\'t survive Bonferroni correction. With four subgroup tests at α=0.05, you\'re running a ~19% chance of at least one false positive. The mobile result at p=0.018 doesn\'t clear the corrected threshold. Third, the CI is [+1.6%, +16.8%] — wide enough that you don\'t actually know what effect you\'d be shipping.\n\nThat said: the mobile/new-user pattern is coherent. Newer users who are still learning their spending patterns might genuinely benefit from the contextual information in a way that experienced users don\'t need. That\'s a real hypothesis worth testing.\n\nThe right move: declare this experiment null, write up the mobile/new-user finding as an exploratory observation in the experiment writeup, and design a confirmatory experiment with mobile new users as the pre-specified primary population. Power it for the lower end of the mobile CI — say +3% — so you\'re not deceiving yourself with an optimistic effect size assumption.\n\nIf the effect replicates, you have a real finding and a confident ship decision. If it doesn\'t, you\'ve saved yourself from a decision that would have been hard to undo.',

    interviewTakeaway: "Post-hoc subgroup findings from a null experiment are hypotheses, not conclusions — they require confirmatory pre-specified experiments before informing a ship decision, and they should be evaluated against multiple-comparison-corrected thresholds.",

    relatedConcepts: ["heterogeneous treatment effect", "subgroup analysis", "post-hoc analysis", "Bonferroni correction", "multiple comparisons", "pre-specification", "confirmatory vs exploratory"],

    // V2 scaling fields (example)
    scenarioFamily: "hte_subgroup",
    tags: ["subgroup analysis", "post-hoc", "mobile vs desktop", "Bonferroni", "confirmatory experiment", "fintech"],
    conceptTags: ["heterogeneous treatment effect", "multiple comparisons", "pre-specification", "post-hoc analysis"],
    nextTestIdeas: [
      "Run a confirmatory experiment targeting mobile users only as the pre-specified primary population, powered for the lower bound of the mobile CI (use +3% relative lift as the effect size assumption, not the +9.2% point estimate).",
      "Investigate the desktop direction separately: determine whether the -4.1% is a rendering/layout issue or a genuine behavioral difference before any mobile-only rollout."
    ],
    stakeholderSummary: "The overall experiment was null. A mobile subgroup looked promising but was identified post-hoc, wasn't powered for this analysis, and doesn't survive multiple-comparison correction. The right next step is a confirmatory experiment with mobile users as the pre-declared population — not a ship decision based on the exploratory finding."
  },

  // ─────────────────────────────────────────────
  // SCENARIO 06 — The Five Metrics Problem (PAID)
  // Theme: Multiple Testing
  // ─────────────────────────────────────────────
  {
    id: "s06-five-metrics-problem",
    title: "The Five Metrics Problem",
    subtitle: "Two of five metrics are significant. Is that a win?",
    isFree: false,
    industry: "saas",
    difficulty: "senior",
    theme: "multiple_testing",

    context: {
      company: "Formstack Analytics",
      product: "B2B analytics and reporting SaaS (~$22M ARR, growth-stage)",
      team: "Growth / Marketing site team",
      background: 'Formstack\'s pricing page is widely blamed internally for lost revenue. The current page has three pricing tiers displayed as a feature matrix with 47 rows. The design is dense, the CTAs are unclear, and there\'s no social proof. A contractor redesigned it with: cleaner tier cards, a 5-feature comparison (not 47), prominent customer logos, and a single CTA per tier.\n\nThe experiment was written up three weeks ago. The experiment brief lists five metrics as "primary metrics" — the Head of Marketing insisted all five be declared primary because "they\'re all important to us." The experiment has been running for 21 days.\n\nThis morning, the VP of Marketing sent a Slack to #growth: "Big win on pricing page. Trial starts and demo requests both up. Let\'s ship this week."',
      businessPressure: 'The VP of Marketing has announced the result company-wide. The contractor who built the redesign is waiting for a reference. Sales leadership is asking when the new page goes live. The experiment has been running for 3 weeks and "everyone is tired of waiting."'
    },

    hypothesis: "A redesigned pricing page with cleaner tier presentation, reduced feature comparison complexity, and social proof will increase top-of-funnel conversion (trial starts and demo requests) and downstream paid conversion.",

    experimentDesign: {
      type: "a/b",
      allocation: "50/50",
      runtime: "21 days",
      targetPopulation: "All pricing page visitors",
      primaryMetric: "Five co-equal primary metrics declared in experiment brief (see readout)",
      guardrailMetrics: ["None formally declared"],
      sampleSizeContext: "~8,400 visitors per arm over 21 days. Powered to detect a 10% relative lift on trial starts at 80% power. No power calculation was done for the other four metrics."
    },

    metricReadout: [
      {
        metric: "Trial starts",
        type: "primary",
        direction: "up",
        delta: "+4.2%",
        pValue: 0.041,
        confidenceInterval: "[+0.2%, +8.2%]",
        significant: true,
        note: "Significant at p<0.05. CI lower bound is +0.2% — borderline."
      },
      {
        metric: "Demo requests",
        type: "primary",
        direction: "up",
        delta: "+7.1%",
        pValue: 0.031,
        confidenceInterval: "[+0.6%, +13.6%]",
        significant: true,
        note: "Significant at p<0.05. Wide CI."
      },
      {
        metric: "Bounce rate",
        type: "primary",
        direction: "down",
        delta: "-2.1%",
        pValue: 0.19,
        confidenceInterval: "[-5.2%, +1.0%]",
        significant: false,
        note: "Not significant."
      },
      {
        metric: "Session duration on pricing page",
        type: "primary",
        direction: "up",
        delta: "+11 seconds",
        pValue: 0.07,
        confidenceInterval: "[-1s, +23s]",
        significant: false,
        note: "Not significant."
      },
      {
        metric: "30-day paid conversion",
        type: "primary",
        direction: "up",
        delta: "+1.8%",
        pValue: 0.38,
        confidenceInterval: "[-2.2%, +5.8%]",
        significant: false,
        note: "Not significant AND incomplete — 21 days of data in a 30-day conversion window. The cohort that entered the experiment on Day 1 has not yet fully converted."
      }
    ],

    warningFlags: [
      {
        id: "wf-five-primaries",
        label: "Five co-equal primary metrics: fishing license",
        description: "Declaring five metrics as equally primary is equivalent to running five simultaneous hypothesis tests at α=0.05. With no pre-specified primary metric, no hierarchy, and no correction plan, any subset of significant results is uninterpretable — you have no principled way to distinguish signal from noise after the fact.",
        severity: "critical"
      },
      {
        id: "wf-bonferroni-fails",
        label: "Neither result survives multiple-comparison correction",
        description: "Bonferroni correction: α=0.01 per test (0.05/5). Trial starts (p=0.041) and demo requests (p=0.031) both fail. Even under less conservative Benjamini-Hochberg FDR correction at 5%, neither result survives.",
        severity: "critical"
      },
      {
        id: "wf-conversion-incomplete",
        label: "The only metric that matters is incomplete",
        description: "30-day paid conversion is the metric this business actually cares about — it directly measures revenue impact. It's incomplete (21 of 30 days observed), not significant, and has a wide CI. Any ship decision made today is made without knowing the answer to the most important question.",
        severity: "critical"
      },
      {
        id: "wf-borderline-ci",
        label: "Trial starts CI nearly crosses zero",
        description: "CI for trial starts is [+0.2%, +8.2%]. The lower bound is barely positive. This is a fragile result — a few hundred visitors could shift this to non-significant.",
        severity: "warning"
      },
      {
        id: "wf-no-guardrails",
        label: "No guardrail metrics declared",
        description: "The experiment had no declared guardrails. For a pricing page test, reasonable guardrails would include: paid conversion rate (ironic given it's now a 'primary'), time on site (could go down if the simplified page is too thin), or direct sales team contact rate.",
        severity: "warning"
      }
    ],

    decisions: [
      {
        id: "ship-two-significant",
        label: "Ship it — two significant metrics is a clear win",
        description: "Trial starts and demo requests are both up and significant. The page redesign is working.",
        score: "junior_miss",
        feedback: "Two out of five metrics reaching p<0.05 is not a win when no primary metric was pre-specified and no multiple-comparison correction plan was in place. With five co-equal primaries and no hierarchy, you have no principled basis for treating trial starts and demo requests as the signal and ignoring the other three — that selection happened post-hoc, after seeing the data. Both 'significant' results are borderline: trial starts (p=0.041) barely clears the uncorrected threshold, and neither survives Bonferroni correction (adjusted α=0.01 per test). The metric that actually translates to revenue — 30-day paid conversion — is incomplete and non-significant. There is no rigorous ship case here."
      },
      {
        id: "wait-for-conversion",
        label: "Wait 9 more days for the 30-day paid conversion metric to complete, then decide",
        description: "The most important metric is incomplete. Extend by 9 days and use paid conversion as the actual decision criterion.",
        score: "senior_ready",
        feedback: "This is the most commercially sound call. 30-day paid conversion is the metric that actually tells you whether the redesign is working for the business. Waiting 9 more days to see a complete readout on the metric you actually care about is more valuable than shipping 9 days earlier on incomplete and statistically questionable signals. If paid conversion comes back significant after 30 days, you have a real result to ship on. If it's still non-significant, you have your answer."
      },
      {
        id: "declare-inconclusive",
        label: "Declare the experiment inconclusive — the multiple testing problem invalidates the current results",
        description: "Five primary metrics with no correction means the significant results are untrustworthy. Declare inconclusive and re-run with a single primary metric.",
        score: "analyst_ready",
        feedback: "Statistically correct. The multiple testing problem is real and the significant results don't survive correction. The one thing missing: this doesn't give the team a path forward. What's the single primary metric for the re-run? What's the correct runtime? Pairing this with a concrete re-run proposal moves from a diagnosis to an actionable recommendation."
      },
      {
        id: "rerun-single-primary",
        label: "Declare inconclusive. Re-run with 30-day paid conversion as the sole primary metric, properly powered.",
        description: "The experiment was under-powered for the right metric and over-counted on the wrong ones. Re-run cleanly.",
        score: "senior_ready",
        feedback: "Correct and actionable. This names the right metric (paid conversion, not top-of-funnel proxies), acknowledges the experiment design error, and proposes a path forward. The political challenge: explaining to the VP of Marketing that the results they announced company-wide are statistically inconclusive. That conversation is uncomfortable but necessary."
      },
      {
        id: "benjamini-hochberg",
        label: "Apply Benjamini-Hochberg FDR correction across all five metrics. Report corrected results.",
        description: "BH is more appropriate than Bonferroni for this setting. Under BH at 5% FDR, neither significant result survives. Declare null.",
        score: "staff_level",
        feedback: "Correct statistical choice — BH controls the false discovery rate and is less conservative than Bonferroni while still appropriate for this setting. Under BH with 5 tests, the critical thresholds are p=0.01, p=0.02, p=0.03, p=0.04, p=0.05 (rank-ordered). The two significant results rank at p=0.031 and p=0.041 — the BH-adjusted thresholds for ranks 2 and 1 are p=0.02 and p=0.01. Neither survives. This is the most statistically nuanced call and the most defensible in a technical review."
      }
    ],

    idealDecision: "wait-for-conversion",
    secondBestDecision: "rerun-single-primary",

    juniorMistake: "Ships because 'we saw positive signals on the top-of-funnel metrics' and 'the page clearly performs better.' Does not recognize that two out of five p<0.05 results with no correction plan and no pre-specified primary metric is not a trustworthy signal — both results are borderline, neither survives correction, and the only revenue metric is incomplete.",

    seniorFlags: [
      "The experiment brief should never have been approved with five co-equal primary metrics. Someone — ideally the analyst — should have pushed back at spec time: 'What is the one metric this experiment needs to move for us to call it a success?'",
      "30-day paid conversion is the only metric that translates directly to business value. The fact that it's incomplete and non-significant at Day 21 is the most important data point in this readout, and it's being ignored.",
      "The trial starts CI [+0.2%, +8.2%] has a lower bound of essentially zero. This is a fragile result that a modestly different traffic mix could flip. Even if we set aside the multiple testing issue, this result would not give me high confidence."
    ],

    staffFlags: [
      "Would have rejected the five-primary-metric experiment brief before it launched. The conversation would be: 'If trial starts go up but paid conversion goes down, do we ship? If demo requests go up but trial starts don't move, do we ship? You can't answer either question without a hierarchy.' The answer to that question determines what the actual primary metric is.",
      "No declared guardrails on a pricing page experiment is a significant process gap. At minimum, paid conversion should have been a guardrail (floor: do not harm) if it wasn't going to be the primary metric."
    ],

    debrief: 'This is one of the most common ways experimentation programs go wrong at growth-stage companies: the "we care about all of these metrics" instinct leads to experiments with five primary metrics and no statistical discipline. The VP of Marketing is excited, the Slack message is sent, and now it\'s your job to explain why "two significant results" is not a win.\n\nHere\'s what they need to understand: this experiment had five co-equal primary metrics, no pre-specified hierarchy, and no correction plan. When you run five simultaneous tests at α=0.05 without any of those guardrails, two significant results is not a clean signal — you have no principled way to distinguish real effects from false positives. The two results that \'won\' were selected post-hoc from a menu of five, after seeing the data. Neither survives Bonferroni correction. That\'s not evidence. That\'s noise with a p-value attached.\n\nThe thing I keep coming back to is the 30-day paid conversion metric. That\'s the number that tells you whether the redesign actually helps or hurts the business. It\'s at Day 21 of a 30-day window, not significant, and has a CI that includes meaningful negative effects. The entire experiment was declared a win before the only metric that matters was fully observed.\n\nMy recommendation in this specific situation: wait 9 days for the paid conversion metric to complete. That\'s the honest path. If paid conversion comes back significant, you have a clean result and a strong ship case. If it doesn\'t, you have your answer and you have to have the harder conversation — but you\'d rather have it now than after shipping a redesign that turns out to be neutral or negative on revenue.\n\nLonger term: the experiment brief process needs to require a single primary metric and a pre-registered analysis plan. "All of these metrics are important to us" is a business statement, not an experiment design.',

    interviewTakeaway: "Declaring multiple co-equal primary metrics is equivalent to running multiple simultaneous tests with uncorrected alpha — two out of five significant results at p<0.05 is statistically consistent with no true effect, and the metric that matters most (downstream conversion) should drive the decision.",

    relatedConcepts: ["multiple testing", "Bonferroni correction", "Benjamini-Hochberg", "false discovery rate", "experiment brief", "primary metric selection", "family-wise error rate"],

    // V2 scaling fields
    scenarioFamily: "multiple_testing",
    tags: ["multiple testing", "Bonferroni", "Benjamini-Hochberg", "pricing page", "B2B SaaS", "experiment brief"],
    conceptTags: ["multiple testing", "false discovery rate", "primary metric selection", "family-wise error rate"],
    stakeholderSummary: "The pricing page redesign showed two significant metrics out of five, but this isn't a win — with five simultaneous tests and no correction plan, finding two significant results at p<0.05 is consistent with random noise. Neither result survives standard multiple-comparison correction. The metric that actually measures revenue impact — 30-day paid conversion — is still incomplete and shows no signal. The right call is to wait 9 more days for the conversion metric to complete before making any decision.",
    nextTestIdeas: [
      "Wait 9 days for 30-day paid conversion to complete, then re-evaluate with paid conversion as the sole primary metric — if it is significant, you have a clean ship decision; if not, you have a clear null result to communicate to stakeholders.",
      "Re-run a future pricing page experiment with a single pre-declared primary metric (30-day paid conversion), a properly powered sample size for that metric specifically, and trial starts demoted to a secondary metric that informs interpretation but does not drive the decision.",
      "Introduce a formal experiment brief review process that requires any experiment with more than one primary metric to explicitly answer: 'If metric A goes up but metric B goes down, do we ship?' — the inability to answer that question reveals that only one metric is truly primary."
    ],
    keyTakeaways: [
      "Declaring five co-equal primary metrics with no hierarchy and no correction plan is mathematically equivalent to running five simultaneous tests at α=0.05 — under the null hypothesis, you expect 0.25 false positives per experiment, making two out of five 'significant' results plausible as noise.",
      "Under Bonferroni correction (α=0.01 per test for 5 tests), both significant results fail — trial starts (p=0.041) and demo requests (p=0.031) both miss the corrected threshold, and Benjamini-Hochberg FDR correction reaches the same conclusion.",
      "The trial starts confidence interval [+0.2%, +8.2%] has a lower bound barely above zero — a result this fragile means a modestly different traffic composition over the same period could flip this to non-significant, regardless of multiple testing concerns.",
      "30-day paid conversion is the only metric in this readout that directly measures whether the redesign generates revenue; making a ship decision at Day 21 of a 30-day window on that metric means deciding without the answer to the question that actually matters.",
      "The 'experiment everything' instinct and the 'all our metrics are important' instinct are both healthy; they go wrong only when they are conflated — a single experiment can track many metrics, but it must have one pre-declared primary that determines the ship decision before any data is collected."
    ]
  },

  // ─────────────────────────────────────────────
  // SCENARIO 07 — The Two-Sided Spill (PAID)
  // Theme: Marketplace Interference / SUTVA Violation
  // ─────────────────────────────────────────────
  {
    id: "s07-two-sided-spill",
    title: "The Two-Sided Spill",
    subtitle: "Treatment riders improved. Control riders got worse. The supply was shared.",
    isFree: false,
    industry: "marketplace",
    difficulty: "staff",
    theme: "network_effects",

    context: {
      company: "Haul",
      product: "On-demand delivery marketplace (~4.2M monthly orders, operates in 38 cities)",
      team: "Marketplace Dynamics / Driver Incentives team",
      background: 'Haul has a driver cancellation problem during peak hours (5–9pm weekdays). Under the current incentive structure, drivers receive surge multipliers during peak hours — but the multipliers have become unpredictable, leading drivers to strategically delay acceptance while waiting for higher surges. This results in elevated cancellation rates and poor customer experience at exactly the wrong time.\n\nThe Marketplace Dynamics team designed a new incentive structure: a fixed "reliability bonus" (higher guaranteed base pay during peak hours) plus a lower, more predictable surge multiplier. The hypothesis is that more predictable earnings reduce strategic delay behavior and lower cancellations.\n\nThe experiment ran for 28 days in 6 cities. Riders in those cities were split 50/50 at the order level: treatment orders carried the new reliability bonus incentive (higher guaranteed base pay, lower surge multiplier), while control orders carried the old surge-based incentive. The same pool of drivers operated across both order types — drivers saw both treatment and control orders in their queue simultaneously. Because treatment orders offered more predictable, higher guaranteed pay, drivers preferentially accepted treatment orders when given the choice. The result: treatment riders received faster, more reliable service. Control riders — drawing from the same driver supply — were systematically underserved. Supply was shared. The benefit was not.',
      businessPressure: 'The Operations team is very excited about the treatment rider result. They want to present this to the board as evidence that the incentive redesign works. The experiment cost real money — the fixed reliability bonus was funded by reducing the surge multiplier pool, and the Operations budget took a $180K hit during the 28-day run. Leadership wants to see a return on that.'
    },

    hypothesis: "A fixed reliability bonus with a lower, predictable surge multiplier will reduce driver strategic cancellation behavior during peak hours, improving peak-hour delivery reliability for riders.",

    experimentDesign: {
      type: "a/b",
      allocation: "50/50 order-level (treatment orders carry new reliability bonus; control orders carry old surge incentive; driver pool is shared across both order types)",
      runtime: "28 days, 6 cities",
      targetPopulation: "Riders placing orders during peak hours (5–9pm weekdays) in 6 test cities",
      primaryMetric: "Peak-hour rider cancellation rate",
      guardrailMetrics: ["Driver acceptance rate", "Delivery completion time (p75)"],
      sampleSizeContext: "~95,000 peak-hour orders per arm across 6 cities and 28 days. Well-powered for a 3% relative change in cancellation rate."
    },

    metricReadout: [
      {
        metric: "Peak-hour cancellation rate — Treatment riders",
        type: "primary",
        direction: "down",
        delta: "-3.1%",
        pValue: 0.038,
        confidenceInterval: "[-6.0%, -0.2%]",
        significant: true,
        note: "Significant reduction in cancellations for treatment riders. This is the headline result."
      },
      {
        metric: "Peak-hour cancellation rate — Control riders (vs. pre-experiment baseline)",
        type: "diagnostic",
        direction: "up",
        delta: "+4.8% vs. historical baseline",
        pValue: null,
        confidenceInterval: null,
        significant: null,
        note: "Control riders experienced WORSE cancellation rates than historical pre-experiment baseline. This is a critical diagnostic finding."
      },
      {
        metric: "Overall marketplace cancellation rate (vs. historical baseline)",
        type: "diagnostic",
        direction: "up",
        delta: "+1.2% vs. pre-experiment baseline",
        pValue: null,
        confidenceInterval: null,
        significant: null,
        note: "The marketplace as a whole got slightly worse during the experiment — despite treatment riders improving."
      },
      {
        metric: "Driver acceptance rate",
        type: "guardrail",
        direction: "up",
        delta: "+6.2%",
        pValue: 0.021,
        confidenceInterval: "[+0.9%, +11.5%]",
        significant: true,
        note: "Drivers are accepting more orders. Consistent with the incentive hypothesis — more predictable pay, less strategic delay."
      },
      {
        metric: "Delivery completion time (p75)",
        type: "guardrail",
        direction: "down",
        delta: "-2.1 minutes",
        pValue: 0.09,
        confidenceInterval: "[-4.5 min, +0.3 min]",
        significant: false,
        note: "Not significant. Directionally positive."
      },
      {
        metric: "SRM check (rider assignment)",
        type: "diagnostic",
        direction: "flat",
        delta: "50.2% / 49.8%",
        pValue: 0.71,
        confidenceInterval: null,
        significant: false,
        note: "Assignment was clean on the rider side."
      }
    ],

    warningFlags: [
      {
        id: "wf-sutva",
        label: "SUTVA violation: shared driver supply",
        description: "The Stable Unit Treatment Value Assumption (SUTVA) requires that a unit's outcome depends only on its own treatment assignment, not on others'. Here, control and treatment riders share the same driver pool. Because treatment orders offer higher guaranteed pay, drivers preferentially accept them over control orders — leaving fewer drivers available for control riders. The treatment group benefits at the expense of the control group through the same shared supply. The treatment effect is inflated and the control outcome is degraded by the same mechanism.",
        severity: "critical"
      },
      {
        id: "wf-control-degraded",
        label: "Control group degradation confirms interference",
        description: "Control riders got worse than historical baseline (+4.8% cancellation vs. pre-experiment levels). In a clean experiment, the control group should approximate the pre-experiment baseline. The degradation is direct evidence that the treatment leaked into the control group through shared supply.",
        severity: "critical"
      },
      {
        id: "wf-experiment-invalid",
        label: "The experiment cannot produce a valid causal estimate",
        description: "When SUTVA is violated, the measured treatment effect is not the effect of the incentive change — it's the effect of the incentive change plus the spillover. You cannot separate these effects with the current design. The -3.1% result is meaningless as a causal estimate.",
        severity: "critical"
      },
      {
        id: "wf-design-flaw",
        label: "This experiment design was predictably invalid before launch",
        description: "In a marketplace where supply cannot be split, any rider-side experiment that affects driver behavior will violate SUTVA. This should have been caught in design review.",
        severity: "warning"
      }
    ],

    decisions: [
      {
        id: "ship-treatment-positive",
        label: "Ship to all riders — the treatment group improved and the driver acceptance rate is up",
        description: "Treatment riders saw -3.1% cancellations. Drivers accepted more orders. Ship the new incentive structure.",
        score: "junior_miss",
        feedback: "The treatment rider result is not a valid causal estimate of the incentive change. Because drivers were shared between treatment and control, the treatment group benefited partly at the expense of the control group. The -3.1% improvement for treatment riders is inflated — it includes the effect of having more drivers available (because control riders had fewer). You're not measuring the effect of the incentive; you're measuring the effect of preferential supply access."
      },
      {
        id: "invalid-do-not-ship",
        label: "Do not ship. The experiment is invalid due to supply-side interference.",
        description: "SUTVA is violated. The result cannot be interpreted causally. Do not make any ship decision based on this experiment.",
        score: "senior_ready",
        feedback: "Correct. The experiment cannot produce a valid causal estimate. Shipping on an invalid result would mean deploying a significant incentive redesign (at real cost to the driver incentive budget) based on a statistically meaningless number. The -3.1% could be entirely explained by supply reallocation, not by the incentive change itself."
      },
      {
        id: "geo-holdout",
        label: "Do not ship. Design a geographic holdout experiment — assign entire cities to treatment or control.",
        description: "A clean experiment requires the unit of randomization to be above the unit of interference. Use cities as the unit of randomization.",
        score: "senior_ready",
        feedback: "This is the correct alternative design. By randomizing at the city level (some cities get the new incentive, some don't), you eliminate within-city supply spillover. The tradeoff: you have fewer randomization units (cities, not riders), which means lower statistical power. But it's a valid experiment. Be aware of city-level confounders — size, driver density, demand patterns."
      },
      {
        id: "switchback",
        label: "Do not ship. Design a switchback (time-based) experiment — alternate the incentive structure by time period.",
        description: "Alternate between old and new incentive structures by time period (e.g., odd hours vs. even hours, or alternating weeks) within the same geography.",
        score: "staff_level",
        feedback: "The switchback design is an elegant solution for marketplace experiments where cross-sectional assignment is impossible. By alternating treatment conditions over time in the same market, you control for geographic confounders. The assumption: the treatment effect is not persistent across time periods (carryover). For an incentive structure experiment, carryover is a real risk — drivers may adapt their behavior over time in ways that persist into the next period. Careful carryover analysis is required."
      },
      {
        id: "driver-side-randomization",
        label: "Do not ship. Redesign to randomize on the driver side in a non-overlapping way (e.g., driver cohorts in non-overlapping service zones).",
        description: "If drivers can be assigned to non-overlapping geographic zones, SUTVA holds at the zone level.",
        score: "staff_level",
        feedback: "Valid design approach if geographic zone separation is practically feasible and service zones don't overlap. In practice, driver supply is highly fluid in most marketplace cities — drivers cross zone boundaries constantly, making true non-overlap difficult to enforce. This design works better in theory than execution for most marketplace contexts."
      }
    ],

    idealDecision: "geo-holdout",
    secondBestDecision: "invalid-do-not-ship",

    juniorMistake: "Ships because the treatment group improved and the driver acceptance rate went up. Does not notice the control group degradation vs. historical baseline. Does not recognize SUTVA or the concept of supply-side interference.",

    seniorFlags: [
      "The control group degradation vs. historical baseline (+4.8% cancellation) is the key diagnostic signal. In a valid experiment, control should approximate historical baseline. When it doesn't, it means the treatment is leaking — in this case, through shared driver supply.",
      "The overall marketplace cancellation rate went up vs. baseline (+1.2%), even while treatment riders improved. This is only possible if the improvement for treatment riders came at the cost of control riders. The incentive change may have zero net effect on the marketplace — you've redistributed cancellations, not reduced them.",
      "The driver acceptance rate improvement (+6.2%) is probably the most trustworthy finding in this readout, because it measures a driver-level outcome that isn't contaminated by which riders they serve. It's consistent with the hypothesis that more predictable pay reduces strategic delay."
    ],

    staffFlags: [
      "This experiment design should have been caught before launch. Any analyst with marketplace experimentation experience knows that you cannot run rider-side experiments when the treatment affects driver behavior — you've introduced interference by design.",
      "The right question at design review: 'What is the unit of interference for this treatment?' If the answer is 'drivers, who are shared,' the unit of randomization needs to be at or above the driver level — which means city-level or driver-zone-level randomization.",
      "The driver acceptance rate finding (+6.2%, p=0.021) is worth preserving: it's a valid measurement of driver behavioral response to the incentive change. A geo-holdout experiment would be designed specifically to measure whether this behavioral change translates to marketplace-level cancellation reduction."
    ],

    debrief: 'This is the kind of experiment that looks right on the surface and is completely broken underneath.\n\nThe logic sounds airtight: riders in treatment saw fewer cancellations, drivers accepted more orders, let\'s ship. But look at the control group. Control riders experienced +4.8% more cancellations versus the pre-experiment baseline. In a valid experiment, the control group should approximate the world without the treatment — it should look like your historical baseline. When it doesn\'t, something is wrong.\n\nWhat went wrong is SUTVA — the Stable Unit Treatment Value Assumption. It\'s the foundational assumption underlying any causal inference from a randomized experiment: the outcome for unit A depends only on A\'s treatment, not on B\'s. In a two-sided marketplace with a shared driver pool, that assumption is violated by construction the moment you run a rider-side experiment that affects how drivers behave.\n\nHere\'s what actually happened: treatment orders offered higher guaranteed pay than control orders. When a driver\'s queue showed both types simultaneously, they preferentially accepted the treatment orders. Treatment riders got first pick of the driver pool. Control riders were left with whoever remained — or no driver at all. The treatment riders\' improvement came partly at the expense of the control riders, not purely from the incentive design itself. The -3.1% causal estimate is not measuring the incentive change — it\'s measuring supply reallocation. It\'s fiction as a causal estimate.\n\nThe overall marketplace cancellation rate confirms it: the marketplace got slightly worse during the experiment, not better. You redistributed cancellations. You didn\'t reduce them.\n\nThe right experiment here is a geographic holdout. Pick some cities for treatment, some for control, run the incentive change at the city level. No rider-side split. Cities are the unit of randomization because cities are close to the unit of independence — supply doesn\'t flow freely between cities. It\'s lower power (you have 38 cities, not millions of riders), but it\'s valid.\n\nOne more thing: the driver acceptance rate finding (+6.2%) is real and worth keeping. That measures a driver behavioral outcome directly — it\'s not contaminated by supply spillover. It tells you the incentive is doing something to driver psychology. Whether that translates to marketplace-level improvement is exactly what the geo-holdout needs to measure.',

    interviewTakeaway: "In a two-sided marketplace where supply cannot be split, standard rider/buyer-side A/B testing violates SUTVA — the correct experimental design is geographic holdout or switchback, where the unit of randomization is at or above the unit of interference.",

    relatedConcepts: ["SUTVA", "marketplace interference", "network effects", "geographic holdout", "switchback experiment", "unit of randomization", "spillover effects", "two-sided marketplace"],

    // V2 scaling fields
    scenarioFamily: "network_effects",
    tags: ["SUTVA violation", "marketplace interference", "supply sharing", "geographic holdout", "switchback", "on-demand delivery"],
    conceptTags: ["SUTVA", "spillover effects", "unit of randomization", "marketplace interference", "network effects"],
    stakeholderSummary: "The incentive redesign experiment appeared to show a benefit for treatment riders, but the experiment design was fundamentally broken: treatment and control riders shared the same driver pool, so drivers preferentially served treatment orders, leaving control riders underserved. This means we measured supply reallocation, not the effect of the incentive itself. The overall marketplace actually got slightly worse during the experiment. We cannot make a ship decision based on this result — we need to re-run using a city-level randomization design.",
    nextTestIdeas: [
      "Design a geographic holdout experiment across the existing 38 cities: assign approximately 19 cities to the new reliability bonus incentive and 19 to the existing surge structure, measure peak-hour cancellation rate at the city level for 28 days, and explicitly pre-declare city-level cancellation rate as the primary metric.",
      "Before the geo-holdout, run a driver survey in 3-5 cities to quantify how predictable pay affects strategic acceptance behavior — this qualitative signal will help size the expected effect and set a realistic minimum detectable effect for the geo-holdout power calculation.",
      "Design a switchback experiment in 6 cities alternating the incentive structure by week, with explicit carryover-period controls (48-hour washout between switches), to test whether the driver acceptance rate finding (+6.2%) translates into marketplace-level cancellation improvement in a cleaner setting."
    ],
    keyTakeaways: [
      "SUTVA — the Stable Unit Treatment Value Assumption — requires that a unit's outcome depends only on its own treatment, not on others'; in a two-sided marketplace with shared supply, this assumption is violated the moment a rider-side treatment changes how drivers prioritize competing orders.",
      "The clearest diagnostic for SUTVA violation is control group degradation: when control riders experience +4.8% worse cancellations than pre-experiment baseline, the experiment's control is no longer approximating the world without the treatment — the treatment is leaking through shared driver supply.",
      "The overall marketplace cancellation rate increased vs. baseline (+1.2%) even while treatment riders improved; this is only possible if treatment riders' benefit came at the expense of control riders, meaning the incentive change redistributed cancellations rather than reducing them in aggregate.",
      "The driver acceptance rate finding (+6.2%, p=0.021) is the most trustworthy result in this dataset because it measures a driver-level behavioral outcome that is not contaminated by which riders the driver subsequently serves — it confirms the incentive hypothesis is directionally plausible, worth testing in a valid design.",
      "The unit of randomization must be at or above the unit of interference: in any marketplace where supply flows freely within a geography, the city is the minimum viable randomization unit for supply-side experiments."
    ]
  },

  // ─────────────────────────────────────────────
  // SCENARIO 08 — False Rigor (PAID)
  // Theme: When Not to Experiment
  // ─────────────────────────────────────────────
  {
    id: "s08-false-rigor",
    title: "False Rigor",
    subtitle: "The team wants an experiment. The math says it can't work. What do you tell them?",
    isFree: false,
    industry: "b2b",
    difficulty: "senior",
    theme: "when_not_to_experiment",

    context: {
      company: "Veridict",
      product: "Compliance and audit management SaaS for mid-market financial firms (~$14M ARR, 110 active enterprise accounts)",
      team: "Product / Compliance Workflow team",
      background: 'Veridict\'s product team has spent the past quarter building a redesigned audit workflow module: a new evidence collection interface with drag-and-drop file organization, inline commenting, and automated deadline reminders. The feature is built, QA\'d, and ready to deploy.\n\nThe Head of Product wants to "experiment on it." She attended an experimentation conference last month and came back committed to the idea that "we should A/B test every major feature." The PM on the audit workflow assigned it to you: design the experiment.\n\nYou pull the data: 110 active enterprise accounts. About 65 actually use the audit workflow feature today. Historically, "audit completion rate" (the percentage of assigned audit tasks completed on time) is the metric the team cares about. It\'s currently at 71%. It moves slowly — typical variance is ±2% per quarter.',
      businessPressure: 'The Head of Product is aligned with the "experiment everything" philosophy. The VP of Customer Success wants to show the new feature to a strategic account next week for an upsell conversation. The quarter ends in 8 weeks and the team wants to have "validated" the feature before the board presentation. The engineering team wants the feature deployed and done.'
    },

    hypothesis: "A redesigned audit workflow interface with drag-and-drop file organization, inline commenting, and automated deadline reminders will increase audit completion rates and reduce time-to-audit-close for enterprise accounts.",

    experimentDesign: {
      type: "proposed a/b (not yet launched)",
      allocation: "50/50 (proposed)",
      runtime: "TBD",
      targetPopulation: "Enterprise accounts using audit workflow feature (~65 accounts)",
      primaryMetric: "Audit completion rate (quarterly)",
      guardrailMetrics: ["Support ticket rate", "Account health score"],
      sampleSizeContext: "To detect a 5% relative lift (71% → 74.5%) at 80% power with α=0.05: required runtime is approximately 18 months. To detect a 10% relative lift (71% → 78.1%): approximately 9 months. To detect a 20% relative lift (71% → 85.2%): approximately 4 months. Quarter ends in 8 weeks."
    },

    metricReadout: [
      {
        metric: "Available sample (accounts using audit workflow)",
        type: "diagnostic",
        direction: "flat",
        delta: "~65 accounts",
        pValue: null,
        confidenceInterval: null,
        significant: null,
        note: "Maximum possible sample size. Cannot be increased."
      },
      {
        metric: "Minimum detectable effect at 80% power, 8-week runtime",
        type: "diagnostic",
        direction: "flat",
        delta: "~35% relative lift required",
        pValue: null,
        confidenceInterval: null,
        significant: null,
        note: "To reach 80% power in 8 weeks with 65 accounts, you would need to observe a 35%+ relative improvement — from 71% to ~96% audit completion rate. This is not a plausible effect size."
      },
      {
        metric: "Statistical power of proposed 8-week experiment",
        type: "diagnostic",
        direction: "flat",
        delta: "~12% (vs. 80% target)",
        pValue: null,
        confidenceInterval: null,
        significant: null,
        note: "An 8-week experiment on this sample has approximately 12% power to detect a 5% relative lift. That means an 88% chance of missing a real effect. Running this experiment produces almost no information."
      }
    ],

    warningFlags: [
      {
        id: "wf-sample-too-small",
        label: "Sample size is fundamentally insufficient for A/B testing",
        description: "65 accounts is an extremely small sample for A/B testing any metric with moderate variance. No amount of runtime optimization changes the fundamental math: you don't have enough units.",
        severity: "critical"
      },
      {
        id: "wf-metric-too-slow",
        label: "Primary metric moves too slowly for practical experimentation",
        description: "Audit completion rate is a quarterly metric with low variance. It requires a long observation window to accumulate enough metric change to measure reliably. 8 weeks is an order of magnitude too short.",
        severity: "critical"
      },
      {
        id: "wf-underpowered-experiment-is-worse-than-none",
        label: "Underpowered experiments produce misleading results",
        description: "A 12% power experiment is not 'weak evidence' — it's worse than no experiment. If the result comes back non-significant (88% chance even if the feature works), the team may falsely conclude the feature doesn't work and roll it back. If it comes back significant (by chance), the team has a false positive they'll rely on.",
        severity: "critical"
      },
      {
        id: "wf-false-rigor",
        label: "Insisting on A/B testing when it isn't valid is false rigor",
        description: "Calling something an 'experiment' when the statistical conditions for experimentation aren't met doesn't add rigor — it adds the language of rigor to a process that can't produce reliable evidence. This can be worse than honest qualitative assessment.",
        severity: "warning"
      }
    ],

    decisions: [
      {
        id: "run-8-week",
        label: "Run the A/B experiment for 8 weeks as requested",
        description: "The team wants an experiment. Run it for 8 weeks and report the results.",
        score: "junior_miss",
        feedback: "An 8-week experiment with 65 accounts on a slow quarterly metric has approximately 12% statistical power to detect a 5% relative improvement. Running it produces almost no useful information — you have an 88% chance of missing a real effect even if it exists. Worse, any result you get (significant or not) will be used as evidence in a decision, despite being statistically meaningless. This is how bad decisions get made with a veneer of data rigor."
      },
      {
        id: "run-longer",
        label: "Run the A/B experiment for 18 months to reach adequate power",
        description: "The statistically correct runtime for this experiment is 18 months. Recommend that to stakeholders.",
        score: "analyst_ready",
        feedback: "Statistically correct, practically useless. An 18-month experiment means the product team won't get any signal until after the next two planning cycles. The feature will either be rolled out, rolled back, or made obsolete before the experiment concludes. Recommending 18 months without alternative solutions isn't analysis — it's analysis as a roadblock."
      },
      {
        id: "instrumented-rollout-qualitative",
        label: "Recommend against A/B testing. Propose: instrumented rollout + structured qualitative feedback.",
        description: "Explain why A/B testing isn't valid here. Propose an instrumented rollout (pre/post analysis with all accounts) combined with structured qualitative interviews with 8–10 accounts post-rollout.",
        score: "senior_ready",
        feedback: "This is the right recommendation for this context. You're correctly diagnosing why A/B testing doesn't work here, and you're offering a credible alternative that can generate real evidence within the timeline. An instrumented rollout with clear pre-declared success criteria (e.g., 'audit completion rate increases by at least 3 percentage points within 2 quarters') gives the team something to evaluate against. Structured qualitative interviews with 8-10 accounts will surface usability issues and adoption patterns that A/B testing would never capture at this sample size."
      },
      {
        id: "piloted-rollout-success-criteria",
        label: "Recommend a structured pilot: 15-20 willing accounts, explicit pre-declared success criteria, qualitative interviews.",
        description: "Run a voluntary pilot with a subset of willing accounts. Declare explicit success criteria before launch. Evaluate against those criteria.",
        score: "senior_ready",
        feedback: "Also a strong recommendation. The voluntary pilot has a selection bias concern (willing accounts may be more engaged and more likely to succeed), but it's a reasonable way to gather early signal with limited sample. The critical component: success criteria must be declared before the pilot begins. 'We'll know it worked when we see X' is only meaningful if X is defined before the data is collected."
      },
      {
        id: "mixed-methods",
        label: "Recommend a mixed-methods approach: instrumented rollout + propensity-matched pre/post + qualitative interviews. Explain why A/B is invalid and what this replaces it with.",
        description: "Design a rigorous observational study instead of a randomized experiment. Use propensity score matching on account characteristics to create a quasi-experimental comparison. Pair with structured qualitative research.",
        score: "staff_level",
        feedback: "This is the most rigorous alternative to A/B testing when randomization is impossible or impractical. Propensity score matching on account characteristics (industry, company size, historical audit completion rate, account tenure) can approximate a comparison group. It's not as clean as randomization — unmeasured confounders are a real risk — but it's far more informative than a 12%-power A/B test. Pairing it with qualitative research gives you both quantitative signal and the ability to identify the mechanism."
      }
    ],

    idealDecision: "mixed-methods",
    secondBestDecision: "instrumented-rollout-qualitative",

    juniorMistake: "Runs the 8-week experiment as requested. Often doesn't check power before designing the experiment, or knows the power is low but doesn't want to push back on the Head of Product's 'experiment everything' philosophy. The result: the experiment runs, comes back non-significant (as expected at 12% power), and the team concludes the feature doesn't work — possibly rolling it back. This is an experiment that made things worse.",

    seniorFlags: [
      "The power calculation should be the first thing you do when asked to design an experiment. Here: 65 accounts, quarterly metric, moderate variance → 18 months to achieve 80% power → experiment is not viable. This is a 5-minute calculation that reframes the entire conversation.",
      "An underpowered experiment is not 'weak evidence' — it's misleading evidence. A non-significant result from a 12%-power experiment will be incorrectly interpreted as 'the feature doesn't work.' A significant result will be incorrectly interpreted as 'the feature works.' Neither interpretation is justified. The experiment produces almost no information while consuming significant organizational attention.",
      "The 'experiment everything' philosophy from the Head of Product is well-intentioned but misapplied here. Your job as the analyst is not to run every experiment that's asked for — it's to tell the team when a proposed experiment can and cannot produce valid evidence."
    ],

    staffFlags: [
      "Would have established minimum sample size and metric velocity requirements as part of the team's experiment intake process — before individual experiment requests are evaluated. 'We need at least N units and the primary metric needs to move at a rate that allows us to observe a meaningful change within a reasonable window.' This scenario wouldn't have reached the experiment design stage.",
      "The deeper organizational issue: the team equates 'running an experiment' with 'being rigorous.' The more honest frame is that rigor means using the right evidence collection method for the context — which is sometimes a randomized experiment, and sometimes an instrumented rollout with pre-declared success criteria and qualitative interviews. Both can be rigorous. Only the former is called an 'experiment.'"
    ],

    debrief: 'The most important skill I\'ve tried to develop is knowing when not to experiment. And this is one of those moments.\n\nHere\'s the math: 65 accounts, an 8-week window, a metric that moves at ±2% per quarter. To reach 80% statistical power in 8 weeks, you\'d need to observe a 35%+ relative improvement in audit completion rate. That means going from 71% to 96%. That\'s not a realistic effect size for a UI redesign of a workflow module. You could build the most beautiful audit interface ever shipped and not see a 35% lift.\n\nSo what does running this experiment actually tell you? If you get a non-significant result — which happens 88% of the time even if the feature genuinely works — you\'ll report "no significant improvement" and someone will use that to argue for rollback. You\'ll have created evidence that misleads, not informs.\n\nHere\'s how I\'d frame the conversation with the Head of Product: "I ran the power calculation. To detect a real effect with this sample and this metric, we need 18 months — which isn\'t useful. The good news is we can still get rigorous evidence. We instrument the rollout, define concrete success criteria before we start (audit completion rate +3pp within 2 quarters), and combine that with structured interviews with 10 accounts at 6 weeks and 12 weeks. That\'s actually more information than an underpowered A/B test would give us, and we can have preliminary data within the quarter."\n\nFraming it this way gives the Head of Product what she actually wants — disciplined evidence collection — while being honest about what a randomized experiment can and can\'t do here.\n\nOne more thing: the VP of Customer Success wanting to demo this to a strategic account next week for an upsell is completely separate from the experimentation question. That\'s a sales decision. Let them demo it. Just don\'t let that demo\'s success or failure be treated as evidence about whether the feature works across all 110 accounts.',

    interviewTakeaway: "The correct response to 'design an A/B test for this' is first to check whether a valid A/B test is possible — low sample size, slow-moving metrics, or short timelines can make A/B testing invalid, and proposing rigorous alternatives (instrumented rollout, pre/post with success criteria, qualitative research) is more valuable than running an underpowered experiment.",

    relatedConcepts: ["statistical power", "minimum detectable effect", "sample size", "quasi-experimental design", "propensity score matching", "instrumented rollout", "pre/post analysis", "when not to experiment"],

    // V2 scaling fields
    scenarioFamily: "when_not_to_experiment",
    tags: ["statistical power", "minimum detectable effect", "small sample", "enterprise SaaS", "false rigor", "instrumented rollout"],
    conceptTags: ["statistical power", "minimum detectable effect", "sample size", "quasi-experimental design", "when not to experiment"],
    stakeholderSummary: "The audit workflow redesign is ready to ship, but the proposed A/B test has only 12% statistical power — meaning it has an 88% chance of missing a real improvement even if the feature genuinely works. With 65 accounts and a quarterly metric, a valid A/B test would take 18 months. The right path is a structured instrumented rollout with pre-declared success criteria and structured customer interviews — this produces more honest evidence than a statistically meaningless experiment, and can deliver preliminary signal within the quarter.",
    nextTestIdeas: [
      "Design an instrumented rollout with pre-declared success criteria: define 'success' as audit completion rate increasing by at least 3 percentage points within 2 quarters post-launch, declare this before rollout, and report against it at 3 months and 6 months — this is more informative than an 8-week underpowered A/B test.",
      "Conduct structured qualitative interviews with 8-10 accounts at 6 weeks and 12 weeks post-launch to identify which specific features (drag-and-drop, inline commenting, automated reminders) are driving adoption and which are being ignored — qualitative research fills the gap that a small-N quantitative study cannot.",
      "After 6 months of rollout data, apply propensity score matching on account characteristics (industry, company size, historical audit completion rate, account tenure) to construct a quasi-experimental comparison group from accounts that were onboarded before the redesign — this provides a retrospective causal estimate that is far stronger than an 8-week 12%-power experiment."
    ],
    keyTakeaways: [
      "Statistical power is the first calculation to run before agreeing to any experiment design: with 65 accounts, a quarterly metric, and an 8-week timeline, power comes to approximately 12% — meaning you are almost certain to produce a misleading result regardless of whether the feature works.",
      "An underpowered experiment is not 'weak evidence' — it is actively misleading: a non-significant result from a 12%-power study will incorrectly be interpreted as 'the feature doesn't work,' and a false positive (12% base rate) will be incorrectly interpreted as confirmation, producing decisions that would have been better made without the experiment.",
      "The MDE at 8 weeks with 65 accounts is approximately +35% relative lift (71% → 96% audit completion) — naming this number explicitly in the stakeholder conversation reframes the question from 'why won't you run the experiment?' to 'is a 35% lift a plausible effect size?', which answers itself.",
      "The 'experiment everything' philosophy is healthy for teams with high traffic and fast-moving metrics; applied to enterprise B2B products with dozens of accounts and quarterly outcome metrics, it produces a pattern where teams run experiments they cannot possibly learn from and make decisions on statistical noise.",
      "Rigorous evidence collection does not require a randomized experiment — an instrumented rollout with pre-declared success criteria, explicit measurement of the primary metric pre and post, and structured qualitative interviews is a legitimate and often more informative evidence standard for small-N enterprise contexts."
    ]
  },

  // ─────────────────────────────────────────────
  // SCENARIO 09 — The Clickbait Ranking Win (BETA)
  // Theme: Proxy Metric / Metric Gaming
  // Paired with: d05-search-ranking-test
  // ─────────────────────────────────────────────
  {
    id: "s09-clickbait-ranking-win",
    title: "The Clickbait Ranking Win",
    subtitle: "CTR is up 14%. Add-to-cart is flat. Reformulations are climbing. The PM wants to ship.",
    isFree: false,
    industry: "ecommerce",
    difficulty: "analyst",
    theme: "proxy_metric",

    context: {
      company: "Vela",
      product: "B2C e-commerce marketplace — handmade and independent goods, ~$80M GMV",
      team: "Search & Discovery team",
      background: 'Vela deployed a new ML-based search ranking algorithm in an A/B test three weeks ago. The ML model was trained on historical click-through rate data. The PM chose CTR as the primary metric because it was "the training signal and the most direct measure of relevance."\n\nThe experiment ran 21 days on 50% of users. Today is the readout. The PM sent a message at 8am: "CTR is up 14% — that\'s enormous. I\'m drafting the ship announcement."',
      businessPressure: 'The ML team spent a quarter building this model. The Head of Product wants an "AI win" for the roadmap review, which happens on Friday. Engineering has the deployment PR ready to merge. The PM has already briefed the CEO that search improvements are coming.'
    },

    hypothesis: "The ML ranking algorithm will improve search relevance by surfacing more engaging results, increasing CTR and downstream search-driven purchases.",

    experimentDesign: {
      type: "a/b",
      allocation: "50/50",
      runtime: "21 days",
      targetPopulation: "All users who performed at least one search query",
      primaryMetric: "Click-through rate on search results",
      guardrailMetrics: ["Add-to-cart from search", "Query reformulation rate"],
      sampleSizeContext: "~60,000 daily active searchers per arm. 21 days. User-level randomization."
    },

    metricReadout: [
      {
        metric: "Click-through rate on search results",
        type: "primary",
        direction: "up",
        delta: "+14.2%",
        pValue: 0.001,
        confidenceInterval: "[+11.1%, +17.3%]",
        significant: true,
        note: "Highly significant. The ML model substantially increases the proportion of search results that get clicked."
      },
      {
        metric: "Add-to-cart from search (users adding to cart within same search session)",
        type: "guardrail",
        direction: "down",
        delta: "-3.8%",
        pValue: 0.019,
        confidenceInterval: "[-6.9%, -0.7%]",
        significant: true,
        note: "GUARDRAIL BREACH. Users are clicking more results but adding fewer items to cart. The clicks aren't converting to purchase intent."
      },
      {
        metric: "Query reformulation rate (user rewrites query after seeing initial results)",
        type: "guardrail",
        direction: "up",
        delta: "+9.1%",
        pValue: 0.003,
        confidenceInterval: "[+3.2%, +15.0%]",
        significant: true,
        note: "GUARDRAIL BREACH. More users are rewriting their queries after seeing results — a direct signal that the initial results were not satisfying."
      },
      {
        metric: "Search bounce rate (user clicks a result and immediately returns to search)",
        type: "secondary",
        direction: "up",
        delta: "+6.3%",
        pValue: 0.028,
        confidenceInterval: "[+0.7%, +11.9%]",
        significant: true,
        note: "Elevated. Users are clicking results, finding them not what they expected, and returning to search. Consistent with clickbait effect."
      },
      {
        metric: "Revenue per searcher (total GMV from users who searched / users who searched)",
        type: "secondary",
        direction: "down",
        delta: "-2.1%",
        pValue: 0.061,
        confidenceInterval: "[-4.3%, +0.1%]",
        significant: false,
        note: "Trending negative but not significant. The add-to-cart decline and bounce rate increase are consistent with this directional revenue softness."
      }
    ],

    warningFlags: [
      {
        id: "wf-ctr-proxy",
        label: "CTR is the training signal, not the outcome",
        description: "The ML model was trained on CTR. Using CTR as the primary metric tests whether the model learned its training objective — not whether it improves user outcomes. A model that maximizes CTR will get this result even if it degrades purchase quality.",
        severity: "critical"
      },
      {
        id: "wf-reformulation-breach",
        label: "Reformulation rate rising is a search quality failure signal",
        description: "Query reformulation directly indicates that initial results failed the user's intent. Rising reformulation alongside rising CTR means the ML model is surfacing clickable but irrelevant results. Users click, find the wrong thing, and restate their query.",
        severity: "critical"
      },
      {
        id: "wf-cart-breach",
        label: "Add-to-cart breach: clicks aren't converting to intent",
        description: "If the ML model improved result relevance, CTR and add-to-cart should rise together. CTR rising while add-to-cart falls is the signature of clickbait — results that attract attention but don't match the user's actual purchase intent.",
        severity: "critical"
      },
      {
        id: "wf-business-pressure",
        label: "Business pressure on a technically impressive metric",
        description: "The ML team invested a quarter in this model. A 14% CTR lift is a visible number that will be cited in the all-hands. The decision to hold requires naming a technically impressive result as a product failure — which is analytically correct but organizationally difficult.",
        severity: "warning"
      }
    ],

    decisions: [
      {
        id: "ship",
        label: "Ship it — CTR +14% with p < 0.001 is definitive. The guardrail movements are small.",
        description: "CTR is the primary metric and it's up significantly. Ship.",
        score: "junior_miss",
        feedback: "Both guardrails are breached. The add-to-cart decline (-3.8%, p = 0.019) and the reformulation rate increase (+9.1%, p = 0.003) are statistically significant and directionally coherent. They tell the same story: users are clicking more results that don't match their intent, then reformulating. The 14% CTR lift is real — it just doesn't measure what you care about."
      },
      {
        id: "hold_investigate",
        label: "Hold. Both guardrails breach. CTR gain with add-to-cart loss and rising reformulations means the model is surfacing clickbait. Do not ship.",
        description: "The ML model optimized its training objective (CTR) at the cost of actual search quality.",
        score: "senior_ready",
        feedback: "This is the right call. The pattern is coherent: CTR up, add-to-cart down, reformulations up, bounce rate up. The ML model learned to surface listings that get clicks — but the wrong kind. Users click, find irrelevant results, and restate their query. The model optimized its training signal at the cost of the outcome. The decision: don't ship this version. Retrain with downstream quality signals (add-to-cart, purchase) as part of the objective, not just CTR."
      },
      {
        id: "ship_monitor",
        label: "Ship with close post-launch monitoring — the CTR win is real and guardrail movements are within tolerance.",
        description: "Ship and watch the guardrails closely for 30 days post-launch.",
        score: "analyst_ready",
        feedback: "The guardrail breaches are statistically significant and directionally coherent with a quality problem — they're not noise to monitor. Post-launch monitoring doesn't undo a ship decision. Once the ML ranking is deployed to 100% of users, reformulation rates and add-to-cart rates will reflect the same dynamics you're seeing here. 'We'll watch it' is not an analytical response to two pre-committed guardrail breaches."
      },
      {
        id: "retrain",
        label: "Do not ship. Ask the ML team to retrain the model using add-to-cart and purchase as training signals rather than CTR alone.",
        description: "The model is optimizing the wrong objective. Fix the objective function.",
        score: "staff_level",
        feedback: "This is the complete answer. Not only is the ship decision wrong — you're identifying the root cause and the correct fix. The model was trained on CTR, which can be gamed by listings with appealing thumbnails and titles regardless of actual product relevance. Retraining with downstream quality signals (add-to-cart, purchase, session quality) as the training objective will produce a model that optimizes for what users actually want. The 14% CTR lift validates that the model architecture works — it just needs a better objective."
      }
    ],

    idealDecision: "retrain",
    secondBestDecision: "hold_investigate",

    juniorMistake: "Ships on the 14% CTR result. Treats guardrail breaches as minor. Frames the reformulation increase as 'users exploring more results' rather than 'search quality failure.' Is anchored by the ML team investment and the CEO briefing.",

    seniorFlags: [
      "The CTR/add-to-cart divergence is the clearest signal in this readout. When they move in opposite directions, the likely cause is that the ranking is optimizing for clicks rather than intent match. Every senior search analyst knows this pattern.",
      "Reformulation rate is the most honest signal in search quality. A user who rewrites their query is explicitly telling you the results failed. Rising reformulation alongside rising CTR is the definition of a model that learned the wrong objective.",
      "The correct action is not just 'hold' — it's to diagnose why the model is doing this and retrain. The issue is the training objective, not the architecture."
    ],

    staffFlags: [
      "Would have caught this in the design phase by refusing to use CTR as the primary metric for a model trained on CTR. The circular logic is obvious before the experiment runs.",
      "Would have flagged the novelty risk explicitly: users explore new result orderings in week 1. The week-over-week CTR trend should be monitored to see if it's partly a novelty artifact."
    ],

    debrief: 'Let\'s be direct about what happened here.\n\nThe ML model did exactly what it was trained to do: maximize click-through rate. The CTR result is not a mistake — it\'s the model performing correctly on its training objective. The mistake was choosing CTR as both the training signal and the success metric.\n\nWhen the same metric is used to train the model and validate the model, you\'re testing whether the model learned its training objective, not whether it produces good outcomes. That\'s a circular test. Any sufficiently flexible ML model will pass it.\n\nThe guardrail data tells the complete story: users are clicking more results (+14% CTR), finding the wrong things (search bounce rate +6.3%), and giving up and retrying (+9.1% reformulation rate). Add-to-cart is falling (-3.8%). The model learned which listing thumbnails and titles are most compelling — which is not the same as which listings are most relevant to what the user wants to buy.\n\nThe right next step is not "hold and monitor" — it\'s retrain. The model architecture is fine. The objective function is wrong. Add-to-cart and purchase-from-search events need to be part of the training signal. A model that is rewarded for generating clicks that convert will learn fundamentally different ranking patterns than one rewarded only for generating clicks.\n\nThere\'s an organizational challenge here. Telling the ML team that their quarter\'s work needs to be retrained is difficult, especially with a 14% CTR lift visible in the readout. Your job as an analyst is to make the case clearly: the lift is real, the problem is the objective, and the fix is well-defined. That\'s actually a better outcome than "the model doesn\'t work."',

    interviewTakeaway: "When a model is trained on a proxy metric and validated on the same metric, the test confirms the model achieved its training objective — not that it's good for users. CTR and search quality diverge when the model learns to surface clickable but irrelevant results. Guardrail metrics (reformulation rate, add-to-cart) break the circularity.",

    relatedConcepts: ["proxy metric", "metric gaming", "guardrail metric", "novelty effect", "multiple testing"],
    scenarioFamily: "proxy_metric",
    tags: ["search ranking", "ML model evaluation", "CTR", "proxy metric", "clickbait"]
  },

  // ─────────────────────────────────────────────
  // SCENARIO 10 — The Push Open Rate Trap (BETA)
  // Theme: Proxy Metric / User Trust Guardrail
  // Paired with: d06-notification-timing-test
  // ─────────────────────────────────────────────
  {
    id: "s10-push-open-rate-trap",
    title: "The Push Open Rate Trap",
    subtitle: "Notification opens are up 22%. Opt-outs are climbing. Uninstalls are climbing. The PM says the opens prove it works.",
    isFree: false,
    industry: "mobile",
    difficulty: "analyst",
    theme: "proxy_metric",

    context: {
      company: "Orion",
      product: "Consumer habit and task tracking app — 2.1M MAU, notification-driven re-engagement",
      team: "Growth & Engagement team",
      background: 'Orion deployed a test of ML-personalized notification timing two weeks ago. The ML model uses each user\'s historical open patterns to send at their highest-engagement time of day, replacing the previous fixed 8am/12pm/7pm schedule.\n\nThe PM pre-specified notification open rate as the primary metric. "If people are opening the notification, the timing is working." Results arrived this morning.',
      businessPressure: 'DAU/MAU has been declining for two quarters. The Head of Growth has this experiment on the leadership dashboard. The PM has pre-booked a "ship day" — three days from now — and has told the team to be ready to deploy. The Head of Growth wants to announce a re-engagement win in the all-hands.'
    },

    hypothesis: "ML-personalized notification timing will increase notification open rate by reaching users at their most receptive moments.",

    experimentDesign: {
      type: "a/b",
      allocation: "50/50",
      runtime: "21 days",
      targetPopulation: "All users with push notifications enabled (excluding users signed up <7 days)",
      primaryMetric: "Notification open rate",
      guardrailMetrics: ["Notification opt-out rate", "14-day uninstall rate"],
      sampleSizeContext: "~310,000 users per arm. User-level randomization. 1 notification per user per day in both arms."
    },

    metricReadout: [
      {
        metric: "Notification open rate",
        type: "primary",
        direction: "up",
        delta: "+22.4%",
        pValue: 0.001,
        confidenceInterval: "[+19.1%, +25.7%]",
        significant: true,
        note: "Highly significant. The ML timing model dramatically increases the proportion of notifications opened."
      },
      {
        metric: "7-day active session rate (users with ≥1 session in the 7 days following notification)",
        type: "secondary",
        direction: "up",
        delta: "+2.1%",
        pValue: 0.11,
        confidenceInterval: "[-0.5%, +4.7%]",
        significant: false,
        note: "Directionally positive but not significant. Notifications are being opened more, but the session uplift is marginal and noisy."
      },
      {
        metric: "Notification opt-out rate",
        type: "guardrail",
        direction: "up",
        delta: "+18.3%",
        pValue: 0.001,
        confidenceInterval: "[+12.7%, +23.9%]",
        significant: true,
        note: "GUARDRAIL BREACH. Users in treatment are opting out of notifications at a significantly higher rate. Once opted out, they cannot be re-engaged through this channel."
      },
      {
        metric: "14-day uninstall rate",
        type: "guardrail",
        direction: "up",
        delta: "+8.7%",
        pValue: 0.024,
        confidenceInterval: "[+1.2%, +16.2%]",
        significant: true,
        note: "GUARDRAIL BREACH. Treatment users are uninstalling at a significantly elevated rate. CI is wide but clearly above zero."
      },
      {
        metric: "Task completion per notification-driven session",
        type: "secondary",
        direction: "down",
        delta: "-4.2%",
        pValue: 0.038,
        confidenceInterval: "[-8.2%, -0.2%]",
        significant: true,
        note: "Significant. Users opened notifications more but completed fewer tasks per session entered from a notification. Suggests the ML model is catching users at moments when they open the notification but aren't actually ready to engage."
      }
    ],

    warningFlags: [
      {
        id: "wf-optin-breach",
        label: "Opt-out rate breach: irreversible channel loss",
        description: "An 18.3% relative increase in notification opt-outs is not a minor guardrail nudge — it's a signal that the ML timing model is making notifications feel intrusive at scale. Once a user opts out, the notification re-engagement channel is permanently closed for them.",
        severity: "critical"
      },
      {
        id: "wf-uninstall-breach",
        label: "Uninstall rate breach: elevated churn",
        description: "An 8.7% relative increase in 14-day uninstalls is a severe long-term user quality signal. Personalized timing may be sending at moments that feel surveillance-like (e.g., late at night, early morning) for some users.",
        severity: "critical"
      },
      {
        id: "wf-session-quality",
        label: "Task completion per notification session declining",
        description: "The ML model finds users when they will open a notification — not when they're ready to actually use the app. Opening a notification from the gym locker room is not the same as opening it at a desk with 10 minutes to complete a task.",
        severity: "warning"
      },
      {
        id: "wf-proxy-trap",
        label: "Open rate is the ML training signal — not the user outcome",
        description: "The model was trained to maximize opens. Using open rate to validate it confirms the training objective was achieved, not that users benefit. The session and opt-out data reveal the divergence.",
        severity: "critical"
      }
    ],

    decisions: [
      {
        id: "ship",
        label: "Ship it — open rate +22% with tight CI. Guardrail movements are within acceptable range.",
        description: "The primary metric is the win condition. Ship.",
        score: "junior_miss",
        feedback: "Both guardrails are statistically significant breaches. The opt-out rate increase (+18.3%, p < 0.001) and uninstall rate increase (+8.7%, p = 0.024) are not marginal — they are significant, directionally coherent harm signals. 'Within acceptable range' would need to be defined before the test. These exceed any reasonable pre-committed threshold."
      },
      {
        id: "hold",
        label: "Hold. Both guardrails are significantly breached. High opens from a model that drives opt-outs and uninstalls is not an engagement win.",
        description: "The model is reaching users at non-receptive moments, driving notification fatigue at scale.",
        score: "senior_ready",
        feedback: "Correct. The guardrail pattern tells a coherent story: the ML model sends notifications when users are most likely to physically open them — but not when they're ready to engage. The result: more opens, same or worse sessions, and dramatically more opt-outs and uninstalls. The model is optimizing for a fleeting interaction that damages the long-term channel. Pre-committed guardrails are blocking conditions. Do not ship."
      },
      {
        id: "ship_segment",
        label: "Ship to users with healthy open history and exclude users showing early opt-out signals.",
        description: "Target only the users for whom the model is working.",
        score: "analyst_ready",
        feedback: "Post-hoc segmentation based on experiment outcomes is selection bias. You don't know which users 'work well' for the model without seeing the data — and seeing the data means the segment is already defined by the outcome. Additionally, opt-outs have already accumulated in the 21-day test window and cannot be reversed. The harm has already started."
      },
      {
        id: "retrain_objective",
        label: "Do not ship. Retrain the ML model with task completion or session quality as the training objective, not raw open rate.",
        description: "The model optimized opens at the cost of engagement quality and channel health.",
        score: "staff_level",
        feedback: "This is the complete answer. The model found when users will open notifications — which is different from when they'll productively engage with the app. A model trained on task completion or session depth after notification would learn different timing patterns: times when users are actually ready to act. The current model is technically successful (maximized its objective) but practically harmful (the objective was wrong). This is the same issue as the search ranking case — the fix is the training objective, not the architecture."
      }
    ],

    idealDecision: "retrain_objective",
    secondBestDecision: "hold",

    juniorMistake: "Ships on the 22% open rate result. Dismisses guardrail breaches as 'we can monitor post-launch.' Anchored by the Head of Growth's ship timeline and the visible metric win.",

    seniorFlags: [
      "An 18% opt-out increase is catastrophic channel damage if shipped at scale. The opt-out rate in the experiment reflects ~310k users. At full deployment, that's ~600k users on a path to opting out. Channel damage is the most expensive outcome in push notification strategy.",
      "Task completion per notification session declining while opens increase is the clearest possible evidence that the model is optimizing momentary attention, not productive engagement. These two metrics moving in opposite directions define the proxy metric trap.",
      "The correct framing to leadership: 'The model architecture works. The training objective was wrong. Retraining with session quality signals will likely outperform this version significantly.'"
    ],

    staffFlags: [
      "Would have caught this in design by refusing to accept open rate as the primary metric for a model trained on open rate. The proxy trap is visible before the data exists.",
      "Would have flagged that opt-out harms are irreversible and asymmetric — they compound over time. A 21-day test with 18% elevated opt-outs is already meaningful channel damage that does not undo when the feature is rolled back."
    ],

    debrief: 'The open rate result is exactly what you\'d expect from a model trained on open rate. The model found when users pick up their phones and are likely to tap a notification. That is not the same as finding when they\'re ready to engage with your product.\n\nThe divergence between opens and task completion is the most important signal in this readout. If the model had found genuinely receptive moments — times when users wanted to work on their tasks — you\'d see opens AND completions rise. Opens rising while completions fall means the model is catching users in distracted or passive moments. They tap the notification out of habit or curiosity and don\'t actually do anything.\n\nThe opt-out and uninstall numbers are the most serious findings here. An 18% opt-out increase is not a guardrail nudge — it\'s evidence that the personalized timing is making notifications feel intrusive to a significant portion of users. For some, this is probably because the model sends at unusual times (very early morning, very late night, during commutes) that feel surveillance-like. Once opted out, those users cannot be re-engaged through push notifications — the channel is permanently closed.\n\nWhat should happen next: don\'t ship this model. Retrain it with downstream engagement signals — task completions, session depth, D7 retention from notification entry — as the training objective. A model that learns to send when users will engage rather than when they\'ll tap will produce very different timing patterns and, likely, much better actual outcomes.\n\nThe good news for the ML team: the architecture is fine. The objective function is wrong. That\'s a fixable problem, and a model trained on the right signal will be genuinely more valuable than this one.',

    interviewTakeaway: "Notification open rate is a proxy for user receptiveness — not for productive engagement. A model that maximizes opens by finding when users will tap a notification teaches an entirely different skill than finding when users are ready to use the product. Opt-out and uninstall rates are the guardrails that reveal the difference.",

    relatedConcepts: ["proxy metric", "guardrail metric", "notification opt-out", "user trust", "ML training objective"],
    scenarioFamily: "proxy_metric",
    tags: ["push notifications", "ML timing model", "open rate", "opt-out", "engagement"]
  },

  // ─────────────────────────────────────────────
  // SCENARIO 11 — The Seller Speed Spillover (BETA)
  // Theme: Marketplace Interference / SUTVA
  // Paired with: d07-seller-incentive-test
  // ─────────────────────────────────────────────
  {
    id: "s11-seller-speed-spillover",
    title: "The Seller Speed Spillover",
    subtitle: "Treatment sellers are converting 19% better. Control sellers are converting 11% worse. The PM wants to ship based on the treatment result.",
    isFree: false,
    industry: "marketplace",
    difficulty: "senior",
    theme: "sutva",

    context: {
      company: "Crafted",
      product: "Two-sided handmade goods marketplace — ~40,000 active sellers, ~850,000 monthly buyers",
      team: "Seller Success team",
      background: 'Crafted ran a 6-week A/B test of the Fast Responder program: a badge and algorithmic search boost for sellers who maintain a <2h median response time. 50% of eligible sellers received the program (treatment); 50% did not (control). Buyers were not randomized — all buyers could see and purchase from both treatment and control sellers.\n\nThe Seller Success team is presenting results today. The PM leads with: "Treatment sellers are converting 19% better than pre-experiment. This is our biggest seller program result ever."',
      businessPressure: 'The Head of Marketplace wants to announce this program at the quarterly seller summit next month. The Seller Success team has been building this for two months. The VP of GMV growth is already calling it a win on Slack.'
    },

    hypothesis: "The Fast Responder badge and algorithmic boost will improve platform-level buyer-to-purchase conversion by incentivizing faster seller response times.",

    experimentDesign: {
      type: "a/b",
      allocation: "50/50 (seller-level randomization)",
      runtime: "42 days",
      targetPopulation: "Active sellers with 5+ transactions in past 90 days",
      primaryMetric: "Treatment seller conversion rate",
      guardrailMetrics: ["Control seller conversion rate", "Order cancellation rate"],
      sampleSizeContext: "~20,000 sellers per arm. Buyer-level metrics computed from all buyer interactions with each seller arm."
    },

    metricReadout: [
      {
        metric: "Treatment seller conversion rate (buyers who purchased from treatment sellers / buyers who contacted treatment sellers)",
        type: "primary",
        direction: "up",
        delta: "+19.2%",
        pValue: 0.001,
        confidenceInterval: "[+14.8%, +23.6%]",
        significant: true,
        note: "Treatment sellers are converting significantly more of the buyers they interact with."
      },
      {
        metric: "Control seller conversion rate (buyers who purchased from control sellers / buyers who contacted control sellers)",
        type: "guardrail",
        direction: "down",
        delta: "-11.4%",
        pValue: 0.002,
        confidenceInterval: "[-17.8%, -5.0%]",
        significant: true,
        note: "GUARDRAIL BREACH. Control sellers are converting significantly fewer buyers. This is the demand displacement signal."
      },
      {
        metric: "Platform-level buyer conversion rate (total purchases / total buyer inquiries, all sellers combined)",
        type: "secondary",
        direction: "up",
        delta: "+2.8%",
        pValue: 0.18,
        confidenceInterval: "[-1.3%, +6.9%]",
        significant: false,
        note: "Platform-level conversion is nearly flat and not significant. The treatment seller lift and control seller decline partially cancel out."
      },
      {
        metric: "Seller response time (median hours — treatment arm)",
        type: "secondary",
        direction: "down",
        delta: "-42%",
        pValue: 0.001,
        confidenceInterval: "[-49%, -35%]",
        significant: true,
        note: "The incentive worked: treatment sellers responded dramatically faster. Mechanism is confirmed."
      },
      {
        metric: "Order cancellation rate",
        type: "guardrail",
        direction: "up",
        delta: "+4.1%",
        pValue: 0.041,
        confidenceInterval: "[+0.2%, +8.0%]",
        significant: true,
        note: "GUARDRAIL BREACH. Cancellation rate is slightly elevated, possibly from sellers sending fast initial responses and then struggling to fulfill orders that were accepted impulsively."
      },
      {
        metric: "Buyer inquiry volume per seller (treatment vs. control)",
        type: "secondary",
        direction: "up",
        delta: "+28.1% (treatment vs. control)",
        pValue: 0.001,
        confidenceInterval: "[+22%, +34%]",
        significant: true,
        note: "Buyers are preferentially sending inquiries to Fast Responder sellers. This is the demand displacement mechanism — buyers are routing away from control sellers toward treatment sellers."
      }
    ],

    warningFlags: [
      {
        id: "wf-sutva",
        label: "SUTVA violation: buyers contact both arms — demand displacement is the mechanism",
        description: "Buyers in this marketplace contact multiple sellers simultaneously for the same purchase. Treatment sellers converting better doesn't mean new buyers are appearing — it means treatment sellers are winning buyers who might otherwise have purchased from control sellers. The +28% inquiry routing to treatment sellers quantifies the displacement.",
        severity: "critical"
      },
      {
        id: "wf-control-decline",
        label: "Control seller conversion declining is the demand displacement signal",
        description: "A genuine platform-level improvement would show treatment sellers lifting without control sellers declining. Control sellers declining while treatment sellers rise is the definition of zero-sum reallocation in a shared buyer pool.",
        severity: "critical"
      },
      {
        id: "wf-platform-flat",
        label: "Platform-level conversion is flat — the aggregate tells the truth",
        description: "Platform-level buyer conversion (+2.8%, p = 0.18) is not significant. This is the correct metric for evaluating whether the program adds GMV to the platform or merely redistributes it.",
        severity: "critical"
      },
      {
        id: "wf-cancellation",
        label: "Cancellation rate increase suggests quality gaming",
        description: "Sellers responding faster may be accepting orders before properly evaluating fit, leading to higher cancellations. Fast response without quality fulfillment is a hollow win.",
        severity: "warning"
      }
    ],

    decisions: [
      {
        id: "ship",
        label: "Ship it — treatment sellers improved 19%. This is a strong seller-level result.",
        description: "Treatment sellers show significant improvement. Ship the program.",
        score: "junior_miss",
        feedback: "The +19% is a demand displacement effect, not a platform GMV improvement. Treatment sellers gained conversions because buyers routed away from control sellers — the buyer inquiry routing data confirms this (+28% more inquiries to treatment sellers). When all sellers are in treatment, there are no control sellers to displace demand from. The net effect at full deployment would approximate the flat platform-level result you see now."
      },
      {
        id: "hold_investigate",
        label: "Hold. The design has a structural interference problem. Treatment lifts and control declines simultaneously — the program redistributes demand, it doesn't create it.",
        description: "Seller-level A/B cannot distinguish additive GMV from demand reallocation in a marketplace.",
        score: "senior_ready",
        feedback: "Correct. The evidence for demand displacement is clear: control conversion falls significantly, inquiry routing shifts toward treatment sellers, and platform-level conversion is flat. The SUTVA violation makes the treatment seller result uninterpretable as a platform-level effect. The program needs to be retested with a valid design (geographic holdout) before the ship decision can be made."
      },
      {
        id: "ship_partial",
        label: "Ship to 25% of sellers and monitor for cancellation and control seller impact.",
        description: "Partial rollout reduces risk while allowing learning.",
        score: "analyst_ready",
        feedback: "Partial rollout doesn't fix the design problem. At 25% of sellers in the program, the same SUTVA violation exists — buyers route toward the 25% with badges, control sellers still face demand displacement. The cancellation guardrail is already breached. A partial rollout with monitoring doesn't change the structural interpretation issue."
      },
      {
        id: "redesign_geo",
        label: "Do not ship. Recommend rerunning with geographic holdout design — randomize markets, not individual sellers, so supply and demand are isolated together.",
        description: "The valid design for two-sided marketplace experiments.",
        score: "staff_level",
        feedback: "This is the complete answer. Geographic holdout is the only design that can measure a true platform-level effect in this context. Within a treatment market, all buyers interact only with treatment sellers, and vice versa. There is no cross-market demand displacement. The market-level conversion rate is an unconfounded estimate of the program's platform-level value. Seller-level A/B is structurally invalid for this type of experiment, and no amount of monitoring or partial rollout fixes that."
      }
    ],

    idealDecision: "redesign_geo",
    secondBestDecision: "hold_investigate",

    juniorMistake: "Ships on the treatment seller lift. Does not check control seller performance. Treats the +19% as a platform-level win. Is anchored by the seller summit announcement timeline.",

    seniorFlags: [
      "The treatment lift + control decline pattern is the definitive diagnostic for demand displacement in marketplace A/B tests. If you see it, the design is structurally invalid for measuring platform-level effects.",
      "The correct framing: the incentive mechanism works (sellers respond faster, treatment conversion rises), but the experiment design can't tell you if the program adds GMV or just redistributes it. That's a design problem, not an outcome problem.",
      "Geographic holdout is the only valid design here. Seller-level A/B in two-sided markets with shared buyer pools is a known structural failure mode."
    ],

    staffFlags: [
      "Would have caught this in design by refusing seller-level randomization for a marketplace experiment. The SUTVA violation is predictable before the experiment runs.",
      "Would have noted that the demand displacement effect would be larger in high-density markets (where buyers have many seller options) than in thin markets. The aggregate result averages across this heterogeneity."
    ],

    debrief: 'Let\'s talk about what this data actually shows.\n\nThe treatment sellers improved. The program worked exactly as designed: sellers responded faster, and buyers preferred them. The mechanism is validated. That part is not in question.\n\nThe problem is the design. Buyers in this marketplace contact multiple sellers when considering a purchase. When 50% of sellers have the Fast Responder badge and an algorithmic boost, buyers route their inquiries toward them. The treatment sellers gain conversions — but some of those conversions came from buyers who would have purchased from control sellers in the absence of the program. The control seller decline confirms this directly: -11.4% conversion, p = 0.002.\n\nWhen all sellers are in the program, there are no control sellers to displace demand from. The steady-state platform effect is approximately what you see in the platform-level metric: +2.8%, p = 0.18. Not significant.\n\nThis is not a reason to abandon the program. It\'s a reason to test it correctly. Geographic holdout design isolates treatment and control markets so that within each market, all buyers interact with all sellers under the same conditions. The market-level conversion rate in treatment markets vs. control markets gives you an unconfounded platform-level estimate.\n\nThe honest answer for the seller summit: "The mechanism works — our sellers respond faster, and buyers prefer them. We found a design limitation in how we tested platform-level impact and we\'re running the right measurement now. We\'ll have a definitive answer in 6 weeks." That\'s not a failure. That\'s credible analytics.',

    interviewTakeaway: "Seller-level A/B in two-sided marketplaces creates demand displacement — treatment sellers win conversions from buyers who route away from control sellers, not from new demand. The only valid platform-level test is geographic holdout, where treatment and control markets have isolated supply and demand pools.",

    relatedConcepts: ["SUTVA", "marketplace interference", "demand displacement", "geographic holdout", "two-sided markets"],
    scenarioFamily: "sutva",
    tags: ["marketplace", "seller incentive", "SUTVA", "demand displacement", "geographic holdout"]
  },

  // ─────────────────────────────────────────────
  // SCENARIO 12 — The Checklist Completion Illusion (BETA)
  // Theme: Proxy Metric / Activation Measurement
  // Paired with: d08-onboarding-checklist-test
  // ─────────────────────────────────────────────
  {
    id: "s12-checklist-completion-illusion",
    title: "The Checklist Completion Illusion",
    subtitle: "Checklist completion is up 47%. Week-1 meaningful activation is flat. 14-day retention is slightly worse.",
    isFree: false,
    industry: "saas",
    difficulty: "analyst",
    theme: "proxy_metric",

    context: {
      company: "Loopwise",
      product: "B2B project management SaaS — 14k paying accounts",
      team: "Activation & Onboarding team",
      background: 'Loopwise added a 7-step in-product onboarding checklist for new users six weeks ago. Steps include: creating a project, adding a task, setting a due date, inviting a teammate, using a template, enabling notifications, and setting personal preferences.\n\nThe experiment ran for 6 weeks with account-level randomization. The PM pre-specified checklist completion rate as the primary success metric. "If users complete the checklist, they know how to use the product."\n\nResults arrived this morning. The PM is presenting to the Head of Product in an hour.',
      businessPressure: 'The Head of Product has the onboarding checklist as a Q3 priority. The Activation team has been building it for 2 months. The PM\'s presentation already has a "ship recommendation" slide prepared. The Head of Product has told the team that "we need an activation win this quarter."'
    },

    hypothesis: "A structured onboarding checklist will guide new users to core value faster, improving week-1 activation and 30-day retention.",

    experimentDesign: {
      type: "a/b",
      allocation: "50/50 (account-level)",
      runtime: "42 days",
      targetPopulation: "New accounts in first 7 days (excluding staff and demo accounts)",
      primaryMetric: "Checklist completion rate",
      guardrailMetrics: ["14-day account retention", "Support ticket rate in first 7 days"],
      sampleSizeContext: "~660 accounts per arm over 42 days (~220 new accounts/week). Powered to detect ~7pp activation change at 80% power."
    },

    metricReadout: [
      {
        metric: "Checklist completion rate (accounts completing all 7 steps / treatment accounts)",
        type: "primary",
        direction: "up",
        delta: "+47pp (from 0% baseline to 47% completion)",
        pValue: 0.001,
        confidenceInterval: "[+43pp, +51pp]",
        significant: true,
        note: "Highly significant. 47% of treatment accounts completed all 7 checklist steps. Control has no checklist, so baseline is 0%."
      },
      {
        metric: "Week-1 meaningful activation (created project + added task + invited teammate within 7 days)",
        type: "secondary",
        direction: "up",
        delta: "+1.9pp (38.2% → 40.1%)",
        pValue: 0.28,
        confidenceInterval: "[-1.6pp, +5.4pp]",
        significant: false,
        note: "Directionally positive but not significant. The experiment is near the power limit for detecting this effect size. The pre-specified MDE was 7pp — the observed effect is well below that."
      },
      {
        metric: "14-day account retention",
        type: "guardrail",
        direction: "down",
        delta: "-2.4pp",
        pValue: 0.09,
        confidenceInterval: "[-5.2pp, +0.4pp]",
        significant: false,
        note: "Trending negative and approaching significance. The CI lower bound at -5.2pp is concerning — the experiment may be underpowered to detect a real retention decline.",
      },
      {
        metric: "Support ticket rate in first 7 days",
        type: "guardrail",
        direction: "up",
        delta: "+11.8%",
        pValue: 0.031,
        confidenceInterval: "[+1.1%, +22.5%]",
        significant: true,
        note: "GUARDRAIL BREACH. Treatment accounts are creating significantly more support tickets in the first week. CI is wide but significant."
      },
      {
        metric: "Checklist completion time (average minutes to complete all 7 steps)",
        type: "secondary",
        direction: "neutral",
        delta: "Median: 4.2 minutes",
        pValue: null,
        confidenceInterval: null,
        significant: false,
        note: "Descriptive only. The median completion time for all 7 checklist steps is 4.2 minutes — approximately 36 seconds per step. This speed suggests many completions are click-throughs, not genuine engagement."
      },
      {
        metric: "Week-2 product usage depth (features used in week 2 among week-1 activators)",
        type: "secondary",
        direction: "down",
        delta: "-6.3%",
        pValue: 0.048,
        confidenceInterval: "[-12.4%, -0.2%]",
        significant: true,
        note: "Significant. Treatment accounts that activated in week 1 show lower product depth in week 2 — suggesting checklist completion drove surface-level actions that didn't translate to genuine engagement."
      }
    ],

    warningFlags: [
      {
        id: "wf-completion-proxy",
        label: "Checklist completion is a gameable proxy — 4.2 minute median completion is the signal",
        description: "The average completion time of 4.2 minutes across 7 steps (36 seconds per step) is not genuine product engagement. Users are completing the checklist to clear the UI element, not to learn the product. This is the completion psychology effect — progress bars motivate task completion independent of actual value.",
        severity: "critical"
      },
      {
        id: "wf-activation-flat",
        label: "Meaningful activation is flat — the outcome that matters is not moving",
        description: "Week-1 meaningful activation (+1.9pp, p=0.28) is below the MDE and not significant. The checklist improved completion rate without improving the product behaviors that predict retention.",
        severity: "critical"
      },
      {
        id: "wf-week2-depth",
        label: "Week-2 product depth declining among activators — quality signal",
        description: "Treatment accounts that activated show lower week-2 depth. This is the checklist gamification effect: users went through the setup motions, 'activated', and then returned to shallow engagement because the core value wasn't genuinely internalized.",
        severity: "critical"
      },
      {
        id: "wf-retention-trending",
        label: "14-day retention trending negative with wide CI — possible underpowered harm",
        description: "The retention guardrail is at p=0.09 with lower bound -5.2pp. At n=660 accounts/arm, this experiment may be underpowered to detect a real retention decline. The direction and the support ticket breach both suggest the checklist may be creating friction, not value.",
        severity: "warning"
      }
    ],

    decisions: [
      {
        id: "ship",
        label: "Ship it — checklist completion is up 47pp and activation is trending positive.",
        description: "Large completion lift with positive activation trend. Ship.",
        score: "junior_miss",
        feedback: "Checklist completion is not an outcome — it's a mechanism metric. The pre-specified success condition should have been meaningful activation, not checklist completion. Completion +47pp with no checklist in control is not a comparison — it's trivially true that more treatment users completed a checklist that doesn't exist in control. The meaningful activation result is not significant, week-2 depth is declining, and support tickets are significantly elevated. The evidence does not support shipping."
      },
      {
        id: "hold_redesign",
        label: "Hold. Checklist completion is the wrong metric. Meaningful activation didn't move. Week-2 depth declined. The checklist may be creating friction without delivering value.",
        description: "Revisit the checklist design to focus on genuine value delivery, not UI completion.",
        score: "senior_ready",
        feedback: "Correct. The data pattern is: high completion, flat activation, declining depth, elevated support tickets. This is the checklist gamification failure mode — users complete it to clear the interface without genuinely engaging with the product. The 4.2-minute median completion time confirms this. A checklist that takes 4 minutes to complete and doesn't improve meaningful activation needs to be redesigned around the specific behaviors that drive retention, not around generic setup steps."
      },
      {
        id: "ship_monitor",
        label: "Ship with retention monitoring. The activation trend is positive and the retention decline is not significant.",
        description: "Directionally positive — ship and confirm retention doesn't worsen.",
        score: "analyst_ready",
        feedback: "The retention guardrail at p=0.09 with lower bound -5.2pp is concerning, not reassuring. At this sample size, p=0.09 may reflect genuine underpowering rather than a null effect. Shipping on 'not significant' when the experiment is near its power limit and the direction is negative is accepting a real risk. The support ticket breach is significant and unexplained. 'Monitor retention post-launch' doesn't retroactively fix shipped harm."
      },
      {
        id: "redesign",
        label: "Do not ship this version. Redesign the checklist to focus on the 3 behaviors that predict retention: create project, add task, invite teammate. Remove gamification steps that don't drive real activation.",
        description: "The checklist structure is the problem — not the concept.",
        score: "staff_level",
        feedback: "This is the complete response. The checklist concept is sound — guided onboarding can improve activation. The execution is wrong: 7 steps including 'enable notifications' and 'set personal preferences' are low-value setup actions that complete quickly and leave no behavioral residue. The redesigned checklist should include only the 3 actions that Loopwise data shows predict 30-day retention. Every step should require genuine product engagement, not a settings toggle. This version of the checklist is teaching users to clear a progress bar."
      }
    ],

    idealDecision: "redesign",
    secondBestDecision: "hold_redesign",

    juniorMistake: "Ships on the 47pp completion lift. Treats the positive activation trend as a win. Doesn't investigate the 4.2-minute median completion time or the week-2 depth decline. Anchored by the 'activation win this quarter' framing.",

    seniorFlags: [
      "The 4.2-minute median completion time is the smoking gun. 7 steps in 4 minutes is not product learning — it's UI clearing. If users were genuinely engaging with each step (creating a real project, adding a real task, actually inviting a colleague), this would take 20+ minutes per account.",
      "The correct comparison for checklist completion is not treatment vs. control — it's completion rate among treatment accounts vs. meaningful activation rate in the same group. If 47% complete the checklist but only 40% achieve meaningful activation, some completers are not actually activating. That's the quality gap.",
      "Week-2 depth declining among week-1 activators is the most diagnostic signal. These are accounts that 'passed' the activation threshold — but their subsequent depth is lower in treatment than control. The checklist directed them through motions that didn't create product habits."
    ],

    staffFlags: [
      "Would have caught this in design by refusing checklist completion as the primary metric. The completion vs. activation gap is predictable before the experiment runs.",
      "Would have added a checklist quality metric: of accounts that completed the checklist, what fraction also achieved meaningful activation? If this rate is lower in treatment than the base activation rate in control, the checklist is actively creating false positives."
    ],

    debrief: 'The 47-point checklist completion lift is real, and it means nothing.\n\nHere\'s why: the control group has no checklist, so the baseline is 0%. Any improvement from 0% to any positive number is a trivially true result. The comparison isn\'t "47% completed vs. some other completion rate" — it\'s "47% completed a set of arbitrary setup steps vs. 0% who completed those same steps in a group that never saw them." That tells you nothing about value.\n\nThe number that matters is week-1 meaningful activation: +1.9pp, not significant. The checklist improved completion of setup steps without improving the behaviors that actually predict whether a user will still be in the product in 30 days.\n\nThe 4.2-minute median completion time is the tell. Seven steps in four minutes is not learning to use a project management tool — it\'s clicking through a setup wizard. Users are completing the checklist to make it go away. "Enable notifications" and "set personal preferences" take about 8 seconds each. "Using a template" might take 30 seconds if the user just clicks the first template they see. None of these are the same as actually creating a project you care about, adding tasks you need to track, and inviting a colleague who will depend on the tool.\n\nThe week-2 depth decline among week-1 activators is the most diagnostic signal in this readout. These are accounts that passed the activation threshold — but they\'re using the product less deeply in week 2 than their counterparts in control. The checklist directed them through surface-level actions that didn\'t create the product habits that drive retention.\n\nWhat should happen: don\'t ship this. Redesign the checklist to contain only the 3 steps that Loopwise data shows predict 30-day retention — and make each step require genuine product engagement, not a settings toggle. The onboarding checklist as a concept is sound. This specific implementation is teaching users to complete a progress bar.',

    interviewTakeaway: "Checklist completion is a gameable proxy for activation. Completion psychology (people like to clear progress bars) drives step completion independent of product value. The correct activation metric is the specific set of durable behaviors that predict retention — not task completion in a guided setup flow.",

    relatedConcepts: ["proxy metric", "activation", "retention", "gamification effect", "checklist gaming"],
    scenarioFamily: "proxy_metric",
    tags: ["onboarding", "activation", "checklist", "SaaS", "B2B", "proxy metric"]
  },

  // ─────────────────────────────────────────────
  // SCENARIO 17 — The CUPED Shortcut
  // Theme: cuped_variance
  // ─────────────────────────────────────────────
  {
    id: 's17-cuped-shortcut',
    title: 'The CUPED Shortcut',
    subtitle: 'Raw result was p=0.08. CUPED made it p=0.02. Someone just asked if that\'s valid.',
    isFree: false,
    industry: 'ecommerce',
    difficulty: 'senior',
    theme: 'cuped_variance',

    context: {
      company: 'Fieldstone Commerce',
      product: 'Direct-to-consumer outdoor gear e-commerce — $120M ARR, 800K monthly active buyers',
      team: 'Experimentation Platform team',
      background: 'Fieldstone ran a 21-day checkout flow experiment testing a new one-page checkout (treatment) versus the existing multi-step flow (control). The primary metric was order completion rate. The raw result came back p=0.08 — marginal, not significant. The experiment platform team applied CUPED using pre-experiment purchase rate (30-day window before experiment start) as the covariate. After adjustment, the reported p-value dropped to 0.02 and the team shipped.\n\nThree weeks post-launch, a Staff DS on the Data Science Review Board is questioning the adjustment. She pulled the covariate correlation and it\'s r=0.21 between pre-experiment purchase rate and order completion rate during the experiment. The CUPED adjustment was applied. The feature is live.',
      businessPressure: 'The feature has been live for three weeks. Rolling it back would mean reverting a checkout redesign that engineering spent six weeks on. The PM is citing the p=0.02 in the Q2 wins deck. The Data Science Review Board meeting is tomorrow.'
    },

    hypothesis: 'A one-page checkout flow will reduce drop-off and increase order completion rate compared to the existing multi-step flow.',

    experimentDesign: {
      type: 'a/b',
      allocation: '50/50',
      runtime: '21 days',
      targetPopulation: 'All users who reached the checkout page, excluding first-time visitors with no purchase history',
      primaryMetric: 'Order completion rate (CUPED-adjusted)',
      guardrailMetrics: ['Revenue per session', 'Support contact rate'],
      sampleSizeContext: '~45,000 users per arm. Pre-experiment covariate: 30-day purchase rate before experiment start. Reported CUPED-adjusted p=0.02, raw p=0.08.'
    },

    metricReadout: [
      {
        metric: 'Order completion rate (raw)',
        type: 'primary',
        direction: 'up',
        delta: '+1.1pp (12.1% → 13.2%)',
        pValue: 0.08,
        confidenceInterval: '[-0.1pp, +2.3pp]',
        significant: false,
        note: 'Raw result is not significant at α=0.05. CI crosses zero.'
      },
      {
        metric: 'Order completion rate (CUPED-adjusted)',
        type: 'primary',
        direction: 'up',
        delta: '+1.1pp adjusted',
        pValue: 0.02,
        confidenceInterval: '[+0.2pp, +2.0pp]',
        significant: true,
        note: 'CUPED-adjusted result. The point estimate is identical — variance reduction narrowed the CI and shifted the p-value below 0.05. Covariate: 30-day pre-experiment purchase rate.'
      },
      {
        metric: 'Revenue per session',
        type: 'guardrail',
        direction: 'neutral',
        delta: '-0.4%',
        pValue: 0.61,
        confidenceInterval: '[-2.1%, +1.3%]',
        significant: false,
        note: 'PASS. No significant revenue impact.'
      },
      {
        metric: 'Support contact rate',
        type: 'guardrail',
        direction: 'up',
        delta: '+4.2%',
        pValue: 0.19,
        confidenceInterval: '[-2.1%, +10.5%]',
        significant: false,
        note: 'PASS. Not significant, but directionally worth watching.'
      },
      {
        metric: 'Covariate-outcome correlation (r)',
        type: 'diagnostic',
        direction: 'neutral',
        delta: 'r=0.21',
        pValue: null,
        confidenceInterval: null,
        significant: false,
        note: 'The correlation between the CUPED covariate (pre-experiment purchase rate) and the outcome metric (order completion rate during experiment) is r=0.21. CUPED variance reduction is proportional to r². At r=0.21, the theoretical variance reduction is approximately 4.4% — negligible. This is the number that determines whether the CUPED adjustment was meaningful.'
      }
    ],

    warningFlags: [
      {
        id: 'wf-low-covariate-correlation',
        label: 'r=0.21 covariate correlation renders CUPED variance reduction negligible',
        description: 'CUPED reduces variance by a factor of (1 - r²). At r=0.21, the variance reduction is approximately 4.4%. This is statistically and practically negligible. The adjusted CI is not materially narrower than the raw CI. The p-value shift from 0.08 to 0.02 is mostly noise in the adjustment, not genuine signal recovery. A valid CUPED application requires r≥0.3 to produce meaningful variance reduction; r≥0.5 is typical in well-designed applications.',
        severity: 'critical'
      },
      {
        id: 'wf-point-estimate-unchanged',
        label: 'Point estimate is identical before and after CUPED — the effect size did not change',
        description: 'CUPED adjusts variance, not the point estimate. The +1.1pp effect is the same in both the raw and adjusted result. If the raw result was too small to be confident in at n=45,000, the CUPED adjustment with r=0.21 did not generate new evidence — it just narrowed the CI by 4%. The team shipped on a technicality.',
        severity: 'critical'
      },
      {
        id: 'wf-ship-decision-premature',
        label: 'Ship decision was made on CUPED-adjusted result without validating covariate quality',
        description: 'The standard practice is to verify r≥0.3 before reporting a CUPED-adjusted result as the primary decision metric. The covariate here (30-day purchase rate) may be a weak predictor of order completion rate during a specific experiment window — particularly if the experiment attracted new or lapsed users who have no prior purchase history. Covariate quality should be part of the pre-analysis plan.',
        severity: 'warning'
      }
    ],

    decisions: [
      {
        id: 'ship_valid',
        label: 'The ship was correct — CUPED is a valid variance reduction technique and p=0.02 is significant.',
        description: 'CUPED is an approved method. The adjusted result is significant. The decision was sound.',
        score: 'junior_miss',
        feedback: 'CUPED is only valid when the covariate is sufficiently correlated with the outcome. At r=0.21, the variance reduction is approximately 4.4% — far below the threshold where CUPED meaningfully changes the inference. The p-value shifted from 0.08 to 0.02 on negligible variance reduction. This is not a legitimate significance finding — it is a marginal result that crossed a threshold because of a poorly chosen covariate. Shipping based on this CUPED result was premature.'
      },
      {
        id: 'rollback',
        label: 'Rollback — the CUPED adjustment inflated the result and the feature should not be live.',
        description: 'The CUPED adjustment was invalid. Revert the feature.',
        score: 'analyst_ready',
        feedback: 'Rollback may be overcorrecting. The raw effect (+1.1pp) is directionally real and the guardrails are clean. The problem is not that the effect is zero — it\'s that the evidence crossing p=0.05 was driven by a weak covariate adjustment, not by genuine precision. The more correct path is: acknowledge the ship was based on insufficient CUPED validation, run a proper power-sized experiment with a pre-committed covariate quality threshold, and treat the current live state as an early-read deployment rather than a validated result.'
      },
      {
        id: 'investigate-covariate',
        label: 'Acknowledge the ship was premature. Audit the covariate correlation. Run a confirmatory experiment with a pre-committed r threshold.',
        description: 'The covariate quality was not validated. Run a proper confirmatory study.',
        score: 'senior_ready',
        feedback: 'This is the right response. The feature is live, the guardrails are clean, and the directional effect is plausible. But the CUPED decision was made without checking r. Going forward: (1) document that the ship was conditional on an invalidated CUPED adjustment, (2) run a confirmatory experiment with a pre-specified covariate (ideally r≥0.5), and (3) add a covariate quality gate (r threshold check) to the experiment platform before CUPED results are used in decisions. The analytical standard failed, not necessarily the feature.'
      },
      {
        id: 'extend',
        label: 'Run the experiment longer to get a clean raw result.',
        description: 'More runtime will cross p=0.05 on the raw metric.',
        score: 'junior_miss',
        feedback: 'Extending after the experiment has already been stopped and shipped is peeking and post-hoc extension — a different class of analytical error. The question on the table is whether the CUPED adjustment used to justify the original ship was valid. That question is answered by examining r, not by running longer. Running longer would also conflate the current live state (100% of users on new checkout) with an experiment.'
      }
    ],

    idealDecision: 'investigate-covariate',
    secondBestDecision: 'rollback',

    juniorMistake: 'Defends the ship by citing p=0.02 without checking whether CUPED was appropriately applied. Treats any p<0.05 as valid regardless of the variance reduction mechanism. Does not know that CUPED validity depends on covariate-outcome correlation.',

    seniorFlags: [
      'The first thing to check on any CUPED result is r. At r=0.21, the variance reduction is (1 - 0.21²) = 95.6% of original variance — meaning CUPED reduced variance by only 4.4%. That\'s noise, not signal. The p-value shift from 0.08 to 0.02 on 4.4% variance reduction is not a meaningful precision gain.',
      'The point estimate is identical in both the raw and adjusted result. When CUPED is working well (r≥0.5), the adjusted estimate should be materially similar to the raw but with tighter CIs. Here, the CI narrowed by 4% — the lower bound shifted from -0.1pp to +0.2pp. That 0.3pp shift crossed zero and crossed 0.05. That is the entire basis for the ship decision.',
      'CUPED covariate selection should be pre-specified in the analysis plan, not chosen after seeing the raw p-value. Using a 30-day purchase rate as the covariate for an order completion rate outcome is reasonable in principle — but the correlation needs to be validated before the adjustment is applied to a decision.'
    ],

    staffFlags: [
      'Would have caught this in design by requiring a covariate quality check (r≥0.3 minimum, r≥0.5 preferred) as a platform-level gate before CUPED results surface in readouts. The experiment platform should compute and display r alongside the adjusted p-value.',
      'Would have noted that 30-day pre-experiment purchase rate may be a weak covariate for checkout completion specifically because experiment traffic skews toward lapsed or new users who have sparse history — exactly the segment where the new checkout might have the most impact, and where the covariate has the least predictive power.'
    ],

    debrief: 'CUPED is a variance reduction technique, not a significance manufacturing technique.\n\nHere is what CUPED actually does: it removes the portion of outcome variance that is explained by a pre-experiment covariate. If that covariate is strongly correlated with the outcome (r≥0.5), you get a materially narrower confidence interval and a more precise estimate of the treatment effect. If the covariate is weakly correlated (r<0.3), the variance reduction is negligible and the adjusted result is functionally identical to the raw result.\n\nAt r=0.21, the variance reduction from CUPED is (1 - r²) = 4.4%. The adjusted CI narrowed by 4%. The lower bound shifted from -0.1pp to +0.2pp. That 0.3pp shift is what took the result from p=0.08 to p=0.02 and justified a ship decision.\n\nThat is not a real precision gain. That is a marginal result crossing a threshold because of a poorly validated covariate.\n\nThe point estimate never changed: +1.1pp in both the raw and adjusted result. CUPED does not create evidence of an effect that the raw data doesn\'t contain. It only sharpens precision when the covariate earns it.\n\nThe correct response to a raw p=0.08 is not to find a covariate that tightens the CI enough to cross 0.05. The correct response is: the experiment was not powered to detect this effect size, or the effect is real but small, and the decision should account for that uncertainty.\n\nGoing forward: covariate quality (minimum r threshold) should be a platform gate, not a post-hoc check. Every CUPED readout should display r alongside the adjusted p-value. And any decision based on a CUPED-adjusted result where the raw result did not cross significance should be flagged as conditional on that adjustment\'s validity.',

    interviewTakeaway: 'CUPED validity depends on covariate-outcome correlation. At r=0.21, variance reduction is 4.4% — negligible. A p-value shift from 0.08 to 0.02 on negligible variance reduction is not genuine signal recovery. Always check r before trusting a CUPED-adjusted result.',

    relatedConcepts: ['cuped', 'variance reduction', 'pre-experiment covariate', 'covariate selection', 'regression adjustment'],
    scenarioFamily: 'cuped_variance',
    tags: ['cuped', 'variance reduction', 'covariate correlation', 'ecommerce', 'checkout', 'experiment platform']
  },

  // ─────────────────────────────────────────────
  // SCENARIO 18 — The 7-Day Annual Conversion Window
  // Theme: right_censored
  // ─────────────────────────────────────────────
  {
    id: 's18-right-censored-annual',
    title: 'The 7-Day Annual Conversion Window',
    subtitle: 'Annual plan conversion is up +3.2pp at 7 days. Most annual plan decisions take 30–60 days.',
    isFree: false,
    industry: 'saas',
    difficulty: 'senior',
    theme: 'right_censored',

    context: {
      company: 'Vantage HQ',
      product: 'B2C productivity SaaS — 1.4M monthly active users, monthly and annual plan tiers',
      team: 'Growth team',
      background: 'Vantage HQ ran a 14-day experiment testing a new annual plan upsell prompt that appears on the billing settings page after a user\'s third login in a 7-day window. Treatment shows a contextual modal with annual plan savings. Control shows no modal.\n\nThe primary metric was pre-specified as annual plan conversion rate measured at 7 days post-experiment enrollment. Results at day 14 of the experiment: treatment shows +3.2pp annual plan conversion (p=0.04, CI: [+0.2pp, +6.2pp]).\n\nThe PM wants to ship. The analyst is about to sign off.',
      businessPressure: 'Annual plan revenue is a board metric. The Head of Revenue has been asking for an annual conversion win for two quarters. The PM framed this as "we finally have the data." The CI just barely clears zero. The analyst has a 48-hour window before the ship decision gets made without her.'
    },

    hypothesis: 'Showing a contextual annual plan upsell modal after a user\'s third login in 7 days will increase annual plan conversion rate.',

    experimentDesign: {
      type: 'a/b',
      allocation: '50/50',
      runtime: '14 days',
      targetPopulation: 'Monthly plan subscribers who triggered their third login in a 7-day window during the experiment',
      primaryMetric: 'Annual plan conversion rate at 7 days post-enrollment',
      guardrailMetrics: ['Monthly plan cancellation rate', 'Support contact rate'],
      sampleSizeContext: '~18,000 users per arm. Measurement window: 7 days post-enrollment. Experiment runtime: 14 days. Annual plan decisions at Vantage HQ have a historical median conversion lag of 34 days from first exposure to purchase.'
    },

    metricReadout: [
      {
        metric: 'Annual plan conversion rate (7-day window)',
        type: 'primary',
        direction: 'up',
        delta: '+3.2pp (4.1% → 7.3%)',
        pValue: 0.04,
        confidenceInterval: '[+0.2pp, +6.2pp]',
        significant: true,
        note: 'Significant at α=0.05, but CI lower bound is +0.2pp — barely above zero. The measurement window is 7 days. Historical data shows the median annual plan conversion lag at Vantage HQ is 34 days from first upsell exposure.'
      },
      {
        metric: 'Monthly plan cancellation rate',
        type: 'guardrail',
        direction: 'neutral',
        delta: '+0.3pp',
        pValue: 0.41,
        confidenceInterval: '[-0.4pp, +1.0pp]',
        significant: false,
        note: 'PASS. No significant increase in monthly cancellations.'
      },
      {
        metric: 'Support contact rate',
        type: 'guardrail',
        direction: 'neutral',
        delta: '+1.1%',
        pValue: 0.29,
        confidenceInterval: '[-0.9%, +3.1%]',
        significant: false,
        note: 'PASS.'
      },
      {
        metric: 'Historical annual conversion lag (diagnostic)',
        type: 'diagnostic',
        direction: 'neutral',
        delta: 'Median 34 days, P75 = 58 days',
        pValue: null,
        confidenceInterval: null,
        significant: false,
        note: 'Pre-experiment data on all voluntary annual plan conversions in the past 90 days. Median conversion lag from first billing page visit to annual plan purchase is 34 days. 75% of annual conversions occur within 58 days. The 7-day measurement window captures approximately 15% of the eventual annual conversion volume.'
      }
    ],

    warningFlags: [
      {
        id: 'wf-right-censored-window',
        label: '7-day measurement window captures ~15% of eventual annual conversions — results are right-censored',
        description: 'Annual plan decisions are deliberate. The historical median conversion lag is 34 days. At 7 days, treatment users who will ultimately convert at day 20, 35, or 50 are counted as non-converters in the denominator. This right-censoring creates measurement bias — the 7-day result is not a stable estimate of the true treatment effect. The direction of bias depends on whether the modal accelerates conversion timing (treatment converts faster but same users eventually convert) or creates net new conversions (treatment users who would never have converted do so). These have very different ROI implications.',
        severity: 'critical'
      },
      {
        id: 'wf-thin-ci',
        label: 'CI lower bound is +0.2pp — the result is statistically significant but not practically stable',
        description: 'A CI of [+0.2pp, +6.2pp] is very wide for a 3.2pp point estimate. The range of plausible effects spans from negligible to 2x the point estimate. This is partly caused by the right-censoring: at 7 days, the conversion denominator is large but the event count is small, inflating variance.',
        severity: 'warning'
      },
      {
        id: 'wf-acceleration-vs-net-new',
        label: 'Cannot distinguish conversion acceleration from net new conversion at 7 days',
        description: 'If treatment users simply upgraded sooner (and would have upgraded anyway by day 60), the actual revenue lift is zero — the modal moved the timing but not the volume. If treatment users are genuinely net new annual conversions, the lift is real. You cannot distinguish these two interpretations at 7 days. You need a 60-day measurement window.',
        severity: 'critical'
      }
    ],

    decisions: [
      {
        id: 'ship',
        label: 'Ship — annual conversion is up 3.2pp with p=0.04. The result is significant.',
        description: 'Significant result, clean guardrails. Ship to 100%.',
        score: 'junior_miss',
        feedback: 'The result is statistically significant at 7 days, but the measurement window captures only ~15% of the eventual conversion volume. The effect estimate is based on the fastest-converting users — who are not representative of all annual plan converters. The +3.2pp could be entirely timing acceleration (treatment users converting at day 5 instead of day 35) with zero net revenue lift. Shipping on a 7-day window for a metric with a 34-day median conversion lag is a measurement design error, not a business win.'
      },
      {
        id: 'rollback',
        label: 'Rollback — the right-censoring means the result is meaningless.',
        description: 'The 7-day window invalidates the result entirely.',
        score: 'analyst_ready',
        feedback: 'Rollback is too strong. The experiment is live, the guardrails are clean, and there is a real signal worth investigating. Right-censoring does not mean the result is zero — it means the result is unstable and possibly biased. The correct response is to extend the measurement window to 60 days while keeping the feature live, not to revert a potentially beneficial upsell prompt. Rollback based on a methodological concern without evidence of harm would be overcorrection.'
      },
      {
        id: 'extend-measurement',
        label: 'Do not ship yet. Extend the measurement window to 60 days. Distinguish conversion acceleration from net new conversion before making a scaling decision.',
        description: 'The measurement window is too short for this metric. Wait for the 60-day read.',
        score: 'senior_ready',
        feedback: 'This is the right call. Keep the feature live (guardrails are clean, no harm signal), but do not declare a win or scale to 100% until the 60-day measurement window closes. At 60 days, you\'ll have a stable estimate of whether the modal created net new annual conversions or simply moved timing. If the treatment effect persists at 60 days, ship with confidence. If the effect attenuates (control catches up), the modal accelerated conversions but didn\'t change total volume — very different ROI.'
      },
      {
        id: 'extend-runtime',
        label: 'Re-run the experiment for 60 days to get more statistical power.',
        description: 'The experiment needs more time.',
        score: 'analyst_ready',
        feedback: 'This conflates two different problems. The issue is not runtime (the experiment enrolled 18,000 users per arm in 14 days — that\'s adequate) — it\'s the measurement window for the outcome metric. A longer runtime enrolls more users but doesn\'t fix the right-censoring problem if the measurement window is still capped at 7 days. The fix is extending the outcome measurement window for the users already enrolled, not re-running the experiment.'
      }
    ],

    idealDecision: 'extend-measurement',
    secondBestDecision: 'rollback',

    juniorMistake: 'Ships on p=0.04 without asking what percentage of annual conversions occur within 7 days. Treats "statistically significant at the pre-specified window" as equivalent to "valid measurement of the treatment effect." Does not think about conversion timing distributions.',

    seniorFlags: [
      'The first question for any conversion metric is: what is the typical conversion lag? If the measurement window is shorter than the P50 conversion lag, the result is right-censored and potentially biased. Here, the 7-day window versus 34-day median is a factor-of-5 mismatch.',
      'Right-censoring creates a specific bias risk: the treatment and control groups may have different censoring patterns. If the modal accelerates decision-making for treatment users (they decide faster), treatment looks better at 7 days even if total conversion rates are identical by day 60. The 7-day result conflates "converts faster" with "converts more."',
      'The CI of [+0.2pp, +6.2pp] is telling you the experiment is underpowered for the metric as specified. At a 34-day median lag, a 7-day window has a small event count relative to the denominator — which is why the CI is so wide. More events will come in; you just haven\'t waited for them.'
    ],

    staffFlags: [
      'Would have caught this in design by asking what the historical conversion lag distribution looks like before pre-specifying the measurement window. The measurement window should be at least P75 of the historical conversion lag — in this case, 58 days.',
      'Would have added a secondary metric: "annual plan conversion rate at 60 days" alongside the 7-day primary metric, pre-specified as the confirmatory window. The 7-day result is an early signal only.'
    ],

    debrief: 'This is a right-censoring problem, not a statistical power problem.\n\nRight-censoring occurs when your measurement window closes before all outcome events have had a chance to occur. In clinical trials, this happens when patients leave the study before the endpoint. In subscription SaaS, it happens when your measurement window for a conversion metric is shorter than the typical conversion timeline.\n\nAt Vantage HQ, the median annual plan conversion lag is 34 days. At 7 days, you have observed approximately 15% of the eventual annual conversions that will occur from this experiment cohort. The other 85% are still pending — their outcome is censored by the measurement window.\n\nHere is why this creates a bias risk, not just imprecision: the treatment and control groups may have different censoring patterns. If the modal prompts users to decide faster (but doesn\'t change who ultimately converts), treatment users disproportionately complete their conversion within the 7-day window. Control users who would have converted by day 35 are counted as non-converts. Treatment looks better at day 7 even if the eventual 60-day conversion rates are identical.\n\nIf that\'s what\'s happening, shipping produces no incremental annual revenue — you just observed the first 15% of a process that would have completed anyway.\n\nThe correct action: keep the feature live (guardrails are clean, the modal isn\'t hurting anything), wait for the 60-day measurement window to close, and make the ship decision on the stable result. If the effect persists at 60 days, the modal is generating net new annual conversions and the business case is real. If treatment and control converge, you have evidence of acceleration but not net new revenue.',

    interviewTakeaway: 'Right-censoring occurs when the measurement window is shorter than the conversion lag distribution. At 7 days for a 34-day median conversion, you are measuring the fastest 15% of converters — a biased sample. Extend the measurement window to P75 of the historical conversion lag before making a ship decision on conversion metrics.',

    relatedConcepts: ['right-censored measurement', 'conversion lag', 'survival analysis', 'measurement window', 'selection bias'],
    scenarioFamily: 'right_censored',
    tags: ['subscription saas', 'annual conversion', 'right-censored', 'measurement window', 'upsell', 'LTV']
  },

  // ─────────────────────────────────────────────
  // SCENARIO 19 — The Last-Click Mirage
  // Theme: multi_touch
  // ─────────────────────────────────────────────
  {
    id: 's19-last-click-mirage',
    title: 'The Last-Click Mirage',
    subtitle: 'Retargeting ads show +18% revenue lift. The lifecycle email campaign touched the same users. Attribution hasn\'t been sorted out.',
    isFree: false,
    industry: 'consumer_app',
    difficulty: 'senior',
    theme: 'multi_touch',

    context: {
      company: 'Evergreen Collective',
      product: 'Consumer subscription e-commerce — curated home goods, 620K active subscribers, $88M ARR',
      team: 'Performance Marketing team',
      background: 'Evergreen Collective ran a 21-day retargeting ad campaign experiment. Treatment: lapsed users (no purchase in 45–90 days) received Facebook and Instagram retargeting ads. Control: lapsed users received no paid retargeting.\n\nLast-click attribution in the reporting dashboard shows treatment users generated 18% more revenue over the experiment period (p=0.01). The Performance Marketing lead is preparing a budget increase proposal to scale retargeting by 3x.\n\nBefore the proposal reaches the CMO, the analytics team flagged that during the same 21-day window, the Lifecycle team ran an email re-engagement campaign that also targeted lapsed users in the 45–90-day window — the same population as the retargeting experiment. The email campaign was not coordinated with the retargeting experiment.',
      businessPressure: 'The Performance Marketing lead has a board meeting in 10 days where she plans to present the 18% lift as proof that retargeting ROI justifies a $2M budget increase. The Lifecycle email team is simultaneously claiming the revenue recovery was driven by their campaign. Both teams are using the same 18% lift number.'
    },

    hypothesis: 'Retargeting lapsed users (45–90 days since last purchase) with paid social ads will recover purchase revenue compared to no retargeting.',

    experimentDesign: {
      type: 'a/b',
      allocation: '50/50',
      runtime: '21 days',
      targetPopulation: 'Lapsed users with no purchase in 45–90 days at experiment start',
      primaryMetric: 'Revenue per user over 21-day experiment window (last-click attributed)',
      guardrailMetrics: ['Unsubscribe rate', 'Ad spend per recovered dollar'],
      sampleSizeContext: '~28,000 users per arm. Last-click attribution. During the same window, the Lifecycle email team sent a 3-email re-engagement sequence to the same lapsed user population — not segmented by experiment arm.'
    },

    metricReadout: [
      {
        metric: 'Revenue per user (last-click attributed, 21 days)',
        type: 'primary',
        direction: 'up',
        delta: '+18.3% ($12.40 → $14.67 per user)',
        pValue: 0.01,
        confidenceInterval: '[+4.2%, +32.4%]',
        significant: true,
        note: 'Last-click attribution assigns 100% of revenue credit to the last touchpoint before purchase. In this experiment, that is the retargeting ad for any user who clicked an ad before purchasing. However, the lifecycle email campaign ran concurrently for the same user population.'
      },
      {
        metric: 'Unsubscribe rate',
        type: 'guardrail',
        direction: 'up',
        delta: '+0.4pp',
        pValue: 0.21,
        confidenceInterval: '[-0.2pp, +1.0pp]',
        significant: false,
        note: 'PASS. Not significant.'
      },
      {
        metric: 'Attribution overlap (diagnostic)',
        type: 'diagnostic',
        direction: 'neutral',
        delta: '71% of treatment purchasers also received at least one lifecycle email in the same window',
        pValue: null,
        confidenceInterval: null,
        significant: false,
        note: '71% of treatment users who made a purchase during the experiment window also received at least one lifecycle email during the same period. Under data-driven attribution, the email campaign receives an estimated 58–62% of revenue credit for overlapping conversions. The retargeting ad\'s standalone contribution under time-decay attribution is estimated at 38–42% of the last-click number.'
      },
      {
        metric: 'Email-only conversion rate (control users who received email)',
        type: 'diagnostic',
        direction: 'neutral',
        delta: 'Control email recipients: $13.89 per user vs. $11.21 for control non-email recipients',
        pValue: null,
        confidenceInterval: null,
        significant: false,
        note: 'Descriptive only. Control users who received lifecycle emails spent approximately 24% more than control users who did not receive emails. This is confounded (email targeting may have selected higher-intent users) but directionally suggests the email campaign had independent lift.'
      }
    ],

    warningFlags: [
      {
        id: 'wf-concurrent-campaign-overlap',
        label: 'Lifecycle email campaign ran concurrently on the same user population — 71% overlap',
        description: 'The retargeting experiment and the lifecycle email campaign were not coordinated. 71% of treatment purchasers received both retargeting ads and lifecycle emails in the same 21-day window. Last-click attribution assigns all credit to the final touchpoint (the ad click, if the user clicked an ad before purchasing). This systematically overstates the retargeting ad\'s contribution and understates the email campaign\'s contribution.',
        severity: 'critical'
      },
      {
        id: 'wf-last-click-overattribution',
        label: 'Last-click attribution in a multi-touch environment systematically overattributes to the final paid touchpoint',
        description: 'Last-click attribution is designed for single-channel environments. When users receive multiple marketing touches (email + paid ads) in the same conversion window, last-click awards 100% of credit to whichever channel the user interacted with immediately before purchasing. This creates a structural bias toward paid channels, which have more measurable click events than email-assisted conversions.',
        severity: 'critical'
      },
      {
        id: 'wf-roi-calculation-inflated',
        label: '3x budget increase is being proposed on a lift that may be 2.5x overstated',
        description: 'Under data-driven or time-decay attribution, the retargeting ad\'s standalone contribution is estimated at 38–42% of the last-click revenue lift. Scaling ad spend by 3x on a lift that is actually 38–42% of the reported number produces a negative ROAS.',
        severity: 'critical'
      }
    ],

    decisions: [
      {
        id: 'approve_budget',
        label: 'Approve the 3x budget increase — +18% revenue lift with p=0.01 is definitive.',
        description: 'The experiment is significant. Scale retargeting.',
        score: 'junior_miss',
        feedback: 'The +18% lift is real in the data — but it cannot be cleanly attributed to retargeting ads alone. 71% of treatment purchasers also received lifecycle emails. Under last-click attribution, the ad gets 100% of the credit for any user who clicked an ad as their final touch — even if three emails preceded it and created the intent. Scaling ad spend by 3x on a lift that is 38–42% retargeting-driven produces a negative ROAS. This budget proposal needs attribution analysis before it goes to the CMO.'
      },
      {
        id: 'reject_result',
        label: 'Reject the experiment result entirely — the concurrent email campaign makes it uninterpretable.',
        description: 'The campaign overlap invalidates the result.',
        score: 'analyst_ready',
        feedback: 'Rejecting entirely overcorrects. The retargeting ad does have some causal contribution — the question is how much. A partial-credit attribution model (data-driven or time-decay) can estimate the retargeting contribution, even imperfectly. The result isn\'t uninterpretable — it\'s last-click-attributed, which overstates the ad contribution. The right move is to quantify the multi-touch adjustment before making a budget decision, not to discard the experiment.'
      },
      {
        id: 'investigate-attribution',
        label: 'Block the budget proposal. Run multi-touch attribution analysis across both campaigns before any scaling decision. Redesign future experiments with campaign isolation.',
        description: 'The last-click number is not trustworthy for a budget scaling decision.',
        score: 'senior_ready',
        feedback: 'This is the right call. Apply data-driven or time-decay attribution to the conversion data to separate the retargeting and email contributions. Even imperfect multi-touch attribution will materially change the ROAS estimate. If the retargeting contribution under multi-touch attribution still justifies increased spend, bring the adjusted number to the CMO — with the methodology disclosed. Additionally, require campaign isolation in future experiments: if retargeting and lifecycle email target the same population, they need separate experimental arms or coordinated holdouts.'
      },
      {
        id: 'split_credit',
        label: 'Split the revenue credit 50/50 between retargeting and email and recalculate ROAS.',
        description: 'Divide the lift equally between the two channels.',
        score: 'analyst_ready',
        feedback: 'Arbitrary 50/50 credit splitting is not an attribution methodology — it\'s a guess. The actual contribution of each channel depends on conversion timing, touchpoint sequencing, and channel-specific click data. Data-driven attribution uses conversion path data and counterfactual modeling to estimate each touchpoint\'s contribution. Use the available data, not an arbitrary split.'
      }
    ],

    idealDecision: 'investigate-attribution',
    secondBestDecision: 'reject_result',

    juniorMistake: 'Ships the budget proposal based on last-click attribution without asking about concurrent campaigns or what fraction of converters were touched by both channels. Treats p=0.01 as sufficient to recommend a $2M budget increase.',

    seniorFlags: [
      'The first question after seeing a large revenue lift in a retargeting experiment is: what else was running on the same population? Campaign isolation is the most common source of attribution errors in performance marketing experiments.',
      'Last-click attribution in a multi-touch environment is not a neutral measurement choice — it systematically favors paid channels that generate click events over email and organic channels that assist conversions without receiving the final click. Any budget decision based on last-click attribution in a multi-touch environment is structurally biased toward paid channels.',
      '71% overlap between retargeting experiment and lifecycle email is not a footnote — it is the dominant fact in this readout. A 71% overlap means the vast majority of treatment conversions are joint retargeting + email conversions, not pure retargeting conversions.'
    ],

    staffFlags: [
      'Would have required campaign isolation at experiment design: either coordinate holdout populations across teams, or create four experimental arms (retargeting only, email only, both, neither) to isolate the individual and combined lift of each channel.',
      'Would have flagged that the retargeting experiment design has a confounding risk by construction: treatment users received both ads and emails, control users received only emails. The experiment is not measuring "retargeting vs. no retargeting" — it is measuring "retargeting + email vs. email alone," which is a different and more limited question.'
    ],

    debrief: 'Last-click attribution is a legal fiction in multi-touch environments.\n\nHere is what last-click attribution actually computes: whichever channel the user interacted with immediately before purchasing receives 100% of the revenue credit. If a user received three lifecycle emails over 14 days, clicked on a retargeting ad on day 15, and purchased on day 15 — the ad gets full credit. The emails get nothing.\n\nThis is not a description of how the user made their decision. It is a description of which channel happened to fire last.\n\nIn this experiment, 71% of treatment purchasers received both retargeting ads and lifecycle emails in the same 21-day window. For most of those users, the conversion was the result of multiple touchpoints working together — the emails rebuilt intent, the ad provided the final trigger. Last-click attribution awards all credit to the final trigger and zero to the intent-building.\n\nWhen data-driven attribution is applied (which uses conversion path data to estimate each touchpoint\'s counterfactual contribution), the retargeting ad\'s estimated contribution drops to approximately 38–42% of the last-click number. The email campaign claims the remaining 58–62%.\n\nA 3x budget increase in retargeting based on a +18% last-click lift translates to a 3x budget increase on what is actually a +7–8% retargeting-attributable lift. Depending on the marginal cost per impression, that produces a negative ROAS.\n\nThe fix going forward is campaign isolation: future retargeting experiments must either (1) coordinate holdout populations with the lifecycle email team so the experimental and control populations receive different treatments, or (2) use a 2x2 experimental design with four arms — retargeting only, email only, both, neither — to isolate the individual and combined lift of each channel.',

    interviewTakeaway: 'Last-click attribution assigns 100% of credit to the final touchpoint in a multi-touch conversion path. When paid ads and email campaigns run concurrently on the same population, last-click systematically overattributes to paid channels. Always ask what else was running on the same population before approving budget scaling decisions.',

    relatedConcepts: ['last-click attribution', 'multi-touch attribution', 'data-driven attribution', 'campaign isolation', 'ROAS', 'incrementality testing'],
    scenarioFamily: 'multi_touch',
    tags: ['attribution', 'multi-touch', 'retargeting', 'email', 'performance marketing', 'last-click']
  },

  // ─────────────────────────────────────────────
  // SCENARIO 20 — The 65-Account Experiment
  // Theme: b2b_constraints
  // ─────────────────────────────────────────────
  {
    id: 's20-sixty-five-account-experiment',
    title: 'The 65-Account Experiment',
    subtitle: '+12pp activation in 65 enterprise accounts, p=0.09. The team is debating whether to ship.',
    isFree: false,
    industry: 'saas',
    difficulty: 'senior',
    theme: 'b2b_constraints',

    context: {
      company: 'Meridian Ops',
      product: 'Enterprise operations SaaS — 65 active enterprise accounts, $24M ARR, 18-month average sales cycle',
      team: 'Product and Customer Success team',
      background: 'Meridian Ops tested a redesigned onboarding flow with enterprise accounts that signed in the last 90 days. Treatment received the new flow (structured guided setup with a dedicated CSM touchpoint at day 3). Control received the existing flow (self-serve documentation and email drip).\n\nThe experiment ran for 6 weeks. 32 accounts in treatment, 33 in control. Primary metric: meaningful activation rate at 30 days (defined as: at least 3 users per account using the core workflow feature at least twice in the first 30 days). Results: treatment 70.6% activated, control 58.6% activated. Absolute difference: +12pp. p=0.09.\n\nThe Head of Product wants to ship the new onboarding flow. The analyst is being asked to sign off.',
      businessPressure: 'Enterprise churn in the first 90 days is the company\'s single largest revenue risk. Two enterprise accounts churned in the last quarter within 60 days of signing — both cited "poor onboarding" in exit interviews. The board has asked leadership to demonstrate improvement in onboarding quality by next quarter. The Head of Product is presenting the experiment results at the all-hands tomorrow.'
    },

    hypothesis: 'A structured guided onboarding flow with a dedicated CSM touchpoint at day 3 will increase meaningful activation rate at 30 days for new enterprise accounts.',

    experimentDesign: {
      type: 'a/b',
      allocation: '~50/50',
      runtime: '6 weeks',
      targetPopulation: 'Enterprise accounts signed in the 90 days prior to experiment start',
      primaryMetric: 'Meaningful activation rate at 30 days (3+ users using core workflow feature 2+ times)',
      guardrailMetrics: ['90-day churn rate', 'CSM time per account'],
      sampleSizeContext: '32 treatment accounts, 33 control accounts. Pre-specified MDE: 15pp (based on power analysis at 65 accounts). Observed effect: +12pp. Statistical power at 12pp MDE with n=65 accounts is approximately 32–35%.'
    },

    metricReadout: [
      {
        metric: 'Meaningful activation rate at 30 days',
        type: 'primary',
        direction: 'up',
        delta: '+12pp (58.6% → 70.6%)',
        pValue: 0.09,
        confidenceInterval: '[-2pp, +26pp]',
        significant: false,
        note: 'Not significant at α=0.05. Pre-specified MDE was 15pp. The observed effect of 12pp is below the MDE the experiment was powered to detect. At n=65 accounts, statistical power to detect a 12pp effect is approximately 32–35% — meaning this experiment had a 65–68% chance of returning p>0.05 even if the true effect is 12pp. The non-significant p-value is not evidence that the feature does not work.'
      },
      {
        metric: '90-day churn rate',
        type: 'guardrail',
        direction: 'neutral',
        delta: '0% in both arms (no churns during experiment)',
        pValue: null,
        confidenceInterval: null,
        significant: false,
        note: 'PASS. No churn events in either arm during the 6-week window. Baseline is too low and window too short to measure this reliably.'
      },
      {
        metric: 'CSM time per account',
        type: 'guardrail',
        direction: 'up',
        delta: '+4.1 hours per account',
        pValue: 0.004,
        confidenceInterval: '[+1.4h, +6.8h]',
        significant: true,
        note: 'GUARDRAIL NOTE. Treatment requires significantly more CSM time. At scale (65 accounts × 4.1h), this is a material operational cost. If the new flow were applied to all new accounts, CSM capacity would need to increase.'
      }
    ],

    warningFlags: [
      {
        id: 'wf-underpowered-design',
        label: 'Power at 12pp MDE is 32–35% — the experiment cannot distinguish a real effect from noise',
        description: 'With 65 accounts and a 12pp observed effect, the experiment had approximately a 35% chance of detecting the effect even if it is real. A p=0.09 result in an experiment with 35% power is expected — it does not constitute evidence that the feature is ineffective. The correct interpretation: this experiment is consistent with a real effect of 8–20pp, but it cannot confirm or rule out an effect below 15pp.',
        severity: 'critical'
      },
      {
        id: 'wf-ci-spans-zero',
        label: 'CI of [-2pp, +26pp] is extremely wide — the range of plausible effects includes harm',
        description: 'A 95% CI of [-2pp, +26pp] includes effects from slight harm to very large benefit. This is not a result that supports confident decision-making in either direction. At 65 accounts, the experiment simply does not have the statistical resolution to answer the question.',
        severity: 'critical'
      },
      {
        id: 'wf-csm-cost-signal',
        label: 'CSM time is significantly elevated — operational cost is real and must be in the ROI calculation',
        description: 'Treatment accounts required 4.1 additional CSM hours on average. If applied to all new enterprise accounts, this is a meaningful operational cost. The activation lift (real but uncertain) needs to be weighed against the confirmed CSM cost. This is a capacity and unit economics decision, not just a product decision.',
        severity: 'warning'
      }
    ],

    decisions: [
      {
        id: 'ship',
        label: 'Ship the new onboarding flow — +12pp activation is a large and meaningful effect even if p=0.09.',
        description: 'The effect size is large. Ship.',
        score: 'analyst_ready',
        feedback: 'The effect size is directionally compelling, but shipping based on p=0.09 from a 35%-powered experiment creates a real risk: you cannot distinguish a 12pp true effect from a 3–4pp true effect with noise at this sample size. The CI spans from -2pp to +26pp. Shipping also scales the CSM cost (confirmed at +4.1 hours per account) without confirmed activation benefit. The right move is not to ship on this data, but also not to abandon the feature — instrument a full rollout with pre-committed 6-month success criteria.'
      },
      {
        id: 'rollback',
        label: 'Rollback and abandon the new onboarding — p=0.09 is not significant.',
        description: 'The experiment failed. Revert.',
        score: 'junior_miss',
        feedback: 'This is the most common error in underpowered B2B experiments: treating "not significant" as "no effect." With 35% power, a non-significant result tells you almost nothing about whether the feature works. The experiment is consistent with a real 12pp effect — it just cannot confirm it at α=0.05. Abandoning a feature with a plausible large effect because of an underpowered test is leaving a potentially important product improvement on the table. The correct analytical response is to acknowledge the underpowering, not to conclude the feature failed.'
      },
      {
        id: 'instrument-rollout',
        label: 'Do not ship based on this experiment. Apply the new flow to all new enterprise accounts going forward. Pre-commit to 6-month activation and retention success criteria. Measure at scale.',
        description: 'The experiment cannot answer the question at 65 accounts. Instrument a full rollout with pre-committed criteria.',
        score: 'senior_ready',
        feedback: 'This is the correct B2B response. Standard A/B testing cannot be done reliably at n=65 accounts — you will never have enough accounts in a short window for clean statistical inference. The right framework: apply the best-current-hypothesis onboarding to all new accounts, define specific 6-month success criteria (activation rate, 90-day retention, NPS) in advance, and measure at the cohort level. This is not "shipping without evidence" — it is acknowledging the limits of small-n experimentation and adopting a measurement framework that matches the business context.'
      },
      {
        id: 'rerun_longer',
        label: 'Rerun the experiment for 6 months to accumulate more accounts and reach statistical significance.',
        description: 'More accounts over more time will give the statistical power needed.',
        score: 'analyst_ready',
        feedback: 'This is technically sound but organizationally impractical. At Meridian Ops\'s growth rate, accumulating enough enterprise accounts for 80% power on a 12pp MDE would take 18–24 months. The company cannot wait that long for an onboarding decision. The correct response to the B2B small-N constraint is not "run longer" — it is to adopt a different evidence-gathering framework (staged rollout with pre-committed success criteria) that generates actionable evidence within the business\'s timeline.'
      }
    ],

    idealDecision: 'instrument-rollout',
    secondBestDecision: 'ship',

    juniorMistake: 'Treats p=0.09 as a failed experiment and recommends abandoning the feature. Does not understand that a non-significant result in a 35%-powered test carries almost no evidential weight in either direction. Applies consumer product statistical norms to a 65-account B2B context.',

    seniorFlags: [
      'Statistical power is the critical context for interpreting any p-value. At 35% power, p=0.09 is fully consistent with a true 12pp effect. "Not significant" means "insufficient power to detect at this MDE" — not "no effect." The CI [-2pp, +26pp] is the honest summary of what the data can say.',
      'The B2B small-N problem is structural, not fixable by running longer (within a reasonable business timeline). The correct experimental framework for 65 enterprise accounts is a staged rollout with pre-committed success criteria — not a randomized experiment that will never reach 80% power on a 30-day cohort window.',
      'The CSM cost signal is actually the most actionable finding from this experiment. Treatment requires 4.1 more hours per account — confirmed, significant. Any ship decision needs a unit economics model: what is the activation lift worth in retention and expansion revenue, and does it justify the CSM cost at scale?'
    ],

    staffFlags: [
      'Would have identified the N constraint before designing the experiment. At 65 accounts, a standard A/B test is underpowered for almost any realistic effect size on a 30-day metric. The design should have been a staged rollout with pre-committed success criteria, not a randomized experiment.',
      'Would have flagged that "apply new flow to all accounts" is not the only alternative to A/B testing. Quasi-experimental methods (difference-in-differences on cohorts, synthetic control) may be applicable if there is sufficient historical data. The question is not "A/B test or nothing" — it is "what is the best available evidence framework for 65 accounts?"'
    ],

    debrief: 'This is not an experiment failure. It is an experiment design failure.\n\nWith 65 enterprise accounts, a 6-week window, and a 12pp observed effect, the statistical power was approximately 35%. That means this experiment had a 65% chance of returning p>0.09 even if the true activation lift is exactly 12pp. The p=0.09 result is exactly what you would expect from a 35%-powered experiment testing a real effect.\n\n"Not significant" does not mean "the feature doesn\'t work." It means the experiment cannot tell you whether the feature works. Those are completely different claims.\n\nThe correct analytical response to underpowered B2B experiments is not to treat them as null results. It is to explicitly state the power constraint, characterize the range of plausible effects (here: -2pp to +26pp), acknowledge that the experiment cannot distinguish signal from noise at this sample size, and recommend a framework that can generate actionable evidence within the business\'s constraints.\n\nFor 65 enterprise accounts, that framework is almost never a randomized A/B test. It is a staged rollout with pre-committed success criteria: apply the best-current-hypothesis onboarding to all new accounts, define the specific activation and retention benchmarks that would constitute success, and measure at 3, 6, and 12 months. This generates real-world evidence from the actual deployment without requiring statistical power you will never have.\n\nThe CSM cost finding is real and should be part of the decision. Treatment accounts required 4.1 additional CSM hours — that is a confirmed, significant cost that scales linearly with account growth. The decision to apply the new onboarding flow at scale is not just a product decision — it is a capacity and unit economics decision that the Customer Success team needs to be part of.',

    interviewTakeaway: 'Standard A/B testing is not appropriate for enterprise B2B at small N. With 35% power, p=0.09 is not evidence of no effect — it is evidence of an underpowered experiment. The correct framework for 65 enterprise accounts is staged rollout with pre-committed success criteria, not a randomized test that will never reach adequate power within a practical timeline.',

    relatedConcepts: ['statistical power', 'underpowered experiment', 'B2B experimentation', 'small N', 'staged rollout', 'MDE'],
    scenarioFamily: 'b2b_constraints',
    tags: ['B2B', 'enterprise SaaS', 'statistical power', 'underpowered', 'small N', 'onboarding']
  },

  // ─────────────────────────────────────────────
  // SCENARIO 21 — The Spillover City
  // Theme: geo_holdout
  // ─────────────────────────────────────────────
  {
    id: 's21-spillover-city',
    title: 'The Spillover City',
    subtitle: 'Driver bonus experiment shows +8% ride completion. Half the drivers in the same city are the control group.',
    isFree: false,
    industry: 'marketplace',
    difficulty: 'senior',
    theme: 'geo_holdout',

    context: {
      company: 'Velora',
      product: 'Rideshare two-sided marketplace — 18 cities, 340K active drivers, 2.1M weekly riders',
      team: 'Driver Supply team',
      background: 'Velora\'s Driver Supply team ran a 4-week experiment testing a new driver completion bonus: drivers who completed 8+ rides in a single day received a $12 end-of-day bonus. The team used user-level randomization — 50% of drivers in all 18 cities were randomly assigned to treatment (eligible for the bonus), and 50% were assigned to control (no bonus).\n\nPrimary metric: ride completion rate (rides completed / rides accepted). Results: treatment drivers show 8.4% higher ride completion rate (p=0.02). The experiment passed SRM check. The team is preparing to ship.\n\nA Staff DS on the experimentation review team is flagging a SUTVA violation before the ship meeting.',
      businessPressure: 'Driver supply is Velora\'s top operational constraint. The CEO has said publicly that improving driver completion rates is a Q3 priority. The Driver Supply team has been waiting 6 weeks for experiment results. The business case for the bonus is strong if the lift is real.'
    },

    hypothesis: 'A per-day ride completion bonus ($12 for 8+ completed rides in a day) will increase driver ride completion rate by incentivizing drivers to complete accepted rides rather than cancel.',

    experimentDesign: {
      type: 'a/b',
      allocation: '50/50',
      runtime: '4 weeks',
      targetPopulation: 'All active drivers in 18 cities (active = at least 1 ride in prior 30 days)',
      primaryMetric: 'Ride completion rate (rides completed / rides accepted)',
      guardrailMetrics: ['Rider cancellation rate', 'Driver earnings per hour', 'Platform contribution margin per ride'],
      sampleSizeContext: '~170,000 drivers per arm across 18 cities. User-level (driver-level) randomization. Control and treatment drivers coexist in the same cities and compete for the same rider demand.'
    },

    metricReadout: [
      {
        metric: 'Ride completion rate',
        type: 'primary',
        direction: 'up',
        delta: '+8.4% (76.2% → 82.6%)',
        pValue: 0.02,
        confidenceInterval: '[+1.3%, +15.5%]',
        significant: true,
        note: 'Significant. But SUTVA is violated — treatment and control drivers compete for the same rider demand in the same cities. When treatment drivers complete more rides, control drivers in the same city complete fewer rides (demand is being absorbed). This means the control group\'s behavior is directly affected by treatment assignment, violating the stable unit treatment value assumption.'
      },
      {
        metric: 'Rider cancellation rate',
        type: 'guardrail',
        direction: 'down',
        delta: '-1.1pp',
        pValue: 0.08,
        confidenceInterval: '[-2.3pp, +0.1pp]',
        significant: false,
        note: 'Trending positive (fewer rider cancellations) but not significant. Could be a real benefit or a result of treatment drivers absorbing demand faster than control drivers.'
      },
      {
        metric: 'Driver earnings per hour (control group)',
        type: 'diagnostic',
        direction: 'down',
        delta: '-6.2% in control vs. pre-experiment baseline',
        pValue: null,
        confidenceInterval: null,
        significant: false,
        note: 'Control driver earnings per hour declined 6.2% compared to the 4-week pre-experiment baseline. In a demand-equilibrium two-sided market, treatment drivers absorbing more rides directly reduces the rides available to control drivers. This is the SUTVA spillover signature.'
      },
      {
        metric: 'Rides per driver per day (control group)',
        type: 'diagnostic',
        direction: 'down',
        delta: '-4.8% in control vs. pre-experiment baseline',
        pValue: null,
        confidenceInterval: null,
        significant: false,
        note: 'Control drivers are completing fewer rides than pre-experiment. If control drivers were unaffected by treatment assignment, their ride volume should be flat versus baseline. A 4.8% decline in the control group is direct evidence of demand-side spillover from treatment to control.'
      }
    ],

    warningFlags: [
      {
        id: 'wf-sutva-violation',
        label: 'SUTVA violated — treatment and control drivers compete for the same ride demand in the same city',
        description: 'SUTVA (Stable Unit Treatment Value Assumption) requires that the outcome for any unit is unaffected by the treatment assignment of other units. In a two-sided marketplace, driver-level randomization in the same city violates SUTVA: when treatment drivers complete more rides, they absorb demand that would have gone to control drivers. Control driver completion rate is depressed not because the bonus doesn\'t work, but because treatment drivers are taking their rides. The measured +8.4% lift overstates the true population effect.',
        severity: 'critical'
      },
      {
        id: 'wf-control-group-harmed',
        label: 'Control group earnings and ride volume are declining vs. baseline — direct spillover signature',
        description: 'Control driver earnings per hour fell 6.2% and rides per driver per day fell 4.8% versus pre-experiment baseline. In a valid experiment with no spillover, control group metrics should be stable versus baseline. These declines are the signature of demand absorption by the treatment group.',
        severity: 'critical'
      },
      {
        id: 'wf-measured-lift-inflated',
        label: 'The +8.4% lift includes a spillover inflation component — true lift at full deployment is unknown',
        description: 'At full deployment (100% of drivers receive the bonus), the demand-absorption effect disappears — all drivers are equally incentivized. The +8.4% lift measured in the experiment includes the artificial advantage treatment drivers had over control drivers. The true incremental lift of giving the bonus to all drivers is lower than +8.4%, by an unknown amount.',
        severity: 'critical'
      }
    ],

    decisions: [
      {
        id: 'ship',
        label: 'Ship — p=0.02 is significant and the bonus produces a real driver behavior change.',
        description: 'The lift is real and significant. Ship to all drivers.',
        score: 'junior_miss',
        feedback: 'The +8.4% lift includes a spillover inflation component from SUTVA violation. Treatment drivers performed better partly because control drivers in the same city were completing fewer rides — demand was being absorbed by treatment drivers, making more rides available to them. At full deployment, this within-city demand absorption effect vanishes. The true completion rate lift at full deployment is lower than +8.4%. Shipping on the experimental result without accounting for the SUTVA violation overstates the expected platform-level benefit.'
      },
      {
        id: 'rollback',
        label: 'The result is untrustworthy — SUTVA violation means the experiment tells us nothing.',
        description: 'The SUTVA violation makes the experiment results meaningless.',
        score: 'analyst_ready',
        feedback: 'The SUTVA violation makes the result unreliable, not meaningless. The bonus almost certainly has some positive effect on completion rate — treatment drivers changed their behavior in response to the incentive. The question is whether the effect size at scale is large enough to justify the bonus cost. The experiment overstates that effect. The correct response is to redesign as a geographic holdout experiment to get a clean estimate, not to abandon the bonus concept entirely.'
      },
      {
        id: 'geo-holdout',
        label: 'Block the ship. Redesign as a geographic holdout: 9 cities treatment, 9 cities control. Re-run for 4 weeks.',
        description: 'User-level randomization violates SUTVA in a two-sided marketplace. Geographic randomization is the correct design.',
        score: 'senior_ready',
        feedback: 'This is the correct call. Geographic randomization removes the within-city SUTVA violation by ensuring treatment and control drivers do not compete for the same rider demand. In a 9-city / 9-city design, treatment cities have all drivers on the bonus and control cities have no drivers on the bonus. The measured lift reflects the true population effect of the bonus, including its impact on city-level supply equilibrium. The cost is a smaller city-level N (9 vs. 170,000 drivers), which requires longer runtime or city-level covariate adjustment for clean inference.'
      },
      {
        id: 'apply-correction',
        label: 'Apply a statistical correction for the SUTVA violation and use the corrected estimate for the ship decision.',
        description: 'Adjust the effect estimate for spillover.',
        score: 'analyst_ready',
        feedback: 'Spillover correction methods exist (e.g., bipartite interference models, network exposure models) but are complex and their assumptions are strong. Applying a post-hoc correction to a SUTVA-violated experiment is not standard practice — the corrected estimate will have wide uncertainty. The cleaner and more defensible path is to re-run with geographic randomization. Post-hoc correction is acceptable when re-running is impossible; here, a 4-week geo holdout is feasible.'
      }
    ],

    idealDecision: 'geo-holdout',
    secondBestDecision: 'apply-correction',

    juniorMistake: 'Ships based on p=0.02 without asking whether treatment and control units are independent. Does not know what SUTVA is or when it is violated. Does not check control group trends versus pre-experiment baseline.',

    seniorFlags: [
      'The SUTVA check for marketplace experiments is mandatory and should be part of the experiment design review, not post-hoc analysis. For any two-sided marketplace experiment, ask immediately: do treatment and control units compete for the same supply or demand? If yes, user-level randomization is invalid. The correct unit of randomization is the market (city, region, time window).',
      'The signature of SUTVA violation in a supply-competition experiment is a declining control group. If control driver metrics are declining versus pre-experiment baseline while treatment driver metrics are rising, demand is being transferred from control to treatment — not created by treatment. That is the spillover pattern.',
      'The true platform-level effect of giving the bonus to all drivers is not the +8.4% measured in the experiment. At 100% deployment, all drivers are equally incentivized. The demand absorption advantage treatment drivers had over control drivers disappears. The actual completion rate lift at scale is determined by the behavioral incentive effect alone, stripped of the spillover inflation.'
    ],

    staffFlags: [
      'Would have required a two-sided marketplace SUTVA assessment at experiment design. The standard question: "Does treatment of any driver change the outcome for any other driver?" In a ride-matching system with shared demand, the answer is obviously yes. User-level randomization was never appropriate.',
      'Would have suggested adding a pre-registered power analysis for the geographic holdout design before running either experiment. At 18 cities, a 9/9 geographic split provides limited degrees of freedom — pre-experiment variance in city-level completion rates is high, and the geo holdout may also need covariate adjustment (synthetic control or DiD) to achieve adequate precision.'
    ],

    debrief: 'SUTVA — the Stable Unit Treatment Value Assumption — is the foundation of valid A/B experimentation. It requires that the potential outcome for any unit depends only on that unit\'s treatment assignment, not on the treatment assignment of other units.\n\nIn a two-sided marketplace, user-level randomization almost always violates SUTVA. When treatment drivers and control drivers share the same rider demand pool in the same city, any change in treatment driver behavior directly affects control driver outcomes. Treatment drivers completing more rides means fewer rides are available to control drivers. The control group\'s completion rate is being artificially depressed — not by the absence of the bonus, but by the presence of the bonus in the treatment group.\n\nThe diagnostic is clear: control driver earnings and ride volume declined versus pre-experiment baseline during the experiment. In a valid experiment, the control group should be a stable reference. A declining control is the signature of spillover.\n\nThe +8.4% lift is a measurement of "treatment drivers versus disadvantaged control drivers in the same demand pool." It is not a measurement of "what happens to completion rates when the bonus is applied to all drivers." Those are different questions with different answers.\n\nAt full deployment (100% of drivers on the bonus), the demand absorption dynamic disappears — all drivers are equally incentivized and there is no control group to absorb demand from. The true platform-level effect is the behavioral incentive effect alone, which is likely positive but smaller than +8.4%.\n\nThe correct experimental design for this question is a geographic holdout: 9 cities where all drivers receive the bonus, versus 9 cities where no drivers receive the bonus. Rider demand does not flow between cities, so SUTVA is satisfied at the city level. The measured city-level completion rate difference reflects the true treatment effect.',

    interviewTakeaway: 'In two-sided marketplaces, user-level randomization violates SUTVA when treatment and control units compete for the same supply or demand. The correct unit of randomization is the market (city, region). A declining control group versus pre-experiment baseline is the empirical signature of within-market SUTVA spillover.',

    relatedConcepts: ['SUTVA', 'interference', 'geo holdout', 'two-sided marketplace', 'network effects', 'experimental unit'],
    scenarioFamily: 'geo_holdout',
    tags: ['two-sided marketplace', 'SUTVA', 'spillover', 'geo holdout', 'rideshare', 'driver incentives']
  },

  // ─────────────────────────────────────────────
  // SCENARIO 22 — The Washout You Skipped
  // Theme: switchback
  // ─────────────────────────────────────────────
  {
    id: 's22-washout-skipped',
    title: 'The Washout You Skipped',
    subtitle: 'Switchback experiment shows +14% revenue. Eight weeks of alternating periods. No washout between them.',
    isFree: false,
    industry: 'marketplace',
    difficulty: 'senior',
    theme: 'switchback',

    context: {
      company: 'Driftline',
      product: 'Food delivery two-sided marketplace — 28 cities, 180K active couriers, 3.8M monthly orders',
      team: 'Pricing and Algorithms team',
      background: 'Driftline\'s Pricing team tested a new surge pricing algorithm using a switchback experiment design. The experiment alternated weekly: odd weeks used the new surge algorithm (treatment), even weeks used the existing pricing (control). The experiment ran for 8 weeks (4 treatment weeks, 4 control weeks) in all 28 cities simultaneously.\n\nResults: treatment weeks showed +14.2% revenue per city per day and +3.2% cancellation rate compared to control weeks. The team is preparing to ship the new surge algorithm.\n\nA Staff DS reviewing the results asks: "What was the washout period between alternating periods?" Answer: none. The team switched directly from control to treatment and back at midnight on Sunday.',
      businessPressure: 'Driftline\'s revenue per order has been flat for three quarters. The new surge algorithm is the Pricing team\'s flagship project. The VP of Marketplace has allocated engineering resources for a full deployment. The +14.2% revenue result is already in the leadership OKR tracker.'
    },

    hypothesis: 'A new surge pricing algorithm that dynamically prices based on real-time supply-demand imbalance will increase revenue per city per day compared to the existing surge pricing logic.',

    experimentDesign: {
      type: 'switchback',
      allocation: 'Weekly alternation (odd weeks = treatment, even weeks = control)',
      runtime: '8 weeks (4 treatment weeks, 4 control weeks)',
      targetPopulation: 'All 28 cities, all couriers and customers',
      primaryMetric: 'Revenue per city per day',
      guardrailMetrics: ['Cancellation rate', 'Courier earnings per hour', 'Customer satisfaction score (weekly)'],
      sampleSizeContext: '4 treatment weeks vs. 4 control weeks. No washout period between alternating weeks. Courier behavior (acceptance patterns, hours worked) adapts to pricing regime and may persist 24–72 hours after a regime change.'
    },

    metricReadout: [
      {
        metric: 'Revenue per city per day',
        type: 'primary',
        direction: 'up',
        delta: '+14.2%',
        pValue: 0.03,
        confidenceInterval: '[+1.8%, +26.6%]',
        significant: true,
        note: 'Significant. But the absence of a washout period means treatment periods include up to 72 hours of carryover from the preceding control period (and vice versa). Courier supply patterns, platform liquidity, and customer ordering behavior adapt to the pricing regime and do not reset instantly at midnight. Without washout, the treatment periods\' first 2–3 days reflect a mix of the new algorithm\'s direct effect and behavioral residue from the prior week\'s control conditions.'
      },
      {
        metric: 'Cancellation rate',
        type: 'guardrail',
        direction: 'up',
        delta: '+3.2pp',
        pValue: 0.04,
        confidenceInterval: '[+0.3pp, +6.1pp]',
        significant: true,
        note: 'GUARDRAIL BREACH. Cancellation rate is significantly elevated in treatment periods. Some of this may be a direct effect of higher surge prices (customers cancel when surge is high). Some may be carryover from courier supply adjustments in the transition from control to treatment weeks.'
      },
      {
        metric: 'Courier earnings per hour',
        type: 'guardrail',
        direction: 'up',
        delta: '+4.8%',
        pValue: 0.06,
        confidenceInterval: '[-0.2%, +9.8%]',
        significant: false,
        note: 'Directionally positive (couriers earn more in surge conditions) but not significant. This is expected if surge pricing creates more high-value orders per courier hour.'
      },
      {
        metric: 'Day-1 vs. Day-7 revenue within treatment periods (carryover diagnostic)',
        type: 'diagnostic',
        direction: 'neutral',
        delta: 'Day 1–2 of treatment periods: +6.8% vs. control baseline. Day 5–7 of treatment periods: +18.1% vs. control baseline.',
        pValue: null,
        confidenceInterval: null,
        significant: false,
        note: 'Revenue lift within treatment periods is lower in the first 2 days and significantly higher in days 5–7. This is the carryover signature: the first days of a new period are contaminated by the prior period\'s behavioral state. Couriers and customers haven\'t fully adapted to the new regime yet. The "steady state" treatment effect (days 5–7) is higher than the blended average. Conversely, the first days of control periods may be elevated by prior treatment carryover — meaning the control baseline is also contaminated.'
      }
    ],

    warningFlags: [
      {
        id: 'wf-no-washout',
        label: 'No washout period between alternating weeks — carryover contaminates both treatment and control periods',
        description: 'Switchback experiments require washout periods between alternating conditions to allow behavioral state to reset. Courier supply decisions (when to come online, how many hours to work), customer order habits, and platform liquidity all adapt to the pricing regime over multiple days. Without a 48–72 hour washout period, the first days of each new period reflect the prior period\'s behavioral residue. Treatment periods that follow control weeks start with supply-constrained conditions (couriers haven\'t yet responded to higher surge prices). Control periods that follow treatment weeks start with supply-inflated conditions (couriers are still working extra hours from the prior surge week).',
        severity: 'critical'
      },
      {
        id: 'wf-inflation-in-treatment',
        label: 'Day-1–2 vs. Day-5–7 within-period revenue divergence confirms carryover',
        description: 'Revenue lift within treatment periods is +6.8% in days 1–2 and +18.1% in days 5–7. A valid switchback without carryover should show consistent lift across all days of a period (assuming no novelty effect). The lower-than-average lift in the first days of treatment periods and the higher-than-average lift in later days is the signature of behavioral carryover: early days are blended with prior-period behavior, late days reflect the new regime\'s steady state.',
        severity: 'critical'
      },
      {
        id: 'wf-cancellation-confounded',
        label: 'Cancellation rate breach may be partly carryover artifact — direct effect size unknown',
        description: 'The +3.2pp cancellation rate increase in treatment periods is a confirmed guardrail breach. However, the cancellation rate in the first 2 days of treatment periods (when carryover is highest) versus days 5–7 has not been isolated. If cancellations spike in the transition period (customers encountering sudden surge pricing before courier supply has adjusted), the breach may attenuate in steady-state. This does not eliminate the concern — but it affects how to interpret the magnitude.',
        severity: 'warning'
      }
    ],

    decisions: [
      {
        id: 'ship',
        label: 'Ship the new surge algorithm — +14.2% revenue with p=0.03 is significant.',
        description: 'The result is significant. Ship.',
        score: 'junior_miss',
        feedback: 'The +14.2% revenue lift is upward-biased by carryover contamination. The day-1–2 versus day-5–7 within-period analysis shows that early treatment days (contaminated by control carryover) show only +6.8% lift while late treatment days (approaching steady state) show +18.1%. The blended +14.2% is a mix of contaminated and clean periods. The true steady-state lift may be higher than +14.2% — but it may also be driven partly by artificially low control-period baselines (contaminated by prior treatment carryover). You cannot separate these effects without a washout. Shipping on a carryover-contaminated result risks deploying the wrong version of the algorithm or miscalibrating the expected revenue impact.'
      },
      {
        id: 'rollback',
        label: 'Rollback — the cancellation rate breach and carryover contamination mean the result is untrustworthy.',
        description: 'The experiment is invalid. Abandon the new algorithm.',
        score: 'analyst_ready',
        feedback: 'The result is contaminated, not invalid. The surge algorithm has a real effect — the question is whether the true steady-state effect is large enough to justify the cancellation rate cost. Abandoning a Pricing team flagship project because of a methodological flaw in the experiment design is overcorrection. The correct response is to re-run with a properly designed switchback experiment (48–72h washout between periods) to get a clean estimate of both the revenue lift and the cancellation rate impact.'
      },
      {
        id: 'investigate-carryover',
        label: 'Block the ship. Run a carryover analysis. If contamination is material, re-run the switchback with a 48–72h washout period.',
        description: 'The absence of washout means the result is upward-biased. Quantify the bias before deciding.',
        score: 'senior_ready',
        feedback: 'This is the right call. First, quantify the carryover contamination: compare the average treatment effect in days 1–2 of each treatment period versus days 5–7. If the day-1–2 lift is materially different from the day-5–7 lift, carryover is meaningful and the blended estimate is biased. If the day-1–2 and day-5–7 lifts are similar, carryover is minimal and the result may be defensible. If contamination is material, re-run with 48–72h washout periods excluded from analysis. This takes 12–14 weeks to run properly, but delivers a clean result that can support a reliable shipping decision.'
      },
      {
        id: 'extend',
        label: 'Run the switchback for 4 more weeks to increase power and smooth out the carryover.',
        description: 'More periods will average out the carryover effect.',
        score: 'analyst_ready',
        feedback: 'More periods do not fix the carryover problem — they average it across more contaminated observations. If every period transition involves 2 days of carryover and the period length is 7 days, extending to 8 more periods still gives you 2/7 contaminated days per period. The fix is to either exclude the washout days from each period\'s analysis or to add explicit washout periods between alternating conditions. Adding more contaminated observations does not reduce the bias; it just averages it over more data points.'
      }
    ],

    idealDecision: 'investigate-carryover',
    secondBestDecision: 'rollback',

    juniorMistake: 'Ships based on p=0.03 without asking about washout periods or checking within-period temporal patterns. Does not understand that switchback experiments require behavioral state to reset between conditions. Treats the cancellation rate breach as a minor caveat.',

    seniorFlags: [
      'The first question for any switchback experiment result is: what was the washout period, and how long does behavioral adaptation take for this metric? If adaptation time is longer than the washout, the result is contaminated. For courier supply behavior, adaptation takes 24–72 hours. A zero-washout weekly switchback is contaminated by construction.',
      'The within-period temporal diagnostic (days 1–2 vs. days 5–7) is the standard carryover detection test for switchback experiments. A valid experiment should show consistent lift across all days of a period. A rising lift pattern within treatment periods (6.8% → 18.1%) indicates the treatment period starts from a carryover-depressed baseline — control-period courier supply hasn\'t fully wound down when the treatment period begins.',
      'The cancellation rate guardrail breach should be interpreted carefully in the carryover context. If cancellations spike during the first 1–2 days of surge periods (customers encountering surge pricing before courier supply has adjusted to the new incentive), the breach is partly a transition artifact. The steady-state cancellation rate under the new algorithm may be lower than the blended +3.2pp. But this doesn\'t make the breach go away — it means the carryover analysis needs to be done before any ship decision.'
    ],

    staffFlags: [
      'Would have required washout periods at experiment design. Standard practice for switchback experiments in two-sided marketplaces is 48–72h washout between alternating conditions, with washout days excluded from analysis. This reduces usable data but eliminates the carryover contamination.',
      'Would have pre-registered the within-period temporal diagnostic as part of the analysis plan: confirm that the treatment effect is stable across all days of a period before treating the blended average as a valid estimate. For any metric involving behavioral adaptation (supply, demand, pricing response), the steady-state effect and the transition effect are different quantities and should be analyzed separately.'
    ],

    debrief: 'Switchback experiments are time-series experiments. They work by alternating between treatment and control conditions over time and attributing outcome differences to the condition active during each period. The validity assumption is that the conditions are independent — the outcome in period T depends only on the condition in period T, not on the history of prior conditions.\n\nCarryover violates that assumption.\n\nIn a food delivery marketplace, courier supply decisions are adaptive. When surge pricing is active, couriers learn to come online more frequently and work longer hours because the returns are higher. When surge pricing turns off, those supply behaviors don\'t reset instantly at midnight — couriers wind down gradually over 24–72 hours. Similarly, customers\' ordering patterns shift in response to pricing and take time to normalize.\n\nWhen the experiment switches from treatment (surge) to control (standard pricing) at midnight Sunday with no washout, the first days of the control week start with elevated courier supply inherited from the surge week. Control revenue may be artificially high. When the experiment switches from control back to treatment, the first days of the treatment week start with below-average courier supply. Treatment revenue may be artificially low at the start of each period.\n\nThe within-period diagnostic is the evidence: days 1–2 of treatment periods show +6.8% lift; days 5–7 show +18.1%. If there were no carryover, this gradient should be flat. It is not flat. Treatment periods are starting from contaminated baselines and building toward steady state.\n\nThe blended +14.2% is an average across contaminated early days and cleaner late days. The true steady-state treatment effect may be closer to +18%, but the control baseline during the same experiment may also be inflated by prior treatment carryover — making the true net effect unknown.\n\nThe correct path: run the carryover diagnostic first, quantify the contamination, and if material, re-run with 48–72h washout periods excluded from analysis.',

    interviewTakeaway: 'Switchback experiments require behavioral washout between alternating periods. Carryover occurs when behavioral adaptation to one condition persists into the next. The diagnostic is a within-period temporal analysis: if treatment effect grows from early days to late days within each period, the early days are contaminated by prior-period carryover. Always specify the washout period at experiment design for any metric involving behavioral adaptation.',

    relatedConcepts: ['switchback experiment', 'carryover effect', 'washout period', 'time-series experiment', 'behavioral adaptation', 'interference'],
    scenarioFamily: 'switchback',
    tags: ['switchback', 'carryover', 'washout', 'surge pricing', 'two-sided marketplace', 'food delivery']
  },

  // ─────────────────────────────────────────────
  // SCENARIO 23 — The Bot That Broke Randomization
  // Theme: srm
  // ─────────────────────────────────────────────
  {
    id: 's23-bot-traffic-srm',
    title: 'The Bot That Broke Randomization',
    subtitle: 'Pricing page redesign shows +18% conversion. SRM detected. Treatment arm has a bot traffic problem.',
    isFree: false,
    industry: 'b2b_saas',
    difficulty: 'senior',
    theme: 'srm',

    context: {
      company: 'Nexus',
      product: 'B2B SaaS platform — project management and workflow automation, ~12K paying accounts, mid-market focus',
      team: 'Growth and Monetization team',
      background: 'Nexus ran a 50/50 A/B test of a redesigned pricing page. The new design simplified the three-tier pricing table, added a calculator widget showing estimated ROI, and restructured the CTA hierarchy. The experiment ran for 14 days targeting anonymous visitors to the /pricing URL.\n\nThe automated SRM check flagged an imbalance: control received 48.2% of traffic, treatment received 51.8%. Chi-square p-value for the SRM: 0.002. The analyst notes this is a 3.6% relative imbalance.\n\nInvestigation reveals that the new pricing page URL pattern (/pricing/v2 during the experiment) was picked up by a pricing intelligence scraper — a bot service that B2B competitors use to monitor each other\'s pricing. The scraper made ~4,200 additional visits to the treatment arm over 14 days, systematically hitting the new URL. These bot sessions inflate treatment traffic counts but do not convert. The bot sessions are identifiable: they share three user-agent strings, have zero time-on-page, and made no downstream pageviews.\n\nPrimary metric: free trial signup rate (visitor to trial). Treatment shows +18% lift (p=0.03).',
      businessPressure: 'The Growth team has been trying to improve pricing page conversion for two quarters. The VP of Growth sees the +18% result and wants to ship before the end-of-quarter deadline. The analyst argues that the SRM is "small" — only a 3.6% imbalance — and that bot sessions don\'t convert anyway, so the conversion metric is unaffected.'
    },

    hypothesis: 'A simplified pricing page with an ROI calculator and restructured CTA hierarchy will increase free trial signup rate compared to the current pricing page.',

    experimentDesign: {
      type: 'a/b',
      allocation: '50/50',
      runtime: '14 days',
      targetPopulation: 'Anonymous visitors to the /pricing URL (~18,400 sessions per arm before SRM)',
      primaryMetric: 'Free trial signup rate (visitor to free trial)',
      guardrailMetrics: ['Time-on-page (median)', 'Pricing page bounce rate', 'Demo request rate'],
      sampleSizeContext: 'Powered to detect a 10% relative lift in free trial signup rate at 80% power. Bot sessions identified post-hoc: ~4,200 sessions concentrated in treatment arm, zero conversions, identifiable by user-agent.'
    },

    metricReadout: [
      {
        metric: 'Free trial signup rate — all traffic',
        type: 'primary',
        direction: 'up',
        delta: '+18%',
        pValue: 0.03,
        confidenceInterval: '[+1.9%, +34.1%]',
        significant: true,
        note: 'Significant on full traffic. However, SRM is confirmed (p=0.002). Bot traffic in treatment arm (4,200 sessions, zero conversions) inflates the treatment denominator artificially, making the conversion rate appear higher relative to what it would be with clean traffic.'
      },
      {
        metric: 'Free trial signup rate — bot sessions excluded',
        type: 'diagnostic',
        direction: 'up',
        delta: '+9.4%',
        pValue: 0.18,
        confidenceInterval: '[-4.4%, +23.2%]',
        significant: false,
        note: 'When the 4,200 identified bot sessions are removed from the treatment denominator, the lift drops to +9.4% and loses significance. The CI is wide. The true effect may exist but the experiment cannot confirm it.'
      },
      {
        metric: 'SRM check (traffic allocation)',
        type: 'diagnostic',
        direction: 'neutral',
        delta: 'Control: 48.2% | Treatment: 51.8%',
        pValue: 0.002,
        confidenceInterval: null,
        significant: true,
        note: 'SRM confirmed. The assignment mechanism was compromised by bot traffic targeting the new URL pattern. The randomization assumption is violated regardless of whether bots converted.'
      },
      {
        metric: 'Demo request rate',
        type: 'guardrail',
        direction: 'up',
        delta: '+6.1%',
        pValue: 0.21,
        confidenceInterval: '[-3.5%, +15.7%]',
        significant: false,
        note: 'Directionally positive but not significant. Demo requests are human-only (require form fill), so bot traffic does not inflate this metric. The directionally positive signal is encouraging but insufficient to ship.'
      }
    ],

    warningFlags: [
      {
        id: 'wf-srm-confirmed',
        label: 'SRM confirmed at p=0.002 — assignment mechanism is compromised',
        description: 'A chi-square SRM test at p=0.002 is not a borderline result. The treatment arm received 3.6% more sessions than expected under 50/50 allocation. When the root cause is bot traffic targeting a specific URL pattern, the contamination is systematic — not random noise. The randomization assumption (that units are independently and identically assigned to conditions) is violated. Any result from a contaminated experiment must be treated as unreliable.',
        severity: 'critical'
      },
      {
        id: 'wf-analyst-rationalization',
        label: 'Analyst argument that "bots don\'t convert so the metric is clean" is incorrect',
        description: 'The analyst\'s claim rests on a misunderstanding of what SRM invalidates. The problem is not that bots converted — it is that they inflated the treatment denominator. Free trial signup rate = (signups) / (total sessions). If the treatment arm has 4,200 extra zero-conversion sessions, the denominator is artificially inflated, which would actually suppress the treatment rate — meaning the true conversion rate (signups per human session) in treatment is higher than reported. But the assignment mechanism is still broken: we cannot be confident that the human sessions in treatment are drawn from the same distribution as control. Bot traffic may have displaced human sessions, changed page load characteristics, or arrived at specific times that are correlated with conversion propensity.',
        severity: 'critical'
      },
      {
        id: 'wf-bot-sessions-diagnostic',
        label: 'Bot sessions identifiable post-hoc — exclusion analysis shows result loses significance',
        description: 'When the 4,200 bot sessions (identified by user-agent, zero time-on-page, no downstream pageviews) are excluded from the treatment arm, the lift drops from +18% to +9.4% and p rises from 0.03 to 0.18. The experiment was powered to detect a 10% relative lift. After bot exclusion, the point estimate is below the minimum detectable effect and the CI spans null. The +18% result was partly an artifact of denominator inflation.',
        severity: 'critical'
      },
      {
        id: 'wf-url-pattern-exposure',
        label: 'Root cause is the new URL pattern — fix before rerunning',
        description: 'The bot targeted /pricing/v2, the URL used for the treatment variant. If the experiment is rerun without changing the URL pattern or adding bot filtering, the same contamination will recur. Before rerunning, either serve both variants from the same URL (variant determined by cookie/session flag server-side), implement bot filtering at the CDN layer, or add rate limiting on pricing page requests by user-agent.',
        severity: 'warning'
      }
    ],

    decisions: [
      {
        id: 'ship',
        label: 'Ship the new pricing page — +18% conversion is significant and bots don\'t convert.',
        description: 'The SRM is small and the metric is unaffected by non-converting bots.',
        score: 'junior_miss',
        feedback: 'This reasoning has two errors. First, the SRM is not "small" — a p=0.002 SRM test result is a strong signal that the assignment mechanism failed. Second, the analyst\'s logic that "bots don\'t convert so the metric is clean" misidentifies the problem. Bots inflated the treatment denominator, suppressing the apparent treatment conversion rate. When bots are removed, the lift drops from +18% to +9.4% and becomes non-significant. The experiment cannot support a ship decision in its current state.'
      },
      {
        id: 'invalidate-rerun',
        label: 'Invalidate the experiment. Fix bot filtering and URL exposure. Rerun with a clean assignment mechanism.',
        description: 'SRM with a known root cause means the experiment is invalid. Fix the cause, then rerun.',
        score: 'senior_ready',
        feedback: 'This is the right call. The SRM root cause is identified and fixable: the new page URL was publicly discoverable by a pricing scraper. The fix is to serve both variants from the same URL (with variant assignment via a server-side cookie or session flag) and add bot filtering at the CDN layer before rerunning. The directionally positive demo request rate (+6.1%) gives some encouragement that the new page may have a real effect, but the experiment result itself cannot be trusted. Rerun with clean randomization.'
      },
      {
        id: 'exclude-bots-ship',
        label: 'Exclude the identified bot sessions from both arms and ship on the cleaned result.',
        description: 'Bot sessions are identifiable — just remove them and use the cleaned result.',
        score: 'analyst_ready',
        feedback: 'Excluding identified bots is a reasonable diagnostic step, and doing so correctly shows the result drops to +9.4% (p=0.18) — non-significant. But even if the cleaned result were significant, bot exclusion post-hoc does not fully restore the validity of the experiment. We identified bots by user-agent and behavioral signals, but we cannot be certain we caught all of them. More importantly, the presence of systematic bot traffic in the treatment arm may have affected page load times, CDN caching, or session queue behavior during the experiment window in ways that aren\'t fully undone by exclusion. A clean rerun is the right path.'
      },
      {
        id: 'extend',
        label: 'Extend the experiment for another 14 days with bot filtering active.',
        description: 'Keep running but add filtering so the new data is clean.',
        score: 'analyst_ready',
        feedback: 'Extending the experiment after discovering that the first 14 days were contaminated does not retroactively fix the contaminated period. If you pool the contaminated and clean periods, the result is still partially invalid. The correct approach is to stop the current experiment, fix the assignment mechanism, and start a fresh experiment with a clean randomization record. Running an extension on top of a contaminated base compounds the problem.'
      },
      {
        id: 'ship-mobile-only',
        label: 'Ship to a 10% traffic slice to validate before full rollout.',
        description: 'A partial rollout limits risk while we get more signal.',
        score: 'junior_miss',
        feedback: 'A partial rollout does not address the underlying problem: the experiment result is invalid due to SRM. A 10% rollout of an untested change is not the same as a validated experiment result. The pricing page affects a high-intent conversion funnel — shipping an untested variant to any real traffic without valid experimental evidence is a risk that isn\'t justified by a contaminated positive result.'
      }
    ],

    idealDecision: 'invalidate-rerun',
    secondBestDecision: 'exclude-bots-ship',

    juniorMistake: 'Ships on +18% because the p-value is significant and accepts the analyst\'s argument that bots don\'t affect a conversion metric. Does not understand that denominator inflation affects conversion rates, and does not follow through on what SRM actually invalidates.',

    seniorFlags: [
      'Any SRM with a confirmed root cause is a full invalidation — not a "small" problem to adjust around. The root cause here (URL pattern exposure to a pricing scraper) is systematic and reproducible, meaning the contamination is not random. Analytical adjustment of the denominator does not restore the independence of the assignment mechanism.',
      'The bot-exclusion diagnostic is the right analysis to run, but the correct interpretation is: "after removing identified bots, the result is non-significant at p=0.18." This is not a reason to ship — it is a reason to rerun. The experiment was underpowered relative to the true effect size once contamination is removed.',
      'The demo request rate (+6.1%, p=0.21) is the most trustworthy signal in this readout because demo requests require a human form fill — bots cannot inflate this metric. The directionally positive demo rate is weak evidence that the new page has a real effect, but it is not sufficient to ship without a clean experiment.'
    ],

    staffFlags: [
      'Would have required at experiment design that both variants be served from the same URL, with variant assignment handled server-side (cookie or session hash). Exposing variant-specific URLs to public traffic is a known SRM risk for any product with competitive intelligence scrapers — which includes virtually all B2B SaaS pricing pages.',
      'Would have pre-registered bot filtering criteria before the experiment started, not post-hoc. Post-hoc bot identification creates a garden-of-forking-paths problem: if the result had been null, would we have looked for bots? Pre-registration of exclusion criteria is part of a clean experimental protocol.'
    ],

    debrief: 'SRM (Sample Ratio Mismatch) invalidates an experiment regardless of how compelling the primary metric result looks. The intuition behind this is simple: if the assignment mechanism is broken, we cannot assume the treatment and control groups are comparable. Any difference in outcomes might reflect a difference in the groups, not a difference caused by the treatment.\n\nIn this case, the SRM root cause is unusually clear: a pricing intelligence scraper picked up the new treatment URL and made ~4,200 bot visits to the treatment arm over 14 days. The analyst\'s defense — "bots don\'t convert, so the conversion metric is clean" — sounds reasonable but is wrong in two ways.\n\nFirst, it misidentifies what SRM invalidates. The problem is not that bots converted. The problem is that their presence in the treatment arm (and not the control arm) means the two arms are no longer equivalent populations of human visitors. Bot traffic may have arrived at specific times of day, may have affected page caching or CDN behavior, or may have crowded out human sessions during high-traffic periods. These second-order effects are not visible in the conversion metric but they undermine the comparability assumption.\n\nSecond, the exclusion analysis confirms the practical impact: when the 4,200 bot sessions are removed from the treatment denominator, the lift drops from +18% to +9.4% and the result becomes non-significant (p=0.18). The experiment was powered to detect a 10% relative lift — the cleaned point estimate is below that threshold and the CI spans null.\n\nThe right call is to invalidate the experiment, fix the URL exposure problem (serve both variants from the same URL with server-side assignment), implement CDN-level bot filtering, and rerun. The directionally positive demo request rate (+6.1%) — a human-only signal — offers some encouragement that the new page may genuinely outperform, but it is not sufficient evidence on its own.\n\nThe process failure here is the lack of pre-registered bot exclusion criteria. If the experiment had pre-specified "sessions with zero time-on-page and known scraper user-agents will be excluded," the post-hoc exclusion would carry more weight. Without pre-registration, post-hoc exclusion is a forking path.',

    interviewTakeaway: 'SRM with a confirmed root cause is a full experiment invalidation — not a small adjustment. The argument that "non-converting bots don\'t affect a conversion metric" is wrong: bots inflate the denominator and may affect group comparability in ways not visible in the top-line metric. The correct call is to identify the root cause, fix the assignment mechanism, and rerun. Always pre-register bot exclusion criteria before the experiment starts.',

    relatedConcepts: ['sample ratio mismatch', 'bot traffic', 'assignment mechanism', 'denominator inflation', 'experiment invalidation', 'pre-registration'],
    scenarioFamily: 'srm',
    tags: ['srm', 'bot traffic', 'pricing page', 'b2b saas', 'conversion', 'url exposure', 'experiment invalidation']
  },

  // ─────────────────────────────────────────────
  // SCENARIO 24 — The Consent Banner That Broke the Split
  // Theme: srm
  // ─────────────────────────────────────────────
  {
    id: 's24-cookie-consent-srm',
    title: 'The Consent Banner That Broke the Split',
    subtitle: 'New checkout flow shows SRM 54/46. Root cause: the new flow triggers a different cookie consent banner that bounces users before assignment completes.',
    isFree: false,
    industry: 'marketplace',
    difficulty: 'senior',
    theme: 'srm',

    context: {
      company: 'Crafted',
      product: 'Consumer marketplace for handmade goods — EU-focused, 2.1M monthly active buyers, 340K sellers',
      team: 'Checkout and Conversion team',
      background: 'Crafted ran a 50/50 A/B test of a redesigned checkout flow. The new flow consolidated three checkout steps into two, surfaced saved payment methods earlier, and added a real-time delivery estimate. The experiment targeted all EU buyers initiating checkout over a 21-day window.\n\nSRM check: control received 54% of assigned sessions, treatment received 46%. Chi-square p-value: <0.001.\n\nRoot cause investigation: Crafted\'s cookie consent implementation (required under GDPR) is triggered at the page level. The existing checkout flow (control) uses a page that already has a prior consent record for most returning users — the consent banner rarely fires. The new checkout flow (treatment) uses a newly created page path that does not inherit the prior consent cookie, causing the GDPR consent banner to fire for all users on their first visit to the new path. A significant fraction of users — concentrated among mobile users on slow connections — bounce when the consent banner fires mid-checkout before the page fully loads. These users exit before their session is properly logged in the experiment assignment table.\n\nResult: treatment arm is systematically missing a portion of sessions (the bounced-on-consent users), making it appear smaller. Primary metric: checkout completion rate. Treatment shows +11% lift (p=0.04).',
      businessPressure: 'The Checkout team has been working on this redesign for six weeks. The PM argues: "We know why the SRM happened — the consent banner. That\'s a known GDPR limitation in EU. We can adjust the results analytically by reweighting for the missing sessions. The conversion lift is real." The Head of Engineering wants to ship before the holiday season.'
    },

    hypothesis: 'Consolidating checkout into two steps and surfacing saved payment methods earlier will increase checkout completion rate compared to the three-step checkout flow.',

    experimentDesign: {
      type: 'a/b',
      allocation: '50/50',
      runtime: '21 days',
      targetPopulation: 'EU buyers initiating checkout (~94,000 sessions per arm expected under clean 50/50)',
      primaryMetric: 'Checkout completion rate (checkout initiated to order placed)',
      guardrailMetrics: ['Payment error rate', 'Time-to-complete checkout (median)', 'Customer support contacts within 24h of purchase'],
      sampleSizeContext: 'Powered to detect a 5% relative lift at 80% power. SRM identified: control 54%, treatment 46% of assigned sessions. Consent-bounce users are missing from assignment records — their sessions are not logged before exit.'
    },

    metricReadout: [
      {
        metric: 'Checkout completion rate — as-logged',
        type: 'primary',
        direction: 'up',
        delta: '+11%',
        pValue: 0.04,
        confidenceInterval: '[+0.6%, +21.4%]',
        significant: true,
        note: 'Significant on logged sessions. But the SRM means the treatment arm is systematically missing users who bounced on the consent banner — these are real users who were assigned to treatment but exited before being logged. The treatment arm is a survivor-biased sample: it over-represents users who made it past the consent banner, who are systematically different (higher intent, better connection, desktop-skewed).'
      },
      {
        metric: 'SRM check (session allocation)',
        type: 'diagnostic',
        direction: 'neutral',
        delta: 'Control: 54% | Treatment: 46%',
        pValue: 0.001,
        confidenceInterval: null,
        significant: true,
        note: 'SRM confirmed. The consent banner fires for all treatment sessions on a new page path and causes a mobile-concentrated bounce before session logging. The missing sessions are not random — they are skewed toward mobile, lower-bandwidth users with lower average order values.'
      },
      {
        metric: 'Treatment arm: mobile vs. desktop session share',
        type: 'diagnostic',
        direction: 'neutral',
        delta: 'Control: 58% mobile | Treatment: 44% mobile',
        pValue: null,
        confidenceInterval: null,
        significant: false,
        note: 'The mobile share in the treatment arm is 14pp lower than in control. This is the demographic signature of the consent-bounce SRM: mobile users on slower connections are disproportionately lost from treatment before session logging. The treatment arm\'s logged sessions skew toward desktop users, who have higher average order values and higher baseline completion rates.'
      },
      {
        metric: 'Checkout completion rate — desktop users only',
        type: 'diagnostic',
        direction: 'up',
        delta: '+4.2%',
        pValue: 0.31,
        confidenceInterval: '[-3.9%, +12.3%]',
        significant: false,
        note: 'When restricted to desktop users (where the SRM-induced demographic shift is minimal), the lift is +4.2% and non-significant. This is more representative of what a clean experiment would show for desktop. Mobile-only analysis is confounded by the consent-bounce selection.'
      }
    ],

    warningFlags: [
      {
        id: 'wf-srm-assignment-broken',
        label: 'SRM root cause is in the assignment mechanism itself — analytical adjustment cannot fix broken randomization',
        description: 'The consent banner fires before session assignment is logged. This means the treatment arm never records these users at all — they are not assigned-and-excluded, they are unassigned. The standard analytical adjustment for SRM (reweighting by observed covariates) assumes the missing units are missing at random conditional on covariates. Here, the missingness is caused by the treatment itself (the new page path triggers the consent banner). This is informative missingness: users who bounce on consent are systematically different from users who complete the consent flow. Reweighting cannot reconstruct what these users would have done in the checkout flow.',
        severity: 'critical'
      },
      {
        id: 'wf-survivor-bias',
        label: 'Treatment arm is a survivor-biased sample — logged treatment users are higher-intent than logged control users',
        description: 'The 14pp mobile shortfall in the treatment arm is direct evidence of survivor bias. Mobile users on slow connections — who are more likely to bounce on the consent banner — are systematically underrepresented in the treatment arm. Mobile users at Crafted have lower average order values and lower baseline checkout completion rates. The treatment arm\'s logged sample skews toward higher-intent, desktop-heavy users. The +11% conversion lift is partly a selection effect: treatment users are a more conversion-prone group, not a representative group.',
        severity: 'critical'
      },
      {
        id: 'wf-pm-analytical-adjustment',
        label: 'PM\'s proposal to "adjust analytically" does not fix a broken assignment mechanism',
        description: 'Post-hoc reweighting can correct for observed covariate imbalances (e.g., if mobile share differs between arms, we can reweight by mobile/desktop). But it cannot account for unobserved differences between users who successfully navigated the consent flow and users who did not. The checkout intent, price sensitivity, and session context of consent-bouncers are unknown. There is no valid analytical path to a trustworthy result from this experiment.',
        severity: 'critical'
      },
      {
        id: 'wf-consent-page-path',
        label: 'Root cause is fixable: new page path must inherit the existing consent cookie',
        description: 'The fix is engineering-level: the new checkout flow\'s page path must be configured to inherit the existing consent cookie state rather than triggering a fresh consent flow. This requires either aliasing the path in the consent management platform or pre-checking consent state before initializing the new checkout page. Once fixed, the consent banner will fire only for genuinely new users — the same rate as control — and the SRM will be eliminated.',
        severity: 'warning'
      }
    ],

    decisions: [
      {
        id: 'ship',
        label: 'Ship the new checkout flow — +11% conversion is significant and the SRM cause is understood.',
        description: 'The SRM is explained. Ship.',
        score: 'junior_miss',
        feedback: 'Understanding why the SRM happened does not validate the result. The treatment arm is a systematically biased sample: it is missing mobile users who bounced on the consent banner before being logged. The logged treatment users over-represent desktop, higher-intent buyers. The +11% lift is at least partly a selection artifact. Shipping an untested checkout flow to all users — including the mobile users who were systematically excluded from the experiment — risks harming the segment that was not represented in the result.'
      },
      {
        id: 'adjust-analytically',
        label: 'Reweight the results by device type and other covariates to correct for the demographic imbalance.',
        description: 'Use inverse probability weighting to adjust for the mobile/desktop imbalance.',
        score: 'analyst_ready',
        feedback: 'Reweighting by observed covariates (device type, past purchase count) can partially correct for the demographic imbalance. But the consent-bounce users are not just different on device type — they are different on unobserved dimensions too (checkout intent, connection quality, price sensitivity). The missingness is caused by the treatment itself, which means the missing-at-random assumption required for valid reweighting is violated. The desktop-only subgroup (where the SRM impact is minimal) shows +4.2% (p=0.31) — non-significant. This is the closest to a clean signal available and it does not support shipping.'
      },
      {
        id: 'invalidate-fix-rerun',
        label: 'Invalidate the experiment. Fix the consent cookie inheritance on the new page path. Rerun with clean assignment.',
        description: 'The assignment mechanism is broken. Fix the root cause and rerun.',
        score: 'senior_ready',
        feedback: 'This is the correct call. The root cause is a specific, fixable engineering issue: the new checkout page path does not inherit the existing consent cookie, causing a fresh consent flow for all treatment users. Once the consent inheritance is fixed, the consent banner will fire at the same rate for both arms (only for genuinely new users), and the SRM will be eliminated. Rerunning with a clean assignment mechanism will produce a valid result. The 21-day experiment window was sufficient to power the test — a clean rerun of the same duration will be valid.'
      },
      {
        id: 'ship-desktop-only',
        label: 'Ship the new checkout flow to desktop users only, where the SRM impact is minimal.',
        description: 'Desktop users are the cleanest subgroup. Ship there first.',
        score: 'analyst_ready',
        feedback: 'The desktop-only subgroup result (+4.2%, p=0.31) is not significant. Shipping based on a non-significant subgroup result from a contaminated experiment is not a valid evidence base. Additionally, shipping different checkout flows to desktop and mobile users creates product inconsistency and operational complexity. The right path is a clean full-traffic experiment after fixing the consent inheritance issue.'
      },
      {
        id: 'extend',
        label: 'Extend the experiment for another 21 days to accumulate more power.',
        description: 'More data will give a clearer picture.',
        score: 'junior_miss',
        feedback: 'Extending a contaminated experiment does not fix the contamination. The consent-bounce SRM will continue for as long as the new page path does not inherit the existing consent cookie. Every new day of the experiment adds more sessions to the biased treatment arm. The experiment cannot be salvaged by extension — it needs a fresh start with a fixed assignment mechanism.'
      }
    ],

    idealDecision: 'invalidate-fix-rerun',
    secondBestDecision: 'adjust-analytically',

    juniorMistake: 'Accepts the PM\'s argument that "the SRM cause is known, so we can adjust for it" and treats the +11% result as valid after reweighting. Does not understand that informative missingness caused by the treatment itself cannot be corrected by observed covariate reweighting.',

    seniorFlags: [
      'The critical distinction in SRM analysis is whether the missing units are missing completely at random (MCAR), missing at random conditional on covariates (MAR), or missing not at random (MNAR). A consent-bounce SRM is MNAR: missingness is caused by the treatment condition itself. MNAR missingness cannot be corrected by covariate reweighting. This is what the PM\'s "adjust analytically" proposal gets wrong.',
      'The device-mix diagnostic (58% mobile in control, 44% mobile in treatment) is the right thing to check immediately after an SRM is confirmed. The 14pp gap is large enough to explain a substantial fraction of the +11% conversion lift. Mobile users have lower baseline checkout completion rates at Crafted — their underrepresentation in treatment inflates the apparent treatment conversion rate.',
      'The desktop-only subgroup result (+4.2%, p=0.31) is the most informative clean signal available. It suggests the new checkout flow may have a small positive effect on desktop, but the experiment is not powered to confirm it in a subgroup analysis. This is the signal that should inform the rerun: power the new experiment to detect a 4–5% relative lift.'
    ],

    staffFlags: [
      'Would have required at experiment design that the new page path be tested in staging for consent-cookie inheritance before any traffic was sent to it. For EU products with GDPR consent management, every new page path must be audited for consent behavior before experiment launch. This is a standard pre-launch checklist item for EU-market experiments.',
      'Would have pre-specified the SRM diagnostic plan: if SRM is detected, immediately pull the device-mix comparison and consent-event firing rate by arm before any outcome analysis. The demographic diagnostic is the fastest way to characterize the selection bias and determine whether analytical adjustment is even worth attempting.'
    ],

    debrief: 'SRM invalidates experiments because it signals that the assignment mechanism — the process that determines which users are in control and which are in treatment — did not work as intended. The key question is always: why are the arms unequal in size, and is the cause random or systematic?\n\nIn this case, the cause is systematic and informative. The new checkout page path does not inherit the existing consent cookie, so the GDPR consent banner fires for all treatment users on their first visit. On mobile devices with slower connections, a meaningful fraction of users bounces before the page fully loads and before their session is logged in the experiment assignment table. These users are never counted in the experiment — not even as unassigned dropouts.\n\nThis creates a particular kind of SRM that is especially damaging: the missing units are missing not at random. Their absence from the treatment arm is caused by the treatment itself (the new page path). This means the treatment arm is a survivor-biased sample: it over-represents users who successfully navigated the consent flow, who are systematically higher-intent, more desktop-heavy, and more conversion-prone than the full population of users who would have encountered the new checkout flow in production.\n\nThe PM\'s proposal to adjust analytically by reweighting for device type is a reasonable instinct but fails on the MAR assumption. We can reweight by device type, but we cannot reweight for the unobserved differences between users who made it through the consent flow and users who did not — differences in checkout intent, price sensitivity, session context, and patience under latency. These unobserved dimensions drive the selection and cannot be recovered from the data.\n\nThe desktop-only subgroup (+4.2%, p=0.31) is the most trustworthy available signal, and it is non-significant. This tells us the effect, if real, is smaller than the +11% top-line suggests. Power the rerun to detect a 4–5% relative lift and fix the consent inheritance before launch.',

    interviewTakeaway: 'SRM caused by the treatment condition itself (informative missingness) is not fixable by analytical adjustment. Reweighting by observed covariates assumes missing-at-random — when missingness is caused by the treatment, that assumption fails. Identify the demographic signature of the missing units, check the most trustworthy clean subgroup, fix the root cause, and rerun.',

    relatedConcepts: ['sample ratio mismatch', 'GDPR consent', 'informative missingness', 'survivor bias', 'missing not at random', 'covariate reweighting'],
    scenarioFamily: 'srm',
    tags: ['srm', 'cookie consent', 'GDPR', 'EU', 'marketplace', 'checkout', 'mobile', 'survivor bias']
  },

  // ─────────────────────────────────────────────
  // SCENARIO 25 — The D1 Mirage
  // Theme: novelty_peeking
  // ─────────────────────────────────────────────
  {
    id: 's25-d1-novelty-onboarding',
    title: 'The D1 Mirage',
    subtitle: 'New animated onboarding shows +11% D1 retention. D7 retention is already decaying to noise. D30 data not in yet.',
    isFree: false,
    industry: 'consumer_app',
    difficulty: 'analyst',
    theme: 'novelty_peeking',

    context: {
      company: 'Prism',
      product: 'Short-form video app — 8.4M monthly active users, primarily 18–28 age cohort, US and Canada',
      team: 'Growth and Onboarding team',
      background: 'Prism\'s onboarding flow for new installs has been unchanged for 11 months: three static permission screens (camera, microphone, notifications) followed by a topic interest selector and a feed seed. The team redesigned the onboarding with animated screens: smooth transitions between permission prompts, a progress indicator, and a personalized "Your feed is ready" reveal animation at the end.\n\nThe experiment ran for 18 days targeting all new installs: 50/50 split at install time. SRM check is clean.\n\nRetention results by cohort day:\n- D1 retention: treatment +11.2% vs. control (p=0.02)\n- D7 retention: treatment +1.2% vs. control (p=0.61)\n- D30 retention: data not yet available (requires 30 days from install; experiment started 18 days ago, so only the first 18 cohort days have D30 data)\n\nThe PM wants to ship based on the D1 signal, arguing: "D1 is the most actionable retention metric. We have a significant result. Let\'s not wait another 12 days for D30 data we may not need."',
      businessPressure: 'Prism\'s Q3 OKR includes a D1 retention improvement target. The PM is under pressure to ship a win before the quarter closes in 6 weeks. The Head of Product agrees that D1 is the team\'s primary focus metric for new user activation. The D7 decay is noted but framed as "expected variance."'
    },

    hypothesis: 'Animated onboarding screens with a personalized reveal will increase new user retention at D1, D7, and D30 by creating a more engaging first-time experience.',

    experimentDesign: {
      type: 'a/b',
      allocation: '50/50',
      runtime: '18 days (ongoing — D30 data requires 30 days from install)',
      targetPopulation: 'New installs during experiment window (~22,000 users per arm)',
      primaryMetric: 'D7 retention (pre-registered as primary in the experiment brief)',
      guardrailMetrics: ['Onboarding completion rate', 'Permission grant rate (camera, microphone, notifications)', 'D1 uninstall rate'],
      sampleSizeContext: 'Experiment brief pre-registered D7 retention as primary metric. D1 retention was listed as a leading indicator. The experiment was powered for D7 retention at 80% power to detect a 5% relative lift.'
    },

    metricReadout: [
      {
        metric: 'D1 retention',
        type: 'secondary',
        direction: 'up',
        delta: '+11.2%',
        pValue: 0.02,
        confidenceInterval: '[+1.7%, +20.7%]',
        significant: true,
        note: 'Significant. Wide CI. D1 is the window most susceptible to novelty effect: new users experience animated onboarding exactly once. The animation\'s novelty may drive higher same-day return without translating to habit formation. D1 retention also includes users who return purely to explore the new visual — a behavior that does not persist.'
      },
      {
        metric: 'D7 retention',
        type: 'primary',
        direction: 'up',
        delta: '+1.2%',
        pValue: 0.61,
        confidenceInterval: '[-3.4%, +5.8%]',
        significant: false,
        note: 'Not significant. The pre-registered primary metric. The D1 lift has already decayed to noise by D7. This is the early signature of a novelty effect: the treatment outperforms on the first engagement window but the gap closes rapidly. If the effect were driven by genuine habit formation, we would expect the D7 lift to be directionally consistent with D1 and of similar magnitude.'
      },
      {
        metric: 'D30 retention',
        type: 'primary',
        direction: 'neutral',
        delta: 'Not yet available',
        pValue: null,
        confidenceInterval: null,
        significant: false,
        note: 'D30 data requires 30 days from install date. The experiment has been running 18 days, so only the first 18 cohort days have matured to D30. Full D30 data is available in 12 days.'
      },
      {
        metric: 'Onboarding completion rate',
        type: 'guardrail',
        direction: 'up',
        delta: '+3.4%',
        pValue: 0.08,
        confidenceInterval: '[-0.4%, +7.2%]',
        significant: false,
        note: 'Directionally positive, not significant. More users complete the animated onboarding than the static version. This is a genuine usability improvement signal — but onboarding completion is a means, not an end. What matters is whether completing onboarding leads to retained usage.'
      },
      {
        metric: 'D1 retention by cohort day (trend)',
        type: 'diagnostic',
        direction: 'neutral',
        delta: 'Days 1–5 of experiment: D1 lift +14.8%. Days 11–18 of experiment: D1 lift +8.1%.',
        pValue: null,
        confidenceInterval: null,
        significant: false,
        note: 'The D1 retention lift is declining over successive cohorts. Users installing in the first days of the experiment show a larger D1 boost than users installing in more recent cohort days. This is the novelty decay signature: the animation effect is strongest for earliest adopters and attenuates as novelty wears off in the broader install cohort.'
      }
    ],

    warningFlags: [
      {
        id: 'wf-d7-decay',
        label: 'D7 retention (pre-registered primary) is already non-significant — D1 lift has fully decayed',
        description: 'The experiment brief pre-registered D7 retention as the primary metric. D7 is already available and is non-significant at p=0.61. The D1 significant result and the D7 null result together are the classic signature of a novelty effect: the treatment creates an elevated first-day engagement window that does not persist to weekly usage. Shipping on D1 when the pre-registered primary is null is a direct violation of the pre-registered analysis plan.',
        severity: 'critical'
      },
      {
        id: 'wf-novelty-decay-cohort-trend',
        label: 'D1 lift declining across successive cohort days — novelty effect confirmed by temporal trend',
        description: 'Users installing in the first 5 days of the experiment show a D1 lift of +14.8%. Users installing in days 11–18 show a lift of +8.1%. If the treatment effect were genuine habit formation, we would expect consistent D1 lift across cohort days. The declining trend confirms that the animation effect is novelty-driven: early cohort users are most susceptible because they encounter the animation before it becomes familiar. Later cohorts show a smaller effect as novelty attenuates.',
        severity: 'critical'
      },
      {
        id: 'wf-preregistered-primary-ignored',
        label: 'PM is proposing to ship on a secondary metric while ignoring the non-significant pre-registered primary',
        description: 'D1 retention was listed in the experiment brief as a "leading indicator." D7 retention was listed as the primary metric. The experiment was powered for D7. Shipping on D1 when D7 is non-significant is not a valid use of the pre-registered analysis plan — it is a post-hoc primary metric switch motivated by a positive result. This is a form of p-hacking by metric selection.',
        severity: 'critical'
      },
      {
        id: 'wf-d30-missing',
        label: 'D30 data available in 12 days — shipping now means never knowing the long-run effect',
        description: 'D30 retention is 12 days from being fully available. For a video app where long-run retention drives ad revenue and creator ecosystem health, D30 is the metric that matters most commercially. Shipping before D30 data is available means permanently closing the window to understand the long-run impact. If the treatment harms D30 retention (by setting expectations the product cannot meet), the team will never have a clean counterfactual to measure the damage.',
        severity: 'warning'
      }
    ],

    decisions: [
      {
        id: 'ship-d1',
        label: 'Ship on D1 retention — the result is significant and D1 is the team\'s activation metric.',
        description: 'D1 is significant at p=0.02. Ship.',
        score: 'junior_miss',
        feedback: 'The experiment brief pre-registered D7 as the primary metric. D7 is already non-significant (p=0.61). Shipping on D1 ignores the pre-registered primary and selects a secondary metric with a positive result — a classic post-hoc metric switch. The D1 lift has a strong novelty effect signature: it is declining across successive cohort days and has already decayed to noise at D7. Shipping on this result risks deploying an experience that improves first-day engagement metrics without improving actual retention.'
      },
      {
        id: 'extend-d30',
        label: 'Wait 12 more days for full D30 data, then make the ship decision on D7 + D30 together.',
        description: 'D30 data is 12 days away. Wait for the full retention picture.',
        score: 'senior_ready',
        feedback: 'This is the right call. The pre-registered primary (D7) is non-significant and the D1 lift is showing novelty decay. Waiting 12 more days gives full D30 data, which will determine whether the onboarding change has any durable effect on retention. If D30 is also non-significant, the experiment is a null — the animation improves novelty engagement but not habit. If D30 is positive, it would be surprising given the D7 decay, but worth investigating. Either way, 12 days is a small cost relative to the risk of shipping a change that improves D1 metrics without improving real retention.'
      },
      {
        id: 'ship-with-monitoring',
        label: 'Ship but monitor D7 and D30 retention post-launch to validate.',
        description: 'Ship now and use post-launch observational data to confirm retention.',
        score: 'analyst_ready',
        feedback: 'Post-launch observational monitoring cannot serve as a valid control. Once the new onboarding is shipped to all users, there is no control arm. Any observed retention trend post-launch is confounded by seasonality, product changes, marketing cohorts, and other factors. The opportunity to get a clean D30 measurement is the experiment itself — once it is over and the change is shipped, that window is permanently closed. The 12-day wait is the only path to a valid D30 estimate.'
      },
      {
        id: 'null-rollback',
        label: 'Call it a null result based on D7 and do not ship.',
        description: 'D7 is the primary metric and it\'s non-significant. Null result.',
        score: 'analyst_ready',
        feedback: 'Calling a null on D7 alone is defensible given that D7 is the pre-registered primary and it is clearly non-significant. But waiting 12 days for D30 is a better call: it either confirms the null (D30 also non-significant) or surfaces a surprise (D30 positive despite D7 decay, which would warrant investigation). A null call now closes the question prematurely when additional data is 12 days away at low incremental cost.'
      }
    ],

    idealDecision: 'extend-d30',
    secondBestDecision: 'null-rollback',

    juniorMistake: 'Ships on D1 retention because p=0.02 is significant, treating D1 as the key activation metric and dismissing D7 decay as "variance." Does not recognize that D7 was pre-registered as primary, that D1 is the peak novelty window, or that the cohort-day trend is a novelty decay signature.',

    seniorFlags: [
      'The pre-registered primary metric is D7, and it is non-significant. Any ship decision based on D1 alone is a post-hoc metric switch — a violation of the pre-registered analysis plan. In a rigorous experimental culture, the primary metric is defined before results are seen, and shipping based on a secondary metric when the primary is null requires explicit justification and usually a confirmatory rerun.',
      'The cohort-day temporal trend in D1 lift (14.8% in early cohort days decaying to 8.1% in later cohort days) is the single most important piece of diagnostic evidence in this readout. It confirms that the D1 lift is novelty-driven: early adopters respond most strongly to the new animation, and the effect attenuates as the novelty wears off. This pattern predicts that D7 and D30 will be null, which D7 already confirms.',
      'For a short-form video app, D30 retention is the metric most directly correlated with long-run ad revenue, creator engagement, and platform health. D1 retention is useful as a leading indicator but is known to be susceptible to novelty effects. Any retention experiment on a consumer app should have D30 as either the primary metric or a mandatory gating condition before ship.'
    ],

    staffFlags: [
      'Would have pre-registered D30 as a mandatory gating condition (not just a secondary metric) at experiment design. For any onboarding change, the question is not "did we improve first-day engagement" but "did we improve the probability that new users become habitual users." D30 is the minimum horizon for answering that question on a short-form video product.',
      'Would have included the cohort-day temporal D1 trend as a pre-registered novelty diagnostic: if the D1 lift declines by more than 30% from the first week of cohort entries to the second week, the result is flagged as novelty-driven and D30 becomes the only valid decision metric. This pre-registration removes the ambiguity about whether a declining temporal trend is "expected variance" or a novelty signature.'
    ],

    debrief: 'Novelty effects are one of the most common sources of false positives in consumer app experiments. When a new feature, design, or flow is visually different from the baseline, users notice — and they engage more on day one simply because something is new. This elevated first-day engagement is not habit formation; it is curiosity. The question every PM should ask about a D1 retention lift is: is this effect driven by genuine improvement to the product\'s core value, or is it driven by users noticing something is different?\n\nThe evidence in this readout answers that question clearly. Three signals point to novelty:\n\nFirst, D7 retention — the pre-registered primary metric — is non-significant at p=0.61. The D1 lift of +11.2% has fully decayed to noise within a week. If the animation improved the onboarding experience in a way that drove habit formation, we would expect a directionally consistent D7 lift. Instead, D7 is essentially flat.\n\nSecond, the cohort-day temporal trend shows the D1 lift declining from +14.8% in early cohort days to +8.1% in later cohort days. This is the novelty decay pattern: users who encountered the animated onboarding in the first days of the experiment had the strongest reaction because the animation was most novel. Users installing later show a smaller D1 effect as the novelty signal attenuates across successive cohorts.\n\nThird, the pre-registration context matters. The experiment brief listed D7 as primary and D1 as a leading indicator. The PM is now proposing to ship based on the leading indicator while the primary is null. This is a post-hoc primary metric switch — the kind of analysis flexibility that inflates false positive rates.\n\nThe correct call is to wait 12 days for D30 data. If D30 is also null, the experiment is a clean null: animated onboarding improves novelty engagement but not habit. If D30 is surprisingly positive, it would be unusual given the D7 decay pattern and would warrant investigation. Either way, 12 days is a low cost for a high-quality answer on the metric that matters most.',

    interviewTakeaway: 'A D1 retention lift with a null D7 result is the classic novelty effect signature. D1 is the window most susceptible to novelty — users engage because something is different, not because the product is better. If D7 (the pre-registered primary) is null, shipping on D1 is a post-hoc metric switch. Always check for temporal decay in the D1 effect across successive cohort days — declining lift over time confirms novelty.',

    relatedConcepts: ['novelty effect', 'retention cohort analysis', 'pre-registration', 'metric selection', 'temporal decay', 'D1 vs D7 vs D30'],
    scenarioFamily: 'novelty_peeking',
    tags: ['novelty effect', 'retention', 'onboarding', 'D1', 'D7', 'D30', 'consumer app', 'video app', 'pre-registration']
  },

  // ─────────────────────────────────────────────
  // SCENARIO 26 — The Three-Analyst Peek
  // Theme: novelty_peeking
  // ─────────────────────────────────────────────
  {
    id: 's26-multi-analyst-peeking',
    title: 'The Three-Analyst Peek',
    subtitle: 'Three analysts independently checked results on days 3, 5, and 7. Each time p crossed 0.05. On day 9, p=0.04 is "confirmed significant." It isn\'t.',
    isFree: false,
    industry: 'ecommerce',
    difficulty: 'senior',
    theme: 'novelty_peeking',

    context: {
      company: 'Vela',
      product: 'E-commerce platform — home goods and lifestyle, 1.4M monthly active buyers, average order value $87',
      team: 'Revenue and Conversion team',
      background: 'Vela ran a 14-day A/B test of a new product page layout. The redesign added a sticky add-to-cart bar, condensed the image gallery from six images to three with a swipe gesture, and moved customer reviews above the fold. Primary metric: revenue per visitor (RPV).\n\nThe experiment had a planned runtime of 14 days. Three analysts on the Revenue team each happened to check the experiment dashboard at different times:\n- Analyst A checked on Day 3: RPV treatment delta +4.1%, p=0.047. Sent a Slack message: "Looking good, almost there."\n- Analyst B checked on Day 5: RPV delta +3.8%, p=0.038. Slack: "We\'re significant! Should we ship?"\n- Analyst C checked on Day 7: RPV delta +2.9%, p=0.061. Slack: "Slipped back under. Wait for Day 14."\n- All three results and the Slack messages were visible to the PM and team lead.\n- Day 9 readout: RPV delta +3.2%, p=0.04. Team lead declares: "We\'ve been significant three times now. Day 9 is confirmed significant. Shipping."\n\nThe experiment was designed for a 14-day runtime with a fixed-horizon test (not a sequential test). No alpha spending plan was pre-registered.',
      businessPressure: 'Vela\'s conversion team has a Q3 target to ship three revenue-positive experiments. The team lead sees multiple p<0.05 crossings as additional confirmation rather than additional risk. The PM says: "If three analysts all saw significance at different times, it\'s not a fluke."'
    },

    hypothesis: 'A product page redesign with a sticky add-to-cart bar, condensed image gallery, and above-the-fold reviews will increase revenue per visitor compared to the current product page layout.',

    experimentDesign: {
      type: 'a/b',
      allocation: '50/50',
      runtime: '14 days planned (stopped at day 9)',
      targetPopulation: 'Visitors to product pages in the experiment (~48,000 visitors per arm over 14 days)',
      primaryMetric: 'Revenue per visitor (RPV)',
      guardrailMetrics: ['Add-to-cart rate', 'Checkout initiation rate', 'Return rate (7-day post-purchase)'],
      sampleSizeContext: 'Powered to detect a 4% relative lift in RPV at 80% power over 14 days. No sequential testing or alpha spending plan was pre-registered. Fixed-horizon design.'
    },

    metricReadout: [
      {
        metric: 'Revenue per visitor — Day 9 readout',
        type: 'primary',
        direction: 'up',
        delta: '+3.2%',
        pValue: 0.04,
        confidenceInterval: '[+0.2%, +6.2%]',
        significant: true,
        note: 'Significant at the day-9 stopping point. But this is the fourth time the team has looked at results (days 3, 5, 7, 9). Under a fixed-horizon design, the effective alpha is inflated by repeated looks. Four looks at a fixed-horizon test at alpha=0.05 per look inflates the family-wise error rate to approximately 18–20%. The true false positive rate for this result is far above 5%.'
      },
      {
        metric: 'Revenue per visitor — Day 3',
        type: 'diagnostic',
        direction: 'up',
        delta: '+4.1%',
        pValue: 0.047,
        confidenceInterval: null,
        significant: true,
        note: 'First informal look. Not a pre-registered interim analysis. Alpha was not adjusted.'
      },
      {
        metric: 'Revenue per visitor — Day 5',
        type: 'diagnostic',
        direction: 'up',
        delta: '+3.8%',
        pValue: 0.038,
        confidenceInterval: null,
        significant: true,
        note: 'Second informal look. "We\'re significant!" sent in Slack. Not a pre-registered interim. Alpha not adjusted.'
      },
      {
        metric: 'Revenue per visitor — Day 7',
        type: 'diagnostic',
        direction: 'up',
        delta: '+2.9%',
        pValue: 0.061,
        confidenceInterval: null,
        significant: false,
        note: 'Third informal look. Result slipped below significance threshold. This is the random walk of a p-value that is close to the decision boundary — it will cross and uncross the threshold multiple times by chance under the null hypothesis.'
      },
      {
        metric: 'Add-to-cart rate',
        type: 'guardrail',
        direction: 'up',
        delta: '+2.1%',
        pValue: 0.22,
        confidenceInterval: '[-1.3%, +5.5%]',
        significant: false,
        note: 'Directionally positive but not significant. If the RPV lift were driven by genuine conversion improvement, we would expect a directionally consistent add-to-cart signal. The weak and non-significant add-to-cart result is consistent with a noisy RPV estimate near the decision boundary.'
      }
    ],

    warningFlags: [
      {
        id: 'wf-multi-analyst-peeking',
        label: 'Three analysts checking independently is functionally equivalent to one analyst peeking three times',
        description: 'Peeking inflates the false positive rate regardless of whether the same person does all the looking or multiple people each look once. Each look at a fixed-horizon experiment outside of a pre-registered interim analysis is an additional opportunity to stop early on a false positive. The fact that three different analysts each independently checked the dashboard does not make the multiple looks independent tests — they are all looking at the same accumulating data stream. The effective alpha for four looks (days 3, 5, 7, 9) at a fixed-horizon test is approximately 18–20% under a standard Pocock or O\'Brien-Fleming correction.',
        severity: 'critical'
      },
      {
        id: 'wf-slack-visibility',
        label: 'Sharing interim results in Slack created social pressure to ship — this is a process failure, not just a stats failure',
        description: 'The pattern of Analyst A and B sharing "we\'re significant!" in a shared Slack channel with the PM and team lead created expectation anchoring. By the time Day 9 results show p=0.04, the team lead has a social history of three prior significance crossings and interprets the Day 9 result as "confirmed." The process failure is not just statistical: sharing unadjusted interim results in a team channel creates a form of publication bias at the team level, where positive signals accumulate in memory and negative dips are dismissed as noise.',
        severity: 'critical'
      },
      {
        id: 'wf-optional-stopping',
        label: 'Stopping at Day 9 rather than the pre-planned Day 14 is optional stopping — the decision to stop was made after observing a favorable result',
        description: 'The experiment was designed to run 14 days. It was stopped at Day 9 after observing p=0.04 for the fourth time. Even if each look were at a pre-registered interim, stopping 5 days early reduces the sample size and the power of the test. Stopping because the result looks good — optional stopping — is the core mechanism by which peeking inflates false positive rates. The team lead\'s reasoning that "we\'ve been significant three times" is exactly backwards: multiple significance crossings near the boundary are evidence of a random walk near alpha, not confirmatory evidence of a true effect.',
        severity: 'critical'
      },
      {
        id: 'wf-no-sequential-test',
        label: 'If interim looks are needed, the experiment should have used a sequential testing framework from the start',
        description: 'Sequential testing frameworks (e.g., always-valid inference, alpha spending with O\'Brien-Fleming boundaries, mSPRT) are designed for experiments where the team needs to monitor results and stop early when evidence accumulates. They adjust the decision threshold at each look to preserve the family-wise error rate. Using a fixed-horizon design and peeking informally at the results is not sequential testing — it is fixed-horizon testing with inflated alpha.',
        severity: 'warning'
      }
    ],

    decisions: [
      {
        id: 'ship-day9',
        label: 'Ship on Day 9 — p=0.04 with three prior significance crossings is strong confirmatory evidence.',
        description: 'Multiple significance crossings confirm the result is real.',
        score: 'junior_miss',
        feedback: 'Multiple significance crossings of a fixed-horizon test near the alpha boundary are not confirmatory evidence — they are the expected behavior of a test statistic performing a random walk near the decision threshold. Under the null hypothesis, a test statistic that is near p=0.05 will cross and uncross the threshold multiple times. Each crossing is not an independent confirmation; it is the same noisy signal looked at repeatedly. The team lead\'s reasoning inverts the statistical logic. Four looks inflate the family-wise false positive rate to ~18–20%. The Day 9 result is not "confirmed significant" — it is "significant under an alpha that is 4x too large."'
      },
      {
        id: 'run-to-day14',
        label: 'Run to Day 14 as planned. Do not look at results again until the planned endpoint.',
        description: 'Commit to the original 14-day fixed-horizon design.',
        score: 'senior_ready',
        feedback: 'This is the correct call for the current experiment. The fixed-horizon design requires running to the planned endpoint without acting on interim results. Stopping at Day 9 violates the fixed-horizon assumption. Running to Day 14 with a single final look at the planned endpoint gives a valid result at the pre-specified alpha=0.05. The team should also institute a process change: no sharing of interim results in Slack until the planned endpoint, and experiment dashboards should show only the planned endpoint date as a decision trigger.'
      },
      {
        id: 'apply-bonferroni',
        label: 'Apply a Bonferroni correction for four looks and re-evaluate significance at alpha=0.0125.',
        description: 'Correct for the four looks and see if the result holds.',
        score: 'analyst_ready',
        feedback: 'Applying a post-hoc multiple comparisons correction is better than not correcting, but Bonferroni is conservative (it assumes the four looks are independent, which they are not — each look includes all prior data). A more appropriate adjustment would be an O\'Brien-Fleming or Pocock correction that accounts for the cumulative nature of sequential looks. Under O\'Brien-Fleming with four looks, the Day 9 threshold is approximately p=0.018, not p=0.05. The Day 9 result (p=0.04) does not pass this threshold. Running to Day 14 at the planned alpha is cleaner than post-hoc correction.'
      },
      {
        id: 'rerun-sequential',
        label: 'Invalidate the current experiment. Rerun with a pre-registered sequential testing framework.',
        description: 'The right fix for a team that needs to monitor results is sequential testing from the start.',
        score: 'senior_ready',
        feedback: 'This is also correct and is the right long-run process fix. If the Vela Revenue team regularly monitors experiment dashboards and needs the ability to stop early when evidence accumulates, they should adopt a sequential testing framework (always-valid inference, mSPRT, or a group sequential design with pre-specified interim analysis times and alpha spending). Sequential testing provides valid early stopping with controlled false positive rates. The current approach — fixed-horizon design with informal peeking — is neither fixed-horizon nor sequential; it is the worst of both.'
      }
    ],

    idealDecision: 'run-to-day14',
    secondBestDecision: 'rerun-sequential',

    juniorMistake: 'Interprets multiple p<0.05 crossings as independent confirmations of a true effect. Does not understand that each look at accumulating data is not a fresh independent test — it is the same data stream observed at a later point, and repeated observation inflates the family-wise error rate.',

    seniorFlags: [
      'The key insight is that peeking is a property of the decision process, not the identity of who looks. Three analysts each looking once at the same accumulating data stream have the same statistical effect as one analyst looking three times. The false positive rate is determined by the number of decision opportunities, not the number of decision-makers. Team coordination on experiment monitoring is a statistical problem, not just a workflow problem.',
      'The p-value random walk is the right mental model for understanding why multiple crossings near alpha are not confirmatory. Under the null hypothesis, a test statistic near p=0.05 will bounce around the threshold by chance — it has no "memory" of prior crossings. Seeing p=0.047, 0.038, 0.061, 0.04 in succession is consistent with a noisy null result at the boundary, not a stable true positive.',
      'The process fix is as important as the statistical fix. Experiment dashboards showing live p-values create a peeking culture by default. The right design is either: (a) lock the dashboard to show only the planned endpoint date and disable interim result views, or (b) adopt sequential testing with explicit early-stopping boundaries that are shown on the dashboard. Sharing interim results in Slack before the planned endpoint should be treated as a protocol violation.'
    ],

    staffFlags: [
      'Would have required at experiment design that the team choose between fixed-horizon (no interim looks, single readout at planned endpoint) or sequential (pre-registered interim analysis times with explicit alpha spending). The choice should be made based on the team\'s business need: if early stopping is genuinely valuable (e.g., to catch a harmful treatment), use sequential. If there is no business need to stop early, use fixed-horizon and lock the dashboard until the endpoint.',
      'Would have flagged the Slack pattern immediately when it started. Analyst A\'s "Looking good, almost there" message on Day 3 is the beginning of an expectation anchoring chain that compromises the team\'s ability to interpret Day 14 results objectively. A culture of sharing live p-values in team channels is a systematic false positive risk that manifests across many experiments, not just this one.'
    ],

    debrief: 'Peeking at experiment results before the planned endpoint inflates the false positive rate. This is a statistical fact that does not depend on intent, team structure, or how many people are doing the looking.\n\nThe intuition: under the null hypothesis (no true effect), a p-value performs a random walk. It starts near 0.5 (random) and drifts toward or away from 0.05 as data accumulates. If you watch a random walk long enough and are willing to stop whenever it crosses a threshold, you will eventually see a crossing even when the null is true. The probability of at least one crossing increases with each additional look.\n\nThe math confirms this: four equally-spaced looks at a fixed-horizon test at alpha=0.05 per look yield a family-wise false positive rate of approximately 18–20%. The team\'s Day 9 p=0.04 result is evaluated against a nominal alpha of 0.05, but the true false positive risk is nearly four times higher.\n\nThe team lead\'s reasoning — "we\'ve been significant three times, this is confirmed" — is exactly backwards. Multiple crossings near the decision boundary are the signature of a random walk near alpha, not confirmatory evidence. If the true effect were large and stable, we would expect p to consistently decrease over time as sample size grows, not to bounce around 0.05.\n\nThe process failure is equally important. Analyst A\'s "Looking good, almost there" Slack message on Day 3 set an expectation that was reinforced by subsequent crossings. By Day 9, the team is in a state where any p<0.05 will be interpreted as confirmation. This expectation anchoring is a form of team-level publication bias.\n\nThe fix has two components: (1) run to Day 14 and evaluate at the planned endpoint, and (2) change the process so interim results are not shared until the planned endpoint. If the team genuinely needs early stopping capability, adopt sequential testing with pre-registered interim analysis times and explicit alpha spending — not informal peeking.',

    interviewTakeaway: 'Peeking is a property of the decision process, not the analyst. Multiple analysts each looking once has the same false positive risk as one analyst looking multiple times. Multiple p<0.05 crossings near alpha are a random walk signature, not confirmatory evidence. The fix is to either commit to the planned endpoint (fixed-horizon) or adopt sequential testing with pre-registered alpha spending from the start.',

    relatedConcepts: ['peeking', 'optional stopping', 'alpha inflation', 'sequential testing', 'family-wise error rate', 'fixed-horizon testing', 'alpha spending'],
    scenarioFamily: 'novelty_peeking',
    tags: ['peeking', 'optional stopping', 'sequential testing', 'alpha inflation', 'multiple analysts', 'e-commerce', 'revenue per visitor']
  },

  // ─────────────────────────────────────────────
  // S19 — SRM: The Missing Corporate Accounts
  // ─────────────────────────────────────────────
  {
    id: 's19-vanta-srm',
    title: 'The Missing Corporate Accounts',
    subtitle: 'Vanta · B2B SaaS · Sample Ratio Mismatch',
    difficulty: 'senior',
    isFree: false,
    company: 'Vanta',
    industry: 'saas',
    domain: 'onboarding',
    estimatedMin: 18,
    context: {
      company: 'Vanta',
      product: 'SOC 2 compliance automation — 17,600 trial accounts in experiment',
      setup: 'Growth team tests a 3-email onboarding sequence (treatment) vs a single generic welcome email (control). Hypothesis: structured onboarding increases trial-to-paid conversion. 30-day experiment.'
    },
    hypothesis: 'A structured 3-email onboarding sequence with role-specific setup guides will increase trial-to-paid conversion vs a single generic welcome email.',
    experimentDesign: {
      type: 'A/B',
      randomizationUnit: 'account',
      targetPopulation: 'All new trial accounts created during the experiment window',
      primaryMetric: 'Trial-to-paid conversion at 30 days',
      plannedSplit: '50/50',
      runtime: '30 days'
    },
    metricReadout: {
      primaryMetric: {
        name: 'Trial-to-paid conversion (30 days)',
        control: '18.4%',
        treatment: '22.5%',
        delta: '+4.1pp',
        relativeChange: '+22.3%',
        pValue: 0.02,
        confidenceInterval: '[+0.8pp, +7.4pp]',
        significant: true
      },
      guardrailMetrics: [
        { name: 'Email unsubscribe rate', control: '2.1%', treatment: '3.8%', delta: '+1.7pp', status: 'WARNING', note: 'Elevated but below 5% threshold' }
      ],
      diagnostics: [
        {
          metric: 'Account count by arm',
          type: 'diagnostic',
          direction: 'neutral',
          delta: 'Control: 8,420. Treatment: 9,180. Expected: 8,800 each.',
          pValue: 0.001,
          confidenceInterval: null,
          significant: true,
          note: 'Chi-square SRM test p=0.001. The 380-account imbalance is not due to chance. Root cause: marketing automation silently excluded corporate email domains from control at a higher rate — spam filters triggered re-routing. Corporate accounts are higher-intent, biasing control low.'
        }
      ]
    },
    warningFlags: [
      {
        id: 'wf-srm-detected',
        label: 'Sample ratio mismatch — control has 380 fewer accounts than expected (p=0.001)',
        description: 'Planned 50/50 split of 17,600 should yield 8,800 per arm. Control: 8,420. Treatment: 9,180. The marketing automation tool silently excluded corporate email domains from control when spam filters blocked delivery — those accounts were re-routed. Corporate domains correlate with enterprise intent and higher conversion propensity. Control is biased toward lower-intent accounts.',
        severity: 'critical'
      },
      {
        id: 'wf-selection-bias',
        label: 'Excluded accounts are higher-intent — control conversion rate is artificially low',
        description: 'The 380 missing corporate accounts have above-average conversion propensity. Their exclusion from control depresses the control rate, inflating the treatment lift by an unknown amount. The true treatment effect cannot be estimated.',
        severity: 'critical'
      }
    ],
    decisions: [
      {
        id: 'ship',
        label: 'Ship the 3-email sequence — +4.1pp at p=0.02 is significant.',
        description: 'Ship to all trial accounts.',
        score: 'junior_miss',
        feedback: 'The +4.1pp lift is biased upward. Control is missing 380 high-intent corporate accounts whose exclusion made the control conversion rate artificially low. The true treatment effect is unknown — it could be anywhere from near-zero to the observed +4.1pp. Shipping on a biased result means deploying a feature whose actual impact is unquantified.'
      },
      {
        id: 'investigate',
        label: 'Stop and investigate the account imbalance before interpreting any metric.',
        description: 'The SRM must be explained before any result can be trusted.',
        score: 'senior_ready',
        feedback: 'Correct. The first question when you see an account count mismatch is: what caused it, and does it bias the metric? Here the mechanism is clear — corporate email filtering excluded higher-intent accounts from control. The result is biased and cannot support a shipping decision. Re-run with the automation tool fixed.'
      },
      {
        id: 'rerun',
        label: 'Fix the automation tool and re-run from scratch.',
        description: 'Get clean data.',
        score: 'senior_ready',
        feedback: 'Also correct and the most direct path. Fix the email tool\'s handling of corporate domains (or randomize upstream of delivery), re-run the 30-day experiment, read the result at the planned endpoint. This produces data you can act on with confidence.'
      },
      {
        id: 'adjust-and-ship',
        label: 'Estimate the missing accounts\' conversion rate and adjust the control.',
        description: 'Statistical adjustment corrects the bias.',
        score: 'analyst_ready',
        feedback: 'Imputation adds assumptions that are difficult to validate. You don\'t know the counterfactual conversion rate for the missing accounts in the control condition. Statistical adjustment of SRM-contaminated results is a last resort for post-hoc analysis — not a substitute for a clean experiment.'
      }
    ],
    idealDecision: 'investigate',
    secondBestDecision: 'rerun',
    juniorMistake: 'Ships on p=0.02 without running an SRM check on the account counts. Treats statistical significance as sufficient without verifying randomization integrity.',
    seniorFlags: [
      'The first diagnostic for any experiment is the sample ratio check: does the observed split match the planned split? A significant SRM is a hard stop before reading any metric.',
      'The direction of SRM bias matters as much as its existence. A random imbalance adds noise. A systematic imbalance (corporate domain filtering) adds directional bias — the excluded accounts are higher-intent, making control look worse than it really is.',
      'Root cause investigation of SRM is a debugging exercise: what in the assignment or delivery pipeline produced this imbalance? Common causes: race conditions, post-randomization bot filtering, delivery failures that trigger re-routing, and geographic bucketing that correlates with intent.'
    ],
    staffFlags: [
      'Would have instrumented the randomization pipeline with real-time SRM monitoring — an alert fires when observed split deviates more than 2 standard errors from planned. Experiment flagged on Day 3, not Day 30.',
      'Would have required randomization to happen before any email delivery attempt — account-level assignment upstream of the marketing automation tool. Any system that can silently drop accounts after assignment is a randomization integrity risk.'
    ],
    debrief: 'SRM is a signal that something in the assignment pipeline broke. Until you know what broke and whether it introduces directional bias, no metric result from the experiment can be trusted.\n\nIn this case, the mechanism is specific and damaging: corporate email domains — accounts with higher conversion propensity — were excluded from control at a higher rate than treatment. This means the control conversion rate (18.4%) understates what control would have converted at with a clean sample. The treatment lift (+4.1pp) is inflated by an unknown amount.\n\nThe fix is operational: correct the automation tool, re-run, read the result at the planned endpoint. There is no statistical shortcut that recovers a trustworthy estimate from SRM-contaminated data.\n\nThe process fix is equally important: SRM monitoring should run continuously throughout any experiment. A 30-day experiment that accumulates bias for 30 days before anyone notices is an avoidable failure. Real-time SRM alerts catch this on Day 3.',
    interviewTakeaway: 'SRM is a randomization integrity failure. Run the sample ratio check before looking at any metric. If it\'s off, investigate the mechanism — the direction of bias determines whether the result is inflated, deflated, or unknowable.',
    relatedConcepts: ['sample ratio mismatch', 'randomization integrity', 'selection bias', 'chi-square test', 'email deliverability', 'assignment pipeline'],
    scenarioFamily: 'srm',
    tags: ['SRM', 'sample ratio mismatch', 'email deliverability', 'B2B SaaS', 'corporate email', 'selection bias', 'randomization']
  },

  // ─────────────────────────────────────────────
  // S20 — novelty_peeking: The Decaying Summary
  // ─────────────────────────────────────────────
  {
    id: 's20-loom-novelty',
    title: 'The Decaying Summary',
    subtitle: 'Loom · Video Tool · Novelty Effect',
    difficulty: 'senior',
    isFree: false,
    company: 'Loom',
    industry: 'consumer',
    domain: 'engagement',
    estimatedMin: 18,
    context: {
      company: 'Loom',
      product: 'Async video messaging — 280,000 weekly active viewers',
      setup: 'Product team adds an AI transcript summary (3-5 bullets) shown below every video. Hypothesis: preview of content increases video completion rate. 3-week experiment, 50/50 viewer split.'
    },
    hypothesis: 'An AI transcript summary shown below each video will increase completion rate — viewers who can preview content will be more motivated to watch the full video.',
    experimentDesign: {
      type: 'A/B',
      randomizationUnit: 'viewer',
      targetPopulation: 'All viewers on Loom-hosted videos during the experiment window',
      primaryMetric: 'Video completion rate (watched ≥80%)',
      plannedSplit: '50/50',
      runtime: '3 weeks'
    },
    metricReadout: {
      primaryMetric: {
        name: 'Video completion rate (≥80%)',
        control: '41.2%',
        treatment: '45.0%',
        delta: '+3.8pp',
        relativeChange: '+9.2%',
        pValue: 0.04,
        confidenceInterval: '[+0.2pp, +7.4pp]',
        significant: true
      },
      guardrailMetrics: [
        { name: 'Video share rate', control: '8.1%', treatment: '8.3%', delta: '+0.2pp', status: 'PASS', note: 'No meaningful change' },
        { name: 'Re-watch rate', control: '12.4%', treatment: '9.8%', delta: '-2.6pp', status: 'WARNING', note: 'Viewers reading summary instead of re-watching segments' }
      ],
      diagnostics: [
        {
          metric: 'Weekly completion rate lift — treatment arm',
          type: 'trend',
          direction: 'negative',
          delta: 'Week 1: +18.4pp vs control. Week 2: +11.1pp. Week 3: +4.3pp.',
          pValue: null,
          confidenceInterval: null,
          significant: false,
          note: 'Clear novelty decay. If trend continues, effect reaches ~0 by Week 5. The 3-week blended result averages a high-novelty Week 1 with a low-effect Week 3.'
        }
      ]
    },
    warningFlags: [
      {
        id: 'wf-novelty-decay',
        label: 'Completion lift decays week-over-week — novelty effect signature',
        description: 'Week 1: +18.4pp → Week 2: +11.1pp → Week 3: +4.3pp. Genuine improvements show stable or increasing lift as users build habits. Declining lift trending toward zero is the novelty signature. The 3-week blended result (+3.8pp) is dominated by the first-week curiosity spike.',
        severity: 'critical'
      },
      {
        id: 'wf-ci-width',
        label: 'Wide CI [+0.2pp, +7.4pp] — barely significant, lower bound near zero',
        description: 'If the novelty decay continues, the true steady-state effect likely falls below the lower confidence bound.',
        severity: 'warning'
      }
    ],
    decisions: [
      {
        id: 'ship',
        label: 'Ship — +3.8pp at p=0.04 after 3 weeks is significant.',
        description: 'Ship the AI summary to all viewers.',
        score: 'junior_miss',
        feedback: 'The 3-week result is not a stable estimate. Week 1: +18.4pp. Week 3: +4.3pp. The trend is clearly downward. Shipping on a blended average that includes a high-novelty first week means deploying a feature whose steady-state impact may be near zero. The re-watch rate decline (-2.6pp) adds further concern — viewers may be substituting summary-reading for re-watching, degrading comprehension even as completion rate rises.'
      },
      {
        id: 'extend',
        label: 'Extend to 6 weeks and measure where the effect stabilizes.',
        description: 'The novelty decay needs to run its course.',
        score: 'senior_ready',
        feedback: 'Correct. Week 3 shows +4.3pp — still positive, but declining. You don\'t yet know whether the effect stabilizes at a durable positive value or continues to zero. Run to 6 weeks. If the effect stabilizes above a pre-specified minimum (e.g., +2pp), ship. If it reaches zero, the experiment saved you from shipping a zero-effect feature based on novelty.'
      },
      {
        id: 'rollback',
        label: 'Rollback — the decay shows the feature has no durable effect.',
        description: 'Effect is trending to zero. Stop.',
        score: 'analyst_ready',
        feedback: 'Premature. Week 3 effect is still +4.3pp — not yet at zero. The direction is concerning but the decision requires waiting for the effect to stabilize, not stopping at the first sign of decay. Rollback would be correct if Week 3 were already near zero or negative.'
      },
      {
        id: 'ship-new-users',
        label: 'Ship to new users only — they won\'t have a novelty response.',
        description: 'New Loom users haven\'t seen the summary before, so the effect reflects genuine value.',
        score: 'analyst_ready',
        feedback: 'This misunderstands the novelty effect. All users in Week 1 were new to this feature, which is why Week 1 shows the highest lift. The novelty effect is about feature familiarity, not platform tenure. What you need is more time — not a different user segment.'
      }
    ],
    idealDecision: 'extend',
    secondBestDecision: 'rollback',
    juniorMistake: 'Ships on the 3-week blended result without plotting the weekly trend. Treats "3 weeks of significant data" as equivalent to "stable effect estimate."',
    seniorFlags: [
      'Novelty effects make new features look better than they are. The first-week lift is the feature\'s best week. The correct question is: does the effect stabilize, and if so, at what level?',
      'Week-over-week trend analysis is as important as the aggregate result. A slope of +18.4 → +11.1 → +4.3 is a novelty curve, not a product improvement. The slope tells you the effect will be near zero before the feature becomes habitual.',
      'The re-watch rate decline (-2.6pp) deserves independent investigation. If users substitute summary-reading for re-watching, completion rate may improve while comprehension decreases — a metric substitution that looks like engagement but may mask quality degradation.'
    ],
    staffFlags: [
      'Would have pre-registered a novelty detection rule: "We require that the Week 4 weekly effect is within 30% of the Week 2 weekly effect before shipping. If the effect decays faster, we extend to Week 6."',
      'Would have built novelty detection into the monitoring system: any feature showing Week 1 lift >2x Week 3 lift triggers an automatic extension flag before the result can be used for a shipping decision.'
    ],
    debrief: 'Novelty effects are the most common source of false positives in consumer product experimentation. Users engage with new features out of curiosity — they click, explore, and complete more than they will once the feature becomes familiar. This produces a high first-week lift that decays as habituation sets in.\n\nThe diagnostic is the week-over-week trend. A genuine product improvement produces stable or gently increasing lift as users build habits. A novelty effect produces a declining lift that trends toward zero. Here the evidence is unambiguous: +18.4pp, +11.1pp, +4.3pp across three weeks.\n\nThe 3-week blended result (+3.8pp, p=0.04) is an average of a high-novelty first week and a declining third week. It is not a stable estimate of the feature\'s long-run effect. The lower bound of the confidence interval (+0.2pp) is near zero — if the Week 4 effect is 2-3pp and Week 5 is near zero, the true durable effect is likely below even this lower bound.\n\nThe correct decision is to extend to 6 weeks and pre-specify a stability criterion: the feature ships if the Week 6 effect is within some percentage of the Week 4 effect. If it continues to decay, the experiment has correctly prevented shipping a zero-effect feature.\n\nThe re-watch rate signal adds complexity. Summary-reading substituting for re-watching may produce a metric improvement (completion) while degrading the underlying outcome (comprehension). This is worth tracking separately regardless of the shipping decision.',
    interviewTakeaway: 'Novelty effects make new features look better than they are. The correct response to a strong first-week result is to plot the weekly trend and extend until the effect stabilizes — not to ship on a blended average that includes the curiosity spike.',
    relatedConcepts: ['novelty effect', 'habituation', 'behavioral adaptation', 'metric decay', 'experiment duration', 'weekly trend analysis'],
    scenarioFamily: 'novelty_peeking',
    tags: ['novelty effect', 'decay', 'video completion', 'AI features', 'consumer app', 'weekly trend', 'habituation']
  },

  // ─────────────────────────────────────────────
  // S21 — hte_subgroups: The Empty Suggestion Panel
  // ─────────────────────────────────────────────
  {
    id: 's21-figma-hte',
    title: 'The Empty Suggestion Panel',
    subtitle: 'Figma · Design Tool · Heterogeneous Treatment Effects',
    difficulty: 'staff',
    isFree: false,
    company: 'Figma',
    industry: 'saas',
    domain: 'feature-adoption',
    estimatedMin: 20,
    context: {
      company: 'Figma',
      product: 'Design tool with component libraries — 95,000 active teams in experiment',
      setup: 'Product team ships "Smart Suggest" — AI panel suggesting published design system components while designing. Hypothesis: surfacing relevant components reduces search time and increases design consistency. 50/50 team-level split, 4 weeks.'
    },
    hypothesis: 'An AI component suggestion panel will increase adoption rate and reduce manual search time by surfacing relevant design system components contextually.',
    experimentDesign: {
      type: 'A/B',
      randomizationUnit: 'team',
      targetPopulation: 'All active Figma teams with ≥2 members active in the past 30 days',
      primaryMetric: 'Feature adoption rate — % of sessions with ≥1 suggested component used',
      plannedSplit: '50/50',
      runtime: '4 weeks'
    },
    metricReadout: {
      primaryMetric: {
        name: 'Feature adoption rate (sessions with ≥1 suggested component used)',
        control: '0%',
        treatment: '6.8pp',
        delta: '+6.8pp',
        relativeChange: 'N/A (new feature)',
        pValue: 0.03,
        confidenceInterval: '[+0.6pp, +13.0pp]',
        significant: true
      },
      guardrailMetrics: [
        { name: 'Design session length', control: '42.1 min', treatment: '41.8 min', delta: '-0.3 min', status: 'PASS', note: 'No meaningful change' },
        { name: 'Team 30-day retention', control: '71.2%', treatment: '70.9%', delta: '-0.3pp', status: 'PASS', note: 'No meaningful change' }
      ],
      diagnostics: [
        {
          metric: 'Adoption rate by account tier',
          type: 'segment',
          direction: 'divergent',
          delta: 'Enterprise (published design system, 28% of teams, 71% of revenue): +19.2pp. Starter/Professional (no design system, 72% of teams, 29% of revenue): -2.1pp (p=0.41).',
          pValue: 0.0004,
          confidenceInterval: null,
          significant: true,
          note: 'Feature requires a published design system to return suggestions. Starter/Professional teams see an empty or irrelevant panel. The overall +6.8pp is driven entirely by Enterprise.'
        }
      ]
    },
    warningFlags: [
      {
        id: 'wf-empty-panel',
        label: 'Feature requires a published design system — 72% of teams see an empty or irrelevant panel',
        description: 'Smart Suggest queries the team\'s published design system for component matches. Teams without a published design system get either an empty panel or community library suggestions that don\'t match their design vocabulary. Overall +6.8pp adoption is entirely Enterprise-driven. The majority of teams gain nothing and may be confused by an empty AI panel.',
        severity: 'critical'
      },
      {
        id: 'wf-count-revenue-inversion',
        label: 'Account count and revenue distribution are inverted — majority by count ≠ majority by value',
        description: 'Starter/Professional: 72% of accounts, 29% of revenue. Enterprise: 28% of accounts, 71% of revenue. A shipping decision based on account-count majority would harm the revenue minority — which is the majority by business value.',
        severity: 'warning'
      }
    ],
    decisions: [
      {
        id: 'ship-all',
        label: 'Ship to all teams — +6.8pp at p=0.03 is significant.',
        description: 'The overall result is positive. Ship.',
        score: 'junior_miss',
        feedback: 'The overall +6.8pp is entirely driven by Enterprise (+19.2pp). Starter/Professional teams show -2.1pp — directionally negative, not significant, but reflecting a real experience: an empty or irrelevant suggestion panel. Shipping to all means 72% of teams get a broken-looking feature. Even if the harm is modest today, shipping an empty AI panel trains users that AI features in Figma are not useful for them — a perception that persists even after they upgrade.'
      },
      {
        id: 'ship-enterprise',
        label: 'Ship to Enterprise with published design systems only. Gate for Starter/Professional.',
        description: 'The feature works for its intended segment. Don\'t ship an empty panel to everyone else.',
        score: 'senior_ready',
        feedback: 'Correct. Enterprise sees +19.2pp — genuine value for teams that have a design system to query. Gating to Enterprise means the segment that benefits gets the feature, and the majority of teams don\'t get an empty panel. The next step: design a separate experience for non-Enterprise teams — a prompt to publish a design system, or an alternative suggestion source — and test that separately.'
      },
      {
        id: 'rollback',
        label: 'Rollback entirely — the negative effect on Starter/Professional makes this unshippable.',
        description: 'The feature harms the majority.',
        score: 'analyst_ready',
        feedback: 'Overcorrection. The -2.1pp for Starter/Professional is not statistically significant and reflects neutral-to-slightly-negative experience with an empty panel, not active harm. The Enterprise result (+19.2pp) is real. Denying Enterprise teams a feature that genuinely works because it doesn\'t work for a different segment is the wrong product decision. Segment, don\'t rollback.'
      },
      {
        id: 'ship-with-empty-state',
        label: 'Ship to all with an empty state message: "Publish a design system to unlock suggestions."',
        description: 'A good empty state fixes the confusion problem.',
        score: 'analyst_ready',
        feedback: 'Better than shipping as-is, but still suboptimal. An empty state reduces confusion but doesn\'t fix the core problem: 72% of teams now have a panel in their UI that offers them nothing. Panel presence without value competes for attention and teaches users that the feature is not useful. A gate (don\'t show the panel until a design system exists) is cleaner than a good empty state.'
      }
    ],
    idealDecision: 'ship-enterprise',
    secondBestDecision: 'ship-with-empty-state',
    juniorMistake: 'Ships to all based on overall p=0.03 without segmenting by account tier. Does not ask why adoption is only 6.8% if the feature is supposedly useful. Does not investigate which segment the feature was designed for.',
    seniorFlags: [
      'When a feature has a precondition to function, always segment by precondition presence before reading the aggregate. The overall adoption rate will understate the effect for users who meet the precondition and mask harm for users who don\'t.',
      'Account count vs. revenue inversion is a common B2B trap. The correct calculation is: what is the revenue-weighted impact of shipping to all vs. Enterprise only? Enterprise at 71% of revenue seeing +19.2pp vastly outweighs the modest negative experience for the 29% revenue segment.',
      'A -2.1pp directionally negative result at p=0.41 should not be dismissed as "neutral." It is underpowered, not zero. The direction is a signal. Design a different experience for the non-Enterprise segment and test it separately.'
    ],
    staffFlags: [
      'Would have built the precondition gate into the feature design before the experiment: Smart Suggest only appears for teams with ≥1 published design system component. This eliminates the empty-panel problem and makes the experiment a clean test of value for the intended segment.',
      'Would have pre-registered the Enterprise vs. Starter segment analysis as a primary analysis, not a post-hoc diagnostic. The feature\'s mechanism (requires published design system) makes the segment split a first-principles prediction — pre-registration prevents it from being dismissed as cherry-picking.'
    ],
    debrief: 'Heterogeneous treatment effects occur when a feature\'s impact differs systematically across user segments. In B2B SaaS, the most common source of heterogeneity is feature preconditions — requirements that some users meet and others don\'t.\n\nSmart Suggest requires a published design system. Enterprise teams have them. Starter/Professional teams typically don\'t. The experiment results are a mix of two very different experiences: Enterprise seeing a genuinely useful feature (+19.2pp), and Starter/Professional seeing an empty panel (-2.1pp).\n\nThe blended result (+6.8pp) is a weighted average. It is statistically significant but not interpretable as "this feature helps all teams." It means "Enterprise adoption is strong enough to push the blended average positive despite the majority of users gaining nothing."\n\nThe key analytical move is to segment before reading the aggregate. When a feature has a known precondition, the segment split is a first-principles prediction — not post-hoc cherry-picking. Enterprise vs. Starter/Professional should have been the primary analysis.\n\nThe correct decision is segmented rollout: ship to Enterprise, don\'t ship the empty panel to Starter/Professional. Design a different experience for non-Enterprise teams and test it in a separate experiment. This is more work than all-or-nothing shipping, but it produces better outcomes for every segment.\n\nThe account count vs. revenue inversion matters for prioritization. Starter/Professional are 72% of accounts but 29% of revenue. Their neutral-to-negative experience is a priority — but the urgency of fixing it is proportional to their revenue contribution, not their account count.',
    interviewTakeaway: 'A significant overall result can mask harm to the majority. When a feature has a precondition, segment by precondition presence first. The right decision may be segmented rollout, not all-or-nothing shipping.',
    relatedConcepts: ['heterogeneous treatment effects', 'segmentation', 'feature preconditions', 'B2B account tiers', 'revenue weighting', 'empty state design'],
    scenarioFamily: 'hte_subgroups',
    tags: ['HTE', 'subgroup analysis', 'feature precondition', 'design system', 'B2B SaaS', 'account tier', 'Enterprise vs Starter', 'empty state']
  },

  // ─────────────────────────────────────────────
  // S22 — guardrail_breach: The Habit Erosion
  // ─────────────────────────────────────────────
  {
    id: 's22-duolingo-guardrail',
    title: 'The Habit Erosion',
    subtitle: 'Duolingo · Language Learning · Guardrail Breach',
    difficulty: 'senior',
    isFree: false,
    company: 'Duolingo',
    industry: 'consumer',
    domain: 'retention',
    estimatedMin: 18,
    context: {
      company: 'Duolingo',
      product: 'Language learning app — 48M daily active learners',
      setup: 'Product team tests "Streak Repair" — if a user misses a day, they get a 24-hour window to complete a bonus lesson and restore their streak. Hypothesis: reducing streak loss anxiety increases long-term retention. 6-week experiment, 50/50 user split.'
    },
    hypothesis: 'Allowing users to repair a broken streak with a bonus lesson will reduce streak-loss churn and increase D30 and D60 retention by removing a major friction point.',
    experimentDesign: {
      type: 'A/B',
      randomizationUnit: 'user',
      targetPopulation: 'Users with streaks ≥7 days who miss at least one day during the experiment window',
      primaryMetric: 'D30 retention rate',
      plannedSplit: '50/50',
      runtime: '6 weeks'
    },
    metricReadout: {
      primaryMetric: {
        name: 'D30 retention rate',
        control: '41.8%',
        treatment: '46.0%',
        delta: '+4.2pp',
        relativeChange: '+10.0%',
        pValue: 0.01,
        confidenceInterval: '[+1.1pp, +7.3pp]',
        significant: true
      },
      guardrailMetrics: [
        {
          name: 'Daily lesson completion rate (lessons completed per active day)',
          control: '1.82',
          treatment: '1.67',
          delta: '-0.15 lessons/day (-8.2%)',
          status: 'BREACH',
          note: 'Pre-specified guardrail: must not decrease >5%. Treatment users complete fewer lessons per active day — they are banking on streak repair instead of maintaining daily habits.'
        },
        {
          name: 'D60 retention rate',
          control: '31.2%',
          treatment: '32.1%',
          delta: '+0.9pp',
          status: 'WARNING',
          note: 'D60 lift is +0.9pp vs D30\'s +4.2pp — the retention benefit decays rapidly, suggesting the repair feature delays churn without preventing it.'
        }
      ],
      diagnostics: [
        {
          metric: 'Streak repair usage rate among eligible users',
          type: 'diagnostic',
          direction: 'neutral',
          delta: '68% of eligible treatment users used streak repair at least once. Average repairs per user: 2.1 over 6 weeks.',
          pValue: null,
          confidenceInterval: null,
          significant: false,
          note: 'High usage rate means the repair feature is not a rare safety net — it is being used as a regular substitute for daily practice by a majority of eligible users.'
        }
      ]
    },
    warningFlags: [
      {
        id: 'wf-lesson-completion-breach',
        label: 'Daily lesson completion rate breached pre-specified guardrail — down 8.2%',
        description: 'Treatment users complete 1.67 lessons per active day vs 1.82 in control — an 8.2% decline. Pre-specified guardrail was a max 5% decline. The repair feature is reducing the daily practice habit that is core to Duolingo\'s learning model and long-term engagement. Users are substituting streak repair for daily practice, not using it as a rare safety net.',
        severity: 'critical'
      },
      {
        id: 'wf-d60-decay',
        label: 'D60 retention lift (+0.9pp) much smaller than D30 (+4.2pp) — repair delays churn, not prevents it',
        description: 'If the retention benefit were durable, D60 would show a comparable lift to D30. The rapid decay from +4.2pp at D30 to +0.9pp at D60 suggests that streak repair postpones churn by 30 days — users stay because of the repair feature, but the degraded daily practice habit catches up with them.',
        severity: 'warning'
      }
    ],
    decisions: [
      {
        id: 'ship',
        label: 'Ship — D30 retention +4.2pp at p=0.01. The guardrail breach is acceptable given the retention gain.',
        description: 'The retention improvement outweighs the lesson completion decline.',
        score: 'junior_miss',
        feedback: 'The guardrail was pre-specified for a reason: daily lesson completion is the behavioral foundation of Duolingo\'s learning model. A feature that increases 30-day retention by letting users skip daily practice is not a product improvement — it is a short-term retention metric improvement at the cost of the core user behavior. The D60 decay (+0.9pp vs +4.2pp at D30) confirms that the benefit is temporary. You are retaining users in month 1 who churn in month 2 with worse learning habits than they started with.'
      },
      {
        id: 'rollback',
        label: 'Rollback — the guardrail breach is material and the D60 retention tells you the benefit doesn\'t hold.',
        description: 'Pre-specified guardrail breached. Do not ship.',
        score: 'senior_ready',
        feedback: 'Correct. Pre-specified guardrails exist precisely for this situation: a primary metric improvement that comes at a cost to a metric you care about deeply. The lesson completion breach (-8.2% vs a 5% guardrail) is not a technicality — it is evidence that the feature is substituting for the behavior it was supposed to support. The D60 retention confirms the intuition: the improvement is a delay, not a prevention. The correct action is rollback and redesign — a repair feature that can only be used once per month, or that requires a harder earn (two lessons instead of one) to prevent habitual substitution.'
      },
      {
        id: 'ship-limited',
        label: 'Ship with a cap — allow streak repair only once per month to prevent habitual use.',
        description: 'The safety net is valuable. Cap it so it can\'t become a substitute.',
        score: 'analyst_ready',
        feedback: 'This addresses the right problem — the habitual use pattern (2.1 repairs per user over 6 weeks = once every 2 weeks on average) — but "ship with a modification" based on a guardrail breach is not the correct protocol. The modified feature is a new product decision that has not been tested. Ship the current feature and you inherit the guardrail breach. The right path is to redesign the feature with the cap built in and test the modified version in a new experiment.'
      },
      {
        id: 'extend',
        label: 'Extend the experiment to 12 weeks to see if D60 retention improves.',
        description: 'More time will show whether the retention benefit is durable.',
        score: 'analyst_ready',
        feedback: 'The D60 signal is already available from the 6-week experiment (users who enrolled in week 1 have 6 weeks of follow-up). Extending gives you D90 data, which will likely show further decay given the mechanism — degraded daily practice habits accumulate over time, not recover. The guardrail breach is not resolved by more time; it is the current behavioral state of treatment users right now.'
      }
    ],
    idealDecision: 'rollback',
    secondBestDecision: 'ship-limited',
    juniorMistake: 'Ships on the D30 retention improvement without reading the guardrail breach or asking why D60 retention is so much weaker. Treats "retention is up" as sufficient evidence without asking what behavior change is driving it.',
    seniorFlags: [
      'When a primary metric improves but a guardrail breaches, the first question is: what is the mechanism? Here the mechanism is explicit — users are using the repair feature as a daily practice substitute (68% usage, 2.1 repairs in 6 weeks). That is not a safety net; that is a behavioral change.',
      'D30 vs D60 retention divergence is a leading indicator of delayed churn. A retention feature that shows +4.2pp at D30 and +0.9pp at D60 is retaining users for one month while degrading the habits that would retain them at month 2. The correct question is: what does D90 look like?',
      'Pre-specified guardrails are a commitment, not a suggestion. If the team pre-specified that lesson completion cannot decline more than 5%, then an 8.2% decline is a breach regardless of whether the primary metric improved. The guardrail was defined because the team believed lesson completion was a leading indicator of long-term value.'
    ],
    staffFlags: [
      'Would have designed the repair feature with hard constraints from the start: repair available maximum once per 30-day period, repair requires completing two lessons (harder earn), repair streak displayed differently to preserve the meaning of the main streak. These constraints would have been tested in the experiment rather than bolted on after a guardrail breach.',
      'Would have included D60 retention as a co-primary metric with D30, requiring both to be positive before shipping. A retention feature that is positive at D30 and flat at D60 has not demonstrated durable value.'
    ],
    debrief: 'Guardrail metrics exist to catch cases where a primary metric improvement is purchased at the cost of something the team values deeply. In this case, the cost is clear: treatment users practice less every day, use the repair feature habitually, and churn at nearly the same rate as control users by D60.\n\nThe mechanism is the diagnostic. 68% of eligible users used streak repair at least once. The average user repaired 2.1 times over 6 weeks — once every two weeks. This is not a rare safety net for exceptional circumstances. It is a behavioral change: users are learning that they can skip daily practice and repair the streak later. Duolingo\'s learning model depends on daily practice as the core habit. A feature that systematically weakens that habit is not a product improvement, regardless of what it does to D30 retention.\n\nThe D60 signal confirms the intuition. If streak repair genuinely addressed churn — if it was retaining users who would otherwise have left permanently — the retention benefit would compound over time, not decay. The rapid collapse from +4.2pp to +0.9pp between D30 and D60 is the signature of delayed churn: users stay because of the repair feature, but the weakened practice habit catches up with them in month 2.\n\nThe correct decision is rollback and redesign. A repair feature with tighter constraints — once per month maximum, harder earn (two lessons), distinct visual treatment to preserve streak meaning — addresses the safety net use case without enabling habitual substitution. That redesigned feature should be tested in a new experiment before shipping.',
    interviewTakeaway: 'Guardrail breaches are commitments, not suggestions. When a primary metric improves but a guardrail breaches, investigate the mechanism before deciding whether to ship. If the mechanism explains why the primary metric improved, the guardrail breach may invalidate the primary metric result entirely.',
    relatedConcepts: ['guardrail metrics', 'pre-specified constraints', 'behavioral substitution', 'retention decay', 'habit formation', 'D30 vs D60 retention'],
    scenarioFamily: 'guardrail_breach',
    tags: ['guardrail breach', 'streak', 'lesson completion', 'retention decay', 'habit substitution', 'consumer app', 'language learning']
  },

  // ─────────────────────────────────────────────
  // S23 — multiple_testing: The Eight-Metric Dashboard
  // ─────────────────────────────────────────────
  {
    id: 's23-airbnb-multiple-testing',
    title: 'The Eight-Metric Dashboard',
    subtitle: 'Airbnb · Host Onboarding · Multiple Testing',
    difficulty: 'senior',
    isFree: false,
    company: 'Airbnb',
    industry: 'marketplace',
    domain: 'onboarding',
    estimatedMin: 20,
    context: {
      company: 'Airbnb',
      product: 'Host marketplace — 6,800 new hosts enrolled in experiment',
      setup: 'Growth team tests a redesigned host onboarding flow with guided setup steps, photo tips, and pricing suggestions. They measure 8 metrics simultaneously across the onboarding funnel. After 4 weeks, 3 metrics show p<0.05.'
    },
    hypothesis: 'A redesigned host onboarding flow with guided steps, photo tips, and pricing suggestions will increase listing quality and speed-to-first-booking for new hosts.',
    experimentDesign: {
      type: 'A/B',
      randomizationUnit: 'host',
      targetPopulation: 'New hosts creating their first listing during the experiment window',
      primaryMetric: 'First booking within 30 days',
      plannedSplit: '50/50',
      runtime: '4 weeks'
    },
    metricReadout: {
      primaryMetric: {
        name: 'First booking within 30 days',
        control: '34.1%',
        treatment: '36.8%',
        delta: '+2.7pp',
        relativeChange: '+7.9%',
        pValue: 0.08,
        confidenceInterval: '[-0.4pp, +5.8pp]',
        significant: false
      },
      guardrailMetrics: [
        { name: 'Host cancellation rate (first 30 days)', control: '3.2%', treatment: '3.4%', delta: '+0.2pp', status: 'PASS', note: 'Within acceptable range' }
      ],
      diagnostics: [
        {
          metric: '8 funnel metrics tested simultaneously',
          type: 'diagnostic',
          direction: 'mixed',
          delta: 'Listing completion rate: p=0.03. Photo upload rate: p=0.41. Pricing setup completion: p=0.02. Message response rate: p=0.67. Availability setup: p=0.18. Superhost progress score: p=0.04. Review collection rate: p=0.29. First booking (primary): p=0.08.',
          pValue: null,
          confidenceInterval: null,
          significant: false,
          note: 'With 8 metrics at α=0.05, expected false positives under the null: 8 × 0.05 = 0.4. Bonferroni-corrected threshold: p<0.00625. Under correction, 0 of 8 metrics are significant. The 3 "significant" metrics are consistent with random variation at the boundary.'
        }
      ]
    },
    warningFlags: [
      {
        id: 'wf-multiple-testing',
        label: '8 metrics tested simultaneously — 3 significant results consistent with expected false positives',
        description: 'With 8 independent tests at α=0.05, the probability of at least one false positive is 1-(0.95^8) = 33.7%. Expected false positives under the null: 0.4. Observing 3 results at p<0.05 with p-values of 0.03, 0.02, and 0.04 is statistically consistent with 3 lucky draws from a null distribution. None of the 3 pass the Bonferroni-corrected threshold of p<0.00625.',
        severity: 'critical'
      },
      {
        id: 'wf-primary-not-significant',
        label: 'The pre-specified primary metric (first booking) is not significant — p=0.08',
        description: 'The experiment was designed to measure first booking within 30 days. That metric does not pass the significance threshold. Three secondary metrics that were not pre-specified as primary are being cited as evidence of success. This reverses the experiment design logic: secondary metrics should inform interpretation of a significant primary, not substitute for a non-significant primary.',
        severity: 'critical'
      }
    ],
    decisions: [
      {
        id: 'ship',
        label: 'Ship — 3 of 8 metrics are significant. The onboarding flow demonstrably improves host quality.',
        description: 'Listing completion, pricing setup, and superhost progress score all improved significantly.',
        score: 'junior_miss',
        feedback: 'Three significant results from 8 simultaneous tests is not strong evidence. Under Bonferroni correction (p<0.00625 for 8 tests), zero of the three significant results pass. The expected number of false positives from 8 tests at α=0.05 is 0.4 — observing 3 results near the threshold is within the range expected from random variation. Critically, the primary pre-specified metric (first booking) is not significant at p=0.08. Secondary metrics should not substitute for a non-significant primary.'
      },
      {
        id: 'do-not-ship',
        label: 'Do not ship. The primary metric is not significant, and the secondary results do not survive multiple testing correction.',
        description: 'The experiment failed to demonstrate the effect it was designed to detect.',
        score: 'senior_ready',
        feedback: 'Correct. First booking within 30 days was the pre-specified primary metric. It shows p=0.08 — not significant. The three secondary metrics at p=0.02-0.04 do not survive Bonferroni correction and are consistent with false positives from testing 8 metrics simultaneously. The experiment should be treated as a null result on its primary endpoint. The team can use the secondary metric trends as hypotheses for a follow-up experiment with pre-specified primaries.'
      },
      {
        id: 'rerun-primary-focus',
        label: 'Rerun with a single pre-specified primary metric and sufficient power for that metric only.',
        description: 'Narrow the experiment design and get a clean answer.',
        score: 'senior_ready',
        feedback: 'Also correct. The 8-metric design diluted power across too many outcomes and created a multiple testing problem. A follow-up experiment with one pre-specified primary (listing completion rate, given it showed the most directional signal) and adequate power for that metric would give a clean, trustworthy result. The current experiment gives the team hypotheses — not answers.'
      },
      {
        id: 'apply-correction-ship',
        label: 'Apply Bonferroni correction and ship based on whichever metrics survive.',
        description: 'Statistical correction handles the multiple testing problem.',
        score: 'analyst_ready',
        feedback: 'Bonferroni correction is the right statistical move, but none of the three results survive it (Bonferroni threshold: p<0.00625). Under correction, zero metrics are significant. Additionally, applying post-hoc correction to a pre-analysis that did not specify a correction procedure is less rigorous than pre-specifying the correction before the experiment ran. The correct path is a new experiment with a pre-specified primary metric and explicit correction plan.'
      }
    ],
    idealDecision: 'do-not-ship',
    secondBestDecision: 'rerun-primary-focus',
    juniorMistake: 'Ships because 3 of 8 metrics showed p<0.05, without calculating the family-wise false positive rate or applying any multiple testing correction. Does not notice that the primary pre-specified metric is not significant.',
    seniorFlags: [
      'The primary metric is the one the experiment was designed to measure. If the primary is not significant, the experiment is a null result — secondary metric movements are exploratory signals, not confirmatory evidence.',
      'The expected number of false positives from k tests at α is k×α. With 8 tests at α=0.05, expect 0.4 false positives. Observing 3 results at p=0.02-0.04 is suspicious, not confirmatory — the p-values are suspiciously clustered near the threshold, which is what random walks near alpha look like.',
      'Multiple testing correction should be pre-specified, not post-hoc. If the team knew they were testing 8 metrics, they should have declared a correction procedure (Bonferroni, Benjamini-Hochberg, or a hierarchical testing strategy) before the experiment launched.'
    ],
    staffFlags: [
      'Would have required the team to declare a single primary metric and up to 3 secondary metrics before the experiment launched. Secondary metrics are reported for context, not for shipping decisions. The experiment design should make this explicit.',
      'Would have designed a hierarchical testing strategy: test primary first; only test secondaries if primary is significant; apply Bonferroni to the secondary family. This controls family-wise error rate while preserving power for the primary metric.'
    ],
    debrief: 'Multiple testing inflates the false positive rate. When k hypotheses are tested simultaneously at α=0.05, the probability of at least one false positive is 1-(1-α)^k — for 8 tests, that is 33.7%. You will incorrectly conclude that at least one hypothesis is true roughly one time in three, even when all nulls are correct.\n\nThe expected number of false positives from 8 tests at α=0.05 is 0.4. Observing 3 results with p-values of 0.02, 0.03, and 0.04 is within the range of expected false positives from random variation. The p-values are near the decision boundary — exactly where random walks under the null spend time when you watch long enough.\n\nThe critical error in this experiment is treating secondary metrics as substitutes for a non-significant primary. The experiment was designed to detect first booking within 30 days. That metric does not pass significance. Pointing to secondary metrics — listing completion rate, pricing setup — as evidence of success is a form of p-hacking: running multiple tests and reporting the ones that crossed the threshold.\n\nThe correct action is to treat the experiment as a null result on its primary endpoint. The secondary metric signals are hypotheses for a follow-up experiment, not evidence for shipping. A follow-up with a single pre-specified primary (whichever secondary showed the most directional signal) and adequate power for that metric gives the team a trustworthy answer.',
    interviewTakeaway: 'Multiple testing is the most common source of false positives in product experimentation. With k tests at α, expected false positives = k×α. If the primary metric is not significant, the experiment is a null result — secondary metrics showing p<0.05 are exploratory signals, not shipping evidence.',
    relatedConcepts: ['multiple testing', 'family-wise error rate', 'Bonferroni correction', 'primary metric', 'pre-specification', 'false positive rate'],
    scenarioFamily: 'multiple_testing',
    tags: ['multiple testing', 'Bonferroni', 'family-wise error rate', 'primary metric', 'host onboarding', 'marketplace', 'null result']
  },

  // ─────────────────────────────────────────────
  // S24 — multiple_testing: The Pre-Spec Drift
  // ─────────────────────────────────────────────
  {
    id: 's24-pinterest-prespec',
    title: 'The Pre-Spec Drift',
    subtitle: 'Pinterest · Content Discovery · Multiple Testing',
    difficulty: 'staff',
    isFree: false,
    company: 'Pinterest',
    industry: 'consumer',
    domain: 'content-discovery',
    estimatedMin: 22,
    context: {
      company: 'Pinterest',
      product: 'Visual discovery platform — 2.1M users in experiment',
      setup: 'Product team tests "Board Recommendations" — an AI-powered panel suggesting related boards to follow based on a user\'s current board. Pre-registered primary metrics: save rate, time in app, board creation rate. Experiment runs 3 weeks. After results come in, the team also reports on 4 post-hoc segment analyses and 5 additional engagement metrics.'
    },
    hypothesis: 'Board Recommendations will increase content depth engagement: users who discover related boards will save more content, spend more time in app, and create more boards.',
    experimentDesign: {
      type: 'A/B',
      randomizationUnit: 'user',
      targetPopulation: 'Users who visited at least one board page during the experiment window',
      primaryMetric: 'Save rate (saves per session) — pre-specified primary',
      plannedSplit: '50/50',
      runtime: '3 weeks'
    },
    metricReadout: {
      primaryMetric: {
        name: 'Save rate (saves per session) — pre-specified',
        control: '4.82',
        treatment: '5.14',
        delta: '+0.32 saves/session (+6.6%)',
        relativeChange: '+6.6%',
        pValue: 0.02,
        confidenceInterval: '[+0.05, +0.59]',
        significant: true
      },
      guardrailMetrics: [
        { name: 'Pin report rate', control: '0.31%', treatment: '0.30%', delta: '-0.01pp', status: 'PASS', note: 'No meaningful change' }
      ],
      diagnostics: [
        {
          metric: 'Pre-specified secondary metrics',
          type: 'diagnostic',
          direction: 'mixed',
          delta: 'Time in app (pre-specified): +1.2 min/session (p=0.09, not significant). Board creation rate (pre-specified): +0.8pp (p=0.31, not significant).',
          pValue: null,
          confidenceInterval: null,
          significant: false,
          note: '2 of 3 pre-specified primary/secondary metrics are not significant. Only save rate passes.'
        },
        {
          metric: 'Post-hoc analyses (not pre-specified)',
          type: 'diagnostic',
          direction: 'positive',
          delta: 'New users (≤30 days): save rate +14.2% (p=0.003). Fashion category: save rate +18.1% (p=0.001). Users on iOS: time in app +3.1 min (p=0.04). Users who followed ≥1 recommended board: saves +31% (p<0.001). 4 additional engagement metrics: 2 significant at p<0.05.',
          pValue: null,
          confidenceInterval: null,
          significant: false,
          note: 'Post-hoc analyses show strong effects in specific segments. These were not pre-specified and must be treated as hypotheses, not confirmatory results.'
        }
      ]
    },
    warningFlags: [
      {
        id: 'wf-prespec-drift',
        label: '2 of 3 pre-specified metrics not significant — post-hoc analyses are driving the shipping narrative',
        description: 'Save rate (primary) is significant. Time in app and board creation rate (pre-specified secondaries) are not. The team is now citing 4 post-hoc segment analyses showing strong effects in new users, fashion category, iOS, and board followers. These analyses were not pre-specified and represent a form of pre-spec drift: the shipping decision is being driven by exploratory analyses, not the pre-registered hypothesis.',
        severity: 'critical'
      },
      {
        id: 'wf-post-hoc-inflation',
        label: 'Post-hoc segment analyses inflate the apparent effect — fishing in the data after observing results',
        description: 'Running 4 segment analyses and 5 engagement metrics post-hoc after observing mixed pre-specified results is a form of outcome switching. The probability that at least one of 9 post-hoc tests produces p<0.05 by chance is 1-(0.95^9) = 37%. The "strong effects" in new users and fashion are likely a combination of a real interaction effect and inflated false positive rates from undisclosed multiple testing.',
        severity: 'warning'
      }
    ],
    decisions: [
      {
        id: 'ship-all',
        label: 'Ship to all — save rate is significant, and the post-hoc analyses show strong effects in multiple segments.',
        description: 'Multiple signals all pointing in the same direction is confirmatory.',
        score: 'junior_miss',
        feedback: 'Post-hoc analyses pointing in the same direction as a pre-specified result is not confirmatory — it is expected, because the same underlying effect will surface in multiple metrics if it is real. The question is whether the post-hoc analyses are detecting real effects or are false positives from multiple testing. With 9 post-hoc tests, at least one false positive at p<0.05 is expected 37% of the time. The pre-specified secondaries (time in app, board creation) not being significant is a signal that the overall effect is smaller or more narrowly concentrated than the hypothesis stated.'
      },
      {
        id: 'ship-primary-only',
        label: 'Ship based on save rate only. Treat post-hoc analyses as hypotheses for follow-up.',
        description: 'The pre-specified primary passed. Secondary analyses are exploratory.',
        score: 'senior_ready',
        feedback: 'This is defensible. Save rate was pre-specified as primary and is significant. The decision to ship can rest on this single pre-specified result. The post-hoc analyses — especially the new user and fashion category segments — should be treated as hypotheses for a follow-up targeted experiment, not as additional evidence for the current shipping decision. Time in app and board creation rate not being significant means the hypothesis that Board Recommendations drives broader engagement depth is not confirmed.'
      },
      {
        id: 'confirm-segments',
        label: 'Run a confirmatory experiment targeting new users and fashion category, then decide.',
        description: 'The post-hoc segments showed strong effects. Confirm them before shipping broadly.',
        score: 'senior_ready',
        feedback: 'Also correct, and the more conservative path. The new user (p=0.003) and fashion category (p=0.001) signals are strong enough to be worth confirming — but they must be confirmed in a new experiment with those segments as the pre-specified target population, not used as justification for the current experiment\'s result. A confirmatory experiment with pre-specified segments and a single primary metric (save rate within that segment) would give the team a trustworthy answer about whether to target these segments specifically.'
      },
      {
        id: 'do-not-ship',
        label: 'Do not ship — 2 of 3 pre-specified metrics are not significant, suggesting the hypothesis is not confirmed.',
        description: 'The experiment was designed to show broad engagement improvement. It didn\'t.',
        score: 'analyst_ready',
        feedback: 'This is too conservative given that the pre-specified primary (save rate) is significant. The hypothesis was that Board Recommendations increases save rate, time in app, and board creation. Save rate is confirmed. The others are not. This is a partial confirmation — the feature has a demonstrated effect on saves but not on broader engagement depth. Shipping based on a significant primary while noting that secondary metrics did not confirm the broader hypothesis is a legitimate approach.'
      }
    ],
    idealDecision: 'ship-primary-only',
    secondBestDecision: 'confirm-segments',
    juniorMistake: 'Treats the post-hoc segment analyses as additional confirmatory evidence. Does not notice that 2 of 3 pre-specified metrics are not significant. Does not calculate how many post-hoc tests were run or what the false positive rate is.',
    seniorFlags: [
      'Pre-specification is a commitment to evaluate specific hypotheses at specific thresholds. When pre-specified metrics fail, the experiment has not confirmed the hypothesis — regardless of what post-hoc analyses show. The post-hoc analyses are exploratory, not confirmatory.',
      'The distinction between confirmatory and exploratory analysis must be maintained at the point of the decision, not just at the design stage. A team that pre-specifies 3 metrics and then runs 9 post-hoc analyses has effectively converted a confirmatory experiment into an exploratory one. The results should be communicated accordingly.',
      'Pre-spec drift is a cultural problem as much as a statistical one. It happens because the team is under pressure to show results, and the data contains something positive. The correct response is: report the pre-specified results honestly, then treat post-hoc findings as input to the next experiment brief.'
    ],
    staffFlags: [
      'Would have required the experiment brief to include an explicit list of all analyses to be conducted, with a distinction between confirmatory (pre-specified, decision-relevant) and exploratory (post-hoc, hypothesis-generating). The brief would require sign-off before the experiment launched. Any analysis not on the list before launch is labeled exploratory in the final report.',
      'Would have treated the new user and fashion category effects as a finding worth pursuing — but through a targeted follow-up experiment, not as justification for a broad ship. "This experiment found a strong signal in new users and fashion. Our next experiment will test Board Recommendations targeted at these segments with save rate as the pre-specified primary." That is the right scientific process.'
    ],
    debrief: 'Pre-specification exists to separate hypotheses from observations. When you declare in advance which metrics you will evaluate and at what thresholds, the results are confirmatory — they test a hypothesis that existed before the data was observed. When you identify metrics to report after observing the data, the results are exploratory — they generate hypotheses for future testing, not evidence for current decisions.\n\nIn this experiment, the pre-specified hypothesis was that Board Recommendations increases save rate, time in app, and board creation. Save rate passed. Time in app and board creation did not. A strict reading of the experiment design says the hypothesis was partially confirmed: the feature demonstrably increases saves but does not demonstrate the broader engagement depth improvement the team hypothesized.\n\nThe post-hoc analyses create the appearance of a stronger result than the experiment actually produced. New users showing +14.2% save rate improvement (p=0.003) and fashion category showing +18.1% (p=0.001) are compelling — but these analyses were not pre-specified. They were identified after observing that the pre-specified secondaries were not significant. This is a form of outcome switching: adjusting which hypothesis you report based on what the data shows.\n\nThe statistical consequence: with 9 post-hoc tests at α=0.05, the probability of at least one false positive is 37%. The strong effects in new users and fashion may be real interaction effects, or they may be the expected false positives from running 9 tests. Without a pre-specified hypothesis about these segments, you cannot distinguish between them from this experiment alone.\n\nThe correct path: ship based on the significant primary (save rate), label the post-hoc findings as exploratory, and run a confirmatory follow-up experiment targeting new users and fashion with pre-specified segments and a single primary metric.',
    interviewTakeaway: 'Pre-specification is a commitment, not a suggestion. When pre-specified metrics fail, post-hoc analyses are hypotheses — not confirmatory evidence. The experiment result is what the pre-specified metrics say it is. Post-hoc segments get their own confirmatory experiment.',
    relatedConcepts: ['pre-specification', 'confirmatory vs exploratory analysis', 'outcome switching', 'multiple testing', 'post-hoc analysis', 'false positive rate'],
    scenarioFamily: 'multiple_testing',
    tags: ['multiple testing', 'pre-specification', 'post-hoc analysis', 'outcome switching', 'Pinterest', 'content discovery', 'segment analysis']
  },

  // ─────────────────────────────────────────────
  // S25 — hte_subgroups: The Long-Form Trap
  // ─────────────────────────────────────────────
  {
    id: 's25-spotify-hte',
    title: 'The Long-Form Trap',
    subtitle: 'Spotify · Podcast Discovery · Heterogeneous Treatment Effects',
    difficulty: 'senior',
    isFree: false,
    company: 'Spotify',
    industry: 'consumer',
    domain: 'content-discovery',
    estimatedMin: 20,
    context: {
      company: 'Spotify',
      product: 'Audio streaming — 3.8M users in experiment',
      setup: 'Product team tests a new podcast recommendation algorithm that surfaces long-form podcasts (60+ min) based on listening history. Hypothesis: surfacing high-quality long-form content increases podcast engagement. 4-week experiment, 50/50 user split.'
    },
    hypothesis: 'A recommendation algorithm weighted toward long-form podcasts will increase overall podcast listen rate by surfacing high-quality content that users are likely to complete and return to.',
    experimentDesign: {
      type: 'A/B',
      randomizationUnit: 'user',
      targetPopulation: 'All users who opened the podcast tab at least once in the 30 days before experiment start',
      primaryMetric: 'Podcast listen rate (% of sessions with ≥10 min of podcast listening)',
      plannedSplit: '50/50',
      runtime: '4 weeks'
    },
    metricReadout: {
      primaryMetric: {
        name: 'Podcast listen rate (sessions with ≥10 min podcast)',
        control: '28.4%',
        treatment: '31.5%',
        delta: '+3.1pp',
        relativeChange: '+10.9%',
        pValue: 0.04,
        confidenceInterval: '[+0.2pp, +6.0pp]',
        significant: true
      },
      guardrailMetrics: [
        { name: 'Music listen rate', control: '74.2%', treatment: '73.8%', delta: '-0.4pp', status: 'PASS', note: 'No meaningful cannibalization of music' },
        { name: '30-day retention', control: '81.3%', treatment: '80.1%', delta: '-1.2pp', status: 'WARNING', note: 'Directionally negative, p=0.09 — not significant but worth monitoring' }
      ],
      diagnostics: [
        {
          metric: 'Listen rate by engagement tier',
          type: 'segment',
          direction: 'divergent',
          delta: 'Power listeners (≥5 podcasts/month, 22% of users, 61% of podcast hours): +11.2pp (p=0.001). Casual listeners (0-1 podcasts/month, 58% of users, 12% of podcast hours): -4.8pp (p=0.02, statistically significant harm).',
          pValue: 0.0001,
          confidenceInterval: null,
          significant: true,
          note: 'The algorithm surfaces 60+ min episodes. Power listeners have time and habit to engage with long-form. Casual listeners are recommended content that requires 60+ min commitment — most skip it entirely and listen to nothing, dragging their listen rate below control.'
        },
        {
          metric: 'Skip rate on recommended podcasts',
          type: 'diagnostic',
          direction: 'negative',
          delta: 'Casual listeners: 78% skip rate on recommended long-form episodes (vs 41% skip rate on short-form). Power listeners: 22% skip rate on long-form recommendations.',
          pValue: null,
          confidenceInterval: null,
          significant: false,
          note: 'Casual listeners are being recommended content they are not willing to commit to. The algorithm optimizes for power listener preferences and misserves the majority segment.'
        }
      ]
    },
    warningFlags: [
      {
        id: 'wf-casual-listener-harm',
        label: 'Casual listeners show statistically significant harm (-4.8pp, p=0.02) — not just directional noise',
        description: 'Unlike typical HTE scenarios where the harmed segment shows a non-significant directional negative, here the casual listener harm is statistically significant (p=0.02). The algorithm recommends 60+ min episodes to users who have never listened to more than one podcast per month. 78% of those recommendations are skipped entirely, reducing casual listener engagement below baseline.',
        severity: 'critical'
      },
      {
        id: 'wf-retention-signal',
        label: '30-day retention directionally negative (-1.2pp, p=0.09) — casual listener churn risk',
        description: 'Retention is not significant but the direction is consistent with the casual listener harm. Users who repeatedly receive recommendations they skip may disengage from the podcast tab entirely. The 4-week experiment window may be too short to capture the full churn impact of a degraded recommendation experience.',
        severity: 'warning'
      }
    ],
    decisions: [
      {
        id: 'ship-all',
        label: 'Ship to all — +3.1pp overall listen rate at p=0.04.',
        description: 'The overall result is positive. Ship.',
        score: 'junior_miss',
        feedback: 'The +3.1pp overall result masks statistically significant harm to 58% of users. Casual listeners — the majority by account count — show -4.8pp listen rate (p=0.02). This is not a directional negative that might be noise; it is a significant harm. Shipping to all means deploying an algorithm that actively degrades the experience for the majority of users while improving it for the high-engagement minority. The retention signal (-1.2pp, p=0.09) suggests this degradation may compound over time.'
      },
      {
        id: 'ship-power-users',
        label: 'Ship to power listeners (≥5 podcasts/month) only. Do not apply to casual listeners.',
        description: 'The algorithm works for its intended segment. Gate it to that segment.',
        score: 'senior_ready',
        feedback: 'Correct. Power listeners show +11.2pp listen rate improvement (p=0.001) — a strong, reliable effect for the segment the algorithm was designed for. Gating to power listeners means the algorithm serves users who have the habit and time for long-form content. Casual listeners get their current recommendation experience, which is not harming them. The next step: design a separate algorithm variant for casual listeners — optimized for shorter episodes (15-30 min) — and test that separately.'
      },
      {
        id: 'rollback',
        label: 'Rollback — significant harm to 58% of users outweighs benefit to 22%.',
        description: 'The overall product experience is degraded for the majority.',
        score: 'analyst_ready',
        feedback: 'Rollback is a reasonable position given the statistically significant harm to casual listeners and the directionally negative retention signal. However, power listeners — 22% of users but 61% of podcast hours — would lose a feature that demonstrably improves their experience. A targeted rollout (power listeners only) captures the benefit without the harm. Rollback forgoes that benefit entirely, which is harder to justify when segmented deployment is available.'
      },
      {
        id: 'adjust-algorithm',
        label: 'Adjust the algorithm to reduce long-form weighting for users below a listen frequency threshold.',
        description: 'Tune the algorithm to segment automatically rather than shipping a hard gate.',
        score: 'senior_ready',
        feedback: 'Also correct, and potentially more elegant than a hard gate. If the algorithm can dynamically weight episode length by user listen frequency — heavy weighting toward long-form for power listeners, light weighting for casual listeners — it could serve both segments without an explicit gate. But this modified algorithm has not been tested. "Ship a modified version we haven\'t tested" carries risk. A hard gate on the current algorithm (power listeners only) is the conservative, testable path. The dynamic version should be its own experiment.'
      }
    ],
    idealDecision: 'ship-power-users',
    secondBestDecision: 'rollback',
    juniorMistake: 'Ships to all based on the overall +3.1pp result without checking for segment divergence. Does not notice that p=0.04 on a wide CI [+0.2pp, +6.0pp] suggests a mixed effect. Does not ask why skip rates are so high.',
    seniorFlags: [
      'When a recommendation algorithm produces an overall positive result with a wide confidence interval, the first question is: which users is this helping, and which is it hurting? Wide CIs on positive primaries often indicate that a strong positive in one segment is being diluted by a negative in another.',
      'Statistically significant harm in a subgroup is qualitatively different from directionally negative but non-significant harm. A p=0.02 result for the harmed segment means the algorithm is reliably hurting casual listeners — not just noisily failing to help them. This changes the shipping calculus significantly.',
      'The skip rate diagnostic (78% for casual listeners vs 22% for power listeners) tells you the mechanism: the algorithm is recommending content the majority of users are unwilling to consume. This is not a personalization win; it is a mismatch between the algorithm\'s optimization target (power listener preferences) and the majority\'s needs.'
    ],
    staffFlags: [
      'Would have required the algorithm team to define the target user segment before the experiment: "This algorithm is designed for users with ≥5 podcast listens per month." The experiment would have been run on that segment as the primary population, with casual listeners as a pre-specified secondary to check for spillover effects. The current experiment design treated all users as equivalent when the algorithm clearly was not.',
      'Would have flagged the listen frequency distribution as a key input to the algorithm design. If 58% of your user base listens to 0-1 podcasts per month, an algorithm that surfaces 60+ min episodes is calibrated for 22% of users and will actively mismatch for the majority. Distributional awareness of the user base should precede algorithm design, not follow experiment results.'
    ],
    debrief: 'This experiment illustrates a specific and common HTE pattern: an algorithm optimized for high-engagement users that systematically mismatch for the majority.\n\nLong-form podcast recommendations work well for power listeners — users who have time, established listening habits, and the patience to commit to a 60-minute episode. For casual listeners, the same recommendations create a commitment barrier. A user who listens to one podcast per month and is recommended a 90-minute true-crime series will skip it. Do that consistently and you degrade their experience below baseline.\n\nThe key difference from a typical HTE scenario is that the casual listener harm is statistically significant (p=0.02). This is not a directional negative that might resolve with more data — it is a reliable, measured harm. 78% of long-form recommendations to casual listeners are skipped. The mechanism is clear and the harm is confirmed.\n\nThe correct decision is segmented rollout: power listeners get the algorithm, casual listeners get their current recommendation experience. This captures 100% of the measured benefit (power listeners, +11.2pp) while delivering zero harm to the majority.\n\nThe retention signal (-1.2pp, p=0.09) deserves monitoring post-ship, even in the power-listener-only deployment. If power listeners who consume more long-form content are listening to less music, there may be a slower-moving cannibalization effect not captured in the 4-week window.\n\nThe longer-term product question is: what algorithm serves casual listeners well? Shorter episodes (15-30 min), familiar formats, and entry-level content would be the starting hypotheses. That is a separate experiment.',
    interviewTakeaway: 'A positive overall result with a wide CI often signals a strong positive in one segment masking harm in another. When the harmed segment\'s result is statistically significant — not just directionally negative — that changes the shipping calculus from "maybe ship with caveats" to "segment the rollout before any deployment."',
    relatedConcepts: ['heterogeneous treatment effects', 'recommendation algorithms', 'engagement tiers', 'segment harm', 'long-form content', 'algorithm personalization'],
    scenarioFamily: 'hte_subgroups',
    tags: ['HTE', 'podcast recommendations', 'long-form content', 'engagement tiers', 'casual vs power users', 'algorithm personalization', 'statistically significant harm']
  },

  // ─────────────────────────────────────────────
  // S26 — guardrail_breach: The Margin Blind Spot
  // ─────────────────────────────────────────────
  {
    id: 's26-ctr-margin-trap',
    title: 'The Margin Blind Spot',
    subtitle: 'CTR up 18%. Add-to-cart is up. Contribution margin per session is down 11%. The PM wants to ship.',
    difficulty: 'senior',
    isFree: false,
    company: 'Crafted',
    industry: 'ecommerce',
    domain: 'marketplace',
    estimatedMin: 18,
    context: {
      company: 'Crafted',
      product: 'Two-sided marketplace — homepage recommendations carousel',
      team: 'Recommendations team',
      background: 'Crafted tested a new recommendation carousel on the homepage — "Deals of the Day" surfacing heavily discounted items. 14-day test, 50/50 split, user-level. Primary metric: CTR on recommendations. Guardrail: contribution margin per session (pre-declared).',
      businessPressure: 'The PM wants to ship before the end of the quarter. The primary metric is positive and the team is citing strong user engagement.'
    },
    hypothesis: 'Surfacing high-discount deals on the homepage carousel will increase buyer engagement and session CVR.',
    experimentDesign: {
      type: 'A/B',
      allocation: '50/50',
      runtime: '14 days',
      targetPopulation: 'All logged-in users who visit the homepage',
      primaryMetric: 'CTR on recommendations carousel',
      guardrailMetrics: ['Contribution margin per session (pre-declared)', 'ATC rate on non-deal items'],
      sampleSizeContext: 'Sufficient traffic for the 14-day window; both primary and guardrail metrics reached statistical significance.'
    },
    metricReadout: [
      {
        metric: 'CTR on recommendations (primary)',
        type: 'primary',
        direction: 'positive',
        delta: '+18.3%',
        pValue: 0.001,
        confidenceInterval: '[+14.1%, +22.5%]',
        note: 'Strong, significant positive — the "Deals of the Day" carousel drives substantially more clicks than the baseline carousel.'
      },
      {
        metric: 'Add-to-cart rate',
        type: 'secondary',
        direction: 'positive',
        delta: '+9.0%',
        pValue: 0.002,
        confidenceInterval: '[+3.4%, +14.6%]',
        note: 'Buyers are adding discounted items to cart at a meaningfully higher rate.'
      },
      {
        metric: 'Orders per session',
        type: 'secondary',
        direction: 'positive',
        delta: '+4.1%',
        pValue: 0.04,
        confidenceInterval: '[+0.2%, +8.0%]',
        note: 'Directionally positive but wide CI — effect on completed orders is real but smaller than CTR and ATC suggest.'
      },
      {
        metric: 'Contribution margin per session (guardrail — pre-declared)',
        type: 'guardrail',
        direction: 'negative',
        delta: '-11.2%',
        pValue: 0.001,
        confidenceInterval: '[-14.8%, -7.6%]',
        note: 'PRE-DECLARED GUARDRAIL BREACHED. Highly significant. The carousel increases order volume but drives buyers toward heavily discounted items with lower contribution margin.'
      },
      {
        metric: 'ATC rate on non-deal items (guardrail — pre-declared)',
        type: 'guardrail',
        direction: 'negative',
        delta: '-7.2%',
        pValue: 0.01,
        confidenceInterval: '[-12.1%, -2.3%]',
        note: 'PRE-DECLARED GUARDRAIL BREACHED. Buyers who see the deal carousel are adding fewer full-margin items to cart — cannibalization signal.'
      }
    ],
    decisions: [
      {
        id: 'rollback',
        label: 'Roll back — the pre-declared guardrail is breached and statistically significant.',
        description: 'Contribution margin per session is down 11.2% (p<0.001). This was pre-declared. The decision is made.',
        score: 'senior_ready',
        feedback: 'Correct. Pre-declared guardrails exist precisely for this scenario: the primary metric looks good, engagement is up, and there is pressure to ship. But the guardrail — contribution margin per session — is down 11.2% at p<0.001. This is not a close call. You cannot negotiate a pre-declared guardrail after observing that the primary metric looks positive. The "Deals of the Day" format cannibalises full-margin purchases: buyers spend their purchase intent on discounted items and buy fewer full-price items. CTR going up while margin goes down is exactly the failure mode the guardrail was designed to catch.'
      },
      {
        id: 'ship-with-monitoring',
        label: 'Ship with contribution margin monitoring — primary metric is positive, we can watch margin post-ship.',
        description: 'The engagement signal is strong. Monitor margin after shipping and roll back if it worsens.',
        score: 'junior_miss',
        feedback: 'Wrong. The guardrail was pre-declared for this exact reason: post-hoc monitoring is not a substitute for pre-declared constraints. If you could monitor and roll back after shipping, there would be no point in pre-declaring guardrails at all. The contribution margin breach is statistically significant at p<0.001 — this is not a monitoring question, it is a confirmed result. Shipping and watching is how teams erode margin one "we\'ll monitor it" decision at a time.'
      },
      {
        id: 'investigate-cannibalization',
        label: 'Investigate the cannibalization mechanism before deciding.',
        description: 'The non-deal ATC decline is interesting. Understand the mechanism, then decide.',
        score: 'analyst_ready',
        feedback: 'Useful instinct but the wrong sequencing. The guardrail breach is already the answer — the mechanism (cannibalization) is confirmed by the non-deal ATC decline, which is itself a pre-declared guardrail. Investigation is the right second step after rolling back, not a prerequisite to the rollback decision. The pre-declared guardrail does not require a mechanism explanation before it triggers — it was designed to be decision-making-without-explanation.'
      }
    ],
    idealDecision: 'rollback',
    warningFlags: [
      {
        id: 'wf-guardrail-breach',
        label: 'Pre-declared guardrail breached at p<0.001 — not a close call',
        description: 'Contribution margin per session is down 11.2% at p<0.001 with a tight CI. This guardrail was pre-declared before the experiment ran. A post-observation argument that "the primary metric is strong" does not override a pre-declared guardrail.',
        severity: 'critical'
      },
      {
        id: 'wf-cannibalization',
        label: 'Non-deal ATC rate declining — cannibalization confirmed',
        description: 'ATC on non-deal items is down 7.2% (p=0.01). Buyers are substituting discounted items for full-margin purchases, not adding them incrementally. The deal carousel is not growing the basket — it is shifting it toward lower-margin items.',
        severity: 'critical'
      },
      {
        id: 'wf-ctr-misalignment',
        label: 'CTR as primary metric was misaligned with platform economics from the start',
        description: 'A recommendation carousel\'s job is to drive profitable orders, not clicks. CTR optimisation without a contribution floor creates the exact failure mode observed: high engagement, declining economics. The primary metric should have been revenue per session or contribution per session, not CTR.',
        severity: 'warning'
      }
    ],
    debrief: 'This experiment illustrates why pre-declared guardrails exist: to protect against the shipping pressure that follows a positive primary metric result.\n\nThe "Deals of the Day" carousel does exactly what it sounds like — it surfaces heavily discounted items, buyers click on them and add them to cart, and orders per session ticks up. From a pure engagement standpoint, the feature works. CTR is up 18%, ATC is up 9%, orders are up 4%.\n\nBut the platform is not in the business of maximising clicks — it is in the business of profitable transactions. The contribution margin per session dropped 11.2% because buyers who enter the session through a deal carousel spend their purchase intent on low-margin discounted items. They are not adding those items on top of their normal basket; they are substituting them for full-price items. The non-deal ATC rate decline (-7.2%) confirms the cannibalization mechanism directly.\n\nThe pre-declared guardrail exists precisely for this moment. Before the experiment ran, the team agreed that if contribution margin per session declined significantly, the feature would not ship regardless of primary metric performance. Post-observation, the PM is arguing that the primary metric is strong and the team should ship with monitoring. This is how pre-declared guardrails get eroded: one "but the primary metric is good" exception at a time.\n\nPre-declared guardrails cannot be negotiated post-hoc. The moment you allow teams to override guardrails when the primary metric is positive, the guardrail system stops functioning as a constraint and becomes an advisory that is only enforced when convenient.\n\nThe correct decision is to roll back and redesign. The longer-term fix: change the primary metric for recommendation experiments from CTR to revenue per session or contribution per session. CTR tells you if people clicked, not if the feature was good for the business.',
    interviewTakeaway: 'Pre-declared guardrails are not advisory. A significant guardrail breach is the answer — not the beginning of a negotiation. The strength of the primary metric result does not change this.',
    relatedConcepts: ['guardrail metrics', 'pre-specification', 'cannibalization', 'contribution margin', 'metric alignment'],
    scenarioFamily: 'guardrail_breach',
    tags: ['guardrail breach', 'contribution margin', 'cannibalization', 'CTR', 'marketplace', 'deals', 'recommendation carousel', 'pre-declared guardrail']
  },

  // ─────────────────────────────────────────────
  // S27 — guardrail_breach: The Easy Checkout Trap
  // ─────────────────────────────────────────────
  {
    id: 's27-cvr-return-trap',
    title: 'The Easy Checkout Trap',
    subtitle: 'CVR is up 6.2%. Return rate is up 31%. The PM says returns are a logistics problem, not ours.',
    difficulty: 'senior',
    isFree: false,
    company: 'Fieldstone Home',
    industry: 'ecommerce',
    domain: 'checkout',
    estimatedMin: 18,
    context: {
      company: 'Fieldstone Home',
      product: 'E-commerce platform — furniture and home goods, high AOV (avg Rs 8,400)',
      team: 'Checkout experience team',
      background: 'Tested a simplified one-step checkout — removed the order summary review screen, reduced fields from 8 to 4, pre-filled address from last order. 21-day test, 50/50 split, user-level. Primary metric: checkout CVR. Guardrail: return rate (pre-declared).',
      businessPressure: 'The checkout team has been tasked with reducing checkout abandonment. CVR improvement is the team\'s primary KPI. The PM argues that returns are handled by the logistics team and should not block a checkout win.'
    },
    hypothesis: 'Reducing checkout friction will increase order completion without affecting purchase quality or return behaviour.',
    experimentDesign: {
      type: 'A/B',
      allocation: '50/50',
      runtime: '21 days',
      targetPopulation: 'All users who reached the checkout page',
      primaryMetric: 'Checkout CVR (orders / checkout page visits)',
      guardrailMetrics: ['Return rate (pre-declared)', 'Revenue per order'],
      sampleSizeContext: '21-day window chosen to allow sufficient return rate observation given typical 7-14 day return windows for furniture purchases.'
    },
    metricReadout: [
      {
        metric: 'Checkout CVR (primary)',
        type: 'primary',
        direction: 'positive',
        delta: '+6.2%',
        pValue: 0.003,
        confidenceInterval: '[+2.2%, +10.2%]',
        note: 'Significant positive. The simplified checkout meaningfully increases order completion.'
      },
      {
        metric: 'Orders',
        type: 'secondary',
        direction: 'positive',
        delta: '+5.8%',
        pValue: 0.008,
        confidenceInterval: '[+1.5%, +10.1%]',
        note: 'Consistent with CVR improvement — more orders completed.'
      },
      {
        metric: 'Return rate (guardrail — pre-declared)',
        type: 'guardrail',
        direction: 'negative',
        delta: '+31%',
        pValue: 0.001,
        confidenceInterval: '[+21%, +41%]',
        note: 'PRE-DECLARED GUARDRAIL BREACHED. Highly significant and large in magnitude. The simplified checkout is associated with a 31% increase in return rate.'
      },
      {
        metric: 'Revenue per order',
        type: 'guardrail',
        direction: 'negative',
        delta: '-3.1%',
        pValue: 0.06,
        confidenceInterval: '[-6.3%, +0.1%]',
        note: 'Directionally negative, marginally non-significant. Buyers in treatment may be completing smaller or less certain purchases.'
      },
      {
        metric: 'Refund processing cost',
        type: 'secondary',
        direction: 'negative',
        delta: '+28%',
        pValue: 0.002,
        confidenceInterval: '[+11%, +45%]',
        note: 'Returns at furniture AOV carry significant reverse logistics cost. A 28% increase in refund processing cost is material to unit economics.'
      }
    ],
    decisions: [
      {
        id: 'rollback',
        label: 'Roll back — the return rate guardrail breach is pre-declared and significant (+31%, p<0.001).',
        description: 'The mechanism is clear: removing the review screen reduced purchase consideration quality. The economics are negative.',
        score: 'senior_ready',
        feedback: 'Correct. The return rate guardrail is pre-declared and the breach is +31% at p<0.001 — statistically unambiguous. The mechanism is also clear: removing the order summary screen eliminated a consideration checkpoint that was doing real work. For high-AOV furniture purchases, the review screen is not friction — it is a decision-quality filter. Buyers who skip it are completing impulse orders they later regret. CVR improving while returns jump 31% means the feature is making it easy to buy things people don\'t want. The net economics are negative once return processing costs are included.'
      },
      {
        id: 'ship-returns-logistics',
        label: 'Ship — returns are a logistics and ops problem, not a product problem.',
        description: 'The checkout team improved CVR. Returns are handled by a different team.',
        score: 'junior_miss',
        feedback: 'Wrong, and this is a common framing failure. Returns are not an autonomous logistics event — they are a consequence of the product decision to remove the review screen. If the simplified checkout causes buyers to complete orders they did not fully intend, and those orders get returned, the product decision caused the returns. Attribution of outcomes to "other teams" does not change the causal chain. The checkout team is responsible for the full downstream economics of their checkout design, including return rates — especially when return rate was pre-declared as a guardrail.'
      },
      {
        id: 'ship-low-return-segment',
        label: 'Ship to buyers with historically low return rates — segment where the guardrail breach is not present.',
        description: 'The guardrail breach may be driven by high-return-rate buyers. Gate to low-risk segments.',
        score: 'analyst_ready',
        feedback: 'Partially defensible instinct but wrong execution. The guardrail was pre-declared for the full population, not a subset. Segmenting post-hoc to find a subset where the breach does not appear is a form of outcome switching — you are looking for a population where the constraint does not bind after observing that it binds platform-wide. The right path is to roll back, diagnose whether the return mechanism is category-specific or buyer-segment-specific, and redesign the checkout with a soft gate for high-AOV orders.'
      }
    ],
    idealDecision: 'rollback',
    warningFlags: [
      {
        id: 'wf-return-guardrail',
        label: 'Return rate breached pre-declared guardrail at +31%, p<0.001',
        description: 'A 31% increase in return rate for a high-AOV category (avg Rs 8,400) has significant economic consequences. The guardrail was pre-declared for this exact reason — furniture returns are expensive. This is not a marginal result.',
        severity: 'critical'
      },
      {
        id: 'wf-logistics-framing',
        label: '"Returns are a logistics problem" is product ownership abdication',
        description: 'If a product decision causes an increase in returns, the product team owns that outcome. Framing the guardrail breach as someone else\'s problem is a failure of product ownership that will recur across future decisions if not corrected.',
        severity: 'critical'
      },
      {
        id: 'wf-friction-doing-work',
        label: 'The removed friction was doing real work — consideration checkpoint for high-AOV purchases',
        description: 'For furniture and home goods at Rs 8,400 average order value, an order summary screen is not standard UX friction. It is a deliberate decision-quality step. Removing it speeds up the purchase path for buyers who were already certain — and accelerates completion for buyers who were not. The second group creates returns.',
        severity: 'warning'
      }
    ],
    debrief: 'The checkout team ran a clean experiment with a well-designed hypothesis: less friction means more orders. They were right — CVR is up 6.2% and orders are up 5.8%. The experiment worked.\n\nBut the pre-declared guardrail — return rate — is up 31% at p<0.001. This is the finding that matters.\n\nThe friction that was removed was doing something. For a furniture retailer with an average order value of Rs 8,400, the order summary review screen is not standard UX friction — it is a consideration checkpoint. Buyers who see their full order before confirming have an explicit opportunity to reconsider. Some of them do reconsider and abandon. Those abandonments were not lost sales; they were buyers who correctly decided they did not want the item. The simplified checkout removes that checkpoint, completing orders for buyers who would have abandoned, and those buyers return the items.\n\nThe PM\'s argument — that returns are a logistics problem, not a product problem — is the critical framing failure. The product decision (removing the review screen) is causally upstream of the return event. If the product design changes which orders complete, it is responsible for the downstream quality of those orders. Product teams that disclaim responsibility for return rates are optimising CVR at the expense of economics, then attributing the cost to operations.\n\nThe pre-declared guardrail exists precisely to prevent this argument from winning. Before the experiment ran, the team agreed that if return rate increased significantly, the feature would not ship. Post-observation, the PM is trying to reframe the guardrail as "not our metric." The guardrail system only works if it is enforced regardless of how the team frames the downstream outcome.\n\nThe build on this: add a "review before confirming" soft gate for orders above a threshold AOV. This preserves the friction reduction for low-consideration purchases (small items, repeat buyers, familiar categories) while maintaining the decision-quality checkpoint for high-consideration purchases where the review screen does real work.',
    interviewTakeaway: 'Friction is not always bad. In high-consideration purchase contexts, UX friction is a decision-quality mechanism. Removing it can increase CVR while degrading the quality of completed orders. Return rate as a guardrail exists to catch exactly this failure mode.',
    relatedConcepts: ['guardrail metrics', 'return rate', 'checkout friction', 'purchase consideration', 'product ownership', 'unit economics'],
    scenarioFamily: 'guardrail_breach',
    tags: ['guardrail breach', 'return rate', 'checkout CVR', 'friction', 'furniture', 'high AOV', 'pre-declared guardrail', 'product ownership']
  },

  // ─────────────────────────────────────────────
  // S28 — trust_and_validity: The Two Problems
  // ─────────────────────────────────────────────
  {
    id: 's28-srm-segment-harm',
    title: 'The Two Problems',
    subtitle: 'SRM detected. Segment harm confirmed. The PM says both are explainable. The result is still positive.',
    difficulty: 'staff',
    isFree: false,
    company: 'Orion',
    industry: 'consumer_tech',
    domain: 'notifications',
    estimatedMin: 25,
    context: {
      company: 'Orion',
      product: 'Consumer mobile — daily utility app, 4.2M MAU',
      team: 'Notifications team',
      background: 'Tested a new notification personalization model — timing and content personalized by user behavior cluster. 28-day test. Primary: 7-day active session rate. SRM detected on day 3; team investigated and concluded it was caused by a push permission prompt firing differently in treatment — iOS users in treatment were shown a permission prompt earlier, causing more permission denials and treatment arm dropoff. Team decided to continue the experiment.',
      businessPressure: 'The notifications team has been working on this personalization model for two quarters. The primary result is positive. There is pressure to ship before the next planning cycle.'
    },
    hypothesis: 'Personalising notification timing and content by user behavior cluster will increase 7-day active session rates across all users.',
    experimentDesign: {
      type: 'A/B',
      allocation: '50/50',
      runtime: '28 days',
      targetPopulation: 'All users who had notifications enabled at experiment start',
      primaryMetric: '7-day active session rate',
      guardrailMetrics: ['Notification opt-out rate (not pre-declared — observed post-hoc)'],
      sampleSizeContext: 'SRM detected on day 3: actual split was 65/35 (treatment/control) vs intended 50/50. Team continued after attributing SRM to iOS permission prompt behavior.'
    },
    metricReadout: [
      {
        metric: '7-day active session rate — overall (primary)',
        type: 'primary',
        direction: 'positive',
        delta: '+4.1%',
        pValue: 0.02,
        confidenceInterval: '[+0.6%, +7.6%]',
        note: 'Significant but wide CI. Based on a sample with confirmed SRM — the treatment arm over-represents Android users.'
      },
      {
        metric: '7-day active session rate — Android users',
        type: 'segment',
        direction: 'positive',
        delta: '+6.3%',
        pValue: 0.008,
        confidenceInterval: '[+1.7%, +10.9%]',
        note: 'Strong positive effect for Android. Android users were not differentially affected by the iOS permission prompt issue.'
      },
      {
        metric: '7-day active session rate — iOS users',
        type: 'segment',
        direction: 'negative',
        delta: '-1.2%',
        pValue: 0.31,
        confidenceInterval: '[-3.5%, +1.1%]',
        note: 'Directionally negative, not statistically significant. iOS users were disproportionately dropped from the treatment arm due to the permission prompt. The surviving iOS treatment sample is not representative of the iOS population.'
      },
      {
        metric: 'SRM check',
        type: 'diagnostic',
        direction: 'negative',
        delta: '65/35 actual vs 50/50 intended (chi-square p<0.001)',
        pValue: 0.001,
        confidenceInterval: null,
        note: 'SRM confirmed. The treatment arm is overloaded with Android users because iOS users were dropped from treatment at higher rates due to the push permission prompt behavior.'
      },
      {
        metric: 'Notification opt-out rate (post-hoc observation)',
        type: 'guardrail',
        direction: 'negative',
        delta: '+8.9% in treatment vs control',
        pValue: null,
        confidenceInterval: null,
        note: 'Not pre-declared as a guardrail. Observed post-hoc. Treatment users are opting out of notifications at a higher rate — the personalization model may be sending more notifications that feel intrusive.'
      }
    ],
    decisions: [
      {
        id: 'do-not-ship',
        label: 'Do not ship. The SRM was not resolved — it was explained. Explanation is not resolution.',
        description: 'The assignment mechanism was broken. The +4.1% result is a biased estimate. Re-run with proper randomization after fixing the permission prompt.',
        score: 'senior_ready',
        feedback: 'Correct. SRM explanation does not fix SRM. The team identified that the iOS permission prompt caused treatment arm dropout — but that explanation does not make the sample representative. The treatment arm over-represents Android users (who responded well) and under-represents iOS users (who were systematically excluded). The +4.1% result is not the treatment effect for the intended population; it is the treatment effect for the biased surviving sample. Shipping to all users based on an estimate derived from a non-representative sample risks a real negative impact on iOS users — the segment that the experiment failed to adequately represent. The correct path: fix the permission prompt issue and re-run with proper 50/50 randomization. The Android signal (+6.3%) is real and worth preserving — but it needs to be confirmed in a clean experiment before any iOS deployment.'
      },
      {
        id: 'ship-android-only',
        label: 'Ship to Android only, re-run for iOS separately.',
        description: 'Android shows a clean positive. iOS was compromised by the SRM. Ship what is known.',
        score: 'analyst_ready',
        feedback: 'The instinct to separate Android and iOS is correct — the SRM differentially affected iOS users. But acting on the Android result from an SRM-contaminated experiment is still acting on biased data. The Android estimate (+6.3%) comes from an experiment where the overall randomization was broken. Even for the Android segment, you cannot be certain that the SRM did not introduce subtle confounds (e.g., if iOS users who stayed in treatment are systematically different from those who dropped, the control arm composition may have shifted in ways that affect the Android comparison). The cleaner path: acknowledge the Android signal as a strong hypothesis, fix the permission prompt, and re-run with Android as the primary target population in a clean experiment.'
      },
      {
        id: 'ship-all',
        label: 'Ship — the SRM was investigated and explained, and the overall primary result is significant at p=0.02.',
        description: 'The team did due diligence on the SRM. The result is positive. Ship.',
        score: 'junior_miss',
        feedback: 'Wrong. This is the exact reasoning that SRM checks are designed to prevent. "We know why the SRM happened" is not the same as "the SRM did not affect our results." The assignment mechanism did not work as intended — iOS users were systematically excluded from treatment. The +4.1% result reflects a sample where Android users are over-represented and iOS users under-represented. If the feature is shipped to all users based on this result, the iOS experience is being influenced by a model whose effect on iOS users was never cleanly estimated. The opt-out rate increase (+8.9%) — even though not pre-declared — is a directional warning that the model may be less well-calibrated for the surviving treatment sample than the result suggests.'
      }
    ],
    idealDecision: 'do-not-ship',
    secondBestDecision: 'ship-android-only',
    warningFlags: [
      {
        id: 'wf-srm-not-resolved',
        label: 'SRM was explained but not resolved — the sample is still biased',
        description: 'Identifying why an SRM occurred does not fix the broken randomization. The treatment arm still over-represents Android and under-represents iOS. The primary estimate (+4.1%) reflects this biased sample, not the full intended population.',
        severity: 'critical'
      },
      {
        id: 'wf-ios-directionally-negative',
        label: 'iOS users directionally negative (-1.2%, p=0.31) — the under-represented segment shows no benefit',
        description: 'iOS users — the segment most affected by the SRM — show a directionally negative result that is non-significant. Non-significant does not mean zero. The iOS treatment sample is not representative of the iOS population, so this result cannot be trusted in either direction.',
        severity: 'critical'
      },
      {
        id: 'wf-optout-posthoc',
        label: 'Opt-out rate up 8.9% — post-hoc observation with no pre-declared threshold',
        description: 'The opt-out rate increase was not pre-declared as a guardrail, so it cannot formally block the ship decision. But it is a directional signal that treatment users are opting out of notifications at a higher rate — which would erode the session rate benefit over time if the model remains deployed.',
        severity: 'warning'
      }
    ],
    debrief: 'This experiment has two independent problems, and the team\'s response to both reveals a systematic bias toward shipping.\n\nThe first problem: SRM. On day 3, the team detected a 65/35 split versus the intended 50/50. They investigated, identified a plausible cause (iOS push permission prompt), and continued. This decision — to continue an experiment with a known broken randomization — is the core error. An explained SRM is still a broken experiment. The mechanism (iOS dropout) is interesting and useful for fixing the next experiment. But it does not retroactively repair the assignment mechanism. The treatment arm spent 28 days with an over-representation of Android users and an under-representation of iOS users. Any effect estimate from this experiment reflects that biased sample, not the intended population.\n\nThe second problem: segment divergence. Android users show +6.3% (p=0.008). iOS users show -1.2% (p=0.31). iOS users are the segment that was differentially excluded from treatment — so the iOS result cannot be trusted in either direction. But the directional pattern — strong positive for Android, flat-to-negative for iOS — is consistent with a model that was inadvertently calibrated on the Android-heavy treatment sample and may not generalise to iOS.\n\nThe correct decision is to not ship. The primary estimate is biased. The iOS segment — representing a significant fraction of the user base — shows no benefit from a non-representative sample. The opt-out rate increase (+8.9%) is a warning that the model may be sending more notifications that users want to opt out of, which would erode the session rate benefit over a longer horizon.\n\nThe clean path forward: fix the iOS permission prompt issue so it does not differentially affect randomization, then re-run with proper 50/50 assignment. The Android signal is a strong hypothesis for what a well-run experiment will confirm. Test it in a clean experiment.\n\nThe broader lesson: pre-declaring guardrails is not optional. If notification opt-out rate had been pre-declared, the team would have had a clear framework for the ship decision — and the post-hoc discovery of the 8.9% increase would have been actionable rather than just concerning. Post-hoc guardrail identification is not acceptable as a substitute for pre-specification.',
    interviewTakeaway: 'SRM explanation does not equal SRM resolution. An experiment with a broken assignment mechanism produces a biased estimate for the intended population, regardless of how well the team understands why the mechanism broke. The correct response to SRM is to stop, fix, and re-run — not to explain and continue.',
    relatedConcepts: ['sample ratio mismatch', 'SRM', 'randomization', 'iOS permission prompts', 'segment harm', 'pre-specification', 'guardrail metrics'],
    scenarioFamily: 'trust_and_validity',
    tags: ['SRM', 'sample ratio mismatch', 'iOS', 'Android', 'notification personalization', 'segment divergence', 'opt-out rate', 'broken randomization']
  }

];

// ─────────────────────────────────────────────
// UTILITY: get free scenarios
// ─────────────────────────────────────────────
export const freeScenarios = scenarios.filter(s => s.isFree);
export const paidScenarios = scenarios.filter(s => !s.isFree);

// ─────────────────────────────────────────────
// UTILITY: get scenario by id
// ─────────────────────────────────────────────
export const getScenarioById = (id) => scenarios.find(s => s.id === id);
