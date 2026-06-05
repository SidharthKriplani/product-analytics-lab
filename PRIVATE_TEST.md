# PAL Private Test Brief — V5.2.0

**Status:** Ready for 3–5 person private test.
**Date prepared:** 2026-06-05
**Version:** V5.2.0 (post MVP coherence pass V5.0–V5.2)

---

## 1. Ideal Tester Profile

3–5 people actively preparing for product analytics, data analytics, or PM interviews. At least passing familiarity with SQL, metrics, RCA, or A/B experimentation — not necessarily expert. Career-switchers targeting analyst/APM roles are ideal.

What to avoid this round: random casual users with no interview context, people who already have jobs and aren't prepping, anyone who would treat this as a content-reading session rather than active practice.

Good signals: "I have a round in 3 weeks", "I keep getting asked about metrics tradeoffs", "I'm self-studying for PM interviews", "I use LeetCode but want something more PM-specific."

---

## 2. Exact Tester Path

Send testers to: **https://experimentation-systems-lab.vercel.app**

Give no other instructions. Let them navigate cold for the first 2 minutes, then guide if stuck.

### Guest path (first 10 minutes)

1. Open PAL without signing in — click "Explore without signing in."
2. Navigate to Metrics or RCA in the sidebar (under ROOMS → Analytics).
3. Find a case card and try to open it.
   - The first case (Analyst difficulty) should open directly — no gate.
   - Complete the case phases and read the debrief fully.
4. After the debrief, notice the ForwardPointerCard — does a next-case suggestion appear?
5. Try opening a second case in the same room. Gate should appear with room-specific copy.
6. Read the gate copy — does "Sign in free" feel worth it?

### Signed-in path (next 10 minutes)

7. Sign in via email magic link or Google.
8. Land on Progress. Is the Start Here card (or Continue card) clear?
9. Navigate back to the room — try opening the 2nd and 3rd free cases. These should open (isFree: true).
10. Try opening a 4th or 5th case. A Plans/paywall gate should appear.
11. Visit the Plans page — read the three tiers (Guest / Free Account / Full Lab). Can they explain the difference?

### Optional (SQL + Plans)

12. Navigate to SQL Lab. Try an Easy problem. Try Forensic problem f10 (should work). Try f11 (should gate).
13. Visit Plans page cold — ask them to explain what each tier gives them.

---

## 3. Observer Questions

Ask after the session, not during:

**First impression:**
- What did you think PAL was in the first 30 seconds?
- Did it feel like a training system or a content library?

**Navigation:**
- Was the first practice case easy to find?
- Did the sidebar make sense? Were the section labels (ROOMS, DRILLS, LEARN, TOOLS) clear?

**Case quality:**
- Did the debrief make you feel like you learned something, or just confirmed what you already knew?
- Was the judgment-under-pressure format better or worse than reading a framework article?

**Gates and conversion:**
- Did the gate appear at a reasonable moment, or did it feel too early / too late?
- Did signing in feel worth it? What would make it more worth it?
- Was the difference between free and full access clear?

**Retention signal:**
- Would you come back tomorrow and practice for 15 minutes?
- Is there a specific room you'd want to drill before your interview?
- What felt missing?

---

## 4. Success Criteria

**Ready for controlled public distribution if:**
- 3/5 testers understand PAL's core promise (judgment practice, not content reading) within the first minute
- 3/5 complete a guest-preview case without being told how
- 3/5 understand the guest vs. signed-in free vs. full access distinction after visiting the Plans page
- 2/5 say they would return or actively want full access
- No tester reports being stuck on navigation, gate confusion, or missing start points

**Needs one more coherence sprint first if:**
- Testers describe PAL as "a library" or "a collection of articles"
- Testers cannot locate a practice case without help
- Gate appears confusing or feels punitive rather than contextual
- Progress/Home does not direct them to a next action
- Debrief feedback: "I just read the answer, I didn't learn anything new"
- Tier distinction is unclear after Plans page visit

---

## 5. What Not to Test Yet

- Do not ask for feedback on every room — focus on the first-session flow
- Do not probe pricing willingness aggressively — this is a quality/clarity test, not a conversion test
- Do not ask them to test Company Tracks (content not fully built)
- Do not treat this as a public launch — it is a private coherence check
- Do not give them more than 20 minutes of guided time

---

## 6. Current Access Model (for tester context)

| Tier | What's accessible |
|---|---|
| Guest (no account) | 1 Analyst-difficulty case per room, all Foundations, Blog/Playbook |
| Free Account | ~3 isFree cases per room, Easy SQL (50 problems), Forensic SQL f01–f10, progress tracking |
| Full Access (code) | All 300+ cases, Medium/Hard/Master SQL, Staff debriefs, Company Tracks, Mock Interview |

---

## 7. Blocked Until Private Test Feedback

- Public distribution / sharing links
- Sign-in tier expansion Phase 2 (increase isFree to ~6–8 per room)
- Stripe / payment activation
- Interview Simulator expansion
- Company Tracks overhaul

These decisions should be made based on what the private test reveals, not assumptions.
