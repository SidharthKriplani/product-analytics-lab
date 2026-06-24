# PAL-PRODUCT-RUBRIC.md — Does this component earn its place?

This rubric evaluates **whether a room/tool should exist in PAL at all, and where it belongs** — the portfolio question. It is deliberately separate from `EVAL_RUBRICS.md`, which evaluates whether a component's *content* is good. A component can have flawless content and still fail this rubric (because it duplicates another, is off-strategy, or nobody needs it).

**Premise (stated plainly):** PAL has ~20+ rooms and tools. Every additional component taxes two budgets — the **user's** (cognitive load, nav legibility, "which one do I use?") and **yours** (a solo maintainer can only keep so many rooms fresh, bug-free, and at the content bar). Sprawl is not free. The default answer to "should this exist?" is **no, unless it clearly earns its place.** If the builder is confused about what a component is for, that is already a failing grade on dimension 1 or 3.

---

## The six dimensions

Score each 0 / 1 / 2. The verdict comes from the *pattern*, not the sum (a single 0 on D1, D2, or D4 can be fatal).

**D1 — Distinct job (anti-overlap).** Can you state in ONE sentence what this does that no other component does? 
- 0 = duplicates another component's job · 1 = overlaps a sibling · 2 = a job nothing else covers.

**D2 — On-identity (scope + wedge).** PAL's identity is *product-analytics judgment practice*. Is it in scope (PA/PM — not ML systems, data engineering, or SWE-for-data, which belong to sibling labs), and ideally on the **judgment wedge** rather than pure recall/lookup?
- 0 = off-scope (belongs in another lab, or not PAL's mission) · 1 = in-scope but off-wedge (pure recall/reference) · 2 = on the judgment wedge.

**D3 — Pillar + funnel placement.** Does it map cleanly to ONE of the four BreakLabs pillars (recall / depth / fluency / judgment) AND to one funnel stage (discover → learn → practice → prep/convert)? A component you can't place is an orphan.
- 0 = can't be placed · 1 = fits one axis · 2 = clear pillar AND stage.

**D4 — Interview/job relevance (demand).** Does it practice something that actually decides real PA/PM interviews or shows up on the job? Use prior now; replace with usage data (completion, return rate) once the leaderboard provides it.
- 0 = speculative/niche · 1 = plausible · 2 = core to the role.

**D5 — Reaches the content bar.** Does it pass — or can it realistically reach — its `EVAL_RUBRICS.md` content rubric, or is it perpetually thin/placeholder/"coming soon"?
- 0 = can't or won't hit the bar · 1 = needs a real pass · 2 = at the bar.

**D6 — Value > carry cost.** Does the value justify the upkeep (content freshness, bug surface) AND the cognitive/nav cost of its mere existence? Be ruthless: a fine-but-low-traffic room still charges rent on your attention and the sidebar.
- 0 = high cost, low value · 1 = neutral · 2 = high leverage.

---

## Verdict rule (pattern, not arithmetic)

- **CUT** — D1=0 (pure duplicate that can't merge), OR D2=0 (off-scope and not worth spinning out), OR D4=0 (no real demand). Delete it; the simplicity is the win.
- **SPIN-OUT** — D2=0 *but* the component is strong and belongs in a sibling lab (e.g. Programming Lab, ML Systems Lab). Move it, link to it. (Precedent: the Python/Code lab → Programming Lab.)
- **MERGE** — D1≤1 (overlaps a sibling) but individually sound. Fold into the stronger of the two; keep one name.
- **REWORK** — on-strategy and needed (D2/D4 high) but D5=0. Fix the content or pull it from nav until it's at bar.
- **KEEP** — unique job (D1=2), on-wedge (D2=2), placeable (D3=2), real demand (D4≥1), at/near bar (D5≥1), value>cost (D6≥1).

---

## Portfolio-level checks (run on the whole, not per-component)

1. **Count vs capacity.** If you cannot re-audit every room within your maintenance cadence, you have too many rooms. Cut to the number you can keep at bar.
2. **Nav legibility.** Can a brand-new user understand the sidebar's top level in ~10 seconds? If groups need explaining, collapse or cut. (You said *you* get confused — that's the test failing.)
3. **Pillar balance.** Map every component to recall/depth/fluency/judgment. PAL's wedge is **judgment** — most surface area should serve it. An over-weight of recall/reference surfaces signals identity drift.
4. **One job per funnel stage.** Multiple components competing for the same stage ("where do I start?") is the overlap smell. Each stage should have one obvious front door.

---

## Worked examples (illustrative — full pass pending)

- **SQL Lab** → **KEEP.** D1 unique (executable SQL judgment, nothing else runs code), D2 on-wedge, D3 fluency+judgment / practice, D4 core, D5 at bar (gated). The flagship.
- **Programming Lab** → **SPIN-OUT (already done).** D2=0 for PAL (SWE-for-data fluency is a sibling-lab mission); correctly externalized and linked.
- **MCQ Trainer** → **KEEP, but boxed.** D1 distinct (fast recall drilling), but D2=1 (recall pillar, off the judgment wedge). Keep it as the single recall entry; do not expand it into PAL's center of gravity.
- **The experiment cluster** (Stats Room, Experiment Design, Experiment Review, A/B Interpreter, + Exp Foundations) → **RUN THE RUBRIC — likely a MERGE candidate.** Five surfaces in one concept space is exactly the overlap D1 is built to catch. Probable outcome: one learn surface (Exp Foundations) + one or two practice surfaces, not five front doors.

---

## How to use it

Run every PAL component through D1–D6, assign a verdict, and produce a single **keep / merge / cut / spin-out / rework map** — that map is what resolves "which is what and whether it should exist." Then act on the cuts first (simplicity ships fastest), merges next, reworks last. Re-run when adding any new component: *nothing new ships without a KEEP verdict here.*
