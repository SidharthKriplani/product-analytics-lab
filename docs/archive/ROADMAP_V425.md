# Product Analytics Lab — Roadmap

**Current version:** V4.25  
**Last updated:** 2026-05-27  
**Status:** Active development — beta access open

---

## Sprint recap: V4.20–V4.25 — Conversion + Quality pass ✅ COMPLETE

Priority levels defined during the "take my money?" audit (2026-05-27). All P0–P3 items shipped. P4 (auth) partially shipped.

### P0 — Build integrity ✅ DONE (V4.20)

| Item | Status | Version |
|------|--------|---------|
| App.jsx static data imports (~1MB initial bundle) — replace with caseIndex.js slim arrays | ✅ done | V4.20 |
| "Junior Miss" label in Progress.jsx — replace with "Junior-Ready" | ✅ done | V4.20 |
| Font size floor: 0.68rem minimum across all JSX | ✅ done | V4.20 |

### P1 — Conversion delta ✅ DONE (V4.21–V4.25)

| Item | Status | Version |
|------|--------|---------|
| Full Pricing page rewrite — outcome copy, risk reversal, free tier reframe | ✅ done | V4.18 |
| First-visit hero on Home — headline + subtitle + CTAs + trust line | ✅ done | V4.19 |
| Product preview mockup in hero — live Stats Room case card | ✅ done | V4.21 |
| Home hero "Try it live →" — filled accent button (was ghost link) | ✅ done | V4.24 |
| Onboarding modal deferred 4s — stops firing before user sees content | ✅ done | V4.24 |
| Sticky "Next case" CTA in runners — ChallengesRunner + RCARunner + CaseRunner + BIRunner | ✅ done | V4.24–V4.25 |
| Room browser "next case" highlight — all 16 case room browsers | ✅ done | V4.25 |

### P2 — New user experience ✅ DONE (V4.22)

| Item | Status | Version |
|------|--------|---------|
| Nav IA cleanup — remove emojis, fix "Instrum." truncation, remove Consult | ✅ done | V4.22 |
| Pricing raise — $49 → $69 one-time | ✅ done | V4.22 |

### P3 — Content depth ✅ DONE (V4.23)

| Item | Status | Notes |
|------|--------|-------|
| Challenges room: 6 → 16 cases | ✅ done | CHL07–CHL16: Spotify, Amazon, LinkedIn, DoorDash, Slack, Pinterest, Shopify, Duolingo, Figma, Instacart |
| Challenges difficulty filter — All / Senior / Staff pills | ✅ done | V4.24 |
| SQL live coding environment improvements | ⬜ deferred | Lower priority than auth/distribution |

### P4 — Auth + cross-device sync ✅ PARTIALLY DONE (V4.24–V4.25)

