// SQLBolt-style beginner tutorial mode for PAL's SQL Lab.
// Fully ISOLATED from the 182-problem lab: no problem list, no difficulty chips,
// no topic filters — just an 18-lesson sequential track on a tiny movies dataset.
//
// Validation mirrors SqlLabPage exactly: run the user's query AND the lesson's
// solution against the same db, then compare with (1) row-count check,
// (2) expectedColumns presence, (3) ordered value match, (4) sort-tolerant value
// match — all with a 0.01 numeric tolerance via sqlValuesMatch.
//
// sql.js is initialised ONCE on mount (the dataset never changes between lessons),
// and the db handle lives in a ref. Progress is a JSON array of completed lesson
// ids under localStorage key 'pal-sql-beginner-v1'.
//
// Backticks are allowed here (JSX/component file), unlike the data files.
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { BEGINNER_DATAMART, BEGINNER_LESSONS } from '../data/sqlBeginnerLessons.js';
import { SqlEditor } from '../components/shared/SqlEditor.jsx';
import { Icon } from '../components/shared/Icon.jsx';
import { track } from '../utils/analytics.js';

const PROGRESS_KEY = 'pal-sql-beginner-v1';
const TOTAL = BEGINNER_LESSONS.length;
// The 3 lessons used by the "know some already?" quick-check skip path.
const SKIP_CHECK_IDS = ['b03', 'b09', 'b15'];

// ─── localStorage helpers ─────────────────────────────────────────────────────

function getCompleted() {
  try {
    const arr = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function saveCompleted(ids) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(ids)); } catch {}
}

// ─── Validation — copied 1:1 from SqlLabPage so verdicts are identical ─────────

function sqlValuesMatch(expected, actual) {
  if (expected === null && actual === null) return true;
  if (expected === null || actual === null) return false;
  const eStr = String(expected);
  const aStr = String(actual);
  if (eStr === aStr) return true;
  const eNum = parseFloat(eStr);
  const aNum = parseFloat(aStr);
  if (!isNaN(eNum) && !isNaN(aNum)) return Math.abs(eNum - aNum) < 0.01;
  return false;
}

function sortRowsStable(rows) {
  return [...rows].sort(function (a, b) {
    const aKey = a.map(function (v) { return v === null ? '\x00' : String(v); }).join('\x01');
    const bKey = b.map(function (v) { return v === null ? '\x00' : String(v); }).join('\x01');
    return aKey < bKey ? -1 : aKey > bKey ? 1 : 0;
  });
}

function rowArraysMatch(expRows, userRows, expCols, colIdx) {
  for (let ri = 0; ri < expRows.length; ri++) {
    for (let ci = 0; ci < expCols.length; ci++) {
      const col = expCols[ci];
      const userIdx = colIdx[col];
      if (userIdx === undefined) return false;
      if (!sqlValuesMatch(expRows[ri][ci], userRows[ri][userIdx])) return false;
    }
  }
  return true;
}

// Returns null on pass, or a human-readable failure reason string.
// `expected` is { columns, rows } from running lesson.solution on the same db.
function validateResults(res, lesson, expected) {
  if (!res || res.rows.length !== lesson.expectedRowCount) {
    const got = res ? res.rows.length : 0;
    return 'Got ' + got + ' row' + (got !== 1 ? 's' : '') + ', expected ' + lesson.expectedRowCount + ' — check your filters.';
  }
  for (const col of lesson.expectedColumns) {
    if (!res.columns.includes(col)) {
      return 'Column \'' + col + '\' not found — check your column names and aliases (e.g. write AS ' + col + ').';
    }
  }
  if (expected && expected.columns && expected.rows && expected.rows.length === res.rows.length) {
    const colIdx = {};
    res.columns.forEach(function (c, i) { colIdx[c] = i; });
    // 1. Ordered comparison (respects ORDER BY)
    if (rowArraysMatch(expected.rows, res.rows, expected.columns, colIdx)) return null;
    // 2. Sort-tolerant comparison (right data, different order also passes)
    const sortedExp = sortRowsStable(expected.rows);
    const alignedUserRows = res.rows.map(function (row) {
      return expected.columns.map(function (c) {
        const idx = colIdx[c];
        return idx !== undefined ? row[idx] : null;
      });
    });
    const sortedUser = sortRowsStable(alignedUserRows);
    const expColIdx = expected.columns.reduce(function (acc, c, i) { acc[c] = i; return acc; }, {});
    if (rowArraysMatch(sortedExp, sortedUser, expected.columns, expColIdx)) return null;
    return 'The values don\'t match the expected result yet — check your calculations and ordering.';
  }
  // Should not happen (expected is always precomputed), but fail safe rather than false-pass.
  return 'Could not verify against the expected output — try running again.';
}

