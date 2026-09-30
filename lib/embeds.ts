import { currencyName, formatFx, loadFxQuote, pairHref, tapeCodes } from "@/lib/data/fx";
import { latestByTenor, loadTbills, tenorLabel, tenors } from "@/lib/data/kenya-tbills";
import { loadWire } from "@/lib/data/wire";
import { site } from "@/lib/site";

/**
 * Free embeddable widgets. Each is a small self-contained HTML document served from /embed/<name>,
 * meant for an <iframe>. Attribution and a link back to the source page are part of the widget.
 */

export type Theme = "light" | "dark" | "auto";

export const widgets = [
  { slug: "kenya-tbills", name: "Kenya T-bill rates", height: 250, detail: "Latest 91-, 182- and 364-day auction rates with the change on the previous auction." },
  { slug: "fx", name: "African currencies vs the dollar", height: 400, detail: "Daily mid-market reference for up to 12 African currencies. Choose them with ?codes=KES,NGN,ZAR." },
  { slug: "headlines", name: "Africa business headlines", height: 420, detail: "The latest headlines from African business publishers, filterable by country with ?country=KE." },
] as const;

export type WidgetSlug = (typeof widgets)[number]["slug"];

const esc = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const utm = (path: string, widget: string) => `${site.url}${path}${path.includes("?") ? "&" : "?"}utm_source=embed&utm_medium=widget&utm_campaign=${widget}`;

const light = "--bg:#ffffff;--bg2:#f4f1ea;--ink:#1c2433;--soft:#3d4656;--muted:#6a7384;--rule:#e2ddd2;--accent:#1e3a5f;--up:#1b7a55;--down:#a51d32;";
const dark = "--bg:#141820;--bg2:#1b202a;--ink:#e8e4db;--soft:#c4bfb4;--muted:#8e887c;--rule:#2f3542;--accent:#b8c4d4;--up:#3cc28e;--down:#e0707c;";

function page(title: string, body: string, theme: Theme, widget: string, sourceNote: string, sourcePath: string) {
  const vars = theme === "dark" ? `:root{${dark}}` : theme === "light" ? `:root{${light}}` : `:root{${light}}@media (prefers-color-scheme:dark){:root{${dark}}}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} — ${site.name}</title><meta name="robots" content="noindex">
<style>${vars}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.w{border:1px solid var(--rule);padding:12px 14px 10px;min-height:100vh}
.h{display:flex;justify-content:space-between;align-items:baseline;gap:8px;border-bottom:1px solid var(--rule);padding-bottom:6px;margin-bottom:6px}
.t{font:600 13px/1.2 Georgia,"Times New Roman",serif;letter-spacing:-.01em}.k{font:600 9px/1 ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase;letter-spacing:.14em;color:var(--muted)}
table{width:100%;border-collapse:collapse}td{padding:5px 0;border-bottom:1px solid var(--rule)}tr:last-child td{border-bottom:0}
.n{text-align:right;font:500 13px ui-monospace,Menlo,Consolas,monospace}.s{font-size:11px;color:var(--muted)}.up{color:var(--up)}.down{color:var(--down)}
a{color:inherit;text-decoration:none}a:hover{text-decoration:underline}
.big{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--rule);margin:8px 0}.big div{background:var(--bg2);padding:10px}
.big b{display:block;font:500 22px/1.1 Georgia,serif;margin-top:4px}
ul{list-style:none;margin:0;padding:0}li{padding:7px 0;border-bottom:1px solid var(--rule)}li:last-child{border-bottom:0}
.f{display:flex;justify-content:space-between;gap:8px;margin-top:8px;font-size:10px;color:var(--muted)}.f a{color:var(--accent);font-weight:600}
</style></head><body><div class="w">${body}
<div class="f"><span>${sourceNote}</span><a href="${esc(utm(sourcePath, widget))}" target="_blank" rel="noopener">${site.name} ↗</a></div>
</div></body></html>`;
}

