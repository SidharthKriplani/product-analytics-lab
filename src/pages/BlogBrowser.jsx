// Blog / Learn layer
// Full topic population — 12 posts have full content, rest are stubs
// Each post maps to a room with a "Practice this now →" CTA

import { useState } from 'react';
import { Icon } from '../components/shared/Icon.jsx';

const POSTS = [

  // ══════════════════════════════════════════════════════════════
  // METRICS & KPIs
  // ══════════════════════════════════════════════════════════════
  {
    id: 'denominator-discipline',
    category: 'Metrics',
    title: 'Denominator Discipline: Why Every Rate Metric Is Lying to You',
    summary: 'CVR from sessions, users, and PDP viewers are three different numbers. Interviewers notice when you don\'t lock the denominator first. This is the single habit that separates junior from senior metric thinking.',
    readMin: 6,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    related: ['five-metric-types', 'guardrails', 'metric-grain'],
    content: [
      { type: 'text', text: 'Every rate metric has a numerator and a denominator. Most analysts obsess over the numerator — purchases, clicks, sign-ups — and treat the denominator as obvious. It isn\'t. The denominator is a choice, and that choice changes what the metric measures, who it indicts, and what action it implies. Getting it wrong doesn\'t just produce a wrong number; it produces a wrong story.' },
      { type: 'heading', text: 'Three Denominators, Three Different Metrics' },
      { type: 'text', text: 'Consider conversion rate for an e-commerce product page. You could compute it three ways: purchases divided by sessions, purchases divided by unique users, or purchases divided by product detail page (PDP) viewers. These are not interchangeable. Session-level CVR penalizes products with high browse-to-return behavior — a user who comes back four times before buying counts as four non-converting sessions plus one converting session, yielding a 20% rate. User-level CVR would give that same user a 100% rate. PDP-viewer CVR isolates purchase intent — it only includes users who actually looked at the product, stripping out people who never saw it.' },
      { type: 'example', label: 'Worked example', text: 'Baseline: 10,000 sessions, 6,000 unique users, 4,000 PDP viewers, 400 purchases.\n\nSession CVR = 400 / 10,000 = 4.0%\nUser CVR = 400 / 6,000 = 6.7%\nPDP Viewer CVR = 400 / 4,000 = 10.0%\n\nSame 400 purchases. Three completely different stories. A PM looking at PDP Viewer CVR thinks the product is converting well. A PM looking at Session CVR thinks there\'s a major funnel problem.' },
      { type: 'heading', text: 'How Denominator Choice Changes the Story' },
      { type: 'text', text: 'Imagine you ship a new recommendation carousel on the homepage. After the launch, session CVR drops 0.3%. Your PM is alarmed. But when you look at PDP viewer CVR — which strips out the incremental browse sessions the carousel generated — it\'s up 1.2%. What happened? The carousel brought in more exploratory traffic. Those sessions browse without buying, diluting session CVR. But the users who did reach a PDP converted at a higher rate, probably because the carousel surfaced better product matches. Session CVR made a win look like a loss.' },
      { type: 'text', text: 'This isn\'t a cherry-picking problem — it\'s a specification problem. The right denominator depends on what decision you\'re informing. If you\'re measuring checkout flow efficiency, use users who entered checkout. If you\'re measuring the effectiveness of product discovery, use users who saw at least one product. If you\'re measuring top-of-funnel health, sessions or visits might be appropriate. The question to ask is: what\'s the population for whom the event was possible?' },
      { type: 'heading', text: 'The Denominator Ownership Habit' },
      { type: 'text', text: 'Senior analysts lock the denominator before they compute anything. In an interview, this sounds like: "Before I give you the conversion rate, I want to clarify the denominator. Are we measuring CVR among all sessions, unique users, or users who reached the product page? Each tells a different story — let me explain why." That sentence alone signals metric maturity. It shows you know that numbers without specifications are ambiguous, and that ambiguity is where bad decisions live.' },
      { type: 'callout', label: 'The rule', text: 'Before computing any rate metric, state the denominator explicitly. Ask: for whom was the event in the numerator actually possible? That\'s your denominator. Everything else is a measurement of something different.' },
      { type: 'text', text: 'The most common mistake is defaulting to sessions because sessions are easy to count. Sessions are available in almost every analytics tool, they\'re high-volume, and they feel objective. But sessions are a behavioral artifact — they depend on how your tracking fires, what counts as a session boundary, and how often your users return. For most product questions, users or a specific funnel entry point is the right denominator. When you find yourself reaching for sessions, pause and ask whether that\'s actually what the question requires.' },
      { type: 'list', items: [
        'State the denominator before computing any rate. "CVR among users who viewed at least one product page."',
        'Check whether the denominator changed between periods before attributing a rate movement to the numerator.',
        'When a metric moves, decompose numerator and denominator separately — the movement might be entirely in the denominator.',
        'In interviews, always clarify denominator choice before answering. It demonstrates precision before you\'ve produced any analysis.',
      ]},
      { type: 'cta', room: 'metrics', label: 'Practice denominator decisions in the Metrics Room →' },
    ],
  },
  {
    id: 'five-metric-types',
    category: 'Metrics',
    title: 'The 5 Metric Types Every Product Analyst Must Know Cold',
    summary: 'North star, diagnostic, guardrail, proxy, and composite. Know the role of each, when to reach for which, and how to explain the hierarchy to a PM in one sentence.',
    readMin: 4,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    related: ['denominator-discipline', 'activation-metrics', 'guardrails'],
    content: [
      { type: 'text', text: 'Product teams measure dozens of things simultaneously, but not all metrics serve the same purpose. Using a diagnostic metric as a success criterion, or treating a proxy like a north star, produces decisions that look data-driven but aren\'t. There are five distinct metric types, each with a specific job. Knowing which type you\'re working with — and why — is one of the most reliable signals of analytical seniority.' },
      { type: 'heading', text: 'The Five Types' },
      { type: 'text', text: 'A north star metric captures the single output the team is trying to grow. It\'s direction-setting and visible to everyone, which also makes it gameable. A diagnostic metric decomposes the north star into its multiplicative or additive drivers — it tells you which lever moved and by how much. A guardrail metric defines the floor: what must not degrade while you optimize the north star. A proxy metric is a short-term stand-in for a long-run outcome you can\'t observe quickly enough to use in an experiment. A composite metric is a weighted scorecard that combines multiple signals when no single number captures the outcome correctly.' },
      { type: 'example', label: 'All five mapped for Prism video app', text: 'North star: Weekly Active Viewers (WAV) — captures habit-level engagement.\nDiagnostic: Session start rate, average session duration, D7 retention — decompose WAV into acquisition, depth, and stickiness.\nGuardrail: Push notification opt-out rate, app store rating — WAV cannot be inflated by spamming users.\nProxy: D3 retention as a proxy for D30 (experiments run 14 days, not 30).\nComposite: Content Health Score = 0.4 × completion rate + 0.3 × share rate + 0.3 × save rate — used to rank video recommendations when no single signal dominates.' },
      { type: 'heading', text: 'How to Explain the Hierarchy in One Sentence' },
      { type: 'text', text: 'When a PM asks why you track so many metrics, the one-sentence answer is: "The north star tells us where we\'re going, diagnostics tell us why we\'re moving, guardrails tell us what we must protect, proxies let us move faster, and composites handle outcomes too complex for a single number." This sentence maps each type to its job, and it positions you as someone who thinks in systems rather than scorecards.' },
      { type: 'callout', label: 'Key insight', text: 'The mistake most teams make is using one metric for multiple jobs — for instance, using the north star as both the success criterion and the diagnostic. When the north star moves, you still don\'t know why. Each metric type must do exactly one job. When a metric is being asked to do two, split it.' },
      { type: 'cta', room: 'metrics', label: 'Practice this in the Metrics Room →' },
    ],
  },
  {
    id: 'guardrails',
    category: 'Metrics',
    title: 'Guardrails: The Metrics Nobody Asks For That You Must Track Anyway',
    summary: 'A rising CVR with a rising refund rate is not a win. Guardrails are what separate analysts from metric-farmers. Here\'s how to select, defend, and explain them.',
    readMin: 5,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    related: ['five-metric-types', 'game-proof-north-star', 'proxy-metrics'],
    content: [
      { type: 'text', text: 'North star metrics get optimized. That\'s the point. But optimization without constraint finds the shortest path to the target, which is rarely the path you intended. Guardrail metrics exist because every north star can be gamed, and game-playing looks like success until it doesn\'t. The analysts who add guardrails before the experiment runs are the ones who catch problems before they become embarrassments.' },
      { type: 'heading', text: 'Why Guardrails Exist' },
      { type: 'text', text: 'The failure mode of any north star is the cheapest action that moves it upward without delivering real value. If the north star is conversion rate, you can raise it by removing friction at the cost of quality — show fewer products with higher click probability, simplify the checkout form so impulse buys go through faster, send heavier promotional discounts. CVR goes up. Refund rate, support ticket volume, and 30-day repurchase rate go down. Guardrails are the metrics that measure what the north star optimization is costing you.' },
      { type: 'text', text: 'The key principle: guardrails must be selected before the experiment runs, not discovered after. Pre-committing to guardrails prevents motivated reasoning — you can\'t decide post-hoc that the refund rate increase "probably isn\'t related." If refund rate is a guardrail and it moves significantly, the experiment is not a ship regardless of what CVR did. That commitment is what makes guardrails credible.' },
      { type: 'example', label: 'CVR up, refund rate up — is it a ship?', text: 'Experiment: Simplified checkout flow for Crafted marketplace.\nNorth star: Checkout CVR — Treatment: +4.2% (significant, p < 0.01)\nGuardrail: Refund rate — Treatment: +1.8pp, from 6.1% to 7.9% (significant, p < 0.05)\n\nOn CVR alone, this ships. But refund rate rising nearly 30% relative means the simplified checkout is pushing through buyers who aren\'t confident in their purchase. The incremental CVR gain is partly manufactured demand, not real demand. Net revenue impact after refunds is likely negative. This is a no-ship.' },
      { type: 'heading', text: 'How to Select and Defend Them' },
      { type: 'text', text: 'To select guardrails, ask: "What is the failure mode of optimizing this north star?" The answer names the thing to protect. For GMV, the failure modes are low-quality transactions and seller churn — guardrails are cancellation rate and seller NPS. For session engagement, the failure mode is notification spam — guardrails are opt-out rate and next-day retention. When a guardrail fires, defend it by showing the business impact of ignoring it: if refund rate is up 1.8pp on 50,000 orders per month at $80 AOV, that\'s $72K/month in reversed revenue before accounting for support cost.' },
      { type: 'callout', label: 'Key insight', text: 'A guardrail that never fires is still doing its job — it proves your optimization wasn\'t gaming the system. A guardrail that fires and gets overridden is worse than no guardrail. The credibility of the system depends on honoring the pre-commitment.' },
      { type: 'cta', room: 'metrics', label: 'Practice this in the Metrics Room →' },
    ],
  },
  {
    id: 'game-proof-north-star',
    category: 'Metrics',
    title: 'How to Game-Proof Your North Star Metric',
    summary: 'Every metric can be gamed. The senior move is naming exactly how — and designing the guardrail that catches it before a stakeholder does.',
    readMin: 6,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    related: ['guardrails', 'proxy-metrics', 'metric-trees'],
    content: [
      { type: 'text', text: 'Every metric that becomes a target eventually gets gamed. This isn\'t a cynical observation — it\'s Goodhart\'s Law in action, and it applies as reliably in product analytics as anywhere else. The question isn\'t whether your north star metric can be gamed. It can. The question is whether you\'ve named the failure mode before your stakeholders discover it, and whether you\'ve built the guardrail that catches it.' },
      { type: 'heading', text: 'The Gaming Test' },
      { type: 'text', text: 'For any north star metric, ask: "What is the cheapest action that would raise this metric without improving the underlying business outcome?" The answer is your primary gaming risk. If your north star is Daily Active Users, the cheapest action is usually aggressive push notification campaigns. You can flood users with badges, reminders, and alerts, and DAU will climb — because opening a push notification counts as a session. The business outcome you care about (people getting value from the product) doesn\'t move. But DAU does, and your dashboard looks good.' },
      { type: 'example', label: 'DAU gaming via push spam', text: 'Scenario: A social app uses DAU as its north star.\n\nBefore push campaign: DAU = 2.1M, D7 retention = 34%, push opt-out rate = 8%\nAfter aggressive push campaign: DAU = 2.4M (+14%), D7 retention = 29% (-15%), push opt-out rate = 19% (+138%)\n\nDAU looks like a win. Retention and opt-out tell you the product experience is degrading. Without the guardrails, the team ships more push campaigns.' },
      { type: 'heading', text: 'Designing the Guardrail Before You Launch' },
      { type: 'text', text: 'The right time to design the guardrail is when you choose the north star — not after you see the first gaming attempt. For DAU, the obvious guardrails are retention (D7 or D30) and notification opt-out rate. If DAU goes up but D7 retention goes down, you haven\'t grown — you\'ve borrowed engagement from the future. If opt-out rate rises, you\'re burning the channel that created the DAU lift.' },
      { type: 'text', text: 'The guardrail framework has three components: the north star (the thing you\'re trying to move), the failure mode (the gaming vector), and the guardrail metric (what you monitor to catch gaming). Write all three before the metric goes into production. This forces you to think about what you\'re not measuring and what the metric can\'t see.' },
      { type: 'callout', label: 'The framework', text: 'North star → name the gaming vector → define the guardrail.\n\nDAU → gaming vector: push spam → guardrail: D7 retention + opt-out rate\nGMV → gaming vector: low-quality supply flooding → guardrail: cancellation rate + refund rate\nMessages sent → gaming vector: bot/spam activity → guardrail: reply rate + block rate' },
      { type: 'heading', text: 'Multiple Gaming Vectors' },
      { type: 'text', text: 'Complex north stars have multiple gaming vectors. GMV (gross merchandise value) can be inflated by adding low-quality supply that drives transactions that don\'t complete, by running promotional subsidies that make transactions happen at negative margin, or by allowing fraudulent orders. Each gaming vector needs its own guardrail. The skill is being comprehensive enough to catch the real risks without adding so many guardrails that your experiment readouts become unreadable.' },
      { type: 'text', text: 'In practice, two to three guardrail metrics per north star is the right range. More than that creates metric overload — you\'ll have contradictory signals and no framework for resolving them. Fewer than two and you\'ve probably missed a real gaming vector. The guardrails should be chosen to catch the most likely and highest-impact gaming risks, not to be exhaustive.' },
      { type: 'list', items: [
        'Name the north star\'s failure mode before it launches. What\'s the cheapest action that raises it without improving outcomes?',
        'Design guardrails that directly measure what the north star can\'t see.',
        'Pre-commit to a guardrail threshold: if X drops below Y while north star rises, the result is not a win.',
        'Review gaming risks quarterly — new product surfaces create new gaming vectors.',
      ]},
      { type: 'cta', room: 'metrics', label: 'Practice metric design in the Metrics Room →' },
    ],
  },
  {
    id: 'gmv-vs-revenue',
    category: 'Metrics',
    title: 'GMV vs Revenue vs ARPU vs LTV: When to Use Which',
    summary: 'These are not interchangeable. Using GMV when you mean revenue will cost you credibility in every senior interview and stakeholder meeting.',
    readMin: 5,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    related: ['five-metric-types', 'denominator-discipline', 'dau-mau-ratio'],
    content: [
      { type: 'text', text: 'GMV, revenue, ARPU, and LTV are four different numbers that non-technical stakeholders often use interchangeably. Using the wrong one in an interview — or in a stakeholder meeting — signals that you don\'t understand the business model you\'re analyzing. Each metric answers a different question, and the right one depends on what decision you\'re informing.' },
      { type: 'heading', text: 'The Four Definitions' },
      { type: 'text', text: 'GMV (Gross Merchandise Value) is the total value of transactions flowing through a platform. It measures volume and velocity — how much commerce happened — but it is not money the company keeps. Revenue is what flows to the company after paying out sellers, partners, or service providers. For a marketplace, Revenue = GMV × take rate. ARPU (Average Revenue Per User) is revenue divided by active users over a period. It normalizes revenue by the user base, making it useful for comparing monetization efficiency across cohorts, time periods, or product lines. LTV (Lifetime Value) is the total expected revenue from a single user over their entire relationship with the product — typically estimated as ARPU × average lifespan, or modeled directly from cohort data.' },
      { type: 'example', label: 'Crafted marketplace: all four in context', text: 'Crafted marketplace monthly snapshot:\n- GMV: $10M (total buyer spend)\n- Take rate: 12%\n- Revenue: $1.2M (what Crafted keeps)\n- Monthly active buyers: 24,000\n- ARPU: $1,200,000 / 24,000 = $50/month\n- Average buyer lifespan: 18 months\n- LTV: $50 × 18 = $900\n\nIf a PM says "we grew the business 20% this month," ask which number moved 20%. GMV growing 20% while revenue grows 5% means take rate compressed — that\'s a pricing story, not a growth story.' },
      { type: 'heading', text: 'Marketplace vs SaaS Context' },
      { type: 'text', text: 'In marketplace contexts (Crafted, Etsy, Airbnb), GMV is the primary volume signal and revenue is the financial outcome. In SaaS contexts (Threadline), there\'s no GMV — revenue IS the transaction, so ARPU and LTV are the primary metrics. Mixing up the vocabulary — citing GMV in a SaaS context, or ignoring take rate compression in a marketplace context — tells interviewers and stakeholders that you\'re applying a template rather than thinking about the specific business.' },
      { type: 'callout', label: 'Key insight', text: 'The question to ask before citing any of these metrics is: "What decision does this number inform?" GMV informs supply/demand balance and market liquidity. Revenue informs financial planning. ARPU informs pricing and segmentation. LTV informs acquisition budget and payback period. Using one when the decision calls for another produces the right-sounding number but the wrong analysis.' },
      { type: 'cta', room: 'metrics', label: 'Practice this in the Metrics Room →' },
    ],
  },
  {
    id: 'metric-grain',
    category: 'Metrics',
    title: 'Metric Grain: The Most Underrated Concept in Product Analytics',
    summary: 'Grain defines what one row in your analysis represents. Getting it wrong means your aggregations are silently wrong. Most analysts never explicitly state it.',
    readMin: 6,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    related: ['denominator-discipline', 'metric-trees', 'five-metric-types'],
    content: [
      { type: 'text', text: 'Grain is the answer to the question: "What does one row in this dataset represent?" It sounds trivial. In practice, failing to state grain explicitly is one of the most common sources of silently wrong analysis. Wrong grain produces wrong aggregations, wrong averages, and wrong rates — and the numbers look completely plausible, which is what makes it dangerous.' },
      { type: 'heading', text: 'The Fan-Out Problem' },
      { type: 'text', text: 'The most common grain error happens at joins. Suppose you join an orders table to a users table to add demographic data. If a user has placed 8 orders, they appear 8 times in the joined result. Now every user-level metric you compute from that joined table is inflated by the order count distribution. Heavy buyers get counted more times than light buyers. Your average age, average tenure, and user-level CVR are all wrong — not by a little, but potentially by the exact ratio of orders per user, which can be 5x or more for marketplace products.' },
      { type: 'example', label: 'Sessions vs users vs orders as CVR denominator', text: 'Crafted marketplace: 10,000 sessions, 4,200 unique users, 18,600 orders in a month.\n\nConversion rate computed at session grain: purchases / sessions = 3,400 / 10,000 = 34%\nConversion rate computed at user grain: buyers / unique users = 1,890 / 4,200 = 45%\nAOV computed at order grain: revenue / orders = $126,000 / 3,400 = $37\n\nIf you accidentally join orders to sessions and compute CVR on the resulting table, you get a fan-out: the 3,400 purchasing users each appear multiple times (once per session), inflating both numerator and denominator — but not equally, producing a nonsense rate. Stating grain before computing prevents this.' },
      { type: 'heading', text: 'How to State Grain Explicitly' },
      { type: 'text', text: 'The habit is to write the grain declaration at the top of every analysis: "This analysis is at user-day grain. One row = one user on one calendar day. Sessions, orders, and events have been aggregated to this grain before any metrics are computed." This declaration forces you to think through the aggregation logic before writing any SQL or pandas code, and it makes the analysis self-documenting for reviewers.' },
      { type: 'text', text: 'In interviews, stating grain sounds like: "Before I compute conversion rate, I want to clarify the grain. Are we measuring at session grain, user grain, or some other unit? The denominator changes based on the grain, and the denominators give us different answers to different questions." That sentence shows you understand that analysis is a design choice, not just arithmetic.' },
      { type: 'callout', label: 'Key insight', text: 'If your analysis involves a join, check whether the join is one-to-one or one-to-many. A one-to-many join changes the grain of the result. Always aggregate the many-side to the one-side grain before joining, not after. Post-join aggregation on a fan-out table produces wrong answers that look right.' },
      { type: 'cta', room: 'metrics', label: 'Practice this in the Metrics Room →' },
    ],
  },
  {
    id: 'proxy-metrics',
    category: 'Metrics',
    title: 'Proxy Metrics: When to Use Them, When They Betray You',
    summary: 'Open rate is not engagement. Deflection is not resolution. Proxy metrics are necessary but dangerous. How to propose them with the right caveats.',
    readMin: 6,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    related: ['game-proof-north-star', 'guardrails', 'activation-metrics'],
    content: [
      { type: 'text', text: 'You can\'t run a 6-month retention experiment. The experiment would need to run 6 months to detect a 6-month retention difference, and by the time you have results, the team has shipped 40 other things. This is why proxy metrics exist: they let you make decisions about long-run outcomes using short-run observations. The risk is that the proxy and the real metric can decouple — the proxy moves, the real metric doesn\'t, and you\'ve shipped something that felt like a win.' },
      { type: 'heading', text: 'Selection Criteria for a Valid Proxy' },
      { type: 'text', text: 'A proxy metric earns its place when it satisfies three conditions. First, it must correlate with the real metric — historically, when the proxy moves, the real metric moves in the same direction. Second, it must move faster — if it takes as long to observe as the real metric, there\'s no efficiency gain. Third, it must not decouple — the correlation must be robust enough that optimizing the proxy doesn\'t produce environments where the proxy rises while the real metric falls. All three conditions must hold simultaneously.' },
      { type: 'example', label: 'D3 retention as proxy for D30 on Prism video app', text: 'Historical cohort analysis (last 12 cohorts):\n- Cohorts where D3 retention improved: D30 retention improved in 10/12 cases (83%)\n- Correlation coefficient D3 vs D30: r = 0.81\n- D3 observable 27 days earlier than D30\n\nThis proxy is valid. In experiments, a statistically significant D3 lift is a reasonable predictor of D30 lift with 2-week experiment windows. The team uses D3 as the primary success metric and schedules D30 validation 4 weeks post-ship. If D30 doesn\'t follow D3, the proxy relationship is re-examined before the next experiment uses it.' },
      { type: 'heading', text: 'Communication: Always Label It a Proxy' },
      { type: 'text', text: 'The most important discipline around proxy metrics is never presenting them as if they\'re the real thing. "We improved D3 retention by 2.1pp" must always be accompanied by: "D3 is our proxy for D30 retention. The historical correlation is strong (r=0.81 across 12 cohorts), but we\'ll validate against D30 at 6 weeks post-launch." This framing does two things: it prevents stakeholders from treating the proxy result as a confirmed D30 improvement, and it creates an accountability checkpoint that forces the team to verify the proxy held up.' },
      { type: 'callout', label: 'Key insight', text: 'Proxy metrics decouple most often when you change the product significantly. If a feature changes what "retention" means — for instance, a new use case that attracts users who engage differently — the historical correlation was trained on a different product environment and may not hold. Re-validate proxy correlations after major product changes, not just on a calendar schedule.' },
      { type: 'cta', room: 'metrics', label: 'Practice this in the Metrics Room →' },
    ],
  },
  {
    id: 'metric-trees',
    category: 'Metrics',
    title: 'How to Build a Metric Tree From Any North Star',
    summary: 'A metric tree decomposes your north star into its multiplicative or additive drivers. Build one correctly and you can find any lever. Build it wrong and your RCA will miss the real cause.',
    readMin: 5,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    related: ['five-metric-types', 'metric-grain', 'activation-metrics'],
    content: [
      { type: 'text', text: 'A metric tree is the single most useful diagnostic tool in product analytics. When a north star metric moves, a metric tree tells you which branch broke. When you\'re sizing an opportunity, it tells you which lever has the most room to move. When you\'re explaining a trend to a PM, it gives you a shared structure for the conversation. The problem is that most analysts build metric trees wrong — they make them too flat, or they mix additive and multiplicative relationships, or they stop one level too early.' },
      { type: 'heading', text: 'The Revenue Tree' },
      { type: 'text', text: 'Revenue is the most common north star for product analytics teams, so it\'s the best tree to learn. Revenue decomposes multiplicatively into: Revenue = Sessions × Session-to-PDP CVR × PDP-to-Checkout CVR × Checkout-to-Purchase CVR × Average Order Value. Each of these factors can then decompose further. Session volume breaks into new user sessions and returning user sessions. AOV breaks into items per order multiplied by average item price. You can extend this as deep as you need.' },
      { type: 'example', label: 'Finding the broken branch', text: 'Revenue is down 12% week-over-week. You build the tree:\n\nSessions: flat (+0.3%)\nSession-to-PDP CVR: flat (-0.5%, within noise)\nPDP-to-Checkout CVR: flat (-0.8%, within noise)\nCheckout-to-Purchase CVR: DOWN 18%\nAOV: slightly up (+2.1%)\n\nThe broken branch is Checkout CVR. Revenue is down not because fewer people are discovering products or adding to cart — it\'s because people are abandoning checkout at a much higher rate. The investigation narrows immediately: look at checkout flow changes, payment failures, shipping cost display, promo code errors.' },
      { type: 'heading', text: 'Additive vs Multiplicative Trees' },
      { type: 'text', text: 'Revenue trees are multiplicative — every level multiplies into the next. But some north stars decompose additively. Total messages sent = messages from power users + messages from casual users + messages from new users. Each segment contributes independently. When you mix additive and multiplicative relationships in the same tree, your math breaks down. Before building any tree, decide which type you\'re dealing with: is the north star a product of its drivers, or a sum?' },
      { type: 'text', text: 'The test is simple: if you multiply all the branches together, do you get the north star? If yes, it\'s multiplicative. If you add the branches together and get the north star, it\'s additive. Most funnel metrics (CVR, retention rates, completion rates) are multiplicative. Most volume metrics (total events, total users, total revenue by segment) are additive.' },
      { type: 'heading', text: 'How Deep to Go' },
      { type: 'text', text: 'The right depth is one level beyond where you have data and one level short of where the drivers become unactionable. A good rule: build the tree to four levels for RCA purposes, and to two levels for stakeholder communication. The full four-level tree is your diagnostic instrument. The two-level summary — "Revenue = Sessions × Funnel CVR × AOV, and the issue is in Funnel CVR" — is how you explain the finding.' },
      { type: 'callout', label: 'The process', text: '1. Write the north star at the top.\n2. Ask: does it decompose as a product or a sum?\n3. Write the level-1 drivers — the 2-4 factors that mathematically produce the north star.\n4. Extend to level 2 for each driver where you have data.\n5. When a north star metric moves, traverse the tree level by level, checking each branch for the movement. Stop at the branch that explains the full move.' },
      { type: 'list', items: [
        'Build the tree before a crisis hits — you don\'t want to be constructing it mid-incident.',
        'Validate the math: branches should multiply or add to the node above them.',
        'Keep the tree as a team artifact. Shared trees mean shared diagnosis vocabulary.',
        'When presenting RCA findings, show the tree with the broken branch highlighted.',
      ]},
      { type: 'cta', room: 'metrics', label: 'Practice metric trees in the Metrics Room →' },
    ],
  },
  {
    id: 'activation-metrics',
    category: 'Metrics',
    title: 'Activation Metrics: The Most Important Metric Nobody Defines Properly',
    related: ['five-metric-types', 'dau-mau-ratio', 'metric-grain'],
    summary: 'When is a new user actually activated? Checklist completion isn\'t it. The right activation metric predicts long-term retention — here\'s how to find it.',
    readMin: 6,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    content: [
      { type: 'text', text: 'Activation is the moment a new user first experiences the core value your product was built to deliver. Not account creation. Not email verification. Not completing an onboarding checklist. Those are steps toward activation — they are not activation itself. The difference matters enormously because optimizing checklist completion instead of genuine activation produces users who finish setup and never come back.' },
      { type: 'heading', text: 'How to Find the Activation Moment' },
      { type: 'text', text: 'The method is cohort analysis with a behavioral lens. Take your last 6 cohorts of new users and split them into two groups: users who were retained at 30 days, and users who churned by 30 days. Then ask: what actions did retained users take in their first 7 days that churned users didn\'t? The action that most strongly differentiates the retained cohort from the churned cohort is your candidate activation event. This is how Slack famously identified 2,000 messages sent as the threshold that correlated with retention — not because messages cause retention, but because teams that exchanged 2,000 messages had genuinely integrated Slack into their workflow.' },
      { type: 'example', label: 'Finding activation on Spark social app', text: 'Analysis: First-7-day behavior, split by D30 retained vs churned.\n\nAction → D30 retained users who did it → D30 churned users who did it\nPosted first photo: 71% vs 68% (weak signal)\nFollowed 5+ accounts: 84% vs 41% (strong signal)\nReceived 3+ comments: 79% vs 28% (very strong signal)\nCompleted profile: 52% vs 49% (no signal)\n\nActivation event: "Received 3+ comments on first post within 7 days." This is the moment Spark delivers social validation — its core value proposition. Profile completion is a setup step, not activation.' },
      { type: 'heading', text: 'Designing an Activation Experiment' },
      { type: 'text', text: 'Once you have a candidate activation event, the experiment question becomes: what can we change in the onboarding flow to increase the rate at which new users reach this event? For Spark, the implication is: get new users to post earlier, and get them into communities where they\'ll receive comments. Experiments might test prompting users to post before following, or surfacing them to relevant community feeds immediately after their first post. The success metric for onboarding experiments is no longer "completed profile" — it\'s "received 3+ comments within 7 days."' },
      { type: 'callout', label: 'Key insight', text: 'Activation events must be re-validated when the product changes significantly. The event that predicted retention for your first 10,000 users may not predict retention for your millionth user — the user base and use cases have evolved. Run the cohort analysis annually or after any major product shift.' },
      { type: 'cta', room: 'metrics', label: 'Practice this in the Metrics Room →' },
    ],
  },
  {
    id: 'dau-mau-ratio',
    category: 'Metrics',
    title: 'DAU/MAU Ratio: What It Actually Measures and When It Misleads',
    summary: 'High DAU/MAU signals habit. But the ratio compresses cohort differences and can look healthy while retention collapses. Here\'s when to trust it and when to decompose it.',
    readMin: 5,
    room: 'metrics',
    related: ['activation-metrics', 'five-metric-types', 'denominator-discipline'],
    roomLabel: 'Metrics Room',
    content: [
      { type: 'text', text: 'DAU/MAU is the fraction of monthly active users who return on any given day. If your product has 1M MAU and 310K DAU, the ratio is 31% — meaning roughly a third of your monthly users engage daily. The ratio measures habit formation at the population level. A rising DAU/MAU means users are finding reasons to return more frequently. A falling ratio means engagement is becoming less habitual, even if raw DAU is growing because of new user acquisition.' },
      { type: 'heading', text: 'What Good Looks Like' },
      { type: 'text', text: 'Benchmarks vary sharply by product category. Social networks targeting daily communication — Facebook, WhatsApp — can reach 60-65% DAU/MAU because the use case is inherently daily. Twitter/X sits around 25%, reflecting a more intentional check-in pattern. Most consumer apps land below 20%. Utility apps, marketplace apps, and productivity tools often run 10-15% — healthy for their categories. The mistake is applying social network benchmarks to a marketplace product and concluding engagement is low. For Prism video app, a DAU/MAU of 31% is genuinely strong for long-form or mid-form video content, where daily viewing is a real habit rather than the norm.' },
      { type: 'example', label: 'Prism video app: interpreting 31% DAU/MAU', text: 'Prism monthly snapshot:\n- MAU: 2.4M (any user who opened the app in the last 30 days)\n- DAU (30-day average): 744K\n- DAU/MAU: 744K / 2.4M = 31%\n\nContext: YouTube\'s DAU/MAU is estimated ~30-35%. Netflix is lower, ~20-25%, because binge patterns concentrate viewing into fewer, longer sessions. At 31%, Prism users are forming a daily viewing habit — a strong signal that content quality and personalization are working. If this number drops to 22% over 3 months while MAU grows, that\'s a warning: new user acquisition is outpacing habit formation.' },
      { type: 'heading', text: 'The Denominator Problem and Cohort Compression' },
      { type: 'text', text: 'DAU/MAU compresses all cohorts into a single number. A product can have a healthy-looking ratio while old cohort retention is collapsing — if new user acquisition is strong enough, the MAU stays large and the ratio stays flat. To see through this, decompose the ratio by cohort age: what is the DAU/MAU for users acquired 3 months ago? 6 months ago? 12 months ago? If older cohorts show declining ratios, the product is losing its grip on users over time, and the aggregate ratio is masking it.' },
      { type: 'callout', label: 'Key insight', text: 'What counts as "active" in the denominator matters more than most teams acknowledge. If MAU includes anyone who received a push notification and opened the app for 1 second, you\'re measuring notification click rate, not genuine engagement. Define "active" as completing at least one meaningful action — a view, a message sent, a search — and the ratio becomes a true engagement signal rather than a traffic metric.' },
      { type: 'cta', room: 'metrics', label: 'Practice this in the Metrics Room →' },
    ],
  },
  {
    id: 'take-rate',
    category: 'Metrics',
    title: 'Take Rate in Marketplace Analytics: The Metric That Hides Compression',
    summary: 'Take rate = revenue / GMV. Simple formula, complex interpretation. A rising take rate on falling GMV is a warning sign most analysts miss.',
    readMin: 5,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    content: [
      { type: 'text', text: 'Take rate is the fraction of GMV that flows to the marketplace as revenue. It measures monetization efficiency — for every dollar transacted on your platform, how many cents do you keep? A healthy take rate held steady as GMV grows is a signal that the marketplace is scaling without losing its pricing power. A take rate that requires explanation is often the early signal of a deeper competitive or retention problem.' },
      { type: 'heading', text: 'Industry Benchmarks' },
      { type: 'text', text: 'Take rates vary widely by category and competitive intensity. Airbnb runs approximately 14% (blended host and guest fees). Uber is closer to 25% on rides, though this varies by city and product tier. Etsy has historically run around 6-7% before recent fee increases. Crafted marketplace, targeting handmade goods with a premium positioning, runs 12%. These numbers reflect not just what the marketplace wants to charge but what the market will bear — sellers who find the take rate too high will build direct channels or move to competitors.' },
      { type: 'example', label: 'Crafted take rate: 12% → what happens at 15%?', text: 'Current state: GMV $10M/month, take rate 12%, revenue $1.2M/month.\nSeller base: 8,400 active sellers, average GMV per seller $1,190/month.\nSeller economics: median seller margin on Crafted ~28% before fees → 16% net after 12% take rate.\n\nAt 15% take rate:\n- Revenue on same GMV: $1.5M/month (+$300K)\n- Seller net margin falls to 13% — below the threshold for many hobbyist sellers\n- Estimated seller churn at higher fee: 15-20% of seller base based on price sensitivity surveys\n- GMV impact of seller churn: -$1.5M to -$2M/month\n- Net revenue impact: +$300K (fee increase) − ~$270K (GMV loss × 15%) = essentially flat, with lasting supply damage.' },
      { type: 'heading', text: 'The Ceiling-and-Floor Dynamic' },
      { type: 'text', text: 'Take rate operates between a ceiling and a floor. The ceiling is set by buyer and seller alternatives — if competitors charge less, you\'ll lose supply or demand. The floor is set by your cost structure — you need enough revenue to fund trust/safety, payments infrastructure, customer support, and product development. Between these bounds, you have pricing latitude. But the bounds compress as your marketplace matures: more established sellers have more alternatives, and as competitors scale, the ceiling drops. The take rate you can sustain at 10M GMV per month is often not the take rate you can sustain at 100M.' },
      { type: 'callout', label: 'Key insight', text: 'Rising take rate on rising GMV is healthy — the market is accepting your price. Rising take rate on flat or falling GMV is a warning: you\'re extracting more from a shrinking base, which is unsustainable. Monitor the two numbers together, not independently.' },
      { type: 'cta', room: 'metrics', label: 'Practice this in the Metrics Room →' },
    ],
  },
  {
    id: 'metric-ownership',
    category: 'Metrics',
    title: 'Metric Ownership: Defining Formula, Grain, Numerator, and Denominator Before You Measure Anything',
    summary: 'You cannot have a metric conversation until all four are locked. This is what metric ownership means in practice, and what weak ownership looks like in an interview.',
    readMin: 6,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    content: [
      { type: 'text', text: 'Metric drift — when the same metric name means different things to different teams — is one of the quietest and most damaging problems in a data organization. The product team\'s retention rate and the marketing team\'s retention rate can diverge by 15 percentage points while using the same word, because they have different denominators, different inactivity thresholds, and different cohort definitions. Metric ownership is the discipline that prevents this. And unclear ownership is the structural condition that causes it.' },
      { type: 'heading', text: 'Accountability vs Influence' },
      { type: 'text', text: 'Ownership does not mean being the only team that affects a metric. Retention is affected by product (core experience), engineering (reliability, performance), marketing (which users are acquired), and customer success (support quality). All four teams influence it. But only one team is accountable — the team that defines the metric, monitors it, investigates anomalies, and makes the call on whether a change represents a real shift. Confusing "influences" with "is accountable for" produces finger-pointing when the metric moves and inaction when it stagnates, because everyone thinks someone else is on it.' },
      { type: 'example', label: 'Retention ownership map for Threadline SaaS', text: 'Metric: 90-day seat retention rate (seats still active 90 days after activation).\nAccountable: Product team — defines the metric, sets the threshold, monitors the trend, owns the response plan.\nInfluences:\n- Engineering: platform reliability → downtime events depress retention directly\n- Marketing: acquisition quality → cohorts from high-intent channels retain better\n- Customer success: onboarding handoff → accounts with a CS touch in first 30 days retain 22pp higher\n- Sales: contract structure → annual contracts retain at 91% vs monthly at 67%\n\nProduct owns the metric. The other teams appear in the root cause tree when retention moves, but they don\'t redefine the metric or run their own versions of it.' },
      { type: 'heading', text: 'The Ownership Declaration' },
      { type: 'text', text: 'Strong metric ownership means being able to recite four things instantly: the formula (retention = seats active at day 90 / seats activated), the grain (one row = one seat, measured at the account level), the numerator definition (active = at least one user in the seat logged in within the last 7 days), and the denominator definition (activated = seat assigned to a named user and first login completed). When any of these four elements is fuzzy — when the analyst says "I\'d have to check how we count active" — ownership is weak and the metric is drifting.' },
      { type: 'callout', label: 'Key insight', text: 'Metric drift is almost always a governance failure, not an analytical one. The fix is not better SQL — it\'s assigning one owner, writing the metric spec (formula + grain + numerator + denominator), publishing it to a shared source of truth, and reviewing it when the product changes. The metric spec is the contract that prevents divergence.' },
      { type: 'cta', room: 'metrics', label: 'Practice this in the Metrics Room →' },
    ],
  },
  {
    id: 'business-impact-translation',
    category: 'Metrics',
    title: 'Business Impact Translation: Putting a Dollar Number on Every Metric Movement',
    summary: '[N users] × [lift] × [ARPU] = $[impact]. Interviewers remember the candidate who put a number on it. Here\'s the formula and when to apply it.',
    readMin: 6,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    content: [
      { type: 'text', text: 'Analysts who present metric movements in percentage terms get acknowledged. Analysts who translate those movements into dollar impact get remembered. The difference is not sophistication — it\'s one additional step that requires knowing a few business inputs and being willing to commit to a number. Most analysts skip it because they\'re afraid of being wrong. The solution is a range, not a refusal.' },
      { type: 'heading', text: 'The Formula' },
      { type: 'text', text: 'Business impact = delta × volume × value. Delta is the metric lift (a percentage point or absolute change). Volume is the scale at which the delta applies (monthly sessions, active users, transactions). Value is what each unit is worth in revenue terms (AOV for a purchase CVR lift, ARPU for a retention lift, take rate × AOV for a marketplace). Multiply the three together and you have a revenue impact estimate. The inputs are usually available from your analytics stack, your finance team, or reasonable public benchmarks.' },
      { type: 'example', label: '+0.5pp CVR on 2M sessions at $45 AOV', text: 'Experiment result: Checkout flow redesign lifts CVR by +0.5pp (from 3.2% to 3.7%).\nMonthly volume: 2,000,000 sessions.\nAOV: $45.\n\nDelta: +0.005 (0.5 percentage points)\nAdditional purchases: 2,000,000 × 0.005 = 10,000 purchases/month\nRevenue impact: 10,000 × $45 = $450,000/month\nAnnualized: $5.4M/year\n\nUncertainty range: Experiment CI on CVR lift is [+0.2pp, +0.8pp]. Revenue range = $180K to $720K/month. Present as: "We estimate $450K/month in incremental revenue, with a plausible range of $180K to $720K depending on whether the lift holds at the lower end of the confidence interval."' },
      { type: 'heading', text: 'How to Handle Uncertainty' },
      { type: 'text', text: 'The point estimate ($450K/month) is useful. The range is what makes you credible. Anyone can multiply three numbers. An analyst who also communicates the uncertainty — and explains where it comes from (experiment confidence interval, assumption about AOV stability, question about whether the CVR lift holds outside the experiment window) — is demonstrating the kind of statistical reasoning that distinguishes senior analytical work. Present the range, explain the main sources of uncertainty, and be clear about what you\'re assuming.' },
      { type: 'callout', label: 'Key insight', text: 'The inputs matter more than the formula. A wrong volume assumption (using total users instead of the users affected by the change) will produce an impact estimate that\'s off by 10x. Before computing, verify: what is the exact population this delta applies to? What is the right value-per-unit for this type of metric movement? Getting these two inputs right makes the estimate defensible even if the lift estimate has uncertainty.' },
      { type: 'cta', room: 'cases', label: 'Practice business impact translation in the Cases Room →' },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // ROOT CAUSE ANALYSIS
  // ══════════════════════════════════════════════════════════════
  {
    id: 'cdshv-framework',
    category: 'RCA',
    title: 'CDSHV: The Step-by-Step RCA Framework That Beats Guessing',
    summary: 'Context → Decompose → Segment → Hypothesize → Validate. Five stages that keep your RCA structured when pressure is high and data is ambiguous.',
    readMin: 5,
    room: 'rca',
    roomLabel: 'RCA Room',
    content: [
      { type: 'text', text: 'Root cause analysis fails in a predictable way: the analyst jumps straight to hypotheses, picks the most plausible one, and starts querying for evidence. If the first hypothesis is wrong, they try the second. By the third, they\'ve burned an hour and still don\'t know what broke. CDSHV — Context, Decompose, Segment, Hypothesize, Validate — is the structured alternative. It forces you to understand the shape of the problem before naming a cause, which means your first hypothesis is informed rather than guessed.' },
      { type: 'heading', text: 'The Five Steps' },
      { type: 'text', text: 'Context means getting a precise description of what moved, when it started, and what changed recently. You want the metric name, the window, the magnitude, and the deployment history. Decompose means separating the metric into its mathematical components — numerator vs denominator for rate metrics, additive segments for volume metrics — to locate which part actually moved. Segment means cutting the decomposed metric by platform, user type, geography, and cohort to find where the movement is concentrated. Only after these three steps do you Hypothesize: generate the two or three most plausible causes consistent with what decomposition and segmentation revealed. Finally, Validate: identify the specific data point that would confirm or rule out each hypothesis, and query for it.' },
      { type: 'example', label: 'CDSHV applied: checkout CVR drops 8%', text: 'Context: Crafted marketplace checkout CVR dropped from 71% to 65% (-8% relative). Started Monday at 11am. A frontend deployment shipped Monday at 10:45am.\n\nDecompose: Checkout attempts (denominator) flat. Completed checkouts (numerator) down -8%. Movement is in completions, not attempts — the problem is in the checkout flow itself, not in what drives users to start checkout.\n\nSegment: iOS flat. Android down -19%. Desktop flat. The drop is entirely on Android.\n\nHypothesize: (1) Monday\'s deployment introduced an Android-specific rendering bug on the payment step. (2) A third-party payment SDK update broke on Android. (3) Android deep link routing changed and is dropping users at the payment confirmation screen.\n\nValidate: Pull Android checkout funnel step-by-step. If drop is at the payment confirmation step, hypothesis 1 or 2. Query Sentry for Android JS errors introduced after 10:45am — if payment-related errors spike, it\'s the deployment.' },
      { type: 'callout', label: 'The most common shortcut — and why it loses', text: 'The step most analysts skip is Decompose. They go Context → Segment → Hypothesize, cutting by platform and user type before understanding whether the rate movement is in the numerator or denominator. This produces hypotheses that explain the wrong thing. A denominator-driven rate drop (more users entering checkout) has different root causes than a numerator-driven drop (fewer completing). Decomposing first takes 60 seconds and eliminates half the hypothesis space.' },
      { type: 'text', text: 'In a 10-minute interview setting, CDSHV compresses naturally. Context takes 60 seconds — "checkout CVR dropped 8%, started Monday, deployment shipped Monday morning." Decompose takes 30 seconds — "numerator or denominator, I\'d check both." Segment takes 2 minutes — "platform, device, new vs returning." Hypothesize takes 2 minutes — two or three specific hypotheses grounded in what segmentation showed. Validate takes 2 minutes — name the exact query or dashboard that confirms each. That\'s a structured, complete RCA in under 10 minutes.' },
      { type: 'cta', room: 'rca', label: 'Practice this in the RCA Room →' },
    ],
  },
  {
    id: 'decompose-before-diagnose',
    category: 'RCA',
    title: 'Decompose Before You Diagnose: Why Jumping to Hypotheses Loses',
    summary: 'Listing hypotheses before decomposing is the most common RCA mistake in interviews and in real work. The order matters more than the hypotheses themselves.',
    readMin: 6,
    room: 'rca',
    roomLabel: 'RCA Room',
    content: [
      { type: 'text', text: 'The single most common mistake in root cause analysis — in interviews and in real work — is jumping to hypotheses before decomposing the metric. Someone tells you "checkout completion rate dropped 15%" and immediately you hear: "probably a bug in the payment flow," "maybe a mobile UI issue," "could be a promo code problem." These might all be valid hypotheses. But you don\'t know which to investigate first, whether the metric moved for structural reasons unrelated to any of them, or whether your hypotheses are even in the right ballpark — because you haven\'t looked at the data yet.' },
      { type: 'heading', text: 'Why Decomposition Comes First' },
      { type: 'text', text: 'Decomposition answers a question that hypotheses can\'t: is the metric movement in the numerator, the denominator, or both? This distinction matters enormously. If checkout completion rate dropped because checkout attempts increased (denominator) while completions held flat, the problem isn\'t in the checkout flow — it\'s in whatever is driving more low-intent users into checkout. If completions dropped while attempts held flat, then yes, the checkout flow is the right place to look. Hypotheses about payment bugs and UI issues only apply to the second case. Generating them before decomposing wastes investigation time on the wrong branch.' },
      { type: 'example', label: 'Checkout drop: decompose first', text: 'Alert: Checkout completion rate dropped from 72% to 61% (-15%).\n\nDecompose before hypothesizing:\n- Checkout attempts (denominator): 14,200 → 15,800 (+11%)\n- Completed checkouts (numerator): 10,224 → 9,638 (-5.7%)\n\nThe rate dropped because BOTH the numerator fell AND the denominator rose. This isn\'t one problem — it\'s two. Completions are slightly down (investigate checkout flow), but attempts are way up (investigate what drove more users to checkout — a campaign? a landing page change? a navigation change?).\n\nHypothesizing about payment bugs before decomposing would have missed the denominator story entirely.' },
      { type: 'heading', text: 'The Decomposition Discipline' },
      { type: 'text', text: 'For any rate metric (CVR, completion rate, click-through rate, retention), the first move is always to separate numerator from denominator and check each independently. This takes 60 seconds in most analytics tools and eliminates half of all RCA rabbit holes before they start. It\'s the equivalent of checking whether the patient has a pulse before diagnosing the specific illness.' },
      { type: 'text', text: 'For volume metrics (total purchases, total sessions, total messages), the decomposition is different: break the total into its constituent parts. Total purchases = mobile purchases + desktop purchases. Is the drop in both platforms, or concentrated in one? Total sessions = new user sessions + returning user sessions. Did new acquisition dry up, or did returning users stop coming back? Decomposing by additive component tells you the scope and likely source of the problem before you generate a single hypothesis.' },
      { type: 'callout', label: 'The order that works', text: '1. Get context: what exactly moved, when did it start, what changed recently?\n2. Decompose: numerator vs denominator (for rate metrics), or by additive component (for volume metrics).\n3. Segment: platform, device, geography, user cohort, new vs returning.\n4. Only then: hypothesize based on what decomposition and segmentation revealed.\n5. Validate: pick the highest-probability hypothesis and identify the data that would confirm or rule it out.' },
      { type: 'heading', text: 'The Interview Implication' },
      { type: 'text', text: 'In an interview, when you hear "metric X dropped Y%," the panel is watching to see whether you decompose before diagnosing. If you immediately say "here are five hypotheses," you\'ve skipped the most important step. Instead, say: "Before I generate hypotheses, I want to decompose the metric to understand where the movement is. For a rate metric like this, I want to check the numerator and denominator separately, because a drop in the rate could come from a numerator problem, a denominator problem, or both — and those have different root causes." That sentence alone demonstrates more analytical maturity than a list of five hypotheses.' },
      { type: 'list', items: [
        'For rate metrics: check numerator and denominator independently before generating any hypotheses.',
        'For volume metrics: decompose into additive components (platform, user type, product category) before explaining the aggregate.',
        'The decomposition tells you which hypotheses are plausible. Generate hypotheses after you see the decomposition, not before.',
        'In interviews: explicitly narrate the decomposition step. The panel rewards the process, not just the answer.',
      ]},
      { type: 'cta', room: 'rca', label: 'Practice RCA decomposition in the RCA Room →' },
    ],
  },
  {
    id: 'segment-before-aggregate',
    category: 'RCA',
    title: 'The Aggregate Is Always Hiding Something',
    summary: 'A flat aggregate is a weighted average of segment movements. Platform, cohort, and time-pattern cuts first — every time. Here\'s the sequence that works.',
    readMin: 6,
    room: 'rca',
    roomLabel: 'RCA Room',
    content: [
      { type: 'text', text: 'An aggregate metric is a weighted average of its underlying segments. When the aggregate holds flat, that\'s not the same as nothing happening — it often means two things are moving in opposite directions and canceling each other out. When the aggregate drops, it might be driven by one small segment while everything else holds steady. The aggregate hides this structure. Segmentation reveals it.' },
      { type: 'heading', text: 'The Flat Aggregate Trap' },
      { type: 'text', text: 'Suppose overall 7-day retention is flat at 32% week over week. You might conclude there\'s no retention problem. But cut it by platform: iOS retention is up from 34% to 38%, and Android retention is down from 30% to 22%. The aggregate is flat because the iOS improvement is masking a major Android regression. Without the segment cut, you\'d have missed an active fire.' },
      { type: 'example', label: 'Simpson\'s paradox in practice', text: 'Overall CVR: Week 1 = 4.2%, Week 2 = 4.1% (looks flat)\n\nCut by user type:\n- New users: Week 1 = 2.1%, Week 2 = 3.4% (improving)\n- Returning users: Week 1 = 6.8%, Week 2 = 5.2% (declining)\n\nThe aggregate is flat because mix shifted: more new users this week (who convert at lower rates) offset improving new-user CVR, while returning-user CVR quietly collapsed. Investigating the aggregate "flat" metric would miss both stories. Segmentation reveals two separate problems requiring different investigations.' },
      { type: 'heading', text: 'The Segmentation Sequence' },
      { type: 'text', text: 'There is a sequence to segmentation that maximizes signal per query. Start with the cuts most likely to reveal structural differences: platform (iOS vs Android vs web), user type (new vs returning), geography (if your product has regional variation), and device type. These cuts cost almost nothing to run and often isolate the problem immediately. After these structural cuts, move to behavioral cuts: power users vs casual users, users who completed onboarding vs those who didn\'t, users in a specific feature cohort.' },
      { type: 'text', text: 'The worst segmentation strategy is random — cutting by every dimension until something looks significant. This produces false positives and wastes time. The best strategy is hypothesis-driven: you decompose first (numerator vs denominator), then segment along the dimensions most likely to explain the decomposition result. If checkout attempts spiked, segment by traffic source — was it a specific campaign that drove low-intent users? If completions dropped, segment by device — is this a mobile rendering bug?' },
      { type: 'heading', text: 'Simpson\'s Paradox' },
      { type: 'text', text: 'Simpson\'s paradox is the formal name for the phenomenon where a trend that appears in every subgroup disappears or reverses in the aggregate. It arises when segment sizes change at the same time the segment rates change. In product analytics, it appears most often in A/B test results (treatment appears worse in aggregate but better in every segment, because control had more of the high-converting segment), in retention analysis (product appears to be retaining users better, but actually composition shifted toward users with higher baseline retention), and in cohort comparisons (new cohorts appear weaker, but they\'re just newer).' },
      { type: 'callout', label: 'The segmentation checklist', text: 'Before concluding anything from an aggregate metric:\n1. Platform cut: iOS / Android / web\n2. User type cut: new / returning / power\n3. Geography cut (if relevant to your product)\n4. Time pattern cut: day of week, hour of day, before/after deployment\n5. Cohort cut: acquisition week or month\n\nIf the aggregate moves but no segment shows a proportional move, you have a mix shift — not a behavior change.' },
      { type: 'list', items: [
        'Never conclude from an aggregate without at least two segment cuts.',
        'A flat aggregate is not a clean bill of health. Check for opposing segment movements.',
        'When one segment explains the full aggregate movement, the other segments are your control.',
        'For A/B test readouts, always segment by user type before reporting the headline number.',
      ]},
      { type: 'cta', room: 'rca', label: 'Practice segmentation in the RCA Room →' },
    ],
  },
  {
    id: 'rca-walkthrough-search',
    category: 'RCA',
    title: 'Search CVR Dropped 15%: A Full RCA Walkthrough',
    summary: 'Step by step from alert to root cause — decomposing the funnel, cutting by segment, forming hypotheses, and deciding what to validate first.',
    readMin: 5,
    room: 'rca',
    roomLabel: 'RCA Room',
    content: [
      { type: 'text', text: 'It\'s Tuesday morning. A Slack alert fires: "Zero-result search rate up 40% over the last 24 hours." Your job is to find the root cause. This walkthrough traces the full investigation — not as a checklist, but as a story with decisions at each step, because that\'s how real RCA works. The path matters as much as the destination.' },
      { type: 'heading', text: 'Step 1: Decompose Before Anything Else' },
      { type: 'text', text: 'The first instinct is to look at what queries are returning zero results. Resist it. First, decompose the metric. Zero-result rate = zero-result searches / total searches. So: is total search volume up (denominator effect), or are zero-result searches specifically up (numerator effect), or both? You pull the data. Total search volume is flat — 180,000 searches yesterday vs 182,000 the day before. Zero-result searches are up: 27,000 yesterday vs 19,000 the day before. This is a numerator story. Something is causing searches that previously returned results to return nothing.' },
      { type: 'example', label: 'Decompose: what actually moved?', text: 'Monday: 182,000 total searches, 19,000 zero-result → 10.4% zero-result rate\nTuesday: 180,000 total searches, 27,000 zero-result → 15.0% zero-result rate\n\nDenominator (total searches): -1.1% — essentially flat. Not the driver.\nNumerator (zero-result searches): +42% — the entire story is here.\n\nConclusion before segmenting: something changed about how searches are processed or matched, causing previously-successful queries to fail. The hypothesis space is now: (1) query processing changed, (2) index changed, (3) filter logic changed.' },
      { type: 'heading', text: 'Step 2: Segment to Find Concentration' },
      { type: 'text', text: 'Now segment. Platform cut first: iOS zero-result rate is 10.5%, desktop is 10.7%, Android mobile app is 28.3%. The jump is concentrated entirely in Android. Specifically, you check app versions: Android app v4.2, released Monday afternoon, shows a 3× higher zero-result rate than v4.1. Every other platform and version is normal. This narrows the hypothesis space dramatically. It\'s not an index issue (that would affect all platforms). It\'s something specific to Android v4.2.' },
      { type: 'text', text: 'You check the v4.2 release notes. One change: a new autocomplete filter that removes queries under 3 characters before sending them to the search backend, intended to reduce noise from accidental taps. The implementation detail: the filter is trimming trailing spaces, so "bag " (with a trailing space, which is how most mobile autocomplete selections land) becomes "bag" — which is fine — but it\'s also stripping mid-query characters in some edge cases, producing truncated queries that don\'t match any listings. That\'s the mechanism.' },
      { type: 'callout', label: 'Key insight', text: 'The investigation found the answer not by looking at what queries were failing (though that would have been next), but by segmenting to find where the zero-result rate was concentrated. Platform and app version cuts immediately pointed to the Monday deployment. The story was in the segmentation, not the query content.' },
      { type: 'cta', room: 'rca', label: 'Practice this in the RCA Room →' },
    ],
  },
  {
    id: 'rca-vs-sizing-vs-causal',
    category: 'RCA',
    title: 'RCA vs Opportunity Sizing vs Causal Validation: Three Different Tools',
    summary: 'Treating these as the same thing is a common failure mode. Each has a different structure, data requirement, output format, and business implication.',
    readMin: 4,
    room: 'rca',
    roomLabel: 'RCA Room',
    content: [
      { type: 'text', text: 'Three questions that sound similar but require completely different analytical tools: "Our GMV dropped 12% — why?" "Should we build a saved-search feature?" "Does sending a follow-up email cause users to complete their purchase?" All three involve data. All three produce insights. But each requires a different structure, different data, and a different output. Running the wrong tool is one of the most common and costly mistakes in product analytics.' },
      { type: 'heading', text: 'RCA: Something Broke — Find It' },
      { type: 'text', text: 'Root cause analysis starts with an observed anomaly — a metric that moved unexpectedly — and works backward to identify the cause. The question is diagnostic: what happened? The method is decomposition and segmentation. The output is a specific, named cause with evidence. The data requirement is historical: what was happening before vs after the change? RCA does not need an experiment. It uses observational data to find where a known break occurred.' },
      { type: 'heading', text: 'Opportunity Sizing: How Big Is This?' },
      { type: 'text', text: 'Sizing answers a forward-looking question: how much value is there to capture if we solve this problem or ship this feature? The method is estimation with explicit assumptions. The output is a range (not a point estimate). The data requirement is baseline rates, addressable populations, and comparable benchmarks. Sizing is prospective — you\'re estimating future impact, not explaining past behavior. It\'s appropriate before an experiment is designed, to decide whether the experiment is worth running at all.' },
      { type: 'example', label: 'Same situation — three different tools', text: 'Threadline SaaS: trial-to-paid conversion rate drops from 22% to 17% over two months.\n\nRCA question: "Why did it drop?" → Decompose by cohort, segment by acquisition source, segment by feature usage. Find that users acquired from a specific paid channel convert at 8% vs 28% for organic. The channel mix shifted. That\'s the root cause.\n\nSizing question: "How much would we gain if we fixed onboarding for the low-converting cohort?" → Addressable group: 340 users/month from the underperforming channel. Realistic CVR recovery: 8% → 15%. Incremental conversions: 340 × 0.07 = ~24/month. ACV: $1,200. Annual impact: 24 × $1,200 = ~$29K/year. Worth a small sprint, not a major initiative.\n\nCausal question: "Does our in-app onboarding checklist cause conversion?" → Run an A/B test. Neither RCA nor sizing can answer this.' },
      { type: 'callout', label: 'The diagnostic question to ask first', text: 'Before starting any analysis, ask: "Am I explaining a past anomaly (RCA), estimating future potential (sizing), or establishing causation (experiment)?" The answer determines your method. Using a regression analysis when you need an RCA will produce a correlation where you need a mechanism. Running an RCA when you need a causal claim will give you a plausible story without the evidence to act on it.' },
      { type: 'cta', room: 'rca', label: 'Practice this in the RCA Room →' },
    ],
  },
  {
    id: 'mix-shift',
    category: 'RCA',
    title: 'Mix Shift: The Hidden Cause Behind Half Your Metric Movements',
    summary: 'Revenue grew but margin fell. CVR improved but GMV didn\'t. Mix shift causes movements that look wrong until you understand the composition change underneath.',
    readMin: 4,
    room: 'rca',
    roomLabel: 'RCA Room',
    content: [
      { type: 'text', text: 'Mix shift is a change in the composition of your population, not a change in behavior. When the composition changes, aggregate metrics move — even if nothing about individual users, sellers, or products actually changed. Mix shift is responsible for roughly half of the metric movements that analysts initially misdiagnose as behavioral changes. It\'s not that something broke or improved. It\'s that who you\'re measuring changed.' },
      { type: 'heading', text: 'The Shift-Share Decomposition' },
      { type: 'text', text: 'The formal way to diagnose mix shift is the shift-share decomposition. Any change in an aggregate metric equals the sum of two components: the within-segment change (did each segment\'s rate actually change?) and the composition change (did the mix of segments shift?). If the aggregate moved but every segment\'s rate held flat, the entire movement is composition — pure mix shift. If segments moved and the composition held flat, it\'s pure behavioral change. Most real situations are some combination of both, and the decomposition tells you how much of each.' },
      { type: 'example', label: 'Crafted marketplace: GMV per seller up 8%, but not what it looks like', text: 'Last month vs this month:\n- Overall GMV per active seller: $1,190 → $1,285 (+8%)\n\nFirst instinct: sellers are getting more productive. But decompose by segment:\n- SMB sellers (avg $820/month): flat at $820\n- Mid-market sellers (avg $2,400/month): flat at $2,390\n- Enterprise sellers (avg $12,000/month): flat at $12,050\n\nNot a single segment moved meaningfully. Now check the mix:\n- SMB sellers: 78% of active sellers last month → 68% this month\n- Enterprise sellers: 5% last month → 12% this month\n\nThe aggregate GMV per seller went up 8% entirely because the enterprise segment grew as a share of the base. No individual seller became more productive. This is mix shift, not improvement. The right story for the PM: "Our enterprise cohort is growing faster than SMB, which is pulling up the average. Seller productivity within each tier is flat."' },
      { type: 'callout', label: 'How to identify mix shift vs real signal', text: 'Run the shift-share decomposition:\n1. Compute the metric for each segment separately for both periods.\n2. If segment rates moved: behavioral change is present.\n3. If segment rates held flat but the aggregate moved: pure mix shift.\n4. To quantify: what would the aggregate be if the mix were the same as last period? Compute this counterfactual and subtract from the actual aggregate. The difference is the mix shift contribution.' },
      { type: 'text', text: 'Mix shift also explains why A/B test results can look different at the aggregate level vs the segment level. If your treatment disproportionately reached enterprise users (higher converters), aggregate CVR in treatment will look elevated even if the treatment had zero causal effect on anyone. This is why segmenting A/B test readouts by user type is as important as checking the aggregate result.' },
      { type: 'cta', room: 'rca', label: 'Practice this in the RCA Room →' },
    ],
  },
  {
    id: 'rca-notification-fatigue',
    category: 'RCA',
    title: 'D7 Retention Is Falling. Is It Notification Fatigue or Something Else?',
    summary: 'Diagnosing retention drops requires layered cuts — platform, cohort, feature usage, and notification cadence. Walk through the analysis tree.',
    readMin: 5,
    room: 'rca',
    roomLabel: 'RCA Room',
    content: [
      { type: 'text', text: 'Prism\'s D7 retention has been dropping for three weeks. It started subtly — 34%, 32%, 31% — and is now at 28%, below the threshold where the growth team gets nervous. The retention drop is real, not seasonal: the prior four cohorts show a consistent decline. Something changed. The job is to find what.' },
      { type: 'heading', text: 'Establish the Pattern Before Naming a Cause' },
      { type: 'text', text: 'The first step is not generating hypotheses. It\'s establishing the pattern. When did the decline start? Three weeks ago, specifically with the cohort that onboarded on the day notification volume was increased from an average of 2.4/day to 7.1/day per user. That timing correlation is not a coincidence — but it\'s not proof either. It sets the leading hypothesis. The investigation now tests whether users who received more notifications retained worse, controlling for other factors.' },
      { type: 'example', label: 'Retention by notification volume: the pattern emerges', text: 'D7 retention segmented by average daily notifications received in first 7 days (post-volume increase cohorts only):\n\n0–2 notifications/day → D7 retention: 41%\n3–5 notifications/day → D7 retention: 37%\n6–8 notifications/day → D7 retention: 29%\n9+ notifications/day → D7 retention: 18%\n\nUsers receiving 9+ notifications/day retain at 18% vs 41% for low-notification users — a 54% relative difference. This is a dose-response relationship, which is strong evidence that notification volume is the mechanism, not a coincidence.' },
      { type: 'heading', text: 'Distinguishing Fatigue from Other Causes' },
      { type: 'text', text: 'Notification fatigue has a specific mechanism: heavy notification volume → push opt-out → user loses the re-engagement hook → doesn\'t return. To confirm this vs alternative causes (content quality decline, app performance issues, competitor), check the opt-out sequence. For users who churned in high-notification groups: did they disable push notifications before going inactive? In the data: 71% of churned users in the 9+ group disabled push within the first 4 days, before going inactive. Users who kept notifications on in the same group retained at 31% — not great, but 70% better than the opt-out group.' },
      { type: 'text', text: 'The alternative causes can be ruled out with quick cuts. App crash rate is flat across the period. Content quality (measured by completion rate) is flat. DAU/MAU among users who never opted out of notifications is stable. The retention drop is specifically in users who received heavy notifications and subsequently opted out. The mechanism is confirmed: notification volume → opt-out → churn.' },
      { type: 'callout', label: 'How to distinguish fatigue from other retention drivers', text: 'Notification fatigue leaves a specific fingerprint: (1) push opt-out rate rises in the same cohort that shows retention decline, (2) opt-out precedes inactivity (not the reverse), (3) retention decline is concentrated in high-notification-volume users, not uniformly distributed. If opt-outs aren\'t elevated, look elsewhere — content quality, app performance, competitive pressure, or onboarding gaps.' },
      { type: 'cta', room: 'rca', label: 'Practice this in the RCA Room →' },
    ],
  },
  {
    id: 'data-availability-thinking',
    category: 'RCA',
    title: 'Data Availability Thinking: Map What You Have, What You\'re Missing, and What the Gap Means',
    summary: 'Assuming all data exists is a red flag. Senior analysts name the table, grain, and join logic — and acknowledge gaps without using them as an excuse to stop.',
    readMin: 6,
    room: 'rca',
    roomLabel: 'RCA Room',
    content: [
      { type: 'text', text: 'Before running any analysis, senior analysts map the data landscape. Not just "what tables exist," but: what events are tracked and what aren\'t, where the gaps are, what the grain of each dataset is, and how the pieces join together. Skipping this step produces analysis that quietly answers the wrong question — you measure what you can measure and present it as if it were the thing you wanted to measure, without acknowledging the gap.' },
      { type: 'heading', text: 'The Four Common Data Gaps' },
      { type: 'text', text: 'You only see actions users take, not actions they don\'t take. If a user visits a product page and leaves without clicking, you have the page view event. You don\'t have a "considered and rejected" event. This means your analysis of what drives conversion is built entirely on users who converted, not on users who considered and didn\'t. Multi-device attribution is another gap: a user who researches on mobile and purchases on desktop appears as two separate users in most event logs unless you have a robust identity resolution layer. Offline-to-online conversion is invisible unless explicitly instrumented. And deleted or churned accounts create survivorship bias — your retention analysis excludes users who deleted their accounts, which is exactly the population you most need to understand.' },
      { type: 'example', label: 'Crafted marketplace: mapping the available data', text: 'Question: "Why are new sellers cancelling orders at higher rates?"\n\nAvailable data:\n- orders table: grain = one row per order, has status (completed/cancelled), seller_id, created_at\n- sellers table: grain = one row per seller, has join_date, seller_tier, listing_count\n- events table: grain = one row per event, has seller_id, event_type (listing_created, order_received, etc.)\n\nGaps:\n- No seller inventory data: can\'t confirm whether cancellations are due to out-of-stock vs. changed mind\n- No seller communication logs: can\'t see if buyers requested modifications that triggered cancellations\n- No pre-cancellation seller activity: events table shows activity but not absence of activity (seller who received order but took no action)\n\nProxy for inventory issue: "In the absence of inventory data, I\'d use the pattern of same-SKU cancellations within 24 hours as a proxy for stock-out driven cancellations, with the caveat that this undercounts if the seller manually cancels stock-out orders immediately."' },
      { type: 'heading', text: 'The Proxy Formulation' },
      { type: 'text', text: 'The professional phrasing when you hit a data gap is: "In the absence of data on X, I\'d proxy it with Y, with the caveat that Y underestimates / overestimates X in situations where Z." This formulation does three things: it acknowledges the gap honestly, it proposes a path forward, and it names the conditions under which the proxy breaks down. All three parts are required. Stopping at "we don\'t have that data" is incomplete — it describes a constraint without offering a response. Proceeding without naming the gap is worse — it hides the limitation.' },
      { type: 'callout', label: 'The data availability checklist', text: 'Before any analysis, answer:\n1. What events are tracked? What isn\'t tracked that I wish I had?\n2. What is the grain of each relevant table? Can I join them without changing the grain?\n3. Are there deleted/inactive records excluded from the base tables? (survivorship bias)\n4. For multi-device or multi-session users, does my analysis correctly attribute behavior to the right user?\n5. For each data gap, what is the best available proxy, and what are its limitations?' },
      { type: 'cta', room: 'rca', label: 'Practice this in the RCA Room →' },
    ],
  },
  {
    id: 'rca-seller-quality',
    category: 'RCA',
    title: 'Marketplace Cancellations Are Spiking: A Seller Quality RCA',
    summary: 'When buyer-facing metrics deteriorate, the root cause is often supply-side. Walk through a seller quality diagnosis with segment cuts and validation steps.',
    readMin: 5,
    room: 'rca',
    roomLabel: 'RCA Room',
    content: [
      { type: 'text', text: 'Crafted marketplace\'s order cancellation rate moved from 6.1% to 9.4% over six weeks — a 54% relative increase. Buyer satisfaction scores are starting to reflect it. The PM\'s instinct is that something changed in the checkout flow. Before building that hypothesis, decompose the metric to find where the cancellations are occurring in the order lifecycle.' },
      { type: 'heading', text: 'Step 1: Decompose by Order Stage' },
      { type: 'text', text: 'Cancellations can happen at three stages: pre-order (buyer cancels before seller confirms), post-order pre-shipment (seller cancels after accepting), and post-shipment (rare, usually returns). Pull the breakdown. Pre-order cancellations: flat at 1.2%. Post-shipment: flat at 0.3%. Post-order pre-shipment: up from 4.6% to 7.9%. The cancellation spike is entirely seller-initiated, after the order is placed but before it ships. This rules out the checkout flow immediately — the buyer completed checkout. The seller is the actor in the broken step.' },
      { type: 'example', label: 'Segment: new sellers vs experienced sellers', text: 'Cancellation rate (post-order, pre-shipment) segmented by seller order history:\n\nSellers with 50+ completed orders: 2.1% cancellation rate (flat vs prior period)\nSellers with 10–49 completed orders: 4.8% cancellation rate (+0.4pp, within noise)\nSellers with 1–9 completed orders: 19.4% cancellation rate (up from 6.2%, +13.2pp)\n\nNew sellers (<5 orders) specifically: 24.1% cancellation rate\n\nThe spike is entirely in new sellers. Experienced sellers are cancelling at the same rate as always. This is a new-seller onboarding problem, not a marketplace-wide quality degradation.' },
      { type: 'heading', text: 'Hypothesize and Validate' },
      { type: 'text', text: 'With the segment identified, the hypothesis space is narrow: why would new sellers — specifically those with fewer than 10 orders — suddenly be cancelling at much higher rates? The most plausible hypotheses: (1) the onboarding flow doesn\'t set inventory expectations, so new sellers list items they don\'t have in stock; (2) a recent onboarding change brought in a cohort of lower-commitment sellers; (3) the new seller interface shows how to accept an order but not how to update inventory or pause listings. To validate: pull the timing of cancellations — do they cluster immediately after order acceptance (suggesting confusion) or days later (suggesting stock-out discovery)? Also check whether the spike correlates with the date of any onboarding flow change.' },
      { type: 'callout', label: 'The supply-side RCA pattern', text: 'Buyer-facing metric degradations in marketplaces frequently trace to supply-side quality issues. Whenever a buyer-facing metric moves (cancellation rate, delivery time, rating), decompose by who is the actor in the broken step. If it\'s the seller, segment by seller cohort, tenure, and tier. New seller cohorts are the most common source of quality spikes, because onboarding typically under-invests in operational expectation-setting relative to acquisition incentives.' },
      { type: 'cta', room: 'rca', label: 'Practice this in the RCA Room →' },
    ],
  },
  {
    id: 'time-patterns-rca',
    category: 'RCA',
    title: 'Time Patterns in RCA: Day-of-Week, Cohort, and Deployment Cuts',
    summary: 'A metric drop that started Tuesday is likely a deployment. One that started after a campaign is attribution. Time cuts narrow the hypothesis space faster than anything else.',
    readMin: 5,
    room: 'rca',
    roomLabel: 'RCA Room',
    content: [
      { type: 'text', text: 'Time is the cheapest diagnostic dimension in root cause analysis. Before segmenting by platform, user type, or geography, overlay the metric timeline with your deployment calendar. The shape of the metric movement tells you what type of cause to look for — and often narrows the hypothesis space to a single event before you\'ve written a single query.' },
      { type: 'heading', text: 'Four Time Patterns and What They Mean' },
      { type: 'text', text: 'A sudden, sharp drop that starts at a specific hour almost always indicates a deployment or an external event (a platform outage, an API dependency failure). The precision of the start time is the key signal — behavioral changes don\'t produce step-function drops. A gradual decline over weeks or months is more likely product decay (the product is getting less compelling over time), competitive pressure, or a slowly degrading content or supply quality issue. A day-of-week pattern — lower engagement every Monday, or a spike every Saturday — is either genuine user behavior (the use case has a weekly rhythm) or a batch job that fires on a schedule. A spike with a recovery is typically a transient event: a one-time email campaign, a viral moment, a PR hit, or a temporary bug that was quickly fixed.' },
      { type: 'example', label: 'Prism video app: overlaying release history with D7 retention timeline', text: 'D7 retention timeline (weekly cohorts):\nJan 1: 34% | Jan 8: 34% | Jan 15: 33% | Jan 22: 28% | Jan 29: 27% | Feb 5: 26%\n\nRelease calendar:\nJan 19: v3.4 shipped (new recommendation algorithm)\nJan 22: notification volume increased from 2.4/day to 7.1/day\n\nThe retention decline starts with the Jan 22 cohort — the first cohort to experience the higher notification volume from day one. The v3.4 release on Jan 19 shows no corresponding retention signal. The time pattern points directly to the notification change as the primary hypothesis before any segmentation is needed.' },
      { type: 'heading', text: 'The Deployment Overlay Habit' },
      { type: 'text', text: 'The highest-leverage single habit in RCA is keeping a release log and overlaying it with metric timelines at the start of every investigation. This sounds obvious but is rarely done systematically. Teams query metrics in their analytics tool and consult the deployment calendar separately, making it easy to miss correlations that would be immediately obvious if both were on the same chart. The goal is a single view: metric value on the y-axis, time on the x-axis, deployment markers overlaid. When a metric moves, the first question is: did anything deploy at or just before the inflection point?' },
      { type: 'callout', label: 'Time pattern diagnostic key', text: 'Sudden step-function drop → deployment or external event. Check release calendar first.\nGradual multi-week decline → product/content decay, competitive pressure, or supply quality.\nDay-of-week pattern → behavioral rhythm or scheduled batch process.\nSpike + recovery → transient event (campaign, viral, temporary bug).\nGradual improvement that suddenly plateaus → saturation or a guardrail being hit.' },
      { type: 'cta', room: 'rca', label: 'Practice this in the RCA Room →' },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // EXPERIMENTATION
  // ══════════════════════════════════════════════════════════════
  {
    id: 'srm',
    category: 'Experimentation',
    title: 'What Is SRM and Why It Should Stop Your Ship Decision',
    summary: 'Sample Ratio Mismatch means your experiment is broken. Shipping on an experiment with SRM is worse than not running the experiment at all.',
    readMin: 4,
    room: 'review',
    roomLabel: 'Review Room',
    content: [
      { type: 'text', text: 'Sample Ratio Mismatch (SRM) is one of the most important concepts in experimentation, and one of the most commonly skipped in practice. SRM occurs when the ratio of users assigned to your experiment\'s treatment and control groups doesn\'t match the intended allocation. If you set up a 50/50 split but end up with 48.2% in control and 51.8% in treatment, that\'s SRM. It sounds like a small discrepancy. It isn\'t. An experiment with SRM is not a valid experiment — and any results you compute from it are unreliable.' },
      { type: 'heading', text: 'Why SRM Invalidates an Experiment' },
      { type: 'text', text: 'The reason SRM is so damaging is that it almost always indicates a systematic difference between your groups — not just a random sampling fluctuation. If the assignment mechanism worked correctly and the only randomness was in which users got treatment vs control, you\'d expect the groups to be very close to the intended ratio, with deviations explained by chance alone. When you see a persistent imbalance, it usually means the assignment mechanism itself is biased, and the groups differ not just in which variant they saw but in who they are.' },
      { type: 'example', label: 'Detecting SRM with a chi-squared test', text: 'Experiment: 50/50 split, ran for 7 days\nIntended: 50,000 control / 50,000 treatment\nActual: 48,200 control / 51,800 treatment\n\nChi-squared test:\n- Expected: 50,000 / 50,000\n- Observed: 48,200 / 51,800\n- Chi-squared statistic: 128.8\n- p-value: 0.0000000001 (effectively 0)\n\nThis is a massive SRM. The probability of seeing this imbalance by chance, if assignment was unbiased, is essentially zero. The experiment assignment is broken.' },
      { type: 'heading', text: 'The 4 Most Common Causes of SRM' },
      { type: 'text', text: 'The first and most common cause is client-side logging errors. If your assignment happens on the server but your logging happens on the client, any logging failures (crashes, network errors, slow load times) will disproportionately affect one group if they\'re experiencing different performance. Typically the treatment group, which may be slower to load, will show lower logging rates, creating an apparent imbalance.' },
      { type: 'text', text: 'The second cause is bot traffic filtering applied inconsistently. If bots are filtered out of your analysis but the filter is applied at different stages of the pipeline for treatment vs control, the final group sizes will be imbalanced. Third: redirects and caching. If the treatment involves a redirect and your assignment is cached, some users who should be in treatment will get stuck in a cached version of control, skewing the ratio. Fourth: assignment logic bugs, where the hash function used to assign users to groups has uneven distribution for certain user ID ranges.' },
      { type: 'callout', label: 'The SRM check is non-negotiable', text: 'Run the chi-squared test on group sizes before looking at any metric results. If the p-value for the ratio test is below 0.01, stop the analysis. Investigate the assignment mechanism. Fix it. Re-run the experiment if needed. There is no statistical correction that makes an SRM experiment valid — the groups are not comparable, period.' },
      { type: 'heading', text: 'What to Do When You Find SRM' },
      { type: 'text', text: 'First, don\'t ship. Second, investigate the assignment pipeline systematically: check logging rates by group, check whether any users experienced errors at a different rate in treatment vs control, check whether any filtering was applied asymmetrically. If you can identify the cause and it\'s restricted to a specific sub-population, you may be able to exclude that population and re-run the analysis — but only if the exclusion is principled and pre-registered. More often, the right answer is to fix the pipeline and re-run the experiment from scratch.' },
      { type: 'list', items: [
        'Run a chi-squared test on group sizes as the very first step of any experiment readout.',
        'If p < 0.01 for the ratio test, the experiment has SRM — stop the analysis.',
        'SRM almost always indicates a systematic bias in assignment, not random fluctuation.',
        'No metric result from an SRM experiment is trustworthy. Don\'t ship, don\'t use the data.',
      ]},
      { type: 'cta', room: 'review', label: 'Practice experiment review in the Review Room →' },
    ],
  },
  {
    id: 'p-values',
    category: 'Experimentation',
    title: 'p-values Don\'t Mean What You Think They Mean',
    summary: 'p < 0.05 does not mean 95% chance the treatment works. Understanding what it actually says — and what it doesn\'t — changes every experiment readout you\'ll ever do.',
    readMin: 4,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'The p-value is the most misunderstood number in product analytics. It\'s reported in almost every experiment readout, cited in almost every ship/no-ship decision, and understood correctly by a surprisingly small fraction of the people who use it. The misconceptions aren\'t subtle: they lead directly to wrong ship decisions, overconfident product teams, and analyses that report statistical significance as if it were proof that something works. Getting this right changes how you read every experiment you\'ll ever run.' },
      { type: 'heading', text: 'What a p-value Actually Means' },
      { type: 'text', text: 'A p-value is the probability of observing your data — or data more extreme — if the null hypothesis were true. The null hypothesis is usually "the treatment has no effect." So a p-value of 0.03 means: if the treatment had no effect, we would see a result at least this large by random chance only 3% of the time. That\'s it. That\'s the whole definition. It says nothing about the probability that the treatment works. It says nothing about effect size. It says nothing about practical importance.' },
      { type: 'example', label: 'The correct and incorrect readings', text: 'Experiment result: p = 0.03, treatment CVR = 4.21%, control CVR = 4.08%\n\nINCORRECT: "We\'re 97% confident the treatment works."\nINCORRECT: "There\'s a 3% chance this result is due to noise."\nINCORRECT: "The treatment has a 97% chance of being the right decision to ship."\n\nCORRECT: "If the treatment had no effect, we\'d observe a difference this large or larger about 3% of the time by random chance alone. Given our pre-set alpha of 0.05, this clears the significance threshold — but we should also look at the effect size and confidence interval before deciding to ship."' },
      { type: 'heading', text: 'The Null Hypothesis Framework' },
      { type: 'text', text: 'To interpret a p-value correctly, you need to hold the null hypothesis clearly in mind. The null is the baseline claim — the world where your treatment does nothing. When you run a test with alpha = 0.05, you\'re saying: "I will reject the null hypothesis (and call this result significant) if I see data that would occur less than 5% of the time under the null." When you get p = 0.03, you\'re not proving the treatment works — you\'re saying the data is inconsistent enough with the null to make you doubt it, at your chosen threshold.' },
      { type: 'text', text: 'This framing matters because it clarifies what p-values don\'t do. They don\'t tell you the effect size is practically meaningful. They don\'t tell you the result will replicate. They don\'t account for multiple testing. A p-value of 0.049 on a 0.01% CVR lift is statistically significant and practically worthless. A p-value of 0.06 on a 2% CVR lift is technically not significant but probably worth investigating further. The number alone doesn\'t tell you what to do.' },
      { type: 'heading', text: 'What to Report Alongside p-values' },
      { type: 'text', text: 'A rigorous experiment readout reports the p-value in context: alongside the effect size (how large is the observed difference?), the confidence interval (what range of effect sizes are consistent with the data?), and the practical significance threshold (what lift would actually matter for the business?). "p = 0.03, effect size = 0.13% CVR lift, 95% CI: [0.02%, 0.24%]" is a complete statement. "p = 0.03, we should ship" is not.' },
      { type: 'callout', label: 'The correct p-value sentence', text: '"A p-value of X means: if the treatment truly had no effect, we would see a result this extreme or more extreme only X% of the time by chance. It does not tell us the probability that the treatment works — that requires additional reasoning about effect size, confidence intervals, and prior probability."' },
      { type: 'list', items: [
        'p-value = probability of data this extreme under the null, not probability the treatment works.',
        'Statistical significance and practical significance are different. Check both.',
        'Report p alongside effect size and confidence interval — the number alone is incomplete.',
        'Pre-commit your alpha threshold before running the experiment. Choosing alpha after seeing results is p-hacking.',
      ]},
      { type: 'cta', room: 'stats', label: 'Practice stats interpretation in the Stats Room →' },
    ],
  },
  {
    id: 'confidence-intervals',
    category: 'Experimentation',
    title: 'Confidence Intervals: What They Actually Tell You (And What They Don\'t)',
    summary: 'A CI that barely excludes zero is not the same as one centered far from zero. Most analysts report CIs but don\'t read them. Here\'s the difference.',
    readMin: 6,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'A 95% confidence interval does not mean there is a 95% probability that the true value lies inside it. This is the most common misinterpretation in applied statistics, and it matters because the correct interpretation changes how you communicate experiment results and how much you should trust them. The correct reading: if you repeated this experiment 100 times and computed a 95% CI each time, approximately 95 of those intervals would contain the true population parameter. The interval you have is either one of the 95 that captured the truth, or one of the 5 that didn\'t — you cannot know which.' },
      { type: 'heading', text: 'How to Read a CI in Experiment Results' },
      { type: 'text', text: 'In experiment readouts, CIs typically appear alongside the point estimate: "+2.3% (95% CI: +0.8% to +3.8%)." Read this as: the best estimate of the treatment effect is +2.3%, and this interval was constructed such that across repeated experiments, 95% of such intervals capture the true effect. The width of the interval is as important as where it sits. A wide CI means high uncertainty — you need more data before the estimate is precise enough to act on confidently. A narrow CI means the estimate is precise, and you can act on the point estimate with confidence.' },
      { type: 'example', label: 'Crafted marketplace checkout experiment', text: 'Experiment: Simplified checkout flow on Crafted marketplace.\nPoint estimate: +2.3% CVR lift\n95% CI: [+0.8%, +3.8%]\n\nCI width = 3.8% − 0.8% = 3.0 percentage points.\nFormula: width ≈ 2 × z* × SE, where z* = 1.96 for 95% CI.\nImplication: SE ≈ 3.0 / (2 × 1.96) ≈ 0.77pp.\n\nThis interval excludes zero (the lower bound is +0.8%), meaning the result is statistically significant at α = 0.05. But the practical range is +0.8% to +3.8% — at the lower end, the business impact is modest. The ship decision should account for this full range, not just the point estimate.' },
      { type: 'heading', text: 'Width Tells You Something Important' },
      { type: 'text', text: 'A wide CI — for example, "+2.3% (95% CI: −1.2% to +5.8%)" — tells you that even though the point estimate looks positive, the data is consistent with both a meaningful positive effect and a small negative effect. This interval crosses zero, which means you cannot reject the null. But even a non-significant result is informative: you now know that if there is an effect, it\'s somewhere in the range −1.2% to +5.8%. That range might be too wide to make a confident ship decision, which means you need more data — a longer runtime or more users, not just a rerun.' },
      { type: 'callout', label: 'Key insight', text: 'A CI that excludes zero = statistically significant at the corresponding alpha level. A CI centered far from zero = a large, confidently estimated effect. A narrow CI = a precise estimate. These three properties are independent. An experiment can have a statistically significant but imprecise result (CI excludes zero but is very wide), or a precise but non-significant result (narrow CI that straddles zero). Always read all three properties.' },
      { type: 'cta', room: 'stats', label: 'Practice this in the Stats Room →' },
    ],
  },
  {
    id: 'power-mde',
    category: 'Experimentation',
    title: 'Power, MDE, and Why Most A/B Tests Are Underpowered',
    summary: 'Running an underpowered test and calling a null result "no effect" is a common, silent mistake. Here\'s how to calculate what sample size you actually need.',
    readMin: 5,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'Statistical power is the probability that your experiment will detect a real effect if one exists. An underpowered experiment — one with insufficient sample size — will fail to detect small real effects and produce a null result, which teams routinely misinterpret as "the treatment doesn\'t work." In reality it means "the experiment wasn\'t designed to find an effect this small." The failure to ship something that actually works is a real business cost, and it happens silently. Nobody raises the alarm when you call something a null.' },
      { type: 'heading', text: 'The Power / MDE / N Triangle' },
      { type: 'text', text: 'Three quantities determine whether an experiment is valid: power (usually 80%), minimum detectable effect (MDE — the smallest lift you want to be able to detect), and sample size N. These three are locked together. If you fix power and MDE, you get a required N. If you fix power and N, you get the MDE your experiment can detect. If you fix N and MDE, you get the power. Most teams only talk about one of these — usually whether the test is "significant" — without thinking about the other two.' },
      { type: 'example', label: 'Calculating required sample size', text: 'Scenario: You want to detect a 1% relative lift in checkout CVR.\n\nBaseline CVR: 8.0%\nAbsolute lift to detect: 0.08 percentage points (1% of 8%)\nDesired power: 80%\nAlpha: 0.05 (two-tailed)\n\nApproximate formula: n = 16σ² / δ²\nwhere σ² = p(1-p) = 0.08 × 0.92 = 0.0736, δ = 0.0008\n\nn = 16 × 0.0736 / (0.0008²) = 1.178 / 0.00000064 ≈ 1,840,000 per group\n\nTo detect a 1% relative CVR lift at 80% power, you need roughly 1.84M users per group, or about 3.7M total. If your checkout sees 50,000 users/day, that\'s 74 days per group — impractical for most teams.' },
      { type: 'heading', text: 'Why Most Tests Are Underpowered' },
      { type: 'text', text: 'The most common reason tests are underpowered is that teams pick a runtime based on convenience (two weeks) rather than the power calculation. Two weeks of traffic gives you a fixed N. That N might be enough to detect a 5% relative lift. It almost certainly isn\'t enough to detect a 0.5% lift. When the two-week test comes back null, the team concludes the feature doesn\'t work — but all the data shows is that the feature doesn\'t produce a very large effect. A smaller, real effect could easily be hiding beneath the noise floor.' },
      { type: 'text', text: 'The solution is to run the power calculation before the experiment starts and set runtime accordingly. If the required runtime is impractical, you have three options: accept a larger MDE (you can only detect bigger effects), increase the allocation to treatment (more users per day), or use variance reduction techniques like CUPED to lower the required N.' },
      { type: 'callout', label: 'Before any experiment', text: 'Answer these three questions before you start:\n1. What is the smallest lift that would be meaningful for this product decision? (Your MDE)\n2. What is your baseline metric value and variance?\n3. Given 80% power and your MDE, how many users do you need per group?\n\nIf your projected traffic doesn\'t reach that N within a reasonable timeframe, either the experiment is impractical at this lift threshold or you need to reduce variance.' },
      { type: 'heading', text: 'Reading Null Results Carefully' },
      { type: 'text', text: 'When an experiment comes back null, always check the power calculation before concluding the feature has no effect. Report it as: "We did not detect a statistically significant effect. Given our sample size of N, we had 80% power to detect an effect of X or larger. Effects smaller than X remain possible." This is the honest interpretation. It distinguishes "we ruled out effects larger than X" from "there is no effect." The former is often useful. The latter is rarely true.' },
      { type: 'list', items: [
        'Run a power calculation before every experiment. Don\'t pick runtime by convenience.',
        'An 80% power threshold means 20% of real effects will be missed — factor this into decisions.',
        'When you see a null result, check: what was the MDE? Could a smaller real effect be hiding?',
        'If required N is too large to reach, consider whether the experiment is worth running at all.',
      ]},
      { type: 'cta', room: 'stats', label: 'Practice power calculations in the Stats Room →' },
    ],
  },
  {
    id: 'novelty-effect',
    category: 'Experimentation',
    title: 'Novelty Effect: The Trap That Fools Every Junior Analyst',
    summary: 'Users engage with new things because they\'re new — not because they\'re better. Early experiment results are systematically biased upward. Here\'s how to account for it.',
    readMin: 6,
    room: 'review',
    roomLabel: 'Review Room',
    content: [
      { type: 'text', text: 'The novelty effect is one of the most reliable threats to experiment validity in product analytics, and one of the least discussed. When you ship a new UI, a new feature, or a new interaction pattern, a subset of users will engage with it simply because it\'s new. Curiosity-driven engagement is real, but it isn\'t sustainable. It inflates your treatment metrics in the first days of the experiment and creates a false impression of a larger lift than the feature will sustain in production.' },
      { type: 'heading', text: 'What the Novelty Effect Looks Like in Data' },
      { type: 'text', text: 'The signature of the novelty effect is week-over-week decay in the treatment group\'s relative lift. In week one, treatment might show a 12% higher engagement rate. In week two, it\'s 8%. In week three, 5%. The effect is real but shrinking as users habituate to the new experience. If you stop the experiment after week one and declare a 12% win, you\'ll ship a feature that delivers 5% in production — and your credibility will take a hit when the post-launch metrics don\'t match the experiment projection.' },
      { type: 'example', label: 'Novelty effect decay pattern', text: 'New feed ranking algorithm experiment:\n\nWeek 1: treatment engagement +15% vs control (p < 0.001)\nWeek 2: treatment engagement +9% vs control (p = 0.002)\nWeek 3: treatment engagement +6% vs control (p = 0.03)\nWeek 4: treatment engagement +5% vs control (p = 0.04)\n\nThe effect stabilizes around +5%. This is the true sustained lift. If you shipped on week 1 data, you\'d have projected +15% and delivered +5%. The team would investigate why "the experiment result didn\'t hold."' },
      { type: 'heading', text: 'Detecting and Accounting for Novelty Effect' },
      { type: 'text', text: 'The cleanest detection method is to plot the metric movement by week or by cohort of exposure. If the lift is decaying systematically, you\'re looking at a novelty effect. A genuine behavioral improvement tends to hold or improve over time as users build new habits. A novelty effect starts high and trends down toward a lower stable level.' },
      { type: 'text', text: 'The right response is to extend the experiment runtime until the lift stabilizes — typically three to four weeks for UI changes. Report the stabilized lift, not the first-week peak. If your experiment platform allows it, compute the lift separately for users in their first week of exposure vs users in their second week or later. The second-week-and-later cohort gives you a better estimate of the sustained effect.' },
      { type: 'heading', text: 'When to Worry Most' },
      { type: 'text', text: 'Novelty effect is most pronounced for UI changes, new content formats, redesigned navigation, and new notification types. It\'s less common for infrastructure changes (latency improvements, backend changes) and for changes that users don\'t consciously notice. The test: did users see something different? If yes, check for novelty effect. If the change is invisible to the user, the novelty concern is lower.' },
      { type: 'callout', label: 'The novelty effect checklist', text: 'Before reading out a positive experiment result on a UI change:\n1. Plot the week-over-week lift trend. Is it decaying?\n2. If the experiment ran less than 3 weeks, flag the novelty effect risk explicitly.\n3. Compare the lift in week 1 vs weeks 3-4. Use the stable period as your estimate.\n4. If you must ship on early data (business pressure), state the confidence range and set a post-launch monitoring period.' },
      { type: 'list', items: [
        'UI changes have strong novelty effects. Always run for at least 3 weeks before reading out.',
        'Plot the weekly lift trend. Decaying lift = novelty effect. Stable or growing lift = real effect.',
        'Report the stabilized lift, not the peak. Your post-launch metrics will match the stable number.',
        'In interviews, calling out novelty effect is a signal of experimentation maturity.',
      ]},
      { type: 'cta', room: 'review', label: 'Practice experiment review in the Review Room →' },
    ],
  },
  {
    id: 'sutva',
    category: 'Experimentation',
    title: 'SUTVA: The Assumption That Makes or Breaks Marketplace Experiments',
    summary: 'When treatment and control units interact, your experiment is contaminated. Network effects, shared inventory, and marketplace dynamics all break SUTVA.',
    readMin: 4,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'SUTVA stands for Stable Unit Treatment Value Assumption. It is the foundational assumption underneath every A/B test: each unit\'s (user\'s) outcome depends only on their own treatment assignment, not on the assignment of any other unit. When SUTVA holds, your control group is a clean counterfactual — it tells you what would have happened to treatment users if they hadn\'t been treated. When SUTVA breaks, the control group is contaminated, and your estimated treatment effect is biased in ways that are hard to detect and easy to misinterpret.' },
      { type: 'heading', text: 'Three Ways SUTVA Breaks in Marketplace Experiments' },
      { type: 'text', text: 'On Crafted marketplace, SUTVA breaks in predictable ways. First, shared inventory: if treatment sellers receive a ranking boost that drives more buyers to them, those buyers are drawn from the same pool as control sellers. Control sellers\' sales go down not because of anything in the control experience, but because treatment sellers captured their demand. Second, network effects: if a treatment improves the social feed on Spark social, treatment users generate more content, which control users see and engage with — now control engagement is elevated by the treatment. Third, social proof: if treatment users see higher review counts (because the feature drives more reviews), that social proof signal is visible on the same listings to control users.' },
      { type: 'example', label: 'Detecting SUTVA violation: seller experiment on Crafted', text: 'Pre-experiment baseline (2 weeks before launch):\nControl sellers average GMV: $1,180/month\nTreatment sellers average GMV: $1,195/month (balanced at randomization)\n\nDuring experiment (week 1):\nTreatment sellers GMV: +18% vs pre-experiment baseline\nControl sellers GMV: −9% vs pre-experiment baseline\n\nA clean experiment would show control metrics holding flat against pre-experiment baseline. The −9% drop in control seller GMV signals demand cannibalization: treatment sellers are capturing sales that would have gone to control sellers. The estimated treatment effect (+18%) is inflated — part of that lift is stolen from control, not genuinely created.' },
      { type: 'heading', text: 'Solutions: Geo-Cluster, Holdout, and Switchback' },
      { type: 'text', text: 'Three designs address SUTVA violations. Geo-cluster randomization assigns treatment at the city or region level — all sellers and buyers in Seattle are in treatment, all in Portland are in control. This eliminates cross-unit contamination within a market at the cost of fewer independent units (metros, not users). Holdout groups isolate a clean control: a subset of the platform is completely excluded from the treatment and any indirect effects of it, used only for baseline comparison. Switchback experiments alternate treatment and control across time periods for the same units, which works well when the intervention is temporary and carryover is limited.' },
      { type: 'callout', label: 'Flag this first', text: 'In any marketplace, social, or inventory-constrained experiment design question, SUTVA is the first thing to check. Ask: can treatment units affect control units through a shared resource (inventory, demand pool, content feed, social graph)? If yes, name the contamination mechanism and propose the design that addresses it. This is the question that separates analysts who understand experimentation design from those who just know the formulas.' },
      { type: 'cta', room: 'stats', label: 'Practice this in the Stats Room →' },
    ],
  },
  {
    id: 'guardrail-conflicts',
    category: 'Experimentation',
    title: 'When Your North Star Goes Up and Your Guardrail Goes Down',
    summary: 'GMV is up 3% but refund rate is up 8%. This is the most common real-world experiment scenario. The decision framework is not obvious — here it is.',
    readMin: 6,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'The scenario every data scientist dreads: you run a two-week experiment on Crafted marketplace\'s discovery algorithm. Primary metric — GMV — is up 3.1% (p = 0.008). You\'re about to write the ship recommendation. Then you look at the guardrail. Refund rate is up 1.4 percentage points, from 6.2% to 7.6% (p = 0.031). This is the conflict that requires a framework, not instinct. And the framework starts with a question most analysts skip: is the guardrail result actually significant?' },
      { type: 'heading', text: 'Step 1: Verify the Guardrail Is Real' },
      { type: 'text', text: 'Before treating a guardrail violation as definitive, confirm the statistical properties. Was the guardrail pre-committed — defined before the experiment launched — or noticed post-hoc while reviewing dashboards? Pre-committed guardrails carry their stated alpha. Post-hoc guardrail fires are subject to multiple testing inflation and should be treated as signals requiring investigation, not hard stops. For Crafted\'s refund rate: if it was pre-committed with α = 0.05 and the observed p = 0.031, this is a genuine violation. If you found it by scrolling a 20-metric dashboard, apply Bonferroni and you may not have significance at all.' },
      { type: 'example', label: 'Quantifying the tradeoff in dollars', text: 'GMV lift: +3.1% on baseline monthly GMV of $8.2M = +$254K/month incremental.\nCrafted take rate: 12% → Revenue lift: +$30.5K/month.\n\nRefund rate increase: +1.4pp on 50,000 monthly orders at $164 AOV.\nAdditional monthly refunds: 50,000 × 0.014 = 700 extra refunds × $164 = $114,800/month reversed GMV.\nRevenue cost of extra refunds: $114,800 × 12% take rate = $13,800/month lost revenue.\nPlus estimated support cost per refund: $8 × 700 = $5,600/month.\n\nNet monthly impact: +$30,500 (GMV lift) − $13,800 (refund revenue loss) − $5,600 (support) = +$11,100.\nOn paper, net positive — but barely, and the refund rate trend may compound.' },
      { type: 'heading', text: 'Step 2: Understand the Mechanism' },
      { type: 'text', text: 'The mechanism of the guardrail violation determines the response. There are two archetypes. First: marginal-purchase returns — the discovery algorithm is surfacing products to buyers who are slightly less certain about their purchase. They buy, they regret, they return. This is a product iteration problem: the algorithm needs a quality filter or a confidence signal. The treatment concept is directionally right but needs refinement. Second: quality degradation — the algorithm is optimizing for click probability and surfacing low-quality listings that convert but deliver a bad experience. This is a rollback problem. The mechanism is fundamentally at odds with a healthy marketplace.' },
      { type: 'callout', label: 'Never make this call solo', text: 'A primary metric win with a guardrail violation is a business decision, not an analytical one. The data scientist\'s job is: (1) verify the guardrail is real, (2) quantify the tradeoff in the same units (dollars), (3) surface the plausible mechanisms. The ship/no-ship decision belongs to the product leader, informed by all three of those inputs. Going to that conversation with just "GMV is up but refund rate is up" leaves the decision-maker without the tools to decide. Going with the dollar quantification and a mechanism hypothesis gives them what they need.' },
      { type: 'cta', room: 'stats', label: 'Practice this in the Stats Room →' },
    ],
  },
  {
    id: 'multiple-testing',
    category: 'Experimentation',
    title: 'Multiple Testing: Why Running More Metrics Inflates Your False Positive Rate',
    summary: 'Test 20 metrics at p < 0.05 and you expect one spurious positive by chance. Bonferroni, FDR, and pre-registration — the tools that keep you honest.',
    readMin: 4,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'At α = 0.05, every individual hypothesis test has a 5% chance of producing a false positive when the null is true. This seems low. But the false positive rate compounds across tests. With 14 independent tests run simultaneously on a null experiment — one where the treatment truly has no effect — the probability that at least one test produces a false positive exceeds 50%. At 20 tests, it\'s 64%. This is the multiple testing problem, and it means that tracking a dashboard of 16 metrics in an experiment and reporting "two came back significant" is not evidence of two real effects. Statistically, you\'d expect exactly that from noise.' },
      { type: 'heading', text: 'The Pre-Committed Primary Metric' },
      { type: 'text', text: 'The most important protection against multiple testing is structural: pre-commit to a single primary metric before the experiment launches. This metric — and only this metric — is the decision metric. Its p-value is evaluated at the stated α without any correction, because you\'re running exactly one primary test. All other metrics in the readout are secondary: they help you understand the mechanism and generate hypotheses, but they do not drive the ship decision. If a secondary metric looks interesting, it becomes a hypothesis for the next experiment, not a reason to ship the current one.' },
      { type: 'example', label: 'Threadline SaaS: 16 metrics, 2 significant, neither survives correction', text: 'Experiment: New onboarding flow for Threadline SaaS. 16 metrics tracked.\nObserved results: 2 metrics hit p < 0.05 — "feature adoption rate" (p = 0.038) and "help center page views" (p = 0.041).\n\nBonferroni correction: adjusted α = 0.05 / 16 = 0.003125.\nBoth metrics: p > 0.003125 → neither survives correction.\n\nBenjamini-Hochberg (FDR) at q = 0.10:\nRank metrics by p-value. Threshold: p(k) ≤ (k/16) × 0.10.\nAt rank 1: threshold = 0.006. Neither metric meets this threshold either.\n\nConclusion: zero metrics survive multiple-testing correction. The two "significant" results are consistent with pure chance in a null experiment. If the primary metric (90-day seat retention) was pre-committed and showed p = 0.21, this is a no-ship.' },
      { type: 'heading', text: 'Bonferroni vs Benjamini-Hochberg' },
      { type: 'text', text: 'Bonferroni correction divides α by the number of tests: adjusted α = 0.05 / k. It controls the Family-Wise Error Rate (FWER) — the probability of any false positive across all tests. It is conservative. With 20 metrics, you\'re requiring p < 0.0025 per test, which almost nothing will pass. This is appropriate for small confirmatory test sets where any false positive is very costly. Benjamini-Hochberg (BH) controls the False Discovery Rate (FDR) — the expected proportion of significant results that are false positives. It is less conservative and better suited to exploratory dashboards with many metrics. At FDR = 0.10, you accept that 10% of your significant results may be false, but you catch more real effects.' },
      { type: 'callout', label: 'Key insight', text: 'Secondary metrics are for understanding mechanism, not making decisions. When a secondary metric moves and the primary didn\'t, the correct response is: "This is an interesting signal that suggests [mechanism]. We should design a follow-up experiment with this as the primary metric." It is never: "Even though the primary metric was null, this secondary movement justifies a ship." That reasoning converts a null result into a false positive by changing the question after seeing the data.' },
      { type: 'cta', room: 'stats', label: 'Practice this in the Stats Room →' },
    ],
  },
  {
    id: 'peeking',
    category: 'Experimentation',
    title: 'Peeking: Why Checking Your Experiment Mid-Run Inflates False Positives',
    summary: 'Every time you check an in-progress test and consider stopping early, you increase your chance of a false positive. Sequential testing methods solve this — here\'s the intuition.',
    readMin: 6,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'Peeking is one of the most widespread sources of false positives in product experimentation. It happens when analysts or stakeholders look at experiment results before the pre-committed runtime is complete, see a significant result, and make a ship decision — or when they check repeatedly and stop the experiment at the first moment it crosses significance. Both behaviors inflate your false positive rate beyond your stated alpha, and the inflation compounds with the number of looks.' },
      { type: 'heading', text: 'How Peeking Inflates False Positives' },
      { type: 'text', text: 'The p < 0.05 threshold assumes you look at the data exactly once, after collecting the pre-planned sample. When you look at the data multiple times and stop whenever it crosses significance, you\'re not running one test at 5% false positive rate — you\'re running multiple tests, each with an independent chance of producing a spurious significant result. The false positive rate accumulates.' },
      { type: 'example', label: 'How false positive rate compounds', text: 'Null experiment (treatment truly has no effect). Alpha = 0.05.\n\nLooks at data: 1 → False positive rate: 5.0%\nLooks at data: 2 → False positive rate: 8.3%\nLooks at data: 3 → False positive rate: 10.7%\nLooks at data: 5 → False positive rate: 14.2%\nLooks at data: 10 → False positive rate: 19.3%\n\nIf you check your experiment every day for two weeks and stop when it\'s significant, your actual false positive rate is not 5% — it\'s closer to 20%. One in five experiments you "win" will be noise.' },
      { type: 'heading', text: 'Pre-Committing Your Stopping Rule' },
      { type: 'text', text: 'The solution is a pre-committed stopping rule: decide before the experiment starts when you will read the results. This is usually a fixed runtime (run for N days) or a fixed sample size (stop when N users per group have been exposed). Whatever the rule is, write it down. The moment you deviate from it — stopping early because "the results look great" — you\'ve introduced peeking bias.' },
      { type: 'text', text: 'The pre-committed rule should also specify the primary metric, the alpha threshold, and whether the test is one-tailed or two-tailed. These decisions need to be made before you see data. Making them after looking at preliminary results turns data-driven experimentation into post-hoc rationalization, even if each individual decision seems reasonable.' },
      { type: 'heading', text: 'Sequential Testing as the Legitimate Alternative' },
      { type: 'text', text: 'If you need to peek — because a safety guardrail might be moving, or because there\'s genuine business urgency — sequential testing methods (like the Sequential Probability Ratio Test or always-valid p-values) are designed to allow multiple looks while controlling the overall false positive rate. These methods adjust the significance threshold dynamically so that you can stop early with statistical validity. They\'re not free — they require larger sample sizes than fixed-horizon tests — but they\'re honest.' },
      { type: 'callout', label: 'The stopping rule template', text: 'Write this before every experiment:\n"This experiment will run until [date] or until [N users per group] have been exposed, whichever comes first. Results will be read at that time. No interim reads will be used to make ship decisions. The primary metric is [X]. We will reject the null at alpha = 0.05 (two-tailed). If we need to check for safety guardrail violations mid-run, we will use a Bonferroni-corrected threshold."' },
      { type: 'list', items: [
        'Pre-commit your stopping rule before the experiment starts. Write it down.',
        'Every extra look at in-progress results inflates your false positive rate.',
        'If you need to peek for safety reasons, use a Bonferroni-corrected threshold for interim checks.',
        'For genuinely flexible monitoring, use sequential testing methods — not standard t-tests.',
      ]},
      { type: 'cta', room: 'stats', label: 'Practice stats interpretation in the Stats Room →' },
    ],
  },
  {
    id: 'randomization-unit',
    category: 'Experimentation',
    title: 'Choosing Your Randomization Unit: User, Session, or Device?',
    summary: 'The wrong randomization unit inflates variance, breaks SUTVA, or leads to inconsistent user experience. The right choice depends on what you\'re testing.',
    readMin: 4,
    room: 'design',
    roomLabel: 'Design Room',
    content: [
      { type: 'text', text: 'Choosing the randomization unit is one of the first decisions in experiment design, and it\'s the decision that most analysts get wrong silently — they default to user-level without examining whether it\'s right, or they use session-level because the data is easier to work with. The randomization unit determines your variance structure, your SUTVA exposure, and whether users get a consistent experience. Getting it wrong produces experiments whose statistics look valid but whose results are misleading.' },
      { type: 'heading', text: 'User-Level: The Default That\'s Right Most of the Time' },
      { type: 'text', text: 'User-level randomization assigns each user to treatment or control once, and that assignment persists across all their sessions. This is correct for most product experiments because: (1) it provides a consistent user experience — a user in treatment sees the new feature every time, not randomly, which is what you\'d ship; (2) it produces correct variance estimates, because user-level outcomes are independent across users; (3) it aligns with how deployment actually works. The rule: if the thing you\'re testing is a feature a user will interact with repeatedly, randomize at the user level.' },
      { type: 'example', label: 'Session-level randomization: the variance trap', text: 'Scenario: Prism video app tests a new video autoplay behavior, randomizing at the session level.\n\nProblem: The same user may be assigned to treatment in session 1, control in session 2, treatment in session 3. User-level outcomes are correlated across sessions (a high-engagement user is high-engagement in every session). Session-level analysis treats these as independent observations, understating variance.\n\nEffect: Apparent sample size = 200,000 sessions. True independent units = ~45,000 users (each averaging ~4.4 sessions). Understated variance inflates the t-statistic by a factor of √(4.4) ≈ 2.1. A test that should have p = 0.21 appears to have p = 0.03 — a false positive driven by incorrect variance, not a real effect.' },
      { type: 'heading', text: 'Device-Level and the Multi-Device Problem' },
      { type: 'text', text: 'Device-level randomization is acceptable when user identity is unavailable or unreliable — for example, in logged-out experiences or early funnel tests. The risk is multi-device contamination: approximately 15% of e-commerce users regularly shop on more than one device. A user assigned to treatment on mobile and control on desktop sees both experiences. Their behavior is contaminated in both cells. For most experiments, this contamination is small enough to accept as noise. For experiments testing UX consistency — navigation changes, layout redesigns, personalization — device-level randomization can mask the true effect.' },
      { type: 'callout', label: 'The rule and its SUTVA corollary', text: 'Randomize at the unit of the decision: the smallest unit at which you would deploy the feature. If the feature is a user-facing persistent change, that unit is the user. If the feature affects all users in a geographic market (a price change, a supply policy), that unit is the market — and you need geo-cluster randomization.\n\nSUTVA corollary: if users can affect each other\'s outcomes (social network features, marketplace supply/demand, shared resources), go higher — randomize at the cohort, household, or geo level. User-level randomization where users interact puts treatment and control in direct contact, violating SUTVA.' },
      { type: 'cta', room: 'design', label: 'Practice this in the Design Room →' },
    ],
  },
  {
    id: 'cuped',
    category: 'Experimentation',
    title: 'CUPED: Get 40% More Statistical Power Without Running a Single Extra User',
    summary: 'CUPED uses pre-experiment behavior to reduce variance in your outcome metric. More power, same sample size, same runtime. Here\'s the intuition without the math.',
    readMin: 4,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'CUPED — Controlled-experiment Using Pre-Experiment Data — is a variance reduction technique that makes your existing experiment more powerful without adding a single user or a single day of runtime. The insight is simple: a large fraction of the variance in your outcome metric is already explained by how users behaved before the experiment started. High-spenders before the experiment tend to be high-spenders during it. Low-engagement users before tend to be low-engagement during it. If you can strip out this predictable pre-experiment variance, the residual noise is smaller, the signal-to-noise ratio improves, and your experiment becomes more sensitive to the treatment effect.' },
      { type: 'heading', text: 'The Formula' },
      { type: 'text', text: 'The CUPED-adjusted outcome is: Y_adjusted = Y − θ(X − E[X]), where Y is the outcome metric during the experiment (e.g., purchases per user), X is a pre-experiment covariate (e.g., purchases per user in the 4 weeks before experiment launch), E[X] is the mean of X across all users, and θ = Cov(X, Y) / Var(X) — the coefficient that optimally removes X\'s contribution to variance in Y. The adjustment is mean-preserving: E[Y_adjusted] = E[Y], so the expected treatment effect is unchanged. Only the variance shrinks. The variance reduction is 1 − ρ², where ρ is the correlation between X and Y.' },
      { type: 'example', label: 'CUPED on Crafted marketplace revenue metric', text: 'Outcome metric Y: GMV per user during experiment (2 weeks)\nCovariate X: GMV per user in the 4 weeks before experiment\nCorrelation ρ between X and Y: 0.65 (typical for revenue in stable marketplace)\n\nVariance reduction = 1 − ρ² = 1 − 0.4225 = 0.5775, or 58% variance reduction.\n\nPractical effect:\nOriginal required runtime to achieve 80% power: 14 days\nWith CUPED (58% variance reduction): 14 × (1 − 0.58) = 5.9 days\n\nThe same experiment reaches 80% power in 6 days instead of 14, using the same users. Alternatively, you could run for 14 days and have power equivalent to a 33-day experiment. No additional traffic, no additional cost.' },
      { type: 'heading', text: 'When It Works and When It Doesn\'t' },
      { type: 'text', text: 'CUPED works best when two conditions hold. First, the pre-experiment period must be stable — not affected by a major product change, a seasonal anomaly, or a prior experiment that contaminated baseline behavior. If the covariate X was measured during a Black Friday week and your experiment runs in February, the correlation between X and Y will be weaker and the variance reduction will be smaller than expected. Second, the covariate must be correlated with the outcome — the higher ρ, the more variance reduction. For revenue and engagement metrics with stable user bases, ρ is typically 0.5–0.75. For rare-event metrics like subscription conversions, ρ may be too low for CUPED to be worthwhile.' },
      { type: 'callout', label: 'Key insight', text: 'Variance reduction is equivalent power without extra users. At ρ = 0.65 (typical for revenue): 58% variance reduction = same as running 58% longer or getting 58% more users — for free. The only requirement is a clean pre-experiment period of comparable length to your experiment. If you have that, CUPED is almost always worth implementing. The most common reason teams skip it is unfamiliarity, not a good analytical reason.' },
      { type: 'cta', room: 'stats', label: 'Practice this in the Stats Room →' },
    ],
  },
  {
    id: 'experiment-design-primary-metric',
    category: 'Experimentation',
    title: 'Choosing Your Primary Metric: The Decision You Make Before the Experiment Starts',
    summary: 'Pre-committing to a primary metric is not bureaucracy — it\'s what keeps you from p-hacking your way to a ship decision. Here\'s how to choose the right one.',
    readMin: 6,
    room: 'design',
    roomLabel: 'Design Room',
    content: [
      { type: 'text', text: 'The primary metric is the one and only decision metric for your experiment. Not the most interesting metric in the readout, not the one that happened to be significant, not the business north star — the one you committed to before the experiment launched. Pre-committing to a primary metric is the structural choice that makes the experiment\'s result interpretable. Without it, you\'re running 10 tests at once and selecting the winner, which inflates your false positive rate to the point where a "win" is often noise.' },
      { type: 'heading', text: 'How to Choose the Right Primary Metric' },
      { type: 'text', text: 'The primary metric should be the closest measurable signal to the hypothesis being tested — not the business north star, and not what\'s easy to move. The test: does a causal story connect your feature change directly to this metric within your experiment window? If the feature changes checkout flow friction, the primary metric is checkout completion rate — not GMV, not 90-day retention. GMV and retention are important, but they\'re downstream of checkout completion, noisier in a 14-day window, and affected by many factors beyond the feature. Checkout completion is where the hypothesis lives.' },
      { type: 'example', label: 'Prism video app: wrong and right primary metric', text: 'Feature: New video thumbnail algorithm that uses engagement signals instead of recency to select thumbnails.\nHypothesis: Better thumbnails increase the rate at which users click into videos from the browse feed.\n\nWRONG primary metric: Weekly Active Viewers (WAV) — the team\'s north star.\nWhy wrong: WAV is affected by content quality, notification strategy, external factors, and many features simultaneously. A thumbnail change will move it by <0.1% in 14 days. You\'d need 90+ days to detect a real effect. This experiment would be chronically underpowered.\n\nRIGHT primary metric: Browse feed click-through rate (CTR) — the fraction of thumbnails shown that are clicked.\nWhy right: Direct causal link. Observable within hours. Sensitive to thumbnail quality. If CTR improves, the hypothesis is supported. WAV and session depth become secondary metrics to understand downstream magnitude.' },
      { type: 'heading', text: 'Sensitivity: The Often-Skipped Check' },
      { type: 'text', text: 'Before finalizing the primary metric, run a quick power check: can you detect the expected effect size at your expected traffic in a reasonable runtime? If the metric requires 90 days of runtime at 80% power for your MDE, it is not a viable primary metric for a 14-day experiment. This is the most common mistake in primary metric selection: choosing the north star because it\'s important, without checking whether it\'s sensitive enough to move in the time window you have. A metric that can\'t be detected isn\'t providing information — it\'s providing noise dressed up as a null result.' },
      { type: 'callout', label: 'Key insight', text: 'The primary metric is closest to the hypothesis, not closest to the business outcome. A sequence: feature → primary metric → secondary metrics → north star. The primary metric is one step away from the feature. The north star is several steps away. If you try to skip straight to the north star, you\'ll run underpowered experiments and misinterpret null results as evidence the feature doesn\'t work, when it actually means your metric was too insensitive to detect the effect in your timeframe.' },
      { type: 'cta', room: 'design', label: 'Practice this in the Design Room →' },
    ],
  },
  {
    id: 'decision-rule',
    category: 'Experimentation',
    title: 'Your Decision Rule: Pre-Commit or Regret',
    summary: 'A decision rule written after seeing results is not a decision rule — it\'s post-hoc rationalization. Here\'s what a good pre-committed rule looks like.',
    readMin: 5,
    room: 'design',
    roomLabel: 'Design Room',
    content: [
      { type: 'text', text: 'A decision rule is the complete specification of when and how you will make a ship/no-ship decision — written before the experiment runs. It is not a checklist you fill in after you see the results. The difference matters enormously. A decision rule written after results are visible is not a rule — it\'s a rationalization. The human brain is extraordinarily good at constructing post-hoc logic for whatever outcome it wants to see, and "I\'d always planned to use this metric" is easy to believe in retrospect. The pre-commitment is what makes the rule credible.' },
      { type: 'heading', text: 'What a Decision Rule Includes' },
      { type: 'text', text: 'A complete decision rule specifies five things. First, the primary metric — the one decision metric, pre-committed. Second, the significance threshold — typically α = 0.05 (two-tailed) for most product decisions, α = 0.01 for high-stakes irreversible changes. Third, the power target and minimum detectable effect — 80% power at the pre-specified MDE, with runtime calculated before launch. Fourth, the minimum runtime — you will not make a ship decision before this date, regardless of what the results look like (prevents peeking and novelty-effect false positives). Fifth, the guardrail conditions — if guardrail X moves by more than Y, what happens.' },
      { type: 'example', label: 'Complete decision rule: Threadline SaaS onboarding experiment', text: 'Experiment: Simplified 3-step onboarding flow (vs existing 7-step flow)\n\nDecision rule (written on launch day):\n- Primary metric: 14-day seat activation rate (user completes at least one core workflow within 14 days of seat assignment)\n- α = 0.05, two-tailed\n- Power target: 80% to detect +3pp absolute lift (MDE = +3pp from baseline 41%)\n- Required n: 1,840 per group (power calc run 2025-04-01)\n- Minimum runtime: 21 days (to cover novelty effect and full cohort maturation)\n- Guardrails: (1) Support ticket rate must not increase by more than +0.5pp. (2) 30-day churn must not increase — evaluated at 6 weeks post-launch.\n- Ship condition: primary metric p < 0.05 AND no guardrail fires. If guardrail fires, escalate to product lead before any ship decision.' },
      { type: 'heading', text: 'What Pre-Commitment Prevents' },
      { type: 'text', text: 'Pre-commitment prevents three failure modes. First, early stopping: without a minimum runtime, stakeholder pressure will push you to read the results the moment they look good. Early stopping inflates false positives and catches novelty effects that won\'t sustain. Second, metric fishing: without a pre-committed primary metric, you\'ll find significance in one of your 12 tracked metrics and call it a win. Third, post-hoc guardrail dismissal: without pre-committed guardrails, a firing guardrail becomes "probably a coincidence" or "that metric always moves a little." Pre-commitment forces honesty because the rules were set when everyone expected a clean experiment.' },
      { type: 'callout', label: 'Key insight', text: 'The hardest part of a pre-committed decision rule is following it when the results are inconvenient. A null result when the team wanted a win. A guardrail that fires when GMV is up. A result that\'s positive but came in on day 8 when the minimum runtime was day 21. Following the rule in these moments is what makes the experimentation system trustworthy. Abandoning it "just this once" trains the team that rules are suggestions, and suggestions aren\'t protection against anything.' },
      { type: 'cta', room: 'design', label: 'Practice this in the Design Room →' },
    ],
  },
  {
    id: 'cannibalization',
    category: 'Experimentation',
    title: 'Cannibalization in A/B Tests: When Your Feature Steals From Itself',
    summary: 'A feature that lifts engagement but hurts revenue is not a win. Detecting and quantifying tradeoffs between metrics is the senior experimentation skill most analysts skip.',
    readMin: 4,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'Cannibalization in A/B testing means the treatment improves one metric by pulling from another metric within the same user — not by creating new value. The classic example: a one-click checkout feature on Crafted marketplace increases conversion rate (CVR) by 3.2%. Sounds like a win. But average order value (AOV) falls 4.1%. What happened? The one-click feature lets buyers commit to smaller, more impulsive purchases. Fewer items in the cart, less deliberation, lower value per order. The feature didn\'t create new buyers — it captured the same buyers at lower revenue per transaction.' },
      { type: 'heading', text: 'How to Detect Cannibalization' },
      { type: 'text', text: 'Cannibalization is detectable when you test both metrics jointly instead of reporting each in isolation. The signature is offsetting movements: one metric is significantly up, the other is significantly down, and the magnitudes are consistent with a reallocation story rather than independent effects. The test is to compute the combined outcome — usually revenue — and check whether the net is positive. If CVR is up 3% and AOV is down 4%, the net effect on revenue depends on the starting values and whether these effects are on the same population.' },
      { type: 'example', label: 'One-click checkout: CVR up, AOV down, net GMV negative', text: 'Baseline (control group, Crafted marketplace):\nCVR: 6.1%, AOV: $88, revenue per session: $5.37\n\nTreatment group (one-click checkout):\nCVR: 6.30% (+3.2% relative), AOV: $84.40 (−4.1% relative)\nRevenue per session: 0.0630 × $84.40 = $5.32\n\nNet revenue per session change: $5.32 − $5.37 = −$0.05 (−0.9%)\n\nThe CVR lift is real. The AOV decline is real. The net effect on what actually matters — revenue per session — is a small negative. Reporting CVR in isolation would call this a win. Reporting revenue holistically reveals it\'s not.' },
      { type: 'heading', text: 'The Total Revenue Framing' },
      { type: 'text', text: 'The fix for cannibalization analysis is to test revenue holistically, not by individual funnel steps. Revenue per session = CVR × AOV. Test this composite metric as the primary metric (or as a secondary metric alongside CVR) rather than testing CVR alone. If CVR improves but the joint metric (revenue per session) doesn\'t, you haven\'t created a win — you\'ve created a more confusing funnel. The same principle applies to Prism video: testing completion rate without watch time, or testing click-through rate without session duration, can produce feature decisions that look good on one dimension while degrading the total experience.' },
      { type: 'callout', label: 'Key insight', text: 'Before finalizing the primary metric for any funnel experiment, ask: is there a complementary metric that this one can improve by pulling value from? If yes, test both jointly, or use the joint revenue/value metric as your primary. CVR is almost always in tension with AOV in commerce. Engagement is almost always in tension with satisfaction in content. The senior move is anticipating the tension before the experiment runs and designing the measurement to catch it.' },
      { type: 'cta', room: 'stats', label: 'Practice this in the Stats Room →' },
    ],
  },
  {
    id: 'hte',
    category: 'Experimentation',
    title: 'Heterogeneous Treatment Effects: When the Average Hides the Signal',
    summary: 'An average null result can mask a strong positive effect for one segment and a strong negative effect for another. HTE analysis is where the real insight lives.',
    readMin: 4,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'A null average result doesn\'t mean the treatment had no effect. It might mean the treatment had a +8% effect on one segment and a −4% effect on another, and they averaged to approximately zero. This is heterogeneous treatment effects (HTE) — the treatment effect varies by subgroup. Ignoring HTE leads to two types of errors: shipping something with a null average result when it would genuinely help a significant subgroup, or not shipping something with a positive average result when it\'s actively harming a critical segment you care about.' },
      { type: 'heading', text: 'Pre-Registering Subgroup Hypotheses' },
      { type: 'text', text: 'HTE analysis has a serious multiple testing problem. If you have 20 possible subgroup cuts (platform, cohort, geography, user type, device, feature usage, etc.), and you examine all of them looking for treatment effect heterogeneity, you will find a significant subgroup effect by chance alone — even in a completely null experiment. The protection is pre-registration: before the experiment launches, commit to the 2–3 subgroups you hypothesize will have different responses to the treatment, and evaluate only those. Pre-registered subgroup tests carry their stated alpha. Exploratory subgroup mining requires correction and should generate hypotheses, not decisions.' },
      { type: 'example', label: 'Spark social: feature works on new users, hurts power users', text: 'Feature: Guided prompt system — new users see suggested conversation starters in the feed.\nAverage treatment effect: +0.4% engagement (p = 0.31, non-significant).\nAverage result suggests no effect. Team discusses no-ship.\n\nPre-registered subgroup analysis (committed before launch):\nNew users (< 30 days on platform): +11.2% engagement (p = 0.003) — strong positive.\nPower users (daily actives with 200+ posts): −6.8% engagement (p = 0.018) — significant negative.\n\nMechanism: New users find prompts helpful. Power users find them patronizing noise that clutters their feed.\n\nDecision: Ship the feature with a targeting condition — show prompts only to users in their first 30 days. This is a better product decision than either shipping universally (harms power users) or not shipping (abandons new users who genuinely benefit).' },
      { type: 'heading', text: 'HTE Analysis Leads to Better Decisions' },
      { type: 'text', text: 'The Spark example illustrates the key output of HTE analysis: a targeting decision. Rather than "ship everywhere" or "no-ship," HTE reveals where the feature works and where it doesn\'t, enabling a conditional ship. This is typically a better decision than the binary one. For mobile vs desktop: if a feature works on mobile but hurts desktop, ship it on mobile only. For new vs returning users: if a feature helps activation but reduces retention for power users, apply it in onboarding only. HTE analysis converts a binary experiment result into a product strategy.' },
      { type: 'callout', label: 'Key insight', text: 'Pre-register your subgroup hypotheses. The question to ask before launch: "Are there specific user segments we predict will respond differently to this treatment, and why?" If you have a hypothesis with a mechanism, that\'s a pre-registered subgroup. If you\'re just planning to cut every possible dimension and see what lights up, that\'s mining — apply correction or treat results as exploratory only. The difference between pre-registered and exploratory determines whether you can act on the finding.' },
      { type: 'cta', room: 'stats', label: 'Practice this in the Stats Room →' },
    ],
  },
  {
    id: 'end-to-end-experiment',
    category: 'Experimentation',
    title: 'The End-to-End Experiment: What Senior DSs Do That Juniors Skip',
    summary: 'Most interview prep covers individual concepts. This post walks the entire lifecycle — hypothesis, metric selection, power calculation, trust checks, readout, decision.',
    readMin: 5,
    room: 'design',
    roomLabel: 'Design Room',
    content: [
      { type: 'text', text: 'Most analysts learn individual experimentation concepts — p-values, power calculations, SRM checks — but few internalize the full lifecycle and how each step connects to the next. Senior data scientists do something specific at every stage that junior analysts skip, and each skip has a predictable failure mode. Walking the full end-to-end experiment is the single best way to understand why every step exists and what breaks when you omit it.' },
      { type: 'heading', text: 'The Steps Most Analysts Skip' },
      { type: 'text', text: 'Step 1, hypothesis, is usually done. Step 2, metric selection, is usually done poorly — analysts pick the north star instead of the closest-to-hypothesis metric. Step 3, power calculation, is the most commonly skipped: teams just run until significance or until two weeks are up, whichever comes first. Skipping the power calc means you don\'t know whether your experiment can detect the effect size you care about. Step 4, SRM check, is skipped by most junior analysts because they don\'t know it exists. SRM (Sample Ratio Mismatch) means the ratio of treatment to control users doesn\'t match the intended allocation — if you assigned 50/50 but got 53/47, something in the randomization or logging pipeline is wrong, and the results are not trustworthy. Step 5, runtime decision, is where peeking happens. Step 6, debrief, is almost always skipped entirely.' },
      { type: 'example', label: 'Complete experiment spec: Crafted search ranking experiment', text: 'Hypothesis: A neural search ranking model will improve search-to-PDP conversion rate by surfacing more relevant results for buyer queries.\n\nPrimary metric: Search-to-PDP CVR (fraction of searches resulting in a product detail page view).\nSecondary metrics: Purchase rate from search, zero-result rate (guardrail).\n\nPower calc: Baseline search-to-PDP CVR = 31%. MDE = +1.5pp absolute (target effect from offline eval). Power = 80%, α = 0.05. Required n = 22,400 per group. Expected daily search users = 3,200. Minimum runtime = 14 days.\n\nSRM check plan: On day 3, verify treatment/control split is within 1% of 50/50. If split is outside 49/51, halt experiment and audit logging.\n\nDecision rule: Read on day 14. Ship if primary metric p < 0.05 AND zero-result rate is not significantly elevated. If guardrail fires, escalate before any ship decision.\n\nDebrief: Document result, business impact estimate, mechanism hypothesis, and one follow-up experiment. Store in experiment log.' },
      { type: 'heading', text: 'The Debrief: The Most Skipped Step' },
      { type: 'text', text: 'The debrief is where experiment knowledge compounds. A well-run debrief documents: the result (point estimate, CI, primary metric, guardrails), the business impact estimate (dollars or percentage of north star), the mechanism hypothesis (why did the treatment move the metric?), and at least one follow-up question the result raised. Teams that skip debriefs run experiments in isolation — each one a one-off rather than part of a learning system. Teams that maintain an experiment log and debrief consistently develop institutional knowledge about what types of changes move which metrics, what the typical effect sizes are, and what the failure modes have been. That knowledge is the infrastructure that makes future experiments faster and more targeted.' },
      { type: 'callout', label: 'The complete lifecycle', text: '1. Hypothesis (what change, why, predicted mechanism)\n2. Primary metric (closest to hypothesis, not north star)\n3. Power calculation (MDE, n per group, runtime — before launch)\n4. Guardrail pre-commitment (what must not move)\n5. Decision rule (α, minimum runtime, ship conditions)\n6. SRM check (on day 3, before reading any metric results)\n7. Readout (at pre-committed date, not before)\n8. Decision (ship / no-ship / iterate — with reasoning)\n9. Debrief (result + business impact + mechanism + follow-up)' },
      { type: 'cta', room: 'design', label: 'Practice this in the Design Room →' },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // STATISTICS
  // ══════════════════════════════════════════════════════════════
  {
    id: 'type1-type2',
    category: 'Statistics',
    title: 'Type I vs Type II Errors: What They Actually Mean in Product Decisions',
    summary: 'Type I: shipping something that doesn\'t work. Type II: not shipping something that does. The cost of each depends on your product context — not just your alpha level.',
    readMin: 6,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'Every experiment has two ways to be wrong. A Type I error is a false positive: you conclude the treatment works when it doesn\'t. You ship something that has no real effect, or worse, a negative effect you didn\'t detect. A Type II error is a false negative: you conclude the treatment doesn\'t work when it actually does. You miss a real improvement and don\'t ship something that would have helped. These two errors are in tension — reducing one increases the other, and the right tradeoff depends on the cost of each mistake in your specific context.' },
      { type: 'heading', text: 'Alpha Controls Type I; Power Controls Type II' },
      { type: 'text', text: 'Alpha (the significance threshold) sets the Type I error rate. If alpha = 0.05, you\'ll incorrectly conclude the treatment works in 5% of experiments where it actually does nothing. Lowering alpha to 0.01 reduces Type I errors — you\'re harder to fool — but it also makes it harder to detect real effects, increasing Type II errors. Power (1 − beta) sets the Type II error rate. At 80% power, you\'ll correctly detect real effects 80% of the time and miss them 20% of the time. Raising power to 95% reduces Type II errors but requires a larger sample size. You cannot simultaneously minimize both error types without infinite data.' },
      { type: 'example', label: 'Email UX vs payment flow: different alpha thresholds', text: 'Scenario A: Testing a new email subject line format for re-engagement campaigns.\nDecision reversibility: High — if it underperforms, revert in 1 day. Cost of shipping something that doesn\'t work: low.\nRecommended alpha: 0.10. A higher false positive rate is acceptable because the cost of a false positive is low and the cost of missing a real win (Type II) is higher.\n\nScenario B: Testing a new payment flow that introduces a new billing confirmation step.\nDecision reversibility: Low — payment changes affect trust and may cause support spikes. Cost of shipping something that breaks: high.\nRecommended alpha: 0.01. A lower false positive rate is required because accidentally shipping a degraded payment experience is expensive and trust-damaging.\n\nSame statistical framework, different threshold, because the cost asymmetry is different.' },
      { type: 'heading', text: 'When to Accept Higher Type I Risk' },
      { type: 'text', text: 'Low-cost, reversible decisions can tolerate higher Type I error rates. UI copy changes, email subject lines, minor feature tweaks — these can be tested with alpha = 0.10 or even 0.15 in high-velocity product environments where the cost of missing a win (Type II) exceeds the cost of shipping a marginal feature (Type I). High-stakes, hard-to-reverse decisions require stricter thresholds: billing changes, identity flow changes, privacy-related features, or anything affecting security or trust. A false positive in these contexts can erode user trust in ways that take months to repair.' },
      { type: 'callout', label: 'The tradeoff in one sentence', text: 'Lowering alpha reduces Type I errors but increases Type II errors. Raising power reduces Type II errors but requires more data. You choose the tradeoff by asking: in this specific context, is it worse to ship something that doesn\'t work (Type I), or to miss something that does (Type II)? The answer sets your alpha and power targets before the experiment runs.' },
      { type: 'cta', room: 'stats', label: 'Practice this in the Stats Room →' },
    ],
  },
  {
    id: 'practical-vs-statistical',
    category: 'Statistics',
    title: 'Statistical Significance vs Practical Significance: The Distinction That Changes Decisions',
    summary: 'A 0.01% CVR lift can be statistically significant at scale. It is almost never practically significant. Knowing which you\'re looking at prevents bad ship decisions.',
    readMin: 5,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'Statistical significance answers the question: is this effect real, or could it be noise? Practical significance answers a different question: is this effect large enough to care about? At sufficient scale, almost any non-zero effect becomes statistically significant. With 10 million users, you can detect a 0.002% CVR lift with p < 0.05. That lift is real. It is almost certainly not worth the engineering cost, the maintenance burden, or the product complexity it introduces. Confusing these two questions produces ship decisions that are analytically defensible but commercially indefensible.' },
      { type: 'heading', text: 'Minimum Detectable Effect as the Right Frame' },
      { type: 'text', text: 'The practical significance question should be answered before the experiment runs, not after. The tool is the Minimum Detectable Effect (MDE): the smallest lift that would meaningfully change a business decision. To set the MDE, ask: if the treatment produces a lift smaller than X, would we ship it? If the answer is no — because the lift doesn\'t justify the engineering cost, or the effect is too small to compound into meaningful revenue — then X is your practical significance threshold. You set the MDE, run the power calculation with that MDE, and design the experiment accordingly. When the results come in, statistical significance only matters if the observed lift exceeds the MDE.' },
      { type: 'example', label: 'Crafted CVR: what lift size justifies the engineering cost?', text: 'Context: Crafted marketplace is considering a checkout redesign. Engineering estimate: 3 weeks (1 engineer).\nOpportunity cost: 3 weeks × $8,000 engineer week = ~$24,000 in eng cost.\nMonthly checkout volume: 180,000 transactions.\nAOV: $58.\n\nBreak-even lift calculation:\n$24,000 / ($58 × 180,000) = 0.23% absolute CVR lift to cover eng cost in month 1.\nFor a 12-month payback: $24,000 / 12 = $2,000/month needed → 0.019% absolute CVR lift.\n\nMDE recommendation: Set MDE at 0.15% absolute (a conservative threshold above the break-even). Any detected lift below 0.15% is real but practically irrelevant — the feature doesn\'t pay for itself. Any lift above 0.15% justifies the investment.\n\nResult: If p < 0.05 but lift = 0.04%, this is statistically significant and practically irrelevant. Do not ship.' },
      { type: 'heading', text: 'The Communication Problem' },
      { type: 'text', text: 'The hardest part of this distinction is communicating it to stakeholders who see "statistically significant" and conclude "ship it." The framing that works: "The result is statistically significant, which means the effect is real and not noise. However, the observed lift is 0.04%, which at our volume translates to approximately $4,200/month in incremental revenue. The engineering cost to maintain this feature is estimated at X. On a purely financial basis, the feature doesn\'t pay for itself within a reasonable horizon. I\'d recommend not shipping." This converts the statistical result into business terms and frames the decision correctly.' },
      { type: 'callout', label: 'The two questions to answer for every experiment result', text: '1. Is the effect real? (Statistical significance — p-value and confidence interval)\n2. Is the effect large enough to matter? (Practical significance — does the lift exceed the pre-set MDE?)\n\nBoth must be yes to ship. Statistical significance alone is not sufficient.' },
      { type: 'cta', room: 'stats', label: 'Practice this in the Stats Room →' },
    ],
  },
  {
    id: 'variance-reduction',
    category: 'Statistics',
    title: 'Variance Reduction in Experiments: Why It Matters and What to Do About It',
    summary: 'High variance in your outcome metric means you need longer experiments or more users. CUPED, stratification, and better metric selection all reduce variance.',
    readMin: 6,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'Variance is the noise in your outcome metric. It\'s how much the metric bounces around between users, independent of any treatment effect. High variance means the signal you\'re trying to detect — the treatment effect — is hard to separate from the background noise. The standard response to high variance is running longer experiments or recruiting more users. Both cost time and traffic. Variance reduction techniques give you the same statistical power at lower cost — effectively letting you run shorter experiments without sacrificing rigor.' },
      { type: 'heading', text: 'The Core Idea: Control for Pre-Experiment Behavior' },
      { type: 'text', text: 'CUPED (Controlled-experiment Using Pre-Experiment Data) is the dominant variance reduction technique in product experimentation. The insight behind it: a large fraction of the variance in your outcome metric is predictable from users\' behavior before the experiment started. Users who purchased frequently before the experiment will purchase frequently during it. Users who were inactive before will be inactive during it. If you can explain and remove the pre-experiment contribution to variance, the residual variance — the part the experiment needs to detect a treatment effect against — is much smaller.' },
      { type: 'example', label: 'CUPED formula and expected reduction', text: 'CUPED adjustment:\nY_adjusted = Y - θ(X - E[X])\n\nWhere:\n- Y = outcome metric during experiment (e.g., purchases per user)\n- X = pre-experiment covariate (e.g., purchases per user in the 4 weeks before experiment)\n- E[X] = mean of X across all users\n- θ = Cov(Y, X) / Var(X) — the coefficient that optimally removes X\'s contribution to variance in Y\n\nTypical result:\nOriginal metric variance: 0.142\nAdjusted metric variance: 0.084\nVariance reduction: 41%\n\nEffect of 41% variance reduction: equivalent to running the experiment with 41% more users, or reducing required runtime from 14 days to 8 days for the same power. No additional traffic needed.' },
      { type: 'heading', text: 'When CUPED Works Best' },
      { type: 'text', text: 'CUPED works best when two conditions hold: the pre-experiment period is stable (not itself affected by a major product change or seasonal event), and the covariate is highly correlated with the outcome metric. The correlation coefficient between X and Y is the key driver of variance reduction — the higher the correlation, the more variance you can remove. For session-level engagement metrics, using the prior 2-4 weeks of the same metric as the covariate typically achieves 20-50% variance reduction. For rarer events (purchases, subscription conversions), using the same metric over a longer lookback window (8-12 weeks) may be needed to achieve meaningful correlation.' },
      { type: 'callout', label: 'Key insight', text: 'Variance reduction is equivalent power without additional users. A 40% variance reduction means you can run an experiment with 40% fewer users (or for 40% less time) and achieve the same statistical power as the original design. In high-traffic environments where experiments run quickly, the benefit is modest. In lower-traffic products where experiments run for 3-4 weeks to reach the required sample, variance reduction can cut runtimes nearly in half — a significant operational improvement.' },
      { type: 'cta', room: 'stats', label: 'Practice this in the Stats Room →' },
    ],
  },
  {
    id: 'bayesian-vs-frequentist',
    category: 'Statistics',
    title: 'Bayesian vs Frequentist A/B Testing: What\'s the Real Difference?',
    summary: 'You don\'t need to pick a side to understand the practical tradeoffs. The choice affects how you interpret results and communicate uncertainty — both matter in product work.',
    readMin: 5,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'The Bayesian vs frequentist debate has consumed enormous energy in statistics. For product analytics, the practical difference is narrower than the philosophical debate suggests, but it\'s not zero. The choice affects how you set up the experiment, how you interpret the results, and critically, what you\'re allowed to do mid-experiment. Getting this distinction right changes how you communicate uncertainty to stakeholders and how you handle the common case where someone wants to peek at results before the experiment finishes.' },
      { type: 'heading', text: 'Frequentist: Fixed Design, Binary Decision' },
      { type: 'text', text: 'The frequentist framework is what most product teams use by default. You pre-commit to a sample size (or runtime), collect data, and at the end run a hypothesis test. The output is a p-value and a confidence interval. The decision is binary: reject the null (ship) or fail to reject it (don\'t ship). The key constraint is that you must commit to a stopping rule before you start. Peeking at results and stopping early inflates your false positive rate — the p-value only has its stated properties if you collect the pre-planned sample.' },
      { type: 'heading', text: 'Bayesian: Continuous Monitoring, Probability Distribution' },
      { type: 'text', text: 'The Bayesian framework starts with a prior distribution over the treatment effect (your belief before seeing data) and updates it as data arrives, producing a posterior distribution (your updated belief after seeing data). The output is not a p-value but a probability distribution over possible effect sizes. You can say: "Given the data so far, there is an 87% probability that the treatment effect is positive." This is the interpretation most people want from p-values but incorrectly apply. The Bayesian approach allows continuous monitoring without the false positive inflation that plagues frequentist peeking, because the posterior is always valid — it\'s just more or less precise depending on how much data you have.' },
      { type: 'example', label: 'Spark social: continuous notification test', text: 'Spark social is testing a new notification ranking algorithm. The team wants to check results daily to stop early if either harm or strong benefit is apparent.\n\nFrequentist approach: Run for 14 days, no interim reads. At day 14, apply t-test. Any daily peek requires Bonferroni correction (alpha = 0.05 / 14 reads ≈ 0.0036 per read), making detection very conservative.\n\nBayesian approach: Set a prior based on historical notification experiments (typical lift range: -5% to +15% on D7 retention). Update the posterior daily. Stop when the probability that the treatment effect exceeds +2% (practical significance threshold) crosses 95%, or when probability of harm exceeds 80%.\n\nAt day 8: posterior shows 91% probability of positive effect, 73% probability the effect exceeds +2%. Continue.\nAt day 11: posterior shows 95% probability of positive effect, 81% probability effect exceeds +2%. Stop — pre-specified stopping criterion met.' },
      { type: 'callout', label: 'The false dichotomy most teams live in', text: 'Most product teams use frequentist methods but interpret results as if they were Bayesian. They look at p = 0.03 and say "there\'s a 97% chance the treatment works" — which is a Bayesian statement, not a frequentist one. This produces overconfidence in results. The honest frequentist interpretation is narrower; the Bayesian interpretation is richer but requires explicit priors. The practical recommendation: use frequentist methods with pre-committed stopping rules when you can commit to a fixed runtime; use Bayesian methods when you genuinely need continuous monitoring or want to quantify belief rather than just binary decisions.' },
      { type: 'cta', room: 'stats', label: 'Practice this in the Stats Room →' },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // AMBIGUOUS PROBLEMS
  // ══════════════════════════════════════════════════════════════
  {
    id: 'ambiguous-10-steps',
    category: 'Ambiguous Problems',
    title: 'How to Break Down Any Ambiguous Product Question in 10 Steps',
    summary: 'Interviewers asking ambiguous questions are not looking for your metrics list. They want to see you convert a fuzzy business question into structured analysis. Here\'s the framework.',
    readMin: 5,
    room: 'cases',
    roomLabel: 'Cases Room',
    content: [
      { type: 'text', text: 'Most candidates hear "why is retention falling?" and immediately reach for metrics. Engagement, DAU/MAU, session length — a list of things to look at. That\'s the wrong first move. The question is ambiguous. Retention for whom? Falling how fast? Compared to what baseline? Over what time window? Jumping to analysis before answering these questions produces analysis of the wrong problem. The 10-step framework is a forcing function that makes you think before you query.' },
      { type: 'heading', text: 'Steps 1–5: Understand the Problem Before Touching Data' },
      { type: 'text', text: 'Step 1: Restate the problem in your own words. This forces you to surface hidden assumptions. "We\'re seeing a decline in retention" becomes "we\'re seeing a decline in D30 retention among users acquired in the last 90 days on iOS." Step 2: Identify the decision-maker. Who asked this question and what decision are they trying to make? A PM wants to know what to build. A VP wants to know whether to escalate. The same data produces different recommendations depending on who needs to act. Step 3: Define success. What would a satisfying answer look like? What decision does it enable? Step 4: Scope the time horizon. Is this a recent spike or a multi-month trend? Recent changes suggest a launch or bug; structural trends suggest a product-market fit issue. Step 5: List what you know. What data exists? What has already been investigated?' },
      { type: 'example', label: '"Why is retention falling?" walked through all 10 steps', text: 'Step 1 — Restate: D30 retention for new Threadline users dropped from 61% to 48% over the last 6 weeks.\nStep 2 — Decision-maker: Head of Product, deciding whether to delay a scheduled feature launch and redirect engineering to onboarding.\nStep 3 — Success definition: identify the specific user behavior or product experience driving the drop, with enough confidence to prioritize an intervention.\nStep 4 — Time horizon: 6-week trend starting after the Jan 14 onboarding redesign. Not a spike — consistent decline.\nStep 5 — What we know: redesign shipped Jan 14. D7 retention unchanged. D30 dropped. New users complete the onboarding checklist at the same rate.\nStep 6 — What we don\'t know: whether users who completed onboarding are reaching the "aha moment" (first successful workflow). What the D30 drop looks like by acquisition channel.\nStep 7 — Decompose: D30 retention = D7 retention × D7-to-D30 conversion. D7 is flat, so the problem is in the D7-to-D30 window — users start but don\'t form a habit.\nStep 8 — Design a proxy if needed: if D30 is too slow, use "core workflow completed in first 14 days" as a leading indicator.\nStep 9 — State assumptions: assuming the Jan 14 redesign is the primary change in the window. Assuming D7 retention is a reliable signal of short-term engagement quality.\nStep 10 — Recommendation: investigate what the onboarding redesign changed between day 7 and day 30. Hypothesis: removed a prompt that re-engaged users in week 2. Suggested action: audit the re-engagement email sequence for users who passed day 7 before and after Jan 14.' },
      { type: 'callout', label: 'Why most candidates skip steps 1–4', text: 'Steps 1–4 feel slow. The instinct under interview pressure is to demonstrate knowledge quickly — list metrics, name frameworks, show you know retention. But interviewers are watching for the opposite: do you slow down enough to understand what you\'re actually being asked? A candidate who spends 90 seconds on steps 1–4 and produces a precisely targeted analysis is demonstrating more seniority than a candidate who spends 90 seconds listing every possible metric.' },
      { type: 'cta', room: 'cases', label: 'Practice problem breakdown in the Cases Room →' },
    ],
  },
  {
    id: 'proxy-design',
    category: 'Ambiguous Problems',
    title: 'Proxy Design: What to Do When You Don\'t Have the Exact Data',
    summary: '"We don\'t have that data" is never a complete answer. Senior analysts propose proxies with stated limitations. Here\'s how to do it under interview pressure.',
    readMin: 6,
    room: 'cases',
    roomLabel: 'Cases Room',
    content: [
      { type: 'text', text: '"We don\'t have that data" is a dead end. It\'s technically true in many situations — lifetime value isn\'t observable until a user leaves, 12-month retention takes 12 months, and true engagement quality requires surveys you haven\'t run. But treating unavailable data as a blocker signals analytical passivity. Senior analysts respond differently: they name what they can\'t observe, then design a proxy they can observe — and label it explicitly as a proxy so everyone knows what they\'re working with.' },
      { type: 'heading', text: 'The Five-Step Proxy Design Process' },
      { type: 'text', text: 'Step 1: Name the true outcome. Be precise — not "engagement" but "probability a user is still active at month 12." Step 2: Identify correlated leading indicators. What behaviors in the first 30 days predict 12-month outcomes? Session frequency, feature adoption depth, invite rate, profile completion with profile usage? Step 3: Test the correlation on historical data. Pull cohorts where you do have 12-month data and check which early behaviors predict long-run outcomes. Step 4: Pick the proxy with the highest correlation and fastest signal. If D30 login frequency correlates at r=0.74 with 12-month retention and you can observe it 11 months earlier, that\'s your proxy. Step 5: Label it as a proxy in every communication — never present it as the real thing.' },
      { type: 'example', label: 'Designing a proxy for 12-month LTV using D30 behavior on Crafted', text: 'True outcome: 12-month LTV (total buyer GMV over first year).\nProblem: Only observable for cohorts that are 12+ months old.\n\nLeading indicators tested on 6 historical cohorts:\n- D30 purchase count → correlation with 12-month LTV: r = 0.71\n- D30 unique seller interactions → r = 0.68\n- D30 save-to-wishlist count → r = 0.43 (weaker signal)\n- Whether user left a review in first 30 days → r = 0.61\n\nBest proxy: D30 purchase count (fastest + strongest signal).\nProxy label: "D30 purchase count is used as a proxy for 12-month LTV. Historical correlation: r = 0.71 across 6 cohorts (n=3,200 users/cohort). We will validate against actual 12-month LTV for the Jan cohort in Q4."\n\nThis proxy lets the team run experiments with 30-day readouts rather than 12-month wait times.' },
      { type: 'callout', label: 'Key insight', text: 'Proxy metrics decouple when the product changes significantly. A D30 purchase count proxy trained on Crafted\'s pre-recommendation-engine behavior may not hold after you ship a personalization algorithm that changes how users discover products. Re-validate proxy correlations after major product changes — don\'t assume the historical relationship persists.' },
      { type: 'text', text: 'In interviews, the proxy design question often sounds like: "We want to improve user quality — how would you measure that?" The trap is answering with a vague metric like "engagement score." The strong answer names the true outcome (long-term retention or revenue), explains why it\'s not directly observable in the interview timeframe, then designs a specific proxy with a stated validation plan. The validation plan — "I\'d back-test this proxy on 6 historical cohorts and check whether the correlation holds" — is the detail that separates a strong answer from a vague one.' },
      { type: 'cta', room: 'cases', label: 'Practice proxy design in the Cases Room →' },
    ],
  },
  {
    id: 'sound-senior',
    category: 'Ambiguous Problems',
    title: '20 Answer Patterns That Signal Analytical Seniority',
    summary: 'The difference between analyst-level and senior-level answers is often phrasing and structure, not knowledge. These 20 patterns are worth internalizing before any interview loop.',
    readMin: 5,
    room: 'cases',
    roomLabel: 'Cases Room',
    content: [
      { type: 'text', text: 'Senior data science interviews aren\'t testing whether you know the formulas — they\'re testing how you think and communicate. The difference between a "junior-sounding" answer and a "senior-sounding" answer is often structural: not more knowledge, but a different shape. The junior answer lists options. The senior answer makes a recommendation with reasoning. The junior answer says "it depends." The senior answer says "my default would be X, because Y — the exception is if Z, in which case I\'d do W." Learning these patterns is one of the highest-leverage things you can do before an interview loop.' },
      { type: 'heading', text: 'The Core Upgrade: From Options to Recommendations' },
      { type: 'text', text: 'The single most impactful pattern upgrade is replacing "it depends" with a structured recommendation. Every analytical question has conditional answers — what to do depends on context. But "it depends" as a stopping point signals that you\'re a junior analyst waiting for the context to be handed to you. A senior answer structures the dependency explicitly: "My recommendation is X, under the assumption that Y. If Y is not true — for example if [specific condition] — then I\'d go with Z instead, because [reason]."' },
      { type: 'example', label: 'Before and after: the recommendation upgrade', text: 'Question: "How would you measure whether our new checkout feature is successful?"\n\nJUNIOR: "It depends on what the goal is. We could look at CVR, time to checkout, abandonment rate, revenue per session..."\n\nSENIOR: "My primary metric would be checkout completion rate among users who enter checkout — that\'s the most direct measure of whether the feature reduces friction. I\'d also track average order value as a sanity check that we\'re not completing more low-value orders, and refund rate as a guardrail. The decision threshold: if checkout completion rate improves by more than 0.5 percentage points with no degradation in AOV or refunds, that\'s a ship."' },
      { type: 'heading', text: 'Ten Patterns Worth Internalizing' },
      { type: 'list', items: [
        '"My default assumption is X. Tell me if that\'s wrong and I\'ll adjust." — signals you\'re making a decision, not waiting for instructions.',
        '"Before I pick metrics, let me make sure I understand the business goal." — shows you care about the right problem.',
        '"The most important thing to check first is [X], because [reason]. Everything else is secondary." — demonstrates prioritization.',
        '"I\'d compute this at the user level, not the session level, because [reason]." — explicit denominator ownership.',
        '"The risk here is [X]. I\'d add [guardrail metric] to catch it." — proactive thinking, not reactive.',
        '"This result is statistically significant but the effect size is [X]. At our scale that\'s [$Y] in annual revenue — which [is/isn\'t] material." — business translation.',
        '"A naive analysis would show X. But there\'s a confound here: [Z]. The right approach accounts for it by [method]." — demonstrates statistical maturity.',
        '"I\'d decompose this before generating hypotheses. The rate could be down because of [numerator] or [denominator] — those have different root causes." — analytical discipline.',
        '"My recommendation is [X]. The key assumption is [Y]. If that assumption is wrong, I\'d change my recommendation to [Z]." — structured uncertainty.',
        '"I don\'t have enough data to be confident, but the pattern is consistent with [hypothesis]. I\'d want to validate by [specific check] before acting on it." — intellectual honesty.',
      ]},
      { type: 'heading', text: 'The Closing Move' },
      { type: 'text', text: 'Every senior answer ends with a recommendation and a next step, even under uncertainty. The formula: "Based on what we\'ve discussed, my recommendation is [X]. The key risk is [Y], so before we ship I\'d want to [specific validation]. If that check passes, I\'d feel confident moving forward." This closing move signals that you know the job of a data scientist isn\'t to produce a beautiful analysis — it\'s to enable a decision.' },
      { type: 'callout', label: 'The seniority signal in one sentence', text: '"My recommendation is X, assuming Y. The key risk is Z, which I\'d mitigate by doing W. If W reveals a problem, I\'d revisit the recommendation."\n\nThis sentence pattern — recommendation, assumption, risk, mitigation — is the fingerprint of a senior analytical communicator.' },
      { type: 'cta', room: 'cases', label: 'Practice analytical communication in the Cases Room →' },
    ],
  },
  {
    id: 'five-question-types',
    category: 'Ambiguous Problems',
    title: 'The 5 Question Types in Every DS Product Analytics Interview Loop',
    summary: 'Diagnose a metric movement. Measure whether something is working. Identify an opportunity. Build a decision model. ML/product modeling. Each has a different structure and opening move.',
    readMin: 4,
    room: 'cases',
    roomLabel: 'Cases Room',
    content: [
      { type: 'text', text: 'Every DS product analytics interview asks roughly the same five types of questions, dressed in different product clothing. The candidate who recognizes the type immediately can apply the right framework from the first sentence. The candidate who doesn\'t recognize it treats every question the same way — usually by listing metrics — and produces undifferentiated answers. Type recognition is a skill that\'s entirely learnable, and it\'s one of the highest-leverage things to internalize before a loop.' },
      { type: 'heading', text: 'The Five Types and Their Opening Moves' },
      { type: 'text', text: 'Type 1: Metric definition — "how would you measure X?" The opening move is to clarify what decision the metric informs, then define numerator, denominator, and grain before naming the metric. Type 2: Experiment design — "how would you test X?" The opening move is to state the hypothesis, then the primary metric, then ask about the current baseline and available traffic. Type 3: Root cause analysis — "a metric moved, what happened?" The opening move is always decompose before hypothesize — separate numerator from denominator before generating a single hypothesis. Type 4: Business case — "should we build or do X?" The opening move is to size the opportunity, estimate the cost, and frame the decision as expected value. Type 5: Estimation — "how many X are there?" The opening move is to build a structured breakdown from observable anchors rather than guessing.' },
      { type: 'example', label: 'Recognizing the type from the question surface', text: '"How would you measure the success of Prism\'s new episode recap feature?" → Type 1 (metric definition). Open with: "Before I name metrics, let me clarify what decision this is informing — are we measuring whether to ship the feature, or how to improve it post-launch?"\n\n"Our watch time per session dropped 12% last week — what happened?" → Type 3 (RCA). Open with: "Before I generate hypotheses, I want to decompose this. Watch time per session = sessions × average watch time per session. Which component moved — session count or watch time?"\n\n"Should we build a native search feature for Crafted marketplace?" → Type 4 (business case). Open with: "I\'d want to size the opportunity first — what portion of buyers aren\'t finding what they\'re looking for, and what\'s the estimated revenue impact of closing that gap?"' },
      { type: 'callout', label: 'The mistake: treating a metric question like an experiment question', text: '"How would you measure engagement on Spark?" is a metric definition question. The wrong move is to immediately say "I\'d run an A/B test." No one asked you to test anything — they asked you to define engagement. Applying the experiment framework to a metric definition question shows you haven\'t recognized the type. The right move: define the metric (numerator, denominator, grain, what decision it informs), then mention that once defined, you\'d validate it empirically.' },
      { type: 'cta', room: 'cases', label: 'Practice all five question types in the Cases Room →' },
    ],
  },
  {
    id: 'problem-framing',
    category: 'Ambiguous Problems',
    title: 'Problem Framing: Restating the Question Before Touching Data',
    summary: 'The first 60 seconds of an ambiguous problem answer should never include a metric. Restate the business decision, the success definition, and the scope — then start the analysis.',
    readMin: 6,
    room: 'cases',
    roomLabel: 'Cases Room',
    content: [
      { type: 'text', text: 'The most common interview mistake is answering the question as literally asked, rather than the question being asked in spirit. "Why is engagement dropping?" is not asking for a list of engagement metrics. It\'s asking you to diagnose a business problem — and to do that, you first need to know which engagement metric, on which surface, over what time period, for which user segment. Answering before you know these things produces work that\'s analytically precise and directionally wrong.' },
      { type: 'heading', text: 'The Reframing Moves' },
      { type: 'text', text: 'There are four reframing moves worth making at the start of any ambiguous question. First, clarify the decision: "Before I answer, let me make sure I understand the decision we\'re trying to make — is this about whether to invest in fixing engagement, or diagnosing why it moved?" Second, scope the metric: "Which engagement metric are we focused on — session frequency, session length, feature adoption, or something else?" Third, scope the time horizon: "Is this a recent spike or a trend over multiple months? The answer determines whether we\'re looking at a product change or a structural shift." Fourth, identify the stakeholder: "Who needs this analysis, and what will they decide with it?" These four moves together transform a vague question into a tractable problem.' },
      { type: 'example', label: '"Why is engagement dropping?" → reframed', text: 'Original question: "Why is engagement dropping on Spark?"\n\nAfter reframing:\n- Metric scoped: daily message send rate among users active in the last 30 days (not total engagement, which is too broad).\n- Time horizon scoped: 3-week decline, started after the Jan 21 feed redesign.\n- Surface scoped: drop concentrated on the main feed, not in DMs.\n- Stakeholder scoped: Head of Product, deciding whether to roll back the feed redesign or iterate on it.\n\nReframed question: "What in the Jan 21 feed redesign reduced daily message sending among existing active users on the main feed?"\n\nThis is a question you can actually answer. The original wasn\'t.' },
      { type: 'text', text: 'The reframing moves feel slow under interview pressure. They aren\'t. Spending 90 seconds scoping the question saves 15 minutes of analysis on the wrong problem. And interviewers are watching for the reframing — it\'s one of the clearest signals of analytical seniority. A junior analyst charges forward with the first interpretation of the question. A senior analyst pauses and says: "Before I dive in, let me make sure I understand what we\'re trying to figure out."' },
      { type: 'callout', label: 'The one sentence that signals seniority', text: '"Before I answer, let me restate the problem to make sure we\'re aligned on what we\'re trying to figure out." This sentence buys you 60 seconds to think, signals analytical discipline, and almost always prompts the interviewer to add useful context. Use it every time you hear an ambiguous question.' },
      { type: 'cta', room: 'cases', label: 'Practice problem framing in the Cases Room →' },
    ],
  },
  {
    id: 'stakeholder-communication',
    category: 'Ambiguous Problems',
    title: 'Calibrating Your Answer for PM vs Engineer vs Exec',
    summary: 'Same finding, three different communication styles. Senior analysts know which audience they\'re talking to and adjust depth, vocabulary, and recommendation framing accordingly.',
    readMin: 5,
    room: 'cases',
    roomLabel: 'Cases Room',
    content: [
      { type: 'text', text: 'Data scientists present analysis. Stakeholders want decisions. This mismatch is the single most common communication failure in product analytics. The analyst produces a thorough methodology section, a careful treatment of confidence intervals, and a list of caveats. The PM or exec hears background noise before the recommendation. The fix is structural: lead with the recommendation, support with evidence, and move the methodology to the appendix where it belongs.' },
      { type: 'heading', text: 'Headline First, Evidence Second, Caveats Third' },
      { type: 'text', text: 'The structure that works for non-technical stakeholders is: headline (the recommendation or finding in one sentence), supporting evidence (the two or three data points that make the case), and caveats (what could be wrong about the analysis). This is the opposite of how most analysts present — they build up to the conclusion chronologically, starting with methodology and ending with the recommendation. Stakeholders often check out before the recommendation arrives. Leading with it ensures the most important information is always heard.' },
      { type: 'example', label: 'A/B test results: what to say to a PM vs what to put in the appendix', text: 'Finding: Checkout redesign experiment results.\n\nTO THE PM (headline + evidence + caveat):\n"The redesign increased checkout completion by 1.8 percentage points — that\'s approximately $270K/month in additional revenue at our current volume. The result is statistically significant (p = 0.012) and we didn\'t see any degradation in refund rate. One caveat: the experiment ran over a promotional period, so the lift may be slightly inflated — I\'d recommend monitoring for 2 weeks post-launch to confirm.\n\nMY RECOMMENDATION: ship, with post-launch monitoring."\n\nIN THE APPENDIX (for engineering or statistical reviewers):\n- Full confidence intervals: [+0.9pp, +2.7pp] at 95% confidence\n- SRM check: passed (50.1% / 49.9% split)\n- Secondary metrics: AOV flat (+0.3%, p = 0.41), refund rate flat (+0.1pp, p = 0.62)\n- Power achieved: 94% (exceeded 80% target)\n- Novelty effect check: week-over-week lift was stable at 1.7–1.9pp' },
      { type: 'text', text: 'The "so what" principle governs every slide and every section: it should end with an implication, not a description. "Checkout completion rate increased by 1.8pp" is a description. "This translates to $270K/month — I recommend shipping" is the same fact with a so-what. Stakeholders remember implications, not statistics. Every time you write a section that ends with a number, ask: what does this number mean for the decision we\'re making?' },
      { type: 'callout', label: 'What to skip for non-technical audiences', text: 'Skip: p-values (use "the result is reliable" or "we\'re confident this is real"), confidence intervals (use "the range of plausible impacts is $X to $Y"), methodology details (say "we ran a standard A/B test" and stop), and qualifications that don\'t change the recommendation. Non-technical audiences don\'t have the statistical vocabulary to use this information — giving it to them creates confusion, not confidence.' },
      { type: 'cta', room: 'cases', label: 'Practice stakeholder communication in the Cases Room →' },
    ],
  },
  {
    id: 'opportunity-sizing',
    category: 'Ambiguous Problems',
    title: 'Opportunity Sizing: How to Estimate Impact Before Running an Experiment',
    summary: 'Is this worth building? Sizing the opportunity with back-of-envelope math using base rates, addressable population, and realistic lift prevents teams from optimizing the wrong things.',
    readMin: 4,
    room: 'cases',
    roomLabel: 'Cases Room',
    content: [
      { type: 'text', text: 'Before an experiment is designed, before an engineering sprint is scoped, before a PM writes a PRD — there\'s a question that should always be answered first: is this worth building? Opportunity sizing is the analytical tool that answers it. It doesn\'t require perfect data. It requires structured estimation with documented assumptions. The output is a rough range of expected impact, which tells you whether the opportunity is worth the investment to pursue more rigorously.' },
      { type: 'heading', text: 'The Three-Step Framework' },
      { type: 'text', text: 'Opportunity sizing follows three steps: identify the addressable population, estimate the conversion improvement, and multiply by the value per conversion. Each step requires an assumption. The assumptions should be explicit, conservative, and stated alongside the estimate. A sizing that hides its assumptions is useless — you can\'t interrogate it, update it, or communicate it. A sizing that surfaces its assumptions is a tool for alignment.' },
      { type: 'example', label: 'Checkout abandonment feature sizing', text: 'Feature: a "save for later" prompt when a user abandons checkout.\n\nStep 1 — Addressable population:\nMonthly checkout starts: 2,000,000\nUsers who abandon checkout: 34% = 680,000/month\nUsers who abandon due to "not ready to buy" (vs. payment issues): ~40% = 272,000/month\nThis is our addressable group — users the feature can plausibly recapture.\n\nStep 2 — Conversion improvement:\nBenchmark: similar save-for-later features recapture 8-15% of abandoners.\nConservative estimate: 8% recapture rate = 21,760 incremental purchases/month.\n\nStep 3 — Value per conversion:\nAverage order value: $62\nIncremental revenue: 21,760 × $62 = $1.35M/month = ~$16M/year\n\nIs that worth 3 weeks of engineering? Probably yes.' },
      { type: 'heading', text: 'Making Assumptions Explicit' },
      { type: 'text', text: 'The sizing above has three major assumptions: what fraction of abandoners are "not ready to buy" (vs having payment problems), what recapture rate to use, and whether AOV of recaptured orders matches baseline. Each of these could be wrong. The right way to handle this is to report a range: "Under conservative assumptions (5% recapture, 50% of abandoners addressable), impact is $6M/year. Under optimistic assumptions (12% recapture, 60% addressable), impact is $24M/year. Base case is ~$16M/year." That range gives stakeholders the information they need to make a prioritization decision.' },
      { type: 'text', text: 'In interviews, the sizing itself matters less than the structure. Interviewers are not checking whether you got the right number — they\'re checking whether you know how to build the estimate. The correct opening move is always: "Let me size the addressable population first, then estimate the conversion improvement, then multiply by value per unit. I\'ll be explicit about my assumptions at each step." Then execute the steps, naming each assumption as you make it.' },
      { type: 'callout', label: 'The sizing formula', text: 'Impact = Addressable population × Realistic conversion improvement × Value per conversion\n\nAddressable population = total users who could plausibly be affected (not total users)\nConversion improvement = conservative estimate of what fraction you can move\nValue per conversion = revenue, LTV, or whatever metric the business cares about\n\nReport a range, not a point estimate. The range signals that you understand the uncertainty.' },
      { type: 'list', items: [
        'Addressable population ≠ total user base. Scope it to users for whom the change is relevant.',
        'Use conservative lift estimates — optimistic sizings don\'t survive stakeholder scrutiny.',
        'State every assumption explicitly. Hidden assumptions are the failure mode of opportunity sizing.',
        'In interviews, the process matters as much as the number. Show the structure.',
      ]},
      { type: 'cta', room: 'cases', label: 'Practice opportunity sizing in the Cases Room →' },
    ],
  },
  {
    id: 'build-or-not',
    category: 'Ambiguous Problems',
    title: 'Should We Build This? A Framework for Data-Backed Build/No-Build Decisions',
    summary: 'Expected value = P(success) × uplift × ARPU × addressable users. Below a threshold, the cost of building exceeds the expected return. Here\'s how to structure that conversation.',
    readMin: 4,
    room: 'cases',
    roomLabel: 'Cases Room',
    content: [
      { type: 'text', text: 'The build-or-not decision is never binary — it\'s build vs buy vs partner vs delay vs abandon. Most product teams frame it as build vs no-build and evaluate it primarily on cost. The more useful frame is: what\'s the expected value of each option, and which one maximizes strategic leverage? Cost is one input. It\'s not the only one.' },
      { type: 'heading', text: 'The Four Questions That Drive the Decision' },
      { type: 'text', text: 'Question 1: Is this core or context (the Geoffrey Moore distinction)? Core capabilities are what differentiate your product — they should be built, because building them creates proprietary advantage. Context capabilities are table stakes every competitor has — these are buy or partner candidates, because building them produces no differentiation at significant cost. Question 2: What\'s the build cost vs buy cost over a 3-year horizon? Include maintenance, not just initial development. Question 3: What\'s the opportunity cost? Every engineering sprint spent on this is not spent on something else — what is that something else worth? Question 4: Does this create or consume strategic leverage? Does building this capability unlock future capabilities (multiplier), or is it a one-time feature that doesn\'t compound?' },
      { type: 'example', label: 'Crafted marketplace: build vs buy an AI recommendation engine', text: 'Decision: Should Crafted build a proprietary AI recommendation engine for product discovery, or buy an off-the-shelf solution?\n\nCore vs context: Product recommendation on a handmade goods marketplace requires understanding artisan-specific attributes (material, technique, regional style) that no generic engine understands well. This is arguably core — a proprietary engine could be a meaningful differentiator.\n\nBuild cost: 2 ML engineers × 6 months = ~$300K fully loaded. Ongoing: 0.5 FTE/year = ~$75K/year maintenance.\nBuy cost: Best-in-class vendor = $8K/month = $96K/year. No maintenance FTE needed.\n3-year total build: $300K + $225K = $525K. 3-year total buy: $288K.\n\nStrategic leverage: Proprietary data flywheel — a custom engine learns from Crafted-specific buyer-seller interactions in ways a vendor engine doesn\'t. At scale, this compounds.\n\nRecommendation: Build, but phase it — start with a vendor for the first 6 months to ship faster, then migrate to a proprietary engine as the data flywheel develops. The 3-year cost differential ($237K) is acceptable if the custom engine produces measurable improvement in discovery CVR by year 2.' },
      { type: 'callout', label: 'The most common mistake: evaluating on cost alone', text: 'Teams that evaluate build/buy on 12-month cost almost always buy. Teams that evaluate on 3-year strategic leverage often build the core capability. The question to ask is not "what does this cost this quarter?" but "what does owning vs renting this capability mean for what we can do in year 3?" That time horizon shift changes most build/buy decisions.' },
      { type: 'cta', room: 'cases', label: 'Practice build-or-not decisions in the Cases Room →' },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // GENAI & ML ANALYTICS
  // ══════════════════════════════════════════════════════════════
  {
    id: 'deflection-resolution',
    category: 'GenAI Analytics',
    title: 'Deflection ≠ Resolution: The Proxy Trap in AI Support Metrics',
    summary: 'A bot that deflects 80% of support tickets looks great. Until you track what happened to those users downstream. This is the most common GenAI metric mistake.',
    readMin: 6,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    content: [
      { type: 'text', text: 'Deflection is a seductive metric for AI support systems. It\'s easy to measure — a ticket that doesn\'t reach a human agent is a deflected ticket — and it maps cleanly to cost savings. Teams celebrate high deflection rates as evidence that their AI is working. But deflection and resolution are not the same thing. A bot that deflects 80% of tickets by sending users in circles has high deflection and near-zero resolution. The metric looks great. The users are furious.' },
      { type: 'heading', text: 'The Ladder: Output, Outcome, Impact' },
      { type: 'text', text: 'Deflection is an output metric — it measures what the system did. Resolution is an outcome metric — it measures whether the user\'s problem was actually solved. Trust is the impact metric — it measures what the support experience did to the user\'s long-run relationship with the product. The mistake most teams make is optimizing the output while ignoring the outcome. A bot can be tuned to deflect almost any ticket — end conversations early, provide generic answers, make human escalation difficult. That maximizes deflection and destroys resolution. The metric goes up, the business outcome goes down.' },
      { type: 'example', label: 'Prism support bot: deflection 68%, same-issue re-contact 34%', text: 'Prism launched an AI support bot in Q3. Key metrics at month 1:\n\nDeflection rate: 68% (of tickets opened, 68% were closed without human agent involvement)\nUser satisfaction (CSAT) post-bot: 3.1 / 5.0\nSame-issue re-contact rate (opened a second ticket for the same issue within 7 days): 34%\nEscalation-to-human rate: 11% (but only when users actively requested a human)\n\nInterpretation: The bot is deflecting 68% of tickets, but 34% of deflected users are coming back with the same issue — their problem wasn\'t solved the first time. True resolution rate: approximately 68% × (1 − 0.34) = ~45%. The remaining 55% either escalated, re-contacted, or gave up. The 68% deflection headline significantly overstates the bot\'s effectiveness.' },
      { type: 'text', text: 'How to measure resolution when there\'s no explicit "problem solved" signal: use follow-up contact rate (did the user open another ticket for the same issue within 7 days?), re-open rate (did they reopen the same ticket?), post-chat satisfaction signal (CSAT or thumbs up/down immediately after the bot interaction), and long-run behavioral signal (did users who contacted support retain at the same rate as users who didn\'t?). None of these is perfect. Together, they triangulate resolution much better than deflection alone.' },
      { type: 'callout', label: 'Key insight', text: 'Deflection is a cost metric disguised as a quality metric. When an AI support system is optimized for deflection without guardrails on resolution, it will find the cheapest path to deflection — which is often making it hard for users to get real help. The right guardrail: same-issue re-contact rate. If deflection goes up but re-contact also goes up, the bot is not solving problems — it\'s creating the appearance of solving them.' },
      { type: 'cta', room: 'metrics', label: 'Practice GenAI metric design in the Metrics Room →' },
    ],
  },
  {
    id: 'ml-vs-crosstab',
    category: 'GenAI Analytics',
    title: 'When to Use ML vs a Simple Crosstab',
    summary: 'Over-indexing on ML for problems solvable with a crosstab is a red flag in senior interviews. Here\'s the decision tree for when ML actually adds value.',
    readMin: 5,
    room: 'cases',
    roomLabel: 'Cases Room',
    content: [
      { type: 'text', text: 'The most reliable red flag in a senior DS interview is proposing an ML model for a problem a pivot table answers in 5 minutes. Over-engineering is a signal that you\'re pattern-matching to "impressive tools" rather than thinking about the actual question. The better signal is knowing precisely when ML adds value that simpler methods can\'t provide — and being able to explain why.' },
      { type: 'heading', text: 'When ML Wins' },
      { type: 'text', text: 'ML earns its complexity when: (1) the relationship between features and outcome is non-linear and the non-linearity matters for the decision, (2) there are many interacting features and the interactions carry signal, (3) you need to generalize to new inputs (new users, new products) rather than summarize existing data, and (4) you have enough labeled data that the model can learn the signal rather than memorize noise. These four conditions need to hold simultaneously. One or two is usually not sufficient.' },
      { type: 'example', label: 'Threadline churn prediction: when ML adds value and when it doesn\'t', text: 'Version 1 — Crosstab approach:\nSegment users by login frequency × feature adoption × contract tier. Label each segment as high/medium/low churn risk based on historical churn rates.\nResult: Identifies "low login + low feature adoption + monthly contract" as 68% churn rate. Actionable, interpretable, requires zero ML.\nLimitation: Misses interactions between account size, support ticket volume, and billing history that a crosstab can\'t capture.\n\nVersion 2 — ML approach:\nGradient boosted tree on 40+ features. AUC = 0.82 vs crosstab AUC ~0.71.\nAdditional value: The model catches a non-obvious predictor — accounts that expand seat count in month 2 but don\'t onboard the new seats within 14 days have 3× higher churn. The crosstab wouldn\'t find this without someone hypothesizing it first.\n\nConclusion: The ML model adds 0.11 AUC. Whether that justifies the infrastructure, retraining schedule, and interpretability cost depends on the intervention volume. For a CS team that can contact 50 accounts/week, the crosstab tiers may be sufficient. For an automated intervention system that contacts 2,000 accounts/week, the ML precision matters.' },
      { type: 'callout', label: 'The over-engineering trap', text: 'Teams that adopt ML because it\'s more impressive — not because it solves a problem the crosstab can\'t — burn engineering time on model infrastructure, monitoring, and retraining while the crosstab would have shipped in a week and performed almost as well. The right question before reaching for ML: "What specific limitation of a simpler model am I solving?" If you can\'t answer that precisely, start with the simpler model.' },
      { type: 'text', text: 'In interviews, the ML vs crosstab question is often implicit. "How would you predict which users will churn?" is not asking for an ML model — it\'s asking you to reason about the right tool for the problem. The strong answer is: "I\'d start with a segmentation approach using the two or three strongest known predictors. If that gives the business what it needs — a ranked list with good enough precision — I\'d ship the simple approach. I\'d use ML if the simple approach misses meaningful signal that affects the quality of the intervention."' },
      { type: 'cta', room: 'cases', label: 'Practice ML vs analytics decisions in the Cases Room →' },
    ],
  },
  {
    id: 'genai-metrics',
    category: 'GenAI Analytics',
    title: 'Measuring GenAI Products: Edit Rate, Hallucination Rate, Task Completion, and Satisfaction',
    summary: 'LLM outputs don\'t fit neatly into traditional engagement metrics. Here\'s a framework for defining what success looks like for AI-generated features.',
    readMin: 4,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    content: [
      { type: 'text', text: 'GenAI features break the standard engagement metric framework. Did the user click? On AI-generated content, a click doesn\'t mean the output was good — it might mean the user started editing, which means the output needed fixing. Did the user return? For an AI writing assistant, return visits mean the user found the tool useful, but one interaction that perfectly completed a task is also a success. Traditional engagement metrics treat frequency as proxy for quality. For GenAI, the relationship is more complex.' },
      { type: 'heading', text: 'The Full Metric Stack for a GenAI Feature' },
      { type: 'text', text: 'The hierarchy: (1) Task completion rate — did the user accomplish the goal they came to the feature with? This is the top-level outcome metric. (2) Acceptance rate — did the user use the AI output at all, or dismiss it immediately? Low acceptance is an early failure signal. (3) Edit rate — of users who accepted the output, how much did they change it? High edit rate means the output was close but not good enough. Zero edit rate could mean perfect output or total copy-paste behavior. (4) Re-generation rate — how often did users click "try again"? High re-generation signals low first-pass quality. (5) Task time — did the AI save the user time on the task compared to doing it manually?' },
      { type: 'example', label: 'AI recipe suggestions feature on Crafted — full metric stack', text: 'Feature: AI-generated recipe suggestions using ingredients from a user\'s recent purchases.\n\nTask completion rate: 71% (user opened a recipe and bookmarked it or started shopping)\nAcceptance rate: 58% (of suggestions shown, user expanded to read full recipe)\nEdit rate: N/A for recipe viewing — tracked as "add to shopping list" modifications: 34% added at least one ingredient substitution\nRe-generation rate: 22% (clicked "show me different recipes")\nTask time: Not directly measurable — proxy: "returned to AI recipe feature within 7 days" = 44% (D7 re-engagement)\n\nGuardrails:\nHallucination rate (recipe uses ingredients user didn\'t buy or haven\'t purchased recently): 4.1% of accepted recipes — elevated, needs work\nSafety violation rate (allergen-related errors): 0.0% (monitored closely)\nLatency (time to first suggestion): p50 = 1.8s, p95 = 4.3s (p95 is on the edge of acceptable)' },
      { type: 'callout', label: 'Key insight', text: 'Edit rate is a two-sided signal. Very high edit rate (>60%) means the AI output needed substantial work — users are correcting, not accepting. Very low edit rate (<5%) means either the AI is excellent or users are copy-pasting without reading. Neither extreme is clearly good. The target zone for most AI writing features is 15–40% edit rate: users are accepting the output as a useful starting point but customizing it to their needs, which signals both quality and genuine engagement.' },
      { type: 'cta', room: 'metrics', label: 'Practice GenAI metric design in the Metrics Room →' },
    ],
  },
  {
    id: 'rag-quality-metrics',
    category: 'GenAI Analytics',
    title: 'How to Measure RAG Quality: Retrieval vs Generation vs End Task',
    summary: 'A RAG system has two failure modes — bad retrieval and bad generation — and they require different diagnostics. Here\'s how to set up the measurement layer.',
    readMin: 4,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    content: [
      { type: 'text', text: 'A RAG (Retrieval-Augmented Generation) system has two distinct components that can fail independently: the retrieval step that fetches relevant documents from a knowledge base, and the generation step that synthesizes those documents into an answer. A system can retrieve perfectly and generate a hallucinated answer. It can also generate fluently from retrieved documents that were irrelevant to the question. Treating RAG quality as a single metric obscures which component is breaking — which makes it impossible to fix the right thing.' },
      { type: 'heading', text: 'Retrieval Metrics: Did We Find the Right Documents?' },
      { type: 'text', text: 'Precision@k asks: of the k documents retrieved, how many were actually relevant to the query? If k=5 and 3 of the 5 documents were relevant, precision@k = 60%. This measures retrieval noise — irrelevant documents retrieved alongside relevant ones contaminate the generation step. Recall@k asks: of all the relevant documents in the knowledge base, how many did we retrieve in the top k? If there are 8 relevant documents and the system retrieved 4 of them, recall@k = 50%. This measures retrieval coverage — missing relevant documents means the generator won\'t have the information it needs.' },
      { type: 'example', label: 'Threadline knowledge base RAG evaluation setup', text: 'Knowledge base: 4,200 Threadline product documentation pages.\nEvaluation set: 180 user questions with human-labeled relevant documents (built from support ticket analysis).\n\nRetrieval results (k=5):\nPrecision@5: 0.71 (of 5 retrieved docs, 3.5 on average are relevant)\nRecall@5: 0.58 (of all relevant docs per question, 58% are in the top 5)\n\nGeneration results (evaluated by LLM-as-judge against human reference answers):\nFaithfulness: 0.82 (answers stay within the retrieved context 82% of the time)\nAnswer relevance: 0.74 (answers address the question directly 74% of the time)\n\nDiagnosis: Recall@5 at 0.58 is the weak point — the system is missing 42% of relevant documents. When relevant documents are missing, the generator either hallucinates or gives an incomplete answer. Priority fix: improve embedding quality or expand retrieval to k=8.' },
      { type: 'text', text: 'Faithfulness and answer relevance can be evaluated two ways: reference-based evaluation compares the generated answer to a human-written reference answer using metrics like ROUGE or BLEU. LLM-as-judge evaluation uses a separate LLM (often GPT-4 or Claude) to score faithfulness and relevance on a rubric. Reference-based evaluation is cheaper but requires a large human-labeled set. LLM-as-judge scales more easily and often correlates well with human judgment on structured rubrics, but introduces its own biases.' },
      { type: 'callout', label: 'Key insight', text: 'The end-task metric (did the user get a useful answer?) is the north star, but it hides which component failed. A low end-task score could be a retrieval problem, a generation problem, or both. Always evaluate retrieval and generation separately so you know where to invest the improvement effort. Improving generation quality when the retrieval is broken wastes resources — the generator can\'t produce good answers from bad context.' },
      { type: 'cta', room: 'metrics', label: 'Practice RAG metric design in the Metrics Room →' },
    ],
  },
  {
    id: 'ab-testing-llm',
    category: 'GenAI Analytics',
    title: 'A/B Testing LLM Features: What\'s Different and What\'s Not',
    summary: 'Experimentation fundamentals still apply — but LLM outputs have high variance, latency effects, and user adaptation patterns that complicate standard experiment design.',
    readMin: 5,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'Standard A/B testing assumes that within your experiment window, users\' responses to the treatment are reasonably stable. For most product features — UI changes, ranking changes, notification copy — this holds. For LLM features, it doesn\'t. User trust in AI systems builds over time. Initial skepticism depresses acceptance and engagement metrics in week 1. By week 3, users who found the feature useful have integrated it into their workflow and their metrics look very different. Running an LLM experiment for 7 days and reading out week 1 data is like judging a new colleague after their first day.' },
      { type: 'heading', text: 'The Three Challenges Specific to LLM Experiments' },
      { type: 'text', text: 'Challenge 1: Longer stabilization window. User trust in AI builds over weeks, not days. Experiments should run 3–4 weeks minimum, with the primary metric readout weighted toward the last 2 weeks rather than the full run. Challenge 2: Metric selection. "Better" for an AI feature is not obvious. Higher CTR doesn\'t mean better if users are clicking to see and immediately dismissing. Task completion rate, edit rate, and re-generation rate are more diagnostic. Challenge 3: Output variability. The same user, same prompt, different response — LLM outputs vary across runs. This adds variance to your metrics that has nothing to do with the treatment effect. Address this by using larger sample sizes than a comparable non-LLM experiment would require.' },
      { type: 'example', label: 'Prism AI episode recap feature — experiment design', text: 'Feature: AI-generated episode recaps shown after a user completes a streaming session on Prism.\nHypothesis: Recaps that surface narrative continuity cues ("in the next episode...") increase next-session click-through by helping users remember where they left off.\n\nExperiment design decisions:\n- Primary metric: Next-session start rate within 48 hours of watching a recap (not recap CTR — that\'s just curiosity, not the outcome we care about)\n- Runtime: 4 weeks (not 2) — AI trust stabilization + avoid novelty effect reading\n- Metric readout window: weeks 3 and 4 only for the primary metric; weeks 1-4 for secondary metrics as trend visualization\n- Output variability mitigation: each user-session pair is assigned a single recap variant at the start of the session (not regenerated per view), so the LLM variability is fixed at assignment, not compounded\n- Sample size: 20% larger than the power calc for an equivalent non-AI test, to account for additional variance from AI output quality variation\n- Guardrail: recap generation error rate must stay below 1% (empty or truncated recaps)' },
      { type: 'callout', label: 'Key insight', text: 'Paired preference evaluation is an underused tool for LLM experiments. Instead of measuring behavioral outcomes only, show a random sample of treatment outputs alongside control outputs to a human rater panel (or LLM-as-judge) and ask which is better. Preference rates of 60%+ toward treatment, validated against the behavioral metric direction, give you converging evidence that the feature improvement is real rather than a noisy behavioral signal.' },
      { type: 'cta', room: 'stats', label: 'Practice A/B testing design in the Stats Room →' },
    ],
  },
  {
    id: 'churn-prediction',
    category: 'GenAI Analytics',
    title: 'Churn Prediction: Label Design, Feature Engineering, and Business Actionability',
    summary: 'A churn model nobody acts on is a wasted model. The analysis starts with label design and ends with an intervention — here\'s the full pipeline.',
    readMin: 5,
    room: 'cases',
    roomLabel: 'Cases Room',
    content: [
      { type: 'text', text: 'A churn prediction model answers one question: who is likely to leave? It does not answer why they\'re leaving, what would make them stay, or whether contacting them will help or hurt. Teams that forget this distinction build models with impressive AUC scores and then design interventions based on model features — "low login frequency predicts churn, so let\'s remind users to log in" — that address the symptom rather than the cause. The model is a scoring tool, not a causal explanation.' },
      { type: 'heading', text: 'Three Business Uses of a Churn Model' },
      { type: 'text', text: 'Use 1: Early intervention targeting. Score users by churn probability and contact the highest-risk segment before they leave. This is the most common use case. The key constraint: you can only contact a fraction of high-risk users (CS capacity, email deliverability), so the model needs high enough precision in the top decile to make the targeting worth the cost. Use 2: Product prioritization. Segment churned users by the features they didn\'t use vs retained users. This surfaces product gaps — not causal drivers, but hypotheses worth testing. Use 3: Cohort health analysis. Plot churn probability over time for users acquired in different cohorts. Are newer cohorts healthier? Is a specific acquisition channel producing high-churn users?' },
      { type: 'example', label: 'Threadline churn model → intervention design → lift measurement', text: 'Model: Gradient boosted tree predicting 90-day churn for Threadline SaaS accounts. AUC = 0.79.\n\nTop model features: low feature adoption score (top feature), no admin login in last 21 days, month-to-month contract, <3 team members active.\n\nIntervention design: CS team contacts top 15% of accounts by churn score with a proactive check-in + feature adoption offer. Contacts 200 accounts/month.\n\nMistake to avoid: do not design the intervention around "increase login frequency" — low login is a symptom, not a cause. The CS team is trained to ask "what workflow were you hoping to solve?" and then demo the relevant feature.\n\nLift measurement: held-out control group (50 high-risk accounts not contacted) vs treatment (200 contacted). 90-day retention: treatment 67%, control 44%. Incremental retention: +23pp. Revenue retained: 200 accounts × 23pp lift × $480 ACV/month = $22K/month, or ~$264K ARR saved.' },
      { type: 'callout', label: 'The AUC trap', text: 'Optimizing model AUC when the business question is "which users to contact" is a misaligned objective. What matters is precision in the top decile of your score distribution — the accounts you actually contact. A model with AUC = 0.82 that has mediocre precision@top10% is less useful than a model with AUC = 0.76 that concentrates true positives in the top decile. Evaluate the model on the metric that matches the intervention design, not the headline metric.' },
      { type: 'cta', room: 'cases', label: 'Practice churn analysis in the Cases Room →' },
    ],
  },
  {
    id: 'feature-importance',
    category: 'GenAI Analytics',
    title: 'Feature Importance vs Causality: Why Your Model\'s Top Feature Might Be a Confounder',
    summary: 'SHAP values tell you what the model learned — not what caused the outcome. Mixing the two up leads to bad interventions and wrong product decisions.',
    readMin: 4,
    room: 'cases',
    roomLabel: 'Cases Room',
    content: [
      { type: 'text', text: 'Feature importance tells you which variables the model found most useful for predicting the outcome. It does not tell you which variables caused the outcome. This distinction sounds academic. Its consequences are not. A team that uses feature importance to design interventions — "low login frequency is our top feature, so we\'ll run a campaign to increase logins" — is treating a symptom as a cause. If low login frequency is a symptom of losing interest in the product, increasing login frequency through notifications doesn\'t address the underlying loss of interest. It creates logged-in disengaged users instead of absent disengaged users.' },
      { type: 'heading', text: 'Three Traps: Reverse Causality, Selection Bias, Survivorship' },
      { type: 'text', text: 'Reverse causality trap: the model shows "filed a support ticket in month 1" as a top churn predictor. Does this mean support tickets cause churn? Or does it mean users who encountered a serious problem (which causes churn) were also more likely to file a ticket? The relationship is real — ticket filers do churn at higher rates — but the direction is backward. Contacting all ticket-filers with retention offers doesn\'t fix the underlying problem that caused them to file tickets. Selection bias trap: feature importance is measured on your observed user base. Users who churned before day 30 aren\'t in your 90-day churn model. Their behavior pattern — possibly very different from day-90 churners — is invisible to the model. Survivorship trap: the model is only trained on users who stuck around long enough to be labeled. Short-term churners teach the model nothing.' },
      { type: 'example', label: 'Threadline churn: feature importance vs causal hypothesis vs experiment', text: 'Top model feature: login frequency in days 15-30 (SHAP value: 0.41, highest in model).\n\nNaive interpretation: "Increase logins to reduce churn."\nIntervention: Send daily reminder notifications to low-login-frequency users.\nResult: Logins increased 18%. Churn unchanged. (Users logged in and immediately logged out — they had nothing to do in the product.)\n\nCausal hypothesis: Low login frequency is a symptom of low product value discovery. Users who found at least one workflow that matched their use case logged in regularly. Users who didn\'t, didn\'t.\n\nRe-designed intervention: In-app workflow discovery prompt for users in days 15-30 who have logged in fewer than 3 times. Surface a relevant use case based on their role/industry.\n\nExperiment result: 12pp higher 90-day retention in treatment vs control. The intervention addressed the cause (no discovered use case), not the symptom (low logins).' },
      { type: 'callout', label: 'How to go from feature importance to causal hypothesis to experiment', text: '1. Identify a high-importance feature: "low login frequency in days 15-30."\n2. Generate the causal hypothesis: "What could cause both low logins AND churn? Loss of perceived product value."\n3. Design an experiment that addresses the hypothesized cause, not the feature: "Show users a workflow relevant to their use case in days 15-30."\n4. Measure whether the experiment changes the feature (login frequency) AND the outcome (churn). If the feature changes but the outcome doesn\'t, your causal hypothesis is wrong — go back to step 2.' },
      { type: 'cta', room: 'cases', label: 'Practice causal reasoning in the Cases Room →' },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // PRODUCT SENSE FOR DS
  // ══════════════════════════════════════════════════════════════
  {
    id: 'product-sense-ds',
    category: 'Product Sense',
    title: 'Product Sense for Data Scientists: What\'s Actually Being Tested',
    summary: 'DS product sense is not PM product sense. You\'re not being asked what to build — you\'re being asked how to know if it\'s working, why a metric moved, and what the data says to do next.',
    readMin: 6,
    room: 'cases',
    roomLabel: 'Cases Room',
    content: [
      { type: 'text', text: 'Product sense for a data scientist is not the same thing as product sense for a PM. A PM with product sense knows what to build. A DS with product sense knows how to know if it\'s working, why a metric moved, and what the data says to do next. Interviewers who ask DS candidates about product sense are testing a specific skill: the ability to move between user behavior, business outcomes, and data — and to understand how they connect. The candidate who recites user stories and frameworks is answering the wrong question.' },
      { type: 'heading', text: 'The Three Habits That Define DS Product Sense' },
      { type: 'text', text: 'Habit one: user empathy first. Before touching a model or a metric, ask what job the user is hiring this feature to do. Not "what does the feature do?" but "what problem does the user have that the feature solves?" This framing changes what you measure. A recommendation algorithm on Prism video app isn\'t just trying to maximize clicks — it\'s trying to solve the user\'s problem of not knowing what to watch next. That reframe changes the metric from CTR to task completion: did the user find something to watch that they actually finished?' },
      { type: 'text', text: 'Habit two: business model alignment. Every feature either generates revenue, protects revenue, or reduces cost. A DS with product sense knows which of these the feature they\'re analyzing belongs to — and uses that to decide what the primary metric should be. Prism\'s recommendation algorithm protects and grows subscription revenue by driving viewing habits that reduce churn. Crafted\'s search algorithm generates revenue by connecting buyers to listings they\'re willing to purchase. These are different causal chains, and they require different metrics.' },
      { type: 'example', label: 'Prism recommendation algorithm — what the DS needs to understand first', text: 'Before redesigning Prism\'s recommendation algorithm, a DS with product sense asks:\n\n1. What job is the user hiring recommendations for?\n   → "Help me find something worth watching without spending 10 minutes browsing."\n\n2. How does this connect to the business model?\n   → Prism is subscription-based. Churn is the primary business risk. Users who fail to find content churn.\n   → Better recommendations → more successful viewing sessions → lower churn → higher LTV.\n\n3. What is the causal chain from algorithm change → user behavior → business outcome?\n   → Algorithm change → better cold-start recommendations → higher first-session completion rate → higher D7 retention → lower monthly churn.\n\nOnly after answering these three questions should the DS touch the model. Skipping them produces a technically improved algorithm that optimizes the wrong thing.' },
      { type: 'heading', text: 'Why Pure Technical Answers Fail Senior DS Interviews' },
      { type: 'text', text: 'Senior DS interviews routinely include questions like "how would you improve Prism\'s recommendation system?" A purely technical answer — "I\'d use a matrix factorization model with implicit feedback signals, add temporal decay to weight recent views, and tune the exploration-exploitation tradeoff via epsilon-greedy" — answers the wrong question. The interviewer wants to know whether you understand the business problem before you design the solution. The right answer starts with: "Before I talk about the model architecture, let me make sure I understand what we\'re optimizing for. The business goal is to reduce churn by helping users find content they\'ll actually complete. That changes the optimization target from click-through to session completion rate, which has implications for the label definition and the feature set."' },
      { type: 'callout', label: 'The product sense signal', text: 'DS product sense is demonstrated by the questions you ask before you answer. "What is the user trying to accomplish?" "How does this feature connect to the revenue model?" "What is the causal chain from feature usage to business outcome?" A candidate who asks these questions before proposing a model or a metric is demonstrating that they understand the job — not just the tools.' },
      { type: 'cta', room: 'cases', label: 'Practice product sense in the Cases Room →' },
    ],
  },
  {
    id: 'feature-launch-metrics',
    category: 'Product Sense',
    title: 'How to Define Success Metrics for Any Feature Launch',
    summary: 'North star → diagnostics → guardrails → decision rule. The four-layer metric structure that makes your launch measurable from day one.',
    readMin: 4,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    content: [
      { type: 'text', text: 'Most teams define success metrics for a feature launch the same way: they pick one or two numbers that look good and call it done. A week after launch, the PM asks "did it work?" and the analyst says "CVR is up 2%." That answer is incomplete. It tells you the feature moved one number — it doesn\'t tell you whether the feature moved the business, whether it degraded anything important, or what the causal mechanism was. A three-layer metric stack answers all of these.' },
      { type: 'heading', text: 'The Three-Layer Stack' },
      { type: 'text', text: 'Layer one is the direct feature metric: a measure of whether users are actually using the feature and whether the feature does what it was designed to do. This metric is closest to the product change — it\'s the most sensitive to the feature and the fastest to move. For a "Saved Searches" feature on Crafted marketplace, the direct metric is the save rate: what fraction of users who perform a search save it? Layer two is the business impact metric: does feature adoption actually move the north star? The causal question is whether the feature is generating real value or just driving usage of itself. For Saved Searches, the business question is: do users who save searches convert to purchase at higher rates? Layer three is the guardrail metric: what must not degrade? Guardrails catch the failure mode of optimizing the direct feature metric at the expense of something important.' },
      { type: 'example', label: 'Crafted "Saved Searches" feature launch — metrics defined in order', text: 'Feature: Users can save a search query and receive notifications when new matching listings appear.\n\nLayer 1 — Direct feature metric:\nSave rate: fraction of search sessions that result in at least one saved search.\nBaseline: 0% (feature doesn\'t exist). Target after launch: 8–12% of search sessions.\nWhy: Measures whether users understand and adopt the feature.\n\nLayer 2 — Business impact metric:\nSearch-originated purchase rate for users with at least one saved search vs. users without.\nHypothesis: saved search users receive a nudge when a matching item appears → they return → they convert.\nCausal chain: save → notification → return visit → purchase.\nTarget: +3–5pp purchase rate for users with saved searches vs. matched controls.\n\nLayer 3 — Guardrail metric:\nNotification opt-out rate. Saved searches trigger notifications — if notifications are too frequent or irrelevant, users will opt out of all notifications.\nThreshold: opt-out rate must not increase by more than +0.5pp within 30 days of launch.' },
      { type: 'heading', text: 'The Common Mistake: Declaring Victory at Layer One' },
      { type: 'text', text: 'The most common failure mode is declaring success based on Layer 1 alone. "Save rate hit 11%, the feature is working." But if users who save searches don\'t return and purchase at higher rates, the feature is creating activity without creating value. Feature-level engagement without business impact is the metric equivalent of a vanity number — it feels good but doesn\'t compound into anything. The discipline is to commit to checking Layer 2 before any success declaration, even if it requires waiting 30 days for enough purchase signal.' },
      { type: 'callout', label: 'The causal chain discipline', text: 'For every feature launch, write out the full causal chain before picking metrics:\nFeature usage → specific user behavior change → business outcome.\n\nFor Saved Searches: save → notification trigger → return visit → purchase.\n\nIf you can\'t write the causal chain, you haven\'t thought clearly enough about what the feature is supposed to do. The chain tells you which layer 2 metric to track and how long to wait before checking it.' },
      { type: 'cta', room: 'metrics', label: 'Practice feature launch metric design in the Metrics Room →' },
    ],
  },
  {
    id: 'search-ranking-metrics',
    category: 'Product Sense',
    title: 'Measuring Search Ranking Quality: Beyond CTR and CVR',
    summary: 'A ranking change that improves CTR on bad results is a regression. How to build a metric system that captures ranking quality, not just click behavior.',
    readMin: 4,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    content: [
      { type: 'text', text: 'Search ranking metrics have a two-sided measurement problem. On one side, you need to measure result quality: did the algorithm surface the right listings? On the other side, you need to measure user success: did the user find what they were looking for and leave satisfied? These are different questions requiring different metrics, and optimizing one without the other leads to ranking systems that look good on paper but frustrate users in practice.' },
      { type: 'heading', text: 'Result Quality Metrics' },
      { type: 'text', text: 'Precision measures the fraction of returned results that are relevant to the query. If a user searches "handmade ceramic mug" on Crafted and 7 of the top 10 results are ceramic mugs (the other 3 are unrelated), precision@10 = 70%. Zero-result rate measures the fraction of searches that return no results at all — a direct signal of index or query processing failure. Click-through rate (CTR) is a partial signal: if users click, the result was at least plausible. But CTR can be gamed by surfacing misleading thumbnails or titles. A ranking algorithm optimized purely for CTR will surface click-bait listings, not relevant ones.' },
      { type: 'text', text: 'Why CTR alone is a bad ranking metric: CTR measures curiosity, not satisfaction. A user who clicks on a result that turns out to be irrelevant contributes to CTR and to frustration simultaneously. The algorithm has no way to distinguish a productive click from a disappointed one based on CTR alone. This is why post-click behavior is essential: did the user spend time on the listing page? Did they add to cart or purchase? Did they immediately bounce back to the search results?' },
      { type: 'example', label: 'Crafted marketplace search — the metric hierarchy', text: 'North star for search: task completion rate — the fraction of search sessions where the user found a relevant item and took a forward action (PDP view > 30 seconds, wishlist add, or purchase).\n\nMetric hierarchy:\n1. Task completion rate (north star)\n   → Target: 42% of search sessions result in meaningful engagement\n2. Zero-result rate (guardrail)\n   → Current: 14.2% | Target: below 10%\n3. CTR on top-3 results (diagnostic)\n   → Current: 31% | Tracks relevance at the critical ranking positions\n4. Post-click bounce rate (diagnostic)\n   → Fraction of PDP clicks that return to search within 15 seconds\n   → Current: 22% | High bounce = CTR without relevance\n5. Search abandonment rate (diagnostic)\n   → Fraction of searches with no click at all\n   → Current: 41% | High abandonment = users giving up on search\n\nCTR sits at position 3 in this hierarchy — it informs, but it does not decide.' },
      { type: 'heading', text: 'Measuring When Users Don\'t Tell You They Found It' },
      { type: 'text', text: 'The hardest problem in search metrics is that satisfied users don\'t signal satisfaction — they just stop searching. A user who found exactly what they wanted performs a final search, clicks a result, spends time on the listing, and either purchases or saves the item. They don\'t click a "thumbs up" button. The proxy for success is behavioral: time on listing page above a threshold, forward action (add to cart, wishlist, purchase), and no return to search results within a short window. These three signals together define task completion more reliably than any single metric.' },
      { type: 'callout', label: 'Key insight', text: 'Search abandonment rate is underused as a ranking quality signal. A high abandonment rate — users who searched and clicked nothing — tells you either that the query had no good results (a supply problem) or that the results shown were not compelling (a ranking problem). Segmenting abandonment by query type distinguishes the two: generic queries with high abandonment suggest a ranking issue; niche queries with high abandonment suggest a supply gap.' },
      { type: 'cta', room: 'metrics', label: 'Practice search metric design in the Metrics Room →' },
    ],
  },
  {
    id: 'marketplace-health',
    category: 'Product Sense',
    title: 'Marketplace Health: The 5 Signals That Matter for Two-Sided Platforms',
    summary: 'Liquidity, GMV concentration, buyer-to-seller ratio, fill rate, and supply quality. What they mean, how they interact, and what breaks when one deteriorates.',
    readMin: 5,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    content: [
      { type: 'text', text: 'A marketplace can look healthy in aggregate while being deeply broken in a specific category or geography. GMV growth disguises the problem. The business is growing overall, but furniture listings on Crafted have a 47% zero-availability rate and a 3-week average time-to-ship — and new buyers who search furniture leave and don\'t come back. The four pillars of marketplace health — liquidity, balance, quality, and growth — need to be monitored at the category level, not just in aggregate, to catch these pockets before they compound.' },
      { type: 'heading', text: 'The Four Pillars' },
      { type: 'text', text: 'Liquidity is the fraction of searches that convert to a transaction. A liquid marketplace is one where buyers reliably find what they\'re looking for and sellers reliably receive orders. Low liquidity in a category means either supply is thin (few relevant listings) or quality is poor (listings exist but buyers don\'t trust them). Balance is the ratio of supply to demand by category. A marketplace can be oversupplied in one category (too many sellers, not enough buyers) and undersupplied in another (strong buyer demand, not enough listings). Both are unhealthy, but in different ways. Quality is measured through seller ratings, cancellation rate, and delivery accuracy — the signals that tell buyers whether sellers can be trusted to fulfill. Growth is the net addition of new supply and new demand: new sellers listing, new buyers transacting.' },
      { type: 'example', label: 'Crafted — liquidity by category revealing a gap in furniture', text: 'Monthly liquidity report (search sessions → purchase rate by category):\n\nJewelry: 8.4% search-to-purchase rate (healthy)\nCeramics: 6.1% (healthy)\nTextiles: 5.3% (acceptable)\nFurniture: 1.2% (critical gap)\nHome decor: 4.7% (acceptable)\n\nFurniture liquidity is 7× lower than jewelry. Decompose: furniture has 340 active listings vs. 12,000 in jewelry. Search volume for furniture terms is 18% of total search volume — it\'s a high-demand category with severe supply shortage.\n\nCanary metric check: time-to-first-order for new buyers who search furniture first = 41 days (vs. 6 days for jewelry-first buyers). New furniture buyers are churning before they convert because there\'s nothing to buy.' },
      { type: 'heading', text: 'The Canary Metric: Time-to-First-Order for New Buyers' },
      { type: 'text', text: 'If the supply side of a marketplace is healthy, new buyers should convert quickly. They search, they find relevant listings, they purchase within a session or a few return visits. When supply is thin or quality is poor in a category, new buyers in that category take much longer to convert — often churning before they do. Time-to-first-order for new buyers is the canary: a rising time-to-first-order in a specific category signals a supply-demand imbalance before it shows up in aggregate GMV. At Crafted, a 41-day time-to-first-order for furniture-first buyers (vs. 6 days for jewelry) is an early warning that the furniture category is failing new buyers.' },
      { type: 'callout', label: 'Key insight', text: 'The aggregate marketplace health metrics (total GMV, overall liquidity, platform-wide seller rating) are lagging indicators. By the time they show a problem, you\'ve already lost buyers and sellers from the affected category. The leading indicators are category-level: time-to-first-order for new buyers, zero-result rate by category, new seller acquisition rate by category, and the share of GMV concentrated in the top 5% of sellers (high concentration = fragile supply base).' },
      { type: 'cta', room: 'metrics', label: 'Practice marketplace metric design in the Metrics Room →' },
    ],
  },
  {
    id: 'notification-metrics',
    category: 'Product Sense',
    title: 'Notification Health: Why Open Rate Is the Wrong Primary Metric',
    summary: 'Open rate is a proxy for attention, not value. The right metric captures whether the notification drove the intended action without burning long-term engagement.',
    readMin: 6,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    content: [
      { type: 'text', text: 'The naive metric for a notification system is CTR (click-through rate). A notification that gets clicks looks successful. The problem: CTR measures curiosity, not value. A clickbait notification subject line — "You won\'t believe what\'s trending" — drives clicks and immediate disappointment. Users click, see nothing relevant, and form a negative association with the app\'s notifications. High CTR plus high opt-out rate is the signature of a notification system that is actively destroying long-term engagement.' },
      { type: 'heading', text: 'The Full Metric Stack' },
      { type: 'text', text: 'A healthy notification system requires metrics at every layer. Delivery rate is the hygiene check: what fraction of sent notifications actually reached the device? Low delivery rate indicates technical problems or a high uninstall rate. Open rate tracks the fraction of delivered notifications that were opened — it measures whether the subject line and timing drove attention. CTR tracks clicks from the notification into the app. Conversion rate tracks whether those clicks completed the intended action (watching a video, making a purchase, accepting a connection request). Opt-out rate is the critical guardrail: what fraction of users disabled notifications after receiving them? A rising opt-out rate means the notification system is burning the channel that enabled the engagement in the first place. Re-engagement rate answers the most important question: did the notification bring back a user who was at risk of churning?' },
      { type: 'example', label: 'Prism video app — finding the notification sweet spot', text: 'Prism runs a holdout experiment by notification volume tier to find the dose-response relationship between notification frequency and D7 retention.\n\nTier (avg notifications/day) → D7 retention → opt-out rate within 7 days:\n0–1 notifications/day → D7: 38% → opt-out: 3.1%\n2–3 notifications/day → D7: 42% → opt-out: 4.8%\n4–6 notifications/day → D7: 39% → opt-out: 9.2%\n7–10 notifications/day → D7: 31% → opt-out: 18.4%\n10+ notifications/day → D7: 22% → opt-out: 34.7%\n\nThe sweet spot is 2–3 notifications/day: highest D7 retention at an acceptable opt-out rate. Above 4/day, retention declines and opt-out rises sharply. The optimal frequency is not "as many as possible" — it is calibrated to the dose-response relationship.' },
      { type: 'heading', text: 'The Dose-Response Relationship' },
      { type: 'text', text: 'The dose-response relationship between notification volume and retention is not linear. At low volumes, notifications are positive: they re-engage users who might have forgotten about the app, surface relevant content, and drive return visits that create habit. At high volumes, the relationship flips: notifications become intrusive, users opt out, and the re-engagement channel is permanently disabled for those users. The optimal volume exists in the middle, and it is product-specific — a news app whose users want breaking alerts can sustain higher volumes than a video streaming app whose users don\'t want to be interrupted.' },
      { type: 'callout', label: 'The opt-out rate as leading indicator', text: 'Opt-out rate is the leading indicator for long-term notification system health. A rising opt-out rate tells you users are disabling the channel — and once a user opts out of notifications, the probability they re-enable is low. Monitor opt-out rate per notification type, not just in aggregate: a rising opt-out from "new content" notifications vs stable opt-out from "friend activity" notifications tells you which type is the problem. Fix the broken type before it burns the whole channel.' },
      { type: 'cta', room: 'metrics', label: 'Practice notification metric design in the Metrics Room →' },
    ],
  },
  {
    id: 'seller-incentives',
    category: 'Product Sense',
    title: 'Seller Incentive Programs: How to Measure ROI Without Getting Fooled by Selection Bias',
    summary: 'Sellers who join an incentive program are different from those who don\'t. Naive before/after comparisons overestimate impact. Here\'s the right measurement approach.',
    readMin: 4,
    room: 'cases',
    roomLabel: 'Cases Room',
    content: [
      { type: 'text', text: 'Seller incentive programs on Crafted marketplace are expensive. A quality-badge program that rewards sellers who maintain a sub-2% cancellation rate, respond within 4 hours, and achieve a 4.8+ star rating costs $18 per enrolled seller per month in cash bonuses and priority placement. The business question is: does the program actually cause quality improvement, or does it just reward sellers who were already performing well? The measurement answer changes everything about the ROI calculation.' },
      { type: 'heading', text: 'The Selection Bias Problem' },
      { type: 'text', text: 'Sellers who enroll in a quality incentive program are not a random sample of sellers. They self-select: the sellers most likely to enroll are the ones who already have high ratings, low cancellation rates, and the operational capacity to maintain them. A naive analysis compares enrollees to non-enrollees and finds that enrolled sellers have 40% higher GMV. But this is mostly selection bias — you enrolled the high performers, and of course they perform well. The program may have had zero causal effect on seller behavior while absorbing significant budget. The right metric is incremental GMV: GMV attributable to the program, not GMV generated by sellers who happened to enroll.' },
      { type: 'example', label: 'Crafted seller quality program — measuring incremental GMV', text: 'Setup: Before launching the quality badge program, randomly assign eligible sellers to treatment (enrolled, receive incentive) and holdout (eligible but not enrolled, receive no incentive). Both groups meet the quality threshold at baseline.\n\nPre-program baseline (4 weeks before launch):\nTreatment group avg monthly GMV: $1,340\nControl group avg monthly GMV: $1,360 (balanced at randomization)\n\n8 weeks post-launch:\nTreatment group avg monthly GMV: $1,580 (+$240, +17.9%)\nControl group avg monthly GMV: $1,410 (+$50, +3.7%)\n\nIncremental GMV: $240 − $50 = $190/seller/month\nProgram cost: $18/seller/month in bonuses + $22/seller in placement costs = $40/seller/month\nNet incremental GMV: $190 − $40 = $150/seller/month → program ROI is positive.\n\nThe naive analysis (total GMV of enrolled sellers = $1,580) would have overstated the program\'s impact by 7.8× ($240 vs $30.4 attributable to the program).' },
      { type: 'heading', text: 'Long-Run vs Short-Run Tension' },
      { type: 'text', text: 'Incentive programs that boost short-run GMV can create long-run perverse effects. If sellers learn that maintaining the quality badge requires passing through specific operational thresholds, some will manage to the threshold rather than managing to genuine quality. A seller who has a 4.8-star rating that drops to 4.75 in a bad week may be tempted to manipulate reviews or inflate order cancellations with sympathetic buyers. Monitor not just the average GMV impact but the distribution of quality metrics over time: are enrolled sellers converging toward the threshold (gaming) or improving beyond it (genuine quality lift)?' },
      { type: 'callout', label: 'The holdout group is non-negotiable', text: 'If you launch an incentive program without a holdout group, you cannot measure incremental impact. Before-after comparisons for all enrolled sellers are confounded by time (GMV was growing for everyone), seasonality (Q4 spikes affect all sellers), and platform changes (a new buyer acquisition campaign lifts all sellers simultaneously). The only clean counterfactual is a simultaneously running control group of equally eligible sellers who did not receive the incentive.' },
      { type: 'cta', room: 'cases', label: 'Practice incentive program analysis in the Cases Room →' },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // SQL & DATA EXECUTION
  // ══════════════════════════════════════════════════════════════
  {
    id: 'sql-funnel-analysis',
    category: 'SQL & Data',
    title: 'Funnel Analysis in SQL: From Session Start to Conversion',
    summary: 'Step-level conversion rates, drop-off diagnosis, and cohort-level funnel comparison — all in SQL. The query patterns every product analyst needs in their toolkit.',
    readMin: 5,
    room: 'code',
    roomLabel: 'Programming Lab',
    content: [
      { type: 'text', text: 'Funnel analysis in SQL has three steps: define the funnel steps as events, build the ordered sequence per user, and calculate step-by-step conversion rates. The ordering problem is where most analysts get tripped up. Events must be in sequence — a user who purchased before adding to cart (due to a direct-link checkout) should not be counted as having completed the funnel in order. The query pattern uses MAX(CASE WHEN ...) to flag whether each user completed each step, which handles the ordering correctly when you combine it with a date filter.' },
      { type: 'heading', text: 'The Three-Step Checkout Funnel Query' },
      { type: 'text', text: 'The query structure: first build a CTE that flags each user\'s completion of each funnel step using conditional aggregation, then compute step-to-step conversion rates from the aggregated flags. This pattern is more robust than self-joins because it naturally handles users who complete steps out of order or multiple times — each user produces one row in the funnel CTE regardless of how many events they generate.' },
      { type: 'example', label: 'Crafted marketplace — 3-step checkout funnel', text: 'WITH funnel AS (\n  SELECT user_id,\n    MAX(CASE WHEN event = \'cart_add\' THEN 1 ELSE 0 END) AS step1,\n    MAX(CASE WHEN event = \'checkout_start\' THEN 1 ELSE 0 END) AS step2,\n    MAX(CASE WHEN event = \'purchase\' THEN 1 ELSE 0 END) AS step3\n  FROM events\n  WHERE event_date >= \'2024-01-01\'\n  GROUP BY user_id\n)\nSELECT\n  COUNT(*) AS entered_funnel,\n  SUM(step1) AS added_to_cart,\n  SUM(step2) AS started_checkout,\n  SUM(step3) AS purchased,\n  ROUND(SUM(step2)*100.0/NULLIF(SUM(step1),0),1) AS cart_to_checkout_pct,\n  ROUND(SUM(step3)*100.0/NULLIF(SUM(step2),0),1) AS checkout_to_purchase_pct\nFROM funnel;\n\nSample output:\nentered_funnel: 48,200 | added_to_cart: 31,400 | started_checkout: 22,100 | purchased: 15,800\ncart_to_checkout_pct: 70.4% | checkout_to_purchase_pct: 71.5%\n\nThe NULLIF(SUM(step1),0) prevents division by zero if no users completed step 1.' },
      { type: 'heading', text: 'Segmentation: Finding Where a Specific Cohort Drops' },
      { type: 'text', text: 'The funnel query becomes a diagnostic tool when you add a segmentation dimension. Run the same query with a GROUP BY platform or GROUP BY cohort_week to find where a specific segment drops off. If iOS and Android users have similar cart-to-checkout rates but Android users have a 20pp lower checkout-to-purchase rate, the problem is in the Android checkout flow. The funnel query with segmentation identifies this instantly — without segmentation, the blended rate hides the Android problem.' },
      { type: 'callout', label: 'Window functions vs self-joins for funnel ordering', text: 'For strict ordering requirements — user must complete step N before step N+1 — the MAX(CASE WHEN) pattern doesn\'t enforce sequence. Use a self-join or window function approach: assign a step rank to each event using ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_timestamp), then filter for step N+1 events that occur after step N events. This is more complex but correctly handles cases where you need to verify that the funnel was traversed in order.' },
      { type: 'cta', room: 'code', label: 'Practice this in Programming Lab →' },
    ],
  },
  {
    id: 'retention-sql',
    category: 'SQL & Data',
    title: 'Retention Curves in SQL: D1, D7, D30 and What They Tell You',
    summary: 'How to compute retention at each horizon, how to visualize cohort curves, and what shape of curve tells you what about your product\'s stickiness.',
    readMin: 5,
    room: 'code',
    roomLabel: 'Programming Lab',
    content: [
      { type: 'text', text: 'Retention is the fraction of users who return N days after their first use. It is the single most important metric for product health because it measures whether users found enough value to come back. A product with 40% D7 retention is keeping nearly half of its new users engaged after a week — a strong signal. A product with 5% D7 retention is losing 95% of new users in the first week, regardless of how many it acquires. Acquisition without retention is a leaky bucket — you pour users in, and they flow out before compounding into a sustainable user base.' },
      { type: 'heading', text: 'The Cohort Approach' },
      { type: 'text', text: 'The right way to compute retention is by cohort: group users by the week they first used the product, then track what fraction of each cohort returns in subsequent weeks. This approach separates the health of individual cohorts from the aggregate metric, which is critical because a product can show stable aggregate retention while newer cohort retention is collapsing — masked by strong retention from early cohorts who are now habitual users. The query structure: define cohorts in a first CTE, join activity events to cohorts in a second CTE, then aggregate by cohort week and weeks-since-start.' },
      { type: 'example', label: 'Cohort retention query for Prism video app', text: 'WITH cohorts AS (\n  SELECT user_id, DATE_TRUNC(\'week\', MIN(event_date)) AS cohort_week\n  FROM events GROUP BY user_id\n),\nactivity AS (\n  SELECT e.user_id, c.cohort_week,\n    DATE_DIFF(\'week\', c.cohort_week, DATE_TRUNC(\'week\', e.event_date)) AS weeks_since_start\n  FROM events e JOIN cohorts c ON e.user_id = c.user_id\n)\nSELECT cohort_week, weeks_since_start,\n  COUNT(DISTINCT user_id) AS retained_users\nFROM activity\nGROUP BY 1, 2 ORDER BY 1, 2;\n\nTo convert to retention rates, divide retained_users at each week by the cohort size at week 0:\n\nSELECT\n  a.cohort_week,\n  a.weeks_since_start,\n  a.retained_users,\n  c0.cohort_size,\n  ROUND(a.retained_users * 100.0 / c0.cohort_size, 1) AS retention_pct\nFROM (\n  SELECT cohort_week, weeks_since_start, COUNT(DISTINCT user_id) AS retained_users\n  FROM activity GROUP BY 1, 2\n) a\nJOIN (\n  SELECT cohort_week, COUNT(DISTINCT user_id) AS cohort_size\n  FROM activity WHERE weeks_since_start = 0 GROUP BY 1\n) c0 ON a.cohort_week = c0.cohort_week\nORDER BY 1, 2;' },
      { type: 'heading', text: 'How to Read the Retention Table' },
      { type: 'text', text: 'The retention table has cohort weeks as rows and weeks-since-start as columns. Each cell shows the retention rate for that cohort at that time horizon. Reading diagonally gives you the same calendar week across different cohorts — a useful check for seasonal effects. Reading across a row shows the decay curve for a single cohort. Reading down a column shows whether newer cohorts are retaining better or worse than older ones at the same time horizon. If column 4 (4-week retention) is declining across the rows as you move to newer cohorts, your product is losing its grip on newer users.' },
      { type: 'callout', label: 'The shape of the curve tells you what\'s wrong', text: 'A retention curve that drops sharply in week 1 then flattens points to an onboarding problem: users who survive the first week tend to stay. A curve that drops gradually over many weeks points to a long-term engagement problem: users are slowly disengaging even after finding initial value. A curve with a "smile" (drops then rises) is extremely rare and usually indicates a product with both casual and power-user use cases. Most products should target flattening the decay curve as quickly as possible after the initial drop.' },
      { type: 'cta', room: 'code', label: 'Practice this in Programming Lab →' },
    ],
  },
  {
    id: 'cohort-analysis-sql',
    category: 'SQL & Data',
    title: 'Cohort Analysis: Why Every User Metric Should Be Segmented by Acquisition Date',
    summary: 'Aggregating across acquisition cohorts hides composition changes. A product that looks healthy in aggregate may be surviving on strong old cohorts while new cohorts fail.',
    readMin: 4,
    room: 'code',
    roomLabel: 'Programming Lab',
    content: [
      { type: 'text', text: 'Cohort analysis is any analysis that groups users by a shared starting characteristic — signup week, first purchase date, plan tier, acquisition channel — and tracks their behavior over time. The query structure is always the same: define the cohort in one CTE, join to downstream events in a second CTE, then aggregate by cohort and time period. The business question cohort analysis answers that aggregate metrics cannot: are newer users behaving differently from older users, and in which direction?' },
      { type: 'heading', text: 'The Query Structure: Define → Join → Aggregate' },
      { type: 'text', text: 'Step one is the cohort definition CTE: assign each user to their cohort based on the starting characteristic. For signup-week cohorts, this is MIN(event_date) grouped to the week level. For first-purchase cohorts, it is MIN(purchase_date). For plan-tier cohorts, it is the plan at signup. Step two is the activity join: for each user, find all downstream events and calculate the time elapsed since their cohort start. Step three is the aggregation: COUNT(DISTINCT user_id) grouped by cohort and time period, then divided by cohort size to get the retention or engagement rate.' },
      { type: 'example', label: 'Are newer Prism video app cohorts healthier than older ones?', text: 'Cohort analysis on D30 retention by signup week:\n\nSignup week | Cohort size | D30 retention\n2024-W01    | 4,200       | 38.4%\n2024-W04    | 4,800       | 36.1%\n2024-W08    | 5,100       | 31.2%\n2024-W12    | 5,400       | 28.7%\n2024-W16    | 5,200       | 26.3%\n\nTrend: D30 retention is declining steadily across newer cohorts — from 38% for January users to 26% for April users. If you only looked at aggregate D30 retention, you\'d see a blended rate of ~32% and conclude things are stable. The cohort view reveals the product is gradually losing effectiveness at retaining new users.\n\nImplication: something changed between January and April — a product change, acquisition channel mix shift, or content quality decline — that is degrading new-user retention. Cohort analysis surfaces the diagnosis that aggregate metrics hide.' },
      { type: 'heading', text: 'The Pivot Step' },
      { type: 'text', text: 'The output of the cohort query is long-format: each row is a cohort-week combination. To produce the triangle visualization (cohort weeks as rows, time-since-start as columns), you need to pivot the data. In SQL, this is done with conditional aggregation: MAX(CASE WHEN weeks_since_start = 0 THEN retention_pct END) as week_0, MAX(CASE WHEN weeks_since_start = 1 THEN retention_pct END) as week_1, and so on. Most BI tools (Looker, Metabase, Tableau) can pivot automatically if you provide the long-format query.' },
      { type: 'callout', label: 'Reading the cohort table', text: 'Reading diagonally: the same calendar week across different cohorts — useful for detecting seasonal effects or a platform-wide change.\nReading across a row: the decay curve for a single cohort — useful for understanding individual cohort health.\nReading down a column: the same time-since-start across different cohorts — the key question is whether the column values are increasing (cohorts improving), decreasing (cohorts degrading), or flat (stable product quality).\n\nIf any column is steadily declining, your product is losing effectiveness at that retention horizon for newer users.' },
      { type: 'cta', room: 'code', label: 'Practice this in Programming Lab →' },
    ],
  },
  {
    id: 'window-functions',
    category: 'SQL & Data',
    title: 'Window Functions for Product Analytics: LAG, LEAD, RANK, and Running Totals',
    summary: 'The four window function patterns that appear in almost every product analytics SQL problem — with worked examples for session analysis, ranking, and time-series metrics.',
    readMin: 5,
    room: 'code',
    roomLabel: 'Programming Lab',
    content: [
      { type: 'text', text: 'Window functions are the most powerful SQL feature most product analysts underuse. Unlike GROUP BY aggregations, window functions compute a value across a set of rows related to the current row without collapsing them into a single output row. This means you can have both row-level detail and aggregate context in the same query — which is precisely what most product analytics problems require. The four patterns you need are: ROW_NUMBER for ranking within groups, LAG/LEAD for comparing to prior or next rows, SUM OVER for running totals, and NTILE for percentile buckets.' },
      { type: 'heading', text: 'ROW_NUMBER: Ranking Within Groups' },
      { type: 'text', text: 'ROW_NUMBER() assigns a sequential integer to each row within a partition, ordered by a specified column. The most common product use: rank sellers by GMV within each category to find the top-N performers per category. The query structure is: ROW_NUMBER() OVER (PARTITION BY category ORDER BY gmv DESC) AS seller_rank. Without the PARTITION BY, you get a global ranking. With it, you restart the counter for every partition value — every category gets its own rank 1, rank 2, and so on. To filter to the top 3 sellers per category, wrap the window function in a subquery or CTE and WHERE seller_rank <= 3.' },
      { type: 'example', label: 'Crafted marketplace — top 3 sellers per category by GMV', text: 'WITH ranked_sellers AS (\n  SELECT\n    seller_id,\n    category,\n    SUM(gmv) AS monthly_gmv,\n    ROW_NUMBER() OVER (\n      PARTITION BY category\n      ORDER BY SUM(gmv) DESC\n    ) AS seller_rank\n  FROM orders\n  WHERE order_date >= DATE_TRUNC(\'month\', CURRENT_DATE)\n  GROUP BY seller_id, category\n)\nSELECT seller_id, category, monthly_gmv, seller_rank\nFROM ranked_sellers\nWHERE seller_rank <= 3\nORDER BY category, seller_rank;\n\nThis produces one row per seller per category, with only the top 3 in each category. Without ROW_NUMBER, you\'d need a correlated subquery or a complex self-join to achieve the same result.' },
      { type: 'heading', text: 'LAG and LEAD: Comparing to Adjacent Rows' },
      { type: 'text', text: 'LAG(column, n) accesses the value from n rows before the current row within the same partition. LEAD(column, n) accesses n rows ahead. The classic product analytics use: compute week-over-week change for a metric. LAG(weekly_dau, 1) OVER (ORDER BY week) gives you last week\'s DAU on the current row, so you can compute the difference or ratio inline. This eliminates a self-join that would otherwise require joining the table to itself on week = prior_week. For session gap analysis on Prism video app — finding the time between a user\'s consecutive sessions — LAG(session_start_time, 1) OVER (PARTITION BY user_id ORDER BY session_start_time) gives the prior session timestamp, and the difference is the gap.' },
      { type: 'example', label: 'Prism video app — week-over-week DAU change', text: 'WITH weekly_dau AS (\n  SELECT\n    DATE_TRUNC(\'week\', event_date) AS week,\n    COUNT(DISTINCT user_id) AS dau\n  FROM events\n  GROUP BY 1\n)\nSELECT\n  week,\n  dau,\n  LAG(dau, 1) OVER (ORDER BY week) AS prior_week_dau,\n  dau - LAG(dau, 1) OVER (ORDER BY week) AS dau_change,\n  ROUND(\n    100.0 * (dau - LAG(dau, 1) OVER (ORDER BY week))\n    / NULLIF(LAG(dau, 1) OVER (ORDER BY week), 0),\n  1) AS pct_change\nFROM weekly_dau\nORDER BY week;\n\nThe NULLIF prevents division by zero on the first week where LAG returns NULL.' },
      { type: 'heading', text: 'SUM OVER: Running Totals and Moving Averages' },
      { type: 'text', text: 'SUM(column) OVER (ORDER BY date_column ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) computes a 7-day rolling sum — the sum of the current row plus the 6 rows before it, in date order. For a rolling 7-day DAU, use COUNT(DISTINCT user_id) as the inner metric and wrap it in the window. The frame clause (ROWS BETWEEN N PRECEDING AND CURRENT ROW) controls the rolling window size. Use ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a cumulative sum that grows from the beginning of the partition to the current row.' },
      { type: 'callout', label: 'When to use window functions vs GROUP BY', text: 'Use GROUP BY when the output should be one row per group (no row-level detail needed). Use window functions when you need both the aggregate value AND the individual row\'s data in the same result set. If you find yourself joining a GROUP BY subquery back to the original table to get row-level detail alongside an aggregate, replace the join with a window function — the query will be simpler and faster.' },
      { type: 'cta', room: 'code', label: 'Practice window function queries in Programming Lab →' },
    ],
  },
  {
    id: 'data-quality',
    category: 'SQL & Data',
    title: 'Data Quality Checks Before You Start Any Analysis',
    summary: 'Nulls, duplicates, grain mismatches, and timestamp anomalies. The checks that catch silent errors before they become wrong conclusions. A checklist with SQL patterns.',
    readMin: 4,
    room: 'code',
    roomLabel: 'Programming Lab',
    content: [
      { type: 'text', text: 'Most analysis errors are not statistical — they are data quality errors. A null value treated as zero inflates denominators. A duplicated row from a fan-out join inflates counts. A timestamp stored in UTC interpreted as local time shifts your daily buckets by 5 to 8 hours. These errors produce numbers that look plausible and are completely wrong. The five dimensions of data quality — completeness, consistency, accuracy, timeliness, and uniqueness — each require a specific check before you touch any metric.' },
      { type: 'heading', text: 'The Five Checks You Run Before Anything Else' },
      { type: 'text', text: 'Completeness: check the null rate for every column you plan to use. SELECT COUNT(*) as total, COUNT(column_name) as non_null, ROUND(100.0 * COUNT(column_name) / COUNT(*), 1) as fill_rate FROM table tells you what fraction of rows have usable values. A 15% null rate on seller_id in the orders table means 15% of orders are unattributable — that changes your seller-level analysis fundamentally. Consistency: check whether the same entity (a user, a seller, an order) has consistent values across tables. A user in the users table with status = "active" who has no events in the events table for 90 days is an inconsistency that may signal a data pipeline problem. Uniqueness: check for duplicate rows at the grain you expect. SELECT COUNT(*), COUNT(DISTINCT primary_key) FROM table — if these numbers differ, you have duplicates at the supposed primary key level.' },
      { type: 'example', label: 'Crafted orders table audit before A/B test analysis', text: '-- Step 1: Row count and date range\nSELECT COUNT(*) as rows, MIN(created_at), MAX(created_at) FROM orders;\n-- Result: 184,200 rows, 2024-01-01 to 2024-03-31 ✓\n\n-- Step 2: Null rates on key columns\nSELECT\n  ROUND(100.0 * COUNT(buyer_id) / COUNT(*), 1) AS buyer_fill_rate,\n  ROUND(100.0 * COUNT(seller_id) / COUNT(*), 1) AS seller_fill_rate,\n  ROUND(100.0 * COUNT(order_value) / COUNT(*), 1) AS value_fill_rate,\n  ROUND(100.0 * COUNT(experiment_variant) / COUNT(*), 1) AS variant_fill_rate\nFROM orders;\n-- Result: buyer 98.3%, seller 99.1%, value 97.7%, variant 71.4% ← problem\n-- 28.6% of orders have no experiment_variant — these are pre-experiment or untracked orders\n\n-- Step 3: Uniqueness check\nSELECT COUNT(*) as total, COUNT(DISTINCT order_id) as unique_orders FROM orders;\n-- If total > unique_orders: duplicates exist — investigate before computing any metrics\n\n-- Step 4: Distribution check for value column\nSELECT\n  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY order_value) AS median,\n  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY order_value) AS p95,\n  MAX(order_value) AS max_value\nFROM orders WHERE order_value IS NOT NULL;\n-- A max_value of $15,000 when median is $62 suggests outliers that may need capping' },
      { type: 'heading', text: 'The Fan-Out Join Problem' },
      { type: 'text', text: 'The most silent data quality error in SQL is a fan-out join: joining a table to another table where the join produces more rows than expected because the join key is not unique on one side. Joining the orders table to the reviews table on order_id, where one order can have multiple reviews, produces one row per review — not one row per order. Every user-level metric you compute from this joined table is inflated by the number of reviews per order. The check: after any join, verify that COUNT(*) in the result equals the expected number of rows at the intended grain. If it doesn\'t, you have a fan-out and need to aggregate before joining.' },
      { type: 'callout', label: 'The pre-analysis checklist', text: '1. Row count and date range — does the data cover the expected period?\n2. Null rates on all key columns — are the columns you plan to use sufficiently populated?\n3. Uniqueness at the expected grain — any duplicates at the primary key level?\n4. Distribution of numeric columns — any outliers that could distort means?\n5. After joins: verify row count at expected grain — did the join fan out?\n6. Timestamp timezone — are dates in UTC, local, or mixed? How do daily buckets behave at midnight?' },
      { type: 'cta', room: 'code', label: 'Practice data quality checks in Programming Lab →' },
    ],
  },
  {
    id: 'ab-test-results-sql',
    category: 'SQL & Data',
    title: 'Computing A/B Test Results in SQL: Means, Variances, and t-stats From Scratch',
    summary: 'Most analysts use a tool to compute experiment results. Knowing how to compute them in SQL shows you understand what the tool is actually doing — and catches errors when it breaks.',
    readMin: 5,
    room: 'code',
    roomLabel: 'Programming Lab',
    content: [
      { type: 'text', text: 'Most product teams use an experimentation platform — Optimizely, Statsig, Eppo, or an internal tool — to compute A/B test results. These tools handle the statistics invisibly. Understanding what they\'re doing matters for two reasons: you can catch errors when the tool produces a suspicious result, and in interviews you\'ll be asked to compute results manually. The SQL pattern is straightforward: aggregate per variant, compute mean and variance per variant, apply the two-sample t-test formula.' },
      { type: 'heading', text: 'Step 1: The SRM Check First' },
      { type: 'text', text: 'Before computing any metric results, check for Sample Ratio Mismatch (SRM). If you assigned a 50/50 split but got 53/47, the experiment assignment mechanism is broken and no result from this experiment is trustworthy. The SRM check: SELECT variant, COUNT(DISTINCT user_id) as n FROM experiment_assignments GROUP BY variant. Compare the actual counts to the expected counts using a chi-squared test. In SQL: the chi-squared statistic = SUM((observed - expected)^2 / expected) across variants. For a 50/50 split, expected = total_n / 2 for each variant. If the chi-squared p-value is below 0.01, the experiment has SRM — stop.' },
      { type: 'example', label: 'Crafted checkout experiment — full SQL from assignments to t-stat', text: '-- Step 1: SRM check\nSELECT\n  variant,\n  COUNT(DISTINCT user_id) AS n,\n  SUM(COUNT(DISTINCT user_id)) OVER () AS total_n,\n  SUM(COUNT(DISTINCT user_id)) OVER () / 2.0 AS expected_n\nFROM experiment_assignments\nWHERE experiment_id = \'checkout_redesign_2024\'\nGROUP BY variant;\n-- Verify: |actual_n - expected_n| / expected_n < 0.01 for each variant\n\n-- Step 2: Compute means and variances per variant\nWITH user_metrics AS (\n  SELECT\n    ea.user_id,\n    ea.variant,\n    COALESCE(SUM(o.order_value), 0) AS revenue\n  FROM experiment_assignments ea\n  LEFT JOIN orders o\n    ON ea.user_id = o.buyer_id\n    AND o.created_at BETWEEN \'2024-03-01\' AND \'2024-03-14\'\n  WHERE ea.experiment_id = \'checkout_redesign_2024\'\n  GROUP BY ea.user_id, ea.variant\n),\nstats AS (\n  SELECT\n    variant,\n    COUNT(*) AS n,\n    AVG(revenue) AS mean_revenue,\n    VAR_SAMP(revenue) AS var_revenue\n  FROM user_metrics\n  GROUP BY variant\n)\nSELECT\n  t.mean_revenue - c.mean_revenue AS mean_diff,\n  SQRT(t.var_revenue / t.n + c.var_revenue / c.n) AS se,\n  (t.mean_revenue - c.mean_revenue)\n    / SQRT(t.var_revenue / t.n + c.var_revenue / c.n) AS t_stat\nFROM stats t CROSS JOIN stats c\nWHERE t.variant = \'treatment\' AND c.variant = \'control\';\n-- t_stat > 1.96 → p < 0.05 (two-tailed)\n-- t_stat > 2.58 → p < 0.01' },
      { type: 'heading', text: 'The Formula and What Each Part Does' },
      { type: 'text', text: 'The t-statistic formula is: t = (mean_T - mean_C) / sqrt(var_T/n_T + var_C/n_C). The numerator is the observed difference between groups. The denominator is the standard error — how much the observed difference could bounce around by chance given the sample sizes and variances. A large numerator relative to the denominator means the signal is strong relative to the noise. VAR_SAMP computes sample variance (divides by n-1 rather than n), which is the correct formula for statistical inference. The 95% confidence interval around the mean difference is: mean_diff ± 1.96 × standard_error.' },
      { type: 'callout', label: 'The binary metric version: CVR, not revenue', text: 'For binary metrics like conversion rate (0 or 1 per user), the variance formula simplifies. For a binary outcome with mean p, the sample variance is p × (1-p). So for checkout CVR:\nse = sqrt(p_T*(1-p_T)/n_T + p_C*(1-p_C)/n_C)\nt = (p_T - p_C) / se\n\nIn SQL: replace AVG(revenue) with AVG(converted::int) and VAR_SAMP(revenue) with AVG(converted::int) * (1 - AVG(converted::int)) — or just let VAR_SAMP handle it on the 0/1 column.' },
      { type: 'cta', room: 'code', label: 'Practice A/B test SQL in Programming Lab →' },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // CAREER & INTERVIEW
  // ══════════════════════════════════════════════════════════════
  {
    id: 'interview-loop-map',
    category: 'Career & Interview',
    title: 'Mapping the DS / Product Analytics Interview Loop: What Each Round Is Testing',
    summary: 'Round 1 is SQL execution. Round 2 is ambiguous problem framing and metric design. Round 3+ is experimentation, business cases, and ML. Know the map before you prepare.',
    readMin: 6,
    room: 'cases',
    roomLabel: 'Cases Room',
    content: [
      { type: 'text', text: 'Most DS candidates prepare as if all interview rounds test the same thing. They review SQL, practice metric definitions, memorize the Central Limit Theorem, and hope for the best. Then they get to round three — the analytics case — and realize they have been preparing for the wrong thing. Each round in a DS interview loop tests something different. Knowing what each round is actually evaluating, not what it looks like on the surface, changes how you allocate your prep time.' },
      { type: 'heading', text: 'Round 1: Recruiter Screen — Communication and Calibration' },
      { type: 'text', text: 'The recruiter screen is not testing your technical skills. It is testing whether you can communicate clearly and whether your background is plausibly strong enough to advance. The recruiter is calibrating on three things: can you explain what you have done in plain language, do your years of experience roughly match the level the team is hiring for, and do you have the right vocabulary without drowning in jargon. The most common mistake is over-explaining technical details to a non-technical screener. Keep it to one sentence of context, one sentence of action, one sentence of result — for every project you mention.' },
      { type: 'heading', text: 'Rounds 2 and 3: Take-Home and Analytics Case — Fluency and Judgment' },
      { type: 'text', text: 'The take-home tests SQL and coding fluency. You are expected to write clean, correct queries without hints. The analytics case round — typically one to two hours with a DS or PM — tests product judgment and metric design. This is the round most candidates under-prepare for. They memorize formulas but have not practiced framing a vague business question into a precise analytical one. The panels are looking for: do you define the denominator before computing a rate, do you identify guardrails unprompted, do you close with a recommendation rather than a list of options.' },
      { type: 'example', label: 'The common mismatch', text: 'A candidate for a senior DS role at Prism video app spent 80% of their prep time on SQL and statistics. In the analytics case, the interviewer asked: "DAU is flat but we just ran a big acquisition campaign — what is happening?" The candidate immediately listed hypotheses. They did not decompose the metric (sessions vs users, new vs returning), they did not ask about the denominator for DAU, and they did not close with a recommendation. The SQL was perfect. The case was a miss.\n\nThe mismatch: SQL fluency is tested in round 2 and is pass/fail. Product judgment in the analytics case is what separates candidates at the senior level — and it is tested in a round most candidates treat as "more SQL."' },
      { type: 'heading', text: 'Rounds 4 and 5: Stats/Experimentation and Behavioral' },
      { type: 'text', text: 'The stats and experimentation round tests depth — not breadth. Interviewers are not checking whether you can recite all of the concepts; they are checking whether you truly understand the ones you claim to know. The question "what is a p-value?" is a trap for the candidate who gives a fluent but slightly wrong definition. Know SRM, know power calculations, know why peeking inflates false positives, and be ready to apply these to a specific scenario rather than just defining them. The behavioral round tests influence and collaboration: can you explain a time you pushed back on a stakeholder with data, and can you articulate how you have driven decisions rather than just supported them?' },
      { type: 'callout', label: 'Where to put your prep time', text: 'If you are a mid-to-senior candidate: 20% SQL, 40% analytics case practice (metric framing, RCA structure, closing with a recommendation), 30% experimentation depth, 10% behavioral. Most candidates flip this — 60% SQL, 20% stats, 20% everything else. The case round is the one that moves the needle at senior levels, and it is almost always the most under-prepared.' },
      { type: 'cta', room: 'cases', label: 'Practice this in the Cases Room →' },
    ],
  },
  {
    id: 'common-mistakes-interview',
    category: 'Career & Interview',
    title: '12 Most Common Mistakes in Product Analytics Interviews — and How to Avoid Each',
    summary: 'Jumping to metrics before framing. Not naming denominators. Listing hypotheses without decomposing. Treating all metrics as equally important. The checklist of what not to do.',
    readMin: 5,
    room: 'cases',
    roomLabel: 'Cases Room',
    content: [
      { type: 'text', text: 'The mistakes that derail DS interviews are remarkably consistent. They are not random knowledge gaps — they are structural habits that signal to interviewers that the candidate is thinking at the junior level. Most of them share a common pattern: moving too fast. Jumping to metrics before framing the problem. Listing hypotheses before decomposing the metric. Naming a north star metric without mentioning guardrails. Each mistake is fixable with a single habit change. Here are the seven most costly ones and the one-sentence fix for each.' },
      { type: 'heading', text: 'Mistakes 1–4: Analytical Structure' },
      { type: 'text', text: 'Mistake 1: Jumping to solutions before defining the problem. What it signals: you are optimizing for appearing busy rather than solving the right thing. The fix: spend the first 60–90 seconds restating the question, scoping the metric, and confirming the decision you are informing. Mistake 2: Using "it depends" as a final answer. What it signals: you are not willing to commit. The fix: "my default would be X, because Y — the exception is if Z." Mistake 3: Picking the north star as your primary experiment metric. What it signals: you do not understand experiment sensitivity. The fix: the primary metric should be the closest measurable signal to the hypothesis — not the business north star, which is too noisy to detect experiment-sized effects in a two-week window. Mistake 4: Forgetting guardrails. What it signals: you think about what to optimize but not what to protect. The fix: for every metric you propose as a success criterion, name the failure mode and the guardrail that catches it.' },
      { type: 'heading', text: 'Mistakes 5–7: Rigor and Recommendation' },
      { type: 'text', text: 'Mistake 5: Ignoring SRM. What it signals: you have not run experiments or have only read about them. The fix: in any experiment design or readout, mention the SRM check before discussing results — "the first thing I would check is whether the treatment/control split matches the intended allocation." Mistake 6: Over-engineering — proposing ML when a crosstab answers the question. What it signals: you confuse complexity with intelligence. The fix: when asked "how would you identify at-risk users?", start with a segmentation approach using two or three known predictors; only reach for ML when you can name the specific limitation the simpler model hits. Mistake 7: No recommendation at the end. What it signals: you see your job as producing analysis, not enabling decisions. The fix: every answer should close with "my recommendation is X — here is the key assumption and the next step."' },
      { type: 'example', label: 'The guardrail miss in a Crafted marketplace case', text: 'Interviewer question: "How would you measure the success of a new one-click checkout feature on Crafted marketplace?"\n\nCandidate answer (guardrail miss): "I would track checkout conversion rate — that is the most direct measure of whether the feature reduces friction."\n\nWhat the interviewer wanted to hear: "My primary metric is checkout completion rate. But I would also track average order value as a sanity check — one-click checkout might complete more orders but at lower AOV if it enables more impulsive, smaller purchases. And I would track refund rate as a guardrail — simplified checkout could push through buyers who are less certain, leading to higher returns. If CVR is up but refund rate and AOV both degrade, that is not a ship."' },
      { type: 'callout', label: 'The pattern behind all seven mistakes', text: 'Every mistake on this list comes from moving faster than the question demands. The interviewer is not rewarding speed — they are rewarding precision. The candidate who pauses to define the denominator, name the guardrail, and close with a recommendation scores better than the candidate who lists five metrics in 30 seconds. Slow down. The structure is the answer.' },
      { type: 'cta', room: 'cases', label: 'Practice this in the Cases Room →' },
    ],
  },
  {
    id: 'decision-partner-framing',
    category: 'Career & Interview',
    title: 'You Are Not a Metrics Reporter. You Are an Analytical Decision Partner.',
    summary: 'The mindset shift that changes how you answer every interview question and structure every analysis: the output is always a recommendation, not a dashboard.',
    readMin: 5,
    room: 'cases',
    roomLabel: 'Cases Room',
    content: [
      { type: 'text', text: 'There are two models for what a data scientist does. In the first model, the DS answers questions: a PM or executive asks a question, the DS queries data, and produces a number or a chart. In the second model, the DS shapes questions: they proactively identify which decisions need analysis, push back when the question being asked is not the decision-relevant one, and deliver output that is formatted as a decision input rather than a data dump. The difference between these two models is not seniority — it is framing. And the framing is entirely in your control.' },
      { type: 'heading', text: 'What Changes When You Frame as a Decision Partner' },
      { type: 'text', text: 'Three things change when you adopt decision-partner framing. First, you lead with the decision, not the data. Instead of "here is what I found," you say "here is what I recommend, and here is the evidence." Second, you translate findings into implications. A retention number without a business implication is a description. A retention number with "this suggests we are leaking 12% of our SMB segment, which maps to $340K ARR at risk" is a decision input. Third, you push back when the question is wrong. If a PM asks "what is the conversion rate of users who saw Feature X?" the decision-partner response is "before I answer that, let me flag that this will be confounded by selection — users who saw Feature X are not randomly selected. Would a causal comparison be more useful here?"' },
      { type: 'example', label: 'Threadline SaaS: reporter vs decision partner', text: 'Same finding, two framings:\n\nReporter framing: "Retention fell 8% in Q2. The SMB segment drove most of the decline. The pricing change in May correlates with the timing."\n\nDecision-partner framing: "Retention fell 8% overall, but the decline is concentrated in SMB accounts — specifically, accounts with fewer than 20 seats that are on monthly contracts. The timing correlates with the May pricing change, which increased monthly plan rates by 15% for this tier. My recommendation: run a targeted re-engagement campaign for affected accounts with a rate-lock offer, and A/B test whether extending the monthly-to-annual discount window increases conversion for this segment. I estimate we can recover 30–40% of the at-risk accounts within 60 days."\n\nThe data is identical. The decision-partner version tells the business leader what to do next.' },
      { type: 'heading', text: 'How to Frame Any DS Output as a Decision Input' },
      { type: 'text', text: 'The formula is: finding → implication → recommendation → next step. Take any analytical output you have produced and add three sentences. "This finding implies that [business consequence]. My recommendation is [specific action]. The next step is [one concrete thing someone can do in the next week]." These three sentences transform a report into a decision input. They also change how you are perceived — from someone who describes what happened to someone who drives what happens next.' },
      { type: 'callout', label: 'The interview application', text: 'In an interview, decision-partner framing sounds like this: you close every answer with a recommendation, you frame every metric in terms of the decision it informs, and when a question is ambiguous, you ask which decision you are trying to enable before answering. Interviewers testing for seniority are specifically watching for whether you give them a dashboard (list of metrics, list of hypotheses) or a decision input (recommendation with reasoning and a next step).' },
      { type: 'cta', room: 'cases', label: 'Practice this in the Cases Room →' },
    ],
  },
  {
    id: 'closing-with-recommendation',
    category: 'Career & Interview',
    title: 'How to Close Every Answer With a Recommendation (Even When You\'re Uncertain)',
    summary: '"It depends" with no direction is not a senior answer. Here\'s the structure for closing with a recommendation that includes confidence level, key assumption, and next step.',
    readMin: 5,
    room: 'cases',
    roomLabel: 'Cases Room',
    content: [
      { type: 'text', text: 'Most DS interview answers end with analysis. "CVR is up 2.3%, but refund rate is up 1.4pp, so there is a tradeoff here." The analysis is correct. The answer is incomplete. The best answers end with a recommendation — a clear statement of what you would do, with a stated confidence level, a named key assumption, and a concrete next step. This structure does not require certainty. It requires commitment under uncertainty, which is exactly what senior data scientists are hired for.' },
      { type: 'heading', text: 'The Recommendation Structure' },
      { type: 'text', text: 'The four-part structure: (1) Recommendation — what I would do. (2) Confidence — high, medium, or low, with a one-sentence rationale. (3) Key assumption — the thing that must be true for this recommendation to hold. (4) Revision trigger — if the key assumption turns out to be wrong, here is what I would do instead. This structure works for any level of uncertainty. Low confidence plus a clearly stated assumption is a stronger answer than vague hedging. The interviewer can engage with a stated assumption. They cannot engage with "it really depends on a lot of things."' },
      { type: 'example', label: 'Three scenarios: weak vs strong closing', text: 'Scenario 1 — Experiment shows CVR up 2.3%, refund rate up 1.4pp.\nWeak close: "It depends on whether the refund rate increase is meaningful."\nStrong close: "My recommendation is no-ship. Confidence: medium. Key assumption: refund rate is a pre-committed guardrail. If it was defined as a guardrail before the experiment ran, a 1.4pp increase at p = 0.031 is a genuine violation and overrides the CVR win. If it was not pre-committed, I would treat it as an exploratory signal and escalate to the product lead for a tradeoff decision."\n\nScenario 2 — Retention falling, cause unclear.\nWeak close: "I would need more data before making a recommendation."\nStrong close: "My recommendation is to pause the notification volume increase from last month and monitor D7 retention for the next two cohorts. Confidence: low — the correlation is suggestive but not confirmed. Key assumption: the volume change is the primary driver. If retention does not recover after the pause, I would investigate content quality and onboarding next."\n\nScenario 3 — Build vs buy for a recommendation engine.\nWeak close: "Both options have pros and cons."\nStrong close: "My recommendation is to buy for the first six months, then migrate to a proprietary model. Confidence: high. Key assumption: the vendor\'s catalog can be configured for handmade-goods attributes. If that turns out to be false, building from the start is the right call."' },
      { type: 'heading', text: 'Why Hedging Hurts' },
      { type: 'text', text: 'Hedging without a direction ("it depends on context," "there are tradeoffs both ways") signals that you are unwilling to be wrong. Interviewers understand that recommendations made with incomplete data can be wrong — that is the nature of the job. What they are testing is whether you can commit to a direction given what you know, while being transparent about the uncertainty. A wrong recommendation with a clearly stated assumption is far more useful to a product team than a non-recommendation with a thorough list of considerations.' },
      { type: 'callout', label: 'The one-sentence template', text: '"My recommendation is X. Confidence: [high/medium/low] because [one sentence]. Key assumption: Y. If Y turns out to be wrong, I would revise to Z. Next step: [one concrete action]." Write this structure on a sticky note before your next interview and refer to it every time you close an answer.' },
      { type: 'cta', room: 'cases', label: 'Practice this in the Cases Room →' },
    ],
  },
  {
    id: 'rapid-revision',
    category: 'Career & Interview',
    title: 'The 30-Minute Rapid Revision Sheet Before Any Analytics Interview',
    summary: 'One-page refresher covering opening moves for every question type — metric design, RCA, experimentation, ambiguous problems, and business cases. Read aloud, don\'t study new content.',
    readMin: 4,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'The night before an interview is not the time to learn new concepts. It is the time to activate what you already know. The goal of a rapid revision session is to put your mental models on the surface — to make the opening moves for each question type feel reflexive rather than effortful. The session takes 30 minutes. It consists of reading key phrases aloud, not rereading notes in your head. Speaking the words out loud is what makes them available under pressure.' },
      { type: 'heading', text: 'The Five Opening Moves — Read These Aloud' },
      { type: 'text', text: 'Metric design question ("how would you measure X?"): "Before I name a metric, let me clarify the decision this measurement informs. Then I will define the numerator, denominator, and grain, and explain what the metric can and cannot see." RCA question ("a metric dropped — what happened?"): "Before I generate hypotheses, I want to decompose the metric. For a rate, I would separate numerator from denominator. The drop could be in either, and those have different root causes." Experiment design question ("how would you test X?"): "Let me start with the hypothesis and the primary metric, then calculate the required sample size, then define the decision rule and guardrails." Ambiguous problem question ("what would you do about X?"): "Before I answer, let me restate the problem to make sure I understand the decision we are trying to enable." Business case question ("should we build X?"): "I would start by sizing the opportunity — addressable population times realistic conversion improvement times value per conversion — then compare against the build cost."' },
      { type: 'heading', text: 'The Closing Move — Read This Aloud' },
      { type: 'text', text: '"My recommendation is [X]. Confidence: [high/medium/low] because [one sentence]. Key assumption: [Y]. If Y turns out to be wrong, I would revise to [Z]. Next step: [one concrete action]." Practice saying this out loud five times. It should feel automatic. Under interview pressure, the closing move is the first thing that gets dropped when candidates rush. Having it on your tongue makes it stick.' },
      { type: 'example', label: 'The pushback scenario — what to practice', text: 'Interviewers push back on answers to test whether you are confident or just compliant. There are two types of pushback:\n\n1. New information pushback: "What if I told you the refund rate increase was concentrated in a new user segment that we expected to be lower-quality?" — This is new data. Update your recommendation: "That changes my view — if the refund increase is in a segment with known lower purchase intent, I would not count it against the experiment. I would revise to a conditional ship."\n\n2. No-new-information pushback: "Are you sure about that p-value interpretation?" — This is a test of confidence. Hold your position: "Yes — a p-value of 0.03 means that if the null were true, we would see a result this extreme or more extreme 3% of the time. It does not mean the probability the treatment works is 97%."\n\nThe key: if they added new information, update. If they just pushed harder on the same point, hold.' },
      { type: 'callout', label: 'The 30-minute session plan', text: '10 minutes: Read the five opening moves aloud three times each.\n10 minutes: Read the closing move aloud ten times. Vary the product and scenario each time.\n5 minutes: Practice the two pushback responses aloud.\n5 minutes: Review the company\'s products and think through one specific metric for each room they likely care about.\n\nDo not open your notes during the interview. Trust what you activated.' },
      { type: 'cta', room: 'stats', label: 'Practice this in the Stats Room →' },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // MENTAL MODELS
  // ══════════════════════════════════════════════════════════════
  {
    id: 'five-senior-habits',
    category: 'Mental Models',
    title: 'The 5 Senior Thinking Habits That Separate DS From Analytics',
    summary: 'Denominator discipline. Decompose before diagnosing. Segment before aggregating. Guardrails and counter-metrics. Business impact translation. Why these five habits compound.',
    readMin: 4,
    room: 'cases',
    roomLabel: 'Cases Room',
    content: [
      { type: 'text', text: 'There is a reliable difference between how junior and senior data scientists talk about the same problem. It is not that senior DSs know more formulas. It is that they frame problems differently before they touch any data. The five habits below are structural — they change how you think before you analyze, not what you compute during analysis. Each one can be adopted immediately, and each one signals seniority to every interviewer and stakeholder who is paying attention.' },
      { type: 'heading', text: 'Habit 1: State the Assumption Before the Conclusion' },
      { type: 'text', text: 'Junior version: "Retention improved by 4pp." Senior version: "Assuming we are measuring D30 retention for users acquired through organic channels — which is what I would expect to be most sensitive to our onboarding changes — retention improved by 4pp." The senior version names the scope and the assumption before claiming a result. This prevents the meeting-stopping question "wait, which users are you measuring?" and positions the analyst as someone who knows what their analysis can and cannot see.' },
      { type: 'heading', text: 'Habits 2–3: Recommendation and Failure Mode' },
      { type: 'text', text: 'Habit 2: Give a recommendation, not just a finding. Finding: "Checkout CVR is up 2.3% but refund rate is up 1.4pp." Recommendation: "This is a no-ship given the guardrail violation on refund rate — I would recommend investigating whether the CVR lift is driven by genuinely incremental purchases or by buyers who are less certain, and refining the checkout flow before re-running." Habit 3: Name the failure mode of your own analysis. "One limitation of this analysis is that it does not account for users who churned before day 30 — if the treatment group had higher early churn, the remaining users are a more engaged subset and the retention lift may be overstated." Naming your own limitations first prevents others from using them against you.' },
      { type: 'example', label: 'Junior vs senior on a Threadline retention finding', text: 'Junior DS: "90-day retention for the new onboarding cohort is 67%, up from 61% for the prior cohort."\n\nSenior DS: "90-day retention for users who went through the redesigned onboarding is 67%, compared to 61% for the prior cohort — assuming comparable acquisition channel mix, which I have not verified yet. My recommendation: treat this as a positive signal but not a confirmed win. The key failure mode of this comparison is that the two cohorts were acquired in different months and may not be comparable on intent. To confirm, I would want to match on acquisition channel and run the comparison within the same channel. The next step is pulling the cohort split by organic vs paid for both groups."' },
      { type: 'heading', text: 'Habits 4–5: Business Translation and the Right Question' },
      { type: 'text', text: 'Habit 4: Translate metric moves to business impact. A 0.5pp CVR lift is a statistic. "0.5pp CVR lift at 2M monthly sessions and $45 AOV is $450K/month in incremental revenue" is a business input. Every metric movement has a dollar translation; senior DSs do the math before they present the finding, not after a stakeholder asks. Habit 5: Ask "what decision does this change?" before starting any analysis. If the answer is "none — we are going to do this regardless," the analysis is either exploratory (fine, just label it that way) or theater (problematic). Senior DSs calibrate analysis depth to decision stakes. Light analysis for reversible decisions, rigorous analysis for irreversible ones.' },
      { type: 'callout', label: 'The compound effect', text: 'These five habits are not independent. Stating your assumption (habit 1) makes your recommendation (habit 2) more credible. Naming your failure mode (habit 3) prevents the business translation (habit 4) from being challenged on scope. Asking what decision you are enabling (habit 5) makes all four previous habits more targeted. Together, they produce a signal that says: this person thinks before they analyze, and they understand that analysis is a tool for decisions, not an end in itself.' },
      { type: 'cta', room: 'cases', label: 'Practice this in the Cases Room →' },
    ],
  },
  {
    id: 'correlation-causation',
    category: 'Mental Models',
    title: 'Correlation, Causation, and the Analyst Who Got Them Confused',
    summary: 'The classic distinction, applied to real product analytics scenarios — where confusing the two led to bad interventions and what the right analysis would have looked like.',
    readMin: 6,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'Correlation means two things tend to move together. Causation means one thing causes the other to move. Most analysts can state this distinction. Fewer apply it correctly under time pressure, and fewer still can name the specific mechanism that would distinguish correlation from causation in a product scenario. The practical consequence of the confusion: interventions that move the correlated metric without producing the intended outcome, wasting engineering time and generating false confidence in features that do not actually work.' },
      { type: 'heading', text: 'The Three Sources of Spurious Correlation' },
      { type: 'text', text: 'Confounding is when a third variable drives both the thing you are measuring and the outcome, creating an apparent relationship between them. Reverse causality is when the effect drives the cause rather than the other way around. Coincidence is when two unrelated time series happen to move together over a short window. In product analytics, confounding is by far the most common source of spurious correlation. The typical shape: users who use Feature X have 3× higher retention than users who do not. This looks like Feature X causes retention. In most cases, Feature X is adopted by users who are already more engaged — and those engaged users retain at higher rates for reasons that have nothing to do with Feature X.' },
      { type: 'example', label: 'Prism video app: Feature X and the engagement confounder', text: 'Analysis: Users who use the "Save for Later" playlist feature on Prism have 3.1× higher D30 retention than users who do not use it.\n\nNaive interpretation: Save for Later drives retention. Recommendation: push all new users to adopt the feature.\n\nConfounder: Users who use Save for Later are the most engaged users on the platform — they watch multiple videos per session, return daily, and were likely to retain regardless of the feature. The feature did not cause their engagement. Their engagement caused them to use the feature.\n\nTest: Look at Save for Later adoption timing. If users who adopted it in their first session have the same retention as users who adopted it in month 2, the feature is driving retention. If the early adopters retain at the same rate as non-adopters who are otherwise equally engaged, it is the engagement driving both.\n\nResult: When controlling for prior-week engagement at the time of adoption, Save for Later shows no incremental retention lift. The 3.1× figure was entirely a selection effect.' },
      { type: 'heading', text: 'Why This Matters for Product Decisions' },
      { type: 'text', text: 'If you optimize for a correlated metric without understanding causality, you get the metric without the outcome. Prism could aggressively nudge new users to use Save for Later — in-app prompts, onboarding steps, email campaigns — and drive adoption up significantly. Adoption rate goes up. Retention does not move. The team investigates why the "high-retention feature" did not improve retention. The answer is that it was never causing retention. Resources were spent moving a correlated metric that was not a lever.' },
      { type: 'callout', label: 'The test for causality', text: 'The gold standard is a randomized experiment: randomly assign some users to see a Save for Later prompt and others not to, and measure whether the prompt group retains at a higher rate. If yes, the feature (or the prompt that drives its adoption) causes retention. If no, the correlation was selection bias. In the absence of an experiment, a quasi-experimental design — comparing users who adopted the feature in a given week to equally-engaged users in the same week who did not — can get closer to a causal estimate than a simple correlation.' },
      { type: 'cta', room: 'stats', label: 'Practice this in the Stats Room →' },
    ],
  },
  {
    id: 'survivorship-bias',
    category: 'Mental Models',
    title: 'Survivorship Bias in Product Analytics: You\'re Only Seeing the Users Who Stayed',
    summary: 'Analyzing active users to understand engagement tells you nothing about the users who churned. How survivorship bias corrupts product decisions and how to correct for it.',
    readMin: 6,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'Survivorship bias is the analytical error of drawing conclusions from a sample that has been filtered by survival — by the fact that you only observe entities that made it to the point of measurement. In product analytics, this shows up every time you analyze your current active users and draw conclusions about what makes users successful. The population you are analyzing is the population that did not churn. The population that tells you the most about what causes churn — the churned users — is invisible to you unless you explicitly build them into the analysis.' },
      { type: 'heading', text: 'Three Places Survivorship Bias Hides' },
      { type: 'text', text: 'Power user analysis: if you study the behavior of your most engaged users to learn what drives engagement, you are studying users who survived to become power users. The early-stage behaviors of users who churned before reaching power-user status — which might tell you what to avoid, or what to replicate more aggressively to reduce the time-to-power — are excluded. Feature adoption rate: if you measure "adoption rate of Feature X among current users," you are measuring adoption among users who stayed. Users who tried the product, did not find Feature X helpful, and left have zero adoption and are not in your denominator. Your adoption rate is overstated. Successful product bet analysis: if you study your successful product bets to learn what made them work, and exclude failed bets from the review, you will learn a set of characteristics that successful bets have in common with each other — but also have in common with many failed bets you are not looking at.' },
      { type: 'example', label: 'Crafted marketplace: feature adoption rate correction', text: 'Naive analysis: "Shop Customization feature has a 38% adoption rate among active sellers, suggesting strong product-market fit."\n\nSurvivorship correction:\n- Active sellers (in the analysis): 8,400\n- Sellers who signed up and churned before 90 days (excluded from "active" filter): 3,200\n- Among churned sellers: Shop Customization adoption was 4%\n\nCorrected adoption rate: (0.38 × 8,400 + 0.04 × 3,200) / (8,400 + 3,200) = (3,192 + 128) / 11,600 = 28.6%\n\nThe true adoption rate across all sellers who ever signed up is 28.6%, not 38%. More importantly, the feature has nearly zero traction with churned sellers — either because churned sellers do not stay long enough to discover it, or because users who do not customize their shop are more likely to churn. This distinction matters for whether the intervention should be onboarding-focused or retention-focused.' },
      { type: 'heading', text: 'How to Correct for Survivorship Bias' },
      { type: 'text', text: 'The correction is always the same: build churned users or failed entities back into your analysis population. For retention analysis, include users who were active at day 0 of a cohort regardless of whether they are active today. For feature adoption, measure adoption from the first-exposure date rather than from the current active-user base. For product bet analysis, explicitly document and include failed bets in any review that aims to extract lessons. The calculation is not hard. The habit of including the excluded population is what requires active attention.' },
      { type: 'callout', label: 'Key insight', text: 'Any analysis that filters to "current active users" before computing a metric is susceptible to survivorship bias. The question to ask before every analysis: is the population I am measuring the population that was present at the beginning of the window, or only the population that survived to the end? If it is the latter, the analysis is telling you about survivors, not about the full picture.' },
      { type: 'cta', room: 'stats', label: 'Practice this in the Stats Room →' },
    ],
  },
  {
    id: 'goodharts-law',
    category: 'Mental Models',
    title: 'Goodhart\'s Law and Why Every Metric Becomes a Bad Metric When It Becomes a Target',
    summary: 'When a measure becomes a target, it ceases to be a good measure. Product analytics history is full of metrics that were gamed the moment teams were held accountable to them.',
    readMin: 6,
    room: 'metrics',
    roomLabel: 'Metrics Room',
    content: [
      { type: 'text', text: 'Goodhart\'s Law: when a measure becomes a target, it ceases to be a good measure. In product analytics, this is not a theoretical warning — it is a predictable failure mode that plays out on a regular schedule. The moment a team is held accountable to a specific metric, they find ways to move it that do not reflect the underlying value the metric was designed to capture. The metric goes up. The product outcome stays flat or declines. Leadership celebrates. Users churn.' },
      { type: 'heading', text: 'Three Product Examples' },
      { type: 'text', text: 'Optimizing click-through rate: a content platform holds its editorial team accountable to CTR. The team learns that curiosity-gap headlines — "You will not believe what happened to engagement in Q3" — drive significantly higher CTR than accurate, descriptive ones. CTR goes up. Time on page collapses. Users who click and immediately leave develop a low-quality association with the platform. Optimizing session count on Spark social: the growth team is measured on sessions per day. They find that push notification volume is the fastest way to move it. Users open the app in response to a notification, spend 8 seconds, and close it. Session count goes up. Session quality collapses. Daily active users start opting out of notifications. Optimizing DAU on Prism video app by requiring daily login to unlock recommendations: DAU goes up because users who want personalized recommendations must log in. A meaningful fraction log in, see nothing they want to watch, and leave. Retention falls. The team interprets the DAU increase as success until the monthly churn numbers come in.' },
      { type: 'example', label: 'The guardrail system as the fix', text: 'The guardrail system is the designed response to Goodhart\'s Law. For every primary metric, you name the gaming vector — the cheapest action that moves the metric without delivering value — and you add a guardrail metric that catches the gaming.\n\nPrimary metric: session count (Spark social)\nGaming vector: push notification spam drives low-quality sessions\nGuardrail: D7 retention + push opt-out rate\n\nPrimary metric: CTR (content platform)\nGaming vector: clickbait headlines drive clicks that do not convert to engagement\nGuardrail: time-on-page and 7-day return rate\n\nPrimary metric: DAU (Prism video app)\nGaming vector: mandatory daily login requirements\nGuardrail: session completion rate (how many sessions involve meaningful content consumption)\n\nThe guardrail fires when the gaming starts. The team must address the guardrail violation before continuing to optimize the primary metric.' },
      { type: 'heading', text: 'Why the Guardrail Must Be Pre-Committed' },
      { type: 'text', text: 'A guardrail that is defined after the gaming starts is not a guardrail — it is a post-hoc rationalization. The moment a team has incentives to hit the primary metric, they also have incentives to explain away guardrail violations. "The retention dip is probably seasonal." "The opt-out rate always fluctuates a bit." Pre-committing to the guardrail and its threshold before the optimization begins creates an objective standard that is resistant to motivated reasoning. This is the same principle as pre-committing decision rules in A/B tests — the commitment is what makes the system credible.' },
      { type: 'callout', label: 'Goodhart\'s Law in interviews', text: 'A strong interview answer to "what is the risk of optimizing for this metric?" will name Goodhart\'s Law directly: "Any metric that becomes a team-level accountability target will get gamed. The specific gaming vector for this metric is [X]. I would add [guardrail] to catch it before it does real damage." This demonstrates that you think about the second-order effects of measurement, not just the first-order measurement itself.' },
      { type: 'cta', room: 'metrics', label: 'Practice this in the Metrics Room →' },
    ],
  },
  {
    id: 'simpsons-paradox',
    category: 'Mental Models',
    title: 'Simpson\'s Paradox: When the Aggregate Points the Wrong Direction',
    summary: 'A treatment can appear to help in every subgroup while hurting in the aggregate — or vice versa. Real product examples and the segmentation habit that catches it.',
    readMin: 4,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'Simpson\'s Paradox is when a trend that appears in each individual subgroup disappears or reverses when the groups are combined. It is not a statistical curiosity — it shows up regularly in product analytics, and it routinely produces wrong conclusions when analysts stop at the aggregate. The mechanism is a composition change: when the mix of subgroups shifts at the same time as the rates within subgroups change, the aggregate can move in the opposite direction from every individual segment.' },
      { type: 'heading', text: 'The Product Example That Explains It' },
      { type: 'text', text: 'Crafted marketplace tracks conversion rate (CVR) week over week. This week, overall CVR is flat at 4.1% — down slightly from 4.2% last week. Nothing to investigate, apparently. But split by device: mobile CVR this week is 2.8%, down from 3.2% last week (−0.4pp). Desktop CVR this week is 7.4%, up from 6.9% last week (+0.5pp). Both mobile CVR and desktop CVR moved in meaningful ways — one down, one up. The aggregate is flat only because the composition shifted: mobile sessions grew from 58% of total sessions last week to 66% this week, pulling more weight toward the lower-CVR channel. The aggregate flatness is a mix-shift story, not a "nothing happened" story.' },
      { type: 'example', label: 'Crafted marketplace: CVR flat, but two opposite trends underneath', text: 'Week 1:\nMobile: 3.2% CVR, 58% of sessions → 58% × 3.2% = 1.86pp contribution\nDesktop: 6.9% CVR, 42% of sessions → 42% × 6.9% = 2.90pp contribution\nBlended CVR: 1.86 + 2.90 = 4.76% ≈ 4.2% (rounding, simplified)\n\nWeek 2:\nMobile: 2.8% CVR, 66% of sessions → 66% × 2.8% = 1.85pp contribution\nDesktop: 7.4% CVR, 34% of sessions → 34% × 7.4% = 2.52pp contribution\nBlended CVR: 1.85 + 2.52 = 4.37% ≈ 4.1%\n\nThe aggregate barely moved. But mobile CVR fell 12.5% relative and desktop CVR rose 7.2% relative. Declaring "CVR is flat, nothing to do" misses two separate stories that require different interventions: investigate the mobile CVR regression, and understand what drove the desktop improvement to replicate it.' },
      { type: 'heading', text: 'Why It Matters for Experiments' },
      { type: 'text', text: 'Simpson\'s Paradox is especially dangerous in A/B test readouts. If treatment and control groups have different compositions — for instance, treatment reached a disproportionate share of mobile users, who convert at lower rates — the aggregate CVR comparison between treatment and control will be misleading. Treatment can appear worse than control in aggregate even if it performed better on every individual device type, simply because the device mix was different between the groups. This is a form of confounding, and it is why segmenting A/B test results by platform, user type, and other compositional dimensions is not optional — it is required for an honest readout.' },
      { type: 'callout', label: 'The segmentation habit that catches it', text: 'Before concluding anything from an aggregate metric, run at least two segment cuts: by platform (mobile vs desktop vs app) and by user type (new vs returning). If the aggregate moved, check whether each segment moved in the same direction. If segments moved in opposite directions, you have a mix-shift story, not a behavioral one. The fix is to analyze within segments and report the aggregate separately — always labeling the aggregate as a weighted average that may not reflect any individual segment\'s truth.' },
      { type: 'cta', room: 'stats', label: 'Practice this in the Stats Room →' },
    ],
  },
  {
    id: 'base-rate-neglect',
    category: 'Mental Models',
    title: 'Base Rate Neglect: The Mistake Behind Half of All Bad Product Decisions',
    summary: 'A 50% lift on a 0.1% base rate is not interesting. A 5% lift on a 40% base rate is. Anchoring on relative change without anchoring on the base is a systematic error.',
    readMin: 5,
    room: 'stats',
    roomLabel: 'Stats Room',
    content: [
      { type: 'text', text: 'Base rate neglect is the cognitive error of focusing on the change — the relative lift — while ignoring the base rate it is applied to. A 50% improvement in the rate of a very rare event may still produce almost no additional occurrences. A 5% improvement in a very common event produces many. In product analytics, base rate neglect shows up most often in two places: interpreting experiment results (celebrating a 200% lift that moves a metric from 0.1% to 0.3%) and interpreting false positive rates in A/B testing (believing a significant result is likely to be true without accounting for how many experiments test null hypotheses).' },
      { type: 'heading', text: 'The A/B Test False Positive Problem' },
      { type: 'text', text: 'When the base rate of true effects is low — when most experiments you run are testing long-shot hypotheses — even a statistically significant result has a meaningful probability of being a false positive. The math works as follows. Suppose 10% of your experiments test effects that are truly real. You run 100 experiments at alpha = 0.05 with 80% power. Of the 10 experiments with real effects, 80% power means you detect 8 of them. Of the 90 null experiments, 5% false positive rate means you get 4.5 spurious significant results by chance. So among your total significant results (8 + 4.5 = 12.5), the fraction that are false positives is 4.5 / 12.5 ≈ 36%. You are testing at alpha = 0.05 but nearly 1 in 3 of your "wins" is noise.' },
      { type: 'example', label: 'Threadline SaaS: what the false positive math looks like in practice', text: 'Threadline runs 40 A/B tests per quarter, testing everything from minor copy changes to significant onboarding redesigns.\n\nAssumptions:\n- 15% of experiments test effects that are genuinely real (a reasonable prior for a mature product)\n- Alpha = 0.05, power = 80%\n\nExpected true effects detected: 40 × 0.15 × 0.80 = 4.8\nExpected false positives: 40 × 0.85 × 0.05 = 1.7\nTotal expected significant results: 4.8 + 1.7 = 6.5\nFalse positive rate among significant results: 1.7 / 6.5 = 26%\n\nOne in four "wins" in this program is likely noise. The practical implication: for high-stakes shipping decisions, a single significant result is not sufficient. Replicate important results before shipping features that are expensive to reverse. Pre-register your experiments to ensure you are not inadvertently biasing toward false positives through peeking or metric fishing.' },
      { type: 'heading', text: 'The Relative vs Absolute Framing Mistake' },
      { type: 'text', text: 'In product reporting, base rate neglect most commonly surfaces as the "200% improvement" headline. A feature that moves the premium upgrade rate from 0.3% to 0.9% is technically a 200% lift. In absolute terms, it moved 0.6 percentage points. At 500,000 monthly users, that is 3,000 additional premium conversions. Whether that is meaningful depends entirely on the business context — but leading with "200% improvement" without the base rate or absolute numbers is designed to obscure rather than inform. Senior analysts always pair relative changes with absolute changes and base rates. "Upgrade rate improved from 0.3% to 0.9% — a 200% relative lift and 3,000 additional conversions per month at current volume."' },
      { type: 'callout', label: 'The practical implications', text: 'Pre-register experiments so you cannot cherry-pick significant results after running multiple metrics. Replicate important results before shipping based on a single borderline p-value — especially for high-stakes, hard-to-reverse features. Report absolute changes alongside relative changes. And when evaluating a "significant" result, ask: given the prior probability that this hypothesis is true (based on similar past experiments), what is the posterior probability that this result is a real effect rather than a false positive?' },
      { type: 'cta', room: 'stats', label: 'Practice this in the Stats Room →' },
    ],
  },
];

