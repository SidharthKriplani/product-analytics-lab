import { FOUNDATION_DOMAINS } from '../data/foundationMeta.js';
import { Icon } from '../components/shared/Icon.jsx';

export function FoundationHub({ onOpenArticle, onNavigate }) {
  const domains = Object.entries(FOUNDATION_DOMAINS);

  return (
    <div className="pal-page-enter" style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem 3rem' }}>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '1.6rem',
          fontWeight: 800,
          color: 'var(--text)',
          letterSpacing: '-0.03em',
          margin: '0 0 0.4rem',
        }}>
          Foundations
        </h1>
        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-muted)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          Theory, frameworks, and mental models — organized by domain
        </p>
      </div>

      {/* Domain sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {domains.map(([key, domain]) => (
          <section key={key}>
            {/* Domain header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.85rem',
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-sm)',
                background: domain.bg,
                border: '1px solid ' + domain.border,
                flexShrink: 0,
              }}>
                <Icon name={domain.icon} size={18} color={domain.color} />
              </span>
              <h2 style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: domain.color,
                margin: 0,
                letterSpacing: '-0.01em',
              }}>
                {domain.label}
              </h2>
              <span style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '0.1rem 0.45rem',
                fontWeight: 500,
              }}>
                {domain.articles.length}
              </span>
            </div>

            {/* Article cards grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))',
              gap: '0.6rem',
            }}>
              {domain.articles.map((article, artIndex) => (
                <button
                  key={article.id}
                  className="pal-card-enter pal-card-hover"
                  onClick={() => onOpenArticle(article.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '0.65rem 0.8rem',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                    color: 'var(--text)',
                    fontSize: '0.83rem',
                    fontWeight: 500,
                    lineHeight: 1.45,
                    animationDelay: (Math.min(artIndex * 28, 400)) + 'ms',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = domain.color;
                    e.currentTarget.style.background = domain.bg;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'var(--surface)';
                  }}
                >
                  {article.title}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
