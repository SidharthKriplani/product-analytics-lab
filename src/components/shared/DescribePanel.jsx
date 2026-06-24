// DescribePanel — "Describe mode" for judgment runners.
//
// In Options mode, rooms present multiple-choice scaffolding ("options feel
// like cheat codes"). Describe mode mirrors a real interview: the user types
// their own answer first, then reveals the model answer and self-assesses
// against a checklist of key points. No auto-grading of correctness — the user
// self-assesses, exactly like the Simulator's self-grade. A lightweight
// keyword-coverage hint nudges (never scores) by detecting which key points'
// keywords appear in the typed text.
//
// Props:
//   keyPoints   [{ id, text, keywords? }]  — the key points to cover. `keywords`
//                                            is an optional string[] used for the
//                                            coverage nudge; if omitted, salient
//                                            words are derived from `text`.
//   modelAnswer  string | JSX node          — the case's existing reveal/debrief
//                                            content, rendered after reveal.
//   fields      [{ id, label, placeholder }] — optional. If provided, render one
//                                            labeled textarea per field (e.g.
//                                            Primary / Diagnostic / Guardrail);
//                                            else a single "Your answer" textarea.
//   onRevealed  () => void                   — optional callback fired on reveal.

import { useMemo, useState } from 'react';
import { Icon } from './Icon.jsx';

// ─── Keyword helpers ──────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'by', 'as',
  'that', 'this', 'these', 'those', 'it', 'its', 'you', 'your', 'they', 'them',
  'their', 'we', 'our', 'i', 'he', 'she', 'his', 'her', 'not', 'no', 'so', 'than',
  'too', 'very', 'can', 'will', 'would', 'should', 'could', 'may', 'might', 'must',
  'do', 'does', 'did', 'done', 'have', 'has', 'had', 'from', 'into', 'about',
  'which', 'who', 'whom', 'what', 'when', 'where', 'why', 'how', 'all', 'any',
  'each', 'more', 'most', 'some', 'such', 'only', 'own', 'same', 'up', 'out',
  'over', 'down', 'off', 'again', 'once', 'here', 'there', 'both', 'just', 'also',
]);

// Derive salient keywords from a sentence when none are supplied: keep words
// longer than 3 chars that are not stopwords, de-duplicated, capped.
function deriveKeywords(text) {
  if (!text) return [];
  const words = String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOPWORDS.has(w));
  const seen = new Set();
  const out = [];
  for (const w of words) {
    if (!seen.has(w)) { seen.add(w); out.push(w); }
    if (out.length >= 6) break;
  }
  return out;
}

