# NEXT.md — Session Queue

Read at the start of every build session. Max 5 items, ordered by priority. Update before closing.

*Last updated: V5.4.0 (2026-06-06)*

---

## Status — V5.4.0: Meesho SBA track live. Company Tracks visual revamp complete. Beta-ready.

PAL is ready for a 3–5 person private test. See PRIVATE_TEST.md for tester profile, path, questions, and success criteria.

**Public distribution is blocked until private-test feedback is collected.** The next decision after private test: either one more coherence sprint (if testers find navigation or gate confusion) or controlled public launch prep.

## Pre-beta gates (user actions, not code)

1. **Run private test** — send to 3–5 qualified testers per PRIVATE_TEST.md
2. **Confirm `VITE_POSTHOG_KEY` live in Vercel** — check env vars dashboard, establish WAU baseline

---

## Active build queue — PM critique sprint (V5.0+)

**P0 — Must ship before any outreach or paid launch**

**1. Guest demo path** ← HIGHEST PRIORITY
One real practice case fully playable without sign-in — not Foundations theory. Recommended entry: Metrics or RCA room, one `isFree: true` case exposed to guests end-to-end (browser card visible + runner accessible + debrief fully shown). After debrief, GateOverlay fires: "Sign in to save this and keep practicing." Current flow (guest → FoundationHub → theory) never lets guests feel the product. This is the top-of-funnel conversion hole. Implementation: remove `requireUser()` guard from one open handler per room (or add a `guestDemo: true` flag on one case per room and allow it through). Audit #147 (ForwardPointerCard) can be fixed in the same session.

**2. New signed-in user empty state**
Progress is the signed-in home — correct for returning users, broken for day-1. On first visit (no cases completed), Progress must show: a "Start here →" card pointing to one specific room (Metrics or RCA by default), a brief 2-line explainer of what PAL is, and a clear next action. Do not show an empty heatmap and zero-count room cards. This is an onboarding problem hiding as a UI problem.

**3. Plans.jsx copy pass**
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
