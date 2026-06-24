import { useState, useEffect, useCallback } from 'react';
import { Icon } from '../components/shared/Icon.jsx';
import { SegmentedTabs } from '../components/shared/SegmentedTabs.jsx';
import { CompanyLogo } from '../components/shared/CompanyLogo.jsx';
import { COMPANIES } from '../data/companyList.js';
import { supabase } from '../utils/supabase.js';
import {
  fetchFeed, fetchMyUpvotes, createPost, toggleUpvote, reportPost,
  FEED_BODY_MAX,
} from '../utils/feed.js';

// Community feed — three streams (Referrals / Questions / Wins). Signed-in users
// post; everyone reads. Degrades gracefully: no Supabase configured → a calm
// 'coming soon'; backend up but no rows / migration pending → an honest empty
// state. Monochrome Instrument: dark, hairline borders, one accent, <Icon> not
// emoji, theme vars throughout, mobile-safe.

const STREAMS = [
  { id: 'referral', label: 'Referrals', icon: 'briefcase', empty: 'No referral posts yet. Share an opening at your company.' },
  { id: 'question', label: 'Questions', icon: 'help-circle', empty: 'No questions yet. Ask the community anything.' },
  { id: 'win',      label: 'Wins',      icon: 'party',       empty: 'No wins posted yet. Landed an offer? Share it.' },
];

const STREAM_BY_ID = Object.fromEntries(STREAMS.map(s => [s.id, s]));

// Relative time — compact, no dependency. Falls back to a date for old posts.
function timeAgo(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 45) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + 'd ago';
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return weeks + 'w ago';
  try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
  catch { return ''; }
}

