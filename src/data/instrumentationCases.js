export const instrumentationCases = [
  {
    id: 'inst01',
    title: 'Measurement Plan for Checkout Redesign',
    subtitle: 'Define what to track before shipping a major feature',
    difficulty: 'junior',
    isFree: true,

    guestPreview: true,
    domain: 'measurement-plan',
    company: 'Shopify',
    estimatedMin: 20,
    tags: ['measurement-plan', 'event-tracking', 'checkout', 'pre-launch'],
    situation: 'Shopify is launching a redesigned checkout flow next month. The PM asks you to create a measurement plan. The redesign changes the step order (payment before address instead of address before payment) and adds a one-click reorder button for returning customers. You need to define exactly what to track to evaluate success.',
    question: 'What is in your measurement plan? Define primary metrics, guardrail metrics, events to instrument, and how you validate the instrumentation before launch.',
    hints: [
      'A measurement plan has four parts: primary success metric, secondary metrics, guardrail metrics (must not degrade), and the event schema',
      'For event tracking, think: what user action fires the event, what properties does it carry, what questions can you answer with it?',
      'Instrumentation validation: how do you know the events are firing correctly before you go live?'
    ],
    modelAnswer: {
      approach: 'Define outcome metrics → map events to user journey → specify event schema → validation plan',
      answer: 'Primary metric: checkout_completion_rate (orders placed / checkout sessions started). Secondary: time_to_complete_checkout (median), one_click_reorder_adoption_rate (for returning users), payment_error_rate. Guardrail: cart_abandonment_rate must not increase >2pp, customer_support_tickets about checkout must not increase. Event schema: checkout_step_viewed { step_name, step_number, session_id, user_type: new|returning, timestamp }, checkout_step_completed { same fields + duration_sec }, checkout_abandoned { step_name, reason_if_known }, one_click_reorder_tapped { user_id, previous_order_id }. Validation plan: (1) fire test events in staging and verify they appear in the data warehouse within 5 minutes; (2) manually walk through checkout on 3 device types and confirm event counts match step counts; (3) check that session_id ties all steps together correctly; (4) run a 24h smoke test with 1% of traffic and verify no events are missing or duplicated.',
      keyInsights: [
        'Measurement plans must be written before code ships, not after — retrofitting tracking misses critical user actions',
        'Every event needs a session_id and user_type property or you cannot do funnel analysis',
        'Instrumentation validation (QA on tracking) is as important as feature QA — silent tracking failures are invisible bugs'
      ]
    },
    leadershipNote: 'At staff level, you enforce a measurement plan review gate: no feature ships without a signed-off measurement plan. You also maintain a company-wide event taxonomy so checkout_step_viewed is defined once and reused, not redefined per team. Consistency in naming (snake_case, verb_object pattern) enables cross-team joins later.',
    failureMode: {
      weakAnswer: 'The candidate lists a few metrics — checkout completion rate, maybe cart abandonment — but skips the event schema entirely and says nothing about instrumentation validation. The measurement plan is just a list of KPIs, not an actionable tracking spec. No session_id, no user_type property, no QA plan.',
      interviewerFollowUp: '"Your plan mentions checkout_completion_rate as the primary metric — what exact events and properties do you need in the data warehouse to compute that metric, and how do you verify they\'re firing correctly in staging before launch?"',
    },
    keyTakeaways: [
      'Measurement plans define primary, secondary, and guardrail metrics plus event schemas — written before code ships',
      'Event validation (staging QA + smoke test) catches silent tracking failures that poison analysis data'
    ],
    playbookLinks: []
  },
  {
    id: 'inst02',
    title: 'Event Taxonomy Design',
    subtitle: 'Build a scalable naming convention for a growing product',
    difficulty: 'senior',
    isFree: true,
    domain: 'event-taxonomy',
    company: 'Notion',
    estimatedMin: 25,
    tags: ['event-taxonomy', 'naming-convention', 'data-governance', 'schema-design'],
    situation: 'Notion has 15 product teams each logging events independently. You join as the first Analytics Engineer and discover 4 different naming conventions in use: camelCase, snake_case, SCREAMING_SNAKE, and free-form strings. There are 847 distinct event names; many are duplicates like page_view, pageView, and PageViewed. Teams can\'t join events across products. Leadership wants a unified event taxonomy in 90 days.',
    question: 'How do you design and migrate to a unified event taxonomy? What trade-offs do you make?',
    hints: [
      'A taxonomy has two parts: naming rules (format) and a semantic model (what categories of events exist)',
      'Migration of existing events breaks downstream dashboards — how do you handle backward compatibility?',
      'Who owns the taxonomy? A centralized gating process vs a decentralized contribution model have different scaling properties'
    ],
    modelAnswer: {
      approach: 'Audit current events → define semantic model → establish naming rules → migration strategy → governance model',
      answer: 'Step 1: Audit. Cluster the 847 events into functional categories — navigation (page_view, screen_viewed), engagement (clicked, scrolled, hovered), feature use (created, edited, deleted, shared), conversion (subscribed, upgraded, invited). Step 2: Semantic model. Adopt the Object-Action pattern: {object}_{action}, e.g., page_viewed, block_created, workspace_shared. All names lowercase snake_case, past tense for completed actions. Step 3: Standard properties. Every event carries: user_id, anonymous_id, timestamp, platform (web|ios|android|api), workspace_id, session_id. Feature-specific properties are additive. Step 4: Migration. Don\'t rename old events — add new canonical events alongside them. Run both for 6 months. Migrate dashboards one team at a time. Deprecate old events after 90% of dashboards have migrated. Step 5: Governance. Event Registry (a versioned YAML repo) is the source of truth. New events require a PR reviewed by Analytics Eng. Auto-reject events that don\'t match naming rules via CI.',
      keyInsights: [
        'Object-Action pattern (block_created, workspace_shared) gives consistent grammar across all product areas',
        'Never hard-rename events in production — it silently breaks all downstream queries and dashboards overnight',
        'A versioned event registry with CI enforcement is the only way to maintain taxonomy hygiene at scale'
      ]
    },
    leadershipNote: 'The organizational challenge is harder than the technical one. Teams resist taxonomy reviews as gatekeeping. Frame it as enabling — a unified taxonomy means your dashboard can join Notion Doc events with Notion Calendar events, which no team can do today. Show a concrete cross-team insight that was only possible after unification, and adoption follows.',
    failureMode: {
      weakAnswer: 'The candidate proposes renaming all 847 events immediately and rebuilding dashboards from scratch. No mention of backward compatibility, dual-firing, or a migration period. They treat this as a one-time cleanup rather than an ongoing governance problem.',
      interviewerFollowUp: '"If you rename page_view to page_viewed in production tonight, what breaks tomorrow morning and for how long — and what would you have done instead?"',
    },
    keyTakeaways: [
      'Object-Action naming pattern (noun_verb, snake_case) is the industry standard for scalable event taxonomies',
      'Migrate by dual-firing new and old events simultaneously — never rename in place, as it destroys downstream dependencies'
    ],
    playbookLinks: []
  },
  {
    id: 'inst03',
    title: 'Data Quality Incident Investigation',
    subtitle: 'DAU dropped 40% overnight — is it real or a tracking bug?',
    difficulty: 'junior',
    isFree: true,
    domain: 'data-quality',
    company: 'Duolingo',
    estimatedMin: 20,
    tags: ['data-quality', 'incident-response', 'dau', 'tracking-bugs'],
    situation: 'Monday morning: Duolingo\'s DAU dashboard shows Sunday DAU was 12.4M, down from 20.8M on Saturday — a 40% drop. The CEO is asking questions. Your job is to determine within 30 minutes whether this is a real user drop or a data pipeline failure.',
    question: 'Walk through your diagnostic process step by step. How do you distinguish a real drop from a tracking issue?',
    hints: [
      'What systems generate DAU? The user, the client app, the event pipeline, the data warehouse, and the dashboard — any of these can fail',
      'If it\'s a pipeline failure, what would you expect to see in the data? If it\'s real user loss, what would you see?',
      'Cross-validate with independent data sources that don\'t share the same pipeline'
    ],
    modelAnswer: {
      approach: 'Cross-validate with independent sources → check pipeline health → check client-side signals → form hypothesis',
      answer: 'Step 1 (5 min): Cross-validate. Check app store ratings and crash rates (no instrumentation dependency). Check server-side request logs — if API calls dropped 40%, it\'s real. If API calls are normal but DAU is down, it\'s a tracking bug. Step 2 (10 min): Pipeline health. Check the event ingestion volume by hour for Sunday. If events stopped arriving at 11pm Saturday, there\'s a pipeline outage. Check ETL job run status — did the DAU computation job fail and rerun on partial data? Check for timezone errors (UTC vs local) causing Sunday events to land in Monday\'s partition. Step 3 (10 min): Client-side signals. Check push notification open rates, lesson completion events (separate pipeline), payment events. If all other metrics dropped proportionally, it\'s real. If only DAU dropped while lesson completions are normal, it\'s a DAU calculation bug. Step 4: Form hypothesis. Most likely causes in order: (1) ETL job failed on partial data, (2) timezone partition error, (3) client SDK update broke user identification, (4) real drop. Never lead with the worst case — data issues are more common than 40% real drops.',
      keyInsights: [
        'Server-side API call logs are the ground truth — if they\'re normal but event-based DAU is down, it\'s always a tracking issue',
        'Timezone and partition errors account for ~30% of sudden metric drops — check them first',
        'Cross-validating with payment data (which has its own pipeline) quickly isolates tracking failures from real events'
      ]
    },
    leadershipNote: 'At staff level, you don\'t just diagnose this incident — you build the prevention system. A data quality monitor runs hourly: if DAU drops >15% vs same hour yesterday, PagerDuty fires before any human notices. The runbook for this exact incident type lives in Confluence. Your job is to never be the person manually investigating this on a Monday morning again.',
    failureMode: {
      weakAnswer: 'The candidate immediately concludes the DAU drop is real — a product bug or user behavior change — and starts drafting a root cause hypothesis about the content quality of Sunday posts. They never check the data pipeline, never look at server-side API call logs, and never cross-validate with payment or lesson completion events.',
      interviewerFollowUp: '"Before you form any hypothesis about why users stopped engaging, what is the single fastest check that tells you whether this is a real user drop versus a data pipeline failure — and what would each outcome look like in the numbers?"',
    },
    keyTakeaways: [
      'Cross-validate metric drops with independent sources (server logs, payment data) before concluding real vs pipeline issue',
      'Most sudden large metric drops are data pipeline failures — ETL issues, timezone errors, partial data loads'
    ],
    playbookLinks: []
  },
  {
    id: 'inst04',
    title: 'A/B Test Instrumentation Audit',
    subtitle: 'Find the tracking bugs before they invalidate your experiment',
    difficulty: 'senior',
    isFree: false,
    domain: 'ab-test-instrumentation',
    company: 'Airbnb',
    estimatedMin: 30,
    tags: ['ab-testing', 'instrumentation', 'srm', 'assignment-logging'],
    situation: 'Airbnb\'s experimentation platform shows an SRM (Sample Ratio Mismatch) for an ongoing experiment: treatment has 52,000 users, control has 41,000 users (expected 50/50 split). The experiment has been running for 2 weeks and shows a 12% booking conversion lift. The PM wants to ship based on this result.',
    question: 'What tracking bugs can cause SRM? Walk through your audit process and explain why the 12% lift cannot be trusted.',
    hints: [
      'SRM means the randomization or logging is broken — both treatment and control results are unreliable',
      'List the points in the system where assignment or logging can go wrong',
      'When would SRM inflate apparent lift vs deflate it?'
    ],
    modelAnswer: {
      approach: 'Identify SRM sources → audit assignment logging → audit conversion logging → assess bias direction',
      answer: 'SRM causes: (1) Assignment logging: treatment group users are more likely to trigger the assignment log event (e.g., the new feature loads slower, causing some treatment users to leave before the log fires — but this would cause treatment to be smaller, not larger). Opposite: if the new checkout page has better engagement and treatment users have more sessions logged. (2) Client-side vs server-side assignment mismatch: if assignment is server-side but logging is client-side, network failures cause logging dropouts. (3) Bucketing collision: if user IDs hash differently in the assignment system vs the analytics system, some users appear in both groups. (4) Bot filtering applied inconsistently. Audit steps: compare assignment table counts vs event table counts per group. Check if SRM appeared from day 1 (bucketing bug) or grew over time (logging dropoff). Check if SRM is concentrated in a specific platform (iOS vs Android). The 12% lift cannot be trusted because SRM indicates the treatment and control groups are not equivalent — the extra 11,000 treatment users are non-randomly different (likely more engaged users). Any lift estimate is contaminated by selection bias. Do not ship. Fix the SRM, re-run the experiment.',
      keyInsights: [
        'SRM immediately invalidates all metric estimates — both treatment and control groups are non-representative',
        'SRM that grows over time = logging dropout (network issue, SDK bug); SRM from day 1 = bucketing or assignment bug',
        'The correct action on SRM is always: stop the experiment, diagnose, fix, restart with clean data'
      ]
    },
    leadershipNote: 'At senior/staff level, SRM checks should be automated: the experimentation platform flags any experiment with SRM p<0.001 and prevents result reporting until it\'s resolved. Never let a team ship on SRM-contaminated data — the PM pressure to ship on a "12% lift" is a recurring failure mode that erodes trust in experimentation over time.',
    failureMode: {
      weakAnswer: 'The candidate sees 52,000 vs 41,000 and says "that\'s a 11% imbalance, which seems large, but the result is highly significant at p<0.001, so the experiment effect is probably real." They focus on the magnitude of the lift rather than the validity of the randomization. They may recommend proceeding with a caveat.',
      interviewerFollowUp: '"The PM argues that p=0.001 on the outcome metric is strong evidence regardless of the traffic split. Walk me through exactly why that reasoning is wrong — what does the SRM tell you about the 52,000 users in the treatment group that makes their engagement lift uninterpretable?"',
    },
    keyTakeaways: [
      'SRM invalidates the entire experiment — not just the affected arm — because groups are no longer randomized equivalents',
      'Automated SRM alerts on the experimentation platform prevent teams from reporting on contaminated experiments'
    ],
    playbookLinks: []
  },
  {
    id: 'inst05',
    title: 'Privacy-Compliant Event Design',
    subtitle: 'Redesign tracking for GDPR and CCPA compliance without losing signal',
    difficulty: 'senior',
    isFree: false,
    domain: 'privacy-consent',
    company: 'Spotify',
    estimatedMin: 25,
    tags: ['privacy', 'gdpr', 'ccpa', 'consent', 'anonymization'],
    situation: 'Spotify\'s legal team flags that the current analytics tracking collects user_id, IP address, precise geolocation, and device fingerprint in every event payload. Under GDPR Article 5, data must be "collected for specified, explicit and legitimate purposes" with data minimization. The current schema fails this test. You need to redesign the event schema to maintain analytical fidelity while achieving compliance.',
    question: 'How do you redesign the tracking schema to be GDPR/CCPA compliant without breaking your ability to do user-level analysis, funnel analysis, and A/B test assignment?',
    hints: [
      'What is the minimum user identifier you need for analytics? Does it need to be reversible to a real user_id?',
      'Pseudonymization (hashing user_id) is different from anonymization (removing user_id entirely) — each has different compliance and analytical implications',
      'Consent tiers: what can you track without consent vs with consent?'
    ],
    modelAnswer: {
      approach: 'Data minimization audit → pseudonymization design → consent tier mapping → migration plan',
      answer: 'Step 1: Audit necessity. IP address is never needed for analytics — remove entirely. Precise geolocation (lat/lng) can be country+city for 95% of use cases — truncate to city level. Device fingerprint is a GDPR red flag — replace with a session-scoped anonymous_id that doesn\'t persist across sessions. Step 2: Pseudonymization. Replace user_id with a hashed_user_id: SHA-256(user_id + daily_salt). The salt rotates daily, so the hash can\'t be joined across days (protecting long-term tracking) but within a day all events tie together for funnel analysis. Reversing requires access to the salt table, which is access-controlled. Step 3: Consent tier. Tier 0 (no consent): anonymous session events, aggregate counts only, no user-level properties. Tier 1 (functional consent): pseudonymized_user_id, country, platform, app_version — sufficient for A/B test assignment and funnel analysis. Tier 2 (analytics consent): content interaction events, listening history — requires explicit opt-in. Step 4: A/B tests use tier 1 identifiers — pseudonymized_user_id is stable within an experiment window and sufficient for assignment.',
      keyInsights: [
        'Pseudonymization (hashed ID with rotating salt) preserves analytical joins while preventing cross-context tracking',
        'IP address and precise geolocation are almost never analytically necessary — remove them by default',
        'Consent tiers allow you to maintain core analytics on all users while respecting opt-out for richer behavioral data'
      ]
    },
    leadershipNote: 'Privacy-by-design is a competitive advantage, not just compliance. At director level, you establish a Data Minimization Review as part of the measurement plan process: every new event field must justify its collection. This reduces legal risk and builds user trust, which increasingly correlates with engagement in privacy-conscious markets.',
    failureMode: {
      weakAnswer: 'The candidate removes IP address and calls the schema compliant. They keep user_id in every event payload and never discuss pseudonymization, consent tiers, or the difference between anonymous session tracking and user-level tracking. Their "solution" is essentially the same schema with one field removed.',
      interviewerFollowUp: '"You\'ve removed IP address — but user_id is still in every event payload. Under GDPR, user_id is personal data. How does your A/B test assignment and funnel analysis work if you replace user_id with a daily-rotating hashed identifier instead?"',
    },
    keyTakeaways: [
      'Pseudonymize with rotating salts to preserve within-session joins while preventing cross-context user tracking',
      'Consent tiers ensure core product analytics continue without consent while richer behavioral data requires opt-in'
    ],
    playbookLinks: []
  },
  {
    id: 'inst06',
    title: 'Data Contract Design',
    subtitle: 'Define a contract between producers and consumers of event data',
    difficulty: 'staff',
    isFree: false,
    domain: 'data-contracts',
    company: 'Uber',
    estimatedMin: 30,
    tags: ['data-contracts', 'schema-evolution', 'data-engineering', 'sla'],
    situation: 'Uber\'s Marketplace team ships an update that renames a field in their trip_completed event from driver_id to driver_uuid. This silently breaks 47 downstream dashboards and 12 ML models. The incident takes 3 days to fully resolve. The VP of Data asks you to design a system that prevents this class of incident.',
    question: 'What is a data contract, what does it contain, and how do you enforce it to prevent breaking changes from propagating downstream?',
    hints: [
      'A data contract is an agreement between the team that produces data and the teams that consume it',
      'What makes a schema change "breaking" vs "non-breaking"? Not all changes are equal',
      'How do you discover all downstream consumers before making a change?'
    ],
    modelAnswer: {
      approach: 'Define data contract components → classify breaking vs non-breaking changes → discovery mechanism → enforcement pipeline',
      answer: 'A data contract for trip_completed contains: (1) Schema: field names, types, nullability — versioned and stored in a schema registry. (2) SLA: event latency (P99 < 30 min), completeness (>99.5% of trips produce an event within 1 hour). (3) Owner: Marketplace team, on-call rotation for incidents. (4) Consumers: a discovery registry that every consumer must register in — 47 dashboards and 12 models would be listed. Breaking vs non-breaking: renaming a field is breaking. Adding a new optional field is non-breaking. Removing a field is breaking. Changing a type (int→string) is breaking. Enforcement: (1) Schema registry with compatibility checks — reject any event payload that violates the registered schema. (2) Before any breaking change, the producer runs an impact query against the consumer registry and notifies all owners. (3) A compatibility mode: dual-fire old and new field names for one deprecation period (30 days). (4) CI check: any PR that modifies an event schema triggers automated consumer notification.',
      keyInsights: [
        'Data contracts include schema, SLA, ownership, AND a consumer registry — the consumer registry is what makes breakage discoverable',
        'Dual-firing old and new field names during deprecation period is the only safe way to rename fields at scale',
        'Schema registries with compatibility enforcement catch breaking changes at publish time, not 3 days later in dashboards'
      ]
    },
    leadershipNote: 'Data contracts are a cultural intervention as much as a technical one. The Uber incident happened because the Marketplace team didn\'t know their event had 47 consumers — the knowledge wasn\'t discoverable. At director level, you mandate consumer registration and make it visible: "Your event trip_completed has 47 registered consumers — here they are." That number alone changes behavior.',
    failureMode: {
      weakAnswer: 'The candidate describes a data contract as just a schema definition with a version number. They say "you add schema validation to reject mismatched events." No mention of SLAs, ownership, or the consumer registry. They treat this as a purely technical problem, missing that the Uber incident happened because nobody knew who was consuming the event.',
      interviewerFollowUp: '"Your contract has schema validation and versioning — but the Marketplace team still doesn\'t know the 47 consumers exist. How does your contract prevent the exact scenario where a developer renames a field because they don\'t know anyone downstream is reading it?"',
    },
    keyTakeaways: [
      'Data contracts require a consumer registry — without knowing who depends on your data, you can\'t assess breaking change impact',
      'Schema registries with dual-fire deprecation periods are the operational mechanism for safe schema evolution'
    ],
    playbookLinks: []
  },
  {
    id: 'inst07',
    title: 'Tracking Plan for a New Feature Launch',
    subtitle: 'Design end-to-end instrumentation for a social sharing feature',
    difficulty: 'junior',
    isFree: false,
    domain: 'measurement-plan',
    company: 'Pinterest',
    estimatedMin: 20,
    tags: ['tracking-plan', 'feature-launch', 'social-sharing', 'event-design'],
    situation: 'Pinterest is launching a new feature: users can now create "Collections" (curated boards shared publicly with a custom URL). Product wants to know if Collections drives new user acquisition and increases saves. You need to design the tracking plan before the feature ships in 3 weeks.',
    question: 'Define the full tracking plan: what events, what properties, what metrics, and how do you verify the tracking is correct before launch?',
    hints: [
      'Map the user journey first: what are all the steps a user takes from discovering Collections to creating one and sharing it?',
      'Acquisition funnel for a sharing feature has two sides: the creator and the viewer who finds Pinterest via the shared link',
      'What is the North Star metric for this feature? How does it connect to Pinterest\'s overall growth?'
    ],
    modelAnswer: {
      approach: 'Map user journey → define events per touchpoint → specify properties → metrics definition → QA plan',
      answer: 'User journey: (1) User discovers Collections feature → (2) Creates a collection → (3) Adds pins → (4) Shares the URL → (5) Recipient views collection → (6) Recipient signs up or saves a pin. Events: collection_feature_discovered { surface: onboarding|feed|profile, user_id }, collection_created { user_id, collection_id, pin_count }, collection_shared { user_id, collection_id, share_channel: link|social|email }, collection_viewed { collection_id, viewer_user_id (nullable if anonymous), referrer: direct|social|email|search }, collection_pin_saved { collection_id, pin_id, viewer_user_id }, new_user_signup_from_collection { collection_id, referrer_channel }. Key properties on all events: platform, app_version, timestamp, session_id. Metrics: Collection creation rate (creators / eligible users), Share rate (shares / collections created), Viral coefficient (new signups from shares / shares sent), Pin save rate from shared collections. North Star connection: new signups from Collections → retained users → saves → creator flywheel. QA: manually create a collection and walk through all steps on iOS, Android, and web; verify each event fires in the debug view; check that collection_id is consistent across all downstream events.',
      keyInsights: [
        'Two-sided features (creator and viewer) require tracking both sides of the funnel separately',
        'collection_id must be a join key on all events so you can trace virality: share → view → signup',
        'Viral coefficient (new signups / shares) is the acquisition metric unique to sharing features'
      ]
    },
    leadershipNote: 'This is also a privacy design moment: the viewer\'s collection_viewed event includes anonymous viewers. You must ensure anonymous viewer data is not joined to signed-in activity without consent. At staff level, you\'d review this with the privacy team before shipping.',
    failureMode: {
      weakAnswer: 'The candidate defines events for the creator side only — collection_created, collection_shared — and ignores the viewer side entirely. They define viral coefficient vaguely as "shares that resulted in signups" but have no event to actually measure the link between a specific share and a downstream signup.',
      interviewerFollowUp: '"A user shares a collection URL and three people sign up for Pinterest in the next week. How does your tracking plan tell you those three signups came from that specific share — what event, what property, and what join does that require?"',
    },
    keyTakeaways: [
      'Two-sided features require events on both creator and viewer journeys — track the full viral loop',
      'A join key (collection_id) threading through all events enables tracing from share to signup to engagement'
    ],
    playbookLinks: []
  },
  {
    id: 'inst08',
    title: 'Instrumentation Debt Audit',
    subtitle: 'Triage a legacy tracking system with 300+ broken events',
    difficulty: 'staff',
    isFree: false,
    domain: 'data-quality',
    company: 'HubSpot',
    estimatedMin: 35,
    tags: ['technical-debt', 'instrumentation-audit', 'data-quality', 'prioritization'],
    situation: 'HubSpot acquired a startup 18 months ago. The acquired product has 300+ event types, but an audit reveals: 40% have schema inconsistencies (different properties in different client versions), 25% haven\'t fired in 6 months (dead events), 15% have duplicate semantics (signup_completed and user_registered track the same action), and 20% are undocumented. The data team is spending 30% of their time fielding questions about what these events mean.',
    question: 'How do you triage and remediate 300+ broken events? Define your prioritization framework and the steps you take over a 6-month remediation.',
    hints: [
      'Not all 300 events need fixing — what is the business impact of each broken event?',
      'Fixing events that nobody uses is a low-value activity — start with usage data',
      'The organizational work (getting engineers to update tracking) is harder than the technical work'
    ],
    modelAnswer: {
      approach: 'Usage audit → impact triage → remediation sprints → governance to prevent recurrence',
      answer: 'Month 1: Usage audit. Pull query frequency for all 300 events over last 6 months. Categorize: Tier 1 (queried >10x/month, business-critical: ~20 events), Tier 2 (queried 1-10x/month: ~80 events), Tier 3 (never queried: ~200 events). For Tier 3: schedule deprecation after 30-day notice. Do not fix what nobody uses. Month 2-3: Tier 1 remediation. For each Tier 1 event: (1) document the intended semantic in the event registry; (2) identify all client versions with schema inconsistencies; (3) add a schema validation layer that normalizes inconsistent payloads or flags them; (4) contact engineering teams to fix inconsistencies in next sprint. Merge duplicate events (signup_completed and user_registered → account_created with a migration note). Month 4-5: Tier 2 remediation. Lower-touch: add documentation and flag inconsistencies without necessarily fixing client code. Month 6: Governance. Introduce event registry with required fields: owner, semantic definition, example payload, linked dashboard. All new events require registry entry before shipping. Dead event cleanup becomes quarterly instead of ad hoc.',
      keyInsights: [
        'Usage-based triage (Tier 1/2/3 by query frequency) prevents wasting 6 months fixing events nobody uses',
        'Deprecate dead events proactively — having 300 events in the system when 200 are dead creates permanent confusion',
        'Governance (event registry with ownership) prevents instrumentation debt from accruing again after remediation'
      ]
    },
    leadershipNote: 'The 30% of data team time spent answering event questions is the business case for this project. At director level, frame it as: we are going to reclaim 30% of the data team\'s capacity by investing 6 months in cleanup and governance. That\'s the ROI argument. Instrumentation debt is invisible until you measure the cost.',
    failureMode: {
      weakAnswer: 'The candidate proposes fixing all 300 events simultaneously over 6 months, without any triage by usage or business impact. They spend equal time on events nobody queries as on business-critical ones. They frame the whole project as a documentation effort and never address the organizational challenge of getting engineers to update client code.',
      interviewerFollowUp: '"You have 6 months and 2 engineers. Of your 300 events, 200 have not been queried in 6 months. What is the first thing you do, and what percentage of the events do you never touch?"',
    },
    keyTakeaways: [
      'Triage by query frequency — fix Tier 1 (business-critical, heavily used) events first, deprecate unused events',
      'An event registry with mandatory ownership is the governance mechanism that prevents instrumentation debt from recurring'
    ],
    playbookLinks: []
  },
  {
    id: 'inst09',
    title: 'dbt Data Lineage Audit',
    subtitle: 'A source rename breaks 47 dashboards at 2am — respond and prevent recurrence',
    difficulty: 'senior',
    isFree: false,
    domain: 'data-lineage',
    company: 'dbt Labs (internal)',
    estimatedMin: 22,
    tags: ['dbt', 'data lineage', 'dependency graph', 'breaking changes', 'schema migration'],
    situation: 'Your team runs 340 dbt models. A data engineer renames a source table from raw.events to raw.product_events to align with a new naming convention. Twelve hours later, 47 downstream dashboards show NULL values. The on-call engineer pages you at 2am.',
    question: 'Walk through your incident response and remediation. What should have prevented this? What governance change do you make after the incident?',
    hints: [
      'Start with immediate mitigation — what do you do in the first 30 minutes to stop the bleeding?',
      'dbt has a dependency graph — how do you use it to scope impact?',
      'Preventing this in the future requires both a technical safeguard and a process change.'
    ],
    modelAnswer: {
      approach: 'Immediate mitigation → scope impact via dependency graph → root cause analysis → post-incident governance',
      answer: 'Immediate response (0-30 min): check dbt run logs to confirm the source rename caused the failure. Run dbt ls --select raw.product_events+ to list all downstream models. Identify the 47 affected dashboards by tracing to the marts/reports layer. Immediate fix: create a view raw.events pointing to raw.product_events as a compatibility shim. This restores all downstream without any model changes. Re-run affected models. Escalation: post incident in #data-oncall with impact scope and ETA. Root cause: source rename without updating all upstream refs. The dbt ref() macro tracks model-to-model dependencies but source() references to raw tables are not automatically updated by renames. Remediation after incident: (1) Add a source freshness test AND a schema contract test to all sources — dbt source freshness + dbt test --select source:raw in CI before any source changes. (2) Enforce a source rename protocol: create the new source first, run both in parallel for 2 weeks, migrate models, then deprecate old source. (3) Add dbt compile + dbt test to the data warehouse migration PR checklist. (4) Post-incident review (blameless): the engineer followed naming convention guidance with no awareness of downstream impact — the gap was missing tooling, not human error.',
      keyInsights: [
        'Source renames in dbt break all downstream source() references — unlike ref(), there is no automatic dependency tracking update',
        'Compatibility shims (views pointing to new names) are the fastest mitigation with zero downstream changes required',
        'CI enforcement of dbt test --select source:* before any warehouse schema change prevents the 2am page'
      ]
    },
    leadershipNote: 'A staff analytics engineer would have shipped source contracts (dbt 1.5+ contracts: block) on all production sources, making breaking changes fail at CI rather than at 2am. The 2am page is a CI gap, not a human error.',
    failureMode: {
      weakAnswer: 'The candidate\'s incident response is to update the dbt source() reference in the YAML file and re-run all 340 models overnight. They treat the fix as a simple find-and-replace and ignore that the dashboards need restoring immediately. They miss the compatibility shim approach and have no governance recommendation beyond "add a comment in the PR."',
      interviewerFollowUp: '"It\'s 2:05am. The dashboards have been broken for 12 hours. Updating the dbt YAML and re-running 340 models will take 4 more hours. What do you do in the next 10 minutes to restore dashboard access before the full re-run completes?"',
    },
    keyTakeaways: [
      'dbt source renames break all downstream refs — create compatibility views as immediate mitigation',
      'CI must include dbt test --select source:* before any warehouse schema migration',
      'Source rename protocol (parallel run → migrate → deprecate) prevents recurrence'
    ],
    playbookLinks: []
  },
  {
    id: 'inst10',
    title: 'Tracking Plan for a Mobile Feature Launch',
    subtitle: 'Instrument a new iOS feature with cannibalization guards and A/B test support',
    difficulty: 'junior',
    isFree: false,
    domain: 'measurement-plan',
    company: 'Instagram',
    estimatedMin: 18,
    tags: ['mobile tracking', 'tracking plan', 'iOS', 'event properties', 'A/B test instrumentation'],
    situation: 'Instagram is launching a new Close Friends Story feature on iOS next sprint. The PM asks you to write the tracking plan. The feature lets users create a Story visible only to a curated Close Friends list. You need to track feature adoption, engagement depth, and whether the feature cannibalizes regular Story posts.',
    question: 'Write the full tracking plan: events, properties, success metrics, and cannibalization guard.',
    hints: [
      'Map the user journey first — what actions can a user take with this feature?',
      'Cannibalization requires comparing close_friends_story_created vs regular_story_created rates for the same users pre/post launch.',
      'Mobile tracking has constraints: events must be batched efficiently to save battery; property cardinality must stay low.'
    ],
    modelAnswer: {
      approach: 'Map user journey → define events per step → specify low-cardinality properties → cannibalization measurement design',
      answer: 'User journey: discover feature → create close friends list (if new) → post close friends story → friends view story → sender sees who viewed. Events: (1) close_friends_list_created { user_id, list_size, platform: ios }. (2) close_friends_story_posted { user_id, media_type: photo|video, duration_sec, list_size_bucket: 1-5|6-20|21+ }. (3) close_friends_story_viewed { viewer_id, poster_id, media_type, view_duration_sec, viewed_from: feed|direct_open }. (4) close_friends_story_replied { viewer_id, poster_id, reply_type: text|reaction }. Success metrics: (1) Adoption: % of active users who post at least one CFS in first 30 days. (2) Engagement depth: replies per CFS post vs regular story post. (3) Retention: D30 retention of users who adopted CFS vs matched non-adopters. Cannibalization guard: compare story_posted rate for the same users in the 30 days pre-launch vs 30 days post-launch. If CFS users post fewer regular stories, segment by list_size_bucket — users with small close friends lists may truly substitute, large list users likely do not. Property design: list_size_bucket (not raw list_size) to control cardinality on mobile. No PII in properties.',
      keyInsights: [
        'Mobile event schemas need bucketed properties (not raw counts) to control cardinality',
        'Cannibalization measurement requires pre/post comparison on the same users, not just cross-sectional',
        'Engagement depth (replies per post) is a better signal than raw view counts for feature quality'
      ]
    },
    leadershipNote: 'A staff analytics engineer would instrument this with a feature flag segment — all events carry a feature_flag_variant property so the tracking plan doubles as A/B test instrumentation from day one. No retroactive joins needed.',
    failureMode: {
      weakAnswer: 'The candidate defines events but uses raw numeric properties for list_size on mobile (e.g., list_size: 247) instead of bucketing, and forgets to link the cannibalization guard to the same user over time. Their cannibalization measurement compares aggregate post rates before and after launch rather than tracking the same users pre- and post-adoption.',
      interviewerFollowUp: '"Your cannibalization analysis shows that total regular Story posts dropped 8% after Close Friends launched. But you haven\'t controlled for who adopted Close Friends. How do you separate \'Close Friends caused substitution\' from \'regular Story usage happened to drop for unrelated reasons that week\'?"',
    },
    keyTakeaways: [
      'Mobile tracking plans need low-cardinality properties (buckets, not raw numbers)',
      'Cannibalization measurement = pre/post same-user comparison, not aggregate comparison',
      'Instrument feature flag variant in all events from launch day — enables A/B analysis without retroactive joins'
    ],
    playbookLinks: []
  },
  {
    id: 'inst11',
    title: 'Schema Migration Without Downtime',
    subtitle: 'Migrate 800 consumers to a new event schema using Expand-Contract',
    difficulty: 'staff',
    isFree: false,
    domain: 'schema-migration',
    company: 'Stripe',
    estimatedMin: 25,
    tags: ['schema migration', 'backward compatibility', 'dual-write', 'versioning', 'zero-downtime'],
    situation: 'Stripe needs to add a payment_method_details JSON column to the payments event. Currently the event has flat fields: card_brand, card_last4, bank_name. The new schema nests all of these under payment_method_details.card.brand etc. 800 downstream consumers read the flat fields. You cannot take downtime. The migration must be backward compatible.',
    question: 'Design the zero-downtime schema migration strategy. What pattern do you use and what are the rollout phases?',
    hints: [
      'Zero-downtime schema migrations use a dual-write or expand-contract pattern.',
      'Consumers cannot be migrated all at once — your strategy must support both old and new schemas simultaneously.',
      'How do you know when it is safe to drop the old fields?'
    ],
    modelAnswer: {
      approach: 'Expand-Contract pattern → dual-write window → consumer migration tracking → field removal verification',
      answer: 'Use the Expand-Contract pattern (also called parallel writes). Phase 1 — Expand (Week 1-2): Add the new payment_method_details JSON column alongside existing flat columns. Update the event producer to write BOTH: flat fields (unchanged) AND new nested JSON. All 800 consumers continue reading flat fields — zero impact. Phase 2 — Migrate consumers (Weeks 3-8): Communicate deprecation schedule with 60-day notice. Provide a migration guide: card_brand → payment_method_details.card.brand. Track migration progress via a consumer registry (which teams have migrated). Flag: any consumer still reading deprecated fields after week 8 gets a page. Phase 3 — Contract (Week 9+): Once >95% of consumers have migrated (verified via field usage tracking in the data warehouse: SELECT COUNT(*) WHERE card_brand IS NOT NULL), stop writing the flat fields. Run both schemas in parallel for 2 more weeks with flat fields as NULL to catch any stragglers. Phase 4 — Remove (Week 12): Drop the deprecated columns. Key principle: never remove a column before all consumers have migrated. Track readership, not just writer status. The dual-write window (phases 1-3) is the migration runway — its length is determined by consumer migration velocity, not a fixed calendar.',
      keyInsights: [
        'Expand-Contract is the canonical zero-downtime migration pattern — add new fields, migrate consumers, then remove old fields',
        'Never remove fields before verifying zero readership in production queries',
        'Consumer migration tracking (field usage in DWH) is more reliable than self-reported we migrated'
      ]
    },
    leadershipNote: 'Staff engineers instrument field-level read tracking in the data warehouse from the start of the migration — not as an afterthought. Without it, you cannot know when it is safe to drop the old fields, and migrations drag on indefinitely.',
    failureMode: {
      weakAnswer: 'The candidate proposes versioning the event (payments_v2) and asking all 800 consumers to migrate to the new topic. They set a 30-day hard cutoff after which they delete payments_v1. No dual-write, no field usage tracking, no awareness that 800 consumers cannot all migrate in 30 days.',
      interviewerFollowUp: '"You told all 800 consumers to migrate to payments_v2 by day 30 and you\'ll delete v1 on day 31. It\'s day 31. You don\'t know how many consumers actually migrated. What breaks, how badly, and how would you have known when it was actually safe to drop v1 before cutting over?"',
    },
    keyTakeaways: [
      'Expand-Contract pattern = add new fields → dual-write → migrate consumers → remove old fields',
      'Never drop a field based on "we told them to migrate" — verify zero reads in production',
      'Migration runway length is set by consumer velocity, not a calendar'
    ],
    playbookLinks: []
  },
  {
    id: 'inst12',
    title: 'PII in the Event Stream',
    subtitle: 'Contain an accidental PII leak and build governance to prevent recurrence',
    difficulty: 'senior',
    isFree: false,
    domain: 'data-governance',
    company: 'Lyft',
    estimatedMin: 20,
    tags: ['PII', 'data privacy', 'GDPR', 'event stream', 'data governance', 'anonymization'],
    situation: 'A Lyft engineer accidentally logged driver_phone_number and passenger_email as event properties in a ride_completed event that fires to the main analytics event stream. The events have been in production for 3 weeks, ingested into Snowflake, and replicated to 12 downstream tables used by 40+ analysts. A privacy review flags it.',
    question: 'What is your immediate response, remediation plan, and long-term governance change to prevent PII leakage into the event stream?',
    hints: [
      'Immediate containment first — stop new PII from flowing before remediating what already exists.',
      'GDPR/CCPA require deletion of PII within specific timeframes — your remediation must be compliant.',
      'Technical controls (not just policy) prevent recurrence.'
    ],
    modelAnswer: {
      approach: 'Immediate containment → identify all affected sinks → compliant deletion → technical prevention at ingestion layer',
      answer: 'Immediate (0-4 hours): (1) Remove PII fields from the event producer — deploy a hotfix that strips driver_phone_number and passenger_email from the event before emission. (2) Revoke analyst access to the affected Snowflake tables containing the PII rows. (3) Page the privacy/legal team — this may be a notifiable breach depending on jurisdiction and data sensitivity. Remediation (Day 1-7): (1) Identify all tables containing the leaked PII: SELECT table_name FROM information_schema.columns WHERE column_name IN (\'driver_phone_number\', \'passenger_email\'). (2) Run UPDATE statements to NULL out the PII columns: UPDATE ride_completed_events SET driver_phone_number = NULL, passenger_email = NULL WHERE event_date >= [3 weeks ago]. (3) Verify deletion with row counts. (4) Check Snowflake Time Travel — PII may persist in historical snapshots; disable time travel on affected tables or wait for retention window to expire. (5) Check if data was exported to S3, GCS, or third-party tools (BI tools, Amplitude, etc.) — each integration needs a separate deletion request. Governance (ongoing): (1) PII classifier in the event validation layer — before any event is ingested, run a regex + ML classifier against all string properties to flag potential PII (email patterns, phone patterns, SSN patterns). Reject events with PII at ingestion, not downstream. (2) Event schema registry: all new event schemas require a privacy review before shipping. (3) Annual PII audit of all analytics tables.',
      keyInsights: [
        'PII remediation has three phases: stop new leakage (producer fix), contain existing leakage (access revocation + deletion), verify completeness (check all downstream sinks including Time Travel and third-party exports)',
        'Technical controls at ingestion (PII classifier) are the only reliable prevention — policy alone fails because engineers make mistakes',
        'Deletion is not complete until verified in every downstream system including DWH snapshots and third-party exports'
      ]
    },
    leadershipNote: 'Staff-level data governance means shipping the PII classifier as infrastructure, not as a policy document. The policy says don\'t log PII; the classifier makes it technically impossible to accidentally log PII by rejecting non-compliant events at the ingestion layer before they reach Snowflake.',
    failureMode: {
      weakAnswer: 'The candidate removes the PII fields from the event producer and considers the incident resolved. They don\'t check Snowflake Time Travel, don\'t audit third-party exports to BI tools or Amplitude, and never contact the privacy/legal team. Their governance recommendation is to "add PII to the code review checklist."',
      interviewerFollowUp: '"You\'ve deployed the producer fix and run UPDATE to NULL the columns in Snowflake. The privacy team asks: \'Can you confirm that driver_phone_number is no longer accessible by any Lyft system or third-party tool?\' What is the complete list of systems you need to check before you can say yes?"',
    },
    keyTakeaways: [
      'PII breach response: stop producer → revoke access → delete from all sinks (including Time Travel and third-party exports)',
      'Deletion is not complete until verified in every downstream system',
      'Technical controls (PII classifier at ingestion) prevent recurrence; policy alone does not'
    ],
    playbookLinks: []
  },
  {
    id: 'inst13',
    title: 'Naming a Family of Related Events',
    subtitle: 'One event with a property, or many events? The choice you can\'t undo cheaply',
    difficulty: 'senior',
    isFree: false,
    domain: 'event-taxonomy',
    company: 'Figma',
    estimatedMin: 22,
    tags: ['event-taxonomy', 'naming-convention', 'schema-design', 'event-granularity'],
    situation: 'Figma is instrumenting the toolbar. A designer can pick the rectangle tool, the pen tool, the text tool, the frame tool, and 11 others. The engineer proposes 15 events: rectangle_tool_selected, pen_tool_selected, text_tool_selected, and so on. Another engineer proposes a single tool_selected event with a tool_name property. The team is split and wants your ruling before they ship — and the toolbar will grow to ~40 tools within a year.',
    question: 'One generic event with a property, or one event per tool? Give your ruling and the rule you\'d apply to the next team that asks this question.',
    hints: [
      'Ask what changes when a new tool is added. With 15 named events, each new tool needs a code change AND a taxonomy review. With one event + property, a new tool is just a new property value.',
      'Think about how each design queries: do analysts want "how often is the pen tool used" (one tool) or "tool usage distribution" (across tools)? Properties make cross-tool analysis a GROUP BY; named events make it a UNION.',
      'When does the property approach break down? If different tools need wildly different properties, or if some tools are conversion events with their own funnels, separate events may earn their keep.'
    ],
    modelAnswer: {
      approach: 'State the default rule → apply it here → name the exception → set the governance principle',
      answer: 'Ruling: one event, tool_selected { tool_name, tool_category, canvas_id, platform }. The decisive test: a generic event with a property is correct when the actions are the same verb applied to interchangeable objects, and the analysis you want is the distribution across those objects. Selecting the pen vs the rectangle is the same action (tool_selected) on an interchangeable object (tool_name). Every analyst question — usage distribution, most/least used tools, tool adoption over time — becomes a GROUP BY tool_name, which is trivial. With 15 (soon 40) named events, the same question is a 40-way UNION that breaks every time a tool is added, and adding a tool requires a taxonomy PR instead of passing a new enum value. The property approach also keeps the event count flat as the toolbar grows. The exception, and the rule for the next team: split into separate events when (1) the events carry materially different properties (e.g., text_tool_selected needs font/size that no other tool has — though even then, additive nullable properties on one event usually win), or (2) one variant is a distinct conversion/funnel step that will be referenced independently in dashboards and alerts (e.g., if the pen tool gated a paywall, pen_tool_selected might warrant its own event). Governance principle: default to generic-event-plus-property; require a written justification to split. The cost of a wrong split (event sprawl, broken cross-cuts) is paid forever; the cost of a wrong merge (one over-broad event) is recoverable by adding a property.',
      keyInsights: [
        'Generic-event-plus-property is the default when the action is one verb over interchangeable objects and you want the cross-object distribution',
        'A new variant should cost a new property value, not a new event plus a taxonomy review — that test alone usually settles the debate',
        'Splitting is justified only when variants carry materially different properties or one is an independently-referenced funnel step'
      ]
    },
    leadershipNote: 'At staff level you publish this as a taxonomy rule so it is decided once, not re-litigated per feature: "Use one event with a discriminator property unless a variant has distinct properties or its own funnel." The failure mode you are preventing is event-count explosion — a product with 4,000 events nobody can navigate, born from a thousand small per-variant decisions that each seemed reasonable.',
    failureMode: {
      weakAnswer: 'The candidate picks one event per tool because "it is more explicit and easier to find in the dashboard," without reasoning about how the toolbar grows, how analysts query across tools, or the maintenance cost of a taxonomy PR per new tool. They optimize for the demo-day dashboard, not the system in a year.',
      interviewerFollowUp: '"Next quarter the team ships 12 new tools and a PM asks for tool-usage share across all 27 tools, broken out by platform. Walk me through the exact query under your design — and what a teammate has to do to add the 28th tool."',
    },
    keyTakeaways: [
      'Default to one event + discriminator property when the action is one verb over interchangeable objects',
      'The test: a new variant should cost a property value, not a new event and a taxonomy review',
      'Split only for materially different properties or an independently-referenced funnel step'
    ],
    playbookLinks: []
  },
  {
    id: 'inst14',
    title: 'The Double-Counted Conversion',
    subtitle: 'Retries and a missing idempotency key are inflating your purchase numbers',
    difficulty: 'senior',
    isFree: false,
    domain: 'data-quality',
    company: 'DoorDash',
    estimatedMin: 24,
    tags: ['idempotency', 'event-dedup', 'retries', 'data-quality', 'client-side'],
    situation: 'DoorDash\'s order_placed event fires from the client when the user taps "Place Order." Finance reconciles revenue against the payments ledger and finds analytics reports 4.2% more orders than the ledger. The gap is largest on Android and on flaky-network days. The analytics team initially blames the ledger. You suspect the event.',
    question: 'What is causing the 4.2% overcount, and how do you make order_placed countable exactly once — without losing the events you legitimately need?',
    hints: [
      'Why would the gap be worse on Android and on flaky-network days? What does a client SDK do when it isn\'t sure the event was delivered?',
      'An event can be emitted once by intent but ingested multiple times by the pipeline. Which layer should own "count this once"?',
      'Idempotency needs a stable key generated at the moment of the user action — not at ingestion time. Where does that key come from?'
    ],
    modelAnswer: {
      approach: 'Locate the duplication mechanism → assign an idempotency key at the source → dedup at ingestion → backfill historical counts',
      answer: 'Mechanism: client SDKs retry event delivery when they do not receive an ack. On flaky networks (worse on Android with aggressive battery/network management), the event reaches the server, the ack is lost, and the SDK resends the same order_placed — so the pipeline ingests it 2+ times. There may also be UI double-taps if the button is not disabled on first tap. Both produce duplicate rows for a single real order. Fix, in layers: (1) Source-side idempotency key. Generate a client_event_id (UUID) at the moment the user taps Place Order, and attach the order_id (the real business key) to the event. The client_event_id is identical across retries of the same emission; order_id is identical across both retries and accidental double-taps. (2) Dedup at ingestion. The pipeline deduplicates on (order_id) for counting orders, keeping the earliest event. Keep all raw rows in a staging table but expose a deduplicated view to analysts and finance. Dedup at ingestion, not in every downstream query — otherwise every analyst re-implements it inconsistently. (3) Disable the button on first tap and emit on the server\'s order-confirmation response where possible (see the client-vs-server tradeoff: a purchase is a money event that should ultimately be trusted from the server). (4) Backfill: re-aggregate historical order counts using the dedup-on-order_id view so past dashboards reconcile with the ledger; annotate the correction. Validation: after the fix, the analytics-vs-ledger gap should fall to near zero; monitor it as an ongoing data-quality check.',
      keyInsights: [
        'At-least-once delivery (SDK retries on lost acks) means events arrive 1+ times — counting exactly once is the consumer\'s job, via an idempotency key',
        'The dedup key must be the stable business key (order_id) generated at the action, not a row id assigned at ingestion',
        'Deduplicate once at ingestion and expose a clean view — never leave each analyst to dedup in their own query'
      ]
    },
    leadershipNote: 'A staff data engineer treats every money or conversion event as at-least-once by default and bakes idempotency into the contract: each carries a business key, ingestion dedups, and a daily analytics-vs-ledger reconciliation alerts when the gap exceeds a threshold. The lesson for the org: "the ledger is wrong" is almost never the answer when your counts are higher than the system of record.',
    failureMode: {
      weakAnswer: 'The candidate adds a SELECT DISTINCT in the one dashboard finance complained about and calls it fixed. They do not add a stable idempotency key, do not dedup at ingestion, leave every other consumer double-counting, and never address the retry behavior or the double-tap — so the overcount returns in the next report that doesn\'t happen to use DISTINCT.',
      interviewerFollowUp: '"You said you\'ll deduplicate. On what key, generated where and when? Walk me through what happens to that key when (a) the SDK retries after a lost ack and (b) the user double-taps Place Order on a frozen screen."',
    },
    keyTakeaways: [
      'Assume at-least-once delivery: events can arrive multiple times, so counting once requires an idempotency key',
      'Dedup on the stable business key (order_id) generated at the user action, once at ingestion',
      'Reconcile conversion events against the system-of-record ledger as a standing data-quality check'
    ],
    playbookLinks: []
  },
  {
    id: 'inst15',
    title: 'The Funnel With a Phantom Step',
    subtitle: 'Step 2 has higher conversion than step 1 — a fire order bug, not a miracle',
    difficulty: 'junior',
    isFree: false,
    domain: 'data-quality',
    company: 'Coursera',
    estimatedMin: 18,
    tags: ['funnel-instrumentation', 'double-fire', 'event-ordering', 'data-quality', 'qa'],
    situation: 'Coursera\'s enrollment funnel dashboard shows: course_page_viewed 100,000 → enroll_clicked 38,000 → payment_step_viewed 41,000 → payment_completed 22,000. A PM is excited that payment_step_viewed (41,000) is higher than enroll_clicked (38,000) and concludes the payment page is "magnetically converting." You are asked to confirm before this goes in the board deck.',
    question: 'A step in a linear funnel has more events than the step before it. What are the possible causes, and how do you determine which one is happening here?',
    hints: [
      'In a strictly linear funnel, a later step can never legitimately exceed an earlier step for the same population. So either the funnel is not linear, or one event is firing wrong.',
      'Two common bugs: the later event double-fires (e.g., on every render or re-render), or the earlier event under-fires (it misses some users who still proceed).',
      'You can\'t diagnose this from step totals alone. What do you need to count per user to tell double-fire from under-fire?'
    ],
    modelAnswer: {
      approach: 'Reject the surface read → enumerate the two failure classes → diagnose per-user, not per-total → fix and re-validate',
      answer: 'First, reject the conclusion: in a linear funnel where payment_step_viewed requires passing enroll_clicked, a later step exceeding an earlier one is structurally impossible for the same users — it is a tracking bug, not a magnetic page. Two failure classes: (A) payment_step_viewed double-fires — e.g., it is bound to a component render/re-render or a route that mounts twice (React StrictMode, a redirect bounce, a back-then-forward navigation), so one user generates 1.5 events on average. (B) enroll_clicked under-fires — e.g., it is on a click handler that misses users who reach payment via a deep link, a "resume enrollment" path, or a different entry point that skips the enroll button, so real users reach payment without ever logging enroll_clicked. Diagnosis (the key move): stop looking at step totals and count events per user. Run COUNT(*) per user_id for payment_step_viewed: if many users have 2+, it is double-fire (A). Then check users who have payment_step_viewed but no enroll_clicked: if there is a large set, there is an alternate entry path causing under-fire (B). Often both exist. Inspect the firing trigger in code — is payment_step_viewed on mount of a component that remounts? Is enroll_clicked the only path into payment? Fix: bind payment_step_viewed to a single, idempotent page-view (fire once per session-step, dedup on session_id + step), and ensure enroll_clicked (or a unified enrollment_started event) covers every entry into the payment flow. Re-validate by walking all known entry paths and confirming monotonic, non-increasing step counts. Do not put the 41,000 number in the board deck.',
      keyInsights: [
        'A later funnel step exceeding an earlier one in a linear flow is structurally impossible for the same users — it is always a fire-order or fire-count bug',
        'Step totals can\'t distinguish double-fire from under-fire; counting events per user (and finding step-2-without-step-1 users) can',
        'Fixes are symmetric: make the inflated event fire exactly once, and make the deflated event cover every real entry path'
      ]
    },
    leadershipNote: 'A senior analyst builds a standing funnel-integrity check: every funnel dashboard runs an assertion that each step count is less than or equal to the prior step, and flags violations before a human reads the chart. The PM\'s excitement here is the tell — when a number looks too good and violates a structural invariant, the instrumentation is the first suspect, not the product.',
    failureMode: {
      weakAnswer: 'The candidate accepts the framing and tries to explain why the payment page converts so well, or quietly "normalizes" by capping payment_step_viewed at enroll_clicked. They never count events per user, never look for step-2-without-step-1 users, and never inspect the firing trigger — so the underlying double-fire keeps poisoning every other metric built on that event.',
      interviewerFollowUp: '"You suspect payment_step_viewed double-fires. Write the check that proves it, and the separate check that would instead point to enroll_clicked under-firing. What does each result look like, and what do you do in each case?"',
    },
    keyTakeaways: [
      'In a linear funnel, a later step can never legitimately exceed an earlier step — it signals a double-fire or under-fire bug',
      'Diagnose by counting events per user and finding step-2-without-step-1 users, not by reading step totals',
      'Validate funnels with a monotonic non-increasing assertion before trusting any conversion read'
    ],
    playbookLinks: []
  },
  {
    id: 'inst16',
    title: 'Stitching the Anonymous-to-Signed-In Identity',
    subtitle: 'Half your signups look like they have no marketing source. They do',
    difficulty: 'senior',
    isFree: false,
    domain: 'identity-resolution',
    company: 'Canva',
    estimatedMin: 26,
    tags: ['identity-stitching', 'anonymous-id', 'attribution', 'cross-device', 'aliasing'],
    situation: 'Canva\'s growth team reports that 48% of new signups show acquisition_source = direct/none. Marketing insists their paid campaigns drive far more than the dashboard credits. You discover that pre-signup activity is tracked under an anonymous_id and post-signup activity under user_id, and the two are never linked. The campaign click and the landing-page session live under the anonymous identity; the signup and everything after lives under the user identity.',
    question: 'Design the identity stitching so pre-signup (anonymous) activity is correctly attributed to the user after they sign up — across the same device and across devices. What are the hard cases?',
    hints: [
      'The core operation is an alias/merge: when a user signs up, you must tie their new user_id to the anonymous_id that was active just before. Where and when do you capture that link?',
      'Same-device stitching is the easy 80%. The hard cases are cross-device (clicked the ad on mobile, signed up on desktop) and shared devices (a family laptop where two people sign up under one anonymous_id).',
      'Retroactive vs forward stitching: do you rewrite historical anonymous events to the user_id, or keep a mapping table and join at query time? Each has tradeoffs.'
    ],
    modelAnswer: {
      approach: 'Capture the alias at the identify moment → choose a stitching model → handle cross-device and shared-device → fix attribution and backfill',
      answer: 'The fix is an identify/alias step. (1) Capture the link at signup: at the moment of signup (and login), emit an identify call that carries both the current anonymous_id and the new user_id, persisting the mapping in an identity graph (anonymous_id -> user_id, with first-seen timestamp). This is the canonical operation analytics SDKs call alias/identify. The campaign click and landing session, tagged with that anonymous_id, now resolve to the user. (2) Stitching model: prefer a mapping-table + query-time resolution over destructively rewriting historical rows. Keep raw events immutable; resolve identity in the modeling layer by joining events to the identity graph and coalescing to a canonical_user_id. This lets you re-run stitching when the graph improves and avoids irreversible rewrites. (3) Attribution: with stitching, first-touch (the campaign click under the anonymous_id) flows to the user, so direct/none collapses toward the true paid share. Decide and document the attribution window (e.g., last anonymous_id active within 30 days pre-signup). (4) Hard cases. Cross-device: mobile-click + desktop-signup leaves two anonymous_ids with no shared device link; stitch them via a deterministic key when available (logged-in on both, or a shared email from a magic link) and accept that probabilistic device matching is lossy and privacy-sensitive — be conservative. Shared device: two people sign up under one anonymous_id; do not blindly merge all anonymous history into both users — cap the alias to the session(s) leading to each signup, and break the anonymous_id association after an identify so the next person starts clean. (5) Backfill: re-resolve historical signups through the identity graph to correct the 48% direct/none, and report the corrected paid share with a note on method. Validation: after stitching, the share of signups with a known first-touch source should jump materially; sanity-check against campaign platform click counts.',
      keyInsights: [
        'Identity stitching hinges on capturing the anonymous_id -> user_id alias at the identify moment (signup/login) — without it, pre-signup attribution is permanently lost',
        'Resolve identity at the modeling layer via an identity graph + query-time join, not by destructively rewriting raw events — so you can re-stitch as the graph improves',
        'Cross-device and shared-device are the lossy, judgment-heavy cases: prefer deterministic links, be conservative with probabilistic merges, and don\'t bleed one person\'s history into another'
      ]
    },
    leadershipNote: 'At staff level you own the identity graph as shared infrastructure, not a per-team hack, because attribution, retention cohorts, and experiment assignment all depend on a single canonical_user_id. The shared-device merge is also a privacy boundary: over-merging can attach one person\'s behavior to another\'s account, which is both an analytics bug and a trust violation. Set the policy deliberately.',
    failureMode: {
      weakAnswer: 'The candidate says "just use user_id everywhere" or rewrites all anonymous events to the first user who signs up on that device, ignoring that pre-signup users have no user_id yet, that cross-device clicks never share a device, and that shared devices will cross-contaminate identities. They produce a stitch that looks complete but silently mis-attributes shared-device and cross-device users.',
      interviewerFollowUp: '"A user clicks your Instagram ad on their phone, does nothing, then signs up on their work laptop two days later. There is no shared device id and no login on the phone. Does your design attribute that signup to the Instagram campaign? Walk me through exactly what links the two sessions — or honestly tell me it can\'t."',
    },
    keyTakeaways: [
      'Stitch identity by aliasing anonymous_id to user_id at the signup/login moment and storing it in an identity graph',
      'Resolve to a canonical_user_id at query time over an immutable event log — re-stitchable, non-destructive',
      'Cross-device and shared-device are lossy: prefer deterministic keys, stay conservative, and protect the privacy boundary'
    ],
    playbookLinks: []
  },
  {
    id: 'inst17',
    title: 'Client-Side or Server-Side for the Purchase Event',
    subtitle: 'The same conversion, two places to fire it, very different failure modes',
    difficulty: 'senior',
    isFree: false,
    domain: 'instrumentation-architecture',
    company: 'Booking.com',
    estimatedMin: 24,
    tags: ['client-side', 'server-side', 'event-tradeoffs', 'reliability', 'attribution'],
    situation: 'Booking.com is re-instrumenting its booking_confirmed event. Today it fires client-side from the confirmation page. The data team notices booking_confirmed undercounts vs the reservations database by ~6%, concentrated on mobile web and ad-blocked sessions. A proposal is on the table to move it fully server-side. The marketing team objects: they need this event client-side for ad-platform conversion pixels and on-page UX.',
    question: 'For booking_confirmed, when should the event be fired client-side, server-side, or both? Make the call and justify the architecture, naming the failure modes of each.',
    hints: [
      'Why does the client-side event undercount by 6% on mobile and ad-blocked sessions? What kills a client event before it reaches your pipeline?',
      'Server-side events are reliable and hard to block, but they lose client context (device, UI state, campaign params on the page) and can\'t fire ad pixels in the browser.',
      'This is not strictly either/or. What is the source of truth for "did a booking happen," and what is the client event uniquely good for?'
    ],
    modelAnswer: {
      approach: 'Diagnose the undercount → separate "source of truth" from "client context" → choose a hybrid with a single business key → reconcile',
      answer: 'Diagnose: client-side events are lost to ad blockers, browser tracking-prevention (ITP), network drops, and users closing the tab before the beacon sends — all heavier on mobile web, which explains the 6% mobile/ad-blocked skew. So the client event systematically undercounts a money event. Decision: fire server-side as the source of truth, and keep a client-side event for what only the client can do — but tie them with one business key. Reasoning: "did a booking happen and for how much" is a financial fact the server knows authoritatively when it writes the reservation; that event cannot be blocked, dropped, or spoofed by the client, so server-side booking_confirmed becomes the count of record and will reconcile with the reservations DB. However, server-side loses on-page context (which UI variant, scroll depth, campaign params present in the browser) and cannot fire in-browser ad-conversion pixels. So keep a client-side booking_confirmed_view (or use the ad platforms\' server-side conversion APIs where available) for marketing pixels and UX, explicitly understood to be lossy and not the count of record. Critically, both events carry the same reservation_id so they can be joined and deduplicated; analytics counts off the server event, marketing fires pixels off the client event, and nobody counts the same booking twice. Reconcile continuously: server booking_confirmed vs reservations DB should be ~100%; client vs server gap is your measure of client loss and a health signal. General rule for the org: money/state-change events (purchase, subscription, refund) are server-side source of truth; UI-intent and context events (clicks, views, scroll, page variant) are client-side; high-stakes events that need both get fired on both layers and stitched by a shared business key.',
      keyInsights: [
        'Money and state-change events belong server-side as the source of truth — client events are lossy to ad blockers, ITP, and tab-close on exactly the conversions that matter most',
        'Client-side is uniquely good at on-page context and firing ad pixels — keep it for those, explicitly as lossy and not the count of record',
        'When you fire both, give them the same business key so you can reconcile and dedup instead of double-counting'
      ]
    },
    leadershipNote: 'A staff engineer makes this a standing principle rather than a per-event debate: state changes are trusted from the server, intent and context from the client, and the two are joined on a shared key. The trap to avoid is letting marketing\'s legitimate need for a browser pixel dictate that the company counts revenue off a client event that an ad blocker can silently delete.',
    failureMode: {
      weakAnswer: 'The candidate moves everything server-side and tells marketing to "find another way to fire pixels," breaking ad-platform conversion tracking and losing on-page context — or keeps everything client-side and accepts the 6% undercount on a revenue event. Either way they treat it as binary and miss the hybrid with a shared reservation_id.',
      interviewerFollowUp: '"You fire booking_confirmed both client-side and server-side. A booking happens, the server event lands, but the client event is eaten by an ad blocker. Later both land for a different booking. How does your design make sure analytics counts each booking exactly once and marketing still fires its pixel where it can?"',
    },
    keyTakeaways: [
      'Fire money/state-change events server-side as the source of truth; they reconcile with the system of record and resist client loss',
      'Keep client-side events for on-page context and ad pixels — lossy by nature, not the count of record',
      'When firing both, share a business key so events reconcile and dedup rather than double-count'
    ],
    playbookLinks: []
  },
  {
    id: 'inst18',
    title: 'The Silent Pipeline Gap',
    subtitle: 'A schema change broke ingestion for two days. Do you backfill, and how?',
    difficulty: 'staff',
    isFree: false,
    domain: 'data-pipeline',
    company: 'Reddit',
    estimatedMin: 28,
    tags: ['etl', 'pipeline-breakage', 'backfill', 'data-quality', 'incident-response'],
    situation: 'Reddit ships a client update that adds a new required field to the comment_posted event. The ingestion pipeline\'s strict schema validation rejects every event missing the field — but the rejection is silent: bad events go to a dead-letter queue nobody monitors. Two days later, an analyst notices comment_posted volume looks low. 41 million events sit in the dead-letter queue. Dashboards, a weekly exec report, and a live experiment readout all consumed the gap.',
    question: 'Walk through detection, recovery, and the backfill decision. When is backfilling the right call, when is it not, and how do you avoid corrupting the experiment that ran during the gap?',
    hints: [
      'First, scope the blast radius: which downstream artifacts read the affected window, and which of them are already "decided"?',
      'A dead-letter queue means the data is recoverable — but reprocessing it changes history. What breaks when a number that was already reported suddenly changes?',
      'The live experiment is the sharp case: a 2-day gap that hit treatment and control unequally is different from one that hit them equally.'
    ],
    modelAnswer: {
      approach: 'Scope the gap → stop the bleeding → decide backfill per consumer → handle the experiment carefully → fix the silent-failure root cause',
      answer: 'Scope (first hour): quantify the gap — 41M events, exact start/end timestamps, and which fields/platforms are affected (only events missing the new field? all comment_posted? other events sharing the pipeline?). Map downstream consumers of the affected window: dashboards, the weekly exec report, the experiment readout, any ML features, any data already exported externally. Stop the bleeding: relax the validation so the new required field is treated as nullable/optional (a new field should almost never have been hard-required at ingestion), redeploy so live events flow again, and confirm the dead-letter queue stops growing. Backfill decision, per consumer: backfilling is right when the data is recoverable (it is — it\'s in the DLQ) and the corrected numbers are still actionable. Reprocess the 41M DLQ events through the fixed pipeline, deduping on event id so a replay can\'t double-count. For internal dashboards and not-yet-published reports: backfill and annotate the corrected window. For the weekly exec report that already shipped with the gap: do not silently rewrite history — issue a correction with the restated number and a one-line cause, so trust is preserved. For anything immutable or externally reported, restate explicitly rather than quietly mutate. The experiment (the sharp case): determine whether the gap hit treatment and control symmetrically. If comment_posted was suppressed equally in both arms, the relative effect may still be estimable after backfill, but power and any time-based analysis are compromised — backfill, then re-run the readout on complete data. If the missing field correlated with an arm (e.g., the client update rolled out unevenly), the gap is non-random across arms and the readout is contaminated; do not ship on it — backfill, validate balance, and extend or restart. Either way, never report the experiment off the gapped window. Root cause / prevention: the real bug is the silent dead-letter queue. Add DLQ depth monitoring with alerting (page if DLQ grows beyond a threshold), make new event fields additive-and-optional by contract, and add a volume-anomaly monitor on comment_posted so a 2-day drop pages in hours, not days.',
      keyInsights: [
        'A recoverable gap (events in a dead-letter queue) makes backfill the default — but reprocessing changes already-reported history, so restate openly rather than silently mutate published numbers',
        'Dedup on event id when replaying a DLQ, or the backfill double-counts on top of any events that did get through',
        'The experiment is the trap: a gap that hit arms equally may be salvageable after backfill; a gap correlated with an arm contaminates the readout — validate balance before trusting it'
      ]
    },
    leadershipNote: 'The headline lesson is not the schema change — it is that a pipeline failed silently for two days because the dead-letter queue had no monitoring. A staff engineer fixes the class of bug: new fields are additive/optional by contract so they can never hard-reject ingestion, DLQ depth is alerted, and every high-volume event has a volume-anomaly monitor. Silent failures are the most expensive kind because they corrupt decisions before anyone knows.',
    failureMode: {
      weakAnswer: 'The candidate reprocesses the dead-letter queue and overwrites the affected window everywhere, including silently rewriting the already-shipped exec report, and re-runs the experiment readout on the backfilled data without checking whether the gap hit treatment and control unequally. They fix the symptom, corrupt the experiment, and erode trust by changing a reported number with no correction note — and they never address the unmonitored DLQ that caused it.',
      interviewerFollowUp: '"The client update that added the required field rolled out to iOS first and Android a day later, and comment_posted is more common on Android. The experiment\'s arms had different iOS/Android mixes. After you backfill, is that experiment readout trustworthy? Walk me through how you\'d check, and what you do if it isn\'t."',
    },
    keyTakeaways: [
      'Backfill when data is recoverable and still actionable; dedup on event id when replaying a dead-letter queue',
      'Don\'t silently rewrite already-published numbers — restate with a correction note to preserve trust',
      'A pipeline gap can contaminate a live experiment if it hit arms unequally — validate arm balance before trusting the readout',
      'The root fix is monitoring the silent failure: alert on DLQ depth and event-volume anomalies, make new fields optional by contract'
    ],
    playbookLinks: []
  },
  {
    id: 'inst19',
    title: 'Validating a New Event Before You Trust It',
    subtitle: 'A new event went live yesterday. A VP wants the number today. Is it real?',
    difficulty: 'junior',
    isFree: false,
    domain: 'data-quality',
    company: 'Slack',
    estimatedMin: 18,
    tags: ['validation', 'qa', 'new-event', 'data-quality', 'sanity-checks'],
    situation: 'Slack shipped a new huddle_started event yesterday to measure adoption of audio huddles. This morning a VP saw a teammate mention it and asks for "huddle adoption numbers by lunch" for an all-hands. The event has been live for ~18 hours. You have never validated it. The PM is already drafting a slide that says "huddles adopted by 12% of workspaces."',
    question: 'Before this number goes in front of the company, what validation do you run on a brand-new event? Give the concrete checks and what each one would catch.',
    hints: [
      'A new event can be wrong in many ways: not firing at all, firing too much, firing on the wrong action, missing properties, or not arriving for all platforms yet.',
      'Some checks are about the event in isolation (is it well-formed?); others compare it against something you already trust (does its volume make sense?).',
      'What is the risk of putting an 18-hour-old, never-validated number in front of the whole company — and what is the honest thing to tell the VP?'
    ],
    modelAnswer: {
      approach: 'Run isolation checks → run cross-validation checks → check coverage/recency → decide what you can honestly say',
      answer: 'Validation battery before trusting huddle_started: (1) Is it firing at all and at a sane volume? Count events per hour since launch. Zero or near-zero means it is not wired up; implausibly high means it is double-firing or bound to a render. (2) Does it fire on the right action? Manually start a huddle in a test workspace and confirm exactly one event lands, with correct properties (workspace_id, user_id, platform, huddle_id), and confirm it does NOT fire on merely viewing the huddle button. One event per real action — no more, no less. (3) Property completeness: what fraction of events have each required property populated and non-null? A property that is 40% null breaks any segmentation. (4) Cross-validate volume against something trusted: compare huddle_started counts to an independent signal — server-side huddle session logs, or the count of distinct huddle_id values, or audio-infra connection counts. If analytics says 50k huddles but the media server saw 200k sessions, the event is undercounting. (5) Coverage by platform: is it live on web, iOS, AND Android, or only the platform that shipped first? An 18-hour-old event is often live on a subset — computing "adoption" off partial platform coverage understates it badly. (6) Recency/lag: confirm events are arriving with normal pipeline latency, not piling up delayed. (7) Denominator sanity: "12% of workspaces" — is the denominator all workspaces, or only eligible ones on a version that has the feature? Honest call: an 18-hour-old, never-validated event with likely-partial platform coverage is not safe for an all-hands number. Tell the VP exactly that: give a directional, clearly-caveated read ("early signal, web-only, first day"), not a precise 12% that will be quoted forever. The cost of a wrong number in an all-hands is that it gets repeated and you spend weeks walking it back.',
      keyInsights: [
        'Validate a new event in isolation (fires once, on the right action, with complete properties) AND against an independent trusted source before quoting it',
        'New events are usually live on a subset of platforms first — computing adoption off partial coverage silently understates the metric',
        'The honest move under time pressure is a clearly-caveated directional read, never a precise number that will be quoted forever from an unvalidated event'
      ]
    },
    leadershipNote: 'A senior analyst treats "can I trust this number" as a yes/no gate with a checklist, and is willing to tell a VP "not yet, here is a directional read instead." The reputational asymmetry is the point: a caveated estimate that holds up beats a precise number that gets retracted. Bake a new-event validation checklist into the launch process so this isn\'t improvised under pressure each time.',
    failureMode: {
      weakAnswer: 'The candidate queries huddle_started, sees a number, and hands over "12% of workspaces" because the query ran without errors. They don\'t check whether it fires once per real action, whether properties are populated, whether it\'s live on all platforms, or whether the volume reconciles with any independent source — so a web-only, partially-instrumented first-day number goes into the all-hands as fact.',
      interviewerFollowUp: '"You run the query and get 12%. Name three distinct ways that number could be wrong even though the query returned clean results — and the single fastest check for each before it goes on the slide."',
    },
    keyTakeaways: [
      'Validate a new event before trusting it: fires once, on the right action, properties complete, volume reconciles with an independent source',
      'Check platform coverage and recency — new events are often live on one platform first, which biases adoption down',
      'Under pressure, give a caveated directional read, not a precise unvalidated number that will be quoted forever'
    ],
    playbookLinks: []
  },
  {
    id: 'inst20',
    title: 'One Event, Three Platforms, Three Definitions',
    subtitle: 'video_started means something different on web, iOS, and Android',
    difficulty: 'senior',
    isFree: false,
    domain: 'cross-platform',
    company: 'YouTube',
    estimatedMin: 26,
    tags: ['cross-platform', 'web', 'ios', 'android', 'event-consistency', 'autoplay'],
    situation: 'YouTube\'s video_started event powers the cross-platform "views" metric. An analyst notices web video starts per user are 2x iOS. Investigation reveals the event fires differently per platform: web fires video_started on autoplay-on-hover preview; iOS fires it only when playback actually begins after a user tap; Android fires it on player initialization, before any frame renders. Each platform team instrumented in isolation, all believing they were doing it right.',
    question: 'The same event name carries three different definitions across platforms. Why is this so dangerous, how do you reconcile it, and how do you prevent it for the next cross-platform event?',
    hints: [
      'The danger is not just inaccuracy — it is that the metric is invalid in a way that looks valid. A cross-platform "views" number that sums three different definitions is meaningless but will be charted and compared.',
      'Reconciliation is not "pick one platform\'s code." It starts with agreeing on the single semantic definition of what video_started should mean, then conforming all three to it.',
      'Prevention is the real lesson: how do you stop three teams from independently inventing three definitions of the same event?'
    ],
    modelAnswer: {
      approach: 'Name why it\'s invalid not just inaccurate → agree the canonical definition → conform each platform → backfill comparability → prevent via shared spec',
      answer: 'Why it\'s dangerous: the cross-platform views metric sums three different events under one name, so it is not noisy — it is invalid, and invalid in a way that passes every smoke test (the number exists, trends, and gets compared platform-to-platform in exec reviews and ads reporting). Web\'s hover-autoplay and Android\'s pre-render init both inflate vs iOS\'s real-playback definition, manufacturing a fake "web/Android engage more" story and breaking any platform comparison, any cross-platform funnel, and ad view counts. Reconcile: (1) Agree the canonical semantic first, before touching code: define video_started precisely — e.g., "a human-intended playback that renders at least the first frame," explicitly excluding hover-preview autoplay and excluding player init that never renders. Document it in the event registry with positive and negative examples. (2) Conform each platform to that definition: web stops firing on hover-preview (or fires a separate video_preview_autoplayed event for that distinct action); Android moves the fire from player-init to first-frame-rendered; iOS likely already matches and becomes the reference. Keep the genuinely different actions as their own named events rather than cramming them into video_started. (3) Restore comparability: from the conformance date forward, the metric is apples-to-apples; for history, either backfill a corrected definition where the raw signals exist (e.g., web can subtract hover-autoplays if they were distinguishable) or annotate a clear break in series and don\'t compare across it. (4) Validate: after conformance, web/iOS/Android starts-per-user should converge toward each other (allowing for real platform differences), and the gap that\'s left is real, not definitional. Prevent (the actual lesson): cross-platform events must be specified once in a shared, platform-agnostic spec — the semantic definition, the firing trigger described behaviorally (not per-SDK), required properties, and worked examples — and each platform implements against that single spec, not its own interpretation. Add a cross-platform consistency check: alert when per-platform rates of a shared event diverge beyond a threshold, which would have caught the 2x immediately. Ideally provide a shared tracking library or a conformance test suite so "fire video_started" means the same behavior everywhere.',
      keyInsights: [
        'A shared event name with per-platform definitions produces an invalid-but-plausible metric — it sums different things and silently fakes platform differences',
        'Reconcile by agreeing the canonical semantic first, then conforming each platform\'s firing trigger to it; split genuinely-different actions into their own events',
        'Prevent recurrence with a single platform-agnostic event spec (behavioral trigger + examples) plus a divergence monitor across platforms'
      ]
    },
    leadershipNote: 'At staff level the fix is organizational: cross-platform events are owned by one spec and one definition, not by whichever team shipped first. The deep failure here is that three competent teams each "did it right" against no shared definition — so the safeguard is a single source-of-truth spec and a conformance/divergence check, not better individual intentions. A 2x per-platform divergence on a shared event should page, because it is almost always a definitional bug.',
    failureMode: {
      weakAnswer: 'The candidate \"fixes\" it by normalizing in SQL — multiplying iOS by 2 or capping web — without agreeing on what video_started should actually mean. They leave three definitions in place and paper over the gap with a fudge factor that breaks the moment any platform\'s behavior changes, and they never create a shared spec, so the next cross-platform event repeats the whole mess.',
      interviewerFollowUp: '"You\'ve aligned all three platforms to fire on first-frame-rendered. The web team says hover-autoplay previews are a real, valuable behavior they still want to measure. Where does that behavior go now, and how do you make sure it never gets counted as a video_started again?"',
    },
    keyTakeaways: [
      'A shared event name with different per-platform definitions yields an invalid metric that still looks valid — the most dangerous kind',
      'Reconcile by defining the canonical semantic first, then conforming every platform\'s trigger; split distinct actions into distinct events',
      'Prevent with one platform-agnostic event spec (behavioral trigger + examples) and a cross-platform divergence alert'
    ],
    playbookLinks: []
  },
  {
    id: 'inst21',
    title: 'The Retroactive Property Request',
    subtitle: 'A PM needs a breakdown the event never captured. What can you actually recover?',
    difficulty: 'staff',
    isFree: false,
    domain: 'data-quality',
    company: 'Airtable',
    estimatedMin: 24,
    tags: ['schema-evolution', 'backfill', 'enrichment', 'event-design', 'data-quality'],
    situation: 'Airtable\'s record_created event has fired for two years with properties { user_id, base_id, timestamp }. A PM now needs to know what creation_surface each record came from (grid view, form, API, automation) for a roadmap decision. The event never captured creation_surface. The PM asks you to "just add it and backfill the last two years." You need to tell them what is and isn\'t recoverable, and design the path forward.',
    question: 'A property was never instrumented and is now needed historically. What can you legitimately reconstruct, what is genuinely lost, and how do you instrument going forward so this doesn\'t recur?',
    hints: [
      'A missing property is sometimes recoverable from other data you DID capture, and sometimes gone forever. The skill is distinguishing the two honestly.',
      'Can creation_surface be inferred from any signal that was logged — adjacent events, server logs, the API gateway, the automation engine? Inference is not the same as the ground-truth property, and you must label it as such.',
      'Going forward is the easy part (add the property). The judgment is being honest about the historical gap rather than fabricating a clean backfill.'
    ],
    modelAnswer: {
      approach: 'Separate recoverable-by-inference from truly-lost → reconstruct what you can and label it → add the property forward → be honest about the gap',
      answer: 'First, the honest framing: a property that was never captured is not "in the data waiting to be added" — going forward you instrument it; historically you can only reconstruct it from signals that WERE captured, with stated confidence, and accept that some of it is genuinely lost. Audit recoverability per surface: (1) API-created records — likely recoverable: the API gateway logs almost certainly recorded which requests hit the record-creation endpoint with auth context; join record_created to gateway logs on user_id + timestamp + base_id to tag creation_surface = api with high confidence. (2) Automation-created records — likely recoverable: the automation engine has its own run logs; records created in the same transaction as an automation run can be tagged automation. (3) Form vs grid (both in-app UI) — likely the hard, partly-lost case: if there was no adjacent event distinguishing them (e.g., a form_submitted event that shares a key with record_created), they may be indistinguishable in history; you might infer probabilistically (records created in bursts matching form-submission patterns, or sessions where only form routes were active) but this is an estimate, not ground truth. State that explicitly. Build the backfill as a derived, clearly-labeled field: creation_surface_inferred with a confidence and a method note, kept separate from a true creation_surface so nobody mistakes reconstruction for ground truth. Where a surface is unrecoverable, label it unknown rather than guessing — an honest "32% unknown for the historical window" is far better than a fabricated clean split that drives a roadmap decision wrongly. Forward: add creation_surface as a first-class property on record_created now, populated at emission on every surface, validate it (the new-event battery: fires with the property non-null across all surfaces), and from that date forward you have ground truth. Give the PM: ground-truth going forward, high-confidence inference for API/automation history, and an honest unknown bucket for the form-vs-grid history — with the caveat that the roadmap call should lean on the forward data and the recoverable segments, not the inferred soft split. Prevention: this recurs because events are under-propertied at design time; the fix is a measurement-plan habit of capturing the source/surface/context dimension on creation and action events by default, since "where did this come from" is asked retroactively about almost everything.',
      keyInsights: [
        'A never-captured property is reconstructable only from signals that WERE logged (API gateway, automation engine, adjacent events) — and that reconstruction is inferred, not ground truth',
        'Label reconstructed values as inferred with confidence and an explicit unknown bucket; never present a backfilled estimate as if it were captured data',
        'The honest deliverable is ground-truth-forward + high-confidence-recoverable-history + an unknown bucket — and steering the decision toward the trustworthy parts'
      ]
    },
    leadershipNote: 'The staff move is resisting the implied ask — "just backfill it cleanly" — because a fabricated clean history feels helpful and quietly corrupts the roadmap decision it feeds. Reconstruct what is genuinely recoverable, label confidence, and name what is lost. The durable fix is upstream: design events with the context/source dimension from the start, because "where did this come from" is the single most common retroactive question, and it is cheap to capture at emission and impossible to recover later.',
    failureMode: {
      weakAnswer: 'The candidate promises to "backfill the last two years" and ships a creation_surface that looks complete but is actually a guess for the in-app records, presenting inferred values with no confidence labeling or unknown bucket. The PM makes a roadmap call on a fabricated split. Alternatively they say "it\'s impossible, nothing can be done" and miss the API/automation history that genuinely was recoverable from gateway and engine logs.',
      interviewerFollowUp: '"You tell the PM you can recover API and automation history but not reliably distinguish form from grid before today. The PM says \'just split the in-app ones 50/50 so the chart is complete.\' What do you say, and what do you actually put in the field for those records?"',
    },
    keyTakeaways: [
      'A never-captured property is only reconstructable from signals that were logged — and that is inference, not ground truth',
      'Label backfilled values as inferred with confidence and keep an explicit unknown bucket; never fake a clean history',
      'Add the property as first-class going forward, and capture source/surface/context by default since it is the most common retroactive ask'
    ],
    playbookLinks: []
  }
];

export const instrumentationCasesById = Object.fromEntries(
  instrumentationCases.map(c => [c.id, c])
);
