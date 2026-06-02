# Platform Architecture Memo
## Product Analytics Systems Lab

**Status:** Pre-implementation convergence document  
**Date:** 2026-05  
**Purpose:** Settle the platform architecture, build sequence, and product philosophy before writing code.

---

## Q1. Keep as Experimentation Systems Lab or upgrade to Product Analytics Systems Lab?

**Recommendation: Option B — upgrade this app.**

The instinct is correct. The existing codebase already has every structural component a multi-room platform needs: scenario engine, progress tracking, scoring system, theme system, unlock/beta gating, Judgment Bank, methodology page. Rebuilding any of that in a new app is waste.

The only real cost of Option B is a nav restructure, a rename, and a branding pass. That's a few hours of work, not a week.

**The honest pushback:**

"Product Analytics Systems Lab" is a mouthful. It sounds like a university course catalog. The current "Experiment Review Room" had something better: a specific, visceral promise. You knew exactly what you were walking into.

The platform name needs to be sharper than "Product Analytics Systems Lab." Consider:

- **Analytics Judgment Lab** — preserves "judgment" which is the core differentiator
- **The Analytics Room** — clean, professional, expandable
- **Product Analytics Lab** — shorter, still descriptive
- **Analyst Judgment** — sharp but maybe too abstract

Whatever you choose, the platform tagline must still be the current one: *"You know the formulas. Now practice the calls."* That line is correct. Don't touch it.

The rooms themselves should be branded as rooms, not courses or modules. "Rooms" implies an active professional space — a war room, a review room, a design room. That's the right register.

---

## Q2. What should the final platform IA be?

The natural information architecture mirrors the analyst's actual workflow:

```
1. Understand the statistics        → Stats Room
2. Design the metric framework      → KPI / Metrics Playground
3. Design the experiment            → Experiment Design Room
4. Read the result                  → Experiment Review Room  ← current app
5. Diagnose the anomaly             → RCA / Metric Diagnosis Room
6. Make the business recommendation → Product / Business Case Room
```

This ordering is not arbitrary. It follows causality: you can't design a good experiment without understanding stats; you can't review results well without having designed well; you can't do RCA without understanding what the metrics measure. Each room is harder to use well without the previous one.

**Navigation architecture (phased):**

V1.2 nav (what exists or is being built):
```
Home  |  Stats  |  Design  |  Review  |  Judgment Bank  |  Progress  |  Methodology
```

V2 nav (all rooms available, some locked):
```
Home  |  Stats  |  KPI Lab  |  Design  |  Review  |  RCA  |  Cases  |  Bank  |  Progress
```

V3+ nav consideration: the nav gets crowded at 9 items. Solution: group rooms into two clusters with a visual separator:

```
[ Foundations: Stats · KPI Lab ]   [ Rooms: Design · Review · RCA · Cases ]   [ Bank · Progress ]
```

Or introduce a "Rooms" dropdown for the six practice rooms, keeping Stats and KPI Lab as top-level because they're foundational (not scenario-based).

**What should not be in the nav:** certificates, team dashboards, social features, settings (these belong in utility overflow menus).

---

## Q3. What are the rooms and their exact purpose?

### Stats Room
**Purpose:** Interactive statistics literacy for product analytics contexts. Not a textbook. Not a course. A room where each concept answers five questions: what is it, why does it matter for product, what mistake does it prevent, where does it show up in scenarios, how would I say it in an interview.

**Format:** Each concept is a standalone interactive module. The interaction is the teaching — you manipulate parameters, the visualization updates, the interpretation changes. There is no wall of text to read before you can interact.

**Canonical example (p-value module):**
- Slider: effect size
- Slider: sample size
- Visual: confidence interval, p-value, "significant?" indicator
- Key insight 1: same lift with 500 users → not significant. Same lift with 50,000 users → significant. The data did not change. The sample changed.
- Key insight 2: p < 0.05 does not mean the feature works. It means the data is inconsistent with the null under these assumptions.
- Key insight 3: p > 0.05 does not mean no effect. It means insufficient power to detect it.
- Trap card: "PM says p = 0.04, ship it. What's wrong?" → teaches practical vs. statistical significance.

