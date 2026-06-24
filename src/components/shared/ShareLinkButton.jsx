import { useState } from 'react';
import { track } from '../../utils/analytics.js';
import { Icon } from './Icon.jsx';

// ShareLinkButton — copies the current page URL to clipboard.
// Place in any runner header. Works automatically because App.jsx
// keeps window.location.hash in sync with page + active case ID.
//
// Props:
//   room  (string) — e.g. 'review', 'rca', 'metrics' — used for analytics only

export function ShareLinkButton({ room }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        track('share_link_copied', { room: room || 'unknown' });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
  }

  function fallbackCopy(text) {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  }

  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Link copied!' : 'Copy link to this case'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        background: copied ? 'var(--green-bg)' : 'var(--surface-2)',
        border: '1px solid ' + (copied ? 'var(--green-border)' : 'var(--border)'),
        borderRadius: '6px',
        padding: '0.42rem 0.75rem',
        fontSize: '0.78rem',
        fontWeight: 600,
        color: copied ? 'var(--green)' : 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        flexShrink: 0,
        marginTop: '2px',
      }}
      onMouseEnter={e => {
        if (!copied) {
          e.currentTarget.style.borderColor = 'var(--border-strong)';
          e.currentTarget.style.color = 'var(--text)';
        }
      }}
      onMouseLeave={e => {
        if (!copied) {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text-muted)';
        }
      }}
    >
      {copied
        ? <span style={{ fontSize: '0.82rem', display: 'inline-flex' }}><Icon name='check' size={13} color='currentColor' /></span>
        : <span style={{ fontSize: '0.85rem', display: 'inline-flex' }}><Icon name='link' size={15} color='currentColor' /></span>}
      <span>{copied ? 'Copied!' : 'Share'}</span>
    </button>
  );
}