| Item | Status | Notes |
|------|--------|-------|
| Supabase auth layer — magic link + Google OAuth | ✅ done | V4.24 — `src/utils/supabase.js`, `auth.js`, `syncProgress.js`, `AuthModal.jsx` |
| Sign-in button in header nav (desktop + mobile) | ✅ done | V4.24–V4.25 — Sidebar + mobile topbar |
| Progress sync on sign-in (pull/push) | ✅ done | V4.24 |
| Progress sync on tab close (visibilitychange) | ✅ done | V4.25 |
| Supabase env vars in Vercel | ⬜ pending (user action) | Add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` — see `SETUP_AUTH.md` |
| Paywall backend verification | ⬜ deferred | Server-side receipt validation before Stripe goes live |

### P5 — Distribution
Without users, none of the above matters.

| Item | Description |
|------|-------------|
| Build one real distribution channel | LinkedIn content engine, Reddit (r/datascience, r/ProductManagement), or direct outreach to bootcamps |
| Referral mechanic | "Share your score / share a case" viral loop |

---

## What shipped (V1 → V4.25)

| Version | Major additions |
|---------|----------------|
| V1 | 8 A/B test review scenarios — Ship/Rollback/Investigate |
| V1.2 | Design Room, platform rebrand to Product Analytics Lab |
| V1.5–1.6 | Stats Room (claim-evaluation mechanic), paired Design↔Review |
| V2.0 | Metrics, RCA, Cases rooms; readiness summary on Progress |
| V3.0–3.2 | Product Design, Code, Prioritization, Behavioral, Estimation rooms |
| V3.3–3.4 | Code Room SQL+Python expansion; causal inference STAT17–20; rooms to 9 |
| V3.5 | Stat Foundations (20 interactive modules), learning paths |
| V3.6 | 69 blog articles, Pricing page, SEO, mobile responsive fixes |
| V4.0–4.1 | Growth Analytics Room (charts), Interview Simulator, A/B Interpreter, Practice Heatmap, Daily Drill |
| V4.2 | Global Search, Bookmarks, MCQ Trainer, Consultation Space, Company Tracks, keyboard shortcuts |
| V4.3 | Cross-Room Challenges, Pyodide Python runner, Interview MCQ+speech, grouped nav, 40 MCQs |
| V4.4 | BI Room (12 cases), Spot the Flaw (12 cases), Take-Home Challenges, Defense Doc Generator, Leadership Lens |
| V4.5 | Analytics Instrumentation Room (8 cases), Progress full coverage, BI/STF expansions |
| V4.6–4.14 | PostHog instrumentation, per-case notes, search filters, Playbook redesign, bug fixes, build safety |
| V4.20–4.21 | Bundle split, hero redesign, product preview mockup, pricing rewrite |
| V4.22 | Nav cleanup (no emojis, Consult removed), $69 pricing |
| V4.23 | Challenges 6→16 cases (CHL07–CHL16) |
| V4.24 | UX pass: difficulty filter, sticky next CTA (Challenges), deferred modal, filled hero CTA; Supabase auth layer |
| V4.25 | Next-case highlight all 16 browsers, sticky CTA for RCA/Cases/BI runners, auth hardening (visibilitychange sync, mobile sign-in, README docs) |

---

## Current platform scope (V4.25)

**17 practice rooms** — 200+ cases/modules total  
**5 practice tools** — Challenges, Spot the Flaw, Take-Home, Simulator, A/B Tool  
**5 utility tools** — Search, Trainer, Companies, Defense Doc, Bookmarks  
**80 articles** — Blog/Playbook  
**40 MCQs** — Trainer question bank  

---

## Next up (V4.26 candidates)

**Monetization (highest leverage)**
- Flip `isUnlocked()` → `false` in `src/utils/unlock.js` and set `VITE_STRIPE_PAYMENT_LINK` in Vercel env vars
- Add Supabase env vars to Vercel to activate auth + cross-device sync
- Confirm `VITE_POSTHOG_KEY` is live and establish WAU baseline

**Content depth**
- Cases Room expansion: pricing strategy, international expansion (C13+)
- STAT17–20+: more causal inference (IV estimation, synthetic control, geo holdout)
- Take-Home TH06+: marketplace, fintech, health prompts
- Behavioral BEH31+: Staff/Director-level leadership scenarios

**UX polish**
- First-Time User cold walk-through audit in incognito (sidebar nav not audited since V4.7)
- Mobile bottom nav rail for most-used rooms

---

## Monetization (ready to activate)

The paywall is scaffolded and ready:
- `src/utils/unlock.js`: `isUnlocked()` returns `true` for beta — **flip to `false` when Stripe goes live**
- `src/pages/Pricing.jsx`: $69 one-time pricing page
- Stripe integration: `VITE_STRIPE_PAYMENT_LINK` env var, wired into Pricing CTA
- **To activate**: set `isUnlocked()` → `false` in unlock.js, set `VITE_STRIPE_PAYMENT_LINK` in Vercel env vars

---

## V5 — Platform features (planned, no timeline)

These require backend infrastructure beyond what Supabase auth provides:

- **Team accounts + org dashboards** — for training/onboarding use cases
- **Custom scenario upload** — let orgs add their own cases
- **Interview prep certification** — scored, timed, exportable sessions
- **Calibration gap analytics** — team-level aggregated weak area detection

---

## What will not be built

- **Statistics tutorial content** — PAL assumes users know the basics. Formula modules and glossaries are out of scope.
- **AI-evaluated open answers** — All scoring is pre-computed. No LLM evaluation of user reasoning.
- **Social / gamification features** — Leaderboards, streaks, badges distort the goal (better judgment) toward proxy metrics (usage).
- **ML systems content** — PAL covers product analytics and PM. Separate ML Systems Lab project handles that scope.

---

## Architecture constants

| Property | Value |
|----------|-------|
| Stack | React 18 + Vite 8 |
| Hosting | Vercel (static, free tier) |
| Backend | Supabase (auth + progress sync, env-var gated) |
| Data storage | localStorage (18 keys) + Supabase `user_progress` table (when auth active) |
| Code splitting | React.lazy + Suspense on all 30+ room components |
| Python runtime | Pyodide (in-browser, loaded on demand in Code Room) |
| Analytics | PostHog (CDN, env-var gated, no PII) |
| Build command | `npm_config_cache=/tmp/npm-cache ./node_modules/.bin/vite build --outDir /tmp/dist-*` |
| Repo | github.com/SidharthKriplani/experimentation-systems-lab |

## Decision log

**Why no backend through V4.5?**
Zero operating cost. Vercel free tier handles any traffic level. The tradeoff (no cross-device sync, no team accounts) was acceptable until monetization justified infrastructure spend.

**Why Supabase for auth (V4.24+)?**
Zero backend cost at PAL's current scale. Supabase free tier handles auth + progress sync for thousands of users. The entire auth layer is env-var gated — the app runs in localStorage-only mode if the env vars are not set, preserving zero-cost operation for development and beta.

**Why pre-computed scoring?**
Consistency and auditability. Users need to trace why a decision scored as it did. Pre-computed scoring with explicit feedback text is more trustworthy than LLM evaluation at this scale.

**Why keep ML systems out of PAL?**
There is a separate ML Systems Lab project for that scope. PAL stays focused on product analytics and PM. Cross-contaminating the scope would dilute both products.
