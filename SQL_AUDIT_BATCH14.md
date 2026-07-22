# Batch 14 — Swiggy India-series sw01–sw03 (T9c batch-1, PROMPT E style)

**Scope note:** the dispatch asked for 5 items, starting with the "Swiggy sw01-06 series" (6 problems). PROMPT E's own protocol states "3 items max per turn — audit degrades past 3." Following the protocol's own documented ceiling rather than the dispatch's count: this batch covers sw01–sw03 only. sw04–sw06 (which exist and were confirmed via grep) plus the other ~2-3 items to reach "5 of 38" should follow as their own ≤3-item batch(es), not appended here.

**Post-166 note:** these are India-series additions, not part of the original 130-problem audit (SQL_QUALITY_AUDIT.md Batches 1–13) or the S-grade upgrade pass (SQL_LAB_PLAN.md Section 11) — that pass's batch map only covers e/m/h/master. sw01–03 were never scored against MJ/FV/FA at all until this batch. Scored here for the first time.

## Self-check (printed first, per PROMPT E)

- Every dimension of every item has a quoting justification below — 3 items × 7 dims + 3 S-grade dims = 30 scored cells, all quoted. Count: 30/30.
- Verification column: DC (difficulty calibration) and schema-match (expectedColumns vs SELECT list) were mechanically checked against SQL_LAB_PLAN.md Section 1's pattern lists and the actual solution SQL — marked VERIFIED below, not assumed. Everything else (BF/CA/DR/Di/IQ/TC/MJ/FV/FA) is auditor judgment against the rubric's descriptive anchors — NOT-CHECKABLE-HERE in the mechanical sense (no script can verify "is this insight non-obvious"), scored from reading the full object, not the title/tags.
- Score I felt pressure to round up: sw03's IQ (scored 3) — the debrief's own honesty about "a thin loyalty signal on 25 orders" made me want to credit the self-awareness, but self-awareness about thinness isn't the same as the insight itself being non-obvious. Kept at 3.

## Score table

| ID | Title | Difficulty | BF | CA | DC | DR | Di | IQ | TC | 7-dim total | MJ | FV | FA | S-grade subtotal | Combined /50 | Disposition |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sql-sw01 | Average Delivery Time by City | Medium | 4 | 5 | 5 | 5 | 4 | 4 | 5 | 32 | 1 | 5 | 4 | 10 | 42 | fix-listed |
| sql-sw02 | Swiggy One Revenue Contribution | Easy | 5 | 5 | 5 | 5 | 3 | 5 | 5 | 33 | 4 | 5 | 4 | 13 | 46 | fix-listed |
| sql-sw03 | Loyal Diners | Easy | 4 | 4 | 5 | 4 | 3 | 3 | 5 | 28 | 1 | 5 | 4 | 10 | 38 | fix-listed |

No dimension scored below 3 on any item (rubric auto-flag threshold); no 7-dim total below 20. **No item auto-flags under the literal rubric threshold** — the fix-listed dispositions below come from findings that don't cross that specific line but are real per PROMPT E's "never round up" instruction.

## Per-dimension quotes (condensed — full reasoning per item)

**sql-sw01** (32/35 + 10/15 S-grade):
- BF=4: "Swiggy's operations team needs to evaluate delivery performance across different cities" — real but generic ask, no named downstream action.
- CA=5: debrief states city = restaurant city not customer city and explains why: "Operations teams track performance by the city where the restaurant (and its courier network) is deployed."
- DC=5 **VERIFIED**: solution combines date-arithmetic (`EXTRACT(EPOCH...)/60.0`) with `GROUP BY`+`AVG` — matches Section 1's Medium pattern "Date arithmetic composed with aggregation" exactly, not the Easy "Date range WHERE filter" pattern.
- DR=5: two real traps quoted — unit conversion ("Chennai reads 1140 instead of 19") and a genuine NULL-skip subtlety ("dropping the WHERE status = 'delivered' filter returns the exact same numbers here... Relying on NULL-skipping is a latent bug").
- Di=4: unit-conversion-on-date-arithmetic trap is distinct from other traps seen in this sample.
- IQ=4: "Chennai is fastest at 19 min, Delhi slowest at 40 — a 2x spread ops would dig into (kitchen prep vs traffic and distance) before acting" — names two real candidate root causes, not just a flat number.
- TC=5: 3 `methods` entries each with `tradeoff`/`breaksWhen`, plus a `dial` block ranking them per scenario.
- MJ=1: **no `beforeWriting` field on this object at all** — mechanically confirmed via grep between this id and the next (`sql-sw02`) start line; zero matches.
- FV=5: full "wrong answer that runs" section with a quoted catch method ("a per-city average in the thousands is a unit error").
- FA=4: has a "Sanity check" line but no separately-labeled "your answer would be wrong if" sub-bullet (folded into the sanity-check sentence instead).

