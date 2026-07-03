# ECOSYSTEM_LEDGER.md — Cross-Lab Shared Ledger

Shared async state for all labs and the LinkedIn content system.
**Intended location:** `Professional/ECOSYSTEM_LEDGER.md` (one level above all labs). Currently in PAL root — move after creation.

**Labs:** PAL (product-analytics-lab) · MSL (ml-systems-lab) · LNK (LinkedIn content) · CTL (project controller)

**Skip-rules (read in this order, skip the rest):**
1. STATE BOARD — always read (~50 lines, top of file)
2. DECISIONS — read entries newer than the last DEC code you wrote
3. MESSAGES — read threads tagged to you or `ALL`
4. Skip everything else

**Format rules (enforced):**
- One-line entries by default; multi-line only when reasoning is needed
- Each entry gets a code (DEC-001, MSG-001) so it's referenceable
- Status: ✓ done · → next · ⊥ blocked · ? open · ! warning
- Append-only — never edit past entries, only add new ones
- Prose discussion does NOT belong here; keep it in per-lab spine files

---

## STATE BOARD

*Updated: 2026-06-21. Rewrite this section (not append) when state changes.*

| Lab | Version | Status | Active blocker |
|-----|---------|--------|----------------|
| PAL | V5.42.0 live · V5.43.0 pending | → run tag_companies.py, then commit | tag_companies.py not yet run (AUDITS #174) |
| MSL | v4.x (independent) | unknown — check MSL NEXT.md | none known |
| LNK | Week 1 launch Mon 2026-06-23 | → produce 2 carbon visuals, schedule Mon+Thu posts | visual production |
| CTL | — | → ECOSYSTEM_LEDGER created | none |

**Cross-lab blockers:**
- PAL email capture / newsletter must exist before LinkedIn audience compounds. Target: live by 2026-06-30 (week 2-3 of LinkedIn launch). ⊥ not started.
- LinkedIn posts DO NOT link to labs by default (Style Bible: no external link in body). First-comment linkback only when BOTH: direct interactive counterpart exists AND post proven OR carousel. Cap 1-2/week.

---

## DECISION LEDGER

*Append new decisions. Never edit past entries.*

### DEC-001 — Session architecture (2026-06-21) [CTL→ALL]
One strategy session (LNK + cross-lab decisions + this ledger). Separate per-lab build sessions opened fresh, closed after NEXT.md batch. Build sessions read STATE BOARD + their DECISION delta at open; do not carry LinkedIn context.

### DEC-002 — LinkedIn link policy (2026-06-21) [LNK→PAL,MSL]
No external link in post body (2026 algo ~60% reach penalty). Linkback only in first comment; only when post has a direct interactive counterpart in a lab AND (post is proven OR it's a carousel). Python/PSL posts: no target yet, keep link-free. Long game: post → newsletter → lab. Newsletter must exist before linkback strategy is meaningful.

### DEC-003 — alsoAskedAt tagging (2026-06-21) [PAL]
tag_companies.py built. Adds 0-3 secondary companies per SQL problem from 69-company pool. Qwen3-8B conservative tagging (0-1 is fine, don't force 3). UI live in SqlLabPage.jsx but field not yet populated — no user-facing effect until script runs.

### DEC-004 — Email capture timing (2026-06-21) [LNK→PAL]
LinkedIn launch proceeds without email capture. Not a launch blocker. Must be live by 2026-06-30. Minimum viable: Beehiiv or Substack signup page. Drive to it via native CTA in post body. Do NOT brand PAL as "free forever" — monetisation liability.

### DEC-005 — Shared Supabase identity: PAL ⇄ PL (2026-07-03) [PAL,PL→ALL]
PL points at **PAL's Supabase project** for *identity* (same `VITE_SUPABASE_URL` + anon key on PL's Vercel) — **one login across labs**, the first concrete step of the shared BreakLabs ecosystem. **Scores isolated per lab:** PL writes a separate `pl_leaderboard` table; PAL's `leaderboard` (keyed by user_id, single `total_solved`) is untouched — a shared scores table would clobber cross-lab. **Entitlements stay per-lab — shared identity ≠ shared paygate** (Sidharth's explicit concern; resolved at the entitlement layer, not auth, so PL can be free/bundled/paid independently). MSL + GSL already have their *own* Supabase projects with their own schemas — folding them into the shared project later is a bounded auth-consolidation migration (name-collision handling + one canonical `auth.users`), do it only when the ecosystem payoff is worth it. Infra to make PL's board live: PL Vercel env = PAL's values · `pl_leaderboard` SQL in PAL's project · PL domain in PAL Auth redirect URLs. Ref: PL `DECISIONS.md` D-PL-31.

---

## MESSAGE THREAD

*Append new messages. Tag: [FROM→TO] or [FROM→ALL].*

### MSG-001 — PAL→LNK (2026-06-21)
V5.42.0 live. hintSteps on all 182 problems. Company filter now shows real names (Stripe, Meta, etc.) not internal datamartId codes. alsoAskedAt UI built but dormant until tag_companies.py runs. Next PAL build: run tag_companies.py → commit V5.43.0 → run eval_content_quality.py for baseline quality scores.

### MSG-002 — LNK→ALL (2026-06-21)
LinkedIn launch: Mon 2026-06-23 8:00 AM IST. 20 posts drafted for weeks 1-4. Only blocker is 2 carbon visuals for week 1 (Posts 1+2). Carousels (Posts 3,4,9,11) are week 2+ — not Monday blockers. Style Bible complete. No external links in post bodies — Style Bible enforced.
