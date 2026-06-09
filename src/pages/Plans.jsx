import { useState, useEffect, useRef } from 'react';
import { tryUnlock, isUnlocked } from '../utils/unlock.js';

const PRICING_PLANS = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: '₹799',
    period: '/month',
    note: 'Billed monthly. Cancel anytime.',
    highlight: false,
  },
  {
    id: 'quarterly',
    label: 'Quarterly',
    price: '₹1,999',
    period: '/quarter',
    note: 'Save ~17% vs monthly.',
    highlight: false,
  },
  {
    id: 'annual',
    label: 'Annual',
    price: '₹5,999',
    period: '/year',
    note: 'Best value — save ~37%.',
    highlight: true,
  },
  {
    id: 'sprint',
    label: 'Interview Sprint',
    price: '₹2,499',
    period: '/ 14 days',
    note: 'One focused sprint before your interview.',
    highlight: false,
  },
];

const TIERS = [
  { id: 'guest',  label: 'Guest',        color: 'var(--text-muted)' },
  { id: 'free',   label: 'Free Account', color: 'var(--accent)'     },
  { id: 'full',   label: 'Full Lab',     color: 'var(--teal)'       },
];

const FEATURES = [
  { label: 'Practice cases',          guest: '1 per room',   free: '3 per room',    full: 'All 300+'         },
  { label: 'Difficulty access',       guest: 'Analyst only', free: 'Analyst–Senior', full: 'Analyst → Staff' },
  { label: 'Progress saved',          guest: false,          free: true,            full: true               },
  { label: 'Daily streak',            guest: false,          free: true,            full: true               },
  { label: 'Cross-device sync',       guest: false,          free: true,            full: true               },
  { label: 'Foundations (4 rooms)',   guest: true,           free: true,            full: true               },
  { label: 'Frameworks & articles',   guest: true,           free: true,            full: true               },
  { label: 'Easy SQL (50 problems)',  guest: false,          free: true,            full: true               },
  { label: 'Forensic SQL',            guest: false,          free: '10 problems',   full: '25 problems'      },
  { label: 'Medium / Hard / Master SQL', guest: false,       free: false,           full: '90+ problems'     },
  { label: 'Staff Layer debriefs',    guest: false,          free: false,           full: true               },
  { label: 'Company Tracks',          guest: false,          free: false,           full: true               },
  { label: 'Mock Interview',          guest: false,          free: false,           full: true               },
];

function Cell({ value, accent }) {
  if (value === true)  return <span style={{ color: accent || 'var(--green)', fontWeight: 700, fontSize: '1rem' }}>✓</span>;
  if (value === false) return <span style={{ color: 'var(--border)', fontSize: '1rem' }}>—</span>;
  return <span style={{ fontSize: '0.8rem', fontWeight: 600, color: accent || 'var(--text-muted)' }}>{value}</span>;
}

/* RAW FEEDBACK ARCHIVE — full quotes for future testimonials wall or marketing copy:
    Parth Gandhi (Senior Data Analyst, TCS, 4+ yrs):
      "What I really like about PAL is that the mock interviews are time-based. It gives a much more realistic interview experience."
      "PAL is short, practical, and realistic. It focuses on what actually matters during interviews rather than overwhelming you with theory."
      "The mix of product thinking, case studies, and SQL practice covers the core skills needed to crack analytics interviews."
      "PAL feels less like interview preparation and more like actual on-the-job training."
      "The experimentation modules encourage you to think beyond standard frameworks and develop a more structured problem-solving mindset."
    Faizan Mulla (Data Analyst, Enrich, IIT Madras):
      "Its very comprehensive and thorough. I have seen many interview platforms but nothing like this especially for product analytics."
      "For my prep, I have gathered many resources, but this seems like a one-stop site, like everything I need is already here."
      "One feedback: there are too much info at a time on the screen. Info is not the issue, but displaying it can be improved on."
*/
const TESTIMONIALS = [
  { img: '/testimonials/amaya.jpg',    name: 'Amaya',     href: 'https://www.linkedin.com/in/amaya-bhuyan-91986119b/', role: 'Statistics',     quote: 'I always knew exactly what to focus on next — it felt like a real foundation, not just memorising.' },
  { img: '/testimonials/jatin.jpg',    name: 'Jatin',     href: 'https://www.linkedin.com/in/jatin-nair-03161a197/',   role: 'RCA track',      quote: 'PAL helped me test whether I truly understood the framework — and surface exactly where my gaps were.' },
  { img: '/testimonials/debasrija.jpg',name: 'Debasrija', href: 'https://www.linkedin.com/in/debasrijamondal/',        role: 'Stats & Design', quote: 'The p-value simulation made it tangible. Scenarios felt closer to real interviews than anything I\'ve seen.' },
  { img: '/testimonials/swapnil.jpg',  name: 'Swapnil',   href: 'https://www.linkedin.com/in/swapnil-pattanshetty/',   role: 'Data Scientist', quote: 'The cases forced me to think like a PM, not just run numbers. The debrief format is what makes it stick.' },
  { img: '/testimonials/meghana.jpg', name: 'Meghana',   href: 'https://www.linkedin.com/in/meghana-joshi-82199537/', role: 'Analyst & Educator', quote: 'PAL doesn\'t let you passively scroll through — it forces you to actually think.' },
  { img: '/testimonials/parth.jpg',  name: 'Parth',     href: 'https://www.linkedin.com/in/parthgandhip/',            role: 'Senior Data Analyst', quote: 'PAL feels less like interview prep and more like actual on-the-job training.' },
  { img: '/testimonials/faizan.jpg', name: 'Faizan',    href: 'https://www.linkedin.com/in/faizanxmulla/',            role: 'Data Analyst · IIT Madras', quote: 'I\'ve seen many interview platforms — nothing like this for product analytics.' },
];

