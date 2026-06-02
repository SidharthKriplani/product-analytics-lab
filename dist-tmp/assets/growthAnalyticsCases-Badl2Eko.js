var e=[{id:`GA01`,title:`DAU Dropped 8% — What's Driving It?`,subtitle:`Prism · Video App · Growth Accounting`,difficulty:`analyst`,isFree:!0,domain:`growth-accounting`,company:`Prism`,tags:[`dau`,`growth-accounting`,`retention`,`diagnosis`],companies:[`Meta`,`Snapchat`,`Twitter`],situation:`Prism is a short-form video app with 2.4M daily active users. Over the past four weeks, DAU has declined steadily to 2.2M — a drop of roughly 8.3%. Leadership is alarmed.

Here is what the data shows for the past four weeks:
- New users per week: stable at ~45,000
- Reactivated users per week (churned users returning): stable at ~12,000
- Weekly retention rate (users active last week who returned this week): dropped from 68% → 58%
- Current retained user base contributing to DAU: declining as a result

The CEO suspects the problem is acquisition. He argues: "Our marketing spend is flat, our install numbers are weak compared to last quarter, and that's why we're losing DAU." He wants to double the paid acquisition budget immediately.

The head of product disagrees and thinks it's a product engagement issue. She wants to run a full audit of the core loop before spending more on acquisition.

You are the lead data analyst. You need to diagnose what is actually driving the DAU decline before the budget meeting tomorrow.`,prompt:`Walk through your diagnosis using the growth accounting identity. Show your calculations. Who is right — the CEO or the head of product?`,frameworkSteps:[`Step 1 — State the growth accounting identity: DAU_today = Retained users + New users + Reactivated users. Every DAU movement can be decomposed into these three buckets.`,`Step 2 — Establish a baseline: At 2.4M DAU with 68% weekly retention, ~1.632M of today's DAU came from retained users, ~45k from new, ~12k from reactivated.`,`Step 3 — Apply the new retention rate: At 58% retention (same base), retained users would be ~1.392M. Compute implied DAU under new retention vs old retention.`,`Step 4 — Isolate the retention impact: Calculate the DAU gap attributable purely to the retention drop. Compare to the actual observed DAU drop.`,`Step 5 — Evaluate the acquisition hypothesis: New users are stable at 45k/week. Ask: could flat new users explain a 200k DAU drop? Run the math.`,`Step 6 — Render the diagnosis: Attribute the decline to its source and state which lever to pull.`],hints:[`Growth accounting: DAU = retained + new + reactivated. The DAU drop must come from one of these three levers.`,`Retention dropping from 68% → 58% is a 10 percentage point fall. Apply that to the retained user base (roughly 1.6M at peak) to estimate the impact.`,`New users are flat at 45k/week. If acquisition were the problem, you'd expect new users to have dropped, not retention.`,`Reactivated users are also stable at 12k/week — so reactivation isn't the issue either.`,`The math: 1,600,000 × (0.68 − 0.58) = 160,000 fewer retained users per day. That alone explains most of the 200k DAU drop.`],modelAnswer:{walkthrough:`The growth accounting identity is: DAU_today = Retained users + New users + Reactivated users.

Let's establish the baseline at peak DAU (2.4M):
- At 68% weekly retention and ~2.4M DAU, the retained component is approximately 2.4M × 0.68 = 1,632,000 users per day (rough approximation — the DAU base feeding into next day's retention).
- New users: ~45,000/week ÷ 7 ≈ 6,400/day
- Reactivated users: ~12,000/week ÷ 7 ≈ 1,700/day
- Together: 1,632,000 + 6,400 + 1,700 ≈ 1,640,100 (this models the next day's DAU, which in steady state equals today's DAU — so the retained base is the dominant lever)

Now apply the retention drop: 68% → 58%, a 10pp decline.

Impact of retention drop on the retained component:
1,632,000 × (0.68 − 0.58) / 0.68 × 0.68 — simplified: the retained pool shrinks by approximately 1,632,000 × (10/68) ≈ 240,000 users/day if we apply the rate to the same active base. A cleaner estimate: if 2.4M users were active, and 68% returned = 1,632,000 vs 58% returned = 1,392,000, that's a gap of 240,000 retained users.

The observed DAU drop is 2.4M → 2.2M = 200,000.

The retention-driven shortfall (240k) more than explains the 200k DAU drop. New users are flat at 45k/week. If acquisition were the culprit, we'd expect new user installs to have fallen — they haven't. Reactivation is also flat.

Conclusion: The CEO is wrong. Doubling acquisition spend would add ~45k new users/week, but with only 58% weekly retention those users will churn quickly, generating perhaps 26k retained DAU per week from new users — not nearly enough to offset the structural retention leak. The head of product is right: this is a retention/engagement problem. Fix the core product loop first, then scale acquisition into a product that can hold users.

The next investigative step: segment retention by cohort, feature usage, and platform (iOS vs Android) to identify what changed 4–5 weeks ago. Look for product changes, algorithm changes, or content supply shifts that coincide with the retention inflection.`,keyDiagnosis:`Retention regression (68% → 58%) explains the entire DAU drop. New user acquisition is stable and not the cause.`,recommendation:`Do not increase acquisition spend. Audit the product engagement loop — look for what changed 4–5 weeks ago in content quality, recommendations, or the core loop. Fix retention first, then scale acquisition.`},keyTakeaways:[`Growth accounting decomposes DAU into three levers: retained, new, reactivated. A DAU drop must come from one of them — start there before hypothesizing.`,`Flat new users rules out acquisition as the cause. The CEO's hypothesis fails the first data check.`,`Pouring acquisition spend into a leaky retention bucket is one of the most common and costly mistakes in growth — you buy users at CAC only to lose them in days.`],playbookLinks:[{id:`growth-accounting`,label:`Growth Accounting`},{id:`cohort-retention-curves`,label:`Cohort Retention`}],leadershipNote:`A Staff DS would not wait for a stakeholder to ask this question — they would have a recurring DAU decomposition report running weekly with automated alerts on any component moving more than 2pp. The leadership skill is building the measurement infrastructure before the crisis, not diagnosing it after.`,failureMode:{weakAnswer:`The candidate sides with the CEO — acquisition is flat so that must be hurting DAU — without doing any math. They propose doubling the paid acquisition budget, never applying the growth accounting identity to show that new users are stable at 45k/week and cannot explain a 200k DAU drop when retention is the collapsing component.`,interviewerFollowUp:`"Show me the math: if you double acquisition budget and new users rise from 45k to 90k per week while weekly retention stays at 58%, how many additional retained DAU does that generate — and how does that compare to the 200k gap you're trying to close?"`}},{id:`GA02`,title:`Stickiness Fell From 22% to 18% — Engagement Problem?`,subtitle:`Crafted Marketplace · Consumer Marketplace · Engagement`,difficulty:`senior`,isFree:!0,domain:`engagement`,company:`Crafted Marketplace`,tags:[`dau-mau`,`stickiness`,`mix-shift`,`segmentation`,`paid-acquisition`],companies:[`Slack`,`Discord`,`WhatsApp`],situation:`Crafted Marketplace is a B2C e-commerce platform for handmade goods. Over the past six weeks, the product team has been tracking a key engagement metric: DAU/MAU ratio (stickiness). It has declined from 22% to 18%.

Here is the underlying data:
- Overall MAU: grew from 1.8M → 2.4M (+33%)
- Power users (≥5 sessions/month): DAU/MAU ratio stable at 38%. This segment grew slightly from 620k → 660k users.
- Casual users (1–2 sessions/month): grew from 400k → 680k users (driven almost entirely by a paid social campaign that ran for 5 weeks)
- Casual user DAU/MAU ratio: stable at ~8–9% (these users visit rarely by definition)

The paid marketing team ran a campaign that acquired 280k net new users over the 6-week period. The campaign was declared a success because MAU grew 33% and conversion from first visit to signup improved.

The VP of Product is now demanding a full engagement initiative — she wants to redesign the core loop, run A/B tests on the homepage, and consider adding a notification system to "pull users back in." The estimated cost: 2 months of engineering effort.

You are the senior analyst. Your job is to evaluate whether the stickiness decline represents a real product engagement problem before the VP commits the team's roadmap.`,prompt:`Diagnose whether the DAU/MAU decline reflects real engagement degradation or a statistical artifact. Show the math. What should the VP do?`,frameworkSteps:[`Step 1 — Decompose the aggregate DAU/MAU ratio by user segment. DAU/MAU is a weighted average across all user types.`,`Step 2 — Hold segment-level ratios constant and model what the aggregate ratio would be under the old vs new user mix.`,`Step 3 — Identify whether the ratio moved within a segment (true engagement change) or whether the user mix shifted (composition effect).`,`Step 4 — Compute the expected DAU/MAU under the new mix if each segment's ratio stayed constant.`,`Step 5 — Compare expected vs actual aggregate ratio to determine how much of the change is explained by mix shift alone.`,`Step 6 — Render a diagnosis and a recommendation on the VP's proposed engagement initiative.`],hints:[`DAU/MAU is a weighted average: (DAU_power + DAU_casual) / (MAU_power + MAU_casual). If you add low-DAU/MAU users, the aggregate ratio falls mechanically.`,`Power users: 660k × 38% = ~251k DAU. Casual users: 680k × 8.5% = ~58k DAU. Total DAU = ~309k. Total MAU = 1.34M. Aggregate DAU/MAU ≈ 23% — close to actual.`,`Model the old mix: 620k power (38%) + 400k casual (8.5%) = 236k + 34k = 270k DAU / 1.02M MAU ≈ 26% (old baseline was 22%, so use the actuals).`,`The key insight: casual users have structurally low stickiness (they visit 1–2 times/month). Adding 280k of them dilutes the aggregate ratio even if the product is unchanged.`,`If power user stickiness is unchanged at 38%, there is no product engagement regression among your best users.`],modelAnswer:{walkthrough:`The DAU/MAU ratio is a weighted average across user segments. To diagnose whether it reflects real engagement regression or mix shift, I'll decompose by segment.

Old state (6 weeks ago):
- Power users (≥5 sessions/month): ~620k MAU, DAU/MAU = 38% → ~236k DAU
- Casual users (1–2 sessions/month): ~400k MAU, DAU/MAU = 8.5% → ~34k DAU
- Other segments (remaining of 1.8M): ~780k MAU, estimated DAU/MAU ~15% → ~117k DAU
- Total: 1.8M MAU, ~387k DAU → aggregate ratio = 21.5% (≈22%)

New state (current):
- Power users: ~660k MAU, DAU/MAU = 38% (unchanged) → ~251k DAU
- Casual users: ~680k MAU, DAU/MAU = 8.5% (unchanged) → ~58k DAU
- Other segments: ~1.06M MAU (residual), DAU/MAU ~15% → ~159k DAU
- Total: 2.4M MAU, ~468k DAU → aggregate ratio = 19.5% (≈18–20%)

Now simulate: what if the mix had shifted but engagement within each segment stayed the same? That's exactly what the model above shows — the ratio would fall from ~22% to ~19–20% purely due to composition, even with zero product regression.

Actual observed ratio: 18%. The model predicts ~19–20%. The 1–2pp residual could be measurement noise, segment boundary effects, or a small real engagement softening that warrants monitoring but not an emergency initiative.

The critical finding: power user stickiness is unchanged at 38%. These are your most valuable users — they drive GMV and referrals. Their engagement has not degraded.

Verdict: The VP's proposed 2-month engagement initiative is not justified by this data. The aggregate DAU/MAU decline is a mix-shift artifact from the paid campaign adding low-stickiness casual users — not a product engagement regression.

Recommendation: (1) Add segment-stratified DAU/MAU to the weekly dashboard so the aggregate metric is not misread. (2) Monitor power user stickiness as the primary engagement KPI. (3) Evaluate the paid campaign on LTV-adjusted CAC, not MAU growth — casual users with 8.5% stickiness likely have low LTV.`,keyDiagnosis:`Mix-shift artifact from paid acquisition of low-stickiness casual users. Power user stickiness (38%) is unchanged — no product regression.`,recommendation:`Do not launch the engagement redesign. Instrument segment-stratified DAU/MAU on the dashboard. Evaluate the paid campaign on LTV:CAC, not headline MAU growth.`},keyTakeaways:[`Aggregate DAU/MAU is a weighted average that falls mechanically when you add low-frequency users — always segment before diagnosing.`,`Mix-shift effects are one of the most common causes of misleading top-line metric moves in growth. Decompose before prescribing.`,`Power user stickiness is usually the right leading indicator for marketplace health — protect and monitor it separately.`],playbookLinks:[{id:`growth-accounting`,label:`Growth Accounting`},{id:`notification-driven-dau`,label:`Notification-Driven DAU`}],leadershipNote:`An Analytics Director would immediately ask: "What is our stickiness target and why?" Before segmenting, they would establish whether the current DAU/MAU is above or below the product's natural cadence. The framing matters: a weekly-use product at 30% is healthy; a daily-use product at 30% is a crisis.`,failureMode:{weakAnswer:`The candidate confirms the VP's concern at face value — "DAU/MAU fell from 22% to 18%, that's a real engagement problem" — and recommends the 2-month core loop redesign without decomposing the ratio by user segment. They treat the aggregate metric as diagnostic rather than asking whether the mix of users in the denominator changed.`,interviewerFollowUp:`"Power user stickiness is unchanged at 38% and the casual user cohort doubled in size due to a paid campaign. Can you compute what the aggregate DAU/MAU would be under the new mix even if every segment's stickiness held constant — and what does that number tell you about whether to launch the engagement initiative?"`}},{id:`GA03`,title:`Two Cohorts, Two Retention Curves`,subtitle:`Threadline · B2B SaaS · Retention`,difficulty:`senior`,isFree:!0,domain:`retention`,company:`Threadline`,tags:[`cohort-retention`,`b2b-saas`,`gtm`,`segment-fit`,`churn`],companies:[`Airbnb`,`Netflix`,`Spotify`],situation:`Threadline is a B2B SaaS team communication tool (think Slack-adjacent). The company grew quickly in Q1 by adding both enterprise and SMB customers.

Here are the retention curves for two acquisition cohorts:

January cohort (800 accounts, enterprise outbound sales):
- M1 retention: 91%
- M3 retention: 71%
- M6 retention: 42% and flattening (curve appears to be leveling off)
- Average contract value: $12,000 ACV
- Acquisition method: outbound enterprise sales, 45-day sales cycle

March cohort (1,200 accounts, self-serve SMB):
- M1 retention: 88%
- M3 retention: 41%
- M6 retention: 17% and still declining
- Average contract value: $1,200 ACV
- Acquisition method: self-serve signup, free trial → paid conversion

Both cohorts started at similar M1 retention (91% vs 88%), suggesting initial activation is working for both. No significant product changes were shipped between January and March. The engineering team is debating whether there was a product regression that specifically hurt the March cohort.

The CEO wants to know: Is this a product problem? A content/onboarding problem? Or something structural?`,prompt:`Diagnose why the two cohorts have diverged so sharply by M3. Rule out product regression. What is the real driver, and what should the company do?`,frameworkSteps:[`Step 1 — Rule out product regression: No product changes shipped between Jan and March. Both cohorts have similar M1. This pattern of divergence appearing at M3+ is not consistent with a product regression.`,`Step 2 — Profile the cohorts by segment characteristics: enterprise outbound (high ACV, longer commitment, IT-involved procurement) vs SMB self-serve (low ACV, individual decision-maker, low switching costs).`,`Step 3 — Analyze the retention curve shapes: Jan cohort flattening = sticky for a segment that "graduated" to true adoption. March cohort still declining = no natural floor forming, users are churning continuously.`,`Step 4 — Apply the PMF/segment-fit lens: High initial retention that flattens = right product for right customer. Low and continuously declining = product isn't solving a sustained need for this segment.`,`Step 5 — Quantify the economic impact: Compare LTV across both cohorts using retention curves × ACV. Show that the March cohort has massively lower LTV despite more accounts.`,`Step 6 — Diagnose root cause: Is this onboarding? Pricing? Product fit? Switching costs? Segment selection in GTM?`],hints:[`Retention curves that flatten at M3–M6 suggest a "power user floor" — the customers who find deep value stay forever, weak ones churn early. This is healthy for the right segment.`,`A continuously declining curve with no floor is the danger sign. It means even the users who stayed through M3 are churning — no one found the sustained value.`,`Enterprise buyers have longer switching costs (procurement, IT, team habits, contract lock-in). SMB self-serve buyers can cancel in 2 clicks.`,`The $10,800 ACV difference (12k vs 1.2k) means the Jan cohort has 10x the monetization per account even before accounting for retention.`,`LTV estimate: Jan cohort at 42% M6 retention flattening → rough LTV of 2–3 years of subscription. March cohort at 17% M6 still declining → LTV < 1 year.`],modelAnswer:{walkthrough:`Let me first rule out product regression. No significant product changes shipped between January and March. Both cohorts have near-identical M1 retention (91% vs 88%) — if there were a product regression specifically hurting the March cohort, you'd expect M1 to differ or see a specific cohort-level event. The divergence appears at M3, not at activation.

The divergence is almost certainly explained by segment composition, not product quality.

Profile the two cohorts:
- January enterprise cohort: $12k ACV, 45-day sales cycle, outbound, likely mid-market or enterprise buyers with IT-involved procurement. These buyers have high switching costs — they've negotiated contracts, integrated the tool into workflows, and face significant friction to leave.
- March SMB cohort: $1.2k ACV, self-serve, free trial → paid. These are individual contributors or small team leads. Switching costs near zero — they can sign up for a competitor in an afternoon.

Retention curve interpretation:
- Jan cohort flattening at 42%: This is the classic enterprise SaaS "survivor curve" — the accounts that make it to M6 have achieved true adoption. The flattening signals a natural retention floor of ~35–45% is forming. These accounts are likely to retain for 2–4+ more years.
- March cohort at 17% and still declining: No floor is forming. Even the users who survived early churn are continuing to leave. This indicates the product isn't solving a sustained problem for the SMB self-serve segment — there is no habitual use case or switching cost holding them.

Economic impact:
- Jan cohort LTV (rough): $12,000 ACV × ~2.5 years (assuming curve flattens and retains) = ~$30,000 LTV per account × 800 accounts = $24M cohort LTV
- March cohort LTV (rough): $1,200 ACV × ~0.8 years (declining curve, likely fully churned by M12) = ~$960 LTV per account × 1,200 accounts = $1.15M cohort LTV

1,200 accounts generating $1.15M vs 800 accounts generating $24M — the March cohort is consuming CAC and support resources while generating minimal LTV.

Root cause: This is a GTM problem, not a product problem. Threadline's product appears to be well-suited for mid-market/enterprise use cases with structured team workflows. SMB self-serve buyers don't have sufficient switching costs, team depth, or sustained communication needs to find enduring value.

Actions: (1) Stop investing in self-serve SMB acquisition at current unit economics. (2) Investigate what the surviving 17% of the March cohort looks like — they may be SMBs with enterprise-like characteristics. (3) Consider whether an SMB product could be designed with different onboarding and lower price points if the segment is strategic.`,keyDiagnosis:`Segment composition drives the divergence, not product regression. Enterprise buyers have high switching costs and achieve sustained adoption; SMB self-serve buyers churn continuously with no retention floor forming.`,recommendation:`Stop scaling SMB self-serve acquisition. The GTM motion is the problem. Focus outbound on enterprise accounts where the product delivers lasting value and LTV justifies CAC.`},keyTakeaways:[`Retention curve shape tells you about PMF: a flattening curve = survivors found lasting value; a continuously declining curve = no one found durable value.`,`Segment characteristics (switching costs, ACV, procurement complexity) explain retention differences more often than product quality differences.`,`A GTM problem masquerading as a product problem is extremely common in early SaaS — always segment cohorts by acquisition channel and customer profile before diagnosing.`],playbookLinks:[{id:`cohort-retention-curves`,label:`Cohort Retention Curves`},{id:`acquisition-quality`,label:`Acquisition Quality`}],leadershipNote:`A Staff DS would build a retention model that automatically flags when a new cohort's Day-7 curve falls outside the historical confidence band — not just report the numbers. They would also have pre-written the "retention dropped" communication template so the response time from detection to stakeholder briefing is under 2 hours.`,failureMode:{weakAnswer:`The candidate sees two cohorts with different retention curves and diagnoses a product regression — "something broke between January and March." They recommend a product audit without first profiling the two cohorts by acquisition method, ACV, or switching costs, and they never model the LTV differential that makes the March cohort economically irrelevant despite having 50% more accounts.`,interviewerFollowUp:`"No product changes shipped between January and March, and M1 retention is nearly identical for both cohorts. If the product didn't change and activation worked equally well, what is the most parsimonious explanation for why the curves diverge sharply at M3 — and what one data cut confirms or refutes it?"`}},{id:`GA04`,title:`13% Browse-to-Purchase — Where Does the Funnel Break?`,subtitle:`Vela · B2C Marketplace · Funnel Analysis`,difficulty:`analyst`,isFree:!1,domain:`funnel`,company:`Vela`,tags:[`funnel`,`conversion`,`browse-to-purchase`,`ux`,`trust`],companies:[`Stripe`,`Shopify`,`Amazon`],situation:`Vela is a two-sided B2C marketplace for curated lifestyle products. The product team is trying to improve the user journey from signup to first purchase.

Here is the weekly funnel data (new user cohort, weekly snapshot):
- Signup: 100,000 users
- Profile Complete (adds name, preferences, shipping address): 72,000 users (72% of signups)
- First Browse (views ≥3 product listings): 61,200 users (85% of profile completers)
- First Purchase: 8,000 users (13% of browsers)

Industry benchmarks for comparable B2C marketplaces:
- Signup → Profile Complete: 78–85%
- Profile Complete → First Browse: 88–93%
- Browse → First Purchase: 25–35%

The team has been debating where to focus for the past two weeks:
- The growth team lead says: "Profile completion is the bottleneck — 28% of signups never finish their profile, so they can't even see personalized listings."
- The head of design says: "We need to redesign onboarding and reduce the signup friction first."
- The PM says: "Browse-to-purchase is killing us, but it's a hard problem. Let's focus on the easy wins in profile completion first."

You have been asked to run the funnel analysis and recommend where the team should focus.`,prompt:`Identify the highest-leverage step in the funnel. Show your gap analysis vs benchmarks. Where should the team focus first?`,frameworkSteps:[`Step 1 — Calculate the absolute user drop at each step: How many users are lost at Signup→Profile, Profile→Browse, Browse→Purchase?`,`Step 2 — Calculate the relative gap vs benchmark at each step: How far is Vela from industry benchmark at each stage?`,`Step 3 — Estimate the incremental users and revenue recoverable at each step if you reached benchmark conversion.`,`Step 4 — Prioritize by gap magnitude and feasibility: The largest relative gap vs benchmark with the most recoverable users deserves first attention.`,`Step 5 — Identify the likely root cause at the broken step: What causes users to browse but not purchase on a marketplace?`,`Step 6 — Render a prioritized recommendation with a hypothesis to test.`],hints:[`Absolute drops: Signup→Profile loses 28k users. Profile→Browse loses 10.8k users. Browse→Purchase loses 53.2k users.`,`Gap vs benchmark: Profile completion is at 72% vs 78–85% benchmark — below but not catastrophic. Browse→Purchase is at 13% vs 25–35% — roughly 2x below benchmark.`,`Recovery calculation: If Browse→Purchase reached 25% (low end of benchmark), that's 15,300 purchasers vs 8,000 — 7,300 additional first purchases per week.`,`If Signup→Profile reached 80%, that adds ~8,000 more profilers, then ~6,800 more browsers, then ~880 more purchases (at current 13% conversion) — much smaller purchase gain.`,`Users who browse but don't buy on marketplaces typically face: price concerns, trust deficit (new marketplace, unknown sellers), product quality uncertainty, or poor purchase UX.`],modelAnswer:{walkthrough:`Let me run the gap analysis against benchmarks at each step.

Step 1 — Absolute users lost at each step:
- Signup → Profile: 100,000 → 72,000 = 28,000 users lost (28% drop)
- Profile → Browse: 72,000 → 61,200 = 10,800 users lost (15% drop)
- Browse → Purchase: 61,200 → 8,000 = 53,200 users lost (87% drop)

Step 2 — Gap vs benchmark:
- Signup → Profile: 72% actual vs 78–85% benchmark → 6–13pp below benchmark (moderate gap)
- Profile → Browse: 85% actual vs 88–93% benchmark → 3–8pp below benchmark (small gap)
- Browse → Purchase: 13% actual vs 25–35% benchmark → 12–22pp below benchmark (catastrophic gap — ~2–2.7x below benchmark)

Step 3 — Recovery potential (incremental first purchases per week):
Scenario A: Fix Browse → Purchase from 13% → 25% (low benchmark)
61,200 browsers × 25% = 15,300 purchasers vs 8,000 current = +7,300 purchases/week

Scenario B: Fix Profile Completion from 72% → 80%
+8,000 more profilers → +6,800 more browsers → 6,800 × 13% = +884 more purchases/week

Scenario C: Fix both Signup→Profile + Profile→Browse to benchmark
At best: +12,000 more profilers → +10,200 more browsers → 10,200 × 13% = +1,326 more purchases/week

The Browse→Purchase fix is 5–8x more impactful at the purchase outcome than fixing the earlier steps, even at conservative conversion improvement assumptions.

Step 4 — Root cause at Browse→Purchase:
Users who browse ≥3 listings and don't buy on a B2C marketplace typically face:
- Trust deficit: New marketplace, unknown sellers, limited reviews, payment security uncertainty
- Price-value mismatch: Products look interesting but seem overpriced vs alternatives
- Product quality uncertainty: No tactile experience, limited photos or dimensions
- Purchase UX friction: Complex checkout, forced account commitment, limited payment methods
- Browsing intent vs buying intent mismatch: Some users are discovery-only

Recommended focus: Browse → Purchase is the catastrophic gap. Fix it first. Test trust signals (seller reviews, return policy visibility, payment badges), improve product page quality (photo standards, size charts, trusted seller indicators), and simplify checkout.

Profile completion is worth iterating on (it's 72% vs 78–85% benchmark) but should be second priority — fixing it at current browse-to-purchase rates yields ~10x less purchase impact.`,keyDiagnosis:`Browse-to-purchase at 13% vs 25–35% benchmark is the catastrophic gap. It is 2x below benchmark and responsible for losing 53,200 potential buyers every week. Profile completion is below benchmark but secondary in impact.`,recommendation:`Focus first on Browse→Purchase. Hypothesize trust, product quality, and checkout friction as root causes. Run targeted tests: trust badges, seller review prominence, return policy callouts, checkout simplification. Do not prioritize onboarding redesign until the conversion floor is fixed.`},keyTakeaways:[`Always compare funnel steps against industry benchmarks — absolute conversion rates are meaningless without a reference point.`,`Prioritize the step with the largest relative gap AND the most recoverable users at the outcome you care about (purchases, not just completions).`,`An "easy win" upstream that converts 5% more users into a broken downstream step generates almost no outcome improvement — fix the leak, not the tap.`],playbookLinks:[{id:`funnel-analysis-framework`,label:`Funnel Analysis`},{id:`acquisition-quality`,label:`Acquisition Quality`}],leadershipNote:`Leadership-level funnel analysis includes the counterfactual: if we fix the biggest drop-off step, what is the business impact in revenue and DAU? A Staff DS translates every funnel gap into a dollar figure and a headcount justification, making it easy for PMs and engineers to prioritize the fix.`,failureMode:{weakAnswer:`The candidate agrees with the growth team lead — "profile completion is the bottleneck at 28% dropout" — because it is the first step with the highest absolute user loss. They recommend fixing onboarding without running the gap analysis against benchmarks or calculating how many incremental purchases each fix actually generates, missing that Browse→Purchase is catastrophically below benchmark and delivers 5–8x more purchase impact per improvement.`,interviewerFollowUp:`"If fixing profile completion from 72% to 80% adds 8,000 more profilers who then flow through the existing 13% Browse→Purchase rate, how many additional first purchases does that generate per week — and how does that compare to the purchase impact of fixing Browse→Purchase from 13% to 25%?"`}},{id:`GA05`,title:`Which Acquisition Channel Is Worth It?`,subtitle:`Crafted Marketplace · Consumer Marketplace · Acquisition`,difficulty:`senior`,isFree:!1,domain:`acquisition`,company:`Crafted Marketplace`,tags:[`ltv-cac`,`acquisition-channels`,`paid-social`,`seo`,`referral`,`unit-economics`],companies:[`Uber`,`DoorDash`,`Lyft`],situation:`Crafted Marketplace is evaluating its three main acquisition channels at the 6-month mark post-acquisition. The marketing team wants to decide where to invest the next $500,000 of acquisition budget.

Here is the performance data for each channel, measured on cohorts acquired in the same quarter:

Paid Social (Facebook/Instagram):
- CAC: $45 per acquired user
- Average 6-month LTV: $38
- 6-month payback status: Negative margin (LTV < CAC)
- Current budget share: 60% of acquisition budget

SEO / Content Marketing:
- CAC: $12 per acquired user (fully-loaded: content team cost + tooling amortized over traffic)
- Average 6-month LTV: $67
- 6-month payback period: ~1.1 months
- Current budget share: 25% of acquisition budget

Referral Program:
- CAC: $8 per acquired user (referral credit + program management cost)
- Average 6-month LTV: $89
- 6-month payback period: ~1.1 months
- Current budget share: 15% of acquisition budget

The head of growth wants to double the paid social budget. His reasoning: "Paid social has the highest reach and lets us target specific demographics. Our LTV will improve as we optimize creative and targeting. We just need more scale."

The CFO is skeptical. The CEO wants a data-driven recommendation.`,prompt:`Evaluate the unit economics of all three channels. Should the team double paid social? Where should the $500k go?`,frameworkSteps:[`Step 1 — Calculate LTV:CAC ratio for each channel. This is the primary unit economics signal.`,`Step 2 — Calculate payback period: How long until the channel recoups its CAC? Rule of thumb: <12 months is healthy, <6 months is excellent.`,`Step 3 — Assess scalability: Which channels scale with budget (paid social), which scale with compounding effort (SEO), which are constrained by user base size (referral)?`,`Step 4 — Evaluate the paid social improvement hypothesis: What LTV improvement would be needed to make paid social break-even? Is that realistic?`,`Step 5 — Compute the NPV of deploying $500k across different allocation scenarios.`,`Step 6 — Render a channel allocation recommendation with caveats.`],hints:[`LTV:CAC ratios: Paid Social = 38/45 = 0.84 (destroying value). SEO = 67/12 = 5.6 (excellent). Referral = 89/8 = 11.1 (exceptional).`,`For paid social to break even at 6 months, LTV needs to reach $45 — that's a 18% improvement. To reach 3:1 LTV:CAC (healthy), LTV needs to reach $135 at current CAC.`,`Referral doesn't scale infinitely — you can only refer users you have. Growth in referral revenue is bounded by your existing user base size and K-factor.`,`SEO compounds: content created today earns traffic for years. The marginal CAC on SEO decreases over time as domain authority grows.`,`$500k at referral CAC of $8 = 62,500 users. $500k at SEO CAC of $12 = 41,667 users. $500k at paid social CAC of $45 = 11,111 users — and at negative unit economics.`],modelAnswer:{walkthrough:`Step 1 — LTV:CAC ratios:
- Paid Social: $38 LTV / $45 CAC = 0.84 — every dollar spent on paid social destroys $0.16 of value at the 6-month horizon
- SEO/Content: $67 LTV / $12 CAC = 5.58 — every dollar spent generates $5.58 in LTV at 6 months
- Referral: $89 LTV / $8 CAC = 11.1 — every dollar spent generates $11.10 in LTV at 6 months

Step 2 — Payback periods:
- Paid Social: Never at current LTV ($38 < $45 CAC). Would need LTV to improve.
- SEO: ~1.1 months (strong — means the channel pays for itself in roughly 5 weeks)
- Referral: ~1.1 months (same — reflects high purchase intent from referred users)

Step 3 — Scalability:
- Paid Social: Scales linearly with budget. But at negative unit economics, scaling it burns cash.
- SEO: Scales with content investment, but compounds. A $12 CAC today likely falls to $8–9 as domain authority grows. Non-linear returns with time.
- Referral: Constrained by existing user base (can only refer users you have) and K-factor. Not infinitely scalable but has the best economics while it works.

Step 4 — Paid Social improvement hypothesis:
For paid social to break even: LTV must reach $45 (18% improvement). That's achievable with optimization.
For paid social to reach a healthy 3:1 LTV:CAC: LTV must reach $135. That would require a 255% LTV improvement from the current $38 — implausible without a fundamental change to the product or pricing.

Step 5 — $500k allocation scenarios:
Scenario A (double paid social): $500k / $45 CAC = 11,111 users at $38 LTV = $422k LTV. Net loss: $78k
Scenario B (shift to SEO + Referral): $300k SEO + $200k Referral
  - SEO: 25,000 users × $67 LTV = $1.675M LTV
  - Referral: 25,000 users × $89 LTV = $2.225M LTV
  - Total LTV: $3.9M vs $500k spent → $3.4M net value creation

Recommendation: Do not double paid social. Reallocate 60% paid social budget to SEO (40%) and referral (20%). A small paid social test budget (5–10%) is acceptable to continue creative/targeting optimization and gather data on whether 12-month LTV improves. Set a gate: if paid social 12M LTV does not reach $55 (1.2x CAC), cut it entirely.`,keyDiagnosis:`Paid social is destroying value at $38 LTV vs $45 CAC. SEO (5.6:1 LTV:CAC) and Referral (11.1:1 LTV:CAC) are the high-value channels. Current budget allocation is inverted — 60% in the worst channel.`,recommendation:`Shift budget: SEO 45%, Referral 30%, Paid Social 10% (test budget only), other 15%. Set a 12M LTV gate for paid social. Reallocating $500k from paid social to SEO/referral generates ~8x more LTV.`},keyTakeaways:[`LTV:CAC is the fundamental unit economics signal for acquisition channels. Below 1:1 means you're literally paying to lose money.`,`Channels with the best unit economics (referral, SEO) often get underinvested because they're harder to scale or measure than paid.`,`Set payback period gates — not just LTV at a single point. A channel with 12M+ payback is a cash flow risk even if LTV is eventually positive.`],playbookLinks:[{id:`ltv-payback-period`,label:`LTV & Payback Period`},{id:`acquisition-quality`,label:`Acquisition Quality`}],leadershipNote:`A Director of Analytics would flag a CAC/LTV imbalance as a finance-level risk, not just a metrics observation. They would ensure the finding reaches the CFO and VP of Growth with a clear payback period calculation and a recommendation on whether to pause acquisition spend — not just surface it in a product review.`,failureMode:{weakAnswer:`The candidate computes LTV:CAC ratios correctly but then hedges — "paid social is below benchmark but the head of growth thinks targeting will improve, so maybe keep a portion running." They never set a concrete gate (e.g., LTV must reach $55 at 12 months or cut the channel), leaving the recommendation vague enough that the head of growth can ignore it and keep spending.`,interviewerFollowUp:`"Paid social is at 0.84 LTV:CAC today. The head of growth says LTV will improve with creative optimization. What specific LTV number at what time horizon would you require before allowing the paid social budget to increase — and what happens if that gate isn't met in the next two quarters?"`}},{id:`GA06`,title:`DAU Up 12% After Push Campaign — Real or Hollow?`,subtitle:`Prism · Video App · Engagement Quality`,difficulty:`senior`,isFree:!1,domain:`engagement`,company:`Prism`,tags:[`dau-quality`,`push-notifications`,`engagement`,`hollow-metrics`,`retention`],companies:[`Instagram`,`TikTok`,`Snapchat`],situation:`Prism's growth team launched an aggressive push notification campaign on Monday. The campaign sends two types of notifications:
1. Daily digest: "Your top videos from people you follow — don't miss out"
2. Re-engagement: "You might have missed: [3 videos from followed creators]"

Results after 7 days:
- DAU: +12% week-over-week (from 2.2M → 2.46M)
- CEO declares the campaign a success and asks for it to continue and scale

However, you (the analyst) pull the underlying data and notice some troubling signals:
- Notification open rate: 71% of the DAU spike came from users who opened a push notification
- Average session length for notification-opened sessions: 1.2 minutes
- Average session length for organic (non-notification) sessions: 8.4 minutes
- 7-day rolling retention of the notification-sourced DAU: 23%
- 7-day rolling retention of organic DAU (same period): 61%

The CEO has scheduled a press release about "record engagement." The VP of Marketing wants to allocate $200k to develop a more sophisticated notification system.

You have 30 minutes to prepare a briefing on whether this DAU growth is real.`,prompt:`Diagnose whether the DAU growth from the push campaign represents genuine user engagement or hollow inflation. Show the quality-adjusted analysis.`,frameworkSteps:[`Step 1 — Decompose DAU into notification-driven and organic components. Quantify each.`,`Step 2 — Quality-adjust DAU using session length as a proxy for engagement depth. Compute "engaged DAU" using a minimum session threshold.`,`Step 3 — Apply D7 retention to project what the DAU looks like in one week when notifications stop or are ignored.`,`Step 4 — Calculate the decay curve: what happens to total DAU if notifications drive 71% of the spike but those users have only 23% D7 retention?`,`Step 5 — Benchmark the notification-session quality vs organic session quality.`,`Step 6 — Render a verdict on campaign quality and a recommendation for leadership.`],hints:[`Notification-sourced DAU: 71% of the 260k DAU spike = ~185k users came via notification opens. Organic DAU change = ~75k.`,`Session quality: 1.2 min notification session vs 8.4 min organic session = notification sessions are 7x shorter — barely opening the app and closing.`,`D7 retention forecast: 185k notification users × 23% = ~43k retained in 7 days. 75k organic users × 61% = ~46k retained. After 7 days, most of the DAU spike evaporates.`,`Engaged DAU (sessions ≥2 min): Notification sessions avg 1.2 min — most fall below a 2-min meaningful engagement threshold. True engaged DAU may be roughly flat.`,`Notifications can be sustainable if they drive genuine re-engagement. The problem here is session depth — users are opening to dismiss, not to actually watch.`],modelAnswer:{walkthrough:`Step 1 — Decompose the DAU spike:
Total DAU spike: 2.46M − 2.2M = 260,000 additional daily users
Notification-sourced: 71% × 260,000 = ~185,000 users
Organic change: 29% × 260,000 = ~75,000 users (some of this may be noise or week-over-week variance)

Step 2 — Session quality analysis:
Notification sessions: avg 1.2 minutes
Organic sessions: avg 8.4 minutes
Ratio: notification sessions are 14% the length of organic sessions (7x shorter)

If we define "meaningfully engaged DAU" as a session ≥ 2 minutes (the minimum to watch at least one video to near-completion):
- Most notification-opened sessions (avg 1.2 min) fall below this threshold
- Estimated engaged DAU from notifications: perhaps 15–20% of 185k = 28–37k users
- Organic engaged DAU: largely intact
- True engaged DAU change: ~+35k, not +260k — roughly flat

Step 3 — D7 retention decay projection:
Week 1 notification cohort:
- 185k notification users × 23% D7 retention = ~43k return next week
- Net loss from notification cohort week 2: 142k users

Week 1 organic uplift:
- 75k organic users × 61% D7 retention = ~46k return next week
- Net loss: 29k users

Projected DAU in 7 days (if campaign continues at same scale):
2.2M base + new notification opens (similar ~185k) + 43k retained + 46k retained organic − decays = roughly similar headline DAU only if you keep sending notifications. Stop them → DAU drops.

Step 4 — The decay scenario:
If notifications stop after week 1: DAU reverts toward ~2.25–2.3M (nearly the pre-campaign level) because 77% of notification users won't return.

Verdict: This is hollow DAU. The 12% gain is driven by low-quality notification opens that have 7x shorter sessions and 23% D7 retention vs 61% organic. Engaged DAU (by session depth) is essentially flat.

Recommendation to leadership: (1) Do not issue a press release about "record engagement." (2) Do not invest $200k in scaling the notification system at current quality. (3) The notifications may be causing notification fatigue that will damage organic retention over time. (4) Test a lower-frequency, higher-quality notification strategy that drives ≥3-minute sessions and measures D7 retention as the success metric, not open rate or raw DAU.`,keyDiagnosis:`Hollow DAU inflation. 71% of the spike is notification-driven with 1.2-minute avg sessions (vs 8.4 min organic) and 23% D7 retention (vs 61% organic). True engaged DAU is approximately flat.`,recommendation:`Do not scale the notification system or issue DAU-based press releases. Redefine the campaign success metric as engaged DAU (session ≥2 min) and D7 retention. Run a reduced-frequency test before spending $200k.`},keyTakeaways:[`DAU is a count metric — it tells you how many users opened the app, not whether they found value. Always quality-adjust with session depth or D7 retention.`,`Notifications can inflate DAU while destroying long-term retention by training users to dismiss them. High open rate + low session = notification fatigue signal.`,`Hollow growth is worse than flat growth — it burns CAC-equivalent notification budget, risks churning users, and misleads leadership into celebration mode.`],playbookLinks:[{id:`notification-driven-dau`,label:`Notification-Driven DAU`},{id:`growth-accounting`,label:`Growth Accounting`}],leadershipNote:`At the Staff level, this analysis becomes a policy recommendation: define a "notification health" guardrail metric (e.g., notification-driven DAU must not exceed X% of total DAU) and build it into the launch criteria for any notification-heavy feature. The leadership move is preventing the pattern from recurring, not just diagnosing the current instance.`,failureMode:{weakAnswer:`The candidate takes the 12% DAU increase at face value, noting the notification campaign as the cause, and supports the CEO's conclusion that it's a success. They don't compare session lengths between notification-sourced and organic users, don't apply D7 retention to project what DAU looks like next week, and never compute the quality-adjusted engaged DAU.`,interviewerFollowUp:`"Notification-sourced sessions average 1.2 minutes vs 8.4 minutes for organic. Apply D7 retention of 23% to the notification cohort and 61% to the organic cohort — what does total DAU look like in seven days if you keep sending notifications at the same volume, and what does it look like if you stop?"`}},{id:`GA07`,title:`8% Growth But We're Bleeding Organic Share`,subtitle:`Nova · Subscription Fitness App · Growth Quality`,difficulty:`staff`,isFree:!1,domain:`acquisition`,company:`Nova`,tags:[`growth-quality`,`organic-share`,`k-factor`,`paid-dependency`,`unit-economics`],companies:[`Google`,`Pinterest`,`Reddit`],situation:`Nova is a subscription fitness app. It has been growing new users at a steady 8% month-over-month for the past 6 months. The growth team is celebrating consistent execution.

However, a closer look at the acquisition data reveals a structural shift:

Six months ago:
- Paid acquisition share of new users: 58%
- Organic/referral share: 42%
- CAC (blended): $18
- Viral coefficient (K-factor): 0.31

Current (today):
- Paid acquisition share of new users: 84%
- Organic/referral share: 16%
- CAC (blended): $41
- K-factor: 0.14

The paid acquisition team argues: "Growth is growth. We're hitting our monthly targets, the paid channels are performing, and user numbers are up. Why would we change what's working?"

The CFO flags concern: the marketing budget has grown 3.5x to maintain the same growth rate, and LTV has not changed materially. The CMO wants to know if the 8% growth rate is sustainable and what's actually happening.

You are the staff analyst. Prepare a growth quality audit.`,prompt:`Audit the quality of Nova's 8% monthly growth. Diagnose what has structurally changed and model the sustainability of the current trajectory.`,frameworkSteps:[`Step 1 — Decompose growth into organic vs paid components. Compute the implied organic growth rate from the K-factor and organic share data.`,`Step 2 — Analyze CAC trend: What does the CAC increase from $18 → $41 imply about marginal returns on paid spend?`,`Step 3 — Model the K-factor collapse: K-factor = 0.31 → 0.14. What does this mean for the viral loop? What does it imply about product satisfaction or share mechanics?`,`Step 4 — Project the budget requirement to sustain 8% growth at the current CAC trajectory. Show when it becomes untenable.`,`Step 5 — Diagnose why organic share collapsed: is it product satisfaction, referral program mechanics, market saturation, or something else?`,`Step 6 — Define what "growth quality" means for a subscription app and render a verdict.`],hints:[`K-factor interpretation: K=0.31 means each user brings in 0.31 additional users on average. K=0.14 means each user now brings in 0.14. Viral loop is more than halved.`,`CAC doubling from $18 → $41 while LTV is flat means payback period has roughly doubled. If payback was 6 months before, it's now ~14 months.`,`Organic share dropped from 42% → 16% of new users. If monthly new users are, say, 10,000: previously 4,200 organic, now 1,600 organic — an absolute decline in organic acquisition.`,`At some CAC growth rate, the paid budget required to sustain 8% growth exceeds subscription LTV. Project when that crossover happens.`,`K-factor collapse could signal: (a) the easy-to-refer social graph is saturated, (b) product satisfaction has declined, (c) referral mechanics changed, or (d) the acquired paid users refer less than organic users did.`],modelAnswer:{walkthrough:`Growth quality audit for Nova:

Step 1 — Decompose growth components:
Assume current monthly new users ≈ 10,000 (for illustration; the ratios hold for any base).
- Paid new users: 84% = 8,400
- Organic/referral new users: 16% = 1,600

Six months ago (same base scale):
- Paid: 58% = 5,800
- Organic: 42% = 4,200

Organic acquisition has fallen from ~4,200 to ~1,600 users/month — a 62% absolute decline in organic user acquisition, even while the headline growth rate holds at 8%. Nova is buying back organic growth it is losing.

Step 2 — CAC trajectory and unit economics:
CAC: $18 → $41 (128% increase over 6 months ≈ 15%/month CAC inflation)
If LTV is $120 (unchanged) and CAC was $18: payback = 1.8 months, LTV:CAC = 6.7:1 (excellent)
At CAC = $41: payback = 4.1 months, LTV:CAC = 2.9:1 (acceptable but declining)
At current 15%/month CAC growth: in 4 more months CAC ≈ $72. LTV:CAC = 1.7:1 (marginal).
In 7 more months CAC ≈ $119. Approaching LTV — unit economics inversion.

Step 3 — K-factor collapse:
K = 0.31 → 0.14: viral coefficient fell by 55%.
In a viral growth model: total users = acquired users / (1 − K). At K=0.31, each paid user creates 0.45 organic users. At K=0.14, each paid user creates only 0.16 organic users. The paid-to-organic amplification ratio has collapsed 2.8x.

This means Nova must acquire many more paid users to achieve the same growth, explaining the CAC inflation and paid share increase.

Root cause of K-factor collapse (likely causes to investigate):
(a) Paid-acquired users refer at lower rates than organically-acquired users (paid users are less committed, less likely to evangelize)
(b) Product satisfaction has degraded — net promoter behavior declined
(c) The referral program mechanics changed or became less visible
(d) The referrable social graph of core users is approaching saturation

Step 4 — Sustainability projection:
At $41 CAC today with $120 LTV: budget efficiency = LTV/CAC = 2.9:1. Sustainable but narrowing.
At 15%/month CAC inflation: cross-over (LTV = CAC) occurs in approximately 7–8 months.
Monthly budget to sustain current growth: if 8,400 paid users/month at $41 = $344k/month. In 7 months at $119 CAC: $1M/month to acquire the same 8,400 users. This is not sustainable.

Step 5 — Verdict on growth quality:
The 8% headline growth rate masks a structural deterioration. Nova is on a treadmill: organic referral is collapsing, forcing ever-increasing paid investment at declining returns to maintain the same growth rate. This is the classic symptom of product-led growth erosion.

Actions: (1) Audit why organic referral collapsed — instrument K-factor by acquisition cohort to determine if paid users refer less than organic users. (2) Examine product NPS/satisfaction for trends over the same 6-month period. (3) Evaluate whether the referral program was changed or degraded. (4) Set a K-factor floor of 0.25 as a product health indicator. (5) Model the CAC ceiling: establish the maximum acceptable CAC before the growth team must scale back.`,keyDiagnosis:`Nova is buying growth it used to earn. The K-factor collapsed from 0.31 to 0.14, organic share fell from 42% to 16%, and CAC doubled — all while the headline growth rate appears healthy. The growth engine is structurally degrading.`,recommendation:`Declare this a P0 growth quality problem. Audit the K-factor collapse (paid vs organic cohort referral rates, NPS trends, referral program mechanics). Set CAC ceiling alerts. The current trajectory leads to unit economics inversion within 7–8 months.`},keyTakeaways:[`Headline growth rates can be deeply misleading — decomposing paid vs organic is the first step in any growth quality audit.`,`K-factor collapse combined with CAC inflation is the signature pattern of product-led growth erosion: the product is losing its ability to earn users, so you buy more.`,`A sustainable growth engine has a healthy organic base that amplifies paid. Paid-dependent growth at declining LTV:CAC is a treadmill, not a flywheel.`],playbookLinks:[{id:`organic-growth-quality`,label:`Organic vs Paid Growth`},{id:`acquisition-quality`,label:`Acquisition Quality`}],leadershipNote:`A Staff DS would track organic/paid DAU ratio as a leading indicator of brand health and product-market fit, separate from the growth team's attribution reporting. They would build a "growth quality index" — a single score combining organic share, Day-30 retention by channel, and CAC payback — and present it monthly to the leadership team.`,failureMode:{weakAnswer:`The candidate accepts the paid acquisition team's argument — "growth is growth, 8% MoM is hitting targets" — without decomposing whether organic share is declining. They calculate LTV:CAC at the blended level, notice it's worsening, and recommend optimizing paid creative, completely missing the K-factor collapse and the structural implication that Nova is on a treadmill burning ever more budget to stay at the same growth rate.`,interviewerFollowUp:`"CAC has gone from $18 to $41 and K-factor from 0.31 to 0.14 over six months. If CAC keeps growing at the same rate, at what point does it cross the LTV ceiling — and what happens to the growth rate when Nova hits that ceiling and can't increase the paid budget further?"`}},{id:`GA08`,title:`LatAm Retains at 17% vs US at 44%`,subtitle:`Crafted Marketplace · International Expansion · Retention & PMF`,difficulty:`staff`,isFree:!1,domain:`retention`,company:`Crafted Marketplace`,tags:[`international-expansion`,`pmf`,`activation`,`payment-friction`,`supply-quality`],companies:[`Airbnb`,`Booking.com`,`Expedia`],situation:`Crafted Marketplace launched in three LatAm countries (Brazil, Mexico, Colombia) six months ago. The expansion was framed as a top strategic priority, with $3M allocated to regional marketing and seller acquisition.

Current data at the 6-month mark:

US market (mature):
- M6 cohort retention: 44%
- First-session purchase conversion: 31%
- Avg listing quality score: 4.3/5 (based on photos, descriptions, seller response time)
- Payment methods: Credit card (78% penetration), PayPal (61%), Buy Now Pay Later (42%)
- CAC: $22

LatAm market (6-month launch):
- M6 cohort retention: 17%
- First-session purchase conversion: 8%
- Avg listing quality score: 3.1/5
- Payment methods: Credit card only (18% penetration in target demographics)
- CAC: $22 (same as US due to similar CPMs)
- Seller count: 1,400 LatAm sellers (vs 42,000 US sellers)

Engineering is debating whether to scale LatAm paid acquisition. The regional growth lead argues: "We're early. Retention will improve as we grow. We just need more users to build the flywheel." The CFO wants to pause LatAm spend until retention improves.

You are the staff analyst. You have 48 hours to make a recommendation.`,prompt:`Diagnose whether the LatAm retention gap reflects early-market dynamics (patience required) or a PMF failure (structural problem). Recommend whether to scale, pause, or fix-first.`,frameworkSteps:[`Step 1 — Analyze the first-session purchase conversion rate as the activation signal. This is the earliest leading indicator of PMF.`,`Step 2 — Identify structural product blockers: What features or infrastructure is missing in LatAm that exists in the US?`,`Step 3 — Separate market maturity effects from product-market fit failures. What would you expect if this were just an early-market timing issue?`,`Step 4 — Compute the unit economics of LatAm acquisition at current metrics and project at improved metrics.`,`Step 5 — Define the fix-first threshold: What metrics need to reach what level before scaling acquisition is justified?`,`Step 6 — Render a recommendation: Scale, Pause, or Fix-first. Include the specific interventions that would change the diagnosis.`],hints:[`8% first-session purchase conversion is the critical tell. In the US, 31% of first-session visitors buy. LatAm users are seeing the product and not transacting at 4x lower rates.`,`Credit card penetration at 18% means 82% of your target users literally cannot pay with the only method available. This alone could explain most of the conversion gap.`,`Listing quality at 3.1/5 vs US 4.3/5 means the product looks materially worse — fewer photos, worse descriptions, slower seller response. Users in a discovery state see an inferior marketplace.`,`LTV at 17% M6 retention (and declining) vs $22 CAC: LatAm LTV is likely <$15 at current trajectory. Payback may never occur.`,`Early-market timing would show: lower volume but similar conversion rates, similar listing quality, similar activation patterns — just at lower absolute numbers. This shows structural differences in product experience.`],modelAnswer:{walkthrough:`Step 1 — Activation analysis (first-session purchase conversion):
LatAm: 8% vs US: 31% → LatAm activation is 74% below US levels.

This is the most important number in this diagnosis. Retention is a lagging indicator — it measures what happens over months. First-session conversion is a leading indicator of immediate value perception. Users who browse the LatAm marketplace and don't buy in their first session are voting "not ready" in real time.

If this were just an early-market timing issue (e.g., users need more exposure before purchasing, brand trust takes time to build), we'd expect first-session conversion to be lower but not catastrophically so. A 4x gap vs an established US market is a structural signal, not a timing signal.

Step 2 — Structural product blockers:
(a) Payment friction: Credit card 18% penetration = 82% of users cannot complete a purchase with the available payment method. This alone likely explains a large portion of the 8% conversion rate. A user who wants to buy but has no credit card simply cannot.
(b) Supply thinness: 1,400 LatAm sellers vs 42,000 US. Assuming similar category distribution, LatAm has ~3% of the US seller density. Users searching for specific items are likely to find few or no options.
(c) Listing quality 3.1/5 vs 4.3/5: The product literally looks worse. New sellers have fewer photos, worse descriptions, lower seller trust signals. First impressions are driving users away.

Step 3 — Early-market vs PMF failure diagnosis:
Early-market timing would manifest as: similar conversion rates at lower volume, similar listing quality as sellers are onboarded, activation improving over time. We'd see a retention improvement trajectory over the 6 months.

PMF failure manifests as: low conversion from day one, retention declining (not improving) over the cohort's life, structural product gaps that volume alone won't fix.

LatAm shows the PMF failure pattern: 8% first-session conversion, 17% M6 retention on a cohort that has had 6 months, and structural blockers (payment, supply, listing quality) that more acquisition spend doesn't address.

Step 4 — Unit economics:
US LTV estimate (rough): At 44% M6 retention, flattening curve, avg $X order × ~3–4 purchases in 6 months. Assume $65 LTV at 6M. LTV:CAC = 65/22 = 3:1 (healthy).
LatAm LTV estimate: At 17% M6 retention (still declining), user who reaches M6 but is declining → LTV likely $12–18. LTV:CAC = 15/22 = 0.68 — destroying value.

Step 5 — Fix-first threshold:
Before scaling LatAm acquisition, three gates must be met:
(1) Payment methods: Add Pix (Brazil), OXXO (Mexico), local installment options (parcelamento). Target: first-session conversion ≥18% (still below US but demonstrates the payment friction was the primary blocker)
(2) Supply density: Reach 5,000+ active LatAm sellers with listing quality score ≥3.8. Invest in seller onboarding quality, photo guidelines, response-time incentives.
(3) M3 retention: First new cohort post-fixes must show M3 ≥35% before scaling acquisition budget.

Recommendation: Fix-first. Pause growth spend above maintenance level. Allocate LatAm budget to: (a) payment method integrations, (b) seller quality program, (c) supply acquisition in top 5 categories. Re-evaluate in 3 months with a new post-fix cohort.`,keyDiagnosis:`PMF failure, not early-market timing. 8% first-session conversion signals structural product gaps: 82% of users cannot pay (payment method gap), supply is too thin, and listing quality is materially inferior to US. Scaling acquisition at 17% M6 retention burns $22 CAC per user generating <$15 LTV.`,recommendation:`Fix-first: pause scaled acquisition and invest LatAm budget in (1) local payment methods (Pix, OXXO, installments), (2) seller quality program to reach 5,000 active sellers at 3.8+ quality score. Set gates: first-session conversion ≥18% AND M3 retention ≥35% before resuming growth spend.`},keyTakeaways:[`First-session purchase conversion is the earliest PMF signal in a marketplace — it reflects whether users see something worth buying right now. Below 15% on a mature marketplace means structural blockers, not timing.`,`Payment method coverage is table stakes for international marketplaces — launching credit-card-only into low-card-penetration markets is a near-guaranteed PMF failure.`,`Scaling acquisition into a PMF gap doesn't build a flywheel — it burns CAC acquiring users who churn because the product isn't ready for them.`],playbookLinks:[{id:`cohort-retention-curves`,label:`Cohort Retention Curves`},{id:`funnel-analysis-framework`,label:`Funnel Analysis`}],leadershipNote:`A Director of Analytics would use geo cohort analysis as the primary input to the market expansion scorecard — not a one-off analysis. They would build a standardized "market maturity" framework that automatically classifies each market as Early/Growth/Mature/Declining based on cohort curves, and use it to direct resource allocation across markets.`,failureMode:{weakAnswer:`The candidate sides with the regional growth lead — "we're only 6 months in, retention will improve as the flywheel builds" — without running the unit economics. They treat low retention as a natural early-market phenomenon, never check first-session purchase conversion as a PMF signal, and never identify that 82% of LatAm users literally cannot complete a purchase because the only payment method available has 18% penetration.`,interviewerFollowUp:`"If credit card penetration in the LatAm target demographic is 18%, what is the theoretical maximum first-session purchase conversion rate you could achieve without adding any additional payment methods — and how does that compare to the 8% you're actually seeing?"`}},{id:`GA09`,title:`LTV Diverged — High-Intent Users Worth 3x But We're Acquiring the Wrong Segment`,subtitle:`Vela · Subscription App · LTV & CAC Payback`,difficulty:`senior`,isFree:!1,domain:`ltv`,company:`Vela`,tags:[`ltv`,`cac-payback`,`cohort-ltv`,`channel-mix`,`contribution-margin`],companies:[`Spotify`,`Duolingo`,`Calm`],situation:`Vela is a subscription app with 1.2M paying subscribers. The finance team reports that blended 12-month LTV has fallen 22% year-over-year — from $96 to $75. CAC has held flat at $28 across the same period. Leadership is confused: if CAC is flat and the product hasn't changed, why is LTV declining?

Here is the channel-level breakdown, comparing last year's acquisition cohort to this year's:

Last year's cohort (by channel):
- Organic / SEO: 38% of new users, 12-month LTV = $118, CAC = $9
- Referral: 22% of new users, 12-month LTV = $131, CAC = $12
- Paid Social (Facebook/Instagram): 40% of new users, 12-month LTV = $62, CAC = $44

This year's cohort (by channel):
- Organic / SEO: 21% of new users, 12-month LTV = $121, CAC = $9
- Referral: 14% of new users, 12-month LTV = $128, CAC = $12
- Paid Social (Facebook/Instagram): 65% of new users, 12-month LTV = $58, CAC = $44

The head of growth argues that paid social is performing well — volume is up 60% and the channel's LTV has only dropped 4% ($62 → $58). The VP of Finance wants to understand why blended LTV is collapsing when per-channel LTV looks "basically flat."

You are the senior analyst. You have one meeting to explain what's happening and recommend a path forward.`,prompt:`Diagnose why blended LTV declined 22% when per-channel LTV is nearly flat. Compute the LTV:CAC ratio for each channel. Recommend where to reallocate the acquisition mix.`,frameworkSteps:[`Step 1 — Compute blended LTV for last year and this year using the channel mix weights. Verify the math matches the reported 22% decline.`,`Step 2 — Calculate the LTV:CAC ratio for each channel in both years. Identify which channels are profitable and which are marginal.`,`Step 3 — Explain the mix-shift mechanism: how can blended LTV fall even when individual channel LTV is flat? Name this effect precisely.`,`Step 4 — Calculate the payback period per channel: CAC / (LTV / 12 months). Identify which channels have dangerous payback windows.`,`Step 5 — Model what blended LTV would be under the old channel mix applied to current per-channel LTV numbers.`,`Step 6 — Recommend a channel reallocation with a specific target mix and project the blended LTV recovery.`],hints:[`Blended LTV = weighted average of per-channel LTV. Last year: (0.38 × 118) + (0.22 × 131) + (0.40 × 62) = 44.8 + 28.8 + 24.8 = $98. This year: (0.21 × 121) + (0.14 × 128) + (0.65 × 58) = 25.4 + 17.9 + 37.7 = $81. The math checks out — blended LTV dropped even though per-channel LTV is nearly flat.`,`LTV:CAC by channel: Organic = 121/9 = 13.4x. Referral = 128/12 = 10.7x. Paid Social = 58/44 = 1.3x. Paid social is barely above breakeven.`,`The effect is called "mix-shift bias" or "composition effect." You are acquiring proportionally more users from the worst-LTV channel, so the average falls even if each channel is individually stable.`,`Payback period: Organic = 9/(121/12) = 0.9 months. Referral = 12/(128/12) = 1.1 months. Paid Social = 44/(58/12) = 9.1 months — nearly a full year to recover CAC.`,`If you applied the old mix (38/22/40) to current LTV numbers: (0.38 × 121) + (0.22 × 128) + (0.40 × 58) = 46.0 + 28.2 + 23.2 = $97.4. Blended LTV would be ~$97 — nearly last year's level — with zero product change.`],modelAnswer:{walkthrough:`Step 1 — Verify the blended LTV math:
Last year blended LTV: (0.38 × 118) + (0.22 × 131) + (0.40 × 62) = 44.8 + 28.8 + 24.8 = $98.4 ≈ $96 (reported — small rounding differences).
This year blended LTV: (0.21 × 121) + (0.14 × 128) + (0.65 × 58) = 25.4 + 17.9 + 37.7 = $81 ≈ $75–80 range.
The math confirms the 22% decline is driven by mix, not per-channel performance.

Step 2 — LTV:CAC ratios:
Organic: $121 / $9 = 13.4x — exceptional.
Referral: $128 / $12 = 10.7x — exceptional.
Paid Social: $58 / $44 = 1.3x — marginal. For context, healthy LTV:CAC is ≥3:1. Paid social is destroying potential value relative to alternatives.

Step 3 — The mechanism (mix-shift bias):
Per-channel LTV is nearly flat — Organic went from $118 → $121 (+3%), Referral from $131 → $128 (−2%), Paid Social from $62 → $58 (−6%). None of these moves are alarming in isolation.
The problem is composition: Paid Social grew from 40% → 65% of the acquisition mix. That's a 25-percentage-point shift toward the worst-LTV, worst-LTV:CAC channel. The high-quality channels (Organic, Referral) shrank from 60% to 35% of the mix combined.
This is a textbook mix-shift effect: aggregate LTV falls even when individual channels are stable, because you changed the proportions of high vs low performers in the blend.

Step 4 — Payback periods:
Organic: $9 CAC / ($121 LTV / 12 months) = 0.9 months. Cash is recovered in under a month.
Referral: $12 / ($128/12) = 1.1 months. Similarly rapid payback.
Paid Social: $44 / ($58/12) = 9.1 months. You don't recover the acquisition cost for over three quarters. This is a cash flow exposure and a churn risk window — users who stay for less than 9 months are net-negative.

Step 5 — Counterfactual (old mix, current LTV):
Apply last year's channel weights to this year's LTV: (0.38 × 121) + (0.22 × 128) + (0.40 × 58) = 46.0 + 28.2 + 23.2 = $97.4.
If the channel mix had not shifted, blended LTV today would be ~$97 — essentially the same as last year. The entire 22% blended LTV decline is attributable to the channel mix shift, not product deterioration.

Step 6 — Recommendation:
Target mix for recovery: Organic 35%, Referral 25%, Paid Social 40%.
Projected blended LTV: (0.35 × 121) + (0.25 × 128) + (0.40 × 58) = 42.4 + 32.0 + 23.2 = $97.6.
This returns blended LTV to last year's level with the same current per-channel economics.
Paid social should not be eliminated — it provides volume and reach — but should be capped at 40% of mix until LTV:CAC improves above 3:1.
Invest in growing referral (improve referral mechanics, incentive structure) and SEO (content compounding). These channels have 10x+ LTV:CAC and sub-2-month payback. They are being underinvested relative to their returns.`,keyDiagnosis:`Blended LTV declined 22% due to a channel mix shift, not product deterioration. Paid social grew from 40% to 65% of the acquisition mix — it has a 1.3x LTV:CAC ratio and a 9-month payback period. Organic and Referral (10–13x LTV:CAC, sub-2-month payback) are being crowded out.`,recommendation:`Cap paid social at 40% of acquisition mix. Reinvest in Organic SEO and Referral, which have 10x+ LTV:CAC. Set a per-channel LTV:CAC floor of 3:1 as an acquisition gate. Always report blended LTV alongside per-channel LTV — aggregate figures mask composition effects.`},keyTakeaways:[`Blended LTV is a weighted average — it falls when you acquire proportionally more users from low-LTV channels, even if each channel's LTV is flat. Always decompose by channel.`,`LTV:CAC ratio is the correct unit for channel evaluation. Paid social at 1.3x is destroying value relative to organic (13x) and referral (11x).`,`Payback period is the cash flow signal: a 9-month payback on paid social means users who churn before month 9 cost you money. Sub-2-month payback on referral means almost no user is unprofitable.`,`Mix-shift effects are silent — they don't show up as a single channel's performance degrading, so they're easy to miss until the aggregate number has already fallen significantly.`],playbookLinks:[{id:`ltv-payback`,label:`LTV & Payback Period`},{id:`acquisition-quality`,label:`Acquisition Quality`}],leadershipNote:`A Staff DS would instrument a weekly channel-mix dashboard that surfaces per-channel LTV:CAC alongside blended LTV, with an automated alert when any channel exceeds 50% of the acquisition mix. The insight "mix shifted" should never require a manual investigation — it should be visible at a glance. The leadership move is preventing the drift from happening silently, not diagnosing it after a 22% decline.`},{id:`GA10`,title:`Viral Loop Efficiency: K-Factor Dropped from 0.4 to 0.2`,subtitle:`Threadline · B2B SaaS · Viral Growth Loops`,difficulty:`staff`,isFree:!1,domain:`acquisition`,company:`Threadline`,tags:[`k-factor`,`viral-loops`,`referral-funnel`,`network-effects`,`conversion`],companies:[`Slack`,`Notion`,`Dropbox`],situation:`Threadline is a B2B team communication tool. Six months ago it had a K-factor of 0.4 — one of its key growth levers. Today the K-factor has fallen to 0.2. The growth team is alarmed.

Here is what the data shows before and after the K-factor decline:

Six months ago (K = 0.4):
- Shares per active user per month: 0.8 (each active user sends an average of 0.8 referral invites per month)
- Conversion rate of referral invites to active signups: 50%
- K-factor: 0.8 × 0.50 = 0.40

Current (K = 0.2):
- Shares per active user per month: 0.85 (essentially unchanged — slightly higher)
- Conversion rate of referral invites to active signups: 24%
- K-factor: 0.85 × 0.24 = 0.204

The growth team has been focused on improving the invite flow — they shipped a redesigned referral invite modal 5 months ago, increased referral incentives 3 months ago, and added in-product share prompts 2 months ago. Despite these investments, K-factor has continued declining.

Additional context:
- 78% of referral invite clicks now come from mobile devices (up from 41% six months ago)
- The referral landing page was redesigned 5 months ago as part of a broader brand refresh
- Average page load time on the referral landing page: 4.8 seconds on mobile (was 1.4 seconds before redesign)
- Desktop referral landing page conversion: 49% (essentially unchanged from before)
- Mobile referral landing page conversion: 11% (was 43% before redesign)

The VP of Growth wants to invest $150k in a new incentive-based referral program to "juice" K-factor. The head of engineering thinks it might be a funnel issue. You are the staff analyst.`,prompt:`Decompose the K-factor decline. Identify exactly where in the viral loop conversion broke and what caused it. Should the team invest in a new incentive program?`,frameworkSteps:[`Step 1 — State the K-factor formula and decompose it: K = shares per user × conversion rate per share. Identify which component changed.`,`Step 2 — Segment the conversion rate by device type. What does the desktop vs mobile conversion data reveal?`,`Step 3 — Quantify the impact of the mobile conversion collapse using the current mobile traffic share (78%) to compute what blended conversion would be if mobile conversion had held at 43%.`,`Step 4 — Connect the mobile conversion drop to the landing page redesign and load time data. Build the causal chain.`,`Step 5 — Evaluate the VP's proposal: would a new incentive program fix the diagnosed root cause?`,`Step 6 — Recommend the minimum-cost fix and project the K-factor recovery if mobile conversion is restored.`],hints:[`K-factor formula: K = (shares per user) × (conversion rate of shares). Sharing rate is 0.85 (unchanged), conversion rate dropped from 50% → 24%. The entire K-factor decline is in the conversion step, not the sharing step.`,`Blended conversion breakdown: 78% of clicks are mobile at 11% conversion; 22% are desktop at 49% conversion. Weighted: (0.78 × 11%) + (0.22 × 49%) = 8.6% + 10.8% = 19.4%. Close to the observed 24% (some simplification in the numbers, but the mechanism is clear).`,`Counterfactual: if mobile conversion had held at 43%: (0.78 × 43%) + (0.22 × 49%) = 33.5% + 10.8% = 44.3% blended conversion. K-factor would be 0.85 × 0.443 = 0.38 — essentially unchanged from the 0.40 baseline.`,`The 4.8-second mobile load time vs 1.4 seconds before redesign is a 3.4x slowdown. Research consistently shows mobile conversion drops ~7% per second of load time increase above 2 seconds. A 4.8-second load on mobile is conversion-killing.`,`Incentive programs increase sharing rate, not conversion rate. The sharing rate is already 0.85 — it's fine. Spending $150k on incentives addresses the wrong variable.`],modelAnswer:{walkthrough:`Step 1 — K-factor decomposition:
K = shares per user × conversion rate of shares.
Six months ago: 0.8 × 0.50 = 0.40.
Today: 0.85 × 0.24 = 0.204.

The sharing rate actually increased slightly (0.8 → 0.85). The entire K-factor collapse is in the conversion rate: 50% → 24%, a 52% decline. This is critical: the growth team has been optimizing the invite flow (sharing step) while the conversion step (landing page) has been collapsing.

Step 2 — Device segmentation of conversion:
Desktop conversion: 49% — unchanged from baseline.
Mobile conversion: 11% — was 43%, a 74% collapse.
Mobile share of clicks: 78% — has nearly doubled from 41% six months ago.

The mobile conversion is catastrophically broken. Desktop is functioning normally.

Step 3 — Quantify blended conversion impact:
Current blended: (0.78 × 11%) + (0.22 × 49%) = 8.6% + 10.8% = 19.4% (roughly matching observed 24% with rounding).
Counterfactual if mobile held at 43%: (0.78 × 43%) + (0.22 × 49%) = 33.5% + 10.8% = 44.3%.
K-factor under counterfactual: 0.85 × 0.443 = 0.377 ≈ 0.40.
If mobile conversion had held, K-factor would be essentially unchanged from the baseline. The mobile landing page is responsible for essentially the entire K-factor decline.

Step 4 — Root cause: landing page redesign + mobile performance:
The referral landing page was redesigned 5 months ago — which is exactly when the K-factor started declining.
Mobile load time: 4.8 seconds (was 1.4 seconds). This is a 3.4x increase in load time.
Mobile is now 78% of referral traffic (up from 41%) — the platform's referral audience has become predominantly mobile, and the redesigned page is 3.4x slower on the device type that matters most.
The causal chain: brand refresh redesign → increased page weight/complexity → 4.8s mobile load time → 74% drop in mobile conversion → blended conversion collapse → K-factor halved.
The growth team's interventions (invite modal redesign, incentives, share prompts) all targeted the sharing step, which was not broken.

Step 5 — Evaluate the VP's $150k incentive proposal:
Incentive programs drive sharing rate, not conversion rate. Sharing rate is already healthy at 0.85. Spending $150k to push sharing rate from 0.85 → perhaps 1.1 would yield: K = 1.1 × 0.24 = 0.264 — still 34% below the original K = 0.4. The incentive program would not fix the conversion problem. It would be expensive and ineffective at the root cause.

Step 6 — Minimum-cost fix:
Priority 1: Fix mobile page performance. Target load time ≤ 1.5 seconds. This likely requires image compression, lazy loading, code splitting, and possibly reverting to a lighter landing page design. Engineering cost: 1–2 sprints.
Priority 2: While the fix is in progress, serve a lightweight mobile landing page (stripped version of the current design) as an interim A/B variant.
Projected K-factor recovery: if mobile conversion returns to 40% (slightly below original 43% to be conservative): (0.78 × 40%) + (0.22 × 49%) = 31.2% + 10.8% = 42.0% blended. K = 0.85 × 0.42 = 0.357 — 89% of original K-factor restored.
Do not launch the $150k incentive program until the conversion step is healthy. Incentives increase sharing into a broken landing page — you're spending money to route more users to a page that loses them.`,keyDiagnosis:`K-factor collapsed from 0.4 to 0.2 entirely due to mobile landing page conversion dropping from 43% to 11% — a direct result of the brand refresh redesign increasing mobile load time from 1.4s to 4.8s. Sharing rate is unchanged. Desktop conversion is unchanged. The growth team has been optimizing the wrong step.`,recommendation:`Fix mobile landing page performance immediately — target ≤1.5s load time. Do not invest in incentive programs until the conversion step is restored. The $150k incentive budget would address sharing rate (healthy) while ignoring conversion rate (catastrophically broken).`},keyTakeaways:[`K-factor = shares per user × conversion rate per share. Never diagnose K-factor as a single number — always decompose sharing rate and conversion rate separately. They break for completely different reasons and require completely different fixes.`,`Device segmentation is mandatory for any funnel analysis touching mobile. Blended conversion can hide a catastrophic mobile experience if desktop is healthy.`,`Performance is conversion. A 4.8-second mobile load time is not a technical issue — it's a business issue that killed half the viral growth loop.`,`Incentive programs drive sharing, not conversion. Identifying which step is broken before choosing the fix prevents expensive misallocated effort.`],playbookLinks:[{id:`viral-loops`,label:`Viral Growth Loops`},{id:`acquisition-quality`,label:`Acquisition Quality`}],leadershipNote:`A Staff DS would instrument K-factor as two separate metrics on the growth dashboard — sharing rate and referral conversion rate — with device breakdowns for both. A single K-factor number hides the mechanism. The leadership failure here was five months of growth investment targeting the wrong variable because no one decomposed the metric. Staff-level work includes defining the decomposed metric structure before the first sprint, not after six months of misallocated effort.`},{id:`GA11`,title:`Paywall Conversion Stalled at 4.2% — Three Months After Launch`,subtitle:`Nova · Subscription Fitness App · Freemium Monetization`,difficulty:`senior`,isFree:!1,domain:`funnel`,company:`Nova`,tags:[`paywall`,`freemium`,`monetization`,`conversion`,`activation`,`cohort-analysis`],companies:[`Spotify`,`Duolingo`,`Headspace`],situation:`Nova is a freemium fitness app. Three months ago it launched a paywall, converting its most popular features to paid-only access. Leadership expected paywall conversion to start low and grow as the product improved and more users reached the paywall.

Here is the conversion data by week:

Week 1 (launch): 4.8% of free users who hit the paywall converted to paid.
Week 2: 4.6%
Week 4: 4.3%
Week 8: 4.2%
Week 12: 4.1%

The product team has shipped two paywall UI tests (Week 4 and Week 7), added a free trial offer (Week 6), and highlighted additional premium features in the modal (Week 9). None of these changes moved the conversion rate. Leadership expected 8–10% conversion by Month 3.

Additional data:
- Week 1 converters: avg 11.4 sessions/month before converting, used 4.2 of 6 premium features in free tier before paywall went live.
- Current free users hitting the paywall (Week 12): avg 3.1 sessions/month, use 1.6 of 6 premium features.
- Feature activation rate (% of free users completing core workout flow): Week 1 = 68%, Week 12 = 41%.
- D30 retention of paid users from Week 1 cohort: 81%. D30 retention of paid users from Week 12 cohort: 62%.

The head of product wants to reduce the paywall price from $9.99 → $6.99. The growth PM wants to add more aggressive push notifications to drive users to the paywall more frequently. The VP of Revenue wants to understand why tests aren't moving the needle before changing price.`,prompt:`Diagnose why paywall conversion is flat and declining despite product iteration. Who is right — the head of product (lower price) or the growth PM (more notifications)? What is the actual lever to pull?`,frameworkSteps:[`Step 1 — Analyze the cohort composition shift. Who is hitting the paywall in Week 1 vs Week 12? What has changed about the quality of users reaching the paywall?`,`Step 2 — Identify the activation depth gap. Connect session frequency and feature usage data to conversion rate. What does the data say about the relationship between activation and conversion?`,`Step 3 — Apply the launch cohort dynamics framework: explain why Week 1 conversion (4.8%) was almost certainly the ceiling, not a baseline to grow from.`,`Step 4 — Evaluate the price reduction hypothesis. Would lowering price from $9.99 → $6.99 fix the root cause? Show the math on what conversion rate would need to be to offset the price reduction.`,`Step 5 — Evaluate the notification hypothesis. What happens when you push low-activation users to the paywall more frequently?`,`Step 6 — Identify the correct diagnosis and the highest-leverage intervention.`],hints:[`Week 1 converters had 11.4 sessions/month and used 4.2/6 premium features. Week 12 paywall visitors have 3.1 sessions/month and use 1.6/6 features. These are fundamentally different populations — one is deeply activated, one is not.`,`Feature activation rate dropped from 68% to 41% in three months. The free user base is increasingly populated by low-engagement users who never completed the core product loop.`,`Launch cohort dynamics: the users who convert in Week 1 of a paywall launch are the "early adopters" who were already engaged and waiting for a way to pay. They will always convert at a higher rate. Comparing Week 12 conversion to Week 1 is like comparing a sequel's opening weekend to the original's — the most motivated audience came first.`,`Price reduction math: lowering from $9.99 → $6.99 is a 30% price cut. To maintain the same revenue, you need conversion rate to increase from 4.1% to 4.1% / 0.7 = 5.86%. Is a 43% conversion improvement (from 4.1% to 5.86%) realistic for a population averaging 3.1 sessions/month? Almost certainly not.`,`Push notifications to low-activation users increase paywall impressions but not conversion. If a user with 3.1 sessions/month and 1.6 feature uses hasn't converted, seeing the paywall again without using the product more won't change the decision.`],modelAnswer:{walkthrough:`Step 1 — Cohort composition shift (who is hitting the paywall):
Week 1 paywall visitors: 11.4 sessions/month, 4.2/6 premium features used. These are deeply activated users — they know the product, they've extracted near-full value from the free tier, and the paywall blocks something they already want.
Week 12 paywall visitors: 3.1 sessions/month, 1.6/6 features used. These users are hitting the paywall incidentally. They've barely explored the product. The paywall is surfacing before they've found a reason to pay.

The conversion rate didn't "stall" — it declined because the population changed. 4.8% in Week 1 with highly activated users is effectively the same conversion quality as 4.1% in Week 12 with barely activated users. The absolute rate is slightly lower, but the real story is that the activated segment is exhausted.

Step 2 — Activation depth and conversion:
Feature activation rate (core workout flow completion): 68% → 41%. In three months, 27 percentage points fewer free users are completing the core product loop. These users have not experienced the value that makes the paywall compelling.

The data reveals a clear pattern:
- High activation (11.4 sessions, 4.2 features) → 4.8% conversion.
- Low activation (3.1 sessions, 1.6 features) → ≤4.1% conversion.
More importantly: D30 retention of paid users is 81% (Week 1 cohort) vs 62% (Week 12 cohort). Even among the users who convert, those with lower activation churn faster after paying — they're converting without conviction.

Step 3 — Launch cohort dynamics:
This is a classic launch cohort effect. When a freemium product launches a paywall, it simultaneously reaches every user who has ever used the product. The first week's conversion pool includes users who have been using the product for months or years and have deep activation. This pool is irreplaceable — those users convert and are gone. Every subsequent week, the paywall faces an increasingly average-activation population.

Leadership's expectation that conversion would "grow from 4.8% toward 8–10%" was based on a misunderstanding of this dynamic. Week 1 was almost certainly close to the ceiling for the current product-activation state, not a floor. The target of 8–10% would require either (a) dramatically increasing the activation depth of free users before they hit the paywall, or (b) improving the paywall offer itself substantially.

Step 4 — Price reduction hypothesis:
Current: 4.1% conversion at $9.99.
Proposed: $6.99 (30% price cut).
Revenue equivalence: 4.1% × $9.99 = $0.41/user. At $6.99, you need 0.41/6.99 = 5.87% conversion to match. That requires a +43% relative conversion improvement.
Can a price drop from $9.99 → $6.99 drive +43% conversion improvement for a population averaging 3.1 sessions/month? Almost certainly not. Price sensitivity is not the primary barrier for low-activation users — they haven't found enough value to want the product at any reasonable price. Price reduction would primarily discount sales to the small share of users who were already going to convert, while not moving the larger low-activation pool.

Step 5 — Notification hypothesis:
More notifications increase paywall impressions among low-activation users. More impressions of the paywall to users who haven't found the product's core value are not going to drive conversion. You risk notification fatigue (declining open rates over time), which would reduce even the organic paywall traffic. This is the same hollow engagement trap as GA06 — you're measuring a top-of-funnel signal (paywall impressions) while ignoring the bottom-of-funnel problem (activation depth).

Step 6 — Correct diagnosis and intervention:
Root cause: the paywall conversion "stall" is actually a free user activation collapse. 41% of free users complete the core workout flow vs 68% at launch. The users reaching the paywall are not activated enough to convert.

The right intervention is activation improvement, not paywall optimization or price reduction.
Specific interventions:
(a) Improve new user onboarding to get more users to complete the core workout flow. Target: lift feature activation from 41% back toward 60%+.
(b) Gate the paywall behind activation — don't show the paywall until a user has completed at least 3 sessions and used at least 2 premium features. This ensures the paywall is only shown to users who have found value.
(c) Test a free trial (already tried in Week 6 — confirm whether it was properly targeted or shown to all users indiscriminately). A trial works best when shown to activated users, not cold ones.

The paywall UI tests, feature callouts, and price testing are not wrong — but they are the wrong intervention at this stage. Fix activation first, then optimize the paywall.`,keyDiagnosis:`Paywall conversion is flat because the free user activation depth is collapsing, not because the paywall design is wrong or the price is too high. Week 12 paywall visitors have 3.1 sessions/month vs 11.4 for Week 1 converters. The launch cohort converted the most motivated users first — this is a permanent dynamic, not a recoverable curve.`,recommendation:`Fix user activation before adjusting the paywall. Target: increase feature activation rate from 41% back to 60%+. Gate the paywall behind a minimum activation threshold (e.g., 3 sessions + 2 feature uses). Do not reduce price or launch an aggressive notification campaign — both address the wrong variable.`},keyTakeaways:[`Launch cohort dynamics make Week 1 paywall conversion the high-water mark, not the baseline. The most motivated users convert first — every subsequent cohort is less activated. Never benchmark against Week 1.`,`Paywall conversion is a lagging indicator of activation depth. When activation collapses, paywall conversion will follow weeks later. Track activation rate as the leading indicator.`,`Price reduction is rarely the right lever for low-activation free users — they haven't found enough value to pay at any reasonable price. Save price testing for users with demonstrated engagement.`,`Steady-state paywall health should be judged on activated-user conversion (users who completed the core product loop), not on raw conversion across all users who ever hit the paywall.`],playbookLinks:[{id:`paywall-conversion`,label:`Paywall Conversion`},{id:`funnel-analysis-framework`,label:`Funnel Analysis`}],leadershipNote:`A Staff DS would build a cohort-segmented paywall dashboard that tracks conversion separately for "activated" users (completed core loop) vs "cold" users (never completed core loop). Blended paywall conversion is nearly useless as a north star — it falls when you acquire more cold users even if activated-user conversion is healthy. The leadership move is defining the right denominator for the metric before the paywall launches, not discovering the segmentation problem three months in.`},{id:`GA12`,title:`Geographic Expansion: New Markets Retain at 60% of Core Market Rate`,subtitle:`Crafted Marketplace · International Expansion · Retention & Localization`,difficulty:`senior`,isFree:!1,domain:`retention`,company:`Crafted Marketplace`,tags:[`geographic-expansion`,`retention`,`localization`,`pmf`,`cohort-analysis`,`payment-methods`],companies:[`Airbnb`,`Shopify`,`Grab`],situation:`Crafted Marketplace expanded into Latin America (LatAm) and Southeast Asia (SEA) eight months ago. The expansion team is now reviewing cohort data and flagging a significant retention gap.

US market (core, mature):
- D30 retention: 38%
- D90 retention: 24%
- First-purchase conversion: 31%
- Payment methods supported: credit card, debit card, PayPal, Apple Pay, Buy Now Pay Later
- Language: fully localized
- Currency: USD displayed natively

LatAm markets (Brazil, Mexico, Colombia):
- D30 retention: 23%
- D90 retention: 11%
- First-purchase conversion: 9%
- Payment methods: credit card only (18% penetration in target demographics)
- Language: English interface (Spanish/Portuguese localization not yet shipped)
- Currency: USD displayed (local currency conversion not available)
- Key features with near-zero usage: installment payments (0.3%), local seller discovery (2.1%), mobile checkout (4.8%)

SEA markets (Indonesia, Thailand, Vietnam):
- D30 retention: 26%
- D90 retention: 14%
- First-purchase conversion: 12%
- Payment methods: credit card and bank transfer (credit card penetration 22%)
- Language: English interface (local language localization partial — 40% of UI translated)
- Currency: USD displayed
- Key features with near-zero usage: local seller browse (3.2%), installment checkout (0.8%), mobile wallet (1.1%)

The expansion team argues: "Retention will improve naturally as the markets mature and users get used to the platform. The 23–26% D30 vs 38% US gap is structural — different markets have different engagement habits. We should keep scaling acquisition."

The CFO wants to pause acquisition spend in new markets until retention improves. You are the senior analyst with 48 hours to make a recommendation.`,prompt:`Diagnose whether the geographic retention gap is structural (inherent market differences) or fixable (localization and product gaps). Recommend whether to scale, pause, or fix-first.`,frameworkSteps:[`Step 1 — Identify the structural vs fixable components of the retention gap. What would a "structural" gap look like in the data? What would a "fixable" gap look like?`,`Step 2 — Analyze the feature usage data for new markets. Near-zero usage of specific features is a diagnostic signal — what does it reveal?`,`Step 3 — Quantify the payment method gap. Compute what share of new market users literally cannot complete a purchase with available payment methods.`,`Step 4 — Compare first-purchase conversion rates: US (31%) vs LatAm (9%) vs SEA (12%). Apply the GA08 lesson — first-purchase conversion is the most immediate PMF signal.`,`Step 5 — Distinguish between acquisition quality (lower-intent users from broad campaigns) and product experience quality (localization, payment, currency gaps). Which explains more of the gap?`,`Step 6 — Recommend a prioritized fix-first plan with specific interventions and success gates before resuming scaled acquisition.`],hints:[`Structural gap signals: both markets would show lower engagement depth but similar feature usage patterns; conversion rates would be proportionally lower but driven by demand difference, not friction. Structural gaps are harder to close quickly.`,`Fixable gap signals: near-zero feature usage on features that are unavailable or broken in new markets; low conversion driven by payment friction (users who want to buy but can't); retention curves that improve after product/localization fixes.`,`Payment reality: LatAm credit card penetration 18% means 82% of users cannot pay with the only available method. SEA at 22% means 78% of users have no payment method. The product is functionally non-transactional for most of its new market users.`,`Feature usage at near-zero: installment payments (0.3%), local seller discovery (2.1%), mobile checkout (4.8%) in LatAm aren't "features users don't want" — they're features the users literally cannot use because they're not localized or payment-gated.`,`Acquisition quality: broad paid campaigns in new markets attract lower-intent users. But even high-intent users can't convert without payment methods and a localized UI. Both factors are present — but the localization/payment gap is addressable, the intent gap only partially so.`],modelAnswer:{walkthrough:`Step 1 — Structural vs fixable gap framework:
A structural retention gap would look like: similar feature usage patterns at lower absolute frequency, proportionally lower but non-zero conversion, retention curves that are lower but stabilize at a healthy floor, no specific feature usage anomalies.

A fixable gap looks like: near-zero usage on specific features (indicating the features don't work for this population), low first-purchase conversion despite apparent interest (indicating payment or UX friction), retention curves still declining with no floor (indicating users are leaving before finding value, not after finding limited value).

The new market data matches the fixable gap pattern on nearly every dimension.

Step 2 — Feature usage analysis:
LatAm near-zero features: installment payments (0.3%), local seller discovery (2.1%), mobile checkout (4.8%).
SEA near-zero features: local seller browse (3.2%), installment checkout (0.8%), mobile wallet (1.1%).

These aren't features users don't want — they're features users in these markets need most and cannot use.
Installment payments (parcelamento in Brazil, cuotas in Mexico) are standard purchase behavior in LatAm — many consumers never buy large items without installments. A 0.3% usage rate means the feature is effectively non-functional for this market.
Local seller discovery: with primarily US sellers displayed to LatAm/SEA users, users cannot find locally-relevant products. Cross-border shipping costs and times make most US seller inventory impractical for new market buyers.
Mobile wallet: in SEA markets like Indonesia, mobile wallets (GoPay, OVO, GrabPay) handle 60–70% of digital commerce. 1.1% usage means virtually no one can use the dominant payment method.

Step 3 — Payment method gap:
LatAm: credit card only, 18% penetration → 82% of target demographic users literally cannot complete a purchase.
SEA: credit card + bank transfer, credit card penetration 22%. Bank transfer is available but typically slow (not instant checkout). Mobile wallets not supported → dominant payment method blocked.
First-purchase conversion reality: 9% in LatAm. Even at 18% credit card penetration, a 9% first-purchase conversion means that roughly half of users who could pay didn't. The product experience (English UI, USD currency, no local seller relevance) is a second barrier on top of the payment gap.

Step 4 — First-purchase conversion as PMF signal:
US: 31%. LatAm: 9%. SEA: 12%.
These are 71% and 61% below the US rate respectively. This level of gap is far beyond what demand differences explain — SEA markets have strong consumer e-commerce adoption, LatAm has strong mobile commerce growth. The gap is friction, not intent.
The GA08 framework applies directly: first-purchase conversion at 9–12% signals structural product blockers, not market-level behavioral differences.

Step 5 — Acquisition quality vs product experience:
Acquisition quality issue: broad paid campaigns do attract lower-intent users. But even high-intent users face: an English-only interface in markets where English penetration is 20–40%, USD pricing with no local currency equivalent, payment methods unavailable to 78–82% of the population, and no locally relevant product supply (US sellers only).
The product experience gap is not subtle — it's a blocking issue for most users. Acquisition quality explains a portion of the gap; localization and payment gaps explain the majority.

Step 6 — Fix-first plan with gates:
Priority 1 (Month 1–2): Payment method expansion.
LatAm: Add Pix (Brazil, instant bank transfer, ~70M users), OXXO (Mexico, cash payment), local installment options (parcelamento).
SEA: Add GoPay/OVO (Indonesia), PromptPay (Thailand), MoMo (Vietnam).
Gate: first-purchase conversion must reach ≥18% in LatAm and ≥20% in SEA before resuming scaled acquisition.

Priority 2 (Month 2–3): UI localization.
Spanish and Portuguese full localization for LatAm. Local currency display (BRL, MXN, COP). Bahasa Indonesia, Thai for SEA markets. Local currency (IDR, THB).
Gate: feature activation rate (completing first purchase flow) must improve to ≥15% in new markets.

Priority 3 (Month 3–4): Local seller supply.
Onboard LatAm and SEA sellers to build locally-relevant inventory. Target 500+ active local sellers per major country before scaling acquisition.

Current recommendation: Pause scaled acquisition. Maintain a small retention-focused budget to serve current acquired users and test product improvements. The expansion team's argument that the gap is "structural" is contradicted by near-zero feature usage on core transactional features — these are fixable gaps, not market behavior differences.`,keyDiagnosis:`The D30 retention gap (38% US vs 23% LatAm, 26% SEA) is primarily fixable, not structural. Near-zero usage of payment and checkout features confirms that 78–82% of new market users cannot complete transactions. First-purchase conversion at 9–12% (vs 31% US) signals payment and localization friction, not fundamental demand gaps.`,recommendation:`Fix-first: pause scaled acquisition and invest new market budget in (1) local payment methods (Pix, OXXO, mobile wallets), (2) Spanish/Portuguese/Bahasa UI localization and local currency display, (3) local seller acquisition. Resume scaled acquisition when first-purchase conversion exceeds 18% (LatAm) and 20% (SEA).`},keyTakeaways:[`Never accept a geographic retention gap as "structural" without first ruling out localization and payment method gaps. Near-zero feature usage is the diagnostic — it means the feature is broken for that market, not irrelevant.`,`Payment method coverage is table stakes for international e-commerce. Launching with credit-card-only into markets where credit card penetration is 18–22% means 80% of your target users are functionally blocked from transacting.`,`First-purchase conversion is the most immediate PMF signal in a marketplace. A gap of 61–71% below the core market rate is a product problem, not a demand problem — especially in markets with demonstrated e-commerce adoption.`,`Structural gaps (genuine behavioral or demand differences) close slowly with time. Fixable gaps (payment, localization, supply) close quickly once the fixes ship. Identify which type you have before deciding whether to scale or fix.`],playbookLinks:[{id:`geographic-retention`,label:`Geographic Retention Analysis`},{id:`cohort-retention-curves`,label:`Cohort Retention Curves`}],leadershipNote:`A Staff DS would build a "market readiness scorecard" that evaluates each new market on payment method coverage, UI localization completeness, and first-purchase conversion before acquisition spend is authorized. The scorecard exists before the expansion launch — not as a post-hoc analysis three months after the retention gap appears. The geographic retention gap in this case was entirely predictable from the product configuration. A Director of Analytics would have flagged it at launch as a blocker.`}];Object.fromEntries(e.map(e=>[e.id,e]));export{e as t};