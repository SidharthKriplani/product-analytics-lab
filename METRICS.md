# METRICS.md — PAL Measurement System

What we track, what we measure success by, and what decisions have been made from data. Update baselines when new data is available. This file prevents building in the dark.

---

## Analytics stack

| Property | Value |
|---|---|
| Tool | PostHog (CDN-loaded) |
| Key env var | `VITE_POSTHOG_KEY` (set in Vercel dashboard) |
| Host | `VITE_POSTHOG_HOST` (default: `https://us.i.posthog.com`) |
| Autocapture | Off |
| Pageview capture | Off (manual only) |
| PII policy | `email`, `name`, `ip` stripped from all events via `sanitize_properties` |
| Gate | App works identically with or without the key |
| Auth | Supabase (env-var gated via `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`) — magic link + Google OAuth |

---

## Tracked events

Events fire from `src/App.jsx` (navigation events) and directly from runner components (completion events) via `track()` from `src/utils/analytics.js`.

| Event | When it fires | Properties |
|---|---|---|
| `page_viewed` | Every navigation (room open, page change) | `{ page: string }` |
| `case_opened` | User opens any case that passes the paywall check | `{ room: string, id: string, title: string }` |
| `case_completed` | User submits self-rating / final answer in any runner | `{ room: string, id: string, rating: string\|number\|null }` |
| `paywall_hit` | User tries to open a locked case while `isUnlocked()` is false | `{ room: string, id: string }` |
| `unlocked` | User successfully enters the beta unlock code | _(no properties)_ |
| `open_challenge` | User opens a Cross-Room Challenge | `{ id: string, title: string }` |
| `sql_problem_solved` | User gets a SQL Lab problem correct | `{ problemId: string, difficulty: string, datamartId: string, elapsedSec: number }` |
| `sql_hint_used` | User reveals a hint in SQL Lab | `{ problemId: string, hintIndex: number }` |
| `sql_answer_revealed` | User reveals the answer in SQL Lab (after all hints exhausted) | `{ problemId: string }` |
| `score_summary_copied` | User clicks "Copy Score" button in Interview Simulator debrief | `{ role: string, tier: string, score: string, sessionMode: string }` |

### Rooms tracked via `case_opened`
`stats`, `design`, `review`, `metrics`, `rca`, `cases`, `code`, `prioritization`, `behavioral`, `estimation`, `stat-foundations`, `exp-foundations`, `metrics-foundations`, `rca-foundations`, `growth-analytics`, `bi`, `spot-the-flaw`, `take-home`, `product-design`, `challenges`, `instrumentation`, `sql-lab`

### Events added V5.3.0
| Event | When it fires | Properties |
|---|---|---|
| `gate_shown` | GateOverlay becomes visible to a guest (authGate=true, !user) | `{ room: string\|'unknown', source: 'room_open'\|'post_case' }` |
| `gate_cta_clicked` | User clicks "Sign in" or "See what's included" on GateOverlay | `{ room: string\|'unknown', action: 'sign_in'\|'see_plans' }` |
| `user_signed_in` | Supabase SIGNED_IN event fires (new sign-in, not session restore) | `{}` |
| `forward_pointer_clicked` | User clicks any button on ForwardPointerCard after debrief | `{ room: string, button: 'next_case'\|'defense_doc'\|'company_tracks' }` |
| `debrief_copied` | User clicks the DebriefCopyButton and clipboard write succeeds | `{ room: string, difficulty: string }` |

### Events not yet tracked (remaining gaps)
- Debrief revealed (requires changes to all 17 runners — deferred)
- Hint expanded (SQL Lab — low priority)
- Playbook article opened, Search query, Bookmark added/removed
- Interview Simulator session completed, MCQ Trainer session scored, Defense Doc generated
- `user_signed_out` — low priority

---

## User funnel

```
Landing (Home page)
    ↓
Room entry (page_viewed → room page)
    ↓
Case open (case_opened)
    ↓
[Paywall hit → Unlock page]  ← currently bypassed (beta gate = true)
    ↓
Case completion (self-rating submitted) ← case_completed event
    ↓
Return visit (heatmap activity) ← tracked via localStorage, not PostHog
```

