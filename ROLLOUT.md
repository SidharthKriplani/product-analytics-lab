# ROLLOUT.md — PAL Beta Rollout Plan

Operational file. Tracks what goes out, in what order, to whom, and what gets checked before it does. Not a feature backlog (that's IDEAS.md). Not standing rules (that's DECISIONS.md). This is the gate between "built" and "live to testers."

---

## Principles
*These are word-for-word identical across all sibling repos. If they change, change them everywhere.*

**1. Batch 0 is founder-only. No exceptions.**
Every batch starts with the founder using the product as a stranger would — cold, no context, no knowledge of what's behind the UI. Obvious breakage gets caught here so testers spend time on judgment calls, not bug reports.

**2. Every batch entry has two layers: profile and scope.**
Profile = who the tester is and what they are trying to do. Scope = what they are testing. Both are required. "Batch 1 = these 5 rooms" is not a batch entry. "A senior analyst candidate with 7 days to prep, testing the Defense Strategy + RCA room" is.

**3. Tester brief is one specific prompt, not a list.**
Vague prompts produce vague feedback. Each batch gets one concrete scenario the tester walks through. If you need to test two distinct things, run two batches.

**4. Feedback has an expiry date.**
Tester feedback on Batch N is only valid until Batch N+1 ships. When the next batch opens, mark the previous batch's feedback field as closed. Do not let unresolved notes from old batches accumulate as if they are still actionable.

**5. Mobile is non-negotiable in every vet checklist.**
Every batch — Batch 0 included — must be tested on a real mobile device before testers see it. Not browser devtools. A real phone. Check sticky bars, grids, tap targets, dark mode at low brightness.

**6. "Pass" must be defined before the batch opens.**
Each batch entry states what pass looks like before a single tester is invited. If you cannot define pass, the batch is not ready to open.

---

## Batch 0 — Founder Self-Vet
*Status: COMPLETE — bugs found and fixed in V4.28.0*

### User profile
Founder, using the product as a first-time visitor with no context. No skipping. No "I know what this does."

### Scope
Full product surface — all rooms, all tools, all nav paths.

### Self-vet checklist

**Core loop**
- [x] Home page loads cleanly, onboarding modal appears on first visit
- [x] Can navigate to every room from the sidebar without errors
- [x] Complete one case end-to-end in Stats, RCA, Metrics, Cases rooms — debrief renders correctly
- [~] Code Room: Python and SQL both execute; Pyodide loads without hang — ⚠️ execute button hidden behind reveal flow; stray JS import inside Python setup code broke execution. Fixed in V4.28.0.
- [x] Interview Simulator: full session completes without error in both DS and PM mode

**Defense Strategy (new — V4.27.0)**
- [x] Step 1: JD textarea accepts paste, Analyze JD button activates
- [x] Step 2: skill rating cards render, all three ratings selectable, JD weight dots appear
- [x] Step 2: all four time horizon buttons selectable; intensity picker hides on Cram Up
- [x] Step 3: gap scorecard bars render and are ordered by gap score
- [x] Step 3: round-by-round cards show correct skill tags with correct rating colors
- [x] Step 3: Cram Up output shows focus list + "the hour before" block
- [x] Step 3: day plan cards show room chips (clickable) + suggested cases
- [x] Step 3: Outside PAL section appears when JD contains Excel/financial modeling/presentation keywords
- [x] Reconfigure link returns to Step 2 with ratings preserved

**Progress + auth**
- [x] Progress page heatmap renders as 13×7 grid, not a blob
- [x] Role readiness score updates after completing cases
- [x] Sign in / sign out flow works; topbar shows avatar when signed in
- [x] Sign in appears only in topbar (not duplicated in sidebar)

