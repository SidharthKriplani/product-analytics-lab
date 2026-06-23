# SPEC — Swap the SQL Lab editor from `<textarea>` to CodeMirror 6

_Created 2026-06-24. Propose-only — no code changed. Decision doc for replacing the plain textarea editor in `src/pages/SqlLabPage.jsx` with CodeMirror 6, to get syntax highlighting, an indentation keeper, and schema-aware autocomplete (names only)._

## Why

The editor is a plain `<textarea>`. Every behavior is hand-rolled onto it: Cmd+Enter (check), Tab=2-spaces, Cmd+/ (comment). Each new feature is another patch, and the two the user wants next — **auto-indent continuation** and **schema autocomplete** — are awkward to do well on a textarea but are *built in* to CodeMirror. The textarea has hit its ceiling; CM is the standard, small, and tree-shakeable.

## Scope (what we build / explicitly don't)

**In scope**
- SQL **syntax highlighting** (keywords, strings, numbers, comments).
- **Indentation keeper** — pressing Enter continues the previous line's indentation (CM's `insertNewlineAndIndent`, on by default). This is the "indentation keeper," not a Tab handler.
- **Schema autocomplete, names only** — table names + the columns of the *current problem's* datamart, plus SQL keywords. Cuts typo friction; does NOT complete whole clauses or write the query.
- Keep existing behaviors: Cmd/Ctrl+Enter = Check, Cmd/Ctrl+/ = comment toggle (CM has these as standard keymaps), Tab indent + Shift+Tab de-indent (CM `indentWithTab`).
- Stay a controlled value bound to `query` / `setQuery` + `saveQueryLS`.

**Out of scope (deliberate)**
- No full-query / AI completion, no snippet expansion, no "write the JOIN for me." (Interview-prep philosophy: cut typos, don't do the thinking — same as the content rebuild.)
- No linting / error squiggles beyond syntax coloring.
- No change to execution — sql.js still runs the query; CM is only the editor surface.
- Autocomplete is **schema-scoped to the active problem**, not the whole bank.

## Packages + bundle cost

```
@codemirror/state @codemirror/view @codemirror/commands
@codemirror/lang-sql @codemirror/autocomplete @codemirror/language
@uiw/react-codemirror   (thin React wrapper — optional but simplest)
```

Bundle: ~110–150 KB min+gz for the CM core + SQL language, lazy-loaded with the SQL Lab route (already `React.lazy`), so it doesn't touch the rest of the app's initial load. Net add to the SQL Lab chunk only.

## The schema-autocomplete wiring (the valuable part)

`@codemirror/lang-sql` takes a `schema` map of `tableName → string[] of columns`. We already have exactly that per problem:

```js
// datamarts[problem.datamartId].tables[name].columns[].name
import { datamarts } from '../data/sqlLabDatamarts.js';

function schemaFor(datamartId) {
  const tables = datamarts[datamartId].tables;
  const schema = {};
  for (const [name, t] of Object.entries(tables)) {
    schema[name] = (t.columns || []).map(c => c.name);
  }
  return schema; // e.g. { orders: ['order_id','user_id','created_at',...], users: [...] }
}

// editor extension, rebuilt when the problem changes:
sql({ dialect: SQLite, schema: schemaFor(problem.datamartId), upperCaseKeywords: false })
```

Result: typing `o` after `FROM` suggests `orders`; typing `orders.` suggests its columns; keywords autocomplete too. Scoped to the current problem's tables only — no cross-problem leakage, and it reinforces "read the schema."

## How it maps onto the current component

`SqlLabPage.jsx` today:
- `<textarea value={query} onChange=… onKeyDown={handleKeyDown} />`

Becomes:
- `<CodeMirror value={query} onChange={v => { startTimer(); setQuery(v); saveQueryLS(problem.id, v); }} extensions={[sql({...}), keymap.of([...]), EditorView.lineWrapping]} />`
- `handleKeyDown` retires: Cmd+Enter → a CM keymap binding to `checkQuery`; Tab/Shift+Tab → `indentWithTab`; Cmd+/ → CM's `toggleComment`; indent-keeper → default. (The hand-rolled Tab + Cmd+/ I added get deleted — CM supersedes them.)
- Height stays the V5.45 `46vh` (set on the CM wrapper). `resize` is replaced by CM's own scroll.

State model note: CM manages its own internal doc; keep React `query` as the source of truth via the controlled `value`/`onChange` of `@uiw/react-codemirror` so localStorage persistence and the "restore saved query" path keep working unchanged.

## Migration plan + rollback

1. Add deps; build a small `<SqlEditor>` wrapper component (props: `value`, `onChange`, `schema`, `onCheck`).
2. Swap the textarea for `<SqlEditor>` in the solve view only; leave everything else (Run/Check, results, timer) untouched.
3. **Feature-flag** it (`const USE_CM = true`) so the textarea can be restored in one line if anything regresses.
4. Verify: build (transform clean), type into editor, autocomplete shows the right tables, Cmd+Enter checks, Cmd+/ comments, Enter keeps indent, saved query restores.
5. Remove the textarea + `handleKeyDown` Tab/Cmd+/ branches once CM is confirmed.

Rollback = flip the flag. No data, no gate, no schema changes — purely the editor surface.

## Effort + risk

- **Effort:** ~half a focused session. One new wrapper component, ~30 lines of wiring, delete ~40 lines of textarea handlers.
- **Risk:** low–moderate. Main watch-items: (a) controlled-value sync with `@uiw/react-codemirror` (well-trodden), (b) bundle size on the SQL Lab chunk (acceptable, lazy-loaded), (c) mobile behavior (CM is fine on touch, but test the focus/scroll).
- **No gate impact** — editor only; solutions, datamarts, content gates untouched.

## Open decisions for you

1. **Autocomplete trigger** — on every keystroke (live) vs. only on Ctrl+Space (explicit)? Live is friendlier; explicit is closer to a real interview editor. (Leaning: live but **names only**, per the "cut typos, don't think for them" rule.)
2. **`@uiw/react-codemirror` wrapper vs. raw CM6** — wrapper is faster to wire and handles the controlled-value plumbing; raw is ~30 KB lighter but more code. (Leaning: wrapper.)
3. **Keep the toggle permanently** or remove the textarea after a week of dogfooding? (Leaning: remove once confirmed — one editor to maintain.)

_If approved, this supersedes the hand-rolled Tab (V5.x) and Cmd+/ (V5.52) handlers — CM provides both natively._
