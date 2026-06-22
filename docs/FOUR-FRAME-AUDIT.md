# FOUR-FRAME AUDIT — PAL mapped to the Competence Model

_Created 2026-06-22. Read-only audit. Maps PAL's existing surface to the four-frame Competence Model (`HQ/COMPETENCE-MODEL.md`, DEC-15) to see how the lab's world distributes across the frames and where it's thin — **before** any restructure. No nav rebuilt, no content added, no code touched._

> **Note on sources.** The HQ files (`COMPETENCE-MODEL.md`, `MANIFESTO.md`, `DECISIONS.md`) are not mounted in this lab's working copy, so this audit works from the model as registered in the build brief: four frames in a dependency ladder — **recall+depth → fluency → ownership → judgment** — each gating the next; **judgment content assumes recall+depth+fluency are in place; ownership is scaffold+capture; communication is cross-cutting, not a frame.** If the canonical HQ definitions differ in detail, re-run the tagging against them — the method below is stable, only the boundary calls would move.

---

## The model, applied (one-line frame definitions used for tagging)

- **Recall + depth** — know the thing and why it's true. Teaching/explanatory content; concepts, frameworks, worked theory, the "why this is true / where it breaks." Tested by retrieval (MCQ).
- **Fluency** — *do* the mechanic correctly and quickly. Hands-on execution: write the query, run the test, compute the estimate, build the model. The skill of producing a correct artifact, not deciding which to produce.
- **Ownership** — take a problem end-to-end with scaffold + capture: plan it, work it under realistic constraints, produce a deliverable, get it evaluated. Scaffolding holds the shape; capture records what you did.
- **Judgment** — decide under ambiguity and tradeoff: ship/rollback, which metric, is this analysis trustworthy, what's the root cause. **Assumes the lower three.**
- **Communication** — *cross-cutting*, not a frame: STAR narratives, spoken summaries, defense docs, debrief copy. Tagged where it dominates, but never counted as one of the four.

---

## 1. Surface inventory

Everything a user can hit, grouped by the lab's current nav (Sidebar.jsx). 17 practice rooms + 6 foundation/learn zones + practice tools + track/infra.

| Zone (nav group) | Surface | Content type / engine |
|---|---|---|
| **Foundations** | Stat Foundations (32 mod), Metrics Foundations (13), RCA Foundations (12), A/B Foundations (15), Theory Hub | Teaching modules — keyInsight + worked theory |
| | Study Room | Spaced-repetition review queue (meta) |
| **Experiments** | Stats (claim-eval, 16) | Read a claim → decide if it holds |
| | A/B Design (16) | 4-phase structured design + scoring |
| | A/B Review (16) | Ship / Rollback / Investigate readouts |
| | Spot the Flaw (12) | Adversarial — find the flaw |
| | A/B Interpreter | Interpret a readout |
| **Analytics** | Metrics (8), RCA (12), Analytics Cases (12), Growth Analytics (8), BI & Reporting (12), Instrumentation (8), Full Loop | Case runners — diagnose/decide/design |
| | SQL Lab (182 problems: 146 std + 36 Forensic) | Write + run SQL (sql.js); Forensic = find-the-bug |
| **Product** | Product Design (16), Prioritization (12), Behavioral (30 STAR), Estimation (30 Fermi) | Scenario runners + STAR + arithmetic |
| **Drills** | Challenges (6 cross-room), Mock Interview / Simulator (5-case timed, DS/PM, MCQ rounds, speech) | Cross-room synthesis; timed live mock |
| **Learn** | Deep Dives (69 articles), Frameworks (playbook), Interview Q&A, Analytics Failures | Long-form reading |
| **Tools** | MCQ Quiz (40), Company Tracks, Defense Strategy (JD→7-day plan), Saved, Prep Cheatsheet, Python Lab (Pyodide), Dimensional Modeling, A/B Tool (z-test calc) | Retrieval, planning, code runner, calculator |
| **Track / infra** | Profile, Progress (heatmap, readiness score, learning paths), Plans, Search, Consult | Tracking / navigation — not frames |

---

## 2. Frame tags

Primary frame in **bold**; secondary in parentheses. Communication noted where it dominates.

