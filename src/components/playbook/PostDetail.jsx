// PostDetail — renders a full Playbook article inline
// Sections: text | heading | callout | list | framework_box | example | table
// Extras: reading progress bar, references section, estimated read time

import { useState, useEffect, useRef, useMemo } from 'react';
import { trainerMCQ } from '../../data/trainerMCQ.js';

const ROOM_CONFIG = {
  stats:                { label: 'Stats Room',             color: 'var(--accent)'    },
  metrics:              { label: 'Metrics Room',            color: 'var(--green)'     },
  design:               { label: 'Design Room',             color: 'var(--teal)'      },
  review:               { label: 'Review Room',             color: 'var(--accent)'    },
  rca:                  { label: 'RCA Room',                color: 'var(--yellow)'    },
  cases:                { label: 'Cases Room',              color: 'var(--purple)'    },
  'product-design':     { label: 'Product Design Room',     color: 'var(--purple)'    },
  'prioritization':     { label: 'Prioritization Room',     color: 'var(--teal)'      },
  'growth-analytics':   { label: 'Growth Analytics Room',   color: 'var(--green)'     },
};

const CATEGORY_CONFIG = {
  'Metrics':             { color: 'var(--green)',      bg: 'var(--green-bg)',    border: 'var(--green-border)'   },
  'RCA':                 { color: 'var(--yellow)',     bg: 'var(--yellow-bg)',   border: 'var(--yellow-border)'  },
  'Experimentation':     { color: 'var(--accent)',     bg: 'var(--accent-bg)',   border: 'var(--accent-border)'  },
  'Statistics':          { color: 'var(--teal)',       bg: 'var(--teal-bg)',     border: 'var(--teal-border)'    },
  'Ambiguous Problems':  { color: 'var(--purple)',     bg: 'var(--purple-bg)',   border: 'var(--purple-border)'  },
  'GenAI Analytics':     { color: 'var(--teal)',       bg: 'var(--teal-bg)',     border: 'var(--teal-border)'    },
  'Product Sense':       { color: 'var(--blue-text)',  bg: 'var(--blue-bg)',     border: 'var(--blue-border)'    },
  'SQL & Data':          { color: 'var(--accent)',     bg: 'var(--accent-bg)',   border: 'var(--accent-border)'  },
  'Company Questions':   { color: 'var(--red)',        bg: 'var(--red-bg)',      border: 'var(--red-border)'     },
  'Mental Models':       { color: 'var(--purple)',     bg: 'var(--purple-bg)',   border: 'var(--purple-border)'  },
  'Career & Interview':  { color: 'var(--text-muted)', bg: 'var(--surface-2)',  border: 'var(--border)'         },
  'The Big Picture':     { color: 'var(--text-muted)', bg: 'var(--surface-2)',  border: 'var(--border)'         },
  // PM categories (V3.0)
  'Product Design':      { color: 'var(--purple)',     bg: 'var(--purple-bg)',   border: 'var(--purple-border)'  },
  'Prioritization':      { color: 'var(--teal)',       bg: 'var(--teal-bg)',     border: 'var(--teal-border)'    },
  'PM Strategy':         { color: 'var(--blue-text)',  bg: 'var(--blue-bg)',     border: 'var(--blue-border)'    },
  'PM Career':           { color: 'var(--text-muted)', bg: 'var(--surface-2)',  border: 'var(--border)'         },
};

// ─── Content section renderers ──────────────────────────────────────────────

