# Meesho SBA/LBA Interview Prep — Full Question Handoff

Source: ChatGPT handoff, June 2026. Candidate's own prep for Meesho Senior Business Analyst / Lead Business Analyst rounds.

Use this as the content source for Meesho Company Track expansion — directorCards, full cases, SQL problems.

---

## Core Meesho Marketplace Mental Model

Mission / North Star → Demand → Discovery → Catalog → Buyer Decision / PDP → Checkout + Payment → Fulfillment → Delivery / RTO / Returns → Trust + Repeat → Unit Economics → Seller Ecosystem

---

## 1. RCA / Business Diagnosis Questions

- Orders are down but sessions are stable. Diagnose.
- Contribution is down but orders are stable. Diagnose.
- RTO is up in Tier 2 / Tier 3 cities. Diagnose.
- Search CTR is up but orders are down. Diagnose.
- Returns are up in one category. Diagnose.
- Seller cancellations are increasing. Diagnose.
- Repeat purchase rate is down. Diagnose.
- Checkout conversion is down. Diagnose.
- PDP views are up but add-to-cart/order rate is down. Diagnose.
- Delivered orders are down but placed orders are up. Diagnose.
- A category is growing in orders but hurting contribution. Diagnose.
- A seller cohort has high sales but poor buyer experience. Diagnose.
- Tail-query performance has dropped while head queries are fine. Diagnose.
- Payment success rate dropped after a new checkout/payment change. Diagnose.
- Catalog-related complaints are rising. Diagnose.

---

## 2. Experiment Design Questions

- Design an A/B test for a new search ranking model.
- Design an experiment to increase prepaid adoption without hurting orders.
- Design an experiment to reduce checkout steps.
- Design an experiment to add COD confirmation for high-risk users.
- Design an experiment to improve catalog quality nudges for sellers.
- Design an experiment to boost high-quality sellers in ranking.
- Design an experiment for a new recommendation/personalized feed model.
- Design an experiment to reduce RTO.
- Design an experiment to reduce returns in fashion/apparel.
- Design an experiment to improve repeat purchase.
- Design an experiment to test a delivery promise / ETA display change.
- Design an experiment to test seller trust badges or product quality badges.

---

## 3. Experiment Readout / Launch Decision Questions

- CTR improved, but CVR/contribution/net delivered orders dropped. Ship or not?
- Prepaid adoption improved, but orders/payment success dropped. Ship or not?
- Checkout conversion improved, but RTO and contribution worsened. Ship or not?
- Search model improves head queries but hurts tail queries. Ship or not?
- Orders improved but contribution worsened. Ship or not?
- RTO fell but checkout conversion/order volume also fell. Ship or not?
- New ranking model improves GMV but increases returns/complaints. Ship or not?
- Overall metric is positive, but one key segment is harmed. What do you do?
- Experiment aggregate is positive because high-volume segment improved, but low-volume/strategic segment worsened. What do you do?
- How do you distinguish between a real experiment effect and noisy/invalid results?
- What validity checks would you run? SRM, pre-period balance, exposure logging, duration, novelty effect, seasonality, confidence intervals.

---

## 4. KPI / Metric Framework Questions

- Define marketplace health for Meesho.
- Define seller quality metrics.
- Define catalog quality metrics.
- Define buyer trust metrics.
- Define search/recommendation quality metrics.
- Define discovery health metrics.
- Define checkout/payment health metrics.
- Define fulfillment health metrics.
- Define RTO/returns health metrics.
- Define repeat purchase / retention health metrics.
- Define unit economics health metrics.
- Define category health metrics.
- Define seller ecosystem health.
- Compare two search/recommendation models: Model A has higher CTR, Model B has higher delivered orders and contribution. Which one do you choose?
- What should be Meesho's North Star metric?
- How would you build a marketplace health dashboard from scratch?

---

## 5. Marketplace Operating System / Senior-Level Questions

- If you joined Meesho as SBA/LBA, how would you understand the marketplace in your first 30 days?
- How would you build a complete marketplace health dashboard?
- How would you identify whether a problem is demand-side, supply-side, discovery-side, catalog-side, fulfillment-side, logistics-side, or economics-side?
- How would you connect demand, discovery, catalog, sellers, delivery, trust, and contribution in one operating framework?
- How would you decide which marketplace problem to prioritize?
- How would you identify leading indicators vs lagging indicators?
- How would you prevent a metric from being gamed?
- How would you balance buyer experience, seller fairness, and unit economics?
- How would you detect if growth is low-quality growth?
- How would you know if a feature is improving engagement but hurting business quality?
- How would you set up weekly/monthly business review metrics for marketplace health?

---

## 6. Discovery / Search / Recommendation Questions

- Search CTR is up but orders are down. Why?
- Head queries improved but tail queries worsened. What do you do?
- How do you evaluate a search ranking model?
- How do you evaluate a recommendation/personalized feed model?
- What metrics matter beyond CTR?
- How do you handle poor-result rate, zero-result rate, query reformulation, search-to-PDP, search-to-order, net delivered orders/search session, contribution/search session?
- How do you segment search performance by head/tail queries, category, price band, new/repeat users, city tier, seller quality, and catalog quality?
- How do you prevent ranking models from over-optimizing for clicks?
- How do you avoid over-ranking expensive/high-margin but irrelevant products?
- How do you balance relevance, conversion, contribution, seller fairness, and trust?

