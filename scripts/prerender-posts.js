// prerender-posts.js — build-time static HTML generation for PAL Deep Dive posts
// Run before vite build: node scripts/prerender-posts.js
//
// Outputs:
//   public/posts/{postId}.html — one per Deep Dive post
//
// The POSTS data lives as `export const POSTS = [ ... ];` INSIDE
// src/pages/BlogBrowser.jsx, a React component file that also contains JSX —
// a plain vm eval of the whole file would fail. So this script isolates just
// the POSTS array literal (bracket-counting, quote-aware, from the `[` right
// after `export const POSTS =` to its matching `]`) and vm-evals only that
// slice. See genai-systems-lab/scripts/prerender-gt.js for the sibling
// reference implementation (there the data already lives in plain .js files,
// so no extraction step is needed).

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createContext, runInContext } from "vm";

const __dirname   = dirname(fileURLToPath(import.meta.url));
const ROOT        = join(__dirname, "..");
const OUT_DIR     = join(ROOT, "public", "posts");
const BLOG_SOURCE = join(ROOT, "src", "pages", "BlogBrowser.jsx");

const BASE_URL = process.env.SITE_BASE_URL || "https://experimentation-systems-lab.vercel.app";

// ── Extract the POSTS array literal out of the JSX file ─────────────────────

function extractPostsLiteral(src) {
  const marker = "export const POSTS = [";
  const startIdx = src.indexOf(marker);
  if (startIdx === -1) return null;

  // Bracket-count from the '[' (last char of the marker) to find the true
  // matching ']', quote-aware so brackets inside strings don't throw off
  // the depth count.
  let i = startIdx + marker.length - 1; // index of the opening '['
  let depth = 0;
  let inStr = null;
  let escNext = false;
  let endIdx = -1;

  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (escNext) { escNext = false; }
      else if (c === "\\") { escNext = true; }
      else if (c === inStr) { inStr = null; }
      continue;
    }
    if (c === "'" || c === '"' || c === "`") { inStr = c; continue; }
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }

  if (endIdx === -1) return null;
  return src.slice(startIdx, endIdx + 1) + ";"; // "export const POSTS = [ ... ];"
}

