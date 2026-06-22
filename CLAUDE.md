# CLAUDE.md — PAL Session Briefing

Read this first, every session. It is the fastest path from cold start to productive work.

---

## Working relationship

Act as a product and engineering partner, not an assistant. That means:

- Push back when something is wrong, over-scoped, or not worth building
- Give an honest opinion before executing — if the idea is weak, say so first
- Don't pipeline every input into the backlog. Most things don't belong there
- Don't invent tiers or reframe bad ideas to make them sound good
- If a decision has a real cost or risk, name it plainly
- Disagree out loud. Agreement should mean something

The job is to build a good product, not to make every session feel productive.

---

## What this project is (5 lines)

**Product Analytics Lab (PAL)** is a browser-based interview prep platform for product analysts and PMs. Users practice judgment calls — not recall — across 17 rooms covering stats, experimentation, RCA, metrics, SQL/Python, product design, prioritization, behavioral, estimation, analytics instrumentation, and A/B foundations. React + Vite SPA, localStorage + optional Supabase auth. Deployed on Vercel. Repo: `github.com/SidharthKriplani/product-analytics-lab`. Current version: V4.46.0.

---

## Scope constraint (non-negotiable)

**PAL stays within product analytics and PM.** No ML systems, no data engineering, no model training content. BI is in scope. Analytics instrumentation is in scope. Anything that belongs in the sibling ML Systems Lab is not.

---

## Non-negotiable code rules

### Syntax — will break the Vercel build if violated
- All JS data files use **single quotes only**
- Any apostrophe inside a single-quoted string **must be escaped as `\'`** — e.g. `'product\'s metric'`
- **No template literals (backticks) in data files** — Vite/Rolldown throws parse errors
- This has broken the build twice (challengesCases.js, growthAnalyticsCases.js). Check every leadershipNote, situation, and debrief field before committing

### Component pattern — lazy loading
All page and runner components use `React.lazy()` with named-export pattern:
```js
const MyBrowser = lazy(() => import('./pages/MyBrowser.jsx').then(m => ({ default: m.MyBrowser })));
```
Never use static imports for room pages/runners. `<Suspense>` wraps the entire `<main>` block.

### CSS — always use variables, never hardcode
```css
var(--accent)        /* blue — Review Room, Experimentation Foundations */
var(--teal)          /* teal — Instrumentation, Stat Foundations, RCA Foundations */
var(--yellow)        /* yellow — Challenges, BI, Take-Home */
var(--green)         /* green — Metrics, Metrics Foundations */
var(--red)           /* red — Spot the Flaw */
var(--purple)        /* purple — Product Design, Leadership Lens */
var(--surface)       /* card background */
var(--border)        /* border color */
var(--text)          /* primary text */
var(--text-muted)    /* secondary text */
```

### Animation — always use the utility class system, never write ad-hoc keyframes
All animations live in `src/index.css`. Use these classes — do not add inline `animation:` CSS or new `@keyframes` in component files:
```
.pal-page-enter     — page/view mount (all pages, module views)
.pal-card-enter     — staggered card entry (+ animationDelay inline per index)
.pal-card-hover     — hover lift + shadow (all clickable cards)
.pal-reveal-in      — spring debrief/answer panel entrance
.pal-glow-pulse     — Next/Continue button after reveal
.pal-slide-up       — modal and overlay entrance
.pal-success-ring   — correct answer (JS class toggle + setTimeout)
.pal-shake          — wrong answer (JS class toggle + setTimeout)
.pal-pop            — badge / counter scale pop
.pal-spotlight      — unlock sweep
.pal-shimmer-box    — loading skeleton
```
New animation needed → add utility class to index.css, add to this list, cover with `prefers-reduced-motion`.

### Mobile — responsive grid pattern
```css
gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))'
```
The inner `min()` prevents horizontal overflow on mobile. Never use `minmax(380px, 1fr)` bare.

### Apostrophes and escape sequences — build-breaking if wrong

Three distinct contexts; three different rules:

1. **Data files (`src/data/*.js`)** — single-quoted strings: escape apostrophes as `\'` — e.g. `'product\'s metric'`. Required.
2. **JSX/component files — JS string expressions** — `\'` is valid only *inside* an already-open single-quoted string. **Never use `\'` as string delimiters** (e.g. `\'-\'` or `\'# \'`). Rolldown throws "Invalid Unicode escape sequence" at build time.
3. **JSX text content** (between `>` and `<` tags) — use **plain apostrophes only**. `\'` in JSX text renders as literal `\` + `'` or causes a parse error.

This class of bug broke the Vercel build in V4.14.1 (DebriefCopyButton.jsx). Do not repeat it.

### Paywall
`isUnlocked()` in `src/utils/unlock.js` returns `true` (beta). Do not change this. When Stripe goes live this will flip — it is marked with `// TODO: set to false when Stripe goes live`.

---

## File structure (what matters)

