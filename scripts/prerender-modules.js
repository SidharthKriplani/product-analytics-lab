// prerender-modules.js — build-time static HTML generation for PAL Foundations modules
// Run before vite build: node scripts/prerender-modules.js
//
// Outputs:
//   public/modules/{moduleId}.html — one per foundation module (SF/MF/EF/RCA)
//
// Reference implementation: genai-systems-lab/scripts/prerender-gt.js — same
// vm-eval-the-data-file approach, same static-HTML-per-item pattern, re-themed
// for PAL's light "casefile" palette (src/index.css) and re-pointed at PAL's
// real deep-link hash shape (src/utils/hashRouting.js).

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createContext, runInContext } from "vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");
const OUT_DIR   = join(ROOT, "public", "modules");

// productanalyticslab.com is the marketing/custom domain seen in the OLD
// sitemap.xml, but index.html's own <link rel="canonical"> declares the
// Vercel domain as the live app's identity — that's the one the app itself
// treats as authoritative, so it's what we mirror here.
const BASE_URL = process.env.SITE_BASE_URL || "https://experimentation-systems-lab.vercel.app";

// ── Load source data via vm (avoids JSX/Vite transform dependency) ──────────

function evalModule(filePath) {
  // Strip `export const/let/var NAME =` → bare `NAME =` so assignments
  // land on the vm context object (not block-scoped via const/let).
  const src = readFileSync(filePath, "utf8")
    .replace(/export\s+(const|let|var)\s+(\w+)/g, "$2");
  const ctx = createContext({ console });
  runInContext(src, ctx);
  return ctx;
}

// ── Family registry ──────────────────────────────────────────────────────────
// hashSlug values are taken verbatim from PAGE_TO_HASH in src/utils/hashRouting.js
// for 'stat-foundations-runner' / 'metrics-foundations-runner' / 'exp-foundations-runner'
// / 'rca-foundations-runner' — confirmed against RUNNER_ACTIVE_ID_KEY + App.jsx openers
// (openStatFoundationsModule / openMetricsFoundationModule / openExpFoundationModule /
// openRCAFoundationModule all take the module's own `id` field and set it as the activeId).