| Surface | Primary frame | Secondary |
|---|---|---|
| Stat / Metrics / RCA / A/B Foundations (72 mod), Theory Hub | **Recall+depth** | — |
| Deep Dives (69), Frameworks, Interview Q&A, Prep Cheatsheet | **Recall+depth** | — |
| MCQ Quiz (40), Trainer | **Recall+depth** | (fluency-lite retrieval) |
| Analytics Failures | **Recall+depth** | (judgment — cautionary) |
| SQL Lab — standard 146 | **Fluency** | (judgment via debrief "wrong-answer-that-runs") |
| Python Lab (Pyodide), Dimensional Modeling | **Fluency** | (ownership-lite) |
| A/B Tool (z-test calculator) | **Fluency** | — |
| Estimation (30 Fermi) | **Fluency** | (judgment — assumptions) |
| Stats claim-eval (16) | **Fluency** | (judgment) |
| A/B Review — Ship/Rollback/Investigate (16) | **Judgment** | (recall+depth) |
| Spot the Flaw (12) | **Judgment** | (recall+depth) |
| SQL Forensic (36) | **Judgment** | (fluency) |
| Metrics (8), RCA (12), Cases (12), Growth Analytics (8), BI (12) | **Judgment** | (recall+depth) |
| Product Design (16), Prioritization (12) | **Judgment** | (communication) |
| A/B Design (16), A/B Interpreter | **Judgment** | (fluency) |
| Challenges (6 cross-room) | **Judgment** | (ownership — synthesis) |
| Full Loop | **Ownership** | (judgment) |
| Take-Home (5, timed + rubric) | **Ownership** | (judgment, communication) |
| Mock Interview / Simulator | **Ownership** | (judgment, communication) |
| Instrumentation (8 — measurement plans, data contracts) | **Ownership** | (recall+depth) |
| Defense Strategy (JD → study plan) | **Ownership** | (planning scaffold) |
| Company Tracks | **Ownership** | (scaffold) |
| Behavioral (30 STAR) | **Communication** (cross-cutting) | (ownership) |
| Study Room, Progress, Profile, Plans, Search, Consult, Saved | *Infra / not a frame* | — |

---

## 3. Coverage table — per frame

