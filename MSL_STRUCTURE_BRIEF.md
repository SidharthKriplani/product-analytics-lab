# MSL Structure Brief — PAL as Reference Implementation

This document explains PAL's full architecture for auth, routing, home, profile, progress, and access tiers so MSL can replicate the same patterns exactly. Read this before touching App.jsx, Home, Profile, or Progress in MSL.

---

## Tech stack

React + Vite SPA. No React Router — routing is a single `page` state string in App.jsx. All auth is Supabase (email magic link + Google OAuth + GitHub OAuth). Progress is localStorage-first, with optional Supabase sync. Deployed on Vercel.

---

## Project layout that matters

```
src/
  App.jsx                    — all routing, all auth state, all open-case handlers
  index.css                  — full CSS variable theme system
  pages/
    Home.jsx                 — signed-out full-screen landing (no sidebar)
    Progress.jsx             — signed-in home (replaces Home for authed users)
    ProfilePage.jsx          — profile, stats, sync, plans, settings
    Pricing.jsx              — plans/unlock page
  components/
    auth/AuthModal.jsx       — sign-in modal (3 methods)
    layout/Sidebar.jsx       — primary nav (only shown when signed in)
  utils/
    auth.js                  — signInWithEmail, signInWithGoogle, signInWithGitHub, signOut
    supabase.js              — supabase client (env-var gated)
    unlock.js                — access tier: anonymous / free / premium
    syncProgress.js          — push/pull progress to Supabase
```

---

## Routing system

PAL has no URL-based routing. Everything is one state variable:

```js
const [page, setPage] = useState('home');
```

`navigate(target)` just calls `setPage(target)`. The main JSX block is a chain of `if (page === 'x') return <Component />` checks. This is the entire router.

**Key rule:** when you add a new room or page, you add:
1. A `lazy()` import at the top of App.jsx
2. An open-function that calls `setPage('your-runner')`
3. A routing block in the main JSX chain

---

## Signed-out state: the layout

When `!user`, the `app-layout` div gets class `signed-out`. CSS handles the rest:

```css
.signed-out .app-sidebar    { display: none; }
.signed-out .app-main-wrapper { margin-left: 0; }
.signed-out .mobile-topbar  { display: none; }
```

The sidebar is hidden. The main content is full-width. There is no header. The signed-out experience is just the Home page, full-screen.

---

## Home.jsx — signed-out landing

This is a full-screen centered layout with no sidebar. Key design decisions:

**Background:** Two large radial gradient orbs, absolute-positioned, animating slowly with `palLandingBgDrift` keyframe. They are decorative only (`aria-hidden`, `pointer-events: none`).

**Ghost data snippets:** 8 floating analytics strings (`p = 0.04`, `DAU ↓ 31%`, `SRM detected`, etc.) that fade in/out at random positions. Monospace font, blurred slightly, `aria-hidden`. These hint at the content inside PAL without explaining it.

**Main content:** Centered column, `maxWidth: 560px`. Structure:
1. Small badge — logo icon + "Product Analytics Lab" text in uppercase
2. Two-line headline — line 1 in `var(--text)`, line 2 in `var(--accent)`. Specific to the product. PAL uses "You know the framework. / Can you diagnose the drop?"
3. Subtext paragraph — one sentence on what it is, one on the scope
4. Two CTAs:
   - Primary: `Sign in to analyze →` — calls `onShowAuth()` which sets `showAuth: true` in App.jsx
   - Secondary: `Explore without signing in` — navigates to a free foundation room
5. Footer note: `Free to start · No account required for first 3 cases per room`

**Animation:** Each element has class `pal-landing-el` with staggered `animationDelay` (0ms, 120ms, 260ms, 420ms, 580ms, 720ms). The class does a subtle fade+rise entrance.

**Props:** `{ onNavigate, onShowAuth }` — both passed from App.jsx.

---

## Auth modal — AuthModal.jsx

Triggered by `showAuth` state in App.jsx. Rendered as a fixed overlay at `z-index: 1000` — OUTSIDE any transformed/fixed ancestor (render it at the end of the App return, not inside any panel).

**Two steps:** `'main'` and `'sent'`.

**Main step — 3 sign-in methods:**
1. Google OAuth button — calls `signInWithGoogle()` → `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`
2. GitHub OAuth button — same pattern with `provider: 'github'`
3. Email magic link — form with email input → `signInWithEmail(email)` → `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })`

