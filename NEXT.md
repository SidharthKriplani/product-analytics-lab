# NEXT.md — Session Queue

Read at the start of every build session. Max 5 items, ordered by priority. Update before closing.

*Last updated: V5.16.1 (2026-06-07)*

---

## Status — V5.16.1: Session complete (2026-06-07). Benchmark live. Homepage repositioned. Plans page restructured (pricing-led). Resuming Tuesday.

PAL is ready for a 3–5 person private test. See PRIVATE_TEST.md for tester profile, path, questions, and success criteria.

**Public distribution is blocked until private-test feedback is collected.** The next decision after private test: either one more coherence sprint (if testers find navigation or gate confusion) or controlled public launch prep.

## Pre-beta gates (user actions, not code)

1. **Run private test** — send to 3–5 qualified testers per PRIVATE_TEST.md
2. **Confirm `VITE_POSTHOG_KEY` live in Vercel** — check env vars dashboard, establish WAU baseline

---

## Active build queue

**P0 — V5.18.0: Meesho directorCards expansion** ← FIRST TASK TUESDAY

No new files. No routing. Just append 7 cards to the existing `directorCards` array inside the Meesho track object in `src/data/companyTracks.js` (line ~165). Schema per card: `{ prompt, expected, line }`. Single quotes, escape apostrophes.

Skeletons ready — just write `expected` and `line` for each on Tuesday:

```js
{
  prompt: 'Placed orders are up 11% WoW. Net delivered orders are flat. RTO is up 4pp, concentrated in tier 2/3 cities.',
  expected: '/* pillar 7 — placed vs delivered divergence, tier 2/3 cut, reverse logistics cost */',
  line: '/* model answer */',
},
{
  prompt: 'Prepaid adoption is up but contribution/order is down and payment failure rate is rising.',
  expected: '/* pillar 9 — prepaid mix improving on surface, but wrong cohort being nudged */',
  line: '/* model answer */',
},
{
  prompt: 'New user acquisition is up 20% MoM but repeat purchase rate in month-2 cohorts has dropped.',
  expected: '/* pillar 1 — demand quality, low-intent traffic, repeat vs new mix */',
  line: '/* model answer */',
},
{
  prompt: 'First-order conversion is strong but 60-day retention is falling. CSAT scores are flat.',
  expected: '/* pillar 8 — trust/repeat, post-delivery experience, habit formation */',
  line: '/* model answer */',
},
{
  prompt: 'Seller cancellation rate has risen 3pp in the fashion category over 4 weeks.',
  expected: '/* pillar 6 — fulfillment health, stock-out vs seller behavior, category concentration */',
  line: '/* model answer */',
},
{
  prompt: 'Returns are up 3pp. Top return reason flagged: not as described. Catalog quality score unchanged.',
  expected: '/* pillar 3 — catalog understanding, mismatch complaint, listing accuracy vs buyer expectation */',
  line: '/* model answer */',
},
{
  prompt: 'PDP views per session are up. ATC rate is flat. Checkout start rate is down.',
  expected: '/* pillar 4+5 — buyer decision friction, price/delivery promise visibility, checkout drop */',
  line: '/* model answer */',
},
```

Tuesday: fill `expected` and `line` for all 7, paste into companyTracks.js after the last existing directorCard, commit as V5.18.0.

---

**P1 — V5.17.0: Access gate messaging audit** (partial fix already shipped)

Gate logic is CORRECT: sign-in is mandatory for all non-guestPreview cases. Access code is an additional unlock on top, not a replacement for sign-in.

Root cause of confusion: Unlock.jsx said "no account needed" — wrong. A guest who enters the access code still hits the auth gate on the next non-guestPreview case. **Fixed in V5.16.2:** Unlock.jsx footer updated to "Sign in separately to access free cases and save progress."