**What Stats Room is not:** It is not a prerequisite course users must complete before accessing other rooms. It is a reference workspace they return to when they hit a concept they don't fully understand. The Experiment Review Room already works without Stats Room existing. Stats Room makes users better at the Review Room, not eligible for it.

**Scope for MVP:** 12–15 core concepts. Mean/median/variance, standard error, confidence intervals, p-values, practical vs. statistical significance, power, MDE, sample size, Type I/II error, SRM chi-square, multiple testing, effect size.

---

### KPI / Metrics Playground
**Purpose:** Metric design simulator. User learns to build metric trees, reason about denominators, identify gaming risks, and translate product improvements into business impact. This is not a glossary of metric types. It is a decision simulator for metric design questions.

**Format:** User picks a product context (search, onboarding, subscription, marketplace, notification, GenAI tool). The playground asks a structured sequence: What is the business goal? What is your north star? What are the secondaries? What are the guardrails? What breaks if you optimize only the primary? What denominator should you use? What does a 2% lift imply in revenue terms?

Then it reveals a senior answer and scores the distance.

**Key distinction from the Review Room:** In the Review Room, the scenario is pre-built and the user reacts. In the KPI Playground, the user constructs — which requires a different mental muscle.

**Scope for MVP:** 5–6 product contexts with full senior answer trees. Start with the contexts users most commonly encounter in interviews: checkout/conversion funnel, onboarding/activation, subscription/retention, search, notifications.

---

### Experiment Design Room
**Purpose:** Given a product feature or change, design the complete experiment before any data exists. The complement to the Review Room: Design Room asks "can you design the test correctly?" Review Room asks "can you read the result honestly?"

**Format:** User is given a product scenario (same fictional company universe as Review Room scenarios). They must specify: hypothesis, randomization unit, unit of analysis, target population, primary metric, guardrails, runtime rationale, sample size concern, trust checks, validity risks, and the pre-committed decision rule. The design is scored against a rubric on the same four-level scale: Incomplete / Analyst-Ready / Senior-Ready / Staff-Level.

**Key feature:** Design Room scenarios and Review Room scenarios should be paired. The same fictional experiment should appear in both rooms — first as a design challenge ("design the checkout test"), then as a readout challenge ("read the checkout test result"). This creates the most powerful learning loop in the platform.

**Scope for MVP:** 4–6 scenarios. Prioritize scenarios that pair with existing Review Room scenarios.

---

### Experiment Review Room (current)
**Purpose:** Read messy synthetic experiment readouts, make ship/rollback/investigate decisions, see calibrated senior analyst debrief.

**Status:** Working, 8 scenarios live, 42 roadmap. No changes needed to core loop.

**Evolution:** As the platform grows, the Review Room becomes one node in a larger journey. A user who has worked through the paired Design Room scenario should see a "You designed this test — now read the result" prompt when entering the corresponding Review Room scenario.

---

### RCA / Metric Diagnosis Room
**Purpose:** Practice the root cause analysis process systematically. Given a metric anomaly, work through the diagnostic tree: clarify definition → segment numerator/denominator → sudden vs. gradual → MECE hypothesis generation → data analysis plan → validate/falsify → recommend.

**Format:** Each scenario presents a metric drop or anomaly with partial information. The user works through a structured diagnostic process. The app reveals which branches of the diagnostic tree were correct, which hypotheses were missed, and what the senior analyst would have investigated first.

**Key distinction:** RCA is not experimentation. It is a separate analytical skill that most products and courses conflate with experiment analysis. It deserves its own room.

**Scope for MVP:** 5–6 scenarios. Start with the classic interview scenarios: checkout conversion drop, DAU decline, revenue flat while orders are up, search GMV drop.

---

### Product / Business Case Room
**Purpose:** Broader ambiguous product analytics questions. Opportunity sizing, feature evaluation, metric selection for new products, make-vs-buy recommendations, growth lever analysis. These are the "how would you approach X?" interview questions that require structured thinking, not just statistical knowledge.