| Frame | Strength | What exists | Standout pieces |
|---|---|---|---|
| **Recall + depth** | **Deep** | 72 foundation modules + Theory Hub + 69 Deep Dives + Frameworks + Interview Q&A + Cheatsheet + 40 MCQ + Analytics Failures | The V4.45–4.46 "beginner access layer" — every foundation `keyInsight` opens with a concrete work situation before any framework language. The widest, best-built base in the lab. |
| **Fluency** | **Deep in one place, thin everywhere else** | SQL Lab (182, real execution), Python Lab, Dimensional Modeling, A/B Tool, Estimation, Stats claim-eval | SQL Lab is a genuine fluency engine — write, run, get checked against seed data, 18-category coverage. Nothing else approaches it: Python Lab and the A/B calculator are shallow by comparison, and no fluency engine exists for metrics/RCA mechanics. |
| **Judgment** | **Deep + broad (the lab's identity)** | A/B Review, Spot the Flaw, SQL Forensic, Metrics, RCA, Cases, Growth, BI, Product Design, Prioritization, A/B Design, Challenges | The product's thesis ("judgment calls, not recall") is real here. Standouts: the **adversarial bug-hunt vein** — Spot the Flaw (12) + SQL Forensic (36) = 48 find-the-flaw items — plus Ship/Rollback/Investigate readouts and cross-room Challenges. |
| **Ownership** | **Thin — scaffold without depth** | Full Loop, Take-Home (5), Simulator, Instrumentation (8), Defense Strategy, Company Tracks | Pieces exist but none is a deep graded end-to-end engine. Take-Home is the closest (timer + rubric + sample outline) but only 5 cases. Most "ownership" here is *planning scaffold* (Defense Doc, Company Tracks) or *self-directed*, not work-it-and-get-evaluated. |

**The shape:** PAL is **bimodal and bottom-heavy-plus-top-heavy**. The ladder is strong at the bottom rung (recall+depth, by far the most content) and the top rung (judgment, the most rooms and the identity), with a **fluency spike concentrated almost entirely in SQL Lab** and **ownership present only as scaffold**. Unlike MSL (≈64% judgment-of-the-bug-hunt kind), PAL is more balanced across recall+depth and judgment — but it shares MSL's adversarial bug-hunt strength (48 find-the-flaw items) and inherits the same weak rung: ownership.

---

## 4. Gap report — what this means for a user climbing the ladder

The ladder gates upward: you can't get real value from judgment content without fluency under it, and fluency without recall+depth is rote. Walking PAL bottom-to-top, a user hits two structural snags.

**Gap 1 — the fluency cliff (the biggest structural gap).** Recall+depth is wide and judgment is wide, but the rung between them is **one room deep**. A user can *read* about sessionization, cohort retention, CUPED, power analysis (recall+depth), and can *decide* whether an analysis is trustworthy (judgment) — but the only place they actually *perform* an analytical mechanic and get checked is SQL (and, shallowly, Python and the z-test calculator). There is no fluency engine for: computing a metric definition end-to-end, running an RCA query chain, executing a power/sample-size calculation as a graded exercise, building a funnel. Judgment rooms therefore sit on top of a fluency layer that, outside SQL, **isn't there** — the user is asked to judge mechanics they were taught (recall+depth) but never drilled (fluency). This is the lab's sharpest ladder violation.

**Gap 2 — ownership is scaffold, not capture+evaluation.** The model defines ownership as scaffold **+ capture**. PAL has the scaffold (Defense Doc plans the week, Company Tracks sequences rooms, Simulator times you, Full Loop chains stages) but little **capture+evaluation**: nowhere does a user own a full analysis under constraints, produce a deliverable, and get it graded against a rubric — except the 5 Take-Homes. For someone trying to reach "I can own an analytics problem end-to-end," PAL gives a plan and a timer but few reps of the actual owned deliverable with feedback.

**Non-gaps (strengths worth protecting):** recall+depth is genuinely deep and beginner-accessible; judgment is broad and distinctive, especially the bug-hunt vein. The fix is not "add more judgment" — it's filling the rung the judgment content is standing on.

**A note on miscategorized weight:** SQL Lab's 182 problems make fluency *look* covered in a raw count, but ~36 are Forensic (judgment) and the bulk of the fluency strength is single-domain (SQL). Counting rooms by frame overstates fluency breadth; it's depth in one column, not coverage across the analytics surface.

---

## 5. Proposed restructure (propose-only — nothing built)

Reorganize the top-level nav so the IA *is* the ladder — a user sees the four rungs and climbs them — instead of today's topic-grouped nav (Experiments / Analytics / Product) that hides the progression. This is a **navigation/IA proposal only**; every existing piece keeps its engine and data.

**Proposed top-level structure (four rungs + cross-cutting + track):**

```
LEARN  (Recall + Depth)
  Foundations: Stat · Metrics · RCA · A/B · Theory Hub
  Deep Dives · Frameworks · Interview Q&A · Analytics Failures · Cheatsheet
  MCQ Quiz                         ← retrieval check sits at the top of this rung

DRILL  (Fluency)
  SQL Lab · Python Lab · Dimensional Modeling
  A/B Tool (calculator) · Estimation · Stats claim-eval
  ⚠ thin — see build order: this rung needs new engines, not just re-filing

DECIDE  (Judgment)
  A/B Review · Spot the Flaw · SQL Forensic · A/B Design · A/B Interpreter
  Metrics · RCA · Cases · Growth Analytics · BI
  Product Design · Prioritization · Challenges (cross-room)

OWN  (Ownership — scaffold + capture)
  Full Loop · Take-Home · Mock Interview/Simulator · Instrumentation
  Company Tracks · Defense Strategy
  ⚠ thin — scaffold present, capture+evaluation needs building

COMMUNICATE  (cross-cutting — surfaced, not a rung)
  Behavioral (STAR) · spoken summaries · Defense Doc output
  (these also live inside their home rooms; this is a lens, not a silo)

TRACK
  Progress (readiness score, heatmap, learning paths) · Profile · Plans · Saved
  Study Room (spaced repetition) · Search · Consult
```

**Where each existing piece lands:** every room maps cleanly to a rung by its primary tag in §2. The few dual-nature surfaces (SQL Lab spanning Drill/Decide; Estimation spanning Drill/Decide; Challenges as Decide-with-ownership) stay in their primary rung with a secondary chip, not duplicated.

**What's missing (the rungs that need content, not re-filing):** the **Fluency rung is one-room-deep** and the **Ownership rung is scaffold-only**. Re-labeling won't fix this — these rungs would look empty/thin the moment the IA makes the ladder explicit, which is itself the argument for building them (build-order below).

**Cut candidates / doesn't fit the model:**
- **Consult** (keyword-matching "input a topic, get linked cases") — overlaps Search; it's a navigation aid, not a frame surface. Candidate to fold into Search.
- **A/B Interpreter vs A/B Review** — adjacent judgment surfaces; check for redundancy and consider merging.
- **Theory Hub vs Foundations** — Theory Hub may be a redundant index over the four foundation rooms; verify it earns its own nav slot.
- **Defense Strategy + Company Tracks** — both are planning scaffolds; consider one "Plan your prep" surface rather than two.
- None of these is a strong cut — PAL has little dead weight. The real work is rung-filling, not pruning.

---

## 6. Build-order note (per DEC-15 — climb the ladder, don't skip rungs)

DEC-15 gates each frame on the one below. PAL's base (recall+depth) and top (judgment) are already deep, so the build order is **not** "more of what's strong" — it's **fill the load-bearing middle so the judgment content has something to stand on.**

1. **First — Fluency (close Gap 1).** This is the highest-leverage build because the lab's broad judgment layer is currently standing on a one-room fluency base. Extend fluency beyond SQL: a graded metric-definition exercise, an RCA query-chain drill, a power/sample-size calculation engine, a funnel-build drill. These are "perform the mechanic, get checked" engines in the SQL Lab mold. The judgment rooms immediately become better-supported once their underlying mechanics are drillable.
2. **Second — Ownership capture (close Gap 2).** Turn the existing scaffold into scaffold+capture: expand Take-Home beyond 5, add rubric-graded end-to-end deliverables, give Full Loop a captured output. This rung only pays off once fluency exists under it (you can't own an analysis you can't yet execute), so it follows fluency.
3. **Maintain, don't expand first — Recall+depth and Judgment.** Both are deep. New judgment content should wait until its fluency footing exists; otherwise it deepens the existing ladder violation. (This is the same lesson as the SQL coverage audit: don't pad rungs that are already deep.)
4. **Cross-cutting — Communication.** Continue surfacing it inside rooms (STAR, spoken summaries, debrief copy) rather than building a silo; it rides on top of whichever rung the user is on.

