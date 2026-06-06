# PM_AUDIT.md — Product Manager Audit Log

Structured PM audits of PAL as a product. Not a feature wishlist — each entry is a diagnostic snapshot of the product at a point in time, with actionable findings. Audit findings that produce buildable items go into IDEAS.md. This file is diagnosis only.

---

## Audit #149 — Full Product PM Review (V5.10.1, 2026-06-06)

**Trigger:** End-of-sprint PM audit after major IA cleanup (V5.5–V5.10). Goal: evaluate PAL as a product, not as a collection of content.

---

### 1. Product Manager Diagnosis

**Core promise:** Practice the judgment calls that get you hired as a product analyst, data analyst, or PM.

**Is it clear?** Partially. The content is strong and the rooms are well-scoped. But the entry experience does not make the promise visceral fast enough. A new user landing on PAL can browse 17+ rooms, read articles, and skim frameworks without ever making a single judgment call. The product's differentiator — that it puts users in decisions, not reading situations — only activates once they open a case and reach the debrief. Getting users there in the first session is the unsolved problem.

**Core tension:** Content breadth vs activation depth. 17+ rooms signal comprehensive coverage but also overwhelm. The user's first question is "where do I start" — and the product currently does not answer it clearly enough.

**What the product does well:**
- Case + debrief format is genuinely differentiated. The senior debrief teaches what separates a good answer from a hired one. This is PAL's moat.
- Foundations are free and thorough. Strong lead magnet.
- SQL Lab, Company Tracks, and Analytics Failures are distinctive content that does not exist elsewhere in this form.
- The 3-tier access model (Guest / Free / Full) is correctly structured.
- Progress tracking (streak, room completion bars) creates the scaffold for a habit loop.

**What the product does not do well yet:**
- The activation moment is buried. Most users never reach their first debrief in session 1.
- The empty state for new signed-in users is broken — Progress shows nothing, not a "start here" card.
- The guest experience is passive — browse 17 rooms rather than be pushed into one case immediately.
- There is no "continue where you left off" signal. Returning users have to remember where they were.
- The nav communicates what exists, not what to do. A user reads "Stats / A/B Design / A/B Review / Metrics / RCA…" and still does not know where to start or what order to follow.

---

### 2. User Journey Critique

**The intended journey:**
Guest → Sign in → Progress tracker → Practice habit → Full unlock

**What works:**
- GateOverlay is contextual — guests see what they are missing and get a targeted CTA, not a redirect to home. This is correct.
- Progress is the signed-in home (V4.78). Correct — returning users want their dashboard, not a landing page.
- The debrief format creates intrinsic motivation to return. Users who reach a debrief understand the product.
- ForwardPointerCard at every debrief (V5.1) creates a natural next-case pull.

**What is weak:**

*Guest experience:* One guestPreview case per room exists but users have to discover it. A guest who lands on PAL and browses the nav for 3 minutes without being pushed into a case will not convert. The guest-to-sign-in CTA fires after they hit a gate — but if they have not felt value before the gate, the CTA has no leverage.

*First session (signed-in):* New signed-in users land on Progress — which is empty on day 1. An empty heatmap and zero-count room cards communicates "nothing has happened yet" rather than "here is where you start." This is an onboarding problem hiding as a UI problem. Already flagged in NEXT.md as P0.

*Free tier value is invisible:* A signed-in free user gets ~3 cases per room + all Foundations + 50 Easy SQL + 25 Forensic SQL + progress tracking. That is significant value. But the product never communicates this total. Users do not know what they have until they hit a gate.

*Habit loop is incomplete:* The streak exists but is not prominent enough. "Continue where you left off" does not exist. Returning after 3 days, a user has to re-navigate to where they were.

**What blocks activation:**
1. No forced first-case experience for guests or new sign-ins
2. Empty Progress page on day 1
3. No specific starting recommendation ("Start with RCA01 — it is the most common first interview question type")
4. 17 rooms with no sequence signal

**What should happen in the first 5 minutes:**
1. Guest lands on home → immediate primary CTA: "Try a real case →" pointing to one specific Analyst-level case (Metrics or RCA room)
2. Guest completes the case and reads the debrief — value is felt
3. GateOverlay fires: "Sign in to save this and access 3 more free cases in this room"
4. User signs in
5. Progress page shows: 1 case completed + "Next suggested: try RCA02" card + your streak starts today
6. User is activated

Currently steps 1 and 5 are missing.

---

### 3. Navigation and Information Architecture

**Current structure:**
```
ROOMS     — Experiments, Analytics, Product (17 rooms)
DRILLS    — Challenges, Mock Interview
LEARN     — Deep Dives, Frameworks, Interview Q&A, Analytics Failures
TOOLS     — MCQ Quiz, Company Tracks, Defense Strategy, Saved
TRACK     — Progress, Plans, Profile
```