On email submit success: switch to `'sent'` step.

**Sent step:** Shows email address the link was sent to, instructions to click the link, and a Back button to return to `'main'`.

**Loading/error state:** `loading` boolean disables all buttons. `error` string shows below the form.

**Closing:** Click overlay background OR click ×. Both call `onClose()`.

---

## Auth state management in App.jsx

This is the most important section. Get this wrong and sign-in/sign-out/refresh all break.

```js
const [user, setUser] = useState(null);
const [showAuth, setShowAuth] = useState(false);

useEffect(() => {
  const { data: { subscription } } = onAuthStateChange((event, session) => {
    if (
      (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')
      && session?.user
    ) {
      setUser(session.user);
      setShowAuth(false);
      if (event === 'SIGNED_IN') {
        setPage(p => p === 'home' ? 'progress' : p);
      }
      if (event === 'INITIAL_SESSION') {
        setPage(p => p === 'home' ? 'progress' : p);
      }
    } else if (event === 'SIGNED_OUT') {
      setUser(null);
      setPage('home');
    }
  });
  return () => subscription.unsubscribe();
}, []);
```

**Critical: handle all three events — SIGNED_IN, INITIAL_SESSION, TOKEN_REFRESHED.**

- `SIGNED_IN` fires when the user actively logs in (OAuth redirect or magic link click)
- `INITIAL_SESSION` fires on page LOAD when a session already exists (Supabase v2 behavior). Without this, a page refresh appears to log the user out even though the session is valid.
- `TOKEN_REFRESHED` fires when the JWT is silently refreshed. Handle it so the user object stays current.

Missing `INITIAL_SESSION` = users appear logged out on page refresh. This is a known Supabase v2 gotcha.

**Also add a reactive redirect** for cases where the user signs in while on the home page via back-navigation:

```js
useEffect(() => {
  if (user && page === 'home') setPage('progress');
}, [user, page]);
```

---

## Signed-in landing: Progress page

When a user is signed in, `page` starts at `'progress'` (not `'home'`). The sidebar is visible. Progress is the default home for authenticated users.

Progress page is NOT shown in the sidebar nav — instead, the logo click navigates to `'progress'`.

