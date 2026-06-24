# PAL Portfolio Audit — every component through PAL-PRODUCT-RUBRIC.md

34 content/practice components audited (account/utility pages — Profile, Progress, Plans, Leaderboard, Saved, About, Pricing, Unlock — are infrastructure, not evaluated here). Reviewer pass 2026-06-24; verdicts are opinionated and pending usage data (replace D4 priors with completion/return rates once the leaderboard provides them). **The headline: ~34 → ~20.** The sprawl is real, and it concentrates in two clusters (the Learn/reference shelf and the experiment shelf) plus a few orphans.

Pillars: R=recall, D=depth, F=fluency, J=judgment.

---

## CUT or SPIN-OUT (remove from PAL)

| component | pillar | verdict | why |
|---|---|---|---|
| Programming Lab | F | SPIN-OUT ✅ done | Off-PAL-scope (SWE-for-data); already externalized + linked. |
| Dimensional Modeling | F/D | **CUT or SPIN-OUT** | D2 weak — schema/star-schema design is analytics-*engineering*, which CLAUDE.md puts out of scope (BI in, data-eng out). Marginal for PA/PM interviews. Cut, or move to a sibling lab. |
| Study Room | R | **CUT/MERGE** | D1 fails — I (and a user) can't state its distinct job; parked in EXTRAS. Overlaps Saved + MCQ. If it's spaced-repetition review of saved items, fold into Saved/MCQ; else cut. |
| Behavioral | — | **CUT or box** | D2=1 (off the analytics-judgment wedge), D1 low-differentiation (every prep tool has generic behavioral). Parked in EXTRAS. Cut, or keep as a single minimal surface — don't invest. |

## MERGE (overlapping jobs — collapse to one)

**Merge group A — the Learn/reference shelf (6 → ~2).** Five of these are long-form/reference reading competing for the same "I want to read about X" job (D1 overlap):
| component | verdict |
|---|---|
| Deep Dives (blog) | **KEEP as the one library** |
| Frameworks (playbook) | MERGE → Deep Dives |
| Prep Cheatsheet | MERGE → Deep Dives (a "quick reference" view) |
| Interview Q&A | MERGE → Deep Dives (or keep only if the Q&A *format* tests differently) |
| Analytics Failures | MERGE → Deep Dives (a "failure library" section) — distinct angle, not a distinct room |
| MCQ Quiz (trainer) | **KEEP, boxed** — the single recall (R) entry; do not expand |

**Merge group B — the experiment-readout shelf (5 → ~3).** Three surfaces all do "read an A/B readout and judge it":
| component | verdict |
|---|---|
| A/B Design | **KEEP** — distinct (design *before* data) |
| Spot the Flaw | **KEEP** — distinct (flaw-finding, spans beyond experiments) |
| Stats (Stats Room) | MERGE → one "A/B Readout Judgment" room |
| A/B Review | MERGE → same |
| A/B Interpreter | MERGE → same |

**Merge group C — integrated multi-step (2 → 1).**
| component | verdict |
|---|---|
| Challenges | **KEEP** as the one cross-room integrated surface |
| Full Loop | MERGE → Challenges (both = multi-step end-to-end) |

## KEEP (earns its place)

| component | pillar | one-line distinct job |
|---|---|---|
| SQL Lab | F/J | executable SQL judgment — the flagship |
| Stat Foundations | D | teach statistical thinking for experimentation |
| Metrics Foundations | D | teach metric design/hierarchy/sensitivity |
| RCA Foundations | D | teach structured root-cause analysis |
| A/B Foundations | D | teach A/B design + validity |
| Metrics (Room) | J | define primary/diagnostic/guardrail metrics for a context |
| RCA (Room) | J | diagnose a metric movement |
| Analytics Cases | J | exec business question → recommendation |
| Instrumentation | J | design event schemas / debug tracking (explicitly in scope) |
| Product Design | J | product-sense judgment (PM scope) |
| Prioritization | J | defensible ranking + the deciding tradeoff |
| Estimation | J | sensible band + the assumptions that drive it |
| Mock Interview (simulator) | J | timed, role-specific simulation |
| Defense Strategy | J | JD → gap score → personalized plan (real differentiator) |
| Company Tracks | — | curation/aggregator layer (not a content room) — keep as packaging |