### Current funnel gap
Top-of-funnel (page_viewed, case_opened), paywall signal (paywall_hit), and completion signal (case_completed) are all live. Remaining gap: we cannot measure debrief read-through, hint usage, or which specific answers users select.

---

## Success metrics

| Metric | Target | Current baseline | Notes |
|---|---|---|---|
| Weekly active users (WAU) | — | Unknown — PostHog not yet live in prod | Set baseline once PostHog key is live |
| Cases opened per session | ≥ 3 | Unknown | Proxy for engagement depth |
| Return visit rate (7-day) | ≥ 40% | Unknown | Core retention signal |
| Room diversity per user | ≥ 3 rooms visited | Unknown | Breadth engagement |
| Paywall conversion rate | — | 0% (beta gate = true) | Activate when Stripe goes live |
| Most-opened room | — | Unknown | Prioritise content expansion here |
| Most paywall-hit room | — | Unknown | First room to unlock post-beta |

---

## Product health metrics (PM audit — June 2026)

Recommended metrics to track once PostHog is live in prod. Grouped by funnel stage.

### Activation
| Metric | Definition | Why it matters |
|---|---|---|
| Guest → case start rate | % of home visitors who open a practice case (not Foundations) | Measures whether the guest demo path works |
| Guest → debrief completion rate | % of guests who finish a full case end-to-end | The core activation signal — did they feel the product? |
| Sign-up conversion from gate | GateOverlay impressions → sign-ups, broken out by gate type (RCA / SQL / Cases) | Tells you which content converts best — invest content there |
| Day-1 activation rate | % of new sign-ins who complete their first case within 24 hours | The activation event; anything below 30% means onboarding is broken |

### Retention
| Metric | Definition | Why it matters |
|---|---|---|
| D1 / D7 / D30 return rate | % of users who return 1, 7, and 30 days after first visit | The core retention curve — set baselines before any feature changes |
| Cases completed per session | Average case completions per session for signed-in users | Session depth proxy; low = users browsing without engaging |
| Session continuity rate | % of sessions where user opens a second case after completing the first | ForwardPointerCard impact metric — track before and after wiring it |
| Room breadth per user per week | # of distinct rooms visited in a 7-day window | Breadth engagement — correlates with retained users |

### Conversion
| Metric | Definition | Why it matters |
|---|---|---|
| Gate-to-sign-in rate by gate type | Sign-up % per GateOverlay instance, per room | Identifies which room gates are highest leverage for conversion |
| Access code entry attempts per week | Raw weekly count of code input submissions | Demand signal for full unlock — rising trend = product is working |
| Free → paid conversion rate (30-day) | % of signed-in users who unlock within 30 days | The core monetization metric once Stripe goes live |

### Product quality
| Metric | Definition | Why it matters |
|---|---|---|
| Debrief scroll depth | % of debrief text read per case (requires scroll tracking) | If users don\'t read debriefs, the core differentiation (judgment feedback) isn\'t landing |

### Events needed to track these (not yet in PostHog)
- `gate_shown` — GateOverlay rendered, with `{ room, gate_type, user_state: 'guest' | 'free' }`
- `gate_converted` — user signs in or unlocks after a gate impression (tie to prior `gate_shown`)
- `debrief_viewed` — debrief panel opened (distinct from `case_completed`)
- `forward_pointer_clicked` — ForwardPointerCard CTA clicked (session continuity signal)
- `user_signed_in` — Supabase SIGNED_IN forwarded to PostHog (enables cross-device funnel stitching)

---

## localStorage keys (client-side state)

All progress state lives in localStorage. Every key must be included in `onResetAllProgress` in App.jsx. All 18 `pal-*` progress keys are also synced to Supabase `user_progress` table when the user is signed in (see `src/utils/syncProgress.js` — `PROGRESS_KEYS` array).

