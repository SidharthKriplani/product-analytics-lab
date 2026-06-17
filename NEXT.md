# NEXT.md — Session Queue

Read at the start of every build session. Max 5 items, ordered by priority. Update before closing.

*Last updated: 2026-06-18 (V5.34.4: build fully green — StudyRoom, Python Lab, Dimensional Modeling, STF, codeModules, git mmap resolved)*

---

## Status — V5.34.4 live. Build green. StudyRoom loads. Python Lab in sidebar. Dimensional Modeling skeleton wired.

Private test still pending. Public distribution blocked until private-test feedback collected.

## Pre-beta gates (user actions, not code)

1. **Confirm `VITE_POSTHOG_KEY` live in Vercel** — check env vars dashboard, establish WAU baseline

---

## Active build queue

**1. Dimensional modeling cases** — skeleton shipped (V5.34.0). Next: author 3-5 schema-critique cases tagged `data-modeling`. Flipkart DA track references these once live.

**2. Share buttons** — Deep-link routing done (V5.22.0). Add copy-link button to runner headers and SQL Lab problem card.

**3. PostHog event wiring** — gate_shown, gate_converted, debrief_viewed, forward_pointer_clicked. Needed for real funnel data.

---

## Recently shipped

- ✅ V5.34.6 — CodeBrowser + CodeRunner wired into App.jsx (were built but never imported/routed; clicking Code Lab went nowhere)
- ✅ V5.34.5 — sitemap, code progress reset key, CLAUDE/DECISIONS/AUDITS/NEXT/CHANGELOG updated
- ✅ V5.34.4 — PythonLabBrowser.jsx committed (was on disk, never in git due to mmap failures); pal-code-progress-v1 added to onResetAllProgress; sitemap updated
- ✅ V5.34.3 — codeModules.js build fix (unescaped quote line 1330), STF double-comma fix (Progress crash), Python Lab + Dimensional Modeling fully wired in sidebar, code-2 + layers icons added
- ✅ V5.34.0 — StudyRoom auth gate removed (was gated on `user &&` — null in beta), Dimensional Modeling coming-soon skeleton (Sidebar + App.jsx wired)
- ✅ V5.33.0 — 10 Python modules in Code Lab (code23–32: pandas groupby/merge/pivot/rolling, numpy percentile, resample WoW, Counter, apply classify, cohort LTV, data cleaning) + Python Lab skeleton page
- ✅ V5.32.x — STF Python cases (STF13–17), Python filter in STF browser, Bangalore company tracks (Swiggy DA, Zepto PA, Flipkart DA), StudyRoom localStorage (SM-2, 346 cards), ErrorBoundary nav reset fix, dark mode fixed
- ✅ V5.31.x — Prep Cheatsheet page (4 time-boxed plans + quick reference), App.jsx + Sidebar.jsx wiring, git repo consolidated
- ✅ Casefile OS + Terminal Lab visual identity (two-axis CSS: mode-casefile/mode-terminal + theme-light/dark on app-layout)
- ✅ Study Room — architecture rebuilt to localStorage (no Supabase), 346 cards, SM-2 spaced repetition
- ✅ V5.29.0 — 21-room nav audit (Stats Calc → A/B Interpreter, Cases → Analytics Cases)

---

## Deferred — do not build until after private test feedback

**spokenSummary backfill** — RCA05–RCA26 + C01–C25. Subagent writing pass. Non-blocking.

**Stripe / payment** — Post-private test. No timeline.

**Sign-in tier value expansion** — Increase `isFree` case count from ~3 to ~8 per room.

**Progress next-suggestion card** — "Continue where you left off" widget. See IDEAS.md Tier 1.

**Mobile-first drill IA** — Audit #162. V6 territory.

**Interview Simulator expansion** — Gate: PostHog WAU data first.

**Study Room v2** — Weak-topic tracker export, notes, RCA scenario drills. Gate: v1 deployed and used.

**Study Room PWA** — manifest.json + service worker for offline queue. Gate: v1 working.

**GenAI/ML Lab — deep mastery track (strategic direction, not yet scoped)**
User intent: build genuine depth in GenAI, transformers, RAG, LLMs — not interview recall, but real competence. The bar is "can riff on it, have my own ideas, want to run experiments on Colab/GPU." This is about owning the material so interviews become incidental. GT/GAL section is the likely home. Approach when scoped: pick one concrete thing to *build* (not survey), go deep enough that it generates ideas, let adjacent concepts pull in naturally. Do NOT design a curriculum — design a first project. Pending: user to decide what to build first.
