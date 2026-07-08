// ─── Hover/tap glossary highlighter (v1) ──────────────────────────────────
// Scans the rendered text of a Foundations module for defined glossary terms
// and wraps the FIRST occurrence of each term (per module render) in a
// `<span class="pal-glossary-term">`. Hovering (desktop) or tapping (mobile)
// that span pops up a short definition + a link back to the module it's
// fully taught in.
//
// WHY THIS APPROACH: PAL's foundation module content is NOT a shared
// data-string renderer — each of the 79 modules is its own bespoke React
// component with prose hardcoded as JSX (not a single string field run
// through a shared markdown/tokenizer). There is no single injection point
// to regex-tokenize a "content string" the way a shared renderer would allow.
// So this scans the ACTUAL RENDERED DOM inside `containerRef` (the same
// contentRef div FoundationRunnerShell already exposes to HighlightPopover)
// via a TreeWalker over text nodes, and does direct DOM surgery
// (Node.splitText + replaceChild) to wrap matches — no React re-render is
// involved in the wrapping itself, so it does not fight the component tree.
//
// Scope / known limitations (v1, intentional):
// - Only the FIRST occurrence of each term is wrapped, and only once per
//   module (the effect keys off `moduleId`, mirroring the existing
//   `useEffect(() => setRecapMode(false), [module.id])` reset idiom already
//   in FoundationRunnerShell.jsx). It does NOT re-scan when the user toggles
//   Full module / Quick recap inside the same module — recap bullets are not
//   glossary-highlighted. Re-scanning on every content swap risked double-
//   wrapping/detached-node errors against React's own reconciliation of the
//   same subtree; scoping to "once per module" avoids that entirely.
// - Because the wrapping mutates real DOM nodes outside React's own render
//   pass, if a *specific paragraph* re-renders later due to internal module
//   state changes, React may replace that paragraph's text nodes and lose
//   the wrapping for that one term. This is a known, accepted v1 trade-off
//   (documented in the task report) — most module prose paragraphs are
//   static text with no state binding, so in practice this is rare.
//
// Navigation: the "→ Full lesson" pointer is a REAL clickable link, not a
// label. PAL's hash router (src/utils/hashRouting.js) already listens for
// `window.location.hash` changes globally (App.jsx's `hashchange` listener
// calls parseHash → the right `open<Family>FoundationModule(id)` function),
// so a plain `<a href="#/<family>/<moduleId>">` triggers real in-app
// navigation via the browser's own native same-page hash-link behavior —
// no new prop threading through the 4 runners was needed.

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { GLOSSARY } from '../../data/glossary.js';

// Longest-key-first so multi-word terms ("north star metric") win over
// any single-word substring ("metric") that might also be a glossary key.
const GLOSSARY_KEYS = Object.keys(GLOSSARY).sort(function (a, b) { return b.length - a.length; });

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
  const [popover, setPopover] = useState(null); // { key, rect: {top,left,width,height} }
  const hideTimer = useRef(null);
  const popoverHovered = useRef(false);

  const openFor = useCallback(function (span) {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    const key = span.getAttribute('data-glossary-key');
    const r = span.getBoundingClientRect();
    setPopover({ key: key, rect: { top: r.top, left: r.left, width: r.width, height: r.height } });
  }, []);

  const scheduleClose = useCallback(function () {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(function () {
      if (!popoverHovered.current) setPopover(null);
    }, 150);
  }, []);

  useEffect(function () {
    return function () { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);

  // Scan + wrap once per module (reset entirely when the module changes).
  useEffect(function () {
    injectStylesOnce();
    setPopover(null);
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
            const onClickSpan = function (e) { e.stopPropagation(); openFor(span); };
            span.addEventListener('mouseenter', onEnter);
            span.addEventListener('mouseleave', onLeave);
            span.addEventListener('focus', onEnter);
            span.addEventListener('blur', onLeave);
            span.addEventListener('click', onClickSpan);
            cleanupFns.push(function () {
              span.removeEventListener('mouseenter', onEnter);
              span.removeEventListener('mouseleave', onLeave);
              span.removeEventListener('focus', onEnter);
              span.removeEventListener('blur', onLeave);
              span.removeEventListener('click', onClickSpan);
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

    function onDocClick(e) {
      if (e.target && e.target.closest && e.target.closest('.pal-glossary-term, .pal-glossary-popover')) return;
      setPopover(null);
    }
    document.addEventListener('click', onDocClick);

    return function () {
      clearTimeout(t);
      document.removeEventListener('click', onDocClick);
      cleanupFns.forEach(function (fn) { fn(); });
    };
  }, [moduleId, containerRef, openFor, scheduleClose]);

  if (!popover) return null;
  const entry = GLOSSARY[popover.key];
  if (!entry) return null;

  const rect = popover.rect;
  const width = 280;
  const left = Math.min(Math.max(rect.left, 8), (typeof window !== 'undefined' ? window.innerWidth : 800) - width - 8);
  let top = rect.top + rect.height + 8;
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 900;
  if (top > viewportH - 150) top = Math.max(rect.top - 138, 8);

  return createPortal(
    <div
      className='pal-glossary-popover'
      onMouseEnter={function () { popoverHovered.current = true; if (hideTimer.current) clearTimeout(hideTimer.current); }}
      onMouseLeave={function () { popoverHovered.current = false; scheduleClose(); }}
      style={{
        position: 'fixed', top: top, left: left, width: width, zIndex: 9999,
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        boxShadow: '0 10px 28px rgba(0,0,0,0.24)', padding: '0.75rem 0.85rem', boxSizing: 'border-box',
      }}
    >
      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.35rem' }}>
        {entry.term}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.55rem' }}>
        {entry.def}
      </div>
      <a
        href={'#/' + entry.family + '/' + entry.sourceModuleId}
        onClick={function () { setPopover(null); }}
        style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}
      >
        → Full lesson: {entry.moduleTitle}
      </a>
    </div>,
    document.body
  );
}
