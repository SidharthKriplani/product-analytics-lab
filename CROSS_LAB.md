# CROSS_LAB.md — Cross-Lab Ideas and Learnings

Ideas that originated from thinking about PAL but apply to sibling labs, or ideas for sibling labs that contain patterns PAL can learn from. This file is a routing layer — ideas here should be actioned in the appropriate repo.

Last updated: V4.49.0 (2026-06-02)

---

## All Labs (PAL + MSL + GAL)

**1. Cross learnings audit — read each other's repos thoroughly**
Each lab has shipped patterns, components, and content structures the others have not. A dedicated cross-lab session (reading code, not building) would surface low-effort ports. Known gaps: MSL has multi-part escalating case dossiers and 4-tier model answers (both actionable in PAL); GAL has a "simplify" toggle on articles (requires backend for PAL — deferred); PAL has the SQL runtime and hint system (potentially portable to labs with SQL content).

**2. india-wealth-architecture visual reference**
Repo: `https://github.com/SidharthKriplani/india-wealth-architecture`
This project has animation and visual cue patterns worth studying — wealth flow diagrams, animated transitions, visual hierarchy. All labs should audit it for UI/animation inspiration before building new interactive modules. PAL's animation system (`.pal-page-enter`, `.pal-reveal-in` etc.) is solid but the visual language for data flow and decomposition (relevant to metric trees, funnel decomposition, RCA trees) could be lifted from this work.

**3. Country curation**
All labs could benefit from country-specific content paths. For PAL, this means Indian company tracks (Meesho, Swiggy, Zepto, Razorpay) and India-specific business contexts in cases. For MSL, it could mean Indian ML company examples (Ola, Flipkart ML, Navi). For GAL, India-specific AI product case studies. Gate for all: confirm audience signal that Indian users are on the platform before investing in content that won't get used.

---

## GAL (GenAI Lab) — Ideas to action in that repo

1. **Resume with prep lab revamp** — integrate resume analysis with the interview prep section. A user's resume should inform which AI product concepts they're weak on and prioritize accordingly. Same pattern as PAL's Defense Strategy (JD → gap score → plan). Directly portable.