**Format:** Each case is a prompt with some context. User writes a structured approach. App scores against a rubric: did they clarify scope, decompose the problem, identify the right metrics, size the opportunity, and make a recommendation with appropriate confidence?

**Note:** This room is furthest from the current codebase patterns. It likely requires free-text input eventually, which breaks the pre-computed scoring model. Consider holding this room until V3+ when the product has validated the paid tier and can invest in more complex evaluation.

---

## Q4. What should be built next after V1.1?

**Next build: Experiment Design Room.**

Here is the reasoning:

The Design Room shares the most code patterns with the existing system. It uses the same scoring levels, the same scenario card structure, the same fictional company universe. It introduces no new interactive component patterns — the user makes selections and the app scores them. It can ship with 4–6 scenarios. The content is well-defined and directly sourced from the uploaded prep materials.

More importantly: the Design Room completes the most valuable learning loop on the platform. Right now, users can only *read* experiments. Adding the ability to *design* them first transforms the product from a single-skill trainer into a coherent analytical workflow. That is a meaningful product upgrade, not just more content.

**The Stats Room is foundational but should not come first.** It requires interactive component work (sliders, CI visualizations, sample size calculators) that does not exist in the current codebase. Building it correctly takes longer than the Design Room. Building it quickly (as a text-heavy page with some simple visuals) produces exactly what we should avoid: a textbook.

**The KPI Playground is also foundational but is wider in scope.** The content architecture (metric trees, denominator logic, business translation) requires more original content work than the Design Room. It should come after the Design Room.

---

## Q5. Platform shell vs. content first?

**Do not build a platform shell with empty rooms.** This is the most common failure mode in platform products built by one person. Empty rooms are a graveyard — they signal ambition but deliver nothing, and they create navigation cognitive load that reduces engagement with the rooms that do have content.

The correct approach: build each room to a shippable standard, then add it to the nav. Until a room has real content, it does not appear in the nav (or appears as "Coming Soon" in the Judgment Bank page, not in the main navigation).

The platform rename and branding upgrade should happen as a lightweight pass, not a major project. Update the header, the homepage, the meta title/description, and the homepage intro copy. That takes a few hours. Do it in V1.2 alongside the Design Room MVP.

---

## Q6. Correct build order and why

```
V1.1  (done)     — Polish pass, design system, 50-scenario Judgment Bank, docs
V1.2             — Platform rename + Experiment Design Room MVP (4-6 scenarios)
V1.5             — Stats Room MVP (12-15 interactive concept modules) + 10 new Review scenarios
V2.0             — KPI / Metrics Playground MVP + Experiment Design Room expansion + paired scenarios
V2.5             — RCA Room MVP (6-8 scenarios)
V3.0             — Product / Business Case Room + assessment layer + paid tier upgrade
V3.5             — Full 50-scenario Review Room + Judgment Bank completion
V4.0             — Platform: analytics readiness score, interview prep mode, team accounts
```

**Why this order:**

1. Design Room first: fastest to build with current patterns, highest leverage, completes the core experimentation loop.
2. Stats Room second: requires new interactive components but delivers the foundational literacy layer that makes the whole platform more useful. By V1.5, the Review Room will have attracted enough users to justify the Stats Room investment.
3. KPI Playground third: broadest content scope, most original work. Build after the platform has proven the interactive decision format works at scale.
4. RCA Room fourth: separate skill, requires original scenarios, builds naturally on the diagnostic skills reinforced by Stats Room.
5. Business Cases last: requires free-text evaluation which breaks the current pre-computed scoring model. Defer until the platform has the maturity and user base to justify the investment.

---

## Q7. V1.2, V1.5, V2, V3, V4 scopes

**V1.2 — Design Room + Platform Rename**