function evalPosts(filePath) {
  const src = readFileSync(filePath, "utf8");
  const literal = extractPostsLiteral(src);
  if (!literal) return null;

  const bare = literal.replace(/export\s+(const|let|var)\s+(\w+)/, "$2");
  const ctx = createContext({ console });
  runInContext(bare, ctx);
  return ctx.POSTS;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(str) {
  if (typeof str !== "string") return String(str ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(str, n) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n - 1).trimEnd() + "…" : str;
}

// ── Category → accent colour map (mirrors CATEGORY_CONFIG in BlogBrowser.jsx) ─

const CATEGORY_COLOR = {
  "Metrics":            { color: "#16a34a", bg: "#f0fdf4",              border: "#86efac" },
  "RCA":                { color: "#C97706", bg: "rgba(201,119,6,0.08)", border: "rgba(201,119,6,0.25)" },
  "Experimentation":    { color: "#2457D6", bg: "rgba(36,87,214,0.07)", border: "rgba(36,87,214,0.22)" },
  "Statistics":         { color: "#007C89", bg: "rgba(0,124,137,0.07)", border: "rgba(0,124,137,0.25)" },
  "Ambiguous Problems":  { color: "#6B3FA0", bg: "rgba(107,63,160,0.07)", border: "rgba(107,63,160,0.22)" },
  "GenAI Analytics":    { color: "#007C89", bg: "rgba(0,124,137,0.07)", border: "rgba(0,124,137,0.25)" },
  "Product Sense":      { color: "#1d4ed8", bg: "#eff6ff",              border: "#bfdbfe" },
  "SQL & Data":         { color: "#2457D6", bg: "rgba(36,87,214,0.07)", border: "rgba(36,87,214,0.22)" },
  "Career & Interview": { color: "#dc2626", bg: "#fef2f2",              border: "#fca5a5" },
  "Mental Models":      { color: "#6B3FA0", bg: "rgba(107,63,160,0.07)", border: "rgba(107,63,160,0.22)" },
};
const DEFAULT_COLOR = { color: "#2457D6", bg: "rgba(36,87,214,0.07)", border: "rgba(36,87,214,0.22)" };

// Room slug (post.room, e.g. 'metrics') → the room's browser hash segment
// (PAGE_TO_HASH in src/utils/hashRouting.js). Most rooms use the same
// string for both; a few practice rooms differ from their post.room value.
const ROOM_TO_HASH = {
  metrics: "metrics",
  rca: "rca",
  cases: "cases",
  stats: "stats",
  review: "review",
  estimation: "estimation",
  design: "design",
  "product-design": "product-design",
  "full-loop": "full-loop",
  prioritization: "prioritization",
  behavioral: "behavioral",
  "growth-analytics": "growth-analytics",
  challenges: "challenges",
  bi: "bi",
  "spot-the-flaw": "spot-the-flaw",
  "take-home": "take-home",
  instrumentation: "instrumentation",
  "sql-lab": "sql-lab",
};

// ── Block → HTML renderer ─────────────────────────────────────────────────────

function blockToHtml(block) {
  if (!block || typeof block !== "object") return "";
  const t = block.type || "text";

  switch (t) {
    case "text":
      return block.text ? `<p>${esc(block.text)}</p>` : "";
    case "heading":
      return block.text ? `<h2>${esc(block.text)}</h2>` : "";
    case "list": {
      const items = Array.isArray(block.items) ? block.items : [];
      return items.length ? `<ul>${items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>` : "";
    }
    case "example": {
      const label = block.label ? `<strong>${esc(block.label)}:</strong> ` : "";
      const text = (block.text || "").replace(/\n/g, "<br>");
      return `<blockquote class="example">${label}${text}</blockquote>`;
    }
    case "callout": {
      const label = block.label ? `<strong>${esc(block.label)}:</strong> ` : "";
      return `<blockquote class="callout">${label}${esc(block.text || "")}</blockquote>`;
    }
    case "cta": {
      const roomHash = ROOM_TO_HASH[block.room] || block.room || "";
      const href = roomHash ? `${BASE_URL}/#/${roomHash}` : `${BASE_URL}/#/blog`;
      return `<p><a class="inline-cta" href="${href}">${esc(block.label || "Practice this now →")}</a></p>`;
    }
    default:
      return block.text ? `<p>${esc(block.text)}</p>` : "";
  }
}

// ── HTML template ─────────────────────────────────────────────────────────────

function generateHtml(post) {
  const cfg      = CATEGORY_COLOR[post.category] || DEFAULT_COLOR;
  const color    = cfg.color;
  const pageUrl  = `${BASE_URL}/posts/${post.id}`;
  const appUrl   = `${BASE_URL}/#/blog/${post.id}`;
  const desc     = truncate(post.summary || "", 160);
  const readMin  = post.readMin ? `${post.readMin} min read` : "";
  const contentHtml = (post.content || []).map(blockToHtml).filter(Boolean).join("\n    ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: post.title,
    description: desc,
    url: pageUrl,
    articleSection: post.category || "Product Analytics",
    author: { "@type": "Organization", name: "Product Analytics Lab" },
    publisher: { "@type": "Organization", name: "Product Analytics Lab" },
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(post.title)} | Product Analytics Lab</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${pageUrl}">

  <!-- Open Graph -->
  <meta property="og:type"        content="article">
  <meta property="og:url"         content="${pageUrl}">
  <meta property="og:title"       content="${esc(post.title)} | Product Analytics Lab">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image"       content="${BASE_URL}/og-image.png">
  <meta property="og:site_name"   content="Product Analytics Lab">

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="${esc(post.title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image"       content="${BASE_URL}/og-image.png">

  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; }
    body {
      background: #F4EFE6;
      color: #141414;
      font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.7;
    }
    a { color: ${color}; text-decoration: none; }
    a:hover { text-decoration: underline; }

    .top-bar {
      background: #FFFCF4;
      border-bottom: 1px solid #DDD0BE;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .brand {
      font-size: 13px;
      font-weight: 700;
      font-family: 'IBM Plex Mono', monospace;
      color: #4A4036;
      letter-spacing: 0.03em;
    }
    .open-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      background: ${cfg.bg};
      border: 1px solid ${cfg.border};
      color: ${color};
      white-space: nowrap;
      cursor: pointer;
    }
    .open-btn:hover { opacity: 0.85; text-decoration: none; }

    .accent-bar { height: 3px; background: linear-gradient(90deg, transparent, ${color}cc 30%, ${color}cc 70%, transparent); }

    article {
      max-width: 720px;
      margin: 0 auto;
      padding: 48px 24px 80px;
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
    }
    .badge {
      font-size: 10px;
      font-family: 'IBM Plex Mono', monospace;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: ${cfg.bg};
      border: 1px solid ${cfg.border};
      color: ${color};
    }
    .read-time {
      font-size: 11px;
      font-family: 'IBM Plex Mono', monospace;
      color: #9B8E80;
    }
    h1 {
      font-size: clamp(22px, 4vw, 32px);
      font-weight: 700;
      color: #141414;
      line-height: 1.25;
      margin-bottom: 12px;
      letter-spacing: -0.01em;
    }
    .desc {
      font-size: 15px;
      color: #4A4036;
      margin-bottom: 32px;
      line-height: 1.6;
      padding-bottom: 28px;
      border-bottom: 1px solid #DDD0BE;
    }

    h2 { font-size: 19px; font-weight: 700; color: #141414; margin: 32px 0 12px; }
    p  { font-size: 15px; color: #2b2620; margin-bottom: 16px; }
    ul, ol { padding-left: 20px; margin-bottom: 16px; }
    li { font-size: 15px; color: #2b2620; margin-bottom: 8px; }
    strong { color: #141414; }

    blockquote {
      border-left: 3px solid ${color};
      background: #F8F1E5;
      border-radius: 0 8px 8px 0;
      padding: 14px 18px;
      margin: 20px 0;
      color: #2b2620;
      font-size: 14px;
    }
    blockquote.example { border-left-color: #9B8E80; }
    blockquote.callout { border-left-color: ${color}; }

    a.inline-cta {
      display: inline-block;
      margin: 8px 0 20px;
      padding: 9px 18px;
      border-radius: 8px;
      background: ${cfg.bg};
      border: 1px solid ${cfg.border};
      color: ${color};
      font-weight: 600;
      font-size: 14px;
    }
    a.inline-cta:hover { opacity: 0.85; text-decoration: none; }

    .cta-card {
      margin-top: 48px;
      padding: 28px;
      border-radius: 16px;
      background: ${cfg.bg};
      border: 1px solid ${cfg.border};
      text-align: center;
    }
    .cta-card h2 { margin: 0 0 8px; font-size: 18px; color: #141414; }
    .cta-card p { margin-bottom: 20px; font-size: 13px; color: #4A4036; }
    .cta-card a {
      display: inline-block;
      padding: 10px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      background: ${color};
      color: #fff;
    }
    .cta-card a:hover { opacity: 0.9; text-decoration: none; }

    footer {
      text-align: center;
      padding: 24px;
      font-size: 11px;
      font-family: 'IBM Plex Mono', monospace;
      color: #9B8E80;
      border-top: 1px solid #EDE5D5;
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <a href="${BASE_URL}" class="brand">Product Analytics Lab</a>
    <a href="${appUrl}" class="open-btn">Open interactive version →</a>
  </div>
  <div class="accent-bar"></div>

  <article>
    <div class="meta">
      ${post.category ? `<span class="badge">${esc(post.category)}</span>` : ""}
      ${readMin ? `<span class="read-time">${esc(readMin)}</span>` : ""}
    </div>
    <h1>${esc(post.title)}</h1>
    ${post.summary ? `<p class="desc">${esc(post.summary)}</p>` : ""}

    ${contentHtml}

    <div class="cta-card">
      <h2>Try it interactively</h2>
      <p>Product Analytics Lab is an interactive judgment gym for data scientists and PMs — practice this exact scenario, not just read about it.</p>
      <a href="${appUrl}">Open Product Analytics Lab →</a>
    </div>
  </article>

  <footer>
    experimentation-systems-lab.vercel.app · Practice analytics judgment, not just theory
  </footer>
</body>
</html>`;
}

// ── Generate all pages ────────────────────────────────────────────────────────

mkdirSync(OUT_DIR, { recursive: true });

const raw = readFileSync(BLOG_SOURCE, "utf8");
const literal = extractPostsLiteral(raw);

let generated = 0;
const skippedIds = [];
const urls = [];

if (!literal) {
  console.error("prerender-posts: could not locate POSTS array literal in BlogBrowser.jsx — aborting, 0 pages written");
} else {
  let posts;
  try {
    const bare = literal.replace(/export\s+(const|let|var)\s+(\w+)/, "$2");
    const ctx = createContext({ console });
    runInContext(bare, ctx);
    posts = ctx.POSTS;
  } catch (err) {
    console.error("prerender-posts: vm eval of extracted POSTS literal failed —", err.message);
    posts = null;
  }

  if (!Array.isArray(posts)) {
    console.error("prerender-posts: extracted literal did not evaluate to an array — aborting, 0 pages written");
  } else {
    for (const post of posts) {
      try {
        if (!post || !post.id || !post.title || !Array.isArray(post.content) || post.content.length === 0) {
          skippedIds.push(post && post.id ? `${post.id} (no content)` : "(unknown, missing id/title)");
          continue;
        }
        const html = generateHtml(post);
        writeFileSync(join(OUT_DIR, `${post.id}.html`), html, "utf8");
        urls.push(`${BASE_URL}/posts/${post.id}`);
        generated++;
      } catch (err) {
        skippedIds.push(`${post && post.id} (render error: ${err.message})`);
      }
    }
  }
}

console.log(`prerender-posts: ${generated} pages written, ${skippedIds.length} skipped`);
if (skippedIds.length) {
  console.log("Skipped:", skippedIds.join(", "));
}

writeFileSync(join(__dirname, ".posts-urls.json"), JSON.stringify(urls), "utf8");
