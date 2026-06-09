# NEXT.md — Session Queue

Read at the start of every build session. Max 5 items, ordered by priority. Update before closing.

*Last updated: V5.29.0 (2026-06-10)*

---

## Status — V5.25.0: Full Loop fl01 QA pass complete. 3 bugs fixed (date split, duplicate android payment, missing ios/web UPI data). All 3 queries verified in Node. Build ✓.

PAL is ready for a 3–5 person private test. See PRIVATE_TEST.md for tester profile, path, questions, and success criteria.

**Public distribution is blocked until private-test feedback is collected.** The next decision after private test: either one more coherence sprint (if testers find navigation or gate confusion) or controlled public launch prep.

## Pre-beta gates (user actions, not code)

1. **Run private test** — send to 3–5 qualified testers per PRIVATE_TEST.md
2. **Confirm `VITE_POSTHOG_KEY` live in Vercel** — check env vars dashboard, establish WAU baseline

---

## Active build queue

**1. Share buttons** — Deep-link routing is done (V5.22.0). Add copy-link button to runner headers and SQL Lab problem card. Trivial now that URLs exist.

**2. Private test round 2** — Send to 3–5 testers per PRIVATE_TEST.md. Focus on Full Loop + hash routing feedback.

**3. Meesho Project Defense family** — 13 director cards for project defense. Needs user's project context.

**4. PostHog event wiring** — gate_shown, gate_converted, debrief_viewed, forward_pointer_clicked. Needed for real funnel data.

**5. QA pass: fl02–fl10** — Same verification as fl01. Run each case's correctQuerySqlite against seed data in Node. Spot-check date windows and cross-dimension coverage.

---

## Recently shipped (V5.22.0 → V5.23.0)

- ✅ Full Loop 5-phase rebuild (V5.23.0)
- ✅ Deep link auth race fix (V5.23.0)
- ✅ Hash-based URL routing — all rooms, cases, SQL problems (V5.22.0)
- ✅ Right-side module index in foundation runners (V5.22.0)
- ✅ Bug fixes #152-155, #157-158 (V5.22.0)
- ✅ Meesho Experiment Design + SQL families (V5.22.0)
- ✅ Guest demo path + empty state + Plans copy (V5.22.0)
- ✅ Universe View V2 (V5.22.0)

---

## Deferred — do not build until after private test feedback

**spokenSummary backfill** — RCA05–RCA26 + C01–C25. Subagent writing pass. Non-blocking.

**Stripe / payment** — Post-private test. No timeline.

**Sign-in tier value expansion** — Increase `isFree` case count from ~3 to ~8 per room. Gate: private test feedback.

**Progress next-suggestion card** — "Continue where you left off" widget. See IDEAS.md Tier 1.

**Mobile-first drill IA** — Audit #162. Prioritize case rooms over Foundations on mobile. V6 territory.

**Interview Simulator expansion** — Gate: PostHog WAU data first.

**Analyst product sense** — New subsection in Cases room or Product Design.
