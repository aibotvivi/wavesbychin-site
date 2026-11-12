#!/usr/bin/env node
// Writes one real, pre-rendered HTML page per route, plus sitemap.xml and robots.txt.
//
//   node scripts/build-pages.mjs                    # write the files
//   node scripts/build-pages.mjs --check            # exit 1 if any generated file is stale
//   node scripts/build-pages.mjs --base https://wavesbychin.com   # once a custom domain exists
//
// The copy lives in app.js. This runs app.js in a sandbox (no DOM), takes its render
// functions through the WBC_PRERENDER hook, and fills template.html for each page.
// Nothing here has dependencies beyond Node itself.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const CHECK = args.includes("--check");
const baseIdx = args.indexOf("--base");
// Canonical origin. Change with --base (or here) when the site moves to its own domain.
const ORIGIN = (baseIdx >= 0 ? args[baseIdx + 1] : "https://wavesbychin.com").replace(/\/+$/, "");
if (!/^https:\/\/[^\s]+$/.test(ORIGIN)) { console.error("--base must be an https:// URL"); process.exit(2); }

// Pages that exist but should stay out of search: placeholder content, not linked from nav.
const NOINDEX = new Set(["voice"]);

// ---------- load app.js render functions ----------

let site = null;
const ctx = { console, URL, URLSearchParams, Date, Math, JSON, Object, String, Number, Array };
ctx.window = ctx;
ctx.WBC_PRERENDER = (exported) => { site = exported; };
vm.createContext(ctx);
vm.runInContext(readFileSync(join(ROOT, "config.js"), "utf8"), ctx, { filename: "config.js" });
vm.runInContext(readFileSync(join(ROOT, "app.js"), "utf8"), ctx, { filename: "app.js" });
if (!site) { console.error("app.js did not call WBC_PRERENDER — is the hook still in place?"); process.exit(1); }

const { PAGES, TITLES, DESCRIPTIONS, ROUTES, PATHS, FAQ, EMAIL } = site;
const pages = [...new Set(Object.values(ROUTES))].filter((p) => PAGES[p]);

// ---------- helpers ----------

const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const text = (html) => html.replace(/<li>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const rel = (p) => (p === "about" ? "" : PATHS[p] + "/");          // path below the site root
const canonical = (p) => ORIGIN + "/" + rel(p);
const outFile = (p) => join(ROOT, rel(p), "index.html");
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;

const business = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": ORIGIN + "/#business",
  name: "Wavesbychin",
  description: "Sound healing, energy healing and breathwork, offered live in East London. Group sound baths, 1:1 sessions, corporate wellness and ceremonies.",
  url: ORIGIN + "/",
  image: ORIGIN + "/assets/og-bowls.jpg",
  logo: ORIGIN + "/assets/logo.png",
  email: EMAIL,
  sameAs: ["https://www.instagram.com/wavesbychin/"],
  areaServed: [{ "@type": "Place", name: "East London" }, { "@type": "City", name: "London" }],
  founder: { "@type": "Person", name: "Vivi" },
  knowsAbout: ["Sound healing", "Tibetan singing bowls", "Reiki", "Pranic Healing", "Breathwork"]
};

function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.flatMap((g) => g.items.filter(Boolean)).map((it) => ({
      "@type": "Question",
      name: text(it.q),
      acceptedAnswer: { "@type": "Answer", text: text(it.a) }
    }))
  };
}

function seoHead(p) {
  const lines = [
    `<title>${attr(TITLES[p])}</title>`,
    `<meta name="description" content="${attr(DESCRIPTIONS[p])}">`,
    NOINDEX.has(p) ? `<meta name="robots" content="noindex">` : `<link rel="canonical" href="${canonical(p)}">`,
    `<meta property="og:site_name" content="Wavesbychin">`,
    `<meta property="og:title" content="${attr(TITLES[p])}">`,
    `<meta property="og:description" content="${attr(DESCRIPTIONS[p])}">`,
    `<meta property="og:url" content="${canonical(p)}">`,
    `<meta property="og:locale" content="en_GB">`
  ];
  if (p === "about" || p === "home") lines.push(ld(business));
  if (p === "faq") lines.push(ld(faqSchema()));
  if (p !== "about") {
    lines.push(ld({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Wavesbychin", item: ORIGIN + "/" },
        { "@type": "ListItem", position: 2, name: TITLES[p].replace(/ — Wavesbychin$/, ""), item: canonical(p) }
      ]
    }));
  }
  return lines.join("\n");
}

// ---------- build ----------

const template = readFileSync(join(ROOT, "template.html"), "utf8");
const out = new Map(); // absolute path -> contents

for (const p of pages) {
  let html = template
    .replace(/<!-- Template for every page\.[\s\S]*?-->/, "<!-- GENERATED by scripts/build-pages.mjs from template.html + app.js. Do not edit; edit those and rebuild. -->")
    .replace("<!--BASE-->", p === "about" ? "" : '<base href="../">')
    .replace("<!--SEO-->", seoHead(p))
    .replace("<!--MAIN-->", PAGES[p]())
    .replaceAll("{{PAGE}}", p)
    .replaceAll("{{ORIGIN}}", ORIGIN);
  // Mark the current nav item, as render() does in the browser.
  html = html.replace(new RegExp(`class="nav__item" (href="[^"]*") data-nav="${p}"`), 'class="nav__item is-active" $1 data-nav="' + p + '" aria-current="page"');
  html = html.replace(/^\n/m, "");
  if (/{{|<!--(BASE|SEO|MAIN)-->/.test(html)) { console.error(`unfilled placeholder in ${p}`); process.exit(1); }
  out.set(outFile(p), html);
}

const indexable = pages.filter((p) => !NOINDEX.has(p));
out.set(join(ROOT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  indexable.map((p) => `  <url><loc>${canonical(p)}</loc></url>`).join("\n") + `\n</urlset>\n`);
// Crawlers only read robots.txt at a domain's root, so on github.io/wavesbychin-site/ this
// file is inert. It starts working the day the site moves to its own domain.
out.set(join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);

// ---------- write or check ----------

const stale = [];
for (const [file, contents] of out) {
  const current = existsSync(file) ? readFileSync(file, "utf8") : null;
  if (current === contents) continue;
  stale.push(file.slice(ROOT.length + 1));
  if (!CHECK) { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, contents); }
}

if (CHECK) {
  if (stale.length) { console.error("Stale generated files — run node scripts/build-pages.mjs:\n  " + stale.join("\n  ")); process.exit(1); }
  console.log(`OK: ${out.size} generated files are current (${ORIGIN})`);
} else {
  console.log(`Built ${pages.length} pages for ${ORIGIN}` + (stale.length ? `; wrote ${stale.join(", ")}` : "; nothing changed"));
}