**One-line build order:** *Fluency engines (beyond SQL) → Ownership capture → then resume judgment depth.* Lowest rung that's currently thin goes first, per DEC-15.

---

## PROPOSED PUSH — prepared, NOT executed (git still blocked)

One doc to add: `docs/FOUR-FRAME-AUDIT.md` (+ spine updates `NEXT.md`, `LINEAGE.md`). Docs-only commit — no `src/` change, no build/audit scripts needed. **Not pushed** — the git situation flagged in the judgment-layer spike is still open.

```bash
# Only after the git situation is resolved (PAT rotated, single canonical working copy confirmed):
rm -f .git/index.lock .git/HEAD.lock
git clone https://github.com/SidharthKriplani/product-analytics-lab /tmp/pal-push-frames
SRC="<the canonical working copy — confirm first>"
cp "$SRC/docs/FOUR-FRAME-AUDIT.md" /tmp/pal-push-frames/docs/FOUR-FRAME-AUDIT.md
cp "$SRC/NEXT.md"    /tmp/pal-push-frames/NEXT.md
cp "$SRC/LINEAGE.md" /tmp/pal-push-frames/LINEAGE.md
cd /tmp/pal-push-frames
git config user.email "claudesubscription12@gmail.com"
git config user.name "Avinash"
git add -A
git commit -m "docs: four-frame Competence Model audit (read-only, propose-only)"
git push origin main
```

### ⛔ Git still blocked (carried from the judgment-layer spike — resolve before any push)
1. **Live GitHub PAT** embedded in plaintext in `.git/config`'s `origin` URL — rotate the token, re-set the remote to a clean URL + credential helper/SSH.
2. **Two working copies / inconsistent remote name** in CLAUDE.md (`experimentation-systems-lab` vs actual `product-analytics-lab`) — confirm the canonical copy before pushing.

Per approve-first / never-auto-push, this session **stops here**. Nothing pushed. The doc is written to the mounted working copy only.
