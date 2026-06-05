# NEXT.md — Session Queue

Read at the start of every build session. Max 5 items, ordered by priority. Update before closing.

*Last updated: V4.86.0 (2026-06-03)*

---

## Pre-beta gates (user actions, not code)

1. **Git push from Mac terminal** — see BRAIN_TRANSFER.md git commit section
2. **Confirm `VITE_POSTHOG_KEY` live in Vercel** — check env vars dashboard, establish WAU baseline

---

## Active build queue (V4.94.0 sprint)

**Note (V4.94–4.98):** Full sprint complete. GateOverlay, Plans.jsx, 8 new cases, forensic isFree, progress saved/sign-in nudge, Metric Universe Atlas — all shipped. Build ✓.

**1. spokenSummary backfill** ← delegate as subagent writing pass
Create `src/components/shared/GateOverlay.jsx`. Fix App.jsx: anonymous users hitting gated pages see GateOverlay, not a redirect to home. Migrate CompanyTracks.jsx + InterviewSimulator.jsx inline gates to GateOverlay. DECISIONS.md gate copy table is the source of truth for copy.

**2. Plans.jsx — unified tier page**
Merge `Pricing.jsx` + `Unlock.jsx` into `Plans.jsx`. Three-tier layout: Guest / Free / Premium. Access code input prominent in Premium column. Wire to App.jsx + Sidebar.jsx. All "Unlock →" CTAs in app route to `'plans'`, not `'unlock'`.

**3. 8 new cases (content authoring)**
RCA27 orders-down/sessions-stable · RCA28 RTO-spike-tier2/3 · C21 prepaid-adoption · C22 restrict-high-RTO-COD · C23 CVR-vs-contribution-tradeoff · s30 CTR-up/margin-down (check s09 first) · s31 CVR-up/return-rate-up · s32 SRM+segment-harm. All go in existing runners — no runner changes. See gap analysis in MSL_STRUCTURE_BRIEF.md for case specs.

**4. Free-tier polish**
Mark all 25 forensic SQL problems `isFree: true` (data change only). Add "Progress saved" micro-confirmation for signed-in free users. Add sign-in prompt at demo case debrief for anonymous users.

**5. Metric Universe Atlas panel**
New `MetricAtlasPanel` component in MetricsBrowser.jsx. Toggle button in header. 6 v1 categories: Growth, Conversion/Funnel, Revenue/Monetization, Marketplace Health, Quality/Trust/Returns, Engagement. ~4 cards each. Sign-in free access.

---

## Deferred (own sessions, not blocking)

**spokenSummary backfill** — RCA05–RCA24 + all Business cases. Subagent writing pass.

**Experiment Design phase** — Add "design the test" phase to Review Room runner. Structural runner change, separate sprint.

**Analyst product sense** — New subsection in Cases room or Product Design. product_sense_ds_packet is ready source material.

**Interview Simulator expansion** — Gate: confirm PostHog WAU data first.

**Start Here pinned articles** — Requires `pinned` field in blog data + home page changes. Separate session.
