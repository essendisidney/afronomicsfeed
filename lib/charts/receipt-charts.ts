import { asOfLabel } from "@/components/evidence/EvidenceTag";
import type { ChartExport } from "@/lib/charts/export";
import { CHART_WIDTH, renderChartSvg } from "@/lib/charts/render";
import { receiptEvidence, type Receipt, type ReceiptChart } from "@/lib/receipts";
import { site } from "@/lib/site";

/**
 * A Receipt's charts as things a reader can take away: the anchor on the Receipt page (#chart-<n>, counted from 1),
 * the embed at /embed/chart/<slug>/<n> and the data the download buttons need. tests/site/test_charts.py checks every
 * published chart has its embed.
 */

export const chartAnchor = (n: number) => `chart-${n}`;
export const chartEmbedPath = (slug: string, n: number) => `/embed/chart/${slug}/${n}`;

const fmtDay = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** A rough iframe height for the embed snippet: title, unit, the chart at its widest, the source line. */
export function embedHeight(chart: ReceiptChart) {
  const { geometry } = renderChartSvg(chart, { label: chart.title });
  const chartAt = Math.round((geometry.height * 548) / CHART_WIDTH);
  return 24 + Math.ceil(chart.title.length / 48) * 26 + Math.ceil(chart.unit.length / 70) * 18 + 14 + chartAt + 64;
}

export function chartExport(r: Receipt, chart: ReceiptChart, n: number): ChartExport {
  const ev = receiptEvidence(r, chart.source);
  return {
    spec: { data: chart.data, unit: chart.unit, highlight: chart.highlight, reference: chart.reference, annotations: chart.annotations },
    title: chart.title,
    unit: chart.unit,
    source: chart.source,
    sourceUrl: ev?.href ?? "",
    asOf: ev ? asOfLabel(ev.asOf) : "",
    published: fmtDay.format(new Date(`${r.date}T00:00:00Z`)),
    pageUrl: `${site.url}/receipts/${r.slug}#${chartAnchor(n)}`,
    embedUrl: `${site.url}${chartEmbedPath(r.slug, n)}`,
    embedHeight: embedHeight(chart),
    fileName: `afronomics-${r.slug.replace(/^\d{4}-\d{2}-\d{2}-/, "")}-chart-${n}`,
  };
}
