import { site } from "@/lib/site";

/**
 * One design for every document we hand out (docs/rebuild/phase-7e-r3-plan.md, PR 1): the committee pack, the Watch
 * pack, the index release and their samples. Each is an HTML page that scripts/make-documents.mjs prints to PDF in
 * Chromium, so the file is the same on every machine.
 *
 * The page carries what the PDF needs in <meta> tags (document number, private client), which the script reads to
 * build the running header and footer: "Page 3 of 12", the document number and "Information, not advice" on every
 * page, and "Prepared for <institution>. Private." on private documents. Every chart and table is an exhibit with
 * its source and as-of line; tests/site/test_documents.py refuses a document where one is missing.
 */

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const longDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const docDate = (iso: string) => longDate.format(new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso));

type DocSource = { name: string; url?: string; note?: string };

export type DocMeta = {
  /** The series, set in small capitals above the title: "Investment Committee Pack". */
  series: string;
  title: string;
  subtitle?: string;
  /** For example AF-PACK-2026-10. */
  number: string;
  /** For example "October 2026" or "Week of 12 October 2026". */
  edition: string;
  /** YYYY-MM-DD: the date the newest figure in the document refers to. */
  asOf: string;
  /** A private document names its client on the cover and on every page. */
  preparedFor?: string;
  sample?: boolean;
  /** Section titles, in order; a contents page is added when the document runs past six pages. */
  sections: string[];
  method: string[];
  sources: DocSource[];
  licence: string;
  /** The page on the site this document belongs to, for the citation. */
  href: string;
  /** The printed file in public/documents, offered on screen above the document (never printed). */
  pdf?: string;
  /** Whether a US Letter copy is made too (the three main documents). */
  letter?: boolean;
};

/** A chart or table with its number, title, source and as-of line. */
export function exhibit(o: { title: string; body: string; source: string; asOf?: string; note?: string; wide?: boolean }) {
  return `<figure class="exhibit${o.wide ? " wide" : ""}">
<figcaption class="ex-title">${esc(o.title)}</figcaption>
${o.body}
${o.note ? `<p class="ex-note">${esc(o.note)}</p>` : ""}
<p class="src">Source: ${esc(o.source)}${o.asOf ? `. As of ${esc(docDate(o.asOf))}` : ""}.</p>
</figure>`;
}

/** A numbered section that starts on a new page; its heading becomes a PDF bookmark. */
export function section(n: number, title: string, body: string, opts: { aside?: string } = {}) {
  return `<section class="doc-section" id="s${n}">
<header class="sec-head"><h2><span class="sec-n">${n}</span>${esc(title)}</h2>${opts.aside ? `<span class="sec-aside">${esc(opts.aside)}</span>` : ""}</header>
${body}
</section>`;
}

function citation(meta: DocMeta) {
  const year = meta.asOf.slice(0, 4);
  return `Afronomics (${year}). ${meta.series}: ${meta.title}. ${meta.edition}. Document ${meta.number}. ${site.url.replace(/^https?:\/\//, "")}${meta.href}`;
}

function cover(meta: DocMeta) {
  const rows: [string, string][] = [
    ["Edition", meta.edition],
    ["Figures as of", docDate(meta.asOf)],
    ["Document", meta.number],
    ...(meta.preparedFor ? ([["Prepared for", meta.preparedFor]] as [string, string][]) : []),
  ];
  return `<section class="cover">
<div class="cover-bar"></div>
<div class="cover-top"><span class="wordmark">AFRONOMICS</span><span class="series">${esc(meta.series)}</span></div>
<div class="cover-main">
<h1>${esc(meta.title)}</h1>
${meta.subtitle ? `<p class="cover-sub">${esc(meta.subtitle)}</p>` : ""}
<dl class="cover-meta">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
</div>
<div class="cover-foot">
<p><strong>Information, not advice.</strong> Every figure is shown as its source published it, with the source and date beside it. Afronomics compiles and does not forecast in this document.</p>
<p>${meta.preparedFor ? `Prepared for ${esc(meta.preparedFor)}. Private: not for circulation outside the named institution.` : meta.sample ? "Sample edition, free to share with credit." : esc(meta.licence)}</p>
</div>
</section>`;
}

