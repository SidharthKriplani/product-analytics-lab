# Session Kickoff — V4.51.0 → Next Build

## ⚠️ SESSION PROTOCOL (Read this first)

**You MUST enforce spine statefulness. Before closing this session:**

- [ ] Update NEXT.md with what you did
- [ ] Update BRAIN_TRANSFER.md with new state
- [ ] Update SESSION_KICKOFF.md if priorities changed
- [ ] Run build check: `npm run dev` (0 errors)
- [ ] Git commit from Mac terminal with version + description
- [ ] Never leave spine files stale

**Full checklist:** See BRAIN_TRANSFER.md "SPINE MAINTENANCE PROTOCOL"

---

**Before you start coding:**

## 1️⃣ Connect to GitHub Repo

Use the **folder picker / browser to connect** to your system GitHub repo:

**Path:** `/Users/ASUS/Documents/GitHub/experimentation-systems-lab`

The agent will guide you — just say "Connect to my folder" and navigate to that path.

---

## 2️⃣ Read These First (in order)

1. **BRAIN_TRANSFER.md** — What was just done, what's ready to integrate, quick reference
2. **NEXT.md** — Session priorities, what's still open, what's deferred
3. **CLAUDE.md** — Architecture rules, code patterns, non-negotiable constraints

---

## 3️⃣ Git Commands You'll Need (copy-paste ready)

### **Unlock git (if stuck from previous session)**
```bash
rm -f .git/index.lock .git/HEAD.lock
```

### **Stage + Commit + Push**
```bash
git add -A
git commit -m "V4.50.0 [description here]"
git push origin main
```

### **Check branch status**
```bash
git status
```

### **Pull latest changes**
```bash
git pull origin main
```

**Note:** All git commands run from Mac terminal. The sandbox agent cannot push directly.

---

## 4️⃣ Quick Status Check

Run this to verify the build:
```bash
npm run dev
```

Expected: 0 build errors, server running on localhost:5173

---

## 5️⃣ What's Ready to Integrate (Copy-paste patterns)

### **Pattern 1: Add FoundationNudgeCard to a browser**

```jsx
// At top of file
import { FoundationNudgeCard } from '../components/shared/FoundationNudgeCard.jsx';

// In JSX (after header, before main grid):
<FoundationNudgeCard 
  foundationRoom="stat-foundations" 
  foundationLabel="Stat Foundations" 
  onNavigate={onNavigate} 
/>
```

**Rooms that need it:**
- RCABrowser → rca-foundations / "RCA Foundations"
- MetricsBrowser → metrics-foundations / "Metrics Foundations"
- CasesBrowser → stat-foundations / "Stat Foundations"

### **Pattern 2: Add BeginnerOnboardingTrack to Home.jsx**

```jsx
// At top of Home.jsx
import { BeginnerOnboardingTrack } from '../components/shared/BeginnerOnboardingTrack.jsx';

// In JSX (after hero closes, around line 501-502):
{visitedRooms.length === 0 && <BeginnerOnboardingTrack onNavigate={onNavigate} />}
```

---

## 6️⃣ Priority Work Queue

**Next session (blocking Batch 2):**
1. Supabase auth finish-or-cut decision (audit #104) — decide + execute
2. Git push V4.51.0 from Mac terminal (user action)
3. Confirm VITE_POSTHOG_KEY live in Vercel (user action)

**After that:**
- Finish emoji removal (audit #80) — PlaybookBrowser + BlogBrowser remaining
- Room header icon consistency (audit #79) — full pass on remaining 8 browsers
- Audit #99: missing key props on .map() calls

---

## 7️⃣ File Locations Reference

**Key files you'll touch:**
- `src/pages/Home.jsx` — Add BeginnerOnboardingTrack
- `src/pages/RCABrowser.jsx` — Add FoundationNudgeCard
- `src/pages/MetricsBrowser.jsx` — Add FoundationNudgeCard
- `src/pages/CasesBrowser.jsx` — Add FoundationNudgeCard

**Reusable components (already built):**
- `src/components/shared/FoundationNudgeCard.jsx` — Ready to use
- `src/components/shared/BeginnerOnboardingTrack.jsx` — Ready to use
- `src/components/shared/Icon.jsx` — Already exists, documented in BRAIN_TRANSFER.md

**Spine files (read, don't break):**
- `CLAUDE.md` — Non-negotiable rules (read at session start)
- `NEXT.md` — Queue + carry-forward log (update before closing)
- `DECISIONS.md` — Architecture rules
- `BRAIN_TRANSFER.md` — What's ready to ship

---

## 8️⃣ Common Questions

**Q: How do I know what to work on?**
A: Read NEXT.md. It's max 5 items, prioritized.

**Q: I broke something. How do I revert?**
A: 
```bash
git status  # See what changed
git checkout -- src/pages/SomeFile.jsx  # Revert one file
git checkout -- .  # Revert everything
```

**Q: Git won't push. What do I do?**
A: Unlock first:
```bash
rm -f .git/index.lock .git/HEAD.lock
git push origin main
```

**Q: Should I use localStorage or state for new features?**
A: Check DECISIONS.md. Rule: if data should persist across sessions → localStorage. If session-only → state.

**Q: Can I hardcode colors / sizes?**
A: No. Use CSS variables. See CLAUDE.md non-negotiable rules section.

---

## 9️⃣ Ready?

1. Use picker/browser to connect to `/Users/ASUS/Documents/GitHub/experimentation-systems-lab`
2. Read BRAIN_TRANSFER.md
3. Read NEXT.md
4. Run the integration patterns above
5. Test
6. Commit with the git commands provided
7. Push from Mac terminal

Good luck! 🚀

---

**Session state:** V4.51.0 ready. 15 features built. Supabase audit #104 decision pending. Go fast.