## KEEP — WATCH (probable overlap; confirm with usage data)

| component | concern |
|---|---|
| Growth Analytics | overlaps Metrics Room (cohorts/funnels). Keep if usage distinct; else merge → Metrics. |
| BI & Reporting | overlaps Metrics / Analytics Cases (dashboard interpretation). Keep if distinct; else merge. |

---

## Portfolio-level findings

1. **Count vs capacity (FAIL).** ~34 content surfaces is more than one maintainer can keep at the content bar — the audits this week only got through Foundations + a handful. Target ~20. Applying the merges/cuts above lands there.
2. **Nav legibility (FAIL).** The builder is confused about what several components are (Study Room, the Learn shelf) — by definition a new user is more lost. The two big clusters (5-item Learn shelf, 5-item experiment shelf) are the worst offenders.
3. **Pillar balance (OK-ish, drifting).** Heavy on J (good — that's the wedge) and D (Foundations). But the Learn shelf over-weights R/reference for a product whose identity is judgment. Collapsing it re-centers on the wedge.
4. **One door per stage (FAIL in two places).** Two clusters offer 5 front doors each for one job ("read about it" / "judge an A/B readout"). Each should have one obvious entry.

## Recommended sequence (simplicity ships fastest)

1. **Cut first** (instant clarity, ~zero risk): Dimensional Modeling, Study Room, Behavioral → remove from nav (keep files dormant for rollback, like Programming Lab).
2. **Merge the Learn shelf** (6 → 2): Deep Dives as the library; fold Frameworks/Cheatsheet/Interview-Q&A/Failures into it; keep MCQ boxed.
3. **Merge the experiment shelf** (5 → 3): one A/B Readout Judgment room from Stats + A/B Review + A/B Interpreter; keep A/B Design + Spot the Flaw.
4. **Merge Full Loop → Challenges.**
5. **Re-check Growth Analytics / BI** once leaderboard usage data exists.

Net: 34 → ~20 surfaces, two clusters de-tangled, nav legible. Nothing new ships without a KEEP verdict on this rubric.

---

## Retired log (archived — reversible)

Archiving = nav + route removed, component files kept dormant in `src/` (lazy-loaded, so zero runtime cost), git history preserved. Re-add nav item + route block to restore.

**V5.80.0**
- **Dimensional Modeling** — nav item (KNOW→DO) + `page==='dimensional-modeling'` route removed. `DimensionalModelBrowser.jsx` + data dormant. *Reason:* analytics-engineering, off PAL scope. *Restore:* re-add the DO nav item + the route block.
- **Study Room** — nav item (EXTRAS) + `page==='study'` route removed. `StudyRoom.jsx` + `studyCards.js` dormant. *Reason:* no nameable distinct job; overlaps Saved/MCQ. *Restore:* re-add EXTRAS item + route. *Residual:* `CheatSheet.jsx` has 3 daily-plan steps that point at the Study Room (`room:'study'`) — clean up when the Learn shelf merges into Deep Dives.
- **Behavioral** — standalone nav entry (EXTRAS) removed ONLY; **route kept on purpose.** It is load-bearing: the Interview Simulator's behavioral round, Company Tracks behavioral sets, two Learning Paths (pm-5 / others), Defense Strategy mapping, the MCQ Trainer's `behavioral` category, Progress, and Search all consume it. A full cut requires untangling those first — deferred pending a decision (recommendation: keep it boxed, since a behavioral round is a real interview stage and it's wired into the Simulator). *Restore nav:* re-add the EXTRAS item.
