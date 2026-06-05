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
  }
];

export const instrumentationCasesById = Object.fromEntries(
  instrumentationCases.map(c => [c.id, c])
);
