// ─── Hover/tap glossary highlighter (v2 — Glossary 2.0 / G0, 2026-07-22) ──
// Scans the rendered text of a Foundations module for defined glossary terms
// and wraps the FIRST occurrence of each term (per module render) in a
// `<span class="pal-glossary-term">`. Hovering (desktop) or tapping (mobile)
// that span pops up a short definition + a link back to the module it's
// fully taught in.
//
// WHY THIS APPROACH (unchanged from v1): PAL's foundation module content is
// NOT a shared data-string renderer — each of the 79 modules is its own
// bespoke React component with prose hardcoded as JSX (not a single string
// field run through a shared markdown/tokenizer). There is no single
// injection point to regex-tokenize a "content string" the way a shared
// renderer would allow. So this scans the ACTUAL RENDERED DOM inside
// `containerRef` (the same contentRef div FoundationRunnerShell already
// exposes to HighlightPopover) via a TreeWalker over text nodes, and does
// direct DOM surgery (Node.splitText + replaceChild) to wrap matches — no
// React re-render is involved in the wrapping itself, so it does not fight
// the component tree. This scan/wrap machinery is UNCHANGED by G0 — only
// the popover's interaction model and content below are upgraded.
//
// G0 UPGRADE (this pass):
// - Hover-intent: unchanged open-on-enter, but close delay is now 220ms
//   (was 150ms), matching the cross-lab G0 spec, cancelable by re-entering
//   the trigger span OR the popover itself (unchanged mechanism).
// - Click/tap now PINS the popover open (survives scroll + the close timer)
//   until Esc, an outside click/tap, or a second click on the same pinned
//   trigger. Previously click just re-ran the same hover-open logic with no
//   pin state.
// - Esc now always closes, even when pinned (new — v1 had no keydown
//   listener at all).
// - Outside click already closed the popover in v1, unconditionally — that
//   behavior is kept as-is (it already matched the "outside click always
//   closes, even when pinned" rule).
// - Scroll now closes the popover UNLESS it's pinned (new — v1 had no
//   scroll listener; a scrolled-away popover just sat there mispositioned).
// - See-more expansion, an optional `formula` box, and `seeAlso` chips (with
//   a back-stack) are now supported, gated strictly on optional
//   `entry.more` / `entry.formula` / `entry.seeAlso` fields. None of PAL's
//   current 19 glossary.js entries set these fields, so every entry today
//   renders byte-identical to the v1 popover (term, def, full-lesson link)
//   — this is forward-compatible plumbing for future G2 content, not a
//   behavior change yet.
// - Self-hide added: the "full lesson" link now hides when the term is
//   already being viewed inside the very module that teaches it in full
//   (`entry.sourceModuleId === moduleId`). This mirrors GSL's G0
//   `currentModuleId` self-hide. Unlike MSL (where wiring the equivalent
//   check would need a new prop threaded into a non-prop-drilled renderMd
//   call), GlossaryHighlighter already receives `moduleId` as a direct
//   prop from FoundationRunnerShell — no new plumbing needed, so this one
//   was safe to add outright rather than flag-and-skip.
//
// NAV — kept as-is, FLAGGED rather than switched (read this before "fixing"
// it): FoundationRunnerShell DOES receive and pass down a real, already-
// wired `onSelectModule(moduleId)` prop (verified: App.jsx wires
// openStatFoundationsModule / openRCAFoundationModule /
// openExpFoundationModule / openMetricsFoundationModule into the 4 family
// runners -> FoundationRunnerShell), so this is NOT the "prop isn't
// plumbed" situation MSL had. But `onSelectModule` as wired is SAME-FAMILY
// SCOPED — e.g. StatsFoundationsRunner's onSelectModule only knows how to
// open stats-foundations modules. GLOSSARY terms are matched globally
// across all 4 families against whatever text is on screen (e.g. a
// stats-foundations module's prose can easily contain "correlation", an
// exp-foundations term, or "decomposition", an rca-foundations term) — the
// existing sourceModuleId/family pairing on each entry is deliberately
// cross-family. Wiring the popover's link through onSelectModule would
// SILENTLY BREAK every cross-family "full lesson" link (the target
// runner's onSelectModule has no way to open a module outside its own
// family). The pre-existing real `<a href="#/<family>/<sourceModuleId>">`
// approach already handles this correctly via PAL's global hash router
// (src/utils/hashRouting.js already listens for window.location.hash
// changes app-wide and opens the right family's module) — a REAL clickable
// link, not a label, and already correct for the cross-family case. Kept
// unchanged; flagged here per "FLAG beats guessing" since the assumed
// onSelectModule contract turned out to have a scope mismatch, not a
// missing-prop problem.

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { GLOSSARY } from '../../data/glossary.js';

