import { brand, brandDark } from "@/lib/brand/card-style";
import { formatFigure, growth, institutions, kindLabels, latest, sourceName, type Figure, type Institution } from "@/lib/registry";
import { site } from "@/lib/site";
import { tierStats } from "@/lib/watch";

/**
 * The SACCO member widget (docs/rebuild/upgrade-U5-plan.md §3): a small box a SACCO puts on its own site, showing only
 * the figures SASRA published for that SACCO: licence status, size tier, and assets, deposits, loans and income with
 * the change on the year before. No ratio against SASRA's minimums, no tier median, no rank and no adjectives (D-028:
 * the registry and anything public show the regulator's figures with no grades). Every widget names its source and
 * date, says "Information, not advice." and keeps "Data: Afronomics".
 *
 * /embed/sacco/sample is a labelled demo: each figure is the median of SASRA's large tier, so it describes no SACCO.
 */

export const SACCO_WIDGET_HEIGHT = 380;
export const SAMPLE_SLUG = "sample";

const METRICS: [string, string][] = [
  ["assets", "Total assets"],
  ["deposits", "Deposits"],
  ["gross_loans", "Gross loans"],
  ["total_income", "Total income"],
];

const statusText: Record<string, string> = {
  licensed: "Licensed by SASRA",
  authorised: "Authorised by SASRA",
  restricted: "Licensed by SASRA, restricted to credit only",
  revoked: "Licence revoked by SASRA",
  expired: "SASRA authorisation expired",
};

type Row = { label: string; value: string; change: string; source: Figure | null };
export type SaccoWidget = {
  slug: string;
  name: string;
  kind: string;
  tier: string | null;
  licence: { text: string; year: number; source: string } | null;
  year: number | null;
  asOf: string | null;
  rows: Row[];
  sample: boolean;
};

const esc = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const pctChange = (v: number | null) => (v == null ? "" : `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(1)}%`);

/** The SACCOs a widget can be made for: any SACCO on SASRA's lists or in its annual report. */
export const widgetSaccos = () => institutions().filter((i) => i.kind.startsWith("sacco") && (i.licences.length > 0 || i.figures.length > 0));

function own(inst: Institution): SaccoWidget {
  const rows: Row[] = METRICS.flatMap(([metric, label]) => {
    const f = latest(inst, metric);
    if (!f) return [];
    const g = growth(inst, metric);
    return [{ label, value: formatFigure(f), change: g ? `${pctChange(g.pct)} on ${g.from.year}` : "", source: f }];
  });
  const year = rows.length ? Math.max(...rows.map((r) => r.source!.year)) : null;
  const asOf = rows.filter((r) => r.source!.year === year).map((r) => r.source!.asOf).sort().at(-1) ?? null;
  const l = inst.licences.at(-1);
  return {
    slug: inst.slug,
    name: inst.name,
    kind: kindLabels[inst.kind],
    tier: inst.tier,
    licence: l ? { text: statusText[l.status] ?? l.status, year: l.year, source: l.source } : null,
    year,
    asOf,
    rows: rows.filter((r) => r.source?.year === year),
    sample: false,
  };
}

function sample(): SaccoWidget | null {
  const large = institutions().filter((i) => i.kind === "sacco_dt" && i.tier === "large");
  const years = large.flatMap((i) => i.figures.filter((f) => f.metric === "assets").map((f) => f.year));
  if (!years.length) return null;
  const year = Math.max(...years);
  const rows: Row[] = METRICS.flatMap(([metric, label]) => {
    const t = tierStats("sacco_dt", "large", metric, year, "KES bn");
    if (t.median == null) return [];
    return [{ label, value: formatFigure({ value: t.median, unit: "KES bn" }), change: t.change == null ? "" : `${pctChange(t.change)} on ${year - 1}`, source: null }];
  });
  return {
    slug: SAMPLE_SLUG,
    name: "Demo SACCO (sample)",
    kind: kindLabels.sacco_dt,
    tier: "large",
    licence: null,
    year,
    asOf: `${year}-12-31`,
    rows,
    sample: true,
  };
}

export function saccoWidget(slug: string): SaccoWidget | null {
  if (slug === SAMPLE_SLUG) return sample();
  const inst = widgetSaccos().find((i) => i.slug === slug);
  return inst ? own(inst) : null;
}

const light = `--bg:${brand.surface};--ink:${brand.ink};--soft:${brand.inkSoft};--muted:${brand.muted};--rule:${brand.rule};--accent:${brand.lateriteInk};`;
const dark = `--bg:${brandDark.surface};--ink:${brandDark.ink};--soft:${brandDark.inkSoft};--muted:${brandDark.muted};--rule:${brandDark.rule};--accent:${brandDark.lateriteInk};`;