**What works:**
- ROOMS grouped by domain (Experiments / Analytics / Product) is logical and scalable.
- TRACK at bottom is correct — always accessible, not competing for primary attention.
- Stats Calc nested under Experiments (fixed V5.10) is contextually correct.

**What is confused:**
- TOOLS is a catch-all bin. MCQ Quiz, Company Tracks, and Defense Strategy share no logical grouping. A user scanning the nav cannot predict what "TOOLS" contains.
- DRILLS vs rooms — the distinction between "drilling" (MCQ, Challenges) and "practicing in a room" is not intuitive. Users do not know to look in DRILLS for Challenges.
- LEARN has hybrid content — Deep Dives and Frameworks are read-first, Interview Q&A is practice-adjacent, Analytics Failures is reference. The mixing creates unclear expectations.
- Company Tracks is in TOOLS but it is fundamentally a prep strategy tool — it belongs closer to TRACK.
- MCQ Quiz is in TOOLS but it is a practice drill — it belongs in DRILLS.

**Proposed IA (for consideration, not immediate execution):**
```
ROOMS (unchanged — Experiments / Analytics / Product)

PRACTICE
  Challenges
  Mock Interview
  MCQ Quiz       ← moved from TOOLS

LEARN
  Deep Dives
  Frameworks
  Interview Q&A
  Analytics Failures

PREP
  Company Tracks  ← moved from TOOLS
  Defense Strategy

TRACK
  Progress
  Plans
  Profile
  Saved
```

This change requires sidebar restructuring. Log in IDEAS.md P1. Do not execute until after first user feedback from beta.

---

### 4. Free vs Paid Value Boundary

**Current model:**
- Guest: 1 guestPreview case per room (no save), Foundations browseable
- Free (signed in): Foundations with save, ~3 isFree cases per room, 50 Easy SQL, 25 Forensic SQL, progress tracking, streak
- Full (DAI2026): Full case banks, Company Tracks, Staff Layer, Interview Simulator, Medium/Hard/Master SQL

**What is correct:**
- Foundations free — the right lead magnet. Users who complete a foundation understand the product and are primed to convert.
- Easy SQL free — PAL's most distinctive content and a genuine quality signal. Smart.
- Forensics free — surprising and high-quality. Creates word-of-mouth ("PAL has this crazy forensic SQL section that's free").
- Company Tracks fully gated — correct. This is premium enough and has clear conversion pull for candidates with a specific target company.
- Staff Layer fully gated — correct. The leadershipNote is the senior-to-staff differentiator. Correct placement.

**What is suboptimal:**
- Guest preview cases: The guestPreview case per room should always be Analyst-level (currently not guaranteed) and should be the most viscerally satisfying case in that room — the one most likely to make a guest think "I need more of this." Audit whether current guestPreview cases are the best possible conversion hooks.
- Free tier value is not communicated. On first sign-in, the product should show: "You now have access to 150+ cases, 75 SQL problems, and 25 Foundation modules — all free." This removes uncertainty and anchors perceived value before the user hits a paywall.
- The isFree case count (~3 per room) may be too thin for the analytics rooms. A user trying the Metrics room gets 2 free cases and immediately hits a gate. If those 2 cases are not exceptional, they may not convert. Consider 3–5 free cases in the highest-traffic rooms (RCA, Metrics, SQL).

**Free-to-paid trigger is clean:** The access code (DAI2026) is low friction. Plans page is the canonical conversion surface. When Stripe goes live, this path is already set up correctly.

---

### 5. Retention and Conversion

**For sign-up conversion (guest → signed-in):**
- Push guests into a specific case immediately rather than showing them a nav to browse. The nav is a retention tool for returning users, not an acquisition tool for new ones.
- Make the guestPreview case the entry point, not a discovery. Home page primary CTA should go directly to a case, not to the room browser.
- After case completion, the GateOverlay CTA should be: "Sign in free — save this and unlock 3 more cases in this room" (specific, outcome-framed, not generic "sign in").

**For activation (signed-in → first case completion):**
- Empty Progress state needs "Start here →" card pointing to one specific room with rationale: "Most candidates start with RCA — it appears in 9 out of 10 product analytics interviews."
- First-session nudge: on first sign-in, show a dismissable "where to start" card that routes to the recommended first case.

**For retention (returning users):**
- "Continue where you left off" card on Progress page — the single highest-leverage retention mechanic missing from PAL.
- Streak visibility — streak should be above the fold on Progress, not buried. It is one of the few habit-forming mechanics PAL has.
- Company Track progress on Progress page — if a user is 6/16 through the Meesho SBA track, that should surface on Progress as an active path.
- ForwardPointerCard after every debrief (done V5.1) — verify it is prominent enough. If click-through is low, the card may need more visual weight.