const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function tbillsWidget(theme: Theme) {
  const latest = latestByTenor(loadTbills().rows);
  if (latest.size === 0) return null;
  const date = latest.get(91)?.latest.value_date ?? [...latest.values()][0].latest.value_date;
  const cells = tenors
    .map((tenor) => {
      const item = latest.get(tenor);
      if (!item) return "";
      const bps = item.previous ? Math.round((item.latest.weighted_avg_rate - item.previous.weighted_avg_rate) * 100) : null;
      const cls = bps == null || bps === 0 ? "" : bps > 0 ? "down" : "up";
      const text = bps == null ? "" : `${bps > 0 ? "+" : bps < 0 ? "−" : "±"}${Math.abs(bps)} bps`;
      return `<div><span class="k">${tenorLabel[tenor]}</span><b>${item.latest.weighted_avg_rate.toFixed(3)}%</b><span class="s ${cls}">${text}</span></div>`;
    })
    .join("");
  const body = `<div class="h"><span class="t">Kenya Treasury bill auction</span><span class="k">${shortDate.format(new Date(date))}</span></div>
<div class="big">${cells}</div><div class="s">Weighted average rate of accepted bids; change on the previous auction.</div>`;
  return page("Kenya T-bill rates", body, theme, "kenya-tbills", "Source: Central Bank of Kenya", "/markets/kenya-tbills");
}

async function fxWidget(theme: Theme, codesParam: string | null) {
  const quote = await loadFxQuote();
  if (!quote) return null;
  const wanted = (codesParam ? codesParam.split(",") : [...tapeCodes])
    .map((code) => code.trim().toUpperCase())
    .filter((code, i, all) => /^[A-Z]{3}$/.test(code) && code !== "USD" && all.indexOf(code) === i && quote.rates[code] != null)
    .slice(0, 12);
  if (wanted.length === 0) return null;
  const rows = wanted
    .map((code) => `<tr><td><a href="${esc(utm(pairHref(code), "fx"))}" target="_blank" rel="noopener">USD/${code}</a> <span class="s">${esc(currencyName(code))}</span></td><td class="n">${formatFx(quote.rates[code])}</td></tr>`)
    .join("");
  const updated = quote.updated.replace(/ \d{2}:\d{2}:\d{2} \+0000$/, "");
  const body = `<div class="h"><span class="t">African currencies per US dollar</span><span class="k">${esc(updated)}</span></div><table>${rows}</table>`;
  return page("African currencies", body, theme, "fx", "Mid-market reference: ExchangeRate-API", "/markets");
}

async function headlinesWidget(theme: Theme, country: string | null, now: number) {
  const iso = country?.trim().toUpperCase();
  const items = (await loadWire()).filter((item) => (iso && /^[A-Z]{2,3}$/.test(iso) ? item.countries.some((c) => c.iso === iso || c.iso.slice(0, 2) === iso) : true)).slice(0, 8);
  if (items.length === 0) return null;
  const ago = (iso: string) => {
    const h = Math.max(0, Math.round((now - Date.parse(iso)) / 3600000));
    return h < 1 ? "just now" : h < 48 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
  };
  const list = items
    .map((item) => `<li><a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.title)}</a><div class="s">${esc(item.publisher)} · ${ago(item.publishedAt)}</div></li>`)
    .join("");
  const where = iso ? items[0].countries.find((c) => c.iso === iso || c.iso.slice(0, 2) === iso)?.name : null;
  const body = `<div class="h"><span class="t">${where ? `${esc(where)} business headlines` : "Africa business headlines"}</span><span class="k">The Wire</span></div><ul>${list}</ul>`;
  return page("Africa business headlines", body, theme, "headlines", "Headlines link to their publishers", "/news");
}

export async function renderWidget(slug: string, params: URLSearchParams, now: number): Promise<string | null> {
  const themeParam = params.get("theme");
  const theme: Theme = themeParam === "dark" || themeParam === "light" ? themeParam : "auto";
  if (slug === "kenya-tbills") return tbillsWidget(theme);
  if (slug === "fx") return fxWidget(theme, params.get("codes"));
  if (slug === "headlines") return headlinesWidget(theme, params.get("country"), now);
  return null;
}

export function embedSnippet(slug: WidgetSlug, height: number, query = "") {
  return `<iframe src="${site.url}/embed/${slug}${query}" width="100%" height="${height}" style="border:0;max-width:520px" loading="lazy" title="${site.name} widget"></iframe>`;
}