```
src/
  App.jsx                     — routing, state, track() calls for every room
  index.css                   — full CSS variable theme system
  data/                       — all case/scenario/module data files
                                (includes expFoundationModules.js, metricsFoundationModules.js,
                                 rcaFoundationModules.js, statsFoundationsModules.js,
                                 sqlLabDatamarts.js, sqlLabProblems.js — never merge these two,
                                 and all other room data files)
  pages/                      — browser pages (one per room)
  components/
    layout/Sidebar.jsx         — primary nav (PRACTICE ROOMS / PRACTICE / LEARN / TOOLS / TRACK)
                                 Header.jsx exists but is unused — Sidebar.jsx is the real nav
    expFoundations/            — Experimentation Foundations runner
    metricsFoundations/        — Metrics Foundations runner
    rcaFoundations/            — RCA Foundations runner
    shared/                    — shared components (DebriefCopyButton.jsx, DifficultyChips.jsx, Icon.jsx, etc.)
    [room]/[Room]Runner.jsx    — case runner components
  utils/
    analytics.js               — PostHog wrapper (env-var gated, PII-stripped)
    unlock.js                  — beta gate (always true right now)
    [room]Progress.js          — localStorage progress per room
public/
  sitemap.xml                 — 25+ URLs, update when adding routes
  robots.txt
  og-image.png
docs/
  PLATFORM_ARCHITECTURE_MEMO.md
  CONTENT_QUALITY_BAR.md
  SCENARIO_BANK_TAXONOMY.md
  ROADMAP.md
```

---

## Dev + commit workflow

### Running locally
```bash
npm run dev
```

### Building (Vercel workaround for disk space)
```bash
npm_config_cache=/tmp/npm-cache ./node_modules/.bin/vite build --outDir /tmp/dist-output
```

### Pre-commit checks (run before every commit that touches SQL Lab)

```bash
# 1. SQL Lab audit — 0 T1 failures required before commit
python3 scripts/audit_sql_lab.py 2>&1 | grep "T1 FAIL"
# Must print nothing. T2 warnings are logged but don't block.

# 2. Apostrophe audit — catches unescaped ' in single-quoted JS data strings
python3 -c "
import re, glob
broken = []
for fpath in sorted(glob.glob('src/**/*.js', recursive=True)):
    for i, line in enumerate(open(fpath).readlines()):
        if any(p in line for p in [\"q: '\", \"a: '\", \"explanation: '\", \"hint: '\"]):
            clean = re.sub(r'\"[^\"]*\"', '\"\"', line.replace(\"\\\\\'\", 'XX'))
            if clean.count(\"'\") % 2 != 0:
                broken.append(f'{fpath}:{i+1}')
                print('BROKEN:', fpath, i+1, line.strip()[:80])
print('OK' if not broken else f'{len(broken)} broken strings — fix before committing')
"

# 3. Brace diff — catches unclosed JS object/array literals
node -e "const f=require('fs').readFileSync('src/data/sqlLabProblems.js','utf8'); const o=(f.match(/\{/g)||[]).length, c=(f.match(/\}/g)||[]).length; console.log('Brace diff:', o-c)"
# Must print 0
```

### Git commit workflow (MANDATORY — direct git from repo path does not work)
The repo is in an iCloud-synced folder. `git status`, `git add`, and `git commit` all fail with `fatal: mmap failed: Operation timed out` because iCloud evicts large working-tree files and git tries to mmap them. **Never attempt git operations from the repo path directly.**

Always commit via /tmp clone:
```bash
git clone https://github.com/SidharthKriplani/product-analytics-lab /tmp/pal-push

# Before copying files — check for any files on disk not in HEAD (missed from prior sessions):
# comm -23 <(find src -type f | sort) <(git ls-tree -r HEAD --name-only | sort)

SRC="/Users/ASUS/Documents/Professional/BreakLabs/labs/product-analytics-lab"
# cp each changed file: cp "$SRC/src/..." /tmp/pal-push/src/...

cd /tmp/pal-push
git add -A
git commit -m "Vx.x.x: description"
git push origin main
```

`/tmp` is local storage — no iCloud, no mmap failures. This is permanent; do not try to fix the underlying mmap issue.

---

## When external content arrives (screenshots, links, posts)

Make a product + engineering call first. Not everything belongs. Ask: does this reveal a gap PAL is genuinely placed to fill, with content specific enough to practice against? If yes, add to IDEAS.md at the right tier with honest effort sizing. If no, say so and move on. Don't pipeline every input into the backlog.

**Field intelligence workflow** (practitioner posts, LinkedIn screenshots, job descriptions):
1. Assess source credibility — is this a practitioner signal or generic advice?
2. Gap-map to PAL rooms — which room(s) does this inform? Is the gap real?
3. Check for content specificity — can PAL build a case around this, or is it too vague?
4. If viable: name the cluster, add to IDEAS.md at the right tier, note the source
5. If not: say why and discard — don't invent tiers to make weak signals sound useful

---

