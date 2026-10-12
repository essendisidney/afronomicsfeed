import { ShareRow } from "@/components/ui/ShareRow";
import { rangeLabel, type AuctionWeek } from "@/lib/data/auction-week";

/** The plain-language paragraph: template sentences filled from the numbers, nothing else. */
export function WeekSummary({ week, path }: { week: AuctionWeek; path: string }) {
  const [first, ...rest] = week.summary;
  return (
    <section aria-labelledby="aw-summary" className="rounded-xl border border-rule bg-surface px-4 py-5 sm:px-6">
      <h2 id="aw-summary" className="text-[13px] font-semibold text-gold">
        The week in brief · {rangeLabel(week.window.start, week.window.end)}
      </h2>
      <p className="mt-2 max-w-3xl text-[16px] leading-7 text-ink">
        <span className="font-semibold">{first}</span> {rest.join(" ")}
      </p>
      <p className="mt-3 text-[12px] leading-5 text-muted">
        Written from the numbers by fixed rules, not by a person or a model, and rebuilt from the data every hour. Information, not advice.
      </p>
      <ShareRow text={`African government debt auctions, ${rangeLabel(week.window.start, week.window.end)}: ${first}`} path={path} />
    </section>
  );
}
