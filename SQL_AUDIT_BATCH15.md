# Batch 15 — Swiggy India-series sw04–sw06 (T9c batch-2, PROMPT E style, C4)

Continuation of Batch 14 (sw01–sw03). Same 3-item cap, same rubric (7-dim + MJ/FV/FA), same post-166 note
(India-series, never scored against MJ/FV/FA until this session's batches).

## CORRECTION to Batch 14's FLAGS block — my earlier "sw06 beforeWriting present" claim was WRONG

Fresh, direct read of the live `sqlLabProblems.js` object for `sql-sw06` in this batch (full object printed, not
inferred) shows **no `beforeWriting` field at all** — the object goes straight from `datamartId` to `prompt`. This
directly contradicts what I wrote in Batch 14's FLAGS block #2 ("`beforeWriting` is present on sw02, sw04, sw06").
Sidharth relayed Fable's correction ("beforeWriting reality = present sw02/sw04 only") two messages ago; I pushed
back at the time with a quoted `beforeWriting` string I claimed was sw06's ("Decide what ends a session: the rule
is that more than 30 minutes since the sa..."). Re-reading sw06's actual current content now, that quoted text
does not belong to this problem at all (sw06 is "Payment Mode Revenue — COUNT vs SUM", not a session-definition
problem) — I have no record of where that quote actually came from, and the "-broken clone" theory I offered as
an explanation was a plausible-sounding guess, not something I verified by opening that clone's file. **Fable's
correction was right. My correction-of-the-correction was wrong.** Combined with sw01–05's dimension already
confirmed directly (sw01 absent, sw02 present — quoted in Batch 14 — sw03 absent, sw04 present — quoted below,
sw05 absent — quoted below), the real pattern across sw01–06 is: **present on sw02 and sw04 only**, absent on
sw01, sw03, sw05, sw06. Exactly what Fable said. No further "alternating" or "-broken clone" theory needed —
retracting both.

## Self-check

- Every dimension of every item has a quoting justification below — 3 items × 7 dims + 3 S-grade dims = 30 scored
  cells, all quoted. Count: 30/30.
- DC verification: sw04 and sw05 mechanically checked against SQL_LAB_PLAN.md Section 1's pattern lists (marked
  VERIFIED). sw06 is `difficulty: 'Forensic'` — not one of Section 1's Easy/Medium/Hard tiers, so DC is scored on
  fit-for-a-debug-exercise rather than mechanically matched to a tier pattern — flagged as NOT-MECHANICALLY-
  VERIFIABLE-AGAINST-SECTION-1 rather than marked VERIFIED.
- Score I felt pressure to round up: sw06's TC=2. It's the first item in this whole 6-problem series with no
  `methods`/`dial` block at all (sw01–05 all carry 3–4 methods + a dial), and I considered scoring it a 3 out of
  fairness to the forensic format being structurally different by design. Kept at 2 — the rubric scores technique
  coverage as delivered, not adjusted for format intent, and 2 is what's actually on the page.

## Score table

| ID | Title | Difficulty | BF | CA | DC | DR | Di | IQ | TC | 7-dim total | MJ | FV | FA | S-grade subtotal | Combined /50 | Disposition |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sql-sw04 | Slow Delivery Partners | Medium | 4 | 5 | 5 | 5 | 4 | 4 | 5 | 32 | 4 | 5 | 4 | 13 | 45 | fix-listed |
| sql-sw05 | Top Restaurants by Delivered Revenue | Easy | 4 | 5 | 5 | 5 | 3 | 4 | 5 | 31 | 1 | 5 | 4 | 10 | 41 | fix-listed |
| sql-sw06 | Payment Mode Revenue — COUNT vs SUM | Forensic | 4 | 3 | 4 | 5 | 3 | 3 | 2 | 24 | 1 | 5 | 3 | 9 | 33 | **auto-flagged (TC=2 < 3 threshold)** |