**For conversion (free → full):**
- Ambient "what you are missing" signal for free users — currently the paywall only fires when a user hits a gate. A signed-in free user who has not hit a gate does not feel urgency to convert. A subtle "Unlock Company Tracks and Staff Layer →" card on Progress (visible only to free non-unlocked users) would create ambient pull without being aggressive.
- Plans page copy must be outcome-framed (in progress, some done). Complete this before public launch.

---

### 6. Build Priority List

**P0 — must fix before any public launch:**
1. Guest demo path — push guest into a specific case on home page load or home CTA, not browse mode (already in NEXT.md)
2. New signed-in user empty state — "Start here" card on Progress for day-1 users with 0 completed cases (already in NEXT.md)
3. Plans.jsx copy pass — all tier descriptions outcome-framed, not feature-listed (in NEXT.md)
4. guestPreview case audit — verify every room's guestPreview case is Analyst-level and high-quality enough to convert
5. Free tier value anchor — show "You have access to X free cases, Y SQL problems" on first sign-in or on Plans page

**P1 — important after beta feedback:**
1. "Continue where you left off" card on Progress (last active room + case, one click to resume)
2. Streak above the fold on Progress page
3. Company Track progress surfaced on Progress page (if user has an active track)
4. Nav IA restructure — move MCQ Quiz to PRACTICE, Company Tracks to PREP, clean up TOOLS
5. Ambient unlock signal for free users — a single contextual card on Progress pointing to Plans
6. guestPreview case quality pass — replace any weak preview cases with the best Analyst-level case in each room

**P2 — post-launch, needs user signal first:**
1. Take-Home format decision and rebuild (see IDEAS.md)
2. Playbook / Deep Dives / Frameworks naming conflict resolution
3. Stripe payment integration
4. Interview Simulator expansion (wait for PostHog WAU data)
5. Per-room difficulty distribution analysis (which rooms are over-indexed on Staff cases? expand Analyst tier first)

---

### 7. Metrics to Track

The following 12 metrics are recommended for PostHog instrumentation once confirmed live. Grouped by funnel stage.

**Acquisition:**
1. `guest_case_started` — % of guest sessions that start at least one case (activation signal for guests; target >40%)
2. `gate_shown → user_signed_in` conversion rate — % of gate impressions that result in sign-in (target >15%)

**Activation:**
3. `day_1_case_completion_rate` — % of new sign-ins who complete at least 1 case in session 1 (target >35%; below 25% = onboarding is broken)
4. `debrief_reached_rate` — % of case_opened events where user reaches the debrief panel (measures case abandonment; target >60%)

**Engagement:**
5. `cases_per_session` — average cases attempted per visit (target >2; below 1.5 = users are browsing, not practicing)
6. `room_breadth` — average rooms visited per user (single-room users are at churn risk; multi-room users have higher LTV)
7. `forward_pointer_ctr` — % of debrief exits that click ForwardPointerCard (measures the strength of the retention loop)
8. `streak_day_7_retention` — % of users with a 7-day practice streak who return on day 8 (habit formation signal)

**Conversion:**
9. `paywall_hit_rate` — gate_shown events per free session (too low = users not exploring; too high = free tier too thin)
10. `free_to_full_conversion_rate` — % of signed-in free users who enter access code or convert via Stripe
11. `company_track_adoption` — % of full-access users who open at least one Company Track (measures premium feature engagement)

**Content health:**
12. `sql_5plus_completion_rate` — % of full-access users who complete 5+ SQL Lab problems (SQL is PAL's most distinctive content; low adoption here is a product problem, not a content problem)

---

### 8. Final PM Recommendation

**Is PAL's current product shape clear enough?**
Mostly yes. The content is strong, the rooms are well-scoped, and the access model is correctly structured. The product has a clear identity ("practice the calls") and a defensible content moat (senior debriefs, SQL forensics, Company Tracks). The shape is right. The entry experience and habit loop are not.

**Biggest product risk:**
Low activation. A user who browses the nav for 3 minutes without reaching a debrief does not understand what PAL is. If session-1 case completion rate is below 25%, the product will not retain users regardless of content quality. The risk is that PAL becomes a site people open, browse, and close — like every other "prep resource" — rather than a place they practice.

**Highest-leverage improvement:**
Push guests and new users into a specific case immediately. Not a room browser. Not a foundations hub. One specific case, Analyst-level, in the highest-impact room (Metrics or RCA). The user makes a decision, sees the debrief, and understands the product. This single change — the forced first-case experience — has more conversion impact than any copy change, redesign, or content addition.

**What the next sprint should focus on:**
Top-of-funnel. Guest demo path. New user empty state. Free tier value anchor on first sign-in. These three things together define whether a user gets to session 2. Everything else is secondary until activation is above 35%.

---

*Audit logged by: PAL session, 2026-06-06. Next PM audit recommended: after 30 days of PostHog data from beta launch.*