const CATEGORY_CONFIG = {
  'Metrics':            { color: 'var(--green)',     bg: 'var(--green-bg)',    border: 'var(--green-border)',   icon: '📐' },
  'RCA':                { color: 'var(--yellow)',    bg: 'var(--yellow-bg)',   border: 'var(--yellow-border)',  icon: '🔍' },
  'Experimentation':    { color: 'var(--accent)',    bg: 'var(--accent-bg)',   border: 'var(--accent-border)',  icon: '⚗' },
  'Statistics':         { color: 'var(--teal)',      bg: 'var(--teal-bg)',     border: 'var(--teal-border)',    icon: '📊' },
  'Ambiguous Problems': { color: 'var(--purple)',    bg: 'var(--purple-bg)',   border: 'var(--purple-border)',  icon: '🧩' },
  'GenAI Analytics':    { color: 'var(--teal)',      bg: 'var(--teal-bg)',     border: 'var(--teal-border)',    icon: '🤖' },
  'Product Sense':      { color: 'var(--blue-text)', bg: 'var(--blue-bg)',     border: 'var(--blue-border)',    icon: '💡' },
  'SQL & Data':         { color: 'var(--accent)',    bg: 'var(--accent-bg)',   border: 'var(--accent-border)',  icon: '🗄' },
  'Career & Interview': { color: 'var(--red)',       bg: 'var(--red-bg)',      border: 'var(--red-border)',     icon: '🎯' },
  'Mental Models':      { color: 'var(--purple)',    bg: 'var(--purple-bg)',   border: 'var(--purple-border)',  icon: '🧠' },
};

