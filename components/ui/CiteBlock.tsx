import Link from "next/link";
import { FullHistoryLink } from "@/components/data/FullHistoryLink";
import { CopyCitation } from "@/components/ui/CopyCitation";
import { isGatedCsv, xlsxHref } from "@/lib/downloads-core";
import { renderTime } from "@/lib/data/fetcher";
import { site } from "@/lib/site";

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/**
 * How to cite and reuse an Afronomics dataset. Every citation and republished chart links back here,
 * which is how the datasets become the reference others point to.
 */
export function CiteBlock({ title, path, publisher, csv }: { title: string; path: string; publisher?: string; csv?: string }) {
  const now = new Date(renderTime());
  const url = `${site.url}${path}`;
  const citation = `Afronomics (${now.getUTCFullYear()}). ${title}${publisher ? `, compiled from ${publisher}` : ""}. Retrieved ${dateFmt.format(now)}, from ${url}`;
  return (
    <section className="mt-14 rounded-2xl border border-rule bg-surface px-5 py-5 sm:px-6">
      <h2 className="font-serif text-2xl text-ink">Cite or reuse this data</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft">
        Free to quote, chart and republish with the credit “Source: Afronomics{publisher ? `, compiled from ${publisher}` : ""}” and a link to this page.
      </p>
      {/* The citation ends in the page's full URL, one unbreakable token that is wider than a phone screen on long
          slugs (/markets/tbills/mozambique); let it wrap mid-URL instead of widening the page. */}
      <p className="mt-3 max-w-3xl break-words rounded-xl bg-paper-2 px-4 py-3 text-[13px] leading-6 text-ink">{citation}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <CopyCitation text={citation} />
        {csv ? (
          <a href={csv} download className="inline-flex min-h-11 items-center rounded-full border border-rule px-3 py-1.5 text-[13px] sm:min-h-0 font-medium text-ink-soft hover:border-gold">
            Download CSV
          </a>
        ) : null}
        {csv ? (
          <a href={xlsxHref(csv)} download className="inline-flex min-h-11 items-center rounded-full border border-rule px-3 py-1.5 text-[13px] sm:min-h-0 font-medium text-ink-soft hover:border-gold">
            Excel workbook
          </a>
        ) : null}
        {csv && isGatedCsv(csv) ? (
          <FullHistoryLink
            csv={csv}
            className="inline-flex min-h-11 items-center rounded-full border border-rule px-3 py-1.5 text-[13px] sm:min-h-0 font-medium text-ink-soft hover:border-gold"
          />
        ) : null}
        <Link href="/widgets" className="inline-flex min-h-11 items-center rounded-full border border-rule px-3 py-1.5 text-[13px] sm:min-h-0 font-medium text-ink-soft hover:border-gold">
          Embed a live widget
        </Link>
        <Link href="/developers" className="inline-flex min-h-11 items-center rounded-full border border-rule px-3 py-1.5 text-[13px] sm:min-h-0 font-medium text-ink-soft hover:border-gold">
          Use the data API
        </Link>
        <Link href="/reference" className="inline-flex min-h-11 items-center rounded-full border border-rule px-3 py-1.5 text-[13px] sm:min-h-0 font-medium text-ink-soft hover:border-gold">
          Definitions, timeliness and corrections
        </Link>
      </div>
    </section>
  );
}
