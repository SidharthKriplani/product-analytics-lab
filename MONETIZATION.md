# PAL — Monetization Strategy

Last updated: V4.80.0 (2026-06-03)

---

## Long-term vision

PAL is not an interview prep platform. It is the professional development platform for analytics careers.

The distinction matters for pricing and positioning. Interview prep platforms (LeetCode, DataLemur) are commodity tools under existential pressure from AI — you can ask ChatGPT to explain a SQL concept and get a clean answer. PAL tests judgment in ambiguous situations, which cannot be outsourced to an LLM. The forensic format, the RCA methodology, the ambiguous metrics cases — these train the thing that makes analysts senior: knowing what question to ask before writing a single line of SQL.

The correct comparisons are O'Reilly Learning ($499/year), HBR case studies ($200+/year), and case interview prep ($500-1000 per engagement). Not $12/month LeetCode.

The interview use case is also recurring across a career (first job, promotion, new company, layoffs) — this is not a "3 weeks of prep" product, it is a product someone comes back to multiple times across 10 years.

---

## Tier structure

### Anonymous (not signed in)
- Landing page only
- Can browse room browsers (see what exists, feel the scope)
- Cannot run any content (cases, SQL problems, foundations modules)
- Sign-in prompt on any content attempt
- Goal: enough to understand the quality exists, not enough to use it

### Free (signed in, no payment)
- All Foundations content (Stat, Metrics, RCA, Exp, A/B) — these are top of funnel, always free
- First 3 cases per room (`isFree: true`)
- SQL Lab Easy problems only
- Full progress tracking and cross-device sync via Supabase auth
- Goal: complete enough to evaluate whether PAL is worth paying for

### Premium (signed in + access code or Stripe subscription)
- Everything: all cases, all SQL tiers (Easy + Medium + Hard + Master + Forensic), all company tracks, full Interview Simulator, all rooms as they ship
- Priced at: $29-39/month or $249-299/year (individual)
- B2B: team license (analytics teams, bootcamps, universities) — $200-500/month for 5-20 seats
- Goal: full product access, justified by ongoing content additions and career ROI

---

## Current gate implementation

**Access code:** `DAI2026` (community / founder tier) — stored in localStorage under `pal-access-code-v1`. Case-insensitive check. Community code given to beta users, LinkedIn audience, direct invites.

**`isUnlocked()`** in `src/utils/unlock.js`: checks localStorage for a valid access code. Returns `true` if code found, `false` otherwise. When Stripe goes live, this function will ALSO check a valid Stripe subscription token.

**`getAccessTier(user)`** in `src/utils/unlock.js`: returns `'anonymous'` | `'free'` | `'premium'`. Use this for tier-aware UI rendering.

**Sign-in gate** in `src/App.jsx`: `AUTH_REQUIRED_PAGES` set — if `!user` and page is a runner or SQL Lab, intercepts via useEffect and shows auth modal. Browsing and foundations remain open.

**SQL Lab tier structure:**
- Easy: `isFree: true` → accessible to signed-in free users
- Medium / Hard / Master / Forensic: `isFree: false` → requires premium unlock

---

## Content + pricing philosophy

Do not underprice. The person paying is a product analyst targeting a $120k+ job. The ROI of passing one interview is 10-20× the annual subscription price. Pricing at $29-39/month positions PAL as a professional investment, not a discount tool.

Do not make the free tier so generous that nobody converts. All Foundations + 3 per room is enough to understand what PAL is. It is not enough to actually prepare for an interview.

Do not add a subscription tier until you can justify it with ongoing content additions. If content is static, subscriptions feel like a tax. Subscriptions are justified when PAL is visibly growing: new rooms, new forensic batches, new company tracks, new case formats. The current trajectory (forensic format, ongoing batches) supports subscription.

---

## B2B path (medium term)

Analytics bootcamps teaching product analytics need structured practice material. Companies onboarding analysts need a skill assessment tool. Universities running data programs need real judgment-based cases. PAL is already closer to curriculum than flashcard prep.

B2B pricing: team license, annual contract, $500-2000/month depending on seat count. Do not build this until B2C is profitable and content quality is unambiguously high.

---

## Roadmap

| Phase | When | What |
|---|---|---|
| Beta (now) | Current | DAI2026 code = premium. Free tier = isFree cases + foundations + Easy SQL. Anonymous = landing only. |
| Stripe launch | When content is at 200+ problems and 3+ more rooms | Flip isUnlocked() to check Stripe subscription. Launch $29/month and $249/year. Beta users offered founder rate. |
| B2B pilot | 6-12 months post-Stripe | Reach out to 3 bootcamps. Manual contracts. No self-serve B2B yet. |
| Team tier | After first 3 B2B contracts | Build team dashboard, seat management, progress reporting. |
