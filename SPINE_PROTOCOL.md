# SPINE PROTOCOL — Session State Enforcement Card

**Print this. Enforce it. Never skip it.**

---

## START OF SESSION

```
git pull origin main
npm run dev  # Verify 0 errors
```

Read in order:
1. NEXT.md
2. BRAIN_TRANSFER.md
3. CLAUDE.md

---

## END OF SESSION (CRITICAL)

**Before you close, update these three files:**

### 1. NEXT.md
```
Add new section:
**Done this session (V4.X.X):**
- What you built
- What you fixed
- Build status

Update version in header
Reorder priorities if changed
Update "Still open" section
```

### 2. BRAIN_TRANSFER.md
```
Add "## What Was Just Done"
Update git commit code with v4.X.X
Update integration patterns if new components
Add "Questions for Next Session"
Document NEW components (location, props, usage)
```

### 3. SESSION_KICKOFF.md
```
Update priority work queue
Update file locations if changed
Keep git commands current
```

---

## GIT AT CLOSE

```bash
# From Mac terminal (sandbox can't push)
cd "/Users/ASUS/Documents/GitHub/experimentation-systems-lab"

# Unlock if stuck
rm -f .git/index.lock .git/HEAD.lock

# Commit + push
git add -A
git commit -m "V4.X.X: [what you did]"
git push origin main
```

---

## VERIFICATION CHECKLIST

- [ ] Build passes: `npm run dev` (0 errors)
- [ ] New files exist: `ls src/components/shared/New*.jsx`
- [ ] NEXT.md updated with session
- [ ] BRAIN_TRANSFER.md reflects new state
- [ ] SESSION_KICKOFF.md is current
- [ ] No stale TODOs in spine files
- [ ] Git commit message includes version + description
- [ ] Pushed from Mac terminal

---

## WHAT BREAKS IF YOU SKIP THIS

❌ Next session won't know what was built  
❌ Components won't be documented  
❌ Integration patterns will be stale  
❌ Brain transfer loses continuity  
❌ Someone else can't pick up your work  

**Do it. Always.**

