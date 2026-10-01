import { billIndexLatest, indexName, indexShort } from "@/lib/data/bill-index";
import { bpsNote, cardSize, pct, renderCard } from "@/lib/og-card";

export const alt = "Afronomics African Sovereign Bill Index";
export const size = cardSize;
export const contentType = "image/png";
export const revalidate = 3600;

const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default async function Image() {
  const idx = billIndexLatest(364);
  if (!idx) return renderCard({ kicker: indexName, title: "What African governments pay to borrow, in one number", source: "Afronomics" });
  const last52 = idx.series.slice(-104);
  return renderCard({
    kicker: `${indexName} · ${shortDate.format(new Date(idx.latest.date))}`,
    title: `African governments pay ${idx.latest.value.toFixed(2)}% to borrow for a year`,
    stats: [
      { label: `${indexShort} 364-day`, value: pct(idx.latest.value), ...bpsNote(idx.weekAgo?.value, idx.latest.value) },
      { label: "A month ago", value: pct(idx.monthAgo?.value) },
      { label: "A year ago", value: pct(idx.yearAgo?.value) },
    ],
    line: { values: last52.map((p) => p.value), caption: `Weekly readings, last two years · ten African central banks` },
    source: "Afronomics",
  });
}