// A key point counts as "keyword-detected" if at least one of its keywords
// appears (case-insensitive substring) in the combined typed text.
function isPointDetected(point, haystackLower) {
  if (!haystackLower) return false;
  const kws = (point.keywords && point.keywords.length)
    ? point.keywords
    : deriveKeywords(point.text);
  return kws.some(kw => kw && haystackLower.includes(String(kw).toLowerCase()));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DescribePanel({ keyPoints = [], modelAnswer, fields, onRevealed }) {
  const hasFields = Array.isArray(fields) && fields.length > 0;

  // Field answers (when fields provided) — one entry per field id.
  const [fieldAnswers, setFieldAnswers] = useState(() =>
    hasFields ? Object.fromEntries(fields.map(f => [f.id, ''])) : {}
  );
  // Single answer (when no fields).
  const [answer, setAnswer] = useState('');

  const [revealed, setRevealed] = useState(false);
  const [coverageShown, setCoverageShown] = useState(false);
  // Self-assessment ticks: keyPoint id → boolean
  const [checked, setChecked] = useState({});

  // Combined typed text across all inputs, lowercased once for matching.
  const typedText = hasFields
    ? Object.values(fieldAnswers).join(' \n ')
    : answer;
  const haystackLower = typedText.toLowerCase();
  const hasText = typedText.trim().length > 0;

  // Which key points have a keyword match in the typed text.
  const detected = useMemo(() => {
    const map = {};
    for (const p of keyPoints) map[p.id] = isPointDetected(p, haystackLower);
    return map;
  }, [keyPoints, haystackLower]);

  const detectedCount = keyPoints.reduce((n, p) => n + (detected[p.id] ? 1 : 0), 0);
  const coveredCount = keyPoints.reduce((n, p) => n + (checked[p.id] ? 1 : 0), 0);

  function handleFieldChange(id, value) {
    setFieldAnswers(prev => ({ ...prev, [id]: value }));
  }

  function handleReveal() {
    setRevealed(true);
    if (onRevealed) onRevealed();
  }

  function toggleChecked(id) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const textareaStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', background: 'var(--bg)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
    color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.6,
    resize: 'vertical', fontFamily: 'inherit', outline: 'none',
  };

  return (
    <div className="pal-reveal-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Intro nudge */}
      <div style={{
        background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius)', padding: '0.7rem 0.9rem',
        fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55,
        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
      }}>
        <span style={{ flexShrink: 0, marginTop: '0.1rem' }}>
          <Icon name="pen-line" size={14} color="var(--text-muted)" />
        </span>
        <span>
          Write your own answer first — like the real interview. Reveal the model
          answer only after you have committed your thinking, then self-assess.
        </span>
      </div>

      {/* Answer inputs */}
      {!revealed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {hasFields ? (
            fields.map(field => (
              <div key={field.id}>
                <label
                  htmlFor={`describe-${field.id}`}
                  style={{
                    display: 'block', fontSize: '0.72rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.07em',
                    color: 'var(--text-muted)', marginBottom: '0.35rem',
                  }}
                >
                  {field.label}
                </label>
                <textarea
                  id={`describe-${field.id}`}
                  value={fieldAnswers[field.id] || ''}
                  onChange={e => handleFieldChange(field.id, e.target.value)}
                  placeholder={field.placeholder || 'Your answer...'}
                  style={{ ...textareaStyle, minHeight: 64 }}
                />
              </div>
            ))
          ) : (
            <div>
              <label
                htmlFor="describe-answer"
                style={{
                  display: 'block', fontSize: '0.72rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.07em',
                  color: 'var(--text-muted)', marginBottom: '0.35rem',
                }}
              >
                Your answer
              </label>
              <textarea
                id="describe-answer"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Talk through your reasoning the way you would out loud in the interview..."
                style={{ ...textareaStyle, minHeight: 160 }}
              />
            </div>
          )}
        </div>
      )}

      {/* Coverage nudge (pre-reveal) */}
      {!revealed && coverageShown && keyPoints.length > 0 && (
        <div style={{
          background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
          borderRadius: 'var(--radius)', padding: '0.7rem 0.9rem',
        }}>
          <div style={{
            fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.07em', color: 'var(--teal)', marginBottom: '0.4rem',
          }}>
            Coverage hint — {detectedCount}/{keyPoints.length} key points touched
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
            A gentle nudge based on keyword matches — not a grade. The model answer
            is hidden until you reveal it.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {keyPoints.map(p => (
              <span
                key={p.id}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  fontSize: '0.72rem', fontWeight: 600,
                  padding: '0.15rem 0.55rem', borderRadius: '999px',
                  background: detected[p.id] ? 'var(--teal-bg)' : 'var(--surface)',
                  border: `1px solid ${detected[p.id] ? 'var(--teal-border)' : 'var(--border)'}`,
                  color: detected[p.id] ? 'var(--teal)' : 'var(--text-muted)',
                }}
              >
                {detected[p.id]
                  ? <Icon name="check" size={11} color="var(--teal)" />
                  : <span style={{ width: 11, textAlign: 'center', opacity: 0.5 }}>·</span>}
                {p.shortLabel || `Point ${keyPoints.indexOf(p) + 1}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pre-reveal controls */}
      {!revealed && (
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleReveal}
            disabled={!hasText}
            style={{
              background: hasText ? 'var(--teal)' : 'var(--surface-2)',
              border: `1.5px solid ${hasText ? 'var(--teal-border)' : 'var(--border)'}`,
              color: hasText ? '#fff' : 'var(--text-dim)',
              borderRadius: 'var(--radius)', padding: '0.6rem 1.25rem',
              fontSize: '0.86rem', fontWeight: 700,
              cursor: hasText ? 'pointer' : 'not-allowed',
              transition: 'all 0.12s',
            }}
          >
            Reveal model answer
          </button>
          {keyPoints.length > 0 && (
            <button
              onClick={() => setCoverageShown(s => !s)}
              disabled={!hasText}
              style={{
                background: 'transparent',
                border: `1px solid ${coverageShown ? 'var(--teal-border)' : 'var(--border)'}`,
                color: hasText ? (coverageShown ? 'var(--teal)' : 'var(--text-muted)') : 'var(--text-dim)',
                borderRadius: 'var(--radius)', padding: '0.6rem 1rem',
                fontSize: '0.82rem', fontWeight: 600,
                cursor: hasText ? 'pointer' : 'not-allowed',
                transition: 'all 0.12s',
              }}
            >
              {coverageShown ? 'Hide coverage' : 'Check coverage'}
            </button>
          )}
          {!hasText && (
            <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
              Type your answer to unlock
            </span>
          )}
        </div>
      )}

      {/* Reveal: model answer + self-assessment checklist */}
      {revealed && (
        <div className="pal-reveal-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Your answer (read-back) */}
          <div style={{
            background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem',
          }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: '0.5rem',
            }}>
              What you wrote
            </div>
            {hasFields ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {fields.map(f => (
                  <div key={f.id}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                      {f.label}
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {(fieldAnswers[f.id] || '').trim() || <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>(left blank)</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.86rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {answer.trim() || <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>(left blank)</span>}
              </div>
            )}
          </div>

          {/* Model answer */}
          <div style={{
            background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
            borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem',
          }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.09em', color: 'var(--teal)', marginBottom: '0.6rem',
            }}>
              Model answer
            </div>
            {typeof modelAnswer === 'string' ? (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {modelAnswer}
              </p>
            ) : (
              modelAnswer
            )}
          </div>

          {/* Self-assessment checklist */}
          {keyPoints.length > 0 && (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '1.1rem 1.25rem',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem',
              }}>
                <div style={{
                  fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.09em', color: 'var(--text-dim)',
                }}>
                  Self-assess — did you cover this?
                </div>
                <div style={{
                  fontSize: '0.74rem', fontWeight: 700, color: 'var(--teal)',
                  background: 'var(--teal-bg)', border: '1px solid var(--teal-border)',
                  borderRadius: '999px', padding: '0.1rem 0.6rem',
                }}>
                  {coveredCount}/{keyPoints.length} covered
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {keyPoints.map(p => {
                  const isChecked = !!checked[p.id];
                  const wasDetected = detected[p.id];
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleChecked(p.id)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                        textAlign: 'left', width: '100%',
                        background: isChecked ? 'var(--teal-bg)' : 'var(--surface-2)',
                        border: `1px solid ${isChecked ? 'var(--teal-border)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                      }}
                    >
                      <span style={{
                        flexShrink: 0, marginTop: '0.05rem',
                        width: 18, height: 18, borderRadius: '5px',
                        border: `1.5px solid ${isChecked ? 'var(--teal)' : 'var(--border)'}`,
                        background: isChecked ? 'var(--teal)' : 'transparent',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isChecked && <Icon name="check" size={12} color="#fff" />}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{
                          fontSize: '0.86rem', color: 'var(--text)', lineHeight: 1.55,
                          display: 'block',
                        }}>
                          {p.text}
                        </span>
                        {wasDetected && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                            fontSize: '0.7rem', fontWeight: 600, color: 'var(--teal)',
                            marginTop: '0.3rem',
                          }}>
                            <Icon name="check" size={10} color="var(--teal)" />
                            keyword detected in your answer
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', margin: '0.75rem 0 0', lineHeight: 1.5 }}>
                This is an honest self-grade — no auto-scoring. Tick the points you
                genuinely made. Keyword detection is only a hint.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DescribePanel;
