// CodeMirror 6 SQL editor for SQL Lab — syntax highlighting, indentation keeper,
// and schema-aware autocomplete (table/column names of the active problem only).
// Names-only by design: cuts typo friction without writing the query for the user.
import { useMemo } from 'react';
import CodeMirror, { Prec } from '@uiw/react-codemirror';
import { sql, SQLite } from '@codemirror/lang-sql';
import { keymap } from '@codemirror/view';
import { indentWithTab, toggleComment } from '@codemirror/commands';

export function SqlEditor({ value, onChange, schema, onCheck, placeholder, height = '46vh' }) {
  const extensions = useMemo(() => [
    sql({ dialect: SQLite, schema: schema || {}, upperCaseKeywords: false }),
    // Prec.highest so our bindings beat CodeMirror's default keymap
    // (the default binds Mod-Enter to "insert blank line", which was swallowing Check).
    Prec.highest(keymap.of([
      // Cmd/Ctrl+Enter = Check (matches the textarea behavior it replaces)
      { key: 'Mod-Enter', preventDefault: true, run: () => { if (onCheck) onCheck(); return true; } },
      // Cmd/Ctrl+/ = toggle SQL line comment (native, uses the -- comment from lang-sql)
      { key: 'Mod-/', run: toggleComment },
      // Tab / Shift-Tab = indent / de-indent (block-aware); Enter keeps indentation by default
      indentWithTab,
    ])),
  ], [schema, onCheck]);

  return (
    <CodeMirror
      value={value}
      height={height}
      placeholder={placeholder}
      onChange={onChange}
      extensions={extensions}
      theme="dark"
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: true,
        autocompletion: true,   // automatic, fires on typing
        bracketMatching: true,
        closeBrackets: true,
      }}
      style={{ fontSize: '0.82rem', border: '1px solid rgba(20,184,166,0.3)', borderRadius: '6px', overflow: 'hidden' }}
    />
  );
}