function Section({ section }) {
  switch (section.type) {
    case 'text':
      return (
        <p style={{
          fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.8,
          margin: '0 0 1.2rem', whiteSpace: 'pre-line',
        }}>
          {section.text}
        </p>
      );

    case 'heading':
      return (
        <h3 style={{
          fontSize: '1.08rem', fontWeight: 800, color: 'var(--text)',
          margin: '2rem 0 0.6rem', letterSpacing: '-0.015em',
        }}>
          {section.text}
        </h3>
      );

    case 'callout':
      return (
        <div style={{
          background: 'var(--accent-bg)', border: '1.5px solid var(--accent-border)',
          borderLeft: '3px solid var(--accent)', borderRadius: 'var(--radius)',
          padding: '0.9rem 1.1rem', margin: '1.3rem 0',
        }}>
          {section.label && (
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.09em', color: 'var(--accent)', marginBottom: '0.4rem',
            }}>
              {section.label}
            </div>
          )}
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            {section.text}
          </p>
        </div>
      );

    case 'list':
      return (
        <ul style={{ margin: '0.4rem 0 1.2rem', paddingLeft: '1.4rem' }}>
          {section.items.map((item, i) => (
            <li key={i} style={{
              fontSize: '0.88rem', color: 'var(--text-secondary)',
              lineHeight: 1.7, marginBottom: '0.45rem',
            }}>
              {item}
            </li>
          ))}
        </ul>
      );

    case 'framework_box':
      return (
        <div style={{
          background: 'var(--surface-2)', border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '1.1rem 1.2rem', margin: '1.3rem 0',
        }}>
          {section.label && (
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.09em', color: 'var(--text-dim)', marginBottom: '0.7rem',
            }}>
              {section.label}
            </div>
          )}
          <ol style={{ margin: 0, paddingLeft: '1.3rem' }}>
            {section.items.map((item, i) => (
              <li key={i} style={{
                fontSize: '0.88rem', color: 'var(--text)', fontWeight: 500,
                lineHeight: 1.65, marginBottom: '0.5rem',
              }}>
                {item}
              </li>
            ))}
          </ol>
        </div>
      );

    case 'example':
      return (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '0.95rem 1.1rem', margin: '1.3rem 0',
        }}>
          {section.label && (
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.09em', color: 'var(--text-muted)', marginBottom: '0.55rem',
            }}>
              {section.label}
            </div>
          )}
          <p style={{
            fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.7,
            margin: 0, whiteSpace: 'pre-line', fontFamily: 'monospace',
          }}>
            {section.text}
          </p>
        </div>
      );

    case 'cta': {
      const rc = ROOM_CONFIG[section.room];
      return (
        <div style={{
          background: 'var(--surface-2)', border: `1.5px solid ${rc?.color || 'var(--accent)'}`,
          borderRadius: 'var(--radius)', padding: '1rem 1.2rem', margin: '2rem 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem',
        }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Ready to apply this framework?
          </span>
          <span style={{
            fontSize: '0.83rem', fontWeight: 700, color: rc?.color || 'var(--accent)',
          }}>
            {section.label || `Practice in ${rc?.label || 'the room'} →`}
          </span>
        </div>
      );
    }

    default:
      return null;
  }
}

// ─── Key Takeaways strip ─────────────────────────────────────────────────────