sw06 auto-flags under the literal rubric threshold (single dimension TC=2, below the <3 auto-flag line) — the
first genuine threshold breach across all 6 India-series items scored so far (Batch 14's sw01–03 all cleared 3
on every dimension).

## Per-dimension quotes (condensed)

**sql-sw04** (32/35 + 13/15 S-grade):
- BF=4: "Swiggy's logistics team needs to identify delivery partners with consistently slow performance" — named team, generic ask; debrief later names a real downstream use ("before coaching or deactivation") but the prompt itself doesn't.
- CA=5: "check their cities — Delhi and Hyderabad are the slowest city-wide, so they may be working genuinely harder routes rather than underperforming" — a real confound-check, not just a filter.
- DC=5 **VERIFIED**: solution is `GROUP BY` + `HAVING AVG(date-arithmetic expression) > 35` — matches Section 1's Medium pattern "date arithmetic composed with aggregation" exactly (same pattern class as sw01, confirmed independently here).
- DR=5: `where_per_delivery` trap gives real before/after numbers — "Suresh Yadav reads 42.5 instead of 40.0 and Deepak Mishra 41.0 instead of 37.25" — a well-explained, correctly-computed trap (42.5≠40.0, both plausible-looking).
- Di=4: the WHERE-vs-HAVING-on-an-aggregate trap is a distinct mechanic from every other trap seen in this series (no_delivered_filter, grain error, COUNT-vs-SUM) — genuinely new.
- IQ=4: the city-confound check is a real non-obvious operational insight, on par with sw01's prep-vs-transit framing.
- TC=5: 3 methods (`having_avg`, `subquery_filter`, `where_per_delivery`) each with tradeoff/breaksWhen, plus a 3-rule dial block covering the SQLite alias-in-HAVING limitation specifically.
- MJ=4: `beforeWriting` present and well-formed — "Should you include orders where the partner was assigned but the order was cancelled? Those have NULL delivered_at — decide whether they belong in your avg before writing the WHERE clause."
- FV=5: full wrong-answer section with exact before/after numbers for both partners.
- FA=4: "Sanity check: 2 partners; Suresh Yadav 40.0, Deepak Mishra 37.25" present, same no-separate-would-be-wrong-if-label gap as the whole series so far.