Scope:
- Rename the platform (header, homepage, meta)
- Experiment Design Room: 4–6 scenarios, same scoring system as Review Room, paired with existing Review Room scenarios where possible
- Minor visual upgrade (not a redesign — darker card surfaces, stronger type hierarchy)
- Update homepage to reflect the broader platform vision
- Update Judgment Bank to show both Design and Review scenario counts

Time estimate: 2–3 build sessions.

**V1.5 — Stats Room**

Scope:
- Stats Room: 12–15 interactive concept modules
- Interactive components: sliders, CI visualizers, significance calculators, power curves
- Each module: concept plain-English explanation + interactive demo + trap card + interview phrasing
- Link Stats Room concepts to existing Review Room scenarios ("This concept appears in The Ghost Assignment")
- 10 new Review Room scenarios (reach 18 total)

Time estimate: 4–6 build sessions. The interactive component work is the constraint.

**V2.0 — KPI Playground**

Scope:
- KPI / Metrics Playground: 5–6 product contexts with full metric tree challenges
- Metric tree visualization component (new)
- Denominator switcher, business impact calculator
- Paired Design + Review scenario system fully implemented
- Experiment Design Room: expand to 10+ scenarios

**V2.5 — RCA Room**

Scope:
- RCA Room: 6–8 diagnostic scenarios
- Diagnostic tree format (new interactive component)
- MECE hypothesis checklist format
- Connects to Stats Room (what statistical checks are relevant here?)

**V3.0 — Assessment + Paid Tier**

Scope:
- Analytics Readiness Assessment (timed, cross-room, scored)
- Certificate (downloadable, shareable)
- Proper paid tier (Stripe/Lemon Squeezy, not unlock code)
- Team accounts (basic — shared unlock, not full dashboard yet)

---

## Q8. How to avoid turning this into a giant boring course

**The core rule: decision-first, always. Never definition-first.**

Every room, every module, every concept should start with a situation — not a definition. The Stats Room module on p-values should begin: "Your PM says p = 0.04, ship it. What do you check first?" — not "A p-value is the probability of observing data at least as extreme as..."

**Concrete anti-patterns to avoid:**

- Long text walls before any interaction
- Glossary-style definition pages (anything that reads like a textbook index)
- Video walkthroughs (passive, not interactive)
- Forced linear curriculum (users should be able to enter any room)
- Progress bars that make it feel like a course to complete rather than a room to return to
- Completion certificates as the primary motivation mechanism

**The test:** Every piece of content should pass this check — "If a senior analyst saw this, would they learn something or just confirm what they already know?" If it's the latter for a senior, it needs to be harder. If it's completely opaque to an analyst who knows the basics, it needs better scaffolding, not a textbook chapter.

**The right motivation:** The product should feel like a place analysts come back to before interviews, after making a mistake in real work, or when they want to pressure-test their judgment on a new scenario. Not a course they complete once and never return to.

---

## Q9. How to make Stats Room beginner-friendly but serious

**The framing contract:** Stats Room assumes you've heard of these concepts. It does not explain what an experiment is. It explains what these concepts mean *when the data is messy and the PM wants an answer*.

Each module structure:
1. **The situation** (2–3 sentences): "You ran a 2-week test. Primary metric is up 3%. p = 0.08. Your PM says run it one more week and it'll be significant."
2. **The interaction** (slider/visual): manipulate sample size, see CI change, see p-value change
3. **The insight** (1–2 sentences): what changed, what didn't, what that means
4. **The trap** (the wrong answer most people give): "p > 0.05 means no effect"
5. **The correct framing**: "Insufficient power to detect the effect at this sample size — extend only if you pre-committed to this rule before running"
6. **Interview phrasing**: exactly how to say this if asked

**What makes it serious despite being approachable:** The trap card is always a real mistake people make in real jobs. The interactive component shows the consequence, not just the concept. The interview phrasing is senior-level, not textbook-level.

---

## Q10. How to make KPI Playground interactive and not a glossary

**The key: start with a product, not a concept.**

The user never sees a definition page. They walk into a product context:

> You're a data scientist at a mid-stage B2C subscription app. The CEO wants to know what success looks like for the new onboarding flow you're A/B testing. What metrics do you track?

