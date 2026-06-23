# PAL Study Room — Build Status
Last updated: 2026-06-17

---

## DONE ✓

### 1. Architecture decided
- 346 deduplicated PAL-relevant cards extracted from Anki APKGs
- Breakdown: 160 experimentation, 70 statistics, 62 SQL, 23 causal inference, 20 metrics, 11 product
- Non-PAL decks excluded: Classical ML (414), DL, MLOps, Spark, Cloud, LLMs, recsys
- SM-2 spaced repetition (not a library — ~60 lines of JS)
- All card content stored in Supabase, never in frontend bundle
- Private entry: sidebar link only shows for claudesubscription12@gmail.com + Supabase RLS enforces on backend

### 2. Files built (all in batch 1 folder)

| File | Purpose | Deploy destination |
|---|---|---|
| `pal_cards.json` | 346 extracted Anki cards, cleaned + deduplicated | Run through seed script |
| `supabase_migration.sql` | Creates study_cards, study_reviews, study_notes tables with RLS | Supabase SQL Editor |
| `sm2.js` | SM-2 algorithm (gradeCard, defaultReview, maturityPct) | `src/study/sm2.js` in PAL repo |
| `StudyRoom.jsx` | Full React component — queue view, flip card, topic tracker | `src/pages/StudyRoom.jsx` in PAL repo |
| `seed_study_cards.py` | One-time script to INSERT all 346 cards into Supabase | Run locally once |
| `app_sidebar_patch.md` | Exact code changes needed in App.jsx + Sidebar.jsx | Follow manually |

---

## PENDING — Steps to get it live

### Step 1 — Run Supabase migration
- Go to: https://supabase.com/dashboard → your PAL project → SQL Editor
- Paste and run: `supabase_migration.sql`
- Creates 3 tables: `study_cards`, `study_reviews`, `study_notes`
- All have RLS. study_cards readable by any authenticated user. Others are user-scoped.

### Step 2 — Seed the cards
- Open `seed_study_cards.py`
- Set `SUPABASE_URL` = your project URL (e.g. https://abcxyz.supabase.co)
- Set `SUPABASE_SERVICE_KEY` = your service role key (NOT the anon key — find in Project Settings → API)
- Run: `python3 seed_study_cards.py` (needs `pip install requests`)
- Should print: 346 inserted, 0 errors
- This is a one-time operation. Safe to re-run (ignores duplicates).

### Step 3 — Add SM-2 module to PAL repo
- Copy `sm2.js` → `src/study/sm2.js` in your PAL project

### Step 4 — Add StudyRoom page to PAL repo
- Copy `StudyRoom.jsx` → `src/pages/StudyRoom.jsx`
- It imports from `../lib/supabase` (your existing client) and `../study/sm2`

### Step 5 — Wire into App.jsx
Open `src/App.jsx` in PAL, make these 3 changes:

**A. Add import** near other page imports:
```js
import { StudyRoom } from './pages/StudyRoom';
```

**B. Add route case** in the page-routing switch:
```jsx
case 'study':
  if (!user) { navigate('home'); return null; }
  return <StudyRoom user={user} />;
```

**C. Optional keypress shortcut** (add to global keydown handler):
```js
if (e.key === 'S' && e.shiftKey && e.altKey && user) navigate('study');
```

### Step 6 — Wire into Sidebar.jsx
Open `src/components/layout/Sidebar.jsx`, add this block inside the nav (near the bottom, above theme toggle):
```jsx
{user?.email === 'claudesubscription12@gmail.com' && (
  <button
    className={`sidebar-nav-item${currentPage === 'study' ? ' sidebar-nav-active' : ''}`}
    onClick={() => onNavigate('study')}
    title="Private Study Room"
  >
    <span className="sidebar-nav-icon">◆</span>
    <span className="sidebar-nav-label">Study</span>
  </button>
)}
```

### Step 7 — Deploy
```bash
git add src/study/sm2.js src/pages/StudyRoom.jsx src/App.jsx src/components/layout/Sidebar.jsx
git commit -m "feat: private study room with SRS"
git push origin main
```
Vercel auto-deploys on push.

---

## Notes / decisions to remember
- `study` route uses `mode-casefile` (warm, not terminal dark)
- `TERMINAL_PAGES` in App.jsx — do NOT add 'study' to it
- Card content is NOT proprietary (general knowledge), so readable by all authenticated users is fine
- `study_reviews` and `study_notes` are strictly user-scoped via RLS
- No Microsoft To Do integration in v1 — use copy-to-clipboard of today's queue as workaround
- PWA manifest not added yet — v2 item
- No rich notes editor — v2 item
- DS/ML cards (Classical ML, DL, MLOps etc.) NOT imported — belong in a separate lab

---

## If resuming this task with Claude
Tell Claude: "Resume PAL study room build. Read STUDY_ROOM_STATUS.md in batch 1 folder.
All files are already built. Pending steps are 1-7 above."