**sql-sw05** (31/35 + 10/15 S-grade):
- BF=4: "The partnerships team at Swiggy needs a revenue leaderboard" — named team, generic ask (no explicit downstream decision named in-prompt).
- CA=5: "Revenue vs frequency: high-revenue restaurants drive GMV; high-frequency ones drive retention. Partnerships watches both" — real, correct partnership-team framing.
- DC=5 **VERIFIED**: canonical solution is a plain `JOIN` + `GROUP BY` + `ORDER BY ... LIMIT 5` — matches Section 1's Easy pattern exactly (no window function in the graded solution; ROW_NUMBER/RANK appear only as alternate methods).
- DR=5: `no_delivered_filter` trap is unusually severe and well-quoted — "Tandoor Tales jumps to #1 at ₹1,720" — this reorders the RANKING, not just the totals, and the debrief explicitly names why that's worse.
- Di=3 **(flagged — repeat mechanic, mechanically confirmed)**: this is the THIRD occurrence of the identical `no_delivered_filter` method id/mechanic in the sw01–06 series (also in sw02, sw03 — confirmed in Batch 14's FLAGS block via a byte-range scan). Partially offset by a genuinely distinct second axis this item teaches (RANK vs ROW_NUMBER tie-handling — not repeated anywhere else in the series).
- IQ=4: "ties Pizza Point on order count (3) but wins on revenue through a higher average order value (~₹393 vs ₹268)" — concrete, non-obvious, computed.
- TC=5: 4 methods including the tie-handling RANK/ROW_NUMBER/LIMIT distinction, arguably the richest TC of the series so far for that reason.
- MJ=1: **no `beforeWriting` field** — confirmed via the full object read above (goes straight from `datamartId` to `prompt`).
- FV=5: full wrong-answer section, quoted, real numbers (₹1,720 vs ₹1,180).
- FA=4: "Sanity check: 5 rows sorted by revenue descending, Cheesy Crust first at ₹1,180 / 3 orders" present, same no-separate-label gap as the series.

**sql-sw06** (24/35 + 9/15 S-grade) — **flagged**:
- BF=4: "Swiggy's finance team needs to understand the revenue generated from delivered orders by each payment mode" — named team, generic ask.
- CA=3: functional framing (payment-mode revenue is a real finance question) but no confound-check or deeper business reasoning the way sw01/sw04/sw05 each have — thinner context than the rest of the series.
- DC=4 **NOT-MECHANICALLY-VERIFIABLE-AGAINST-SECTION-1**: `difficulty: 'Forensic'` isn't one of Section 1's three tiers; scored on fit for a debug exercise (the underlying corrected query — `GROUP BY` + `SUM` + `WHERE` — is itself Easy-tier SQL, appropriate for a forensic/spot-the-bug format), not matched to a pattern list entry.
- DR=5: two real, independently-explained bugs, both with concrete before/after numbers — "COUNT(*) ... UPI: 13, card: 8, COD: 4" vs corrected "UPI: ₹4,000 (11 delivered orders), card: ₹2,760 (7 orders), COD: ₹395 (3 orders)."
- Di=3 **(flagged — partial repeat)**: bug 2 (missing delivered-status filter) is the same repeated `no_delivered_filter`-class mechanic seen in sw02/sw03/sw05 — the fourth occurrence in six items. Bug 1 (COUNT vs SUM) is genuinely distinct from anything else in the series, which is the only reason this isn't scored lower.
- IQ=3: "This class of bug — COUNT when SUM was intended — is among the most common in real analyst code" is true and relevant but generic/textbook framing rather than a sharp, dataset-specific insight (contrast sw01's prep-vs-transit or sw05's AOV framing).
- TC=2 **(auto-flag — genuine gap, not rounded up despite the format-fairness pull noted in the self-check)**: no `methods` array, no `dial` block at all — the only item in the six-problem series structured this way. Whether that's correct for the "forensic" format by design or a real content gap is a product decision, not mine to make, but the rubric scores what's on the page.
- MJ=1: **no `beforeWriting` field** — see the correction section above; this is now mechanically confirmed, reversing my own earlier (wrong) claim.
- FV=5: the `brokenOutputNote` itself is the wrong-answer demonstration (real numbers: UPI 13/card 8/COD 4), plus the debrief's own "Bug 1/Bug 2" breakdown with corrected numbers — strong, concrete, real both ways.
- FA=3: no "Sanity check:" line at all (unlike every other item in the series) — the debrief's closing "Correct output: ..." sentence does similar work informally but isn't labeled as a sanity check or a "would be wrong if" condition. A real, not cosmetic, format gap relative to sw01–05.

## FLAGS block

1. **sw06 TC=2 is a genuine rubric-threshold auto-flag** (first one in the 6-item series) — no `methods`/`dial`
   block at all, unlike every other item scored across Batch 14 and this batch. Worth a product decision: is
   "forensic" format meant to skip methods/dial by design, or is this item missing content the format should have?
2. **`no_delivered_filter`-class mechanic now confirmed in 4 of 6 items** (sw02, sw03, sw05, and sw06's bug 2) —
   the repeat is even more widespread than Batch 14 flagged (3 of 6). Real cross-item distinctiveness concern,
   same as before, now with one more data point.
3. **MJ (beforeWriting) final tally across all 6 items, fully mechanically confirmed**: present on sw02 and sw04
   only; absent on sw01, sw03, sw05, sw06. This supersedes and corrects both Batch 14's "alternating evens" guess
   and my own subsequent wrong "sw06 present" pushback — see the correction section at the top of this file.

## Not done here

No rewrites proposed — audit-only, per PROMPT E. This closes all 6 of the originally-named "Swiggy sw01–06
series" items (Batch 14: sw01–03, Batch 15: sw04–06) at 6/6 scored against the full 7-dim + S-grade rubric for
the first time.