**Mobile — on a real phone**
- [x] Sidebar opens and closes cleanly; all nav items tappable
- [x] No horizontal scroll on any room browser page
- [x] Sticky bottom bars (RCA, Cases, BI, Challenges) clear the home indicator
- [x] Topbar clears the notch / Dynamic Island
- [x] Dark mode at 30% brightness: text and surface elevation both visible
- [x] Code Room shows mobile notice banner
- [~] Defense Strategy 3-step flow usable on mobile (grid collapses correctly) — not fully retested post-fix

**Known rough edges verified**
- [x] Pyodide initial load spinner confirmed showing
- [x] Defense Strategy sparse JD fallback warning confirmed

**Bugs found during self-vet (all fixed in V4.28.0)**
- ❌ Behavioral room crashed on desktop and mobile — BEH21–30 used different schema (`storyFramework`/`strongSignals`) than BEH01–20 (`starGuide`/`modelAnswer`); runner called `Object.entries(undefined)`. Fixed: runner now handles both schemas.
- ❌ Cases Room correct answer always option A — options were never shuffled. Fixed: seeded Fisher-Yates shuffle per caseId+phaseId in CaseRunner.jsx.
- ❌ Mobile welcome card not loading — hero card had `overflow: hidden` + mockup `minWidth: 260px`; effective card width on 375px phone was ~255px, clipping the mockup. Fixed: `minWidth: 0` on mockup, responsive `clamp()` padding on card.
- ❌ Stats Room variable placement (mobile) — click-to-cycle UX (Unplaced→Numerical→Categorical) unusable on mobile; after first tap the card moves zones and user can't find it. Fixed: replaced with explicit N/C buttons on each unplaced card.
- ❌ Code Room execute button not visible — run button lives inside ModelAnswerPanel (post-reveal only); stray JS import statement inside Python `runPython()` setup also broke Python execution. Fixed: removed stray import, added proper `track` import at top, added "▶ Run Code appears after reveal" hint in writing view.

### Pass criteria
All checklist items green. No room throws a runtime error. Defense Strategy 3-step flow completes end-to-end on both desktop and mobile.

### Feedback collected
Founder self-vet complete. 5 bugs found and fixed in V4.28.0. Additional feature feedback recorded below. Re-vet mobile post-deploy before opening Batch 1.

**Feature feedback from Batch 0 (not bugs — logged to IDEAS.md for prioritization)**

- **RCA Room** — solid, no issues. Confirmed working as expected.
- **Metrics Room — linked scenarios not clickable** — after revealing the senior metric design answer, linked scenario cards appear in the debrief but are not navigable. Users expect to be able to tap through. Logged to IDEAS.md (Tier 1).
- **Code Room — SQL not executable** — the Run Code button only works for Python (Pyodide). SQL modules show code but there is no way to execute or validate a query. Ideally the Code Room becomes a lightweight SQL playground. Logged to IDEAS.md (Tier 2).
- **Timer — needs play/pause + tooltip** — the running timer has no pause control and no explanation of what it's for. Users don't know whether it's tracking their speed for scoring or just informational. A hover tooltip and play/pause button would reduce confusion. Logged to IDEAS.md (Tier 2).
- **Interview Simulator — needs significant expansion** — current modes (DS / PM) are too broad. Feedback: split into specific roles (Product Analyst, Business Analyst, Data Analyst, PM) with a Senior / Staff tier per role. Remove the generic DS mode. Adjust question counts per session type: Quick = 5–10, Standard = 10–15, Full Loop = 20–30, Marathon = 30–40. Current question bank is thin — needs depth to support these tiers. Logged to IDEAS.md (Tier 1, large scope).
- **Access code for moat content** — idea: instead of (or alongside) Stripe paywall, lock deep-value content behind a shareable access code. One generic code for the community (LinkedIn, word of mouth), individual codes for direct invites. Creates exclusivity signal and a low-friction conversion path before Stripe goes live. Logged to IDEAS.md (Tier 2).

---

## Batch 1 — First External Testers
*Status: PENDING — pre-beta gates in progress (see NEXT.md). Opens after: git push V4.43.0+V4.44.0, PostHog confirmed live, foundations vetting pass done.*