Remaining check for Tuesday: audit all rooms to ensure no `guestPreview: true, isFree: false` cases exist — this combination lets guests bypass auth but then hits the unlock gate, sending them to Unlock.jsx (which still implies they're done). If found, flip those cases to `guestPreview: true, isFree: true` (guest preview should always be free-tier accessible too).

Files: `src/data/*Cases.js` — grep for `guestPreview: true` and verify each has `isFree: true` alongside.

---

**P1 — V5.14.0: Homepage repositioning** (already shipped — verify live)

Files: `src/pages/Home.jsx` only. Goal: new visitor understands PAL in under 10 seconds.
- Headline: "Practice product analytics interviews beyond SQL."
- Primary CTA: "Take the Judgment Benchmark →" (routes to page='benchmark')
- Secondary CTA: "Explore Free Cases →" (routes to foundations)
- Role paths: Product Analyst · Growth Analyst · DA moving to product · Senior Analyst
- Social proof: "37 beta sign-ins in the first 48 hours of informal testing."
- "What this tests" section listing 5 areas (same as Benchmark intro)
No redesign — update copy and CTA routing in existing Home.jsx structure.

**P1 — SQL Lab UX** (V5.15.0)
All items confirmed from beta feedback. Files: `src/pages/SqlLabPage.jsx` (primary), possibly `src/data/sqlLabProblems.js` for tag data.
- Question numbering: show problem index (e.g. "Problem 12 of 50") in the problem card header
- Concept tags: already moved behind first-hint reveal (V5.5.0) — verify still working, consider showing 1 tag always visible as a category label
- Compact schema display: current schema panel is verbose; show table name + column list in a scannable grid, collapse by default with expand toggle
- Multi-select filters: difficulty (Easy/Medium/Hard/Master/Forensic) + company + concept tag — currently single-select pills; needs checkbox-style or multi-select chips
- Step-wise hints: if sqlLabProblems.js supports `hints: []` array per problem, render them progressively (Hint 1 → Hint 2 → etc.) instead of all at once
Note: SqlLabPage.jsx is large (~2000+ lines) — Grep before Read, use subagent if context is tight.

**P2 — Pricing ₹ tiers** (V5.16.0)
Plans.jsx: ₹799/month, ₹1,999/quarter, ₹5,999/year, ₹2,499 sprint.
Remove lifetime language. Add "would you pay?" feedback field.

---

**Deferred (non-blocking)**

**UniverseView defects** (Audit #150 — V5.12.0)
Label overlaps, 0%-stub missing, dasharray mismatch. Behind a toggle — not user-journey blocking.
Fix in a low-cost session before broader public launch.

**Guest demo path**
One real practice case fully playable without sign-in — not Foundations theory. Recommended entry: Metrics or RCA room, one `isFree: true` case exposed to guests end-to-end (browser card visible + runner accessible + debrief fully shown). After debrief, GateOverlay fires: "Sign in to save this and keep practicing." Current flow (guest → FoundationHub → theory) never lets guests feel the product. This is the top-of-funnel conversion hole. Implementation: remove `requireUser()` guard from one open handler per room (or add a `guestDemo: true` flag on one case per room and allow it through). Audit #147 (ForwardPointerCard) can be fixed in the same session.

**4. New signed-in user empty state**
Progress is the signed-in home — correct for returning users, broken for day-1. On first visit (no cases completed), Progress must show: a "Start here →" card pointing to one specific room (Metrics or RCA by default), a brief 2-line explainer of what PAL is, and a clear next action. Do not show an empty heatmap and zero-count room cards. This is an onboarding problem hiding as a UI problem.

**5. Plans.jsx copy pass**
Current tier descriptions are feature-listed, not outcome-framed. Every row and tier description needs one revision pass before launch. Rule is in DECISIONS.md: outcome-framed copy only. No code changes — copy-only edit in Plans.jsx.

**P1 — Shipped V5.1.0**

**4. ForwardPointerCard wired at every debrief** ✅ (Audit #147 closed)
CodeRunner + TakehomeRunner were missing it. Both wired. All 17 runners now have ForwardPointerCard at debrief exit.

**5. Forensic SQL gate split** ✅ (Audit #148 closed)
f01–f10 isFree: true. f11–f25 isFree: false. 15 problems gated.

---

## Shipped V5.2.0

3-tier access model live. `guestPreview: true` on 1 case per room (17 rooms). `requireUser(guestPreview, isFree, room)` — guests gate on `!guestPreview`, signed-in free gate on `!isFree && !unlocked`. See DECISIONS.md for standing rule.

---

## Deferred — do not build until after private test feedback

**Sign-in tier expansion Phase 2** — Increase isFree case count from ~3 to ~6–8 per room. Spec in IDEAS.md Tier 1. Gate: private test must confirm sign-in feels worth it; if it does, this deepens it.

**spokenSummary backfill** — RCA05–RCA26 + C01–C25. Subagent writing pass. Non-blocking.

**PostHog event wiring** — gate_shown, gate_converted, debrief_viewed, forward_pointer_clicked. Needed for real funnel data. Non-blocking for private test.

**Stripe / payment** — Post-private test. No timeline.

**Interview Simulator expansion** — Gate: PostHog WAU data first.

**Sign-in tier value expansion** — Increase `isFree` case count from ~3 to ~8 per room for signed-in users. Gives free tier genuine value before conversion ask. See IDEAS.md Tier 1.

**Progress home next-suggestion card** — "Continue where you left off" widget on Progress page. Last-active room + case, one click to resume. See IDEAS.md Tier 1.

**Experiment Design phase** — Add "design the test" phase to Review Room runner. Structural runner change, separate sprint.

**Interview Simulator expansion** — Gate: confirm PostHog WAU data first.

**Analyst product sense** — New subsection in Cases room or Product Design. product_sense_ds_packet ready.

**Start Here pinned articles** — Requires `pinned` field in blog data + home page changes. Separate session.
