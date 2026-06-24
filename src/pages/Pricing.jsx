import { Icon } from '../components/shared/Icon.jsx';

export function Pricing({ onShowUnlock, onBack, onNavigate }) {
  const stripeLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK || '#';

  const cardBase = {
    flex: '1 1 280px',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '2rem',
    background: 'var(--surface)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  };

  const featureItem = (text) => (
    <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
      <span style={{ color: 'var(--green)', fontWeight: 700, marginTop: 1 }}><Icon name='check' size={15} color='var(--green)' /></span>
      <span>{text}</span>
    </div>
  );

  const ROOMS = [
    { name: 'Stats Room', color: 'var(--accent)' },
    { name: 'A/B Design', color: 'var(--accent)' },
    { name: 'A/B Review', color: 'var(--accent)' },
    { name: 'Spot the Flaw', color: 'var(--red)' },
    { name: 'Metrics Room', color: 'var(--green)' },
    { name: 'Growth Analytics', color: 'var(--green)' },
    { name: 'RCA Room', color: 'var(--teal)' },
    { name: 'BI Room', color: 'var(--yellow)' },
    { name: 'Business Cases', color: 'var(--yellow)' },
    { name: 'Product Design', color: 'var(--purple)' },
    { name: 'Prioritization', color: 'var(--purple)' },
    { name: 'Behavioral', color: 'var(--purple)' },
    { name: 'Estimation', color: 'var(--accent)' },
    { name: 'Take-Home', color: 'var(--yellow)' },
    { name: 'Instrumentation', color: 'var(--teal)' },
    { name: 'Stat Foundations', color: 'var(--accent)' },
    { name: 'Exp Foundations', color: 'var(--accent)' },
  ];

  return (
    <div className="pal-page-enter" style={{ maxWidth: 860, margin: '0 auto', padding: '3rem 1.5rem' }}>
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

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)', marginBottom: '0.6rem', letterSpacing: '-0.04em', lineHeight: 1.15 }}>
          The gap isn't knowledge.
          <br />
          <span style={{ color: 'var(--accent)' }}>It's judgment under pressure.</span>
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto 1rem', lineHeight: 1.65 }}>
          Google, Meta, Airbnb, and Stripe interviewers don't ask you to recite p-values.
          They put you in a real scenario — a metric dropped 20%, an experiment looks
          significant but isn't — and watch how you reason through it. PAL trains exactly that.
        </p>
        <div style={{ fontSize: '0.83rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <span style={{ color: 'var(--green)', fontWeight: 700 }}><Icon name='check' size={13} color='var(--green)' /></span>
          <span>17 practice rooms · 150+ cases · 25 interactive foundation modules · No subscription</span>
        </div>
      </div>

      {/* Tiers */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center', marginBottom: '2rem' }}>
        {/* Free tier */}
        <div style={{ ...cardBase, borderColor: 'var(--border)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
              Free
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>$0</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>No card required</div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
            {featureItem('2 Stat Foundation modules — try before you buy')}
            {featureItem('2 Stats Room cases — real scenarios, full debrief')}
            {featureItem('Full Playbook access — 70+ reference articles')}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1.25rem' }}>
            <button
              onClick={() => onBack?.()}
              style={{
                width: '100%', padding: '0.65rem', borderRadius: 'var(--radius)',
                background: 'var(--surface-2)', color: 'var(--text)',
                border: '1px solid var(--border)', cursor: 'pointer',
                fontSize: '0.875rem', fontWeight: 600,
              }}
            >
              Start free →
            </button>
          </div>
        </div>

        {/* Paid tier */}
        <div style={{
          ...cardBase,
          borderColor: 'var(--accent)',
          boxShadow: '0 0 0 1px var(--accent)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--accent)', color: '#fff',
            fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.75rem',
            borderRadius: 20, letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            Best value
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
              Full Access
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>$69</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>one-time</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Lifetime access, no subscription</div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
            {featureItem('All 150+ practice cases across 17 rooms')}
            {featureItem('25 interactive foundation modules')}
            {featureItem('All guided learning paths')}
            {featureItem('Lifetime access — pay once, use forever')}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '1.25rem' }}>
            <button
              onClick={() => {
                try { window.posthog?.capture('pricing_cta_click', { tier: 'full_access' }); } catch {}
                window.open(stripeLink, '_blank');
              }}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)',
                background: 'var(--accent)', color: '#fff',
                border: 'none', cursor: 'pointer',
                fontSize: '1rem', fontWeight: 700,
                boxShadow: '0 2px 8px rgba(67,56,202,0.35)',
              }}
            >
              Get Full Access →
            </button>
            {/* Risk reversal */}
            <div style={{ textAlign: 'center', fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '0.6rem' }}>
              30-day money-back guarantee. No questions asked.
            </div>
          </div>
        </div>
      </div>

      {/* What's inside */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '1.75rem 2rem', marginBottom: '1.5rem',
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          What's inside — all 17 rooms
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {ROOMS.map(r => (
            <span key={r.name} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.7rem',
              fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
              {r.name}
            </span>
          ))}
        </div>
        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
          Plus: Challenges, Mock Interview, Stats Calculator, MCQ Quiz, Company tracks, and 70+ Playbook articles.
          All progress saved locally — no account, no server.
        </div>
      </div>

      {/* Access code link */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => {
            try { window.posthog?.capture('pricing_unlock_code_click'); } catch {}
            onShowUnlock?.();
          }}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline',
            padding: 0,
          }}
        >
          Have an access code? →
        </button>
      </div>
    </div>
  );
}