export function Community({ user, onShowAuth, onNavigate }) {
  const [activeTab, setActiveTab] = useState('referral');
  const [posts, setPosts] = useState([]);
  const [myUpvotes, setMyUpvotes] = useState(() => new Set());
  const [loading, setLoading] = useState(true);

  // Composer
  const [body, setBody] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [posting, setPosting] = useState(false);
  // idle | invalid | migration-pending | no-backend | error
  const [composerStatus, setComposerStatus] = useState('idle');

  const noBackend = !supabase;

  const load = useCallback(async (type) => {
    setLoading(true);
    const rows = await fetchFeed({ type, limit: 50 });
    setPosts(rows);
    const ids = rows.map(r => r.id);
    const ups = await fetchMyUpvotes(user, ids);
    setMyUpvotes(ups);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(activeTab); }, [activeTab, load]);

  async function handlePost() {
    const text = body.trim();
    if (!text) { setComposerStatus('invalid'); setTimeout(() => setComposerStatus('idle'), 3000); return; }
    setPosting(true);
    setComposerStatus('idle');
    const res = await createPost(user, {
      type: activeTab,
      body: text,
      targetCompany: activeTab === 'referral' ? targetCompany : '',
    });
    setPosting(false);
    if (res.ok) {
      setBody('');
      setTargetCompany('');
      // Optimistically prepend so the user sees their post immediately.
      if (res.post) setPosts(prev => [res.post, ...prev]);
      else load(activeTab);
    } else {
      setComposerStatus(res.reason || 'error');
      setTimeout(() => setComposerStatus('idle'), 4500);
    }
  }

  async function handleUpvote(post) {
    if (!user) { onShowAuth(); return; }
    const wasUp = myUpvotes.has(post.id);
    // Optimistic update.
    setMyUpvotes(prev => {
      const next = new Set(prev);
      if (wasUp) next.delete(post.id); else next.add(post.id);
      return next;
    });
    setPosts(prev => prev.map(p => p.id === post.id
      ? { ...p, upvotes: Math.max(0, (p.upvotes || 0) + (wasUp ? -1 : 1)) }
      : p));
    const res = await toggleUpvote(user, post.id);
    if (!res.ok) {
      // Roll back on failure.
      setMyUpvotes(prev => {
        const next = new Set(prev);
        if (wasUp) next.add(post.id); else next.delete(post.id);
        return next;
      });
      setPosts(prev => prev.map(p => p.id === post.id
        ? { ...p, upvotes: Math.max(0, (p.upvotes || 0) + (wasUp ? 1 : -1)) }
        : p));
    }
  }

  const stream = STREAM_BY_ID[activeTab];

  return (
    <div className="pal-page-enter" style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.2rem' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.4rem' }}>
          <Icon name="message-circle" size={20} color="var(--accent)" />
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>Community</h1>
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, maxWidth: '52ch' }}>
          Referrals, questions, and wins from analysts and PMs prepping alongside you.
        </p>
      </div>

      {/* ── Streams ── */}
      <SegmentedTabs
        tabs={STREAMS.map(s => ({ id: s.id, label: s.label }))}
        value={activeTab}
        onChange={setActiveTab}
        accent="accent"
      />

      {/* ── Composer ── */}
      <Composer
        user={user}
        stream={stream}
        body={body}
        setBody={setBody}
        targetCompany={targetCompany}
        setTargetCompany={setTargetCompany}
        posting={posting}
        status={composerStatus}
        onPost={handlePost}
        onShowAuth={onShowAuth}
        noBackend={noBackend}
      />

      {/* ── Feed ── */}
      <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        {loading ? (
          <SkeletonList />
        ) : noBackend ? (
          <ComingSoon />
        ) : posts.length === 0 ? (
          <EmptyState stream={stream} />
        ) : (
          posts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              index={i}
              upvoted={myUpvotes.has(post.id)}
              onUpvote={() => handleUpvote(post)}
              isMine={user && post.user_id === user.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Composer ─────────────────────────────────────────────────────────────────

function Composer({ user, stream, body, setBody, targetCompany, setTargetCompany, posting, status, onPost, onShowAuth, noBackend }) {
  if (noBackend) return null; // 'coming soon' shown in the feed area instead.

  if (!user) {
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Sign in to post a {stream.label.toLowerCase().replace(/s$/, '')}.
          </span>
          <button onClick={onShowAuth} style={primaryBtn}>Sign in to post</button>
        </div>
      </div>
    );
  }

  const placeholder = stream.id === 'referral'
    ? 'Share an opening — role, team, what you are looking for…'
    : stream.id === 'question'
      ? 'Ask the community a question…'
      : 'Share a win — an offer, a milestone, a breakthrough…';

  return (
    <div style={cardStyle}>
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder={placeholder}
        maxLength={FEED_BODY_MAX}
        rows={3}
        style={{
          width: '100%', boxSizing: 'border-box', resize: 'vertical',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm, 7px)', padding: '0.6rem 0.7rem',
          fontSize: '0.88rem', color: 'var(--text)', fontFamily: 'inherit',
          lineHeight: 1.5,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.55rem' }}>
        {stream.id === 'referral' && (
          <select
            value={targetCompany}
            onChange={e => setTargetCompany(e.target.value)}
            aria-label="Target company"
            style={{
              flex: '1 1 180px', minWidth: 0,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm, 7px)', padding: '0.42rem 0.6rem',
              fontSize: '0.82rem', color: targetCompany ? 'var(--text)' : 'var(--text-muted)',
              fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            <option value="">Company (optional)</option>
            {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: stream.id === 'referral' ? 0 : 'auto' }}>
          {body.length}/{FEED_BODY_MAX}
        </span>

        <button
          onClick={onPost}
          disabled={posting || !body.trim()}
          style={{ ...primaryBtn, marginLeft: 'auto', opacity: (posting || !body.trim()) ? 0.55 : 1, cursor: (posting || !body.trim()) ? 'not-allowed' : 'pointer' }}
        >
          {posting ? 'Posting…' : 'Post'}
        </button>
      </div>

      {status !== 'idle' && (
        <div style={{
          fontSize: '0.74rem', marginTop: '0.5rem',
          color: status === 'invalid' ? 'var(--red, #dc2626)' : 'var(--text-muted)',
        }}>
          {status === 'invalid' && 'Write something first (1–' + FEED_BODY_MAX + ' characters).'}
          {status === 'migration-pending' && 'Posting is being set up — try again shortly.'}
          {status === 'no-backend' && 'Posting is not available right now.'}
          {status === 'error' && 'Could not post right now. Please try again.'}
        </div>
      )}
    </div>
  );
}

// ── Post card ────────────────────────────────────────────────────────────────

function PostCard({ post, index, upvoted, onUpvote, isMine }) {
  const [reported, setReported] = useState(false);
  const name = post.author_name || 'Analyst';
  const role = post.author_role;
  const company = post.author_company;

  async function handleReport() {
    if (reported) return;
    setReported(true);
    await reportPost(post.id);
  }

  return (
    <div
      className="pal-card-enter"
      style={{ ...cardStyle, animationDelay: (index * 0.03) + 's' }}
    >
      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
        {post.author_avatar ? (
          <img
            src={post.author_avatar}
            alt=""
            style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }}
          />
        ) : (
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)',
          }}>
            {(name[0] || '?').toUpperCase()}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </div>
          {(role || company) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.74rem', color: 'var(--text-muted)', minWidth: 0 }}>
              {company && <CompanyLogo company={company} size={14} />}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {role || ''}{role && company ? ' at ' : ''}{company || ''}
              </span>
            </div>
          )}
        </div>

        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>
          {timeAgo(post.created_at)}
        </span>
      </div>

      {/* Body */}
      <div style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {post.body}
      </div>

      {/* Target company chip (referrals) */}
      {post.target_company && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          marginTop: '0.65rem', padding: '0.2rem 0.5rem',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: '999px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600,
        }}>
          <CompanyLogo company={post.target_company} size={13} />
          {post.target_company}
        </div>
      )}

      {/* Footer: upvote + report */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
        <button
          onClick={onUpvote}
          aria-pressed={upvoted}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            background: upvoted ? 'var(--accent-bg)' : 'transparent',
            border: '1px solid ' + (upvoted ? 'var(--accent-border)' : 'var(--border)'),
            borderRadius: '999px', padding: '0.25rem 0.65rem',
            color: upvoted ? 'var(--accent)' : 'var(--text-muted)',
            fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.14s ease',
          }}
        >
          <Icon name="trending-up" size={13} color="currentColor" />
          {post.upvotes || 0}
        </button>

        {!isMine && (
          <button
            onClick={handleReport}
            disabled={reported}
            title={reported ? 'Reported' : 'Report this post'}
            style={{
              marginLeft: 'auto',
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              background: 'none', border: 'none', padding: '0.2rem 0.3rem',
              color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 500,
              cursor: reported ? 'default' : 'pointer', opacity: reported ? 0.6 : 0.7,
            }}
          >
            <Icon name="flag" size={12} color="currentColor" />
            {reported ? 'Reported' : 'Report'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── States ───────────────────────────────────────────────────────────────────

function EmptyState({ stream }) {
  return (
    <div style={{ ...cardStyle, textAlign: 'center', padding: '2.25rem 1.2rem' }}>
      <Icon name={stream.icon} size={26} color="var(--text-muted)" style={{ opacity: 0.6, marginBottom: '0.6rem' }} />
      <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        {stream.empty}
      </div>
    </div>
  );
}

function ComingSoon() {
  return (
    <div style={{ ...cardStyle, textAlign: 'center', padding: '2.5rem 1.2rem' }}>
      <Icon name="message-circle" size={28} color="var(--accent)" style={{ opacity: 0.7, marginBottom: '0.7rem' }} />
      <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text)', marginBottom: '0.35rem' }}>
        Community feed is coming soon
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '40ch', margin: '0 auto' }}>
        Referrals, questions, and wins from people prepping alongside you. Check back shortly.
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <>
      {[0, 1, 2].map(i => (
        <div key={i} className="pal-shimmer-box" style={{ ...cardStyle, height: '110px' }} />
      ))}
    </>
  );
}

// ── Shared styles ────────────────────────────────────────────────────────────

const cardStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md, 10px)',
  padding: '0.95rem 1rem',
};

const primaryBtn = {
  background: 'var(--accent)', color: '#fff', border: 'none',
  borderRadius: 'var(--radius-sm, 7px)', padding: '0.45rem 1.1rem',
  fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', flexShrink: 0,
};
