# PAL Beta Feedback Log

All user feedback logged here chronologically. Source, date, status, and triage on every entry.
Do not delete old entries — mark as Resolved / Won't Fix / Deferred instead.

---

## Log

---

### Session 1 — WhatsApp Beta Group | 2026-06-19
**Testers:** Nikhil, Amaya, Saswat, Debasrija

| # | Reporter | Feedback | Severity | Status | Triage |
|---|---|---|---|---|---|
| 1 | Amaya | SQL Lab Q.9 false positive — wrong answer passes validation | HIGH | ✅ Fixed V5.36.0 | checkValues strengthened to include all 4 columns |
| 2 | Saswat / Debasrija | SQL column alias error gives no hint — community had to self-correct | MEDIUM | ✅ Fixed V5.36.0 | Error message now includes "column aliases must match schema exactly" |
| 3 | Nikhil | Stats Foundations modules 26–32 do not open when clicked | HIGH | ✅ Fixed V5.36.0 | sf26-sf32 were missing from statsFoundationsIndex in caseIndex.js |
| 4 | Nikhil | "Saved" sidebar item visible but no in-page bookmark action discoverable | MEDIUM | ⚠️ Open | Investigate what Saved is supposed to do; either wire it or remove it |

---

### Session 2 — New User (Beginner POV) | 2026-06-19
**Tester:** Anonymous new user (Hindi-speaking, self-identified beginner)
**Context:** First-time home screen experience. No prior exposure to the platform.

**Raw feedback (paraphrased from Hindi/English mix):**

> "Home screen felt overwhelming — 222 items, many rooms, guided paths, study plans, readiness charts, SQL progress, learning paths. First thought: where do I actually start? First experience should be simpler; features should unlock gradually as users progress."

> "Platform assumes users already know terms like RCA, Instrumentation. A one-line explanation or tooltip on why each thing matters would make it far less intimidating."

> "Multiple recommendations shown at once: Start Metrics, Beginner Path, Guided Paths, Study Plan, Learning Paths. As a beginner I'd prefer one clear recommendation — 'this is where you should begin.'"

> "Progress system is nice but could be more motivating — e.g. 'complete your first 5 cases', 'you're 15% interview-ready', estimated completion time for a track."

**Note:** Feedback is onboarding-only. Tester acknowledged they understood the platform once oriented — the issue is the cold-start experience.

| # | Theme | Specific issue | Severity | Status | Triage |
|---|---|---|---|---|---|
| 5 | Information overload | Home screen shows everything at once — no clear starting point | HIGH | ⚠️ Open | Progressive disclosure / onboarding simplification. Ideas Tier 1 candidate. |
| 6 | Jargon barrier | "RCA", "Instrumentation", "Experimentation" undefined for beginners | MEDIUM | ⚠️ Open | Add one-liner subtitle or tooltip per room card explaining what it is and why it matters |
| 7 | Recommendation overload | Multiple competing CTAs: Start Metrics / Beginner Path / Guided Paths / Study Plan / Learning Paths | HIGH | ⚠️ Open | Collapse to single first-action recommendation based on user state |
| 8 | Progress motivation | Progress exists but lacks milestones / interview-readiness framing | LOW | ⚠️ Open | Add milestone markers (first 5 cases, 15% ready, track ETA). Fits naturally into Progress.jsx redesign. |

**Design direction implied by this feedback:**
The cold-start experience needs a single, confident "here's where you start" moment. Everything else should be discoverable after the first session, not presented simultaneously. This is a distinct problem from feature completeness — the platform has the right rooms, the onboarding surface just presents all of them at once to someone who has no frame of reference.

---

## Open Items Summary

| # | Severity | Issue | Status |
|---|---|---|---|
| 4 | MEDIUM | "Saved" sidebar item — no discoverable action | ⚠️ Open |
| 5 | HIGH | Home screen information overload — no clear starting point | ⚠️ Open |
| 6 | MEDIUM | Room jargon unexplained for beginners (RCA, Instrumentation, etc.) | ⚠️ Open |
| 7 | HIGH | Multiple competing onboarding CTAs — confusing to new users | ⚠️ Open |
| 8 | LOW | Progress milestones missing — not motivating enough | ⚠️ Open |

### Session — LinkedIn testimonials | 2026-06-23/24
Positive signal (not bugs) — logged for the record; added to the testimonials wall + ticker + Home strip.
- **Anjali Yemmanur** (BI / Metrics / RCA tracks): PAL develops the business and product side — data storytelling, stakeholder communication, decision-making — and shifted her to "thinking like a data professional presenting insights and recommendations to stakeholders, not just analyzing data and writing observations." Added V5.49.0; img `public/testimonials/anjali.jpg`.

**Product decision (2026-06-24):** the in-app "Would you pay for this?" pricing-feedback widget was **removed** from Plans (V5.49.0) — PAL doesn't need a willingness-to-pay probe in-product; the element was handed to the Programming Lab.

---

## Resolved

| # | Issue | Fixed in |
|---|---|---|
| 1 | SQL Q.9 false positive validation | V5.36.0 |
| 2 | SQL column alias error — no hint | V5.36.0 |
| 3 | Stats Foundations modules 26–32 silent failure | V5.36.0 |
