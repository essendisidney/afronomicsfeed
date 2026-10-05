import { renderTime } from "@/lib/data/fetcher";
import { auctionCalendar } from "@/lib/data/bill-measures";
import { billIndexLatest, indexShort } from "@/lib/data/bill-index";
import { billMarkets, latestBills, loadBillMarket } from "@/lib/data/sovereign-bills";
import { buildMorningNote, morningLines, morningLongDate, morningSigned } from "@/lib/editions/morning";
import { morningLinesSw } from "@/lib/editions/morning-sw";
import { buildMoneyDoors } from "@/lib/editions/money-today";

export const revalidate = 900;

/**
 * The low-data Afronomics: the Morning, every market's latest bills, the index and what is due, as one
 * HTML page under 10 KB with no fonts, scripts or images. For a 2G connection, a feature phone browser, or
 * anyone paying per megabyte.
 */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function GET(request: Request) {
  const sw = new URL(request.url).searchParams.get("lang") === "sw";
  const now = renderTime();
  const note = await buildMorningNote(now);
  const lines = sw ? morningLinesSw(note) : morningLines(note);
  const index = billIndexLatest();
  const due = auctionCalendar(new Date(now)).slice(0, 5);
  const today = await buildMoneyDoors(sw ? "sw" : "en");
  const doors = today.doors
    .map(
      (d) =>
        `<h2 id="${d.id}">${esc(d.who)}: ${esc(d.question)}</h2>` +
        (d.lines.length ? `<table>${d.lines.map((l) => `<tr><td>${esc(l.k)}</td><td><b>${esc(l.v)}</b></td></tr>`).join("")}</table>` : `<p><small>${esc(today.missing)}</small></p>`) +
        `<p><small>${d.links.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join(" · ")}</small></p>`,
    )
    .join("");

  const markets = billMarkets.map((m) => {
    const latest = latestBills(loadBillMarket(m.slug).rows);
    const cell = (t: 91 | 182 | 364) => {
      const r = latest.get(t)?.latest;
      return r ? `${r.rate.toFixed(2)}` : "–";
    };
    const date = (latest.get(364) ?? latest.get(91) ?? latest.get(182))?.latest.date ?? "";
    return `<tr><td><a href="${m.href}">${esc(m.country)}</a></td><td>${cell(91)}</td><td>${cell(182)}</td><td>${cell(364)}</td><td>${date}</td></tr>`;
  });

  const fx = note.fx.moves.slice(0, 8).map((m) => `<tr><td>${esc(m.name)}</td><td>${m.now.toFixed(m.now >= 100 ? 1 : 3)}</td><td>${morningSigned(m.changePct)}%</td></tr>`).join("");
  const t = sw
    ? { title: "Afronomics (toleo jepesi)", morning: "Asubuhi", bills: "Hati za hazina, riba za hivi punde (%)", market: "Soko", date: "Tarehe", fx: "Dhidi ya dola, usiku kucha", due: "Minada inayotarajiwa", full: "Tovuti kamili", other: "In English" }
    : { title: "Afronomics (low-data)", morning: "The Morning", bills: "Treasury bills, latest rates (%)", market: "Market", date: "Date", fx: "Against the dollar, overnight", due: "Next auctions expected", full: "Full site", other: "Kwa Kiswahili" };

  const html = `<!doctype html><html lang="${sw ? "sw" : "en"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${t.title}</title>
<style>body{font:15px/1.45 system-ui,sans-serif;margin:12px;color:#121826;background:#fff;max-width:640px}table{border-collapse:collapse;width:100%;margin:6px 0 14px}td,th{text-align:left;padding:3px 6px 3px 0;border-bottom:1px solid #ddd;font-size:14px}th{font-weight:600}h1{font-size:18px;margin:0 0 4px}h2{font-size:15px;margin:16px 0 4px;color:#5b3fd6}a{color:#121826}small{color:#636b7d}</style></head><body>
<h1>${t.title}</h1><small>${esc(morningLongDate.format(new Date(note.day)))} · <a href="/lite?lang=${sw ? "en" : "sw"}">${t.other}</a> · <a href="/">${t.full}</a></small>
<h2>${esc(today.title)}</h2><small>${esc(today.note)}</small>${doors}
<h2>${t.morning}</h2>${lines.map((l) => `<p>${esc(l)}</p>`).join("") || "<p>–</p>"}
${index ? `<p><b>${indexShort}</b> ${index.latest.value.toFixed(2)}% (${index.bpsWeek == null ? "" : `${morningSigned(index.bpsWeek, 0)} bps w/w`}) <small><a href="/markets/bill-index">?</a></small></p>` : ""}
<h2>${t.bills}</h2><table><tr><th>${t.market}</th><th>91d</th><th>182d</th><th>364d</th><th>${t.date}</th></tr>${markets.join("")}</table>
${fx ? `<h2>${t.fx}</h2><table>${fx}</table>` : ""}
<h2>${t.due}</h2><table>${due.map((d) => `<tr><td>${esc(d.market.country)}</td><td>${d.expected}</td></tr>`).join("")}</table>
<small>Afronomics · afronomicsfeed.com · ${sw ? "Taarifa, si ushauri." : "Information, not advice."} <a href="/morning">Morning</a> · <a href="/markets/tbills">T-bills</a> · <a href="/rates/kenya">Kenya rates</a> · <a href="/subscribe">Email</a></small>
</body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
}
