// prerender-sitemap.js — regenerates public/sitemap.xml from:
//   1. the key static top-level app pages (hash routes)
//   2. every prerendered module page (public/modules/*.html)
//   3. every prerendered post page (public/posts/*.html)
//
// Must run AFTER prerender-modules.js and prerender-posts.js (it reads the
// URL lists those scripts write to scripts/.modules-urls.json /
// scripts/.posts-urls.json).

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");

const BASE_URL = process.env.SITE_BASE_URL || "https://experimentation-systems-lab.vercel.app";

function readUrls(file) {
  const p = join(__dirname, file);
  if (!existsSync(p)) return [];
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return [];
  }
}

const moduleUrls = readUrls(".modules-urls.json");
const postUrls   = readUrls(".posts-urls.json");

const today = new Date().toISOString().split("T")[0];

// Key top-level app pages (hash routes) — the SPA shell itself, still worth
// listing even though their inner content isn't crawlable.
const staticPaths = [
  "",
  "#/stats-foundations",
  "#/metrics-foundations",
  "#/rca-foundations",
  "#/exp-foundations",
  "#/stats",
  "#/metrics",
  "#/rca",
  "#/cases",
  "#/experimentation",
  "#/product-design",
  "#/full-loop",
  "#/prioritization",
  "#/behavioral",
  "#/estimation",
  "#/growth-analytics",
  "#/bi",
  "#/spot-the-flaw",
  "#/take-home",
  "#/instrumentation",
  "#/sql-lab",
  "#/blog",
  "#/playbook",
  "#/pricing",
  "#/company-tracks",
];

function urlEntry(loc, { priority = "0.7", changefreq = "weekly", lastmod = today } = {}) {
  return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

const staticEntries = staticPaths.map((p, idx) =>
  urlEntry(`${BASE_URL}/${p}`, { priority: idx === 0 ? "1.0" : "0.8", changefreq: "weekly" })
);

const moduleEntries = moduleUrls.map(u => urlEntry(u, { priority: "0.7", changefreq: "monthly" }));
const postEntries   = postUrls.map(u => urlEntry(u, { priority: "0.7", changefreq: "monthly" }));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries.join("\n")}
${moduleEntries.join("\n")}
${postEntries.join("\n")}
</urlset>
`;

writeFileSync(join(ROOT, "public", "sitemap.xml"), sitemap, "utf8");

console.log(`prerender-sitemap: ${staticEntries.length} static + ${moduleEntries.length} modules + ${postEntries.length} posts = ${staticEntries.length + moduleEntries.length + postEntries.length} URLs written to public/sitemap.xml`);
