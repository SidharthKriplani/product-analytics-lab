# DESIGN-STANDARD — PAL section (propose-only)

_Created 2026-06-23. Read-only UI-inventory pass. No UI changed, no source files touched._

> **For HQ merge.** `HQ/DESIGN-STANDARD.md` is not mounted in this lab's working copy (same constraint as `docs/FOUR-FRAME-AUDIT.md`). This file is PAL's per-lab section, formatted to drop into the registry under a `## PAL — product-analytics-lab` heading. HQ owns the cross-lab merge and the shared-vs-unique reconciliation against MSL/sibling labs — the "shared?" column below is PAL's _nomination_, not a confirmed cross-lab match.

**Scope of inventory.** "Reusable UI component" = a component built to be used in more than one place. Excluded: room runners (one per room, not reusable), page-level `*Browser.jsx` surfaces, the 32 `statsFoundations/modules/*`, and `AuthModal`/`ChartScenario` (single-use). The per-room `ScoreReveal` / `DebriefPanel` / `StepPanel` families are listed once, under Duplicated patterns, because they are the same pattern copied per room — not a shared component.

**Shared vs unique key.**
`SHARED` = generic chrome/scaffold a sibling lab would plausibly need its own copy of → promotion candidate for an HQ shared library.
`UNIQUE` = tied to PAL's domain (product-analytics judgment pedagogy, the analyst loop, PAL's concept/room data) → would not transfer as-is.

---

## Registry — PAL reusable UI components

| Component | Path (`src/components/`) | Lines | What it is | Shared? |
|---|---|---|---|---|
| Button | `ui/Button.jsx` | 56 | Variant (primary/secondary) + size button primitive | SHARED |
| Badge / DifficultyBadge | `ui/Badge.jsx` | 46 | Pill badge + difficulty-tier badge | SHARED |
| LockOverlay | `ui/LockOverlay.jsx` | 39 | Absolute-positioned beta/paywall lock over a card | SHARED |
| Icon | `shared/Icon.jsx` | 196 | Zero-dep inline-SVG icon set (Lucide paths), size/color props | SHARED |
| Breadcrumb | `shared/Breadcrumb.jsx` | 30 | "PAL › Room › Case" nav trail for runner headers | SHARED |
| ErrorBoundary | `shared/ErrorBoundary.jsx` | 61 | Class boundary, auto-resets on `resetKey` (page) change | SHARED |
| TimerButton | `shared/TimerButton.jsx` | 52 | Elapsed timer w/ pause-resume + warning state | SHARED |
| ShareLinkButton | `shared/ShareLinkButton.jsx` | 81 | Copy current-URL-to-clipboard (hash-synced) | SHARED |
| DebriefCopyButton | `shared/DebriefCopyButton.jsx` | 104 | Exports a case debrief as Markdown to clipboard | SHARED |
| GateOverlay | `shared/GateOverlay.jsx` | 102 | Portal locked-state modal — one API for auth-gate + premium-gate | SHARED |
| Footer | `layout/Footer.jsx` | 42 | App footer w/ QA link | SHARED |
| Header | `layout/Header.jsx` | 362 | Top-nav (⚠ unused — kept as reference; Sidebar is live nav) | SHARED |
| Sidebar | `layout/Sidebar.jsx` | 564 | Primary nav — grouped rooms/practice/learn/tools/track | SHARED |
| DifficultyChips | `shared/DifficultyChips.jsx` | 47 | Analyst/Senior/Staff filter chip bar for browsers | SHARED |
| FoundationBrowser | `shared/FoundationBrowser.jsx` | 235 | Config-driven grid browser powering all 4 Foundation rooms | SHARED |
| FoundationRunnerShell | `shared/FoundationRunnerShell.jsx` | 230 | Header chrome + module index for the 4 Foundation runners | SHARED |
| FoundationPrimitives | `shared/FoundationPrimitives.jsx` | 94 | InsightBox / NextBtn / MCQOption / CheckBtn / InstructionBox | SHARED |
| FoundationNudgeCard | `shared/FoundationNudgeCard.jsx` | 79 | Dismissable "finish your foundation" nudge (reads progress) | SHARED |
| HowTo | `shared/HowTo.jsx` | 32 | "Skill + ≤3 steps" cognitive-frame opener | SHARED |
| ForwardPointerCard | `shared/ForwardPointerCard.jsx` | 77 | Post-debrief "do this next" card (no dead ends) | SHARED |
| GuidedPathCard | `paths/GuidedPathCard.jsx` | 91 | Learning-path card w/ sequence + next-item CTA | SHARED |
| VerdictStrip | `shared/VerdictStrip.jsx` | 65 | Ship / No-ship / Dig-deeper segmented decision control | UNIQUE |
| LeadershipLens | `shared/LeadershipLens.jsx` | 55 | Collapsible Staff-level perspective toggle on a case | UNIQUE |
| UniverseView | `shared/UniverseView.jsx` | 584 | Animated "Analyst Universe" star map (7 arms = the BA/PM loop) | UNIQUE |
| BeginnerOnboardingTrack | `shared/BeginnerOnboardingTrack.jsx` | 160 | 4-step career-switcher path keyed to PAL rooms | UNIQUE |
| ConceptCard | `concepts/ConceptCard.jsx` | 106 | Glossary card rendered from PAL `concepts.js` data | UNIQUE |
| ConceptChip | `concepts/ConceptChip.jsx` | 91 | Inline/pill chip that opens a concept drawer | UNIQUE |
| ConceptDrawer | `concepts/ConceptDrawer.jsx` | 56 | Esc-dismissable backdrop drawer wrapping ConceptCard | UNIQUE |

