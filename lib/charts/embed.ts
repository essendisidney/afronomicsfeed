import { chartAnchor } from "@/lib/charts/receipt-charts";
import { formatChartValue, renderChartSvg } from "@/lib/charts/render";
import { receiptEvidence, type Receipt } from "@/lib/receipts";
import { asOfLabel } from "@/components/evidence/EvidenceTag";
import { site } from "@/lib/site";

/**
 * One Receipt chart as a small self-contained page for an <iframe> (/embed/chart/<slug>/<n>): the title that states
 * the finding, the unit, the same SVG the Receipt shows (lib/charts/render.ts), and the source with a link back.
 * No site chrome, no framework script: a few lines of inline script give the same hover, tap and keyboard values as
 * the site. Colours are the site's tokens, light or dark with the reader's setting. Never indexed (meta and header).
 */

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const light = "--surface:#ffffff;--ink:#121826;--ink-soft:#3b4354;--muted:#636b7d;--rule:#d9dcd7;--brand-accent:#5b3fd6;--chart-quiet:#8b93a3;";
const dark = "--surface:#111a2e;--ink:#e9ebf0;--ink-soft:#c3c8d4;--muted:#8b93a7;--rule:#243049;--brand-accent:#a08cff;--chart-quiet:#6b7590;";

/** Tooltip for the embed: the same behaviour as components/charts/ChartTips.tsx, without React. */
const SCRIPT = `(function(){var b=document.querySelector('.c'),s=b.querySelector('svg'),t=document.getElementById('tip'),a=null,pts=[].slice.call(s.querySelectorAll('.chart-pt'));
function show(g){if(a)a.classList.remove('is-active');a=g;g.classList.add('is-active');var k=s.getBoundingClientRect().width/s.viewBox.baseVal.width;
t.innerHTML='<span class="tl"></span><b></b><span class="tu"></span>';t.children[0].textContent=g.dataset.label;t.children[1].textContent=g.dataset.value;t.children[2].textContent=t.dataset.unit;
t.style.visibility='hidden';t.hidden=false;var w=t.offsetWidth,h=t.offsetHeight,x=Math.min(Math.max(0,g.dataset.cx*k-w/2),Math.max(0,b.clientWidth-w)),y=g.dataset.top*k-24-h;
t.style.left=x+'px';t.style.top=(y>=-8?y:g.dataset.top*k+8)+'px';t.style.visibility='visible'}
function hide(){if(a)a.classList.remove('is-active');a=null;t.hidden=true}
function at(e){return e.target&&e.target.closest?e.target.closest('.chart-pt'):null}
s.addEventListener('pointerover',function(e){var g=at(e);if(e.pointerType==='mouse'&&g)show(g)});
s.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse')hide()});
s.addEventListener('pointerdown',function(e){var g=at(e);if(e.pointerType!=='mouse'&&g)show(g)});
document.addEventListener('pointerdown',function(e){if(!b.contains(e.target))hide()});
s.addEventListener('focusin',function(e){var g=at(e);if(g)show(g)});
s.addEventListener('focusout',function(e){if(!b.contains(e.relatedTarget))hide()});
s.addEventListener('keydown',function(e){if(e.key==='Escape')return hide();var i=pts.indexOf(at(e)),n=pts[i+(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:NaN)];if(i>=0&&n){e.preventDefault();n.focus()}});
try{navigator.sendBeacon('/api/hit',JSON.stringify({path:location.pathname,referrer:document.referrer}))}catch(e){}})();`;

export function chartEmbedHtml(r: Receipt, n: number): string | null {
  const chart = r.charts[n - 1];
  if (!chart) return null;
  const ev = receiptEvidence(r, chart.source);
  const { svg } = renderChartSvg(chart, { label: `${chart.title}. ${chart.unit}.`, interactive: true });
  const back = `${site.url}/receipts/${r.slug}?utm_source=embed&utm_medium=chart&utm_campaign=${encodeURIComponent(r.slug)}#${chartAnchor(n)}`;
  const rows = chart.data.map((d) => `<tr><th scope="row">${esc(d.label)}</th><td>${esc(formatChartValue(d.value, chart.unit))}</td></tr>`).join("");
  const notes = (chart.annotations ?? []).map((a) => `<li>${esc("x" in a ? `${a.x}: ${a.label}` : `${a.from} to ${a.to}: ${a.label}`)}</li>`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(chart.title)} — ${site.name}</title><meta name="robots" content="noindex"><link rel="canonical" href="${site.url}/receipts/${r.slug}">
<style>:root{${light}}@media (prefers-color-scheme:dark){:root{${dark}}}
*{box-sizing:border-box}html,body{margin:0;background:var(--surface);color:var(--ink);font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.w{border:1px solid var(--rule);padding:14px 14px 10px;min-height:100vh}
h1{margin:0;font:700 17px/1.3 Georgia,"Times New Roman",serif;letter-spacing:-.01em;text-wrap:balance}.u{margin:3px 0 0;font-size:12px;color:var(--muted)}
.c{position:relative;margin-top:10px}.chart-svg .chart-pt{cursor:pointer;outline:none}.chart-svg .chart-pt:focus-visible .chart-bar,.chart-svg .chart-pt.is-active .chart-bar{stroke:var(--ink);stroke-width:2}
.tabular{font-variant-numeric:tabular-nums}
#tip{position:absolute;pointer-events:none;max-width:14rem;background:var(--surface);border:1px solid var(--rule);border-radius:8px;padding:5px 9px;box-shadow:0 4px 12px rgba(0,0,0,.15);font-size:12px;line-height:1.35}
#tip b{display:block;font-size:15px;font-variant-numeric:tabular-nums}#tip .tl{display:block;color:var(--muted)}#tip .tu{display:block;color:var(--ink-soft)}
.f{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 10px;margin-top:8px;padding-top:8px;border-top:1px solid var(--rule);font-size:11px;color:var(--muted)}
.f a{color:var(--brand-accent);font-weight:600;text-decoration:none}.f a:hover{text-decoration:underline}.f .s a{color:inherit;font-weight:400;text-decoration:underline}
.sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
</style></head><body><div class="w">
<h1>${esc(chart.title)}</h1><p class="u">${esc(chart.unit)}</p>
<div class="c">${svg}<div id="tip" aria-hidden="true" data-unit="${esc(chart.unit)}" hidden></div></div>
<div class="sr"><table><caption>${esc(chart.title)}</caption><thead><tr><th scope="col">Item</th><th scope="col">${esc(chart.unit)}</th></tr></thead><tbody>${rows}</tbody></table>${notes ? `<ul aria-label="Notes on the chart">${notes}</ul>` : ""}</div>
<div class="f"><span class="s">Source: ${ev ? `<a href="${esc(ev.href)}" target="_blank" rel="noopener">${esc(ev.source)}</a>, ${esc(asOfLabel(ev.asOf))}` : esc(chart.source)}. Information, not advice.</span><a href="${esc(back)}" target="_blank" rel="noopener">Afronomics Receipt ↗</a></div>
</div><script>${SCRIPT}</script></body></html>`;
}