## Adding a new room (checklist)

1. `src/data/[room]Cases.js` — data file, single quotes, escape apostrophes. Tag every case with `difficulty: 'analyst' | 'senior' | 'staff'`
2. `src/utils/[room]Progress.js` — localStorage key `pal-[room]-progress-v1`
3. `src/pages/[Room]Browser.jsx` — named export, mobile-safe grid. Import `DifficultyChips` from `../components/shared/DifficultyChips.jsx` and wire `diffFilter` state + filter on the displayed array
4. `src/components/[room]/[Room]Runner.jsx` — named export, `onBack`, `onNext`, `unlocked` props
5. `src/App.jsx` — lazy import, state var, open function, routing block, `onResetAllProgress` key
6. `src/components/layout/Sidebar.jsx` — nav item in correct subgroup + `getIsActive()` mapping
7. `src/pages/Progress.jsx` — add to completionMap, allRoomProgress, heatmap dates, getNextSuggested
8. `public/sitemap.xml` — add route

---

## Context limit prevention (critical — read this)

PAL's 1M token context limit gets hit when large source files + spine files + conversation history compound. Hit it and you get incomplete edits, missed steps, and unreliable work.

**Files that will burn your context if read in full — always Grep first:**

| File | Lines | Rule |
|---|---|---|
| `src/pages/PlaybookBrowser.jsx` | ~5,000 | Never read in full. Grep for component/function name, then `Read` with offset+limit. |
| `src/data/designScenarios.js` | ~4,000 | Grep for case id, read ±30 lines. |
| `src/data/rcaCases.js` | ~4,000 | Same. |
| `src/data/businessCases.js` | ~3,800 | Same. |
| `src/data/sqlLabProblems.js` | ~2,800 | Same. |
| `src/components/expFoundations/ExpFoundationsRunner.jsx` | ~2,700 | Grep for the function/section. |
| `src/data/metricCases.js` | ~2,600 | Same. |
| `src/data/scenarios.js` | ~2,300 | Same. |
| `CHANGELOG.md` | ~2,900 | Pre-V4.40 archived in CHANGELOG_ARCHIVE.md. Only read the top (recent versions). |
| `AUDITS.md` | ~2,100 | Pre-V4.30 archived in AUDITS_ARCHIVE.md. Read from offset if you need older audits. |

**Operating rules:**

1. **Session open: read BRAIN_TRANSFER.md + NEXT.md + CLAUDE.md only.** Do not proactively read source files before knowing exactly which function or section you need.
2. **One focused batch per session.** Plan work that touches 3–5 files max. If you need 10+ files, split across sessions.
3. **Never read a file >2,000 lines in full.** Use `Grep` to find the section, then `Read` with offset+limit.
4. **Use subagents for large-file tasks.** The Agent tool spawns a fresh context — delegate any task requiring reading a large file to a subagent rather than doing it in the main session.
5. **CLAUDE.md stays under 250 lines.** New rules only — no sprint logs. Sprint history lives in NEXT.md carry-forward log.

---

## MD spine files (what each does)

| File | Purpose |
|---|---|
| `CLAUDE.md` | This file. Read every session. |
| `NEXT.md` | Session queue — max 5 items, ordered. Read before IDEAS.md. Update at end of every session. |
| `DECISIONS.md` | Prescriptive rulebook — architectural + product standing rules. Check before making any structural choice. |
| `LINEAGE.md` | Narrative history of PAL — origin, major pivots, identity decisions, access/monetization arc. Written in prose, not version entries. Reconstructed from CHANGELOG.md. Read when you need to understand how the product got here. |
| `CHANGELOG.md` | Full technical build log — every version with what changed, why, and which files. Terse version entries at the top; detailed narrative entries below. Source of truth for LINEAGE.md. |
| `IDEAS.md` | Tiered backlog — In Progress / Tier 1 / Tier 2 / Tier 3 / Retired. |
| `AUDITS.md` | Health log — 143 audits to date, with ✅ resolved / ⚠️ open status. |
| `METRICS.md` | Tracked events, user funnel, success metrics, localStorage keys. |
| `docs/CONTENT_QUALITY_BAR.md` | 8-dimension standard every case must pass before shipping. |
| `docs/SCENARIO_BANK_TAXONOMY.md` | 15 scenario families for the Review Room. |
| `docs/EVAL_RUBRICS.md` | Per-component quality rubrics — Tier 1 (block commit) + Tier 2 (warn) checks. SQL Lab fully specified; other components pending. Pre-commit script status tracked here. |
| `ROLLOUT.md` | Beta rollout plan — batches, self-vet checklists, tester briefs, feedback tracking. Operational only; not a backlog. |
| `SQL_LAB_PLAN.md` | SQL Lab build history — problem count decisions, difficulty rubric, datamart architecture, session log. |
| `CROSS_LAB.md` | Cross-lab ideas — patterns from MSL/GAL that PAL can borrow, and PAL ideas that belong in sibling repos. |