---

## 7. Catalog / Seller / Supply Questions

- How would you define catalog quality?
- How would you define seller quality?
- What makes a catalog bad?
- What makes a seller bad?
- How would you separate seller-caused RTO/returns from buyer/logistics-caused RTO/returns?
- How would you identify misleading listings?
- How would you use catalog quality in ranking?
- How would you coach sellers using analytics?
- How would you design seller quality score?
- How would you avoid unfairly penalizing new/low-volume sellers?
- How would you handle category differences in return/RTO rates?
- How would you detect seller cancellation issues?
- How would you improve catalog completeness, image quality, categorization, size/spec accuracy, and mismatch complaints?

---

## 8. Checkout / Payment / COD Questions

- How would you improve prepaid adoption without hurting orders?
- How would you evaluate a COD confirmation step?
- How would you reduce checkout friction?
- Checkout completion increased but RTO increased. What happened?
- Payment success dropped. How would you diagnose?
- What is the right denominator for payment/checkout experiments?
- How do you think about prepaid adoption vs payment failure vs checkout completion vs net delivered orders vs contribution?
- How would you identify high-risk COD users/orders?
- When would you partial-ramp a COD friction feature?

---

## 9. RTO / Returns / Trust Questions

- RTO increased in Tier 2/3. Diagnose.
- Returns increased in fashion. Diagnose.
- Delivered orders declined despite placed orders increasing. Diagnose.
- Buyer complaints increased. Diagnose.
- Repeat purchase decreased. Diagnose.
- How would you separate catalog mismatch, product quality, seller issue, logistics issue, buyer intent issue, and payment/COD issue?
- What metrics indicate buyer trust damage?
- How do returns/RTO affect contribution and repeat behavior?
- What interventions reduce RTO without hurting good orders?

---

## 10. Unit Economics / Profitability Questions

- Orders are stable but contribution is down. Diagnose.
- GMV is up but contribution is down. What could be happening?
- How do RTO, returns, logistics cost, discount cost, payment cost, and support cost affect contribution?
- How would you build a contribution bridge?
- How do you decide whether to ship a feature that improves orders but worsens contribution?
- How do you balance growth and profitability?
- What is a high-quality order vs low-quality order?

---

## 11. SQL / Product Analytics Likely Areas

- Funnel conversion by step: session → search/feed → PDP → ATC → checkout → payment → placed order → delivered order.
- Cohort retention / repeat purchase.
- Window functions: rank, dense_rank, lag/lead.
- Joins and duplicate handling.
- Category-level return/RTO analysis.
- Seller-level cancellation or fulfillment analysis.
- Search query performance by head/tail.
- Payment success by method/app/bank.
- Contribution bridge by category/price band.
- Identifying stores/sellers/products with consecutive bad days.
- Experiment readout queries: control vs treatment metrics, segment cuts, guardrails.

---

## 12. Project Defense / Director-HM Questions

Projects: MetricLens, MetaSignal

- What was your strongest project?
- Why did you build it?
- What business problem did it solve?
- What metrics did you define?
- How did you validate success?
- What was your role?
- What was the impact?
- What tradeoffs did you handle?
- What would you improve if you had more time?
- How is this relevant to Meesho?
- How would you apply this thinking to Meesho marketplace analytics?
- How did you influence stakeholders?
- How did you move from analysis to action?

---

## 13. Senior/HM Calibration Themes

- First-principles problem solving
- Marketplace systems thinking
- E-commerce: category, discovery, selection, pricing, personalization, supply chain
- Search/recommendation and AI-driven discovery
- User attention, engagement, relevance, habit formation
- Buyer trust and repeat behavior
- Analytics as decision-making system, not just dashboards
- Ability to handle ambiguity
- Ability to mentor/lead junior analysts
- Ability to convert analysis into operating cadence, experiments, interventions, and business outcomes

---

## 14. Candidate Prep Weaknesses To Fix

- Metric hierarchy: needs cleaner primary vs secondary vs guardrail structure
- Denominators: needs sharper denominators near the intervention point
- Compression: needs 60-90 sec answer discipline
- Decision language: ship / hold / rollback / partial-ramp — needs to be crisp
- Framing: fewer exploratory phrases, more top-down structure
- Frameworks: needs stronger marketplace health, seller quality, catalog quality frameworks
- Avoid: CTR, search-to-transaction, or GMV as primary without quality/economics guardrails
- Avoid: defaulting to "run longer" unless statistical confidence is genuinely unclear

---

## 15. Golden Answer Pattern

For most Meesho cases:

Objective → Metric decomposition → Primary metric → Guardrails → Segments → RCA / experiment logic → Decision → Action / next step

Senior-level lens:
"Is this driving successfully delivered, trust-building, contribution-healthy orders while protecting buyer experience, seller ecosystem, and long-term repeat behavior?"