_27 distinct reusable components: 21 SHARED-nominated, 6 PAL-UNIQUE._

---

## Duplicated patterns (consolidation candidates, not new components)

These are the same UI pattern hand-copied per room. They are the strongest design-standard signal in PAL — each is a place where a shared, color-parameterized primitive would replace N near-identical files. Flagging for HQ; **propose-only, no refactor in this pass.**

- **ScoreReveal ×6** — `scenario/ScoreReveal`, `cases/CaseScoreReveal`, `rca/RCAScoreReveal`, `metrics/MetricScoreReveal`, `design/DesignScoreReveal`, `stats/StatsScoreReveal`. Same reveal-panel pattern (uses `.pal-reveal-in`); diverge only by room color/copy.
- **DebriefPanel ×5** — `scenario/DebriefPanel`, `cases/CaseDebriefPanel`, `rca/RCADebriefPanel`, `metrics/MetricDebriefPanel`, `design/DesignDebriefPanel`.
- **StepPanel ×2** — `cases/CaseStepPanel`, `rca/RCAStepPanel`.
- **Choice/Decision control ×3** — `scenario/DecisionPanel`, `metrics/MetricChoicePanel`, `stats/StatsDecisionCard` (sibling to the unique `VerdictStrip`).

Precedent that consolidation works in PAL: the 4 Foundation rooms already collapsed to one `FoundationBrowser` + `FoundationRunnerShell` + `FoundationPrimitives`. The ScoreReveal/DebriefPanel families are the same opportunity untaken.

---

## PAL's nominations — best 2–3 to promote to the HQ shared standard

Criteria for a nomination: (1) usable in another lab with no PAL-specific edit, (2) parameterized rather than hardcoded, (3) solves a problem every lab has, (4) already battle-tested across multiple PAL rooms.

1. **`shared/Icon.jsx`** — Meets all four cleanest: zero runtime dependency, pure `name`/`size`/`color` API, no icon-library weight to standardize across labs. Highest reuse surface, lowest coupling.
2. **`shared/GateOverlay.jsx`** — One portal-rendered component covers both auth-gating and premium-gating; the portal solves stacking-context bugs once for everyone. Every lab that adds sign-in or paid tiers needs exactly this.
3. **Foundation scaffold trio (`FoundationBrowser` + `FoundationRunnerShell` + `FoundationPrimitives`)** — A config-driven teaching-module system already running 4 rooms from one source. Any lab teaching progressive modules (MSL especially) reuses it wholesale; it is PAL's proof that the shared-scaffold pattern pays off.

_Honorable mention: `DebriefCopyButton` (Markdown export) and `DifficultyChips` (tier filter) are clean and generic, but lower-stakes than the three above._