function KeyTakeaways({ items, catColor }) {
  if (!items?.length) return null;
  return (
    <div style={{
      background: 'var(--surface-2)', border: `1.5px solid ${catColor || 'var(--border)'}`,
      borderRadius: 'var(--radius)', padding: '1.1rem 1.2rem', margin: '2rem 0',
    }}>
      <div style={{
        fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.09em', color: catColor || 'var(--text-dim)', marginBottom: '0.75rem',
      }}>
        ✦ Key Takeaways
      </div>
      <ul style={{ margin: 0, paddingLeft: '1.3rem' }}>
        {items.map((item, i) => (
          <li key={i} style={{
            fontSize: '0.88rem', color: 'var(--text)', fontWeight: 500,
            lineHeight: 1.65, marginBottom: '0.4rem',
          }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── References section ──────────────────────────────────────────────────────

function References({ refs }) {
  if (!refs?.length) return null;
  return (
    <div style={{
      marginTop: '2.5rem', paddingTop: '1.5rem',
      borderTop: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.09em', color: 'var(--text-dim)', marginBottom: '0.75rem',
      }}>
        Further Reading & Sources
      </div>
      <ol style={{ paddingLeft: '1.2rem', margin: 0 }}>
        {refs.map((ref, i) => (
          <li key={i} style={{
            fontSize: '0.82rem', color: 'var(--text-secondary)',
            marginBottom: '0.45rem', lineHeight: 1.55,
          }}>
            {ref.url ? (
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
                onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
              >
                {ref.label}
              </a>
            ) : (
              <span style={{ fontWeight: 500 }}>{ref.label}</span>
            )}
            {ref.note && (
              <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}> — {ref.note}</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ─── Reading progress bar ────────────────────────────────────────────────────

function ReadingProgress({ color }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      setProgress(docHeight > 0 ? Math.min(100, (scrolled / docHeight) * 100) : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '3px',
      background: 'var(--border)', zIndex: 200, pointerEvents: 'none',
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: color || 'var(--accent)',
        transition: 'width 0.08s linear',
      }} />
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

// Article category → MCQ trainer category
const ARTICLE_TO_MCQ_CAT = {
  'Metrics':          'Metrics & Growth',
  'Growth Analytics': 'Metrics & Growth',
  'BI & Reporting':   'Metrics & Growth',
  'Experimentation':  'Experimentation',
  'A/B Testing':      'Experimentation',
  'Statistics':       'Statistics',
  'RCA':              'Statistics',
  'SQL & Python':     'Experimentation',
  'Product Sense':    'Product & Prioritization',
  'Prioritization':   'Product & Prioritization',
  'PM Strategy':      'Product & Prioritization',
  'Career':           'Product & Prioritization',
};

function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function QuizMe({ post }) {
  const [active, setActive] = useState(false);
  const [answers, setAnswers] = useState({});

  const trainerCat = ARTICLE_TO_MCQ_CAT[post.category];
  const questions = useMemo(() => {
    if (!trainerCat) return [];
    const pool = trainerMCQ.filter(q => q.category === trainerCat);
    if (pool.length === 0) return [];
    const rand = seededRand(post.id ? post.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : 42);
    const shuffled = [...pool].sort(() => rand() - 0.5);
    return shuffled.slice(0, 3);
  }, [post.id, trainerCat]);

  if (questions.length === 0) return null;

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: active ? '1rem' : 0 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Quiz yourself
        </div>
        <button
          onClick={() => { setActive(a => !a); setAnswers({}); }}
          style={{ background: active ? 'var(--surface-2)' : 'var(--accent-bg)', border: '1px solid ' + (active ? 'var(--border)' : 'var(--accent-border)'), borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.85rem', fontSize: '0.78rem', fontWeight: 700, color: active ? 'var(--text-muted)' : 'var(--accent)', cursor: 'pointer' }}
        >
          {active ? 'Hide quiz' : 'Quiz Me →'}
        </button>
      </div>
      {active && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {questions.map((q, qi) => {
            const answered = answers[qi] !== undefined;
            const correct = answered && q.options[answers[qi]]?.correct;
            return (
              <div key={q.id || qi} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem' }}>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>{qi + 1}. {q.question}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {q.options.map((opt, oi) => {
                    let bg = 'var(--surface-2)', border = 'var(--border)', color = 'var(--text)';
                    if (answered) {
                      if (opt.correct) { bg = 'var(--green-bg)'; border = 'var(--green-border)'; color = 'var(--green)'; }
                      else if (answers[qi] === oi) { bg = 'var(--red-bg)'; border = 'var(--red-border)'; color = 'var(--red)'; }
                    }
                    return (
                      <button key={oi} disabled={answered} onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))} style={{ textAlign: 'left', background: bg, border: '1px solid ' + border, borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.75rem', fontSize: '0.82rem', color, cursor: answered ? 'default' : 'pointer', fontWeight: opt.correct && answered ? 700 : 400, transition: 'all 0.1s' }}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {answered && q.explanation && (
                  <p style={{ margin: '0.6rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.55, borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>{q.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PostDetail({ post, onBack, onOpenItem }) {
  const cfg = CATEGORY_CONFIG[post.category] || {};
  const catColor = cfg.color || 'var(--accent)';

  return (
    <>
      <ReadingProgress color={catColor} />

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem 4rem' }}>

        {/* Back */}
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem 0',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '1.5rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          ← Back to Playbook
        </button>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
            color: catColor, background: cfg.bg, border: `1px solid ${cfg.border}`,
            borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
          }}>
            {post.category}
          </span>
          <span style={{
            fontSize: '0.68rem', color: 'var(--text-dim)', background: 'var(--surface-2)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem',
          }}>
            {post.readMin} min read
          </span>
          {post.source && (
            <span style={{
              fontSize: '0.68rem', color: 'var(--red)', background: 'var(--red-bg)',
              border: '1px solid var(--red-border)', borderRadius: 'var(--radius-sm)',
              padding: '0.1rem 0.4rem',
            }}>
              🏢 {post.source}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '1.65rem', fontWeight: 900, color: 'var(--text)',
          margin: '0 0 0.7rem', letterSpacing: '-0.025em', lineHeight: 1.2,
        }}>
          {post.title}
        </h1>

        {/* Summary / lead */}
        <p style={{
          fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7,
          margin: '0 0 2rem', fontStyle: 'italic',
          borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem',
        }}>
          {post.summary}
        </p>

        {/* Content sections */}
        <div>
          {post.content.map((section, i) => (
            <Section key={i} section={section} />
          ))}
        </div>

        {/* Key Takeaways */}
        <KeyTakeaways items={post.keyTakeaways} catColor={catColor} />

        {/* Practice links */}
        {post.relatedItems?.length > 0 && (
          <div style={{
            marginTop: '2.5rem', paddingTop: '1.5rem',
            borderTop: '1.5px solid var(--border-subtle)',
          }}>
            <div style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.09em', color: 'var(--text-dim)', marginBottom: '0.75rem',
            }}>
              Now practice it →
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {post.relatedItems.map(item => {
                const rc = ROOM_CONFIG[item.room];
                return (
                  <button
                    key={item.id}
                    onClick={() => onOpenItem && onOpenItem(item.room, item.id)}
                    style={{
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)', padding: '0.45rem 0.85rem',
                      fontSize: '0.8rem', color: rc?.color || 'var(--text-muted)',
                      cursor: onOpenItem ? 'pointer' : 'default',
                      fontWeight: 600, transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => {
                      if (onOpenItem) {
                        e.currentTarget.style.borderColor = rc?.color || 'var(--accent)';
                        e.currentTarget.style.background = 'var(--surface)';
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.background = 'var(--surface-2)';
                    }}
                  >
                    {item.label} →
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* References */}
        <References refs={post.references} />

        {/* Quiz Me */}
        <QuizMe post={post} />

        {/* Footer back */}
        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={onBack}
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '0.45rem 1rem',
              color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer',
              fontWeight: 500,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            ← Back to Playbook
          </button>
        </div>
      </div>
    </>
  );
}
