# NAV REFRAME SPEC — PAL under the four frames (+ LIVE, EXTRAS)

_Created 2026-06-23. Implements `HQ/DESIGN-STANDARD.md` §"THE SIDEBAR STANDARD" + `HQ/COMPETENCE-MODEL.md` (DEC-15), grounded in PAL's own `docs/FOUR-FRAME-AUDIT.md` §2 frame tags, then adjusted by Sidharth's calls (2026-06-23, logged in §7). **Reorg + nav-engine only — no new content, no new rooms, no scenario/data edits.** Propose-only; nothing implemented yet._

## ⛔ Why this is a SPEC, not a committed nav edit

1. **Can't build-verify here.** This is a routing/active-state change in `Sidebar.jsx`; the sandbox can't run the real Vite build (node_modules are macOS-native), and a push auto-deploys to Vercel. Shipping unverified nav routing risks a broken live deploy.
2. **Not a contained edit.** It's a `Sidebar.jsx` rewrite (structure + accordion engine + measured-height animation) + 4 new icons. Interdependent, not a one-array swap.
3. **Git is BLOCKED** (NEXT.md): exposed PAT in `.git/config`, two working copies, stale remote name. Nothing pushes until that's resolved regardless of this spec.
4. **Sequencing.** `HQ/COMPETENCE-MODEL.md` sequences the lab overhaul *after* the distribution keystone + SQL/PSL coverage. Doing the IA reframe now jumps that order — a controller call (it's reorg-only, so low-risk to pull forward).

**On approval, implementation is mechanical** — every edit is in §4. Then Sidharth builds on macOS (the verification gate) and pushes (approve-first, once git is unblocked). No content is touched at any step.

---

## 1. Target IA — the four frames + two PAL sections

```
PAL
├─ TRACK            Profile/Sign-in · Progress · Plans        (flat, top — not a frame)
│
├─ ① KNOW   (Recall + Depth)   the floor — PAL's widest, best-built base
│    ├─ Foundations:  Stat · Metrics · RCA · A/B Foundations
│    └─ Learn:        Deep Dives · Frameworks · Interview Q&A · Cheatsheet · Analytics Failures · MCQ Quiz
├─ ② DO     (Fluency)          execution — write/run code
│      SQL Lab · Python Lab · Dimensional Modeling
├─ ③ BUILD  (Ownership · scaffold)
│      Full Loop · Instrumentation      (+ Take-Home, if surfaced)
├─ ④ JUDGE  (Judgment)         the apex — PAL's identity
│    ├─ Experiments:  Stats · A/B Design · A/B Review · A/B Interpreter · Spot the Flaw
│    ├─ Analytics:    Metrics · RCA · Analytics Cases · Growth Analytics · BI & Reporting
│    ├─ Product:      Product Design · Prioritization · Estimation
│    └─ Challenges · Company Tracks
│
├─ ⑤ LIVE      (simulation)    Mock Interview · Defense Strategy
│
└─ (bottom)    EXTRAS — quiet catch-all (Behavioral) · Search (⌘K / "/")
```

The four frames replace today's domain-shaped sections (FOUNDATIONS / ROOMS{Experiments·Analytics·Product} / DRILLS / LEARN / TOOLS / STUDY). The old room sub-groups **survive as sub-groups *inside* JUDGE**: Stats joins Experiments and Estimation joins Product (both retagged judgment per Sidharth's call, overriding the audit's fluency tag). KNOW keeps two sub-groups (Foundations / Learn).

**PAL deviates from HQ's single "PREP & ASSESS" slot:** it ships **LIVE** (a labeled section — Mock Interview + Defense Strategy simulation) plus a quiet **EXTRAS** catch-all pinned at the bottom by Search (not a labeled frame; Behavioral lands here). Flag to HQ that PAL's cross-cutting space is LIVE + a bottom EXTRAS, not PREP & ASSESS. The one-open-per-level rule recurses through every sub-group.

---

## 2. Complete item → frame placement (every current Sidebar id)

Primary frame = its nav home. Grounded in `FOUR-FRAME-AUDIT.md` §2, then adjusted by Sidharth's calls. **Nothing created or deleted — only reparented.** `⚑` = a call still open (§7).

| Item id | Label | New frame | Was (section) | Basis |
|---|---|---|---|---|
| `stat-foundations` | Stat Foundations | **KNOW** / Foundations | Foundations | recall+depth |
| `metrics-foundations` | Metrics Foundations | **KNOW** / Foundations | Foundations | recall+depth |
| `rca-foundations` | RCA Foundations | **KNOW** / Foundations | Foundations | recall+depth |
| `exp-foundations` | A/B Foundations | **KNOW** / Foundations | Foundations | recall+depth |
| `blog` | Deep Dives | **KNOW** / Learn | Learn | recall+depth |
| `playbook` | Frameworks | **KNOW** / Learn | Learn | recall+depth |
| `interview-qa` | Interview Q&A | **KNOW** / Learn | Learn | recall+depth |
| `cheatsheet` | Prep Cheatsheet | **KNOW** / Learn | Tools | recall+depth |
| `failures` | Analytics Failures | **KNOW** / Learn | Learn | recall+depth (sec. judgment) |
| `trainer` | MCQ Quiz | **KNOW** / Learn | Tools | recall+depth (sec. fluency) |
| `sql-lab` | SQL Lab | **DO** | Analytics | fluency (Forensic 36 = judgment, in-tab) |
| `python-lab` | Python Lab | **DO** | Tools | fluency |
| `dimensional-modeling` | Dimensional Modeling | **DO** | Tools | fluency |
| `full-loop` | Full Loop | **BUILD** | Analytics | ownership |
| `instrumentation` | Instrumentation | **BUILD** | Analytics | ownership |
| `company-tracks` | Company Tracks | **JUDGE** (flat) | Tools | curation in JUDGE (Sidharth) |
| `stats` | Stats (claim-eval) | **JUDGE** / Experiments | Experiments | fluency→**judgment** (Sidharth) |
| `design` | A/B Design | **JUDGE** / Experiments | Experiments | judgment |
| `browser` | A/B Review | **JUDGE** / Experiments | Experiments | judgment |
| `ab-interpreter` | A/B Interpreter | **JUDGE** / Experiments | Experiments | judgment |
| `spot-the-flaw` | Spot the Flaw | **JUDGE** / Experiments | Experiments | judgment |
| `metrics` | Metrics | **JUDGE** / Analytics | Analytics | judgment |
| `rca` | RCA | **JUDGE** / Analytics | Analytics | judgment |
| `cases` | Analytics Cases | **JUDGE** / Analytics | Analytics | judgment |
| `growth-analytics` | Growth Analytics | **JUDGE** / Analytics | Analytics | judgment |
| `bi` | BI & Reporting | **JUDGE** / Analytics | Analytics | judgment |
| `product-design` | Product Design | **JUDGE** / Product | Product | judgment |
| `prioritization` | Prioritization | **JUDGE** / Product | Product | judgment |
| `estimation` | Estimation | **JUDGE** / Product | Product | fluency→**judgment** (Sidharth) |
| `challenges` | Challenges | **JUDGE** (flat) | Drills | judgment (sec. ownership) |
| `simulator` | Mock Interview | **LIVE** | Drills | simulation (Sidharth) |
| `defense-doc` | Defense Strategy | **LIVE** | Tools | simulation (Sidharth) |
| `behavioral` | Behavioral (STAR) | **EXTRAS** (bottom) | Product | parked catch-all (Sidharth) |
| `profile` | Profile | TRACK (meta) | Track | infra |
| `progress` | Progress | TRACK (meta) | Track | infra |
| `plans` | Plans | TRACK (meta) | Track | infra |
| `bookmarks` | Saved | TRACK (meta) ⚑ | Tools | infra |
| `study` | Study Room | TRACK (meta) ⚑ | Study | infra |
| `search` | Search | bottom (pinned) | bottom | infra |

**Page-only surfaces (exist, not in today's sidebar):** `take-home` → BUILD, `foundations` (Theory Hub) → KNOW/Foundations, `consult` → fold into Search (audit recommends retiring it). Surfacing these is **optional** (§7-3) — leaving them out keeps strict parity with today's nav.

**Invariant:** every routable id the sidebar surfaces today appears in exactly one section after the reframe. No id orphaned → no blank active state.

---

## 3. The behavior + visual standard PAL must adopt (the engineering gaps)

PAL's sidebar won on *visual* taste; the code read flagged real gaps. The reframe closes the ones PAL accepts:

| Gap | Today in `Sidebar.jsx` | Action |
|---|---|---|
| **Accordion discipline** | `expandedSubGroups` is a `Set` — **multiple open at once** | **One open per level.** Single `openFrame` + single `openSub` state; opening one closes siblings; recurses to sub-groups. |
| **Open/close animation** | `{isExpanded && (…)}` — **snaps** | **Measured-height** `Collapsible` (animate `scrollHeight`px → `auto`), 0.28–0.30s `cubic-bezier(0.33,1,0.68,1)`; chevron −90°→0°. |
| **Component identity** | `NavItem`/`SectionLabel` defined **inside** `Sidebar` | **Hoist** `Collapsible`/`NavItem`/`Chevron` to module scope (inner defs remount each render → animation snaps). |
| **Active state** | 40-line `getIsActive` `\|\|`-chain (one clause per runner page) | **Derived** active-state from a single `NAV_FRAMES` config + a `pageToTab()` normalizer (strip `-runner`; map the ~5 exceptions: `browser↔runner`, `spot-the-flaw↔stf-runner`, `bi↔bi-runner`, `challenges↔challenges-runner`, `instrumentation↔instrumentation-runner`). No edit per new page. |
| **Frame icons** | none | KNOW=`book-open` · DO=`terminal` · BUILD=`hammer` · JUDGE=`scale` · LIVE=`mic` · EXTRAS=`more-horizontal`; 13px, accent when active. |
| **A11y** | no `aria-expanded`/`aria-current` | `aria-expanded` on every toggle; `aria-current="page"` on the active row. |
| **Active pill** | `.sidebar-nav-active` = `inset 3px 0 0 var(--accent)` ✅ | Compliant. Uses PAL's **signature accent** (`var(--accent)`) — unchanged; **no** retokenize to indigo (Sidharth). |
| ~~Mobile BottomNav~~ | sidebar opens as a slide-in drawer | **Declined (PAL override).** Sidharth: PAL's sidebar *is* the mobile nav; no MSL-style `BottomNav`. PAL does not adopt this HQ gap — flag back to HQ as a deliberate divergence. |

---

## 4. Exact edits (file by file)

**A. `src/components/layout/Sidebar.jsx` — the rewrite.**
1. Replace `ROOM_SUBGROUPS` + `FLAT_GROUPS` with one `NAV_FRAMES` config:
   `know` (icon `book-open`, subs Foundations / Learn) · `do` (`terminal`, flat items) · `build` (`hammer`, flat) · `judge` (`scale`, subs Experiments / Analytics / Product + flat `challenges`) · `live` (`mic`, flat: simulator, defense-doc) · `extras` (`more-horizontal`, flat: behavioral). A separate flat `TRACK` array stays at top.
2. Delete the `getIsActive` `||`-chain. Add module-scope `pageToTab(currentPage)` (suffix-strip + exception map) and derived `getActiveFrame`/`getActiveSub` that scan `NAV_FRAMES`.
3. Replace `expandedSubGroups` (Set) with `openFrame` (string|null) + `openSub` (string|null); the `useEffect` keyed on `currentPage` sets both to the active item's frame/sub (one-open-per-level preserved).
4. Hoist `NavItem`, a new `Collapsible` (the HQ `scrollHeight` component verbatim), and `Chevron` to **module scope**; pass `currentPage`/`onNavigate` as props.
5. Render frames as accordion headers (frame icon + label + `Chevron`), bodies wrapped in `Collapsible`; nested sub-groups use a second `Collapsible`. `aria-expanded` on headers, `aria-current="page"` on the active `NavItem`. Logo (BrandMark, done) + Search (already bottom) unchanged.

**B. `src/components/shared/Icon.jsx` — add 4 paths:** `terminal`, `hammer`, `scale`, `more-horizontal` (Lucide MIT). `book-open`, `mic`, `clipboard` already exist.

**C. `src/App.jsx` — no structural change.** No BottomNav. Optionally export `pageToTab`/`getActiveFrame` from a shared util so any other consumer agrees with the sidebar. No routing/page-id changes. (The existing mobile drawer toggle `isOpen` stays the mobile mechanism.)

**D. `src/index.css` —** no new mobile nav. Confirm the `Collapsible` `transition: height` respects the existing `@media (prefers-reduced-motion: reduce)` block (add an override so reduced-motion users get an instant toggle). `.sidebar-nav-active` unchanged.

**Consumers to re-verify green:** `getActiveSubGroup` callers; any stray `currentPage === 'x'` checks; the mobile drawer (`isOpen`) still opens/closes the same sidebar.

---

## 5. What does NOT change (freeze guard)

- **No room/runner component edited, no `src/data/*` touched, no case/scenario/post/MCQ content written, no new routable page added.** Same surfaces, reorganized by frame.
- Page IDs stay identical → hash-routing, id-based premium gating, and deep links untouched.
- The reframe is **labels, grouping, accordion engine, active-state derivation, icons, and a11y** — config + chrome, not content.

---

## 6. Build / verify / push (Sidharth runs on macOS — approve-first, git unblock first)

After approval + git unblock, I make the §4 edits in-sandbox (no build), then hand over:

```bash
cd ~/Documents/Professional/BreakLabs/labs/product-analytics-lab && \
rm -f .git/index.lock .git/HEAD.lock && \
npm_config_cache=/tmp/npm-cache ./node_modules/.bin/vite build --outDir /tmp/dist-output   # verification gate
npm run dev   # smoke: open KNOW/DO/BUILD/JUDGE/LIVE/EXTRAS; one item each; check mobile drawer
```

QA checklist (manual, on the running dev server):
- [ ] One-open-per-level holds: opening a section closes siblings; opening a JUDGE sub-group closes its sibling sub-groups.
- [ ] Open/close animates (no snap); chevron rotates; reduced-motion users get an instant toggle.
- [ ] Every current sidebar id opens from its new section; active pill + `aria-current` land on the right row (test a runner sub-page — open an RCA case → RCA stays active under JUDGE/Analytics).
- [ ] Mobile: the slide-in drawer still opens/closes and routes (no BottomNav expected).
- [ ] No orphan: the derived active-state returns a section for every id.

Then, only if green (and git unblocked):
```bash
git add src/components/layout/Sidebar.jsx src/components/shared/Icon.jsx src/index.css \
        docs/NAV-REFRAME-SPEC.md NEXT.md CHANGELOG.md LINEAGE.md && \
git commit -m "nav(reframe): PAL IA under four frames + LIVE/EXTRAS, accordion engine + measured-height motion, derived active-state, a11y — reorg only, no content (DEC-15)" && \
git push origin main
```

---

## 7. Open decisions (resolved + still open)

**Resolved 2026-06-23 (Sidharth):**
- Stats & Estimation → **JUDGE** (Experiments / Product), overriding the audit's fluency tag.
- Mock Interview + Defense Strategy → new **LIVE** section (simulation).
- **EXTRAS** = a quiet catch-all pinned at the bottom (not a labeled frame); Behavioral lives there.
- **Company Tracks → JUDGE** (flat, alongside Challenges).
- **No mobile BottomNav** — PAL's sidebar is the mobile nav; PAL declines the HQ gap.
- Nav accent = PAL's **signature accent** (`var(--accent)`), no indigo retokenize.

**Still open (low-stakes — can default):**
1. **Surface the 3 page-only items** (Take-Home→BUILD, Theory Hub→KNOW, retire Consult→Search) during the reframe, or hold for strict freeze parity? _Default: hold._
2. **Sequencing/freeze override:** do this reorg-only reframe **now**, ahead of DEC-15's "after the distribution keystone" order? (Git block means it can't ship until that's fixed regardless.) _Default: now._