What Progress contains (PAL's implementation):
- Streak heatmap (52-week grid of practice activity)
- Per-room completion bars
- "Next suggested" room logic
- Guided path card for beginners
- Company Tracks teaser

MSL should have its own equivalent — a dashboard view showing what the user has done and what's next.

---

## ProfilePage.jsx — 5 cards

Profile is accessible from the sidebar. It renders two states:

**Signed-out state:** A single card with "Sign in to see your profile" + sign-in button (calls `onShowAuth`). No stats, no settings.

**Signed-in state:** 5 cards in a vertical column, `maxWidth: 700px`, centered.

### Card 1 — Identity
- Avatar: `user.user_metadata.avatar_url` (from OAuth provider) or initials fallback
- Display name: `user.user_metadata.full_name || user.user_metadata.name || user.user_metadata.user_name`
- Email: `user.email`
- Provider badge: derived from `user.app_metadata.provider` — "Google", "GitHub", or "Email"
- "Member since": `new Date(user.created_at).toLocaleDateString()`
- Sign out button: calls `signOut()` from auth.js → `supabase.auth.signOut()`

### Card 2 — Practice stats
- Reads all localStorage progress keys, counts completed items per room
- Shows: total cases done, rooms active, bookmarks count — as 3 metric tiles
- Room breakdown as small chips (e.g. "RCA 12", "SQL Lab 30")
- "View full progress →" link to Progress page

Different rooms use different localStorage schemas — you need to handle each type:
- `type: 'attempts_array'` → count entries where `attempts.length > 0`
- `type: 'attempts_num'`   → count entries where `attempts > 0`
- `type: 'rating'`         → count entries where `rating` is truthy
- `type: 'completedAt'`    → count entries where `completedAt` is truthy
- SQL Lab: stored as a Set (array) — count the array length directly

### Card 3 — Cross-device sync
- Explains automatic sync on sign-in and page unload
- "Sync now" button → calls `pushProgressToSupabase(user)` then `pullProgressFromSupabase(user)`
- Button shows "Syncing...", "Synced", "Error — retry" states with 3-second auto-reset

### Card 4 — Study plans
- Reads localStorage for any active plans (Defense plan: `pal-defense-plan-v1`, SQL plan: `pal-sql-lab-plan-v1`)
- Shows plan status + quick link to resume or create
- MSL equivalent: whatever plans exist in MSL (e.g. learning path, model study plan)

### Card 5 — Settings
- Theme toggle: reads `theme` prop, calls `onToggleTheme`. Button label = current opposite ("Light mode" / "Dark mode")
- Export progress: reads all known localStorage keys, bundles as JSON, triggers download
- Import progress: file input, reads JSON, writes all keys back, reloads page

---

## Access tier system — unlock.js

Three tiers:

| Tier | Condition | Access |
|---|---|---|
| `'anonymous'` | Not signed in | Foundations only (isFree: true content), no runners |
| `'free'` | Signed in, no code | isFree cases in all rooms + Foundations + Easy SQL |
| `'premium'` | Signed in + access code `DAI2026` | Everything |

```js
export function getAccessTier(user) {
  if (isUnlocked()) return 'premium';   // has valid code in localStorage
  if (user) return 'free';
  return 'anonymous';
}
```

`isUnlocked()` checks localStorage for a valid code. `tryUnlock(code)` saves the code if valid.

**Paywall enforcement in App.jsx:** At the top of App.jsx, a `useEffect` intercepts anonymous users trying to access gated pages:

```js
const AUTH_REQUIRED_PAGES = new Set(['rca-runner', 'metrics-runner', /* all practice runners */]);
useEffect(() => {
  if (!user && AUTH_REQUIRED_PAGES.has(page)) setPage('home');
}, [user, page]);
```

Within each open-function, the per-case paywall check:
```js
function openRCACase(id) {
  const c = rcaCases.find(c => c.id === id);
  if (!c.isFree && !unlocked) { track('paywall_hit', { room: 'rca', id }); setPage('unlock'); return; }
  setRcaCaseId(id);
  setPage('rca-runner');
}
```

**Unlock page** (`src/pages/Pricing.jsx` or `Unlock.jsx`): renders an access code input field. Calls `tryUnlock(code)`. On success, reloads or navigates away. This is what `setPage('unlock')` shows.

**Beta state:** `isUnlocked()` currently always returns true (beta, everyone gets premium). The TODO comment says `// TODO: set to false when Stripe goes live`. Do not change this until Stripe is wired.

---

## Sidebar structure

Sidebar is only visible when `user` is truthy. It has grouped nav sections. PAL's groups: PRACTICE ROOMS / LEARN / TOOLS / TRACK.

Key pattern in Sidebar.jsx:
- `getIsActive(page, keys)` — returns true if current `page` matches any of the keys for that room
- Active item gets `var(--accent)` or room-specific color + `var(--accent-bg)` background
- Logo click navigates to `'progress'` (not `'home'`)

---

## CSS variable system — never hardcode colors

```css
var(--accent)        /* blue — default primary, Exp Foundations, Review Room */
var(--teal)          /* teal — Instrumentation, Stat Foundations, RCA Foundations */
var(--yellow)        /* yellow — Challenges, BI, Take-Home, Code Room */
var(--green)         /* green — Metrics, Metrics Foundations */
var(--red)           /* red — Spot the Flaw */
var(--purple)        /* purple — Product Design, Leadership/Behavioral */
var(--surface)       /* card background */
var(--surface-2)     /* secondary surface (inputs, chips) */
var(--border)        /* border color */
var(--text)          /* primary text */
var(--text-muted)    /* secondary text */
var(--bg)            /* page background */
var(--overlay)       /* modal backdrop (semi-transparent) */
```

Each color has `-bg`, `-border`, and `-text` variants (e.g. `var(--teal-bg)`, `var(--teal-border)`).

---

## Component patterns

**Lazy loading — all page/runner components:**
```js
const MyBrowser = lazy(() => import('./pages/MyBrowser.jsx').then(m => ({ default: m.MyBrowser })));
```
Named exports, not default exports, for all pages and runners. `<Suspense>` wraps the entire `<main>`.

**Room browser header — standard 36×36 icon pattern:**
```jsx
<div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
  <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--COLOR-bg)', border: '1px solid var(--COLOR-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <Icon name='icon-name' size={18} color='var(--COLOR)' />
  </span>
  <div>
    <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--COLOR)', marginBottom: '0.15rem' }}>
      Room Label
    </div>
    <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
      Room Title
    </h1>
  </div>
</div>
```

**Mobile-safe grid:**
```css
gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))'
```

---

## localStorage key convention

All keys follow `pal-[room]-[type]-v[n]`. Examples:
- `pal-rca-progress-v2` — RCA case progress
- `pal-metrics-draft-v1` — MetricsRunner mid-case draft
- `pal-notes-v1` — shared freeform notes across all rooms (keyed internally as `room:caseId`)
- `pal-sql-lab-solved-v1` — SQL Lab solved set
- `pal-access-code-v1` — unlock code
- `pal-bookmarks-v1` — bookmarked cases

**Draft persistence pattern** (mid-case state that survives navigation):
```js
// In progress util:
var DRAFT_KEY = 'pal-[room]-draft-v1';
export function saveDraft(id, state) { try { var d = readDrafts(); d[id] = state; localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch {} }
export function loadDraft(id) { return readDrafts()[id] || null; }
export function clearDraft(id) { try { var d = readDrafts(); delete d[id]; localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch {} }

// In runner: restore on mount, save on state change, clear on submit
const [response, setResponse] = useState(() => existing?.response || loadDraft(id)?.response || '');
useEffect(() => { if (!existing?.rating) saveDraft(id, { response }); }, [response]);
function handleSubmit() { clearDraft(id); /* ... */ }
```

---

## Supabase setup

```js
// utils/supabase.js
import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = url && key ? createClient(url, key) : null;
```

All auth functions null-check `supabase` before calling it. This lets the app run in dev without env vars set.

Vercel env vars needed: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

---

## What MSL needs to replicate

MSL is the sibling — ML Systems Lab. It covers ML systems, model training, data engineering content. PAL covers product analytics and PM prep.

The shared shell MSL needs:
1. Same signed-out home (different headline/copy, same structure: badge + headline + subtext + 2 CTAs + ghost data snippets appropriate to ML)
2. Same auth modal (identical — just change the title "Sign in to MSL")
3. Same auth state management in App.jsx (copy the `onAuthStateChange` block exactly — do NOT simplify it)
4. Same `getAccessTier` function in unlock.js (different access code)
5. Same Profile page structure (5 cards — adapt stats card to MSL's rooms and localStorage keys)
6. Same sidebar (different rooms, same visual pattern)
7. Same CSS variable system (can share the same palette or use MSL-specific colors)
8. Same lazy-loading pattern for all page components
9. Same localStorage key convention with `msl-` prefix instead of `pal-`

Do NOT replicate:
- PAL's specific room data (rcaCases, metricCases, etc.)
- PAL's SQL Lab
- PAL's Foundation runners (build MSL-specific equivalents)
- PAL's `pal-` localStorage keys (use `msl-` prefix)

---

## Common mistakes to avoid

**1. Missing INITIAL_SESSION in auth handler.** Supabase v2 fires `INITIAL_SESSION`, not `SIGNED_IN`, when a page loads with an existing session. Without it, every page refresh logs the user out. Handle all three: `SIGNED_IN`, `INITIAL_SESSION`, `TOKEN_REFRESHED`.

**2. Rendering modals inside fixed/transformed ancestors.** Any modal using `position: fixed` must be rendered at the ROOT of the return fragment — not inside a panel that has `position: fixed` or `transform`. Fixed positioning is scoped to the nearest transformed ancestor, not the viewport. PAL's StudyPlanModal bug (Audit #145) was exactly this.

**3. Hardcoding colors.** Everything goes through CSS variables. Never `color: '#6366f1'` — use `color: 'var(--accent)'`.

**4. Default exports for page components.** Use named exports. The lazy-loading pattern requires `.then(m => ({ default: m.ComponentName }))`.

**5. Not clearing draft on submission.** Every draft key must be cleared in the submit AND retry handler, not just on completion.

**6. Using `position: fixed` for z-index layering inside a stacking context.** If a parent has `z-index` set, child elements' z-indices are relative to that parent's context. A modal with `z-index: 1000` inside a `z-index: 5` parent will LOSE to a sibling element also at `z-index: 5` that comes later in the DOM. Always render modals at the top-level fragment.