function TestimonialTicker() {
  const innerRef = useRef(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    let pos = 0;
    let animId;
    const SPEED = 0.28; // px per frame — very slow drift

    const tick = () => {
      pos += SPEED;
      const half = el.scrollHeight / 2;
      if (pos >= half) pos -= half; // seamless loop — second half is identical
      el.style.transform = 'translateY(-' + pos + 'px)';
      animId = requestAnimationFrame(tick);
    };

    // Let layout settle before measuring scrollHeight
    const t = setTimeout(() => { animId = requestAnimationFrame(tick); }, 120);
    return () => { cancelAnimationFrame(animId); clearTimeout(t); };
  }, []);

  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div style={{ marginBottom: '2rem' }}>
      <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>
        What people are saying
      </p>
      <div style={{ overflow: 'hidden', height: '8.5rem' }}>
        <div ref={innerRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {doubled.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', flexShrink: 0 }}>
              <img src={t.img} alt={t.name} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginTop: '1px' }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                <a href={t.href} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: 'var(--text)', textDecoration: 'none', marginRight: '0.3rem' }}>{t.name}</a>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: '0.4rem' }}>· {t.role}</span>
                <span style={{ fontStyle: 'italic' }}>"{t.quote}"</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Plans({ onBack, onShowAuth, onNavigate, user, unlocked: unlockedProp }) {
  const alreadyUnlocked = unlockedProp || isUnlocked();
  const [code, setCode]       = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(alreadyUnlocked);

  function handleUnlock(e) {
    e.preventDefault();
    if (tryUnlock(code)) {
      setSuccess(true);
      setError('');
      setTimeout(() => onNavigate && onNavigate('progress'), 1400);
    } else {
      setError('Invalid code. Ask via the community or DM the founder.');
    }
  }

  return (
    <div className="pal-page-enter" style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontSize: '0.85rem', cursor: 'pointer', padding: 0, marginBottom: '2rem',
          display: 'flex', alignItems: 'center', gap: '0.35rem',
        }}
      >
        ← Back
      </button>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text)', margin: '0 0 0.5rem', letterSpacing: '-0.03em' }}>
          How you want to practice
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0 }}>
          Full access to every room, difficulty level, and debrief.
        </p>
      </div>

      {/* ── Testimonials — rotating ticker ── */}
      <TestimonialTicker />


      {/* ── Pricing cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(210px, 100%), 1fr))',
        gap: '1.1rem',
        marginBottom: '1.75rem',
      }}>
        {PRICING_PLANS.map(plan => (
          <div key={plan.id} style={{
            border: plan.highlight ? '2px solid var(--teal)' : '1px solid var(--border)',
            borderRadius: '14px',
            padding: '1.5rem',
            background: plan.highlight ? 'rgba(20,184,166,0.04)' : 'var(--surface)',
            display: 'flex', flexDirection: 'column', gap: '0.6rem',
            position: 'relative',
          }}>
            {plan.highlight && (
              <span style={{
                position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--teal)', color: '#fff',
                fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                borderRadius: '4px', padding: '0.15rem 0.5rem', whiteSpace: 'nowrap',
              }}>
                Best value
              </span>
            )}
            <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: plan.highlight ? 'var(--teal)' : 'var(--text-muted)' }}>
              {plan.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em' }}>
                {plan.price}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {plan.period}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, flexGrow: 1 }}>
              {plan.note}
            </p>
            <a
              href="https://wa.me/917838438784"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block', textAlign: 'center',
                marginTop: '0.25rem', padding: '0.6rem 1rem',
                background: plan.highlight ? 'var(--teal)' : 'var(--surface-2, var(--surface))',
                border: '1px solid ' + (plan.highlight ? 'var(--teal)' : 'var(--border)'),
                borderRadius: '8px',
                fontSize: '0.825rem', fontWeight: 700,
                color: plan.highlight ? '#fff' : 'var(--text)',
                textDecoration: 'none', cursor: 'pointer',
                transition: 'opacity 0.12s',
              }}
            >
              Get early access →
            </a>
          </div>
        ))}
      </div>

      {/* ── Beta access section (quiet) ── */}
      <div style={{
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        background: 'var(--surface)',
        marginBottom: '3rem',
      }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 1rem', textAlign: 'center', lineHeight: 1.6 }}>
          Subscriptions activate at launch. <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Currently in beta</strong> — sign in to save your progress,
          or enter a beta access code to unlock the full lab now.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'center' }}>
          {/* Sign in */}
          {!user ? (
            <button
              onClick={() => onShowAuth && onShowAuth()}
              style={{
                padding: '0.55rem 1.1rem',
                background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                borderRadius: '8px', color: 'var(--accent)',
                fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Sign in — it's free →
            </button>
          ) : (
            <span style={{
              padding: '0.55rem 1.1rem', fontSize: '0.82rem', fontWeight: 700,
              color: 'var(--accent)', background: 'var(--accent-bg)',
              border: '1px solid var(--accent-border)', borderRadius: '8px',
            }}>
              ✓ Signed in
            </span>
          )}

          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim, var(--text-muted))', opacity: 0.5 }}>·</span>

          {/* Access code */}
          {success ? (
            <span style={{
              padding: '0.55rem 1.1rem', fontSize: '0.82rem', fontWeight: 700,
              color: 'var(--teal)', background: 'rgba(20,184,166,0.08)',
              border: '1px solid var(--teal-border, rgba(20,184,166,0.3))', borderRadius: '8px',
            }}>
              ✓ Full lab unlocked
            </span>
          ) : (
            <form onSubmit={handleUnlock} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="password"
                autoComplete="off"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Beta access code"
                style={{
                  border: '1px solid var(--border)', borderRadius: '8px',
                  padding: '0.5rem 0.75rem', fontSize: '0.82rem',
                  color: 'var(--text)', background: 'var(--surface)',
                  outline: 'none', fontFamily: 'inherit', width: '160px',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--teal)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              />
              <button
                type="submit"
                disabled={!code.trim()}
                style={{
                  padding: '0.5rem 0.9rem',
                  background: code.trim() ? 'var(--teal)' : 'var(--surface-2, var(--surface))',
                  color: code.trim() ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700,
                  cursor: code.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                }}
              >
                Unlock
              </button>
            </form>
          )}
        </div>
        {error && (
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: 'var(--red)', textAlign: 'center' }}>{error}</p>
        )}
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', opacity: 0.7 }}>
          No code?{' '}
          <a href="https://chat.whatsapp.com/KqFoGxAW0XMF9hNllGyAo9" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            Join the beta group
          </a>{' '}or{' '}
          <a href="https://wa.me/917838438784" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            DM the founder
          </a>.
        </p>
      </div>

      {/* ── Comparison table ── */}
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1rem', opacity: 0.8 }}>
        All paid plans above include <strong style={{ color: 'var(--teal)', fontWeight: 700 }}>Full Lab</strong> access — same content, different billing periods.
      </p>
      <div style={{
        border: '1px solid var(--border)', borderRadius: '14px',
        overflow: 'hidden', marginBottom: '2rem',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ padding: '0.85rem 1.25rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            Feature
          </div>
          {TIERS.map((t, i) => (
            <div key={t.id} style={{
              padding: '0.85rem 0.75rem', textAlign: 'center',
              fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              color: t.color,
              background: i === 1 ? 'var(--accent-bg, rgba(99,102,241,0.06))' : 'transparent',
              borderLeft: i === 1 ? '1px solid var(--accent-border)' : '1px solid var(--border)',
              borderRight: i === 1 ? '1px solid var(--accent-border)' : 'none',
            }}>
              {t.label}
            </div>
          ))}
        </div>
        {FEATURES.map((f, idx) => (
          <div key={f.label} style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
            borderBottom: idx < FEATURES.length - 1 ? '1px solid var(--border)' : 'none',
            background: idx % 2 === 0 ? 'transparent' : 'var(--surface-2, rgba(255,255,255,0.015))',
          }}>
            <div style={{ padding: '0.7rem 1.25rem', fontSize: '0.83rem', color: 'var(--text)', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
              {f.label}
            </div>
            {[f.guest, f.free, f.full].map((val, i) => (
              <div key={i} style={{
                padding: '0.7rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i === 1 ? 'var(--accent-bg, rgba(99,102,241,0.04))' : 'transparent',
                borderLeft: i === 1 ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                borderRight: i === 1 ? '1px solid var(--accent-border)' : 'none',
              }}>
                <Cell value={val} accent={i === 1 ? 'var(--accent)' : i === 2 ? 'var(--teal)' : undefined} />
              </div>
            ))}
          </div>
        ))}
      </div>


      {/* Footer */}
      <div style={{
        textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)',
        borderTop: '1px solid var(--border)', paddingTop: '1.5rem',
      }}>
        Foundations are always free — no account required. · Stripe payments coming soon. One code covers everything during beta.
      </div>

    </div>
  );
}
