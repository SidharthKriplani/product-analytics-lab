import { Icon } from './Icon.jsx';
import { useState } from 'react';
import { track } from '../../utils/analytics.js';

// DebriefCopyButton - reusable clipboard export for any room runner.
// Props:
//   title       (string)  - case / scenario title
//   notes       (string)  - user's freeform notes from pal-notes-v1
//   modelAnswer (string)  - model answer, senior debrief summary, or key insight
//   tags        (array)   - string array of tags/topics
//   difficulty  (string)  - 'analyst' | 'senior' | 'staff'
//   room        (string)  - display name, e.g. 'Review Room' or 'RCA Room'

export function DebriefCopyButton({ title, notes, modelAnswer, tags, difficulty, room }) {
  const [copied, setCopied] = useState(false);

  function buildMarkdown() {
    const tagLine = Array.isArray(tags) && tags.length > 0
      ? tags.join(', ')
      : '-';
    const diffLabel = difficulty
      ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
      : '-';
    const notesText = notes && notes.trim() ? notes.trim() : '(none)';
    const answerText = modelAnswer && modelAnswer.trim() ? modelAnswer.trim() : '(none)';

    return (
      '# ' + title + '\\n' +
      '**Room:** ' + (room || '-') + ' | **Difficulty:** ' + diffLabel + '\\n' +
      '**Tags:** ' + tagLine + '\\n' +
      '\\n' +
      '## Model Answer\\n' +
      answerText + '\\n' +
      '\\n' +
      '## My Notes\\n' +
      notesText + '\\n'
    );
  }

  function handleCopy() {
    const md = buildMarkdown();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(md).then(() => {
        track('debrief_copied', { room: room || 'unknown', difficulty: difficulty || 'unknown' });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => fallbackCopy(md));
    } else {
      fallbackCopy(md);
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
      title={copied ? 'Copied to clipboard!' : 'Copy debrief as markdown'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        background: copied ? 'var(--green-bg)' : 'var(--surface-2)',
        border: '1px solid ' + (copied ? 'var(--green-border)' : 'var(--border)'),
        borderRadius: '6px',
        padding: '0.42rem 0.85rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: copied ? 'var(--green)' : 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        flexShrink: 0,
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
      {copied ? <span style={{ fontSize: '0.85rem' }}>✓</span> : <Icon name="clipboard" size={14} color="currentColor" />}
      <span>{copied ? 'Copied!' : 'Copy debrief'}</span>
    </button>
  );
}