/** The widget as a self-contained HTML document for an <iframe>. It reports its height to the page that frames it. */
export function saccoWidgetHtml(w: SaccoWidget, themeParam: string | null): string {
  const theme = themeParam === "dark" || themeParam === "light" ? themeParam : "auto";
  const vars = theme === "dark" ? `:root{${dark}}` : theme === "light" ? `:root{${light}}` : `:root{${light}}@media (prefers-color-scheme:dark){:root{${dark}}}`;
  const back = `${site.url}${w.sample ? "/for-institutions/saccos" : `/registry/${w.slug}`}?utm_source=embed&utm_medium=widget&utm_campaign=sacco`;
  const kicker = [w.kind, w.tier ? `SASRA ${w.tier} tier` : null].filter(Boolean).join(" · ");
  const licence = w.licence
    ? `<p class="lic">${esc(w.licence.text)} <span class="m">(SASRA licensed list ${w.licence.year})</span></p>`
    : w.sample
      ? `<p class="lic">Sample: a demo SACCO. Each figure is the median of SASRA’s large tier, so it describes no SACCO.</p>`
      : "";
  const rows = w.rows
    .map((r) => `<tr><td>${esc(r.label)}</td><td class="n">${esc(r.value)}${r.change ? `<span class="c">${esc(r.change)}</span>` : ""}</td></tr>`)
    .join("");
  const first = w.rows.find((r) => r.source)?.source ?? null;
  const pages = [...new Set(w.rows.map((r) => r.source?.page).filter((p): p is number => p != null))];
  const source = w.sample
    ? `Source: SASRA Sacco Supervision Annual Report ${w.year}, medians worked out by Afronomics`
    : first
      ? `Source: <a href="${esc(first.source)}" target="_blank" rel="noopener">${esc(sourceName(first.source, first.report))}</a>${pages.length ? `, p. ${pages.join(", ")}` : ""}`
      : "Source: SASRA licensed list";
  const date = w.asOf ? `As at ${day.format(new Date(`${w.asOf}T00:00:00Z`))}` : "";
  const figures = rows
    ? `<p class="m">Figures SASRA published for the year to 31 Dec ${w.year}</p><table>${rows}</table>`
    : `<p class="m">SASRA’s latest annual report gives no figures for this SACCO.</p>`;
  const path = `/embed/sacco/${w.slug}`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(w.name)}: published figures — ${site.name}</title><meta name="robots" content="noindex">
<style>${vars}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.w{border:1px solid var(--rule);padding:12px 14px 10px}
.k{font:600 9px/1.3 ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);margin:0}
h1{font:600 17px/1.2 Georgia,"Times New Roman",serif;letter-spacing:-.01em;margin:4px 0 2px}
.lic{margin:0 0 8px;font-size:12px;color:var(--soft)}.m{font-size:11px;color:var(--muted);margin:0 0 4px}
table{width:100%;border-collapse:collapse;border-top:1px solid var(--rule)}td{padding:6px 0;border-bottom:1px solid var(--rule);vertical-align:top}
.n{text-align:right;font:500 13px ui-monospace,Menlo,Consolas,monospace}.c{display:block;font:400 11px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:var(--muted)}
a{color:inherit}.f{margin-top:8px;font-size:10px;line-height:1.45;color:var(--muted)}
.b{display:flex;justify-content:space-between;gap:8px;margin-top:4px}.b a{color:var(--accent);font-weight:600;text-decoration:none}.b a:hover{text-decoration:underline}
</style></head><body><div class="w">
<p class="k">${esc(kicker)}</p>
<h1>${esc(w.name)}</h1>
${licence}${figures}
<div class="f">${source}. ${esc(date)}${date ? "." : ""} ${w.sample ? "Change on the year: the median of the tier’s changes." : "Change on the year worked out by code from two published figures."}
<div class="b"><span>Information, not advice.</span><a href="${esc(back)}" target="_blank" rel="noopener">Data: ${site.name} ↗</a></div></div>
</div><script>
try{navigator.sendBeacon('/api/hit',JSON.stringify({path:${JSON.stringify(path)},referrer:document.referrer}))}catch(e){}
function af(){try{parent.postMessage({type:'afronomics:height',slug:${JSON.stringify(w.slug)},height:document.documentElement.scrollHeight},'*')}catch(e){}}
addEventListener('load',af);addEventListener('resize',af);af();
</script></body></html>`;
}

/** The iframe snippet for a SACCO's site. */
export function saccoIframe(slug: string) {
  return `<iframe src="${site.url}/embed/sacco/${slug}" width="100%" height="${SACCO_WIDGET_HEIGHT}" style="border:0;max-width:420px" loading="lazy" title="Our SACCO's published figures (${site.name})"></iframe>`;
}

/** The script snippet: the same widget, sized to its content. */
export function saccoScript(slug: string) {
  return `<div data-afronomics-sacco="${slug}"></div>\n<script src="${site.url}/widgets/sacco.js" async></script>`;
}
