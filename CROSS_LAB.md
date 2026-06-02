# CROSS_LAB.md — Cross-Lab Ideas and Learnings

Ideas that originated from thinking about PAL but apply to sibling labs, or ideas for sibling labs that contain patterns PAL can learn from. This file is a routing layer — ideas here should be actioned in the appropriate repo.

Last updated: V4.44.0 (2026-05-31)

---

## All Labs (PAL + MSL + GAL)

**1. Cross learnings audit — read each other's repos thoroughly**
Each lab has shipped patterns, components, and content structures the others have not. A dedicated cross-lab session (reading code, not building) would surface low-effort ports. Known gaps: MSL has multi-part escalating case dossiers and 4-tier model answers (both actionable in PAL); GAL has a "simplify" toggle on articles (requires backend for PAL — deferred); PAL has the SQL runtime and hint system (potentially portable to labs with SQL content).

**2. india-wealth-architecture visual reference**
Repo: `https://github.com/SidharthKriplani/india-wealth-architecture`
This project has animation and visual cue patterns worth studying — wealth flow diagrams, animated transitions, visual hierarchy. All labs should audit it for UI/animation inspiration before building new interactive modules. PAL's animation system (`.pal-page-enter`, `.pal-reveal-in` etc.) is solid but the visual language for data flow and decomposition (relevant to metric trees, funnel decomposition, RCA trees) could be lifted from this work.

**3. Country curation**
All labs could benefit from country-specific content paths. For PAL, this means Indian company tracks (Meesho, Swiggy, Zepto, Razorpay) and India-specific business contexts in cases. For MSL, it could mean Indian ML company examples (Ola, Flipkart ML, Navi). For GAL, India-specific AI product case studies. Gate for all: confirm audience signal that Indian users are on the platform before investing in content that won't get used.

---

## GAL (GenAI Lab) — Ideas to action in that repo

1. **Resume with prep lab revamp** — integrate resume analysis with the interview prep section. A user's resume should inform which AI product concepts they're weak on and prioritize accordingly. Same pattern as PAL's Defense Strategy (JD → gap score → plan). Directly portable.

2. **Plan / Career / AI Product / My Progress revamps** — these sections need a design pass. The current layout (per Sidharth's notes) reads too dense and doesn't communicate learning progression clearly. Reference PAL's Progress.jsx SectionCard pattern for the per-skill breakdown.

3. **Flesh out more concepts** — GAL has strong framing sections but thin concept depth in some areas. Identify which concepts have <300 word articles and prioritize expanding them before the next beta push.

4. **Company logos** — same pattern as PAL's Google Favicon API fix. Use `https://www.google.com/s2/favicons?domain=...&sz=32` — Clearbit is unreliable and has rate limits. Update across all places that use company logos.

---

## MSL (ML Systems Lab) — Ideas to action in that repo

1. **More project labs, extension of each lab** — the project-based learning format in MSL is a strong differentiator. Extend existing labs (each currently ~3–5 exercises) to 8–10 exercises before adding net-new labs. Depth > breadth.

2. **Simplify for blog posts** — GAL shipped a "simplify" toggle on articles (Ground Truth). MSL wants the same for its ∇ Gradient posts. This requires an API call — make sure there's a proxy or key-management plan before shipping. Don't expose the API key client-side.

3. **System design — retrieval failures** — the "retrieval failures" module in MSL's system design section (RAG retrieval quality, embedding drift, retrieval latency spikes) is actually a GAL concept, not an MSL concept. MSL covers model training and inference systems; retrieval failure analysis belongs in GAL's AI product section. Audit whether this content should be moved or cross-linked.

4. **Training lab — attention heads, transformers** — verify whether the attention heads / transformer architecture content in MSL's training lab is at the right level of abstraction. If it's covering architecture theory rather than training decisions (learning rate schedules, gradient clipping, mixed precision), it may belong in a separate "foundations" module rather than the training lab. The training lab should be about training decisions, not architecture review.

5. **Company logos** — same fix as GAL. Switch from Clearbit to Google Favicon API.

6. **SHAP values in ∇ Gradient — YouTube link check** — the SHAP values post has an embedded YouTube video that is showing as "unavailable." Run a full audit of all YouTube embeds across ∇ Gradient posts — check for videos that are private, deleted, or region-locked. Replace unavailable embeds with either a different video or remove the embed entirely. This is a content quality issue that affects trust.

---

## PAL-specific learnings from sibling labs

(Things PAL can borrow from MSL/GAL — already logged in IDEAS.md where actionable)

- **Multi-part escalating case dossiers** (MSL pattern) → already in IDEAS.md Tier 2 Content
- **4-tier model answers** (MSL InterviewQATab) → already in IDEAS.md Tier 2 Content
- **"Analytics Failures" catalog** (GenAI Lab Debug pattern) → already in IDEAS.md Tier 2 Content
- **Forward-pointer card at case endings** (GenAI Lab sprint pattern) → already in IDEAS.md Tier 3
- **ELI5 mode on articles** (GAL "simplify") → deferred (requires backend/API proxy); in IDEAS.md Tier 3
- **Per-room breakdown in mock exam debrief** (MSL CombinatorTab) → already in IDEAS.md Tier 2
- **Weak topic heatmap in Trainer debrief** (MSL TrainerTab) → already in IDEAS.md Tier 3