// ─── Small presentational pieces ──────────────────────────────────────────────

function TablePreview({ tableName }) {
  const table = BEGINNER_DATAMART.tables[tableName];
  if (!table) return null;
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.6rem' }}>
      <div style={{ padding: '0.4rem 0.75rem', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700, color: 'var(--teal)' }}>{tableName}</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{table.rows.length} rows</span>
      </div>
      <div style={{ overflowX: 'auto', maxHeight: 220, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', fontFamily: 'monospace' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr style={{ background: 'var(--surface)' }}>
              {table.columns.map(function (col) {
                return (
                  <th key={col.name} style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 600, fontSize: '0.63rem', color: 'var(--teal)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                    {col.name}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {table.rows.map(function (row, ri) {
              return (
                <tr key={ri} style={{ borderBottom: '1px solid var(--border)' }}>
                  {row.map(function (cell, ci) {
                    return (
                      <td key={ci} style={{ padding: '3px 8px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {cell === null ? <span style={{ color: 'var(--border)', fontStyle: 'italic' }}>NULL</span> : String(cell)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResultsTable({ results }) {
  if (!results || results.columns.length === 0) {
    return <div style={{ padding: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Query returned no rows.</div>;
  }
  return (
    <div style={{ overflowX: 'auto', maxHeight: 260, overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', fontFamily: 'monospace' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
          <tr style={{ background: 'var(--surface-2)' }}>
            {results.columns.map(function (col, ci) {
              return (
                <th key={ci} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, fontSize: '0.68rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                  {col}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {results.rows.map(function (row, ri) {
            return (
              <tr key={ri} style={{ borderBottom: '1px solid var(--border)' }}>
                {row.map(function (cell, ci) {
                  return (
                    <td key={ci} style={{ padding: '5px 10px', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                      {cell === null ? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>NULL</span> : String(cell)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Lesson rail (left) ───────────────────────────────────────────────────────

function LessonRail({ currentId, completedSet, onPick }) {
  const doneCount = completedSet.size;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)' }}>Tutorial</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{doneCount} / {TOTAL}</span>
        </div>
        <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: (doneCount / TOTAL * 100) + '%', background: 'var(--teal)', borderRadius: 99, transition: 'width 0.3s' }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {BEGINNER_LESSONS.map(function (lesson) {
          const isDone = completedSet.has(lesson.id);
          const isCurrent = lesson.id === currentId;
          // A lesson is reachable if it's done, current, or already unlocked (every
          // earlier lesson is complete). Locked = a future lesson behind incomplete work.
          const clickable = isDone || isCurrent;
          const icon = isDone
            ? <Icon name='check' size={11} color='currentColor' />
            : isCurrent ? '▸' : <Icon name='lock' size={11} color='currentColor' />;
          let color = 'var(--text-muted)';
          let bg = 'transparent';
          let bd = '1px solid transparent';
          if (isCurrent) { color = 'var(--teal)'; bg = 'var(--teal-bg)'; bd = '1px solid var(--teal-border)'; }
          else if (isDone) { color = 'var(--green)'; }
          return (
            <button
              key={lesson.id}
              onClick={clickable ? function () { onPick(lesson.id); } : undefined}
              disabled={!clickable}
              title={clickable ? lesson.conceptTitle : 'Complete earlier lessons to unlock'}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', textAlign: 'left',
                padding: '0.4rem 0.55rem', borderRadius: '6px', border: bd, background: bg,
                cursor: clickable ? 'pointer' : 'not-allowed', opacity: clickable ? 1 : 0.5,
                transition: 'background 0.15s',
              }}
            >
              <span style={{ width: 16, flexShrink: 0, fontSize: '0.7rem', color: color, textAlign: 'center' }}>{icon}</span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', flexShrink: 0, minWidth: 16 }}>{lesson.order}</span>
              <span style={{ fontSize: '0.76rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--teal)' : isDone ? 'var(--text)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {lesson.conceptTitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Gentle entry chooser (shown only at zero progress) ───────────────────────

function EntryChooser({ onStartFromOne, onTryQuickCheck, onSkipAll }) {
  return (
    <div style={{ maxWidth: 560, margin: '2.5rem auto 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.4rem' }}>Welcome to the SQL walkthrough</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
          18 short lessons that build from <code style={{ fontFamily: 'monospace', color: 'var(--teal)' }}>SELECT</code> up to <code style={{ fontFamily: 'monospace', color: 'var(--teal)' }}>JOIN</code> and <code style={{ fontFamily: 'monospace', color: 'var(--teal)' }}>GROUP BY</code>, one idea at a time. No prior SQL needed.
        </p>
      </div>

      <button
        onClick={onStartFromOne}
        className="pal-card-hover"
        style={{ textAlign: 'left', padding: '1rem 1.15rem', borderRadius: '10px', border: '1px solid var(--teal-border)', background: 'var(--teal-bg)', cursor: 'pointer' }}
      >
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--teal)', marginBottom: '0.2rem' }}>New to SQL? → Start from lesson 1</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Go through every lesson in order. No test, no pressure.</div>
      </button>

      <button
        onClick={onTryQuickCheck}
        className="pal-card-hover"
        style={{ textAlign: 'left', padding: '1rem 1.15rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}
      >
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem' }}>Know some already? → Try 3 quick checks to skip ahead</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Pass 2 of 3 and we&apos;ll jump you straight into the full SQL Lab.</div>
      </button>

      <button
        onClick={onSkipAll}
        style={{ alignSelf: 'center', marginTop: '0.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
      >
        I know SQL, skip the tutorial
      </button>
    </div>
  );
}

// ─── Quick-check mini quiz (skip-ahead path) ──────────────────────────────────

function QuickCheck({ db, onResult, onCancel }) {
  const quizLessons = useMemo(function () {
    return SKIP_CHECK_IDS.map(function (id) { return BEGINNER_LESSONS.find(function (l) { return l.id === id; }); }).filter(Boolean);
  }, []);
  const [idx, setIdx] = useState(0);
  const [query, setQuery] = useState(quizLessons[0] ? quizLessons[0].starterCode : '');
  const [passes, setPasses] = useState(0);
  const [feedback, setFeedback] = useState(null);  // { ok, msg }
  const lesson = quizLessons[idx];

  const schema = useMemo(function () {
    const out = {};
    Object.entries(BEGINNER_DATAMART.tables).forEach(function (entry) {
      out[entry[0]] = (entry[1].columns || []).map(function (c) { return c.name; });
    });
    return out;
  }, []);

  function check() {
    if (!db || !lesson || !query.trim()) return;
    let ok = false;
    try {
      const res = db.exec(query);
      const resultData = res.length === 0 ? { columns: [], rows: [] } : { columns: res[0].columns, rows: res[0].values };
      let expected = null;
      try {
        const solRes = db.exec(lesson.solution);
        if (solRes.length > 0) expected = { columns: solRes[0].columns, rows: solRes[0].values };
      } catch {}
      ok = validateResults(resultData, lesson, expected) === null;
    } catch { ok = false; }
    const nextPasses = passes + (ok ? 1 : 0);
    setPasses(nextPasses);
    setFeedback({ ok: ok, msg: ok ? 'Correct.' : 'Not quite — that\'s fine.' });

    const isLast = idx >= quizLessons.length - 1;
    if (isLast) {
      // Defer the result a beat so the user sees the last verdict.
      setTimeout(function () { onResult(nextPasses >= 2, nextPasses); }, 700);
    }
  }

  function next() {
    const ni = idx + 1;
    setIdx(ni);
    setQuery(quizLessons[ni] ? quizLessons[ni].starterCode : '');
    setFeedback(null);
  }

  if (!lesson) return null;
  const isLast = idx >= quizLessons.length - 1;

  return (
    <div style={{ maxWidth: 640, margin: '1.75rem auto 0', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)' }}>Quick check {idx + 1} of {quizLessons.length}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Pass {passes} so far · need 2 to skip ahead</div>
        </div>
        <button onClick={onCancel} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Start from lesson 1 instead</button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.9rem 1.1rem' }}>
        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>{lesson.conceptTitle}</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>{lesson.prompt}</p>
      </div>

      {lesson.tablesShown.map(function (t) { return <TablePreview key={t} tableName={t} />; })}

      <SqlEditor
        value={query}
        onChange={setQuery}
        onCheck={check}
        schema={schema}
        placeholder={'-- Write your SQL here\n-- Cmd/Ctrl+Enter to check'}
        height="22vh"
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
        {!feedback && (
          <button onClick={check} disabled={!query.trim()} style={{ padding: '0.45rem 1.1rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer', opacity: query.trim() ? 1 : 0.4 }}><Icon name='check' size={13} color='currentColor' /> Check</button>
        )}
        {feedback && (
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: feedback.ok ? 'var(--green)' : 'var(--text-muted)' }}>
            {feedback.ok ? <><Icon name='check' size={13} color='currentColor' /> </> : '○ '}{feedback.msg}
          </span>
        )}
        {feedback && !isLast && (
          <button onClick={next} className="pal-glow-pulse" style={{ marginLeft: 'auto', padding: '0.45rem 1.1rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer' }}>Next check →</button>
        )}
        {feedback && isLast && (
          <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Scoring…</span>
        )}
      </div>
    </div>
  );
}

// ─── Main lesson view ─────────────────────────────────────────────────────────

function LessonView({ db, lesson, isLast, onComplete, onNext, onFinish }) {
  const [query, setQuery] = useState(lesson.starterCode || '');
  const [results, setResults] = useState(null);
  const [runError, setRunError] = useState(null);
  const [verdict, setVerdict] = useState(null);   // null | { ok, msg }
  const [hintsShown, setHintsShown] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);

  // Reset all per-lesson state when the lesson changes.
  useEffect(function () {
    setQuery(lesson.starterCode || '');
    setResults(null);
    setRunError(null);
    setVerdict(null);
    setHintsShown(0);
    setFailCount(0);
    setSolutionShown(false);
  }, [lesson.id]);

  const schema = useMemo(function () {
    const out = {};
    lesson.tablesShown.forEach(function (name) {
      const t = BEGINNER_DATAMART.tables[name];
      if (t) out[name] = (t.columns || []).map(function (c) { return c.name; });
    });
    return out;
  }, [lesson.id]);

  const runOrCheck = useCallback(function (validate) {
    if (!db || !query.trim()) return;
    try {
      const res = db.exec(query);
      const resultData = res.length === 0 ? { columns: [], rows: [] } : { columns: res[0].columns, rows: res[0].values };
      setResults(resultData);
      setRunError(null);
      if (!validate) { setVerdict(null); return; }
      let expected = null;
      try {
        const solRes = db.exec(lesson.solution);
        if (solRes.length > 0) expected = { columns: solRes[0].columns, rows: solRes[0].values };
      } catch {}
      const reason = validateResults(resultData, lesson, expected);
      const ok = reason === null;
      setVerdict({ ok: ok, msg: ok ? 'Correct — nicely done.' : reason });
      track('sql_beginner_check', { lessonId: lesson.id, isCorrect: ok });
      if (ok) { onComplete(lesson.id); }
      else { setFailCount(function (n) { return n + 1; }); }
    } catch (e) {
      setRunError(e.message);
      setResults(null);
      if (validate) { setVerdict({ ok: false, msg: 'Your SQL has an error — see the message below.' }); setFailCount(function (n) { return n + 1; }); }
    }
  }, [db, query, lesson, onComplete]);

  const passed = verdict && verdict.ok;
  const hintCap = (lesson.hints || []).length;
  const showSolutionBtn = failCount >= 2 || hintsShown >= hintCap;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Concept */}
      <div className="pal-page-enter" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem 1.15rem', borderLeft: '3px solid var(--teal)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal)' }}>Lesson {lesson.order} of {TOTAL}</span>
        </div>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.4rem', color: 'var(--text)' }}>{lesson.conceptTitle}</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>{lesson.concept}</p>
      </div>

      {/* Table previews */}
      <div>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>The data</div>
        {lesson.tablesShown.map(function (t) { return <TablePreview key={t} tableName={t} />; })}
      </div>

      {/* Prompt + requirements */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1.1rem' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--yellow)', marginBottom: '0.35rem' }}>Your task</div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text)', margin: 0, lineHeight: 1.65 }}>{lesson.prompt}</p>
        {lesson.requirements && lesson.requirements.length > 0 && (
          <div style={{ marginTop: '0.6rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Your result should:</div>
            <ul style={{ margin: 0, paddingLeft: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {lesson.requirements.map(function (r, i) {
                return <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{r}</li>;
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Editor */}
      <SqlEditor
        value={query}
        onChange={setQuery}
        onCheck={function () { runOrCheck(true); }}
        schema={schema}
        placeholder={'-- Write your SQL here\n-- Cmd/Ctrl+Enter to check'}
        height="26vh"
      />

      {/* Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={function () { runOrCheck(false); }}
          disabled={!query.trim()}
          title="Run your query and see the rows — no pass/fail"
          style={{ padding: '0.45rem 0.9rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.82rem', background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer', opacity: query.trim() ? 1 : 0.4 }}
        >▶ Run</button>
        <button
          onClick={function () { runOrCheck(true); }}
          disabled={!query.trim()}
          title="Check your answer against the expected result (Cmd/Ctrl+Enter)"
          style={{ padding: '0.45rem 0.9rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem', background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer', opacity: query.trim() ? 1 : 0.4 }}
        ><Icon name='check' size={13} color='currentColor' /> Check</button>
        {verdict && verdict.ok && (
          <span className="pal-success-ring" style={{ fontSize: '0.8rem', color: 'var(--green)', fontWeight: 700 }}><Icon name='check' size={13} color='var(--green)' /> {verdict.msg}</span>
        )}
        {verdict && !verdict.ok && !runError && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{verdict.msg}</span>
        )}
      </div>

      {/* Run error */}
      {runError && (
        <div style={{ padding: '0.6rem 0.75rem', background: 'var(--red-bg)', border: '1px solid var(--red)', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--red)', fontFamily: 'monospace' }}>
          {runError}
        </div>
      )}

      {/* Results */}
      {results && !runError && (
        <div style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ padding: '4px 10px', background: 'var(--surface-2)', fontSize: '0.7rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
            {results.rows.length} row{results.rows.length !== 1 ? 's' : ''}
          </div>
          <ResultsTable results={results} />
        </div>
      )}

      {/* Hints + solution */}
      {!passed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {hintCap > 0 && hintsShown < hintCap && (
            <button
              onClick={function () { track('sql_beginner_hint', { lessonId: lesson.id, hintIndex: hintsShown + 1 }); setHintsShown(function (n) { return Math.min(n + 1, hintCap); }); }}
              style={{ alignSelf: 'flex-start', padding: '0.4rem 0.85rem', borderRadius: '6px', fontWeight: 500, fontSize: '0.78rem', background: 'var(--teal-bg)', color: 'var(--teal)', border: '1px solid var(--teal-border)', cursor: 'pointer' }}
            >Hint {hintsShown + 1} of {hintCap}</button>
          )}
          {(lesson.hints || []).slice(0, hintsShown).map(function (h, i) {
            return (
              <div key={i} style={{ padding: '0.5rem 0.75rem', background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderLeft: '3px solid var(--teal)', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                <span style={{ fontWeight: 700, color: 'var(--teal)', marginRight: '0.4rem' }}>Hint {i + 1}:</span>{h}
              </div>
            );
          })}
          {showSolutionBtn && !solutionShown && (
            <button
              onClick={function () { track('sql_beginner_solution', { lessonId: lesson.id }); setSolutionShown(true); }}
              style={{ alignSelf: 'flex-start', padding: '0.4rem 0.85rem', borderRadius: '6px', fontWeight: 500, fontSize: '0.78rem', background: 'none', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer' }}
            >Show solution</button>
          )}
          {solutionShown && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '0.4rem 0.75rem', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Solution</span>
                <button
                  onClick={function () { setQuery(lesson.solution); }}
                  style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.68rem', fontWeight: 600, color: 'var(--teal)', cursor: 'pointer' }}
                >Copy into editor</button>
              </div>
              <pre style={{ margin: 0, padding: '0.75rem', background: 'var(--surface-2)', fontSize: '0.8rem', fontFamily: 'monospace', lineHeight: 1.6, color: 'var(--text)', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{lesson.solution}</pre>
            </div>
          )}
        </div>
      )}

      {/* Next / Finish (after pass) */}
      {passed && (
        <div className="pal-reveal-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.9rem 1.1rem', background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--green)' }}>
            {isLast ? 'That\'s the whole tutorial — well done!' : 'Lesson complete.'}
          </div>
          {isLast ? (
            <button
              onClick={onFinish}
              className="pal-glow-pulse"
              style={{ alignSelf: 'flex-start', padding: '0.55rem 1.2rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer' }}
            >Enter the full SQL Lab →</button>
          ) : (
            <button
              onClick={onNext}
              className="pal-glow-pulse"
              style={{ alignSelf: 'flex-start', padding: '0.5rem 1.1rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer' }}
            >Next lesson →</button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Top-level export ─────────────────────────────────────────────────────────

export function SqlLabBeginnerPage({ onExit }) {
  const dbRef = useRef(null);
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [completed, setCompleted] = useState(getCompleted);
  const completedSet = useMemo(function () { return new Set(completed); }, [completed]);

  // Which lesson is showing. Defaults to the first not-yet-complete one (or last).
  const initialCurrent = useMemo(function () {
    const set = new Set(getCompleted());
    const firstIncomplete = BEGINNER_LESSONS.find(function (l) { return !set.has(l.id); });
    return firstIncomplete ? firstIncomplete.id : BEGINNER_LESSONS[TOTAL - 1].id;
  }, []);
  const [currentId, setCurrentId] = useState(initialCurrent);

  // Entry routing: 'choose' (only when no progress), 'quiz', or 'lessons'.
  const [view, setView] = useState(function () {
    return getCompleted().length === 0 ? 'choose' : 'lessons';
  });
  const [quizNote, setQuizNote] = useState(null);  // friendly note after a failed skip attempt

  // Init sql.js ONCE — the dataset is fixed for the whole tutorial.
  useEffect(function () {
    let cancelled = false;
    async function init() {
      try {
        const m = await import('sql.js');
        const initSqlJs = m.default || m;
        if (cancelled) return;
        const SQL = await initSqlJs({ locateFile: function () { return '/sql-wasm.wasm'; } });
        if (cancelled) return;
        const database = new SQL.Database();
        Object.entries(BEGINNER_DATAMART.tables).forEach(function (entry) {
          const tableName = entry[0];
          const table = entry[1];
          database.run(table.schema + ';');
          if (table.rows.length > 0) {
            const colCount = table.columns.length;
            const placeholders = '(' + Array(colCount).fill('?').join(',') + ')';
            const stmt = database.prepare('INSERT INTO ' + tableName + ' VALUES ' + placeholders);
            table.rows.forEach(function (row) { stmt.run(row); });
            stmt.free();
          }
        });
        if (cancelled) return;
        dbRef.current = database;
        setDb(database);
        setLoading(false);
        track('sql_beginner_open', {});
      } catch (e) {
        if (!cancelled) { setError('Failed to load the SQL engine: ' + e.message); setLoading(false); }
      }
    }
    init();
    return function () {
      cancelled = true;
      if (dbRef.current) { try { dbRef.current.close(); } catch {} dbRef.current = null; }
    };
  }, []);

  // Lock body scroll while open (matches SqlLabPage behaviour).
  useEffect(function () {
    document.body.style.overflow = 'hidden';
    return function () { document.body.style.overflow = ''; };
  }, []);

  const markComplete = useCallback(function (id) {
    setCompleted(function (prev) {
      if (prev.includes(id)) return prev;
      const next = prev.concat([id]);
      saveCompleted(next);
      return next;
    });
  }, []);

  const goNext = useCallback(function () {
    const i = BEGINNER_LESSONS.findIndex(function (l) { return l.id === currentId; });
    if (i >= 0 && i < TOTAL - 1) {
      setCurrentId(BEGINNER_LESSONS[i + 1].id);
      // scroll content back to top on lesson change
      const panel = document.querySelector('.sql-lab-beginner-panel');
      if (panel) panel.scrollTop = 0;
    }
  }, [currentId]);

  function handleQuizResult(skip, passCount) {
    if (skip) {
      // Pass >= 2 of 3 → mark every lesson complete and drop into the full lab.
      const allIds = BEGINNER_LESSONS.map(function (l) { return l.id; });
      saveCompleted(allIds);
      setCompleted(allIds);
      track('sql_beginner_skip', { result: 'pass', passCount: passCount });
      onExit();
    } else {
      track('sql_beginner_skip', { result: 'fail', passCount: passCount });
      setQuizNote('No worries — we\'ll start you from lesson 1. You passed ' + passCount + ' of 3.');
      setCurrentId(BEGINNER_LESSONS[0].id);
      setView('lessons');
    }
  }

  const currentLesson = BEGINNER_LESSONS.find(function (l) { return l.id === currentId; }) || BEGINNER_LESSONS[0];
  const isLast = currentLesson.id === BEGINNER_LESSONS[TOTAL - 1].id;
  const allDone = completed.length >= TOTAL;

  return (
    <div className="sql-lab-beginner-panel">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button
          onClick={onExit}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}
        >← Back to SQL Lab</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 28, height: 28, background: 'var(--teal)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>{'<>'}</div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--teal)', letterSpacing: '-0.02em' }}>SQL Tutorial</span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Beginner walkthrough · {BEGINNER_DATAMART.name}</span>
      </div>

      {/* Loading / error */}
      {loading && (
        <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Loading the SQL engine…
        </div>
      )}
      {error && (
        <div style={{ padding: '1rem', background: 'var(--red-bg)', border: '1px solid var(--red)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--red)' }}>{error}</div>
      )}

      {!loading && !error && view === 'choose' && (
        <EntryChooser
          onStartFromOne={function () { setCurrentId(BEGINNER_LESSONS[0].id); setView('lessons'); }}
          onTryQuickCheck={function () { setView('quiz'); }}
          onSkipAll={onExit}
        />
      )}

      {!loading && !error && view === 'quiz' && (
        <QuickCheck
          db={db}
          onResult={handleQuizResult}
          onCancel={function () { setCurrentId(BEGINNER_LESSONS[0].id); setView('lessons'); }}
        />
      )}

      {!loading && !error && view === 'lessons' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 260px) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }} className="sql-beginner-grid">
          {/* Rail */}
          <div style={{ position: 'sticky', top: 0 }}>
            <LessonRail currentId={currentId} completedSet={completedSet} onPick={setCurrentId} />
            <button
              onClick={onExit}
              style={{ marginTop: '1rem', width: '100%', background: 'none', border: '1px dashed var(--border)', borderRadius: '6px', padding: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer' }}
            >I know SQL, skip the tutorial</button>
          </div>

          {/* Main */}
          <div>
            {quizNote && (
              <div style={{ marginBottom: '0.85rem', padding: '0.6rem 0.85rem', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.5 }}>
                {quizNote}
              </div>
            )}
            {allDone && (
              <div style={{ marginBottom: '0.85rem', padding: '0.75rem 1rem', background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Icon name='party' size={15} color='var(--green)' /> You finished all {TOTAL} lessons.</span>
                <button onClick={onExit} className="pal-glow-pulse" style={{ padding: '0.45rem 1rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer' }}>Enter the full SQL Lab →</button>
              </div>
            )}
            <LessonView
              key={currentLesson.id}
              db={db}
              lesson={currentLesson}
              isLast={isLast}
              onComplete={markComplete}
              onNext={goNext}
              onFinish={onExit}
            />
          </div>
        </div>
      )}
    </div>
  );
}