function contents(meta: DocMeta) {
  return `<section class="contents">
<h2 class="contents-h">Contents</h2>
<ol>${meta.sections.map((s, i) => `<li><span class="sec-n">${i + 1}</span><a href="#s${i + 1}">${esc(s)}</a></li>`).join("")}<li><span class="sec-n">·</span><a href="#method">Method, sources and how to cite</a></li></ol>
</section>`;
}

function closing(meta: DocMeta) {
  return `<section class="doc-section closing" id="method">
<header class="sec-head"><h2>Method, sources and how to cite</h2></header>
<h3>Method</h3>
${meta.method.map((p) => `<p>${esc(p)}</p>`).join("")}
<h3>Sources</h3>
<ol class="sources">${meta.sources.map((s) => `<li>${esc(s.name)}${s.note ? `, ${esc(s.note)}` : ""}${s.url ? `. <a href="${esc(s.url)}">${esc(s.url.replace(/^https?:\/\//, ""))}</a>` : ""}</li>`).join("")}</ol>
<h3>Licence</h3>
<p>${esc(meta.licence)}</p>
<h3>How to cite</h3>
<p class="cite">${esc(citation(meta))}</p>
<h3>Corrections</h3>
<p>If a figure here is wrong, write to ${esc(site.contactEmail)}. Corrections are listed at ${esc(site.url.replace(/^https?:\/\//, ""))}/corrections with the date and what changed.</p>
<p class="end-mark">Information, not advice. © Afronomics ${meta.asOf.slice(0, 4)}.</p>
</section>`;
}