**sql-sw02** (33/35 + 13/15 S-grade):
- BF=5: named team (Growth), named decision (subscription contribution), plus a real `beforeWriting` forcing a stated assumption before coding.
- CA=5: "Swiggy One gives free delivery and restaurant discounts. The growth question is whether the 82% concentration comes from ordering more often or spending more per order" — tied to an actual Swiggy product.
- DC=5 **VERIFIED**: canonical solution is a plain 2-table JOIN + WHERE + GROUP BY + COUNT/SUM — matches Section 1's Easy patterns exactly, no window/CTE in the graded solution.
- DR=5: cancelled-orders-inflate-GMV trap shown with real numbers ("subscribers jump to 18 orders / ₹6,810").
- Di=3 **(flagged — see FLAGS block)**: shares its core trap mechanic (`no_delivered_filter` — forgetting the delivered-status filter inflates a count/sum) with sw03 below and (verified via per-problem scan) sw05 as well.
- IQ=5: "82% of revenue from 60% of customers... subscribers average 2.7 orders vs 1.25 for non-subscribers, and a higher average order value too" — a genuine two-lever insight (frequency AND AOV), not a single number.
- TC=5: 4 `methods` entries, `dial` block with 3 scenario-based rankings (large-table performance, multi-status reporting).
- MJ=4: `beforeWriting` field present and well-formed: "Should cancelled orders count toward GMV? State your answer before writing the WHERE clause."
- FV=5: full wrong-answer section, quoted, with the exact inflated numbers shown.
- FA=4: sanity check present ("order_count sums to 21 and total_gmv to 7155") but again no separately-labeled "would be wrong if" sub-bullet.

**sql-sw03** (28/35 + 10/15 S-grade):
- BF=4: "the restaurant partnerships team at Swiggy wants to identify loyal diners" — real team, generic ask (no named downstream action like sw01/sw02 have).
- CA=4: "restaurant partners use repeat-order data to find their most loyal diners — the first targets for rewards" — specific, correct partner-relations reasoning.
- DC=5 **VERIFIED**: solution is `GROUP BY` + `HAVING COUNT(*) >= 2`, no JOIN needed — matches Section 1's Easy pattern "HAVING (filter on aggregated result)" exactly.
- DR=4: two traps — the shared delivered-filter trap (see Di flag) AND a genuinely distinct grain-error trap ("GROUP BY customer only... the result jumps from 2 pairs to 7 rows").
- Di=3 **(flagged)**: same `no_delivered_filter` mechanic as sw02, confirmed via a per-problem scan (`id: 'no_delivered_filter'` appears verbatim as a method id in sw02, sw03, and sw05). Partially offset by the grain-error trap being genuinely novel to this item.
- IQ=3 (the score I nearly rounded up — see self-check): "Only two pairs clear the bar... a thin loyalty signal on 25 orders" is honest but is mostly a count-and-caveat, not a non-obvious insight on the level of sw01's prep-vs-transit framing or sw02's frequency-vs-AOV framing.
- TC=5: 4 `methods` entries, `dial` block with 3 scenario-based rankings.
- MJ=1: **no `beforeWriting` field** — mechanically confirmed via grep, same gap as sw01.
- FV=5: full wrong-answer sections for BOTH traps (grain error and missing filter), each with its catch method embedded in `breaksWhen`.
- FA=4: sanity check present, same "no separate would-be-wrong-if sub-bullet" pattern as the other two.

## FLAGS block

1. **Cross-item distinctiveness (Di), mechanically confirmed (corrected after a re-check — see note):** a precise per-problem scan (not line-position guessing) shows `id: 'no_delivered_filter'` as a named method appears in sw02, sw03, **and sw05** — NOT sw04 or sw06. Three of the six-problem series share the identical "forgetting the delivered-status filter inflates a count/sum" trap as a named method id. This is exactly the pattern SQL_QUALITY_AUDIT.md's own Batch 1 flagged and rewrote for (e07/e10, "structurally identical... different table names"). Not auto-flagged by the rubric (no single dimension fell below 3), but real and worth a rewrite-list decision once sw04–06 are also scored. (An earlier draft of this row guessed sw04 from raw line position instead of scanning each problem's actual byte range — caught and corrected before filing; the per-problem scan is the version to trust.)
2. **MJ (Measurement Judgment) field is a clean alternating pattern, mechanically confirmed:** `beforeWriting` is present on sw02, sw04, sw06 (even-numbered) and **absent on sw01, sw03, sw05** (odd-numbered) — verified by scanning each problem's own byte range, not by line proximity. This is too regular to be incidental — reads like two separate authoring passes (or two prompt-template runs) rather than random gaps. Since MJ is scored per-item, every odd-numbered item in this series will score MJ=1 and miss the ≥11 S-grade-subtotal target purely from this alternation, regardless of the rest of its content quality. Worth confirming with whoever authored the series whether this was intentional (e.g., a planned second pass) or an oversight — not assuming either way.
3. **FA (Falsifiability) sub-format gap, all 3 items:** all three debriefs have a "Sanity check" sentence but none use Section 11's specific "**Your answer would be wrong if:** [condition] — [what to check]" labeled two-part format. Content is present in substance (folded into the sanity-check prose) but not in the FA template's literal shape. Scored FA=4 rather than 5 on all three for this reason — a formatting gap, not a substance gap, but worth naming since it's consistent across all 3 items (possibly a series-wide authoring pattern, not per-item variance).

## Not done here (explicitly out of scope for this batch)

No rewrites proposed or performed — PROMPT E is audit-only ("Proposing rewrites... that's a separate role with a separate prompt"). sw04–sw06 and the remainder of "5 of 38" not scored this batch — see scope note above.