const CATEGORIES = Object.keys(CATEGORY_CONFIG);

// ─────────────────────────────────────────────────────────────
// Post reader — renders a single post's content array
// ─────────────────────────────────────────────────────────────
function PostReader({ post, cfg, onBack, onNavigate, onRead }) {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600,
          padding: '0.3rem 0', marginBottom: '1.5rem',
        }}
      >
        ← Back to Learn
      </button>

      {/* Category + read time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem' }}>
        <span style={{
          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
          borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
        }}>{post.category}</span>
        <span style={{
          fontSize: '0.68rem', color: 'var(--text-dim)',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
        }}>{post.readMin} min read</span>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)',
        margin: '0 0 0.6rem', letterSpacing: '-0.02em', lineHeight: 1.25,
      }}>
        {post.title}
      </h1>

      {/* Summary */}
      <p style={{
        fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.65,
        margin: '0 0 2rem', paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {post.summary}
      </p>

      {/* Content blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {(post.content || []).map((block, i) => {
          if (block.type === 'text') {
            return (
              <p key={i} style={{
                fontSize: '0.92rem', color: 'var(--text)', lineHeight: 1.75,
                margin: 0,
              }}>
                {block.text}
              </p>
            );
          }

          if (block.type === 'heading') {
            return (
              <h2 key={i} style={{
                fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)',
                margin: '0.4rem 0 0', letterSpacing: '-0.01em', lineHeight: 1.3,
              }}>
                {block.text}
              </h2>
            );
          }

          if (block.type === 'example') {
            return (
              <div key={i} style={{
                background: 'var(--surface-code, #0d1117)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '1rem 1.2rem',
              }}>
                <div style={{
                  fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: '0.5rem',
                }}>
                  {block.label}
                </div>
                <pre style={{
                  fontSize: '0.82rem', color: 'var(--text-code, #e6edf3)',
                  margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  fontFamily: 'var(--font-mono, monospace)', lineHeight: 1.65,
                }}>
                  {block.text}
                </pre>
              </div>
            );
          }

          if (block.type === 'callout') {
            return (
              <div key={i} style={{
                background: 'var(--accent-bg)', border: `1px solid var(--accent-border)`,
                borderRadius: 'var(--radius)', padding: '1rem 1.2rem',
                borderLeft: '3px solid var(--accent)',
              }}>
                <div style={{
                  fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: '0.45rem',
                }}>
                  {block.label}
                </div>
                <p style={{
                  fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.65,
                  margin: 0, whiteSpace: 'pre-line',
                }}>
                  {block.text}
                </p>
              </div>
            );
          }

          if (block.type === 'list') {
            return (
              <ul key={i} style={{
                margin: 0, paddingLeft: '1.4rem',
                display: 'flex', flexDirection: 'column', gap: '0.45rem',
              }}>
                {block.items.map((item, j) => (
                  <li key={j} style={{
                    fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.6,
                  }}>
                    {item}
                  </li>
                ))}
              </ul>
            );
          }

          if (block.type === 'cta') {
            const isClickable = typeof onNavigate === 'function';
            return (
              <div key={i} style={{
                marginTop: '0.8rem', paddingTop: '1.2rem',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <button
                  onClick={isClickable ? () => onNavigate(block.room) : undefined}
                  style={{
                    background: 'var(--yellow)', color: '#000',
                    border: 'none', borderRadius: 'var(--radius)',
                    padding: '0.65rem 1.3rem',
                    fontSize: '0.85rem', fontWeight: 700,
                    cursor: isClickable ? 'pointer' : 'default',
                    letterSpacing: '-0.01em',
                    opacity: isClickable ? 1 : 0.75,
                  }}
                >
                  {block.label}
                </button>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Keep reading */}
      {post.related && post.related.length > 0 && (() => {
        const relatedPosts = post.related
          .map(id => POSTS.find(p => p.id === id))
          .filter(Boolean)
          .slice(0, 3);
        if (relatedPosts.length === 0) return null;
        return (
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>Keep reading</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {relatedPosts.map(rp => (
                <button
                  key={rp.id}
                  onClick={() => onRead(rp)}
                  style={{ textAlign: 'left', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.8rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}
                >
                  {rp.title} →
                </button>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main browser
// ─────────────────────────────────────────────────────────────
export function BlogBrowser({ onNavigate }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const total = POSTS.length;
  const writtenCount = POSTS.filter(p => p.content && p.content.length > 0).length;

  // If a post is selected, render the reader view
  if (selectedPost) {
    const cfg = CATEGORY_CONFIG[selectedPost.category] || CATEGORY_CONFIG['Metrics'];
    return (
      <PostReader
        post={selectedPost}
        cfg={cfg}
        onBack={() => setSelectedPost(null)}
        onNavigate={onNavigate}
        onRead={setSelectedPost}
      />
    );
  }

  return (
    <div className="pal-page-enter" style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name='file-text' size={18} color='var(--accent)' />
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Deep Dives</h1>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '580px', margin: '0 0 0.9rem' }}>
          Interviewers test concepts indirectly — they give you a scenario and watch whether the right mental model surfaces on its own. These deep dives are written to build that instinct: each one targets a specific pattern, shows where candidates get it wrong, and links directly to the practice cases where it shows up live. Read, then practice — the sequence matters.
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.7rem',
            display: 'flex', alignItems: 'baseline', gap: '0.3rem',
          }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{total}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>topics planned</span>
          </div>
          <div style={{
            background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.7rem',
            display: 'flex', alignItems: 'baseline', gap: '0.3rem',
          }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>{writtenCount}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>articles live</span>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
            borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.65rem',
            fontSize: '0.75rem', color: 'var(--yellow)', fontWeight: 600,
          }}>
            ⏳ More coming soon
          </div>
        </div>
      </div>

      {/* Category sections */}
      {CATEGORIES.map(cat => {
        const cfg = CATEGORY_CONFIG[cat];
        const posts = POSTS.filter(p => p.category === cat);
        if (!posts.length) return null;
        return (
          <div key={cat} style={{ marginBottom: '2.5rem' }}>

            {/* Category header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              marginBottom: '0.9rem', paddingBottom: '0.6rem',
              borderBottom: `1px solid var(--border-subtle)`,
            }}>
              <span style={{ fontSize: '1rem' }}>{cfg.icon}</span>
              <span style={{
                fontSize: '0.88rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.01em',
              }}>{cat}</span>
              <span style={{
                fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
                borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.45rem',
              }}>{posts.length} articles</span>
            </div>

            {/* Cards grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
              gap: '0.75rem',
            }}>
              {posts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  cfg={cfg}
                  index={index}
                  onClick={() => setSelectedPost(post)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PostCard({ post, cfg, onClick, index }) {
  const hasContent = post.content && post.content.length > 0;

  return (
    <div
      className="pal-card-enter pal-card-hover"
      onClick={onClick}
      style={{
        animationDelay: String(Math.min((index || 0) * 28, 400)) + 'ms',
        background: 'var(--surface)',
        border: '1.5px solid ' + (hasContent ? cfg.border : 'var(--border)'),
        borderRadius: 'var(--radius)',
        padding: '1.1rem 1.2rem',
        display: 'flex', flexDirection: 'column', gap: '0.45rem',
        opacity: hasContent ? 1 : 0.78,
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = hasContent
          ? '0 0 0 2px var(--accent-border)'
          : 'none';
      }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
          borderRadius: 'var(--radius-sm)', padding: '0.07rem 0.32rem',
        }}>{post.category}</span>
        <span style={{
          fontSize: '0.68rem', color: 'var(--text-dim)',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '0.07rem 0.32rem',
        }}>{post.readMin} min read</span>
        {hasContent ? (
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
            color: 'var(--green)', background: 'var(--green-bg)', border: '1px solid var(--green-border)',
            borderRadius: 'var(--radius-sm)', padding: '0.07rem 0.32rem', marginLeft: 'auto',
          }}>Read Now</span>
        ) : (
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
            color: 'var(--yellow)', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)',
            borderRadius: 'var(--radius-sm)', padding: '0.07rem 0.32rem', marginLeft: 'auto',
          }}>Coming Soon</span>
        )}
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)',
        margin: 0, letterSpacing: '-0.01em', lineHeight: 1.35,
      }}>
        {post.title}
      </h3>

      {/* Summary */}
      <p style={{
        fontSize: '0.79rem', color: 'var(--text-secondary)',
        margin: 0, lineHeight: 1.55, flex: 1,
      }}>
        {post.summary}
      </p>

      {/* Room CTA */}
      <div style={{
        paddingTop: '0.45rem', marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.71rem', color: 'var(--text-dim)',
      }}>
        {hasContent
          ? <span>Read article → <span style={{ color: cfg.color, fontWeight: 600 }}>then practice in {post.roomLabel}</span></span>
          : <span>Practice in → <span style={{ color: cfg.color, fontWeight: 600 }}>{post.roomLabel}</span></span>
        }
      </div>
    </div>
  );
}
