import { dataTerms } from "@/lib/billing/ratecard";

/**
 * How to cite the Afronomics reference rates, and the terms for using them. Terms text only: no prices are set here
 * (prices live in lib/billing/ratecard.ts and change only with the founder's approval). The free, keyed and
 * redistribution lines reuse dataTerms so every page says the same thing; the benchmark-use and naming lines are
 * specific to an index (docs/rebuild/upgrade-U4-plan.md, decision C).
 */

export type ReferenceRateTerms = { title: string; points: string[] }[];

export function referenceRateTerms(shortName: string): ReferenceRateTerms {
  return [
    {
      title: "Free, with the credit",
      points: [
        `Quoting, charting and republishing published ${shortName} values in news, research and teaching, with the credit “Source: Afronomics, ${shortName}” and a link to the index page.`,
        dataTerms.free.points[2],
      ],
    },
    {
      title: "Needs a key or a licence",
      points: [
        dataTerms.keyed.points[1],
        `Using ${shortName} as a benchmark: naming it in a loan, bond, swap or other contract to set or settle a payment, measuring a fund’s performance against it, or building a product whose value follows it. Benchmark use is only by a separate written licence agreed with Afronomics.`,
        dataTerms.enterprise.points[0],
      ],
    },
    {
      title: "Always",
      points: [
        `A re-weighted, smoothed or otherwise changed number is not ${shortName}: call it “based on the Afronomics ${shortName}” and say what was changed.`,
        "Cite the method version and the reading date. Published readings are kept as published; later revisions are logged, never applied silently.",
        "Provided as published, without warranty. Information, not advice.",
      ],
    },
  ];
}

const longDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function citeLines({ name, shortName, version, readingDate, url, detail }: { name: string; shortName: string; version: string; readingDate: string; url: string; detail?: string }) {
  const d = longDate.format(new Date(readingDate));
  return {
    short: `Source: Afronomics, ${shortName}${detail ? ` (${detail})` : ""}, ${d}. ${url}`,
    full: `Afronomics (${readingDate.slice(0, 4)}). ${name} (${shortName})${detail ? `, ${detail}` : ""}, reading of ${d}. Method version ${version}. ${url}`,
  };
}
