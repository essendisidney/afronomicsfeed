import { benchmark, type Holding } from "@/lib/benchmark";
import { loadTbills } from "@/lib/data/kenya-tbills";
import { documentHtml, esc, exhibit, section, type DocMeta } from "@/lib/documents/design";

/**
 * The quarterly benchmark page (lib/benchmark.ts) in the house document design. The desk opens it as a draft to check
 * against the client's file (/desk/benchmark); once released, the client reads it through its private link.
 */

const kes = (n: number | null) => (n == null ? "—" : new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n));
const signedKes = (n: number | null) => (n == null ? "—" : `${n > 0 ? "+" : n < 0 ? "−" : "±"}${kes(Math.abs(n))}`);
const pct = (n: number | null) => (n == null ? "—" : `${n.toFixed(2)}%`);
const KIND: Record<string, string> = { tbill: "Treasury bill", bond: "Bond", deposit: "Deposit", fund: "Fund", other: "Other" };

export function benchmarkHtml(o: { name: string; quarter: string; holdings: Holding[]; draft?: boolean; sample?: boolean }): string | null {
  const b = benchmark(o.quarter, o.holdings, loadTbills().rows);
  if (!b) return null;
  const rows = b.lines
    .map(
      (l) =>
        `<tr><td>${esc(l.name)}<div class="muted small">${KIND[l.kind] ?? l.kind} · ${esc(l.start)} to ${esc(l.end)}</div></td><td class="num">${kes(l.amountKes)}</td><td class="num">${pct(l.ratePct)}</td><td class="num">${l.days}</td><td class="num">${kes(l.earnedKes)}</td><td class="num">${l.auctionRate == null ? "—" : `${pct(l.auctionRate)}<div class="muted small">${l.tenor}-day, ${esc(l.auctionDate ?? "")}</div>`}</td><td class="num">${kes(l.yardstickKes)}</td><td class="num ${l.differenceKes == null ? "" : l.differenceKes >= 0 ? "up" : "down"}"><strong>${signedKes(l.differenceKes)}</strong></td></tr>${l.note ? `<tr><td colspan="8" class="small muted">${esc(l.note)}</td></tr>` : ""}`,
    )
    .join("");
  const sources = [...new Set(b.lines.map((l) => l.auctionSource).filter((s): s is string => Boolean(s)))];
  const meta: DocMeta = {
    series: "Treasury benchmark",
    title: "The money beside the auctions",
    subtitle: `Each holding of ${o.name} in ${b.from} to ${b.to}, beside what the same shillings would have earned at the Central Bank of Kenya's Treasury bill auction of the nearest tenor, in the same weeks.`,
    number: `AF-BENCH-${o.sample ? "SAMPLE-" : ""}${o.quarter}${o.draft ? "-DRAFT" : ""}`,
    edition: o.quarter.replace("-", " "),
    asOf: b.to,
    preparedFor: o.sample ? undefined : o.name,
    sample: o.sample,
    sections: ["The quarter beside the auctions"],
    method: [
      "Days are those a holding was held inside the quarter, on a 365-day year. Earned is the amount times the holding's own annual rate, as the client reported it, before tax.",
      "The yardstick is the weighted average rate of the CBK Treasury bill auction of the nearest tenor (91, 182 or 364 days) whose value date is the latest on or before the holding's start, or the quarter's start if later. Holdings of more than 400 days are compared with the 364-day bill and marked.",
      "Both sides are before withholding tax, which is the same 15% on bills, deposits and fund returns for a resident institution. This page states what happened; it does not say what to hold.",
    ],
    sources: [
      { name: o.sample ? "Illustrative holdings" : "The institution", note: o.sample ? "made up for this sample; not any institution's portfolio" : `holdings for ${o.quarter}, as supplied` },
      ...sources.slice(0, 12).map((url) => ({ name: "Central Bank of Kenya", note: "Treasury bill auction result", url })),
    ],
    licence: o.sample
      ? "Sample: the holdings are illustrative, the auction results are real. Free to share with credit to Afronomics."
      : "Prepared for the named institution's board or trustees. Not for circulation outside it.",
    href: "/benchmarking",
  };
  const body = section(
    1,
    meta.sections[0],
    `<div class="kpis">
  <div class="kpi"><b>KES ${kes(b.earnedKes)}</b><span>Earned in the quarter, holdings compared</span></div>
  <div class="kpi"><b>KES ${kes(b.yardstickKes)}</b><span>The same shillings at the auctions</span></div>
  <div class="kpi"><b>${signedKes(b.differenceKes)}</b><span>Difference, KES</span></div>
  <div class="kpi"><b>${pct(b.earnedRatePct)} · ${pct(b.yardstickRatePct)}</b><span>Average rate earned · at the auctions</span></div>
</div>
${exhibit({
  title: "Each holding beside the auction of the nearest tenor",
  body: `<table><thead><tr><th>Holding</th><th class="num">KES</th><th class="num">Rate</th><th class="num">Days</th><th class="num">Earned</th><th class="num">Auction</th><th class="num">At auction</th><th class="num">Difference</th></tr></thead><tbody>${rows}</tbody></table>`,
  note: "Before tax on both sides. A positive difference means the holding earned more than the auction yardstick over the same days.",
  source: `${o.sample ? "Illustrative holdings" : "The institution's holdings"}; Central Bank of Kenya, Treasury bill auction results`,
  asOf: b.to,
  wide: true,
})}`,
    { aside: o.draft ? "Draft for the desk's check" : `${b.from} to ${b.to}` },
  );
  return documentHtml(meta, body);
}
