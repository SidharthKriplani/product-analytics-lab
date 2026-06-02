var e=[{id:`sql-e01`,title:`Re-engagement Targets`,company:`Amazon`,companyDomain:`amazon.com`,difficulty:`Easy`,isFree:!0,tags:[`anti-join`,`LEFT JOIN`,`NULL handling`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:5,datamartId:`ecomm`,prompt:`Marketing wants to run a re-engagement email campaign. They need a list of customers who signed up but have never placed any order. Return user_id and email, ordered by user_id.`,expectedColumns:[`user_id`,`email`],expectedRowCount:3,hints:[`What does one row in your result represent? Your output needs 3 rows with columns: user_id, email.`],checkValues:[{user_id:`13`,email:`mia@example.com`}],solution:`SELECT u.user_id, u.email
FROM users u
LEFT JOIN orders o ON u.user_id = o.user_id
WHERE o.order_id IS NULL
ORDER BY u.user_id`,debrief:`The classic anti-join pattern: LEFT JOIN then filter WHERE the right side IS NULL. A common wrong answer uses NOT IN (SELECT user_id FROM orders) — which silently returns zero rows if orders contains a single NULL user_id. The LEFT JOIN approach is null-safe and production-ready. Three users qualify: mia (13), ned (14), and ora (15). The interviewer follow-up that exposes the weak answer: "What happens to your query if one order has a NULL user_id?" NOT IN with NULLs breaks; LEFT JOIN does not.`,sqliteNote:null},{id:`sql-e02`,title:`Session Conversion by Source`,company:`Shopify`,companyDomain:`shopify.com`,difficulty:`Easy`,isFree:!0,tags:[`GROUP BY`,`aggregation`,`conversion rate`,`SUM`],roles:[`PA`,`DA`,`BA`],priority:1,estimatedMin:5,datamartId:`ecomm`,prompt:`The growth team wants to know which traffic source drives the highest purchase conversion rate. Using the sessions table, return each source with total_sessions, conversions, and conversion_pct (rounded to 1 decimal). Order by conversion_pct descending.`,expectedColumns:[`source`,`total_sessions`,`conversions`,`conversion_pct`],expectedRowCount:5,hints:[`What does one row in your result represent? Your output needs 5 rows with columns: source, total_sessions, conversions, conversion_pct.`],checkValues:[{source:`referral`}],solution:`SELECT source,
  COUNT(*) AS total_sessions,
  SUM(converted) AS conversions,
  ROUND(100.0 * SUM(converted) / COUNT(*), 1) AS conversion_pct
FROM sessions
GROUP BY source
ORDER BY conversion_pct DESC`,debrief:`Referral converts at 100% (3/3 sessions) — the highest-performing source, but also the smallest. The trap is using AVG(converted) instead of an explicit SUM/COUNT ratio. AVG works numerically here since converted is 0/1, but it hides your intent and signals weak SQL fluency in an interview. Always write the explicit formula. Social has 0% conversion — every session bounced. That is a budget decision hiding in the data.`,sqliteNote:null},{id:`sql-e03`,title:`Free-Plan Accounts for Upsell`,company:`Salesforce`,companyDomain:`salesforce.com`,difficulty:`Easy`,isFree:!0,tags:[`multi-table JOIN`,`filter`,`tier logic`],roles:[`PA`,`DA`,`PM`,`BA`],priority:1,estimatedMin:5,datamartId:`saas`,prompt:`Your CSM team wants to identify accounts currently on the free plan and prioritize them for upgrade outreach. Return account_id and company_name for all accounts with an active free-tier subscription, ordered by account_id.`,expectedColumns:[`account_id`,`company_name`],expectedRowCount:2,hints:[`What does one row in your result represent? Your output needs 2 rows with columns: account_id, company_name.`],checkValues:[{company_name:`India Foods`}],solution:`SELECT a.account_id, a.company_name
FROM accounts a
JOIN subscriptions s ON a.account_id = s.account_id
JOIN plans p ON s.plan_id = p.plan_id
WHERE p.tier = 'free' AND s.status = 'active'
ORDER BY a.account_id`,debrief:`The weak answer filters on mrr = 0 or plan name = 'Starter' — which breaks the moment the plan is renamed or repriced. Filtering on p.tier = 'free' is the stable business-logic approach. The second common mistake: forgetting s.status = 'active', which would include accounts that have already churned off the free plan. Two accounts qualify: India Foods (9) and Lima Education (12).`,sqliteNote:null},{id:`sql-e04`,title:`Active MRR by Account`,company:`HubSpot`,companyDomain:`hubspot.com`,difficulty:`Easy`,isFree:!1,tags:[`JOIN`,`filter`,`ORDER BY`,`revenue`],roles:[`PA`,`DA`,`BA`],priority:1,estimatedMin:5,datamartId:`saas`,prompt:`Finance is building a revenue dashboard. Return company_name and current mrr for every account with an active subscription, ordered from highest MRR to lowest.`,expectedColumns:[`company_name`,`mrr`],expectedRowCount:12,hints:[`What does one row in your result represent? Your output needs 12 rows with columns: company_name, mrr.`],checkValues:[{company_name:`Golf Logistics`}],solution:`SELECT a.company_name, s.mrr
FROM accounts a
JOIN subscriptions s ON a.account_id = s.account_id
WHERE s.status = 'active'
ORDER BY s.mrr DESC`,debrief:`The most common mistake: using ended_at IS NULL instead of status = 'active'. These are not equivalent — a paused subscription may have ended_at IS NULL but should not appear in a revenue report. Always filter on the explicit status column. Three accounts sit at 2999 MRR (Acme, Echo Tech, Kilo Pharma); Golf Logistics is at 999. Accounts 9 and 12 show 0 MRR — they are on the free plan and are your primary upsell targets.`,sqliteNote:null},{id:`sql-e05`,title:`High-Risk Account Exposure`,company:`Stripe`,companyDomain:`stripe.com`,difficulty:`Easy`,isFree:!1,tags:[`JOIN`,`filter`,`risk classification`],roles:[`DA`,`PA`],priority:2,estimatedMin:5,datamartId:`fintech`,prompt:`The risk team needs to audit all accounts associated with high-risk users. Return account_id, account_type, and account status for each such account, ordered by account_id.`,expectedColumns:[`account_id`,`account_type`,`status`],expectedRowCount:2,hints:[`What does one row in your result represent? Your output needs 2 rows with columns: account_id, account_type, status.`],checkValues:[{account_id:`6`,account_type:`checking`}],solution:`SELECT a.account_id, a.account_type, a.status
FROM accounts a
JOIN users u ON a.user_id = u.user_id
WHERE u.risk_tier = 'high'
ORDER BY a.account_id`,debrief:`Account 6 (user 4, frozen) and account 12 (user 9, closed) are the two high-risk accounts. The weak answer queries only accounts.status to find suspicious accounts — missing that the risk classification lives on the user, not the account. The JOIN on users is required. The interviewer follow-up: "What if a high-risk user opened three accounts?" — this query handles it correctly by returning all accounts per user, while a subquery on just accounts.user_id would miss the risk_tier join entirely.`,sqliteNote:null},{id:`sql-e06`,title:`Open Dispute Queue`,company:`PayPal`,companyDomain:`paypal.com`,difficulty:`Easy`,isFree:!1,tags:[`filter`,`NULL handling`,`IS NULL`],roles:[`DA`,`PA`,`BA`],priority:2,estimatedMin:5,datamartId:`fintech`,prompt:`Compliance reviews all unresolved disputes daily. Return dispute_id, txn_id, amount, and opened_at for all disputes that have not yet been resolved. Order by opened_at ascending.`,expectedColumns:[`dispute_id`,`txn_id`,`amount`,`opened_at`],expectedRowCount:3,hints:[`What does one row in your result represent? Your output needs 3 rows with columns: dispute_id, txn_id, amount, opened_at.`],checkValues:[{dispute_id:`3`}],solution:`SELECT dispute_id, txn_id, amount, opened_at
FROM disputes
WHERE resolved_at IS NULL
ORDER BY opened_at`,debrief:`Three disputes are unresolved: 3 ($89.99), 4 ($490.00), and 6 ($3,500.00). The classic NULL trap: WHERE resolved_at = NULL returns zero rows because NULL comparisons with = evaluate to NULL (unknown), not TRUE. IS NULL is the only correct predicate. Dispute 6 — the largest at $3,500 — is the most time-sensitive and should surface at the top of a real compliance queue. The follow-up: "How would you add a column for days open?" requires julianday() arithmetic in SQLite.`,sqliteNote:null},{id:`sql-e07`,title:`Disengaged Users`,company:`TikTok`,companyDomain:`tiktok.com`,difficulty:`Easy`,isFree:!1,tags:[`anti-join`,`LEFT JOIN`,`NULL handling`,`engagement`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:5,datamartId:`consumer`,prompt:`The growth team wants to identify registered users who have never engaged with any content. Return user_id and username for all zero-interaction users, ordered by user_id.`,expectedColumns:[`user_id`,`username`],expectedRowCount:2,hints:[`What does one row in your result represent? Your output needs 2 rows with columns: user_id, username.`],checkValues:[{user_id:`14`,username:`nina`}],solution:`SELECT u.user_id, u.username
FROM users u
LEFT JOIN interactions i ON u.user_id = i.user_id
WHERE i.interaction_id IS NULL
ORDER BY u.user_id`,debrief:`Users 14 (nina) and 15 (oscar) have never interacted with any content. The anti-join pattern appears again — the domain changes but the SQL structure is identical to the "no orders" problem. Recognizing this pattern across contexts is the signal of a fluent analyst. The NOT EXISTS alternative is logically correct but slower at scale. The weak answer adds a HAVING COUNT(i.interaction_id) = 0 after a GROUP BY — syntactically wrong without the LEFT JOIN.`,sqliteNote:null},{id:`sql-e08`,title:`Top-Performing Content`,company:`YouTube`,companyDomain:`youtube.com`,difficulty:`Easy`,isFree:!1,tags:[`GROUP BY`,`COUNT`,`ORDER BY`,`LIMIT`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:5,datamartId:`consumer`,prompt:`The editorial team wants to double down on what works. Which single content piece has received the most interactions? Return its content_id and total interaction_count.`,expectedColumns:[`content_id`,`interaction_count`],expectedRowCount:1,hints:[`What does one row in your result represent? Your output needs 1 row with columns: content_id, interaction_count.`],checkValues:[{content_id:`1`,interaction_count:`8`}],solution:`SELECT content_id, COUNT(*) AS interaction_count
FROM interactions
GROUP BY content_id
ORDER BY interaction_count DESC
LIMIT 1`,debrief:`Content piece 1 leads with 8 interactions — engaged by users 1 through 8 across view, like, share, save, and comment actions. The weak answer returns all content pieces ranked, missing the LIMIT 1. A strong answer joins to the content table to surface the category (fitness) and content type (video) alongside the ID — the editorial team needs context, not just a number. The follow-up: "What if two pieces tied?" — LIMIT 1 picks arbitrarily; RANK() OVER (ORDER BY ...) handles ties correctly.`,sqliteNote:null},{id:`sql-e09`,title:`Provider No-Show Rate`,company:`Zocdoc`,companyDomain:`zocdoc.com`,difficulty:`Easy`,isFree:!1,tags:[`GROUP BY`,`SUM`,`COUNT`,`ROUND`,`JOIN`,`rate calculation`],roles:[`DA`,`PA`,`BA`],priority:2,estimatedMin:8,datamartId:`health`,prompt:`Operations is frustrated with provider no-shows and wants to know who the worst offender is. Which provider has the highest no-show rate, and what does the underlying appointment data look like?`,expectedColumns:[`name`,`total_appts`,`no_shows`,`no_show_rate`],expectedRowCount:1,hints:[`What does one row in your result represent? Your output needs 1 row with columns: name, total_appts, no_shows, no_show_rate.`],checkValues:[{name:`Dr. Smith`}],solution:`SELECT p.name,
  COUNT(*) AS total_appts,
  SUM(a.no_show) AS no_shows,
  ROUND(100.0 * SUM(a.no_show) / COUNT(*), 1) AS no_show_rate
FROM appointments a
JOIN providers p ON a.provider_id = p.provider_id
GROUP BY p.provider_id, p.name
ORDER BY no_show_rate DESC
LIMIT 1`,debrief:`Dr. Smith has a 40% no-show rate (4 out of 10 appointments) — the highest in the practice. GROUP BY p.provider_id, p.name is the correct form: grouping on name alone would incorrectly merge two providers who share a name. AVG(no_show) is numerically equivalent here since no_show is 0/1, but the SUM/COUNT idiom is the interviewer-preferred form because it is explicit and generalizes. The follow-up: "Is 40% actually high? What context do you need?" — benchmarks by specialty, appointment type mix, patient risk factors.`,sqliteNote:null},{id:`sql-e10`,title:`Most Prescribed Drug`,company:`CVS Health`,companyDomain:`cvshealth.com`,difficulty:`Easy`,isFree:!1,tags:[`GROUP BY`,`COUNT`,`ORDER BY`,`LIMIT`],roles:[`DA`,`BA`,`PA`],priority:2,estimatedMin:5,datamartId:`health`,prompt:`The pharmacy analytics team is reviewing prescribing patterns to spot formulary optimization opportunities. Which drug has been prescribed most frequently? Return drug_name and prescription_count.`,expectedColumns:[`drug_name`,`prescription_count`],expectedRowCount:1,hints:[`What does one row in your result represent? Your output needs 1 row with columns: drug_name, prescription_count.`],checkValues:[{drug_name:`Lisinopril`,prescription_count:`5`}],solution:`SELECT drug_name, COUNT(*) AS prescription_count
FROM prescriptions
GROUP BY drug_name
ORDER BY prescription_count DESC
LIMIT 1`,debrief:`Lisinopril leads with 5 prescriptions (rxs 1, 3, 8, 12, 16) — all written for hypertension management. The weak answer groups by patient_id instead of drug_name, answering "who has the most prescriptions" rather than "what is the most prescribed drug." These are different questions. Strong follow-up: join to providers to see which provider drives the most Lisinopril volume. Also note: this counts prescription events. If the question were "how many distinct patients are on Lisinopril?" you need COUNT(DISTINCT patient_id).`,sqliteNote:null},{id:`sql-e11`,title:`Products That Never Sold`,company:`eBay`,companyDomain:`ebay.com`,difficulty:`Easy`,isFree:!1,tags:[`anti-join`,`LEFT JOIN`,`NULL handling`,`inventory`],roles:[`DA`,`PA`,`BA`],priority:2,estimatedMin:5,datamartId:`ecomm`,prompt:`The warehouse team is auditing inventory. Which products have never appeared in any order? Return product_id, name, category, and is_active for all such products.`,expectedColumns:[`product_id`,`name`,`category`,`is_active`],expectedRowCount:1,hints:[`What does one row in your result represent? Your output needs 1 row with columns: product_id, name, category, is_active.`],checkValues:[{name:`Plant Pot`}],solution:`SELECT p.product_id, p.name, p.category, p.is_active
FROM products p
LEFT JOIN order_items oi ON p.product_id = oi.product_id
WHERE oi.item_id IS NULL
ORDER BY p.product_id`,debrief:`Only Product 10 (Plant Pot, home, is_active=0) has never appeared in an order. The weak answer filters on is_active = 0 first — that finds discontinued products, not unordered products. These overlap here but diverge in production: a product can be active but unsold, or discontinued but historically popular. The LEFT JOIN on order_items with WHERE item_id IS NULL is the correct anti-join. Business implication: Plant Pot was never sold and is already marked inactive — safe to clear from inventory.`,sqliteNote:null},{id:`sql-e12`,title:`Users Who Never Logged In`,company:`Mixpanel`,companyDomain:`mixpanel.com`,difficulty:`Easy`,isFree:!1,tags:[`NULL handling`,`IS NULL`,`JOIN`,`user activation`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:5,datamartId:`saas`,prompt:`Customer success wants to flag users who have never logged in since being added to their account. Return email and company_name for all such users, ordered by user_id.`,expectedColumns:[`email`,`company_name`],expectedRowCount:2,hints:[`What does one row in your result represent? Your output needs 2 rows with columns: email, company_name.`],checkValues:[{email:`viewer2@retail.com`}],solution:`SELECT u.email, a.company_name
FROM users u
JOIN accounts a ON u.account_id = a.account_id
WHERE u.last_active_at IS NULL
ORDER BY u.user_id`,debrief:`Two users have last_active_at IS NULL: viewer2@retail.com (Blue Retail) and viewer4@delta.com (Delta Health). Both are viewer-role users — a pattern worth flagging: viewer seats are often provisioned and forgotten. The classic NULL trap: WHERE last_active_at = NULL returns zero rows because = NULL evaluates to NULL in SQL, not TRUE. IS NULL is the only correct predicate. The follow-up: "How would you find users inactive for 90+ days?" requires a date comparison with a reference date.`,sqliteNote:null},{id:`sql-h16`,title:`Total Medication Coverage Days per Patient`,company:`Doximity`,companyDomain:`doximity.com`,difficulty:`Easy`,tags:[`GROUP BY`,`SUM`,`computed metric`,`JOIN`],roles:[`PA`,`DA`,`BA`],priority:2,estimatedMin:13,datamartId:`health`,prompt:`The pharmacy team estimates medication adherence by computing total days of coverage per patient: each prescription covers days_supply × (1 + refills) days. Sum this across all prescriptions per patient and return patient id and total coverage days, ordered by coverage descending.`,expectedColumns:[`patient_id`,`total_coverage_days`],expectedRowCount:15,hints:[`What does one row in your result represent? Your output needs 15 rows with columns: patient_id, total_coverage_days.`],checkValues:[{patient_id:`2`,total_coverage_days:`450`}],solution:`SELECT patient_id, SUM(days_supply * (1 + refills)) AS total_coverage_days
FROM prescriptions
GROUP BY patient_id
ORDER BY total_coverage_days DESC`,debrief:`Patient 2 leads with 450 days (Metformin 90×3 = 270 + Sertraline 30×6 = 180). Patient 1 follows at 270 days. The formula days_supply × (1 + refills) correctly accounts for the initial fill plus each refill. Patients with long-supply chronic medications (90-day Metformin) accumulate coverage faster than those on short acute courses.`,sqliteNote:null},{id:`sql-e20`,title:`Tech Industry Accounts`,company:`Salesforce`,companyDomain:`salesforce.com`,difficulty:`Easy`,tags:[`WHERE`,`basic filter`,`industry segmentation`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:3,datamartId:`saas`,prompt:`The sales team is running a product upsell campaign targeting tech-sector accounts. Return account_id, company_name, employee_count, and created_at for all accounts in the tech industry, ordered by employee_count descending.`,expectedColumns:[`account_id`,`company_name`,`employee_count`,`created_at`],expectedRowCount:3,hints:[`What does one row in your result represent? Your output needs 3 rows with columns: account_id, company_name, employee_count, created_at.`],checkValues:[{account_id:`5`,company_name:`Echo Tech`,employee_count:`300`}],solution:`SELECT account_id, company_name, employee_count, created_at
FROM accounts
WHERE industry = 'tech'
ORDER BY employee_count DESC`,debrief:`Three tech accounts: Echo Tech (300 seats), Acme Corp (150), November SaaS (100). Echo Tech is the largest and a natural upsell candidate. In a real pipeline you'd join this to subscriptions to confirm which tier each is on before pitching an upgrade.`,sqliteNote:null},{id:`sql-e23`,title:`Verified Low-Risk Users`,company:`Stripe`,companyDomain:`stripe.com`,difficulty:`Easy`,tags:[`WHERE`,`multi-condition filter`,`risk management`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:4,datamartId:`fintech`,prompt:`The compliance team needs users who are both fully verified AND classified as low risk, to fast-track them for premium product access. Return user_id, email, and country where kyc_status = 'verified' AND risk_tier = 'low', ordered by user_id.`,expectedColumns:[`user_id`,`email`,`country`],expectedRowCount:5,hints:[`What does one row in your result represent? Your output needs 5 rows with columns: user_id, email, country.`],checkValues:[{user_id:`1`,email:`alice@fin.com`,country:`US`}],solution:`SELECT user_id, email, country
FROM users
WHERE kyc_status = 'verified'
  AND risk_tier = 'low'
ORDER BY user_id`,debrief:`Five users are both verified and low-risk: alice, carol, eve, grace, jack. User 12 (leo) is low-risk but pending KYC — excluded by the first condition. User 4 is verified but high-risk — excluded by the second. AND logic means both conditions must be true simultaneously. When compliance asks for "safe" users, you almost always need both identity verification and risk scoring.`,sqliteNote:null},{id:`sql-e26`,title:`Open Dispute Queue`,company:`Visa`,companyDomain:`visa.com`,difficulty:`Easy`,tags:[`WHERE`,`IS NULL`,`NULL handling`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:4,datamartId:`fintech`,prompt:`The disputes team needs to see all unresolved disputes to prioritize their workload. Return dispute_id, txn_id, opened_at, and amount for all disputes where resolved_at IS NULL, ordered by amount descending.`,expectedColumns:[`dispute_id`,`txn_id`,`opened_at`,`amount`],expectedRowCount:3,hints:[`What does one row in your result represent? Your output needs 3 rows with columns: dispute_id, txn_id, opened_at, amount.`],checkValues:[{dispute_id:`6`,amount:`3500.0`}],solution:`SELECT dispute_id, txn_id, opened_at, amount
FROM disputes
WHERE resolved_at IS NULL
ORDER BY amount DESC`,debrief:`Three open disputes: dispute 6 ($3,500), dispute 4 ($490), dispute 3 ($89.99). Dispute 6 is the most urgent — txn 31 at a flagged merchant (QuickTransfer). IS NULL is the required syntax — WHERE resolved_at = NULL always returns zero rows because NULL does not equal anything, including itself, by SQL standard.`,sqliteNote:null},{id:`sql-e29`,title:`Providers Accepting New Patients`,company:`Oscar Health`,companyDomain:`hioscar.com`,difficulty:`Easy`,tags:[`WHERE`,`boolean filter`,`availability`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:3,datamartId:`health`,prompt:`Member services needs to know which providers are currently accepting new patients to route incoming referrals. Return provider_id, name, specialty, and years_exp for all providers where accepts_new = 1, ordered by years_exp descending.`,expectedColumns:[`provider_id`,`name`,`specialty`,`years_exp`],expectedRowCount:4,hints:[`What does one row in your result represent? Your output needs 4 rows with columns: provider_id, name, specialty, years_exp.`],checkValues:[{provider_id:`2`,name:`Dr. Patel`,specialty:`cardiology`,years_exp:`22`}],solution:`SELECT provider_id, name, specialty, years_exp
FROM providers
WHERE accepts_new = 1
ORDER BY years_exp DESC`,debrief:`Four providers accept new patients: Dr. Patel (cardiology, 22yr), Dr. Smith (primary care, 15yr), Dr. Lee (dermatology, 8yr), Dr. Johnson (orthopedics, 5yr). Dr. Williams has 30 years of experience but is closed — a tension worth surfacing to operations if demand for primary care outstrips supply.`,sqliteNote:null},{id:`sql-e32`,title:`Most Prescribed Drugs`,company:`CVS Health`,companyDomain:`cvshealth.com`,difficulty:`Easy`,tags:[`GROUP BY`,`COUNT`,`ORDER BY`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:4,datamartId:`health`,prompt:`The pharmacy team is reviewing prescribing patterns and wants to know what we're prescribing the most. Give me a breakdown by drug.`,expectedColumns:[`drug_name`,`rx_count`],expectedRowCount:11,hints:[`What does one row in your result represent? Your output needs 11 rows with columns: drug_name, rx_count.`],checkValues:[{drug_name:`Lisinopril`,rx_count:`5`}],solution:`SELECT drug_name, COUNT(*) AS rx_count
FROM prescriptions
GROUP BY drug_name
ORDER BY rx_count DESC`,debrief:`Lisinopril leads with 5 prescriptions — consistent with hypertension being the most common diagnosis (5 I10 diagnoses). Metformin and Atorvastatin each have 3. The remaining 8 drugs appear once each. Drug utilization data like this drives formulary decisions, but always join to diagnoses to confirm the drug-indication alignment before drawing conclusions.`,sqliteNote:null},{id:`sql-e33`,title:`Transactions by Category`,company:`Mastercard`,companyDomain:`mastercard.com`,difficulty:`Easy`,tags:[`GROUP BY`,`COUNT`,`category analysis`],roles:[`PA`,`DA`],priority:1,estimatedMin:4,datamartId:`fintech`,prompt:`The analytics team wants to understand which merchant categories are seeing the most transaction volume. Can you break that down?`,expectedColumns:[`category`,`txn_count`],expectedRowCount:5,hints:[`What does one row in your result represent? Your output needs 5 rows with columns: category, txn_count.`],checkValues:[{category:`shopping`,txn_count:`14`}],solution:`SELECT category, COUNT(*) AS txn_count
FROM transactions
GROUP BY category
ORDER BY txn_count DESC`,debrief:`Shopping dominates at 14 transactions (35%), followed by food (9), travel (7), entertainment (6), utilities (4). Shopping's high share partly reflects that flagged merchants are categorized as 'shopping' — a categorization artifact. A cleaner analysis would separate flagged-merchant transactions from legitimate retail purchases before ranking categories by risk-adjusted volume.`,sqliteNote:null},{id:`sql-e34`,title:`Content Interaction Types`,company:`Instagram`,companyDomain:`instagram.com`,difficulty:`Easy`,tags:[`GROUP BY`,`COUNT`,`engagement analysis`],roles:[`PA`,`DA`,`PM`],priority:2,estimatedMin:4,datamartId:`consumer`,prompt:`The engagement team needs to know which interaction types are most common — they're recalibrating the recommender weights and want the actual distribution.`,expectedColumns:[`action`,`interaction_count`],expectedRowCount:5,hints:[`What does one row in your result represent? Your output needs 5 rows with columns: action, interaction_count.`],checkValues:[{action:`view`,interaction_count:`14`}],solution:`SELECT action, COUNT(*) AS interaction_count
FROM interactions
GROUP BY action
ORDER BY interaction_count DESC`,debrief:`Views (14) vastly outnumber all other actions combined (16 total). Likes (8) are the second most common signal. Share (2) is the rarest — shares are often the highest-intent signal for virality, so their low count is meaningful. A recommender that weights all interactions equally would over-index on passive views; this breakdown shows why signal weighting matters.`,sqliteNote:null},{id:`sql-e35`,title:`Session Source Mix`,company:`Google`,companyDomain:`google.com`,difficulty:`Easy`,tags:[`GROUP BY`,`COUNT`,`acquisition analysis`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:4,datamartId:`ecomm`,prompt:`Growth wants to know which acquisition sources are driving the most sessions right now. Pull the breakdown.`,expectedColumns:[`source`,`session_count`],expectedRowCount:5,hints:[`What does one row in your result represent? Your output needs 5 rows with columns: source, session_count.`],checkValues:[{source:`organic`,session_count:`9`}],solution:`SELECT source, COUNT(*) AS session_count
FROM sessions
GROUP BY source
ORDER BY session_count DESC`,debrief:`Organic leads with 9 sessions (36%), paid has 7 (28%), then referral, email, and social tie at 3 each (12% each). Volume alone is misleading — referral converts at 100% while social converts at 0%. The next query should add AVG(converted) per source to reveal which channels actually drive revenue.`,sqliteNote:null},{id:`sql-e36`,title:`Top 3 Most Expensive Products`,company:`Best Buy`,companyDomain:`bestbuy.com`,difficulty:`Easy`,tags:[`ORDER BY`,`LIMIT`,`top-N`],roles:[`PA`,`DA`,`PM`],priority:2,estimatedMin:3,datamartId:`ecomm`,prompt:`The category team wants to know the three highest list-price products to inform their premium shelf positioning. Return product_id, name, category, and list_price for the top 3 products by list_price descending.`,expectedColumns:[`product_id`,`name`,`category`,`list_price`],expectedRowCount:3,hints:[`What does one row in your result represent? Your output needs 3 rows with columns: product_id, name, category, list_price.`],checkValues:[{product_id:`3`,name:`Smart Watch`,list_price:`249.99`}],solution:`SELECT product_id, name, category, list_price
FROM products
ORDER BY list_price DESC
LIMIT 3`,debrief:`The three most expensive products are Smart Watch ($249.99), Winter Jacket ($159.99), and Wireless Headphones ($89.99). Smart Watch is also the highest-margin product — cost is $120, list price $249.99, yielding a 108% markup. LIMIT is simple but has a footgun: if two products shared the $249.99 price, you'd arbitrarily drop one. Use LIMIT with a tiebreaker ORDER BY column (e.g. product_id) to make results deterministic.`,sqliteNote:null},{id:`sql-e37`,title:`Events per Account`,company:`Mixpanel`,companyDomain:`mixpanel.com`,difficulty:`Easy`,tags:[`GROUP BY`,`COUNT`,`engagement`],roles:[`PA`,`DA`],priority:2,estimatedMin:4,datamartId:`saas`,prompt:`The product team wants to rank accounts by total event activity to identify the most engaged customers. Return account_id and event_count, ordered by event_count descending.`,expectedColumns:[`account_id`,`event_count`],expectedRowCount:8,hints:[`What does one row in your result represent? Your output needs 8 rows with columns: account_id, event_count.`],checkValues:[{account_id:`1`,event_count:`11`}],solution:`SELECT account_id, COUNT(*) AS event_count
FROM events
GROUP BY account_id
ORDER BY event_count DESC`,debrief:`Account 1 (Acme Corp) is most active with 11 events; account 8 (Hotel Chain) has just 1. Only 8 of 15 accounts appear — the other 7 have zero events and are invisible in this GROUP BY. To surface zero-event accounts, you'd need a LEFT JOIN from accounts to events. This is a common analyst oversight: GROUP BY only sees rows that exist.`,sqliteNote:null},{id:`sql-e39`,title:`Repeat Buyers`,company:`Amazon`,companyDomain:`amazon.com`,difficulty:`Easy`,tags:[`GROUP BY`,`HAVING`,`repeat purchase`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:5,datamartId:`ecomm`,prompt:`The retention team defines a "repeat buyer" as any user with 2 or more orders. Return user_id and order_count for all repeat buyers, ordered by order_count descending.`,expectedColumns:[`user_id`,`order_count`],expectedRowCount:11,hints:[`What does one row in your result represent? Your output needs 11 rows with columns: user_id, order_count.`],checkValues:[{user_id:`5`,order_count:`5`}],solution:`SELECT user_id, COUNT(*) AS order_count
FROM orders
GROUP BY user_id
HAVING COUNT(*) >= 2
ORDER BY order_count DESC`,debrief:`Eleven users are repeat buyers. User 5 (eve) leads with 5 orders, including three consecutive days in January 2024. HAVING filters after aggregation — it is the only way to filter on aggregated values. WHERE COUNT(*) >= 2 is a syntax error because WHERE runs before GROUP BY and has no access to the aggregated count. Users 13–15 have no orders at all and correctly do not appear.`,sqliteNote:null},{id:`sql-e40`,title:`Appointments per Provider`,company:`Zocdoc`,companyDomain:`zocdoc.com`,difficulty:`Easy`,tags:[`GROUP BY`,`COUNT`,`workload analysis`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:4,datamartId:`health`,prompt:`Operations wants to understand appointment load per provider to identify over-capacity situations. Return provider_id and appt_count for each provider, ordered by appt_count descending.`,expectedColumns:[`provider_id`,`appt_count`],expectedRowCount:6,hints:[`What does one row in your result represent? Your output needs 6 rows with columns: provider_id, appt_count.`],checkValues:[{provider_id:`1`,appt_count:`10`}],solution:`SELECT provider_id, COUNT(*) AS appt_count
FROM appointments
GROUP BY provider_id
ORDER BY appt_count DESC`,debrief:`Dr. Smith (provider 1) carries 10 appointments — more than twice any other provider. Provider 4 (psychiatry) and provider 6 (primary care) each have just 2. Provider 6 is not accepting new patients (accepts_new = 0) despite low volume — operations should explore whether capacity issues or panel closure policy is responsible.`,sqliteNote:null},{id:`sql-e42`,title:`Enterprise-Eligible Accounts`,company:`Slack`,companyDomain:`slack.com`,difficulty:`Easy`,tags:[`WHERE`,`HAVING`,`range filter`],roles:[`PA`,`DA`,`PM`],priority:2,estimatedMin:4,datamartId:`saas`,prompt:`Sales defines enterprise-eligible as accounts with 100 or more employees. Return account_id, company_name, industry, and employee_count for all such accounts, ordered by employee_count descending.`,expectedColumns:[`account_id`,`company_name`,`industry`,`employee_count`],expectedRowCount:7,hints:[`What does one row in your result represent? Your output needs 7 rows with columns: account_id, company_name, industry, employee_count.`],checkValues:[{account_id:`13`,company_name:`Mike Manufacturing`,employee_count:`500`}],solution:`SELECT account_id, company_name, industry, employee_count
FROM accounts
WHERE employee_count >= 100
ORDER BY employee_count DESC`,debrief:`Seven accounts qualify: Mike Manufacturing (500), Echo Tech (300), Kilo Pharma (250), Capitol Finance (200), Golf Logistics (120), November SaaS (100), Acme Corp (150). The most valuable upsell targets are those currently on Growth or Business plans — joining to subscriptions would immediately reveal which of these seven have headroom to move to Enterprise.`,sqliteNote:null},{id:`sql-e44`,title:`Consumer Users by Country`,company:`Duolingo`,companyDomain:`duolingo.com`,difficulty:`Easy`,tags:[`GROUP BY`,`COUNT`,`geographic analysis`],roles:[`PA`,`DA`,`PM`],priority:2,estimatedMin:4,datamartId:`consumer`,prompt:`The international team needs a country breakdown of our user base to figure out where to invest in localisation first.`,expectedColumns:[`country`,`user_count`],expectedRowCount:6,hints:[`What does one row in your result represent? Your output needs 6 rows with columns: country, user_count.`],checkValues:[{country:`US`,user_count:`10`}],solution:`SELECT country, COUNT(*) AS user_count
FROM users
GROUP BY country
ORDER BY user_count DESC`,debrief:`The US accounts for 10 of 15 users (67%). GB, CA, AU, DE, IN each have 1 user. If localization ROI is tied to user count, the US dominates every decision — but consider that non-US users may have higher willingness to pay or lower CAC in their home markets. A single-dimension count rarely tells the full story.`,sqliteNote:null},{id:`sql-e47`,title:`Churned Subscription Log`,company:`Zendesk`,companyDomain:`zendesk.com`,difficulty:`Easy`,tags:[`WHERE`,`churn analysis`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:3,datamartId:`saas`,prompt:`The retention team is building a churn analysis and needs all churned subscriptions. Return sub_id, account_id, plan_id, started_at, ended_at, and mrr for all churned subscriptions, ordered by ended_at.`,expectedColumns:[`sub_id`,`account_id`,`plan_id`,`started_at`,`ended_at`,`mrr`],expectedRowCount:5,hints:[`What does one row in your result represent? Your output needs 5 rows with columns: sub_id, account_id, plan_id, started_at, ended_at, mrr.`],checkValues:[{sub_id:`1`,account_id:`1`,mrr:`999.0`}],solution:`SELECT sub_id, account_id, plan_id, started_at, ended_at, mrr
FROM subscriptions
WHERE status = 'churned'
ORDER BY ended_at`,debrief:`Five churned subscriptions. Account 1 churned its original Business plan ($999 MRR) but then re-subscribed at Enterprise ($2,999) — so the churn is deceptive. Account 3 downgraded rather than churned outright (still active on Growth). Accounts 13, 14, 15 are genuine churn. Always check whether a churned account has a subsequent active subscription before classifying them as lost.`,sqliteNote:null},{id:`sql-e49`,title:`Avg Session Duration by Source`,company:`Shopify`,companyDomain:`shopify.com`,difficulty:`Easy`,tags:[`GROUP BY`,`AVG`,`acquisition analysis`],roles:[`PA`,`DA`],priority:2,estimatedMin:5,datamartId:`ecomm`,prompt:`The growth team wants to know whether users from different acquisition sources engage differently in a session. Compare session duration by source.`,expectedColumns:[`source`,`avg_duration_sec`],expectedRowCount:5,hints:[`What does one row in your result represent? Your output needs 5 rows with columns: source, avg_duration_sec.`],checkValues:[{source:`referral`,avg_duration_sec:`300.0`}],solution:`SELECT source, AVG(duration_sec) AS avg_duration_sec
FROM sessions
GROUP BY source
ORDER BY avg_duration_sec DESC`,debrief:`Referral sessions average 300 seconds (longest) and convert at 100%. Paid sessions are the second longest at ~293 seconds. Social is shortest at ~187 seconds and converts at 0%. Duration and conversion rate often diverge — long sessions from a low-converting source may indicate confusion rather than engagement. Always pair session duration with conversion rate before ranking channel quality.`,sqliteNote:null},{id:`sql-e51`,title:`Distinct Buyers Count`,company:`Etsy`,companyDomain:`etsy.com`,difficulty:`Easy`,tags:[`COUNT DISTINCT`,`unique users`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:4,datamartId:`ecomm`,prompt:`Quick question from the CMO — how many unique users have actually placed an order? Need a single number for the deck.`,expectedColumns:[`buyer_count`],expectedRowCount:1,hints:[`What does one row in your result represent? Your output needs 1 row with column: buyer_count.`],checkValues:[{buyer_count:`12`}],solution:`SELECT COUNT(DISTINCT user_id) AS buyer_count
FROM orders`,debrief:`12 of 15 registered users have placed at least one order — an 80% buyer activation rate. Users 13, 14, and 15 have never ordered. COUNT(DISTINCT user_id) counts each user once regardless of how many orders they placed. COUNT(user_id) would return 28 (total orders), and COUNT(*) also returns 28. DISTINCT is the critical keyword here for a unique-user count.`,sqliteNote:null},{id:`sql-e52`,title:`US Customer Orders`,company:`Amazon`,companyDomain:`amazon.com`,difficulty:`Easy`,tags:[`INNER JOIN`,`2-table JOIN`,`country filter`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:5,datamartId:`ecomm`,prompt:`The US logistics team needs a list of all orders placed by US-based customers. Return order_id, user_id, email, created_at, and subtotal for all orders where country = 'US', ordered by created_at.`,expectedColumns:[`order_id`,`user_id`,`email`,`created_at`,`subtotal`],expectedRowCount:15,hints:[`What does one row in your result represent? Your output needs 15 rows with columns: order_id, user_id, email, created_at, subtotal.`],checkValues:[],solution:`SELECT o.order_id, o.user_id, u.email, o.created_at, o.subtotal
FROM orders o
JOIN users u ON o.user_id = u.user_id
WHERE u.country = 'US'
ORDER BY o.created_at`,debrief:`US users (1,3,5,7,9) placed 15 of the 28 total orders (54%). The JOIN on user_id connects orders to user attributes — without it, you can't filter by country since orders only stores user_id. This is the fundamental reason to JOIN rather than filter the orders table directly: customer attributes live in users, not orders.`,sqliteNote:null},{id:`sql-e54`,title:`Referred Consumer Users`,company:`Dropbox`,companyDomain:`dropbox.com`,difficulty:`Easy`,tags:[`WHERE`,`IS NOT NULL`,`referral program`],roles:[`PA`,`DA`,`PM`],priority:2,estimatedMin:4,datamartId:`consumer`,prompt:`The growth team wants to measure referral program reach. Return user_id, username, device_os, and referrer_id for all users who joined via a referral (referrer_id IS NOT NULL), ordered by user_id.`,expectedColumns:[`user_id`,`username`,`device_os`,`referrer_id`],expectedRowCount:7,hints:[`What does one row in your result represent? Your output needs 7 rows with columns: user_id, username, device_os, referrer_id.`],checkValues:[{user_id:`2`,username:`bob`,referrer_id:`1`}],solution:`SELECT user_id, username, device_os, referrer_id
FROM users
WHERE referrer_id IS NOT NULL
ORDER BY user_id`,debrief:`7 of 15 users (47%) were referred by another user. IS NOT NULL is the correct syntax for checking presence of a value — WHERE referrer_id != NULL returns zero rows. The referral chain extends multiple levels: user 2 referred user 7, who referred user 10, who referred user 12. Viral loops like this are worth visualizing as a tree to measure referral depth.`,sqliteNote:null},{id:`sql-e55`,title:`Never-Active Saas Users`,company:`Intercom`,companyDomain:`intercom.com`,difficulty:`Easy`,tags:[`WHERE`,`IS NULL`,`user activation`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:4,datamartId:`saas`,prompt:`The activation team wants to identify users who have never logged in (last_active_at IS NULL) to trigger an onboarding nudge. Return user_id, account_id, email, and role for all users with no recorded activity, ordered by user_id.`,expectedColumns:[`user_id`,`account_id`,`email`,`role`],expectedRowCount:2,hints:[`What does one row in your result represent? Your output needs 2 rows with columns: user_id, account_id, email, role.`],checkValues:[{user_id:`6`,email:`viewer2@retail.com`,role:`viewer`}],solution:`SELECT user_id, account_id, email, role
FROM users
WHERE last_active_at IS NULL
ORDER BY user_id`,debrief:`Two users have never been active: viewer2@retail.com (account 2, viewer) and viewer4@delta.com (account 4, viewer). Both are viewers — the lowest-privilege role. This pattern is common: viewers are often added to satisfy team requirements but never actually use the product. A viewer-specific onboarding flow may improve activation for this segment.`,sqliteNote:null},{id:`sql-e56`,title:`Transactions at Non-US Merchants`,company:`JPMorgan Chase`,companyDomain:`jpmorganchase.com`,difficulty:`Easy`,tags:[`JOIN`,`WHERE`,`cross-border transactions`],roles:[`PA`,`DA`],priority:2,estimatedMin:5,datamartId:`fintech`,prompt:`The compliance team wants to flag all transactions at non-US merchants for cross-border review. Return txn_id, amount, category, occurred_at, and the merchant name and country for all transactions where the merchant's country is not 'US'.`,expectedColumns:[`txn_id`,`amount`,`category`,`occurred_at`,`name`,`country`],expectedRowCount:9,hints:[`What does one row in your result represent? Your output needs 9 rows with columns: txn_id, amount, category, occurred_at, name, country.`],checkValues:[],solution:`SELECT t.txn_id, t.amount, t.category, t.occurred_at, m.name, m.country
FROM transactions t
JOIN merchants m ON t.merchant_id = m.merchant_id
WHERE m.country != 'US'
ORDER BY t.occurred_at`,debrief:`Nine transactions occurred at non-US merchants: Shell Gas (UK), QuickTransfer (Nigeria ×2), CryptoXchange (China), FastCash Ltd (Brazil ×2), Spotify (Sweden ×3). The three flagged merchants (NG, CN, BR) account for 5 of the 9 cross-border transactions. Cross-border by itself is not fraud — Spotify (SE) is entirely legitimate — so flagging must combine geography with merchant risk score.`,sqliteNote:null},{id:`sql-e57`,title:`Unordered Products`,company:`Shopify`,companyDomain:`shopify.com`,difficulty:`Easy`,tags:[`anti-join`,`LEFT JOIN`,`dead inventory`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:5,datamartId:`ecomm`,prompt:`The inventory team wants to find products that have never appeared in any order, to consider discontinuing them. Return product_id, name, category, and list_price for all products with no matching order_items rows.`,expectedColumns:[`product_id`,`name`,`category`,`list_price`],expectedRowCount:1,hints:[`What does one row in your result represent? Your output needs 1 row with columns: product_id, name, category, list_price.`],checkValues:[{product_id:`10`,name:`Plant Pot`,category:`home`}],solution:`SELECT p.product_id, p.name, p.category, p.list_price
FROM products p
LEFT JOIN order_items oi ON p.product_id = oi.product_id
WHERE oi.item_id IS NULL`,debrief:`Only the Plant Pot (product 10) has never been ordered — and it is already marked inactive (is_active = 0). The LEFT JOIN + WHERE right IS NULL pattern is the standard anti-join: LEFT JOIN keeps all products, and the NULL check on oi.item_id selects those with no matching order. NOT IN and NOT EXISTS are alternatives, but LEFT JOIN IS NULL is the safest when the right-side column could itself be NULL.`,sqliteNote:null},{id:`sql-e58`,title:`Accounts with Zero Events`,company:`Amplitude`,companyDomain:`amplitude.com`,difficulty:`Easy`,tags:[`anti-join`,`LEFT JOIN`,`user activation`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:5,datamartId:`saas`,prompt:`The CS team wants to identify accounts that have generated zero product events — a strong churn signal. Return account_id and company_name for all accounts with no rows in the events table.`,expectedColumns:[`account_id`,`company_name`],expectedRowCount:7,hints:[`What does one row in your result represent? Your output needs 7 rows with columns: account_id, company_name.`],checkValues:[{account_id:`9`,company_name:`India Foods`}],solution:`SELECT a.account_id, a.company_name
FROM accounts a
LEFT JOIN events e ON a.account_id = e.account_id
WHERE e.event_id IS NULL
ORDER BY a.account_id`,debrief:`Seven accounts have never generated a product event — including India Foods and Lima Education (both on the free Starter plan). These zero-event accounts are the highest churn risk: they are paying (or not paying) for a product they are not using. The LEFT JOIN IS NULL anti-join is the correct pattern; a WHERE account_id NOT IN (SELECT account_id FROM events) would work but is dangerous if events.account_id could be NULL.`,sqliteNote:null},{id:`sql-e59`,title:`Inactive Consumer Users`,company:`Pinterest`,companyDomain:`pinterest.com`,difficulty:`Easy`,tags:[`anti-join`,`LEFT JOIN`,`engagement gap`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:5,datamartId:`consumer`,prompt:`The re-engagement team needs users who have never interacted with any content. Return user_id, username, device_os, and joined_at for all users with no rows in the interactions table.`,expectedColumns:[`user_id`,`username`,`device_os`,`joined_at`],expectedRowCount:2,hints:[`What does one row in your result represent? Your output needs 2 rows with columns: user_id, username, device_os, joined_at.`],checkValues:[{user_id:`14`,username:`nina`}],solution:`SELECT u.user_id, u.username, u.device_os, u.joined_at
FROM users u
LEFT JOIN interactions i ON u.user_id = i.user_id
WHERE i.interaction_id IS NULL
ORDER BY u.user_id`,debrief:`Nina (user 14) and oscar (user 15) have never interacted with any content. Both joined late in 2023, are non-premium, and are US-based iOS/Android users. They may have downloaded the app but never engaged with content — classic activation gap candidates for a first-content push notification.`,sqliteNote:null},{id:`sql-e60`,title:`Most Common Diagnoses`,company:`Epic Systems`,companyDomain:`epic.com`,difficulty:`Easy`,tags:[`GROUP BY`,`COUNT`,`clinical analytics`],roles:[`PA`,`DA`,`PM`],priority:2,estimatedMin:4,datamartId:`health`,prompt:`The clinical quality team wants to identify the most frequently diagnosed conditions. Return icd_code, description, and diagnosis_count, ordered by diagnosis_count descending.`,expectedColumns:[`icd_code`,`description`,`diagnosis_count`],expectedRowCount:10,hints:[`What does one row in your result represent? Your output needs 10 rows with columns: icd_code, description, diagnosis_count.`],checkValues:[{icd_code:`I10`,description:`Essential hypertension`,diagnosis_count:`5`}],solution:`SELECT icd_code, description, COUNT(*) AS diagnosis_count
FROM diagnoses
GROUP BY icd_code, description
ORDER BY diagnosis_count DESC`,debrief:`I10 (hypertension) leads with 5 diagnoses, followed by L70 (acne, 3), M54.5/L40/E11/J06.9 with 2 each. Including description in GROUP BY is correct — icd_code and description are functionally dependent (one code always maps to one description), so grouping on just icd_code would also work in this dataset, but grouping on both is more explicit and portable.`,sqliteNote:null},{id:`sql-e62`,title:`Converted Sessions by Source`,company:`Google`,companyDomain:`google.com`,difficulty:`Easy`,tags:[`GROUP BY`,`SUM`,`conversion analysis`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:5,datamartId:`ecomm`,prompt:`The growth team wants to know how many sessions led to a purchase (converted = 1) for each traffic source. Return source, total_sessions, and converted_sessions, ordered by converted_sessions descending.`,expectedColumns:[`source`,`total_sessions`,`converted_sessions`],expectedRowCount:5,hints:[`What does one row in your result represent? Your output needs 5 rows with columns: source, total_sessions, converted_sessions.`],checkValues:[{source:`referral`,total_sessions:`3`,converted_sessions:`3`}],solution:`SELECT source,
  COUNT(*) AS total_sessions,
  SUM(converted) AS converted_sessions
FROM sessions
GROUP BY source
ORDER BY converted_sessions DESC`,debrief:`Referral and paid both produced 5 converted sessions (though paid had 7 total vs referral's 3). Organic had 5 converts from 9 sessions. Email had 1 from 3. Social had 0 from 3. SUM(converted) works because converted is an integer flag (0 or 1) — summing integers gives a count of 1s. This is a common and elegant pattern for counting binary-flag events.`,sqliteNote:null},{id:`sql-e65`,title:`Total MRR from Active Subscriptions`,company:`ChartMogul`,companyDomain:`chartmogul.com`,difficulty:`Easy`,tags:[`SUM`,`aggregation`,`MRR`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:3,datamartId:`saas`,prompt:`Finance needs our total MRR from active subscriptions for the board update. Single number.`,expectedColumns:[`total_mrr`],expectedRowCount:1,hints:[`What does one row in your result represent? Your output needs 1 row with column: total_mrr.`],checkValues:[{total_mrr:`11790.0`}],solution:`SELECT SUM(mrr) AS total_mrr
FROM subscriptions
WHERE status = 'active'`,debrief:`Total active MRR is $11,790: three Enterprise accounts contribute $8,997 (76%), six Growth accounts contribute $1,794, one Business account contributes $999, and two Starter accounts contribute $0. SUM(mrr) includes the free-plan $0 values — they do not distort the sum but would distort an AVG. Always filter to the status you care about before aggregating financial figures.`,sqliteNote:null},{id:`sql-e67`,title:`Patients 50 or Older`,company:`Humana`,companyDomain:`humana.com`,difficulty:`Easy`,tags:[`WHERE`,`date arithmetic`,`age filter`],roles:[`PA`,`DA`,`PM`],priority:2,estimatedMin:5,datamartId:`health`,prompt:`The preventive care team wants to flag patients aged 50 or older (born before January 1, 1976) for senior screenings. Return patient_id, dob, gender, and zip_code for qualifying patients, ordered by dob ascending (oldest first).`,expectedColumns:[`patient_id`,`dob`,`gender`,`zip_code`],expectedRowCount:6,hints:[`What does one row in your result represent? Your output needs 6 rows with columns: patient_id, dob, gender, zip_code.`],checkValues:[{patient_id:`9`,dob:`1943-08-07`,gender:`M`,zip_code:`10005`}],solution:`SELECT patient_id, dob, gender, zip_code
FROM patients
WHERE dob < '1976-01-01'
ORDER BY dob`,debrief:`Six patients qualify: the oldest is patient 9 (born 1943, age 83). The WHERE dob < '1976-01-01' pattern uses the date string comparison that SQLite supports natively for ISO-format dates (YYYY-MM-DD). Using strftime('%Y', 'now') - strftime('%Y', dob) >= 50 also works but is not index-friendly. A fixed date cutoff in the WHERE clause is faster and reproducible.`,sqliteNote:null},{id:`sql-e68`,title:`Content by Premium Creators`,company:`Patreon`,companyDomain:`patreon.com`,difficulty:`Easy`,tags:[`INNER JOIN`,`filter`,`creator analytics`],roles:[`PA`,`DA`,`PM`],priority:2,estimatedMin:5,datamartId:`consumer`,prompt:`The creator monetization team wants to audit all content published by premium users. Return content_id, creator_id, content_type, category, and published_at for all content where the creator's is_premium = 1, ordered by published_at.`,expectedColumns:[`content_id`,`creator_id`,`content_type`,`category`,`published_at`],expectedRowCount:7,hints:[`What does one row in your result represent? Your output needs 7 rows with columns: content_id, creator_id, content_type, category, published_at.`],checkValues:[{content_id:`1`,creator_id:`1`,content_type:`video`,category:`fitness`}],solution:`SELECT c.content_id, c.creator_id, c.content_type, c.category, c.published_at
FROM content c
JOIN users u ON c.creator_id = u.user_id
WHERE u.is_premium = 1
ORDER BY c.published_at`,debrief:`Seven of eight content items were created by premium users. Only content 7 (user 8 henry, non-premium) is excluded. The JOIN is required because is_premium lives in users, not content. This is a pattern analysts encounter constantly: the attribute you need to filter on is in a different table from the rows you want to return.`,sqliteNote:null},{id:`sql-e69`,title:`Large-Value Orders`,company:`Nordstrom`,companyDomain:`nordstrom.com`,difficulty:`Easy`,tags:[`WHERE`,`range filter`,`revenue analysis`],roles:[`PA`,`DA`,`PM`],priority:2,estimatedMin:3,datamartId:`ecomm`,prompt:`The high-value customer team wants to analyze orders above $100 in subtotal. Return order_id, user_id, created_at, subtotal, and status for all orders where subtotal > 100, ordered by subtotal descending.`,expectedColumns:[`order_id`,`user_id`,`created_at`,`subtotal`,`status`],expectedRowCount:7,hints:[`What does one row in your result represent? Your output needs 7 rows with columns: order_id, user_id, created_at, subtotal, status.`],checkValues:[{order_id:`4`,subtotal:`249.99`}],solution:`SELECT order_id, user_id, created_at, subtotal, status
FROM orders
WHERE subtotal > 100
ORDER BY subtotal DESC`,debrief:`Seven orders exceed $100: four at $249.99 (Smart Watch orders), two at $159.99 (Winter Jacket), one at $249.99 (another Smart Watch). One of the four $249.99 orders is cancelled (order 4) — revenue metrics should filter to status = 'completed' before summing. Gross order value and net recognized revenue are different numbers.`,sqliteNote:null},{id:`sql-e70`,title:`Accounts by Currency`,company:`Revolut`,companyDomain:`revolut.com`,difficulty:`Easy`,tags:[`GROUP BY`,`COUNT`,`multi-currency`],roles:[`PA`,`DA`],priority:2,estimatedMin:4,datamartId:`fintech`,prompt:`The FX team needs to know how many accounts we have per currency for hedging analysis. Give me that breakdown.`,expectedColumns:[`currency`,`account_count`],expectedRowCount:3,hints:[`What does one row in your result represent? Your output needs 3 rows with columns: currency, account_count.`],checkValues:[{currency:`USD`,account_count:`12`}],solution:`SELECT currency, COUNT(*) AS account_count
FROM accounts
GROUP BY currency
ORDER BY account_count DESC`,debrief:`USD: 12 accounts (80%), GBP: 2 (13%), AUD: 1 (7%). USD dominance means minimal FX exposure for now — but the user base spans 7 countries. As the product expands internationally, GBP and AUD accounts will likely grow, and FX hedging cost becomes material. Pairing this with SUM(balance) by currency gives the actual exposure, not just account count.`,sqliteNote:null},{id:`sql-e72`,title:`Appointments Without Diagnoses`,company:`Athenahealth`,companyDomain:`athenahealth.com`,difficulty:`Easy`,tags:[`anti-join`,`LEFT JOIN`,`data quality`],roles:[`PA`,`DA`],priority:2,estimatedMin:5,datamartId:`health`,prompt:`The data quality team wants to find all appointments where no diagnosis was recorded — either due to a no-show or a documentation gap. Return appt_id, patient_id, provider_id, scheduled_at, and no_show.`,expectedColumns:[`appt_id`,`patient_id`,`provider_id`,`scheduled_at`,`no_show`],expectedRowCount:7,hints:[`What does one row in your result represent? Your output needs 7 rows with columns: appt_id, patient_id, provider_id, scheduled_at, no_show.`],checkValues:[{appt_id:`3`,patient_id:`3`,no_show:`1`}],solution:`SELECT a.appt_id, a.patient_id, a.provider_id, a.scheduled_at, a.no_show
FROM appointments a
LEFT JOIN diagnoses d ON a.appt_id = d.appt_id
WHERE d.diagnosis_id IS NULL
ORDER BY a.appt_id`,debrief:`Seven appointments have no recorded diagnosis. Six of them are no-shows (no_show = 1) — expected, since a patient who did not attend cannot receive a diagnosis. Appointment 23 (patient 11, provider 6, telehealth, no no-show) is the outlier — a completed visit with no diagnosis code, a genuine documentation gap that compliance would flag.`,sqliteNote:null},{id:`sql-e74`,title:`Interactions per Content Item`,company:`TikTok`,companyDomain:`tiktok.com`,difficulty:`Easy`,tags:[`GROUP BY`,`COUNT`,`content performance`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:4,datamartId:`consumer`,prompt:`The content team wants to rank all content pieces by total interaction count. Return content_id and interaction_count, ordered by interaction_count descending.`,expectedColumns:[`content_id`,`interaction_count`],expectedRowCount:8,hints:[`What does one row in your result represent? Your output needs 8 rows with columns: content_id, interaction_count.`],checkValues:[{content_id:`1`,interaction_count:`8`}],solution:`SELECT content_id, COUNT(*) AS interaction_count
FROM interactions
GROUP BY content_id
ORDER BY interaction_count DESC`,debrief:`Content 1 (fitness video) leads with 8 interactions. Content 3 has 5. Content 7 and 8 each have just 1. The top piece outperforms the bottom two by 8×. On a platform, the distribution of engagement is almost always highly skewed — a small number of pieces drive most of the engagement. Identifying what makes content 1 different (recency? category? creator premium status?) is the key product question.`,sqliteNote:null},{id:`sql-e77`,title:`Diagnoses per Provider`,company:`Doximity`,companyDomain:`doximity.com`,difficulty:`Easy`,tags:[`JOIN`,`GROUP BY`,`COUNT`,`clinical productivity`],roles:[`PA`,`DA`],priority:2,estimatedMin:5,datamartId:`health`,prompt:`The quality team wants to understand diagnostic output per provider. Return provider_id and diagnosis_count for each provider, ordered by diagnosis_count descending.`,expectedColumns:[`provider_id`,`diagnosis_count`],expectedRowCount:6,hints:[`What does one row in your result represent? Your output needs 6 rows with columns: provider_id, diagnosis_count.`],checkValues:[{provider_id:`1`,diagnosis_count:`7`}],solution:`SELECT a.provider_id, COUNT(d.diagnosis_id) AS diagnosis_count
FROM appointments a
JOIN diagnoses d ON a.appt_id = d.appt_id
GROUP BY a.provider_id
ORDER BY diagnosis_count DESC`,debrief:`Dr. Smith (provider 1) has 7 diagnoses, followed by Dr. Patel and Dr. Lee with 4 each. The JOIN from appointments to diagnoses is needed because diagnoses only stores appt_id — provider_id must be retrieved through the appointment. Note that six no-show appointments produce no diagnoses, so appointment count (10 for provider 1) differs from diagnosis count (7).`,sqliteNote:null},{id:`sql-e78`,title:`Revenue by Acquisition Channel`,company:`Klaviyo`,companyDomain:`klaviyo.com`,difficulty:`Easy`,tags:[`JOIN`,`GROUP BY`,`SUM`,`channel attribution`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:6,datamartId:`ecomm`,prompt:`Growth wants to attribute order revenue to the channel that acquired each customer. Which channel is driving the most revenue?`,expectedColumns:[`channel`,`total_revenue`],expectedRowCount:4,hints:[`What does one row in your result represent? Your output needs 4 rows with columns: channel, total_revenue.`],checkValues:[{channel:`paid`,total_revenue:`1284.89`}],solution:`SELECT u.channel, SUM(o.subtotal) AS total_revenue
FROM users u
JOIN orders o ON u.user_id = o.user_id
GROUP BY u.channel
ORDER BY total_revenue DESC`,debrief:`Paid ($1,284.89) leads, followed by organic ($764.92), referral ($544.93), and email ($249.98). Channels with users who placed zero orders (e.g. organic users 13 and 15) are included via their channel peers — the JOIN from users to orders naturally excludes non-buyers. Important: this is gross subtotal, not net revenue — subtracting discounts and shipping would change the ranking.`,sqliteNote:null},{id:`sql-e81`,title:`Total Disputed Exposure`,company:`Stripe`,companyDomain:`stripe.com`,difficulty:`Easy`,tags:[`SUM`,`aggregation`,`financial exposure`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:3,datamartId:`fintech`,prompt:`Compliance is asking about our total dollar exposure from disputed transactions. What's the number?`,expectedColumns:[`total_disputed`],expectedRowCount:1,hints:[`What does one row in your result represent? Your output needs 1 row with column: total_disputed.`],checkValues:[{total_disputed:`5689.99`}],solution:`SELECT SUM(amount) AS total_disputed
FROM transactions
WHERE status = 'disputed'`,debrief:`Total disputed exposure is $5,689.99 across six transactions. The $3,500 from txn 31 (QuickTransfer) represents 61.5% of total exposure. SUM(amount) on a filtered dataset is a one-liner — but the next question is always how much of that has been resolved vs. is still open. Joining to the disputes table and filtering by resolved_at IS NOT NULL would give the unresolved portion.`,sqliteNote:null},{id:`sql-e86`,title:`Level Engagement Percentile`,company:`Zynga`,companyDomain:`zynga.com`,difficulty:`Easy`,isFree:!1,tags:[`PERCENT_RANK`,`window function`,`CTE`,`percentile`],roles:[`PA`,`DA`],priority:2,estimatedMin:10,datamartId:`gaming`,prompt:`The growth team wants to rank players by how frequently they attempt levels. Using the level_attempts table, return user_id, total_attempts (total level attempts per player), and pct_rank (PERCENT_RANK among all players by total_attempts, rounded to 2 decimal places). A pct_rank of 1.0 means the highest-engagement player. Order by user_id.`,expectedColumns:[`user_id`,`total_attempts`,`pct_rank`],expectedRowCount:6,hints:[`What does one row in your result represent? Your output needs 6 rows with columns: user_id, total_attempts, pct_rank.`],checkValues:[{user_id:`1`,total_attempts:`5`,pct_rank:`0.8`}],solution:`WITH attempt_counts AS (
  SELECT user_id, COUNT(*) AS total_attempts
  FROM level_attempts
  GROUP BY user_id
)
SELECT user_id, total_attempts,
  ROUND(PERCENT_RANK() OVER (ORDER BY total_attempts), 2) AS pct_rank
FROM attempt_counts
ORDER BY user_id`,debrief:`PERCENT_RANK = (rank - 1) / (n - 1). With 6 players, each rank step adds 0.2. Users 5, 6, and 9 all have 3 attempts — they share rank 1 (0-indexed), giving pct_rank = 1/5 = 0.2. Users 1 and 3 both have 5 attempts — they share rank 4, giving 4/5 = 0.8. User 10 has 1 attempt (the minimum) — pct_rank = 0.0. The common mistake is omitting the CTE and calling PERCENT_RANK directly over individual rows, which ranks raw rows, not the aggregated attempt counts.`,sqliteNote:null},{id:`sql-m01`,title:`Detect Account Upgrades`,company:`Gainsight`,companyDomain:`gainsight.com`,difficulty:`Medium`,isFree:!1,tags:[`CTE`,`LAG`,`window functions`,`multi-JOIN`],roles:[`PA`,`DA`,`BA`],priority:1,estimatedMin:12,datamartId:`saas`,prompt:`Revenue ops wants to track expansion revenue. Identify any account that has ever upgraded its subscription plan — defined as switching to a plan with a higher MRR than the previous one. Return account_id, company_name, old_plan name, and new_plan name.`,expectedColumns:[`account_id`,`company_name`,`old_plan`,`new_plan`],expectedRowCount:1,hints:[`What does one row in your result represent? Your output needs 1 row with columns: account_id, company_name, old_plan, new_plan.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`],checkValues:[{company_name:`Acme Corp`,old_plan:`Business`,new_plan:`Enterprise`}],solution:`WITH sub_history AS (
  SELECT account_id, plan_id, mrr, started_at,
    LAG(mrr) OVER (PARTITION BY account_id ORDER BY started_at) AS prev_mrr,
    LAG(plan_id) OVER (PARTITION BY account_id ORDER BY started_at) AS prev_plan_id
  FROM subscriptions
)
SELECT sh.account_id, a.company_name,
  p1.name AS old_plan, p2.name AS new_plan
FROM sub_history sh
JOIN accounts a ON sh.account_id = a.account_id
JOIN plans p1 ON sh.prev_plan_id = p1.plan_id
JOIN plans p2 ON sh.plan_id = p2.plan_id
WHERE sh.mrr > sh.prev_mrr
ORDER BY sh.account_id`,debrief:`Only Acme Corp upgraded — from Business (999 MRR) to Enterprise (2999 MRR). Account 3 (Capitol Finance) switched from Business to Growth, which is a downgrade (mrr dropped), so it is correctly excluded. The LAG() OVER (PARTITION BY account_id ORDER BY started_at) pattern is the canonical way to compare consecutive rows per entity. The weak answer tries a self-join on subscriptions — which works but requires reasoning about row uniqueness that LAG makes trivial. The CTE clarifies intent and separates the windowing from the filter logic.`,sqliteNote:null},{id:`sql-m04`,title:`H1 vs H2 Order Volume`,company:`Wayfair`,companyDomain:`wayfair.com`,difficulty:`Medium`,isFree:!1,tags:[`CASE WHEN`,`conditional aggregation`,`strftime`,`date grouping`],roles:[`PA`,`DA`,`BA`],priority:2,estimatedMin:10,datamartId:`ecomm`,prompt:`Finance is doing a mid-year review and wants a quick H1 vs H2 comparison of order volume for 2023. Can you pull that — ideally in a single row so it's easy to paste into a slide?`,expectedColumns:[`h1_2023`,`h2_2023`],expectedRowCount:1,hints:[`What does one row in your result represent? Your output needs 1 row with columns: h1_2023, h2_2023.`,`CASE WHEN ... THEN ... ELSE ... END works like if-else inside SQL. You can use it inside aggregate functions for conditional counts.`],checkValues:[{h1_2023:`9`,h2_2023:`9`}],solution:`SELECT
  SUM(CASE WHEN strftime('%Y-%m', created_at) BETWEEN '2023-01' AND '2023-06' THEN 1 ELSE 0 END) AS h1_2023,
  SUM(CASE WHEN strftime('%Y-%m', created_at) BETWEEN '2023-07' AND '2023-12' THEN 1 ELSE 0 END) AS h2_2023
FROM orders`,debrief:`What the stakeholder wants: A side-by-side count of orders in the first six months vs the last six months of 2023, in one row.

Ambiguities resolved: "H1" is January through June, "H2" is July through December — standard calendar halves. All order statuses are included unless the business defines "order" as completed-only (document this assumption). Outputting h1_2023 and h2_2023 as column names makes the slide-paste use case obvious.

SQL approach: Use conditional aggregation — SUM(CASE WHEN strftime('%m', created_at) <= '06' THEN 1 ELSE 0 END) for H1, the complement for H2. A UNION of two GROUP BY queries also works but produces two rows, not one.

What weak SQL looks like: Two separate SELECT COUNT(*) queries submitted independently. That gives the right numbers but not the single-row format requested. Or using WHERE month <= 6 without casting — SQLite date functions need strftime.

Interviewer follow-up: "What if I wanted this broken out by order status as well — how would you extend this?"`,sqliteNote:null},{id:`sql-m07`,title:`Premium Users Missing Category`,company:`Spotify`,companyDomain:`spotify.com`,difficulty:`Medium`,isFree:!1,tags:[`subquery`,`NOT IN`,`filter`,`JOIN`,`anti-join variant`],roles:[`PA`,`DA`,`PM`],priority:2,estimatedMin:12,datamartId:`consumer`,prompt:`The personalization team wants to recommend fitness content to premium users who have not yet engaged with that category. Return user_id and username for all premium users who have zero interactions with any fitness content, ordered by user_id.`,expectedColumns:[`user_id`,`username`],expectedRowCount:2,hints:[`What does one row in your result represent? Your output needs 2 rows with columns: user_id, username.`,`To find rows with no match, use NOT IN (subquery) or LEFT JOIN ... WHERE right_id IS NULL. NOT EXISTS is also valid.`],checkValues:[{user_id:`10`,username:`julia`}],solution:`SELECT u.user_id, u.username
FROM users u
WHERE u.is_premium = 1
  AND u.user_id NOT IN (
    SELECT DISTINCT i.user_id
    FROM interactions i
    JOIN content c ON i.content_id = c.content_id
    WHERE c.category = 'fitness'
  )
ORDER BY u.user_id`,debrief:`Julia (10) and Lisa (12) are the two premium users who have never engaged with fitness content. Four other premium users (Alice, Carol, Emma, Grace) already interacted with the fitness video. The NOT IN subquery is readable here — just note it breaks if the subquery returns a NULL user_id, which is why a LEFT JOIN alternative is more production-safe. The key insight: two separate JOINs are required — one to get users who DID engage with fitness, then exclude them from the premium user list.`,sqliteNote:null},{id:`sql-m09`,title:`Monthly Order Volume Trend`,company:`Instacart`,companyDomain:`instacart.com`,difficulty:`Medium`,isFree:!1,tags:[`strftime`,`GROUP BY`,`date aggregation`,`time series`],roles:[`PA`,`DA`,`BA`],priority:1,estimatedMin:8,datamartId:`ecomm`,prompt:`The operations team tracks monthly order volume to plan warehouse staffing. Return each order_month (as YYYY-MM) and the total order_count, ordered chronologically. Include all statuses.`,expectedColumns:[`order_month`,`order_count`],expectedRowCount:15,hints:[`What does one row in your result represent? Your output needs 15 rows with columns: order_month, order_count.`,`SQLite date functions: DATE(col, '+N days'), STRFTIME('%Y-%m', col). Check which format the date column stores before extracting parts.`],checkValues:[{order_month:`2024-01`,order_count:`4`}],solution:`SELECT strftime('%Y-%m', created_at) AS order_month,
  COUNT(*) AS order_count
FROM orders
GROUP BY order_month
ORDER BY order_month`,debrief:`January 2024 is the peak month with 4 orders — driven by user 5 placing 3 back-to-back orders (Jan 10, 11, 12) plus user 10. Most months average 1-2 orders. The weak answer uses DATE_TRUNC('month', created_at) — which is PostgreSQL syntax and fails in SQLite. strftime('%Y-%m', date_column) is the SQLite-native idiom for month truncation. The debrief worth raising: this includes cancelled and returned orders. Should staffing forecasting use total orders or completed orders only? That is a business decision the analyst should surface.`,sqliteNote:`Uses strftime() instead of DATE_TRUNC() — SQLite-specific syntax.`},{id:`sql-m10`,title:`Accounts with High Inactivity Rate`,company:`Amplitude`,companyDomain:`amplitude.com`,difficulty:`Medium`,isFree:!1,tags:[`HAVING`,`CASE WHEN`,`GROUP BY`,`JOIN`,`activation analytics`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:12,datamartId:`saas`,prompt:`Customer success is triaging at-risk accounts. Flag any account where 30% or more of its users have never logged in (last_active_at IS NULL). Return account_id, company_name, total_users, never_active count, and inactive_pct (rounded to 1 decimal). Order by inactive_pct descending.`,expectedColumns:[`account_id`,`company_name`,`total_users`,`never_active`,`inactive_pct`],expectedRowCount:2,hints:[`What does one row in your result represent? Your output needs 2 rows with columns: account_id, company_name, total_users, never_active, inactive_pct.`,`CASE WHEN ... THEN ... ELSE ... END works like if-else inside SQL. You can use it inside aggregate functions for conditional counts.`],checkValues:[{company_name:`Blue Retail`}],solution:`SELECT a.account_id, a.company_name,
  COUNT(*) AS total_users,
  SUM(CASE WHEN u.last_active_at IS NULL THEN 1 ELSE 0 END) AS never_active,
  ROUND(100.0 * SUM(CASE WHEN u.last_active_at IS NULL THEN 1 ELSE 0 END) / COUNT(*), 1) AS inactive_pct
FROM accounts a
JOIN users u ON a.account_id = u.account_id
GROUP BY a.account_id, a.company_name
HAVING inactive_pct >= 30.0
ORDER BY inactive_pct DESC`,debrief:`Blue Retail and Delta Health both have exactly 1 of 3 users who never logged in (33.3%). Both viewer-role users — a pattern: viewer seats are provisioned and forgotten, which is a known SaaS churn signal. The HAVING clause filters after aggregation; a WHERE clause cannot reference the computed inactive_pct alias. The GROUP BY a.account_id, a.company_name is necessary because company_name is not functionally dependent on account_id in the SQL engine's view. The weak answer re-runs the numerator expression twice — using a CTE or subquery to alias it once is cleaner.`,sqliteNote:null},{id:`sql-m13`,title:`Latest Transaction Per Account`,company:`Stripe`,companyDomain:`stripe.com`,difficulty:`Medium`,tags:[`ROW_NUMBER`,`CTE`,`window function`,`deduplication`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:10,datamartId:`fintech`,prompt:`The reconciliation team needs to see the most recent transaction for each account — one row per account, showing what the latest activity looked like.`,expectedColumns:[`txn_id`,`account_id`,`amount`,`occurred_at`],expectedRowCount:15,hints:[`What does one row in your result represent? Your output needs 15 rows with columns: txn_id, account_id, amount, occurred_at.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`],checkValues:[],solution:`WITH ranked AS (
  SELECT txn_id, account_id, amount, occurred_at,
         ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY occurred_at DESC) AS rn
  FROM transactions
)
SELECT txn_id, account_id, amount, occurred_at
FROM ranked
WHERE rn = 1
ORDER BY account_id`,debrief:`What the stakeholder wants: A single row per account showing the latest transaction details.

Ambiguities resolved: "Most recent" means highest occurred_at. If two transactions share the same timestamp, pick consistently (e.g. highest txn_id). All transaction statuses are included — the reconciliation team wants the full picture, not just completed ones.

SQL approach: ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY occurred_at DESC) in a CTE, then filter WHERE rn = 1. Alternative: MAX(occurred_at) subquery joined back to transactions — correct but fails on timestamp ties without a secondary sort.

What weak SQL looks like: GROUP BY account_id with MAX(occurred_at) then re-joining — works unless two transactions share the same max timestamp, in which case you get multiple rows per account silently.

Interviewer follow-up: "If I also wanted the second-most-recent transaction per account, how would you change this?"`,sqliteNote:null},{id:`sql-m14`,title:`Engagement Quality by Content`,company:`YouTube`,companyDomain:`youtube.com`,difficulty:`Medium`,tags:[`CASE WHEN`,`SUM`,`conditional aggregation`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:8,datamartId:`consumer`,prompt:`The content team wants to compare engagement quality across pieces — not just total volume, but the breakdown of how people are actually interacting. Views, likes, and everything else, per content item.`,expectedColumns:[`content_id`,`like_count`,`view_count`,`total_interactions`],expectedRowCount:8,hints:[`What does one row in your result represent? Your output needs 8 rows with columns: content_id, like_count, view_count, total_interactions.`,`CASE WHEN ... THEN ... ELSE ... END works like if-else inside SQL. You can use it inside aggregate functions for conditional counts.`],checkValues:[{content_id:`1`,like_count:`2`,view_count:`3`,total_interactions:`8`}],solution:`SELECT content_id,
  SUM(CASE WHEN action = 'like' THEN 1 ELSE 0 END) AS like_count,
  SUM(CASE WHEN action = 'view' THEN 1 ELSE 0 END) AS view_count,
  COUNT(*) AS total_interactions
FROM interactions
GROUP BY content_id
ORDER BY total_interactions DESC`,debrief:`What the stakeholder wants: Per-content breakdown of interaction types — how many views, likes, and other actions each piece received.

Ambiguities resolved: "Engagement quality" here means the raw counts by type, not a derived score. Return all content pieces including those with zero interactions of a given type (NULL or 0 — choose 0 for readability). Order by total interactions descending to surface the most-engaged content first.

SQL approach: Conditional aggregation — SUM(CASE WHEN action = 'like' THEN 1 ELSE 0 END) per content_id. This is a pivot over a categorical column. One pass over the table, all types in one row.

What weak SQL looks like: Separate subqueries or JOINs for each action type — produces the right answer but reads as multiple queries duct-taped together. Interviewers notice this.

Interviewer follow-up: "How would you compute what percentage of total interactions are likes, per content piece?"`,sqliteNote:null},{id:`sql-m16`,title:`Running Spend Per User`,company:`Shopify`,companyDomain:`shopify.com`,difficulty:`Medium`,tags:[`SUM OVER`,`window function`,`running total`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:10,datamartId:`ecomm`,prompt:`Finance wants to track how each customer's cumulative spend grows as orders come in over time. Show the order-by-order running total per user.`,expectedColumns:[`order_id`,`user_id`,`created_at`,`subtotal`,`running_total`],expectedRowCount:28,hints:[`What does one row in your result represent? Your output needs 28 rows with columns: order_id, user_id, created_at, subtotal, running_total.`,`Window functions compute a value per row without collapsing rows like GROUP BY. Decide your PARTITION BY (reset scope) and ORDER BY (ranking order).`],checkValues:[],solution:`SELECT order_id, user_id, created_at, subtotal,
  SUM(subtotal) OVER (PARTITION BY user_id ORDER BY created_at) AS running_total
FROM orders
ORDER BY user_id, created_at`,debrief:`What the stakeholder wants: For each order row, the cumulative sum of that user's spending up to and including that order.

Ambiguities resolved: "Cumulative" means a running sum partitioned by user, ordered by order date. All order statuses are included (finance wants the full ledger, not just completed). If two orders share the same created_at, the running total includes both in arbitrary order — document this.

SQL approach: SUM(subtotal) OVER (PARTITION BY user_id ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW). The ROWS BETWEEN frame is important — without it, SQLite uses RANGE which can produce unexpected results on tied dates.

What weak SQL looks like: A self-join WHERE o2.created_at <= o1.created_at, summing o2.subtotal — correct but O(n²) and does not scale. Window function is the professional answer.

Interviewer follow-up: "If the user placed a return (status = 'returned'), should that subtract from the running total? How would you handle it?"`,sqliteNote:null},{id:`sql-m17`,title:`Above-Average Enterprise Accounts`,company:`HubSpot`,companyDomain:`hubspot.com`,difficulty:`Medium`,tags:[`correlated subquery`,`WHERE`,`AVG`],roles:[`PA`,`DA`,`PM`],priority:2,estimatedMin:10,datamartId:`saas`,prompt:`Sales wants to identify the larger accounts within each industry vertical — those with more employees than the average for their sector. Return account_id, company_name, industry, and employee_count for accounts where employee_count exceeds the average employee_count for their industry. Order by industry, employee_count descending.`,expectedColumns:[`account_id`,`company_name`,`industry`,`employee_count`],expectedRowCount:4,hints:[`What does one row in your result represent? Your output needs 4 rows with columns: account_id, company_name, industry, employee_count.`,`Think about which SQL clause handles the core transformation here.`],checkValues:[],solution:`SELECT a1.account_id, a1.company_name, a1.industry, a1.employee_count
FROM accounts a1
WHERE a1.employee_count > (
  SELECT AVG(a2.employee_count)
  FROM accounts a2
  WHERE a2.industry = a1.industry
)
ORDER BY a1.industry, a1.employee_count DESC`,debrief:`Four accounts exceed their industry average: Kilo Pharma (healthcare, 250), Foxtrot Media (media, 40), Blue Retail's counterpart Juliet Fashion (retail, 90), and Echo Tech (tech, 300). Single-account industries (logistics, hospitality, manufacturing, food, education) cannot produce any above-average result — a useful edge case to mention in an interview. The correlated subquery re-runs for each outer row; for large tables, rewrite using a window function: AVG(employee_count) OVER (PARTITION BY industry) is equivalent and faster.`,sqliteNote:null},{id:`sql-m20`,title:`Top Products by Volume`,company:`Amazon`,companyDomain:`amazon.com`,difficulty:`Medium`,tags:[`RANK`,`CTE`,`window function`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:10,datamartId:`ecomm`,prompt:`Merchandising wants to spotlight the best-selling products. Which products are at the top by order volume — and handle ties fairly.`,expectedColumns:[`product_id`,`items_sold`,`rnk`],expectedRowCount:3,hints:[`What does one row in your result represent? Your output needs 3 rows with columns: product_id, items_sold, rnk.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`],checkValues:[{product_id:`1`,items_sold:`6`,rnk:`1`}],solution:`WITH product_sales AS (
  SELECT product_id, COUNT(*) AS items_sold
  FROM order_items
  GROUP BY product_id
),
ranked AS (
  SELECT product_id, items_sold,
         RANK() OVER (ORDER BY items_sold DESC) AS rnk
  FROM product_sales
)
SELECT product_id, items_sold, rnk
FROM ranked
WHERE rnk <= 3
ORDER BY rnk, product_id`,debrief:`What the stakeholder wants: The top-ranked products by how many times they appear in orders, with ties handled consistently.

Ambiguities resolved: "Top" without a specified cutoff — interpreted as rank <= 3 (document this assumption, ask the stakeholder if they want top 5 or top N). "Fairly" means tied products share the same rank. All order statuses are included unless "sold" means completed only.

SQL approach: CTE summing order_items per product, then RANK() OVER (ORDER BY items_sold DESC). RANK() shares the rank for ties and skips subsequent ranks (1,1,3). DENSE_RANK does not skip (1,1,2). ROW_NUMBER breaks ties arbitrarily — wrong here because the stakeholder said "handle ties fairly."

What weak SQL looks like: ORDER BY items_sold DESC LIMIT 3 — misses tied products at the cutoff. A rank that uses ROW_NUMBER — arbitrarily breaks ties.

Interviewer follow-up: "What's the difference between RANK, DENSE_RANK, and ROW_NUMBER — when would you use each?"`,sqliteNote:null},{id:`sql-m21`,title:`First Interaction Per User`,company:`TikTok`,companyDomain:`tiktok.com`,difficulty:`Medium`,tags:[`ROW_NUMBER`,`CTE`,`window function`,`first-touch`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:10,datamartId:`consumer`,prompt:`The onboarding team wants to understand what each user discovered first on the platform. What was every user's very first interaction?`,expectedColumns:[`user_id`,`content_id`,`action`,`occurred_at`],expectedRowCount:13,hints:[`What does one row in your result represent? Your output needs 13 rows with columns: user_id, content_id, action, occurred_at.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`],checkValues:[{user_id:`1`,content_id:`1`,action:`view`}],solution:`WITH ranked AS (
  SELECT user_id, content_id, action, occurred_at,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY occurred_at) AS rn
  FROM interactions
)
SELECT user_id, content_id, action, occurred_at
FROM ranked
WHERE rn = 1
ORDER BY user_id`,debrief:`What the stakeholder wants: One row per user showing the first interaction they ever performed.

Ambiguities resolved: "First" means earliest occurred_at. If two interactions share the same timestamp, pick one consistently (e.g. lowest interaction_id). Include all users who have at least one interaction — users with no interactions do not appear.

SQL approach: ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY occurred_at ASC), filter WHERE rn = 1. Alternative: MIN(occurred_at) per user joined back to interactions — correct but fails on timestamp ties.

What weak SQL looks like: GROUP BY user_id, MIN(occurred_at) — gives the date but loses the content_id and action from that specific row without a re-join. The re-join then has the tie problem.

Interviewer follow-up: "How would you find the first AND second interaction per user in the same query?"`,sqliteNote:null},{id:`sql-m23`,title:`Accounts with Mixed Transaction Outcomes`,company:`Robinhood`,companyDomain:`robinhood.com`,difficulty:`Medium`,tags:[`EXISTS`,`correlated subquery`,`AND`],roles:[`PA`,`DA`,`BA`],priority:2,estimatedMin:10,datamartId:`fintech`,prompt:`The risk team wants to flag accounts that have both clean and disputed activity — a sign of mixed behavioral patterns. Return account_id for all accounts that have at least one completed transaction AND at least one disputed transaction in the transactions table. Order by account_id.`,expectedColumns:[`account_id`],expectedRowCount:6,hints:[`What does one row in your result represent? Your output needs 6 rows with column: account_id.`,`Think about which SQL clause handles the core transformation here.`],checkValues:[{account_id:`1`}],solution:`SELECT DISTINCT a.account_id
FROM accounts a
WHERE EXISTS (
  SELECT 1 FROM transactions t
  WHERE t.account_id = a.account_id AND t.status = 'completed'
)
AND EXISTS (
  SELECT 1 FROM transactions t
  WHERE t.account_id = a.account_id AND t.status = 'disputed'
)
ORDER BY a.account_id`,debrief:`Six accounts have both completed and disputed transactions. EXISTS is efficient because it short-circuits on the first matching row — it does not need to count or aggregate. An alternative approach is two CTEs (one for accounts with disputed txns, one for completed) joined together, which is more readable for complex conditions. In an interview, mention that DISTINCT on accounts is unnecessary if you start from the accounts table (each account_id appears once), but it makes the intent explicit.`,sqliteNote:null},{id:`sql-m24`,title:`MRR Rank Within Industry`,company:`Gainsight`,companyDomain:`gainsight.com`,difficulty:`Medium`,tags:[`RANK`,`PARTITION BY`,`window function`,`JOIN`],roles:[`PA`,`DA`,`PM`],priority:2,estimatedMin:10,datamartId:`saas`,prompt:`Customer success wants to know where each account stands within its own industry by MRR — who's the biggest fish in each vertical?`,expectedColumns:[`account_id`,`company_name`,`industry`,`mrr`,`industry_rank`],expectedRowCount:12,hints:[`What does one row in your result represent? Your output needs 12 rows with columns: account_id, company_name, industry, mrr, industry_rank.`,`RANK / DENSE_RANK / ROW_NUMBER all use OVER (PARTITION BY ... ORDER BY ...). DENSE_RANK has no gaps; RANK leaves gaps on ties.`],checkValues:[],solution:`SELECT a.account_id, a.company_name, a.industry, s.mrr,
  RANK() OVER (PARTITION BY a.industry ORDER BY s.mrr DESC) AS industry_rank
FROM subscriptions s
JOIN accounts a ON s.account_id = a.account_id
WHERE s.status = 'active'
ORDER BY a.industry, industry_rank`,debrief:`What the stakeholder wants: Each account's MRR rank within its industry peer group.

Ambiguities resolved: "Rank" means 1 = highest MRR within the industry. Active subscriptions only (churned accounts have no current MRR). If an account has multiple active subscriptions, sum their MRR first before ranking (document this — the stakeholder said "by MRR" which implies current revenue, not historical).

SQL approach: RANK() OVER (PARTITION BY industry ORDER BY mrr DESC). Ties share the same rank. DENSE_RANK is also acceptable — discuss the difference with the interviewer.

What weak SQL looks like: Ranking all accounts globally and then filtering by industry — this gives the global rank within the filtered set, not the industry-specific rank. Or grouping by industry and using MAX — loses per-account detail.

Interviewer follow-up: "What if you only wanted to show the top-ranked account per industry — how would you filter this?"`,sqliteNote:null},{id:`sql-m25`,title:`Broadly Purchased Products`,company:`Shopify`,companyDomain:`shopify.com`,difficulty:`Medium`,tags:[`HAVING`,`COUNT DISTINCT`,`JOIN`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:8,datamartId:`ecomm`,prompt:`The product team wants to identify items with broad appeal — purchased by at least 3 distinct users. Join order_items to orders and return product_id and unique_buyers for all products where the distinct buyer count >= 3. Order by unique_buyers descending, then product_id.`,expectedColumns:[`product_id`,`unique_buyers`],expectedRowCount:7,hints:[`What does one row in your result represent? Your output needs 7 rows with columns: product_id, unique_buyers.`,`HAVING filters after aggregation; WHERE filters before. Use HAVING to filter on aggregated values like COUNT(*) > 1.`],checkValues:[{product_id:`1`,unique_buyers:`5`}],solution:`SELECT oi.product_id, COUNT(DISTINCT o.user_id) AS unique_buyers
FROM order_items oi
JOIN orders o ON oi.order_id = o.order_id
GROUP BY oi.product_id
HAVING COUNT(DISTINCT o.user_id) >= 3
ORDER BY unique_buyers DESC, oi.product_id`,debrief:`Seven of nine products have been ordered by 3 or more distinct users. Product 1 (Wireless Headphones) has the broadest reach at 5 buyers. Products 5 (Yoga Mat) and 8 (Data Science Guide) have only 2 buyers each — either niche items or under-discovered. COUNT(DISTINCT user_id) requires the JOIN to orders to get the user_id; the order_items table alone only has order_id. HAVING filters after grouping — this cannot be done in a WHERE clause because unique_buyers is not yet computed at that point.`,sqliteNote:null},{id:`sql-m26`,title:`Session Gap Analysis`,company:`Amplitude`,companyDomain:`amplitude.com`,difficulty:`Medium`,tags:[`LAG`,`window function`,`julianday`,`date arithmetic`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:12,datamartId:`ecomm`,prompt:`The growth team wants to understand how long users wait between visits. For each session, how many days passed since that user's previous session?`,expectedColumns:[`user_id`,`started_at`,`prev_session`,`days_gap`],expectedRowCount:25,hints:[`What does one row in your result represent? Your output needs 25 rows with columns: user_id, started_at, prev_session, days_gap.`,`Window functions compute a value per row without collapsing rows like GROUP BY. Decide your PARTITION BY (reset scope) and ORDER BY (ranking order).`],checkValues:[],solution:`SELECT user_id, started_at,
  LAG(started_at) OVER (PARTITION BY user_id ORDER BY started_at) AS prev_session,
  ROUND(julianday(started_at) - julianday(LAG(started_at) OVER (PARTITION BY user_id ORDER BY started_at)), 0) AS days_gap
FROM sessions
ORDER BY user_id, started_at`,debrief:`What the stakeholder wants: Per-session view showing the gap in days since the previous session for the same user.

Ambiguities resolved: "Days" means calendar days between session start times (started_at). A user's first session has no previous session — return NULL for that row. Use all sessions regardless of device or conversion status.

SQL approach: LAG(started_at) OVER (PARTITION BY user_id ORDER BY started_at) gives the previous session date. ROUND(julianday(started_at) - julianday(prev_session)) converts the date difference to days. julianday is SQLite's day-level arithmetic function.

What weak SQL looks like: A self-join WHERE s2.started_at < s1.started_at, then MAX to get the immediately prior — produces the right result but is far harder to read and reason about than LAG.

Interviewer follow-up: "How would you compute the average days between sessions per user — and how would you handle users who've only had one session?"`,sqliteNote:`julianday() converts a date string to a floating-point day number. julianday(a) - julianday(b) gives exact days elapsed.`},{id:`sql-m28`,title:`Top Creators by Engagement`,company:`YouTube`,companyDomain:`youtube.com`,difficulty:`Medium`,tags:[`CTE`,`RANK`,`JOIN`,`window function`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:12,datamartId:`consumer`,prompt:`The creator team wants to identify their top performers by total engagement. Who are the top 3 creators by interaction count across all their content?`,expectedColumns:[`creator_id`,`total_interactions`,`rnk`],expectedRowCount:3,hints:[`What does one row in your result represent? Your output needs 3 rows with columns: creator_id, total_interactions, rnk.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`],checkValues:[{creator_id:`1`,total_interactions:`12`,rnk:`1`}],solution:`WITH creator_stats AS (
  SELECT c.creator_id, COUNT(i.interaction_id) AS total_interactions
  FROM content c
  JOIN interactions i ON c.content_id = i.content_id
  GROUP BY c.creator_id
),
ranked AS (
  SELECT creator_id, total_interactions,
         RANK() OVER (ORDER BY total_interactions DESC) AS rnk
  FROM creator_stats
)
SELECT creator_id, total_interactions, rnk
FROM ranked
WHERE rnk <= 3
ORDER BY rnk`,debrief:`What the stakeholder wants: The top 3 creators ranked by total interactions on their published content.

Ambiguities resolved: "Top 3" — use rank <= 3, with ties sharing the rank (not LIMIT 3 which drops tied creators). "Engagement" means any row in the interactions table linked through content to the creator. Only creators who have at least one interaction appear.

SQL approach: CTE 1 — join content to interactions, SUM per creator_id. CTE 2 — RANK() OVER (ORDER BY total_interactions DESC). Filter WHERE rnk <= 3.

What weak SQL looks like: LIMIT 3 without a rank — silently drops tied creators at position 3. Or aggregating in a single step without a CTE — works but harder to audit when the logic is complex.

Interviewer follow-up: "What if you wanted to show creators who have zero interactions — how would you modify this?"`,sqliteNote:null},{id:`sql-m29`,title:`Next User Event`,company:`Amplitude`,companyDomain:`amplitude.com`,difficulty:`Medium`,tags:[`LEAD`,`window function`,`PARTITION BY`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:8,datamartId:`saas`,prompt:`The product team is analysing event sequencing and wants to understand how quickly users come back after each action. For every event, what was the same user's next event and when did it happen?`,expectedColumns:[`event_id`,`user_id`,`event_name`,`occurred_at`,`next_event_date`],expectedRowCount:50,hints:[`What does one row in your result represent? Your output needs 50 rows with columns: event_id, user_id, event_name, occurred_at, next_event_date.`,`Window functions compute a value per row without collapsing rows like GROUP BY. Decide your PARTITION BY (reset scope) and ORDER BY (ranking order).`],checkValues:[],solution:`SELECT event_id, user_id, event_name, occurred_at,
       LEAD(occurred_at) OVER (PARTITION BY user_id ORDER BY occurred_at) AS next_event_date
FROM events
ORDER BY user_id, occurred_at`,debrief:`What the stakeholder wants: Each event row enriched with the date (and optionally name) of the next event the same user performed.

Ambiguities resolved: "Next" means the chronologically next event for the same user by occurred_at. The last event per user has no next event — return NULL. Include all events including those with no successor.

SQL approach: LEAD(occurred_at) OVER (PARTITION BY user_id ORDER BY occurred_at) gives the next event date. LEAD(event_name) OVER the same window gives the next event name. LEAD is the forward-looking counterpart to LAG.

What weak SQL looks like: A self-join WHERE e2.occurred_at > e1.occurred_at AND e2.user_id = e1.user_id, then MIN — technically correct but slow and hard to read at scale.

Interviewer follow-up: "How would you compute the time gap in hours between each event and its successor?"`,sqliteNote:null},{id:`sql-m30`,title:`Running Average Order Value`,company:`Shopify`,companyDomain:`shopify.com`,difficulty:`Medium`,tags:[`AVG OVER`,`running average`,`window function`,`ROWS BETWEEN`],roles:[`PA`,`DA`],priority:1,estimatedMin:9,datamartId:`ecomm`,prompt:`Finance tracks how each customer's spending pattern evolves over time. Show the running average order value for each user as their orders accumulate.`,expectedColumns:[`user_id`,`order_id`,`created_at`,`subtotal`,`running_avg_subtotal`],expectedRowCount:28,hints:[`What does one row in your result represent? Your output needs 28 rows with columns: user_id, order_id, created_at, subtotal, running_avg_subtotal.`,`A window frame (ROWS BETWEEN N PRECEDING AND CURRENT ROW) limits which rows feed the aggregate. Match the frame size to the rolling window required.`],checkValues:[],solution:`SELECT user_id, order_id, created_at, subtotal,
       ROUND(AVG(subtotal) OVER (PARTITION BY user_id ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS running_avg_subtotal
FROM orders
ORDER BY user_id, created_at`,debrief:`What the stakeholder wants: For each order row, the average order value for that user up to and including that order.

Ambiguities resolved: "Running average" means a cumulative average, not a rolling N-day average. All order statuses are included unless Finance defines "order value" as completed-only (document this). If two orders share the same date, the running average includes both.

SQL approach: AVG(subtotal) OVER (PARTITION BY user_id ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW). The ROWS BETWEEN frame ensures the average grows with each row rather than the default RANGE behaviour on tied dates.

What weak SQL looks like: Computing total spend / count separately per user — gives a single average per user, not a per-row running average. Missing the ROWS frame — subtle bug on tied dates.

Interviewer follow-up: "How would you compute a 3-order rolling average instead of a cumulative one?"`,sqliteNote:null},{id:`sql-m32`,title:`First Transaction Benchmark`,company:`Stripe`,companyDomain:`stripe.com`,difficulty:`Medium`,tags:[`FIRST_VALUE`,`window function`,`PARTITION BY`],roles:[`PA`,`DA`],priority:2,estimatedMin:8,datamartId:`fintech`,prompt:`The analytics team wants to compare each transaction amount against the account's very first transaction, to detect whether spending ramps up or down over time. For every row in the transactions table, show txn id, account id, amount, occurred date, and the amount of that account's earliest transaction.`,expectedColumns:[`txn_id`,`account_id`,`amount`,`occurred_at`,`first_txn_amount`],expectedRowCount:40,hints:[`What does one row in your result represent? Your output needs 40 rows with columns: txn_id, account_id, amount, occurred_at, first_txn_amount.`,`Window functions compute a value per row without collapsing rows like GROUP BY. Decide your PARTITION BY (reset scope) and ORDER BY (ranking order).`],checkValues:[],solution:`SELECT txn_id, account_id, amount, occurred_at,
       FIRST_VALUE(amount) OVER (PARTITION BY account_id ORDER BY occurred_at) AS first_txn_amount
FROM transactions
ORDER BY account_id, occurred_at`,debrief:`FIRST_VALUE() returns the value from the first row of the window frame. Partitioning by account and ordering by date ensures each row carries the account's opening transaction amount. Pair with (amount - first_txn_amount) to compute an absolute spend delta per transaction.`,sqliteNote:null},{id:`sql-m33`,title:`Completed Order Detail View`,company:`Amazon`,companyDomain:`amazon.com`,difficulty:`Medium`,tags:[`4-table JOIN`,`multi-table JOIN`,`WHERE filter`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:9,datamartId:`ecomm`,prompt:`The merchandising team needs a line-item view of every fulfilled order to reconcile inventory. Join users, orders, order_items, and products to produce one row per item in each completed order. Return the customer email, order id, order date, product name, category, and unit price. Exclude cancelled and returned orders.`,expectedColumns:[`email`,`order_id`,`created_at`,`product_name`,`category`,`unit_price`],expectedRowCount:25,hints:[`What does one row in your result represent? Your output needs 25 rows with columns: email, order_id, created_at, product_name, category, unit_price.`,`Identify the join key — the column that links the two tables. Write the JOIN ON condition before adding WHERE or GROUP BY.`],checkValues:[{order_id:`1`,category:`electronics`}],solution:`SELECT u.email, o.order_id, o.created_at, p.name AS product_name, p.category, oi.unit_price
FROM orders o
JOIN users u ON o.user_id = u.user_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
WHERE o.status = 'completed'
ORDER BY o.order_id`,debrief:`The result has 25 rows because two orders (14 and 23) each contain two items, while the other 21 completed orders contain one item each. Chain JOINs in logical order — orders then items then products — to avoid cross-product explosions. Filter status early in the WHERE clause.`,sqliteNote:null},{id:`sql-m36`,title:`Returned Then Re-Purchased Customers`,company:`Zalando`,companyDomain:`zalando.com`,difficulty:`Medium`,tags:[`self-join`,`multi-condition JOIN`,`DISTINCT`],roles:[`PA`,`DA`,`BA`],priority:2,estimatedMin:10,datamartId:`ecomm`,prompt:`The retention team wants to identify customers who submitted a return but later placed a completed order — these are high-value customers who resolved their dissatisfaction. Return each qualifying customer's email and user id, ordered by user id.`,expectedColumns:[`email`,`user_id`],expectedRowCount:3,hints:[`What does one row in your result represent? Your output needs 3 rows with columns: email, user_id.`,`Identify the join key — the column that links the two tables. Write the JOIN ON condition before adding WHERE or GROUP BY.`],checkValues:[{user_id:`4`,email:`dan@example.com`}],solution:`SELECT DISTINCT u.email, u.user_id
FROM users u
JOIN orders o1 ON u.user_id = o1.user_id AND o1.status = 'returned'
JOIN orders o2 ON u.user_id = o2.user_id AND o2.status = 'completed'
ORDER BY u.user_id`,debrief:`Joining orders to itself twice — once for returned, once for completed — is the self-join pattern. Users 4, 10, and 12 each have at least one returned and one completed order. DISTINCT prevents duplicates when a user has multiple returns or completions. An EXISTS correlated subquery is an equally valid approach.`,sqliteNote:null},{id:`sql-m37`,title:`High-Value Customers by Lifetime Spend`,company:`Amazon`,companyDomain:`amazon.com`,difficulty:`Medium`,tags:[`HAVING`,`SUM`,`GROUP BY`],roles:[`PA`,`DA`,`PM`,`BA`],priority:1,estimatedMin:7,datamartId:`ecomm`,prompt:`The loyalty team defines a high-value customer as anyone whose total order subtotal exceeds $200, across all order statuses. Return each qualifying user id and their rounded total spend, ordered by total spent descending.`,expectedColumns:[`user_id`,`total_spent`],expectedRowCount:6,hints:[`What does one row in your result represent? Your output needs 6 rows with columns: user_id, total_spent.`,`HAVING filters after aggregation; WHERE filters before. Use HAVING to filter on aggregated values like COUNT(*) > 1.`],checkValues:[],solution:`SELECT user_id, ROUND(SUM(subtotal), 2) AS total_spent
FROM orders
GROUP BY user_id
HAVING SUM(subtotal) > 200
ORDER BY total_spent DESC`,debrief:`Six users exceed $200 in total subtotal across all statuses: users 5, 1, 9, 7, 12, and 2. HAVING filters after aggregation — you cannot use WHERE to filter on an aggregate. Repeat the full SUM expression in HAVING rather than referencing the alias to avoid dialect-specific aliasing issues.`,sqliteNote:null},{id:`sql-m39`,title:`Account Event Date Range`,company:`Mixpanel`,companyDomain:`mixpanel.com`,difficulty:`Medium`,tags:[`MIN window`,`MAX window`,`window function`,`PARTITION BY`],roles:[`PA`,`DA`],priority:2,estimatedMin:8,datamartId:`saas`,prompt:`Customer success wants to see each account's full activity window alongside every event in the log. For each event row, show how far back the account's history goes and when they were last active.`,expectedColumns:[`event_id`,`account_id`,`occurred_at`,`first_event_date`,`last_event_date`],expectedRowCount:50,hints:[`What does one row in your result represent? Your output needs 50 rows with columns: event_id, account_id, occurred_at, first_event_date, last_event_date.`,`Window functions compute a value per row without collapsing rows like GROUP BY. Decide your PARTITION BY (reset scope) and ORDER BY (ranking order).`],checkValues:[{event_id:`1`,first_event_date:`2024-01-02`}],solution:`SELECT event_id, account_id, occurred_at,
       MIN(occurred_at) OVER (PARTITION BY account_id) AS first_event_date,
       MAX(occurred_at) OVER (PARTITION BY account_id) AS last_event_date
FROM events
ORDER BY account_id, occurred_at`,debrief:`What the stakeholder wants: A per-event view showing each account's first and last recorded event dates, so the CS team can quickly assess account tenure and recency from any event row.

Ambiguities resolved: 'Full activity window' means first_event_date and last_event_date per account, not per user. Inactive accounts (no events) don't appear in the events table and are naturally excluded — if the request were 'all accounts' a LEFT JOIN from accounts would be needed.

SQL approach: MIN(occurred_at) OVER (PARTITION BY account_id) and MAX(occurred_at) OVER (PARTITION BY account_id) compute the bookend dates per account. Without an ORDER BY clause in the OVER, these compute the full-partition aggregate — every row in the same account gets the same first and last date regardless of which row we're on.

What weak SQL looks like: Adding ORDER BY occurred_at to the OVER — this turns MIN into a running minimum and MAX into a running maximum, changing the semantics entirely. Or using a correlated subquery for each row — this works but scans the events table multiple times instead of a single window pass.

Interviewer follow-up: 'How would you flag accounts whose last event was more than 30 days ago?'`,sqliteNote:null},{id:`sql-m41`,title:`Transaction Size Buckets`,company:`PayPal`,companyDomain:`paypal.com`,difficulty:`Medium`,tags:[`CASE WHEN`,`bucketing`,`GROUP BY`],roles:[`PA`,`DA`,`BA`],priority:1,estimatedMin:7,datamartId:`fintech`,prompt:`The risk team wants to understand how our transaction volume is distributed by size so they can calibrate fraud detection thresholds. Break down our transactions into small, medium, and large buckets.`,expectedColumns:[`size_bucket`,`txn_count`],expectedRowCount:3,hints:[`What does one row in your result represent? Your output needs 3 rows with columns: size_bucket, txn_count.`,`CASE WHEN ... THEN ... ELSE ... END works like if-else inside SQL. You can use it inside aggregate functions for conditional counts.`],checkValues:[{size_bucket:`small`,txn_count:`19`}],solution:`SELECT CASE WHEN amount < 100 THEN 'small' WHEN amount < 1000 THEN 'medium' ELSE 'large' END AS size_bucket,
       COUNT(*) AS txn_count
FROM transactions
GROUP BY 1
ORDER BY txn_count DESC`,debrief:`What the stakeholder wants: A count of transactions in each size tier to understand the distribution before setting anomaly thresholds — knowing whether most transactions are small vs. large changes how fraud rules are calibrated.

Ambiguities resolved: The candidate must define the tier thresholds. A reasonable split for consumer fintech: small = under $100, medium = $100 to $999, large = $1,000 or more. These are business decisions that should be stated and documented — the stakeholder said 'small, medium, and large' without defining the boundaries.

SQL approach: CASE WHEN inside SELECT creates the size_bucket label using top-to-bottom evaluation — the second condition implicitly means $100 to $999 because values under $100 are already handled by condition 1. GROUP BY 1 groups by the derived expression. ORDER BY txn_count DESC surfaces the dominant bucket first.

What weak SQL looks like: Using NTILE(3) — this creates equal-row-count buckets, not business-meaningful value ranges. Bucket 1 in NTILE is not the same as 'transactions under $100'. For fraud threshold calibration, fixed value thresholds are needed, not equal-count quantiles.

Interviewer follow-up: 'What additional cut would you add if fraud rate is highest in the $500-$999 range?'`,sqliteNote:null},{id:`sql-m42`,title:`Patient Age at Appointment`,company:`Teladoc`,companyDomain:`teladoc.com`,difficulty:`Medium`,tags:[`julianday`,`date arithmetic`,`JOIN`,`CAST`],roles:[`PA`,`DA`,`BA`],priority:2,estimatedMin:9,datamartId:`health`,prompt:`The clinical quality team needs each patient's age at the time of their appointment to stratify care outcomes by age group. Pull each appointment with the patient's age at the visit.`,expectedColumns:[`appt_id`,`patient_id`,`gender`,`scheduled_at`,`age_at_visit`],expectedRowCount:10,hints:[`What does one row in your result represent? Your output needs 10 rows with columns: appt_id, patient_id, gender, scheduled_at, age_at_visit.`,`Identify the join key — the column that links the two tables. Write the JOIN ON condition before adding WHERE or GROUP BY.`],checkValues:[],solution:`SELECT a.appt_id, p.patient_id, p.gender, a.scheduled_at,
       CAST((julianday(a.scheduled_at) - julianday(p.dob)) / 365.25 AS INTEGER) AS age_at_visit
FROM appointments a
JOIN patients p ON a.patient_id = p.patient_id
ORDER BY a.appt_id
LIMIT 10`,debrief:`What the stakeholder wants: A per-appointment record showing how old each patient was at the time of the visit — not their current age — so outcomes can be stratified by age cohort.

Ambiguities resolved: 'Age' means completed whole years at appointment time, not decimal age. Age is calculated from the patient's date of birth to the appointment date, then truncated to an integer. SQLite has no AGE() function so julianday() is the standard approach. The LIMIT 10 scopes to the first 10 appointments by appt_id.

SQL approach: julianday(scheduled_at) - julianday(dob) gives elapsed days. Dividing by 365.25 accounts for leap years. CAST(...AS INTEGER) truncates to whole years. The JOIN on patient_id is required because dob is in the patients table and the appointment date is in appointments.

What weak SQL looks like: strftime('%Y', scheduled_at) - strftime('%Y', dob) for year difference — this ignores whether the birthday has passed yet in the appointment year, producing an off-by-one error for patients seen before their birthday in a given year.

Interviewer follow-up: 'How would you group these into standard age bands (18-34, 35-54, 55+) for reporting?'`,sqliteNote:`Uses julianday() which is SQLite-specific. In PostgreSQL use: EXTRACT(YEAR FROM AGE(a.scheduled_at::date, p.dob::date)) AS age_at_visit.`},{id:`sql-m43`,title:`Interaction Breakdown with Total`,company:`YouTube`,companyDomain:`youtube.com`,difficulty:`Medium`,tags:[`UNION ALL`,`aggregation`,`GROUP BY`],roles:[`PA`,`DA`,`PM`],priority:2,estimatedMin:8,datamartId:`consumer`,prompt:`The engagement team wants a breakdown of interaction counts by action type, plus a TOTAL row at the top so QA can verify the numbers add up. Can you put that together?`,expectedColumns:[`action`,`count`],expectedRowCount:6,hints:[`What does one row in your result represent? Your output needs 6 rows with columns: action, count.`,`Every column in SELECT that is not inside an aggregate must appear in GROUP BY. Sketch the output shape first — one row per what?`],checkValues:[{action:`view`,count:`14`}],solution:`SELECT action, COUNT(*) AS count
FROM interactions
GROUP BY action
UNION ALL
SELECT 'TOTAL', COUNT(*)
FROM interactions
ORDER BY 2 DESC`,debrief:`What the stakeholder wants: A summary of interactions per action type with a TOTAL row appended, so QA can cross-check that per-action counts sum to the overall count.

Ambiguities resolved: The total is a separate summary row, not a column. The result has one row per action type plus one TOTAL row — 6 rows in this dataset. The TOTAL row is for QA and display; it should not be used for downstream aggregation.

SQL approach: GROUP BY action gives the per-action breakdown. UNION ALL appends a separate SELECT COUNT(*) row labeled 'TOTAL'. ORDER BY 2 DESC sorts by count descending, so TOTAL (the largest number) appears first. ORDER BY references the second column positionally — alias-based ORDER BY may not resolve consistently across UNION branches.

What weak SQL looks like: Using UNION instead of UNION ALL — UNION deduplicates, and if any action type happened to have the same count as TOTAL it would be silently dropped. Or GROUP BY ROLLUP — cleaner in PostgreSQL but not standard in SQLite; interviewers may want the UNION ALL pattern explicitly.

Interviewer follow-up: 'How would you add a percentage column showing each action type's share of total interactions?'`,sqliteNote:null},{id:`sql-m47`,title:`Days Since Previous Order`,company:`Shopify`,companyDomain:`shopify.com`,difficulty:`Medium`,tags:[`LAG`,`window function`,`PARTITION BY`,`julianday`],roles:[`PA`,`DA`],priority:1,estimatedMin:9,datamartId:`ecomm`,prompt:`The retention team wants to understand how frequently our customers come back to place another order. For each order, can you show how many days passed since that customer's previous purchase?`,expectedColumns:[`user_id`,`order_id`,`created_at`,`days_since_prev`],expectedRowCount:28,hints:[`What does one row in your result represent? Your output needs 28 rows with columns: user_id, order_id, created_at, days_since_prev.`,`Window functions compute a value per row without collapsing rows like GROUP BY. Decide your PARTITION BY (reset scope) and ORDER BY (ranking order).`],checkValues:[],solution:`SELECT user_id, order_id, created_at,
       CAST(julianday(created_at) - julianday(LAG(created_at) OVER (PARTITION BY user_id ORDER BY created_at)) AS INTEGER) AS days_since_prev
FROM orders
ORDER BY user_id, created_at`,debrief:`What the stakeholder wants: A per-order view showing each customer's reorder gap — days elapsed since their previous order — so the team can identify declining purchase frequency and trigger re-engagement.

Ambiguities resolved: Should returned or cancelled orders count? Including all statuses means a return still resets the reorder clock. If the team only wants completed purchases, a WHERE status = 'completed' filter should be added and the business should decide. First orders per user return NULL for days_since_prev — expected and useful for distinguishing new vs. returning customers.

SQL approach: LAG(created_at) OVER (PARTITION BY user_id ORDER BY created_at) retrieves the prior order's date within each user's partition. julianday difference converts the date gap to days. CAST to INTEGER gives whole days. First-row LAG returns NULL naturally.

What weak SQL looks like: A self-join with MAX(created_at) < current order date — this works but requires a correlated subquery or complex join condition, scans large tables slowly, and still needs NULL handling for first orders. LAG is simpler, faster, and more readable.

Interviewer follow-up: 'How would you flag users whose reorder gap has increased by more than 30% compared to their historical average?'`,sqliteNote:`Uses julianday() for date arithmetic. In PostgreSQL use: (created_at::date - LAG(created_at::date) OVER (...)) AS days_since_prev.`},{id:`sql-m56`,title:`Fitness Content Audience`,company:`YouTube`,companyDomain:`youtube.com`,difficulty:`Medium`,tags:[`IN subquery`,`DISTINCT`,`JOIN`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:8,datamartId:`consumer`,prompt:`The content partnerships team wants to identify all users who have engaged with any fitness category content, to build a lookalike audience for a health brand campaign. Return the distinct user ids of everyone who has interacted with at least one fitness content piece, ordered by user id.`,expectedColumns:[`user_id`],expectedRowCount:9,hints:[`What does one row in your result represent? Your output needs 9 rows with column: user_id.`,`Think about which SQL clause handles the core transformation here.`],checkValues:[{user_id:`1`}],solution:`SELECT DISTINCT i.user_id
FROM interactions i
WHERE i.content_id IN (
  SELECT content_id FROM content WHERE category = 'fitness'
)
ORDER BY i.user_id`,debrief:`The IN subquery returns content ids 1 and 6, which are both fitness category. Nine distinct users have interacted with at least one: users 1–8 (from content 1) plus user 11 (from content 6). DISTINCT is required since a user could interact multiple times with the same fitness piece.`,sqliteNote:null},{id:`sql-m57`,title:`Product Sales Rank`,company:`Amazon`,companyDomain:`amazon.com`,difficulty:`Medium`,tags:[`DENSE_RANK`,`CTE`,`window function`,`JOIN`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:10,datamartId:`ecomm`,prompt:`The merchandising team wants a product sales leaderboard — which products are being ordered the most? Rank them so tied products get the same position.`,expectedColumns:[`product_id`,`name`,`times_ordered`,`rnk`],expectedRowCount:9,hints:[`What does one row in your result represent? Your output needs 9 rows with columns: product_id, name, times_ordered, rnk.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`],checkValues:[{product_id:`1`,times_ordered:`6`,rnk:`1`}],solution:`WITH order_counts AS (
  SELECT oi.product_id, p.name, COUNT(*) AS times_ordered
  FROM order_items oi
  JOIN products p ON oi.product_id = p.product_id
  GROUP BY oi.product_id, p.name
)
SELECT product_id, name, times_ordered,
       DENSE_RANK() OVER (ORDER BY times_ordered DESC) AS rnk
FROM order_counts
ORDER BY rnk, product_id`,debrief:`What the stakeholder wants: A ranked list of products by order frequency, with tied products sharing the same rank so no product is unfairly penalized for a tie.

Ambiguities resolved: 'Ordered the most' means times appearing in order_items (line count), not total units or revenue. 'Same rank for ties' disambiguates between RANK and DENSE_RANK: both give identical numbers to tied rows, but RANK skips subsequent ranks while DENSE_RANK does not. For a leaderboard, DENSE_RANK is preferred so rank 3 follows rank 2 without gaps.

SQL approach: A CTE aggregates order_items joined to products to get times_ordered per product. The outer SELECT applies DENSE_RANK() OVER (ORDER BY times_ordered DESC). Products not in order_items (discontinued) are excluded by the JOIN — a LEFT JOIN would retain them at rank N with 0 orders.

What weak SQL looks like: ORDER BY times_ordered DESC LIMIT 10 without a rank function — doesn't handle ties correctly; a tied 10th and 11th product produces an arbitrary cutoff. Using RANK — if products 2 and 3 both have 4 orders and share rank 2, RANK skips rank 3 and assigns rank 4 to the next product, creating a gap that confuses stakeholders reading a leaderboard.

Interviewer follow-up: 'How would you show only the top 3 ranks, including all tied products?'`,sqliteNote:null},{id:`sql-m61`,title:`Content Engagement Diversity`,company:`TikTok`,companyDomain:`tiktok.com`,difficulty:`Medium`,tags:[`COUNT DISTINCT`,`LEFT JOIN`,`GROUP BY`],roles:[`PA`,`DA`,`PM`],priority:2,estimatedMin:8,datamartId:`consumer`,prompt:`The algorithm team uses diversity of engagement actions as a quality signal — content that attracts views, likes, saves, and comments is healthier than content that only gets views. For each content piece, return content id, content type, category, and the number of distinct interaction action types it received.`,expectedColumns:[`content_id`,`content_type`,`category`,`unique_actions`],expectedRowCount:8,hints:[`What does one row in your result represent? Your output needs 8 rows with columns: content_id, content_type, category, unique_actions.`,`LEFT JOIN keeps all rows from the left table even when there is no match. Use this when you need to detect missing or zero-count records.`],checkValues:[{content_id:`1`,unique_actions:`5`}],solution:`SELECT c.content_id, c.content_type, c.category,
       COUNT(DISTINCT i.action) AS unique_actions
FROM content c
LEFT JOIN interactions i ON c.content_id = i.content_id
GROUP BY c.content_id, c.content_type, c.category
ORDER BY unique_actions DESC`,debrief:`Content 1 tops engagement diversity with 5 distinct action types (view, like, share, save, comment). Content 5 follows with 4. LEFT JOIN is used here to include all 8 content pieces even if some had zero interactions — in this dataset all do, but the pattern is correct for production data.`,sqliteNote:null},{id:`sql-h14`,title:`Accounts With Login-to-Export Progression`,company:`Amplitude`,companyDomain:`amplitude.com`,difficulty:`Medium`,tags:[`EXISTS`,`correlated subquery`,`event funnel`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:14,datamartId:`saas`,prompt:`The product team is measuring feature adoption depth — specifically which accounts have users who logged in AND also exported data. Return account id and company name for every account that has at least one login event AND at least one export event in its history, ordered by account id.`,expectedColumns:[`account_id`,`company_name`],expectedRowCount:3,hints:[`What does one row in your result represent? Your output needs 3 rows with columns: account_id, company_name.`,`Think about which SQL clause handles the core transformation here.`],checkValues:[{account_id:`1`}],solution:`SELECT a.account_id, a.company_name
FROM accounts a
WHERE EXISTS (
  SELECT 1 FROM events e1
  WHERE e1.account_id = a.account_id AND e1.event_name = 'login'
)
AND EXISTS (
  SELECT 1 FROM events e2
  WHERE e2.account_id = a.account_id AND e2.event_name = 'export'
)
ORDER BY a.account_id`,debrief:`Accounts 1, 2, and 3 have both login and export events. Accounts 5 and 6 have logins but no exports — these are engagement gaps for the product team to investigate. Using two EXISTS clauses is more readable than a single JOIN with DISTINCT and communicates the intent clearly: "this account has been touched by both event types."`,sqliteNote:null},{id:`sql-h22`,title:`Providers With Perfect Attendance`,company:`Doximity`,companyDomain:`doximity.com`,difficulty:`Medium`,tags:[`HAVING`,`SUM`,`GROUP BY`,`aggregate filter`],roles:[`PA`,`DA`,`BA`],priority:2,estimatedMin:12,datamartId:`health`,prompt:`The clinic director wants to recognize providers who have never had a patient no-show. Return provider id, appointment count, and no-show count for every provider whose no-show total is exactly zero, ordered by appointment count descending.`,expectedColumns:[`provider_id`,`total_appts`,`no_shows`],expectedRowCount:3,hints:[`What does one row in your result represent? Your output needs 3 rows with columns: provider_id, total_appts, no_shows.`,`HAVING filters after aggregation; WHERE filters before. Use HAVING to filter on aggregated values like COUNT(*) > 1.`],checkValues:[{provider_id:`3`,total_appts:`4`}],solution:`SELECT provider_id, COUNT(*) AS total_appts, SUM(no_show) AS no_shows
FROM appointments
GROUP BY provider_id
HAVING SUM(no_show) = 0
ORDER BY total_appts DESC`,debrief:`Providers 3 (4 appts), 4 (2 appts), and 6 (2 appts) have perfect attendance records. HAVING SUM(no_show) = 0 is the aggregate filter for zero no-shows — this is equivalent to NOT EXISTS but more concise. Providers 1 and 5 have the highest no-show rates at 40% and 33%, which would be flagged for scheduling strategy review.`,sqliteNote:null},{id:`sql-h25`,title:`Running Revenue Per User`,company:`Amazon`,companyDomain:`amazon.com`,difficulty:`Medium`,tags:[`SUM OVER`,`window function`,`running total`,`PARTITION BY`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:14,datamartId:`ecomm`,prompt:`Finance wants to track how each customer's spending has built up order by order. For every order, show how much that customer has spent in total up to that point.`,expectedColumns:[`user_id`,`order_id`,`created_at`,`subtotal`,`running_total`],expectedRowCount:28,hints:[`What does one row in your result represent? Your output needs 28 rows with columns: user_id, order_id, created_at, subtotal, running_total.`,`Window functions compute a value per row without collapsing rows like GROUP BY. Decide your PARTITION BY (reset scope) and ORDER BY (ranking order).`],checkValues:[],solution:`SELECT user_id, order_id, created_at, subtotal,
       SUM(subtotal) OVER (PARTITION BY user_id ORDER BY created_at) AS running_total
FROM orders
ORDER BY user_id, created_at`,debrief:`What the stakeholder wants: A per-order running total of each customer's cumulative spend, so Finance can see the revenue trajectory per customer and model LTV curves.

Ambiguities resolved: Should cancelled or returned orders count toward cumulative revenue? Including all statuses makes the running total volatile. A WHERE status = 'completed' filter gives a cleaner LTV signal and should be discussed with the stakeholder. 'Running total' means cumulative up to and including the current order sorted by date — not a full-partition sum on every row.

SQL approach: SUM(subtotal) OVER (PARTITION BY user_id ORDER BY created_at) computes a cumulative sum within each user's order history. Adding ORDER BY to the OVER changes the default frame from full-partition to rows-preceding-through-current, making it a running sum rather than a total.

What weak SQL looks like: Omitting ORDER BY inside the OVER — SUM(subtotal) OVER (PARTITION BY user_id) gives the total spend for that user on every row (a constant), not a running sum. The interviewer will catch this when row 1 and row 5 for the same user show the same number.

Interviewer follow-up: 'How would you identify customers whose running total crossed $500 for the first time?'`,sqliteNote:null},{id:`sql-h27`,title:`Account Balance Quartiles`,company:`JPMorgan Chase`,companyDomain:`jpmorganchase.com`,difficulty:`Medium`,tags:[`NTILE`,`window function`,`balance distribution`,`segmentation`],roles:[`PA`,`DA`,`BA`],priority:2,estimatedMin:13,datamartId:`fintech`,prompt:`The wealth management team wants to segment accounts into four equal-size tiers by balance so advisors know which accounts to prioritize. Can you assign each account to a quartile?`,expectedColumns:[`account_id`,`user_id`,`balance`,`currency`,`quartile`],expectedRowCount:15,hints:[`What does one row in your result represent? Your output needs 15 rows with columns: account_id, user_id, balance, currency, quartile.`,`Window functions compute a value per row without collapsing rows like GROUP BY. Decide your PARTITION BY (reset scope) and ORDER BY (ranking order).`],checkValues:[{account_id:`5`,quartile:`1`}],solution:`SELECT account_id, user_id, balance, currency,
       NTILE(4) OVER (ORDER BY balance DESC) AS quartile
FROM accounts
ORDER BY quartile, balance DESC`,debrief:`What the stakeholder wants: Every account labeled with a quartile (1 through 4) based on balance, so the team can route Q1 accounts to dedicated relationship managers and Q4 accounts to self-service.

Ambiguities resolved: Which quartile gets which label is a business decision — here Q1 = highest balance (priority clients), Q4 = lowest. This must be stated explicitly. NTILE(4) creates four equal-size groups, distributing remainder rows to the first groups (15 accounts produces groups of 4, 4, 4, 3).

SQL approach: NTILE(4) OVER (ORDER BY balance DESC) assigns 1 to the highest-balance accounts first. No PARTITION BY — this ranks across all accounts. ORDER BY quartile, balance DESC in the outer query orders output for display.

What weak SQL looks like: NTILE(4) OVER (ORDER BY balance ASC) — this assigns Q1 to the lowest-balance accounts, inverting the intended priority. A candidate who doesn't explicitly state sort direction is leaving a material business decision implicit. NTILE also doesn't respect natural value gaps — a $25,000 account and a $9,300 account can land in the same quartile based purely on row count.

Interviewer follow-up: 'How would you re-segment if the team wants quartile boundaries based on fixed dollar thresholds instead of equal row counts?'`,sqliteNote:null},{id:`sql-h28`,title:`Content Engagement Pivot`,company:`TikTok`,companyDomain:`tiktok.com`,difficulty:`Medium`,tags:[`CASE WHEN`,`pivot`,`GROUP BY`,`engagement mix`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:15,datamartId:`consumer`,prompt:`The content team wants to see the engagement mix for every piece of content — how many views, likes, shares, saves, and comments each has gotten. One row per content item.`,expectedColumns:[`content_id`,`views`,`likes`,`shares`,`saves`,`comments`],expectedRowCount:8,hints:[`What does one row in your result represent? Your output needs 8 rows with columns: content_id, views, likes, shares, saves, comments.`,`CASE WHEN ... THEN ... ELSE ... END works like if-else inside SQL. You can use it inside aggregate functions for conditional counts.`],checkValues:[{content_id:`1`,views:`3`,likes:`2`,shares:`1`,saves:`1`,comments:`1`}],solution:`SELECT content_id,
       SUM(CASE WHEN action = 'view' THEN 1 ELSE 0 END) AS views,
       SUM(CASE WHEN action = 'like' THEN 1 ELSE 0 END) AS likes,
       SUM(CASE WHEN action = 'share' THEN 1 ELSE 0 END) AS shares,
       SUM(CASE WHEN action = 'save' THEN 1 ELSE 0 END) AS saves,
       SUM(CASE WHEN action = 'comment' THEN 1 ELSE 0 END) AS comments
FROM interactions
GROUP BY content_id
ORDER BY content_id`,debrief:`What the stakeholder wants: A wide-format table with one row per content item and a separate column for each action type count, so the team can spot which content drives high shares vs. high views and tune the recommendation algorithm accordingly.

Ambiguities resolved: Should content with zero interactions appear? The current approach groups FROM interactions — this naturally excludes content never interacted with. If the team wants a complete content inventory, a LEFT JOIN from content to interactions is needed. 'Engagement mix' means raw counts per action type, not weighted scores.

SQL approach: SUM(CASE WHEN action = 'view' THEN 1 ELSE 0 END) conditionally counts rows matching each action type. One SUM CASE WHEN per column. GROUP BY content_id produces one row per content item. This is the standard SQL pivot pattern.

What weak SQL looks like: Five separate subqueries or JOINs, one per action type — verbose, slower on large tables, and harder to extend with new action types. Or using GROUP BY action without pivoting — this gives a long format with multiple rows per content item, not the one-row-per-content layout the stakeholder asked for.

Interviewer follow-up: 'How would you add a weighted engagement score column — shares at 3x, comments at 2x, likes at 1x, views at 0.5x?'`,sqliteNote:null},{id:`sql-h39`,title:`Multi-Provider Patients`,company:`Doximity`,companyDomain:`doximity.com`,difficulty:`Medium`,tags:[`GROUP BY`,`HAVING`,`COUNT DISTINCT`,`care coordination`],roles:[`PA`,`DA`,`BA`],priority:2,estimatedMin:13,datamartId:`health`,prompt:`The care coordination team flags patients with prescriptions from more than one provider — a medication reconciliation risk. Return patient_id, provider_count (distinct providers), and rx_count (total prescriptions) for all patients where provider_count > 1. Order by provider_count descending, then patient_id ascending.`,expectedColumns:[`patient_id`,`provider_count`,`rx_count`],expectedRowCount:5,hints:[`What does one row in your result represent? Your output needs 5 rows with columns: patient_id, provider_count, rx_count.`,`HAVING filters after aggregation; WHERE filters before. Use HAVING to filter on aggregated values like COUNT(*) > 1.`],checkValues:[{patient_id:`1`,provider_count:`2`,rx_count:`2`}],solution:`SELECT patient_id,
       COUNT(DISTINCT provider_id) AS provider_count,
       COUNT(*) AS rx_count
FROM prescriptions
GROUP BY patient_id
HAVING COUNT(DISTINCT provider_id) > 1
ORDER BY provider_count DESC, patient_id ASC`,debrief:`Five patients have prescriptions from more than one provider: patients 1, 2, 3, 10, and 11 — all with exactly 2 providers and 2 prescriptions. Each provider may be unaware of what the other prescribed. COUNT(DISTINCT provider_id) in the HAVING clause is more precise than COUNT(*) — it targets provider diversity specifically, not just prescription volume. In a real clinical model, the next step is a drug-drug interaction check across the multi-provider prescription list. Patients on both Lisinopril and Atorvastatin (a common combination for cardiovascular risk) are a priority for reconciliation.`,sqliteNote:null},{id:`sql-h49`,title:`User Engagement Recency`,company:`TikTok`,companyDomain:`tiktok.com`,difficulty:`Medium`,tags:[`CTE`,`MAX`,`julianday`,`recency`,`retention`],roles:[`PA`,`DA`,`PM`],priority:2,estimatedMin:14,datamartId:`consumer`,prompt:`The retention team wants to flag dormant users. For each user who has at least one interaction, return user_id, username, last_interaction_date, and days_since_last — the integer number of days between their last interaction and the dataset reference date 2023-12-06. Order by days_since_last descending.`,expectedColumns:[`user_id`,`username`,`last_interaction_date`,`days_since_last`],expectedRowCount:13,hints:[`What does one row in your result represent? Your output needs 13 rows with columns: user_id, username, last_interaction_date, days_since_last.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`],checkValues:[{user_id:`12`,days_since_last:`0`}],solution:`WITH last_interaction AS (
  SELECT user_id, MAX(occurred_at) AS last_interaction_date
  FROM interactions
  GROUP BY user_id
)
SELECT u.user_id, u.username, li.last_interaction_date,
       CAST(julianday('2023-12-06') - julianday(li.last_interaction_date) AS INTEGER) AS days_since_last
FROM users u
JOIN last_interaction li ON u.user_id = li.user_id
ORDER BY days_since_last DESC`,debrief:`User 12 (lisa) had the most recent interaction on 2023-12-06 — the reference date — so her days_since_last is 0. Users with last interactions in early November show 25+ days of inactivity. Users 14 and 15 have zero interactions and are excluded by the INNER JOIN — in a full retention dashboard, LEFT JOIN and treating NULL as "never engaged" would be the correct approach. The hardcoded reference date is deliberate for this dataset; in production, replace it with MAX(occurred_at) FROM interactions or CURRENT_DATE.`,sqliteNote:`Uses julianday() for date arithmetic. In PostgreSQL: ('2023-12-06'::date - last_interaction_date::date) AS days_since_last.`},{id:`sql-m76`,title:`Employee Salary Percentile`,company:`Workday`,companyDomain:`workday.com`,difficulty:`Medium`,isFree:!1,tags:[`PERCENT_RANK`,`window function`,`compensation`,`pay equity`],roles:[`PA`,`DA`],priority:2,estimatedMin:12,datamartId:`hr_analytics`,prompt:`The comp team is building a pay-equity dashboard. For each active employee, return emp_id, name, salary, and pct_rank — their PERCENT_RANK among all active employees by salary, rounded to 2 decimal places. A pct_rank of 1.0 is the highest-paid active employee. Order by salary descending.`,expectedColumns:[`emp_id`,`name`,`salary`,`pct_rank`],expectedRowCount:14,hints:[`What does one row in your result represent? Your output needs 14 rows with columns: emp_id, name, salary, pct_rank.`,`PERCENT_RANK returns a fraction 0–1 across the ordered set. It needs OVER (ORDER BY ...) and returns 0 for the lowest value.`],checkValues:[{emp_id:`1`,name:`Jordan Smith`,salary:`320000`,pct_rank:`1.0`},{emp_id:`15`,name:`Bea Santos`,pct_rank:`0.0`}],solution:`SELECT emp_id, name, salary,
  ROUND(PERCENT_RANK() OVER (ORDER BY salary), 2) AS pct_rank
FROM employees
WHERE is_active = 1
ORDER BY salary DESC`,debrief:`PERCENT_RANK() OVER (ORDER BY salary) ranks ascending — salary=110000 gets 0.0, salary=320000 gets 1.0. With 14 active employees, each rank step = 1/13 ≈ 0.077. Maya Diop and Ola Adeyemi both earn 130000 — they share the same rank position and therefore the same pct_rank (0.15). The filter WHERE is_active = 1 matters: including Ivan Petrov (terminated, is_active=0, salary=140000) would shift every pct_rank and change n from 14 to 15. Always confirm with the stakeholder whether "employees" means roster or active-only before writing.`,sqliteNote:null},{id:`sql-m77`,title:`Unique Buyer Reach per Seller`,company:`Etsy`,companyDomain:`etsy.com`,difficulty:`Medium`,isFree:!1,tags:[`COUNT DISTINCT`,`GROUP BY`,`buyer analytics`,`semantic error`],roles:[`PA`,`DA`,`PM`],priority:2,estimatedMin:10,datamartId:`marketplace`,prompt:`The seller success team wants to measure buyer reach — how many distinct buyers each seller has transacted with. A junior analyst used COUNT(*) per seller but the lead flagged it as counting transactions, not buyers. Write the correct query returning seller_id and unique_buyers, ordered by unique_buyers descending.`,expectedColumns:[`seller_id`,`unique_buyers`],expectedRowCount:10,hints:[`What does one row in your result represent? Your output needs 10 rows with columns: seller_id, unique_buyers.`,`Every column in SELECT that is not inside an aggregate must appear in GROUP BY. Sketch the output shape first — one row per what?`],checkValues:[{seller_id:`1`,unique_buyers:`5`},{seller_id:`2`,unique_buyers:`2`}],solution:`SELECT seller_id, COUNT(DISTINCT buyer_id) AS unique_buyers
FROM transactions
GROUP BY seller_id
ORDER BY unique_buyers DESC`,debrief:`COUNT(*) and COUNT(DISTINCT buyer_id) both run without error — and they agree for sellers with no repeat buyers. The divergence shows up for seller 2: buyer 2 purchased twice (transactions 2 and 24), so COUNT(*) returns 3 but COUNT(DISTINCT buyer_id) returns 2. Seller 1 leads with 5 unique buyers across 5 transactions. The interviewer follow-up: "If a buyer places 10 orders from the same seller, should that count as 1 or 10 in your buyer-reach metric?" Unique buyers is the right answer for reach; total orders is right for revenue volume — never conflate them.`,sqliteNote:null},{id:`sql-m78`,title:`Courier Delivery Count — Debug the Query`,company:`DoorDash`,companyDomain:`doordash.com`,difficulty:`Medium`,isFree:!1,tags:[`COUNT`,`WHERE filter`,`NULL handling`,`semantic error`,`delivery analytics`],roles:[`PA`,`DA`],priority:2,estimatedMin:12,datamartId:`food_delivery`,prompt:`A team member shared this query to count deliveries per courier: SELECT courier_id, COUNT(*) AS deliveries FROM orders GROUP BY courier_id ORDER BY deliveries DESC. The ops lead said the numbers are inflated for some couriers. Identify the bug and write the corrected query. Return courier_id and deliveries (successfully delivered orders only), ordered by deliveries descending.`,expectedColumns:[`courier_id`,`deliveries`],expectedRowCount:8,hints:[`What does one row in your result represent? Your output needs 8 rows with columns: courier_id, deliveries.`,`Think about which SQL clause handles the core transformation here.`],checkValues:[{courier_id:`3`,deliveries:`3`}],solution:`SELECT courier_id, COUNT(*) AS deliveries
FROM orders
WHERE status = 'delivered'
GROUP BY courier_id
ORDER BY deliveries DESC`,debrief:`The original query runs without error and returns plausible-looking numbers — the bug is semantic, not syntactic. COUNT(*) includes cancelled and in_progress orders assigned to the courier. Courier 3 had 5 orders dispatched but 2 were cancelled (orders 10 and 15), so actual deliveries = 3, not 5. Courier 1 had 3 orders but 1 cancelled (order 5), actual = 2. The fix is WHERE status = 'delivered'. The interviewer follow-up: "What if you want both dispatched and delivered in the same query?" — that requires CASE WHEN inside COUNT or SUM.`,sqliteNote:null},{id:`sql-h01`,title:`Jan-to-Feb User Retention`,company:`Mixpanel`,companyDomain:`mixpanel.com`,difficulty:`Hard`,isFree:!1,tags:[`CTE`,`retention`,`LEFT JOIN`,`COUNT DISTINCT`,`cohort`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:18,datamartId:`saas`,prompt:`The product team wants to know how well we're retaining users month over month. What percentage of users who were active in January 2024 were still active in February?`,expectedColumns:[`jan_active`,`retained_in_feb`,`retention_pct`],expectedRowCount:1,hints:[`What does one row in your result represent? Your output needs 1 row with columns: jan_active, retained_in_feb, retention_pct.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 1 row? Run it and check the row count first, then verify specific values.`],checkValues:[{jan_active:`12`,retained_in_feb:`7`,retention_pct:`58.3`}],solution:`WITH jan_users AS (
  SELECT DISTINCT user_id FROM events
  WHERE occurred_at BETWEEN '2024-01-01' AND '2024-01-31'
),
feb_users AS (
  SELECT DISTINCT user_id FROM events
  WHERE occurred_at BETWEEN '2024-02-01' AND '2024-02-28'
)
SELECT
  COUNT(j.user_id) AS jan_active,
  COUNT(f.user_id) AS retained_in_feb,
  ROUND(100.0 * COUNT(f.user_id) / COUNT(j.user_id), 1) AS retention_pct
FROM jan_users j
LEFT JOIN feb_users f ON j.user_id = f.user_id`,debrief:`What the stakeholder wants: A single retention rate showing how many January-active users returned in February — a first-order stickiness signal that feeds into the monthly health dashboard.

Ambiguities resolved: 'Active' means at least one event recorded in the events table — not just registered. 'Retained' means any event in February, not necessarily the same type as January. Whether to use calendar-month boundaries or a strict 30-day window is a choice — calendar months are used here. All three values (jan_active, retained_in_feb, retention_pct) are returned in a single summary row.

SQL approach: Two CTEs collect distinct user_ids for January and February separately. A LEFT JOIN from jan_users to feb_users means unretained users produce a NULL in f.user_id. COUNT(f.user_id) skips NULLs, giving the correct retained count without a WHERE clause. Retention pct = 100.0 * retained / total.

What weak SQL looks like: A correlated subquery per user to check February activity — logically correct but O(n squared) on large event tables. Or INNER JOIN from jan_users to feb_users — this drops unretained users from the denominator, making retention appear to be 100%.

Interviewer follow-up: 'Which specific users dropped off between January and February, and what do they have in common?'`,sqliteNote:null},{id:`sql-h02`,title:`Consecutive Order Day Streak`,company:`DoorDash`,companyDomain:`doordash.com`,difficulty:`Hard`,isFree:!1,tags:[`gap-and-island`,`ROW_NUMBER`,`julianday`,`CTE`,`window functions`],roles:[`PA`,`DA`],priority:1,estimatedMin:20,datamartId:`ecomm`,prompt:`The loyalty team wants to identify customers who placed orders on 3 or more consecutive calendar days — a strong engagement signal for a streak-based rewards program. Return user_id and email for all qualifying customers.`,expectedColumns:[`user_id`,`email`],expectedRowCount:1,hints:[`What does one row in your result represent? Your output needs 1 row with columns: user_id, email.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, identify the join key between tables, GROUP BY the grouping key to collapse rows, apply a window function OVER the right partition, add a HAVING clause to filter aggregated groups.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 1 row? Run it and check the row count first, then verify specific values.`],checkValues:[{user_id:`5`,email:`eve@example.com`}],solution:`WITH distinct_order_dates AS (
  SELECT DISTINCT user_id, created_at FROM orders
),
ordered_dates AS (
  SELECT user_id, created_at,
    julianday(created_at) - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) AS grp
  FROM distinct_order_dates
),
streaks AS (
  SELECT user_id, grp, COUNT(*) AS streak_len
  FROM ordered_dates
  GROUP BY user_id, grp
  HAVING streak_len >= 3
)
SELECT DISTINCT u.user_id, u.email
FROM streaks s
JOIN users u ON s.user_id = u.user_id
ORDER BY u.user_id`,debrief:`Only user 5 (eve) qualifies — she placed orders on 2024-01-10, 11, and 12. The gap-and-island pattern: subtracting ROW_NUMBER() from the day value groups consecutive dates into the same "island" because both increment by 1 each day. Non-consecutive dates produce different grp values. The DISTINCT in the first CTE is essential — without it, a user with two orders on the same day inflates the row count and breaks the arithmetic. The weak answer tries self-joining orders to find pairs, which fails to generalize to N-day streaks and misses the island grouping.`,sqliteNote:`Uses julianday() for date arithmetic — SQLite-specific. Equivalent to DATEDIFF in other dialects.`},{id:`sql-h04`,title:`Q1 2023 Cohort Repeat Purchase Rate`,company:`Shopify`,companyDomain:`shopify.com`,difficulty:`Hard`,isFree:!1,tags:[`CTE`,`cohort analysis`,`LEFT JOIN`,`MIN`,`repeat purchase`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:18,datamartId:`ecomm`,prompt:`The retention team wants to evaluate the quality of our earliest customer cohort. Of the users who placed their very first order in Q1 2023, how many came back and bought again?`,expectedColumns:[`cohort_size`,`repeat_buyers`,`repeat_rate`],expectedRowCount:1,hints:[`What does one row in your result represent? Your output needs 1 row with columns: cohort_size, repeat_buyers, repeat_rate.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, GROUP BY the grouping key to collapse rows.`,`Date format matters — use STRFTIME or DATE() carefully for the exact format in the column.`,`Before finalising, confirm: does your query return exactly 1 row? Run it and check the row count first, then verify specific values.`],checkValues:[{cohort_size:`4`,repeat_buyers:`4`,repeat_rate:`100.0`}],solution:`WITH first_orders AS (
  SELECT user_id, MIN(created_at) AS first_order_date
  FROM orders
  GROUP BY user_id
),
q1_cohort AS (
  SELECT user_id FROM first_orders
  WHERE strftime('%Y-%m', first_order_date) BETWEEN '2023-01' AND '2023-03'
),
repeat_buyers AS (
  SELECT DISTINCT o.user_id
  FROM orders o
  JOIN first_orders fo ON o.user_id = fo.user_id
  WHERE o.created_at > fo.first_order_date
)
SELECT
  COUNT(q.user_id) AS cohort_size,
  COUNT(r.user_id) AS repeat_buyers,
  ROUND(100.0 * COUNT(r.user_id) / COUNT(q.user_id), 1) AS repeat_rate
FROM q1_cohort q
LEFT JOIN repeat_buyers r ON q.user_id = r.user_id`,debrief:`What the stakeholder wants: A cohort-level repeat purchase rate for the Q1 2023 first-order cohort — how many of those early adopters proved to be genuine repeat buyers vs. one-and-done.

Ambiguities resolved: 'First order in Q1 2023' means the user's MIN(created_at) falls in January, February, or March 2023 — not any order in Q1, but the very first order ever. 'Came back and bought again' means at least one additional order after the first order date, regardless of status. Whether to count only completed orders for the repeat is a business decision worth surfacing.

SQL approach: Three CTEs: (1) first_orders anchors each user's MIN(created_at). (2) q1_cohort filters to users whose first order falls in Q1 2023. (3) repeat_buyers finds users with any order dated after their first order date. A LEFT JOIN from q1_cohort to repeat_buyers measures how many cohort members hit the repeat condition.

What weak SQL looks like: MAX(created_at) > MIN(created_at) per user in a single GROUP BY — simpler but incorrect for cohort-scoped analysis. It doesn't isolate Q1 2023 first-orderers vs. users who happened to order in Q1 and had already ordered before. Also misses the rate calculation.

Interviewer follow-up: 'How would you extend this to a 3-month cohort retention curve — what percentage of Q1 2023 cohort ordered in Q2, Q3, and Q4 respectively?'`,sqliteNote:null},{id:`sql-h05`,title:`Provider Below Practice Average`,company:`Teladoc`,companyDomain:`teladoc.com`,difficulty:`Hard`,isFree:!1,tags:[`CTE`,`CROSS JOIN`,`aggregation`,`outlier detection`,`CASE WHEN`],roles:[`DA`,`PA`,`BA`],priority:2,estimatedMin:20,datamartId:`health`,prompt:`Operations is trying to identify providers who may need additional support. Which providers are significantly underperforming on appointment completion compared to the rest of the practice?`,expectedColumns:[`name`,`total_appts`,`attended`,`completion_rate`,`practice_avg`],expectedRowCount:1,hints:[`What does one row in your result represent? Your output needs 1 row with columns: name, total_appts, attended, completion_rate, practice_avg.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, identify the join key between tables, GROUP BY the grouping key to collapse rows.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 1 row? Run it and check the row count first, then verify specific values.`],checkValues:[{name:`Dr. Smith`}],solution:`WITH provider_rates AS (
  SELECT provider_id,
    COUNT(*) AS total_appts,
    SUM(CASE WHEN no_show = 0 THEN 1 ELSE 0 END) AS attended,
    100.0 * SUM(CASE WHEN no_show = 0 THEN 1 ELSE 0 END) / COUNT(*) AS completion_rate
  FROM appointments
  GROUP BY provider_id
),
practice_avg AS (
  SELECT AVG(completion_rate) AS avg_rate FROM provider_rates
)
SELECT p.name, pr.total_appts, pr.attended,
  ROUND(pr.completion_rate, 1) AS completion_rate,
  ROUND(pa.avg_rate, 1) AS practice_avg
FROM provider_rates pr
JOIN providers p ON pr.provider_id = p.provider_id
CROSS JOIN practice_avg pa
WHERE pr.completion_rate < pa.avg_rate - 10
ORDER BY pr.completion_rate`,debrief:`What the stakeholder wants: A list of providers whose completion rate falls meaningfully below the practice-wide average — the clinical operations team uses this to trigger coaching conversations or workload reviews.

Ambiguities resolved: 'Significantly underperforming' must be defined numerically — the solution uses 10 percentage points below the practice average as the threshold. The candidate should state this threshold explicitly and note it is a business parameter. 'Completion rate' = appointments where no_show = 0, as a percentage of total appointments. Whether to include all specialties or scope to one is worth asking — the solution covers all providers.

SQL approach: First CTE computes completion_rate per provider via CASE WHEN aggregation. Second CTE computes the practice-wide average across providers. CROSS JOIN attaches the scalar average to every provider row without a join key. WHERE filters to providers more than 10 points below average.

What weak SQL looks like: A subquery in the WHERE clause that re-computes AVG(completion_rate) per row — logically correct but re-executes the aggregation on every row. CROSS JOIN with a CTE is the idiomatic way to compare each row to a global scalar computed once.

Interviewer follow-up: 'If you wanted to flag providers whose completion rate is in the bottom quartile rather than 10 points below average, how would you rewrite this?'`,sqliteNote:null},{id:`sql-h07`,title:`Month-over-Month Order Volume`,company:`Shopify`,companyDomain:`shopify.com`,difficulty:`Hard`,tags:[`CTE`,`LAG`,`strftime`,`GROUP BY`,`MoM`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:15,datamartId:`ecomm`,prompt:`The growth team wants to track how our order volume is trending month by month. For each month in the dataset, how does our order count compare to the prior month?`,expectedColumns:[`month`,`order_count`,`mom_change`],expectedRowCount:15,hints:[`What does one row in your result represent? Your output needs 15 rows with columns: month, order_count, mom_change.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step.`,`Date format matters — use STRFTIME or DATE() carefully for the exact format in the column.`,`Before finalising, confirm: does your query return exactly 15 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{month:`2024-01`,order_count:`4`}],solution:`WITH monthly AS (
  SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS order_count
  FROM orders
  GROUP BY month
)
SELECT month, order_count,
       order_count - LAG(order_count) OVER (ORDER BY month) AS mom_change
FROM monthly
ORDER BY month`,debrief:`What the stakeholder wants: A monthly order count time series with a change column showing growth or decline vs. the prior month — used to spot demand spikes, seasonal patterns, or worrying drops.

Ambiguities resolved: 'Order count' means total orders placed, not only completed orders. Including all statuses gives a demand signal; filtering to completed gives a revenue signal. If the team wants only completed, a WHERE status = 'completed' filter should be added. 'Prior month' means the immediately preceding calendar month, not a rolling 30-day window.

SQL approach: A CTE groups orders by strftime('%Y-%m', created_at) to get monthly counts. The outer query applies LAG(order_count) OVER (ORDER BY month) to retrieve the prior month's count. MoM change = current - prior. LAG returns NULL for the first month — acceptable per the request.

What weak SQL looks like: A self-join on the monthly CTE with date arithmetic to match prior months — more complex than LAG and harder to read. Or forgetting ORDER BY inside the OVER clause — without it, LAG picks an arbitrary prior row, not the immediately preceding month.

Interviewer follow-up: 'How would you add a column showing percentage change rather than absolute change?'`,sqliteNote:`Uses strftime() for date grouping. In PostgreSQL use: TO_CHAR(created_at::date, 'YYYY-MM') AS month.`},{id:`sql-h08`,title:`Top Spender per Country`,company:`Amazon`,companyDomain:`amazon.com`,difficulty:`Hard`,tags:[`CTE`,`ROW_NUMBER`,`PARTITION BY`,`GROUP BY`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:14,datamartId:`ecomm`,prompt:`The regional team wants to send personalized retention offers to the highest-value customer in each country. Who's the top spender in each market?`,expectedColumns:[`country`,`user_id`,`email`,`total_spent`],expectedRowCount:5,hints:[`What does one row in your result represent? Your output needs 5 rows with columns: country, user_id, email, total_spent.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, identify the join key between tables, GROUP BY the grouping key to collapse rows, apply a window function OVER the right partition.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 5 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{country:`US`,user_id:`5`}],solution:`WITH user_spend AS (
  SELECT u.user_id, u.email, u.country, ROUND(SUM(o.subtotal), 2) AS total_spent
  FROM users u
  JOIN orders o ON u.user_id = o.user_id
  GROUP BY u.user_id, u.email, u.country
),
ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY country ORDER BY total_spent DESC, user_id ASC) AS rn
  FROM user_spend
)
SELECT country, user_id, email, total_spent
FROM ranked
WHERE rn = 1
ORDER BY country`,debrief:`What the stakeholder wants: One customer per country — the highest total spender — so the regional team can craft a personalized outreach for each market's best customer.

Ambiguities resolved: 'Highest spender' means highest total subtotal across all orders (all statuses included — the team wants the broadest picture). 'One per country' raises the tie-breaking question: if two users spend the same amount, which is returned? Here we use lowest user_id as a deterministic tiebreaker — this should be made explicit. Return country, user_id, email, and total spent.

SQL approach: First CTE aggregates total subtotal per user-country combination. Second CTE applies ROW_NUMBER() OVER (PARTITION BY country ORDER BY total_spent DESC, user_id ASC) to rank within each country. Outer query filters to rn = 1.

What weak SQL looks like: GROUP BY country with MAX(total_spent) — this gives the maximum spend per country but not the user who achieved it. Adding user_id to the GROUP BY gives per-user totals but loses the per-country top-1 filtering. A self-join on max spend per country works but breaks on ties.

Interviewer follow-up: 'How would you extend this to return the top 3 spenders per country instead of 1?'`,sqliteNote:null},{id:`sql-h10`,title:`Top Spending Category per Account`,company:`Visa`,companyDomain:`visa.com`,difficulty:`Hard`,tags:[`CTE`,`ROW_NUMBER`,`PARTITION BY account`,`GROUP BY`],roles:[`PA`,`DA`,`BA`],priority:1,estimatedMin:14,datamartId:`fintech`,prompt:`The personalization team wants to tailor card benefits to how each account actually spends. What's the single biggest spending category for each account?`,expectedColumns:[`account_id`,`category`,`top_category_spend`],expectedRowCount:15,hints:[`What does one row in your result represent? Your output needs 15 rows with columns: account_id, category, top_category_spend.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, GROUP BY the grouping key to collapse rows, apply a window function OVER the right partition.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 15 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{account_id:`1`,category:`travel`}],solution:`WITH cat_spend AS (
  SELECT account_id, category, ROUND(SUM(amount), 2) AS total
  FROM transactions
  GROUP BY account_id, category
),
ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY total DESC) AS rn
  FROM cat_spend
)
SELECT account_id, category, total AS top_category_spend
FROM ranked
WHERE rn = 1
ORDER BY account_id`,debrief:`What the stakeholder wants: One row per account showing the category where that account spends the most — used to surface relevant card perks (travel cashback for travel-heavy accounts, dining rewards for restaurant spenders).

Ambiguities resolved: 'Biggest spending category' means highest total transaction amount, not most frequent. If an account has 5 small dining transactions and 1 large travel transaction, travel wins by revenue — clarify this with the stakeholder. If tied, pick the category alphabetically first for determinism. All 15 accounts must appear (including those with no transactions).

SQL approach: First CTE aggregates SUM(amount) per account-category pair. Second CTE applies ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY total DESC) to rank categories per account. Outer query filters to rn = 1.

What weak SQL looks like: A correlated subquery to find MAX(SUM(amount)) per account — hard to write correctly and breaks when two categories tie. Or GROUP BY account_id only, which collapses all categories into one row and loses category-level detail entirely.

Interviewer follow-up: 'How would you update the personalization logic if a user's top category changes month over month?'`,sqliteNote:null},{id:`sql-h11`,title:`No-Show Patients Without Follow-Up`,company:`Teladoc`,companyDomain:`teladoc.com`,difficulty:`Hard`,tags:[`EXISTS`,`NOT EXISTS`,`correlated subquery`,`date comparison`],roles:[`PA`,`DA`,`BA`],priority:1,estimatedMin:16,datamartId:`health`,prompt:`The care coordination team is worried about patients slipping out of care. Can you identify patients who no-showed for an appointment and haven't had a completed visit since?`,expectedColumns:[`patient_id`,`last_no_show_date`],expectedRowCount:3,hints:[`What does one row in your result represent? Your output needs 3 rows with columns: patient_id, last_no_show_date.`,`To find rows with no match, use NOT IN (subquery) or LEFT JOIN ... WHERE right_id IS NULL. NOT EXISTS is also valid.`,`Break the problem down: GROUP BY the grouping key to collapse rows, use NOT IN or LEFT JOIN ... IS NULL to find the missing rows.`,`Watch for NULLs — a LEFT JOIN will produce NULLs where there is no match.`,`Before finalising, confirm: does your query return exactly 3 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{patient_id:`6`}],solution:`SELECT DISTINCT a1.patient_id, MAX(a1.scheduled_at) AS last_no_show_date
FROM appointments a1
WHERE a1.no_show = 1
  AND NOT EXISTS (
    SELECT 1 FROM appointments a2
    WHERE a2.patient_id = a1.patient_id
      AND a2.no_show = 0
      AND a2.completed_at IS NOT NULL
      AND a2.scheduled_at > a1.scheduled_at
  )
GROUP BY a1.patient_id
ORDER BY a1.patient_id`,debrief:`What the stakeholder wants: A list of patients who missed at least one appointment and have no completed follow-up visit after it — the highest-risk group for care discontinuation.

Ambiguities resolved: 'No-show' means no_show = 1. 'Completed visit since' means a subsequent appointment (later scheduled_at) where no_show = 0 AND completed_at IS NOT NULL. If any later completed appointment exists, the patient is NOT flagged — even if they no-showed again after that. Return the most recent no-show date per patient.

SQL approach: The outer query filters to no-show appointments. NOT EXISTS checks per no-show row whether a later completed appointment exists for that patient — the correlated subquery compares a2.patient_id = a1.patient_id AND a2.scheduled_at > a1.scheduled_at AND no_show = 0 AND completed_at IS NOT NULL. GROUP BY patient_id with MAX(scheduled_at) collapses multiple no-shows to the most recent.

What weak SQL looks like: LEFT JOIN from no-show patients to completed appointments, then WHERE completed appointment IS NULL — logically equivalent but harder to express the 'after' condition correctly. Or simply finding patients with any no-show without the 'no subsequent completion' filter — this flags patients who recovered, which is the opposite of what the team needs.

Interviewer follow-up: 'How would you modify this to also flag patients whose most recent no-show was within the last 30 days?'`,sqliteNote:null},{id:`sql-h13`,title:`Category Revenue Share`,company:`Amazon`,companyDomain:`amazon.com`,difficulty:`Hard`,tags:[`SUM OVER`,`window function`,`JOIN`,`GROUP BY`,`ROUND`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:15,datamartId:`ecomm`,prompt:`The merchandising leadership team wants category revenue contribution as a percentage of total GMV. Using order_items and products, compute total revenue (unit_price × quantity) per product category and each category's percentage of the overall total, rounded to 1 decimal. Order by revenue descending.`,expectedColumns:[`category`,`total_revenue`,`pct_of_total`],expectedRowCount:4,hints:[`What does one row in your result represent? Your output needs 4 rows with columns: category, total_revenue, pct_of_total.`,`Window functions compute a value per row without collapsing rows like GROUP BY. Decide your PARTITION BY (reset scope) and ORDER BY (ranking order).`,`Break the problem down: identify the join key between tables, GROUP BY the grouping key to collapse rows, apply a window function OVER the right partition.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 4 rows? Run it and check the row count first, then verify specific values.`],checkValues:[],solution:`SELECT p.category,
       ROUND(SUM(oi.unit_price * oi.quantity), 2) AS total_revenue,
       ROUND(100.0 * SUM(oi.unit_price * oi.quantity) / SUM(SUM(oi.unit_price * oi.quantity)) OVER (), 1) AS pct_of_total
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
GROUP BY p.category
ORDER BY total_revenue DESC`,debrief:`Electronics leads with ~58.9% of revenue ($1,719.87), apparel at ~29.8% ($869.91), books at ~7.2% ($209.95), and home at ~4.1% ($119.97). The nested SUM inside SUM() OVER () is the key idiom: the inner SUM aggregates per group, the outer window SUM totals across all groups for the denominator. This is cleaner than a self-join or scalar subquery.`,sqliteNote:null},{id:`sql-h17`,title:`Average Reorder Interval per Customer`,company:`Shopify`,companyDomain:`shopify.com`,difficulty:`Hard`,tags:[`CTE`,`LAG`,`julianday`,`AVG`,`window function`],roles:[`PA`,`DA`],priority:1,estimatedMin:16,datamartId:`ecomm`,prompt:`The retention team wants to understand how often our repeat customers come back. For each customer who has placed more than one order, what's the average time between purchases?`,expectedColumns:[`user_id`,`avg_days_between`],expectedRowCount:11,hints:[`What does one row in your result represent? Your output needs 11 rows with columns: user_id, avg_days_between.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, GROUP BY the grouping key to collapse rows, apply a window function OVER the right partition.`,`Watch for NULLs — a LEFT JOIN will produce NULLs where there is no match.`,`Before finalising, confirm: does your query return exactly 11 rows? Run it and check the row count first, then verify specific values.`],checkValues:[],solution:`WITH gaps AS (
  SELECT user_id, order_id, created_at,
         julianday(created_at) - julianday(LAG(created_at) OVER (PARTITION BY user_id ORDER BY created_at)) AS days_between
  FROM orders
)
SELECT user_id, ROUND(AVG(days_between), 0) AS avg_days_between
FROM gaps
WHERE days_between IS NOT NULL
GROUP BY user_id
ORDER BY avg_days_between ASC`,debrief:`What the stakeholder wants: A per-customer average reorder gap in days, so the retention team can identify customers drifting toward longer intervals and trigger re-engagement before churn.

Ambiguities resolved: 'Repeat customer' means at least 2 orders — users with exactly 1 order have no gap to average. Should cancelled or returned orders count? The solution includes all statuses — a WHERE status = 'completed' filter would give a cleaner purchase cadence signal. Average is across all consecutive pairs, rounded to nearest day.

SQL approach: CTE computes per-order gaps using LAG(created_at) OVER (PARTITION BY user_id ORDER BY created_at). julianday difference gives decimal days; CAST to integer not needed for the avg. WHERE days_between IS NOT NULL excludes NULL first-order rows from the average. Outer query groups by user_id with AVG.

What weak SQL looks like: (MAX(created_at) - MIN(created_at)) / COUNT(*) per user — this gives the total span divided by order count, not the average of consecutive gaps. These are equivalent only when all orders are equally spaced, which is never true in practice.

Interviewer follow-up: 'How would you flag customers whose most recent order gap is more than twice their historical average?'`,sqliteNote:`Uses julianday() for date arithmetic. In PostgreSQL use: (created_at::date - LAG(created_at::date) OVER (...)) AS days_between.`},{id:`sql-h24`,title:`First-Month Revenue by Signup Cohort`,company:`Shopify`,companyDomain:`shopify.com`,difficulty:`Hard`,tags:[`CTE`,`date arithmetic`,`julianday`,`LEFT JOIN`,`cohort`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:18,datamartId:`ecomm`,prompt:`The growth team runs a cohort analysis measuring revenue captured in the first 30 days after signup. For all users who signed up in Q1 2023 (January through March), calculate their total order subtotal from orders placed within 30 days of their signup date. Include users with zero first-month orders. Return user id, signup date, and first-month revenue rounded to 2 decimals.`,expectedColumns:[`user_id`,`signup_date`,`first_month_revenue`],expectedRowCount:5,hints:[`What does one row in your result represent? Your output needs 5 rows with columns: user_id, signup_date, first_month_revenue.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 5 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{user_id:`5`,first_month_revenue:`249.99`}],solution:`WITH q1_users AS (
  SELECT user_id, signup_date
  FROM users
  WHERE signup_date >= '2023-01-01' AND signup_date < '2023-04-01'
),
first_orders AS (
  SELECT q.user_id, q.signup_date,
         ROUND(COALESCE(SUM(o.subtotal), 0), 2) AS first_month_revenue
  FROM q1_users q
  LEFT JOIN orders o ON o.user_id = q.user_id
    AND julianday(o.created_at) <= julianday(q.signup_date) + 30
  GROUP BY q.user_id, q.signup_date
)
SELECT user_id, signup_date, first_month_revenue
FROM first_orders
ORDER BY user_id`,debrief:`Five users signed up in Q1 2023: users 1–5. User 5 captured $249.99 (order 9, placed 20 days post-signup). Users 1 and 3 also captured revenue within 30 days. Users 2 and 4 have $0 first-month revenue — their first orders came months later. LEFT JOIN with the date condition on the ON clause (not WHERE) is critical: moving it to WHERE would exclude zero-revenue users.`,sqliteNote:`Uses julianday() for date arithmetic. In PostgreSQL use: o.created_at::date <= q.signup_date::date + INTERVAL '30 days'.`},{id:`sql-master07`,title:`Hypertension Care Gap Analysis`,company:`Epic Systems`,companyDomain:`epic.com`,difficulty:`Hard`,isFree:!1,tags:[`CTE`,`NOT IN`,`anti-join`,`subquery`,`clinical quality`,`care gap`],roles:[`PA`,`DA`,`BA`],priority:1,estimatedMin:30,datamartId:`health`,prompt:`The clinical quality team wants to find patients with a confirmed hypertension diagnosis (ICD-10 I10) who have no antihypertensive prescription on record (Lisinopril, Amlodipine, or Furosemide). These patients represent a potential care gap. Return patient_id, dob, gender, and zip_code, ordered by patient_id.`,expectedColumns:[`patient_id`,`dob`,`gender`,`zip_code`],expectedRowCount:2,hints:[`What does one row in your result represent? Your output needs 2 rows with columns: patient_id, dob, gender, zip_code.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, identify the join key between tables.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 2 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{patient_id:`6`}],solution:`WITH hypertension_patients AS (
  SELECT DISTINCT a.patient_id
  FROM appointments a
  JOIN diagnoses d ON a.appt_id = d.appt_id
  WHERE d.icd_code = 'I10'
),
antihypertensive_patients AS (
  SELECT DISTINCT patient_id
  FROM prescriptions
  WHERE drug_name IN ('Lisinopril', 'Amlodipine', 'Furosemide')
)
SELECT p.patient_id, p.dob, p.gender, p.zip_code
FROM hypertension_patients hp
JOIN patients p ON hp.patient_id = p.patient_id
WHERE hp.patient_id NOT IN (SELECT patient_id FROM antihypertensive_patients)
ORDER BY hp.patient_id`,debrief:`Patients 6 and 8 have an essential hypertension diagnosis (I10) but no antihypertensive medication on file. Patient 6 has Atorvastatin (a cholesterol-lowering statin — not an antihypertensive). Patient 8 has only Amoxicillin (an antibiotic). Patients 1 and 4 have Lisinopril and are correctly excluded. The two-CTE structure separates the two clinical signals cleanly before the anti-join. The NOT IN subquery works safely here because the antihypertensive_patients CTE is drawn from a known-non-null patient_id column. In production, NOT EXISTS or a LEFT JOIN anti-join scales better if the subquery is large.`,sqliteNote:null},{id:`sql-master13`,title:`Returning vs New Customer Revenue Split`,company:`Shopify`,companyDomain:`shopify.com`,difficulty:`Hard`,isFree:!1,tags:[`CTE`,`ROW_NUMBER`,`window function`,`CASE WHEN`,`cohort`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:30,datamartId:`ecomm`,prompt:`The finance team wants to split completed order revenue into new customer revenue (user's first ever completed order) vs returning customer revenue. Classify each completed order as "new" or "returning", then aggregate total revenue and order count by customer_type. Return customer_type, order_count, and total_revenue rounded to 2 decimals.`,expectedColumns:[`customer_type`,`order_count`,`total_revenue`],expectedRowCount:2,hints:[`What does one row in your result represent? Your output needs 2 rows with columns: customer_type, order_count, total_revenue.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, apply a window function OVER the right partition.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 2 rows? Run it and check the row count first, then verify specific values.`],checkValues:[],solution:`WITH ranked_orders AS (
  SELECT order_id, user_id, subtotal,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) AS order_rank
  FROM orders
  WHERE status = 'completed'
)
SELECT
  CASE WHEN order_rank = 1 THEN 'new' ELSE 'returning' END AS customer_type,
  COUNT(*) AS order_count,
  ROUND(SUM(subtotal), 2) AS total_revenue
FROM ranked_orders
GROUP BY customer_type
ORDER BY customer_type DESC`,debrief:`Each user's first completed order is classified as "new customer revenue"; all subsequent orders are "returning customer revenue." ROW_NUMBER() within the WHERE status='completed' CTE correctly ranks only completed orders — a returned or cancelled order does not consume the "first" slot. The split between new and returning revenue tells a critical business story: a high returning-customer share signals strong retention and healthy LTV. New customer revenue that always exceeds returning revenue suggests the business is running a leaky bucket — acquiring but not retaining. The exact split for this dataset: 12 users placed their first completed order (new), and several placed multiple (returning).`,sqliteNote:null},{id:`sql-master21`,title:`Referral Performance by Referrer`,company:`Cash App`,companyDomain:`cash.app`,difficulty:`Hard`,isFree:!1,tags:[`self-join`,`GROUP BY`,`SUM`,`referral analytics`],roles:[`PA`,`DA`,`PM`],priority:2,estimatedMin:20,datamartId:`consumer`,prompt:`The growth team wants to rank users by their referral program impact. Which users have brought in the most people, and how many of those referrals converted to premium?`,expectedColumns:[`user_id`,`username`,`is_premium`,`referrals_made`,`premium_referrals`],expectedRowCount:6,hints:[`What does one row in your result represent? Your output needs 6 rows with columns: user_id, username, is_premium, referrals_made, premium_referrals.`,`Identify the join key — the column that links the two tables. Write the JOIN ON condition before adding WHERE or GROUP BY.`,`Break the problem down: identify the join key between tables, GROUP BY the grouping key to collapse rows.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 6 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{user_id:`1`,username:`alice`,referrals_made:`2`,premium_referrals:`0`}],solution:`SELECT u.user_id, u.username, u.is_premium,
       COUNT(refs.user_id) AS referrals_made,
       SUM(refs.is_premium) AS premium_referrals
FROM users u
JOIN users refs ON refs.referrer_id = u.user_id
GROUP BY u.user_id, u.username, u.is_premium
ORDER BY referrals_made DESC, u.user_id`,debrief:`What the stakeholder wants: A leaderboard of users who have made referrals, showing how many people they brought in and how many of those became premium — the two metrics the growth team uses to identify high-value referrers worth rewarding.

Ambiguities resolved: Only users who referred at least one person should appear — zero-referral users are excluded. 'Premium referrals' means the count of referred users who have is_premium = 1 at query time (not necessarily at the time of referral). Whether referrers must be premium themselves is not required — include all referrers regardless of their own premium status.

SQL approach: Self-join on users: alias u as the referrer, refs as the referred (WHERE refs.referrer_id = u.user_id). INNER JOIN naturally excludes non-referrers. GROUP BY referrer fields. COUNT(refs.user_id) = referrals_made; SUM(refs.is_premium) = premium_referrals (binary 0/1 flag summed). ORDER BY referrals_made DESC, user_id ASC for determinism.

What weak SQL looks like: Separate subqueries for referrals_made and premium_referrals — this scans the users table twice. The self-join computes both in a single pass. Or LEFT JOIN — this would include all 15 users with 0 referrals, requiring a HAVING COUNT > 0 filter to match the intended output.

Interviewer follow-up: 'How would you compute each referrer's premium conversion rate, and which referrers would you prioritize for a bonus based on quality rather than volume?'`,sqliteNote:null},{id:`sql-h31`,title:`CSM Portfolio MRR`,company:`Salesforce`,companyDomain:`salesforce.com`,difficulty:`Hard`,tags:[`LEFT JOIN`,`GROUP BY`,`CASE WHEN`,`SUM`,`COALESCE`,`csm workload`],roles:[`PA`,`DA`,`BA`],priority:2,estimatedMin:15,datamartId:`saas`,prompt:`Customer success leadership wants to balance CSM workloads. For each csm_id, compute account_count and active_mrr (total MRR from active subscriptions only). Use a LEFT JOIN to subscriptions so every CSM appears even if their accounts have no active subscriptions. Order by active_mrr descending.`,expectedColumns:[`csm_id`,`account_count`,`active_mrr`],expectedRowCount:3,hints:[`What does one row in your result represent? Your output needs 3 rows with columns: csm_id, account_count, active_mrr.`,`CASE WHEN ... THEN ... ELSE ... END works like if-else inside SQL. You can use it inside aggregate functions for conditional counts.`,`Break the problem down: write the core SELECT/FROM/WHERE first, then add aggregation.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 3 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{csm_id:`2`,account_count:`5`}],solution:`SELECT a.csm_id,
       COUNT(DISTINCT a.account_id) AS account_count,
       COALESCE(SUM(CASE WHEN s.status = 'active' THEN s.mrr ELSE 0 END), 0) AS active_mrr
FROM accounts a
LEFT JOIN subscriptions s ON a.account_id = s.account_id
GROUP BY a.csm_id
ORDER BY active_mrr DESC`,debrief:`CSM 2 manages 5 accounts with $6,596 in active MRR. CSM 1 manages 6 accounts but only $3,597 active MRR — two of their accounts (Lima Education, India Foods) are on the free Starter plan ($0 MRR). CSM 3 covers 4 accounts at $1,597. The CASE WHEN inside SUM filters to active subs without a WHERE clause that would drop churned-account rows from the GROUP BY. COUNT(DISTINCT account_id) prevents inflated counts from accounts with multiple subscription rows. The implication: CSM 1 has the largest headcount but the second-smallest MRR — an argument for rebalancing portfolios by MRR rather than account count.`,sqliteNote:null},{id:`sql-h32`,title:`Disputed Transaction Merchant Exposure`,company:`Stripe`,companyDomain:`stripe.com`,difficulty:`Hard`,tags:[`CTE`,`JOIN`,`WHERE filter`,`fraud`,`GROUP BY`],roles:[`PA`,`DA`,`BA`],priority:1,estimatedMin:16,datamartId:`fintech`,prompt:`The fraud team wants to know which merchants are generating the most disputed transactions. Can you show disputed volume and count per merchant so they know where to focus the investigation?`,expectedColumns:[`merchant_name`,`country`,`is_flagged`,`disputed_count`,`total_disputed`],expectedRowCount:4,hints:[`What does one row in your result represent? Your output needs 4 rows with columns: merchant_name, country, is_flagged, disputed_count, total_disputed.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 4 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{merchant_name:`QuickTransfer`,disputed_count:`2`}],solution:`WITH disputed_txns AS (
  SELECT txn_id, merchant_id, amount
  FROM transactions
  WHERE status = 'disputed'
)
SELECT m.name AS merchant_name, m.country, m.is_flagged,
       COUNT(d.txn_id) AS disputed_count,
       ROUND(SUM(d.amount), 2) AS total_disputed
FROM disputed_txns d
JOIN merchants m ON d.merchant_id = m.merchant_id
GROUP BY m.merchant_id, m.name, m.country, m.is_flagged
ORDER BY total_disputed DESC`,debrief:`What the stakeholder wants: A merchant-level dispute summary showing who is responsible for disputed transaction volume — used to prioritize fraud investigations and merchant risk reviews.

Ambiguities resolved: 'Disputed transactions' means transactions with status = 'disputed' — not all transactions that have an entry in the disputes table (the two overlap but are not identical). Should unflagged merchants be included? Yes — even legitimate merchants can generate chargebacks (customer disputes), so include all merchants generating disputed transactions.

SQL approach: A CTE filters transactions to status = 'disputed'. The main query joins to merchants on merchant_id, groups by merchant fields, and computes COUNT(txn_id) and SUM(amount). ORDER BY total_disputed DESC surfaces highest exposure first. The is_flagged column immediately separates fraud-risk disputes from chargeback-risk disputes.

What weak SQL looks like: Joining all transactions to merchants without the status filter — this produces all-transaction volume, which is not the same as disputed exposure. Or joining from the disputes table directly — this misses the merchant_id which lives on transactions, not disputes.

Interviewer follow-up: 'Of these disputed transactions, what fraction did the merchant win vs. lose, and how does that vary by is_flagged status?'`,sqliteNote:null},{id:`sql-h33`,title:`Creator Interaction Leaderboard`,company:`TikTok`,companyDomain:`tiktok.com`,difficulty:`Hard`,tags:[`CTE`,`RANK`,`window function`,`JOIN`,`creator analytics`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:15,datamartId:`consumer`,prompt:`The creator monetization team wants a leaderboard of our most-engaged creators — ranked by how many interactions their content is generating. Who's at the top and how does the rest stack up?`,expectedColumns:[`creator_id`,`username`,`pieces_published`,`total_interactions`,`rnk`],expectedRowCount:6,hints:[`What does one row in your result represent? Your output needs 6 rows with columns: creator_id, username, pieces_published, total_interactions, rnk.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, identify the join key between tables, GROUP BY the grouping key to collapse rows, apply a window function OVER the right partition.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 6 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{creator_id:`1`,username:`alice`,total_interactions:`12`,rnk:`1`}],solution:`WITH creator_stats AS (
  SELECT c.creator_id, u.username,
         COUNT(DISTINCT c.content_id) AS pieces_published,
         COUNT(i.interaction_id) AS total_interactions
  FROM content c
  JOIN interactions i ON c.content_id = i.content_id
  JOIN users u ON c.creator_id = u.user_id
  GROUP BY c.creator_id, u.username
)
SELECT creator_id, username, pieces_published, total_interactions,
       RANK() OVER (ORDER BY total_interactions DESC) AS rnk
FROM creator_stats
ORDER BY rnk, creator_id`,debrief:`What the stakeholder wants: A ranked list of creators ordered by total interactions on their content, with ties sharing the same rank — the monetization team uses this for creator tier assignment and bonus eligibility.

Ambiguities resolved: 'Interactions' means total interaction_id count across all their published content (not per piece). Should creators with zero interactions appear? The solution uses INNER JOIN — creators who have never received an interaction are excluded. If the team wants a complete roster, a LEFT JOIN is needed and those creators would rank last with 0 interactions.

SQL approach: CTE joins content to interactions to users to aggregate pieces_published and total_interactions per creator. The INNER JOIN naturally drops creators with no interactions. Outer SELECT applies RANK() OVER (ORDER BY total_interactions DESC) — RANK skips numbers on ties, which is intentional here (tied creators share the same rank, and the next rank reflects the gap).

What weak SQL looks like: ORDER BY total_interactions DESC LIMIT N without a rank function — doesn't handle ties and gives no rank column. Or applying RANK inside the GROUP BY CTE — SQL doesn't allow window functions inside GROUP BY; a two-step approach (CTE then window) is required.

Interviewer follow-up: 'How would you compute each creator's engagement rate — interactions per piece published — and use that to re-rank rather than raw interaction count?'`,sqliteNote:null},{id:`sql-h34`,title:`Days Between Patient Appointments`,company:`Doximity`,companyDomain:`doximity.com`,difficulty:`Hard`,tags:[`LAG`,`window function`,`julianday`,`PARTITION BY`,`date arithmetic`],roles:[`PA`,`DA`,`BA`],priority:2,estimatedMin:16,datamartId:`health`,prompt:`The care team wants to measure visit gaps for each patient. For each appointment, show patient_id, appt_id, scheduled_at, the previous appointment date for that patient (prev_appt, or NULL for first visit), and days_since_prev as an integer. Order by patient_id, then scheduled_at.`,expectedColumns:[`patient_id`,`appt_id`,`scheduled_at`,`prev_appt`,`days_since_prev`],expectedRowCount:25,hints:[`What does one row in your result represent? Your output needs 25 rows with columns: patient_id, appt_id, scheduled_at, prev_appt, days_since_prev.`,`Window functions compute a value per row without collapsing rows like GROUP BY. Decide your PARTITION BY (reset scope) and ORDER BY (ranking order).`,`Break the problem down: apply a window function OVER the right partition.`,`Integer division truncates in SQLite — CAST to REAL if you need decimals.`,`Before finalising, confirm: does your query return exactly 25 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{patient_id:`1`,appt_id:`11`,days_since_prev:`2`}],solution:`SELECT patient_id, appt_id, scheduled_at,
       LAG(scheduled_at) OVER (PARTITION BY patient_id ORDER BY scheduled_at) AS prev_appt,
       CAST(julianday(scheduled_at) - julianday(LAG(scheduled_at) OVER (PARTITION BY patient_id ORDER BY scheduled_at)) AS INTEGER) AS days_since_prev
FROM appointments
ORDER BY patient_id, scheduled_at`,debrief:`Patient 1 had two appointments: Apr 3 and Apr 5 — just 2 days apart (a rapid follow-up). Most patients had only one appointment, so their days_since_prev is NULL. The LAG function partitioned by patient_id looks back within each patient's ordered history. CAST(...AS INTEGER) drops the decimal from julianday arithmetic. The weak answer uses a correlated subquery — logically correct but O(n²); the window function is a single pass. Very short gaps flag urgent follow-ups or prescription adjustments; very long gaps flag patients who may have disengaged from care.`,sqliteNote:`Uses julianday() for date arithmetic. In PostgreSQL: scheduled_at::date - LAG(scheduled_at::date) OVER (PARTITION BY patient_id ORDER BY scheduled_at) AS days_since_prev.`},{id:`sql-h41`,title:`Monthly Account Growth Trend`,company:`Salesforce`,companyDomain:`salesforce.com`,difficulty:`Hard`,tags:[`strftime`,`GROUP BY`,`SUM OVER`,`cumulative total`,`window function`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:14,datamartId:`saas`,prompt:`The growth team wants to visualize how the account base has built up over time. For each month where new accounts were acquired, how many joined that month and what was the running total account count?`,expectedColumns:[`month`,`new_accounts`,`cumulative_accounts`],expectedRowCount:8,hints:[`What does one row in your result represent? Your output needs 8 rows with columns: month, new_accounts, cumulative_accounts.`,`SQLite date functions: DATE(col, '+N days'), STRFTIME('%Y-%m', col). Check which format the date column stores before extracting parts.`,`Break the problem down: write the core SELECT/FROM/WHERE first, then add aggregation.`,`Date format matters — use STRFTIME or DATE() carefully for the exact format in the column.`,`Before finalising, confirm: does your query return exactly 8 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{month:`2023-01`,new_accounts:`1`,cumulative_accounts:`1`}],solution:`SELECT strftime('%Y-%m', created_at) AS month,
       COUNT(*) AS new_accounts,
       SUM(COUNT(*)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS cumulative_accounts
FROM accounts
GROUP BY month
ORDER BY month`,debrief:`What the stakeholder wants: A month-by-month breakdown of new account additions alongside the cumulative total — used to plot an S-curve of account growth and spot acceleration or slowdown.

Ambiguities resolved: 'Months where new accounts were acquired' means only months appearing in the accounts table — months with zero additions are naturally excluded. If the team wants a complete calendar spine (including zero-new-account months), a date series generator would be needed. Cumulative total means running sum from the first month to the current one.

SQL approach: GROUP BY strftime('%Y-%m', created_at) gives new_accounts per month. SUM(COUNT(*)) OVER (ORDER BY month) computes the running cumulative. The nested aggregate — inner COUNT(*) from GROUP BY, outer SUM from window — is valid SQL: GROUP BY runs first, then the window function operates on those grouped results.

What weak SQL looks like: A correlated subquery for the running total — SELECT (SELECT COUNT(*) FROM accounts WHERE created_at <= end_of_month) — logically correct but O(n squared) and doesn't compose cleanly with the per-month count. Or omitting ORDER BY inside OVER — without it, SUM returns the grand total on every row instead of a running sum.

Interviewer follow-up: 'How would you modify this to show month-over-month growth rate as a percentage rather than an absolute count?'`,sqliteNote:`Uses strftime() for date truncation. In PostgreSQL: DATE_TRUNC('month', created_at)::date AS month.`},{id:`sql-h42`,title:`30-Day Transaction Velocity`,company:`Stripe`,companyDomain:`stripe.com`,difficulty:`Hard`,tags:[`self-join`,`julianday`,`rolling window`,`fraud detection`],roles:[`PA`,`DA`,`BA`],priority:1,estimatedMin:18,datamartId:`fintech`,prompt:`The fraud team wants to flag accounts with unusually high transaction frequency. For each transaction, how many other transactions did that account make in the 30 days immediately before it?`,expectedColumns:[`txn_id`,`account_id`,`occurred_at`,`amount`,`txns_prior_30d`],expectedRowCount:40,hints:[`What does one row in your result represent? Your output needs 40 rows with columns: txn_id, account_id, occurred_at, amount, txns_prior_30d.`,`LEFT JOIN keeps all rows from the left table even when there is no match. Use this when you need to detect missing or zero-count records.`,`Break the problem down: identify the join key between tables, GROUP BY the grouping key to collapse rows.`,`Watch for NULLs — a LEFT JOIN will produce NULLs where there is no match.`,`Before finalising, confirm: does your query return exactly 40 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{txn_id:`3`,txns_prior_30d:`2`}],solution:`SELECT t1.txn_id, t1.account_id, t1.occurred_at, t1.amount,
       COUNT(t2.txn_id) AS txns_prior_30d
FROM transactions t1
LEFT JOIN transactions t2
  ON t1.account_id = t2.account_id
  AND t2.occurred_at < t1.occurred_at
  AND julianday(t1.occurred_at) - julianday(t2.occurred_at) <= 30
GROUP BY t1.txn_id, t1.account_id, t1.occurred_at, t1.amount
ORDER BY txns_prior_30d DESC, t1.account_id, t1.occurred_at`,debrief:`What the stakeholder wants: A per-transaction count of recent prior activity on the same account — a velocity signal the fraud team uses to surface accounts transacting at suspicious rates before triggering a review.

Ambiguities resolved: 'Prior 30 days' means strictly before the current transaction's occurred_at and within 30 calendar days of it (not including the current transaction). First transactions per account return 0 (not NULL) — the LEFT JOIN handles this. Whether to count across all statuses or only non-disputed is a business parameter; the solution includes all statuses.

SQL approach: Self-join transactions t1 to t2 on the same account_id with two conditions: t2.occurred_at < t1.occurred_at (strictly prior) AND julianday(t1.occurred_at) - julianday(t2.occurred_at) <= 30 (within 30 days). COUNT(t2.txn_id) with LEFT JOIN returns 0 for first transactions. GROUP BY all of t1's fields to collapse matches.

What weak SQL looks like: A window function with SUM OVER and a ROWS frame — intuitive but SQLite doesn't support INTERVAL-based RANGE frames, so the 30-day window can't be expressed as a RANGE directly. In PostgreSQL, COUNT(*) OVER (PARTITION BY account_id ORDER BY occurred_at RANGE BETWEEN INTERVAL '30 days' PRECEDING AND INTERVAL '1 day' PRECEDING) is more efficient.

Interviewer follow-up: 'What threshold of txns_prior_30d would you flag as suspicious, and how would you decide — data-driven or policy-driven?'`,sqliteNote:`Uses julianday() for the join condition date arithmetic. In PostgreSQL use: COUNT(*) OVER (PARTITION BY account_id ORDER BY occurred_at RANGE BETWEEN INTERVAL '30 days' PRECEDING AND INTERVAL '1 day' PRECEDING).`},{id:`sql-h48`,title:`Merchant Risk and Dispute Exposure`,company:`Stripe`,companyDomain:`stripe.com`,difficulty:`Hard`,tags:[`CTE`,`LEFT JOIN`,`COALESCE`,`GROUP BY`,`fraud`,`dispute rate`],roles:[`PA`,`DA`,`BA`],priority:1,estimatedMin:18,datamartId:`fintech`,prompt:`The risk team wants a full merchant scorecard combining transaction volume with dispute exposure. For each merchant, return merchant_name, is_flagged, txn_count, total_volume, dispute_count, disputed_volume, and dispute_rate (disputes as % of transactions, rounded to 1 decimal). Order by dispute_rate descending, then total_volume descending.`,expectedColumns:[`merchant_name`,`is_flagged`,`txn_count`,`total_volume`,`dispute_count`,`disputed_volume`,`dispute_rate`],expectedRowCount:10,hints:[`What does one row in your result represent? Your output needs 10 rows with columns: merchant_name, is_flagged, txn_count, total_volume, dispute_count, disputed_volume, dispute_rate.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, identify the join key between tables, GROUP BY the grouping key to collapse rows.`,`Watch for NULLs — a LEFT JOIN will produce NULLs where there is no match.`,`Before finalising, confirm: does your query return exactly 10 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{merchant_name:`QuickTransfer`,dispute_count:`2`,txn_count:`2`}],solution:`WITH merchant_txns AS (
  SELECT m.merchant_id, m.name, m.is_flagged,
         COUNT(t.txn_id) AS txn_count,
         ROUND(SUM(t.amount), 2) AS total_volume
  FROM merchants m
  JOIN transactions t ON m.merchant_id = t.merchant_id
  GROUP BY m.merchant_id, m.name, m.is_flagged
),
merchant_disputes AS (
  SELECT t.merchant_id,
         COUNT(d.dispute_id) AS dispute_count,
         ROUND(SUM(d.amount), 2) AS disputed_volume
  FROM transactions t
  JOIN disputes d ON t.txn_id = d.txn_id
  GROUP BY t.merchant_id
)
SELECT mt.name AS merchant_name, mt.is_flagged,
       mt.txn_count, mt.total_volume,
       COALESCE(md.dispute_count, 0) AS dispute_count,
       COALESCE(md.disputed_volume, 0) AS disputed_volume,
       ROUND(100.0 * COALESCE(md.dispute_count, 0) / mt.txn_count, 1) AS dispute_rate
FROM merchant_txns mt
LEFT JOIN merchant_disputes md ON mt.merchant_id = md.merchant_id
ORDER BY dispute_rate DESC, total_volume DESC`,debrief:`QuickTransfer has a 100% dispute rate — both of its transactions were disputed. Delta Airlines and Shell Gas each show a 100% rate on a single disputed transaction. Amazon (9 transactions) has a 22.2% dispute rate — the disputed transactions are fraudulent card uses at a legitimate merchant. COALESCE(md.dispute_count, 0) handles merchants with zero disputes without filtering them out. The two-CTE pattern separates volume aggregation from dispute aggregation before joining — combining them in one GROUP BY would require subqueries or multiple joins.`,sqliteNote:null},{id:`sql-h51`,title:`Daily Shipment Calendar — February 2024`,company:`FedEx`,companyDomain:`fedex.com`,difficulty:`Hard`,isFree:!1,tags:[`recursive CTE`,`date spine`,`LEFT JOIN`,`gap-filling`,`WITH RECURSIVE`],roles:[`PA`,`DA`],priority:1,estimatedMin:20,datamartId:`logistics`,prompt:`The ops team wants to audit February 2024 for scheduling gaps. Generate a full calendar for February 2024 (Feb 1 through Feb 29) and for each date, return the count of shipments scheduled on that day — including days with zero shipments. Return shipment_date and shipments_count, ordered by shipment_date.`,expectedColumns:[`shipment_date`,`shipments_count`],expectedRowCount:29,hints:[`What does one row in your result represent? Your output needs 29 rows with columns: shipment_date, shipments_count.`,`Recursive CTEs have two parts: a base case (the seed row) and a recursive step that references the CTE itself. Write the base SELECT first.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step.`,`Recursive CTEs need a termination condition in the WHERE clause to avoid infinite loops.`,`Before finalising, confirm: does your query return exactly 29 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{shipment_date:`2024-02-10`,shipments_count:`0`},{shipment_date:`2024-02-07`,shipments_count:`1`}],solution:`WITH RECURSIVE dates(d) AS (
  SELECT '2024-02-01'
  UNION ALL
  SELECT DATE(d, '+1 day') FROM dates WHERE d < '2024-02-29'
)
SELECT d AS shipment_date, COUNT(s.shipment_id) AS shipments_count
FROM dates
LEFT JOIN shipments s ON s.scheduled_date = d
GROUP BY d
ORDER BY d`,debrief:`The core insight: a simple GROUP BY on the shipments table can only return dates that have at least one shipment row. To surface zero-shipment days, you need a complete date series to LEFT JOIN against. WITH RECURSIVE generates that series: start at Feb 1, add 1 day each iteration, stop when d = Feb 29 (2024 is a leap year). COUNT(s.shipment_id) — not COUNT(*) — returns 0 for dates where the LEFT JOIN found no match (all s.shipment_id values are NULL). Feb 10–14 is a 5-day gap, which the ops team identified as a scheduling blackout window. Without the recursive CTE, this gap is invisible in query output.`,sqliteNote:null},{id:`sql-h52`,title:`Rolling 3-Attempt Average Score`,company:`King`,companyDomain:`king.com`,difficulty:`Hard`,isFree:!1,tags:[`ROWS BETWEEN`,`window function`,`rolling average`,`PARTITION BY`,`frame specification`],roles:[`PA`,`DA`],priority:1,estimatedMin:20,datamartId:`gaming`,prompt:`The game analytics team wants to smooth out score volatility by computing a rolling 3-attempt average for each player. For each level attempt, return user_id, attempt_id, attempt_date, score, and rolling_avg_score — the average of the current attempt and the 2 preceding attempts for the same player, rounded to 1 decimal. Order by user_id, attempt_date, attempt_id.`,expectedColumns:[`user_id`,`attempt_id`,`attempt_date`,`score`,`rolling_avg_score`],expectedRowCount:20,hints:[`What does one row in your result represent? Your output needs 20 rows with columns: user_id, attempt_id, attempt_date, score, rolling_avg_score.`,`A window frame (ROWS BETWEEN N PRECEDING AND CURRENT ROW) limits which rows feed the aggregate. Match the frame size to the rolling window required.`,`Break the problem down: apply a window function OVER the right partition.`,`Verify the frame boundary: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW gives a 3-row window.`,`Before finalising, confirm: does your query return exactly 20 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{attempt_id:`5`,rolling_avg_score:`456.7`},{attempt_id:`10`,rolling_avg_score:`790.0`}],solution:`SELECT user_id, attempt_id, attempt_date, score,
  ROUND(AVG(score) OVER (
    PARTITION BY user_id
    ORDER BY attempt_date, attempt_id
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ), 1) AS rolling_avg_score
FROM level_attempts
ORDER BY user_id, attempt_date, attempt_id`,debrief:`ROWS BETWEEN 2 PRECEDING AND CURRENT ROW is an explicit physical frame — it always looks back exactly 2 rows in the partition order, or fewer at the start of a partition. PARTITION BY user_id ensures each player's rolling window resets independently. For user 1's 5th attempt (score 610): the window covers attempts 3 (340), 4 (420), 5 (610) → avg = 456.7. Without PARTITION BY, the window would cross player boundaries, contaminating user 1's averages with user 3's scores. The default frame (RANGE UNBOUNDED PRECEDING) would give a cumulative average, not a 3-attempt rolling average. Use ROWS for physical-row frames; use RANGE for value-based frames.`,sqliteNote:null},{id:`sql-h53`,title:`Courier Workload vs Delivery Output`,company:`Uber Eats`,companyDomain:`ubereats.com`,difficulty:`Hard`,isFree:!1,tags:[`COUNT`,`CASE WHEN`,`conditional aggregation`,`two interpretations`,`delivery analytics`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:18,datamartId:`food_delivery`,prompt:`The fleet team needs a courier performance report. "Order volume" is ambiguous — it could mean dispatched orders (total assigned) or successfully delivered orders. Write a single query returning courier_id, total_dispatched (all orders assigned to the courier), and total_delivered (orders with status = delivered). Exclude orders with no courier assigned. Order by courier_id.`,expectedColumns:[`courier_id`,`total_dispatched`,`total_delivered`],expectedRowCount:8,hints:[`What does one row in your result represent? Your output needs 8 rows with columns: courier_id, total_dispatched, total_delivered.`,`CASE WHEN ... THEN ... ELSE ... END works like if-else inside SQL. You can use it inside aggregate functions for conditional counts.`,`Break the problem down: write the core SELECT/FROM/WHERE first, then add aggregation.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 8 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{courier_id:`1`,total_dispatched:`3`,total_delivered:`2`},{courier_id:`3`,total_dispatched:`5`,total_delivered:`3`}],solution:`SELECT courier_id,
  COUNT(*) AS total_dispatched,
  SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS total_delivered
FROM orders
WHERE courier_id IS NOT NULL
GROUP BY courier_id
ORDER BY courier_id`,debrief:`Both "number of orders per courier" and "number of deliveries per courier" are valid metrics — they just answer different questions. Total dispatched measures workload; total delivered measures output. Courier 3 received 5 orders but completed only 3 (orders 10 and 15 were cancelled), giving a 60% delivery rate. Courier 1: 3 dispatched, 2 delivered (order 5 was cancelled). The strong interviewer move: before writing the query, ask "do you want workload or output?" If neither answer is given, present both in one query — exactly as this problem requires. Using a WHERE status = 'delivered' filter alone silently drops the dispatched column, hiding the workload dimension.`,sqliteNote:null},{id:`sql-h54`,title:`Headcount by Department — Define Your Metric`,company:`Workday`,companyDomain:`workday.com`,difficulty:`Hard`,isFree:!1,tags:[`GROUP BY`,`CASE WHEN`,`SUM`,`LEFT JOIN`,`ambiguous definition`,`HR analytics`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:18,datamartId:`hr_analytics`,prompt:`The CFO asked for "headcount by department" for the board deck — no further definition given. Write a query that surfaces the ambiguity by returning dept_name, total_headcount (all employees on record in that department), and active_headcount (employees with is_active = 1). One row per department. Order by dept_name.`,expectedColumns:[`dept_name`,`total_headcount`,`active_headcount`],expectedRowCount:7,hints:[`What does one row in your result represent? Your output needs 7 rows with columns: dept_name, total_headcount, active_headcount.`,`LEFT JOIN keeps all rows from the left table even when there is no match. Use this when you need to detect missing or zero-count records.`,`Break the problem down: identify the join key between tables, GROUP BY the grouping key to collapse rows.`,`Watch for NULLs — a LEFT JOIN will produce NULLs where there is no match.`,`Before finalising, confirm: does your query return exactly 7 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{dept_name:`Sales`,total_headcount:`2`,active_headcount:`1`}],solution:`SELECT d.name AS dept_name,
  COUNT(e.emp_id) AS total_headcount,
  SUM(e.is_active) AS active_headcount
FROM departments d
LEFT JOIN employees e ON d.dept_id = e.dept_id
GROUP BY d.name
ORDER BY d.name`,debrief:`"Headcount" is one of the most commonly undefined metrics in HR analytics. Definition A (all employees on record) gives a total of 15. Definition B (active only) gives 14 — Sales shows 2 total but 1 active because Ivan Petrov is terminated (is_active = 0). The strong answer before writing any SQL: "Is headcount the active roster or everyone with an employment record, including terminated?" Presenting both columns in one query is the production-grade move — it gives the CFO the data to choose their definition without needing a second query. SUM(is_active) works cleanly because is_active is a 0/1 integer; COUNT(CASE WHEN is_active = 1 THEN 1 END) is equivalent but more verbose.`,sqliteNote:null},{id:`sql-master01`,title:`User Risk Scoring Engine`,company:`Chime`,companyDomain:`chime.com`,difficulty:`Master`,isFree:!1,tags:[`CTE`,`CASE WHEN`,`multi-signal`,`COALESCE`,`LEFT JOIN`,`risk scoring`],roles:[`DA`,`PA`],priority:1,estimatedMin:30,datamartId:`fintech`,prompt:`Build me a composite risk score for every user based on their account standing, risk tier, and transaction history. I need a priority list for my review queue.`,expectedColumns:[`user_id`,`email`,`risk_score`],expectedRowCount:12,hints:[`What does one row in your result represent? Your output needs 12 rows with columns: user_id, email, risk_score.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 12 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{user_id:`9`,risk_score:`8`}],solution:`WITH kyc AS (
  SELECT user_id,
    CASE kyc_status WHEN 'verified' THEN 0 WHEN 'pending' THEN 2 WHEN 'rejected' THEN 5 ELSE 0 END AS kyc_score
  FROM users
),
tier AS (
  SELECT user_id,
    CASE risk_tier WHEN 'low' THEN 0 WHEN 'medium' THEN 1 WHEN 'high' THEN 3 ELSE 0 END AS tier_score
  FROM users
),
disputed AS (
  SELECT DISTINCT a.user_id, 2 AS dispute_score
  FROM accounts a
  JOIN transactions t ON a.account_id = t.account_id
  WHERE t.status = 'disputed'
)
SELECT u.user_id, u.email,
  k.kyc_score + r.tier_score + COALESCE(d.dispute_score, 0) AS risk_score
FROM users u
JOIN kyc k ON u.user_id = k.user_id
JOIN tier r ON u.user_id = r.user_id
JOIN accounts a ON u.user_id = a.user_id
LEFT JOIN disputed d ON u.user_id = d.user_id
GROUP BY u.user_id, u.email, k.kyc_score, r.tier_score, d.dispute_score
ORDER BY risk_score DESC, u.user_id`,debrief:`What the stakeholder wants: A scored, ordered list of all users with accounts — highest risk at the top — so the review team can triage efficiently without manually reading individual records.

Ambiguities resolved: Three signals combine into a risk score: (1) KYC status — verified=0, pending=2, rejected=5; (2) risk tier — low=0, medium=1, high=3; (3) any disputed transaction on any account adds 2. The candidate must propose and document these weights — they are not given. Only users with at least one account qualify (the JOIN to accounts acts as the filter).

SQL approach: Three CTEs isolate each signal cleanly. kyc CTE: CASE kyc_status for the KYC score. tier CTE: CASE risk_tier for the tier score. disputed CTE: DISTINCT user_ids from accounts joined to disputed transactions, contributing a flat +2. Final SELECT sums all three with COALESCE(d.dispute_score, 0) for users with no disputes. GROUP BY is required because the JOIN to accounts can produce multiple rows per user (users with multiple accounts).

What weak SQL looks like: Three correlated subqueries in the SELECT list — one per signal — logically correct but runs three separate aggregation passes per row. The CTE approach computes each signal once. Or forgetting GROUP BY after the accounts JOIN — duplicates inflate the score for multi-account users.

Interviewer follow-up: 'How would you validate that the scoring weights are calibrated correctly against historical fraud outcomes?'`,sqliteNote:null},{id:`sql-master02`,title:`Channel 6-Month Retention Analysis`,company:`Meta`,companyDomain:`meta.com`,difficulty:`Master`,isFree:!1,tags:[`CTE`,`cohort analysis`,`julianday`,`retention`,`channel attribution`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:30,datamartId:`ecomm`,prompt:`Which acquisition channel produces customers who actually convert to buyers? I want each channel's 6-month purchase rate so we can rebalance our marketing spend.`,expectedColumns:[`channel`,`total_users`,`converted_in_180d`,`retention_rate`],expectedRowCount:4,hints:[`What does one row in your result represent? Your output needs 4 rows with columns: channel, total_users, converted_in_180d, retention_rate.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, identify the join key between tables, GROUP BY the grouping key to collapse rows.`,`Watch for NULLs — a LEFT JOIN will produce NULLs where there is no match.`,`Before finalising, confirm: does your query return exactly 4 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{channel:`paid`,retention_rate:`100.0`}],solution:`WITH first_orders AS (
  SELECT user_id, MIN(created_at) AS first_order_date
  FROM orders
  GROUP BY user_id
),
channel_conversion AS (
  SELECT u.channel,
    COUNT(*) AS total_users,
    SUM(CASE WHEN julianday(fo.first_order_date) - julianday(u.signup_date) <= 180 THEN 1 ELSE 0 END) AS converted_in_180d
  FROM users u
  LEFT JOIN first_orders fo ON u.user_id = fo.user_id
  GROUP BY u.channel
)
SELECT channel, total_users, converted_in_180d,
  ROUND(100.0 * converted_in_180d / total_users, 1) AS retention_rate
FROM channel_conversion
ORDER BY retention_rate DESC, total_users DESC`,debrief:`What the stakeholder wants: A channel-level conversion rate showing what percentage of acquired users actually placed an order within 6 months of signup — the key metric for evaluating channel quality beyond just user volume.

Ambiguities resolved: '6 months' means 180 days from signup_date (not a calendar month window). All users from each channel must appear in the denominator — including those who never ordered. Whether to count any order status or only completed is a business decision; the solution counts the first order date regardless of status. Users with no orders return NULL from the LEFT JOIN, which COALESCE or the CASE WHEN handles.

SQL approach: First CTE finds each user's MIN(created_at) as first_order_date. Main CTE LEFT JOINs users to first_orders and computes converted_in_180d using CASE WHEN julianday(first_order_date) - julianday(signup_date) <= 180. Final SELECT computes retention_rate = 100.0 * converted / total.

What weak SQL looks like: INNER JOIN from users to first_orders — drops users who never ordered from the denominator, making every channel appear to have 100% conversion. This is the most common error in cohort-style queries.

Interviewer follow-up: 'If paid channel converts at 100% but has the highest CAC, how would you incorporate LTV to determine which channel has the best unit economics?'`,sqliteNote:`Uses julianday() for date differences — SQLite-specific. In other dialects use DATEDIFF() or date subtraction.`},{id:`sql-master03`,title:`Channel LTV Analysis`,company:`Shopify`,companyDomain:`shopify.com`,difficulty:`Master`,isFree:!1,tags:[`CTE`,`LEFT JOIN`,`GROUP BY`,`LTV`,`channel attribution`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:30,datamartId:`ecomm`,prompt:`Finance wants a channel-level LTV report for the board. Show me how each acquisition channel compares on revenue per user and order frequency.`,expectedColumns:[`channel`,`user_count`,`total_orders`,`total_revenue`,`orders_per_user`,`avg_ltv`],expectedRowCount:4,hints:[`What does one row in your result represent? Your output needs 4 rows with columns: channel, user_count, total_orders, total_revenue, orders_per_user, avg_ltv.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, identify the join key between tables.`,`Watch for NULLs — a LEFT JOIN will produce NULLs where there is no match.`,`Before finalising, confirm: does your query return exactly 4 rows? Run it and check the row count first, then verify specific values.`],checkValues:[],solution:`WITH channel_users AS (
  SELECT user_id, channel FROM users
),
channel_revenue AS (
  SELECT cu.channel,
         COUNT(DISTINCT cu.user_id) AS user_count,
         COUNT(o.order_id) AS total_orders,
         ROUND(SUM(o.subtotal), 2) AS total_revenue
  FROM channel_users cu
  LEFT JOIN orders o ON cu.user_id = o.user_id AND o.status = 'completed'
  GROUP BY cu.channel
)
SELECT channel, user_count, total_orders,
       COALESCE(total_revenue, 0) AS total_revenue,
       ROUND(1.0 * total_orders / user_count, 2) AS orders_per_user,
       ROUND(COALESCE(total_revenue, 0) / user_count, 2) AS avg_ltv
FROM channel_revenue
ORDER BY avg_ltv DESC`,debrief:`What the stakeholder wants: A per-channel summary showing revenue efficiency — how many users each channel brings, how many orders they complete, and what average revenue per user looks like. Used to justify channel-level marketing budget allocations.

Ambiguities resolved: LTV here means total completed-order revenue divided by user count (all users, not just buyers). Including zero-purchase users in the denominator is the correct business definition — an acquired user who never buys is still an acquisition cost. Only completed orders count toward revenue. Channels with zero completed orders still appear.

SQL approach: First CTE lists all users with their channel. Main CTE LEFT JOINs to orders with AND o.status = 'completed' in the ON clause — this preserves all users in the GROUP BY while only counting completed orders. COUNT(DISTINCT user_id) for user_count. COUNT(order_id) for total_orders. SUM(subtotal) for revenue. Outer SELECT computes derived metrics.

What weak SQL looks like: Putting WHERE o.status = 'completed' in the WHERE clause instead of the ON clause — this converts the LEFT JOIN to an INNER JOIN, dropping users with no completed orders from the user_count denominator and inflating avg_ltv for every channel.

Interviewer follow-up: 'How would you adjust the LTV calculation to account for the fact that some users were acquired 12 months ago while others were acquired last month?'`,sqliteNote:null},{id:`sql-master04`,title:`Account Health Score`,company:`Salesforce`,companyDomain:`salesforce.com`,difficulty:`Master`,isFree:!1,tags:[`CTE`,`LEFT JOIN`,`CASE WHEN`,`COALESCE`,`multi-signal scoring`],roles:[`PA`,`DA`,`BA`],priority:1,estimatedMin:30,datamartId:`saas`,prompt:`Customer success needs a health score for every active account — something they can act on to prioritize outreach. Can you build that?`,expectedColumns:[`account_id`,`company_name`,`plan_name`,`recent_events`,`health_score`,`health_label`],expectedRowCount:12,hints:[`What does one row in your result represent? Your output needs 12 rows with columns: account_id, company_name, plan_name, recent_events, health_score, health_label.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 12 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{account_id:`5`,health_label:`healthy`}],solution:`WITH recent_activity AS (
  SELECT account_id, COUNT(*) AS recent_events
  FROM events
  WHERE occurred_at >= '2024-03-01'
  GROUP BY account_id
),
active_subs AS (
  SELECT s.account_id, p.name AS plan_name,
    CASE p.name WHEN 'Enterprise' THEN 6 WHEN 'Business' THEN 4 WHEN 'Growth' THEN 2 ELSE 0 END AS plan_score
  FROM subscriptions s
  JOIN plans p ON s.plan_id = p.plan_id
  WHERE s.status = 'active'
)
SELECT a.account_id, a.company_name, asub.plan_name,
       COALESCE(ra.recent_events, 0) AS recent_events,
       asub.plan_score + 3 + COALESCE(ra.recent_events, 0) AS health_score,
       CASE WHEN asub.plan_score + 3 + COALESCE(ra.recent_events, 0) >= 9 THEN 'healthy'
            WHEN asub.plan_score + 3 + COALESCE(ra.recent_events, 0) >= 6 THEN 'at_risk'
            ELSE 'critical' END AS health_label
FROM accounts a
JOIN active_subs asub ON a.account_id = asub.account_id
LEFT JOIN recent_activity ra ON a.account_id = ra.account_id
ORDER BY health_score DESC, a.account_id`,debrief:`What the stakeholder wants: Every active account labeled with a numeric health score and a categorical label (healthy / at_risk / critical) — so CS reps can sort their portfolio and focus outreach on accounts most likely to churn.

Ambiguities resolved: 'Active accounts' means those with status = 'active' in subscriptions — churned accounts are excluded. Health signals and weights must be defined by the candidate: plan tier (Enterprise=6, Business=4, Growth=2, Starter=0), active subscription (+3), recent events since a cutoff date (+1 each). 'Recent' must have a defined cutoff — the solution uses 2024-03-01. Category thresholds (>=9 healthy, 6-8 at_risk, <6 critical) are also business parameters that the candidate must state and justify.

SQL approach: recent_activity CTE counts events per account since the cutoff. active_subs CTE joins subscriptions to plans to get plan_score per active account. Main SELECT joins accounts to both CTEs using LEFT JOIN on recent_activity (accounts with no recent events score 0). COALESCE(ra.recent_events, 0) prevents NULL propagation in the score formula.

What weak SQL looks like: Hard-coding the score formula inline without CTEs — the CASE WHEN expression becomes unreadable and duplicated between the score column and the label column. Or using WHERE s.status = 'active' in a subquery that returns multiple rows per account when an account has had both active and churned subscriptions.

Interviewer follow-up: 'How would you alert the CS team automatically when an account's health score drops by more than 3 points month over month?'`,sqliteNote:null},{id:`sql-master05`,title:`Transaction Spend Anomaly Detection`,company:`Chime`,companyDomain:`chime.com`,difficulty:`Master`,isFree:!1,tags:[`CTE`,`AVG`,`JOIN`,`CASE WHEN`,`anomaly detection`,`fraud`],roles:[`PA`,`DA`,`BA`],priority:1,estimatedMin:30,datamartId:`fintech`,prompt:`Flag transactions that look unusual compared to that user's normal spending behavior. I want to surface anything that's way out of line so the fraud team can review it.`,expectedColumns:[`txn_id`,`user_id`,`amount`,`user_avg_amount`,`spend_ratio`],expectedRowCount:3,hints:[`What does one row in your result represent? Your output needs 3 rows with columns: txn_id, user_id, amount, user_avg_amount, spend_ratio.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, identify the join key between tables, GROUP BY the grouping key to collapse rows.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 3 rows? Run it and check the row count first, then verify specific values.`],checkValues:[],solution:`WITH user_avg AS (
  SELECT a.user_id, ROUND(AVG(t.amount), 2) AS avg_amount
  FROM accounts a
  JOIN transactions t ON a.account_id = t.account_id
  GROUP BY a.user_id
)
SELECT t.txn_id, a.user_id, t.amount,
       ua.avg_amount AS user_avg_amount,
       ROUND(t.amount / ua.avg_amount, 2) AS spend_ratio
FROM transactions t
JOIN accounts a ON t.account_id = a.account_id
JOIN user_avg ua ON a.user_id = ua.user_id
WHERE t.amount > 3 * ua.avg_amount
ORDER BY spend_ratio DESC`,debrief:`What the stakeholder wants: A list of transactions that are dramatically higher than what that specific user normally spends — using each user's own history as the baseline rather than a global average, so a high-spending user isn't flagged for normal behavior.

Ambiguities resolved: 'Way out of line' must be quantified — the candidate must propose a threshold (3x the user's average is used here). 'Normal spending' is defined as the all-time average transaction amount across all that user's accounts. Whether to use a rolling window or all-time average is a business choice; all-time is simpler and used here. New users with only one transaction have no meaningful baseline — they would always equal their average, so they never appear in the results (which is correct behavior).

SQL approach: CTE joins accounts to transactions, groups by user_id to compute AVG(amount). Main query joins transactions back through accounts to the per-user average. WHERE t.amount > 3 * ua.avg_amount applies the threshold. spend_ratio = amount / avg shows how extreme each anomaly is.

What weak SQL looks like: Comparing to a global average (AVG(amount) across all users) — this flags every large transaction regardless of whether the user is normally a big spender. Or using a scalar subquery in the WHERE clause that re-computes the average per row — O(n squared) and slower than the CTE approach.

Interviewer follow-up: 'How would you replace the 3x threshold with a statistical approach using mean plus 2 standard deviations per user?'`,sqliteNote:null},{id:`sql-master08`,title:`Product Co-Purchase Affinity`,company:`Amazon`,companyDomain:`amazon.com`,difficulty:`Master`,isFree:!1,tags:[`self-join`,`CTE`,`affinity analysis`,`product bundling`],roles:[`PA`,`DA`,`PM`],priority:2,estimatedMin:30,datamartId:`ecomm`,prompt:`Which products tend to get bought together? I want to power a Frequently Bought Together widget on the product page.`,expectedColumns:[`product_a`,`product_b`,`co_purchase_count`],expectedRowCount:2,hints:[`What does one row in your result represent? Your output needs 2 rows with columns: product_a, product_b, co_purchase_count.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, identify the join key between tables, GROUP BY the grouping key to collapse rows.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 2 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{product_a:`SQL Mastery`,product_b:`Desk Lamp`,co_purchase_count:`1`}],solution:`WITH product_pairs AS (
  SELECT oi1.product_id AS pid_a, oi2.product_id AS pid_b,
         COUNT(*) AS co_purchase_count
  FROM order_items oi1
  JOIN order_items oi2
    ON oi1.order_id = oi2.order_id
    AND oi1.product_id < oi2.product_id
  GROUP BY oi1.product_id, oi2.product_id
)
SELECT p1.name AS product_a, p2.name AS product_b, pp.co_purchase_count
FROM product_pairs pp
JOIN products p1 ON pp.pid_a = p1.product_id
JOIN products p2 ON pp.pid_b = p2.product_id
ORDER BY pp.co_purchase_count DESC`,debrief:`What the stakeholder wants: All product pairs that have appeared in the same order, with their co-purchase count — used to power a recommendation widget that surfaces complementary products on the product detail page.

Ambiguities resolved: 'Same order' means same order_id across all order statuses (including cancelled — whether to exclude those is a business call worth surfacing). 'Pair' means an unordered pair — (A, B) is the same as (B, A). The candidate must ensure deduplication by requiring product_a_id < product_b_id. Minimum co-purchase count threshold (e.g., >= 2) is a business parameter to keep noise out of the widget.

SQL approach: Self-join order_items on order_id with the condition oi1.product_id < oi2.product_id — this generates all unordered pairs within each order without duplicates. GROUP BY the pair and COUNT(*) gives co_purchase_count. Join to products twice to get names. ORDER BY count DESC surfaces the most-affinity pairs.

What weak SQL looks like: Self-join without the < condition — generates (A,B) and (B,A) as separate pairs, doubling all counts and confusing the widget logic. Or generating pairs in application code after a full table scan — correct but inefficient when order_items has millions of rows.

Interviewer follow-up: 'How would you extend this to compute a lift score — the probability of buying B given A, compared to the base rate of buying B?'`,sqliteNote:null},{id:`sql-master09`,title:`Plan Upgrade and Downgrade Classification`,company:`Salesforce`,companyDomain:`salesforce.com`,difficulty:`Master`,isFree:!1,tags:[`CTE`,`self-join`,`ROW_NUMBER`,`window function`,`MRR movement`],roles:[`PA`,`DA`,`BA`],priority:1,estimatedMin:30,datamartId:`saas`,prompt:`Finance wants every subscription plan change classified — upgrade, downgrade, or lateral. I need this for the MRR waterfall chart.`,expectedColumns:[`account_id`,`company_name`,`from_plan`,`to_plan`,`prev_mrr`,`new_mrr`,`mrr_delta`,`change_type`],expectedRowCount:2,hints:[`What does one row in your result represent? Your output needs 2 rows with columns: account_id, company_name, from_plan, to_plan, prev_mrr, new_mrr, mrr_delta, change_type.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, identify the join key between tables, apply a window function OVER the right partition.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 2 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{account_id:`1`,change_type:`upgrade`,mrr_delta:`2000`}],solution:`WITH ranked_subs AS (
  SELECT account_id, plan_id, mrr, started_at,
         ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY started_at) AS sub_order
  FROM subscriptions
),
with_prev AS (
  SELECT r1.account_id, r1.started_at AS change_date,
         r2.plan_id AS prev_plan_id, r2.mrr AS prev_mrr,
         r1.plan_id AS new_plan_id, r1.mrr AS new_mrr,
         r1.mrr - r2.mrr AS mrr_delta
  FROM ranked_subs r1
  JOIN ranked_subs r2
    ON r1.account_id = r2.account_id
    AND r1.sub_order = r2.sub_order + 1
)
SELECT wp.account_id, a.company_name,
       p1.name AS from_plan, p2.name AS to_plan,
       wp.prev_mrr, wp.new_mrr, wp.mrr_delta,
       CASE WHEN wp.mrr_delta > 0 THEN 'upgrade'
            WHEN wp.mrr_delta < 0 THEN 'downgrade'
            ELSE 'lateral' END AS change_type
FROM with_prev wp
JOIN accounts a ON wp.account_id = a.account_id
JOIN plans p1 ON wp.prev_plan_id = p1.plan_id
JOIN plans p2 ON wp.new_plan_id = p2.plan_id
ORDER BY wp.change_date`,debrief:`What the stakeholder wants: A row-by-row classification of every plan change event, showing from/to plan, MRR delta, and whether it was expansion, contraction, or neutral — the inputs to the monthly MRR waterfall that investors and finance review.

Ambiguities resolved: 'Plan change' means an account that has more than one subscription in chronological order. The comparison is current subscription vs the immediately preceding one (not the first one). 'Upgrade' = positive MRR delta, 'downgrade' = negative, 'lateral' = zero delta (same MRR, different plan). First subscriptions per account are not a 'change' and should not appear in the output.

SQL approach: First CTE uses ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY started_at) to assign a sequence number per subscription. Second CTE self-joins ranked_subs on sub_order = sub_order + 1 to pair each subscription with its predecessor — the 'previous plan' pattern. Main SELECT joins to accounts and plans twice for names, then classifies by CASE WHEN mrr_delta > 0.

What weak SQL looks like: Using LAG(mrr) OVER (PARTITION BY account_id ORDER BY started_at) instead of the self-join — simpler and equally correct; interviewers usually accept either. The ROW_NUMBER + self-join approach is shown here because it's more explicit and generalizes to comparing N subscriptions apart. Or using MIN/MAX per account — this only works for the first-to-last comparison, not consecutive changes.

Interviewer follow-up: 'How would you build a full monthly MRR waterfall showing new, expansion, contraction, churn, and reactivation revenue for each month?'`,sqliteNote:null},{id:`sql-master10`,title:`High-Risk Account Flagging`,company:`Stripe`,companyDomain:`stripe.com`,difficulty:`Master`,isFree:!1,tags:[`CTE`,`JOIN`,`EXISTS`,`multi-signal`,`fraud`,`risk`],roles:[`PA`,`DA`,`BA`],priority:1,estimatedMin:30,datamartId:`fintech`,prompt:`The trust and safety team wants to flag users who show multiple risk signals: (1) at least one transaction through a flagged merchant, and (2) at least one open dispute (resolved_at IS NULL). For qualifying users return user_id, email, kyc_status, risk_tier, flagged_merchant_txns (count), and open_dispute_count. Order by open_dispute_count descending.`,expectedColumns:[`user_id`,`email`,`kyc_status`,`risk_tier`,`flagged_merchant_txns`,`open_dispute_count`],expectedRowCount:1,hints:[`What does one row in your result represent? Your output needs 1 row with columns: user_id, email, kyc_status, risk_tier, flagged_merchant_txns, open_dispute_count.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, identify the join key between tables, GROUP BY the grouping key to collapse rows.`,`Watch for NULLs — a LEFT JOIN will produce NULLs where there is no match.`,`Before finalising, confirm: does your query return exactly 1 row? Run it and check the row count first, then verify specific values.`],checkValues:[{user_id:`5`}],solution:`WITH flagged_txns AS (
  SELECT a.user_id, COUNT(t.txn_id) AS flagged_merchant_txns
  FROM transactions t
  JOIN merchants m ON t.merchant_id = m.merchant_id
  JOIN accounts a ON t.account_id = a.account_id
  WHERE m.is_flagged = 1
  GROUP BY a.user_id
),
open_disputes AS (
  SELECT a.user_id, COUNT(d.dispute_id) AS open_dispute_count
  FROM disputes d
  JOIN transactions t ON d.txn_id = t.txn_id
  JOIN accounts a ON t.account_id = a.account_id
  WHERE d.resolved_at IS NULL
  GROUP BY a.user_id
)
SELECT u.user_id, u.email, u.kyc_status, u.risk_tier,
       ft.flagged_merchant_txns, od.open_dispute_count
FROM users u
JOIN flagged_txns ft ON u.user_id = ft.user_id
JOIN open_disputes od ON u.user_id = od.user_id
ORDER BY od.open_dispute_count DESC`,debrief:`Only user 5 (eve) meets both criteria: she transacted with QuickTransfer (flagged merchant, txn 9 = $950) AND has an open dispute on txn 31 ($3,500, account 8). The JOIN between the two CTEs implements a logical AND — the user must appear in both signal sets. A LEFT JOIN with WHERE od.open_dispute_count IS NOT NULL would give the same result but obscures the intent. User 3 (carol) also transacted with a flagged merchant (account 5, txn 9 is user 3's... wait, account 5 belongs to user 3 in the fintech datamart). This is a two-signal filter: volume alone (flagged merchant) is noisy; requiring an open dispute simultaneously reduces false positives significantly.`,sqliteNote:null},{id:`sql-master12`,title:`Prescription Coverage Days by Patient`,company:`Optum`,companyDomain:`optum.com`,difficulty:`Master`,isFree:!1,tags:[`CTE`,`GROUP BY`,`SUM`,`ROUND`,`medication adherence`],roles:[`PA`,`DA`,`BA`],priority:2,estimatedMin:30,datamartId:`health`,prompt:`The pharmacy team wants to understand total medication coverage per patient — how many days of medication supply they have been prescribed in total, factoring in refills. Total coverage days = days_supply * (refills + 1). For each patient with at least one prescription, return patient_id, rx_count, total_coverage_days, and the drug name with the most coverage days (top_drug). Order by total_coverage_days descending.`,expectedColumns:[`patient_id`,`rx_count`,`total_coverage_days`,`top_drug`],expectedRowCount:14,hints:[`What does one row in your result represent? Your output needs 14 rows with columns: patient_id, rx_count, total_coverage_days, top_drug.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, identify the join key between tables, GROUP BY the grouping key to collapse rows, apply a window function OVER the right partition.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 14 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{patient_id:`2`,total_coverage_days:`450`}],solution:`WITH coverage AS (
  SELECT patient_id, drug_name,
         SUM(days_supply * (refills + 1)) AS drug_coverage_days
  FROM prescriptions
  GROUP BY patient_id, drug_name
),
patient_totals AS (
  SELECT patient_id,
         COUNT(*) AS rx_count,
         SUM(drug_coverage_days) AS total_coverage_days
  FROM coverage
  GROUP BY patient_id
),
top_drugs AS (
  SELECT patient_id, drug_name AS top_drug,
         ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY drug_coverage_days DESC) AS rn
  FROM coverage
)
SELECT pt.patient_id, pt.rx_count, pt.total_coverage_days,
       td.top_drug
FROM patient_totals pt
JOIN top_drugs td ON pt.patient_id = td.patient_id AND td.rn = 1
ORDER BY pt.total_coverage_days DESC`,debrief:`Patient 2 (bob) has 450 total coverage days — the most. His Metformin prescription: 90 days_supply × (2 refills + 1) = 270 days, plus Sertraline: 30 × (5+1) = 180 days, total 450. The formula days_supply × (refills + 1) converts a single-dispense prescription into total days of therapy. The ROW_NUMBER() window function identifies the top drug per patient without a correlated subquery. Three CTEs chain: coverage (per patient-drug), patient_totals (per patient), top_drugs (ranked by coverage per patient). The 14 rows reflect the 14 distinct patients who have at least one prescription.`,sqliteNote:null},{id:`sql-master14`,title:`Churned Account Reactivation Candidates`,company:`Salesforce`,companyDomain:`salesforce.com`,difficulty:`Master`,isFree:!1,tags:[`CTE`,`JOIN`,`HAVING`,`ROW_NUMBER`,`win-back`,`churn analysis`],roles:[`PA`,`DA`,`BA`],priority:2,estimatedMin:30,datamartId:`saas`,prompt:`The sales team wants to prioritize churned accounts for win-back outreach. A reactivation candidate is a churned account whose highest MRR subscription exceeded $500. Return account_id, company_name, industry, employee_count, peak_mrr (max MRR across all subscriptions), and churned_at (ended_at of the last subscription). Order by peak_mrr descending.`,expectedColumns:[`account_id`,`company_name`,`industry`,`employee_count`,`peak_mrr`,`churned_at`],expectedRowCount:3,hints:[`What does one row in your result represent? Your output needs 3 rows with columns: account_id, company_name, industry, employee_count, peak_mrr, churned_at.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 3 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{account_id:`13`,peak_mrr:`999`}],solution:`WITH churned_accounts AS (
  SELECT account_id, MAX(mrr) AS peak_mrr, MAX(ended_at) AS churned_at
  FROM subscriptions
  WHERE status = 'churned'
  GROUP BY account_id
  HAVING MAX(mrr) > 500
)
SELECT a.account_id, a.company_name, a.industry, a.employee_count,
       ca.peak_mrr, ca.churned_at
FROM churned_accounts ca
JOIN accounts a ON ca.account_id = a.account_id
ORDER BY ca.peak_mrr DESC`,debrief:`Three churned accounts had peak MRR above $500: accounts 1, 3, and 13 — all on the Business plan ($999 MRR). Account 1 is excluded from the final result because it also has an active Enterprise subscription (it upgraded, not fully churned). Wait — account 1's sub 1 is churned at $999, but the CTE only looks at churned subscriptions, so account 1 appears with its churned sub. The HAVING MAX(mrr) > 500 filter correctly excludes accounts 14 and 15 (Growth plan, $299 MRR). In a real win-back model, peak_mrr drives the expected contract value, while employee_count and industry inform the outreach message — manufacturing and finance accounts often respond to ROI-focused pitches.`,sqliteNote:null},{id:`sql-master18`,title:`Channel First-Order Value`,company:`Shopify`,companyDomain:`shopify.com`,difficulty:`Master`,isFree:!1,tags:[`CTE`,`MIN`,`JOIN`,`AVG`,`ROUND`,`acquisition analytics`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:25,datamartId:`ecomm`,prompt:`The growth team wants to evaluate acquisition channel quality by first-order value. A user's first order is defined as the order with the earliest created_at. Return channel, buyers (users who placed at least one order), avg_first_order_value (average first-order subtotal, rounded to 2 decimal places), and total_first_order_revenue (sum of first-order subtotals, rounded to 2 decimal places). Order by avg_first_order_value descending.`,expectedColumns:[`channel`,`buyers`,`avg_first_order_value`,`total_first_order_revenue`],expectedRowCount:4,hints:[`What does one row in your result represent? Your output needs 4 rows with columns: channel, buyers, avg_first_order_value, total_first_order_revenue.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, identify the join key between tables, GROUP BY the grouping key to collapse rows.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 4 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{channel:`paid`,buyers:`4`}],solution:`WITH user_first_order AS (
  SELECT user_id, MIN(created_at) AS first_order_date
  FROM orders
  GROUP BY user_id
),
first_order_values AS (
  SELECT u.channel, o.subtotal
  FROM user_first_order ufo
  JOIN orders o ON ufo.user_id = o.user_id AND ufo.first_order_date = o.created_at
  JOIN users u ON ufo.user_id = u.user_id
)
SELECT channel,
       COUNT(*) AS buyers,
       ROUND(AVG(subtotal), 2) AS avg_first_order_value,
       ROUND(SUM(subtotal), 2) AS total_first_order_revenue
FROM first_order_values
GROUP BY channel
ORDER BY avg_first_order_value DESC`,debrief:`Paid channel users (bob, eve, iris, kate) have the highest average first order at $162.49, driven by eve's and iris's $249.99 first orders. Email has only one buyer (grace, $159.99) so its average equals its single data point. Users 13–15 have no orders at all and are correctly excluded — they never appear in the CTE. The two-CTE pattern (first_order → join back for subtotal) is cleaner than a correlated subquery or self-join and generalises to any "first event" attribution problem.`,sqliteNote:null},{id:`sql-master19`,title:`Account Event Activity Tier`,company:`Gainsight`,companyDomain:`gainsight.com`,difficulty:`Master`,isFree:!1,tags:[`CTE`,`COALESCE`,`CASE WHEN`,`JOIN`,`customer success`],roles:[`PA`,`DA`,`BA`],priority:2,estimatedMin:25,datamartId:`saas`,prompt:`The customer success team wants to classify each active account by its engagement level. For each account with an active subscription, return account_id, company_name, plan_name, total_events (0 if no events in the events table), and activity_tier: "high" if total_events >= 8, "medium" if >= 3, else "low". Order by total_events descending, then account_id ascending.`,expectedColumns:[`account_id`,`company_name`,`plan_name`,`total_events`,`activity_tier`],expectedRowCount:12,hints:[`What does one row in your result represent? Your output needs 12 rows with columns: account_id, company_name, plan_name, total_events, activity_tier.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, identify the join key between tables, GROUP BY the grouping key to collapse rows.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 12 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{account_id:`1`,plan_name:`Enterprise`,total_events:`11`,activity_tier:`high`}],solution:`WITH account_events AS (
  SELECT account_id, COUNT(*) AS total_events
  FROM events
  GROUP BY account_id
),
active_subs AS (
  SELECT s.account_id, p.name AS plan_name
  FROM subscriptions s
  JOIN plans p ON s.plan_id = p.plan_id
  WHERE s.status = 'active'
)
SELECT a.account_id, a.company_name, asub.plan_name,
       COALESCE(ae.total_events, 0) AS total_events,
       CASE WHEN COALESCE(ae.total_events, 0) >= 8 THEN 'high'
            WHEN COALESCE(ae.total_events, 0) >= 3 THEN 'medium'
            ELSE 'low' END AS activity_tier
FROM accounts a
JOIN active_subs asub ON a.account_id = asub.account_id
LEFT JOIN account_events ae ON a.account_id = ae.account_id
ORDER BY total_events DESC, a.account_id`,debrief:`Account 1 (Acme Corp, Enterprise) leads with 11 events — classified as high. Accounts 2, 3, and 4 each have 8-9 events (high). Account 5 (Echo Tech, Enterprise) has 7 events — medium, despite paying the highest MRR. Accounts 9–12 and 11 have zero events — the COALESCE is what prevents NULLs from those accounts showing up as NULL instead of 0. The churned accounts 13–15 are excluded by the active_subs CTE. This pattern — joining plan context to event activity — is the foundation of customer health scoring in CS platforms like Gainsight.`,sqliteNote:null},{id:`sql-master25`,title:`User Transaction Risk Profile`,company:`Marqeta`,companyDomain:`marqeta.com`,difficulty:`Master`,isFree:!1,tags:[`CTE`,`JOIN`,`CASE WHEN`,`SUM`,`LEFT JOIN`,`risk analytics`],roles:[`PA`,`DA`,`BA`],priority:2,estimatedMin:30,datamartId:`fintech`,prompt:`Build me a risk profile for every user who has transacted — something the review team can triage from. I want to know who is elevated risk, who is moderate, and who is clean.`,expectedColumns:[`user_id`,`email`,`risk_tier`,`kyc_status`,`total_txns`,`disputed_count`,`flagged_merchant_txns`,`risk_level`],expectedRowCount:12,hints:[`What does one row in your result represent? Your output needs 12 rows with columns: user_id, email, risk_tier, kyc_status, total_txns, disputed_count, flagged_merchant_txns, risk_level.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step.`,`Double-check your column aliases match the expected output column names exactly.`,`Before finalising, confirm: does your query return exactly 12 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{user_id:`3`,disputed_count:`2`,flagged_merchant_txns:`2`,risk_level:`elevated`}],solution:`WITH user_txn AS (
  SELECT a.user_id,
         COUNT(t.txn_id) AS total_txns,
         ROUND(SUM(t.amount), 2) AS total_spent,
         SUM(CASE WHEN t.status = 'disputed' THEN 1 ELSE 0 END) AS disputed_count,
         SUM(CASE WHEN m.is_flagged = 1 THEN 1 ELSE 0 END) AS flagged_merchant_txns
  FROM accounts a
  JOIN transactions t ON a.account_id = t.account_id
  LEFT JOIN merchants m ON t.merchant_id = m.merchant_id
  GROUP BY a.user_id
)
SELECT u.user_id, u.email, u.risk_tier, u.kyc_status,
       ut.total_txns, ut.disputed_count, ut.flagged_merchant_txns,
       CASE WHEN ut.disputed_count >= 2 OR ut.flagged_merchant_txns >= 2
                 OR u.risk_tier = 'high' THEN 'elevated'
            WHEN ut.disputed_count >= 1 OR ut.flagged_merchant_txns >= 1 THEN 'moderate'
            ELSE 'normal' END AS risk_level
FROM users u
JOIN user_txn ut ON u.user_id = ut.user_id
ORDER BY ut.disputed_count DESC, ut.flagged_merchant_txns DESC, u.user_id`,debrief:`What the stakeholder wants: A scored, labeled profile for every transacting user showing the key risk signals — disputed transactions, flagged merchant exposure, and baseline risk tier — so the review team can sort by risk level and work from highest priority down.

Ambiguities resolved: 'Has transacted' means at least one row in transactions linked through accounts. Risk level classification must be defined: 'elevated' if disputed_count >= 2 OR flagged_merchant_txns >= 2 OR risk_tier = 'high'; 'moderate' if either disputed >= 1 OR flagged >= 1; else 'normal'. These thresholds are business parameters the candidate must state. Users with NULL merchant_id transactions (P2P transfers) must not be dropped — LEFT JOIN on merchants handles this.

SQL approach: Single CTE joins accounts to transactions to merchants (LEFT JOIN on merchants to preserve NULL merchant_ids). Aggregates per user_id: total_txns, disputed_count via SUM(CASE WHEN status = 'disputed'), flagged_merchant_txns via SUM(CASE WHEN is_flagged = 1). Main SELECT joins users to the CTE and applies CASE WHEN for risk_level.

What weak SQL looks like: INNER JOIN on merchants — drops all transactions without a merchant_id (P2P transfers), understating total_txns and making clean P2P-heavy users appear lower risk than they are. Or three separate subqueries for each signal — correct but re-scans the transactions table three times instead of once.

Interviewer follow-up: 'How would you add a velocity signal — number of transactions in the last 7 days — to the profile, and how would it change the risk classification logic?'`,sqliteNote:null},{id:`sql-master26`,title:`Full Referral Tree Walk`,company:`LinkedIn`,companyDomain:`linkedin.com`,difficulty:`Master`,isFree:!1,tags:[`recursive CTE`,`WITH RECURSIVE`,`hierarchy traversal`,`referral analytics`,`self-join`],roles:[`PA`,`DA`],priority:1,estimatedMin:35,datamartId:`social_network`,prompt:`The growth team wants to map the full referral network generated by their top referrer. Starting from user_id = 1, recursively walk the referral tree using the referred_by_user_id column and return every user they brought into the network (directly or indirectly), along with referral depth (depth 1 = directly referred by user 1, depth 2 = referred by someone user 1 referred, and so on). Order by depth, user_id.`,expectedColumns:[`user_id`,`depth`],expectedRowCount:12,hints:[`What does one row in your result represent? Your output needs 12 rows with columns: user_id, depth.`,`Recursive CTEs have two parts: a base case (the seed row) and a recursive step that references the CTE itself. Write the base SELECT first.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step, identify the join key between tables.`,`Recursive CTEs need a termination condition in the WHERE clause to avoid infinite loops.`,`Before finalising, confirm: does your query return exactly 12 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{user_id:`2`,depth:`1`},{user_id:`3`,depth:`1`},{user_id:`13`,depth:`5`}],solution:`WITH RECURSIVE referral_tree(user_id, referred_by_user_id, depth) AS (
  SELECT user_id, referred_by_user_id, 1 AS depth
  FROM users
  WHERE referred_by_user_id = 1
  UNION ALL
  SELECT u.user_id, u.referred_by_user_id, rt.depth + 1
  FROM users u
  JOIN referral_tree rt ON u.referred_by_user_id = rt.user_id
)
SELECT user_id, depth
FROM referral_tree
ORDER BY depth, user_id`,debrief:`The base case selects users directly referred by user 1 (users 2 and 3, depth=1). Each recursive step extends one level deeper — user 4 and 5 were referred by user 2 (depth=2), users 6 and 7 by user 3 (depth=2), and so on. User 13 sits at depth 5: chain is 1→9→12→13... wait — user 9 was referred by user 4 (depth 3), user 12 by user 9 (depth 4), user 13 by user 12 (depth 5). Total descendants: 12. Users 14 and 15 (NULL referred_by_user_id) are organic signups and are excluded. Without WITH RECURSIVE, you would need a separate query for each depth level — impractical for arbitrary-depth trees. The UNION ALL (not UNION) matters: it prevents deduplication that could suppress valid nodes and terminate early.`,sqliteNote:null},{id:`sql-master27`,title:`Signup Cohort Retention Curve`,company:`Supercell`,companyDomain:`supercell.com`,difficulty:`Master`,isFree:!1,tags:[`cohort analysis`,`CTE`,`CASE WHEN`,`date arithmetic`,`retention`,`pivot`,`conditional aggregation`],roles:[`PA`,`DA`,`PM`],priority:1,estimatedMin:40,datamartId:`gaming`,prompt:`The retention team wants a monthly cohort retention report. Group users by their signup month and count how many returned to play in each of their first four time windows: month 0 (signup month), month 1, month 2, and month 3+. Return cohort_month (YYYY-MM), cohort_size, month_0, month_1, month_2, month_3_plus. Order by cohort_month.`,expectedColumns:[`cohort_month`,`cohort_size`,`month_0`,`month_1`,`month_2`,`month_3_plus`],expectedRowCount:3,hints:[`What does one row in your result represent? Your output needs 3 rows with columns: cohort_month, cohort_size, month_0, month_1, month_2, month_3_plus.`,`A CTE (WITH clause) lets you name an intermediate result and reuse it. Identify which sub-result you need before the final SELECT.`,`Break the problem down: Start with a WITH clause to isolate the intermediate step.`,`Date format matters — use STRFTIME or DATE() carefully for the exact format in the column.`,`Before finalising, confirm: does your query return exactly 3 rows? Run it and check the row count first, then verify specific values.`],checkValues:[{cohort_month:`2023-11`,cohort_size:`4`,month_0:`0`,month_1:`4`,month_2:`3`,month_3_plus:`2`}],solution:`WITH cohorts AS (
  SELECT user_id,
    strftime('%Y-%m', signup_date) AS cohort_month
  FROM users
),
session_offsets AS (
  SELECT c.user_id, c.cohort_month,
    (strftime('%Y', s.session_date) - strftime('%Y', c.cohort_month || '-01')) * 12 +
    (strftime('%m', s.session_date) - strftime('%m', c.cohort_month || '-01')) AS month_offset
  FROM cohorts c
  JOIN sessions s ON c.user_id = s.user_id
),
cohort_sizes AS (
  SELECT cohort_month, COUNT(DISTINCT user_id) AS cohort_size
  FROM cohorts
  GROUP BY cohort_month
)
SELECT cs.cohort_month, cs.cohort_size,
  COUNT(DISTINCT CASE WHEN so.month_offset = 0 THEN so.user_id END) AS month_0,
  COUNT(DISTINCT CASE WHEN so.month_offset = 1 THEN so.user_id END) AS month_1,
  COUNT(DISTINCT CASE WHEN so.month_offset = 2 THEN so.user_id END) AS month_2,
  COUNT(DISTINCT CASE WHEN so.month_offset >= 3 THEN so.user_id END) AS month_3_plus
FROM cohort_sizes cs
LEFT JOIN session_offsets so ON cs.cohort_month = so.cohort_month
GROUP BY cs.cohort_month, cs.cohort_size
ORDER BY cs.cohort_month`,debrief:`Three CTEs chain together: cohorts assigns each user a cohort_month; session_offsets computes how many months after signup each session occurred using integer month arithmetic; cohort_sizes counts users per cohort. The final SELECT pivots month offsets into columns using conditional COUNT DISTINCT. Nov-2023 cohort (users 1-4): month_0 = 0 because no sessions occurred in November itself — all four first played in December (month_1). Month_2 = 3 (users 1, 2, 3 played in January). Month_3_plus = 2 (users 1 and 3 played in March, which is 4 months after the Nov signup month). Users 11 and 12 (no sessions at all) drag down the Mar-2024 cohort to 50% month_0 retention. The LEFT JOIN in the final step ensures cohorts with zero sessions in a given period return 0, not NULL.`,sqliteNote:null}];export{e as t};