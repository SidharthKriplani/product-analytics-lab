// CodeMirror 6 SQL editor for SQL Lab — syntax highlighting, indentation keeper,
// and schema-aware autocomplete (table/column names of the active problem only).
// Names-only by design: cuts typo friction without writing the query for the user.
import { useMemo, useRef } from 'react';
import CodeMirror, { Prec } from '@uiw/react-codemirror';
import { sql, SQLite } from '@codemirror/lang-sql';
import { keymap } from '@codemirror/view';
import { indentWithTab, toggleComment } from '@codemirror/commands';

// Hoisted so its identity is stable across renders (avoids per-keystroke reconfigure).
const BASIC_SETUP = {
  lineNumbers: true,
  foldGutter: false,
  highlightActiveLine: true,
  autocompletion: true,   // automatic, fires on typing
  bracketMatching: true,
  closeBrackets: true,
  searchKeymap: false,    // let Ctrl/Cmd+F reach the browser's find, not CodeMirror's
};
const WRAP_STYLE = { fontSize: '0.82rem', border: '1px solid rgba(20,184,166,0.3)', borderRadius: '6px', overflow: 'hidden' };

export function SqlEditor({ value, onChange, schema, onCheck, placeholder, height = '46vh' }) {
  // Keep the latest onCheck in a ref so it isn't a dependency of `extensions`.
  // (onCheck is a fresh function each parent render; making it a dep would rebuild
  // the whole editor config on every keystroke → typing lag / dropped keys.)
  const onCheckRef = useRef(onCheck);
  onCheckRef.current = onCheck;

  // Rebuild extensions ONLY when the schema (i.e. the problem) changes — never per keystroke.
  // The parent must pass a STABLE `schema` reference (memoized per problem) for this to hold.
  const extensions = useMemo(() => [
    sql({ dialect: SQLite, schema: schema || {}, upperCaseKeywords: false }),
    Prec.highest(keymap.of([
      { key: 'Mod-Enter', preventDefault: true, run: () => { if (onCheckRef.current) onCheckRef.current(); return true; } },
      { key: 'Mod-/', run: toggleComment },
      indentWithTab,
    ])),
  ], [schema]);

  return (
    <CodeMirror
      value={value}
      height={height}
      placeholder={placeholder}
      onChange={onChange}
      extensions={extensions}
      theme="dark"
      basicSetup={BASIC_SETUP}
      style={WRAP_STYLE}
    />
  );
}