/** The whole document: cover, contents (when long), the sections, then the closing page. */
export function documentHtml(meta: DocMeta, sectionsHtml: string, opts: { pages?: number } = {}) {
  const long = (opts.pages ?? meta.sections.length + 2) > 6;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${esc(`${meta.series}: ${meta.title}, ${meta.edition}`)}</title>
<meta name="robots" content="noindex">
<meta name="author" content="Afronomics">
<meta name="description" content="${esc(meta.subtitle ?? meta.title)}">
<meta name="af-doc-number" content="${esc(meta.number)}">
<meta name="af-doc-series" content="${esc(meta.series)}">
${meta.preparedFor ? `<meta name="af-doc-private" content="${esc(meta.preparedFor)}">` : ""}
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${documentCss}</style></head><body>
${meta.pdf ? `<nav class="doc-bar" aria-label="Download"><a href="/">Afronomics</a><span><a href="${esc(meta.pdf)}.pdf">Download PDF (A4)</a>${meta.letter ? ` · <a href="${esc(meta.pdf)}-letter.pdf">US Letter</a>` : ""}</span></nav>` : ""}
<main>
${cover(meta)}
${long ? contents(meta) : ""}
${sectionsHtml}
${closing(meta)}
</main>
</body></html>`;
}

/* Same type and colours as the site (app/globals.css): Source Serif 4 for headings, Archivo for text, the laterite
   accent (D-026), tabular figures. Print first; on screen the pages sit on a grey desk so the HTML reads like the PDF. */
const documentCss = `
/* Fixed-weight copies (scripts/document_fonts.py): Chromium embeds these as compact subsets, not drawn glyphs. */
@font-face { font-family: "AF Serif"; src: url("/fonts/doc/source-serif-4-600.woff2") format("woff2"); font-weight: 500 900; font-display: block; }
@font-face { font-family: "AF Sans"; src: url("/fonts/doc/archivo-400.woff2") format("woff2"); font-weight: 100 500; font-display: block; }
@font-face { font-family: "AF Sans"; src: url("/fonts/doc/archivo-600.woff2") format("woff2"); font-weight: 600; font-display: block; }
@font-face { font-family: "AF Sans"; src: url("/fonts/doc/archivo-700.woff2") format("woff2"); font-weight: 700; font-display: block; }
@font-face { font-family: "AF Sans"; src: url("/fonts/doc/archivo-800.woff2") format("woff2"); font-weight: 800 900; font-display: block; }
@page { size: A4; margin: 22mm 18mm 20mm; }
:root { --ink: #1d1512; --soft: #45372f; --muted: #6c5e55; --rule: #e0d6cd; --hair: #eee7e1; --accent: #b3401f; --navy: #a33a1c; --up: #0f7f57; --down: #c4263e; --wash: #f7f3ef; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; color: var(--ink); background: #fff; font: 400 10pt/1.5 "AF Sans", Arial, sans-serif; font-variant-numeric: tabular-nums; counter-reset: exhibit; }
h1, h2, h3 { font-family: "AF Serif", Georgia, serif; font-weight: 600; color: var(--ink); }
a { color: var(--navy); text-decoration: none; }
p { margin: 0 0 6pt; }
.cover { position: relative; min-height: 250mm; display: flex; flex-direction: column; padding: 0 0 0 12mm; break-after: page; }
.cover-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 3.2mm; background: var(--accent); }
.cover-top { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1.4pt solid var(--ink); padding-bottom: 3mm; }
.wordmark { font-weight: 800; letter-spacing: 2.4pt; font-size: 11pt; }
.series { font-size: 8pt; letter-spacing: 1.6pt; text-transform: uppercase; color: var(--accent); font-weight: 700; }
.cover-main { margin-top: 48mm; flex: 1; }
.cover h1 { font-size: 30pt; line-height: 1.08; letter-spacing: -0.4pt; margin: 0 0 6mm; max-width: 150mm; }
.cover-sub { font-size: 12.5pt; line-height: 1.45; color: var(--soft); max-width: 135mm; }
.cover-meta { margin: 16mm 0 0; display: grid; grid-template-columns: repeat(2, minmax(0, 60mm)); gap: 5mm 10mm; }
.cover-meta dt { font-size: 7.5pt; letter-spacing: 1.2pt; text-transform: uppercase; color: var(--muted); }
.cover-meta dd { margin: 1mm 0 0; font-weight: 600; font-size: 10.5pt; }
.cover-foot { border-top: 0.6pt solid var(--rule); padding-top: 4mm; font-size: 8pt; color: var(--muted); max-width: 160mm; }
.contents { break-after: page; padding-top: 6mm; }
.contents-h { font-size: 18pt; margin: 0 0 8mm; }
.contents ol { list-style: none; padding: 0; margin: 0; }
.contents li { display: flex; gap: 5mm; padding: 3.2mm 0; border-bottom: 0.6pt solid var(--hair); font-size: 11.5pt; }
.sec-n { color: var(--accent); font-weight: 700; min-width: 6mm; font-family: "AF Sans", Arial, sans-serif; }
.doc-section { break-before: page; }
.cover + .doc-section, .contents + .doc-section { break-before: auto; }
.sec-head { display: flex; justify-content: space-between; align-items: baseline; gap: 6mm; border-bottom: 1.4pt solid var(--ink); padding-bottom: 2mm; margin-bottom: 5mm; }
.sec-head h2 { font-size: 16pt; line-height: 1.2; margin: 0; display: flex; gap: 4mm; }
.sec-aside { font-size: 8pt; color: var(--muted); white-space: nowrap; }
h3 { font-size: 11.5pt; margin: 6mm 0 2mm; }
.lead { font-size: 11pt; line-height: 1.5; color: var(--soft); max-width: 160mm; margin-bottom: 5mm; }
.exhibit { margin: 0 0 7mm; break-inside: avoid; counter-increment: exhibit; }
.ex-title { font-weight: 700; font-size: 9.5pt; margin-bottom: 2.5mm; }
.ex-title::before { content: "Exhibit " counter(exhibit) ". "; color: var(--accent); }
.ex-note { font-size: 7.8pt; color: var(--muted); margin: 1.5mm 0 0; }
.src { font-size: 7.8pt; color: var(--muted); margin: 1.5mm 0 0; border-top: 0.6pt solid var(--hair); padding-top: 1.2mm; }
.grid2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8mm; }
table { width: 100%; border-collapse: collapse; font-size: 8.6pt; }
thead th { text-align: left; font-size: 7.4pt; letter-spacing: 0.4pt; text-transform: uppercase; color: var(--muted); font-weight: 600; padding: 1.6mm 2mm; border-bottom: 0.9pt solid var(--ink); }
tbody td { padding: 1.7mm 2mm; border-bottom: 0.5pt solid var(--hair); vertical-align: top; }
tbody tr:nth-child(even) td { background: #fafbfa; }
td.num, th.num { text-align: right; white-space: nowrap; }
tbody tr.me td { background: #f1edff; font-weight: 600; }
td.strong { font-weight: 700; }
.small { font-size: 7.6pt; } .muted { color: var(--muted); } .up { color: var(--up); } .down { color: var(--down); }
.kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 3mm; margin: 0 0 6mm; }
.kpi { border-top: 2pt solid var(--accent); background: var(--wash); padding: 3mm; }
.kpi b { display: block; font: 600 16pt/1.1 "AF Serif", Georgia, serif; }
.kpi span { font-size: 7.6pt; color: var(--soft); display: block; margin-top: 1mm; }
svg { max-width: 100%; height: auto; }
.closing h3 { margin-top: 5mm; }
.sources { padding-left: 5mm; font-size: 8.4pt; } .sources li { margin-bottom: 1.2mm; }
.cite { font-size: 9pt; background: var(--wash); border-left: 2pt solid var(--accent); padding: 3mm; }
.end-mark { margin-top: 10mm; font-size: 8pt; color: var(--muted); }
.doc-bar { display: none; }
@media screen {
  body { background: #e6e8e4; padding: 0 0 8mm; }
  .doc-bar { display: flex; justify-content: space-between; align-items: center; gap: 12px; position: sticky; top: 0; z-index: 1; background: #1d1512; color: #f7f3ef; padding: 10px 16px; margin-bottom: 8mm; font-size: 14px; }
  .doc-bar a { color: #f7f3ef; display: inline-flex; min-height: 44px; align-items: center; }
  .doc-bar span a { text-decoration: underline; text-underline-offset: 3px; }
  .cover, .contents, .doc-section { background: #fff; width: 210mm; max-width: calc(100% - 16px); margin: 0 auto 8mm; padding: 18mm; box-shadow: 0 10px 40px -24px rgba(0,0,0,.4); }
  .cover { padding-left: 24mm; min-height: 297mm; }
  .exhibit { overflow-x: auto; }
}
@media screen and (max-width: 640px) {
  body { font-size: 15px; }
  .cover, .contents, .doc-section { width: auto; max-width: none; margin: 0 0 12px; padding: 24px 16px; box-shadow: none; }
  .cover h1, .cover-sub, .cover-foot, .lead { max-width: none; }
  .cover { padding-left: 24px; min-height: 0; }
  .cover-bar { width: 6px; }
  .cover-top { flex-direction: column; gap: 4px; }
  .cover-main { margin-top: 40px; }
  .cover h1 { font-size: 30px; }
  .cover-sub { font-size: 16px; }
  .cover-meta { grid-template-columns: 1fr; gap: 12px; margin-top: 28px; }
  .cover-foot { margin-top: 28px; font-size: 12px; }
  .sec-head { flex-direction: column; align-items: flex-start; gap: 4px; }
  .sec-head h2 { font-size: 22px; }
  .grid2, .kpis { grid-template-columns: 1fr; }
  table { font-size: 12px; }
  .ex-note, .src, .small { font-size: 11px; }
}
`;