2. **Plan / Career / AI Product / My Progress revamps** — these sections need a design pass. The current layout (per Sidharth's notes) reads too dense and doesn't communicate learning progression clearly. Reference PAL's Progress.jsx SectionCard pattern for the per-skill breakdown.

3. **Flesh out more concepts** — GAL has strong framing sections but thin concept depth in some areas. Identify which concepts have <300 word articles and prioritize expanding them before the next beta push.

4. **Company logos** — same pattern as PAL's Google Favicon API fix. Use `https://www.google.com/s2/favicons?domain=...&sz=32` — Clearbit is unreliable and has rate limits. Update across all places that use company logos.

---

## MSL (ML Systems Lab) — Ideas to action in that repo

### 🔑 PAL 3-tier access model — port to MSL (implementation brief)

PAL shipped a clean guest / signed-in free / full access tier model in V5.0–V5.2. MSL should implement the same. This brief is self-contained — hand it to any MSL session as context.

**What the model is:**

| Tier | Who | What they get |
|---|---|---|
| Guest | No account | 1 `guestPreview` case per room/lab, all free reference content, Foundations if any |
| Signed-in Free | Email/OAuth sign-in, no code | All `isFree` cases (~3–6 per room), progress tracking, streak |
| Full Access | Access code (or future Stripe) | Everything — all cases, Staff-level content, company tracks, simulators |

The `unlocked` flag is the Stripe placeholder. When Stripe goes live, `isUnlocked()` accepts a valid subscription token instead of a code. No structural refactor needed — just swap one function.

**The 3 data fields per case/problem:**

```js
{
  id: 'case-01',
  title: '...',
  isFree: true,        // signed-in free users can access this case
  guestPreview: true,  // guests (no account) can access this case — 1 per room max
  // omit both → requires full access (code/Stripe)
}
```

Rules:
- `guestPreview: true` → add to exactly 1 case per room/lab (the strongest Analyst-level case)
- `isFree: true` → add to ~3–6 cases per room/lab (Analyst through Senior difficulty)
- Everything else is full-access gated

**The gating function — copy this into MSL's App.jsx:**

```js
const gateRoomRef = useRef(null); // tracks which room triggered the gate

function requireUser(guestPreview = false, isFree = false, room = null) {
  if (!user && !guestPreview) {
    gateRoomRef.current = room;
    setAuthGate(true);
    return true; // caller should return early
  }
  return false;
}
```

**Every case open handler follows this exact pattern:**

```js
function openCase(id) {
  const c = caseIndex.find(x => x.id === id);
  if (!c) return;
  if (requireUser(c.guestPreview, c.isFree, 'room-name')) return; // guest gate
  if (!c.isFree && !unlocked) { setPage('plans'); return; }        // paywall gate
  // open the case
}
```

- `undefined` (no field) is falsy → guest blocked by default. Only explicitly tagged cases let guests through.
- Signed-in users always pass `requireUser`. Their paywall is the second check (`!isFree && !unlocked`).

**GateOverlay — show contextual copy per room:**

When `requireUser` fires, `gateRoomRef.current` holds the room string. The overlay uses this to show room-specific outcome-framed copy:

```js
const ROOM_GATE_COPY = {
  'room-key': {
    title: 'Sign in to keep practicing [Room]',
    body: 'Outcome-framed description of what is behind the gate in this specific room.',
  },
  // ... one entry per room
};
const DEFAULT_GATE_COPY = {
  title: 'Sign in free to keep practicing',
  body: 'A free account saves your progress, unlocks more cases in every room, and tracks your streak.',
};
```

**Plans page — three-column layout with comparison table:**

PAL's Plans.jsx (V5.4+) is the reference implementation. Structure:
1. Three tier cards at top — emotional pitch only (headline + description + CTA). No feature lists in the cards.
2. Comparison table below — features as rows, 3 tier columns, ✓ / — / text cells. Middle column (Free Account) highlighted with accent color.
3. No greyed-out negatives anywhere. Negatives are implicit from the table.

Access code input goes in the Full Lab card. `type="password"`, `autoComplete="off"` to mask it.

**PostHog events to wire (5 events, same as PAL):**

```js
track('gate_shown',             { room, source: 'room_open' | 'post_case' })  // useEffect on authGate
track('gate_cta_clicked',       { room, action: 'sign_in' | 'see_plans' })    // GateOverlay CTA buttons
track('user_signed_in',         {})                                            // SIGNED_IN auth handler
track('forward_pointer_clicked', { room, button: 'next_case' | '...' })       // ForwardPointerCard
track('debrief_copied',         { room, difficulty })                          // DebriefCopyButton
```

Existing events to keep: `page_viewed`, `case_opened`, `case_completed`, `paywall_hit`, `unlocked`.

**Current access code:** `DAI2026` (same across PAL + MSL + GAL for now — one community, one code).

**File checklist for MSL implementation:**

- [ ] All case/problem data files → add `guestPreview: true` to 1 case per room, `isFree: true` to 3–6 per room
- [ ] `src/utils/unlock.js` → copy from PAL (VALID_CODES, isUnlocked, tryUnlock, getAccessTier)
- [ ] `src/utils/analytics.js` → copy from PAL (PostHog CDN wrapper, track function)
- [ ] `src/App.jsx` → add `authGate` state, `gateRoomRef`, `requireUser(guestPreview, isFree, room)`, ROOM_GATE_COPY, DEFAULT_GATE_COPY, `gate_shown` useEffect, `user_signed_in` in auth handler, GateOverlay render
- [ ] `src/components/shared/GateOverlay.jsx` → copy from PAL (portal, frosted backdrop, title/body/ctaLabel/onCTA/secondaryLabel/onSecondary props)
- [ ] `src/pages/Plans.jsx` → copy PAL V5.4 structure (3 tier cards + comparison table)
- [ ] `src/components/shared/ForwardPointerCard.jsx` → copy from PAL, update ROOM_NEXT map for MSL rooms
- [ ] Sidebar → add Plans nav item under TRACK section

**Estimated effort:** 2 focused sessions. Session 1: data fields + requireUser + GateOverlay. Session 2: Plans page + PostHog events + ForwardPointerCard.

---

1. **More project labs, extension of each lab** — the project-based learning format in MSL is a strong differentiator. Extend existing labs (each currently ~3–5 exercises) to 8–10 exercises before adding net-new labs. Depth > breadth.

2. **Simplify for blog posts** — GAL shipped a "simplify" toggle on articles (Ground Truth). MSL wants the same for its ∇ Gradient posts. This requires an API call — make sure there's a proxy or key-management plan before shipping. Don't expose the API key client-side.

3. **System design — retrieval failures** — the "retrieval failures" module in MSL's system design section (RAG retrieval quality, embedding drift, retrieval latency spikes) is actually a GAL concept, not an MSL concept. MSL covers model training and inference systems; retrieval failure analysis belongs in GAL's AI product section. Audit whether this content should be moved or cross-linked.

4. **Training lab — attention heads, transformers** — verify whether the attention heads / transformer architecture content in MSL's training lab is at the right level of abstraction. If it's covering architecture theory rather than training decisions (learning rate schedules, gradient clipping, mixed precision), it may belong in a separate "foundations" module rather than the training lab. The training lab should be about training decisions, not architecture review.

5. **Company logos** — same fix as GAL. Switch from Clearbit to Google Favicon API.

6. **SHAP values in ∇ Gradient — YouTube link check** — the SHAP values post has an embedded YouTube video that is showing as "unavailable." Run a full audit of all YouTube embeds across ∇ Gradient posts — check for videos that are private, deleted, or region-locked. Replace unavailable embeds with either a different video or remove the embed entirely. This is a content quality issue that affects trust.

---

## PAL-specific learnings from sibling labs

(Things PAL can borrow from MSL/GAL — already logged in IDEAS.md where actionable)

- **Multi-part escalating case dossiers** (MSL pattern) → already in IDEAS.md Tier 2 Content
- **4-tier model answers** (MSL InterviewQATab) → already in IDEAS.md Tier 2 Content
- **"Analytics Failures" catalog** (GenAI Lab Debug pattern) → already in IDEAS.md Tier 2 Content
- **Forward-pointer card at case endings** (GenAI Lab sprint pattern) → already in IDEAS.md Tier 3
- **ELI5 mode on articles** (GAL "simplify") → deferred (requires backend/API proxy); in IDEAS.md Tier 3
- **Per-room breakdown in mock exam debrief** (MSL CombinatorTab) → already in IDEAS.md Tier 2
- **Weak topic heatmap in Trainer debrief** (MSL TrainerTab) → already in IDEAS.md Tier 3
- **Foundation curriculum rubric — Tier 0** (MSL foundation-rubric conversation, 2026-06-26) → ADOPTED into `docs/EVAL_RUBRICS.md`. A curriculum-level review layer for the foundation rooms (topic merit, depth ∝ interview importance, depth uniformity across the 4 rooms, room-level first-principles arc, coverage/redundancy) — distinct from the per-module Tier 1/2/3 — plus two sharpened standards: "show the mechanism" (the interactive must illustrate the causal mechanism, not just exist) and "depth dial" (beginner-safe yet aggressively-thorough via a required spine + optional go-deeper layers). Key insight: MSL's list was *two* rubrics fused — per-module quality (which PAL already had) + curriculum design (which PAL was missing). **Reciprocal:** give MSL PAL's existing per-module Foundation rubric as their starting point — they were reinventing the half PAL already wrote.
- **PENDING PAL ACTION (Tier-1 idea):** run the new Tier-0 curriculum audit across PAL's 4 foundation rooms (Stat / RCA / Metrics / Exp) to surface depth-lopsidedness, over/under-built topics, and coverage gaps. Offered 2026-06-26, deferred to a later session.