const FAMILIES = [
  {
    key: "stats",
    dataFile: "statsFoundationsModules.js",
    exportName: "statsFoundationsModules",
    hashSlug: "stats-foundations",
    label: "Stats Foundations",
    color: "#2457D6", // --accent
    colorBg: "rgba(36,87,214,0.07)",
    colorBorder: "rgba(36,87,214,0.22)",
  },
  {
    key: "metrics",
    dataFile: "metricsFoundationModules.js",
    exportName: "metricsFoundationModules",
    hashSlug: "metrics-foundations",
    label: "Metrics Foundations",
    color: "#16a34a", // --green
    colorBg: "#f0fdf4",
    colorBorder: "#86efac",
  },
  {
    key: "exp",
    dataFile: "expFoundationModules.js",
    exportName: "expFoundationModules",
    hashSlug: "exp-foundations",
    label: "Experimentation Foundations",
    color: "#6B3FA0", // --purple
    colorBg: "rgba(107,63,160,0.07)",
    colorBorder: "rgba(107,63,160,0.22)",
  },
  {
    key: "rca",
    dataFile: "rcaFoundationModules.js",
    exportName: "rcaFoundationModules",
    hashSlug: "rca-foundations",
    label: "RCA Foundations",
    color: "#007C89", // --teal
    colorBg: "rgba(0,124,137,0.07)",
    colorBorder: "rgba(0,124,137,0.25)",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(str) {
  if (typeof str !== "string") return String(str ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Minimal **bold** → <strong> markdown, matching PAL's own recap-rendering
// convention (FoundationRunnerShell.jsx renderRecapLine) — no markdown dep.
function mdBold(str) {
  const escaped = esc(str);
  return escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function truncate(str, n) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n - 1).trimEnd() + "…" : str;
}

// ── HTML template ─────────────────────────────────────────────────────────────

function generateHtml(mod, family) {
  const color      = family.color;
  const pageUrl    = `${BASE_URL}/modules/${mod.id}`;
  const appUrl     = `${BASE_URL}/#/${family.hashSlug}/${mod.id}`;
  const desc       = truncate(mod.subtitle || mod.keyInsight || "", 160);
  const readMin    = mod.estimatedMin ? `${mod.estimatedMin} min` : "";
  const difficulty = mod.difficulty || "";

  const recapHtml = Array.isArray(mod.recap) && mod.recap.length
    ? `<h2>Key takeaways</h2><ul>${mod.recap.map(r => `<li>${mdBold(r)}</li>`).join("")}</ul>`
    : "";

  const keyInsightHtml = mod.keyInsight
    ? `<p>${esc(mod.keyInsight)}</p>`
    : "";

  const connectionHtml = mod.connection
    ? `<div class="callout"><p><strong>How this connects to experimentation:</strong> ${esc(mod.connection)}</p></div>`
    : "";

  const tagsHtml = Array.isArray(mod.tags) && mod.tags.length
    ? `<div class="tags">${mod.tags.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>`
    : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: mod.title,
    description: desc,
    url: pageUrl,
    articleSection: family.label,
    author: { "@type": "Organization", name: "Product Analytics Lab" },
    publisher: { "@type": "Organization", name: "Product Analytics Lab" },
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(mod.title)} | ${esc(family.label)} | Product Analytics Lab</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${pageUrl}">

  <!-- Open Graph -->
  <meta property="og:type"        content="article">
  <meta property="og:url"         content="${pageUrl}">
  <meta property="og:title"       content="${esc(mod.title)} | Product Analytics Lab">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image"       content="${BASE_URL}/og-image.png">
  <meta property="og:site_name"   content="Product Analytics Lab">

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="${esc(mod.title)}">
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
      background: ${family.colorBg};
      border: 1px solid ${family.colorBorder};
      color: ${color};
      white-space: nowrap;
      cursor: pointer;
    }
    .open-btn:hover { background: ${family.colorBg}; text-decoration: none; opacity: 0.85; }

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
      background: ${family.colorBg};
      border: 1px solid ${family.colorBorder};
      color: ${color};
    }
    .badge.muted {
      background: #F8F1E5;
      border: 1px solid #EDE5D5;
      color: #756B60;
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

    .callout {
      background: #F8F1E5;
      border-left: 3px solid ${color};
      border-radius: 0 8px 8px 0;
      padding: 14px 18px;
      margin: 20px 0;
    }
    .callout p { margin-bottom: 0; color: #2b2620; }

    .tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 20px 0; }
    .tag {
      font-size: 11px;
      font-family: 'IBM Plex Mono', monospace;
      padding: 3px 9px;
      border-radius: 20px;
      background: #F8F1E5;
      border: 1px solid #EDE5D5;
      color: #756B60;
    }

    .cta-card {
      margin-top: 48px;
      padding: 28px;
      border-radius: 16px;
      background: ${family.colorBg};
      border: 1px solid ${family.colorBorder};
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
      <span class="badge">${esc(family.label)}</span>
      ${difficulty ? `<span class="badge muted">${esc(difficulty)}</span>` : ""}
      ${readMin ? `<span class="read-time">${esc(readMin)} read</span>` : ""}
    </div>
    <h1>${esc(mod.title)}</h1>
    ${mod.subtitle ? `<p class="desc">${esc(mod.subtitle)}</p>` : ""}

    ${keyInsightHtml}
    ${connectionHtml}
    ${recapHtml}
    ${tagsHtml}

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

let generated = 0;
let skipped   = 0;
const urls    = [];

for (const family of FAMILIES) {
  const ctx  = evalModule(join(ROOT, "src", "data", family.dataFile));
  const mods = ctx[family.exportName];

  if (!mods || !Array.isArray(mods)) {
    console.error(`Could not load ${family.exportName} from ${family.dataFile}`);
    continue;
  }

  for (const mod of mods) {
    if (!mod || !mod.id || !mod.title) {
      skipped++;
      continue;
    }
    const html = generateHtml(mod, family);
    writeFileSync(join(OUT_DIR, `${mod.id}.html`), html, "utf8");
    urls.push(`${BASE_URL}/modules/${mod.id}`);
    generated++;
  }
}

console.log(`prerender-modules: ${generated} pages written, ${skipped} skipped, families: ${FAMILIES.map(f => f.key).join(", ")}`);

// Export URLs list for the sitemap builder.
writeFileSync(join(__dirname, ".modules-urls.json"), JSON.stringify(urls), "utf8");
