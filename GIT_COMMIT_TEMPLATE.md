# Git Commit Template — Copy & Paste Into Mac Terminal

**Run this at the end of every session from your Mac terminal (NOT from sandbox).**

---

## Template 1: Default (use this most of the time)

Copy-paste this exact block into your Mac terminal and change VERSION + DESCRIPTION:

```bash
cd "/Users/ASUS/Documents/GitHub/experimentation-systems-lab" && rm -f .git/index.lock .git/HEAD.lock && git add -A && git commit -m "V4.50.0: All audits resolved (91/87/79+80). Built FoundationNudgeCard + BeginnerOnboardingTrack. Emoji→Icon in 3 headers." && git push origin main
```

**Steps:**
1. Change `V4.50.0` to your actual version (e.g., `V4.51.0`)
2. Change the description after the colon to what you actually did
3. Copy entire thing
4. Paste into Mac terminal
5. Press Enter
6. Done

---

## Template 2: If Git Is Stuck (use if you get lock errors)

```bash
cd "/Users/ASUS/Documents/GitHub/experimentation-systems-lab" && rm -f .git/index.lock .git/HEAD.lock && rm -f .git/refs/heads/main.lock && git status && git add -A && git commit -m "V4.50.0: [YOUR DESCRIPTION HERE]" && git push origin main
```

---

## Template 3: Verbose (see each step execute)

If you want to see what's happening:

```bash
cd "/Users/ASUS/Documents/GitHub/experimentation-systems-lab"
echo "Step 1: Unlocking git..."
rm -f .git/index.lock .git/HEAD.lock
echo "Step 2: Checking status..."
git status
echo "Step 3: Staging files..."
git add -A
echo "Step 4: Committing..."
git commit -m "V4.50.0: [YOUR DESCRIPTION HERE]"
echo "Step 5: Pushing..."
git push origin main
echo "✅ Done!"
```

---

## Quick Reference: What to Put in Description

**Format:** `V4.X.X: [What you did]. [What you built/fixed]. [Status check].`

**Examples:**

```
V4.50.0: All audits resolved (91/87/79+80). Built FoundationNudgeCard + BeginnerOnboardingTrack. Emoji→Icon in 3 headers.

V4.51.0: Integrated FoundationNudgeCard into 3 room browsers. Added BeginnerOnboardingTrack to Home.jsx. Components tested.

V4.52.0: Finished emoji removal (audit #80 complete). Replaced remaining emojis in PlaybookBrowser and BlogBrowser with Icon components.

V4.53.0: Simulator layout redesign (audit #82). Removed role card emojis, tightened spacing, converted hardcoded px to CSS variables.
```

---

## Checklist Before Running Git Command

Before you copy-paste, verify:

- [ ] Build passes: `npm run dev` (0 errors)
- [ ] NEXT.md updated with what you did
- [ ] BRAIN_TRANSFER.md updated with new state
- [ ] SESSION_KICKOFF.md updated if priorities changed
- [ ] New files created actually exist
- [ ] No stale TODOs in spine files

If all boxes checked → copy-paste the git command above.

---

## If Push Fails

**Error: "cannot lock ref HEAD"**
```bash
rm -f .git/index.lock .git/HEAD.lock
git push origin main
```

**Error: "Your branch is ahead of 'origin/main'"**
```bash
git push origin main
```

**Error: "rejected ... (fetch first)"**
```bash
git fetch origin main
git push origin main
```

---

## After Push Succeeds

You'll see:
```
[main 3f4e9b2] V4.50.0: ...
 5 files changed, 230 insertions(+), 15 deletions(-)
 create mode 100644 src/components/shared/FoundationNudgeCard.jsx
 create mode 100644 src/components/shared/BeginnerOnboardingTrack.jsx
```

✅ You're done. Session complete.

