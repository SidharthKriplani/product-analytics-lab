// Product Analytics Lab — Interview Q&A Bank
// Analytical PA/PM questions with 3-tier model answers.
// NOT behavioral STAR questions (those are in behavioralQuestions.js).
// Each question tests judgment in the context of a real analytical call.
// Format: analyst = gets the call right; senior = correct + mechanism; staff = correct + forward-looking + stakeholder-aware

export const interviewQA = [

  // ─── A/B Testing & Experimentation ───────────────────────────────────────

  {
    id: 'qa01',
    category: 'Experimentation',
    difficulty: 'analyst',
    isFree: true,
    question: 'Walk me through how you would design an A/B test for a new checkout flow.',
    context: 'You\'re a product analyst at an e-commerce company. The PM wants to test a redesigned checkout that removes the address confirmation step.',
    tags: ['experiment-design', 'randomization', 'metrics'],
    answers: {
      analyst: 'Define the randomization unit (user or session — user for checkout to avoid within-user contamination). Set the primary metric as checkout completion rate. Define guardrails: cart abandonment rate and order error rate. Run a power calculation to determine sample size needed for the expected 2–3% lift. Set a fixed runtime of 2 weeks minimum to capture weekly seasonality. Pre-commit the decision rule before launch.',
      senior: 'Start by questioning whether user-level randomization is sufficient — if the same user can be in both arms on different devices, you have contamination. Use a persistent user ID tied to login state. The primary metric should be orders per session, not completion rate alone, because a streamlined flow might complete faster but attract lower-intent users. Set a novelty-effect checkpoint at day 3 to verify the lift isn\'t front-loaded. The guardrail I\'d add beyond cart abandonment is support ticket rate — a confusing new flow often shows up there before revenue does.',
      staff: 'Before touching the experiment design, I\'d challenge the hypothesis: is the address confirmation step actually the friction point, or is it a symptom of checkout anxiety that a simpler step removal won\'t fix? Run a funnel analysis to confirm where users actually drop — if the drop is on payment, redesigning address confirmation is solving the wrong problem. If the hypothesis holds, the experiment design question becomes about what level of confidence we need. For a checkout change on $50M+ ARR, a 2% lift is $1M annually — worth a 4-week experiment with 95% power at an MDE of 1.5%. I\'d also insist on a 1-week post-ship monitoring window because checkout regressions often surface in refund and chargeback data 5–7 days after a user\'s first order.',
    },
  },

  {
    id: 'qa02',
    category: 'Experimentation',
    difficulty: 'analyst',
    isFree: true,
    question: 'Your A/B test shows p = 0.03 but the CI is [+0.1%, +6.2%]. The PM wants to ship. What do you do?',
    context: 'The experiment ran for 2 weeks on a feature with expected 2% lift. The primary metric is statistically significant but the CI is very wide.',
    tags: ['statistical-significance', 'confidence-interval', 'decision-making'],
    answers: {
      analyst: 'Flag that statistical significance alone isn\'t enough to ship. A CI of [+0.1%, +6.2%] means the realistic downside scenario is near-zero impact. I\'d ask: what is our minimum threshold for shipping this? If 0.1% is acceptable, ship. If we need 1%+ to justify the maintenance cost, the experiment doesn\'t meet the bar. I\'d also check the guardrail metrics before any decision.',
      senior: 'The CI tells you the experiment was underpowered for the effect size you were targeting. The point estimate (+3.15%) is interesting but the precision is too low to make a confident call — you\'re saying "probably positive, but possibly near-zero." Before recommending ship vs. wait, I\'d run a post-hoc power analysis to determine how many more weeks we\'d need to tighten the CI. If it\'s 2 more weeks, that\'s worth it. If it\'s 8 weeks, ship with monitoring. The PM conversation is: "Significant doesn\'t mean reliable — here\'s what the data actually says about the range of outcomes."',
      staff: 'I\'d reframe the question from "do we ship?" to "what decision are we actually making?" A CI of [+0.1%, +6.2%] at p=0.03 tells you the experiment detected a positive signal but can\'t bound the magnitude. The right frame is: what is the cost of being wrong in each direction? If we ship and the true effect is +0.1%, we paid engineering maintenance for near-zero return. If we don\'t ship and the true effect is +6.2%, we left significant value on the table. For most checkout experiments, the asymmetry favors shipping — the downside of +0.1% is low, the upside of +6.2% is real. But I\'d ship with a 30-day post-launch monitoring commitment and a kill threshold defined upfront. I\'d also document this as a precedent: CI width, not just p-value, should be part of our ship criteria going forward.',
    },
  },

  {
    id: 'qa03',
    category: 'Experimentation',
    difficulty: 'senior',
    isFree: false,
    question: 'You detect a sample ratio mismatch in your experiment. What do you do?',
    context: 'An experiment targeting a 50/50 split shows 54% in control and 46% in treatment after one week. p-value for SRM is 0.001.',
    tags: ['srm', 'validity', 'experiment-debugging'],
    answers: {
      analyst: 'Stop reading the outcome metrics immediately — SRM invalidates the entire experiment. Report to the PM that we can\'t trust any of the results. Investigate the cause: check assignment logging for bugs, look for bot traffic patterns in the treatment arm, verify that eligibility criteria didn\'t change mid-experiment, check for redirect issues if the treatment involves a page change.',
      senior: 'SRM is a validity stopper, not a flag to note and move on. The first step is to confirm it\'s real and not a logging artifact — query assignment events directly from the raw logs rather than the reporting layer, because sometimes aggregation bugs create false SRM signals. If confirmed, pause the experiment and run the diagnostic tree: (1) Was the assignment logic changed after launch? (2) Is there differential dropout between arms — are treatment users less likely to complete the funnel and therefore less likely to appear in the denominator? (3) Is the traffic source skewed — e.g., email campaigns being unevenly distributed? Differential dropout is the most common cause and the hardest to fix retroactively.',
      staff: 'The SRM investigation is important, but my first call is to the PM to set expectations: we have a validity problem and there\'s no safe path to a decision from this data. Even if the outcome metrics look good, a 54/46 split at p=0.001 means the arms aren\'t comparable — any observed effect could be explained by composition differences rather than the treatment. The fix depends on the root cause. If it\'s a logging bug, we can potentially correct the assignment data and re-run the analysis. If it\'s differential user dropout (e.g., treatment is harder to complete so weaker users leave), there\'s no statistical correction that makes this recoverable — we need to redesign the experiment with a different randomization approach. I\'d also flag this as a platform audit: if SRM went undetected for a week, what other experiments might have launched without proper checks?',
    },
  },

  {
    id: 'qa04',
    category: 'Experimentation',
    difficulty: 'senior',
    isFree: false,
    question: 'When should you NOT run an A/B test?',
    context: 'You\'re reviewing the experiment backlog and notice several proposals that may not warrant randomized testing.',
    tags: ['experiment-design', 'when-not-to-experiment', 'judgment'],
    answers: {
      analyst: 'Don\'t run an A/B test when: the population is too small to reach statistical power (e.g., enterprise B2B with 50 accounts), the change is irreversible (like a database migration), there are ethical constraints on randomizing users (e.g., safety features), or the decision timeline is shorter than the required runtime.',
      senior: 'Add to that list: when the treatment can\'t be truly randomized without interference. In two-sided marketplaces, user-level randomization breaks SUTVA — giving a buyer a new recommendation algorithm affects the sellers they interact with, which affects other buyers. The right tool there is a geo holdout or switchback design, not user-level A/B. Also flag: when a feature is so fundamental that putting half your users on the old version for 3 weeks causes real harm — in those cases, make the judgment call and monitor post-launch rather than experimenting.',
      staff: 'The harder judgment is recognizing when "we should run an experiment" is being used to delay a decision rather than to improve it. A PM who proposes an experiment for a change that\'s clearly beneficial and low-risk is using rigor as a hedge against accountability. The opportunity cost of running a 4-week experiment on a feature that everyone expects to be positive is real — you delayed the rollout, used engineering capacity, and added maintenance overhead. I\'d push back with: "What would it take to convince us NOT to ship this? If we can\'t answer that, we don\'t need an experiment — we need a launch with monitoring." The test for whether to experiment is whether the outcome could plausibly change the decision. If the answer is no, you\'re wasting statistical power that could be used elsewhere.',
    },
  },

  {
    id: 'qa05',
    category: 'Experimentation',
    difficulty: 'staff',
    isFree: false,
    question: 'How do you handle multiple testing when you\'re tracking 10 metrics in your experiment?',
    context: 'Your experiment dashboard shows significance on 3 of 10 metrics. The PM wants to report all three as wins.',
    tags: ['multiple-testing', 'fwer', 'fdr', 'reporting'],
    answers: {
      analyst: 'Flag the multiple testing problem: with 10 metrics, 1 false positive is expected at alpha=0.10. Apply a correction — Bonferroni for strict control (divide alpha by number of tests), Benjamini-Hochberg for less conservative FDR control. Re-evaluate which of the 3 significant results survive correction. Report the adjusted results honestly.',
      senior: 'The correction depends on whether the metrics were pre-registered or exploratory. Confirmatory metrics (defined before launch) should be evaluated at the pre-committed alpha with a family-wise error rate correction. Exploratory metrics are hypothesis generators, not evidence — frame their significance as "worth investigating" rather than "we proved this." In practice, most experiment dashboards are exploratory even when teams pretend otherwise. I\'d also look at the 3 significant metrics: if they\'re conceptually correlated (e.g., click rate, conversion rate, revenue), that\'s a weaker signal than 3 independent metric types all moving in the same direction.',
      staff: 'The PM\'s framing — "3 significant results = 3 wins" — is the exact mistake this situation creates. My response is to reframe around what we pre-committed to: what was the primary metric, and did it pass? The 10-metric dashboard is useful for understanding the mechanism of the effect, not for generating additional wins. If the primary metric is significant post-correction, we have evidence to ship. The secondary metrics tell us why. If the primary metric doesn\'t survive correction, we have a failed experiment regardless of what the secondary metrics show. The staff move is to establish this framing before the experiment launches — agree on the primary metric, the correction method, and the decision rule in writing. Retroactive corrections are harder to enforce and easier to argue around.',
    },
  },

  {
    id: 'qa91',
    category: 'Experimentation',
    difficulty: 'analyst',
    isFree: true,
    question: 'You want to test a new pricing algorithm for drivers on a ride-sharing marketplace, but user-level randomization worries you. Why, and what would you do instead?',
    context: 'In a two-sided marketplace, treating individual riders differently can affect the driver supply pool that other riders (including control-group riders) draw from.',
    tags: ['network-effects', 'interference', 'marketplace-experiments'],
    answers: {
      analyst: 'User-level randomization assumes each user\'s outcome is independent of which group other users are in (SUTVA), but in a marketplace, a treatment that changes rider pricing affects driver behavior and availability, which then affects ALL riders in that geographic area, including those in the control group — that\'s interference, and it biases the comparison between arms because control isn\'t a clean counterfactual anymore. I\'d consider randomizing at the geography level instead — assign whole cities or zones to treatment or control, so the driver supply pool within a zone isn\'t split between conditions.',
      senior: 'Geographic or cluster randomization (by city, zone, or time-of-day switchback) avoids the direct supply-pool contamination, but introduces its own tradeoffs: fewer independent units (a handful of cities instead of thousands of individual users) means much lower statistical power, and cities differ from each other in ways that add noise to the comparison. I\'d consider a switchback design — randomizing which pricing algorithm is active in a given zone at different time windows — which gives more independent units than city-level randomization while still avoiding within-window contamination, since all riders and drivers in a zone experience the same condition simultaneously.',
      staff: 'The core judgment call is trading off bias (from interference, if you stick with user-level randomization) against power and complexity (from cluster or switchback designs). For a pricing algorithm change with potentially large network effects, I\'d accept the power cost and use a switchback or geo-cluster design rather than risk a biased user-level result that looks clean but is quietly contaminated. I\'d also validate the choice by checking for interference in a smaller pilot first — comparing control-group outcomes in markets with heavy treatment saturation versus markets with light treatment saturation; if control outcomes differ across those, that confirms interference is real and justifies the added complexity of a cluster design for the full experiment.',
    },
  },

  {
    id: 'qa92',
    category: 'Experimentation',
    difficulty: 'senior',
    isFree: false,
    question: 'The team wants the ability to make ship/no-ship decisions earlier than a fixed 14-day runtime when the signal is very strong. How would you design this into your experimentation platform rather than deciding ad hoc?',
    context: 'Currently, experiments run to a fixed pre-committed duration. The team wants a principled way to sometimes stop early without inflating false positive rates.',
    tags: ['sequential-testing', 'experiment-design', 'peeking'],
    answers: {
      analyst: 'The right approach is to build in a formal sequential testing method — like a group sequential design or an always-valid p-value (mSPRT-based) approach — that adjusts the significance threshold at each look to account for the fact that you\'re checking multiple times, rather than continuing to use a fixed-horizon p < 0.05 threshold and just stopping whenever it\'s crossed. Ad hoc early stopping on a fixed-horizon design inflates the true false positive rate well above 5% because you\'re implicitly running multiple tests.',
      senior: 'I\'d implement this as a platform-level feature rather than leaving it to individual analysts to apply correctly under time pressure — define a small number of pre-specified interim analysis points (e.g., day 3, day 7, day 14) with alpha-spending built into the platform\'s significance calculation, so teams get a valid early-stop decision without needing to understand or manually apply the underlying sequential testing math each time. This also standardizes the practice across teams, preventing the inconsistency where some analysts apply ad hoc peeking corrections and others don\'t.',
      staff: 'Building this at the platform level changes the org\'s relationship with experiment runtime entirely — instead of every team informally negotiating "can we stop early," which tends to produce inconsistent rigor and a bias toward stopping early exactly when results look good, a built-in sequential framework makes early stopping a rigorous, available option for every experiment by default. I\'d prioritize this as platform infrastructure investment specifically because the current ad hoc pattern (teams asking to stop early on promising results) is a systematic bias risk — it stops disproportionately on interim results that look good and continues to full-term when they don\'t, which if uncorrected, silently inflates the platform\'s overall false positive rate across every experiment run this way.',
    },
  },

  {
    id: 'qa93',
    category: 'Experimentation',
    difficulty: 'senior',
    isFree: false,
    question: 'A core ranking algorithm has an always-on holdout group that\'s been running for over a year to measure long-term impact. What are the risks of maintaining it that long, and how would you manage them?',
    context: '5% of users have been permanently excluded from ranking algorithm improvements for 14 months to serve as a long-term counterfactual.',
    tags: ['holdout-design', 'long-running-experiments', 'always-on-holdout'],
    answers: {
      analyst: 'The main risk is that holdout users are increasingly experiencing a stale, degraded product relative to what the majority of users get, which creates both a fairness/user-experience concern and a growing behavioral gap that isn\'t really measuring "no improvements" anymore but "accumulated staleness" — 14 months of missed improvements compounds in a way that\'s different from a short-term holdout. I\'d check whether holdout users show elevated churn or dissatisfaction that\'s disproportionate to any single feature\'s effect, which would suggest the holdout itself is now causing harm rather than neutrally measuring.',
      senior: 'I\'d also check whether the holdout is still serving its original purpose — if the initial goal was measuring long-term compounding impact of ranking improvements over a year, and you\'re now at that milestone, the marginal value of extending the holdout further starts to decline while the cost (churn risk, biased long-term learning from a population that\'s diverging further from the general population) keeps rising. I\'d propose refreshing the holdout population periodically (rotating which 5% of users are held out, rather than the same fixed cohort indefinitely) so no single group bears the full cumulative cost of missing over a year of improvements.',
      staff: 'Beyond the specific holdout, I\'d push for an explicit sunset and refresh policy for any always-on holdout as a standing platform practice — define upfront how long a holdout cohort runs before being rotated or released, rather than letting it run indefinitely by default because nobody owns the decision to end it. I\'d also weigh whether the long-term learning this holdout provides (compounding value of many small ranking improvements) still justifies the ongoing cost to the 5% experiencing it, given that after 14 months, you likely already have your answer to the original question, and continuing mainly just accumulates further one-sided cost without much additional insight.',
    },
  },

  {
    id: 'qa94',
    category: 'Experimentation',
    difficulty: 'senior',
    isFree: false,
    question: 'Three teams each want to run an experiment on the same checkout page next month, but running them all simultaneously risks interaction effects, and there isn\'t enough traffic to run them fully sequentially without massive delay. How do you prioritize?',
    context: 'You\'re the experimentation platform owner mediating between three product teams competing for the same experimental surface.',
    tags: ['experiment-prioritization', 'traffic-allocation', 'interaction-effects'],
    answers: {
      analyst: 'I\'d first check whether the three experiments are actually likely to interact — if they touch genuinely independent parts of the checkout page (e.g., one changes the payment method selector, one changes shipping options, one changes a promotional banner) with no plausible interaction, they may be able to run concurrently using orthogonal, non-overlapping traffic splits rather than needing full sequencing. If they do plausibly interact (e.g., two both touch pricing display), I\'d prioritize based on expected impact and confidence, running the highest-expected-value one first.',
      senior: 'For experiments likely to interact, I\'d use a factorial design where feasible rather than pure sequencing — running two experiments as a 2x2 factorial lets you measure both main effects and their interaction simultaneously, using the traffic more efficiently than running them one after another. Where a factorial design isn\'t practical (e.g., very different metrics or team timelines), I\'d prioritize using a combination of expected business impact, confidence in the hypothesis, and urgency (a compliance-driven change should generally go first regardless of a competing feature\'s projected upside), rather than defaulting to first-come-first-served.',
      staff: 'This is fundamentally a resource allocation problem the org needs a standing policy for, not a one-off negotiation to redo every time three teams collide on the same surface — I\'d propose a lightweight quarterly experiment roadmap for high-traffic-contention surfaces like checkout, where teams submit planned experiments in advance and a shared prioritization framework (impact estimate, confidence, urgency, interaction risk with other planned experiments) determines sequencing or factorial combination before anyone builds their experiment, rather than discovering the conflict after implementation work has already started and creating a political scramble over whose experiment gets delayed.',
    },
  },

  {
    id: 'qa95',
    category: 'Experimentation',
    difficulty: 'staff',
    isFree: false,
    question: 'Your experiment shows a flat, non-significant overall effect, but you suspect the treatment might be working well for one segment and poorly for another, canceling out in the average. How do you investigate without just fishing for a subgroup that looks good?',
    context: 'The primary metric shows no significant lift overall. A team member wants to slice by every available dimension to find a positive subgroup to justify shipping.',
    tags: ['heterogeneous-treatment-effects', 'subgroup-analysis', 'experimentation'],
    answers: {
      analyst: 'I\'d resist the urge to slice by every available dimension after the fact, since testing dozens of post-hoc subgroups is exactly the multiple-comparisons problem that will reliably produce at least one "significant" looking subgroup by chance alone, regardless of whether a real heterogeneous effect exists. Instead, I\'d check whether any subgroup hypothesis was pre-specified before the experiment launched — if the team had a genuine, principled reason upfront to expect the effect to differ by a specific segment (e.g., new vs. existing users), that pre-registered subgroup is worth examining with appropriate statistical care.',
      senior: 'For any subgroup analysis, whether pre-registered or exploratory, I\'d apply a multiple-comparisons correction appropriate to how many subgroups are being examined, and treat any subgroup finding from an unregistered, exploratory slice as hypothesis-generating rather than confirmatory — worth investigating further, not worth shipping a segment-specific rollout on immediately. If a specific subgroup effect looks genuinely promising, the right next step is a dedicated follow-up experiment targeted at that segment specifically, powered appropriately for that segment\'s traffic volume, rather than treating the subgroup slice from the original underpowered comparison as sufficient evidence on its own.',
      staff: 'The pressure to find a subgroup that "justifies shipping" after a null overall result is a predictable and risky pattern — it optimizes for finding a story that lets the team ship something rather than for finding the truth about whether the treatment actually works differently across segments. I\'d separate these two goals explicitly for the team: if there\'s a real, principled reason to believe in heterogeneity (e.g., a plausible mechanism for why new users would respond differently than power users), that\'s worth a properly powered, pre-registered follow-up experiment. If the motivation is primarily "we want this to have worked," I\'d hold the line that a null overall result is a null result, and shipping based on an unvalidated post-hoc subgroup risks rolling out a change with no real evidence behind it, dressed up as a data-driven decision.',
    },
  },

  {
    id: 'qa96',
    category: 'Experimentation',
    difficulty: 'senior',
    isFree: false,
    question: 'Two unrelated experiments are running at the same time on different parts of the app, and someone flags that their combined effect on a shared metric might not be additive. How would you check this?',
    context: 'Experiment A changes the onboarding flow; Experiment B changes the pricing page. Both could plausibly affect overall signup-to-paid conversion, the shared metric both teams care about.',
    tags: ['interaction-effects', 'concurrent-experiments', 'experimentation'],
    answers: {
      analyst: 'I\'d check whether the experimentation platform\'s traffic allocation is orthogonal — if users are independently and randomly assigned to both experiments (so a user could be in any of the four combinations: A-control/B-control, A-treatment/B-control, etc.), the platform can measure whether there\'s an interaction by comparing the four-cell outcomes rather than just each experiment\'s main effect in isolation. If the two experiments aren\'t running on orthogonal, independently-randomized populations, this kind of interaction check isn\'t possible after the fact and needs to be planned before both experiments launch.',
      senior: 'Assuming orthogonal assignment exists, I\'d run a 2x2 analysis of the shared metric across all four cells to test for a statistically meaningful interaction term, not just each experiment\'s isolated main effect — a genuine interaction would show up as the combined effect of A-treatment and B-treatment being meaningfully different from the sum of each treatment\'s individual effect. If no orthogonal data exists retroactively, I\'d flag this as a gap in the platform\'s experiment coordination and recommend that going forward, any two experiments touching a shared downstream metric are checked for orthogonal assignment or explicitly sequenced rather than run blind to each other.',
      staff: 'This points to a structural gap in how the experimentation platform tracks and coordinates concurrent experiments — ideally, before two experiments both affecting the same downstream metric are allowed to run simultaneously, the platform should flag the overlap and either enforce orthogonal randomization (so an interaction check is possible) or require the teams to coordinate on sequencing. I\'d propose this as a standing improvement: a shared-metric conflict detector that surfaces when two live or proposed experiments both plausibly affect the same key metric, prompting an explicit decision (run orthogonally, sequence them, or accept and document the risk) rather than discovering the ambiguity after the fact when someone happens to notice the overlap.',
    },
  },

  {
    id: 'qa97',
    category: 'Experimentation',
    difficulty: 'senior',
    isFree: false,
    question: 'You want to test a new pricing tier, but legal and practical constraints mean you can\'t randomize individual users — pricing has to be consistent within a country. How do you design a valid test?',
    context: 'Regulatory and customer-trust reasons make user-level price randomization within the same country infeasible.',
    tags: ['geo-experiments', 'non-randomized-testing', 'pricing-experiments'],
    answers: {
      analyst: 'Since randomization within a country isn\'t possible, I\'d use a geographic (country or region-level) test design instead — roll out the new pricing tier in a subset of comparable countries and use other similar countries as a control, comparing trends before and after the change. This sacrifices individual-level randomization but is the standard approach when user-level testing is legally or practically off the table.',
      senior: 'The validity of a geo-based design depends heavily on choosing comparable control markets — I\'d look for countries with historically similar trends on the metric of interest (revenue per user, conversion rate) before the test, ideally using a synthetic control method that constructs a weighted combination of several comparison countries matching the treatment country\'s pre-period trend more precisely than any single country alone. This guards against the risk that the treatment country was already on a different trajectory for reasons unrelated to the pricing change, which a simple single-country-vs-single-country comparison wouldn\'t catch.',
      staff: 'Beyond the statistical design, I\'d factor in that a geo-based pricing test has real-world consequences that are harder to reverse than a typical user-level A/B test — customers in the treatment country will notice and may react to a price change with more friction (competitor comparison, public discussion) than in a randomized experiment where individual users are less likely to compare notes with people on a different price. I\'d choose treatment markets partly based on how reversible the change is if the test needs to be rolled back, and build in a clear communication and rollback plan alongside the statistical design, since managing customer reaction is as much a part of running this test responsibly as the synthetic control methodology itself.',
    },
  },

  {
    id: 'qa98',
    category: 'Experimentation',
    difficulty: 'analyst',
    isFree: false,
    question: 'Users in a year-long holdout group have started reporting the product feels outdated compared to what their coworkers are using. Should this influence how you interpret the holdout\'s long-term data?',
    context: 'The holdout was designed to measure the cumulative long-term effect of a year of product improvements by comparing it against users who received every update.',
    tags: ['holdout-decay', 'long-term-experiments', 'experiment-fatigue'],
    answers: {
      analyst: 'Yes — this is an important caveat on interpreting the holdout data. If holdout users are aware they\'re missing out on updates their peers have (through word of mouth, shared workplaces, or public discussion of new features), their behavior may be affected not just by the product staying the same, but by the psychological effect of feeling left behind, which is a different mechanism than the pure product-quality comparison the holdout was designed to isolate.',
      senior: 'This is sometimes called experiment fatigue or awareness contamination — the holdout was designed to isolate the causal effect of a year of product changes under the assumption that holdout users\' experience differs from treatment users\' only in the product itself, but if holdout users know they\'re in a degraded state and that knowledge itself changes their behavior (increased frustration, active comparison-shopping, lower goodwill), the holdout-versus-treatment gap now reflects both the real product improvement AND this awareness effect, conflated together. I\'d try to isolate the awareness effect by surveying a sample of holdout users about their awareness of missing features, and see if behavior differs between holdout users who are aware versus those who aren\'t.',
      staff: 'This is a real limitation of long-running holdouts that gets more severe the longer the holdout runs and the more visible the withheld improvements are to the holdout population — at some point, the holdout stops cleanly measuring "value of product improvements" and starts partly measuring "cost of feeling excluded," which is a legitimate but different finding that shouldn\'t be silently attributed to the product changes themselves. I\'d report the long-term holdout comparison with this caveat explicitly, and use it as a data point in favor of shorter or rotating holdout designs going forward, since the awareness-contamination risk grows with holdout duration and visibility in a way that a short-term or blinded holdout design would largely avoid.',
    },
  },

  // ─── Metrics & KPIs ────────────────────────────────────────────────────────

  {
    id: 'qa06',
    category: 'Metrics',
    difficulty: 'analyst',
    isFree: true,
    question: 'How would you define the north star metric for a B2B SaaS project management tool?',
    context: 'The PM asks you to define the one metric that best captures the value your product delivers to users.',
    tags: ['north-star', 'metric-design', 'b2b'],
    answers: {
      analyst: 'The north star should reflect value delivered, not just activity. For a B2B PM tool, I\'d propose "projects with active collaboration in the last 30 days" — a project where only one person is working isn\'t using the collaboration value prop. I\'d avoid DAU because it conflates passive logins with real engagement.',
      senior: 'The key question for any north star is: what does a user have to do for the product to have delivered its core promise? For a PM tool, the promise is cross-functional coordination. A metric like "projects with 3+ active contributors and at least one completed milestone in the last 30 days" captures both breadth (team adoption) and depth (actual completion). I\'d validate this by checking if it predicts retention — if teams that hit this metric consistently are 2x less likely to churn, it\'s a real signal. If not, keep searching.',
      staff: 'I\'d push back on the framing of "one metric." A north star describes the health of your value delivery, and for B2B SaaS, health has two dimensions that often trade off: depth (power users doing complex work) and breadth (widespread team adoption). A single metric that tries to capture both is usually gamed. I\'d propose a north star metric plus one health check: "teams completing at least 2 projects per month" (captures depth and recurring value) with a health check of "% of licensed seats actively contributing" (captures breadth and flags zombie licenses). The health check doesn\'t drive decisions, but it tells you if the north star is being achieved in a sustainable way or just by power users carrying inactive teams.',
    },
  },

  {
    id: 'qa07',
    category: 'Metrics',
    difficulty: 'analyst',
    isFree: true,
    question: 'DAU dropped 15% overnight. Walk me through your first 30 minutes of investigation.',
    context: 'You\'re woken up by an alert. No scheduled releases happened yesterday. You have access to your analytics dashboard.',
    tags: ['rca', 'metric-drop', 'incident-response'],
    answers: {
      analyst: 'First, verify the drop is real and not a tracking issue — check if other metrics moved proportionally, look at raw event counts vs derived DAU. Second, segment the drop: is it global or concentrated in one platform (iOS/Android/web), geography, or user cohort? Third, check the data pipeline for instrumentation gaps — missing events from a specific SDK version or region. Fourth, check if any experiment launched or rolled back around the time of the drop.',
      senior: 'The sequence matters: data quality first, then diagnosis. A 15% overnight DAU drop is almost always one of four things: (1) tracking bug — check if session events dropped proportionally; (2) experiment or feature flag change — query your deployment log for the 24-hour window; (3) external factor — major competitor launch, social media incident, App Store issue; (4) real product regression — a broken flow is preventing users from completing a core action. I\'d rule out (1) and (2) in the first 10 minutes before doing any analysis. If both are clean, I\'m looking at platform-specific breakdowns — a 15% drop concentrated in iOS is almost certainly an App Store or SDK issue, not a product regression.',
      staff: 'The 30-minute frame is a communication question as much as an analysis question. In the first 5 minutes: confirm the drop is real (not a tracking artifact), confirm it\'s sustained (not a momentary spike in the time-series), and send an initial message to the stakeholders who need to know — with "investigating, update in 30 min" rather than waiting for a full diagnosis. The worst outcome is a real incident where leadership finds out from someone other than you. In the next 25 minutes: run the platform/geo/cohort segmentation to find the surface area, check deployment logs, and form a primary hypothesis. At 30 minutes, you don\'t need a cause — you need a hypothesis, a next step, and an estimated time to resolution. The investigation continues; the communication loop starts immediately.',
    },
  },

  {
    id: 'qa08',
    category: 'Metrics',
    difficulty: 'senior',
    isFree: false,
    question: 'How do you design guardrail metrics for a feed ranking experiment?',
    context: 'The team is testing a new ML ranking model for a social feed. The primary metric is time-on-feed. What guardrails would you set?',
    tags: ['guardrail-metrics', 'experiment-design', 'feed'],
    answers: {
      analyst: 'Guardrails for time-on-feed: notification opt-out rate (increased engagement that drives people away), share rate and comment rate (are users engaging meaningfully or just scrolling), creator post rate (are the creators who power the feed continuing to post), and content diversity score (preventing filter bubble concentration).',
      senior: 'The guardrails need to protect against the specific failure modes of optimizing time-on-feed. The worst outcome for this experiment is a model that increases time-on-feed by surfacing outrage or emotionally manipulative content — users spend more time but feel worse afterward. I\'d add: (1) survey-based satisfaction score on a sampled cohort, (2) negative feedback rate (hide/report actions per impression), (3) return visit rate at D7 — short-term time increases that reduce long-term retention are a common feed optimization failure. Pre-commit that if any guardrail is breached by more than X%, we pause regardless of primary metric performance.',
      staff: 'The design of guardrail metrics is ultimately a values question before it\'s a measurement question: what do we not want to optimize toward, even if it works for the primary metric? For a feed ranking model, I\'d involve the trust and safety team and potentially policy leadership before writing the metrics, because they\'ve seen the failure modes that don\'t show up in engagement data until they\'re a PR crisis. The technical guardrails (notification opt-out, negative feedback) are necessary but not sufficient — you also need qualitative signal. I\'d propose running a 50-person qualitative study alongside the quantitative experiment: show users their top-ranked content, ask how it makes them feel. That data won\'t be statistically clean, but it catches things the metrics miss.',
    },
  },

  {
    id: 'qa09',
    category: 'Metrics',
    difficulty: 'senior',
    isFree: false,
    question: 'Retention dropped from 38% to 31% D30 over the last quarter. How do you determine if it\'s a real product regression or a mix-shift artifact?',
    context: 'You\'re a growth analyst at a consumer mobile app. The drop is consistent across the last 3 months.',
    tags: ['retention', 'cohort-analysis', 'mix-shift'],
    answers: {
      analyst: 'Run cohort-level retention rather than cross-sectional. Separate new users acquired in Q4 from existing cohorts. If the retention of the existing cohorts is stable and only new cohorts show lower D30 retention, it\'s an acquisition mix-shift problem, not a product regression.',
      senior: 'The diagnostic has three steps. First, plot D30 retention by acquisition cohort and acquisition channel — if newer cohorts are worse but older cohorts are stable, the problem is in what you\'re acquiring, not in what the product delivers. Second, look at the channel mix: if paid acquisition share grew and organic acquisition share shrank, you\'re likely comparing a cohort of high-intent organic users to a cohort of lower-intent paid users. Third, hold channel constant — look at organic-only retention by cohort. If organic D30 retention also dropped, you have a real product problem. If it\'s stable, it\'s purely a mix issue.',
      staff: 'The mix-shift vs. regression distinction matters enormously for what you recommend. Mix-shift requires a conversation about acquisition strategy and LTV optimization — the product team has no lever to pull. Product regression requires engineering investigation. Getting this wrong means sending the wrong team to solve the problem. I\'d add one more diagnostic: look at the D1, D7, and D30 retention curve shape, not just the D30 number. A mix-shift artifact typically shows up as a flat degradation across all time points. A product regression usually shows up as a specific inflection point — the retention curve diverges at D7 or D14 rather than from day 1. If the divergence is at D7, something broke in the week-1 experience. If it\'s at D30, it\'s a content or engagement depth problem.',
    },
  },

  {
    id: 'qa10',
    category: 'Metrics',
    difficulty: 'staff',
    isFree: false,
    question: 'Your product has 5 candidate north star metrics that all correlate with revenue. How do you choose between them?',
    context: 'A marketplace product has 5 metrics that all predict revenue: GMV, orders, active buyers, buyer satisfaction score, and repeat purchase rate.',
    tags: ['north-star', 'metric-selection', 'marketplace'],
    answers: {
      analyst: 'Apply three filters: (1) leading vs. lagging — prefer leading indicators that predict future revenue over lagging ones that reflect past revenue. (2) Actionable — the team must have levers to move it. (3) Resistant to gaming — a metric that can be artificially inflated without delivering real value is dangerous as a north star.',
      senior: 'Run a regression or correlation analysis to see which of the 5 metrics has the strongest leading predictive relationship with 6-month forward revenue. Orders might correlate with current GMV but repeat purchase rate might be a better predictor of 6-month LTV. Also test stability — a metric that fluctuates wildly with promotional events tells you less about product health than one that moves smoothly with underlying engagement. Once you have a leading indicator that\'s stable and predictive, check if it can be decomposed into levers the team controls: repeat purchase rate = f(product quality, notifications, assortment) is actionable. "Revenue" as a metric isn\'t — too many external factors.',
      staff: 'The real question behind "which metric?" is "which metric changes behavior in the right direction?" A north star works as an organizational alignment tool only if it can\'t be gamed without improving the underlying reality. GMV on a marketplace can be inflated by subsidizing transactions — it moves up without the product getting better. Repeat purchase rate on the same marketplace is harder to game because it requires a user to come back voluntarily. That resistance to gaming is what I\'d optimize for above correlation with revenue. I\'d also test each metric against this question: if this metric is flat for 6 months, does it tell us we have a problem? GMV flat could mean healthy business in a flat market. Repeat purchase rate flat almost certainly means something is wrong with retention — it\'s a more sensitive signal. Pick the metric that screams the loudest when things go wrong.',
    },
  },

  {
    id: 'qa83',
    category: 'Metrics',
    difficulty: 'analyst',
    isFree: true,
    question: 'How would you build a metric tree for a new subscription upsell initiative?',
    context: 'The team is launching a mid-tier subscription upgrade prompt and wants to understand what metrics to track and how they relate to each other.',
    tags: ['metric-tree', 'metric-decomposition', 'metrics'],
    answers: {
      analyst: 'I\'d decompose the top-level goal — incremental upgrade revenue — into its component drivers: upgrade prompt impressions × click-through rate × upgrade conversion rate × average upgrade revenue per converter. Tracking each level separately lets you diagnose exactly which stage is underperforming if the overall number disappoints, rather than only seeing the final revenue number move without knowing why.',
      senior: 'A metric tree is most useful when each node maps to a distinct, ownable lever — impressions map to placement and eligibility logic, click-through maps to prompt copy and design, conversion maps to pricing and value communication on the upgrade page, and revenue-per-converter maps to which tier users actually choose. I\'d make sure the tree structure reflects that ownership, since a tree that\'s mathematically correct but doesn\'t map to anyone\'s actual levers won\'t drive action when a specific node underperforms.',
      staff: 'Beyond the immediate initiative, I\'d design this metric tree to plug into the existing subscription revenue metric tree rather than as a standalone artifact, since upsell revenue is one branch of overall subscription health alongside new subscriptions and churn — if the tree is built in isolation, it becomes another one-off dashboard that goes stale once this initiative\'s launch excitement fades. I\'d also add a guardrail branch (downgrade rate and churn rate for upgraded users specifically) since an upsell push that gets users into a tier they don\'t stick with just relabels churn as a delayed problem rather than solving it.',
    },
  },

  {
    id: 'qa84',
    category: 'Metrics',
    difficulty: 'senior',
    isFree: false,
    question: 'Total signups grew 40% this quarter and the team wants to celebrate it in the board deck. What would make you push back on presenting this as a win?',
    context: 'You\'re asked to add the signup growth number to the quarterly board deck as a highlight metric.',
    tags: ['vanity-metrics', 'metrics', 'board-reporting'],
    answers: {
      analyst: 'Before presenting it as a win, I\'d check what happened to activation and retention among these new signups — if signup growth was driven by a promotional campaign or a lower-friction signup flow that let in lower-intent users, the raw signup count can grow while the number of users who actually stick around and derive value stays flat or even declines in absolute terms. Signups alone, without a quality lens, is a classic vanity metric.',
      senior: 'I\'d specifically check D7 or D30 retention for this quarter\'s signup cohort against prior quarters\' cohorts at the same maturity — if retention rate dropped even as signup volume grew, the absolute number of genuinely retained users might not have grown as much as the topline suggests, or could even be flat. I\'d present signup growth alongside retained-user growth (signups × retention rate) so the board sees the metric that actually reflects durable business growth, not just top-of-funnel volume that may not convert to lasting value.',
      staff: 'The instinct to lead with a big, simple, growing number in a board deck is understandable, but presenting an unqualified vanity metric to the board sets a bad precedent — if it later turns out this quarter\'s growth didn\'t translate to revenue or retention, the team\'s credibility on future numbers takes a hit, and the board may start discounting metrics they were previously happy to accept at face value. I\'d propose leading with a metric further down the funnel that\'s harder to inflate without real value — retained, paying users, or revenue — and offering signup growth as supporting context rather than the headline, protecting both the board\'s ability to make good decisions and the team\'s long-term credibility.',
    },
  },

  {
    id: 'qa85',
    category: 'Metrics',
    difficulty: 'senior',
    isFree: false,
    question: 'You\'re setting up metrics for a brand-new product line with no historical data. How do you decide which metrics should be leading indicators the team watches weekly versus lagging indicators reported quarterly?',
    context: 'The new product line\'s ultimate success metric (annual contract value from enterprise customers) won\'t show meaningful signal for at least two quarters.',
    tags: ['leading-indicators', 'lagging-indicators', 'metrics'],
    answers: {
      analyst: 'Since the ultimate lagging metric (ACV) won\'t show signal for months, I\'d identify leading indicators that are plausible early proxies for eventual success — for a new enterprise product line, that might be sales cycle stage progression, pilot-to-paid conversion rate, or early usage depth among pilot customers. These give the team something actionable to track weekly while waiting for the lagging metric to mature.',
      senior: 'The key requirement for a good leading indicator in a brand-new product line is that it should be validated against the lagging metric as soon as any historical relationship becomes observable — with zero history, any proposed leading indicator is a hypothesis, not a proven proxy, and I\'d flag that explicitly rather than presenting early indicators with the same confidence as an established, validated leading metric. As the first cohort of pilots matures into paid or churned outcomes, I\'d immediately check whether the leading indicators the team was tracking weekly actually predicted the outcome, and be willing to swap them out if they didn\'t.',
      staff: 'For a genuinely new product line, I\'d build in an explicit review checkpoint — say, at the point where the first 10-15 pilot customers have reached a paid/churned outcome — specifically to validate or discard the leading indicators chosen at launch, since teams often keep tracking early proxy metrics out of habit long after enough real data exists to check whether they actually predicted anything. I\'d also resist the pressure to over-commit to weekly leading-indicator targets this early, since holding a team accountable to unvalidated proxy metrics can create the same gaming risk as any metric, just applied to a metric nobody has confirmed is meaningful yet.',
    },
  },

  {
    id: 'qa86',
    category: 'Metrics',
    difficulty: 'staff',
    isFree: false,
    question: 'A support team\'s average response time improved dramatically after being given a hard SLA target, but customer satisfaction scores stayed flat or dropped slightly. What\'s likely happening?',
    context: 'Average first-response time dropped from 4 hours to 45 minutes after the SLA was introduced, but CSAT for resolved tickets didn\'t improve and complaint volume about ticket quality increased slightly.',
    tags: ['goodharts-law', 'metric-gaming', 'metrics'],
    answers: {
      analyst: 'This looks like the team is optimizing for the letter of the metric rather than the underlying goal — a fast first response (even an automated acknowledgment or a low-effort reply that doesn\'t actually resolve anything) satisfies the response-time SLA without necessarily helping the customer, which would explain flat CSAT despite the dramatic response-time improvement. I\'d check the content of first responses before and after the SLA to see if they became more templated or less substantive.',
      senior: 'This is a clean example of Goodhart\'s law — once response time became the target that reps are measured and possibly compensated against, behavior shifted to optimize that specific number, and quality of resolution (which wasn\'t directly measured) became a lower priority by comparison. I\'d add resolution-time and first-contact-resolution-rate as counterbalancing metrics alongside response time, so a rep can\'t improve one at the expense of the other without it showing up somewhere in their scorecard — a single-metric target on a multi-dimensional job almost always creates this kind of unintended tradeoff.',
      staff: 'The deeper lesson is that any target set on a single, narrow, easily-measured proxy for a complex outcome (customer satisfaction) will eventually get gamed, consciously or not, once people\'s day-to-day incentives are tied to hitting that specific number — this isn\'t a reflection of bad faith by the support team, it\'s a predictable consequence of the metric design itself. I\'d redesign the SLA around a small balanced scorecard (response time, resolution time, CSAT, first-contact-resolution) rather than a single number, and specifically communicate to the team that response time was never meant to be optimized in isolation, since undoing an incentive-driven behavior shift takes longer than preventing it with better metric design in the first place.',
    },
  },

  {
    id: 'qa87',
    category: 'Metrics',
    difficulty: 'senior',
    isFree: false,
    question: 'How would you design the core health metrics for a two-sided marketplace (freelancers and clients)? What\'s the risk of optimizing for just one side?',
    context: 'Leadership wants a single "marketplace health" metric to track weekly, similar to how a one-sided product might track DAU.',
    tags: ['marketplace-metrics', 'two-sided-marketplace', 'metrics'],
    answers: {
      analyst: 'A single metric risks hiding an imbalance between supply (freelancers) and demand (clients) — for example, GMV can grow while freelancer supply is actually shrinking relative to client demand, creating a liquidity problem that a single blended metric wouldn\'t surface until it\'s severe enough to show up as slower matching or falling GMV. I\'d propose tracking supply-side and demand-side health separately (active freelancers with capacity, active clients with unfilled job posts) alongside a matching efficiency metric like fill rate or average time-to-match.',
      senior: 'The mechanism that makes marketplace metrics different from single-sided product metrics is that the two sides need each other in the right ratio, not just growing independently — too many freelancers relative to job postings creates freelancer frustration and churn from low earnings, while too many clients relative to freelancer supply creates client frustration from slow or no responses. I\'d track a liquidity ratio (open jobs per available freelancer, or vice versa) as a leading indicator, since it typically predicts matching problems and churn on the constrained side before they show up in a blended GMV or transaction count.',
      staff: 'I\'d push back on leadership\'s request for one weekly number, because a marketplace\'s health genuinely can\'t be captured by a single scalar without hiding exactly the imbalance that\'s most likely to cause future problems — that\'s the core lesson two-sided marketplaces learn repeatedly. I\'d propose a marketplace health dashboard with a small number of paired metrics (supply health, demand health, liquidity/matching efficiency) presented together as the standing weekly view, and reserve a single "north star" number (like completed transactions) only for very high-level, low-frequency reporting where the audience doesn\'t need to diagnose imbalances, making sure that audience also has access to the fuller dashboard if something in the topline number looks off.',
    },
  },

  {
    id: 'qa88',
    category: 'Metrics',
    difficulty: 'analyst',
    isFree: false,
    question: 'A team\'s OKR is "increase revenue by 10%," but revenue is a lagging output that the team doesn\'t directly control week to week. How would you help them set better key results?',
    context: 'The team owns the checkout and payments experience but revenue is influenced by many upstream factors (marketing, pricing, traffic) they don\'t control.',
    tags: ['okrs', 'input-metrics', 'output-metrics', 'metrics'],
    answers: {
      analyst: 'I\'d help the team identify input metrics within their direct control that are known drivers of the revenue objective — for a checkout team, that\'s likely checkout completion rate, payment failure rate, and checkout page load time. These become the key results the team is actually accountable for, while revenue remains the higher-level objective the team\'s work contributes to but isn\'t solely responsible for.',
      senior: 'The key is validating that the chosen input metrics actually have a demonstrated relationship to the revenue objective before locking them in as key results — if checkout completion rate historically correlates strongly with revenue, that\'s a good input metric; if it\'s a plausible-sounding but unvalidated guess, the team could hit their key results perfectly while revenue doesn\'t move, which undermines trust in the OKR process itself. I\'d check this relationship with existing data before finalizing the key results, not just after a quarter of tracking them.',
      staff: 'Being measured on a lagging output the team doesn\'t fully control creates a specific organizational dysfunction: the team either becomes anxious and starts taking credit or blame for factors outside their scope, or worse, starts trying to influence things adjacent to their actual job (like pushing for pricing changes) just to move the number they\'re being judged on. I\'d advocate for the team\'s formal OKR to use the validated input metrics as key results, with revenue tracked as a shared, org-level indicator the team\'s work rolls up into — that keeps the team accountable for what they can actually move while still connecting their work transparently to the business outcome everyone cares about.',
    },
  },

  {
    id: 'qa89',
    category: 'Metrics',
    difficulty: 'analyst',
    isFree: false,
    question: 'You need to change how "active user" is defined (tightening the definition to exclude passive app opens), but the current definition feeds two years of historical trend charts. How do you manage this change?',
    context: 'The new definition will show a lower absolute number and could make it look like the metric dropped even though nothing about user behavior changed — only the definition did.',
    tags: ['metric-definition-change', 'change-management', 'metrics'],
    answers: {
      analyst: 'I\'d never silently swap the definition on an existing trend chart, since that creates a false-looking discontinuity that someone will misinterpret as a real drop later. Instead, I\'d recompute the historical series under the new definition as far back as the underlying event data allows, so the full trend line is apples-to-apples, and clearly label the chart with the new definition and the date it changed.',
      senior: 'I\'d run both definitions in parallel for a transition period (e.g., a full quarter) so stakeholders can see the two side by side and get comfortable with the new number before the old one is retired, and I\'d proactively communicate the change — what\'s different, why, and what the historical numbers look like restated under the new definition — rather than waiting for someone to notice a discontinuity and ask about it. Any dashboard or report currently citing the old definition needs to be identified and updated in the same change, since a partial rollout where some reports use the old definition and others use the new one recreates the exact metric-drift confusion this kind of change is meant to prevent.',
      staff: 'Beyond this specific change, I\'d use it as an opportunity to establish a standing metric-versioning practice — any material change to a widely-used metric definition should go through a documented process (proposal, stakeholder review, parallel-run period, restated historical series, clear changelog) rather than being decided and implemented by whichever team happens to own the pipeline at the time. Metric definitions that quietly drift are one of the most common sources of organizational distrust in data, and a lightweight but consistent versioning process is what prevents this specific, well-managed change from being the exception rather than the norm.',
    },
  },

  {
    id: 'qa90',
    category: 'Metrics',
    difficulty: 'senior',
    isFree: false,
    question: 'Leadership wants a single "customer health score" combining usage, support tickets, NPS, and payment history into one number to predict churn. What are the risks in designing this?',
    context: 'The score would be used by the customer success team to prioritize which accounts to proactively reach out to.',
    tags: ['composite-metrics', 'health-score', 'churn-prediction'],
    answers: {
      analyst: 'A composite score risks obscuring which specific factor is driving a low score — an account with an urgent payment issue and an account with declining usage might both get the same "low health" score, but they need completely different customer success interventions. I\'d make sure the underlying component scores remain visible alongside the composite, not replaced by it, so the CS team can see why an account scored low, not just that it did.',
      senior: 'I\'d also validate that the weighting of each component (usage, tickets, NPS, payment) in the composite actually reflects each component\'s real predictive power for churn, rather than an arbitrary or evenly-split weighting — I\'d run this against historical churned versus retained accounts to see which components most reliably preceded churn, and weight the score accordingly. An untested weighting scheme can produce a score that feels comprehensive but is actually dominated by whichever input happens to have the most variance, regardless of whether that input is the most predictive one.',
      staff: 'A single composite score used to prioritize outreach also creates a specific gaming and complacency risk: once a score becomes the operational trigger for who gets attention, an account manager might learn to move the score (e.g., encouraging any usage at all, regardless of whether it\'s meaningful usage) rather than actually addressing the underlying churn risk, and accounts that score "healthy" might get less proactive attention even if a slow-moving risk isn\'t yet reflected in the current inputs. I\'d pair the composite score with a required, brief human review of the underlying components before any major account action is taken based on it, and I\'d revisit the component weighting periodically against actual churn outcomes rather than treating the initial calibration as permanent.',
    },
  },

  // ─── RCA & Debugging ───────────────────────────────────────────────────────

  {
    id: 'qa11',
    category: 'RCA',
    difficulty: 'analyst',
    isFree: true,
    question: 'Revenue is flat month-over-month but orders are up 12%. What\'s happening?',
    context: 'You\'re a product analyst at an e-commerce company. The CFO flagged the discrepancy in the monthly business review.',
    tags: ['metric-decomposition', 'revenue', 'rca'],
    answers: {
      analyst: 'Revenue = orders × AOV. If orders are up 12% but revenue is flat, AOV dropped by roughly 11%. Decompose AOV: check if the average order size (items per order) changed, if prices changed, or if the discount rate changed. Also check if the category mix shifted toward lower-price products.',
      senior: 'The decomposition is right, but the cause tells you very different things depending on which driver it is. A discount rate increase means the team is buying growth — orders are up but at lower margin. A category mix shift might be natural (seasonal) or indicate that premium products are losing ground. A price reduction might be intentional pricing strategy. Before flagging this as a problem, I\'d check: was this expected? Did the PM team run any promotions or pricing experiments? If yes, this is the intended outcome. If no, it\'s a signal that something structural changed — possibly a new competitor undercutting on price.',
      staff: 'The CFO is really asking: "Is this a problem we need to act on, or is it a feature of our current strategy?" Before answering, I\'d decompose along three dimensions: (1) intentional vs. unintentional — check for active promotions or pricing changes; (2) sustainable vs. temporary — if it\'s mix shift driven by a seasonal category, it will revert; if it\'s discount-driven growth, it compounds; (3) margin impact — flat revenue with higher order volume may actually improve unit economics if fixed costs are being spread over more transactions. The staff move is to bring the full picture to the CFO, not just the decomposition. "Orders up 12%, AOV down 11%, driven by increased basket discounts on a promotional campaign that ran in weeks 2-3. Gross margin was flat. We should decide whether to continue this promotion strategy based on LTV of the customers it acquired, not on the revenue line."',
    },
  },

  {
    id: 'qa12',
    category: 'RCA',
    difficulty: 'senior',
    isFree: false,
    question: 'Conversion rate dropped 8% after a major feature launch. How do you determine if the feature caused it?',
    context: 'A new onboarding flow launched 3 weeks ago. Conversion from sign-up to first purchase dropped from 22% to 20.2%.',
    tags: ['causal-inference', 'feature-impact', 'rca'],
    answers: {
      analyst: 'Check if the drop is correlated with the launch date. Run a before/after analysis. Check if the drop is concentrated in new users (who went through the new onboarding) vs. returning users (who bypassed it). If new user conversion dropped and returning user conversion is stable, the new onboarding is a strong suspect.',
      senior: 'The before/after comparison is confounded by seasonality and other simultaneous changes. Strengthen the causal argument by: (1) checking if any other significant changes happened in the same window — new competitors, pricing changes, traffic source shifts; (2) running a synthetic control using a comparable metric that wasn\'t affected by the onboarding change as a counterfactual; (3) looking at the conversion funnel step-by-step — if the drop is concentrated in one specific step of the new onboarding, that\'s diagnostic; if it\'s spread uniformly, something external is more likely. Also check conversion by acquisition channel — if paid traffic conversion dropped but organic didn\'t, the onboarding might be fine but the paid audience changed.',
      staff: 'This is a causal attribution problem without a clean experiment, which means the answer will never be definitive — it\'ll be probabilistic. The question I\'d ask is: what would it take to be confident enough to act? If confidence = 70%, we can roll back the feature and see if conversion recovers (clean A/B reversal). If confidence = 90%, we might want to iterate on the specific steps causing dropout rather than rolling back entirely. I\'d build the case using convergent evidence: timing correlation, funnel step analysis, user segment breakdown, and qualitative data (session recordings of users who dropped off). Four independent signals pointing to the new onboarding is a stronger argument than any one analysis alone. Present the evidence array to the PM rather than a binary conclusion — let them make the call on rollback vs. iterate.',
    },
  },

  {
    id: 'qa13',
    category: 'RCA',
    difficulty: 'staff',
    isFree: false,
    question: 'Two data sources are giving you different numbers for the same metric. How do you resolve it?',
    context: 'Your Looker dashboard shows 42k DAU. Your data engineering team\'s Snowflake query shows 38k DAU. Same date, same definition.',
    tags: ['data-quality', 'instrumentation', 'discrepancy'],
    answers: {
      analyst: 'Trace each number back to its source: what tables and logic does each use? Look for differences in session definition (30-min idle cutoff vs. 24-hour window), timezone handling, bot filtering, and whether deleted or banned accounts are excluded. The discrepancy usually lives in one of these definitional differences.',
      senior: 'Start by checking the grain — are both systems counting users or sessions? Then check the time window: Looker might be using UTC while the Snowflake query uses PST. Check deduplication logic: if a user signs in on two devices in one day, are they counted once or twice in each system? Also check freshness: Looker might be pulling from a materialized view that\'s 6 hours stale while the Snowflake query is real-time. A 10% discrepancy is large enough that it\'s almost certainly a definitional or pipeline difference, not a sampling issue.',
      staff: 'The discrepancy itself is the second problem. The first problem is that the team didn\'t know these two systems disagreed. In a healthy data environment, metric definitions are canonical, documented, and verified across systems — a 10% gap that nobody noticed means either no one is comparing, or people have learned to quietly pick the number that supports their argument. My response is two-track: (1) resolve this specific discrepancy today, document the root cause and the correct definition; (2) treat this as a signal of broader data health and propose a metric governance audit. Data teams that spend time arguing about whose number is right are teams that aren\'t spending time building. The fix is a single source of truth with clear ownership. Which system should be authoritative, and why? Make that decision explicit rather than leaving it to whoever runs the next meeting.',
    },
  },

  {
    id: 'qa59',
    category: 'RCA',
    difficulty: 'analyst',
    isFree: true,
    question: 'Signups are down 18% versus last month. Someone on the team says "that\'s just seasonality." How do you verify that claim rather than accept it?',
    context: 'The product has some historical seasonal pattern (lower usage around major holidays), and this month includes a holiday period.',
    tags: ['seasonality', 'rca', 'metric-drop'],
    answers: {
      analyst: 'I\'d check the same month-over-month comparison for the prior 2-3 years, if the data exists, to see whether a similar percentage drop happened in the same calendar period historically. If last year\'s equivalent month also dropped by a similar magnitude, seasonality is a credible explanation. If the historical pattern shows a much smaller typical drop, "seasonality" doesn\'t fully explain this year\'s magnitude and there\'s likely something else going on.',
      senior: 'A same-period-last-year comparison is a good first check but can itself be confounded if the business has grown or changed significantly since then (different user base size, different product surface, different holiday calendar overlap). I\'d also compare against a comparable non-seasonal metric internally — if a metric that shouldn\'t be seasonally affected also dropped by a similar amount in the same window, that\'s evidence something broader than seasonality is happening. And I\'d check whether the magnitude, not just the direction, matches the historical seasonal pattern — "signups always dip around this holiday" can be true while "they don\'t usually dip this much" is also true, meaning seasonality explains part but not all of the drop.',
      staff: 'The phrase "that\'s just seasonality" is exactly the kind of explanation that ends the investigation prematurely if unchallenged, because it\'s plausible enough to feel satisfying without necessarily being correct or complete. I\'d insist on quantifying the expected seasonal effect from historical data before accepting it as the explanation — "based on the last 3 years, this holiday period typically shows a 9-11% dip; we\'re seeing 18%, so seasonality likely explains half of this drop and something else explains the rest." That framing keeps the investigation open for the unexplained half rather than letting a comfortable partial explanation close the loop on a real problem.',
    },
  },

  {
    id: 'qa60',
    category: 'RCA',
    difficulty: 'senior',
    isFree: false,
    question: 'Overall conversion rate dropped 5%. How do you figure out which specific user segment is driving it, rather than assuming it\'s uniform?',
    context: 'The product serves multiple user segments across device type, geography, and subscription tier, and the drop shows up in the blended, topline number.',
    tags: ['segment-analysis', 'rca', 'metric-decomposition'],
    answers: {
      analyst: 'I\'d break the topline conversion rate down by the obvious segmentation dimensions — device (iOS/Android/web), geography, acquisition channel, subscription tier — and compare each segment\'s conversion rate this period versus last, looking for which segment(s) show a disproportionate drop relative to their size. A 5% blended drop concentrated in a segment that\'s 15% of traffic implies that segment\'s own conversion rate fell much more steeply than 5%.',
      senior: 'I\'d also weight this analysis by contribution to the blended change, not just by which segment\'s own rate moved the most — a small segment can have a huge percentage drop in its own conversion rate but contribute very little to the topline blended number, while a large segment with a modest percentage drop can be the primary driver simply due to its size. I\'d compute each segment\'s contribution to the topline change (segment size × change in that segment\'s rate) and rank by that, rather than by the raw percentage change within each segment, to avoid chasing a dramatic-looking but low-impact segment.',
      staff: 'Beyond finding which segment moved, I\'d check whether the segment itself changed in composition during this period — for example, if the affected segment is "Android users" and Android\'s overall share of traffic also shifted (perhaps due to a marketing campaign skewing acquisition toward Android), some of the apparent segment-level conversion drop could actually be a further sub-segment mix-shift within Android, not a true within-segment behavioral change. I\'d drill one level deeper into whichever segment carries the most contribution before concluding that\'s "the" cause, since RCA that stops at the first segment boundary it finds often mistakes a mix effect for a causal one.',
    },
  },

  {
    id: 'qa61',
    category: 'RCA',
    difficulty: 'senior',
    isFree: false,
    question: 'You find that weeks with more customer support tickets also have lower conversion rates. A colleague concludes support quality is hurting conversion. What\'s your response?',
    context: 'The correlation is consistent across 6 months of weekly data, but no experiment has been run.',
    tags: ['correlation-vs-causation', 'rca', 'spurious-correlation'],
    answers: {
      analyst: 'I\'d flag that this correlation is consistent with several different causal stories, not just "support quality causes conversion drops." It\'s equally plausible that both are driven by a third factor — for example, weeks with a product bug or outage would plausibly cause both more support tickets (people reporting the bug) and lower conversion (the bug itself blocking purchases), with no causal link between tickets and conversion directly.',
      senior: 'I\'d test this by looking at the content of the support tickets during high-ticket weeks — if tickets during those weeks are dominated by a specific issue (payment failures, a broken feature), that\'s evidence for a shared root cause rather than support-ticket-volume itself affecting conversion. I\'d also check the timing more precisely: does ticket volume rise before, during, or after the conversion dip? If tickets spike a day after conversion already started dropping, tickets are likely a downstream symptom of the same underlying problem, not a cause of the conversion issue.',
      staff: 'The instinct to jump to a causal story here is understandable but risky, because acting on it (e.g., investing in faster support response times to "fix" conversion) would address a symptom while leaving the actual root cause — whatever\'s driving both tickets and conversion down — completely unaddressed. I\'d push the team to identify the specific underlying incidents behind the highest-ticket weeks before drawing any causal conclusion, and I\'d propose that going forward, any "X correlates with Y" finding on the metrics dashboard gets a required root-cause pass before it\'s translated into a resourcing recommendation, precisely because plausible-sounding correlations get acted on faster than they get verified.',
    },
  },

  {
    id: 'qa62',
    category: 'RCA',
    difficulty: 'senior',
    isFree: false,
    question: 'Two things changed in the same week: a pricing change went live, and a competitor launched a similar product. Signups dropped 10%. How do you separate the two effects?',
    context: 'Both events happened within 48 hours of each other, making it hard to attribute the drop to either individually from the aggregate trend alone.',
    tags: ['multi-cause-rca', 'causal-disentanglement', 'pricing'],
    answers: {
      analyst: 'I\'d look for a dimension where only one of the two causes would plausibly apply, to disentangle them. If the pricing change only affects a specific tier or region, and the competitor\'s launch is geographically limited too, comparing conversion in a region affected by one but not the other gives a cleaner read on each cause\'s individual contribution.',
      senior: 'If the pricing change was rolled out via a phased or geographically staggered launch (common for pricing changes to de-risk them), that staggering is a natural quasi-experiment — compare the drop timing and magnitude in regions where pricing already changed against regions where it hasn\'t yet, holding competitor exposure roughly constant across regions. If the competitor launch is more localized (a specific market), the reverse comparison works too: compare conversion in markets with competitor exposure against otherwise-similar markets without it, holding pricing constant. Whichever asymmetry exists in either rollout is the lever for disentangling the two.',
      staff: 'If neither rollout offers a clean natural experiment (both are simultaneous and global), full disentanglement from observational data alone may not be possible with confidence, and I\'d be honest about that limitation rather than forcing a false precision — the responsible answer might be "we can\'t cleanly separate these two effects from this data; here\'s our best-guess split based on partial evidence, and here\'s what we\'d need to know more." I\'d propose a follow-up: if pricing is reversible, consider a short-term pricing rollback in a subset of markets to isolate its effect going forward, since that gives cleaner causal evidence than continuing to speculate on the historical, confounded week.',
    },
  },

  {
    id: 'qa63',
    category: 'RCA',
    difficulty: 'staff',
    isFree: false,
    question: 'A key metric dropped and you need to explain it, but you discover the event needed to diagnose the likely cause was never tracked. How do you proceed?',
    context: 'Checkout completion rate dropped 6%. Your hypothesis is that a specific payment method\'s failure rate increased, but payment-method-level success/failure isn\'t broken out in your event data — only an aggregate "payment_failed" event exists.',
    tags: ['rca', 'incomplete-instrumentation', 'causal-inference'],
    answers: {
      analyst: 'I\'d look for any indirect proxy data that could substitute for the missing breakdown — payment processor logs, error message text captured in support tickets, or a related table that happens to log payment method even if it wasn\'t designed for this analysis. If a proxy exists, I\'d use it while being explicit that it\'s an approximation, not the precise breakdown I\'d ideally want.',
      senior: 'If no usable proxy exists at all, I\'d scope what can still be concluded with the data available — for instance, the aggregate payment_failed event combined with overall checkout volume by device or region might still narrow the hypothesis space even without payment-method granularity, if the failure is concentrated in a specific device or geography that correlates with a specific payment method\'s usage pattern. I\'d present this as a bounded conclusion: "we can\'t confirm which payment method specifically, but the pattern is consistent with a payment-method-specific issue concentrated in mobile web, which narrows the candidates."',
      staff: 'The immediate priority is to instrument the missing breakdown going forward so this gap doesn\'t recur — a payment_method property on the failure event is a small addition that would have made this RCA conclusive instead of speculative. In the meantime, I\'d be transparent with stakeholders about the confidence level of the current explanation rather than presenting a best-guess as a confirmed root cause, since a wrong confident answer that leads to fixing the wrong payment integration is worse than an honest "we have a leading hypothesis, not a confirmed cause, and here\'s what we\'re adding to instrumentation to close this gap for next time." I\'d also use this incident to argue for a standing instrumentation review on any metric with material business impact — checkout, in particular, warrants more complete tracking than it currently has.',
    },
  },

  {
    id: 'qa64',
    category: 'RCA',
    difficulty: 'analyst',
    isFree: false,
    question: 'A metric appears to drop 12% overnight with no product change and no known external cause. What\'s an often-overlooked explanation you\'d check early?',
    context: 'The drop is on an "active users" metric that\'s computed via a scheduled query maintained by the data engineering team.',
    tags: ['rca', 'reporting-change', 'data-pipeline'],
    answers: {
      analyst: 'Before looking for a product or user-behavior cause, I\'d check whether the metric\'s own definition or underlying query changed — a data engineering team refactor, a schema migration, or a silent change to a filter (e.g., excluding a previously-included user type) can produce a step-change that looks exactly like a real drop but is purely a reporting artifact. I\'d check the query\'s version history or recent commits to the pipeline code covering the metric.',
      senior: 'I\'d also check for a change in an upstream dependency the metric relies on but that the team maintaining the metric didn\'t directly change — a third-party library update, a schema change in a source table owned by a different team, or a change in how a user status field gets set. These "silent upstream change" cases are common because the team investigating the drop is often not the team that made the causal change, so nobody connects the two without deliberately checking recent changes across the whole pipeline, not just the immediate metric\'s own code.',
      staff: 'A reporting-artifact explanation is attractive because it\'s usually good news (nothing is actually wrong), which means it deserves slightly more scrutiny before being accepted, not less — I\'d want to see the actual diff in the query or schema that explains the exact magnitude of the drop, not just confirm that some change happened around the same time. If a schema change explains only part of the 12% drop, there could be a real, coincidental behavioral issue underneath a reporting artifact, and stopping the investigation the moment a plausible pipeline explanation is found risks missing a second, real problem hiding behind it.',
    },
  },

  {
    id: 'qa65',
    category: 'RCA',
    difficulty: 'senior',
    isFree: false,
    question: 'Checkout conversion dropped 4% starting exactly at a specific hour. Engineering says no feature changes deployed. What do you check?',
    context: 'The timing is precise enough to suggest a technical cause. You have access to application performance monitoring alongside product analytics.',
    tags: ['performance-regression', 'rca', 'latency'],
    answers: {
      analyst: 'A precise, sudden onset at a specific hour with no feature deploy points strongly toward an infrastructure or performance issue rather than a product or behavioral cause — I\'d check page load time and API latency for the checkout flow around that exact timestamp, since a spike in latency (even without an outage) is a well-documented cause of conversion drops as users abandon slow-loading pages.',
      senior: 'I\'d cross-reference the exact timestamp against any infrastructure-level change that wouldn\'t show up in a feature deploy log — a database migration, an infrastructure scaling event, a third-party payment processor\'s own incident, a CDN configuration change, or a certificate rotation. "No feature changes deployed" only rules out application-code deploys; it doesn\'t rule out infrastructure, third-party, or configuration changes, which engineering teams sometimes don\'t think to check when asked about "changes" unless specifically prompted to look beyond code deploys.',
      staff: 'I\'d push for a shared incident timeline that pulls from every system with a timestamp — deploys, infra changes, third-party status pages, DNS/CDN changes, and the conversion drop itself — because the precise-onset signature here is exactly the pattern that separates a technical cause from a behavioral one, and the investigation should be led with that hypothesis rather than defaulting to product or marketing explanations first. I\'d also use this as a case for a standing practice: whenever a metric shows a step-change at a precise timestamp, check infrastructure and third-party dependencies before assuming a product or user-behavior cause, since the "no feature deploy" answer is a common false all-clear that stops the investigation from looking in the right place.',
    },
  },

  {
    id: 'qa66',
    category: 'RCA',
    difficulty: 'staff',
    isFree: false,
    question: 'Leadership wants a root cause and a fix committed in an all-hands in two hours, but your investigation isn\'t conclusive yet. How do you handle it?',
    context: 'A major metric dropped sharply this morning. You have two competing hypotheses, neither fully confirmed, and the all-hands is in two hours.',
    tags: ['rca', 'stakeholder-communication', 'incident-response'],
    answers: {
      analyst: 'I\'d share what\'s confirmed versus what\'s still hypothesis at this point, rather than presenting a guess as a conclusion under time pressure. I\'d say clearly: "here\'s what we know for certain, here are our two leading hypotheses and what would confirm or rule out each, and here\'s when we expect to have a confirmed answer" — that\'s more useful and more honest than committing to a fix for a cause we haven\'t verified.',
      senior: 'I\'d also prioritize whichever of the two hypotheses is faster to confirm or rule out and spend the two hours on that, rather than trying to make equal progress on both — a fast, decisive test on the more likely hypothesis (even if it doesn\'t fully close the investigation) gives leadership something concrete to react to, versus a diffuse update on two half-investigated theories. If one hypothesis can be tested by, say, checking whether the drop is isolated to one platform in the next 20 minutes, that\'s worth doing before the meeting even if it doesn\'t fully resolve things.',
      staff: 'The core tension is that committing to an unconfirmed root cause and fix under pressure to look decisive creates a much worse outcome later if it\'s wrong — resources get allocated to the wrong fix, the real cause continues unaddressed, and the team\'s credibility takes a bigger hit than if they\'d said "not confirmed yet" in the first place. I\'d go into the all-hands with a structured update: confirmed facts, ranked hypotheses with supporting and against evidence, the specific next step and timeline to confirm, and an immediate mitigating action if one exists (e.g., a rollback of the most recent suspect change) that doesn\'t require full root-cause confirmation to be safely reversible. That gives leadership a real decision to make — approve the safe mitigating action now — without forcing a false confirmation on the underlying cause.',
    },
  },

  // ─── Product Sense ──────────────────────────────────────────────────────────

  {
    id: 'qa14',
    category: 'Product Sense',
    difficulty: 'analyst',
    isFree: true,
    question: 'How would you measure the success of a search feature redesign?',
    context: 'The design team shipped a new search experience 4 weeks ago. Your PM asks: "Is it working?"',
    tags: ['metrics', 'search', 'product-success'],
    answers: {
      analyst: 'Define success across three dimensions: findability (did users find what they were looking for — measure click rate, query refinement rate, zero-result rate), conversion (did finding lead to action — measure purchase/signup rate from search sessions), and satisfaction (are users using search more — measure search adoption rate among active users).',
      senior: 'The metric architecture needs to capture the search value chain: Trigger (did the user try search?) → Find (did search return relevant results?) → Act (did they do something after?) → Return (did search help enough that they\'re back?). Trigger rate tells you if discovery is improving. Zero-result rate and reformulation rate tell you about result quality. Click-through rate on position 1 vs. overall tells you about ranking quality. I\'d also check the null hypothesis: are users who use search more likely to convert than users who don\'t? If yes, improving search quality should compound. If no, the feature is table stakes, not a growth lever.',
      staff: 'Before measuring success, I\'d challenge whether "is it working?" is the right question. It\'s been 4 weeks — enough time to see surface metrics but not enough to see behavioral change. The better question is: "what would make us confident this was worth the investment, and what would make us decide to iterate?" Establish a measurement plan with 3 time horizons: 4 weeks (leading indicators — query success rate, reformulation rate), 12 weeks (behavioral metrics — search adoption, conversion from search), 6 months (business impact — does increased search usage predict LTV?). Then separate the measurement question from the investment question: even if this redesign is a marginal improvement, is search the highest-ROI area to invest in, or should we be focused elsewhere? The PM needs that frame, not just "is it working."',
    },
  },

  {
    id: 'qa15',
    category: 'Product Sense',
    difficulty: 'senior',
    isFree: false,
    question: 'How would you prioritize a backlog of 15 features with limited engineering capacity?',
    context: 'You\'re presenting a prioritization framework to a PM. The team has 3 engineers for one sprint.',
    tags: ['prioritization', 'rice', 'frameworks'],
    answers: {
      analyst: 'Apply RICE: Reach (how many users affected), Impact (how much does it move the north star), Confidence (how certain are we of the estimate), Effort (engineering cost). Score each feature and rank. Flag any features with low confidence scores — those need more discovery before committing engineering capacity.',
      senior: 'RICE is a starting point, not a final answer. Two adjustments I\'d make: (1) weight confidence as a multiplier, not an additive factor — a high-impact idea with 20% confidence should be treated very differently from one with 80% confidence; (2) add a strategic alignment filter before scoring — some features are high-RICE but don\'t move the company\'s current strategic bet, and spending capacity there is a distraction. Also flag which features are blocking other work: a low-RICE infrastructure item that unblocks 5 high-RICE features later has compounding value RICE doesn\'t capture.',
      staff: 'Prioritization frameworks are useful for creating a common language, but they\'re proxies for a conversation that needs to happen explicitly: what are we optimizing for right now? RICE treats all types of impact as comparable — a feature that adds 5% to conversion is comparable to one that opens a new market segment. They\'re not. I\'d push the PM to answer two questions before scoring anything: (1) What is the one thing this sprint needs to accomplish for the quarter to be considered a success? (2) Is there anything on this backlog that must ship regardless of RICE score — regulatory requirements, promises to enterprise customers, tech debt that\'s causing incidents? Filter on those first, then use RICE to rank the remaining discretionary items. The framework serves the strategy — the strategy doesn\'t emerge from the framework.',
    },
  },

  {
    id: 'qa16',
    category: 'Product Sense',
    difficulty: 'staff',
    isFree: false,
    question: 'A PM wants to launch a feature globally in one shot. What concerns would you raise?',
    context: 'The feature is a redesigned home feed. The PM argues that A/B testing will slow them down and they want to ship to 100% of users globally.',
    tags: ['rollout-strategy', 'risk-management', 'product-judgment'],
    answers: {
      analyst: 'Flag the risk of a bad launch with no rollback path. Recommend a staged rollout: 1% → 5% → 25% → 100%, with defined monitoring metrics and kill criteria at each stage. A 15-minute incident on a global feed redesign is much worse than a 15-minute incident on 1% of users.',
      senior: 'The PM\'s argument is partly right — A/B testing a home feed redesign is operationally complex if you can\'t run both feed versions simultaneously at scale. But there\'s a middle path: sequential rollout with a holdout group. Roll to 5% of users while keeping 5% on the old version. Compare outcomes between the 5% treatment and 5% holdout for 2 weeks. This gives you a lightweight experiment without a full A/B infrastructure and without the risk of global launch. I\'d also ask: what does monitoring look like? Shipping to 100% of users globally and then monitoring isn\'t a strategy — it\'s a prayer. Define the kill metric and the kill threshold before shipping, and have an engineer on-call who can revert in under 15 minutes.',
      staff: 'The real question is what \'global in one shot\' means for the company\'s ability to respond when something goes wrong — and something always goes wrong. A feed redesign on a global product affects content creator behavior, not just consumer behavior. If creators in certain markets react negatively and reduce posting volume, that\'s a second-order effect that shows up 2-3 weeks after launch. A global launch eliminates your ability to observe that before it\'s a real problem. I\'d reframe the conversation: "I\'m not asking you to A/B test — I\'m asking you to give yourself an escape hatch. What\'s the rollback plan if D7 retention drops 5% in the first market we launch?" If the answer is "we\'ll iterate," that\'s not a plan — that\'s accepting avoidable risk. A 2-week sequential rollout costs almost nothing in engineering terms and eliminates the tail risk of a global rollback.',
    },
  },

  {
    id: 'qa67',
    category: 'Product Sense',
    difficulty: 'analyst',
    isFree: true,
    question: 'The team is building an AI-powered "smart suggestions" feature for a note-taking app, but there\'s no clear precedent for what success looks like. How do you define success metrics?',
    context: 'The feature surfaces AI-generated suggestions while a user types. Leadership just wants to know "if it\'s working" after launch.',
    tags: ['success-metrics', 'ambiguous-feature', 'product-sense'],
    answers: {
      analyst: 'I\'d start with adoption and immediate interaction metrics since they\'re measurable from day one: suggestion impression rate, acceptance rate (how often a suggestion is used versus dismissed), and opt-out rate (users disabling the feature entirely). These won\'t tell the whole story but give an early read on whether the feature is being used at all and whether users find the suggestions useful in the moment.',
      senior: 'The harder part is connecting those interaction metrics to something that actually matters — a high acceptance rate could mean the suggestions are genuinely helpful, or it could mean they\'re just low-friction filler text that users accept without much thought, which wouldn\'t be a real signal of value. I\'d add a downstream quality proxy: do notes that used suggestions get revisited, shared, or built upon more than notes that didn\'t, and does using suggestions correlate with the user coming back to write more notes in general. Those get closer to "is this actually improving the product experience" than raw acceptance rate alone.',
      staff: 'Because there\'s no precedent, I\'d resist the pressure to declare a single "is it working" verdict at 30 days and instead frame this as a staged measurement plan: short-term (adoption and interaction quality, available immediately), medium-term (does suggestion usage predict retention or increased note-taking frequency, needs 8-12 weeks), and long-term (does the feature change the product\'s core value proposition enough to affect willingness to pay or word-of-mouth, needs a couple of quarters). I\'d also flag a real risk specific to AI suggestion features — measuring only acceptance rate can reward suggestions that are technically accepted but low-value, so I\'d pair the quantitative metrics with periodic qualitative review of a sample of actual suggestions and outcomes, since novel feature categories often need a human sanity check that a metrics dashboard alone won\'t catch.',
    },
  },

  {
    id: 'qa68',
    category: 'Product Sense',
    difficulty: 'senior',
    isFree: false,
    question: 'The team wants to launch a free tier of a currently paid-only product. How would you assess the cannibalization risk before launch?',
    context: 'Current paid conversion rate from trial is 18%. Leadership is excited about the top-of-funnel growth a free tier could bring but hasn\'t quantified downside risk to existing paid conversion.',
    tags: ['cannibalization', 'pricing', 'product-strategy'],
    answers: {
      analyst: 'I\'d estimate cannibalization by segmenting current trial users by how much of their usage would be fully served by the proposed free tier\'s feature set — if a large share of trial users only ever use features that would remain free, some of today\'s 18% paid conversions would likely become free-tier users instead of paid customers, directly cannibalizing existing revenue. I\'d quantify that overlap before modeling the new top-of-funnel growth as pure upside.',
      senior: 'Beyond feature overlap, I\'d look at willingness-to-pay signals within the existing user base — survey or behavioral proxies for how many current paying customers are paying primarily for features that would become free, versus features that would remain gated. I\'d also model this as a portfolio, not just a substitution: even with real cannibalization, a free tier can still be net-positive if it expands the addressable market enough (word-of-mouth, viral usage, larger eventual paid conversion pool) to outweigh the lost conversions, but that requires an honest, quantified tradeoff rather than assuming growth and retention both improve with no downside.',
      staff: 'I\'d propose testing this with a limited rollout rather than committing to a full launch on a model built from assumptions — release the free tier to a subset of new signups only (leaving existing trial-to-paid flow untouched) and measure both new-tier adoption and, critically, whether trial-to-paid conversion among comparable new cohorts drops relative to a holdout still on the current trial-only model. That isolates the actual cannibalization rate empirically rather than relying on a pre-launch model, and gives leadership a real number — "net effect on paid revenue was +X% after accounting for Y% cannibalization" — before locking in a decision that\'s expensive to reverse once existing customers are used to a free option existing.',
    },
  },

  {
    id: 'qa69',
    category: 'Product Sense',
    difficulty: 'senior',
    isFree: false,
    question: 'A prototype feature tested with 50 users shows strong qualitative enthusiasm but the usage data is thin and noisy given the small sample. Do you recommend building it out fully?',
    context: '8 of 50 pilot users used the feature multiple times and gave very positive feedback; the other 42 barely touched it. The team is split on whether this is a strong signal or a false positive.',
    tags: ['build-vs-not-build', 'early-signal', 'product-judgment'],
    answers: {
      analyst: '50 users is too small a sample to draw a statistically confident usage conclusion, so I\'d weight the qualitative signal from the engaged 8 more heavily while being honest that we don\'t know if they\'re representative of the broader user base or an unusually well-matched niche. I\'d want to understand what\'s different about those 8 users before deciding — if they share a specific use case or role, that tells you whether this is a broad opportunity or a narrow one.',
      senior: 'I\'d dig into whether the 42 non-engaged users didn\'t find the feature valuable, or simply didn\'t discover it or understand how to use it — those are very different problems with very different implications. If it\'s a discoverability problem, the underlying value proposition might be sound and worth a bigger investment with better onboarding; if it\'s genuine lack of interest even among users who tried it, the strong signal from 8 users might just reflect a narrow niche that doesn\'t justify full build-out. I\'d run a lightweight follow-up — a short survey or a few interviews with the 42 non-engaged users — before committing engineering resources based on the vocal minority alone.',
      staff: 'The decision I\'d push for isn\'t "build it fully" or "kill it" but a cheap next-step experiment that resolves the actual uncertainty — expand the pilot to a larger, more representative sample (a few hundred users across different segments) with improved onboarding to rule out the discoverability explanation, before committing to full build-out. The risk of overreacting to 8 enthusiastic users is building a feature for a niche that doesn\'t scale; the risk of dismissing the signal because the sample is small and noisy is missing an early sign of something the majority of users haven\'t discovered yet. A staged bet — cheap follow-up experiment, then a go/no-go on full build — manages both risks better than a binary call from 50 users.',
    },
  },

  {
    id: 'qa70',
    category: 'Product Sense',
    difficulty: 'analyst',
    isFree: false,
    question: 'The team can hit this quarter\'s engagement target by adding more push notifications, but you suspect it will hurt long-term retention. How do you handle this tradeoff?',
    context: 'Notification-driven opens would boost the quarterly DAU number the team is measured on, but historical data suggests notification fatigue increases unsubscribe and uninstall rates over time.',
    tags: ['short-term-vs-long-term', 'engagement-metrics', 'product-health'],
    answers: {
      analyst: 'I\'d bring the historical relationship between notification volume and longer-term unsubscribe/uninstall rates into the conversation before the team commits to the notification increase, since hitting this quarter\'s number at the cost of a worse long-term trend isn\'t actually a win for the business, even if it looks good on this quarter\'s scorecard.',
      senior: 'I\'d propose adding a guardrail metric alongside the quarterly DAU target specifically to catch this tradeoff — notification opt-out rate and 90-day retention for cohorts exposed to the higher notification volume — so if the team does increase notifications, there\'s a built-in mechanism that surfaces the downside before it fully plays out, rather than the team only finding out next year when retention has already degraded. I\'d frame the choice for the team as: "we can hit the target this way, but here\'s the historical cost, and here\'s how we\'d know within 60 days if we\'re paying it."',
      staff: 'This is really a signal that the team\'s quarterly target itself is measuring the wrong thing if it can be gamed this cheaply — a well-designed metric shouldn\'t have such an easy, known-harmful way to hit it. I\'d raise this with whoever owns the target-setting process as a structural issue, not just flag the individual tradeoff this quarter: DAU alone rewards any activity that gets someone to open the app, regardless of whether that activity is healthy, and pairing it with a mandatory retention or satisfaction guardrail in future target-setting would prevent this exact tradeoff from recurring every quarter with a different tactic.',
    },
  },

  {
    id: 'qa71',
    category: 'Product Sense',
    difficulty: 'senior',
    isFree: false,
    question: 'Leadership wants to know if it\'s worth building a new B2B tier for a product that\'s currently consumer-only, but you have no data on how many current users are actually business users. How do you size the opportunity?',
    context: 'The product doesn\'t currently distinguish personal from business use in its signup or usage data.',
    tags: ['opportunity-sizing', 'ambiguous-problem', 'incomplete-data'],
    answers: {
      analyst: 'I\'d start with proxies available in existing data — email domain (corporate domains vs. common consumer email providers), usage patterns that suggest business use (multiple team members with the same domain, usage during business hours on weekdays, account names suggesting a company), and use those to build a rough estimate of what share of the current user base looks business-like. It won\'t be precise, but it gives a directional read before any new instrumentation is built.',
      senior: 'I\'d complement the proxy-based estimate with a lightweight survey to a sample of current active users asking directly how they use the product (personal vs. work, and if work, what they\'d want from a business-specific tier), which validates or corrects the proxy-based estimate and adds qualitative color on what a B2B tier would actually need to include. I\'d present the opportunity size as a range with the proxy method as a lower/upper bound check against the survey-based estimate, rather than a single point number, given how uncertain the underlying data is.',
      staff: 'Given the stakes of a new product tier decision, I\'d resist giving leadership a single confident number built on proxies alone, and instead frame the recommendation around what a small, cheap test can tell us before a full investment: a landing page or waitlist for a hypothetical B2B tier, promoted lightly to see actual signup interest, is a far more reliable signal than any proxy-based sizing from existing consumer data, since it measures real intent rather than inferring it from indirect signals. I\'d present both the proxy-based directional estimate (to unblock the initial go/no-go conversation) and a recommended next step (a low-cost interest test) rather than pretending the incomplete data supports a precise investment-sizing number today.',
    },
  },

  {
    id: 'qa72',
    category: 'Product Sense',
    difficulty: 'analyst',
    isFree: false,
    question: 'A feature has very low usage (2% of MAU touch it monthly) but a small, vocal group of users would be upset if it were removed. How do you decide whether to sunset it?',
    context: 'The feature costs meaningful engineering maintenance time each quarter and blocks some infrastructure simplification work.',
    tags: ['feature-sunset', 'product-judgment', 'maintenance-cost'],
    answers: {
      analyst: 'Low usage alone isn\'t sufficient reason to sunset — I\'d first check whether that 2% is disproportionately valuable (e.g., enterprise customers or a segment with outsized LTV) before treating it as low-priority. If the usage is genuinely broad-based and low-value, I\'d weigh the maintenance cost being freed up against the cost of upsetting the vocal minority, including checking whether those vocal users are also high-value customers who might churn.',
      senior: 'I\'d quantify both sides more precisely: what\'s the actual engineering hours per quarter spent maintaining this feature, and separately, what\'s the LTV and churn risk specifically of the 2% who use it, not the vocal complainers necessarily but the actual regular users. Vocal complaints on social media or support tickets don\'t always correlate with revenue-relevant churn risk — some of the loudest complaints come from free-tier or low-value users, while quiet high-value users might just silently churn without complaining publicly at all. I\'d pull usage data cross-referenced with subscription tier and tenure before deciding.',
      staff: 'If the feature is genuinely low-value except to a specific identifiable segment (e.g., a subset of long-tenured or high-value accounts), I\'d consider a middle path rather than a binary sunset-or-keep decision: deprecate it from the general product but offer a migration path or a legacy-supported mode specifically for that segment, which frees the majority of the maintenance burden and infrastructure blocker while managing the churn risk for the users who\'d actually leave over it. I\'d also use this as a moment to set an explicit policy for future features — a defined usage and maintenance-cost threshold below which a feature is automatically flagged for sunset review — so this decision doesn\'t have to be re-litigated informally for every low-usage feature going forward.',
    },
  },

  {
    id: 'qa73',
    category: 'Product Sense',
    difficulty: 'staff',
    isFree: false,
    question: 'Data shows that personalizing the home feed algorithm per-user would improve engagement, but some users complain the product feels inconsistent and unpredictable compared to before. How do you weigh this?',
    context: 'A/B testing shows personalized ranking increases session time by 6%, but qualitative feedback and support tickets show a subset of users frustrated that content they expect to find isn\'t where they left it.',
    tags: ['personalization', 'consistency', 'trust', 'product-tradeoffs'],
    answers: {
      analyst: 'I\'d separate the quantitative engagement win from the qualitative trust concern and look at whether the frustration is showing up in the actual retention or satisfaction metrics, not just anecdotal complaints — if D30 retention or NPS for treatment users is stable or better despite the complaints, the complaints might be a vocal minority\'s adjustment friction rather than a sign of real harm. If retention or satisfaction scores are trending down for treatment users despite the session-time win, that\'s a more serious signal that the engagement metric is masking a real cost.',
      senior: 'I\'d look specifically at which user segment is complaining — often it\'s power users or long-tenured users who\'ve built mental models and habits around a predictable layout, while newer users have no such expectation and may benefit purely from the personalization. If that\'s the pattern, a blanket rollout optimizes for average engagement while degrading trust specifically among your most loyal, highest-LTV segment, which the average session-time metric wouldn\'t surface at all since it\'s diluted across the whole population. I\'d re-run the analysis segmented by tenure before treating the aggregate 6% lift as unambiguously good.',
      staff: 'This is a case where the engagement metric and the actual health of the product relationship are pulling in different directions, and optimizing purely on the metric that\'s easiest to measure (session time) risks eroding something harder to measure but very real — user trust that the product behaves predictably. I\'d propose a hybrid design rather than a binary choice: personalize within a stable, predictable structure (e.g., keep certain sections in fixed positions that users have learned to rely on, personalize the content within them) so the product captures much of the engagement upside without breaking the mental model that builds long-term trust, and I\'d validate that hybrid specifically against the loyal-user segment\'s satisfaction, not just the average session-time lift.',
    },
  },

  {
    id: 'qa74',
    category: 'Product Sense',
    difficulty: 'senior',
    isFree: false,
    question: 'Your largest enterprise customer is asking for a specific feature and threatening to churn without it. How do you decide whether to build it for everyone, build it just for them, or push back?',
    context: 'The feature request is fairly specific to how this one customer\'s team operates. No other customer has made a similar request in the past year.',
    tags: ['prioritization', 'enterprise-customer', 'product-judgment'],
    answers: {
      analyst: 'I\'d first assess how specific the request really is to this one customer\'s workflow versus how broadly applicable it might be if framed differently — sometimes a customer\'s specific ask is really a narrow instance of a more general, underserved need. I\'d talk to a few other enterprise accounts to see if a reframed version of the request resonates before assuming it\'s genuinely a one-customer problem.',
      senior: 'I\'d weigh the revenue and strategic importance of this specific account against the cost of building and maintaining a bespoke feature versus a more generalizable one — a one-off feature built for a single customer creates ongoing maintenance burden and can set a precedent that other large accounts expect similarly bespoke treatment. If the account is important enough to retain regardless, I\'d look for the narrowest version of the request that solves their actual underlying problem without over-committing to a fully custom build, and I\'d document clearly to the account team that this is being built for this specific relationship, not as a general roadmap commitment, to manage precedent expectations.',
      staff: 'The real risk in either direction is treating this as a purely reactive, single-account decision — building it purely to prevent this churn risk without checking if it\'s strategically the right feature invites a pattern where the loudest, most threatening customer sets the roadmap rather than genuine product strategy, while refusing it outright risks losing a customer over something that might genuinely reveal an underserved need in the broader enterprise segment. I\'d bring this to a structured, cross-functional review (sales, product, and the account team) with the underlying need clearly separated from the specific implementation this one customer asked for, and make the build-or-not decision based on whether the underlying need generalizes to a meaningful segment of enterprise customers we want to grow with — using this account\'s threat as an urgency signal, not as the deciding factor itself.',
    },
  },

  // ─── Statistics ────────────────────────────────────────────────────────────

  {
    id: 'qa17',
    category: 'Statistics',
    difficulty: 'analyst',
    isFree: true,
    question: 'What\'s the difference between statistical significance and practical significance?',
    context: 'A PM asks you to explain why your A/B test result "doesn\'t really matter" even though it\'s statistically significant.',
    tags: ['statistical-significance', 'effect-size', 'practical-significance'],
    answers: {
      analyst: 'Statistical significance tells you the effect is real (unlikely to be noise). Practical significance tells you the effect is large enough to matter. With a large enough sample size, even a 0.01% lift will be statistically significant — but it\'s not worth shipping for. Always report both the p-value and the effect size, and check if the effect size exceeds your minimum meaningful threshold.',
      senior: 'The distinction gets subtle when the CI is wide. A result of p=0.02, CI [+0.05%, +4.5%] is statistically significant but the practical significance depends entirely on which end of the CI reflects reality — +0.05% is trivial, +4.5% is meaningful. This is why I always frame results in business terms: "If this effect is real, it translates to $X in annual revenue. Is $X worth the maintenance cost of this feature?" That converts a statistical question into a business decision, which is what the PM actually needs to make.',
      staff: 'The deeper issue is that "statistical significance" has become a binary gate that distorts decision-making. A result doesn\'t become worth shipping the moment it crosses p=0.05 — the cost-benefit calculation is continuous, not binary. The right frame is: given what we now know about the distribution of possible outcomes (the CI), and given what we know about the costs and benefits of different outcomes, what\'s the expected value of shipping vs. not shipping? That\'s a Bayesian framing and it\'s more honest than the frequentist p-value threshold. I\'d push teams toward this language: "We have moderate evidence of a positive effect. The plausible range of outcomes is X to Y. Given that range, here\'s the expected value calculation." That\'s a useful contribution to a decision. "p < 0.05" is not.',
    },
  },

  {
    id: 'qa18',
    category: 'Statistics',
    difficulty: 'senior',
    isFree: false,
    question: 'You ran an experiment for 3 days and saw a large positive effect. The PM wants to stop early. What do you advise?',
    context: 'The experiment was planned to run for 14 days. On day 3, primary metric is up 8% with p=0.01.',
    tags: ['peeking', 'sequential-testing', 'experiment-runtime'],
    answers: {
      analyst: 'Advise against stopping early. The day 3 result likely reflects a novelty effect — new users exploring a new feature tend to engage more initially. The effect will often decay by week 2. Stopping early also inflates Type I error rate if you didn\'t pre-commit to a sequential testing approach.',
      senior: 'Three specific problems with stopping at day 3: (1) novelty effect — engagement typically spikes in the first few days of any change; (2) sample heterogeneity — day 3 captures only early-week users; you haven\'t seen weekend behavior; (3) peeking inflation — by looking at p=0.01 after 3 days of a 14-day experiment, you\'ve implicitly done multiple comparisons, raising your actual false positive rate above 5%. If the PM genuinely needs a faster answer, the right approach is to have pre-planned a 3-day analysis using a sequential testing framework (like mSPRT or group sequential methods) that adjusts alpha to account for early stopping. Retrospectively applying sequential testing logic to a fixed-horizon experiment doesn\'t work.',
      staff: 'The 8% effect after 3 days should actually make you more skeptical, not more confident. Real product effects in established products rarely produce 8% lifts — something that large early is almost always novelty or a quality issue in the randomization. I\'d look at the assignment logs to confirm there\'s no imbalance, check D1 vs D2 vs D3 effect size to see if it\'s decaying already, and ask the PM: "If I told you this is probably a novelty effect that decays to 2% by week 2, would you still want to ship?" The PM\'s desire to stop early is often a sign of pressure to show results. The analyst\'s job is to give an accurate picture of the evidence, not to confirm optimism. A 14-day runtime was agreed for a reason — changing it mid-experiment requires justification, not just a positive early read.',
    },
  },

  {
    id: 'qa19',
    category: 'Statistics',
    difficulty: 'senior',
    isFree: false,
    question: 'How would you calculate the sample size needed for an experiment with a 2% expected lift?',
    context: 'Your conversion rate is currently 5%. You expect the new feature to improve it to 7%. The team wants to know how long to run the test.',
    tags: ['power', 'sample-size', 'experiment-design'],
    answers: {
      analyst: 'Use a power calculator: baseline conversion 5%, expected 7% (absolute lift of 2pp), alpha=0.05, power=80%. With these inputs, you need roughly 1,500 users per arm (3,000 total). Divide by daily eligible users to get runtime. If you have 500 eligible users per day, that\'s 6 days minimum.',
      senior: 'A few adjustments to the basic calculation: (1) Use relative vs. absolute lift correctly — a "2% lift" in the PM\'s language usually means 2% relative (5% → 5.1%), not 2 percentage points (5% → 7%). These require vastly different sample sizes. Clarify upfront. (2) Set power at 80-90% depending on the cost of a false negative — for a high-stakes feature, 90% is worth the longer runtime. (3) Add 10-15% to the calculated runtime for operational buffer — experiments often start with lower traffic due to gradual rollout and holiday periods affect eligibility. A 6-day calculation should probably run 8 days.',
      staff: 'The sample size calculation gives you a lower bound, not the answer. The right question is: how long do we need to run to trust the result enough to make the decision we need to make? For a conversion experiment on a feature that\'ll cost significant engineering to maintain, I\'d run until I can bound the lower end of the CI above zero — not just until p<0.05. That often requires more data than the standard power calculation suggests. I\'d also ask: what\'s the minimum detectable effect that would change our decision? If 1% absolute lift is enough to ship, design for that MDE. If you need 3% to justify the maintenance cost, design for 3%. Designing the experiment around business decision thresholds rather than statistical convenience is the staff-level move.',
    },
  },

  {
    id: 'qa20',
    category: 'Statistics',
    difficulty: 'staff',
    isFree: false,
    question: 'How do you explain p-values to a non-technical PM?',
    context: 'Your PM is preparing for a leadership review and needs to explain the experiment result in plain language.',
    tags: ['communication', 'p-value', 'stakeholder'],
    answers: {
      analyst: 'The p-value is the probability of seeing data this extreme if the feature had zero effect. A p-value of 0.03 means: if the feature actually did nothing, we\'d only see a result this large 3% of the time by random chance. We set our threshold at 5%, so we call this significant. Framing for the PM: "We\'re 97% confident this isn\'t a fluke."',
      senior: 'The 97% framing is technically wrong and creates overconfidence. A p-value of 0.03 does NOT mean you\'re 97% confident the effect is real — that\'s a common Bayesian/frequentist confusion. A more accurate framing: "The data is inconsistent with the idea that this feature has zero effect. We\'re comfortable saying the result isn\'t due to random chance. But it doesn\'t tell us how big the real effect is — for that, look at the confidence interval." Give the PM language that won\'t backfire when challenged by a stats-savvy executive.',
      staff: 'I don\'t explain p-values to PMs. I explain what the data tells us about the decision. "Our experiment ran for 2 weeks on 80k users. Conversion in the new version was 6.2% vs. 5.8% in the old version. We\'re confident this difference is real and not due to random chance. Our best estimate is that the true effect is between 0.1% and 0.8 percentage points. Given our traffic volume, a 0.4% lift translates to roughly $2M in additional annual revenue. We recommend shipping." That\'s what the PM needs to say in the leadership review. The p-value is an intermediate calculation, not the output. If you\'ve done your job right, no one in the room should need to ask what a p-value is.',
    },
  },

  {
    id: 'qa75',
    category: 'Statistics',
    difficulty: 'analyst',
    isFree: true,
    question: 'Overall approval rate for a loan product is higher this quarter than last, but approval rate within every individual risk tier is flat or lower. How is that possible?',
    context: 'The lending team is reviewing the quarterly approval rate report and finds a discrepancy between the topline number and every risk-tier breakdown.',
    tags: ['simpsons-paradox', 'statistics', 'aggregate-data'],
    answers: {
      analyst: 'This is Simpson\'s paradox — the mix of applicants across risk tiers shifted this quarter toward lower-risk tiers (which have naturally higher approval rates), so the blended average rises even though no individual risk tier\'s own approval policy became more lenient. I\'d check the volume of applications by risk tier this quarter versus last to confirm the composition shifted.',
      senior: 'The mechanism is that a weighted average can move in the opposite direction of every one of its components if the weights (here, the share of applicants in each tier) change enough between periods — it\'s not a data error, it\'s a real mathematical property of aggregation. I\'d always report approval rate by risk tier alongside any blended number for exactly this reason, since the blended number alone actively misleads about whether underwriting policy changed.',
      staff: 'This distinction matters a lot for what gets communicated externally or to regulators — "our approval rate improved" implies underwriting got more lenient or effective, when the real story is "our applicant mix shifted toward lower-risk borrowers, and our policy within each risk band is unchanged or slightly tighter." Those are very different claims with different implications, especially in a regulated lending context where fair-lending analysis typically requires tier-level, not blended, comparisons. I\'d insist any external-facing statement about approval rate trends be paired with the tier-level breakdown to avoid an unintentionally misleading claim.',
    },
  },

  {
    id: 'qa76',
    category: 'Statistics',
    difficulty: 'senior',
    isFree: false,
    question: 'A colleague says "there\'s a 95% chance the true conversion lift is between 1% and 3%" based on a 95% confidence interval. What\'s wrong with that statement?',
    context: 'You\'re reviewing a slide before it goes to a stakeholder presentation.',
    tags: ['confidence-interval', 'statistics', 'misinterpretation'],
    answers: {
      analyst: 'That\'s a common but technically incorrect interpretation of a frequentist confidence interval. A 95% CI doesn\'t mean there\'s a 95% probability the true value falls in this specific interval — it means if we repeated this experiment many times and constructed a CI each time using the same method, 95% of those intervals would contain the true value. The true value either is or isn\'t in this particular interval; we just don\'t know which, and this specific interval either fully contains it or doesn\'t.',
      senior: 'I\'d correct the slide\'s language to something accurate but still accessible: "if we ran this experiment repeatedly, our method would produce an interval containing the true effect about 95% of the time — this specific interval is our best estimate of that range." It\'s a subtle distinction that rarely changes the business decision, but it matters when someone in the room pushes on precision, and getting caught making a technically wrong statistical claim undermines credibility on everything else in the presentation.',
      staff: 'Beyond correcting the specific phrasing, I\'d use this as a moment to align the team on standard language for CIs across all future reporting, since this misinterpretation is extremely common and will keep recurring slide after slide if not addressed at the source. I\'d propose a short reference sentence the team can reuse: "we estimate the true effect is most likely between X and Y" avoids the probability-of-containment claim entirely while still communicating the practical meaning, and standardizing on language like this protects the team from a repeated, avoidable credibility risk in front of stakeholders who may know enough statistics to notice.',
    },
  },

  {
    id: 'qa77',
    category: 'Statistics',
    difficulty: 'senior',
    isFree: false,
    question: 'Your team\'s weekly metrics dashboard flags any metric that moved with p < 0.05 against its historical baseline, out of about 25 tracked metrics. Most weeks, 1-2 metrics get flagged as "significant." Is that meaningful?',
    context: 'The dashboard runs an automated statistical test against each metric\'s historical distribution every week and highlights significant deviations.',
    tags: ['multiple-comparisons', 'statistics', 'dashboard-monitoring'],
    answers: {
      analyst: 'With 25 independent tests each at a 5% false-positive rate, you\'d expect roughly 1.25 metrics to flag as "significant" purely by chance every single week, even if nothing real is happening. Seeing 1-2 flagged metrics most weeks is consistent with pure noise and isn\'t, by itself, meaningful — it\'s actually very close to exactly what you\'d expect from chance alone across 25 tests.',
      senior: 'This is a textbook multiple-comparisons problem, and the fix is either to apply a correction (Bonferroni or Benjamini-Hochberg across the 25 weekly tests) so the flagging threshold accounts for the number of tests being run, or to change what a flag is used for — treating it as "worth a second look" rather than "statistically confirmed," since a single week\'s flag on an uncorrected threshold isn\'t strong evidence on its own. I\'d also add a persistence requirement: a metric flagged as significant for 2-3 consecutive weeks is a much stronger signal than a single week\'s flag, since chance-driven false positives don\'t reliably repeat.',
      staff: 'The deeper problem is that a dashboard that flags "significant" every week trains the team to either over-investigate noise or, more likely over time, to ignore the flags entirely once they realize most of them are false alarms — both outcomes are bad. I\'d redesign the system with a corrected threshold appropriate to the number of tests, add the persistence requirement, and change the framing of what gets escalated to whom: a single-week flag goes into a low-priority monitoring log, while a multi-week persistent flag on a corrected threshold triggers an actual investigation. The goal is for the alert system to earn back the team\'s trust by having a low enough false-positive rate that a flag reliably means something.',
    },
  },

  {
    id: 'qa78',
    category: 'Statistics',
    difficulty: 'analyst',
    isFree: false,
    question: 'A stakeholder asks "what are the odds this feature actually works?" after seeing your frequentist experiment result. How do you answer without misusing the statistics?',
    context: 'The experiment showed p = 0.02 for the primary metric. The stakeholder\'s question is fundamentally a probability-of-effect question, which frequentist p-values don\'t directly answer.',
    tags: ['bayesian-statistics', 'frequentist-statistics', 'stakeholder-communication'],
    answers: {
      analyst: 'A p-value doesn\'t directly answer "what are the odds this works" — it answers "how surprising would this data be if the feature had zero effect." I\'d translate carefully: "the data would be quite unusual if this feature truly did nothing, which gives us good reason to believe there\'s a real positive effect, though we can\'t put an exact probability on it from this test alone."',
      senior: 'If the stakeholder genuinely needs a probability-style answer, a Bayesian framing is more directly suited to the question, since it produces a probability distribution over the effect size given the data and a prior, rather than a statement about the data\'s compatibility with a null hypothesis. I\'d note the tradeoff plainly: a Bayesian answer requires choosing a prior, which adds a layer of assumption that a frequentist test avoids, but it directly answers the question being asked instead of answering an adjacent, more technical question that requires translation. For a one-off business decision like this, a simple Bayesian update using a weakly-informative prior based on the historical hit rate of similar features can give a genuinely useful "X% likely to be a real positive effect" answer.',
      staff: 'I\'d treat the stakeholder\'s question as a signal that the team\'s default statistical framing (frequentist significance testing) doesn\'t naturally answer the questions decision-makers actually ask, and that\'s worth addressing at the reporting-template level, not just this one conversation. For experiments where a probability-of-effect statement is genuinely useful for the decision being made, I\'d advocate for supplementing the standard frequentist output with a Bayesian posterior probability, using the team\'s accumulated historical prior for that feature category\'s typical effect size — giving stakeholders the direct answer they\'re asking for, in language they actually use, while still keeping the frequentist analysis for methodological rigor and cross-team consistency.',
    },
  },

  {
    id: 'qa79',
    category: 'Statistics',
    difficulty: 'senior',
    isFree: false,
    question: 'At your scale (50M users), even a 0.02% conversion change comes back statistically significant. How do you keep the team from shipping every "significant" result?',
    context: 'The experimentation platform runs experiments on massive traffic, meaning statistical power is very high and even tiny, practically meaningless effects reliably cross p < 0.05.',
    tags: ['statistical-power', 'practical-significance', 'sample-size'],
    answers: {
      analyst: 'I\'d establish a minimum meaningful effect size threshold for each metric before any experiment launches, separate from the statistical significance test — a result needs to clear both bars (statistically significant AND above the minimum practically meaningful threshold) before it\'s considered ship-worthy. At 50M users, a 0.02% lift is trivially detectable but likely worth close to nothing in absolute terms, so the significance test alone is the wrong gate.',
      senior: 'I\'d frame the minimum meaningful threshold in business terms specific to the metric — for conversion rate, that might be "an effect smaller than X% translates to less than $Y in annual impact, which doesn\'t clear our estimated maintenance cost for shipping and supporting this change long-term." This reframes the ship decision around expected value rather than statistical detectability, and it should be set before the experiment runs, not retroactively adjusted once a small-but-significant result comes in and someone wants to justify shipping it.',
      staff: 'At this scale, statistical significance essentially stops being informative on its own — nearly everything with a non-zero true effect will eventually reach significance given enough traffic, so treating "significant" as the ship bar effectively means the team will ship an enormous number of trivial changes, each individually justified but collectively adding real maintenance and complexity cost without commensurate business value. I\'d push for the experimentation platform itself to enforce minimum-effect-size thresholds as a first-class gate alongside p-value, not just a norm individual teams are expected to remember, so the org-wide behavior changes structurally rather than depending on every team independently exercising this judgment.',
    },
  },

  {
    id: 'qa80',
    category: 'Statistics',
    difficulty: 'senior',
    isFree: false,
    question: 'You find that users who complete onboarding faster have higher long-term retention. The team wants to redesign onboarding to be faster for everyone. What\'s your concern?',
    context: 'The correlation between onboarding completion time and D90 retention is strong and consistent across cohorts.',
    tags: ['correlation-vs-causation', 'onboarding', 'statistics'],
    answers: {
      analyst: 'Users who complete onboarding faster are likely already more motivated, more familiar with similar products, or simply more decisive — traits that plausibly drive higher retention independent of onboarding speed itself. Making onboarding artificially faster for everyone (e.g., removing steps or reducing friction) doesn\'t necessarily replicate the effect, since it\'s not clear that speed itself is the causal factor rather than a marker of user motivation.',
      senior: 'I\'d test the causal claim directly rather than infer it from the correlation — run an experiment where onboarding is deliberately shortened for a random subset of users and compare their D90 retention against a control with the original onboarding length. If shortening onboarding causally improves retention, that shows up in the experiment; if the correlation was purely due to user motivation differences, the shortened-onboarding group won\'t show the same retention lift the observational data suggested, because randomization removes the selection effect that was driving the original correlation.',
      staff: 'Acting on this correlation without testing it risks a specific, costly failure mode: redesigning onboarding to be faster for its own sake could strip out steps that build genuine product understanding or set up long-term engagement (like connecting a first data source, or inviting a teammate), which would plausibly hurt retention even though it makes the raw completion-time metric look better. I\'d insist on the randomized test before any redesign investment, and if resources are constrained, I\'d prioritize testing the specific hypothesized mechanism (e.g., "removing step 3 speeds things up without losing engagement value") rather than a blanket "make it faster" directive that conflates correlation with a validated causal lever.',
    },
  },

  {
    id: 'qa81',
    category: 'Statistics',
    difficulty: 'analyst',
    isFree: false,
    question: 'A sales rep with the worst conversion rate last month got extra coaching and improved significantly this month. Leadership wants to conclude the coaching program works. What\'s your caution?',
    context: 'The coaching intervention was targeted specifically at the bottom-performing reps from the prior month.',
    tags: ['regression-to-the-mean', 'statistics', 'causal-inference'],
    answers: {
      analyst: 'Because the coaching was specifically targeted at the worst performers from a single prior month, some of the observed improvement is expected purely from regression to the mean — an unusually bad month is partly due to random variation (a few unlucky deals, an off week) that naturally reverts toward each rep\'s true average performance the following month, independent of any coaching effect. I\'d check whether the improvement exceeds what regression to the mean alone would predict before crediting the coaching program.',
      senior: 'I\'d estimate the expected regression-to-the-mean effect using each rep\'s own historical variance — if a rep\'s conversion rate normally swings ±5 points month to month around their true average, and last month\'s dip was within that normal range, a good chunk of this month\'s "improvement" is just reversion to their normal level, not a coaching effect. A cleaner test would compare the coached reps\' improvement against a control group of reps who had similarly bad prior months but didn\'t receive coaching — if the coached group improved meaningfully more than the untreated bad-month control group, that\'s real evidence the coaching added value beyond natural reversion.',
      staff: 'This pattern — intervening on whoever looks worst, then declaring success when they improve — is one of the most common ways organizations fool themselves into believing an intervention works when it\'s mostly measuring statistical noise reverting to normal. I\'d push for the coaching program to be evaluated properly before further rollout investment: identify a comparable set of low-performing reps who don\'t receive coaching this cycle as a natural control, and only credit the program with the incremental improvement above what that control group shows. Without that comparison, the program could be genuinely worthless and still look like a success indefinitely, since regression to the mean will keep producing "improvement" every time it\'s applied to whoever had a bad prior month.',
    },
  },

  {
    id: 'qa82',
    category: 'Statistics',
    difficulty: 'staff',
    isFree: false,
    question: 'A stakeholder says "just give me one number for next quarter\'s revenue forecast, I don\'t need the confidence interval." How do you handle this?',
    context: 'You\'ve built a forecast model with a wide range of plausible outcomes depending on a few uncertain input assumptions, and a single point estimate would hide that uncertainty.',
    tags: ['forecasting', 'stakeholder-communication', 'uncertainty'],
    answers: {
      analyst: 'I\'d give a single headline number as requested (the point estimate, likely the median or expected value of the model) since that\'s what\'s being asked for, but I\'d still include the range in a smaller, secondary line so it\'s available if needed — "our forecast is $12M, with a likely range of $10-14M depending on [key assumption]." Dropping the range entirely risks the stakeholder treating $12M as a guarantee rather than an estimate.',
      senior: 'I\'d push back gently on the framing rather than just complying, because a single number without any sense of its reliability sets up a bad dynamic later — if actual revenue comes in at $10.5M, a stakeholder who was told "$12M" with no caveat will treat that as a miss, when it was actually within the expected range all along. I\'d propose giving the point estimate as the headline for simplicity, but attaching a one-line confidence qualifier ("likely accurate within ±15%, driven mainly by uncertainty in enterprise renewal timing") so the number carries its own context without requiring the stakeholder to parse a full confidence interval.',
      staff: 'The stakeholder\'s request usually reflects a real organizational need — a single number is easier to plan budgets and targets around than a distribution — but stripping the uncertainty entirely creates a predictable failure mode where the business is later surprised by normal variance it was never told to expect. I\'d propose a compromise that serves both needs: report the point estimate as the primary planning number, but separately maintain and communicate a downside scenario used specifically for risk planning (e.g., "plan budgets around $12M, but our downside scenario if renewal timing slips is $10M, and here\'s the trigger that would tell us we\'re tracking toward that scenario"). That gives the simplicity the stakeholder wants while making sure the uncertainty is still actionable rather than silently dropped.',
    },
  },

  // ─── SQL & Python ──────────────────────────────────────────────────────────

  {
    id: 'qa21',
    category: 'SQL',
    difficulty: 'analyst',
    isFree: false,
    question: 'How would you write a SQL query to calculate 7-day rolling retention?',
    context: 'You have a table of daily active users: user_id, activity_date. Define retention as a user being active at least once in a 7-day window.',
    tags: ['sql', 'retention', 'window-functions'],
    answers: {
      analyst: 'Use a self-join: join the activity table to itself where the second date is within 7 days of the first. Deduplicate to user-day level first. Count distinct retained users divided by total users in the cohort day.',
      senior: 'The cleaner approach uses window functions: for each user-day, use LEAD or a date arithmetic join to check if the user was active in the following 7 days. Use a CTE to first get distinct user-days, then join with a date range. Handle the edge case: users near the end of your date range will have incomplete 7-day windows — exclude those days from the denominator or flag them as incomplete. The query needs to distinguish between \'user was inactive in 7 days\' and \'we don\'t have 7 days of data yet.\'',
      staff: 'Before writing the query, I\'d challenge the metric definition: "active at least once in 7 days" is a very loose retention definition that can be inflated by notification-driven passive opens. For most products, a more meaningful retention definition is "completed the core action at least once in 7 days" — for a social app, that might be posting or commenting, not just opening. Once the definition is clear: use a CTE to get distinct user-activity-date pairs, then use a self-join with a date range condition to find any activity in the following 7 days. Window the denominator by cohort date, not by activity date, to avoid the denominator inflating as older cohorts accumulate more data.',
    },
  },

  {
    id: 'qa22',
    category: 'SQL',
    difficulty: 'senior',
    isFree: false,
    question: 'Your SQL query is running slowly on a 500M row table. What do you investigate?',
    context: 'A retention query that ran in 30 seconds last month now takes 8 minutes. Nothing changed in the query.',
    tags: ['sql', 'performance', 'query-optimization'],
    answers: {
      analyst: 'Check for missing indexes on join and filter columns, look for full table scans, check if the query is being run on a much larger dataset than before (data growth), and see if any new rows are causing skewed execution plans.',
      senior: 'Run EXPLAIN ANALYZE to see the actual execution plan. Look for: (1) seq scans on large tables where index scans should be used; (2) hash joins with very large probe sides — might need a different join order; (3) sort operations that spill to disk — need more memory or a different approach; (4) nested loop joins on large tables — usually catastrophic. Also check: did a statistics refresh fail? Stale table statistics cause the query planner to make bad decisions. Finally, check if the table was recently vacuumed — bloated tables cause slower scans.',
      staff: 'The \'nothing changed in the query\' framing is suspicious — something always changes. Data volume, data distribution, index fragmentation, concurrent load on the database, or a statistics refresh. I\'d run the query with EXPLAIN (ANALYZE, BUFFERS) to see actual vs. estimated row counts — a large discrepancy there indicates stale statistics. I\'d also check the query against the current data distribution: retention queries often join on user_id, and if the user_id distribution changed (e.g., a large enterprise customer was added with millions of rows), the join strategy might be wrong. The 8-minute runtime suggests a structural issue rather than marginal degradation — I\'d look for a missing index or a bad join order rather than micro-optimizations.',
    },
  },

  {
    id: 'qa43',
    category: 'SQL',
    difficulty: 'analyst',
    isFree: true,
    question: 'Write a query to find each customer\'s top 3 highest-value orders, and explain how you\'d handle ties in order value.',
    context: 'You have an "orders" table with customer_id, order_id, order_value, order_date. Some customers have multiple orders with identical values.',
    tags: ['sql', 'window-functions', 'ranking'],
    answers: {
      analyst: 'Use ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_value DESC) and filter to rank <= 3. ROW_NUMBER breaks ties arbitrarily by giving each row a unique sequential number, so if two orders tie for 3rd place, only one appears. If ties should both be included, RANK() is more appropriate since it gives tied rows the same rank and skips the next number accordingly.',
      senior: 'The choice between ROW_NUMBER, RANK, and DENSE_RANK depends on the actual business question, and I\'d clarify that before writing the query rather than defaulting to ROW_NUMBER. If "top 3" means exactly 3 rows per customer regardless of ties, use ROW_NUMBER with a documented, deterministic tiebreaker (add order_date DESC as a secondary ORDER BY key so results are reproducible, since an unordered tie in ROW_NUMBER is otherwise nondeterministic across query runs). If "top 3" means "the 3 highest distinct values, including all orders that tie for those values," RANK() with a filter on rank <= 3 is correct and may return more than 3 rows for a customer with ties.',
      staff: 'The tiebreaker choice has a business consequence that\'s easy to miss: if this feeds a loyalty program that rewards a customer\'s top 3 orders, ROW_NUMBER\'s arbitrary tiebreak means two customers with identical order histories could get different reward outcomes purely due to nondeterministic tie resolution — that\'s a fairness bug, not just a technical detail. I\'d make the tiebreak explicit and deterministic (secondary sort by order_date or order_id) and document the choice in the query itself, so a future reader doesn\'t have to reverse-engineer whether the tie handling was intentional.',
    },
  },

  {
    id: 'qa44',
    category: 'SQL',
    difficulty: 'senior',
    isFree: false,
    question: 'Your event table has duplicate rows for the same logical event, sometimes due to client retries and sometimes due to a pipeline replay bug. How do you deduplicate them in SQL?',
    context: 'Each event has an event_id generated client-side, but you\'ve found cases where the same logical action produces two different event_ids due to a retry bug, in addition to true duplicates with identical event_ids from pipeline replays.',
    tags: ['sql', 'deduplication', 'data-quality'],
    answers: {
      analyst: 'For exact duplicates (same event_id appearing twice from a pipeline replay), a straightforward dedup works: use ROW_NUMBER() OVER (PARTITION BY event_id ORDER BY ingestion_timestamp) and keep only rank = 1. This handles the pipeline-replay case cleanly since the event_id is identical.',
      senior: 'The harder case is the retry-generated duplicates with different event_ids, since a naive event_id-based dedup won\'t catch those. I\'d build a secondary dedup key using a combination of user_id, event_type, and a time window (e.g., same user, same event type, within 2 seconds) as a fuzzy match, and flag — not silently drop — anything caught by this second pass, since fuzzy deduplication carries false-positive risk (two genuinely distinct rapid actions by the same user could look like a retry duplicate). I\'d validate the fuzzy dedup logic against a manually inspected sample before trusting it in production reporting.',
      staff: 'The SQL fix treats the symptom; the actual problem is a client retry mechanism that doesn\'t guarantee idempotency, and every downstream consumer of this data is paying the cost of working around it. I\'d push for a real fix upstream — the client should generate an idempotency key that survives retries (e.g., derived deterministically from the user action rather than randomly per attempt) so the same logical event always produces the same event_id even across retries, eliminating the need for fuzzy matching entirely. Until that ships, I\'d keep the fuzzy dedup as a documented, monitored workaround, with a metric tracking how many rows it\'s affecting each week so we know when the upstream fix has actually landed and the workaround can be retired.',
    },
  },

  {
    id: 'qa45',
    category: 'SQL',
    difficulty: 'senior',
    isFree: false,
    question: 'Your daily revenue aggregate table is computed once per day at midnight, but some transactions settle up to 48 hours late. How do you handle this in your pipeline and reporting?',
    context: 'A daily job sums transactions by transaction_date to produce a revenue-by-day table. Late-settling transactions (refund reversals, delayed payment confirmations) mean each day\'s number changes for several days after it\'s first computed.',
    tags: ['sql', 'late-arriving-data', 'data-pipeline'],
    answers: {
      analyst: 'The daily table needs to be recomputed for a rolling window, not just appended — reprocess the last 3-5 days on every run so late-arriving transactions get folded into the correct transaction_date rather than only being counted on the day they happen to settle. I\'d also add a "last_updated" or "is_finalized" flag so downstream consumers know which days are still subject to revision.',
      senior: 'Beyond the rolling reprocess window, this needs an explicit convention for how "finalized" is defined and communicated, because a dashboard showing yesterday\'s revenue as a hard number when it\'s actually still 60% settled will systematically look lower than the eventual true value, and someone comparing week-over-week without accounting for this will see a false declining trend purely from newer days being less settled than older ones. I\'d add a maturity curve to the data (e.g., "day+0 numbers are typically 70% of final, day+3 numbers are typically 99% of final") so anyone comparing across days at different maturities can adjust for it.',
      staff: 'This is fundamentally a communication problem as much as a pipeline problem — the business needs both a fast, provisional number for same-day operational decisions and a slower, accurate number for revenue recognition and reporting, and conflating the two creates recurring confusion every time someone notices "yesterday\'s number changed." I\'d expose both explicitly: a real-time provisional revenue metric clearly labeled as such for operational use, and a finalized revenue metric that only locks in once the settlement window has fully closed (e.g., T+5), used for anything reported externally or to finance. I\'d also make sure finance and the exec dashboard are pulling from the finalized table specifically, since using the provisional table for a board report risks reporting numbers that later have to be walked back.',
    },
  },

  {
    id: 'qa46',
    category: 'SQL',
    difficulty: 'analyst',
    isFree: false,
    question: 'You\'re reviewing a teammate\'s SQL that has 4 levels of nested subqueries. It works, but you find it hard to follow. How would you refactor it, and does it matter?',
    context: 'The query computes a multi-step funnel conversion rate and each subquery filters and joins on the output of the one before it.',
    tags: ['sql', 'ctes', 'query-readability'],
    answers: {
      analyst: 'I\'d refactor the nested subqueries into a chain of CTEs (WITH clauses), giving each one a descriptive name matching what it represents (signed_up_users, activated_users, converted_users). This doesn\'t change the query\'s logic or performance in most modern engines, but it makes the query readable top-to-bottom instead of inside-out, which matters a lot when someone else — or you, in six months — needs to modify or debug it.',
      senior: 'It matters beyond just readability — nested subqueries make it much harder to spot logic bugs, like an incorrect join condition buried three levels deep, and harder to unit-test a single step in isolation (with CTEs, you can run just the first two and eyeball the intermediate result; with deep nesting, you often have to reconstruct partial queries manually to check a step). One caveat: in some query engines, CTEs are always materialized and can be slower than an equivalent subquery if the engine doesn\'t push filters down — so for very large tables, I\'d check the execution plan after refactoring to confirm performance didn\'t regress, and use a materialized CTE explicitly if that\'s actually the better choice on this engine.',
      staff: 'Query readability compounds over a team\'s lifetime in a way that\'s easy to underweight in the moment — a funnel query like this will get copied, adapted, and re-derived by other analysts for years, and every hour saved (or lost) understanding it multiplies across everyone who touches it later. I\'d treat this less as a style preference and more as a team-standards issue: propose a lightweight SQL style guide (CTEs over deep nesting, descriptive names, comments on any non-obvious join condition) so consistency doesn\'t depend on each reviewer catching it case by case, and apply it as a light PR-review norm rather than a strict lint rule that slows people down.',
    },
  },

  {
    id: 'qa47',
    category: 'SQL',
    difficulty: 'senior',
    isFree: false,
    question: 'Write a query approach to compare this month\'s new-user activation rate against last month\'s, broken out by acquisition channel.',
    context: 'You have a users table with signup_date and acquisition_channel, and an activation_events table logging when a user completes the activation action.',
    tags: ['sql', 'cohort-analysis', 'month-over-month'],
    answers: {
      analyst: 'Build a CTE that joins users to activation_events with a left join, so non-activated users still appear with a null activation date. Bucket users into signup_month via DATE_TRUNC, then group by signup_month and acquisition_channel to compute activated users divided by total signups per group. Compare the two months\' rates side by side in the output.',
      senior: 'The key subtlety is the activation window — if activation is defined as "within 14 days of signup," this month\'s cohort (signed up recently) hasn\'t had the full 14-day window to activate yet, so comparing this month\'s activation rate directly against last month\'s will understate this month\'s true rate. I\'d only include cohorts that have had the full window elapse (i.e., compare last month against the month before, or compute a same-day-maturity comparison for the partial current month) rather than comparing an immature cohort against a mature one.',
      staff: 'Beyond the maturity issue, channel-level comparisons need a sanity check on volume — a channel with 40 signups this month showing "activation rate dropped from 60% to 45%" is a much noisier signal than the same percentage move on a channel with 4,000 signups, and presenting both with equal visual weight risks the small-channel noise getting overreacted to. I\'d add signup volume alongside the rate in the output and note a minimum sample threshold below which a rate comparison shouldn\'t be treated as a trend, so whoever consumes this doesn\'t chase noise on a small channel while missing a real signal on a large one.',
    },
  },

  {
    id: 'qa48',
    category: 'SQL',
    difficulty: 'senior',
    isFree: false,
    question: 'You\'re joining a transactions table to a users table to get each user\'s subscription tier at the time of purchase, but users can change tiers over time. How do you write this join correctly?',
    context: 'The users table only stores each user\'s current tier — a naive join would incorrectly attribute historical transactions to a user\'s current tier rather than the tier they held at purchase time.',
    tags: ['sql', 'slowly-changing-dimensions', 'point-in-time-join'],
    answers: {
      analyst: 'A naive join against the current-state users table will misattribute any transaction made before a user\'s most recent tier change. I\'d first check whether a tier-history table exists (recording tier, effective_start_date, effective_end_date); if it does, join transactions to that history table on the condition that transaction_date falls between effective_start_date and effective_end_date, rather than joining to the current-tier table.',
      senior: 'If no tier-history table exists, this needs to be built before the analysis can be done correctly — reconstructing point-in-time state after the fact from an audit log or event stream (tier_changed events) is possible but should be flagged as an estimate with defined assumptions (e.g., "this reconstruction assumes no tier changes before our audit log started in 2023"). I\'d also validate the reconstructed history against a small manually-checked sample of known tier-change dates before trusting it for a broader analysis, since a subtle bug in the reconstruction (like using the event\'s log timestamp instead of the tier\'s actual effective date) would silently misattribute transactions the same way the naive join did.',
      staff: 'This class of bug — joining to current state instead of point-in-time state — is one of the most common silent correctness errors in analytics, because the query runs fine and returns plausible-looking numbers; nothing errors out to reveal the mistake. I\'d treat "does this dimension change over time, and if so, do we have a history table for it" as a standard question to ask before any join involving a dimension like tier, price, or user segment, and if the answer is "no history table exists," I\'d push for one to be built as reusable infrastructure rather than reconstructing it ad hoc for each analysis that happens to need it.',
    },
  },

  {
    id: 'qa49',
    category: 'SQL',
    difficulty: 'analyst',
    isFree: false,
    question: 'After adding a join to your query, your total revenue number tripled. What\'s the likely cause and how do you fix it?',
    context: 'A query summing order revenue was correct before you added a join to a "shipments" table to pull in shipping carrier information. Some orders have multiple shipment records.',
    tags: ['sql', 'join-fan-out', 'debugging'],
    answers: {
      analyst: 'This is a classic join fan-out: orders with multiple matching rows in the shipments table (e.g., an order split into 3 shipments) get duplicated by the join, so the order\'s revenue gets summed once per matching shipment row instead of once total. I\'d check the cardinality of the join key — if orders can have multiple shipments, the join isn\'t one-to-one, and summing revenue after the join will overcount exactly proportional to how many shipments each order has.',
      senior: 'The fix depends on what\'s actually needed: if the query just needs order revenue and doesn\'t need shipment-level detail, aggregate the shipments table down to one row per order first (e.g., a subquery or CTE that picks the primary/first shipment, or concatenates carrier names into a single field) before joining, so the join is one-to-one. If shipment-level detail is genuinely needed in the output, then revenue needs to be summed before the join, in a separate CTE, and joined to shipment details afterward rather than summed after a fan-out join — otherwise the two granularities (order-level revenue vs. shipment-level detail) can\'t coexist correctly in one flat join.',
      staff: 'Join fan-out is dangerous precisely because it fails silently — the query runs, returns a number, and that number is wrong by a specific multiple that\'s easy to not notice unless you happen to sanity-check against a known total. I\'d always validate a new join by comparing an aggregate before and after adding it (row count, distinct order count, total revenue) as a matter of habit, not just when something looks obviously wrong — a fan-out of 1.3x is much easier to miss than the 3x in this case, and would have shipped into a report undetected.',
    },
  },

  {
    id: 'qa50',
    category: 'SQL',
    difficulty: 'senior',
    isFree: false,
    question: 'Would you write a multi-step funnel conversion query using multiple LEFT JOINs on separate event tables, or a single table with conditional aggregation (CASE WHEN inside SUM/COUNT)? Walk through the tradeoff.',
    context: 'You need step-1 through step-5 conversion for a signup funnel, and both approaches are available given the data model.',
    tags: ['sql', 'conditional-aggregation', 'funnel-query'],
    answers: {
      analyst: 'If all funnel steps live in a single events table distinguished by an event_type column, conditional aggregation is usually simpler and less error-prone: SELECT user_id, MAX(CASE WHEN event_type = \'step1\' THEN 1 ELSE 0 END) AS did_step1, ... and so on, grouped by user_id, then compute conversion as counts of each flag divided by the prior step\'s count. Multiple LEFT JOINs on separate event subqueries work too but risk fan-out if any step\'s subquery isn\'t pre-deduplicated to one row per user.',
      senior: 'The conditional aggregation approach also tends to perform better at scale, since it\'s a single pass, single group-by over one table rather than N separate joins each requiring their own scan and join operation — this matters a lot once the events table is in the billions of rows. The join approach becomes more attractive only when the funnel steps genuinely live in different source tables with different grains (e.g., step 3 is a backend fulfillment event in a different system entirely), where conditional aggregation isn\'t an option because the data isn\'t co-located in one table to begin with.',
      staff: 'Beyond performance, I\'d weigh maintainability: conditional aggregation in one query is easier for someone new to the funnel to read top-to-bottom and verify against the funnel definition doc, while a chain of joins tends to accumulate subtle deduplication assumptions in each subquery that aren\'t obvious from a glance. For a funnel this team will maintain and modify over time (adding a step 6, changing what counts as step 2), I\'d default to conditional aggregation for the readability and correctness benefits, and only reach for the join approach when the data genuinely isn\'t co-located, treating that as a data modeling gap worth fixing (e.g., landing all funnel-relevant events in one canonical events table) rather than a permanent constraint to write around.',
    },
  },

  // ─── Growth & Funnels ──────────────────────────────────────────────────────

  {
    id: 'qa23',
    category: 'Growth',
    difficulty: 'analyst',
    isFree: false,
    question: 'Funnel conversion from sign-up to first purchase dropped 15% this month. Where do you start?',
    context: 'The sign-up → first purchase funnel has 5 steps. You have event-level data for each step.',
    tags: ['funnel-analysis', 'conversion', 'rca'],
    answers: {
      analyst: 'Map the drop across each funnel step: which specific step has the highest absolute drop in conversion? The drop is almost always concentrated in one or two steps, not distributed evenly. Once you find the step, look for what changed in that step — design, copy, backend behavior, or external factors.',
      senior: 'Run step-by-step conversion rates before and after the drop, but also check for composition effects: did the sign-up traffic mix change? If a new acquisition channel brought lower-intent users, the drop might not be in the funnel at all — it might be in acquisition quality. I\'d segment the funnel by acquisition channel and device type. If the drop is concentrated in users from one specific channel or device, that\'s your lead. Also check timing within the funnel: is the drop happening faster (users abandoning sooner), or are users taking longer and timing out?',
      staff: 'A 15% funnel drop is large enough that I\'d be skeptical of a single-cause explanation. The most common pattern is a combination: a product change made the funnel slightly harder, and simultaneously a channel mix shift brought lower-intent users. Each alone wouldn\'t produce 15%, but together they compound. I\'d want to decompose the change into attributable components: how much is channel mix, how much is step-specific conversion change, how much is session length / abandonment speed? Once decomposed, the actions are very different — channel mix requires acquisition strategy changes; step conversion requires product changes. Presenting a single hypothesis without decomposition often leads to the wrong team trying to fix the wrong problem.',
    },
  },

  {
    id: 'qa24',
    category: 'Growth',
    difficulty: 'senior',
    isFree: false,
    question: 'How would you calculate LTV for a subscription SaaS product?',
    context: 'The company has 3 pricing tiers: $29, $79, and $199/month. Churn rates differ by tier.',
    tags: ['ltv', 'saas', 'growth-accounting'],
    answers: {
      analyst: 'LTV = ARPU / churn rate per cohort. Calculate separately by tier: if the $29 tier has 5% monthly churn, LTV = $29/0.05 = $580. Compare LTV to CAC by tier to identify which acquisition investments are profitable.',
      senior: 'The simple formula breaks down when churn rate changes over time. Expansion revenue matters too — users often upgrade from $29 to $79 after 6 months, which changes the effective ARPU over the cohort\'s lifetime. Better approach: build a cohort survival model. For each cohort, track monthly retention and monthly ARPU (including upgrades and downgrades). Compute the cumulative revenue per cohort user over 24 months. This gives you an empirical LTV that captures expansion and compression, not just a steady-state estimate. Validate it against historical cohorts.',
      staff: 'LTV is only as useful as the decisions it informs. For a 3-tier SaaS, the decision is usually: how much can we afford to pay to acquire a user on each tier, and should we invest in moving users up-tier vs. acquiring more of the top tier directly? The LTV calculation needs to be paired with time-to-payback: a $29 user with $580 LTV who pays back in 20 months is worth less than a $79 user with $950 LTV who pays back in 8 months, because the cash flow profile is completely different. I\'d present LTV alongside payback period and cohort survival curves, not as a standalone number. Also: model the LTV range, not just the point estimate — churn rate uncertainty compounds over 24 months and the LTV confidence interval is much wider than most teams acknowledge.',
    },
  },

  {
    id: 'qa51',
    category: 'Growth',
    difficulty: 'analyst',
    isFree: true,
    question: 'How would you define the "activation" event for a project management tool, and why does the definition matter?',
    context: 'The growth team currently defines activation as "completed signup," but wants a more meaningful definition tied to future retention.',
    tags: ['activation', 'aha-moment', 'growth-metrics'],
    answers: {
      analyst: 'Activation should be the first moment a user experiences the product\'s core value, not just account creation. For a project management tool, that\'s likely something like "created a project and invited at least one teammate" rather than just signing up, since signup alone doesn\'t mean the user has seen why the product is useful. I\'d validate a candidate definition by checking whether users who hit it retain meaningfully better than users who don\'t.',
      senior: 'The mechanism that makes an activation definition useful is that it should be both predictive of retention and something the team can influence through onboarding design — a definition that\'s predictive but entirely outside the team\'s control (like "works at a company with 50+ employees") isn\'t actionable. I\'d test a few candidate definitions (created first project, invited a teammate, completed first task, both invited and completed) against D30 retention and pick the one with the strongest lift while still being reachable through a specific onboarding flow the team can iterate on.',
      staff: 'The risk in choosing an activation metric is optimizing onboarding toward a proxy that doesn\'t actually cause retention — if "invited a teammate" correlates with retention only because it\'s a signal of intent (highly motivated users invite teammates and would have retained anyway), pushing everyone through an invite-nudge in onboarding might lift the activation number without lifting real retention. I\'d look for a definition that\'s plausibly causal, not just correlated, by checking whether users who were nudged into hitting the definition (via a randomized onboarding experiment) actually retained better than a control group that wasn\'t nudged — that\'s the real test of whether activation is a lever or just a symptom.',
    },
  },

  {
    id: 'qa52',
    category: 'Growth',
    difficulty: 'senior',
    isFree: false,
    question: 'How would you measure whether a referral program is actually driving incremental growth, versus just rewarding people who would have signed up anyway?',
    context: 'The referral program gives both the referrer and referee a discount. Signups attributed to referral links have grown 20% month over month.',
    tags: ['virality', 'referral-program', 'incrementality', 'growth'],
    answers: {
      analyst: 'Raw referral-attributed signups overstate incremental growth because some of those users would have found the product anyway through organic search or word of mouth, and the referral link just happened to be the click that got tracked. I\'d look at the overall organic signup trend alongside referral signups — if total organic-plus-referral growth outpaced organic alone before the program launched, that\'s a better signal of incrementality than the referral count in isolation.',
      senior: 'The cleanest way to measure incrementality is a holdout: randomly withhold the referral program from a subset of eligible users (or a subset of markets/geographies) and compare total signup volume between the holdout and the group with access to referrals. If total signups (not just referral-attributed ones) are meaningfully higher in the group with referral access, the program is truly incremental; if total signups are similar and referral signups just cannibalize organic signups that would have happened anyway, the program is expensive relabeling, not growth. I\'d also compute a K-factor (invites sent per user × conversion rate per invite) to understand whether the loop is actually compounding (K > 1) or just a one-time boost.',
      staff: 'Beyond incrementality, I\'d weigh the discount cost against the LTV of referred users specifically, since referral programs sometimes attract price-sensitive users who churn faster once the discount period ends — a program that looks incremental on signups but attracts lower-LTV users can still be a net negative. I\'d propose measuring not just "did the holdout confirm incrementality" but "is the referred cohort\'s LTV, net of both referrer and referee discount cost, higher than the blended CAC of our next-best acquisition channel" — that\'s the actual decision the growth team needs to make, and it requires waiting for enough cohort maturity to see real retention and revenue, not just the signup spike.',
    },
  },

  {
    id: 'qa53',
    category: 'Growth',
    difficulty: 'analyst',
    isFree: false,
    question: 'Your D1-D30 retention curve declines steadily and never flattens. A colleague says a "smile curve" would be healthier. What does that mean and why does it matter?',
    context: 'You\'re reviewing a consumer app\'s retention curve in a growth review. Retention drops from 40% at D1 to 8% at D30 with no sign of leveling off.',
    tags: ['retention-curve', 'smile-curve', 'growth-metrics'],
    answers: {
      analyst: 'A healthy retention curve typically declines initially (as low-intent or curious users drop off) and then flattens into a stable plateau — that plateau represents your core, habitual user base who keep coming back long-term. A curve that keeps declining with no flattening means you don\'t have a stable retained base at all; every cohort is eventually losing essentially all its users, which is a much more serious signal than a curve that flattens at a lower level.',
      senior: 'The "smile" shape specifically refers to some products seeing retention dip and then rise again later (a genuine smile, not just a plateau) — this happens in products with usage cycles, like a tax app that dips after initial use but rises again the following year, or a travel app where usage clusters around trip planning. For most products, though, the goal is a flattening plateau rather than a literal smile; a curve with no plateau anywhere through D60 or D90 suggests either the core value proposition isn\'t sticky for anyone, or the cohort is being diluted by continuous low-intent acquisition that never lets a stable retained base show through in the blended curve.',
      staff: 'Before concluding this is a product problem, I\'d check whether the curve is blended across very different user segments — a product with both a small habitual-user base and a much larger low-intent user base will show a declining blended curve even if the habitual segment\'s own curve flattens beautifully, because the low-intent segment dominates the denominator and drags the average down continuously. I\'d re-cut the curve by an early behavioral signal (e.g., users who took a specific action in week 1) to see if a flattening curve is hiding inside the aggregate. If even the best-behaved segment never flattens, that\'s a real signal the core product doesn\'t have a retained base yet, and the growth conversation should shift from acquisition to product-market fit.',
    },
  },

  {
    id: 'qa54',
    category: 'Growth',
    difficulty: 'senior',
    isFree: false,
    question: 'Total MAU has been flat for two quarters. How would you use growth accounting to understand what\'s actually happening underneath that flat number?',
    context: 'The topline monthly active user count has hovered around 2.1M for six months, with no clear explanation.',
    tags: ['growth-accounting', 'mau', 'churn'],
    answers: {
      analyst: 'Decompose MAU month over month into new users, retained users, resurrected users (churned users who came back), and churned users (active last month, not active this month). A flat topline can hide very different underlying dynamics — for example, steady new user growth exactly offsetting rising churn, versus a genuinely stagnant product with low churn and low new user growth. The decomposition tells you which lever is actually moving.',
      senior: 'I\'d plot each component as a stacked or waterfall chart over the two quarters to see the trend within the flat topline. A common pattern behind a "flat" MAU is that churn has been quietly increasing while new user acquisition has also been increasing to compensate — that\'s a much worse trajectory than it looks, because it means the business is spending more on acquisition just to stand still, and if acquisition spend or channel performance dips even slightly, MAU will start declining. I\'d specifically check the churn rate as a percentage of the prior month\'s base (not just absolute churned users), since a rising absolute churn number that\'s proportional to a growing base isn\'t actually a worsening rate.',
      staff: 'The real question growth accounting should answer is "what would happen to MAU if we stopped acquisition spend today," because that tells you whether growth is coming from durable retention improvements or from continuously buying new users to backfill churn. I\'d compute the resurrection and churn components as their own trend, separate from new user acquisition, and present a projection of steady-state MAU under current retention and resurrection rates alone (zero new acquisition) — if that steady-state number is meaningfully lower than today\'s MAU, leadership needs to know the flat topline is being propped up by acquisition spend, not organic health, and that changes the urgency of any retention investment.',
    },
  },

  {
    id: 'qa55',
    category: 'Growth',
    difficulty: 'analyst',
    isFree: false,
    question: 'Marketing wants credit for a signup that clicked a paid ad three days before signing up organically through a direct visit. How do you think about attribution here?',
    context: 'Your attribution model uses last-click attribution by default, which would credit the direct visit, not the paid ad, for this signup.',
    tags: ['attribution', 'paid-vs-organic', 'multi-touch'],
    answers: {
      analyst: 'Last-click attribution undercounts the paid ad\'s role here — the ad may have been the actual trigger that made the user aware of the product, even though the conversion technically happened through a later direct visit. First-click or a multi-touch model would give the paid ad some credit. Which model is "right" depends on what decision the attribution is informing — if it\'s paid channel budget allocation, giving paid channels zero credit for assisted conversions like this will systematically undervalue upper-funnel spend.',
      senior: 'I\'d move away from single-touch models (first-click or last-click) toward a multi-touch or data-driven attribution model that distributes credit across touchpoints, because both single-touch extremes have known biases: last-click overcredits bottom-funnel channels (like branded search) that catch users who were already going to convert, while first-click overcredits awareness channels that may have had little to do with the actual decision. A simpler, interim fix that\'s often good enough is running incrementality tests (geo-holdout or PSA-style tests) on the paid channels in question rather than relying on any click-based attribution model at all, since attribution models estimate correlation while incrementality tests estimate causal lift.',
      staff: 'The deeper issue is that click-based attribution, however sophisticated, can\'t capture channels with no clickable touchpoint at all — brand awareness from a podcast ad, or word of mouth from a paid user\'s install — so any attribution model built purely from paid-and-organic click data will systematically misallocate budget away from channels it can\'t see. I\'d pair the attribution model with periodic incrementality experiments (turning a channel off in a test market and measuring the true drop in signups) to calibrate how much the attribution model is over- or under-crediting each channel, and use that calibration to adjust budget decisions rather than trusting the click-based model\'s output at face value.',
    },
  },

  {
    id: 'qa56',
    category: 'Growth',
    difficulty: 'senior',
    isFree: false,
    question: 'How is thinking about a "growth loop" different from thinking about a "funnel," and why does the distinction matter for how you\'d invest?',
    context: 'The growth team\'s roadmap is entirely funnel-optimization work (reducing drop-off at each signup step). A new VP asks whether the team should be thinking in loops instead.',
    tags: ['growth-loops', 'funnel-optimization', 'growth-strategy'],
    answers: {
      analyst: 'A funnel is a linear path with a fixed set of new users entering at the top — optimizing it improves what percentage of a given input converts, but doesn\'t change how many people enter the top of the funnel in the first place. A growth loop is a cycle where an output of the product (e.g., a shared document, an invited teammate) becomes a new input that brings in additional users, so improving the loop can compound over time rather than just converting a fixed, externally-sourced pool more efficiently.',
      senior: 'The practical difference is where the compounding comes from: funnel optimization has diminishing returns (you can only improve a conversion rate so much before you hit a ceiling), while a working growth loop can, in principle, keep compounding as long as the loop\'s effective K-factor stays above the point where it\'s net additive to organic growth. I\'d audit the current product for any existing loop mechanics — shared artifacts, invites, network effects — even informal ones, and evaluate whether targeted investment in strengthening that loop (not just funnel conversion) has a larger long-run growth impact than continuing to squeeze the funnel.',
      staff: 'The risk in reflexively shifting all investment to loops is that a funnel with real, fixable friction is often the faster and more certain win — loops take longer to build, are harder to validate (a loop\'s effect compounds slowly and is easy to overestimate from early enthusiasm), and not every product has a natural loop mechanic to strengthen. I\'d frame this to the VP as a portfolio decision rather than a replacement: keep funnel optimization for near-term, provable wins, and run a small, time-boxed experiment on the most promising loop candidate to validate whether it actually compounds before reallocating significant roadmap capacity away from funnel work that has a known, positive ROI.',
    },
  },

  {
    id: 'qa57',
    category: 'Growth',
    difficulty: 'senior',
    isFree: false,
    question: 'Your paid acquisition CAC has crept up 40% over two quarters while your team hasn\'t changed the channel mix or bidding strategy. What\'s going on and what would you do?',
    context: 'The same channels (paid search, paid social) at similar budget allocation are now costing significantly more per acquired user.',
    tags: ['cac', 'paid-acquisition', 'diminishing-returns'],
    answers: {
      analyst: 'CAC creep at a stable budget and channel mix usually means you\'re running into diminishing returns within the same channels — as you spend more into the same audience, you\'re bidding on increasingly marginal, lower-intent users, driving cost per acquisition up. I\'d check spend-versus-volume curves per channel to see if this is a saturation effect (cost per incremental user rising as spend increases) rather than assuming external market changes are the only cause.',
      senior: 'I\'d also separate out auction dynamics from audience saturation — increased competitor bidding on the same keywords or audiences can drive CPCs up independent of anything your own targeting is doing, and that\'s observable by checking auction insights/impression share data from the ad platforms rather than just your own conversion funnel. If impression share and average position are stable but CPCs rose, that points to competitive pressure; if impression share dropped (you\'re being outbid more often) while your budget stayed flat, you\'re losing auctions to more aggressive bidders, which is a different problem than saturating your own reachable audience.',
      staff: 'Either explanation — audience saturation or rising competition — leads to the same strategic conclusion: continuing to pour the same budget into the same channels at the same targeting will keep getting less efficient, and the right response is diversification, not just optimization within existing channels. I\'d model the marginal CAC curve for the current channels (cost to acquire the next 1,000 users at current spend levels versus at reduced spend) to find the point where marginal CAC exceeds LTV, and use headroom below that point to test entirely new channels or audience segments, since squeezing further efficiency out of a saturating channel has a ceiling that diversification doesn\'t.',
    },
  },

  {
    id: 'qa58',
    category: 'Growth',
    difficulty: 'analyst',
    isFree: false,
    question: 'A referral incentive program shows referred users have 25% higher LTV than non-referred users. The team wants to conclude referrals are simply better customers. What would you check before agreeing?',
    context: 'The comparison is a simple average LTV of referred vs. non-referred cohorts, both acquired over the same period.',
    tags: ['referral-program', 'selection-bias', 'ltv-comparison'],
    answers: {
      analyst: 'This comparison doesn\'t control for self-selection — the kind of person who has a friend already using the product and is willing to sign up on a friend\'s recommendation may be systematically different from the average acquired user (more socially connected, more likely to trust a peer recommendation, possibly already primed to want the product) regardless of the referral program\'s own effect. I\'d check whether referred users differ on observable characteristics (demographics, acquisition channel they\'d have used otherwise, product category interest) before attributing the LTV gap to the referral mechanism itself.',
      senior: 'A stronger test is comparing referred users against a matched cohort of non-referred users with similar observable characteristics (same acquisition period, similar declared interests, similar demographic profile if available) rather than the raw population average, which likely differs from referred users on dimensions correlated with LTV. Even better, if any users were referred but the referral link failed to attribute properly (a natural quasi-experiment), comparing "people who were actually referred by a friend" against "people who would have been referred but the attribution broke" isolates the effect of having a personal connection to the product from the effect of the referral program\'s incentive mechanics specifically.',
      staff: 'The distinction that actually matters for the business decision is whether the LTV lift comes from the referral relationship itself (peer trust, pre-existing product fit) or from the incentive/discount driving different behavior — because if it\'s the former, scaling the referral program further won\'t necessarily replicate the 25% lift, since you\'d be reaching a different (less naturally-connected) population as the program scales, while if it\'s the latter, the lift might genuinely be attributable to the program\'s design and worth investing more into. I\'d propose testing this by varying the incentive size in a controlled way (some referred users get the discount, some get a no-incentive "just share" link) — if LTV holds up even without the discount, most of the 25% is likely the peer-trust effect, not something the program itself created and can keep creating at scale.',
    },
  },

  // ─── BI & Reporting ─────────────────────────────────────────────────────────

  {
    id: 'qa25',
    category: 'BI',
    difficulty: 'analyst',
    isFree: false,
    question: 'A stakeholder asks you for a dashboard. What questions do you ask before building it?',
    context: 'A VP of Marketing asks for "a dashboard showing our email campaign performance."',
    tags: ['dashboard-design', 'stakeholder', 'requirements'],
    answers: {
      analyst: 'Ask: (1) What decision will you make from this dashboard? (2) How often will you look at it — daily, weekly, monthly? (3) What metrics matter most — open rate, click rate, conversion, revenue? (4) Do you need segmentation by campaign type, audience, or time period? (5) Who else will see it? Getting answers before building prevents a dashboard that looks complete but answers the wrong questions.',
      senior: 'Add: (6) What does "good" look like? If open rate is 25%, is that good or bad? Without benchmarks or targets, a dashboard shows numbers without context. (7) What data is available and trustworthy? Email campaign data often has quality issues — bot clicks, spam filters inflating or deflating open rates. Knowing the limitations upfront prevents future credibility problems when the VP asks why a number "doesn\'t look right." Build the requirements doc before the dashboard, even if it\'s one page.',
      staff: 'The most important question is: what currently stops you from making this decision without a dashboard? If the VP can already pull a weekly email report from your ESP, the dashboard request might really be about a different problem — wanting faster access, wanting to slice by a dimension they currently can\'t, or wanting to stop doing manual data pulls. Understanding the root need saves you from building something polished that doesn\'t actually solve the workflow problem. I\'d also push back gently on "email campaign performance" as a framing — email is a distribution channel, not a business outcome. The dashboard should ultimately answer "did email contribute to revenue?" not just "did people open the email?"',
    },
  },

  {
    id: 'qa27',
    category: 'BI',
    difficulty: 'analyst',
    isFree: true,
    question: 'A stakeholder wants full self-serve access to raw data in Looker instead of requesting reports from your team. What are the tradeoffs?',
    context: 'Your analytics team is drowning in ad hoc report requests and is considering opening self-serve access to a broader set of internal users.',
    tags: ['self-serve-analytics', 'dashboard-design', 'data-governance'],
    answers: {
      analyst: 'Self-serve reduces the team\'s report backlog and lets stakeholders answer their own questions faster. The tradeoff is consistency: without governance, two people can build the same "conversion rate" with different filters and reach conflicting conclusions in the same meeting. I\'d recommend opening self-serve on a curated, certified layer of pre-built metrics and dimensions rather than raw tables, so speed doesn\'t come at the cost of everyone getting a different number.',
      senior: 'The failure mode isn\'t "stakeholders write bad SQL" — it\'s that a semantic layer with unclear ownership lets the same metric name mean different things in different dashboards, and nobody notices until an exec compares two reports side by side. I\'d build a certified metrics layer (LookML or dbt models) with one definition per metric, expose that to self-serve users, and keep raw/exploratory access gated behind a request process with an analyst pairing session. That preserves speed for 90% of questions while keeping a human in the loop for the ambiguous 10%.',
      staff: 'This is really an org-design question dressed up as a tooling question. Full self-serve without governance creates false confidence — people make real decisions off numbers nobody validated. Full gatekeeping creates a bottleneck that pushes stakeholders toward ad hoc spreadsheet pulls, which is worse than either extreme because it\'s invisible. I\'d propose a tiered model: certified metrics are self-serve with no analyst in the loop, exploratory analysis requires a lightweight intake form and an analyst point of contact, and anything feeding an external or board-level report requires sign-off. The right split shifts over time as the semantic layer matures — revisit it quarterly rather than treating it as a permanent policy.',
    },
  },

  {
    id: 'qa28',
    category: 'BI',
    difficulty: 'senior',
    isFree: false,
    question: 'Marketing\'s dashboard shows "conversion rate" at 4.2%. Product\'s dashboard shows "conversion rate" at 6.8%. Both claim to measure the same thing. How do you resolve it?',
    context: 'Both dashboards pull from the same underlying event data but were built by different teams a year apart.',
    tags: ['metric-drift', 'dashboard-design', 'data-governance'],
    answers: {
      analyst: 'Trace both dashboards back to their SQL or LookML definitions and compare denominators and numerators line by line. The most common cause is a different denominator — one dashboard might use sessions, the other unique users, or one includes bot traffic filtering and the other doesn\'t. Document the difference and decide which definition is correct going forward.',
      senior: 'Beyond denominator mismatches, check three things: the date logic (session-start date vs. conversion date — a user who converts three days after their session gets counted in different periods depending on which anchor is used), the population filter (does one dashboard exclude internal/QA traffic and the other doesn\'t), and the conversion event definition itself (does "conversion" mean checkout-started or payment-confirmed in each dashboard). A 2.6-point gap this large is almost always more than one of these stacked together, not a single rounding difference.',
      staff: 'The immediate fix is picking one canonical definition and repointing both dashboards to it, but the real problem is that two teams built the same metric independently with no shared source of truth — that\'s a governance gap, not a one-time bug. I\'d propose a metrics registry: one place where "conversion rate" is defined once, with an owner, and every dashboard that shows it links to that definition rather than re-deriving it. I\'d also flag this discrepancy in the next cross-functional metrics review so both teams understand which number to trust in the interim, rather than each silently believing their own dashboard is right.',
    },
  },

  {
    id: 'qa29',
    category: 'BI',
    difficulty: 'staff',
    isFree: false,
    question: 'Your dashboard shows overall retention improved this quarter, but every individual cohort\'s retention is flat or down. How is that possible, and what do you tell leadership?',
    context: 'The blended weekly retention metric on the exec dashboard rose from 34% to 37%, but cohort-level retention by signup month looks unchanged or slightly worse in every cohort.',
    tags: ['simpsons-paradox', 'dashboard-design', 'aggregate-metrics'],
    answers: {
      analyst: 'This is very likely a mix-shift: if a larger share of this quarter\'s users came from a cohort that has historically higher retention (e.g., an acquisition channel shift toward higher-intent users), the blended average rises even though no individual cohort improved. I\'d check the cohort size weights before and after and confirm the composition changed.',
      senior: 'This is a textbook Simpson\'s paradox — the aggregate trend reverses the direction of every subgroup because the subgroup weights shifted. The fix isn\'t just noting it happened; it\'s building the dashboard so it can\'t mislead again. I\'d add a cohort-weighted view alongside the blended metric, and I\'d flag any aggregate metric with more than two meaningfully different subpopulations as a candidate for this failure mode — anywhere acquisition mix, plan tier, or geography changes over time is a place blended averages should be treated with suspicion by default.',
      staff: 'The dashboard didn\'t lie technically, but it told a story that\'s false in the way that matters to a leadership decision — "retention improved" implies the product is retaining users better, when actually the product is retaining every cohort the same or worse, and only the composition of who\'s arriving changed. If leadership acts on the aggregate number by declaring the retention initiative a success, that\'s a real, costly error. I\'d go to the review with both numbers side by side and lead with the cohort view, not the blended one: "the topline number improved, but that\'s fully explained by acquisition mix — every cohort\'s underlying retention is flat to down, so the retention initiative itself hasn\'t moved the needle yet." I\'d also propose a standing rule that any metric feeding a leadership scorecard gets a mix-shift check before it\'s presented as a trend.',
    },
  },

  {
    id: 'qa30',
    category: 'BI',
    difficulty: 'analyst',
    isFree: false,
    question: 'You\'ve set up automated alerts for a 10% drop in key metrics, but the team is getting paged every few days for noise. How do you redesign the alerting?',
    context: 'The alerting system fires on any day-over-day 10% move in DAU, signups, or revenue. Most alerts turn out to be normal daily variance.',
    tags: ['alerting', 'dashboard-design', 'anomaly-detection'],
    answers: {
      analyst: 'A flat percentage threshold ignores that metrics have different natural volatility — a metric that normally swings 8% day-to-day will alert constantly at a 10% threshold, while a stable metric with 2% typical noise should alert well before 10%. I\'d calculate each metric\'s historical standard deviation and set thresholds in standard-deviation terms (e.g., alert at 3 sigma) rather than a single flat percentage for everything.',
      senior: 'Beyond per-metric thresholds, day-of-week and seasonal patterns matter — a metric that\'s naturally 15% lower every Monday shouldn\'t fire against a naive day-over-day comparison; compare against the same day last week or a seasonally adjusted baseline instead. I\'d also add a persistence requirement — a metric that dips for one hour and recovers is noise, but a dip sustained for 3+ hours is signal — so the alert fires on sustained deviation, not on any single data point crossing a line.',
      staff: 'Alert fatigue is a slower-moving incident than any single false alarm — once the team learns to ignore pages, a real regression will sit unactioned exactly when it matters most. I\'d redesign around expected cost of a missed real incident versus cost of a false page, and tune thresholds asymmetrically per metric based on that cost, not a uniform policy. I\'d also add alert tiering: a "page someone now" tier reserved for metrics with immediate revenue or safety impact, and a "surface on the daily digest" tier for softer signals that deserve attention but not a 2am wake-up. The measure of success for an alerting system isn\'t how many things it catches — it\'s whether the on-call engineer still trusts it after three months.',
    },
  },

  {
    id: 'qa31',
    category: 'BI',
    difficulty: 'senior',
    isFree: false,
    question: 'How would you design a dashboard differently for a VP versus for the operations team running day-to-day campaigns?',
    context: 'You\'re asked to build "one dashboard" that serves both a VP\'s monthly review and the campaign team\'s daily optimization work.',
    tags: ['dashboard-design', 'stakeholder', 'executive-reporting'],
    answers: {
      analyst: 'These are two different jobs and usually need two different dashboards, not one. The VP needs a small number of trended, contextualized metrics — is the program on track versus target, quarter over quarter. The operations team needs granular, near-real-time, sliceable data — campaign-level, creative-level, hour-level — to make tactical adjustments. Trying to serve both from one view usually means the exec gets overwhelmed with detail or the operator doesn\'t get enough granularity to act.',
      senior: 'The underlying design difference is refresh cadence and level of aggregation, and conflating them causes real problems: a VP dashboard refreshed hourly with unsmoothed data will show noisy swings that look like signal in a monthly review, and an operations dashboard that only updates daily is useless for same-day bid adjustments. I\'d build the operational dashboard first, near-real-time and deeply sliceable, and derive the executive view from it as a rolled-up, smoothed, benchmarked summary — so there\'s one source of truth underneath two different presentation layers rather than two independently-built pipelines that can drift apart.',
      staff: 'The real risk in a shared dashboard isn\'t just usability — it\'s that the VP starts making strategic calls off noisy operational data, or the operations team starts optimizing for whatever the VP\'s summary metric rewards even when it\'s the wrong lever at the tactical level. I\'d design the two views to share the same underlying certified data model but present at deliberately different levels of aggregation and confidence — the exec view should visually communicate uncertainty (trend bands, not point estimates) so a VP doesn\'t overreact to a single week\'s dip, while the operations view should expose the granularity needed to actually diagnose and act on that dip before it becomes a trend worth an exec\'s attention.',
    },
  },

  {
    id: 'qa32',
    category: 'BI',
    difficulty: 'analyst',
    isFree: false,
    question: 'Your company has 400 Looker dashboards and nobody knows which ones are still used. How do you approach cleaning this up?',
    context: 'New analysts keep building dashboards instead of finding existing ones, because search and ownership are unclear.',
    tags: ['dashboard-design', 'data-governance', 'dashboard-sprawl'],
    answers: {
      analyst: 'Start with usage data — most BI tools log view counts and last-viewed dates. Anything with zero views in 90 days is a strong deprecation candidate. Before deleting, message the last-known owner or team to confirm it\'s safe to archive rather than delete outright, since some dashboards are used rarely but for important quarterly reviews.',
      senior: 'Usage logs alone will over-flag some real dashboards (quarterly-only views look "unused" on a 90-day window) and under-flag others (a dashboard embedded in an email digest might show low direct views but drive real decisions downstream). I\'d combine view logs with a lightweight owner-confirmation sweep, and separately look for duplicate dashboards answering the same question — those are the highest-value consolidation target because they\'re also the ones most likely to have silently drifted into different metric definitions.',
      staff: '400 dashboards with unclear ownership is a symptom of no dashboard creation process, and cleanup without fixing the intake process just resets the clock on the same problem. I\'d pair the cleanup with a going-forward policy: new dashboard requests get checked against an existing-dashboard search first, every dashboard gets a named owner and a review cadence, and dashboards past a staleness threshold get auto-flagged for owner confirmation rather than analysts manually auditing 400 of them. The cleanup itself should be treated as a one-time cost to buy the org the right to enforce a lighter-weight process afterward, not as an annual chore.',
    },
  },

  {
    id: 'qa33',
    category: 'BI',
    difficulty: 'senior',
    isFree: false,
    question: 'A metric on your dashboard is a daily count in the low hundreds and swings 30-40% day to day, making the trend line look like noise. How do you present it?',
    context: 'A B2B enterprise product has a small daily active seat count. Leadership keeps reacting to single-day swings that turn out to be meaningless.',
    tags: ['dashboard-design', 'noisy-metrics', 'small-sample'],
    answers: {
      analyst: 'Add a rolling 7-day or 28-day average line alongside the raw daily number, and default the chart view to the smoothed line rather than the raw daily points. For a metric this small, day-of-week effects (fewer logins on weekends for a B2B tool) are a large share of the apparent noise and a weekly rolling window absorbs that automatically.',
      senior: 'Smoothing helps but can also hide real step-changes if the window is too wide — a 28-day average will take weeks to reflect a genuine regression. I\'d choose the smoothing window based on the metric\'s natural cycle (weekly for B2B seat activity) and pair it with a control-chart-style band (e.g., ±2 standard deviations around the trailing average) so a data point outside the band is visually flagged as worth investigating, while points inside it are visually deprioritized as expected noise.',
      staff: 'The deeper fix is changing what leadership is trained to look at, not just what the chart shows — if the dashboard\'s default view is a jagged daily line, people will react to jaggedness regardless of what smoothed line sits next to it. I\'d redesign the default view to lead with the smoothed trend and the control band, move the raw daily points to a secondary toggle for analysts who want to investigate a specific day, and include one line of guidance text on the dashboard itself ("day-to-day swings of ±35% are normal for this metric; only investigate if it\'s outside the shaded band") so the interpretation travels with the data instead of depending on someone remembering it in the room.',
    },
  },

  {
    id: 'qa34',
    category: 'BI',
    difficulty: 'analyst',
    isFree: false,
    question: 'A stakeholder asks for a dashboard to refresh in real time instead of once a day. What do you consider before agreeing?',
    context: 'The current pipeline refreshes overnight. The stakeholder wants sub-hourly updates for a customer support operations dashboard.',
    tags: ['dashboard-design', 'data-pipeline', 'real-time-reporting'],
    answers: {
      analyst: 'Real-time refresh has real infrastructure cost — it usually means moving from a batch warehouse job to a streaming or micro-batch pipeline, which is more expensive to build and maintain. Before committing, I\'d ask what decision needs sub-hourly data: if support staffing decisions are made hourly, real-time is justified; if it\'s just a preference for "fresher data" without a specific action tied to the cadence, daily refresh with a same-day option may be enough.',
      senior: 'The tradeoff isn\'t just cost — it\'s also correctness. Real-time pipelines are more prone to showing partial or in-flight data (a ticket that\'s mid-resolution, a metric computed before all of a day\'s records have landed), and a stakeholder unfamiliar with that caveat will misread a partial number as final. If I build a real-time view, I\'d pair it with a clear "provisional, subject to revision" label and reconcile it against the batch number each morning so discrepancies get caught rather than silently trusted.',
      staff: 'I\'d push the conversation toward what operational lever actually changes at hourly resolution — support staffing reallocation, escalation triggers, queue rebalancing — because that\'s what justifies the added infrastructure and data-quality complexity of real-time. If the honest answer is "it would just be nice to watch it move," daily refresh with an on-demand manual refresh button solves the actual need at a fraction of the engineering cost. If the answer is a genuine operational trigger, I\'d scope real-time to just the specific metrics that trigger action, not migrate the whole dashboard, since most of the other metrics on it don\'t need the same freshness and inherit unnecessary pipeline risk if bundled in.',
    },
  },

  // ─── Instrumentation ────────────────────────────────────────────────────────

  {
    id: 'qa26',
    category: 'Instrumentation',
    difficulty: 'senior',
    isFree: false,
    question: 'A new feature is shipping next week. What tracking plan do you put in place?',
    context: 'A new in-app messaging feature is launching. You have one week to instrument it.',
    tags: ['tracking-plan', 'instrumentation', 'event-taxonomy'],
    answers: {
      analyst: 'Define the events that cover the core user journey: message_thread_opened, message_sent, message_read, message_replied, thread_archived. Each event needs properties: user_id, thread_id, recipient_count, message_length_bucket. Also track feature_discovered (first open) and feature_returned (returning use) to separate novelty from habit.',
      senior: 'Structure the tracking around questions you\'ll need to answer, not just the user journey. Questions: adoption (what % of users opened it?), engagement (how many messages sent per active user?), effectiveness (did messages get replies?), retention impact (do messaging users retain better?). Map each question to the events and properties needed to answer it. Missing a property on launch means you can\'t answer the question retroactively. Also instrument the failure states: message_send_failed, message_load_timeout — these are the events that tell you when the feature is broken before users stop using it.',
      staff: 'Instrumentation is a product decision, not a data collection task. The events you track shape the product roadmap — if you can\'t measure something, it effectively doesn\'t exist in the next planning cycle. Before finalizing the tracking plan, I\'d align with the PM on the success criteria for the feature: what does "working" look like at 30 days? Work backwards from those success criteria to the events and properties needed. Also think about the downstream consumers: if ML will use these events for personalization, you need more precision in properties (exact timestamp, session context). If it\'s for reporting only, lighter instrumentation is fine. Don\'t over-instrument — every event you log is an event your data team needs to maintain, validate, and clean.',
    },
  },

  {
    id: 'qa35',
    category: 'Instrumentation',
    difficulty: 'analyst',
    isFree: true,
    question: 'Two teams have each created an event called "item_viewed" with slightly different meanings. How do you prevent this going forward?',
    context: 'Team A fires "item_viewed" when a product card renders in a list. Team B fires the same event name when a full product detail page loads. Analysts building cross-team reports get inconsistent numbers.',
    tags: ['event-taxonomy', 'tracking-plan', 'data-governance'],
    answers: {
      analyst: 'Rename both events to be unambiguous — item_card_impression and item_detail_viewed — and document the distinction in a shared tracking plan that every team references before adding new events. Going forward, require a lightweight review step where a new event name is checked against the existing taxonomy before it ships.',
      senior: 'The root cause is that there\'s no single owner of the event taxonomy, so two teams solved the same naming problem independently and collided. I\'d establish a tracking plan as a living, version-controlled document (not a wiki page nobody checks) with a required naming convention — object_action, e.g. item_viewed_card vs item_viewed_detail — and a lightweight PR-style review for any new top-level event name, so collisions get caught before they ship rather than after months of divergent data.',
      staff: 'Fixing this one collision doesn\'t fix the incentive structure that created it — teams that ship fast will keep skipping taxonomy review unless there\'s a low-friction way to do it. I\'d build a shared events registry integrated into the team\'s actual shipping workflow (e.g., a schema check in CI that flags a new event name close to an existing one, rather than a manual review meeting), and assign a rotating data governance owner across teams so no single team feels ownership burden alone. The measure of success is that the next naming collision gets caught by tooling before it ships, not found six months later by an analyst comparing dashboards.',
    },
  },

  {
    id: 'qa36',
    category: 'Instrumentation',
    difficulty: 'senior',
    isFree: false,
    question: 'You need to add a new property to an existing event that\'s already being used in dozens of dashboards and pipelines. How do you roll out the change safely?',
    context: 'The "checkout_completed" event needs a new "payment_method" property, and its meaning will also change slightly — a related existing property, "discount_applied", needs to become a structured object instead of a boolean.',
    tags: ['schema-evolution', 'tracking-plan', 'versioning'],
    answers: {
      analyst: 'Adding a new, optional property is low-risk — it can be additive and backward-compatible, since existing consumers simply ignore fields they don\'t use. Changing the type of "discount_applied" from boolean to an object is a breaking change, though, and needs a versioning strategy: emit both the old boolean and the new object for a transition period, or version the event itself (checkout_completed_v2) so downstream consumers can migrate on their own timeline.',
      senior: 'I\'d treat the additive change and the breaking change very differently in rollout plan. The new property ships immediately with no coordination needed. The breaking change needs an audit of every downstream consumer of "discount_applied" first — dashboards, ML features, and any alerting logic — because silently changing a boolean to an object will make existing SQL casts fail or return nulls without an obvious error. I\'d dual-write both the legacy boolean and the new structured field for a deprecation window (30-60 days), notify all known consumers with a hard cutover date, and only remove the legacy field once usage logs show it\'s no longer queried.',
      staff: 'The core discipline here is separating "can I make this change" from "can I make this change without anyone finding out weeks later that their numbers are wrong." I\'d formalize this as a schema versioning policy for the whole tracking plan: every event has a schema version, breaking changes always create a new version rather than mutating the old one in place, and there\'s a standard deprecation SLA (e.g., 60 days dual-write, then sunset) that every team follows rather than negotiating case by case. That predictability is what actually prevents an analyst from discovering three months later that a dashboard silently started returning nulls.',
    },
  },

  {
    id: 'qa37',
    category: 'Instrumentation',
    difficulty: 'analyst',
    isFree: false,
    question: 'Should a purchase confirmation event be tracked client-side or server-side?',
    context: 'The team currently fires "purchase_completed" from the client (mobile app) immediately after checkout, but has noticed the count doesn\'t match the payment processor\'s transaction count.',
    tags: ['client-side-tracking', 'server-side-tracking', 'data-quality'],
    answers: {
      analyst: 'Purchase confirmation should be tracked server-side, not client-side, because it\'s a business-critical, financial event. Client-side tracking is vulnerable to the app crashing after payment succeeds but before the event fires, ad blockers or privacy settings dropping the call, and network failures losing the event entirely — all of which would undercount real purchases.',
      senior: 'The mismatch against the payment processor\'s count is exactly the signature of client-side loss: any point of failure between "payment succeeded" and "client fires the event" silently drops data, and it tends to correlate with exactly the users you care about most — those on poor network connections or older devices, meaning the loss isn\'t random. I\'d move the source-of-truth event to fire server-side, right where the payment is confirmed, and keep the client-side event only for UX-layer signals like "confirmation screen rendered," which is a genuinely different (and legitimately client-only) fact from "payment succeeded."',
      staff: 'The general principle is that anything tied to money, compliance, or a downstream financial reconciliation should never depend on a client successfully executing code — the client is the least reliable point in the whole system to treat as a source of truth. I\'d audit every other event currently tracked client-side for whether it\'s used in a financial, contractual, or compliance context (billing triggers, revenue recognition, refund eligibility) and migrate all of those to server-side, while keeping genuinely client-only signals (button hover, scroll depth) where they are, since duplicating everything server-side unnecessarily adds infrastructure cost without a real benefit.',
    },
  },

  {
    id: 'qa38',
    category: 'Instrumentation',
    difficulty: 'senior',
    isFree: false,
    question: 'You discover that a "search_performed" event has been logging the full raw search query text, including instances where users searched their own email address or phone number, for the past year. What do you do?',
    context: 'This surfaces during a routine data audit ahead of a compliance review. The raw query field feeds several analytics dashboards and a search-ranking ML model.',
    tags: ['pii', 'data-privacy', 'compliance', 'instrumentation'],
    answers: {
      analyst: 'This needs to be flagged to the privacy/legal team immediately rather than fixed quietly, since it may be a reportable data handling issue depending on jurisdiction. Going forward, stop logging raw query text or apply PII detection/redaction (email and phone regex patterns at minimum) before the event is stored, and check whether the ML model and dashboards actually need raw text or could work off a hashed or categorized version.',
      senior: 'Beyond the immediate fix, I\'d scope the retroactive exposure precisely: how many records contain PII, how long has this been happening, who has access to the raw table, and has this data left the primary warehouse (exports, BI extracts, model training snapshots)? The compliance team needs that scoping to determine reporting obligations, and it\'s a very different conversation if 50 rows are affected in a locked-down warehouse versus millions of rows that were exported into a less-controlled analytics tool six months ago. I\'d also propose a redaction pipeline that runs PII detection at ingestion, before the event ever lands in a queryable table, rather than relying on downstream cleanup.',
      staff: 'The instrumentation bug itself is fixable in a day; what actually matters is that this got into production instrumentation without anyone questioning whether a free-text field should be logged raw in the first place — that\'s a process gap, not just a one-off mistake. I\'d push for a standing rule that any new event with free-text or user-generated-content fields requires an explicit privacy review before it ships, not an audit that catches it a year later. I\'d also make sure the retroactive remediation plan (redacting or purging historical records) is owned jointly with legal, since "delete it" and "we\'re required to retain it for X reason" can conflict, and an analyst unilaterally purging data ahead of a compliance review can create its own problems.',
    },
  },

  {
    id: 'qa39',
    category: 'Instrumentation',
    difficulty: 'analyst',
    isFree: false,
    question: 'Your signup funnel dashboard suddenly shows a 40% conversion rate between step 2 and step 3, up from a stable 18%. What\'s your first hypothesis and how do you check it?',
    context: 'No product change shipped in that window. The funnel is built from event counts at each step.',
    tags: ['instrumentation', 'funnel-debugging', 'duplicate-events'],
    answers: {
      analyst: 'A sudden, large jump with no product change is more likely an instrumentation issue than a real behavior change — most likely a missing or under-firing event at an earlier step (deflating the step-2 denominator) or a duplicated event at the later step (inflating the step-3 numerator). I\'d check raw event counts for both steps directly, independent of the funnel dashboard\'s logic, to see whether the change is in the numerator or denominator.',
      senior: 'I\'d specifically check for a recent SDK or app version release, since duplicate-fire bugs are commonly introduced by a client update that causes an event to fire twice (e.g., a retry-on-failure that doesn\'t check whether the original call actually failed, or an event fired on both a screen mount and a subsequent re-render). I\'d segment the funnel by app version — if the anomaly is concentrated in users on the newest client version, that\'s strong confirmation of a client-side duplication bug rather than a real behavioral shift.',
      staff: 'The instinct to distrust a sudden, implausibly large jump is the important skill here — a real behavioral shift of that magnitude with no known cause is rare, while a tracking bug producing exactly that signature is common. Once confirmed as duplication, I\'d quantify how long it\'s been happening and correct any downstream reporting or decisions that used the inflated number (a PM might have already told leadership "conversion is up 22 points"), and I\'d add a lightweight automated check — a daily job that flags any funnel step conversion rate outside its historical 3-sigma range — so a bug like this surfaces the next morning instead of whenever someone happens to look at the dashboard.',
    },
  },

  {
    id: 'qa40',
    category: 'Instrumentation',
    difficulty: 'senior',
    isFree: false,
    question: 'A high-frequency event (video buffering, fired every 500ms during playback) is overwhelming your event pipeline. How would you handle it?',
    context: 'The event volume from this single event type is 10x every other event combined and is driving up both pipeline cost and query latency for unrelated analysis.',
    tags: ['event-sampling', 'high-volume-events', 'data-pipeline'],
    answers: {
      analyst: 'Sampling is reasonable here since individual buffering ticks aren\'t independently meaningful — what matters is the aggregate pattern (total buffering time, buffering frequency per session), not each 500ms data point. I\'d sample at a fixed rate (e.g., log 1 in 10 events) and scale up the counts in analysis, while making sure the sampling is applied consistently and randomly, not in a way that biases toward or against any user segment.',
      senior: 'Fixed-rate sampling on the raw tick event is the right instinct, but I\'d push the aggregation further upstream — compute buffering duration and event count client-side over a rolling window and emit one summarized event per playback session (e.g., "session_playback_summary" with total_buffer_ms, buffer_event_count) instead of sampling the raw stream at all. This is both cheaper and more accurate than sampling, since sampling introduces variance into rare-but-important cases like a session with sustained buffering that a 1-in-10 sample might undercount.',
      staff: 'The decision to sample versus pre-aggregate depends on what the downstream consumer actually needs: if any future use case requires reconstructing exact playback timelines (debugging a specific user\'s session, or an ML model needing sequence data), sampling destroys information you can\'t recover later, so I\'d keep a small unsampled slice (e.g., 1% of full sessions logged in full detail) purely for that purpose while aggregating the rest. I\'d also treat this as a signal to formalize a sampling and aggregation policy for high-volume events generally, so the next high-frequency event type doesn\'t independently reinvent this decision under pipeline-cost pressure.',
    },
  },

  {
    id: 'qa41',
    category: 'Instrumentation',
    difficulty: 'senior',
    isFree: false,
    question: 'You discover that an event has been silently failing to fire for 15% of Android users for the past 6 weeks due to an SDK bug. Do you backfill the data, and how?',
    context: 'The affected event feeds a core retention metric that\'s reported weekly to leadership. The bug has just been fixed in a new app release.',
    tags: ['backfill', 'data-quality', 'instrumentation'],
    answers: {
      analyst: 'True backfill (recreating the missing events) usually isn\'t possible if the underlying user action was never captured anywhere else — you can\'t retroactively know something that was never logged. What you can do is annotate the affected 6-week window in every downstream dashboard and report with a data-quality flag, and if another system (server logs, a different event) captured a proxy for the same behavior, use that to estimate the true numbers for the affected period.',
      senior: 'I\'d first quantify the impact precisely — which specific metrics were affected, and by how much, by comparing affected-cohort behavior against a non-affected control (iOS users, or the subset of Android users on unaffected SDK versions) to estimate the true underlying rate during the gap. That gives leadership a corrected estimate for the 6-week window even without literal backfilled events. Going forward, any historical trend chart spanning that window needs an annotation explaining the dip is a known data quality issue, not a real behavioral change, otherwise someone will misdiagnose it in a future RCA.',
      staff: 'The most important thing here isn\'t the backfill methodology — it\'s making sure the correction actually reaches the leadership report before the next weekly review, since a 15% undercount on a core retention metric is large enough to have already driven a wrong conclusion if it went unflagged. I\'d proactively notify whoever owns that report with a clear, non-technical explanation ("retention looked artificially low for 6 weeks due to a tracking bug on Android, corrected estimate is X, no product action needed") rather than waiting to be asked. I\'d also use this incident to argue for a standing data-quality monitoring job that compares event volume against expected baselines by platform, so a 15% silent drop on one platform gets caught in days, not six weeks.',
    },
  },

  {
    id: 'qa42',
    category: 'Instrumentation',
    difficulty: 'analyst',
    isFree: false,
    question: 'Marketing wants to add three new third-party marketing pixels to the site via a tag manager, without going through your team\'s usual event review. What\'s your concern?',
    context: 'The pixels are for ad platform conversion tracking and are typically added directly through the tag manager UI by the marketing team, bypassing the engineering-reviewed tracking plan.',
    tags: ['third-party-tracking', 'tag-manager', 'data-governance'],
    answers: {
      analyst: 'Tag-manager-injected pixels bypass your team\'s usual review, which means you lose visibility into what data is being sent to third parties and can\'t verify it against privacy requirements. I\'d ask marketing to loop in the data or privacy team before adding any pixel that reads page or user data, even though the tag manager makes it technically easy to skip that step.',
      senior: 'Beyond the privacy concern, third-party pixels loaded via tag manager are a common source of page performance regressions and can silently break other tracking if they inject conflicting cookies or overwrite shared data-layer variables. I\'d ask for a standard checklist before any new pixel goes live: what data does it read from the page, does it match what\'s disclosed in the privacy policy and consent banner, and has it been tested in a staging environment for performance and conflict with existing tags. Tag managers make this too easy to skip, which is exactly why the process needs to be enforced through tooling (a review gate before publish) rather than a policy people are expected to remember.',
      staff: 'The tag manager\'s ease of use is precisely the risk — it was built to let non-engineers ship tracking changes without a deploy, which is valuable for velocity but removes the natural review checkpoint that used to happen via a pull request. I\'d propose a lightweight but mandatory gate specifically for the tag manager (a pre-publish review queue routed to the privacy and data teams, not a full engineering review) so marketing keeps their speed advantage but a human still checks for compliance and data-quality issues before anything goes live. I\'d frame this to marketing as protecting their own program, too — an undisclosed pixel found during a compliance audit is a bigger velocity hit than a same-day review would ever be.',
    },
  },

];
