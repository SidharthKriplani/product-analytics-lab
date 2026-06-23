# PAL Exposure Map — GREEN / YELLOW / RED
*Created: 2026-06-19 | Beta feedback cycle: Nikhil, Amaya, Saswat, Debasrija*

Surface classification across all PAL rooms and structural UX layers.
Updated when beta feedback or audits change a room's status.

---

## Classification key

| Signal | Meaning |
|---|---|
| 🟢 GREEN | Ship-ready. Solid enough to show publicly and link from LinkedIn. |
| 🟡 YELLOW | Usable but has known gaps. Show selectively, fix before amplifying. |
| 🔴 RED | Broken or blocked path. Do not point new users here until fixed. |

---

## Structural UX

| Surface | Status | Notes |
|---|---|---|
| Home page | 🟡 YELLOW | No per-room USP bullets. Advisor feedback: room cards need 3-4 feature bullets. Fix in Ideas Tier 1. |
| Sidebar nav | 🟢 GREEN | Casefile OS shipped, clean. |
| Progress.jsx | 🟡 YELLOW | Paths feature reverted — currently shows room progress only. Paths UX deferred to Ideas Tier 1. |
| Auth (magic link / Google / GitHub) | 🟢 GREEN | All three flows verified, cross-device sync works. |
| Theme (Casefile light/dark + Terminal) | 🟢 GREEN | Two-axis architecture shipped V5.30.x. |
| "Saved" sidebar item | 🔴 RED | Shows in sidebar with no discoverable in-page bookmark action. Confusing to new users. Nikhil flagged. |

---

## Practice Rooms

| Room | Status | Notes |
|---|---|---|
| SQL Lab | 🟡 YELLOW | **Winner room, priority fix.** Two bugs fixed this session: (1) Q.9 false positive — checkValues strengthened. (2) Column alias UX — error message now includes schema hint. Race condition (expectedSample null on fast submit) remains a known issue but is low-freq in practice. |
| Review Room (Analytics Cases) | 🟢 GREEN | Full Loop + cases runner solid. Scenario bank comprehensive. |
| Business Cases (RCA) | 🟢 GREEN | rcaCases.js audited. |
| Growth Analytics | 🟢 GREEN | Runner clean. |
| Design (Product Design) | 🟢 GREEN | |
| Behavioral | 🟢 GREEN | |
| Estimation | 🟢 GREEN | |
| Metrics | 🟢 GREEN | |
| BI (Business Intelligence) | 🟢 GREEN | |
| Spot the Flaw | 🟢 GREEN | |
| Challenges | 🟢 GREEN | |
| Take-Home | 🟢 GREEN | |
| Leadership Lens | 🟢 GREEN | |
| Instrumentation | 🟢 GREEN | |
| Prioritization | 🟢 GREEN | |
| Playbook (Product Design Browser) | 🟢 GREEN | |
| Full Loop | 🟢 GREEN | fl01 QA pass in V5.24.0. |

---

## Foundation Rooms

| Room | Status | Notes |
|---|---|---|
| Stats Foundations | 🔴 RED | **Fixed this session.** sf26–sf32 (7 modules) silently failed to open — `openStatFoundationsModule()` used `statsFoundationsIndex` which only went to sf25. Added sf26-sf32 to index in caseIndex.js. |
| Metrics Foundations | 🟢 GREEN | All 17 modules. mf13 renamed V5.27.0. |
| RCA Foundations | 🟢 GREEN | rf10 renamed V5.28.0. 15 modules. |
| A/B Foundations | 🟢 GREEN | Clean pass V5.28.0. |
| Experimentation Foundations | 🟢 GREEN | Runner verified. |

---

## Interview Tools (inside Interview zone)

| Room | Status | Notes |
|---|---|---|
| Stats Calculator (A/B Interpreter) | 🟢 GREEN | |
| All other interview tools | 🟢 GREEN | |

---

## Known open items (from beta WhatsApp session)

| Item | Reporter | Status | Severity |
|---|---|---|---|
| SQL Q.9 false positive | Amaya | ✅ Fixed (checkValues strengthened) | HIGH |
| SQL column alias no hint | Saswat / Debasrija | ✅ Fixed (error message updated) | MEDIUM |
| Stats Foundations modules 26+ not opening | Nikhil | ✅ Fixed (caseIndex.js updated) | HIGH |
| "Saved" sidebar item has no in-page action | Nikhil | ⚠️ Open | MEDIUM |
| SQL expectedSample race condition (fast submit) | Internal | ⚠️ Open (low priority — rare in practice) | LOW |

---

## What's GREEN for LinkedIn amplification right now

Safe to post about immediately: SQL Lab (post-fix), Review Room, Growth Analytics, all Foundation rooms (post-fix), RCA, Behavioral, Estimation.

**Hold on LinkedIn until fixed:** "Saved" sidebar (confusing), Home page USP (no room bullets = weak first impression for new arrivals).

**Gate behind Stripe before amplifying:** Everything. The product is ready enough for private test; public amplification without a paywall gate wastes conversion intent.
