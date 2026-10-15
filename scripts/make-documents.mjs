#!/usr/bin/env node
/**
 * Prints our documents to PDF in Chromium (docs/rebuild/phase-7e-r3-plan.md, PR 1), so a reader gets the same file on
 * every machine instead of whatever their browser's "Print" makes of the page.
 *
 *   node scripts/make-documents.mjs                                   # every public document, from the live site
 *   node scripts/make-documents.mjs --base http://127.0.0.1:3000      # from a local `next start`
 *   node scripts/make-documents.mjs --only committee-pack-sample
 *   node scripts/make-documents.mjs --url <private pack url> --name watch-pack --out <dir>   # one private document
 *   node scripts/make-documents.mjs --base http://127.0.0.1:3100 --out docs-check --data   # also save each dataset's
 *                                                      workbook to <out>/data, for tests/site/test_documents.py
 *
 * Public documents go to public/documents/<name>.pdf (A4); the three main documents also get <name>-letter.pdf (US
 * Letter) and keep an A4 copy under public/documents/archive/<document number>.pdf. The page itself (lib/documents/design.ts) carries
 * the document number and, for private documents, the client in <meta> tags; this script turns those into the running
 * header and footer. Afterwards scripts/document_meta.py sets the PDF's author, subject and keywords.
 */

import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

const MARKETS = ["nigeria", "ghana", "uganda", "tanzania", "egypt", "southafrica", "zambia", "malawi", "mozambique"];

/** name, path on the site, and whether a US Letter copy is made and an A4 copy archived under its document number. */
export const DOCUMENTS = [
  { name: "committee-pack-sample", path: "/pack/sample", main: true },
  { name: "index-release", path: "/markets/bill-index/release/document", main: true },
  { name: "watch-pack-sample", path: "/watch/sample", main: true },
  ...MARKETS.map((m) => ({ name: `committee-pack-${m}-sample`, path: `/pack/${m}/sample`, main: false })),
];

/** One dataset per download route: the workbook built from each is checked by tests/site/test_documents.py. */
export const DATASETS = [
  "/api/data/kenya-tbills",
  "/api/data/kenya-bonds",
  "/api/data/tbills/nigeria",
  "/api/data/bonds/zambia",
  "/api/data/kenya-mmf",
  "/api/data/kenya-mmf-sizes",
  "/api/registry",
];

function args() {
  const out = { base: "https://afronomicsfeed.com", out: path.join(root, "public", "documents"), only: null, url: null, name: null, data: false };
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const k = a[i].replace(/^--/, "");
    if (k === "data") out.data = true;
    else if (k in out) out[k] = a[++i];
  }
  return out;
}

async function saveWorkbooks(base, dir) {
  await mkdir(dir, { recursive: true });
  for (const route of DATASETS) {
    const res = await fetch(`${base}${route}?format=xlsx`);
    if (!res.ok) throw new Error(`${route}?format=xlsx answered ${res.status}`);
    const name = /filename="([^"]+)"/.exec(res.headers.get("content-disposition") ?? "")?.[1];
    if (!name || !/^afronomics_[a-z0-9-]+_\d{4}-\d{2}-\d{2}\.xlsx$/.test(name)) throw new Error(`${route}: file name ${name} does not follow the rule`);
    await writeFile(path.join(dir, name), Buffer.from(await res.arrayBuffer()));
    console.log(`${route}: ${name}`);
  }
}

async function loadChromium() {
  for (const name of ["@playwright/test", "playwright", "playwright-core"]) {
    try {
      const mod = await import(pathToFileURL(require.resolve(name)).href);
      return mod.chromium ?? mod.default?.chromium;
    } catch {
      /* try the next one */
    }
  }
  throw new Error("Playwright not found: run `npm ci` (it is a devDependency).");
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* Chromium draws these in the page margins with system fonts; sizes must be set explicitly. */
function header(series, privateFor) {
  return `<div style="width:100%;margin:0 18mm;display:flex;justify-content:space-between;font:7.5px Arial,Helvetica,sans-serif;color:#636b7d;letter-spacing:.4px;">
<span><b style="color:#121826;letter-spacing:1.6px;">AFRONOMICS</b>&nbsp;&nbsp;${esc(series)}</span>
<span>${privateFor ? `Prepared for ${esc(privateFor)}. Private.` : ""}</span></div>`;
}

function footer(number) {
  return `<div style="width:100%;margin:0 18mm;display:flex;justify-content:space-between;font:7.5px Arial,Helvetica,sans-serif;color:#636b7d;border-top:.5px solid #d9dcd7;padding-top:2mm;">
<span>Information, not advice.</span><span>${esc(number)}</span>
<span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`;
}

async function render(page, url) {
  const res = await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
  if (!res || res.status() !== 200) throw new Error(`${url} answered ${res?.status()}`);
  await page.evaluate(() => document.fonts.ready);
  const meta = await page.evaluate(() => {
    const get = (n) => document.querySelector(`meta[name="${n}"]`)?.getAttribute("content") ?? "";
    return { number: get("af-doc-number"), series: get("af-doc-series"), privateFor: get("af-doc-private"), title: document.title, subject: get("description") };
  });
  if (!meta.number) throw new Error(`${url} is not in the document design (no af-doc-number)`);
  await page.emulateMedia({ media: "print" });
  const pdf = (format) =>
    page.pdf({
      format,
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: true,
      headerTemplate: header(meta.series, meta.privateFor),
      footerTemplate: footer(meta.number),
      margin: { top: "20mm", bottom: "18mm", left: "18mm", right: "18mm" },
      tagged: true,
      outline: true,
    });
  return { meta, a4: await pdf("A4"), letter: await pdf("Letter") };
}

/** Author, subject and keywords (Chromium sets only the title); tags and bookmarks are kept. */
function stamp(file, meta) {
  execFileSync(process.env.PYTHON ?? "python3", [path.join(root, "scripts", "document_meta.py"), file, meta.title, meta.subject || meta.series, meta.number], { stdio: "inherit" });
}

async function main() {
  const o = args();
  const chromium = await loadChromium();
  const browser = await chromium.launch(process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : {});
  const page = await browser.newPage();
  const made = [];
  try {
    if (o.url) {
      if (!o.name || !/^[a-z0-9-]+$/.test(o.name)) throw new Error("--url needs --name (letters, digits, -)");
      await mkdir(o.out, { recursive: true });
      const { meta, a4 } = await render(page, o.url);
      const file = path.join(o.out, `${o.name}_${meta.number}.pdf`);
      await writeFile(file, a4);
      stamp(file, meta);
      made.push(file);
    } else {
      await mkdir(path.join(o.out, "archive"), { recursive: true });
      for (const d of DOCUMENTS.filter((x) => !o.only || x.name === o.only)) {
        const { meta, a4, letter } = await render(page, `${o.base}${d.path}`);
        const files = [[`${d.name}.pdf`, a4], ...(d.main ? [[`${d.name}-letter.pdf`, letter], [`archive/${meta.number}.pdf`, a4]] : [])];
        for (const [rel, bytes] of files) {
          await writeFile(path.join(o.out, rel), bytes);
          stamp(path.join(o.out, rel), meta);
          made.push(path.join(o.out, rel));
        }
        console.log(`${d.name}: ${meta.number}, ${(a4.length / 1024).toFixed(0)} KB`);
      }
    }
    if (o.data) await saveWorkbooks(o.base, path.join(o.out, "data"));
  } finally {
    await browser.close();
  }
  console.log(made.map((f) => path.relative(root, f)).join("\n"));
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