Then they build the answer through a structured form: primary metric, secondaries, guardrails, what can go wrong, business impact of a 5% lift.

Then the app reveals the senior answer tree — not as a correction, but as a comparison. The user sees where they agreed, where they were shallow, what they missed.

**The visual that makes this work:** A metric tree diagram that builds live as the user makes selections. Not a static image — a branching structure where each node they add creates visible dependencies and potential conflicts. This is the "diagram-like flow" from your design direction.

**The gaming risk panel:** After the user defines their primary metric, the app asks "What happens if the team optimizes only this metric?" and shows the predictable gaming failure mode. This is the most high-value teaching moment in the whole room — it's where the difference between a good and bad metric system becomes visceral.

---

## Q11. How should the Judgment Bank evolve?

The Judgment Bank is currently a Review Room index. It should become the platform's cross-room content atlas.

V2 Judgment Bank:
- Filter by room (Review, Design, RCA, KPI, Cases)
- Filter by scenario family (unchanged — families are room-agnostic)
- Filter by difficulty
- Show paired scenarios: Design Room scenario links to its Review Room counterpart and vice versa
- Show "played" status per room
- Show roadmap cards per room

This makes the Judgment Bank a genuine product discovery page, not just a scenario list.

**One thing to preserve:** The dashed-border "roadmap" card pattern is exactly right. It signals ambition without overpromising. Keep it.

---

## Q12. Data and schema architecture

The current schema is tightly coupled to the Review Room. The platform needs a generalized content model.

**Recommended architecture:**

```
Room
  id, name, slug, description, status ('active' | 'beta' | 'coming_soon')
  
ContentItem (abstract)
  id, roomId, title, difficulty, status, family, industry
  
ReviewScenario (extends ContentItem)
  context, experimentDesign, metricReadout, warningFlags
  decisions: [{ id, label, score, feedback }]
  debrief
  
DesignScenario (extends ContentItem)
  productContext, featureProposal, designCriteria
  scoringRubric: { dimensions, levelDescriptions }
  seniorDesign, commonMistakes
  pairedReviewScenarioId  ← links to ReviewScenario
  
StatsModule (extends ContentItem)
  concept, situationSetup
  interactiveConfig: { sliders, visualType, insights }
  trapCard, correctFraming, interviewPhrasing
  linkedScenarioIds: []  ← which scenarios this concept appears in
  
KPIChallenge (extends ContentItem)
  productContext, businessGoal
  metricTreeChallenge
  seniorAnswer: { northStar, secondaries, guardrails, denominatorRationale, businessImpact, gamingRisks }
  
RCAScenario (extends ContentItem)
  anomalyContext, initialSignal
  diagnosticTree, correctHypotheses, commonMistakes
  debrief

Progress (per user, localStorage)
  attempts: { itemId, roomId, score, timestamp }
  moduleCompletions: { moduleId, completed, timestamp }
```

**Key decisions:**

1. `pairedReviewScenarioId` in DesignScenario enables the "design → review" journey without coupling the schemas.
2. `linkedScenarioIds` in StatsModule enables "this concept appears in The Ghost Assignment" without a complex cross-reference system.
3. Progress stays in localStorage through V3. No backend needed until team accounts.

---

## Q13. Progress and scoring across modules

Each room uses a different scoring vocabulary but maps to the same underlying levels:

| Level | Review Room | Design Room | RCA Room | KPI Playground |
|-------|------------|-------------|----------|----------------|
| 1 | Junior Miss | Incomplete | Wrong tree | Missing guardrails |
| 2 | Analyst-Ready | Analyst-Ready | Partial diagnosis | Analyst metric set |
| 3 | Senior-Ready | Senior-Ready | Correct diagnosis | Senior metric tree |
| 4 | Staff-Level | Staff-Level | Expert framing | Staff-level precision |

Stats Room is not scored in the same way — it uses completion + "concept seen" tracking, not decision scoring.

**Cross-room aggregate:** In V3, introduce an "Analytics Readiness Score" computed from performance across rooms. This is the commercial lever for the assessment/certificate layer.