### User profile
2–3 people actively prepping for a senior analyst or business analyst role. Have an interview coming up in the next 7–14 days. Comfortable with SQL. Self-described as shaky on experimentation and RCA. Not from a pure engineering background.

*Why this profile:* They have genuine skin in the game, so they will use the product seriously rather than casually clicking around. Their gap profile (SQL strong, experimentation/RCA weak) maps directly to PAL's best content.

### Scope
- Defense Strategy (the full 3-step flow, using a real JD from their actual target role)
- RCA Room (3+ cases)
- Stats Room or Stat Foundations (whichever the Defense Strategy recommends)

### Self-vet checklist before inviting testers
- [ ] Batch 0 passed fully
- [ ] Tested on mobile by founder (real device, not devtools)
- [ ] Defense Strategy tested with 3 different JDs: generic analyst, BA at e-commerce, PM at startup — all produce sensible plans
- [ ] Outside PAL section tested with a JD containing "Excel" and "pivot tables" — section appears correctly
- [ ] RCA Room: all 12 cases load without error, sticky next bar works
- [ ] Animation pass verified on real device: page transitions fade (not snap), cards stagger on room entry, debrief panel springs in after reveal, Next button pulses, modals slide up — check desktop and mobile Safari

### Tester brief
*One prompt only — send this verbatim:*

> You have a [their role] interview coming up. Paste your actual job description into Defense Strategy (under Tools in the left menu), rate yourself on each skill honestly, pick your time horizon, and build your plan. Then do 3 cases in the first room it recommends. That's it. Tell me: did the plan feel like it was built for your situation, or did it feel generic? Where did you get confused or lose momentum?

### Feedback target
- Does the Defense Strategy plan feel personal or generic?
- Do testers reach the debrief in the practice rooms, or do they drop off before?
- Any room or UI element that caused confusion or required explanation

### What "pass" looks like
At least 2 of 3 testers complete the Defense Strategy flow and at least one practice room session without needing guidance. At least one piece of specific, actionable feedback collected per tester.

### Feedback collected
*Open — fill in when Batch 1 closes*

---

## Batch 2 — Broader + Mobile-First
*Status: STUB — define scope after Batch 1 closes*

### User profile
TBD — likely: PM candidates or career-switchers (less technical, more product-sense focused). Specifically recruit at least 2 mobile-primary testers.

### Scope
TBD — likely: Product Design Room, Prioritization Room, Behavioral Room, and the Interview Simulator. Possibly the Meesho / Company Track flow if Batch 1 feedback suggests company context matters.

### Self-vet checklist
- [ ] Mobile-first pass: entire Batch 2 scope tested on iPhone and Android before any tester invited
- [ ] Batch 1 feedback reviewed and any blockers resolved

### Tester brief
*TBD after Batch 1 closes*

### Feedback target
*TBD*

### Pass criteria
*TBD*

### Feedback collected
*Not yet open*

---

## Batch 3 — Stress Test + Pricing Signal
*Status: STUB*

### Notes
This batch should include the Pricing page explicitly. Ask testers directly: "Does this feel worth paying for? What would make you hesitate?" Broader tester pool, less controlled. By this point the core loop should be solid enough to absorb noise.

---

## Changelog
| Version | Change |
|---|---|
| V4.27.0 | File created. Batch 0 checklist written. Batch 1 fully specified. Batches 2–3 stubbed. |
| V4.39.1 | SQL Lab at 250 problems. Internal preview only (hidden route `/sql-lab`, shortcut `q`). Not yet in Batch 2 checklist — phase 2 features (Study Plan, timer) must ship first. |
| V4.44.0 | SQL Lab now at 130 problems (culled + quality-raised from 250). In Sidebar.jsx nav (no longer hidden). Hints system + timer shipped (V4.43.0). Foundations canonicalized (V4.44.0). Pre-beta gates updated: git push + PostHog confirm + foundations vetting pass before Batch 1 opens. |
