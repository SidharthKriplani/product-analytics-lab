# SPINE PROTOCOL — Session State Enforcement Card

---

## START OF SESSION

```bash
rm -f .git/index.lock .git/HEAD.lock && git status --short && npm run build
```

**Read BRAIN_TRANSFER.md only.** CLAUDE.md is in system prompt. NEXT.md only if next action is unclear. No other files at open — costs 80–120k tokens for zero gain.

**Grep before Read. Always.**

---

## END OF SESSION

Update **BRAIN_TRANSFER.md** — version, what was done (2–3 lines per feature), next action, any new components.

Update **NEXT.md** — add "Done this session (V4.X.X)" block, reorder queue, update version in header.

```bash
# From Mac terminal (sandbox cannot push)
cd "/Users/ASUS/Documents/GitHub/experimentation-systems-lab"
rm -f .git/index.lock .git/HEAD.lock
git add -A
git commit -m "V4.X.X: [description]"
git push origin main
```

---

## CLOSE CHECKLIST

- [ ] `npm run build` passes (0 errors)
- [ ] BRAIN_TRANSFER.md updated (version + next action current)
- [ ] NEXT.md updated (session logged, queue reordered)
- [ ] Git committed and pushed from Mac terminal
