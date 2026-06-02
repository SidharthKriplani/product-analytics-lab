export const behavioralQuestions = [
  {
    id: 'BEH01',
    title: 'Changing a PM\'s Mind with Cohort Data',
    subtitle: 'Influence · Data-Driven Persuasion',
    difficulty: 'analyst',
    isFree: true,
    tags: ['stakeholder management', 'cohort analysis', 'north star metric', 'A/B testing'],
    category: 'influence',

    prompt: 'Tell me about a time you disagreed with a PM or stakeholder about a key product decision and used data to change their mind.',

    starGuide: {
      situation: 'Set the stage: what was the product, what decision was being made, and what was the PM\'s position? Explain the metric they were optimizing for.',
      task: 'What was your role, and what was at stake if the decision went forward as planned?',
      action: 'This is the most important part. Walk through: how did you identify the problem in the data, how did you frame the conversation, and why did you choose to approach the PM privately first? What analysis did you actually run?',
      result: 'What changed? Did they agree? What was the outcome for the product and for the relationship?',
    },

    strongAnswerMarkers: [
      'Identifies a specific vanity metric vs. north star metric tension',
      'Approaches the PM in a 1:1 before a group setting',
      'Reframes the conversation around shared goal rather than "you\'re wrong"',
      'Runs additional analysis (holdout, cohort) to confirm the hypothesis',
      'Gives the PM credit in the eventual outcome',
    ],

    modelAnswer: {
      situation: 'Our growth team was preparing to ship a new content discovery feature. The PM was excited about the results from an internal preview — impressions were up 40% and click-through on the feature itself was strong. She wanted to move straight to a full rollout in the next sprint. I was doing routine cohort analysis on engagement that week and noticed something the headline metrics weren\'t capturing: session depth — our north star metric for content consumption — was essentially flat in the cohort of users who had been exposed to the new feature, and slightly negative in the 18-34 segment.',
      task: 'My job was to flag this before we committed to the rollout. The feature was already on the sprint plan, the PM had socially committed to it in a leadership sync, and reversing course in a group setting would have been embarrassing for her.',
      action: 'Instead of raising it in the next team standup, I pulled the PM into a quick 1:1 the afternoon before the sprint planning meeting. I framed it not as "your feature doesn\'t work" but as: "I want to show you something I\'m seeing in the cohort data before we finalize tomorrow — I think there\'s a question worth answering first." I walked her through the cohort breakdown: impressions were high because the feature was prominent in the feed, but users who clicked it were not going deeper into the content library. I hypothesized that it was optimizing for top-of-funnel visibility at the cost of session depth. To get a cleaner read, we agreed to run a two-week holdout on 10% of the audience and instrument session depth as an explicit guardrail metric on the scorecard. The holdout confirmed the finding: session depth in the holdout group was statistically flat (p=0.41) while the impression metric looked great.',
      result: 'The PM agreed to delay the rollout and work with the content team on a revised version that tied the discovery feature more directly to curated playlists — which they hypothesized would drive deeper sessions. Session depth moved +3pp in the revised experiment. She also added depth as a permanent guardrail on the experiment scorecard going forward. She later mentioned in a team retro that the early flag saved her from a "good-looking-bad-outcome" launch. The relationship got stronger, not weaker.',
    },

    keyPrinciples: [
      'Lead with the data and the question, not a position. "I\'m seeing something — can we look at this together?" lands better than "I think you\'re wrong."',
      'Persuade in private before advocating in public. Giving the PM space to update their view without losing face is just as important as the data itself.',
      'Give the PM credit in the reframe. The goal is a better product decision, not being right.',
    ],

    antiPatterns: [
      'Raising the concern for the first time in a group meeting or all-hands — this creates defensiveness, not alignment.',
      'Presenting only the opposing data without a clear "here\'s what I suggest we do instead" — data without a recommendation puts all the burden on the PM.',
    ],
  },

  {
    id: 'BEH02',
    title: 'Delivering a Metric Miss Before the QBR',
    subtitle: 'Communication · Delivering Bad News',
    difficulty: 'analyst',
    isFree: true,
    tags: ['stakeholder communication', 'OKRs', 'early signaling', 'executive communication'],
    category: 'communication',

    prompt: 'Tell me about a time you had to deliver bad news to a stakeholder or leadership — a metric miss, a failed experiment, or a launch that underperformed.',

    starGuide: {
      situation: 'What was the expected outcome, and what actually happened? When did you find out the metric was going to miss?',
      task: 'What was your responsibility in this situation — were you the analyst, the DS lead, the person who ran the experiment?',
      action: 'The meat is here: did you wait for the scheduled review or did you proactively signal early? How did you structure the message? Did you come with just the bad news or with a framing and recommendation?',
      result: 'How did leadership react? What did the team do differently afterward? What did this do for your credibility?',
    },

    strongAnswerMarkers: [
      'Surfaces the problem proactively rather than waiting for the scheduled review',
      'Frames the message as "here\'s what the data shows, here\'s what we know about why, here\'s what I recommend"',
      'Comes with a clear recommendation for next steps — not just the bad news',
      'Treats it as a learning moment, not a failure to minimize',
      'Mentions the trust-building effect of early signaling',
    ],

    modelAnswer: {
      situation: 'At the end of Q2, we were tracking to miss our primary engagement OKR — daily active content consumers — by about 15%. The miss was tied to a content feature launch that had shipped in week 4 of the quarter. I was the analytics lead for the content team, and I was running weekly cohort reports. By week 7 of the quarter, I could see from the early cohort trajectory that we were not going to recover to target by the end of the quarter — there simply wasn\'t enough time. The official QBR was three weeks away.',
      task: 'I had a choice: wait for the QBR, where leadership would see the miss live in a slide deck in front of 20 people, or get ahead of it. My instinct was that the worst outcome wasn\'t missing the metric — it was the surprise.',
      action: 'I put together a brief pre-read and asked for 20 minutes with the VP of Product and the content lead the following morning. I structured it in three parts: first, "here\'s what the data shows" — the miss, the magnitude, the timeline. Second, "here\'s what we understand about why" — the content feature drove top-of-funnel numbers but not retention in the second week of the cohort, which we now believed was a novelty effect. Third, "here\'s what I recommend we do this quarter and in Q3" — pause the content feature expansion, run a focused experiment on week-2 retention hooks, and add a second-week cohort retention rate as a leading indicator on the Q3 OKR dashboard so we\'d catch this pattern earlier. I was explicit that I was still refining the "why" analysis and would have a fuller picture in 48 hours.',
      result: 'The VP\'s response was: "I appreciate you bringing this to me now instead of at the QBR." The miss was still reported at the QBR, but the team came in with a clear diagnosis and a Q3 plan already drafted — which landed very differently than a surprise. The week-2 retention hook experiment in Q3 showed a +5pp improvement. The pre-read format became standard practice on the team for any projected OKR miss.',
    },

    keyPrinciples: [
      'Never let a metric miss be a surprise. The cost of a surprise at a QBR is much higher than the cost of a difficult conversation three weeks early.',
      'Early signaling builds trust faster than perfect results. Leaders remember who gave them time to react.',
      'Come with a "here\'s what we do next" recommendation. Bad news plus a plan is a problem to solve; bad news alone is just bad news.',
    ],

    antiPatterns: [
      'Waiting until the scheduled review to surface a miss that was visible weeks earlier — this reads as either oblivious or politically motivated.',
      'Delivering the bad news without any analysis of why it happened — a metric number without a hypothesis is almost useless to a leader.',
    ],
  },

  {
    id: 'BEH03',
    title: 'Finding the Leaky Bucket Behind Flat DAU',
    subtitle: 'Data Impact · Proactive Insight',
    difficulty: 'analyst',
    isFree: true,
    tags: ['proactive analysis', 'DAU/MAU', 'cohort analysis', 'acquisition quality', 'dashboard'],
    category: 'data-impact',

    prompt: 'Tell me about a time you identified a significant metric anomaly or insight that the team or leadership had missed — and what impact it had.',

    starGuide: {
      situation: 'What were you doing (routine monitoring, ad-hoc analysis, etc.) and what caught your attention? What was everyone else focused on?',
      task: 'What was the gap between what people were measuring and what you believed was actually happening?',
      action: 'Walk through the analysis: how did you confirm the anomaly, how did you segment it, and how did you frame it for the team? Did you come with just the observation or with a hypothesis about the cause?',
      result: 'What changed as a result of surfacing this insight? Was there a product change, a metric change, a strategic shift?',
    },

    strongAnswerMarkers: [
      'Identifies a metric that was hidden in averages or not on the existing dashboard',
      'Uses cohort segmentation to pinpoint where the problem is concentrated',
      'Frames the insight as a business risk, not just an analytical observation',
      'Comes to the team with a hypothesis about the cause, not just the anomaly',
      'Result includes either a product change, a channel mix change, or a new metric added to the dashboard',
    ],

    modelAnswer: {
      situation: 'I was doing weekly metric monitoring on our growth dashboard. DAU was growing — up 8% over six weeks — and that\'s where leadership attention was focused. During a routine pass, I noticed that DAU/MAU ratio (stickiness) had declined from 22% to 19% over the same period. That\'s a 3-percentage-point drop, which sounds small, but embedded in growing DAU numbers it was essentially invisible. Nobody had a chart for it; it had to be computed manually from two separate tables.',
      task: 'I wanted to understand whether the stickiness decline was a product problem or an acquisition mix problem, because the remedy is completely different. If it\'s a product problem, you fix retention mechanics. If it\'s an acquisition problem, you fix channel mix. My job was to diagnose which it was before bringing it to leadership.',
      action: 'I pulled a cohort breakdown by acquisition channel — paid social, paid search, organic search, and referral. The stickiness decline was almost entirely concentrated in users acquired via paid social (DAU/MAU down from 21% to 16%) while organic and referral cohorts were flat or slightly improving. I ran a second cut: paid social volume had increased 35% over the same period — the team had doubled down on paid acquisition to hit the DAU target. In the weekly metrics review, I presented it this way: "We\'re growing DAU by filling the top of the funnel with paid social users who churn at higher rates. We\'re building a leaky bucket. The stickiness number shows we\'re working twice as hard to stay in place on retained users." I brought a clear exhibit: two lines on one chart — DAU (going up) and DAU/MAU by channel (paid social line going down, organic line flat).',
      result: 'Leadership agreed to add a stickiness guardrail to the OKR dashboard going forward, so it couldn\'t be hidden by raw DAU growth again. The growth team shifted paid acquisition budget from paid social toward interest-based targeting with higher historic retention rates. Over the next two quarters, DAU/MAU stabilized back above 21%. The more lasting impact was the dashboard change — the metric became a standard weekly indicator.',
    },

    keyPrinciples: [
      'Surface what people aren\'t measuring, not just what they\'re monitoring. The most important insights are usually off the dashboard.',
      'Frame the insight as a business risk, not an analytical observation. "We\'re building a leaky bucket" lands differently than "stickiness is declining."',
      'Bring a hypothesis about the cause alongside the finding. An anomaly without a hypothesis just creates anxiety; an anomaly plus a plausible cause gives people something to act on.',
    ],

    antiPatterns: [
      'Presenting the anomaly without any segmentation or hypothesis — "DAU/MAU is down" tells you there\'s a problem but not where to look.',
      'Framing it as a "here\'s an interesting data fact" rather than a "here\'s a risk to our OKR" — the framing determines whether people act.',
    ],
  },

  {
    id: 'BEH04',
    title: 'Stopping a False-Positive A/B Launch Before All-Hands',
    subtitle: 'Conflict · Protecting Analytical Integrity',
    difficulty: 'senior',
    isFree: false,
    tags: ['experiment design', 'statistical power', 'false positive', 'pushback', 'stakeholder conflict'],
    category: 'conflict',

    prompt: 'Tell me about a time you had to push back on a poorly designed experiment or a conclusion being drawn from flawed analysis.',

    starGuide: {
      situation: 'What was the experiment or analysis, and what conclusion was about to be communicated — and to whom?',
      task: 'What did you spot that others had missed? What was the risk of letting it go forward?',
      action: 'Most important: how did you flag it, to whom, and when? How did you frame the pushback to make it a collaboration, not a confrontation? What specific analysis did you do to demonstrate the flaw?',
      result: 'Did the announcement get stopped or modified? What happened when the experiment was re-run correctly? What was the impact on the team\'s analytical standards?',
    },

    strongAnswerMarkers: [
      'Flags the problem privately and early — not in a public meeting',
      'Identifies a specific statistical flaw (underpowered test, tracking anomaly, short runtime)',
      'Runs the power calculation to demonstrate the problem concretely',
      'Reframes pushback as "here\'s how we make this more defensible" rather than "you got it wrong"',
      'The re-run experiment produces a different or null result — validating the concern',
    ],

    modelAnswer: {
      situation: 'The growth team had been running an A/B test on a new checkout flow redesign for about 4 days. The results showed a +4% lift in conversion rate with p=0.03, and the growth lead was planning to announce the "successful launch" in the following day\'s company all-hands. I was reviewing the experiment as part of a cross-team analytics review process we\'d recently introduced.',
      task: 'I had 48 hours before the all-hands to either flag it or let it go. The risk of letting it go was significant: if we shipped the redesign based on a false positive and conversion reverted to baseline post-launch, we\'d have a much harder time explaining the miss — and it would undermine confidence in the entire experimentation program.',
      action: 'I went straight to the growth lead — not to the experiment team\'s manager and not in the public review thread. I asked if we could look at the experiment together for 20 minutes. I walked through three things: First, the runtime. At our traffic volumes, detecting a true 4% lift at 80% power required at minimum 14 days — I showed the power calculation in a notebook. We had run it for 4. Second, the sample size. The confidence interval at day 4 was wide enough that the true effect could plausibly be anywhere from -1% to +9%. Third, a tracking anomaly. Day 2 of the experiment had a spike in treatment-side conversions that looked like a tag-firing issue — removing that day moved the lift estimate from +4% to +2.5% and p from 0.03 to 0.09. My suggestion to the growth lead: "We can announce this as a very promising early signal in the all-hands — which it genuinely is — and say we\'re running the full test to confirm before shipping. That\'s actually a better story: it shows we have the rigor to not jump on early results."',
      result: 'The growth lead agreed immediately. The all-hands announcement became "early signal looks strong, full test in progress." The experiment was re-run with the correct runtime. The final result was a 1.1% lift, p=0.18 — statistically inconclusive. The redesign was not shipped. More durably: the growth team added a power calculation requirement to their experiment kick-off template, and we established a 48-hour review window before any experiment results could be announced externally.',
    },

    keyPrinciples: [
      'Protecting the team from bad conclusions is not criticism — it\'s the job. Framing it as "here\'s how we make this more defensible" makes you an ally, not an obstacle.',
      'Timing matters: private flag early beats public correction late. Once a result is announced, reversing it is much harder and more damaging than preventing the announcement.',
      'Come with a concrete alternative framing for the stakeholder. "Here\'s what you can say instead" is as important as "here\'s what you shouldn\'t say."',
    ],

    antiPatterns: [
      'Raising the concern in the review thread or Slack channel where the growth team lead would be publicly corrected — this creates defensiveness and makes it about ego, not the data.',
      'Flagging the issue without the power calculation or tracking evidence — "I don\'t think this test ran long enough" without numbers is just an opinion.',
    ],
  },

  {
    id: 'BEH05',
    title: 'Getting Engineering Buy-In Without Escalation',
    subtitle: 'Leadership · Cross-Functional Influence',
    difficulty: 'senior',
    isFree: false,
    tags: ['cross-functional', 'influence without authority', 'data engineering', 'prioritization', 'stakeholder alignment'],
    category: 'leadership',

    prompt: 'Tell me about a time you had to influence a decision without having direct authority — you needed something from another team.',

    starGuide: {
      situation: 'What did you need from another team, and why were they not already prioritizing it? What was the competing pressure on their side?',
      task: 'What was at stake for your work if you couldn\'t get this done? And why couldn\'t you just escalate?',
      action: 'The heart of the answer: how did you make the ask? Did you quantify the value? Did you make it easy for them to say yes? Did you give them co-ownership? How did you avoid the trap of escalating first?',
      result: 'What was the outcome? Did they reprioritize? How did the relationship change?',
    },

    strongAnswerMarkers: [
      'Quantifies the business value of the ask in terms the other team cares about',
      'Writes a one-pager or structured ask rather than a Slack message',
      'Gives the other team co-ownership or credit — not just a task',
      'Explicitly avoids escalating to their manager as a first move',
      'The relationship is stronger after the ask, not transactional',
    ],

    modelAnswer: {
      situation: 'I needed our data engineering team to implement a new event-level tracking schema for a critical retention experiment I was designing. The experiment would measure the impact of a new onboarding flow on 30-day retention, and without the new events, I\'d have to use a proxy metric that was a much weaker signal. The DE team had a full backlog — they were in the middle of a warehouse migration — and my request was sitting at spot 14 in their queue. At our current velocity, that meant a 5-sprint delay, which would push the experiment out of the quarter entirely.',
      task: 'If the experiment slipped out of the quarter, we\'d miss the retention learning window that was tied to a product decision the leadership team needed to make by Q3 planning. I couldn\'t just wait. But I also didn\'t want to escalate to the DE manager or their VP — that would create resentment and make the DE team feel like I was going over their heads for routine work.',
      action: 'I spent an afternoon writing a one-pager: the specific tracking ask (5 new events, estimated 3 engineering days of work), the business value in concrete terms (the experiment was designed to detect a 5pp improvement in 30-day retention; at current scale, a confirmed 5pp improvement was worth approximately $300k in incremental annual subscription revenue), and the cost of delay (experiment slips out of quarter, Q3 product roadmap decision made without data). I also mapped out the alternative: if we couldn\'t get the full tracking, I offered a reduced-scope version that could be implemented in 1 day and would give us a weaker but usable signal. Then I set up a 30-minute working session with the DE lead — not to ask for their approval, but to walk through the experiment design together and get their input on the instrumentation approach. I asked them explicitly: "I want your fingerprints on how we track this — you\'ll catch things I won\'t." They flagged a deduplication edge case I\'d missed, which they would have had to fix anyway post-launch.',
      result: 'The DE lead re-slotted the work from sprint 5 to sprint 2, prioritizing the reduced-scope version first and the full schema in the sprint after. The experiment launched on time. The DE lead mentioned in a team retro that the one-pager was the clearest ask they\'d received from analytics that quarter. The relationship became more collaborative — they started flagging schema decisions to me proactively in subsequent sprints.',
    },

    keyPrinciples: [
      'Influence starts with making the other team\'s work feel meaningful, not with escalation. People prioritize work they\'re invested in, not work they were told to do.',
      'Make the ask specific and the value quantified. A one-pager with a dollar value is much harder to deprioritize than a Jira ticket with "high priority."',
      'Give the other person a win too — credit, co-ownership, or a problem to solve. The DE team\'s deduplication catch made the tracking better and gave them a stake in the outcome.',
    ],

    antiPatterns: [
      'Leading with escalation to the other team\'s manager — this gets the work done once and poisons the relationship for every future ask.',
      'Framing the ask as urgent without explaining why — "this is a blocker" without a business case reads as your problem, not their priority.',
    ],
  },

  {
    id: 'BEH06',
    title: 'When Time-Spent Going Down Was Actually Good',
    subtitle: 'Data Impact · Counter-Intuitive Experiment Results',
    difficulty: 'senior',
    isFree: false,
    tags: ['experiment interpretation', 'heterogeneous treatment effects', 'user segmentation', 'north star metric', 'personalization'],
    category: 'data-impact',

    prompt: 'Tell me about a time an experiment or analysis you ran had an unexpected or counter-intuitive result — how did you handle it?',

    starGuide: {
      situation: 'What was the experiment and what did you expect to happen? What was the actual result, and why was it surprising?',
      task: 'What pressure was there to either dismiss the result or declare it a failure? What was your responsibility in the interpretation?',
      action: 'This is the key part: what did you do before drawing a conclusion? Did you check for heterogeneous treatment effects? Did you look at secondary metrics? Did you generate a competing hypothesis and test it?',
      result: 'What was the final interpretation? Was the feature shipped? What was the impact of getting the interpretation right rather than reacting to the surface-level number?',
    },

    strongAnswerMarkers: [
      'Resists the first-instinct explanation (the model is broken, the tracking is wrong)',
      'Checks for heterogeneous treatment effects by user segment',
      'Generates a testable hypothesis for the unexpected result',
      'Identifies the right metric for the actual user value (not just the one that moved)',
      'The correct interpretation leads to a ship or a correct no-ship rather than a default reaction',
    ],

    modelAnswer: {
      situation: 'We shipped a feed personalization model designed to improve content relevance. The north star metric for this experiment was time spent in the content feed. When we read out the results, time spent was down 8% in the treatment group, p<0.001. The effect was clear and statistically strong. The team\'s immediate reaction was: the model is broken, we need to roll it back.',
      task: 'I was the DS lead on the experiment. Before we called it a failure and rolled back, I wanted to make sure we understood what was actually happening, because the effect size was very clean — it didn\'t look like noise or a tracking bug. A clean negative effect on an important metric is interesting, not just bad.',
      action: 'I asked for 48 hours before any rollback decision. First, I checked for a tracking anomaly — session lengths in control and treatment were internally consistent, so that wasn\'t it. Second, I ran a heterogeneous treatment effects cut by user engagement tier: casual users (bottom 40% by weekly sessions), regular users (middle 40%), and power users (top 20%). The time-spent decline was entirely concentrated in casual users (-12%) while power users actually showed a modest increase (+6%). Hypothesis: the personalization model was making casual users realize faster that they\'d seen all the content relevant to them — efficient exploration rather than passive scrolling. For casual users, shorter sessions might mean satisfied intent, not disengagement. To test this, I pulled day-30 retention for each tier in treatment vs. control. Casual users in treatment showed 4pp higher day-30 retention than control. They were coming back more, not less. The personalization was compressing session length while improving return frequency.',
      result: 'We shipped the model with a nuanced framing for the leadership presentation: "Session length is down for casual users, which our analysis suggests reflects more efficient content discovery rather than disengagement — day-30 retention is 4pp higher in the same cohort." The team also updated the experiment scorecard to include both session length and return frequency as co-primary metrics for personalization experiments going forward, since session length alone was not capturing the right user value in this feature class.',
    },

    keyPrinciples: [
      'Unexpected results are hypotheses, not conclusions. A clean effect in the "wrong" direction is often telling you something real about user behavior.',
      'Always check heterogeneous treatment effects before calling a result counter-intuitive. The aggregate can mask opposite effects across segments.',
      'Know which metric is the right one for the actual user value you\'re creating. Session length is a proxy — return frequency and long-term retention are closer to the actual value for a personalization feature.',
    ],

    antiPatterns: [
      'Immediately assuming a surprising negative result is a bug or a measurement error — the first instinct should be to understand it, not dismiss it.',
      'Looking only at the primary metric and missing the secondary metrics that tell the fuller story.',
    ],
  },

  {
    id: 'BEH07',
    title: 'Revenue Forecast from 3 Weeks of Incomplete Data',
    subtitle: 'Leadership · Decision-Making Under Uncertainty',
    difficulty: 'senior',
    isFree: false,
    tags: ['incomplete data', 'scenario analysis', 'confidence intervals', 'cohort maturity', 'executive communication'],
    category: 'leadership',

    prompt: 'Tell me about a time you had to make a recommendation with incomplete or imperfect data — and how you handled the uncertainty.',

    starGuide: {
      situation: 'What decision needed to be made, and what data was available vs. what was needed for a confident answer? What was the time pressure?',
      task: 'What was the risk of waiting for better data? What was the risk of acting on incomplete data?',
      action: 'How did you structure the analysis under uncertainty? Did you build scenarios? Did you explicitly quantify your confidence level? How did you communicate what you knew vs. what you didn\'t know?',
      result: 'What decision was made? How did it play out? What did this demonstrate about how to handle ambiguity?',
    },

    strongAnswerMarkers: [
      'Builds a range estimate (low/mid/high) rather than a false-precision point estimate',
      'Explicitly labels the confidence level and what would move the estimate toward each scenario',
      'Identifies leading indicators that would signal which scenario was materializing',
      'Frames the recommendation as provisional with a named update trigger',
      'The decision-maker is able to act with calibrated uncertainty rather than paralysis',
    ],

    modelAnswer: {
      situation: 'We had launched a new premium tier feature in month 1 of the quarter. At week 3, the VP of Finance needed a revenue impact estimate to feed into a mid-year board update. The problem: subscription cohort maturity — the revenue signal we trusted most — required at least 8 weeks of data to be reliable. We had 3 weeks. The early activation rate looked good, but the critical variable was week-6 to week-8 upgrade-to-paid conversion, which we simply hadn\'t observed yet.',
      task: 'I had to give the VP something useful without overstating my confidence. A false-precision point estimate that turned out to be wrong would be worse than an honest range — especially in a board context.',
      action: 'I built three scenarios based on the week-3 leading indicators I did have: low case (week-3 activation rate extrapolated using the retention decay curve from our last two feature launches, with no conversion rate improvement), mid case (week-3 activation sustained at current rate, conversion rate in line with our historical average for comparable premium features), and high case (activation rate maintained, conversion rate at the top quartile of our comparable launches). Each scenario had a revenue figure, a probability weight I assigned based on current data, and — most importantly — a list of the 2-3 early indicators I\'d watch over the next 3 weeks that would tell me whether we were tracking to mid or low case. I presented it as: "Based on 3-week early cohort data, my mid-case estimate is $X, but I\'m calling this provisional until week 8. Here are the three things I\'ll be watching — if [indicator A] shows the pattern from the high case by week 5, I\'ll revise upward. If [indicator B] declines, I\'ll revise to the low case." I included a simple one-page chart with the three lines and the current tracking dot.',
      result: 'The VP went to the board with the mid-case estimate clearly labeled as "week-3 provisional, 8-week confirmation coming." The board appreciated the transparency — the CFO specifically commented that the scenario framing was more useful than a single number. By week 8, the actual result came in at 94% of the mid-case estimate. The provisional-with-indicators approach became the standard template for early-stage revenue estimates across the team.',
    },

    keyPrinciples: [
      '"Incomplete data" is the normal state. The job is to be precise about what you know and don\'t know — not to wait for perfect data that rarely arrives.',
      'Scenario ranges with explicit confidence levels and named update triggers are more useful than point estimates. They give the decision-maker something to act on and something to watch.',
      'Communicate uncertainty as structure, not as hedging. "I don\'t know" is unhelpful; "here\'s my estimate, here\'s my confidence level, and here\'s what would change it" is useful.',
    ],

    antiPatterns: [
      'Refusing to provide an estimate until the data is mature — the decision often can\'t wait, and "I don\'t have enough data" with no alternative is not an answer.',
      'Providing a single point estimate without confidence bounds — in an early-stage analysis, false precision is more damaging than an honest range.',
    ],
  },

  {
    id: 'BEH08',
    title: 'Explaining a Novelty Effect to a CPO with an Analogy',
    subtitle: 'Communication · Technical Concept Translation',
    difficulty: 'analyst',
    isFree: false,
    tags: ['non-technical communication', 'novelty effect', 'experiment design', 'analogy', 'executive communication'],
    category: 'communication',

    prompt: 'Tell me about a time you had to communicate a complex technical concept (like causal inference, experiment design, or a statistical method) to a non-technical audience.',

    starGuide: {
      situation: 'Who was the audience, what was the technical concept, and why did they need to understand it to make a good decision?',
      task: 'What was the risk of them not understanding it — would they make a wrong decision, ship something prematurely, or misinterpret a result?',
      action: 'The answer lives here: how did you translate the concept? Did you use an analogy? A visual? Did you test whether they understood before moving on? What did you choose NOT to explain (equally important)?',
      result: 'Did they understand? What decision did they make? Was it the right one? What did this interaction change about how you communicate technical ideas?',
    },

    strongAnswerMarkers: [
      'Uses a concrete analogy grounded in everyday experience, not a domain-specific metaphor',
      'Pairs the analogy with a visual (chart, diagram) for reinforcement',
      'Does not hide the uncertainty — frames it as "here\'s what we\'d need to be confident"',
      'The non-technical person makes a better decision as a result of understanding the concept',
      'Does not over-explain — removes technical jargon rather than defining it',
    ],

    modelAnswer: {
      situation: 'We had shipped a feed personalization feature and the 7-day experiment results showed a +5% lift in daily engagement. The CPO was excited and ready to declare success and move to full rollout. I was concerned about a novelty effect — users often interact more with a new UI element in the first week simply because it\'s new, but that engagement boost decays back to baseline as the novelty wears off. The CPO had a strong engineering background but was not deep on experiment methodology, and the term "novelty effect" wasn\'t landing.',
      task: 'If we shipped based on the 7-day lift without checking for decay, we risked a scenario where we\'d announced a 5% engagement improvement that disappeared three weeks after the rollout — which would be confusing and damaging to the team\'s credibility on experimentation. I needed the CPO to agree to a 30-day measurement window before announcing the result.',
      action: 'I tried explaining the novelty effect technically first — "the treatment effect may be partially driven by exposure novelty that decays over time" — and watched the CPO\'s eyes glaze. I stopped and started over with an analogy: "Think about the last time you rearranged your living room furniture. For the first week, you notice the room constantly — you\'re more aware of it, you might sit in different spots, you engage with the space differently. That heightened attention decays after a week or two, and you\'re back to your normal patterns. We\'re seeing the same pattern in feed interactions. Users in the first week are engaged partly because the feed is new — it\'s the furniture rearrangement effect. What we need to see is whether the engagement is still up at week 4, after the novelty has worn off." I then showed a single chart: week-by-week engagement for the same users, with a dotted line at week 1 and week 4, and pointed to two previous experiments where a similar 7-day lift had decayed to near-zero by week 4. I kept it to two exhibits and one analogy.',
      result: 'The CPO said immediately: "Oh — we\'re measuring the excitement of trying new furniture, not whether they actually like the new layout better." He agreed to extend the measurement window to 30 days before the full rollout announcement. The 30-day result showed the lift had compressed from +5% to +2.1% — still positive and worth shipping, but not the headline number we would have announced prematurely. The CPO later used the furniture analogy himself in a product review to explain why a different team\'s 7-day experiment wasn\'t sufficient to call a win.',
    },

    keyPrinciples: [
      'Analogies beat technical explanations for non-technical audiences. The goal is for them to build an intuition, not to pass a statistics exam.',
      'Visual plus verbal together beats either alone. The chart anchors the analogy in real data so it\'s not just a story.',
      'Don\'t hide the uncertainty — frame it as "here\'s what we\'d need to be confident." This builds credibility and gives the audience a clear action to take.',
    ],

    antiPatterns: [
      'Defining technical jargon rather than replacing it — saying "novelty effect, which means..." is still harder to internalize than a concrete analogy.',
      'Over-explaining to the point where the audience loses the thread — pick one analogy, one visual, and stop.',
    ],
  },

  // ─────────────────────────────────────────────
  // Q09 — Pushback from a More Senior Person
  // ─────────────────────────────────────────────
  {
    id: 'BEH09',
    title: 'A Senior Director Publicly Dismissed Your Analysis. What Did You Do?',
    subtitle: 'Conflict · Analytical Integrity Under Pressure',
    difficulty: 'senior',
    isFree: false,
    prompt: 'Tell me about a time when someone more senior than you publicly dismissed or challenged your analysis in a meeting. How did you handle it?',
    whatTheyreReallyAsking: 'Can you maintain analytical integrity under social pressure without becoming confrontational or backing down when you were right? How do you disagree up without career self-sabotage?',
    storyFramework: {
      situation: 'A director or VP challenged your finding in a meeting — in front of others, creating social pressure to agree with them.',
      behavior: 'You acknowledged their perspective, asked clarifying questions to understand the source of disagreement, stood your ground on the data points you were confident in, and offered to reconcile the gap privately or with a follow-up analysis.',
      outcome: 'The analysis held up. You either found a nuance that improved your conclusion, or confirmed the original finding — either way, the disagreement led to a better outcome than if you\'d capitulated immediately.',
    },
    strongSignals: [
      'Distinguishes between "they have more context" (valid reason to update) vs. "they have more authority" (not a valid reason to update)',
      'Asks questions to understand the source of disagreement rather than defending or caving immediately',
      'Separates the meeting moment (graceful, non-confrontational) from the resolution (private follow-up with evidence)',
      'Can articulate what they would have done differently with hindsight',
    ],
    weakSignals: [
      'Immediately backed down because of seniority — no interrogation of whether the senior person was actually right',
      'Became confrontational or emotional in the moment',
      'Spent the story describing the senior person\'s unreasonableness rather than their own behavior',
      'Resolution was the senior person being "proved wrong" with no learning or nuance',
    ],
    keyPrinciples: [
      'Data doesn\'t care about seniority. Your job is to get to the right answer, not to win the argument — and those are different goals.',
      'In the moment, your goal is to de-escalate and create space for resolution: "That\'s a really interesting point — can you help me understand what data is informing your view? I want to make sure I\'m not missing something."',
      'After the moment: private follow-up with specific evidence is far more effective than a public debate. Most senior people are more open to being wrong in private than in front of others.',
    ],
    antiPatterns: [
      'Treating seniority as a signal that the senior person is more likely to be analytically correct — experience doesn\'t equal data access',
      'Framing the story as a battle you won rather than a disagreement you resolved constructively',
      'Using vague language like "I pushed back" without describing specifically what you said and how you said it',
    ],
  },

  // ─────────────────────────────────────────────
  // Q10 — Analysis That Changed a Major Decision
  // ─────────────────────────────────────────────
  {
    id: 'BEH10',
    title: 'Tell Me About Analysis That Changed a Major Product or Business Decision.',
    subtitle: 'Data Impact · Analysis-to-Action',
    difficulty: 'analyst',
    isFree: false,
    prompt: 'Describe a time when your analysis directly changed a significant product or business decision. What was the decision, what did you find, and what happened as a result?',
    whatTheyreReallyAsking: 'Do you do analysis that matters, or analysis that people read and move on from? Can you connect your work to outcomes? Do you understand the difference between analysis and impact?',
    storyFramework: {
      situation: 'A decision was pending or had been made — and your analysis introduced information that changed the direction.',
      behavior: 'You identified the right question, ran the analysis with appropriate rigor, communicated the finding in a way the decision-maker could act on, and advocated for the implication without just presenting the data.',
      outcome: 'The decision changed in a specific, measurable way. The outcome of that decision can be described — even if it\'s "we didn\'t ship the feature and avoided a bad outcome."',
    },
    strongSignals: [
      'Can name a specific decision, a specific analysis, and a specific outcome — not a general description of "influencing strategy"',
      'The analysis uncovered something non-obvious, not just confirmed what everyone expected',
      'The candidate advocated for an implication, not just presented data',
      'Understands why the analysis was influential: the right framing, the right audience, the right timing',
    ],
    weakSignals: [
      'Vague: "I did analysis that helped the team make better decisions"',
      'The decision was minor (changing a button color, adjusting a metric threshold)',
      'The analysis just confirmed existing belief — no surprise or contrary finding',
      'The candidate presented the data and "let the team decide" without a recommendation',
    ],
    keyPrinciples: [
      'The difference between analysis and impact is a recommendation. Data says "here is what happened." Impact says "here is what I think we should do and why." Presenting data is not influence — advocating for an implication is.',
      'Influential analysis often sounds like: "The data shows X. The conventional interpretation is Y. But I think the right interpretation is Z, and here\'s why." That deviation from conventional wisdom is what makes analysis memorable.',
      'Timing matters as much as content. The same analysis delivered before a decision is made is 10x more influential than the same analysis delivered after.',
    ],
    antiPatterns: [
      'Confusing data presentation with influence — shipping a dashboard that people use to make decisions is not the same as doing analysis that changed a specific decision',
      'Describing the analysis methodology in detail while being vague about the outcome',
      'Crediting the team or PM for the decision without demonstrating your specific contribution',
    ],
  },

  // ─────────────────────────────────────────────
  // Q11 — Disagreeing With PM or Eng Direction
  // ─────────────────────────────────────────────
  {
    id: 'BEH11',
    title: 'Tell Me About a Time You Disagreed With the Product Roadmap Direction.',
    subtitle: 'Cross-Functional Influence · Product Judgment',
    difficulty: 'senior',
    isFree: false,
    prompt: 'Describe a time when you disagreed with the direction a PM or engineering team was taking. What did you disagree with, how did you raise it, and what happened?',
    whatTheyreReallyAsking: 'Do you have strong product instincts and the courage to advocate for them? Can you influence without authority? Do you know when to accept a decision you disagree with and move forward?',
    storyFramework: {
      situation: 'A PM, engineering lead, or cross-functional team was committed to a direction you believed was analytically or strategically wrong.',
      behavior: 'You didn\'t just raise a concern — you came with a counter-hypothesis and data. You chose the right moment and forum. You made the case once, clearly. And either changed the direction or, if you didn\'t, accepted the decision and committed to executing it.',
      outcome: 'Either the direction changed (and the outcome validates your concern), or it didn\'t change (and you describe what you learned about influence, or what the outcome showed about whether you were right).',
    },
    strongSignals: [
      'Had a specific analytical disagreement with a specific claim — not just a "feeling" the decision was wrong',
      'Came with data and a counter-hypothesis, not just an objection',
      'Chose the right forum (1:1 before the meeting, not a public challenge)',
      'Can describe what happened after — either the outcome validated their concern or they accepted the decision professionally',
    ],
    weakSignals: [
      'Disagreed on vibes or strategic intuition without specific data',
      'Raised the concern publicly in a way that created conflict',
      'Unable to accept that the decision went against them — still relitigating it in the interview',
      'The story is mostly about being right and the other person being wrong, with no nuance',
    ],
    keyPrinciples: [
      'Influence without authority is built on: (1) being right frequently enough that people trust your instincts, (2) raising concerns in private before public forums, (3) presenting a counter-hypothesis with evidence rather than just objecting, (4) knowing when to commit after being heard.',
      '"Disagree and commit" is not capitulation — it means you made your case, you were heard, and you now own the execution of the agreed-upon decision even though you preferred something else. That\'s professionalism.',
      'The quality of your disagreement is measured by whether you moved people or generated data. If you raised a concern, were ignored, and turned out to be right — you failed at influence, not at analysis.',
    ],
    antiPatterns: [
      'Framing the story as "I was right and they were wrong" with no acknowledgment of the other side\'s reasoning',
      'Never accepting the decision — continuing to raise the same objection after the decision was made',
      'Disagreeing on strategic vision or business priorities without any analytical basis',
    ],
  },

  // ─────────────────────────────────────────────
  // Q12 — Handling Ambiguous or Incomplete Data
  // ─────────────────────────────────────────────
  {
    id: 'BEH12',
    title: 'Tell Me About a Time You Had to Make a Decision With Incomplete Data.',
    subtitle: 'Decision-Making · Uncertainty Management',
    difficulty: 'analyst',
    isFree: false,
    prompt: 'Describe a situation where you had to provide a recommendation or make a data-driven decision despite having incomplete, conflicting, or unreliable data. How did you proceed?',
    whatTheyreReallyAsking: 'Can you operate under uncertainty without being paralyzed? Do you know how to bound the uncertainty, make assumptions explicit, and communicate confidence levels? Can you distinguish between "needs more data before deciding" and "enough to act on with stated uncertainty"?',
    storyFramework: {
      situation: 'A decision was pending, the data was incomplete or unreliable, and waiting for perfect data wasn\'t an option.',
      behavior: 'You explicitly bounded what you knew vs. didn\'t know, stated your assumptions, estimated the confidence interval on your conclusion, and recommended action while being clear about the conditions under which you\'d update your recommendation.',
      outcome: 'The recommendation was acted on. Either the incomplete data was good enough (the decision held up) or the stated assumptions were wrong and the recommendation was updated accordingly.',
    },
    strongSignals: [
      'Can distinguish between "not enough data to act" and "enough data to act with stated confidence" — these are different from "not enough data to act without stated confidence"',
      'Made assumptions explicit before making conclusions',
      'Recommended a specific action with a specific confidence level, not "it depends" or "we need more data"',
      'Built in a review trigger: "I\'d revisit this if X changes"',
    ],
    weakSignals: [
      'Always waited for complete data before making any recommendation',
      'Provided a recommendation without flagging the incompleteness or assumptions',
      'Confused "incomplete data" with "bad data" — different problems requiring different responses',
      'The story is about requesting more data, not making a decision under uncertainty',
    ],
    keyPrinciples: [
      'The right response to incomplete data is not a better analysis — it\'s an explicit uncertainty statement. "Based on X data with Y assumption, my best estimate is Z, and I\'d expect this to be wrong if A happens."',
      'Senior analysts are valuable not because they have perfect data but because they can make better decisions with imperfect data than junior analysts can. That skill is the whole job at high seniority.',
      'The cost of waiting for perfect data is always non-zero. Someone with a decision to make will make it with or without your analysis. Your job is to reduce their uncertainty, not to guarantee the right answer.',
    ],
    antiPatterns: [
      'Treating "I recommended we wait for more data" as a good outcome — sometimes it is, but it shouldn\'t be the default response to ambiguous data',
      'Not naming the specific assumptions that made the incomplete data actionable',
      'Confusing confidence in the analysis with confidence in the outcome',
    ],
  },

  // ─────────────────────────────────────────────
  // Q13 — Building a Metric From Scratch
  // ─────────────────────────────────────────────
  {
    id: 'BEH13',
    title: 'Tell Me About a Metric You Built From Scratch That the Team Adopted.',
    subtitle: 'Metric Design · Organizational Influence',
    difficulty: 'senior',
    isFree: false,
    prompt: 'Describe a situation where you designed a new metric that your team or organization started using to make decisions. What was the problem with existing metrics, what did you build, and how did it get adopted?',
    whatTheyreReallyAsking: 'Do you think critically about existing measurement frameworks? Can you design metrics that are precise, actionable, and resistant to gaming? Do you understand the organizational work required to make a new metric stick?',
    storyFramework: {
      situation: 'The existing metric was imprecise, gameable, or measuring the wrong thing — and this was causing misaligned decisions.',
      behavior: 'You diagnosed the problem with the existing metric, designed a replacement with clear criteria (what does moving this metric actually require?), validated it against historical data, and worked to get it adopted through influence rather than authority.',
      outcome: 'The metric was adopted and changed decisions in a specific, describable way. Teams made different choices because of the new measurement framework.',
    },
    strongSignals: [
      'Can articulate precisely what was wrong with the old metric — not just "it wasn\'t good" but "it measured X when the business goal was Y"',
      'The new metric has explicit anti-gaming properties — what behavior does it reward, and is that behavior actually aligned with the goal?',
      'Describes the organizational work of adoption, not just the technical design work',
      'The metric changed at least one real decision',
    ],
    weakSignals: [
      'Built a dashboard rather than a metric — dashboards are collections of numbers, metrics are north-star signals that guide decisions',
      'The metric replaced a bad metric with a different metric that has the same problems',
      'Adoption happened because the candidate had authority, not because the metric was compelling',
      'Cannot describe what behavior the new metric rewards vs. the old one',
    ],
    keyPrinciples: [
      'A good metric rewards the behavior you want to see. The test: if a team optimized solely for this metric, would you be happy with their behavior? If yes, it\'s a good metric.',
      'Getting a metric adopted is a political problem, not a technical one. People are emotionally attached to metrics that make them look good. Changing the metric changes who wins and who loses.',
      'The strongest metric adoption stories involve proving the new metric predicts outcomes the old metric missed. Retroactive validation on historical data, showing the new metric would have flagged problems the old one missed, is the most compelling adoption argument.',
    ],
    antiPatterns: [
      'Designing a metric in a vacuum and being surprised when teams don\'t adopt it',
      'Replacing a simple, understandable metric with a complex formula that nobody can explain to the CEO',
      'Not testing the metric for perverse incentives — does optimizing for it actually require doing the right things?',
    ],
  },

  // ─────────────────────────────────────────────
  // Q14 — Working With Stakeholders Who Want Different Answers
  // ─────────────────────────────────────────────
  {
    id: 'BEH14',
    title: 'Tell Me About a Time Stakeholders Had Conflicting Views on What the Data Said.',
    subtitle: 'Stakeholder Management · Analytical Objectivity',
    difficulty: 'senior',
    isFree: false,
    prompt: 'Describe a situation where two or more stakeholders had different interpretations of the same data, or wanted you to reach a specific conclusion. How did you navigate it?',
    whatTheyreReallyAsking: 'Can you maintain analytical objectivity when different stakeholders are pulling you toward different conclusions? Do you know how to handle a situation where the data doesn\'t support anyone\'s preferred outcome?',
    storyFramework: {
      situation: 'Two stakeholders (e.g., marketing and product, or two PMs, or a PM and an exec) had conflicting interpretations or wanted conflicting recommendations.',
      behavior: 'You acknowledged the different perspectives, identified the specific analytical question that separated them, ran the analysis that could resolve the disagreement objectively, and reported the result to both stakeholders before the broader meeting.',
      outcome: 'The disagreement was resolved with evidence rather than politics. Both stakeholders accepted the result, even the one whose interpretation was wrong.',
    },
    strongSignals: [
      'Identified the specific analytical question that could resolve the disagreement — not all stakeholder conflicts are resolvable with more analysis, but many are',
      'Proactively shared findings with the "losing" stakeholder before the public forum, to give them time to process and respond',
      'Framed the analysis as "here is what the data shows" rather than "here is why Person A is right and Person B is wrong"',
      'Describes what they would do when the data genuinely doesn\'t resolve the disagreement — some questions are strategic, not analytical',
    ],
    weakSignals: [
      'Presented the conflicting data to the group and let them fight it out — analysts are not referees',
      'Sided with the more senior stakeholder regardless of the data',
      'Produced a "balanced" analysis that didn\'t actually resolve anything — both sides were technically right in a way that avoided conflict',
      'Couldn\'t distinguish between analytical disputes (resolvable with data) and strategic disputes (require different resolution)',
    ],
    keyPrinciples: [
      'Analytical disputes have a correct answer and are resolved with better methodology. Strategic disputes are about values and priorities — more data doesn\'t resolve them, and pretending it does erodes your credibility.',
      'The most dangerous stakeholder conflict is when both sides want you to selectively slice the data to support their conclusion. The right response: "I can run both cuts and show you both. But I\'ll also tell you which one I think is the right way to look at the problem, and why."',
      'Your credibility as an analyst depends on being right more often than you\'re politically convenient. Consistently producing the answer the most powerful stakeholder wants will eventually produce an obviously wrong conclusion that destroys trust with everyone.',
    ],
    antiPatterns: [
      'Producing a "balanced" report that presents both sides without a conclusion — that is not analysis, that is a summary of conflicting opinions',
      'Implying you would side with whoever controls your performance review',
      'Treating every stakeholder conflict as an analytical dispute when some are genuinely strategic disagreements that data cannot resolve',
    ],
  },

  // ─────────────────────────────────────────────
  // Q15 — Fixing a Metric That Was Being Gamed
  // ─────────────────────────────────────────────
  {
    id: 'BEH15',
    title: 'Tell Me About a Time You Discovered a Metric Was Being Gamed.',
    subtitle: 'Data Integrity · Analytical Courage',
    difficulty: 'senior',
    isFree: false,
    prompt: 'Describe a situation where you discovered that a team or process was optimizing a metric in a way that didn\'t actually reflect the underlying business goal. What did you do?',
    whatTheyreReallyAsking: 'Do you notice when metrics are being gamed? Do you have the courage to name it when it\'s happening, especially when gaming might be intentional or implicit? Can you redesign metrics to be gaming-resistant?',
    storyFramework: {
      situation: 'A metric showed improvement, but the underlying behavior that improvement was supposed to reflect was not improving — or was getting worse.',
      behavior: 'You identified the specific gaming behavior, quantified the gap between the metric and the actual business outcome, named it clearly to the relevant stakeholders, and recommended a metric redesign or guardrail.',
      outcome: 'The metric was redesigned, a guardrail was added, or the team\'s behavior changed. The business outcome improved as a result of measuring the right thing.',
    },
    strongSignals: [
      'Identified the gaming behavior without being accusatory — framed it as a measurement problem, not a character problem',
      'Can articulate precisely why the metric could be improved without improving the underlying outcome',
      'Proposed a specific redesign that makes the same gaming behavior less rewarding',
      'Raised it to the right people in the right way — not publicly shaming the team, but not ignoring it either',
    ],
    weakSignals: [
      'Noticed the gaming but didn\'t raise it because it was uncomfortable',
      'Raised it accusatorially, creating defensiveness rather than problem-solving',
      'The "fix" was just a different metric with the same gaming potential',
      'Confused optimization (doing the right thing better) with gaming (doing a different thing that improves the number)',
    ],
    keyPrinciples: [
      'Metric gaming is almost never malicious. People optimize for what they\'re measured on. If the metric is gameable, it will be gamed. The problem is the metric, not the person.',
      'Goodhart\'s Law: when a measure becomes a target, it ceases to be a good measure. Every metric is gameable at some optimization pressure. The question is whether gaming the metric requires doing something genuinely good or something that only looks good on paper.',
      'The best response to gaming is a metric redesign that makes gaming require actually doing the right thing — not a louder instruction not to game, not a punishment, not a guardrail. Change what the metric rewards.',
    ],
    antiPatterns: [
      'Framing gaming as a personal integrity failure rather than a measurement design failure',
      'Adding a secondary guardrail metric without addressing the root cause (the gameable primary metric)',
      'Noticing gaming only after it caused a significant negative business outcome rather than proactively',
    ],
  },

  // ─────────────────────────────────────────────
  // Q16 — Handling a Failed Project or Experiment
  // ─────────────────────────────────────────────
  {
    id: 'BEH16',
    title: 'Tell Me About an Experiment or Project That Failed. What Did You Learn?',
    subtitle: 'Learning · Intellectual Honesty',
    difficulty: 'analyst',
    isFree: false,
    prompt: 'Describe an analysis, experiment, or project that did not produce the expected results or had to be discontinued. What happened, and what did you take away from it?',
    whatTheyreReallyAsking: 'Can you be honest about failure? Do you take genuine lessons or do you perform learning? Do you distinguish between execution failures (you did something wrong) and hypothesis failures (you were wrong about how the world works)?',
    storyFramework: {
      situation: 'A project was abandoned, an experiment showed no effect or a negative effect, or an analysis conclusion turned out to be wrong.',
      behavior: 'You acknowledged the failure without deflection, diagnosed the root cause (execution issue vs. wrong hypothesis), extracted a specific lesson, and applied that lesson to something later.',
      outcome: 'The failure led to a specific change in how you approach similar problems — not just "I learned to be more careful" but a concrete behavior change.',
    },
    strongSignals: [
      'The failure is real and meaningful — not a minor setback dressed up as a failure for the purpose of the question',
      'Distinguishes between "I executed poorly" and "my model of the world was wrong" — both are failures but have different lessons',
      'Can articulate the specific lesson and a specific subsequent situation where it was applied',
      'Doesn\'t blame external factors for what was within their control',
    ],
    weakSignals: [
      'The "failure" is a success with minor imperfections — not a genuine failure',
      'Attributes the failure entirely to external factors (data quality, team dynamics, time pressure)',
      'The lesson is vague: "I learned to communicate better" without any specific behavior change',
      'Visibly uncomfortable or defensive when describing the failure',
    ],
    keyPrinciples: [
      'The most informative failures are hypothesis failures — where you were systematically wrong about how something works, not just careless in execution. These are rare and deeply instructive.',
      'A good answer to this question distinguishes between two types of wrong: wrong about the facts (you analyzed bad data) and wrong about the model (your mental model of user behavior was incorrect). Wrong about the model is more valuable to discuss.',
      'The lesson should sound like: "I now approach X differently because of this, specifically by doing Y instead of Z." If the lesson can\'t be stated that concretely, the learning wasn\'t real.',
    ],
    antiPatterns: [
      'Describing a "failure" that is really a success story framed negatively to seem more relatable',
      'Accepting no personal responsibility — the team, the data, the timeline were all to blame, not any decision you made',
      'Performing humility ("I realized I have a lot to learn") without a specific lesson',
    ],
  },

  // ─────────────────────────────────────────────
  // Q17 — Scaling Your Impact Beyond Your Team
  // ─────────────────────────────────────────────
  {
    id: 'BEH17',
    title: 'Tell Me About a Time You Made an Impact Beyond Your Direct Team.',
    subtitle: 'Leadership · Organizational Influence',
    difficulty: 'senior',
    isFree: false,
    prompt: 'Describe a contribution you made that benefited people or teams beyond your immediate team. What did you build, how did it spread, and what impact did it have?',
    whatTheyreReallyAsking: 'Can you see and solve problems beyond your immediate scope? Do you build things that scale? Do you understand the difference between being busy and being leveraged?',
    storyFramework: {
      situation: 'A problem existed that wasn\'t your job to fix, but you saw it and built something to address it.',
      behavior: 'You identified a reusable pattern or infrastructure gap, built something that other teams could adopt without you being present, and drove adoption through showing usefulness rather than mandate.',
      outcome: 'Other teams adopted what you built. Specifically: N teams use it, M decisions per quarter are informed by it, or a specific class of problem was eliminated.',
    },
    strongSignals: [
      'The contribution required going beyond the stated scope of their role',
      'Built something reusable and self-serve, not a one-off analysis that required their involvement every time',
      'Can quantify the spread: how many teams, what decision types, what cadence',
      'The adoption was pull-driven (others sought it out) not push-driven (mandated by leadership)',
    ],
    weakSignals: [
      'The contribution was a one-off analysis, not a reusable framework, tool, or process',
      'Describes "helping other teams" in a vague way without specific artifacts or outcomes',
      'The adoption was mandated by a manager, not organic',
      'The story is really about their own team\'s success, with a passing mention of cross-team collaboration',
    ],
    keyPrinciples: [
      'The highest leverage contributions are ones that scale without your ongoing involvement. A metric framework that 5 teams use is worth more than a brilliant one-off analysis that you had to do yourself 5 times.',
      'Adoption is the unit of impact for cross-team work. A tool nobody uses failed, regardless of how good it was. Getting adoption requires solving a real problem, making the tool easy to use, and being visible enough that the right people know it exists.',
      'Lateral influence (making something so good that people adopt it voluntarily) is the highest form of organizational influence for an individual contributor. It doesn\'t require authority and it builds your reputation in a way that authority-based contributions don\'t.',
    ],
    antiPatterns: [
      'Describing a contribution that required your ongoing manual involvement rather than a scalable artifact',
      'Confusing "presenting to multiple teams" with "creating something multiple teams adopted"',
      'Being vague about what specifically was built and how specifically it was used',
    ],
  },

  // ─────────────────────────────────────────────
  // Q18 — Balancing Speed and Rigor
  // ─────────────────────────────────────────────
  {
    id: 'BEH18',
    title: 'How Do You Decide When Analysis Is "Good Enough" to Act On?',
    subtitle: 'Judgment · Speed vs. Rigor Tradeoff',
    difficulty: 'analyst',
    isFree: false,
    prompt: 'Tell me about a time when you had to decide whether to deliver analysis quickly with known limitations, or wait and do a more rigorous analysis. How did you decide, and what happened?',
    whatTheyreReallyAsking: 'Do you have good judgment about when rigor is required vs. when speed is the right tradeoff? Can you explicitly reason about the cost of delay vs. the cost of a wrong recommendation?',
    storyFramework: {
      situation: 'A decision needed to be made on a timeline that was shorter than the time needed for a rigorous analysis.',
      behavior: 'You assessed the cost of the decision (reversible vs. irreversible), the precision required for the recommended action, and the cost of delay — then either delivered a scoped analysis with stated limitations, or pushed back on the timeline with a specific risk argument.',
      outcome: 'The decision was made with appropriate rigor for the stakes. Either the quick analysis was good enough, or the timeline was extended because the risk of acting on insufficient data was quantified and accepted by the decision-maker.',
    },
    strongSignals: [
      'Has a clear framework for when to do quick-and-dirty vs. rigorous analysis (stake size, reversibility, precision required)',
      'Can articulate the specific limitations of the quick analysis and what conditions would change the recommendation',
      'Has pushed back on timelines when the stakes justified it — doesn\'t always default to "delivering on time"',
      'Separates analytical rigor from statistical rigor — sometimes quick analysis is directionally correct without being statistically precise',
    ],
    weakSignals: [
      'Always defaults to quick analysis regardless of stakes — "shipping fast" without differentiation',
      'Always defaults to rigorous analysis regardless of timeline — perfectionism without judgment',
      'Cannot articulate what "good enough" means for a specific decision',
      'The story is about technical choices in the analysis rather than the judgment about when to stop',
    ],
    keyPrinciples: [
      'The right amount of rigor is determined by the cost of being wrong, not by how much time is available. A decision that can be easily reversed warrants less rigor than one that cannot.',
      'Stated limitations are more valuable than unstated ones. "This analysis has 80% confidence and would change if X" is more actionable than a precise-sounding analysis that has hidden assumptions.',
      'The cost of delay is real. Waiting for perfect analysis on a decision that needed to be made 2 weeks ago is a failure of judgment, not a victory of rigor.',
    ],
    antiPatterns: [
      'Using "the data wasn\'t perfect" as a reason to not deliver rather than a reason to caveat your delivery',
      'Conflating "I was thorough" with "I was appropriately rigorous" — thoroughness is not a virtue when the decision doesn\'t require it',
      'Being unable to say "this analysis is good enough to act on" — indecision is a decision, and usually the wrong one',
    ],
  },

  // ─────────────────────────────────────────────
  // Q19 — Navigating Ethical Tension in Data Work
  // ─────────────────────────────────────────────
  {
    id: 'BEH19',
    title: 'Have You Ever Been Asked to Do Analysis That Made You Uncomfortable? What Did You Do?',
    subtitle: 'Ethics · Analytical Integrity',
    difficulty: 'senior',
    isFree: false,
    prompt: 'Describe a situation where you were asked to do analysis or present data in a way that raised ethical concerns or felt analytically dishonest. How did you handle it?',
    whatTheyreReallyAsking: 'Do you have ethical grounding in your analytical work? Do you know the difference between selective analysis (sometimes appropriate) and misleading analysis (never appropriate)? Can you navigate ethical tension without being self-righteous?',
    storyFramework: {
      situation: 'You were asked to present data in a way that omitted relevant context, cherry-picked favorable results, or drew conclusions the data didn\'t support.',
      behavior: 'You named the concern specifically (not generically), proposed an alternative framing that achieved the business goal honestly, and either got agreement on the honest framing or escalated to someone who could resolve the disagreement.',
      outcome: 'The analysis was presented in a way you were comfortable with. Either you persuaded the requester to accept an honest framing, or you escalated and got the right outcome, or — in the most difficult cases — you declined to do the work in the requested form.',
    },
    strongSignals: [
      'Can distinguish between legitimate data selection (choosing the most relevant cut for the audience) and misleading framing (hiding information that would change the conclusion)',
      'Named the concern directly: "If we only present this cut, we\'re implying X, which the data doesn\'t actually support"',
      'Proposed an alternative rather than just objecting: "Can we present both cuts and explain why we\'re highlighting this one?"',
      'Knows where the line is between "making data accessible to non-technical audiences" and "misrepresenting what the data shows"',
    ],
    weakSignals: [
      'No situation comes to mind — at most companies, data is regularly used to support predetermined conclusions',
      'Describes a very minor concern (choosing between two valid visualizations) rather than a real ethical tension',
      'Either always complied without objection or always escalated to HR immediately — neither extreme reflects real-world analytical judgment',
      'Cannot articulate where the line is between simplification and misrepresentation',
    ],
    keyPrinciples: [
      'Simplification is not misrepresentation. You can legitimately present one cut of the data to a non-technical audience without showing all possible cuts — provided the omitted cuts don\'t change the conclusion.',
      'Framing can mislead without lying. "Active users grew 15%" with a carefully chosen definition of "active" that inflates the number is analytically dishonest even if the math is correct.',
      'The test for ethical data presentation: if the decision-maker knew everything you know, would they make the same decision? If the answer is no, the presentation is misleading — regardless of whether it is technically accurate.',
    ],
    antiPatterns: [
      'Treating all selective presentation as unethical — sometimes the audience genuinely doesn\'t need every cut and simplification is appropriate',
      'Treating all ethical concerns as equally severe — there is a spectrum from "questionable framing" to "material misrepresentation" and they require different responses',
      'Being unable to describe a specific situation, using vague language about "maintaining data integrity" without examples',
    ],
  },

  // ─────────────────────────────────────────────
  // Q20 — Most Important Analysis You Did Without Being Asked
  // ─────────────────────────────────────────────
  {
    id: 'BEH20',
    title: 'What Is the Most Important Analysis You Initiated Without Being Asked?',
    subtitle: 'Initiative · Proactive Insight',
    difficulty: 'senior',
    isFree: false,
    prompt: 'Describe the most important or impactful analysis you did on your own initiative — not because someone asked you to do it, but because you saw a question that needed answering. What did you find, and what happened?',
    whatTheyreReallyAsking: 'Do you have a curious, proactive analytical mind? Can you identify important questions that nobody is asking yet? Do you understand what the business most needs to know, even when nobody has articulated it?',
    storyFramework: {
      situation: 'You noticed something — a pattern in data, a decision that seemed to be made without good information, a metric moving in a way nobody was discussing.',
      behavior: 'You scoped the analysis yourself, ran it without waiting for a ticket or request, shared it with the relevant stakeholders in a way that created action (not just interest), and followed it to a decision or change.',
      outcome: 'Something changed because of this analysis. A decision was made differently, a risk was avoided, a new opportunity was identified. Not just "people were interested" but a concrete outcome.',
    },
    strongSignals: [
      'The question was non-obvious — most people weren\'t asking it, which is why it needed to be self-initiated',
      'The analysis required judgment about scope and method, not just execution of a well-defined task',
      'Led to a concrete change, not just appreciation from stakeholders',
      'Can explain why this question was important to the business, not just interesting analytically',
    ],
    weakSignals: [
      'The analysis was obvious and someone else would have gotten to it anyway',
      'The analysis was interesting but didn\'t lead to any decision or change',
      'The "initiative" was really responding to a loosely worded request — not genuinely self-initiated',
      'Cannot explain why the question was important to the business',
    ],
    keyPrinciples: [
      'The most valuable proactive analyses often start with a nagging feeling that a commonly accepted conclusion is wrong, or that an important question is being ignored. That instinct — knowing which questions are important before anyone asks them — is the senior data scientist skill that is hardest to teach.',
      'Proactive analysis succeeds or fails on follow-through. Many analysts do the analysis and present findings. Few analysts track the analysis through to a decision and don\'t let it get lost in inbox noise. The follow-through is half the value.',
      'The framing for sharing proactive analysis matters: "I noticed X and ran some numbers — I think this might affect Y. Here\'s what I found and here\'s what I think we should do about it." That structure creates a pull for action, not just a push of information.',
    ],
    antiPatterns: [
      'Describing proactive analysis that never got to a decision — a finding that generated appreciation but no action is a half-success at best',
      'Taking credit for analysis that was actually prompted by a manager or stakeholder comment',
      'The analysis being technically interesting but strategically irrelevant — analytical initiative that doesn\'t connect to business priorities isn\'t the right kind of initiative',
    ],
  },

  // ─────────────────────────────────────────────
  // BEH21 — Disagree and Commit
  // ─────────────────────────────────────────────
  {
    id: 'BEH21',
    title: 'You Disagreed With the Decision but Had to Execute It Anyway.',
    subtitle: 'Followership · Disagree and Commit',
    difficulty: 'analyst',
    isFree: false,
    prompt: 'Tell me about a time you disagreed with a decision but had to execute it anyway. How did you handle it?',
    whatTheyreReallyAsking: 'Can you separate your personal opinion from your professional obligation to execute? Interviewers want to know if you have the maturity to advocate clearly once, accept a decision gracefully, and then execute it without passive resistance or visible resentment. They are also testing whether you can distinguish "I disagreed but I was wrong" from "I disagreed and I was right" — both outcomes teach different things.',
    storyFramework: {
      situation: 'A decision was made — by your manager, leadership, or cross-functional consensus — that you believed was analytically wrong, strategically misguided, or simply not the approach you would have chosen. The decision was final and you were expected to execute.',
      behavior: 'You raised your concern once, clearly and with specificity, through the right channel (not in a passive-aggressive comment in a group Slack). You made sure you were heard. Then, once the decision stood, you executed it fully — not reluctantly, not while continuing to relitigate it, not while signaling your disagreement to teammates.',
      outcome: 'The outcome either validated the decision (and you describe what you learned from being wrong), or confirmed your concern (and you describe how you used that as an input for future influence attempts — not as an "I told you so"). Either way, the relationship and team functioning remained intact.',
    },
    strongSignals: [
      'Made the concern specific and analytical — not just "I had a bad feeling" but "here is the data point I thought was being underweighted"',
      'Raised the concern through the right channel and at the right time — not in a public meeting as a gotcha, not by going around the decision-maker',
      'Executed fully after the decision was made — no hedging, no passive resistance, no subtle signaling of disagreement to teammates',
      'Can objectively assess the outcome — was the decision right or wrong in hindsight, and what does each scenario mean?',
      'The story demonstrates the distinction between having a view and having a veto — these are different things',
    ],
    weakSignals: [
      'Still clearly not over the decision — the story is an extended argument for why they were right and the decision-maker was wrong',
      'Describes executing while "making sure everyone knew I disagreed" — this is passive resistance, not disagree-and-commit',
      'Never accepted the decision as legitimate — treated disagreement as permanent rather than resolved',
      'The disagreement was trivial (style preference, minor implementation detail) — not a meaningful test of this competency',
    ],
    keyPrinciples: [
      '"Disagree and commit" is not about suppressing your view. It means: advocate clearly once, through the right channel, with the best argument you have. If the decision doesn\'t go your way, you own the execution as fully as if it were your own decision.',
      'The moment you start executing reluctantly — visibly dragging your feet, building an alibi for when it goes wrong, or signaling your disagreement to your teammates — you are no longer doing your job.',
      'The value of this competency is highest precisely when the decision later turns out to be wrong. If you were right, what you do next matters: do you use it to improve your influence model, or to prove a point? Only one of those makes you more effective.',
    ],
    antiPatterns: [
      'Framing the story as "I was right and they were wrong" rather than "here is how I handled disagreement professionally" — the interviewer wants the process, not the verdict',
      'Describing "disagree and commit" as something you did after only minimal advocacy — if you had a real concern and said nothing, that is not disagree and commit, that is compliance without voice',
      'Using the story to surface a grievance about a former employer rather than to demonstrate a professional skill',
    ],
  },

  // ─────────────────────────────────────────────
  // BEH22 — Delivering Bad News
  // ─────────────────────────────────────────────
  {
    id: 'BEH22',
    title: 'You Had to Deliver Genuinely Bad News to a Stakeholder or Leadership.',
    subtitle: 'Communication · Courage',
    difficulty: 'analyst',
    isFree: false,
    prompt: 'Tell me about a time you had to deliver bad news to a stakeholder or leadership. How did you prepare and how did you handle it?',
    whatTheyreReallyAsking: 'Do you have the courage to surface bad news proactively, or do you wait for others to discover problems and then react? Interviewers want to see whether you treat early bad-news delivery as a professional responsibility rather than a personal risk. They also want to see how you structure the message — are you coming with just the problem, or with a diagnosis and a path forward?',
    storyFramework: {
      situation: 'You had information — a metric miss, a failed experiment, a significant project setback, a data quality issue — that a stakeholder or leadership needed to know, but that was uncomfortable to surface. Critically: you surfaced it before you were asked, before it became obvious, before the scheduled review.',
      behavior: 'You prepared the message in a structured way: here is what happened, here is what we know about why, here is what I recommend we do next. You chose the right channel and forum — private before public, direct before indirect. You were clear about what was known vs. uncertain.',
      outcome: 'The stakeholder or leadership received the news in a way that gave them time to respond. Your proactive delivery built trust rather than eroded it. A specific outcome resulted from the early signal — a plan was changed, a risk was mitigated, a process was improved.',
    },
    strongSignals: [
      'Surfaced the problem significantly ahead of the scheduled review or before anyone else noticed — proactive, not reactive',
      'Came with a structured message: the what, the why (with confidence level), and the so what (recommendation)',
      'Chose the right forum: delivered privately to the decision-maker before any public forum',
      'Describes the trust-building effect of early bad-news delivery, not just the short-term discomfort',
      'Can distinguish between "the news was bad" and "I handled the delivery badly" — these are separate evaluations',
    ],
    weakSignals: [
      'Waited for the scheduled review and then reported the bad news as if this were proactive',
      'Delivered the bad news without any analysis of why or any recommendation for next steps — just dumped the problem',
      'Framed the story around how uncomfortable it was rather than around how they handled it effectively',
      'The bad news was trivial or easily reversible — not a meaningful test of communication courage',
    ],
    keyPrinciples: [
      'The cost of a surprise is higher than the cost of bad news. Leaders who are blindsided in a QBR remember it. Leaders who received a proactive heads-up remember that differently.',
      'Structure the message in three parts: (1) here is what the data shows, (2) here is what we understand about why, (3) here is what I recommend. Bad news plus a plan is a problem to solve. Bad news alone is just bad news.',
      'Delivering bad news early is not an act of transparency — it is a professional responsibility. The moment you know something decision-relevant, the decision-maker has a right to know it.',
    ],
    antiPatterns: [
      'Treating the scheduled review as the appropriate venue for bad news that was visible for weeks — this reads as either oblivious or politically motivated',
      'Softening the message so aggressively that the severity is obscured — "we\'re tracking slightly below plan" when you\'re 25% below target is not honest communication',
      'Delivering the bad news without a recommendation, forcing the decision-maker to do all the problem-solving with no analytical input',
    ],
  },

  // ─────────────────────────────────────────────
  // BEH23 — Recommendation from Incomplete Data
  // ─────────────────────────────────────────────
  {
    id: 'BEH23',
    title: 'You Had to Make a Recommendation with Very Incomplete Data.',
    subtitle: 'Ambiguity · Decision-Making Under Uncertainty',
    difficulty: 'senior',
    isFree: false,
    prompt: 'Describe a time you were working with very incomplete data and still had to make a recommendation. How did you proceed?',
    whatTheyreReallyAsking: 'Can you operate productively under genuine uncertainty — not just incomplete data in a controlled sense, but situations where critical information is simply unavailable? Interviewers want to see whether you can bound the uncertainty, make assumptions explicit, and produce a recommendation with clearly stated conditions rather than retreating to "we need more data."',
    storyFramework: {
      situation: 'A decision had a hard deadline, and the data required to be fully confident was not available — and would not become available in time. This was not a case of waiting for a query to run; the data genuinely did not exist, was unreliable, or was too early to be mature.',
      behavior: 'You identified what you knew vs. what you didn\'t know. You made your assumptions explicit. You built a bounded estimate — a range with stated confidence — rather than a false-precision point number. You named the specific conditions under which the recommendation would change, and you identified the leading indicators you would watch.',
      outcome: 'The decision-maker had something actionable: a recommendation with stated uncertainty and a named update trigger. The decision was made. Either the stated assumptions held and the recommendation was validated, or a new signal arrived and you updated as committed.',
    },
    strongSignals: [
      'Named the specific data that was missing and why it couldn\'t be obtained in time — not a generic "the data wasn\'t perfect"',
      'Built a range estimate with scenarios rather than a single number — shows calibration rather than false confidence',
      'Made assumptions explicit before making conclusions, and named the condition under which each assumption would break',
      'Provided a specific update trigger: "I\'ll revise this if X shows Y by Z date"',
      'Pushed back successfully on the expectation of precision when precision was analytically unjustifiable',
    ],
    weakSignals: [
      'Defaulted to "we need more data" without offering any bounded estimate or provisional recommendation',
      'Provided a recommendation with no confidence bounds or assumption statements — looks decisive but analytically irresponsible',
      'The "incomplete data" was a minor data gap, not a situation of genuine uncertainty',
      'Cannot articulate what made the available data sufficient to act on despite being incomplete',
    ],
    keyPrinciples: [
      'The right response to incomplete data is not to refuse to answer. It is to be explicit about what you know, what you\'re assuming, and how confident you are. "Based on the three data points I have, with the assumption that X holds, my best estimate is Y with ±Z uncertainty" is an answer. "I don\'t have enough data" is not.',
      'Senior analysts earn their keep precisely in high-uncertainty situations. The ability to make better-than-random decisions with imperfect data is the core skill that differentiates senior from junior.',
      'Named uncertainty is more useful than hidden uncertainty. A stakeholder who knows your confidence level can decide how much to rely on the recommendation. A stakeholder given false precision will over-rely on it.',
    ],
    antiPatterns: [
      'Framing "I asked for more time to gather data" as the correct resolution — sometimes it is, but in this question the assumption is that the decision couldn\'t wait',
      'Providing a vague probabilistic statement ("probably around X") without the specific reasoning that justifies the estimate',
      'Confusing "I felt uncertain" with "I communicated my uncertainty structure to the decision-maker" — the first is a feeling, the second is a skill',
    ],
  },

  // ─────────────────────────────────────────────
  // BEH24 — Reversing a Prior Recommendation
  // ─────────────────────────────────────────────
  {
    id: 'BEH24',
    title: 'You Had to Reverse a Recommendation You Had Already Made.',
    subtitle: 'Intellectual Honesty · Course Correction',
    difficulty: 'senior',
    isFree: false,
    prompt: 'Tell me about a time you had to reverse a recommendation you had already made. What happened, and how did you handle it?',
    whatTheyreReallyAsking: 'Do you have the intellectual honesty to update your position when new evidence contradicts it? This question tests whether you treat being wrong as a failure to hide or a data point to act on. Interviewers also want to see how you handle the social cost of reversal — do you own it cleanly or deflect onto external factors?',
    storyFramework: {
      situation: 'You had made a recommendation — publicly, to a stakeholder, in a document, or in a meeting — and subsequently received information that materially changed your analysis. The recommendation was already in motion or had already influenced a decision.',
      behavior: 'You went back to the stakeholder proactively — before the error became visible or the decision went wrong. You owned the reversal cleanly: "I recommended X based on Y assumption. New data shows Y was wrong, so I\'m revising my recommendation to Z." You didn\'t bury the reversal or minimize it. You explained what changed and why the original recommendation was reasonable given the information available at the time.',
      outcome: 'The stakeholder received a corrected recommendation with time to act on it. The reversal built trust rather than eroded it — precisely because of how you handled it. A specific decision was adjusted as a result.',
    },
    strongSignals: [
      'Went back proactively — didn\'t wait for the error to become visible or for someone else to flag it',
      'Owned the reversal cleanly without deflecting onto the quality of the original data, the timeline pressure, or anyone else',
      'Explained what changed in the underlying facts — the reversal is grounded in new information, not a change of opinion',
      'Framed the original recommendation as reasonable given what was known at the time, not as an unforgivable error',
      'The relationship with the stakeholder was intact or stronger after the reversal because of how it was handled',
    ],
    weakSignals: [
      'The reversal came only after someone else caught the error — not self-initiated',
      'Extensive deflection: the data was bad, the timeline was too short, the stakeholder gave wrong requirements',
      'The original recommendation was trivial — not a meaningful test of intellectual honesty',
      'Frames the reversal as primarily a negative event rather than a demonstration of updating on evidence',
    ],
    keyPrinciples: [
      'Being wrong is expected. Staying wrong after the evidence changes is the failure. Interviewers know you will sometimes make incorrect recommendations — they want to know that you will correct them promptly and cleanly when you do.',
      'The fastest way to destroy credibility is to defend a recommendation past the point where the evidence supports it. The fastest way to build credibility is to go back to a stakeholder and say "I was wrong about X because Y has changed, and here is my updated view."',
      'The original recommendation was not a mistake if it was reasonable given the available information at the time. A recommendation is only a mistake if it ignored available evidence. These are analytically different, and your framing should reflect that.',
    ],
    antiPatterns: [
      'Minimizing the reversal: "it was a small tweak, not really a reversal" — if the direction of the recommendation changed, own it as a reversal',
      'Framing the reversal as proof of agility rather than as an act of intellectual honesty — the two are different things',
      'Describing the reversal but not describing how you communicated it — the communication of the reversal is the behavior being evaluated',
    ],
  },

  // ─────────────────────────────────────────────
  // BEH25 — Two Stakeholders With Opposing Asks
  // ─────────────────────────────────────────────
  {
    id: 'BEH25',
    title: 'Two Stakeholders Had Directly Opposing Asks. How Did You Navigate It?',
    subtitle: 'Stakeholder Management · Conflict Resolution',
    difficulty: 'senior',
    isFree: false,
    prompt: 'Tell me about a time two stakeholders had directly opposing asks. How did you navigate it?',
    whatTheyreReallyAsking: 'Can you navigate stakeholder conflict without becoming a political football between two competing interests? Interviewers want to see whether you can identify the source of the conflict (analytical, strategic, or personal), run the analysis that resolves what is resolvable, and escalate cleanly what is not. They also want to know whether you default to siding with whoever has more power, which is the most common failure mode.',
    storyFramework: {
      situation: 'Two stakeholders — with real authority or real stakes in the outcome — wanted directly contradictory things from you or your analysis. This was not a soft preference difference; acting on one ask would directly conflict with the other.',
      behavior: 'You identified the nature of the conflict: was it analytical (one interpretation of the data was right and the other was wrong), strategic (a genuine values or priority trade-off), or relational (a power struggle with the analysis as the proxy)? For analytical conflicts, you ran the analysis and reported the result to both stakeholders before the public forum. For strategic conflicts, you named the trade-off explicitly and escalated the choice to the right decision-maker.',
      outcome: 'The conflict was resolved or escalated cleanly. You did not produce a "balanced" analysis that resolved nothing. Both stakeholders understood what decision was made and why, even if one was disappointed.',
    },
    strongSignals: [
      'Identified the type of conflict before attempting to resolve it — analytical, strategic, or political conflicts require fundamentally different responses',
      'For analytical conflicts: ran the analysis, reported to both stakeholders privately before the public forum, let the evidence resolve the dispute',
      'For strategic conflicts: named the trade-off explicitly and escalated the decision rather than pretending analysis could resolve a values question',
      'Did not default to the more senior stakeholder\'s position without analytical justification',
      'Both stakeholders came out of the process with a clear understanding of how the decision was made',
    ],
    weakSignals: [
      'Produced a "balanced" report that presented both views without a conclusion — that is conflict avoidance, not conflict resolution',
      'Sided with the more powerful stakeholder without examining whether their position was analytically correct',
      'Escalated immediately without attempting to resolve what was analytically resolvable',
      'Still visibly bitter about one stakeholder\'s behavior — unresolved anger about the conflict',
    ],
    keyPrinciples: [
      'Analytical conflicts have a correct answer. "Which interpretation of this data is right?" is a question you can resolve with methodology. Strategic conflicts do not have a correct answer — they require a decision-maker who can weigh the competing values. Confusing these two types leads to bad outcomes for both.',
      'The most dangerous move is to produce an analysis that gives both sides what they want by being sufficiently vague. This creates the illusion of resolution while ensuring the underlying conflict resurfaces at the next decision point.',
      'Your job is not to take a side in a power struggle. Your job is to make the decision-making process cleaner: resolve what is analytically resolvable, escalate what requires a strategic judgment, and be explicit about which is which.',
    ],
    antiPatterns: [
      'Treating every stakeholder conflict as resolvable with more analysis — some conflicts are strategic disagreements that require a decision from above, not more data',
      'Framing the story as "I navigated between two difficult people" rather than "I identified the right resolution process for the type of conflict this was"',
      'Never having a view of your own — describing a fully neutral analyst who just presented both sides without any analytical contribution',
    ],
  },

  // ─────────────────────────────────────────────
  // BEH26 — Driving Change Without Direct Authority
  // ─────────────────────────────────────────────
  {
    id: 'BEH26',
    title: 'You Drove a Significant Change Without Having Authority Over the People Involved.',
    subtitle: 'Influence · Leadership Without Title',
    difficulty: 'senior',
    isFree: false,
    prompt: 'Describe a situation where you drove a significant change without direct authority over the people involved. How did you make it happen?',
    whatTheyreReallyAsking: 'Can you lead through influence rather than hierarchy? This question tests whether you understand that organizational change happens through persuasion, coalition-building, and making the right things easy — not through mandate. Interviewers want to see the mechanics of how you built support, not just the outcome.',
    storyFramework: {
      situation: 'A significant change was needed — a process, a measurement framework, a team behavior, a cross-functional workflow — and you had no direct authority to mandate it. The people who needed to change were peers, other teams, or people senior to you.',
      behavior: 'You diagnosed why the change hadn\'t happened yet — was it lack of awareness, lack of a compelling argument, friction in adoption, or active resistance? You built a specific case for the change in terms that mattered to the people who needed to adopt it. You made adoption easy rather than demanding it. You found early adopters who gave you proof points. You worked through champions in other teams rather than going over heads.',
      outcome: 'The change happened. You can name specific teams that adopted it, specific decisions that changed as a result, or a specific process that no longer exists in its old form. The change persisted without your ongoing involvement.',
    },
    strongSignals: [
      'Diagnosed the specific barrier to change before designing the influence strategy — awareness, motivation, friction, or active resistance require different approaches',
      'Built the case in the other team\'s terms — what does this change do for them, not just for you or the organization',
      'Found early adopters and used their experience as social proof rather than relying solely on the argument',
      'Made adoption easy: reduced friction, provided templates, ran the first instance with them rather than asking them to do it alone',
      'The change persisted and scaled without requiring your ongoing enforcement',
    ],
    weakSignals: [
      'The change happened because a senior leader mandated it after the candidate escalated — that\'s escalation, not influence',
      'The change only affected the candidate\'s own team or work — not a true cross-functional influence story',
      'Cannot explain why the change happened — "I just kept pushing" is not a replicable influence model',
      'The change was minor and required no real influence work',
    ],
    keyPrinciples: [
      'The most durable organizational changes happen when the people who need to change understand why it benefits them, not just why it benefits the person asking. Frame every change ask in terms of the adopter\'s problem, not your problem.',
      'Early adopters are your most valuable asset in a no-authority influence campaign. Find one team willing to pilot, make their experience a success, and then use their story as evidence for the next conversation. Social proof scales in ways that argument alone does not.',
      'Making the change easy is more powerful than making the argument compelling. A great process with a 2-hour setup burden will be adopted less than a decent process that works in 15 minutes. Remove friction before you try to increase motivation.',
    ],
    antiPatterns: [
      'Leading the story with the outcome and working backward — without explaining the specific mechanics of how you built support',
      'Describing influence as "presenting at a meeting and getting buy-in" — that is one step, not an influence campaign',
      'Relying on authority proxies (getting your skip-level to endorse the change, dropping a VP\'s name in conversations) rather than genuine peer influence',
    ],
  },

  // ─────────────────────────────────────────────
  // BEH27 — Meaningful Impact on Someone's Growth
  // ─────────────────────────────────────────────
  {
    id: 'BEH27',
    title: 'You Had a Meaningful Impact on Someone Else\'s Career or Development.',
    subtitle: 'Mentoring · Developing Others',
    difficulty: 'senior',
    isFree: false,
    prompt: 'Tell me about a time you had a meaningful impact on someone else\'s career or growth. What did you do, and what was the outcome?',
    whatTheyreReallyAsking: 'Do you invest in people around you, not just in your own work? This question tests whether you see developing others as part of your job — not a nice-to-have that happens when you have spare time. Interviewers also want to see whether your mentoring was substantive (you changed how someone works or thinks) or superficial (you were nice to them).',
    storyFramework: {
      situation: 'Someone on your team, a peer, or a more junior person was stuck — on a career trajectory, a skill gap, a confidence problem, or a recurring pattern of behavior that was limiting them. You noticed it, and you decided to engage.',
      behavior: 'You named what you observed specifically, rather than offering generic encouragement. You gave them a concrete framework or approach for the problem. You followed up — you didn\'t just have one conversation and consider it done. You gave them feedback that was specific enough to act on, not so vague as to be useless.',
      outcome: 'The person changed something specific — a skill, a behavior, a way of approaching a problem, a career decision — and you can describe what changed. Ideally, you stayed connected enough to see the downstream effect.',
    },
    strongSignals: [
      'Named a specific observation about the person before giving advice — the help was tailored, not generic',
      'The feedback or coaching changed a specific behavior or decision — not just "they appreciated my input"',
      'Followed up over time rather than having one conversation and considering the job done',
      'Can describe what specifically the person does differently now — the change is observable and concrete',
      'Did this without being asked, as part of their natural way of working — not as a formal mentoring assignment',
    ],
    weakSignals: [
      'The "meaningful impact" is vague: "I encouraged them" or "I was supportive during a hard time" — kind but not developmental',
      'The story is primarily about how much the other person appreciated the interaction, not about what changed for them',
      'The mentoring was a one-time conversation rather than a sustained investment',
      'Describes the other person\'s situation in detail but is vague about what specific input they provided',
    ],
    keyPrinciples: [
      'Meaningful mentoring starts with a specific observation, not a generic offer. "I noticed that your presentations tend to bury the recommendation in slide 8 — here\'s a framework I use for leading with the so-what" is actionable. "I\'m happy to give you feedback anytime" is not.',
      'The best mentors give feedback that is uncomfortable to hear but specific enough to act on. Feedback that is only positive is encouragement, not development. The developmental value is in the specific, actionable critique — delivered with enough care that the person can receive it.',
      'Development requires repetition, not a single conversation. A behavior change requires being named, practiced, and reinforced over time. If you\'re only having one conversation and considering your mentoring obligation fulfilled, you\'re coaching someone for a single at-bat rather than improving their swing.',
    ],
    antiPatterns: [
      'Describing mentoring as being available and supportive — availability is a prerequisite, not the mentoring itself',
      'Framing the story around how much you enjoyed mentoring rather than around what the other person changed',
      'The person you mentored had no particular challenge — "I mentored someone who was already very capable" is not this question',
    ],
  },

  // ─────────────────────────────────────────────
  // BEH28 — Saying No to a Reasonable-Seeming Request
  // ─────────────────────────────────────────────
  {
    id: 'BEH28',
    title: 'You Said No to a Reasonable-Seeming Request. How Did You Handle It?',
    subtitle: 'Prioritization · Backbone',
    difficulty: 'analyst',
    isFree: false,
    prompt: 'Describe a time you said no to a reasonable-seeming request. What was the request, why did you decline it, and how did you handle the conversation?',
    whatTheyreReallyAsking: 'Can you prioritize effectively even when it requires disappointing someone? Interviewers want to see whether you have a principled basis for saying no (not enough capacity, not the highest-value use of your time, the request doesn\'t actually serve the stated goal) versus avoidance or conflict-aversion. They also want to see how you decline in a way that preserves the relationship and sometimes finds an alternative.',
    storyFramework: {
      situation: 'A stakeholder, colleague, or manager made a request that was not inherently unreasonable — they had a legitimate need — but that you concluded you should not fulfill in its requested form. This required saying no to someone who expected a yes.',
      behavior: 'You gave the person a clear, honest reason for declining that was grounded in priorities, capacity, or analytical judgment — not vague deflection. You offered a specific alternative where possible: a smaller-scope version, a later date, a different approach that met the underlying need. You delivered the no in a way that kept the relationship functional.',
      outcome: 'The request was declined (or significantly rescoped) and the relationship remained intact. In the best cases, the alternative you proposed was actually more useful than the original request.',
    },
    strongSignals: [
      'The reason for saying no was principled — clearly grounded in competing priorities, capacity, analytical concern, or a better alternative',
      'Gave the person a clear reason, not a vague "I\'m too busy"',
      'Offered a specific alternative where one existed — the no was paired with something constructive',
      'Delivered the no directly and promptly rather than stringing the person along',
      'The relationship was intact after the no — they understand how to decline without damaging working relationships',
    ],
    weakSignals: [
      'The story is really about a passive no — they deprioritized the request and never had the conversation',
      'Said yes and then delivered something inadequate — that is not saying no, that is poor delivery',
      'The reason for saying no was primarily about personal workload comfort rather than principled prioritization',
      'Cannot describe a specific reason they said no — "I had a lot going on" is not a principled no',
    ],
    keyPrinciples: [
      'Saying no is a prioritization decision, not a relationship decision. The question is not "will this person be upset if I say no?" — the question is "is this the highest-value use of my time, and does this request serve the stated goal?" Those are analytical questions, not social ones.',
      'A good no comes with a reason and often an alternative. "I can\'t do the full analysis by Friday, but I can give you a directional answer based on the data I have — would that be useful?" is a no that keeps the relationship and still delivers value.',
      'The cost of saying yes to everything is doing many things poorly. The cost of saying yes to the wrong things is doing nothing important well. Selective no-saying is how high-performers protect the time to do their most important work.',
    ],
    antiPatterns: [
      'Treating the ability to say no as primarily a self-care practice rather than a strategic prioritization skill',
      'Describing a story where you said no and then regretted it because you were wrong about the importance of the request — this is a bad prioritization story, not a backbone story',
      'Saying no and then continuing to feel guilty about it — shows the discomfort with declining hasn\'t been resolved',
    ],
  },

  // ─────────────────────────────────────────────
  // BEH29 — Pushing Back on a Manager or Senior Leader
  // ─────────────────────────────────────────────
  {
    id: 'BEH29',
    title: 'You Pushed Back on Your Manager or a Senior Leader. What Happened?',
    subtitle: 'Managing Up · Intellectual Courage',
    difficulty: 'senior',
    isFree: false,
    prompt: 'Tell me about a time you pushed back on your manager or a senior leader. What was the situation, how did you raise it, and what happened?',
    whatTheyreReallyAsking: 'Do you have the intellectual courage to advocate up when you have a genuine analytical concern — and the judgment to do it in a way that is productive rather than damaging? This is one of the most important senior-individual-contributor competencies. Interviewers want to see whether you distinguish between "I had a concern" and "I surfaced it effectively," and whether you understand the difference between respectful dissent and insubordination.',
    storyFramework: {
      situation: 'Your manager or a senior leader made a call — a project direction, a metric definition, a launch decision, a resource allocation — that you had a specific, analytical reason to believe was wrong. You had data or reasoning that they did not appear to have considered.',
      behavior: 'You chose the right moment and format: private conversation, not a public meeting; direct and specific, not vague and hedging. You framed the pushback around the data and the risk, not around your preference. You gave them the full picture of what you were seeing and why you thought it mattered. You made a specific recommendation, not just an objection. And after the conversation, you accepted the outcome — whether or not they changed course.',
      outcome: 'Either they updated their position (and you describe what changed and what the outcome was), or they maintained it (and you describe how you accepted that outcome and what you learned from the interaction). In both cases, the relationship was intact.',
    },
    strongSignals: [
      'The pushback was grounded in a specific analytical concern — a data point, a risk, a logical inconsistency — not a personal preference or strategic disagreement',
      'Chose the right format: private, direct, specific — not an ambush in a public meeting',
      'Came with a recommendation, not just an objection: "I think there\'s a risk here — here\'s what I\'d suggest instead"',
      'Accepted the outcome gracefully after being heard, whether or not the direction changed',
      'The relationship with the leader was not damaged — they trust someone who can push back well more, not less',
    ],
    weakSignals: [
      'The pushback was actually capitulation framed as pushback — "I raised a concern and then fully deferred when they responded"',
      'Raised the concern in a way that was embarrassing or confrontational for the leader in a public setting',
      'The story is primarily about how unreasonable the leader was rather than about how effectively they managed up',
      'The pushback was trivial — a minor preference disagreement, not a meaningful analytical concern',
    ],
    keyPrinciples: [
      'Good pushback sounds like: "I want to flag something I\'m seeing in the data before we finalize this. I might be missing context — can I walk you through it?" That framing invites dialogue rather than triggering defensiveness.',
      'The most common failure mode in pushing back up is conflating "I said something" with "I advocated effectively." Saying "I expressed some concerns" in a meeting is not the same as making a specific, well-structured case for a different direction in the right forum.',
      'A senior leader who can be pushed back on productively will trust the person doing it more over time, not less. The leaders who become liabilities are the ones who never push back — they don\'t know whether they\'re being told the truth.',
    ],
    antiPatterns: [
      'Describing pushback as an act of bravery rather than a professional skill — reframing it emotionally is a sign that it hasn\'t been processed as a normal part of the job',
      'The story ends with "and they agreed with me" as the measure of success — the measure of success is whether the concern was heard and fairly evaluated, not whether you won',
      'Conflating pushing back with relitigating after the decision is made — these are different behaviors with different implications',
    ],
  },

  // ─────────────────────────────────────────────
  // BEH30 — Pattern of Mistakes You've Actively Fixed
  // ─────────────────────────────────────────────
  {
    id: 'BEH30',
    title: 'What\'s a Pattern of Mistakes in Your Analytical Work That You\'ve Actively Tried to Fix?',
    subtitle: 'Self-Awareness · Growth Mindset',
    difficulty: 'senior',
    isFree: false,
    prompt: 'Looking back at your analytical work, what\'s a pattern of mistakes or gaps you\'ve actively tried to fix? What did you do about it?',
    whatTheyreReallyAsking: 'Do you have genuine, specific self-awareness about your analytical blind spots — not performed humility about something minor? This question also tests your growth model: do you treat skill development as deliberate practice with a feedback loop, or as passive accumulation of experience? The best answers name a real pattern, describe the specific mechanism that caused it, and describe a specific change in behavior rather than a vague commitment to improvement.',
    storyFramework: {
      situation: 'Over time — through specific failures, feedback from colleagues, or your own reflection — you identified a pattern in how you approach analysis, communicate findings, or work with stakeholders that was systematically producing suboptimal outcomes.',
      behavior: 'You named the pattern specifically, diagnosed why it was happening (not just "I need to be more careful" but the underlying cause), designed a specific behavior change to address it, and implemented that change in your daily work. You created some form of feedback loop to check whether the change was working.',
      outcome: 'The pattern changed, and you can describe a specific situation where you caught yourself doing the old behavior and chose the new one — or where the new behavior produced a noticeably better outcome than the old one would have.',
    },
    strongSignals: [
      'Names a real, significant pattern — not a small execution habit dressed up as a meaningful flaw',
      'Can describe the mechanism: why did this pattern exist? What was the underlying cause that produced it repeatedly?',
      'Describes a specific behavior change, not a vague intention: "I now do X before Y in every analysis" rather than "I try to be more careful about X"',
      'Has a concrete example of catching the old pattern and executing the new behavior instead',
      'The pattern is one that a thoughtful interviewer would recognize as a genuine analytical or professional risk — not a transparent humble-brag',
    ],
    weakSignals: [
      'The "mistake" is clearly a strength reframed as a weakness: "I care too much about getting the analysis right" is not a real pattern',
      'The fix is vague: "I\'ve been working on being more aware of X" without a specific behavioral change',
      'The pattern is trivial: minor formatting habits, small execution preferences, not something with analytical or business significance',
      'Cannot describe a specific instance where the new behavior was applied — suggests the change hasn\'t actually been implemented',
    ],
    keyPrinciples: [
      'The most credible answers name patterns that interviewers recognize as real risks — overconfidence in early-stage data, underinvesting in communication relative to analysis, anchoring on the first hypothesis before testing alternatives, letting urgency erode rigor. Generic humility ("I\'m still learning") is unconvincing; specific self-diagnosis is compelling.',
      'A real behavior change has a mechanism: it changes a step in your process, adds a check you didn\'t do before, or removes a shortcut you used to take. "I try harder" is not a behavior change — it is an intention. Describe the new process, not the new attitude.',
      'The growth mindset signal interviewers are actually looking for is not "I failed and felt bad about it." It is: "I have a systematic way of identifying my own blind spots and updating my process as a result of them." That requires reflection, a diagnostic process, and deliberate practice — not just the accumulation of experience.',
    ],
    antiPatterns: [
      'Giving a humble-brag answer that is transparently positive: "My weakness is that I hold myself to very high standards" — experienced interviewers will mark this as evasive',
      'Describing a past failure without connecting it to an ongoing pattern and a specific behavior change',
      'The behavior change is in the future: "I\'m planning to work on X" — the question asks what you\'ve actively done, not what you intend to do',
    ],
  },
];
