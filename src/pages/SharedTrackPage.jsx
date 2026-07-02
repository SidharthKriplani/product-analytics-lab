// SharedTrackPage — public read-only view of a shared PAL track.
// Accessible at #/shared/<share_id>. No auth required.

import { useState, useEffect } from 'react';
import { fetchSharedTrack } from '../utils/sharedTracks.js';

const TYPE_LABEL = {
  sql:            'SQL Problem',
  sf_module:      'Stats Foundation',
  mf_module:      'Metrics Foundation',
  ef_module:      'A/B Foundation',
  rca_module:     'RCA Foundation',
  cases:          'Cases',
  rca:            'RCA',
  estimation:     'Estimation',
  metrics:        'Metrics',
  growth:         'Growth Analytics',
  prioritization: 'Prioritization',
  scenario:       'A/B Review',
  flaw:           'Spot the Flaw',
  design:         'A/B Design',
  instrumentation:'Instrumentation',
  product_design: 'PM Design',
  stats:          'Stats',
  behavioral:     'Behavioral',
  company_case:   'Company Track',
  cheatsheet:     'Cheat Sheet',
  note:           'Note',
};

const TYPE_ROOM = {
  sf_module:      'stat-foundations',
  mf_module:      'metrics-foundations',
  ef_module:      'exp-foundations',
  rca_module:     'rca-foundations',
  cases:          'cases',
  rca:            'rca',
  estimation:     'estimation',
  metrics:        'metrics',
  growth:         'growth-analytics',
  prioritization: 'prioritization',
  scenario:       'browser',
  flaw:           'spot-the-flaw',
  design:         'design',
  instrumentation:'instrumentation',
  product_design: 'product-design',
  stats:          'stats',
  behavioral:     'behavioral',
  company_case:   'cases',
  cheatsheet:     'cheatsheet',
};

const DIFF_COLORS = {
  foundational: { bg: 'var(--accent-bg)',  color: 'var(--accent)',  border: 'var(--accent-border)' },
  analyst:      { bg: 'var(--accent-bg)',  color: 'var(--accent)',  border: 'var(--accent-border)' },
  Beginner:     { bg: 'var(--accent-bg)',  color: 'var(--accent)',  border: 'var(--accent-border)' },
  intermediate: { bg: 'var(--teal-bg)',    color: 'var(--teal)',    border: 'var(--teal-border)' },
  Intermediate: { bg: 'var(--teal-bg)',    color: 'var(--teal)',    border: 'var(--teal-border)' },
  senior:       { bg: 'var(--teal-bg)',    color: 'var(--teal)',    border: 'var(--teal-border)' },
  advanced:     { bg: 'var(--yellow-bg)',  color: 'var(--yellow)',  border: 'var(--yellow-border)' },
  Advanced:     { bg: 'var(--yellow-bg)',  color: 'var(--yellow)',  border: 'var(--yellow-border)' },
  staff:        { bg: 'var(--yellow-bg)',  color: 'var(--yellow)',  border: 'var(--yellow-border)' },
  Easy:         { bg: 'var(--green-bg)',   color: 'var(--green)',   border: 'var(--green-border)' },
  Medium:       { bg: 'var(--yellow-bg)',  color: 'var(--yellow)',  border: 'var(--yellow-border)' },
  Hard:         { bg: 'rgba(239,68,68,0.1)', color: '#dc2626',     border: 'rgba(239,68,68,0.25)' },
};

function DiffBadge({ diff }) {
  if (!diff) return null;
  const s = DIFF_COLORS[diff] || { bg: 'var(--surface-2)', color: 'var(--text-muted)', border: 'var(--border)' };
  return (
    <span style={{
      fontSize: '0.62rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
    }}>{diff}</span>
  );
}

export function SharedTrackPage({ shareId, onNavigate }) {
  const [track, setTrack]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!shareId) return;
    setLoading(true);
    fetchSharedTrack(shareId)
      .then(data => { setTrack(data); setLoading(false); })
      .catch(err => { setError(err.message || 'Track not found.'); setLoading(false); });
  }, [shareId]);

  if (loading) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 1.5rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="pal-shimmer-box" style={{ height: 80, marginBottom: '0.75rem', opacity: 1 - i * 0.2 }} />
        ))}
      </div>
    );
  }

  if (error || !track) {
    return (
      <div style={{ maxWidth: 700, margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          {error || 'This track could not be found.'}
        </p>
        <button
          onClick={() => onNavigate('home')}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 1rem', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.83rem' }}
        >← Back to PAL</button>
      </div>
    );
  }

  const items = track.items || [];
  const contentItems = items.filter(i => i.type !== 'note');
  const noteItems    = items.filter(i => i.type === 'note');

  return (
    <div className="pal-page-enter" style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: '0.35rem' }}>
          Shared Track · Product Analytics Lab
        </p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 0.4rem', letterSpacing: '-0.02em' }}>
          {track.name}
        </h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
          {items.length} item{items.length !== 1 ? 's' : ''} · shared via Product Analytics Lab
        </p>
      </div>

      {/* Content items */}
      {contentItems.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
          {contentItems.map((item, idx) => {
            const label     = item.label || item.title || item.problemId || '—';
            const typeLabel = TYPE_LABEL[item.type] || item.type;
            const diff      = item.difficulty || item.meta?.difficulty;
            const room      = TYPE_ROOM[item.type];

            return (
              <div key={idx} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '0.85rem 1rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                      background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)',
                      textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
                    }}>{typeLabel}</span>
                    {diff && <DiffBadge diff={diff} />}
                  </div>
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', margin: 0, lineHeight: 1.4 }}>
                    {label}
                  </p>
                </div>
                {room && (
                  <button
                    onClick={() => onNavigate(room)}
                    style={{
                      flexShrink: 0, fontSize: '0.78rem', padding: '0.3rem 0.8rem',
                      borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                      background: 'none', color: 'var(--accent)', cursor: 'pointer',
                      fontWeight: 600, whiteSpace: 'nowrap',
                    }}
                  >Open →</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Notes */}
      {noteItems.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
            Notes
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {noteItems.map((item, idx) => (
              <div key={idx} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '0.85rem 1rem',
              }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text)', margin: 0, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          This track has no items yet.
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Part of <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Product Analytics Lab</span>
        </span>
        <button
          onClick={() => onNavigate('home')}
          style={{
            fontSize: '0.78rem', padding: '0.35rem 0.9rem',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent)',
            background: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600,
          }}
        >Explore PAL →</button>
      </div>
    </div>
  );
}

export default SharedTrackPage;