| Key | Room / Feature | Type |
|---|---|---|
| `exp-lab-theme` | Light/dark mode toggle | `'light' \| 'dark'` |
| `exp-lab-unlocked-v1` | Beta unlock status | `boolean` |
| `exp-lab-progress-v1` | Review Room (legacy key from V1) | per-scenario object |
| `pal-design-progress-v1` | Design Room | per-scenario object |
| `pal-stats-progress-v1` | Stats Room | per-module object |
| `pal-metrics-progress-v2` | Metrics Room | per-case object |
| `pal-rca-progress-v2` | RCA Room | per-case object |
| `pal-cases-progress-v2` | Cases Room | per-case object |
| `pal-code-progress-v1` | Code Room | per-module object |
| `pal-pri-progress-v1` | Prioritization Room | per-scenario object |
| `pal-behavioral-progress-v1` | Behavioral Room | per-question object |
| `pal-estimation-progress-v1` | Estimation Room | per-problem object |
| `pal-sf-progress-v1` | Stat Foundations Room | per-module object |
| `pal-ga-progress-v1` | Growth Analytics Room | per-case object |
| `pal-challenges-progress-v1` | Cross-Room Challenges | per-challenge object |
| `pal-bi-progress-v1` | BI Room | per-case object |
| `pal-stf-progress-v1` | Spot the Flaw Room | per-case object |
| `pal-takehome-progress-v1` | Take-Home Room | per-challenge object |
| `pal-instrumentation-progress-v1` | Instrumentation Room | per-case object |
| `pd-progress-*` | Product Design Room (prefix pattern) | per-scenario, per-phase |
| `pal-bookmarks-v1` | Bookmarks (cross-room) | array of `{ room, id }` |
| `pal-notes-v1` | Active Recall textarea | per-room notes string |
| `pal-role-toggle` | Home page DS/PM role filter | `'DS + PM' \| 'Product DS' \| 'Product PM'` |
| `pal-first-visit` | First-run onboarding modal shown flag | boolean |
| `pal-exp-foundation-progress-v1` | Experimentation Foundations Room | per-module object (`completedAt` per moduleId) |
| `pal-metrics-foundation-progress-v1` | Metrics Foundations Room | per-module object |
| `pal-rca-foundation-progress-v1` | RCA Foundations Room | per-module object |
| `pal-access-code-v1` | Access code unlock gate | stored code string (`DAI2026`) |
| `pal-defense-plan-v1` | Defense Strategy generated plan | serialized room + case ID pairs per day |
| `pal-last-visited-*` | Last visited timestamp per room | ISO timestamp |
| `pal-sql-lab-solved-v1` | SQL Lab — solved problem IDs | JSON array of ID strings |
| `pal-sql-lab-times-v1` | SQL Lab — per-problem solve times | JSON object: problem ID → elapsed seconds (written on correct solve) |
| `pal-sql-lab-dates-v1` | SQL Lab — solve dates for streak/heatmap | JSON object: date string → solve count (feeds Progress.jsx heatmap) |
| `pal-onboarded-v1` | Home page — first-visit onboarding shown flag | `'1'` once dismissed |

---

## Decisions made from metric data

| Date | Decision | Signal |
|---|---|---|
| V2.3 | Opened all content for free during beta | No conversion data existed; couldn't charge without usage proof |
| V3.6 | Stripe scaffolded but not activated | Beta still running; no retention or testimonial data to support paid launch |
| V4.47.0 | PostHog env var set in Vercel, awaiting user confirmation it's live in prod | Key configured but activation status unknown until user verifies in dashboard |

---

## Next measurement priorities

Before any paid conversion attempt, establish these baselines:

1. **NEXT (user gate):** Confirm `VITE_POSTHOG_KEY` is active in Vercel production environment (user to check dashboard)
2. Once confirmed live: Measure WAU and 7-day return rate for 4 weeks
3. ✅ `case_completed` event shipped — all 18 runners instrumented (V4.6.1)
4. ✅ SQL Lab events added: `sql_problem_solved`, `sql_hint_used`, `sql_answer_revealed` (V4.46.0)
5. Identify the most-opened room (content expansion priority) — requires PostHog live
6. Identify the most paywall-hit room (first unlock candidate post-beta) — requires PostHog live