// Longest-key-first so multi-word terms ("north star metric") win over
// any single-word substring ("metric") that might also be a glossary key.
const GLOSSARY_KEYS = Object.keys(GLOSSARY).sort(function (a, b) { return b.length - a.length; });

const COLLAPSED_WIDTH = 264;
const EXPANDED_WIDTH = 320;
const EXPANDED_MAX_HEIGHT = 320;
const CLOSE_DELAY_MS = 220;

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let stylesInjected = false;
function injectStylesOnce() {
  if (stylesInjected) return;
  stylesInjected = true;
  if (typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.setAttribute('data-pal-glossary-styles', 'true');
  style.textContent =
    '.pal-glossary-term{border-bottom:1px dashed var(--accent);cursor:help;}' +
    '.pal-glossary-term:hover,.pal-glossary-term:focus{background:var(--surface-2);outline:none;}';
  document.head.appendChild(style);
}

export function GlossaryHighlighter({ containerRef, moduleId }) {
  // React state drives rendering. Parallel refs exist ONLY because the
  // mouseenter/mouseleave/click handlers below are attached directly to
  // DOM spans (raw addEventListener, not JSX) inside a scan effect that
  // intentionally runs ONCE per module (re-scanning on every popover state
  // change would re-walk + re-wrap the DOM on every hover, which is the
  // exact double-wrap/detached-node risk the v1 header comment already
  // warns about). Those handlers are memoized once (useCallback + empty
  // deps) so they must read current values via refs, not via closed-over
  // state, or they'd act on stale data forever. Every state setter below
  // has a matching ref write right next to it for this reason.
  const [popover, setPopover] = useState(null);       // { key, rect } | null — the anchor span's identity + position
  const [displayedKey, setDisplayedKey] = useState(null); // which GLOSSARY key is currently shown (can differ from popover.key after a seeAlso hop)
  const [backStack, setBackStack] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [pos, setPos] = useState(null);

  const popoverRef = useRef(null);
  const displayedKeyRef = useRef(null);
  const backStackRef = useRef([]);
  const expandedRef = useRef(false);
  const pinnedRef = useRef(false);
  const hideTimer = useRef(null);
  const popoverHovered = useRef(false);

  const computePos = useCallback(function (rect, tall) {
    if (!rect) return;
    const width = tall ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
    const budget = tall ? EXPANDED_MAX_HEIGHT : 96;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 800;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
    const left = Math.min(Math.max(8, rect.left), Math.max(8, vw - width - 8));
    const spaceBelow = vh - (rect.top + rect.height + 8);
    if (spaceBelow < budget && rect.top > spaceBelow) {
      setPos({ placement: 'above', bottom: vh - rect.top + 8, left: left, width: width });
    } else {
      setPos({ placement: 'below', top: rect.top + rect.height + 8, left: left, width: width });
    }
  }, []);

  const closeNow = useCallback(function () {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    popoverRef.current = null; setPopover(null);
    displayedKeyRef.current = null; setDisplayedKey(null);
    backStackRef.current = []; setBackStack([]);
    expandedRef.current = false; setExpanded(false);
    pinnedRef.current = false; setPinned(false);
    setPos(null);
  }, []);

  const openFor = useCallback(function (span) {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    const key = span.getAttribute('data-glossary-key');
    const r = span.getBoundingClientRect();
    const rect = { top: r.top, left: r.left, width: r.width, height: r.height };
    const sameAnchor = popoverRef.current && popoverRef.current.key === key;
    popoverRef.current = { key: key, rect: rect };
    setPopover({ key: key, rect: rect });
    if (!sameAnchor) {
      displayedKeyRef.current = key; setDisplayedKey(key);
      backStackRef.current = []; setBackStack([]);
      expandedRef.current = false; setExpanded(false);
      computePos(rect, false);
    } else {
      computePos(rect, expandedRef.current);
    }
  }, [computePos]);

  const scheduleClose = useCallback(function () {
    if (pinnedRef.current) return; // pinned cards ignore the timer entirely
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(function () {
      if (popoverHovered.current || pinnedRef.current) return;
      closeNow();
    }, CLOSE_DELAY_MS);
  }, [closeNow]);

  const onClickSpan = useCallback(function (e, span) {
    e.stopPropagation();
    const key = span.getAttribute('data-glossary-key');
    const alreadyPinnedHere = pinnedRef.current && popoverRef.current && popoverRef.current.key === key;
    if (alreadyPinnedHere) {
      closeNow();
      return;
    }
    openFor(span);
    pinnedRef.current = true;
    setPinned(true);
  }, [openFor, closeNow]);

  // Global outside-click / Esc / scroll — registered once, always reads
  // fresh state via refs (see comment on the refs above), so no dep array
  // churn is needed here.
  useEffect(function () {
    function onOutside(e) {
      if (e.target && e.target.closest && e.target.closest('.pal-glossary-term, .pal-glossary-popover')) return;
      closeNow();
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') closeNow();
    }
    function onScroll() {
      if (!pinnedRef.current) closeNow();
    }
    document.addEventListener('click', onOutside);
    document.addEventListener('touchstart', onOutside);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, true);
    return function () {
      document.removeEventListener('click', onOutside);
      document.removeEventListener('touchstart', onOutside);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [closeNow]);

  useEffect(function () { return function () { if (hideTimer.current) clearTimeout(hideTimer.current); }; }, []);

  // Scan + wrap once per module (reset entirely when the module changes).
  // UNCHANGED from v1 except the three event handlers wired onto each span.
  useEffect(function () {
    injectStylesOnce();
    closeNow();
    const root = containerRef.current;
    if (!root) return undefined;

    const cleanupFns = [];

    function wrapMatches() {
      const found = {}; // term keys already wrapped this pass — first occurrence only
      let walker;
      try {
        walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
          acceptNode: function (node) {
            if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            const p = node.parentElement;
            if (!p) return NodeFilter.FILTER_REJECT;
            if (p.closest && p.closest('script, style, .pal-glossary-term')) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          },
        });
      } catch (e) { return; }

      const textNodes = [];
      let n;
      while ((n = walker.nextNode())) textNodes.push(n);

      textNodes.forEach(function (node) {
        if (!node.isConnected) return;
        for (let i = 0; i < GLOSSARY_KEYS.length; i++) {
          const key = GLOSSARY_KEYS[i];
          if (found[key]) continue;
          let re;
          try { re = new RegExp('\\b(' + escapeRegExp(key) + ')\\b', 'i'); } catch (e) { continue; }
          const m = re.exec(node.nodeValue);
          if (!m) continue;
          found[key] = true;
          try {
            const start = m.index;
            const end = start + m[0].length;
            const afterNode = node.splitText(start);   // node = text before match
            afterNode.splitText(end - start);           // afterNode = match text only now
            const span = document.createElement('span');
            span.className = 'pal-glossary-term';
            span.setAttribute('data-glossary-key', key);
            span.setAttribute('tabindex', '0');
            span.setAttribute('role', 'button');
            span.setAttribute('aria-label', 'Glossary: ' + key);
            span.textContent = afterNode.nodeValue;
            afterNode.parentNode.replaceChild(span, afterNode);

            const onEnter = function () { openFor(span); };
            const onLeave = function () { scheduleClose(); };
            const onFocus = function () { openFor(span); };
            const onBlur = function () { scheduleClose(); };
            const onClick = function (e) { onClickSpan(e, span); };
            span.addEventListener('mouseenter', onEnter);
            span.addEventListener('mouseleave', onLeave);
            span.addEventListener('focus', onFocus);
            span.addEventListener('blur', onBlur);
            span.addEventListener('click', onClick);
            cleanupFns.push(function () {
              span.removeEventListener('mouseenter', onEnter);
              span.removeEventListener('mouseleave', onLeave);
              span.removeEventListener('focus', onFocus);
              span.removeEventListener('blur', onBlur);
              span.removeEventListener('click', onClick);
            });
          } catch (e) {
            // Node was already mutated/detached (e.g. by a React re-render
            // racing this scan) — skip it, not fatal.
          }
          break; // move to next text node once this one has a match
        }
      });
    }

    // Defer to the next tick so the module's own content has painted first.
    const t = setTimeout(wrapMatches, 0);

    return function () {
      clearTimeout(t);
      cleanupFns.forEach(function (fn) { fn(); });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, containerRef, openFor, scheduleClose, onClickSpan]);

  function handleSeeAlsoClick(key) {
    const next = GLOSSARY[key];
    if (!next) return; // unresolvable seeAlso key — skip silently, same as GSL/MSL
    const prevKey = displayedKeyRef.current;
    const newStack = backStackRef.current.concat([prevKey]);
    backStackRef.current = newStack; setBackStack(newStack);
    displayedKeyRef.current = key; setDisplayedKey(key);
    computePos(popoverRef.current ? popoverRef.current.rect : null, true);
  }

  function handleBackClick() {
    const stack = backStackRef.current;
    if (!stack.length) return;
    const prevKey = stack[stack.length - 1];
    const newStack = stack.slice(0, -1);
    backStackRef.current = newStack; setBackStack(newStack);
    displayedKeyRef.current = prevKey; setDisplayedKey(prevKey);
    computePos(popoverRef.current ? popoverRef.current.rect : null, expandedRef.current);
  }

  function handleSeeMoreToggle() {
    const next = !expandedRef.current;
    expandedRef.current = next; setExpanded(next);
    computePos(popoverRef.current ? popoverRef.current.rect : null, next);
  }

  if (!popover || !displayedKey || !pos) return null;
  const entry = GLOSSARY[displayedKey];
  if (!entry) return null;

  const hasMore = Boolean(entry.more);
  const showPointer = entry.sourceModuleId !== moduleId;
  const canGoBack = backStack.length > 0;

  return createPortal(
    <div
      className='pal-glossary-popover'
      onMouseEnter={function () { popoverHovered.current = true; if (hideTimer.current) clearTimeout(hideTimer.current); }}
      onMouseLeave={function () { popoverHovered.current = false; scheduleClose(); }}
      style={{
        position: 'fixed',
        ...(pos.placement === 'above' ? { bottom: pos.bottom } : { top: pos.top }),
        left: pos.left,
        zIndex: 9999,
        width: pos.width,
        maxHeight: expanded ? EXPANDED_MAX_HEIGHT : undefined,
        overflowY: expanded ? 'auto' : undefined,
        boxSizing: 'border-box',
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        boxShadow: '0 10px 28px rgba(0,0,0,0.24)', padding: '0.75rem 0.85rem',
      }}
    >
      {canGoBack && (
        <button
          type='button'
          onClick={function (e) { e.stopPropagation(); handleBackClick(); }}
          style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          &#9668; back
        </button>
      )}

      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.35rem' }}>
        {entry.term}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: (!expanded && !hasMore) ? 0 : '0.55rem' }}>
        {entry.def}
      </div>

      {!expanded && hasMore && (
        <button
          type='button'
          onClick={function (e) { e.stopPropagation(); handleSeeMoreToggle(); }}
          style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          See more &#9662;
        </button>
      )}

      {/* Legacy entries (no `more`) render exactly as before G0 — def + the
          conditional Full-lesson link, nothing else. */}
      {!hasMore && showPointer && (
        <a
          href={'#/' + entry.family + '/' + entry.sourceModuleId}
          onClick={function () { closeNow(); }}
          style={{ display: 'block', marginTop: hasMore ? undefined : '0.55rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}
        >
          &rarr; Full lesson: {entry.moduleTitle}
        </a>
      )}

      {expanded && hasMore && (
        <>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '0.4rem' }}>{entry.more}</div>

          {entry.formula && (
            <div style={{
              marginTop: '0.5rem', fontSize: '0.72rem', fontFamily: 'monospace',
              color: 'var(--accent)', background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '0.3rem 0.5rem',
            }}>
              {entry.formula}
            </div>
          )}

          {Array.isArray(entry.seeAlso) && entry.seeAlso.length > 0 && (
            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {entry.seeAlso.map(function (key) {
                const seeEntry = GLOSSARY[key];
                if (!seeEntry) return null;
                return (
                  <button
                    key={key}
                    type='button'
                    onClick={function (e) { e.stopPropagation(); handleSeeAlsoClick(key); }}
                    style={{
                      fontSize: '0.68rem', padding: '0.15rem 0.4rem', borderRadius: '5px',
                      border: '1px solid var(--border)', background: 'var(--surface-2)',
                      color: 'var(--text-secondary)', cursor: 'pointer',
                    }}
                  >
                    {seeEntry.term}
                  </button>
                );
              })}
            </div>
          )}

          {showPointer && (
            <a
              href={'#/' + entry.family + '/' + entry.sourceModuleId}
              onClick={function () { closeNow(); }}
              style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}
            >
              Taught in: {entry.moduleTitle} &rarr;
            </a>
          )}
        </>
      )}
    </div>,
    document.body
  );
}
