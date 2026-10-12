import { billMarkets } from "@/lib/data/sovereign-bills";
import { bondMarkets } from "@/lib/data/sovereign-bonds";
import { site } from "@/lib/site";
import { billSpan, bondSpan } from "./freshness";

/**
 * The datasets and open API section of /llms.txt, built from the market lists and data files so the coverage dates and
 * URLs are always the ones the site serves. Facts about the API mirror /developers and /data-api.
 */
export function llmsDatasetLines(): string[] {
  const u = (p: string) => `${site.url}${p}`;
  const lines = [
    "## Datasets",
    "",
    `Every figure is compiled from the publisher's own auction notice and carries that source. Free to reuse with the credit "Source: ${site.name}" and a link (terms: ${u("/developers#terms")}); commercial use and redistribution need a licence (${u("/licensing")}).`,
    "",
    `- [African local-currency government debt, auction by auction](${u("/data/frontier-local-debt")}): every Treasury bill and bond market below in one place, for frontier-market investors.`,
    "",
    "### Treasury bill auction results (91, 182 and 364 days)",
    "",
  ];
  for (const m of billMarkets) {
    const { first, last } = billSpan(m.slug);
    if (!first) continue;
    const page = m.slug === "kenya" ? "/markets/kenya-tbills" : `/markets/tbills/${m.slug}`;
    lines.push(
      `- [${m.country}](${u(page)}): ${m.publisher}, ${m.rateNote}; ${first.slice(0, 4)} to ${last}. CSV ${u(`/api/data/tbills/${m.slug}`)} · JSON ${u(`/api/v1/tbills/${m.slug}`)}`,
    );
  }
  lines.push("", "### Government bond auction results", "");
  for (const m of bondMarkets) {
    const { first, last } = bondSpan(m.slug);
    if (!first) continue;
    lines.push(`- [${m.country}](${u(`/markets/bonds/${m.slug}`)}): ${m.publisher}; ${first.slice(0, 4)} to ${last}. CSV ${u(`/api/data/bonds/${m.slug}`)} · JSON ${u(`/api/v1/bonds/${m.slug}`)}`);
  }
  lines.push(
    "",
    "## Open data API",
    "",
    `No key and no sign-up; JSON, CORS open, cached for five minutes. Every response carries an attribution line: show it wherever the numbers appear. Documentation: ${u("/developers")}. Keyed, uncached access for production use: ${u("/data-api")}.`,
    "",
    `- GET ${u("/api/v1/tbills")}: every market's latest 91-, 182- and 364-day result, the source document and where the history starts.`,
    `- GET ${u("/api/v1/tbills/{market}")}: one market's auction history. Optional tenor=91|182|364, from and to (YYYY-MM-DD), limit (default 500, up to 5,000). Newest first.`,
    `- GET ${u("/api/v1/bonds")}: each government bond market with data, where its history starts and its latest auction.`,
    `- GET ${u("/api/v1/bonds/{market}")}: one market's bond auction history (ISIN, tenor, amounts, bid-to-cover, rate, coupon, source). Optional isin, issue (WAEMU country), from, to, limit.`,
    `- GET ${u("/api/v1/index")}: the African Sovereign Bill Index, latest weekly reading and full series.`,
    `- GET ${u("/api/v1/measures")}: real one-year bill yields, bids-to-offer demand over 90 days and each market's expected next result.`,
    "",
    `Treasury bill markets: ${billMarkets.map((m) => m.slug).join(", ")}. Bond markets: ${bondMarkets.map((m) => m.slug).join(", ")}. Rates are percent per annum as each publisher reports them; amounts are local currency, millions.`,
    "",
  );
  return lines;
}
