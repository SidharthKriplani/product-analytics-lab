# Session Kickoff

**One instruction: read BRAIN_TRANSFER.md. That's it.**

CLAUDE.md is in the system prompt. NEXT.md has the queue. BRAIN_TRANSFER.md has current state, next action, and the git template. Do not read other files at session open — it burns context before any work begins.

---

## Connect repo

Path: `/Users/ASUS/Documents/GitHub/experimentation-systems-lab`

## Spine check (run first)

```bash
rm -f .git/index.lock .git/HEAD.lock && git status --short && npm run build
```

Expected: clean git status, build ✓.

## Git commit

```bash
cd "/Users/ASUS/Documents/GitHub/experimentation-systems-lab" && rm -f .git/index.lock .git/HEAD.lock && git add -A && git commit -m "V4.X.X: [description]" && git push origin main
```

## If git is stuck

```bash
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/main.lock && git add -A && git commit -m "V4.X.X: [description]" && git push origin main
```

## Session close checklist

- [ ] BRAIN_TRANSFER.md updated (version, what was done, next action)
- [ ] NEXT.md updated (log shipped items, reorder queue)
- [ ] `npm run build` passes (0 errors)
- [ ] Git commit from Mac terminal

---

**Session state:** V4.53.1. See BRAIN_TRANSFER.md for full current state.