**Important:** Do not surface the aggregate score prominently until it's computed from at least three rooms. Showing a "score" based on one room is misleading and will cause users to optimize for that room alone.

---

## Q14. What should stay free vs. paid?

**Free tier (always):**
- Stats Room: complete (it's foundational and the best marketing for the platform)
- Review Room: 4 analyst-level scenarios (current)
- Design Room: 2 analyst-level scenarios
- KPI Playground: 2 product contexts
- RCA Room: 1 scenario
- Judgment Bank: browse all planned scenarios

**Paid tier (private beta → Stripe V3):**
- Review Room: all 8+ senior/staff scenarios
- Design Room: full library
- KPI Playground: full library
- RCA Room: full library
- Product Cases: full library
- Analytics Readiness Assessment
- Certificate

**Why Stats Room is free:** It's the highest-value marketing content on the platform. A senior analyst sharing a Stats Room module with their team is the best possible distribution mechanism. Gating it reduces reach without meaningful revenue gain.

---

## Q15. What would make this commercially credible?

**The three things that matter:**

1. **Content quality is the moat.** Not features, not gamification, not speed of shipping. The scenario debrief quality is what makes this worth paying for. One excellent scenario that changes how an analyst approaches their next real experiment is worth more than ten mediocre ones.

2. **Interview prep positioning.** The most immediate commercial use case is interview preparation. "I used this to prep for my DS interview at [company]" is the testimonial that drives paid conversion. The Design Room especially targets this use case — "How would you design an A/B test for X?" is one of the five most common DS interview questions.

3. **Specificity of the senior voice.** The debrief needs to sound like a specific senior analyst, not generic best practices. It should name the failure mode, explain why it matters *in this specific context*, and give the exact framing a staff analyst would use with a PM. That specificity is what separates this from any blog post or course.

**What does not make this commercially credible:** speed of shipping, number of scenarios, feature quantity, social features, gamification layers. Those are vanity metrics. The quality bar document is more important than the roadmap.

---

## Q16. Biggest product risks

**1. Content production bottleneck**
Each room requires original, high-quality scenarios and modules. This is the binding constraint. Every version of the roadmap that assumes "X new scenarios in V1.5" is implicitly a promise about content production. Be honest about velocity.

**2. Platform dilution**
Adding six rooms while running a one-person content operation risks producing six thin rooms instead of one excellent one. The current single room with 8 excellent scenarios is better than a six-room platform with 3 scenarios each. The build sequence should be governed by content readiness, not feature ambition.

**3. Stats Room becoming a textbook**
This is the most likely failure mode for Stats Room. If the interactive components are not built with sufficient care, the fallback is text explanations with some charts. That produces exactly what every other resource already has. The Stats Room must be interaction-first or it should not ship.

**4. Losing the positioning**
The current positioning — "practice the calls" — is sharp and differentiated. A platform pivot to "complete product analytics education" risks sounding like every other course on the internet. The platform should expand its scope while preserving the judgment-first positioning. Every room is a judgment exercise, not a knowledge transfer.

**5. Premature paid tier**
Converting to a real payment system (Stripe) before the product has multiple compelling paid rooms will produce poor conversion and churn. The current unlock code is the right approach through V2. Real payment infrastructure only makes sense when there are 3+ paid rooms with real content.

**6. The activation problem**
Users who visit once and don't return. The Review Room partially solves this by having 8 scenarios — there's a reason to return. But the platform will face this more acutely as it grows. The solution is not gamification — it's content quality and clear use cases (pre-interview, post-mistake, calibration).

---

## Q17. What should absolutely not be built yet?

1. **Social / community features** (sharing scores, leaderboards, discussion) — distorts motivation toward proxy metrics
2. **Team accounts / org dashboards** — V4 problem, requires backend
3. **Video content** — passive, expensive to produce, doesn't differentiate
4. **LMS structure** (required curriculum, completion certificates for individual modules) — implies a course, not a practice space
5. **AI evaluation of free-text answers** — technically complex, expensive, consistency problems; defer until V3+
6. **Mobile app** — the content is inherently desktop (tables, charts, sliders); don't optimize for mobile until the desktop product is excellent
7. **API / embed for third parties** — premature platform thinking
8. **Product Cases Room** — the free-text format breaks the current scoring model; defer until the platform has revenue to invest in better evaluation
9. **Notification / email system** — engagement mechanics are a distraction from content quality
10. **The Stats Room as a text-heavy MVP** — better to delay than to ship a textbook

---

## Q18. What should the next Claude Cowork build actually implement?

**V1.2 implementation scope (recommended):**

**Part 1: Platform rename + branding pass (half session)**
- Update app name in header, homepage, meta tags
- Update homepage hero to reference the broader platform vision
- Keep the tagline unchanged
- Add "Rooms" concept to the homepage (show which rooms exist, which are coming)
- Do not rebuild the design system — a few targeted tokens and copy changes

**Part 2: Experiment Design Room MVP (1–2 sessions)**
- 4 design scenarios: 2 free (analyst), 2 beta (senior)
- Schema: DesignScenario data structure
- Design Room page with scenario browser
- Design submission form: 8–10 structured fields
- Scoring engine: rubric-based, same four levels as Review Room
- Score reveal + senior design debrief
- Pair 2 of the 4 scenarios with existing Review Room scenarios

**Part 3: Homepage + nav update**
- Show Design Room as a live room in navigation
- Update Judgment Bank to show Design + Review scenario counts
- Update roadmap section to reference Stats Room coming in V1.5

**What this build does NOT include:**
- Stats Room (requires new interactive components)
- KPI Playground (requires metric tree component)
- Visual redesign
- Any new backend infrastructure

This scope is achievable in 2–3 build sessions and produces something genuinely new and valuable: the ability to practice designing an experiment before reading one.

---

## Design Direction (supplemental)

The current light theme is competent but not distinctive. The direction you described — "serious analytical learning workspace," "analytics war room," "metric thinking playground" — points toward a specific aesthetic:

**Correct reference points:** Linear (product, not gamified), PostHog (analytical density with good visual hierarchy), Retool (functional workspace panels), Stripe Docs (information-dense but clean).

**Target feeling:** You are a senior analyst at your desk. The tools are serious. The space is focused. There is no marketing copy visible once you're inside a room.

**Specific upgrades for V1.2:**
- Surface hierarchy: home canvas slightly warmer, card surfaces notably darker than canvas (more depth, less flat)
- Type: slightly larger heading scale, tighter line-height on data tables
- Data tables (MetricTable): more structured — column alignment, subtle row zebra-stripe, stronger significance indicator
- Score reveal: more visual weight — the score should feel like a verdict, not a badge
- Stats Room visual vocabulary (for V1.5): uses grid/chart aesthetics — visualization panels, not cards

**What to avoid:** Dark mode as the default (current light default is correct for a serious workspace), neon/gaming color palette, excessive animation, any aesthetic that reads as "edtech" or "course platform."

---

## Summary

| Question | Recommendation |
|----------|---------------|
| Keep or upgrade? | Upgrade to broader platform (Option B) |
| Platform name | Shorter than "Product Analytics Systems Lab" — reconsider |
| Build next | Experiment Design Room (V1.2) |
| Then | Stats Room (V1.5) |
| Then | KPI Playground (V2) |
| Platform shell first? | No — ship rooms, not empty nav items |
| Stats Room approach | Interaction-first; defer if can't build right |
| KPI Playground approach | Product-context-first; metric tree visualization |
| Free tier | Stats Room (all) + analyst scenarios in each room |
| Paid trigger | V3 with 3+ paid rooms and real content |
| Biggest risk | Content production bottleneck + platform dilution |
| Do not build | Social, mobile app, AI evaluation, Product Cases, video |
| Commercial lever | Interview prep + content quality + senior voice |
| Next build scope | Rename + Design Room MVP (4 scenarios) + nav update |
